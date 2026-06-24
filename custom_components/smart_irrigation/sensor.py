"""Sensor platform for Smart Irrigation integration."""

import logging

from homeassistant.components.sensor import DOMAIN as PLATFORM
from homeassistant.components.sensor import SensorEntity
from homeassistant.components.sensor.const import SensorDeviceClass, SensorStateClass
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
)
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.typing import ConfigType, DiscoveryInfoType
from homeassistant.util import slugify
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .entity import zone_device_info
from .performance import async_timer

_LOGGER = logging.getLogger(__name__)


def setup_platform(
    hass: HomeAssistant,
    config: ConfigType,
    add_entities: AddEntitiesCallback,
    discovery_info: DiscoveryInfoType | None = None,
) -> None:
    """Set up the sensor platform."""


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_devices: AddEntitiesCallback,
):
    """Set up the SmartIrrigation sensor entities."""

    @callback
    def async_add_sensor_entity(config: dict):
        """Add each zone as Sensor entity."""
        entity_id = "{}.{}".format(
            PLATFORM, const.DOMAIN + "_" + slugify(config["name"])
        )

        sensor_entity = SmartIrrigationZoneEntity(
            hass=hass,
            entity_id=entity_id,
            name=config[const.ZONE_NAME],
            id=config[const.ZONE_ID],
            size=config[const.ZONE_SIZE],
            throughput=config[const.ZONE_THROUGHPUT],
            state=config[const.ZONE_STATE],
            duration=config[const.ZONE_DURATION],
            bucket=config[const.ZONE_BUCKET],
            et_deficiency=config.get(const.ZONE_ET_DEFICIENCY, 0),
            last_updated=config[const.ZONE_LAST_UPDATED],
            last_calculated=config[const.ZONE_LAST_CALCULATED],
            number_of_data_points=config[const.ZONE_NUMBER_OF_DATA_POINTS],
            delta=config[const.ZONE_DELTA],
            drainage_rate=config[const.ZONE_DRAINAGE_RATE],
            current_drainage=config[const.ZONE_CURRENT_DRAINAGE],
            maximum_bucket=config[const.ZONE_MAXIMUM_BUCKET],
            multiplier=config[const.ZONE_MULTIPLIER],
            lead_time=config[const.ZONE_LEAD_TIME],
            maximum_duration=config[const.ZONE_MAXIMUM_DURATION],
        )
        if const.DOMAIN in hass.data:
            if not check_zone_entity_in_hass_data(hass, entity_id):
                hass.data[const.DOMAIN]["zones"][config["id"]] = sensor_entity
                async_add_devices([sensor_entity])
                _add_zone_child_sensors(hass, async_add_devices, config)

    # Tie the dispatcher subscription to the config entry lifecycle: without
    # this, the connection leaks on unload and a later remove+re-add (without a
    # full HA restart) leaves a stale listener bound to the dead entry. That
    # ghost listener fires first, pre-fills hass.data["zones"] and then fails to
    # link the device to the now-unknown entry, so the live listener skips the
    # zone as "already added" -> zero real entities created.
    config_entry.async_on_unload(
        async_dispatcher_connect(
            hass, const.DOMAIN + "_register_entity", async_add_sensor_entity
        )
    )
    # "_platform_loaded" (which replays existing zones) is now fired from
    # __init__.async_setup_entry after ALL entity platforms have subscribed, so
    # the number platform receives the zones too. Firing it here would race it.

    # register services if any here


def _add_zone_child_sensors(hass: HomeAssistant, async_add_devices, config: dict):
    """Add the per-zone child value sensors (bucket, ET, drainage) once.

    These read-only sensors expose values that are also kept as attributes on
    the duration sensor (nothing is removed); they group under the same per-zone
    device so each zone reads as a set of entities rather than one attribute bag.
    """
    registered = hass.data[const.DOMAIN].setdefault("zone_child_sensors", {})
    if config["id"] in registered:
        return
    base = const.DOMAIN + "_" + slugify(config["name"])
    zid = config[const.ZONE_ID]
    zname = config[const.ZONE_NAME]
    # (entity_id suffix / translation_key, store data key)
    specs = [
        ("bucket", const.ZONE_BUCKET),
        ("et_value", const.ZONE_DELTA),
        ("et_deficiency", const.ZONE_ET_DEFICIENCY),
        ("current_drainage", const.ZONE_CURRENT_DRAINAGE),
    ]
    children = [
        SmartIrrigationZoneChildSensor(
            hass, f"{PLATFORM}.{base}_{suffix}", zid, zname, suffix, data_key
        )
        for suffix, data_key in specs
    ]
    registered[config["id"]] = children
    async_add_devices(children)


def check_zone_entity_in_hass_data(hass: HomeAssistant | None, entity_id: str) -> bool:
    """Check if the entity_id is already in hass data."""
    return (
        hass
        and const.DOMAIN in hass.data
        and "zones" in hass.data[const.DOMAIN]
        and entity_id
        in [z.entity_id for z in hass.data[const.DOMAIN]["zones"].values()]
    )


class SmartIrrigationZoneEntity(SensorEntity, RestoreEntity):
    """Sensor entity representing a Smart Irrigation zone (its watering duration)."""

    _attr_has_entity_name = True
    _attr_translation_key = "duration"

    def __init__(
        self,
        hass: HomeAssistant,
        id: str,
        name: str,
        entity_id: str,
        size: float,
        throughput: float,
        state: str,
        duration: int,
        bucket: float,
        et_deficiency: float,
        last_updated: str,
        last_calculated: str,
        number_of_data_points: int,
        delta: float,
        drainage_rate: float,
        current_drainage: float,
        maximum_bucket: float,
        multiplier: float,
        lead_time: float,
        maximum_duration: float,
    ) -> None:
        """Initialize the sensor entity."""
        self._hass = hass
        # check if entity_id is already in self._hass
        # if (
        #    hass
        #    and const.DOMAIN in hass.data
        #    and self.check_zone_entity_in_hass_data(entity_id)
        # ):
        #    _LOGGER.warning(
        #        f"Entity {entity_id} already exists in hass data, skipping config."
        #    )
        # entity_id = generate_entity_id(
        #    entity_id_format="sensor.{}", name=entity_id.split(".")[1], hass=hass
        # )
        #    self._name = name
        #    return
        # else:
        self.entity_id = entity_id
        self._id = id
        self._name = name
        self._size = size
        self._throughput = throughput
        self._state = state
        self._duration = duration
        self._bucket = bucket
        self._et_deficiency = et_deficiency
        self._last_updated = last_updated
        self._last_calculated = last_calculated
        self._number_of_data_points = number_of_data_points
        self._delta = delta
        self._drainage_rate = drainage_rate
        self._current_drainage = (
            current_drainage  # Cache formatted timestamps for performance
        )
        self._maximum_bucket = maximum_bucket
        self._multiplier = multiplier
        self._lead_time = lead_time
        self._maximum_duration = maximum_duration
        self._last_updated_formatted = self._format_timestamp(self._last_updated)
        self._last_calculated_formatted = self._format_timestamp(self._last_calculated)

        async_dispatcher_connect(
            hass, const.DOMAIN + "_config_updated", self.async_update_sensor_entity
        )

        # Listen for unit system changes
        async_dispatcher_connect(
            hass,
            const.DOMAIN + "_unit_system_changed",
            self.async_handle_unit_system_change,
        )

    def _format_timestamp(self, val):
        """Format timestamp for display - cached for performance."""
        if val is None:
            return None

        outputformat = "%Y-%m-%d %H:%M:%S"

        # Optimize timestamp formatting to avoid string parsing
        if isinstance(val, str):
            try:
                # Try direct parsing without calling convert_timestamp
                from datetime import datetime

                return datetime.fromisoformat(val).strftime(outputformat)
            except (ValueError, TypeError):
                return val
        elif hasattr(val, "strftime"):
            try:
                return val.strftime(outputformat)
            except (ValueError, TypeError):
                return str(val)
        return str(val)

    @async_timer("async_update_sensor_entity")
    @callback
    def async_update_sensor_entity(self, id=None):
        """Update each zone as Sensor entity."""
        if self._id == id and self.hass and self.hass.data:
            _LOGGER.debug("[async_update_sensor_entity]: updating zone %s", id)

            # get the new values from store and update sensor state
            zone = self.hass.data[const.DOMAIN]["coordinator"].store.get_zone(id)
            self._name = zone["name"]
            self._size = zone["size"]
            self._throughput = zone["throughput"]
            self._state = zone["state"]
            self._duration = zone["duration"]
            self._bucket = zone["bucket"]
            self._et_deficiency = zone.get("et_deficiency", 0)
            self._last_updated = zone["last_updated"]
            self._last_calculated = zone["last_calculated"]
            self._number_of_data_points = zone["number_of_data_points"]
            self._delta = zone["delta"]
            self._drainage_rate = zone["drainage_rate"]
            self._current_drainage = zone["current_drainage"]
            self._maximum_bucket = zone["maximum_bucket"]
            self._multiplier = zone["multiplier"]
            self._lead_time = zone["lead_time"]
            self._maximum_duration = zone["maximum_duration"]

            # Update cached formatted timestamps for performance
            self._last_updated_formatted = self._format_timestamp(self._last_updated)
            self._last_calculated_formatted = self._format_timestamp(
                self._last_calculated
            )

            # Ensure state change notification is properly sent
            self.async_schedule_update_ha_state(force_refresh=True)

    @callback
    def async_handle_unit_system_change(self):
        """Handle unit system changes by refreshing the entity state."""
        _LOGGER.debug("[async_handle_unit_system_change]: refreshing zone %s", self._id)

        # Force a state update to refresh any unit-dependent attributes
        # The actual unit conversions are handled in the attribute display logic
        self.async_schedule_update_ha_state(force_refresh=True)

    @property
    def device_info(self) -> dict:
        """Return per-zone device info (grouped under the hub via via_device)."""
        return zone_device_info(self._hass, self._id, self._name)

    @property
    def unique_id(self):
        """Return a unique ID to use for this entity.

        Migrated from the legacy entity-id-based id to the per-zone scheme
        ``smart_irrigation_<zone_id>_duration``. The one-time registry migration
        in __init__ rewrites existing installs so the entity_id and recorded
        history carry over.
        """
        return f"{const.DOMAIN}_{self._id}_duration"

    @property
    def icon(self):
        """Return icon."""
        return const.SENSOR_ICON

    @property
    def should_poll(self) -> bool:
        """Return the polling state."""
        return False

    @property
    def device_class(self):
        """Return the device class of the sensor."""
        return SensorDeviceClass.DURATION

    @property
    def native_unit_of_measurement(self):
        """Return the native unit of measurement for this sensor."""
        return "s"

    @property
    def native_value(self):
        """Return the native value of the sensor."""
        return self._duration

    @property
    def suggested_display_precision(self):
        """Return the suggested display precision for this sensor."""
        return 0

    @property
    def suggested_unit_of_measurement(self):
        """Return the suggested unit of measurement for this sensor."""
        return "s"

    @property
    def extra_state_attributes(self):
        """Return the data of the entity."""
        # Ensure cached timestamps are available
        if (
            not hasattr(self, "_last_updated_formatted")
            or self._last_updated_formatted is None
        ):
            self._last_updated_formatted = self._format_timestamp(self._last_updated)
        if (
            not hasattr(self, "_last_calculated_formatted")
            or self._last_calculated_formatted is None
        ):
            self._last_calculated_formatted = self._format_timestamp(
                self._last_calculated
            )

        ha_metric = self._hass.config.units is METRIC_SYSTEM
        depth_unit = const.UNIT_MM if ha_metric else const.UNIT_INCH
        area_unit = const.UNIT_M2 if ha_metric else const.UNIT_SQ_FT
        flow_unit = const.UNIT_LPM if ha_metric else const.UNIT_GPM

        return {
            "id": self._id,
            "size": self._size,
            "size_unit": area_unit,
            "throughput": self._throughput,
            "throughput_unit": flow_unit,
            "drainage_rate": self._drainage_rate,
            "drainage_rate_unit": f"{depth_unit}/h",
            "current_drainage": self._current_drainage,
            "current_drainage_unit": depth_unit,
            "maximum_bucket": self._maximum_bucket,
            "maximum_bucket_unit": depth_unit,
            "multiplier": self._multiplier,
            "lead_time": self._lead_time,
            "maximum_duration": self._maximum_duration,
            "state": self._state,
            "bucket": self._bucket,
            "bucket_unit": depth_unit,
            "last_updated": self._last_updated_formatted,
            "last_calculated": self._last_calculated_formatted,
            "number_of_data_points": self._number_of_data_points,
            # et_value: ET deficiency actually applied to the bucket this run
            # (et0 * hour_multiplier + precipitation). et_deficiency: the raw
            # per-day ET deficiency, independent of interval and bucket resets.
            "et_value": self._delta,
            "et_value_unit": depth_unit,
            "et_deficiency": self._et_deficiency,
            "et_deficiency_unit": depth_unit,
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.size", "en"), self._hass.loop
            # ).result(): self._size,
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.throughput", "en"), self._hass.loop
            # ).result(): self._throughput,
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.state", "en"), self._hass.loop
            # ).result(): self._state,
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.bucket", "en"), self._hass.loop
            # ).result(): self._bucket,
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.last_updated", "en"), self._hass.loop
            # ).result(): convert_timestamp(self._last_updated),
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.last_calculated", "en"), self._hass.loop
            # ).result(): convert_timestamp(self._last_calculated),
            # asyncio.run_coroutine_threadsafe(
            #    localize("common.attributes.number_of_data_points", "en"),
            #    self._hass.loop,
            # ).result(): self._number_of_data_points,
        }

    async def async_added_to_hass(self):
        """Connect to dispatcher listening for entity data notifications."""
        _LOGGER.debug("%s is added to hass", self.entity_id)
        await super().async_added_to_hass()

        # Restore previous state if available
        last_state = await self.async_get_last_state()
        if last_state is not None:
            # Entity was previously known, restore some state if needed
            _LOGGER.debug("Restored state for %s: %s", self.entity_id, last_state.state)

        # Force initial state update to ensure UI shows current data
        self.async_schedule_update_ha_state(force_refresh=True)

    async def async_will_remove_from_hass(self):
        """Handle removal of the entity from Home Assistant."""
        await super().async_will_remove_from_hass()
        _LOGGER.debug("%s is removed from hass", self.entity_id)


class SmartIrrigationZoneChildSensor(SensorEntity):
    """Read-only per-zone sensor exposing one stored value (depth, in mm/inch).

    Reads its value from the zone store and refreshes on the config-updated
    dispatcher, mirroring the duration sensor. Grouped under the per-zone device.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(
        self,
        hass: HomeAssistant,
        entity_id: str,
        zone_id: int,
        zone_name: str,
        suffix: str,
        data_key: str,
    ) -> None:
        """Initialize a child value sensor for a zone."""
        self._hass = hass
        self.entity_id = entity_id
        self._zone_id = zone_id
        self._zone_name = zone_name
        self._suffix = suffix
        self._data_key = data_key
        self._attr_translation_key = suffix
        self._value = self._read_value()

        async_dispatcher_connect(
            hass, const.DOMAIN + "_config_updated", self._async_zone_updated
        )

    def _read_value(self):
        """Read the current value for this sensor from the zone store."""
        try:
            zone = self._hass.data[const.DOMAIN]["coordinator"].store.get_zone(
                self._zone_id
            )
        except (KeyError, AttributeError, TypeError):
            return None
        return zone.get(self._data_key) if zone else None

    @callback
    def _async_zone_updated(self, zone_id=None):
        """Refresh the value (and zone name) when the zone config changes."""
        if zone_id != self._zone_id or not (self.hass and self.hass.data):
            return
        self._value = self._read_value()
        zone = self._hass.data[const.DOMAIN]["coordinator"].store.get_zone(
            self._zone_id
        )
        if zone:
            self._zone_name = zone.get(const.ZONE_NAME, self._zone_name)
        self.async_schedule_update_ha_state()

    @property
    def unique_id(self) -> str:
        """Return a stable per-zone unique ID."""
        return f"{const.DOMAIN}_{self._zone_id}_{self._suffix}"

    @property
    def should_poll(self) -> bool:
        """No polling; updated via dispatcher."""
        return False

    @property
    def native_value(self):
        """Return the stored value, rounded for display."""
        return (
            round(self._value, 2)
            if isinstance(self._value, (int, float))
            else self._value
        )

    @property
    def native_unit_of_measurement(self):
        """Depth unit following the Home Assistant unit system."""
        ha_metric = self._hass.config.units is METRIC_SYSTEM
        return const.UNIT_MM if ha_metric else const.UNIT_INCH

    @property
    def device_info(self) -> dict:
        """Group under the per-zone device (same as the duration sensor)."""
        return zone_device_info(self._hass, self._zone_id, self._zone_name)

    @property
    def extra_state_attributes(self) -> dict:
        """Return zone identification attributes."""
        return {"zone_id": self._zone_id}

    async def async_added_to_hass(self):
        """Force an initial state once added."""
        await super().async_added_to_hass()
        self.async_schedule_update_ha_state(force_refresh=True)
