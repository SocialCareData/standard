---
layout: default
permalink: /hippo_standard
title: 'Comparing specifications: Standard ways to describe a Person'
regenerate: true
---

<nav class="toc numbered-toc">
<h2 id="table-of-contents">Table of Contents</h2>

1. TOC
{:toc}

</nav>

<article class="numbered-headings">

## Summary

A central pillar of our Data Standards for Social Care programme is our work on developing a common, interoperable means to identify and describe an individual that is a subject of care. This standard, a [Person specification](https://socialcaredata.github.io/spec/person/?tab=specification), was designed to represent the minimum information that should be recorded about a Person in a Care Management System (CMS) in order to enable their identification as part of multi-agency information sharing (MAIS).

## Multi-agency information sharing (MAIS) requires a standard way to describe a `Person`

Social workers rarely operate with complete information about an individual case. However, incomplete information is a leading cause of negative safeguarding and wellbeing outcomes, with asymmetries propagating into potentially severe worst-case scenarios.

MAIS is the category of processes designed to facilitate better information sharing between services for safeguarding. Say for example a child, in school, is referred by their teacher to social services on account of suspected physical harm, emotional harm, sexual abuse, or neglect. A safeguarding lead in the local authority’s Multi-agency safeguarding hub (MASH) team make enquiries (via section 17 or 47 of the Children Act) to different services – healthcare, police, and social services – in order to understand the background of the child and any significant factors that may require social care support, child protection plans, or emergency court orders.

However, when enquiring to multiple agencies, there is a problem: each agency will have its own system, storing data about the child in different ways. At a local level, this can be manageable, but when enquiries reach regional or national scale (in more geographically mobile cases, which are common in social care), heterogeneity slows down searches for records and requires manual effort where there are no API endpoints for query.

## MAIS APIs via Hippo Digital’s GET, FIND, FETCH

Homogenising person records opens the door to building APIs for MAIS. That is, moving from MASH operations on telephone and email to instead operating with automated processes that can query large numbers of systems quickly.

APIs are being built as part of the larger MAIS programme within the Department for Education by Hippo Digital. They have three kinds of APIs in mind.

***Table-1***
{: style="text-align: center;"}

|  Service |  Description |
| :--- | :--- |
| **GET** | Would enable users to find the NHS number of a person they are enquiring about. |
| **FIND (incorporating GET)** | Would enable users to find out which other agencies and services know about the person they are enquiring about. |
| **FETCH (incorporating FIND and GET)** | Would enable users to find out what information other agencies and services have about the person they are enquiring about. |
{: .table-bordered}

### Query

A user can search the API for information about a single person by building a query from all that they know about a person. That is, they query with the person’s name, their address, and more, with this query conforming to a standard structure.

The parameters in this query should conform to our `Person` standard, which is designed for this purpose. However, in current GET pilots, the OpenAPI spec (Appendix I) is extremely minimal. In table 2, below, there is a comparison between our standard and the OpenAPI spec.

### Match

The query data is sent to the NHS [Person Demographics Service (PDS)](https://digital.nhs.uk/developer/api-catalogue/personal-demographics-service-fhir), a FHIR API that operates the GET functionality by providing the NHS number of a person upon receiving a query with information about them.

The PDS requires the incoming query data to be complete and accurate to confidently match to internal NHS data. Names, addresses, and the like should align, whether via exact or fuzzy matching.

We explore matching via FHIR, the healthcare data standard that underpins the PDS, [here](https://github.com/SocialCareData/matching-standard/blob/main/README.md).

In table 2, we also compare our standard, Hippo’s GET API spec, and the [PDS FHIR API](https://digital.nhs.uk/developer/api-catalogue/personal-demographics-service-fhir#get-/Patient)’s query pattern.

### Response

The Personal Demographics Service (PDS) responds to a query with a FHIR Patient object that contains the NHS number (if it was already provided in the request, then the number is validated) of the requested person. FIND and FETCH would use the provided NHS number, as a single unique identifier, to query health, police, and social care systems across the UK in order to identify where the subject person is already known.

The PDS response pattern is detailed in the data dictionary. Only some of its fields are compared in Table-2.

## Comparing specs

As previously mentioned, GET is currently operating with an extremely basic specification for describing a Person as part of a search request. This is based on the PDS’s spec, itself a minimal spec for searching nicely-structured NHS data. Underpinning the PDS is FHIR.

We ensured our model for Person is compatible with FHIR. A subset of the properties used to describe a person can be used to query the NHS PDS.

But GET is already being piloted and seeing success: why should they want to use our person spec rather than the seemingly well-performing bare one they have themselves?

In answer, there are a number of intricacies in the world of social care that their specification does not address, each perhaps leading to failure points. These can be idiosyncratic, unique cases for single individuals, but misidentification and mismatching can have serious implications.

Our standard was built by navigating these intricacies, referencing other data standards from the PRSB and using a working group of social care experts, some of whom with extensive experience in data modelling within the domain of social care, to question and iterate a specification into a model that enables clear description of information pertinent to identifying a subject of care. This not only enables better automated matching; it also engenders overall trust in the technology systems being designed, with stakeholders aware that we have the complexities of social care in mind.

The table below serves compare our `Person` standard to the current GET API spec, the [PDS query](https://digital.nhs.uk/developer/api-catalogue/personal-demographics-service-fhir#get-/Patient) pattern, and [FHIR’s Patient](https://build.fhir.org/patient.html) object. We align common fields and provide notes where there is divergence.

***Table-2 (with RelatedPerson and PrimaryContactProfessional removed from our Person standard)***
{: style="text-align: center;"}

| Our Person Standard | GET OpenAPI spec | PDS | FHIR | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Identifier.value** <br><br> Cardinality: 1..1 (in a 1..* Identifier Object) <br><br> Definition: A single unique identifier attached to the person (e.g., NHS number). | **personID** <br> (NHS number, provided in response only, not a query param) | | **Identifier.value** | A unique identifier attached to the person. In GET and the PDS, this is their NHS number; in our standard and FHIR, this can be any identifier (with cardinality > 1). <br><br> This is because the NHS number of a person is not necessarily known to a system the person is recorded in, like a CMS. NHS numbers are mostly used in health settings, whereas CMSes use internal, alphanumeric unique IDs as references. <br><br> With the overarching programme soon to enforce NHS number as the single unique identifier of a person, it is likely that all identifiers across all systems will be homogenised as NHS numbers. Until that is the case, though, there is a need to respect the fact that people may be known by multiple heterogenous IDs across systems. |
| **Identifier.system** <br><br> Cardinality: 1..1 (in a 1..* Identifier Object) <br><br> Definition: System that the identifier adheres to (e.g., https://fhir.nhs.uk/Id/nhs-number). | | | **Identifier.system** | With our choice to enable identifiers to be more than just NHS numbers, there comes a requirement to designate the kind of identifier each value is. We can do so with FHIR's standard Identifier pattern, using a URL namespace to designate the organisational system the identifier is part of. |
| **Name.familyName** <br><br> Cardinality: 1..* (in a 1..1 Name Object) <br><br> Definition: Surname or family name. | **family** | **family** | **HumanName.family** | n/a |
| **Name.givenNames** <br><br> Cardinality: 1..* (in a 1..1 Name Object) <br><br> Definition: First and any middle names. | **given** | **given** | **HumanName.given** | n/a |
| **Name.preferredNames** <br><br> Cardinality: 0..* (in a 1..1 Name) <br><br> Definition: Any preferred given or middle names used by the person. | | | | We include a field for preferred names, as does PDS, to better enable matching; knowing a Joseph prefers Joe means a wider net can be cast when making a search for their record. |
| **Name.use** <br><br> Cardinality: 0..1 (in a 1..1 Name Object) <br><br> Definition: How this name instance is used. | | | **HumanName.use** | As we brought Adult Social Care into our programme, a field to define the "type" of a name was made important: an adult can change their name, whether part of marriage or as a formal name change when they are above 18. Knowing these names, and what they were previously, means there is more data to use in the search for a record. <br><br> You wouldn't necessarily use this field as part of the search. You wouldn't say "their maiden name was Jane Smith and now it's Jane Doe"; the search would just entail queries for both Jane Smith and Jane Doe. |
| **DateOfBirth.date** <br><br> Cardinality: 0..1 (in a 1..1 DateOfBirth Object) <br><br> Definition: ISO8601 formatted date of birth (YYYY-MM-DD). | **birthDate** | **birthdate** | **birthDate** | GET doesn't mandate ISO8601 format but it's assumed |
| **DateOfBirth.accuracyIndicator** <br><br> Cardinality: 0..1 (in a 1..1 DateOfBirth Object) <br><br> Definition: Indicates which parts of the date are known to be accurate (A), estimated (E) or unknown (U). | | | **extension:date-accuracy-indicator** | One of the first problems raised by the working group was that across social care, dates of birth were not always known or accurate. This accuracy indicator still needs to be worked on, but essentially enables fuzziness in the recording of DoB. We could extend it to include the expected date of births for unborn children. <br><br> Less of a search parameter and more of a rule for the search -- saying "look around this date" rather than "look for this date" |
| **Deceased.deceasedStatus** <br><br> Cardinality: 1..1 (in a 1..1 Deceased Object) <br><br> Definition: True / False for if person is deceased. | | | **deceasedBoolean** | Adult Social Care systems require deaths to be recorded on a Person's record. This is part of statutory data collection, enabling analysis of mortality, but also ensures that resources aren't allocated to people that are deceased. It is also an important search parameter / filter. |
| **Deceased.date** <br><br> Cardinality: 0..1 (in a 1..* Deceased Object) <br><br> Definition: ISO8601 formatted date of death (YYYY-MM-DD). | | **death-date** | **deceasedDatetime** | Date of Death could be simultaneous with deceasedStatus; after all, having a date of death means that a person is deceased. However, date of death is not always known. |
| **Address.line1** <br><br> Cardinality: 1..1 (in a 1..* Address Object) <br><br> Definition: Street address, c/o. | | **address.line** <br> (in response only, not a query param) | **address.line** | While Address lines are generally heterogeneously recorded and difficult to use for a search, the working group still thinks they're important as part of the minimum spec of a Person record. Operating with postcode alone is sometimes fine, but not always, especially in high density residential areas. |
| **Address.line2** <br><br> Cardinality: 0..1 (in a 1..* Address Object) <br><br> Definition: Apartment, suite, unit, building, floor, etc. | | **address.line** <br> (in response only, not a query param) | **address.line** | While Address lines are generally heterogeneously recorded and difficult to use for a search, the working group still thinks they're important as part of the minimum spec of a Person record. Operating with postcode alone is sometimes fine, but not always, especially in high density residential areas. |
| **Address.city** <br><br> Cardinality: 1..1 (in a 1..* Address Object) <br><br> Definition: City, town, or village. | | **address.city** <br> (in response only, not a query param) | **address.city** | City is a useful filter for a search and generally more homogeneously recorded than address lines are. |
| **Address.postcode** <br><br> Cardinality: 1..1 (in a 1..* Address Object) <br><br> Definition: Postcode. | **addressPostalCode** | **address-postalcode** | **address.postalCode** | Postcode is the defacto search parameter when it comes to residential location. However, operating with postcode alone can be difficulty in high density residential areas. |
| **Address.UPRN** <br><br> Cardinality: 0..1 (in a 1..* Address Object) <br><br> Definition: Unique Property Reference Number of the address. | | | | At the time of building our person spec, the government was drafting guidance (that has been published, [here](https://www.gov.uk/government/publications/open-standards-for-government/identifying-property-and-street-information)) that recommends "systems, services and applications that store or publish data sets containing property and street information must use the UPRN and USRN identifiers." <br><br> Unique Property Reference Numbers (UPRNs) are the unique identifiers for every addressable location in Great Britain. |
| **Address.USRN** <br><br> Cardinality: 0..1 (in a 1..* Address Object) <br><br> Definition: Unique Street Reference Number of the address. | | | | At the time of building our person spec, the government was drafting guidance (that has been published, [here](https://www.gov.uk/government/publications/open-standards-for-government/identifying-property-and-street-information)) that recommends "systems, services and applications that store or publish data sets containing property and street information must use the UPRN and USRN identifiers." <br><br> Unique Street Reference Numbers (USRNs) are the unique identifiers for every street in Great Britain. |
| **Address.use** <br><br> Cardinality: 0..1 (in a 1..* Address Object) <br><br> Definition: How this address is used. | | **address.use** <br> (in response only, not a query param) | **address.use** | This field enables demarcation of the kind of address. The current code system -- FHIR's address-use -- is not particularly useful for the social care use case, which could include the address of foster care, placements, or something else. |
| **Gender** <br><br> Cardinality: 1..1 <br><br> Definition: The person's stated gender. This information does not pertain to biological sex. Uses NHS PERSON_STATED_GENDER_CODE. | **gender** | **gender** | **gender** | Gender and Sex were major points of interest amongst ourselves and the working group. <br><br> Gender was seen to be an important search parameter that could not be left out of the design of our person standard. We sought to include it by representing it as "person stated gender" -- the gender a person identifies as, when asked. |
| **Sex** <br><br> Cardinality: 0..1 <br><br> Definition: Observed phenotypic sex, where recorded. Uses NHS PERSON_PHENOTYPIC_SEX | | | | Importantly, while our work on gender was being ratified by the working group, [a landmark decision by the supreme court](https://www.bbc.co.uk/news/live/cvgq9ejql39t) was followed by an extreme focus on transgender identification in official systems and services. Government guidance published before and during this time period recommended phenotypic, biological sex or to be recorded in social care systems. <br><br> Importantly, this would be recorded as per the sex on birth certificate. [Some guidance](https://www.gov.uk/government/publications/children-looked-after-return-2024-to-2025-guide) allows gender recognition certificates too -- but note that this requires the individual to be >18 and officially diagnosed with gender dysphoria. <br><br> We felt that this was an extremely difficult subject to navigate, and went through multiple iterations. While government policy takes priority, references to a person's phenotypic sex can potentially distress subjects of care, and even the act of benign record-keeping can lead to case worker confusion or, in worst case scenarios, biased care delivery. <br><br> We settled on having Person Stated gender, as above, and an optional field for Phenotypic Sex. Note that, in FHIR, clinical sex is not an attribute of a person. <br><br> Read more about Gender and Sex in [this issue thread](https://github.com/SocialCareData/person-standard/issues/24). |
| **Ethnicity** <br><br> Cardinality: 1..1 <br><br> Definition: The person's stated ethnicity, according to ONS 18+1 (the categories used in the 2021 census, can include "not provided"). | | | | Ethnicity was added to our person standard as part of adjusting it for Adult Social Care, where it is statutorily required. It's not necessarily recorded in Child Social Care. <br><br> We noted that this is less of a tense issue than Gender and Sex, above. The NHS and ONS already have standard means of describing the info. |
| | **phone** | **phone** | **telecom(ContactPoint)** | Our person standard does not have phone number because the primary aim is not to facilitate contact with the subject of care, but rather to facilitate contact with people who know about the subject of care. <br><br> Phone and email of the subject person -- especially when it came to Children -- were more information than required, therefore. <br><br> We could add this, as the info can in some cases act as a unique identifier to help matching. Hasn't been decided yet. |
| | **email** | **email** | **telecom(ContactPoint)** | Our person standard does not have email because the primary aim is not to facilitate contact with the subject of care, but rather to facilitate contact with people who know about the subject of care. <br><br> Phone and email of the subject person -- especially when it came to Children -- were more information than required, therefore. <br><br> We could add this, as the info can in some cases act as a unique identifier to help matching. Hasn't been decided yet. |
| | | **general-practitioner** | **generalPractitioner** | The PDS allows queries to have codes for the individual's GP practice. |
{: .table-bordered}

## Appendix I – the Hippo GET OpenAPI spec (truncated)

```yaml
openapi: 3.0.1
info:
  title: Get an Identifier API
  description: |
    The Get an Identifier API is part of the Single Unique Identifier (SUI) programme for improving multi-agency information sharing in relation to safeguarding and welfare of children.

    The Get an Identifier API is a service that takes basic demographic information and determines and returns the individual's identifier.
  version: 0.9.0

…

components:
  schemas:
    matchRequest:
      type: object
      properties:
        personSpecification:
          $ref: "#/components/schemas/personSpecification"
        metadata:
          type: array
          description: Metadata about the record(s) of data held for the specified person, used to help the SUI System maintain data accuracy.
          items:
            $ref: "#/components/schemas/matchRequestMetadata"
      required:
        - personSpecification
    personSpecification:
      type: object
      description: Known information about a person, which can be used to obtain their Single Unique Identifier.
      properties:
        given:
          type: string
          description: Given names (not always 'first'). Includes middle names
          example: Octavia
        family:
          type: string
          description: Family name (often called 'Surname')
          example: Chislett
        birthDate:
          type: string
          description: The date of birth for the individual
          format: date
          example: 2022-03-17
        gender:
          type: string
          description: The gender that the patient is considered to have for administration and record keeping purposes.
          enum:
            - female
            - male
            - other
            - unknown
        phone:
          type: string
          description: A telephone number by which the individual may be contacted.
        email:
          type: string
          description: An email address by which the individual may be contacted.
        addressPostalCode:
          type: string
          description: Postal code for address of the individual.
          example: KT19 0ST
    recordType:
      type: string
      description: The type of the record of data about a person
      enum:
        - childrens-services.details
        - crime-justice.details
        - education.details
        - health.details
        - personal.details
    matchRequestMetadata:
      type: object
      properties:
        recordType:
          $ref: "#/components/schemas/recordType"
        systemId:
          type: string
          description: Optional. Specifies the unique identifier for the system that holds the record of data.
        recordId:
          type: string
          description: Optional. Specifies the unique identifier for the record of data.
      required:
        - recordType
    personMatch:
      type: object
      properties:
        personId:
          type: string
          description: The Single Unique Identifier for an individual
          example: "9449305552"
      required:
        - personId
…
```

## Report an issue

If you spot an issue with this document, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+HIPPO+Specification+Comparison" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

