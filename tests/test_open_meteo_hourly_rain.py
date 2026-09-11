"""Open-Meteo rain is read from its hourly history, not sampled (#835).

Open-Meteo's ``current.precipitation`` is the rain of the last 15 minutes: the
"current" block is built from 15-minutely data and says so in its ``interval``.
Integrated as if it were the rain of the last hour, it credited the bucket about
a quarter of what fell. The hourly precipitation history holds the rain of every
hour instead, so the calculation reads the hours of its own interval from it,
and the sampled value is scaled to the mm/h rate it is labelled as, for the
panel and for the fallback when the history cannot be read.
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import requests

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    OpenMeteoClient,
    current_precipitation_rate,
)

DAY = datetime(2026, 9, 11)
# The rain of the hour ending at that hour, in mm (Open-Meteo, 2026-09-11).
HOURLY_RAIN = {5: 0.3, 9: 0.8, 10: 3.9, 11: 1.5, 12: 0.2}


def _at(hour, minute=0):
    return DAY + timedelta(hours=hour, minutes=minute)


def _history():
    hours = range(25)
    return {
        "hourly": {
            "time": [int(_at(h).timestamp()) for h in hours],
            "precipitation": [
                None if h == 3 else HOURLY_RAIN.get(h, 0.0) for h in hours
            ],
        }
    }


def _client():
    return OpenMeteoClient(latitude=47.6, longitude=19.36)


# --- the sampled value is a rate -------------------------------------------


def test_the_15_minute_amount_is_scaled_to_an_hourly_rate():
    assert current_precipitation_rate(
        {"precipitation": 1.0, "interval": 900}
    ) == pytest.approx(4.0)


def test_a_missing_interval_is_taken_as_15_minutes():
    assert current_precipitation_rate({"precipitation": 0.1}) == pytest.approx(0.4)


def test_no_precipitation_is_a_rate_of_zero():
    assert current_precipitation_rate({"precipitation": None, "interval": 900}) == 0


# --- the hourly history -----------------------------------------------------


def test_the_hours_ending_inside_the_window_are_summed():
    """00:00 to 11:15 holds the hours ending 01:00 to 11:00: 6.5 mm."""
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()):
        assert client.get_precipitation_between(_at(0), _at(11, 15)) == pytest.approx(
            6.5
        )


def test_consecutive_windows_count_every_hour_exactly_once():
    """An hour ending on a boundary belongs to the window it ends, not the next."""
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()):
        first = client.get_precipitation_between(_at(0), _at(10))
        second = client.get_precipitation_between(_at(10), _at(13))
        whole = client.get_precipitation_between(_at(0), _at(13))

    assert first == pytest.approx(5.0)
    assert second == pytest.approx(1.7)
    assert first + second == pytest.approx(whole)


def test_the_hour_still_under_way_is_left_to_the_next_window():
    """At 11:59 the hour ending 12:00 has not finished."""
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()):
        assert client.get_precipitation_between(_at(11), _at(11, 59)) == 0


def test_an_empty_window_asks_nothing():
    client = _client()
    with patch.object(OpenMeteoClient, "_request") as request:
        assert client.get_precipitation_between(_at(5), _at(5)) == 0.0
    request.assert_not_called()


@pytest.mark.parametrize(
    "request_kwargs",
    [
        {"return_value": None},
        {"return_value": {"no": "hourly"}},
        {"side_effect": requests.ConnectionError("offline")},
    ],
)
def test_an_unreadable_history_is_none_not_zero(request_kwargs):
    """None lets the calculation fall back instead of crediting no rain."""
    client = _client()
    with patch.object(OpenMeteoClient, "_request", **request_kwargs):
        assert client.get_precipitation_between(_at(0), _at(12)) is None


def test_the_history_is_reused_for_windows_it_covers():
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()) as request:
        client.get_precipitation_between(_at(6), _at(12))
        client.get_precipitation_between(_at(8), _at(12))
        assert request.call_count == 1
        # A window starting before the fetched history needs a new fetch.
        client.get_precipitation_between(_at(-3), _at(12))
        assert request.call_count == 2


def test_the_history_is_asked_in_utc_unix_time():
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()) as request:
        client.get_precipitation_between(_at(0), _at(12))

    params = request.call_args.args[0]
    assert params["hourly"] == "precipitation"
    assert params["timeformat"] == "unixtime"
    assert params["timezone"] == "GMT"
    assert params["past_days"] >= 1


# --- the calculation ----------------------------------------------------------


class _Coordinator(CalculationMixin):
    def __init__(
        self, mapping, weather_service=const.CONF_WEATHER_SERVICE_OM, rain=6.5
    ):
        self.store = MagicMock()
        self.store.async_update_mapping = AsyncMock()
        self.store.get_mapping = MagicMock(return_value=mapping)
        self.use_weather_service = True
        self.weather_service = weather_service
        self._WeatherServiceClient = MagicMock()
        self._WeatherServiceClient.get_precipitation_between = MagicMock(
            return_value=rain
        )
        self.hass = MagicMock()
        self.hass.async_add_executor_job = AsyncMock(
            side_effect=lambda func, *args: func(*args)
        )

    @property
    def fetch(self):
        return self._WeatherServiceClient.get_precipitation_between


ZONE = {const.ZONE_ID: 0, const.ZONE_MAPPING: 1}
MIDNIGHT = _at(0)


def _mapping(
    source=const.MAPPING_CONF_SOURCE_WEATHER_SERVICE,
    last_calc=MIDNIGHT,
    greenhouse=False,
):
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_NAME: "Garden",
        const.MAPPING_GREENHOUSE: greenhouse,
        const.MAPPING_MAPPINGS: {
            const.MAPPING_CURRENT_PRECIPITATION: {const.MAPPING_CONF_SOURCE: source}
        },
        # Sampled 15-minute amounts scaled to mm/h: a far smaller figure.
        const.MAPPING_DATA: [
            {
                const.RETRIEVED_AT: _at(h, 23).isoformat(),
                const.MAPPING_CURRENT_PRECIPITATION: 0.4,
            }
            for h in range(1, 12)
        ],
        const.MAPPING_DATA_LAST_CALCULATION: (
            {const.MAPPING_TIMESTAMP: last_calc.isoformat()} if last_calc else {}
        ),
    }


@pytest.mark.asyncio
async def test_open_meteo_rain_comes_from_the_history_of_the_interval():
    mapping = _mapping()
    coordinator = _Coordinator(mapping)

    weatherdata = await coordinator.apply_aggregates_to_mapping_data(
        mapping, persist=False
    )

    assert weatherdata[const.MAPPING_WEATHER_SERVICE_RAIN] == 6.5
    start, end = coordinator.fetch.call_args.args
    assert start == _at(0)
    assert end > start
    assert coordinator._precipitation_for_interval(ZONE, weatherdata) == 6.5


@pytest.mark.asyncio
async def test_a_group_never_calculated_starts_at_its_earliest_reading():
    mapping = _mapping(last_calc=None)
    coordinator = _Coordinator(mapping)

    await coordinator.apply_aggregates_to_mapping_data(mapping, persist=False)

    start, _ = coordinator.fetch.call_args.args
    assert start == _at(1, 23)


@pytest.mark.asyncio
async def test_a_persisting_aggregation_reads_the_window_before_moving_it():
    """The marker it records must not become the start of its own window."""
    mapping = _mapping()
    coordinator = _Coordinator(mapping)

    await coordinator.apply_aggregates_to_mapping_data(mapping, persist=True)

    start, end = coordinator.fetch.call_args.args
    assert start == _at(0)
    stored = coordinator.store.async_update_mapping.call_args.args[1]
    new_marker = stored[const.MAPPING_DATA_LAST_CALCULATION][const.MAPPING_TIMESTAMP]
    assert end <= new_marker


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("mapping", "weather_service"),
    [
        (
            _mapping(source=const.MAPPING_CONF_SOURCE_SENSOR),
            const.CONF_WEATHER_SERVICE_OM,
        ),
        (_mapping(), const.CONF_WEATHER_SERVICE_OWM),
        (_mapping(), const.CONF_WEATHER_SERVICE_PW),
        (_mapping(greenhouse=True), const.CONF_WEATHER_SERVICE_OM),
    ],
    ids=["rain-sensor", "openweathermap", "pirate-weather", "greenhouse"],
)
async def test_the_history_is_only_asked_where_it_applies(mapping, weather_service):
    coordinator = _Coordinator(mapping, weather_service=weather_service)

    weatherdata = await coordinator.apply_aggregates_to_mapping_data(
        mapping, persist=False
    )

    coordinator.fetch.assert_not_called()
    assert const.MAPPING_WEATHER_SERVICE_RAIN not in weatherdata


@pytest.mark.asyncio
async def test_an_unreadable_history_falls_back_to_the_sampled_rate():
    mapping = _mapping()
    coordinator = _Coordinator(mapping, rain=None)

    weatherdata = await coordinator.apply_aggregates_to_mapping_data(
        mapping, persist=False
    )

    assert const.MAPPING_WEATHER_SERVICE_RAIN not in weatherdata
    assert coordinator._precipitation_for_interval(ZONE, weatherdata) > 0


def test_a_rain_gauge_of_your_own_still_wins_over_the_history():
    coordinator = _Coordinator(_mapping())
    weatherdata = {
        const.MAPPING_PRECIPITATION: 2.7,
        const.MAPPING_WEATHER_SERVICE_RAIN: 6.5,
        const.MAPPING_CURRENT_PRECIPITATION: 0.4,
        const.MAPPING_DATA_MULTIPLIER: 0.5,
    }

    assert coordinator._precipitation_for_interval(ZONE, weatherdata) == 2.7


def test_the_history_wins_over_the_sampled_rate():
    coordinator = _Coordinator(_mapping())
    weatherdata = {
        const.MAPPING_WEATHER_SERVICE_RAIN: 0.0,
        const.MAPPING_CURRENT_PRECIPITATION: 0.4,
        const.MAPPING_DATA_MULTIPLIER: 0.5,
    }

    assert coordinator._precipitation_for_interval(ZONE, weatherdata) == 0.0


def test_open_meteo_does_not_warn_about_the_update_interval(caplog):
    """Its history covers every hour, whatever the collection schedule."""
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.use_weather_service = True
    coordinator.weather_service = const.CONF_WEATHER_SERVICE_OM

    coordinator._warn_if_update_interval_undersamples_rain(
        {
            const.CONF_AUTO_UPDATE_ENABLED: True,
            const.CONF_AUTO_UPDATE_SCHEDULE: const.CONF_AUTO_UPDATE_DAILY,
            const.CONF_AUTO_UPDATE_INTERVAL: "1",
        }
    )

    assert "not counted" not in caplog.text
