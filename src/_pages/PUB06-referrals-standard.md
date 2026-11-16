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
version_number: "0.9.0"
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
: Who is the person? Multi-valued (`0..*`). Optional (for anonymisation or systemic concerns). *IntakePerson object*. See [IntakePerson](#intakeperson).

<span id="qoc-referrer">referrer</span>
: Who is the referrer? Optional (`0..1`) (for anonymisation). *ReferrerDetails object*. See [ReferrerDetails](#referrerdetails).

<span id="qoc-recipient">recipient</span>
: What service is involved? Required (`1..1`). *Identifier object*. See [Identifier](#identifier).

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
  "recipient": {
    "@type": "Identifier",
    "value": "CARE-HOME-01",
    "system": "https://example.org/providers"
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

A person as first recorded when their details enter social care: the subject of a referral, the subject of a quality-of-care concern, or a member of the subject's personal network. `IntakePerson` has every property of the [Person Standard's Person](/PUB01_person_standard#person), but all of them are optional, and it adds a free-text `notes` property.

The person raising a referral often knows only part of the picture. A police officer called to a domestic disturbance may know the address of a child they saw but not the child's name. A neighbour may know a name and nothing else. Sometimes all that can be given is an account ("I saw a woman in distress at the bus station") that is still worth recording, because it may line up with other referrals.

An `IntakePerson` should carry at least one detail, whether a name, an address, an identifier or notes. The data model does not enforce this, so systems capturing referrals should check it when the form is completed.

Once the person is identified and recorded in a case management system, their details can be completed and checked against the [subject of care](/PUB01_person_standard#person) or [connected person](/PUB01_person_standard#connected-person-profile) profile of the Person Standard.

#### Properties

<span id="intakeperson-person">Person properties</span>
: `identifier`, `name`, `dateOfBirth`, `isDeceased`, `deceasedDate`, `address`, `contact`, `genderCode`, `sexCode`, `ethnicityCode`, `relatedPerson`, `primaryContactProfessional`, `matchedPersonRef`, `aboutMe` and `communication`, as defined in the [Person Standard](/PUB01_person_standard#person). All are optional.

<span id="intakeperson-notes">notes</span>
: Free-text notes about the person, such as an overall account of who they are and what was seen, where little else is known. Optional (`0..1`). *String*.

#### Example

<div class="example">
  <h5 id="example-intakeperson">Example - IntakePerson known only by address</h5>
{% highlight json %}
{
  "@type": "IntakePerson",
  "address": [
    {
      "@type": "Address",
      "line1": "14 Example Road",
      "city": "Exampletown",
      "postcode": "AB1 2CD"
    }
  ],
  "notes": "Child of about 5 or 6 seen at the property while officers attended a reported domestic disturbance. Name not known."
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

<span id="referrer-relationshipCode">relationshipCode</span>
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

{% schema_table page.data_model RequestPurposeCode expanded %}

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
