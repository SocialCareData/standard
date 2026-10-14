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

### HouseholdMember

{% schema_table page.data_model HouseholdMember %}

### ReferrerDetails

{% schema_table page.data_model ReferrerDetails %}

### ConcernDetail

{% schema_table page.data_model ConcernDetail %}

### ReferralInvolvement

{% schema_table page.data_model ReferralInvolvement %}

### DocumentReference

{% schema_table page.data_model DocumentReference %}

### ReferralRelationship

{% schema_table page.data_model ReferralRelationship %}

### ReferralAssessmentQuestion

{% schema_table page.data_model ReferralAssessmentQuestion %}

## Shared objects

### Identifier

See [Person.Identifier](PUB01_person_standard_table#identifier)

### Person

See [Person](PUB01_person_standard_table#person)

### Professional

See [Safeguarding.Professional](PUB02_safeguarding_standard_table#professional)

## Taxonomies

### Referral Types Taxonomy

{% schema_table page.data_model ReferralTypeCode %}

### Concerns Taxonomy

{% schema_table page.data_model ConcernCode %}

### Request Purposes Taxonomy

{% schema_table page.data_model RequestPurposeCode %}

### Outcomes (Service Codes) Taxonomy

{% schema_table page.data_model ReferralServiceCode %}

### Question Categories Taxonomy

{% schema_table page.data_model ReferralQuestionCategory %}

### Relationships Between Linked Referrals Taxonomy

{% schema_table page.data_model ReferralRelationshipCode %}

### Referrer Types Taxonomy

{% schema_table page.data_model ReferrerTypeCode %}
