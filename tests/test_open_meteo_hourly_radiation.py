"""Open-Meteo's hourly radiation history, the sun the hourly equation needs.

The equation wants each hour's own sun in MJ/m2. Open-Meteo publishes it as a
mean irradiance in W/m2 stamped at the hour it starts, so the client converts
and keys it the way the row builder asks.
"""

from datetime import datetime, timedelta
from unittest.mock import patch

import pytest
import requests

from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    OpenMeteoClient,
)

DAY = datetime(2026, 6, 21)
# Mean irradiance of the hour starting at that hour, in W/m2.
HOURLY_SUN = {6: 120.0, 7: 260.0, 8: 410.0, 9: 560.0, 10: 700.0}


def _at(hour, minute=0):
    return DAY + timedelta(hours=hour, minutes=minute)


def _history(missing=()):
    hours = range(24)
    return {
        "hourly": {
            "time": [int(_at(h).timestamp()) for h in hours],
            "shortwave_radiation": [
                None if h in missing else HOURLY_SUN.get(h, 0.0) for h in hours
            ],
        }
    }


def _client():
    return OpenMeteoClient(latitude=47.6, longitude=19.36)


def test_watts_become_the_hour_s_megajoules():
    """1 W/m2 held for an hour is 0.0036 MJ/m2."""
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()):
        series = client.get_hourly_radiation(_at(6), _at(9))

    assert series[_at(6).timestamp()] == pytest.approx(120.0 * 0.0036)
    assert series[_at(8).timestamp()] == pytest.approx(410.0 * 0.0036)


def test_the_hours_of_the_window_are_the_ones_returned():
    """Including the hour the window starts inside, which has sun in it."""
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()):
        series = client.get_hourly_radiation(_at(7, 30), _at(10))

    assert sorted(series) == [
        _at(7).timestamp(),
        _at(8).timestamp(),
        _at(9).timestamp(),
    ]


def test_a_missing_hour_reads_as_no_sun_rather_than_breaking_the_series():
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history(missing=(8,))):
        series = client.get_hourly_radiation(_at(6), _at(10))

    assert series[_at(8).timestamp()] == 0.0


def test_an_empty_window_asks_nothing():
    client = _client()
    with patch.object(OpenMeteoClient, "_request") as request:
        assert client.get_hourly_radiation(_at(9), _at(9)) == {}
    request.assert_not_called()


def test_a_failed_request_is_none_so_the_caller_keeps_the_daily_equation():
    client = _client()
    with patch.object(
        OpenMeteoClient, "_request", side_effect=requests.RequestException("down")
    ):
        assert client.get_hourly_radiation(_at(6), _at(9)) is None


def test_a_document_without_the_field_is_none_too():
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value={"hourly": {}}):
        assert client.get_hourly_radiation(_at(6), _at(9)) is None


def test_something_that_is_not_a_moment_is_none():
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()):
        assert client.get_hourly_radiation("yesterday", _at(9)) is None


def test_the_history_is_fetched_once_for_the_zones_that_share_it():
    """Every zone calculates within moments, and the estimate asks again."""
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()) as request:
        client.get_hourly_radiation(_at(6), _at(9))
        client.get_hourly_radiation(_at(6), _at(9))
        client.get_hourly_radiation(_at(7), _at(9))

    assert request.call_count == 1


def test_a_window_starting_earlier_than_the_cache_covers_is_fetched_again():
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()) as request:
        client.get_hourly_radiation(_at(12), _at(13))
        # The day before, which the cached series does not reach back to.
        client.get_hourly_radiation(_at(-5), _at(13))

    assert request.call_count == 2


def test_the_radiation_history_is_asked_for_on_its_own():
    """One field, so the past days it needs are not paid for the whole set."""
    client = _client()
    with patch.object(OpenMeteoClient, "_request", return_value=_history()) as request:
        client.get_hourly_radiation(_at(6), _at(9))

    params = request.call_args[0][0]
    assert params["hourly"] == "shortwave_radiation"
    assert params["timeformat"] == "unixtime"
    assert params["timezone"] == "GMT"
