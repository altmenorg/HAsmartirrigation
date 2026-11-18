import { describe, expect, it } from "vitest";

import { todayRuns, weekLayout, weekPercent, weekTicks, WeekRun } from "./week";

const at = (day: number, hour: number, minute = 0) =>
  new Date(2026, 10, day, hour, minute);

const run = (
  start: Date,
  minutes: number,
  extra: Partial<WeekRun> = {},
): WeekRun => ({
  program_id: "morning",
  program: "Morning",
  start: start.toISOString(),
  end: new Date(start.getTime() + minutes * 60000).toISOString(),
  ...extra,
});

describe("weekLayout", () => {
  it("puts each run on its day, from midnight", () => {
    const layout = weekLayout(
      [run(at(16, 6, 30), 20), run(at(18, 6, 30), 20)],
      7,
      at(16, 1),
    );
    expect(layout.days).toHaveLength(7);
    expect(layout.days[0].blocks).toHaveLength(1);
    expect(layout.days[1].blocks).toHaveLength(0);
    expect(layout.days[2].blocks[0].from).toBe(6.5 * 3600);
    expect(layout.days[2].blocks[0].to).toBe(6.5 * 3600 + 1200);
  });

  it("zooms on the hours the runs use, an hour either side", () => {
    const layout = weekLayout(
      [run(at(16, 6, 30), 20), run(at(17, 21, 0), 30)],
      3,
      at(16, 1),
    );
    expect(layout.from).toBe(5 * 3600);
    expect(layout.to).toBe(23 * 3600);
  });

  it("is at least four hours wide", () => {
    const layout = weekLayout([run(at(16, 6, 0), 10)], 3, at(16, 1));
    expect(layout.to - layout.from).toBe(4 * 3600);
    expect(layout.from).toBeLessThanOrEqual(6 * 3600);
    expect(layout.to).toBeGreaterThanOrEqual(6 * 3600 + 600);
  });

  it("shows a run over midnight on both days", () => {
    const layout = weekLayout([run(at(16, 23, 30), 60)], 3, at(16, 1));
    const [first, second] = layout.days;
    expect(first.blocks[0].cutAfter).toBe(true);
    expect(first.blocks[0].to).toBe(86400);
    expect(second.blocks[0].cutBefore).toBe(true);
    expect(second.blocks[0].from).toBe(0);
    expect(second.blocks[0].to).toBe(1800);
  });

  it("places a run that waits where it will really go", () => {
    const layout = weekLayout(
      [
        run(at(16, 6, 0), 20, {
          expected_start: at(16, 6, 40).toISOString(),
          expected_end: at(16, 7, 0).toISOString(),
        }),
      ],
      1,
      at(16, 1),
    );
    expect(layout.days[0].blocks[0].from).toBe(6 * 3600 + 2400);
  });

  it("marks what the weather may hold back, and keeps the soaks", () => {
    const layout = weekLayout(
      [
        run(at(16, 6, 0), 30, {
          skipped_reason: "precipitation",
          timeline: {
            total: 1800,
            segments: [
              { kind: "water", start: 0, end: 600 },
              { kind: "soak", start: 600, end: 1200 },
              { kind: "water", start: 1200, end: 1800 },
            ],
          },
        }),
      ],
      1,
      at(16, 1),
    );
    const [block] = layout.days[0].blocks;
    expect(block.held).toBe(true);
    expect(block.soaks).toEqual([
      { from: 6 * 3600 + 600, to: 6 * 3600 + 1200 },
    ]);
  });

  it("draws the whole day when nothing is planned", () => {
    const layout = weekLayout([], 7, at(16, 1));
    expect([layout.from, layout.to]).toEqual([0, 86400]);
  });
});

describe("the axis", () => {
  it("places and marks the hours", () => {
    const layout = { from: 4 * 3600, to: 8 * 3600 };
    expect(weekPercent(6 * 3600, layout)).toBe(50);
    expect(weekPercent(0, layout)).toBe(0);
    expect(weekTicks(layout)).toEqual([4, 5, 6, 7, 8].map((h) => h * 3600));
    expect(weekTicks({ from: 0, to: 86400 })).toEqual(
      [0, 6, 12, 18, 24].map((h) => h * 3600),
    );
  });
});

describe("todayRuns", () => {
  // 10:00 local time; the morning's runs are before it.
  const now = new Date(2026, 10, 17, 10, 0);
  const at = (h: number, m = 0) => new Date(2026, 10, 17, h, m).toISOString();
  const programs = [
    { program_id: "p1", name: "Lawn", state: "idle" },
    { program_id: "p2", name: "Beds", state: "idle" },
  ];

  it("makes one run of a program's zones that followed each other", () => {
    const runs = todayRuns(
      [
        { start: at(6), zone_name: "A", duration: 600, program_id: "p1" },
        // After a 20 min soak: the same run.
        { start: at(6, 30), zone_name: "B", duration: 600, program_id: "p1" },
      ],
      programs,
      now,
    );
    expect(runs).toHaveLength(1);
    expect(runs[0].start).toBe(at(6));
    expect(runs[0].end).toBe(at(6, 40));
    expect(runs[0].done).toBe(true);
    expect((runs[0].steps as any)[0].zones).toHaveLength(2);
  });

  it("keeps two runs of a day apart, and leaves out yesterday and the hand", () => {
    const runs = todayRuns(
      [
        { start: at(5), duration: 300, program_id: "p1" },
        { start: at(9), duration: 300, program_id: "p1" },
        {
          start: new Date(2026, 10, 16, 20, 0).toISOString(),
          duration: 300,
          program_id: "p2",
        },
        { start: at(7), duration: 300, program_id: "manual" },
        { start: at(7), duration: 300, program_id: null },
      ],
      programs,
      now,
    );
    expect(runs.map((r) => r.start)).toEqual([at(5), at(9)]);
  });

  it("shows a run going on until its remaining time ends", () => {
    const runs = todayRuns(
      [{ start: at(9, 30), zone_name: "A", duration: 600, program_id: "p2" }],
      [
        programs[0],
        {
          program_id: "p2",
          name: "Beds",
          state: "running",
          last_run: at(9, 30),
          live: { remaining_seconds: 1200 },
        },
      ],
      now,
    );
    expect(runs).toHaveLength(1);
    expect(runs[0].program).toBe("Beds");
    expect(runs[0].running).toBe(true);
    expect(runs[0].done).toBe(false);
    expect(runs[0].end).toBe(at(10, 20));
  });

  it("lays out in today's row", () => {
    const runs = todayRuns(
      [{ start: at(6), duration: 600, program_id: "p1" }],
      programs,
      now,
    );
    const layout = weekLayout(runs, 3, now);
    expect(layout.days[0].blocks).toHaveLength(1);
    expect(layout.days[1].blocks).toHaveLength(0);
  });
});
