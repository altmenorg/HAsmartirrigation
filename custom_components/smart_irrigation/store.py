"""Storage and management for Smart Irrigation configuration, zones, modules, and mappings."""

import datetime
import json
import logging
from collections import OrderedDict
from collections.abc import MutableMapping
from typing import cast

import attr
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.storage import Store
from homeassistant.loader import bind_hass
from homeassistant.util.unit_system import METRIC_SYSTEM

from .const import (
    ATTR_NEW_BUCKET_VALUE,
    ATTR_NEW_MULTIPLIER_VALUE,
    CONF_ACTIVE_START_TRIGGER,
    CONF_ACTIVE_VALVE_RUNS,
    CONF_AUTO_CALC_ENABLED,
    CONF_AUTO_CLEAR_ENABLED,
    CONF_AUTO_UPDATE_DELAY,
    CONF_AUTO_UPDATE_ENABLED,
    CONF_AUTO_UPDATE_INTERVAL,
    CONF_AUTO_UPDATE_SCHEDULE,
    CONF_CALC_LOG_ENABLED,
    CONF_CALC_TIME,
    CONF_CLEAR_TIME,
    CONF_CONTINUOUS_UPDATES,
    CONF_DAYS_BETWEEN_IRRIGATION,
    CONF_DAYS_SINCE_LAST_IRRIGATION,
    CONF_DEFAULT_ACTIVE_START_TRIGGER,
    CONF_DEFAULT_AUTO_CALC_ENABLED,
    CONF_DEFAULT_AUTO_CLEAR_ENABLED,
    CONF_DEFAULT_AUTO_UPDATE_DELAY,
    CONF_DEFAULT_AUTO_UPDATE_ENABLED,
    CONF_DEFAULT_AUTO_UPDATE_INTERVAL,
    CONF_DEFAULT_AUTO_UPDATE_SCHEDULE,
    CONF_DEFAULT_CALC_LOG_ENABLED,
    CONF_DEFAULT_CALC_TIME,
    CONF_DEFAULT_CLEAR_TIME,
    CONF_DEFAULT_CONTINUOUS_UPDATES,
    CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION,
    CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION,
    CONF_DEFAULT_DIRECT_VALVE_CONTROL_ENABLED,
    CONF_DEFAULT_DRAINAGE_RATE,
    CONF_DEFAULT_GREENHOUSE,
    CONF_DEFAULT_HOURLY_CALCULATION,
    CONF_DEFAULT_IRRIGATION_START_TRIGGERS,
    CONF_DEFAULT_IRRIGATION_THRESHOLD,
    CONF_DEFAULT_MAXIMUM_BUCKET,
    CONF_DEFAULT_MAXIMUM_DURATION,
    CONF_DEFAULT_OBSERVED_WATERING_ENABLED,
    CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
    CONF_DEFAULT_RECURRING_SCHEDULES,
    CONF_DEFAULT_SEASONAL_ADJUSTMENTS,
    CONF_DEFAULT_SENSOR_DEBOUNCE,
    CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_DEFAULT_SKIP_ON_FREEZE,
    CONF_DEFAULT_SKIP_ON_RAIN_SENSOR,
    CONF_DEFAULT_SKIP_ON_WIND,
    CONF_DEFAULT_SOIL_MOISTURE_THRESHOLD,
    CONF_DEFAULT_USE_WEATHER_SERVICE,
    CONF_DEFAULT_WEATHER_SERVICE,
    CONF_DEFAULT_ZONE_INPUT_METHOD,
    CONF_DEFAULT_ZONE_SEQUENCING,
    CONF_DIRECT_VALVE_CONTROL_ENABLED,
    CONF_FREEZE_SENSOR,
    CONF_FREEZE_THRESHOLD,
    CONF_HOURLY_CALCULATION,
    CONF_IMPERIAL,
    CONF_IRRIGATION_START_TRIGGERS,
    CONF_MANUAL_COORDINATES_ENABLED,
    CONF_MANUAL_ELEVATION,
    CONF_MANUAL_LATITUDE,
    CONF_MANUAL_LONGITUDE,
    CONF_METRIC,
    CONF_OBSERVED_WATERING_ENABLED,
    CONF_POSTPONE_UNTIL,
    CONF_PRECIPITATION_THRESHOLD_MM,
    CONF_RAIN_SENSOR,
    CONF_RECURRING_SCHEDULES,
    CONF_SEASONAL_ADJUSTMENTS,
    CONF_SENSOR_DEBOUNCE,
    CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_SKIP_ON_FREEZE,
    CONF_SKIP_ON_RAIN_SENSOR,
    CONF_SKIP_ON_WIND,
    CONF_UI_MODE,
    CONF_UI_MODE_ADVANCED,
    CONF_UI_MODE_STANDARD,
    CONF_UNITS,
    CONF_USE_WEATHER_SERVICE,
    CONF_WEATHER_SERVICE,
    CONF_WEATHER_SERVICE_OWM,
    CONF_WIND_SENSOR,
    CONF_WIND_THRESHOLD,
    CONF_ZONE_ENGINES_SPLIT,
    CONF_ZONE_SEQUENCING,
    DOMAIN,
    HISTORY_DURATION,
    HISTORY_START,
    HISTORY_WATER_USED,
    HISTORY_ZONE_ID,
    HISTORY_ZONE_NAME,
    IRRIGATION_HISTORY,
    IRRIGATION_HISTORY_MAX_ENTRIES,
    IRRIGATION_HISTORY_RETENTION_DAYS,
    MAPPING_CONF_SENSOR,
    MAPPING_CONF_SOURCE,
    MAPPING_CONF_SOURCE_NONE,
    MAPPING_CONF_SOURCE_SENSOR,
    MAPPING_CONF_SOURCE_WEATHER_SERVICE,
    MAPPING_CONF_UNIT,
    MAPPING_CURRENT_PRECIPITATION,
    MAPPING_DATA,
    MAPPING_DATA_LAST_CALCULATION,
    MAPPING_DATA_LAST_ENTRY,
    MAPPING_DATA_LAST_UPDATED,
    MAPPING_DEWPOINT,
    MAPPING_EVAPOTRANSPIRATION,
    MAPPING_GREENHOUSE,
    MAPPING_HUMIDITY,
    MAPPING_ID,
    MAPPING_MAPPINGS,
    MAPPING_MAX_TEMP,
    MAPPING_MIN_TEMP,
    MAPPING_MODULE,
    MAPPING_NAME,
    MAPPING_PRECIPITATION,
    MAPPING_PRESSURE,
    MAPPING_SOLRAD,
    MAPPING_TEMPERATURE,
    MAPPING_WINDSPEED,
    MODULE_CONFIG,
    MODULE_DESCRIPTION,
    MODULE_DIR,
    MODULE_ID,
    MODULE_NAME,
    MODULE_SCHEMA,
    START_EVENT_FIRED_TODAY,
    TRIGGER_CONF_ACCOUNT_FOR_DURATION,
    TRIGGER_CONF_ENABLED,
    TRIGGER_CONF_NAME,
    TRIGGER_CONF_OFFSET_MINUTES,
    TRIGGER_CONF_TYPE,
    TRIGGER_TYPE_SUNRISE,
    ZONE_BUCKET,
    ZONE_CURRENT_DRAINAGE,
    ZONE_DELTA,
    ZONE_DRAINAGE_RATE,
    ZONE_DURATION,
    ZONE_ET_DEFICIENCY,
    ZONE_EXPLANATION,
    ZONE_FLOW_SENSOR,
    ZONE_ID,
    ZONE_INPUT_METHOD,
    ZONE_IRRIGATION_THRESHOLD,
    ZONE_LAST_CALCULATED,
    ZONE_LAST_CONSUMED_AT,
    ZONE_LAST_IRRIGATION,
    ZONE_LAST_UPDATED,
    ZONE_LEAD_TIME,
    ZONE_LINKED_ENTITY,
    ZONE_MAPPING,
    ZONE_MAXIMUM_BUCKET,
    ZONE_MAXIMUM_DURATION,
    ZONE_MEASURED_THROUGHPUT,
    ZONE_MEASURED_THROUGHPUT_SAMPLES,
    ZONE_MODULE,
    ZONE_MULTIPLIER,
    ZONE_NAME,
    ZONE_NUMBER_OF_DATA_POINTS,
    ZONE_PRECIPITATION_RATE,
    ZONE_PRECIPITATION_SUPERSEDED,
    ZONE_SIZE,
    ZONE_SOIL_MOISTURE_SENSOR,
    ZONE_SOIL_MOISTURE_THRESHOLD,
    ZONE_STATE,
    ZONE_STATE_AUTOMATIC,
    ZONE_THROUGHPUT,
    ZONE_WATER_USED,
)
from .helpers import loadModules
from .localize import localize
from .units import (
    CONF_STORED_UNITS,
    STORED_UNITS_METRIC,
    ZONE_UNIT_FIELDS,
    zone_from_display,
)

_LOGGER = logging.getLogger(__name__)

DATA_REGISTRY = f"{DOMAIN}_storage"
STORAGE_KEY = f"{DOMAIN}.storage"
STORAGE_VERSION = 5
SAVE_DELAY = 0


def _parse_history_start(value) -> datetime.datetime | None:
    """Parse an irrigation-history start stamp into an aware UTC datetime.

    Returns None when the value is missing or not a readable timestamp, so
    callers can decide what to do with a record they cannot date.
    """
    if isinstance(value, datetime.datetime):
        parsed = value
    elif isinstance(value, str):
        try:
            parsed = datetime.datetime.fromisoformat(value)
        except ValueError:
            _LOGGER.warning("Unparseable irrigation history start: %s", value)
            return None
    else:
        return None
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=datetime.UTC)
    return parsed.astimezone(datetime.UTC)


@attr.s(slots=True, frozen=True)
class ZoneEntry:
    """Zone storage Entry."""

    id = attr.ib(type=int, default=None)
    name = attr.ib(type=str, default=None)
    size = attr.ib(type=float, default=0.0)
    throughput = attr.ib(type=float, default=0.0)
    state = attr.ib(type=str, default="automatic")
    bucket = attr.ib(type=float, default=0)
    delta = attr.ib(type=float, default=0)
    # Raw daily ET deficiency from the last calculation (see ZONE_ET_DEFICIENCY).
    et_deficiency = attr.ib(type=float, default=0)
    duration = attr.ib(type=float, default=0)
    module = attr.ib(type=str, default=None)
    multiplier = attr.ib(type=float, default=1)
    explanation = attr.ib(type=str, default=None)
    mapping = attr.ib(type=str, default=None)
    lead_time = attr.ib(type=float, default=None)
    maximum_duration = attr.ib(type=float, default=CONF_DEFAULT_MAXIMUM_DURATION)
    maximum_bucket = attr.ib(type=float, default=CONF_DEFAULT_MAXIMUM_BUCKET)
    last_calculated = attr.ib(type=datetime, default=None)
    last_updated = attr.ib(type=datetime, default=None)
    number_of_data_points = attr.ib(type=int, default=0)
    drainage_rate = attr.ib(type=float, default=CONF_DEFAULT_DRAINAGE_RATE)
    current_drainage = attr.ib(type=float, default=0)
    # Timestamp of the last credited irrigation run + cumulative water (litres).
    last_irrigation = attr.ib(type=datetime, default=None)
    water_used = attr.ib(type=float, default=0.0)
    # Optional valve/switch entity watched to credit the bucket (closed-loop).
    linked_entity = attr.ib(type=str, default=None)
    # How much of a deficit to let build up before watering, in the user's depth
    # unit. 0 keeps watering as soon as anything is missing (#815).
    irrigation_threshold = attr.ib(
        type=float, default=CONF_DEFAULT_IRRIGATION_THRESHOLD
    )
    # Rain already accounted for by an asserted bucket value. Setting the bucket
    # says the soil is in a known state, which supersedes the rain collected
    # since the last calculation; without this it lands in the bucket again at
    # the next one (#811).
    precipitation_superseded = attr.ib(type=float, default=0.0)
    # Optional cumulative volume meter; credits the bucket by measured volume.
    flow_sensor = attr.ib(type=str, default=None)
    # Optional soil moisture sensor (%): the zone sits out a run while the
    # reading is at or above the threshold.
    soil_moisture_sensor = attr.ib(type=str, default=None)
    soil_moisture_threshold = attr.ib(
        type=float, default=CONF_DEFAULT_SOIL_MOISTURE_THRESHOLD
    )
    # How far this zone has read its sensor group's shared buffer (see const).
    # None means it has never consumed one, and its first calculation takes
    # everything there, which is what clearing the buffer used to leave behind.
    last_consumed_at = attr.ib(type=datetime, default=None)
    # What the flow meter says the zone actually delivers, smoothed over runs,
    # with the number of runs behind it. Advisory only (see const).
    measured_throughput = attr.ib(type=float, default=None)
    measured_throughput_samples = attr.ib(type=int, default=0)
    # How the precipitation rate is determined: from throughput+size, or entered directly.
    input_method = attr.ib(type=str, default=CONF_DEFAULT_ZONE_INPUT_METHOD)
    # Directly entered precipitation rate (mm/h or in/h), used when input_method is "direct".
    precipitation_rate = attr.ib(type=float, default=None)


@attr.s(slots=True, frozen=True)
class ModuleEntry:
    """Module storage Entry."""

    id = attr.ib(type=int, default=None)
    name = attr.ib(type=str, default=None)
    description = attr.ib(type=str, default=None)
    config = attr.ib(type=str, default=None)
    schema = attr.ib(type=str, default=None)


def default_mapping_entry(mapping_key: str, use_weather_service: bool) -> dict:
    """Return the default source configuration for a single sensor group field.

    Evapotranspiration and solar radiation are never delivered by the configured
    weather service directly. Neither is the precipitation depth: a weather
    service supplies a rate, which reaches the water balance through Current
    Precipitation (#764), and the depth is for a rain gauge of one's own. Those
    three default to "none" when a weather service is in use and to a sensor
    otherwise. Every other field defaults to the weather service when there is
    one.
    """
    if mapping_key in (
        MAPPING_EVAPOTRANSPIRATION,
        MAPPING_SOLRAD,
        MAPPING_PRECIPITATION,
    ):
        source = (
            MAPPING_CONF_SOURCE_NONE
            if use_weather_service
            else MAPPING_CONF_SOURCE_SENSOR
        )
    elif use_weather_service:
        source = MAPPING_CONF_SOURCE_WEATHER_SERVICE
    else:
        source = MAPPING_CONF_SOURCE_SENSOR
    return {
        MAPPING_CONF_SOURCE: source,
        MAPPING_CONF_SENSOR: "",
        MAPPING_CONF_UNIT: "",
    }


def adopt_module_from_zones(mappings: dict, zones: dict) -> dict:
    """Record each sensor group's engine on the group itself.

    The engine used to live only on the zone, alongside a separate reference to
    the sensor group. The two were independent, so a group could be shared by a
    PyETO zone and a Passthrough one and there was no answer to "which sources
    does this group need" - which is why the editor showed every field whatever
    the engine consumed.

    Moving it onto the group makes that question answerable. This migration
    only records what is already true: a group whose zones all use the same
    engine adopts it, and nothing else changes.

    A group whose zones disagree is left undecided on purpose. Picking one for
    them would silently change how the other zone's water balance is computed,
    and splitting the group would rearrange a list the user built. Those zones
    keep resolving through their own module, and the disagreement surfaces in
    the editor instead of being resolved behind their back.
    """

    def uses(zone, mapping_id) -> bool:
        # A zone's group reference may be stored as a string.
        try:
            return zone.mapping is not None and int(zone.mapping) == int(mapping_id)
        except (TypeError, ValueError):
            return False

    for mapping_id, mapping in mappings.items():
        if mapping.module is not None:
            continue
        engines = {
            zone.module
            for zone in zones.values()
            if zone.module is not None and uses(zone, mapping_id)
        }
        if len(engines) == 1:
            mappings[mapping_id] = attr.evolve(mapping, module=engines.pop())
        elif len(engines) > 1:
            _LOGGER.info(
                "Sensor group %s is used by zones with different calculation "
                "modules %s, so it has no module of its own; those zones keep "
                "using theirs",
                mapping_id,
                sorted(engines),
            )
    return mappings


def move_service_precipitation_to_the_rate(the_map: dict) -> dict:
    """Move a weather-service precipitation mapping onto the rate field.

    A weather service does not supply a precipitation depth worth using. It
    supplies the rain of the last hour, a rate, which reaches the water balance
    through ``Current Precipitation`` and is integrated over the calculation
    interval (#764). Its daily figure is a forecast for the part of the day that
    has not happened yet.

    A group that asked the service for its rain has to keep getting it, from the
    field that now carries it, or it would silently lose precipitation
    altogether. Groups older than the rate field carry an empty slot for it,
    backfilled by the loader with no source at all, which is exactly that case.

    The depth slot is then pointed at "none", because the panel no longer offers
    the weather service there and a source that does nothing is how a sensor
    group comes to look configured while it is not (#809). A rate sensor
    somebody configured is left alone, and so is a depth coming from a rain
    gauge, which still takes precedence over the service.
    """
    if not isinstance(the_map, dict):
        return the_map
    depth = the_map.get(MAPPING_PRECIPITATION)
    if (
        not isinstance(depth, dict)
        or depth.get(MAPPING_CONF_SOURCE) != MAPPING_CONF_SOURCE_WEATHER_SERVICE
    ):
        return the_map

    rate = the_map.get(MAPPING_CURRENT_PRECIPITATION)
    rate_is_unset = not isinstance(rate, dict) or rate.get(MAPPING_CONF_SOURCE) in (
        None,
        "",
        MAPPING_CONF_SOURCE_NONE,
    )
    if rate_is_unset:
        the_map[MAPPING_CURRENT_PRECIPITATION] = {
            MAPPING_CONF_SOURCE: MAPPING_CONF_SOURCE_WEATHER_SERVICE,
            MAPPING_CONF_SENSOR: "",
            MAPPING_CONF_UNIT: "",
        }
    the_map[MAPPING_PRECIPITATION] = {
        **depth,
        MAPPING_CONF_SOURCE: MAPPING_CONF_SOURCE_NONE,
    }
    return the_map


def normalize_mapping_conf(the_map: dict, use_weather_service: bool) -> dict:
    """Replace sourceless sensor group fields by their default configuration.

    Sensor groups created from the panel used to store a plain empty string for
    every field. The panel renders the source dropdown with "weather service" as
    its first option, so such a group looks fully configured while the backend
    sees no source at all and never fetches anything for it. Turn those entries
    into the configuration the panel was showing all along.
    """
    if not isinstance(the_map, dict):
        return the_map
    for mapping_key, value in the_map.items():
        if not isinstance(value, dict):
            the_map[mapping_key] = default_mapping_entry(
                mapping_key, use_weather_service
            )
    return the_map


def as_reading_list(value):
    """Return a sensor group's buffer as the list every reader expects.

    The buffer defaulted to the string ``"[]"`` until v2026.9.2, and the API
    accepts whatever a caller sends, so it can arrive as a string. ``"[]"`` is
    truthy, so a reader that only checked truthiness took it for a buffer with
    readings in it and then appended to a string (#846). Anything that is not a
    list of readings is an empty buffer, with a JSON string decoded rather than
    discarded so a hand-posted buffer is not silently lost.
    """
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            decoded = json.loads(value)
        except ValueError:
            return []
        if isinstance(decoded, list):
            return decoded
    return []


@attr.s(slots=True, frozen=True)
class MappingEntry:
    """Mapping storage Entry."""

    id = attr.ib(type=int, default=None)
    name = attr.ib(type=str, default=None)
    mappings = attr.ib(type=str, default=None)
    # The buffer of readings, a list. It used to default to the string "[]",
    # which every reader then had to recognise as "empty" (#846).
    data = attr.ib(type=list, factory=list)
    data_last_updated = attr.ib(type=datetime, default=None)
    data_last_entry = attr.ib(type=str, default={})
    data_last_calculation = attr.ib(type=str, default={})
    # An enclosed environment: no rain reaches these zones and the weather
    # service has nothing useful to say about what does (#815 follow-up).
    greenhouse = attr.ib(type=bool, default=CONF_DEFAULT_GREENHOUSE)
    # The engine that turns this group's sources into evapotranspiration. None
    # means "not decided here", and the zones fall back to their own module.
    module = attr.ib(type=int, default=None)


@attr.s(slots=True, frozen=True)
class IrrigationHistoryEntry:
    """One completed irrigation run, as shown on the panel's History tab.

    ``start`` is an ISO 8601 UTC timestamp (the moment the water started
    flowing, not the moment the run was credited), ``duration`` is in seconds
    and ``water_used`` in litres.
    """

    start = attr.ib(type=str, default=None)
    zone_id = attr.ib(type=int, default=None)
    zone_name = attr.ib(type=str, default=None)
    duration = attr.ib(type=float, default=0.0)
    water_used = attr.ib(type=float, default=0.0)


@attr.s(slots=True, frozen=True)
class Config:
    """(General) Config storage Entry."""

    calctime = attr.ib(type=str, default=CONF_DEFAULT_CALC_TIME)
    units = attr.ib(type=str, default=None)
    use_weather_service = attr.ib(type=bool, default=CONF_DEFAULT_USE_WEATHER_SERVICE)
    weather_service = attr.ib(type=str, default=CONF_DEFAULT_WEATHER_SERVICE)
    autocalcenabled = attr.ib(type=bool, default=CONF_AUTO_CALC_ENABLED)
    autoupdateenabled = attr.ib(type=bool, default=CONF_AUTO_UPDATE_ENABLED)
    autoupdateschedule = attr.ib(type=str, default=CONF_DEFAULT_AUTO_UPDATE_SCHEDULE)
    autoupdatedelay = attr.ib(type=str, default=CONF_DEFAULT_AUTO_UPDATE_DELAY)
    autoupdateinterval = attr.ib(type=str, default=CONF_DEFAULT_AUTO_UPDATE_INTERVAL)
    autoclearenabled = attr.ib(type=bool, default=CONF_DEFAULT_AUTO_CLEAR_ENABLED)
    cleardatatime = attr.ib(type=str, default=CONF_DEFAULT_CLEAR_TIME)
    starteventfiredtoday = attr.ib(type=bool, default=False)
    continuousupdates = attr.ib(
        type=bool, default=CONF_DEFAULT_CONTINUOUS_UPDATES
    )  # continuous updates are disabled by default for now
    # Reference ET summed hour by hour (FAO-56 Eq. 53) instead of the daily
    # equation on the window's means. Off by default while in beta.
    hourly_calculation = attr.ib(type=bool, default=CONF_DEFAULT_HOURLY_CALCULATION)
    # "standard" or "advanced"; None until the first load decides (see
    # _async_choose_ui_mode).
    ui_mode = attr.ib(type=str, default=None)
    # True once every zone has its own engine instance (see
    # _async_split_engines_per_zone).
    zone_engines_split = attr.ib(type=bool, default=False)
    # Watering is postponed until this moment (ISO 8601), or None.
    postpone_until = attr.ib(type=str, default=None)
    # "metric" once the zones' values are stored in metric (see units.py);
    # None on an install that has not been through that migration yet.
    stored_units = attr.ib(type=str, default=None)
    sensor_debounce = attr.ib(type=int, default=CONF_DEFAULT_SENSOR_DEBOUNCE)
    # Opt-in calculation audit log (#12): append every calculation's inputs,
    # intermediates and outputs to a JSON Lines file so days can be diffed.
    calc_log_enabled = attr.ib(type=bool, default=CONF_DEFAULT_CALC_LOG_ENABLED)
    irrigation_start_triggers = attr.ib(
        type=list, default=CONF_DEFAULT_IRRIGATION_START_TRIGGERS
    )
    # Which configured trigger actually starts irrigation ("default" = sunrise
    # minus the total watering duration).
    active_start_trigger = attr.ib(type=str, default=CONF_DEFAULT_ACTIVE_START_TRIGGER)
    skip_irrigation_on_precipitation = attr.ib(
        type=bool, default=CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION
    )
    precipitation_threshold_mm = attr.ib(
        type=float, default=CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM
    )
    # Conditions read at the start of a run. A threshold of None means the
    # default for the unit system in use (see skip_conditions).
    skip_on_freeze = attr.ib(type=bool, default=CONF_DEFAULT_SKIP_ON_FREEZE)
    freeze_threshold = attr.ib(type=float, default=None)
    freeze_sensor = attr.ib(type=str, default=None)
    skip_on_wind = attr.ib(type=bool, default=CONF_DEFAULT_SKIP_ON_WIND)
    wind_threshold = attr.ib(type=float, default=None)
    wind_sensor = attr.ib(type=str, default=None)
    skip_on_rain_sensor = attr.ib(type=bool, default=CONF_DEFAULT_SKIP_ON_RAIN_SENSOR)
    rain_sensor = attr.ib(type=str, default=None)
    days_between_irrigation = attr.ib(
        type=int, default=CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION
    )
    days_since_last_irrigation = attr.ib(
        type=int, default=CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION
    )
    seasonal_adjustments = attr.ib(type=list, default=CONF_DEFAULT_SEASONAL_ADJUSTMENTS)
    recurring_schedules = attr.ib(type=list, default=CONF_DEFAULT_RECURRING_SCHEDULES)
    # Manual coordinates (used for weather data instead of HA's location).
    # Without these fields attr.evolve() would reject the keys the frontend
    # saves, so the websocket config update would error.
    manual_coordinates_enabled = attr.ib(type=bool, default=False)
    manual_latitude = attr.ib(type=float, default=None)
    manual_longitude = attr.ib(type=float, default=None)
    manual_elevation = attr.ib(type=float, default=0)
    # Closed-loop bucket: credit each zone's bucket from its linked valve's real
    # run time instead of a manual reset automation. Off by default (opt-in).
    observed_watering_enabled = attr.ib(
        type=bool, default=CONF_DEFAULT_OBSERVED_WATERING_ENABLED
    )
    # Direct valve control: SI opens/closes each zone's linked valve itself.
    direct_valve_control_enabled = attr.ib(
        type=bool, default=CONF_DEFAULT_DIRECT_VALVE_CONTROL_ENABLED
    )
    zone_sequencing = attr.ib(type=str, default=CONF_DEFAULT_ZONE_SEQUENCING)
    # In-flight direct-control runs, persisted so a reboot can resume them.
    active_valve_runs = attr.ib(type=list, default=[])


class MigratableStore(Store):
    """Store subclass that supports migration for Smart Irrigation storage."""

    async def _async_migrate_func(self, old_version, data: dict):
        """Migration function for Smart Irrigation storage.

        This function ALWAYS runs on version mismatch to ensure config compatibility.
        It performs critical tasks:
        1. Migrates old config keys to new format
        2. Adds missing required fields with defaults
        3. Strips unrecognized config keys to prevent TypeError on Config initialization

        The stripping step is essential because old versions or corrupted configs
        may contain keys that don't match the current Config class attributes,
        which would cause TypeError during Config(**config_data) calls.
        """
        if old_version == 3:
            if "config" in data:
                if "use_owm" in data["config"]:
                    data["config"]["use_weather_service"] = data["config"].pop(
                        "use_owm"
                    )
                if data["config"]["use_weather_service"]:
                    data["config"]["weather_service"] = CONF_WEATHER_SERVICE_OWM
                # if "owm_api_version" in data:
                #    data["forecasting_api_version"] = data.pop("owm_api_version")
                # v3 to v4
                # use_owm --> use_forecasting
                # owm_api_key --> forecasting_api_key
                # owm_api_version --> forecasting_api_version
                # new: forecasting_service (OWM or PirateWeather)
        if old_version <= 4:
            # v4 to v5: Add irrigation start triggers configuration
            # Default to backward compatible behavior (sunrise trigger with total duration offset)
            if "config" in data:
                if CONF_IRRIGATION_START_TRIGGERS not in data["config"]:
                    # Create default trigger that mimics current behavior
                    default_trigger = {
                        TRIGGER_CONF_TYPE: TRIGGER_TYPE_SUNRISE,
                        TRIGGER_CONF_OFFSET_MINUTES: 0,  # Will be calculated from total duration
                        TRIGGER_CONF_ENABLED: True,
                        TRIGGER_CONF_NAME: "Sunrise (Legacy)",
                        TRIGGER_CONF_ACCOUNT_FOR_DURATION: True,  # Default to accounting for duration
                    }
                    data["config"][CONF_IRRIGATION_START_TRIGGERS] = [default_trigger]
                else:
                    # Update existing triggers to include account_for_duration if missing
                    for trigger in data["config"][CONF_IRRIGATION_START_TRIGGERS]:
                        if TRIGGER_CONF_ACCOUNT_FOR_DURATION not in trigger:
                            trigger[TRIGGER_CONF_ACCOUNT_FOR_DURATION] = True

                # Add weather skip configuration if missing
                if CONF_SKIP_IRRIGATION_ON_PRECIPITATION not in data["config"]:
                    data["config"][
                        CONF_SKIP_IRRIGATION_ON_PRECIPITATION
                    ] = CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION
                if CONF_PRECIPITATION_THRESHOLD_MM not in data["config"]:
                    data["config"][
                        CONF_PRECIPITATION_THRESHOLD_MM
                    ] = CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM

                # Add days between irrigation configuration if missing
                if CONF_DAYS_BETWEEN_IRRIGATION not in data["config"]:
                    data["config"][
                        CONF_DAYS_BETWEEN_IRRIGATION
                    ] = CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION
                if CONF_DAYS_SINCE_LAST_IRRIGATION not in data["config"]:
                    data["config"][
                        CONF_DAYS_SINCE_LAST_IRRIGATION
                    ] = CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION

        # CRITICAL: Always ensure required fields are present and strip unrecognized keys
        # This prevents TypeError when Config(**config_data) is called
        if "config" in data:
            # Ensure all required fields are present with defaults
            if CONF_IRRIGATION_START_TRIGGERS not in data["config"]:
                data["config"][
                    CONF_IRRIGATION_START_TRIGGERS
                ] = CONF_DEFAULT_IRRIGATION_START_TRIGGERS
            if CONF_SKIP_IRRIGATION_ON_PRECIPITATION not in data["config"]:
                data["config"][
                    CONF_SKIP_IRRIGATION_ON_PRECIPITATION
                ] = CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION
            if CONF_PRECIPITATION_THRESHOLD_MM not in data["config"]:
                data["config"][
                    CONF_PRECIPITATION_THRESHOLD_MM
                ] = CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM
            if CONF_DAYS_BETWEEN_IRRIGATION not in data["config"]:
                data["config"][
                    CONF_DAYS_BETWEEN_IRRIGATION
                ] = CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION
            if CONF_DAYS_SINCE_LAST_IRRIGATION not in data["config"]:
                data["config"][
                    CONF_DAYS_SINCE_LAST_IRRIGATION
                ] = CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION

            # Get valid field names from Config class to filter out unrecognized keys
            valid_fields = set(attr.fields_dict(Config).keys())
            original_keys = set(data["config"].keys())

            # Filter config to only include recognized fields
            filtered_config = {
                k: v for k, v in data["config"].items() if k in valid_fields
            }
            removed_keys = original_keys - set(filtered_config.keys())

            if removed_keys:
                _LOGGER.warning(
                    "Removed unrecognized config keys during migration: %s",
                    list(removed_keys),
                )

            data["config"] = filtered_config

        return data


class SmartIrrigationStorage:
    """Class to hold Smart Irrigation configuration data."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the storage."""
        self.hass = hass
        self.config: Config = Config()
        self.zones: MutableMapping[ZoneEntry] = {}
        self.modules: MutableMapping[ModuleEntry] = {}
        self.mappings: MutableMapping[MappingEntry] = {}
        self.irrigation_history: list[IrrigationHistoryEntry] = []
        self._store = MigratableStore(hass, STORAGE_VERSION, STORAGE_KEY)

    async def async_load(self) -> None:
        """Load the registry of schedule entries."""
        data = await self._store.async_load()
        await self._populate_from_data(data)
        await self._async_store_zones_in_metric()
        await self._async_choose_ui_mode()
        await self._async_split_engines_per_zone()

    async def _async_split_engines_per_zone(self) -> None:
        """Give every zone its own engine instance, once.

        An engine carries settings a zone owns: how many days it looks ahead,
        the fixed amount it uses. While zones shared one instance, changing one
        of those on a zone changed it on every other zone using the same
        engine, silently. So each zone gets a copy of its own.

        The engine each zone uses is first resolved the way the calculation
        used to: the sensor group's when it had adopted one, the zone's
        otherwise. Nothing therefore changes about what any zone computes; the
        settings simply stop being shared.
        """
        if self.config.zone_engines_split:
            self.config = attr.evolve(self.config, zone_engines_split=True)
            return

        taken: dict[int, int] = {}
        for zone_id in sorted(self.zones):
            zone = self.zones[zone_id]
            module_id = zone.module
            mapping = (
                self.mappings.get(zone.mapping) if zone.mapping is not None else None
            )
            if mapping is not None and mapping.module is not None:
                module_id = mapping.module
            if module_id is None or module_id not in self.modules:
                continue
            if module_id not in taken:
                taken[module_id] = zone_id
                if zone.module != module_id:
                    self.zones[zone_id] = attr.evolve(zone, module=module_id)
                continue
            source = self.modules[module_id]
            copy = await self.async_create_module(
                {
                    MODULE_NAME: source.name,
                    MODULE_DESCRIPTION: source.description,
                    MODULE_CONFIG: dict(source.config or {}),
                    MODULE_SCHEMA: source.schema,
                }
            )
            self.zones[zone_id] = attr.evolve(zone, module=copy[MODULE_ID])
            _LOGGER.debug("Zone %s now has its own %s engine", zone_id, source.name)

        self.config = attr.evolve(self.config, zone_engines_split=True)
        self.async_schedule_save()

    async def _async_choose_ui_mode(self) -> None:
        """Decide, once, how much of the panel this installation is shown.

        An installation that already has zones was set up on a panel that
        showed every setting, and some of those settings were changed on
        purpose: folding them away under it would hide decisions its owner
        made. So it stays on the full panel, and a fresh one starts on the
        standard one. Either way the choice is written down and is the user's
        from then on.
        """
        if self.config.ui_mode in (CONF_UI_MODE_STANDARD, CONF_UI_MODE_ADVANCED):
            return
        mode = CONF_UI_MODE_ADVANCED if self.zones else CONF_UI_MODE_STANDARD
        self.config = attr.evolve(self.config, ui_mode=mode)
        self.async_schedule_save()

    async def _async_store_zones_in_metric(self) -> None:
        """Convert an imperial install's zone values to metric, once.

        Zones used to keep their depths, rates, area and flow in Home
        Assistant's unit system. They are stored in metric now and converted
        only where they are shown or entered (units.py). Values on an install
        in imperial are read as the imperial ones they were entered as, as
        every calculation read them until now, and converted; a metric install
        has nothing to convert. Either way the configuration then records that
        its zones are in metric, so this never runs twice.
        """
        if self.config.stored_units == STORED_UNITS_METRIC:
            return
        if self.hass.config.units is not METRIC_SYSTEM:
            for zone_id, zone in list(self.zones.items()):
                converted = zone_from_display(attr.asdict(zone), metric=False)
                changes = {
                    key: converted[key] for key in ZONE_UNIT_FIELDS if key in converted
                }
                self.zones[zone_id] = attr.evolve(zone, **changes)
            _LOGGER.info(
                "Stored the values of %s zone(s) in metric; they are still shown "
                "in imperial",
                len(self.zones),
            )
        self.config = attr.evolve(self.config, stored_units=STORED_UNITS_METRIC)
        self.async_schedule_save()

    async def _populate_from_data(self, data) -> None:
        """Rebuild config/zones/modules/mappings/history from a storage-shaped dict.

        Shared by async_load (data read from disk) and async_import (data from a
        user-provided backup). ``data`` may be None on a fresh install, in which
        case defaults are used. The reconstructed values are only assigned to
        ``self`` at the very end, so a malformed payload raises before touching
        the live configuration (atomic restore).
        """
        config: Config = Config(
            calctime=CONF_DEFAULT_CALC_TIME,
            units=(
                CONF_METRIC
                if self.hass.config.units is METRIC_SYSTEM
                else CONF_IMPERIAL
            ),
            use_weather_service=CONF_DEFAULT_USE_WEATHER_SERVICE,
            weather_service=CONF_DEFAULT_WEATHER_SERVICE,
            autocalcenabled=CONF_DEFAULT_AUTO_CALC_ENABLED,
            autoupdateenabled=CONF_DEFAULT_AUTO_UPDATE_ENABLED,
            autoupdateschedule=CONF_DEFAULT_AUTO_UPDATE_SCHEDULE,
            autoupdatedelay=CONF_DEFAULT_AUTO_UPDATE_DELAY,
            autoupdateinterval=CONF_DEFAULT_AUTO_UPDATE_INTERVAL,
            autoclearenabled=CONF_DEFAULT_AUTO_CLEAR_ENABLED,
            cleardatatime=CONF_DEFAULT_CLEAR_TIME,
            starteventfiredtoday=False,
            continuousupdates=CONF_DEFAULT_CONTINUOUS_UPDATES,
            hourly_calculation=CONF_DEFAULT_HOURLY_CALCULATION,
            sensor_debounce=CONF_DEFAULT_SENSOR_DEBOUNCE,
            calc_log_enabled=CONF_DEFAULT_CALC_LOG_ENABLED,
        )
        zones: OrderedDict[str, ZoneEntry] = OrderedDict()
        modules: OrderedDict[str, ModuleEntry] = OrderedDict()
        mappings: OrderedDict[str, MappingEntry] = OrderedDict()
        irrigation_history: list[IrrigationHistoryEntry] = []

        if data is not None:
            config = Config(
                calctime=data["config"].get(CONF_CALC_TIME, CONF_DEFAULT_CALC_TIME),
                units=data["config"].get(
                    CONF_UNITS,
                    (
                        CONF_METRIC
                        if self.hass.config.units is METRIC_SYSTEM
                        else CONF_IMPERIAL
                    ),
                ),
                use_weather_service=data["config"].get(
                    CONF_USE_WEATHER_SERVICE, CONF_DEFAULT_USE_WEATHER_SERVICE
                ),
                weather_service=data["config"].get(
                    CONF_WEATHER_SERVICE, CONF_DEFAULT_WEATHER_SERVICE
                ),
                autocalcenabled=data["config"].get(
                    CONF_AUTO_CALC_ENABLED, CONF_DEFAULT_AUTO_CALC_ENABLED
                ),
                autoupdateenabled=data["config"].get(
                    CONF_AUTO_UPDATE_ENABLED, CONF_DEFAULT_AUTO_UPDATE_ENABLED
                ),
                autoupdateschedule=data["config"].get(
                    CONF_AUTO_UPDATE_SCHEDULE, CONF_DEFAULT_AUTO_UPDATE_SCHEDULE
                ),
                autoupdatedelay=data["config"].get(
                    CONF_AUTO_UPDATE_DELAY, CONF_DEFAULT_AUTO_UPDATE_DELAY
                ),
                autoupdateinterval=data["config"].get(
                    CONF_AUTO_UPDATE_INTERVAL, CONF_DEFAULT_AUTO_UPDATE_INTERVAL
                ),
                autoclearenabled=data["config"].get(
                    CONF_AUTO_CLEAR_ENABLED, CONF_DEFAULT_AUTO_CLEAR_ENABLED
                ),
                cleardatatime=data["config"].get(
                    CONF_CLEAR_TIME, CONF_DEFAULT_CLEAR_TIME
                ),
                starteventfiredtoday=data["config"].get(START_EVENT_FIRED_TODAY, False),
                continuousupdates=data["config"].get(
                    CONF_CONTINUOUS_UPDATES, CONF_DEFAULT_CONTINUOUS_UPDATES
                ),
                hourly_calculation=data["config"].get(
                    CONF_HOURLY_CALCULATION, CONF_DEFAULT_HOURLY_CALCULATION
                ),
                ui_mode=data["config"].get(CONF_UI_MODE),
                zone_engines_split=data["config"].get(CONF_ZONE_ENGINES_SPLIT, False),
                postpone_until=data["config"].get(CONF_POSTPONE_UNTIL),
                stored_units=data["config"].get(CONF_STORED_UNITS),
                sensor_debounce=data["config"].get(
                    CONF_SENSOR_DEBOUNCE, CONF_DEFAULT_SENSOR_DEBOUNCE
                ),
                calc_log_enabled=data["config"].get(
                    CONF_CALC_LOG_ENABLED, CONF_DEFAULT_CALC_LOG_ENABLED
                ),
                # These two are configuration the user entered, not state the
                # integration derives, and they were never read back here: a
                # restart replaced them with the empty defaults and the next
                # save wrote those over the file.
                seasonal_adjustments=data["config"].get(
                    CONF_SEASONAL_ADJUSTMENTS, CONF_DEFAULT_SEASONAL_ADJUSTMENTS
                ),
                recurring_schedules=data["config"].get(
                    CONF_RECURRING_SCHEDULES, CONF_DEFAULT_RECURRING_SCHEDULES
                ),
                irrigation_start_triggers=data["config"].get(
                    CONF_IRRIGATION_START_TRIGGERS,
                    CONF_DEFAULT_IRRIGATION_START_TRIGGERS,
                ),
                active_start_trigger=data["config"].get(
                    CONF_ACTIVE_START_TRIGGER,
                    CONF_DEFAULT_ACTIVE_START_TRIGGER,
                ),
                skip_irrigation_on_precipitation=data["config"].get(
                    CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
                    CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
                ),
                precipitation_threshold_mm=data["config"].get(
                    CONF_PRECIPITATION_THRESHOLD_MM,
                    CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
                ),
                skip_on_freeze=data["config"].get(
                    CONF_SKIP_ON_FREEZE, CONF_DEFAULT_SKIP_ON_FREEZE
                ),
                freeze_threshold=data["config"].get(CONF_FREEZE_THRESHOLD, None),
                freeze_sensor=data["config"].get(CONF_FREEZE_SENSOR, None),
                skip_on_wind=data["config"].get(
                    CONF_SKIP_ON_WIND, CONF_DEFAULT_SKIP_ON_WIND
                ),
                wind_threshold=data["config"].get(CONF_WIND_THRESHOLD, None),
                wind_sensor=data["config"].get(CONF_WIND_SENSOR, None),
                skip_on_rain_sensor=data["config"].get(
                    CONF_SKIP_ON_RAIN_SENSOR, CONF_DEFAULT_SKIP_ON_RAIN_SENSOR
                ),
                rain_sensor=data["config"].get(CONF_RAIN_SENSOR, None),
                days_between_irrigation=data["config"].get(
                    CONF_DAYS_BETWEEN_IRRIGATION,
                    CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION,
                ),
                days_since_last_irrigation=data["config"].get(
                    CONF_DAYS_SINCE_LAST_IRRIGATION,
                    CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION,
                ),
                # Manual coordinates are persisted by _data_to_save (attr.asdict)
                # but must be read back here too, otherwise they reset to defaults
                # on every restart and the feature silently reverts to HA's location.
                manual_coordinates_enabled=data["config"].get(
                    CONF_MANUAL_COORDINATES_ENABLED, False
                ),
                manual_latitude=data["config"].get(CONF_MANUAL_LATITUDE, None),
                manual_longitude=data["config"].get(CONF_MANUAL_LONGITUDE, None),
                manual_elevation=data["config"].get(CONF_MANUAL_ELEVATION, 0),
                observed_watering_enabled=data["config"].get(
                    CONF_OBSERVED_WATERING_ENABLED,
                    CONF_DEFAULT_OBSERVED_WATERING_ENABLED,
                ),
                direct_valve_control_enabled=data["config"].get(
                    CONF_DIRECT_VALVE_CONTROL_ENABLED,
                    CONF_DEFAULT_DIRECT_VALVE_CONTROL_ENABLED,
                ),
                zone_sequencing=data["config"].get(
                    CONF_ZONE_SEQUENCING, CONF_DEFAULT_ZONE_SEQUENCING
                ),
                active_valve_runs=data["config"].get(CONF_ACTIVE_VALVE_RUNS, []),
            )

            if "zones" in data:
                for zone in data["zones"]:
                    zones[zone[ZONE_ID]] = ZoneEntry(
                        id=zone[ZONE_ID],
                        name=zone[ZONE_NAME],
                        size=zone[ZONE_SIZE],
                        throughput=zone[ZONE_THROUGHPUT],
                        state=zone[ZONE_STATE],
                        delta=zone[ZONE_DELTA],
                        et_deficiency=zone.get(ZONE_ET_DEFICIENCY, 0),
                        bucket=zone[ZONE_BUCKET],
                        duration=zone[ZONE_DURATION],
                        module=zone[ZONE_MODULE],
                        multiplier=zone[ZONE_MULTIPLIER],
                        mapping=zone[ZONE_MAPPING],
                        lead_time=zone[ZONE_LEAD_TIME],
                        maximum_duration=zone.get(
                            ZONE_MAXIMUM_DURATION, CONF_DEFAULT_MAXIMUM_DURATION
                        ),
                        maximum_bucket=zone.get(
                            ZONE_MAXIMUM_BUCKET, CONF_DEFAULT_MAXIMUM_BUCKET
                        ),
                        # Both of these were dropped here, so every restart
                        # rebuilt the zone without them and the next save wrote
                        # the emptied values back. The explanation is the only
                        # place the water balance shows its work, and it did
                        # not survive a restart; last_calculated was never set
                        # on any install at all.
                        explanation=zone.get(ZONE_EXPLANATION, None),
                        last_calculated=zone.get(ZONE_LAST_CALCULATED, None),
                        last_updated=zone.get(ZONE_LAST_UPDATED, None),
                        number_of_data_points=zone.get(
                            ZONE_NUMBER_OF_DATA_POINTS, None
                        ),
                        drainage_rate=zone.get(ZONE_DRAINAGE_RATE, None),
                        current_drainage=zone.get(ZONE_CURRENT_DRAINAGE, None),
                        last_irrigation=zone.get(ZONE_LAST_IRRIGATION, None),
                        water_used=zone.get(ZONE_WATER_USED, 0.0),
                        precipitation_superseded=zone.get(
                            ZONE_PRECIPITATION_SUPERSEDED, 0.0
                        ),
                        irrigation_threshold=zone.get(
                            ZONE_IRRIGATION_THRESHOLD, CONF_DEFAULT_IRRIGATION_THRESHOLD
                        ),
                        linked_entity=zone.get(ZONE_LINKED_ENTITY, None),
                        flow_sensor=zone.get(ZONE_FLOW_SENSOR, None),
                        soil_moisture_sensor=zone.get(ZONE_SOIL_MOISTURE_SENSOR, None),
                        soil_moisture_threshold=zone.get(
                            ZONE_SOIL_MOISTURE_THRESHOLD,
                            CONF_DEFAULT_SOIL_MOISTURE_THRESHOLD,
                        ),
                        last_consumed_at=zone.get(ZONE_LAST_CONSUMED_AT, None),
                        measured_throughput=zone.get(ZONE_MEASURED_THROUGHPUT, None),
                        measured_throughput_samples=zone.get(
                            ZONE_MEASURED_THROUGHPUT_SAMPLES, 0
                        ),
                        input_method=zone.get(
                            ZONE_INPUT_METHOD, CONF_DEFAULT_ZONE_INPUT_METHOD
                        ),
                        precipitation_rate=zone.get(ZONE_PRECIPITATION_RATE, None),
                    )
            if "modules" in data:
                for module in data["modules"]:
                    schema_from_code = None
                    modconfig = None
                    if MODULE_CONFIG in module:
                        modconfig = module[MODULE_CONFIG]
                    # load the calc modules and set up the schema
                    mods = await self.hass.async_add_executor_job(
                        loadModules, MODULE_DIR
                    )
                    for mod in mods:
                        if mods[mod]["class"] == module[MODULE_NAME]:
                            m = getattr(mods[mod]["module"], mods[mod]["class"])
                            inst = m(self.hass, module[MODULE_DESCRIPTION], modconfig)
                            schema_from_code = inst.schema_serialized()
                            break
                    modules[module[MODULE_ID]] = ModuleEntry(
                        id=module[MODULE_ID],
                        name=module[MODULE_NAME],
                        description=module[MODULE_DESCRIPTION],
                        config=modconfig,
                        schema=schema_from_code,
                    )
            if "mappings" in data:
                for mapping in data["mappings"]:
                    the_map = mapping.get(MAPPING_MAPPINGS)
                    # remove max and min temp is present in mapping, they should only be there for old versions.
                    if MAPPING_MAX_TEMP in the_map:
                        the_map.pop(MAPPING_MAX_TEMP)
                    if MAPPING_MIN_TEMP in the_map:
                        the_map.pop(MAPPING_MIN_TEMP)
                    if MAPPING_CURRENT_PRECIPITATION not in the_map:
                        the_map[MAPPING_CURRENT_PRECIPITATION] = {}
                    # repair sensor groups saved without any source at all
                    the_map = normalize_mapping_conf(
                        the_map, config.use_weather_service
                    )
                    the_map = move_service_precipitation_to_the_rate(the_map)
                    mappings[mapping[MAPPING_ID]] = MappingEntry(
                        id=mapping[MAPPING_ID],
                        name=mapping[MAPPING_NAME],
                        mappings=the_map,
                        data=as_reading_list(mapping.get(MAPPING_DATA)),
                        data_last_updated=mapping.get(MAPPING_DATA_LAST_UPDATED, None),
                        data_last_entry=mapping.get(MAPPING_DATA_LAST_ENTRY, {}),
                        data_last_calculation=mapping.get(
                            MAPPING_DATA_LAST_CALCULATION, {}
                        ),
                        greenhouse=mapping.get(
                            MAPPING_GREENHOUSE, CONF_DEFAULT_GREENHOUSE
                        ),
                        module=mapping.get(MAPPING_MODULE, None),
                    )
            # Absent before the History tab existed, so treat a missing key as
            # "no runs recorded yet" rather than a broken store.
            for run in data.get(IRRIGATION_HISTORY) or []:
                if not isinstance(run, dict):
                    continue
                irrigation_history.append(
                    IrrigationHistoryEntry(
                        start=run.get(HISTORY_START),
                        zone_id=run.get(HISTORY_ZONE_ID),
                        zone_name=run.get(HISTORY_ZONE_NAME),
                        duration=run.get(HISTORY_DURATION, 0.0),
                        water_used=run.get(HISTORY_WATER_USED, 0.0),
                    )
                )

        mappings = adopt_module_from_zones(mappings, zones)

        self.config = config
        self.zones = zones
        self.modules = modules
        self.mappings = mappings
        self.irrigation_history = irrigation_history

    async def set_up_factory_defaults(self):
        """Set up factory default zones, modules, and mappings if they do not exist."""
        if not self.zones:
            await self.async_factory_default_zones()
        if not self.modules:
            await self.async_factory_default_modules()
        if not self.mappings:
            await self.async_factory_default_mappings()

    async def async_factory_default_zones(self):
        """Set up factory default zones if none exist."""
        # new_zone1 = ZoneEntry(
        #    **{ZONE_ID: 0, ZONE_NAME: localize("defaults.default-zone", self.hass.config.language)+" 1", ZONE_SIZE: 50.5, ZONE_THROUGHPUT: 10.1,ZONE_MODULE:0,ZONE_MAPPING:0,ZONE_LEAD_TIME:0, ZONE_MAXIMUM_DURATION:CONF_DEFAULT_MAXIMUM_DURATION, ZONE_MAXIMUM_BUCKET: CONF_DEFAULT_MAXIMUM_BUCKET}
        # )
        # new_zone2 = ZoneEntry(
        #    **{ZONE_ID: 1, ZONE_NAME: localize("defaults.default-zone", self.hass.config.language)+" 2", ZONE_SIZE: 100.1, ZONE_THROUGHPUT: 20.2,ZONE_MODULE:0,ZONE_MAPPING: 0, ZONE_LEAD_TIME:0, ZONE_MAXIMUM_DURATION: CONF_DEFAULT_MAXIMUM_DURATION, ZONE_MAXIMUM_BUCKET: CONF_DEFAULT_MAXIMUM_BUCKET}
        # )
        # self.zones[0] = new_zone1
        # self.zones[1] = new_zone2
        # self.async_schedule_save()
        return

    async def async_factory_default_modules(self):
        """Set up factory default modules if none exist."""
        schema_from_code = None
        module0schema = None
        module1schema = None
        mods = await self.hass.async_add_executor_job(loadModules, MODULE_DIR)
        for mod in mods:
            if mods[mod]["class"] in ["PyETO", "Static"]:
                m = getattr(mods[mod]["module"], mods[mod]["class"])
                inst = m(self.hass, {}, {})
                schema_from_code = inst.schema_serialized()
                if mods[mod]["class"] == "PyETO":
                    module0schema = schema_from_code
                elif mods[mod]["class"] == "Static":
                    module1schema = schema_from_code
        module0 = ModuleEntry(
            **{
                MODULE_ID: 0,
                MODULE_NAME: "PyETO",
                MODULE_DESCRIPTION: await localize(
                    "calcmodules.pyeto.description", self.hass.config.language
                )
                + ".",
                MODULE_SCHEMA: module0schema,
            }
        )
        module1 = ModuleEntry(
            **{
                MODULE_ID: 1,
                MODULE_NAME: "Static",
                MODULE_DESCRIPTION: await localize(
                    "calcmodules.static.description", self.hass.config.language
                )
                + ".",
                MODULE_SCHEMA: module1schema,
            }
        )
        self.modules[0] = module0
        self.modules[1] = module1
        self.async_schedule_save()

    async def async_factory_default_mappings(self):
        """Set up factory default mappings if none exist."""
        mappings = [
            MAPPING_DEWPOINT,
            MAPPING_EVAPOTRANSPIRATION,
            MAPPING_HUMIDITY,
            MAPPING_PRECIPITATION,
            MAPPING_CURRENT_PRECIPITATION,
            MAPPING_PRESSURE,
            MAPPING_SOLRAD,
            MAPPING_TEMPERATURE,
            MAPPING_WINDSPEED,
        ]
        conf = {
            mapping_key: default_mapping_entry(
                mapping_key, self.config.use_weather_service
            )
            for mapping_key in mappings
        }
        new_mapping1 = MappingEntry(
            **{
                MAPPING_ID: 0,
                MAPPING_NAME: await localize(
                    "defaults.default-mapping", self.hass.config.language
                ),
                MAPPING_MAPPINGS: conf,
            }
        )
        self.mappings[0] = new_mapping1
        self.async_schedule_save()

    @callback
    def async_schedule_save(self) -> None:
        """Schedule saving the registry of Smart Irrigation."""
        self._store.async_delay_save(self._data_to_save, SAVE_DELAY)

    async def async_save(self) -> None:
        """Save the registry of Smart Irrigation."""
        await self._store.async_save(self._data_to_save())

    @callback
    def _data_to_save(self) -> dict:
        """Return data for the registry for Smart Irrigation to store in a file."""
        store_data = {
            "config": attr.asdict(self.config),
        }

        store_data["zones"] = [attr.asdict(entry) for entry in self.zones.values()]
        store_data["modules"] = [attr.asdict(entry) for entry in self.modules.values()]
        store_data["mappings"] = [
            attr.asdict(entry) for entry in self.mappings.values()
        ]
        store_data[IRRIGATION_HISTORY] = [
            attr.asdict(entry) for entry in self.irrigation_history
        ]
        return store_data

    async def async_export(self) -> dict:
        """Return the full configuration (config + zones + modules + mappings).

        Same shape as the on-disk storage, so it round-trips through
        async_import without any conversion.
        """
        return self._data_to_save()

    async def async_import(self, data: dict) -> None:
        """Replace the entire stored configuration with ``data`` and persist it.

        ``data`` must be storage-shaped: a dict with at least a ``config`` key
        and optional ``zones`` / ``modules`` / ``mappings`` lists (extra keys
        such as backup metadata are ignored). The caller must reload the config
        entry afterwards so the running coordinator applies the restored config
        (sensor subscriptions, weather client, schedules).
        """
        if not isinstance(data, dict) or "config" not in data:
            raise ValueError("Invalid backup: missing 'config'")
        # _populate_from_data assigns to self only once fully rebuilt, so a bad
        # payload raises here without corrupting the live configuration.
        await self._populate_from_data(data)
        # A backup taken before zones were stored in metric carries no marker,
        # and is converted the same way.
        await self._async_store_zones_in_metric()
        await self.async_save()

    async def async_delete(self):
        """Delete config."""
        _LOGGER.warning("Removing Smart Irrigation configuration data!")
        await self._store.async_remove()
        # self.config = Config()
        # await self.async_factory_default_zones()
        # await self.async_factory_default_modules()

    @callback
    def get_config(self):
        """Return the current configuration as a dictionary."""
        return attr.asdict(self.config)

    async def async_get_config(self):
        """Return the current configuration as a dictionary asynchronously."""
        return attr.asdict(self.config)

    async def async_update_config(self, changes: dict):
        """Update existing config."""

        old = self.config
        changes.pop("id", None)
        new = self.config = attr.evolve(old, **changes)
        self.async_schedule_save()
        return attr.asdict(new)

    @callback
    def get_zone(self, zone_id: int) -> ZoneEntry:
        """Get an existing ZoneEntry by id."""
        res = self.zones.get(int(zone_id))
        return attr.asdict(res) if res else None
        # res = None
        # for key,val in self.zones.items():
        #    if str(val.id) == str(zone_id):
        #        res = val
        #        break
        # return attr.asdict(res) if res else None

    async def async_get_zones(self):
        """Get all ZoneEntries."""
        # res = {}
        # for key, val in self.zones.items():
        #    res[key] = attr.asdict(val)
        # return res

        return [attr.asdict(val) for val in self.zones.values()]

    async def async_create_zone(self, data: dict) -> ZoneEntry:
        """Create a new ZoneEntry."""
        # zone_id = str(int(time.time()))
        # new_zone = ZoneEntry(**data, id=zone_id)
        new_zone = ZoneEntry(**data)
        if not new_zone.id:
            zones = await self.async_get_zones()
            new_zone = attr.evolve(new_zone, id=self.generate_next_id(zones))
        self.zones[int(new_zone.id)] = new_zone
        self.async_schedule_save()
        return attr.asdict(new_zone)

    async def async_delete_zone(self, zone_id: int) -> None:
        """Delete ZoneEntry."""
        zone_id = int(zone_id)
        if zone_id in self.zones:
            del self.zones[zone_id]
            self.async_schedule_save()
            return True
        return False

    async def async_update_zone(self, zone_id: int, changes: dict) -> ZoneEntry:
        """Update existing zone."""
        zone_id = int(zone_id)
        old = self.zones[zone_id]
        if changes:
            # handle multiplier value change
            if ATTR_NEW_MULTIPLIER_VALUE in changes:
                changes[ZONE_MULTIPLIER] = changes[ATTR_NEW_MULTIPLIER_VALUE]
                changes.pop(ATTR_NEW_MULTIPLIER_VALUE)
            # handle bucket value change
            if ATTR_NEW_BUCKET_VALUE in changes:
                changes[ZONE_BUCKET] = changes[ATTR_NEW_BUCKET_VALUE]
                changes.pop(ATTR_NEW_BUCKET_VALUE)
            # Apply the maximum bucket value. Either can come on its own, now
            # that the panel sends only what changed, so the other one is the
            # zone's current value; reading it from the changes raised a
            # KeyError on a maximum sent without a bucket.
            if ZONE_MAXIMUM_BUCKET in changes or ZONE_BUCKET in changes:
                maximum = changes.get(ZONE_MAXIMUM_BUCKET, old.maximum_bucket)
                bucket = changes.get(ZONE_BUCKET, old.bucket)
                if maximum is not None and bucket is not None and bucket > maximum:
                    changes[ZONE_BUCKET] = maximum
            # if bucket on zone is 0, then duration should be 0, but only if zone is automatic
            if (
                ZONE_BUCKET in changes
                and changes[ZONE_BUCKET] == 0
                and old.state == ZONE_STATE_AUTOMATIC
            ):
                changes[ZONE_DURATION] = 0
            changes.pop("id", None)
            # Only keep changes that are valid attributes of the ZoneEntry
            valid_fields = set(attr.fields_dict(type(old)).keys())
            filtered_changes = {k: v for k, v in changes.items() if k in valid_fields}
            new = self.zones[zone_id] = attr.evolve(old, **filtered_changes)
        else:
            new = old
        self.async_schedule_save()
        return attr.asdict(new)

    @callback
    def get_module(self, module_id: int) -> ModuleEntry:
        """Get an existing ModuleEntry by id."""
        if module_id is not None:
            res = self.modules.get(int(module_id))
            return attr.asdict(res) if res else None
        return None

    async def async_get_modules(self):
        """Get all ModuleEntries."""
        # res = {}
        # for key, val in self.modules.items():
        #    res[key] = attr.asdict(val)
        # return res

        return [attr.asdict(val) for val in self.modules.values()]

    async def async_create_module(self, data: dict) -> ModuleEntry:
        """Create a new ModuleEntry."""
        # module_id = str(int(time.time()))
        # new_module = moduleEntry(**data, id=module_id)
        new_module = ModuleEntry(**data)
        if not new_module.id:
            modules = await self.async_get_modules()
            new_module = attr.evolve(new_module, id=self.generate_next_id(modules))
        self.modules[int(new_module.id)] = new_module
        self.async_schedule_save()
        return attr.asdict(new_module)

    async def async_delete_module(self, module_id: int) -> None:
        """Delete ModuleEntry."""
        if int(module_id) in self.modules:
            del self.modules[int(module_id)]
            self.async_schedule_save()
            return True
        return False

    async def async_update_module(self, module_id: int, changes: dict) -> ModuleEntry:
        """Update existing module."""
        module_id = int(module_id)
        old = self.modules[module_id]
        changes.pop("id", None)
        new = self.modules[module_id] = attr.evolve(old, **changes)
        self.async_schedule_save()
        return attr.asdict(new)

    @callback
    def get_mapping(self, mapping_id: int) -> MappingEntry:
        """Get an existing MappingEntry by id."""
        if mapping_id is not None:
            res = self.mappings.get(int(mapping_id))
            return attr.asdict(res) if res else None
        return None

    async def async_get_mappings(self):
        """Get all MappingEntries."""
        # res = {}
        # for key, val in self.modules.items():
        #    res[key] = attr.asdict(val)
        # return res

        return [attr.asdict(val) for val in self.mappings.values()]

    async def async_create_mapping(self, data: dict) -> MappingEntry:
        """Create a new MappingEntry."""
        if isinstance(data.get(MAPPING_MAPPINGS), dict):
            data = {
                **data,
                MAPPING_MAPPINGS: normalize_mapping_conf(
                    dict(data[MAPPING_MAPPINGS]), self.config.use_weather_service
                ),
            }
        if MAPPING_DATA in data:
            data = {**data, MAPPING_DATA: as_reading_list(data[MAPPING_DATA])}
        new_mapping = MappingEntry(**data)
        if not new_mapping.id:
            mappings = await self.async_get_mappings()
            new_mapping = attr.evolve(new_mapping, id=self.generate_next_id(mappings))
        self.mappings[int(new_mapping.id)] = new_mapping
        self.async_schedule_save()
        return attr.asdict(new_mapping)

    async def async_delete_mapping(self, mapping_id: str) -> None:
        """Delete MappingEntry."""
        mapping_id = int(mapping_id)
        if mapping_id in self.mappings:
            del self.mappings[mapping_id]
            self.async_schedule_save()
            return True
        return False

    async def async_update_mapping(
        self, mapping_id: int, changes: dict
    ) -> MappingEntry:
        """Update existing mapping."""
        mapping_id = int(mapping_id)
        old = self.mappings[mapping_id]
        # make sure we don't override the ID
        changes.pop("id", None)
        if isinstance(changes.get(MAPPING_MAPPINGS), dict):
            changes[MAPPING_MAPPINGS] = normalize_mapping_conf(
                dict(changes[MAPPING_MAPPINGS]), self.config.use_weather_service
            )
        if MAPPING_DATA in changes:
            changes[MAPPING_DATA] = as_reading_list(changes[MAPPING_DATA])
        if old is not None:
            if old.data_last_entry is not None and len(old.data_last_entry) > 0:
                if MAPPING_DATA_LAST_ENTRY not in changes:
                    changes[MAPPING_DATA_LAST_ENTRY] = {}
                for key in old.data_last_entry:
                    if key not in changes[MAPPING_DATA_LAST_ENTRY]:
                        changes[MAPPING_DATA_LAST_ENTRY][key] = old.data_last_entry[key]
            if (
                old.data_last_calculation is not None
                and len(old.data_last_calculation) > 0
            ):
                if MAPPING_DATA_LAST_CALCULATION not in changes:
                    changes[MAPPING_DATA_LAST_CALCULATION] = {}
                for key in old.data_last_calculation:
                    if key not in changes[MAPPING_DATA_LAST_CALCULATION]:
                        changes[MAPPING_DATA_LAST_CALCULATION][key] = (
                            old.data_last_calculation[key]
                        )
        new = self.mappings[mapping_id] = attr.evolve(old, **changes)
        self.async_schedule_save()
        return attr.asdict(new)

    async def async_get_irrigation_history(self):
        """Return every recorded irrigation run, oldest first."""
        return [attr.asdict(entry) for entry in self.irrigation_history]

    async def async_add_irrigation_history(self, data: dict) -> dict:
        """Record one completed irrigation run and prune what has aged out.

        Runs are appended in completion order, which is also start order for
        sequential watering; the panel sorts by start time anyway, so a parallel
        run finishing early cannot put the list out of order for the user.
        """
        entry = IrrigationHistoryEntry(**data)
        self.irrigation_history.append(entry)
        self._prune_irrigation_history()
        self.async_schedule_save()
        return attr.asdict(entry)

    def _prune_irrigation_history(self) -> None:
        """Drop runs older than the retention window, then cap the total kept."""
        cutoff = datetime.datetime.now(datetime.UTC) - datetime.timedelta(
            days=IRRIGATION_HISTORY_RETENTION_DAYS
        )
        kept = []
        for entry in self.irrigation_history:
            started = _parse_history_start(entry.start)
            # An unparseable timestamp cannot be aged out; keep it and let the
            # entry cap below bound it, rather than silently dropping a run.
            if started is not None and started < cutoff:
                continue
            kept.append(entry)
        if len(kept) > IRRIGATION_HISTORY_MAX_ENTRIES:
            kept = kept[-IRRIGATION_HISTORY_MAX_ENTRIES:]
        self.irrigation_history = kept

    def generate_next_id(self, the_list):
        """Generate a next id for the_list."""
        if the_list is None or len(the_list) == 0:
            return 0
        ids = [the_list[i]["id"] for i in range(len(the_list))]
        if ids is None:
            return 0
        return max(ids) + 1


@bind_hass
async def async_get_registry(hass: HomeAssistant) -> SmartIrrigationStorage:
    """Return Smart Irrigation storage instance."""
    task = hass.data.get(DATA_REGISTRY)

    if task is None:

        async def _load_reg() -> SmartIrrigationStorage:
            registry = SmartIrrigationStorage(hass)
            await registry.async_load()
            return registry

        # Create task to load registry asynchronously - will be awaited below
        task = hass.data[DATA_REGISTRY] = hass.async_create_task(_load_reg())

    data = await task
    return cast(SmartIrrigationStorage, data)
