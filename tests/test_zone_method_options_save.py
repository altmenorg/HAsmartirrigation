"""An engine option saved on its own still reaches the engine (#851).

The panel posts only the fields an edit changed. Changing how many days a zone
looks ahead therefore arrives as ``method_config`` alone: the method itself did
not change, so it is not in the message. The save handler only bound an engine
when a method was posted, so those options were dropped and the old value came
back on the next refresh -- Megalos reported setting the look-ahead to 0 and
finding 2 again a tab later.

The method a zone is already calculated by is the one that applies.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.websockets import SmartIrrigationZoneView


def _request(zone, data=None):
    """A request whose hass holds a coordinator with one zone.

    The view validates the body itself, so the request has to answer json()
    the way aiohttp would: that validation is part of what is under test here
    (a field the schema does not know is rejected before the handler runs).
    """
    coordinator = MagicMock()
    coordinator.async_update_zone_config = AsyncMock(return_value=zone)
    coordinator.async_set_zone_method = AsyncMock(return_value=1)
    coordinator.store.get_zone = MagicMock(return_value=zone)
    # The engine the zone currently points at: "from the weather data".
    coordinator.store.get_module = MagicMock(
        return_value={const.MODULE_ID: 1, const.MODULE_NAME: "PyETO"}
    )
    coordinator.module_id_for_zone = MagicMock(return_value=1)

    hass = MagicMock()
    hass.config.units = METRIC_SYSTEM
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    request = MagicMock()
    request.app = {"hass": hass}
    request.json = AsyncMock(return_value=dict(data or {}))
    return request, coordinator


ZONE = {
    const.ZONE_ID: 0,
    const.ZONE_NAME: "Lawn",
    const.ZONE_MODULE: 1,
    const.ZONE_MAPPING: 0,
    const.ZONE_MULTIPLIER: 0.8,
}


async def _post(data, zone=None):
    request, coordinator = _request(zone or dict(ZONE), data)
    view = SmartIrrigationZoneView()
    view.json = MagicMock(return_value={"success": True})
    with patch(
        "custom_components.smart_irrigation.websockets.async_dispatcher_send"
    ) as dispatch:
        await view.post(request)
    return coordinator, dispatch


@pytest.mark.asyncio
async def test_options_sent_without_a_method_use_the_zone_s_own():
    coordinator, _dispatch = await _post(
        {const.ZONE_ID: 0, const.ZONE_METHOD_CONFIG: {"forecast_days": 0}}
    )

    coordinator.async_set_zone_method.assert_awaited_once_with(
        0, "from_weather", {"forecast_days": 0}
    )


@pytest.mark.asyncio
async def test_zero_is_a_value_like_any_other():
    """It is the value somebody chooses to stop looking ahead at all, so a
    truthiness test on the option would defeat the whole fix."""
    coordinator, _dispatch = await _post(
        {const.ZONE_ID: 0, const.ZONE_METHOD_CONFIG: {"forecast_days": 0}}
    )

    _zone_id, _method, config = coordinator.async_set_zone_method.await_args.args
    assert config == {"forecast_days": 0}


@pytest.mark.asyncio
async def test_the_first_zone_is_a_zone():
    """Zone id 0 and sensor group 0: the case that broke every default
    installation once already (#846)."""
    coordinator, _dispatch = await _post(
        {const.ZONE_ID: 0, const.ZONE_METHOD_CONFIG: {"delta": 3.0}}
    )

    assert coordinator.async_set_zone_method.await_args.args[0] == 0


@pytest.mark.asyncio
async def test_a_method_that_is_posted_still_wins():
    coordinator, _dispatch = await _post(
        {
            const.ZONE_ID: 0,
            const.ZONE_CALCULATION_METHOD: "fixed",
            const.ZONE_METHOD_CONFIG: {"delta": 2.0},
        }
    )

    coordinator.async_set_zone_method.assert_awaited_once_with(
        0, "fixed", {"delta": 2.0}
    )


@pytest.mark.asyncio
async def test_a_save_about_something_else_binds_nothing():
    coordinator, _dispatch = await _post(
        {const.ZONE_ID: 0, const.ZONE_NAME: "Front lawn"}
    )

    coordinator.async_set_zone_method.assert_not_awaited()


@pytest.mark.asyncio
async def test_an_engine_we_do_not_recognise_is_left_alone():
    """Nothing to infer, so nothing is bound rather than something guessed."""
    request, coordinator = _request(
        dict(ZONE), {const.ZONE_ID: 0, const.ZONE_METHOD_CONFIG: {"forecast_days": 1}}
    )
    coordinator.store.get_module = MagicMock(
        return_value={const.MODULE_ID: 1, const.MODULE_NAME: "SomebodyElses"}
    )
    view = SmartIrrigationZoneView()
    view.json = MagicMock(return_value={"success": True})
    with patch("custom_components.smart_irrigation.websockets.async_dispatcher_send"):
        await view.post(request)

    coordinator.async_set_zone_method.assert_not_awaited()
