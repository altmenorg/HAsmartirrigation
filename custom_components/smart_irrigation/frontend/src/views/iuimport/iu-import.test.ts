import { describe, expect, it } from "vitest";
import {
  automaticMatch,
  baselineOf,
  nameConflicts,
  zoneConflicts,
  describeSchedule,
  describeStep,
  reportGroups,
  shortDuration,
  summary,
  weekdayNames,
  withMatch,
} from "./iu-import";

// Words as keys, with their arguments, so a test sees what was asked for.
const t = (key: string, ...args: any[]) =>
  args.length ? `${key}(${args.filter((_, i) => i % 2).join(",")})` : key;

describe("shortDuration", () => {
  it("says seconds, minutes and hours as few as needed", () => {
    expect(shortDuration(45)).toBe("45 s");
    expect(shortDuration(600)).toBe("10 min");
    expect(shortDuration(3900)).toBe("1 h 5 min");
    expect(shortDuration(3605)).toBe("1 h 5 s");
    expect(shortDuration(undefined)).toBe("0 s");
  });
});

describe("describeSchedule", () => {
  it("says the time and the weekdays, Monday first", () => {
    expect(weekdayNames("en")[0]).toBe("Mon");
    expect(
      describeSchedule(
        { type: "time", time: "05:30", weekdays: [0, 2, 4] },
        "en",
        t,
      ),
    ).toBe("05:30 · Mon, Wed, Fri");
  });

  it("says the sun's moment with its offset", () => {
    expect(
      describeSchedule(
        { type: "sun", event: "sunset", offset_minutes: 30 },
        "en",
        t,
      ),
    ).toBe("schedule.sunset +30 min");
    expect(
      describeSchedule(
        { type: "sun", event: "sunrise", offset_minutes: -20 },
        "en",
        t,
      ),
    ).toBe("schedule.sunrise −20 min");
  });

  it("says only what narrows the days", () => {
    expect(
      describeSchedule(
        {
          type: "time",
          time: "06:00",
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          months: [],
          every_n_days: 1,
        },
        "en",
        t,
      ),
    ).toBe("06:00");
    expect(
      describeSchedule(
        {
          type: "time",
          time: "06:00",
          anchor: "end",
          every_n_days: 3,
          parity: "odd",
          days_of_month: [1, "last"],
          months: [5, 6],
          from_date: "05-01",
          enabled: false,
        },
        "en",
        t,
      ),
    ).toBe(
      "schedule.done-by(06:00) · schedule.every(3) · schedule.odd · " +
        "schedule.days-of-month(1, schedule.last) · May, Jun · 05-01 – 12-31 · " +
        "schedule.off-in-iu",
    );
  });
});

describe("describeStep", () => {
  it("says the zones and how long, or calculated", () => {
    expect(
      describeStep(
        ["Lawn", "Beds"],
        { zones: [], mode: "fixed", seconds: 600 },
        t,
      ),
    ).toBe("Lawn + Beds: 10 min");
    expect(
      describeStep(["Lawn"], { zones: [], mode: "calculated", passes: 2 }, t),
    ).toBe("Lawn: programs.calculated · programs.passes(2)");
    expect(
      describeStep(
        ["Lawn"],
        { zones: [], mode: "fixed", seconds: 60, enabled: false },
        t,
      ),
    ).toBe("Lawn: 1 min · programs.step-off");
  });
});

describe("reportGroups", () => {
  it("puts what is lost first and leaves out empty groups", () => {
    const item = (outcome: any) => ({
      path: "",
      outcome,
      note: "",
      subject: "",
    });
    const groups = reportGroups([
      item("approximated"),
      item("not_carried"),
      item("approximated"),
    ]);
    expect(groups.map((g) => [g.outcome, g.items.length])).toEqual([
      ["not_carried", 1],
      ["approximated", 2],
    ]);
  });
});

describe("withMatch", () => {
  it("keeps a choice only where it differs from what the import picks", () => {
    expect(withMatch({}, "c1_z1", 3, 3)).toEqual({});
    expect(withMatch({}, "c1_z1", "new", 3)).toEqual({ c1_z1: "new" });
    expect(withMatch({ c1_z1: "new" }, "c1_z1", 3, 3)).toEqual({});
    expect(withMatch({ c1_z2: 0 }, "c1_z1", 0, "new")).toEqual({
      c1_z2: 0,
      c1_z1: 0,
    });
  });

  it("takes the zone the import picks, or new", () => {
    const zone = (zone_id: number | null) =>
      ({
        key: "k",
        name: "n",
        action: "use",
        zone_id,
        reason: null,
        fields: {},
      }) as any;
    expect(automaticMatch(zone(0))).toBe(0);
    expect(automaticMatch(zone(null))).toBe("new");
  });
});

describe("summary", () => {
  it("counts what the import creates, fills in and removes", () => {
    const preview: any = {
      zones: [{ action: "create" }, { action: "update" }, { action: "use" }],
      programs: [{ action: "create" }, { action: "update" }],
      supplies: [{ action: "create" }],
      removed: { programs: ["a", "b"], supplies: [] },
    };
    expect(summary(preview)).toEqual({
      zonesCreated: 1,
      zonesFilled: 1,
      zonesUsed: 1,
      programsCreated: 1,
      programsUpdated: 1,
      programsRemoved: 2,
      suppliesCreated: 1,
      suppliesUpdated: 0,
      suppliesRemoved: 0,
    });
  });
});

describe("choices against the import's own picks", () => {
  const preview = (zones: [string, number | null][], conflicts: any[] = []) =>
    ({
      zones: zones.map(([key, zone_id]) => ({
        key,
        name: key,
        action: zone_id === null ? "create" : "use",
        zone_id,
        reason: null,
        fields: {},
      })),
      conflicts,
    }) as any;

  it("learns the picks from a preview without choices", () => {
    expect(
      baselineOf(
        preview([
          ["front", 0],
          ["back", null],
        ]),
      ),
    ).toEqual({
      front: 0,
      back: "new",
    });
  });

  it("keeps a choice the user made even where a later preview moved the zone", () => {
    // Front matches Lawn (0) by valve, Back would be new.
    const baseline = baselineOf(
      preview([
        ["front", 0],
        ["back", null],
      ]),
    );
    let choices: Record<string, number | "new"> = {};
    choices = withMatch(choices, "back", 0, baseline.back);
    // The preview now moves Front to a new zone; the user confirms "new".
    choices = withMatch(choices, "front", "new", baseline.front);
    expect(choices).toEqual({ back: 0, front: "new" });
    // Back goes back to new: Front stays what the user chose.
    choices = withMatch(choices, "back", "new", baseline.back);
    expect(choices).toEqual({ front: "new" });
  });

  it("sorts the conflicts into the zones' and the names'", () => {
    const p = preview(
      [["front", 0]],
      [
        { code: "zone_twice", key: "back", other: "front", zone_id: 0 },
        { code: "program_exists", id: "iu_c1_1", name: "Mine" },
      ],
    );
    expect(Object.keys(zoneConflicts(p)).sort()).toEqual(["back", "front"]);
    expect(nameConflicts(p).map((c) => c.code)).toEqual(["program_exists"]);
    expect(zoneConflicts(undefined)).toEqual({});
  });
});
