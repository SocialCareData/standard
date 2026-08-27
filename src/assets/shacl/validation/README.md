# SHACL example validator

Standard-agnostic validator. For each registered standard it runs the SHACL
shapes generated from that standard's LinkML schema against the JSON-LD examples
that ship with it, and prints a conformance report per example.

Files named `valid-*.jsonld` are expected to **conform**; `invalid-*.jsonld` are
expected **not** to. Exit code is `0` when every example behaves as expected,
otherwise `1`.

## Usage

```bash
npm install

node validate.js                          # every standard, every profile
node validate.js person                   # one standard, all its profiles
node validate.js person subject-of-care   # one standard, one profile
node validate.js person placements        # several standards
```

## Adding a standard

Standards are declared in the `STANDARDS` registry near the top of
`validate.js`. Each standard points at a folder under `src/assets/model/<dir>`
and lists one or more **profiles**, each pairing a generated SHACL shape file
with an examples sub-folder:

```js
person: {
  label: 'Person',
  dir: 'person',
  profiles: [
    { name: 'subject-of-care', shape: 'person-subject-of-care-shape.ttl', examples: 'examples/person-subject-of-care' },
    { name: 'connected',       shape: 'person-connected-shape.ttl',       examples: 'examples/person-connected' }
  ]
}
```

A standard with a single shape (like Placements) just declares one profile.

### Cross-record checks

Constraints SHACL Core can't express (e.g. duplicate `childId` across the whole
record set) are implemented in the `CROSS_CHECKS` map and referenced by name from
a standard's `crossChecks` array. They run once over all datasets in the
standard.

## Contexts

Each example declares a relative `@context` (e.g. `../../context.jsonld`
for Person, `../context.jsonld` for Placements). The validator inlines it before
converting JSON-LD to RDF, so no network document loader is needed.

## Engine

Uses [`rdf-validate-shacl`](https://www.npmjs.com/package/rdf-validate-shacl).
The same shape files validate identically under any conformant SHACL engine
(e.g. `pyshacl`, Apache Jena `shacl`).
