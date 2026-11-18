/**
 * A program as the YAML editor shows it: short, and readable without the panel.
 *
 * The zones of a step are written by name (by number when two zones share
 * one), and what is left at its default is not written: the backend cleans
 * what comes back the way it cleans a save (program_preview), so a field left
 * out takes its default again. This is also the shape an assistant reads and
 * writes, so it has to say what the program does, not how it is stored.
 *
 * A schedule that starts after another program names it by name too (by id
 * when two programs share the name); the backend turns it back into the id.
 */

import { SmartIrrigationProgram, SmartIrrigationZone } from "../types";

type Plain = Record<string, unknown>;

// What a field is when it is not written, by field: left out when equal.
const STEP_DEFAULTS: Plain = {
  mode: "calculated",
  passes: 1,
  max_litres: 0,
  min_seconds: 0,
  max_seconds: 0,
  adjust_seconds: 0,
  delay: null,
  enabled: true,
};

const SCHEDULE_DEFAULTS: Plain = {
  enabled: true,
  type: "time",
  offset_minutes: 0,
  anchor: "start",
  every_n_days: 1,
  every_offset: 0,
  parity: "any",
  from_date: null,
  until_date: null,
  weather: true,
  hard_deadline: false,
  fallback_time: null,
};

const isDefault = (value: unknown, fallback: unknown) =>
  value === undefined ||
  value === fallback ||
  (Array.isArray(value) && value.length === 0);

const compact = (source: Plain, defaults: Plain, skip: string[] = []) => {
  const out: Plain = {};
  for (const [key, value] of Object.entries(source)) {
    if (skip.includes(key)) continue;
    if (
      key in defaults ? isDefault(value, defaults[key]) : isDefault(value, null)
    )
      continue;
    out[key] = value;
  }
  return out;
};

/** The program, ready for the YAML editor. */
export const programToYaml = (
  program: SmartIrrigationProgram,
  zones: SmartIrrigationZone[],
  programs: SmartIrrigationProgram[] = [],
): Plain => {
  const programRef = (id: string | null | undefined): string | null => {
    if (!id) return null;
    const found = programs.find((p) => p.id === id);
    const name = String(found?.name ?? "").trim();
    const same = programs.filter(
      (p) =>
        String(p.name ?? "")
          .trim()
          .toLowerCase() === name.toLowerCase(),
    );
    // A name another program has as its id would be read back as that one.
    if (
      !found ||
      !name ||
      same.length !== 1 ||
      programs.some((p) => p.id === name)
    )
      return id;
    return name;
  };
  const counts = new Map<string, number>();
  for (const zone of zones) {
    const key = String(zone.name ?? "")
      .trim()
      .toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const zoneRef = (id: number): string | number => {
    const zone = zones.find((z) => z.id === id);
    const key = String(zone?.name ?? "")
      .trim()
      .toLowerCase();
    // A name that is a number would be read back as one.
    if (!zone || !key || counts.get(key) !== 1 || /^-?\d+$/.test(key))
      return id;
    return String(zone.name).trim();
  };
  const out: Plain = { id: program.id, name: program.name };
  if (program.delay) out.delay = program.delay;
  if ((program.tours ?? 1) > 1) out.tours = program.tours;
  out.steps = (program.steps || []).map((step) => {
    const plain = compact(step as unknown as Plain, STEP_DEFAULTS, [
      "zones",
      "mode",
      "percent",
      "seconds",
    ]);
    // How long it waters reads with what it waters: the mode, then its number.
    const ordered: Plain = {
      id: step.id,
      zones: (step.zones || []).map(zoneRef),
    };
    if (step.mode && step.mode !== "calculated") ordered.mode = step.mode;
    if (step.mode === "percent") ordered.percent = step.percent;
    if (step.mode === "fixed") ordered.seconds = step.seconds;
    delete plain.id;
    return { ...ordered, ...plain };
  });
  out.schedules = (program.schedules || []).map((schedule) => {
    if (schedule.type === "after") {
      // No moment of its own: it starts (anchor) after the other program.
      const plain = compact(schedule as unknown as Plain, SCHEDULE_DEFAULTS, [
        "time",
        "event",
        "azimuth",
        "anchor",
        "fallback_time",
        "hard_deadline",
      ]);
      // The program it follows reads right after the type.
      const ordered: Plain = {};
      for (const [key, value] of Object.entries(plain)) {
        if (key === "after_program") continue;
        ordered[key] = value;
        if (key === "type")
          ordered.after_program = programRef(schedule.after_program);
      }
      return ordered;
    }
    const skip =
      schedule.type === "sun"
        ? ["time", "after_program"]
        : ["event", "offset_minutes", "after_program"];
    return compact(schedule as unknown as Plain, SCHEDULE_DEFAULTS, skip);
  });
  if (program.notify?.targets?.length) out.notify = { ...program.notify };
  return out;
};

/** What the YAML editor read, when it is a set of keys (a copy), or null. */
export const asMapping = (value: unknown): Plain | null =>
  !value || typeof value !== "object" || Array.isArray(value)
    ? null
    : { ...(value as Plain) };

/**
 * What the editor sends to be cleaned: the YAML as typed, its id kept to the
 * program it replaces (a program renamed in YAML is still that program).
 */
export const programFromYaml = (
  value: unknown,
  replacing?: SmartIrrigationProgram,
): Plain | null => {
  const program = asMapping(value);
  if (!program) return null;
  if (replacing) program.id = replacing.id;
  return program;
};
