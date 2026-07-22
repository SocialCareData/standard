'use strict'

const fs = require('fs')
const path = require('path')
const { loadModel, isClass } = require('./linkml')
const { slugify } = require('./format')
const { extractProperties, resolveVocabulary, findVocabularyEnum } = require('./model')
const { renderTable, renderVocabularyTable } = require('./table')

/**
 * Generate a Markdown table for an entity in a LinkML model.
 *
 * The second argument is resolved smartly: if it names a class, the usual
 * property table is produced; otherwise, if it names a property (slot) whose
 * range is a controlled vocabulary (enum) — or an enum directly — a collapsible
 * "Code" / "Description" vocabulary table is produced instead.
 *
 * @param {object} opts
 * @param {string} opts.modelPath  Path to the LinkML YAML file (relative to rootDir).
 * @param {string} opts.entity     Class name, or a controlled-vocabulary property/enum name.
 * @param {string} [opts.rootDir]  Base for resolving modelPath (default cwd).
 * @param {string[]} [opts.pageHeadings] Heading texts present on the page the
 *   table is being rendered into. When supplied (even if empty), a class table's
 *   Options column links to a taxonomy section only if a matching heading
 *   exists, and otherwise lists the vocabulary's values inline. When omitted
 *   (e.g. the CLI), the link is always emitted.
 * @returns {string} Markdown table (a property table, or a vocabulary table
 *   wrapped in a <details> element).
 */
function generateTable ({ modelPath, entity, rootDir = process.cwd(), pageHeadings } = {}) {
  if (!modelPath) throw new Error('modelPath is required')
  if (!entity) throw new Error('entity is required')

  const abs = path.resolve(rootDir, modelPath)
  if (!fs.existsSync(abs)) {
    throw new Error(`LinkML model file not found: ${modelPath} (resolved to ${abs})`)
  }

  const model = loadModel(fs.readFileSync(abs, 'utf8'))

  // Prefer a class match (property table); fall back to a controlled-vocabulary
  // property/enum name (vocabulary table).
  if (isClass(model, entity)) {
    const rows = extractProperties(model, entity)
    // Map the page's headings to the anchors kramdown will generate, so the
    // Options column can tell whether a taxonomy has a section to link to.
    const availableAnchors = pageHeadings === undefined
      ? null
      : new Set(pageHeadings.map(slugify))
    // The `{: .schema-table}` IAL tags the generated <table> with a class so it
    // can be styled without affecting other tables on the site.
    return `${renderTable(rows, availableAnchors)}\n{: .schema-table}`
  }

  const enumName = findVocabularyEnum(model, entity)
  if (enumName) {
    const { concepts } = resolveVocabulary(model, enumName)
    return renderVocabularyTable(concepts)
  }

  throw new Error(
    `No class, and no controlled-vocabulary property or enum, matching "${entity}" was found.`
  )
}

module.exports = { generateTable }
