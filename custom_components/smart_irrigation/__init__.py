"""The Smart Irrigation Integration."""

import contextlib
import logging
from datetime import datetime, timedelta

from homeassistant.components.sensor import DOMAIN as PLATFORM
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    CONF_ELEVATION,
    CONF_LATITUDE,
    CONF_LONGITUDE,
    STATE_UNAVAILABLE,
    STATE_UNKNOWN,
)
from homeassistant.core import Event, HomeAssistant, State, asyncio, callback
from homeassistant.helpers import (
    config_validation as cv,
)
from homeassistant.helpers import (
    device_registry as dr,
)
from homeassistant.helpers import (
    entity_registry as er,
)
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_change,
    async_track_time_interval,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import slugify
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .calculation import CalculationMixin
from .exceptions import SmartIrrigationError
from .helpers import (
    altitudeToPressure,
    check_time,
    convert_between,
    convert_mapping_to_metric,
    loadModules,
    relative_to_absolute_pressure,
)
from .irrigation_unlimited import IrrigationUnlimitedIntegration
from .observed_watering import ObservedWateringMixin
from .panel import async_register_panel, remove_panel
from .scheduler import RecurringScheduleManager, SeasonalAdjustmentManager
from .service_handlers import ServiceHandlersMixin
from .skip_conditions import SkipConditionsMixin
from .store import SmartIrrigationStorage, async_get_registry
from .triggers import TriggersMixin
from .valve_runner import ValveRunnerMixin
from .watering_calendar import WateringCalendarMixin
from .weathermodules.OpenMeteoClient import OpenMeteoClient
from .weathermodules.OWMClient import OWMClient
from .weathermodules.PirateWeatherClient import PirateWeatherClient
from .weathermodules.SolarRadiationFallback import SolarRadiationFallbackClient
from .websockets import async_register_websockets

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(const.DOMAIN)


async def async_setup(hass: HomeAssistant, config):
    """Track states and offer events for sensors."""
    return True


async def _migrate_duration_unique_ids(hass: HomeAssistant, entry, store) -> None:
    """Migrate the zone duration sensor's legacy unique_id.

    The duration sensor historically used its own entity_id as unique_id
    (``sensor.smart_irrigation_<slug>`` -- the only entity that did). Rewrite it
    to ``smart_irrigation_<zone_id>_duration`` to match the per-zone scheme. The
    registry entry (hence the entity_id and recorded history) carries over.

    Idempotent: already-migrated ids do not start with ``sensor.`` so they are
    skipped. The ``sensor.`` prefix uniquely identifies the legacy duration ids.

    The per-zone device + unique_id migration approach is adapted from JustChr's
    Smart Irrigation fork (https://github.com/JustChr/HAsmartirrigation), MIT.
    """
    legacy_prefix = f"{PLATFORM}.{const.DOMAIN}_"  # "sensor.smart_irrigation_"
    try:
        zone_ids = list(getattr(store, "zones", None) or [])
    except TypeError:  # store not fully initialized (e.g. mocked) -> nothing to migrate
        zone_ids = []
    slug_to_zone_id = {}
    for zone_id in zone_ids:
        zone = store.get_zone(zone_id)
        name = zone.get(const.ZONE_NAME) if zone else None
        if name:
            slug_to_zone_id.setdefault(slugify(name), zone.get(const.ZONE_ID, zone_id))

    @callback
    def _migrator(reg_entry):
        uid = reg_entry.unique_id
        if (
            reg_entry.domain != PLATFORM
            or not isinstance(uid, str)
            or not uid.startswith(legacy_prefix)
        ):
            return None
        zone_id = slug_to_zone_id.get(uid[len(legacy_prefix) :])
        if zone_id is None:
            return None
        return {"new_unique_id": f"{const.DOMAIN}_{zone_id}_duration"}

    await er.async_migrate_entries(hass, entry.entry_id, _migrator)


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up Smart Irrigation from a config entry."""

    _LOGGER.info("async_setup_entry called for %s", entry.entry_id)

    session = async_get_clientsession(hass)

    store = await async_get_registry(hass)
    # store Weather Service info in hass.data
    hass.data.setdefault(const.DOMAIN, {})
    # load store info into hass.data[const.DOMAIN]
    config = await store.async_get_config()
    hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE] = config.get(
        const.CONF_USE_WEATHER_SERVICE, const.CONF_DEFAULT_USE_WEATHER_SERVICE
    )
    hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = config.get(
        const.CONF_WEATHER_SERVICE, const.CONF_DEFAULT_WEATHER_SERVICE
    )

    # check the entry to see if it matches up, if not, set it.
    if const.CONF_USE_WEATHER_SERVICE in entry.data:
        hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE] = entry.data.get(
            const.CONF_USE_WEATHER_SERVICE
        )
        if hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE]:
            if const.CONF_WEATHER_SERVICE in entry.data:
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = entry.data.get(
                    const.CONF_WEATHER_SERVICE
                )
            if const.CONF_WEATHER_SERVICE_API_KEY in entry.data:
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = (
                    entry.data.get(const.CONF_WEATHER_SERVICE_API_KEY).strip()
                )
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] = (
                entry.data.get(const.CONF_WEATHER_SERVICE_API_VERSION)
            )
    # check for OWM config and migrate accordingly
    if entry.data.get("use_owm"):
        if "owm_api_key" in entry.data:
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = entry.data[
                "owm_api_key"
            ]
    # Options (set by the Reconfigure flow) override the data set at install.
    # Apply them whenever present, not only when use_weather_service itself
    # changed: reconfiguring just the API key must take effect, otherwise the
    # stale key in entry.data keeps being used and the service returns 401 (#683).
    if const.CONF_USE_WEATHER_SERVICE in entry.options:
        hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE] = entry.options.get(
            const.CONF_USE_WEATHER_SERVICE
        )
        if const.CONF_WEATHER_SERVICE in entry.options:
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = entry.options.get(
                const.CONF_WEATHER_SERVICE
            )
        if const.CONF_WEATHER_SERVICE_API_KEY in entry.options:
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = (
                entry.options.get(const.CONF_WEATHER_SERVICE_API_KEY)
            )
            if hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] is not None:
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = hass.data[
                    const.DOMAIN
                ][const.CONF_WEATHER_SERVICE_API_KEY].strip()
        if const.CONF_WEATHER_SERVICE_API_VERSION in entry.options:
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] = (
                entry.options.get(const.CONF_WEATHER_SERVICE_API_VERSION)
            )

    # Removed because of addition of other weather services than OWM
    # check if API version is 2.5, force it to be 3.0. API keys should still be valid.
    # if const.CONF_WEATHER_SERVICE_API_VERSION in hass.data[const.DOMAIN]:
    #    if hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] == "2.5":
    #        hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] = "3.0"
    coordinator = SmartIrrigationCoordinator(hass, session, entry, store)

    device_registry = dr.async_get(hass)
    device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(const.DOMAIN, coordinator.id)},
        name=const.NAME,
        model=const.NAME,
        sw_version=const.VERSION,
        manufacturer=const.MANUFACTURER,
    )

    hass.data[const.DOMAIN]["coordinator"] = coordinator
    hass.data[const.DOMAIN]["zones"] = {}

    # Set up unit system change listener
    async def handle_core_config_change(event):
        """Handle Home Assistant core configuration changes, specifically unit system changes."""
        _LOGGER.debug("Core_config_updated fired: %s", event.data)
        if (
            const.DOMAIN not in hass.data
            or "coordinator" not in hass.data[const.DOMAIN]
        ):
            return

        # Check if unit system has changed by comparing current vs coordinator's cached unit system
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        current_unit_system = hass.config.units

        # Store the previous unit system in coordinator if not already stored
        if not hasattr(coordinator, "_previous_unit_system"):
            coordinator.previous_unit_system = current_unit_system
            return

        # Check if unit system actually changed
        if coordinator.previous_unit_system != current_unit_system:
            _LOGGER.info(
                "Home Assistant unit system changed from %s to %s, updating Smart Irrigation",
                coordinator.previous_unit_system.name,
                current_unit_system.name,
            )

            # Update coordinator's cached unit system
            coordinator.previous_unit_system = current_unit_system

            # Trigger unit system update
            await coordinator.async_handle_unit_system_change()
        else:
            _LOGGER.debug("Core config updated but unit system unchanged")

    coordinator.previous_unit_system = hass.config.units
    # hass.bus.async_listen(
    #    "core_config_updated", core_config_updated_listener_factory(hass)
    # )
    hass.bus.async_listen("core_config_updated", handle_core_config_change)
    _LOGGER.info(
        "Registered listener for Home Assistant core config changes (unit system)"
    )

    # make sure we capture the use_owm state
    await store.async_update_config(
        {const.CONF_USE_WEATHER_SERVICE: coordinator.use_weather_service}
    )

    # NOTE: ne PAS passer data={} ici — ça écrasait entièrement entry.data, qui
    # est le SEUL endroit où la clé API du service météo est persistée (le store
    # ne la garde pas). Comme le config flow ne pose jamais d'unique_id,
    # entry.unique_id reste None et ce bloc s'exécute à CHAQUE setup : l'ancien
    # data={} effaçait donc la clé à chaque redémarrage (elle ne survivait qu'en
    # mémoire jusque-là). Bug partagé avec l'upstream Smart Irrigation.
    if entry.unique_id is None:
        hass.config_entries.async_update_entry(entry, unique_id=coordinator.id)

    # One-time migration: rewrite the duration sensor's legacy unique_id (its
    # entity_id) to the per-zone scheme so it joins the per-zone device while
    # keeping its entity_id and recorded history. Idempotent on later setups.
    await _migrate_duration_unique_ids(hass, entry, store)

    _LOGGER.info("Calling async_forward_entry_setups")
    await hass.config_entries.async_forward_entry_setups(
        entry, [PLATFORM, "number", "button", "binary_sensor"]
    )
    _LOGGER.info("Finished calling async_forward_entry_setups")

    # Every entity platform is now subscribed to "_register_entity"; replay the
    # existing zones to all of them at once. Fired here (not from a single
    # platform) so a second platform cannot miss the replay due to setup order.
    async_dispatcher_send(hass, const.DOMAIN + "_platform_loaded")
    # update listener for options flow
    entry.async_on_unload(entry.add_update_listener(options_update_listener))

    # Register the panel (frontend)
    await async_register_panel(hass)

    # Websocket support
    await async_register_websockets(hass)

    # Register custom services
    register_services(hass)

    # Finish up by setting factory defaults if needed for zones, mappings and modules
    await store.set_up_factory_defaults()

    # Initialize enhanced scheduling managers
    await coordinator.recurring_schedule_manager.async_load_schedules()
    await coordinator.seasonal_adjustment_manager.async_load_adjustments()
    await coordinator.irrigation_unlimited_integration.async_initialize()

    await coordinator.update_subscriptions()

    # Closed-loop bucket: start watching linked valves if the feature is enabled.
    await coordinator.async_setup_observed_watering()

    # Direct valve control: resume any run that was in flight before a restart.
    await coordinator.async_resume_valve_runs()
    return True


async def options_update_listener(hass: HomeAssistant, config_entry):
    """Handle options update."""
    # The panel's weather-service editor applies changes in-place and only
    # writes them to the entry for persistence; skip the (heavy, panel-
    # disrupting) reload in that case.
    if hass.data.get(const.DOMAIN, {}).pop("_suppress_options_reload", False):
        _LOGGER.debug(
            "Skipping entry reload: weather service change applied in-place by panel"
        )
        return
    # copy the api key and version to the hass data
    if const.DOMAIN in hass.data:
        hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE] = (
            config_entry.options.get(const.CONF_USE_WEATHER_SERVICE)
        )
        if hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE]:
            if const.CONF_WEATHER_SERVICE in config_entry.options:
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = (
                    config_entry.options.get(const.CONF_WEATHER_SERVICE)
                )
            if const.CONF_WEATHER_SERVICE_API_KEY in config_entry.options:
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = (
                    config_entry.options.get(const.CONF_WEATHER_SERVICE_API_KEY).strip()
                )
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] = (
                config_entry.options.get(const.CONF_WEATHER_SERVICE_API_VERSION)
            )
        else:
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = None
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = None
            hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_VERSION] = None
        await hass.config_entries.async_reload(config_entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry):
    """Unload Smart Irrigation config entry."""
    unload_ok = all(
        await asyncio.gather(
            hass.config_entries.async_forward_entry_unload(entry, PLATFORM),
            hass.config_entries.async_forward_entry_unload(entry, "number"),
            hass.config_entries.async_forward_entry_unload(entry, "button"),
            hass.config_entries.async_forward_entry_unload(entry, "binary_sensor"),
        )
    )
    if not unload_ok:
        return False

    remove_panel(hass)
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    await coordinator.async_unload()
    return True


async def async_remove_entry(hass: HomeAssistant, entry):
    """Remove Smart Irrigation config entry."""
    remove_panel(hass)
    if const.DOMAIN in hass.data:
        if "coordinator" in hass.data[const.DOMAIN]:
            coordinator = hass.data[const.DOMAIN]["coordinator"]
            await coordinator.async_delete_config()
        del hass.data[const.DOMAIN]


class SmartIrrigationCoordinator(
    ObservedWateringMixin,
    ValveRunnerMixin,
    SkipConditionsMixin,
    ServiceHandlersMixin,
    TriggersMixin,
    WateringCalendarMixin,
    CalculationMixin,
    DataUpdateCoordinator,
):
    """Define an object to hold Smart Irrigation device."""

    def __init__(
        self, hass: HomeAssistant, session, entry, store: SmartIrrigationStorage
    ) -> None:
        """Initialize."""
        self.id = entry.unique_id
        self.hass = hass
        self.entry = entry
        self.store = store
        self.previous_unit_system = hass.config.units
        self.use_weather_service = hass.data[const.DOMAIN][
            const.CONF_USE_WEATHER_SERVICE
        ]

        self.weather_service = hass.data[const.DOMAIN].get(
            const.CONF_WEATHER_SERVICE, None
        )
        self._WeatherServiceClient = None
        if self.use_weather_service:
            # Get effective coordinates before creating weather service clients
            effective_lat, effective_lon, effective_elev = (
                self._get_effective_coordinates()
            )

            api_key = hass.data[const.DOMAIN].get(const.CONF_WEATHER_SERVICE_API_KEY)
            # Open-Meteo is keyless, so build it before the api_key guard.
            if self.weather_service == const.CONF_WEATHER_SERVICE_OM:
                self._WeatherServiceClient = OpenMeteoClient(
                    latitude=effective_lat,
                    longitude=effective_lon,
                    elevation=effective_elev,
                )
            elif not api_key:
                _LOGGER.warning(
                    "Weather service '%s' is enabled but no API key is set; "
                    "skipping weather client setup",
                    self.weather_service,
                )
            elif self.weather_service == const.CONF_WEATHER_SERVICE_OWM:
                self._WeatherServiceClient = OWMClient(
                    api_key=api_key,
                    api_version=hass.data[const.DOMAIN].get(
                        const.CONF_WEATHER_SERVICE_API_VERSION
                    ),
                    latitude=effective_lat,
                    longitude=effective_lon,
                    elevation=effective_elev,
                )
            elif self.weather_service == const.CONF_WEATHER_SERVICE_PW:
                self._WeatherServiceClient = PirateWeatherClient(
                    api_key=api_key,
                    api_version="1",
                    latitude=effective_lat,
                    longitude=effective_lon,
                    elevation=effective_elev,
                )

            # OWM and Pirate Weather do not provide solar radiation; transparently
            # fill it (and FAO-56 ET0) from Open-Meteo so those fields can be
            # sourced from the weather service on any provider.
            if self._WeatherServiceClient is not None and self.weather_service in (
                const.CONF_WEATHER_SERVICE_OWM,
                const.CONF_WEATHER_SERVICE_PW,
            ):
                self._WeatherServiceClient = SolarRadiationFallbackClient(
                    self._WeatherServiceClient,
                    latitude=effective_lat,
                    longitude=effective_lon,
                    elevation=effective_elev,
                )

        # Initialize coordinates for weather services and other features
        (
            self._effective_latitude,
            self._effective_longitude,
            self._effective_elevation,
        ) = self._get_effective_coordinates()

        # Keep latitude and elevation properties for backward compatibility
        self._latitude = self._effective_latitude
        self._elevation = self._effective_elevation

        self._subscriptions = []

        self._subscriptions.append(
            async_dispatcher_connect(
                hass,
                const.DOMAIN + "_platform_loaded",
                self.setup_SmartIrrigation_entities,
            )
        )
        self._track_auto_calc_time_unsub = None
        self._track_auto_update_time_unsub = None
        self._track_auto_clear_time_unsub = None
        self._track_sunrise_event_unsub = None
        self._track_irrigation_triggers_unsub = []  # List to track multiple triggers
        self._track_midnight_time_unsub = None
        self._debounced_update_cancel = {}  # mapping_id -> cancel callback
        # set up auto calc time and auto update time from data
        the_config = self.store.get_config()
        the_config[const.CONF_USE_WEATHER_SERVICE] = self.use_weather_service
        the_config[const.CONF_WEATHER_SERVICE] = self.weather_service
        if the_config[const.CONF_AUTO_UPDATE_ENABLED]:
            # Fire-and-forget: schedule auto update timer setup in background
            hass.loop.create_task(self.set_up_auto_update_time(the_config))
        if the_config[const.CONF_AUTO_CALC_ENABLED]:
            # Fire-and-forget: schedule auto calc timer setup in background
            hass.loop.create_task(self.set_up_auto_calc_time(the_config))
        if the_config[const.CONF_AUTO_CLEAR_ENABLED]:
            # Fire-and-forget: schedule auto clear timer setup in background
            hass.loop.create_task(self.set_up_auto_clear_time(the_config))
        if the_config[const.START_EVENT_FIRED_TODAY]:
            self._start_event_fired_today = True
        else:
            self._start_event_fired_today = False

        # Names of triggers that have already fired today, so each trigger fires
        # independently (replaces the old single global "fired today" block).
        # In-memory; cleared at midnight.
        self._fired_triggers_today: set = set()
        # Today's watering decision (precipitation forecast + days-between),
        # computed once and shared by all triggers for the day:
        # None = undecided, True = water, False = skip.
        self._watering_decision_today = True if self._start_event_fired_today else None

        # Initialize enhanced scheduling managers
        self.recurring_schedule_manager = RecurringScheduleManager(hass, self)
        self.seasonal_adjustment_manager = SeasonalAdjustmentManager(hass, self)
        self.irrigation_unlimited_integration = IrrigationUnlimitedIntegration(
            hass, self
        )

        # WIP v2024.6.X:
        # experiment with subscriptions on sensors
        self._sensor_subscriptions = []
        self._sensors_to_subscribe_to = []

        # Observed watering (closed-loop bucket): subscription to linked valve
        # state changes, the currently-tracked entity set, and per-zone "valve
        # opened at" timestamps. Wired up by async_setup_observed_watering.
        self._observed_unsub = None
        self._observed_entities = frozenset()
        self._observed_on_since = {}
        self._observed_flow_start = {}
        self._observed_zone_by_entity = {}

        # Direct valve control state: per-zone "SI is driving this valve until"
        # markers (suppress the observer), in-flight runs (reboot resume), and
        # the background run tasks (cancelled on unload).
        self._si_driven_until = {}
        self._active_valve_runs = {}
        self._valve_run_tasks = set()

        # set up sunrise tracking
        _LOGGER.debug("calling register start event from init")
        # Fire-and-forget: register start event tracking in background
        asyncio.create_task(self.register_start_event())

        # set up midnight tracking
        self._track_midnight_time_unsub = async_track_time_change(
            hass, self._reset_event_fired_today, 0, 0, 0
        )

        super().__init__(hass, _LOGGER, name=const.DOMAIN)

    def _get_config_value(self, key: str, default_value):
        """Get configuration value from Home Assistant config, entry data, or options with fallback to default.

        Args:
            key: Configuration key to look up (e.g., CONF_LATITUDE, CONF_ELEVATION)
            default_value: Default value to use if not found anywhere

        Returns:
            The configuration value or default_value if not found

        """
        # Try Home Assistant config first (most reliable)
        value = self.hass.config.as_dict().get(key)
        if value is not None:
            return value

        # Try config entry data
        if hasattr(self.entry, "data") and key in self.entry.data:
            return self.entry.data[key]

        # Try config entry options
        if hasattr(self.entry, "options") and key in self.entry.options:
            return self.entry.options[key]

        # Fall back to default
        return default_value

    def _get_effective_coordinates(self):
        """Get the effective coordinates to use for weather services and calculations.

        Returns manual coordinates if enabled, otherwise falls back to Home Assistant config.

        Returns:
            tuple: (latitude, longitude, elevation)

        """
        # Manual coordinates are saved via the websocket API into the store
        # config (not entry.data / HA config), so read them from there.
        cfg = self.store.config
        manual_enabled = getattr(cfg, const.CONF_MANUAL_COORDINATES_ENABLED, False)

        if manual_enabled:
            # Use manual coordinates
            latitude = getattr(cfg, const.CONF_MANUAL_LATITUDE, None)
            longitude = getattr(cfg, const.CONF_MANUAL_LONGITUDE, None)
            elevation = getattr(cfg, const.CONF_MANUAL_ELEVATION, 0)

            if latitude is not None and longitude is not None:
                _LOGGER.info(
                    "Using manual coordinates: lat=%.6f, lon=%.6f, elevation=%sm",
                    latitude,
                    longitude,
                    elevation,
                )
                return latitude, longitude, elevation
            _LOGGER.warning(
                "Manual coordinates enabled but latitude or longitude not set, falling back to Home Assistant config"
            )

        # Fall back to Home Assistant configuration
        ha_lat = self.hass.config.as_dict().get(CONF_LATITUDE, 45.0)
        ha_lon = self.hass.config.as_dict().get(CONF_LONGITUDE, 0.0)
        ha_elev = self.hass.config.as_dict().get(CONF_ELEVATION, 0)

        _LOGGER.info(
            "Using Home Assistant coordinates: lat=%.6f, lon=%.6f, elevation=%sm",
            ha_lat,
            ha_lon,
            ha_elev,
        )

        # Log warnings for default coordinates
        if ha_lat == 45.0 and self.hass.config.as_dict().get(CONF_LATITUDE) is None:
            _LOGGER.warning(
                "Latitude not configured in Home Assistant, using default latitude of 45.0"
            )
        if ha_elev == 0 and self.hass.config.as_dict().get(CONF_ELEVATION) is None:
            _LOGGER.warning(
                "Elevation not configured in Home Assistant, using default elevation of 0m"
            )

        return ha_lat, ha_lon, ha_elev

    async def setup_SmartIrrigation_entities(self):  # noqa: D102
        zones = await self.store.async_get_zones()

        for zone in zones:
            # self.async_create_zone(zone)
            async_dispatcher_send(self.hass, const.DOMAIN + "_register_entity", zone)

    async def async_handle_unit_system_change(self):
        """Handle changes to the Home Assistant unit system."""
        _LOGGER.info("Processing unit system change for Smart Irrigation")

        # Update sensor entities to refresh their unit display
        async_dispatcher_send(self.hass, const.DOMAIN + "_unit_system_changed")

        # Update frontend/websocket clients
        async_dispatcher_send(self.hass, const.DOMAIN + "_update_frontend")

        _LOGGER.info("Unit system change processing complete")

    async def async_update_config(self, data):  # noqa: D102
        _LOGGER.debug("[async_update_config]: config changed: %s", data)

        # Handle precipitation threshold unit conversion
        # Always store internally in mm, but convert from user units if needed
        if const.CONF_PRECIPITATION_THRESHOLD_MM in data:
            threshold_value = data[const.CONF_PRECIPITATION_THRESHOLD_MM]
            if threshold_value is not None:
                # Check if HA is in metric or imperial mode
                ha_config_is_metric = self.hass.config.units is METRIC_SYSTEM
                if not ha_config_is_metric:
                    # User is in imperial mode, so convert from inches to mm for internal storage
                    threshold_mm = convert_between(
                        const.UNIT_INCH, const.UNIT_MM, threshold_value
                    )
                    data[const.CONF_PRECIPITATION_THRESHOLD_MM] = threshold_mm
                    _LOGGER.debug(
                        "Converted precipitation threshold from %.2f inches to %.2f mm for internal storage",
                        threshold_value,
                        threshold_mm,
                    )
                else:
                    # User is in metric mode, value is already in mm
                    _LOGGER.debug(
                        "Precipitation threshold %.2f mm stored directly (metric mode)",
                        threshold_value,
                    )

        # handle auto calc changes
        await self.set_up_auto_calc_time(data)
        # handle auto update changes, includings updating OWMClient cache settings
        await self.set_up_auto_update_time(data)
        # handle auto clear changes
        await self.set_up_auto_clear_time(data)
        await self.store.async_update_config(data)
        # Re-evaluate the observed-watering subscription (the feature toggle may
        # have just changed).
        await self.async_setup_observed_watering()
        async_dispatcher_send(self.hass, const.DOMAIN + "_config_updated")

    async def async_apply_weather_service(self, use, service, api_key):
        """Apply a weather-service change at runtime (no entry reload).

        Rebuilds the weather client and updates hass.data + store so the change
        takes effect immediately. Persistence across restarts is handled by the
        caller writing the values to the config entry data.
        """
        self.use_weather_service = bool(use)
        self.weather_service = service if use else None
        self.hass.data[const.DOMAIN][
            const.CONF_USE_WEATHER_SERVICE
        ] = self.use_weather_service
        self.hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE] = self.weather_service
        self.hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY] = (
            api_key if use else None
        )

        self._WeatherServiceClient = None
        if self.use_weather_service:
            lat, lon, elev = self._get_effective_coordinates()
            if self.weather_service == const.CONF_WEATHER_SERVICE_OM:
                # Open-Meteo is keyless.
                self._WeatherServiceClient = OpenMeteoClient(
                    latitude=lat,
                    longitude=lon,
                    elevation=elev,
                )
            elif self.weather_service == const.CONF_WEATHER_SERVICE_OWM:
                self._WeatherServiceClient = OWMClient(
                    api_key=api_key,
                    api_version=self.hass.data[const.DOMAIN].get(
                        const.CONF_WEATHER_SERVICE_API_VERSION
                    ),
                    latitude=lat,
                    longitude=lon,
                    elevation=elev,
                )
            elif self.weather_service == const.CONF_WEATHER_SERVICE_PW:
                self._WeatherServiceClient = PirateWeatherClient(
                    api_key=api_key,
                    api_version="1",
                    latitude=lat,
                    longitude=lon,
                    elevation=elev,
                )

            # Fill solar radiation / ET0 from Open-Meteo for services that lack it.
            if self._WeatherServiceClient is not None and self.weather_service in (
                const.CONF_WEATHER_SERVICE_OWM,
                const.CONF_WEATHER_SERVICE_PW,
            ):
                self._WeatherServiceClient = SolarRadiationFallbackClient(
                    self._WeatherServiceClient,
                    latitude=lat,
                    longitude=lon,
                    elevation=elev,
                )

        # keep the store in sync so the choice is reflected in the config panel
        await self.store.async_update_config(
            {
                const.CONF_USE_WEATHER_SERVICE: self.use_weather_service,
                const.CONF_WEATHER_SERVICE: self.weather_service,
            }
        )
        async_dispatcher_send(self.hass, const.DOMAIN + "_config_updated")
        _LOGGER.info(
            "Applied weather service in-place: use=%s service=%s",
            self.use_weather_service,
            self.weather_service,
        )

    async def set_up_auto_update_time(self, data):  # noqa: D102
        # WIP v2024.6.X:
        # experiment to use subscriptions to catch all updates instead of just on a time schedule
        await self.update_subscriptions(data)
        if data[const.CONF_AUTO_UPDATE_ENABLED]:
            # CONF_AUTO_UPDATE_SCHEDULE: minute, hour, day
            # CONF_AUTO_UPDATE_INTERVAL: X
            # CONF_AUTO_UPDATE_TIME: first update time
            # 2023.9.0-beta14 experiment: ignore auto update time. Instead do a delay?

            # if check_time(data[const.CONF_AUTO_UPDATE_TIME]):
            # first auto update time is valid
            # update only the actual changed value: auto update time
            #    timesplit = data[const.CONF_AUTO_UPDATE_TIME].split(":")
            #    if self._track_auto_update_time_unsub:
            #        self._track_auto_update_time_unsub()
            #    self._track_auto_update_time_unsub = async_track_time_change(
            #        self.hass,
            #        self._async_track_update_time,
            #        hour=timesplit[0],
            #        minute=timesplit[1],
            #        second=0
            #    )
            #    _LOGGER.info("Scheduled auto update first time update for {}".format(data[const.CONF_AUTO_UPDATE_TIME]))
            # else:
            #    _LOGGER.warning("Schedule auto update time is not valid: {}".format(data[const.CONF_AUTO_UPDATE_TIME]))
            #    raise ValueError("Time is not a valid time")
            # call update track time after waiting [update_delay] seconds

            delay = 0
            if const.CONF_AUTO_UPDATE_DELAY in data:
                if int(data[const.CONF_AUTO_UPDATE_DELAY]) > 0:
                    delay = int(data[const.CONF_AUTO_UPDATE_DELAY])
                    _LOGGER.info("Delaying auto update with %s seconds", delay)
            async_call_later(
                self.hass, timedelta(seconds=delay), self.track_update_time
            )
        elif self._track_auto_update_time_unsub:
            self._track_auto_update_time_unsub()
            self._track_auto_update_time_unsub = None
            await self.store.async_update_config(data)

    async def update_subscriptions(self, config=None):
        """Update sensor subscriptions for Smart Irrigation coordinator."""
        # WIP v2024.6.X: move to subscriptions
        # remove all existing sensor subscriptions
        _LOGGER.debug("[update_subscriptions]: removing all sensor subscriptions")
        for s in self._sensor_subscriptions:
            with contextlib.suppress(Exception):
                s()

        # reset last calculation data
        mappings = await self.store.async_get_mappings()
        async with asyncio.TaskGroup() as tg:
            for mapping in mappings:
                mapping[const.MAPPING_DATA_LAST_CALCULATION] = {}
                tg.create_task(
                    self.store.async_update_mapping(
                        mapping[const.MAPPING_ID],
                        {const.MAPPING_DATA_LAST_CALCULATION: {}},
                    )
                )

        # check if continuous updates are enabled, if not, skip this
        # and log a debug message
        if config is None:
            config = await self.store.async_get_config()
        if not config.get(const.CONF_CONTINUOUS_UPDATES):
            _LOGGER.debug(
                "[update_subscriptions]: continuous updates are disabled, skipping"
            )
            return

        # subscribe to all sensors
        self._sensors_to_subscribe_to = await self.get_sensors_to_subscribe_to()

        if self._sensors_to_subscribe_to is not None:
            for s in self._sensors_to_subscribe_to:
                _LOGGER.debug("[update_subscriptions]: subscribing to %s", s)
                self._sensor_subscriptions.append(
                    async_track_state_change_event(
                        self.hass,
                        s,
                        self.async_sensor_state_changed,
                    )
                )

    async def get_sensors_to_subscribe_to(self):
        """Return a list of sensor entity IDs to subscribe to for state changes."""
        zones = await self.store.async_get_zones()
        mappings = await self._get_unique_mappings_for_automatic_zones(zones)
        sensors_to_subscribe_to = []
        # loop over the mappings and store sensor data
        for mapping_id in mappings:
            (
                owm_in_mapping,
                sensor_in_mapping,
                static_in_mapping,
            ) = self.check_mapping_sources(mapping_id=mapping_id)
            mapping = self.store.get_mapping(mapping_id)
            if mapping is None:
                _LOGGER.debug(
                    "[get_sensors_to_subscribe_to]: mapping %s: is None",
                    mapping_id,
                )
                continue

            _LOGGER.debug(
                "[get_sensors_to_subscribe_to]: mapping %s: %s",
                mapping_id,
                mapping[const.MAPPING_MAPPINGS],
            )
            if sensor_in_mapping:
                for key, the_map in mapping[const.MAPPING_MAPPINGS].items():
                    _LOGGER.debug("[get_sensors_to_subscribe_to]: %s %s", key, the_map)
                    if not isinstance(the_map, str):
                        if the_map.get(
                            const.MAPPING_CONF_SOURCE
                        ) == const.MAPPING_CONF_SOURCE_SENSOR and the_map.get(
                            const.MAPPING_CONF_SENSOR
                        ):
                            # this mapping maps to a sensor, so retrieve its value from HA
                            if (
                                the_map.get(const.MAPPING_CONF_SENSOR)
                                not in sensors_to_subscribe_to
                            ):
                                sensors_to_subscribe_to.append(
                                    the_map.get(const.MAPPING_CONF_SENSOR)
                                )
                            else:
                                _LOGGER.debug(
                                    "[get_sensors_to_subscribe_to]: already added"
                                )
                        else:
                            _LOGGER.debug(
                                "[get_sensors_to_subscribe_to]: not mapped to a sensor"
                            )
                    else:
                        _LOGGER.debug(
                            "[get_sensors_to_subscribe_to]: the_map is a str, skipping"
                        )
            else:
                _LOGGER.debug("[get_sensors_to_subscribe_to]: sensor not in mapping")

        return sensors_to_subscribe_to

    async def async_sensor_state_changed(
        self, event: Event
    ) -> None:  # old signature: entity, old_state, new_state):
        """Handle a sensor state change event."""
        timestamp = datetime.now()

        # old_state_obj = event.data.get("old_state")
        new_state_obj: State | None = event.data.get("new_state")
        if new_state_obj is None:
            return
        entity = event.data.get("entity_id")
        the_new_state = new_state_obj.state

        # ignore states that don't have an actual value
        if new_state_obj.state in [None, STATE_UNKNOWN, STATE_UNAVAILABLE]:
            _LOGGER.debug(
                "[async_sensor_state_changed]: new state for %s is %s, ignoring",
                entity,
                the_new_state,
            )
            return
        _LOGGER.debug(
            "[async_sensor_state_changed]: new state for %s is %s",
            entity,
            the_new_state,
        )

        # get sensor debounce time from config
        debounce = 0
        the_config = await self.store.async_get_config()
        if the_config[const.CONF_SENSOR_DEBOUNCE]:
            debounce = int(the_config[const.CONF_SENSOR_DEBOUNCE])
            _LOGGER.debug(
                "[async_sensor_state_changed]: sensor debounce is %s ms", debounce
            )

        # get the mapping that uses this sensor
        mappings = await self.store.async_get_mappings()
        for mapping in mappings:
            if not mapping.get(const.MAPPING_MAPPINGS):
                continue
            for key, val in mapping.get(const.MAPPING_MAPPINGS).items():
                if isinstance(val, str) or val.get(const.MAPPING_CONF_SENSOR) != entity:
                    continue

                # add the mapping data with the new sensor value
                # conversion to metric
                mapping_data = mapping.get(const.MAPPING_DATA) or []
                mapping_data.append(
                    {
                        key: convert_mapping_to_metric(
                            float(the_new_state),
                            key,
                            val.get(const.MAPPING_CONF_UNIT),
                            self.hass.config.units is METRIC_SYSTEM,
                        ),
                        const.RETRIEVED_AT: timestamp,
                    }
                )
                # store the value in the last entry
                data_last_entry = mapping.get(const.MAPPING_DATA_LAST_ENTRY)
                if data_last_entry is None:
                    data_last_entry = {}
                data_last_entry[key] = mapping_data[-1][key]
                changes = {
                    const.MAPPING_DATA: mapping_data,
                    const.MAPPING_DATA_LAST_ENTRY: data_last_entry,
                }
                await self.store.async_update_mapping(
                    mapping.get(const.MAPPING_ID), changes
                )
                _LOGGER.debug(
                    "[async_sensor_state_changed]: updated sensor group %s %s",
                    mapping.get(const.MAPPING_ID),
                    key,
                )

            mapping_id = mapping.get(const.MAPPING_ID)
            if debounce > 0:
                # Cancel any previously scheduled update for this mapping
                if mapping_id in self._debounced_update_cancel:
                    _LOGGER.debug(
                        "[async_sensor_state_changed]: cancelling previously scheduled update for mapping_id=%s",
                        mapping_id,
                    )
                    self._debounced_update_cancel[mapping_id]()
                    del self._debounced_update_cancel[mapping_id]

                # Schedule the update for this mapping
                _LOGGER.debug(
                    "[async_sensor_state_changed]: scheduling update in %s ms for mapping_id=%s",
                    debounce,
                    mapping_id,
                )
                self._debounced_update_cancel[mapping_id] = async_call_later(
                    self.hass,
                    timedelta(milliseconds=debounce),
                    lambda now, mid=mapping_id: (
                        _LOGGER.debug("[debounce lambda] Fired for mapping_id=%s", mid),
                        self.hass.loop.call_soon_threadsafe(
                            lambda: self.hass.async_create_task(
                                self.async_continuous_update_for_mapping(mid)
                            )
                        ),
                        self._debounced_update_cancel.pop(
                            mid, None
                        ),  # Remove after firing
                    )[-1],
                )
            else:
                _LOGGER.debug(
                    "[async_sensor_state_changed]: no debounce, doing update now for mapping_id=%s",
                    mapping_id,
                )
                await self.async_continuous_update_for_mapping(mapping_id)

    async def async_continuous_update_for_mapping(self, mapping_id):
        """Perform a continuous update for a specific mapping if it does not use a weather service.

        Args:
            mapping_id: The ID of the mapping to update.

        This method checks if the mapping uses a weather service to avoid unnecessary API calls,
        and if not, updates and calculates all automatic zones that use this mapping, assuming their modules do not use forecasting.

        """
        self._debounced_update_cancel.pop(mapping_id, None)

        if mapping_id is None:
            return
        mapping = self.store.get_mapping(mapping_id)
        if mapping is None:
            return

        _LOGGER.info(
            "[async_continuous_update_for_mapping] considering sensor group %s",
            mapping_id,
        )
        (
            weather_service_in_mapping,
            sensor_in_mapping,
            static_in_mapping,
        ) = self.check_mapping_sources(mapping_id)
        if weather_service_in_mapping:
            _LOGGER.info(
                "[async_continuous_update_for_mapping] sensor group uses weather service, skipping automatic update to avoid API calls that can incur costs"
            )
            return

        # add static sensor values
        if static_in_mapping:
            static_values = self.build_static_values_for_mapping(mapping)
            mapping_data = mapping.get(const.MAPPING_DATA) or []
            mapping_data.append(static_values)
            await self.store.async_update_mapping(
                mapping_id,
                {
                    const.MAPPING_DATA: mapping_data,
                },
            )
            _LOGGER.debug(
                "[async_continuous_update_for_mapping]: added static values %s",
                static_values,
            )

        # TODO: convert relative pressure to absolute?

        # if there is sensor data for this mapping, apply aggregates to it.
        sensor_values = await self.apply_aggregates_to_mapping_data(mapping, True)
        if not sensor_values:
            # no data to calculate with!
            _LOGGER.debug(
                "[async_continuous_update_for_mapping] no data available",
            )
            return

        # TODO: maybe calc each module once here

        # calculate each zone in this mapping
        zones = await self._get_zones_that_use_this_mapping(mapping_id)
        zones_to_calculate = []
        for z in zones:
            zones_to_calculate.append(z)
            zone = self.store.get_zone(z)
            if zone is None or zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                _LOGGER.info(
                    "[async_continuous_update_for_mapping] zone %s is not automatic, skipping",
                    z,
                )
                continue
            if zone.get(const.ZONE_MODULE) is None:
                _LOGGER.info(
                    "[async_continuous_update_for_mapping] zone %s has no module, skipping",
                    z,
                )
                continue

            # check the module is not pyeto or if it is, that it does not use forecasting
            mod = self.store.get_module(zone.get(const.ZONE_MODULE))
            if mod is None:
                continue

            can_calculate = False
            if mod.get(const.MODULE_NAME) != "PyETO":
                can_calculate = True
                _LOGGER.info(
                    "[async_continuous_update_for_mapping]: module is not PyETO, so we can calculate for zone %s",
                    zone.get(const.ZONE_ID),
                )
            else:
                # module is PyETO. Check the config for forecast days == 0
                _LOGGER.debug(
                    "[async_continuous_update_for_mapping]: module is PyETO, checking config"
                )
                if mod.get(const.MODULE_CONFIG):
                    _LOGGER.debug(
                        "[async_continuous_update_for_mapping]: module has config: %s",
                        mod.get(const.MODULE_CONFIG),
                    )
                    _LOGGER.debug(
                        "[async_continuous_update_for_mapping]: mod.get(forecast_days,0) returns forecast_days: %s",
                        mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYS, 0
                        ),
                    )
                    # there is a config on the module, so let's check it
                    if (
                        mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYS, 0
                        )
                        == 0
                        or mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYS
                        )
                        == "0"
                        or mod.get(const.MODULE_CONFIG).get(
                            const.CONF_PYETO_FORECAST_DAYS
                        )
                        is None
                    ):
                        can_calculate = True
                        _LOGGER.info(
                            "Checked config for PyETO module on zone %s, forecast_days==0 or None, so we can calculate",
                            zone.get(const.ZONE_ID),
                        )
                    else:
                        _LOGGER.info(
                            "Checked config for PyETO module on zone %s, forecast_days>0, skipping to avoid API calls that can incur costs",
                            zone.get(const.ZONE_ID),
                        )
                else:
                    # default config for pyeto is forecast = 0, since there is no config we can calculate
                    can_calculate = True
                    _LOGGER.info(
                        "[async_continuous_update_for_mapping] for sensor group %s: sensor group does use weather service, skipping automatic update to avoid API calls that can incur costs",
                        mapping_id,
                    )

            _LOGGER.debug(
                "[async_continuous_update_for_mapping]: can_calculate: %s",
                can_calculate,
            )
            if can_calculate:
                # get the zone and calculate
                _LOGGER.debug(
                    "[async_continuous_update_for_mapping] for sensor group %s: calculating zone %s",
                    mapping_id,
                    zone.get(const.ZONE_ID),
                )
                await self.async_calculate_zone(z, sensor_values)
                zones_to_calculate.remove(z)
            else:
                _LOGGER.info(
                    "[async_continuous_update_for_mapping] for sensor group %s: zone %s has module %s that uses forecasting, skipping to avoid API calls that can incur costs",
                    mapping_id,
                    z,
                    mod.get(const.MODULE_NAME),
                )

        # remove weather data from this mapping unless there are zones we did not calculate!
        _LOGGER.debug(
            "[async_continuous_update_for_mapping] for sensor group %s: zones_to_calculate: %s. if this is empty this means that all zones for this sensor group have been calculated and therefore we can remove the weather data",
            mapping_id,
            zones_to_calculate,
        )
        if zones_to_calculate and len(zones_to_calculate) > 0:
            _LOGGER.debug(
                "[async_continuous_update_for_mapping] for sensor group %s: did not calculate all zones, keeping weather data for the sensor group",
                mapping_id,
            )
        else:
            _LOGGER.debug(
                "clearing weather data for sensor group %s since we calculated all dependent zones",
                mapping_id,
            )
            changes = {}
            changes[const.MAPPING_DATA] = []
            await self.store.async_update_mapping(mapping_id, changes=changes)

    async def set_up_auto_calc_time(self, data):
        """Set up the automatic calculation time for Smart Irrigation based on configuration data."""
        # unsubscribe from any existing track_time_changes
        if self._track_auto_calc_time_unsub:
            self._track_auto_calc_time_unsub()
            self._track_auto_calc_time_unsub = None
        if data[const.CONF_AUTO_CALC_ENABLED]:
            # make sure to unsub any existing and add for calc time
            if check_time(data[const.CONF_CALC_TIME]):
                # make sure we track this time and at that moment trigger the refresh of all modules of all zones that are on automatic
                timesplit = data[const.CONF_CALC_TIME].split(":")
                self._track_auto_calc_time_unsub = async_track_time_change(
                    self.hass,
                    self._async_calculate_all,
                    hour=timesplit[0],
                    minute=timesplit[1],
                    second=0,
                )
                _LOGGER.info(
                    "Scheduled auto calculate for %s", data[const.CONF_CALC_TIME]
                )
            else:
                _LOGGER.warning(
                    "Scheduled auto calculate time is not valid: %s",
                    data[const.CONF_CALC_TIME],
                )
                # raise ValueError("Time is not a valid time")
        else:
            # set OWM client cache to 0
            if self._WeatherServiceClient:
                self._WeatherServiceClient.cache_seconds = 0
            # remove all time trackers
            if self._track_auto_calc_time_unsub:
                self._track_auto_calc_time_unsub()
                self._track_auto_calc_time_unsub = None
            await self.store.async_update_config(data)

    async def set_up_auto_clear_time(self, data):
        """Set up the automatic clear time for Smart Irrigation based on configuration data."""
        # unsubscribe from any existing track_time_changes
        if self._track_auto_clear_time_unsub:
            self._track_auto_clear_time_unsub()
            self._track_auto_clear_time_unsub = None
        if data[const.CONF_AUTO_CLEAR_ENABLED]:
            # make sure to unsub any existing and add for clear time
            if check_time(data[const.CONF_CLEAR_TIME]):
                timesplit = data[const.CONF_CLEAR_TIME].split(":")

                self._track_auto_clear_time_unsub = async_track_time_change(
                    self.hass,
                    self._async_clear_all_weatherdata,
                    hour=timesplit[0],
                    minute=timesplit[1],
                    second=0,
                )
                _LOGGER.info(
                    "Scheduled auto clear of weatherdata for %s",
                    data[const.CONF_CLEAR_TIME],
                )
            else:
                _LOGGER.warning(
                    "Scheduled auto clear time is not valid: %s",
                    data[const.CONF_CLEAR_TIME],
                )
                raise ValueError("Time is not a valid time")
        await self.store.async_update_config(data)

    async def track_update_time(self, *args):
        """Track and schedule periodic updates for Smart Irrigation based on configuration."""
        # Do an immediate update only when Home Assistant is already running
        # (e.g. the user just changed a setting). Skip it during start-up, when
        # source sensors may not have a value yet and would poison the data.
        if self.hass.is_running:
            self.hass.async_create_task(self._async_update_all())
        # use async_track_time_interval
        data = await self.store.async_get_config()
        the_time_delta = None
        interval = int(data[const.CONF_AUTO_UPDATE_INTERVAL])
        if data[const.CONF_AUTO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_DAILY:
            # track time X days
            the_time_delta = timedelta(days=interval)
        elif data[const.CONF_AUTO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_HOURLY:
            # track time X hours
            the_time_delta = timedelta(hours=interval)
        elif data[const.CONF_AUTO_UPDATE_SCHEDULE] == const.CONF_AUTO_UPDATE_MINUTELY:
            # track time X minutes
            the_time_delta = timedelta(minutes=interval)
        # update cache for OWMClient to time delta in seconds -1
        if self._WeatherServiceClient:
            self._WeatherServiceClient.cache_seconds = (
                the_time_delta.total_seconds() - 1
            )

        if self._track_auto_update_time_unsub:
            self._track_auto_update_time_unsub()
            self._track_auto_update_time_unsub = None
        self._track_auto_update_time_unsub = async_track_time_interval(
            self.hass, self._async_update_all, the_time_delta
        )
        _LOGGER.info("Scheduled auto update time interval for each %s", the_time_delta)

    async def _get_unique_mappings_for_automatic_zones(self, zones):
        mappings = [
            zone.get(const.ZONE_MAPPING)
            for zone in zones
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_AUTOMATIC
        ]
        # remove duplicates
        return list(set(mappings))

    async def _get_zones_that_use_this_mapping(self, mapping):
        """Return a list of zone IDs that use the specified mapping."""
        return [
            z.get(const.ZONE_ID)
            for z in await self.store.async_get_zones()
            if z.get(const.ZONE_MAPPING) == mapping
        ]

    async def _async_update_zone(self, zone_id):
        # update the weather data for the mapping for the zone
        _LOGGER.info("Updating weather data for zone %s", zone_id)
        zone = self.store.get_zone(zone_id)
        if not zone:
            raise SmartIrrigationError(f"Zone {zone_id} not found")
        mapping_id = zone.get(const.ZONE_MAPPING)
        if mapping_id is not None:
            mapping = self.store.get_mapping(mapping_id)
            (
                owm_in_mapping,
                sensor_in_mapping,
                static_in_mapping,
            ) = self.check_mapping_sources(mapping_id=mapping_id)
            weatherdata = None
            if self.use_weather_service and owm_in_mapping:
                # retrieve data from OWM
                weatherdata = await self.hass.async_add_executor_job(
                    self._WeatherServiceClient.get_data
                )

            if sensor_in_mapping:
                sensor_values = self.build_sensor_values_for_mapping(mapping)
                # A sensor-sourced field must come ONLY from its sensor, never
                # fall back to weather service data. Strip these keys from the
                # weather data first: an unavailable sensor (zha not yet loaded
                # at startup, or a runtime dropout) is then omitted from the
                # record instead of silently storing the weather value as if it
                # were the sensor reading.
                if weatherdata:
                    for k in self._get_sensor_sourced_keys(mapping):
                        if (
                            k not in sensor_values
                            and weatherdata.pop(k, None) is not None
                        ):
                            _LOGGER.warning(
                                "[update] sensor group %s: '%s' is sensor-sourced but its sensor is unavailable; omitting from this record (no weather-data fallback)",
                                mapping_id,
                                k,
                            )
                weatherdata = await self.merge_weatherdata_and_sensor_values(
                    weatherdata, sensor_values
                )
            if static_in_mapping:
                static_values = self.build_static_values_for_mapping(mapping)
                weatherdata = await self.merge_weatherdata_and_sensor_values(
                    weatherdata, static_values
                )
            if sensor_in_mapping or static_in_mapping:
                # if pressure type is set to relative, replace it with absolute. not necessary for OWM as it already happened
                # convert the relative pressure to absolute or estimate from height
                if (
                    mapping.get(const.MAPPING_MAPPINGS)
                    .get(const.MAPPING_PRESSURE)
                    .get(const.MAPPING_CONF_PRESSURE_TYPE)
                    == const.MAPPING_CONF_PRESSURE_RELATIVE
                ):
                    if const.MAPPING_PRESSURE in weatherdata:
                        weatherdata[const.MAPPING_PRESSURE] = (
                            relative_to_absolute_pressure(
                                weatherdata[const.MAPPING_PRESSURE],
                                self.hass.config.as_dict().get(CONF_ELEVATION),
                            )
                        )
                    else:
                        weatherdata[const.MAPPING_PRESSURE] = altitudeToPressure(
                            self.hass.config.as_dict().get(CONF_ELEVATION)
                        )

            # add the weatherdata value to the mappings sensor values
            if mapping is not None and weatherdata is not None:
                weatherdata[const.RETRIEVED_AT] = datetime.now()
                mapping_data = mapping[const.MAPPING_DATA]
                if isinstance(mapping_data, list):
                    mapping_data.append(weatherdata)
                elif isinstance(mapping_data, str):
                    mapping_data = [weatherdata]
                else:
                    _LOGGER.error(
                        "[async_update_all]: sensor group is unexpected type: %s",
                        mapping_data,
                    )
                _LOGGER.debug(
                    "async_update_all for mapping %s new weatherdata: %s",
                    mapping_id,
                    weatherdata,
                )
                changes = {
                    "data": mapping_data,
                    const.MAPPING_DATA_LAST_UPDATED: datetime.now(),
                }
                await self.store.async_update_mapping(mapping_id, changes)
                # store last updated and number of data points in the zone here.
                changes_to_zone = {
                    const.ZONE_LAST_UPDATED: changes[const.MAPPING_DATA_LAST_UPDATED],
                    const.ZONE_NUMBER_OF_DATA_POINTS: len(mapping_data) - 1,
                }
                await self.store.async_update_zone(zone_id, changes_to_zone)
                async_dispatcher_send(
                    self.hass,
                    const.DOMAIN + "_config_updated",
                    zone,
                )
            else:
                if mapping is None:
                    _LOGGER.warning(
                        "[async_update_all] Unable to find sensor group with id: %s",
                        mapping_id,
                    )
                if weatherdata is None:
                    _LOGGER.warning(
                        "[async_update_all] No weather data to parse for sensor group %s",
                        mapping_id,
                    )

    async def _async_update_all(self, *args):
        # update the weather data for all mappings for all zones that are automatic here and store it.
        # in _async_calculate_all we need to read that data back and if there is none, we log an error, otherwise apply aggregate and use data
        # this should skip any pure sensor zones if continuous updates is enabled, otherwise it should include them
        _LOGGER.info("Updating weather data for all automatic zones")
        zones = await self.store.async_get_zones()
        mappings = await self._get_unique_mappings_for_automatic_zones(zones)
        # loop over the mappings and store sensor data
        for mapping_id in mappings:
            (
                owm_in_mapping,
                sensor_in_mapping,
                static_in_mapping,
            ) = self.check_mapping_sources(mapping_id=mapping_id)
            the_config = await self.store.async_get_config()
            if the_config.get(const.CONF_CONTINUOUS_UPDATES) and not owm_in_mapping:
                # if continuous updates are enabled, we do not need to update the mappings here for pure sensor mappings
                _LOGGER.debug(
                    "Continuous updates are enabled, skipping update for sensor group %s because it is not dependent on weather service and should already be included in the continuous updates",
                    mapping_id,
                )
                continue
            _LOGGER.debug(
                "Continuous updates are enabled, but updating sensor group %s as part of scheduled updates because it is dependent on weather service and therefore is not included in continuous updates",
                mapping_id,
            )
            mapping = self.store.get_mapping(mapping_id)
            weatherdata = None
            if self.use_weather_service and owm_in_mapping:
                # retrieve data from OWM
                weatherdata = await self.hass.async_add_executor_job(
                    self._WeatherServiceClient.get_data
                )

            if sensor_in_mapping:
                sensor_values = self.build_sensor_values_for_mapping(mapping)
                # A sensor-sourced field must come ONLY from its sensor, never
                # fall back to weather service data. Strip these keys from the
                # weather data first: an unavailable sensor (zha not yet loaded
                # at startup, or a runtime dropout) is then omitted from the
                # record instead of silently storing the weather value as if it
                # were the sensor reading.
                if weatherdata:
                    for k in self._get_sensor_sourced_keys(mapping):
                        if (
                            k not in sensor_values
                            and weatherdata.pop(k, None) is not None
                        ):
                            _LOGGER.warning(
                                "[update] sensor group %s: '%s' is sensor-sourced but its sensor is unavailable; omitting from this record (no weather-data fallback)",
                                mapping_id,
                                k,
                            )
                weatherdata = await self.merge_weatherdata_and_sensor_values(
                    weatherdata, sensor_values
                )
            if static_in_mapping:
                static_values = self.build_static_values_for_mapping(mapping)
                weatherdata = await self.merge_weatherdata_and_sensor_values(
                    weatherdata, static_values
                )
            if sensor_in_mapping or static_in_mapping:
                # if pressure type is set to relative, replace it with absolute. not necessary for OWM as it already happened
                # convert the relative pressure to absolute or estimate from height
                if (
                    mapping.get(const.MAPPING_MAPPINGS)
                    .get(const.MAPPING_PRESSURE)
                    .get(const.MAPPING_CONF_PRESSURE_TYPE)
                    == const.MAPPING_CONF_PRESSURE_RELATIVE
                ):
                    if const.MAPPING_PRESSURE in weatherdata:
                        weatherdata[const.MAPPING_PRESSURE] = (
                            relative_to_absolute_pressure(
                                weatherdata[const.MAPPING_PRESSURE],
                                self.hass.config.as_dict().get(CONF_ELEVATION),
                            )
                        )
                    else:
                        weatherdata[const.MAPPING_PRESSURE] = altitudeToPressure(
                            self.hass.config.as_dict().get(CONF_ELEVATION)
                        )

            # add the weatherdata value to the mappings sensor values
            if mapping is not None and weatherdata is not None:
                weatherdata[const.RETRIEVED_AT] = datetime.now()
                mapping_data = mapping[const.MAPPING_DATA]
                if isinstance(mapping_data, list):
                    mapping_data.append(weatherdata)
                elif isinstance(mapping_data, str):
                    mapping_data = [weatherdata]
                else:
                    _LOGGER.error(
                        "[async_update_all]: sensor group is unexpected type: %s",
                        mapping_data,
                    )
                _LOGGER.debug(
                    "async_update_all for mapping %s new weatherdata: %s",
                    mapping_id,
                    weatherdata,
                )
                changes = {
                    "data": mapping_data,
                }
                await self.store.async_update_mapping(mapping_id, changes)
                # store last updated and number of data points in the zone here.
                changes_to_zone = {
                    const.ZONE_LAST_UPDATED: datetime.now(),
                    const.ZONE_NUMBER_OF_DATA_POINTS: len(mapping_data) - 1,
                }
                zones_to_loop = await self._get_zones_that_use_this_mapping(mapping_id)
                for z in zones_to_loop:
                    await self.store.async_update_zone(z, changes_to_zone)
                    async_dispatcher_send(
                        self.hass,
                        const.DOMAIN + "_config_updated",
                        z,
                    )
            else:
                if mapping is None:
                    _LOGGER.warning(
                        "[async_update_all] Unable to find sensor group with id: %s",
                        mapping_id,
                    )
                if weatherdata is None:
                    _LOGGER.warning(
                        "[async_update_all] No weather data to parse for sensor group %s",
                        mapping_id,
                    )

    async def async_update_module_config(
        self, module_id: int | None = None, data: dict | None = None
    ):
        """Update, create, or delete a module configuration.

        Args:
            module_id: The ID of the module to update or delete.
            data: The configuration data for the module.

        """
        if data is None:
            data = {}
        if module_id is not None:
            module_id = int(module_id)
        if const.ATTR_REMOVE in data:
            # delete a module
            module = self.store.get_module(module_id)
            if not module:
                return
            await self.store.async_delete_module(module_id)
        elif module_id is not None and self.store.get_module(module_id):
            # modify a module
            await self.store.async_update_module(module_id, data)
            async_dispatcher_send(
                self.hass, const.DOMAIN + "_config_updated", module_id
            )
        else:
            # create a module
            await self.store.async_create_module(data)
            await self.store.async_get_config()

    async def async_update_mapping_config(
        self, mapping_id: int | None = None, data: dict | None = None
    ):
        """Update, create, or delete a mapping configuration.

        Args:
            mapping_id: The ID of the mapping to update or delete.
            data: The configuration data for the mapping.

        """
        _LOGGER.debug(
            "[async_update_mapping_config]: update for mapping %s, data: %s",
            mapping_id,
            data,
        )
        if data is None:
            data = {}
        if mapping_id is not None:
            mapping_id = int(mapping_id)
        if const.ATTR_REMOVE in data:
            # delete a mapping
            res = self.store.get_mapping(mapping_id)
            if not res:
                return
            await self.store.async_delete_mapping(mapping_id)
        elif mapping_id is not None and self.store.get_mapping(mapping_id):
            # modify a mapping
            await self.store.async_update_mapping(mapping_id, data)
            async_dispatcher_send(
                self.hass, const.DOMAIN + "_config_updated", mapping_id
            )
        else:
            # create a mapping
            await self.store.async_create_mapping(data)
            await self.store.async_get_config()

        # update the list of sensors to follow - then unsubscribe / subscribe
        await self.update_subscriptions()

    def check_mapping_sources(self, mapping_id):
        """Check which data sources (weather service, sensor, static value) are present in a mapping.

        Args:
            mapping_id: The ID of the mapping to check.

        Returns:
            Tuple of booleans: (owm_in_mapping, sensor_in_mapping, static_in_mapping)

        """
        owm_in_mapping = False
        sensor_in_mapping = False
        static_in_mapping = False
        if mapping_id is not None:
            mapping = self.store.get_mapping(mapping_id)
            if mapping is not None:
                for the_map in mapping[const.MAPPING_MAPPINGS].values():
                    if not isinstance(the_map, str):
                        if (
                            the_map.get(const.MAPPING_CONF_SOURCE)
                            == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
                        ):
                            owm_in_mapping = True
                        if (
                            the_map.get(const.MAPPING_CONF_SOURCE)
                            == const.MAPPING_CONF_SOURCE_SENSOR
                        ):
                            sensor_in_mapping = True
                        if (
                            the_map.get(const.MAPPING_CONF_SOURCE)
                            == const.MAPPING_CONF_SOURCE_STATIC_VALUE
                        ):
                            static_in_mapping = True
            else:
                _LOGGER.debug(
                    "[check_mapping_sources] sensor group %s is None", mapping_id
                )
            _LOGGER.debug(
                "check_mapping_sources for mapping_id %s returns OWM: %s, sensor: %s, static: %s",
                mapping_id,
                owm_in_mapping,
                sensor_in_mapping,
                static_in_mapping,
            )
        return owm_in_mapping, sensor_in_mapping, static_in_mapping

    def _get_sensor_sourced_keys(self, mapping):
        """Return the set of mapping field keys whose source is a sensor.

        Used so a sensor-sourced field never silently falls back to weather
        service data when its sensor is unavailable (see _async_update_zone /
        _async_update_all): these keys are stripped from the weather data
        before merging the sensor values.
        """
        keys = set()
        if mapping is not None:
            for key, the_map in mapping[const.MAPPING_MAPPINGS].items():
                if not isinstance(the_map, str) and (
                    the_map.get(const.MAPPING_CONF_SOURCE)
                    == const.MAPPING_CONF_SOURCE_SENSOR
                ):
                    keys.add(key)
        return keys

    def build_sensor_values_for_mapping(self, mapping):
        """Build a dictionary of sensor values for a given mapping by retrieving and converting sensor states from Home Assistant.

        Args:
            mapping: The mapping dictionary containing sensor configuration.

        Returns:
            dict: A dictionary of sensor keys and their corresponding metric values.

        """
        sensor_values = {}
        for key, the_map in mapping[const.MAPPING_MAPPINGS].items():
            if not isinstance(the_map, str):
                if the_map.get(
                    const.MAPPING_CONF_SOURCE
                ) == const.MAPPING_CONF_SOURCE_SENSOR and the_map.get(
                    const.MAPPING_CONF_SENSOR
                ):
                    # this mapping maps to a sensor, so retrieve its value from HA
                    if self.hass.states.get(the_map.get(const.MAPPING_CONF_SENSOR)):
                        try:
                            val = float(
                                self.hass.states.get(
                                    the_map.get(const.MAPPING_CONF_SENSOR)
                                ).state
                            )
                            # make sure to store the val as metric and do necessary conversions along the way
                            val = convert_mapping_to_metric(
                                val,
                                key,
                                the_map.get(const.MAPPING_CONF_UNIT),
                                self.hass.config.units is METRIC_SYSTEM,
                            )
                            # add val to sensor values, at debug logging level due to startup ordering issues
                            sensor_values[key] = val
                        except (ValueError, TypeError):
                            _LOGGER.debug(
                                "No / unknown value for sensor %s",
                                the_map.get(const.MAPPING_CONF_SENSOR),
                            )

        return sensor_values

    def build_static_values_for_mapping(self, mapping):
        """Build a dictionary of static values for a given mapping by retrieving and converting static values.

        Args:
            mapping: The mapping dictionary containing static value configuration.

        Returns:
            dict: A dictionary of sensor keys and their corresponding static metric values.

        """
        static_values = {}
        for key, the_map in mapping[const.MAPPING_MAPPINGS].items():
            if not isinstance(the_map, str):
                if (
                    the_map.get(const.MAPPING_CONF_SOURCE)
                    == const.MAPPING_CONF_SOURCE_STATIC_VALUE
                    and the_map.get(const.MAPPING_CONF_STATIC_VALUE) is not None
                ):
                    # this mapping maps to a static value, so return its value
                    val = float(the_map.get(const.MAPPING_CONF_STATIC_VALUE))
                    # first check we are not in metric mode already.
                    if self.hass.config.units is not METRIC_SYSTEM:
                        val = convert_mapping_to_metric(
                            val, key, the_map.get(const.MAPPING_CONF_UNIT), False
                        )
                    # add val to sensor values
                    static_values[key] = val
        return static_values

    async def async_update_zone_config(
        self, zone_id: int | None = None, data: dict | None = None
    ):
        """Update, create, or delete a zone configuration.

        Args:
            zone_id: The ID of the zone to update or delete.
            data: The configuration data for the mapping.

        """
        _LOGGER.debug("[async_update_zone_config]: updating zone %s", zone_id)
        if data is None:
            data = {}
        if zone_id is not None:
            zone_id = int(zone_id)
        if const.ATTR_REMOVE in data:
            # delete a zone
            zone = self.store.get_zone(zone_id)
            if not zone:
                return
            await self.store.async_delete_zone(zone_id)
            await self.async_remove_entity(zone_id)

        elif const.ATTR_CALCULATE in data:
            # calculate a specific zone
            _LOGGER.info("Calculating zone %s", zone_id)
            if data is not None:
                data.pop(const.ATTR_CALCULATE)
            delete_weather_data = data.get(const.ATTR_DELETE_WEATHER_DATA, True)

            # aggregate sensor data
            weatherdata = None
            zone = self.store.get_zone(zone_id)
            mapping_id = zone[const.ZONE_MAPPING]
            mapping = self.store.get_mapping(mapping_id)
            if mapping.get(const.MAPPING_DATA):
                weatherdata = await self.apply_aggregates_to_mapping_data(mapping)
            else:
                _LOGGER.error(
                    "[async_update_zone_config] Error calculating zone %s: no sensor data available",
                    zone.get(const.ZONE_NAME),
                )
                return

            # get forecast data if needed
            forecastdata = None
            modinst = await self.getModuleInstanceByID(zone.get(const.ZONE_MODULE))
            if modinst and modinst.name == "PyETO" and modinst.forecast_days > 0:
                if self.use_weather_service:
                    # get forecast info from OWM
                    forecastdata = await self.hass.async_add_executor_job(
                        self._WeatherServiceClient.get_forecast_data
                    )
                else:
                    _LOGGER.error(
                        "[async_update_zone_config] Error calculating zone %s: You have configured forecasting but there is no OWM API configured. Either configure the OWM API or stop using forecasting on the PyETO module",
                        zone.get(const.ZONE_NAME),
                    )
                    return

            await self.async_calculate_zone(
                zone_id, weatherdata, forecastdata, delete_weather_data
            )
        elif const.ATTR_CALCULATE_ALL in data:
            # calculate all zones
            _LOGGER.info("Calculating all zones")
            data.pop(const.ATTR_CALCULATE_ALL)
            await self._async_calculate_all(delete_weather_data=True)

        elif const.ATTR_UPDATE in data:
            _LOGGER.info("Updating zone %s", zone_id)
            await self._async_update_zone(zone_id)
        elif const.ATTR_UPDATE_ALL in data:
            _LOGGER.info("Updating all zones")
            await self._async_update_all()
        elif const.ATTR_RESET_ALL_BUCKETS in data:
            # reset all buckets
            _LOGGER.info("Resetting all buckets")
            data.pop(const.ATTR_RESET_ALL_BUCKETS)
            await self.handle_reset_all_buckets(None)
        elif const.ATTR_CLEAR_ALL_WEATHERDATA in data:
            # clear all weatherdata
            _LOGGER.info("Clearing all weatherdata")
            data.pop(const.ATTR_CLEAR_ALL_WEATHERDATA)
            await self.handle_clear_weatherdata(None)
        elif zone_id is not None and self.store.get_zone(zone_id):
            # modify a zone
            entry = await self.store.async_update_zone(zone_id, data)
            async_dispatcher_send(self.hass, const.DOMAIN + "_config_updated", zone_id)
            await self.update_subscriptions()
            # make sure to update the HA entity here by listening to this in sensor.py.
            # this should be called by changes from the UI (by user) or by a calculation module (updating a duration), which should be done in python
        else:
            # create a zone
            entry = await self.store.async_create_zone(data)

            async_dispatcher_send(self.hass, const.DOMAIN + "_register_entity", entry)

            await self.store.async_get_config()

        # update the start event
        _LOGGER.debug("calling register start event from async_update_zone_config")
        await self.register_start_event()

        # A zone's linked valve entity may have changed; refresh the observer.
        await self.async_setup_observed_watering()

    async def async_get_all_modules(self):
        """Get all ModuleEntries."""
        res = []
        mods = await self.hass.async_add_executor_job(loadModules, const.MODULE_DIR)
        for mod in mods:
            m = getattr(mods[mod]["module"], mods[mod]["class"])
            s = m(self.hass, None, {})
            res.append(
                {
                    "name": s.name,
                    "description": s.description,
                    "config": s.config,
                    "schema": s.schema_serialized(),
                }
            )
        return res

    async def async_remove_entity(self, zone_id: str):
        """Remove an entity corresponding to the given zone ID from Home Assistant.

        Args:
            zone_id: The ID of the zone whose entity should be removed.

        """
        entity_registry = er.async_get(self.hass)
        zone_id = int(zone_id)
        entity = self.hass.data[const.DOMAIN]["zones"][zone_id]
        entity_registry.async_remove(entity.entity_id)
        self.hass.data[const.DOMAIN]["zones"].pop(zone_id, None)

    async def async_unload(self):
        """Remove all Smart Irrigation objects."""

        # Clear the in-memory zones dict only; the entity platform manages entity
        # state on unload. Registry entries are preserved so user customizations
        # (friendly names, areas) survive disable/re-enable cycles and entity_id
        # collisions (_2, _3 suffixes) no longer happen on re-enable. See #506.
        self.hass.data[const.DOMAIN]["zones"].clear()

        # remove subscriptions for coordinator
        while self._subscriptions:
            self._subscriptions.pop()()

        # stop watching linked valves (closed-loop bucket)
        self.async_teardown_observed_watering()

        # cancel any in-flight direct valve runs
        self.async_teardown_valve_runs()

    async def async_delete_config(self):
        """Wipe Smart Irrigation storage."""
        await self.store.async_delete()


@callback
def register_services(hass: HomeAssistant):
    """Register services used by Smart Irrigation integration."""

    coordinator = hass.data[const.DOMAIN]["coordinator"]

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_CALCULATE_ALL_ZONES,
        coordinator.handle_calculate_all_zones,
    )
    hass.services.async_register(
        const.DOMAIN, const.SERVICE_CALCULATE_ZONE, coordinator.handle_calculate_zone
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_UPDATE_ALL_ZONES,
        coordinator.handle_update_all_zones,
    )
    hass.services.async_register(
        const.DOMAIN, const.SERVICE_UPDATE_ZONE, coordinator.handle_update_zone
    )
    hass.services.async_register(
        const.DOMAIN, const.SERVICE_RESET_BUCKET, coordinator.handle_reset_bucket
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_RESET_ALL_BUCKETS,
        coordinator.handle_reset_all_buckets,
    )

    hass.services.async_register(
        const.DOMAIN, const.SERVICE_SET_BUCKET, coordinator.handle_set_zone
    )

    hass.services.async_register(
        const.DOMAIN, const.SERVICE_SET_ALL_BUCKETS, coordinator.handle_set_all_buckets
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_CLEAR_WEATHERDATA,
        coordinator.handle_clear_weatherdata,
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_SET_ALL_MULTIPLIERS,
        coordinator.handle_set_all_multipliers,
    )

    hass.services.async_register(
        const.DOMAIN, const.SERVICE_SET_MULTIPLIER, coordinator.handle_set_zone
    )

    hass.services.async_register(
        const.DOMAIN, const.SERVICE_SET_ZONE, coordinator.handle_set_zone
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_GENERATE_WATERING_CALENDAR,
        coordinator.handle_generate_watering_calendar,
    )

    # Enhanced scheduling services
    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_CREATE_RECURRING_SCHEDULE,
        coordinator.handle_create_recurring_schedule,
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_UPDATE_RECURRING_SCHEDULE,
        coordinator.handle_update_recurring_schedule,
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_DELETE_RECURRING_SCHEDULE,
        coordinator.handle_delete_recurring_schedule,
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_CREATE_SEASONAL_ADJUSTMENT,
        coordinator.handle_create_seasonal_adjustment,
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_UPDATE_SEASONAL_ADJUSTMENT,
        coordinator.handle_update_seasonal_adjustment,
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_DELETE_SEASONAL_ADJUSTMENT,
        coordinator.handle_delete_seasonal_adjustment,
    )

    # Irrigation Unlimited integration services
    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_SYNC_WITH_IRRIGATION_UNLIMITED,
        coordinator.handle_sync_with_irrigation_unlimited,
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_SEND_ZONE_DATA_TO_IU,
        coordinator.handle_send_zone_data_to_iu,
    )

    hass.services.async_register(
        const.DOMAIN,
        const.SERVICE_GET_IU_SCHEDULE_STATUS,
        coordinator.handle_get_iu_schedule_status,
    )
