---
title: Multi-agency Enquiries
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

Identifier: `UC10`
{: style="color: #888888; font-size: 0.9em; margin-top: 5px;"}

## Summary

**Overview:** accessing and understanding relevant information about an individual across agencies to support safe, timely, and well-coordinated decision-making

**Sub-use cases:**

* **Frontline practitioner enquiries when beginning work with an individual**
  * As a professional starting work directly with an individual, I want to know their history of involvement with professionals, including concerns, interventions, and outcomes.  This helps me plan my work with them and avoids them feeling they have to explain their story repeatedly.
  * As a professional starting work directly with an individual, I want to be able to contact other professionals who are currently supporting them or who have in the past.  This helps us co-ordinate our work and learn from each other.
  * As a MASH officer / social worker who has received a referral about a child, I want to be able to quickly find information about that child or their family members held by other professionals in order to triage and allocate them appropriately (allocation decision usually signed off by manager).

* **Safeguarding enquiries (use cases 10a/14 and 10b/15)**
  * As a social worker conducting safeguarding enquiries, I need the contact details of other professionals hold pertinent information about the subject so that I can coordinate information sharing and support to allow for effective analysis and decision making.
  * As the administrator of a social care CMS, I need to contribute records about which individuals we are (or have been) working with to the ‘Find a Record’ service, so that professionals in other organisations can rely on the responses they get from ‘Find a Record’.

 * **Enquiries for CSC statutory processes**
  * As a social work manager, I need to be able to read all information held by professionals about a child and their family to inform my decision whether to initiate a child protection investigation under CA s.47.
  * As a social worker conducting a s.47 investigation, I need to contact all other professionals involved with a family to invite them to share information and decision-making as a professional network.
  * As a social worker supporting a child under CA s.17 (Child in Need) I need to access information held by other professionals about the child, where the child’s parent or carer has consented to this information sharing.

 * **Enquiries for ASC assessment and care coordination**
  * As an ASC social worker, I need to gather up-to-date health and community health information, carer information and other information about a person relevant to complete a Care Act assessment including assessing their capacity and seeking information on legal orders.
  * As an ASC social worker, I need to see employment and benefits information from DWP so that I can understand their income and entitlements which determines how much the LA pays for the package of care.
  * As an ASC social worker, I need to see provider information e.g. Dols assessments; care plans, safeguarding information and outcomes so that I can review and adjust a person’s LA care plan.

## Description

Practitioners do not currently have a clear understanding of the work that is also going on with a child/family/adult with other agencies who might be working with that individual. All agencies use their own distinct computer systems and therefore have their own record of an individual held within these systems. Practitioners have to make individual enquiries to different agencies.

Typical enquiries may involve contacting health services, education providers, care providers, finance teams, housing departments, voluntary organisations, the police, or other local authority teams. Information is often requested manually via email, phone, or shared documents, and responses vary in speed, format, and completeness.

As a result, it is difficult to get a clear view of who else is working with a child/family/individual, meaning practitioners waste time in trying to build out the professional network and gain access to key information relevant to safeguarding or care coordination that might be stored in other systems.

This manual and inconsistent process leads to delays in assessments, duplication, incomplete records, and increased workload for practitioners. It also means that the person being supported may be asked the same questions multiple times by different professionals, leading to frustration and reduced trust.

There are also many cases where individuals exist in systems that a practitioner wouldn’t think to query (e.g. local authorities where the individual in question used to live, the police force in that area, etc.). As a result key information might be missed, posing significant risk. Individuals ‘falling through the net’ between agencies is commonly cited as a key contributor to harm in serious case reviews.

### Data

* Find out which systems hold information about an individual, so practitioners know where to start their search
* Find out who else is currently working with that individual, or has previously worked with that individual
* Find out who else is related to that individual (e.g. who else might be present at an address, who a child’s parents are so the practitioner can also query their service involvement)
* Find out about related addresses for that individual (different agencies might hold different information)
* Find out about events (e.g. exclusion, DV incident) that are important to providing effective support and safeguarding to a child/individual

ASC systems a CMS may need information from (see: foundational spec):

* Department for Work and Pensions (DWP)
* National Health systems, including:
  * NHS Spine
  * CP-IS or equivalent (e.g. for Wales)
  * PDS (Patient Demographic Service) for NHS number validation
* Shared Care Records
* Emergency Services (Police, Ambulance, Fire)
* Housing systems (e.g. Capita)
* Child and Adult Mental Health services
* Hospital admission and discharge data feeds
* Local NHS and healthcare systems, including GPs and Primary Care
* Education systems
* Finance and payments systems
* Reablement systems
* Document Management Solutions (e.g. SharePoint, Objective Connect)
* Council Tax and Housing Benefit systems
* Youth Justice services
* HR and Workforce systems
* Court Deputy/Legal systems (e.g. Caspar)
* Contact Centre / Front Door solutions

### Benefits/Goal/Value/Purpose

People need to share information between systems to break their siloed view of a case, ensure that work between professionals is not duplicated, and ensure that the individual in receipt of care receives a positive experience. Individuals often will often outline that they continuously need to ‘repeat their story’ to each and every new professional that they commence work with. This can retraumatise the individual, and add to a general disengagement with services if they feel that they aren’t coordinated.

### Processes

At present, this is often done manually. Practitioners will phone and email different staff, with many ‘shortcuts’ to information built up over years of practice (e.g. Linda in the housing service is particularly helpful and will help you get to the information you need more quickly).

These interactions between professionals should be recorded on the system that they are using, and in the social care services will generally will be through case notes on the child/adult’s file.

There are some solutions in place e.g. shared care record which allows practitioners to view health information about a person directly.

## Landscape Review

**The primary problem**

It is hard for practitioners to support and make effective decisions for children, families and individuals in receipt of care when information is fragmented across different systems.

**The secondary problem**

* Practitioners need to gain access to different systems to see information about children/adults that they are working with but are often unable to.
* Families/individuals repeat their stories multiple times to different practitioners, who all hold data within their own systems.
* There is a nervousness for practitioners of what should be shared and when.
* Practitioners are unable to access multiagency chronologies of involvements and significant events.
* Serious case reviews show that a small number of families take deliberate steps to avoid professionals learning about their past.  This may include using different names and moving to different parts of the country.  We probably shouldn’t try to solve this problem with data, but should build things that incorporate an understanding of it.

### Potential solutions

* CMS’s from across safeguarding partners can connect to one another, enabling a window into the relevant parts of a child’s record.
* Integration with tools which support the creation of multiagency chronologies.

This could mean:

* Social workers save time having to seek out information held by other agencies about a child/family, improving interventions and threshold decision making.
* Other safeguarding stakeholders can support children and families more effectively.
* Increased safety for children, reducing the risk of them ‘falling through the gaps’.
* Increased likelihood of being able to intervene earlier before need escalates.

It should also be noted that there is a wider multiagency sharing programme within DfE attempting to tackle this problem for CSC. There is a team dedicated to building out national infrastructure required to gather the SUI, and an architecture team whose role is to advise on options for national architecture.

There are also pockets of work to address this via shared care records and via supplier solutions, however they vary in reliability and usefulness for social workers (i.e. shared care record has a health lens).

* **Shared Care record:** National policy encourages the use of shared care records as central to joined-up care e.g. London Care Record have 26 Adult Social Care Teams accessing this.  Existing suppliers provide access either at procurement or as an add-on with a cost attached.

## Out of Scope

* Information sharing guidance.
* Work on the SUI

## Open Questions

* What will the new guidance say around information sharing under Families First for Children?

## Additional Sources

*CSC*

* [Working Together to Safeguard Children 2023](https://assets.publishing.service.gov.uk/media/6849a7b67cba25f610c7db3f/Working_together_to_safeguard_children_2023_-_statutory_guidance.pdf)
* [Working Together 2023 - Statutory Guidance](https://assets.publishing.service.gov.uk/media/65797f1e0467eb000d55f689/Working_together_to_safeguard_children_2023_-_statutory_framework.pdf)
* [Information Sharing Guidance for Safeguarding Professionals - DfE 2024](https://assets.publishing.service.gov.uk/media/66320b06c084007696fca731/Info_sharing_advice_content_May_2024.pdf)
* [ICO - Guidance for safeguarding children information sharing](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/a-10-step-guide-to-sharing-information-to-safeguard-children/)

*ASC*

* [Information sharing in social care](https://transform.england.nhs.uk/information-governance/guidance/information-sharing-in-social-care/)
* [Safeguarding statutory guidance - adults](https://www.gov.uk/government/publications/care-act-statutory-guidance/care-and-support-statutory-guidance#safeguarding-1)
* [Assessment Statutory guidance - adults](https://www.gov.uk/government/publications/care-act-statutory-guidance/care-and-support-statutory-guidance#first-contact-and-identifying-needs)
* [Transitional safeguarding briefing](https://www.adass.org.uk/wp-content/uploads/2025/10/transitional-safeguarding-briefing-for-sector-leaders-sb-all-web.pdf)
* [ASC CMS foundational-specification](https://khub.net/web/ascait/foundational-specification)

## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+Multi-agency+Enquiries+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+Multi-agency+Enquiries+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.
