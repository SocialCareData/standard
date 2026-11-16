#!/usr/bin/env python3
"""Generate CSVW metadata (csv-metadata.json) for the modules published as CSV.

Some standards are also exchanged as a flat CSV whose columns we do not
control. This script describes such a CSV with W3C CSV on the Web (CSVW)
metadata, derived from the LinkML schema, so that a CSVW processor - the
data-standard-validator in particular - can turn each row into the same RDF
a JSON-LD record would produce and validate it against the same SHACL shapes.

Like the JSON-LD contexts, every ``<module>/csv-metadata.json`` is generated
and must never be hand-edited: change the annotations in the schema and re-run
this script. CI fails a pull request whose committed metadata is stale.

    python src/assets/scripts/build_csvw.py            # write the metadata
    python src/assets/scripts/build_csvw.py --check    # fail if any is stale

A module gets metadata when its schema maps at least one slot to a column. The
mapping is written as annotations, using the CSVW property each one becomes:

* on the schema
    * ``dsv:headerMatch: first-line`` - a header cell holds the column name on
      its first line, followed by help text that is not part of the name;
    * ``csvw:null: N/A`` - a token meaning "no value" ("" always does), except
      in a column whose enum has a value written that way;
    * ``csvw:separator: ","`` - separates the values of a multivalued slot;
* on a slot
    * ``csvw:titles: <column>`` - the column holding the slot;
    * ``csvw:format`` - the CSVW datatype format, e.g. ``"No|Yes"`` for a
      boolean column whose question is the negation of the slot (the default
      for booleans is ``"Yes|No"``);
* on a permissible value
    * ``csvw:titles`` - another spelling the CSV uses for the value, for one
      that cannot be an alias because it is not a valid JSON-LD term (``N/A``).

The rules the metadata follows:

* each row is one record of the schema's ``tree_root`` class, ``#row-{_row}``;
  every class reached from it through class-ranged slots is a node
  ``#row-{_row}/<slot>/<slot>``, linked and typed by virtual columns. The link
  to a node held by an optional slot is only made when the row has a value
  for that node (``dsv:skipIfNodeEmpty``), so an empty optional part of the
  record stays absent rather than failing its own required fields;
* ``propertyUrl`` is the slot URI, and the cell is typed with the slot's XSD
  datatype;
* an enum column has no ``valueUrl``: its ``dsv:valueMap`` lists each
  concept with every accepted spelling (code, title, aliases, local name,
  ``csvw:titles``), matched ignoring case and whitespace. Its preferred label,
  the one a validator shows in "allowed values", is ``csvw:titles`` if given,
  else the code.

The ``dsv:`` properties are CSVW common properties understood by the
data-standard-validator. CSVW only lets metadata use the prefixes of its own
initial context, so they and every IRI are written in full.
"""

from __future__ import annotations

import argparse
import difflib
import json
import re
import sys
import tempfile
from pathlib import Path

from linkml_runtime.utils.schemaview import SchemaView

from build_contexts import (
    IMPORTMAP,
    LINKML,
    MODEL_ROOT,
    REPO_ROOT,
    ContextError,
    enum_meanings,
    module_schemas,
)

METADATA_NAME = "csv-metadata.json"
CSVW_CONTEXT = "http://www.w3.org/ns/csvw"
DSV = "https://theodi.github.io/data-standard-validator/ns#"
XSD = "http://www.w3.org/2001/XMLSchema#"
RDF_TYPE = "rdf:type"
ROW = "#row-{_row}"
HEADER_MATCHES = {"first-line"}
# XSD datatypes CSVW names as built-in datatypes; anything else is read as a string.
CSVW_DATATYPES = {
    "anyURI", "boolean", "date", "dateTime", "decimal", "double", "duration",
    "float", "gDay", "gMonth", "gMonthDay", "gYear", "gYearMonth", "integer",
    "long", "negativeInteger", "nonNegativeInteger", "nonPositiveInteger",
    "positiveInteger", "string", "time", "int", "short", "byte",
    "unsignedLong", "unsignedInt", "unsignedShort", "unsignedByte",
}
DEFAULT_FORMATS = {"boolean": "Yes|No"}
# Column names and slot names must be usable as CSVW column names and in URI templates.
COLUMN_NAME = re.compile(r"[A-Za-z0-9_]+")


class CsvwError(ContextError):
    """The schema's CSV annotations cannot be expressed as CSVW; fix the YAML."""


def annotations(element) -> dict[str, str]:
    """An element's annotations as ``{tag: value}``."""
    raw = element.annotations
    if not raw:
        return {}
    items = raw._items() if hasattr(raw, "_items") else raw.items()
    return {tag: str(annotation.value) for tag, annotation in items}


def loose(label: str) -> str:
    """The form in which CSV values are compared with enum spellings: case and spaces ignored."""
    return re.sub(r"\s+", "", label).casefold()


def has_columns(sv: SchemaView) -> bool:
    return any("csvw:titles" in annotations(slot) for slot in sv.all_slots().values())


def node_paths(sv: SchemaView, root: str) -> dict[str, tuple[tuple[str, ...], bool]]:
    """Class -> (path of slots from the root to its node, whether every link on the path is required).

    A class reached along two paths would need two nodes per row, and a CSV
    column could not say which one it fills, so that is refused.
    """
    paths: dict[str, tuple[tuple[str, ...], bool]] = {root: ((), True)}
    pending = [root]
    while pending:
        cls = pending.pop(0)
        path, required = paths[cls]
        for slot in sv.class_induced_slots(cls):
            rng = slot.range or sv.schema.default_range
            if rng not in sv.all_classes() or sv.get_uri(sv.get_class(rng), expand=True).startswith(LINKML):
                continue
            if slot.multivalued:
                raise CsvwError(f"{cls}.{slot.name}: a multivalued class-ranged slot cannot be flattened into one row")
            if rng in paths:
                raise CsvwError(f"class {rng} is reached through {'/'.join(paths[rng][0]) or 'the root'} "
                                f"and {'/'.join(path + (slot.name,))}; a CSV row can only hold one")
            paths[rng] = (path + (slot.name,), required and bool(slot.required))
            pending.append(rng)
    return paths


def node_url(path: tuple[str, ...]) -> str:
    return "/".join((ROW, *path))


def datatype(sv: SchemaView, slot, fmt: str | None):
    rng = slot.range or sv.schema.default_range
    if rng not in sv.all_types():
        raise CsvwError(f"slot {slot.name}: range {rng} cannot be written in a CSV cell")
    uri = sv.expand_curie(sv.induced_type(rng).uri)
    base = uri.removeprefix(XSD) if uri.startswith(XSD) else "string"
    if base not in CSVW_DATATYPES:
        base = "string"
    fmt = fmt or DEFAULT_FORMATS.get(base)
    if base == "decimal" and not fmt:
        return {"base": "decimal", "format": {"groupChar": ","}}
    return {"base": base, "format": fmt} if fmt else base


def value_map(sv: SchemaView, enum_name: str) -> list[dict]:
    """Every concept of an enum with the spellings a CSV may use for it."""
    entries = []
    seen: dict[str, str] = {}
    for code, pv, meaning in enum_meanings(sv, enum_name):
        extra = annotations(pv).get("csvw:titles")
        # The label a report shows: what the CSV writes, else the code records use.
        preferred = extra or code
        spellings = [code, pv.title, *(pv.aliases or []), re.sub(r"^.*[#/]", "", meaning), extra]
        alternatives = sorted({s for s in spellings if s and s != preferred})
        for spelling in [preferred, *alternatives]:
            if seen.setdefault(loose(spelling), meaning) != meaning:
                raise CsvwError(f"enum {enum_name}: {spelling!r} matches two concepts "
                                "when case and spaces are ignored")
        entry = {"@id": meaning, "skos:prefLabel": preferred}
        if alternatives:
            entry["skos:altLabel"] = alternatives
        entries.append(entry)
    return entries


def build_metadata(schema_path: Path, module: str) -> dict:
    sv = SchemaView(str(schema_path), importmap=IMPORTMAP)
    settings = annotations(sv.schema)
    roots = [name for name, cls in sv.all_classes().items() if cls.tree_root]
    if len(roots) != 1:
        raise CsvwError(f"{module}: a CSV row needs exactly one tree_root class, found {roots or 'none'}")
    root = roots[0]
    header_match = settings.get("dsv:headerMatch")
    if header_match is not None and header_match not in HEADER_MATCHES:
        raise CsvwError(f"{module}: dsv:headerMatch {header_match!r} is not one of {sorted(HEADER_MATCHES)}")
    null_tokens = ["", *[t for t in [settings.get("csvw:null")] if t]]
    separator = settings.get("csvw:separator")

    paths = node_paths(sv, root)
    columns: list[dict] = []
    titles: dict[str, str] = {}
    placed: set[str] = set()
    for cls in paths:
        path, _ = paths[cls]
        for slot in sv.class_induced_slots(cls):
            notes = annotations(slot)
            title = notes.get("csvw:titles")
            if title is None:
                continue
            if title in titles:
                raise CsvwError(f"column {title!r} is mapped to both {titles[title]} and {slot.name}")
            if slot.name in placed:
                raise CsvwError(f"slot {slot.name} is used by two classes reached from {root}; "
                                "its column could not say which it fills")
            titles[title] = slot.name
            placed.add(slot.name)
            column: dict = {"name": slot.name, "titles": title}
            if path:
                column["aboutUrl"] = node_url(path)
            column["propertyUrl"] = sv.get_uri(slot, expand=True)
            rng = slot.range or sv.schema.default_range
            if rng in sv.all_enums():
                spellings = value_map(sv, rng)
                own = {loose(s) for e in spellings
                       for s in [e["skos:prefLabel"], *e.get("skos:altLabel", [])]}
                kept = [t for t in null_tokens if loose(t) not in own or t == ""]
                if kept != null_tokens:
                    column["null"] = kept
                column[DSV + "valueMap"] = spellings
            else:
                column["datatype"] = datatype(sv, slot, notes.get("csvw:format"))
            if slot.multivalued:
                if not separator:
                    raise CsvwError(f"slot {slot.name} is multivalued but the schema sets no csvw:separator")
                column["separator"] = separator
            columns.append(column)

    unplaced = sorted(
        name for name, slot in sv.all_slots().items()
        if "csvw:titles" in annotations(slot) and name not in placed
    )
    if unplaced:
        raise CsvwError(f"{module}: {', '.join(unplaced)} have a column but no class reached from {root} uses them")
    for title in titles:
        if not COLUMN_NAME.fullmatch(title):
            raise CsvwError(f"column title {title!r} must be letters, digits and underscores")

    # Virtual columns, after the real ones as CSVW requires: type every node
    # and link each to its parent. CSVW reserves names starting with "_".
    for cls, (path, required) in paths.items():
        url = node_url(path)
        optional = {} if required else {DSV + "skipIfNodeEmpty": True}
        if path:
            link = {"name": f"link_{'_'.join(path)}", "virtual": True}
            if len(path) > 1:
                link["aboutUrl"] = node_url(path[:-1])
            parent_cls = next(c for c, (p, _) in paths.items() if p == path[:-1])
            link["propertyUrl"] = sv.get_uri(sv.induced_slot(path[-1], parent_cls), expand=True)
            link["valueUrl"] = url
            if link["name"] in placed:
                raise CsvwError(f"slot name {link['name']} clashes with a generated virtual column")
            columns.append({**link, **optional})
        typed = {"name": f"type_{'_'.join(path) or 'row'}", "virtual": True}
        if path:
            typed["aboutUrl"] = url
        if typed["name"] in placed:
            raise CsvwError(f"slot name {typed['name']} clashes with a generated virtual column")
        typed["propertyUrl"] = RDF_TYPE
        typed["valueUrl"] = sv.get_uri(sv.get_class(cls), expand=True)
        columns.append({**typed, **optional})

    metadata: dict = {
        "@context": [CSVW_CONTEXT, {"@language": "en"}],
        "rdfs:comment": f"Generated from {schema_path.relative_to(MODEL_ROOT)} by "
                        "src/assets/scripts/build_csvw.py in SocialCareData/standard. Do not edit.",
        "dc:title": f"{sv.schema.title or sv.schema.name} - CSV",
        "dc:source": sv.schema.id,
        "dialect": {"header": True, "headerRowCount": 1, "trim": True},
    }
    if header_match:
        metadata[DSV + "headerMatch"] = header_match
    table_schema: dict = {"aboutUrl": ROW}
    if null_tokens != [""]:
        table_schema["null"] = null_tokens
    table_schema["columns"] = columns
    metadata["tableSchema"] = table_schema
    return metadata


def render(metadata: dict) -> str:
    return json.dumps(metadata, indent=2, ensure_ascii=False) + "\n"


def generate(out_root: Path) -> list[Path]:
    written = []
    for module, schema in module_schemas():
        sv = SchemaView(str(schema), importmap=IMPORTMAP)
        if not has_columns(sv):
            continue
        dest = out_root / module / METADATA_NAME
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(render(build_metadata(schema, module)), encoding="utf-8")
        written.append(dest)
    return written


def check() -> int:
    stale = 0
    with tempfile.TemporaryDirectory() as tmp:
        fresh_files = {p.relative_to(tmp) for p in generate(Path(tmp))}
        committed_files = {p.relative_to(MODEL_ROOT) for p in MODEL_ROOT.glob(f"*/{METADATA_NAME}")}
        for rel in sorted(fresh_files | committed_files):
            fresh = Path(tmp) / rel
            committed = MODEL_ROOT / rel
            want = fresh.read_text(encoding="utf-8") if fresh.is_file() else ""
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
        print(f"\n{stale} CSV metadata file(s) stale; run python src/assets/scripts/build_csvw.py "
              "and commit the result")
    return 1 if stale else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--check", action="store_true",
                        help="fail, with a diff, if committed CSV metadata differs from the generated")
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
