'use strict'

const { datatypeLabel, cardinality } = require('./format')

const COLUMNS = ['Field name', 'Cardinality', 'Data Type', 'Description', 'Options']
const VOCAB_COLUMNS = ['Code', 'Label', 'Definition']

/** Make a value safe to place inside a Markdown table cell. */
function escapeCell (text) {
  return String(text == null ? '' : text)
    .replace(/\r?\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim()
}

/**
 * Make a value safe to place inside inline HTML within a Markdown table cell
 * (used by the diff table). Whitespace (including newlines) is collapsed so
 * multi-line descriptions sit on one line, and `|` is encoded so cell text can
 * never break the surrounding pipe table.
 */
function escapeHtml (text) {
  return String(text == null ? '' : text)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\|/g, '&#124;')
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

// Default number of example values previewed in the Options column.
const DEFAULT_OPTIONS_LIMIT = 3

/**
 * Normalise an options-preview limit to a positive integer or Infinity.
 * Accepts a number, a numeric string, or the string `'all'` (→ Infinity).
 * Anything invalid falls back to {@link DEFAULT_OPTIONS_LIMIT}.
 */
function normalizeOptionsLimit (limit) {
  if (limit === 'all' || limit === Infinity) return Infinity
  const n = typeof limit === 'number' ? limit : parseInt(String(limit), 10)
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_OPTIONS_LIMIT
}

/**
 * The "Options" cell for a controlled vocabulary. When the taxonomy has its own
 * section on the page (its anchor is in `availableAnchors`) the cell links to
 * that section and previews up to `optionsLimit` example labels (default 3;
 * `'all'`/`Infinity` shows every value with no ellipsis) — otherwise there is
 * nothing to link to, so it lists every possible value instead.
 *
 * `availableAnchors` of `null`/`undefined` means "page context unknown" (e.g.
 * the CLI), in which case the link is always emitted.
 */
function optionsCell (row, availableAnchors, optionsLimit = DEFAULT_OPTIONS_LIMIT) {
  if (!row.options) return ''
  const { title, anchor, labels } = row.options
  const linked = !availableAnchors || availableAnchors.has(anchor)
  if (linked) {
    const limit = normalizeOptionsLimit(optionsLimit)
    const examples = labels.slice(0, limit)
    const tail = labels.length > examples.length ? ' …' : ''
    return `[${title}](#${anchor}): ${examples.join(', ')}${tail}`
  }
  return labels.join(', ')
}

/** Convert a semantic property row into escaped display cells. */
function toViewRow (row, availableAnchors, optionsLimit) {
  return [
    `\`${escapeCell(row.label || row.name)}\``,
    escapeCell(cardinality(row.cardinality.min, row.cardinality.max)),
    escapeCell(dataTypeCell(row)),
    escapeCell(row.description),
    escapeCell(optionsCell(row, availableAnchors, optionsLimit))
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
 * @param {number|string} [optionsLimit] How many example values the Options
 *   column previews (default 3; `'all'` shows every value). See {@link optionsCell}.
 */
function renderTable (rows, availableAnchors, optionsLimit) {
  return renderMarkdown(rows.map(row => toViewRow(row, availableAnchors, optionsLimit)))
}

/**
 * Render an enum's permissible values as a "Code" / "Label" / "Definition"
 * Markdown table. By default it is wrapped in a collapsible <details>/<summary>
 * element; pass `{ collapsible: false }` to emit just the table.
 *
 * The blank line after <summary> and before </details> is required so kramdown
 * parses the enclosed Markdown table into a real HTML <table>; the trailing
 * `{: .table-bordered}` IAL styles it to match the other vocabulary tables.
 */
function renderVocabularyTable (concepts, { collapsible = true } = {}) {
  const body = [
    `| ${VOCAB_COLUMNS.join(' | ')} |`,
    '| :--- | :--- | :--- |',
    ...concepts.map(c => `| \`${escapeCell(c.code)}\` | ${escapeCell(c.label)} | ${escapeCell(c.description)} |`)
  ].join('\n')

  if (!collapsible) return `${body}\n{: .table-bordered}`

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
  normalizeOptionsLimit,
  DEFAULT_OPTIONS_LIMIT,
  escapeCell,
  escapeHtml,
  COLUMNS,
  VOCAB_COLUMNS
}
