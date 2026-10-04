"""How long a run takes: a resumed run, and the wall clock of a whole run.

A run resumed after a restart counted what was left before re-opening and
confirming the valve, which takes time of its own, and then waited that stale
remainder out: the run was held longer than planned.

The wall clock a run occupies left out the lead time paid again on every pass
after the first, so a trigger that must finish by sunrise started too late.
"""

import datetime

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const, valve_runner
from custom_components.smart_irrigation.valve_runner import wall_clock_seconds
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


# --- a resumed run ----------------------------------------------------------


async def test_a_resumed_run_counts_the_time_its_confirm_took(sleeps, monkeypatch):
    base = dt_util.utcnow()
    now = {"t": base}
    monkeypatch.setattr(valve_runner.dt_util, "utcnow", lambda: now["t"])
    hass = make_hass()
    coord = Coordinator(hass, make_store([zone(0)]))
    original = coord._confirm_valve_running

    async def _slow_confirm(entity_id):
        now["t"] += datetime.timedelta(seconds=30)
        return await original(entity_id)

    coord._confirm_valve_running = _slow_confirm
    run = {
        const.RUN_ZONE_ID: 0,
        const.RUN_ENTITY_ID: "switch.zone_0",
        const.RUN_STARTED: (base - datetime.timedelta(seconds=100)).isoformat(),
        const.RUN_DURATION: 300.0,
    }

    await coord._resume_one(run)

    # 100 s before the restart and 30 s re-opening: 170 s were left, not 200.
    assert sleeps.waited == [pytest.approx(170.0)]
    # The run was held for its planned 300 s, and that is what is credited.
    assert coord.store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-2.0)


async def test_a_resumed_run_whose_time_ran_out_while_reopening_waits_nothing(
    sleeps, monkeypatch
):
    base = dt_util.utcnow()
    now = {"t": base}
    monkeypatch.setattr(valve_runner.dt_util, "utcnow", lambda: now["t"])
    hass = make_hass()
    coord = Coordinator(hass, make_store([zone(0)]))
    original = coord._confirm_valve_running

    async def _very_slow_confirm(entity_id):
        now["t"] += datetime.timedelta(seconds=60)
        return await original(entity_id)

    coord._confirm_valve_running = _very_slow_confirm
    run = {
        const.RUN_ZONE_ID: 0,
        const.RUN_ENTITY_ID: "switch.zone_0",
        const.RUN_STARTED: (base - datetime.timedelta(seconds=280)).isoformat(),
        const.RUN_DURATION: 300.0,
    }

    await coord._resume_one(run)

    assert sleeps.waited == [0.0]


# --- the wall clock of a run ------------------------------------------------


def _config(passes, soak_minutes):
    return {
        const.CONF_WATERING_PASSES: passes,
        const.CONF_SOAK_MINUTES: soak_minutes,
    }


def test_one_pass_is_the_duration():
    assert wall_clock_seconds(_config(1, 10), 360, lead=60) == 360


def test_without_a_lead_time_nothing_changes():
    # Three passes of 100 s and two ten-minute soaks.
    assert wall_clock_seconds(_config(3, 10), 300) == 300 + 2 * 600


def test_every_pass_after_the_first_pays_the_lead_again():
    # 300 s of water and a 60 s lead, in three passes: 3 x 160 s + 2 soaks.
    assert wall_clock_seconds(_config(3, 10), 360, lead=60) == 3 * 160 + 2 * 600


def test_the_passes_are_planned_on_the_water_alone():
    """130 s with a 60 s lead is 70 s of water: one pass, as the runner does it,
    not the two that 130 s would have been split into."""
    assert wall_clock_seconds(_config(2, 10), 130, lead=60) == 130


def test_a_lead_longer_than_the_run_is_cut_to_it():
    assert wall_clock_seconds(_config(3, 10), 30, lead=600) == 30


def test_a_lead_that_is_not_a_number_counts_as_none():
    assert wall_clock_seconds(_config(3, 10), 300, lead="soon") == 300 + 2 * 600


async def test_the_wall_clock_is_what_the_runner_actually_takes(sleeps):
    hass = make_hass()
    coord = Coordinator(
        hass,
        make_store(
            [zone(0, **{const.ZONE_LEAD_TIME: 60, const.ZONE_DURATION: 360})],
            passes=3,
            soak=10,
        ),
    )

    await coord._run_one_valve(coord.store.get_zone(0))

    expected = wall_clock_seconds(_config(3, 10), 360, lead=60)
    assert sum(sleeps.waited) == pytest.approx(expected)
