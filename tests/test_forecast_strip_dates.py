"""The days ahead on the Info page carry their dates, whatever the service (#880).

Only Open-Meteo dates the days of its forecast. The others sent none, the panel
received null, and a browser reads null as 1 January 1970: every day was
labelled Thursday.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, Mock

from homeassistant.util import dt as dt_util

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.websockets import _forecast_days


def _coordinator(forecast):
    coordinator = MagicMock()
    coordinator.use_weather_service = True
    coordinator._WeatherServiceClient.get_forecast_data = Mock(return_value=forecast)
    return coordinator


def _hass():
    hass = MagicMock()
    hass.async_add_executor_job = AsyncMock(side_effect=lambda f, *a: f(*a))
    return hass


def _day(**fields):
    return {
        const.MAPPING_MAX_TEMP: 20.0,
        const.MAPPING_MIN_TEMP: 10.0,
        const.MAPPING_PRECIPITATION: 0.0,
        **fields,
    }


async def test_a_service_that_dates_its_days_keeps_its_dates():
    days = await _forecast_days(
        _hass(), _coordinator([_day(date="2026-10-04"), _day(date="2026-10-05")])
    )

    assert [d["date"] for d in days] == ["2026-10-04", "2026-10-05"]


async def test_a_service_that_does_not_gets_consecutive_days_from_today():
    today = dt_util.now().date()

    days = await _forecast_days(_hass(), _coordinator([_day(), _day(), _day()]))

    assert [d["date"] for d in days] == [
        (today + datetime.timedelta(days=i)).isoformat() for i in range(3)
    ]


async def test_every_day_has_a_different_date():
    days = await _forecast_days(_hass(), _coordinator([_day() for _ in range(6)]))

    assert len({d["date"] for d in days}) == 6
    assert all(d["date"] for d in days)
