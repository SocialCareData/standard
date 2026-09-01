# schema-table

Generate a Markdown table from a [LinkML](https://linkml.io/) data model. The
tool inspects the second argument and produces one of two tables:

- **Class table** — when the argument names a **class**, a table of that class's
  properties (slots).
- **Vocabulary table** — when the argument names a **property** (a slot whose
  range is an enum) or an **enum**, a **Code** / **Label** / **Definition** table
  wrapped in a collapsible `<details>`/`<summary>` element. Where the codes use
  dot notation (`SEND` / `SEND.SpLD`) the table shows the
  [hierarchy](#hierarchy-inferred-from-the-codes) they imply.

## Imports

A model's local `imports:` are resolved and merged before rendering, so a table
can be generated from a schema that inherits its slots, enums and sub-entity
classes from a shared core. Non-local imports (e.g. `linkml:types`) are ignored;
the importing schema's own definitions override imported ones of the same name.
This is what lets the Person profiles (e.g. `person-subject-of-care.yaml`, which
imports `person-standard.yaml` and redefines only `Person`) render complete
tables with the profile's cardinalities.

## Mixins

A class's `mixins:` are resolved, so slots a class inherits appear in its table
rather than going missing. Inherited slots are listed **first** — in the order
the mixins are declared, each mixin's own mixins resolved first — followed by the
class's declared `slots:` and inline `attributes:`. A slot reached more than once
(via two mixins, or via a mixin and the class itself) is listed once, at its
first position. This matches what `gen-shacl` / `gen-owl` do, and it means a
model can factor shared slots into a mixin (e.g. the assessments-and-plans
`FoundationalInformation`) instead of repeating them on every class.

`slot_usage` / `attributes` overrides are applied most-specific-last: the global
slot first, then each mixin's override, then the class's own — so a class can
narrow a slot it inherits.

## Class table

Describes a class's slots, in declared order (inherited slots first — see
[Mixins](#mixins)). Five columns:

| Column | Source (LinkML) |
| --- | --- |
| **Field name** | the slot's `title` when set, else the slot name (a `title` lets the displayed key differ from the internal slot name — e.g. two `use` slots that map to distinct enums) |
| **Cardinality** | `min..max` where min = `required ? 1 : 0`, max = `multivalued ? * : 1` |
| **Data Type** | for a type-ranged slot, a friendly label (`String` / `Date` / `Boolean` / `Integer` / `Decimal`, resolved via the type's `xsd` uri); `Categorical` when the range is an enum; a link to another class when the range is a class |
| **Description** | the slot's `description` |
| **Options** | for an enum-ranged slot, a link to the taxonomy section plus a preview of example labels (default 3) — **but** if that section is not present on the page being rendered, every possible value is listed inline (no dangling link) |

The Options column is page-aware: the Jekyll plugin passes the page's headings
to the generator (`--page-headings`), and a taxonomy is only linked when the
page actually has a matching section (the enum's `title` + " Taxonomy" →
e.g. `#communication-need-taxonomy`). From the command line no headings are
supplied, so every taxonomy is linked.

**How many previews:** the number of example values shown in the Options column
is configurable (default `3`). Pass an integer, or `all` to show every value
with no trailing ellipsis:

- CLI: `--options-limit <n|all>` (e.g. `--options-limit 5`, `--options-limit all`).
- Jekyll tag: an optional third argument, e.g.
  `{% schema_table page.data_model Person all %}` or
  `{% schema_table page.data_model Person 5 %}`.

An unlinked Options cell (no matching section on the page) always lists every
value, regardless of this setting.

## Vocabulary table

Describes an enum's permissible values, in declared order. Three columns, inside
a collapsible `<details>` element:

| Column | Source (LinkML) |
| --- | --- |
| **Code** | the permissible value's **name** (its key) — the SKOS-style notation used as the value in data, e.g. `1`, `usual`, `MTH` |
| **Label** | the permissible value's `title` (omit this column with `no-label`) |
| **Definition** | the permissible value's `description` |

So the code lives in the schema itself: set each permissible value's key to the
data code, its `title` to the human label, and (optionally) its `meaning` to the
concept IRI. The taxonomy section title/anchor comes from the enum's `title`; the
value labels shown in the Options column come from each permissible value's
`title`.

### Hierarchy (inferred from the codes)

LinkML has no way to say that one permissible enum value is a narrower term of
another, so the hierarchy is read back off the codes themselves, using `.` as
the separator: `SEND.SpLD` is a sub-type of `SEND`, `accommodation-status.refuge`
of `accommodation-status`. When a vocabulary nests, the Code column shows it —
broader terms in **bold**, narrower ones indented one level (four `&nbsp;`) and
prefixed with `└─`:

| Code | Label | Definition |
| :--- | :--- | :--- |
| **`SEND`** | SEND | Observed special educational needs and disabilities, via DfE codes |
| &nbsp;&nbsp;&nbsp;&nbsp;└─ `SEND.SpLD` | SEND SpLD | Specific learning Difficulty: … |
| **`NEET`** | NEET | Not in Education, Employment, or Training |

Nesting to any depth works (`a` → `a.b` → `a.b.c`). Two rules keep it
predictable:

- A dotted code is only nested when its parent is **itself a permissible value**
  of the same enum. A code such as `CA.nutrition` in an enum with no `CA` value
  stays a top-level term rather than being nested under a parent that does not
  exist — so a vocabulary that merely uses dots as a naming convention renders
  flat, exactly as before.
- Rows are ordered depth-first: top-level terms keep their declaration order and
  every narrower term follows its parent, so a child declared away from its
  parent still renders beneath it.

Nothing extra is needed in the model — just name the permissible values
accordingly. Vocabulary **diff** tables show the same hierarchy; the indentation
is display-only, so a term moving level (because its parent was added or removed)
is not reported as a changed code.

**Collapsible wrapper:** by default the table is wrapped in a `<details>` /
`<summary>` element. To render just the table instead:

- CLI: `--no-collapse` (alias `--expanded`).
- Jekyll tag: an `expanded` (or `no-collapse`) modifier, e.g.
  `{% schema_table page.data_model genderCode expanded %}`.

**Dropping the Label column:** where each permissible value's `title` only
restates its key (`SEND.SpLD` → "SEND SpLD"), the Label column is noise. Render
**Code** / **Definition** only:

- CLI: `--no-label` (alias `--no-labels`).
- Jekyll tag: a `no-label` (or `no-labels`) modifier, e.g.
  `{% schema_table page.data_model ObservationType no-label %}`.
- Same modifier on the diff tag: `{% schema_table_diff current previous outOfLAReason no-label %}`.

Only the Label column can be dropped — Code and Definition are always shown, and
a class property table is unaffected. In a vocabulary **diff**, dropping Label
also drops any label-only change from the comparison, since that column is no
longer displayed.

Tag modifiers after `<entity>` are order-independent: mix the options-limit, the
collapse control and the label control freely, e.g.
`{% schema_table page.data_model genderCode all expanded no-label %}`.

## Diff table

With `--previous <file>`, the tool compares the current model against a previous
one and emits a Markdown table whose cell contents carry inline HTML for the diff
colours:

- **added** — a property/enum value present only in the current model → green text.
- **removed** — present only in the previous model → red, struck-through text.
- **changed** — a cell whose value differs → old value struck through beside the
  new (`<del class="diff-old">…</del> <ins class="diff-new">…</ins>`).

Properties are matched by name and enum values by code; ordering follows the
current version, with removed entries slotted back in after their previous
predecessor. Class and vocabulary entities are resolved exactly as for the plain
tables. Because it is a Markdown table, kramdown builds the `<table>` (styled
like the plain tables) — but Markdown cannot class a `<td>`/`<tr>`, so only the
text is coloured, not the cell background. In a page use the
`{% schema_table_diff %}` tag (see `src/_plugins/schema_table_diff.rb`):

```liquid
{% schema_table_diff current.yaml previous.yaml PlacementAvailability %}
```

## Usage in a page (Jekyll)

The `{% schema_table %}` Liquid tag (see `src/_plugins/schema_table.rb`) renders
the table at build time, so it ends up as a real `<table>` in the compiled site
and is indexed by Pagefind. Place the tag on its own line:

```liquid
{% schema_table src/assets/model/placements/placements.yaml PlacementAvailability %}
{% schema_table src/assets/model/placements/placements.yaml communicationNeeds %}
```

Arguments: the LinkML YAML path (relative to the project root) and either a
class name (class table) or a controlled-vocabulary property/enum name
(vocabulary table).

## Usage from the command line

```bash
node src/assets/js/schema-table/index.js src/assets/model/placements/placements.yaml PlacementAvailability
node src/assets/js/schema-table/index.js src/assets/model/placements/placements.yaml communicationNeeds
# diff two versions:
node src/assets/js/schema-table/index.js src/assets/model/placements/placements-standard-01.yaml RiskAssessment \
  --previous src/assets/model/placements/placements-standard.yaml
```

## Layout

```
lib/
  linkml.js    load the YAML model; class/slot/enum lookups, range classification, type->xsd
  format.js    pure formatters: slugs, cardinality, datatype labels
  model.js     model -> property rows; Options + vocabulary (concept) resolution,
               incl. the hierarchy dot-notation codes imply
  table.js     rows -> Markdown property table; concepts -> vocabulary table
  diff.js      diff two model versions -> HTML property/vocabulary diff table
  generate.js  orchestration (load model, classify entity, render)
index.js       CLI entry point
test/          node:test unit + integration suites
```

## Tests

```bash
cd src/assets/js/schema-table
npm install
npm test
```
