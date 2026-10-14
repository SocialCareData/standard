---
layout: publication
title: Referrals and Requests Standard
description: "[TODO: Add description]"
breadcrumbs:
  - Publications
tags:
  - Joined Up Care
  - Publication
reference: PUB06
status: draft
data_model: src/_data/model/referrals/referrals-standard.yaml
non_technical_summary: |
  <!-- TODO: Non-technical summary -->
---

<a href="/PUB06_referrals_standard_table" style="float: right;"><img src="/assets/icon/table-view.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Table View</a>

## Introduction

<!-- TODO: Introduction -->

### Purpose

<!-- TODO: Purpose -->

### Scope

<!-- TODO: Scope -->

### Audience

<!-- TODO: Audience -->

## Data Model Overview

<!-- TODO: Data model diagram and architectural overview -->

## Core Entities

### Referral

Inward, person-centric, point-of-entry referral into social services.

{% schema_table page.data_model Referral %}

### Request

Outward request for services for an existing subject of care.

{% schema_table page.data_model Request %}

### QualityOfCareConcern

Quality of care concern raised about a care provider or service.

{% schema_table page.data_model QualityOfCareConcern %}

## Supporting Entities

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

## Shared Objects

### Identifier

See [Person.Identifier](/PUB01_person_standard#identifier).

### Person

See [Person](/PUB01_person_standard#person).

### Professional

See [Safeguarding.Professional](/PUB02_safeguarding_standard#professional).

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
