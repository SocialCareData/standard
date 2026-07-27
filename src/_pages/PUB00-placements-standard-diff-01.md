---
layout: publication
title: Children's Social Care Placements Standard Data Model Changes
tags:
  - Placements
diff_reference: PUB00
---

{% assign pub = site.pages | where: "reference", page.diff_reference | where_exp: "p", "p.version" | sort: "version" | reverse | first %}
{% assign current = pub.data_model %}
{% assign previous = pub.previous_data_model %}

<a href="{{ pub.url }}" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>

This page shows how the current data model differs from the previous version.
<span class="diff-added">Added</span> rows are shown in green,
<span class="diff-removed"><del>removed</del></span> rows in red with a strike-through, and
<span class="diff-changed">changed</span> values in yellow with the old value struck through beside the new.

## Data Model

### Placement

{% schema_table_diff current previous Placement %}

### PlacementAvailability

{% schema_table_diff current previous PlacementAvailability %}

### PlacementRequirements

{% schema_table_diff current previous PlacementRequirements %}

### PlacementRecommendation

{% schema_table_diff current previous PlacementRecommendation %}

### RiskAssessment

{% schema_table_diff current previous RiskAssessment %}

### ActualPlacement

{% schema_table_diff current previous ActualPlacement %}

### QualityAssurance

{% schema_table_diff current previous QualityAssurance %}

## Taxonomies

### Communication Need Taxonomy

{% schema_table_diff current previous specificCommunicationRequirement %}

### Living Arrangement Taxonomy

{% schema_table_diff current previous livingCompanions %}

### Out of LA Reason Taxonomy

{% schema_table_diff current previous outOfLAReason %}

### Placement Type Taxonomy

{% schema_table_diff current previous placementType %}

### Placement Urgency Taxonomy

{% schema_table_diff current previous neededBy %}

### Support Type Taxonomy

{% schema_table_diff current previous additionalSupport %}
