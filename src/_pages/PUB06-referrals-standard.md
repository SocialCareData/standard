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
related:
  - /PUB01_person_standard
  - /PUB05_assessments_and_plans_standard
editors:
  - name: Neil Majithia
    organisation: Open Data Institute
  - name: Charlotte Moberly
    organisation: Social Finance
  - name: Huseyin Kir
    organisation: Open Data Institute
non_technical_summary: |
  Referrals, requests, and quality-of-care concerns are often captured in questionnaire-style forms and exchanged inconsistently between organisations, with a heavy reliance on manual form-filling. In turn, this limits the reusability of information across systems and creates inefficiency for practitioners and partner organisations. Where integrations do exist, the underlying information is often specific to one pathway and cannot easily be reused across similar referral, request, notification or transition scenarios.

  We set out to build a data standard that can sit behind these forms to enable interoperability and, importantly, provide a common pattern that technical tools and applications can be built on top of to facilitate more efficient form-filling, freeing up time for social workers to focus on actual care.

  The three main objects -- `Referral` (used for inward, person-centric referrals into social care), `Request` (used for outward requests for services, originating from social care), and `QualityOfCareConcern` (used for reporting a quality-of-care concern) -- each have a set of core fields, but in a similar fashion to our [Assessments and Plans standard](/PUB05_assessments_and_plans_standard), also facilitate customisation, with local authorities able to build their own locally-configured question and answer pairs. In this way our standard provides a technical backbone, a skeleton, for requests, referrals, and concerns to follow, rather than dictating exactly what information should and should not be captured in them.

  We also model `Response` objects to provide a basic, common pattern for recording answers given to referrals, requests, and quality-of-care concerns.

  **Terminology**: The three objects at the core of this standard (Referrals, Requests, and Quality-of-Care Concerns) are all colloquially named "referrals" in the world of social care. Our terminology is not intended to replace or prescribe the terminology used by social care practitioners and organisations, only to disambiguate different data patterns in our standard.
---

<a href="/PUB06_referrals_standard_table" style="float: right;"><img src="/assets/icon/table-view.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Table View</a>

## Introduction

The Referrals and Requests Standard aims to standardise the structure of data collected in forms and questionnaires across social care, focusing specifically on referrals, requests, and quality-of-care concerns. The goal is to facilitate machine-readability, interoperability, and extensibility when information is shared between organisations, while respecting that each organisation and local authority will have different custom designs for their forms. In doing so, the standard provides a common foundational data pattern for technical tools and applications (including AI integrations) to be built on top of, enabling innovations that save social workers from manual form-filling and instead allow them to focus on what matters most.

### Purpose

This standard aims to define a common, machine-readable format for referrals, requests, and quality-of-care concerns. It also seeks to remain flexible in order to respect and adapt to diverse customisations and workflows across local authorities.

### Scope

<p class="data-model-diagram"><img src="/assets/img/referrals/referrals_taxonomy.svg" alt="Taxonomy of referral types that are in the scope of this standard" title="Taxonomy of referral types"></p>

This standard applies to a range of forms commonly called "referrals". For the purposes of the standard, we designate three distinct "patterns" that these forms take. These terms describe how information is structured within the standard, and are not intended to replace or prescribe the terminology used by social care practitioners and organisations. The three patterns are:
* `Referrals` are made *into* social services by a person themselves, their family, a professional (like their teacher), or a member of the public. They generally represent a "point-of-entry" into social care, where the person may not previously have been known to services. They include:

  **Children's Social Care**
  * safeguarding concerns;
  * information requests;
  * professional concerns raised about a child from engagements with an adult; and
  * care leaver support.

  **Adults' Social Care**
  * contacts or requests for support;
  * safeguarding concerns;
  * requests for occupational therapy or home equipment;
  * requests for care needs assessments or care plan reviews;
  * information requests; and
  * professional concerns raised about an adult from engagements with a child.
* `Requests`are made by social services and sent *outward* to statutory or non-statutory services.  They concern people who are already known to and involved with social services and may, for example, follow a decision made at the front door by a Multi-Agency Safeguarding Hub (MASH) or equivalent triage process. They include:

  **Children's Social Care**
  * Notifications or signposting to external providers
  * outcomes from MASH triage;
  * requests to statutory services outside of social care, like Child and Adolescent Mental Health Services (CAMHS) or providers of advocacy services; and
  * requests to non-statutory services, like voluntary or community organisations.

  **Adults' Social Care**
  * notifications or signposting to external providers;
  * outcomes from front-door triage;
  * requests to statutory services outside of social care, like NHS services; and
  * requests to non-statutory services, like voluntary or community organisations.
* `QualityOfCareConcerns` relate to a care service rather than primarily to an individual receiving care. They can be raised by anyone, including the person receiving care, and may be made anonymously. This pattern is primarily intended for use in Adults’ Social Care.

Any of these objects can have a corresponding `Response`: a record that a response was sent or received, for example an acknowledgement or a decision to accept or decline.

#### Out of scope
Importantly, this work standardises the back-end data architecture behind each of these profiles, not the front-end that social workers see and interact with.

Our standard does not apply to the following "referral" patterns:

  **Children's Social Care**
  * quality-of-care concerns raised about children's services, including those that take the form of Local Authority Designated Officer (LADO) referral; and
  * cross-authority transfers of care.

  **Adult's Social Care**
  * requesting authorisation for Deprivation of Liberty Safeguards (DoLS) or Liberty Protection Safeguards (LPS); and
  * hospital discharge and Discharge to Assess (D2A).

Our standard also does not apply to emergencies where someone is in immediate danger, which should be reported to the emergency services by calling 999. See [Emergencies](#emergencies).

#### Terminology and ISO 13940

[ISO 13940:2026](https://www.iso.org/standard/91284.html) (known as ContSys, and accessible via [contsys.org](https://contsys.org/)) defines a system of concepts for continuity of care, and its second edition brings social care into its core model. It uses several of the same terms as our standard, but with different meanings:

| Term | In ISO 13940 | In this standard |
| --- | --- | --- |
| Referral | A request for care made by a *care professional*. A request from anyone else is an "initial request for care". | A `Referral` can be made by anyone, including the person themselves, their family or a member of the public. |
| Request | A "request for service": a care professional asks a care provider to deliver a service. | Close to a `Request`, except that a `Request` can also be a notification, which ISO 13940 would call a care communication. |
| Concern | A "health concern": an extract of the health record, containing everything linked to one health issue. | The reason for a referral (`ConcernDetail`), or a report about the quality of a care service (`QualityOfCareConcern`). |
| Response | ISO 13940 has no response concept. The nearest is a "care commitment", in which a care provider accepts responsibility for a person's care. | A `Response` records that a response was sent or received. Even an `accepted` response does not necessitate a care commitment. |

In ISO 13940 terms, a `Referral`, a `Request` and a `QualityOfCareConcern` are all requests for care. This standard does not claim conformance to ISO 13940.

### Audience

This document is for developers of Case Management Systems, single-view portals, care providers, integration engineers, and local authority data teams.

## Data Model Overview

<p class="data-model-diagram"><img src="/assets/img/referrals/referrals-data-model-2026-11-18.svg" alt="Referrals Data Model" title="Referrals Data Model"/></p>

## Core Entities

### Referral

Inward, person-centric, point-of-entry referral into social services.

#### Emergencies

A referral is not the way to report an emergency. If someone is in immediate danger, established safeguarding guidance suggests that referral forms should encourage referrers to call emergency services first. A referral can follow once the immediate danger has been dealt with. Our standard does not include a property for the urgency of a referral.

#### Properties

<span id="referral-identifier">identifier</span>
: Unique identifier for this referral record. Optional (`0..1`). *Identifier object*. See [Identifier](#identifier).

<span id="referral-type">type</span>
: The type of referral. Required (`1..1`). *Enum*. See the [Referral Types Taxonomy](#referral-types-taxonomy).

<span id="referral-subject">subject</span>
: Who is the person being referred? Multi-valued (`1..*`). Required. *IntakePerson object*. See [IntakePerson](#intakeperson).

<span id="referral-personalNetwork">personalNetwork</span>
: Who is in the person's family, household, or personal network? Multi-valued (`0..*`). Optional. *PersonalNetworkMember object*. See [PersonalNetworkMember](#personalnetworkmember).

<span id="referral-referrer">referrer</span>
: Who is the referrer? Required (`1..1`). *ReferrerDetails object*. See [ReferrerDetails](#referrerdetails).

<span id="referral-concern">concern</span>
: What is the concern? Multi-valued (`1..*`). Required. *ConcernDetail object*. See [ConcernDetail](#concerndetail). The initial referral may leave the type of concern unassigned for the triage team to assign: see [Assigning concerns at triage](#assigning-concerns-at-triage).

<span id="referral-involvement">involvement</span>
: What have you or others done so far? Optional (`0..1`). *ReferralInvolvement object*. See [ReferralInvolvement](#referralinvolvement).

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
      "@type": "IntakePerson",
      "isAwareOfReferral": true,
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

Outward request for services for a person already known to social care.

Social services make requests to other services at every stage of their work with a person. A social worker supporting a family might ask CAMHS for a mental health assessment, an adult's care team might ask the NHS to consider Continuing Healthcare, or a practitioner might put someone in touch with a community organisation. Some requests go to another team in the same local authority rather than an outside service.

Requests can often carry out a decision made at the "front door". When a referral arrives, a front-door team triages it (in children's services, often a Multi-Agency Safeguarding Hub, or MASH) and decides what should happen next, such as early help, an assessment of whether a child is in need, or an enquiry into whether a child is suffering significant harm. In adult social care, the front door may decide on preventative support such as reablement, a Care Act assessment, or a safeguarding enquiry. These decisions can also be made later on, for example when concerns escalate during ongoing work.

Where a request follows a referral, the two can be connected using `linkedRecord`.

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
: What is the request? What is being asked of the receiving service and, where it applies, the statutory basis and urgency it is made under. Required (`1..1`). *Enum*. See the [Request Purposes Taxonomy](#request-purposes-taxonomy).

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
    "@type": "Identifier",
    "value": "PROF-001",
    "system": "https://example.org/professionals"
  },
  "recipient": [
    {
      "@type": "Identifier",
      "value": "CAMHS-01",
      "system": "https://example.org/services"
    }
  ],
  "purpose": "child.statutoryServices",
  "dateCompleted": "2026-10-14T10:15:00Z",
  "linkedRecord": [
    {
      "@type": "LinkedRecord",
      "recordId": {
        "@type": "Identifier",
        "value": "REF-2026-001",
        "system": "https://example.org/referrals"
      },
      "recordType": "referral",
      "recordRelationship": "followupTo"
    }
  ]
}
{% endhighlight %}
</div>

### QualityOfCareConcern

Quality-of-care concern raised about a care provider or service.

The concern is sent to a `recipient` (like the local authority, or the Care Quality Commission (CQC)), regarding a care provider (the `service`). A concern that involves more than one provider, such as a care home and a home care agency that visits it, should be raised as separate concerns, one for each provider.

#### Properties

<span id="qoc-identifier">identifier</span>
: Unique identifier for this quality of care concern. Optional (`0..1`). *Identifier object*. See [Identifier](#identifier).

<span id="qoc-subject">subject</span>
: Who is the person? Multi-valued (`0..*`). Optional (for anonymisation or systemic concerns). *IntakePerson object*. See [IntakePerson](#intakeperson).

<span id="qoc-referrer">referrer</span>
: Who is the referrer? Optional (`0..1`) (for anonymisation). *ReferrerDetails object*. See [ReferrerDetails](#referrerdetails).

<span id="qoc-recipient">recipient</span>
: Who was this concern sent to? Generally, the local authority and the Care Quality Commission. Multi-valued (`1..*`). Required. *Identifier object*. See [Identifier](#identifier).

<span id="qoc-service">service</span>
: Which care provider or service is the concern about? Required (`1..1`). *QocService object*. See [QocService](#qocservice).

<span id="qoc-concern">concern</span>
: What is the concern? Multi-valued (`1..*`). Required. *QocConcernDetail object*. See [QocConcernDetail](#qocconcerndetail). The type of concern may be left unassigned for the triage team to assign: see [Assigning concerns at triage](#assigning-concerns-at-triage).

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
  "recipient": [
    {
      "@type": "Identifier",
      "value": "ORG-ASC-01",
      "system": "https://example.org/organisations"
    }
  ],
  "service": {
    "@type": "QocService",
    "identifier": {
      "@type": "Identifier",
      "value": "1-000000001",
      "system": "https://www.cqc.org.uk/location"
    },
    "name": "Example House Care Home"
  },
  "concern": [
    {
      "@type": "QocConcernDetail",
      "concernType": "UNASSIGNED",
      "description": "On three afternoon visits this week, residents in the ground-floor lounge had empty water jugs left out of reach. Staff said they were too short-handed to do regular drinks rounds."
    }
  ],
  "dateCompleted": "2026-10-14T11:00:00Z"
}
{% endhighlight %}
</div>

### Response

A record that a response to a referral, request or quality-of-care concern was sent or received.

People who make referrals, requests and concerns want to know that they have arrived, and to have a rough idea of what will happen next. A `Response` is the record in a case management system that a response was sent or received. It is not necessarily a message between the two parties, and it does not try to capture everything the responder said or how they reached their decision. The services that receive referrals, requests and concerns (eg. police, CAMHS, and advocacy organisations) are not obliged to send one: the standard only gives a common way to record a response in a care managements system when there has been one. A response received via email might be translated to a record in the CMS by administrative teams or social workers, but with this pattern being structured, machine-readable, and relational (in that it can link to other records and files), it also enables third party integrations like automated email parsers to do the translation work, allowing practitioners to focus their efforts elsewhere.

The same object is used in both directions. When a local authority acknowledges a referral from a teacher at a school, the local authority is the `responder`. When CAMHS replies to a request from the local authority, CAMHS is the `responder`.

Each `Response` records what happened at one point in time, and is not updated afterwards. A referral that is acknowledged, then has more information requested, then is accepted has three responses. Read together, they give the history of the referral, and nobody needs to change the original record.

The `status` is deliberately brief. It describes if a referral was declined, for example, but not why, or what the person should do instead. Where the responder gives more detail, record it in `description`, attach the letter or email itself with `attachment`, and use `linkedRecord` to point to what happened next, such as the new referral when a referral is redirected, or the service episode the responder opened. A reader of the response will often need these to understand it.

#### Properties

<span id="response-identifier">identifier</span>
: Unique identifier for this response record. Optional (`0..1`). *Identifier object*. See [Identifier](#identifier).

<span id="response-respondsTo">respondsTo</span>
: The referral, request or quality-of-care concern being responded to. Required (`1..1`). *Identifier object*. See [Identifier](#identifier).

<span id="response-respondsToType">respondsToType</span>
: The type of record being responded to (`referral`, `request` or `quality-of-care-concern`). Helps where the identifier alone is ambiguous. Optional (`0..1`). *Enum*. See the [Safeguarding Standard → Record Type Vocabulary](/PUB02_safeguarding_standard#record-type-vocabulary).

<span id="response-responder">responder</span>
: The organisation, service or professional that responded. Required (`1..1`). *Identifier object*. See [Identifier](#identifier).

<span id="response-dateTimeReceived">dateTimeReceived</span>
: When the response was received by the party it was sent to. For a response the record holder sent, where the time it was received is not known, use the time it was sent. Required (`1..1`). *DateTime*.

<span id="response-status">status</span>
: What was the response? Required (`1..1`). *Enum*. See the [Response Statuses Taxonomy](#response-statuses-taxonomy).

<span id="response-description">description</span>
: Free-text summary of what the responder said. Optional (`0..1`). *String*.

<span id="response-attachment">attachment</span>
: The response itself or other supporting documents, such as a letter or email. Multi-valued (`0..*`). Optional. *DocumentReference object*. See [DocumentReference](#documentreference).

<span id="response-linkedRecord">linkedRecord</span>
: Records that follow from the response, such as the new referral when a referral is redirected, or the responder's service episode. Multi-valued (`0..*`). Optional. *LinkedRecord object*. See [LinkedRecord](#linkedrecord).

#### Example

A response from CAMHS to the request above, recorded by the local authority that sent the request. CAMHS has redirected the request to another service and sent a letter explaining why.

<div class="example">
  <h5 id="example-response">Example - Response</h5>
{% highlight json %}
{
  "@context": "https://ns.socialcaredata.io/referrals/context.jsonld",
  "@id": "https://example.org/responses/RES-2026-002",
  "@type": "Response",
  "identifier": {
    "@type": "Identifier",
    "value": "RES-2026-002",
    "system": "https://example.org/responses"
  },
  "respondsTo": {
    "@type": "Identifier",
    "value": "REQ-2026-001",
    "system": "https://example.org/requests"
  },
  "respondsToType": "request",
  "responder": {
    "@type": "Identifier",
    "value": "CAMHS-01",
    "system": "https://example.org/services"
  },
  "dateTimeReceived": "2026-10-21T14:30:00Z",
  "status": "redirected",
  "description": "Does not meet the threshold for specialist CAMHS. Passed to the mental health support team in the young person's school.",
  "attachment": [
    {
      "@type": "DocumentReference",
      "title": "CAMHS triage outcome letter",
      "url": "https://example.org/documents/CAMHS-01-2026-0412.pdf",
      "mimeType": "application/pdf"
    }
  ],
  "linkedRecord": [
    {
      "@type": "LinkedRecord",
      "recordId": {
        "@type": "Identifier",
        "value": "MHST-REF-2026-0412",
        "system": "https://example.org/camhs/referrals"
      },
      "recordType": "referral"
    }
  ]
}
{% endhighlight %}
</div>

## Assigning concerns at triage

Every `Referral` records a concern about the subject. This standard lets the person making a referral leave the *type* of concern unassigned, so that the team receiving the referral can assign it as part of triage.

### Why do concern "types" matter?

Recording the type of concern (eg.neglect, physical abuse or financial abuse) as one of a fixed set of options rather than only as free text is a large part of what makes a referral useful once it arrives. It helps the receiving team route the referral to the right people, prioritise it, spot links with other referrals about the same person or place, and, via easier aggregation and analysis, report on the concerns being raised across an area.

### Why referrers should not have to choose a type

The concern types in this standard follow the categories in statutory guidance: the four categories of abuse and neglect for children under the Children Act 1989 (with the addition of extrafamilial harm), and the types of abuse and neglect for adults under the Care Act 2014. Deciding which of these categories a concern falls into is often *a professional judgement*; a neighbour, a member of the public, or even a professional from outside social care (a police officer, a teacher, a GP) may know that something is wrong without knowing whether it amounts to neglect or emotional abuse.

If referrers are made to choose, some will guess, and a wrong type can send a referral down the wrong route. Some may be put off completing the referral at all. But if the type is simply left optional, therefore reducing the burden on these referrers, many referrals will arrive without one, and the benefits of the standard are lost.

### How our standard works

1. **The referrer describes their concern in their own words.** Depending on how the referral form is designed, they may also be able to choose a type of concern (see [Designing the referral form](#designing-the-referral-form)). Where no type is chosen, whether because the referrer isn't sure or because the form doesn't ask, the concern is recorded as **Unassigned**.
2. **The referral arrives at the front door.** The receiving team, whether a front door service, a Multi-Agency Safeguarding Hub (MASH) or another triage function, sees that the concern is unassigned.
3. **Triage assigns the type.** As part of their usual triage decision, the practitioner reads the referrer's description and replaces Unassigned with the right type or types. They can also correct a type the referrer chose.
4. **From then on, the referral carries a concern type** that can be used for routing, linking and reporting, just as if the referrer had chosen it.

The referrer's description matters most when the concern is unassigned, because it is what the triage practitioner will rely on.

### Designing the referral form

Local authorities, and the providers of their referral portals, can choose whether to show referrers the list of concern types at all. Both of these approaches conform to the standard:

- **Ask for a description only.** The form does not show concern types. Every referral arrives with its concern unassigned, and triage assigns all types. This is the simplest option for referrers, and leaves classification to the people best placed to do it.
- **Offer concern types, with an "I'm not sure" option.** Referrers who are confident can choose a type, and everyone else chooses "I'm not sure". This can give triage a head start, but a type chosen by a referrer is still a starting point that triage should check.

A form can also mix the two, for example by showing concern types to professional referrers but not to members of the public.

### Unassigned and Other

The two options mean different things:

- **Unassigned** means the concern has *not yet been classified*. It is a temporary state that triage should resolve.
- **Other** means the concern *has been classified* and does not fit any of the listed categories. It is a final answer, and the description should explain what the concern is.

### Guidance for systems and forms

- If the form shows concern types, offer the "I'm not sure" option clearly alongside them. Do not choose a type on the referrer's behalf.
- Always ask for a description of the concern, and make it required whenever the concern will be sent unassigned.
- Record a concern as Unassigned on its own, not alongside other types. If a referrer is sure of one concern and unsure about others, record the type they are sure of and describe the rest.
- No referral should still have an Unassigned concern after triage. Case management systems should prompt triage practitioners to assign a type, and an Unassigned concern found after triage should be treated as a data quality issue.
- Where it matters locally, keep a record of the type the referrer originally gave, so that changes made at triage can be reviewed.

The data model cannot enforce these rules itself; it relies on the forms and systems that create and process referrals to follow them.

### Quality-of-care concerns

The same pattern applies to a `QualityOfCareConcern`. The person raising a concern about a care provider, whether a resident, a relative, a member of staff or a visiting professional, can describe what they have seen without having to classify it, and the concern can arrive unassigned. The team that triages it then assigns the type. Depending on local arrangements, that may be a quality assurance, commissioning or contract monitoring team, or the safeguarding team where someone is at risk of harm.

Everything in the guidance above applies in the same way. The types of quality-of-care concern are the fundamental standards that every provider registered with the Care Quality Commission (CQC) must meet, so assigning a type means deciding which standard the provider may not be meeting. One incident can involve several concern types: a missed home-care visit, for example, may be a concern about person-centred care, safe care and staffing all at once, in which case triage records a concern for each. See the [Quality-of-Care Concerns Taxonomy](#quality-of-care-concerns-taxonomy).

A concern about a provider that puts a particular person at risk of harm is also a safeguarding matter. As well as the quality-of-care concern, an adult safeguarding `Referral` should be raised (usually with the concern type `adult.organisationalAbuse`), and the two records linked using `linkedRecord`.

## Supporting Entities

### IntakePerson

A person as first recorded when their details enter social care: the subject of a referral, the subject of a quality-of-care concern, or a member of the subject's personal network. `IntakePerson` has every property of the [Person Standard's Person](/PUB01_person_standard#person), but all of them are optional. It adds a required `isAwareOfReferral` and a free-text `notes` property.

The person raising a referral often knows only part of the picture. A police officer called to a domestic disturbance may know the address of a child they saw but not the child's name. A neighbour may know a name and nothing else. Sometimes all that can be given is an account ("I saw a woman in distress at the bus station") that is still worth recording, because it may line up with other referrals.

An `IntakePerson` should carry at least one detail, whether a name, an address, an identifier or notes. The data model does not enforce this, so systems capturing referrals should check it when the form is completed.

Contact details, such as a phone number or email address, go in the Person Standard's `contact` and `address` properties. Any detail regarding getting in touch with the person (eg. when or how it is safe to contact them, or what to avoid) should be written in in `notes`.

#### Awareness of the referral

Referrals should generally be made with the knowledge of the person being referred and, for a child, their parents or carers, unless telling them could put the child or someone else at greater risk of harm. `isAwareOfReferral` records whether each person knows that the referral or concern is being made. It is required for the subject and for each member of their personal network, because the team receiving the referral needs to know who has been told before contacting anyone.

`isAwareOfReferral` concerns awareness of the *referral itself*, not of the problem it describes, so the person making the referral will always know the answer: either they told the person, or they did not. However, being aware is not the same as consenting; where a form asks about consent, record it as a locally configured question in the `SUBJECT.CONSENT_CAPACITY` category (see [ReferralAssessmentQuestion](#referralassessmentquestion)).

Where a person is not aware of the referral, say why in `notes`, for example because telling them could increase the risk to the child, or because they could not be reached.

Once the person is identified and recorded in a case management system, their details can be completed and checked against the [subject of care](/PUB01_person_standard#person) or [connected person](/PUB01_person_standard#connected-person-profile) profile of the Person Standard.

#### Properties

<span id="intakeperson-person">Person properties</span>
: `identifier`, `name`, `dateOfBirth`, `isDeceased`, `deceasedDate`, `address`, `contact`, `genderCode`, `sexCode`, `ethnicityCode`, `relatedPerson`, `primaryContactProfessional`, `matchedPersonRef`, `aboutMe` and `communication`, as defined in the [Person Standard](/PUB01_person_standard#person). All are optional.

<span id="intakeperson-isAwareOfReferral">isAwareOfReferral</span>
: Does this person know that the referral or concern is being made? Required (`1..1`). *Boolean*. See [Awareness of the referral](#awareness-of-the-referral).

<span id="intakeperson-notes">notes</span>
: Free-text notes about the person, such as an overall account of who they are and what was seen, where little else is known. Also where to record how to contact the person safely, and why they are not aware of the referral, if they are not. Optional (`0..1`). *String*.

#### Example

<div class="example">
  <h5 id="example-intakeperson">Example - IntakePerson known only by address</h5>
{% highlight json %}
{
  "@type": "IntakePerson",
  "isAwareOfReferral": false,
  "address": [
    {
      "@type": "Address",
      "line1": "14 Example Road",
      "city": "Exampletown",
      "postcode": "AB1 2CD"
    }
  ],
  "notes": "Child of about 5 or 6 seen at the property while officers attended a reported domestic disturbance. Name not known. The family were not told about the referral, as officers believed it could put the child at greater risk."
}
{% endhighlight %}
</div>

### PersonalNetworkMember

Person in the subject's family, household, or broader personal support network (non-professionals only).

#### Properties

<span id="network-person">person</span>
: The person in the personal network. Required (`1..1`). *IntakePerson object*. See [IntakePerson](#intakeperson).

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

<span id="referrer-relationship">relationship</span>
: Relationship code of the referrer to the subject. Optional (`0..1`). *Enum*. See [Person Standard → Relationship Code](/PUB01_person_standard#person-relationship-code-vocabulary).

<span id="referrer-relationshipDescription">relationshipDescription</span>
: Relationship description of the referrer. Optional (`0..1`). *String*.

### ConcernDetail

A concern raised in a referral: its type and the referrer's description of it.

#### Properties

<span id="concern-concernType">concernType</span>
: The type of concern, or `UNASSIGNED` if the referrer has not classified it. Required (`1..1`). *Enum*. See the [Concerns Taxonomy](#concerns-taxonomy) and [Assigning concerns at triage](#assigning-concerns-at-triage).

<span id="concern-description">description</span>
: Free-text description of the concern, in the referrer's own words. Optional (`0..1`), but should be given whenever `concernType` is `UNASSIGNED` or an Other code. *String*.

### QocService

The care provider or service a quality-of-care concern is about, as far as the person raising the concern can describe it.

The person raising a concern may not know the service's proper name, and the service may not be recorded in the local authority's system, leaving it without a known identifier. A complainant may only be able to describe "the agency that visits my dad in the mornings", rather than its name. Every property here is therefore optional. We recommend that this should carry at least one of fields, but the data model does not enforce this. Triage once the concern has been received can add (or correct) the identifier and name.

#### Properties

<span id="qocservice-identifier">identifier</span>
: Identifier for the service, if known, such as its Care Quality Commission location ID or its identifier in the local authority's system. Optional (`0..1`). *Identifier object*. See [Identifier](#identifier).

<span id="qocservice-name">name</span>
: The name of the service, if known. Optional (`0..1`). *String*.

<span id="qocservice-description">description</span>
: Free-text description of the service, in the words of the person raising the concern. Optional (`0..1`). *String*.

#### Example

<div class="example">
  <h5 id="example-qocservice">Example - QocService known only by description</h5>
{% highlight json %}
{
  "@type": "QocService",
  "description": "The home care agency that visits my dad in the mornings."
}
{% endhighlight %}
</div>

### QocConcernDetail

A concern raised about a care provider or service: its type and a description of it.

#### Properties

<span id="qocconcern-concernType">concernType</span>
: The type of concern, or `UNASSIGNED` if no type was given when the concern was raised. Required (`1..1`). *Enum*. See the [Quality-of-Care Concerns Taxonomy](#quality-of-care-concerns-taxonomy) and [Assigning concerns at triage](#assigning-concerns-at-triage).

<span id="qocconcern-description">description</span>
: Free-text description of the concern, in the words of the person raising it. Optional (`0..1`), but should be given whenever `concernType` is `UNASSIGNED` or `other`. *String*.

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
: The exact wording as displayed on the local form. Required (`1..1`). *String*.

<span id="question-answer">answer</span>
: The recorded answer(s). Multi-valued (`1..*`). Required. *String / value*.

<span id="question-answerType">answerType</span>
: Indicates how the answer should be parsed. Required (`1..1`). *Enum*. See [Assessments and Plans → Answer Type](/PUB05_assessments_and_plans_standard#answer-type-taxonomy).

<span id="question-required">required</span>
: Whether this question is mandatory on the form. Required (`1..1`). *Boolean*.

#### Locally configured pathways and services

Some referral forms ask what category of support or pathway the referrer thinks would help the subject. Our standard does not include a dedicated property for this question because pathways are usually configured locally: they differ between local authorities, some can only be considered after a professional assessment, and referrers often won't know which ones are relevant. The referrer's concern is much more useful than their suggestion for its resolution.

Where a form does ask for a recommended pathway, record the answer as a `ReferralAssessmentQuestion` in the `REQUESTED_SERVICE` category. If the answer comes from a list of options, the Safeguarding Standard's [Service Code Taxonomy](/PUB02_safeguarding_standard#service-code-taxonomy) can be used, with `answerType` set to `Enum`.

<div class="example">
  <h5 id="example-pathway-question">Example - suggested pathway as a local question</h5>
{% highlight json %}
{
  "@type": "ReferralAssessmentQuestion",
  "questionId": "suggestedPathway",
  "category": "REQUESTED_SERVICE",
  "questionText": "What kind of support do you think would help?",
  "answer": ["early-help"],
  "answerType": "Enum",
  "required": false
}
{% endhighlight %}
</div>

## Shared Objects

### Identifier

A unique identifier, identical to the definition in the [Person Standard](/PUB01_person_standard#identifier).

#### Properties

<span id="identifier-value">value</span>
: The unique identifier string. *String*.

<span id="identifier-system">system</span>
: Namespace URI for the issuing system. *URI*.

### Person

Full person demographic object, used for a non-professional referrer. See [Person Standard](/PUB01_person_standard#person). The people a referral is about use [IntakePerson](#intakeperson) instead.

### Professional

Social care professional record. See [Safeguarding Standard](/PUB02_safeguarding_standard#professional).

### LinkedRecord

Reference to another related referral, request, concern, or cross-standard record. See [Safeguarding Standard → LinkedRecord](/PUB02_safeguarding_standard#linkedrecord).

## Taxonomies

The model is parameterised by the following controlled vocabularies.

### Referral Types Taxonomy

{% schema_table page.data_model ReferralTypeCode expanded %}

### Concerns Taxonomy

The concern types for referrals. The child types are the four categories of abuse and neglect used for the significant harm threshold under the Children Act 1989, as set out in Working Together to Safeguard Children 2023, plus extra-familial harm. The adult types are those in the Care and Support Statutory Guidance under the Care Act 2014. `UNASSIGNED` is for concerns the referrer has not classified: see [Assigning concerns at triage](#assigning-concerns-at-triage).

{% schema_table page.data_model ConcernCode expanded %}

### Quality-of-Care Concerns Taxonomy

The types of concern about a care provider or service. Each type is one of the fundamental standards in Regulations 9 to 20 of the Health and Social Care Act 2008 (Regulated Activities) Regulations 2014, which every CQC-registered provider must meet. A concern of a given type is a concern that the provider is not meeting that regulation, so the titles are the regulations' own. One incident may relate to several regulations; record a concern for each. `UNASSIGNED` is for concerns not yet classified: see [Quality-of-care concerns](#quality-of-care-concerns). `other` is for concerns that fit none of the regulations, for example about a service that is not registered with CQC.

{% schema_table page.data_model QocConcernCode expanded %}

### Request Purposes Taxonomy

The purposes of an outward request, made at any stage of a person's involvement with social care. Some purposes are the decisions typically made at the front door, such as by a MASH under the Children Act 1989, or by an adult social care front door under the Care Act 2014. Where a purpose has a statutory basis or implies urgency, the code carries it. See [Request](#request).

This list is likely to change as safeguarding practice and workflows change, and it will be updated accordingly. Out-of-date terms will not be removed from this list, but will be demaracated as not-for-use.

{% schema_table page.data_model RequestPurposeCode expanded %}

### Response Statuses Taxonomy

What a response says. Each status is what the responder said at one point in time, and a later response may give a different one. See [Response](#response).

{% schema_table page.data_model ResponseStatusCode expanded %}

### Question Categories Taxonomy

{% schema_table page.data_model ReferralQuestionCategory expanded %}

### Referrer Types Taxonomy

{% schema_table page.data_model ReferrerTypeCode expanded %}

## Validation

A SHACL shape ([referrals-standard-shape.ttl](https://github.com/SocialCareData/ontology/releases/latest)) is automatically generated from our LinkML model schema. It defines structure, cardinalities, and controlled vocabulary bindings.

**[Validate your data in your browser](/validator)**, or from a terminal:

```bash
npx @theodi/data-standard-validator -s https://raw.githubusercontent.com/SocialCareData/ontology/main/referrals/referrals-standard-shape.ttl yourdata.jsonld
```

## Report an issue

{% include report-issue.html %}
