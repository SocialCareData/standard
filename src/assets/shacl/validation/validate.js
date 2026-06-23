#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const N3 = require('n3')
const jsonld = require('jsonld')
const rdf = require('rdf-ext').default
const SHACLValidator = require('rdf-validate-shacl').default

const SHACL_DIR = path.resolve(__dirname, '..')

// Standards registry
const STANDARDS = {
  placements: {
    shapeFile: path.resolve(SHACL_DIR, 'placements-shacl-shape.ttl'),
    examplesDir: path.resolve(SHACL_DIR, 'examples/placement'),
    crossRecordChecks: [
      makeDuplicatePropertyCheck('https://ns.socialcaredata.io/placements/childId', 'childId')
    ],
  },
  'person-subject-of-care': {
    shapeFile: path.resolve(SHACL_DIR, 'person-subject-of-care-shacl-shape.ttl'),
    examplesDir: path.resolve(SHACL_DIR, 'examples/person-subject-of-care'),
    crossRecordChecks: [checkDuplicatePersonIdentifiers],
  },
  'person-connected': {
    shapeFile: path.resolve(SHACL_DIR, 'person-connected-shacl-shape.ttl'),
    examplesDir: path.resolve(SHACL_DIR, 'examples/person-connected'),
    crossRecordChecks: [checkDuplicatePersonIdentifiers],
  },
}

const COLOURS = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', dim: '\x1b[2m', bold: '\x1b[1m'
}
const c = (col, s) => `${COLOURS[col]}${s}${COLOURS.reset}`

function parseTurtle (text) {
  const quads = new N3.Parser().parse(text)
  return rdf.dataset(quads)
}

function parseNQuads (text) {
  const quads = new N3.Parser({ format: 'application/n-quads' }).parse(text)
  return rdf.dataset(quads)
}

async function loadJsonLDFile (file) {
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'))
  // Inline the relative @context so jsonld doesn't need a document loader.
  if (typeof doc['@context'] === 'string' && ( doc['@context'].startsWith('./') || doc['@context'].startsWith('../') )) {
    const ctxPath = path.join(path.dirname(file), doc['@context'])
    const ctx = JSON.parse(fs.readFileSync(ctxPath, 'utf8'))
    doc['@context'] = ctx['@context']
  }
  const nquads = await jsonld.toRDF(doc, { format: 'application/n-quads' })
  return parseNQuads(nquads)
}

function summariseResult (r) {
  const sev = r.severity ? r.severity.value.split('#').pop() : 'Violation'
  const path_ = r.path ? r.path.value : '(no path)'
  const focus = r.focusNode ? r.focusNode.value : '(no focus)'
  const msgs = (r.message || []).map(m => m.value).join(' ; ') || '(no message)'
  return { sev, path: path_, focus, msg: msgs }
}

function printReport (file, report, prefix = '') {
  const violations = report.results.filter(r => !r.severity || r.severity.value.endsWith('Violation'))
  const warnings = report.results.filter(r => r.severity && r.severity.value.endsWith('Warning'))

  const verdict = report.conforms
    ? c('green', 'CONFORMS')
    : (violations.length === 0 ? c('yellow', 'WARNINGS ONLY') : c('red', 'NON-CONFORMING'))

  console.log(`\n${prefix}${c('bold', path.basename(file))}  ->  ${verdict}`)
  console.log(c('dim', `  violations=${violations.length}  warnings=${warnings.length}`))

  for (const r of report.results) {
    const s = summariseResult(r)
    const tag = s.sev === 'Warning' ? c('yellow', '  ! ') : c('red', '  X ')
    console.log(`${tag}[${s.sev}] ${s.path}`)
    console.log(c('dim', `      focus: ${s.focus}`))
    console.log(c('dim', `      ${s.msg}`))
  }
}

// Cross-record uniqueness check: duplicate values of a single named property.
function makeDuplicatePropertyCheck (propertyIri, propertyLabel) {
  const predicate = rdf.namedNode(propertyIri)
  return function checkDuplicate (allDatasets) {
    const seen = new Map()
    for (const { file, dataset } of allDatasets) {
      for (const q of dataset.match(null, predicate, null)) {
        const id = q.object.value
        if (!seen.has(id)) seen.set(id, [])
        seen.get(id).push(file)
      }
    }
    const dups = [...seen.entries()].filter(([, files]) => files.length > 1)
    const label = `Cross-record check: duplicate ${propertyLabel}`
    if (dups.length === 0) {
      console.log(`\n${c('bold', label)}  ->  ${c('green', 'OK')}`)
      return true
    }
    console.log(`\n${c('bold', label)}  ->  ${c('red', 'DUPLICATES FOUND')}`)
    for (const [id, files] of dups) {
      console.log(`  ${c('red', 'X')} ${propertyLabel}=${id}  in: ${files.map(f => path.basename(f)).join(', ')}`)
    }
    return false
  }
}

// Cross-record uniqueness check for Person: duplicate (system, value) pair
// across the Identifier nodes attached directly to a Person via p:identifier.
// Identifiers reached via p:relatedPerson, p:primaryContactProfessional, or
// p:matchedPersonRef are cross-references to other people/professionals and
// are not subject to this uniqueness rule. The check is restricted to
// Identifiers that have a Person as their subject so that nested Identifier
// references inside PersonRelationship are not counted.
function checkDuplicatePersonIdentifiers (allDatasets) {
  const IDENTIFIER = rdf.namedNode('https://ns.socialcaredata.io/person/identifier')
  const VALUE = rdf.namedNode('https://ns.socialcaredata.io/person/value')
  const SYSTEM = rdf.namedNode('https://ns.socialcaredata.io/person/system')
  const RDF_TYPE = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
  const PERSON = rdf.namedNode('https://ns.socialcaredata.io/person/Person')
  const seen = new Map()
  for (const { file, dataset } of allDatasets) {
    const personSubjects = new Set(
      [...dataset.match(null, RDF_TYPE, PERSON)].map(q => q.subject.value)
    )
    for (const idQ of dataset.match(null, IDENTIFIER, null)) {
      if (!personSubjects.has(idQ.subject.value)) continue
      const idNode = idQ.object
      const valQuads = [...dataset.match(idNode, VALUE, null)]
      const sysQuads = [...dataset.match(idNode, SYSTEM, null)]
      if (valQuads.length === 0 || sysQuads.length === 0) continue
      const key = `${sysQuads[0].object.value}|${valQuads[0].object.value}`
      if (!seen.has(key)) seen.set(key, [])
      seen.get(key).push(file)
    }
  }
  const dups = [...seen.entries()].filter(([, files]) => new Set(files).size > 1)
  const label = 'Cross-record check: duplicate Person Identifier (system, value)'
  if (dups.length === 0) {
    console.log(`\n${c('bold', label)}  ->  ${c('green', 'OK')}`)
    return true
  }
  console.log(`\n${c('bold', label)}  ->  ${c('red', 'DUPLICATES FOUND')}`)
  for (const [key, files] of dups) {
    console.log(`  ${c('red', 'X')} ${key}  in: ${[...new Set(files)].map(f => path.basename(f)).join(', ')}`)
  }
  return false
}

function listExamples (examplesDir) {
  return fs.readdirSync(examplesDir)
    .filter(f => f.endsWith('.jsonld') && f !== 'context.jsonld')
    .sort()
    .map(f => path.join(examplesDir, f))
}

function parseArgs (argv) {
  let standard = null
  const files = []
  for (const arg of argv.slice(2)) {
    if (arg.startsWith('--standard=')) {
      standard = arg.slice('--standard='.length)
    } else if (arg === '-h' || arg === '--help') {
      printUsage(); process.exit(0)
    } else {
      files.push(path.resolve(arg))
    }
  }
  return { standard, files }
}

function printUsage () {
  const names = Object.keys(STANDARDS).join(' | ')
  console.log(`Usage: node validate.js [--standard=<${names}>] [file.jsonld ...]

  --standard=<name>   Validate against the named standard.
  (no flag)           Validate every registered standard in sequence.
  files               Validate the given file(s) against the chosen standard.

Registered standards: ${names}`)
}

async function validateStandard (name, opts) {
  const cfg = STANDARDS[name]
  if (!cfg) {
    console.error(c('red', `Unknown standard '${name}'. Known: ${Object.keys(STANDARDS).join(', ')}`))
    return 1
  }
  const shapes = parseTurtle(fs.readFileSync(cfg.shapeFile, 'utf8'))
  const validator = new SHACLValidator(shapes)

  const targets = opts.files && opts.files.length > 0
    ? opts.files
    : listExamples(cfg.examplesDir)

  const showStandardPrefix = opts.showPrefix
  const prefix = showStandardPrefix ? c('cyan', `[${name}] `) : ''
  console.log(c('bold', `\n=== Validating ${targets.length} example(s) against ${path.basename(cfg.shapeFile)} ===`))

  let failures = 0
  const allDatasets = []

  for (const file of targets) {
    let dataset
    try {
      dataset = await loadJsonLDFile(file)
    } catch (err) {
      console.error(`\n${c('red', 'ERROR')} loading ${file}: ${err.message}`)
      failures++
      continue
    }
    allDatasets.push({ file, dataset })

    const report = validator.validate(dataset)
    printReport(file, report, prefix)

    const isValidExample = path.basename(file).startsWith('valid-')
    if (isValidExample && !report.conforms) failures++
    if (!isValidExample && report.conforms) failures++
  }

  for (const check of cfg.crossRecordChecks || []) {
    if (!check(allDatasets)) failures++
  }
  return failures
}

async function main () {
  const { standard, files } = parseArgs(process.argv)

  const names = standard ? [standard] : Object.keys(STANDARDS)
  if (files.length > 0 && !standard) {
    console.error(c('red', 'When passing file paths, also pass --standard=<name> so the validator knows which shape to use.'))
    printUsage()
    process.exit(2)
  }

  let totalFailures = 0
  for (const name of names) {
    totalFailures += await validateStandard(name, { files, showPrefix: names.length > 1 })
  }

  console.log()
  if (totalFailures === 0) {
    console.log(c('green', 'OK - all examples behaved as expected.'))
    process.exit(0)
  } else {
    console.log(c('red', `${totalFailures} example(s) did not match the expected outcome.`))
    process.exit(1)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(2)
})
