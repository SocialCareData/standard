'use strict'

const { localName } = require('./rdf')
const { datatypeLabel, cardinality } = require('./format')
const { resolveOptions, resolveVocabulary } = require('./model')

const COLUMNS = ['Field name', 'Cardinality', 'Data Type', 'Description', 'Options']
const VOCAB_COLUMNS = ['Code', 'Description']

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
 * The "Options" cell for a controlled vocabulary. When the taxonomy has its own
 * section on the page (its anchor is in `availableAnchors`) the cell links to
 * that section and previews up to three example labels — otherwise there is
 * nothing to link to, so it lists every possible value instead.
 *
 * `availableAnchors` of `null`/`undefined` means "page context unknown" (e.g.
 * the CLI), in which case the link is always emitted, preserving the original
 * behaviour.
 */
function optionsCell (store, row, availableAnchors) {
  if (!row.inList) return ''
  const { title, anchor, labels, examples, more } = resolveOptions(store, row.inList)
  const linked = !availableAnchors || availableAnchors.has(anchor)
  if (linked) {
    const tail = more ? ' …' : ''
    return `[${title}](#${anchor}): ${examples.join(', ')}${tail}`
  }
  return labels.join(', ')
}

/** Convert a semantic property row into escaped display cells. */
function toViewRow (store, row, availableAnchors) {
  return [
    `\`${escapeCell(row.name)}\``,
    escapeCell(cardinality(row.cardinality.min, row.cardinality.max)),
    escapeCell(dataTypeCell(row)),
    escapeCell(row.description),
    escapeCell(optionsCell(store, row, availableAnchors))
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

/**
 * Build the full Markdown table for a set of semantic property rows.
 *
 * @param {Set<string>} [availableAnchors] Section anchors present on the target
 *   page; controls whether the Options column links to a taxonomy section or
 *   lists its values inline. See {@link optionsCell}.
 */
function renderTable (store, rows, availableAnchors) {
  return renderMarkdown(rows.map(row => toViewRow(store, row, availableAnchors)))
}

/**
 * Render a controlled-vocabulary (`sh:in`) value list as a two-column
 * "Code" / "Description" Markdown table wrapped in a collapsible
 * <details>/<summary> element.
 *
 * The blank line after <summary> and before </details> is required so
 * kramdown parses the enclosed Markdown table into a real HTML <table>; the
 * trailing `{: .table-bordered}` IAL styles it to match the other vocabulary
 * tables on the site.
 */
function renderVocabularyTable (store, inList) {
  const { concepts } = resolveVocabulary(store, inList)
  const body = [
    `| ${VOCAB_COLUMNS.join(' | ')} |`,
    '| :--- | :--- |',
    ...concepts.map(c => `| \`${escapeCell(c.code)}\` | ${escapeCell(c.description)} |`)
  ].join('\n')

  return [
    '<details>',
    '<summary markdown="span">See vocabulary</summary>',
    '',
    body,
    '{: .table-bordered}',
    '',
    '</details>'
  ].join('\n')
}

module.exports = {
  renderTable,
  renderVocabularyTable,
  renderMarkdown,
  toViewRow,
  dataTypeCell,
  optionsCell,
  escapeCell,
  COLUMNS,
  VOCAB_COLUMNS
}
