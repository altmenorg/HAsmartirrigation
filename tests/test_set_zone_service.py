"""The set_zone service validates what it is given and asserts a bucket properly.

- A misspelt state was accepted: the check tested the value against the key's
  own name, "state", as a substring, so it rejected nothing, and the zone then
  sat outside every automatic and manual path.
- A zone with no maximum bucket raised a TypeError on any bucket value.
- A bucket set here went straight to the store, so the weather collected
  before it was counted again on top of the value set, where set_bucket and
  reset_bucket keep it out of the zone's next window (#811).
- set_bucket, set_multiplier and set_zone wrote to the store and returned, so
  a duration they made owed after midnight had no start armed for it until the
  next midnight; the panel's path re-arms the start (#969).
"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.exceptions import SmartIrrigationError


class _State:
    def __init__(self, zone_id):
        self.attributes = {const.ZONE_ID: zone_id}


def _coordinator(zone, units=METRIC_SYSTEM):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = units
    coordinator.hass.states.get = lambda entity_id: _State(zone[const.ZONE_ID])
    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(return_value=zone)
    coordinator.store.async_update_zone = AsyncMock()
    coordinator.register_start_event = AsyncMock()
    return coordinator


def _call(**data):
    call = MagicMock()
    call.data = {const.SERVICE_ENTITY_ID: "sensor.smart_irrigation_lawn", **data}
    return call


ZONE = {
    const.ZONE_ID: 3,
    const.ZONE_NAME: "Lawn",
    const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
    const.ZONE_MAXIMUM_BUCKET: 10.0,
}


@pytest.mark.asyncio
@pytest.mark.parametrize("state", ["automatik", "on", ""])
async def test_a_state_that_does_not_exist_is_refused(state):
    coordinator = _coordinator(dict(ZONE))

    with pytest.raises(SmartIrrigationError):
        await coordinator.handle_set_zone(_call(**{const.ATTR_NEW_STATE_VALUE: state}))

    coordinator.store.async_update_zone.assert_not_awaited()


@pytest.mark.asyncio
@pytest.mark.parametrize("state", const.ZONE_STATES)
async def test_every_real_state_is_accepted(state):
    coordinator = _coordinator(dict(ZONE))

    await coordinator.handle_set_zone(_call(**{const.ATTR_NEW_STATE_VALUE: state}))

    coordinator.store.async_update_zone.assert_awaited_once_with(
        3, {const.ZONE_STATE: state}
    )


@pytest.mark.asyncio
async def test_a_bucket_on_a_zone_without_a_maximum_is_set():
    coordinator = _coordinator({**ZONE, const.ZONE_MAXIMUM_BUCKET: None})

    await coordinator.handle_set_zone(_call(**{const.ATTR_NEW_BUCKET_VALUE: -4.0}))

    changes = coordinator.store.async_update_zone.await_args.args[1]
    assert changes[const.ATTR_NEW_BUCKET_VALUE] == -4.0


@pytest.mark.asyncio
async def test_a_bucket_above_the_maximum_is_still_refused():
    coordinator = _coordinator(dict(ZONE))

    with pytest.raises(SmartIrrigationError):
        await coordinator.handle_set_zone(_call(**{const.ATTR_NEW_BUCKET_VALUE: 12.0}))


@pytest.mark.asyncio
async def test_a_bucket_set_here_starts_the_zones_next_window_now():
    coordinator = _coordinator(dict(ZONE))
    before = datetime.now()

    await coordinator.handle_set_zone(_call(**{const.ATTR_NEW_BUCKET_VALUE: 0.0}))

    changes = coordinator.store.async_update_zone.await_args.args[1]
    assert before <= changes[const.ZONE_LAST_CONSUMED_AT] <= datetime.now()
    assert changes[const.ZONE_PRECIPITATION_SUPERSEDED] == 0.0


@pytest.mark.asyncio
async def test_an_imperial_bucket_is_stored_in_mm():
    """Zones store metric (units.py); the service takes the unit shown."""
    coordinator = _coordinator(
        {**ZONE, const.ZONE_MAXIMUM_BUCKET: 50.8}, units=US_CUSTOMARY_SYSTEM
    )

    await coordinator.handle_set_zone(_call(**{const.ATTR_NEW_BUCKET_VALUE: -1.0}))

    changes = coordinator.store.async_update_zone.await_args.args[1]
    assert changes[const.ATTR_NEW_BUCKET_VALUE] == pytest.approx(-25.4)


@pytest.mark.asyncio
async def test_an_imperial_bucket_is_checked_against_the_maximum_in_the_same_unit():
    """3 in is 76.2 mm, above a 50.8 mm (2 in) maximum."""
    coordinator = _coordinator(
        {**ZONE, const.ZONE_MAXIMUM_BUCKET: 50.8}, units=US_CUSTOMARY_SYSTEM
    )

    with pytest.raises(SmartIrrigationError):
        await coordinator.handle_set_zone(_call(**{const.ATTR_NEW_BUCKET_VALUE: 3.0}))


@pytest.mark.asyncio
async def test_a_bucket_set_here_arms_the_start():
    """0 to -9.5 mm owes a run; the start has to be armed for it."""
    coordinator = _coordinator(dict(ZONE))

    await coordinator.handle_set_zone(_call(**{const.ATTR_NEW_BUCKET_VALUE: -9.5}))

    coordinator.register_start_event.assert_awaited_once()


@pytest.mark.asyncio
async def test_a_state_set_here_arms_the_start():
    """A zone made automatic, or taken out, changes what the start is for."""
    coordinator = _coordinator(dict(ZONE))

    await coordinator.handle_set_zone(
        _call(**{const.ATTR_NEW_STATE_VALUE: const.ZONE_STATE_DISABLED})
    )

    coordinator.register_start_event.assert_awaited_once()


@pytest.mark.asyncio
async def test_several_zones_arm_the_start_once():
    coordinator = _coordinator(dict(ZONE))
    call = _call(**{const.ATTR_NEW_BUCKET_VALUE: -2.0})
    call.data[const.SERVICE_ENTITY_ID] = [
        "sensor.smart_irrigation_lawn",
        "sensor.smart_irrigation_hedge",
    ]

    await coordinator.handle_set_zone(call)

    assert coordinator.store.async_update_zone.await_count == 2
    coordinator.register_start_event.assert_awaited_once()


@pytest.mark.asyncio
async def test_a_refused_call_arms_nothing():
    """Nothing written, so nothing to place the start for."""
    coordinator = _coordinator(dict(ZONE))

    with pytest.raises(SmartIrrigationError):
        await coordinator.handle_set_zone(_call(**{const.ATTR_NEW_BUCKET_VALUE: 12.0}))

    coordinator.register_start_event.assert_not_awaited()


@pytest.mark.asyncio
async def test_a_zone_written_before_a_refused_one_still_arms_the_start():
    """The first zone's bucket stands, so its run must be started."""
    zones = {
        3: dict(ZONE),
        4: {**ZONE, const.ZONE_ID: 4, const.ZONE_MAXIMUM_BUCKET: 1.0},
    }
    ids = {"sensor.smart_irrigation_lawn": 3, "sensor.smart_irrigation_hedge": 4}
    coordinator = _coordinator(dict(ZONE))
    coordinator.hass.states.get = lambda entity_id: _State(ids[entity_id])
    coordinator.store.get_zone = MagicMock(side_effect=lambda zone_id: zones[zone_id])
    call = _call(**{const.ATTR_NEW_BUCKET_VALUE: 5.0})
    call.data[const.SERVICE_ENTITY_ID] = list(ids)

    with pytest.raises(SmartIrrigationError):
        await coordinator.handle_set_zone(call)

    coordinator.store.async_update_zone.assert_awaited_once()
    assert coordinator.store.async_update_zone.await_args.args[0] == 3
    coordinator.register_start_event.assert_awaited_once()
