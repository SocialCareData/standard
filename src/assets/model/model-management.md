# Managing the data models — LinkML & SHACL validation

Every data standard under `src/assets/model/<standard>/` is defined as a
[LinkML](https://linkml.io/) schema, which is the **authoritative source** for
that model. From one YAML file the SHACL shapes, OWL/RDF, JSON Schema, Pydantic
classes and documentation are all *generated*.

> ⚠️ **Do not edit the generated artifacts** (`*-shape.ttl`, `*.ttl` ontology,
> JSON Schema, docs). Edit the LinkML `*.yaml` and regenerate — any manual edits
> to generated files are overwritten.

This guide covers the LinkML → SHACL workflow that is common to **all** models.
Each model's own `README.md` describes only what is specific to that model
(its classes, profiles, cardinalities).

## Prerequisites

```bash
pip install linkml   # provides gen-shacl, gen-owl, gen-json-schema, gen-doc, …
```

LinkML needs Python ≥ 3.11 with the `_lzma` stdlib module (some pyenv builds of
3.13/3.14 ship without it — use a 3.11 interpreter if `gen-shacl` fails to
import `_lzma`).

## Anatomy of a LinkML model

| Element | Purpose | Becomes (in SHACL) |
| --- | --- | --- |
| **classes** | entities (a root class + sub-entities) | one `NodeShape` per class (`--suffix Shape` → `pl:PlacementShape`) |
| **slots** | properties | `sh:property` blocks (`sh:minCount`/`sh:maxCount` from `required`/`multivalued`, `sh:pattern`, `sh:minInclusive`/`sh:maxInclusive` from `minimum_value`/`maximum_value`) |
| **enums** | controlled vocabularies | `sh:in ( … )` of concept IRIs |
| **types** | custom datatypes | `sh:datatype` (e.g. `nonNegativeInteger` → `xsd:nonNegativeInteger`) |

- **Object references** (e.g. `placementAvailability`, `actualPlacement`) are
  modelled as **class-ranged slots** → `sh:class` + `sh:nodeKind sh:BlankNodeOrIRI`.
- **URI-valued** scalars use `range: uri` → `sh:nodeKind sh:IRI` (needed when the
  value is an `@id` node rather than a literal).

### Controlled vocabularies: code, label, meaning

Model an enum so each permissible value carries the three things a vocabulary
needs — its data **code**, a human **label**, and the concept **IRI**:

```yaml
enums:
  PlacementUrgency:
    title: Placement Urgency          # taxonomy title
    permissible_values:
      "Within 5 days":                # KEY = the code (the value used in data)
        title: Within 5 days          # human label
        meaning: pu:WithinFiveDays    # concept IRI -> used in SHACL sh:in
        description: Placement is needed within five days.
```

- The **key** is the value's code (the SKOS-style *notation*). Quote it when it
  contains spaces or is bool-like (`"No"`, `"Within 5 days"`, `"-8"`).
- `meaning` (not the key) is what `gen-shacl` puts in `sh:in`, so renaming keys
  never changes the generated shape.
- The schema-table docs render these as a `Code | Label | Definition` table
  (see `src/assets/js/schema-table/`).

## Regenerating downstream artifacts

Run from the model's directory. Using placements as the example:

```bash
# SHACL — one shape per class
gen-shacl --non-closed --suffix Shape placements-standard-01.yaml > placements-standard-shape-01.ttl

# OWL / RDF, JSON Schema, docs, Pydantic, …
gen-owl --consolidate-cardinality-axioms --skip-vacuous-min-zero-cardinality-axioms --skip-vacuous-local-range-axioms placements-standard-01.yaml > placements-standard-01.ttl
gen-json-schema placements-standard-01.yaml
gen-doc placements-standard-01.yaml
```

`--non-closed` produces open shapes and `--suffix Shape` names them
`…Shape` — both keep the output aligned with any hand-written shapes.
`-im imports.json` resolves the Person import to the local file. `gen-shacl`
keeps `--include-imports` (the default) so the shared-object shapes are emitted
and validate the nested objects; `gen-owl` uses `--no-mergeimports` so the
Person classes are referenced via `owl:imports` rather than copied in.

## What `gen-shacl` does NOT generate

`gen-shacl` (verified with LinkML 1.11.1) **ignores conditional logic**:

- class-level `rules:` (if/then `preconditions`/`postconditions`), and
- class-level boolean expressions (`none_of` / `any_of` / `all_of`).

These remain the semantic source of truth (honoured by `linkml-validate` and the
Python/Pydantic artifacts), but they produce **no** SHACL. To enforce such a
constraint in SHACL, hand-maintain the equivalent shape in a separate
`*-rules-shape.ttl` and load it *alongside* the generated shape — the validator
accepts a list of shape files per profile (see below).

Placements does this for its four "Other ⇒ free-text required" rules in
[`placements/placements-base-rules-shape.ttl`](placements/placements-base-rules-shape.ttl),
e.g.:

```turtle
pl:CulturalNeedsOtherCheckShape a sh:NodeShape ;
    sh:targetClass pl:PlacementRequirements ;
    sh:not [
        sh:property [ sh:path pl:culturalNeeds ; sh:hasValue cln:Other ] ;
        sh:property [ sh:path pl:culturalNeedsOther ; sh:maxCount 0 ]
    ] .
```

Keep the rules-shape in sync with the schema's `rules:` blocks by hand.

> **`@type: @vocab` in `context.jsonld`.** For a controlled-vocabulary property
> to be validated at all, its JSON-LD context entry must serialise the value to
> the concept IRI. Use `"@type": "@vocab"` (with the enum's `@vocab` base), not
> `"@type": "@id"` — the latter drops the value entirely.

## One model, several shapes (profiles)

When cardinalities differ by context (e.g. the same class is stricter in one
scenario than another), split the model into a **shared core** plus **profile**
schemas that `import` it and redefine the root class:

- the core defines the sub-entities, slots and vocabularies once;
- each profile fully redefines the root class with its own cardinalities
  (LinkML *replaces* an imported class rather than merging it, so list all its
  slots);
- generate SHACL from **each profile file separately** — every profile emits its
  own root-class shape plus the identical shared sub-entity shapes.

The Person model uses this (`person-standard.yaml` core +
`person-subject-of-care.yaml` / `person-connected.yaml`); see
[`person/README.md`](person/README.md).

## Validating the examples

Each model ships JSON-LD examples that are checked against its generated shapes
by the standard-agnostic validator in
[`src/assets/shacl/validation/`](../shacl/validation/README.md). Files named
`valid-*.jsonld` must conform; `invalid-*.jsonld` must not.

```bash
cd src/assets/shacl/validation
npm install
node validate.js                          # every standard, every profile
node validate.js placements               # one standard
node validate.js person subject-of-care   # one standard, one profile
```

A profile may load **several** shape files (the generated shape plus any
hand-maintained `*-rules-shape.ttl`); they are merged before validation.
Register a new standard/profile in the `STANDARDS` map at the top of
`validate.js`.
