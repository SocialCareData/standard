'use strict'

const fs = require('fs')
const path = require('path')
const N3 = require('n3')
const { parseTurtle } = require('./rdf')
const { extractProperties } = require('./model')
const { renderTable } = require('./table')

/**
 * Discover companion Turtle files used to enrich the table: SKOS taxonomies
 * (for the Options column) and OWL ontologies (for rdfs:comment
 * descriptions). By convention these live in a sibling `ttl/` directory next
 * to the SHACL `shacl/` directory. Missing directories are tolerated.
 */
function companionFiles (shaclAbsPath, enrichDir) {
  const dir = enrichDir || path.resolve(path.dirname(shaclAbsPath), '..', 'ttl')
  let entries = []
  try {
    entries = fs.readdirSync(dir)
  } catch {
    return []
  }
  return entries
    .filter(f => f.endsWith('.ttl'))
    .map(f => path.join(dir, f))
}

/**
 * Generate a Markdown table describing the first-level properties of a SHACL
 * entity (targetClass).
 *
 * @param {object} opts
 * @param {string} opts.shaclPath  Path to the SHACL file (relative to rootDir).
 * @param {string} opts.entity     targetClass local name or full IRI.
 * @param {string} [opts.rootDir]  Base for resolving shaclPath (default cwd).
 * @param {string} [opts.enrichDir] Override dir for taxonomy/ontology files.
 * @param {(msg:string)=>void} [opts.onWarn] Sink for non-fatal warnings
 *   (default: stderr). Companion files that fail to parse are skipped and
 *   reported here rather than aborting the table.
 * @returns {string} Markdown table.
 */
function generateTable ({ shaclPath, entity, rootDir = process.cwd(), enrichDir, onWarn } = {}) {
  if (!shaclPath) throw new Error('shaclPath is required')
  if (!entity) throw new Error('entity is required')
  const warn = onWarn || (msg => console.warn(`shacl-table: ${msg}`))

  const shaclAbs = path.resolve(rootDir, shaclPath)
  if (!fs.existsSync(shaclAbs)) {
    throw new Error(`SHACL file not found: ${shaclPath} (resolved to ${shaclAbs})`)
  }

  // The SHACL file must parse; a failure here is fatal.
  const store = new N3.Store()
  const shaclQuads = parseTurtle(fs.readFileSync(shaclAbs, 'utf8'))
  store.addQuads(shaclQuads)

  // Companions (taxonomies + ontologies) only enrich the output, so a broken
  // one is skipped with a warning rather than failing the whole build.
  for (const file of companionFiles(shaclAbs, enrichDir)) {
    if (file === shaclAbs) continue
    try {
      store.addQuads(parseTurtle(fs.readFileSync(file, 'utf8')))
    } catch (err) {
      warn(`skipping unparseable companion ${path.basename(file)}: ${err.message}`)
    }
  }

  const rows = extractProperties(store, shaclQuads, entity)
  return renderTable(store, rows)
}

module.exports = { generateTable, companionFiles }
