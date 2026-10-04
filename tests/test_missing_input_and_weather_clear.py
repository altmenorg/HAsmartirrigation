"""A zone the equation could not price says so; weather data can be cleared by zone.

The first: with every day of the window lacking something, the equation returns
no evapotranspiration, the deficit does not move and the zone is never watered,
which looks exactly like a zone with no need. The second: weather data is kept
per sensor group, and a service can now clear the groups of chosen zones.
"""

from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.flow_calibration import (
    FlowCalibrationMixin,
)
from custom_components.smart_irrigation.service_handlers import ServiceHandlersMixin

ZONE = {const.ZONE_ID: 2, const.ZONE_NAME: "Lawn"}


def _advisories():
    class _M(FlowCalibrationMixin):
        pass

    mixin = _M()
    mixin.hass = MagicMock()
    return mixin


def _priced(days_in_average=0, missing=()):
    return {
        "days_in_average": days_in_average,
        "days": [{"missing": list(missing)}] if missing else [None],
    }


def test_a_window_with_nothing_to_price_raises_the_advisory_naming_the_inputs():
    with patch("custom_components.smart_irrigation.flow_calibration.ir") as ir:
        _advisories()._review_missing_input(
            ZONE, _priced(0, ("Wind speed", "Maximum Temperature"))
        )

    ir.async_create_issue.assert_called_once()
    assert ir.async_create_issue.call_args[0][2] == "missing_input_2"
    placeholders = ir.async_create_issue.call_args.kwargs["translation_placeholders"]
    assert placeholders["missing"] == "Maximum Temperature, Wind speed"


def test_a_window_that_could_be_priced_clears_it():
    with patch("custom_components.smart_irrigation.flow_calibration.ir") as ir:
        _advisories()._review_missing_input(ZONE, _priced(1))

    ir.async_delete_issue.assert_called_once()
    ir.async_create_issue.assert_not_called()


def test_nothing_is_said_when_no_input_is_named():
    with patch("custom_components.smart_irrigation.flow_calibration.ir") as ir:
        _advisories()._review_missing_input(ZONE, _priced(0))
        _advisories()._review_missing_input(ZONE, None)
        _advisories()._review_missing_input(ZONE, {"module": "x"})

    ir.async_create_issue.assert_not_called()


def test_the_review_never_costs_a_calculation():
    class _Calc(CalculationMixin):
        pass

    calc = _Calc()
    calc._review_missing_input = MagicMock(side_effect=RuntimeError("boom"))

    calc._check_missing_input(ZONE, MagicMock())


# --- clearing the weather data of chosen zones


def _handlers(zones):
    class _Handlers(ServiceHandlersMixin, CalculationMixin):
        pass

    handlers = _Handlers()
    handlers.hass = MagicMock()
    handlers.hass.states.get = lambda entity: (
        MagicMock(attributes={const.ZONE_ID: zones[entity]["id"]})
        if entity in zones
        else None
    )
    handlers.store = MagicMock()
    handlers.store.get_zone = lambda zone_id: next(
        (z["zone"] for z in zones.values() if z["id"] == zone_id), None
    )
    handlers.store.async_get_mappings = AsyncMock(
        return_value=[{const.MAPPING_ID: 1}, {const.MAPPING_ID: 2}]
    )
    handlers.store.async_update_mapping = AsyncMock()
    return handlers


ZONES = {
    "sensor.lawn": {"id": 0, "zone": {const.ZONE_MAPPING: 1}},
    "sensor.beds": {"id": 1, "zone": {const.ZONE_MAPPING: 2}},
}


async def test_without_zones_every_group_is_cleared():
    handlers = _handlers(ZONES)

    await handlers.handle_clear_weatherdata(MagicMock(data={}))

    cleared = {c.args[0] for c in handlers.store.async_update_mapping.await_args_list}
    assert cleared == {1, 2}


async def test_naming_a_zone_clears_only_its_group():
    handlers = _handlers(ZONES)

    await handlers.handle_clear_weatherdata(
        MagicMock(data={const.SERVICE_ENTITY_ID: "sensor.lawn"})
    )

    handlers.store.async_update_mapping.assert_awaited_once_with(
        1, {const.MAPPING_DATA: [], const.MAPPING_DATA_LAST_CALCULATION: {}}
    )


async def test_a_list_of_zones_clears_each_group_once():
    handlers = _handlers(ZONES)

    await handlers.handle_clear_weatherdata(
        MagicMock(
            data={
                const.SERVICE_ENTITY_ID: ["sensor.lawn", "sensor.beds", "sensor.lawn"]
            }
        )
    )

    cleared = [c.args[0] for c in handlers.store.async_update_mapping.await_args_list]
    assert sorted(cleared) == [1, 2]


async def test_something_that_is_not_a_zone_clears_nothing():
    handlers = _handlers(ZONES)

    await handlers.handle_clear_weatherdata(
        MagicMock(data={const.SERVICE_ENTITY_ID: "sensor.not_a_zone"})
    )

    handlers.store.async_update_mapping.assert_not_awaited()
