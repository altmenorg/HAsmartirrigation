"""FAO-56 Example 19, against our hourly equation, term by term.

The published worked example (Allen et al. 1998, Example 19: ETo from hourly
data, N'Diaye, Senegal, 1 October) prints every intermediate value, which makes
it the one test that can say our hourly form is *right* rather than merely
unchanged. The figures below are read from the FAO's own publication.

Two reasons this file exists in this shape:

* the hourly modules were taken from another fork, and the plan is to rewrite
  them from the paper. This is the net that rewrite has to pass, written from
  the paper rather than from the code it replaces;
* the night hour is where we differed from the paper. The example publishes
  Rnl 0.100 MJ/m2 for it, computed from the sunshine ratio of the late
  afternoon as FAO-56 instructs. We used the lower bound of the cloudiness
  function instead, which gave 0.007: fourteen times too little long-wave loss,
  and a night that evaporated water it should not have.

The example places N'Diaye on clocks one hour behind Greenwich (its solar time
correction uses 15 degrees west as the centre of the time zone), which is what
``TZ_OFFSET`` below is: with it, our extraterrestrial radiation reproduces the
published 3.543 MJ/m2 exactly.
"""

import datetime
import math

import pytest

from custom_components.smart_irrigation.hourly_et import (
    ALBEDO,
    atm_pressure,
    clear_sky_radiation_hourly,
    cloudiness_factor,
    delta_svp,
    eto_hourly,
    extraterrestrial_radiation_hourly,
    net_radiation_hourly,
    penman_monteith_hourly,
    psy_const,
    svp_from_t,
)

# The site, as the example gives it: 16 deg 13' N, 16 deg 15' W, 8 m.
LATITUDE = 16 + 13 / 60
LONGITUDE = -(16 + 15 / 60)
ELEVATION = 8.0
DOY = datetime.date(2026, 10, 1).timetuple().tm_yday
TZ_OFFSET = -1.0

# The two hours the example works through.
DAY = {"hour_mid": 14.5, "t_c": 38.0, "rh_pct": 52.0, "wind_2m": 3.3, "rs": 2.450}
NIGHT = {"hour_mid": 2.5, "t_c": 28.0, "rh_pct": 90.0, "wind_2m": 1.9, "rs": 0.0}

# What the example publishes for 14:00-15:00.
PUBLISHED_DAY = {
    "svp": 6.625,  # e0(T), kPa
    "avp": 3.445,  # ea, kPa
    "deficit": 3.180,  # es - ea, kPa
    "slope": 0.358,  # delta, kPa/degC
    "psy": 0.0673,  # gamma, kPa/degC
    "ra": 3.543,  # MJ/m2/h
    "rso": 2.658,
    "rns": 1.887,
    "rnl": 0.137,
    "rn": 1.749,
    "g": 0.175,
    "eto": 0.63,  # mm/h
}
# And for 02:00-03:00.
PUBLISHED_NIGHT = {
    "svp": 3.780,
    "avp": 3.402,
    "deficit": 0.378,
    "slope": 0.220,
    "psy": 0.0673,
    "ra": 0.0,
    "rso": 0.0,
    "rns": 0.0,
    "rnl": 0.100,
    "rn": -0.100,
    "g": -0.050,
    "eto": 0.00,
}
# The cloudiness the example's night Rnl implies, which is the sunshine ratio of
# the late afternoon carried into the night as FAO-56 instructs: fcd 0.728. Our
# row builder carries the ratio of two to three hours before sunset, and this is
# what that ratio was on the day of the example.
NIGHT_CLOUDINESS = 0.728


def _ra(hour_mid):
    return extraterrestrial_radiation_hourly(
        LATITUDE, LONGITUDE, DOY, hour_mid, TZ_OFFSET
    )


# --- the vapour pressures and the constants ---------------------------------


@pytest.mark.parametrize(
    ("given", "published"), [(DAY, PUBLISHED_DAY), (NIGHT, PUBLISHED_NIGHT)]
)
def test_the_vapour_pressures(given, published):
    svp = svp_from_t(given["t_c"])
    avp = svp * given["rh_pct"] / 100.0

    assert svp == pytest.approx(published["svp"], abs=0.001)
    assert avp == pytest.approx(published["avp"], abs=0.001)
    assert svp - avp == pytest.approx(published["deficit"], abs=0.001)


@pytest.mark.parametrize(
    ("given", "published"), [(DAY, PUBLISHED_DAY), (NIGHT, PUBLISHED_NIGHT)]
)
def test_the_slope_and_the_psychrometric_constant(given, published):
    assert delta_svp(given["t_c"]) == pytest.approx(published["slope"], abs=0.001)
    assert psy_const(atm_pressure(ELEVATION)) == pytest.approx(
        published["psy"], abs=0.0001
    )


# --- the daylight hour ------------------------------------------------------


def test_the_extraterrestrial_and_clear_sky_radiation_of_the_daylight_hour():
    ra = _ra(DAY["hour_mid"])

    assert ra == pytest.approx(PUBLISHED_DAY["ra"], abs=0.001)
    assert clear_sky_radiation_hourly(ra, ELEVATION) == pytest.approx(
        PUBLISHED_DAY["rso"], abs=0.001
    )


def test_the_net_radiation_of_the_daylight_hour():
    svp = svp_from_t(DAY["t_c"])
    avp = svp * DAY["rh_pct"] / 100.0

    rns = (1 - ALBEDO) * DAY["rs"]
    rn = net_radiation_hourly(DAY["rs"], _ra(DAY["hour_mid"]), DAY["t_c"], avp, ELEVATION)

    assert rns == pytest.approx(PUBLISHED_DAY["rns"], abs=0.001)
    assert rn == pytest.approx(PUBLISHED_DAY["rn"], abs=0.005)
    # Which pins the long-wave loss to the published figure as well.
    assert rns - rn == pytest.approx(PUBLISHED_DAY["rnl"], abs=0.005)


def test_the_soil_heat_flux_of_the_daylight_hour():
    """A tenth of the net radiation while the sun is up."""
    assert 0.1 * PUBLISHED_DAY["rn"] == pytest.approx(PUBLISHED_DAY["g"], abs=0.001)


def test_the_reference_evapotranspiration_of_the_daylight_hour():
    """The headline of the example: 0.63 mm in that hour."""
    eto = eto_hourly(
        t_c=DAY["t_c"],
        rh_pct=DAY["rh_pct"],
        wind_2m=DAY["wind_2m"],
        solar_rad_hr=DAY["rs"],
        latitude_deg=LATITUDE,
        longitude_deg=LONGITUDE,
        doy=DOY,
        hour_mid=DAY["hour_mid"],
        tz_offset_h=TZ_OFFSET,
        elevation_m=ELEVATION,
    )

    assert eto == pytest.approx(PUBLISHED_DAY["eto"], abs=0.005)


# --- the night hour ---------------------------------------------------------


def test_there_is_no_sun_at_night():
    assert max(0.0, _ra(NIGHT["hour_mid"])) == PUBLISHED_NIGHT["ra"]
    assert clear_sky_radiation_hourly(max(0.0, _ra(NIGHT["hour_mid"])), ELEVATION) == (
        PUBLISHED_NIGHT["rso"]
    )
    assert cloudiness_factor(NIGHT["rs"], PUBLISHED_NIGHT["rso"]) is None


def test_the_night_loses_what_the_paper_says_it_loses():
    """Given the cloudiness of the late afternoon, which is what FAO-56 says to
    carry into the night and what the row builder carries."""
    svp = svp_from_t(NIGHT["t_c"])
    avp = svp * NIGHT["rh_pct"] / 100.0

    rn = net_radiation_hourly(
        NIGHT["rs"],
        max(0.0, _ra(NIGHT["hour_mid"])),
        NIGHT["t_c"],
        avp,
        ELEVATION,
        cloudiness=NIGHT_CLOUDINESS,
    )

    assert rn == pytest.approx(PUBLISHED_NIGHT["rn"], abs=0.002)
    assert -rn == pytest.approx(PUBLISHED_NIGHT["rnl"], abs=0.002)


def test_the_night_evaporates_next_to_nothing():
    eto = eto_hourly(
        t_c=NIGHT["t_c"],
        rh_pct=NIGHT["rh_pct"],
        wind_2m=NIGHT["wind_2m"],
        solar_rad_hr=NIGHT["rs"],
        latitude_deg=LATITUDE,
        longitude_deg=LONGITUDE,
        doy=DOY,
        hour_mid=NIGHT["hour_mid"],
        tz_offset_h=TZ_OFFSET,
        elevation_m=ELEVATION,
        cloudiness=NIGHT_CLOUDINESS,
    )

    # The example prints 0.00 mm for this hour.
    assert eto == pytest.approx(PUBLISHED_NIGHT["eto"], abs=0.005)


def test_the_soil_heat_flux_of_a_night_hour():
    """Half the net radiation, and the net radiation is negative."""
    assert 0.5 * PUBLISHED_NIGHT["rn"] == pytest.approx(
        PUBLISHED_NIGHT["g"], abs=0.001
    )


def test_a_night_that_assumed_a_clear_bound_evaporated_water_it_should_not():
    """What the old behaviour cost, kept as a number rather than a memory: the
    lower bound of the cloudiness function instead of the afternoon's ratio."""
    svp = svp_from_t(NIGHT["t_c"])
    avp = svp * NIGHT["rh_pct"] / 100.0
    base = (
        2.043e-10 * math.pow(NIGHT["t_c"] + 273.16, 4) * (0.34 - 0.14 * math.sqrt(avp))
    )

    assert base * 0.05 == pytest.approx(0.007, abs=0.001)
    assert base * NIGHT_CLOUDINESS == pytest.approx(PUBLISHED_NIGHT["rnl"], abs=0.002)


# --- the equation itself ----------------------------------------------------


def test_the_hourly_equation_is_assembled_as_published():
    """Eq. 53 with the published terms, so a change to the assembly is caught
    even if every helper still agrees with the paper on its own."""
    eto = penman_monteith_hourly(
        PUBLISHED_DAY["rn"],
        PUBLISHED_DAY["g"],
        DAY["t_c"],
        DAY["wind_2m"],
        PUBLISHED_DAY["svp"],
        PUBLISHED_DAY["avp"],
        PUBLISHED_DAY["slope"],
        PUBLISHED_DAY["psy"],
    )

    assert eto == pytest.approx(PUBLISHED_DAY["eto"], abs=0.005)
