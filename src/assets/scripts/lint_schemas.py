#!/usr/bin/env python3
"""Run the LinkML linter over every schema under src/_data/model.

linkml-lint has no import map option, so on its own it fetches each
https://ontology.socialcaredata.io/<module> import over the network instead of
using the files in this checkout. This runs the same linter with imports.json.

Run it with::

    python src/assets/scripts/lint_schemas.py
"""

from __future__ import annotations

import functools
import json
import os
import sys
from pathlib import Path

import yaml
import linkml.linter.linter as linter_module
from linkml.linter.linter import Linter
from linkml_runtime.utils.schemaview import SchemaView

# src/assets/scripts/lint_schemas.py -> repo root is four levels up.
REPO_ROOT = Path(__file__).resolve().parents[3]
MODEL_ROOT = REPO_ROOT / "src" / "_data" / "model"
CONFIG = MODEL_ROOT / ".linkmllint.yaml"
IMPORTMAP = json.loads((MODEL_ROOT / "imports.json").read_text(encoding="utf-8"))

linter_module.SchemaView = functools.partial(SchemaView, importmap=IMPORTMAP)


def annotate(level: str, path: str, title: str, message: str) -> None:
    print(f"::{level} file={path},title={title}::{' '.join(message.split())}")


def main() -> int:
    linter = Linter(yaml.safe_load(CONFIG.read_text(encoding="utf-8")))
    errors = warnings = 0
    schemas = sorted(MODEL_ROOT.glob("*/*.yaml"))
    for schema in schemas:
        rel = os.path.relpath(schema)
        try:
            for problem in linter.lint(str(schema)):
                level = "error" if str(problem.level) == "error" else "warning"
                errors += level == "error"
                warnings += level == "warning"
                annotate(level, rel, f"linkml-lint {problem.rule_name or 'schema'}", problem.message)
        except Exception as exc:  # a rule that cannot load the schema raises instead of reporting
            errors += 1
            annotate("error", rel, "linkml-lint", str(exc))

    print(f"\n{len(schemas)} schema(s) linted: {errors} error(s), {warnings} warning(s).")
    return 1 if errors or warnings else 0


if __name__ == "__main__":
    sys.exit(main())
