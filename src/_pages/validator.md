---
title: Validator
description: Check social care records against the published standards, in your browser.
---

Check a JSON-LD record against one of the published standards. Choose the
standard, paste your record or load an example, and see what needs fixing and
on which line.

<div class="validator-frame" markdown="0">
  <data-standard-validator theme="light"></data-standard-validator>
</div>
<script type="module">
  import '{{ site.data.validator.bundle }}'
  document.querySelector('data-standard-validator').config = {{ site.data.validator.config | jsonify }}
</script>

[What the messages mean](https://github.com/theodi/data-standard-validator/blob/main/docs/error-reference.md)
· [Command-line tool](https://theodi.github.io/data-standard-validator/)
· [Give feedback](https://github.com/SocialCareData/standard/issues/new)
