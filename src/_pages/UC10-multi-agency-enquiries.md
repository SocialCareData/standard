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

## Summary

Accessing and understanding relevant information about an individual across agencies to support safe, timely, and well-coordinated decision-making.


## User stories

* **Frontline practitioner enquiries when beginning work with an individual**
  * As a professional starting work directly with an individual, I want to know their history of involvement with professionals, including concerns, interventions, and outcomes.  This helps me plan my work with them and avoids them feeling they have to explain their story repeatedly.
  * As a professional starting work directly with an individual, I want to be able to contact other professionals who are currently supporting them or who have in the past.  This helps us co-ordinate our work and learn from each other to provide the best outcomes for the child/family/adult.
  * As a frontline practitioner who has received a referral about a child/adult, I want to be able to quickly find information about that child/adult or their family members held by other professionals in order to triage and allocate them appropriately (allocation decision usually signed off by manager).
* **Safeguarding enquiries (see separate use cases 14 and 15)**
  * As a social worker conducting safeguarding enquiries, I need the contact details of other professionals who hold pertinent information about the subject so that I can coordinate information sharing and support to allow for effective analysis and decision making.
  * As the administrator of a social care CMS, I need to be able to contribute records about which individuals we are (or have been) working with to a single view service, so that professionals in other organisations can rely on the responses they get when searching for who holds records about a person.
* **Enquiries for CSC statutory processes**
  * As a social work manager, I need to be able to read all information held by professionals about a child and their family to inform my decision whether to initiate a child protection investigation under CA s.47.
  * As a social worker conducting a s.47 investigation, I need to contact all other professionals involved with a family to invite them to share information and decision-making as a professional network.
  * As a social worker supporting a child under CA s.17 (Child in Need) I need to access information held by other professionals about the child, where the child’s parent or carer has consented to this information sharing.
* **Enquiries for ASC assessment and care coordination**
  * As an ASC social worker, I need to gather up-to-date health and community health information, carer information and other information about a person relevant to complete a Care Act assessment including assessing their capacity and seeking information on legal orders.
  * As an ASC social worker, I need to see employment and benefits information from DWP so that I can understand their income and entitlements which determines how much the LA pays for the package of care.
  * As an ASC assessor , I need to see provider information e.g. Dols assessments; care and support plans, safeguarding information and outcomes so that I can review and adjust a person’s LA care plan.


## Description

Practitioners do not currently have a straightforward way to access written records from  other agencies who have worked with a child/family/adult, even when they have a statutory duty to share that information.   A lack of interoperability between different agencies’ systems means gathering and sharing of information is done via a series of individual, human to human requests.

Typical enquiries may involve contacting health services, education providers, care providers, finance teams, housing departments, voluntary organisations, the police, or other local authority teams. Information is often requested manually via email, phone, or shared documents, and responses vary in speed, format, and completeness.

It can be difficult to get a clear view of who else is working with a child/family/adult , meaning practitioners expend time trying to build connections between the professional network as part of their statutory duties.  While valuable, this work is time consuming and leads to delays and incomplete or sometimes incorrect records. It also means that the person being supported may be asked the same questions multiple times by different professionals, leading to frustration and reduced trust.

There are also many cases where individuals exist in systems that a practitioner wouldn’t know to query (e.g. local authorities where the individual in question used to live, the police force in that area, etc.). As a result key information might be missed, posing significant risk. Individuals ‘falling through the net’ between agencies is commonly cited as a key contributor to harm in serious case reviews/safeguarding adult reviews (SAR).

### Primary challenge

* It is hard for practitioners to support and make effective decisions for children, families and adults in receipt of care when information is fragmented across different systems. At present, this is often done manually we could say in some LA’s via the Share Care Record for health only information.
* Practitioners need to gain access to different systems to see information about children/adults that they are working with but are often unable to.
* Families/adults repeat their stories multiple times to different practitioners, who all hold data within their own systems.
* There is a nervousness for practitioners of what should be shared and when, because much of the data they hold is sensitive personal information and consent driven.
* Practitioners are unable to access multiagency chronologies of involvements and significant events.
* Serious case reviews show that a small number of families take deliberate steps to avoid professionals learning about their past.  This may include using different names and moving to different parts of the country.  We probably shouldn’t try to solve this problem with data, but should build things that incorporate an understanding of it.
* It should also be noted that there is a wider multiagency sharing programme within DfE attempting to tackle this problem for CSC. There is a team dedicated to building out national infrastructure required to gather the SUI, and an architecture team whose role is to advise on options for national architecture.
* There are also pockets of work to address this via shared care records and via supplier solutions, however they vary in reliability and usefulness for social workers (i.e. shared care record has a health lens).
  * **Shared Care record:** National policy encourages the use of shared care records as central to joined-up care e.g. London Care Record have 26 Adult Social Care Teams accessing this.  Existing suppliers provide access either at procurement or as an add-on with a cost attached.

### Opportunity

* Standards could make it easier for social care systems and partner agencies to find, request and share relevant information about a child, family or adult in a consistent way. This could help practitioners understand:
* which agencies hold relevant information;
* who is or has been involved;
* key relationships, addresses, risks and events;
* what information can be shared, for what purpose, and with what safeguards.

This would reduce manual chasing, improve the timeliness and completeness of safeguarding and assessment decisions, and help people avoid repeating their story.

### Care record components

A Care Record Component is a distinct unit of information that could be captured within the Case Management System (CMS). These components range from the structural entities required to safely manage a case to the person-centred details that form a holistic view of an individual's life and journey. There will be numerous relevant care record components for this use case. Social workers will need to find out:

* Which systems hold information about an individual, so practitioners know where to start their search
* Who else is currently working with that individual, or has previously worked with that individual
* Who else is related to that individual (e.g. who else might be present at an address, who a child’s parents are so the practitioner can also query their service involvement)
* Related addresses for that individual (different agencies might hold different information)
* Events (e.g. exclusion, DV incident) that are important to providing effective support and safeguarding to a child/individual

### Benefits

* Social workers save time having to seek out information held by other agencies about a child/family/adult, improving interventions and threshold decision making and inevitably the outcomes for that child/adult.
* Other safeguarding stakeholders can support children, families and adult more effectively.
* Increased safety for children, reducing the risk of them ‘falling through the gaps’.
* Early intervention for an adult can reduce hospital visits resulting in care packages
* Increased likelihood of being able to intervene earlier before need escalates.


## Out of scope

* Information sharing guidance.
* Work on the SUI


## Additional sources

### CSC

* [Working Together to Safeguard Children 2023](https://assets.publishing.service.gov.uk/media/6849a7b67cba25f610c7db3f/Working_together_to_safeguard_children_2023_-_statutory_guidance.pdf)
* [Working Together 2023 - Statutory Guidance](https://assets.publishing.service.gov.uk/media/65797f1e0467eb000d55f689/Working_together_to_safeguard_children_2023_-_statutory_framework.pdf)
* [Information Sharing Guidance for Safeguarding Professionals - DfE 2024](https://assets.publishing.service.gov.uk/media/66320b06c084007696fca731/Info_sharing_advice_content_May_2024.pdf)
* [ICO - Guidance for safeguarding children information sharing](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-sharing/a-10-step-guide-to-sharing-information-to-safeguard-children/)

### ASC

* [Information sharing in social care](https://transform.england.nhs.uk/information-governance/guidance/information-sharing-in-social-care/)
* [Safeguarding statutory guidance - adults](https://www.gov.uk/government/publications/care-act-statutory-guidance/care-and-support-statutory-guidance#safeguarding-1)
* [Assessment Statutory guidance - adults](https://www.gov.uk/government/publications/care-act-statutory-guidance/care-and-support-statutory-guidance#first-contact-and-identifying-needs)
* [Transitional safeguarding briefing](https://www.adass.org.uk/wp-content/uploads/2025/10/transitional-safeguarding-briefing-for-sector-leaders-sb-all-web.pdf)
* [ASC CMS foundational-specification](https://khub.net/web/ascait/foundational-specification)


## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+Multi-agency+Enquiries+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.


## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+Multi-agency+Enquiries+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.
