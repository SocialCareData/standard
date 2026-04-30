---
permalink: /placements/vocab/outof-la-reason
layout: default
title: Out of LA Reason Taxonomy
breadcrumbs:
  - title: "Placements Standard"
    url: /placements_standard
  - title: "Taxonomies"
    url: /placements_standard#taxonomies
---

## Terms

The reason why the preferred placement location is in a different LA than the placing LA. Used on `PlacementAvailability` when `isPreferredLocationLocal` is `false`. Selecting `Other` triggers the paired free-text property `outOfLAReasonOther`.

- Safeguarding concerns: Placement is sought outside the placing LA due to safeguarding concerns.
- Bail conditions: Placement is sought outside the placing LA because of bail conditions.
- Court order: Placement is sought outside the placing LA because of a court order.
- Other: Another reason not listed. Supply details via the paired `outOfLAReasonOther` free-text property.

## See also

- Source vocabulary: [`vocab/outof-la-reason.ttl`](https://github.com/SocialCareData/data-model/blob/main/ontology/placements/vocab/outof-la-reason.ttl)
- Property: [`outOfLAReason`](/placements_standard#availability-outoflareason) on [`PlacementAvailability`](/placements_standard#placementavailability).
