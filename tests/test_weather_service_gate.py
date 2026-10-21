"""OpenWeatherMap and Pirate Weather ask their API once, and leave it alone after a refusal.

The client of a service is shared by the poll, the skip conditions and the
panel, often from several threads at once. Each caller found the cache stale
and asked for itself: a dozen identical requests for one update. A refusal was
asked again straight away by the next caller (three times in a row by Pirate
Weather alone), which keeps a rate limit going. And the poll's get_data, every
interval, stamped the time the forecast was checked against, so the forecast
was never asked again and stayed the one of the first fetch.

Open-Meteo has had a gate since #911; these pin the same rules on the other two.
"""

import datetime
import json
import threading
import time

import pytest

from custom_components.smart_irrigation.weathermodules import OWMClient as owm_mod
from custom_components.smart_irrigation.weathermodules import (
    PirateWeatherClient as pw_mod,
)
from custom_components.smart_irrigation.weathermodules import gate as gate_mod
from custom_components.smart_irrigation.weathermodules.OWMClient import OWMClient
from custom_components.smart_irrigation.weathermodules.PirateWeatherClient import (
    PirateWeatherClient,
)

NOON = 1791115200


def _owm_doc(rain=0.0):
    return {
        "timezone_offset": 7200,
        "daily": [
            {
                "dt": NOON + i * 86400,
                "wind_speed": 3.0,
                "pressure": 1015,
                "humidity": 60,
                "temp": {"day": 20.0, "min": 12.0, "max": 24.0},
                "dew_point": 10.0,
                "rain": rain,
            }
            for i in range(4)
        ],
    }


def _pw_doc(rain=0.0):
    start = 1791064800
    return {
        "timezone": "Europe/Paris",
        "offset": 2,
        "daily": {
            "data": [
                {
                    "time": start + i * 86400,
                    "windSpeed": 3.0,
                    "pressure": 1015.0,
                    "humidity": 0.6,
                    "temperatureMax": 24.0,
                    "temperatureMin": 12.0,
                    "dewPoint": 10.0,
                    "precipAccumulation": rain,
                }
                for i in range(4)
            ]
        },
    }


class _Resp:
    def __init__(self, doc, status=200, retry_after=None):
        self.status_code = status
        self.text = json.dumps(doc)
        self.headers = {"Retry-After": str(retry_after)} if retry_after else {}


class _Api:
    """A fake API: counts requests, answers what it is told to, slowly."""

    def __init__(self, doc):
        self.doc = doc
        self.status = 200
        self.retry_after = None
        self.calls = 0
        self._lock = threading.Lock()

    def get(self, *args, **kwargs):
        with self._lock:
            self.calls += 1
        time.sleep(0.02)  # long enough for the other threads to pile up
        return _Resp(self.doc, self.status, self.retry_after)


CLIENTS = [
    pytest.param(
        owm_mod,
        lambda: OWMClient("key", "3.0", 48.8, 2.3, 35, cache_seconds=600),
        _owm_doc,
        id="openweathermap",
    ),
    pytest.param(
        pw_mod,
        lambda: PirateWeatherClient("key", "1", 48.8, 2.3, 35, cache_seconds=600),
        _pw_doc,
        id="pirate-weather",
    ),
]


@pytest.mark.parametrize(("module", "make", "doc"), CLIENTS)
def test_callers_at_the_same_time_cost_one_request(monkeypatch, module, make, doc):
    api = _Api(doc())
    monkeypatch.setattr(module.requests, "get", api.get)
    client = make()

    results = []
    threads = [
        threading.Thread(target=lambda: results.append(client.get_forecast_data()))
        for _ in range(8)
    ]
    for thread in threads:
        thread.start()
    for thread in threads:
        thread.join()

    assert api.calls == 1
    assert all(result for result in results)


@pytest.mark.parametrize(("module", "make", "doc"), CLIENTS)
def test_a_rate_limit_is_not_asked_again_until_its_pause_is_over(
    monkeypatch, module, make, doc
):
    api = _Api(doc())
    api.status = 429
    api.retry_after = 120
    monkeypatch.setattr(module.requests, "get", api.get)
    client = make()

    for _ in range(3):
        assert client.get_forecast_data() is None

    # Once, not three times per caller, and not again while the pause lasts.
    assert api.calls == 1

    # The pause is the one the service asked for.
    clock = [time.monotonic()]
    monkeypatch.setattr(gate_mod.time, "monotonic", lambda: clock[0])
    api.status = 200
    clock[0] += 119
    assert client.get_forecast_data() is None
    assert api.calls == 1
    clock[0] += 2
    assert client.get_forecast_data()
    assert api.calls == 2


@pytest.mark.parametrize(("module", "make", "doc"), CLIENTS)
def test_the_poll_does_not_keep_the_forecast_from_being_asked_again(
    monkeypatch, module, make, doc
):
    """The forecast has its own time: the poll used to refresh the one it was
    checked against, every interval, so it never expired."""
    api = _Api(doc(rain=0.0))
    monkeypatch.setattr(module.requests, "get", api.get)
    client = make()
    first = client.get_forecast_data()

    # An interval later the poll has just run; the forecast is an interval old.
    client._forecast_called_at -= datetime.timedelta(hours=2)
    client._data_called_at = datetime.datetime.now()
    client._gate._recent.clear()
    api.doc = doc(rain=3.0)

    second = client.get_forecast_data()

    assert second != first
    assert api.calls == 2


def test_openweathermap_still_reports_a_refused_key_as_an_error(monkeypatch):
    """The key check turns that error into "invalid key"."""
    api = _Api({"cod": 401, "message": "Invalid API key"})
    api.status = 401
    monkeypatch.setattr(owm_mod.requests, "get", api.get)
    client = OWMClient("bad", "3.0", 48.8, 2.3, 35)

    with pytest.raises(OSError):
        client.get_data()
    # Asked again during the pause: still an error, and nothing asked.
    with pytest.raises(OSError):
        client.get_data()
    assert api.calls == 1


def test_a_failure_is_logged_once_and_its_end_once(monkeypatch, caplog):
    api = _Api(_pw_doc())
    api.status = 503
    monkeypatch.setattr(pw_mod.requests, "get", api.get)
    clock = [time.monotonic()]
    monkeypatch.setattr(gate_mod.time, "monotonic", lambda: clock[0])
    client = PirateWeatherClient("key", "1", 48.8, 2.3, 35, cache_seconds=600)

    with caplog.at_level("INFO", logger=gate_mod.__name__):
        client.get_forecast_data()
        clock[0] += gate_mod.PAUSE_AFTER_FAILURE + 1
        client.get_forecast_data()
        api.status = 200
        clock[0] += gate_mod.PAUSE_AFTER_FAILURE + 1
        client.get_forecast_data()

    warnings = [r for r in caplog.records if r.levelname == "WARNING"]
    assert len(warnings) == 1
    assert any("answers again" in r.getMessage() for r in caplog.records)
