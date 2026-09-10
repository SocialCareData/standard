---
layout: publication
title: Children's Social Care Placements Standard Tabular View
tags:
  - Placements
data_model: src/assets/model/placements/placements-standard-2.yaml
---

<a href="/PUB00_placements_standard_2" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>

## Data Model

### Placement

{% schema_table page.data_model Placement %}

### PlacementAvailability

{% schema_table page.data_model PlacementAvailability all %}

### PlacementRequirements

{% schema_table page.data_model PlacementRequirements all %}

### PlacementRecommendation

{% schema_table page.data_model PlacementRecommendation all %}

### RiskAssessment

{% schema_table page.data_model RiskAssessment all %}

### ActualPlacement

{% schema_table page.data_model ActualPlacement all %}

### QualityAssurance

{% schema_table page.data_model QualityAssurance all %}

## Taxonomies

### Communication Need Taxonomy

{% schema_table page.data_model specificCommunicationRequirement no-label %}

### Living Arrangement Taxonomy

{% schema_table page.data_model livingCompanions no-label %}

### Needs Assessment Method Taxonomy

{% schema_table page.data_model needsAssessmentMethod no-label %}

### Out of LA Reason Taxonomy

{% schema_table page.data_model outOfLAReason no-label %}

### Placement Source Taxonomy

{% schema_table page.data_model placementSource no-label %}

### Placement Type Taxonomy

{% schema_table page.data_model placementType no-label %}

### Placement Urgency Taxonomy

{% schema_table page.data_model neededBy no-label %}

### Support Type Taxonomy

{% schema_table page.data_model additionalSupport no-label %}

### UASC Status Taxonomy

{% schema_table page.data_model uascStatus no-label %}
