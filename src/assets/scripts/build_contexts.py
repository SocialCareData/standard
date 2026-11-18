#!/usr/bin/env python3
"""Generate the JSON-LD contexts under src/_data/model from the LinkML schemas.

Every ``<module>/context.jsonld`` is derived from the LinkML YAML and must
never be hand-edited: change the schema and
re-run this script. CI fails a pull request whose committed contexts differ
from what this script produces.

Run it with::

    python src/assets/scripts/build_contexts.py            # write the contexts
    python src/assets/scripts/build_contexts.py --check    # fail if any is stale

Why not ``gen-jsonld-context``? It produces a context for LinkML's own JSON
serialisation, not for the records this standard publishes:

* enum slots get ``{text, description, meaning}`` objects, so a code such as
  ``"Risk Present"`` stays a literal instead of expanding to its concept IRI,
  and every SHACL ``sh:in`` check fails;
* terms are keyed by slot name, but records use the slot ``title``
  (``sgIdentifier`` is written ``identifier``);
* it is one flat context, so a key that means different things on different
  classes (``name`` on a Person and on a Contact) cannot be expressed;
* ``range: uri`` becomes an ``xsd:anyURI`` literal rather than an IRI.

The rules this generator follows instead:

* a record's JSON key is the slot's ``title`` if it has one; its name is
  accepted too, since existing records use both;
* ``@id`` is the slot URI; a class range or ``uri`` gives ``"@type": "@id"``,
  and ``range: Any`` gives ``"@type": "@json"`` (an unmodelled structure);
  dates, booleans and numbers are coerced to their XSD datatype;
  ``multivalued`` gives ``"@container": "@set"``;
* an enum slot gives ``"@type": "@vocab"`` with a scoped context mapping each
  permissible value's code, ``title``, concept local name and ``aliases`` to
  its ``meaning`` - add ``aliases:`` to accept another spelling;
* a key with one meaning across the schema is a top-level term. A key with
  several is defined in a type-scoped ``@context`` on each class that uses it,
  and also at the top level when one meaning is used by more classes than any
  other.
"""

from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
import tempfile
from collections import Counter, defaultdict
from pathlib import Path

import yaml
from linkml_runtime.utils.schemaview import SchemaView

# src/assets/scripts/build_contexts.py -> repo root is four levels up.
REPO_ROOT = Path(__file__).resolve().parents[3]
MODEL_ROOT = REPO_ROOT / "src" / "_data" / "model"
IMPORTS_JSON = MODEL_ROOT / "imports.json"
CONTEXT_NAME = "context.jsonld"
IMPORTMAP = {
    # Values are relative to a module directory; absolute paths also serve the root-level umbrella.
    k: str((MODEL_ROOT / "_" / v).resolve())
    for k, v in json.loads(IMPORTS_JSON.read_text(encoding="utf-8")).items()
}

XSD = "http://www.w3.org/2001/XMLSchema#"
LINKML = "https://w3id.org/linkml/"
# Example records name themselves ex:<id>. The prefix is defined here rather than
# in the schemas so that example.org never leaks into the published ontology.
EXAMPLE_BASE = "https://example.org/{module}/"
EXAMPLE_BASE_OVERRIDES = {"placements": "https://example.org/placement/"}
# Datatypes that need no coercion: a JSON string already is an xsd:string literal.
UNCOERCED = {XSD + "string", LINKML + "DateOrDatetime"}
IRI_TYPES = {XSD + "anyURI"}
VALID_KEY = re.compile(r"[A-Za-z][A-Za-z0-9_]*")
SAFE_LABEL = re.compile(r"[^@:/][^:/]*")


class ContextError(RuntimeError):
    """The schemas cannot be expressed as a context; fix the YAML."""


class Compactor:
    """Turns IRIs into CURIEs using the schema's own prefixes, and records which it used."""

    def __init__(self, sv: SchemaView):
        self.by_namespace: dict[str, str] = {}
        # The module's own prefixes first, so its default prefix names its own namespace.
        schemas = [sv.schema] + [s for s in sv.all_schema(imports=True) if s is not sv.schema]
        for schema in schemas:
            ordered = list(schema.prefixes.values())
            ordered.sort(key=lambda p: p.prefix_prefix != schema.default_prefix)
            for p in ordered:
                if p.prefix_prefix in ("linkml", "ex"):
                    continue
                self.by_namespace.setdefault(str(p.prefix_reference), p.prefix_prefix)
        self.by_namespace.setdefault(XSD, "xsd")
        self.used: dict[str, str] = {}

    def __call__(self, iri: str) -> str:
        best = max((ns for ns in self.by_namespace if iri.startswith(ns)), key=len, default=None)
        if best is None:
            return iri
        local = iri[len(best):]
        if not local or "/" in local or "#" in local:
            return iri
        prefix = self.by_namespace[best]
        self.used[prefix] = best
        return f"{prefix}:{local}"


def json_keys(slot) -> list[str]:
    """The keys a record may use for ``slot``: its title, and its name.

    The title is the documented key. The slot name is accepted too, as the
    hand-written contexts did, because existing records use both.
    """
    if slot.title and not VALID_KEY.fullmatch(slot.title):
        raise ContextError(f"slot {slot.name}: title {slot.title!r} is not usable as a JSON key")
    return sorted({slot.title or slot.name, slot.name})


def enum_context(sv: SchemaView, enum_name: str, iri: Compactor) -> dict:
    """Map every accepted spelling of each permissible value to its concept IRI.

    The code and any ``aliases`` are what records are written with, so each must
    name exactly one concept. The title and the concept's local name are
    accepted as a convenience, but only where they are unambiguous and valid
    as JSON-LD terms - two values may share a title ("Physical abuse" for a
    child and for an adult).
    """
    enum = sv.get_enum(enum_name)
    labels: dict[str, str] = {}
    optional: dict[str, set[str]] = defaultdict(set)
    namespaces: Counter[str] = Counter()
    for code, pv in (enum.permissible_values or {}).items():
        if not pv.meaning:
            raise ContextError(f"enum {enum_name}: {code!r} has no meaning, so it has no concept IRI")
        meaning = sv.expand_curie(pv.meaning)
        namespaces[re.sub(r"[^#/]*$", "", meaning)] += 1
        for label in (code, *(pv.aliases or [])):
            if not SAFE_LABEL.fullmatch(label):
                raise ContextError(f"enum {enum_name}: {label!r} would be read as an IRI or keyword")
            if labels.get(label, meaning) != meaning:
                raise ContextError(f"enum {enum_name}: {label!r} names two concepts")
            labels[label] = meaning
        for label in (pv.title, re.sub(r"^.*[#/]", "", meaning)):
            if label and SAFE_LABEL.fullmatch(label):
                optional[label].add(meaning)
    for label, meanings in optional.items():
        if label not in labels and len(meanings) == 1:
            labels[label] = next(iter(meanings))
    context = {"@vocab": namespaces.most_common(1)[0][0]} if namespaces else {}
    context.update({label: iri(labels[label]) for label in sorted(labels)})
    return context


def term_definition(sv: SchemaView, slot, iri: Compactor) -> dict:
    definition: dict = {"@id": iri(sv.get_uri(slot, expand=True))}
    rng = slot.range or sv.schema.default_range
    if rng in sv.all_enums():
        definition["@type"] = "@vocab"
    elif rng in sv.all_classes() and sv.get_uri(sv.get_class(rng), expand=True) == LINKML + "Any":
        # Any is a structure the standard does not model, such as a FHIR Timing:
        # carry it whole as a JSON literal rather than drop its unmapped keys.
        definition["@type"] = "@json"
    elif rng in sv.all_classes():
        definition["@type"] = "@id"
    elif rng in sv.all_types():
        datatype = sv.expand_curie(sv.induced_type(rng).uri)
        if datatype in IRI_TYPES:
            definition["@type"] = "@id"
        elif datatype.startswith(XSD) and datatype not in UNCOERCED:
            definition["@type"] = iri(datatype)
    if slot.multivalued:
        definition["@container"] = "@set"
    if rng in sv.all_enums():
        definition["@context"] = enum_context(sv, rng, iri)
    return definition


def compact(definition: dict):
    """A definition that is only an @id is written as the bare CURIE, as by hand."""
    return definition["@id"] if list(definition) == ["@id"] else definition


def build_context(schema_path: Path, module: str) -> dict:
    sv = SchemaView(str(schema_path), importmap=IMPORTMAP)
    iri = Compactor(sv)

    classes = {
        name: cls
        for name, cls in sv.all_classes().items()
        if not sv.get_uri(cls, expand=True).startswith(LINKML)
    }

    # key -> canonical definition JSON -> (definition, classes using it)
    uses: dict[str, dict[str, tuple[dict, list[str]]]] = defaultdict(dict)
    attached: set[str] = set()

    def record(key: str, definition: dict, cls: str | None) -> None:
        signature = json.dumps(definition, sort_keys=True)
        entry = uses[key].setdefault(signature, (definition, []))
        if cls is not None:
            entry[1].append(cls)

    for cls_name in sorted(classes):
        for slot in sv.class_induced_slots(cls_name):
            attached.add(slot.name)
            definition = term_definition(sv, slot, iri)
            for key in json_keys(slot):
                record(key, definition, cls_name)
    for slot_name, slot in sorted(sv.all_slots().items()):
        if slot_name not in attached:
            definition = term_definition(sv, slot, iri)
            for key in json_keys(slot):
                record(key, definition, None)

    top: dict[str, dict] = {}
    scoped: dict[str, dict[str, dict]] = defaultdict(dict)
    for key in sorted(uses):
        variants = sorted(uses[key].values(), key=lambda v: (-len(v[1]), json.dumps(v[0], sort_keys=True)))
        if key in classes:
            raise ContextError(f"JSON key {key!r} is both a slot and a class")
        if len(variants) == 1:
            top[key] = variants[0][0]
            continue
        # A clear majority meaning is also the default for nodes written without @type.
        default = variants[0] if len(variants[0][1]) > len(variants[1][1]) else None
        if default is not None:
            top[key] = default[0]
        for definition, users in variants:
            if default is not None and definition is default[0]:
                continue
            if not users:
                raise ContextError(
                    f"JSON key {key!r} has several meanings and one belongs to no class; "
                    "give the slots distinct titles"
                )
            for cls in users:
                scoped[cls][key] = definition

    class_terms: dict[str, object] = {}
    for cls_name in sorted(classes):
        cls_iri = iri(sv.get_uri(classes[cls_name], expand=True))
        if cls_name in scoped:
            class_terms[cls_name] = {
                "@id": cls_iri,
                "@context": {k: compact(scoped[cls_name][k]) for k in sorted(scoped[cls_name])},
            }
        else:
            class_terms[cls_name] = cls_iri

    terms = {k: compact(top[k]) for k in sorted(top)}

    body = {**class_terms, **terms}
    prune_vocab_entries(body, iri.used)
    used = {p for p in iri.used if f'"{p}:' in json.dumps(body)}
    default_prefix = sv.schema.default_prefix
    prefixes = {p: iri.used[p] for p in sorted(used, key=lambda p: (p != default_prefix, p))}
    prefixes["ex"] = EXAMPLE_BASE_OVERRIDES.get(module, EXAMPLE_BASE.format(module=module))
    return {"@context": {**prefixes, **body}}


def prune_vocab_entries(body: dict, prefixes: dict[str, str]) -> None:
    """Drop enum entries that ``@vocab`` already resolves to the same IRI.

    A value such as ``"AUNT"`` under ``"@vocab": ".../person-relationship-code#"``
    expands to ``prc:AUNT`` without an entry. The entry is kept when a term of
    the same name is defined outside the enum (a class or slot key, or a prefix),
    because JSON-LD resolves the value against that term first.
    """
    shadowing = set(prefixes) | {"ex"}
    pending = [body]
    while pending:
        scope = pending.pop()
        for key, definition in scope.items():
            shadowing.add(key)
            if isinstance(definition, dict) and isinstance(definition.get("@context"), dict) \
                    and definition.get("@type") != "@vocab":
                pending.append(definition["@context"])

    def expand(curie: str) -> str:
        prefix, _, local = curie.partition(":")
        return prefixes[prefix] + local if prefix in prefixes else curie

    pending = [body]
    while pending:
        scope = pending.pop()
        for definition in scope.values():
            if not isinstance(definition, dict) or not isinstance(definition.get("@context"), dict):
                continue
            inner = definition["@context"]
            if definition.get("@type") == "@vocab" and "@vocab" in inner:
                for label in [k for k in inner if not k.startswith("@")]:
                    if label not in shadowing and inner["@vocab"] + label == expand(inner[label]):
                        del inner[label]
            else:
                pending.append(inner)


def titles_by_iri(module: str) -> dict[str, str]:
    """Slot IRI -> its title, for the slots whose title is their documented JSON key.

    A context generated here gives such a slot two keys (title and name), so a
    tool naming a property back to the user can prefer the documented one.
    IRIs whose slots disagree on the title are left out.
    """
    schema = dict(module_schemas())[module]
    sv = SchemaView(str(schema), importmap=IMPORTMAP)
    titles: dict[str, set[str]] = defaultdict(set)
    for slot in sv.all_slots().values():
        titles[sv.get_uri(slot, expand=True)].add(slot.title or slot.name)
    return {iri: next(iter(t)) for iri, t in titles.items() if len(t) == 1}


def module_schemas() -> list[tuple[str, Path]]:
    """(module, schema) for every module directory.

    The root context.jsonld is not generated: it is maintained by hand as a list
    of references to the module contexts.

    A module's context is generated from the schema imports.json lists for it
    whose id is ``<namespace><module>``: for person that is the shared core,
    person-standard.yaml, not one of the profiles that redefine Person.
    """
    namespace = yaml.safe_load((MODEL_ROOT / "manifest.yaml").read_text())["namespace"]
    result = []
    for module_dir in sorted(p for p in MODEL_ROOT.iterdir() if p.is_dir() and p.name != "examples"):
        target = f"{namespace}{module_dir.name}"
        if target not in IMPORTMAP:
            if any(module_dir.glob("*.yaml")):
                raise ContextError(f"{module_dir.name}/ has schemas but imports.json has no entry for {target}")
            continue
        schema = Path(IMPORTMAP[target] + ".yaml")
        if schema.parent != module_dir:
            raise ContextError(f"imports.json maps {target} outside {module_dir.name}/")
        result.append((module_dir.name, schema))
    return result


def render(context: dict) -> str:
    return json.dumps(context, indent=2, ensure_ascii=False) + "\n"


def generate(out_root: Path) -> list[Path]:
    written = []
    for module, schema in module_schemas():
        dest = out_root / module / CONTEXT_NAME
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(render(build_context(schema, module)), encoding="utf-8")
        written.append(dest)
    return written


def check() -> int:
    stale = 0
    with tempfile.TemporaryDirectory() as tmp:
        for fresh in generate(Path(tmp)):
            rel = fresh.relative_to(tmp)
            committed = MODEL_ROOT / rel
            want = fresh.read_text(encoding="utf-8")
            have = committed.read_text(encoding="utf-8") if committed.is_file() else ""
            if want == have:
                print(f"ok    {rel}")
                continue
            stale += 1
            shown = committed.relative_to(REPO_ROOT)
            print(f"::error file={shown}::{shown} is out of date with the LinkML schemas")
            sys.stdout.writelines(
                difflib.unified_diff(
                    have.splitlines(keepends=True), want.splitlines(keepends=True),
                    f"committed/{rel}", f"generated/{rel}",
                )
            )
    if stale:
        print(f"\n{stale} context(s) stale; run python src/assets/scripts/build_contexts.py and commit the result")
    return 1 if stale else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--check", action="store_true",
                        help="fail, with a diff, if a committed context differs from the generated one")
    parser.add_argument("--out", type=Path, default=MODEL_ROOT,
                        help="directory to write into instead of src/_data/model")
    args = parser.parse_args()
    try:
        if args.check:
            return check()
        for path in generate(args.out.resolve()):
            print(f"wrote {path}")
    except ContextError as exc:
        print(f"::error::{exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
