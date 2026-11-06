---
title: Validator
description: Check that your data follows the published social care data standards, in your browser.
breadcrumbs:
  - Publications
publication_group: tool
---

## Using the Validator: Our Position on Data Protection

The Social Care Data Validator helps organisations check that records conform to the published interoperability standards before they are shared. It runs entirely in the user’s browser. We do not receive, store or have access to any record entered into it.

Because we never receive this data, we do not act as a controller or processor for it. Responsibility for the data stays with the organisation using the tool, along with its obligations under UK GDPR and the Data Protection Act 2018.

The web validator is intended for test, synthetic or genuinely anonymised records only. Social care data frequently includes special category and children’s information, and pseudonymised records remain personal data in law. For live records, organisations should use our [command-line tool](https://theodi.github.io/data-standard-validator/). It can run the same checks inside their own secure environment and under their own information governance controls.

A successful validation confirms that a record meets the technical standard. It does not confirm that sharing the record is lawful. That judgement remains with each organisation’s data protection officer and governance processes.

The standards and supporting content are published under the Open Government Licence v3. We welcome [feedback through GitHub](https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&page=https%3A%2F%2Fstandard.socialcaredata.io%2Fvalidator&category=Website+Content) as we continue to develop the service.

{% comment %}The standards the validator offers are configured in src/_data/validator.yml.{% endcomment %}
<div class="validator-frame" markdown="0">
  <data-standard-validator theme="light"></data-standard-validator>
</div>
<script type="module">
  import 'https://cdn.jsdelivr.net/npm/@theodi/data-standard-validator-component@1.0.0/standalone/data-standard-validator.js'
  document.querySelector('data-standard-validator').config = {{ site.data.validator.config | jsonify }}
</script>

## Other ways to validate

To check many records at once, or as part of an automated pipeline, use the
[command-line tool](https://theodi.github.io/data-standard-validator/). It runs
the same checks against the same
[published shapes](https://github.com/SocialCareData/ontology).

## Feedback

If a message is unclear, or you think a valid record is being rejected, please
[create a new issue on GitHub](https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&page={{ site.url | append: page.url | url_encode }}&category=Standards).
