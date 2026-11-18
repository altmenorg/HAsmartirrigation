/**
 * A zone as the YAML editor shows it: its settings, nothing it computes.
 *
 * The numbers are in the units the panel shows (the zone is loaded and saved
 * in the unit system of Home Assistant, as the form does). What the
 * calculation or the runs write (bucket, duration, delta, explanation, last
 * calculation, measured throughput...) is not written and cannot be set here.
 *
 * Saved, only what changed is sent, as a form edit is: a setting left out of
 * the YAML is cleared when it is optional (back to its default) and kept when
 * the zone cannot do without it (name, size, state...).
 */

import type { SmartIrrigationZone } from "../types";
import { asMapping } from "./program-yaml";

type Plain = Record<string, unknown>;

/** The settings a zone has, in the order the YAML lists them. */
export const ZONE_YAML_FIELDS = [
  "name",
  "state",
  "size",
  "input_method",
  "throughput",
  "precipitation_rate",
  "distribution_efficiency",
  "linked_entity",
  "extra_entities",
  "supply_id",
  "mapping",
  "calculation_method",
  "method_config",
  "soil_type",
  "drainage_rate",
  "plant_type",
  "multiplier",
  "crop_factor_by_month",
  "maximum_duration",
  "maximum_bucket",
  "lead_time",
  "irrigation_threshold",
  "days_between_irrigation",
  "available_water",
  "allowed_depletion",
  "flow_sensor",
  "observed_ignore_seconds",
  "soil_moisture_sensor",
  "soil_moisture_threshold",
  "safety_off_mode",
  "safety_off_topic",
  "safety_off_state_key",
  "safety_off_entity",
  "safety_off_required",
  "confirm_timeout",
  "open_resends",
] as const;

/**
 * The settings that may be empty: left out of the YAML, they are cleared.
 * The others (a name, a size...) are kept as they are when left out.
 */
export const ZONE_YAML_CLEARABLE = new Set<string>([
  "precipitation_rate",
  "distribution_efficiency",
  "linked_entity",
  "extra_entities",
  "supply_id",
  "mapping",
  "crop_factor_by_month",
  "days_between_irrigation",
  "available_water",
  "allowed_depletion",
  "flow_sensor",
  "observed_ignore_seconds",
  "soil_moisture_sensor",
  "soil_moisture_threshold",
  "safety_off_mode",
  "safety_off_topic",
  "safety_off_state_key",
  "safety_off_entity",
  "safety_off_required",
  "confirm_timeout",
  "open_resends",
]);

const FIELDS = new Set<string>(ZONE_YAML_FIELDS);

const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value as Plain).length === 0);

/** The zone, ready for the YAML editor: its settings that are set. */
export const zoneToYaml = (zone: SmartIrrigationZone): Plain => {
  const source = zone as unknown as Plain;
  const out: Plain = {};
  for (const key of ZONE_YAML_FIELDS) {
    if (!isEmpty(source[key])) out[key] = source[key];
  }
  return out;
};

export type ZoneFromYaml =
  | { changes: Plain }
  | { error: "not_a_zone" }
  | { error: "not_settings"; keys: string[] };

/**
 * What the YAML typed for a zone changes, as a form edit would send it: the
 * keys that differ from the zone, a cleared one sent as null. Keys that are
 * not settings of a zone (a typo, or what the calculation writes) are refused,
 * so that nothing typed is silently dropped.
 */
export const zoneFromYaml = (
  value: unknown,
  zone: SmartIrrigationZone,
): ZoneFromYaml => {
  const typed = asMapping(value);
  if (!typed) return { error: "not_a_zone" };
  const keys = Object.keys(typed).filter((key) => !FIELDS.has(key));
  if (keys.length) return { error: "not_settings", keys };
  const source = zone as unknown as Plain;
  const changes: Plain = {};
  for (const key of ZONE_YAML_FIELDS) {
    let next: unknown;
    if (key in typed) {
      next = typed[key] === undefined ? null : typed[key];
    } else if (ZONE_YAML_CLEARABLE.has(key)) {
      next = null;
    } else {
      continue;
    }
    const before = source[key];
    if (isEmpty(next) && isEmpty(before)) continue;
    if (JSON.stringify(next) !== JSON.stringify(before)) changes[key] = next;
  }
  return { changes };
};
