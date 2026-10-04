"""A zone is claimed for the whole of its run, soaks and confirm window included.

The in-flight record only covered a pass from its confirmed open to its close.
In parallel mode a second dispatch (the zone's "irrigate now" button, another
trigger) during a soak, or while the valve was being confirmed open, found the
zone free, opened the same valve, and both runs closed it under each other and
credited the bucket.
"""

import pytest

from custom_components.smart_irrigation import const
from tests.runner_doubles import (
    Coordinator,
    Sleeps,
    make_hass,
    make_store,
    opens,
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


def _parallel(passes=1, soak=0):
    hass = make_hass()
    coord = Coordinator(
        hass,
        make_store([zone(0)], sequencing="parallel", passes=passes, soak=soak),
    )
    return hass, coord


async def test_a_dispatch_during_the_soak_does_not_open_the_valve_again(sleeps):
    hass, coord = _parallel(passes=2, soak=10)
    second = []

    async def _press_irrigate_now():
        second.append(await coord.async_run_direct_valves([0]))

    # Two passes of 150 s with a ten-minute soak between them.
    sleeps.on(600, _press_irrigate_now)

    await coord.async_run_direct_valves()

    assert second == [None], "the second dispatch ran during the soak"
    assert opens(hass) == ["switch.zone_0", "switch.zone_0"], "one open per pass"
    stored = coord.store.by_id[0]
    # 300 s of water is 1 mm, credited once: -3 becomes -2.
    assert stored[const.ZONE_BUCKET] == pytest.approx(-2.0)
    assert stored[const.ZONE_WATER_USED] == pytest.approx(50.0)


async def test_a_dispatch_while_the_valve_is_confirmed_open_is_skipped(sleeps):
    hass, coord = _parallel()
    original = coord._confirm_valve_running
    pressed = []

    async def _confirm(entity_id):
        if not pressed:
            pressed.append(True)
            await coord.async_run_direct_valves([0])
        return await original(entity_id)

    coord._confirm_valve_running = _confirm

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_0"]
    assert coord.store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-2.0)


async def test_two_runs_started_together_water_the_zone_once(sleeps):
    """Two dispatches can both pass the eligibility check before either run has
    started: the second run must still find the zone taken."""
    hass, coord = _parallel()
    queued = coord.store.get_zone(0)

    results = [await coord._run_one_valve(queued)]
    assert opens(hass) == ["switch.zone_0"]

    coord._claimed_zone_ids().add(0)
    results.append(await coord._run_one_valve(queued))
    assert results[1] is None
    assert opens(hass) == ["switch.zone_0"]


async def test_the_claim_ends_with_the_run(sleeps):
    hass, coord = _parallel()

    await coord.async_run_direct_valves()
    assert coord._claimed_zone_ids() == set()

    # Ask for more water, and a later dispatch waters again.
    coord.store.by_id[0][const.ZONE_DURATION] = 300
    await coord.async_run_direct_valves()
    assert opens(hass) == ["switch.zone_0", "switch.zone_0"]


async def test_the_claim_ends_when_the_run_fails(sleeps):
    hass, coord = _parallel()

    async def _broken_open(*args, **kwargs):
        raise RuntimeError("open failed")

    coord._async_call_valve_service = _broken_open

    with pytest.raises(RuntimeError):
        await coord._run_one_valve(coord.store.get_zone(0))

    assert coord._claimed_zone_ids() == set()
    assert not coord._run_in_flight(0)
