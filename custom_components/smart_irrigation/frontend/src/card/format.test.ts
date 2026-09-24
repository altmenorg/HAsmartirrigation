import { describe, expect, it } from "vitest";

import {
  deficitOf,
  depthLabel,
  durationLabel,
  momentLabel,
  zoneActionEntity,
  zoneNow,
} from "./format";

const WORDS = { tomorrow: "tomorrow", yesterday: "yesterday" };

describe("zoneNow", () => {
  const zone = { bucket: -1.2, duration: 300 };

  it("prefers the live estimate over last night's calculation", () => {
    expect(zoneNow(zone, { bucket: -3.4, duration: 850 })).toEqual({
      bucket: -3.4,
      duration: 850,
      live: true,
    });
  });

  it("falls back to the committed values when there is no estimate", () => {
    // A zone calculated minutes ago has nothing new to add, and then the
    // committed value is the current one.
    expect(zoneNow(zone, null)).toEqual({
      bucket: -1.2,
      duration: 300,
      live: false,
    });
  });

  it("does not take an estimate without a bucket for one", () => {
    expect(zoneNow(zone, { since: "2026-09-24T23:00:00" }).live).toBe(false);
  });

  it("keeps the committed duration when the estimate has none", () => {
    expect(zoneNow(zone, { bucket: -3.4 }).duration).toBe(300);
  });
});

describe("deficitOf", () => {
  it("is zero for a bucket at or above zero", () => {
    expect(deficitOf(0)).toBe(0);
    expect(deficitOf(2.5)).toBe(0);
  });

  it("is the depth the zone is short", () => {
    expect(deficitOf(-3.4)).toBeCloseTo(3.4);
  });

  it("ignores the hair below zero a zone sits at after watering", () => {
    // It would print as "short 0.0 mm", which says nothing true.
    expect(deficitOf(-0.0009)).toBe(0);
    expect(deficitOf(-0.05)).toBeCloseTo(0.05);
  });
});

describe("depthLabel", () => {
  it("labels without converting, because the API already did", () => {
    expect(depthLabel(3.42, false)).toBe("3.4 mm");
    expect(depthLabel(0.13, true)).toBe("0.13 in");
  });
});

describe("durationLabel", () => {
  it("drops the hours when there are none", () => {
    expect(durationLabel(852)).toBe("14:12");
    expect(durationLabel(59)).toBe("0:59");
  });

  it("keeps them when there are", () => {
    expect(durationLabel(3723)).toBe("1:02:03");
  });

  it("never reads as a negative run", () => {
    expect(durationLabel(-10)).toBe("0:00");
  });
});

describe("momentLabel", () => {
  const today = new Date("2026-09-24T20:30:00");

  it("gives the time alone for today", () => {
    expect(momentLabel("2026-09-24T07:41:00", "en-GB", WORDS, today)).toBe(
      "07:41",
    );
  });

  it("names tomorrow and yesterday", () => {
    expect(momentLabel("2026-09-25T07:41:00", "en-GB", WORDS, today)).toBe(
      "tomorrow 07:41",
    );
    expect(momentLabel("2026-09-23T22:15:00", "en-GB", WORDS, today)).toBe(
      "yesterday 22:15",
    );
  });

  it("gives the day and month further out", () => {
    const label = momentLabel("2026-10-02T06:00:00", "en-GB", WORDS, today);
    expect(label).toContain("2");
    expect(label).toContain("06:00");
    expect(label).not.toContain("tomorrow");
  });

  it("hands back what it cannot read", () => {
    expect(momentLabel("not a date", "en-GB", WORDS, today)).toBe("not a date");
  });
});

describe("zoneActionEntity", () => {
  const devices = {
    dev0: { identifiers: [["smart_irrigation", "Smart Irrigation_zone_0"]] },
    dev1: { identifiers: [["smart_irrigation", "Smart Irrigation_zone_1"]] },
    other: { identifiers: [["other_domain", "whatever"]] },
  } as any;
  const entities = {
    a: {
      entity_id: "button.smart_irrigation_serre_irrigate_now",
      device_id: "dev0",
      platform: "smart_irrigation",
      translation_key: "irrigate_now",
    },
    b: {
      entity_id: "button.smart_irrigation_potager_irrigate_now",
      device_id: "dev1",
      platform: "smart_irrigation",
      translation_key: "irrigate_now",
    },
    c: {
      entity_id: "button.smart_irrigation_serre_reset_bucket",
      device_id: "dev0",
      platform: "smart_irrigation",
      translation_key: "reset_bucket",
    },
    d: {
      entity_id: "button.someone_elses_irrigate_now",
      device_id: "other",
      platform: "another_integration",
      translation_key: "irrigate_now",
    },
  } as any;

  it("finds a zone's button through its device identifier", () => {
    // Not through the entity_id: people rename zones.
    expect(zoneActionEntity(entities, devices, 0, "irrigate_now")).toBe(
      "button.smart_irrigation_serre_irrigate_now",
    );
    expect(zoneActionEntity(entities, devices, 1, "irrigate_now")).toBe(
      "button.smart_irrigation_potager_irrigate_now",
    );
  });

  it("tells the zone's buttons apart", () => {
    expect(zoneActionEntity(entities, devices, 0, "reset_bucket")).toBe(
      "button.smart_irrigation_serre_reset_bucket",
    );
  });

  it("never takes another integration's entity", () => {
    expect(
      zoneActionEntity(entities, devices, 9, "irrigate_now"),
    ).toBeUndefined();
  });

  it("does not mistake zone 1 for zone 10", () => {
    const wide = {
      ...devices,
      dev10: { identifiers: [["smart_irrigation", "x_zone_10"]] },
    } as any;
    const withTen = {
      ...entities,
      e: {
        entity_id: "button.zone_ten_irrigate_now",
        device_id: "dev10",
        platform: "smart_irrigation",
        translation_key: "irrigate_now",
      },
    } as any;
    expect(zoneActionEntity(withTen, wide, 10, "irrigate_now")).toBe(
      "button.zone_ten_irrigate_now",
    );
    expect(zoneActionEntity(withTen, wide, 1, "irrigate_now")).toBe(
      "button.smart_irrigation_potager_irrigate_now",
    );
  });

  it("is undefined without a registry to read", () => {
    expect(
      zoneActionEntity(undefined, devices, 0, "irrigate_now"),
    ).toBeUndefined();
    expect(
      zoneActionEntity(entities, undefined, 0, "irrigate_now"),
    ).toBeUndefined();
  });
});
