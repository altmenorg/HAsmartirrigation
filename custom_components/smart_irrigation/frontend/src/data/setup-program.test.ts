import { describe, expect, it } from "vitest";
import { NEW_PROGRAM, placeNewZone } from "./setup-program";

let n = 0;
const id = () => String(++n);
const options = { newName: "Watering", passes: 2, id };

const program = (pid: string, steps: any[]) =>
  ({ id: pid, name: pid, steps, delay: 0, tours: 1, schedules: [] }) as any;

describe("placeNewZone", () => {
  it("makes a program done by sunrise every day when there is none", () => {
    const placed = placeNewZone([], 7, options);
    expect(placed.created).toBe(true);
    expect(placed.programs).toHaveLength(1);
    const made = placed.programs[0];
    expect(made.name).toBe("Watering");
    expect(made.steps?.map((s) => s.zones)).toEqual([[7]]);
    expect(made.steps?.[0].mode).toBe("calculated");
    expect(made.steps?.[0].passes).toBe(2);
    expect(made.schedules?.[0]).toMatchObject({
      enabled: true,
      type: "sun",
      event: "sunrise",
      offset_minutes: 0,
      anchor: "end",
      weekdays: [],
      weather: true,
    });
  });

  it("adds the zone as the last step of the only program", () => {
    const only = program("main", [{ id: "a", zones: [1], delay: null }]);
    const placed = placeNewZone([only], 7, options);
    expect(placed.created).toBe(false);
    expect(placed.program.id).toBe("main");
    expect(placed.programs[0].steps?.map((s) => s.zones)).toEqual([[1], [7]]);
  });

  it("keeps the wait between the zones of a program that has one", () => {
    const sequential = program("main", [
      { id: "a", zones: [1], delay: 30 },
      { id: "b", zones: [2], delay: null },
    ]);
    const steps = placeNewZone([sequential], 7, options).program.steps || [];
    expect(steps.map((s) => s.delay)).toEqual([30, 30, null]);
  });

  it("goes to the program chosen, or to a new one", () => {
    const programs = [program("a", []), program("b", [])];
    expect(
      placeNewZone(programs, 7, { ...options, target: "b" }).program.id,
    ).toBe("b");
    const fresh = placeNewZone(programs, 7, {
      ...options,
      target: NEW_PROGRAM,
    });
    expect(fresh.created).toBe(true);
    expect(fresh.programs).toHaveLength(3);
  });

  it("does not add a zone twice", () => {
    const has = program("a", [{ id: "a", zones: [7], delay: null }]);
    expect(placeNewZone([has], 7, options).program.steps).toHaveLength(1);
  });
});
