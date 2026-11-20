# Referrals and Requests Standard data model

The [Referrals and Requests Standard](../../../_pages/PUB06-referrals-standard.md)
is expressed as a single [LinkML](https://linkml.io/) schema. The SHACL, OWL/RDF,
JSON Schema and docs are generated from the YAML.

> For the LinkML → SHACL workflow — regenerating artifacts, how enums/codes map,
> conditional constraints, and validating the examples — see
> [`../model-management.md`](../model-management.md). **Don't edit the generated
> `*-shape.ttl` / `*.ttl` files directly.**

## Files

| File | Role |
| --- | --- |
| `referrals-standard.yaml` | **Authoritative source.** Prefixes, the three core classes (`Referral`, `Request`, `QualityOfCareConcern`), the `Response` class, supporting objects (`IntakePerson`, `PersonalNetworkMember`, `ReferrerDetails`, `ConcernDetail`, `QocConcernDetail`, `ReferralInvolvement`, `DocumentReference`, `ReferralAssessmentQuestion`), slots, and controlled vocabularies. Imports `common`, `person` (core), and `safeguarding`. |
| `../imports.json` | Top-level importmap shared by all modules: maps each module id (e.g. `https://ns.socialcaredata.io/referrals`) to its local `*.yaml` file. |
| `context.jsonld` | JSON-LD context used by examples and external consumers. |

## IntakePerson

`IntakePerson` is how a person is first recorded when their details enter social
care. It is used for `Referral.subject`, `QualityOfCareConcern.subject` and
`PersonalNetworkMember.person`. It is `is_a: Person` with every Person slot made
optional, plus a free-text `notes` (slot `intakeNotes`).

- It is a separately named class, not a Person profile. Profiles work by
  redefining `Person`, and a referral needs people of different shapes side by
  side (an `IntakePerson` subject and a full `Person` referrer).
- `slot_usage` relaxes every slot that any Person profile requires, not only
  the ones the core requires. The umbrella `social-care.yaml` merges the
  subject-of-care `Person`, so `IntakePerson` stays lax whichever `Person` it
  inherits from.
- `isAwareOfReferral` (boolean, required) records whether the person knows the
  referral or concern is being made. It is on `IntakePerson` so that it covers
  the subject and every personal network member; it therefore also applies to
  the subject of a quality-of-care concern. A boolean, not a code list with
  "not known", because the person making the referral always knows whether they
  told someone. Reasons for not telling someone, and contact instructions, go
  in `notes` (guidance on the PUB06 page), not in their own fields. Awareness of
  professionals is not modelled yet (it needs `ReferralInvolvement` restructured).
- An `IntakePerson` should carry at least one detail. This cannot be expressed
  in LinkML and SHACL (`gen-shacl` ignores `any_of`), so it is implementer
  guidance on the PUB06 page, not a constraint.
- Validation runs without RDFS inference, so `PersonShape` does not fire on
  `IntakePerson` instances despite the subclass relationship.

## Concerns

`Referral` and `QualityOfCareConcern` have separate concern structures:

| Class | Slot (JSON key) | Detail class | Code list | Concept namespace |
| --- | --- | --- | --- | --- |
| `Referral` | `concern` (`concern`) | `ConcernDetail` | `ConcernCode` | `…/concern#` (`con:`) |
| `QualityOfCareConcern` | `qocConcern` (`concern`) | `QocConcernDetail` | `QocConcernCode` | `…/qoc-concern#` (`qcon:`) |

The JSON key is `concern` in both. `context.jsonld` maps it to the right
predicate through the class-scoped contexts on `QualityOfCareConcern` and
`QocConcernDetail`, so a QoC concern must be typed `QocConcernDetail` for its
`concernType` to resolve against the QoC code list.

`ConcernCode` follows the statutory categories (Children Act 1989 / Working
Together 2023 for children, Care Act 2014 for adults), with an Other code for
each group and an `UNASSIGNED` code. `UNASSIGNED` supports the "assign at
triage" pattern: a referral may arrive with the type unclassified (the referrer
chose not to give one, or the form never asked) and the front door or MASH
assigns it. Rules such as "UNASSIGNED must not appear alongside other
codes" and "no UNASSIGNED after triage" cannot be expressed in the model; they
are guidance on the PUB06 page.

`QocConcernCode` uses the CQC fundamental standards: Regulations 9 to 20 of the
Health and Social Care Act 2008 (Regulated Activities) Regulations 2014. A code
means "concern that the provider is not meeting this regulation", so titles are
the regulations' own and nothing is reworded into a negative. Codes are plain
camelCase, not dotted, because dotted codes render as a hierarchy in the schema
tables. Common concerns with no regulation of their own (missed or late
home-care visits, medication errors, falls, pressure ulcers) are named in the
descriptions of the regulations they fall under. Also has `UNASSIGNED` and
`other`. Registration-level regulations (4 to 7) and 20A (displaying ratings)
are deliberately left out.

## Quality-of-care concerns: recipient and service

On `QualityOfCareConcern`, `recipient` (slot `qocRecipient`, `1..*`) is who the
concern was sent to, usually the local authority, as on `Referral`. The provider
the concern is about is `service` (slot `qocService`, `1..1`), a `QocService` with
an optional `identifier`, `name` and `description` (slots `qocServiceIdentifier`,
`qocServiceName`, `qocServiceDescription`). All three are optional because the
person raising the concern may know only a description; "at least one" is
guidance on the PUB06 page. The service sits on the concern, not on each
`QocConcernDetail`, because triage records one detail per regulation and the
provider would otherwise be repeated. A concern about two providers is raised as
two concerns. `qocServiceIdentifier` shares the `identifier` predicate, as every
module's identifier slot does.

## Response

`Response` records that a response to a `Referral`, `Request` or
`QualityOfCareConcern` was sent or received. It is a separate top-level record
that points back at what it responds to (`respondsTo`, an `Identifier`, with an
optional `respondsToType` from safeguarding's `RecordTypeCode`), so the original
record is never edited. Each response is one event, not a changing status: a
referral that is acknowledged then accepted has two `Response` records.

- `responder` (an `Identifier`) shows the direction: the local authority as
  responder means a response was sent, another service as responder means one
  was received. There is no separate direction field.
- The JSON keys `identifier`, `status` and `description` map to the slots
  `refIdentifier`, `responseStatus` and `responseDescription`. `status` cannot be
  a slot name because assessments-and-plans already defines `status` with a
  different range. `description` resolves through the class-scoped context on
  `Response`.
- `ResponseStatusCode` (concept namespace `…/response-status#`, `rs:`) uses
  dotted codes for the hierarchy: `accepted.waitlisted` and
  `declined.ineligible`.
- There is deliberately no outcome field. Safeguarding's `EpisodeOutcome` is
  adult-only and describes the outcome of an episode, not of a referral. Detail
  goes in `description`, `attachment` and `linkedRecord`.
- `RecordTypeCode` in safeguarding has a `response` value, so other records can
  link to a response.
