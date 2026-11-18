import { describe, expect, it } from "vitest";

import { programFlow, weatherVerdict } from "./program-flow";
import { Timeline } from "./timeline";

const seg = (
  zone_id: number,
  step: number,
  kind: "water" | "fill" | "soak",
  start: number,
  end: number,
  pass = 0,
  tour = 0,
) => ({ zone_id, step, kind, start, end, pass, tour });

const timeline = (segments: any[]): Timeline => ({
  total: Math.max(0, ...segments.map((s) => s.end)),
  zones: [
    { zone_id: 1, zone: "Potager" },
    { zone_id: 2, zone: "Serre" },
    { zone_id: 3, zone: "Haie" },
  ],
  segments,
});

describe("programFlow", () => {
  it("reads the steps in order, the valves of a step together", () => {
    const flow = programFlow(
      timeline([
        seg(1, 0, "water", 0, 600),
        seg(2, 0, "water", 0, 300),
        seg(3, 1, "water", 630, 1830),
      ]),
    );
    expect(flow.steps.map((s) => s.zones.map((z) => z.name))).toEqual([
      ["Potager", "Serre"],
      ["Haie"],
    ]);
    expect(flow.steps[0].zones[0].seconds).toBe(600);
    expect(flow.steps[0].waitAfter).toBe(30);
    expect(flow.steps[1].waitAfter).toBeNull();
    expect(flow.tours).toBe(1);
  });

  it("counts the passes, the soak between them, and an overlap", () => {
    const flow = programFlow(
      timeline([
        seg(1, 0, "water", 0, 300, 0),
        seg(1, 0, "soak", 300, 1200, 0),
        seg(1, 0, "water", 1200, 1500, 1),
        seg(3, 1, "water", 1440, 1800),
      ]),
    );
    const [first] = flow.steps;
    expect(first.zones[0]).toMatchObject({ seconds: 600, passes: 2 });
    expect(first.soakSeconds).toBe(900);
    expect(first.waitAfter).toBe(-60);
  });

  it("draws one round and says how many there are", () => {
    const flow = programFlow(
      timeline([
        seg(1, 0, "water", 0, 300, 0, 0),
        seg(1, 0, "water", 300, 600, 0, 1),
      ]),
    );
    expect(flow.tours).toBe(2);
    expect(flow.steps[0].zones[0].seconds).toBe(300);
  });

  it("names the pumps of the zones it waters, and only those", () => {
    const flow = programFlow(
      timeline([seg(1, 0, "water", 0, 300)]),
      [
        { id: 1, supply_id: "pump" },
        { id: 2, supply_id: "other" },
      ],
      [
        { id: "pump", name: "Pompe", delay_before: 5, delay_after: 10 },
        { id: "other", name: "Autre", delay_before: 0, delay_after: 0 },
      ],
    );
    expect(flow.supplies).toEqual([{ name: "Pompe", before: 5, after: 10 }]);
  });

  it("is empty when nothing would be watered", () => {
    expect(programFlow(null).steps).toEqual([]);
  });

  it("names the zones of the program that need no water now", () => {
    const flow = programFlow(
      timeline([seg(2, 0, "water", 0, 74)]),
      [],
      [],
      [
        { id: 1, name: "Potager" },
        { id: 2, name: "Serre" },
      ],
    );
    expect(flow.idle).toEqual([{ zoneId: 1, name: "Potager" }]);
  });
});

describe("weatherVerdict", () => {
  const check = (id: string, skip: boolean, extra: object = {}) => ({
    id,
    enabled: true,
    available: true,
    skip,
    ...extra,
  });
  const on = [{ enabled: true, weather: true }];

  it("is off when no schedule that is on takes the weather into account", () => {
    expect(weatherVerdict([], null, null)).toEqual({ state: "off" });
    expect(
      weatherVerdict(
        [{ weather: false }, { enabled: false, weather: true }],
        { checks: [check("wind", true)] },
        null,
      ),
    ).toEqual({ state: "off" });
  });

  it("is unknown with nothing from the backend", () => {
    expect(weatherVerdict(on, null, null)).toEqual({ state: "unknown" });
    expect(weatherVerdict(on, undefined, { forecast_known: false })).toEqual({
      state: "unknown",
    });
  });

  it("says yes when no check holds the run back", () => {
    expect(
      weatherVerdict(on, {
        checks: [check("freeze", false), check("precipitation", false)],
      }),
    ).toEqual({ state: "yes" });
    // A check turned off holds nothing back.
    expect(
      weatherVerdict(on, {
        checks: [check("wind", true, { enabled: false })],
      }),
    ).toEqual({ state: "yes" });
  });

  it("says yes, naming a check that could not be read", () => {
    // It holds nothing back, but a plain Yes hid it: no weather service.
    expect(
      weatherVerdict(on, {
        checks: [
          check("freeze", false),
          check("precipitation", false, { available: false }),
        ],
      }),
    ).toEqual({ state: "yes", unread: "precipitation" });
    // The planned run read the forecast for its own start: it was read.
    expect(
      weatherVerdict(
        on,
        { checks: [check("precipitation", false, { available: false })] },
        { forecast_known: true },
      ),
    ).toEqual({ state: "yes" });
    // A condition the schedule does not apply is not named.
    expect(
      weatherVerdict(
        [{ enabled: true, weather: true, skip_conditions: ["wind"] }],
        { checks: [check("precipitation", false, { available: false })] },
      ),
    ).toEqual({ state: "yes" });
  });

  it("says no with the first check that holds it back", () => {
    expect(
      weatherVerdict(on, {
        checks: [check("freeze", false), check("wind", true)],
      }),
    ).toEqual({ state: "no", reason: "wind" });
    expect(
      weatherVerdict(on, {
        checks: [check("precipitation", true, { forecast_mm: 6.2 })],
      }),
    ).toEqual({ state: "no", reason: "precipitation", mm: 6.2 });
  });

  it("takes the planned run's forecast over the preview's", () => {
    // The planned run read the forecast for its own start and it says go.
    expect(
      weatherVerdict(
        on,
        { checks: [check("precipitation", true, { forecast_mm: 9 })] },
        { forecast_known: true, skipped_reason: null },
      ),
    ).toEqual({ state: "yes" });
    expect(
      weatherVerdict(on, null, {
        forecast_known: true,
        skipped_reason: "precipitation",
        forecast: { forecast_mm: 4 },
      }),
    ).toEqual({ state: "no", reason: "precipitation", mm: 4 });
    // A suspension is not the weather.
    expect(
      weatherVerdict(on, null, {
        forecast_known: true,
        skipped_reason: "suspended",
      }),
    ).toEqual({ state: "yes" });
  });

  it("applies only the conditions the schedules chose", () => {
    const some = [{ weather: true, skip_conditions: ["freeze"] }];
    expect(
      weatherVerdict(some, {
        checks: [check("wind", true), check("freeze", false)],
      }),
    ).toEqual({ state: "yes" });
    // The postponement always applies.
    expect(
      weatherVerdict(some, { checks: [check("postponed", true)] }),
    ).toEqual({ state: "no", reason: "postponed" });
    // A schedule with every condition makes them all count.
    expect(
      weatherVerdict([...some, { weather: true }], {
        checks: [check("wind", true)],
      }),
    ).toEqual({ state: "no", reason: "wind" });
    // Left out by the schedules, the planned rain does not hold it back.
    expect(
      weatherVerdict(some, null, {
        forecast_known: true,
        skipped_reason: "precipitation",
      }),
    ).toEqual({ state: "yes" });
  });
});
