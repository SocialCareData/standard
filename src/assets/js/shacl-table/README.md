# shacl-table

Generate a Markdown table describing the **first-level properties** of a SHACL
entity (a `sh:NodeShape`'s `sh:targetClass`).

The table has five columns:

| Column | Source |
| --- | --- |
| **Field name** | local name of the property's `sh:path` |
| **Cardinality** | `sh:minCount` / `sh:maxCount` as `min..max` (`*` = unbounded) |
| **Data Type** | `String` / `Date` / `Boolean` / `Integer` / `Decimal` from `sh:datatype`; `Categorical` when the values come from a controlled vocabulary (`sh:in`); or a link to another entity when typed with `sh:class` |
| **Description** | the property's `rdfs:comment` (from a companion ontology), falling back to `sh:description` then `sh:message` |
| **Options** | for a controlled vocabulary, a link to the taxonomy section plus up to three example labels |

## Usage in a page (Jekyll)

The `{% shacl_table %}` Liquid tag (see `src/_plugins/shacl_table.rb`) renders
the table at build time, so it ends up as a real `<table>` in the compiled
site and is indexed by Pagefind. Place the tag on its own line:

```liquid
{% shacl_table src/assets/shacl/shacl-shape.ttl PlacementAvailability %}
```

Arguments: the SHACL file path (relative to the project root) and the
`targetClass` local name (or full IRI). Call it as many times as you like — once
per entity.

## Usage from the command line

```bash
node src/assets/js/shacl-table/index.js src/assets/shacl/shacl-shape.ttl PlacementAvailability
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
  model.js     graph -> property rows + taxonomy (Options) resolution
  table.js     property rows -> Markdown table
  generate.js  orchestration (load files, extract, render)
index.js       CLI entry point
test/          node:test unit + integration suites
```

## Tests

```bash
cd src/assets/js/shacl-table
npm install
npm test
```
