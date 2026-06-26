---
title: Multi-agency Notifications
breadcrumbs:
  - title: Use Cases
    url: /use_cases
tags:
  - MAIS
  - Use Case
reference: UC11
---



<nav class="toc numbered-toc">
<h2 id="table-of-contents">Table of Contents</h2>

1. TOC
{:toc}

</nav>

<article class="numbered-headings">

Identifier: `UC11`
{: style="color: #888888; font-size: 0.9em; margin-top: 5px;"}

## Summary

**General:** As a social worker, I need to be notified of important events regarding the people I am supporting, so that I can make decisions about their care based on the most up-to-date information.

* Safeguarding notifications**
  * As another agency (e.g. police force, education) I need to share information regarding key events with a local authority to fulfil my statutory safeguarding responsibilities
  * As a social worker, I need to be notified when a certain combination of statuses in a case are met so that I can intervene effectively

* **Notifications between secondary care and social care**
  * As an adult’s social work assessor, I need to be notified of important events e.g. admission to or discharge from hospital so I can coordinate timely assessments and care, pause or restart care packages and update care providers
  * As a hospital discharge coordinator, I need to notify social care of a planned discharge date and receive confirmation of receipt of the referral, so that the right level of care can be arranged without delays
  * As a care worker in a care home, I need to be notified of important events (e.g. discharge from hospital, safeguarding) of residents so I am able to support their transition between settings.

## Description

Social care practitioners should receive notifications from health, care providers, emergency services, housing, education, and voluntary sector partners when significant events occur that affect a person’s safety, wellbeing, or support needs. These events may include hospital admissions and discharges, safeguarding incidents, changes in mental health, provider care concerns, or a combination of statuses that raise safeguarding risk e.g. missed visits or appointments.

In both adults’ and children’s services, social workers rely on these notifications to take coordinated action-such as pausing or restarting care packages, reassessing needs, updating care plans, and safeguarding interventions. Today, these notifications are often fragmented, delayed, or shared manually (e.g., phone, email, PDF), creating risks, duplication, delays and gaps in care.

A consistent, interoperable approach to multi-agency notifications would ensure the right information reaches the right professionals at the right time, supporting early intervention, safeguarding, continuity of care, and better outcomes for children, young people, and adults.

### Data

* Person information
* Event details e.g. type, date/time
* Agency (sender) information
* Care context e.g. current care package
* Action required

### Benefits/Goal/Value/Purpose

* To safeguard children, young people, and adults by ensuring timely awareness of risk, harm, or changes in circumstances.
* To enable early intervention and prevention by identifying emerging risks sooner.
* Improve safety and timeliness of care by giving social workers visibility of relevant health and provider information when they need it.
* To ensure continuity of care, particularly during unplanned events such as hospital admissions or changes in mental health.

### Processes

* A partner agency (hospital, provider, police, school, mental health service, VCS organisation) identifies a significant event.
* A notification is created, usually via: Email or secure email, Phone call, Provider portal, Hospital discharge system, Manual reports (PDF, Word documents)
* Practitioner receives the notification * sometimes centrally, sometimes directly.
* Practitioner reviews the information and checks existing records in CSC or ASC CMS.
* Practitioner takes action depending on the event e.g. pausing or reinstating care packages, alerting providers, updating care plans, conducting welfare checks, initiating safeguarding enquiries, reviewing risks and needs
* Updates are manually recorded in the CMS and communicated to relevant teams.
* Follow-up activity (reviews, assessments, joint visits) is scheduled as needed.

## Landscape Review

There have been some attempts to tackle this challenge, albeit in an incomplete way. For example, CPIS triggers notifications whenever a child who is open to social care is admitted to hospital - however, this is only for children who are under child protection plans or are looked after children, and there are other challenges with the system (i.e. ‘notification fatigue’, where social workers get multiple notifications for the same incident due to the child ‘touching’ many points of the health system and therefore triggering multiple notifications).

* Hospital discharge:
  * Solutions do exist from the CMS suppliers e.g. [Mosaic x Nottinghamshire](https://www.hssib.org.uk/patient-safety-investigations/workforce-and-patient-safety/fifth-investigation-report/#23-sending-the-information https://www.theaccessgroup.com/en-gb/health-social-care/health-and-support-case-studies/local-government-related-case-studies/nottinghamshire-county-council/)
  * MESH – national secure messaging service
  * PRSB standard (deprecated) [https://digital.nhs.uk/developer/api-catalogue/assessment-discharge-and-withdrawal-fhir](https://digital.nhs.uk/developer/api-catalogue/assessment-discharge-and-withdrawal-fhir)

Another good example is Op Encompass. Police forces sign up to notify educational settings when a child has been witness to a domestic violence incident at home within 48 hour. However, a safeguarding officer then has to review each incident, send this to the local authority who then need to work out which educational setting is attended by the young person. These manual processes can take time, leading to schools finding out long after the incident, at which point they are less able to act upon the information at the point where the young person was most vulnerable.

*Croydon have paid 720k for a 3 year contract with Patienteer (health integration service) to stop duplication; delays in discharge; e-mails exchanges; single version of the adult’s care; no more recording on spreadsheets for Reablement, however still need the vendor to redesign the API and feed the Assessment to this platform.*

## Out of Scope

* Information sharing guidance.

## Open Questions


## Additional Sources

* [Child Protection - Information Sharing (CP-IS) service - NHS England Digital](https://digital.nhs.uk/services/child-protection-information-sharing-service)
* [Home : Operation Encompass](https://www.operationencompass.org/)
* [https://hact.org.uk/tools-and-services/uk-housing-data-standards/](https://hact.org.uk/tools-and-services/uk-housing-data-standards/)

**Hospital discharge**

* [https://www.gov.uk/government/publications/hospital-discharge-and-community-support-guidance/hospital-discharge-and-community-support-guidance](https://www.gov.uk/government/publications/hospital-discharge-and-community-support-guidance/hospital-discharge-and-community-support-guidance)
* [https://theprsb.org/standards/hospitalrefferalforassessmenforcommunitycare/](https://theprsb.org/standards/hospitalrefferalforassessmenforcommunitycare/)
* [https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/scci2075-assessment-discharge-and-withdrawal-notices-between-hospitals-and-social-services/](https://digital.nhs.uk/data-and-information/information-standards/governance/latest-activity/standards-and-collections/scci2075-assessment-discharge-and-withdrawal-notices-between-hospitals-and-social-services/)
* [https://www.hssib.org.uk/patient-safety-investigations/workforce-and-patient-safety/fifth-investigation-report/#23-sending-the-information](https://www.hssib.org.uk/patient-safety-investigations/workforce-and-patient-safety/fifth-investigation-report/#23-sending-the-information)
* [https://www.theaccessgroup.com/en-gb/health-social-care/health-and-support-case-studies/local-government-related-case-studies/nottinghamshire-county-council/](https://www.theaccessgroup.com/en-gb/health-social-care/health-and-support-case-studies/local-government-related-case-studies/nottinghamshire-county-council/)

## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+Multi-agency+Notifications+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+Multi-agency+Notifications+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.
