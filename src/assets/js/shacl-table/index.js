#!/usr/bin/env node
'use strict'

const { generateTable } = require('./lib/generate')

const USAGE = `Usage: shacl-table <shacl-file> <entity> [--enrich-dir <dir>]

Generate a Markdown table for a SHACL entity. When <entity> is a targetClass,
the table lists its first-level properties. When <entity> is a property whose
values come from a controlled vocabulary (sh:in), a collapsible "Code" /
"Description" vocabulary table is produced instead.

Arguments:
  <shacl-file>   Path to the SHACL Turtle file, relative to the current dir.
  <entity>       targetClass local name (e.g. PlacementAvailability), or the
                 name of a controlled-vocabulary property (e.g.
                 communicationNeeds), or a full IRI.

Options:
  --enrich-dir <dir>   Directory of SKOS taxonomy / OWL ontology .ttl files
                       used for the Options column and descriptions.
                       Defaults to a sibling "ttl" directory.
  --page-headings <s>  Newline-separated heading texts present on the target
                       page. When given, a class table's Options column only
                       links to a taxonomy that has a matching section on the
                       page, listing its values inline otherwise. (Set by the
                       Jekyll plugin; omit on the command line to always link.)

Examples:
  shacl-table src/assets/shacl/shacl-shape.ttl PlacementAvailability
  shacl-table src/assets/shacl/shacl-shape.ttl communicationNeeds`

function parseArgs (argv) {
  const positional = []
  const opts = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--enrich-dir') {
      opts.enrichDir = argv[++i]
    } else if (argv[i] === '--page-headings') {
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
  opts.shaclPath = positional[0]
  opts.entity = positional[1]
  return opts
}

function main () {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help || !opts.shaclPath || !opts.entity) {
    console.error(USAGE)
    process.exit(opts.help ? 0 : 1)
  }
  try {
    process.stdout.write(generateTable(opts) + '\n')
  } catch (err) {
    console.error(`shacl-table: ${err.message}`)
    process.exit(1)
  }
}

main()
