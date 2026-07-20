'use strict'

const { NS, localName } = require('./rdf')

/**
 * Pure string formatters for the table cells: heading slugs, cardinality
 * strings and datatype labels. None of these touch the RDF graph.
 */

/**
 * Turn heading text into the anchor id that kramdown's `auto_ids` would
 * generate, so links such as `[Out of LA Reason Taxonomy](#out-of-la-reason-taxonomy)`
 * resolve to the real section on the rendered page: strip HTML, downcase, drop
 * any character that is not a letter, digit, space or hyphen, then collapse
 * whitespace to single hyphens.
 */
function slugify (text) {
  return String(text)
    .replace(/<[^>]+>/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Format a SHACL sh:minCount / sh:maxCount pair as a UML-style cardinality
 * string. Missing minCount means 0; missing maxCount means unbounded (*).
 *   (1, 1) -> "1..1"   (0, 1) -> "0..1"   (1, undefined) -> "1..*"
 */
function cardinality (minCount, maxCount) {
  const min = Number.isFinite(minCount) ? minCount : 0
  const max = Number.isFinite(maxCount) ? String(maxCount) : '*'
  return `${min}..${max}`
}

/** Map an xsd datatype IRI to a friendly label for the "Data Type" column. */
const XSD_LABELS = {
  string: 'String',
  normalizedString: 'String',
  token: 'String',
  anyURI: 'String',
  boolean: 'Boolean',
  date: 'Date',
  dateTime: 'Date',
  time: 'Date',
  gYear: 'Date',
  gYearMonth: 'Date',
  integer: 'Integer',
  int: 'Integer',
  long: 'Integer',
  short: 'Integer',
  nonNegativeInteger: 'Integer',
  positiveInteger: 'Integer',
  unsignedInt: 'Integer',
  unsignedLong: 'Integer',
  decimal: 'Decimal',
  double: 'Decimal',
  float: 'Decimal'
}

function datatypeLabel (iri) {
  if (!iri) return ''
  const name = iri.startsWith(NS.xsd) ? iri.slice(NS.xsd.length) : localName(iri)
  if (XSD_LABELS[name]) return XSD_LABELS[name]
  // Capitalise the first letter of an unrecognised local name.
  return name.charAt(0).toUpperCase() + name.slice(1)
}

module.exports = { slugify, cardinality, datatypeLabel }
