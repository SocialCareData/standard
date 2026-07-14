---
title: Transfer of Responsibility
breadcrumbs:
  - Use Cases
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

## Summary

As a social worker I need to be able to transfer records between local authorities, so that when a child or young person who is subject to a child protection plan moves outside my local authority, the new social work teams are able to understand the full history of my involvement.  This transfer of records happens at a Transfer-in Child Protection Conference, hosted by the receiving social work team.


## User stories

* As a social worker I need to be able to understand the full history of incoming child protection cases from other local authorities so I can appropriately support the child
* As a social worker I need to be able to request the full records held by another local authority on a child I am working with.
* As an administrator, I need to be able to respond to requests from other local authorities for information about children by sharing the full history of our involvement with them.
* As a child or young person working with social care, records created about me need to be able to move with me, so that social workers in my new authority have a complete understanding of my case.


## Description

Children who are known to children’s social care will occasionally have to move between local authorities.

Children who are known but below Section 47 threshold are usually subject to a referral from the old local authority to the new local authority when they move.  The new local authority will then triage them for themselves and allocate if they decide they need a statutory service.  Children subject to child protection plans require a transfer child protection conference to be held within 15 days of their new home local authority being notified that they have moved.  Children who are placed in care in a different local authority, remain the responsibility of the placing local authority, who continue to support them as children looked after.

It is important for the receiving local authority to understand the relevant parts of the child’s history so they are most able to support them. For example, understanding what interventions have previously worked/not worked, what services that the child was previously working with in their other local authority. This problem is felt most acutely in urban areas where populations are more transient, meaning children are more likely to move between local authorities. While some CMS systems do have functionality to support transfers, it is not always able to share with multiple LAs, and some data can be unreliable.

### Primary challenge

* Different local authorities utilise different case management systems, with different configurations of these in terms of workflows and forms, making it difficult to effectively transfer records between local authorities.
* We have heard that data can be migrated, but does not appear as ‘historic’, i.e. the creation date will reflect the date the data was moved, not the date the plan was created etc. This can make it challenging to understand what happened in what order and can impact reporting.
* Information about children is often shared as pdf documents (as that is the only way it can be removed from the CMS) and emailed.  In this format it loses all contextual data and can usually only be added to the new system as a document attachment.  This then means the new local authority must manually add the date to their own CMS’s fields and forms if they want it to be dynamic.  Quite often historical records are lost because they are not easily searchable in the new CMS and social workers don’t have time to manually transfer the information in them.

### Opportunity

* We want to be able to ‘drag and drop’, as much as possible, a child’s record from one local authority to another, so the new local authority has all that they need to know about the history of that child’s prior involvement with services.
* We want the data held by local authorities about children and their families to be structured in ways that allow all case management systems to recognise it, so that on transfer it is presented in the new local authority’s CMS in ways consistent with their approach to practice and case file recording.

### Care record components

A Care Record Component is a distinct unit of information that could be captured within the Case Management System (CMS). These components range from the structural entities required to safely manage a case to the person-centred details that form a holistic view of an individual's life and journey. Relevant care record components for this use case include:

* History of interventions
* Historic case notes
* Previous plans, case summaries, etc
* Chronologies of significant events in the child’s life

### Benefits

Improved transfer of information as part of transfer of responsibility will enable:

* Enable social workers to be able to support an individual with a full understanding of their history when they start to work with them
* Reduce risk of missed information
* Reduce inefficiencies for the social worker, enabling them to spend more time focusing on supporting the child
* Help ensure the child does not need to repeat their full story


## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+Transfer+of+Responsibility+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.


## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+Transfer+of+Responsibility+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.
