---
layout: publication
title: Children's Social Care Placements Standard Tabular View
tags:
  - Placements
data_model: src/assets/model/placements/placements.yaml
---

[Standard View](/PUB00_placements_standard){: style="float: right;"}

## Data Model

### Placement

{% schema_table page.data_model Placement %}

### PlacementAvailability

{% schema_table src/assets/model/placements/placements.yaml PlacementAvailability %}

### PlacementRequirements

{% schema_table src/assets/model/placements/placements.yaml PlacementRequirements %}

### PlacementRecommendation

{% schema_table src/assets/model/placements/placements.yaml PlacementRecommendation %}

### RiskAssessment

{% schema_table src/assets/model/placements/placements.yaml RiskAssessment %}

### ActualPlacement

{% schema_table src/assets/model/placements/placements.yaml ActualPlacement %}

### QualityAssurance

{% schema_table src/assets/model/placements/placements.yaml QualityAssurance %}

## Taxonomies

### Communication Need Taxonomy

{% schema_table src/assets/model/placements/placements.yaml specificCommunicationRequirement %}

### Living Arrangement Taxonomy

{% schema_table src/assets/model/placements/placements.yaml livingCompanions %}

### Out of LA Reason Taxonomy

{% schema_table src/assets/model/placements/placements.yaml outOfLAReason %}

### Placement Type Taxonomy

{% schema_table src/assets/model/placements/placements.yaml placementType %}

### Placement Urgency Taxonomy

{% schema_table src/assets/model/placements/placements.yaml neededBy %}

### Support Type Taxonomy

{% schema_table src/assets/model/placements/placements.yaml additionalSupport %}
