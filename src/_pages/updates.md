---
title: Updates
regenerate: true
---

<p>Articles in this section relate to social care data standardisation.</p>

{% include tag-filter.html items=site.posts %}

{% if site.posts.size > 0 %}
<ul class="content-list tag-filtered-list">
{% for post in site.posts %}
  <li data-tags="{{ post.tags | join: ',' }}">
    <h2 class="heading"><a href="{{ post.url }}">{{ post.title }}</a></h2>
    <span>{{ post.date | date: "%Y-%m-%d" }}</span>
    {% include tags.html tags=post.tags %}
  </li>
{% endfor %}
</ul>
{% endif %}
