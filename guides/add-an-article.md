# Add an article

Don't worry about breaking anything. Nothing changes on the live site until your pull request is reviewed, approved and merged. Every pull request also gets its own [preview site](getting-set-up.md#6-check-the-build), so you can see your changes first.

## 1. Create the file

Add a new file in `src/_pages/`.

- Use lowercase words joined with hyphens, ending in `.md`, for example `our-pilots.md`.
- The page URL comes from the file name, with hyphens changed to underscores: `our-pilots.md` becomes `/our_pilots`.

## 2. Add the front matter and content

Copy this into the file and change it:

```markdown
---
layout: article
title: Our Pilots
description: How we are testing the standards in real services.
tags:
  - Programme
breadcrumbs:
  - About
---

<article class="numbered-headings">

## First section

Your text here.

## Second section

More text.

</article>
```

The block between the two `---` lines is the **front matter**. It holds the page settings. Everything after it is the page content.

For a real example, see [learn-about-the-standards.md](../src/_pages/learn-about-the-standards.md).

## Front matter fields

| Field | Required | What it does |
| --- | --- | --- |
| `layout` | Yes | How the page is displayed. See [Layouts](#layouts). |
| `title` | Yes | The page heading and browser tab title. |
| `description` | No | A one-sentence summary shown in search engines and link previews. |
| `tags` | No | Groups related content. See [Tags](#tags). |
| `breadcrumbs` | No | The trail shown above the title, for example `About`. |
| `related` | No | Page URLs to show first in the "Related pages" box, for example `- /governance`. Other slots are filled automatically. |
| `related_pages` | No | Set to `false` to hide the "Related pages" box on this page. |
| `suggest_as_related` | No | Set to `false` to stop this page appearing in other pages' "Related pages". |

### Layouts

| Layout | Use it for |
| --- | --- |
| `article` | Most pages, for example About, Governance, Pilots. Shows "Related pages". **Use this if unsure.** |
| `use-case` | Use case pages (`UC…` files). Adds a table of contents and numbered headings. |
| `publication` | Standards and publications (`PUB…` files). Adds a table of contents, version and editor details. Needs extra fields, so copy an existing `PUB…` file to start. |
| `version` | An older, archived version of a standard. |
| *(leave out)* | A plain page with no sidebar or table of contents. |

With `article`, keep the `<article class="numbered-headings">` and `</article>` lines. They number your headings. The other layouts add them for you.

### Tags

Tags in use now:

`Programme`, `Use Case`, `Publication`, `Placements`, `MAIS`, `Joined Up Care`, `Working Group`, `Safeguarding`, `Person`, `Interoperability`, `Newsletter`

Use these where you can, spelled exactly the same (capital letters matter). Add a new tag only if none fit.

## 3. Write the content

The content is written in Markdown. Guides:

- [Markdown cheat sheet](https://www.markdownguide.org/cheat-sheet/)
- [GitHub: basic formatting](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)
- [GitHub: tables](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables)

A few rules for this site:

- Start headings at `##`. The `title` is already the main heading.
- Leave an empty line after `<article …>` and before `</article>`, or the Markdown won't display properly.
- Link to other pages on the site with their URL only, for example `[Governance](/governance)`, not `https://standard.socialcaredata.io/governance`.
- Broken links make the build fail, so check your URLs.

## 4. Next steps

- Add the page to the menu if it needs to be there: [Add a menu item](add-a-menu-item.md)
- Commit, push and open a pull request: [Getting set up](getting-set-up.md#5-open-a-pull-request)
