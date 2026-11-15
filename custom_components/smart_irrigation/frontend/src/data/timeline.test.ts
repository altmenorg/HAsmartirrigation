import { describe, expect, it } from "vitest";
import {
  Timeline,
  offsetLabel,
  timelinePercent,
  timelineRows,
  timelineTicks,
  wateredSeconds,
} from "./timeline";

const timeline: Timeline = {
  total: 900,
  zones: [
    { zone_id: 2, zone: "Hedges" },
    { zone_id: 1, zone: null },
  ],
  segments: [
    { zone_id: 2, tour: 0, step: 0, pass: 0, kind: "fill", start: 0, end: 30 },
    {
      zone_id: 2,
      tour: 0,
      step: 0,
      pass: 0,
      kind: "water",
      start: 30,
      end: 230,
    },
    {
      zone_id: 2,
      tour: 0,
      step: 0,
      pass: 0,
      kind: "soak",
      start: 230,
      end: 530,
    },
    {
      zone_id: 1,
      tour: 0,
      step: 1,
      pass: 0,
      kind: "water",
      start: 600,
      end: 900,
    },
    {
      zone_id: 2,
      tour: 0,
      step: 0,
      pass: 1,
      kind: "water",
      start: 530,
      end: 730,
    },
  ],
};

describe("timelineRows", () => {
  it("makes one row per zone, in the order they first water", () => {
    const rows = timelineRows(timeline);
    expect(rows.map((r) => r.zoneId)).toEqual([2, 1]);
    expect(rows[0].segments).toHaveLength(4);
  });

  it("names a zone the backend could not name", () => {
    expect(timelineRows(timeline, (id) => `Zone ${id}`)[1].name).toBe("Zone 1");
  });

  it("draws nothing for nothing", () => {
    expect(timelineRows(null)).toEqual([]);
    expect(timelineRows({ total: 0, zones: [], segments: [] })).toEqual([]);
  });
});

describe("timelineTicks", () => {
  it("marks round steps from the start", () => {
    expect(timelineTicks(900)).toEqual([0, 300, 600, 900]);
    expect(timelineTicks(3 * 3600)).toEqual([
      0, 1800, 3600, 5400, 7200, 9000, 10800,
    ]);
  });

  it("never marks more than asked", () => {
    for (const total of [45, 61, 1000, 5000, 20000, 100000]) {
      expect(timelineTicks(total).length).toBeLessThanOrEqual(7);
    }
  });

  it("marks the start of an empty run", () => {
    expect(timelineTicks(0)).toEqual([0]);
  });
});

describe("the rest", () => {
  it("places a moment on the track", () => {
    expect(timelinePercent(450, 900)).toBe(50);
    expect(timelinePercent(1200, 900)).toBe(100);
    expect(timelinePercent(10, 0)).toBe(0);
  });

  it("adds up the water alone", () => {
    expect(wateredSeconds(timelineRows(timeline)[0])).toBe(400);
  });

  it("reads an offset", () => {
    expect(offsetLabel(0)).toBe("0");
    expect(offsetLabel(45)).toBe("+45 s");
    expect(offsetLabel(300)).toBe("+5 min");
    expect(offsetLabel(5400)).toBe("+1 h 30");
    expect(offsetLabel(7200)).toBe("+2 h");
  });
});
