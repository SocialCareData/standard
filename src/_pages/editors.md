---
title: Social Care Interoperability Framework Editors
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

<h2>Editors by tag</h2>
<table class="editors-table">
  <thead><tr><th>Tag</th><th>Editors</th></tr></thead>
  <tbody>
  {% for tag in all_tags %}
    <tr>
      <td><a class="tag" href="{{ page.permalink }}?tag={{ tag | url_encode }}">{{ tag }}</a></td>
      <td>
        {% assign tag_editors = site.data.editors[tag] %}
        {% if tag_editors %}
          {% for editor in tag_editors %}
            {% if editor.github and editor.github != "" %}<a href="https://github.com/{{ editor.github }}">{{ editor.name }}</a>{% else %}{{ editor.name }}{% endif %}{% unless forloop.last %}; {% endunless %}
          {% endfor %}
        {% else %}—{% endif %}
      </td>
    </tr>
  {% endfor %}
  </tbody>
</table>

<h2>Content by tag</h2>

{% include tag-filter.html items=all_content %}

<ul class="article-list">
{% for item in all_content %}{% if item.title %}
  <li data-tags="{{ item.tags | join: ',' }}">
    <strong><a href="{{ item.url }}">{{ item.title }}</a></strong>
    {% include tags.html item=item %}
  </li>
{% endif %}{% endfor %}
</ul>
