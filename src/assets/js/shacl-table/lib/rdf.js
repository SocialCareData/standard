'use strict'

const N3 = require('n3')

/**
 * RDF plumbing shared by the rest of the tool: well-known namespaces, a couple
 * of IRI helpers, Turtle parsing and small N3-store query helpers.
 */

const NS = {
  sh: 'http://www.w3.org/ns/shacl#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  dct: 'http://purl.org/dc/terms/',
  xsd: 'http://www.w3.org/2001/XMLSchema#'
}

const RDF_NIL = NS.rdf + 'nil'
const RDF_FIRST = NS.rdf + 'first'
const RDF_REST = NS.rdf + 'rest'

/**
 * The local name of an IRI: everything after the last '#' or '/', whichever
 * comes later. e.g.
 *   https://ex.org/placements/outof-la-reason#CourtOrder -> "CourtOrder"
 *   https://ex.org/placements/placementId               -> "placementId"
 */
function localName (iri) {
  if (typeof iri !== 'string') return ''
  const cut = Math.max(iri.lastIndexOf('#'), iri.lastIndexOf('/'))
  return cut >= 0 ? iri.slice(cut + 1) : iri
}

/**
 * The namespace of an IRI: everything up to the separator used by
 * {@link localName}. For a SKOS concept this is the enclosing scheme IRI once
 * the trailing '#fragment' is removed.
 *   .../outof-la-reason#CourtOrder -> ".../outof-la-reason"
 */
function schemeOf (iri) {
  if (typeof iri !== 'string') return ''
  const hash = iri.indexOf('#')
  if (hash >= 0) return iri.slice(0, hash)
  const slash = iri.lastIndexOf('/')
  return slash >= 0 ? iri.slice(0, slash) : iri
}

/**
 * Parse Turtle text into an ordered array of quads. n3 preserves document
 * order, which we rely on to keep `sh:property` blocks in the order they were
 * authored.
 */
function parseTurtle (text) {
  return new N3.Parser().parse(text)
}

/** First object value (as a string) for subject+predicate, or undefined. */
function objectValue (store, subject, predicate) {
  const objs = store.getObjects(subject, predicate, null)
  return objs.length ? objs[0].value : undefined
}

/**
 * Walk an RDF collection (rdf:first / rdf:rest linked list) starting at
 * `head`, returning the member values in order. Tolerates a missing or
 * `rdf:nil` head by returning an empty array.
 */
function rdfList (store, head) {
  const out = []
  let node = head
  const guard = new Set()
  while (node && node.value !== RDF_NIL && !guard.has(node.value)) {
    guard.add(node.value)
    const first = store.getObjects(node, RDF_FIRST, null)
    if (first.length) out.push(first[0].value)
    const rest = store.getObjects(node, RDF_REST, null)
    node = rest.length ? rest[0] : null
  }
  return out
}

module.exports = { NS, RDF_NIL, RDF_FIRST, RDF_REST, localName, schemeOf, parseTurtle, objectValue, rdfList }
