export const VERSION = "v2025.10.0";
export const REPO = "https://github.com/jeroenterheerdt/HASmartIrrigation;";
export const ISSUES_URL = REPO + "/issues";

export const PLATFORM = "happy_irrigation";
export const DOMAIN = "happy_irrigation";
export const editConfigService = "edit_config";

export const CONF_CALC_TIME = "calctime";
export const CONF_AUTO_CALC_ENABLED = "autocalcenabled";
export const CONF_AUTO_UPDATE_ENABLED = "autoupdateenabled";
export const CONF_AUTO_UPDATE_SCHEDULE = "autoupdateschedule";
export const CONF_AUTO_UPDATE_TIME = "autoupdatefirsttime";
export const CONF_AUTO_UPDATE_INTERVAL = "autoupdateinterval";
export const CONF_AUTO_CLEAR_ENABLED = "autoclearenabled";
export const CONF_CLEAR_TIME = "cleardatatime";
export const CONF_CONTINUOUS_UPDATES = "continuousupdates";
export const CONF_SENSOR_DEBOUNCE = "sensor_debounce";

// Manual coordinate configuration
export const CONF_MANUAL_COORDINATES_ENABLED = "manual_coordinates_enabled";
export const CONF_MANUAL_LATITUDE = "manual_latitude";
export const CONF_MANUAL_LONGITUDE = "manual_longitude";
export const CONF_MANUAL_ELEVATION = "manual_elevation";

// Weather-based skip configuration
export const CONF_SKIP_IRRIGATION_ON_PRECIPITATION =
  "skip_irrigation_on_precipitation";
export const CONF_PRECIPITATION_THRESHOLD_MM = "precipitation_threshold_mm";

// Days between irrigation configuration
export const CONF_DAYS_BETWEEN_IRRIGATION = "days_between_irrigation";

// Irrigation start trigger configuration
export const CONF_IRRIGATION_START_TRIGGERS = "irrigation_start_triggers";
export const TRIGGER_TYPE_SUNRISE = "sunrise";
export const TRIGGER_TYPE_SUNSET = "sunset";
export const TRIGGER_TYPE_SOLAR_AZIMUTH = "solar_azimuth";
export const TRIGGER_CONF_TYPE = "type";
export const TRIGGER_CONF_OFFSET_MINUTES = "offset_minutes";
export const TRIGGER_CONF_AZIMUTH_ANGLE = "azimuth_angle";
export const TRIGGER_CONF_ENABLED = "enabled";
export const TRIGGER_CONF_NAME = "name";
export const TRIGGER_CONF_ACCOUNT_FOR_DURATION = "account_for_duration";

export const AUTO_UPDATE_SCHEDULE_MINUTELY = "minutes";
export const AUTO_UPDATE_SCHEDULE_HOURLY = "hours";
export const AUTO_UPDATE_SCHEDULE_DAILY = "days";
export const CONF_IMPERIAL = "imperial";
export const CONF_METRIC = "metric";

export const MAPPING_DEWPOINT = "Dewpoint";
export const MAPPING_EVAPOTRANSPIRATION = "Evapotranspiration";
export const MAPPING_HUMIDITY = "Humidity";
export const MAPPING_PRECIPITATION = "Precipitation";
export const MAPPING_CURRENT_PRECIPITATION = "Current Precipitation";
export const MAPPING_PRESSURE = "Pressure";
export const MAPPING_SOLRAD = "Solar Radiation";
export const MAPPING_TEMPERATURE = "Temperature";
export const MAPPING_WINDSPEED = "Windspeed";

export const MAPPING_CONF_SOURCE_WEATHER_SERVICE = "weather_service";
export const MAPPING_CONF_SOURCE_SENSOR = "sensor";
export const MAPPING_CONF_SOURCE_STATIC_VALUE = "static";
export const MAPPING_CONF_PRESSURE_TYPE = "pressure_type";
export const MAPPING_CONF_PRESSURE_ABSOLUTE = "absolute";
export const MAPPING_CONF_PRESSURE_RELATIVE = "relative";
export const MAPPING_CONF_SOURCE_NONE = "none";
export const MAPPING_CONF_SOURCE = "source";
export const MAPPING_CONF_SENSOR = "sensorentity";
export const MAPPING_CONF_STATIC_VALUE = "static_value";
export const MAPPING_CONF_UNIT = "unit";
export const MAPPING_DATA = "data";
export const MAPPING_CONF_AGGREGATE = "aggregate";
export const MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT = "average";
export const MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION = "delta";
export const MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_CURRENT_PRECIPITATION =
  "average";
export const MAPPING_CONF_AGGREGATE_OPTIONS = [
  "average",
  "first",
  "last",
  "maximum",
  "median",
  "minimum",
  "riemannsum",
  "sum",
  "delta",
];

export const UNIT_M2 = "m<sup>2</sup>";
export const UNIT_SQ_FT = "sq ft";
export const UNIT_LPM = "l/minute";
export const UNIT_GPM = "gal/minute";
export const UNIT_SECONDS = "s";
export const UNIT_DEGREES_C = "°C";
export const UNIT_DEGREES_F = "°F";
export const UNIT_MM = "mm";
export const UNIT_INCH = "in";
export const UNIT_PERCENT = "%";
export const UNIT_MBAR = "millibar";
export const UNIT_HPA = "hPa";
export const UNIT_PSI = "psi";
export const UNIT_INHG = "inch Hg";
export const UNIT_KMH = "km/h";
export const UNIT_MH = "mile/h";
export const UNIT_MS = "meter/s";
export const UNIT_W_M2 = "W/m2";
export const UNIT_W_SQFT = "W/sq ft";
export const UNIT_MJ_DAY_M2 = "MJ/day/m2";
export const UNIT_MJ_DAY_SQFT = "MJ/day/sq ft";
export const UNIT_MMH = "mm/h";
export const UNIT_INCHH = "in/h";

export const ZONE_ID = "id";
export const ZONE_NAME = "name";
export const ZONE_SIZE = "size";
export const ZONE_THROUGHPUT = "throughput";
export const ZONE_STATE = "state";
export const ZONE_DURATION = "duration";
export const ZONE_STATE_DISABLED = "disabled";
export const ZONE_STATE_MANUAL = "manual";
export const ZONE_STATE_AUTOMATIC = "automatic";
export const ZONE_MODULE = "module";
export const ZONE_BUCKET = "bucket";
export const ZONE_DELTA = "delta";
export const ZONE_EXPLANATION = "explanation";
export const ZONE_MULTIPLIER = "multiplier";
export const ZONE_MAPPING = "mapping";
export const ZONE_LEAD_TIME = "lead_time";
export const ZONE_MAXIMUM_DURATION = "maximum_duration";
export const ZONE_MAXIMUM_BUCKET = "maximum_bucket";
export const ZONE_DRAINAGE_RATE = "drainage_rate";
export const ZONE_CURRENT_DRAINAGE = "current_drainage";
