"""When the runner takes a valve, the observer forgets any run it was tracking.

A run the observer had started tracking (the valve seen opening from outside)
was credited when the valve closed, the whole window of it, on top of the
runner's own credit for the same water. The runner's claim now clears that
marker, both for a run it starts and for one it resumes after a restart.
"""

import datetime
from types import SimpleNamespace
from unittest.mock import Mock

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from tests.runner_doubles import Coordinator, Sleeps, make_hass, make_store, zone


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


@pytest.fixture
def sleeps(monkeypatch):
    recorder = Sleeps()
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", recorder
    )
    return recorder


def _valve_event(old, new):
    event = Mock()
    event.data = {
        "entity_id": "switch.zone_0",
        "old_state": SimpleNamespace(state=old),
        "new_state": SimpleNamespace(state=new),
    }
    return event


def _observing():
    hass = make_hass()
    coord = Coordinator(hass, make_store([zone(0, flow_sensor="sensor.meter")]))
    coord._observed_zone_by_entity = {"switch.zone_0": 0}
    return hass, coord


def test_taking_the_valve_clears_the_observer_markers():
    hass, coord = _observing()
    coord._observed_state_changed(_valve_event("off", "on"))
    coord._observed_flow_start[0] = 100.0
    assert 0 in coord._observed_on_since

    coord._note_si_valve(0, 300)

    assert 0 not in coord._observed_on_since
    assert 0 not in coord._observed_flow_start


def test_the_close_after_the_runner_took_the_valve_is_not_credited():
    hass, coord = _observing()
    coord._observed_state_changed(_valve_event("off", "on"))
    coord._note_si_valve(0, 300)

    coord._observed_state_changed(_valve_event("on", "off"))

    assert hass.created == [], "no credit task"
    coord.store.async_update_zone.assert_not_called()


def _run(seconds_ago):
    return {
        const.RUN_ZONE_ID: 0,
        const.RUN_ENTITY_ID: "switch.zone_0",
        const.RUN_STARTED: (
            dt_util.utcnow() - datetime.timedelta(seconds=seconds_ago)
        ).isoformat(),
        const.RUN_DURATION: 300.0,
    }


@pytest.mark.parametrize("seconds_ago", [100, 400], ids=["remaining", "overdue"])
async def test_a_resumed_run_leaves_no_external_run_behind(sleeps, seconds_ago):
    hass, coord = _observing()
    # The observer saw the valve open before the runner resumed it.
    coord._observed_state_changed(_valve_event("off", "on"))

    await coord._resume_one(_run(seconds_ago))
    credits = coord.store.async_update_zone.await_count
    created = len(hass.created)

    coord._observed_state_changed(_valve_event("on", "off"))

    assert 0 not in coord._observed_on_since
    assert len(hass.created) == created, "the close was not credited again"
    assert coord.store.async_update_zone.await_count == credits == 1


async def test_a_resumed_zone_is_claimed_while_it_runs(sleeps):
    hass, coord = _observing()
    seen = []

    async def _during_the_run(zone, held):
        seen.append(coord._claimed_zone_ids() == {0})

    # Called just before the remaining time is waited out.
    coord._arm_safety_off = _during_the_run

    await coord._resume_one(_run(100))

    assert seen == [True]
    assert not coord._run_in_flight(0)
