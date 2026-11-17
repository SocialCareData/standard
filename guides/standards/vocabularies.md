# Vocabularies (taxonomies)

A vocabulary is a fixed list of codes a field can take, such as placement urgency or ethnicity. It is defined once in the LinkML model, and the page reads it from there.

## 1. Define it in the model

Add an enum under `enums:` in the model file:

```yaml
enums:
  PlacementUrgency:
    enum_uri: pl:placement-urgency
    title: Placement Urgency
    description: Controlled vocabulary for the urgency of a placement request.
    permissible_values:
      Today:
        title: Today
        meaning: pu:Today
        description: Placement is needed today.
      "< 5 days":
        title: Within 5 days
        meaning: pu:WithinFiveDays
        description: Placement is needed within five days.
```

- The key (`Today`, `"< 5 days"`) is the code used in the data.
- `title` is the label people see. `description` is the definition.
- `meaning` is the concept's identifier. Add a prefix for the vocabulary under `prefixes:`, for example `pu: https://ns.socialcaredata.io/placement-urgency#`.
- Put quotes around codes that contain spaces or symbols, or that YAML could read as something else: `"No"`, `"Yes"`, `"-8"`, `"< 5 days"`.
- For a hierarchy, use dotted codes, for example `accommodation-status.owner-occupier`. The table shows them nested.

Then use the enum as the `range` of a slot:

```yaml
  neededBy:
    slot_uri: pl:neededBy
    range: PlacementUrgency
    required: true
```

Add the codes to the module's `context.jsonld` too. See [LinkML model](linkml-model.md#4-update-the-context).

## 2. Show it on the page

Under `## Taxonomies`, add one subsection per vocabulary:

```markdown
### Placement Urgency Taxonomy

How urgently the child needs to be placed.

{% schema_table page.data_model neededBy expanded no-label %}

Used by `neededBy` on [PlacementAvailability](#placementavailability).
```

- You can pass the slot name (`neededBy`) or the enum name (`PlacementUrgency`).
- `expanded` shows the table open. Leave it out to show it collapsed under "See vocabulary".
- `no-label` hides the Label column. Use it when the codes and labels are the same.

Name the heading exactly `<enum title> Taxonomy`. If the enum title already ends in "Taxonomy" or "Vocabulary", use the title as it is. The table view links each coded field to this heading, but only if the text matches.

## Use schema_table, not hand-written tables

Don't copy codes into a Markdown table. With `schema_table`:

- the page always matches the model
- the table view and the diff page pick up changes on their own
- there is one place to fix a typo

The only exception is a code system the standard uses but does not define, such as HL7 `ParticipationType` in the [Safeguarding standard](../../src/_pages/PUB02-safeguarding-standard.md). For those, link to the source and show a few codes as examples:

```markdown
| Code | Display |
| :--- | :--- |
| `SBJ` | Subject |
| `WIT` | Witness |
{:.table-bordered}
```

## Reuse before you create

Before adding a new vocabulary, check:

- `src/_data/model/common/common.yaml`, for vocabularies shared across standards
- existing national code lists (NHS Data Dictionary, ONS, FHIR, HL7)

If an external list fits, align with it and say so in the section text, for example "Aligned with the FHIR `name-use` value set."

## Help

- [LinkML: enums](https://linkml.io/linkml/schemas/enums.html)
- [Table view](table-view.md): all the `schema_table` options
