'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')

const { storeFrom } = require('./helpers')
const { extractProperties, resolveOptions } = require('../lib/model')

const SHAPES = `
ex:ThingShape a sh:NodeShape ;
    sh:targetClass ex:Thing ;
    sh:property [ sh:path ex:name ; sh:datatype xsd:string ; sh:minCount 1 ; sh:maxCount 1 ;
                  sh:message "name is required." ] ;
    sh:property [ sh:path ex:tags ; sh:datatype xsd:string ] ;
    sh:property [ sh:path ex:child ; sh:class ex:Other ; sh:minCount 1 ; sh:maxCount 1 ] ;
    sh:property [ sh:path ex:urgency ; sh:nodeKind sh:IRI ;
                  sh:in ( urg:Today urg:Soon urg:Later ) ; sh:minCount 1 ; sh:maxCount 1 ] .

# A second shape on the same class contributes a warning-only range check for
# an already-declared property: it must MERGE, not create a duplicate row.
ex:ThingRangeShape a sh:NodeShape ;
    sh:targetClass ex:Thing ;
    sh:property [ sh:path ex:name ; sh:minInclusive 1 ; sh:severity sh:Warning ] .

# A constraint-only shape (properties nested under sh:not) must NOT add rows.
ex:ThingCheck a sh:NodeShape ;
    sh:targetClass ex:Thing ;
    sh:not [ sh:property [ sh:path ex:hidden ; sh:maxCount 0 ] ] .
`

test('extractProperties returns rows in document order', () => {
  const { store, quads } = storeFrom(SHAPES)
  const rows = extractProperties(store, quads, 'Thing')
  assert.deepEqual(rows.map(r => r.name), ['name', 'tags', 'child', 'urgency'])
})

test('merges duplicate property declarations into one row', () => {
  const { store, quads } = storeFrom(SHAPES)
  const rows = extractProperties(store, quads, 'Thing')
  const name = rows.filter(r => r.name === 'name')
  assert.equal(name.length, 1, 'name declared twice should collapse to one row')
  assert.deepEqual(name[0].cardinality, { min: 1, max: 1 })
})

test('does not pull in properties nested under sh:not', () => {
  const { store, quads } = storeFrom(SHAPES)
  const rows = extractProperties(store, quads, 'Thing')
  assert.ok(!rows.some(r => r.name === 'hidden'))
})

test('classifies datatype, class and controlled-vocab properties', () => {
  const { store, quads } = storeFrom(SHAPES)
  const rows = extractProperties(store, quads, 'Thing')
  const byName = Object.fromEntries(rows.map(r => [r.name, r]))

  assert.equal(byName.name.datatype, 'http://www.w3.org/2001/XMLSchema#string')
  assert.equal(byName.child.classRef, 'https://example.org/Other')
  assert.deepEqual(byName.urgency.inList, [
    'https://example.org/urgency#Today',
    'https://example.org/urgency#Soon',
    'https://example.org/urgency#Later'
  ])
  assert.deepEqual(byName.tags.cardinality, { min: undefined, max: undefined })
})

test('description falls back to sh:message when no ontology comment', () => {
  const { store, quads } = storeFrom(SHAPES)
  const rows = extractProperties(store, quads, 'Thing')
  const name = rows.find(r => r.name === 'name')
  assert.equal(name.description, 'name is required.')
})

test('throws for an unknown entity', () => {
  const { store, quads } = storeFrom(SHAPES)
  assert.throws(() => extractProperties(store, quads, 'DoesNotExist'), /No sh:NodeShape/)
})

test('matches targetClass by full IRI as well as local name', () => {
  const { store, quads } = storeFrom(SHAPES)
  const rows = extractProperties(store, quads, 'https://example.org/Thing')
  assert.equal(rows.length, 4)
})

const TAXONOMY = `
<https://example.org/urgency> a skos:ConceptScheme ; skos:prefLabel "Urgency" .
urg:Today a skos:Concept ; skos:prefLabel "Today" .
urg:Soon  a skos:Concept ; skos:prefLabel "Soon" .
urg:Later a skos:Concept ; skos:prefLabel "Later" .
`

test('resolveOptions builds a taxonomy link with example labels', () => {
  const { store } = storeFrom(SHAPES + TAXONOMY)
  const opts = resolveOptions(store, [
    'https://example.org/urgency#Today',
    'https://example.org/urgency#Soon',
    'https://example.org/urgency#Later'
  ])
  assert.equal(opts.title, 'Urgency Taxonomy')
  assert.equal(opts.anchor, 'urgency-taxonomy')
  assert.deepEqual(opts.examples, ['Today', 'Soon', 'Later'])
  assert.equal(opts.more, false)
})

test('resolveOptions flags when there are more than three concepts', () => {
  const { store } = storeFrom(SHAPES + TAXONOMY)
  const opts = resolveOptions(store, [
    'https://example.org/urgency#Today',
    'https://example.org/urgency#Soon',
    'https://example.org/urgency#Later',
    'https://example.org/urgency#Never'
  ])
  assert.equal(opts.examples.length, 3)
  assert.equal(opts.more, true)
  // Unknown concept still resolves via local name.
  assert.deepEqual(opts.examples, ['Today', 'Soon', 'Later'])
})
