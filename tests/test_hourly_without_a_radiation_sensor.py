"""Hour by hour without a pyranometer, on the weather service's own history.

The hourly equation needs the sun of each hour. A sensor group with a
radiation sensor has it; one without used to fall back to the daily equation,
which estimates the day's sun from its temperature range. That estimate is
fair over a day and poor over an hour, so it is never summed hour by hour.

Open-Meteo publishes the radiation of every past hour, which is a measurement
of the hour rather than a guess at it, so a sensor group without a radiation
source calculates hourly from that history.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.hourly_rows import (
    build_hourly_rows,
    summed_hourly_eto,
)

LAT, LON = 47.0, -1.5
TZ_OFFSET = 2.0


def _reading(stamp, **fields):
    return {const.RETRIEVED_AT: stamp.isoformat(), **fields}


def _window(hours=3):
    """Readings covering a window of whole hours, without any radiation."""
    start = datetime.datetime(2026, 6, 21, 10, 0, 0)
    readings = []
    for hour in range(hours + 1):
        readings.append(
            _reading(
                start + datetime.timedelta(hours=hour),
                **{
                    const.MAPPING_TEMPERATURE: 22.0,
                    const.MAPPING_HUMIDITY: 50.0,
                    const.MAPPING_WINDSPEED: 2.0,
                },
            )
        )
    return readings, start, start + datetime.timedelta(hours=hours)


def _series(start, hours, mj_per_hour=2.0, offset_h=TZ_OFFSET):
    """The sun of each hour, keyed as Open-Meteo stamps it: UTC, hour start."""
    zone = datetime.timezone(datetime.timedelta(hours=offset_h))
    return {
        (start + datetime.timedelta(hours=hour))
        .replace(tzinfo=zone)
        .timestamp(): (mj_per_hour)
        for hour in range(hours)
    }


def test_without_a_radiation_source_and_without_a_series_there_are_no_rows():
    """The state before this: the caller keeps the daily equation."""
    readings, start, end = _window()

    rows = build_hourly_rows(readings, start, now=end, latitude=LAT, longitude=LON)

    assert rows is None


def test_the_series_supplies_the_sun_of_each_hour():
    readings, start, end = _window()

    rows = build_hourly_rows(
        readings,
        start,
        now=end,
        latitude=LAT,
        longitude=LON,
        tz_offset_h=TZ_OFFSET,
        solar_series=_series(start, 3, mj_per_hour=2.5),
    )

    assert rows is not None
    assert [row["solar_mj_h"] for row in rows] == [2.5, 2.5, 2.5]


def test_an_hour_the_series_does_not_cover_is_not_invented():
    """A gap in the history is a reason to keep the daily equation."""
    readings, start, end = _window()
    partial = _series(start, 2)

    rows = build_hourly_rows(
        readings,
        start,
        now=end,
        latitude=LAT,
        longitude=LON,
        tz_offset_h=TZ_OFFSET,
        solar_series=partial,
    )

    assert rows is None


def test_a_measured_sensor_still_wins_over_the_series():
    """A group with its own pyranometer reads its own sun, not the model's."""
    start = datetime.datetime(2026, 6, 21, 10, 0, 0)
    end = start + datetime.timedelta(hours=2)
    readings = [
        _reading(
            start + datetime.timedelta(hours=hour),
            **{
                const.MAPPING_TEMPERATURE: 22.0,
                const.MAPPING_HUMIDITY: 50.0,
                const.MAPPING_WINDSPEED: 2.0,
                # Buffered radiation is MJ/m2/day; 24 of them is 1 per hour.
                const.MAPPING_SOLRAD: 24.0,
            },
        )
        for hour in range(3)
    ]

    rows = build_hourly_rows(
        readings,
        start,
        now=end,
        latitude=LAT,
        longitude=LON,
        tz_offset_h=TZ_OFFSET,
        solar_series=_series(start, 2, mj_per_hour=99.0),
    )

    assert rows is not None
    assert all(row["solar_mj_h"] == pytest.approx(1.0) for row in rows)


def test_the_sum_is_the_same_as_a_sensor_reporting_the_same_sun():
    """The series is not a different physics, only a different source."""
    readings, start, end = _window()
    with_series = summed_hourly_eto(
        readings,
        start,
        now=end,
        latitude=LAT,
        longitude=LON,
        tz_offset_h=TZ_OFFSET,
        solar_series=_series(start, 3, mj_per_hour=2.0),
    )
    measured = [
        _reading(
            start + datetime.timedelta(hours=hour),
            **{
                const.MAPPING_TEMPERATURE: 22.0,
                const.MAPPING_HUMIDITY: 50.0,
                const.MAPPING_WINDSPEED: 2.0,
                const.MAPPING_SOLRAD: 2.0 * 24,  # MJ/m2/day of 2 MJ/m2/h
            },
        )
        for hour in range(4)
    ]
    with_sensor = summed_hourly_eto(
        measured,
        start,
        now=end,
        latitude=LAT,
        longitude=LON,
        tz_offset_h=TZ_OFFSET,
    )

    assert with_series is not None and with_sensor is not None
    assert with_series[0] == pytest.approx(with_sensor[0], rel=1e-9)
    assert with_series[1] == pytest.approx(with_sensor[1])


def _coordinator(*, service=const.CONF_WEATHER_SERVICE_OM, use_service=True):
    """A coordinator with only what the hourly entry point touches."""

    class _Coordinator(CalculationMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.hass.async_add_executor_job = AsyncMock(
        side_effect=lambda func, *args: func(*args)
    )
    coordinator.use_weather_service = use_service
    coordinator.weather_service = service
    coordinator._WeatherServiceClient = Mock()
    coordinator._WeatherServiceClient.get_hourly_radiation = Mock(
        return_value={1.0: 2.0}
    )
    return coordinator


async def test_the_history_is_asked_of_open_meteo():
    coordinator = _coordinator()
    mapping = {const.MAPPING_NAME: "Outside"}
    since = datetime.datetime(2026, 6, 21, 10, 0, 0)

    series = await coordinator._hourly_solar_series(mapping, since)

    assert series == {1.0: 2.0}
    asked_since, _asked_now = (
        coordinator._WeatherServiceClient.get_hourly_radiation.call_args[0]
    )
    assert asked_since == since


async def test_another_service_is_asked_too_through_its_fallback():
    """OpenWeatherMap and Pirate Weather publish no radiation at all, so their
    client is already wrapped in the Open-Meteo fallback that fills it."""
    coordinator = _coordinator(service=const.CONF_WEATHER_SERVICE_OWM)

    series = await coordinator._hourly_solar_series(
        {}, datetime.datetime(2026, 6, 21, 10, 0, 0)
    )

    assert series == {1.0: 2.0}


@pytest.mark.parametrize(
    ("kwargs", "mapping"),
    [
        # No weather service at all: sensors only.
        ({"use_service": False}, {}),
        # Under glass, no sky reading describes what the plants receive.
        ({}, {const.MAPPING_GREENHOUSE: True}),
    ],
)
async def test_the_history_is_not_asked_when_it_does_not_apply(kwargs, mapping):
    coordinator = _coordinator(**kwargs)

    series = await coordinator._hourly_solar_series(
        mapping, datetime.datetime(2026, 6, 21, 10, 0, 0)
    )

    assert series is None
    coordinator._WeatherServiceClient.get_hourly_radiation.assert_not_called()


async def test_a_client_that_does_not_keep_a_history_is_not_asked_twice():
    """A service with no history at all leaves the daily equation in place."""
    coordinator = _coordinator()
    coordinator._WeatherServiceClient = Mock(spec=[])

    series = await coordinator._hourly_solar_series(
        {}, datetime.datetime(2026, 6, 21, 10, 0, 0)
    )

    assert series is None


def test_the_fallback_wrapper_reads_the_radiation_from_open_meteo():
    """The wrapper's whole job: the field its primary does not have."""
    from custom_components.smart_irrigation.weathermodules.SolarRadiationFallback import (  # noqa: E501
        SolarRadiationFallbackClient,
    )

    wrapper = SolarRadiationFallbackClient.__new__(SolarRadiationFallbackClient)
    wrapper._primary = Mock(spec=["get_data"])
    wrapper._fallback = Mock()
    wrapper._fallback.get_hourly_radiation = Mock(return_value={1.0: 2.0})
    start = datetime.datetime(2026, 6, 21, 10, 0, 0)
    end = datetime.datetime(2026, 6, 21, 13, 0, 0)

    assert wrapper.get_hourly_radiation(start, end) == {1.0: 2.0}
    wrapper._fallback.get_hourly_radiation.assert_called_once_with(start, end)


def test_the_fallback_wrapper_leaves_the_rain_to_the_service_the_user_chose():
    """Rain is a field the primary reports; reading it elsewhere would mix two
    services' idea of the same sky."""
    from custom_components.smart_irrigation.weathermodules.SolarRadiationFallback import (  # noqa: E501
        SolarRadiationFallbackClient,
    )

    wrapper = SolarRadiationFallbackClient.__new__(SolarRadiationFallbackClient)
    wrapper._primary = Mock(spec=["get_data"])  # no history
    wrapper._fallback = Mock()

    assert wrapper.get_precipitation_between(1, 2) is None
    wrapper._fallback.get_precipitation_between.assert_not_called()


async def test_a_history_that_cannot_be_read_keeps_the_daily_equation():
    coordinator = _coordinator()
    coordinator._WeatherServiceClient.get_hourly_radiation = Mock(return_value=None)

    series = await coordinator._hourly_solar_series(
        {}, datetime.datetime(2026, 6, 21, 10, 0, 0)
    )

    assert series is None


async def test_a_group_without_radiation_reaches_the_series_and_one_with_does_not():
    """The switch at the top of the hourly path, both ways."""
    readings, start, end = _window()
    coordinator = _coordinator()
    coordinator.store = MagicMock()
    coordinator.store.get_config = Mock(
        return_value={const.CONF_HOURLY_CALCULATION: True}
    )
    coordinator.store.get_mapping = Mock(
        return_value={
            const.MAPPING_ID: 1,
            const.MAPPING_NAME: "Outside",
            const.MAPPING_DATA: readings,
            const.MAPPING_MAPPINGS: {
                const.MAPPING_TEMPERATURE: {
                    const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_WEATHER_SERVICE
                },
            },
        }
    )
    coordinator._effective_latitude = LAT
    coordinator._effective_longitude = LON
    coordinator._effective_elevation = 10.0
    coordinator._WeatherServiceClient.get_hourly_radiation = Mock(
        return_value=_series(start, 3)
    )
    zone = {const.ZONE_ID: 1, const.ZONE_MAPPING: 1, const.ZONE_LAST_CONSUMED_AT: start}
    modinst = Mock(forecast_days=0)

    with patch("custom_components.smart_irrigation.calculation.datetime") as clock:
        clock.now = Mock(return_value=end)
        result = await coordinator._hourly_reference_et(zone, modinst)

    coordinator._WeatherServiceClient.get_hourly_radiation.assert_called_once()
    assert result is not None
    assert result[0] > 0
