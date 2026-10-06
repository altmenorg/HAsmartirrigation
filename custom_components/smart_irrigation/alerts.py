"""Tell the user when a dry zone is not going to be watered (full controller).

A zone whose bucket has run dry and that no program will water is a plant left
to die quietly: its program was disabled for a trip and never turned back on,
or suspended for good, or has no schedule left. Once a day this looks at the
automatic zones, and when one has been both dry and out of reach of every
program for more than ``const.DRY_ZONE_AFTER_DAYS`` days it raises a repair
notice (one per zone) and fires one event; the notice clears by itself when the
zone is watered or a program covers it again.

Dry means a deficit of at least ``const.DRY_ZONE_DEFICIT_SHARE`` of the zone's
maximum bucket, or its irrigation threshold when that is larger.

The decision is pure (``covered_zones``, ``dry_zones``, ``track_dry``,
``unwatered``) and the mixin only gathers the facts and acts on the answer. The
time a zone has been dry is kept in memory: after a restart the count starts
again, which delays a notice by at most the delay itself.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta

import homeassistant.util.dt as dt_util
from homeassistant.core import HomeAssistant
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.event import async_track_time_interval

from . import const

_LOGGER = logging.getLogger(__name__)

CHECK_INTERVAL = timedelta(hours=24)
DRY_FOR = timedelta(days=const.DRY_ZONE_AFTER_DAYS)

DOCS_URL = (
    "https://altmenorg.github.io/HAsmartirrigation/usage-full-controller.html"
    "#dry-zone-notice"
)


def covered_zones(programs, zone_ids, is_suspended) -> set:
    """The zone ids some program will still water.

    The main program (the cycle the start triggers run) waters every zone while
    it is enabled and not suspended. Another program does when it is enabled,
    not suspended, has an enabled schedule and an enabled step with the zone in
    it. ``is_suspended(program_id)`` says whether a program is suspended.
    """
    covered: set = set()
    everyone = {int(z) for z in zone_ids}
    for program in programs or []:
        if not isinstance(program, dict):
            continue
        if program.get(const.PROGRAM_ENABLED) is False:
            continue
        if is_suspended(program.get(const.PROGRAM_ID)):
            continue
        if program.get(const.PROGRAM_MAIN):
            covered |= everyone
            continue
        if not any(
            s.get(const.SCHEDULE_ENABLED) is not False
            for s in program.get(const.PROGRAM_SCHEDULES) or []
        ):
            continue
        for step in program.get(const.PROGRAM_STEPS) or []:
            if step.get(const.STEP_ENABLED) is False:
                continue
            covered |= {int(z) for z in step.get(const.STEP_ZONES) or []}
    return covered & everyone


def dry_threshold_mm(zone: dict) -> float:
    """The deficit, in mm, from which a zone counts as dry."""
    maximum = float(zone.get(const.ZONE_MAXIMUM_BUCKET) or 0.0)
    threshold = float(zone.get(const.ZONE_IRRIGATION_THRESHOLD) or 0.0)
    return max(
        const.DRY_ZONE_MIN_DEFICIT_MM,
        const.DRY_ZONE_DEFICIT_SHARE * max(0.0, maximum),
        threshold,
    )


def dry_zones(zones) -> dict:
    """``{zone_id: deficit_mm}`` of the automatic zones that are dry."""
    dry = {}
    for zone in zones or []:
        if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
            continue
        bucket = zone.get(const.ZONE_BUCKET)
        if bucket is None:
            continue
        deficit = -float(bucket)
        if deficit >= dry_threshold_mm(zone):
            dry[int(zone[const.ZONE_ID])] = deficit
    return dry


def track_dry(previous: dict, candidates, now: datetime) -> dict:
    """``{zone_id: since}``: when each candidate began to be dry and unwatered.

    A zone keeps the moment it was first seen; one that is no longer a
    candidate drops out, so its count starts again if it dries out later.
    """
    return {int(z): previous.get(int(z), now) for z in candidates}


def unwatered(since: dict, now: datetime, after: timedelta = DRY_FOR) -> dict:
    """``{zone_id: days}`` of the zones dry and unwatered for more than ``after``."""
    return {
        zone_id: (now - start).days
        for zone_id, start in since.items()
        if now - start > after
    }


class ZoneUnwateredMixin:
    """A daily look at the dry zones no program will water."""

    hass: HomeAssistant

    def _unwatered_state(self) -> dict:
        state = getattr(self, "_dry_since", None)
        if state is None:
            state = {}
            self._dry_since = state
        return state

    def _unwatered_raised(self) -> set:
        raised = getattr(self, "_unwatered_issues", None)
        if raised is None:
            raised = set()
            self._unwatered_issues = raised
        return raised

    @staticmethod
    def _unwatered_issue_id(zone_id) -> str:
        return f"dry_zone_not_watered_{zone_id}"

    async def async_setup_zone_unwatered_watch(self) -> None:
        """Start the daily check: one timer, cancelled by the teardown below."""
        on = getattr(self.store.config, const.CONF_FULL_CONTROLLER, False) is True
        self.async_teardown_zone_unwatered_watch(clear_issues=not on)
        if not on:
            return
        self._unwatered_unsub = async_track_time_interval(
            self.hass, self.async_check_zone_unwatered, CHECK_INTERVAL
        )
        await self.async_check_zone_unwatered()

    def async_teardown_zone_unwatered_watch(self, clear_issues: bool = True) -> None:
        """Stop the timer and, by default, take down the notices raised."""
        unsub = getattr(self, "_unwatered_unsub", None)
        if unsub is not None:
            unsub()
        self._unwatered_unsub = None
        raised = self._unwatered_raised()
        if clear_issues:
            for zone_id in list(raised):
                ir.async_delete_issue(
                    self.hass, const.DOMAIN, self._unwatered_issue_id(zone_id)
                )
        raised.clear()
        self._unwatered_state().clear()

    async def async_check_zone_unwatered(self, *_args) -> None:
        """Compare the dry zones with the programs and act on what changed.

        A notice is an extra: whatever goes wrong here must never break the
        setup or a settings change that called it.
        """
        try:
            await self._check_zone_unwatered()
        except asyncio.CancelledError:
            raise
        except Exception as e:  # noqa: BLE001 - see above
            _LOGGER.debug("Could not check for dry zones nothing waters: %s", e)

    async def _check_zone_unwatered(self) -> None:
        config = self.store.config
        raised = self._unwatered_raised()
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            # Switched off since the last look: nothing is left behind.
            self.async_teardown_zone_unwatered_watch()
            return
        now = dt_util.utcnow()
        zones = await self.store.async_get_zones()
        names = {int(z[const.ZONE_ID]): z.get(const.ZONE_NAME) for z in zones}
        dry = dry_zones(zones)
        covered = covered_zones(
            getattr(config, const.CONF_PROGRAMS, None),
            names,
            lambda pid: self.is_suspended(const.SUSPEND_PROGRAM, pid),
        )
        candidates = {
            z
            for z in dry
            if z not in covered and not self.is_suspended(const.SUSPEND_ZONE, z)
        }
        # A zone the user suspended is held back on purpose, and for a set time:
        # it is not a candidate, and its count starts again when it is lifted.
        state = self._unwatered_state()
        since = track_dry(state, candidates, now)
        state.clear()
        state.update(since)
        late = unwatered(since, now)
        for zone_id in list(raised):
            if zone_id not in late:
                ir.async_delete_issue(
                    self.hass, const.DOMAIN, self._unwatered_issue_id(zone_id)
                )
                raised.discard(zone_id)
        for zone_id, days in late.items():
            newly = zone_id not in raised
            raised.add(zone_id)
            name = names.get(zone_id) or str(zone_id)
            ir.async_create_issue(
                self.hass,
                const.DOMAIN,
                self._unwatered_issue_id(zone_id),
                is_fixable=False,
                severity=ir.IssueSeverity.WARNING,
                translation_key="dry_zone_not_watered",
                translation_placeholders={"zone": str(name), "days": str(days)},
                learn_more_url=DOCS_URL,
            )
            if newly:
                _LOGGER.warning(
                    "Zone %s has been dry for %s days and no program will water it",
                    name,
                    days,
                )
                self.hass.bus.async_fire(
                    f"{const.DOMAIN}_{const.EVENT_ZONE_UNWATERED}",
                    {
                        "zone_id": zone_id,
                        "zone": name,
                        "days": days,
                        "deficit_mm": round(dry[zone_id], 1),
                    },
                )
