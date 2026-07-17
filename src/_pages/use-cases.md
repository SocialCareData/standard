---
title: Use Cases
tags:
  - Programme
  - Use Case
regenerate: true
---

{% assign use_cases = site.pages | where_exp: "p", "p.breadcrumbs contains 'Use Cases'" | sort_natural: "reference" %}

{% include tag-filter.html items=use_cases exclude_tag="Use Case" %}

{% if use_cases.size > 0 %}
<ol class="content-list tag-filtered-list">
{% for uc in use_cases %}
  <li data-tags="{{ uc.tags | join: ',' }}">
    <h2 class="heading">{% if uc.reference %}[{{ uc.reference }}]{% endif %} <a href="{{ uc.url }}">{{ uc.title }}</a></h2>
    {% assign uc_tags = uc.tags | where_exp: "t", "t != 'Use Case'" %}
    {% include tags.html tags=uc_tags %}
  </li>
{% endfor %}
</ol>
{% else %}
<p>No use cases found.</p>
{% endif %}
