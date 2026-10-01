"""Hour by hour for a zone whose ET is provided by the weather service (#878).

The provided-ET engine reads one daily total and spreads it evenly over the
elapsed time, so the bucket falls at a constant rate, night included. With the
hourly calculation on, Open-Meteo's own hourly ET0 is summed over the zone's
window instead, which follows the day.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    OpenMeteoClient,
)
from custom_components.smart_irrigation.weathermodules.SolarRadiationFallback import (
    SolarRadiationFallbackClient,
)

DAY = datetime.datetime(2026, 6, 21)
# ET of the hour ENDING at that hour, in mm: nothing at night, a peak at noon.
HOURLY_ET = {h: 0.0 for h in range(1, 25)}
HOURLY_ET.update({8: 0.1, 9: 0.2, 10: 0.3, 11: 0.4, 12: 0.5})


def _at(hour, minute=0):
    return DAY + datetime.timedelta(hours=hour, minutes=minute)


def _history():
    hours = range(24)
    return {
        "hourly": {
            "time": [int(_at(h).timestamp()) for h in hours],
            "et0_fao_evapotranspiration": [HOURLY_ET.get(h, 0.0) for h in hours],
        }
    }


def _client():
    return OpenMeteoClient(latitude=47.6, longitude=19.36)


def test_whole_hours_are_summed():
    with patch.object(OpenMeteoClient, "_request", return_value=_history()):
        assert _client().get_hourly_et0(_at(8), _at(11)) == pytest.approx(0.9)


def test_the_night_is_flat_and_the_day_is_not():
    with patch.object(OpenMeteoClient, "_request", return_value=_history()):
        client = _client()
        night = client.get_hourly_et0(_at(0), _at(6))
        noon = client.get_hourly_et0(_at(10), _at(12))
    assert night == pytest.approx(0.0)
    assert noon == pytest.approx(0.9)


def test_a_partial_hour_counts_for_its_share():
    """Half of the hour ending at 10:00 (0.3 mm) is 0.15 mm."""
    with patch.object(OpenMeteoClient, "_request", return_value=_history()):
        total = _client().get_hourly_et0(_at(9, 30), _at(10))
    assert total == pytest.approx(0.15)


def test_an_empty_window_is_zero():
    assert _client().get_hourly_et0(_at(9), _at(9)) == 0.0


def test_a_history_that_cannot_be_read_is_none():
    with patch.object(OpenMeteoClient, "_request", return_value=None):
        assert _client().get_hourly_et0(_at(6), _at(9)) is None


def test_the_fallback_wrapper_asks_open_meteo():
    wrapper = SolarRadiationFallbackClient(Mock(), 47.0, 19.0, 100)
    wrapper._fallback.get_hourly_et0 = Mock(return_value=1.5)
    assert wrapper.get_hourly_et0(_at(6), _at(9)) == 1.5
    wrapper._fallback.get_hourly_et0.assert_called_once_with(_at(6), _at(9))


def _coordinator(*, hourly=True, sourced=(), use_service=True, total=0.9):
    class _Coordinator(CalculationMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.hass.async_add_executor_job = AsyncMock(
        side_effect=lambda func, *args: func(*args)
    )
    coordinator.use_weather_service = use_service
    coordinator.store = MagicMock()
    coordinator.store.get_config.return_value = {const.CONF_HOURLY_CALCULATION: hourly}
    coordinator.store.get_mapping.return_value = {const.MAPPING_NAME: "Outside"}
    coordinator._sourced_fields = Mock(return_value=set(sourced))
    coordinator.zone_window_start = Mock(
        return_value=datetime.datetime.now() - datetime.timedelta(hours=3)
    )
    coordinator._WeatherServiceClient = Mock()
    coordinator._WeatherServiceClient.get_hourly_et0 = Mock(return_value=total)
    return coordinator


async def test_the_hourly_sum_is_used_for_a_service_provided_et():
    coordinator = _coordinator()

    result = await coordinator._hourly_service_et({const.ZONE_MAPPING: 0})

    assert result[0] == pytest.approx(0.9)
    assert result[1] == pytest.approx(3.0, abs=0.01)


@pytest.mark.parametrize(
    "kwargs",
    [
        {"hourly": False},
        {"sourced": (const.MAPPING_EVAPOTRANSPIRATION,)},
        {"use_service": False},
    ],
)
async def test_the_daily_figure_stays_when_hourly_does_not_apply(kwargs):
    coordinator = _coordinator(**kwargs)

    assert await coordinator._hourly_service_et({const.ZONE_MAPPING: 0}) is None
    coordinator._WeatherServiceClient.get_hourly_et0.assert_not_called()


async def test_a_history_that_failed_keeps_the_daily_figure():
    coordinator = _coordinator(total=None)

    assert await coordinator._hourly_service_et({const.ZONE_MAPPING: 0}) is None
