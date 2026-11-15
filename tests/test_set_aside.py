"""A zone whose valve keeps failing is set aside (set_aside.py)."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const, set_aside
from custom_components.smart_irrigation.watering_control import (
    WateringControlMixin,
)


class _Coordinator(set_aside.SetAsideMixin, WateringControlMixin):
    def __init__(self, limit=3, records=None):
        self.hass = MagicMock()
        self.hass.created = []
        self.hass.async_create_task = lambda coro: self.hass.created.append(coro)
        self.store = SimpleNamespace(
            config=SimpleNamespace(
                set_aside_after=limit,
                zone_failures=records,
                suspensions=None,
            ),
            get_zone=lambda zone_id: {
                const.ZONE_ID: zone_id,
                const.ZONE_NAME: "Lawn",
                const.ZONE_LINKED_ENTITY: "valve.lawn",
            },
        )

        async def update(changes):
            for key, value in changes.items():
                setattr(self.store.config, key, value)

        self.store.async_update_config = AsyncMock(side_effect=update)
        self._notify_programs = MagicMock()


@pytest.fixture(autouse=True)
def _quiet(monkeypatch):
    monkeypatch.setattr(set_aside, "async_dispatcher_send", MagicMock())
    monkeypatch.setattr(set_aside.ir, "async_create_issue", MagicMock())
    monkeypatch.setattr(set_aside.ir, "async_delete_issue", MagicMock())
    monkeypatch.setattr(
        set_aside, "async_track_state_change_event", MagicMock(return_value=MagicMock())
    )


def _event(reason, zone_id=0):
    return SimpleNamespace(data={"zone_id": zone_id, "reason": reason})


async def _drain(coordinator):
    while coordinator.hass.created:
        await coordinator.hass.created.pop(0)


async def test_three_failures_in_a_row_set_the_zone_aside():
    c = _Coordinator()
    for _ in range(2):
        c._set_aside_problem(_event("valve_did_not_open"))
        await _drain(c)
    assert not c.zone_set_aside(0)
    assert not c.is_suspended(const.SUSPEND_ZONE, 0)

    c._set_aside_problem(_event("no_flow"))
    await _drain(c)

    assert c.zone_set_aside(0)
    # Every runner and the planning ask this.
    assert c.is_suspended(const.SUSPEND_ZONE, 0)
    assert not c.is_suspended(const.SUSPEND_ZONE, 1)
    set_aside.ir.async_create_issue.assert_called_once()
    assert set_aside.ir.async_create_issue.call_args.kwargs["is_fixable"] is True
    fired = c.hass.bus.async_fire.call_args.args
    assert fired[0] == f"{const.DOMAIN}_{const.EVENT_ZONE_PROBLEM}"
    assert fired[1]["reason"] == "zone_set_aside"
    assert fired[1]["failures"] == 3


async def test_off_by_default_and_other_problems_do_not_count():
    off = _Coordinator(limit=0)
    for _ in range(5):
        off._set_aside_problem(_event("valve_did_not_open"))
    assert off.hass.created == []

    c = _Coordinator()
    c._set_aside_problem(_event("valve_did_not_close"))
    c._set_aside_problem(_event("stopped"))
    assert c.hass.created == []


async def test_a_good_run_counts_from_zero_again():
    c = _Coordinator()
    for _ in range(2):
        c._set_aside_problem(_event("valve_did_not_open"))
        await _drain(c)

    c._set_aside_run_ok(0)
    await _drain(c)
    assert c._failure_records() == {}

    c._set_aside_problem(_event("valve_did_not_open"))
    await _drain(c)
    assert not c.zone_set_aside(0)


async def test_put_back_waters_it_again_and_clears_the_repair():
    c = _Coordinator(
        records={
            "0": {
                "count": 3,
                "reason": "no_flow",
                "set_aside": "2026-11-15T06:00:00+00:00",
            }
        }
    )
    assert c.is_suspended(const.SUSPEND_ZONE, 0)

    assert await c.async_put_back_zone(0) is True

    assert not c.is_suspended(const.SUSPEND_ZONE, 0)
    set_aside.ir.async_delete_issue.assert_called_once_with(
        c.hass, const.DOMAIN, "zone_set_aside_0"
    )
    signals = [call.args[1] for call in set_aside.async_dispatcher_send.call_args_list]
    assert const.DOMAIN + "_zone_put_back" in signals
    assert await c.async_put_back_zone(0) is False


async def test_its_valve_seen_opening_puts_it_back():
    c = _Coordinator(
        records={"0": {"count": 3, "set_aside": "2026-11-15T06:00:00+00:00"}}
    )
    c._track_set_aside_valves()
    entities, changed = set_aside.async_track_state_change_event.call_args.args[1:]
    assert entities == ["valve.lawn"]

    changed(
        SimpleNamespace(
            data={
                "entity_id": "valve.lawn",
                "old_state": SimpleNamespace(state="closed"),
                "new_state": SimpleNamespace(state="open"),
            }
        )
    )
    await _drain(c)

    assert not c.zone_set_aside(0)


async def test_the_repair_puts_the_zone_back():
    from custom_components.smart_irrigation import repairs

    flow = await repairs.async_create_fix_flow(
        MagicMock(), "zone_set_aside_4", {"zone_id": 4}
    )
    assert isinstance(flow, repairs.PutBackZoneFlow)
    assert flow._zone_id == 4
