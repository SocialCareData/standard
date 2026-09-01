'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const { sampleModel, mixinModel } = require('./helpers')
const {
  extractProperties,
  resolveOptions,
  resolveVocabulary,
  findVocabularyEnum,
  addHierarchy,
  isHierarchical,
  nearestAncestor
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
  // A flat vocabulary: every value is a top-level term with no children.
  const flat = { parent: null, depth: 0, hasChildren: false }
  assert.deepEqual(vocab.concepts, [
    { code: 'Today', label: 'Today', description: 'Needed today.', ...flat },
    { code: 'Soon', label: 'Soon', description: '', ...flat },   // no description -> empty (no fallback)
    { code: 'Later', label: 'Later', description: '', ...flat },
    { code: 'Never', label: 'Never', description: '', ...flat }
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

// ---------------------------------------------------------------------------
// Vocabulary hierarchy inferred from dot-notation codes
// ---------------------------------------------------------------------------

const codes = list => list.map(code => ({ code, label: code, description: '' }))

test('nearestAncestor finds the longest declared dotted prefix', () => {
  const declared = new Set(['SEND', 'SEND.SpLD', 'a', 'a.b', 'a.b.c'])
  assert.equal(nearestAncestor('SEND.SpLD', declared), 'SEND')
  assert.equal(nearestAncestor('a.b.c', declared), 'a.b')
  assert.equal(nearestAncestor('SEND', declared), null)      // no dot at all
  assert.equal(nearestAncestor('CA.nutrition', declared), null) // parent not declared
  // Skips undeclared intermediate levels rather than inventing them.
  assert.equal(nearestAncestor('a.x.y', declared), 'a')
})

test('addHierarchy annotates depth, parent and hasChildren', () => {
  const rows = addHierarchy(codes(['SEND', 'SEND.SpLD', 'SEND.MLD', 'EAL', 'NEET']))
  assert.deepEqual(rows.map(r => [r.code, r.parent, r.depth, r.hasChildren]), [
    ['SEND', null, 0, true],
    ['SEND.SpLD', 'SEND', 1, false],
    ['SEND.MLD', 'SEND', 1, false],
    ['EAL', null, 0, false],
    ['NEET', null, 0, false]
  ])
  assert.equal(isHierarchical(rows), true)
})

test('addHierarchy nests more than one level deep', () => {
  const rows = addHierarchy(codes(['a', 'a.b', 'a.b.c']))
  assert.deepEqual(rows.map(r => r.depth), [0, 1, 2])
  assert.equal(rows[2].parent, 'a.b')
})

test('addHierarchy leaves a dotted code with no declared parent at the top level', () => {
  // QuestionCategory does this: `CA.nutrition` with no `CA` value.
  const rows = addHierarchy(codes(['Health', 'CA.nutrition', 'CA.hygiene']))
  assert.deepEqual(rows.map(r => [r.code, r.depth]), [
    ['Health', 0], ['CA.nutrition', 0], ['CA.hygiene', 0]
  ])
  assert.equal(isHierarchical(rows), false)
})

test('addHierarchy keeps declaration order and pulls stray children under their parent', () => {
  const rows = addHierarchy(codes(['SEND.SpLD', 'EAL', 'SEND', 'EAL.fr']))
  assert.deepEqual(rows.map(r => r.code), ['EAL', 'EAL.fr', 'SEND', 'SEND.SpLD'])
})

test('resolveVocabulary reads the hierarchy off the enum keys', () => {
  const model = require('../lib/linkml').loadModel(`
id: https://example.org/h
name: h
default_prefix: ex
prefixes: { ex: https://example.org/ }
enums:
  Send:
    permissible_values:
      SEND: { title: SEND }
      "SEND.SpLD": { title: SEND SpLD }
      EAL: { title: EAL }
`)
  const { concepts } = resolveVocabulary(model, 'Send')
  assert.deepEqual(concepts.map(c => [c.code, c.depth]), [['SEND', 0], ['SEND.SpLD', 1], ['EAL', 0]])
})
