import { describe, expect, it } from "vitest";
import { programFromYaml, programToYaml } from "./program-yaml";

const zones: any[] = [
  { id: 1, name: "Lawn" },
  { id: 2, name: "Hedges" },
  { id: 3, name: "Pots" },
  { id: 4, name: "pots" },
  { id: 5, name: "12" },
];

const program: any = {
  id: "evening",
  name: "Evening",
  delay: 0,
  tours: 1,
  steps: [
    {
      id: "step_1",
      zones: [1, 2],
      mode: "calculated",
      percent: 100,
      seconds: 0,
      passes: 1,
      max_litres: 0,
      min_seconds: 0,
      max_seconds: 0,
      adjust_seconds: 0,
      delay: null,
      enabled: true,
    },
    {
      id: "step_2",
      zones: [3, 5, 9],
      mode: "fixed",
      percent: 100,
      seconds: 120,
      passes: 2,
      max_litres: 0,
      min_seconds: 0,
      max_seconds: 0,
      adjust_seconds: 0,
      delay: -30,
      enabled: false,
    },
  ],
  schedules: [
    {
      id: "schedule_1",
      enabled: true,
      type: "time",
      time: "06:00",
      event: "sunrise",
      offset_minutes: 0,
      anchor: "end",
      weekdays: [0, 2, 4],
      every_n_days: 1,
      every_offset: 0,
      parity: "any",
      months: [],
      from_date: null,
      until_date: null,
      weather: true,
    },
    {
      id: "schedule_2",
      enabled: true,
      type: "sun",
      time: "06:00",
      event: "sunset",
      offset_minutes: -30,
      anchor: "start",
      weekdays: [],
      every_n_days: 2,
      every_offset: 0,
      parity: "any",
      months: [6, 7],
      from_date: null,
      until_date: null,
      weather: false,
    },
  ],
};

describe("programToYaml", () => {
  const yaml: any = programToYaml(program, zones);

  it("leaves out what is at its default", () => {
    expect(yaml).toEqual({
      id: "evening",
      name: "Evening",
      steps: [
        { id: "step_1", zones: ["Lawn", "Hedges"] },
        {
          id: "step_2",
          zones: [3, 5, 9],
          mode: "fixed",
          seconds: 120,
          passes: 2,
          delay: -30,
          enabled: false,
        },
      ],
      schedules: [
        { id: "schedule_1", time: "06:00", anchor: "end", weekdays: [0, 2, 4] },
        {
          id: "schedule_2",
          type: "sun",
          event: "sunset",
          offset_minutes: -30,
          every_n_days: 2,
          months: [6, 7],
          weather: false,
        },
      ],
    });
  });

  it("numbers a zone whose name is shared, a number or gone", () => {
    expect(yaml.steps[1].zones).toEqual([3, 5, 9]);
  });

  it("says what is not the default on the program", () => {
    const off: any = programToYaml({ ...program, delay: 60, tours: 2 }, zones);
    expect([off.delay, off.tours]).toEqual([60, 2]);
    // There is no "Program on" any more: a program is off by its schedules.
    expect("enabled" in off).toBe(false);
  });
});

describe("programFromYaml", () => {
  it("keeps the program it replaces, renamed or not", () => {
    expect(programFromYaml({ id: "other", name: "Renamed" }, program)).toEqual({
      id: "evening",
      name: "Renamed",
    });
  });

  it("takes a new program as written", () => {
    expect(programFromYaml({ name: "New" })).toEqual({ name: "New" });
  });

  it("refuses what is not a program", () => {
    expect(programFromYaml(null)).toBeNull();
    expect(programFromYaml([1, 2])).toBeNull();
    expect(programFromYaml("text")).toBeNull();
  });
});

describe("notifications in YAML", () => {
  it("are written when the program names someone, and left out otherwise", () => {
    const notify = {
      targets: ["notify.mobile_app_pixel"],
      when: "problems" as const,
      start: false,
    };
    expect(programToYaml({ ...program, notify }, zones).notify).toEqual(notify);
    expect(programToYaml(program, zones).notify).toBeUndefined();
  });
});

describe("the program that was the main one, in YAML", () => {
  it("is written as any other: id, name, steps", () => {
    const converted = {
      id: "main",
      name: "Watering",
      steps: [{ id: "zone_1", zones: [1], delay: 30 }],
      schedules: [],
    };
    const yaml: any = programToYaml(converted as any, zones);
    expect(yaml.id).toBe("main");
    expect(yaml.steps).toEqual([{ id: "zone_1", zones: ["Lawn"], delay: 30 }]);
    expect(Object.keys(yaml)).not.toContain("sequencing");
    expect(programFromYaml({ name: "Morning" }, converted as any)).toEqual({
      id: "main",
      name: "Morning",
    });
  });
});

describe("a schedule that starts after another program, in YAML", () => {
  const chained: any = {
    ...program,
    id: "pots",
    name: "Pots",
    schedules: [
      {
        ...program.schedules[0],
        id: "schedule_1",
        type: "after",
        after_program: "evening",
        offset_minutes: 15,
        anchor: "start",
        hard_deadline: false,
        weekdays: [],
      },
    ],
  };

  it("names the program it follows, after its type, without a moment", () => {
    const yaml: any = programToYaml(chained, zones, [program, chained]);
    expect(yaml.schedules).toEqual([
      {
        id: "schedule_1",
        type: "after",
        after_program: "Evening",
        offset_minutes: 15,
      },
    ]);
    expect(Object.keys(yaml.schedules[0])).toEqual([
      "id",
      "type",
      "after_program",
      "offset_minutes",
    ]);
  });

  it("writes the id when the name is shared, or the program is gone", () => {
    const twin = { ...program, id: "evening_2" };
    expect(
      (programToYaml(chained, zones, [program, twin, chained]) as any)
        .schedules[0].after_program,
    ).toBe("evening");
    const gone = {
      ...chained,
      schedules: [{ ...chained.schedules[0], after_program: "gone" }],
    };
    expect(
      (programToYaml(gone, zones, [gone]) as any).schedules[0].after_program,
    ).toBe("gone");
  });

  it("is not written on a schedule of another type", () => {
    const timed = {
      ...program,
      schedules: [{ ...program.schedules[0], after_program: "evening" }],
    };
    expect(
      "after_program" in
        (programToYaml(timed, zones, [program]) as any).schedules[0],
    ).toBe(false);
  });
});
