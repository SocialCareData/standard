---
title: Use Cases
regenerate: true
---

We’re developing interoperability standards in social care to help deliver earlier intervention, better experiences for people who draw on care and support, more time for frontline professionals, and improved insight for planning, commissioning and service improvement. 

In 2025, through extensive research and engagement with the sector, we identified a series of use cases where standards could support solutions to some of the most important information-sharing and data challenges facing the sector. We have since refined them to reflect new learning, respond to evolving policy and practice, and incorporate adult social care.  

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
