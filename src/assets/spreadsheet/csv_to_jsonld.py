#!/usr/bin/env python3
"""Placements CSV -> JSON-LD.

Reads a National Placement Standard data-collection CSV (row 1 = section
headings, row 2 = column names, rows 3+ = one placement record each) and writes
a JSON-LD document that uses the placements context, so it can be validated
against the SHACL shapes with src/assets/shacl/validation.

The conversion is driven by the LinkML schema: COLUMNS maps each CSV column to
a slot path, and every value is coerced according to that slot's range
(enum codes, booleans, dates, decimals, multivalued). Records are instantiated
with linkml's json_loader, which enforces the schema, and serialised with
json_dumper against context.jsonld.

Requires linkml (see src/assets/model/model-management.md).

Usage:
    python3 csv_to_jsonld.py National-Placement-Standard-20260624-Data-Collection.csv > out.jsonld
"""

import csv
import json
import re
import sys
from pathlib import Path

from linkml.generators.pythongen import PythonGenerator
from linkml_runtime import SchemaView
from linkml_runtime.dumpers import json_dumper
from linkml_runtime.loaders import json_loader

HERE = Path(__file__).resolve().parent
MODEL = HERE.parent / "model" / "placements"
SCHEMA = MODEL / "placements-standard-01.yaml"
CONTEXT = "../model/placements/context.jsonld"  # relative to the output file

MULTIVALUE_SEPARATOR = ";"

# CSV column -> slot, or <slot of Placement>.<slot of that class>.
COLUMNS = {
    "child_ID": "childId",
    "when_placement_is_needed_by": "placementAvailability.neededBy",
    "number_of_siblings_to_place_with": "placementAvailability.siblingCount",
    "is_preferred_location_local": "placementAvailability.isPreferredLocationLocal",
    "out_of_LA_reason": "placementAvailability.outOfLAReason",
    "communication_language_learning_needs": "placementRequirements.communicationNeeds",
    "specific_communication_and_language_requirements": "placementRequirements.specificCommunicationRequirement",
    "adaptation_to_the_home": "placementRequirements.homeAdaptationRequired",
    "cultural_needs": "placementRequirements.culturalNeeds",
    "who_can_the_child_be_cared_for_alongside": "placementRequirements.livingCompanions",
    "can_child_live_with_pets": "placementRequirements.pets",
    "additional_support": "placementRequirements.additionalSupport",
    "additional_support_other": "placementRequirements.additionalSupportOther",
    "dol": "placementRequirements.deprivationOfLiberty",
    "foster_care_suitability": "placementRecommendation.fosterCareSuitability",
    "residential_care_suitability": "placementRecommendation.residentialCareSuitability",
    "supported_accommodation": "placementRecommendation.supportedAccommodationSuitability",
    "risk_to_child_self_harm": "riskAssessment.riskSelfHarm",
    "risk_to_child_criminal_exploitation": "riskAssessment.riskCriminalExploitation",
    "risk_to_child_drug_and_alcohol_use": "riskAssessment.riskDrugAlcohol",
    "risk_to_child_eating_disorder": "riskAssessment.riskEatingDisorder",
    "risk_to_child_going_missing": "riskAssessment.riskMissing",
    "risk_to_child_sexual_exploitation": "riskAssessment.riskSexualExploitation",
    "risk_to_others_physical_harm": "riskAssessment.riskToOthersPhysical",
    "risk_to_others_sexual_harm": "riskAssessment.riskToOthersSexual",
    "risk_to_others_fire_setting": "riskAssessment.riskToOthersFire",
    "risk_to_others_harm_to_animals": "riskAssessment.riskToOthersAnimals",
    "risk_to_others_criminal_exploitation": "riskAssessment.riskToOthersCriminal",
    "cost_core_weekly": "actualPlacement.coreWeeklyCost",
    "cost_additional_support_weekly": "actualPlacement.additionalSupportWeeklyCost",
    "cost_education_weekly": "actualPlacement.educationWeeklyCost",
    "cost_other_weekly": "actualPlacement.otherWeeklyCost",
    "cost_total_weekly": "actualPlacement.totalWeeklyCost",
    "placement_location": "actualPlacement.placementLocation",
    "preferrability_of_placement_location": "actualPlacement.isLocationPreferred",
    "education_continuity": "actualPlacement.isEducationContinuous",
    "provider_URN": "actualPlacement.providerURN",
    "how_many_siblings_were_placed_together": "actualPlacement.siblingsPlacedTogether",
    "placement_type": "actualPlacement.placementType",
    "name_of_officer_referral": "qualityAssurance.referralOfficerName",
    "Date_entry_referral": "qualityAssurance.referralDate",
    "name_of_officer_placement": "qualityAssurance.placementOfficerName",
    "date_entry_placement": "qualityAssurance.placementDate",
    "name_of_officer_placement_cost": "qualityAssurance.costOfficerName",
    "date_entry_placement_cost": "qualityAssurance.costDate",
}

# The column asks whether education was DISRUPTED; isEducationContinuous records
# whether it was continuous, so the answer is inverted.
INVERTED_BOOLEANS = {"education_continuity"}

# Local names for the sub-record IRIs, matching the examples that ship with the
# model (e.g. ex:ABCD2012-001/availability).
SUB_RECORD_IDS = {
    "placementAvailability": "availability",
    "placementRequirements": "requirements",
    "placementRecommendation": "recommendation",
    "riskAssessment": "risk",
    "actualPlacement": "actual",
    "qualityAssurance": "qa",
}

TRUE_VALUES = {"yes", "true"}
FALSE_VALUES = {"no", "false"}


class CellError(Exception):
    pass


class Converter:
    def __init__(self, schema_path: Path):
        self.sv = SchemaView(str(schema_path))
        self.module = PythonGenerator(str(schema_path)).compile_module()
        self.slots = {column: self._slot(path) for column, path in COLUMNS.items()}

    def _slot(self, path: str):
        """Resolve a dotted slot path against the schema."""
        parts = path.split(".")
        slot = self.sv.induced_slot(parts[0], "Placement")
        for part in parts[1:]:
            slot = self.sv.induced_slot(part, slot.range)
        return slot

    # -- cell coercion, by slot range ---------------------------------------
    def _is_code(self, value: str, slot) -> bool:
        if slot.range not in self.sv.all_enums():
            return False
        return value.lower() in {c.lower() for c in self.sv.get_enum(slot.range).permissible_values}

    def _scalar(self, value: str, slot, column: str):
        rng = slot.range
        if rng in self.sv.all_enums():
            codes = {c.lower(): c for c in self.sv.get_enum(rng).permissible_values}
            code = codes.get(value.lower())
            if code is None:
                raise CellError(f"'{value}' is not a {rng} code")
            return code
        if rng == "boolean":
            if value.lower() in TRUE_VALUES:
                return column not in INVERTED_BOOLEANS
            if value.lower() in FALSE_VALUES:
                return column in INVERTED_BOOLEANS
            raise CellError(f"'{value}' is not Yes or No")
        if rng == "date":
            match = re.fullmatch(r"(\d{1,2})/(\d{1,2})/(\d{4})", value)
            if not match:
                raise CellError(f"'{value}' is not a DD/MM/YYYY date")
            return f"{match[3]}-{int(match[2]):02d}-{int(match[1]):02d}"
        if rng == "decimal":
            # A leading currency symbol and thousands separators are ignored.
            cleaned = re.sub(r"[£,\s]", "", value)
            if not re.fullmatch(r"-?\d+(\.\d+)?", cleaned):
                raise CellError(f"'{value}' is not a monetary amount")
            return cleaned
        if rng in ("integer", "nonNegativeInteger"):
            if not value.isdigit():
                raise CellError(f"'{value}' is not a whole number")
            return int(value)
        return value

    def cell(self, value: str, column: str):
        """Coerce one cell; returns None when nothing was recorded."""
        slot = self.slots[column]
        value = value.strip()
        # 'NA' means the question does not apply and is recorded as absent,
        # unless it is a code in this slot's own vocabulary (SupportType).
        if value == "" or (value.upper() == "NA" and not self._is_code(value, slot)):
            return None
        if slot.multivalued:
            return [self._scalar(v.strip(), slot, column)
                    for v in value.split(MULTIVALUE_SEPARATOR) if v.strip()]
        return self._scalar(value, slot, column)

    # -- record building ----------------------------------------------------
    def record(self, row: dict[str, str], row_number: int):
        """Build one Placement, reporting the offending column on failure."""
        data: dict = {}
        errors = []
        for column, path in COLUMNS.items():
            try:
                value = self.cell(row.get(column, ""), column)
            except CellError as err:
                errors.append(f"row {row_number}, {column}: {err}")
                continue
            if value is None:
                continue
            parts = path.split(".")
            target = data if len(parts) == 1 else data.setdefault(parts[0], {})
            target[parts[-1]] = value
        if errors:
            raise CellError("\n".join(errors))
        return json_loader.loads(json.dumps(data), target_class=self.module.Placement)

    # -- JSON-LD ------------------------------------------------------------
    def as_jsonld(self, placement, identifier: str) -> dict:
        """Dump a Placement and add the @id/@type that json_dumper omits on
        nested nodes (SHACL targets classes, so every node needs a type)."""
        node = json.loads(json_dumper.dumps(placement))
        node["@id"] = identifier
        for slot_name, value in node.items():
            if not isinstance(value, dict):
                continue
            value["@id"] = f"{identifier}/{SUB_RECORD_IDS[slot_name]}"
            value["@type"] = self.sv.induced_slot(slot_name, "Placement").range
        return node


def main() -> int:
    if len(sys.argv) != 2:
        print("usage: csv_to_jsonld.py <data-collection.csv>", file=sys.stderr)
        return 2

    with open(sys.argv[1], newline="", encoding="utf-8-sig") as handle:
        rows = list(csv.reader(handle))
    if len(rows) < 3:
        print("CSV must have a section-heading row, a column-name row and at least one record",
              file=sys.stderr)
        return 2

    columns = [c.strip() for c in rows[1]]
    unknown = sorted(set(columns) - set(COLUMNS) - {""})
    if unknown:
        print(f"unmapped column(s): {', '.join(unknown)}", file=sys.stderr)
        return 1

    converter = Converter(SCHEMA)
    graph, failures = [], []
    for offset, cells in enumerate(rows[2:]):
        if not any(c.strip() for c in cells):
            continue
        row = dict(zip(columns, cells))
        row_number = offset + 3  # 1-based, past the two header rows
        identifier = f"ex:{row.get('child_ID', 'record').strip()}-{offset + 1:03d}"
        try:
            graph.append(converter.as_jsonld(converter.record(row, row_number), identifier))
        except CellError as err:
            failures.append(str(err))
        except ValueError as err:  # raised by json_loader when the schema rejects the record
            failures.append(f"row {row_number}: {err}")

    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1

    json.dump({"@context": CONTEXT, "@graph": graph}, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
