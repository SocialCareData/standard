---
title: Publications
regenerate: true
---

{% assign publications = site.pages | where_exp: "p", "p.breadcrumbs contains 'Publications'" | where_exp: "p", "p.version == nil or p.version == 'latest'" | sort: "reference" %}

## Data standards

<ul class="content-list">
{% for p in publications %}{% if p.publication_group == nil %}
  <li>
    <h3 class="heading">[{{ p.reference }}] <a href="{{ p.url }}">{{ p.title }}</a></h3>
    {% if p.description %}<p>{{ p.description }}</p>{% endif %}
  </li>
{% endif %}{% endfor %}
</ul>

## Guides

<ul class="content-list">
{% for p in publications %}{% if p.publication_group == "guide" %}
  <li>
    <h3 class="heading">[{{ p.reference }}] <a href="{{ p.url }}">{{ p.title }}</a></h3>
    {% if p.description %}<p>{{ p.description }}</p>{% endif %}
  </li>
{% endif %}{% endfor %}
</ul>

## Tools

<ul class="content-list">
{% for p in publications %}{% if p.publication_group == "tool" %}
  <li>
    <h3 class="heading"><a href="{{ p.url }}">{{ p.title }}</a></h3>
    {% if p.description %}<p>{{ p.description }}</p>{% endif %}
  </li>
{% endif %}{% endfor %}
</ul>
