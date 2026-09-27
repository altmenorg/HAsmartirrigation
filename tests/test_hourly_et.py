"""The FAO-56 equations, checked against the paper and against physics.

Example 19 is worked through term by term in tests/test_fao56_example_19.py,
which is the reference: it says the equations are *right*. This file says they
stay right where the example does not reach -- other latitudes, other seasons,
the hours either side of sunrise, the arguments a sensor can actually send --
and pins the properties that would still hold if every constant were retyped.

The published figures used here are from FAO Irrigation and Drainage Paper 56
(Allen et al. 1998): Example 2 (atmospheric pressure and the psychrometric
constant at 1800 m), Example 3 (saturation vapour pressure), Example 8
(extraterrestrial radiation over a day) and Annex 2 Table 2.4 (the slope).
"""

import math

import pytest

from custom_components.smart_irrigation.hourly_et import (
    ALBEDO,
    CN_HOURLY,
    NIGHT_CLOUDINESS_FALLBACK,
    SOLAR_CONSTANT,
    STEFAN_BOLTZMANN_HOURLY,
    atm_pressure,
    clear_sky_radiation_hourly,
    clear_sky_radiation_hourly_eq36,
    cloudiness_factor,
    delta_svp,
    eto_hourly,
    extraterrestrial_radiation_hourly,
    net_radiation_hourly,
    penman_monteith_hourly,
    precipitable_water,
    psy_const,
    soil_heat_flux_hourly,
    solar_elevation_sin,
    svp_from_t,
)

TOULOUSE = (43.6, 1.44, 150.0)
MIDSUMMER = 172
MIDWINTER = 15


def _hourly(latitude, longitude, doy, hour, offset):
    return max(
        0.0, extraterrestrial_radiation_hourly(latitude, longitude, doy, hour, offset)
    )


def _ra_daily(latitude_deg, doy):
    """FAO-56 Eq. 21, the daily form, written here only to check Eq. 28.

    Two equations for the same sun: the day's total and the sum of its hours
    have to agree, and if one of them has a sign or a factor wrong they will
    not.
    """
    phi = math.radians(latitude_deg)
    declination = 0.409 * math.sin(2 * math.pi * doy / 365 - 1.39)
    dr = 1 + 0.033 * math.cos(2 * math.pi * doy / 365)
    sunset = math.acos(max(-1.0, min(1.0, -math.tan(phi) * math.tan(declination))))
    return (
        (24 * 60 / math.pi)
        * SOLAR_CONSTANT
        * dr
        * (
            sunset * math.sin(phi) * math.sin(declination)
            + math.cos(phi) * math.cos(declination) * math.sin(sunset)
        )
    )


# --- the constants ----------------------------------------------------------


def test_the_constants_are_the_papers():
    assert SOLAR_CONSTANT == 0.0820  # MJ m-2 min-1
    assert ALBEDO == 0.23  # the grass reference crop
    assert CN_HOURLY == 37.0  # Eq. 53, the short reference


def test_the_stefan_boltzmann_constant_is_the_hourly_one():
    """The daily constant on an hourly step would be a long-wave loss
    twenty-four times too large, which is the classic way to break this."""
    daily_constant_per_hour = 4.903e-9 / 24

    assert daily_constant_per_hour == pytest.approx(STEFAN_BOLTZMANN_HOURLY, rel=1e-4)


def test_the_night_falls_back_to_the_clear_end_of_the_range():
    """Under-counting the long-wave loss over-counts the net radiation, which
    is water a garden is told it lost and did not."""
    assert 0.5 < NIGHT_CLOUDINESS_FALLBACK <= 1.0


# --- the atmosphere ---------------------------------------------------------


def test_the_pressure_at_sea_level_and_at_altitude():
    """FAO-56 Example 2: 1800 m gives 81.8 kPa."""
    assert atm_pressure(0.0) == pytest.approx(101.3)
    assert atm_pressure(1800.0) == pytest.approx(81.8, abs=0.05)


def test_the_pressure_falls_with_height():
    assert atm_pressure(2000.0) < atm_pressure(1000.0) < atm_pressure(0.0)


def test_the_psychrometric_constant_at_altitude():
    """FAO-56 Example 2: 0.054 kPa/degC at 1800 m."""
    assert psy_const(atm_pressure(1800.0)) == pytest.approx(0.054, abs=0.0005)


# --- the vapour pressures ---------------------------------------------------


@pytest.mark.parametrize(
    ("t_c", "published"), [(24.5, 3.075), (15.0, 1.705), (0.0, 0.6108)]
)
def test_the_saturation_vapour_pressure(t_c, published):
    """FAO-56 Example 3, and the definition at 0 degC."""
    assert svp_from_t(t_c) == pytest.approx(published, abs=0.001)


def test_the_saturation_vapour_pressure_curve_is_convex():
    """Which is the whole reason the daily form has to average e0(Tmax) and
    e0(Tmin) rather than take e0 of the mean, and the reason pricing an hour at
    a time is not the same calculation."""
    cold, mean, hot = svp_from_t(10.0), svp_from_t(20.0), svp_from_t(30.0)

    assert (cold + hot) / 2 > mean


@pytest.mark.parametrize(("t_c", "published"), [(30.0, 0.243), (20.0, 0.145)])
def test_the_slope_of_the_curve(t_c, published):
    """FAO-56 Annex 2, Table 2.4."""
    assert delta_svp(t_c) == pytest.approx(published, abs=0.001)


def test_the_slope_is_the_derivative_of_the_curve():
    """Eq. 13 against a numerical derivative of Eq. 11.

    Not to the last digit: the paper writes the numerator as 4098 where the
    exact product 17.27 x 237.3 is 4097.87, so the two differ in the fifth
    figure by design. That is the paper's rounding and it stays.
    """
    step = 1e-5
    numerical = (svp_from_t(22.0 + step) - svp_from_t(22.0 - step)) / (2 * step)

    assert delta_svp(22.0) == pytest.approx(numerical, rel=1e-4)


# --- placing the sun --------------------------------------------------------


def test_the_sun_is_highest_at_solar_noon():
    latitude, longitude, _elevation = TOULOUSE
    angles = [
        solar_elevation_sin(latitude, longitude, MIDSUMMER, hour + 0.5, 2.0)
        for hour in range(24)
    ]

    # Local clock 13:30 in summer time, which is close to solar noon there.
    assert angles.index(max(angles)) == 13
    assert max(angles) == pytest.approx(math.sin(math.radians(69.8)), abs=0.02)


def test_the_sun_is_below_the_horizon_at_night():
    latitude, longitude, _elevation = TOULOUSE

    assert solar_elevation_sin(latitude, longitude, MIDSUMMER, 2.5, 2.0) < 0
    assert solar_elevation_sin(latitude, longitude, MIDWINTER, 23.5, 1.0) < 0


def test_the_equator_looks_straight_up_at_an_equinox():
    """A place with no seasons, at the moment the sun crosses it."""
    equinox = 81  # 22 March, which Eq. 33 also takes as its origin

    assert solar_elevation_sin(0.0, 0.0, equinox, 12.5, 0.0) == pytest.approx(
        1.0, abs=0.02
    )


def test_the_hemispheres_are_opposite():
    """Midsummer in Toulouse is midwinter at the same latitude south."""
    north = solar_elevation_sin(43.6, 1.44, MIDSUMMER, 12.5, 1.0)
    south = solar_elevation_sin(-43.6, 1.44, MIDSUMMER, 12.5, 1.0)

    assert north > 0.8
    assert 0 < south < 0.4


def test_a_site_at_the_centre_of_its_zone_sees_the_same_sun_in_any_zone():
    """Lz and Lm are a pair, and the module has to translate both: FAO-56
    counts degrees *west* and names the centre of the zone, while the
    integration holds a signed longitude and an offset from UTC.

    At Greenwich in UTC, and at 15 degrees east in UTC+1, the clock and the sun
    agree in exactly the same way, so 12:30 looks identical from both. Getting
    the sign of either term wrong moves solar noon by hours while still summing
    to something plausible over the day.
    """
    greenwich = solar_elevation_sin(48.0, 0.0, MIDSUMMER, 12.5, 0.0)
    centred_one_zone_east = solar_elevation_sin(48.0, 15.0, MIDSUMMER, 12.5, 1.0)

    assert greenwich == pytest.approx(centred_one_zone_east, abs=1e-12)


def test_the_west_of_a_time_zone_gets_its_noon_later_on_the_clock():
    """Brest and Strasbourg keep the same clock and do not see the same sun."""
    west = [solar_elevation_sin(48.0, -4.5, MIDSUMMER, h + 0.5, 2.0) for h in range(24)]
    east = [solar_elevation_sin(48.0, 7.8, MIDSUMMER, h + 0.5, 2.0) for h in range(24)]

    assert max(east) > max(west) or east.index(max(east)) <= west.index(max(west))
    # Mid-morning the eastern site is already higher, because its sun rose
    # earlier by the clock they share.
    assert east[8] > west[8]


# --- extraterrestrial and clear-sky radiation -------------------------------


@pytest.mark.parametrize(
    ("latitude", "longitude", "offset", "doy"),
    [
        (43.6, 1.44, 1.0, MIDWINTER),
        (43.6, 1.44, 2.0, MIDSUMMER),
        (-20.0, 30.0, 2.0, 246),
    ],
)
def test_the_hours_of_a_day_add_up_to_the_day(latitude, longitude, offset, doy):
    """Eq. 28 summed over 24 hours against Eq. 21 for the same day.

    Not exact: the hours at dawn and dusk are priced whole where the daily form
    stops at the sunset angle, so the sum runs a little under. Within a couple
    of per cent is what agreement looks like here; a factor, a sign or a
    radians-for-degrees slip is not.
    """
    summed = sum(
        _hourly(latitude, longitude, doy, hour + 0.5, offset) for hour in range(24)
    )

    assert summed == pytest.approx(_ra_daily(latitude, doy), rel=0.03)


def test_there_is_more_sun_in_summer_than_in_winter():
    latitude, longitude, _elevation = TOULOUSE
    summer = sum(
        _hourly(latitude, longitude, MIDSUMMER, h + 0.5, 2.0) for h in range(24)
    )
    winter = sum(
        _hourly(latitude, longitude, MIDWINTER, h + 0.5, 1.0) for h in range(24)
    )

    assert summer > 3 * winter


def test_the_night_hours_are_not_positive():
    """The equation goes negative after dark, which callers clamp. What must
    never happen is a night hour receiving sun."""
    latitude, longitude, _elevation = TOULOUSE

    for hour in (0.5, 1.5, 2.5, 23.5):
        assert (
            extraterrestrial_radiation_hourly(latitude, longitude, MIDWINTER, hour, 1.0)
            <= 0
        )


def test_the_clear_sky_radiation_rises_with_the_station():
    """Eq. 37: thinner air above a mountain lets more through."""
    ra = 3.5

    assert clear_sky_radiation_hourly(ra, 0.0) == pytest.approx(0.75 * ra)
    assert clear_sky_radiation_hourly(ra, 2000.0) == pytest.approx(0.79 * ra)
    assert clear_sky_radiation_hourly(0.0, 1500.0) == 0.0


def test_the_precipitable_water_is_eq_3_19():
    assert precipitable_water(2.0, 100.0) == pytest.approx(0.14 * 2.0 * 100.0 + 2.1)
    assert precipitable_water(-1.0, 100.0) == pytest.approx(2.1)


def test_a_sun_below_the_horizon_has_no_clear_sky_of_its_own():
    """Eq. 3-18 divides by sin(beta); an unguarded version raises here."""
    assert clear_sky_radiation_hourly_eq36(3.0, 0.0, 101.3, 14.0) == 0.0
    assert clear_sky_radiation_hourly_eq36(3.0, -0.4, 101.3, 14.0) == 0.0
    assert clear_sky_radiation_hourly_eq36(0.0, 0.5, 101.3, 14.0) == 0.0


def test_a_low_sun_gets_less_than_the_simple_form_promises():
    """The reason Eq. 36 exists: Eq. 37 assumes the sun about 50 degrees up, so
    near dawn it promises a clear sky brighter than any clear sky is."""
    ra = 1.0
    water = precipitable_water(1.5, 101.3)

    low = clear_sky_radiation_hourly_eq36(ra, math.sin(math.radians(8)), 101.3, water)
    high = clear_sky_radiation_hourly_eq36(ra, math.sin(math.radians(60)), 101.3, water)

    assert low < clear_sky_radiation_hourly(ra, 0.0) < high
    assert 0 < low < high < ra


def test_thicker_air_and_wetter_air_both_let_less_through():
    sin_beta = math.sin(math.radians(30))

    thin = clear_sky_radiation_hourly_eq36(3.0, sin_beta, 80.0, 14.0)
    thick = clear_sky_radiation_hourly_eq36(3.0, sin_beta, 101.3, 14.0)
    wet = clear_sky_radiation_hourly_eq36(3.0, sin_beta, 101.3, 40.0)

    assert thin > thick > wet


def test_a_dusty_sky_lets_less_through_than_a_clean_one():
    sin_beta = math.sin(math.radians(30))
    clean = clear_sky_radiation_hourly_eq36(3.0, sin_beta, 101.3, 14.0, turbidity=1.0)
    dusty = clear_sky_radiation_hourly_eq36(3.0, sin_beta, 101.3, 14.0, turbidity=0.5)

    assert dusty < clean


# --- cloudiness -------------------------------------------------------------


def test_the_cloudiness_of_an_hour_with_sun():
    assert cloudiness_factor(2.0, 2.5) == pytest.approx(1.35 * 0.8 - 0.35)


def test_the_cloudiness_is_clamped_at_both_ends():
    # An overcast hour still loses heat...
    assert cloudiness_factor(0.0, 2.5) == 0.05
    # ...and no hour beats a clear sky, however a sensor is calibrated.
    assert cloudiness_factor(9.0, 2.5) == 1.0


def test_a_dark_hour_has_no_cloudiness_of_its_own():
    """None rather than a number: there is no ratio to take of a dark hour, and
    a function that quietly answered 0.05 is what made every night here lose a
    fourteenth of the heat FAO-56 says it loses."""
    assert cloudiness_factor(0.0, 0.0) is None
    assert cloudiness_factor(0.0, -1.0) is None


# --- the radiation balance --------------------------------------------------


def _avp(t_c, rh_pct):
    return svp_from_t(t_c) * rh_pct / 100.0


def test_a_sunlit_hour_gains_and_a_dark_one_loses():
    day = net_radiation_hourly(2.4, 3.5, 30.0, _avp(30.0, 45.0), 150.0)
    night = net_radiation_hourly(0.0, 0.0, 18.0, _avp(18.0, 85.0), 150.0)

    assert day > 0
    assert night < 0


def test_the_cloudiness_argument_is_only_for_hours_that_cannot_see():
    """A sunlit hour measured its own sky; nothing handed to it may override
    that."""
    lit = net_radiation_hourly(2.4, 3.5, 30.0, _avp(30.0, 45.0), 150.0)
    lit_told_otherwise = net_radiation_hourly(
        2.4, 3.5, 30.0, _avp(30.0, 45.0), 150.0, cloudiness=0.05
    )

    assert lit == lit_told_otherwise


def test_a_night_told_the_sky_was_clear_loses_more_than_one_told_it_was_grey():
    clear = net_radiation_hourly(
        0.0, 0.0, 18.0, _avp(18.0, 85.0), 150.0, cloudiness=1.0
    )
    overcast = net_radiation_hourly(
        0.0, 0.0, 18.0, _avp(18.0, 85.0), 150.0, cloudiness=0.05
    )

    assert clear < overcast < 0


def test_a_night_told_nothing_assumes_the_fallback():
    told_nothing = net_radiation_hourly(0.0, 0.0, 18.0, _avp(18.0, 85.0), 150.0)
    told_the_fallback = net_radiation_hourly(
        0.0, 0.0, 18.0, _avp(18.0, 85.0), 150.0, cloudiness=NIGHT_CLOUDINESS_FALLBACK
    )

    assert told_nothing == pytest.approx(told_the_fallback)


def test_a_cloudiness_out_of_range_is_clamped_rather_than_believed():
    absurd = net_radiation_hourly(
        0.0, 0.0, 18.0, _avp(18.0, 85.0), 150.0, cloudiness=7.0
    )
    clear = net_radiation_hourly(
        0.0, 0.0, 18.0, _avp(18.0, 85.0), 150.0, cloudiness=1.0
    )

    assert absurd == pytest.approx(clear)


def test_humid_air_holds_the_heat_in():
    dry = net_radiation_hourly(0.0, 0.0, 18.0, _avp(18.0, 20.0), 150.0)
    humid = net_radiation_hourly(0.0, 0.0, 18.0, _avp(18.0, 95.0), 150.0)

    assert humid > dry


def test_the_net_short_wave_is_what_the_grass_keeps():
    """Rns = (1 - albedo) Rs, isolated by taking a completely clear hour where
    the long-wave loss is known separately."""
    ra, rs = 3.5, 3.5 * 0.75
    rn = net_radiation_hourly(rs, ra, 25.0, _avp(25.0, 60.0), 0.0)
    long_wave = (1 - ALBEDO) * rs - rn

    assert long_wave > 0
    assert rn == pytest.approx((1 - ALBEDO) * rs - long_wave)


# --- the soil and the equation ----------------------------------------------


def test_the_soil_takes_a_tenth_by_day_and_gives_half_back_by_night():
    """FAO-56 Eq. 45 and 46. Not negligible at an hourly step the way it is at
    a daily one, where the two cancel."""
    assert soil_heat_flux_hourly(2.0) == pytest.approx(0.2)
    assert soil_heat_flux_hourly(-0.1) == pytest.approx(-0.05)
    assert soil_heat_flux_hourly(0.0) == 0.0


def test_more_energy_more_wind_and_drier_air_all_evaporate_more():
    base = dict(
        net_rad=1.5,
        soil_heat_flux=0.15,
        t_c=25.0,
        wind_2m=2.0,
        svp=3.17,
        avp=1.9,
        slope_svp=0.189,
        psy=0.0665,
    )
    reference = penman_monteith_hourly(**base)

    assert penman_monteith_hourly(**{**base, "net_rad": 2.5}) > reference
    assert penman_monteith_hourly(**{**base, "wind_2m": 5.0}) > reference
    assert penman_monteith_hourly(**{**base, "avp": 1.0}) > reference


def test_saturated_still_air_in_the_dark_evaporates_nothing():
    """No energy, no deficit, no wind: the only honest answer is zero."""
    value = penman_monteith_hourly(0.0, 0.0, 15.0, 0.0, 1.705, 1.705, 0.11, 0.0665)

    assert value == pytest.approx(0.0)


# --- the assembled hour -----------------------------------------------------


def _eto(**overrides):
    given = dict(
        t_c=25.0,
        rh_pct=55.0,
        wind_2m=2.0,
        solar_rad_hr=2.2,
        latitude_deg=43.6,
        longitude_deg=1.44,
        doy=MIDSUMMER,
        hour_mid=13.5,
        tz_offset_h=2.0,
        elevation_m=150.0,
    )
    given.update(overrides)
    return eto_hourly(**given)


def test_a_summer_afternoon_evaporates_a_plausible_amount():
    assert 0.2 < _eto() < 1.0


def test_the_same_hour_after_dark_evaporates_next_to_nothing():
    night = _eto(hour_mid=2.5, solar_rad_hr=0.0, t_c=16.0, rh_pct=90.0, wind_2m=0.5)

    assert -0.05 < night < 0.05


def test_a_barometer_reading_replaces_the_elevation_estimate():
    """Both are only the psychrometric constant, so the difference is small and
    must still be there: a reading that changed nothing would mean the argument
    was dropped."""
    estimated = _eto()
    measured = _eto(pressure_kpa=87.0)

    assert measured != estimated
    assert measured == pytest.approx(estimated, rel=0.1)


def test_an_impossible_humidity_is_clamped_rather_than_believed():
    """Sensors publish 105% and -3% more often than anyone would like, and a
    negative vapour pressure would take the square root in Eq. 39 down."""
    assert _eto(rh_pct=105.0) == pytest.approx(_eto(rh_pct=100.0))
    assert _eto(rh_pct=-3.0) == pytest.approx(_eto(rh_pct=0.0))


def test_a_negative_wind_or_a_negative_sun_is_read_as_none_of_it():
    assert _eto(wind_2m=-1.0) == pytest.approx(_eto(wind_2m=0.0))
    assert _eto(solar_rad_hr=-5.0) == pytest.approx(_eto(solar_rad_hr=0.0))


def test_the_hotter_drier_windier_hour_always_asks_for_more_water():
    reference = _eto()

    assert _eto(t_c=34.0) > reference
    assert _eto(rh_pct=25.0) > reference
    assert _eto(wind_2m=6.0) > reference
    assert _eto(solar_rad_hr=3.2) > reference


def test_the_night_cloudiness_reaches_the_assembled_hour():
    """The argument has to survive the assembly, not only the radiation
    function: a clear night evaporates more than an overcast one."""
    clear = _eto(hour_mid=2.5, solar_rad_hr=0.0, cloudiness=1.0)
    overcast = _eto(hour_mid=2.5, solar_rad_hr=0.0, cloudiness=0.05)

    assert clear < overcast
