import { describe, expect, it } from "vitest";

import {
  CONF_IMPERIAL,
  CONF_METRIC,
  MAPPING_CONF_SOURCE_NONE,
  MAPPING_CONF_SOURCE_SENSOR,
  MAPPING_CONF_SOURCE_WEATHER_SERVICE,
  MAPPING_CURRENT_PRECIPITATION,
  MAPPING_DEWPOINT,
  MAPPING_EVAPOTRANSPIRATION,
  MAPPING_HUMIDITY,
  MAPPING_PRECIPITATION,
  MAPPING_PRESSURE,
  MAPPING_SOLRAD,
  MAPPING_TEMPERATURE,
  MAPPING_WINDSPEED,
  WEATHER_SERVICE_HA,
  WEATHER_SERVICE_OPEN_METEO,
} from "./const";
import {
  changedFields,
  displayDepth,
  displayTemperature,
  displayVolume,
  getOptionsForMappingType,
  missingRequiredSources,
  newGroupSource,
  sameDeviceSensors,
  setupRainToAsk,
  setupSourcesForEt,
  setupZoneMethod,
} from "./helpers";

/**
 * The unit strings this panel writes are read back by the integration, which
 * keeps its own copy of them. When the two drifted apart, picking "millibar"
 * for a pressure sensor converted to nothing: the value was dropped from the
 * record and the calculation reported pressure as missing, on a sensor that
 * worked. The Python side has the matching test; this one guards the list the
 * panel offers in the first place.
 */
const EVERY_MAPPING = [
  MAPPING_TEMPERATURE,
  MAPPING_DEWPOINT,
  MAPPING_PRECIPITATION,
  MAPPING_EVAPOTRANSPIRATION,
  MAPPING_CURRENT_PRECIPITATION,
  MAPPING_HUMIDITY,
  MAPPING_PRESSURE,
  MAPPING_WINDSPEED,
  MAPPING_SOLRAD,
];

describe("getOptionsForMappingType", () => {
  it.each(EVERY_MAPPING)("offers at least one unit for %s", (mapping) => {
    expect(getOptionsForMappingType(mapping).length).toBeGreaterThan(0);
  });

  it.each(EVERY_MAPPING)("gives every unit of %s a system", (mapping) => {
    for (const option of getOptionsForMappingType(mapping)) {
      const systems = Array.isArray(option.system)
        ? option.system
        : [option.system];
      expect(systems.length).toBeGreaterThan(0);
      for (const system of systems) {
        expect([CONF_METRIC, CONF_IMPERIAL]).toContain(system);
      }
    }
  });

  it.each(EVERY_MAPPING)(
    "offers %s a unit on both metric and imperial",
    (mapping) => {
      const systems = getOptionsForMappingType(mapping).flatMap((option) =>
        Array.isArray(option.system) ? option.system : [option.system],
      );

      // A field with no unit for one system leaves that user unable to say
      // what their sensor reports.
      expect(systems).toContain(CONF_METRIC);
      expect(systems).toContain(CONF_IMPERIAL);
    },
  );

  it("offers no unit for something that is not a mapping", () => {
    expect(getOptionsForMappingType("not a mapping")).toEqual([]);
  });

  it("keeps knots available to both systems", () => {
    // A METAR reports knots whatever the user's system is set to.
    const knots = getOptionsForMappingType(MAPPING_WINDSPEED).find(
      (option) => option.unit === "knot",
    );

    expect(knots).toBeDefined();
    expect(knots!.system).toEqual([CONF_METRIC, CONF_IMPERIAL]);
  });
});

describe("changedFields", () => {
  const loaded = {
    id: 1,
    name: "Lawn",
    bucket: -4.2,
    explanation: "old",
    last_calculated: null,
    flow_sensor: "sensor.meter",
  };

  it("sends only the field an edit changed, never the stale rest", () => {
    // The nightly calculation moved the bucket on the server; the page still
    // holds -4.2 and must not write it back when the name is edited.
    expect(changedFields(loaded, { ...loaded, name: "Front lawn" })).toEqual({
      name: "Front lawn",
    });
  });

  it("sends a cleared field as null, so the server clears it", () => {
    expect(
      changedFields(loaded, { ...loaded, flow_sensor: undefined }),
    ).toEqual({ flow_sensor: null });
  });

  it("sends nothing when nothing changed", () => {
    expect(changedFields(loaded, { ...loaded })).toEqual({});
  });

  it("compares nested values by content", () => {
    const withList = { ...loaded, tags: [1, 2] };
    expect(changedFields(withList, { ...withList, tags: [1, 2] })).toEqual({});
    expect(changedFields(withList, { ...withList, tags: [1, 3] })).toEqual({
      tags: [1, 3],
    });
  });
});

describe("what the watering calendar shows", () => {
  // The calendar describes a climate, so the backend computes it in metric
  // whatever the install: mm, litres and Celsius. The panel is where it meets
  // the unit system the user reads in.
  const metric = { units: CONF_METRIC };
  const imperial = { units: CONF_IMPERIAL };

  it("shows a depth in the unit of the configuration", () => {
    expect(displayDepth(25.4, metric)).toBeCloseTo(25.4);
    expect(displayDepth(25.4, imperial)).toBeCloseTo(1);
  });

  it("shows a temperature in the unit of the configuration", () => {
    expect(displayTemperature(20, metric)).toBeCloseTo(20);
    expect(displayTemperature(20, imperial)).toBeCloseTo(68);
    expect(displayTemperature(0, imperial)).toBeCloseTo(32);
  });

  it("shows a volume in the unit of the configuration", () => {
    expect(displayVolume(3.785411784, metric)).toBeCloseTo(3.785411784);
    expect(displayVolume(3.785411784, imperial)).toBeCloseTo(1);
  });

  it("reads a missing value as zero rather than NaN", () => {
    expect(displayDepth(undefined as any, imperial)).toBe(0);
    expect(displayTemperature(null as any, imperial)).toBe(32);
  });
});

/**
 * The setup assistant used to make every source it asked for mandatory, so a
 * PyETO zone could not be created without a sensor for each of them, though
 * the engine estimates all but temperature and wind.
 */
describe("missingRequiredSources", () => {
  const asked = [
    MAPPING_TEMPERATURE,
    MAPPING_DEWPOINT,
    MAPPING_HUMIDITY,
    MAPPING_PRESSURE,
    MAPPING_WINDSPEED,
    MAPPING_SOLRAD,
    MAPPING_PRECIPITATION,
  ];
  const requires = [MAPPING_TEMPERATURE, MAPPING_WINDSPEED];

  it("lets the assistant go on once the required sources are chosen", () => {
    expect(
      missingRequiredSources(asked, requires, {
        [MAPPING_TEMPERATURE]: "sensor.t",
        [MAPPING_WINDSPEED]: "sensor.w",
      }),
    ).toEqual([]);
  });

  it("names a required source that is still missing", () => {
    expect(
      missingRequiredSources(asked, requires, {
        [MAPPING_TEMPERATURE]: "sensor.t",
        [MAPPING_HUMIDITY]: "sensor.h",
      }),
    ).toEqual([MAPPING_WINDSPEED]);
  });

  it("requires every source asked for when the backend does not say", () => {
    expect(
      missingRequiredSources(
        [MAPPING_TEMPERATURE, MAPPING_HUMIDITY],
        undefined,
        {
          [MAPPING_TEMPERATURE]: "sensor.t",
        },
      ),
    ).toEqual([MAPPING_HUMIDITY]);
  });
});

/**
 * The setup assistant saves its zone with the method it is calculated by, and
 * lets the integration bind the engine. Creating the engine itself reused the
 * first one of the kind, so the fixed amount typed in the assistant was lost.
 */
describe("setupZoneMethod", () => {
  it("states the method that goes with each engine", () => {
    expect(setupZoneMethod("PyETO")).toEqual({
      calculation_method: "from_weather",
    });
    expect(setupZoneMethod("Passthrough")).toEqual({
      calculation_method: "provided",
    });
  });

  it("carries the evaporation typed as the fixed method's drying delta", () => {
    expect(setupZoneMethod("Static", "4.5")).toEqual({
      calculation_method: "fixed",
      method_config: { delta: -4.5 },
    });
  });

  it("leaves an engine it does not know to the integration", () => {
    expect(setupZoneMethod("SomethingElse")).toEqual({});
  });
});

/**
 * A weather entity reports no rain that fell. On the weather-service path the
 * assistant then asks for a rain sensor, and offers the ones of the same
 * device.
 */
describe("setupRainToAsk", () => {
  it("asks for rain on the service path when the service has none", () => {
    expect(setupRainToAsk("service", false, false)).toEqual([
      MAPPING_CURRENT_PRECIPITATION,
      MAPPING_PRECIPITATION,
    ]);
  });

  it("asks nothing more of a service that brings its own rain", () => {
    expect(setupRainToAsk("service", false, true)).toEqual([]);
  });

  it("asks nothing under glass, or on the other paths", () => {
    expect(setupRainToAsk("service", true, false)).toEqual([]);
    for (const weather of ["sensors", "et", "static"]) {
      expect(setupRainToAsk(weather, false, false)).toEqual([]);
    }
  });
});

describe("sameDeviceSensors", () => {
  const registry = [
    { entity_id: "weather.home", device_id: "dwd" },
    {
      entity_id: "sensor.home_radar_precipitation",
      device_id: "dwd",
      original_device_class: "precipitation_intensity",
    },
    {
      entity_id: "sensor.home_precipitation",
      device_id: "dwd",
      original_device_class: "precipitation_intensity",
      disabled_by: "integration",
    },
    {
      entity_id: "sensor.home_temperature",
      device_id: "dwd",
      original_device_class: "temperature",
    },
    {
      entity_id: "sensor.garden_rain_rate",
      device_id: "garden",
      original_device_class: "precipitation_intensity",
    },
    {
      entity_id: "sensor.home_renamed",
      device_id: "dwd",
      device_class: "precipitation_intensity",
      original_device_class: "precipitation",
    },
  ];

  it("finds the sensors of that class on the entity's device, enabled first", () => {
    expect(
      sameDeviceSensors(registry, "weather.home", "precipitation_intensity"),
    ).toEqual([
      { entity_id: "sensor.home_radar_precipitation", disabled: false },
      { entity_id: "sensor.home_renamed", disabled: false },
      { entity_id: "sensor.home_precipitation", disabled: true },
    ]);
  });

  it("follows a device class the user set over the original one", () => {
    expect(
      sameDeviceSensors(registry, "weather.home", "precipitation"),
    ).toEqual([]);
  });

  it("finds nothing for an entity without a device", () => {
    expect(
      sameDeviceSensors(registry, "weather.other", "precipitation_intensity"),
    ).toEqual([]);
  });
});

/**
 * A zone whose evapotranspiration comes from a sensor was asked for that
 * sensor only, and never had any rain.
 */
describe("setupSourcesForEt", () => {
  it("asks for the rain too, as the engine reads it", () => {
    expect(
      setupSourcesForEt(
        [
          MAPPING_EVAPOTRANSPIRATION,
          MAPPING_PRECIPITATION,
          MAPPING_CURRENT_PRECIPITATION,
        ],
        true,
      ),
    ).toEqual([
      MAPPING_EVAPOTRANSPIRATION,
      MAPPING_PRECIPITATION,
      MAPPING_CURRENT_PRECIPITATION,
    ]);
  });

  it("asks for the evapotranspiration alone when the engine says nothing", () => {
    expect(setupSourcesForEt([], false)).toEqual([MAPPING_EVAPOTRANSPIRATION]);
  });
});

describe("newGroupSource", () => {
  it("starts the rain rate on none with a weather entity", () => {
    expect(
      newGroupSource(MAPPING_CURRENT_PRECIPITATION, true, WEATHER_SERVICE_HA),
    ).toBe(MAPPING_CONF_SOURCE_NONE);
    expect(newGroupSource(MAPPING_TEMPERATURE, true, WEATHER_SERVICE_HA)).toBe(
      MAPPING_CONF_SOURCE_WEATHER_SERVICE,
    );
  });

  it("keeps the rain rate on a service that reports rain", () => {
    expect(
      newGroupSource(
        MAPPING_CURRENT_PRECIPITATION,
        true,
        WEATHER_SERVICE_OPEN_METEO,
      ),
    ).toBe(MAPPING_CONF_SOURCE_WEATHER_SERVICE);
  });

  it("never takes evapotranspiration, radiation or the rain depth from it", () => {
    for (const name of [
      MAPPING_EVAPOTRANSPIRATION,
      MAPPING_SOLRAD,
      MAPPING_PRECIPITATION,
    ]) {
      expect(newGroupSource(name, true, WEATHER_SERVICE_OPEN_METEO)).toBe(
        MAPPING_CONF_SOURCE_NONE,
      );
    }
  });

  it("asks a sensor for everything without a weather service", () => {
    expect(
      newGroupSource(MAPPING_CURRENT_PRECIPITATION, false, WEATHER_SERVICE_HA),
    ).toBe(MAPPING_CONF_SOURCE_SENSOR);
  });
});
