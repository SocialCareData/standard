'use strict'

const { loadModel } = require('../lib/linkml')

// A small LinkML model covering the shapes the unit tests exercise: a class
// with datatype / multivalued / class-ref / enum-ref / custom-type slots, a
// referenced class, and an enum with titled permissible values.
const SAMPLE_YAML = `
id: https://example.org/test
name: test
prefixes:
  linkml: https://w3id.org/linkml/
  ex: https://example.org/
  urg: https://example.org/urgency#
  xsd: http://www.w3.org/2001/XMLSchema#
default_prefix: ex
default_range: string
types:
  nonNegativeInteger:
    uri: xsd:nonNegativeInteger
    typeof: integer
classes:
  Thing:
    slots: [name, tags, child, urgency, count, amount]
  Other:
    slots: [name]
slots:
  name: { range: string, required: true, description: the name }
  tags: { range: string, multivalued: true }
  child: { range: Other, required: true, description: a child ref }
  urgency: { range: UrgencyEnum, required: true }
  count: { range: nonNegativeInteger }
  amount: { range: decimal }
enums:
  UrgencyEnum:
    title: Urgency
    permissible_values:
      Today: { title: Today, meaning: urg:Today, description: Needed today. }
      Soon:  { title: Soon,  meaning: urg:Soon }
      Later: { title: Later, meaning: urg:Later }
      Never: { title: Never, meaning: urg:Never }
`

// A model whose classes inherit slots from `mixins:` (as the assessments-and-
// plans standard does with FoundationalInformation), including a mixin of a
// mixin, a slot reached twice, per-class and per-mixin `slot_usage` overrides,
// and a self-referencing mixin (cycle guard).
const MIXIN_YAML = `
id: https://example.org/mixin-test
name: mixin-test
prefixes:
  linkml: https://w3id.org/linkml/
  ex: https://example.org/
default_prefix: ex
default_range: string
classes:
  Timestamped:
    mixin: true
    slots: [created]
  Base:
    mixin: true
    mixins: [Timestamped]
    slots: [id]
  Annotated:
    mixin: true
    slots: [note]
    slot_usage:
      note: { description: "a note, from the mixin" }
  Doc:
    mixins: [Base, Annotated]
    slots: [title, id]
    slot_usage:
      created: { description: when this doc was created }
      note: { description: "a note, from the class" }
  Looper:
    mixin: true
    mixins: [Looper]
    slots: [id]
slots:
  id: { range: string, required: true, description: the identifier }
  created: { range: string, description: a timestamp }
  note: { range: string }
  title: { range: string, required: true }
`

/** Parse the sample model (fresh copy each call). */
function sampleModel () {
  return loadModel(SAMPLE_YAML)
}

/** Parse the mixin model (fresh copy each call). */
function mixinModel () {
  return loadModel(MIXIN_YAML)
}

module.exports = { sampleModel, SAMPLE_YAML, mixinModel, MIXIN_YAML }
