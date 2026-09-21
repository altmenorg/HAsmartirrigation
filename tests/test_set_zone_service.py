"""The set_zone service validates what it is given and asserts a bucket properly.

- A misspelt state was accepted: the check tested the value against the key's
  own name, "state", as a substring, so it rejected nothing, and the zone then
  sat outside every automatic and manual path.
- A zone with no maximum bucket raised a TypeError on any bucket value.
- A bucket set here went straight to the store, so the weather collected
  before it was counted again on top of the value set, where set_bucket and
  reset_bucket keep it out of the zone's next window (#811).
"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.exceptions import SmartIrrigationError


class _State:
    def __init__(self, zone_id):
        self.attributes = {const.ZONE_ID: zone_id}


def _coordinator(zone):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.states.get = lambda entity_id: _State(zone[const.ZONE_ID])
    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(return_value=zone)
    coordinator.store.async_update_zone = AsyncMock()
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
