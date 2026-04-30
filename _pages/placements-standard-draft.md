---
layout: default
permalink: /placements_standard
title: Children's Social Care Placements Standard
breadcrumbs:
  - title: Publications
    url: /publications
---



<nav class="toc numbered-toc">
<h2 id="table-of-contents">Table of Contents</h2>

1. TOC
{:toc}

</nav>

<article class="numbered-headings">

## Introduction

The children's social care placements standard helps regions to answer its sufficiency questions by establishing a common data model to gather data about placements.


## Data Model

The following diagram illustrates the elements of the Children's Social Care Placements Ontology.

<p class="data-model-diagram"><img src="/assets/img/placements-data-model.svg" alt="Placements Data Model" title="Placements Data Model" /></p>

A `Placement` is the top-level record covering the full lifecycle of a placement instance. It aggregates six sub-components: the referral availability, the social-worker recommendation, the requirements describing the child's needs, the risk assessment, optionally the actual placement that was arranged, and quality-assurance metadata about who recorded each part and when.


### Placement

The top-level record. Captures the unique child identifier and links the placement sub-components together.

#### Properties

<span id="placement-childId">childId</span>
: Identifier unique to each child within the local authority, allowing linking between multiple referrals for the same child. _String_.

<span id="placement-placementId">placementId</span>
: Optional unique identifier of the placement record. _String_.

<span id="placement-hasPlacementAvailability">hasPlacementAvailability</span>
: The placement availability / referral details. See [PlacementAvailability](/placements_standard#placementavailability).

<span id="placement-hasPlacementRequirements">hasPlacementRequirements</span>
: The child's needs the placement must accommodate. See [PlacementRequirements](/placements_standard#placementrequirements).

<span id="placement-hasPlacementRecommendation">hasPlacementRecommendation</span>
: The social worker's suitability judgement for each placement category. See [PlacementRecommendation](/placements_standard#placementrecommendation).

<span id="placement-hasRiskAssessment">hasRiskAssessment</span>
: The risk assessment for the child. See [RiskAssessment](/placements_standard#riskassessment).

<span id="placement-hasActualPlacement">hasActualPlacement</span>
: The actual placement arranged for the child (optional - a referral may exist without yet having an actual placement). See [ActualPlacement](/placements_standard#actualplacement).

<span id="placement-hasQualityAssurance">hasQualityAssurance</span>
: Metadata about who recorded each part and when. See [QualityAssurance](/placements_standard#qualityassurance).

#### Example

<div class="example">
  <h5 id="example-placement">Example - Placement (top level)</h5>
{% highlight json %}
{
  "@context": "https://socialcaredata.github.io/ontology/placements/context.jsonld",
  "@id": "ex:ABCD2012-001",
  "@type": "Placement",
  "childId": "ABCD2012",
  "hasPlacementAvailability":   { "see PlacementAvailability example"   },
  "hasPlacementRequirements":   { "see PlacementRequirements example"   },
  "hasPlacementRecommendation": { "see PlacementRecommendation example"   },
  "hasRiskAssessment":          { "see RiskAssessment example"   },
  "hasActualPlacement":         { "see ActualPlacement example"   },
  "hasQualityAssurance":        { "see QualityAssurance example"   }
}
{% endhighlight %}
</div>

<div class="note">
  <h5 id="note-placement">Note - full lifecycle</h5>
  <p>The example above only sketches the top-level wiring. See <a href="/assets/shacl/examples/valid-placement.jsonld"><code>assets/shacl/examples/valid-placement.jsonld</code></a> for a full lifecycle example, and <a href="/assets/shacl/examples/valid-other-options.jsonld"><code>assets/shacl/examples/valid-other-options.jsonld</code></a> for an example exercising every "Other" controlled-vocab option with paired free-text values.</p>
</div>


### PlacementAvailability

The referral request: how urgently the child needs to be placed, how many siblings to be placed alongside, and whether the preferred location is in the same LA as the placing LA (and if not, why).

#### Properties

<span id="availability-neededBy">neededBy</span>
: By when does the child need to find a home/ be placed by? Captures urgency rather than an absolute date. Allowed values are: `'Today'`, `'< 5 days'`, `'> 5 days'`.  See the [Placement Urgency Taxonomy](/placements_standard#placement-urgency-taxonomy).

<span id="availability-siblingCount">siblingCount</span>
: How many siblings should the child be placed together with? If child has no siblings/ does not need to be placed with siblings then input 0. _Integer_.

<span id="availability-isPreferredLocationLocal">isPreferredLocationLocal</span>
: Is the preferred placement location in the same LA as the placing LA?. _Boolean_.

<span id="availability-outOfLAReason">outOfLAReason</span>
: If `isPreferredLocationLocal` is `false`, the reason the preferred placement is sought outside the placing LA. See the [Out of LA Reason Taxonomy](/placements_standard#out-of-la-reason-taxonomy).

<span id="availability-outOfLAReasonOther">outOfLAReasonOther</span>
: Free-text description when `outOfLAReason` is `'Other'`. Multi-valued. _String_.

#### Example

<div class="example">
  <h5 id="example-availability">Example - PlacementAvailability</h5>
{% highlight json %}
{
  "@type": "PlacementAvailability",
  "neededBy": "< 5 days",
  "siblingCount": 2,
  "isPreferredLocationLocal": false,
  "outOfLAReason": "Court order"
}
{% endhighlight %}
</div>

<div class="note">
  <h5 id="note-availability">Note</h5>
  <p>See <a href="/assets/shacl/examples/valid-other-options.jsonld"><code>assets/shacl/examples/valid-other-options.jsonld</code></a> for a worked example using <code>olr:OutOfLAReasonOther</code> with multiple paired free-text reasons.</p>
</div>


### PlacementRequirements

The child's needs that the placement must accommodate: communication, cultural, living companions, pets, additional support, deprivation of liberty, and home adaptation.

#### Properties

<span id="requirements-communicationNeeds">communicationNeeds</span>
: Whether the child has any communication, language or learning needs.  Allowed values are: `'Yes'`, `'No'`, `'Not Specified'`.

<span id="requirements-specificCommunicationRequirement">specificCommunicationRequirement</span>
: Specific communication or language requirements such as `'ESOL'`, `'BSL'` etc. and use `'None'` if not applicable. Multi-valued. See the [Communication Need Taxonomy](/placements_standard#communication-need-taxonomy).

<span id="requirements-specificCommunicationRequirementOther">specificCommunicationRequirementOther</span>
: Free-text descriptions when `specificCommunicationRequirement` includes `'Other'`. Multi-valued. _String_.

<span id="requirements-homeAdaptationRequired">homeAdaptationRequired</span>
: Whether adaptations to the home are required to accommodate the child's needs. _Boolean_.

<span id="requirements-culturalNeeds">culturalNeeds</span>
: Whether the placement must accommodate specific cultural needs (e.g. access to places of worship, religious activities).  Allowed values are: `'Required'`, `'Not Required'`, `'Not Known'`, `'Other'`.

<span id="requirements-culturalNeedsOther">culturalNeedsOther</span>
: Free-text descriptions when `'culturalNeeds` is `'Other'. Multi-valued.  _String_.

<span id="requirements-livingCompanions">livingCompanions</span>
: Are there any restrictions on who else can live in the same home? Or, would it help to have them living with other young people? See the [Living Arrangement Taxonomy](/placements_standard#living-arrangement-taxonomy).

<span id="requirements-pets">pets</span>
: Whether the child can live in a home with pets / animals. Allowed values are: `'Yes-must'`, `'Yes-can'`, `'No'`, `'Not known'`.

<span id="requirements-additionalSupport">additionalSupport</span>
: Additional support provision required. Multi-valued. Some allowed values are: `'Additional supervision'`, `'Therapeutic support'`, `'A worker for respite'`, `'Taxis to school'` etc.  See the [Support Type Taxonomy](/placements_standard#support-type-taxonomy).

<span id="requirements-additionalSupportOther">additionalSupportOther</span>
: Free-text descriptions when `additionalSupport` includes `'Other'`. Multi-valued. _String_.

<span id="requirements-deprivationOfLiberty">deprivationOfLiberty</span>
: Whether the child has a Deprivation of Liberty Order (DOL). _Boolean_.

#### Example

<div class="example">
  <h5 id="example-requirements">Example - PlacementRequirements</h5>
{% highlight json %}
{
  "@type": "PlacementRequirements",
  "communicationNeeds": "Not Specified",
  "homeAdaptationRequired": true,
  "specificCommunicationRequirement": ["ESOL"],
  "culturalNeeds": "Required",
  "livingCompanions": "Only With Other younger children",
  "pets": "No",
  "additionalSupport": ["TaxisToSchool"],
  "deprivationOfLiberty": true
}
{% endhighlight %}
</div>

<div class="note">
  <h5 id="note-requirements">Note - "Other" pairings</h5>
  <p>Each controlled-vocab field that exposes an "Other" option is paired with a multi-valued free-text property: <code>cn:Other</code> ↔ <code>specificCommunicationRequirementOther</code>, <code>cln:Other</code> ↔ <code>culturalNeedsOther</code>, <code>st:Other</code> ↔ <code>additionalSupportOther</code>. Whenever the "Other" concept is selected, the paired free-text property must be provided. See <a href="/assets/shacl/examples/valid-other-options.jsonld"><code>assets/shacl/examples/valid-other-options.jsonld</code></a>.</p>
</div>


### PlacementRecommendation

The social worker's judgement of how suitable each placement category (foster, residential, supported accommodation) is for the child.

#### Properties

<span id="recommendation-fosterCareSuitability">fosterCareSuitability</span>
: Is foster care the most preferred home for the child as deemed by the SW? Allowed values are: `'Preferred'`, `'Suitable but not preferred'`, `'Unsuitable'`, `'Not specified'`.

<span id="recommendation-residentialCareSuitability">residentialCareSuitability</span>
: Is residential care the most preferred home for the child as deemed by the SW? Allowed values are: `'Preferred'`, `'Suitable but not preferred'`, `'Unsuitable'`, `'Not specified'`.

<span id="recommendation-supportedAccommodationSuitability">supportedAccommodationSuitability</span>
: Is supported home care the most preferred home for the child as deemed by the SW? Allowed values are: `'Preferred'`, `'Suitable but not preferred'`, `'Unsuitable'`, `'Not specified'`.

#### Example

<div class="example">
  <h5 id="example-recommendation">Example - PlacementRecommendation</h5>
{% highlight json %}
{
  "@type": "PlacementRecommendation",
  "fosterCareSuitability": "Preferred",
  "residentialCareSuitability": "Suitable but not preferred",
  "supportedAccommodationSuitability": "Unsuitable"
}
{% endhighlight %}
</div>


### RiskAssessment

Records the risks the child is exposed to (six categories) and the risks the child poses to others or property (five categories). Each risk is recorded as `No known risk` or `Risk present`. The QA sheet requires every risk category to be populated even when the value is "No known risk".

#### Properties

##### Risks to the child

<span id="risk-riskSelfHarm">riskSelfHarm</span>
: Risk of self-harm. Allowed values are: `'No known risk'`, `'Risk Present'`.

<span id="risk-riskCriminalExploitation">riskCriminalExploitation</span>
: Risk of criminal exploitation. Allowed values are: `'No known risk'`, `'Risk Present'`.

<span id="risk-riskDrugAlcohol">riskDrugAlcohol</span>
: Risk of drug and alcohol use. Allowed values are: `'No known risk'`, `'Risk Present'`.

<span id="risk-riskEatingDisorder">riskEatingDisorder</span>
: Risk of an eating disorder. Allowed values are: `'No known risk'`, `'Risk Present'`.

<span id="risk-riskMissing">riskMissing</span>
: Risk of going missing. Allowed values are: `'No known risk'`, `'Risk Present'`.

<span id="risk-riskSexualExploitation">riskSexualExploitation</span>
: Risk of sexual exploitation.

##### Risks to others or property

<span id="risk-riskToOthersPhysical">riskToOthersPhysical</span>
: Risk of physical harm to others. Allowed values are: `'No known risk'`, `'Risk Present'`.

<span id="risk-riskToOthersSexual">riskToOthersSexual</span>
: Risk of sexual harm to others. Allowed values are: `'No known risk'`, `'Risk Present'`.

<span id="risk-riskToOthersFire">riskToOthersFire</span>
: Risk of fire-setting. Allowed values are: `'No known risk'`, `'Risk Present'`.

<span id="risk-riskToOthersAnimals">riskToOthersAnimals</span>
: Risk of harm to animals. Allowed values are: `'No known risk'`, `'Risk Present'`.

<span id="risk-riskToOthersCriminal">riskToOthersCriminal</span>
: Risk of criminal exploitation for others in the home. Allowed values are: `'No known risk'`, `'Risk Present'`.

##### Free-text catch-alls

<span id="risk-riskOther">riskOther</span>
: Free-text description of any other risks the child is exposed to that are not captured by the standard risk fields. Multi-valued. _String_.

<span id="risk-riskToOthersOther">riskToOthersOther</span>
: Free-text description of any other risks to others or property. Multi-valued. _String_.

#### Example

<div class="example">
  <h5 id="example-risk">Example - RiskAssessment</h5>
{% highlight json %}
{
  "@type": "RiskAssessment",
  "riskSelfHarm":             "Risk Present",
  "riskCriminalExploitation": "No known risk",
  "riskDrugAlcohol":          "No known risk",
  "riskEatingDisorder":       "No known risk",
  "riskMissing":              "Risk Present",
  "riskSexualExploitation":   "No known risk",
  "riskToOthersPhysical":     "No known risk",
  "riskToOthersSexual":       "No known risk",
  "riskToOthersFire":         "No known risk",
  "riskToOthersAnimals":      "No known risk",
  "riskToOthersCriminal":     "No known risk",
  "riskToOthersOther": [
    "Verbal aggression toward staff during transitions"
  ]
}
{% endhighlight %}
</div>


### ActualPlacement

The placement that was actually arranged. Optional - a `Placement` may not (yet) have an `ActualPlacement`. Captures the type of placement, provider, location, sibling co-placement, education continuity and weekly cost (with an optional breakdown into core / additional-support / education / other components).

#### Properties

<span id="actual-coreWeeklyCost">coreWeeklyCost</span>
: What is the total weekly core cost of the placement?

The basic price quoted by a provider to deliver the service outlined within their Statement of Purpose.

This should not include any additional costs incurred to meet the specific needs of an individual child or young person. Optional. _Integer_.

<span id="actual-additionalSupportWeeklyCost">additionalSupportWeeklyCost</span>
: What is the total weekly additional support cost of the placement?

Costs incurred over and above the core cost to meet the specific and potentially changing needs of a child or young person.

These may include: Increased staff ratios (e.g. 1:1 or 2:1 support) during the day or overnight; Additional staffing such as sleep-in staff or waking night staff; Bed blocking arrangements; Transport provision beyond what is included in the core contract; Therapy commissioned specifically for a child, which is not part of the standard provision within the home; Tutoring outside a formal education placement, often temporary until a registered school placement is secured; Any other cost not routinely covered within the core placement cost that the local authority agrees to fund to meet the child’s needs. Optional. _Integer_.

<span id="actual-educationWeeklyCost">educationWeeklyCost</span>
: What is the total weekly education cost of the placement?

This should be recorded when the placement includes both care and registered education provision. Optional. _Integer_.

<span id="actual-otherWeeklyCost">otherWeeklyCost</span>
: Any weekly placement costs that do not clearly fall within the core, additional-support or education categories. Optional. _Integer_.

<span id="actual-totalWeeklyCost">totalWeeklyCost</span>
: Total weekly cost (actual weekly fee paid)

What is the total weekly fee associated with the placement? (excluding VAT). _Integer_.

<span id="actual-placementLocation">placementLocation</span>
: First 3-4 characters of the postcode for the actual placement location (e.g. `TA3`, `BS10`). Captured in addition to the provider URN to ensure location is recorded for non-registered placements. _String_.

<span id="actual-isLocationPreferred">isLocationPreferred</span>
: Whether the actual placement location was a preferred location. _Boolean_.

<span id="actual-isEducationContinuous">isEducationContinuous</span>
: Was child's education disrupted as a result of this placement? _Boolean_.

<span id="actual-providerURN">providerURN</span>
: Provider URN linked to Ofsted registration. _String_.

<span id="actual-siblingsPlacedTogether">siblingsPlacedTogether</span>
: How many siblings were actually placed together. _Integer_.

<span id="actual-placementType">placementType</span>
: Record the type of placement the child received either foster, residential or supported accommodation. See the [Placement Type Taxonomy](/placements_standard#placement-type-taxonomy).

#### Example

<div class="example">
  <h5 id="example-actual">Example - ActualPlacement</h5>
{% highlight json %}
{
  "@type": "ActualPlacement",
  "coreWeeklyCost":              2500.00,
  "additionalSupportWeeklyCost": 1500.00,
  "educationWeeklyCost":            0.00,
  "otherWeeklyCost":              500.00,
  "totalWeeklyCost":             4500.00,
  "placementLocation": "N18",
  "isLocationPreferred": true,
  "isEducationContinuous": false,
  "providerURN": "ABCD10293002",
  "siblingsPlacedTogether": 1,
  "placementType": "Residential",
}
{% endhighlight %}
</div>

<div class="note">
  <h5 id="note-actual">Note - cost sense-check</h5>
  <p>The SHACL shape flags <code>totalWeeklyCost</code> outside the £100 - £100,000 range as a Warning (not a hard violation), per the QA sheet's "&lt;£100 or &gt;£100,000 likely incorrect" sense-check. Each cost-breakdown component must be non-negative when supplied.</p>
</div>


### QualityAssurance

LA-internal metadata about who recorded each part of the placement record (referral, placement, cost) and when. Supports LA-internal review of data-entry practices; not intended to be shared beyond the recording LA.

#### Properties

<span id="qa-referralOfficerName">referralOfficerName</span>
: Name of officer recording information related to the referral. Optional. _String_.

<span id="qa-referralDate">referralDate</span>
: Date the referral data was captured. Optional. _Date_.

<span id="qa-placementOfficerName">placementOfficerName</span>
: Name of the officer who recorded the actual placement information. Optional. _String_.

<span id="qa-placementDate">placementDate</span>
: Date the actual placement data was captured. Optional. _Date_.

<span id="qa-costOfficerName">costOfficerName</span>
: Name of the officer who recorded the placement cost data. Optional. _String_.

<span id="qa-costDate">costDate</span>
: Date the placement cost data was captured. Optional. _Date_.

#### Example

<div class="example">
  <h5 id="example-qa">Example - QualityAssurance</h5>
{% highlight json %}
{
  "@type": "QualityAssurance",
  "referralOfficerName":  "Alex Brown",
  "referralDate":         "2024-02-12",
  "placementOfficerName": "Beth Green",
  "placementDate":        "2024-03-21",
  "costOfficerName":      "Casey White",
  "costDate":             "2024-03-25"
}
{% endhighlight %}
</div>

## Ontology

The ontology for this specification is defined in Turtle format and is available at: [ontology.ttl](/assets/ttl/ontology.ttl).

## Taxonomies

The model is parameterised by six SKOS controlled vocabularies. Selecting `Other` from any vocabulary that exposes it triggers the matching free-text companion property on the parent entity.

### Communication Need Taxonomy

Specific communication and language requirements a child may have. Multi-valued: enter all that apply, or `None` if not applicable. Selecting `Other` triggers the paired free-text property `specificCommunicationRequirementOther` on `PlacementRequirements`.

* `ESOL`: English for Speakers of Other Languages. English-language support is required.
* `BSL`: British Sign Language is required.
* `Makaton`: Makaton signing or symbol communication is required.
* `Other`: Another communication or language requirement not listed. Supply details via `specificCommunicationRequirementOther`.
* `None`: No specific communication or language requirements.

Source vocabulary: [taxonomy-communication-need.ttl](/assets/ttl/taxonomy-communication-need.ttl). Used by `specificCommunicationRequirement` on [PlacementRequirements](/placements_standard#placementrequirements).

### Living Arrangement Taxonomy

Recommendations for who the child can be cared for alongside in a placement.

* `Solo placement recommended`: A solo placement is recommended; the child should not live with other children.
* `With other children recommended`: Living with other children is recommended.
* `Only with other older children`: The child should only live with other children who are older.
* `Only with other younger children`: The child should only live with other children who are younger.
* `No preference`: No preference about who the child lives alongside.

Source vocabulary: [taxonomy-living-arrangement.ttl](/assets/ttl/taxonomy-living-arrangement.ttl). Used by `livingCompanions` on [PlacementRequirements](/placements_standard#placementrequirements).

### Out of LA Reason Taxonomy

The reason why the preferred placement location is in a different LA than the placing LA. Used on `PlacementAvailability` when `isPreferredLocationLocal` is `false`. Selecting `Other` triggers the paired free-text property `outOfLAReasonOther`.

* `Safeguarding concerns`: Placement is sought outside the placing LA due to safeguarding concerns.
* `Bail conditions`: Placement is sought outside the placing LA because of bail conditions.
* `Court order`: Placement is sought outside the placing LA because of a court order.
* `Other`: Another reason not listed. Supply details via `outOfLAReasonOther`.

Source vocabulary: [taxonomy-outof-la-reason.ttl](/assets/ttl/taxonomy-outof-la-reason.ttl). Used by `outOfLAReason` on [PlacementAvailability](/placements_standard#placementavailability).

### Placement Type Taxonomy

The type of placement the child receives.

* `Foster`: A placement with an approved foster carer.
* `Residential`: A placement in a residential children's home.
* `Supported Accommodation`: A supported accommodation placement, typically for older young people.

Source vocabulary: [taxonomy-placement-type.ttl](/assets/ttl/taxonomy-placement-type.ttl). Used by `placementType` on [ActualPlacement](/placements_standard#actualplacement).

### Placement Urgency Taxonomy

How urgently the child needs to be placed. Captures urgency rather than an absolute date, as deep-dive participants felt "date placement required by" was too subjective.

* `Today`: Placement is needed today.
* `< 5 days`: Placement is needed within five days.
* `> 5 days`: Placement is needed in more than five days.

Source vocabulary: [taxonomy-placement-urgency.ttl](/assets/ttl/taxonomy-placement-urgency.ttl). Used by `neededBy` on [PlacementAvailability](/placements_standard#placementavailability).

### Support Type Taxonomy

Additional support provision required alongside a placement. Multi-valued: select all that apply. Selecting `Other` triggers the paired free-text property `additionalSupportOther` on `PlacementRequirements`.

* `Additional supervision`: Additional supervision is required.
* `Therapeutic support`: Therapeutic support is required.
* `A worker for respite`: A worker is required to provide respite.
* `Taxis to school`: Taxis to and from school are required.
* `NA`: Not applicable; no additional support is required.
* `Other`: Other additional support is required. Supply details via `additionalSupportOther`.

Source vocabulary: [taxonomy-support-type.ttl](/assets/ttl/taxonomy-support-type.ttl). Used by `additionalSupport` on [PlacementRequirements](/placements_standard#placementrequirements).

## Validation

A [SHACL shape](/assets/shacl/shacl-shape.ttl) encodes:

- structural cardinality (mirroring the OWL restrictions in [ontology.ttl](/assets/ttl/ontology.ttl)),
- controlled-vocabulary enforcement (`sh:in` over each SKOS scheme),
- pattern checks (UK postcode prefix on `placementLocation`),
- conditional checks for the `Other` vocab pairings,
- and severity-`Warning` cost sense-checks.

A small Node.js [validator](/assets/shacl/validation) loads the shape and example records, applies the [JSON-LD context file](/assets/shacl/context.jsonld), runs SHACL via [`rdf-validate-shacl`](https://www.npmjs.com/package/rdf-validate-shacl), and additionally performs a cross-record duplicate `childId` check that SHACL Core cannot express.

## Standard Placement Reporting Spreadsheet

Use the standard spreadsheet template for reporting placements data:

[National Placement Standard spreadsheet (April 2026, v2)](/assets/spreadsheet/20260427_National-Placement-Standard-Excel-April-2026_v2.xlsx)

</article>
