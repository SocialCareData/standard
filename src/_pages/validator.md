---
title: Validator
description: Check that your data follows the published social care data standards, in your browser.
breadcrumbs:
  - Publications
publication_group: tool
---

Check that a record follows one of the published standards before you share it.
Choose a standard, paste a JSON-LD record or load an example, then select
**Validate**. Each problem is explained in plain English, with the line it is on.

Records are checked entirely within your browser. They are not sent to any
server and are not stored. However, you should only use test or anonymised
records here. To check records that contain real personal data, use the
[command-line tool](https://theodi.github.io/data-standard-validator/) within
your own organisation's systems.

{% comment %}The standards the validator offers are configured in src/_data/validator.yml.{% endcomment %}
<div class="validator-frame" markdown="0">
  <data-standard-validator theme="light"></data-standard-validator>
</div>
<script type="module">
  import 'https://cdn.jsdelivr.net/gh/theodi/data-standard-validator-component@v0.2.1/standalone/data-standard-validator.js'
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
