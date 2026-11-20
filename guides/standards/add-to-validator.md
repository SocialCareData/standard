# Add a standard to the validator

The [validator page](https://standard.socialcaredata.io/validator) lets anyone paste a record and check it against a standard. The list of standards it offers is in [`src/_data/validator.yml`](../../src/_data/validator.yml).

Do this after the standard's first [ontology release](release-ontology.md). The validator reads the published shapes, not the ones in this repository.

## Add an entry

Add a block under `standards:`:

```yaml
config:
  standards:
    - name: Children's Social Care Placements
      description: A placement record across its whole lifecycle, from requirements through to quality assurance.
      shapes: https://github.com/SocialCareData/ontology/blob/main/placements/placements-standard-shape.ttl
      context: https://github.com/SocialCareData/ontology/blob/main/placements/context.jsonld
      examples:
        - https://github.com/SocialCareData/standard/blob/main/src/_data/model/examples/placements/valid-placement.jsonld
        - https://github.com/SocialCareData/standard/blob/main/src/_data/model/examples/placements/valid-placement-full.jsonld
```

| Field | What to put |
| --- | --- |
| `name` | The name shown in the drop-down. Use the standard's title. |
| `description` | One sentence on what a record is |
| `shapes` | The SHACL file in the ontology repository |
| `context` | The module's `context.jsonld` in the ontology repository |
| `examples` | The `valid-*` example files in this repository. Users can load them with one click. |

For a standard with profiles, add one entry per profile, as Person does.

## Check it

1. Open every URL in a browser to check it exists. A typo in a folder name is easy to miss.
2. On the preview site, open `/validator`, pick the standard and load each example. Both should pass.
3. Change a value to something invalid and check the error makes sense.

## Help

- [Examples and checks](examples.md)
- [Validator component on npm](https://www.npmjs.com/package/@theodi/data-standard-validator-component)
