"""A group fed by Open-Meteo is priced on Open-Meteo's own hourly history (#879).

Smart Irrigation polls the weather service about once an hour and takes the
current values, which then stand in for the hour around them. Open-Meteo's own
hourly figures are means over the hour. Priced on them, the equation follows
Open-Meteo's evapotranspiration to within three percent; priced on the
polled readings it was several percent short on a day when the sun moves fast.

The day below is 2 October at 51.5 N, as Open-Meteo published it: 1.86 mm
summed over its own hours, and 1.88 for the day.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.hourly_rows import (
    history_rows,
    summed_hourly_eto_from_history,
)
from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    WIND_10M_TO_2M,
    OpenMeteoClient,
)

LAT, LON, ELEV = 51.538, 5.481, 13.0
UTC = datetime.timezone.utc
# Open-Meteo's UTC stamps for 2 October 2026, local time being UTC+2.
MIDNIGHT_LOCAL = datetime.datetime(2026, 10, 1, 22, 0, tzinfo=UTC)

# Hours 00:00 to 24:00 local, stamped as Open-Meteo stamps them.
TEMPERATURE = [
    11.9,
    11.1,
    10.8,
    11.0,
    10.9,
    10.2,
    9.6,
    9.7,
    9.8,
    12.2,
    14.2,
    15.8,
    17.2,
    18.1,
    19.3,
    19.7,
    19.7,
    19.9,
    19.4,
    17.2,
    14.2,
    12.1,
    10.6,
    9.3,
    8.9,
]
HUMIDITY = [
    96,
    96,
    97,
    98,
    96,
    95,
    98,
    97,
    96,
    95,
    87,
    81,
    78,
    70,
    63,
    56,
    53,
    52,
    60,
    65,
    76,
    79,
    86,
    90,
    91,
]
WIND_KMH = [
    3.6,
    8.6,
    1.4,
    6.5,
    7.2,
    7.2,
    4.7,
    6.8,
    5.8,
    7.2,
    6.5,
    5.4,
    6.8,
    6.8,
    7.9,
    4.7,
    2.9,
    2.5,
    1.8,
    6.1,
    2.2,
    1.4,
    3.6,
    1.8,
    2.0,
]
SUN_W = [
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    2.0,
    56.0,
    185.0,
    322.0,
    403.0,
    385.0,
    502.0,
    507.0,
    452.0,
    329.0,
    180.0,
    65.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
]
# Open-Meteo's own hourly ET0, stamped at the end of the hour it covers.
OM_ET0 = [
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.02,
    0.08,
    0.16,
    0.21,
    0.22,
    0.29,
    0.30,
    0.26,
    0.19,
    0.09,
    0.04,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
]


def _stamp(hour):
    return int((MIDNIGHT_LOCAL + datetime.timedelta(hours=hour)).timestamp())


def _doc(**overrides):
    n = len(TEMPERATURE)
    hourly = {
        "time": [_stamp(h) for h in range(n)],
        "temperature_2m": list(TEMPERATURE),
        "relative_humidity_2m": [float(v) for v in HUMIDITY],
        "wind_speed_10m": [v / 3.6 for v in WIND_KMH],
        "shortwave_radiation": list(SUN_W),
        "surface_pressure": [1029.0] * n,
    }
    hourly.update(overrides)
    return {"hourly": hourly}


def _local(hour, minute=0):
    """A naive local moment on 2 October (local being UTC+2 here)."""
    return datetime.datetime(2026, 10, 2) + datetime.timedelta(
        hours=hour, minutes=minute
    )


class _Utc2(datetime.tzinfo):
    def utcoffset(self, dt):
        return datetime.timedelta(hours=2)

    def dst(self, dt):
        return datetime.timedelta(0)

    def tzname(self, dt):
        return "UTC+2"


def _client():
    return OpenMeteoClient(latitude=LAT, longitude=LON)


# --- the client


def _entries(start_hour=0, end_hour=24):
    # start/end must be read in the machine's zone by the client, so build them
    # from the UTC instants the way the coordinator's naive local moments would be.
    start = datetime.datetime.fromtimestamp(_stamp(start_hour))
    end = datetime.datetime.fromtimestamp(_stamp(end_hour))
    with patch.object(OpenMeteoClient, "_request", return_value=_doc()):
        return _client().get_hourly_history(start, end)


def test_an_hour_takes_the_mean_of_the_instants_at_its_two_ends():
    entries = _entries(10, 12)

    first = entries[0]
    assert first["ts"] == _stamp(10)
    assert first["temperature"] == pytest.approx(
        (TEMPERATURE[10] + TEMPERATURE[11]) / 2
    )
    assert first["humidity"] == pytest.approx((HUMIDITY[10] + HUMIDITY[11]) / 2)
    assert first["wind"] == pytest.approx(
        (WIND_KMH[10] + WIND_KMH[11]) / 2 / 3.6 * WIND_10M_TO_2M
    )
    assert first["pressure_hpa"] == pytest.approx(1029.0)


def test_the_sun_of_an_hour_is_the_value_stamped_at_its_end():
    """The radiation stamped 11:00 is the mean of 10:00 to 11:00."""
    entries = _entries(10, 12)

    assert entries[0]["solar_mj_h"] == pytest.approx(SUN_W[11] * 0.0036)
    assert entries[1]["solar_mj_h"] == pytest.approx(SUN_W[12] * 0.0036)


def test_only_the_hours_of_the_window_are_returned():
    entries = _entries(10, 13)

    assert [e["ts"] for e in entries] == [_stamp(10), _stamp(11), _stamp(12)]


def test_a_window_inside_an_hour_returns_that_hour():
    start = datetime.datetime.fromtimestamp(_stamp(10) + 600)
    end = datetime.datetime.fromtimestamp(_stamp(10) + 1800)
    with patch.object(OpenMeteoClient, "_request", return_value=_doc()):
        entries = _client().get_hourly_history(start, end)

    assert [e["ts"] for e in entries] == [_stamp(10)]


def test_an_empty_window_asks_nothing():
    moment = datetime.datetime.fromtimestamp(_stamp(10))
    with patch.object(OpenMeteoClient, "_request") as request:
        assert _client().get_hourly_history(moment, moment) == []
    request.assert_not_called()


def test_a_hole_in_a_field_the_equation_needs_is_no_history():
    doc = _doc()
    doc["hourly"]["wind_speed_10m"][11] = None
    start = datetime.datetime.fromtimestamp(_stamp(10))
    end = datetime.datetime.fromtimestamp(_stamp(13))
    with patch.object(OpenMeteoClient, "_request", return_value=doc):
        assert _client().get_hourly_history(start, end) is None


def test_a_failed_request_is_no_history():
    start = datetime.datetime.fromtimestamp(_stamp(10))
    end = datetime.datetime.fromtimestamp(_stamp(13))
    with patch.object(OpenMeteoClient, "_request", return_value=None):
        assert _client().get_hourly_history(start, end) is None


def test_the_history_is_fetched_once_for_the_zones_that_share_it():
    start = datetime.datetime.fromtimestamp(_stamp(10))
    end = datetime.datetime.fromtimestamp(_stamp(13))
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_doc()) as request:
        client.get_hourly_history(start, end)
        client.get_hourly_history(start, end)

    assert request.call_count == 1


# --- the rows


def test_a_window_that_opens_and_closes_inside_hours_charges_their_share():
    entries = _entries(9, 15)
    rows = history_rows(entries, _local(10, 30), _local(12, 15), tz=_Utc2())

    assert [round(r["coverage_h"], 2) for r in rows] == [0.5, 1.0, 0.25]


def test_no_hour_in_the_window_is_no_rows():
    entries = _entries(9, 15)

    assert history_rows(entries, _local(20), _local(21), tz=_Utc2()) is None
    assert history_rows([], _local(10), _local(12), tz=_Utc2()) is None


def test_a_malformed_entry_is_no_rows():
    assert history_rows([{"ts": "soon"}], _local(10), _local(12), tz=_Utc2()) is None


# --- the sum


def test_the_day_is_within_three_percent_of_open_meteos_own():
    entries = _entries(0, 24)

    total, hours = summed_hourly_eto_from_history(
        entries,
        _local(0),
        _local(24),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=_Utc2(),
    )

    assert hours == pytest.approx(24.0)
    assert sum(OM_ET0) == pytest.approx(1.86)
    assert abs(total / sum(OM_ET0) - 1.0) < 0.03


def test_the_hours_of_the_day_follow_open_meteos_not_an_hour_late():
    entries = _entries(0, 24)
    rows = history_rows(entries, _local(0), _local(24), tz=_Utc2())
    from custom_components.smart_irrigation.hourly_rows import price_hourly_rows

    priced = price_hourly_rows(rows, LAT, LON, ELEV)

    # Open-Meteo stamps the hour's end; ours is keyed by its start.
    for hour in (11, 12, 14, 15):
        assert priced[hour] == pytest.approx(OM_ET0[hour + 1], abs=0.012)


def test_a_night_is_worth_nothing():
    entries = _entries(0, 24)

    total, _hours = summed_hourly_eto_from_history(
        entries,
        _local(0),
        _local(6),
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=_Utc2(),
    )

    assert total == 0.0


def test_without_a_position_nothing_is_priced():
    entries = _entries(0, 24)

    assert summed_hourly_eto_from_history(entries, _local(0), _local(24)) is None


# --- when the coordinator uses it


def _coordinator(
    *, service=const.CONF_WEATHER_SERVICE_OM, sources=(True, False, False)
):
    class _Coordinator(CalculationMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.hass.async_add_executor_job = AsyncMock(
        side_effect=lambda func, *args: func(*args)
    )
    coordinator.use_weather_service = True
    coordinator.weather_service = service
    coordinator.check_mapping_sources = Mock(return_value=sources)
    coordinator._effective_latitude = LAT
    coordinator._effective_longitude = LON
    coordinator._effective_elevation = ELEV
    coordinator._WeatherServiceClient = Mock()
    start = datetime.datetime.fromtimestamp(_stamp(0))
    end = datetime.datetime.fromtimestamp(_stamp(24))
    coordinator._WeatherServiceClient.get_hourly_history = Mock(
        return_value=_entries(0, 24)
    )
    return coordinator, start, end


ZONE = {const.ZONE_ID: 0, const.ZONE_MAPPING: 1}


async def test_a_group_fed_only_by_open_meteo_is_priced_on_its_history():
    coordinator, start, _end = _coordinator()

    result = await coordinator._open_meteo_history_total(
        ZONE, {const.MAPPING_NAME: "g"}, start
    )

    assert result is not None
    coordinator._WeatherServiceClient.get_hourly_history.assert_called_once()


@pytest.mark.parametrize(
    "kwargs",
    [
        {"service": const.CONF_WEATHER_SERVICE_OWM},
        {"sources": (True, True, False)},
        {"sources": (True, False, True)},
        {"sources": (False, True, False)},
    ],
)
async def test_another_service_or_a_sensor_or_a_static_value_keeps_the_readings(kwargs):
    coordinator, start, _end = _coordinator(**kwargs)

    assert (
        await coordinator._open_meteo_history_total(
            ZONE, {const.MAPPING_NAME: "g"}, start
        )
        is None
    )


async def test_a_greenhouse_keeps_the_readings():
    coordinator, start, _end = _coordinator()

    assert (
        await coordinator._open_meteo_history_total(
            ZONE, {const.MAPPING_GREENHOUSE: True}, start
        )
        is None
    )


async def test_no_history_keeps_the_readings():
    coordinator, start, _end = _coordinator()
    coordinator._WeatherServiceClient.get_hourly_history = Mock(return_value=None)

    assert (
        await coordinator._open_meteo_history_total(
            ZONE, {const.MAPPING_NAME: "g"}, start
        )
        is None
    )


async def test_a_failing_history_never_breaks_the_calculation():
    coordinator, start, _end = _coordinator()
    coordinator._WeatherServiceClient.get_hourly_history = Mock(
        side_effect=RuntimeError("down")
    )

    assert (
        await coordinator._open_meteo_history_total(
            ZONE, {const.MAPPING_NAME: "g"}, start
        )
        is None
    )
