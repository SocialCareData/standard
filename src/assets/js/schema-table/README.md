# schema-table

Generate a Markdown table from a [LinkML](https://linkml.io/) data model. The
tool inspects the second argument and produces one of two tables:

- **Class table** — when the argument names a **class**, a table of that class's
  properties (slots).
- **Vocabulary table** — when the argument names a **property** (a slot whose
  range is an enum) or an **enum**, a two-column **Code** / **Description** table
  wrapped in a collapsible `<details>`/`<summary>` element.

## Imports

A model's local `imports:` are resolved and merged before rendering, so a table
can be generated from a schema that inherits its slots, enums and sub-entity
classes from a shared core. Non-local imports (e.g. `linkml:types`) are ignored;
the importing schema's own definitions override imported ones of the same name.
This is what lets the Person profiles (e.g. `person-subject-of-care.yaml`, which
imports `person-standard.yaml` and redefines only `Person`) render complete
tables with the profile's cardinalities.

## Class table

Describes a class's slots, in declared order. Five columns:

| Column | Source (LinkML) |
| --- | --- |
| **Field name** | the slot's `title` when set, else the slot name (a `title` lets the displayed key differ from the internal slot name — e.g. two `use` slots that map to distinct enums) |
| **Cardinality** | `min..max` where min = `required ? 1 : 0`, max = `multivalued ? * : 1` |
| **Data Type** | for a type-ranged slot, a friendly label (`String` / `Date` / `Boolean` / `Integer` / `Decimal`, resolved via the type's `xsd` uri); `Categorical` when the range is an enum; a link to another class when the range is a class |
| **Description** | the slot's `description` |
| **Options** | for an enum-ranged slot, a link to the taxonomy section plus a preview of example labels (default 3) — **but** if that section is not present on the page being rendered, every possible value is listed inline (no dangling link) |

The Options column is page-aware: the Jekyll plugin passes the page's headings
to the generator (`--page-headings`), and a taxonomy is only linked when the
page actually has a matching section (the enum's `title` + " Taxonomy" →
e.g. `#communication-need-taxonomy`). From the command line no headings are
supplied, so every taxonomy is linked.

**How many previews:** the number of example values shown in the Options column
is configurable (default `3`). Pass an integer, or `all` to show every value
with no trailing ellipsis:

- CLI: `--options-limit <n|all>` (e.g. `--options-limit 5`, `--options-limit all`).
- Jekyll tag: an optional third argument, e.g.
  `{% schema_table page.data_model Person all %}` or
  `{% schema_table page.data_model Person 5 %}`.

An unlinked Options cell (no matching section on the page) always lists every
value, regardless of this setting.

## Vocabulary table

Describes an enum's permissible values, in declared order. Three columns, inside
a collapsible `<details>` element:

| Column | Source (LinkML) |
| --- | --- |
| **Code** | the permissible value's **name** (its key) — the SKOS-style notation used as the value in data, e.g. `1`, `usual`, `MTH` |
| **Label** | the permissible value's `title` |
| **Definition** | the permissible value's `description` |

So the code lives in the schema itself: set each permissible value's key to the
data code, its `title` to the human label, and (optionally) its `meaning` to the
concept IRI. The taxonomy section title/anchor comes from the enum's `title`; the
value labels shown in the Options column come from each permissible value's
`title`.

## Diff table

With `--previous <file>`, the tool compares the current model against a previous
one and emits a Markdown table whose cell contents carry inline HTML for the diff
colours:

- **added** — a property/enum value present only in the current model → green text.
- **removed** — present only in the previous model → red, struck-through text.
- **changed** — a cell whose value differs → old value struck through beside the
  new (`<del class="diff-old">…</del> <ins class="diff-new">…</ins>`).

Properties are matched by name and enum values by code; ordering follows the
current version, with removed entries slotted back in after their previous
predecessor. Class and vocabulary entities are resolved exactly as for the plain
tables. Because it is a Markdown table, kramdown builds the `<table>` (styled
like the plain tables) — but Markdown cannot class a `<td>`/`<tr>`, so only the
text is coloured, not the cell background. In a page use the
`{% schema_table_diff %}` tag (see `src/_plugins/schema_table_diff.rb`):

```liquid
{% schema_table_diff current.yaml previous.yaml PlacementAvailability %}
```

## Usage in a page (Jekyll)

The `{% schema_table %}` Liquid tag (see `src/_plugins/schema_table.rb`) renders
the table at build time, so it ends up as a real `<table>` in the compiled site
and is indexed by Pagefind. Place the tag on its own line:

```liquid
{% schema_table src/assets/model/placements/placements.yaml PlacementAvailability %}
{% schema_table src/assets/model/placements/placements.yaml communicationNeeds %}
```

Arguments: the LinkML YAML path (relative to the project root) and either a
class name (class table) or a controlled-vocabulary property/enum name
(vocabulary table).

## Usage from the command line

```bash
node src/assets/js/schema-table/index.js src/assets/model/placements/placements.yaml PlacementAvailability
node src/assets/js/schema-table/index.js src/assets/model/placements/placements.yaml communicationNeeds
# diff two versions:
node src/assets/js/schema-table/index.js src/assets/model/placements/placements-standard-01.yaml RiskAssessment \
  --previous src/assets/model/placements/placements-standard.yaml
```

## Layout

```
lib/
  linkml.js    load the YAML model; class/slot/enum lookups, range classification, type->xsd
  format.js    pure formatters: slugs, cardinality, datatype labels
  model.js     model -> property rows; Options + vocabulary (concept) resolution
  table.js     rows -> Markdown property table; concepts -> vocabulary table
  diff.js      diff two model versions -> HTML property/vocabulary diff table
  generate.js  orchestration (load model, classify entity, render)
index.js       CLI entry point
test/          node:test unit + integration suites
```

## Tests

```bash
cd src/assets/js/schema-table
npm install
npm test
```
