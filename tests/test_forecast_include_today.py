"""Regression tests for the forecast ``include_today`` window (#775).

``get_forecast_data`` used to always drop today's entry, so the precipitation
skip check summed *tomorrow + the day after* instead of *today + tomorrow* and
never saw rain forecast for the current day. The clients now parse from index 0
and only drop today on return when ``include_today`` is False (the default,
preserving the PyETO forecast semantics that start at tomorrow).

These exercise the return-slicing contract directly via the cached branch, so
they need no network mocking or full weather payloads.
"""

import datetime
import json

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.weathermodules import (
    PirateWeatherClient as pw_mod,
)
from custom_components.smart_irrigation.weathermodules.OWMClient import OWMClient
from custom_components.smart_irrigation.weathermodules.PirateWeatherClient import (
    PirateWeatherClient,
)

_DAYS = [{"i": 0}, {"i": 1}, {"i": 2}]


def _prime(client):
    """Populate the forecast cache and keep it fresh so the cached branch runs."""
    client._cached_forecast_data = list(_DAYS)
    client._forecast_called_at = datetime.datetime.now()


def test_owm_forecast_excludes_today_by_default() -> None:
    client = OWMClient("key", "3.0", 52.0, 5.0, 10, cache_seconds=3600)
    _prime(client)
    # Default: today (index 0) is dropped, so the list starts at tomorrow.
    assert client.get_forecast_data() == [{"i": 1}, {"i": 2}]


def test_owm_forecast_includes_today_when_requested() -> None:
    client = OWMClient("key", "3.0", 52.0, 5.0, 10, cache_seconds=3600)
    _prime(client)
    # include_today keeps today at index 0 so "today + tomorrow" can be summed.
    assert client.get_forecast_data(include_today=True) == _DAYS


def test_pirate_forecast_excludes_today_by_default() -> None:
    client = PirateWeatherClient("key", "1", 52.0, 5.0, 10, cache_seconds=3600)
    _prime(client)
    assert client.get_forecast_data() == [{"i": 1}, {"i": 2}]


def test_pirate_forecast_includes_today_when_requested() -> None:
    client = PirateWeatherClient("key", "1", 52.0, 5.0, 10, cache_seconds=3600)
    _prime(client)
    assert client.get_forecast_data(include_today=True) == _DAYS


def test_pirate_forecast_mean_temperature(monkeypatch) -> None:
    """Daily mean temp is (max + min) / 2, not max + min / 2 (#769)."""
    doc = {
        "daily": {
            "data": [
                {
                    "windSpeed": 1.0,
                    "pressure": 1000.0,
                    "humidity": 0.5,
                    "temperatureMax": 30.0,
                    "temperatureMin": 20.0,
                    "dewPoint": 10.0,
                    "precipAccumulation": 0.0,
                },
                {},  # dropped as the last day by range(0, len - 1)
            ]
        }
    }

    class _Resp:
        status_code = 200
        text = json.dumps(doc)

    monkeypatch.setattr(pw_mod.requests, "get", lambda *a, **k: _Resp())

    client = PirateWeatherClient("key", "1", 52.0, 5.0, 0)
    result = client.get_forecast_data(include_today=True)

    # 30 max / 20 min -> mean 25, not 30 + 20/2 = 40.
    assert result[0][const.MAPPING_TEMPERATURE] == pytest.approx(25.0)
