---
title: "Standards comparison: ways to find a record"
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

The aim of multi-agency information sharing (MAIS) is to provide more complete information about a person in care or a person being referred to services, for social workers to make faster, more well-evidenced decisions. Currently, MAIS processes involve safeguarding leads making enquiries to different services (healthcare, police, and social services) via telephone or email. At a local level, this can be manageable though inefficient, but when enquiries reach regional or national scale (in more geographically mobile cases, which are common in social care), manual enquiries slow down searches for records and risk blind spots where part of a person’s history are missed out, potentially with dire consequences.

This document compares Hippo Digital's current FIND a Record API specification against closely related interoperability standards used in social care and healthcare: our Social Care data model (Person and Service), [FHIR DocumentReference](https://build.fhir.org/documentreference.html), and IHE XCA / XDS.b [DocumentEntry](https://profiles.ihe.net/ITI/TF/Volume3/ch-4.2.html) metadata.

It focuses on how FIND supports multi-agency information sharing (MAIS), what its request and response structures look like in practice, and where its fields align with (or diverge from) existing standards. The purpose is to support joint conversations on how the FIND record-discovery model can align with social care data standards.

***Table-1***
{: style="text-align: center;"}

| Specification | Version / Source |
| :--- | :--- |
| Social Care data model | [Social Care Interoperability Standards Publications](/publications) |
| FIND a Record API | OpenAPI spec, version `0.9.0` (extract in Appendix I) |
| FHIR DocumentReference | [DocumentReference resource](https://build.fhir.org/documentreference.html) |
| IHE XCA / XDS.b DocumentEntry | [IHE ITI TF Volume 3, ch-4.2](https://profiles.ihe.net/ITI/TF/Volume3/ch-4.2.html) |
{:.table-bordered}

## Related work: Standard ways to describe a Person

This document builds on earlier work that compares the Person data model with Hippo Digital's GET service: [Standard ways to describe a Person](/standards_comparison_ways_to_describe_a_person).

## How GET, FIND and FETCH work together

A successful GET request returns the NHS number of a person. By itself, this does not provide the full safeguarding picture, but it is foundational for broader information sharing. The [previous document in this series](/standards_comparison_ways_to_describe_a_person) lays out the current plan for APIs to be built in order support automated MAIS processes, as part of the overall DfE MAIS programme.

Within the MAIS model, GET, FIND and FETCH are intended to operate as a sequence:

***Table-2***
{: style="text-align: center;"}

| Service | Description |
| :--- | :--- |
| **GET** | Would enable users to find the NHS number of a person they are enquiring about. |
| **FIND (requires GET)** | Would enable users to find out which other agencies and services know about the person they are enquiring about. |
| **FETCH (requires FIND and GET)** | Would enable users to find out what information other agencies and services have about the person they are enquiring about. |
{:.table-bordered}

In this flow:

1. **GET** uses a person's details to obtain an NHS number via the NHS Personal Demographics Service.
1. **FIND** uses that NHS number to identify which organisations hold records about the person.
1. **FETCH** retrieves the actual safeguarding information from those identified data owners.

The [Independent Review of Children's Social Care](https://www.gov.uk/government/publications/independent-review-of-childrens-social-care-final-report) (2022) highlighted that fragmented systems and manual enquiry processes can slow safeguarding decisions. The GET-FIND-FETCH sequence aims to reduce that friction, especially where cases cross local boundaries.

## In focus: FIND API

Structurally, FIND has two endpoints and an asynchronous lifecycle:

1. `POST /v2/searches`: submit a `startSearchRequest` whose only field is `suid` (currently the NHS number returned by GET). The service returns `202 Accepted` with a `searchWorkItem` containing a `workItemId` and HAL (Hypertext Application Language) link(s) for polling.
1. `GET /v2/searches/{workItemId}/results`: poll for results. The response (`searchResultsV2`) includes `status`, `completenessPercentage`, and an `items[]` array of `searchResultItem`.

Each `searchResultItem` represents one record held by one data owner.

{% highlight yaml %}
searchResultItem:
  recordType:    # enum: childrens-services.details | crime-justice.details | education.details | health.details | personal.details
  recordUrl:     # string - URL where the record can be retrieved
  systemId:      # string - identifier of the holding system
  custodianName: # string - human-readable Data Owner name
  recordId:      # string - unique ID of the record within the holding system
{% endhighlight %}

Conceptually, each item is a pointer to a record rather than the record content itself.

## Request fields

{: style="text-align: center;"}

| FIND OpenAPI spec | Notes |
| :--- | :--- |
| **suid** <br><br> (NHS number) | The single unique identifier attached to the person being searched for, in other words their NHS number according to a previous GET request. |
{:.table-bordered}

## Response fields

The FIND response is a set of search results (`searchResultItem` entries), compared below with the Social Care model, FHIR, and IHE XDS.b.

{: style="text-align: center;"}

| FIND searchResultItem | Social Care Data Standard | FHIR DocumentReference | IHE XDS.b DocumentEntry | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **recordType** <br><br> Cardinality: 1..1 <br><br> Definition: one of `childrens-services`, `crime-justice`, `education`, `health`, `personal` | **n/a** <br><br>Somewhat analogous to [services](https://socialcaredata.github.io/spec/service-episode/?tab=service) in SC data model:<br>- youth-offending<br>- primary-school<br>- high-school<br>- SEN-primary-school<br>- SEN-high-school<br>- alternative-provision-school<br>- social-care<br>- family-court<br>- CAMHS<br><br>This is not a complete list of services. | **`type`** (CodeableConcept) and **`category`** (CodeableConcept, 0..*) <br><br> [LOINC Document Ontology](https://loinc.org/document-ontology/current-version/) | **`typeCode`** (CodedValue) and **`classCode`** (high-level CodedValue) <br><br> [LOINC Document Ontology](https://loinc.org/document-ontology/current-version/) | FIND uses a coarse five-value enum spanning sectors. A controlled vocabulary for social care record types would be helpful; currently this behaves more like a broad record category. |
| **recordURL** <br><br> Cardinality: 1..1 <br><br> Definition: URL where the record may be retrieved. | **n/a** | **`content.attachment.url`** | **URI** |  |
| **systemID** <br><br> Cardinality: 1..1 <br><br> Definition: Identifier of the holding system. | Partial overlap with **`Identifier.system`** when treating the record reference as an identifier. | **`custodian.identifier`** | **`repositoryUniqueId`** and **`homeCommunityId`** (OIDs) | A URI schema/convention would be helpful. <br><br> Such as [Identifier Registry](https://build.fhir.org/identifier-registry.html) (example id: `https://terminology.hl7.org/en/NamingSystem-ArkansasDLN.html`).  |
| **custodianName** <br><br> Cardinality: 1..1 <br><br> Definition: Name of the organisation that holds the record. | **n/a** | **`custodian` -> `Organization.name`** | **`authorInstitution`** | Display-only field. |
| **recordID** <br><br> Cardinality: 0..1 <br><br> Definition: Unique ID of the record within the holding system. | Partial overlap with **`Identifier.value`**. | **`identifier`** | **`uniqueId`** | FIND treats this as optional, making `recordURL` the only guaranteed reference. |
{:.table-bordered}

## Appendix I - the Hippo FIND OpenAPI spec

<details markdown="0" class="collapsible-appendix">
<summary>OpenAPI spec, version 0.9.0</summary>

{% highlight yaml %}
openapi: 3.0.1
info:
  title: Find a Record API
  description: |
    The Find a Record API is part of the Single Unique Identifier (SUI) programme for improving multi-agency information sharing in relation to safeguarding and welfare of children.

    The Find a Record API is a service that finds which Data Owners have a record relating to a child, without sharing any case data.
  version: 0.9.0

paths:
  /v2/searches:
    post:
      summary: Submit a new search request
      description: Starts a search to find which Data Owners have a record relating to the specified child's identifier (NHS Number).
      tags:
        - Find
      requestBody:
        description: The search request payload.
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/startSearchRequest"
        required: true
      responses:
        "202":
          description: Request was accepted for processing, a search has been initiated.
          headers:
            Trace-Id:
              $ref: "#/components/headers/Trace-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/searchWorkItem"
        "400":
          description: Request was refused because it contained invalid data, or was missing required data.
          headers:
            Trace-Id:
              $ref: "#/components/headers/Trace-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/problem"
        "401":
          description: Request was refused because it lacks valid authentication credentials.
          headers:
            Trace-Id:
              $ref: "#/components/headers/Trace-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/problem"
        "500":
          description: The server encountered an unexpected condition that prevented it from fulfilling the request.
          headers:
            Trace-Id:
              $ref: "#/components/headers/Trace-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/problem"
      security:
        - oauth2_clientCredentials: ["find-record.write"]
        - x-vendor-api-key: []

  /v2/searches/{workItemId}/results:
    get:
      summary: Get search results
      description: Returns the status for a Find a Record search work item, and the results if available.
      tags:
        - Find
      parameters:
        - name: workItemId
          in: path
          description: Identifier of the search work item.
          required: true
          schema:
            type: string
      responses:
        "200":
          description: The status of a Find a Record search work item, and the results if available.
          headers:
            Trace-Id:
              $ref: "#/components/headers/Trace-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/searchResultsV2"
        "404":
          description: The requested search work item was not found.
          headers:
            Trace-Id:
              $ref: "#/components/headers/Trace-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/problem"
        "401":
          description: Request was refused because it lacks valid authentication credentials.
          headers:
            Trace-Id:
              $ref: "#/components/headers/Trace-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/problem"
        "500":
          description: The server encountered an unexpected condition that prevented it from fulfilling the request.
          headers:
            Trace-Id:
              $ref: "#/components/headers/Trace-Id"
            Invocation-Id:
              $ref: "#/components/headers/Invocation-Id"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/problem"
      security:
        - oauth2_clientCredentials: ["find-record.read"]
        - x-vendor-api-key: []

components:
  schemas:
    startSearchRequest:
      type: object
      properties:
        suid:
          type: string
    searchWorkItem:
      type: object
      properties:
        workItemId:
          type: string
        suid:
          type: string
        createdAt:
          type: string
          format: date-time
        links:
          type: object
          additionalProperties:
            $ref: "#/components/schemas/halLink"
    halLink:
      type: object
      properties:
        href:
          type: string
        method:
          type: string
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
    searchResultsV2:
      type: object
      properties:
        workItemId:
          type: string
        completenessPercentage:
          type: integer
          format: int32
        suid:
          type: string
        status:
          enum:
            - None
            - Queued
            - Running
            - Completed
            - Failed
            - Cancelled
            - Expired
          type: string
        items:
          type: array
          items:
            $ref: "#/components/schemas/searchResultItem"
    searchResultItem:
      type: object
      properties:
        recordType:
          $ref: "#/components/schemas/recordType"
        recordUrl:
          type: string
        systemId:
          type: string
        custodianName:
          type: string
        recordId:
          type: string
      required:
        - recordType
        - recordUrl
        - systemId
        - custodianName
    recordType:
      type: string
      description: The type of the record of data about a person
      enum:
        - childrens-services.details
        - crime-justice.details
        - education.details
        - health.details
        - personal.details

  headers:
    Trace-Id:
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
      description: OAuth2 Client Credentials for authentication of Custodian (Data Owner)
      flows:
        clientCredentials:
          scopes:
            find-record.read: Read search status and results.
            find-record.write: Create (start) searches.
    x-vendor-api-key:
      type: apiKey
      description: API Key for authentication of Software Vendor (Supplier)
      name: x-vendor-api-key
      in: header
{% endhighlight %}

</details>

## Feedback

We welcome feedback on this comparison including comments on specific fields and notes in the specifications comparison table.

Suggest alignment between the specifications or erratas by <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding:+Standard+ways+to+find+a+Person+record&category=Website+Content&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">creating a new issue on GitHub</a>.

</article>
