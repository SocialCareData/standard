---
layout: publication
title: Safeguarding Standard Tabular View
tags:
  - MAIS
  - Safeguarding
data_model: src/assets/model/safeguarding/safeguarding-standard.yaml
---

<a href="/PUB02_safeguarding_standard" style="float: right;"><img src="/assets/icon/data-model.svg" alt="" aria-hidden="true" style="width: 1em; height: 1em; vertical-align: text-bottom; margin-right: 0.35rem;">Standard View</a>

## Data Model

### Organisation

{% schema_table page.data_model Organisation %}

### Service

{% schema_table page.data_model Service %}

### Professional

{% schema_table page.data_model Professional %}

### ServiceEpisode

{% schema_table page.data_model ServiceEpisode %}

### LifeEvent

{% schema_table page.data_model LifeEvent %}

### SubjectPerson

{% schema_table page.data_model SubjectPerson %}

### RelatedProfessional

{% schema_table page.data_model RelatedProfessional %}

### TimeInformation

{% schema_table page.data_model TimeInformation %}

### Timing

{% schema_table page.data_model Timing %}

### Repeat

{% schema_table page.data_model Repeat all %}

### Finding

{% schema_table page.data_model Finding %}

### Observation

{% schema_table page.data_model Observation %}

### Measurement

{% schema_table page.data_model Measurement %}

## Shared objects

### Identifier

See [Person.Identifier](PUB01_person_standard_table#identifier)

### Name

See [Person.Name](PUB01_person_standard_table#name)

### Address

See [Person.Address](PUB01_person_standard_table#address)

### Contact

See [Person.Contact](PUB01_person_standard_table#contact)

## Taxonomies

### Organisation Code Taxonomy

{% schema_table page.data_model OrganisationCode %}

### Service Code Taxonomy

{% schema_table page.data_model ServiceCode %}

### Service Cost Frequency Taxonomy

{% schema_table page.data_model ServiceCostFrequency %}

### Service Delivery Taxonomy

{% schema_table page.data_model ServiceDelivery %}

### Episode Code Taxonomy

{% schema_table page.data_model EpisodeCode %}

### Episode Outcome Taxonomy

{% schema_table page.data_model EpisodeOutcome %}

### Event Code Taxonomy

{% schema_table page.data_model EventCode %}

### Measurement Type Taxonomy

{% schema_table page.data_model MeasurementType %}

### Measurement Unit Taxonomy

{% schema_table page.data_model MeasurementUnit %}

### Name Use Code Taxonomy

{% schema_table page.data_model NameUseCode %}

### Address Use Code Taxonomy

{% schema_table page.data_model AddressUseCode %}
