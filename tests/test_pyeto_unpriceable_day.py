"""A day the equation cannot price is left out of the average, not priced zero.

Penman-Monteith needs five inputs: min and max temperature, dew point, wind and
pressure. A day missing one of them returns zero, and that zero used to be
averaged in with the days that were priced. So with three forecast days from a
service that does not fill dew point or pressure, a real 4 mm day came out as
1 mm and the zone was watered a quarter of what it needed, with nothing but a
warning in the log to say so.

The day still appears in the trace, with what it was missing, so the History tab
and a diagnostics file show why it did not count.
"""

from unittest.mock import MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.pyeto import PyETO

LAT, ELEV = 47.05, 4.0

FULL = {
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


def _without(field):
    return {key: value for key, value in FULL.items() if key != field}


@pytest.mark.parametrize(
    "missing",
    [
        const.MAPPING_DEWPOINT,
        const.MAPPING_PRESSURE,
        const.MAPPING_WINDSPEED,
        const.MAPPING_MIN_TEMP,
        const.MAPPING_MAX_TEMP,
    ],
)
def test_a_forecast_day_missing_an_input_does_not_dilute_the_average(missing):
    module = _module(forecast_days=3)
    forecast = [_without(missing), _without(missing), _without(missing)]

    delta = module.calculate(FULL, forecast)
    today_only = _module(forecast_days=0).calculate(FULL, [])

    # The three unusable days used to divide the evapotranspiration by four.
    assert delta == pytest.approx(today_only)
    assert module.last_trace["days_in_average"] == 1


def test_the_days_that_can_be_priced_are_the_ones_averaged():
    module = _module(forecast_days=2)
    warm = {**FULL, const.MAPPING_MAX_TEMP: 30.0}

    delta = module.calculate(FULL, [_without(const.MAPPING_PRESSURE), warm])

    priced = module.last_trace["deltas"]
    assert len(priced) == 2, "today and the warm forecast day, not the empty one"
    assert delta == pytest.approx(sum(priced) / 2)
    # The warm day is what pulls the average away from today's own figure.
    assert min(priced) < delta < max(priced)
    assert module.last_trace["days_in_average"] == 2


def test_the_day_that_did_not_count_is_still_in_the_trace():
    module = _module(forecast_days=1)

    module.calculate(FULL, [_without(const.MAPPING_DEWPOINT)])

    days = module.last_trace["days"]
    assert len(days) == 2, "both days are reported"
    assert days[1]["missing"] == [const.MAPPING_DEWPOINT]
    assert module.last_trace["forecast_days_used"] == 1


def test_an_empty_forecast_day_counts_as_nothing_at_all():
    module = _module(forecast_days=1)

    delta = module.calculate(FULL, [{}])

    assert delta == pytest.approx(_module().calculate(FULL, []))
    assert module.last_trace["days_in_average"] == 1


def test_a_day_of_readings_that_cannot_be_priced_still_yields_no_watering():
    """Nothing to average is nothing to do, as before: the bucket is unchanged
    rather than credited with an evapotranspiration nobody computed."""
    module = _module()

    assert module.calculate(_without(const.MAPPING_WINDSPEED), []) == 0
    assert module.last_trace["days_in_average"] == 0
