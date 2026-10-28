---
layout: publication
title: Referrals and Requests Standard
description: "A common, extensible data standard for referrals, requests, and quality-of-care concerns, providing a reusable, customisable pattern for messages into, out of, and between social services."
breadcrumbs:
  - Publications
tags:
  - Joined Up Care
  - Publication
reference: PUB06
status: draft
data_model: src/_data/model/referrals/referrals-standard.yaml
non_technical_summary: |
  Referrals, requests, and quality-of-care concerns are often captured in questionnaire-style forms and exchanged inconsistently between organisations, with a heavy reliance on manual form-filling. In turn, this limits the reusability of information across systems and creates inefficiency for practitioners and partner organisations. Where integrations do exist, the underlying information is often specific to one pathway and cannot easily be reused across similar referral, request, notification or transition scenarios.

  We set out to build a data standard that can sit behind these forms to enable interoperability and, importantly, provide a common pattern that technical tools and applications can be built on top of to facilitate more efficient form-filling, freeing up time for social workers to focus on actual care.

  The three objects -- `Referral` (used for inward, person-centric referrals into social care), `Request` (used for outward requests for services, originating from social care), and `QualityOfCareConcern` (used for reporting a quality-of-care concern) -- each have a set of core fields, but in a similar fashion to our [Assessments and Plans standard](/PUB05_assessments_and_plans_standard), also facilitate customisation, with local authorities able to build their own locally-configured question and answer pairs. In this way our standard provides a technical backbone, a skeleton, for requests, referrals, and concerns to follow, rather than dictating exactly what information should and should not be captured in them.
---

<a href="/PUB06_referrals_standard_table" style="float: right;"><img src="/assets/icon/table-view.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Table View</a>

## Introduction

The Referrals and Requests Standard aims to standardise the structure of data collected in forms and questionnaires across social care, focusing specifically on referrals, requests, and quality-of-care concerns. The goal is to facilitate machine-readability, interoperability, and extensibility when information is shared between organisations, while respecting that each organisation and local authority will have different custom designs for their forms. In doing so, the standard provides a common foundational data pattern for technical tools and applications (including AI integrations) to be built on top of, enabling innovations that save social workers from manual form-filling and instead allow them to focus on what matters most.

### Purpose

This standard aims to define a common, machine-readable format for referrals, requests, and quality-of-care concerns. It also seeks to remain flexible in order to respect and adapt to diverse customisations and workflows across local authorities.

### Scope

This standard applies to a range of referral types, taxonomised below.

![Taxonomy of referral types that are in the scope of this standard](<../assets/img/referrals/referrals_taxonomy.svg>)

While each of these are colloquially named a "referral", we designate three distinct profiles within the taxonomy:
* `Referrals`, which are made by a subject, their family, a professional (like their teacher), or a member of the public *into* social services. These forms are generally "point-of-entry" into social care: the subject is likely not known to services beforehand.
* `Requests`, which are made by social services and sent *outward* to statutory or non-statutory services. These forms concern subjects that are already known to, and involved with, social services.
* `QualityOfCareConcerns`, which are made by anyone (including the subject, and can be anonymous) and are centred on a care service rather than a person themselves.

Importantly, this work standardises the back-end data architecture behind each of these profiles, not the front-end that social workers see and interact with.

### Audience

This document is for developers of Case Management Systems, single-view portals, care providers, integration engineers, and local authority data teams.

## Data Model Overview

<p class="data-model-diagram"><img src="/assets/img/referrals/referrals-data-model-2026-10-21.svg" alt="Referrals Data Model" title="Referrals Data Model" width="95%"/></p>

## Core Entities

### Referral

Inward, person-centric, point-of-entry referral into social services.

#### Properties

<span id="referral-identifier">identifier</span>
: Unique identifier for this referral record. Optional (`0..1`). *Identifier object*. See [Identifier](#identifier).

<span id="referral-type">type</span>
: The type of referral. Required (`1..1`). *Enum*. See the [Referral Types Taxonomy](#referral-types-taxonomy).

<span id="referral-subject">subject</span>
: Who is the person being referred? Multi-valued (`1..*`). Required. *Person object*. See [Person](#person).

<span id="referral-personalNetwork">personalNetwork</span>
: Who is in the person's family, household, or personal network? Multi-valued (`0..*`). Optional. *PersonalNetworkMember object*. See [PersonalNetworkMember](#personalnetworkmember).

<span id="referral-referrer">referrer</span>
: Who is the referrer? Required (`1..1`). *ReferrerDetails object*. See [ReferrerDetails](#referrerdetails).

<span id="referral-concern">concern</span>
: What is the concern? Multi-valued (`1..*`). Required. *ConcernDetail object*. See [ConcernDetail](#concerndetail).

<span id="referral-involvement">involvement</span>
: What have you or others done so far? Optional (`0..1`). *ReferralInvolvement object*. See [ReferralInvolvement](#referralinvolvement).

<span id="referral-pathway">pathway</span>
: What kind of support pathway do you think this referral should initiate? Multi-valued (`0..*`). Optional. *Enum*. See the Safeguarding Standard's [Service Code Taxonomy](/PUB02_safeguarding_standard#service-code-taxonomy).

<span id="referral-recipient">recipient</span>
: Who was this referral sent to? Multi-valued (`1..*`). Required. *Identifier object*. See [Identifier](#identifier).

<span id="referral-assessmentQuestion">assessmentQuestion</span>
: Atypical, locally configured questions and answers. Multi-valued (`0..*`). Optional. *ReferralAssessmentQuestion object*. See [ReferralAssessmentQuestion](#referralassessmentquestion).

<span id="referral-attachment">attachment</span>
: Reference to attached documents or evidence supporting the referral. Multi-valued (`0..*`). Optional. *DocumentReference object*. See [DocumentReference](#documentreference).

<span id="referral-linkedRecord">linkedRecord</span>
: Other, related referrals, requests, or records and their relationship. Multi-valued (`0..*`). Optional. *LinkedRecord object*. See [LinkedRecord](#linkedrecord).

<span id="referral-dateCompleted">dateCompleted</span>
: Date and time the referral was completed. Optional (`0..1`). *DateTime*.

#### Example

<div class="example">
  <h5 id="example-referral">Example - Referral</h5>
{% highlight json %}
{
  "@context": "https://ns.socialcaredata.io/referrals/context.jsonld",
  "@id": "https://example.org/referrals/REF-2026-001",
  "@type": "Referral",
  "identifier": {
    "@type": "Identifier",
    "value": "REF-2026-001",
    "system": "https://example.org/referrals"
  },
  "type": "child.safeguarding",
  "dateCompleted": "2026-10-14T09:00:00Z",
  "subject": [
    {
      "@type": "Person",
      "name": [
        {
          "@type": "Name",
          "givenName": ["Jane"],
          "familyName": "Doe"
        }
      ]
    }
  ],
  "referrer": {
    "@type": "ReferrerDetails",
    "referrerType": "Professional",
    "professional": {
      "@type": "Professional",
      "name": {
        "@type": "Name",
        "givenName": ["John"],
        "familyName": "Smith"
      }
    }
  },
  "concern": [
    {
      "@type": "ConcernDetail",
      "concernType": "child.neglect",
      "description": "Observed severe neglect concerns."
    }
  ],
  "recipient": [
    {
      "@type": "Identifier",
      "value": "ORG-CSC-01",
      "system": "https://example.org/organisations"
    }
  ]
}
{% endhighlight %}
</div>

### Request

Outward request for services for an existing subject of care.

#### Properties

<span id="request-identifier">identifier</span>
: Unique identifier for this request record. Optional (`0..1`). *Identifier object*. See [Identifier](#identifier).

<span id="request-subject">subject</span>
: Who is the person? (Person identifier). Required (`1..1`). *Identifier object*. See [Identifier](#identifier).

<span id="request-referrer">referrer</span>
: Who is the referrer? (Professional identifier). Required (`1..1`). *Identifier object*. See [Identifier](#identifier).

<span id="request-recipient">recipient</span>
: What service is requested? Multi-valued (`1..*`). Required. *Identifier object*. See [Identifier](#identifier).

<span id="request-purpose">purpose</span>
: What is the request? Required (`1..1`). *Enum*. See the [Request Purposes Taxonomy](#request-purposes-taxonomy).

<span id="request-assessmentQuestion">assessmentQuestion</span>
: Atypical, locally configured questions and answers. Multi-valued (`0..*`). Optional. *ReferralAssessmentQuestion object*. See [ReferralAssessmentQuestion](#referralassessmentquestion).

<span id="request-attachment">attachment</span>
: Reference to attached documents or evidence supporting the request. Multi-valued (`0..*`). Optional. *DocumentReference object*. See [DocumentReference](#documentreference).

<span id="request-linkedRecord">linkedRecord</span>
: Other, related referrals, requests, or records. Multi-valued (`0..*`). Optional. *LinkedRecord object*. See [LinkedRecord](#linkedrecord).

<span id="request-dateCompleted">dateCompleted</span>
: Date and time the request was completed. Optional (`0..1`). *DateTime*.

#### Example

<div class="example">
  <h5 id="example-request">Example - Request</h5>
{% highlight json %}
{
  "@context": "https://ns.socialcaredata.io/referrals/context.jsonld",
  "@id": "https://example.org/requests/REQ-2026-001",
  "@type": "Request",
  "identifier": {
    "@type": "Identifier",
    "value": "REQ-2026-001",
    "system": "https://example.org/requests"
  },
  "subject": {
    "@type": "Identifier",
    "value": "PER-2026-999",
    "system": "https://example.org/people"
  },
  "referrer": {
    "@type": "Professional",
    "name": {
      "@type": "Name",
      "givenName": ["Sarah"],
      "familyName": "Connor"
    }
  },
  "recipient": [
    {
      "@type": "Identifier",
      "value": "CAMHS-01",
      "system": "https://example.org/services"
    }
  ],
  "purpose": "child.statutoryServices",
  "dateCompleted": "2026-10-14T10:15:00Z"
}
{% endhighlight %}
</div>

### QualityOfCareConcern

Quality-of-care concern raised about a care provider or service.

#### Properties

<span id="qoc-identifier">identifier</span>
: Unique identifier for this quality of care concern. Optional (`0..1`). *Identifier object*. See [Identifier](#identifier).

<span id="qoc-subject">subject</span>
: Who is the person? Multi-valued (`0..*`). Optional (for anonymisation or systemic concerns). *Person object*. See [Person](#person).

<span id="qoc-referrer">referrer</span>
: Who is the referrer? Optional (`0..1`) (for anonymisation). *ReferrerDetails object*. See [ReferrerDetails](#referrerdetails).

<span id="qoc-recipient">recipient</span>
: What service is involved? Required (`1..1`). *Identifier object*. See [Identifier](#identifier).

<span id="qoc-concern">concern</span>
: What is the concern? Multi-valued (`1..*`). Required. *ConcernDetail object*. See [ConcernDetail](#concerndetail).

<span id="qoc-assessmentQuestion">assessmentQuestion</span>
: Atypical, locally configured questions and answers. Multi-valued (`0..*`). Optional. *ReferralAssessmentQuestion object*. See [ReferralAssessmentQuestion](#referralassessmentquestion).

<span id="qoc-attachment">attachment</span>
: Reference to attached documents or evidence supporting the concern. Multi-valued (`0..*`). Optional. *DocumentReference object*. See [DocumentReference](#documentreference).

<span id="qoc-linkedRecord">linkedRecord</span>
: Other, related referrals, requests, or records. Multi-valued (`0..*`). Optional. *LinkedRecord object*. See [LinkedRecord](#linkedrecord).

<span id="qoc-dateCompleted">dateCompleted</span>
: Date and time the concern was completed. Optional (`0..1`). *DateTime*.

#### Example

<div class="example">
  <h5 id="example-qoc">Example - QualityOfCareConcern</h5>
{% highlight json %}
{
  "@context": "https://ns.socialcaredata.io/referrals/context.jsonld",
  "@id": "https://example.org/concerns/QOC-2026-001",
  "@type": "QualityOfCareConcern",
  "identifier": {
    "@type": "Identifier",
    "value": "QOC-2026-001",
    "system": "https://example.org/concerns"
  },
  "recipient": {
    "@type": "Identifier",
    "value": "CARE-HOME-01",
    "system": "https://example.org/providers"
  },
  "concern": [
    {
      "@type": "ConcernDetail",
      "concernType": "adult.neglect",
      "description": "Provider failure to provide basic hydration."
    }
  ],
  "dateCompleted": "2026-10-14T11:00:00Z"
}
{% endhighlight %}
</div>

## Supporting Entities

### PersonalNetworkMember

Person in the subject's family, household, or broader personal support network (non-professionals only).

#### Properties

<span id="network-person">person</span>
: The person in the personal network. Required (`1..1`). *Person object*. See [Person Standard](/PUB01_person_standard#person).

<span id="network-relationship">relationship</span>
: Relationship code to the subject person. Required (`1..1`). *Enum*. See [Person Standard → Relationship Code](/PUB01_person_standard#person-relationship-code-vocabulary).

<span id="network-description">description</span>
: Text description of the personal network relationship. Optional (`0..1`). *String*.

### ReferrerDetails

Details of the referrer initiating the referral or concern.

#### Properties

<span id="referrer-person">person</span>
: Details of the referrer when a non-professional person or family member. Optional (`0..1`). *Person object*. See [Person Standard](/PUB01_person_standard#person).

<span id="referrer-professional">professional</span>
: Full professional details when available. Optional (`0..1`). *Professional object*. See [Professional](#professional).

<span id="referrer-professionalId">professionalId</span>
: Lightweight identifier for a professional referrer. Optional (`0..1`). *Identifier object*. See [Identifier](#identifier).

<span id="referrer-referrerType">referrerType</span>
: The role or nature of the referrer. Required (`1..1`). *Enum*. See the [Referrer Types Taxonomy](#referrer-types-taxonomy).

<span id="referrer-relationshipCode">relationshipCode</span>
: Relationship code of the referrer to the subject. Optional (`0..1`). *Enum*. See [Person Standard → Relationship Code](/PUB01_person_standard#person-relationship-code-vocabulary).

<span id="referrer-relationshipDescription">relationshipDescription</span>
: Relationship description of the referrer. Optional (`0..1`). *String*.

### ConcernDetail

Identified concern and optional descriptive details.

#### Properties

<span id="concern-concernType">concernType</span>
: The categorized nature of the concern. Required (`1..1`). *Enum*. See the [Concerns Taxonomy](#concerns-taxonomy).

<span id="concern-description">description</span>
: Free text description of the concern. Optional (`0..1`). *String*.

### ReferralInvolvement

Actions taken so far and parties involved.

#### Properties

<span id="involvement-actorType">actorType</span>
: Role or category of the actor involved (e.g. Self, Professional). Optional (`0..1`). *Enum*. See the [Referrer Types Taxonomy](#referrer-types-taxonomy).

<span id="involvement-actorId">actorId</span>
: Identifier(s) of the professional or actor involved. Multi-valued (`0..*`). Optional. *Identifier object*. See [Identifier](#identifier).

<span id="involvement-description">description</span>
: Free text description of actions taken or involvement to date. Optional (`0..1`). *String*.

### DocumentReference

Reference to an attached document or evidence supporting the referral or request.

<span id="document-documentId">documentId</span>
: Unique identifier for the document. Optional (`0..1`). *Identifier object*. See [Identifier](#identifier).

<span id="document-title">title</span>
: Title or display name of the document. Optional (`0..1`). *String*.

<span id="document-url">url</span>
: Web address or storage URI where the document can be retrieved. Optional (`0..1`). *URI*.

<span id="document-mimeType">mimeType</span>
: Media type / MIME type of the document. Optional (`0..1`). *String*.

<span id="document-description">description</span>
: Text description of the document. Optional (`0..1`). *String*.

### ReferralAssessmentQuestion

A generic Question-and-Answer model used to represent atypical, locally configured questions.

#### Properties

<span id="question-questionId">questionId</span>
: Identifier for the question. Optional (`0..1`). *String*.

<span id="question-category">category</span>
: The domain or question category. Required (`1..1`). *Enum*. See the [Question Categories Taxonomy](#question-categories-taxonomy).

<span id="question-questionText">questionText</span>
: The exact wording as displayed on the local form. Optional (`0..1`). *String*.

<span id="question-answer">answer</span>
: The recorded answer(s). Multi-valued (`0..*`). Optional. *String / value*.

<span id="question-answerType">answerType</span>
: Indicates how the answer should be parsed. Optional (`0..1`). *Enum*. See [Assessments and Plans → Answer Type](/PUB05_assessments_and_plans_standard#answer-type-taxonomy).

<span id="question-required">required</span>
: Whether this question is mandatory on the form. Optional (`0..1`). *Boolean*.

## Shared Objects

### Identifier

A unique identifier, identical to the definition in the [Person Standard](/PUB01_person_standard#identifier).

#### Properties

<span id="identifier-value">value</span>
: The unique identifier string. *String*.

<span id="identifier-system">system</span>
: Namespace URI for the issuing system. *URI*.

### Person

Full person demographic object. See [Person Standard](/PUB01_person_standard#person).

### Professional

Social care professional record. See [Safeguarding Standard](/PUB02_safeguarding_standard#professional).

### LinkedRecord

Reference to another related referral, request, concern, or cross-standard record. See [Safeguarding Standard → LinkedRecord](/PUB02_safeguarding_standard#linkedrecord).

## Taxonomies

The model is parameterised by the following controlled vocabularies.

### Referral Types Taxonomy

{% schema_table page.data_model ReferralTypeCode expanded %}

### Concerns Taxonomy

{% schema_table page.data_model ConcernCode expanded %}

### Request Purposes Taxonomy

{% schema_table page.data_model RequestPurposeCode expanded %}

### Question Categories Taxonomy

{% schema_table page.data_model ReferralQuestionCategory expanded %}

### Referrer Types Taxonomy

{% schema_table page.data_model ReferrerTypeCode expanded %}

## Validation

A SHACL shape ([referrals-standard-shape.ttl](https://github.com/SocialCareData/ontology/releases/latest)) is automatically generated from our LinkML model schema. It defines structure, cardinalities, and controlled vocabulary bindings.

JSON-LD payloads are validated with the [Social Care Data Validator](https://github.com/SocialCareData/validator).

**[Validate your data in your browser](/validator)**, or from a terminal:

```bash
npx @theodi/data-standard-validator -s https://raw.githubusercontent.com/SocialCareData/ontology/refs/heads/main/safeguarding/safeguarding-standard.ttl yourdata.jsonld
```

## Report an issue

{% include report-issue.html %}
