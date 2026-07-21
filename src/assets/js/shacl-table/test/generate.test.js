'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const { generateTable } = require('../lib/generate')

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..')
const MODEL = 'src/assets/model/placements/placements.yaml'

test('integration: PlacementRequirements property table against the real model', () => {
  const md = generateTable({ modelPath: MODEL, entity: 'PlacementRequirements', rootDir: REPO_ROOT })

  assert.match(md, /\| Field name \| Cardinality \| Data Type \| Description \| Options \|/)
  // enum-ranged slot -> Categorical + taxonomy link (no page headings => always linked)
  assert.match(md, /\| `communicationNeeds` \| 1\.\.1 \| Categorical \|/)
  assert.match(md, /\[Communication Need Taxonomy\]\(#communication-need-taxonomy\): ESOL, BSL, Makaton …/)
  // required multivalued -> 1..*
  assert.match(md, /\| `specificCommunicationRequirement` \| 1\.\.\* \| Categorical \|/)
  // datatype slot
  assert.match(md, /\| `homeAdaptationRequired` \| 0\.\.1 \| Boolean \|/)
  // property table keeps its class IAL
  assert.match(md, /\n\{: \.shacl-table\}$/)
})

test('integration: Placement links sub-entities in the Data Type column', () => {
  const md = generateTable({ modelPath: MODEL, entity: 'Placement', rootDir: REPO_ROOT })
  assert.match(md, /\| `placementAvailability` \| 1\.\.1 \| \[PlacementAvailability\]\(#placementavailability\) \|/)
  assert.match(md, /\| `actualPlacement` \| 0\.\.1 \| \[ActualPlacement\]\(#actualplacement\) \|/)
  assert.match(md, /\| `childId` \| 1\.\.1 \| String \|/)
})

test('integration: ActualPlacement datatype + cardinality mapping', () => {
  const md = generateTable({ modelPath: MODEL, entity: 'ActualPlacement', rootDir: REPO_ROOT })
  assert.match(md, /\| `totalWeeklyCost` \| 1\.\.1 \| Decimal \|/)
  assert.match(md, /\| `coreWeeklyCost` \| 0\.\.1 \| Decimal \|/)
  assert.match(md, /\| `siblingsPlacedTogether` \| 1\.\.1 \| Integer \|/)
})

test('integration: a controlled-vocabulary property renders a vocabulary table', () => {
  const md = generateTable({ modelPath: MODEL, entity: 'communicationNeeds', rootDir: REPO_ROOT })

  assert.match(md, /^<details>\n<summary markdown="span">See vocabulary<\/summary>/)
  assert.match(md, /<\/details>$/)
  assert.match(md, /\| Code \| Description \|/)
  const codes = md.split('\n').filter(l => /^\| `/.test(l))
  assert.deepEqual(codes, [
    '| `Yes` | Affirmative. |',
    '| `No` | Negative. |',
    '| `Not specified` | Not specified. |'
  ])
  assert.match(md, /\{: \.table-bordered\}/)
  assert.doesNotMatch(md, /\.shacl-table/)
})

test('integration: an enum name also renders a vocabulary table', () => {
  const md = generateTable({ modelPath: MODEL, entity: 'RiskLevel', rootDir: REPO_ROOT })
  assert.match(md, /^<details>/)
  assert.match(md, /\| `No known risk` \| There is no known risk\. \|/)
})

test('integration: Options links present taxonomies and inlines absent ones', () => {
  // A page with a "Communication Need Taxonomy" section but no "Yes / No /
  // Not Specified" one -> the two properties must differ.
  const md = generateTable({
    modelPath: MODEL,
    entity: 'PlacementRequirements',
    rootDir: REPO_ROOT,
    pageHeadings: ['Communication Need Taxonomy']
  })
  const row = name => md.split('\n').find(l => l.includes(`\`${name}\``))

  assert.match(row('specificCommunicationRequirement'),
    /\[Communication Need Taxonomy\]\(#communication-need-taxonomy\): ESOL, BSL, Makaton …/)
  assert.match(row('communicationNeeds'), /\| Yes, No, Not specified \|$/)
  assert.doesNotMatch(row('communicationNeeds'), /\]\(#/)
})

test('integration: with empty page headings every taxonomy is inlined', () => {
  const md = generateTable({
    modelPath: MODEL,
    entity: 'PlacementRequirements',
    rootDir: REPO_ROOT,
    pageHeadings: []
  })
  const row = name => md.split('\n').find(l => l.includes(`\`${name}\``))
  assert.match(row('specificCommunicationRequirement'), /\| ESOL, BSL, Makaton, Other, None \|$/)
  assert.doesNotMatch(row('specificCommunicationRequirement'), /\]\(#/)
})

test('throws a helpful error for an unknown entity', () => {
  assert.throws(
    () => generateTable({ modelPath: MODEL, entity: 'Nope', rootDir: REPO_ROOT }),
    /No class, and no controlled-vocabulary property or enum, matching "Nope"/
  )
})
