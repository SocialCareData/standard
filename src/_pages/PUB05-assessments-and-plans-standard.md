---
layout: publication
title: Care Needs Assessments and Care Plans Standard
description: A common data model for Care Needs Assessments and Care Plans, designed to standardise the back-end fields of information shared between agencies and services.
breadcrumbs:
  - Publications
tags:
  - Joined Up Care
  - Publication
reference: PUB05
status: draft
data_model: src/assets/model/assessments-and-plans/assessments-and-plans-standard.yaml
---

<a href="/PUB05_assessments_and_plans_standard_table" style="float: right;"><img src="/assets/icon/table-view.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Table View</a>

## Introduction

As part of the joined-up care workstream, we’re working on standardising care needs assessments and plans. Each are important components of an adult’s social care: an assessment is conducted when an adult contacts (or is referred to) a local authority’s social services team, and a social care plan is created immediately after if the person is assessed to be eligible.

This structure is based on the requirements of the [Care Act (2014)](https://www.legislation.gov.uk/ukpga/2014/23/contents), the primary legislation that governs adult social care in England. The Care Act enforces that all adults that may appear to have social care needs are assessed over 10 “outcomes”; if they are found to be unable to achieve some of these outcomes, the local authority has the duty to offer a personal budget and set out a care plan.

However, while this was national guidance, the actual structure of assessments and plans is not standardised. Local authorities across the country use different forms in different formats, some on CMS systems and others in simple word documents.

Of course, each has its own unique design for a reason. Social workers in one local authority may have different preferences to those in others, whether about the sort of information they collect or the way they record it. However, the limited standardisation makes interoperability and data sharing difficult. Instead of changing the front-end that social workers may like for its uniqueness, we therefore set out to standardise the back-end fields of information that might be shared between agencies and services.

We examined five assessments and two plans from different local authorities to ascertain what the most common fields were, how they were filled out, and what was important to standardise for sharing. After a session with the working group, we refined our draft, then ratified it at a technical level.

### Purpose

This standard aims to define a common, machine-readable format for assessments and plans, unblocking data exchange and coordination between local authorities, health services, and care providers.

### Scope

Standardising care needs assessments and care plans. It applies to adult social care needs assessments under the Care Act 2014, and subsequent care plans.

### Audience

This standard is for developers of Case Management Systems, single-view portals, care providers, integration engineers, and local authority data teams.


## Data Model Overview

The following diagram illustrates the elements of the Care Needs Assessments and Plans Standard.

<p class="data-model-diagram">
  <!-- [TODO: Generate and insert SVG diagram of assessments and plans standard, showing relationship between CareNeedsAssessment, CarePlan, and shared sub-entities] -->
  [SVG Diagram Placeholder]
</p>

Both Care Needs Assessments and Care Plans inherit from a shared `FoundationalInformation` mixin containing common metadata about the subject person, authoring professional, dates, and consent.


## Care Needs Assessments

From what we’ve seen across Care Act assessments, there’s a mix of statutory questions that are asked by all local authorities (e.g., *Does the person live alone?*) and custom questions that some local authorities ask and some don’t. Because we are not standardising the specific form designs of individual councils but rather standardising the format in which they are stored, we have adopted a flexible, generic **Question-and-Answer** model that respects local customisation.

This metadata-driven approach uses `questionId`: an official dictionary of codes we maintain and publish as a central standards authority to describe statutory questions.

*   **For Statutory fields:** The assessment must include specific questions mandated by the Care Act. For these, the local authority uses their preferred local `questionText`, but they **must** attach the corresponding national `questionId` from our dictionary. This allows central systems to instantly locate the needed data, regardless of how the local authority phrased the question.
*   **For Local, personalised fields:** If a local authority wants to ask a custom, non-statutory question (like a specific "Pen Picture" prompt), they simply leave the `questionId` blank or use their own local ID.

An assessment document is composed of a set of generic `AssessmentQuestion` items, along with foundational metadata about the person, professional, completion date, mental capacity, advocate requirements, and consent.

### CareNeedsAssessment

A Care Needs Assessment record. Captures foundational metadata, Care Act outcome questions and answers, and links to any resulting Care Plan.

#### Properties

<span id="assessment-identifier">identifier</span>
: The unique identifier for this care needs assessment. *Identifier object*. See [Identifier](#identifier).

<span id="assessment-personId">personId</span>
: Unique identifier for the subject person. *Identifier object*. See [Identifier](#identifier).

<span id="assessment-professionalId">professionalId</span>
: Unique identifier for the social care professional who authored the assessment. *Identifier object*. See [Identifier](#identifier).

<span id="assessment-dateCompleted">dateCompleted</span>
: Date and time that the assessment was completed. *DateTime*.

<span id="assessment-capacityToCompleteAssessment">capacityToCompleteAssessment</span>
: Does the person have the mental and physical capacity to complete this assessment? *Boolean*.

<span id="assessment-advocateRequired">advocateRequired</span>
: Does the person require an advocate to complete this assessment? *Boolean*.

<span id="assessment-consentToInformationSharing">consentToInformationSharing</span>
: Does the person consent to information sharing? *Boolean*.

<span id="assessment-review">review</span>
: A record of whether this assessment is a review of a previous assessment. *Review object*. See [Review](#review).

<span id="assessment-planId">planId</span>
: Direct link to any Care Plan resulting from this assessment. *Identifier object*. See [Identifier](#identifier).

<span id="assessment-status">status</span>
: Status of this assessment. *Enum*. See the [Document Status Vocabulary](#document-status-taxonomy).

<span id="assessment-assessmentQuestion">assessmentQuestion</span>
: The list of statutory and custom questions and answers comprising this assessment. *AssessmentQuestion object*. See [AssessmentQuestion](#assessmentquestion).

#### Example

<div class="example">
  <h5 id="example-assessment">Example - CareNeedsAssessment</h5>
{% highlight json %}
{
  "@context": "https://socialcaredata.github.io/assets/model/assessments-and-plans/context.jsonld",
  "@id": "ex:assessment-001",
  "@type": "CareNeedsAssessment",
  "identifier": {
    "@type": "Identifier",
    "value": "ASS-2026-001",
    "system": "https://example.org/Id/assessment"
  },
  "personId": {
    "@type": "Identifier",
    "value": "9434765919",
    "system": "https://fhir.nhs.uk/Id/nhs-number"
  },
  "professionalId": {
    "@type": "Identifier",
    "value": "SW-10293",
    "system": "https://example.org/Id/registration"
  },
  "dateCompleted": "2026-08-11T14:30:00Z",
  "capacityToCompleteAssessment": true,
  "advocateRequired": false,
  "consentToInformationSharing": true,
  "review": [
    {
      "@type": "Review",
      "isReview": false
    }
  ],
  "status": "active",
  "assessmentQuestion": [
    {
      "@type": "AssessmentQuestion",
      "questionId": "STAT-HOUSING-01",
      "category": "Housing",
      "questionText": "Does the person live alone?",
      "answer": ["Yes"],
      "answerType": "Boolean",
      "required": true
    },
    {
      "@type": "AssessmentQuestion",
      "questionId": "CA-NUTRITION-01",
      "category": "CA.nutrition",
      "questionText": "Care act: Managing and maintaining nutrition. Does the person currently achieve this outcome?",
      "answer": ["No - requires assistance preparing hot meals due to limited mobility."],
      "answerType": "String",
      "required": true
    }
  ]
}
{% endhighlight %}
</div>

### AssessmentQuestion

Generic question-answer pair. Handles mandatory Care Act statutory questions via a global `questionId` dictionary, while permitting local authority custom questions.

#### Properties

<span id="question-questionId">questionId</span>
: Unique national ID for statutory questions (e.g., `STAT-HOUSING-01`). Blank for custom questions. *String*.

<span id="question-category">category</span>
: The domain of the question. *Enum*. See [Question Category vocabulary](#question-category-taxonomy).

<span id="question-questionText">questionText</span>
: The exact wording as displayed on the local form. *String*.

<span id="question-answer">answer</span>
: The answer as measured in the assessment. *String / value*.

<span id="question-answerType">answerType</span>
: Indicates how the answer should be parsed. *Enum*. See [Answer Type vocabulary](#answer-type-taxonomy).

<span id="question-required">required</span>
: Whether this question is mandatory. (Always `true` for statutory). *Boolean*.

### Review

Review details linking current records back to historical documents.

#### Properties

<span id="review-isReview">isReview</span>
: Whether this is a review of a previous assessment/plan or not. *Boolean*.

<span id="review-previousId">previousId</span>
: Link to the previous assessment/plan being reviewed. *Identifier object*. See [Identifier](#identifier).

### Identifier

A unique identifier, identical to the definition in the [Person Standard](/PUB01_person_standard#identifier).

#### Properties

<span id="identifier-value">value</span>
: The unique identifier string. *String*.

<span id="identifier-system">system</span>
: Namespace URI for the issuing system. *URI*.


## Statutory Question ID Dictionary

To support the generic Question-and-Answer model, we maintain a central dictionary of statutory questions mandated by the Care Act 2014 or common assessment guidelines. Every statutory question has an expected `questionText` phrasing and a machine-readable `answerType`.

{% schema_table page.data_model StatutoryQuestionId expanded %}


## Care Plans

For individuals assessed as eligible, a Care Plan is created to structure the care package details. The primary goal of standardising Care Plans is to structure how procedural information about the care package is shared behind the scenes between agencies, services, and care providers.

The standard follows a rigid structure of **who** (actors), **what** (activities and desired Care Act outcomes), and **when** (timing and frequency):

*   **CareComponent:** Represents an itemised component of the care plan package.
*   **CareActor:** Captures who is delivering the service (Self, Family, Professional services, etc.) and their unique ID.
*   **CareTime:** Captures the scheduling, frequency, and start/end dates of the delivery.
*   **CareActivity:** Captures the text description of the care activity, the specific Care Act outcome it targets, and direct payment flags.

### CarePlan

A Care Plan record, constructed for adults found eligible for care. Follows a structured model of who, what, when, and why.

#### Properties

<span id="plan-identifier">identifier</span>
: The unique identifier for this care plan. *Identifier object*. See [Identifier](#identifier).

<span id="plan-personId">personId</span>
: Unique identifier for the subject person. *Identifier object*. See [Identifier](#identifier).

<span id="plan-professionalId">professionalId</span>
: Unique identifier for the professional who authored this plan. *Identifier object*. See [Identifier](#identifier).

<span id="plan-dateCompleted">dateCompleted</span>
: Date and time that this care plan was completed. *DateTime*.

<span id="plan-capacityToCompleteAssessment">capacityToCompleteAssessment</span>
: Does the person have the mental and physical capacity to complete this plan? *Boolean*.

<span id="plan-advocateRequired">advocateRequired</span>
: Does the person require an advocate to complete this plan? *Boolean*.

<span id="plan-consentToInformationSharing">consentToInformationSharing</span>
: Does the person consent to information sharing? *Boolean*.

<span id="plan-review">review</span>
: A record of whether this plan is a review of a previous plan. *Review object*. See [Review](#review).

<span id="plan-assessmentId">assessmentId</span>
: The assessment record that led to this plan. *Identifier object*. See [Identifier](#identifier).

<span id="plan-status">status</span>
: Status of this care plan. *Enum*. See [Document Status vocabulary](#document-status-taxonomy).

<span id="plan-careComponent">careComponent</span>
: The active care components (e.g., home care, meals) that make up the plan's support package. *CareComponent object*. See [CareComponent](#carecomponent).

#### Example

<div class="example">
  <h5 id="example-plan">Example - CarePlan</h5>
{% highlight json %}
{
  "@context": "https://socialcaredata.github.io/assets/model/assessments-and-plans/context.jsonld",
  "@id": "ex:plan-001",
  "@type": "CarePlan",
  "identifier": {
    "@type": "Identifier",
    "value": "PLAN-2026-001",
    "system": "https://example.org/Id/plan"
  },
  "personId": {
    "@type": "Identifier",
    "value": "9434765919",
    "system": "https://fhir.nhs.uk/Id/nhs-number"
  },
  "professionalId": {
    "@type": "Identifier",
    "value": "SW-10293",
    "system": "https://example.org/Id/registration"
  },
  "dateCompleted": "2026-08-11T14:45:00Z",
  "capacityToCompleteAssessment": true,
  "advocateRequired": false,
  "consentToInformationSharing": true,
  "review": [
    {
      "@type": "Review",
      "isReview": false
    }
  ],
  "assessmentId": {
    "@type": "Identifier",
    "value": "ASS-2026-001",
    "system": "https://example.org/Id/assessment"
  },
  "status": "active",
  "careComponent": [
    {
      "@type": "CareComponent",
      "actor": [
        {
          "@type": "CareActor",
          "actorType": "Professional services",
          "actorId": {
            "@type": "Identifier",
            "value": "SRV-MEALS-001",
            "system": "https://example.org/Id/service"
          }
        }
      ],
      "time": {
        "@type": "CareTime",
        "frequency": "Daily",
        "startDateTime": "2026-08-12T12:00:00Z"
      },
      "activity": {
        "@type": "CareActivity",
        "activityDescription": "Deliver hot meals daily at lunchtime.",
        "outcome": "CA-NUTRITION",
        "directPayment": false
      }
    }
  ]
}
{% endhighlight %}
</div>

### CareComponent

An itemised component of a care plan outlining care delivery.

#### Properties

<span id="component-actor">actor</span>
: The actor performing this component of the care plan. *CareActor object*. See [CareActor](#careactor).

<span id="component-time">time</span>
: The scheduling information for this care component. *CareTime object*. See [CareTime](#caretime).

<span id="component-activity">activity</span>
: The activity detail and outcomes for this care component. *CareActivity object*. See [CareActivity](#careactivity).

### CareActor

Details on who is delivering a specific CareComponent.

#### Properties

<span id="actor-actorType">actorType</span>
: Type of caregiver (e.g. Self, Family, Professional services). *Enum*. See [Care Actor Type vocabulary](#care-actor-type-taxonomy).

<span id="actor-actorId">actorId</span>
: Unique identifier for the actor (Person ID, Professional ID, or Service ID). *Identifier object*. See [Identifier](#identifier).

### CareTime

Scheduling information for a CareComponent.

#### Properties

<span id="time-frequency">frequency</span>
: Frequency of performance (e.g. weekly, daily). Aligned with FHIR Timing. *String*.

<span id="time-startDateTime">startDateTime</span>
: The scheduled start date/time. *DateTime*.

<span id="time-endDateTime">endDateTime</span>
: The scheduled end date/time (optional). *DateTime*.

### CareActivity

The nature of the service being performed.

#### Properties

<span id="activity-activityDescription">activityDescription</span>
: Text description of the care activity and any custom instructions. *String*.

<span id="activity-outcome">outcome</span>
: The Care Act outcome this component is helping to achieve. *Enum*. See [Care Act Outcome vocabulary](#care-act-outcome-taxonomy).

<span id="activity-directPayment">directPayment</span>
: Flag indicating whether this component is funded via direct payments. *Boolean*.


## Taxonomies

The model is parameterised by the following controlled vocabularies.

### Document Status Taxonomy

{% schema_table page.data_model DocumentStatus expanded %}

### Question Category Taxonomy

{% schema_table page.data_model QuestionCategory expanded %}

### Answer Type Taxonomy

{% schema_table page.data_model AnswerType expanded %}

### Care Actor Type Taxonomy

{% schema_table page.data_model CareActorType expanded %}

### Care Act Outcome Taxonomy

{% schema_table page.data_model CareActOutcome expanded %}

### Statutory Question ID Taxonomy

{% schema_table page.data_model StatutoryQuestionId expanded %}

### Client Funding Status Taxonomy

{% schema_table page.data_model ClientFundingStatus expanded %}

### Care Act Eligibility Status Taxonomy

{% schema_table page.data_model CareActEligibilityStatus expanded %}


## Validation

A [SHACL shape](/assets/model/assessments-and-plans/assessments-and-plans-standard-shape.ttl) is automatically generated from our LinkML model schema. It defines structure, cardinalities, and controlled vocabulary bindings.

JSON-LD payloads are validated using our standard [validation suite](/assets/shacl/validation/README.md).

## Report an issue

{% include report-issue.html %}

## Changelog

{% include changelog.html %}
