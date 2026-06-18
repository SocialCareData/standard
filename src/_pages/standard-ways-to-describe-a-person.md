---
title: Standard ways to describe a Person
tags:
  - Interoperability
  - MAIS
---

<nav class="toc numbered-toc">
<h2 id="table-of-contents">Table of Contents</h2>

1. TOC
{:toc}

</nav>

<article class="numbered-headings">


## Summary

A central pillar of our Data Standards for Social Care programme is our work on developing a common, interoperable means to identify and describe an individual that is a subject of care. The [Person specification](https://socialcaredata.github.io/spec/person/?tab=specification), was designed to represent the minimum information that should be recorded about a Person in a Care Management System (CMS) in order to enable their identification as part of multi-agency information sharing (MAIS).

This document compares the Person specification developed by the Social Care Data Standards programme against the Hippo Digital's current GET API specification, the NHS [Person Demographics Service (PDS)](https://digital.nhs.uk/developer/api-catalogue/personal-demographics-service-fhir) query pattern, and the [FHIR Patient](https://digital.nhs.uk/developer/api-catalogue/personal-demographics-service-fhir#get-/Patient) resource. Its purpose is to support a joint conversation between the Data Standards team and Hippo Digital on aligning the Person model used across the GET, FIND, and FETCH services.

***Table-1***
{: style="text-align: center;"}

| Specification | Version / Source |
| :--- | :--- |
| Person specification | [Latest published version](https://socialcaredata.github.io/spec/person/?tab=specification) |
| GET API | OpenAPI spec, version `0.9.0` (extract in Appendix I) |
| NHS PDS | [Personal Demographics Service FHIR API, `GET /Patient`](https://digital.nhs.uk/developer/api-catalogue/personal-demographics-service-fhir#get-/Patient) |
| FHIR Patient | [Patient resource](https://build.fhir.org/patient.html) |
{:.table-bordered}

## Multi-agency information sharing (MAIS)

Social workers rarely operate with complete information about an individual case. However, incomplete information is a leading cause of negative safeguarding and wellbeing outcomes, with asymmetries propagating into potentially severe worst-case scenarios.

MAIS is the category of processes designed to facilitate better information sharing between services for safeguarding. Say for example a child, in school, is referred by their teacher to social services on account of suspected physical harm, emotional harm, sexual abuse, or neglect. A safeguarding lead in the local authority’s Multi-agency safeguarding hub (MASH) team make enquiries (via section 17 or 47 of the Children Act) to different services – healthcare, police, and social services – in order to understand the background of the child and any significant factors that may require social care support, child protection plans, or emergency court orders.

However, when enquiring to multiple agencies, there is a problem: each agency will have its own system, storing data about the child in different ways. At a local level, this can be manageable, but when enquiries reach regional or national scale (in more geographically mobile cases, which are common in social care), heterogeneity slows down searches for records and requires manual effort where there are no API endpoints for query.

## MAIS APIs via Hippo Digital’s GET, FIND, FETCH

Homogenising person records opens the door to building APIs for MAIS. That is, moving from MASH operations on telephone and email to instead operating with automated processes that can query large numbers of systems quickly.

APIs are being built as part of the larger MAIS programme within the Department for Education by Hippo Digital. They have three kinds of APIs in mind.

***Table-2***
{: style="text-align: center;"}

|  Service |  Description |
| :--- | :--- |
| **GET** | Would enable users to find the NHS number of a person they are enquiring about. |
| **FIND (incorporating GET)** | Would enable users to find out which other agencies and services know about the person they are enquiring about. |
| **FETCH (incorporating FIND and GET)** | Would enable users to find out what information other agencies and services have about the person they are enquiring about. |
{:.table-bordered}

In the GET service, a user submits a query built from what is known about a person — names, address, and so on — to the NHS [Person Demographics Service (PDS)](https://digital.nhs.uk/developer/api-catalogue/personal-demographics-service-fhir), a FHIR API. The PDS matches against internal NHS data and responds with a FHIR Patient object containing the person's NHS number. Matching requires the query data to align with NHS records, whether via exact or fuzzy matching; we explore matching via FHIR [here](/person_matching_implementation).

FIND and FETCH would then use the returned NHS number, as a single unique identifier, to query health, police, and social care systems across the UK in order to identify where the subject person is already known.

## Comparing specifications

GET's current specification for describing a `Person` is based on the PDS's query pattern, which is itself based on FHIR. Our Person specification is also FHIR-compatible — a subset of its properties can be used to query the NHS PDS directly.

The Person specification includes additional fields beyond those in the current GET spec, addressing social care–specific cases where minimal demographic data may not be sufficient for accurate identification. Misidentification and mismatching can have serious implications for the individual. Our standard was developed in consultation with social care practitioners and aligns with relevant PRSB standards.

The table below compares our `Person` standard to the current GET API spec, the [PDS query](https://digital.nhs.uk/developer/api-catalogue/personal-demographics-service-fhir#get-/Patient) pattern, and [FHIR's Patient](https://build.fhir.org/patient.html) object. Common fields are aligned across columns; notes describe each Person field's rationale and how it relates to GET.

{: style="text-align: center;"}

| Get an Identifier API | Person Standard | NHS PDS | FHIR | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **personID** <br> (NHS number, provided in response only, not a query param) | **Identifier.value** <br><br> Cardinality: 1..1 (in a 1..* Identifier Object) <br><br> Definition: A single unique identifier attached to the person (e.g., NHS number). | | **Identifier.value** | GET and PDS use the NHS number as the single identifier. Our standard and FHIR permit multiple identifiers because care management systems often use internal alphanumeric IDs and may not hold an NHS number for every person on record. <br><br> The wider programme is moving toward NHS number as the single identifier across systems; until that convergence, the standard accommodates multiple heterogeneous identifiers. |
| | **Identifier.system** <br><br> Cardinality: 1..1 (in a 1..* Identifier Object) <br><br> Definition: System that the identifier adheres to (e.g., https://fhir.nhs.uk/Id/nhs-number). | | **Identifier.system** | Required where more than one identifier type is permitted, to disambiguate. Follows the FHIR Identifier pattern using a URL namespace. |
| **family** | **Name.familyName** <br><br> Cardinality: 1..* (in a 1..1 Name Object) <br><br> Definition: Surname or family name. | **family** | **HumanName.family** | n/a |
| **given** | **Name.givenNames** <br><br> Cardinality: 1..* (in a 1..1 Name Object) <br><br> Definition: First and any middle names. | **given** | **HumanName.given** | n/a |
| | **Name.preferredNames** <br><br> Cardinality: 0..* (in a 1..1 Name) <br><br> Definition: Any preferred given or middle names used by the person. | | | Supports matching where a person is commonly known by a name other than their legal first name (e.g. Joe for Joseph). Also present in PDS. |
| | **Name.use** <br><br> Cardinality: 0..1 (in a 1..1 Name Object) <br><br> Definition: How this name instance is used. | | **HumanName.use** | Captures historic names (e.g. former names following marriage or formal change of name), widening matching against legacy records. Not a search parameter itself — queries would be made against both current and former names. |
| **birthDate** | **DateOfBirth.date** <br><br> Cardinality: 0..1 (in a 1..1 DateOfBirth Object) <br><br> Definition: ISO8601 formatted date of birth (YYYY-MM-DD). | **birthdate** | **birthDate** | GET specifies `format: date`; ISO8601 is assumed. |
| | **DateOfBirth.accuracyIndicator** <br><br> Cardinality: 0..1 (in a 1..1 DateOfBirth Object) <br><br> Definition: Indicates which parts of the date are known to be accurate (A), estimated (E) or unknown (U). | | **extension:date-accuracy-indicator** | Dates of birth are not always known precisely in social care. The indicator allows the consumer to interpret the date appropriately — applying fuzzy matching where the day or month is estimated rather than treating it as exact. |
| | **Deceased.deceasedStatus** <br><br> Cardinality: 1..1 (in a 1..1 Deceased Object) <br><br> Definition: True / False for if person is deceased. | | **deceasedBoolean** | Required for statutory data collection in adult social care, and used to filter deceased individuals from service allocation. Also relevant as a search filter. |
| | **Deceased.date** <br><br> Cardinality: 0..1 (in a 1..* Deceased Object) <br><br> Definition: ISO8601 formatted date of death (YYYY-MM-DD). | **death-date** | **deceasedDatetime** | Date of death is not always known even where deceased status is. |
| **address.line** <br> (in response only, not a query param) | **Address.line1** <br><br> Cardinality: 1..1 (in a 1..* Address Object) <br><br> Definition: Street address, c/o. | **address.line** <br> (in response only, not a query param) | **address.line** | Supports disambiguation in high-density residential areas where postcode alone is insufficient. |
| | **Address.line2** <br><br> Cardinality: 0..1 (in a 1..* Address Object) <br><br> Definition: Apartment, suite, unit, building, floor, etc. | **address.line** <br> (in response only, not a query param) | **address.line** | As above. |
| | **Address.city** <br><br> Cardinality: 1..1 (in a 1..* Address Object) <br><br> Definition: City, town, or village. | **address.city** <br> (in response only, not a query param) | **address.city** | A useful filter, generally more homogeneously recorded than address lines. |
| **addressPostalCode** | **Address.postcode** <br><br> Cardinality: 1..1 (in a 1..* Address Object) <br><br> Definition: Postcode. | **address-postalcode** | **address.postalCode** | The de facto search parameter for residential location across all specifications. |
| | **Address.UPRN** <br><br> Cardinality: 0..1 (in a 1..* Address Object) <br><br> Definition: Unique Property Reference Number of the address. | | | Per [government guidance on property and street information](https://www.gov.uk/government/publications/open-standards-for-government/identifying-property-and-street-information), systems holding property data should use UPRN. UPRNs are unique identifiers for every addressable location in Great Britain. |
| | **Address.USRN** <br><br> Cardinality: 0..1 (in a 1..* Address Object) <br><br> Definition: Unique Street Reference Number of the address. | | | Per the same guidance as UPRN. USRNs are unique identifiers for every street in Great Britain. |
| | **Address.use** <br><br> Cardinality: 0..1 (in a 1..* Address Object) <br><br> Definition: How this address is used. | **address.use** <br> (in response only, not a query param) | **address.use** | Identifies the type of address (e.g. home, placement, foster care). The FHIR address-use code system may not cover all social care use cases. |
| **gender** | **Gender** <br><br> Cardinality: 1..1 <br><br> Definition: The person's stated gender. This information does not pertain to biological sex. Uses NHS PERSON_STATED_GENDER_CODE. | **gender** | **gender** | Gender as stated by the individual. An important search parameter. |
| | **Sex** <br><br> Cardinality: 0..1 <br><br> Definition: Observed phenotypic sex, where recorded. Uses NHS PERSON_PHENOTYPIC_SEX | | | Recorded separately from gender. Government guidance recommends recording phenotypic sex in social care systems, per the sex on birth certificate. [Some guidance](https://www.gov.uk/government/publications/children-looked-after-return-2024-to-2025-guide) also allows gender recognition certificates, which require the individual to be over 18 and officially diagnosed with gender dysphoria. FHIR does not include clinical sex as an attribute of Patient. See [issue #24](https://github.com/SocialCareData/person-standard/issues/24) for design notes. |
| | **Ethnicity** <br><br> Cardinality: 1..1 <br><br> Definition: The person's stated ethnicity, according to ONS 18+1 (the categories used in the 2021 census, can include "not provided"). | | | Statutorily required in adult social care; not necessarily in child social care. Uses existing NHS/ONS standard categories. |
| **phone** | | **phone** | **telecom(ContactPoint)** | Not currently included. The standard's primary purpose is identification rather than contact with the subject of care (contact details for related persons and professionals are held in separate objects). May be added in future, as the information can also act as an identifier to help matching. |
| **email** | | **email** | **telecom(ContactPoint)** | Same rationale as phone above. May be added in future. |
| | | **general-practitioner** | **generalPractitioner** | he PDS allows queries to include codes for the individual's GP practice. |
{: .table-bordered}

## Appendix I – the Hippo GET an Identifier OpenAPI spec

<details markdown="0" class="collapsible-appendix">
<summary> OpenAPI spec, version 0.9.0</summary>

{% highlight yaml %}
openapi: 3.0.1
info:
  title: Get an Identifier API
  description: |
    The Get an Identifier API is part of the Single Unique Identifier (SUI) programme for improving multi-agency information sharing in relation to safeguarding and welfare of children.

    The Get an Identifier API is a service that takes basic demographic information and determines and returns the individual's identifier.
  version: 0.9.0

paths:
  /v1/matchperson:
    post:
      summary: I know of this person, what is their Single Unique Identifier
      tags:
        - Match
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/matchRequest"
            example:
              personSpecification:
                given: Octavia
                family: Chislett
                birthDate: 2022-03-17
                gender: female
                addressPostalCode: KT19 0ST
              metadata:
                - recordType: health.details
                  systemId: SYS-XYZ
                  recordId: "987123"
        required: true
      responses:
        "200":
          description: The requested demographic information confidently matched an individual person
          headers:
            Operation-Id:
              $ref: "#/components/headers/Operation-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/personMatch"
        "400":
          description: Request was refused because it contained invalid data, or was missing required data
          headers:
            Operation-Id:
              $ref: "#/components/headers/Operation-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/problem"
        "401":
          description: Request was refused because it lacks valid authentication credentials
          headers:
            Operation-Id:
              $ref: "#/components/headers/Operation-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/problem"
        "404":
          description: The requested demographic information did not confidently match an individual person
          headers:
            Operation-Id:
              $ref: "#/components/headers/Operation-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/problem"
        "500":
          description: The server encountered an unexpected condition that prevented it from fulfilling the request
          headers:
            Operation-Id:
              $ref: "#/components/headers/Operation-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/problem"
      security:
        - oauth2_clientCredentials:
            - match-record.read

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
    problem:
      type: object
      properties:
        type:
          type: string
          description: >-
            A URI reference that identifies the problem type. This specification encourages that, when
            dereferenced, it provide human-readable documentation for the problem type, e.g. using HTML.
            When this member is not present, its value is assumed to be "about:blank"; see RFC 3986.
        title:
          type: string
          description: >-
            A short, human-readable summary of the problem type. It SHOULD NOT change from occurrence
            to occurrence of the problem, except for purposes of localization, e.g. using proactive
            content negotiation; see RFC 9110, Section 12.
        status:
          type: integer
          format: int32
          description: The HTTP status code generated by the origin server for this occurrence of the problem; see RFC 9110, Section 15.
        detail:
          type: string
          description: A human-readable explanation specific to this occurrence of the problem.
        instance:
          type: string
          description: A URI reference that identifies the specific occurrence of the problem. It may or may not yield further information if dereferenced.
      required:
        - status
        - title
        - detail

  headers:
    Operation-Id:
      description: Primary trace ID for the whole operation
      schema:
        type: string
      example: 082d58852e3244eed72f52f41e0f8045
    Invocation-Id:
      description: Secondary trace ID for the whole operation
      schema:
        type: string
      example: a49d73e8-dc36-4be5-92a6-9bf62868aa99

  securitySchemes:
    oauth2_clientCredentials:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: /api/v1/auth/token
          scopes:
            match-record.read: Obtain the Single Unique Identifier for a person.

{% endhighlight %}

</details>


## Feedback

We welcome feedback on this comparison including comments on specific fields and notes in the specifications comparison table.

Suggest alignment between the specifications or erratas by <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+HIPPO+Specification+Comparison&category=Website+Content&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">creating a new issue on GitHub</a>.
