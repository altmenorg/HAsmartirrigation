import { describe, expect, it } from "vitest";
import {
  afterIsMissing,
  afterProgramOf,
  dependentsOf,
  waitsFor,
  wouldLoop,
} from "./program-chain";

const after = (id: string) => ({ type: "after", after_program: id }) as any;
const timed = { type: "time", time: "06:00" } as any;

const programs: any[] = [
  { id: "a", name: "A", schedules: [timed] },
  { id: "b", name: "B", schedules: [after("a")] },
  {
    id: "c",
    name: "C",
    schedules: [after("b"), { ...after("a"), enabled: false }],
  },
  { id: "d", name: "D", schedules: [] },
];

describe("program chains", () => {
  it("reads the program an after schedule waits for", () => {
    expect(afterProgramOf(after("a"))).toBe("a");
    expect(afterProgramOf(timed)).toBeNull();
    expect(
      afterProgramOf({ type: "after", after_program: null } as any),
    ).toBeNull();
  });

  it("follows a chain of chains", () => {
    expect([...waitsFor(programs, "c")].sort()).toEqual(["a", "b"]);
    expect([...waitsFor(programs, "a")]).toEqual([]);
  });

  it("does not offer what would close a loop", () => {
    expect(wouldLoop(programs, "a", "a")).toBe(true);
    // A after C, and C already waits for A through B.
    expect(wouldLoop(programs, "a", "c")).toBe(true);
    expect(wouldLoop(programs, "a", "b")).toBe(true);
    expect(wouldLoop(programs, "d", "c")).toBe(false);
    expect(wouldLoop(programs, "c", "a")).toBe(false);
  });

  it("names the programs that start after one, switched off or not", () => {
    expect(dependentsOf(programs, "a").map((p) => p.id)).toEqual(["b", "c"]);
    expect(dependentsOf(programs, "d")).toEqual([]);
    expect(dependentsOf(programs, undefined)).toEqual([]);
  });

  it("says when the program waited for is not there", () => {
    expect(afterIsMissing(programs, after("a"))).toBe(false);
    expect(afterIsMissing(programs, after("gone"))).toBe(true);
    expect(
      afterIsMissing(programs, { type: "after", after_program: null }),
    ).toBe(true);
    expect(afterIsMissing(programs, timed)).toBe(false);
  });
});
