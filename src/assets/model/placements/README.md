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
# SHACL — one shape per class
gen-shacl --non-closed --suffix Shape placements-standard-01.yaml > placements-standard-shape-01.ttl

# OWL / RDF, JSON Schema, docs, Pydantic, …
gen-owl --consolidate-cardinality-axioms --skip-vacuous-min-zero-cardinality-axioms --skip-vacuous-local-range-axioms placements-standard-01.yaml > placements-standard-01.ttl
gen-json-schema placements-standard-01.yaml
gen-doc placements-standard-01.yaml
```

The `--suffix Shape` and `--non-closed` flags make the generated shapes line up
with the hand-written ones (`pl:PlacementShape …`, open shapes).

### Conditional constraints are NOT generated

The schema's `rules:` blocks (e.g. "when `outOfLAReason` is `Other`,
`outOfLAReasonOther` free-text is required") express conditional logic that
`gen-shacl` **does not** translate into SHACL — verified with LinkML 1.11.1,
which also drops class-level boolean expressions (`none_of`/`any_of`). The
`rules:` remain the semantic source of truth (honoured by `linkml-validate` and
the Python/Pydantic artifacts).

To enforce them in SHACL, the equivalent `sh:not[…]` shapes are maintained by
hand in **`placements-base-rules-shape.ttl`** and loaded *alongside* the
generated shape by the validator (see `src/assets/shacl/validation`, which
accepts a list of shape files per profile). Keep that file in sync with the
`rules:` blocks. It currently covers the four "Other ⇒ free-text" rules:
`outOfLAReason`, `specificCommunicationRequirement`, `culturalNeeds`,
`additionalSupport`.

> Note: `outOfLAReason` in `context.jsonld` uses `@type: @vocab` (not `@type:
> @id`) so its controlled-vocabulary values serialise to `olr:` concept IRIs and
> can actually be validated.

