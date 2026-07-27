'use strict'

const { getClass } = require('./linkml')
const { extractProperties, resolveVocabulary } = require('./model')
const { cardinality, datatypeLabel } = require('./format')
const { escapeHtml, COLUMNS, VOCAB_COLUMNS } = require('./table')

/**
 * Diff two versions of a LinkML model and render the result as an HTML table
 * (not Markdown — HTML is needed so rows and cells can carry the diff classes
 * the stylesheet colours: added = green row, removed = red struck-through row,
 * changed = yellow cell showing the old value struck through beside the new).
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
function optionsCellDiff (row, availableAnchors) {
  if (!row.options) return { text: '', html: '' }
  const { title, anchor, labels } = row.options
  const text = `${title}: ${labels.join(', ')}`
  const linked = !availableAnchors || availableAnchors.has(anchor)
  if (linked) {
    const examples = labels.slice(0, 3).join(', ')
    const tail = labels.length > 3 ? ' …' : ''
    return { text, html: `<a href="#${anchor}">${escapeHtml(title)}</a>: ${escapeHtml(examples + tail)}` }
  }
  return { text, html: escapeHtml(labels.join(', ')) }
}

/** The five `{ text, html }` cells of a property row, in {@link COLUMNS} order. */
function propertyCells (row, availableAnchors) {
  const card = cardinality(row.cardinality.min, row.cardinality.max)
  return [
    { text: row.name, html: `<code>${escapeHtml(row.name)}</code>` },
    { text: card, html: escapeHtml(card) },
    dataTypeCellDiff(row),
    { text: (row.description || '').replace(/\s+/g, ' ').trim(), html: escapeHtml(row.description) },
    optionsCellDiff(row, availableAnchors)
  ]
}

/** The two `{ text, html }` cells of a vocabulary row, in {@link VOCAB_COLUMNS} order. */
function vocabularyCells (concept) {
  return [
    { text: concept.code, html: `<code>${escapeHtml(concept.code)}</code>` },
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
function diffClassProperties (currentModel, previousModel, className, availableAnchors) {
  const inCurrent = !!getClass(currentModel, className)
  const inPrevious = !!getClass(previousModel, className)
  const curRows = inCurrent ? extractProperties(currentModel, className) : []
  const prevRows = inPrevious ? extractProperties(previousModel, className) : []
  const classStatus = inCurrent && inPrevious ? 'present' : inCurrent ? 'added' : 'removed'
  const rows = diffRows(
    curRows, prevRows,
    r => r.name,
    r => propertyCells(r, availableAnchors)
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
// Rendering — raw HTML tables carrying the diff classes.
// ---------------------------------------------------------------------------

const STATUS_CLASS = { added: 'diff-added', removed: 'diff-removed', changed: 'diff-changed' }

/** Render one cell's inner HTML, wrapping changed/removed content for styling. */
function cellHtml (cell, rowStatus) {
  if (cell.changed) {
    return `<del class="diff-old">${cell.oldHtml}</del> <ins class="diff-new">${cell.html}</ins>`
  }
  if (rowStatus === 'removed') return `<del>${cell.html}</del>`
  return cell.html
}

/** Render diffed rows as an HTML table body under the given column headers. */
function renderRows (rows, columns) {
  const head = `<tr>${columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr>`
  const body = rows.map(row => {
    const cls = STATUS_CLASS[row.status]
    const tr = cls ? `<tr class="${cls}">` : '<tr>'
    const tds = row.cells.map(cell => {
      const tdCls = cell.changed ? ' class="diff-cell"' : ''
      return `<td${tdCls}>${cellHtml(cell, row.status)}</td>`
    }).join('')
    return `${tr}${tds}</tr>`
  })
  return { head, body }
}

/**
 * Render a class property diff as a raw HTML table. `markdown="0"` stops kramdown
 * (which has `parse_block_html: true`) from re-parsing the block, and is stripped
 * from the output. No blank lines inside, for the same reason.
 */
function renderDiffTable ({ rows }) {
  const { head, body } = renderRows(rows, COLUMNS)
  return [
    '<table markdown="0" class="schema-table schema-diff">',
    `<thead>${head}</thead>`,
    '<tbody>',
    ...body,
    '</tbody>',
    '</table>'
  ].join('\n')
}

/**
 * Render an enum vocabulary diff as a raw HTML table inside a collapsible
 * <details> element. Unlike the plain vocabulary table (which lets kramdown
 * parse an inner Markdown table), the whole block is already HTML, so
 * `markdown="0"` on the <details> tells kramdown (parse_block_html: true) to
 * leave the entire subtree verbatim — otherwise it mangles the <summary>/table.
 * With the wrapper marked raw, inner tags must NOT carry `markdown` attributes
 * (kramdown won't descend to strip them).
 */
function renderDiffVocabularyTable ({ rows }) {
  const { head, body } = renderRows(rows, VOCAB_COLUMNS)
  return [
    '<details markdown="0">',
    '<summary>See vocabulary</summary>',
    '<table class="table-bordered schema-diff">',
    `<thead>${head}</thead>`,
    '<tbody>',
    ...body,
    '</tbody>',
    '</table>',
    '</details>'
  ].join('\n')
}

module.exports = {
  diffClassProperties,
  diffVocabulary,
  renderDiffTable,
  renderDiffVocabularyTable
}
