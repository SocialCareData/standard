# Add a menu item

The top menu is set in [`_config.yml`](../_config.yml), under `nav:`.

## How it's structured

```yaml
nav:
  - title: About                  # top menu item
    children:                     # items in its dropdown
      - title: Governance
        url: /governance
        description: How the programme is governed and managed.
```

- `title`: the text shown in the menu.
- `url`: the page address. It starts with `/` and uses underscores, for example `/our_pilots` for `our-pilots.md`.
- `description`: a short line shown under the title in the dropdown.
- `children`: the dropdown items under a top menu item.

Items appear in the same order as in the file.

## Add a page to a dropdown

Add a new `- title:` block under the right `children:`. For example, to add "Our Pilots" under About:

```yaml
  - title: About
    children:
      - title: Standards Development
        url: /learn_about_the_standards
        description: What the standards are and why they matter.
      - title: Our Pilots
        url: /our_pilots
        description: How we are testing the standards in real services.
```

## Hide an item for now

Add `draft: true` to a dropdown item to hide it from the menu without deleting it:

```yaml
      - title: Our Pilots
        url: /our_pilots
        description: How we are testing the standards in real services.
        draft: true
```

## Watch the spaces

This file is YAML, so indentation matters. Use spaces, not tabs, and line up your new item exactly with the ones around it. A wrong indent breaks the build and the CI check will fail.

Check the result on the [preview site](getting-set-up.md#7-check-the-build).
