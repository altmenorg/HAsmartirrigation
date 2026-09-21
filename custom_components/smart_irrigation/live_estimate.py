"""Where a zone stands right now, between two calculations.

The bucket a zone reports is the one its last calculation committed, typically
in the small hours. By the time anybody opens the panel it can be most of a day
old, so the number on screen describes last night rather than this afternoon.

This runs the same calculation over the readings collected since then and does
not commit the result. That is the whole design: the estimate is a partial
evaluation of the function that will later produce the real value, so it lands
on that value rather than drifting away from it and having to be reconciled.
Nothing here writes to the store, fires an event or touches a valve.

Two limits worth knowing, both stated rather than hidden:

* A zone whose module uses forecasting is estimated without the forecast. The
  forecast costs a weather-service call, and a display refresh must not spend
  one every time somebody opens a tab.
* An estimate is only as good as the readings so far. Early in an interval it
  rests on very little, which is exactly when it is furthest from the value the
  calculation will commit.
"""

import logging

import homeassistant.util.dt as dt_util
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .units import depth_to_display

_LOGGER = logging.getLogger(__name__)


class LiveEstimateMixin:
    """Read-only projection of a zone's bucket to right now."""

    async def async_estimate_zone_now(self, zone) -> dict | None:
        """Return what the calculation would produce for ``zone`` right now.

        None when there is nothing to go on: no sensor group, no readings since
        the last calculation, or a module that cannot run on what we have.
        """
        mapping_id = zone.get(const.ZONE_MAPPING)
        if mapping_id is None:
            return None
        mapping = self.store.get_mapping(mapping_id)
        if not mapping or not mapping.get(const.MAPPING_DATA):
            return None

        # A real calculation keeps its audit record here until it writes it,
        # across awaits this estimate can run between. Computing the estimate
        # would replace it, and the log would then record the estimate as the
        # calculation.
        pending_record = getattr(self, "_pending_calc_record", None)
        try:
            # persist=False: this must not become the mapping's last
            # calculation, or the real one would then see an empty window.
            # The window starts at this zone's own watermark, so the estimate
            # covers what the next calculation will, and not readings the zone
            # has already taken into its bucket.
            weatherdata = await self.apply_aggregates_to_mapping_data(
                mapping, persist=False, since=self.zone_window_start(zone)
            )
            if not weatherdata:
                return None
            # forecastdata=None on purpose, see the module docstring.
            calc = await self.calculate_module(zone, weatherdata, None)
        except Exception as e:  # noqa: BLE001 - a display estimate must not fail
            _LOGGER.debug(
                "Live estimate unavailable for zone %s: %s", zone.get(const.ZONE_ID), e
            )
            return None
        finally:
            self._pending_calc_record = pending_record

        if not calc or const.ZONE_BUCKET not in calc:
            return None

        metric = self.hass.config.units is METRIC_SYSTEM
        return {
            # Depths stored in mm, shown in the unit system (units.py).
            "bucket": depth_to_display(calc.get(const.ZONE_BUCKET), metric),
            "delta": depth_to_display(calc.get(const.ZONE_DELTA), metric),
            "duration": calc.get(const.ZONE_DURATION),
            # What it is measured from, so the panel can say "since 23:00".
            "since": (
                zone.get(const.ZONE_LAST_CALCULATED).isoformat()
                if hasattr(zone.get(const.ZONE_LAST_CALCULATED), "isoformat")
                else zone.get(const.ZONE_LAST_CALCULATED)
            ),
            "as_of": dt_util.now().isoformat(),
        }

    async def async_estimate_all_zones_now(self) -> dict:
        """Live estimates for every zone that is not disabled, keyed by zone id."""
        estimates = {}
        for zone in await self.store.async_get_zones():
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED:
                continue
            estimate = await self.async_estimate_zone_now(zone)
            if estimate is not None:
                estimates[str(zone.get(const.ZONE_ID))] = estimate
        return estimates
