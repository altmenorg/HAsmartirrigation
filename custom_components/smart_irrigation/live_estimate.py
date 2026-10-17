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

* A zone whose module uses forecasting is estimated with the forecast the
  weather service sent with its last reading, never with a new request: a
  display refresh must not spend one every time somebody opens a tab. Without
  a forecast in hand (a service that keeps none) it is estimated without, and
  says so. Estimating without it always made the estimate of such a zone
  disagree with the calculation it previews.
* An estimate is only as good as the readings so far. Early in an interval it
  rests on very little, which is exactly when it is furthest from the value the
  calculation will commit.
"""

import asyncio
import datetime
import json
import logging
import time

import homeassistant.util.dt as dt_util
from homeassistant.util.unit_system import METRIC_SYSTEM

from . import const
from .helpers import parse_datetime
from .hourly_rows import SystemLocalTime
from .units import depth_to_display

_LOGGER = logging.getLogger(__name__)

# How long a set of estimates is reused while nothing it depends on changed.
# Several readers ask within one panel refresh (the start placement, the
# planning, the Info page), each used to compute them again, seconds apiece.
ESTIMATE_REUSE_SECONDS = 60


def _aware_iso(moment):
    """``moment`` as an ISO string with its offset, for a browser to read.

    The stored stamp is naive, on the machine's clock. Sent as it is, a browser
    reads it as its own local time, which is another hour wherever the two
    clocks differ. A value that cannot be read is passed on unchanged.
    """
    if moment is None:
        return None
    parsed = moment
    if not isinstance(parsed, datetime.datetime):
        try:
            parsed = parse_datetime(moment)
        except (ValueError, TypeError):
            return moment
        if parsed is None:
            return moment
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=SystemLocalTime())
    try:
        return dt_util.as_local(parsed).isoformat()
    except (OverflowError, ValueError, OSError):
        return parsed.isoformat()


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
            # The forecast in hand only, see the module docstring.
            forecastdata = await self._cached_forecast_for(zone)
            calc = await self.calculate_module(zone, weatherdata, forecastdata)
        except Exception as e:  # noqa: BLE001 - a display estimate must not fail
            # With the traceback: otherwise "switched off" and "raises on every
            # refresh" look the same from outside.
            _LOGGER.debug(
                "Live estimate unavailable for zone %s: %s",
                zone.get(const.ZONE_ID),
                e,
                exc_info=True,
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
            "since": _aware_iso(zone.get(const.ZONE_LAST_CALCULATED)),
            "as_of": dt_util.now().isoformat(),
            # Whether the days ahead were in it, for a zone that looks ahead.
            "forecast_used": bool(forecastdata),
        }

    async def _cached_forecast_for(self, zone):
        """The last forecast the service sent, for a zone that looks ahead."""
        try:
            modinst = await self.getModuleInstanceByID(self.module_id_for_zone(zone))
            if not getattr(modinst, "forecast_days", 0):
                return None
            fetch = getattr(
                getattr(self, "_WeatherServiceClient", None),
                "get_cached_forecast_data",
                None,
            )
            if fetch is None or not getattr(self, "use_weather_service", False):
                return None
            return fetch()
        except Exception:  # noqa: BLE001 - an estimate without it is still one
            _LOGGER.debug("No cached forecast for the live estimate", exc_info=True)
            return None

    async def async_estimate_all_zones_now(self) -> dict:
        """Live estimates for every zone that is not disabled, keyed by zone id.

        Reused while the zones, their sensor groups' readings, the modules and
        the configuration are what they were, for at most a minute: the planning
        alone asked for them four times per refresh, a few seconds each, and
        the panel refreshes every few seconds. Callers asking at the same time
        share one computation.
        """
        zones = await self.store.async_get_zones()
        key = await self._estimate_key(zones)
        cached = getattr(self, "_estimate_cache", None)
        if (
            key is not None
            and cached is not None
            and cached[0] == key
            and time.monotonic() - cached[1] < ESTIMATE_REUSE_SECONDS
        ):
            return dict(cached[2])
        inflight = getattr(self, "_estimate_inflight", None)
        if key is not None and inflight is not None and inflight[0] == key:
            return dict(await asyncio.shield(inflight[1]))
        task = asyncio.ensure_future(self._estimate_all_zones(zones))
        self._estimate_inflight = (key, task)
        try:
            estimates = await asyncio.shield(task)
        finally:
            if getattr(self, "_estimate_inflight", None) == (key, task):
                self._estimate_inflight = None
        self._estimate_cache = (key, time.monotonic(), estimates)
        return dict(estimates)

    async def _estimate_key(self, zones) -> str | None:
        """What the estimates depend on, compared rather than watched."""
        try:
            mappings = {}
            for zone in zones:
                mapping_id = zone.get(const.ZONE_MAPPING)
                mapping = self.store.get_mapping(mapping_id) if mapping_id else None
                if not mapping:
                    continue
                data = mapping.get(const.MAPPING_DATA) or []
                mappings[str(mapping_id)] = (
                    len(data),
                    data[-1] if data else None,
                    mapping.get(const.MAPPING_MAPPINGS),
                    mapping.get(const.MAPPING_DATA_LAST_ENTRY),
                )
            return json.dumps(
                [
                    zones,
                    mappings,
                    await self.store.async_get_modules(),
                    await self.store.async_get_config(),
                ],
                sort_keys=True,
                default=str,
            )
        except Exception:  # noqa: BLE001 - no key, no reuse: computed afresh
            _LOGGER.debug("No key for the live estimates", exc_info=True)
            return None

    async def _estimate_all_zones(self, zones) -> dict:
        estimates = {}
        for zone in zones:
            if zone.get(const.ZONE_STATE) == const.ZONE_STATE_DISABLED:
                continue
            estimate = await self.async_estimate_zone_now(zone)
            if estimate is not None:
                estimates[str(zone.get(const.ZONE_ID))] = estimate
        return estimates
