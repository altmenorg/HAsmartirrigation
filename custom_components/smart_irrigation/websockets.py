"""Websocket and HTTP API views for Smart Irrigation integration."""

import datetime
import logging

import voluptuous as vol
from dateutil import parser as dateutil_parser
from homeassistant.components import websocket_api
from homeassistant.components.http import HomeAssistantView, require_admin
from homeassistant.components.http.data_validator import RequestDataValidator
from homeassistant.components.websocket_api import (
    async_register_command,
    async_response,
    decorators,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .calcmodules.consumes import consumed_mappings

_LOGGER = logging.getLogger(__name__)


def _safe_parse_datetime(value):
    """Safely parse a datetime value, returning datetime.min as fallback."""
    if isinstance(value, datetime.datetime):
        # Convert timezone-aware datetime to naive UTC for consistent comparison
        if value.tzinfo is not None:
            return value.astimezone(datetime.UTC).replace(tzinfo=None)
        return value
    if isinstance(value, str):
        try:
            parsed = dateutil_parser.isoparse(value)
            # Convert timezone-aware datetime to naive UTC for consistent comparison
            if parsed.tzinfo is not None:
                return parsed.astimezone(datetime.UTC).replace(tzinfo=None)
            return parsed
        except (ValueError, TypeError):
            _LOGGER.warning("Failed to parse datetime string: %s", value)
            return datetime.datetime.min
    return datetime.datetime.min


@decorators.websocket_command(
    {
        vol.Required("type"): const.DOMAIN + "_config_updated",
    }
)
@decorators.async_response
async def handle_subscribe_updates(hass: HomeAssistant, connection, msg):
    """Handle subscribe updates."""

    @callback
    def async_handle_event():
        """Forward events to websocket."""
        connection.send_message(
            {
                "id": msg["id"],
                "type": "event",
            }
        )

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(
        hass, const.DOMAIN + "_update_frontend", async_handle_event
    )
    connection.send_result(msg["id"])


class SmartIrrigationConfigView(HomeAssistantView):
    """View to handle Smart Irrigation configuration updates via HTTP API."""

    url = "/api/" + const.DOMAIN + "/config"
    name = "api:" + const.DOMAIN + ":config"

    @RequestDataValidator(
        vol.Schema(
            {
                vol.Optional(const.CONF_CALC_TIME): cv.string,
                vol.Optional(const.CONF_UNITS): cv.string,
                vol.Optional(const.CONF_AUTO_CALC_ENABLED): cv.boolean,
                vol.Optional(const.CONF_AUTO_UPDATE_ENABLED): cv.boolean,
                vol.Optional(const.CONF_AUTO_UPDATE_SCHEDULE): cv.string,
                vol.Optional(const.CONF_AUTO_UPDATE_DELAY): cv.string,
                vol.Optional(const.CONF_AUTO_UPDATE_INTERVAL): cv.string,
                vol.Optional(const.CONF_AUTO_CLEAR_ENABLED): cv.boolean,
                vol.Optional(const.CONF_CLEAR_TIME): cv.string,
                vol.Optional(const.CONF_CONTINUOUS_UPDATES): cv.boolean,
                vol.Optional(const.CONF_HOURLY_CALCULATION): cv.boolean,
                vol.Optional(const.CONF_SENSOR_DEBOUNCE): cv.string,
                vol.Optional(const.CONF_CALC_LOG_ENABLED): cv.boolean,
                vol.Optional(const.CONF_USE_WEATHER_SERVICE): cv.boolean,
                vol.Optional(const.CONF_WEATHER_SERVICE): cv.string,
                vol.Optional(const.CONF_IRRIGATION_START_TRIGGERS): vol.Coerce(list),
                vol.Optional(const.CONF_ACTIVE_START_TRIGGER): cv.string,
                vol.Optional(const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION): cv.boolean,
                vol.Optional(const.CONF_OBSERVED_WATERING_ENABLED): cv.boolean,
                vol.Optional(const.CONF_DIRECT_VALVE_CONTROL_ENABLED): cv.boolean,
                vol.Optional(const.CONF_ZONE_SEQUENCING): vol.In(
                    const.CONF_ZONE_SEQUENCING_OPTIONS
                ),
                vol.Optional(const.CONF_PRECIPITATION_THRESHOLD_MM): vol.Coerce(float),
                vol.Optional(const.CONF_SKIP_ON_FREEZE): cv.boolean,
                vol.Optional(const.CONF_FREEZE_THRESHOLD): vol.Any(
                    None, vol.Coerce(float)
                ),
                vol.Optional(const.CONF_FREEZE_SENSOR): vol.Any(None, cv.string),
                vol.Optional(const.CONF_SKIP_ON_WIND): cv.boolean,
                vol.Optional(const.CONF_WIND_THRESHOLD): vol.Any(
                    None, vol.Coerce(float)
                ),
                vol.Optional(const.CONF_WIND_SENSOR): vol.Any(None, cv.string),
                vol.Optional(const.CONF_SKIP_ON_RAIN_SENSOR): cv.boolean,
                vol.Optional(const.CONF_RAIN_SENSOR): vol.Any(None, cv.string),
                vol.Optional(const.CONF_DAYS_BETWEEN_IRRIGATION): vol.Coerce(int),
                vol.Optional(const.CONF_MANUAL_COORDINATES_ENABLED): cv.boolean,
                vol.Optional(const.CONF_MANUAL_LATITUDE): vol.Any(
                    None, vol.Coerce(float)
                ),
                vol.Optional(const.CONF_MANUAL_LONGITUDE): vol.Any(
                    None, vol.Coerce(float)
                ),
                vol.Optional(const.CONF_MANUAL_ELEVATION): vol.Any(
                    None, vol.Coerce(float)
                ),
            }
        )
    )
    async def post(self, request, data):
        """Handle config update request."""
        _LOGGER.debug("[websocket]: request: %s %s", request, data)
        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        await coordinator.async_update_config(data)
        async_dispatcher_send(hass, const.DOMAIN + "_update_frontend")
        return self.json({"success": True})


class SmartIrrigationModuleView(HomeAssistantView):
    """View to handle Smart Irrigation module configuration via HTTP API."""

    url = "/api/" + const.DOMAIN + "/modules"
    name = "api:" + const.DOMAIN + ":modules"

    @RequestDataValidator(
        vol.Schema(
            {
                vol.Optional(const.MODULE_ID): vol.Coerce(int),
                vol.Optional(const.MODULE_NAME): cv.string,
                vol.Optional(const.MODULE_DESCRIPTION): vol.Or(None, cv.string),
                vol.Optional(const.MODULE_CONFIG): vol.Coerce(dict),
                vol.Optional(const.MODULE_SCHEMA): vol.Coerce(list),
                vol.Optional(const.ATTR_REMOVE): cv.boolean,
            },
        )
    )
    async def post(self, request, data):
        """Handle config update request."""
        _LOGGER.debug("[websocket]: request: %s %s", request, data)
        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        module = int(data[const.MODULE_ID]) if const.MODULE_ID in data else None
        await coordinator.async_update_module_config(module, data)
        async_dispatcher_send(hass, const.DOMAIN + "_update_frontend")
        return self.json({"success": True})


class SmartIrrigationAllModuleView(HomeAssistantView):
    """View to handle retrieval of all Smart Irrigation modules via HTTP API."""

    url = "/api/" + const.DOMAIN + "/allmodules"
    name = "api:" + const.DOMAIN + ":allmodules"


class SmartIrrigationMappingView(HomeAssistantView):
    """View to handle Smart Irrigation mapping configuration via HTTP API."""

    url = "/api/" + const.DOMAIN + "/mappings"
    name = "api:" + const.DOMAIN + ":mapping"

    @RequestDataValidator(
        vol.Schema(
            {
                vol.Optional(const.MAPPING_ID): vol.Coerce(int),
                vol.Optional(const.MAPPING_NAME): cv.string,
                vol.Optional(const.MAPPING_MAPPINGS): vol.Coerce(dict),
                vol.Optional(const.MAPPING_GREENHOUSE): cv.boolean,
                vol.Optional(const.MAPPING_MODULE): vol.Or(int, str, None),
                vol.Optional(const.ATTR_REMOVE): cv.boolean,
                # The following fields are server-computed. They are accepted
                # here (as ``object``) so that older frontends which echo them
                # back on save do not fail schema validation (see #680), but
                # they are stripped before being passed to the store so the
                # server remains authoritative.
                vol.Optional(const.MAPPING_DATA): object,
                vol.Optional(const.MAPPING_DATA_LAST_UPDATED): object,
                vol.Optional(const.MAPPING_DATA_LAST_ENTRY): object,
                vol.Optional(const.MAPPING_DATA_LAST_CALCULATION): object,
            }
        )
    )
    async def post(self, request, data):
        """Handle config update request."""
        _LOGGER.debug("[websocket]: request: %s %s", request, data)
        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        mapping = int(data[const.MAPPING_ID]) if const.MAPPING_ID in data else None
        # Strip server-computed fields so clients cannot overwrite them via
        # the config API. These are populated by the coordinator when sensor
        # data is collected or calculations run, and the store's
        # ``async_update_mapping`` otherwise preserves existing values.
        sanitized = {
            key: value
            for key, value in data.items()
            if key
            not in (
                const.MAPPING_DATA,
                const.MAPPING_DATA_LAST_UPDATED,
                const.MAPPING_DATA_LAST_ENTRY,
                const.MAPPING_DATA_LAST_CALCULATION,
            )
        }
        await coordinator.async_update_mapping_config(mapping, sanitized)
        async_dispatcher_send(hass, const.DOMAIN + "_update_frontend")
        return self.json({"success": True})


# What a zone records about itself, as opposed to what the user configures. The
# panel saves a zone by POSTing the whole object it is holding, so a settings
# page left open across an irrigation run carries a stale copy of these back and
# reverts what the run wrote. None of them has an input in the panel: it only
# passes them through. Dropping them here keeps the store their sole writer.
SERVER_OWNED_ZONE_FIELDS = (
    const.ZONE_WATER_USED,
    const.ZONE_LAST_IRRIGATION,
    const.ZONE_MEASURED_THROUGHPUT,
    const.ZONE_MEASURED_THROUGHPUT_SAMPLES,
    const.ZONE_PRECIPITATION_SUPERSEDED,
    const.ZONE_LAST_CONSUMED_AT,
)


def _without_server_owned_fields(data):
    """Return the posted zone data with the fields the server owns removed."""
    dropped = [field for field in SERVER_OWNED_ZONE_FIELDS if field in data]
    if not dropped:
        return data
    _LOGGER.debug(
        "[websocket]: ignoring server-owned fields in a zone save: %s", dropped
    )
    return {key: value for key, value in data.items() if key not in dropped}


class SmartIrrigationZoneView(HomeAssistantView):
    """View to handle Smart Irrigation zone configuration via HTTP API."""

    url = "/api/" + const.DOMAIN + "/zones"
    name = "api:" + const.DOMAIN + ":zones"

    @RequestDataValidator(
        vol.Schema(
            {
                vol.Optional(const.ZONE_ID): vol.Coerce(int),
                vol.Optional(const.ZONE_NAME): cv.string,
                vol.Optional(const.ZONE_SIZE): cv.positive_float,
                vol.Optional(const.ZONE_THROUGHPUT): cv.positive_float,
                vol.Optional(const.ZONE_STATE): vol.In(const.ZONE_STATES),
                vol.Optional(const.ZONE_DURATION): vol.Or(float, int, str, None),
                vol.Optional(const.ZONE_BUCKET): vol.Or(float, int, str, None),
                vol.Optional(const.ZONE_DELTA): vol.Or(float, int, str, None),
                vol.Optional(const.ZONE_MODULE): vol.Or(int, str, None),
                vol.Optional(const.ATTR_REMOVE): cv.boolean,
                vol.Optional(const.ATTR_CALCULATE): cv.boolean,
                vol.Optional(const.ATTR_CALCULATE_ALL): cv.boolean,
                vol.Optional(const.ATTR_DRY_RUN): cv.boolean,
                vol.Optional(const.ATTR_UPDATE): cv.boolean,
                vol.Optional(const.ATTR_UPDATE_ALL): cv.boolean,
                vol.Optional(const.ATTR_RESET_ALL_BUCKETS): cv.boolean,
                vol.Optional(const.ATTR_OVERRIDE_CACHE): cv.boolean,
                vol.Optional(const.ZONE_EXPLANATION): vol.Coerce(str),
                vol.Optional(const.ZONE_MULTIPLIER): vol.Coerce(float),
                vol.Optional(const.ZONE_MAPPING): vol.Or(int, str, None),
                vol.Optional(const.ZONE_LEAD_TIME): vol.Coerce(float),
                vol.Optional(const.ZONE_MAXIMUM_DURATION): vol.Coerce(float),
                vol.Optional(const.ZONE_MAXIMUM_BUCKET): vol.Or(float, int, None),
                vol.Optional(const.ZONE_LAST_CALCULATED): vol.Or(
                    None, str, datetime.datetime
                ),
                vol.Optional(const.ZONE_LAST_UPDATED): vol.Or(
                    None, str, datetime.datetime
                ),
                vol.Optional(const.ZONE_NUMBER_OF_DATA_POINTS): vol.Or(int, None),
                vol.Optional(const.ATTR_CLEAR_ALL_WEATHERDATA): cv.boolean,
                vol.Optional(const.ZONE_DRAINAGE_RATE): vol.Or(float, int, None),
                vol.Optional(const.ZONE_CURRENT_DRAINAGE): vol.Or(float, int, None),
                vol.Optional(const.ZONE_LINKED_ENTITY): vol.Any(None, cv.string),
                vol.Optional(const.ZONE_FLOW_SENSOR): vol.Any(None, cv.string),
                vol.Optional(const.ZONE_SOIL_MOISTURE_SENSOR): vol.Any(None, cv.string),
                vol.Optional(const.ZONE_SOIL_MOISTURE_THRESHOLD): vol.Any(
                    None, vol.Coerce(float)
                ),
                vol.Optional(const.ZONE_INPUT_METHOD): vol.In(const.ZONE_INPUT_METHODS),
                vol.Optional(const.ZONE_PRECIPITATION_RATE): vol.Or(float, int, None),
                vol.Optional(const.ZONE_ET_DEFICIENCY): vol.Or(float, int, None),
                vol.Optional(const.ZONE_LAST_IRRIGATION): vol.Or(
                    None, str, datetime.datetime
                ),
                vol.Optional(const.ZONE_WATER_USED): vol.Or(float, int, None),
                vol.Optional(const.ZONE_PRECIPITATION_SUPERSEDED): vol.Or(
                    float, int, None
                ),
                vol.Optional(const.ZONE_IRRIGATION_THRESHOLD): vol.Or(float, int, None),
                vol.Optional(const.ZONE_MEASURED_THROUGHPUT): vol.Or(float, int, None),
                vol.Optional(const.ZONE_MEASURED_THROUGHPUT_SAMPLES): vol.Or(int, None),
                vol.Optional(const.ZONE_LAST_CONSUMED_AT): vol.Or(
                    None, str, datetime.datetime
                ),
            }
        )
    )
    async def post(self, request, data):
        """Handle config update request."""
        _LOGGER.debug("[websocket]: request: %s %s", request, data)
        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        zone = int(data[const.ZONE_ID]) if const.ZONE_ID in data else None
        data = _without_server_owned_fields(data)
        await coordinator.async_update_zone_config(zone, data)
        async_dispatcher_send(hass, const.DOMAIN + "_update_frontend")
        return self.json({"success": True})


@async_response
async def websocket_get_config(hass: HomeAssistant, connection, msg):
    """Publish config data."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    config = await coordinator.store.async_get_config()

    # Convert precipitation threshold from internal mm to user's preferred units
    if (
        const.CONF_PRECIPITATION_THRESHOLD_MM in config
        and config[const.CONF_PRECIPITATION_THRESHOLD_MM] is not None
    ):
        threshold_mm = config[const.CONF_PRECIPITATION_THRESHOLD_MM]
        ha_config_is_metric = hass.config.units is METRIC_SYSTEM

        if not ha_config_is_metric:
            # Convert from mm to inches for imperial users
            from .helpers import convert_between

            threshold_inches = convert_between(
                const.UNIT_MM, const.UNIT_INCH, threshold_mm
            )
            config = config.copy()  # Make a copy to avoid modifying the stored config
            config[const.CONF_PRECIPITATION_THRESHOLD_MM] = threshold_inches
            _LOGGER.debug(
                "Converted precipitation threshold from %.2f mm to %.2f inches for frontend (imperial mode)",
                threshold_mm,
                threshold_inches,
            )
        else:
            _LOGGER.debug(
                "Precipitation threshold %.2f mm sent directly to frontend (metric mode)",
                threshold_mm,
            )

    connection.send_result(msg["id"], config)


@async_response
async def websocket_get_zones(hass: HomeAssistant, connection, msg):
    """Publish zone data."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    zones = await coordinator.store.async_get_zones()
    connection.send_result(msg["id"], zones)


@async_response
async def websocket_get_modules(hass: HomeAssistant, connection, msg):
    """Publish module data, with the sources each engine reads.

    ``consumes`` travels with the module so the sensor-group editor can offer
    only the sources that engine uses. It is computed here rather than stored:
    it is a property of the code, not of the user's configuration.
    """
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    modules = await coordinator.store.async_get_modules()
    connection.send_result(
        msg["id"],
        [
            {**module, "consumes": consumed_mappings(module.get("name"))}
            for module in modules
        ],
    )


@async_response
async def websocket_get_all_modules(hass: HomeAssistant, connection, msg):
    """Publish all module data. This is not retrieved from the store."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    modules = await coordinator.async_get_all_modules()
    connection.send_result(msg["id"], modules)


@async_response
async def websocket_get_mappings(hass: HomeAssistant, connection, msg):
    """Publish mapping data."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    _LOGGER.debug("websocket_get_mappings called")
    mappings = await coordinator.store.async_get_mappings()
    connection.send_result(msg["id"], mappings)


def _project_days_between_to_start(skip_preview, skip_days):
    """Move the days-between check forward to the start the panel is showing.

    The counter is bumped once a day, so evaluating it "now" is pessimistic
    right after a run: it reads 0 of 5 and vetoes, while the start time shown
    beside it has already been pushed out by those same five days. Left alone
    the panel contradicts itself, announcing a run and calling it blocked.

    At the projected start the counter will have caught up, so that check no
    longer vetoes. Only that one moves: a rain forecast five days out is not
    something we can claim to know, and it keeps its live value.
    """
    if not skip_preview or skip_days <= 0:
        return skip_preview

    checks = []
    for check in skip_preview.get("checks", []):
        if check.get("id") != "days_between" or not check.get("enabled"):
            checks.append(check)
            continue
        checks.append(
            {**check, "days_since": check.get("days_required"), "skip": False}
        )

    vetoing = next((c for c in checks if c.get("skip")), None)
    return {
        "should_skip": vetoing is not None,
        "reason": vetoing["id"] if vetoing else None,
        "checks": checks,
        "projected_to_start": True,
    }


def _trigger_start_base_and_offset(selected, total_duration):
    """Return (base_event, offset_seconds) for the selected start trigger.

    Mirrors the sunrise/sunset offset logic in ``TriggersMixin`` so the Info tab
    shows when irrigation will actually begin (honouring the trigger the user
    selected: sunrise/sunset +/- offset, accounting for duration) instead of
    always assuming "finish at sunrise" (#763). ``base_event`` is "sunrise" or
    "sunset". The "default" sentinel, solar-azimuth triggers (whose next time is
    not computed here) and unknown types fall back to the legacy
    sunrise-minus-duration behaviour.
    """
    ttype = selected.get(const.TRIGGER_CONF_TYPE) if selected else None
    offset_minutes = (
        selected.get(const.TRIGGER_CONF_OFFSET_MINUTES, 0) if selected else 0
    )
    account_for_duration = (
        selected.get(const.TRIGGER_CONF_ACCOUNT_FOR_DURATION, True)
        if selected
        else True
    )

    if ttype == const.TRIGGER_TYPE_SUNSET:
        if account_for_duration:
            offset_seconds = (offset_minutes * 60) - total_duration
        else:
            offset_seconds = offset_minutes * 60
        return "sunset", offset_seconds

    if ttype == const.TRIGGER_TYPE_SUNRISE:
        if account_for_duration:
            if offset_minutes == 0:
                offset_seconds = -total_duration
            else:
                offset_seconds = (offset_minutes * 60) - total_duration
        else:
            offset_seconds = offset_minutes * 60
        return "sunrise", offset_seconds

    # default sentinel, solar_azimuth, or unknown -> finish at sunrise.
    return "sunrise", -total_duration


@async_response
async def websocket_get_irrigation_info(hass: HomeAssistant, connection, msg):
    """Publish irrigation information."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    _LOGGER.debug("websocket_get_irrigation_info called")

    try:
        # Get all zones from the store
        zones = await coordinator.store.async_get_zones()

        # What the skip conditions say right now, and what they said at the last
        # real decision. The preview is evaluated live, so a forecast can still
        # change before the run: it says what would happen, not what will (#794).
        try:
            skip_preview = await coordinator.async_evaluate_skip_conditions()
        except Exception as e:  # noqa: BLE001 - the info panel must not fail on it
            _LOGGER.debug("Skip preview unavailable: %s", e)
            skip_preview = None
        last_skip_evaluation = getattr(coordinator, "_last_skip_evaluation", None)

        # Where each zone stands right now rather than at the last calculation.
        # Display only: nothing here is committed. See live_estimate.py.
        try:
            zone_estimates = await coordinator.async_estimate_all_zones_now()
        except Exception as e:  # noqa: BLE001 - the panel must not fail on it
            _LOGGER.debug("Live estimates unavailable: %s", e)
            zone_estimates = {}

        # Calculate total duration and get enabled zones that need irrigation
        total_duration = await coordinator.get_total_duration_all_enabled_zones()
        enabled_zones = []
        irrigation_zones = []

        for zone in zones:
            zone_state = zone.get(const.ZONE_STATE)
            zone_duration = zone.get(const.ZONE_DURATION, 0)

            if zone_state in [const.ZONE_STATE_AUTOMATIC, const.ZONE_STATE_MANUAL]:
                enabled_zones.append(zone)
                # Zone needs irrigation if duration > 0 (bucket was negative)
                if zone_duration > 0:
                    irrigation_zones.append(
                        zone.get(const.ZONE_NAME, f"Zone {zone.get(const.ZONE_ID)}")
                    )

        # Resolve the active start trigger so the displayed start time matches
        # the trigger the user actually selected, instead of always assuming
        # "finish at sunrise" (#763).
        config = await coordinator.store.async_get_config()
        triggers = config.get(const.CONF_IRRIGATION_START_TRIGGERS, [])
        active = config.get(
            const.CONF_ACTIVE_START_TRIGGER, const.CONF_DEFAULT_ACTIVE_START_TRIGGER
        )
        selected = None
        if active and active != const.START_TRIGGER_DEFAULT:
            selected = next(
                (t for t in triggers if t.get(const.TRIGGER_CONF_NAME) == active),
                None,
            )

        # Parse the sun events we may need (next sunrise and next sunset).
        sun_entity = hass.states.get("sun.sun")
        sunrise_time = None
        next_setting_time = None
        if sun_entity and sun_entity.attributes:
            for attr in ("next_rising", "next_setting"):
                raw = sun_entity.attributes.get(attr)
                if not raw:
                    continue
                try:
                    parsed = (
                        datetime.datetime.fromisoformat(raw.replace("Z", "+00:00"))
                        if isinstance(raw, str)
                        else raw
                    )
                except (ValueError, TypeError) as e:
                    _LOGGER.warning("Failed to parse sun %s time: %s", attr, e)
                    continue
                if attr == "next_rising":
                    sunrise_time = parsed
                else:
                    next_setting_time = parsed

        base_name, offset_seconds = _trigger_start_base_and_offset(
            selected, total_duration
        )
        base_time = next_setting_time if base_name == "sunset" else sunrise_time
        if base_time is None:
            # Fall back to whichever sun event is available.
            base_time = sunrise_time or next_setting_time
        if base_time is None:
            # No sun data at all: assume 6 AM tomorrow.
            now = datetime.datetime.now()
            base_time = now.replace(hour=6, minute=0, second=0, microsecond=0)
            if base_time <= now:
                base_time += datetime.timedelta(days=1)
        if sunrise_time is None:
            sunrise_time = base_time
        next_irrigation_start = base_time + datetime.timedelta(seconds=offset_seconds)

        # Account for the "days between irrigation" restriction. The start
        # triggers fire every day, but on a skip day the watering decision is
        # negative, so the real next irrigation is pushed back by however many
        # skip days remain. Without this the Info tab claims "tomorrow" even
        # when the schedule will actually wait a few days (#763).
        try:
            days_between = config.get(
                const.CONF_DAYS_BETWEEN_IRRIGATION,
                const.CONF_DEFAULT_DAYS_BETWEEN_IRRIGATION,
            )
            days_since_last = config.get(
                const.CONF_DAYS_SINCE_LAST_IRRIGATION,
                const.CONF_DEFAULT_DAYS_SINCE_LAST_IRRIGATION,
            )
            if days_between and days_between > 0:
                # The next trigger evaluates days_since_last against
                # days_between and only fires once it has caught up, so the
                # number of remaining skip days is days_between - days_since_last.
                skip_days = days_between - days_since_last
                if skip_days > 0 and next_irrigation_start:
                    next_irrigation_start += datetime.timedelta(days=skip_days)
                    # The start we are about to show is that many days out, so
                    # the guard that pushed it there must be shown as it will
                    # be then, not as it is now.
                    skip_preview = _project_days_between_to_start(
                        skip_preview, skip_days
                    )
        except Exception as e:  # noqa: BLE001
            _LOGGER.warning(
                "Failed to apply days-between-irrigation offset to next "
                "irrigation start: %s",
                e,
            )

        # No invented prose. The old code manufactured "Scheduled irrigation
        # maintenance" and "Irrigation scheduled based on soil moisture
        # calculations and weather data" whenever it had no reason to give,
        # which reads like information and is not. What the panel shows now is
        # the trigger, the arithmetic behind the total, and the skip checks.
        irrigation_info = {
            "next_irrigation_start": (
                next_irrigation_start.isoformat() if next_irrigation_start else None
            ),
            "next_irrigation_duration": int(total_duration),
            "next_irrigation_zones": irrigation_zones,
            "sunrise_time": sunrise_time.isoformat() if sunrise_time else None,
            # Why the start is at that moment: the trigger the user selected,
            # and the sun event it is measured from.
            "trigger_name": (
                selected.get(const.TRIGGER_CONF_NAME) if selected else None
            ),
            "trigger_type": (
                selected.get(const.TRIGGER_CONF_TYPE) if selected else None
            ),
            "trigger_base": base_name,
            "trigger_accounts_for_duration": (
                selected.get(const.TRIGGER_CONF_ACCOUNT_FOR_DURATION, True)
                if selected
                else True
            ),
            # How the total was counted: the sum of the zones or the longest.
            "zone_sequencing": config.get(
                const.CONF_ZONE_SEQUENCING, const.CONF_DEFAULT_ZONE_SEQUENCING
            ),
            "zone_estimates": zone_estimates,
            "skip_preview": skip_preview,
            "last_skip_evaluation": last_skip_evaluation,
        }

        _LOGGER.debug("Irrigation info calculated: %s", irrigation_info)

    except Exception as e:
        _LOGGER.error("Error calculating irrigation info: %s", e)
        # Return fallback data on error
        now = datetime.datetime.now()
        sunrise_time = now.replace(hour=6, minute=0, second=0, microsecond=0)
        if sunrise_time <= now:
            sunrise_time += datetime.timedelta(days=1)

        irrigation_info = {
            "next_irrigation_start": sunrise_time.isoformat(),
            "next_irrigation_duration": 0,
            "next_irrigation_zones": [],
            "sunrise_time": sunrise_time.isoformat(),
            "trigger_name": None,
            "trigger_type": None,
            "trigger_base": None,
            "trigger_accounts_for_duration": None,
            "zone_sequencing": None,
            "error": str(e),
            "zone_estimates": {},
            "skip_preview": None,
            "last_skip_evaluation": None,
        }

    connection.send_result(msg["id"], irrigation_info)


@async_response
async def websocket_get_weather_records(hass: HomeAssistant, connection, msg):
    """Publish weather records for a mapping."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    mapping_id = msg.get("mapping_id")
    limit = msg.get("limit", 10)

    _LOGGER.debug(
        "websocket_get_weather_records called for mapping %s with limit %s",
        mapping_id,
        limit,
    )

    try:
        # Get the mapping from the store
        mapping = coordinator.store.get_mapping(int(mapping_id))

        if not mapping:
            _LOGGER.warning("Mapping with ID %s not found", mapping_id)
            connection.send_result(msg["id"], [])
            return

        # Get weather data from the mapping
        mapping_data = mapping.get(const.MAPPING_DATA, [])

        if not mapping_data or not isinstance(mapping_data, list):
            _LOGGER.debug("No weather data found for mapping %s", mapping_id)
            connection.send_result(msg["id"], [])
            return

        # Process and format the weather records
        records = []
        # Remove all non-dicts
        mapping_data = [d for d in mapping_data if isinstance(d, dict)]

        # Sort by timestamp (most recent first) and limit
        sorted_data = sorted(
            mapping_data,
            key=lambda x: _safe_parse_datetime(x.get(const.RETRIEVED_AT)),
            reverse=True,
        )
        limited_data = sorted_data[:limit]

        for data_point in limited_data:
            if not isinstance(data_point, dict):
                continue

            retrieval_time = data_point.get(const.RETRIEVED_AT)

            # Format timestamp
            timestamp_str = None
            retrieval_time_str = None

            if retrieval_time:
                if isinstance(retrieval_time, datetime.datetime):
                    timestamp_str = retrieval_time.isoformat()
                    retrieval_time_str = retrieval_time.isoformat()
                elif isinstance(retrieval_time, str):
                    timestamp_str = retrieval_time
                    retrieval_time_str = retrieval_time

            # Extract weather values
            record = {
                "timestamp": timestamp_str,
                "temperature": data_point.get(const.MAPPING_TEMPERATURE),
                "humidity": data_point.get(const.MAPPING_HUMIDITY),
                "precipitation": data_point.get(const.MAPPING_PRECIPITATION),
                "pressure": data_point.get(const.MAPPING_PRESSURE),
                "wind_speed": data_point.get(const.MAPPING_WINDSPEED),
                "solar_radiation": data_point.get(const.MAPPING_SOLRAD),
                "dewpoint": data_point.get(const.MAPPING_DEWPOINT),
                "evapotranspiration": data_point.get(const.MAPPING_EVAPOTRANSPIRATION),
                "max_temperature": data_point.get(const.MAPPING_MAX_TEMP),
                "min_temperature": data_point.get(const.MAPPING_MIN_TEMP),
                "current_precipitation": data_point.get(
                    const.MAPPING_CURRENT_PRECIPITATION
                ),
                "retrieval_time": retrieval_time_str,
            }

            # Only include records that have at least some weather data
            if any(
                value is not None
                for key, value in record.items()
                if key not in ["timestamp", "retrieval_time"]
            ):
                records.append(record)

        _LOGGER.debug(
            "Retrieved %d weather records for mapping %s", len(records), mapping_id
        )

    except Exception as e:
        _LOGGER.error(
            "Error retrieving weather records for mapping %s: %s", mapping_id, e
        )
        records = []
    connection.send_result(msg["id"], records)


@async_response
async def websocket_get_watering_calendar(hass: HomeAssistant, connection, msg):
    """Get 12-month watering calendar for zone(s)."""
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    zone_id = msg.get("zone_id")

    _LOGGER.debug("websocket_get_watering_calendar called for zone %s", zone_id)
    try:
        # Convert zone_id to int if provided
        if zone_id is not None:
            zone_id = int(zone_id)

        calendar_data = await coordinator.async_generate_watering_calendar(zone_id)
        connection.send_result(msg["id"], calendar_data)

    except Exception as e:
        _LOGGER.error("Error generating watering calendar for zone %s: %s", zone_id, e)
        connection.send_error(msg["id"], "calendar_generation_failed", str(e))


class SmartIrrigationWateringCalendarView(HomeAssistantView):
    """View to handle watering calendar requests via HTTP API."""

    url = "/api/" + const.DOMAIN + "/watering_calendar"
    name = "api:" + const.DOMAIN + ":watering_calendar"

    async def get(self, request):
        """Handle watering calendar request."""
        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]

        # Get zone_id from query parameters
        zone_id = request.query.get("zone_id")

        _LOGGER.debug("HTTP watering calendar request for zone %s", zone_id)

        try:
            # Convert zone_id to int if provided
            if zone_id is not None:
                zone_id = int(zone_id)

            calendar_data = await coordinator.async_generate_watering_calendar(zone_id)
            return self.json(calendar_data)

        except Exception as e:
            _LOGGER.error(
                "Error generating watering calendar for zone %s: %s", zone_id, e
            )
            return self.json({"error": str(e)}, status_code=500)


# Weather values kept in a weather data record, in the order the panel shows
# them. The keys are the same ones used inside a sensor group's data records.
WEATHER_SERVICE_HISTORY_FIELDS = (
    const.MAPPING_TEMPERATURE,
    const.MAPPING_MIN_TEMP,
    const.MAPPING_MAX_TEMP,
    const.MAPPING_DEWPOINT,
    const.MAPPING_HUMIDITY,
    const.MAPPING_PRESSURE,
    const.MAPPING_WINDSPEED,
    const.MAPPING_SOLRAD,
    const.MAPPING_PRECIPITATION,
    const.MAPPING_CURRENT_PRECIPITATION,
    const.MAPPING_EVAPOTRANSPIRATION,
)


@async_response
async def websocket_get_weather_service_history(hass: HomeAssistant, connection, msg):
    """Publish the last weather service retrievals, newest first.

    Only sensor groups that actually take at least one value from the weather
    service are considered, and inside a record only the weather-service-sourced
    values are returned: the panel tab is about the weather service, so showing
    a sensor or static value there would be misleading.
    """
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    limit = msg.get("limit", 20)

    records = []
    try:
        mappings = await coordinator.store.async_get_mappings()
        for mapping in mappings:
            # Which values of this sensor group come from the weather service?
            service_keys = [
                key
                for key, the_map in (mapping.get(const.MAPPING_MAPPINGS) or {}).items()
                if isinstance(the_map, dict)
                and the_map.get(const.MAPPING_CONF_SOURCE)
                == const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
            ]
            if not service_keys:
                continue

            mapping_data = mapping.get(const.MAPPING_DATA) or []
            if not isinstance(mapping_data, list):
                continue

            for data_point in mapping_data:
                if not isinstance(data_point, dict):
                    continue

                values = {
                    field: data_point.get(field)
                    for field in WEATHER_SERVICE_HISTORY_FIELDS
                    if field in service_keys and data_point.get(field) is not None
                }
                if not values:
                    continue

                retrieved = data_point.get(const.RETRIEVED_AT)
                if isinstance(retrieved, datetime.datetime):
                    retrieved = retrieved.isoformat()
                elif not isinstance(retrieved, str):
                    retrieved = None

                records.append(
                    {
                        "retrieved": retrieved,
                        "mapping_id": mapping.get(const.MAPPING_ID),
                        "mapping_name": mapping.get(const.MAPPING_NAME),
                        "values": values,
                    }
                )

        records.sort(
            key=lambda record: _safe_parse_datetime(record["retrieved"]), reverse=True
        )
        records = records[:limit]
    except Exception as e:  # noqa: BLE001
        _LOGGER.error("Error retrieving weather service history: %s", e)
        records = []

    connection.send_result(
        msg["id"],
        {"fields": list(WEATHER_SERVICE_HISTORY_FIELDS), "records": records},
    )


@async_response
async def websocket_get_irrigation_history(hass: HomeAssistant, connection, msg):
    """Publish the recorded irrigation runs, newest first.

    Records are returned raw (start time in UTC, duration in seconds, water in
    litres) so the panel can group them by local calendar day and convert to the
    user's units -- bucketing here would use the server's idea of "a day".
    """
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    limit = msg.get("limit", 500)

    try:
        runs = await coordinator.store.async_get_irrigation_history()
        runs.sort(
            key=lambda run: _safe_parse_datetime(run.get(const.HISTORY_START)),
            reverse=True,
        )
        runs = runs[:limit]
    except Exception as e:  # noqa: BLE001
        _LOGGER.error("Error retrieving irrigation history: %s", e)
        runs = []

    connection.send_result(msg["id"], {"records": runs})


# Only an administrator may see or change how this install talks to its weather
# service, or dump and replace the whole configuration. The panel is already
# admin-only, but these commands are registered on the websocket API and can be
# called by any authenticated client without going through it, and the weather
# service payload carries the API key in clear.
#
# The gate is deliberately limited to that surface. Reading zones, modules,
# sensor groups and the calendar stays open to any authenticated user: a
# household member should be able to see whether the garden is being watered,
# and a Lovelace card for exactly that is on the roadmap. Widening this later
# would break it silently, so widen it on purpose or not at all.


@websocket_api.require_admin
@async_response
async def websocket_get_weather_service(hass: HomeAssistant, connection, msg):
    """Publish the currently configured weather service so the panel can show/edit it."""
    data = hass.data.get(const.DOMAIN, {})
    connection.send_result(
        msg["id"],
        {
            const.CONF_USE_WEATHER_SERVICE: bool(
                data.get(const.CONF_USE_WEATHER_SERVICE)
            ),
            const.CONF_WEATHER_SERVICE: data.get(const.CONF_WEATHER_SERVICE),
            const.CONF_WEATHER_SERVICE_API_KEY: data.get(
                const.CONF_WEATHER_SERVICE_API_KEY
            ),
            "services": const.CONF_WEATHER_SERVICES,
            # Whether this service hands us a reference ET0 directly. When it
            # does, the recommended path is to take that figure rather than
            # recompute Penman-Monteith from its individual weather fields.
            "supplies_evapotranspiration": data.get(const.CONF_WEATHER_SERVICE)
            in const.CONF_WEATHER_SERVICES_WITH_SOLRAD_ET,
        },
    )


@websocket_api.require_admin
@async_response
async def websocket_set_weather_service(hass: HomeAssistant, connection, msg):
    """Change the weather service after install.

    Validates the API key, writes the choice to the config entry data and lets
    the registered options-update listener reload the integration so the change
    takes effect immediately and persists across restarts.
    """
    # imported here to avoid any import cycle at module load
    from .helpers import CannotConnect, InvalidAuth, validate_api_key

    use = bool(msg.get(const.CONF_USE_WEATHER_SERVICE))
    service = msg.get(const.CONF_WEATHER_SERVICE)
    service = service.strip() if isinstance(service, str) else None
    api_key = msg.get(const.CONF_WEATHER_SERVICE_API_KEY)
    api_key = api_key.strip() if isinstance(api_key, str) else None

    entries = hass.config_entries.async_entries(const.DOMAIN)
    if not entries:
        connection.send_error(
            msg["id"], "not_found", "No Smart Irrigation configuration entry found."
        )
        return
    entry = entries[0]

    if use:
        if not service or service not in const.CONF_WEATHER_SERVICES:
            connection.send_error(
                msg["id"], "invalid_service", "Please choose a valid weather service."
            )
            return
        if not api_key and service not in const.CONF_WEATHER_SERVICES_NO_API_KEY:
            connection.send_error(
                msg["id"],
                "missing_api_key",
                "An API key is required for the selected weather service.",
            )
            return
        try:
            await validate_api_key(hass, service, api_key)
        except InvalidAuth:
            connection.send_error(
                msg["id"],
                "invalid_auth",
                "The weather service rejected this API key.",
            )
            return
        except CannotConnect:
            connection.send_error(
                msg["id"],
                "cannot_connect",
                "Could not reach the weather service. Check your connection.",
            )
            return
        except Exception as err:  # noqa: BLE001
            connection.send_error(msg["id"], "unknown", f"Validation failed: {err}")
            return

    # Apply the change at runtime (rebuilds the weather client) — no reload.
    coordinator = hass.data.get(const.DOMAIN, {}).get("coordinator")
    if coordinator is not None:
        await coordinator.async_apply_weather_service(
            use, service if use else None, api_key if use else None
        )

    # Persist to the config entry so the choice survives restarts. Suppress the
    # listener-driven reload (we already applied it in-place, and the reload
    # would re-register the panel/views).
    new_data = dict(entry.data)
    new_data[const.CONF_USE_WEATHER_SERVICE] = use
    new_data[const.CONF_WEATHER_SERVICE] = service if use else None
    new_data[const.CONF_WEATHER_SERVICE_API_KEY] = api_key if use else None
    if any(
        entry.data.get(k) != new_data.get(k)
        for k in (
            const.CONF_USE_WEATHER_SERVICE,
            const.CONF_WEATHER_SERVICE,
            const.CONF_WEATHER_SERVICE_API_KEY,
        )
    ):
        # Drop any weather-service keys an earlier Reconfigure left in options, so
        # they cannot override this panel change on the next setup (setup applies
        # options over data). See #683.
        new_options = {
            k: v
            for k, v in entry.options.items()
            if k
            not in (
                const.CONF_USE_WEATHER_SERVICE,
                const.CONF_WEATHER_SERVICE,
                const.CONF_WEATHER_SERVICE_API_KEY,
                const.CONF_WEATHER_SERVICE_API_VERSION,
            )
        }
        hass.data.setdefault(const.DOMAIN, {})["_suppress_options_reload"] = True
        hass.config_entries.async_update_entry(
            entry, data=new_data, options=new_options
        )

    _LOGGER.info("Weather service updated via panel (use=%s, service=%s)", use, service)
    connection.send_result(msg["id"], {"success": True})


class SmartIrrigationExportView(HomeAssistantView):
    """View to export the full Smart Irrigation configuration as JSON."""

    url = "/api/" + const.DOMAIN + "/export"
    name = "api:" + const.DOMAIN + ":export"

    @require_admin
    async def get(self, request):
        """Return the full configuration (config + zones + modules + mappings)."""
        from .store import STORAGE_VERSION

        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        data = await coordinator.store.async_export()
        return self.json({"version": STORAGE_VERSION, **data})


class SmartIrrigationRestoreView(HomeAssistantView):
    """View to restore the full Smart Irrigation configuration from a backup."""

    url = "/api/" + const.DOMAIN + "/restore"
    name = "api:" + const.DOMAIN + ":restore"

    @require_admin
    @RequestDataValidator(
        vol.Schema(
            {
                vol.Required("config"): dict,
                vol.Optional("zones"): list,
                vol.Optional("modules"): list,
                vol.Optional("mappings"): list,
            },
            extra=vol.ALLOW_EXTRA,  # tolerate backup metadata (version, ...)
        )
    )
    async def post(self, request, data):
        """Replace the whole configuration with the supplied backup, then reload."""
        hass = request.app["hass"]
        coordinator = hass.data[const.DOMAIN]["coordinator"]
        try:
            await coordinator.store.async_import(data)
        except (ValueError, KeyError, TypeError) as err:
            _LOGGER.error("[restore] invalid backup: %s", err)
            return self.json({"success": False, "error": str(err)}, status_code=400)
        # Reload the entry (after responding) so the running coordinator applies
        # the restored config: sensor subscriptions, weather client, schedules.
        entry = coordinator.entry
        hass.async_create_task(hass.config_entries.async_reload(entry.entry_id))
        _LOGGER.info("[restore] configuration restored, reloading entry")
        return self.json({"success": True})


async def async_register_websockets(hass: HomeAssistant):
    """Register Smart Irrigation HTTP views and websocket commands."""
    hass.http.register_view(SmartIrrigationConfigView)
    hass.http.register_view(SmartIrrigationZoneView)
    hass.http.register_view(SmartIrrigationModuleView)
    hass.http.register_view(SmartIrrigationAllModuleView)
    hass.http.register_view(SmartIrrigationMappingView)
    hass.http.register_view(SmartIrrigationWateringCalendarView)
    hass.http.register_view(SmartIrrigationExportView)
    hass.http.register_view(SmartIrrigationRestoreView)

    async_register_command(hass, handle_subscribe_updates)

    async_register_command(
        hass,
        const.DOMAIN + "/config",
        websocket_get_config,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/config"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/zones",
        websocket_get_zones,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/zones"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/modules",
        websocket_get_modules,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/modules"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/allmodules",
        websocket_get_all_modules,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/allmodules"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/mappings",
        websocket_get_mappings,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/mappings"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/info",
        websocket_get_irrigation_info,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/info"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/weather_records",
        websocket_get_weather_records,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): const.DOMAIN + "/weather_records",
                vol.Required("mapping_id"): vol.Coerce(str),
                vol.Optional("limit", default=10): vol.Coerce(int),
            }
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/watering_calendar",
        websocket_get_watering_calendar,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): const.DOMAIN + "/watering_calendar",
                vol.Optional("zone_id"): vol.Coerce(str),
            }
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/weatherservice_history",
        websocket_get_weather_service_history,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): const.DOMAIN + "/weatherservice_history",
                vol.Optional("limit", default=20): vol.Coerce(int),
            }
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/irrigation_history",
        websocket_get_irrigation_history,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): const.DOMAIN + "/irrigation_history",
                vol.Optional("limit", default=500): vol.Coerce(int),
            }
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/weatherservice",
        websocket_get_weather_service,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {vol.Required("type"): const.DOMAIN + "/weatherservice"}
        ),
    )
    async_register_command(
        hass,
        const.DOMAIN + "/set_weatherservice",
        websocket_set_weather_service,
        websocket_api.BASE_COMMAND_MESSAGE_SCHEMA.extend(
            {
                vol.Required("type"): const.DOMAIN + "/set_weatherservice",
                vol.Required(const.CONF_USE_WEATHER_SERVICE): cv.boolean,
                vol.Optional(const.CONF_WEATHER_SERVICE): vol.Any(None, cv.string),
                vol.Optional(const.CONF_WEATHER_SERVICE_API_KEY): vol.Any(
                    None, cv.string
                ),
            }
        ),
    )
