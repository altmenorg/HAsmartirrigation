/**
 * The planning laid out as a week: a row per day, each run a block on an hour
 * axis. The planning endpoint already places every run (where it waits behind
 * another one too, ``expected_start``); this only cuts it into days and
 * works out the part of the day worth drawing. Kept free of Lit for tests.
 */

export interface WeekRun {
  program_id: string;
  program: string;
  start: string;
  end: string;
  expected_start?: string;
  expected_end?: string;
  skipped_reason?: string | null;
  nothing_to_water?: boolean;
  /** Today's, from the history (todayRuns): going on, or over. */
  running?: boolean;
  done?: boolean;
  timeline?: {
    total: number;
    segments: { kind: string; start: number; end: number }[];
  } | null;
  [key: string]: unknown;
}

export interface WeekBlock {
  run: WeekRun;
  /** Seconds from the day's midnight. */
  from: number;
  to: number;
  /** The run goes on before or after this day. */
  cutBefore: boolean;
  cutAfter: boolean;
  /** Soaks, as seconds from the day's midnight, clipped to the block. */
  soaks: { from: number; to: number }[];
  held: boolean;
}

export interface WeekDay {
  date: Date;
  blocks: WeekBlock[];
}

export interface WeekLayout {
  days: WeekDay[];
  /** The hours drawn, in seconds from midnight: [from, to). */
  from: number;
  to: number;
  programs: string[];
}

const DAY = 86400;
const HOUR = 3600;

const midnight = (at: Date): Date =>
  new Date(at.getFullYear(), at.getMonth(), at.getDate());

const addDays = (day: Date, n: number): Date =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate() + n);

/**
 * ``days`` rows from the day of ``now``, every run of ``planning`` in the rows
 * it covers (a run over midnight shows on both days).
 *
 * The axis keeps the hours the runs use, rounded out to the hour with an hour
 * either side, and at least ``minHours`` wide: a garden watered at dawn is a
 * thin line on 24 hours. With no run it is the whole day.
 */
export const weekLayout = (
  planning: WeekRun[],
  days: number,
  now: Date,
  minHours = 4,
): WeekLayout => {
  const first = midnight(now);
  const rows: WeekDay[] = Array.from({ length: days }, (_, n) => ({
    date: addDays(first, n),
    blocks: [],
  }));
  const programs: string[] = [];
  let low = Infinity;
  let high = -Infinity;
  for (const run of planning || []) {
    const start = new Date(run.expected_start || run.start);
    const end = new Date(run.expected_end || run.end);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;
    if (!programs.includes(run.program_id)) programs.push(run.program_id);
    const runEnd = end > start ? end : new Date(start.getTime() + 60000);
    for (const row of rows) {
      const dayStart = row.date.getTime();
      const dayEnd = addDays(row.date, 1).getTime();
      if (runEnd.getTime() <= dayStart || start.getTime() >= dayEnd) continue;
      const from = Math.max(0, (start.getTime() - dayStart) / 1000);
      const to = Math.min(DAY, (runEnd.getTime() - dayStart) / 1000);
      const offset = (start.getTime() - dayStart) / 1000;
      const soaks = (run.timeline?.segments || [])
        .filter((s) => s.kind === "soak")
        .map((s) => ({
          from: Math.max(from, offset + s.start),
          to: Math.min(to, offset + s.end),
        }))
        .filter((s) => s.to > s.from);
      row.blocks.push({
        run,
        from,
        to,
        cutBefore: start.getTime() < dayStart,
        cutAfter: runEnd.getTime() > dayEnd,
        soaks,
        held: !!run.skipped_reason || !!run.nothing_to_water,
      });
      low = Math.min(low, from);
      high = Math.max(high, to);
    }
  }
  if (!isFinite(low)) return { days: rows, from: 0, to: DAY, programs };
  let from = Math.max(0, Math.floor(low / HOUR) * HOUR - HOUR);
  let to = Math.min(DAY, Math.ceil(high / HOUR) * HOUR + HOUR);
  const short = minHours * HOUR - (to - from);
  if (short > 0) {
    from = Math.max(0, from - Math.ceil(short / 2 / HOUR) * HOUR);
    to = Math.min(DAY, from + minHours * HOUR);
    from = Math.max(0, to - minHours * HOUR);
  }
  return { days: rows, from, to, programs };
};

/** Where ``seconds`` falls on the axis, in percent. */
export const weekPercent = (
  seconds: number,
  layout: Pick<WeekLayout, "from" | "to">,
): number => {
  const span = layout.to - layout.from;
  if (span <= 0) return 0;
  return Math.max(0, Math.min(100, ((seconds - layout.from) / span) * 100));
};

/** The whole hours of the axis worth a mark: every 1, 2, 3 or 6 hours. */
export const weekTicks = (
  layout: Pick<WeekLayout, "from" | "to">,
): number[] => {
  const hours = (layout.to - layout.from) / HOUR;
  const step = hours <= 6 ? 1 : hours <= 12 ? 2 : hours <= 18 ? 3 : 6;
  const ticks: number[] = [];
  const first = Math.ceil(layout.from / (step * HOUR)) * step * HOUR;
  for (let t = first; t <= layout.to; t += step * HOUR) ticks.push(t);
  return ticks;
};

/** A zone's run as the irrigation history records it, once it is over. */
export interface TodayRecord {
  start: string | null;
  zone_name?: string | null;
  duration: number;
  program_id?: string | null;
}

/** A program as the programs' state lists it. */
export interface TodayProgram {
  program_id: string;
  name: string;
  state?: string;
  last_run?: string | null;
  live?: { remaining_seconds?: number | null } | null;
}

/**
 * Today's runs under way and over, as runs of the week: the planning lists
 * only the starts to come, and the "Today" row stayed empty under a run going
 * on, or after the morning's. A program's zones that follow each other (a
 * soak between them up to ``gap`` seconds) make one run; a run going on ends
 * where its remaining time says. Runs not started by a program (by hand, from
 * outside) are not a program's, and are left out.
 */
export const todayRuns = (
  records: TodayRecord[],
  programs: TodayProgram[],
  now: Date,
  gap = HOUR,
): WeekRun[] => {
  const names = new Map((programs || []).map((p) => [p.program_id, p.name]));
  const dayStart = midnight(now).getTime();
  const nowMs = now.getTime();
  type Span = {
    from: number;
    to: number;
    running: boolean;
    zones: { zone: string; seconds: number }[];
  };
  const spans = new Map<string, Span[]>();
  const add = (id: string, span: Span) => {
    if (!spans.has(id)) spans.set(id, []);
    spans.get(id)!.push(span);
  };
  for (const record of records || []) {
    const id = record.program_id;
    if (!id || !names.has(id) || !record.start) continue;
    const from = Date.parse(record.start);
    const seconds = Math.max(0, Number(record.duration) || 0);
    const to = from + seconds * 1000;
    if (isNaN(from) || to <= dayStart || from > nowMs) continue;
    add(id, {
      from,
      to: Math.min(to, nowMs),
      running: false,
      zones: [{ zone: record.zone_name || "", seconds }],
    });
  }
  for (const program of programs || []) {
    if (program.state !== "running" && program.state !== "paused") continue;
    const from = Date.parse(program.last_run || "");
    if (isNaN(from) || from > nowMs) continue;
    const to = nowMs + Math.max(0, program.live?.remaining_seconds ?? 0) * 1000;
    if (to <= dayStart) continue;
    add(program.program_id, { from, to, running: true, zones: [] });
  }
  const runs: WeekRun[] = [];
  for (const [id, list] of spans) {
    list.sort((a, b) => a.from - b.from);
    const merged: Span[] = [];
    for (const span of list) {
      const last = merged[merged.length - 1];
      if (last && span.from <= last.to + gap * 1000) {
        last.to = Math.max(last.to, span.to);
        last.running = last.running || span.running;
        last.zones.push(...span.zones);
      } else merged.push({ ...span, zones: [...span.zones] });
    }
    for (const span of merged) {
      runs.push({
        program_id: id,
        program: names.get(id) || id,
        start: new Date(span.from).toISOString(),
        end: new Date(span.to).toISOString(),
        steps: span.zones.length ? [{ zones: span.zones }] : [],
        running: span.running,
        done: !span.running,
      });
    }
  }
  return runs.sort((a, b) => a.start.localeCompare(b.start));
};
