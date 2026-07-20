'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const { slugify, cardinality, datatypeLabel } = require('../lib/format')
const { localName, schemeOf } = require('../lib/rdf')
const { renderMarkdown, dataTypeCell, escapeCell } = require('../lib/table')

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
