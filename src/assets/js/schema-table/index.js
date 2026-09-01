#!/usr/bin/env node
'use strict'

const CLI_NAME = 'schema-table'

const { generateTable, generateDiffTable } = require('./lib/generate')

const USAGE = `Usage: schema-table <model-file> <entity> [--previous <file>] [--page-headings <s>]

Generate a Markdown table from a LinkML data model. When <entity> is a class,
the table lists its properties. When <entity> is a property whose values come
from a controlled vocabulary (an enum range) - or an enum directly - a
collapsible "Code" / "Description" vocabulary table is produced instead.

With --previous, a Markdown diff table is produced instead of a plain table:
the current model is compared against the previous one and each row/cell is
tagged added (green), removed (red, struck through) or changed (old value struck
through beside the new).

Arguments:
  <model-file>   Path to the LinkML YAML model, relative to the current dir.
  <entity>       Class name (e.g. PlacementRequirements), or the name of a
                 controlled-vocabulary property (e.g. communicationNeeds) or
                 enum.

Options:
  --previous <file>    Path to a previous LinkML YAML model. When given, emit an
                       HTML diff of <model-file> against it for <entity>.
  --page-headings <s>  Newline-separated heading texts present on the target
                       page. When given, a class table's Options column only
                       links to a taxonomy that has a matching section on the
                       page, listing its values inline otherwise. (Set by the
                       Jekyll plugin; omit on the command line to always link.)
  --options-limit <n>  How many example values the Options column previews
                       (default 3). Pass an integer, or "all" to show every
                       value with no ellipsis.
  --no-collapse        For a vocabulary table, emit just the table instead of
                       wrapping it in a collapsible <details>/<summary> element.
                       (No effect on class property tables.)
  --no-label           For a vocabulary table, omit the Label column, leaving
                       Code / Definition. Useful where each permissible value's
                       title just restates its key. (No effect on class tables.)

Examples:
  schema-table src/assets/model/placements/placements-standard.yaml PlacementRequirements
  schema-table src/assets/model/placements/placements-standard.yaml communicationNeeds
  schema-table placements-standard-01.yaml RiskAssessment --previous placements-standard.yaml`

function parseArgs (argv) {
  const positional = []
  const opts = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--page-headings') {
      opts.pageHeadings = (argv[++i] || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
    } else if (argv[i] === '--previous') {
      opts.previousPath = argv[++i]
    } else if (argv[i] === '--options-limit') {
      opts.optionsLimit = argv[++i]
    } else if (argv[i] === '--no-collapse' || argv[i] === '--expanded') {
      opts.collapsible = false
    } else if (argv[i] === '--no-label' || argv[i] === '--no-labels') {
      opts.showLabel = false
    } else if (argv[i] === '-h' || argv[i] === '--help') {
      opts.help = true
    } else {
      positional.push(argv[i])
    }
  }
  opts.modelPath = positional[0]
  opts.entity = positional[1]
  return opts
}

function main () {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help || !opts.modelPath || !opts.entity) {
    console.error(USAGE)
    process.exit(opts.help ? 0 : 1)
  }
  try {
    const output = opts.previousPath ? generateDiffTable(opts) : generateTable(opts)
    process.stdout.write(output + '\n')
  } catch (err) {
    console.error(`schema-table: ${err.message}`)
    process.exit(1)
  }
}

main()
