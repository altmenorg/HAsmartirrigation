"""A run is shortened by the rain forecast for the day after it starts.

Opt-in. The skip on a forecast is all or nothing; this credits what is expected,
weighted by the probability the service gives, measured from the moment the run
starts and not from the calculation hours before.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.skip_conditions import SkipConditionsMixin
from custom_components.smart_irrigation.triggers import TriggersMixin
from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    OpenMeteoClient,
)
from custom_components.smart_irrigation.weathermodules.SolarRadiationFallback import (
    SolarRadiationFallbackClient,
)

DAY = datetime.datetime(2026, 6, 21)


def _at(hour, minute=0):
    return DAY + datetime.timedelta(hours=hour, minutes=minute)


def _forecast(amounts, probabilities=None, hours=72):
    """Hourly forecast from midnight; each value is the hour ENDING at its stamp."""
    stamps = [int(_at(h).timestamp()) for h in range(1, hours + 1)]
    values = [amounts.get(h, 0.0) for h in range(1, hours + 1)]
    doc = {"hourly": {"time": stamps, "precipitation": values}}
    if probabilities is not None:
        doc["hourly"]["precipitation_probability"] = [
            probabilities.get(h, 100) for h in range(1, hours + 1)
        ]
    return doc


def _client():
    return OpenMeteoClient(latitude=47.6, longitude=19.36)


def test_the_rain_inside_the_window_is_summed():
    with patch.object(
        OpenMeteoClient, "_request", return_value=_forecast({9: 1.0, 10: 2.0, 30: 5.0})
    ):
        assert _client().get_expected_rain_ahead(_at(8), _at(24)) == pytest.approx(3.0)


def test_the_window_runs_from_the_start_of_the_run():
    """The rain of the hours before the run is not the run's to credit."""
    with patch.object(
        OpenMeteoClient, "_request", return_value=_forecast({2: 4.0, 12: 1.0})
    ):
        assert _client().get_expected_rain_ahead(_at(8), _at(32)) == pytest.approx(1.0)


def test_each_hour_is_weighted_by_its_probability():
    with patch.object(
        OpenMeteoClient,
        "_request",
        return_value=_forecast({10: 10.0}, {10: 30}),
    ):
        assert _client().get_expected_rain_ahead(_at(8), _at(32)) == pytest.approx(3.0)


def test_a_missing_probability_counts_the_rain_in_full():
    with patch.object(OpenMeteoClient, "_request", return_value=_forecast({10: 2.0})):
        assert _client().get_expected_rain_ahead(_at(8), _at(32)) == pytest.approx(2.0)


def test_an_hour_only_partly_inside_counts_for_its_share():
    with patch.object(OpenMeteoClient, "_request", return_value=_forecast({10: 4.0})):
        assert _client().get_expected_rain_ahead(_at(9, 30), _at(32)) == pytest.approx(
            2.0
        )


def test_a_forecast_that_stops_before_the_window_ends_is_not_used():
    with patch.object(
        OpenMeteoClient, "_request", return_value=_forecast({10: 2.0}, hours=12)
    ):
        assert _client().get_expected_rain_ahead(_at(8), _at(32)) is None


def test_a_forecast_that_cannot_be_read_is_none():
    with patch.object(OpenMeteoClient, "_request", return_value=None):
        assert _client().get_expected_rain_ahead(_at(8), _at(32)) is None


def test_the_wrapper_uses_open_meteo_for_a_service_without_a_forecast_by_hour():
    wrapper = SolarRadiationFallbackClient(Mock(spec=[]), 47.0, 19.0, 100)
    wrapper._fallback.get_expected_rain_ahead = Mock(return_value=2.5)

    assert wrapper.get_expected_rain_ahead(_at(8), _at(32)) == 2.5


# --- the coordinator


def _zone(zone_id=0, *, duration=1200, bucket=-10.0, state=const.ZONE_STATE_AUTOMATIC):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_STATE: state,
        const.ZONE_DURATION: duration,
        const.ZONE_BUCKET: bucket,
    }


def _coordinator(zones, *, enabled=True, expected=4.0, sheltered=()):
    class _Coordinator(SkipConditionsMixin, TriggersMixin, CalculationMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.hass.async_add_executor_job = AsyncMock(
        side_effect=lambda func, *args: func(*args)
    )
    coordinator.use_weather_service = True
    coordinator.store = MagicMock()
    coordinator.store.get_config.return_value = {
        const.CONF_FORECAST_RAIN_CREDIT: enabled
    }
    coordinator.store.async_get_zones = AsyncMock(return_value=zones)
    coordinator.store.async_update_zone = AsyncMock()
    coordinator.async_zones_sheltered_from_rain = AsyncMock(return_value=set(sheltered))
    coordinator.precipitation_since_last_calculation = AsyncMock(return_value=0.0)
    # 10 mm of deficit is 1200 s: a rate of 30 mm/h.
    coordinator.duration_from_bucket = Mock(
        side_effect=lambda zone, bucket: (
            0 if bucket >= 0 else round(abs(bucket) / 30.0 * 3600)
        )
    )
    coordinator._WeatherServiceClient = Mock()
    coordinator._WeatherServiceClient.get_expected_rain_ahead = Mock(
        return_value=expected
    )
    return coordinator


async def test_the_forecast_shortens_the_run_and_leaves_the_bucket():
    coordinator = _coordinator([_zone()], expected=4.0)

    await coordinator._apply_forecast_rain_credit()

    coordinator.store.async_update_zone.assert_awaited_once_with(
        0, {const.ZONE_DURATION: 720}
    )


async def test_the_rain_already_fallen_counts_too():
    coordinator = _coordinator([_zone()], expected=4.0)
    coordinator.precipitation_since_last_calculation = AsyncMock(return_value=2.0)

    await coordinator._apply_forecast_rain_credit()

    coordinator.store.async_update_zone.assert_awaited_once_with(
        0, {const.ZONE_DURATION: 480}
    )


async def test_a_forecast_bigger_than_the_deficit_waters_nothing():
    coordinator = _coordinator([_zone()], expected=12.0)

    await coordinator._apply_forecast_rain_credit()

    coordinator.store.async_update_zone.assert_awaited_once_with(
        0, {const.ZONE_DURATION: 0}
    )


async def test_it_is_off_by_default():
    coordinator = _coordinator([_zone()], enabled=False)

    await coordinator._apply_forecast_rain_credit()

    coordinator._WeatherServiceClient.get_expected_rain_ahead.assert_not_called()
    coordinator.store.async_update_zone.assert_not_awaited()


async def test_a_zone_under_glass_is_left_alone():
    coordinator = _coordinator([_zone(0), _zone(1)], sheltered=(1,))

    await coordinator._apply_forecast_rain_credit()

    coordinator.store.async_update_zone.assert_awaited_once()
    assert coordinator.store.async_update_zone.await_args[0][0] == 0


async def test_a_manual_zone_and_a_zone_with_nothing_to_water_are_left_alone():
    coordinator = _coordinator(
        [_zone(0, state=const.ZONE_STATE_MANUAL), _zone(1, duration=0)]
    )

    await coordinator._apply_forecast_rain_credit()

    coordinator.store.async_update_zone.assert_not_awaited()


async def test_a_forecast_that_cannot_be_read_leaves_the_run_as_calculated():
    coordinator = _coordinator([_zone()], expected=None)

    await coordinator._apply_forecast_rain_credit()

    coordinator.store.async_update_zone.assert_not_awaited()


async def test_a_failing_forecast_never_breaks_the_run():
    coordinator = _coordinator([_zone()])
    coordinator._WeatherServiceClient.get_expected_rain_ahead = Mock(
        side_effect=RuntimeError("down")
    )

    await coordinator._apply_forecast_rain_credit()

    coordinator.store.async_update_zone.assert_not_awaited()


async def test_a_run_is_never_lengthened():
    coordinator = _coordinator([_zone(duration=300)], expected=1.0)

    await coordinator._apply_forecast_rain_credit()

    coordinator.store.async_update_zone.assert_not_awaited()
