---
title: Social Care Interoperability Standards Editors
tags:
  - Programme
regenerate: true
---

This references the content owners for each content category in the standards website.

{% assign all_content = site.pages | concat: site.posts | sort: "title" %}
{% assign all_tags = "" | split: "" %}
{% for item in all_content %}
  {% for tag in item.tags %}
    {% unless all_tags contains tag %}
      {% assign all_tags = all_tags | push: tag %}
    {% endunless %}
  {% endfor %}
{% endfor %}
{% assign all_tags = all_tags | sort %}

{% include tag-filter.html items=all_content %}

<h2>Editors</h2>

<ul class="content-list">
{% for editor_pair in site.data.editors %}
  {% assign editor_name = editor_pair[0] %}
  {% assign editor = editor_pair[1] %}
  {% unless editor.current %}{% continue %}{% endunless %}
  <li data-tags="{{ editor.tags | join: ',' }}">
    <strong>{% if editor.github and editor.github != "" %}<a href="https://github.com/{{ editor.github }}">{{ editor_name }}</a>{% else %}{{ editor_name }}{% endif %}</strong>
    {% include tags.html item=editor %}
  </li>
{% endfor %}
</ul>

<h2>Content</h2>

<ul class="content-list">
{% for item in all_content %}{% if item.title %}
  <li data-tags="{{ item.tags | join: ',' }}">
    <strong><a href="{{ item.url }}">{{ item.title }}</a></strong>
    {% include tags.html item=item %}
  </li>
{% endif %}{% endfor %}
</ul>

<h2>Past Editors</h2>

<ul class="content-list">
{% for editor_pair in site.data.editors %}
  {% assign editor_name = editor_pair[0] %}
  {% assign editor = editor_pair[1] %}
  {% if editor.current %}{% continue %}{% endif %}
  <li data-tags="{{ editor.tags | join: ',' }}">
    <strong>{% if editor.github and editor.github != "" %}<a href="https://github.com/{{ editor.github }}">{{ editor_name }}</a>{% else %}{{ editor_name }}{% endif %}</strong>
    {% include tags.html item=editor %}
  </li>
{% endfor %}
</ul>
