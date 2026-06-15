---
title: Person Standard
description: A common data model for identifying and describing a person across social care systems, designed to unblock multi-agency information sharing and single-view use cases.
breadcrumbs:
  - title: Publications
    url: /publications
tags:
  - Person
  - Publication
  - MAIS
---



<nav class="toc numbered-toc">
<h2 id="table-of-contents">Table of Contents</h2>

1. TOC
{:toc}
{::options toc_levels="2..3" /}

</nav>

<article class="numbered-headings">

## Introduction

The Person Standard standardises the data collected about individuals in children's and adults' social care systems, focusing initially on the fields required to distinguish one person from another and to describe relationships between people. Its goal is to unblock the use of single-view systems as an aid to multi-agency information sharing (MAIS).

### Purpose

This Person Standard will standardise some of the data collected about individuals in children's and adult social care systems, focussing initially on those fields required to distinguish one person from another, and to identify relationships between people. Its goal is to unblock the use of "Single View" systems, as an aid to multi-agency information sharing.

### Scope

This standard applies to the digital collection, storage, and exchange of key personal details to enable the Single View use case, as an enabler for multi-agency information sharing. It supersedes the earlier draft published at [github.com/SocialCareData/person-standard](https://github.com/SocialCareData/person-standard) and consolidates the person-related entities from the wider data model at [socialcaredata.github.io/data-model](https://socialcaredata.github.io/data-model/).

### Audience

This document is for all personnel involved in collecting, storing and processing person data, including social workers and administrative staff, data teams, and the developers of case management systems, single-view systems, and systems they interoperate with.


## Data Model

The following diagram illustrates the elements of the Person Standard.

<p class="data-model-diagram"><img src="/assets/img/person/person-data-model.svg" alt="Person Data Model" title="Person Data Model" width="80%"/></p>

A `Person` is the top-level record. It aggregates one or more `Identifier`s, one or more `Name`s, exactly one `dateOfBirth` (with `PartialDate`), zero or more `Address`es, zero or more `Contact` entries, zero or more `PersonRelationship`s linking to other people, an optional `isDeceased` flag and optional `deceasedDate` (with `PartialDate`), and zero or more `Status` entries. Cross-system matches established with other agencies are recorded as `matchedPersonRef` — an array of `Identifier`s pointing to the same person as it is known in other systems. The person's gender, observed sex, and ethnicity are captured via controlled vocabularies.


### Person

The top-level record describing an individual. Consolidates the core identity attributes required to distinguish one person from another and to record relationships between individuals.

#### Properties

<span id="person-identifiers">identifiers</span>
: Unique identifiers associated with the person (e.g. NHS number, internal case-management system ID). Multi-valued. See [Identifier](/person_standard#identifier).

<span id="person-names">name</span>
: One or more names for the person, each with a usage indicating its purpose (usual, maiden, nickname, etc.). Multi-valued. See [Name](/person_standard#name).

<span id="person-dateOfBirth">dateOfBirth</span>
: The person's date of birth, with an optional accuracy indicator. Optional. See [PartialDate](/person_standard#partialdate).

<span id="person-isDeceased">isDeceased</span>
: Whether the person is deceased. Optional. _Boolean_.

<span id="person-deceasedDate">deceasedDate</span>
: The person's date of death, with an optional accuracy indicator. Optional — `isDeceased` may be `true` without a known date. See [PartialDate](/person_standard#partialdate).

<span id="person-addresses">address</span>
: Physical addresses where the person can be contacted. Multi-valued. Optional. See [Address](/person_standard#address).

<span id="person-contact">contact</span>
: Person's contact information. Multi-valued. Optional. See [Contact](/person_standard#contact).

<span id="person-gender">gender</span>
: The person's stated gender. Optional. See the [Person Gender Code Vocabulary](/person_standard#person-gender-code-vocabulary).

<span id="person-sexCode">sexCode</span>
: Observed phenotypic sex, where recorded. Optional. See the [Person Sex Code Vocabulary](/person_standard#person-sex-code-vocabulary).

<span id="person-ethnicCode">ethnicCode</span>
: The person's stated ethnicity, using the ONS 18+1 categories from the 2021 census. Statutorily required in adult social care; optional elsewhere. See the [Person Ethnic Code Vocabulary](/person_standard#person-ethnic-code-vocabulary).

<span id="person-relatedPeople">relatedPeople</span>
: References to other people related to this person, with the kind of relationship. Multi-valued. See [PersonRelationship](/person_standard#personrelationship).

<span id="person-relatedPeople">primaryContactProfessionals</span>
: References to the primary professionals related to this person. For example, care coordinators or a GP. Multi-valued. Optional. See Professional. [TODO Professional standard to be published]

<span id="person-matchedPersonRef">matchedPersonRef</span>
: A reference to another Person record, if a match has been identified. Multi-valued. Optional. See [Identifier](/person_standard#identifier) entity for the structure.

#### Example

{% include examples/person.md %}

<div class="note">
  <h5 id="note-person">Note - conformance minimum</h5>
  <p>A conformant <code>Person</code> record MUST include at least one <code>Identifier</code>, at least one <code>Name</code> with a family name and at least one given name. All other properties are OPTIONAL where their cardinality permits, though several are statutorily required by specific data collections (e.g. <code>ethnicCode</code> in adult social care, and <code>isDeceased</code> with optional <code>deceasedDate</code>).</p>
</div>


### Identifier

A single identifier for a person, comprising the value and the system in whose namespace the value is unique. Aligned with [FHIR `Identifier`](https://build.fhir.org/datatypes.html#Identifier) and the NHS PDS `UNIQUE_REFERENCE` definition.

#### Properties

<span id="identifier-value">value</span>
: The identifier value, unique within the issuing system. _String_.

<span id="identifier-system">system</span>
: The URI of the system or namespace within which the identifier is unique (e.g. `https://fhir.nhs.uk/Id/nhs-number`). _URI_.

#### Example

{% include examples/identifier.md %}


### Name

Container for a person's name parts, aligned with FHIR `HumanName`. A person may have multiple names with different uses (e.g. an official legal name plus a former maiden name retained for matching against legacy records).

#### Properties

<span id="name-familyName">familyName</span>
: The surname or family name. Multi-valued to support compound or hyphenated family names recorded as separate parts. _String_.

<span id="name-givenNames">givenNames</span>
: The first name and any middle names. Multi-valued. _String_.

<span id="name-preferredNames">preferredNames</span>
: Any preferred given or middle name(s) used by the person — for example, "Joe" where their legal first name is "Joseph". Optional. _String_.

<span id="name-use">use</span>
: The purpose of this name instance — current/official, former, nickname, etc. Optional. See the [Name Use Vocabulary](/person_standard#name-use-vocabulary).

#### Example

{% include examples/name.md %}


### Address

A postal address for the person. Aligned with FHIR `Address`. Addresses are postal-convention based rather than coordinate based; UPRN and USRN are included to support property- and street-level disambiguation per [government guidance on property and street information](https://www.gov.uk/government/publications/open-standards-for-government/identifying-property-and-street-information).

#### Properties

<span id="address-line1">line1</span>
: Street address (e.g. "1 High Street") or care-of line. _String_.

<span id="address-line2">line2</span>
: Apartment, suite, unit, building, floor, etc. Optional. _String_.

<span id="address-city">city</span>
: City, town, or village. _String_.

<span id="address-postcode">postcode</span>
: UK postcode in standard format (e.g. `AB1 2CD`). _String_.

<span id="address-UPRN">UPRN</span>
: Unique Property Reference Number of the address. Optional. _String_.

<span id="address-USRN">USRN</span>
: Unique Street Reference Number of the address. Optional. _String_.

#### Example

{% include examples/address.md %}


### Contact

Contact details for a person, such as a home, work, or other contact channel grouping.

#### Properties

<span id="contact-name">name</span>
: Name of the contact type (for example, "Home", "Work", "Other"). Recommended. _String_.

<span id="contact-email">email</span>
: One or more email addresses. Optional. Multi-valued. _String_.

<span id="contact-telephone">telephone</span>
: One or more telephone numbers. Optional. Multi-valued. _String_.

#### Example

{% include examples/contact.md %}


### PersonRelationship

A typed reference from one person to another. The reference is by `Identifier` (so the related person may live in a different system) and is qualified by one or more relationship codes.

#### Properties

<span id="personrelationship-identifier">identifier</span>
: Reference to the related person's `Identifier` (system + value). See [Identifier](/person_standard#identifier).

<span id="personrelationship-relationship">relationship</span>
: One or more codes describing the kind of relationship. Multi-valued. See the [Person Relationship Code Vocabulary](/person_standard#person-relationship-code-vocabulary).

#### Example

{% include examples/person-relationship.md %}


### PartialDate

Container for a date that may not be fully known or precise, extended with an accuracy indicator. Dates are not always known precisely in social care; the accuracy indicator allows downstream systems to interpret a date appropriately rather than treating an estimate as exact. Used for dates of birth and dates of death.

#### Properties

<span id="partialdate-date">date</span>
: ISO 8601-formatted date (`YYYY-MM-DD`). _Date_.

<span id="partialdate-accuracyIndicator">accuracyIndicator</span>
: A three-character code in day–month–year order indicating which parts of the date are accurate, estimated, or unknown. Optional. See the [Date Accuracy Indicator Vocabulary](/person_standard#date-accuracy-indicator-vocabulary).

#### Example

{% include examples/date-of-birth.md %}

## Vocabularies

The model is parameterised by six controlled vocabularies, each held in its own include file under `src/_includes/vocabularies/`.

### Name Use Vocabulary

Used by [`Name.use`](/person_standard#name-use).

{% include vocabularies/name-use.md %}

### Person Gender Code Vocabulary

Used by [`Person.gender`](/person_standard#person-gender).

{% include vocabularies/person-gender-code.md %}

### Person Sex Code Vocabulary

Used by [`Person.sexCode`](/person_standard#person-sexCode).

{% include vocabularies/person-sex-code.md %}

### Person Ethnic Code Vocabulary

Used by [`Person.ethnicCode`](/person_standard#person-ethnicCode).

{% include vocabularies/person-ethnic-code.md %}

### Date Accuracy Indicator Vocabulary

Used by [`DateOfBirth.accuracyIndicator`](/person_standard#dateofbirth-accuracyIndicator).

{% include vocabularies/date-accuracy-indicator.md %}

### Person Relationship Code Vocabulary

Used by [`PersonRelationship.relationship`](/person_standard#personrelationship-relationship).

{% include vocabularies/person-relationship-code.md %}

## Alignment with other specifications

In creating this specification we reviewed and aligned with:

- Adult Social Care Minimum Operational Data Standard (MODS)
- PRSB Healthy Child Record Standard
- PRSB Core Information Standard (CIS)
- HL7 FHIR (the [`Patient`](https://hl7.org/fhir/patient.html) resource)
- NHS [Personal Demographics Service (PDS)](https://digital.nhs.uk/developer/api-catalogue/personal-demographics-service-fhir)
- Department for Education Common Basic Dataset (CBDS)
- [schema.org](https://schema.org/)
- iStandUK Scalable Approach to Vulnerability via Interoperability (SAVVI)

The Person Standard is a reduced subset of the FHIR `Patient` resource, extended where social-care-specific use cases require it (e.g. `ethnicCode` with ONS 18+1, the `accuracyIndicator` on `PartialDate`, and `matchedPersonRef` for cross-system matches). A subset of its properties can be used to query the NHS PDS directly.

### See also

- [Standard ways to describe a Person](/standard_ways_to_describe_a_person) — comparison of this standard with the Hippo GET API, NHS PDS, and the FHIR Patient resource.
- [Person matching implementation](/person_matching_implementation) — how `matchedPersonRef` is established via the FHIR `$match` operation.

## Report an issue

If you spot an issue with this standard, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Person+Standard%3A%20&page=https%3A%2F%2Fstandard.socialcaredata.io%2Fperson_standard&category=Person+Standard" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

</article>
