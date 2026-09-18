#!/usr/bin/env python3
"""Generate the OWL + SHACL artifacts published to SocialCareData/ontology.

The LinkML YAML under ``src/_data/model/`` is the authoritative source for the
Social Care MAIS standards; everything this script writes is derived from it and
must never be hand-edited.

Run it with::

    python src/assets/scripts/build_ontology.py --out build/ontology

which produces a tree mirroring ``src/_data/model`` but carrying ``.ttl``
ontologies and ``-shape.ttl`` SHACL shapes in place of the YAML.

Three things here are load-bearing and easy to break:

* **The generators are driven through their CLIs, not their Python APIs.** The
  ``OwlSchemaGenerator`` dataclass defaults differ from the ``gen-owl`` defaults
  (``metaclasses`` and ``type_objects`` are ``True`` in the class and ``False``
  on the command line), so calling the API would silently produce different
  artifacts from the commands in ``model-management.md`` that the modelling team
  runs by hand. Paying ~20s of process spawning keeps the two identical.

* **LinkML output is not byte-reproducible.** Two identical invocations emit
  isomorphic but differently-ordered Turtle, because rdflib's blank-node
  labelling varies per process (``PYTHONHASHSEED`` does not affect it). Publishing
  that directly would open a large, meaningless pull request on every run, so
  every file is canonicalised before it is written. See :func:`canonicalise`.

* **Import maps resolve relative to the importing schema, not to the map.** That
  is why every value is ``../<module>/<stem>`` and why the modules must stay
  exactly one directory below ``src/_data/model``.
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

import yaml
from rdflib import Graph
from rdflib.compare import to_canonical_graph

# src/assets/scripts/build_ontology.py -> repo root is four levels up.
REPO_ROOT = Path(__file__).resolve().parents[3]
MODEL_ROOT = REPO_ROOT / "src" / "_data" / "model"
ASSETS_MODEL_ROOT = REPO_ROOT / "src" / "assets" / "model"
IMPORTS_JSON = MODEL_ROOT / "imports.json"
MANIFEST = MODEL_ROOT / "mais" / "manifest.yml"

# Flags copied verbatim from src/_data/model/model-management.md, plus
# --ontology-uri-suffix. Without that flag LinkML appends its default
# ".owl.ttl", so a schema declaring id https://ontology.socialcaredata.io/mais
# publishes itself as https://ontology.socialcaredata.io/mais.owl.ttl and is not
# dereferenceable at its own IRI. The artifacts checked in under
# src/assets/model/ predate this and still carry the bug.
OWL_FLAGS = [
    "--consolidate-cardinality-axioms",
    "--skip-vacuous-min-zero-cardinality-axioms",
    "--skip-vacuous-local-range-axioms",
]
SHACL_FLAGS = ["--non-closed", "--suffix", "Shape"]

# person-standard.yaml is the shared core: its Person is deliberately permissive
# so the two profiles can tighten it. src/_data/model/person/README.md is
# explicit that shapes must only ever be generated from a profile, so publishing
# a person-standard-shape.ttl would ship a shape the modellers forbid. The OWL
# is still generated - it is the vocabulary the profiles build on.
SHACL_SKIP = {"person/person-standard.yaml"}

# mais.yaml is built separately: merged (--mergeimports) and against the
# manifest-resolved import map. Generating it in the per-module loop as well
# would write the same path twice, the second time with a stub containing
# nothing but owl:imports.
UMBRELLA = "mais/mais.yaml"


class BuildError(RuntimeError):
    """A failure that must stop the build rather than publish a bad artifact."""


@dataclass(frozen=True)
class Schema:
    """One LinkML schema file on disk."""

    path: Path
    module: str  # directory name, e.g. "placements"
    stem: str  # file stem, e.g. "placements-standard-v1"
    id: str  # the `id:` IRI
    name: str  # the `name:` field, which manifest keys match
    version: str

    @property
    def rel(self) -> str:
        return f"{self.module}/{self.path.name}"

    @property
    def importmap_value(self) -> str:
        """Path as an import map value: relative to the *importing* schema."""
        return f"../{self.module}/{self.stem}"


def run(cmd: list[str], cwd: Path, dest: Path) -> None:
    """Run a generator, writing stdout to ``dest``.

    The generators write the artifact to stdout and their (routine) deprecation
    warnings to stderr, so stderr is only surfaced when the command actually
    fails. A non-zero exit or an empty result aborts the build: shell-style
    redirection would otherwise leave a truncated or zero-byte .ttl that looks
    like a legitimate artifact.
    """
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise BuildError(
            f"{cmd[0]} failed for {dest.name} (exit {proc.returncode})\n"
            f"  command: {' '.join(cmd)}\n"
            f"  cwd:     {cwd}\n{proc.stderr}"
        )
    if not proc.stdout.strip():
        raise BuildError(f"{cmd[0]} produced no output for {dest.name}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(proc.stdout)


def canonicalise(path: Path) -> None:
    """Rewrite ``path`` so identical input always yields identical bytes.

    LinkML emits isomorphic-but-reordered Turtle across runs. Relabelling the
    blank nodes canonically (RDFC-1.0) and re-serialising makes the output
    stable, while keeping the readable nested ``[ a owl:Restriction ; ... ]``
    form that makes these files reviewable. Prefixes are rebound from the
    original graph because the canonical graph does not carry them.
    """
    graph = Graph()
    graph.parse(path, format="turtle")
    canonical = to_canonical_graph(graph)

    out = Graph()
    for triple in canonical:
        out.add(triple)
    for prefix, namespace in graph.namespaces():
        out.bind(prefix, namespace)
    out.serialize(destination=path, format="turtle")


def load_schemas() -> list[Schema]:
    """Index every LinkML schema under the model root."""
    schemas: list[Schema] = []
    for path in sorted(MODEL_ROOT.glob("*/*.yaml")):
        doc = yaml.safe_load(path.read_text())
        if not isinstance(doc, dict) or "id" not in doc:
            continue  # not a LinkML schema
        missing = [k for k in ("id", "name", "version") if k not in doc]
        if missing:
            raise BuildError(f"{path} is missing required field(s): {', '.join(missing)}")
        schemas.append(
            Schema(
                path=path,
                module=path.parent.name,
                stem=path.stem,
                id=doc["id"],
                name=doc["name"],
                version=str(doc["version"]),
            )
        )
    if not schemas:
        raise BuildError(f"no LinkML schemas found under {MODEL_ROOT}")

    # Every module must sit exactly one level below the model root, or the
    # ../<module>/<stem> import map convention silently stops resolving.
    for schema in schemas:
        if schema.path.parent.parent != MODEL_ROOT:
            raise BuildError(
                f"{schema.path} is nested too deeply; modules must be direct "
                f"children of {MODEL_ROOT}"
            )
    return schemas


def resolve_pins(schemas: list[Schema], manifest: dict) -> dict[str, Schema]:
    """Resolve each manifest version pin to exactly one schema file.

    A MAIS release is defined by the module versions recorded in manifest.yml,
    so a pin that cannot be resolved to precisely one file means the release
    does not describe a buildable ontology. That is always fatal - falling back
    to "whatever imports.json points at" would publish a release whose contents
    contradict its own manifest.
    """
    namespace = manifest["namespace"]
    pins: dict[str, str] = {}
    pins.update(manifest.get("modules") or {})
    pins.update(manifest.get("profiles") or {})

    resolved: dict[str, Schema] = {}
    for key, version in pins.items():
        version = str(version)
        expected_id = f"{namespace}{key}"
        matches = [s for s in schemas if s.id == expected_id and s.version == version]
        if not matches:
            near = [s for s in schemas if s.id == expected_id]
            detail = (
                "available versions: " + ", ".join(sorted(s.version for s in near))
                if near
                else f"no schema declares id {expected_id}"
            )
            raise BuildError(
                f"manifest pins {key} at {version}, but no schema matches ({detail})"
            )
        if len(matches) > 1:
            paths = ", ".join(str(m.path.relative_to(REPO_ROOT)) for m in matches)
            raise BuildError(
                f"manifest pin {key}=={version} is ambiguous; matched: {paths}"
            )
        resolved[key] = matches[0]

    umbrella = next((s for s in schemas if s.rel == UMBRELLA), None)
    if umbrella is None:
        raise BuildError(f"{UMBRELLA} not found")
    if umbrella.version != str(manifest["mais_version"]):
        raise BuildError(
            f"mais.yaml declares version {umbrella.version} but manifest.yml "
            f"pins mais_version {manifest['mais_version']}"
        )
    return resolved


def resolved_importmap(resolved: dict[str, Schema]) -> dict[str, str]:
    """The repo import map, overridden by the manifest-pinned files.

    Overriding rather than rebuilding matters: imports.json may carry entries
    the manifest does not pin (or that are only needed transitively), and
    dropping those would break the merged build in a way that is tedious to
    diagnose.
    """
    importmap = json.loads(IMPORTS_JSON.read_text())
    for schema in resolved.values():
        importmap[schema.id] = schema.importmap_value
    return importmap


def ontology_uri_suffixes(schemas: list[Schema]) -> dict[str, str]:
    """Decide the ``--ontology-uri-suffix`` for each schema file.

    Several placements files share ``id: .../placements`` and differ only by
    version, so published side by side they would each assert ``a owl:Ontology``
    on the same IRI with contradictory axioms on ``sc:Placement``. The file that
    imports.json points at keeps the bare IRI and is the current version; the
    frozen ones are qualified with their version (``.../placements/1.0.0``) so
    every published file has a distinct ontology identity.
    """
    importmap = json.loads(IMPORTS_JSON.read_text())
    current = {value.rsplit("/", 1)[-1] for value in importmap.values()}

    by_id: dict[str, list[Schema]] = {}
    for schema in schemas:
        by_id.setdefault(schema.id, []).append(schema)

    suffixes: dict[str, str] = {}
    for schema_id, group in by_id.items():
        if len(group) == 1:
            suffixes[group[0].rel] = ""
            continue
        canonical = [s for s in group if s.stem in current]
        if len(canonical) != 1:
            names = ", ".join(sorted(s.stem for s in group))
            raise BuildError(
                f"{len(group)} schemas share id {schema_id} ({names}) but "
                f"{len(canonical)} of them are referenced by imports.json; "
                "exactly one must be, to identify the current version"
            )
        for schema in group:
            suffixes[schema.rel] = "" if schema is canonical[0] else f"/{schema.version}"
    return suffixes


def assert_unique_ontology_iris(out_dir: Path) -> None:
    """No two published files may claim the same owl:Ontology IRI.

    Two files asserting the same ontology identity merge into one
    self-contradictory graph in any reasoner or triplestore that loads the repo
    wholesale, which is exactly the failure this repo exists to avoid.
    """
    from rdflib.namespace import OWL, RDF

    seen: dict[str, str] = {}
    for path in sorted(out_dir.rglob("*.ttl")):
        if path.name.endswith("-shape.ttl"):
            continue  # shapes declare no ontology node
        graph = Graph()
        graph.parse(path, format="turtle")
        for subject in graph.subjects(RDF.type, OWL.Ontology):
            iri = str(subject)
            rel = str(path.relative_to(out_dir))
            if iri in seen:
                raise BuildError(
                    f"{rel} and {seen[iri]} both declare ontology IRI {iri}"
                )
            seen[iri] = rel


def copy_aux(schemas: list[Schema], out_dir: Path) -> None:
    """Copy the non-generated files consumers need alongside the ontologies."""
    modules = sorted({s.module for s in schemas})
    for module in modules:
        for name in ("context.jsonld", "README.md"):
            src = MODEL_ROOT / module / name
            if src.exists():  # common/ and mais/ have no README
                shutil.copy2(src, out_dir / module / name)
    shutil.copy2(MANIFEST, out_dir / "mais" / "manifest.yml")
    # The per-module READMEs link to ../model-management.md, so it has to come
    # along or every one of those links 404s in the published repo. Being
    # overwritten on each run, this copy cannot drift from the original.
    shutil.copy2(MODEL_ROOT / "model-management.md", out_dir / "model-management.md")


def build(out_dir: Path) -> list[Schema]:
    manifest = yaml.safe_load(MANIFEST.read_text())
    schemas = load_schemas()
    resolved = resolve_pins(schemas, manifest)
    suffixes = ontology_uri_suffixes(schemas)

    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)

    generated: list[Path] = []

    for schema in schemas:
        if schema.rel == UMBRELLA:
            continue
        module_dir = MODEL_ROOT / schema.module
        target_dir = out_dir / schema.module

        owl_dest = target_dir / f"{schema.stem}.ttl"
        run(
            [
                "gen-owl",
                "--no-mergeimports",
                "--ontology-uri-suffix",
                suffixes[schema.rel],
                *OWL_FLAGS,
                "-im",
                "../imports.json",
                schema.path.name,
            ],
            cwd=module_dir,
            dest=owl_dest,
        )
        generated.append(owl_dest)

        if schema.rel in SHACL_SKIP:
            print(f"  {schema.rel}: OWL only (core schema, see person/README.md)")
            continue

        shacl_dest = target_dir / f"{schema.stem}-shape.ttl"
        run(
            ["gen-shacl", *SHACL_FLAGS, "-im", "../imports.json", schema.path.name],
            cwd=module_dir,
            dest=shacl_dest,
        )
        generated.append(shacl_dest)
        print(f"  {schema.rel}: OWL + SHACL")

    # The umbrella, merged and resolved through the manifest-pinned import map.
    # The map is written outside src/ deliberately: Jekyll's source is src/, and
    # it parses every JSON file under src/_data/ into site.data, so a generated
    # file there would pollute the site build.
    with tempfile.TemporaryDirectory() as tmp:
        importmap_path = Path(tmp) / "resolved-imports.json"
        importmap_path.write_text(json.dumps(resolved_importmap(resolved), indent=2))
        mais_dir = MODEL_ROOT / "mais"

        mais_ttl = out_dir / "mais" / "mais.ttl"
        run(
            [
                "gen-owl",
                "--mergeimports",
                "--ontology-uri-suffix",
                "",
                *OWL_FLAGS,
                "-im",
                str(importmap_path),
                "mais.yaml",
            ],
            cwd=mais_dir,
            dest=mais_ttl,
        )
        mais_shape = out_dir / "mais" / "mais-shape.ttl"
        run(
            ["gen-shacl", *SHACL_FLAGS, "-im", str(importmap_path), "mais.yaml"],
            cwd=mais_dir,
            dest=mais_shape,
        )
        generated.extend([mais_ttl, mais_shape])
        print("  mais/mais.yaml: merged OWL + SHACL")

    print(f"canonicalising {len(generated)} files")
    for path in generated:
        canonicalise(path)

    assert_unique_ontology_iris(out_dir)
    copy_aux(schemas, out_dir)
    return schemas


def build_validation_tree(out_dir: Path, validation_dir: Path) -> None:
    """Assemble the tree ``src/assets/shacl/validation/validate.js`` expects.

    That validator reads shapes, contexts and examples from one root. The
    examples and the hand-maintained ``*-rules-shape.ttl`` files (which
    gen-shacl cannot produce, because it ignores LinkML ``rules:``) live in
    src/assets/model, so they are overlaid on top of the freshly generated
    shapes. The rules shapes are needed to validate but are not published: they
    are inputs to this repo's own gate, not release artifacts.
    """
    if validation_dir.exists():
        shutil.rmtree(validation_dir)
    shutil.copytree(out_dir, validation_dir)

    for module_dir in sorted(ASSETS_MODEL_ROOT.iterdir()):
        if not module_dir.is_dir():
            continue
        target = validation_dir / module_dir.name
        target.mkdir(parents=True, exist_ok=True)
        examples = module_dir / "examples"
        if examples.is_dir():
            shutil.copytree(examples, target / "examples", dirs_exist_ok=True)
        for rules in module_dir.glob("*-rules-shape.ttl"):
            shutil.copy2(rules, target / rules.name)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        type=Path,
        required=True,
        help="directory to write the publishable ontology tree into",
    )
    parser.add_argument(
        "--validation-out",
        type=Path,
        help="also assemble a tree for validate.js (shapes + contexts + examples)",
    )
    args = parser.parse_args()

    try:
        print(f"generating from {MODEL_ROOT.relative_to(REPO_ROOT)}")
        build(args.out.resolve())
        if args.validation_out:
            build_validation_tree(args.out.resolve(), args.validation_out.resolve())
            print(f"validation tree -> {args.validation_out}")
    except BuildError as exc:
        print(f"\nerror: {exc}", file=sys.stderr)
        return 1
    print(f"ontology tree -> {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
