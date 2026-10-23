---
layout: use-case
title: "How our standards could support neighbourhood health"
description: Use case outlining how our standards support neighbourhood health priorities
breadcrumbs:
  - Use Cases
tags:
  - MAIS
  - Use Case
reference: UC15
---

The 10-Year Health Plan sets out three shifts: from hospital to community, from analogue to digital, and from sickness to prevention. All three depend on neighbourhood teams being able to use information across NHS, social care, local authority and voluntary sector services.

For neighbourhood health to succeed, interoperability will be critical. Our standards provide a route to this, offering a reusable foundation for identifying people consistently, recording service episodes, exchanging data between systems, and sharing care needs assessments and care plans. They have been designed to be interoperable with and build upon NHS standards including FHIR and the NHS number. Our standards could also support the planned Single Patient Record through providing more consistent social care data.

Neighbourhood Health requires a standards-based data exchange integrated system working across health and social care. The integration should reduce duplication, improve data quality, and ensure professionals have timely access to accurate information to support decision making across the Integrated Neighbourhood Teams.

## From hospital to community: standards facilitate joined-up care by improving information-sharing

Integrated Neighbourhood Teams will bring together specialists from local services to provide joined-up, person-centred care. 

To do this, they will need a shared, up-to-date view of the person, the professionals and services involved, and the person’s current needs, risks, assessments, plans and agreed outcomes. Different services will also need to add information to a person’s record and notify relevant partners about important events. 

Our standards could support this by making key information consistent and exchangeable, meaning that social care data can be consistently incorporated into care records and people do not have to repeat their story. This would improve their experience, improve safety and continuity of care and reduce unnecessary delays.

**What this could look like in practice:**

* A social care assessment and plan is shared with the hospital and neighbourhood health team. Social care is notified of a hospital admission and also notified before discharge, helping the team to coordinate the right support.
* When a person moves from short-term reablement to longer-term home care, the receiving service could access the relevant assessment and plan information. It could link this information to the correct person and reuse it appropriately, rather than asking staff to enter it again.
* A GP identifies a social care need during a visit to a neighbourhood health centre. Relevant information is shared with the social worker, so the person does not have to repeat their story.
* Before a home visit, a practitioner can see a current summary of the person’s service involvement, assessments and agreed outcomes. They can do this without having to spend extensive time searching for case notes, emailing other teams for information, or manually copying data.

More detail can be found in the following use cases:
* [Multi-agency Input into a Person’s Record](/UC11_multi_agency_input)
* [Multi-agency Notifications](/UC10_multi_agency_notifications)
* [Recording and Sharing Adult Social Care Needs Assessments and Care Plans
](/UC12_recording_and_sharing_care_needs_assessments_and_plans)

## From analogue to digital: standards enable improved digital record-keeping and use of AI tooling

Digital neighbourhood working requires information to be easy to record, find, share and reuse across organisations. 

Our standards will help information to be recorded in a consistent, structured form, exchanged securely and reused for authorised purposes. This could reduce manual searches, duplicate entry and parallel spreadsheets, making it easier for frontline staff to get a clear view of relevant history. Interoperability standards could also support the implementation of AI tooling, for example to enable automated transcription and summarisation. 

**What this could look like in practice:**

* A social care practitioner could use transcription to help draft case notes, check the output and spend more time with the person they are supporting. These can more easily be shared with partners due to our standards
* A service analyst receives more consistent data from social care and does not need to trawl through multiple spreadsheets to find the latest information. They use this for service planning, improvement and reporting, helping to identify social care demand in the local area.

More detail can be found in the following use cases:
* [Social Worker Recording](/UC02_social_worker_recording_data)
* [Sharing Care Summaries](/UC06_sharing_care_summaries)
* [Finding and Synthesising Information from the CMS](/UC03_finding_and_synthesising_information_from_the_cms)

## From sickness to prevention: standards enable a fuller picture of individual and population level needs, providing the opportunity for early intervention

Preventative neighbourhood working depends on teams recognising changing needs early, bringing the right partners together and acting before people reach crisis. By bringing together information held by different services, neighbourhood teams could identify people who may need extra support and respond before their needs escalate.

To do this successfully would require timely access to relevant information from across different authorised services, such as changes in support needs, new admissions, care plans, or safeguarding concerns. Our standards could make this information more consistent, securely shareable and usable. They could support both information sharing on request and proactive notifications when a significant event occurs. This needs to be done safely and securely, protecting privacy by design. Our standards support this by defining consistent data structures that allow systems to identify and share only the information needed for an authorised purpose, while applying appropriate access controls through our data sharing standard.

The same approach could support prevention at a population level. Local teams could use patterns in joined up health and social care data to understand where further preventative work is needed. 

**What this could look like in practice:**

* A neighbourhood team might identify a rise in urgent support following falls among people receiving care at home. It could then work with social care, primary care, housing and community partners to target falls-prevention support. The data would inform professional judgement; it would not predict risk or decide what action should be taken.

More detail can be found in the following use cases:

* [Multi-agency Notifications](/UC10_multi_agency_notifications)
* [Analysing Information from the CMS](/UC04_analysing_information_from_the_cms)
