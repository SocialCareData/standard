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

{% shacl_table src/assets/shacl/shacl-shape.ttl Placement %}

### PlacementAvailability

{% shacl_table src/assets/shacl/shacl-shape.ttl PlacementAvailability %}

### PlacementRequirements

{% shacl_table src/assets/shacl/shacl-shape.ttl PlacementRequirements %}

### PlacementRecommendation

{% shacl_table src/assets/shacl/shacl-shape.ttl PlacementRecommendation %}

### RiskAssessment

{% shacl_table src/assets/shacl/shacl-shape.ttl RiskAssessment %}

### ActualPlacement

{% shacl_table src/assets/shacl/shacl-shape.ttl ActualPlacement %}

### QualityAssurance

{% shacl_table src/assets/shacl/shacl-shape.ttl QualityAssurance %}

## Taxonomies

### Communication Need Taxonomy

{% shacl_table src/assets/shacl/shacl-shape.ttl specificCommunicationRequirement %}

### Living Arrangement Taxonomy

{% shacl_table src/assets/shacl/shacl-shape.ttl livingCompanions %}

### Out of LA Reason Taxonomy

{% shacl_table src/assets/shacl/shacl-shape.ttl outOfLAReason %}

### Placement Type Taxonomy

{% shacl_table src/assets/shacl/shacl-shape.ttl placementType %}

### Placement Urgency Taxonomy

{% shacl_table src/assets/shacl/shacl-shape.ttl neededBy %}

### Support Type Taxonomy

{% shacl_table src/assets/shacl/shacl-shape.ttl additionalSupport %}
