# SHACL validator (multi-standard)

Runs SHACL shapes against JSON-LD examples and prints a conformance report
for each. The validator is driven by a small registry inside `validate.js`,
so the same script handles every standard in this repo.

## Usage

```bash
npm install

# Validate one named standard (default: all registered)
node validate.js --standard=placements
node validate.js --standard=person

# Validate every registered standard in sequence
node validate.js

# Validate a single file against a chosen standard
node validate.js --standard=person ../examples/person/valid-person.jsonld
```

Exit code is `0` if every example behaves as expected — files named
`valid-*.jsonld` MUST conform and files named `invalid-*.jsonld` MUST NOT
conform — otherwise `1`.

## Registered standards

| Name | Shape file | Examples directory |
| :--- | :--- | :--- |
| `placements` | `../placements-shacl-shape.ttl` | `../examples/placement/` |
| `person`     | `../person-shacl-shape.ttl`     | `../examples/person/`    |

## Adding a new standard

1. Drop the new files in place:
   - `src/assets/shacl/<name>-shacl-shape.ttl`
   - `src/assets/shacl/<name>-context.jsonld`
   - `src/assets/shacl/examples/<entity>/*.jsonld`
   - `src/assets/ttl/<name>/ontology.ttl` (+ component and taxonomy files)
2. Register an entry in the `STANDARDS` object at the top of `validate.js`:
   ```js
   <name>: {
     shapeFile:   path.resolve(SHACL_DIR, '<name>-shacl-shape.ttl'),
     examplesDir: path.resolve(SHACL_DIR, 'examples/<entity>'),
     crossRecordChecks: [ /* optional cross-record uniqueness checks */ ],
   }
   ```
   Use the helper `makeDuplicatePropertyCheck(iri, label)` for a simple
   single-property uniqueness check, or write a `(allDatasets) => boolean`
   function for anything more complex.
3. Run `node validate.js --standard=<name>` and iterate until the
   `valid-*` examples conform and the `invalid-*` ones don't.

## What the shapes check

The SHACL shapes encode the cardinality, datatype and controlled-vocabulary
restrictions documented in each standard's specification page under
`src/_pages/<name>-standard.md`. Cross-record uniqueness rules that SHACL
Core can't express (duplicate `childId` in placements, duplicate
`(system, value)` Identifier in person) are implemented in JavaScript at the
bottom of `validate.js`.

## Engine

Uses [`rdf-validate-shacl`](https://www.npmjs.com/package/rdf-validate-shacl).
The same shape file should validate identically under any conformant SHACL
engine (e.g. `pyshacl`, Apache Jena `shacl`).
