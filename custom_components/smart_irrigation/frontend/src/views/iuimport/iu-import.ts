/**
 * What the Irrigation Unlimited import wizard shows, worked out without Lit.
 *
 * The backend says what an import does as data (iu_import_ha.py); these turn
 * that into the few words a row of the wizard has room for. Words come from the
 * caller's ``t``, so the functions stay testable without a language loaded.
 */
import type {
  IuImportConflict,
  IuImportPreview,
  IuImportReportItem,
} from "../../data/websockets";

/** A translator for keys under ``panels.iu_import``. */
export type Translate = (key: string, ...args: any[]) => string;

/** A short duration: "45 s", "10 min", "1 h 5 min". */
export function shortDuration(seconds?: number | null): string {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  if (total < 60) return `${total} s`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const parts: string[] = [];
  if (hours) parts.push(`${hours} h`);
  if (minutes) parts.push(`${minutes} min`);
  if (secs) parts.push(`${secs} s`);
  return parts.join(" ");
}

/** Monday-first weekday names (0 = Monday), as the language writes them. */
export function weekdayNames(lang: string): string[] {
  const format = new Intl.DateTimeFormat(lang, { weekday: "short" });
  // 2024-01-01 was a Monday.
  return [...Array(7).keys()].map((i) =>
    format.format(new Date(Date.UTC(2024, 0, 1 + i, 12))),
  );
}

/** Month names (1 = January), short, as the language writes them. */
export function monthNames(lang: string): string[] {
  const format = new Intl.DateTimeFormat(lang, { month: "short" });
  return [...Array(12).keys()].map((i) =>
    format.format(new Date(Date.UTC(2024, i, 15, 12))),
  );
}

/**
 * One schedule as a line: when, on which days, in which part of the year.
 *
 * Only what the schedule sets is said: a schedule for every day says nothing
 * about days.
 */
export function describeSchedule(
  schedule: Record<string, any>,
  lang: string,
  t: Translate,
): string {
  const parts: string[] = [];
  const offset = Number(schedule.offset_minutes) || 0;
  if (schedule.type === "sun") {
    const event = t(
      schedule.event === "sunset" ? "schedule.sunset" : "schedule.sunrise",
    );
    parts.push(
      offset
        ? `${event} ${offset > 0 ? "+" : "−"}${Math.abs(offset)} min`
        : event,
    );
  } else {
    parts.push(String(schedule.time ?? ""));
  }
  if (schedule.anchor === "end")
    parts[0] = t("schedule.done-by", "time", parts[0]);

  const weekdays: number[] = Array.isArray(schedule.weekdays)
    ? schedule.weekdays
    : [];
  if (weekdays.length && weekdays.length < 7) {
    const names = weekdayNames(lang);
    parts.push(weekdays.map((d) => names[d] ?? String(d)).join(", "));
  }
  const every = Number(schedule.every_n_days) || 0;
  if (every > 1) parts.push(t("schedule.every", "count", every));
  if (schedule.parity === "odd") parts.push(t("schedule.odd"));
  if (schedule.parity === "even") parts.push(t("schedule.even"));
  const days: (number | string)[] = Array.isArray(schedule.days_of_month)
    ? schedule.days_of_month
    : [];
  if (days.length) {
    parts.push(
      t(
        "schedule.days-of-month",
        "days",
        days
          .map((d) => (d === "last" ? t("schedule.last") : String(d)))
          .join(", "),
      ),
    );
  }
  const months: number[] = Array.isArray(schedule.months)
    ? schedule.months
    : [];
  if (months.length && months.length < 12) {
    const names = monthNames(lang);
    parts.push(months.map((m) => names[m - 1] ?? String(m)).join(", "));
  }
  if (schedule.from_date || schedule.until_date) {
    parts.push(
      `${schedule.from_date ?? "01-01"} – ${schedule.until_date ?? "12-31"}`,
    );
  }
  if (schedule.enabled === false) parts.push(t("schedule.off-in-iu"));
  return parts.filter((p) => p).join(" · ");
}

/** A step as a line: its zones, and how long or "calculated". */
export function describeStep(
  zoneNames: string[],
  step: IuImportPreview["programs"][number]["program"]["steps"][number],
  t: Translate,
): string {
  const zones = zoneNames.join(" + ");
  const how =
    step.mode === "calculated"
      ? t("programs.calculated")
      : shortDuration(step.seconds);
  const passes =
    (step.passes ?? 1) > 1
      ? ` · ${t("programs.passes", "count", step.passes)}`
      : "";
  const off = step.enabled === false ? ` · ${t("programs.step-off")}` : "";
  return `${zones}: ${how}${passes}${off}`;
}

/** The report's items that need reading, worst first: lost, unknown, approximated. */
export function reportGroups(
  items: IuImportReportItem[],
): { outcome: IuImportReportItem["outcome"]; items: IuImportReportItem[] }[] {
  const order: IuImportReportItem["outcome"][] = [
    "not_carried",
    "unknown",
    "approximated",
  ];
  return order
    .map((outcome) => ({
      outcome,
      items: items.filter((item) => item.outcome === outcome),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * The zone choices after one select changed.
 *
 * Choosing what the import would have picked by itself drops the choice, so
 * the preview keeps saying why (valve, blueprint, name) instead of "chosen".
 */
export function withMatch(
  matches: Record<string, number | "new">,
  key: string,
  value: number | "new",
  automatic: number | "new",
): Record<string, number | "new"> {
  const next = { ...matches };
  if (value === automatic) delete next[key];
  else next[key] = value;
  return next;
}

/** What the import would pick by itself for an IU zone, as a select value. */
export function automaticMatch(
  zone: IuImportPreview["zones"][number],
): number | "new" {
  return zone.zone_id === null ? "new" : zone.zone_id;
}

/** How many things the import creates, changes and removes, for the last step. */
export function summary(preview: IuImportPreview): {
  zonesCreated: number;
  zonesFilled: number;
  zonesUsed: number;
  programsCreated: number;
  programsUpdated: number;
  programsRemoved: number;
  suppliesCreated: number;
  suppliesUpdated: number;
  suppliesRemoved: number;
} {
  const count = <T>(list: T[], test: (item: T) => boolean) =>
    list.filter(test).length;
  return {
    zonesCreated: count(preview.zones, (z) => z.action === "create"),
    zonesFilled: count(preview.zones, (z) => z.action === "update"),
    zonesUsed: count(preview.zones, (z) => z.action === "use"),
    programsCreated: count(preview.programs, (p) => p.action === "create"),
    programsUpdated: count(preview.programs, (p) => p.action === "update"),
    programsRemoved: preview.removed.programs.length,
    suppliesCreated: count(preview.supplies, (s) => s.action === "create"),
    suppliesUpdated: count(preview.supplies, (s) => s.action === "update"),
    suppliesRemoved: preview.removed.supplies.length,
  };
}

/**
 * A report note in the user's language.
 *
 * The backend sends each note in English with a code and its values; the code
 * picks the text under ``notes`` and the values fill it. A code with no text
 * (an older backend, a new note not translated yet) shows the English note.
 */
export function reportNote(item: IuImportReportItem, t: Translate): string {
  if (!item.code) return item.note;
  try {
    const args = Object.entries(item.params ?? {}).flat();
    const text = t(`notes.${item.code}`, ...args);
    if (typeof text === "string" && text && !text.startsWith("Translation"))
      return text;
  } catch {
    // No such text: the English note below.
  }
  return item.note;
}

/**
 * What the import picks by itself for each IU zone: the zones of a preview
 * asked for without any choice. A choice equal to it is no choice.
 */
export function baselineOf(
  preview: IuImportPreview,
): Record<string, number | "new"> {
  return Object.fromEntries(
    preview.zones.map((z) => [z.key, automaticMatch(z)]),
  );
}

/**
 * The conflicts that concern one IU zone, by its key. Two zones on one are
 * marked on both: either choice resolves it.
 */
export function zoneConflicts(
  preview: IuImportPreview | undefined,
): Record<string, IuImportConflict> {
  const found: Record<string, IuImportConflict> = {};
  for (const conflict of preview?.conflicts ?? []) {
    if ("key" in conflict) found[conflict.key] = conflict;
    if (conflict.code === "zone_twice") found[conflict.other] ??= conflict;
  }
  return found;
}

/** The conflicts that no zone choice resolves: a program or pump in the way. */
export function nameConflicts(
  preview: IuImportPreview | undefined,
): IuImportConflict[] {
  return (preview?.conflicts ?? []).filter((c) => !("key" in c));
}

/**
 * Where an arrow key moves in a group of radio cards: the next or previous
 * one that can be chosen, round the ends, or the first or last with Home and
 * End. ``null`` for any other key, or when none can be chosen.
 */
export function nextChoice(
  enabled: boolean[],
  current: number,
  key: string,
): number | null {
  const open = enabled.map((on, i) => (on ? i : -1)).filter((i) => i >= 0);
  if (!open.length) return null;
  if (key === "Home") return open[0];
  if (key === "End") return open[open.length - 1];
  const step =
    key === "ArrowDown" || key === "ArrowRight"
      ? 1
      : key === "ArrowUp" || key === "ArrowLeft"
        ? -1
        : 0;
  if (!step) return null;
  const n = enabled.length;
  for (let k = 1; k <= n; k++) {
    const i = (((current + step * k) % n) + n) % n;
    if (enabled[i]) return i;
  }
  return null;
}
