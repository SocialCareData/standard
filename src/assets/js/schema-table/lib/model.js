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
 *     collapsible vocabulary table;
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

/**
 * Resolve an enum into the rows a vocabulary table needs: one
 * `{ code, description }` per permissible value, in declaration order. The code
 * is the value's `title` (falling back to its name); the description its
 * definition (falling back to its title).
 *
 * @returns {{concepts:{code:string,description:string}[]}}
 */
function resolveVocabulary (model, enumName) {
  return {
    concepts: permissibleValues(model, enumName).map(pv => ({
      code: pv.title,
      description: pv.description || pv.title
    }))
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
  findVocabularyEnum
}
