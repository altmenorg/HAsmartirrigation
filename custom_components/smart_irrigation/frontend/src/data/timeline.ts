/**
 * A program's run as a timeline: one row per zone, its passes, the pipe filling
 * and the soaks between them as bars on a time axis.
 *
 * The backend walks the plan the way the runner does (programs.plan_timeline)
 * and sends the segments in seconds from the run's start; this only lays them
 * out. Kept free of Lit so it can be tested on its own.
 */

export type TimelineSegmentKind = "fill" | "water" | "soak";

export interface TimelineSegment {
  zone_id: number;
  tour: number;
  step: number;
  pass: number;
  kind: TimelineSegmentKind;
  start: number;
  end: number;
}

export interface Timeline {
  total: number;
  zones: { zone_id: number; zone: string | null }[];
  segments: TimelineSegment[];
}

export interface TimelineRow {
  zoneId: number;
  name: string;
  segments: TimelineSegment[];
}

/** One row per zone, in the order the zones first water. */
export const timelineRows = (
  timeline: Timeline | null | undefined,
  fallbackName: (zoneId: number) => string = (id) => `#${id}`,
): TimelineRow[] => {
  if (!timeline?.segments?.length) return [];
  const names = new Map(
    (timeline.zones || []).map((z) => [z.zone_id, z.zone] as const),
  );
  const rows = new Map<number, TimelineRow>();
  for (const segment of timeline.segments) {
    let row = rows.get(segment.zone_id);
    if (!row) {
      row = {
        zoneId: segment.zone_id,
        name: names.get(segment.zone_id) || fallbackName(segment.zone_id),
        segments: [],
      };
      rows.set(segment.zone_id, row);
    }
    row.segments.push(segment);
  }
  return [...rows.values()];
};

// Steps between two marks of the axis, in seconds: round numbers a clock reads.
const TICK_STEPS = [
  30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 10800, 21600, 43200,
];

/**
 * The marks of the axis, from 0 to ``total``: at most ``most`` of them, on a
 * round step, the start always marked.
 */
export const timelineTicks = (total: number, most = 6): number[] => {
  if (!(total > 0)) return [0];
  const step =
    TICK_STEPS.find((s) => total / s <= most) ??
    Math.ceil(total / most / 3600) * 3600;
  const ticks: number[] = [];
  for (let t = 0; t <= total + 1e-6; t += step) ticks.push(t);
  return ticks;
};

/** Where a moment of the run sits on the track, in percent. */
export const timelinePercent = (seconds: number, total: number): number =>
  total > 0 ? Math.max(0, Math.min(100, (seconds / total) * 100)) : 0;

/** The water a zone gets in the run, the filling and soaks left out. */
export const wateredSeconds = (row: TimelineRow): number =>
  row.segments
    .filter((s) => s.kind === "water")
    .reduce((sum, s) => sum + (s.end - s.start), 0);

/** An offset on the axis, read as "+5 min", "+1 h 30". */
export const offsetLabel = (seconds: number): string => {
  const total = Math.round(seconds);
  if (total <= 0) return "0";
  const h = Math.floor(total / 3600);
  if (total < 60) return `+${total} s`;
  const m = Math.round((total % 3600) / 60);
  if (h > 0) return m ? `+${h} h ${String(m).padStart(2, "0")}` : `+${h} h`;
  return `+${m} min`;
};
