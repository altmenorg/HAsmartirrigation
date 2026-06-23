"""Observed-watering bucket crediting (closed-loop, opt-in).

When enabled, the coordinator watches each zone's linked valve/switch entity and
credits that zone's bucket whenever the valve runs. The applied depth is either:

* measured, when the zone also has a cumulative flow/volume meter (a water-meter
  style ``total_increasing`` sensor): volume = meter_at_close - meter_at_open,
  depth_mm = volume_L / size_m2 -- the most accurate path (#626); or
* estimated, otherwise, from the run time and the zone's configured throughput
  (volume = minutes x throughput; depth_mm = volume_L / size_m2).

This closes Smart Irrigation's open loop: the soil-moisture bucket is replenished
from real irrigation (a scheduled run, a manual tap, or any automation that opens
the valve) instead of from a separate manual reset.

Smart Irrigation is event-based and never opens valves itself, so every observed
run is real watering worth crediting -- there is nothing of our own to exclude.
The flip side: when this feature is on it MUST be the only thing crediting the
bucket. If an irrigation automation still calls the ``reset_bucket`` service
after watering, remove that call, or the bucket is accounted twice.

The methods live on a mixin the SmartIrrigationCoordinator inherits, so they use
``self`` to reach coordinator state (store, hass, the observer subscription).

Credit: the closed-loop / observed-watering design is adapted from JustChr's
Smart Irrigation fork (https://github.com/JustChr/HAsmartirrigation), MIT.
"""

import logging

import homeassistant.util.dt as dt_util
from homeassistant.core import Event, callback
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .helpers import convert_between

_LOGGER = logging.getLogger(__name__)

# Valve/switch states that count as "water is flowing".
_ON_STATES = ("on", "open", "opening")

# Sensor states that mean "no usable reading".
_UNUSABLE_STATES = (None, "", "unknown", "unavailable")

# Volume unit -> litres. Keys are lower-cased unit_of_measurement strings.
_VOLUME_TO_LITRES = {
    "l": 1.0,
    "liter": 1.0,
    "litre": 1.0,
    "ml": 0.001,
    "m³": 1000.0,
    "m3": 1000.0,
    "gal": 3.785411784,
    "ft³": 28.316846592,
    "ft3": 28.316846592,
}


class ObservedWateringMixin:
    """Credit a zone's bucket for observed runs of its linked valve."""

    async def async_setup_observed_watering(self) -> None:
        """(Re)subscribe to linked-valve state changes per the current config.

        Idempotent: rebuilds the subscription only when the tracked entity set
        actually changes, so it is cheap to call on startup and on every config
        or zone update. When the feature is off (or no zone has a linked valve)
        it tears any existing subscription down.
        """
        # Strict identity check: only an explicit True opts in. This also keeps
        # the method a safe no-op when the store config is a test double.
        enabled = (
            getattr(self.store.config, const.CONF_OBSERVED_WATERING_ENABLED, False)
            is True
        )
        entity_map: dict[str, int] = {}
        if enabled:
            for zone in await self.store.async_get_zones():
                entity = zone.get(const.ZONE_LINKED_ENTITY)
                if entity:
                    entity_map[entity] = int(zone.get(const.ZONE_ID))

        entities = frozenset(entity_map)
        # Keep the entity->zone map fresh even on a no-op rebuild (a zone id
        # could in principle be reassigned to the same entity string).
        self._observed_zone_by_entity = entity_map
        if entities == self._observed_entities:
            return

        if self._observed_unsub is not None:
            self._observed_unsub()
            self._observed_unsub = None
        self._observed_on_since = {}
        self._observed_flow_start = {}
        self._observed_entities = entities

        if not entities:
            _LOGGER.debug("Observed watering: disabled or no linked valves")
            return

        self._observed_unsub = async_track_state_change_event(
            self.hass, list(entities), self._observed_state_changed
        )
        _LOGGER.info("Observed watering: tracking %d linked valve(s)", len(entities))

    def async_teardown_observed_watering(self) -> None:
        """Cancel the linked-valve subscription (called on unload)."""
        if getattr(self, "_observed_unsub", None) is not None:
            self._observed_unsub()
            self._observed_unsub = None
        self._observed_on_since = {}
        self._observed_flow_start = {}
        self._observed_entities = frozenset()

    @callback
    def _observed_state_changed(self, event: Event) -> None:
        """Track a linked valve opening/closing and credit the run on close."""
        entity_id = event.data.get("entity_id")
        zone_id = self._observed_zone_by_entity.get(entity_id)
        if zone_id is None:
            return
        new_state = event.data.get("new_state")
        old_state = event.data.get("old_state")
        new_on = new_state is not None and new_state.state in _ON_STATES
        old_on = old_state is not None and old_state.state in _ON_STATES

        if new_on and not old_on:
            # Valve opened: record the start time, and snapshot the flow meter so
            # a close can credit the measured volume delta.
            self._observed_on_since[zone_id] = dt_util.utcnow()
            flow_sensor = self._zone_flow_sensor(zone_id)
            if flow_sensor:
                self._observed_flow_start[zone_id] = self._read_volume_litres(
                    flow_sensor
                )
            _LOGGER.debug("Observed watering: zone %s valve opened", zone_id)
        elif old_on and not new_on:
            started = self._observed_on_since.pop(zone_id, None)
            flow_start = self._observed_flow_start.pop(zone_id, None)
            if started is None:
                # We weren't tracking this run (the valve was already on when we
                # subscribed, or it briefly went unavailable mid-run).
                return

            # Prefer the measured-volume path when a flow meter is configured and
            # produced a usable, non-decreasing reading across the run.
            flow_sensor = self._zone_flow_sensor(zone_id)
            if flow_sensor and flow_start is not None:
                litres_now = self._read_volume_litres(flow_sensor)
                if litres_now is not None and litres_now >= flow_start:
                    volume_l = litres_now - flow_start
                    self.hass.async_create_task(
                        self._credit_from_volume(zone_id, volume_l)
                    )
                    return
                _LOGGER.warning(
                    "Observed watering: zone %s flow meter '%s' gave no usable "
                    "delta (start=%s, end=%s); falling back to throughput",
                    zone_id,
                    flow_sensor,
                    flow_start,
                    litres_now,
                )

            seconds = (dt_util.utcnow() - started).total_seconds()
            self.hass.async_create_task(
                self._credit_observed_watering(zone_id, seconds)
            )

    def _zone_flow_sensor(self, zone_id: int):
        """Return the zone's configured flow/volume meter entity id, or None."""
        zone = self.store.get_zone(zone_id)
        return zone.get(const.ZONE_FLOW_SENSOR) if zone else None

    def _read_volume_litres(self, entity_id: str):
        """Read a cumulative volume sensor and return its value in litres.

        Returns None when the sensor is missing, non-numeric, or unavailable.
        """
        state = self.hass.states.get(entity_id)
        if state is None or state.state in _UNUSABLE_STATES:
            return None
        try:
            raw = float(state.state)
        except (ValueError, TypeError):
            _LOGGER.warning(
                "Observed watering: flow meter '%s' non-numeric state '%s'",
                entity_id,
                state.state,
            )
            return None
        unit = state.attributes.get("unit_of_measurement")
        return self._volume_to_litres(raw, unit)

    def _volume_to_litres(self, value: float, unit) -> float:
        """Convert a volume reading to litres, by its unit_of_measurement.

        An unknown unit is assumed to be the user's native volume unit (litres
        in metric, gallons in imperial) with a warning, so a mislabelled sensor
        degrades gracefully rather than silently crediting garbage.
        """
        ha_metric = self.hass.config.units is METRIC_SYSTEM
        if unit in (None, ""):
            return value if ha_metric else value * _VOLUME_TO_LITRES["gal"]
        key = str(unit).strip().lower()
        if key in _VOLUME_TO_LITRES:
            return value * _VOLUME_TO_LITRES[key]
        _LOGGER.warning(
            "Observed watering: unrecognised flow-meter unit '%s'; assuming %s",
            unit,
            "litres" if ha_metric else "gallons",
        )
        return value if ha_metric else value * _VOLUME_TO_LITRES["gal"]

    async def _credit_observed_watering(self, zone_id: int, seconds: float) -> None:
        """Credit a zone's bucket for a timed run of ``seconds`` (no flow meter).

        Applied depth is estimated from run time x configured throughput, so the
        zone needs both a size and a throughput.
        """
        if seconds <= 0:
            return
        zone = self.store.get_zone(zone_id)
        if zone is None:
            return
        size = zone.get(const.ZONE_SIZE) or 0.0
        throughput = zone.get(const.ZONE_THROUGHPUT) or 0.0
        if size <= 0 or throughput <= 0:
            _LOGGER.warning(
                "Observed watering: zone %s has no size/throughput, cannot credit",
                zone_id,
            )
            return

        # Throughput is stored in the user's unit system; normalise to L/min.
        ha_metric = self.hass.config.units is METRIC_SYSTEM
        tput_lpm = (
            throughput
            if ha_metric
            else convert_between(const.UNIT_GPM, const.UNIT_LPM, throughput)
        )
        volume_l = tput_lpm * (seconds / 60.0)
        await self._apply_volume_credit(zone, volume_l, source=f"{seconds:.0f}s timed")

    async def _credit_from_volume(self, zone_id: int, volume_l: float) -> None:
        """Credit a zone's bucket from a metered ``volume_l`` (litres delivered)."""
        if volume_l <= 0:
            return
        zone = self.store.get_zone(zone_id)
        if zone is None:
            return
        if (zone.get(const.ZONE_SIZE) or 0.0) <= 0:
            _LOGGER.warning(
                "Observed watering: zone %s has no size, cannot credit", zone_id
            )
            return
        await self._apply_volume_credit(
            zone, volume_l, source=f"{volume_l:.1f} L metered"
        )

    async def _apply_volume_credit(
        self, zone: dict, volume_l: float, *, source: str
    ) -> None:
        """Convert a delivered ``volume_l`` to depth and add it to the bucket.

        The bucket may rise into surplus (capped at maximum_bucket) -- unlike the
        calculation, observed watering can legitimately overshoot the deficit.
        """
        zone_id = int(zone.get(const.ZONE_ID))
        size = zone.get(const.ZONE_SIZE) or 0.0
        # Size is stored in the user's unit system; normalise to m2 for the
        # litres/m2 == mm identity, then convert the resulting depth back.
        ha_metric = self.hass.config.units is METRIC_SYSTEM
        size_m2 = (
            size
            if ha_metric
            else convert_between(const.UNIT_SQ_FT, const.UNIT_M2, size)
        )
        applied_mm = volume_l / size_m2  # litres / m2 == mm
        applied_native = (
            applied_mm
            if ha_metric
            else convert_between(const.UNIT_MM, const.UNIT_INCH, applied_mm)
        )

        old_bucket = zone.get(const.ZONE_BUCKET) or 0.0
        new_bucket = old_bucket + applied_native
        max_bucket = zone.get(const.ZONE_MAXIMUM_BUCKET)
        if max_bucket is not None and new_bucket > max_bucket:
            new_bucket = float(max_bucket)

        await self.store.async_update_zone(zone_id, {const.ZONE_BUCKET: new_bucket})
        # Refresh the zone sensor (it listens to _config_updated) and any open
        # panel (it listens to _update_frontend).
        async_dispatcher_send(self.hass, const.DOMAIN + "_config_updated", zone_id)
        async_dispatcher_send(self.hass, const.DOMAIN + "_update_frontend")
        _LOGGER.info(
            "Observed watering: zone %s %s -> +%.2f mm, bucket %.3f -> %.3f",
            zone_id,
            source,
            applied_mm,
            old_bucket,
            new_bucket,
        )
