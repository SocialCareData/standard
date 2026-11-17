# Release the ontology

The LinkML models are turned into an ontology (OWL) and validation shapes (SHACL), and published in the [SocialCareData/ontology](https://github.com/SocialCareData/ontology) repository. Everything in that repository is generated, so don't edit it by hand. Any change there is overwritten on the next sync.

## The four root files

These sit in `src/_data/model/` and tie the modules together.

| File | What it does | Why we need it |
| --- | --- | --- |
| `social-care.yaml` | An umbrella model that imports every module | Builds the single merged ontology (`social-care.ttl`) and checks that slot names don't clash across modules |
| `manifest.yaml` | Lists the version of each module in a release, and the release name | Lets each standard move at its own pace. The release only includes the versions pinned here. |
| `imports.json` | Maps each module's `id` to its local file | Lets imports like `https://ns.socialcaredata.io/common` load the file in this repository rather than from the web. Used by the build, the linter and `schema_table`. |
| `context.jsonld` | Lists every module's `context.jsonld` | The one context file data publishers use: `releases/latest/download/context.jsonld` |

## Add a new standard

Add one entry to each file. Using `placements` as the example:

`social-care.yaml`:

```yaml
imports:
  - linkml:types
  - https://ns.socialcaredata.io/common
  - https://ns.socialcaredata.io/placements
```

`manifest.yaml`:

```yaml
modules:
  common: 1.0.0
  placements: 2.0.0
```

The version must match the `version:` in the model file exactly. A standard with profiles, such as person, lists them under `profiles:`.

`imports.json` (paths are relative to a module folder, without `.yaml`):

```json
"https://ns.socialcaredata.io/placements": "../placements/placements-standard"
```

`context.jsonld`:

```json
"@context": [
  "./common/context.jsonld",
  "./placements/context.jsonld"
]
```

## How a release works

```text
merge to main ──► Sync ontology workflow ──► pull request on SocialCareData/ontology
                                                   │
                                     review and merge
                                                   │
                     publish a GitHub release ◄────┘
                                │
                     files attached to the release ──► releases/latest/download/...
```

1. **Pin the versions.** In `manifest.yaml`, set each module to the version you want to release, and set `ontology_version` to today's date, for example `v2026-11-09`.
2. **Merge to `main`.** Any change under `src/_data/model/` starts the **Sync ontology** workflow. It runs [`build_ontology.py`](../../src/assets/scripts/build_ontology.py) and opens (or updates) a pull request on the ontology repository called **Sync ontology from standard**.
3. **Review and merge that pull request.** Check the `.ttl` changes look as you expect.
4. **Publish a release** on the ontology repository:
    1. Go to **Releases > Draft a new release**.
    2. Create a tag with the same name as `ontology_version`, for example `v2026-11-09`.
    3. Click **Generate release notes**, then **Publish release**.
5. **Wait for the files.** The ontology repository's **Attach ontology files to release** workflow adds the `.ttl` files, the contexts and `manifest.yaml` to the release.

Data and examples that use `releases/latest/download/context.jsonld` pick up the new release straight away.

## Build it yourself

To see the output before merging (needs Python 3.11 or later):

```bash
pip install -r src/assets/scripts/requirements.txt
python src/assets/scripts/build_ontology.py --out build/ontology
```

The build fails if a version in `manifest.yaml` doesn't match a model file, or if `social-care.yaml` has a `version:` of its own.

## Help

- [model-management.md: Generating the ontology and shapes](../../src/_data/model/model-management.md#generating-the-ontology-and-shapes)
- [SocialCareData/ontology releases](https://github.com/SocialCareData/ontology/releases)
- [GitHub: managing releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
