'use strict'

const fs = require('fs')
const path = require('path')
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

// Dictionary sections of a LinkML schema that are merged across imports, plus
// `prefixes`. A definition in the importing schema overrides an imported one of
// the same name.
const MERGED_DICTS = ['classes', 'slots', 'enums', 'types', 'subsets']

/** Merge `src`'s definitions into `target`; `src` wins on name clashes. */
function mergeDefs (target, src) {
  for (const key of MERGED_DICTS) {
    if (src[key]) target[key] = Object.assign({}, target[key], src[key])
  }
  if (src.prefixes) target.prefixes = Object.assign({}, target.prefixes, src.prefixes)
  // Carry over scalar / meta fields (id, name, default_prefix, default_range …);
  // src is applied last so the importing schema's values win.
  for (const k of Object.keys(src)) {
    if (!MERGED_DICTS.includes(k) && k !== 'prefixes' && k !== 'imports') target[k] = src[k]
  }
  return target
}

/**
 * Read an `imports.json` importmap sitting next to a schema, mapping a LinkML
 * `imports:` entry (typically a schema `id` IRI) to a local file path, relative
 * to `dir`. Mirrors LinkML's own `--importmap` mechanism so a schema that
 * imports another standard by its canonical id (for a clean `owl:imports`) still
 * resolves to the local YAML here. Returns {} when there is no importmap.
 */
function loadImportMap (dir) {
  const p = path.join(dir, 'imports.json')
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8')) || {}
  } catch (_) { /* malformed importmap → behave as if absent */ }
  return {}
}

/**
 * Resolve a LinkML `imports:` entry to a local YAML file, or null when it is not
 * a local file (e.g. `linkml:types`). A cross-standard import written as a
 * schema id IRI is resolved via an `imports.json` importmap in `dir`. Otherwise
 * the entry is treated as a path (as-is and with `.yaml` / `.yml` appended)
 * relative to `dir`.
 */
function resolveImport (dir, entry) {
  if (typeof entry !== 'string') return null

  // A CURIE / IRI import (contains ':') is only resolvable via the importmap.
  let candidate = entry
  if (entry.includes(':')) {
    const mapped = loadImportMap(dir)[entry]
    if (!mapped) return null
    candidate = mapped
  }

  for (const ext of ['', '.yaml', '.yml']) {
    const p = path.resolve(dir, candidate + ext)
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
  }
  return null
}

/**
 * Load a LinkML model from a file, resolving its local `imports:` so the
 * returned model is self-contained (all imported classes, slots, enums, types
 * and prefixes merged in). Non-local imports (e.g. `linkml:types`) are ignored.
 * The importing schema's own definitions override imported ones — which is what
 * lets a profile schema (e.g. person-subject-of-care.yaml) redefine `Person`
 * while inheriting the shared sub-entities and vocabularies from its core.
 *
 * @param {string} absPath  Absolute path to the LinkML YAML file.
 * @param {Set<string>} [visited]  Guards against import cycles.
 */
function loadModelFile (absPath, visited = new Set()) {
  const abs = path.resolve(absPath)
  if (visited.has(abs)) return {}
  visited.add(abs)

  const base = loadModel(fs.readFileSync(abs, 'utf8'))
  const dir = path.dirname(abs)
  const merged = {}
  for (const entry of Array.isArray(base.imports) ? base.imports : []) {
    const impAbs = resolveImport(dir, entry)
    if (impAbs) mergeDefs(merged, loadModelFile(impAbs, visited))
  }
  // The importing schema is applied last so its definitions win.
  return mergeDefs(merged, base)
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
 * with the `slot_usage` / `attributes` overrides of the class's `mixins:` (in
 * declaration order) and then of the class itself, so the most specific
 * definition wins — the class overrides its mixins, which override the global
 * slot. This is how a class narrows an inherited slot (e.g. the
 * assessments-and-plans classes give the shared `status` and `review` slots
 * wording specific to an assessment or to a plan).
 */
function resolveSlot (model, className, slotName) {
  const base = getSlot(model, slotName) || {}
  return Object.assign({ name: slotName }, base, ...classOverrides(model, className, slotName))
}

/**
 * The `attributes` / `slot_usage` overrides for `slotName` contributed by a class
 * and its mixins, ordered least- to most-specific (mixins first, the class last).
 *
 * @param {Set<string>} [seen]  Guards against a mixin cycle.
 */
function classOverrides (model, className, slotName, seen = new Set()) {
  const cls = getClass(model, className)
  if (!cls || seen.has(className)) return []
  seen.add(className)

  const overrides = []
  for (const mixin of Array.isArray(cls.mixins) ? cls.mixins : []) {
    overrides.push(...classOverrides(model, mixin, slotName, seen))
  }
  if ((cls.attributes || {})[slotName]) overrides.push(cls.attributes[slotName])
  if ((cls.slot_usage || {})[slotName]) overrides.push(cls.slot_usage[slotName])
  return overrides
}

/**
 * Ordered slot names of a class: the slots it inherits from its `mixins:` first
 * (in the order the mixins are declared, each mixin's own mixins resolved first),
 * then the class's declared `slots:`, then its inline `attributes:`.
 *
 * A model may factor slots shared by several classes into a mixin (e.g. the
 * assessments-and-plans `FoundationalInformation`) rather than repeating them on
 * every class. `gen-shacl` / `gen-owl` resolve those inherited slots, so the
 * tables must too — otherwise a documented property is simply missing from the
 * class it belongs to. A slot reached more than once (via two mixins, or via a
 * mixin and the class itself) is listed once, at its first position.
 *
 * @param {Set<string>} [seen]  Guards against a mixin cycle.
 */
function classSlotNames (model, className, seen = new Set()) {
  const cls = getClass(model, className) || {}
  if (seen.has(className)) return []
  seen.add(className)

  const names = []
  const add = name => { if (!names.includes(name)) names.push(name) }

  for (const mixin of Array.isArray(cls.mixins) ? cls.mixins : []) {
    classSlotNames(model, mixin, seen).forEach(add)
  }
  if (Array.isArray(cls.slots)) cls.slots.forEach(add)
  if (cls.attributes) Object.keys(cls.attributes).forEach(add)
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
 * The permissible values of an enum, in declaration order, each normalized to
 * `{ name, title, description, meaning }`. `title` falls back to the value's
 * name; `description` to an empty string.
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
      meaning: pv.meaning
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
  loadModelFile,
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
