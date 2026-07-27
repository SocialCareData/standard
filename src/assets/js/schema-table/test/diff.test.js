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

test('escapeHtml encodes pipes so cell text cannot break the pipe table', () => {
  const PIPES = loadModel(`
name: pipes
default_range: string
classes:
  T: { slots: [p] }
slots:
  p: { range: string, description: "a | b | c" }
`)
  const html = renderDiffTable(diffClassProperties(PIPES, PIPES, 'T'))
  // description column keeps its 5 pipe-delimited columns (encoded | inside cell)
  assert.match(html, /&#124;/)
  html.split('\n').slice(2).forEach(line => {
    if (line.startsWith('|')) assert.equal(line.split(' | ').length, 5)
  })
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

test('renderDiffTable: emits a Markdown table with inline-HTML diff colouring', () => {
  const md = renderDiffTable(diffClassProperties(CUR, PREV, 'Thing'))
  // a kramdown pipe table tagged with both style classes
  assert.match(md, /^\| Field name \| Cardinality \| Data Type \| Description \| Options \|/)
  assert.match(md, /\n\{: \.schema-table \.schema-diff\}$/)
  // added row: cells wrapped in a green span
  assert.match(md, /<span class="diff-added"><code>c<\/code><\/span>/)
  // removed row: cells struck through
  assert.match(md, /<del class="diff-removed"><code>e<\/code><\/del>/)
  // changed cell: old struck through beside new
  assert.match(md, /<del class="diff-old">bravo OLD<\/del> <ins class="diff-new">bravo NEW<\/ins>/)
})

test('integration: RiskAssessment diff against the real models flags the two removed slots', () => {
  const md = generateDiffTable({ modelPath: CURRENT, previousPath: PREVIOUS, entity: 'RiskAssessment', rootDir: REPO_ROOT })
  assert.match(md, /<del class="diff-removed"><code>riskOther<\/code><\/del>/)
  assert.match(md, /<del class="diff-removed"><code>riskToOthersOther<\/code><\/del>/)
  // everything else is unchanged
  assert.doesNotMatch(md, /diff-added/)
})

test('integration: a controlled-vocabulary property renders a diffed vocabulary table', () => {
  const md = generateDiffTable({ modelPath: CURRENT, previousPath: PREVIOUS, entity: 'placementType', rootDir: REPO_ROOT })
  // reuses the working <details> + Markdown-table wrapper (blank lines let
  // kramdown build the <table>); tagged with the vocabulary + diff classes.
  assert.match(md, /^<details>/)
  assert.match(md, /<summary markdown="span">See vocabulary<\/summary>/)
  assert.match(md, /\| Code \| Description \|/)
  assert.match(md, /\{: \.table-bordered \.schema-diff\}/)
  assert.match(md, /<\/details>$/)
})
