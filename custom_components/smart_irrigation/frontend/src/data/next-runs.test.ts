import { describe, expect, it } from "vitest";
import { nextRuns, PlannedRun } from "./next-runs";

const run = (program_id: string, start: string, expected?: string) =>
  ({
    program_id,
    program: program_id,
    start,
    expected_start: expected ?? start,
  }) as PlannedRun;

const NOW = Date.parse("2026-11-13T20:00:00Z");

describe("nextRuns", () => {
  it("lists the runs of the next morning in the order they water", () => {
    const runs = nextRuns(
      [
        run("main", "2026-11-14T06:18:00Z", "2026-11-14T06:22:00Z"),
        run("morgens", "2026-11-14T06:18:00Z"),
        run("abend", "2026-11-14T19:30:00Z"),
      ],
      NOW,
    );
    expect(runs.map((r) => r.program_id)).toEqual(["morgens", "main"]);
  });

  it("says nothing more when the main program is all that comes", () => {
    expect(nextRuns([run("main", "2026-11-14T06:18:00Z")], NOW)).toEqual([]);
  });

  it("leaves out what has begun and keeps at most five", () => {
    const planning = [run("gone", "2026-11-13T19:00:00Z")];
    for (let n = 0; n < 7; n++)
      planning.push(run(`p${n}`, `2026-11-14T0${n}:00:00Z`));
    const runs = nextRuns(planning, NOW);
    expect(runs.map((r) => r.program_id)).toEqual([
      "p0",
      "p1",
      "p2",
      "p3",
      "p4",
    ]);
  });
});
