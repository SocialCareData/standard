---
layout: publication
title: Person Standard Tabular View
tags:
  - Person
data_model: src/assets/model/person/person-subject-of-care.yaml
---

<a href="/PUB01_person_standard" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>



## Data Model

### Person

{% schema_table page.data_model Person %}

### Identifier

{% schema_table page.data_model Identifier %}

### Name

{% schema_table page.data_model Name all %}

### Address

{% schema_table page.data_model Address all %}

### Contact

{% schema_table page.data_model Contact %}

### PersonRelationship

{% schema_table page.data_model PersonRelationship 5 %}

### PartialDate

{% schema_table page.data_model PartialDate %}

## Taxonomies

### Name Use Code Taxonomy

{% schema_table page.data_model nameUse %}

### Address Use Code Taxonomy

{% schema_table page.data_model addressUse %}

### Gender Code Taxonomy

{% schema_table page.data_model genderCode %}

### Phenotypic Sex Code Taxonomy

{% schema_table page.data_model sexCode %}

### Ethnicity Code Taxonomy

{% schema_table page.data_model ethnicityCode %}

### Person Relationship Code Taxonomy

{% schema_table page.data_model relationship %}
