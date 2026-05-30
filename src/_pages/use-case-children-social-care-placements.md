---
title: Children's Social Care Placements Use Case
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

## Introduction

The Placements Data Standard will standardise some of the data collected about children’s social care placements. The goal of this standard is to support better analysis of placement sufficiency at the local and regional level, tackle high costs in the care market and improve outcomes for children in care.

## Description

### Scope

**The standard helps LAs:**

- Better understand placement sufficiency: what provision is needed where, and at what notice
- Speak the same data ‘language’ as neighbours to form regional view of sufficiency gaps
- Distinguish between different drivers of placement costs (e.g. escalating need, displacement from foster to residential, increased referrals etc.)
- Make like-for-like comparisons of placement cost
- Forecast future demand for different placement types

**It has been designed to:**

- Create the smallest possible burden on frontline staff
- Minimise the amount of change required by LAs for adoption
- Make use of existing data being gathered

### Key Assumptions

We made several assumptions in the design of the proposed data standard:

- Placement teams rather than social workers or finance teams will either directly enter or ‘own’ the data being proposed in the standard. In cases where they are not directly entering the data (e.g. because they are taking it from a referral form), the placement teams would be responsible for the data’s fidelity to the standard.
- The additional work for a placement worker of entering this data is approximately 90 seconds (based on initial pilots of this data model).
- While total cost agreed at IPA may sometimes be an inaccurate representation of true cost, it is ‘accurate enough’ to enable useful life-for-like cost comparisons and regional cost analysis.

### Design Process

To develop the initial prototype for the placements data standard, Social Finance, in partnership with Somerset Council:

- Reviewed existing approaches to describing needs including CANS, BERRI, and the ‘All Wales Single referral’ form as well as the definitions implied by various referral forms, framework contracts, and reporting schemas.
- Interviewed 6 providers to understand how they define need, and how this translates into a decision on whether and at what price to offer an available placement (all other things being equal).
- Used the above research to develop a standard for describing the needs which a placement must meet.
- Interviewed four placement teams to understand their current processes, what data they capture, how they store it, and how data this is used (or not) in their own work and in the work of teams who they share the data on to.
- Amended the standard considering this (to make it more practical to collect) and designed guidance on how to collect it (e.g. at what point, by whom).
- Tested the ‘collectability’ of the standard with four teams including use on live referrals with three of them.
- Amended the standard again to reflect lessons learned and reduce the burden on placement teams.

The placements data standard was subsequently reviewed and refined by a cross sector Working Group of 60+ stakeholders, and trialled in three regions.

## Landscape Review

### The challenge / opportunity

**Care market costs are unsustainable and child outcomes poor.**

The market for children’s social care placements—that is, the accommodation and support provided to children when they are taken into the care of the local authority—has been described by the [Local Government Association](https://www.local.gov.uk/about/news/childrens-social-care-placements-costing-ps10000-plus-rise-sharply-five-years-new-lga) as “broken”. There is evidence of residential care costs increasing by c. 70% on average over the last 5 years. Further around half of children in residential care nationally are placed more than 20 miles from home.

**Market intelligence is key but hard without a shared data language.**

Managing this market—essentially ensuring that the right provision is available in the right place and at the right notice—requires market intelligence. LAs must have a clear picture of supply and demand in order to be able to tell providers what new provision they would be likely to pay for, or to make decisions about where to invest their own funds, or to guarantee payments.

Although some solutions may be local, there is consensus that regional market coordination is key given the regional or national scale of operations of many residential providers. Regional coordination requires regional intelligence about where and what additional supply . Few regions are able to provide this currently. Although technical and legal barriers exist they are increasingly being solved. The more fundamental issue is a lack of the shared data ‘language’ between neighbouring LAs that would enable ‘like-for-like’ comparison and analysis.

Key items like child needs, determinants of placement availability, services provided, and costs of placements tend to captured in different ways by different LAs, making it hard to answer fundamental questions about regional placement sufficiency.

The placement standard aims to solve that problem by creating a standard way to describing placements which allows any region to answer its sufficiency questions, whilst placing the smallest burden on busy placement teams, and representing the smallest cost of change.

### Other approaches

Local Authorities already gather standardised statutory data (e.g. the CLA Census and SSDA903) that allows regional (or national) answers to questions like:

- How many children are placed outside their home LA or more than 20 miles away from their home LA?
- Which demographic characteristics are more likely to be associated with being placed far from home?
- Which providers are being placed with most often?

Further, some regions are developing their own standardised placement cost data models to start generating regional insight into market cost trends, and many LAs are utilising software solutions like BERRI, CANs and Care Cubed to build a database of costs, placement needs and outcome data. The table below provides an overview of the data models we are aware of.

<p><img src="/assets/img/placements/data-models-overview.png" alt="Overview of Data Models" title="Overview of Data Models" /></p>
<small>*\* Determinants of placement availability refers to factors that are likely to dictate whether a foster carer or provider are able to accept a referral and at what price. This includes things like home adaptations required, additional support requirements, risks etc.*</small>

Although, as the table above shows, there are many models already gathering placement cost data, and some gathering other types of data necessary to meaningful regional sufficiency analysis, we are aware of none that gather all this data in a way that readily enables quantitative insight into where key sufficiency gaps are. The data models we are aware of (above) that capture rich insight on determinants of placement availability, preferred placement and child outcomes (BERRI, CANS and IMPOWER) are models designed to be used by social workers, rather than placement teams. While data of this sort gathered by social workers is invaluable for individual care planning, it is not designed primarily to support aggregate analysis or enable meaningful ‘apples for apples’ comparison with neighbours. This is because the data is largely qualitative and many key fields such as needs and risks are largely uncategorised.

## Out of Scope

**The standard will  *not***:

- Preclude LAs from gathering additional data fields to suit local needs
- Impose a process for how the data is gathered in each LA (i.e. some LAs may embed these fields in a CMS referral form, others may gather this in excel etc)
- Be designed with the primary purpose of supporting home search
- Establish a national contract for placements
- Establish a standard referral form
- Mandate architecture or functionality changes for CMS suppliers

## Open Questions

- Best way to record preferred location of the placement in a way that allows meaningful aggregate level comparison with actual placement location, especially for dense urban regions
- Best way to define ‘preferred’ placement
- Best quality assurance approach to ensure high fidelity data entry

## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+Placements+Use+Case" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+Placements+Use+Case" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

</article>
