/**
 * A program as a flow: what starts it, the weather it asks, the pumps it
 * switches, its steps in order with the valves of each side by side, the waits
 * between them, and what it tells at the end.
 *
 * The steps come from the run's timeline (programs.plan_timeline, the same the
 * runner follows), not from the steps as written: a step with no zone left, a
 * disabled one, all read as they will be watered. The wait between two steps is the gap the timeline leaves,
 * negative when the next starts before the last ends. Kept free of Lit.
 */

import { Timeline } from "./timeline";

export interface FlowZone {
  zoneId: number;
  name: string;
  /** Seconds of water in one round, every pass together. */
  seconds: number;
  passes: number;
}

export interface FlowStep {
  zones: FlowZone[];
  /** The pause between two passes of the step, when it waters in passes. */
  soakSeconds: number;
  /** Seconds between this step's end and the next one's start (< 0: overlap). */
  waitAfter: number | null;
}

export interface FlowSupply {
  name: string;
  before: number;
  after: number;
}

export interface ProgramFlow {
  steps: FlowStep[];
  supplies: FlowSupply[];
  tours: number;
  /** Zones of the program with no water to give now: shown, not left out. */
  idle: { zoneId: number; name: string }[];
}

interface SupplyLike {
  id?: string;
  name: string;
  delay_before?: number;
  delay_after?: number;
  enabled?: boolean;
}

interface ZoneLike {
  id?: number;
  supply_id?: string | null;
}

export const programFlow = (
  timeline: Timeline | null | undefined,
  zones: ZoneLike[] = [],
  supplies: SupplyLike[] = [],
  // Every zone the program can water, watered now or not (``idle``).
  programZones: { id: number; name: string }[] = [],
): ProgramFlow => {
  const segments = timeline?.segments || [];
  const names = new Map(
    (timeline?.zones || []).map((z) => [z.zone_id, z.zone] as const),
  );
  const tours = segments.length
    ? Math.max(...segments.map((s) => s.tour)) + 1
    : 1;
  // One round tells it all: the next ones repeat it.
  const first = segments.filter((s) => s.tour === 0);
  const stepIds = [...new Set(first.map((s) => s.step))].sort((a, b) => a - b);
  const steps: FlowStep[] = stepIds.map((step) => {
    const own = first.filter((s) => s.step === step);
    const order: number[] = [];
    for (const s of own) if (!order.includes(s.zone_id)) order.push(s.zone_id);
    const soak = own.find((s) => s.kind === "soak");
    return {
      zones: order.map((zoneId) => {
        const water = own.filter(
          (s) => s.zone_id === zoneId && s.kind === "water",
        );
        return {
          zoneId,
          name: names.get(zoneId) || `#${zoneId}`,
          seconds: Math.round(
            water.reduce((sum, s) => sum + (s.end - s.start), 0),
          ),
          passes: new Set(water.map((s) => s.pass)).size || 1,
        };
      }),
      soakSeconds: soak ? Math.round(soak.end - soak.start) : 0,
      waitAfter: null,
    };
  });
  for (let n = 0; n + 1 < stepIds.length; n++) {
    const end = Math.max(
      ...first.filter((s) => s.step === stepIds[n]).map((s) => s.end),
    );
    const next = Math.min(
      ...first.filter((s) => s.step === stepIds[n + 1]).map((s) => s.start),
    );
    steps[n].waitAfter = Math.round(next - end);
  }
  // The pumps and main valves the zones of the run are on.
  const used = new Set<string>();
  for (const step of steps)
    for (const z of step.zones) {
      const supply = zones.find((zone) => zone.id === z.zoneId)?.supply_id;
      if (supply) used.add(supply);
    }
  const flowSupplies = supplies
    .filter((s) => s.id && used.has(s.id) && s.enabled !== false)
    .map((s) => ({
      name: s.name,
      before: Number(s.delay_before) || 0,
      after: Number(s.delay_after) || 0,
    }));
  const watered = new Set(steps.flatMap((s) => s.zones.map((z) => z.zoneId)));
  const idle = programZones
    .filter((z) => !watered.has(z.id))
    .map((z) => ({ zoneId: z.id, name: z.name }));
  return { steps, supplies: flowSupplies, tours, idle };
};

/** The answer of the flow's "Weather allows it?" node, for the next run. */
export type WeatherVerdict =
  /** No schedule of the program takes the weather into account. */
  | { state: "off" }
  /** Nothing to go on yet (no answer from the backend). */
  | { state: "unknown" }
  /** ``unread``: a check that applies but could not be read (no forecast). */
  | { state: "yes"; unread?: string }
  /** ``reason`` is a skip condition id; ``mm`` the rain forecast behind it. */
  | { state: "no"; reason: string; mm?: number | null };

interface CheckLike {
  id: string;
  enabled?: boolean;
  available?: boolean;
  skip?: boolean;
  forecast_mm?: number | null;
}

interface PlanningLike {
  skipped_reason?: string | null;
  forecast?: { forecast_mm?: number | null } | null;
  forecast_known?: boolean;
}

interface ScheduleLike {
  enabled?: boolean;
  weather?: boolean;
  skip_conditions?: string[] | null;
}

/**
 * Whether the weather lets the program's next run go ahead, from what the
 * backend already says: the skip checks evaluated for the next start
 * (``skip_preview`` of the info websocket) and the program's next planned run,
 * whose rain forecast is read for its own start.
 *
 * Only the schedules that are on and take the weather into account count, and
 * only the conditions they apply (a list in YAML, ``skip_conditions``; none:
 * all of them). The postponement the user asked for always applies. The
 * planned run's forecast is preferred to the preview's when it was read: the
 * preview is for the soonest start of any program, which need not be this
 * one's. A suspension is not the weather, and is left to the program's state.
 */
export const weatherVerdict = (
  schedules: ScheduleLike[] = [],
  preview?: { checks?: CheckLike[] | null } | null,
  next?: PlanningLike | null,
): WeatherVerdict => {
  const asking = (schedules || []).filter(
    (s) => s.enabled !== false && s.weather !== false,
  );
  if (!asking.length) return { state: "off" };
  // null: every condition applies.
  let conditions: Set<string> | null = new Set(["postponed"]);
  for (const s of asking) {
    if (!Array.isArray(s.skip_conditions)) {
      conditions = null;
      break;
    }
    for (const id of s.skip_conditions) conditions.add(id);
  }
  const applies = (id: string) => conditions === null || conditions.has(id);
  const planned = !!next?.forecast_known;
  if (next?.skipped_reason === "precipitation" && applies("precipitation")) {
    return {
      state: "no",
      reason: "precipitation",
      mm: next.forecast?.forecast_mm ?? null,
    };
  }
  const checks = preview?.checks;
  if (!Array.isArray(checks)) {
    return planned ? { state: "yes" } : { state: "unknown" };
  }
  const holding = checks.find(
    (c) =>
      applies(c.id) &&
      c.enabled !== false &&
      c.available !== false &&
      c.skip === true &&
      // The planned run read the forecast for its own start, and it said go.
      !(c.id === "precipitation" && planned),
  );
  if (holding) {
    return holding.id === "precipitation"
      ? { state: "no", reason: holding.id, mm: holding.forecast_mm ?? null }
      : { state: "no", reason: holding.id };
  }
  // A check that could not be read holds nothing back, but a plain "Yes" hid
  // it: without a weather service, "Rain forecast" never reads, and the flow
  // said Yes in green as if the forecast had been checked.
  const unread = checks.find(
    (c) =>
      applies(c.id) &&
      c.enabled !== false &&
      c.available === false &&
      !(c.id === "precipitation" && planned),
  );
  return unread ? { state: "yes", unread: unread.id } : { state: "yes" };
};
