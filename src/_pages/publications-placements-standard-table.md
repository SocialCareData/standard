---
layout: publication
title: Children's Social Care Placements Standard Tabular View
breadcrumbs:
  - Publications
tags:
  - Placements
---

[Standard View](/publications_placements_standard){: style="float: right;"}

## Data Model

### Placement

{% shacl_table src/assets/model/placements/placements.yaml Placement %}

### PlacementAvailability

{% shacl_table src/assets/model/placements/placements.yaml PlacementAvailability %}

### PlacementRequirements

{% shacl_table src/assets/model/placements/placements.yaml PlacementRequirements %}

### PlacementRecommendation

{% shacl_table src/assets/model/placements/placements.yaml PlacementRecommendation %}

### RiskAssessment

{% shacl_table src/assets/model/placements/placements.yaml RiskAssessment %}

### ActualPlacement

{% shacl_table src/assets/model/placements/placements.yaml ActualPlacement %}

### QualityAssurance

{% shacl_table src/assets/model/placements/placements.yaml QualityAssurance %}

## Taxonomies

### Communication Need Taxonomy

{% shacl_table src/assets/model/placements/placements.yaml specificCommunicationRequirement %}

### Living Arrangement Taxonomy

{% shacl_table src/assets/model/placements/placements.yaml livingCompanions %}

### Out of LA Reason Taxonomy

{% shacl_table src/assets/model/placements/placements.yaml outOfLAReason %}

### Placement Type Taxonomy

{% shacl_table src/assets/model/placements/placements.yaml placementType %}

### Placement Urgency Taxonomy

{% shacl_table src/assets/model/placements/placements.yaml neededBy %}

### Support Type Taxonomy

{% shacl_table src/assets/model/placements/placements.yaml additionalSupport %}
