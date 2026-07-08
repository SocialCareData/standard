---
layout: publication
current: /publications_safeguarding_standard
title: Safeguarding Standard
description: A common data model for recording the services, professionals, organisations, service episodes and life events involved in safeguarding and promoting the wellbeing of a person, to support multi-agency information sharing.
breadcrumbs:
  - title: Publications
    url: /publications
tags:
  - Safeguarding
  - Publication
  - MAIS
---

## Introduction

The Safeguarding Standard establishes a common data model for describing the professional activity that surrounds a person in children's and adults' social care: the **organisations** and **services** involved in their care, the **professionals** acting within those services, the **service episodes** during which support is delivered, and the **life events** that may signal changing risk, vulnerability or need.

It builds directly on the [Person Standard](/publications_person_standard), reusing its shared objects — `Identifier`, `Name`, `Address` and `Contact` — so that the people, professionals and organisations described here can be identified and matched consistently across systems.

### Purpose

This standard standardises the data collected about the services and professionals working with an individual, and about the episodes and events that make up their care trajectory. Its goal is to give safeguarding and wellbeing professionals a consistent, interoperable view of *who* is involved with a person, *what* support is being delivered, and *what* significant occurrences have taken place — as an enabler for multi-agency information sharing (MAIS).

### Scope

This standard applies to the digital collection, storage, and exchange of information describing:

- the **organisations** that support or intervene in a person's life;
- the **services** those organisations provide;
- the **professionals** acting in a formal role within those services and organisations;
- the **service episodes** — bounded periods during which a person receives a defined service, intervention, or package of support;
- the **life events** — significant, time-bound occurrences in a person's life that may have implications for their safety, wellbeing or development.

It does not redefine how a person is identified or described; that is the role of the [Person Standard](/publications_person_standard), which this standard references for all shared identity objects.

### Audience

This document is for all personnel involved in collecting, storing and processing safeguarding and wellbeing data, including social workers and administrative staff, data teams, and the developers of case management systems, single-view systems, and systems they interoperate with.


## Data Model

The following diagram illustrates the elements of the Safeguarding Standard.

<p class="data-model-diagram"><img src="/assets/img/safeguarding/safeguarding-data-model-2026-07-17.svg" alt="Safeguarding Data Model" title="Safeguarding Data Model" /></p>

The model is organised around five top-level entities and the shared objects that link them together:

- An **`Organisation`** has one or more `Identifier`s and a `name`, provides one or more `Service`s (`relatedService`), and may be associated with zero or more `Professional`s (`relatedProfessional`).
- A **`Service`** has one or more `Identifier`s and a `name`, is provided by zero or more `Organisation`s (`relatedOrganisation`), and involves zero or more `Professional`s (`relatedProfessional`).
- A **`Professional`** has one or more `Identifier`s, a `Name`, and one or more `role`s, and is related to zero or more `Service`s and zero or more `Organisation`s.
- A **`ServiceEpisode`** concerns one or more `SubjectPerson`s, involves zero or more `RelatedProfessional`s, relates to one or more `Service`s, carries one or more `TimeInformation` blocks, one or more `location`s, and zero or more `Finding`s.
- A **`LifeEvent`** concerns one or more `SubjectPerson`s, involves zero or more `RelatedProfessional`s, relates to zero or more `Service`s, and carries zero or more `TimeInformation` blocks and zero or more `location`s.

<p class="logical-model-diagram" style="text-align: center;"><img src="/assets/img/safeguarding/safeguarding-logical-model-2026-07-17.png" alt="Placements Logical Model" title="Placements Logical Model" style="width: 70%; height: auto;" /></p>

Coded fields draw their values from the controlled vocabularies listed under [Controlled vocabularies](#controlled-vocabularies). The `Identifier`, `Name`, `Address` and `Contact` objects are defined once in the [Person Standard](/publications_person_standard) and referenced throughout this specification — see [Shared objects](#shared-objects).


### Organisation

An organisation involved in the safeguarding or wellbeing of a person — for example a local authority social care department, an NHS trust, a school, or an education authority. Aligns with the [FHIR `Organization`](https://build.fhir.org/organization.html) resource.

#### Properties

<span id="organisation-identifier">identifier</span>
: Unique identifiers associated with the organisation. Multi-valued (`1..*`). See [Person Standard → Identifier](/publications_person_standard#identifier).

<span id="organisation-name">name</span>
: The official name of the organisation. (`1..1`). _String_.

<span id="organisation-alias">alias</span>
: Other names the organisation is known by. Multi-valued. Optional (`0..*`). _String_.

<span id="organisation-type">type</span>
: Code for the kind of organisation. Multi-valued (`1..*`). See the [Organisation Code Vocabulary](#organisation-code-vocabulary).

<span id="organisation-status">status</span>
: Code for the organisation's status. Optional (`0..1`). See the [Organisation Status Code Vocabulary](#organisation-status-code-vocabulary).

<span id="organisation-address">address</span>
: Physical location(s) of the organisation. Multi-valued. Optional (`0..*`). See [Person Standard → Address](/publications_person_standard#address).

<span id="organisation-contact">contact</span>
: Contact information for the organisation. Multi-valued (`1..*`). See [Person Standard → Contact](/publications_person_standard#contact).

<span id="organisation-relatedProfessional">relatedProfessional</span>
: References to `Professional`s associated with the organisation. Multi-valued. Optional (`0..*`). See [Professional](#professional). Each reference is by [Person Standard → Identifier](/publications_person_standard#identifier).

<span id="organisation-relatedService">relatedService</span>
: References to `Service`s the organisation provides or contributes to the provision of. Multi-valued (`1..*`). See [Service](#service). Each reference is by [Person Standard → Identifier](/publications_person_standard#identifier).

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
  "status": "active",
  "address": [ { "see Person Standard Address" } ],
  "contact": [ { "see Person Standard Contact" } ],
  "relatedProfessional": [ { "ref": { "@type": "Identifier", "value": "PRF-001", "system": "https://example.org/Id/professional" } } ]
  "relatedService": [ { "ref": { "@type": "Identifier", "value": "SVC-001", "system": "https://example.org/Id/service" } } ]
}
{% endhighlight %}
</div>


### Service

A service involved in the safeguarding or wellbeing of a person — the specific intervention or package of support delivered by one or more organisations, such as local authority social care, an emergency department, a general practice, or a school. Corresponds to the [Service Data Standard](https://github.com/SocialCareData/service-episode-standard).

#### Properties

<span id="service-identifier">identifier</span>
: Unique identifiers associated with the service. Multi-valued (`1..*`). See [PersonStandard → Identifier](/publications_person_standard#identifier).

<span id="service-name">name</span>
: The official name of the service. (`1..1`). _String_.

<span id="service-alias">alias</span>
: Other names the service is known by. Multi-valued. Optional (`0..*`). _String_.

<span id="service-type">type</span>
: Code for the kind of service. Multi-valued (`1..*`). See the [Service Code Vocabulary](#service-code-vocabulary).

<span id="service-status">status</span>
: Code for the service's status. Optional (`0..1`). See the [Active Code Vocabulary](#active-code-vocabulary).

<span id="service-address">address</span>
: Physical location(s) of the service. Multi-valued. Optional (`0..*`). See [Person Standard → Address](/publications_person_standard#address).

<span id="service-contact">contact</span>
: Contact information for the service. Multi-valued (`1..*`). See [Person Standard → Contact](/publications_person_standard#contact).

<span id="service-relatedProfessional">relatedProfessional</span>
: References to `Professional`s involved in the service. Multi-valued. Optional (`0..*`). See [Professional](#professional). Each reference is by [Person Standard → Identifier](/publications_person_standard#identifier).

<span id="service-relatedOrganisation">relatedOrganisation</span>
: References to `Organisation`s involved in the provision of the service. Multi-valued. Optional (`0..*`). See [Organisation](#organisation). Each reference is by [Person Standard → Identifier](/publications_person_standard#identifier).

#### Example

<div class="example">
  <h5 id="example-service">Example - Service</h5>
{% highlight json %}
{
  "@type": "Service",
  "identifier": [ { "@type": "Identifier", "value": "SVC-001", "system": "https://example.org/Id/service" } ],
  "name": "Children's Social Care - Referral & Assessment",
  "type": ["childrens-social-care"],
  "status": "active",
  "contact": [ { "see Person Standard Contact" } ],
  "relatedOrganisation": [ { "ref": { "@type": "Identifier", "value": "12345678", "system": "https://identifiers.company-information.service.gov.uk/company-number" } } ]
}
{% endhighlight %}
</div>


### Professional

An individual acting in a formal role within an organisation who has responsibilities relating to a person's safety, wellbeing, care or support — for example undertaking assessments, creating and monitoring plans, or sharing information in a multi-agency context. A professional's involvement may be ongoing or relate to a specific service episode, and multiple professionals from different agencies may work with one person at once. Corresponds to the [Professional Data Standard](https://github.com/SocialCareData/professional-standard).

#### Properties

<span id="professional-identifier">identifier</span>
: Unique identifiers associated with the professional (e.g. an NHS number or a Social Work England registration number). Multi-valued (`1..*`). See [Person Standard → Identifier](/publications_person_standard#identifier).

<span id="professional-name">name</span>
: The professional's name. (`1..1`). See [Person Standard → Name](/publications_person_standard#name).

<span id="professional-role">role</span>
: Text describing the professional's occupational role — for example their position in an organogram. Multi-valued (`1..*`). _String_.

<span id="professional-status">status</span>
: The professional's current working status. Optional (`0..1`). _Boolean_.

<span id="professional-contact">contact</span>
: The professional's contact information. (`1..1`). See [Person Standard → Contact](/publications_person_standard#contact).

<span id="professional-relatedService">relatedService</span>
: References to `Service`s the professional is related to. Multi-valued. Optional (`0..*`). See [Service](#service). Each reference is by [Person Standard → Identifier](/publications_person_standard#identifier).

<span id="professional-relatedOrganisation">relatedOrganisation</span>
: References to `Organisation`s the professional is related to. Multi-valued. Optional (`0..*`). See [Organisation](#organisation). Each reference is by [Person Standard → Identifier](/publications_person_standard#identifier).

#### Example

<div class="example">
  <h5 id="example-professional">Example - Professional</h5>
{% highlight json %}
{
  "@type": "Professional",
  "identifier": [ { "@type": "Identifier", "value": "SW1234567", "system": "https://www.socialworkengland.org.uk/Id/registration" } ],
  "name": { "see Person Standard Name" },
  "role": ["Social Worker", "Team Lead - Referral & Assessment"],
  "status": true,
  "contact": { "see Person Standard Contact" },
  "relatedService": [ { "ref": { "@type": "Identifier", "value": "SVC-001", "system": "https://example.org/Id/service" } } ]
}
{% endhighlight %}
</div>


### ServiceEpisode

A bounded period during which an individual receives a defined service, intervention, or package of support from a service or professional. A service episode represents a structured engagement rather than a single interaction, and may encompass multiple contacts, assessments and reviews. A person may have simultaneous or sequential episodes across different providers; changes in their number, intensity, duration or overlap may signal shifts in a person's circumstances, and patterns over time reveal their care trajectory and system involvement. Corresponds to the [Service Episode Data Standard](https://github.com/SocialCareData/service-episode-standard).

#### Properties

<span id="episode-identifier">identifier</span>
: Unique identifiers associated with the episode. Multi-valued (`1..*`). See [Person Standard → Identifier](/publications_person_standard#identifier).

<span id="episode-type">type</span>
: Code for the type of episode. Multi-valued (`1..*`). See the [Episode Code Vocabulary](#episode-code-vocabulary).

<span id="episode-subjectPerson">subjectPerson</span>
: References to the `Person`(s) the episode concerns, each qualified by the nature of their involvement. Multi-valued (`1..*`). See [SubjectPerson](#subjectperson).

<span id="episode-relatedProfessional">relatedProfessional</span>
: References to the `Professional`(s) involved in the episode, each qualified by the nature of their involvement. Multi-valued. Optional (`0..*`). See [RelatedProfessional](#relatedprofessional).

<span id="episode-relatedService">relatedService</span>
: References to the `Service`(s) involved in the episode. Multi-valued (`1..*`). See [Service](#service). Each reference is by [Person Standard → Identifier](/publications_person_standard#identifier).

<span id="episode-timeInformation">timeInformation</span>
: Details about the timing of the episode. Multi-valued (`1..*`). See [TimeInformation](#timeinformation).

<span id="episode-location">location</span>
: Details about the location of the episode. Multi-valued (`1..*`). _String_.

<span id="episode-finding">finding</span>
: Observations or measurements made during the course of the episode about the subject and their circumstances. Multi-valued. Optional (`0..*`). See [Finding](#finding).

#### Example

<div class="example">
  <h5 id="example-episode">Example - ServiceEpisode</h5>
{% highlight json %}
{
  "@type": "ServiceEpisode",
  "identifier": [ { "@type": "Identifier", "value": "EP-2026-0001", "system": "https://example.org/Id/episode" } ],
  "type": ["child-in-need"],
  "subjectPerson": [ { "see SubjectPerson example" } ],
  "relatedProfessional": [ { "see RelatedProfessional example" } ],
  "relatedService": [ { "ref": { "@type": "Identifier", "value": "SVC-001", "system": "https://example.org/Id/service" } } ],
  "timeInformation": [ { "see TimeInformation example" } ],
  "location": ["Anytown Family Centre"],
  "finding": [ { "see Finding example" } ]
}
{% endhighlight %}
</div>


### LifeEvent

A significant, time-bound occurrence in an individual's life that may have implications for their safety, wellbeing or development — for example attendance at A&E, a child being reported as missing, or an exclusion from school. Life events are not inherently positive or negative, but can indicate to safeguarding and wellbeing professionals levels of risk, vulnerability, need or changes in support requirements. Professionals typically weigh the **recency**, **frequency**, **gravity** and **context** of a life event alongside other factors. Corresponds to the [Life Event Data Standard](https://github.com/SocialCareData/life-event-standard).

#### Properties

<span id="event-identifier">identifier</span>
: Unique identifiers associated with the life event. Multi-valued (`1..*`). See [Person Standard → Identifier](/publications_person_standard#identifier).

<span id="event-type">type</span>
: Code for the type of the life event (e.g. birth, death, missing episode). Multi-valued (`1..*`). See the [Event Code Vocabulary](#event-code-vocabulary).

<span id="event-subjectPerson">subjectPerson</span>
: References to the `Person`(s) the life event concerns, each qualified by the nature of their involvement. Multi-valued (`1..*`). See [SubjectPerson](#subjectperson).

<span id="event-relatedProfessional">relatedProfessional</span>
: References to the `Professional`(s) involved in the life event, each qualified by the nature of their involvement. Multi-valued. Optional (`0..*`). See [RelatedProfessional](#relatedprofessional).

<span id="event-relatedService">relatedService</span>
: References to the `Service`(s) involved in the life event. Multi-valued. Optional (`0..*`). See [Service](#service). Each reference is by [Person Standard → Identifier](/publications_person_standard#identifier).

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
  "type": ["missing-episode"],
  "subjectPerson": [ { "see SubjectPerson example" } ],
  "relatedProfessional": [ { "see RelatedProfessional example" } ],
  "relatedService": [ { "ref": { "@type": "Identifier", "value": "SVC-001", "system": "https://example.org/Id/service" } } ],
  "timeInformation": [ { "see TimeInformation example" } ],
  "location": ["Anytown town centre"]
}
{% endhighlight %}
</div>


### SubjectPerson

A typed reference to a `Person` involved in a service episode or life event. The reference is by [Person Standard → Identifier](/publications_person_standard#identifier) (so the person may live in a different system) and is qualified by the nature of their involvement.

#### Properties

<span id="subjectperson-person">person</span>
: A reference to a `Person` record involved in the episode or life event, by [Person Standard → Identifier](/publications_person_standard#identifier). (`1..1`).

<span id="subjectperson-involvement">involvement</span>
: Code for the nature of the person's involvement. (`1..1`). See the [Involvement Code Vocabulary](#involvement-code-vocabulary).

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

A typed reference to a `Professional` involved in a service episode or life event. The reference is by [Person Standard → Identifier](/publications_person_standard#identifier) and is qualified by the nature of their involvement.

#### Properties

<span id="relatedprofessional-professional">professional</span>
: A reference to a `Professional` record involved in the episode or life event, by [Person Standard → Identifier](/publications_person_standard#identifier). (`1..1`).

<span id="relatedprofessional-involvement">involvement</span>
: Code for the nature of the professional's involvement. (`1..1`). See the [Involvement Code Vocabulary](#involvement-code-vocabulary).

#### Example

<div class="example">
  <h5 id="example-relatedprofessional">Example - RelatedProfessional</h5>
{% highlight json %}
{
  "@type": "RelatedProfessional",
  "professional": { "@type": "Identifier", "value": "SW1234567", "system": "https://www.socialworkengland.org.uk/Id/registration" },
  "involvement": "PPRF"
}
{% endhighlight %}
</div>


### TimeInformation

Details about the timing of a service episode or life event, including when it started and ended and how frequently it recurs.

#### Properties

<span id="timeinformation-startDateTime">startDateTime</span>
: The start of the episode or life event, as an ISO 8601 date-time. (`1..1`). _DateTime_.

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
  "frequency": "260007"
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
  "observation": [ { "see Observation example" } ],
  "measurement": [ { "see Measurement example" } ],
  "text": ["Home environment observed to be stable and supportive."]
}
{% endhighlight %}
</div>


### Observation

A qualitative observation that represents an attribute of the subject or their circumstances (for example, "NEET" or "Free School Meals recipient").

#### Properties

<span id="observation-type">type</span>
: The type of observation. (`1..1`). See the [Observation Type Vocabulary](#observation-type-vocabulary).

<span id="observation-startDate">startDate</span>
: The date at which this observation was first true (e.g. the estimated date the subject became NEET), as an ISO 8601 date-time. (`1..1`). _DateTime_.

<span id="observation-endDate">endDate</span>
: The date at which this observation was made false (e.g. the estimated date the subject stopped being NEET). Present only if the observation is now outdated. Optional (`0..1`). _DateTime_.

#### Example

<div class="example">
  <h5 id="example-observation">Example - Observation</h5>
{% highlight json %}
{
  "@type": "Observation",
  "type": "NEET",
  "startDate": "2026-03-15",
  "endDate": "2026-06-30"
}
{% endhighlight %}
</div>


### Measurement

A quantitative measurement of something related to the subject or their circumstances (for example, "Authorised Absences" or "Referrals").

#### Properties

<span id="measurement-value">value</span>
: A decimal number representing the value of the measurement (e.g. `25`, `0.67`, `806.75`). (`1..1`). _Float_.

<span id="measurement-unit">unit</span>
: The unit of measurement (e.g. `cm`, `%`, `count`). (`1..1`). See the [Measurement Unit Vocabulary](#measurement-unit-vocabulary).

<span id="measurement-type">type</span>
: The type of measurement. (`1..1`). See the [Measurement Type Vocabulary](#measurement-type-vocabulary).

#### Example

<div class="example">
  <h5 id="example-measurement">Example - Measurement</h5>
{% highlight json %}
{
  "@type": "Measurement",
  "value": 12,
  "unit": "count",
  "type": "authorised-absences"
}
{% endhighlight %}
</div>


## Shared objects

The `Identifier`, `Name`, `Address` and `Contact` objects used throughout this standard are defined once in the [Person Standard](/publications_person_standard) and reused here unchanged, so that people, professionals and organisations are identified and described consistently across the whole data model. Refer to the Person Standard for the full property list, cardinalities and examples of each:

- **Identifier** — a value plus the system in whose namespace it is unique. Used to identify, and to reference, every entity in this standard. See [Person Standard → Identifier](/publications_person_standard#identifier).
- **Name** — a container for name parts (family name, given names, preferred name, use). See [Person Standard → Name](/publications_person_standard#name).
- **Address** — a postal address, with optional UPRN/USRN. See [Person Standard → Address](/publications_person_standard#address).
- **Contact** — a grouping of contact channels (email, telephone). See [Person Standard → Contact](/publications_person_standard#contact).

## Controlled vocabularies

Coded fields draw their values from the controlled vocabularies below. Each coded value is a `Code` object comprising a `code` and a human-readable `description`. The vocabularies themselves are maintained separately from this specification; the sections below name each vocabulary and link to its source where one exists.

### Organisation Code Vocabulary

Used by [`Organisation.type`](#organisation-type). Codes for the kind of organisation. _Vocabulary to be published._

### Organisation Status Code Vocabulary

Used by [`Organisation.status`](#organisation-status). Codes for the status of an organisation. _Vocabulary to be published._

### Service Code Vocabulary

Used by [`Service.type`](#service-type). Codes for the kind of service. _Vocabulary to be published._

### Active Code Vocabulary

Used by [`Service.status`](#service-status). Codes for the active status of a service. _Vocabulary to be published._

### Episode Code Vocabulary

Used by [`ServiceEpisode.type`](#episode-type). Codes for the type of service episode. _Vocabulary to be published._

### Event Code Vocabulary

Used by [`LifeEvent.type`](#event-type). Codes for the type of life event. _Vocabulary to be published._

### Involvement Code Vocabulary

Used by [`SubjectPerson.involvement`](#subjectperson-involvement) and [`RelatedProfessional.involvement`](#relatedprofessional-involvement). Codes for the nature of a person's or professional's involvement. Aligned with the HL7 [`ParticipationType`](https://terminology.hl7.org/5.2.0/CodeSystem-v3-ParticipationType.html) code system.

### Frequency Code Vocabulary

Used by [`TimeInformation.frequency`](#timeinformation-frequency). Codes for the frequency of an episode or life event, including whether it is spontaneous. Aligned with [SNOMED CT frequencies](https://browser.ihtsdotools.org/?perspective=full&conceptId1=272123002&edition=MAIN&languages=en).

### Observation Type Vocabulary

Used by [`Observation.type`](#observation-type). Codes for the type of observation. _Vocabulary to be published._

### Measurement Type Vocabulary

Used by [`Measurement.type`](#measurement-type). Codes for the type of measurement. _Vocabulary to be published._

### Measurement Unit Vocabulary

Used by [`Measurement.unit`](#measurement-unit). Codes for the unit of a measurement. _Vocabulary to be published._


## Alignment with other specifications

This standard is composed from, and stays aligned with, the following draft standards in the Data Standards for Social Care programme:

- [Person Standard](/publications_person_standard) — the source of the shared `Identifier`, `Name`, `Address` and `Contact` objects.
- [Organisation Data Standard](https://github.com/SocialCareData/service-episode-standard)
- [Service Data Standard](https://github.com/SocialCareData/service-episode-standard)
- [Professional Data Standard](https://github.com/SocialCareData/professional-standard)
- [Service Episode Data Standard](https://github.com/SocialCareData/service-episode-standard)
- [Life Event Data Standard](https://github.com/SocialCareData/life-event-standard)

In creating this specification we also reviewed and aligned with HL7 FHIR (the [`Organization`](https://build.fhir.org/organization.html), [`PractitionerRole`](https://build.fhir.org/practitionerrole.html), [`HealthcareService`](https://build.fhir.org/healthcareservice.html) and [`EpisodeOfCare`](https://build.fhir.org/episodeofcare.html) resources) and the HL7 [`ParticipationType`](https://terminology.hl7.org/5.2.0/CodeSystem-v3-ParticipationType.html) code system.


## Report an issue

If you spot an issue with this standard, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Safeguarding+Standard%3A%20&page=https%3A%2F%2Fstandard.socialcaredata.io%2Fsafeguarding_standard&category=Safeguarding+Standard" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.


## Versions

{% include versions.html %}
