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

test('integration: a controlled-vocabulary property renders a vocabulary table', () => {
  const md = generateTable({ shaclPath: SHACL, entity: 'communicationNeeds', rootDir: REPO_ROOT })

  // Wrapped in a collapsible details/summary element.
  assert.match(md, /^<details>\n<summary markdown="span">See vocabulary<\/summary>/)
  assert.match(md, /<\/details>$/)
  // Two-column Code / Description header.
  assert.match(md, /\| Code \| Description \|/)
  // Concepts come from the presence-status taxonomy, in sh:in order, with
  // skos:notation as the code and skos:definition as the description.
  const codes = md.split('\n').filter(l => /^\| `/.test(l))
  assert.deepEqual(codes, [
    '| `yes` | Affirmative. |',
    '| `no` | Negative. |',
    '| `not-specified` | Not specified. |'
  ])
  // Styled to match the other vocabulary tables on the site.
  assert.match(md, /\{: \.table-bordered\}/)
  // ...and NOT the property-table class.
  assert.doesNotMatch(md, /\.shacl-table/)
})

test('integration: property table keeps its .shacl-table IAL', () => {
  const md = generateTable({ shaclPath: SHACL, entity: 'PlacementRequirements', rootDir: REPO_ROOT })
  assert.match(md, /\n\{: \.shacl-table\}$/)
})

test('integration: Options links present taxonomies and inlines absent ones', () => {
  // The placements tabular page has a "Communication Need Taxonomy" section but
  // no "Yes / No / Not Specified" one, so those two properties must differ.
  const md = generateTable({
    shaclPath: SHACL,
    entity: 'PlacementRequirements',
    rootDir: REPO_ROOT,
    pageHeadings: ['Communication Need Taxonomy']
  })
  const row = name => md.split('\n').find(l => l.includes(`\`${name}\``))

  // Section present -> linked preview (unchanged behaviour).
  assert.match(row('specificCommunicationRequirement'), /\[Communication Need Taxonomy\]\(#communication-need-taxonomy\): ESOL, BSL, Makaton …/)
  // Section absent -> every value listed inline, no link, no ellipsis.
  assert.match(row('communicationNeeds'), /\| Yes, No, Not specified \|$/)
  assert.doesNotMatch(row('communicationNeeds'), /\]\(#/)
})

test('integration: with no page headings every taxonomy is linked', () => {
  const md = generateTable({
    shaclPath: SHACL,
    entity: 'PlacementRequirements',
    rootDir: REPO_ROOT,
    pageHeadings: []
  })
  const row = name => md.split('\n').find(l => l.includes(`\`${name}\``))
  // Empty headings means "page context known, no sections" -> all inline.
  assert.match(row('specificCommunicationRequirement'), /\| ESOL, BSL, Makaton, Other, None \|$/)
  assert.doesNotMatch(row('communicationNeeds'), /\]\(#/)
})

test('throws a helpful error for an unknown entity or property', () => {
  assert.throws(
    () => generateTable({ shaclPath: SHACL, entity: 'Nope', rootDir: REPO_ROOT }),
    /no controlled-vocabulary property, matching "Nope"/
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
