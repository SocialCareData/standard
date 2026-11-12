# LinkML model and linting

Each standard has a [LinkML](https://linkml.io/) model: a YAML file that defines its classes, properties and vocabularies. The site tables, the ontology and the validation shapes are all generated from it.

This page covers the basic building blocks. For anything more, see the [LinkML docs](https://linkml.io/linkml/schemas/index.html).

## Where the files are

```text
src/_data/model/
  common/common.yaml                    shared objects: Identifier, Name, Address, Contact
  placements/
    placements-standard.yaml            current model
    placements-standard-v1.yaml         frozen older version
    context.jsonld                      JSON-LD context for this module
    README.md                           notes for this model
  examples/placements/                  test records
```

## 1. Header

```yaml
id: https://ns.socialcaredata.io/placements
name: placements
title: Children's Social Care Placements Data Model
description: >-
  A single LinkML data model for Children's Social Care Placements Standard.
license: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
version: 2.0.0

prefixes:
  linkml: https://w3id.org/linkml/
  pl: https://ns.socialcaredata.io/
  pu: https://ns.socialcaredata.io/placement-urgency#
  sh: http://www.w3.org/ns/shacl#
default_prefix: pl
default_range: string
imports:
  - linkml:types
  - https://ns.socialcaredata.io/common   # only if you reuse common objects
```

- `id` is `https://ns.socialcaredata.io/<module>`. Keep it the same across versions.
- `version` uses `major.minor.patch`. Change it when you release (see [Versions and diffs](versions.md)).
- Each module has its own short prefix for the shared namespace (`pl`, `sg`, `p`, `ap`, `ref`).

## 2. Classes

```yaml
classes:
  Placement:
    class_uri: pl:Placement
    tree_root: true
    description: >-
      The top-level placement record for a looked-after child.
    slots:
      - placementId
      - childId
      - placementAvailability
```

- Use `tree_root: true` on the top-level class only.
- `is_a: ParentClass` inherits properties. `mixins:` reuses a group of properties.

## 3. Slots (properties)

Define slots once under `slots:`, then list them in classes.

```yaml
slots:
  childId:
    slot_uri: pl:childId
    range: string
    required: true
    description: Identifier unique to each child within the local authority.

  placementAvailability:
    slot_uri: pl:placementAvailability
    range: PlacementAvailability      # a class: links to another object
    required: true

  additionalSupport:
    slot_uri: pl:additionalSupport
    range: SupportType                # an enum: see Vocabularies
    multivalued: true

  placementLocation:
    slot_uri: pl:placementLocation
    range: string
    required: true
    pattern: "^[A-Z]{1,2}[0-9][0-9A-Z]?$"
    annotations:
      sh:message: "Use the first part of a UK postcode (the outward code) in upper case - for example `AB1`."

  totalWeeklyCost:
    slot_uri: pl:totalWeeklyCost
    range: decimal
    minimum_value: 100
    maximum_value: 100000
```

| Key | Use |
| --- | --- |
| `range` | `string`, `integer`, `decimal`, `boolean`, `date`, `datetime`, a class or an enum |
| `required` | `true` if the field must be filled in |
| `multivalued` | `true` if it can hold a list |
| `pattern` | A regular expression the value must match. Add an `sh:message` so the validator shows a helpful error. Don't use `:` in the message text. |
| `minimum_value` / `maximum_value` | Number limits |
| `title` | The JSON field name, when it differs from the slot name |

**Slot names must be unique across all standards.** Every module shares one namespace, so `identifier` in two modules would clash. Give the slot a unique name and keep the field name with `title`:

```yaml
  sgIdentifier:
    slot_uri: sg:identifier
    title: identifier
    range: Identifier
```

If a field means the same thing in several standards, define it once in `common` and import it.

## 4. Update the context

Every new class, slot or code needs an entry in the module's `context.jsonld`, so JSON-LD data maps to the right terms:

```json
"placementId": "pl:placementId",
"siblingCount": { "@id": "pl:siblingCount", "@type": "xsd:nonNegativeInteger" },
"neededBy": { "@id": "pl:neededBy", "@type": "@vocab", "@context": {
  "Today": "pu:Today",
  "< 5 days": "pu:WithinFiveDays"
} }
```

For coded fields, use `"@type": "@vocab"` and map each code to its `meaning`.

## 5. Lint

The **Validate standards** check runs on every pull request that changes `src/_data/model/`. It has three jobs:

| Job | What it checks |
| --- | --- |
| LinkML schemas lint cleanly | LinkML linter rules. Any warning fails the check. |
| No conflicting LinkML slots | The same slot name in two modules, or one `slot_uri` with two ranges |
| Examples conform to the shapes | See [Examples and checks](examples.md) |

The linter rules are in [`.linkmllint.yaml`](../../src/_data/model/.linkmllint.yaml). It uses the `recommended` rules, with camelCase names allowed.

To run the checks on your computer (needs Python 3.11 or later):

```bash
pip install -r src/assets/scripts/requirements.txt
python src/assets/scripts/lint_schemas.py
python src/assets/scripts/check_slot_conflicts.py
```

When a job fails, open **Details** on the pull request. Each error names the file and the class, slot or enum to fix.

## Help

- [LinkML tutorial](https://linkml.io/linkml/intro/tutorial.html)
- LinkML docs: [models](https://linkml.io/linkml/schemas/models.html), [slots](https://linkml.io/linkml/schemas/slots.html), [enums](https://linkml.io/linkml/schemas/enums.html), [constraints](https://linkml.io/linkml/schemas/constraints.html), [imports](https://linkml.io/linkml/schemas/imports.html), [linter](https://linkml.io/linkml/schemas/linter.html)
- [model-management.md](../../src/_data/model/model-management.md): how this project uses LinkML, profiles, and what the shape generator does not cover
