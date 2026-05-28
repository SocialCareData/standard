# Codebase Review — Suggestions for Improvement

This document is the output of a full review of the
[`SocialCareData/standard`](https://github.com/SocialCareData/standard) Jekyll
site. Each item below describes a single potential improvement, the reasoning
behind it and a recommended action. No code or content is changed in this PR —
the intent is to give the team a triagable list. Items are deliberately
**self-contained** so they can be picked up individually as follow-up issues or
PRs.

In line with the brief, **no new dependencies, libraries or frameworks are
proposed**. Every recommendation is achievable with what is already in the
repository (Jekyll 4.4, Kramdown/Rouge, plain CSS/JS, the existing Ruby
plugins, GitHub Actions and Pagefind).

Items are flagged with a rough severity:

- 🔴 **High** — likely a real bug, broken behaviour, accessibility/SEO defect,
  or a build/security smell.
- 🟠 **Medium** — clear quality or consistency improvement.
- 🟢 **Low** — polish or stylistic suggestion.


## 1. Configuration (`_config.yml`, `Gemfile`)

### 1.1 🔴 Commit `Gemfile.lock`
- **Where:** `.gitignore` line 4.
- **Today:** `Gemfile.lock` is ignored.
- **Why it matters:** The repo is a **site/application**, not a gem. Ignoring
  the lockfile means CI, Docker and contributors can each resolve different
  versions of Jekyll, Kramdown, Rouge etc., causing builds that diverge from
  what was tested locally. The `bundler-cache: true` step in the GitHub
  workflow only really pays off when there is a lockfile to key off.
- **Recommendation:** Remove `Gemfile.lock` from `.gitignore` and commit it.

### 1.2 🟠 Use Jekyll-standard `url` / `baseurl` rather than `base_url`
- **Where:** `_config.yml` line 3 (`base_url:`), and every consumer
  (`_layouts/default.html`, `_pages/feed.xml`, `_pages/sitemap.xml`).
- **Why it matters:** Jekyll defines two well-known site variables — `site.url`
  (the absolute origin) and `site.baseurl` (the path prefix). Inventing a third
  variable `base_url` breaks any future plugin or third-party tool that relies
  on the conventional names (e.g. `jekyll-seo-tag`, sitemap plugins, theme
  helpers), and confuses contributors.
- **Recommendation:** Rename to `url:` and update the three or four
  call-sites. The `prepend: site.base_url` filters become
  `absolute_url` / `prepend: site.url` accordingly.

### 1.3 🟢 DRY up front matter with `defaults`
- **Where:** every page sets `layout: default`, every post sets `layout: post`,
  plus most posts/pages set their `permalink` manually.
- **Recommendation:** Add a small `defaults:` block to `_config.yml` setting
  `layout: default` for `_pages` and `layout: post` for `_posts`. Each
  document can still override. This removes ~30 lines of repeated front
  matter and makes adding a new page lower-friction.

### 1.4 🟢 Remove the duplicated `rouge_theme` key at the top level
- **Where:** `_config.yml` line 47 (`rouge_theme: github`) duplicates
  `styles.rouge_theme` (line 32). Only the nested one is read by
  `_plugins/concat_styles.rb`; the top-level one is dead config.

### 1.5 🟢 Add `lang`/`locale` metadata properly
- **Where:** `_config.yml` is missing a `lang:` field, and
  `default.html` hard-codes `<html lang="en">` and `og:locale = "en"`.
- **Why:** Open Graph expects a locale identifier of the form `xx_XX`
  (e.g. `en_GB`) — bare `en` is ignored by some consumers. The HTML `lang`
  could likewise be `en-GB` since the content is UK-government writing.


## 2. Layouts, Includes and Templating (`_layouts/`, `_includes/`)

### 2.1 🔴 Breadcrumb "current page" should not be a link
- **Where:** `_includes/breadcrumbs.html` line 5:
  `<li><a href="#" aria-current="page">{{ page.title }}</a></li>`.
- **Why:** WAI-ARIA breadcrumb pattern says the current location is **not** a
  link; it should be plain text (e.g. a `<span aria-current="page">`).
  Today, screen-reader users hear it announced as a link to `#` (which simply
  scrolls to the top), and sighted users see an unexpectedly clickable item.
- **Recommendation:** Replace the `<a href="#">` with `<span aria-current="page">`.

### 2.2 🟠 Use `page.url`, not `page.permalink`, for canonical / OG URLs
- **Where:** `_layouts/default.html` lines 9 and 17 wrap `<link rel="canonical">`
  and `og:url` inside `{% if page.permalink %}`.
- **Why:** Every Jekyll page has a `page.url`, whether or not a custom
  permalink is set in front matter. The current pattern silently drops the
  canonical link from any page where the author forgot to add `permalink:`.
- **Recommendation:** Switch to `{{ page.url | absolute_url }}` (and drop the
  `if` guard).

### 2.3 🟠 Search button should be a `<button>`, not `<a href="#">`
- **Where:** `_layouts/default.html` lines 33–39.
- **Why:** `<a href="#">` with `onclick="…open()"` is not a real link — with
  JavaScript disabled it scrolls to the top of the page; with JavaScript
  enabled it still pushes a `#` into the URL/history. A semantic
  `<button type="button">` avoids both problems and matches what the control
  actually does (open a modal).
- **Recommendation:** Render `<button type="button" aria-label="Search">` and
  bind the click handler in `assets/js/menu.js` (keeping CSP-friendly inline
  JS out of the markup).

### 2.4 🟠 Hamburger button missing `aria-expanded` / `aria-controls`
- **Where:** `_layouts/default.html` line 43 and `assets/js/menu.js` lines 5–9.
- **Why:** A disclosure-style button should expose its current state with
  `aria-expanded="true|false"` and target its panel via `aria-controls`.
  Today screen-reader users get no feedback when the menu opens or closes.
- **Recommendation:** Render `aria-expanded="false" aria-controls="primary-nav"`,
  give the `<nav>` `id="primary-nav"`, and toggle `aria-expanded` in `menu.js`
  alongside the `open` class.

### 2.5 🟠 Logo `<img>` is missing `width`/`height`
- **Where:** `_layouts/default.html` line 60: `<img alt="…" src="/assets/icon/icon.png">`.
- **Why:** Browsers can't reserve space without intrinsic dimensions, causing
  Cumulative Layout Shift (CLS) on slow connections — a Core Web Vitals
  penalty.
- **Recommendation:** Add `width` and `height` attributes that match the
  source PNG.

### 2.6 🟠 Render-blocking Pagefind stylesheet in `<head>`
- **Where:** `_layouts/default.html` line 25.
- **Why:** The Pagefind UI CSS is only required after the user opens the
  search modal; loading it in `<head>` blocks first paint on every page.
- **Recommendation:** Either move the `<link>` to the end of `<body>`, or use
  the standard "load asynchronously and swap" pattern (`media="print"
  onload="this.media='all'"`). No new dependency required.

### 2.7 🟠 Per-post metadata (description, image, last modified)
- **Where:** every file under `_posts/`.
- **Why:** `og:description`/`og:image` are emitted by the layout, but no post
  defines `description:` or `image:` in its front matter, so social cards are
  blank. Likewise `<p>Published on: …</p>` in `_layouts/post.html` doesn't use
  `<time datetime="…">` and doesn't show `last_modified` from the
  `last_modified` plugin.
- **Recommendation:**
  1. Add a short `description:` (1 sentence) and optional `image:` to each
     post's front matter — useful for OG, Twitter cards and the RSS feed.
  2. Update `_layouts/post.html` to render a `<time datetime>` element and,
     when available, "Last updated: …" using `page.last_modified`.

### 2.8 🟠 Add Twitter Card meta tags
- **Where:** `_layouts/default.html` `<head>`.
- **Why:** The site already emits Open Graph tags; adding
  `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
  gives big preview cards on Twitter/X, LinkedIn and Slack.

### 2.9 🟢 Add a `<meta name="description">` tag
- **Where:** `_layouts/default.html` `<head>` — only `og:description` exists.
- **Why:** Google still uses the classic `<meta name="description">` for
  snippets. Falling back to `site.description` when `page.description` is
  absent costs nothing.

### 2.10 🟠 Inline `onclick` couples markup to JS
- **Where:** the search anchor (2.3 above) is the only inline handler today.
  Worth eliminating to keep the door open for a strict CSP later.


## 3. Pages and Generated Files (`_pages/`)

### 3.1 🔴 RSS feed mixes RSS 2.0 and Atom syntax (likely renders as invalid)
- **Where:** `_pages/feed.xml`.
- **Why:** The root element is `<rss version="2.0">` but the per-item body uses
  `<content type="html">…</content>`, which is **Atom**, not RSS. RSS 2.0
  readers expect `<description>` inside `<item>`. The file also declares an
  `<atom:link rel="self">` (acceptable) but lacks `<guid>` for each item.
- **Recommendation:** Pick one of:
  - Stay on RSS 2.0: replace `<content type="html">` with `<description>` and
    add `<guid isPermaLink="true">{{ post.url | absolute_url }}</guid>`; or
  - Convert to a proper Atom 1.0 feed (`<feed xmlns="http://www.w3.org/2005/Atom">`,
    `<entry>` instead of `<item>`, `<updated>`, `<id>`).
  Either is fine; the current hybrid is technically invalid.

### 3.2 🟠 Sitemap inconsistencies
- **Where:** `_pages/sitemap.xml`.
- **Why:** It iterates pages keyed by `page.permalink` but posts by `post.url`.
  Combined with 2.2 above, any page without an explicit `permalink:` will be
  silently dropped from the sitemap.
- **Recommendation:** Use `page.url | absolute_url` for both, and filter out
  the 404 / feed / sitemap via `page.url`. While there, gate on
  `page.sitemap != false` so individual pages can opt out.

### 3.3 🔴 `/calendar` is an empty page in the main nav
- **Where:** `_pages/calendar.md` (6 lines, no content) — but
  `_config.yml` lists it under `nav:`.
- **Why:** Users clicking "Calendar" land on a blank page titled "Calendar",
  which looks broken.
- **Recommendation:** Either populate the page (embed an iCal / Google
  Calendar link, list upcoming SWG meetings) or remove it from the nav until
  it's ready. A minimum-viable version could simply link to each SWG's posts.

### 3.4 🟠 Permalink style is inconsistent and non-standard
- **Where:** `_pages/*` use underscores (`/use_cases`,
  `/mais_standards_working_group`, `/placements_standards_working_group`,
  `/standards_working_groups_terms_of_reference`, `/use_case_children_social_care_placements`);
  posts use hyphens (`/2026-04-07-newsletter`).
- **Why:** Google's URL guidelines explicitly recommend hyphens, not
  underscores, as word separators. The current page URLs are also unusually
  long; some are 50+ characters of `snake_case`.
- **Recommendation:**
  1. Move to hyphens (`/use-cases`, `/mais`, `/placements`,
     `/standards-working-groups`, `/terms-of-reference`, etc.).
  2. Keep the old permalinks alive with 301 redirects (a small `_redirects`
     file isn't supported by Pages, but `jekyll-redirect-from`'s plain-HTML
     output can be reproduced manually using stub pages with
     `<meta http-equiv="refresh">`, no new dependency needed). At minimum,
     change is most cheaply done while traffic is still small.

### 3.5 🟢 Thin index pages
- **Where:** `_pages/use-cases.md` (one bullet) and `_pages/publications.md`
  (one bullet) feel placeholder-y.
- **Recommendation:** A one-paragraph intro on each would give context and
  improve SEO. Even one line — "We will add publications here as standards
  reach 1.0" — is better than the bare list.

### 3.6 🟢 The category filter on `/updates` is JS-only and slightly brittle
- **Where:** `_pages/updates.md` lines 40–51.
- **Why:** The script reads `?category=…` from the URL but does **not** call
  `decodeURIComponent` on the value, while the Liquid links use `url_encode`.
  Any category containing a space, accent or `'` will fail to filter (e.g.
  `Working Group` is encoded as `Working+Group` by `url_encode`, and the
  script's `params.get` decodes `+` as ` ` for `URLSearchParams` — OK — but
  other encodings still bite). Also, clicking "All" does not update the URL,
  so the filter persists on reload.
- **Recommendation:**
  1. Build per-category archive pages at compile time (a small Liquid loop —
     no plugin required) so the listing works without JavaScript and is
     indexable. Use the filter script as progressive enhancement only.
  2. Make "All" a real link to `{{ page.permalink }}` (it already is — but it
     should also `pushState`/clear the filter so the URL matches the view).

### 3.7 🟢 Auto-numbering double-up risk
- **Where:** `_pages/standards-working-groups-terms-of-reference.md` (`## 1.`,
  `## 2.`, `## 3.`, `## 4.`, `## 6.` …), some newsletter posts use `## 1.
  Placements …`.
- **Why:** When wrapped in `<article class="numbered-headings">` (see
  `assets/css/base.css` lines 280–305), CSS auto-numbers every `h2`. Pages
  using manual numbers therefore render as `1. 1. Introduction`,
  `1. 2. Initiative Overview`, etc. The ToR page also **skips 5**, jumping
  from "4. Membership" to "6. Meeting Frequency".
- **Recommendation:** Pick one — either rely on the CSS counter (drop the
  manual numbers) or drop the `numbered-headings` class on pages that
  pre-number. While editing, fix the missing "5. …" section in the ToR.

### 3.8 🟠 Broken issue-template link
- **Where:** `_pages/placements-standard.md` line 521:
  `?template=content_issue.yml&title=…`.
- **Why:** There is no `.github/ISSUE_TEMPLATE/content_issue.yml` in the
  repository, so the link falls back to a generic blank issue, ignoring the
  intent of the link.
- **Recommendation:** Add a small `.github/ISSUE_TEMPLATE/content_issue.yml`
  form (a single textarea is enough). No new dependency required.


## 4. Plugins (`_plugins/*.rb`)

### 4.1 🟠 `concat_styles.rb` — `modified?` ignores Rouge theme changes
- **Where:** `_plugins/concat_styles.rb` lines 39–46.
- **Why:** `modified?` only compares mtimes of the input CSS files. The
  output also depends on `styles.rouge_theme` from `_config.yml`. Editing
  `_config.yml` to change the theme does **not** invalidate the cached
  output, so the change isn't picked up by `jekyll serve --incremental`.
- **Recommendation:** Also include `_config.yml`'s mtime, or hash the resolved
  inputs (file paths, rouge theme name, minify flag) and store/compare a
  signature.

### 4.2 🟠 `concat_styles.rb` — implicit alphabetical ordering
- **Where:** lines 16–17 (`Dir.glob(…).sort`).
- **Why:** The concatenation order of CSS files is whatever
  `String#<=>` gives you — today it happens to be `base, breadcrumb, footer,
  header, toc`, which works by luck. Adding a new file like `_buttons.css`
  could quietly change the cascade.
- **Recommendation:** Either (a) document the convention (e.g. "files are
  loaded alphabetically, name them with `00-base.css`, `10-…`"), or
  (b) accept an explicit `styles.files:` list in `_config.yml` and only fall
  back to alphabetical globbing if absent.

### 4.3 🟢 `concat_styles.rb` — minification regexes
- **Where:** lines 26–30. The current `gsub(/\/\*.*?\*\//m, '')` strips every
  `/* … */`, including comments inside strings (rare in CSS, but possible in
  `content: "/* … */";`). The whitespace-collapsing rules also remove
  significant whitespace in CSS custom selectors (e.g.
  `:is(h1, h2)` → fine; `calc(100% - 1rem)` could theoretically break if it
  ever appears inside one of the targeted symbol-adjacent contexts).
  Today the rules are safe for the current stylesheets; flag for the future.

### 4.4 🟠 `last_modified.rb` — shells out with raw interpolation
- **Where:** `_plugins/last_modified.rb` line 8:
  `` `git log -1 --format="%ci" -- "#{path}"` ``.
- **Why:**
  1. It uses backticks, which spawn a shell — any filename containing a
     shell metacharacter would be interpreted by `/bin/sh`. The risk is low
     (filenames are controlled by the team), but the safer idiom is
     `Open3.capture2("git", "log", "-1", "--format=%ci", "--", path)`.
  2. It runs once per page on every build. On a watching dev server this is
     fine, but it scales linearly with `_pages + _posts` and is recomputed
     even for unchanged files. A single batched `git log --name-only` pass
     would be O(1) for the whole site.
- **Recommendation:** Switch to `Open3.capture2` (or `IO.popen` with array
  args) at minimum; consider a batched lookup if the page count grows.

### 4.5 🟢 `pagefind.rb` — runs on every dev build
- **Where:** `_plugins/pagefind.rb`.
- **Why:** During `jekyll serve --watch`, every incremental rebuild re-runs
  a full Pagefind index, which is slow and noisy. The post-write hook also
  has no way to be turned off short of editing `_config.yml`.
- **Recommendation:** Skip the hook when `ENV["JEKYLL_ENV"] != "production"`
  (or honour `site.config["pagefind"]` being `false`), and let the CI
  workflow do the indexing — which it already does explicitly (see 5.2).

### 4.6 🟢 `turtle_lexer.rb` — minor regex polish
- **Where:** line 28: prefixed-name regex
  `([a-zA-Z_][a-zA-Z0-9_-]*)?:([a-zA-Z0-9_\-\.]*)?` makes both halves
  optional, so it also matches a lone `:`. Tightening to `…([a-zA-Z0-9_\-\.]*)`
  (no inner `?`) avoids classifying random colons as prefixed names.

### 4.7 🟢 Pagefind double-run in CI
- **Where:** `_plugins/pagefind.rb` runs on `post_write`, and
  `.github/workflows/jekyll.yml` runs `npx pagefind --site _site` separately.
- **Why:** During `bundle exec jekyll build`, Pagefind isn't on PATH yet
  (Node is installed in a later step), so the plugin currently logs a
  warning and the explicit `npx pagefind` step does the real work. The plugin
  is therefore effectively dead in CI but produces a confusing "Pagefind:
  indexing failed" warning every time.
- **Recommendation:** Either move `setup-node` + `npm i -g pagefind`
  **before** the Jekyll build (and drop the explicit `npx pagefind` step),
  or skip the plugin in CI (see 4.5).


## 5. CI / Build (`.github/workflows/jekyll.yml`)

### 5.1 🟠 Pin Pagefind version
- **Where:** `.github/workflows/jekyll.yml` line 24 (`npx pagefind …`) and
  `Dockerfile` line 15 (`npm install -g pagefind`).
- **Why:** Both pull whatever version `npm` happens to serve up at build time.
  A breaking Pagefind release would silently break search.
- **Recommendation:** Pin a version (e.g. `npx pagefind@1.4`,
  `npm install -g pagefind@1.4`) and let Dependabot bump it.

### 5.2 🟠 No build-time link checking or HTML validation
- **Where:** the workflow only runs `jekyll build` + `pagefind`.
- **Why:** Several findings in this review (broken issue-template link,
  inconsistent permalinks, the cancelled `<a href="#">`) would be caught by a
  generic link-check pass on `_site/`.
- **Recommendation:** Add a job that walks `_site/**/*.html` checking for
  internal `<a href="/…">` targets that exist on disk. This is doable in
  ~30 lines of pure Ruby (a `Find.find(_site)` + `Nokogiri::HTML` walk —
  Nokogiri is already a transitive dep of Jekyll, so no new gem). External
  link checks can be left as a manual concern.

### 5.3 🟢 No preview deploys for PRs
- **Where:** the workflow only triggers on `push` to `main`.
- **Why:** Today, a reviewer can't see what a draft page or post looks like
  without checking out the branch and running Jekyll locally.
- **Recommendation:** Add a `pull_request:` trigger that runs the build (but
  not the deploy job) and uploads `_site/` as an artifact. GitHub Pages
  preview environments are also an option for orgs that have them enabled.

### 5.4 🟢 Cache Pagefind output between runs
- **Where:** every CI run re-indexes from scratch. Pagefind's index is
  deterministic for a given build; caching the `pagefind/` folder keyed on
  the `_site` hash would shave a few seconds per build. Low priority.


## 6. Docker (`Dockerfile`, `docker-compose.yml`)

### 6.1 🟠 Ruby version drift between Docker and CI
- **Where:** `Dockerfile` `ARG RUBY_VERSION=3` (resolves to whatever Ruby 3
  is current on Alpine) vs. `.github/workflows/jekyll.yml` line 15
  `ruby-version: '3.4'`.
- **Why:** Local Docker users can produce builds on a different Ruby
  patchlevel than CI. With a committed `Gemfile.lock` (see 1.1) this becomes
  visible; without it, it's invisible drift.
- **Recommendation:** Pin to `RUBY_VERSION=3.4` in the Dockerfile to match CI.

### 6.2 🟠 Add a `.dockerignore`
- **Where:** missing at repo root.
- **Why:** Without one, the Docker build context includes `_site/`, `.git/`,
  `.jekyll-cache/`, IDE folders, PDFs, spreadsheets, etc., bloating the
  context and slowing first-time builds.
- **Recommendation:** A few lines covering `_site/`, `.git/`, `.jekyll-cache/`,
  `.jekyll-metadata`, `.vscode/`, `.DS_STORE`.

### 6.3 🟢 `docker-compose.yml` and `Dockerfile` duplicate `CMD`
- **Where:** Dockerfile `CMD` uses `--watch --incremental`; compose overrides
  to `--watch` (no `--incremental`). The override is silent and easy to miss.
- **Recommendation:** Drop the `command:` line from compose (let the
  Dockerfile own it) or document why incremental is disabled.

### 6.4 🟢 Pin `pagefind` (see 5.1)
- The Docker image installs `pagefind` globally with no version pin, so
  rebuilding the image months apart can produce different search behaviour.


## 7. Repository hygiene (`.github/`, `README.md`, `.editorconfig`)

### 7.1 🔴 Typo in `README.md`
- **Where:** `README.md` line 3: "interoperabilty" → "interoperability".

### 7.2 🟠 Add issue templates
- **Where:** `.github/ISSUE_TEMPLATE/` is missing.
- **Why:** Drives quality of community contributions; also fixes 3.8.
- **Recommendation:** A `content_issue.yml` form for content/standard issues
  and a `bug_report.yml` for site bugs would be enough. (Note: this is *config*
  not a dependency.)

### 7.3 🟠 Add a PR template
- **Where:** `.github/PULL_REQUEST_TEMPLATE.md` is missing.
- **Recommendation:** A short template with "What changed / Why / Screenshots
  if visual / Linked issue" — improves reviewer ergonomics.

### 7.4 🟠 `CODEOWNERS` has a single owner
- **Where:** `.github/CODEOWNERS` lists only `@matthieubosquet`.
- **Why:** Bus-factor; also, PRs that touch every file path require that one
  person's approval to merge.
- **Recommendation:** Add at least one secondary reviewer per path. (Not a
  code change strictly — process suggestion.)

### 7.5 🟢 `.editorconfig` indent_size for `.md` differs from `.html`
- **Where:** `.editorconfig` lines 3–12.
- **Why:** `[*]` sets `indent_size = 4`, then `[*.md]` overrides to 2. The
  Liquid-heavy `_layouts/*.html` would also benefit from `indent_size = 2`
  for consistency with the existing files (which use 4-space). Either bring
  the layouts to 2-space (matching the markdown) or add `[*.{html,liquid}]`
  overrides if you keep 4 — current state mixes 4-space in layouts with
  2-space in markdown.


## 8. Content / writing style (posts and pages)

### 8.1 🟠 Inconsistent UK English: "focussing" vs "focusing"
- **Where:** `_pages/mais-standards-working-group.md` uses "focussing"
  (lines 10, 17); every newsletter and most other posts use "focusing".
- **Why:** Both are valid in UK English, but modern UK style guides
  (incl. GOV.UK's Style Guide) prefer the single-s spelling. Inconsistency
  between flagship pages and posts is jarring on the same site.
- **Recommendation:** Apply "focusing"/"focused" everywhere (matches GOV.UK
  style, which is the most relevant register for this audience).

### 8.2 🟠 Mixed apostrophes and dashes
- **Where:** most posts use smart quotes (`’`, `“ ”`) and en-dashes (`–`),
  but several substitute ASCII (`'`, `"`, `-`). For example
  `_posts/2026-04-07-newsletter.md` mixes `LA’s` and `LA's` within a single
  page; some heading separators use ` - `, others ` – `.
- **Recommendation:** Either commit to ASCII-only (simplest for authors and
  diff-friendliness) or to smart typography throughout. A short note in the
  README/CONTRIBUTING explaining the convention would help future
  contributors. Kramdown's `smart_quotes:` option (built-in, no plugin) can
  normalise this automatically — set
  `kramdown.smart_quotes: lsquo,rsquo,ldquo,rdquo` and stop fighting it.

### 8.3 🟠 Minor copy errors and inconsistencies
- `_pages/placements-standard.md` line 156:
  `'culturalNeeds` (missing closing backtick), `'Other'.` (missing closing
  quote on the value). A quick proofread pass over the standard would catch
  several of these.
- `_pages/placements-standard.md` line 105:
  "Is the preferred placement location in the same LA as the placing LA?."
  has a `?.` — drop the period.
- `_pages/index.md` line 14 lists DfE and DHSC but does not abbreviate
  "Department for Education" the second time. Pick one — typically the
  abbreviation on first mention then the abbreviation only.
- `_posts/2025-10-21-newsletter.md` line 42: "speeding up repsonses" →
  "responses".

### 8.4 🟢 Heading-numbering inconsistency in newsletters
- **Where:** `_posts/2026-04-07-newsletter.md` mixes `## 1. Placements …`,
  `## 2. Standards Development`, `## 3. What's coming next?`. With the
  `numbered-headings` CSS counter this becomes
  `1. 1. Placements …`. See 3.7.

### 8.5 🟢 Tighten boilerplate paragraphs
- **Where:** `_pages/index.md` first half repeats the sentence "Standard
  compliance ensures information systems can meaningfully interact with one
  another without requiring custom translation layers" almost verbatim in
  the second paragraph (line 9) and again under "Programme Overview" (line
  16). Tighten by keeping only the second instance and reframing the first
  to a single-sentence pitch.

### 8.6 🟢 "We will" / "We aim to" — pick a tense per page
- Many pages drift between present tense ("We work openly") and future tense
  ("We will work openly"). For a public-facing standards site, present tense
  reads more confidently. Recommend a quick editorial sweep.


## 9. Accessibility & SEO summary

The high-impact accessibility/SEO items above are repeated here as a shopping
list so they can be picked off in one go:

- 2.1 Breadcrumb current item must not be a link (🔴).
- 2.3 Search "link" should be a button (🟠).
- 2.4 Hamburger needs `aria-expanded` / `aria-controls` (🟠).
- 2.5 Logo `<img>` needs `width`/`height` (🟠).
- 2.7 Posts need `description`/`image` for OG and `<time>` semantics (🟠).
- 2.8 Add Twitter Card meta (🟠).
- 2.9 Add `<meta name="description">` (🟢).
- 1.5 Use `en_GB` for OG locale (🟢).
- 3.1 Fix RSS / Atom mix-up (🔴).
- 3.2 Sitemap uniform `page.url` (🟠).
- 3.4 Hyphenated, shorter permalinks (🟠).


## 10. Quick-win shortlist

If only a handful of changes get prioritised, these give the most value for
the least effort:

1. **1.1** Commit `Gemfile.lock`.
2. **3.1** Fix the RSS feed (mixed RSS/Atom syntax).
3. **2.1** Stop rendering the current breadcrumb as a link.
4. **3.3** Either populate `/calendar` or remove it from the nav.
5. **3.8** Create `.github/ISSUE_TEMPLATE/content_issue.yml` (the link in
   `placements-standard.md` already assumes it exists).
6. **2.2** Use `page.url` (not `page.permalink`) for canonical/OG URLs.
7. **7.1** Fix "interoperabilty" typo in the README.
8. **4.5** Skip the Pagefind plugin in dev / non-production builds (faster
   `jekyll serve`).
9. **5.1** Pin the Pagefind version in CI and Docker.
10. **8.2** Turn on Kramdown `smart_quotes` and standardise on one style.

Each of these is small, isolated and reversible.


---

_Happy to break any of the items above out into individual issues or follow-up
PRs — they were deliberately written to be self-contained._
