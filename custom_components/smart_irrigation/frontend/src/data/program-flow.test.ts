import { describe, expect, it } from "vitest";

import { programFlow } from "./program-flow";
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
});
