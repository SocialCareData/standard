# Examples and checks

Each standard has a set of example records. CI checks that the valid ones pass validation and the invalid ones fail in the way we expect. This catches mistakes in the model before they are published.

## Where they are

```text
src/_data/model/examples/
  placements/
    valid-placement.jsonld            smallest record that passes
    valid-placement-full.jsonld       every field filled in
    invalid-bad-enum.jsonld           one file per kind of error
    invalid-missing-required.jsonld
    expectations.json                 the errors each invalid file must produce
  person/
    subject-of-care/                  one folder per profile
    connected/
```

## Write an example

- Name it `valid-<what>.jsonld` or `invalid-<reason>.jsonld`.
- Start with the shared context:

```json
{
  "@context": "https://github.com/SocialCareData/ontology/releases/latest/download/context.jsonld",
  "@id": "ex:MINIMAL-001",
  "@type": "Placement",
  "childId": "MINIMAL001"
}
```

- Use made-up data only. Never use real names, addresses or identifiers.
- Keep each invalid file to one kind of error, so a failure is easy to read.

## expectations.json

For each invalid file, list the errors it should produce:

```json
{
  "invalid-cost-out-of-range.jsonld": [
    {
      "focus": "ActualPlacement",
      "path": "totalWeeklyCost",
      "constraint": "sh:minInclusive"
    }
  ]
}
```

You don't need to write this by hand. Run the script with `--update`, then check the changes look right.

## Run the checks

Needs Python 3.11 or later.

```bash
pip install -r src/assets/scripts/requirements.txt
python src/assets/scripts/validate_examples.py            # check
python src/assets/scripts/validate_examples.py --update   # rewrite expectations.json
```

The same check runs as **Examples conform to the shapes** in the **Validate standards** check on every pull request. It builds the shapes from your branch, so it tests your model changes, not the published ones.

## When the check fails

| Error | Likely cause |
| --- | --- |
| `valid-….jsonld: expected to conform` | The model got stricter, or the example is out of date. Fix whichever is wrong. |
| `invalid-….jsonld: expected to fail validation` | The rule it tests was removed or relaxed. |
| `violations differ from …/expectations.json` | The errors changed. If that was intended, run with `--update`. |
| `not in …/expectations.json` | A new invalid file. Run with `--update`. |
| `name must start with valid- or invalid-` | Rename the file. |

The log shows the full validation report under each failing file.

## Keep the page in step

The JSON examples on the standard page should match these files. When you change an example file, update the page too. See [Standard page](standard-page.md#examples).

## Help

- [model-management.md: Validation](../../src/_data/model/model-management.md#validation)
- [JSON-LD playground](https://json-ld.org/playground/): see how a record expands
