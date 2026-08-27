'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const { sampleModel, mixinModel } = require('./helpers')
const {
  extractProperties,
  resolveOptions,
  resolveVocabulary,
  findVocabularyEnum
} = require('../lib/model')
const { XSD } = require('../lib/format')

test('extractProperties returns rows in slot order', () => {
  const rows = extractProperties(sampleModel(), 'Thing')
  assert.deepEqual(rows.map(r => r.name), ['name', 'tags', 'child', 'urgency', 'count', 'amount'])
})

test('extractProperties classifies datatype, class and enum ranges', () => {
  const rows = extractProperties(sampleModel(), 'Thing')
  const by = Object.fromEntries(rows.map(r => [r.name, r]))

  assert.equal(by.name.kind, 'type')
  assert.equal(by.name.datatype, XSD + 'string')

  assert.equal(by.child.kind, 'class')
  assert.equal(by.child.classRef, 'Other')

  assert.equal(by.urgency.kind, 'enum')
  assert.equal(by.urgency.enumName, 'UrgencyEnum')
  assert.ok(by.urgency.options, 'enum rows carry precomputed options')

  // custom type resolves to its xsd uri
  assert.equal(by.count.datatype, XSD + 'nonNegativeInteger')
  assert.equal(by.amount.datatype, XSD + 'decimal')
})

test('extractProperties maps required/multivalued to cardinality', () => {
  const rows = extractProperties(sampleModel(), 'Thing')
  const by = Object.fromEntries(rows.map(r => [r.name, r]))
  assert.deepEqual(by.name.cardinality, { min: 1, max: 1 })   // required, single
  assert.deepEqual(by.tags.cardinality, { min: 0, max: undefined }) // multivalued
  assert.deepEqual(by.child.cardinality, { min: 1, max: 1 })
  assert.deepEqual(by.count.cardinality, { min: 0, max: 1 })  // optional, single
})

test('extractProperties carries the slot description', () => {
  const rows = extractProperties(sampleModel(), 'Thing')
  assert.equal(rows.find(r => r.name === 'child').description, 'a child ref')
})

test('extractProperties throws for an unknown class', () => {
  assert.throws(() => extractProperties(sampleModel(), 'Nope'), /No class matching "Nope"/)
})

test('extractProperties lists mixin slots before the class\'s own slots', () => {
  const rows = extractProperties(mixinModel(), 'Doc')
  // Base's own mixin (Timestamped) resolves first, then Base, then Annotated,
  // then Doc's declared slots. `id` is reached twice and kept at its first spot.
  assert.deepEqual(rows.map(r => r.name), ['created', 'id', 'note', 'title'])
})

test('extractProperties inherits a mixin slot with its cardinality and description', () => {
  const rows = extractProperties(mixinModel(), 'Doc')
  const id = rows.find(r => r.name === 'id')
  assert.deepEqual(id.cardinality, { min: 1, max: 1 })
  assert.equal(id.description, 'the identifier')
})

test('extractProperties lets a class narrow an inherited slot via slot_usage', () => {
  const rows = extractProperties(mixinModel(), 'Doc')
  const by = Object.fromEntries(rows.map(r => [r.name, r]))
  // slot_usage on the class overrides the global slot ...
  assert.equal(by.created.description, 'when this doc was created')
  // ... and also the mixin's own slot_usage for the same slot.
  assert.equal(by.note.description, 'a note, from the class')
})

test('extractProperties applies a mixin\'s slot_usage when the class has none', () => {
  const rows = extractProperties(mixinModel(), 'Annotated')
  assert.equal(rows.find(r => r.name === 'note').description, 'a note, from the mixin')
})

test('extractProperties survives a mixin cycle', () => {
  const rows = extractProperties(mixinModel(), 'Looper')
  assert.deepEqual(rows.map(r => r.name), ['id'])
})

test('resolveOptions builds a taxonomy link title, anchor and all labels', () => {
  const opts = resolveOptions(sampleModel(), 'UrgencyEnum')
  assert.equal(opts.title, 'Urgency Taxonomy')
  assert.equal(opts.anchor, 'urgency-taxonomy')
  assert.deepEqual(opts.labels, ['Today', 'Soon', 'Later', 'Never'])
})

test('resolveVocabulary uses the value name as code, its title as label, and the description', () => {
  const vocab = resolveVocabulary(sampleModel(), 'UrgencyEnum')
  assert.deepEqual(vocab.concepts, [
    { code: 'Today', label: 'Today', description: 'Needed today.' },
    { code: 'Soon', label: 'Soon', description: '' },   // no description -> empty (no fallback)
    { code: 'Later', label: 'Later', description: '' },
    { code: 'Never', label: 'Never', description: '' }
  ])
})

test('findVocabularyEnum resolves a slot name, an enum name, else null', () => {
  const m = sampleModel()
  assert.equal(findVocabularyEnum(m, 'urgency'), 'UrgencyEnum')     // slot with enum range
  assert.equal(findVocabularyEnum(m, 'UrgencyEnum'), 'UrgencyEnum') // enum name directly
  assert.equal(findVocabularyEnum(m, 'name'), null)                 // datatype slot
  assert.equal(findVocabularyEnum(m, 'child'), null)                // class-ranged slot
  assert.equal(findVocabularyEnum(m, 'nope'), null)                 // does not exist
})
