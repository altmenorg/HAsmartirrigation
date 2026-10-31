import { HomeAssistant } from "custom-card-helpers";
import {
  SmartIrrigationConfig,
  SmartIrrigationZone,
  SmartIrrigationModule,
  SmartIrrigationMapping,
} from "../types";
import { DOMAIN } from "../const";

export const fetchConfig = (
  hass: HomeAssistant,
): Promise<SmartIrrigationConfig> =>
  hass.callWS({
    type: DOMAIN + "/config",
  });

export const saveConfig = (
  hass: HomeAssistant,
  config: Partial<SmartIrrigationConfig>,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/config", config);
};

// Full configuration backup: {version, config, zones, modules, mappings}.
export const exportConfig = (hass: HomeAssistant): Promise<any> =>
  hass.callApi("GET", DOMAIN + "/export");

export const restoreConfig = (
  hass: HomeAssistant,
  backup: any,
): Promise<{ success: boolean; error?: string }> =>
  hass.callApi("POST", DOMAIN + "/restore", backup);

export interface WeatherServiceInfo {
  use_weather_service: boolean;
  weather_service: string | null;
  weather_service_api_key: string | null;
  weather_service_entity?: string | null;
  services: string[];
  supplies_rain?: boolean;
}

export const fetchWeatherService = (
  hass: HomeAssistant,
): Promise<WeatherServiceInfo> =>
  hass.callWS({
    type: DOMAIN + "/weatherservice",
  });

export const setWeatherService = (
  hass: HomeAssistant,
  data: {
    use_weather_service: boolean;
    weather_service?: string | null;
    weather_service_api_key?: string | null;
    weather_service_entity?: string | null;
  },
): Promise<{ success: boolean }> =>
  hass.callWS({
    type: DOMAIN + "/set_weatherservice",
    ...data,
  });

export interface WeatherServiceHistoryRecord {
  retrieved: string | null;
  mapping_id?: number;
  mapping_name?: string;
  values: Record<string, number>;
}

export interface WeatherServiceHistory {
  // Weather value keys, in the order the table should show them.
  fields: string[];
  records: WeatherServiceHistoryRecord[];
}

export const fetchWeatherServiceHistory = (
  hass: HomeAssistant,
  limit = 20,
): Promise<WeatherServiceHistory> =>
  hass.callWS({
    type: DOMAIN + "/weatherservice_history",
    limit: limit,
  });

/*export const fetchZones = (
  hass: HomeAssistant
): Promise<Dictionary<SmartIrrigationZone>> =>*/
export const fetchZones = (
  hass: HomeAssistant,
): Promise<SmartIrrigationZone[]> =>
  hass.callWS({
    type: DOMAIN + "/zones",
  });

export const saveZone = (
  hass: HomeAssistant,
  config: Partial<SmartIrrigationZone>,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", config);
};

export const calculateZone = (
  hass: HomeAssistant,
  zone_id: string,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    id: zone_id,
    calculate: true,
    override_cache: true,
  });
};

export const updateZone = (
  hass: HomeAssistant,
  zone_id: string,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    id: zone_id,
    update: true,
  });
};
export const calculateAllZones = (hass: HomeAssistant): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    calculate_all: true,
  });
};

export const updateAllZones = (hass: HomeAssistant): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    update_all: true,
  });
};

export const resetAllBuckets = (hass: HomeAssistant): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    reset_all_buckets: true,
  });
};

export const clearAllWeatherdata = (hass: HomeAssistant): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    clear_all_weatherdata: true,
  });
};

export const deleteZone = (
  hass: HomeAssistant,
  zone_id: string,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/zones", {
    id: zone_id,
    remove: true,
  });
};

export const fetchModules = (
  hass: HomeAssistant,
): Promise<SmartIrrigationModule[]> =>
  hass.callWS({
    type: DOMAIN + "/modules",
  });

export const fetchAllModules = (
  hass: HomeAssistant,
): Promise<SmartIrrigationModule[]> =>
  hass.callWS({
    type: DOMAIN + "/allmodules",
  });

export const saveModule = (
  hass: HomeAssistant,
  config: Partial<SmartIrrigationModule>,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/modules", config);
};

export const deleteModule = (
  hass: HomeAssistant,
  module_id: string,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/modules", {
    id: module_id,
    remove: true,
  });
};

export const fetchMappings = (
  hass: HomeAssistant,
): Promise<SmartIrrigationMapping[]> =>
  hass.callWS({
    type: DOMAIN + "/mappings",
  });
export const saveMapping = (
  hass: HomeAssistant,
  config: Partial<SmartIrrigationMapping>,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/mappings", config);
};

export const deleteMapping = (
  hass: HomeAssistant,
  mapping_id: string,
): Promise<boolean> => {
  return hass.callApi("POST", DOMAIN + "/mappings", {
    id: mapping_id,
    remove: true,
  });
};

// Backend API for irrigation info
export const fetchIrrigationInfo = (hass: HomeAssistant): Promise<any> =>
  hass.callWS({
    type: DOMAIN + "/info",
  });

// Backend API for weather records for a mapping
export const fetchMappingWeatherRecords = (
  hass: HomeAssistant,
  mapping_id: string,
  limit: number = 10,
): Promise<any[]> =>
  hass.callWS({
    type: DOMAIN + "/weather_records",
    mapping_id: mapping_id,
    limit: limit,
  });

/**
 * One completed irrigation run. ``start`` is an ISO 8601 UTC timestamp (when
 * the water started flowing), ``duration`` is in seconds and ``water_used`` in
 * litres — the panel converts to the user's units for display.
 */
export interface IrrigationHistoryRecord {
  start: string | null;
  zone_id: number | null;
  zone_name: string | null;
  duration: number;
  water_used: number;
}

export interface IrrigationHistory {
  records: IrrigationHistoryRecord[];
}

export const fetchIrrigationHistory = (
  hass: HomeAssistant,
  limit = 500,
): Promise<IrrigationHistory> =>
  hass.callWS({
    type: DOMAIN + "/irrigation_history",
    limit: limit,
  });

// Backend API for watering calendar for a zone
export const fetchWateringCalendar = (
  hass: HomeAssistant,
  zone_id?: string,
): Promise<any[]> =>
  hass.callWS({
    type: DOMAIN + "/watering_calendar",
    zone_id: zone_id,
  });

/** One IU configuration there is to import. */
export interface IuImportSource {
  id: string;
  title: string;
  error?: string;
}

/** What an import does with one IU zone. */
export interface IuImportZone {
  key: string;
  name: string;
  action: "create" | "update" | "use";
  zone_id: number | null;
  zone_name?: string | null;
  reason: "valve" | "blueprint" | "name" | "imported" | "chosen" | null;
  fields: Record<string, unknown>;
}

export interface IuImportProgram {
  action: "create" | "update";
  schedules_on: boolean;
  program: {
    id: string;
    name: string;
    enabled: boolean;
    steps: {
      zones: string[];
      mode: "fixed" | "calculated";
      seconds?: number;
      passes?: number;
      enabled?: boolean;
    }[];
    schedules: Record<string, any>[];
    delay?: number;
    tours?: number;
  };
  zone_names: string[][];
}

export interface IuImportReportItem {
  path: string;
  outcome: "approximated" | "not_carried" | "unknown";
  /** The note in English, as the backend writes it. */
  note: string;
  subject: string;
  /** The note's code (``panels.iu_import.notes.<code>``) and its values. */
  code?: string;
  params?: Record<string, string | number>;
}

export type IuImportConflict =
  | { code: "zone_twice"; key: string; other: string; zone_id: number }
  | { code: "calculated_needs_zone"; key: string }
  | { code: "program_exists" | "supply_exists"; id: string; name: string };

export interface IuImportPreview {
  source: string;
  supplies: {
    action: "create" | "update";
    supply: { id: string; name: string; entities: string[] };
  }[];
  zones: IuImportZone[];
  programs: IuImportProgram[];
  removed: { programs: string[]; supplies: string[] };
  removed_names: { programs: string[]; supplies: string[] };
  /** What stops the import until it is resolved; apply refuses meanwhile. */
  conflicts: IuImportConflict[];
  zones_left: number[];
  links: number;
  previous: { source?: string; at?: string };
  report: { items: IuImportReportItem[]; counts: Record<string, number> };
  fingerprint: string;
}

export interface IuImportRequest {
  source?: string | null;
  yaml?: string | null;
  matches?: Record<string, number | "new">;
}

export interface IuImportResult {
  zones_created: number[];
  zones_updated: number[];
  programs: string[];
  programs_removed: string[];
  supplies: string[];
}

/** The Irrigation Unlimited configurations there are to import. */
export const iuImportSources = (
  hass: HomeAssistant,
): Promise<{ sources: IuImportSource[] }> =>
  hass.callWS({ type: DOMAIN + "/iu_import/sources" });

/** What importing an Irrigation Unlimited configuration would do. */
export const iuImportPreview = (
  hass: HomeAssistant,
  request: IuImportRequest,
): Promise<IuImportPreview> =>
  hass.callWS({ type: DOMAIN + "/iu_import/preview", ...request });

/** Import it, as the preview with this fingerprint showed it. */
export const iuImportApply = (
  hass: HomeAssistant,
  request: IuImportRequest & { fingerprint: string },
): Promise<IuImportResult> =>
  hass.callWS({ type: DOMAIN + "/iu_import/apply", ...request });

/** An automation or script that still uses Irrigation Unlimited. */
export interface IuFollowUp {
  kind: "automation" | "script";
  entity_id: string | null;
  name: string | null;
  edit: string | null;
  uses: string[];
  /** It hands IU a duration Smart Irrigation calculated: no longer needed. */
  adjust_time: boolean;
}

/** Where the move from Irrigation Unlimited stands. */
export interface IuImportStatus {
  imported: boolean;
  at: string | null;
  full_controller: boolean;
  programs: { id: string; name: string; schedules: number; on: number }[];
  schedules_on: number;
  switched_over: boolean;
  switched_at: string | null;
  iu_running: boolean;
  controllers: { entity_id: string; name: string; enabled: boolean | null }[];
  /** Who waters, read from what is on: IU's controllers, our schedules. */
  waters: "irrigation_unlimited" | "smart_irrigation" | "both" | "none";
  both_on: boolean;
  /** Zones IU runs switched off that a step of an imported sequence waters. */
  zones_off_in_iu?: { zone: string; program: string }[];
  follow_ups: IuFollowUp[];
}

export const iuImportStatus = (hass: HomeAssistant): Promise<IuImportStatus> =>
  hass.callWS({ type: DOMAIN + "/iu_import/status" });

/** Hand the watering to Smart Irrigation, or back to Irrigation Unlimited. */
export const iuImportCutover = (
  hass: HomeAssistant,
  to: "smart_irrigation" | "irrigation_unlimited",
): Promise<{
  controllers: string[];
  /** Left off: IU had them switched off. */
  left_off?: string[];
  /** Left off: no record of which of their schedules IU had on. */
  unrecorded?: string[];
}> => hass.callWS({ type: DOMAIN + "/iu_import/cutover", to });
