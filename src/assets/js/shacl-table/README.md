# shacl-table

Generate a Markdown table from a [LinkML](https://linkml.io/) data model. The
tool inspects the second argument and produces one of two tables:

- **Class table** — when the argument names a **class**, a table of that class's
  properties (slots).
- **Vocabulary table** — when the argument names a **property** (a slot whose
  range is an enum) or an **enum**, a two-column **Code** / **Description** table
  wrapped in a collapsible `<details>`/`<summary>` element.

> Despite the name, this tool no longer reads SHACL. It reads the LinkML model
> at `src/assets/model/placements/placements.yaml`, which is the single source
> of truth (the SHACL and OWL are generated from it). The Liquid tag and folder
> keep the `shacl_table` / `shacl-table` names for continuity.

## Class table

Describes a class's slots, in declared order. Five columns:

| Column | Source (LinkML) |
| --- | --- |
| **Field name** | the slot name |
| **Cardinality** | `min..max` where min = `required ? 1 : 0`, max = `multivalued ? * : 1` |
| **Data Type** | for a type-ranged slot, a friendly label (`String` / `Date` / `Boolean` / `Integer` / `Decimal`, resolved via the type's `xsd` uri); `Categorical` when the range is an enum; a link to another class when the range is a class |
| **Description** | the slot's `description` |
| **Options** | for an enum-ranged slot, a link to the taxonomy section plus up to three example labels — **but** if that section is not present on the page being rendered, every possible value is listed inline (no dangling link) |

The Options column is page-aware: the Jekyll plugin passes the page's headings
to the generator (`--page-headings`), and a taxonomy is only linked when the
page actually has a matching section (the enum's `title` + " Taxonomy" →
e.g. `#communication-need-taxonomy`). From the command line no headings are
supplied, so every taxonomy is linked.

## Vocabulary table

Describes an enum's permissible values, in declared order. Two columns, inside a
collapsible `<details>` element:

| Column | Source (LinkML) |
| --- | --- |
| **Code** | the permissible value's `notation` annotation (the lowercase code, e.g. `with-other-children`), falling back to its name |
| **Description** | the permissible value's `description`, falling back to its `title` |

The taxonomy section title/anchor and the friendly value labels shown in the
Options column come from the enum's `title` and each permissible value's
`title` (the SKOS `prefLabel`s carried in the model).

## Usage in a page (Jekyll)

The `{% shacl_table %}` Liquid tag (see `src/_plugins/shacl_table.rb`) renders
the table at build time, so it ends up as a real `<table>` in the compiled site
and is indexed by Pagefind. Place the tag on its own line:

```liquid
{% shacl_table src/assets/model/placements/placements.yaml PlacementAvailability %}
{% shacl_table src/assets/model/placements/placements.yaml communicationNeeds %}
```

Arguments: the LinkML YAML path (relative to the project root) and either a
class name (class table) or a controlled-vocabulary property/enum name
(vocabulary table).

## Usage from the command line

```bash
node src/assets/js/shacl-table/index.js src/assets/model/placements/placements.yaml PlacementAvailability
node src/assets/js/shacl-table/index.js src/assets/model/placements/placements.yaml communicationNeeds
```

## Layout

```
lib/
  linkml.js    load the YAML model; class/slot/enum lookups, range classification, type->xsd
  format.js    pure formatters: slugs, cardinality, datatype labels
  model.js     model -> property rows; Options + vocabulary (concept) resolution
  table.js     rows -> Markdown property table; concepts -> vocabulary table
  generate.js  orchestration (load model, classify entity, render)
index.js       CLI entry point
test/          node:test unit + integration suites
```

## Tests

```bash
cd src/assets/js/shacl-table
npm install
npm test
```
