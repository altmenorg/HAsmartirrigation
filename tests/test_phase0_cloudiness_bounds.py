"""The cloudiness term of the daily equation is bounded (audit 0.11).

1.35 Rs/Rso - 0.35 was used as is: a window with no sun gave -0.35 and turned
the longwave loss into a gain (a night with positive evapotranspiration), a
window of daylight only gave more than 1, and Rso = 0 raised.
"""

import pytest

from custom_components.smart_irrigation.calcmodules.pyeto.pyeto.fao import (
    cloudiness_factor,
    net_out_lw_rad,
)


def test_no_sun_is_the_cloudiest_sky_not_a_gain():
    assert cloudiness_factor(0.0, 20.0) == pytest.approx(0.05)


def test_more_sun_than_clear_sky_is_a_clear_sky():
    assert cloudiness_factor(40.0, 20.0) == pytest.approx(1.0)


def test_an_ordinary_day_is_unchanged():
    # FAO-56 Example 11/18: Rs 22.07, Rso 30.90 gives 0.61.
    assert cloudiness_factor(22.07, 30.90) == pytest.approx(0.614, abs=0.001)


def test_polar_night_does_not_raise():
    assert cloudiness_factor(0.0, 0.0) == pytest.approx(0.7)


def test_the_longwave_term_is_never_a_gain():
    rnl = net_out_lw_rad(tmin=287.15, tmax=295.15, sol_rad=0.0, cs_rad=20.0, avp=1.4)
    assert rnl > 0
