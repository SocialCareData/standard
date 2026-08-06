'use strict'

const { getClass } = require('./linkml')
const { extractProperties, resolveVocabulary } = require('./model')
const { cardinality, datatypeLabel } = require('./format')
const { escapeHtml, normalizeOptionsLimit, COLUMNS, VOCAB_COLUMNS } = require('./table')

/**
 * Diff two versions of a LinkML model and render the result as a Markdown table
 * whose cell contents carry inline HTML for the diff colours: added = green
 * text, removed = red struck-through text, changed = old value struck through
 * beside the new. kramdown builds the <table> (so it is styled like the plain
 * tables); only text is coloured, since Markdown cannot class a <td>/<tr>.
 *
 * Both the "current" and "previous" models are the plain parsed-YAML objects
 * produced by {@link module:linkml.loadModel}. Properties are matched by name
 * and enum values by code; ordering follows the current version, with removed
 * entries slotted back in after their previous-version predecessor.
 */

// ---------------------------------------------------------------------------
// Cell builders — each returns { text, html }: `text` is the canonical value
// used to decide whether a cell changed; `html` is what is displayed.
// ---------------------------------------------------------------------------

/** The "Data Type" cell for a property row (links class ranges, like the plain table). */
function dataTypeCellDiff (row) {
  if (row.classRef) {
    return {
      text: row.classRef,
      html: `<a href="#${row.classRef.toLowerCase()}">${escapeHtml(row.classRef)}</a>`
    }
  }
  if (row.enumName) return { text: 'Categorical', html: 'Categorical' }
  if (row.datatype) {
    const label = datatypeLabel(row.datatype)
    return { text: label, html: escapeHtml(label) }
  }
  return { text: '', html: '' }
}

/**
 * The "Options" cell for a controlled-vocabulary property row. The comparison
 * `text` covers the taxonomy title and every value label (so a change to the
 * vocabulary is detected regardless of whether the page links to it); the `html`
 * mirrors the plain table (link + up to three examples when the taxonomy has a
 * section on the page, otherwise the full list inline).
 */
function optionsCellDiff (row, availableAnchors, optionsLimit) {
  if (!row.options) return { text: '', html: '' }
  const { title, anchor, labels } = row.options
  const text = `${title}: ${labels.join(', ')}`
  const linked = !availableAnchors || availableAnchors.has(anchor)
  if (linked) {
    const limit = normalizeOptionsLimit(optionsLimit)
    const shown = labels.slice(0, limit)
    const examples = shown.join(', ')
    const tail = labels.length > shown.length ? ' …' : ''
    return { text, html: `<a href="#${anchor}">${escapeHtml(title)}</a>: ${escapeHtml(examples + tail)}` }
  }
  return { text, html: escapeHtml(labels.join(', ')) }
}

/** The five `{ text, html }` cells of a property row, in {@link COLUMNS} order. */
function propertyCells (row, availableAnchors, optionsLimit) {
  const card = cardinality(row.cardinality.min, row.cardinality.max)
  return [
    { text: row.name, html: `<code>${escapeHtml(row.name)}</code>` },
    { text: card, html: escapeHtml(card) },
    dataTypeCellDiff(row),
    { text: (row.description || '').replace(/\s+/g, ' ').trim(), html: escapeHtml(row.description) },
    optionsCellDiff(row, availableAnchors, optionsLimit)
  ]
}

/** The three `{ text, html }` cells of a vocabulary row, in {@link VOCAB_COLUMNS} order. */
function vocabularyCells (concept) {
  return [
    { text: concept.code, html: `<code>${escapeHtml(concept.code)}</code>` },
    { text: (concept.label || '').replace(/\s+/g, ' ').trim(), html: escapeHtml(concept.label) },
    { text: (concept.description || '').replace(/\s+/g, ' ').trim(), html: escapeHtml(concept.description) }
  ]
}

// ---------------------------------------------------------------------------
// Row diffing — shared by class-property and vocabulary tables.
// ---------------------------------------------------------------------------

/**
 * Diff two entities (matched by `key`) into ordered rows tagged with a status.
 * `cellsOf(entity)` returns that entity's `{ text, html }` cells.
 *
 * Ordering: the current entities in their own order; each removed entity is
 * re-inserted immediately after its previous-version predecessor that still
 * exists (or at the top, preserving previous order, when none survives).
 *
 * @returns {{key,status,cells}[]} status ∈ unchanged | added | removed | changed
 */
function diffRows (curList, prevList, keyOf, cellsOf) {
  const curByKey = new Map(curList.map(e => [keyOf(e), e]))
  const prevByKey = new Map(prevList.map(e => [keyOf(e), e]))

  const rows = curList.map(cur => {
    const key = keyOf(cur)
    const prev = prevByKey.get(key)
    const curCells = cellsOf(cur)
    if (!prev) {
      return { key, status: 'added', cells: curCells.map(c => ({ changed: false, html: c.html })) }
    }
    const prevCells = cellsOf(prev)
    let changed = false
    const cells = curCells.map((c, i) => {
      if (c.text !== prevCells[i].text) {
        changed = true
        return { changed: true, html: c.html, oldHtml: prevCells[i].html }
      }
      return { changed: false, html: c.html }
    })
    return { key, status: changed ? 'changed' : 'unchanged', cells }
  })

  // Re-insert removed entities near where they used to be.
  let topInsert = 0
  prevList.forEach((prev, prevIdx) => {
    const key = keyOf(prev)
    if (curByKey.has(key)) return
    const row = { key, status: 'removed', cells: cellsOf(prev).map(c => ({ changed: false, html: c.html })) }
    let anchorKey = null
    for (let k = prevIdx - 1; k >= 0; k--) {
      if (curByKey.has(keyOf(prevList[k]))) { anchorKey = keyOf(prevList[k]); break }
    }
    if (anchorKey == null) {
      rows.splice(topInsert++, 0, row)
    } else {
      const at = rows.findIndex(r => r.key === anchorKey)
      rows.splice(at + 1, 0, row)
    }
  })

  return rows
}

/**
 * Diff the property rows of one class between two model versions.
 * @returns {{classStatus:'present'|'added'|'removed', rows:object[]}}
 */
function diffClassProperties (currentModel, previousModel, className, availableAnchors, optionsLimit) {
  const inCurrent = !!getClass(currentModel, className)
  const inPrevious = !!getClass(previousModel, className)
  const curRows = inCurrent ? extractProperties(currentModel, className) : []
  const prevRows = inPrevious ? extractProperties(previousModel, className) : []
  const classStatus = inCurrent && inPrevious ? 'present' : inCurrent ? 'added' : 'removed'
  const rows = diffRows(
    curRows, prevRows,
    r => r.name,
    r => propertyCells(r, availableAnchors, optionsLimit)
  )
  return { classStatus, rows }
}

/**
 * Diff the permissible values of one enum between two model versions.
 * @returns {{rows:object[]}}
 */
function diffVocabulary (currentModel, previousModel, enumName) {
  const curConcepts = (currentModel.enums || {})[enumName] ? resolveVocabulary(currentModel, enumName).concepts : []
  const prevConcepts = (previousModel.enums || {})[enumName] ? resolveVocabulary(previousModel, enumName).concepts : []
  const rows = diffRows(curConcepts, prevConcepts, c => c.code, vocabularyCells)
  return { rows }
}

// ---------------------------------------------------------------------------
// Rendering — Markdown tables whose cell contents carry inline HTML so kramdown
// builds a normal <table> (styled like the plain tables) while the diff shows
// through as coloured text: added = green, removed = red struck-through, changed
// = old value struck through beside the new. Markdown offers no way to class a
// <td>/<tr>, so only the text is coloured, not the cell background.
// ---------------------------------------------------------------------------

/**
 * Wrap a cell's inline HTML for display according to the row/cell status.
 * `html` is already HTML (links, <code>, escaped text), so kramdown passes it
 * through untouched inside the Markdown cell.
 */
function decorateCell (cell, rowStatus) {
  if (cell.changed) {
    return `<del class="diff-old">${cell.oldHtml}</del> <ins class="diff-new">${cell.html}</ins>`
  }
  if (!cell.html) return cell.html
  if (rowStatus === 'added') return `<span class="diff-added">${cell.html}</span>`
  if (rowStatus === 'removed') return `<del class="diff-removed">${cell.html}</del>`
  return cell.html
}

/** Render diffed rows as a kramdown pipe table (header + alignment + body). */
function renderDiffMarkdown (rows, columns, align = '---') {
  const lines = [
    `| ${columns.join(' | ')} |`,
    `| ${columns.map(() => align).join(' | ')} |`,
    ...rows.map(row => `| ${row.cells.map(c => decorateCell(c, row.status)).join(' | ')} |`)
  ]
  return lines.join('\n')
}

/**
 * Render a class property diff as a Markdown table. The `{: .schema-table
 * .schema-diff}` IAL tags the generated <table> so it is styled like the plain
 * property table, plus the diff text colours.
 */
function renderDiffTable ({ rows }) {
  return `${renderDiffMarkdown(rows, COLUMNS)}\n{: .schema-table .schema-diff}`
}

/**
 * Render an enum vocabulary diff as a Markdown table inside the same collapsible
 * <details>/<summary> wrapper the plain vocabulary tables use. The blank lines
 * around the table are required so kramdown parses it into a real <table>.
 */
function renderDiffVocabularyTable ({ rows }) {
  const body = renderDiffMarkdown(rows, VOCAB_COLUMNS, ':---')
  return [
    '<details>',
    '<summary markdown="span">See vocabulary</summary>',
    '',
    body,
    '{: .table-bordered .schema-diff}',
    '',
    '</details>'
  ].join('\n')
}

module.exports = {
  diffClassProperties,
  diffVocabulary,
  renderDiffTable,
  renderDiffVocabularyTable
}
