#!/usr/bin/env node
'use strict'

const CLI_NAME = 'schema-table'

const { generateTable } = require('./lib/generate')

const USAGE = `Usage: schema-table <model-file> <entity> [--page-headings <s>]

Generate a Markdown table from a LinkML data model. When <entity> is a class,
the table lists its properties. When <entity> is a property whose values come
from a controlled vocabulary (an enum range) - or an enum directly - a
collapsible "Code" / "Description" vocabulary table is produced instead.

Arguments:
  <model-file>   Path to the LinkML YAML model, relative to the current dir.
  <entity>       Class name (e.g. PlacementRequirements), or the name of a
                 controlled-vocabulary property (e.g. communicationNeeds) or
                 enum.

Options:
  --page-headings <s>  Newline-separated heading texts present on the target
                       page. When given, a class table's Options column only
                       links to a taxonomy that has a matching section on the
                       page, listing its values inline otherwise. (Set by the
                       Jekyll plugin; omit on the command line to always link.)

Examples:
  schema-table src/assets/model/placements/placements.yaml PlacementRequirements
  schema-table src/assets/model/placements/placements.yaml communicationNeeds`

function parseArgs (argv) {
  const positional = []
  const opts = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--page-headings') {
      opts.pageHeadings = (argv[++i] || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
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
    process.stdout.write(generateTable(opts) + '\n')
  } catch (err) {
    console.error(`schema-table: ${err.message}`)
    process.exit(1)
  }
}

main()
