---
title: Command-line validator
description: Check records against the standards on your own machine, from a terminal, a script or a CI pipeline.
breadcrumbs:
  - Publications
publication_group: tool
---

The command-line validator runs the same checks as the [web validator](/validator), but on your own machine. Use it when you have more than a few records to check, when validation needs to be part of an automated process, or when you are working with live data that should stay inside your own systems.

It is an open source Node.js package, [@theodi/data-standard-validator](https://www.npmjs.com/package/@theodi/data-standard-validator). You can run it as a command or call it from your own JavaScript code.

## Install

You need [Node.js](https://nodejs.org/) 22 or later. Then, in your project:

```bash
npm install --save-dev @theodi/data-standard-validator
```

If you just want to try it, you can skip the install and use `npx --yes @theodi/data-standard-validator` in place of `npx data-standard-validator` below.

## Check a file

Give the validator the shapes (`-s`) and JSON-LD context (`-c`) for a standard, then the files to check. For example, to check a placements record:

```bash
npx data-standard-validator \
  -s https://raw.githubusercontent.com/SocialCareData/ontology/main/placements/placements-standard-shape.ttl \
  -c https://raw.githubusercontent.com/SocialCareData/ontology/main/placements/context.jsonld \
  my-placement.jsonld
```

Each problem tells you what is wrong and where:

```text
  in PlacementAvailability
    x Missing required field uascStatus
      at placementAvailability.uascStatus  line 8
      Add `uascStatus`: Whether the child is an unaccompanied asylum-seeking child (UASC).
  in PlacementRequirements
    x pets must be one of the permitted values - you gave Maybe
      at placementRequirements.pets  line 22
         22 |     "pets": "Maybe",
            |             ^^^^^^^
      Allowed values: Yes - must, Yes - can, False, Not known.
  in ActualPlacement
    x placementStartDate must be a date (YYYY-MM-DD) - you gave 21/03/2024
      at actualPlacement.placementStartDate  line 64
         64 |     "placementStartDate": "21/03/2024",
  3 problems
  1 required field missing, 1 value not allowed, 1 wrong type
```

The command exits with `0` when everything conforms and `1` when it finds problems, so you can use it to fail a build.

The shapes and context for every standard are in the [ontology repository](https://github.com/SocialCareData/ontology).

### CSV files

To check a CSV file, use `--csv-metadata` with the standard's CSV metadata file in place of `-c`:

```bash
npx data-standard-validator \
  -s https://raw.githubusercontent.com/SocialCareData/ontology/main/placements/placements-standard-shape.ttl \
  --csv-metadata https://raw.githubusercontent.com/SocialCareData/ontology/main/placements/csv-metadata.json \
  my-placements.csv
```

Problems are reported by row and column:

```text
  in row 1
    x placement_start_date is not in the expected format - you gave 21/03/2024
      at row 1, placement_start_date
      It should be a date (YYYY-MM-DD).
    x Missing required field placement_type
      at row 1, placement_type
      Add `placement_type`: The type of placement the child received.
    x can_child_live_with_pets must be one of the permitted values - you gave Maybe
      at row 1, can_child_live_with_pets
      Allowed values: Yes-must, Yes-can, False, Not known.

3 problems
  1 bad format, 1 required field missing, 1 value not allowed
```

## Use it in code

```js
import { validate, formatReport } from '@theodi/data-standard-validator'

const report = await validate({
  shapes: 'https://raw.githubusercontent.com/SocialCareData/ontology/main/placements/placements-standard-shape.ttl',
  context: 'https://raw.githubusercontent.com/SocialCareData/ontology/main/placements/context.jsonld',
  data: ['my-placement.jsonld'],
})

console.log(formatReport(report, 'text'))
```

## More documentation

The [validator documentation](https://theodi.github.io/data-standard-validator/) covers every command-line option, CSV support, Markdown and JSON reports, running it in CI and what each error message means. The source code is [on GitHub](https://github.com/theodi/data-standard-validator).

## Feedback

If a message is unclear, or you think a valid record is being rejected, please
[create a new issue on GitHub](https://github.com/SocialCareData/standard/issues/new?template=content_issue.yml&page={{ site.url | append: page.url | url_encode }}&category=Standards).
