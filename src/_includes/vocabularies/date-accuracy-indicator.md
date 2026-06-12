A three-character code indicating the accuracy of each component of a date, in **day–month–year** order. Each position uses one of three letters:

- **`A`** — Accurate. The component is known to be correct.
- **`E`** — Estimated. The component has been estimated from other evidence.
- **`U`** — Unknown. The component is not known.

| Position | Component |
| :--- | :--- |
| 1 | Day |
| 2 | Month |
| 3 | Year |
{:.table-bordered}

Worked examples:

| Code | Meaning |
| :--- | :--- |
| `AAA` | Day, month, and year are all known to be accurate. |
| `UUE` | Day and month are unknown; year is estimated. |
| `UAA` | Day is unknown; month and year are accurate. |
| `EEA` | Day and month are estimated; year is accurate. |
| `UUU` | The full date is unknown (placeholder date should be treated as a guess). |
{:.table-bordered}

Aligned with the FHIR [`date-accuracy-indicator`](https://hl7.org/fhir/extension-date-accuracy-indicator.html) extension pattern.
