'use strict'

const {
  getClass,
  getEnum,
  getSlot,
  classSlotNames,
  resolveSlot,
  rangeKind,
  typeXsd,
  permissibleValues,
  enumTitle
} = require('./linkml')
const { slugify } = require('./format')

/**
 * Turns the LinkML model into the semantic rows the renderer needs:
 *   - {@link extractProperties} — the ordered property rows of a class;
 *   - {@link resolveOptions} — the taxonomy link + labels for an enum-ranged
 *     (controlled-vocabulary) property's "Options" column;
 *   - {@link resolveVocabulary} — the Code / Description rows for an enum's
 *     collapsible vocabulary table, with any parent/child hierarchy the codes
 *     imply (see {@link addHierarchy});
 *   - {@link findVocabularyEnum} — resolve a property (or enum) name to the
 *     enum whose values a vocabulary table should list.
 */

// ---------------------------------------------------------------------------
// Property extraction (class -> rows)
// ---------------------------------------------------------------------------

/**
 * Extract the property rows for a class. Cardinality comes from the slot's
 * `required` (min) and `multivalued` (max); the range decides whether the row
 * is a datatype, a link to another class, or a controlled vocabulary.
 *
 * @returns {{name,cardinality:{min,max},kind,classRef,enumName,datatype,description,options}[]}
 */
function extractProperties (model, className) {
  if (!getClass(model, className)) {
    throw new Error(`No class matching "${className}" was found.`)
  }
  return classSlotNames(model, className).map(name => {
    const slot = resolveSlot(model, className, name)
    const range = slot.range || model.default_range || 'string'
    const kind = rangeKind(model, range)
    const row = {
      name,
      // Display label for the Field name cell: a slot's `title` when set (e.g.
      // where the wire/JSON key differs from the LinkML slot name), else the
      // slot name itself.
      label: slot.title || name,
      cardinality: { min: slot.required ? 1 : 0, max: slot.multivalued ? undefined : 1 },
      kind,
      classRef: kind === 'class' ? range : undefined,
      enumName: kind === 'enum' ? range : undefined,
      datatype: kind === 'type' ? typeXsd(model, range) : undefined,
      description: slot.description || ''
    }
    if (kind === 'enum') row.options = resolveOptions(model, range)
    return row
  })
}

// ---------------------------------------------------------------------------
// Controlled-vocabulary (enum) resolution
// ---------------------------------------------------------------------------

/** Append " Taxonomy" to an enum title unless it already ends in taxonomy/vocabulary. */
function taxonomyTitle (rawTitle) {
  return /(taxonomy|vocabulary)$/i.test(rawTitle) ? rawTitle : `${rawTitle} Taxonomy`
}

/**
 * Resolve an enum into the pieces the "Options" column needs: the taxonomy
 * title + anchor and the full list of value labels (permissible-value titles).
 *
 * @returns {{title,anchor,labels:string[]}}
 */
function resolveOptions (model, enumName) {
  const title = taxonomyTitle(enumTitle(model, enumName))
  return {
    title,
    anchor: slugify(title),
    labels: permissibleValues(model, enumName).map(pv => pv.title)
  }
}

// ---------------------------------------------------------------------------
// Vocabulary hierarchy (inferred from dot-notation codes)
// ---------------------------------------------------------------------------

// LinkML has no way to declare that one permissible value is a narrower term of
// another, but the codes themselves say so: `SEND.SpLD` is a sub-type of
// `SEND`, `accommodation-status.refuge` of `accommodation-status`. So the
// hierarchy is read back off the codes, treating `.` as the separator.
const CODE_SEPARATOR = '.'

/**
 * The nearest ancestor of `code` that is itself a code in `codes`: the longest
 * dot-separated prefix present in the vocabulary, or null when there is none.
 *
 * Only prefixes that really exist as permissible values count, so a dotted code
 * whose parent was never declared (e.g. `CA.nutrition` with no `CA`) stays a
 * top-level term rather than being nested under a phantom parent.
 */
function nearestAncestor (code, codes) {
  const parts = String(code).split(CODE_SEPARATOR)
  for (let i = parts.length - 1; i > 0; i--) {
    const candidate = parts.slice(0, i).join(CODE_SEPARATOR)
    if (codes.has(candidate)) return candidate
  }
  return null
}

/**
 * Annotate concepts with the hierarchy their codes imply and order them as a
 * tree: each concept gains `parent` (the code of its nearest declared ancestor,
 * or null), `depth` (0 for a top-level term) and `hasChildren`.
 *
 * Ordering is depth-first and stable: top-level terms keep their declaration
 * order, and every descendant follows its parent — so a child declared away
 * from its parent still renders beneath it. A flat vocabulary (no code is a
 * prefix of another) comes back annotated but otherwise untouched.
 *
 * @returns {{code,label,description,parent:?string,depth:number,hasChildren:boolean}[]}
 */
function addHierarchy (concepts) {
  const codes = new Set(concepts.map(c => c.code))
  // Children by parent code, in declaration order; null keys the roots.
  const childrenOf = new Map()
  concepts.forEach(concept => {
    const parent = nearestAncestor(concept.code, codes)
    const siblings = childrenOf.get(parent) || []
    siblings.push({ ...concept, parent })
    childrenOf.set(parent, siblings)
  })

  const ordered = []
  const visit = (concept, depth) => {
    const children = childrenOf.get(concept.code) || []
    ordered.push({ ...concept, depth, hasChildren: children.length > 0 })
    children.forEach(child => visit(child, depth + 1))
  }
  ;(childrenOf.get(null) || []).forEach(root => visit(root, 0))
  return ordered
}

/** Whether any concept in a resolved vocabulary sits below a parent term. */
function isHierarchical (concepts) {
  return concepts.some(c => c.depth > 0)
}

/**
 * Resolve an enum into the rows a vocabulary table needs: one
 * `{ code, label, description }` per permissible value, in declaration order.
 * The code is the value's name (its key — the SKOS-style notation used in data,
 * e.g. `1`, `usual`, `MTH`); the label is its `title`; the description its
 * definition.
 *
 * Each row also carries the hierarchy its code implies — `parent`, `depth` and
 * `hasChildren` — so the renderer can indent narrower terms under broader ones.
 * See {@link addHierarchy}.
 *
 * @returns {{concepts:{code,label,description,parent,depth,hasChildren}[]}}
 */
function resolveVocabulary (model, enumName) {
  return {
    concepts: addHierarchy(permissibleValues(model, enumName).map(pv => ({
      code: pv.name,
      label: pv.title,
      description: pv.description || ''
    })))
  }
}

/**
 * Resolve an entity name to the enum a vocabulary table should list: either a
 * property (slot) name whose range is an enum, or an enum name directly.
 * Returns the enum name, or null when neither applies.
 */
function findVocabularyEnum (model, entity) {
  const slot = getSlot(model, entity)
  if (slot && rangeKind(model, slot.range) === 'enum') return slot.range
  if (getEnum(model, entity)) return entity
  return null
}

module.exports = {
  extractProperties,
  resolveOptions,
  resolveVocabulary,
  findVocabularyEnum,
  addHierarchy,
  isHierarchical,
  nearestAncestor,
  CODE_SEPARATOR
}
