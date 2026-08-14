---
layout: publication
title: Person Standard
description: A common data model for identifying and describing a person across social care systems, designed to unblock multi-agency information sharing and single-view use cases.
breadcrumbs:
  - Publications
tags:
  - MAIS
  - Person
  - Publication
reference: PUB01
status: draft
data_model: src/assets/model/person/person-standard.yaml
non_technical_summary: |
  The core objective of our work is to facilitate the sharing of information about a person in care (whether a child or an adult) between agencies and organisations across the country (multi-agency information sharing). To do so, each of these agencies and organisations must be speaking the same "language" talking about the person, communicating with each other in the same way. This requires a common data model for identifying and describing a person across data systems, which we have designed here in our **Person Standard**.

  The Person Standard provides the common set of fields -- the person's name, their date of birth, their address, et cetera -- that can be used to describe a person and distinguish them from others within a database. If different social care databases store information about people in this standard schema, this will support interoperability between them.

  In turn, this enables search-and-response. The person standard can be used as a search pattern: "I want to know about John Doe, who was born on the 1st of January 2000 and currently lives in Kingston-upon-Thames" can be encoded in a machine-readable package that can be sent from my local authority to the 316 others in England to find out who else knows safeguarding information about the person of interest.

  The person standard has now grown beyond the original search use case. It also encompasses statutory information that must be recorded (especially for Adult Social Care) like ethnicity, as well as links from a person to their GP (or other primary contact professional) and to other people related to them like their family or friends.
---

<a href="/PUB01_person_standard_table" style="float: right;"><img src="/assets/icon/table-view.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Table View</a>

## Introduction

The Person Standard standardises the data collected about individuals in children's and adults' social care systems, focusing initially on the fields required to distinguish one person from another and to describe relationships between people. Its goal is to unblock the use of single-view systems as an aid to multi-agency information sharing (MAIS).

### Purpose

This Person Standard will standardise some of the data collected about individuals in children's and adult social care systems, focussing initially on those fields required to distinguish one person from another, and to identify relationships between people. Its goal is to unblock the use of "Single View" systems, as an aid to multi-agency information sharing.

### Scope

This standard applies to the digital collection, storage, and exchange of key personal details to enable the Single View use case, as an enabler for multi-agency information sharing.

### Audience

This document is for all personnel involved in collecting, storing and processing person data, including social workers and administrative staff, data teams, and the developers of case management systems, single-view systems, and systems they interoperate with.


## Data Model

The following diagram illustrates the elements of the Person Standard.

<p class="data-model-diagram"><img src="/assets/img/person/person-data-model.svg" alt="Person Data Model" title="Person Data Model" width="80%"/></p>

A `Person` is the top-level record. It aggregates zero or more `Identifier`s, one or more `Name`s, zero or more `Address`es, zero or more `Contact` entries, zero or more `PersonRelationship`s linking to other people, an optional `dateOfBirth` (with `PartialDate`), an optional `isDeceased` flag and optional `deceasedDate` (with `PartialDate`). Cross-system matches established with other agencies are recorded as `matchedPersonRef` — an array of `Identifier`s pointing to the same person as it is known in other systems. The person's gender, phenotypic sex, and ethnicity are captured via controlled vocabularies.

### Person

The top-level record describing an individual. Consolidates the core identity attributes required to distinguish one person from another and to record relationships between individuals. Corresponds to the [Person](https://build.fhir.org/person.html) entity in FHIR and root `Person` entity in the [GDS Person Domain Logical Model](https://www.digitalservicedesigner.com/dsdrender/?id=logicalmodel_699dbdcbf751de507cd22dc5_version_69baca1afdc87488d1f0af42).

#### Properties

<span id="person-identifier">identifier</span>
: Unique identifiers associated with the person (e.g. NHS number, internal case-management system ID). Multi-valued. See [Identifier](#identifier).

<span id="person-name">name</span>
: One or more names for the person, each with a usage indicating its purpose (usual, maiden, nickname, etc.). Multi-valued. See [Name](#name).

<span id="person-dateOfBirth">dateOfBirth</span>
: The person's date of birth, with an optional accuracy indicator. Optional. See [PartialDate](#partialdate).

<span id="person-isDeceased">isDeceased</span>
: Whether the person is deceased. Optional. _Boolean_.

<span id="person-deceasedDate">deceasedDate</span>
: The person's date of death, with an optional accuracy indicator. Optional — `isDeceased` may be `true` without a known date. See [PartialDate](#partialdate).

<span id="person-addresses">address</span>
: Physical addresses where the person can be contacted. Multi-valued. Optional. See [Address](#address).

<span id="person-contact">contact</span>
: Person's contact information. Multi-valued. Optional. See [Contact](#contact).

<span id="person-genderCode">genderCode</span>
: The person's stated gender. Optional. See the [Gender Code Vocabulary](#gender-code-vocabulary).

<span id="person-sexCode">sexCode</span>
: Observed phenotypic sex, where recorded. Optional. See the [Phenotypic Sex Code Vocabulary](#phenotypic-sex-code-vocabulary).

<span id="person-ethnicityCode">ethnicityCode</span>
: The person's stated ethnicity, using the ONS 18+1 categories from the 2021 census. Statutorily required in adult social care; optional elsewhere. See the [Ethnicity Code Vocabulary](#ethnicity-code-vocabulary).

<span id="person-relatedPerson">relatedPerson</span>
: References to other people related to this person, with the kind of relationship. Multi-valued. See [PersonRelationship](#personrelationship).

<span id="person-primaryContactProfessional">primaryContactProfessional</span>
: References to the primary professionals related to this person. For example, care coordinators or a GP. Implementers should record professional references using the [`Identifier`](#identifier) structure. Multi-valued. Optional. See also `Professional` in the [safeguarding standard](PUB02_safeguarding_standard#professional).

<span id="person-matchedPersonRef">matchedPersonRef</span>
: A reference to another Person record, if a match has been identified. Multi-valued. Optional. See [Identifier](#identifier) entity for the structure.

#### Example

<div class="example">
  <h5 id="example-person">Example - Person</h5>
{% highlight json %}
{
  "@context": "https://socialcaredata.github.io/assets/model/person/context.jsonld",
  "@id": "ex:person-9434765919",
  "@type": "Person",
  "identifier": [{
      "@type": "Identifier",
      "value": "LA-12345",
      "system": "https://example.org/Id/local-authority-id"
  }],
  "name": [{
      "@type": "Name",
      "familyName": ["Doe"],
      "givenName": ["Jane"],
      "use": "official"
  }],
  "dateOfBirth": {
    "@type": "PartialDate",
    "date": "1972-01-15",
    "accuracyIndicator": "UAA"
  },
  "isDeceased": false,
  "address": [{
      "@type": "Address",
      "line1": "1 High Street",
      "city": "Anytown",
      "postcode": "AB1 2CD",
      "use": "home"
  }],
  "genderCode": "2",
  "sexCode": "2",
  "ethnicityCode": "17",
  "relatedPerson": [{
      "@type": "PersonRelationship",
      "identifier": { "@type": "Identifier", "value": "9009999991", "system": "https://fhir.nhs.uk/Id/nhs-number"},
      "relationship": ["MTH"]
  }],
  "primaryContactProfessional": [
    { "@type": "Identifier", "value": "GMC-1234567", "system": "https://example.org/Id/gmc-number" }
  ],
  "matchedPersonRef": [
    { "@type": "Identifier", "value": "EDU-987654", "system": "https://example.org/Id/lea-code" }
  ]
}
{% endhighlight %}
</div>

<div class="note">
  <h5 id="note-person">Note - conformance minimum</h5>
  <p>A conformant <code>Person</code> record MUST include at least one <code>Identifier</code>, at least one <code>Name</code> with a family name and at least one given name. All other properties are OPTIONAL where their cardinality permits, though several are statutorily required by specific data collections (e.g. <code>ethnicityCode</code> in adult social care, and <code>isDeceased</code> with optional <code>deceasedDate</code>).</p>
</div>


### Identifier

A single identifier for a person, comprising the value and the system in whose namespace the value is unique. Aligned with [FHIR `Identifier`](https://build.fhir.org/datatypes.html#Identifier), the NHS PDS `UNIQUE_REFERENCE` definition and the `Person Identifiers > Person's Identifiers` cluster in the [GDS Person Domain Logical Model](https://www.digitalservicedesigner.com/dsdrender/?id=logicalmodel_699dbdcbf751de507cd22dc5_version_69baca1afdc87488d1f0af42).

#### Properties

<span id="identifier-value">value</span>
: The identifier value, unique within the issuing system. _String_.

<span id="identifier-system">system</span>
: The URI of the system or namespace within which the identifier is unique (e.g. `https://fhir.nhs.uk/Id/nhs-number`). _URI_.

#### Example

<div class="example">
  <h5 id="example-identifier">Example - Identifier</h5>
{% highlight json %}
{
  "@type": "Identifier",
  "value": "9434765919",
  "system": "https://fhir.nhs.uk/Id/nhs-number"
}
{% endhighlight %}
</div>


### Name

Container for a person's name parts, aligned with FHIR `HumanName`. A person may have multiple names with different uses (e.g. an official legal name plus a former maiden name retained for matching against legacy records). Maps to the [GDS Person Domain Logical Model](https://www.digitalservicedesigner.com/dsdrender/?id=logicalmodel_699dbdcbf751de507cd22dc5_version_69baca1afdc87488d1f0af42) `Name` cluster.

#### Properties

<span id="name-familyName">familyName</span>
: The surname or family name. Multi-valued to support compound or hyphenated family names recorded as separate parts. _String_.

<span id="name-givenName">givenName</span>
: The first name and any middle names. Multi-valued. _String_.

<span id="name-preferredName">preferredName</span>
: Any preferred given or middle name(s) used by the person — for example, "Joe" where their legal first name is "Joseph". Optional. _String_.

<span id="name-use-code">use</span>
: The purpose of this name instance — current/official, former, nickname, etc. Optional. See the [Name Use Code Vocabulary](#name-use-code-vocabulary).

#### Example

<div class="example">
  <h5 id="example-name">Example - Name</h5>
{% highlight json %}
{
  "@type": "Name",
  "familyName": ["Doe"],
  "givenName": ["Jane", "Elizabeth"],
  "preferredName": "Janie",
  "use": "official"
}
{% endhighlight %}
</div>


### Address

A postal address for the person. Aligned with FHIR `Address`. Addresses are postal-convention based rather than coordinate based; UPRN and USRN are included to support property- and street-level disambiguation per [government guidance on property and street information](https://www.gov.uk/government/publications/open-standards-for-government/identifying-property-and-street-information). Maps to the [GDS Person Domain Logical Model](https://www.digitalservicedesigner.com/dsdrender/?id=logicalmodel_699dbdcbf751de507cd22dc5_version_69baca1afdc87488d1f0af42) `Residence > Residence Identification` cluster (`Residence Location` and `Jurisdiction of Residence`).

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

<span id="address-use-code">use</span>
: How this address is used — home, work, temp, etc. Optional. See the [Address Use Code Vocabulary](#address-use-code-vocabulary).


#### Example

<div class="example">
  <h5 id="example-address">Example - Address</h5>
{% highlight json %}
{
  "@type": "Address",
  "line1": "1 High Street",
  "line2": "Flat 3B",
  "city": "Anytown",
  "postcode": "AB1 2CD",
  "UPRN": "100012345678",
  "USRN": "12345678",
  "use": "home"
}
{% endhighlight %}
</div>

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

<div class="example">
  <h5 id="example-contact">Example - Contact</h5>
{% highlight json %}
{
  "@type": "Contact",
  "name": "Home",
  "email": ["jane.doe@example.org"],
  "telephone": ["+44 20 7946 0000"]
}
{% endhighlight %}
</div>


### PersonRelationship

A typed reference from one person to another. The reference is by `Identifier` (so the related person may live in a different system) and is qualified by one or more relationship codes.

#### Properties

<span id="personrelationship-identifier">identifier</span>
: Reference to the related person's `Identifier` (system + value). See [Identifier](#identifier).

<span id="personrelationship-relationship">relationship</span>
: One or more codes describing the kind of relationship. Multi-valued. See the [Person Relationship Code Vocabulary](#person-relationship-code-vocabulary).

#### Example

<div class="example">
  <h5 id="example-person-relationship">Example - PersonRelationship</h5>
{% highlight json %}
{
  "@type": "PersonRelationship",
  "identifier": {
    "@type": "Identifier",
    "value": "12345",
    "system": "https://example.org/Id/local-person-id"
  },
  "relationship": ["MTH"]
}
{% endhighlight %}
</div>


### PartialDate

Container for a date that may not be fully known or precise, extended with an accuracy indicator. Dates are not always known precisely in social care; the accuracy indicator allows downstream systems to interpret a date appropriately rather than treating an estimate as exact. Used for dates of birth and dates of death.

#### Properties

<span id="partialdate-date">date</span>
: ISO 8601-formatted date (`YYYY-MM-DD`). _Date_.

<span id="partialdate-accuracyIndicator">accuracyIndicator</span>
: A three-character code in day–month–year order indicating which parts of the date are accurate, estimated, or unknown. Optional. See the [Date Accuracy Indicator Vocabulary](#date-accuracy-indicator-vocabulary).

#### Example

<div class="example">
  <h5 id="example-partial-date">Example - PartialDate</h5>
{% highlight json %}
{
  "@type": "PartialDate",
  "date": "2017-09-01",
  "accuracyIndicator": "AAA"
}
{% endhighlight %}
</div>


## Vocabularies

The model is parameterised by seven controlled vocabularies.

### Name Use Code Vocabulary

Used by [`Name.use`](#name-use).

Indicates the intended purpose of a person's name, allowing applications to select the appropriate name for specific contexts. A name is assumed to be current unless it is marked as `temp` or `old`. Aligned with the [FHIR `name-use`](https://hl7.org/fhir/valueset-name-use.html) value set.

{% schema_table page.data_model nameUse expanded %}

### Address Use Code Vocabulary

Used by [`Address.use`](#address-use-code).

Specifies how an address is used, allowing applications to prioritise addresses based on context. Aligned with the [FHIR `address-use`](https://build.fhir.org/valueset-address-use.html) value set. Plays a similar role to the [GDS](https://www.digitalservicedesigner.com/dsdrender/?id=logicalmodel_699dbdcbf751de507cd22dc5_version_69baca1afdc87488d1f0af42) `Residence > Residence Status > Residence Type` attribute.

{% schema_table page.data_model addressUse expanded %}

### Gender Code Vocabulary

Used by [`Person.genderCode`](#person-genderCode).

Represents a person's stated gender identity, as distinct from biological sex. Aligned with the NHS Data Dictionary [`PERSON_STATED_GENDER_CODE`](https://www.datadictionary.nhs.uk/attributes/person_stated_gender_code.html).

{% schema_table page.data_model genderCode expanded %}

### Phenotypic Sex Code Vocabulary

Used by [`Person.sexCode`](#person-sexCode).

Documents observed phenotypic sex where recorded, representing biological characteristics rather than gender identity. Aligned with NHS PDS `PERSON_PHENOTYPIC_SEX`.

{% schema_table page.data_model sexCode expanded %}

### Ethnicity Code Vocabulary

Used by [`Person.ethnicityCode`](#person-ethnicityCode).

The person's stated ethnicity. Uses [ONS Census 2021 Ethnic group classification 20b](https://www.ons.gov.uk/census/census2021dictionary/variablesbytopic/ethnicgroupnationalidentitylanguageandreligionvariablescensus2021/ethnicgroup/classifications#:~:text=Ethnic%20group%20classification%2020b) codes.

{% schema_table page.data_model ethnicityCode expanded %}

### Date Accuracy Indicator Vocabulary

Used by [`PartialDate.accuracyIndicator`](#partialdate-accuracyIndicator).

A three-character code indicating the accuracy of each component of a date, in **day–month–year** order. Each position uses one of three letters:

- **`A`** — Accurate. The component is known to be correct.
- **`E`** — Estimated. The component has been estimated from other evidence.
- **`U`** — Unknown. The component is not known.

| Position | Component |
| :--- | :--- |
| 1 | Day |
| 2 | Month |
| 3 | Year |
{:.table-bordered}

Worked examples:

| Code | Meaning |
| :--- | :--- |
| `AAA` | Day, month, and year are all known to be accurate. |
| `UUE` | Day and month are unknown; year is estimated. |
| `UAA` | Day is unknown; month and year are accurate. |
| `EEA` | Day and month are estimated; year is accurate. |
| `UUU` | The full date is unknown (placeholder date should be treated as a guess). |
{:.table-bordered}

Aligned with the FHIR [`date-accuracy-indicator`](https://build.fhir.org/ig/hl7au/au-fhir-base/StructureDefinition-date-accuracy-indicator.html) extension pattern.

### Person Relationship Code Vocabulary

Used by [`PersonRelationship.relationship`](#personrelationship-relationship).

Characterises personal relationships between individuals, including family, spousal, foster, adoptive, and other social connections. Aligned with the HL7 v3 [`PersonalRelationshipRoleType`](https://terminology.hl7.org/CodeSystem-v3-RoleCode.html) value set.

{% schema_table page.data_model relationship %}

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
- GDS / DSIT [Person Domain Logical Model](https://www.digitalservicedesigner.com/dsdrender/?id=logicalmodel_699dbdcbf751de507cd22dc5_version_69baca1afdc87488d1f0af42)

The Person Standard is a reduced subset of the FHIR `Patient` resource, extended where social-care-specific use cases require it (e.g. `ethnicityCode` with ONS 18+1, the `accuracyIndicator` on `PartialDate`, and `matchedPersonRef` for cross-system matches). A subset of its properties can be used to query the NHS PDS directly.

### See also

- [Person matching implementation](/PUB03_standards_comparison_person_matching) — how `matchedPersonRef` is established via the FHIR `$match` operation.

## Ontology

The ontology for this specification is defined in Turtle format and is available at: [person-standard.ttl](/assets/model/person/person-standard.ttl).

To validate a `Person` record against the constraints that apply in a given context, two SHACL shapes are provided. Use [person-subject-of-care-shape.ttl](/assets/model/person/person-subject-of-care-shape.ttl) where the `Person` is the subject of care, and [person-connected-shape.ttl](/assets/model/person/person-connected-shape.ttl) where the `Person` is a connected or related individual. Each shape applies the cardinality and content rules appropriate to that role.

## Report an issue

{% include report-issue.html %}
