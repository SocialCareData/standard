'use strict'

const { datatypeLabel, cardinality } = require('./format')

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
 * The "Data Type" cell. A property typed by another class becomes a link to
 * that class's section; a controlled vocabulary (enum range) is "Categorical";
 * otherwise the datatype label.
 */
function dataTypeCell (row) {
  if (row.classRef) return `[${row.classRef}](#${row.classRef.toLowerCase()})`
  if (row.enumName) return 'Categorical'
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
 * the CLI), in which case the link is always emitted.
 */
function optionsCell (row, availableAnchors) {
  if (!row.options) return ''
  const { title, anchor, labels } = row.options
  const linked = !availableAnchors || availableAnchors.has(anchor)
  if (linked) {
    const examples = labels.slice(0, 3)
    const tail = labels.length > 3 ? ' …' : ''
    return `[${title}](#${anchor}): ${examples.join(', ')}${tail}`
  }
  return labels.join(', ')
}

/** Convert a semantic property row into escaped display cells. */
function toViewRow (row, availableAnchors) {
  return [
    `\`${escapeCell(row.name)}\``,
    escapeCell(cardinality(row.cardinality.min, row.cardinality.max)),
    escapeCell(dataTypeCell(row)),
    escapeCell(row.description),
    escapeCell(optionsCell(row, availableAnchors))
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
 * Build the full Markdown property table for a class's rows.
 *
 * @param {Set<string>} [availableAnchors] Section anchors present on the target
 *   page; controls whether the Options column links to a taxonomy section or
 *   lists its values inline. See {@link optionsCell}.
 */
function renderTable (rows, availableAnchors) {
  return renderMarkdown(rows.map(row => toViewRow(row, availableAnchors)))
}

/**
 * Render an enum's permissible values as a two-column "Code" / "Description"
 * Markdown table wrapped in a collapsible <details>/<summary> element.
 *
 * The blank line after <summary> and before </details> is required so kramdown
 * parses the enclosed Markdown table into a real HTML <table>; the trailing
 * `{: .table-bordered}` IAL styles it to match the other vocabulary tables.
 */
function renderVocabularyTable (concepts) {
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
