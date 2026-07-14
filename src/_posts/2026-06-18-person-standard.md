---
layout: version
current: /publications_person_standard
title: Person Standard (2026-06-18)
description: A common data model for identifying and describing a person across social care systems, designed to unblock multi-agency information sharing and single-view use cases.
changelog:
  - The Person and ConnectedPerson entities have been unified into a single Person entity. The two shared approximately 80% of their fields and differed mainly in cardinality requirements.
  - Validation strictness is now handled through context-specific profiles (shape files) rather than separate entity types, aligning with how FHIR manages validation variance across use contexts.
  - RelatedPerson references changed from URI to Identifier.
  - matchedPersonRef references changed from URI to Identifier
  - PartialDate extracted as a reusable datatype
  - Deceased.date upgraded to PartialDate
  - UPRN and USRN type corrected from Float16 to String
  - Plural property names changed to singular (for example, givenNames > givenName)
  - Property names standardised for consistency (for example, ethnicCode > ethnicityCode - "ethnic" is an adjective; "ethnicity" is the correct noun form.)
  - Vocabulary names decoupled from entity context (for example, PersonEthnicity > EthnicityCode)
breadcrumbs:
  - Publications
tags:
  - Person
  - Publication
  - MAIS
---

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

The top-level record describing an individual. Consolidates the core identity attributes required to distinguish one person from another and to record relationships between individuals. Corresponds to the [Person](https://build.fhir.org/person.html) entity in FHIR and root `Person` entity in the [GDS Person Domain Logical Model](https://www.digitalservicedesigner.com/dsdrender/?id=logicalmodel_699dbdcbf751de507cd22dc5_version_69baca1afdc87488d1f0af42) (Domain Expert Group on Person - DEGoP).

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
: References to the primary professionals related to this person. For example, care coordinators or a GP. Multi-valued. Optional. See `Professional`.

_The `Professional` entity will be defined in a forthcoming Professional Data Standard. Until that standard is published, implementers should record professional references using the `Identifier` structure (system + value)._

<span id="person-matchedPersonRef">matchedPersonRef</span>
: A reference to another Person record, if a match has been identified. Multi-valued. Optional. See [Identifier](#identifier) entity for the structure.

#### Example

<div class="example">
  <h5 id="example-person">Example - Person (top level)</h5>
{% highlight json %}
{
  "@context": "https://socialcaredata.github.io/ontology/person/context.jsonld",
  "@id": "ex:person-9434765919",
  "@type": "Person",
  "identifier":      [ { "see Identifier example" } ],
  "name":            [ { "see Name example" } ],
  "dateOfBirth":      { "see PartialDate example" },
  "isDeceased":       false
  "address":        [ { "see Address example" } ],
  "genderCode":           "2",
  "sexCode":          "2",
  "ethnicityCode":       "17",
  "relatedPerson":    [ { "see PersonRelationship example" } ],
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

The model is parameterised by seven controlled vocabularies, each held in its own include file under `src/_includes/vocabularies/`.

### Name Use Code Vocabulary

Used by [`Name.use`](#name-use).

Indicates the intended purpose of a person's name, allowing applications to select the appropriate name for specific contexts. A name is assumed to be current unless it is marked as `temp` or `old`. Aligned with the [FHIR `name-use`](https://hl7.org/fhir/valueset-name-use.html) value set.

| Code | Label | Definition |
| :--- | :--- | :--- |
| `usual` | Usual name | The name commonly used by the person — what they normally go by. |
| `official` | Official name | The formal name registered in a government register; may not be the name commonly used. |
| `temp` | Temporary name | A temporary name; assigned at birth, in emergencies, or where the person's full name is not yet known. |
| `nickname` | Nickname | An informal name not part of the person's formal or usual name. |
| `anonymous` | Anonymous | A pseudonym used to protect the person's privacy. |
| `old` | Old name | A name no longer in use, or never correct, but retained for record-matching purposes. |
| `maiden` | Maiden name | A name used prior to marriage. Applies regardless of gender. |
{:.table-bordered}

### Address Use Code Vocabulary

Used by [`Address.use`](#address-use-code).

Specifies how an address is used, allowing applications to prioritise addresses based on context. Aligned with the [FHIR `address-use`](https://build.fhir.org/valueset-address-use.html) value set. Plays a similar role to the [GDS](https://www.digitalservicedesigner.com/dsdrender/?id=logicalmodel_699dbdcbf751de507cd22dc5_version_69baca1afdc87488d1f0af42) `Residence > Residence Status > Residence Type` attribute.

| Code | Label | Definition |
| :--- | :--- | :--- |
| `home` | Home | A communication address at a home. |
| `work` | Work | An office address. First choice for business related contacts during business hours. |
| `temp` | Temporary | A temporary address. The period can provide more detailed information. |
| `old` | Old / Incorrect | This address is no longer in use (or was never correct but retained for records). |
| `billing` | Billing | An address to be used to send bills, invoices, receipts etc. |
{:.table-bordered}

### Gender Code Vocabulary

Used by [`Person.genderCode`](#person-genderCode).

Represents a person's stated gender identity, as distinct from biological sex. Aligned with the NHS Data Dictionary [`PERSON_STATED_GENDER_CODE`](https://www.datadictionary.nhs.uk/attributes/person_stated_gender_code.html).

| Code | Label | Definition |
| :--- | :--- | :--- |
| `1` | Male | The person identifies as male. |
| `2` | Female | The person identifies as female. |
| `9` | Indeterminate | Unable to be classified as either male or female. |
| `X` | Not Known | Not recorded, or information unavailable. |
{:.table-bordered}

### Phenotypic Sex Code Vocabulary

Used by [`Person.sexCode`](#person-sexCode).

Documents observed phenotypic sex where recorded, representing biological characteristics rather than gender identity. Aligned with NHS PDS `PERSON_PHENOTYPIC_SEX`.

| Code | Label | Definition |
| :--- | :--- | :--- |
| `1` | Male | The person is phenotypically male. |
| `2` | Female | The person is phenotypically female. |
| `9` | Indeterminate | Unable to be classified phenotypically as either male or female. |
| `X` | Not Known | Not recorded, or information unavailable. |
{:.table-bordered}

### Ethnicity Code Vocabulary

Used by [`Person.ethnicityCode`](#person-ethnicityCode).

The person's stated ethnicity. Uses [ONS Census 2021 Ethnic group classification 20b](https://www.ons.gov.uk/census/census2021dictionary/variablesbytopic/ethnicgroupnationalidentitylanguageandreligionvariablescensus2021/ethnicgroup/classifications#:~:text=Ethnic%20group%20classification%2020b) codes.

| Code | Label |
| :--- | :--- |
| `1` | Asian, Asian British or Asian Welsh: Bangladeshi |
| `2` | Asian, Asian British or Asian Welsh: Chinese |
| `3` | Asian, Asian British or Asian Welsh: Indian |
| `4` | Asian, Asian British or Asian Welsh: Pakistani |
| `5` | Asian, Asian British or Asian Welsh: Other Asian |
| `6` | Black, Black British, Black Welsh, Caribbean or African: African |
| `7` | Black, Black British, Black Welsh, Caribbean or African: Caribbean |
| `8` | Black, Black British, Black Welsh, Caribbean or African: Other Black |
| `9` | Mixed or Multiple ethnic groups: White and Asian |
| `10` | Mixed or Multiple ethnic groups: White and Black African |
| `11` | Mixed or Multiple ethnic groups: White and Black Caribbean |
| `12` | Mixed or Multiple ethnic groups: Other Mixed or Multiple ethnic groups |
| `13` | White: English, Welsh, Scottish, Northern Irish or British |
| `14` | White: Irish |
| `15` | White: Gypsy or Irish Traveller |
| `16` | White: Roma |
| `17` | White: Other White |
| `18` | Other ethnic group: Arab |
| `19` | Other ethnic group: Any other ethnic group |
| `-8` | Does not apply* |

*Students and schoolchildren living away during term-time.
{:.table-bordered}

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

| Code | Label | Definition |
| :--- | :--- | :--- |
| `FAMMEMB` | Family member | A familial relationship between two people. |
| `CHILD` | Child | Offspring of the scoping person. |
| `NCHILD` | Natural child | Offspring determined by birth. |
| `CHLDADOPT` | Adopted child | A child legally adopted and raised by the scoping person. |
| `DAUADOPT` | Adopted daughter | A female child legally adopted and raised by the scoping person. |
| `SONADOPT` | Adopted son | A male child legally adopted and raised by the scoping person. |
| `CHLDFOST` | Foster child | A child receiving parental care without legal or blood ties. |
| `DAUFOST` | Foster daughter | A female child receiving foster parental care. |
| `SONFOST` | Foster son | A male child receiving foster parental care. |
| `DAUC` | Daughter | A female child (of any type) of the scoping person. |
| `DAU` | Natural daughter | Female offspring of the scoping person. |
| `STPDAU` | Stepdaughter | A daughter of the scoping person's spouse by a previous union. |
| `SON` | Natural son | Male offspring of the scoping person. |
| `SONC` | Son | A male child (of any type) of the scoping person. |
| `STPSON` | Stepson | A son of the scoping person's spouse by a previous union. |
| `STPCHLD` | Stepchild | A child of the scoping person's spouse by a previous union. |
| `EXT` | Extended family member | A non-immediate genetic or legal relative (e.g. aunt, cousin). |
| `AUNT` | Aunt | Sister of the scoping person's parent. |
| `MAUNT` | Maternal aunt | Biological sister of the scoping person's biological mother. |
| `PAUNT` | Paternal aunt | Biological sister of the scoping person's biological father. |
| `UNCLE` | Uncle | Brother of the scoping person's parent. |
| `MUNCLE` | Maternal uncle | Biological brother of the scoping person's biological mother. |
| `PUNCLE` | Paternal uncle | Biological brother of the scoping person's biological father. |
| `COUSN` | Cousin | A relative descended from a common ancestor by multiple steps. |
| `MCOUSN` | Maternal cousin | Biological relative via the scoping person's mother's line. |
| `PCOUSN` | Paternal cousin | Biological relative via the scoping person's father's line. |
| `NIENEPH` | Niece/nephew | Child of the scoping person's sibling. |
| `NEPHEW` | Nephew | Son of the scoping person's sibling. |
| `NIECE` | Niece | Daughter of the scoping person's sibling. |
| `GGRPRN` | Great-grandparent | Parent of the scoping person's grandparent. |
| `GGRFTH` | Great-grandfather | Father of the scoping person's grandparent. |
| `MGGRFTH` | Maternal great-grandfather | Biological father of the scoping person's maternal grandparent. |
| `PGGRFTH` | Paternal great-grandfather | Biological father of the scoping person's paternal grandparent. |
| `GGRMTH` | Great-grandmother | Mother of the scoping person's grandparent. |
| `MGGRMTH` | Maternal great-grandmother | Biological mother of the scoping person's maternal grandparent. |
| `PGGRMTH` | Paternal great-grandmother | Biological mother of the scoping person's paternal grandparent. |
| `MGGRPRN` | Maternal great-grandparent | Biological parent of the scoping person's maternal grandparent. |
| `PGGRPRN` | Paternal great-grandparent | Biological parent of the scoping person's paternal grandparent. |
| `GRPRN` | Grandparent | Parent of the scoping person's parent. |
| `GRFTH` | Grandfather | Father of the scoping person's parent. |
| `MGRFTH` | Maternal grandfather | Biological father of the scoping person's biological mother. |
| `PGRFTH` | Paternal grandfather | Biological father of the scoping person's biological father. |
| `GRMTH` | Grandmother | Mother of the scoping person's parent. |
| `MGRMTH` | Maternal grandmother | Biological mother of the scoping person's biological mother. |
| `PGRMTH` | Paternal grandmother | Biological mother of the scoping person's biological father. |
| `MGRPRN` | Maternal grandparent | Biological parent of the scoping person's biological mother. |
| `PGRPRN` | Paternal grandparent | Biological parent of the scoping person's biological father. |
| `GRNDCHILD` | Grandchild | Child of the scoping person's son or daughter. |
| `GRNDDAU` | Granddaughter | Daughter of the scoping person's child. |
| `GRNDSON` | Grandson | Son of the scoping person's child. |
| `INLAW` | In-law | A member of the scoping person's spouse's immediate family. |
| `CHLDINLAW` | Child-in-law | Spouse of the scoping person's child. |
| `DAUINLAW` | Daughter-in-law | Wife of the scoping person's son. |
| `SONINLAW` | Son-in-law | Husband of the scoping person's daughter. |
| `PRNINLAW` | Parent-in-law | A parent of the scoping person's spouse. |
| `FTHINLAW` | Father-in-law | Father of the scoping person's spouse. |
| `MTHINLAW` | Mother-in-law | Mother of the scoping person's spouse. |
| `SIBINLAW` | Sibling-in-law | The spouse's sibling or the spouse of the scoping person's sibling. |
| `BROINLAW` | Brother-in-law | The spouse's brother, or the husband of the scoping person's sister. |
| `SISINLAW` | Sister-in-law | The spouse's sister, or the wife of the scoping person's brother. |
| `PRN` | Parent | One who begets, gives birth to, or raises the scoping person. |
| `NPRN` | Natural parent | Biological parent. |
| `ADOPTP` | Adoptive parent | A parent who legally adopted the scoping person. |
| `ADOPTF` | Adoptive father | A male parent who legally adopted the scoping person. |
| `ADOPTM` | Adoptive mother | A female parent who legally adopted the scoping person. |
| `PRNFOST` | Foster parent | A state-certified caregiver for the scoping person as a foster child. |
| `STPPRN` | Stepparent | Spouse of the scoping person's parent, where they are not the biological parent. |
| `FTH` | Father | Male parent. |
| `NFTH` | Natural father | Male biological parent. |
| `FTHFOST` | Foster father | Male state-certified caregiver for the scoping person as a foster child. |
| `STPFTH` | Stepfather | Husband of the scoping person's mother, where he is not the biological father. |
| `MTH` | Mother | Female parent. |
| `NMTH` | Natural mother | Female biological parent. |
| `GESTM` | Gestational mother | A woman whose womb carried the foetus (distinct from biological mother where surrogacy is involved). |
| `MTHFOST` | Foster mother | Female state-certified caregiver for the scoping person as a foster child. |
| `STPMTH` | Stepmother | Wife of the scoping person's father, where she is not the biological mother. |
| `SIB` | Sibling | Shares one or both parents with the scoping person. |
| `NSIB` | Natural sibling | Both biological parents in common with the scoping person. |
| `HSIB` | Half-sibling | Related to the scoping person by a single biological parent. |
| `STPSIB` | Stepsibling | A child of the scoping person's stepparent. |
| `BRO` | Brother | Male sibling. |
| `NBRO` | Natural brother | Male sibling with the same biological parents as the scoping person. |
| `HBRO` | Half-brother | Male sibling related by a single biological parent. |
| `STPBRO` | Stepbrother | A son of the scoping person's stepparent. |
| `SIS` | Sister | Female sibling. |
| `NSIS` | Natural sister | Female sibling with the same biological parents as the scoping person. |
| `HSIS` | Half-sister | Female sibling related by a single biological parent. |
| `STPSIS` | Stepsister | A daughter of the scoping person's stepparent. |
| `TWIN` | Twin | A twin from the same womb or parental pairing as the scoping person. |
| `TWINBRO` | Twin brother | Male twin. |
| `TWINSIS` | Twin sister | Female twin. |
| `ITWIN` | Identical twin | A twin from the same egg/sperm pair as the scoping person. |
| `ITWINBRO` | Identical twin brother | Male identical twin. |
| `ITWINSIS` | Identical twin sister | Female identical twin. |
| `FTWIN` | Fraternal twin | A twin from distinct egg/sperm pairs. |
| `FTWINBRO` | Fraternal twin brother | Male fraternal twin. |
| `FTWINSIS` | Fraternal twin sister | Female fraternal twin. |
| `SPS` | Spouse | Marriage partner. |
| `HUSB` | Husband | A man joined in marriage. |
| `WIFE` | Wife | A woman joined in marriage. |
| `FMRSPS` | Former spouse | A previously married partner; the marriage has been dissolved. |
| `DOMPART` | Domestic partner | A cohabiting partner who is not a spouse. |
| `SIGOTHR` | Significant other | A person important to the scoping person's well-being (spouse or equivalent). |
| `FRND` | Friend | A known, liked, and trusted person who is not a relative. |
| `NBOR` | Neighbour | A person living nearby. |
| `ROOM` | Roommate | A person sharing living quarters. |
| `ONESELF` | Self | A relationship of the person with themselves (used to express identity links). |
{:.table-bordered}

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

- [Person matching implementation](/standards_comparison_person_matching) — how `matchedPersonRef` is established via the FHIR `$match` operation.


## Report an issue

If you spot an issue with this standard, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Person+Standard%3A%20&page=https%3A%2F%2Fstandard.socialcaredata.io%2Fperson_standard&category=Person+Standard" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.


## Versions

{% include versions.html %}
