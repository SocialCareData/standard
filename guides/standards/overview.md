# How a standard is put together

A published standard is made of several files that need to stay in step. This page lists them and the order to work in.

The LinkML model is the source of truth. The ontology (`.ttl`) and SHACL shapes are generated from it, so never edit them by hand.

## The pieces

Placements (`PUB00`) is used as the example throughout.

| Piece | File(s) | Guide |
| --- | --- | --- |
| Standard page | `src/_pages/PUB00-placements-standard.md` | [Standard page](standard-page.md) |
| Table view | `src/_pages/PUB00-placements-standard-table.md` | [Table view](table-view.md) |
| Data model diagram | Miro board → `src/assets/img/placements/*.svg` | [Diagrams](diagrams.md) |
| LinkML model | `src/_data/model/placements/placements-standard.yaml` | [LinkML model](linkml-model.md) |
| Vocabularies | Enums in the model, shown with `schema_table` | [Vocabularies](vocabularies.md) |
| JSON-LD context | `src/_data/model/placements/context.jsonld` | [LinkML model](linkml-model.md#4-update-the-context) |
| Examples | `src/_data/model/examples/placements/` | [Examples and checks](examples.md) |
| Older versions and diff | `PUB00-placements-standard-v1.md`, `-table-v1.md`, `-diff-v1-v2.md` | [Versions and diffs](versions.md) |
| Ontology release files | `social-care.yaml`, `manifest.yaml`, `imports.json`, `context.jsonld` in `src/_data/model/` | [Release the ontology](release-ontology.md) |
| Browser validator | `src/_data/validator.yml` | [Add to the validator](add-to-validator.md) |
| Generated ontology and shapes | [SocialCareData/ontology](https://github.com/SocialCareData/ontology) | [Release the ontology](release-ontology.md) |

## Page URLs

The URL comes from the file name, with hyphens changed to underscores:

| File | URL |
| --- | --- |
| `PUB00-placements-standard.md` | `/PUB00_placements_standard` |
| `PUB00-placements-standard-table.md` | `/PUB00_placements_standard_table` |
| `PUB00-placements-standard-v1.md` | `/PUB00_placements_standard_v1` |

## General flow

1. Agree the change with the working group, and raise or link an issue ([Issues and feedback](raise-issues.md)).
2. Update the diagram in Miro and export it.
3. Change the LinkML model and its `context.jsonld`.
4. Add or update the examples.
5. Update the standard page and the table view.
6. Open a pull request. **CI** builds the site. **Validate standards** lints the model and checks the examples.
7. Merge. A pull request opens automatically on the ontology repository.
8. When ready to publish, cut an ontology release.
9. Check the standard works in the [validator](https://standard.socialcaredata.io/validator).

## Checklist: new standard

- [ ] Pick the next free reference (`PUB07`, …) and a short module name (`my-standard`)
- [ ] Diagram exported to `src/assets/img/my-standard/`
- [ ] `src/_data/model/my-standard/my-standard-standard.yaml`, `context.jsonld` and `README.md`
- [ ] Examples in `src/_data/model/examples/my-standard/` with `expectations.json`
- [ ] `src/_pages/PUB07-my-standard-standard.md`
- [ ] `src/_pages/PUB07-my-standard-standard-table.md`
- [ ] Entries in `social-care.yaml`, `manifest.yaml`, `imports.json` and the root `context.jsonld`
- [ ] Entry in `src/_data/validator.yml` (after the first ontology release)

## Checklist: change an existing standard

- [ ] Issue raised or linked
- [ ] Model, `context.jsonld` and examples updated
- [ ] Standard page text and inline examples updated
- [ ] Diagram updated if classes or links changed
- [ ] `changelog` entry added in the page front matter
- [ ] For a breaking change, a new version and diff page ([Versions and diffs](versions.md))
- [ ] Module version bumped in the model and `manifest.yaml` when releasing

## Help

- [How we develop standards](https://standard.socialcaredata.io/how_we_develop_standards)
- [model-management.md](../../src/_data/model/model-management.md): technical notes on the models
