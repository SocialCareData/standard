# Person LinkML data model

The Person Standard is expressed as [LinkML](https://linkml.io/) and is the
**authoritative source** for the Person data model. From the YAML you can
generate the SHACL, OWL/RDF, JSON Schema, docs and more with the standard LinkML
generators.

> ⚠️ **DO NOT EDIT THE GENERATED `*-shape.ttl` FILES DIRECTLY.**
> Edit the LinkML schema and regenerate (see below).

## The two-profile design

Whether a person is the **subject of care** or merely a **connected/related**
person changes the cardinality of several `Person` properties. This distinction
was previously hand-written as two SHACL files
(`manual-person-subject-of-care-shacl-shape.ttl` and
`manual-person-connected-shacl-shape.ttl`). It is now expressed in LinkML as a
shared core plus two profiles:

| File | Role |
| --- | --- |
| `person-standard.yaml` | **Shared core.** Prefixes, controlled vocabularies (enums), every slot definition (ranges, patterns, descriptions), the six sub-entity classes (`Identifier`, `Name`, `Address`, `Contact`, `PersonRelationship`, `PartialDate`), and a canonical base `Person`. |
| `person-subject-of-care.yaml` | Imports the core and redefines `Person`, **tightening** cardinalities (identifier, dateOfBirth, isDeceased, address, genderCode, ethnicityCode become required). |
| `person-connected.yaml` | Imports the core and redefines `Person` so all demographics are optional and `contact` / `relatedPerson` are limited to at most one. |

Each profile fully redefines `Person` (LinkML replaces, rather than merges, an
imported class), so `gen-shacl` emits exactly one `p:PersonShape` per profile
plus the shared sub-entity shapes — no stray shapes. Both profiles inherit the
identical sub-entity and vocabulary definitions from the core, so those shapes
come out byte-for-byte equivalent across the two files (matching the manual
shapes).

### Person cardinalities

| Property | Subject of care | Connected |
| --- | --- | --- |
| `identifier` | 1..* | 0..* |
| `name` | 1..1 | 1..1 |
| `dateOfBirth` | 1..1 | 0..1 |
| `isDeceased` | 1..1 | 0..1 |
| `deceasedDate` | 0..1 | 0..1 |
| `address` | 1..* | 0..* |
| `contact` | 0..* | 0..1 |
| `genderCode` | 1..1 | 0..1 |
| `sexCode` | 0..1 | 0..1 |
| `ethnicityCode` | 1..1 | 0..1 |
| `relatedPerson` | 0..* | 0..1 |
| `primaryContactProfessional` | 0..* | 0..* |
| `matchedPersonRef` | 0..* | 0..* |

## Regenerating the SHACL

Requires `pip install linkml` (Python ≥ 3.11 with the `_lzma` stdlib module).
Run from this directory:

```bash
gen-shacl --non-closed --suffix Shape person-subject-of-care.yaml > person-subject-of-care-shape.ttl
gen-shacl --non-closed --suffix Shape person-connected.yaml       > person-connected-shape.ttl
```

The `--suffix Shape` and `--non-closed` flags line the generated shapes up with
the hand-written ones (`p:PersonShape`, open shapes). The core
`person-standard.yaml` is not generated from directly — always generate from a
profile file so `Person` carries a concrete cardinality.

## Compatibility with the manual shapes

The generated shapes are **functionally equivalent** to the manual
`manual-person-*-shacl-shape.ttl` files: same target classes, same cardinalities,
same controlled-vocabulary `sh:in` lists, same patterns. Every example under
`examples/` validates identically. Known intentional differences:

- **`sh:minLength 1`** on `value` / `familyName` / `givenName` / `line1` / `city`
  is not emitted (LinkML has no min-length facet). No example relies on it —
  empty-value cases are already caught by `minCount`.
- The **`deceasedDate` warning** (subject-of-care: `isDeceased=true` with no
  `deceasedDate` → `sh:Warning`) is a conditional constraint `gen-shacl` cannot
  produce from LinkML. It is advisory only and no example triggers it. (This
  mirrors the Placements model, whose LinkML `rules` are likewise not emitted by
  `gen-shacl`.)
- Generated shapes carry `sh:description` / `rdfs:comment` and full IRIs in
  `sh:in` lists (vs. the manual files' prefixed CURIEs) — cosmetic only.

## Validating the examples

See `src/assets/shacl/validation/`:

```bash
node validate.js person                  # both profiles
node validate.js person subject-of-care  # one profile
```

Files named `valid-*.jsonld` must conform; `invalid-*.jsonld` must not.
