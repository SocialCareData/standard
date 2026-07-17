---
title: Publications
tags:
  - Programme
  - Publication
regenerate: true
---

{% assign publications = site.pages | where_exp: "p", "p.breadcrumbs contains 'Publications'" | sort: "title" %}
{% if publications.size > 0 %}
<ul class="content-list">
{% for p in publications %}
  <li>
    <h2 class="heading"><a href="{{ p.url }}">{{ p.title }}</a></h2>
    {% if p.description %}<p>{{ p.description }}</p>{% endif %}
  </li>
{% endfor %}
</ul>
{% else %}
<p>No publications found.</p>
{% endif %}

