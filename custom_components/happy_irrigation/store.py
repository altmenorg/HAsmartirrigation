"""Storage and management for HAppy Irrigation configuration, zones, modules, and mappings."""

import datetime
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
    CONF_AUTO_CALC_ENABLED,
    CONF_AUTO_CLEAR_ENABLED,
    CONF_AUTO_UPDATE_DELAY,
    CONF_AUTO_UPDATE_ENABLED,
    CONF_AUTO_UPDATE_INTERVAL,
    CONF_AUTO_UPDATE_SCHEDULE,
    CONF_CALC_TIME,
    CONF_CLEAR_TIME,
    CONF_CONTINUOUS_UPDATES,
    CONF_DAYS_BETWEEN_IRRIGATION,
    CONF_DAYS_SINCE_LAST_IRRIGATION,
    CONF_DEFAULT_AUTO_CALC_ENABLED,
    CONF_DEFAULT_AUTO_CLEAR_ENABLED,
    CONF_DEFAULT_AUTO_UPDATE_DELAY,
    CONF_DEFAULT_AUTO_UPDATE_ENABLED,
    CONF_DEFAULT_AUTO_UPDATE_INTERVAL,
    CONF_DEFAULT_AUTO_UPDATE_SCHEDULE,
    CONF_DEFAULT_CALC_TIME,
    CONF_DEFAULT_CLEAR_TIME,
    CONF_DEFAULT_CONTINUOUS_UPDATES,
    CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION,
    CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION,
    CONF_DEFAULT_DRAINAGE_RATE,
    CONF_DEFAULT_IRRIGATION_START_TRIGGERS,
    CONF_DEFAULT_MAXIMUM_BUCKET,
    CONF_DEFAULT_MAXIMUM_DURATION,
    CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
    CONF_DEFAULT_RECURRING_SCHEDULES,
    CONF_DEFAULT_SEASONAL_ADJUSTMENTS,
    CONF_DEFAULT_SENSOR_DEBOUNCE,
    CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_DEFAULT_USE_WEATHER_SERVICE,
    CONF_DEFAULT_WEATHER_SERVICE,
    CONF_IMPERIAL,
    CONF_IRRIGATION_START_TRIGGERS,
    CONF_METRIC,
    CONF_PRECIPITATION_THRESHOLD_MM,
    CONF_SENSOR_DEBOUNCE,
    CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_UNITS,
    CONF_USE_WEATHER_SERVICE,
    CONF_WEATHER_SERVICE,
    CONF_WEATHER_SERVICE_OWM,
    DOMAIN,
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
    MAPPING_HUMIDITY,
    MAPPING_ID,
    MAPPING_MAPPINGS,
    MAPPING_MAX_TEMP,
    MAPPING_MIN_TEMP,
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
    ZONE_ID,
    ZONE_LAST_UPDATED,
    ZONE_LEAD_TIME,
    ZONE_MAPPING,
    ZONE_MAXIMUM_BUCKET,
    ZONE_MAXIMUM_DURATION,
    ZONE_MODULE,
    ZONE_MULTIPLIER,
    ZONE_NAME,
    ZONE_NUMBER_OF_DATA_POINTS,
    ZONE_SIZE,
    ZONE_STATE,
    ZONE_STATE_AUTOMATIC,
    ZONE_THROUGHPUT,
)
from .helpers import loadModules
from .localize import localize

_LOGGER = logging.getLogger(__name__)

DATA_REGISTRY = f"{DOMAIN}_storage"
STORAGE_KEY = f"{DOMAIN}.storage"
STORAGE_VERSION = 5
SAVE_DELAY = 0


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


@attr.s(slots=True, frozen=True)
class ModuleEntry:
    """Module storage Entry."""

    id = attr.ib(type=int, default=None)
    name = attr.ib(type=str, default=None)
    description = attr.ib(type=str, default=None)
    config = attr.ib(type=str, default=None)
    schema = attr.ib(type=str, default=None)


@attr.s(slots=True, frozen=True)
class MappingEntry:
    """Mapping storage Entry."""

    id = attr.ib(type=int, default=None)
    name = attr.ib(type=str, default=None)
    mappings = attr.ib(type=str, default=None)
    data = attr.ib(type=str, default="[]")
    data_last_updated = attr.ib(type=datetime, default=None)
    data_last_entry = attr.ib(type=str, default={})
    data_last_calculation = attr.ib(type=str, default={})


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
    sensor_debounce = attr.ib(type=int, default=CONF_DEFAULT_SENSOR_DEBOUNCE)
    irrigation_start_triggers = attr.ib(
        type=list, default=CONF_DEFAULT_IRRIGATION_START_TRIGGERS
    )
    skip_irrigation_on_precipitation = attr.ib(
        type=bool, default=CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION
    )
    precipitation_threshold_mm = attr.ib(
        type=float, default=CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM
    )
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


class MigratableStore(Store):
    """Store subclass that supports migration for HAppy Irrigation storage."""

    async def _async_migrate_func(self, old_version, data: dict):
        """Migration function for HAppy Irrigation storage.

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
    """Class to hold HAppy Irrigation configuration data."""

    def __init__(self, hass: HomeAssistant) -> None:
        """Initialize the storage."""
        self.hass = hass
        self.config: Config = Config()
        self.zones: MutableMapping[ZoneEntry] = {}
        self.modules: MutableMapping[ModuleEntry] = {}
        self.mappings: MutableMapping[MappingEntry] = {}
        self._store = MigratableStore(hass, STORAGE_VERSION, STORAGE_KEY)

    async def async_load(self) -> None:
        """Load the registry of schedule entries."""
        data = await self._store.async_load()
        await self._populate_from_data(data)

    async def _populate_from_data(self, data) -> None:
        """Rebuild config/zones/modules/mappings from a storage-shaped dict.

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
            sensor_debounce=CONF_DEFAULT_SENSOR_DEBOUNCE,
        )
        zones: OrderedDict[str, ZoneEntry] = OrderedDict()
        modules: OrderedDict[str, ModuleEntry] = OrderedDict()
        mappings: OrderedDict[str, MappingEntry] = OrderedDict()

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
                sensor_debounce=data["config"].get(
                    CONF_SENSOR_DEBOUNCE, CONF_DEFAULT_SENSOR_DEBOUNCE
                ),
                irrigation_start_triggers=data["config"].get(
                    CONF_IRRIGATION_START_TRIGGERS,
                    CONF_DEFAULT_IRRIGATION_START_TRIGGERS,
                ),
                skip_irrigation_on_precipitation=data["config"].get(
                    CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
                    CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
                ),
                precipitation_threshold_mm=data["config"].get(
                    CONF_PRECIPITATION_THRESHOLD_MM,
                    CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
                ),
                days_between_irrigation=data["config"].get(
                    CONF_DAYS_BETWEEN_IRRIGATION,
                    CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION,
                ),
                days_since_last_irrigation=data["config"].get(
                    CONF_DAYS_SINCE_LAST_IRRIGATION,
                    CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION,
                ),
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
                        last_updated=zone.get(ZONE_LAST_UPDATED, None),
                        number_of_data_points=zone.get(
                            ZONE_NUMBER_OF_DATA_POINTS, None
                        ),
                        drainage_rate=zone.get(ZONE_DRAINAGE_RATE, None),
                        current_drainage=zone.get(ZONE_CURRENT_DRAINAGE, None),
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
                    mappings[mapping[MAPPING_ID]] = MappingEntry(
                        id=mapping[MAPPING_ID],
                        name=mapping[MAPPING_NAME],
                        mappings=the_map,
                        data=mapping.get(MAPPING_DATA),
                        data_last_updated=mapping.get(MAPPING_DATA_LAST_UPDATED, None),
                        data_last_entry=mapping.get(MAPPING_DATA_LAST_ENTRY, {}),
                        data_last_calculation=mapping.get(
                            MAPPING_DATA_LAST_CALCULATION, {}
                        ),
                    )

        self.config = config
        self.zones = zones
        self.modules = modules
        self.mappings = mappings

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
        # this should be Weather Service mapping if a weather service is defined
        mapping_source = ""
        if self.config.use_weather_service:
            # we're using a weather service
            mapping_source = MAPPING_CONF_SOURCE_WEATHER_SERVICE
        else:
            mapping_source = MAPPING_CONF_SOURCE_SENSOR
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
        conf = {}
        for mapping_key in mappings:
            map_source = mapping_source
            # evapotranspiration and solrad can only come from a sensor or none
            if mapping_key in [MAPPING_EVAPOTRANSPIRATION, MAPPING_SOLRAD]:
                if self.config.use_weather_service:
                    map_source = MAPPING_CONF_SOURCE_NONE
                else:
                    map_source = MAPPING_CONF_SOURCE_SENSOR
            conf[mapping_key] = {
                MAPPING_CONF_SOURCE: map_source,
                MAPPING_CONF_SENSOR: "",
                MAPPING_CONF_UNIT: "",
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
        """Schedule saving the registry of HAppy Irrigation."""
        self._store.async_delay_save(self._data_to_save, SAVE_DELAY)

    async def async_save(self) -> None:
        """Save the registry of HAppy Irrigation."""
        await self._store.async_save(self._data_to_save())

    @callback
    def _data_to_save(self) -> dict:
        """Return data for the registry for HAppy Irrigation to store in a file."""
        store_data = {
            "config": attr.asdict(self.config),
        }

        store_data["zones"] = [attr.asdict(entry) for entry in self.zones.values()]
        store_data["modules"] = [attr.asdict(entry) for entry in self.modules.values()]
        store_data["mappings"] = [
            attr.asdict(entry) for entry in self.mappings.values()
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
        await self.async_save()

    async def async_delete(self):
        """Delete config."""
        _LOGGER.warning("Removing HAppy Irrigation configuration data!")
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
            # apply maximum bucket value
            if (
                ZONE_MAXIMUM_BUCKET in changes
                and changes[ZONE_MAXIMUM_BUCKET] is not None
                and changes[ZONE_BUCKET] is not None
                and changes[ZONE_BUCKET] > changes[ZONE_MAXIMUM_BUCKET]
            ):
                changes[ZONE_BUCKET] = changes[ZONE_MAXIMUM_BUCKET]
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
    """Return HAppy Irrigation storage instance."""
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
