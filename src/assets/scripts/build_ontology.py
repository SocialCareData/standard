#!/usr/bin/env python3
"""Generate the OWL + SHACL artifacts published to SocialCareData/ontology.

The LinkML YAML under ``src/_data/model/`` is the authoritative source for the
Social Care MAIS standards; everything this script writes is derived from it and
must never be hand-edited.

Run it with::

    python src/assets/scripts/build_ontology.py --out build/ontology

which produces a tree mirroring ``src/_data/model`` but carrying ``.ttl``
ontologies and ``-shape.ttl`` SHACL shapes in place of the YAML.

Only the schema versions pinned in ``manifest.yaml`` are published, and each is
published under its unversioned name: if the manifest pins ``placements: 1.0.0``
and that version lives in ``placements-standard-v1.yaml``, it is written as
``placements/placements-standard.ttl`` (and ``placements-standard-shape.ttl``).
Unpinned versions are not published at all.

Here are things to keep in mind:

* **LinkML output is not byte-reproducible.** Two identical invocations emit
  isomorphic but differently-ordered Turtle, because rdflib's blank-node
  labelling varies per process (``PYTHONHASHSEED`` does not affect it). Publishing
  that directly would open a large, meaningless pull request on every run, so
  every file is canonicalised before it is written. See :func:`canonicalise`.

* **Import maps resolve relative to the importing schema, not to the map.** That
  is why every value is ``../<module>/<stem>`` and why the modules must stay
  exactly one directory below ``src/_data/model``. The umbrella schema sits at
  the model root, so it is built against an absolute copy of the map.

* **social-care.ttl is not merged.** It ``owl:imports`` the raw ``main``-branch
  file of each module at the version pinned in ``manifest.yaml``, and describes
  that manifest in RDF (see :func:`describe_release`), so the standard versions
  a release is made of can be read from the ontology alone.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

import yaml
from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.compare import to_canonical_graph
from rdflib.namespace import DCTERMS, OWL, RDF

# src/assets/scripts/build_ontology.py -> repo root is four levels up.
REPO_ROOT = Path(__file__).resolve().parents[3]
MODEL_ROOT = REPO_ROOT / "src" / "_data" / "model"
ASSETS_MODEL_ROOT = REPO_ROOT / "src" / "assets" / "model"
IMPORTS_JSON = MODEL_ROOT / "imports.json"
MANIFEST = MODEL_ROOT / "manifest.yaml"
UMBRELLA = MODEL_ROOT / "social-care.yaml"
CONTEXT = MODEL_ROOT / "context.jsonld"
# Annotation namespaces that describe the CSV representation of a model (see
# build_csvw.py). gen-owl and gen-shacl --include-annotations copy every slot
# annotation into their output; these belong in csv-metadata.json only, so
# canonicalise() drops them from the published ontologies and shapes.
CSV_MAPPING_NAMESPACES = (
    "http://www.w3.org/ns/csvw#",
    "https://theodi.github.io/data-standard-validator/ns#",
)
# Where the module ontologies are served from once synced to SocialCareData/ontology.
PUBLISHED_BASE = "https://raw.githubusercontent.com/SocialCareData/ontology/main/"
# Used to record the pinned standard versions in social-care.ttl. LinkML
# already writes each schema's `version` as pav:version, so the versions the
# release records line up with the ones each module states about itself.
PAV = Namespace("http://purl.org/pav/")
# A trailing version marker on a schema file stem, e.g. "-v1" or "-v1_1" in
# placements-standard-v1_1.yaml. It is dropped from the published file name, so
# whichever version the manifest pins is always served at the same URL.
VERSION_SUFFIX = re.compile(r"-v\d+(?:[._]\d+)*$")

# Flags copied verbatim from src/_data/model/model-management.md, plus
# --ontology-uri-suffix. Without that flag LinkML appends its default
# ".owl.ttl", so a schema declaring id https://ns.socialcaredata.io/mais
# publishes itself as https://ns.socialcaredata.io/mais.owl.ttl and is not
# dereferenceable at its own IRI. The artifacts checked in under
# src/assets/model/ predate this and still carry the bug.
OWL_FLAGS = [
    "--consolidate-cardinality-axioms",
    "--skip-vacuous-min-zero-cardinality-axioms",
    "--skip-vacuous-local-range-axioms",
]
# --include-annotations turns a slot's `annotations: {sh:message: ...}` into an
# sh:message on its property shape, which the validator shows when the slot's
# sh:pattern fails. See "Pattern messages" in model-management.md.
SHACL_FLAGS = ["--non-closed", "--suffix", "Shape", "--include-annotations"]

# person-standard.yaml is the shared core: its Person is deliberately permissive
# so the two profiles can tighten it. src/_data/model/person/README.md is
# explicit that shapes must only ever be generated from a profile, so publishing
# a person-standard-shape.ttl would ship a shape the modellers forbid. The OWL
# is still generated - it is the vocabulary the profiles build on.
SHACL_SKIP = {"person/person-standard.yaml"}


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

    @property
    def published_stem(self) -> str:
        """File stem in the published repo: the source stem minus any version marker."""
        return VERSION_SUFFIX.sub("", self.stem)

    @property
    def published_rel(self) -> str:
        return f"{self.module}/{self.published_stem}"

    @property
    def published_url(self) -> str:
        return f"{PUBLISHED_BASE}{self.published_rel}.ttl"


def run(cmd: list[str], cwd: Path, dest: Path) -> None:
    """Run a generator, writing stdout to ``dest``.

    The generators write the artifact to stdout and their (routine) deprecation
    warnings to stderr, so stderr is only surfaced when the command actually
    fails. A non-zero exit or an empty result aborts the build: shell-style
    redirection would otherwise leave a truncated or zero-byte .ttl that looks
    like a legitimate artifact.
    """
    env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", env=env)
    if proc.returncode != 0:
        raise BuildError(
            f"{cmd[0]} failed for {dest.name} (exit {proc.returncode})\n"
            f"  command: {' '.join(cmd)}\n"
            f"  cwd:     {cwd}\n{proc.stderr}"
        )
    if not proc.stdout.strip():
        raise BuildError(f"{cmd[0]} produced no output for {dest.name}")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(proc.stdout, encoding="utf-8")


def canonicalise(path: Path) -> None:
    """Rewrite ``path`` so identical input always yields identical bytes.

    LinkML emits isomorphic-but-reordered Turtle across runs. Relabelling the
    blank nodes canonically (RDFC-1.0) and re-serialising makes the output
    stable, while keeping the readable nested ``[ a owl:Restriction ; ... ]``
    form that makes these files reviewable. Prefixes are rebound from the
    original graph because the canonical graph does not carry them.

    The CSV mapping annotations are dropped here too: they only feed
    csv-metadata.json and say nothing about the ontology or its constraints.
    """
    graph = Graph()
    graph.parse(path, format="turtle")
    for triple in [t for t in graph if str(t[1]).startswith(CSV_MAPPING_NAMESPACES)]:
        graph.remove(triple)
    canonical = to_canonical_graph(graph)

    out = Graph()
    for triple in canonical:
        out.add(triple)
    for prefix, namespace in graph.namespaces():
        if str(namespace) not in CSV_MAPPING_NAMESPACES:
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

    A social-care MAIS release is defined by the module versions recorded in manifest.yaml,
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

    return resolved


def versioned_umbrella(manifest: dict, dest_dir: Path) -> Path:
    """Write social-care.yaml into ``dest_dir`` with the manifest's ``ontology_version``.

    The release version is recorded once, in manifest.yaml. The umbrella
    deliberately declares no version of its own, so the two cannot disagree;
    one written there anyway is refused rather than silently overridden.
    """
    if not UMBRELLA.exists():
        raise BuildError(f"{UMBRELLA} not found")
    doc = yaml.safe_load(UMBRELLA.read_text())
    if "version" in doc:
        raise BuildError(
            "social-care.yaml declares a version; remove it, the release version "
            "is ontology_version in manifest.yaml"
        )
    doc["version"] = str(manifest["ontology_version"])
    dest = dest_dir / UMBRELLA.name
    dest.write_text(yaml.safe_dump(doc, sort_keys=False, allow_unicode=True))
    return dest


def resolved_importmap(resolved: dict[str, Schema]) -> dict[str, str]:
    """The repo import map, overridden by the manifest-pinned files, as absolute paths.

    Overriding rather than rebuilding matters: imports.json may carry entries
    the manifest does not pin (or that are only needed transitively), and
    dropping those would break the umbrella build in a way that is tedious to
    diagnose. Absolute paths let the root-level umbrella use a map whose values
    are written relative to a module directory.
    """
    importmap = json.loads(IMPORTS_JSON.read_text())
    for schema in resolved.values():
        importmap[schema.id] = schema.importmap_value
    return {k: str((MODEL_ROOT / "_" / v).resolve()) for k, v in importmap.items()}


def point_imports_at_published(path: Path, resolved: dict[str, Schema]) -> None:
    """Replace each owl:imports module IRI with its pinned, published file URL."""
    by_id = {s.id: s for s in resolved.values()}
    graph = Graph()
    graph.parse(path, format="turtle")
    for ontology, _, target in list(graph.triples((None, OWL.imports, None))):
        schema = by_id.get(str(target))
        if schema is None:
            raise BuildError(f"social-care.yaml imports {target}, which manifest.yaml does not pin")
        graph.remove((ontology, OWL.imports, target))
        graph.add((ontology, OWL.imports, URIRef(schema.published_url)))
    graph.serialize(destination=path, format="turtle")


def describe_release(path: Path, resolved: dict[str, Schema]) -> None:
    """Record the manifest.yaml pins in social-care.ttl, so the release says what it is made of.

    The release version is already there as ``pav:version`` (from the
    ``ontology_version`` written into the umbrella). This adds each pinned
    module and profile as a ``dcterms:hasPart`` of the release, with the
    version pinned::

        sc: dcterms:hasPart sc:placements, ... .
        sc:placements pav:version "2.0.0" .

    pav:version agrees with the triple each module file asserts about itself,
    so loading the release with its imports adds no conflicting statement.
    """
    graph = Graph()
    graph.parse(path, format="turtle")
    releases = list(graph.subjects(RDF.type, OWL.Ontology))
    if len(releases) != 1:
        raise BuildError(f"{path.name} declares {len(releases)} ontologies; expected exactly 1")
    release = releases[0]
    graph.bind("pav", PAV)
    for schema in resolved.values():
        part = URIRef(schema.id)
        graph.add((release, DCTERMS.hasPart, part))
        graph.add((part, PAV.version, Literal(schema.version)))
    graph.serialize(destination=path, format="turtle")


def assert_unique_published_names(resolved: dict[str, Schema]) -> None:
    """No two pinned schemas may publish to the same file once versions are stripped."""
    seen: dict[str, Schema] = {}
    for schema in resolved.values():
        other = seen.get(schema.published_rel)
        if other is not None:
            raise BuildError(
                f"{schema.rel} and {other.rel} would both be published as "
                f"{schema.published_rel}.ttl"
            )
        seen[schema.published_rel] = schema


def warn_on_stale_aux(resolved: dict[str, Schema]) -> None:
    """Flag modules whose context.jsonld / csv-metadata.json describe another version.

    Those files are generated (build_contexts.py, build_csvw.py) from the schema
    imports.json points at, not from the manifest pin. When the two differ, the
    published aux files describe a different version from the published ontology.
    """
    importmap = json.loads(IMPORTS_JSON.read_text())
    for key, schema in sorted(resolved.items()):
        current = importmap.get(schema.id)
        if current is None or current == schema.importmap_value:
            continue
        aux = [n for n in ("context.jsonld", "csv-metadata.json") if (MODEL_ROOT / schema.module / n).exists()]
        if aux:
            print(
                f"warning: manifest pins {key} to {schema.rel}, but imports.json points at "
                f"{current.removeprefix('../')}.yaml, which {', '.join(aux)} "
                f"{'is' if len(aux) == 1 else 'are'} generated from",
                file=sys.stderr,
            )


def assert_unique_ontology_iris(out_dir: Path) -> None:
    """No two published files may claim the same owl:Ontology IRI.

    Two files asserting the same ontology identity merge into one
    self-contradictory graph in any reasoner or triplestore that loads the repo
    wholesale, which is exactly the failure this repo exists to avoid.
    """
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
        # The module READMEs are documentation for this repo and are not published.
        for name in ("context.jsonld", "csv-metadata.json"):
            src = MODEL_ROOT / module / name
            if src.exists():  # only some modules have a CSV form
                shutil.copy2(src, out_dir / module / name)
        # The hand-maintained *-rules-shape.ttl files carry the conditional
        # constraints gen-shacl cannot produce, because it ignores LinkML
        # `rules:`. They are published alongside the generated shapes so that
        # the validator can fetch them by URL like anything else -
        # without them, the "Other requires free text" rules are enforced
        # nowhere. They must use the same flat namespace as the generated
        # shapes or they match nothing.
        target = out_dir / module
        for rules in sorted((ASSETS_MODEL_ROOT / module).glob("*-rules-shape.ttl")):
            target.mkdir(parents=True, exist_ok=True)
            shutil.copy2(rules, target / rules.name)
    # manifest.yaml is not published as a file: social-care.ttl carries it in RDF
    # (see describe_release).
    shutil.copy2(CONTEXT, out_dir / CONTEXT.name)
    # The ontology repo's README links to model-management.md. Being
    # overwritten on each run, this copy cannot drift from the original.
    shutil.copy2(MODEL_ROOT / "model-management.md", out_dir / "model-management.md")
    # The example records (JSON-LD and CSV) and their expectations.json, so the
    # published shapes ship with data to try them on.
    shutil.copytree(
        MODEL_ROOT / "examples",
        out_dir / "examples",
        ignore=shutil.ignore_patterns(".DS_Store"),
    )


def build(out_dir: Path) -> list[Schema]:
    manifest = yaml.safe_load(MANIFEST.read_text())
    schemas = load_schemas()
    resolved = resolve_pins(schemas, manifest)
    assert_unique_published_names(resolved)
    pinned = sorted(resolved.values(), key=lambda s: s.rel)

    for schema in schemas:
        if schema not in pinned:
            print(f"  {schema.rel}: skipped (version {schema.version} not pinned in manifest.yaml)")

    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)

    generated: list[Path] = []

    # Every schema - modules and umbrella alike - is resolved through the
    # manifest-pinned import map, so a module importing another gets the pinned
    # version rather than whatever imports.json happens to point at. The map is
    # written outside src/ deliberately: Jekyll's source is src/, and it parses
    # every JSON file under src/_data/ into site.data, so a generated file there
    # would pollute the site build. The umbrella copy carrying the manifest's
    # version is written there too; the import map's absolute paths let it
    # resolve the modules from outside MODEL_ROOT.
    with tempfile.TemporaryDirectory() as tmp:
        importmap_path = Path(tmp) / "resolved-imports.json"
        importmap_path.write_text(json.dumps(resolved_importmap(resolved), indent=2))
        umbrella = versioned_umbrella(manifest, Path(tmp))

        for schema in pinned:
            module_dir = MODEL_ROOT / schema.module
            target_dir = out_dir / schema.module
            label = f"{schema.rel} -> {schema.published_rel}"

            # Only the pinned version of each IRI is published, so every file
            # keeps the bare ontology IRI (e.g. .../placements).
            owl_dest = target_dir / f"{schema.published_stem}.ttl"
            run(
                [
                    "gen-owl",
                    "--no-mergeimports",
                    "--ontology-uri-suffix",
                    "",
                    *OWL_FLAGS,
                    "-im",
                    str(importmap_path),
                    schema.path.name,
                ],
                cwd=module_dir,
                dest=owl_dest,
            )
            generated.append(owl_dest)

            if schema.rel in SHACL_SKIP:
                print(f"  {label}: OWL only (core schema, see person/README.md)")
                continue

            shacl_dest = target_dir / f"{schema.published_stem}-shape.ttl"
            run(
                ["gen-shacl", *SHACL_FLAGS, "-im", str(importmap_path), schema.path.name],
                cwd=module_dir,
                dest=shacl_dest,
            )
            generated.append(shacl_dest)
            print(f"  {label}: OWL + SHACL")

        # The umbrella, written to the root of the published tree.

        social_care_ttl = out_dir / "social-care.ttl"
        run(
            [
                "gen-owl",
                "--no-mergeimports",
                "--ontology-uri-suffix",
                "",
                *OWL_FLAGS,
                "-im",
                str(importmap_path),
                str(umbrella),
            ],
            cwd=MODEL_ROOT,
            dest=social_care_ttl,
        )
        point_imports_at_published(social_care_ttl, resolved)
        describe_release(social_care_ttl, resolved)
        social_care_shape = out_dir / "social-care-shape.ttl"
        run(
            ["gen-shacl", *SHACL_FLAGS, "-im", str(importmap_path), str(umbrella)],
            cwd=MODEL_ROOT,
            dest=social_care_shape,
        )
        generated.extend([social_care_ttl, social_care_shape])
        print("  social-care.yaml: OWL (imports pinned modules) + merged SHACL")

    print(f"canonicalising {len(generated)} files")
    for path in generated:
        canonicalise(path)

    assert_unique_ontology_iris(out_dir)
    copy_aux(pinned, out_dir)
    warn_on_stale_aux(resolved)
    return pinned


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--out",
        type=Path,
        required=True,
        help="directory to write the publishable ontology tree into",
    )
    args = parser.parse_args()

    try:
        print(f"generating from {MODEL_ROOT.relative_to(REPO_ROOT)}")
        build(args.out.resolve())
    except BuildError as exc:
        print(f"\nerror: {exc}", file=sys.stderr)
        return 1
    print(f"ontology tree -> {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
