---
layout: publication
title: Referrals and Requests Tabular View
tags:
  - Joined Up Care
data_model: src/_data/model/referrals/referrals-standard.yaml
---

<a href="/PUB06_referrals_standard" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>

## Data Model

### Referral

{% schema_table page.data_model Referral %}

### Request

{% schema_table page.data_model Request %}

### QualityOfCareConcern

{% schema_table page.data_model QualityOfCareConcern %}

### Response

{% schema_table page.data_model Response %}

### IntakePerson

{% schema_table page.data_model IntakePerson %}

### PersonalNetworkMember

{% schema_table page.data_model PersonalNetworkMember %}

### ReferrerDetails

{% schema_table page.data_model ReferrerDetails %}

### ConcernDetail

{% schema_table page.data_model ConcernDetail %}

### QocService

{% schema_table page.data_model QocService %}

### QocConcernDetail

{% schema_table page.data_model QocConcernDetail %}

### ReferralInvolvement

{% schema_table page.data_model ReferralInvolvement %}

### DocumentReference

{% schema_table page.data_model DocumentReference %}

### ReferralAssessmentQuestion

{% schema_table page.data_model ReferralAssessmentQuestion %}

## Shared objects

### Identifier

See [Person.Identifier](PUB01_person_standard_table#identifier)

### Person

See [Person](PUB01_person_standard_table#person)

### Name

See [Person.Name](PUB01_person_standard_table#name)

### Address

See [Person.Address](PUB01_person_standard_table#address)

### Contact

See [Person.Contact](PUB01_person_standard_table#contact)

### PersonRelationship

See [Person.PersonRelationship](PUB01_person_standard_table#personrelationship)

### PartialDate

See [Person.PartialDate](PUB01_person_standard_table#partialdate)

### Communication

See [Person.Communication](PUB01_person_standard_table#communication)

### Professional

See [Safeguarding.Professional](PUB02_safeguarding_standard_table#professional)

### LinkedRecord

See [Safeguarding.LinkedRecord](PUB02_safeguarding_standard_table#linkedrecord)

## Taxonomies

### Referral Types Taxonomy

{% schema_table page.data_model ReferralTypeCode %}

### Concerns Taxonomy

{% schema_table page.data_model ConcernCode %}

### Quality-of-Care Concerns Taxonomy

{% schema_table page.data_model QocConcernCode %}

### Request Purposes Taxonomy

{% schema_table page.data_model RequestPurposeCode %}

### Response Statuses Taxonomy

{% schema_table page.data_model ResponseStatusCode %}

### Record Type Taxonomy

{% schema_table page.data_model RecordTypeCode %}

### Question Categories Taxonomy

{% schema_table page.data_model ReferralQuestionCategory %}

### Answer Type Taxonomy

{% schema_table page.data_model AnswerType %}

### Referrer Types Taxonomy

{% schema_table page.data_model ReferrerTypeCode %}

### Person Relationship Code Taxonomy

{% schema_table page.data_model PersonRelationshipCode %}

### Gender Code Taxonomy

{% schema_table page.data_model GenderCode %}

### Phenotypic Sex Code Taxonomy

{% schema_table page.data_model PhenotypicSexCode %}

### Ethnicity Code Taxonomy

{% schema_table page.data_model EthnicityCode %}
