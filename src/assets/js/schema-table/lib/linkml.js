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

// --- importmap discovery -----------------------------------------------------

/**
 * Emit a non-fatal diagnostic on stderr. Kept to a single line: the Jekyll plugin
 * splits stderr on newlines and logs one build warning per line
 * (src/_plugins/schema_table.rb).
 */
function warn (message) {
  process.stderr.write(`schema-table: ${message}\n`)
}

// dir -> the `imports.json` parsed from that dir (null when absent/malformed).
const importMapFileCache = new Map()
// start dir -> the merged importmap that applies to a schema in that dir.
const importMapCache = new Map()

/**
 * A directory that ends the upward search for an importmap: the root of the
 * repository the schema lives in. Keeps the walk deterministic — without a
 * boundary it would climb into $HOME or the system temp dir and could pick up an
 * unrelated `imports.json`. Checked inclusively: a map in the repo root is read,
 * and then the walk stops.
 */
function isSearchBoundary (dir) {
  return fs.existsSync(path.join(dir, '.git'))
}

/** The `imports.json` in `dir`, parsed and memoised; null when there is none. */
function readImportMapFile (dir) {
  if (importMapFileCache.has(dir)) return importMapFileCache.get(dir)

  let map = null
  const p = path.join(dir, 'imports.json')
  try {
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf8'))
      // Only a plain object is usable as a map; anything else is malformed.
      map = parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
      if (!map) warn(`ignoring malformed importmap ${p}: expected a JSON object`)
    }
  } catch (err) {
    warn(`ignoring malformed importmap ${p}: ${err.message}`)
    map = null
  }
  importMapFileCache.set(dir, map)
  return map
}

/**
 * The importmap that applies to a schema in `dir`, mapping a LinkML `imports:`
 * entry (typically a schema `id` IRI) to a local file path. Mirrors LinkML's own
 * `--importmap` / `-im` mechanism so a schema that imports another standard by
 * its canonical id (for a clean `owl:imports`) still resolves to the local YAML
 * here.
 *
 * The map is looked for in `dir` and in every ancestor up to and including the
 * repository root, because a modular model keeps ONE map beside the module
 * folders (`src/_data/model/imports.json`) rather than a copy per module —
 * matching how `gen-owl -im ../imports.json` is invoked from a module directory.
 * Maps found nearer the schema override ones found further up, id by id, so a
 * module can pin a single import without hiding the rest of the shared map.
 *
 * Paths in the map stay relative to the IMPORTING FILE's directory, not to the
 * map's own directory — this is what LinkML does, and it is why the entries are
 * written `../<module>/<file>`. It only holds while every module directory sits
 * exactly one level below the map.
 *
 * Returns {} when no importmap is found.
 */
function loadImportMap (dir) {
  const start = path.resolve(dir)
  if (importMapCache.has(start)) return importMapCache.get(start)

  // Collect furthest-first so Object.assign lets the nearest map win.
  const maps = []
  let d = start
  for (;;) {
    const map = readImportMapFile(d)
    if (map) maps.unshift(map)
    if (isSearchBoundary(d)) break
    const parent = path.dirname(d)
    if (parent === d) break
    d = parent
  }

  const merged = Object.assign({}, ...maps)
  importMapCache.set(start, merged)
  return merged
}

/** The directory the importmap search from `dir` stops at (for diagnostics). */
function importMapSearchRoot (dir) {
  let d = path.resolve(dir)
  for (;;) {
    if (isSearchBoundary(d)) return d
    const parent = path.dirname(d)
    if (parent === d) return d
    d = parent
  }
}

/** Test hook: drop the memoised importmaps. */
function _resetImportCaches () {
  importMapFileCache.clear()
  importMapCache.clear()
}

/**
 * LinkML's own metamodel modules (`linkml:types`, `linkml:mappings`, …). These
 * are never local files, so they are skipped silently and an importmap is not
 * expected to mention them.
 */
const LINKML_BUILTIN = /^linkml:/

/**
 * Resolve a LinkML `imports:` entry to a local YAML file, or null when it cannot
 * be resolved. A cross-standard import written as a schema id IRI is resolved via
 * the `imports.json` importmap found for `dir` (see {@link loadImportMap});
 * otherwise the entry is treated as a path (as-is and with `.yaml` / `.yml`
 * appended) relative to `dir`.
 *
 * `onUnresolved(entry, reason)` is called for an entry that should have resolved
 * to a file but did not; LinkML's own `linkml:` modules never trigger it.
 */
function resolveImport (dir, entry, onUnresolved) {
  if (typeof entry !== 'string' || entry === '') return null
  // Checked before the map lookup: now that an ancestor map is always found,
  // `linkml:types` would otherwise be reported on every schema in the tree.
  if (LINKML_BUILTIN.test(entry)) return null

  let candidate = entry
  let mapped = null
  if (entry.includes(':')) {
    mapped = loadImportMap(dir)[entry]
    if (!mapped) {
      if (onUnresolved) {
        onUnresolved(entry, `no "imports.json" entry for it was found in ${dir} or any directory up to ${importMapSearchRoot(dir)}`)
      }
      return null
    }
    candidate = mapped
  }

  for (const ext of ['', '.yaml', '.yml']) {
    const p = path.resolve(dir, candidate + ext)
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
  }
  if (onUnresolved) {
    const tried = path.resolve(dir, candidate)
    onUnresolved(entry, mapped
      ? `the importmap maps it to "${mapped}", but no file exists at ${tried}[.yaml|.yml] (importmap paths are relative to the importing schema, not to imports.json)`
      : `no file exists at ${tried}[.yaml|.yml]`)
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
 * An import that cannot be resolved to a file is an error rather than a silent
 * skip: dropping one quietly removes every class, slot and enum that schema
 * contributes, so a class-ranged slot renders with an empty Data Type cell (or
 * the entity is reported "not found") with nothing explaining why. LinkML's own
 * `linkml:` modules are not local files and are skipped silently.
 *
 * `visited` makes each file contribute exactly once, on its first visit, to
 * whichever branch reaches it first. No definition is lost — that contribution
 * propagates up through every enclosing mergeDefs to the root — and a schema
 * that narrows one it imports keeps its override even when a sibling branch
 * imports the same base again. (Re-expanding per import site instead would let
 * a shared base clobber a profile's narrowing, which is exactly what the profile
 * schemas rely on not happening.)
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
    const impAbs = resolveImport(dir, entry, (e, reason) => {
      throw new Error(`Unresolved import "${e}" in ${abs}: ${reason}.`)
    })
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
  loadImportMap,
  resolveImport,
  _resetImportCaches,
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
