# Standard page: front matter and layout

Standard pages live in `src/_pages/` and are named `PUBxx-<name>-standard.md`.

## Front matter

```yaml
---
layout: publication
title: Children's Social Care Placements Standard
description: One sentence, shown on the Publications page and in link previews.
breadcrumbs:
  - Publications
tags:
  - Placements
  - Publication
reference: PUB00
version: latest
status: draft
data_model: src/_data/model/placements/placements-standard.yaml
editors:
  - name: Jane Smith
    organisation: Open Data Institute
other_formats:
  - label: Table view
    url: /PUB00_placements_standard_table
  - label: Ontology
    url: https://github.com/SocialCareData/ontology/blob/main/placements/placements-standard.ttl
  - label: SHACL
    url: https://github.com/SocialCareData/ontology/blob/main/placements/placements-standard-shape.ttl
changelog:
  - Added placementSource property
data_model_diff: /PUB00_placements_standard_diff_v1_v2
non_technical_summary: |
  A few paragraphs in plain English. Markdown works here.
---
```

| Field | Required | What it does |
| --- | --- | --- |
| `layout` | Yes | Always `publication`. Adds the metadata box, table of contents and numbered headings. |
| `title` | Yes | Page heading. |
| `description` | Yes | Summary on the [Publications](https://standard.socialcaredata.io/publications) page. |
| `breadcrumbs` | Yes | Must be `Publications`, or the page won't be listed on the Publications page. |
| `tags` | Yes | Include `Publication` plus the programme or topic tags. |
| `reference` | Yes | `PUBxx`. Groups all versions of the standard together and turns on the metadata box. |
| `version` | No | `latest` on the current page, a number (`1`, `2`) on older ones. Only `latest` (or no version) is listed on the Publications page. |
| `version_number` | No | Version shown in the metadata box. If left out, the `version:` in the LinkML model file is used. |
| `status` | No | For example `draft`. Kept for reference; not shown on the page. |
| `data_model` | Yes | Path to the LinkML file, from the project root. Used by `schema_table` and for the version. |
| `editors` | Yes | `name` and `organisation` for each editor. |
| `other_formats` | No | Links shown in the metadata box: table view, ontology, SHACL. |
| `changelog` | No | List of changes in this version. Shown by `{% include changelog.html %}`. |
| `data_model_diff` | No | URL of the diff page. Adds "Previous version" and "View changes" links. See [Versions and diffs](versions.md). |
| `non_technical_summary` | No | Plain-English summary shown in a collapsible box at the top. |
| `related` | No | Page URLs to show first in "Related pages", for example `- /PUB01_person_standard`. |

The general fields (`related`, `related_pages`, and so on) work the same as for articles: see [Add an article](../add-an-article.md#front-matter-fields).

## Page layout

Use these sections, in this order. Leave out any that don't apply.

```markdown
<a href="/PUB00_placements_standard_table" style="float: right;"><img src="/assets/icon/table-view.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Table View</a>

## Introduction

## Data Model

(diagram, then a short paragraph on how the classes fit together)

### Placement

(one sentence on what the class is)

#### Properties

#### Example

### PlacementAvailability

...

## Ontology

## Taxonomies

## Validation

## Report an issue

{% include report-issue.html %}

## Changelog

{% include changelog.html %}
```

The first line is the link to the table view. See [Table view](table-view.md#switch-between-views).

## Properties

Write each property as a definition list. The `<span id>` gives it a link target, in the form `class-property`.

```markdown
<span id="availability-siblingCount">siblingCount</span>
: How many siblings should the child be placed together with? _Integer_.

<span id="availability-neededBy">neededBy</span>
: By when does the child need to be placed? See the [Placement Urgency Taxonomy](#placement-urgency-taxonomy).

<span id="placement-riskAssessment">riskAssessment</span>
: The risk assessment for the child. See [RiskAssessment](#riskassessment).
```

- Put the data type in italics at the end: `_String_`, `_Integer_`, `_Boolean_`, `_Date_`.
- For a coded field, link to its taxonomy section. Don't list every value here.
- For a link to another class, use `#` and the class name in lower case.
- Say if a property is optional or multi-valued.

The descriptions should match the `description` in the LinkML model.

## Examples

Put a JSON example under each class:

````markdown
#### Example

<div class="example">
  <h5 id="example-availability">Example - PlacementAvailability</h5>
{% highlight json %}
{
  "@type": "PlacementAvailability",
  "neededBy": "< 5 days",
  "siblingCount": 2
}
{% endhighlight %}
</div>
````

Take the values from the files in `src/_data/model/examples/`, so the page shows data that is known to pass validation. See [Examples and checks](examples.md).

## Other sections

- **Ontology**: link to the release, for example `[placements-standard.ttl](https://github.com/SocialCareData/ontology/releases/latest)`.
- **Taxonomies**: one subsection per vocabulary. See [Vocabularies](vocabularies.md).
- **Validation**: what the SHACL shape checks, a link to [/validator](https://standard.socialcaredata.io/validator) and the `npx` command. Copy this section from PUB00 and change the shape name.
- **Report an issue** and **Changelog**: keep the two includes as they are.

## Help

- [Add an article](../add-an-article.md): Markdown basics for this site
- Real pages to copy from: [PUB00](../../src/_pages/PUB00-placements-standard.md), [PUB01](../../src/_pages/PUB01-person-standard.md), [PUB02](../../src/_pages/PUB02-safeguarding-standard.md)
