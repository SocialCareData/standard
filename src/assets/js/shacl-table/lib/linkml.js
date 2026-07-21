'use strict'

const yaml = require('js-yaml')

/**
 * Loading and querying of a LinkML schema (the placements data model). This is
 * the single source the tables are generated from; there is no RDF/SHACL
 * parsing any more.
 *
 * A "model" here is just the parsed YAML object: `{ classes, slots, enums,
 * types, prefixes, ... }`.
 */

const XSD = 'http://www.w3.org/2001/XMLSchema#'

// LinkML built-in type name -> the xsd IRI it maps to, so datatype cells get a
// friendly label. Custom types (model.types) are resolved via their own `uri`.
const BUILTIN_TYPE_XSD = {
  string: XSD + 'string',
  uriorcurie: XSD + 'anyURI',
  uri: XSD + 'anyURI',
  ncname: XSD + 'string',
  integer: XSD + 'integer',
  boolean: XSD + 'boolean',
  float: XSD + 'float',
  double: XSD + 'double',
  decimal: XSD + 'decimal',
  date: XSD + 'date',
  datetime: XSD + 'dateTime',
  time: XSD + 'time'
}

/** Parse LinkML YAML text into a model object. */
function loadModel (text) {
  return yaml.load(text) || {}
}

/** Expand a CURIE (`xsd:nonNegativeInteger`) to a full IRI via model.prefixes. */
function expandCurie (model, curie) {
  if (typeof curie !== 'string' || !curie.includes(':')) return curie
  if (/^https?:\/\//.test(curie)) return curie
  const [prefix, ...rest] = curie.split(':')
  const base = (model.prefixes || {})[prefix]
  return base ? base + rest.join(':') : curie
}

const getClass = (model, name) => (model.classes || {})[name]
const getEnum = (model, name) => (model.enums || {})[name]
const getSlot = (model, name) => (model.slots || {})[name]
const isClass = (model, name) => !!getClass(model, name)
const isEnum = (model, name) => !!getEnum(model, name)

/**
 * The effective definition of a slot as used by a class: the global slot merged
 * with any class-level `slot_usage` / `attributes` override. Our model does not
 * currently use overrides, but honouring them keeps the tool correct if it does.
 */
function resolveSlot (model, className, slotName) {
  const cls = getClass(model, className) || {}
  const base = getSlot(model, slotName) || {}
  const attr = (cls.attributes || {})[slotName] || {}
  const usage = (cls.slot_usage || {})[slotName] || {}
  return Object.assign({ name: slotName }, base, attr, usage)
}

/** Ordered slot names of a class (declared `slots:` then inline `attributes:`). */
function classSlotNames (model, className) {
  const cls = getClass(model, className) || {}
  const names = []
  if (Array.isArray(cls.slots)) names.push(...cls.slots)
  if (cls.attributes) names.push(...Object.keys(cls.attributes))
  return names
}

/** Classify a slot's range as one of 'class' | 'enum' | 'type'. */
function rangeKind (model, range) {
  if (isClass(model, range)) return 'class'
  if (isEnum(model, range)) return 'enum'
  return 'type'
}

/**
 * The xsd IRI a (type) range maps to, so it can be given a friendly datatype
 * label. Custom types are resolved via their `uri`, then `typeof`/`base`;
 * built-in LinkML type names fall back to {@link BUILTIN_TYPE_XSD}.
 */
function typeXsd (model, typeName) {
  const t = (model.types || {})[typeName]
  if (t) {
    if (t.uri) return expandCurie(model, t.uri)
    if (t.typeof) return typeXsd(model, t.typeof)
    if (t.base && BUILTIN_TYPE_XSD[t.base]) return BUILTIN_TYPE_XSD[t.base]
  }
  return BUILTIN_TYPE_XSD[typeName]
}

/**
 * The value of a permissible value's SKOS notation annotation (the lowercase
 * code such as `with-other-children`). Reads the `skos:notation` tag (the
 * `notation` tag is also accepted for backwards compatibility) and tolerates
 * both the compact (`{ skos:notation: x }`) and expanded
 * (`{ skos:notation: { value: x } }`) LinkML forms. Returns undefined when absent.
 */
function pvNotation (pv) {
  const anns = pv.annotations || {}
  const ann = anns['skos:notation'] != null ? anns['skos:notation'] : anns.notation
  if (ann == null) return undefined
  return typeof ann === 'object' ? ann.value : ann
}

/**
 * The permissible values of an enum, in declaration order, each normalized to
 * `{ name, title, description, meaning, notation }`. `title` falls back to the
 * value's name; `description` to an empty string; `notation` is undefined when
 * the value carries no `notation` annotation.
 */
function permissibleValues (model, enumName) {
  const en = getEnum(model, enumName) || {}
  const pvs = en.permissible_values || {}
  return Object.keys(pvs).map(name => {
    const pv = pvs[name] || {}
    return {
      name,
      title: pv.title || name,
      description: pv.description || '',
      meaning: pv.meaning,
      notation: pvNotation(pv)
    }
  })
}

/** The human title of an enum (its `title:`, else its name). */
function enumTitle (model, enumName) {
  const en = getEnum(model, enumName) || {}
  return en.title || enumName
}

module.exports = {
  loadModel,
  expandCurie,
  getClass,
  getEnum,
  getSlot,
  isClass,
  isEnum,
  resolveSlot,
  classSlotNames,
  rangeKind,
  typeXsd,
  permissibleValues,
  enumTitle
}
