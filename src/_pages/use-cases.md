---
title: Use Cases
tags:
  - Programme
  - Use Case
regenerate: true
---

{% assign use_cases = site.pages | where_exp: "p", "p.tags contains 'Use Case' and p.url != page.url" | sort: "title" %}

{% include tag-filter.html items=use_cases exclude_tag="Use Case" %}

{% if use_cases.size > 0 %}
<ol class="article-list">
{% for p in use_cases %}
  <li>
    <h2 class="heading">{% if p.reference %}[{{ p.reference }}]{% endif %} <a href="{{ p.url }}">{{ p.title }}</a></h2>
    {% include tags.html item=p exclude_tag="Use Case" %}
  </li>
{% endfor %}
</ol>
{% else %}
<p>No use cases found.</p>
{% endif %}
