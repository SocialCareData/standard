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
| `referrals-standard.yaml` | **Authoritative source.** Prefixes, the three core classes (`Referral`, `Request`, `QualityOfCareConcern`), supporting objects (`IntakePerson`, `PersonalNetworkMember`, `ReferrerDetails`, `ConcernDetail`, `ReferralInvolvement`, `DocumentReference`, `ReferralAssessmentQuestion`), slots, and controlled vocabularies. Imports `common`, `person` (core), and `safeguarding`. |

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
- An `IntakePerson` should carry at least one detail. This cannot be expressed
  in LinkML and SHACL (`gen-shacl` ignores `any_of`), so it is implementer
  guidance on the PUB06 page, not a constraint.
- Validation runs without RDFS inference, so `PersonShape` does not fire on
  `IntakePerson` instances despite the subclass relationship.
| `../imports.json` | Top-level importmap shared by all modules: maps each module id (e.g. `https://ns.socialcaredata.io/referrals`) to its local `*.yaml` file. |
| `context.jsonld` | JSON-LD context used by examples and external consumers. |
