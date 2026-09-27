"""Saturation vapour pressure over a day, and why it cost 13% of the ET (#848).

FAO-56 Eq. 12: over a day, es is the mean of the two extremes, e0(Tmax) and
e0(Tmin). It is not e0 of the mean temperature, and the paper is explicit about
why -- the curve is convex, so the mean temperature gives a lower es, which
understates the vapour pressure deficit and therefore the evapotranspiration.

We used the mean temperature. Megalos compared a day of ours against the hourly
ET0 Open-Meteo publishes for the same place and found ours 20-30% short: on his
day (5.2 to 21.6 C) this alone accounted for 0.20 kPa of deficit and 13% of the
ETo, and the crop factor then scaled the error into the bucket.

The slope of the curve is still taken at the mean temperature, which is what
Eq. 13 asks for.
"""

import datetime
from unittest.mock import MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calcmodules.pyeto import PyETO
from custom_components.smart_irrigation.calcmodules.pyeto.pyeto.fao import svp_from_t

# The day Megalos reported, from his diagnostics: Open-Meteo as the source, no
# radiation estimated, 51.5 N.
HIS_DAY = {
    const.MAPPING_MIN_TEMP: 5.2,
    const.MAPPING_MAX_TEMP: 21.6,
    const.MAPPING_DEWPOINT: 6.443478260869565,
    const.MAPPING_WINDSPEED: 1.3853354696588878,
    const.MAPPING_PRESSURE: 1019.7217391304348,
    const.MAPPING_SOLRAD: 15.36793043478261,
    const.MAPPING_HUMIDITY: 67.17391304347827,
}
SEPT_25 = datetime.date(2026, 9, 25)


def _module(latitude=51.5, elevation=0):
    hass = MagicMock()
    hass.config.as_dict.return_value = {"latitude": latitude, "elevation": elevation}
    return PyETO(hass, "", {const.CONF_PYETO_FORECAST_DAYS: 0})


def _eto(day=None, when=SEPT_25):
    module = _module()
    delta = module.calculate_et_for_day(day or HIS_DAY, when)
    return -delta, module.last_day_trace


def test_es_is_the_mean_of_the_two_extremes():
    _value, trace = _eto()

    expected = (svp_from_t(21.6) + svp_from_t(5.2)) / 2.0

    assert trace["svp"] == pytest.approx(expected)
    # And not the old form, which is lower.
    assert trace["svp"] > svp_from_t((21.6 + 5.2) / 2.0)


def test_the_day_that_was_reported_lands_where_the_equation_puts_it():
    """1.999 mm before, against 2.54 mm of hourly ET0 from Open-Meteo for the
    same day and the same radiation. The rest of that gap is the difference
    between integrating hour by hour and evaluating the daily equation once,
    which is expected and is not this bug."""
    eto, _trace = _eto()

    assert eto == pytest.approx(2.29, abs=0.01)


def test_a_wide_day_gains_the_most():
    """The error grows with the spread between the extremes, which is why a
    clear spring day was the worst case and an overcast one barely moved."""
    narrow = {**HIS_DAY, const.MAPPING_MIN_TEMP: 12.0, const.MAPPING_MAX_TEMP: 14.8}
    wide = {**HIS_DAY, const.MAPPING_MIN_TEMP: 2.0, const.MAPPING_MAX_TEMP: 24.8}

    # Same mean temperature, so the only thing that differs is the spread.
    narrow_eto, narrow_trace = _eto(narrow)
    wide_eto, wide_trace = _eto(wide)

    assert wide_trace["svp"] > narrow_trace["svp"]
    assert wide_eto > narrow_eto


def test_a_day_with_no_spread_is_unchanged():
    """When the two extremes meet, the two forms are the same number: nobody's
    flat day moved because of this."""
    flat = {**HIS_DAY, const.MAPPING_MIN_TEMP: 13.4, const.MAPPING_MAX_TEMP: 13.4}

    _value, trace = _eto(flat)

    assert trace["svp"] == pytest.approx(svp_from_t(13.4))


def test_the_slope_still_comes_from_the_mean_temperature():
    """Eq. 13 is evaluated at Tmean; only es changed."""
    _value, trace = _eto()

    assert trace["mean_temp"] == pytest.approx((5.2 + 21.6) / 2.0)


def test_the_deficit_is_what_the_wind_term_multiplies():
    """es - ea is the deficit, so both belong in the trace: a zone reading 20%
    low is diagnosed from those two numbers and nothing else."""
    _value, trace = _eto()

    assert trace["svp"] - trace["avp"] == pytest.approx(0.768, abs=0.01)
