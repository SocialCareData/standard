# shacl-table

Generate a Markdown table for a SHACL entity. The tool inspects the second
argument and produces one of two tables:

- **Class table** — when the argument names a `sh:targetClass`, a table of that
  class's **first-level properties**.
- **Vocabulary table** — when the argument names a **property** whose values come
  from a controlled vocabulary (`sh:in`), a two-column **Code** / **Description**
  table wrapped in a collapsible `<details>`/`<summary>` element.

## Class table

Describes the first-level properties of a SHACL entity (a `sh:NodeShape`'s
`sh:targetClass`). It has five columns:

| Column | Source |
| --- | --- |
| **Field name** | local name of the property's `sh:path` |
| **Cardinality** | `sh:minCount` / `sh:maxCount` as `min..max` (`*` = unbounded) |
| **Data Type** | `String` / `Date` / `Boolean` / `Integer` / `Decimal` from `sh:datatype`; `Categorical` when the values come from a controlled vocabulary (`sh:in`); or a link to another entity when typed with `sh:class` |
| **Description** | the property's `rdfs:comment` (from a companion ontology), falling back to `sh:description` then `sh:message` |
| **Options** | for a controlled vocabulary, a link to the taxonomy section plus up to three example labels — **but** if that section is not present on the page being rendered, every possible value is listed inline instead (no dangling link) |

The Options column is page-aware: the Jekyll plugin passes the page's headings
to the generator (`--page-headings`), and a taxonomy is only linked when the
page actually has a matching section (e.g. `### Communication Need Taxonomy` →
`#communication-need-taxonomy`). From the command line no headings are supplied,
so every taxonomy is linked.

## Vocabulary table

Describes the concepts of the controlled vocabulary a property draws its values
from (its `sh:in` list). It has two columns and lives inside a collapsible
`<details>` element:

| Column | Source |
| --- | --- |
| **Code** | the concept's `skos:notation`, falling back to its local name |
| **Description** | the concept's `skos:definition`, falling back to `skos:prefLabel` |

Concepts appear in the order they are listed in `sh:in`. The scheme is
discovered from the companion taxonomy files (see [How enrichment
works](#how-enrichment-works)).

## Usage in a page (Jekyll)

The `{% shacl_table %}` Liquid tag (see `src/_plugins/shacl_table.rb`) renders
the table at build time, so it ends up as a real `<table>` in the compiled
site and is indexed by Pagefind. Place the tag on its own line:

```liquid
{% shacl_table src/assets/shacl/shacl-shape.ttl PlacementAvailability %}
{% shacl_table src/assets/shacl/shacl-shape.ttl communicationNeeds %}
```

Arguments: the SHACL file path (relative to the project root) and either a
`targetClass` local name (class table) or a controlled-vocabulary property name
(vocabulary table) — a full IRI works for either. Call it as many times as you
like.

## Usage from the command line

```bash
node src/assets/js/shacl-table/index.js src/assets/shacl/shacl-shape.ttl PlacementAvailability
node src/assets/js/shacl-table/index.js src/assets/shacl/shacl-shape.ttl communicationNeeds
```

## How enrichment works

Descriptions and controlled-vocabulary labels come from companion Turtle files.
By convention these live in a sibling `ttl/` directory next to the SHACL file
(e.g. `src/assets/ttl/`): SKOS taxonomies supply concept `skos:prefLabel`s and
the scheme title for the Options column, and OWL ontologies supply property
`rdfs:comment` descriptions. A companion file that fails to parse is skipped
with a warning rather than breaking the build. Override the directory with
`--enrich-dir <dir>`.

## Layout

```
lib/
  rdf.js       namespaces, IRI helpers, Turtle parsing, N3 store queries
  format.js    pure formatters: slugs, cardinality, datatype labels
  model.js     graph -> property rows, Options + vocabulary (concept) resolution
  table.js     property rows -> Markdown table; sh:in list -> vocabulary table
  generate.js  orchestration (load files, classify entity, extract, render)
index.js       CLI entry point
test/          node:test unit + integration suites
```

## Tests

```bash
cd src/assets/js/shacl-table
npm install
npm test
```
