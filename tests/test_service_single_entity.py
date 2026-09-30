"""A service aimed at one entity written as a plain string works.

Home Assistant hands a single target over as a string (``entity_id:
sensor.smart_irrigation_serre`` in YAML, or a REST call). calculate_zone and
update_zone iterated it character by character, found no zone called "s", "e",
"r"... and did nothing, without a word. Found on a real install.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.states.get = lambda entity: (
        SimpleNamespace(attributes={const.ZONE_ID: 0})
        if entity == "sensor.smart_irrigation_serre"
        else None
    )
    coordinator.async_update_zone_config = AsyncMock(return_value=None)
    return coordinator


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "target", ["sensor.smart_irrigation_serre", ["sensor.smart_irrigation_serre"]]
)
async def test_calculate_zone_reaches_the_zone(target):
    coordinator = _coordinator()
    await coordinator.handle_calculate_zone(
        SimpleNamespace(data={const.SERVICE_ENTITY_ID: target})
    )
    coordinator.async_update_zone_config.assert_awaited_once()
    assert coordinator.async_update_zone_config.await_args.kwargs["zone_id"] == 0


@pytest.mark.asyncio
async def test_update_zone_reaches_the_zone():
    coordinator = _coordinator()
    await coordinator.handle_update_zone(
        SimpleNamespace(data={const.SERVICE_ENTITY_ID: "sensor.smart_irrigation_serre"})
    )
    coordinator.async_update_zone_config.assert_awaited_once()
