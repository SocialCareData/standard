---
layout: default
permalink: /use_case_transfer_of_responsibility
title: Transfer of Responsibility
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

Identifier: `9`
{: style="color: #888888; font-size: 0.85em; margin-top: 5px;"}

## Summary

As a social worker I need to be able to transfer records between local authorities, so that when a child or young person who is subject to a child protection plan moves outside my local authority, the new social work teams are able to understand the full history of my involvement.  This transfer of records happens at a Transfer-in Child Protection Conference, hosted by the receiving social work team.

As a social worker I need to be able to understand the full history of incoming child protection cases from other local authorities so I can appropriately support the child.

As a social worker I need to be able to request the full records held by another local authority on a child I am working with.

As an administrator, I need to be able to respond to requests from other local authorities for information about children by sharing the full history of our involvement with them.

As a child or young person working with social care, records created about me need to be able to move with me, so that social workers in my new authority have a complete understanding of my case.

## Description

Children who are known to children’s social care will occasionally have to move between local authorities.

Children who are known but below s.47 threshold are usually subject to a referral from the old local authority to the new local authority when they move.  The new local authority will then triage them for themselves and allocate if they decide they need a statutory service.  Children subject to child protection plans require a transfer child protection conference to be held within 15 days of their new home local authority being notified that they have moved.  Children who are placed in care in a different local authority, remain the responsibility of the placing local authority, who continue to support them as children looked after.Different local authorities utilise different case management systems, with different configurations of these in terms of workflows and forms, making it difficult to effectively transfer records between local authorities. It is important for the receiving local authority to understand the relevant parts of the child’s history so they are most able to support them. For example, understanding what interventions have previously worked/not worked, what services that the child was previously working with in their other local authority.

This problem is felt most acutely in urban areas where populations are more transient, meaning children are more likely to move between local authorities.

We want to be able to ‘drag and drop’, as much as possible, a child’s record from one local authority to another, so the new local authority has all that they need to know about the history of that child’s prior involvement with services.

### Data

- History of interventions
- Historic case notes
- Previous plans, case summaries, etc
- Chronologies of significant events in the child’s life

### Benefits/Goal/Value/Purpose

We want social workers to be able to support an individual with a full understanding of their history when they start to work with them. There will be a managed handover between local authority A and B when the case transfers, however the record does not easily move across.

This creates risk, inefficiencies for the social worker, and increases the need for the child to repeat their story to the social worker. They might not recall the full details of information, meaning that social workers might be ‘operating in the dark’.

### Processes

We have heart that data can be migrated, but does not appear as ‘historic’, i.e. the creation date will reflect the date the data was moved, not the date the plan was created etc. This can make it challenging to understand what happened in what order and can impact reporting.

Information about children is often shared as pdf documents (as that is the only way it can be removed from the CMS) and emailed.  In this format it loses all contextual data and can usually only be added to the new system as a document attachment.  This then means the new local authority must manually add the date to their own CMS’s fields and forms if they want it to be dynamic.  Quite often historical records are lost because they are not easily searchable in the new CMS and social workers don’t have time to manually transfer the information in them.

## Landscape Review

In our conversations with case management system experts, one highlighted that liquid logic has functionality to facilitate this transfer. But this connection can only be made between one other local authority. This does not meet the needs of local authorities who will need to send/receive information from multiple local authorities.

## Out of Scope

## Open Questions

## Additional Sources

## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+Transfer+of+Responsibility+Use+Case" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+Transfer+of+Responsibility+Use+Case" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.
