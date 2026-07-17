---
layout: publication
current: /publications_interoperability_framework
title: Interoperability Framework
description: An interoperability framework for establishing common API standards across social care systems, designed to reduce integration risks and align vendor implementation practices.
breadcrumbs:
  - Publications
tags:
  - Interoperability
  - Publication
  - MAIS
---

## Introduction

This document outlines an interoperability framework, which is necessary because connecting the multiple systems in and around social care requires a common means to exchange information. By establishing these common standards, the framework is expected to reduce the cost, risk, and unpredictability that are typically associated with such system-to-system integrations.

Its guidance is focused on the three areas that are considered most valuable: API discoverability; authentication; and documentation and versioning. It is anticipated that all three will be addressed through standards. A ‘target state’ description is included in each area to provide a quick overview of the intention of each.

The purpose of this document to start a conversation with vendors. It is expected that a working group will be formed that develops a consensus of what can be achieved before implementing these in practice.

## Interoperability Principles

Much of what the standards programme aims to achieve relies on APIs. If the intention is to reduce the cost and risk of each new integration, there are three things worth asking vendors to standardise: discoverability, authentication, and documentation.

### Discoverability Standard

The first suggested standard concerns discoverability. The Standards Programme aims to create an environment in which any authorised team or system can quickly identify whether a given vendor offers an API for a particular capability, what that API covers, and how to gain access to it without relying on informal knowledge or lengthy procurement conversations.

**Recommendations:**

* The Department for Education (DfE) and/or the Department for Health and Social care (DHSC) should fund the provision of an API register to which parties and vendors must register their API (or use existing platforms that can be utilised)
* Vendors should publish a machine-readable catalogue of all APIs they offer as part of their product, updated whenever new APIs are released or deprecated.
* Each API entry should include the following items: name, version, purpose, authentication mechanism, endpoint base URL, rate limits, and a link to full documentation.
* APIs intended for integration should be documented as a first-class part of the product, not as an afterthought in an obfuscated developer portal.
* Vendors should signal clearly which APIs are stable and supported versus experimental or deprecated, with a defined sunset timeline for deprecated versions.
* APIs should be self-documented in a standard machine-readable format such as OpenAPI specification.
* Sandbox or test environments should be available for all production APIs allowing for integration and testing without affecting live data.
* APIs should conform to a common structural standard (REST with OpenAPI 3.x specification is proposed) unless there is a strong technical reason otherwise.

**Target state:**

A developer in an organisation opens a shared portal, types the name of a vendor product and within seconds sees a list of available APIs, their status, and a link to authenticate and start testing without needing to raise a support ticket or search through PDFs.

### Authentication Standard

The second example concerns Identity and Access Management (IAM) standards. One of the highest-friction areas in API integration is authentication. Every bespoke authentication model requires new client code, new secret management, and separate onboarding. It is proposed to align on a common IAM approach.

**Recommendations:**

* Authentication should follow an agreed standard. It is proposed for this to be OAuth 2.0/OIDC. No proprietary session models or bespoke token formats that require per-vendor client libraries should be used.

**Target state:**

An integration engineer who has connected to one of the vendor's API in this ecosystem can connect to another vendor's API within hours rather than days, because the authentication flow is recognisably similar.

### Documentation and Versioning Standard

The third standard concerns documentation and versioning. Good APIs with poor documentation are almost as unusable as no APIs at all. Therefore, it is proposed to adopt a minimum documentation standard. Furthermore, integrations break when APIs change without warning. Consequently, a basic versioning convention is proposed, comprised of the tenets described in the recommendation below.

**Recommendations:**

* The Department for Education (DfE) and/or the Department for Health and Social care (DHSC) should fund the provision of an API register to which parties and vendors must register and document their API (or use existing platforms that can be utilised).
* Error codes and response envelopes should be fully documented and follow consistent conventions so that common integration tooling can handle errors generically.
* Rate limits and quotas should be communicated in response headers in a standard way, enabling clients to back off gracefully.
* An OpenAPI 3.x specification file, publicly accessible (or accessible with a valid API key).
* A quick-start guide covering: obtaining credentials, making the first authenticated call, and handling a common error.
* A change log recording breaking and non-breaking changes, with dates and version numbers.
* Clear statement of support level: what SLA (if any) applies to the API, who to contact for issues, and how breaking changes are communicated.
* APIs should be versioned in the URL path (e.g. /v1/, /v2/) or via a header — not via query parameters.
* A minimum of 12 months' notice should be given before a version is deprecated, with a clear migration guide to the replacement version.
* Non-breaking changes (adding optional fields, new endpoints) may be made within a version. Breaking changes require a new version.
* Vendors should aim to support at least two major versions concurrently during transition periods.

**Target state:**

An integration engineer who has connected to one of the vendor's API in this ecosystem can connect to another vendor's API within hours rather than days, because error handling and documentation structure are easy to find and recognisably similar.

## Suggested next steps

The following are the suggested next steps:

1. Share this document with relevant stakeholders, with both DfE and DHSC and complete an initial review. This will validate a common understanding about the content, intention, and next steps.
2. Share the documentation, authentication, and documentation and versioning standards with vendors
3. Establish a working group to further expound the standard. Key questions and themes for engagement include:
  * Which of these principles do vendors already meet, and which would require meaningful work to adopt?
  * Are there standards or approaches you would recommend in place of those proposed here?
  * What would make participation in a shared API register feasible or valuable for vendors?
  * What concerns do vendors have about an OAuth federation model, and what would they need to see before considering it?
  * What support could we offer to make adoption of these principles easier?

## Appendices

### Appendix 1: Sample Shared API Register

Table 1 below describes suggested sample fields for a possible shared API register.

**Table 1: Sample Fields and Description of a shared API register.**

| Field            | Example / Description                                              |
| :--------------- | :----------------------------------------------------------------- |
| Vendor           | Acme Corp                                                          |
| Product          | Acme HR Platform                                                   |
| API Name         | Employee Data API                                                  |
| Version          | v2.1                                                               |
| Base URL         | `https://api.acme.com/v2`                                          |
| Auth Method      | OAuth 2.0 — Client Credentials                                     |
| Scopes Available | employees:read, employees:write, org:read                          |
| Rate Limit       | 1,000 requests / minute per client                                 |
| Sandbox URL      | `https://sandbox.api.acme.com/v2`                                  |
| Documentation    | `https://docs.acme.com/api/v2`                                     |
| Status           | Stable — supported until Dec 2027                                  |
| Contact          | api-support@acme.com                                               |
{: .table-bordered}

The following steps describe how a lightweight, shared API register could function:

* Vendors to submit entries via a simple web form or a pull request to a shared repository (e.g. a YAML file in a Git repo).
* Entries are validated automatically against a schema before publication.
* The register is queryable via its own API, so internal tooling can surface it programmatically.
* Vendors are responsible for keeping their entries current; stale entries (not updated in 12 months) are flagged for review.

### Appendix 2: Sample Identity and Access Management (IAM) Standards

**Grant types by Use Case**

Table 2 below describes various relevant use cases and recommended grant.

**Table 2: Use Cases and Recommended Grant**

| Use Case                   | Recommended Grant          | Notes                                           |
| :------------------------- | :------------------------- | :---------------------------------------------- |
| System-to-system (no user) | Client Credentials         | Most common for back-end integrations           |
| User-delegated access      | Authorisation Code + PKCE  | Required where user consent is needed           |
| Federated identity (SSO)   | OIDC on top of Auth Code   | Allows our IdP to issue tokens                  |
| Legacy / simple cases      | API Key (short-term only)  | Acceptable as interim; not preferred long-term  |
{: .table-bordered}

In this example, vendors would support the following:

* Register as an OAuth client with our identity provider (or support federation to it).
* Accept Bearer tokens in the Authorization header — no custom header names or cookie-based auth for API calls.
* Publish their OAuth server metadata at a standard discovery endpoint: /.well-known/oauth-authorization-server.
* Define granular scopes so that integrations can request least-privilege access rather than broad read/write permissions.
* Support token introspection or JWT validation so we can verify token validity without vendor-specific libraries.

The longer-term aspiration is to explore feasibility for a federated trust model (where a token issued by our identity provider is accepted directly by vendor APIs). This will reduce the number of separate credentials teams must manage. It is recognised that this is a non-trivial ask and therefore must be explored in collaboration with key stakeholders.
