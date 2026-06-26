---
title: Contact Details from SUI & NRL for Safeguarding
breadcrumbs:
  - title: Use Cases
    url: /use_cases
tags:
  - MAIS
  - Use Case
reference: UC14
---



<nav class="toc numbered-toc">
<h2 id="table-of-contents">Table of Contents</h2>

1. TOC
{:toc}

</nav>

<article class="numbered-headings">

Identifier: `UC14`<br>
This was split from [UC10 (multi agency inquiries)](/UC10_multi_agency_enquiries)<br>
Used to be called `UC10a`
{: style="color: #888888; font-size: 0.9em; margin-top: 5px;"}

## Summary

As a social worker conducting safeguarding enquiries, I need the contact details of other professionals hold pertinent information about the subject so that I can coordinate information sharing and support to allow for effective analysis and decision making.

## Description

To move from [UC10 Multi-agency Enquiries](/UC10_multi_agency_enquiries) use case -- this use case (10a). Here we are specifying what systems need to do in order to interface with the NRL. All participating implementations must be able to interact with the NRL

Two national service will exist:

- Find a SUI
- Find a record

### Data

What goes in:

- Details to identify the individual -- demographic information
- Weighted by confidence
- Service involvement (my relationship with them)
- SUI (if they have it)

What comes out:

- First: SUI -- which is then submitted to the second
- whether the information that I've provided has allowed the system to match to a specific individual
- List of services which are declaring they've had an interaction with that SUI
  - Ideally: Names and contact details of related professionals

End of the process:

- The social worker then sends an email/picks up the phone to the new contact

### Benefits/Goal/Value/Purpose

### Processes

This consists of:

- A request for a SUI to a “find a SUI service”
- A return of a SUI to the requestor
- A request utilising that SUI to a “find a record service”
- A return of a list of services

Additional requirements:

- Find a sui service request
- Find a sui service response
- Find a sui service protocol
- Find a record request
- Find a record response
- Find a record protocol
- Both requests must include information to facilitate an audit trail

Assumed out of scope

- Matching specification
- Business logic for “find a record”

Assumptions:

- Services are well known
- There will be a requirement to authorise users
- Need to have an identified audit request

## Landscape Review

What is hard for social workers

## Out of Scope

## Open Questions

## Additional Sources

## Report an issue

If you spot an issue with this use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Issue+regarding+NRL+SUI+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.

## Future use cases

If you would like to suggest a future use case, please <a href="https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&title=Suggesting+a+NRL+SUI+Use+Case&category=Use+Cases&page={{ page.url | absolute_url | url_encode }}" target="_blank" rel="noopener noreferrer">create a new issue on GitHub</a>.
