'use strict'

const { test } = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const { loadModel } = require('../lib/linkml')
const { diffClassProperties, diffVocabulary, renderDiffTable } = require('../lib/diff')
const { generateDiffTable } = require('../lib/generate')

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..', '..')
const CURRENT = 'src/assets/model/placements/placements-standard-01.yaml'
const PREVIOUS = 'src/assets/model/placements/placements-standard.yaml'

// Two hand-built versions of one class exercising every row status.
const CUR = loadModel(`
name: cur
default_range: string
classes:
  Thing: { slots: [a, b, c, d] }
  OnlyNew: { slots: [x] }
slots:
  a: { range: string, required: true, description: alpha }
  b: { range: string, description: bravo NEW }
  c: { range: string, description: charlie }
  d: { range: string, description: delta }
  x: { range: string, description: xray }
enums:
  Vocab:
    title: Vocab
    permissible_values:
      Keep: { title: Keep, description: kept }
      Edit: { title: Edit, description: new text }
      Fresh: { title: Fresh, description: brand new }
`)

const PREV = loadModel(`
name: prev
default_range: string
classes:
  Thing: { slots: [a, b, d, e] }
  OnlyOld: { slots: [y] }
slots:
  a: { range: string, required: true, description: alpha }
  b: { range: string, description: bravo OLD }
  d: { range: string, description: delta }
  e: { range: string, description: echo }
  y: { range: string, description: yankee }
enums:
  Vocab:
    title: Vocab
    permissible_values:
      Keep: { title: Keep, description: kept }
      Edit: { title: Edit, description: old text }
      Gone: { title: Gone, description: removed value }
`)

test('diffClassProperties: statuses and unified order', () => {
  const { classStatus, rows } = diffClassProperties(CUR, PREV, 'Thing')
  assert.equal(classStatus, 'present')
  // e (removed) is re-inserted after its surviving predecessor d.
  assert.deepEqual(rows.map(r => [r.key, r.status]), [
    ['a', 'unchanged'],
    ['b', 'changed'],
    ['c', 'added'],
    ['d', 'unchanged'],
    ['e', 'removed']
  ])
})

test('diffClassProperties: a changed cell carries old + new html', () => {
  const { rows } = diffClassProperties(CUR, PREV, 'Thing')
  const b = rows.find(r => r.key === 'b')
  const descCell = b.cells[3] // Description column
  assert.equal(descCell.changed, true)
  assert.match(descCell.html, /bravo NEW/)
  assert.match(descCell.oldHtml, /bravo OLD/)
  // unchanged cells on the same row are not flagged
  assert.equal(b.cells[0].changed, false)
})

test('diffClassProperties: whole class added / removed', () => {
  assert.equal(diffClassProperties(CUR, PREV, 'OnlyNew').classStatus, 'added')
  assert.equal(diffClassProperties(CUR, PREV, 'OnlyNew').rows.every(r => r.status === 'added'), true)
  assert.equal(diffClassProperties(CUR, PREV, 'OnlyOld').classStatus, 'removed')
  assert.equal(diffClassProperties(CUR, PREV, 'OnlyOld').rows.every(r => r.status === 'removed'), true)
})

test('diffVocabulary: matches values by code', () => {
  const { rows } = diffVocabulary(CUR, PREV, 'Vocab')
  // 'Gone' (removed) is re-inserted after its surviving predecessor 'Edit',
  // ahead of the newly added 'Fresh'.
  assert.deepEqual(rows.map(r => [r.key, r.status]), [
    ['Keep', 'unchanged'],
    ['Edit', 'changed'],
    ['Gone', 'removed'],
    ['Fresh', 'added']
  ])
})

test('renderDiffTable: emits raw HTML with diff classes and markdown=0', () => {
  const html = renderDiffTable(diffClassProperties(CUR, PREV, 'Thing'))
  assert.match(html, /^<table markdown="0" class="schema-table schema-diff">/)
  assert.match(html, /<tr class="diff-added"><td><code>c<\/code>/)
  assert.match(html, /<tr class="diff-removed"><td><del><code>e<\/code><\/del>/)
  assert.match(html, /<td class="diff-cell"><del class="diff-old">bravo OLD<\/del> <ins class="diff-new">bravo NEW<\/ins><\/td>/)
  // no blank lines inside the block (would let kramdown re-parse it)
  assert.doesNotMatch(html, /\n\n/)
})

test('integration: RiskAssessment diff against the real models flags the two removed slots', () => {
  const html = generateDiffTable({ modelPath: CURRENT, previousPath: PREVIOUS, entity: 'RiskAssessment', rootDir: REPO_ROOT })
  assert.match(html, /<tr class="diff-removed"><td><del><code>riskOther<\/code>/)
  assert.match(html, /<tr class="diff-removed"><td><del><code>riskToOthersOther<\/code>/)
  // everything else is unchanged
  assert.doesNotMatch(html, /diff-added/)
  assert.doesNotMatch(html, /diff-changed/)
})

test('integration: a controlled-vocabulary property renders a diffed vocabulary table', () => {
  const html = generateDiffTable({ modelPath: CURRENT, previousPath: PREVIOUS, entity: 'placementType', rootDir: REPO_ROOT })
  // The whole <details> is marked raw so kramdown leaves the summary/table intact.
  assert.match(html, /^<details markdown="0">/)
  assert.match(html, /<summary>See vocabulary<\/summary>/)
  assert.match(html, /<table class="table-bordered schema-diff">/)
  assert.match(html, /<\/details>$/)
})
