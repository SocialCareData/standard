---
title: Transition from Children’s Social Care to Adult Social Care
breadcrumbs:
  - title: Use Cases
    url: /use_cases
---



<nav class="toc numbered-toc">
<h2 id="table-of-contents">Table of Contents</h2>

1. TOC
{:toc}

</nav>

<article class="numbered-headings">

Identifier: `8`
{: style="color: #888888; font-size: 0.85em; margin-top: 5px;"}

## Summary

As an adult social worker or transitions manager, I can receive, track, and act on information about young people transitioning from children’s to adult services, so that their care is continuous, assessments are timely, and support plans are appropriate when they reach adulthood.

## Description

The Care Act provides a framework for LA’s to support children transitioning to adulthood.  Young people approaching adulthood may require ongoing care and support needs.  Transitioning from Children’s Social Care (CSC) to Adult Social Care (ASC) must ensure i.e. there is a transfer of responsibility from children’s services to adult’s services once a young person turns 18. This process often begins from around age 14 (differs with LA) and may involve a dedicated transitions team (not all local authorities have these).

Key points:

- Transitions may involve multiple actors: children’s social workers, transitions managers, adult social workers, occupational therapists, education staff, housing and care providers.
- The workflow is often managed via Case Management Systems (CMS) in both CSC and ASC, but not all fields or data are automatically shared across systems.
- Panels may be held to review eligibility and coordinate transition plans.
- Outcomes include determining adult care eligibility, planning support, and ensuring continuity of care aligned with the Children & family’s assessment and EHCP.

This use case ensures that transition information is accurate, timely, and complete, reducing duplication or delay the development of needs for care and support and gaps in service.

### Data

- Demographics, IDs, contact information
- Children’s Social Care Information: Current CSC plan (CIN, CP, LAC), key risks, safeguarding history, multi-agency involvement.
- SEND / Education Information e.g. EHCP details etc.
- Health Information: Diagnoses, therapy involvement, long-term conditions, mental health etc.
- Preparing for Adulthood Indicators
- Transition Planning Data: Panel decisions, agreed next steps, agencies involved, timelines, contact points.
- Care Act Assessment and care planning data
- Financial & Funding Information

### Goal/Purpose

- Ensure continuity of care from childhood to adulthood.
- Provide timely, accurate information to adult social workers to reduce delays or duplication to ensure children transition successfully to adulthood.
- Enable assessment and care planning for adult services to be appropriate to individual needs.
- Support multi-agency collaboration, including health, education, and providers.
- Ensure compliance with statutory duties under the Care Act 2014 (for ASC) and relevant children’s social care legislation.
- Contribute to structured, interoperable datasets for local and national analysis.

### Processes

- Young person identified as approaching adulthood and potential need for adult services.
- Children’s social worker flags case to transitions/ASC team.
- Transitions team records information in ASC CMS, tracks referral, and initiates preparing for adulthood panel.
- Panel reviews eligibility, identifies risks, and coordinates multi-agency input.
- If eligible, adult social worker is assigned. Relevant data from CSC CMS is reviewed and manually or automatically migrated to ASC CMS.
- Adult social worker conducts or completes assessment of needs in ASC CMS.
- Care plan and personal budget agreed; support begins at age 18 (or earlier if appropriate).
- Transitions team continues to monitor and update records as necessary.

## Landscape Review

Service context:

- Not all local authorities have dedicated transitions teams; practices vary widely.
- CSC operates in a context where services are typically free at the point of delivery, with statutory eligibility based on safeguarding and children’s welfare.
- ASC operates in a context where services may be means-tested, optional/voluntary, or require a personal budget and financial assessment. This introduces additional complexity in transition planning and data requirements.
- Delays or gaps in data handover can directly impact safeguarding, care continuity, and outcomes for young people. 
- While the primary actors are CSC and ASC social workers and transition managers, other teams (e.g., SEND teams, brokerage, occupational therapy) may also contribute data or planning.

CMS context: 

- Current CMSs may not automatically share relevant fields from a child’s records which then requires manual re-keying, increasing administrative burden and the risk of missing critical data. 
- The main CMS suppliers do have transitions integrations (Mosaic offer easy transition if both CSC and ASC use Mosaic; Liquidlogic operate on different versions presenting its own implications) but they are unreliable. A transitions manager: "2 years ago we lost 20 referrals and did not know why. When CYP start the transition process, and it fails, the system does not notify us"
- Some LAs will have different CMS suppliers for adult’s and children’s. Where they have the same supplier, they can still have interoperability challenges.  
- Suppliers don’t integrate with Education resulting on SEN information not always available

National guidance and reporting:

- National guidance (e.g., ADASS “Preparing for Adulthood Report 2024”) highlights the importance of early identification, multi-agency coordination, and structured planning.
- The team responsible for the CLD collection at DHSC noted that data is incomplete, due to:
  - Inconsistent recording and sharing of information locally between children’s, transitions, and adults’ teams
  - Missing data on the adults’ CMS
  - Information not extracted/submitted to CLD because it’s considered out of scope (e.g., some pre-18 activity may be reasonably interpreted as excluded)
- There is likely to be new practice guidance developed by government (TBC)

## Out of Scope

## Open Questions

- What level of automated data transfer between CSC and ASC is feasible/ desirable?
- How should data from other agencies (health, education, providers) be represented?

## Additional Sources

**Guidance **

[https://www.nhs.uk/social-care-and-support/caring-for-children-and-young-people/moving-from-childrens-social-care-to-adults-social-care/](https://www.nhs.uk/social-care-and-support/caring-for-children-and-young-people/moving-from-childrens-social-care-to-adults-social-care/)  

[https://councilfordisabledchildren.org.uk/sites/default/files/uploads/attachments/the%20Local%20Offer.pdf](https://councilfordisabledchildren.org.uk/sites/default/files/uploads/attachments/the%20Local%20Offer.pdf)  

[https://www.nice.org.uk/guidance/qs140](https://www.nice.org.uk/guidance/qs140)  

[https://www.nice.org.uk/guidance/ng43/evidence/full-guideline-pdf-2360240173](https://www.nice.org.uk/guidance/ng43/evidence/full-guideline-pdf-2360240173)  

[https://www.adass.org.uk/wp-content/uploads/2025/01/IMPOWER-ADASS-Preparing-for-Adulthood-Report-2024.pdf](https://www.adass.org.uk/wp-content/uploads/2025/01/IMPOWER-ADASS-Preparing-for-Adulthood-Report-2024.pdf)

Local Government Association: [Guidance on supporting young people in transition](https://www.local.gov.uk/our-support/children-and-young-people/transitions-adulthood)

**Additional context **

[https://www.adass.org.uk/resources/transitional-safeguarding-briefing/](https://www.adass.org.uk/resources/transitional-safeguarding-briefing/)  

[https://www.gov.uk/government/news/longstanding-weaknesses-across-send-system-impacting-on-young-peoples-transition-to-adulthood](https://www.gov.uk/government/news/longstanding-weaknesses-across-send-system-impacting-on-young-peoples-transition-to-adulthood)

## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+Transition+from+CSC+to+ASC+Record+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+Transition+from+CSC+to+ASC+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.
