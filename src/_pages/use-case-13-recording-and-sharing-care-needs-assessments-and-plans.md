---
title: Recording and Sharing Adult Social Care Needs Assessments and Care Plans
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

Identifier: `13`
{: style="color: #888888; font-size: 0.85em; margin-top: 5px;"}

## Summary

<ol type="A" style="font-weight: bold;">
  <li>
    Recording care needs
    <ol style="font-weight: normal;" type="i">
      <li>As an adult social worker or delegated professional (e.g., OT), I can record a person’s care needs, preferences, and outcomes in a structured, standardised way, so that the local authority can determine eligibility, resource allocation, plan support, ensure continuity of care, facilitate sharing with other professionals, and improve oversight and service quality. </li>
    </ol>
  </li>

  <li>
    Sharing assessments and plans
    <ol style="font-weight: normal;" type="i">
      <li>As a social care professional, I want to share relevant parts of an assessment and care plan with:</li>
        <ul>
          <li>Healthcare professionals so that they can coordinate effectively, ensure continuity of care, and support integrated health and care planning. </li>
          <li>Care providers so that providers have the information they need to support me as an individual. </li>
          <li>Housing services where relevant so that housing officers/ providers can understand my needs, risks and adjustments (eg equipment) enabling them to provide safe a suitable accommodation. </li>
          <li>Other external agencies where relevant e.g. voluntary sector providers, so that multi-agency partners have the relevant details they need to deliver coordinated, person-centred support. </li>
        </ul>
    </ol>
  </li>

  <li>
    Citizen access to assessments and plans
    <ol style="font-weight: normal;" type="i">
      <li>As an adult having my needs assessed, I would like to see a copy of the assessment as well as the care/support plan (or shared, with consent, to an appointed advocate; legal power of attorney; deputy or family member) so that I can understand my assessed needs and what support I am eligible for, and what has been refused (to be able to challenge decisions if necessary). I want to ensure my wellbeing was considered [<i>note: links to 1Bi</i>] </li>
    </ol>
  </li>

</ol>

## Description

The Care Act 2014 requires local authorities to conduct a needs assessment whenever it appears that an adult may require care or support. While the local authority retains ultimate responsibility, the assessment may be carried out by adult assessors’/social workers, occupational therapists, or other professionals with appropriate expertise.

Assessments can occur in person, over the phone, online(portals) via self-assessment. Notes may initially be taken on paper, electronically, or via transcription tools such as Magic Notes. Once the assessment is completed, the assessor enters structured data into the CMS, forming the official record.

The assessment determines:

- Eligibility for care and support, including the impact on wellbeing.
- Enabling care under the Mental Health Act including acting in the persons best interest if lacking capacity
- Need for a financial assessment.
- Allocation of a personal budget and care plan.

This process links to other use cases, particularly the **Transitions Use Case**, as assessments may identify young people approaching adulthood who will transfer from children’s to adult services.

Structured, standardised recording is also critical for:

- Continuity of care across multiple professionals and agencies.
- Multi-agency coordination with providers, health services, and advocates.
- Aggregation of data for local and national policy insights.

### Data

Key information captured during the assessment includes:

- **Assessment metadata:** referral source, date allocated, assessor, assessment date.
- **Communication preferences and support needs:** e.g., independent advocacy, preferred methods of communication.
- **Health information:** conditions, section 117 status, Autism, sensory impairments.
- **Assessed needs and outcomes:** personal outcomes, life events, priorities, strengths.
- **Information and advice provided:** context from discussions with the adult.
- **Preventative pathways considered:** e.g., reablement, early support interventions.
- **Risks:** risk assessments, risk enablement plans.
- **Other legal considerations:** advanced decisions, registered Lasting Powers of Attorney.
- **Next steps:** outcome of the assessment, financial assessment, care plan, referrals.
- **Housing:** settled or unsettled eg (own home, care home etc)

### Benefits/Goal/Value/Purpose

- To provide a person-centred framework for care and support planning.
- To enable continuity of care and communication with other professionals and agencies.
- To identify themes, challenges, and opportunities in an adult’s life to inform care decisions.
- To ensure accountability to the adult, managers, inspections, and audits.
- To provide evidence for legal, safeguarding, or complaints processes.
- To comply with statutory recording requirements under the Care Act 2014.

### Processes

- Adult identified as having an appearance of need.
- Assessment initiated by social care assessor or delegated professional.
- Information gathered via discussion, observation, or self-assessment.
- Notes recorded on paper, electronic notes, or transcription tools.
- Structured data entered into CMS.
- Determination of eligibility for care and support via a resource allocation tool.
- If eligible, financial assessment completed; personal budget and care plan agreed.
- Information shared with relevant professionals and agencies where appropriate.
- Assessment may contribute to national returns and support broader oversight.
- *Local Authorities have either not built a RAS in a way that works or the vendor charges a lot per day to develop this meaning some LA’s have purchased a suite of forms via Imosphere where the vendor has failed to support.*

## Landscape Review

Variation exists across local authorities in how assessments are conducted and recorded.

- Regulatory oversight (CQC) and national reporting (DHSC / CLD) increasingly rely on structured, comparable data.
- Lack of standardisation causes duplication for adults, inefficiency for professionals, and challenges for policy insight.
- Multi-agency working is common, involving providers, health professionals, OTs, advocates, and carers.
- Assessment is not just administrative; it is a professional intervention critical to person-centred care.

It is proposed that between the LA and care provider, only one care plan should exist.  The Care Act assessment itself differs in every LA, recommendation for consistency in how the criteria is recorded would help if an adult lives in one area but placed in a care home in another.

Recommendation for the Vendors to redesign API so tabs in the assessment can be seen live in health integration systems.

## Out of Scope

## Open Questions

- How much standardisation is feasible without removing local flexibility?
- Which assessment data fields are essential for interoperability across LAs?

## Additional Sources

- **SCIE:** [Legal duties for recording an assessment of needs](https://www.scie.org.uk/care-act-2014/factsheets/care-act-factsheet-3-legal-duties-for-recording-an-assessment-of-needs-for-care-and-support)

- **SCIE:** [Assessment & eligibility: fluctuating needs](https://www.scie.org.uk/assessment-and-eligibility/fluctuating-needs/)

- **GOV.UK:** [Care Act statutory guidance](https://www.gov.uk/government/publications/care-act-statutory-guidance/care-and-support-statutory-guidance)

- **DHSC:** [Care Data Matters: roadmap for better adult social care data](https://www.gov.uk/government/publications/care-data-matters-a-roadmap-for-better-adult-social-care-data)

- **CQC:** [State of Care 2024--2025 report](https://www.cqc.org.uk/publications/major-report/state-care/2024-2025/systems/laa)

- **Community Care:** [Assessment information gaps and access issues](https://www.communitycare.co.uk/2024/10/16/assessors-lack-of-social-work-experience-among-criticisms-of-cqc-council-checks-in-damning-review/)

- **The King's Fund:** [Social Care 360: Quality](https://www.kingsfund.org.uk/insight-and-analysis/long-reads/social-care-360-quality)

- **Cambridge BJPsych Bulletin:** [Personalisation and Social Care Assessment](https://www.cambridge.org/core/journals/bjpsych-bulletin/article/personalisation-and-social-care-assessment-the-care-act-2014/ADE7C621B17CFB09E8D3B01E024FF8E1)

## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+Recording+and+Sharing+ASC+Needs+Assessments+and+Care+Plans+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+Recording+and+Sharing+ASC+Needs+Assessments+and+Care+Plans+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.
