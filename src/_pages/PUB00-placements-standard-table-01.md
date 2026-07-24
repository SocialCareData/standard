---
layout: publication
title: Children's Social Care Placements Standard Tabular View
tags:
  - Placements
data_model: src/assets/model/placements/placements-standard-01.yaml
---

<a href="/PUB00_placements_standard_01" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>

## Data Model

### Placement

{% schema_table page.data_model Placement %}

### PlacementAvailability

{% schema_table page.data_model PlacementAvailability %}

### PlacementRequirements

{% schema_table page.data_model PlacementRequirements %}

### PlacementRecommendation

{% schema_table page.data_model PlacementRecommendation %}

### RiskAssessment

{% schema_table page.data_model RiskAssessment %}

### ActualPlacement

{% schema_table page.data_model ActualPlacement %}

### QualityAssurance

{% schema_table page.data_model QualityAssurance %}

## Taxonomies

### Communication Need Taxonomy

{% schema_table page.data_model specificCommunicationRequirement %}

### Living Arrangement Taxonomy

{% schema_table page.data_model livingCompanions %}

### Out of LA Reason Taxonomy

{% schema_table page.data_model outOfLAReason %}

### Placement Type Taxonomy

{% schema_table page.data_model placementType %}

### Placement Urgency Taxonomy

{% schema_table page.data_model neededBy %}

### Support Type Taxonomy

{% schema_table page.data_model additionalSupport %}
