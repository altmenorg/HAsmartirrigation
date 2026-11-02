"""Say when a zone cannot be calculated, where the user looks.

A calculation that fails used to reach the log and nothing else: the zone kept
its old bucket and a zero duration, and the panel said "nothing to water: this
zone has what it needs" with a green tick. That reads as a garden that needs
nothing, when it is a garden that will not be watered.

So a failed calculation is kept with the zone (``calculation_problem``: why,
and since when) until the next one succeeds, and shown in three places:

- the zone's status line in the panel, instead of the green tick;
- the zone's problem sensor (``binary_sensor.<zone>_problem``), with the reason;
- a repair notice, one per zone, which clears by itself.

Only real calculations count: a dry run changes nothing, and a calculation
that has nothing new to read (every reading already consumed) is not a failure.
"""

from __future__ import annotations

import logging
from datetime import datetime

from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.dispatcher import async_dispatcher_send

from . import const

_LOGGER = logging.getLogger(__name__)

DOCS_URL = (
    "https://altmenorg.github.io/HAsmartirrigation/"
    "usage-troubleshooting.html#a-zone-says-it-cannot-be-calculated"
)

# Why a zone could not be calculated. Each has its repair text
# (``zone_not_calculated_<code>``) and its status line in the panel.
NO_SENSOR_GROUP = "no_sensor_group"
NO_READINGS = "no_readings"
NO_ENGINE = "no_engine"
NOTHING_FROM_ENGINE = "nothing_from_engine"
FORECAST_WITHOUT_SERVICE = "forecast_without_service"
ERROR = "error"
CODES = (
    NO_SENSOR_GROUP,
    NO_READINGS,
    NO_ENGINE,
    NOTHING_FROM_ENGINE,
    FORECAST_WITHOUT_SERVICE,
    ERROR,
)


class CalculationProblemMixin:
    """Keep, show and clear the reason a zone could not be calculated."""

    @staticmethod
    def _calculation_issue_id(zone_id) -> str:
        return f"zone_not_calculated_{zone_id}"

    async def async_calculation_failed(
        self, zone: dict | None, code: str, detail: str | None = None
    ) -> None:
        """Record that ``zone`` could not be calculated, and say so.

        Kept with the zone until a calculation succeeds. Raised again only
        when the reason changes, so a zone failing every night is one notice.
        """
        if not zone or zone.get(const.ZONE_ID) is None:
            return
        if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
            # A manual or disabled zone is not calculated, so it cannot fail.
            return
        zone_id = int(zone[const.ZONE_ID])
        name = zone.get(const.ZONE_NAME) or str(zone_id)
        before = zone.get(const.ZONE_CALCULATION_PROBLEM) or {}
        if before.get("code") == code and before.get("detail") == detail:
            return
        problem = {
            "code": code,
            "detail": detail,
            "since": before.get("since") or datetime.now().isoformat(),
        }
        try:
            await self.store.async_update_zone(
                zone_id, {const.ZONE_CALCULATION_PROBLEM: problem}
            )
        except Exception as e:  # noqa: BLE001 - saying so must not fail the run
            _LOGGER.debug("Could not keep the calculation problem of %s: %s", name, e)
        self._raise_calculation_issue(zone_id, name, code, detail)
        self._calculation_problem_changed(zone_id)

    def _raise_calculation_issue(self, zone_id: int, name, code, detail) -> None:
        if code not in CODES:
            code = ERROR
        ir.async_create_issue(
            self.hass,
            const.DOMAIN,
            self._calculation_issue_id(zone_id),
            is_fixable=False,
            severity=ir.IssueSeverity.WARNING,
            translation_key=f"zone_not_calculated_{code}",
            translation_placeholders={"zone": str(name), "detail": detail or ""},
            learn_more_url=DOCS_URL,
        )

    async def async_restore_calculation_issues(self) -> None:
        """At setup: raise the notices of zones that still cannot be calculated.

        A notice does not outlive a restart; the problem kept with the zone
        does. Without this, the panel and the problem sensor would say so
        after a restart while Repairs stayed empty, and the next failure for
        the same reason would not raise it again. Notices of zones that are
        gone (a restored backup) are taken down. Whatever goes wrong here must
        not break the setup.
        """
        try:
            zones = await self.store.async_get_zones()
            known = set()
            for zone in zones:
                if zone.get(const.ZONE_ID) is None:
                    continue
                zone_id = int(zone[const.ZONE_ID])
                known.add(zone_id)
                problem = zone.get(const.ZONE_CALCULATION_PROBLEM)
                if not problem:
                    continue
                if zone.get(const.ZONE_STATE) != const.ZONE_STATE_AUTOMATIC:
                    await self.async_calculation_problem_cleared(zone_id)
                    continue
                self._raise_calculation_issue(
                    zone_id,
                    zone.get(const.ZONE_NAME) or str(zone_id),
                    problem.get("code"),
                    problem.get("detail"),
                )
            prefix = self._calculation_issue_id("")
            for domain, issue_id in list(ir.async_get(self.hass).issues):
                if domain != const.DOMAIN or not issue_id.startswith(prefix):
                    continue
                suffix = issue_id[len(prefix) :]
                if not suffix.isdigit() or int(suffix) not in known:
                    ir.async_delete_issue(self.hass, const.DOMAIN, issue_id)
        except Exception as e:  # noqa: BLE001 - a notice must not break the setup
            _LOGGER.debug("Could not restore the calculation notices: %s", e)

    async def async_calculation_problem_cleared(self, zone_id) -> None:
        """Forget a zone's calculation problem, if it had one.

        A successful calculation clears it in the zone's own update
        (calculation.py); this is for a zone that is no longer calculated.
        """
        if zone_id is None:
            return
        zone_id = int(zone_id)
        ir.async_delete_issue(
            self.hass, const.DOMAIN, self._calculation_issue_id(zone_id)
        )
        zone = self.store.get_zone(zone_id) or {}
        if not zone.get(const.ZONE_CALCULATION_PROBLEM):
            return
        await self.store.async_update_zone(
            zone_id, {const.ZONE_CALCULATION_PROBLEM: None}
        )
        self._calculation_problem_changed(zone_id)

    def async_clear_calculation_issue(self, zone_id) -> None:
        """The zone is gone: so is its notice."""
        ir.async_delete_issue(
            self.hass, const.DOMAIN, self._calculation_issue_id(zone_id)
        )

    def _calculation_problem_changed(self, zone_id: int) -> None:
        # The problem sensor and the panel read the zone again.
        async_dispatcher_send(self.hass, const.DOMAIN + "_config_updated", zone_id)
        async_dispatcher_send(self.hass, const.DOMAIN + "_update_frontend")
