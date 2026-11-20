import { describe, expect, it } from "vitest";
import {
  hiddenInAdvanced,
  hiddenLine,
  hiddenOptions,
  withProgram,
  withSchedule,
  withStep,
  zoneHiddenOptions,
} from "./yaml-only";

const texts: Record<string, string> = {
  tours: "Rounds",
  adjust_seconds: "Time added",
  min_deficit_mm: "Only water when the deficit is at least",
  min_deficit_short: "Minimum deficit",
  schedule_every_offset: "Shifted by",
  schedule_parity: "Days of the month",
  parity_even: "Even days",
  parity_odd: "Odd days",
  schedule_days_of_month: "Specific days",
  last_word: "last",
  schedule_months: "Months",
  schedule_fallback_time: "No sunrise",
  schedule_fallback_previous: "Last one seen",
  conditions_subset: "Only these checks",
  condition_postponed: "Postponed",
  condition_freeze: "Frost",
  condition_wind: "Wind",
  step: "Step",
  schedule: "Schedule",
};
const t = (key: string) => texts[key] ?? `?${key}`;
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const text = {
  t,
  monthName: (m: number) => MONTHS[m],
  days: (n: number) => `${n} ${n === 1 ? "day" : "days"}`,
};
const STD = "standard";
const ADV = "advanced";

const step = (extra: any = {}): any => ({
  id: "s",
  zones: [1],
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
  ...extra,
});
const schedule = (extra: any = {}): any => ({
  id: "sc",
  enabled: true,
  type: "time",
  time: "06:00",
  event: "sunrise",
  offset_minutes: 0,
  anchor: "start",
  weekdays: [],
  every_n_days: 1,
  every_offset: 0,
  parity: "any",
  months: [],
  from_date: null,
  until_date: null,
  weather: true,
  ...extra,
});
const program = (extra: any = {}): any => ({
  id: "p",
  name: "Morning",
  delay: 0,
  tours: 1,
  steps: [step()],
  schedules: [schedule()],
  ...extra,
});

describe("hiddenOptions, standard mode", () => {
  it("says nothing when every option is at its default", () => {
    expect(hiddenOptions(program(), STD, text)).toEqual([]);
    // Absent keys are defaults too, and no mode is the standard one.
    expect(
      hiddenOptions(
        { name: "Bare", steps: [{ zones: [] } as any], schedules: [{} as any] },
        undefined,
        text,
      ),
    ).toEqual([]);
  });

  it("lists the program's rounds", () => {
    expect(hiddenOptions(program({ tours: 2 }), STD, text)).toEqual([
      { owner: "", items: ["Rounds: 2"], advanced: true },
    ]);
  });

  it("lists a step's options, named by its place", () => {
    const groups = hiddenOptions(
      program({
        steps: [
          step(),
          step({ adjust_seconds: 30, min_deficit_mm: 4 }),
          step({ adjust_seconds: -15 }),
        ],
      }),
      STD,
      text,
    );
    expect(groups).toEqual([
      {
        owner: "Step 2",
        items: ["Time added: +30 s", "Minimum deficit: 4 mm"],
        advanced: true,
      },
      { owner: "Step 3", items: ["Time added: -15 s"], advanced: true },
    ]);
  });

  it("writes the minimum deficit as the number setting does", () => {
    const groups = hiddenOptions(
      program({ steps: [step({ min_deficit_mm: 1.5 })] }),
      STD,
      { ...text, num: (v: number) => String(v).replace(".", ",") },
    );
    expect(groups[0].items).toEqual(["Minimum deficit: 1,5 mm"]);
  });

  it("lists each of a schedule's options, named by its place", () => {
    const groups = hiddenOptions(
      program({
        schedules: [
          schedule(),
          schedule({
            every_n_days: 3,
            every_offset: 2,
            parity: "odd",
            days_of_month: [1, 15, "last"],
            months: [5, 6, 7, 8, 9, 11],
            type: "sun",
            fallback_time: "previous",
            skip_conditions: ["wind", "freeze"],
          }),
        ],
      }),
      STD,
      text,
    );
    expect(groups).toEqual([
      {
        owner: "Schedule 2",
        items: [
          "Shifted by: 2 days",
          "Days of the month: Odd days",
          "Specific days: 1, 15, last",
          "Months: May–Sep, Nov",
          "No sunrise: Last one seen",
          "Only these checks: Postponed, Frost, Wind",
        ],
        advanced: true,
      },
    ]);
  });

  it("counts one day in the singular", () => {
    const [group] = hiddenOptions(
      program({ schedules: [schedule({ every_n_days: 2, every_offset: 1 })] }),
      STD,
      text,
    );
    expect(group.items).toEqual(["Shifted by: 1 day"]);
  });

  it("gives a fixed fallback time as it is, even days as such", () => {
    const [group] = hiddenOptions(
      program({
        schedules: [schedule({ fallback_time: "05:30", parity: "even" })],
      }),
      STD,
      text,
    );
    expect(group.items).toEqual([
      "Days of the month: Even days",
      "No sunrise: 05:30",
    ]);
  });

  it("lists an empty list of checks: only the postponed days apply", () => {
    const [group] = hiddenOptions(
      program({ schedules: [schedule({ skip_conditions: [] })] }),
      STD,
      text,
    );
    expect(group.items).toEqual(["Only these checks: Postponed"]);
  });

  it("puts the program first, then the steps, then the schedules", () => {
    const groups = hiddenOptions(
      program({
        tours: 3,
        steps: [step({ min_deficit_mm: 2 })],
        schedules: [schedule({ months: [1] })],
      }),
      STD,
      text,
    );
    expect(groups.map(hiddenLine)).toEqual([
      "Rounds: 3",
      "Step 1 · Minimum deficit: 2 mm",
      "Schedule 1 · Months: Jan",
    ]);
    expect(hiddenInAdvanced(groups)).toBe(true);
  });

  it("is about YAML alone when only a YAML-only option is set", () => {
    const groups = hiddenOptions(
      program({ schedules: [schedule({ fallback_time: "previous" })] }),
      STD,
      text,
    );
    expect(groups).toEqual([
      {
        owner: "Schedule 1",
        items: ["No sunrise: Last one seen"],
        advanced: false,
      },
    ]);
    expect(hiddenInAdvanced(groups)).toBe(false);
  });
});

describe("hiddenOptions, advanced mode", () => {
  const full = program({
    tours: 2,
    steps: [step({ adjust_seconds: 30, min_deficit_mm: 4 })],
    schedules: [
      schedule({
        every_n_days: 2,
        every_offset: 1,
        parity: "even",
        days_of_month: ["last"],
        months: [6],
        skip_conditions: ["wind"],
      }),
    ],
  });

  it("lists nothing the advanced form shows as a field", () => {
    expect(hiddenOptions(full, ADV, text)).toEqual([]);
  });

  it("lists the YAML-only options only", () => {
    const groups = hiddenOptions(
      withProgram(
        full,
        withSchedule(full, 0, { type: "sun", fallback_time: "05:30" }),
      ),
      ADV,
      text,
    );
    expect(groups).toEqual([
      { owner: "Schedule 1", items: ["No sunrise: 05:30"], advanced: false },
    ]);
    expect(hiddenInAdvanced(groups)).toBe(false);
  });
});

describe("the form's patches keep the options it does not show", () => {
  const full = program({
    tours: 2,
    steps: [step({ adjust_seconds: 30, min_deficit_mm: 4 })],
    schedules: [
      schedule({
        every_offset: 1,
        parity: "even",
        days_of_month: ["last"],
        months: [6],
        fallback_time: "previous",
        skip_conditions: ["wind"],
      }),
    ],
  });

  it("a program patch of its name", () => {
    const after = withProgram(full, { name: "Evening" });
    expect(after.name).toBe("Evening");
    expect(after.tours).toBe(2);
    expect(after.steps).toBe(full.steps);
    expect(after.schedules).toBe(full.schedules);
  });

  it("a step patch of its zones", () => {
    const after = withProgram(full, withStep(full, 0, { zones: [2] }));
    expect(after.steps![0]).toMatchObject({
      zones: [2],
      adjust_seconds: 30,
      min_deficit_mm: 4,
    });
    expect(after.tours).toBe(2);
  });

  it("a schedule patch of its time", () => {
    const after = withProgram(full, withSchedule(full, 0, { time: "07:00" }));
    expect(after.schedules![0]).toMatchObject({
      time: "07:00",
      every_offset: 1,
      parity: "even",
      days_of_month: ["last"],
      months: [6],
      fallback_time: "previous",
      skip_conditions: ["wind"],
    });
    expect(hiddenOptions(after, STD, text)).toEqual(
      hiddenOptions(full, STD, text),
    );
  });
});

describe("zoneHiddenOptions", () => {
  const labels: Record<string, string> = {
    "safety-off-state-key": "Safety off state key",
    "open-resends": "Send the open again",
  };
  const zt = (key: string) => labels[key] ?? `?${key}`;
  const zone = (extra: any = {}): any => ({ id: 1, name: "Lawn", ...extra });

  it("lists nothing for a zone at its defaults", () => {
    expect(zoneHiddenOptions(zone(), STD, zt)).toBeNull();
    expect(
      zoneHiddenOptions(
        zone({ safety_off_state_key: " ", open_resends: null }),
        STD,
        zt,
      ),
    ).toBeNull();
  });

  it("lists the state key and the resends, 0 included, in standard mode", () => {
    expect(
      zoneHiddenOptions(
        zone({ safety_off_state_key: "state_l2", open_resends: 0 }),
        STD,
        zt,
      ),
    ).toEqual({
      owner: "",
      items: ["Safety off state key: state_l2", "Send the open again: 0"],
      advanced: true,
    });
  });

  it("lists the state key alone in advanced mode", () => {
    expect(
      zoneHiddenOptions(
        zone({ safety_off_state_key: "state_l2", open_resends: 0 }),
        ADV,
        zt,
      ),
    ).toEqual({
      owner: "",
      items: ["Safety off state key: state_l2"],
      advanced: false,
    });
    expect(zoneHiddenOptions(zone({ open_resends: 2 }), ADV, zt)).toBeNull();
  });
});
