import { TemplateResult, html } from "lit";
import { localize } from "../localize/localize";
import { HomeAssistant, stateIcon, fireEvent } from "custom-card-helpers";
import { HassEntity } from "home-assistant-js-websocket";
import {
  CONF_IMPERIAL,
  CONF_METRIC,
  CONF_PRECIPITATION_THRESHOLD_MM,
  MAPPING_CURRENT_PRECIPITATION,
  MAPPING_DEWPOINT,
  MAPPING_EVAPOTRANSPIRATION,
  MAPPING_HUMIDITY,
  //removing this as part of beta12. Temperature is the only thing we want to take and we will apply min and max aggregation on our own.
  //MAPPING_MAX_TEMP,
  //MAPPING_MIN_TEMP,
  MAPPING_PRECIPITATION,
  MAPPING_PRESSURE,
  MAPPING_SOLRAD,
  MAPPING_TEMPERATURE,
  MAPPING_WINDSPEED,
  PLATFORM,
  UNIT_DEGREES_C,
  UNIT_DEGREES_F,
  UNIT_GALLON,
  UNIT_GPM,
  UNIT_HPA,
  UNIT_INCH,
  UNIT_INCHH,
  UNIT_INHG,
  UNIT_KMH,
  UNIT_KNOTS,
  UNIT_LITER,
  UNIT_LPM,
  UNIT_M2,
  UNIT_MBAR,
  UNIT_MH,
  UNIT_MJ_DAY_M2,
  UNIT_MJ_DAY_SQFT,
  UNIT_MM,
  UNIT_MMH,
  UNIT_MS,
  UNIT_PERCENT,
  UNIT_PSI,
  UNIT_SQ_FT,
  UNIT_W_M2,
  UNIT_W_SQFT,
  ZONE_BUCKET,
  ZONE_DRAINAGE_RATE,
  ZONE_PRECIPITATION_RATE,
  ZONE_SIZE,
  ZONE_THROUGHPUT,
  ZONE_WATER_VOLUME,
} from "./const";
import { Dictionary } from "./types";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

export function getDomain(entity: string | HassEntity) {
  const entity_id: string =
    typeof entity == "string" ? entity : entity.entity_id;

  return String(entity_id.split(".").shift());
}

export function computeIcon(entity: HassEntity) {
  return stateIcon(entity);
}
export function parseBoolean(value?: string | number | boolean | null) {
  value = value?.toString().toLowerCase();
  return value === "on" || value === "true" || value === "1";
}
export function getPart(value: any, index: number) {
  value = value.toString();
  return value.split(",")[index];
}
/**
 * A date and time in the language Home Assistant is running in.
 *
 * The panel used to format these through moment with an English pattern, so a
 * French or German install read "Mon 21 Sep" in the middle of its own
 * language. Intl does it from the same language the frontend is set to, with
 * no locale data to bundle.
 */
export function localizedDateTime(
  value: string | number | Date,
  hass: any,
  options: Intl.DateTimeFormatOptions,
): string {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return "-";
  }
  const language =
    hass?.locale?.language ?? hass?.language ?? navigator.language;
  try {
    return new Intl.DateTimeFormat(language, options).format(date);
  } catch {
    // An unknown language tag: the system default still beats a crash.
    return date.toLocaleString();
  }
}

export function output_unit(config, arg0: string): TemplateResult {
  switch (arg0) {
    case ZONE_DRAINAGE_RATE:
    case ZONE_PRECIPITATION_RATE:
      if (config.units == CONF_METRIC) {
        return html`${unsafeHTML(UNIT_MMH)}`;
      } else return html`${unsafeHTML(UNIT_INCHH)}`;
      break;
    case CONF_PRECIPITATION_THRESHOLD_MM:
    case ZONE_BUCKET:
      if (config.units == CONF_METRIC) {
        return html`${unsafeHTML(UNIT_MM)}`;
      } else return html`${unsafeHTML(UNIT_INCH)}`;
      break;
    case ZONE_SIZE:
      if (config.units == CONF_METRIC) {
        return html`${unsafeHTML(UNIT_M2)}`;
      } else return html`${unsafeHTML(UNIT_SQ_FT)}`;
      break;
    case ZONE_THROUGHPUT:
      if (config.units == CONF_METRIC) {
        return html`${unsafeHTML(UNIT_LPM)}`;
      } else return html`${unsafeHTML(UNIT_GPM)}`;
      break;
    case ZONE_WATER_VOLUME:
      if (config.units == CONF_METRIC) {
        return html`${unsafeHTML(UNIT_LITER)}`;
      } else return html`${unsafeHTML(UNIT_GALLON)}`;
      break;
    default:
      return html``;
  }
}

/**
 * Format a duration in seconds as hh:mm:ss, which reads far better than a raw
 * second count once a run is longer than a couple of minutes. Hours are not
 * capped at two digits, so a very long duration still shows correctly.
 */
export function formatDuration(seconds?: number | null): string {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

/**
 * Water volume implied by an irrigation duration: the throughput is a flow rate
 * per minute (l/minute in metric, gal/minute in imperial), so the result is in
 * litres or gallons respectively — matching output_unit(ZONE_WATER_VOLUME).
 */
export function waterVolume(seconds?: number | null, throughput?: number) {
  const duration = Number(seconds) || 0;
  const flow = Number(throughput) || 0;
  if (duration <= 0 || flow <= 0) {
    return 0;
  }
  return (duration / 60) * flow;
}
/** US gallons in one litre, for converting stored volumes to imperial. */
const LITRES_PER_GALLON = 3.785411784;

/**
 * Convert a volume the backend stores in litres to the unit the panel shows for
 * this configuration — litres in metric, gallons in imperial, matching
 * output_unit(ZONE_WATER_VOLUME).
 */
export function displayVolume(litres: number, config): number {
  const value = Number(litres) || 0;
  return config?.units === CONF_METRIC ? value : value / LITRES_PER_GALLON;
}

/** Millimetres in one inch, for the values the backend keeps in metric. */
const MM_PER_INCH = 25.4;

/**
 * A depth the backend computes in mm, in the unit this configuration shows.
 * The watering calendar is the one place that sends plain metric numbers
 * rather than zone fields, because it describes a climate, not a stored zone.
 */
export function displayDepth(mm: number, config): number {
  const value = Number(mm) || 0;
  return config?.units === CONF_METRIC ? value : value / MM_PER_INCH;
}

/** A temperature the backend computes in Celsius, in the unit shown. */
export function displayTemperature(celsius: number, config): number {
  const value = Number(celsius) || 0;
  return config?.units === CONF_METRIC ? value : value * 1.8 + 32;
}

export function getOptionsForMappingType(mapping: string) {
  switch (mapping) {
    case MAPPING_DEWPOINT:
    //removing this as part of beta12. Temperature is the only thing we want to take and we will apply min and max aggregation on our own.
    //case MAPPING_MIN_TEMP:
    //case MAPPING_MAX_TEMP:
    case MAPPING_TEMPERATURE:
      //this should be degrees C or F.
      return [
        { unit: UNIT_DEGREES_C, system: CONF_METRIC },
        { unit: UNIT_DEGREES_F, system: CONF_IMPERIAL },
      ];
    case MAPPING_PRECIPITATION:
    case MAPPING_EVAPOTRANSPIRATION:
      //this should be mm or inch
      return [
        { unit: UNIT_MM, system: CONF_METRIC },
        { unit: UNIT_INCH, system: CONF_IMPERIAL },
      ];
    case MAPPING_CURRENT_PRECIPITATION:
      //this should be mm/h or inch/h
      return [
        { unit: UNIT_MMH, system: CONF_METRIC },
        { unit: UNIT_INCHH, system: CONF_IMPERIAL },
      ];
    case MAPPING_HUMIDITY:
      //return %
      return [{ unit: UNIT_PERCENT, system: [CONF_METRIC, CONF_IMPERIAL] }];
    case MAPPING_PRESSURE:
      //return mbar, hPa or psi, InHG
      return [
        { unit: UNIT_MBAR, system: CONF_METRIC },
        { unit: UNIT_HPA, system: CONF_METRIC },
        { unit: UNIT_PSI, system: CONF_IMPERIAL },
        { unit: UNIT_INHG, system: CONF_IMPERIAL },
      ];
    case MAPPING_WINDSPEED:
      //return km/h, mile/h, meter/s, knot
      return [
        { unit: UNIT_KMH, system: CONF_METRIC },
        { unit: UNIT_MS, system: CONF_METRIC },
        { unit: UNIT_MH, system: CONF_IMPERIAL },
        // A nautical mile is 1852 m against 1609 m for a land mile, so a METAR
        // wind read as mile/h is off by 15% straight into the FAO-56 wind term.
        { unit: UNIT_KNOTS, system: [CONF_METRIC, CONF_IMPERIAL] },
      ];

    case MAPPING_SOLRAD:
      //return MJ/Day/M2, W/m2,  Mj/Day/SQFT or W/sq ft
      return [
        { unit: UNIT_W_M2, system: CONF_METRIC },
        { unit: UNIT_MJ_DAY_M2, system: CONF_METRIC },
        { unit: UNIT_W_SQFT, system: CONF_IMPERIAL },
        { unit: UNIT_MJ_DAY_SQFT, system: CONF_IMPERIAL },
      ];
    default:
      return [];
  }
}
export function prettyPrint(input: string) {
  if (!input) {
    return;
  }
  input = input.replace("_", " ");
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function computeName(entity: HassEntity) {
  if (!entity) return "(unrecognized entity)";
  if (entity.attributes && entity.attributes.friendly_name)
    return entity.attributes.friendly_name;
  else return String(entity.entity_id.split(".").pop());
}

export function getAlarmEntity(hass: HomeAssistant) {
  return String(hass.panels[PLATFORM].config!.entity_id);
}

export function isEqual(...arr: any[]) {
  return arr.every((e) => JSON.stringify(e) === JSON.stringify(arr[0]));
}

export function Unique<TValue>(arr: TValue[]) {
  const res: TValue[] = [];
  arr.forEach((item) => {
    if (
      !res.find((e) =>
        typeof item === "object" ? isEqual(e, item) : e === item,
      )
    )
      res.push(item);
  });
  return res;
}

export function Without(array: any[], item: any) {
  return array.filter((e) => e !== item);
}

export function pick(
  obj: Dictionary<any> | null | undefined,
  keys: string[],
): Dictionary<any> {
  if (!obj) return {};
  return Object.entries(obj)
    .filter(([key]) => keys.includes(key))
    .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {});
}

export function flatten<U>(arr: U[][]): U[] {
  if ((arr as unknown as U[]).every((val) => !Array.isArray(val))) {
    return (arr as unknown as U[]).slice();
  }
  return arr.reduce(
    (acc, val) =>
      acc.concat(Array.isArray(val) ? flatten(val as unknown as U[][]) : val),
    [],
  );
}

interface Omit {
  <T extends object, K extends [...(keyof T)[]]>(
    obj: T,
    ...keys: K
  ): {
    [K2 in Exclude<keyof T, K[number]>]: T[K2];
  };
}

export const omit: Omit = (obj, ...keys) => {
  const ret = {} as {
    [K in keyof typeof obj]: (typeof obj)[K];
  };
  let key: keyof typeof obj;
  for (key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
};

export function isDefined<TValue>(
  value: TValue | null | undefined,
): value is TValue {
  return value !== null && value !== undefined;
}

export function IsEqual(
  obj1: Record<string, any> | any[],
  obj2: Record<string, any> | any[],
) {
  if (obj1 === null || obj2 === null) return obj1 === obj2;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
      if (!IsEqual(obj1[key], obj2[key])) return false;
    } else if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

export function showConfirmationDialog(
  ev: Event | HTMLElement,
  message: string | TemplateResult,
  target: number,
) {
  const elem = ev.hasOwnProperty("tagName")
    ? (ev as HTMLElement)
    : ((ev as Event).target as HTMLElement);
  fireEvent(elem, "show-dialog", {
    dialogTag: "smart-irrigation-confirmation-dialog",
    dialogImport: () => import("./dialogs/confirmation-dialog"),
    dialogParams: { target: target, message: message },
  });
}
export function showErrorDialog(
  ev: Event | HTMLElement,
  error: string | TemplateResult,
) {
  /*const elem = ev.hasOwnProperty("tagName")
    ? (ev as HTMLElement)
    : ((ev as Event).target as HTMLElement);*/
  const elem = ev as HTMLElement;
  fireEvent(elem, "show-dialog", {
    dialogTag: "smart-irrigation-error-dialog",
    dialogImport: () => import("./dialogs/error-dialog"),
    dialogParams: { error: error },
  });
}

export function handleError(err: any, ev: Event | HTMLElement) {
  const errorMessage = html`
    ${err.error}:${err.body.message ? html` ${err.body.message} ` : ""}
  `;
  showErrorDialog(ev, errorMessage);
}

export function Assign<Type extends {}>(
  obj: Type,
  changes: Partial<Type>,
): Type {
  Object.entries(changes).forEach(([key, val]) => {
    if (key in obj && typeof obj[key] == "object" && obj[key] !== null)
      obj = { ...obj, [key]: Assign(obj[key], val) };
    else obj = { ...obj, [key]: val };
  });
  return obj;
}

export function sortAlphabetically(
  a: string | { name: string },
  b: string | { name: string },
) {
  const stringVal = (s: string | { name: string }) =>
    typeof s === "object" ? stringVal(s.name) : s.trim().toLowerCase();
  return stringVal(a) < stringVal(b) ? -1 : 1;
}

export const navigate = (
  _node: any,
  path: string,
  replace: boolean = false,
) => {
  if (replace) {
    history.replaceState(null, "", path);
  } else {
    history.pushState(null, "", path);
  }
  fireEvent(window, "location-changed", {
    replace,
  });
};

/**
 * The name to show for a calculation engine.
 *
 * The engines are called PyETO, Passthrough and Static in the code, and those
 * names describe how they are implemented rather than what choosing one means.
 * The panel shows the intent instead: Manual for a number you give, Standard
 * for an evapotranspiration figure that already exists, Advanced for the full
 * calculation from your own weather sensors.
 *
 * An engine we do not recognise keeps its own name: a third party's should
 * appear as it calls itself rather than be forced into one of our three.
 */
const ENGINE_MODES: Record<string, string> = {
  Static: "manual",
  Passthrough: "standard",
  PyETO: "advanced",
};

export function engineModeLabel(
  engineName: string | undefined,
  lang: string,
): string {
  if (!engineName) return "";
  const mode = ENGINE_MODES[engineName];
  return mode ? localize(`common.modes.${mode}`, lang) : engineName;
}

/**
 * The fields an edit changed between two copies of a record, to send those
 * alone. Posting the whole record wrote the page's copy back over whatever the
 * server had done since it was loaded. A field cleared to undefined comes out
 * as null, since JSON drops undefined and the server would keep the old value.
 */
export function changedFields(
  previous: Record<string, unknown> | undefined,
  next: Record<string, unknown>,
): Record<string, unknown> {
  const changes: Record<string, unknown> = {};
  for (const key of new Set([
    ...Object.keys(previous ?? {}),
    ...Object.keys(next),
  ])) {
    if (JSON.stringify(previous?.[key]) !== JSON.stringify(next[key])) {
      changes[key] = next[key] === undefined ? null : next[key];
    }
  }
  return changes;
}
