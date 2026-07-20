'use strict'

const N3 = require('n3')
const { parseTurtle } = require('../lib/rdf')

const PREFIXES = `
@prefix sh:   <http://www.w3.org/ns/shacl#> .
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix dct:  <http://purl.org/dc/terms/> .
@prefix xsd:  <http://www.w3.org/2001/XMLSchema#> .
@prefix ex:   <https://example.org/> .
@prefix urg:  <https://example.org/urgency#> .
`

/** Build an N3 store + ordered quads from a Turtle body (prefixes prepended). */
function storeFrom (body) {
  const quads = parseTurtle(PREFIXES + body)
  const store = new N3.Store()
  store.addQuads(quads)
  return { store, quads }
}

module.exports = { storeFrom, PREFIXES }
