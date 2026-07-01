---
title: Transition from Children’s Social Care to Adult Social Care
breadcrumbs:
  - title: Use Cases
    url: /use_cases
tags:
  - MAIS
  - Use Case
reference: UC08
---



<nav class="toc numbered-toc">
<h2 id="table-of-contents">Table of Contents</h2>

1. TOC
{:toc}

</nav>

<article class="numbered-headings">

Identifier: `UC08`
{: style="color: #888888; font-size: 0.9em; margin-top: 5px;"}

## Summary

As an adult social worker or transitions manager, I can receive, track, and act on information about young people transitioning from children’s to adult services, so that their care is continuous, assessments are timely, and support plans are appropriate when they reach adulthood.

## Description

The Care Act provides a framework for LA’s to support children transitioning to adulthood.  Young people approaching adulthood may require ongoing care and support needs.  There is a transfer of responsibility from children’s services to adult’s services once a young person turns 18. This process often begins from around age 14 (differs with LA) and may involve a dedicated transitions team (not all local authorities have these).

* Transitions may involve multiple actors: children’s social workers, transitions managers, adult social workers, occupational therapists, education staff, housing and care providers. Not all local authorities have dedicated transitions teams; practices vary widely.

* The workflow is often managed via Case Management Systems (CMS) in both CSC and ASC, but not all fields or data are automatically shared across systems.

* Panels may be held to review eligibility and coordinate transition plans.

* Outcomes include determining adult care eligibility, planning support, and ensuring continuity of care aligned with the Children & family’s assessment and EHCP.

* CSC operates in a context where services are typically free at the point of delivery, with statutory eligibility based on safeguarding and children’s welfare.

* ASC operates in a context where services may be means-tested, optional/voluntary, or require a personal budget and financial assessment. This introduces additional complexity in transition planning and data requirements

This use case ensures that transition information is accurate, timely, and complete, reducing duplication or delay the development of needs for care and support and gaps in service.

### The Challenge / Opportunity

**Primary Challenge**

Service context:

* Delays or gaps in data handover can directly impact safeguarding, care continuity, and outcomes for young people. 
* Social workers may not automatically share relevant fields from a child’s records to an adult’s record which then requires manual re-keying, increasing administrative burden and the risk of missing critical data
* While there are transition integrations, these are not always reliable, and sharing information between different agencies using different systems can be challenging
* CLD data is often incomplete due to inconsistent recording and sharing of information locally; missing data on adults’ CMS

**Opportunity**

The standards programme could:

* Improve consistent recording of transition activity: create common definitions and fields so local authorities can identify, code and track young people in transition more reliably.
* Support interoperability between CSC and ASC systems: enable structured information exchange between case management systems, reducing manual re-keying, document chasing and inconsistent transfer of records.
* Define a minimum transition dataset: set out the core information that should be captured and shared between children’s and adults’ services, including needs, risks, current plans, key professionals, transition milestones and agreed next steps.
* Strengthen proportionate information sharing: clarify what information should be shared, when, with whom and for what purpose to support timely assessment, planning and safeguarding.
* Improve oversight and reporting: support better local monitoring of transition progress and improve the quality of data available for CLD and national analysis.

However, it is important to note that some transition problems relate to local practice, including whether planning starts early enough, how well children’s and adults’ teams work together, and whether young people and families receive a clear, coordinated handover. Standards cannot resolve these issues on their own. However, they could support better practice by making transition activity easier to identify, record, share and monitor across children’s and adults’ services.

### Care Record Components

A Care Record Component is a distinct unit of information that could be captured within the Case Management System (CMS). These components range from the structural entities required to safely manage a case to the person-centred details that form a holistic view of an individual's life and journey. Relevant care record components for this use case include:

* Demographics, IDs, contact information
* Children’s Social Care Information: Current CSC plan (CIN, CP, LAC), key risks, safeguarding history, multi-agency involvement.
* SEND / Education Information e.g. EHCP details etc.
* Health Information: Diagnoses, therapy involvement, long-term conditions, mental health etc.
* Preparing for Adulthood Indicators
* Transition Planning Data: Panel decisions, agreed next steps, agencies involved, timelines, contact points.
* Care Act Assessment and care planning data
* Financial & Funding Information

### Benefits

* Ensure continuity of care from childhood to adulthood.
* Provide timely, accurate information to adult social workers to reduce delays or duplication to ensure children transition successfully to adulthood.
* Enable assessment and care planning for adult services to be appropriate to individual needs.
* Support multi-agency collaboration, including health, education, and providers.
* Ensure compliance with statutory duties under the Care Act 2014 (for ASC) and relevant children’s social care legislation.
* Contribute to structured, interoperable datasets for local and national analysis.

These benefits depend on standards being implemented alongside effective local transition practice, clear governance and appropriate information-sharing arrangements.

## Additional Sources

**Guidance **

* [https://www.nhs.uk/social-care-and-support/caring-for-children-and-young-people/moving-from-childrens-social-care-to-adults-social-care/](https://www.nhs.uk/social-care-and-support/caring-for-children-and-young-people/moving-from-childrens-social-care-to-adults-social-care/)  
* [https://councilfordisabledchildren.org.uk/sites/default/files/uploads/attachments/the%20Local%20Offer.pdf](https://councilfordisabledchildren.org.uk/sites/default/files/uploads/attachments/the%20Local%20Offer.pdf)  
* [https://www.nice.org.uk/guidance/qs140](https://www.nice.org.uk/guidance/qs140)  
* [https://www.nice.org.uk/guidance/ng43/evidence/full-guideline-pdf-2360240173](https://www.nice.org.uk/guidance/ng43/evidence/full-guideline-pdf-2360240173)  
* [https://www.adass.org.uk/wp-content/uploads/2025/01/IMPOWER-ADASS-Preparing-for-Adulthood-Report-2024.pdf](https://www.adass.org.uk/wp-content/uploads/2025/01/IMPOWER-ADASS-Preparing-for-Adulthood-Report-2024.pdf)
* Local Government Association: [Guidance on supporting young people in transition](https://www.local.gov.uk/our-support/children-and-young-people/transitions-adulthood)

**Additional context **

* [https://www.adass.org.uk/resources/transitional-safeguarding-briefing/](https://www.adass.org.uk/resources/transitional-safeguarding-briefing/)  
* [https://www.gov.uk/government/news/longstanding-weaknesses-across-send-system-impacting-on-young-peoples-transition-to-adulthood](https://www.gov.uk/government/news/longstanding-weaknesses-across-send-system-impacting-on-young-peoples-transition-to-adulthood)

## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+Transition+from+CSC+to+ASC+Record+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+Transition+from+CSC+to+ASC+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.
