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
