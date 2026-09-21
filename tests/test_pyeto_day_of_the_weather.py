"""PyETO prices the weather under the sun of the day it belongs to.

The day of the year sets the extraterrestrial radiation, and through it the
clear-sky radiation, the net longwave loss and, with no solar sensor, the
radiation estimated from temperature. It used to be read off the clock:

- a calculation run just after midnight priced the day that had just ended
  under the next day's sun;
- every forecast day was priced under today's;
- the watering calendar estimated every month of the year under the sun of
  the day it was opened, so January got September's radiation.
"""

import datetime
from unittest.mock import MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.pyeto import PyETO

LAT, ELEV = 47.05, 4.0

WEATHER = {
    const.MAPPING_MIN_TEMP: 8.0,
    const.MAPPING_MAX_TEMP: 22.0,
    const.MAPPING_DEWPOINT: 9.0,
    const.MAPPING_WINDSPEED: 2.0,
    const.MAPPING_PRESSURE: 1013.0,
}


def _module(forecast_days=0):
    hass = MagicMock()
    hass.config.as_dict.return_value = {"latitude": LAT, "elevation": ELEV}
    return PyETO(hass, "", {const.CONF_PYETO_FORECAST_DAYS: forecast_days})


def test_a_known_day_is_used_as_given():
    day = datetime.date(2026, 1, 15)

    assert PyETO._day_of_the_weather(WEATHER, day) == day


def test_readings_are_priced_at_the_middle_of_their_window():
    """A day of readings ends now, so its middle is twelve hours ago."""
    expected = (datetime.datetime.now() - datetime.timedelta(hours=12)).date()

    day = PyETO._day_of_the_weather({**WEATHER, const.MAPPING_DATA_MULTIPLIER: 1.0})

    assert day == expected


def test_without_a_window_it_is_today():
    assert PyETO._day_of_the_weather(WEATHER) == datetime.date.today()


def test_each_forecast_day_is_priced_under_its_own_sun():
    module = _module(forecast_days=3)

    module.calculate(
        {**WEATHER, const.MAPPING_DATA_MULTIPLIER: 1.0}, [dict(WEATHER)] * 3
    )

    today = datetime.date.today()
    days = [entry["day_of_year"] for entry in module.last_trace["days"]]
    expected_forecast = [
        (today + datetime.timedelta(days=offset)).timetuple().tm_yday
        for offset in (1, 2, 3)
    ]
    assert days[1:] == expected_forecast


def test_the_same_weather_evaporates_more_under_a_july_sun_than_a_january_one():
    """What the calendar relies on: with no solar sensor, the radiation is
    estimated from the temperature range under that day's sun."""
    module = _module()
    july = -module.calculate_et_for_day(dict(WEATHER), datetime.date(2026, 7, 15))
    january = -module.calculate_et_for_day(dict(WEATHER), datetime.date(2026, 1, 15))

    assert july > 2 * january


@pytest.mark.parametrize("month", [1, 4, 7, 10])
def test_the_calendar_prices_each_month_under_its_own_sun(month):
    module = _module()

    module.calculate_et_for_day(dict(WEATHER), datetime.date(2026, month, 15))

    assert module.last_day_trace["day_of_year"] == (
        datetime.date(2026, month, 15).timetuple().tm_yday
    )
