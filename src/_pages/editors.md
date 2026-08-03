---
title: Social Care Interoperability Standards Editors
regenerate: true
---

This references the content owners for each content category in the standards website.

{% assign editor_pages = site.pages | where_exp: "item", "item.tags.size > 0" | sort: "url" %}
{% assign editor_posts = site.posts | where_exp: "item", "item.tags.size > 0" %}
{% assign all_content = editor_pages | concat: editor_posts %}
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

<ul class="content-list tag-filtered-list">
{% for editor_pair in site.data.editors %}
  {% assign editor_name = editor_pair[0] %}
  {% assign editor = editor_pair[1] %}
  {% unless editor.current %}{% continue %}{% endunless %}
  <li data-tags="{{ editor.tags | join: ',' }}">
    {% if editor.github and editor.github != "" %}<a href="https://github.com/{{ editor.github }}"><strong>{{ editor_name }}</strong></a>{% else %}<strong>{{ editor_name }}</strong>{% endif %}
    {% include tags.html tags=editor.tags %}
  </li>
{% endfor %}
</ul>

<h2>Content</h2>

<h3>Pages</h3>

<ul class="content-list tag-filtered-list">
{% for item in editor_pages %}{% if item.title %}
  <li data-tags="{{ item.tags | join: ',' }}">
    <a href="{{ item.url }}"><strong>{% if item.reference %}{{ item.reference }} {% endif %}{% if item.version %}Version {{ item.version }} - {% endif %}{{ item.title }}</strong></a>
    {% include tags.html tags=item.tags %}
  </li>
{% endif %}{% endfor %}
</ul>

<h3>Posts</h3>

<ul class="content-list tag-filtered-list">
{% for item in editor_posts %}{% if item.title %}
  <li data-tags="{{ item.tags | join: ',' }}">
    <a href="{{ item.url }}"><strong>{{item.date | date: "%Y-%m-%d"}} - {{ item.title }}</strong></a>
    {% include tags.html tags=item.tags %}
  </li>
{% endif %}{% endfor %}
</ul>



<h2>Past Editors</h2>

<ul class="content-list tag-filtered-list">
{% for editor_pair in site.data.editors %}
  {% assign editor_name = editor_pair[0] %}
  {% assign editor = editor_pair[1] %}
  {% if editor.current %}{% continue %}{% endif %}
  <li data-tags="{{ editor.tags | join: ',' }}">
    <strong>{% if editor.github and editor.github != "" %}<a href="https://github.com/{{ editor.github }}">{{ editor_name }}</a>{% else %}{{ editor_name }}{% endif %}</strong>
    {% include tags.html tags=editor.tags %}
  </li>
{% endfor %}
</ul>
