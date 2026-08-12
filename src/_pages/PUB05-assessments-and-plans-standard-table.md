---
layout: publication
title: Care Needs Assessments and Care Plans Tabular View
tags:
  - Joined Up Care
data_model: src/assets/model/assessments-and-plans/assessments-and-plans-standard.yaml
---

<a href="/PUB05_assessments_and_plans_standard" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>

## Data Model

### CareNeedsAssessment

{% schema_table page.data_model CareNeedsAssessment %}

### CarePlan

{% schema_table page.data_model CarePlan %}

### FoundationalInformation

{% schema_table page.data_model FoundationalInformation %}

### Review

{% schema_table page.data_model Review %}

### AssessmentQuestion

{% schema_table page.data_model AssessmentQuestion %}

### CareComponent

{% schema_table page.data_model CareComponent %}

### CareActor

{% schema_table page.data_model CareActor %}

### CareTiming

{% schema_table page.data_model CareTiming %}

### CareActivity

{% schema_table page.data_model CareActivity %}

### Identifier

{% schema_table page.data_model Identifier %}


## Taxonomies

### Care Document Status Taxonomy

{% schema_table page.data_model DocumentStatus %}

### Question Category Taxonomy

{% schema_table page.data_model QuestionCategory %}

### Answer Type Taxonomy

{% schema_table page.data_model AnswerType %}

### Care Actor Type Taxonomy

{% schema_table page.data_model CareActorType %}

### Care Act Outcome Taxonomy

{% schema_table page.data_model CareActOutcome %}

### Statutory Question ID Taxonomy

{% schema_table page.data_model StatutoryQuestionId %}

### Client Funding Status Taxonomy

{% schema_table page.data_model ClientFundingStatus %}

### Care Act Eligibility Status Taxonomy

{% schema_table page.data_model CareActEligibilityStatus %}
