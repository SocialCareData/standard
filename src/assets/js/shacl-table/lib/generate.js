'use strict'

const fs = require('fs')
const path = require('path')
const N3 = require('n3')
const { parseTurtle } = require('./rdf')
const { slugify } = require('./format')
const { extractProperties, findVocabularyList, orderedPropertyNodes } = require('./model')
const { renderTable, renderVocabularyTable } = require('./table')

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
 * The second argument is resolved smartly: if it names a `sh:targetClass`, the
 * usual property table is produced; otherwise, if it names a property whose
 * values come from a controlled vocabulary (`sh:in`), a collapsible
 * "Code" / "Description" vocabulary table is produced instead.
 *
 * @param {object} opts
 * @param {string} opts.shaclPath  Path to the SHACL file (relative to rootDir).
 * @param {string} opts.entity     targetClass or property local name (or full IRI).
 * @param {string} [opts.rootDir]  Base for resolving shaclPath (default cwd).
 * @param {string} [opts.enrichDir] Override dir for taxonomy/ontology files.
 * @param {string[]} [opts.pageHeadings] Heading texts present on the page the
 *   table is being rendered into. When supplied (even if empty), the Options
 *   column links to a taxonomy section only if a matching heading exists, and
 *   otherwise lists the vocabulary's values inline. When omitted (e.g. the
 *   CLI), the link is always emitted.
 * @param {(msg:string)=>void} [opts.onWarn] Sink for non-fatal warnings
 *   (default: stderr). Companion files that fail to parse are skipped and
 *   reported here rather than aborting the table.
 * @returns {string} Markdown table (a property table, or a vocabulary table
 *   wrapped in a <details> element).
 */
function generateTable ({ shaclPath, entity, rootDir = process.cwd(), enrichDir, pageHeadings, onWarn } = {}) {
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

  // Prefer a class (targetClass) match, preserving the original behaviour; fall
  // back to treating the argument as a controlled-vocabulary property name.
  if (orderedPropertyNodes(shaclQuads, entity).matched) {
    const rows = extractProperties(store, shaclQuads, entity)
    // Map the page's headings to the anchors kramdown will generate, so the
    // Options column can tell whether a taxonomy has a section to link to.
    const availableAnchors = pageHeadings === undefined
      ? null
      : new Set(pageHeadings.map(slugify))
    // The `{: .shacl-table}` IAL tags the generated <table> with a class so it
    // can be styled without affecting other tables on the site.
    return `${renderTable(store, rows, availableAnchors)}\n{: .shacl-table}`
  }

  const inList = findVocabularyList(store, shaclQuads, entity)
  if (inList) {
    return renderVocabularyTable(store, inList)
  }

  throw new Error(
    `No sh:NodeShape with sh:targetClass, and no controlled-vocabulary property, matching "${entity}" was found.`
  )
}

module.exports = { generateTable, companionFiles }
