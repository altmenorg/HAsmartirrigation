"""The start is placed for the run the forecast credit will leave.

A start that finishes at a moment is placed the length of the run before it,
and with the zones calculated just before the start that length is the live
estimate. The estimate ignored the forecast rain credit the run applies when it
starts, so a 10 mm deficit with 4 mm forecast was placed for 10 mm of watering
and finished well before the moment it was meant to finish at.
"""

from unittest.mock import AsyncMock, MagicMock, Mock

from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.skip_conditions import SkipConditionsMixin
from custom_components.smart_irrigation.triggers import TriggersMixin

MM_PER_INCH = 25.4


class _Armed(TriggersMixin, SkipConditionsMixin):
    pass


def _armed(*, credit=True, expected=4.0, bucket=-10.0, sheltered=(), units=None):
    coordinator = _Armed()
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = units or METRIC_SYSTEM
    coordinator.hass.async_add_executor_job = AsyncMock(
        side_effect=lambda func, *args: func(*args)
    )
    coordinator.use_weather_service = True
    coordinator.store = MagicMock()
    coordinator.store.async_get_zones = AsyncMock(
        return_value=[
            {
                const.ZONE_ID: 0,
                const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
                const.ZONE_DURATION: 0,
            }
        ]
    )
    coordinator.store.async_get_config = AsyncMock(
        return_value={
            const.CONF_RECALCULATE_BEFORE_START: True,
            const.CONF_FORECAST_RAIN_CREDIT: credit,
        }
    )
    coordinator.async_estimate_all_zones_now = AsyncMock(
        return_value={"0": {"duration": 1200, "bucket": bucket}}
    )
    coordinator.async_zones_sheltered_from_rain = AsyncMock(return_value=set(sheltered))
    # 10 mm of deficit is 1200 s: a rate of 30 mm/h, as in the run's credit.
    coordinator.duration_from_bucket = Mock(
        side_effect=lambda zone, bucket_mm: (
            0 if bucket_mm >= 0 else round(abs(bucket_mm) / 30.0 * 3600)
        )
    )
    coordinator._WeatherServiceClient = Mock()
    coordinator._WeatherServiceClient.get_expected_rain_ahead = Mock(
        return_value=expected
    )
    return coordinator


async def test_the_forecast_shortens_the_planned_run():
    """10 mm short, 4 mm forecast: placed for 6 mm, 720 s, not 1200."""
    assert await _armed()._planned_run_seconds() == 720


async def test_without_the_credit_the_run_is_placed_as_estimated():
    coordinator = _armed(credit=False)

    assert await coordinator._planned_run_seconds() == 1200
    coordinator._WeatherServiceClient.get_expected_rain_ahead.assert_not_called()


async def test_a_zone_under_glass_is_placed_as_estimated():
    assert await _armed(sheltered=(0,))._planned_run_seconds() == 1200


async def test_an_unreadable_forecast_places_the_run_as_estimated():
    coordinator = _armed()
    coordinator._WeatherServiceClient.get_expected_rain_ahead = Mock(
        side_effect=RuntimeError("no network")
    )

    assert await coordinator._planned_run_seconds() == 1200


async def test_a_forecast_that_does_not_reach_the_window_end_credits_nothing():
    assert await _armed(expected=None)._planned_run_seconds() == 1200


async def test_an_imperial_estimate_is_credited_in_millimetres():
    """The estimate's bucket is in inches there; the credit is not."""
    coordinator = _armed(bucket=-10.0 / MM_PER_INCH, units=US_CUSTOMARY_SYSTEM)

    assert await coordinator._planned_run_seconds() == 720


async def test_the_credit_never_lengthens_the_run():
    coordinator = _armed(expected=4.0)
    coordinator.duration_from_bucket = Mock(return_value=5000)

    assert await coordinator._planned_run_seconds() == 1200
