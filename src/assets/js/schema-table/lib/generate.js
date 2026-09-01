'use strict'

const fs = require('fs')
const path = require('path')
const { loadModelFile, isClass } = require('./linkml')
const { slugify } = require('./format')
const { extractProperties, resolveVocabulary, findVocabularyEnum } = require('./model')
const { renderTable, renderVocabularyTable } = require('./table')
const {
  diffClassProperties, diffVocabulary, renderDiffTable, renderDiffVocabularyTable
} = require('./diff')

/** Read and parse a LinkML model, resolving its path against rootDir. */
function readModel (modelPath, rootDir) {
  const abs = path.resolve(rootDir, modelPath)
  if (!fs.existsSync(abs)) {
    throw new Error(`LinkML model file not found: ${modelPath} (resolved to ${abs})`)
  }
  return loadModelFile(abs)
}

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
 * @param {boolean} [opts.showLabel=true] Whether a vocabulary table includes the
 *   Label column. `false` renders Code / Definition only (no effect on a class
 *   property table).
 * @returns {string} Markdown table (a property table, or a vocabulary table
 *   wrapped in a <details> element).
 */
function generateTable ({ modelPath, entity, rootDir = process.cwd(), pageHeadings, optionsLimit, collapsible = true, showLabel = true } = {}) {
  if (!modelPath) throw new Error('modelPath is required')
  if (!entity) throw new Error('entity is required')

  const abs = path.resolve(rootDir, modelPath)
  if (!fs.existsSync(abs)) {
    throw new Error(`LinkML model file not found: ${modelPath} (resolved to ${abs})`)
  }

  const model = loadModelFile(abs)

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
    return `${renderTable(rows, availableAnchors, optionsLimit)}\n{: .schema-table}`
  }

  const enumName = findVocabularyEnum(model, entity)
  if (enumName) {
    const { concepts } = resolveVocabulary(model, enumName)
    return renderVocabularyTable(concepts, { collapsible, showLabel })
  }

  throw new Error(
    `No class, and no controlled-vocabulary property or enum, matching "${entity}" was found.`
  )
}

/**
 * Generate a diff table for an entity between two versions of a LinkML model.
 * Like {@link generateTable}, but compares `previousPath` against `modelPath` and
 * emits a Markdown table whose rows/cells carry inline HTML diff markup (added / removed /
 * changed). The entity is resolved as a class (property table) in either version,
 *
 * @param {object} opts
 * @param {string} opts.modelPath     Path to the current LinkML YAML file.
 * @param {string} opts.previousPath  Path to the previous LinkML YAML file.
 * @param {string} opts.entity        Class name, or a controlled-vocabulary property/enum name.
 * @param {string} [opts.rootDir]     Base for resolving the paths (default cwd).
 * @param {string[]} [opts.pageHeadings] See {@link generateTable}.
 * @param {boolean} [opts.showLabel=true] See {@link generateTable}.
 * @returns {string} An HTML diff table (a property table, or a vocabulary table
 *   wrapped in a <details> element).
 */
function generateDiffTable ({ modelPath, previousPath, entity, rootDir = process.cwd(), pageHeadings, optionsLimit, collapsible = true, showLabel = true } = {}) {
  if (!modelPath) throw new Error('modelPath is required')
  if (!previousPath) throw new Error('previousPath is required')
  if (!entity) throw new Error('entity is required')

  const current = readModel(modelPath, rootDir)
  const previous = readModel(previousPath, rootDir)

  const availableAnchors = pageHeadings === undefined ? null : new Set(pageHeadings.map(slugify))

  if (isClass(current, entity) || isClass(previous, entity)) {
    return renderDiffTable(diffClassProperties(current, previous, entity, availableAnchors, optionsLimit))
  }

  const enumName = findVocabularyEnum(current, entity) || findVocabularyEnum(previous, entity)
  if (enumName) {
    return renderDiffVocabularyTable(
      diffVocabulary(current, previous, enumName, { showLabel }), { collapsible, showLabel }
    )
  }

  throw new Error(
    `No class, and no controlled-vocabulary property or enum, matching "${entity}" was found.`
  )
}

module.exports = { generateTable, generateDiffTable }
