import { describe, expect, it } from "vitest";

import { localize } from "../localize/localize";

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
  awaitsFirstCalculation,
  calculationWhenKey,
  changedFields,
  displayDepth,
  displayName,
  displayTemperature,
  displayVolume,
  formatNumber,
  getOptionsForMappingType,
  groupsWithRainFromService,
  missingRequiredSources,
  newGroupSource,
  noneAllowed,
  readingUses,
  visibleGroups,
  setupRainToAsk,
  setupSourcesForEt,
  suggestSources,
  setupZoneMethod,
  splitChosen,
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

describe("groupsWithRainFromService", () => {
  const group = (name: string, rate: string, depth = "none", extra = {}) => ({
    name,
    mappings: {
      [MAPPING_CURRENT_PRECIPITATION]: { source: rate },
      [MAPPING_PRECIPITATION]: { source: depth },
    },
    ...extra,
  });

  it("names the groups whose rain is left on the service", () => {
    expect(
      groupsWithRainFromService([
        group("Lawn", MAPPING_CONF_SOURCE_WEATHER_SERVICE),
        group("Hedge", MAPPING_CONF_SOURCE_SENSOR),
        group("Beds", "none", MAPPING_CONF_SOURCE_WEATHER_SERVICE),
        group("Greenhouse", MAPPING_CONF_SOURCE_WEATHER_SERVICE, "none", {
          greenhouse: true,
        }),
      ]),
    ).toEqual(["Lawn", "Beds"]);
  });

  it("says how many, in a sentence that agrees with the number", () => {
    const say = (count: number) =>
      localize(
        "panels.weatherservice.messages.rain-groups-on-service",
        "en",
        "{count}",
        count,
        "{groups}",
        "Lawn",
      );
    expect(say(1)).toMatch(/^1 sensor group still takes its rain/);
    expect(say(2)).toMatch(/^2 sensor groups still take their rain/);
  });
});

describe("visibleGroups", () => {
  const groups = Array.from({ length: 12 }, (_, i) => i);

  it("draws the first ten and counts the rest", () => {
    expect(visibleGroups(groups, false)).toEqual({
      shown: groups.slice(0, 10),
      hidden: 2,
    });
  });

  it("draws every group once asked, the eleventh included", () => {
    const { shown, hidden } = visibleGroups(groups, true);
    expect(shown).toContain(10);
    expect(shown).toHaveLength(12);
    expect(hidden).toBe(0);
  });

  it("has nothing to show more of with ten groups or fewer", () => {
    expect(visibleGroups(groups.slice(0, 10), false).hidden).toBe(0);
  });

  it("names the button for what it shows", () => {
    expect(
      localize("panels.mappings.labels.show-more", "en", "{count}", 1),
    ).toBe("Show 1 more sensor group");
    expect(
      localize("panels.mappings.labels.show-more", "en", "{count}", 2),
    ).toBe("Show 2 more sensor groups");
  });
});

describe("readingUses", () => {
  const groups = [
    {
      name: "Garden",
      mappings: {
        Windspeed: { source: "sensor", sensorentity: "sensor.wind" },
        Temperature: { source: "weather_service" },
      },
    },
    {
      name: "Greenhouse",
      mappings: {
        Windspeed: { source: "none" },
        Temperature: { source: "sensor", sensorentity: "sensor.inside" },
      },
    },
  ];

  it("finds the group that reads the same sensor", () => {
    expect(readingUses(groups, "Windspeed", "sensor.wind")).toEqual([
      { group: "Garden", same: true, source: "sensor", entity: "sensor.wind" },
    ]);
  });

  it("tells a different sensor apart", () => {
    expect(readingUses(groups, "Windspeed", "sensor.other")[0].same).toBe(
      false,
    );
  });

  it("matches the weather service when the check has no sensor", () => {
    expect(readingUses(groups, "Temperature", null)).toEqual([
      {
        group: "Garden",
        same: true,
        source: "weather_service",
        entity: undefined,
      },
      {
        group: "Greenhouse",
        same: false,
        source: "sensor",
        entity: "sensor.inside",
      },
    ]);
  });

  it("leaves out a group that does not read it", () => {
    expect(readingUses(groups, "Windspeed", null).map((u) => u.group)).toEqual([
      "Garden",
    ]);
    expect(readingUses(undefined, "Windspeed", null)).toEqual([]);
  });
});

describe("formatNumber", () => {
  it("writes the decimal comma in German", () => {
    expect(formatNumber(9.5, 1, { language: "de" })).toBe("9,5");
    expect(formatNumber(950, 1, { language: "de" })).toBe("950,0");
  });

  it("writes the decimal point in English", () => {
    expect(formatNumber(9.5, 1, { language: "en" })).toBe("9.5");
  });

  it("follows the number setting over the language", () => {
    expect(
      formatNumber(9.5, 1, { language: "en", number_format: "comma_decimal" }),
    ).toBe("9,5");
    expect(
      formatNumber(9.5, 1, { language: "de", number_format: "decimal_point" }),
    ).toBe("9.5");
    expect(
      formatNumber(1234.5, 1, { language: "de", number_format: "none" }),
    ).toBe("1234.5");
  });

  it("falls back to the language when there is no locale", () => {
    expect(formatNumber(9.5, 1, null, "de")).toBe("9,5");
  });

  it("shows a hair below zero as zero", () => {
    expect(formatNumber(-0.01, 1, { language: "de" })).toBe("0,0");
  });
});

describe("displayName", () => {
  const groups = [
    { id: 0, name: "Standard Sensorgruppe" },
    { id: 1, name: "Rasen Terrasse" },
  ];

  it("is the name alone, without the internal id", () => {
    expect(displayName(groups[1], groups)).toBe("Rasen Terrasse");
  });

  it("adds the id when two share a name", () => {
    const twins = [...groups, { id: 2, name: "Rasen Terrasse" }];
    expect(displayName(twins[1], twins)).toBe("Rasen Terrasse (#1)");
    expect(displayName(twins[2], twins)).toBe("Rasen Terrasse (#2)");
    expect(displayName(twins[0], twins)).toBe("Standard Sensorgruppe");
  });

  it("reads a list given as an object, as the zones page keeps it", () => {
    const byId = {
      0: groups[0],
      1: groups[1],
      2: { id: 2, name: "Rasen Terrasse" },
    };
    expect(displayName(byId[1], byId)).toBe("Rasen Terrasse (#1)");
  });

  it("falls back to the id for an item without a name", () => {
    expect(displayName({ id: 3, name: "" }, groups)).toBe("#3");
  });
});

describe("suggestSources", () => {
  const sensor = (device_class: string, friendly_name = "") => ({
    attributes: { device_class, friendly_name },
  });
  const ALL = [
    MAPPING_TEMPERATURE,
    MAPPING_DEWPOINT,
    MAPPING_HUMIDITY,
    MAPPING_PRESSURE,
    MAPPING_WINDSPEED,
    MAPPING_SOLRAD,
    MAPPING_PRECIPITATION,
  ];

  it("suggests the one sensor of each class (the test HA's DWD sensors)", () => {
    const states = {
      "sensor.nuernberg_temperatur": sensor("temperature"),
      "sensor.nuernberg_luftfeuchte": sensor("humidity"),
      "sensor.nuernberg_wind": sensor("wind_speed"),
      "sensor.nuernberg_niederschlag": sensor("precipitation"),
      "sensor.nuernberg_globalstrahlung": sensor("irradiance"),
      "sensor.hecke_bodenfeuchte": sensor("moisture"),
    };
    expect(suggestSources(ALL, states)).toEqual({
      [MAPPING_TEMPERATURE]: "sensor.nuernberg_temperatur",
      [MAPPING_HUMIDITY]: "sensor.nuernberg_luftfeuchte",
      [MAPPING_WINDSPEED]: "sensor.nuernberg_wind",
      [MAPPING_PRECIPITATION]: "sensor.nuernberg_niederschlag",
      [MAPPING_SOLRAD]: "sensor.nuernberg_globalstrahlung",
    });
  });

  it("tells the dew point from the temperature by its name", () => {
    const states = {
      "sensor.station_temperature": sensor("temperature"),
      "sensor.station_dew_point": sensor("temperature"),
    };
    expect(
      suggestSources([MAPPING_TEMPERATURE, MAPPING_DEWPOINT], states),
    ).toEqual({
      [MAPPING_TEMPERATURE]: "sensor.station_temperature",
      [MAPPING_DEWPOINT]: "sensor.station_dew_point",
    });
  });

  it("among several, takes the one of the station the outdoor sensors belong to", () => {
    const states = {
      "sensor.living_room_temperature": sensor("temperature"),
      "sensor.garden_temperature": sensor("temperature"),
      "sensor.bathroom_humidity": sensor("humidity"),
      "sensor.garden_humidity": sensor("humidity"),
      "sensor.garden_wind": sensor("wind_speed"),
    };
    const entities = {
      "sensor.garden_temperature": { device_id: "station" },
      "sensor.garden_humidity": { device_id: "station" },
      "sensor.garden_wind": { device_id: "station" },
      "sensor.living_room_temperature": { device_id: "thermostat" },
      "sensor.bathroom_humidity": { device_id: "fan" },
    };
    expect(
      suggestSources([MAPPING_TEMPERATURE, MAPPING_HUMIDITY], states, entities),
    ).toEqual({
      [MAPPING_TEMPERATURE]: "sensor.garden_temperature",
      [MAPPING_HUMIDITY]: "sensor.garden_humidity",
    });
  });

  it("without devices, a station is the start of the entity ids", () => {
    const states = {
      "sensor.kwl_temperatur_aussen": sensor("temperature"),
      "sensor.dwd_temperatur": sensor("temperature"),
      "sensor.dwd_wind": sensor("wind_speed"),
    };
    expect(suggestSources([MAPPING_TEMPERATURE], states)).toEqual({
      [MAPPING_TEMPERATURE]: "sensor.dwd_temperatur",
    });
  });

  it("suggests nothing when it can't tell", () => {
    const states = {
      "sensor.kitchen_temperature": sensor("temperature"),
      "sensor.office_temperature": sensor("temperature"),
    };
    expect(suggestSources([MAPPING_TEMPERATURE], states)).toEqual({});
  });

  it("leaves out the integration's own sensors and sensors without a class", () => {
    const states = {
      "sensor.smart_irrigation_lawn": sensor("precipitation"),
      "sensor.garden_rain": sensor("precipitation"),
      "sensor.template_temperature": { attributes: {} },
    };
    const entities = {
      "sensor.smart_irrigation_lawn": { platform: "smart_irrigation" },
    };
    expect(
      suggestSources(
        [MAPPING_PRECIPITATION, MAPPING_TEMPERATURE],
        states,
        entities,
      ),
    ).toEqual({ [MAPPING_PRECIPITATION]: "sensor.garden_rain" });
  });

  it("only answers for the sources asked", () => {
    const states = { "sensor.garden_wind": sensor("wind_speed") };
    expect(suggestSources([MAPPING_TEMPERATURE], states)).toEqual({});
  });
});

describe("a zone before its first calculation", () => {
  const fresh = { state: "automatic", last_calculated: null };

  it("waits for it while automatic and never calculated", () => {
    expect(awaitsFirstCalculation(fresh)).toBe(true);
  });

  it("no longer once it was calculated", () => {
    expect(
      awaitsFirstCalculation({ ...fresh, last_calculated: "2026-11-08T23:00" }),
    ).toBe(false);
  });

  it("not when the calculation failed: the problem says why", () => {
    expect(
      awaitsFirstCalculation({
        ...fresh,
        calculation_problem: { code: "no_readings" },
      }),
    ).toBe(false);
  });

  it("not for a manual or disabled zone, which is never calculated", () => {
    expect(awaitsFirstCalculation({ ...fresh, state: "manual" })).toBe(false);
    expect(awaitsFirstCalculation({ ...fresh, state: "disabled" })).toBe(false);
  });

  it("names when the calculation comes", () => {
    expect(calculationWhenKey({ autocalcenabled: true })).toBe("calc-daily");
    expect(
      calculationWhenKey({
        autocalcenabled: true,
        recalculate_before_start: true,
      }),
    ).toBe("calc-before-start");
    expect(calculationWhenKey({ autocalcenabled: false })).toBe("calc-manual");
    expect(calculationWhenKey(undefined)).toBe("calc-manual");
  });

  it("says so in en and de", () => {
    for (const lang of ["en", "de"]) {
      const zone = localize(
        "panels.zones.status.not-calculated",
        lang,
        "{when}",
        "X",
      );
      const sub = localize(
        "panels.info.cards.next-run.sub-not-calculated",
        lang,
        "{when}",
        "X",
      );
      expect(zone).toContain("X");
      expect(sub).toContain("X");
      expect(
        localize("panels.info.cards.next-run.headline-not-calculated", lang),
      ).not.toMatch(/^Translation/);
    }
  });
});

describe("sources left without a sensor", () => {
  it("the review names the chosen ones and the empty ones apart", () => {
    expect(
      splitChosen([MAPPING_TEMPERATURE, MAPPING_DEWPOINT, MAPPING_WINDSPEED], {
        [MAPPING_TEMPERATURE]: "sensor.t",
        [MAPPING_DEWPOINT]: "",
        [MAPPING_WINDSPEED]: "sensor.w",
      }),
    ).toEqual({
      chosen: [MAPPING_TEMPERATURE, MAPPING_WINDSPEED],
      empty: [MAPPING_DEWPOINT],
    });
  });

  it("a group offers None for what its engine does not require", () => {
    const required = [MAPPING_TEMPERATURE, MAPPING_WINDSPEED];
    expect(
      noneAllowed(MAPPING_PRESSURE, MAPPING_CONF_SOURCE_SENSOR, required),
    ).toBe(true);
    expect(
      noneAllowed(MAPPING_TEMPERATURE, MAPPING_CONF_SOURCE_SENSOR, required),
    ).toBe(false);
  });

  it("and keeps showing None where it is stored", () => {
    expect(
      noneAllowed(MAPPING_TEMPERATURE, MAPPING_CONF_SOURCE_NONE, [
        MAPPING_TEMPERATURE,
      ]),
    ).toBe(true);
    expect(noneAllowed(MAPPING_DEWPOINT, MAPPING_CONF_SOURCE_NONE, null)).toBe(
      true,
    );
  });

  it("without a known engine nothing else is optional", () => {
    expect(
      noneAllowed(MAPPING_DEWPOINT, MAPPING_CONF_SOURCE_SENSOR, null),
    ).toBe(false);
  });

  it("has the words in en and de", () => {
    for (const lang of ["en", "de"]) {
      for (const key of [
        "panels.setup.steps.review.no-sensor",
        "panels.setup.calc-now",
        "panels.setup.calc-nothing",
        "panels.setup.calc-failed",
        "panels.mappings.cards.mapping.sources.none_estimated",
        "panels.zones.labels.valve-off",
        "panels.zones.labels.valve-off-link",
        "panels.info.gaps.no_valve_path.action",
        "weather_skip.forecast_set_up_service",
      ]) {
        expect(localize(key, lang)).not.toMatch(/^Translation|^$/);
      }
      expect(
        localize("panels.setup.calc-duration", lang, "{duration}", "D"),
      ).toContain("D");
    }
  });
});
