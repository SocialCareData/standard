'use strict'

const { DataFactory } = require('n3')
const { NS, localName, schemeOf, objectValue, rdfList } = require('./rdf')
const { slugify } = require('./format')

const { namedNode } = DataFactory

/**
 * Turns the RDF graph into the semantic model the renderer needs:
 *   - {@link extractProperties} — the ordered, de-duplicated property rows of
 *     a SHACL entity (targetClass);
 *   - {@link resolveOptions} — the taxonomy link + example labels for a
 *     controlled-vocabulary (`sh:in`) property.
 */

const SH = p => namedNode(NS.sh + p)
const P_TARGET_CLASS = NS.sh + 'targetClass'
const P_PROPERTY = NS.sh + 'property'

// ---------------------------------------------------------------------------
// Property extraction
// ---------------------------------------------------------------------------

/** Parse an integer literal value, or undefined if absent/not numeric. */
function intVal (v) {
  if (v === undefined) return undefined
  const n = parseInt(v, 10)
  return Number.isNaN(n) ? undefined : n
}

/**
 * Read the raw constraint descriptor for a single sh:property node. Returns
 * null when the property has no usable sh:path (e.g. a complex path
 * expression), so such shapes are skipped rather than rendered badly.
 */
function readProperty (store, propNode) {
  const path = objectValue(store, propNode, SH('path'))
  if (!path || !/^https?:/.test(path)) return null

  const inHeads = store.getObjects(propNode, SH('in'), null)
  const inList = inHeads.length ? rdfList(store, inHeads[0]) : null

  return {
    path,
    name: localName(path),
    datatype: objectValue(store, propNode, SH('datatype')),
    classRef: objectValue(store, propNode, SH('class')),
    nodeKind: objectValue(store, propNode, SH('nodeKind')),
    inList: inList && inList.length ? inList : null,
    min: intVal(objectValue(store, propNode, SH('minCount'))),
    max: intVal(objectValue(store, propNode, SH('maxCount'))),
    shDescription: objectValue(store, propNode, SH('description')),
    shMessage: objectValue(store, propNode, SH('message'))
  }
}

/**
 * Resolve the human description for a property. Prefers the ontology's
 * rdfs:comment (keyed by the property IRI), then sh:description, then the
 * validation sh:message — whichever is first present in the merged graph.
 */
function describe (store, path, descriptors) {
  const comment = objectValue(store, namedNode(path), namedNode(NS.rdfs + 'comment'))
  if (comment) return comment
  for (const d of descriptors) if (d.shDescription) return d.shDescription
  for (const d of descriptors) if (d.shMessage) return d.shMessage
  return ''
}

/**
 * Find every NodeShape whose sh:targetClass matches `entity` (by full IRI or
 * by local name) and return the ordered list of their sh:property nodes.
 * Document order comes from the ordered quads of the SHACL file.
 */
function orderedPropertyNodes (shaclQuads, entity) {
  const shapeSubjects = new Set()
  for (const q of shaclQuads) {
    if (q.predicate.value === P_TARGET_CLASS &&
        (q.object.value === entity || localName(q.object.value) === entity)) {
      shapeSubjects.add(q.subject.value)
    }
  }

  const nodes = []
  const seen = new Set()
  for (const q of shaclQuads) {
    if (q.predicate.value === P_PROPERTY && shapeSubjects.has(q.subject.value) &&
        !seen.has(q.object.value)) {
      seen.add(q.object.value)
      nodes.push(q.object)
    }
  }
  return { nodes, matched: shapeSubjects.size > 0 }
}

/**
 * Extract the first-level property rows for an entity (targetClass).
 *
 * Properties declared more than once for the same class (e.g. a datatype
 * shape plus a separate `sh:severity Warning` range check) are merged into a
 * single row, preserving the order of first appearance.
 *
 * @returns {{name,path,cardinality:{min,max},datatype,classRef,inList,nodeKind,description}[]}
 * @throws if the entity has no matching NodeShape.
 */
function extractProperties (store, shaclQuads, entity) {
  const { nodes, matched } = orderedPropertyNodes(shaclQuads, entity)
  if (!matched) {
    throw new Error(`No sh:NodeShape with sh:targetClass matching "${entity}" was found.`)
  }

  // Group descriptors by property local name, preserving first-seen order.
  const order = []
  const groups = new Map()
  for (const node of nodes) {
    const d = readProperty(store, node)
    if (!d) continue
    if (!groups.has(d.name)) {
      groups.set(d.name, [])
      order.push(d.name)
    }
    groups.get(d.name).push(d)
  }

  return order.map(name => {
    const descriptors = groups.get(name)
    // The "primary" descriptor is the one carrying the type information.
    const primary = descriptors.find(d => d.datatype || d.classRef || d.inList) || descriptors[0]
    const firstDefined = key => {
      for (const d of descriptors) if (d[key] !== undefined) return d[key]
      return undefined
    }
    return {
      name,
      path: primary.path,
      cardinality: { min: firstDefined('min'), max: firstDefined('max') },
      datatype: primary.datatype,
      classRef: primary.classRef,
      inList: primary.inList,
      nodeKind: primary.nodeKind,
      description: describe(store, primary.path, descriptors)
    }
  })
}

// ---------------------------------------------------------------------------
// Controlled-vocabulary (taxonomy) resolution
// ---------------------------------------------------------------------------

/** Human label for a SKOS ConceptScheme, trying the usual title predicates. */
function schemeLabel (store, schemeIri) {
  const node = namedNode(schemeIri)
  return objectValue(store, node, namedNode(NS.skos + 'prefLabel')) ||
    objectValue(store, node, namedNode(NS.rdfs + 'label')) ||
    objectValue(store, node, namedNode(NS.dct + 'title')) ||
    localName(schemeIri).replace(/-/g, ' ')
}

/** Preferred label for a single SKOS concept, falling back to its local name. */
function conceptLabel (store, conceptIri) {
  return objectValue(store, namedNode(conceptIri), namedNode(NS.skos + 'prefLabel')) ||
    localName(conceptIri)
}

/**
 * Resolve a `sh:in` value list into the pieces the "Options" column needs: a
 * link to the taxonomy section and a few example labels.
 *
 * @returns {{title,anchor,examples:string[],more:boolean}}
 */
function resolveOptions (store, inList, { maxExamples = 3 } = {}) {
  const scheme = schemeOf(inList[0])
  const label = schemeLabel(store, scheme)
  const title = /taxonomy$/i.test(label) ? label : `${label} Taxonomy`

  return {
    title,
    anchor: slugify(title),
    examples: inList.slice(0, maxExamples).map(iri => conceptLabel(store, iri)),
    more: inList.length > maxExamples
  }
}

module.exports = { extractProperties, resolveOptions, readProperty, orderedPropertyNodes }
