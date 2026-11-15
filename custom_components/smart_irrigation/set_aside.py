"""A zone whose valve keeps failing is set aside (opt-in).

With "Set a zone aside after N failed runs", a zone whose valve did not open,
gave no water or could not have its own timer set N runs in a row stops being
watered: every runner and the planning treat it as suspended, until it is put
back. It is not watered rather than failed every morning, with a pump that may
start for nothing and a notification each time.

The person is told four ways: the zone's problem sensor (reason
``zone_set_aside``), the notifications of the programs (at once), a repair in
Home Assistant with a button to put it back, and the panel.

It comes back by itself when the valve is seen opening (tried by hand once
repaired), or when a run of it succeeds, and with the repair's button or the
panel's. A successful run resets the count.
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from typing import Any

import homeassistant.util.dt as dt_util
from homeassistant.core import Event, EventStateChangedData, callback
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.event import async_track_state_change_event

from . import const

_LOGGER = logging.getLogger(__name__)

# The problems that count as a failed run: the valve, not the weather or a stop.
FAILURE_REASONS = ("valve_did_not_open", "no_flow", "valve_timer_not_set")
REASON_SET_ASIDE = "zone_set_aside"
ISSUE_PREFIX = "zone_set_aside_"
_ON_STATES = ("on", "open", "opening")

RECORD_COUNT = "count"
RECORD_REASON = "reason"
RECORD_SINCE = "set_aside"


def issue_id(zone_id) -> str:
    return f"{ISSUE_PREFIX}{zone_id}"


class SetAsideMixin:
    """Count a zone's failed runs and set it aside after too many."""

    # Given by the coordinator that inherits this mixin.
    hass: Any
    store: Any
    _set_aside_unsubs: list
    _set_aside_valve_unsub: Callable[[], None] | None

    # --- reading ----------------------------------------------------------

    def _failure_records(self) -> dict:
        return dict(getattr(self.store.config, const.CONF_ZONE_FAILURES, None) or {})

    def zone_set_aside(self, zone_id) -> bool:
        record = self._failure_records().get(str(zone_id)) or {}
        return bool(record.get(RECORD_SINCE))

    def _set_aside_after(self) -> int:
        try:
            return max(
                0, int(getattr(self.store.config, const.CONF_SET_ASIDE_AFTER, 0))
            )
        except (TypeError, ValueError):
            return 0

    # --- following the runs -----------------------------------------------

    def async_setup_set_aside(self) -> None:
        """Listen to the runs, and to the valves of the zones set aside."""
        self._set_aside_unsubs = [
            self.hass.bus.async_listen(
                f"{const.DOMAIN}_{const.EVENT_ZONE_PROBLEM}", self._set_aside_problem
            ),
            async_dispatcher_connect(
                self.hass, const.DOMAIN + "_zone_irrigated", self._set_aside_run_ok
            ),
        ]
        self._set_aside_valve_unsub = None
        self._track_set_aside_valves()

    def async_teardown_set_aside(self) -> None:
        for unsub in getattr(self, "_set_aside_unsubs", []):
            unsub()
        self._set_aside_unsubs = []
        unsub = getattr(self, "_set_aside_valve_unsub", None)
        if unsub is not None:
            unsub()
            self._set_aside_valve_unsub = None

    @callback
    def _set_aside_problem(self, event: Event) -> None:
        if event.data.get("reason") not in FAILURE_REASONS:
            return
        zone_id = event.data.get("zone_id")
        if zone_id is None or self._set_aside_after() <= 0:
            return
        self.hass.async_create_task(
            self._async_count_failure(int(zone_id), event.data.get("reason"))
        )

    @callback
    def _set_aside_run_ok(self, zone_id=None) -> None:
        if zone_id is None or str(zone_id) not in self._failure_records():
            return
        self.hass.async_create_task(self.async_put_back_zone(int(zone_id), "run"))

    async def _async_count_failure(self, zone_id: int, reason) -> None:
        records = self._failure_records()
        record = dict(records.get(str(zone_id)) or {})
        if record.get(RECORD_SINCE):
            return
        record[RECORD_COUNT] = int(record.get(RECORD_COUNT) or 0) + 1
        record[RECORD_REASON] = reason
        limit = self._set_aside_after()
        set_aside = record[RECORD_COUNT] >= limit
        if set_aside:
            record[RECORD_SINCE] = dt_util.utcnow().isoformat()
        records[str(zone_id)] = record
        await self.store.async_update_config({const.CONF_ZONE_FAILURES: records})
        if not set_aside:
            return
        zone = self.store.get_zone(zone_id) or {}
        name = zone.get(const.ZONE_NAME) or str(zone_id)
        _LOGGER.warning(
            "Zone %s set aside after %s failed runs in a row (%s): it is not "
            "watered until it is put back",
            name,
            record[RECORD_COUNT],
            reason,
        )
        ir.async_create_issue(
            self.hass,
            const.DOMAIN,
            issue_id(zone_id),
            is_fixable=True,
            is_persistent=False,
            severity=ir.IssueSeverity.ERROR,
            translation_key="zone_set_aside",
            translation_placeholders={
                "zone": str(name),
                "count": str(record[RECORD_COUNT]),
            },
            data={"zone_id": zone_id},
        )
        # Through the zone's problem sensor and the programs' notifications.
        self.hass.bus.async_fire(
            f"{const.DOMAIN}_{const.EVENT_ZONE_PROBLEM}",
            {
                "zone_id": zone_id,
                "zone": name,
                "entity_id": zone.get(const.ZONE_LINKED_ENTITY),
                "reason": REASON_SET_ASIDE,
                "failures": record[RECORD_COUNT],
            },
        )
        self._after_set_aside_change()

    async def async_put_back_zone(self, zone_id: int, why: str = "asked") -> bool:
        """Water the zone again, and count its failures from zero.

        Returns whether it was set aside.
        """
        records = self._failure_records()
        record = records.pop(str(zone_id), None)
        if record is None:
            return False
        await self.store.async_update_config({const.CONF_ZONE_FAILURES: records})
        was_set_aside = bool(record.get(RECORD_SINCE))
        if was_set_aside:
            ir.async_delete_issue(self.hass, const.DOMAIN, issue_id(zone_id))
            _LOGGER.info("Zone %s put back (%s)", zone_id, why)
            async_dispatcher_send(self.hass, const.DOMAIN + "_zone_put_back", zone_id)
            self._after_set_aside_change()
        return was_set_aside

    def _after_set_aside_change(self) -> None:
        self._track_set_aside_valves()
        notify = getattr(self, "_notify_programs", None)
        if callable(notify):
            notify()
        async_dispatcher_send(self.hass, const.DOMAIN + "_update_frontend")

    # --- a valve tried by hand ----------------------------------------------

    @callback
    def _track_set_aside_valves(self) -> None:
        unsub = getattr(self, "_set_aside_valve_unsub", None)
        if unsub is not None:
            unsub()
            self._set_aside_valve_unsub = None
        by_entity: dict[str, int] = {}
        for key, record in self._failure_records().items():
            if not record.get(RECORD_SINCE):
                continue
            zone = self.store.get_zone(int(key)) or {}
            entity = zone.get(const.ZONE_LINKED_ENTITY)
            if entity:
                by_entity[entity] = int(key)
        if not by_entity:
            return

        @callback
        def _changed(event: Event[EventStateChangedData]) -> None:
            new = event.data.get("new_state")
            old = event.data.get("old_state")
            if new is None or new.state not in _ON_STATES:
                return
            if old is not None and old.state in _ON_STATES:
                return
            zone_id = by_entity.get(str(event.data.get("entity_id")))
            if zone_id is not None:
                self.hass.async_create_task(
                    self.async_put_back_zone(zone_id, "its valve opened")
                )

        self._set_aside_valve_unsub = async_track_state_change_event(
            self.hass, list(by_entity), _changed
        )
