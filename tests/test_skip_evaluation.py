"""The skip conditions report why they veto, not just that they do (#794).

A panel that only knows a run was skipped cannot tell anyone why, which is what
people ask. So the checks report themselves and the boolean falls out of them:
the explanation is produced by the code that makes the decision, so the two
cannot disagree.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator(**config):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.async_get_config = AsyncMock(return_value=config)
    coordinator.store.async_get_zones = AsyncMock(return_value=[])
    coordinator._WeatherServiceClient = None
    return coordinator


def _check(evaluation, check_id):
    return next(c for c in evaluation["checks"] if c["id"] == check_id)


@pytest.mark.asyncio
async def test_nothing_configured_vetoes_nothing():
    evaluation = await _coordinator().async_evaluate_skip_conditions()

    assert evaluation["should_skip"] is False
    assert evaluation["reason"] is None
    assert {c["id"] for c in evaluation["checks"]} == {
        "rain_sensor",
        "freeze",
        "wind",
        "precipitation",
        "days_between",
        "soil_moisture",
    }
    assert not any(c["enabled"] for c in evaluation["checks"])


@pytest.mark.asyncio
async def test_a_disabled_check_says_so_rather_than_going_quiet():
    """The panel needs to tell "off" apart from "on and satisfied"."""
    evaluation = await _coordinator().async_evaluate_skip_conditions()

    assert _check(evaluation, "precipitation")["enabled"] is False
    assert _check(evaluation, "days_between")["enabled"] is False


@pytest.mark.asyncio
async def test_too_few_days_vetoes_and_carries_its_numbers():
    coordinator = _coordinator(
        **{
            const.CONF_DAYS_BETWEEN_IRRIGATION: 5,
            const.CONF_DAYS_SINCE_LAST_IRRIGATION: 2,
        }
    )

    evaluation = await coordinator.async_evaluate_skip_conditions()
    days = _check(evaluation, "days_between")

    assert evaluation["should_skip"] is True
    assert evaluation["reason"] == "days_between"
    assert days["skip"] is True
    assert days["days_since"] == 2
    assert days["days_required"] == 5


@pytest.mark.asyncio
async def test_enough_days_lets_it_run():
    coordinator = _coordinator(
        **{
            const.CONF_DAYS_BETWEEN_IRRIGATION: 3,
            const.CONF_DAYS_SINCE_LAST_IRRIGATION: 3,
        }
    )

    evaluation = await coordinator.async_evaluate_skip_conditions()

    assert evaluation["should_skip"] is False
    assert _check(evaluation, "days_between")["enabled"] is True


@pytest.mark.asyncio
async def test_a_forecast_that_cannot_be_read_is_not_the_same_as_no_rain():
    """It still waters, which is the long-standing behaviour, but it says so.

    Without this a reader cannot tell "no rain is coming" from "we could not
    find out", and those call for different reactions.
    """
    coordinator = _coordinator(
        **{
            const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: True,
            const.CONF_USE_WEATHER_SERVICE: False,
        }
    )

    evaluation = await coordinator.async_evaluate_skip_conditions()
    rain = _check(evaluation, "precipitation")

    assert rain["enabled"] is True
    assert rain["available"] is False
    assert rain["skip"] is False
    assert evaluation["should_skip"] is False


@pytest.mark.asyncio
async def test_the_boolean_helpers_still_agree_with_the_evaluation():
    """They are what the rest of the code calls; they must not drift."""
    coordinator = _coordinator(
        **{
            const.CONF_DAYS_BETWEEN_IRRIGATION: 5,
            const.CONF_DAYS_SINCE_LAST_IRRIGATION: 1,
        }
    )

    assert await coordinator._check_days_between_irrigation() is True
    assert await coordinator._check_precipitation_forecast() is False
