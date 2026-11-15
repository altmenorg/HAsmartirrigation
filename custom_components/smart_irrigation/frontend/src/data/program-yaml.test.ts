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
  enabled: true,
  main: false,
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
    const off: any = programToYaml(
      { ...program, enabled: false, delay: 60, tours: 2 },
      zones,
    );
    expect([off.enabled, off.delay, off.tours]).toEqual([false, 60, 2]);
  });
});

describe("programFromYaml", () => {
  it("keeps the program it replaces, renamed or not", () => {
    expect(
      programFromYaml({ id: "other", name: "Renamed", main: true }, program),
    ).toEqual({ id: "evening", name: "Renamed" });
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
