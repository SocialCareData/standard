'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const { slugify, cardinality, datatypeLabel, localName, XSD } = require('../lib/format')
const { renderMarkdown, renderVocabularyTable, dataTypeCell, optionsCell, normalizeOptionsLimit, escapeCell } = require('../lib/table')

test('slugify matches kramdown auto_id output', () => {
  assert.equal(slugify('Out of LA Reason Taxonomy'), 'out-of-la-reason-taxonomy')
  assert.equal(slugify('Placement Urgency Taxonomy'), 'placement-urgency-taxonomy')
  assert.equal(slugify('Yes / No / Not Specified Taxonomy'), 'yes-no-not-specified-taxonomy')
  assert.equal(slugify('Support Type'), 'support-type')
})

test('cardinality formats min/max pairs', () => {
  assert.equal(cardinality(1, 1), '1..1')
  assert.equal(cardinality(0, 1), '0..1')
  assert.equal(cardinality(1, undefined), '1..*')
  assert.equal(cardinality(0, undefined), '0..*')
})

test('datatypeLabel maps xsd types to friendly labels', () => {
  assert.equal(datatypeLabel(XSD + 'string'), 'String')
  assert.equal(datatypeLabel(XSD + 'boolean'), 'Boolean')
  assert.equal(datatypeLabel(XSD + 'date'), 'Date')
  assert.equal(datatypeLabel(XSD + 'nonNegativeInteger'), 'Integer')
  assert.equal(datatypeLabel(XSD + 'decimal'), 'Decimal')
  assert.equal(datatypeLabel(XSD + 'anyType'), 'AnyType') // fallback
  assert.equal(datatypeLabel(undefined), '')
})

test('localName splits IRIs correctly', () => {
  assert.equal(localName('https://ex.org/a/b#CourtOrder'), 'CourtOrder')
  assert.equal(localName('https://ex.org/a/placementId'), 'placementId')
})

test('dataTypeCell renders class links, categorical and datatypes', () => {
  assert.equal(dataTypeCell({ classRef: 'PlacementRequirements' }), '[PlacementRequirements](#placementrequirements)')
  assert.equal(dataTypeCell({ enumName: 'RiskLevel' }), 'Categorical')
  assert.equal(dataTypeCell({ datatype: XSD + 'string' }), 'String')
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

const OPTIONS = {
  title: 'Urgency Taxonomy',
  anchor: 'urgency-taxonomy',
  labels: ['Today', 'Soon', 'Later', 'Never']
}

test('optionsCell links + previews when the taxonomy section exists on the page', () => {
  const cell = optionsCell({ options: OPTIONS }, new Set(['urgency-taxonomy']))
  assert.equal(cell, '[Urgency Taxonomy](#urgency-taxonomy): Today, Soon, Later …')
})

test('optionsCell lists ALL values when the section is absent from the page', () => {
  const cell = optionsCell({ options: OPTIONS }, new Set(['some-other-section']))
  assert.equal(cell, 'Today, Soon, Later, Never')
})

test('optionsCell links when page context is unknown (no anchor set)', () => {
  assert.match(optionsCell({ options: OPTIONS }), /^\[Urgency Taxonomy\]\(#urgency-taxonomy\):/)
  assert.match(optionsCell({ options: OPTIONS }, null), /^\[Urgency Taxonomy\]/)
})

test('optionsCell is empty for a non-vocabulary property', () => {
  assert.equal(optionsCell({ datatype: 'x' }, new Set()), '')
})

test('optionsCell previews a configurable number of values', () => {
  const anchors = new Set(['urgency-taxonomy'])
  // integer limit
  assert.equal(
    optionsCell({ options: OPTIONS }, anchors, 2),
    '[Urgency Taxonomy](#urgency-taxonomy): Today, Soon …'
  )
  // limit >= value count drops the ellipsis
  assert.equal(
    optionsCell({ options: OPTIONS }, anchors, 4),
    '[Urgency Taxonomy](#urgency-taxonomy): Today, Soon, Later, Never'
  )
  // "all" shows every value, no ellipsis
  assert.equal(
    optionsCell({ options: OPTIONS }, anchors, 'all'),
    '[Urgency Taxonomy](#urgency-taxonomy): Today, Soon, Later, Never'
  )
  // numeric string is accepted
  assert.equal(
    optionsCell({ options: OPTIONS }, anchors, '1'),
    '[Urgency Taxonomy](#urgency-taxonomy): Today …'
  )
})

test('normalizeOptionsLimit coerces sensibly (default 3)', () => {
  assert.equal(normalizeOptionsLimit(undefined), 3)
  assert.equal(normalizeOptionsLimit('foo'), 3)
  assert.equal(normalizeOptionsLimit(0), 3)
  assert.equal(normalizeOptionsLimit(-2), 3)
  assert.equal(normalizeOptionsLimit('5'), 5)
  assert.equal(normalizeOptionsLimit(5), 5)
  assert.equal(normalizeOptionsLimit('all'), Infinity)
})

test('renderVocabularyTable wraps a Code/Label/Definition table in a details element', () => {
  const md = renderVocabularyTable([
    { code: 'today', label: 'Today', description: 'Needed | today.' }, // pipe gets escaped
    { code: 'soon', label: 'Soon', description: 'Soon' }
  ])
  assert.equal(md, [
    '<details>',
    '<summary markdown="span">See vocabulary</summary>',
    '',
    '| Code | Label | Definition |',
    '| :--- | :--- | :--- |',
    '| `today` | Today | Needed \\| today. |',
    '| `soon` | Soon | Soon |',
    '{: .table-bordered}',
    '',
    '</details>'
  ].join('\n'))
})

test('renderVocabularyTable can omit the collapsible wrapper', () => {
  const md = renderVocabularyTable([
    { code: 'today', label: 'Today', description: 'Needed today.' }
  ], { collapsible: false })
  assert.equal(md, [
    '| Code | Label | Definition |',
    '| :--- | :--- | :--- |',
    '| `today` | Today | Needed today. |',
    '{: .table-bordered}'
  ].join('\n'))
  assert.doesNotMatch(md, /<details>|<summary/)
})
