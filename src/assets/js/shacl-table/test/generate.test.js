'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { generateTable } = require('../lib/generate')

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..')
const SHACL = 'src/assets/shacl/shacl-shape.ttl'

test('integration: PlacementAvailability against the real SHACL file', () => {
  const md = generateTable({ shaclPath: SHACL, entity: 'PlacementAvailability', rootDir: REPO_ROOT })

  // Header present.
  assert.match(md, /\| Field name \| Cardinality \| Data Type \| Description \| Options \|/)
  // Controlled vocabulary -> Categorical + taxonomy link with examples.
  assert.match(md, /\| `neededBy` \| 1\.\.1 \| Categorical \|/)
  assert.match(md, /\[Placement Urgency Taxonomy\]\(#placement-urgency-taxonomy\): Today, Within 5 days, More than 5 days/)
  // >3 concepts gets an ellipsis.
  assert.match(md, /\[Out of LA Reason Taxonomy\]\(#out-of-la-reason-taxonomy\): Safeguarding concerns, Bail conditions, Court order …/)
  // Ontology-sourced description reached the Description column.
  assert.match(md, /Captures urgency rather than an absolute date/)
})

test('integration: Placement links sub-entities in the Data Type column', () => {
  const md = generateTable({ shaclPath: SHACL, entity: 'Placement', rootDir: REPO_ROOT })
  assert.match(md, /\| `placementAvailability` \| 1\.\.1 \| \[PlacementAvailability\]\(#placementavailability\) \|/)
  assert.match(md, /\| `actualPlacement` \| 0\.\.1 \| \[ActualPlacement\]\(#actualplacement\) \|/)
})

test('integration: ActualPlacement merges the duplicated cost properties', () => {
  const md = generateTable({ shaclPath: SHACL, entity: 'ActualPlacement', rootDir: REPO_ROOT })
  // `totalWeeklyCost` is declared twice (datatype + warning range) -> one row.
  const rows = md.split('\n').filter(l => l.includes('`totalWeeklyCost`'))
  assert.equal(rows.length, 1)
  assert.match(rows[0], /\| 1\.\.1 \| Decimal \|/)
})

test('throws a helpful error for an unknown entity', () => {
  assert.throws(
    () => generateTable({ shaclPath: SHACL, entity: 'Nope', rootDir: REPO_ROOT }),
    /No sh:NodeShape with sh:targetClass matching "Nope"/
  )
})

test('tolerates an unparseable companion file, warning instead of throwing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'shacl-table-'))
  const shaclDir = path.join(dir, 'shacl')
  const ttlDir = path.join(dir, 'ttl')
  fs.mkdirSync(shaclDir)
  fs.mkdirSync(ttlDir)

  fs.writeFileSync(path.join(shaclDir, 's.ttl'), `
@prefix sh:  <http://www.w3.org/ns/shacl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex:  <https://example.org/> .
ex:TShape a sh:NodeShape ; sh:targetClass ex:T ;
    sh:property [ sh:path ex:n ; sh:datatype xsd:string ; sh:minCount 1 ; sh:maxCount 1 ] .
`)
  fs.writeFileSync(path.join(ttlDir, 'broken.ttl'), 'this is not <valid turtle @@@')

  const warnings = []
  const md = generateTable({
    shaclPath: 'shacl/s.ttl',
    entity: 'T',
    rootDir: dir,
    onWarn: m => warnings.push(m)
  })

  assert.match(md, /\| `n` \| 1\.\.1 \| String \|/)
  assert.equal(warnings.length, 1)
  assert.match(warnings[0], /skipping unparseable companion broken\.ttl/)

  fs.rmSync(dir, { recursive: true, force: true })
})
