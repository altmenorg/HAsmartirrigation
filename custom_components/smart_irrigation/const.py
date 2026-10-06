"""Store constants."""

VERSION = "v2026.10.1"
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
# No start trigger at all: Smart Irrigation starts no watering. The way to block it.
START_TRIGGER_NONE = "none"
CONF_ACTIVE_START_TRIGGER = "active_start_trigger"
CONF_DEFAULT_ACTIVE_START_TRIGGER = START_TRIGGER_DEFAULT

# Weather-based skip configuration
CONF_SKIP_IRRIGATION_ON_PRECIPITATION = "skip_irrigation_on_precipitation"
CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION = False
CONF_PRECIPITATION_THRESHOLD_MM = "precipitation_threshold_mm"
CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM = 2.0  # 2mm threshold

# Conditions measured at the start of a run, each off by default. The
# thresholds are stored in C and km/h, None meaning the default, and shown in
# Home Assistant's unit system (F and mph in imperial). A reading is converted
# from its own unit.
# Freeze: do not water on frozen ground or into a freezing morning.
CONF_SKIP_ON_FREEZE = "skip_on_freeze"
CONF_DEFAULT_SKIP_ON_FREEZE = False
CONF_FREEZE_THRESHOLD = "freeze_threshold"
CONF_DEFAULT_FREEZE_THRESHOLD_C = 2.0
CONF_DEFAULT_FREEZE_THRESHOLD_F = 36.0
CONF_FREEZE_SENSOR = "freeze_sensor"  # None: the weather service's temperature
# Wind: a sprinkler in strong wind waters the path, not the bed.
CONF_SKIP_ON_WIND = "skip_on_wind"
CONF_DEFAULT_SKIP_ON_WIND = False
CONF_WIND_THRESHOLD = "wind_threshold"
CONF_DEFAULT_WIND_THRESHOLD_KMH = 20.0
CONF_DEFAULT_WIND_THRESHOLD_MPH = 12.0
CONF_WIND_SENSOR = "wind_sensor"  # None: the weather service's wind speed
# Rain sensor: a binary sensor that is on while it rains.
CONF_SKIP_ON_RAIN_SENSOR = "skip_on_rain_sensor"
CONF_DEFAULT_SKIP_ON_RAIN_SENSOR = False
CONF_RAIN_SENSOR = "rain_sensor"
# Shorten a run by the rain the rain sensor reported over the last few days,
# for a zone whose sensor group provides no precipitation in millimetres at all
# (see rain_history.py). Off by default, and never for a group that has real
# rain data: the bucket is the better answer wherever it can be used.
CONF_RAIN_HISTORY_ENABLED = "rain_history_enabled"
CONF_DEFAULT_RAIN_HISTORY_ENABLED = False

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
# "Full controller" mode (off by default): Smart Irrigation runs the whole
# watering itself, programs and all, what Irrigation Unlimited did beside it.
# It builds on direct valve control, which it switches on, and leaves everything
# as it was for whoever does not tick it.
CONF_FULL_CONTROLLER = "full_controller"
CONF_DEFAULT_FULL_CONTROLLER = False
# The programs of the full controller: an ordered list of dicts (see programs.py).
CONF_PROGRAMS = "programs"
CONF_DEFAULT_PROGRAMS = []
# The supplies of the full controller: pumps or main valves that run while a zone
# they feed is being watered (see supplies.py).
CONF_SUPPLIES = "supplies"
CONF_DEFAULT_SUPPLIES = []
CONF_ZONE_SEQUENCING = "zone_sequencing"
CONF_ZONE_SEQUENCING_SEQUENTIAL = "sequential"
CONF_ZONE_SEQUENCING_PARALLEL = "parallel"
CONF_ZONE_SEQUENCING_OPTIONS = [
    CONF_ZONE_SEQUENCING_SEQUENTIAL,
    CONF_ZONE_SEQUENCING_PARALLEL,
]
CONF_DEFAULT_ZONE_SEQUENCING = CONF_ZONE_SEQUENCING_SEQUENTIAL
# Cycle and soak: water a zone in several shorter passes with a pause between
# them, so the water has time to soak in instead of running off. One pass (the
# default) is the behaviour without it: a single run of the whole duration.
CONF_WATERING_PASSES = "watering_passes"
CONF_DEFAULT_WATERING_PASSES = 1
CONF_MAX_WATERING_PASSES = 6
# Minimum length of one pass. Splitting a short run into passes only wastes
# valve cycles, so the number of passes is reduced until each one reaches this.
MIN_PASS_SECONDS = 60
CONF_SOAK_MINUTES = "soak_minutes"
CONF_DEFAULT_SOAK_MINUTES = 15
# A pause between two zones of a sequential run, in seconds: time for the line
# pressure to recover, or for a slow valve to finish closing.
CONF_PAUSE_BETWEEN_ZONES = "pause_between_zones"
CONF_DEFAULT_PAUSE_BETWEEN_ZONES = 0
# Persisted list of in-flight direct-control runs (reboot resilience).
CONF_ACTIVE_VALVE_RUNS = "active_valve_runs"
# The sequential cycle under way (the zones still to water, in order), kept so a
# restart goes on with them instead of leaving them dry.
CONF_ACTIVE_CYCLE = "active_cycle"
# The program run under way: its plan and where it has got to, kept so a restart
# goes on with the steps still to do.
CONF_ACTIVE_PROGRAM_RUN = "active_program_run"
# The target of the occurrence each program schedule ran last, by "program:schedule".
# Kept apart from the programs, which the panel sends back whole: a copy of them
# read before a run would write the old marks over it.
CONF_PROGRAM_LAST_RUNS = "program_last_runs"
# When each program last really started watering, scheduled, manual or main:
# {"evening": iso}. The marks above say when a schedule fired, not when water ran.
CONF_PROGRAM_LAST_STARTED = "program_last_started"
# Until when the watering is paused (iso, UTC), kept so a restart goes on with
# the pause while it is still ahead. None when not paused.
CONF_PAUSE_UNTIL = "pause_until"
# The manual program runs waiting for their turn, kept so a restart does not lose
# them: [{"program_id": "evening", "seconds": None, "requested": iso}].
CONF_QUEUED_MANUAL_RUNS = "queued_manual_runs"
# A queued run older than this is dropped at startup (it is not wanted any more).
QUEUED_RUN_MAX_AGE_SECONDS = 6 * 3600
# A runtime adjustment of the duration of a program, set by the adjust_program
# service: {"evening": {"percent": 120.0, "seconds": None, "until": iso}}. Kept
# apart from the programs, which the panel sends back whole.
CONF_PROGRAM_ADJUSTMENTS = "program_adjustments"
ADJUST_PERCENT = "percent"
ADJUST_SECONDS = "seconds"
ADJUST_UNTIL = "until"
SERVICE_ADJUST_PROGRAM = "adjust_program"
ATTR_RESET = "reset"
# What is suspended until when: {"zone:3": iso, "program:evening": iso}. Kept apart
# from the zones and the programs, which the panel sends back whole.
CONF_SUSPENSIONS = "suspensions"
# What direct valve control was when the full controller was switched on (which
# forces it on), so that switching the controller off puts it back. None when the
# controller was never switched on, or the value was already used.
CONF_DIRECT_VALVE_BEFORE_FULL_CONTROLLER = "direct_valve_control_before_full_controller"
SUSPEND_ZONE = "zone"
SUSPEND_PROGRAM = "program"
# A cycle older than this is not resumed: it belongs to another day's watering.
CYCLE_RESUME_MAX_AGE_SECONDS = 6 * 3600
# Keys inside an active-run record.
RUN_ZONE_ID = "zone_id"
RUN_ENTITY_ID = "entity_id"
RUN_STARTED = "started"
RUN_DURATION = "duration"
# Seconds the valve was open when the run was interrupted by a reload: the valve
# is shut from then on, so the downtime is not water.
RUN_DELIVERED = "delivered"
# Keys inside a program of the full controller (see programs.py).
PROGRAM_ID = "id"
PROGRAM_NAME = "name"
PROGRAM_ENABLED = "enabled"
PROGRAM_MAIN = "main"
PROGRAM_STEPS = "steps"
# Seconds waited after a step, unless the step sets its own.
PROGRAM_DELAY = "delay"
# The whole list watered this many times, each with its share of the water.
PROGRAM_TOURS = "tours"
PROGRAM_SCHEDULES = "schedules"
# Keys inside a step of a program (see programs.py).
STEP_ID = "id"
STEP_ZONES = "zones"
STEP_MODE = "mode"
STEP_PERCENT = "percent"
STEP_SECONDS = "seconds"
# A zone watered in this many passes inside the step (cycle and soak).
STEP_PASSES = "passes"
STEP_DELAY = "delay"
STEP_ENABLED = "enabled"
# A zone of the step stops once this many litres have gone through its meter (0: no limit).
STEP_MAX_LITRES = "max_litres"
# Bounds and offset of the water of a step, in seconds (0: no bound). The offset is
# signed and added after the percentage, before the bounds.
STEP_MIN_SECONDS = "min_seconds"
STEP_MAX_SECONDS = "max_seconds"
STEP_ADJUST_SECONDS = "adjust_seconds"
# The step waters a zone only when its water deficit is at least this many mm (0: no
# threshold). Calculated and percent steps only; a fixed step always waters.
STEP_MIN_DEFICIT_MM = "min_deficit_mm"
# Why a step left a zone out of the run.
STEP_SKIP_BELOW_DEFICIT = "below_deficit"
# Keys inside a schedule of a program (see schedules.py).
SCHEDULE_ID = "id"
SCHEDULE_ENABLED = "enabled"
SCHEDULE_TYPE = "type"
SCHEDULE_TIME = "time"
SCHEDULE_EVENT = "event"
SCHEDULE_OFFSET_MINUTES = "offset_minutes"
SCHEDULE_ANCHOR = "anchor"
SCHEDULE_WEEKDAYS = "weekdays"
SCHEDULE_EVERY_N_DAYS = "every_n_days"
SCHEDULE_EVERY_OFFSET = "every_offset"
SCHEDULE_PARITY = "parity"
SCHEDULE_MONTHS = "months"
SCHEDULE_FROM = "from_date"
SCHEDULE_UNTIL = "until_date"
SCHEDULE_DAYS_OF_MONTH = "days_of_month"
SCHEDULE_FALLBACK_TIME = "fallback_time"
SCHEDULE_WEATHER = "weather"
# The skip conditions a schedule applies when it takes the weather into account
# (a list of ids from SKIP_CONDITION_IDS; absent: all of them).
SCHEDULE_SKIP_CONDITIONS = "skip_conditions"
# The ids of the skip conditions (see skip_conditions.py), in the order they are checked.
SKIP_CONDITION_IDS = (
    "postponed",
    "rain_sensor",
    "freeze",
    "wind",
    "precipitation",
    "days_between",
    "soil_moisture",
)
# The user's own "not now": it applies whenever the weather is taken into account.
SKIP_CONDITION_ALWAYS = "postponed"
# An end-anchored schedule whose finish is a hard limit: the run is cut there.
SCHEDULE_HARD_DEADLINE = "hard_deadline"
# Why a run was cut short, in the program_finished event and the log.
CUT_REASON_DEADLINE = "deadline"
# Keys inside a supply of the full controller (see supplies.py).
SUPPLY_ID = "id"
SUPPLY_NAME = "name"
SUPPLY_ENTITIES = "entities"
SUPPLY_DELAY_BEFORE = "delay_before"
SUPPLY_DELAY_AFTER = "delay_after"
SUPPLY_ENABLED = "enabled"
# A delay, before or after, is held to this many seconds either way.
SUPPLY_MAX_DELAY_SECONDS = 3600

# Days between irrigation configuration
CONF_DAYS_BETWEEN_IRRIGATION = "days_between_irrigation"
CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION = 0  # 0 = no restriction (default behavior)
CONF_DAYS_SINCE_LAST_IRRIGATION = "days_since_last_irrigation"
# How many days in a row the rain forecast has held the run back. Internal: not
# a setting, and not sent by the panel.
CONF_PRECIPITATION_SKIPS_IN_A_ROW = "precipitation_skips_in_a_row"
# After this many days held back by a forecast in a row, the run goes ahead:
# showers that keep being forecast and keep missing must not dry a zone out.
MAX_PRECIPITATION_SKIPS_IN_A_ROW = 2
# The forecast only holds a run back if the rain it expects covers at least this
# share of the largest deficit among the zones that would water: 3 mm forecast
# is no reason to hold back a zone 25 mm short.
PRECIPITATION_SKIP_DEFICIT_SHARE = 0.5
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
CONF_DEFAULT_IRRIGATION_UNLIMITED_INTEGRATION = False

# Trigger types
TRIGGER_TYPE_SUNRISE = "sunrise"
TRIGGER_TYPE_SUNSET = "sunset"
TRIGGER_TYPE_SOLAR_AZIMUTH = "solar_azimuth"
# A clock time rather than a solar event, for people who want irrigation to
# finish (or start) at the same time every day whatever the season.
TRIGGER_TYPE_TIME = "time"
TRIGGER_TYPES = [
    TRIGGER_TYPE_SUNRISE,
    TRIGGER_TYPE_SUNSET,
    TRIGGER_TYPE_SOLAR_AZIMUTH,
    TRIGGER_TYPE_TIME,
]

# Trigger configuration keys
TRIGGER_CONF_TYPE = "type"
TRIGGER_CONF_OFFSET_MINUTES = "offset_minutes"
TRIGGER_CONF_AZIMUTH_ANGLE = "azimuth_angle"
TRIGGER_CONF_ENABLED = "enabled"
TRIGGER_CONF_NAME = "name"
TRIGGER_CONF_ACCOUNT_FOR_DURATION = "account_for_duration"
# Clock time "HH:MM" for a time trigger.
TRIGGER_CONF_AT = "at"
TRIGGER_CONF_DEFAULT_AT = "06:00"

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
# Price the evapotranspiration of a calculation hour by hour (FAO-56 Eq. 53)
# instead of running the daily equation on the window and scaling it. Off by
# default while it is new: switching it on changes every zone's ET.
CONF_HOURLY_CALCULATION = "hourly_calculation"
CONF_DEFAULT_HOURLY_CALCULATION = False
# Shorten each zone's run by the rain forecast for the day after it starts (off
# by default). The skip on a forecast is all or nothing; this one is a credit.
CONF_FORECAST_RAIN_CREDIT = "forecast_rain_credit"
CONF_DEFAULT_FORECAST_RAIN_CREDIT = False
# Count only the rain that reaches the roots (off by default): a shower below a
# fifth of the evapotranspiration of the window wets the leaves and evaporates.
CONF_EFFECTIVE_RAIN = "effective_rain"
CONF_DEFAULT_EFFECTIVE_RAIN = False
# Calculate again just before the first start of the day (off by default), so a
# run at sunset waters on this afternoon's weather and not on last night's.
CONF_RECALCULATE_BEFORE_START = "recalculate_before_start"
CONF_DEFAULT_RECALCULATE_BEFORE_START = False
# Continuous updates used to do two things: record every sensor change, and
# calculate the zones again at every change, which moved the bucket (and the
# "accounts for duration" trigger) all day. The hourly calculation rebuilds every
# hour of the window whenever it runs, and the live estimate shows where a zone
# stands without writing anything, so the second part has nothing left to give.
# The option now records only; the scheduled calculation consumes the readings.
CONTINUOUS_UPDATES_RECALCULATE = False
# A calculation younger than this is as fresh as one could make it.
RECALCULATE_FRESH_MINUTES = 60
EFFECTIVE_RAIN_ET_SHARE = 0.2
# How far past the start of a run the forecast counts, in hours.
FORECAST_RAIN_CREDIT_HOURS = 24
# How much of the panel is shown. "standard" keeps the settings most
# installations never touch folded away; "advanced" shows everything, which is
# what every install had until now and what they keep.
CONF_UI_MODE = "ui_mode"
# Set once every zone has been given its own engine instance, so a setting
# that belongs to a zone stops being shared with the others.
CONF_ZONE_ENGINES_SPLIT = "zone_engines_split"
# Watering is postponed until this moment (ISO 8601). Rain that the forecast
# missed, a party on the lawn, a repair: the reasons are the user's, and the
# answer is one button rather than turning zones off and forgetting them on.
CONF_POSTPONE_UNTIL = "postpone_until"
SERVICE_POSTPONE_IRRIGATION = "postpone_irrigation"
SERVICE_RESUME_IRRIGATION = "resume_irrigation"
ATTR_HOURS = "hours"
CONF_UI_MODE_STANDARD = "standard"
CONF_UI_MODE_ADVANCED = "advanced"
CONF_SENSOR_DEBOUNCE = "sensor_debounce"
CONF_DEFAULT_SENSOR_DEBOUNCE = 100  # milliseconds, 0 = disabled

# Calculation audit log (#12): opt-in JSON Lines file with the complete input
# -> intermediate -> output chain of every calculation, so two days that look
# alike but water very differently can be diffed afterwards. Off by default;
# the file is size-capped and rotated so it can be left on for a season.
CONF_CALC_LOG_ENABLED = "calc_log_enabled"
CONF_DEFAULT_CALC_LOG_ENABLED = False
CALC_LOG_DIR = DOMAIN  # <config>/smart_irrigation/
CALC_LOG_FILENAME = "calc_log.jsonl"
CALC_LOG_MAX_BYTES = 2 * 1024 * 1024  # rotate at 2 MB, one backup kept
# Number of most recent records attached to the diagnostics download. Enough to
# cover the last few days of calculations without bloating the file.
CALC_LOG_DIAGNOSTICS_RECORDS = 50

# PyETO specific config consts
CONF_PYETO_COASTAL = "coastal"
CONF_PYETO_SOLRAD_BEHAVIOR = "solrad_behavior"
CONF_PYETO_FORECAST_DAYS = "forecast_days"

CUSTOM_COMPONENTS = "custom_components"
INTEGRATION_FOLDER = DOMAIN
PANEL_FOLDER = "frontend"
PANEL_FILENAME = "dist/smart-irrigation.js"

PANEL_URL = f"/api/panel_custom/{DOMAIN}"
# The translations are served as files rather than compiled into the bundle, so
# that a correction to one of them reaches a panel without the bundle being
# rebuilt. That is what makes community translation workable: a contributor
# edits one JSON file and nothing else. English stays in the bundle, as the
# fallback for every string a language is missing.
LANGUAGES_FOLDER = "localize/languages"
LANGUAGES_URL = f"/api/{DOMAIN}/languages"
PANEL_TITLE = NAME
PANEL_ICON = "mdi:sprinkler"
PANEL_NAME = "smart-irrigation"
# The companion Lovelace card, served by the integration and registered as a
# Lovelace resource, so it needs no HACS install and no hand-written entry.
CARD_FILENAME = "dist/smart-irrigation-card.js"
CARD_URL = f"/api/{DOMAIN}/card.js"
CARD_NAME = "smart-irrigation-card"

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
ATTR_DRY_RUN = "dry_run"

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
# This zone's own daily water need, ETc = ET0 x Kc, before interval scaling
# (hour_multiplier) and before precipitation. Independent of the bucket and of
# bucket resets, so it is the value to watch when comparing sensor groups
# (#576). It carries the crop factor because the bucket does, and a figure
# shown beside the bucket that disagrees with it explains nothing (#850).
ZONE_ET_DEFICIENCY = "et_deficiency"
# The reference evapotranspiration of the same run, without the crop factor:
# the positive figure a weather service quotes, kept so an installation can be
# compared against one. ZONE_ET_DEFICIENCY is this zone's own need, ET0 x Kc.
ZONE_ETO = "eto"
ZONE_EXPLANATION = "explanation"
ZONE_MULTIPLIER = "multiplier"
ZONE_THROUGHPUT = "throughput"
ZONE_MAPPING = "mapping"
# What the zone is made of and what grows in it, in words. They stand for the
# drainage rate and the crop coefficient, which is what the calculation reads
# (see presets.py).
ZONE_SOIL_TYPE = "soil_type"
ZONE_PLANT_TYPE = "plant_type"
ZONE_LEAD_TIME = "lead_time"
ZONE_MAXIMUM_DURATION = "maximum_duration"
ZONE_MAXIMUM_BUCKET = "maximum_bucket"
ZONE_LAST_CALCULATED = "last_calculated"
# How far this zone has consumed its sensor group's shared buffer. A group
# is read by several zones, so the buffer cannot be cleared when one of them
# calculates: each zone reads only what arrived after its own watermark, and
# the buffer is pruned to the oldest one instead of wiped.
ZONE_LAST_CONSUMED_AT = "last_consumed_at"
ZONE_LAST_UPDATED = "last_updated"
ZONE_NUMBER_OF_DATA_POINTS = "number_of_data_points"
ZONE_DRAINAGE_RATE = "drainage_rate"
ZONE_CURRENT_DRAINAGE = "current_drainage"
# Timestamp of the last credited irrigation run, and cumulative water delivered
# (litres). Both set when a run credits the bucket (direct or observed).
ZONE_LAST_IRRIGATION = "last_irrigation"
ZONE_WATER_USED = "water_used"
# Rain already accounted for by an asserted bucket value, subtracted at the next
# calculation so it is not credited twice (#811).
ZONE_PRECIPITATION_SUPERSEDED = "precipitation_superseded"
# Depth of soil moisture deficit to let build up before watering, in mm or inch
# (the management allowed depletion). 0 waters as soon as anything is missing.
ZONE_IRRIGATION_THRESHOLD = "irrigation_threshold"
CONF_DEFAULT_IRRIGATION_THRESHOLD = 0.0
# Days between irrigation for this zone alone (#875). None follows the general
# setting, a number replaces it for the zone and 0 means no restriction. The
# days since the zone was last watered are kept per zone as well; None means
# nothing has been recorded yet, which never holds a zone back.
# What the soil of the zone can hold for the plants, in mm (the total available
# water, TAW), and the share of it the plants may use up before they suffer (the
# allowed depletion, 50% unless set). Both are optional: without the first the
# deficit has no floor and the evapotranspiration is never reduced, as before.
ZONE_AVAILABLE_WATER = "available_water"
ZONE_ALLOWED_DEPLETION = "allowed_depletion"
CONF_DEFAULT_ALLOWED_DEPLETION = 50.0
# Share of the water leaving the emitters that reaches the plants, in percent.
# None is 100: the throughput is taken at its word, as before.
ZONE_DISTRIBUTION_EFFICIENCY = "distribution_efficiency"
# The crop factor of each month, January first, for a crop whose water use
# follows its growth (#872). A month left empty uses the zone's crop factor; the
# whole field empty is the zone's crop factor all year, as before. Seasonal
# adjustments still apply on top.
ZONE_CROP_FACTOR_BY_MONTH = "crop_factor_by_month"
ZONE_DAYS_BETWEEN_IRRIGATION = "days_between_irrigation"
ZONE_DAYS_SINCE_IRRIGATION = "days_since_irrigation"
# Optional valve/switch entity observed to credit the bucket (closed-loop).
ZONE_LINKED_ENTITY = "linked_entity"
# Optional hardware dead-man for direct valve control: an MQTT set-topic the
# runner publishes an "on with timed off" to, so the valve shuts itself off if
# Home Assistant dies mid-run and never sends the close (e.g. a zigbee2mqtt
# device supporting on_time). Empty = disabled; behaviour then is unchanged.
ZONE_SAFETY_OFF_TOPIC = "safety_off_topic"
# The supply (pump or main valve) a zone is fed from, by id. None: none.
ZONE_SUPPLY_ID = "supply_id"
# Other valves opened and closed together with the zone's linked one (full
# controller): a zone whose water comes through several valves.
ZONE_EXTRA_ENTITIES = "extra_entities"
# The state property the device expects in that payload; "state" for a
# single-channel device, "state_l1".."state_l4" for a multi-channel one.
ZONE_SAFETY_OFF_STATE_KEY = "safety_off_state_key"
CONF_DEFAULT_SAFETY_OFF_STATE_KEY = "state"
# Seconds added to a pass's own length for the on_time value, so the device's
# own auto-off lands just after Home Assistant's close rather than before it.
SAFETY_OFF_TIME_MARGIN = 30
# How the dead-man is chosen for a zone: "auto" uses the MQTT topic when there is
# one, else the ZHA on-with-timed-off when the valve is a ZHA entity, else none;
# "off" never arms one.
ZONE_SAFETY_OFF_MODE = "safety_off_mode"
SAFETY_OFF_MODE_AUTO = "auto"
SAFETY_OFF_MODE_OFF = "off"
# Opt in to the ZHA "on with timed off" command. Not automatic: a Sonoff SWV on
# ZHA opens on it but ignores the timer, so sending it would only look safe.
SAFETY_OFF_MODE_ZHA = "zha"
SAFETY_OFF_MODES = (SAFETY_OFF_MODE_AUTO, SAFETY_OFF_MODE_OFF, SAFETY_OFF_MODE_ZHA)
# ZHA: the On/Off cluster and its "on with timed off" command.
ZHA_PLATFORM = "zha"
ZHA_ON_OFF_CLUSTER = 6
ZHA_ON_WITH_TIMED_OFF = 0x42
# Optional cumulative volume/flow meter; credits the bucket by measured volume.
ZONE_FLOW_SENSOR = "flow_sensor"
# A soil moisture sensor, in %, and the moisture at or above which the zone
# sits out a run: the soil already holds what the bucket says it lacks.
ZONE_SOIL_MOISTURE_SENSOR = "soil_moisture_sensor"
ZONE_SOIL_MOISTURE_THRESHOLD = "soil_moisture_threshold"
CONF_DEFAULT_SOIL_MOISTURE_THRESHOLD = 50.0
# Throughput actually measured by the flow meter, smoothed over runs, in the
# user's volume-rate unit. Advisory only: it is never used to compute a
# duration, it only lets us tell the user their configured value is off.
ZONE_MEASURED_THROUGHPUT = "measured_throughput"
ZONE_MEASURED_THROUGHPUT_SAMPLES = "measured_throughput_samples"
# How the zone's precipitation rate is determined: from throughput+size, or
# entered directly
ZONE_INPUT_METHOD = "input_method"
ZONE_INPUT_METHOD_THROUGHPUT = "throughput"
ZONE_INPUT_METHOD_PRECIPITATION_RATE = "direct"
ZONE_INPUT_METHODS = [
    ZONE_INPUT_METHOD_THROUGHPUT,
    ZONE_INPUT_METHOD_PRECIPITATION_RATE,
]
CONF_DEFAULT_ZONE_INPUT_METHOD = ZONE_INPUT_METHOD_THROUGHPUT
# Directly entered precipitation rate (mm/h or in/h), used instead of
# throughput/size when input_method is ZONE_INPUT_METHOD_PRECIPITATION_RATE.
ZONE_PRECIPITATION_RATE = "precipitation_rate"

# Irrigation history: one record per credited run, feeding the panel's History
# tab. The zone name is stored alongside the id so a run keeps its label after
# the zone is renamed or deleted. Duration is in seconds, water in litres (the
# unit the run crediting works in); the panel converts for imperial users.
IRRIGATION_HISTORY = "irrigation_history"
HISTORY_START = "start"
HISTORY_ZONE_ID = "zone_id"
HISTORY_ZONE_NAME = "zone_name"
HISTORY_DURATION = "duration"
HISTORY_WATER_USED = "water_used"
# Older runs are pruned whenever a new one is recorded. The panel charts a
# month, so a quarter of history covers it with room to look further back while
# keeping the storage file small. The entry cap is a second guard for setups
# with many zones watering several times a day.
IRRIGATION_HISTORY_RETENTION_DAYS = 90
IRRIGATION_HISTORY_MAX_ENTRIES = 1000

# Sent by the panel when a zone is saved: how this zone is calculated, in the
# panel's words. It is not stored on the zone; it binds the engine behind it.
ZONE_CALCULATION_METHOD = "calculation_method"
ZONE_METHOD_CONFIG = "method_config"

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
# A sensor group describing an enclosed environment: a greenhouse, a polytunnel,
# anything under glass or plastic. There is no rain to collect and no sky worth
# asking a weather service about, so the settings that assume open air stop
# applying to the zones that use this group.
MAPPING_GREENHOUSE = "greenhouse"
# The daily equation prices a day. A window shorter than this, in hours, reads
# its weather over the last day instead (see _daily_context), and the rate it
# gives is scaled to the window as before.
DAILY_CONTEXT_MIN_HOURS = 20
# How long the readings are kept after every zone has consumed them, in hours:
# what a short window needs to read a whole day.
DAILY_CONTEXT_HOURS = 24
# A window longer than this, in hours, is priced one day at a time by the daily
# equation (see _days_of_the_window).
DAILY_SPLIT_MIN_HOURS = 28
# Weather data keys: the days of a long window, each (hours, weather), and the
# day a set of weather belongs to.
MAPPING_DATA_DAYS = "data_days"
MAPPING_DATA_DAY = "data_day"
# What a sensor can plausibly report, after conversion to the units the
# calculation works in. A reading outside is a glitch (a Zigbee sensor reporting
# 85 C, a gauge reporting -1 mm), and one such reading set a whole day's maximum
# temperature. It is dropped, with a warning, instead of being recorded.
PLAUSIBLE_RANGES = {
    "Temperature": (-60.0, 60.0),
    "Minimum Temperature": (-60.0, 60.0),
    "Maximum Temperature": (-60.0, 60.0),
    "Dewpoint": (-70.0, 50.0),
    "Humidity": (0.0, 105.0),
    "Pressure": (300.0, 1100.0),
    "Windspeed": (0.0, 75.0),
    "Solar Radiation": (0.0, 50.0),
    "Precipitation": (0.0, 100000.0),
    "Current Precipitation": (0.0, 500.0),
    "Evapotranspiration": (0.0, 25.0),
}
# A reading of these that has not been reported for longer than this is a
# sensor that stopped, not a value that held: a dead thermometer keeping its
# last state was recorded every hour, a flat day with maximum equal to minimum.
# Fields that can legitimately stay put for days (a rain total) are not checked.
STALE_FIELDS = ("Temperature", "Humidity", "Dewpoint")
STALE_AFTER_HOURS = 6
# The share of the sky's sun that reaches the plants under glass, for a
# greenhouse group with no radiation or illuminance sensor of its own: the sun is
# then estimated from the temperature range, which describes the sky outside.
# Glass and its frame let through roughly 60 to 70% (FAO-56 on protected crops).
GREENHOUSE_TRANSMISSION = 0.65
# Weather data key: a factor applied to an estimated solar radiation.
MAPPING_DATA_SOLRAD_FACTOR = "data_solrad_factor"
# Which engine this group's sources feed. The calculation reads it here in
# preference to the zone, so "this group produces ET this way" is a property
# of the group and the editor can show only the sources that engine consumes.
MAPPING_MODULE = "module"
CONF_DEFAULT_GREENHOUSE = False
MAPPING_DATA_MULTIPLIER = "data_multiplier"
# When the aggregated window ends: the last reading it holds is no later. The
# zone's watermark is set to it, so a reading arriving during the calculation
# is left for the next window instead of falling between the two.
MAPPING_DATA_WINDOW_END = "data_window_end"
MAPPING_MAPPINGS = "mappings"
MAPPING_TIMESTAMP = "timestamp"
MAPPING_DEWPOINT = "Dewpoint"
MAPPING_EVAPOTRANSPIRATION = "Evapotranspiration"
MAPPING_HUMIDITY = "Humidity"
MAPPING_MAX_TEMP = "Maximum Temperature"
MAPPING_MIN_TEMP = "Minimum Temperature"
MAPPING_PRECIPITATION = "Precipitation"
MAPPING_CURRENT_PRECIPITATION = "Current Precipitation"
# How many samples of the precipitation rate went into an aggregate. Each one
# reports the last hour, so it also says how many hours were actually observed.
MAPPING_CURRENT_PRECIPITATION_SAMPLES = "current_precipitation_samples"
# Rain that fell over the calculation interval according to the weather
# service's hourly history, in mm. Only Open-Meteo keeps one. It is a depth, so
# it takes the place of integrating the sampled rate (#835).
MAPPING_WEATHER_SERVICE_RAIN = "weather_service_rain"
MAPPING_PRESSURE = "Pressure"
MAPPING_SOLRAD = "Solar Radiation"
MAPPING_TEMPERATURE = "Temperature"
MAPPING_WINDSPEED = "Windspeed"

MAPPING_CONF_SOURCE_WEATHER_SERVICE = "weather_service"
MAPPING_CONF_SOURCE_SENSOR = "sensor"
MAPPING_CONF_SOURCE_NONE = "none"
MAPPING_CONF_SOURCE_STATIC_VALUE = "static"
# A light sensor standing in for a solar radiation sensor. Under glass or
# plastic there is no usable sky: no rain, no weather service worth asking, and
# no pyranometer in most greenhouses. An illuminance sensor placed inside is
# something people do have, and daylight has a roughly known luminous efficacy,
# so lux converts to W/m2 and FAO-56 gets the driving term it is missing.
MAPPING_CONF_SOURCE_ILLUMINANCE = "illuminance"
# Sources whose value is read from a Home Assistant entity.
MAPPING_CONF_SENSOR_BACKED_SOURCES = (
    MAPPING_CONF_SOURCE_SENSOR,
    MAPPING_CONF_SOURCE_ILLUMINANCE,
)

MAPPING_CONF_SOURCE = "source"
MAPPING_CONF_SENSOR = "sensorentity"
MAPPING_CONF_STATIC_VALUE = "static_value"
# A luminous efficacy stored by an earlier version of the panel for a group. The
# panel no longer offers it: the efficacy follows the sky (see illuminance.py).
# A group that stored one keeps it.
MAPPING_CONF_LUMINOUS_EFFICACY = "luminous_efficacy"
MAPPING_CONF_UNIT = "unit"
MAPPING_CONF_PRESSURE_TYPE = "pressure_type"
# How high a wind sensor is mounted, in metres. The equations want the wind at
# 2 m, and a weather station usually stands at 5 to 10 m, where it blows about a
# third harder. Empty means the sensor is taken as it reads, as before.
MAPPING_CONF_WIND_HEIGHT = "wind_height"
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
# A program of the full controller started or ended, whoever started it.
EVENT_PROGRAM_STARTED = "program_started"
EVENT_PROGRAM_FINISHED = "program_finished"
# Fired (as smart_irrigation_irrigation_finished) once direct valve control has
# finished running every eligible zone, with a per-zone summary, so a single
# automation can send an end-of-watering report.
EVENT_IRRIGATE_FINISHED = "irrigation_finished"
# Fired (as smart_irrigation_zone_problem) when a direct-control valve fails to
# open, so users can wire a notification automation.
EVENT_ZONE_PROBLEM = "zone_problem"
# A supply (pump or main valve) that did not do what it was told.
EVENT_SUPPLY_PROBLEM = "supply_problem"
# Every switch of a valve or a supply by the full controller.
EVENT_VALVE_ON = "valve_on"
EVENT_VALVE_OFF = "valve_off"
# A valve that was held open reads closed before its time (full controller).
EVENT_VALVE_OUT_OF_SYNC = "valve_out_of_sync"
# Fired (as smart_irrigation_irrigation_skipped) when a start trigger is reached
# and the day is a skip day, so a skipped run is something an automation can see
# rather than an event that simply never arrives (#841).
EVENT_IRRIGATE_SKIPPED = "irrigation_skipped"
# Fired (as smart_irrigation_weather_stale) once when a weather field of a sensor
# group stops reporting, and (as smart_irrigation_weather_recovered) once when it
# is back.
EVENT_WEATHER_STALE = "weather_stale"
EVENT_WEATHER_RECOVERED = "weather_recovered"

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
UNIT_KNOTS = "knot"
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
KNOTS_TO_MS_FACTOR = 0.5144444444444445  # knot * factor = m/s (1852 m per hour)
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
SERVICE_CREDIT_WATERING = "credit_watering"
SERVICE_RUN_PROGRAM = "run_program"
SERVICE_STOP_WATERING = "stop_watering"
SERVICE_PAUSE_WATERING = "pause_watering"
SERVICE_RESUME_WATERING = "resume_watering"
SERVICE_NEXT_STEP = "next_step"
SERVICE_SUSPEND = "suspend"
SERVICE_WATER_ZONE = "water_zone"
SERVICE_USE_MEASURED_THROUGHPUT = "use_measured_throughput"
SERVICE_STOP_PROGRAM = "stop_program"
SERVICE_SET_PROGRAM_ENABLED = "set_program_enabled"
SERVICE_SET_STEP_ENABLED = "set_step_enabled"
SERVICE_SET_SCHEDULE_ENABLED = "set_schedule_enabled"
ATTR_MODE = "mode"
ATTR_STEP_ID = "step_id"
ATTR_SCHEDULE_ID = "schedule_id"
ATTR_ENABLED = "enabled"
# What a manual run does when something is already watering.
RUN_MODE_QUEUE = "queue"
RUN_MODE_REPLACE = "replace"
ATTR_PROGRAM_ID = "program_id"
ATTR_SECONDS = "seconds"
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

# Events
EVENT_RECURRING_SCHEDULE_TRIGGERED = "recurring_schedule_triggered"
EVENT_SEASONAL_ADJUSTMENT_APPLIED = "seasonal_adjustment_applied"

# A zone whose bucket stays dry while no program will water it (full controller).
# "Dry" is a deficit of at least this share of the zone's maximum bucket, or the
# zone's irrigation threshold when that is larger; a floor keeps a zone with
# neither set from alerting on a trace of deficit.
DRY_ZONE_DEFICIT_SHARE = 0.5
DRY_ZONE_MIN_DEFICIT_MM = 1.0
# Dry and uncovered for more than this many days before the notice is raised.
DRY_ZONE_AFTER_DAYS = 3
# Fired (as smart_irrigation_zone_unwatered) when the notice is first raised.
EVENT_ZONE_UNWATERED = "zone_unwatered"
