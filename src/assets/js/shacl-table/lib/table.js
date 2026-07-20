'use strict'

const { localName } = require('./rdf')
const { datatypeLabel, cardinality } = require('./format')
const { resolveOptions } = require('./model')

const COLUMNS = ['Field name', 'Cardinality', 'Data Type', 'Description', 'Options']

/** Make a value safe to place inside a Markdown table cell. */
function escapeCell (text) {
  return String(text == null ? '' : text)
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim()
}

/**
 * The "Data Type" cell. A property typed by another entity (`sh:class`)
 * becomes a link to that entity's section; a controlled vocabulary
 * (`sh:in`) is "Categorical"; otherwise the xsd datatype label.
 */
function dataTypeCell (row) {
  if (row.classRef) {
    const name = localName(row.classRef)
    return `[${name}](#${name.toLowerCase()})`
  }
  if (row.inList) return 'Categorical'
  if (row.datatype) return datatypeLabel(row.datatype)
  return ''
}

/**
 * The "Options" cell: for a controlled vocabulary, a link to the taxonomy
 * section plus up to three example labels. Empty for everything else.
 */
function optionsCell (store, row) {
  if (!row.inList) return ''
  const { title, anchor, examples, more } = resolveOptions(store, row.inList)
  const tail = more ? ' …' : ''
  return `[${title}](#${anchor}): ${examples.join(', ')}${tail}`
}

/** Convert a semantic property row into escaped display cells. */
function toViewRow (store, row) {
  return [
    `\`${escapeCell(row.name)}\``,
    escapeCell(cardinality(row.cardinality.min, row.cardinality.max)),
    escapeCell(dataTypeCell(row)),
    escapeCell(row.description),
    escapeCell(optionsCell(store, row))
  ]
}

/** Render an array of cell-arrays as a GitHub/kramdown Markdown table. */
function renderMarkdown (viewRows) {
  const lines = [
    `| ${COLUMNS.join(' | ')} |`,
    `| ${COLUMNS.map(() => '---').join(' | ')} |`,
    ...viewRows.map(cells => `| ${cells.join(' | ')} |`)
  ]
  return lines.join('\n')
}

/** Build the full Markdown table for a set of semantic property rows. */
function renderTable (store, rows) {
  return renderMarkdown(rows.map(row => toViewRow(store, row)))
}

module.exports = { renderTable, renderMarkdown, toViewRow, dataTypeCell, optionsCell, escapeCell, COLUMNS }
