/**
 * The options of a program that are set in YAML only (Edit in YAML).
 *
 * Like Home Assistant's own visual editors, the form has no field for them,
 * even when they are set: it keeps them untouched (every patch spreads the
 * object it changes) and says, read-only, which ones the program uses. This
 * module lists them, in words, for that notice.
 *
 * YAML only: the program's `tours`; a step's `adjust_seconds` and
 * `min_deficit_mm`; a schedule's `every_offset`, `parity`, `days_of_month`,
 * `months`, `fallback_time` and `skip_conditions` (the weather on/off switch
 * stays in the form). A zone's `safety_off_state_key` (the MQTT state key)
 * and `open_resends` (the open sent again) are YAML only too.
 */
import type {
  SmartIrrigationProgram,
  SmartIrrigationSchedule,
  SmartIrrigationStep,
  SmartIrrigationZone,
} from "../types";

/** The skip condition ids, in their order (const.py SKIP_CONDITION_IDS). */
export const SKIP_CONDITION_IDS = [
  "postponed",
  "rain_sensor",
  "freeze",
  "wind",
  "precipitation",
  "days_between",
  "soil_moisture",
];

/** What owns some YAML-only options, and those options in words. */
export interface YamlOnlyGroup {
  /** "" for the program itself, "Step 2", "Schedule 1"... */
  owner: string;
  items: string[];
}

export interface YamlOnlyText {
  /** A key of the programs texts, in the panel's language. */
  t: (key: string) => string;
  /** The short name of a month, January being 0. */
  monthName: (month: number) => string;
}

/**
 * "Label: value", in the language's own way: French puts a (non-breaking)
 * space before the colon. The pattern is a text of its own, {label} and
 * {value} in it; a language without one gets the English form.
 */
const item = (t: (key: string) => string, label: string, value: string) => {
  const pattern = t("yaml_only_item");
  const form = pattern.includes("{label}") ? pattern : "{label}: {value}";
  return form.replace("{label}", label).replace("{value}", value);
};

// 5, 6, 7, 8, 9 -> "May–Sep"; runs of three months or more are a range.
function monthList(months: number[], monthName: (m: number) => string) {
  const sorted = [...new Set(months)]
    .filter((m) => m >= 1 && m <= 12)
    .sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    if (j - i >= 2) {
      parts.push(`${monthName(sorted[i] - 1)}–${monthName(sorted[j] - 1)}`);
    } else {
      for (let k = i; k <= j; k++) parts.push(monthName(sorted[k] - 1));
    }
    i = j + 1;
  }
  return parts.join(", ");
}

/** A program's own YAML-only options, in words. */
export function programYamlOnly(
  program: SmartIrrigationProgram,
  { t }: YamlOnlyText,
): string[] {
  const items: string[] = [];
  if ((program.tours ?? 1) > 1)
    items.push(item(t, t("tours"), `${program.tours}`));
  return items;
}

/** A step's YAML-only options, in words. */
export function stepYamlOnly(
  step: SmartIrrigationStep,
  { t }: YamlOnlyText,
): string[] {
  const items: string[] = [];
  const adjust = step.adjust_seconds ?? 0;
  if (adjust !== 0)
    items.push(
      item(t, t("adjust_seconds"), `${adjust > 0 ? "+" : ""}${adjust} s`),
    );
  if ((step.min_deficit_mm ?? 0) > 0)
    items.push(item(t, t("min_deficit_mm"), `${step.min_deficit_mm} mm`));
  return items;
}

/** A schedule's YAML-only options, in words. */
export function scheduleYamlOnly(
  schedule: SmartIrrigationSchedule,
  { t, monthName }: YamlOnlyText,
): string[] {
  const items: string[] = [];
  if ((schedule.every_offset ?? 0) > 0)
    items.push(
      item(
        t,
        t("schedule_every_offset"),
        `${schedule.every_offset} ${t("schedule_days")}`,
      ),
    );
  if (schedule.parity === "even" || schedule.parity === "odd")
    items.push(item(t, t("schedule_parity"), t(`parity_${schedule.parity}`)));
  if ((schedule.days_of_month || []).length)
    items.push(
      item(
        t,
        t("schedule_days_of_month"),
        (schedule.days_of_month || [])
          .map((day) => (day === "last" ? t("last_word") : `${day}`))
          .join(", "),
      ),
    );
  if ((schedule.months || []).length)
    items.push(
      item(t, t("schedule_months"), monthList(schedule.months, monthName)),
    );
  if (schedule.fallback_time)
    items.push(
      item(
        t,
        t("schedule_fallback_time"),
        schedule.fallback_time === "previous"
          ? t("schedule_fallback_previous")
          : schedule.fallback_time,
      ),
    );
  if (Array.isArray(schedule.skip_conditions)) {
    // The postponed days always apply, listed or not.
    const only = SKIP_CONDITION_IDS.filter(
      (id) => id === "postponed" || schedule.skip_conditions!.includes(id),
    );
    items.push(
      item(
        t,
        t("conditions_subset"),
        only.map((id) => t(`condition_${id}`)).join(", "),
      ),
    );
  }
  return items;
}

/**
 * Every YAML-only option a program uses, grouped by what owns it: the
 * program first, then its steps and its schedules, named by their place
 * ("Step 2", "Schedule 1") as their folds are. Nothing when all are at their
 * defaults.
 */
export function yamlOnlyOptions(
  program: SmartIrrigationProgram,
  text: YamlOnlyText,
): YamlOnlyGroup[] {
  const groups: YamlOnlyGroup[] = [];
  const own = programYamlOnly(program, text);
  if (own.length) groups.push({ owner: "", items: own });
  (program.steps || []).forEach((step, n) => {
    const items = stepYamlOnly(step, text);
    if (items.length)
      groups.push({ owner: `${text.t("step")} ${n + 1}`, items });
  });
  (program.schedules || []).forEach((schedule, n) => {
    const items = scheduleYamlOnly(schedule, text);
    if (items.length)
      groups.push({ owner: `${text.t("schedule")} ${n + 1}`, items });
  });
  return groups;
}

/** One group on one line: "Step 2 · Time added: +30 s · ...". */
export function yamlOnlyLine(group: YamlOnlyGroup): string {
  return [group.owner, ...group.items].filter((s) => s).join(" · ");
}

/**
 * A step changed by the form: the other keys of the step, the YAML-only ones
 * among them, are kept as they are.
 */
export function withStep(
  program: SmartIrrigationProgram,
  stepIndex: number,
  changes: Partial<SmartIrrigationStep>,
): Partial<SmartIrrigationProgram> {
  return {
    steps: (program.steps || []).map((s, n) =>
      n === stepIndex ? { ...s, ...changes } : s,
    ),
  };
}

/** A schedule changed by the form, its other keys kept as they are. */
export function withSchedule(
  program: SmartIrrigationProgram,
  scheduleIndex: number,
  changes: Partial<SmartIrrigationSchedule>,
): Partial<SmartIrrigationProgram> {
  return {
    schedules: (program.schedules || []).map((s, n) =>
      n === scheduleIndex ? { ...s, ...changes } : s,
    ),
  };
}

/** A program changed by the form, its other keys kept as they are. */
export function withProgram(
  program: SmartIrrigationProgram,
  changes: Partial<SmartIrrigationProgram>,
): SmartIrrigationProgram {
  return { ...program, ...changes };
}

/** A key of the zone labels texts, in the panel's language. */
export type ZoneText = (key: string) => string;

/**
 * A zone's YAML-only options that are set, in words: the MQTT state key (a
 * value of its own; empty or unset, the default "state" applies) and how
 * often the open is sent again (any count, 0 included, is a choice).
 */
export function zoneYamlOnly(zone: SmartIrrigationZone, t: ZoneText): string[] {
  const items: string[] = [];
  const key = (zone.safety_off_state_key ?? "").trim();
  if (key) items.push(item(t, t("safety-off-state-key"), key));
  if (typeof zone.open_resends === "number")
    items.push(item(t, t("open-resends"), `${zone.open_resends}`));
  return items;
}
