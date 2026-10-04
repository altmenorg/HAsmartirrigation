"""Tell the user when their configured throughput does not match reality.

Every duration Smart Irrigation computes goes through the zone's throughput:
the bucket says how many mm are missing, the size turns that into litres, and
the throughput turns litres into minutes. A throughput taken off a sprinkler
datasheet rather than measured at the tap is one of the quietest ways to water
twice as long as intended, or half as long, forever.

A zone that has a flow meter already gives us the answer for free: the observed
run knows both how many litres came out and how long the valve was open. This
module turns those two numbers into a measured throughput, smooths it over
several runs so one odd run cannot swing it, and raises a repair issue when it
drifts away from what the user configured.

Advisory only, deliberately. We never write the measured value into the zone's
throughput: pressure varies, a meter can be plumbed upstream of more than one
zone, and silently changing how long valves stay open is not a thing to do
behind somebody's back. We say what we measured and let them decide.

The methods live on a mixin the SmartIrrigationCoordinator inherits.

Credit: measuring real flow to sanity-check the configured value is an idea
from JustChr's Smart Irrigation fork (https://github.com/JustChr/
HAsmartirrigation), MIT.
"""

import logging

from homeassistant.helpers import issue_registry as ir

from . import const

_LOGGER = logging.getLogger(__name__)

# Runs shorter than this are dominated by the pipe filling and the valve
# opening, so their apparent flow is well below the steady-state one.
MIN_RUN_SECONDS = 120

# How much weight a new run gets against the running value. Low enough that a
# single strange run moves the estimate a little rather than replacing it.
SMOOTHING = 0.3

# Runs needed before we are willing to say anything to the user.
MIN_SAMPLES = 3

# How far the measurement may sit from the configured value before it is worth
# raising. Sprinkler flow genuinely varies with mains pressure; a quarter off
# is past that and into "the configured number is wrong".
TOLERANCE = 0.25

# A zone is worth a word when one run delivers less than this share of what it
# loses between two waterings: a little under is within what a forecast and a
# crop factor can swing in a week.
CAPACITY_TOLERANCE = 0.8

DOCS_URL = (
    "https://altmenorg.github.io/HAsmartirrigation/configuration-closed-loop.html"
)


class FlowCalibrationMixin:
    """Compare metered flow against the configured throughput."""

    def _issue_id(self, zone_id: int) -> str:
        return f"throughput_mismatch_{zone_id}"

    async def async_record_measured_flow(
        self, zone_id: int, volume_l: float, seconds: float
    ) -> None:
        """Fold one metered run into the zone's measured throughput.

        ``volume_l`` is what the meter counted over the run and ``seconds`` how
        long the valve was open. Both come from the observed-watering close
        handler, which is the only place we know them together.
        """
        if seconds < MIN_RUN_SECONDS or volume_l <= 0:
            _LOGGER.debug(
                "Flow calibration: zone %s run too short or empty (%.0fs, %.2f L)",
                zone_id,
                seconds,
                volume_l,
            )
            return

        zone = self.store.get_zone(zone_id)
        if zone is None:
            return

        # In L/min, the unit the zone's throughput is stored in (units.py).
        sample = volume_l / (seconds / 60.0)

        previous = zone.get(const.ZONE_MEASURED_THROUGHPUT)
        samples = int(zone.get(const.ZONE_MEASURED_THROUGHPUT_SAMPLES) or 0)
        if previous is None or samples <= 0:
            measured = sample
        else:
            measured = SMOOTHING * sample + (1 - SMOOTHING) * previous
        samples += 1

        await self.store.async_update_zone(
            zone_id,
            {
                const.ZONE_MEASURED_THROUGHPUT: round(measured, 3),
                const.ZONE_MEASURED_THROUGHPUT_SAMPLES: samples,
            },
        )
        _LOGGER.debug(
            "Flow calibration: zone %s run gave %.2f, measured now %.2f over %s run(s)",
            zone_id,
            sample,
            measured,
            samples,
        )

        self._review_throughput(zone_id, zone, measured, samples)

    def _review_throughput(
        self, zone_id: int, zone: dict, measured: float, samples: int
    ) -> None:
        """Raise or clear the repair issue for one zone."""
        # A zone entered as a precipitation rate waters by that rate, and the
        # throughput it still stores from its creation is hidden and unused:
        # flagging it as wrong points at a value the user cannot see.
        if (
            zone.get(const.ZONE_INPUT_METHOD)
            == const.ZONE_INPUT_METHOD_PRECIPITATION_RATE
        ):
            ir.async_delete_issue(self.hass, const.DOMAIN, self._issue_id(zone_id))
            return
        configured = zone.get(const.ZONE_THROUGHPUT) or 0.0
        # A zone with no throughput at all cannot produce a duration anyway;
        # that is a different problem, and not one to report from here.
        if configured <= 0 or samples < MIN_SAMPLES:
            return

        drift = abs(measured - configured) / configured
        if drift <= TOLERANCE:
            ir.async_delete_issue(self.hass, const.DOMAIN, self._issue_id(zone_id))
            return

        _LOGGER.warning(
            "Zone %s is configured at %.2f but has measured %.2f over %s runs "
            "(%.0f%% off). Irrigation durations are scaled by that much",
            zone.get(const.ZONE_NAME) or zone_id,
            configured,
            measured,
            samples,
            drift * 100,
        )
        ir.async_create_issue(
            self.hass,
            const.DOMAIN,
            self._issue_id(zone_id),
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key="throughput_mismatch",
            translation_placeholders={
                "zone": str(zone.get(const.ZONE_NAME) or zone_id),
                "configured": f"{configured:.2f}",
                "measured": f"{measured:.2f}",
                "samples": str(samples),
                "percentage": f"{drift * 100:.0f}",
            },
            learn_more_url=DOCS_URL,
        )

    def async_clear_throughput_issue(self, zone_id: int) -> None:
        """Drop a zone's advisories, for when the zone itself goes away."""
        ir.async_delete_issue(self.hass, const.DOMAIN, self._issue_id(zone_id))
        ir.async_delete_issue(self.hass, const.DOMAIN, self._capacity_issue_id(zone_id))
        ir.async_delete_issue(
            self.hass, const.DOMAIN, self._missing_input_issue_id(zone_id)
        )

    @staticmethod
    def _missing_input_issue_id(zone_id: int) -> str:
        return f"missing_input_{zone_id}"

    def _review_missing_input(self, zone: dict, trace: dict | None) -> None:
        """Raise or clear the advisory for a zone the equation could not price.

        When every day of the window lacks something the equation needs, it
        returns no evapotranspiration at all: the deficit stays where it is and
        the zone is never watered, with nothing on screen but a line in the log.
        A sensor group whose temperature or wind sensor is unavailable, or a
        weather service that stopped sending one of them, looks exactly like a
        zone with no need. The advisory names what was missing.
        """
        zone_id = zone.get(const.ZONE_ID)
        if zone_id is None or not trace or "days_in_average" not in trace:
            return
        if trace["days_in_average"] > 0:
            ir.async_delete_issue(
                self.hass, const.DOMAIN, self._missing_input_issue_id(zone_id)
            )
            return
        missing = sorted(
            {
                name
                for day in trace.get("days") or []
                for name in (day or {}).get("missing") or []
            }
        )
        if not missing:
            return
        _LOGGER.warning(
            "Zone %s: nothing could be calculated, missing %s",
            zone.get(const.ZONE_NAME) or zone_id,
            ", ".join(missing),
        )
        ir.async_create_issue(
            self.hass,
            const.DOMAIN,
            self._missing_input_issue_id(zone_id),
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key="missing_input",
            translation_placeholders={
                "zone": str(zone.get(const.ZONE_NAME) or zone_id),
                "missing": ", ".join(missing),
            },
            learn_more_url=DOCS_URL,
        )

    @staticmethod
    def _capacity_issue_id(zone_id: int) -> str:
        return f"undersized_zone_{zone_id}"

    def _review_zone_capacity(
        self, zone: dict, daily_need_mm: float, rate_mm_h: float | None, days: float
    ) -> None:
        """Raise or clear the advisory for a zone that cannot water what it loses.

        One run is at most ``maximum_duration`` long, so it delivers at most
        that long at the zone's rate. When that is less than the zone loses
        between two waterings (the daily need times the days between them, one
        at least), the deficit grows for good however long the weather stays
        the same: a drip line capped at ten minutes with days between at three.
        Advisory only: the cap may be on purpose.
        """
        zone_id = zone.get(const.ZONE_ID)
        maximum = zone.get(const.ZONE_MAXIMUM_DURATION)
        if (
            zone_id is None
            or maximum is None
            or maximum < 0
            or not rate_mm_h
            or daily_need_mm <= 0
        ):
            return
        capacity_mm = rate_mm_h * maximum / 3600.0
        need_mm = daily_need_mm * max(1.0, float(days or 1))
        if capacity_mm >= CAPACITY_TOLERANCE * need_mm:
            ir.async_delete_issue(
                self.hass, const.DOMAIN, self._capacity_issue_id(zone_id)
            )
            return
        _LOGGER.warning(
            "Zone %s can deliver %.1f mm in a run at most but loses about %.1f mm "
            "between two waterings",
            zone.get(const.ZONE_NAME) or zone_id,
            capacity_mm,
            need_mm,
        )
        ir.async_create_issue(
            self.hass,
            const.DOMAIN,
            self._capacity_issue_id(zone_id),
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key="undersized_zone",
            translation_placeholders={
                "zone": str(zone.get(const.ZONE_NAME) or zone_id),
                "capacity": f"{capacity_mm:.1f}",
                "need": f"{need_mm:.1f}",
                "days": f"{max(1.0, float(days or 1)):.0f}",
            },
            learn_more_url=DOCS_URL,
        )
