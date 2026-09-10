---
layout: publication
title: Children's Social Care Placements Standard Data Model Changes
tags:
  - Placements
current_spec: /PUB00_placements_standard_2
previous_spec: /PUB00_placements_standard
---

{% assign current_page = site.pages | where: "url", page.current_spec | first %}
{% assign previous_page = site.pages | where: "url", page.previous_spec | first %}
{% assign current = current_page.data_model %}
{% assign previous = previous_page.data_model %}

<a href="{{ page.current_spec }}" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>

This page shows how the current data model differs from the previous version.
<span class="diff-added">Added</span> rows are shown in green,
<del class="diff-removed">removed</del> rows in red with a strike-through, and
changed values as the <del class="diff-old">old value</del> <ins class="diff-new">new value</ins>.

<p>Comparing the <a href="{{ previous_page.url }}">previous specification</a> against the <a href="{{ current_page.url }}">current specification</a>.</p>

## Data Model

### Placement

{% schema_table_diff current previous Placement %}

### PlacementAvailability

{% schema_table_diff current previous PlacementAvailability all %}

### PlacementRequirements

{% schema_table_diff current previous PlacementRequirements all %}

### PlacementRecommendation

{% schema_table_diff current previous PlacementRecommendation all %}

### RiskAssessment

{% schema_table_diff current previous RiskAssessment all %}

* Removed the `riskOther` and `riskToOthersOther` free-text fields to mitigate Information Governance and data privacy risks. [Issue #19](https://github.com/SocialCareData/standard/issues/19)

### ActualPlacement

{% schema_table_diff current previous ActualPlacement all %}

### QualityAssurance

{% schema_table_diff current previous QualityAssurance all %}

## Taxonomies

### Communication Need Taxonomy

{% schema_table_diff current previous specificCommunicationRequirement no-label %}

### Living Arrangement Taxonomy

{% schema_table_diff current previous livingCompanions no-label %}

### Needs Assessment Method Taxonomy

{% schema_table_diff current previous needsAssessmentMethod no-label %}

### Out of LA Reason Taxonomy

{% schema_table_diff current previous outOfLAReason no-label %}

### Placement Source Taxonomy

{% schema_table_diff current previous placementSource no-label %}

### Placement Type Taxonomy

{% schema_table_diff current previous placementType no-label %}

### Placement Urgency Taxonomy

{% schema_table_diff current previous neededBy no-label %}

### Support Type Taxonomy

{% schema_table_diff current previous additionalSupport no-label %}

### UASC Status Taxonomy

{% schema_table_diff current previous uascStatus no-label %}

## Report an issue

{% include report-issue.html %}
