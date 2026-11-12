# Versions and diffs

When a standard changes in a way that affects people already using it, keep the old version online and publish a new one with a page that shows what changed. Placements v1 and v2 are the working example.

## Files for each version

| File | What it is |
| --- | --- |
| `PUB00-placements-standard.md` | Latest version. No suffix. |
| `PUB00-placements-standard-table.md` | Latest table view |
| `PUB00-placements-standard-v1.md` | Version 1, frozen |
| `PUB00-placements-standard-table-v1.md` | Version 1 table view |
| `PUB00-placements-standard-diff-v1-v2.md` | What changed from v1 to v2 |
| `placements-standard.yaml` | Latest model |
| `placements-standard-v1.yaml` | Version 1 model, frozen |

The latest page always keeps the same name and URL, so links to it don't break.

## When to make a new version

New version: Major releases that are removing or renaming a field, a class or a code; making an optional field required; changing a field's type.

No new version needed: fixing descriptions, adding optional fields or codes. Add a `changelog` line and bump the patch or minor number in the model's `version:`.

## Steps

Say the current version is 2 and you are starting version 3.

1. **Freeze the model.** Copy `placements-standard.yaml` to `placements-standard-v2.yaml`. Don't change the `id`.
2. **Freeze the page.** Copy `PUB00-placements-standard.md` to `PUB00-placements-standard-v2.md` and change:

    ```yaml
    version: 2
    data_model: src/_data/model/placements/placements-standard-v2.yaml
    other_formats:
      - label: Table view
        url: /PUB00_placements_standard_table_v2
    ```

    Also change the "Table View" link at the top to `/PUB00_placements_standard_table_v2`. With a number in `version`, the page drops off the Publications list but stays reachable from the latest page.
3. **Freeze the table view.** Copy the table page to `PUB00-placements-standard-table-v2.md`. Point `data_model` at the frozen model and the "Standard View" link at `/PUB00_placements_standard_v2`.
4. **Make your changes** to the latest model and page.
5. **Bump the version** in `placements-standard.yaml`, for example `version: 3.0.0`.
6. **Add a diff page**, `PUB00-placements-standard-diff-v2-v3.md` (see below).
7. **Update the latest page's front matter:**

    ```yaml
    version: latest
    data_model_diff: /PUB00_placements_standard_diff_v2_v3
    changelog:
      - Removed the free-text risk fields
      - Added placementSource
    ```

The `changelog` list belongs to the version it describes. The old page keeps its own list, and `{% include changelog.html %}` shows them all, grouped by version.

## Diff page

Copy [PUB00-placements-standard-diff-v1-v2.md](../../src/_pages/PUB00-placements-standard-diff-v1-v2.md) and change the two URLs:

```markdown
---
layout: publication
title: Children's Social Care Placements Standard Data Model Changes Between v2 and v3
tags:
  - Placements
current_spec: /PUB00_placements_standard
previous_spec: /PUB00_placements_standard_v2
---

{% assign current_page = site.pages | where: "url", page.current_spec | first %}
{% assign previous_page = site.pages | where: "url", page.previous_spec | first %}
{% assign current = current_page.data_model %}
{% assign previous = previous_page.data_model %}

## Data Model

### Placement

{% schema_table_diff current previous Placement explain-boolean %}

## Taxonomies

### Placement Urgency Taxonomy

{% schema_table_diff current previous neededBy no-label %}
```

- Keep the `{% assign %}` lines as they are. They read each page's `data_model`.
- Add one `schema_table_diff` per class and per vocabulary, in the same order as the table view.
- `schema_table_diff` only supports `no-label` and `explain-boolean`. Other options are ignored.
- Added rows show in green, removed rows in red, changed values as old → new.
- Each table with changes gets a "Raise an issue about this change" button.
- Under a table, add a line explaining why it changed and link the issue, for example `* Removed the free-text fields to mitigate privacy risks. [Issue #19](https://github.com/SocialCareData/standard/issues/19)`.

## Release

A new model version is only in the ontology once it is pinned in `manifest.yaml` and released. See [Release the ontology](release-ontology.md).

Older versions stay in the ontology repo as `placements-standard-v1.ttl` and so on, so set the old page's `other_formats` to those files.

## Help

- [Semantic Versioning](https://semver.org/)
