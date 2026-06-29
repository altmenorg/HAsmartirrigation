"""Store constants."""

VERSION = "v2026.7.0-beta2"
NAME = "Smart Irrigation"
MANUFACTURER = "@altmenorg"

DOMAIN = "smart_irrigation"
CUSTOM_COMPONENTS = "custom_components"

LANGUAGE_FILES_DIR = "frontend/localize/languages"
# Two-letter language codes for which the backend reads a translation file when
# building the calculation explanation. Regional variants (pt-BR, zh-Hans) are
# intentionally omitted: localize() lowercases the code, which would not match
# their file names, so they fall back to English here.
SUPPORTED_LANGUAGES = [
    "cs",
    "da",
    "de",
    "en",
    "es",
    "fi",
    "fr",
    "hu",
    "it",
    "nl",
    "no",
    "pl",
    "pt",
    "ru",
    "sk",
    "sv",
    "uk",
]

START_EVENT_FIRED_TODAY = "starteventfiredtoday"

# Irrigation start trigger configuration
CONF_IRRIGATION_START_TRIGGERS = "irrigation_start_triggers"
CONF_DEFAULT_IRRIGATION_START_TRIGGERS = []
# Which single configured trigger actually starts irrigation. The defined
# triggers are just the pool of options; this picks the active one. The
# sentinel "default" means a sunrise trigger offset by the total watering
# duration, so the run finishes right at sunrise.
START_TRIGGER_DEFAULT = "default"
CONF_ACTIVE_START_TRIGGER = "active_start_trigger"
CONF_DEFAULT_ACTIVE_START_TRIGGER = START_TRIGGER_DEFAULT

# Weather-based skip configuration
CONF_SKIP_IRRIGATION_ON_PRECIPITATION = "skip_irrigation_on_precipitation"
CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION = False
CONF_PRECIPITATION_THRESHOLD_MM = "precipitation_threshold_mm"
CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM = 2.0  # 2mm threshold

# Observed watering (closed-loop bucket): credit the bucket from a linked
# valve/switch entity's real run time instead of a manual reset automation.
CONF_OBSERVED_WATERING_ENABLED = "observed_watering_enabled"
CONF_DEFAULT_OBSERVED_WATERING_ENABLED = False

# Direct valve control: Smart Irrigation opens each zone's linked valve, waits
# the calculated duration, then closes it (optional executor). The start event
# still fires for external executors. Crediting is handled by the runner, and
# in-flight runs are persisted so a reboot mid-run can resume and credit.
CONF_DIRECT_VALVE_CONTROL_ENABLED = "direct_valve_control_enabled"
CONF_DEFAULT_DIRECT_VALVE_CONTROL_ENABLED = False
CONF_ZONE_SEQUENCING = "zone_sequencing"
CONF_ZONE_SEQUENCING_SEQUENTIAL = "sequential"
CONF_ZONE_SEQUENCING_PARALLEL = "parallel"
CONF_ZONE_SEQUENCING_OPTIONS = [
    CONF_ZONE_SEQUENCING_SEQUENTIAL,
    CONF_ZONE_SEQUENCING_PARALLEL,
]
CONF_DEFAULT_ZONE_SEQUENCING = CONF_ZONE_SEQUENCING_SEQUENTIAL
# Persisted list of in-flight direct-control runs (reboot resilience).
CONF_ACTIVE_VALVE_RUNS = "active_valve_runs"
# Keys inside an active-run record.
RUN_ZONE_ID = "zone_id"
RUN_ENTITY_ID = "entity_id"
RUN_STARTED = "started"
RUN_DURATION = "duration"

# Days between irrigation configuration
CONF_DAYS_BETWEEN_IRRIGATION = "days_between_irrigation"
CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION = 0  # 0 = no restriction (default behavior)
CONF_DAYS_SINCE_LAST_IRRIGATION = "days_since_last_irrigation"
CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION = 0

# Enhanced Scheduling Configuration
CONF_RECURRING_SCHEDULES = "recurring_schedules"
CONF_DEFAULT_RECURRING_SCHEDULES = []
CONF_SEASONAL_ADJUSTMENTS = "seasonal_adjustments"
CONF_DEFAULT_SEASONAL_ADJUSTMENTS = []

# Recurring Schedule Configuration
SCHEDULE_TYPE_DAILY = "daily"
SCHEDULE_TYPE_WEEKLY = "weekly"
SCHEDULE_TYPE_MONTHLY = "monthly"
SCHEDULE_TYPE_INTERVAL = "interval"
SCHEDULE_TYPES = [
    SCHEDULE_TYPE_DAILY,
    SCHEDULE_TYPE_WEEKLY,
    SCHEDULE_TYPE_MONTHLY,
    SCHEDULE_TYPE_INTERVAL,
]

# Recurring Schedule Keys
SCHEDULE_CONF_ID = "id"
SCHEDULE_CONF_NAME = "name"
SCHEDULE_CONF_TYPE = "type"
SCHEDULE_CONF_ENABLED = "enabled"
SCHEDULE_CONF_TIME = "time"
SCHEDULE_CONF_DAYS_OF_WEEK = "days_of_week"
SCHEDULE_CONF_DAY_OF_MONTH = "day_of_month"
SCHEDULE_CONF_INTERVAL_HOURS = "interval_hours"
SCHEDULE_CONF_START_DATE = "start_date"
SCHEDULE_CONF_END_DATE = "end_date"
SCHEDULE_CONF_ZONES = "zones"  # List of zone IDs or "all"
SCHEDULE_CONF_ACTION = "action"  # "calculate", "update", or "irrigate"

# Seasonal Adjustment Configuration
SEASONAL_CONF_ID = "id"
SEASONAL_CONF_NAME = "name"
SEASONAL_CONF_ENABLED = "enabled"
SEASONAL_CONF_MONTH_START = "month_start"
SEASONAL_CONF_MONTH_END = "month_end"
SEASONAL_CONF_MULTIPLIER_ADJUSTMENT = "multiplier_adjustment"
SEASONAL_CONF_THRESHOLD_ADJUSTMENT = "threshold_adjustment"
SEASONAL_CONF_ZONES = "zones"  # List of zone IDs or "all"

# Irrigation Unlimited Integration
CONF_IRRIGATION_UNLIMITED_INTEGRATION = "irrigation_unlimited_integration"
CONF_DEFAULT_IRRIGATION_UNLIMITED_INTEGRATION = False
CONF_IU_ENTITY_PREFIX = "iu_entity_prefix"
CONF_DEFAULT_IU_ENTITY_PREFIX = "binary_sensor.irrigation_unlimited"
CONF_IU_SYNC_SCHEDULES = "iu_sync_schedules"
CONF_DEFAULT_IU_SYNC_SCHEDULES = False
CONF_IU_SHARE_ZONE_DATA = "iu_share_zone_data"
CONF_DEFAULT_IU_SHARE_ZONE_DATA = False

# Trigger types
TRIGGER_TYPE_SUNRISE = "sunrise"
TRIGGER_TYPE_SUNSET = "sunset"
TRIGGER_TYPE_SOLAR_AZIMUTH = "solar_azimuth"
TRIGGER_TYPES = [TRIGGER_TYPE_SUNRISE, TRIGGER_TYPE_SUNSET, TRIGGER_TYPE_SOLAR_AZIMUTH]

# Trigger configuration keys
TRIGGER_CONF_TYPE = "type"
TRIGGER_CONF_OFFSET_MINUTES = "offset_minutes"
TRIGGER_CONF_AZIMUTH_ANGLE = "azimuth_angle"
TRIGGER_CONF_ENABLED = "enabled"
TRIGGER_CONF_NAME = "name"
TRIGGER_CONF_ACCOUNT_FOR_DURATION = "account_for_duration"

CONF_WEATHER_SERVICE = "weather_service"
CONF_WEATHER_SERVICE_API_KEY = "weather_service_api_key"
CONF_WEATHER_SERVICE_API_VERSION = "weather_service_api_version"
CONF_INSTANCE_NAME = "name"

# Manual coordinate configuration
CONF_MANUAL_COORDINATES_ENABLED = "manual_coordinates_enabled"
CONF_MANUAL_LATITUDE = "manual_latitude"
CONF_MANUAL_LONGITUDE = "manual_longitude"
CONF_MANUAL_ELEVATION = "manual_elevation"
CONF_DEFAULT_MANUAL_COORDINATES_ENABLED = False
CONF_REFERENCE_ET = "reference_evapotranspiration"
CONF_REFERENCE_ET_1 = "reference_evapotranspiration_1"
CONF_REFERENCE_ET_2 = "reference_evapotranspiration_2"
CONF_REFERENCE_ET_3 = "reference_evapotranspiration_3"
CONF_REFERENCE_ET_4 = "reference_evapotranspiration_4"
CONF_REFERENCE_ET_5 = "reference_evapotranspiration_5"
CONF_REFERENCE_ET_6 = "reference_evapotranspiration_6"
CONF_REFERENCE_ET_7 = "reference_evapotranspiration_7"
CONF_REFERENCE_ET_8 = "reference_evapotranspiration_8"
CONF_REFERENCE_ET_9 = "reference_evapotranspiration_9"
CONF_REFERENCE_ET_10 = "reference_evapotranspiration_10"
CONF_REFERENCE_ET_11 = "reference_evapotranspiration_11"
CONF_REFERENCE_ET_12 = "reference_evapotranspiration_12"
CONF_DEFAULT_REFERENCE_ET = 0.0
# V1 only, no longer used in V2
# CONF_MAXIMUM_ET = "maximum_et"
# DEFAULT_MAXIMUM_ET = 0

# Weather Services

CONF_WEATHER_SERVICE_OWM = "Open Weather Map"
CONF_WEATHER_SERVICE_PW = "Pirate Weather"
CONF_WEATHER_SERVICE_OM = "Open-Meteo"
# Services that do NOT need an API key (free, keyless).
CONF_WEATHER_SERVICES_NO_API_KEY = [CONF_WEATHER_SERVICE_OM]
# Services that can additionally provide solar radiation and reference ET0
# (so those fields may be sourced from the weather service in the UI).
CONF_WEATHER_SERVICES_WITH_SOLRAD_ET = [CONF_WEATHER_SERVICE_OM]
CONF_WEATHER_SERVICES = [
    CONF_WEATHER_SERVICE_OM,
    CONF_WEATHER_SERVICE_OWM,
    CONF_WEATHER_SERVICE_PW,
]

CONF_DEFAULT_USE_WEATHER_SERVICE = False
# Open-Meteo is the recommended default: free, keyless, and it supplies solar
# radiation + FAO-56 ET0 out of the box.
CONF_DEFAULT_WEATHER_SERVICE = CONF_WEATHER_SERVICE_OM
CONF_CALC_TIME = "calctime"
CONF_DEFAULT_CALC_TIME = "23:00"
CONF_AUTO_CALC_ENABLED = "autocalcenabled"
CONF_DEFAULT_AUTO_CALC_ENABLED = True
CONF_AUTO_UPDATE_ENABLED = "autoupdateenabled"
CONF_AUTO_UPDATE_SCHEDULE = "autoupdateschedule"
CONF_AUTO_UPDATE_MINUTELY = "minutes"
CONF_AUTO_UPDATE_HOURLY = "hours"
CONF_AUTO_UPDATE_DAILY = "days"
CONF_DEFAULT_AUTO_UPDATE_SCHEDULE = CONF_AUTO_UPDATE_HOURLY
CONF_DEFAULT_AUTO_UPDATE_ENABLED = True
CONF_AUTO_UPDATE_DELAY = "autoupdatedelay"
CONF_DEFAULT_AUTO_UPDATE_DELAY = "0"
CONF_AUTO_UPDATE_INTERVAL = "autoupdateinterval"
CONF_AUTO_CLEAR_ENABLED = "autoclearenabled"
CONF_DEFAULT_AUTO_CLEAR_ENABLED = True
CONF_CLEAR_TIME = "cleardatatime"
CONF_DEFAULT_CLEAR_TIME = "23:59"
CONF_DEFAULT_AUTO_UPDATE_INTERVAL = "1"
CONF_UNITS = "units"
CONF_IMPERIAL = "imperial"
CONF_METRIC = "metric"
CONF_USE_WEATHER_SERVICE = "use_weather_service"
CONF_DEFAULT_MAXIMUM_DURATION = (
    3600  # default maximum duration to one hour == 3600 seconds
)
CONF_DEFAULT_MAXIMUM_BUCKET = 24  # mm default maximum bucket of 24mm
CONF_DEFAULT_DRAINAGE_RATE = 50.8  # mm / hour (=2 inch per hour)
CONF_DEFAULT_CONTINUOUS_UPDATES = False  # continuous updates are disabled by default
CONF_CONTINUOUS_UPDATES = "continuousupdates"
CONF_SENSOR_DEBOUNCE = "sensor_debounce"
CONF_DEFAULT_SENSOR_DEBOUNCE = 100  # milliseconds, 0 = disabled

# PyETO specific config consts
CONF_PYETO_COASTAL = "coastal"
CONF_PYETO_SOLRAD_BEHAVIOR = "solrad_behavior"
CONF_PYETO_FORECAST_DAYS = "forecast_days"

CUSTOM_COMPONENTS = "custom_components"
INTEGRATION_FOLDER = DOMAIN
PANEL_FOLDER = "frontend"
PANEL_FILENAME = "dist/smart-irrigation.js"

PANEL_URL = f"/api/panel_custom/{DOMAIN}"
PANEL_TITLE = NAME
PANEL_ICON = "mdi:sprinkler"
PANEL_NAME = "smart-irrigation"

ATTR_REMOVE = "remove"
ATTR_CALCULATE = "calculate"
ATTR_CALCULATE_ALL = "calculate_all"
ATTR_SET_BUCKET = "set_bucket"
ATTR_NEW_BUCKET_VALUE = "new_bucket_value"
ATTR_SET_MULTIPLIER = "set_multiplier"
ATTR_NEW_MULTIPLIER_VALUE = "new_multiplier_value"
ATTR_NEW_THROUGHPUT_VALUE = "new_throughput_value"
ATTR_UPDATE = "update"
ATTR_UPDATE_ALL = "update_all"
ATTR_OVERRIDE_CACHE = "override_cache"
ATTR_RESET_ALL_BUCKETS = "reset_all_buckets"
ATTR_CLEAR_ALL_WEATHERDATA = "clear_all_weatherdata"
ATTR_NEW_STATE_VALUE = "new_state_value"
ATTR_NEW_DURATION_VALUE = "new_duration_value"
ATTR_DELETE_WEATHER_DATA = "delete_weather_data"

LIST_SET_ZONE_ALLOWED_ARGS = [
    ATTR_NEW_BUCKET_VALUE,
    ATTR_NEW_MULTIPLIER_VALUE,
    ATTR_NEW_DURATION_VALUE,
    ATTR_NEW_STATE_VALUE,
    ATTR_NEW_THROUGHPUT_VALUE,
]

ZONE_ID = "id"
ZONE_NAME = "name"
ZONE_SIZE = "size"
ZONE_THROUGHPUT = "throughput"
ZONE_STATE = "state"
ZONE_DURATION = "duration"
ZONE_STATE_DISABLED = "disabled"
ZONE_STATE_MANUAL = "manual"
ZONE_STATE_AUTOMATIC = "automatic"
ZONE_STATES = [ZONE_STATE_DISABLED, ZONE_STATE_MANUAL, ZONE_STATE_AUTOMATIC]
ZONE_MODULE = "module"
ZONE_BUCKET = "bucket"
ZONE_DELTA = "delta"
# Raw daily ET deficiency returned by the module, before interval scaling
# (hour_multiplier) and precipitation. Independent of the bucket and of bucket
# resets, so it is the value to watch when comparing sensor groups (issue #576).
ZONE_ET_DEFICIENCY = "et_deficiency"
ZONE_EXPLANATION = "explanation"
ZONE_MULTIPLIER = "multiplier"
ZONE_THROUGHPUT = "throughput"
ZONE_MAPPING = "mapping"
ZONE_LEAD_TIME = "lead_time"
ZONE_MAXIMUM_DURATION = "maximum_duration"
ZONE_MAXIMUM_BUCKET = "maximum_bucket"
ZONE_LAST_CALCULATED = "last_calculated"
ZONE_LAST_UPDATED = "last_updated"
ZONE_NUMBER_OF_DATA_POINTS = "number_of_data_points"
ZONE_DRAINAGE_RATE = "drainage_rate"
ZONE_CURRENT_DRAINAGE = "current_drainage"
# Timestamp of the last credited irrigation run, and cumulative water delivered
# (litres). Both set when a run credits the bucket (direct or observed).
ZONE_LAST_IRRIGATION = "last_irrigation"
ZONE_WATER_USED = "water_used"
# Optional valve/switch entity observed to credit the bucket (closed-loop).
ZONE_LINKED_ENTITY = "linked_entity"
# Optional cumulative volume/flow meter; credits the bucket by measured volume.
ZONE_FLOW_SENSOR = "flow_sensor"

MODULE_DIR = "calcmodules"
MODULE_ID = "id"
MODULE_NAME = "name"
MODULE_DESCRIPTION = "description"
MODULE_CONFIG = "config"
MODULE_SCHEMA = "schema"

CONF_IMPERIAL = "imperial"
CONF_METRIC = "metric"

MAPPING_ID = "id"
MAPPING_NAME = "name"
MAPPING_DATA = "data"
MAPPING_DATA_LAST_UPDATED = "data_last_updated"
MAPPING_DATA_LAST_ENTRY = "data_last_entry"
MAPPING_DATA_LAST_CALCULATION = "data_last_calculation"
MAPPING_DATA_MULTIPLIER = "data_multiplier"
MAPPING_MAPPINGS = "mappings"
MAPPING_TIMESTAMP = "timestamp"
MAPPING_DEWPOINT = "Dewpoint"
MAPPING_EVAPOTRANSPIRATION = "Evapotranspiration"
MAPPING_HUMIDITY = "Humidity"
MAPPING_MAX_TEMP = "Maximum Temperature"
MAPPING_MIN_TEMP = "Minimum Temperature"
MAPPING_PRECIPITATION = "Precipitation"
MAPPING_CURRENT_PRECIPITATION = "Current Precipitation"
MAPPING_PRESSURE = "Pressure"
MAPPING_SOLRAD = "Solar Radiation"
MAPPING_TEMPERATURE = "Temperature"
MAPPING_WINDSPEED = "Windspeed"

MAPPING_CONF_SOURCE_WEATHER_SERVICE = "weather_service"
MAPPING_CONF_SOURCE_SENSOR = "sensor"
MAPPING_CONF_SOURCE_NONE = "none"
MAPPING_CONF_SOURCE_STATIC_VALUE = "static"

MAPPING_CONF_SOURCE = "source"
MAPPING_CONF_SENSOR = "sensorentity"
MAPPING_CONF_STATIC_VALUE = "static_value"
MAPPING_CONF_UNIT = "unit"
MAPPING_CONF_PRESSURE_TYPE = "pressure_type"
MAPPING_CONF_PRESSURE_ABSOLUTE = "absolute"
MAPPING_CONF_PRESSURE_RELATIVE = "relative"
MAPPING_CONF_AGGREGATE = "aggregate"
MAPPING_CONF_AGGREGATE_AVERAGE = "average"
MAPPING_CONF_AGGREGATE_FIRST = "first"
MAPPING_CONF_AGGREGATE_LAST = "last"
MAPPING_CONF_AGGREGATE_MAXIMUM = "maximum"
MAPPING_CONF_AGGREGATE_MEDIAN = "median"
MAPPING_CONF_AGGREGATE_MINIMUM = "minimum"
MAPPING_CONF_AGGREGATE_SUM = "sum"
MAPPING_CONF_AGGREGATE_RIEMANNSUM = "riemannsum"
MAPPING_CONF_AGGREGATE_DELTA = "delta"
MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT = MAPPING_CONF_AGGREGATE_AVERAGE
MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION = MAPPING_CONF_AGGREGATE_DELTA
MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_MAX_TEMP = MAPPING_CONF_AGGREGATE_MAXIMUM
MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_MIN_TEMP = MAPPING_CONF_AGGREGATE_MINIMUM
MAPPING_CONF_AGGREGATE_OPTIONS = [
    MAPPING_CONF_AGGREGATE_AVERAGE,
    MAPPING_CONF_AGGREGATE_FIRST,
    MAPPING_CONF_AGGREGATE_LAST,
    MAPPING_CONF_AGGREGATE_MAXIMUM,
    MAPPING_CONF_AGGREGATE_MEDIAN,
    MAPPING_CONF_AGGREGATE_MINIMUM,
    MAPPING_CONF_AGGREGATE_SUM,
]

# For timestamps
RETRIEVED_AT = "retrieved"  # on weatherdata

EVENT_IRRIGATE_START = "start_irrigation_all_zones"
# Fired (as smart_irrigation_irrigation_started) when direct valve control
# begins running the zones, with the list about to be watered.
EVENT_IRRIGATE_STARTED = "irrigation_started"
# Fired (as smart_irrigation_irrigation_finished) once direct valve control has
# finished running every eligible zone, with a per-zone summary, so a single
# automation can send an end-of-watering report.
EVENT_IRRIGATE_FINISHED = "irrigation_finished"
# Fired (as smart_irrigation_zone_problem) when a direct-control valve fails to
# open, so users can wire a notification automation.
EVENT_ZONE_PROBLEM = "zone_problem"

UNIT_M2 = "m<sup>2</sup>"
UNIT_SQ_FT = "sq ft"
UNIT_LPM = "l/m"
UNIT_GPM = "gal/m"
UNIT_SECONDS = "s"
UNIT_MM = "mm"
UNIT_INCH = "in"
UNIT_PERCENT = "%"
UNIT_MBAR = "mbar"
UNIT_MILLIBAR = "millibar"
UNIT_HPA = "hPa"
UNIT_PSI = "psi"
UNIT_INHG = "inch Hg"
UNIT_KMH = "km/h"
UNIT_MH = "mile/h"
UNIT_MS = "meter/s"
UNIT_W_M2 = "W/m2"
UNIT_W_SQFT = "W/sq ft"
UNIT_MJ_DAY_M2 = "MJ/day/m2"
UNIT_MJ_DAY_SQFT = "MJ/day/sq ft"
UNIT_MMH = "mm/h"
UNIT_INCHH = "in/h"

# METRIC TO IMPERIAL (US) FACTORS
MM_TO_INCH_FACTOR = 0.03937008  # mm * factor = inch
LITER_TO_GALLON_FACTOR = 0.26417205  # l * factor = gal
M2_TO_SQ_FT_FACTOR = 10.7639104  # m2 * factor = sq ft
M_TO_FT_FACTOR = 3.2808399  # m * factor = ft
MBAR_TO_PSI_FACTOR = 0.01450377  # mbar = hpa * factor = psi
MBAR_TO_INHG_FACTOR = 0.029529983071445  # mbar = hpa * factor = inhg
KMH_TO_MILESH_FACTOR = 0.62137119  # kmh * factor = mph
MS_TO_MILESH_FACTOR = 2.23693629  # ms * factor = mph
W_M2_TO_W_SQ_FT_FACTOR = 0.09290304  # w/m2 * factor = w/sqft

# IMPERIAL (US) TO METRIC FACTORS
INCH_TO_MM_FACTOR = 25.4  # inch * factor = mm
GALLON_TO_LITER_FACTOR = 3.78541178  # gal * factor = l
SQ_FT_TO_M2_FACTOR = 0.0929030401442212  # sq ft * factor = m2
MILESH_TO_MS_FACTOR = 0.4470400004105615  # m/h * factor = ms
MILESH_TO_KMH_FACTOR = 1.609344  # m/h * factor = kmh
PSI_TO_HPA_FACTOR = 68.9475729  # psi * factor = hpa = mbar
INHG_TO_HPA_FACTOR = 33.8639  # inhg * factor = hpa = mbar
W_SQ_FT_TO_W_M2_FACTOR = 10.76391042  # w/sqft * factor = w/m2

# OTHER FACTORS
KMH_TO_MS_FACTOR = 0.277777777777778  # kmh * factor = ms
MS_TO_KMH_FACTOR = 3.6  # m/s * factor = kmh
W_TO_MJ_DAY_FACTOR = 0.0864  # w * factor = mj/day, same for w/m2 to mj/day/m2
K_TO_C_FACTOR = 273.15  # K-factor = C, C+factor=K
INHG_TO_PSI_FACTOR = 0.49115420057253  # inhg * factor = PSI
PSI_TO_INHG_FACTOR = 2.0360206576012  # psi * factor = inhg

SENSOR_ICON = "mdi:sprinkler"

# Services
SERVICE_CALCULATE_ALL_ZONES = "calculate_all_zones"
SERVICE_CALCULATE_ZONE = "calculate_zone"
SERVICE_UPDATE_ALL_ZONES = "update_all_zones"
SERVICE_UPDATE_ZONE = "update_zone"
SERVICE_RESET_BUCKET = "reset_bucket"
SERVICE_RESET_ALL_BUCKETS = "reset_all_buckets"
SERVICE_SET_BUCKET = "set_bucket"
SERVICE_SET_ALL_BUCKETS = "set_all_buckets"
SERVICE_SET_MULTIPLIER = "set_multiplier"
SERVICE_SET_ALL_MULTIPLIERS = "set_all_multipliers"
SERVICE_SET_ZONE = "set_zone"
SERVICE_ENTITY_ID = "entity_id"
SERVICE_CLEAR_WEATHERDATA = "clear_all_weather_data"
SERVICE_GENERATE_WATERING_CALENDAR = "generate_watering_calendar"
SERVICE_CREATE_RECURRING_SCHEDULE = "create_recurring_schedule"
SERVICE_UPDATE_RECURRING_SCHEDULE = "update_recurring_schedule"
SERVICE_DELETE_RECURRING_SCHEDULE = "delete_recurring_schedule"
SERVICE_CREATE_SEASONAL_ADJUSTMENT = "create_seasonal_adjustment"
SERVICE_UPDATE_SEASONAL_ADJUSTMENT = "update_seasonal_adjustment"
SERVICE_DELETE_SEASONAL_ADJUSTMENT = "delete_seasonal_adjustment"
SERVICE_SYNC_WITH_IRRIGATION_UNLIMITED = "sync_with_irrigation_unlimited"
SERVICE_SEND_ZONE_DATA_TO_IU = "send_zone_data_to_irrigation_unlimited"
SERVICE_GET_IU_SCHEDULE_STATUS = "get_irrigation_unlimited_status"

# Events
EVENT_RECURRING_SCHEDULE_TRIGGERED = "recurring_schedule_triggered"
EVENT_SEASONAL_ADJUSTMENT_APPLIED = "seasonal_adjustment_applied"
EVENT_IU_SYNC_COMPLETED = "irrigation_unlimited_sync_completed"
