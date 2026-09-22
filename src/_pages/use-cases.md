---
title: Use Cases
regenerate: true
---

We are developing interoperability standards in social care to save time for frontline professionals, help deliver earlier intervention, provide better experiences for people who need support, and enhance insight for planning, commissioning, and improving services.

In 2025, through extensive research and engagement with the sector, a series of use cases where standards could help resolve some of the most important and urgent challenges were identified. We have since refined these further to incorporate new learning and evolving policy and practice.

We undertook a prioritisation process to identify where standards could deliver the greatest impact and where common core standards could support multiple use cases. This has guided our standards development roadmap.

Each use case below sets out the challenge, how standards could help address it, and the benefits this could deliver for people, practitioners and organisations across social care. 

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
