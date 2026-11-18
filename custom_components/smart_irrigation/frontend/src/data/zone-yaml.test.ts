import { describe, expect, it } from "vitest";
import { zoneFromYaml, zoneToYaml } from "./zone-yaml";

const zone: any = {
  id: 3,
  name: "Lawn",
  size: 50,
  throughput: 12,
  state: "automatic",
  duration: 840,
  bucket: -4.2,
  delta: -1.1,
  explanation: "<p>...</p>",
  last_calculated: "2026-11-18T06:00:00",
  number_of_data_points: 24,
  measured_throughput: 11.8,
  measured_throughput_samples: 3,
  multiplier: 1,
  mapping: 1,
  lead_time: 0,
  maximum_duration: 3600,
  maximum_bucket: 50,
  linked_entity: "switch.lawn",
  extra_entities: [],
  safety_off_topic: "zigbee2mqtt/lawn/set",
  safety_off_state_key: "state_l2",
  open_resends: 0,
  confirm_timeout: null,
  calculation_method: "from_weather",
  method_config: {},
};

describe("zoneToYaml", () => {
  it("writes the settings that are set, nothing the calculation writes", () => {
    const yaml = zoneToYaml(zone);
    expect(Object.keys(yaml)).toEqual([
      "name",
      "state",
      "size",
      "throughput",
      "linked_entity",
      "mapping",
      "calculation_method",
      "multiplier",
      "maximum_duration",
      "maximum_bucket",
      "lead_time",
      "safety_off_topic",
      "safety_off_state_key",
      "open_resends",
    ]);
    expect(yaml.open_resends).toBe(0);
  });
});

describe("zoneFromYaml", () => {
  it("changes nothing when the YAML is saved as it opened", () => {
    expect(zoneFromYaml(zoneToYaml(zone), zone)).toEqual({ changes: {} });
  });

  it("sends what was changed only", () => {
    const typed = { ...zoneToYaml(zone), open_resends: 2, size: 60 };
    expect(zoneFromYaml(typed, zone)).toEqual({
      changes: { size: 60, open_resends: 2 },
    });
  });

  it("clears an optional setting left out, keeps a required one", () => {
    const typed: any = zoneToYaml(zone);
    delete typed.safety_off_state_key;
    delete typed.name;
    expect(zoneFromYaml(typed, zone)).toEqual({
      changes: { safety_off_state_key: null },
    });
  });

  it("refuses what is not a zone setting", () => {
    expect(zoneFromYaml(["name"], zone)).toEqual({ error: "not_a_zone" });
    expect(zoneFromYaml("Lawn", zone)).toEqual({ error: "not_a_zone" });
    expect(
      zoneFromYaml({ ...zoneToYaml(zone), bucket: 0, sise: 3 }, zone),
    ).toEqual({ error: "not_settings", keys: ["bucket", "sise"] });
  });
});
