"""The live estimate gets the forecast in hand on OpenWeatherMap and Pirate Weather.

Only Open-Meteo kept a forecast the estimate could read without a request. On
the two other services the estimate of a zone looking ahead averaged today
alone while the calculation it previews averaged today with the forecast days,
so the panel showed another figure and the start placed from that figure was
off. Both clients now hand back their last forecast without asking again.
"""

import datetime
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const, websockets
from custom_components.smart_irrigation.calcmodules.pyeto import PyETO
from custom_components.smart_irrigation.live_estimate import LiveEstimateMixin
from custom_components.smart_irrigation.weathermodules import OWMClient as owm_mod
from custom_components.smart_irrigation.weathermodules import (
    PirateWeatherClient as pw_mod,
)
from custom_components.smart_irrigation.weathermodules.OWMClient import OWMClient
from custom_components.smart_irrigation.weathermodules.PirateWeatherClient import (
    PirateWeatherClient,
)
from custom_components.smart_irrigation.weathermodules.SolarRadiationFallback import (
    SolarRadiationFallbackClient,
)

# 2026-10-04 12:00 UTC
NOON = 1791115200


def _owm_day(index, rain=0.0):
    return {
        "dt": NOON + index * 86400,
        "wind_speed": 3.0,
        "pressure": 1015,
        "humidity": 60,
        "temp": {"day": 20.0 + index, "min": 12.0, "max": 24.0 + index},
        "dew_point": 10.0,
        "rain": rain,
    }


def _owm_doc(days=5):
    return {
        "timezone_offset": 7200,
        "daily": [_owm_day(i, rain=float(i)) for i in range(days)],
    }


def _pw_doc(days=5):
    # Midnight at the site (Europe/Paris, UTC+2 in October) of 2026-10-04.
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
                    "temperatureMax": 24.0 + i,
                    "temperatureMin": 12.0,
                    "dewPoint": 10.0,
                    "precipAccumulation": 0.1 * i,
                }
                for i in range(days)
            ]
        },
    }


class _Resp:
    status_code = 200

    def __init__(self, doc):
        self.text = json.dumps(doc)


def _counting_get(doc):
    calls = []

    def _get(*args, **kwargs):
        calls.append(args)
        return _Resp(doc)

    return _get, calls


def test_owm_hands_back_its_last_forecast_without_a_request(monkeypatch):
    get, calls = _counting_get(_owm_doc())
    monkeypatch.setattr(owm_mod.requests, "get", get)
    client = OWMClient("key", "3.0", 48.8, 2.3, 35, cache_seconds=0)

    fetched = client.get_forecast_data()
    assert len(calls) == 1

    assert client.get_cached_forecast_data() == fetched
    assert len(calls) == 1


def test_owm_has_nothing_before_the_first_fetch():
    client = OWMClient("key", "3.0", 48.8, 2.3, 35)

    assert client.get_cached_forecast_data() is None


def test_pirate_weather_hands_back_its_last_forecast_without_a_request(monkeypatch):
    get, calls = _counting_get(_pw_doc())
    monkeypatch.setattr(pw_mod.requests, "get", get)
    client = PirateWeatherClient("key", "1", 48.8, 2.3, 35, cache_seconds=0)

    fetched = client.get_forecast_data()
    assert len(calls) == 1

    assert client.get_cached_forecast_data() == fetched
    assert len(calls) == 1


def test_pirate_weather_has_nothing_before_the_first_fetch():
    client = PirateWeatherClient("key", "1", 48.8, 2.3, 35)

    assert client.get_cached_forecast_data() is None


def _wrapped_owm(monkeypatch):
    get, calls = _counting_get(_owm_doc())
    monkeypatch.setattr(owm_mod.requests, "get", get)
    primary = OWMClient("key", "3.0", 48.8, 2.3, 35, cache_seconds=0)
    wrapper = SolarRadiationFallbackClient(primary, 48.8, 2.3, 35)
    return wrapper, calls


def test_the_wrapper_keeps_the_radiation_it_filled(monkeypatch):
    wrapper, calls = _wrapped_owm(monkeypatch)
    radiation = [{const.MAPPING_SOLRAD: 10.0 + i} for i in range(4)]
    with patch.object(
        wrapper._fallback, "get_forecast_data", return_value=radiation
    ) as fallback:
        fetched = wrapper.get_forecast_data()
    fallback.assert_called_once()

    with patch.object(wrapper._fallback, "_request") as request:
        cached = wrapper.get_cached_forecast_data()
    request.assert_not_called()

    assert cached == fetched
    assert [day[const.MAPPING_SOLRAD] for day in cached] == [10.0, 11.0, 12.0]
    assert len(calls) == 1


def test_the_wrapper_fills_from_the_fallback_cache_only(monkeypatch):
    """A day fetched without radiation is filled from Open-Meteo's last response."""
    wrapper, _ = _wrapped_owm(monkeypatch)
    wrapper._primary.get_forecast_data()
    with (
        patch.object(
            wrapper._fallback,
            "get_cached_forecast_data",
            return_value=[{const.MAPPING_SOLRAD: 9.0}] * 3,
        ),
        patch.object(wrapper._fallback, "_request") as request,
    ):
        cached = wrapper.get_cached_forecast_data()
    request.assert_not_called()
    assert all(day[const.MAPPING_SOLRAD] == 9.0 for day in cached)


class _Coordinator(LiveEstimateMixin):
    def __init__(self, client, module):
        self.use_weather_service = True
        self._WeatherServiceClient = client
        self.module = module
        self.store = MagicMock()
        self.store.get_mapping = MagicMock(
            return_value={const.MAPPING_ID: 1, const.MAPPING_DATA: [{"x": 1}]}
        )
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.getModuleInstanceByID = AsyncMock(return_value=module)
        self.module_id_for_zone = MagicMock(return_value=0)
        self.zone_window_start = MagicMock(return_value=None)
        self.apply_aggregates_to_mapping_data = AsyncMock(return_value=dict(TODAY))
        self.calculate_module = AsyncMock(side_effect=self._calculate)

    async def _calculate(self, zone, weatherdata, forecastdata):
        return {
            const.ZONE_BUCKET: -self.module.calculate(
                weather_data=weatherdata, forecast_data=forecastdata
            ),
            const.ZONE_DELTA: 0.0,
            const.ZONE_DURATION: 0,
        }


TODAY = {
    const.MAPPING_MIN_TEMP: 10.0,
    const.MAPPING_MAX_TEMP: 22.0,
    const.MAPPING_DEWPOINT: 9.0,
    const.MAPPING_WINDSPEED: 2.0,
    const.MAPPING_PRESSURE: 1013.0,
    const.MAPPING_HUMIDITY: 65.0,
}


def _pyeto(forecast_days):
    hass = MagicMock()
    hass.config.as_dict.return_value = {"latitude": 48.8, "elevation": 35}
    return PyETO(hass, "", {const.CONF_PYETO_FORECAST_DAYS: forecast_days})


@pytest.mark.asyncio
async def test_the_estimate_of_an_owm_zone_looking_ahead_uses_the_forecast(
    monkeypatch,
):
    wrapper, calls = _wrapped_owm(monkeypatch)
    with patch.object(wrapper._fallback, "get_forecast_data", return_value=None):
        # What the real calculation reads, through the same wrapper.
        forecast = wrapper.get_forecast_data()
    module = _pyeto(forecast_days=2)
    coordinator = _Coordinator(wrapper, module)
    zone = {const.ZONE_ID: 1, const.ZONE_MAPPING: 1}

    with patch.object(wrapper._fallback, "_request") as request:
        estimate = await coordinator.async_estimate_zone_now(zone)
    request.assert_not_called()
    assert len(calls) == 1

    assert estimate["forecast_used"] is True
    expected = -module.calculate(weather_data=dict(TODAY), forecast_data=forecast)
    assert estimate["bucket"] == pytest.approx(expected)
    # And the forecast days changed the figure: today alone is another one.
    today_alone = -module.calculate(weather_data=dict(TODAY), forecast_data=None)
    assert estimate["bucket"] != pytest.approx(today_alone)


def test_owm_dates_its_days_at_the_site(monkeypatch):
    get, _ = _counting_get(_owm_doc())
    monkeypatch.setattr(owm_mod.requests, "get", get)
    client = OWMClient("key", "3.0", 48.8, 2.3, 35)

    days = client.get_forecast_data(include_today=True)

    assert [day["date"] for day in days] == [
        "2026-10-04",
        "2026-10-05",
        "2026-10-06",
        "2026-10-07",
    ]


def test_owm_day_crossing_midnight_utc_is_dated_at_the_site():
    """Late in the day at a site east of UTC is already the next day there."""
    # 2026-10-04 23:00 UTC is 2026-10-05 09:00 in Sydney (UTC+10).
    stamp = datetime.datetime(2026, 10, 4, 23, tzinfo=datetime.UTC).timestamp()

    assert owm_mod.site_date(stamp, 36000) == "2026-10-05"
    assert owm_mod.site_date(stamp, None) is None


def test_pirate_weather_dates_its_days_at_the_site(monkeypatch):
    get, _ = _counting_get(_pw_doc())
    monkeypatch.setattr(pw_mod.requests, "get", get)
    client = PirateWeatherClient("key", "1", 48.8, 2.3, 35)

    days = client.get_forecast_data(include_today=True)

    # Midnight at the site is 22:00 UTC the day before: the date is the site's.
    assert [day["date"] for day in days] == [
        "2026-10-04",
        "2026-10-05",
        "2026-10-06",
        "2026-10-07",
    ]


def test_pirate_weather_falls_back_to_the_offset():
    midnight_paris = 1791064800

    assert pw_mod.site_date(midnight_paris, None, 2) == "2026-10-04"
    assert pw_mod.site_date(midnight_paris, "Not/AZone", 2) == "2026-10-04"
    assert pw_mod.site_date(midnight_paris, None, None) is None


async def test_the_strip_labels_days_by_the_site_date_not_by_position(monkeypatch):
    """Home Assistant in Honolulu, the garden in Sydney: a day apart."""
    # 2026-10-04 15:00 UTC: 05:00 on the 4th in Honolulu, 01:00 on the 5th in
    # Sydney, where the service's today is already the 5th.
    stamp = int(datetime.datetime(2026, 10, 4, 15, tzinfo=datetime.UTC).timestamp())
    doc = {
        "timezone_offset": 36000,
        "daily": [{**_owm_day(i), "dt": stamp + i * 86400} for i in range(4)],
    }
    get, _ = _counting_get(doc)
    monkeypatch.setattr(owm_mod.requests, "get", get)
    client = OWMClient("key", "3.0", -33.9, 151.2, 10)
    coordinator = MagicMock()
    coordinator.use_weather_service = True
    coordinator._WeatherServiceClient = client
    hass = MagicMock()
    hass.async_add_executor_job = AsyncMock(side_effect=lambda f, *a: f(*a))
    honolulu = datetime.datetime(
        2026, 10, 4, 5, tzinfo=datetime.timezone(datetime.timedelta(hours=-10))
    )

    with patch.object(websockets.dt_util, "now", return_value=honolulu):
        days = await websockets._forecast_days(hass, coordinator)

    assert [d["date"] for d in days] == ["2026-10-05", "2026-10-06", "2026-10-07"]
