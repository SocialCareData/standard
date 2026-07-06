---
title: Multi-agency Notifications
breadcrumbs:
  - title: Use Cases
    url: /use_cases
tags:
  - MAIS
  - Use Case
reference: UC10
---



<nav class="toc numbered-toc">
<h2 id="table-of-contents">Table of Contents</h2>

1. TOC
{:toc}

</nav>

<article class="numbered-headings">


## Summary

As a social worker/assessor, I need to be notified of important events regarding the people I am supporting, so that I can make decisions about their care and provide the best outcomes based on the most up-to-date information.


## User stories

* **Safeguarding notifications**
  * As another agency (e.g. police force, education) I need to share information regarding key events with a local authority to fulfil my statutory safeguarding responsibilities
  * As a social worker, I need to be notified when a certain combination of statuses in a case are met so that I can intervene effectively
* **Notifications between secondary care and social care**
  * As an adult’s social work assessor, I need to be notified of important events e.g. admission to or discharge from hospital so I can coordinate timely assessments and care, pause or restart care packages and update care providers
  * As a hospital discharge coordinator, I need to notify social care of a planned discharge date and receive confirmation of receipt of the referral, so that the right level of care can be arranged without delays
  * As a care worker in a care home, I need to be notified of important events (e.g. discharge from hospital, safeguarding, risks) of residents so I am able to support their transition between settings.


## Description

Social care practitioners should receive notifications from health, care providers, emergency services, housing, education, and voluntary sector partners when significant events occur that affect a person’s safety, wellbeing, or support needs. These events may include hospital admissions and discharges, safeguarding incidents, changes in mental health, provider care concerns, or a combination of statuses that raise safeguarding risk e.g. missed visits or appointments.

### Primary challenge

* In both adults’ and children’s services, social workers rely on these notifications to take coordinated action-such as pausing or restarting care packages, reassessing needs, updating care plans, and safeguarding interventions.
* Today, these notifications are often fragmented, delayed, or shared manually (e.g., phone, email, PDF), creating risks, duplication, delays and gaps in care.
* A consistent, interoperable approach to multi-agency notifications would ensure the right information reaches the right professionals at the right time, supporting early intervention, safeguarding, continuity of care, and better outcomes for children, young people, and adults.
* There have been some attempts to tackle this; however, they often only cover certain cohorts, or require extensive manual input/review, causing delays, multiple notifications for same issue
  * E.g. for hospital discharge:
    * Solutions do exist from the CMS suppliers e.g. [Mosaic x Nottinghamshire](https://www.hssib.org.uk/patient-safety-investigations/workforce-and-patient-safety/fifth-investigation-report/#23-sending-the-information)
    * MESH – national secure messaging service
  * E.g. for policing notifications to education – Ops Encompass

### Opportunity

* Define a standard notification dataset and approach so key events can be shared consistently between agencies and social care systems.
* Build on existing standards and infrastructure where relevant, including person, organisation, service, event and information governance standards.
* Enable timely, automated alerts for priority scenarios such as safeguarding concerns, hospital admissions/discharges and provider concerns, reducing reliance on manual emails, calls and PDFs.
* Support safer, more coordinated decision-making by helping practitioners see the right information at the right time

### Care record components

A Care Record Component is a distinct unit of information that could be captured within the Case Management System (CMS). These components range from the structural entities required to safely manage a case to the person-centred details that form a holistic view of an individual's life and journey. Relevant care record components for this use case include:

* Person information
* Event details e.g. type, date/time
* Agency (sender) information
* Care context e.g. current care package
* Alerts

### Benefits

Improved multiagency notifications would help to:

* Safeguard children, young people, and adults by ensuring timely awareness of risk, harm, or changes in circumstances.
* Enable early intervention and prevention by identifying emerging risks sooner.
* Improve safety and timeliness of care by giving social workers visibility of relevant health and provider information when they need it.
* Ensure continuity of care, particularly during unplanned events such as hospital admissions or changes in mental health.


## Additional sources

* [Child Protection - Information Sharing (CP-IS) service - NHS England Digital](https://digital.nhs.uk/services/child-protection-information-sharing-service)
* [Home : Operation Encompass](https://www.operationencompass.org/)
* [https://hact.org.uk/tools-and-services/uk-housing-data-standards/](https://hact.org.uk/tools-and-services/uk-housing-data-standards/)

### Hospital discharge

* [https://www.gov.uk/government/publications/hospital-discharge-and-community-support-guidance/hospital-discharge-and-community-support-guidance](https://www.gov.uk/government/publications/hospital-discharge-and-community-support-guidance/hospital-discharge-and-community-support-guidance)
* [https://theprsb.org/standards/hospitalrefferalforassessmenforcommunitycare/](https://theprsb.org/standards/hospitalrefferalforassessmenforcommunitycare/)
* [https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/scci2075-assessment-discharge-and-withdrawal-notices-between-hospitals-and-social-services/](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/scci2075-assessment-discharge-and-withdrawal-notices-between-hospitals-and-social-services/)
* [https://www.hssib.org.uk/patient-safety-investigations/workforce-and-patient-safety/fifth-investigation-report/#23-sending-the-information](https://www.hssib.org.uk/patient-safety-investigations/workforce-and-patient-safety/fifth-investigation-report/#23-sending-the-information)
* [https://www.theaccessgroup.com/en-gb/health-social-care/health-and-support-case-studies/local-government-related-case-studies/nottinghamshire-county-council/](https://www.theaccessgroup.com/en-gb/health-social-care/health-and-support-case-studies/local-government-related-case-studies/nottinghamshire-county-council/)


## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+Multi-agency+Notifications+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.


## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+Multi-agency+Notifications+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.
