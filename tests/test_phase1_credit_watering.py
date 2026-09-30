"""credit_watering credits the water a run delivered (phase 1.14).

reset_bucket sets the bucket to 0, which is right only when the run was the
whole of what the zone needed. A run cut short by the maximum duration left a
deficit that the reset wiped out.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator(duration=1800):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.states.get = lambda entity: SimpleNamespace(
        attributes={const.ZONE_ID: 3}
    )
    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(
        return_value={const.ZONE_NAME: "Lawn", const.ZONE_DURATION: duration}
    )
    coordinator._credit_observed_watering = AsyncMock()
    return coordinator


def _call(**data):
    return SimpleNamespace(data={const.SERVICE_ENTITY_ID: "sensor.lawn", **data})


@pytest.mark.asyncio
async def test_the_seconds_it_ran_are_credited():
    coordinator = _coordinator()
    await coordinator.handle_credit_watering(_call(seconds=600))
    coordinator._credit_observed_watering.assert_awaited_once_with(3, 600.0)


@pytest.mark.asyncio
async def test_without_seconds_the_zone_s_duration_is_credited():
    coordinator = _coordinator(duration=1800)
    await coordinator.handle_credit_watering(_call())
    coordinator._credit_observed_watering.assert_awaited_once_with(3, 1800.0)


@pytest.mark.asyncio
async def test_a_run_of_nothing_credits_nothing():
    coordinator = _coordinator(duration=0)
    await coordinator.handle_credit_watering(_call())
    coordinator._credit_observed_watering.assert_not_awaited()


def test_the_service_is_described():
    import pathlib

    import yaml

    services = yaml.safe_load(
        pathlib.Path("custom_components/smart_irrigation/services.yaml").read_text(
            encoding="utf-8"
        )
    )
    assert "seconds" in services[const.SERVICE_CREDIT_WATERING]["fields"]
