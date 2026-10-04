"""The close is checked, retried once, and never leaves the zone stuck "running".

A close service that raised (an entity renamed, a failing script) skipped the
clearing of the in-flight record, so the zone was "already running, skipped" at
every start until a restart, with nothing to say the valve might still be open.
And a close that went through was never checked against the valve's state.
"""

import datetime

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.valve_runner import (
    PROBLEM_DID_NOT_CLOSE,
    VALVE_CLOSE_RETRY_DELAY,
)
from tests.runner_doubles import (
    Coordinator,
    Sleeps,
    closes,
    make_hass,
    make_store,
    problems,
    set_state,
    zone,
)


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


def _runner():
    hass = make_hass()
    coord = Coordinator(hass, make_store([zone(0)], sequencing="parallel"))
    return hass, coord


async def test_a_close_that_raises_clears_the_run_and_says_so(sleeps):
    hass, coord = _runner()
    hass.close_fails = 2  # the close and its retry both raise

    result = await coord._run_one_valve(coord.store.get_zone(0))

    assert closes(hass) == ["switch.zone_0", "switch.zone_0"]
    assert VALVE_CLOSE_RETRY_DELAY in sleeps.waited
    assert problems(hass) == [PROBLEM_DID_NOT_CLOSE]
    assert result["problem"] == PROBLEM_DID_NOT_CLOSE
    # The run is over as far as Smart Irrigation is concerned: nothing left
    # recorded, so the next start does not skip the zone as "already running".
    assert coord._active_valve_runs == {}
    assert not coord._run_in_flight(0)
    assert coord._eligible_direct_zones([coord.store.get_zone(0)], None)
    # The water of the pass did flow, and is credited.
    assert coord.store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-2.0)


async def test_a_close_that_raises_once_is_retried_and_nothing_is_reported(sleeps):
    hass, coord = _runner()
    hass.close_fails = 1

    result = await coord._run_one_valve(coord.store.get_zone(0))

    assert closes(hass) == ["switch.zone_0", "switch.zone_0"]
    assert problems(hass) == []
    assert result["problem"] is None
    assert hass.states_by_id["switch.zone_0"].state == "off"


async def test_a_valve_that_stays_open_after_the_close_is_reported(sleeps):
    hass, coord = _runner()
    hass.stuck.add("switch.zone_0")

    result = await coord._run_one_valve(coord.store.get_zone(0))

    assert closes(hass) == ["switch.zone_0", "switch.zone_0"]
    assert problems(hass) == [PROBLEM_DID_NOT_CLOSE]
    assert result["ran"] is True
    assert result["problem"] == PROBLEM_DID_NOT_CLOSE
    assert coord._active_valve_runs == {}


async def test_a_stuck_valve_stops_the_passes_after_it(sleeps):
    """Cycle and soak: no second pass opens a valve that would not close."""
    hass = make_hass()
    coord = Coordinator(hass, make_store([zone(0)], passes=3, soak=10))
    hass.stuck.add("switch.zone_0")

    result = await coord._run_one_valve(coord.store.get_zone(0))

    assert [s for s, e in hass.calls if s == "turn_on"] == ["turn_on"]
    assert result["seconds"] == 100


async def test_a_normal_close_fires_nothing(sleeps):
    hass, coord = _runner()

    result = await coord._run_one_valve(coord.store.get_zone(0))

    assert closes(hass) == ["switch.zone_0"]
    assert problems(hass) == []
    assert result["problem"] is None
    # No waiting on the close beyond the pass itself.
    assert sleeps.waited == [300.0]


async def test_a_valve_reopened_by_someone_after_the_close_is_not_a_failure(sleeps):
    """A state that changed after the close was asked for is another run."""
    hass, coord = _runner()
    later = dt_util.utcnow() + datetime.timedelta(minutes=5)
    original = hass.services.async_call.side_effect

    async def _call(domain, service, data, **kwargs):
        await original(domain, service, data, **kwargs)
        if service == "turn_off":
            set_state(hass, data["entity_id"], "on", changed=later)

    hass.services.async_call.side_effect = _call

    await coord._run_one_valve(coord.store.get_zone(0))

    assert problems(hass) == []
    assert closes(hass) == ["switch.zone_0"]


def _overdue_run(seconds_ago=400, duration=300):
    return {
        const.RUN_ZONE_ID: 0,
        const.RUN_ENTITY_ID: "switch.zone_0",
        const.RUN_STARTED: (
            dt_util.utcnow() - datetime.timedelta(seconds=seconds_ago)
        ).isoformat(),
        const.RUN_DURATION: duration,
    }


async def test_a_failed_close_on_resume_still_clears_the_run(sleeps):
    hass, coord = _runner()
    hass.close_fails = 2
    run = _overdue_run()
    coord._active_valve_runs[0] = {
        "entity": "switch.zone_0",
        "started": run[const.RUN_STARTED],
        "duration": 300.0,
    }

    await coord._resume_one(run)

    assert problems(hass) == [PROBLEM_DID_NOT_CLOSE]
    assert coord._active_valve_runs == {}
    assert not coord._run_in_flight(0)


async def test_a_failed_close_after_a_resumed_run_still_clears_it(sleeps):
    hass, coord = _runner()
    hass.close_fails = 2
    run = _overdue_run(seconds_ago=100)
    coord._active_valve_runs[0] = {
        "entity": "switch.zone_0",
        "started": run[const.RUN_STARTED],
        "duration": 300.0,
    }

    await coord._resume_one(run)

    assert problems(hass) == [PROBLEM_DID_NOT_CLOSE]
    assert coord._active_valve_runs == {}
    assert not coord._run_in_flight(0)
