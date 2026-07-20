#!/usr/bin/env node
'use strict'

const { generateTable } = require('./lib/generate')

const USAGE = `Usage: shacl-table <shacl-file> <entity> [--enrich-dir <dir>]

Generate a Markdown table of the first-level properties of a SHACL entity
(targetClass).

Arguments:
  <shacl-file>   Path to the SHACL Turtle file, relative to the current dir.
  <entity>       targetClass local name (e.g. PlacementAvailability) or IRI.

Options:
  --enrich-dir <dir>   Directory of SKOS taxonomy / OWL ontology .ttl files
                       used for the Options column and descriptions.
                       Defaults to a sibling "ttl" directory.

Example:
  shacl-table src/assets/shacl/shacl-shape.ttl PlacementAvailability`

function parseArgs (argv) {
  const positional = []
  const opts = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--enrich-dir') {
      opts.enrichDir = argv[++i]
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
