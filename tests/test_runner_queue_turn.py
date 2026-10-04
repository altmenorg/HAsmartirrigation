"""A sequential cycle waters each zone as it is when its turn comes.

The queue holds the zones as they were when the cycle started. A zone watered
by hand while it waited (the observer credited it and set its duration to 0)
was still run for its queued duration and credited a second time; one disabled
or edited meanwhile was run as it had been. And the check that a valve was not
open from outside ran before the pause between zones, not after it.
"""

from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from custom_components.smart_irrigation import const
from tests.runner_doubles import (
    REAL_SLEEP,
    Coordinator,
    Sleeps,
    make_hass,
    make_store,
    opens,
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


def _cycle(zone_ids, *, pause=0):
    hass = make_hass()
    coord = Coordinator(hass, make_store([zone(i) for i in zone_ids], pause=pause))
    return hass, coord


def _valve_event(entity_id, old, new):
    event = Mock()
    event.data = {
        "entity_id": entity_id,
        "old_state": SimpleNamespace(state=old),
        "new_state": SimpleNamespace(state=new),
    }
    return event


async def test_a_zone_watered_by_hand_while_it_waits_is_not_run(sleeps):
    hass, coord = _cycle([1, 3])
    coord._observed_zone_by_entity = {"switch.zone_3": 3}

    async def _water_zone_3_by_hand():
        # While zone 1 is open, somebody opens and closes zone 3's valve, and
        # the observer credits the run.
        coord._observed_state_changed(_valve_event("switch.zone_3", "off", "on"))
        coord._observed_state_changed(_valve_event("switch.zone_3", "on", "off"))
        for _ in range(5):
            await REAL_SLEEP(0)

    sleeps.on(300, _water_zone_3_by_hand)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_1"]
    # Credited once, by the observer, for the run by hand only.
    credited = [call.args[0] for call in coord.store.async_update_zone.await_args_list]
    assert credited.count(3) == 1


async def test_a_run_by_hand_counts_as_watered_from_the_moment_it_closes():
    """The cycle's own "watered since" check covers runs by hand too, without
    waiting for the credit to land."""
    hass, coord = _cycle([3])
    coord._observed_zone_by_entity = {"switch.zone_3": 3}
    before = hass.loop.time()

    coord._observed_state_changed(_valve_event("switch.zone_3", "off", "on"))
    assert not coord._watered_since(3, before)
    coord._observed_state_changed(_valve_event("switch.zone_3", "on", "off"))

    assert coord._watered_since(3, before)
    for task in hass.created:
        await task


async def test_a_zone_disabled_while_it_waits_is_not_run(sleeps):
    hass, coord = _cycle([1, 3])

    async def _disable():
        coord.store.by_id[3][const.ZONE_STATE] = const.ZONE_STATE_DISABLED

    sleeps.on(300, _disable)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_1"]


async def test_a_zone_edited_to_no_duration_while_it_waits_is_not_run(sleeps):
    hass, coord = _cycle([1, 3])

    async def _no_more_water():
        coord.store.by_id[3][const.ZONE_DURATION] = 0

    sleeps.on(300, _no_more_water)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_1"]


async def test_a_zone_runs_for_the_duration_it_has_at_its_turn(sleeps):
    hass, coord = _cycle([1, 3])

    async def _shorter():
        coord.store.by_id[3][const.ZONE_DURATION] = 120

    sleeps.on(300, _shorter)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_1", "switch.zone_3"]
    assert sleeps.waited == [300.0, 120.0]


async def test_a_zone_removed_while_it_waits_is_not_run(sleeps):
    hass, coord = _cycle([1, 3])

    async def _remove():
        del coord.store.by_id[3]

    sleeps.on(300, _remove)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_1"]


async def test_a_zone_still_waters_when_nothing_changed(sleeps):
    hass, coord = _cycle([1, 3])

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_1", "switch.zone_3"]


# --- the pause between zones ------------------------------------------------


async def test_a_valve_opened_by_hand_during_the_pause_is_not_opened_again(sleeps):
    hass, coord = _cycle([1, 3], pause=90)
    coord._observed_zone_by_entity = {"switch.zone_3": 3}

    async def _open_zone_3_by_hand():
        set_state(hass, "switch.zone_3", "on")
        coord._observed_state_changed(_valve_event("switch.zone_3", "off", "on"))

    sleeps.on(90, _open_zone_3_by_hand)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_1"]
    assert 3 in coord._observed_on_since, "the run by hand is still tracked"


async def test_a_zone_skipped_after_the_pause_does_not_cost_a_second_pause(sleeps):
    hass, coord = _cycle([1, 2, 3], pause=90)

    async def _open_zone_2_by_hand():
        coord._observed_on_since[2] = object()

    sleeps.on(90, _open_zone_2_by_hand)

    await coord.async_run_direct_valves()

    assert opens(hass) == ["switch.zone_1", "switch.zone_3"]
    assert sleeps.waited == [300.0, 90.0, 300.0]
