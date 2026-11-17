# Table view

Each standard has a second page that shows the whole model as tables. It is built entirely from the LinkML model with the `schema_table` tag, so there is almost nothing to write by hand.

## The table page

Name it `PUBxx-<name>-standard-table.md`, next to the standard page. For example, [PUB00-placements-standard-table.md](../../src/_pages/PUB00-placements-standard-table.md):

```markdown
---
layout: publication
title: Children's Social Care Placements Standard Tabular View
tags:
  - Placements
data_model: src/_data/model/placements/placements-standard.yaml
---

<a href="/PUB00_placements_standard" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>

## Data Model

### Placement

{% schema_table page.data_model Placement explain-boolean %}

### PlacementAvailability

{% schema_table page.data_model PlacementAvailability all explain-boolean %}

## Taxonomies

### Placement Urgency Taxonomy

{% schema_table page.data_model neededBy no-label %}
```

Leave out `reference`, `breadcrumbs` and `Publication` tag, so the table page isn't listed as a separate publication.

## schema_table

```text
{% schema_table <model file> <name> [options] %}
```

- `<model file>` is usually `page.data_model`, the path from the front matter.
- `<name>` can be:
  - a class, such as `Placement`: shows its properties
  - a slot with a coded value, such as `neededBy`: shows its vocabulary
  - an enum, such as `PlacementUrgency`: shows the vocabulary

Options can go in any order:

| Option | Effect | Applies to |
| --- | --- | --- |
| `all` | List every value in the Options column. The default is 3, then "…". | Classes |
| a number, such as `5` | List that many values in the Options column | Classes |
| `explain-boolean` | Show "Yes, No" for true/false fields | Classes |
| `expanded` | Show the table open, not under "See vocabulary" | Vocabularies |
| `no-label` | Hide the Label column | Vocabularies |

A class table has these columns: Field name, Cardinality, Data Type, Description, Options. A coded field links to its taxonomy heading if the page has one (see [Vocabularies](vocabularies.md#2-show-it-on-the-page)).

If the name is wrong, the page shows **Schema table error** in place of the table. The build doesn't fail, so check the preview.

## Switch between views

Each page links to the other in its top right corner.

On the standard page:

```html
<a href="/PUB00_placements_standard_table" style="float: right;"><img src="/assets/icon/table-view.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Table View</a>
```

On the table page:

```html
<a href="/PUB00_placements_standard" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>
```

Also add the table view to `other_formats` on the standard page:

```yaml
other_formats:
  - label: Table view
    url: /PUB00_placements_standard_table
```

For an older version, point both links at the `-vN` pages.

## Help

- [Vocabularies](vocabularies.md)
- [Versions and diffs](versions.md): `schema_table_diff`
