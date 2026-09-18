'use strict'

const { test, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const { loadModelFile, loadImportMap, resolveImport, _resetImportCaches } = require('../lib/linkml')

/**
 * Coverage for importmap discovery and multi-level import resolution — the
 * mechanism that lets a module schema import a shared core by its ontology id
 * (`https://ontology.socialcaredata.io/common`) and have it resolve to a local
 * file through a single `imports.json` sitting above the module directories.
 *
 * Fixtures are written to a throwaway tree shaped like the real repo:
 *
 *     <tmp>/imports.json          decoy, ABOVE the boundary — must be ignored
 *     <tmp>/repo/.git             the boundary the upward walk stops at
 *     <tmp>/repo/model/imports.json   the one map for the whole tree
 *     <tmp>/repo/model/<module>/<module>.yaml
 *
 * The `.git` marker is what keeps these tests hermetic: without a boundary the
 * walk would climb out of the temp dir and could pick up a stray imports.json.
 */

let ROOT // <tmp>
let REPO // <tmp>/repo
let MODEL // <tmp>/repo/model

const write = (rel, body) => {
  const p = path.join(ROOT, rel)
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, body)
  return p
}

/** A minimal LinkML schema with the given id/name. */
const schema = (name, body) => `id: https://ex.org/${name}\nname: ${name}\n${body}`

/** Run `fn` with stderr captured, so the diagnostics can be asserted on. */
function captureStderr (fn) {
  const chunks = []
  const original = process.stderr.write
  process.stderr.write = chunk => { chunks.push(String(chunk)); return true }
  try {
    return { value: fn(), stderr: chunks.join('') }
  } finally {
    process.stderr.write = original
  }
}

before(() => {
  ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'schema-table-imports-'))
  REPO = path.join(ROOT, 'repo')
  MODEL = path.join(REPO, 'model')
  fs.mkdirSync(path.join(REPO, '.git'), { recursive: true })

  // Above the boundary: must never be picked up.
  write('imports.json', JSON.stringify({ 'https://ex.org/decoy': '../decoy/decoy' }))

  // The one real map. Values are relative to the IMPORTING file, exactly as
  // src/_data/model/imports.json is written.
  write('repo/model/imports.json', JSON.stringify({
    'https://ex.org/base': '../base/base',
    'https://ex.org/mid': '../mid/mid',
    'https://ex.org/other': '../other/other',
    'https://ex.org/pinned': '../pinned/far-choice',
    'https://ex.org/ghost': '../ghost/ghost'
  }))

  write('repo/model/base/base.yaml', schema('base', [
    'imports:',
    '  - linkml:types',
    'classes:',
    '  Shared:',
    '    slots: [tag]',
    'slots:',
    '  tag:',
    '    range: string',
    '    description: from base',
    'enums:',
    '  SharedCode:',
    '    permissible_values:',
    '      A: { title: A }',
    ''
  ].join('\n')))

  // mid -> base
  write('repo/model/mid/mid.yaml', schema('mid', [
    'imports:',
    '  - linkml:types',
    '  - https://ex.org/base',
    'classes:',
    '  Mid:',
    '    slots: [tag]',
    ''
  ].join('\n')))

  // leaf -> mid -> base, and leaf redefines a slot the base owns.
  write('repo/model/leaf/leaf.yaml', schema('leaf', [
    'imports:',
    '  - linkml:types',
    '  - https://ex.org/mid',
    'slots:',
    '  tag:',
    '    range: string',
    '    description: from leaf',
    ''
  ].join('\n')))

  // other -> base
  write('repo/model/other/other.yaml', schema('other', [
    'imports:',
    '  - linkml:types',
    '  - https://ex.org/base',
    'classes:',
    '  Other:',
    '    slots: [tag]',
    ''
  ].join('\n')))

  // top -> {base, mid -> base, other -> base}: the mais.yaml diamond.
  write('repo/model/top/top.yaml', schema('top', [
    'imports:',
    '  - linkml:types',
    '  - https://ex.org/base',
    '  - https://ex.org/mid',
    '  - https://ex.org/other',
    'classes:',
    '  Top:',
    '    slots: [tag]',
    ''
  ].join('\n')))

  // A module with its own map pinning ONE id; the rest must still come from the
  // shared map above it.
  write('repo/model/pinned/far-choice.yaml', schema('far', 'classes:\n  Far: {}\n'))
  write('repo/model/pinned/near-choice.yaml', schema('near', 'classes:\n  Near: {}\n'))
  write('repo/model/pinner/imports.json', JSON.stringify({
    'https://ex.org/pinned': '../pinned/near-choice'
  }))
  write('repo/model/pinner/pinner.yaml', schema('pinner', [
    'imports:',
    '  - https://ex.org/pinned',
    '  - https://ex.org/base',
    ''
  ].join('\n')))

  // A malformed map must not stop the walk reaching the shared map above it.
  write('repo/model/malformed/imports.json', 'this is not json')
  write('repo/model/malformed/malformed.yaml', schema('malformed', [
    'imports:',
    '  - https://ex.org/base',
    ''
  ].join('\n')))

  // Unresolvable: no map entry at all.
  write('repo/model/broken/broken.yaml', schema('broken', [
    'imports:',
    '  - https://ex.org/nope',
    'classes:',
    '  Broken: {}',
    ''
  ].join('\n')))

  // Mapped, but the file the map points at does not exist.
  write('repo/model/ghosty/ghosty.yaml', schema('ghosty', [
    'imports:',
    '  - https://ex.org/ghost',
    ''
  ].join('\n')))

  // A tree with no importmap anywhere, for the plain relative-import path.
  fs.mkdirSync(path.join(ROOT, 'nomap', '.git'), { recursive: true })
  write('nomap/sibling.yaml', schema('sibling', 'classes:\n  Sibling: {}\n'))
  write('nomap/entry.yaml', schema('entry', [
    'imports:',
    '  - linkml:types',
    '  - sibling',
    ''
  ].join('\n')))
})

after(() => fs.rmSync(ROOT, { recursive: true, force: true }))

// `node --test` shares one process across the tests in a file, and the
// importmaps are memoised at module level.
beforeEach(() => _resetImportCaches())

test('an importmap above the schema directory is found by walking up', () => {
  // The regression this suite exists for: the map sits beside the module
  // folders, not beside the schema.
  assert.equal(fs.existsSync(path.join(MODEL, 'mid', 'imports.json')), false)

  const model = loadModelFile(path.join(MODEL, 'mid', 'mid.yaml'))
  assert.ok(model.classes.Shared, 'class from the imported base module')
  assert.ok(model.enums.SharedCode, 'enum from the imported base module')
  assert.ok(model.classes.Mid, 'the importing schema keeps its own classes')

  const map = loadImportMap(path.join(MODEL, 'mid'))
  assert.equal(map['https://ex.org/base'], '../base/base')
})

test('imports resolve transitively through a three-level chain', () => {
  // leaf -> mid -> base, which is person-subject-of-care -> person -> common.
  const model = loadModelFile(path.join(MODEL, 'leaf', 'leaf.yaml'))
  assert.ok(model.classes.Shared, 'definitions from two levels down')
  assert.ok(model.classes.Mid, 'definitions from one level down')
})

test('the importing schema overrides an imported definition across the chain', () => {
  const model = loadModelFile(path.join(MODEL, 'leaf', 'leaf.yaml'))
  assert.equal(model.slots.tag.description, 'from leaf')
})

test('a diamond import yields a complete model', () => {
  // top -> {base, mid -> base, other -> base}: the mais.yaml shape. A file
  // reached twice contributes once, but nothing is lost.
  const model = loadModelFile(path.join(MODEL, 'top', 'top.yaml'))
  for (const c of ['Shared', 'Mid', 'Other', 'Top']) {
    assert.ok(model.classes[c], `expected class ${c}`)
  }
  assert.equal(model.slots.tag.description, 'from base')
})

test('a nearer importmap overrides one id without hiding the rest of the shared map', () => {
  const map = loadImportMap(path.join(MODEL, 'pinner'))
  assert.equal(map['https://ex.org/pinned'], '../pinned/near-choice', 'nearest map wins')
  assert.equal(map['https://ex.org/base'], '../base/base', 'shared map still applies')

  const model = loadModelFile(path.join(MODEL, 'pinner', 'pinner.yaml'))
  assert.ok(model.classes.Near, 'resolved through the module-local override')
  assert.ok(!model.classes.Far, "not the shared map's target")
  assert.ok(model.classes.Shared, 'and the shared map still resolved the rest')
})

test('the upward walk stops at the repository boundary', () => {
  const map = loadImportMap(path.join(MODEL, 'mid'))
  assert.equal(map['https://ex.org/decoy'], undefined)
})

test("LinkML's own modules are skipped silently", () => {
  const { stderr } = captureStderr(() => loadModelFile(path.join(MODEL, 'base', 'base.yaml')))
  assert.equal(stderr, '')

  const dir = path.join(MODEL, 'base')
  let called = false
  const spy = () => { called = true }
  assert.equal(resolveImport(dir, 'linkml:types', spy), null)
  assert.equal(resolveImport(dir, 'linkml:mappings', spy), null)
  assert.equal(called, false, 'a linkml: module must never be reported unresolved')
})

test('an import with no importmap entry is an error naming the import and where it looked', () => {
  const file = path.join(MODEL, 'broken', 'broken.yaml')
  assert.throws(() => loadModelFile(file), err => {
    assert.match(err.message, /Unresolved import "https:\/\/ex\.org\/nope"/)
    assert.match(err.message, /no "imports\.json" entry/)
    assert.ok(err.message.includes(file), 'names the importing schema')
    assert.ok(err.message.includes(REPO), 'names the directory the search stopped at')
    // The Jekyll plugin logs stderr one line at a time.
    assert.equal(err.message.includes('\n'), false, 'stays on a single line')
    return true
  })
})

test('an import mapped to a missing file is reported distinctly', () => {
  assert.throws(() => loadModelFile(path.join(MODEL, 'ghosty', 'ghosty.yaml')), err => {
    assert.match(err.message, /the importmap maps it to "\.\.\/ghost\/ghost"/)
    assert.match(err.message, /no file exists at/)
    assert.match(err.message, /relative to the importing schema/)
    return true
  })
})

test('a malformed importmap warns and the walk continues to the map above it', () => {
  const { value, stderr } = captureStderr(() =>
    loadModelFile(path.join(MODEL, 'malformed', 'malformed.yaml')))
  assert.match(stderr, /ignoring malformed importmap/)
  assert.ok(value.classes.Shared, 'still resolved through the shared map')
})

test('a plain relative import still resolves with no importmap anywhere', () => {
  const model = loadModelFile(path.join(ROOT, 'nomap', 'entry.yaml'))
  assert.ok(model.classes.Sibling)
})

test('a typo in a relative import is an error rather than a silent skip', () => {
  write('nomap/typo.yaml', schema('typo', 'imports:\n  - sibblingg\n'))
  assert.throws(() => loadModelFile(path.join(ROOT, 'nomap', 'typo.yaml')), err => {
    assert.match(err.message, /Unresolved import "sibblingg"/)
    assert.match(err.message, /no file exists at/)
    return true
  })
})
