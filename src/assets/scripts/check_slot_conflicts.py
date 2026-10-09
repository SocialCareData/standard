#!/usr/bin/env python3
"""
Conducts checks across all LinkML schemas in the social-care umbrella to ensure a single stable ontology when merged.

Fail if two standards define the same LinkML slot name, or one slot_uri with different ranges.

social-care.yaml imports every module into one flat namespace: a slot name defined in two
modules is silently replaced by whichever is imported last, and one slot_uri with two ranges
gives a single RDF property two incompatible meanings.

Run it with::

    python src/assets/scripts/check_slot_conflicts.py
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

from linkml_runtime.linkml_model.meta import SchemaDefinition
from linkml_runtime.loaders import yaml_loader

# src/assets/scripts/check_slot_conflicts.py -> repo root is four levels up.
REPO_ROOT = Path(__file__).resolve().parents[3]
MODEL_ROOT = REPO_ROOT / "src" / "_data" / "model"
UMBRELLA = MODEL_ROOT / "social-care" / "social-care.yaml"
IMPORTMAP = json.loads((MODEL_ROOT / "imports.json").read_text(encoding="utf-8"))


@dataclass(frozen=True)
class Slot:
    name: str
    module: str
    prefix: str
    path: Path
    uri: str
    range: str

    @property
    def where(self) -> str:
        return f"{self.module}.{self.name}"


def load_closure(path: Path, seen: set[Path]) -> list[tuple[Path, SchemaDefinition]]:
    schema = yaml_loader.load(str(path), target_class=SchemaDefinition)
    result = [(path, schema)]
    for imp in schema.imports:
        if imp.startswith("linkml:"):
            continue
        if imp not in IMPORTMAP:
            raise SystemExit(f"error: {path} imports {imp}, which imports.json does not map")
        # Importmap values are relative to the importing schema.
        child = (path.parent / f"{IMPORTMAP[imp]}.yaml").resolve()
        if child not in seen:
            seen.add(child)
            result.extend(load_closure(child, seen))
    return result


def expand(curie: str, schema: SchemaDefinition) -> str:
    prefix, sep, local = curie.partition(":")
    if sep and not local.startswith("//") and prefix in schema.prefixes:
        return schema.prefixes[prefix].prefix_reference + local
    return curie


def collect() -> list[Slot]:
    root = UMBRELLA.resolve()
    slots = []
    for path, schema in load_closure(root, {root}):
        for name, slot in schema.slots.items():
            uri = slot.slot_uri or f"{schema.default_prefix}:{name}"
            slots.append(Slot(
                name=str(name),
                module=path.parent.name,
                prefix=str(schema.default_prefix),
                path=path,
                uri=expand(str(uri), schema),
                range=str(slot.range or schema.default_range or "string"),
            ))
    return slots


def slot_line(path: Path, name: str) -> int:
    in_slots = False
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        if re.match(r"^[^\s#]", line):
            in_slots = line.startswith("slots:")
        elif in_slots and re.match(rf"^  {re.escape(name)}:\s*$", line):
            return number
    return 1


def report(title: str, group: list[Slot], message: str) -> None:
    for slot in group:
        print(f"::error file={os.path.relpath(slot.path)},line={slot_line(slot.path, slot.name)},title={title}::{message}")


def main() -> int:
    slots = collect()
    by_name: dict[str, list[Slot]] = defaultdict(list)
    by_uri: dict[str, list[Slot]] = defaultdict(list)
    for slot in slots:
        by_name[slot.name].append(slot)
        by_uri[slot.uri].append(slot)

    conflicts = 0
    for name, group in sorted(by_name.items()):
        modules = sorted({s.module for s in group})
        if len(modules) > 1:
            conflicts += 1
            suggestions = " / ".join(sorted({f"{s.prefix}{name[0].upper()}{name[1:]}" for s in group}))
            report("Conflicting slot name", group,
                   f"Slot '{name}' is defined in {', '.join(modules)}; the merged ontology keeps only one. "
                   f"Give each a unique slot name (e.g. {suggestions}) with a unique slot_uri, and set "
                   f"'title: {name}' so the property is still presented as '{name}'. "
                   "If it really is the same property, define it once in common.")

    for uri, group in sorted(by_uri.items()):
        if len({s.module for s in group}) > 1 and len({s.range for s in group}) > 1:
            conflicts += 1
            used = ", ".join(f"{s.where} (range {s.range})" for s in group)
            report("Conflicting slot_uri", group,
                   f"slot_uri {uri} is used by {used}; one RDF property cannot have different ranges. "
                   "Give each slot a unique slot_uri (e.g. sg:episodeOutcome) and keep the shared "
                   "property name in 'title:'. If it really is the same property, define it once in common.")

    rel = os.path.relpath(UMBRELLA)
    if conflicts:
        print(f"\n{conflicts} conflict(s) across the standards merged by {rel}.")
        return 1
    print(f"No slot name or slot_uri conflicts across the {len(slots)} slots merged by {rel}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
