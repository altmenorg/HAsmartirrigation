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
  services: string[];
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
  },
): Promise<{ success: boolean }> =>
  hass.callWS({
    type: DOMAIN + "/set_weatherservice",
    ...data,
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

// Backend API for watering calendar for a zone
export const fetchWateringCalendar = (
  hass: HomeAssistant,
  zone_id?: string,
): Promise<any[]> =>
  hass.callWS({
    type: DOMAIN + "/watering_calendar",
    zone_id: zone_id,
  });
