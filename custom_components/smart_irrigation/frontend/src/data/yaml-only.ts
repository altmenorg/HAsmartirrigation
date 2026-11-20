/**
 * The options of a program or a zone that the form does not show, and why.
 *
 * Three tiers, as Home Assistant's own visual editors have:
 * - the standard form shows what nearly everybody needs;
 * - the advanced mode (Settings, General, Advanced settings) shows the rest
 *   of the options as fields: the program's `tours`; a step's
 *   `adjust_seconds` and `min_deficit_mm`; a schedule's `every_offset`,
 *   `parity`, `days_of_month`, `months` and `skip_conditions`; a zone's
 *   `open_resends`;
 * - two technical options have no field in any mode, set in YAML only: a
 *   schedule's `fallback_time` (polar day or night) and a zone's
 *   `safety_off_state_key` (the MQTT state key).
 *
 * The form keeps what it does not show untouched (every patch spreads the
 * object it changes) and says, read-only, which of those hidden options are
 * set. This module lists them, in words, for that notice.
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

/** The panel's mode (config.ui_mode): "advanced", or the standard one. */
export type PanelMode = string | null | undefined;

export const isAdvanced = (mode: PanelMode): boolean => mode === "advanced";

/** An option the form does not show, in words. */
interface Hidden {
  text: string;
  /** No field in any mode; otherwise a field of the advanced mode. */
  yamlOnly: boolean;
}

/** What owns some hidden options, and those options in words. */
export interface HiddenGroup {
  /** "" for the program (or the zone) itself, "Step 2", "Schedule 1"... */
  owner: string;
  items: string[];
  /** Some of the items are fields of the advanced mode. */
  advanced: boolean;
}

export interface HiddenText {
  /** A key of the programs texts, in the panel's language. */
  t: (key: string) => string;
  /** The short name of a month, January being 0. */
  monthName: (month: number) => string;
  /** A count of days, singular or plural as the language has it. */
  days: (count: number) => string;
  /** A number as the user's number setting writes it ("1,5" in German). */
  num?: (value: number) => string;
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

const advancedItem = (text: string): Hidden => ({ text, yamlOnly: false });
const yamlOnlyItem = (text: string): Hidden => ({ text, yamlOnly: true });

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

/** A program's own options the standard form does not show, when set. */
function programHidden(
  program: SmartIrrigationProgram,
  { t }: HiddenText,
): Hidden[] {
  const items: Hidden[] = [];
  if ((program.tours ?? 1) > 1)
    items.push(advancedItem(item(t, t("tours"), `${program.tours}`)));
  return items;
}

/** A step's options the standard form does not show, when set. */
function stepHidden(
  step: SmartIrrigationStep,
  { t, num }: HiddenText,
): Hidden[] {
  const items: Hidden[] = [];
  const adjust = step.adjust_seconds ?? 0;
  if (adjust !== 0)
    items.push(
      advancedItem(
        item(t, t("adjust_seconds"), `${adjust > 0 ? "+" : ""}${adjust} s`),
      ),
    );
  if ((step.min_deficit_mm ?? 0) > 0)
    items.push(
      advancedItem(
        item(
          t,
          t("min_deficit_short"),
          `${(num ?? String)(step.min_deficit_mm!)} mm`,
        ),
      ),
    );
  return items;
}

/** A schedule's options the standard form does not show, when set. */
function scheduleHidden(
  schedule: SmartIrrigationSchedule,
  { t, monthName, days }: HiddenText,
): Hidden[] {
  const items: Hidden[] = [];
  const offset = schedule.every_offset ?? 0;
  if (offset > 0)
    items.push(advancedItem(item(t, t("schedule_every_offset"), days(offset))));
  if (schedule.parity === "even" || schedule.parity === "odd")
    items.push(
      advancedItem(
        item(t, t("schedule_parity"), t(`parity_${schedule.parity}`)),
      ),
    );
  if ((schedule.days_of_month || []).length)
    items.push(
      advancedItem(
        item(
          t,
          t("schedule_days_of_month"),
          (schedule.days_of_month || [])
            .map((day) => (day === "last" ? t("last_word") : `${day}`))
            .join(", "),
        ),
      ),
    );
  if ((schedule.months || []).length)
    items.push(
      advancedItem(
        item(t, t("schedule_months"), monthList(schedule.months, monthName)),
      ),
    );
  if (schedule.fallback_time)
    items.push(
      yamlOnlyItem(
        item(
          t,
          t("schedule_fallback_time"),
          schedule.fallback_time === "previous"
            ? t("schedule_fallback_previous")
            : schedule.fallback_time,
        ),
      ),
    );
  if (Array.isArray(schedule.skip_conditions)) {
    // The postponed days always apply, listed or not.
    const only = SKIP_CONDITION_IDS.filter(
      (id) => id === "postponed" || schedule.skip_conditions!.includes(id),
    );
    items.push(
      advancedItem(
        item(
          t,
          t("conditions_subset"),
          only.map((id) => t(`condition_${id}`)).join(", "),
        ),
      ),
    );
  }
  return items;
}

/**
 * The hidden options of the mode, as a group: in the advanced mode, the
 * YAML-only ones alone (the others are fields there); in the standard mode,
 * every one that is set. Null when none.
 */
function group(
  owner: string,
  hidden: Hidden[],
  mode: PanelMode,
): HiddenGroup | null {
  const shown = isAdvanced(mode) ? hidden.filter((h) => h.yamlOnly) : hidden;
  if (!shown.length) return null;
  return {
    owner,
    items: shown.map((h) => h.text),
    advanced: shown.some((h) => !h.yamlOnly),
  };
}

/**
 * Every option a program uses that the form of this mode does not show,
 * grouped by what owns it: the program first, then its steps and its
 * schedules, named by their place ("Step 2", "Schedule 1") as their folds
 * are. Nothing when all are at their defaults.
 */
export function hiddenOptions(
  program: SmartIrrigationProgram,
  mode: PanelMode,
  text: HiddenText,
): HiddenGroup[] {
  const groups: (HiddenGroup | null)[] = [
    group("", programHidden(program, text), mode),
    ...(program.steps || []).map((step, n) =>
      group(`${text.t("step")} ${n + 1}`, stepHidden(step, text), mode),
    ),
    ...(program.schedules || []).map((schedule, n) =>
      group(
        `${text.t("schedule")} ${n + 1}`,
        scheduleHidden(schedule, text),
        mode,
      ),
    ),
  ];
  return groups.filter((g): g is HiddenGroup => g !== null);
}

/**
 * Whether the notice is about the advanced mode (some of what it lists is a
 * field there) or about YAML alone.
 */
export function hiddenInAdvanced(groups: HiddenGroup[]): boolean {
  return groups.some((g) => g.advanced);
}

/** One group on one line: "Step 2 · Time added: +30 s · ...". */
export function hiddenLine(group: HiddenGroup): string {
  return [group.owner, ...group.items].filter((s) => s).join(" · ");
}

/**
 * A step changed by the form: the other keys of the step, the hidden ones
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
 * A zone's options that the form of this mode does not show, when set: the
 * MQTT state key (YAML only; empty or unset, the default "state" applies)
 * and how often the open is sent again (a field of the advanced mode; any
 * count, 0 included, is a choice). Null when none.
 */
export function zoneHiddenOptions(
  zone: SmartIrrigationZone,
  mode: PanelMode,
  t: ZoneText,
): HiddenGroup | null {
  const hidden: Hidden[] = [];
  const key = (zone.safety_off_state_key ?? "").trim();
  if (key) hidden.push(yamlOnlyItem(item(t, t("safety-off-state-key"), key)));
  if (typeof zone.open_resends === "number")
    hidden.push(
      advancedItem(item(t, t("open-resends"), `${zone.open_resends}`)),
    );
  return group("", hidden, mode);
}
