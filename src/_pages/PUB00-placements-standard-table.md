---
layout: publication
title: Children's Social Care Placements Standard Tabular View
description: Tabular view of the children's social care placements standard, which helps regions answer their sufficiency questions by establishing a common data model to gather data about placements.
tags:
  - Placements
data_model: src/assets/model/placements/placements-standard.yaml
---

<a href="/PUB00_placements_standard" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>

## Data Model

### Placement

{% schema_table page.data_model Placement explain-boolean %}

### PlacementAvailability

{% schema_table page.data_model PlacementAvailability all explain-boolean %}

### PlacementRequirements

{% schema_table page.data_model PlacementRequirements all explain-boolean %}

### PlacementRecommendation

{% schema_table page.data_model PlacementRecommendation all explain-boolean %}

### RiskAssessment

{% schema_table page.data_model RiskAssessment all explain-boolean %}

### ActualPlacement

{% schema_table page.data_model ActualPlacement all explain-boolean %}

### QualityAssurance

{% schema_table page.data_model QualityAssurance all explain-boolean %}

## Taxonomies

### Communication Need Taxonomy

{% schema_table page.data_model specificCommunicationRequirement no-label %}

### Living Arrangement Taxonomy

{% schema_table page.data_model livingCompanions no-label %}

### Needs Assessment Method Taxonomy

{% schema_table page.data_model needsAssessmentMethod no-label %}

### Placement Source Taxonomy

{% schema_table page.data_model placementSource no-label %}

### Placement Type Taxonomy

{% schema_table page.data_model placementType no-label %}

### Non-Preferred Location Reason Taxonomy

{% schema_table page.data_model nonPreferredLocationReason no-label %}

### Placement Urgency Taxonomy

{% schema_table page.data_model neededBy no-label %}

### Support Type Taxonomy

{% schema_table page.data_model additionalSupport no-label %}
