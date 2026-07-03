---
title: Calendar
tags:
  - Working Group
regenerate: true
---

Data standards for social care [standards working groups](/standards_working_groups) meetings (find out how to [participate](/standards_working_groups#participation)).

{% include tag-filter.html items=site.data.calendar %}

{% assign sorted = site.data.calendar | sort: "date" | reverse %}
{% if sorted.size > 0 %}
<ul class="content-list">
{% for event in sorted %}
  <li data-tags="{{ event.tags | join: ',' }}">
    <h2 class="heading">{% if event.url %}<a href="{{ event.url }}">{{ event.title }}</a>{% else %}{{ event.title }}{% endif %}</h2>
    <span>{{ event.date | date: "%Y-%m-%d" }}</span>
    {% include tags.html item=event %}
  </li>
{% endfor %}
</ul>
{% endif %}
