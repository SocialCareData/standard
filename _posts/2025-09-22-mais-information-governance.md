---
layout: post
permalink: /2025-09-22-mais-information-governance
title: MAIS Information Governance Deep Dive
categories:
  - MAIS
breadcrumbs:
  - title: Updates
    url: /updates
---


<nav class="toc numbered-toc">
<h2 id="table-of-contents">Table of contents</h2>

1. TOC
{:toc}
{::options toc_levels="2..3" /}

</nav>

<article class="numbered-headings">

## Links

[MAIS information governance deep dive slides](/assets/pdf/mais-ig-deep-dive.pdf)

## Meeting notes

### Framing and objectives for today

> I am a registered social worker, employed by a local authority, and I am making a request under section 47, in the active safeguarding of a child.

Confirm scope: initially s47 enquiries (duty to investigate “significant harm”).

Assume authentication, cybersecurity, etc. in place.

Assume matching methodologies are adequate to return match, possible matches, no match.

Today’s output:

- Draft computable information governance rule for the s47 use case
- Draft list of obligations/audit fields to satisfy IG and explainability.

#### Typical s47 scenario walk through

Map who asks whom, for what, and why (e.g. LA to NHS Trust, school, police).

Identify data items needed at each stage.

Note any human-in-the-loop points.

#### Capture data elements required to make and assess assertion

Fill a one-row decision table for a s47 decision:

- Actor (e.g. Social worker)
- Purpose (e.g. S47 enquiry)
- Legal Basis (e.g. Children Act 1989)
- Conditions (e.g. Reasonable cause to suspect significant harm)
- Decision (e.g. permit with obligations)
- Obligations (e.g. minimum necessary, log, notify safeguarding lead, retention window)

Consider edge cases and other factors: child age, is third‑party data present, “could consent prejudice protection?” (Sch.1 para 18(2) - [legislation.gov.uk](https://legislation.gov.uk)).

#### Discussion

Interested in views on challenges around implementations and building trust in the system. What are the audit and explainability requirements?

Audit fields e.g. requester, role, organisation; person identifiers used; reason URI; rule/version; decision; timestamps; obligations applied?

Would other use cases fit the same model?

Should the request capture:

- Requester Role?
- Organisation code (NHS’s Organisation Data Service)
- Probe failure modes: multiple matches; child is 16–17 and objects; System holds third‑party data.

Mitigations:

- raise match threshold or ask for more identifiers;
- add obligation tags (mask, no reuse) in security labels (hl7.org)
- route to human if ambiguous.

#### Commitments and next steps

Name the owners for actions:

1. Drafting required resources (vocabularies / URIs)
1. Update data exchange standard?
1. Three test cases and expected outcomes
1. Audit log fields
1. Testing plan

#### Context Assumed

The simplest version of the use case is that one professional in ‘asking org’ is trying to find information about a person, assumes that this info exists in one of the c. 30,000 relevant systems who are ‘responding orgs’.

Asking org has two problems:

1. Do not know which responding orgs have any information – the discovery problem
1. Wishes to run an efficient process of establishing that sharing this information would be in line with responding org’s policies – automation problem

High level solution:

- Basic paradigm is distributed and API driven, rather than being a bilateral integration (e.g. LA 1 looks up info in system of LA 2)
- Assumes a central routing and messaging system exists and is available to ASC and CSC. So system in LA1 sends message to routing system, which passes it to relevant respondents, which direct their responses back to asking system, which synthesises them into a

Challenge in focus here:

- When a message arrives requesting information, the receiving system needs to decide whether or not it is in line with policy to respond
- At the moment this is a manual process
- There is a general problem of there not being a standard approach to determining policy alignment and using this to drive a response
- There are a set of specific problems around complex varities of the use case. These include: A, B, C.

#### Proposed Discussion

Frame the problem and objective for this session

Not in scope: authentication,


### A taxonomy for data exchange

As an example, in the context of a single view system:

- We need a catalog or registry of organisations and service providers, so that we can direct requests for information.
- We need to be able to refer to service involvements, which requires an ability to classify services. Within services, we need to be able describe professionals / practitioners and their roles in a service involvement.
- We need to be able to refer to Data Processing Agreements and potentially to specific agreed data sharing use cases which they authorise.

Bringing all this together we are then able to consistently and coherently make and respond to requests such as: "This is a request from organisation 1, to organisation 2, for information about any service involvements and related professionals for this person, and it is made under the aegis of use case 1 within DPA1".

Information Governance spans national policy / frameworks e.g. Working Together to Safeguard Children down to individual agreements between Local Authorities, Police, Health, etc.

To allow us to automate rules-based decision making...

We need to be able to assert status of a request with respect to a DPA

So that where a DPA is in place a request can be received, reviewed, approved (or rejected or escalated for review), and responded to automatically.

So that distributed Single View can be established nationwide without unmanageable burden of approvals, or unnecessary processing of personal data.

We could start with the clearest case: The assertion is: I am a registered social worker, employed by a local authority, and I am making a request under section 47, in the active safeguarding of a child.

Do we need all the following:

1. A standard for describing key parts of a data sharing agreement.
    - Parties
    - Start/End
    - Signatories
    - Status (in force, revoked, etc)
    - Location
    - Authentication of this info
    - Processing use cases they authorise
1. Processing Use Cases
    - Overview of scope, nature, and purpose of sharing
    - How to assert that a request falls under this use case (who is requesting, purpose and circumstances, meeting security and IG standards)
    - How an assertion will be reviewed
    - Rules to be applied in respect of retention, ROPA, DSRs, and FoI
    - What must be logged by which parties
1. Request, with source of legitimation
1. Decision, flow chart or rules engine, for a set of pre-programmed responses.
1. Rules about logging
1. A register of DSAs (but much current process does not operate at level of a DSA)


#### Possible technologies for encoding

##### HL7 FHIR (core resources)

What it is: Health/people data model + REST API for interoperable exchange.

Use here: Person/Patient, Practitioner/Organization/Endpoint, Encounter/Observation; bundle/query patterns (e.g., Patient/$match).

Strengths: Widely adopted; fine-grained, extensible; good UK/NHS ecosystem alignment.

Watch‑outs: Can be verbose; needs clear profiles and minimal “must support” fields to keep it simple for social care.

Quick win: Use constrained Parameters + Patient/$match for “is this the right person and who do I contact?” patterns.

##### HL7 FHIR Consent

What it is: Resource to record consent or policy basis for processing.

Use here: Record legal basis/policy references for s47 enquiries; link to decisions/audit (policyBasis/policyRule).

Strengths: Standard way to surface why you’re allowed to process/share.

Watch‑outs: Don’t confuse with runtime authorization—Consent is context/meta, not the enforcement engine.

Quick win: Create a “policy record” per s47 episode and reference it in requests/responses/audit.

##### HL7 FHIR Security Labels

What it is: Coded tags on resources/attachments indicating confidentiality and purpose‑of‑use.

Use here: Mark responses as Confidential (e.g., R) and tag purpose-of-use (e.g., safeguarding) for downstream handling.

Strengths: Lightweight, machine‑readable obligations; interoperable tagging across orgs.

Watch‑outs: Requires agreement on a local code set/trust framework; labels don’t enforce by themselves.

Quick win: Define 5–7 labels (confidentiality tiers + “s47‑enquiry” purpose) and apply consistently.

##### NIEM (National Information Exchange Model)

What it is: US‑origin common vocabulary and IEPD method for cross‑domain exchanges.

Use here: Only as inspiration for exchange documentation and mapping methodology where domains diverge (e.g., justice ↔ social care).

Strengths: Rigorous modeling discipline; encourages reusable data components.

Watch‑outs: Heavyweight; not native in UK; clashes with FHIR if both try to be the canonical model.

Quick win: Borrow the IEPD mindset (business rules + info model + samples), keep payloads FHIR/Open Referral.

##### OPA/Rego (Open Policy Agent)

What it is: General‑purpose, embedded policy engine; policies written in Rego.

Use here: Authorisation decisions for APIs (“permit/deny/obligations”) based on role, purpose, legal basis, flags (safeguarding, consent).

Strengths: Auditable, testable policy‑as‑code; easy to version; works with microservices and gateways.

Watch‑outs: Needs a clear input schema and governance so IG can understand rules; authoring skills required.

Quick win: Encode 2–3 priority rules (incl. s47) with test cases; log rule ID/version in decisions.

##### XACML (eXtensible Access Control Markup Language)

What it is: XML/JSON policy language + PDP/PEP architecture for attribute‑based access control.

Use here: Legacy or enterprise contexts that already have XACML tooling; model complex ABAC with obligations.

Strengths: Mature, expressive; wide ABAC vocabulary.

Watch‑outs: Steeper learning curve; heavy for greenfield; harder for non‑tech IG staff to read/author.

Quick win: If you have no XACML stack, prefer OPA/Rego; if you do, model s47 as a targeted policy set with clear attributes.

##### ODRL (Open Digital Rights Language)

What it is: W3C model to express permissions, prohibitions, and duties on data usage.

Use here: Represent downstream usage constraints or data‑sharing agreements (e.g., “permit use for safeguarding; prohibit research; duty to delete in 90d”).

Strengths: Good for human‑ and machine‑readable obligations beyond access decision time.

Watch‑outs: Not an enforcement engine; fewer healthcare examples; mapping to runtime checks needed.

Quick win: Use ODRL (or a simplified profile) to annotate DSAs; translate key duties into enforcement rules in OPA.

##### How they fit together (recommended stance)

Data model and exchange: FHIR for person/case‑adjacent exchanges; Open Referral for service directories.

Policy basis and tags: Record basis in FHIR Consent; tag payloads with Security Labels (confidentiality + purpose).

Decisioning: Enforce access with OPA/Rego (or XACML if already present), emitting obligations and a rule/version in the audit log.

Governance: Document the exchange like a NIEM IEPD (business rules, data elements, samples), but keep canonical payloads FHIR/Open Referral.

Starter checklist (use tomorrow)

Pick codes: purpose URI for “s47‑enquiry”; 5–7 security labels.

Choose engine: OPA for policy runtime; define input schema (actor, purpose, legalBasis, flags).

Author 3 policies: s47 permit-with‑obligations; break‑glass; deny when purpose≠safeguarding.

Wire audit: log rule ID/version, inputs, outcome, obligations; reference Consent/policy record.


### AUTHENTICATION

Leave as is.


### AUTHORISATION

Use a centralised service.

How do you manage authorisation? - OAuth

### More notes

I think people are overestimating the effect of the new powers re the IG challenge.

Having set up DSAs with about 50% of English LAs I don't think that the law is the thing that has slowed down sharing. What has slowed it down is the high friction process for data controllers to reassure themselves that the law is being followed.

This legislation makes clear that some types of sharing are permissible, and that's a good thing, but the fundamental things which make setting up sharing a slow business stay the same:

- Definition of a data controller;
- Requirement for the data controller to document plans for processing and their fit to law.

I think national DSAs for local signing are a sensible route to addressing that.

What we would need to do is probably input to the structure e.g. annex for data to be shared would come in large part from standards, and annex on how data to be shared would too (e.g. your system must be compliant with standard X which sets out how to interact with other systems).

So, when a partner 'signs up' to our ecosystem of data exchange, that could entail:

- providing api endpoint
- enabling new functionality in CMS
- signing a generalised DSA

Have suggested that part of the functionality of the services at the centre be to hold not just details of end-point and current status (e.g. on/off) but also a structured and public record of which DSAs they are signed up to, and the config they have re what data they'll respond to for what use cases, where they do and dont allow automatic decision making etc.

In part so that there is a central view of which orgs have signed up and which have not, and of which orgs have fully implemented and which have not. Which would go a long way to making the change mgmt task more manageable.

</article>
