"""The daily evapotranspiration is never negative, as the hourly one (#866).

On a dark, cold and humid day the radiation term of the daily equation goes
negative and so did the result: the bucket was credited with water that never
fell, about 0.06 mm on the day below. The hourly form already kept every hour
at zero or above, so the two forms disagreed on the same day. Condensation is
dew on the leaves, not water in the root zone.
"""

import datetime
from unittest.mock import MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.pyeto import PyETO

DARK_HUMID_DAY = {
    const.MAPPING_MIN_TEMP: -15.0,
    const.MAPPING_MAX_TEMP: -8.0,
    const.MAPPING_DEWPOINT: None,
    const.MAPPING_HUMIDITY: 85.0,
    const.MAPPING_WINDSPEED: 3.0,
    const.MAPPING_PRESSURE: 1005.0,
}


def _module(latitude=69.0):
    hass = MagicMock()
    hass.config.as_dict.return_value = {"latitude": latitude, "elevation": 10.0}
    return PyETO(hass, "", {const.CONF_PYETO_FORECAST_DAYS: 0})


def test_a_dark_humid_day_adds_no_water():
    module = _module()

    delta = module.calculate_et_for_day(DARK_HUMID_DAY, datetime.date(2026, 12, 21))

    assert delta == 0
    # What the equation said is kept for the calculation log.
    assert module.last_day_trace["eto_raw"] < 0
    assert module.last_day_trace["eto"] == 0


def test_an_ordinary_day_is_unchanged():
    module = _module(latitude=48.0)
    summer = {
        const.MAPPING_MIN_TEMP: 14.0,
        const.MAPPING_MAX_TEMP: 28.0,
        const.MAPPING_DEWPOINT: 12.0,
        const.MAPPING_WINDSPEED: 2.0,
        const.MAPPING_PRESSURE: 1013.0,
    }

    delta = module.calculate_et_for_day(summer, datetime.date(2026, 7, 1))

    assert delta < 0
    assert module.last_day_trace["eto_raw"] == pytest.approx(-delta)
