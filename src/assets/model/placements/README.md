# Placements LinkML data model

`placements-standard.yaml` is a single [LinkML](https://linkml.io/) schema that is the
**authoritative source** for the Children's Social Care Placements data model.

From one YAML file you can generate the SHACL, the OWL/RDF, JSON Schema,
Pydantic, documentation, and more, using the standard LinkML generators.

> ⚠️ **WARNING: DO NOT EDIT ONTOLOGY OR SHACL FILES DIRECTLY!**
>
> **Edit the LinkML schema instead.** Any changes made directly to this file will be overwritten. Refer to [Regenerating downstream artifacts](#regenerating-downstream-artifacts) for instructions on updating these files.

## What's in the model

| Element | Count | Notes |
| --- | --- | --- |
| Classes | 7 | `Placement` (root) → `PlacementAvailability`, `PlacementRequirements`, `PlacementRecommendation`, `RiskAssessment`, `ActualPlacement`, `QualityAssurance` |
| Slots | 55 | datatypes, object references, controlled-vocabulary fields |
| Enums | 11 | one per SKOS concept scheme in `src/assets/ttl/taxonomy-*.ttl`; each permissible value's `meaning:` is the concept IRI |
| Types | 1 custom | `nonNegativeInteger` → `xsd:nonNegativeInteger` |

Object references (`placementAvailability`, `actualPlacement`, …) are modelled
as class-ranged slots; controlled-vocabulary fields as enum-ranged slots whose
permissible values carry the concept IRI as `meaning:`, which becomes the SHACL
`sh:in` list.

## Regenerating downstream artifacts

Requires `pip install linkml` (Python ≥ 3.11 with the `_lzma` stdlib module).

```bash
# SHACL (matches src/assets/shacl/shacl-shape.ttl — see validation below)
gen-shacl --non-closed --suffix Shape placements.yaml > shacl-shape.ttl

# OWL / RDF, JSON Schema, docs, Pydantic, …
gen-owl --consolidate-cardinality-axioms --skip-vacuous-min-zero-cardinality-axioms --skip-vacuous-local-range-axioms placements.yaml > placements.ttl
gen-json-schema placements.yaml
gen-doc placements.yaml
```

The `--suffix Shape` and `--non-closed` flags make the generated shapes line up
with the existing hand-written ones (`pl:PlacementShape …`, open shapes).

