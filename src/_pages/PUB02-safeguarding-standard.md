---
layout: publication
current: /publications_safeguarding_standard
title: Safeguarding Standard
description: A common data model for recording the services, professionals, organisations, service episodes and life events involved in safeguarding and promoting the wellbeing of a person, to support multi-agency information sharing.
breadcrumbs:
  - Publications
tags:
  - MAIS
  - Publication
  - Safeguarding
reference: PUB02
status: draft
data_model: src/assets/model/safeguarding/safeguarding-standard.yaml
non_technical_summary: |
  The Person Standard enables us to describe core attributes of a person in care, like their name or age, but not any safeguarding information about them. To that end we've built the Safeguarding Standard, a set of connected points of data that, together, can build a picture of a person's context and care history.

  The Safeguarding Standard has five main categories of data:
  - `Organisation` objects, which describe data about overarching organisations that deliver services
  - `Service` objects, which describe specific care and care-related services
  - `Professional` objects, which describe individual care professionals like social workers, GPs, and anyone else that might be involved in the delivery of a service
  - `ServiceEpisode` objects, which describe single, time-bound occurrences of service delivery.
  - `LifeEvent` objects, which describe single, time-bound events in a person's life that, whether positive or negative, may have an effect on their day-to-day life and overall safeguarding circumstances, like an attendance at A&E or an exclusion from school.

  Linked together, these components help describe the professional activity that surrounds a person in social care.
---

<a href="/PUB02_safeguarding_standard_table" style="float: right;"><img src="/assets/icon/table-view.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Table View</a>

## Introduction

The Safeguarding Standard establishes a common data model for describing the professional activity that surrounds a person in children's and adults' social care: the **organisations** and **services** involved in their care, the **professionals** acting within those services, the **service episodes** during which support is delivered, and the **life events** that may signal changing risk, vulnerability or need.

It builds directly on the [Person Standard](/PUB01_person_standard), reusing its shared objects — `Identifier`, `Name`, `Address` and `Contact` — so that the people, professionals and organisations described here can be identified and matched consistently across systems.

### Purpose

This standard standardises the data collected about the services and professionals working with an individual, and about the episodes and events that make up their care trajectory. Its goal is to give safeguarding and wellbeing professionals a consistent, interoperable view of *who* is involved with a person, *what* support is being delivered, and *what* significant occurrences have taken place — as an enabler for multi-agency information sharing (MAIS).

### Scope

This standard applies to the digital collection, storage, and exchange of information describing:

- the **organisations** that support or intervene in a person's life;
- the **services** those organisations provide;
- the **professionals** acting in a formal role within those services and organisations;
- the **service episodes** — bounded periods during which a person receives a defined service, intervention, or package of support;
- the **life events** — significant, time-bound occurrences in a person's life that may have implications for their safety, wellbeing or development.

It does not redefine how a person is identified or described; that is the role of the [Person Standard](/PUB01_person_standard), which this standard references for all shared identity objects.

### Audience

This document is for all personnel involved in collecting, storing and processing safeguarding and wellbeing data, including social workers and administrative staff, data teams, and the developers of case management systems, single-view systems, and systems they interoperate with.


## Data Model

The following diagram illustrates the elements of the Safeguarding Standard.

<p class="data-model-diagram"><img src="/assets/img/safeguarding/safeguarding-data-model-2026-08-17.svg" alt="Safeguarding Data Model" title="Safeguarding Data Model" /></p>

The model is organised around five top-level entities and the shared objects that link them together:

- An **`Organisation`** has one or more `Identifier`s and a `name`, provides one or more `Service`s (`relatedService`), and may be associated with zero or more `Professional`s (`relatedProfessional`).
- A **`Service`** has one or more `Identifier`s and a `name`, is provided by zero or more `Organisation`s (`relatedOrganisation`), and involves zero or more `Professional`s (`relatedProfessional`).
- A **`Professional`** has one or more `Identifier`s, a `Name`, and one or more `role`s, and is related to zero or more `Service`s and zero or more `Organisation`s.
- A **`ServiceEpisode`** concerns one or more `SubjectPerson`s, involves zero or more `RelatedProfessional`s, relates to one or more `Service`s, carries one or more `TimeInformation` blocks, one or more `location`s, and zero or more `Finding`s.
- A **`LifeEvent`** concerns one or more `SubjectPerson`s, involves zero or more `RelatedProfessional`s, relates to zero or more `Service`s, and carries zero or more `TimeInformation` blocks and zero or more `location`s.

<p class="logical-model-diagram" style="text-align: center;"><img src="/assets/img/safeguarding/safeguarding-logical-model-2026-07-17.png" alt="Placements Logical Model" title="Placements Logical Model" style="width: 70%; height: auto;" /></p>

Coded fields draw their values from the controlled vocabularies listed under [Controlled vocabularies](#controlled-vocabularies). The `Identifier`, `Name`, `Address` and `Contact` objects are defined once in the [Person Standard](/PUB01_person_standard) and referenced throughout this specification — see [Shared objects](#shared-objects).


### Organisation

An organisation involved in the safeguarding or wellbeing of a person — for example a local authority, an NHS trust, a school, or an education authority. Aligns with the [FHIR `Organization`](https://build.fhir.org/organization.html) resource.

#### Properties

<span id="organisation-identifier">identifier</span>
: Unique identifiers associated with the organisation. Multi-valued (`1..*`). See [Person Standard → Identifier](/PUB01_person_standard#identifier).

<span id="organisation-name">name</span>
: The official name of the organisation. Required (`1..1`). _String_.

<span id="organisation-alias">alias</span>
: Other names the organisation is known by. Multi-valued. Optional (`0..*`). _String_.

<span id="organisation-type">type</span>
: Code for the kind of organisation. Multi-valued (`1..*`). See the [Organisation Code Vocabulary](#organisation-code-vocabulary).

<span id="organisation-status">active</span>
: Code for the organisation's status. Optional (`0..1`). _Boolean_.

<span id="organisation-address">address</span>
: Physical location(s) of the organisation. Multi-valued. Optional (`0..*`). See [Person Standard → Address](/PUB01_person_standard#address).

<span id="organisation-contact">contact</span>
: Contact information for the organisation. Multi-valued (`1..*`). See [Person Standard → Contact](/PUB01_person_standard#contact).

<span id="organisation-relatedProfessional">relatedProfessional</span>
: References to `Professional`s associated with the organisation. Multi-valued. Optional (`0..*`). See [Professional](#professional). Each reference is by [Person Standard → Identifier](/PUB01_person_standard#identifier).

<span id="organisation-relatedService">relatedService</span>
: References to `Service`s the organisation provides or contributes to the provision of. Multi-valued (`1..*`). See [Service](#service). Each reference is by [Person Standard → Identifier](/PUB01_person_standard#identifier).

#### Example

<div class="example">
  <h5 id="example-organisation">Example - Organisation</h5>
{% highlight json %}
{
  "@context": "https://socialcaredata.github.io/ontology/safeguarding/context.jsonld",
  "@id": "ex:org-anytown-la",
  "@type": "Organisation",
  "identifier": [ { "@type": "Identifier", "value": "12345678", "system": "https://identifiers.company-information.service.gov.uk/company-number" } ],
  "name": "Anytown Metropolitan Borough Council",
  "alias": ["Anytown Council"],
  "type": ["local-authority"],
  "active": true,
  "address": [ {
    "@type": "Address",
    "line1": "1 High Street",
    "city": "Anytown",
    "postcode": "AB1 2CD"
  } ],
  "contact": [ {
    "@type": "Contact",
    "email": ["contact@example.org"],
    "telephone": ["+44 7946 0000"]
  } ],
  "relatedProfessional": [ { "@type": "Identifier", "value": "PRF-001", "system": "https://example.org/Id/professional" } ]
  "relatedService": [ { "@type": "Identifier", "value": "SVC-001", "system": "https://example.org/Id/service" } ]
}
{% endhighlight %}
</div>


### Service

A service involved in the safeguarding or wellbeing of a person — the specific intervention or package of support delivered by one or more organisations, such as local authority social care, an emergency department, a general practice, or a school.

#### Properties

<span id="service-identifier">identifier</span>
: Unique identifiers associated with the service. Multi-valued (`1..*`). See [PersonStandard → Identifier](/PUB01_person_standard#identifier).

<span id="service-name">name</span>
: The official name of the service. Required (`1..1`). _String_.

<span id="service-alias">alias</span>
: Other names the service is known by. Multi-valued. Optional (`0..*`). _String_.

<span id="service-type">type</span>
: Code for the kind of service. Multi-valued (`1..*`). See the [Service Code Vocabulary](#service-code-vocabulary).

<span id="service-status">active</span>
: Code for the service's status. Optional (`0..1`). _Boolean_.

<span id="service-address">address</span>
: Physical location(s) of the service. Multi-valued. Optional (`0..*`). See [Person Standard → Address](/PUB01_person_standard#address).

<span id="service-contact">contact</span>
: Contact information for the service. Multi-valued (`1..*`). See [Person Standard → Contact](/PUB01_person_standard#contact).

<span id="service-costFrequency">costFrequency</span>
: The frequency at which the unit cost occurs. Required (`1..1`). See the [Service Cost Frequency Vocabulary](#service-cost-frequency-vocabulary).

<span id="service-delivery">delivery</span>
: The way the service is delivered. Multi-valued. Optional. (`0..*`). See the [Service Delivery Vocabulary](#service-delivery-vocabulary).

<span id="service-relatedProfessional">relatedProfessional</span>
: References to `Professional`s involved in the service. Multi-valued. Optional (`0..*`). See [Professional](#professional). Each reference is by [Person Standard → Identifier](/PUB01_person_standard#identifier).

<span id="service-relatedOrganisation">relatedOrganisation</span>
: References to `Organisation`s involved in the provision of the service. Multi-valued. Optional (`0..*`). See [Organisation](#organisation). Each reference is by [Person Standard → Identifier](/PUB01_person_standard#identifier).

#### Example

<div class="example">
  <h5 id="example-service">Example - Service</h5>
{% highlight json %}
{
  "@type": "Service",
  "identifier": [ { "@type": "Identifier", "value": "SVC-001", "system": "https://example.org/Id/service" } ],
  "name": "Children's Social Care - Referral & Assessment",
  "type": ["social-worker-support"],
  "active": true,
  "contact": [ {
    "@type": "Contact",
    "email": ["contact@example.org"],
    "telephone": ["+44 7946 0000"]
  } ],
  "costFrequency": "none",
  "relatedOrganisation": [ { "@type": "Identifier", "value": "12345678", "system": "https://example.org/Id/example-organisation" } ]
}
{% endhighlight %}
</div>


### Professional

An individual acting in a formal role within an organisation who has responsibilities relating to a person's safety, wellbeing, care or support — for example undertaking assessments, creating and monitoring plans, or sharing information in a multi-agency context.

#### Properties

<span id="professional-identifier">identifier</span>
: Unique identifiers associated with the professional. Multi-valued (`1..*`). See [Person Standard → Identifier](/PUB01_person_standard#identifier).

<span id="professional-name">name</span>
: The professional's name. Required (`1..1`). See [Person Standard → Name](/PUB01_person_standard#name).

<span id="professional-role">role</span>
: Text describing the professional's occupational role — for example their position in an organogram. Multi-valued (`1..*`). _String_.

<span id="professional-status">status</span>
: The professional's current working status. Optional (`0..1`). _Boolean_.

<span id="professional-contact">contact</span>
: The professional's contact information. Required (`1..1`). See [Person Standard → Contact](/PUB01_person_standard#contact).

<span id="professional-relatedService">relatedService</span>
: References to `Service`s the professional is related to. Multi-valued. Optional (`0..*`). See [Service](#service). Each reference is by [Person Standard → Identifier](/PUB01_person_standard#identifier).

<span id="professional-relatedOrganisation">relatedOrganisation</span>
: References to `Organisation`s the professional is related to. Multi-valued. Optional (`0..*`). See [Organisation](#organisation). Each reference is by [Person Standard → Identifier](/PUB01_person_standard#identifier).

#### Example

<div class="example">
  <h5 id="example-professional">Example - Professional</h5>
{% highlight json %}
{
  "@type": "Professional",
  "identifier": [ { "@type": "Identifier", "value": "SW1234567", "system": "https://example.org/Id/registration" } ],
  "name": {
    "@type": "Name",
    "familyName": ["Doe"],
    "givenName": ["Jane", "Elizabeth"],
    "preferredName": "Janie",
    "use": "official"
  },
  "role": ["Social Worker", "Team Lead - Referral & Assessment"],
  "status": true,
  "contact": {
    "@type": "Contact",
    "email": ["contact@example.org"],
    "telephone": ["+44 7946 0000"]
  },
  "relatedService": [ { "@type": "Identifier", "value": "SVC-001", "system": "https://example.org/Id/service" } ]
}
{% endhighlight %}
</div>


### ServiceEpisode

A service episode is a bounded period during which an individual receives a defined service, intervention, or package of support from a service or professional. It has a recognisable start and end point, though duration may vary from a single contact to sustained involvement over time.

A service episode represents structured engagement rather than a single interaction, and may include multiple contacts, assessments, reviews, or actions within its timeframe. Individuals may experience multiple concurrent or sequential service episodes across different services or organisations.

While a single service episode may reflect routine support, changes in the number, intensity, duration, or overlap of service episodes may indicate shifts in need, complexity, risk, or stability. Patterns of service episodes over time contribute to understanding an individual’s care trajectory and system involvement.

#### Properties

<span id="episode-identifier">identifier</span>
: Unique identifiers associated with the episode. Multi-valued (`1..*`). See [Person Standard → Identifier](/PUB01_person_standard#identifier).

<span id="episode-type">type</span>
: Code for the type of episode. Multi-valued (`1..*`). See the [Episode Code Vocabulary](#episode-code-vocabulary).

<span id="episode-subjectPerson">subjectPerson</span>
: References to the `Person`(s) the episode concerns, each qualified by the nature of their involvement. Multi-valued (`1..*`). See [SubjectPerson](#subjectperson).

<span id="episode-relatedProfessional">relatedProfessional</span>
: References to the `Professional`(s) involved in the episode, each qualified by the nature of their involvement. Multi-valued. Optional (`0..*`). See [RelatedProfessional](#relatedprofessional).

<span id="episode-relatedService">relatedService</span>
: References to the `Service`(s) involved in the episode. Multi-valued (`1..*`). See [Service](#service). Each reference is by [Person Standard → Identifier](/PUB01_person_standard#identifier).

<span id="episode-timeInformation">timeInformation</span>
: Details about the timing of the episode. Multi-valued (`1..*`). See [TimeInformation](#timeinformation).

<span id="episode-location">location</span>
: Details about the location of the episode. Multi-valued (`1..*`). _String_.

<span id="episode-finding">finding</span>
: Observations or measurements made during the course of the episode about the subject and their circumstances. Multi-valued. Optional (`0..*`). See [Finding](#finding).

<span id="episode-outcome">outcome</span>
: Outcome of the episode for the subject. Optional (`0..1`). See [Episode Outcome vocabulary](#episode-outcome-vocabulary).

<span id="episode-assessmentId">assessmentId</span>
: Unique identifiers for any care needs assessments completed during this episode. Multi-valued. Optional (`0..*`). See [Care Needs Assessment](/PUB05_assessments_and_plans_standard#careneedsassessment).

<span id="episode-planId">planId</span>
: Unique identifiers for any care plans created or active during this episode. Multi-valued. Optional (`0..*`). See [Care Plan](/PUB05_assessments_and_plans_standard#careplan).

#### Example

<div class="example">
  <h5 id="example-episode">Example - ServiceEpisode</h5>
{% highlight json %}
{
  "@type": "ServiceEpisode",
  "identifier": [ { "@type": "Identifier", "value": "EP-2026-0001", "system": "https://example.org/Id/episode" } ],
  "type": ["cin-plan"],
  "subjectPerson": [ {
    "@type": "SubjectPerson",
    "person": { "@type": "Identifier", "value": "9434765919", "system": "https://fhir.nhs.uk/Id/nhs-number" },
    "involvement": "SBJ"
  } ],
  "relatedProfessional": [ {
    "@type": "RelatedProfessional",
    "professional": { "@type": "Identifier", "value": "SW1234567", "system": "https://example.org/Id/registration" },
    "involvement": "PPRF"
  } ],
  "relatedService": [ { "@type": "Identifier", "value": "SVC-001", "system": "https://example.org/Id/service" } ],
  "timeInformation": [ {
    "@type": "TimeInformation",
    "startDateTime": "2026-05-01T09:30:00Z"
  } ],
  "location": ["Anytown Family Centre"],
  "finding": [ { "see Finding example" } ],
  "assessmentId": [ { "@type": "Identifier", "value": "ASS-2026-001", "system": "https://example.org/Id/assessment" } ],
  "planId": [ { "@type": "Identifier", "value": "PLAN-2026-001", "system": "https://example.org/Id/plan" } ]
}
{% endhighlight %}
</div>


### LifeEvent

A life event is a significant, time-bound occurence in an individual's life that may have implications for their safety, wellbeing or development. They are not inherently positive or negative, but can indicate to safeguarding and wellbeing professionals levels of risk, vulnerability, need or changes in support requirements. Examples of life events in this space could include attendance at A+E, a child being reported as missing or an exclusion from school.

Safeguarding professionals will be interested in the recency of events (when the event most recently happened), frequency (how frequently that incident is occurring), gravity (how serious the incident is when it occurs) and how the event combines with other events and factors in the individual's life to ascertain the support needs.

#### Properties

<span id="event-identifier">identifier</span>
: Unique identifiers associated with the life event. Multi-valued (`1..*`). See [Person Standard → Identifier](/PUB01_person_standard#identifier).

<span id="event-type">type</span>
: Code for the type of the life event (e.g. birth, death, missing episode). Multi-valued (`1..*`). See the [Event Code Vocabulary](#event-code-vocabulary).

<span id="event-subjectPerson">subjectPerson</span>
: References to the `Person`(s) the life event concerns. Multi-valued (`1..*`). See [SubjectPerson](#subjectperson).

<span id="event-relatedProfessional">relatedProfessional</span>
: References to the `Professional`(s) involved in the life event. Multi-valued. Optional (`0..*`). See [RelatedProfessional](#relatedprofessional).

<span id="event-relatedService">relatedService</span>
: References to the `Service`(s) involved in the life event. Multi-valued. Optional (`0..*`). See [Service](#service). Each reference is by [Person Standard → Identifier](/PUB01_person_standard#identifier).

<span id="event-timeInformation">timeInformation</span>
: Details about the timing of the life event. Multi-valued. Optional (`0..*`). See [TimeInformation](#timeinformation).

<span id="event-location">location</span>
: Details about the location of the life event. Multi-valued. Optional (`0..*`). _String_.

#### Example

<div class="example">
  <h5 id="example-event">Example - LifeEvent</h5>
{% highlight json %}
{
  "@type": "LifeEvent",
  "identifier": [ { "@type": "Identifier", "value": "LE-2026-0007", "system": "https://example.org/Id/life-event" } ],
  "type": ["missing-person"],
  "subjectPerson": [ {
    "@type": "SubjectPerson",
    "person": { "@type": "Identifier", "value": "9434765919", "system": "https://fhir.nhs.uk/Id/nhs-number" },
    "involvement": "SBJ"
  } ],
  "relatedProfessional": [ {
    "@type": "RelatedProfessional",
    "professional": { "@type": "Identifier", "value": "SW1234567", "system": "https://example.org/Id/registration" },
    "involvement": "PPRF"
  } ],
  "relatedService": [ { "@type": "Identifier", "value": "SVC-001", "system": "https://example.org/Id/service" } ],
  "timeInformation": [ {
    "@type": "TimeInformation",
    "startDateTime": "2026-05-01T09:30:00Z"
  } ],
  "location": ["Anytown town centre"]
}
{% endhighlight %}
</div>


### SubjectPerson

A typed reference to a `Person` involved in a service episode or life event.

#### Properties

<span id="subjectperson-person">person</span>
: A reference to a `Person` record involved in the episode or life event, by [Person Standard → Identifier](/PUB01_person_standard#identifier). Required (`1..1`).

<span id="subjectperson-involvement">involvement</span>
: Code for the nature of the person's involvement. Required (`1..1`). See the [Involvement Code Vocabulary](#involvement-code-vocabulary).

#### Example

<div class="example">
  <h5 id="example-subjectperson">Example - SubjectPerson</h5>
{% highlight json %}
{
  "@type": "SubjectPerson",
  "person": { "@type": "Identifier", "value": "9434765919", "system": "https://fhir.nhs.uk/Id/nhs-number" },
  "involvement": "SBJ"
}
{% endhighlight %}
</div>


### RelatedProfessional

A typed reference to a `Professional` involved in a service episode or life event.

#### Properties

<span id="relatedprofessional-professional">professional</span>
: A reference to a `Professional` record involved in the episode or life event, by [Person Standard → Identifier](/PUB01_person_standard#identifier). Required (`1..1`).

<span id="relatedprofessional-involvement">involvement</span>
: Code for the nature of the professional's involvement. Required (`1..1`). See the [Involvement Code Vocabulary](#involvement-code-vocabulary).

#### Example

<div class="example">
  <h5 id="example-relatedprofessional">Example - RelatedProfessional</h5>
{% highlight json %}
{
  "@type": "RelatedProfessional",
  "professional": { "@type": "Identifier", "value": "SW1234567", "system": "https://example.org/Id/registration" },
  "involvement": "PPRF"
}
{% endhighlight %}
</div>


### TimeInformation

Details about the timing of a service episode or life event, including when it started and ended and how frequently it recurs.

#### Properties

<span id="timeinformation-startDateTime">startDateTime</span>
: The start of the episode or life event, as an ISO 8601 date-time. Required (`1..1`). _DateTime_.

<span id="timeinformation-endDateTime">endDateTime</span>
: The end of the episode or life event, as an ISO 8601 date-time. Optional (`0..1`). _DateTime_.

<span id="timeinformation-frequency">frequency</span>
: The frequency of the episode or life event, including whether it is spontaneous. Optional (`0..1`). See the [Frequency Code Vocabulary](#frequency-code-vocabulary).

#### Example

<div class="example">
  <h5 id="example-timeinformation">Example - TimeInformation</h5>
{% highlight json %}
{
  "@type": "TimeInformation",
  "startDateTime": "2026-05-01T09:30:00Z",
  "endDateTime": "2026-05-01T11:00:00Z",
  "frequency": {
    "repeat": { "dayOfWeek": ["tue"], "frequency": 1, "period": 1, "periodUnit": "wk" }
  }
}
{% endhighlight %}
</div>


### Finding

An observation or measurement made during the course of a service episode about the subject and their circumstances. A finding may be recorded as a structured `Observation`, as a quantitative `Measurement`, and/or as free `text` where it cannot otherwise be structured.

#### Properties

<span id="finding-observation">observation</span>
: Qualitative observation(s) that represent an attribute of the subject or their circumstances. Multi-valued. Optional (`0..*`). See [Observation](#observation).

<span id="finding-measurement">measurement</span>
: Quantitative measurement(s) of something related to the subject or their circumstances. Multi-valued. Optional (`0..*`). See [Measurement](#measurement).

<span id="finding-text">text</span>
: A finding that cannot be represented as an `Observation` or `Measurement` and requires free-text input. Multi-valued. Optional (`0..*`). _String_.

#### Example

<div class="example">
  <h5 id="example-finding">Example - Finding</h5>
{% highlight json %}
{
  "@type": "Finding",
  "observation": [ {
    "@type": "Observation",
    "type": "NEET",
    "startDate": "2026-03-15T13:02:00",
    "endDate": "2026-06-30T10:20:00"
  } ],
  "measurement": [ {
    "@type": "Measurement",
    "value": 12,
    "unit": "count",
    "type": "Authorised Absences"
  } ],
  "text": ["Home environment observed to be stable and supportive."]
}
{% endhighlight %}
</div>


### Observation

A qualitative observation that represents an attribute of the subject or their circumstances (for example, "NEET" or "Free School Meals recipient").

#### Properties

<span id="observation-type">type</span>
: The type of observation. Required (`1..1`). See the [Observation Type Vocabulary](#observation-type-vocabulary).

<span id="observation-startDate">startDate</span>
: The date at which this observation was first true (e.g. the estimated date the subject became NEET), as an ISO 8601 date-time. Required (`1..1`). _DateTime_.

<span id="observation-endDate">endDate</span>
: The date at which this observation was made false (e.g. the estimated date the subject stopped being NEET). Present only if the observation is now outdated. Optional (`0..1`). _DateTime_.

#### Example

<div class="example">
  <h5 id="example-observation">Example - Observation</h5>
{% highlight json %}
{
  "@type": "Observation",
  "type": "NEET",
  "startDate": "2026-03-15T13:02:00",
  "endDate": "2026-06-30T10:20:00"
}
{% endhighlight %}
</div>


### Measurement

A quantitative measurement of something related to the subject or their circumstances (for example, "Authorised Absences" or "Referrals").

#### Properties

<span id="measurement-value">value</span>
: A decimal number representing the value of the measurement (e.g. `25`, `0.67`, `806.75`). Required (`1..1`). _Float_.

<span id="measurement-unit">unit</span>
: The unit of measurement. Required (`1..1`). See the [Measurement Unit Vocabulary](#measurement-unit-vocabulary).

<span id="measurement-type">type</span>
: The type of measurement. Required (`1..1`). See the [Measurement Type Vocabulary](#measurement-type-vocabulary).

#### Example

<div class="example">
  <h5 id="example-measurement">Example - Measurement</h5>
{% highlight json %}
{
  "@type": "Measurement",
  "value": 12,
  "unit": "count",
  "type": "Authorised Absences"
}
{% endhighlight %}
</div>


## Shared objects

The `Identifier`, `Name`, `Address` and `Contact` objects used throughout this standard are defined once in the [Person Standard](/PUB01_person_standard) and reused here unchanged, so that people, professionals and organisations are identified and described consistently across the whole data model. Refer to the Person Standard for the full property list, cardinalities and examples of each:

- **Identifier** — a value plus the system in whose namespace it is unique. Used to identify, and to reference, every entity in this standard. See [Person Standard → Identifier](/PUB01_person_standard#identifier).
- **Name** — a container for name parts (family name, given names, preferred name, use). See [Person Standard → Name](/PUB01_person_standard#name).
- **Address** — a postal address, with optional UPRN/USRN. See [Person Standard → Address](/PUB01_person_standard#address).
- **Contact** — a grouping of contact channels (email, telephone). See [Person Standard → Contact](/PUB01_person_standard#contact).

## Controlled vocabularies

Coded fields draw their values from the controlled vocabularies below. Each coded value is a `Code` object comprising a `code` and a human-readable `description`. The vocabularies themselves are maintained separately from this specification; the sections below name each vocabulary and link to its source where one exists.

### Organisation Code Vocabulary

Used by [`Organisation.type`](#organisation-type). Codes to indicate the type of organisation.

{% schema_table page.data_model OrganisationCode no-label %}

### Service Code Vocabulary

Used by [`Service.type`](#service-type). Codes to indicate the type of service.

{% schema_table page.data_model ServiceCode no-label %}

### Service Cost Frequency Vocabulary

Used by [`Service.costFrequency`](#service-costFrequency). Codes to indicate the payment schedule a service adheres to. From Adult Social Care Client Level Data specification.

{% schema_table page.data_model ServiceCostFrequency no-label %}

### Service Delivery Vocabulary

Used by [`Service.delivery`](#service-delivery). Codes to indicate the way a service is delivered. From Adult Social Care Client Level Data specification.

{% schema_table page.data_model ServiceDelivery no-label %}

### Episode Code Vocabulary

Used by [`ServiceEpisode.type`](#episode-type). Codes to indicate the type of service episode.

{% schema_table page.data_model EpisodeCode no-label %}

### Episode Outcome Vocabulary

Used by [`ServiceEpisode.outcome`](#episode-outcome). Codes to indicate the outcome of the episode for the subject. From Adult Social Care Client Level Data specification.

{% schema_table page.data_model EpisodeOutcome no-label %}

### Event Code Vocabulary

Used by [`LifeEvent.type`](#event-type). Codes to indicate the type of life event.

{% schema_table page.data_model EventCode no-label %}

### Involvement Code Vocabulary

Used by [`SubjectPerson.involvement`](#subjectperson-involvement) and [`RelatedProfessional.involvement`](#relatedprofessional-involvement) to record the nature of a person's or professional's involvement.

This standard does **not** define its own involvement codes. Instead, use a code from the HL7 v3 [`ParticipationType`](https://terminology.hl7.org/5.2.0/CodeSystem-v3-ParticipationType.html) code system directly, taking the `code` value from that system. The full list of codes and their definitions is maintained by HL7 at the link above; a few illustrative examples are shown below.

| Code | Display |
| :--- | :--- |
| `SBJ` | Subject |
| `PPRF` | Primary performer |
| `WIT` | Witness |
| `RESP` | Responsible party |
| `AUT` | Author (originator) |
| `INF` | Informant |
{:.table-bordered}

### Frequency Code Vocabulary

Used by [`TimeInformation.frequency`](#timeinformation-frequency) to record how frequently an episode or life event recurs.

This standard does **not** define its own frequency codes. Instead, express the frequency as a FHIR [`Timing`](https://build.fhir.org/datatypes.html#Timing) datatype. A `Timing` describes a recurring schedule through its nested `repeat` structure — combining fields such as `frequency` / `period` / `periodUnit` (how often, where `periodUnit` is one of `s`, `min`, `h`, `d`, `wk`, `mo`, `a`), `dayOfWeek` (`mon`…`sun`), `timeOfDay` (`hh:mm:ss`), and `when` (event-related timings such as `MORN` for the morning) — and/or a `code` giving a common shorthand (for example `BID` for twice a day or `TID` for three times a day). See the [FHIR Timing documentation](https://build.fhir.org/datatypes.html#Timing) for the full set of fields and value sets. Some illustrative examples are shown below.

<details>
<summary markdown="span">See examples</summary>

**Every Tuesday**

{% highlight json %}
{
  "repeat": { "dayOfWeek": ["tue"], "frequency": 1, "period": 1, "periodUnit": "wk" }
}
{% endhighlight %}

**Every morning**

{% highlight json %}
{
  "repeat": { "frequency": 1, "period": 1, "periodUnit": "d", "when": ["MORN"] }
}
{% endhighlight %}

**Every two weeks, Monday at 10am**

{% highlight json %}
{
  "repeat": { "dayOfWeek": ["mon"], "timeOfDay": ["10:00:00"], "frequency": 1, "period": 2, "periodUnit": "wk" }
}
{% endhighlight %}

**Three times a day**

{% highlight json %}
{
  "repeat": { "frequency": 3, "period": 1, "periodUnit": "d" },
  "code": {
    "coding": [ { "system": "http://terminology.hl7.org/CodeSystem/v3-GTSAbbreviation", "code": "TID", "display": "three times a day" } ]
  }
}
{% endhighlight %}

</details>

### Observation Type Vocabulary

Used by [`Observation.type`](#observation-type). Codes to indicate the type of qualitative observation.

{% schema_table page.data_model ObservationType no-label %}

### Measurement Type Vocabulary

Used by [`Measurement.type`](#measurement-type). Codes to indicate the type of measurement.

{% schema_table page.data_model MeasurementType no-label %}

### Measurement Unit Vocabulary

Used by [`Measurement.unit`](#measurement-unit). Codes to indicate the unit of measurement.

{% schema_table page.data_model MeasurementUnit no-label %}


## Ontology

The ontology for this specification is defined in Turtle format and is available at: [safeguarding-standard.ttl](/assets/model/safeguarding/safeguarding-standard.ttl). It reuses the shared objects (`Identifier`, `Name`, `Address`, `Contact`) from the [Person Standard](/PUB01_person_standard).

To validate a record against the constraints defined by this standard, a SHACL shape is provided: [safeguarding-standard-shape.ttl](/assets/model/safeguarding/safeguarding-standard-shape.ttl). It defines one shape per class, applying the cardinality and content rules for each.

## Report an issue

{% include report-issue.html %}
