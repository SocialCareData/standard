'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const { slugify, cardinality, datatypeLabel } = require('../lib/format')
const { localName, schemeOf } = require('../lib/rdf')
const { renderMarkdown, renderVocabularyTable, dataTypeCell, optionsCell, escapeCell } = require('../lib/table')
const { storeFrom } = require('./helpers')

test('slugify matches kramdown auto_id output', () => {
  assert.equal(slugify('Out of LA Reason Taxonomy'), 'out-of-la-reason-taxonomy')
  assert.equal(slugify('Placement Urgency Taxonomy'), 'placement-urgency-taxonomy')
  assert.equal(slugify('Support Type'), 'support-type')
  assert.equal(slugify('Foo: Bar / Baz'), 'foo-bar-baz')
})

test('cardinality formats min/max pairs', () => {
  assert.equal(cardinality(1, 1), '1..1')
  assert.equal(cardinality(0, 1), '0..1')
  assert.equal(cardinality(1, undefined), '1..*')
  assert.equal(cardinality(undefined, undefined), '0..*')
  assert.equal(cardinality(0, 5), '0..5')
})

test('datatypeLabel maps xsd types to friendly labels', () => {
  const xsd = 'http://www.w3.org/2001/XMLSchema#'
  assert.equal(datatypeLabel(xsd + 'string'), 'String')
  assert.equal(datatypeLabel(xsd + 'boolean'), 'Boolean')
  assert.equal(datatypeLabel(xsd + 'date'), 'Date')
  assert.equal(datatypeLabel(xsd + 'dateTime'), 'Date')
  assert.equal(datatypeLabel(xsd + 'nonNegativeInteger'), 'Integer')
  assert.equal(datatypeLabel(xsd + 'decimal'), 'Decimal')
  assert.equal(datatypeLabel(xsd + 'anyType'), 'AnyType') // fallback
  assert.equal(datatypeLabel(undefined), '')
})

test('localName and schemeOf split IRIs correctly', () => {
  assert.equal(localName('https://ex.org/a/b#CourtOrder'), 'CourtOrder')
  assert.equal(localName('https://ex.org/a/placementId'), 'placementId')
  assert.equal(schemeOf('https://ex.org/a/reason#CourtOrder'), 'https://ex.org/a/reason')
})

test('dataTypeCell renders class links, categorical and datatypes', () => {
  assert.equal(
    dataTypeCell({ classRef: 'https://ex.org/PlacementRequirements' }),
    '[PlacementRequirements](#placementrequirements)'
  )
  assert.equal(dataTypeCell({ inList: ['https://ex.org/x#A'] }), 'Categorical')
  assert.equal(
    dataTypeCell({ datatype: 'http://www.w3.org/2001/XMLSchema#string' }),
    'String'
  )
  assert.equal(dataTypeCell({}), '')
})

test('escapeCell flattens whitespace and escapes pipes', () => {
  assert.equal(escapeCell('a\nb'), 'a b')
  assert.equal(escapeCell('a | b'), 'a \\| b')
  assert.equal(escapeCell('  spaced   out  '), 'spaced out')
  assert.equal(escapeCell(null), '')
})

test('renderMarkdown produces a header + separator + rows', () => {
  const md = renderMarkdown([['`f`', '1..1', 'String', 'desc', '']])
  const lines = md.split('\n')
  assert.equal(lines[0], '| Field name | Cardinality | Data Type | Description | Options |')
  assert.equal(lines[1], '| --- | --- | --- | --- | --- |')
  assert.equal(lines[2], '| `f` | 1..1 | String | desc |  |')
})

const VOCAB = `
<https://example.org/urgency> a skos:ConceptScheme ; skos:prefLabel "Urgency" .
urg:Today a skos:Concept ; skos:notation "today" ; skos:definition "Needed | today." .
urg:Soon  a skos:Concept ; skos:notation "soon" ; skos:prefLabel "Soon" .
`

const OPTIONS_TAXONOMY = `
<https://example.org/urgency> a skos:ConceptScheme ; skos:prefLabel "Urgency" .
urg:Today a skos:Concept ; skos:prefLabel "Today" .
urg:Soon  a skos:Concept ; skos:prefLabel "Soon" .
urg:Later a skos:Concept ; skos:prefLabel "Later" .
urg:Never a skos:Concept ; skos:prefLabel "Never" .
`
const URGENCY_ROW = {
  inList: ['Today', 'Soon', 'Later', 'Never'].map(i => `https://example.org/urgency#${i}`)
}

test('optionsCell links + previews when the taxonomy section exists on the page', () => {
  const { store } = storeFrom(OPTIONS_TAXONOMY)
  const cell = optionsCell(store, URGENCY_ROW, new Set(['urgency-taxonomy']))
  assert.equal(cell, '[Urgency Taxonomy](#urgency-taxonomy): Today, Soon, Later …')
})

test('optionsCell lists ALL values when the section is absent from the page', () => {
  const { store } = storeFrom(OPTIONS_TAXONOMY)
  const cell = optionsCell(store, URGENCY_ROW, new Set(['some-other-section']))
  assert.equal(cell, 'Today, Soon, Later, Never')
})

test('optionsCell links when page context is unknown (no anchor set)', () => {
  const { store } = storeFrom(OPTIONS_TAXONOMY)
  assert.match(optionsCell(store, URGENCY_ROW), /^\[Urgency Taxonomy\]\(#urgency-taxonomy\):/)
  assert.match(optionsCell(store, URGENCY_ROW, null), /^\[Urgency Taxonomy\]/)
})

test('optionsCell is empty for a non-vocabulary property', () => {
  const { store } = storeFrom(OPTIONS_TAXONOMY)
  assert.equal(optionsCell(store, { datatype: 'x' }, new Set()), '')
})

test('renderVocabularyTable wraps a Code/Description table in a details element', () => {
  const { store } = storeFrom(VOCAB)
  const md = renderVocabularyTable(store, [
    'https://example.org/urgency#Today',
    'https://example.org/urgency#Soon'
  ])
  assert.equal(md, [
    '<details>',
    '<summary markdown="span">See vocabulary</summary>',
    '',
    '| Code | Description |',
    '| :--- | :--- |',
    '| `today` | Needed \\| today. |', // pipe in a description is escaped
    '| `soon` | Soon |', // falls back to prefLabel when no definition
    '{: .table-bordered}',
    '',
    '</details>'
  ].join('\n'))
})
