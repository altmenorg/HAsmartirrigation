"""The FAO-56 reference evapotranspiration equations, one hour at a time.

Written from FAO Irrigation and Drainage Paper 56 (Allen, Pereira, Raes and
Smith, 1998), which is published in full by the FAO. Every function below says
which numbered equation it is, so a reader with the paper open can check it
line by line; the equation numbers are the paper's own:

* Chapter 3, *Meteorological data* (Eq. 7, 8, 11, 13, 21-40), which gives the
  atmosphere, the vapour pressures and the radiation;
* Chapter 4, *Determination of ETo* (Eq. 53), which gives the hourly form of
  the Penman-Monteith equation;
* Annex 3, *Background on physical parameters* (Eq. 3-14 to 3-20), which gives
  the clear-sky radiation for a sun low in the sky, where the simple form of
  Eq. 37 stops describing the path the light takes.

The whole point of the hourly form is that evapotranspiration is not linear in
its terms. A cool humid night and a hot dry afternoon priced separately do not
give what their averages give, and the separate answer is the right one. The
daily equation is not wrong, it is an average of a curve.

The module is deliberately free of dependencies beyond ``math``: it is pure
arithmetic on numbers, it is the part that can be checked against a published
worked example (Example 19 of the paper, in tests/test_fao56_example_19.py),
and nothing about Home Assistant belongs in it.

Units, once, because mixing them is how this kind of code goes wrong:
temperatures in degrees Celsius, pressures in kPa, radiation in MJ m-2 h-1,
wind in m s-1 at 2 m, angles in degrees at the surface of the module and in
radians inside it, and the result in mm for the hour.
"""

import math

# Eq. 28: the solar constant, MJ m-2 min-1.
SOLAR_CONSTANT = 0.0820

# Eq. 39, hourly: the paper's daily Stefan-Boltzmann constant divided by 24,
# (4.903/24) 10-9, in MJ K-4 m-2 h-1. Using the daily one on an hourly step is
# the single easiest way to get a long-wave loss twenty-four times too large.
STEFAN_BOLTZMANN_HOURLY = 2.043e-10

# Eq. 38: the canopy reflection coefficient of the grass reference crop.
ALBEDO = 0.23

# Eq. 53: the numerator constant of the short (grass) reference for an hourly
# step. The daily form uses 900; 37 is 900/24.3 and is not something to derive,
# it is what the standardised equation says.
CN_HOURLY = 37.0

# What an hour of darkness assumes about the sky when nothing can tell it.
#
# Cloudiness comes from Rs/Rso, and after dark there is no Rs to take a ratio
# of. FAO-56 says to carry the ratio measured two to three hours before sunset
# into the night, and the row builder does exactly that when the window
# contains daylight. When it does not -- a calculation run over four hours of a
# winter night -- something has to be assumed, and this is it.
#
# 0.8 is near the clear end of the range, which is the end that loses the most
# heat. That is the deliberate choice: under-counting the long-wave loss
# over-counts the net radiation, and over-counted net radiation is water the
# garden is told it lost and did not. An assumption that waters too little is
# recoverable on the next calculation; one that waters too much is not.
NIGHT_CLOUDINESS_FALLBACK = 0.8

# Eq. 39: the ratio Rs/Rso is capped at 1 (no hour beats a clear sky), which
# puts fcd at 1.0; the lower bound keeps a heavily overcast hour from cancelling
# the long-wave term altogether.
_CLOUDINESS_MIN = 0.05
_CLOUDINESS_MAX = 1.0


def atm_pressure(elevation_m: float) -> float:
    """Atmospheric pressure at a given elevation, kPa (FAO-56 Eq. 7).

    P = 101.3 ((293 - 0.0065 z) / 293) ^ 5.26, a simplification of the ideal
    gas law for a standard atmosphere of 20 degC at sea level.
    """
    elevation = elevation_m or 0.0
    return 101.3 * math.pow((293.0 - 0.0065 * elevation) / 293.0, 5.26)


def psy_const(pressure_kpa: float) -> float:
    """Psychrometric constant, kPa degC-1 (FAO-56 Eq. 8).

    gamma = cp P / (eps lambda) = 0.665e-3 P.
    """
    return 0.665e-3 * pressure_kpa


def svp_from_t(t_c: float) -> float:
    """Saturation vapour pressure at a temperature, kPa (FAO-56 Eq. 11).

    e0(T) = 0.6108 exp(17.27 T / (T + 237.3)).

    At an hourly step this is evaluated at the hour's own mean temperature,
    which is what makes the hourly form differ from the daily one: the daily
    form has to average e0(Tmax) and e0(Tmin) precisely because the curve is
    convex and e0 of the mean would understate it.
    """
    return 0.6108 * math.exp(17.27 * t_c / (t_c + 237.3))


def delta_svp(t_c: float) -> float:
    """Slope of the saturation vapour pressure curve, kPa degC-1 (Eq. 13).

    delta = 4098 e0(T) / (T + 237.3)^2, the derivative of Eq. 11.
    """
    return 4098.0 * svp_from_t(t_c) / math.pow(t_c + 237.3, 2)


def _solar_declination(doy: int) -> float:
    """Solar declination, radians (FAO-56 Eq. 24)."""
    return 0.409 * math.sin(2.0 * math.pi * doy / 365.0 - 1.39)


def _inverse_relative_distance(doy: int) -> float:
    """Inverse relative distance Earth-Sun (FAO-56 Eq. 23)."""
    return 1.0 + 0.033 * math.cos(2.0 * math.pi * doy / 365.0)


def _seasonal_correction(doy: int) -> float:
    """Seasonal correction for solar time, hours (FAO-56 Eq. 32 and 33).

    The equation of time: the sun does not cross the meridian at noon on the
    clock, because the Earth's orbit is neither circular nor upright, and over
    a year the two drift apart by up to a quarter of an hour.
    """
    b = 2.0 * math.pi * (doy - 81) / 364.0
    return 0.1645 * math.sin(2.0 * b) - 0.1255 * math.cos(b) - 0.025 * math.sin(b)


def _solar_time_angle(
    longitude_deg: float, doy: int, hour_mid: float, tz_offset_h: float
) -> float:
    """Solar time angle at the midpoint of the hour, radians (Eq. 31).

    omega = pi/12 [(t + 0.06667 (Lz - Lm) + Sc) - 12], negative before solar
    noon and positive after it.

    The paper counts longitudes *west* of Greenwich, and names the centre of
    the time zone rather than its offset from UTC. Both are translated here, at
    the one place that needs it: ``Lz = -15 tz_offset_h`` (a zone one hour
    behind Greenwich is centred on 15 degrees west) and ``Lm = -longitude``.

    That translation is where this equation gets misused. Feeding it a UTC
    offset in place of Lz, or a signed longitude in place of Lm, moves the sun
    by hours and shows up as an evapotranspiration curve that peaks at the
    wrong time of day while still summing to something plausible.
    """
    lz = -15.0 * (tz_offset_h or 0.0)
    lm = -longitude_deg
    correction = _seasonal_correction(doy)
    return (math.pi / 12.0) * (hour_mid + 0.06667 * (lz - lm) + correction - 12.0)


def solar_elevation_sin(
    latitude_deg: float,
    longitude_deg: float,
    doy: int,
    hour_mid: float,
    tz_offset_h: float,
) -> float:
    """Sine of the sun's angle above the horizon at the hour's midpoint.

    FAO-56 Annex 3, Eq. 3-15:

        sin(beta) = sin(phi) sin(delta) + cos(phi) cos(delta) cos(omega)

    Negative when the sun is below the horizon, which callers read as night
    rather than clamping, because the sign is the answer to "is it dark".
    """
    phi = math.radians(latitude_deg)
    declination = _solar_declination(doy)
    omega = _solar_time_angle(longitude_deg, doy, hour_mid, tz_offset_h)
    return math.sin(phi) * math.sin(declination) + math.cos(phi) * math.cos(
        declination
    ) * math.cos(omega)


def extraterrestrial_radiation_hourly(
    latitude_deg: float,
    longitude_deg: float,
    doy: int,
    hour_mid: float,
    tz_offset_h: float,
) -> float:
    """Extraterrestrial radiation over one clock hour, MJ m-2 h-1 (Eq. 28).

        Ra = (12 (60) / pi) Gsc dr [(w2 - w1) sin(phi) sin(delta)
                                    + cos(phi) cos(delta) (sin(w2) - sin(w1))]

    with the hour's start and end angles w1 and w2 from Eq. 29 and 30, one hour
    apart, and dr from Eq. 23.

    This is the sun at the top of the atmosphere: the ceiling everything else
    is measured against. It goes negative at night, which is the equation
    speaking about an hour that is not there rather than a physical quantity;
    callers clamp it at zero. Returning the raw value keeps the sign available
    to anyone who wants to know how far below the horizon the hour sits.
    """
    phi = math.radians(latitude_deg)
    declination = _solar_declination(doy)
    dr = _inverse_relative_distance(doy)
    omega = _solar_time_angle(longitude_deg, doy, hour_mid, tz_offset_h)
    # Eq. 29 and 30 with t1 = 1 hour: half an hour either side of the midpoint.
    omega1 = omega - math.pi / 24.0
    omega2 = omega + math.pi / 24.0
    return (
        (12.0 * 60.0 / math.pi)
        * SOLAR_CONSTANT
        * dr
        * (
            (omega2 - omega1) * math.sin(phi) * math.sin(declination)
            + math.cos(phi)
            * math.cos(declination)
            * (math.sin(omega2) - math.sin(omega1))
        )
    )


def clear_sky_radiation_hourly(ra_hr: float, elevation_m: float) -> float:
    """Clear-sky radiation of the hour, MJ m-2 h-1 (FAO-56 Eq. 37).

        Rso = (0.75 + 2e-5 z) Ra

    Beer's law linearised in the station elevation, valid below 6000 m and
    derived assuming the sun sits about 50 degrees above the horizon. It is the
    form the paper's own worked examples use, so it is the one the long-wave
    term uses here: a long-wave loss computed against a different clear sky
    from the one the example publishes is not comparable with it.
    """
    return (0.75 + 2e-5 * (elevation_m or 0.0)) * ra_hr


def clear_sky_radiation_hourly_eq36(
    ra_hr: float,
    sin_beta: float,
    pressure_kpa: float,
    precipitable_water_mm: float,
    turbidity: float = 1.0,
) -> float:
    """Clear-sky radiation for a low sun, MJ m-2 h-1 (Annex 3, Eq. 3-17/3-20).

        Rso = (KB + KD) Ra
        KB = 0.98 exp[-0.00146 P / (Kt sin(beta)) - 0.091 (W / sin(beta))^0.25]
        KD = 0.35 - 0.33 KB   for KB >= 0.15
        KD = 0.18 + 0.82 KB   for KB < 0.15

    Eq. 37 assumes a sun 50 degrees up. Early and late in the day the light
    takes a far longer path through the atmosphere than that, and Eq. 37 then
    promises a clear sky brighter than any clear sky is. This form uses the
    pressure as the atmospheric mass and the precipitable water as the
    absorber, so it follows the sun down instead.

    Zero when there is no sun to attenuate: the exponent divides by sin(beta),
    which is where an unguarded implementation raises or returns a number
    larger than the extraterrestrial radiation itself.
    """
    if ra_hr <= 0 or sin_beta <= 0:
        return 0.0
    kt = turbidity if turbidity and turbidity > 0 else 1.0
    water = max(0.0, precipitable_water_mm or 0.0)
    kb = 0.98 * math.exp(
        -0.00146 * pressure_kpa / (kt * sin_beta)
        - 0.091 * math.pow(water / sin_beta, 0.25)
    )
    kd = 0.35 - 0.33 * kb if kb >= 0.15 else 0.18 + 0.82 * kb
    return (kb + kd) * ra_hr


def precipitable_water(avp_kpa: float, pressure_kpa: float) -> float:
    """Precipitable water in the atmosphere, mm (FAO-56 Annex 3, Eq. 3-19).

    W = 0.14 ea P + 2.1
    """
    return 0.14 * max(0.0, avp_kpa) * pressure_kpa + 2.1


def cloudiness_factor(solar_rad_hr: float, rso_hr: float):
    """The cloudiness term of Eq. 39, or None when the hour has no sun.

        fcd = 1.35 Rs/Rso - 0.35

    clamped into [0.05, 1.0] because the ratio itself is capped at 1 (no hour
    beats a clear sky) and because an overcast hour still loses heat.

    None, not a number, when Rso is zero or below. There is no ratio to take of
    a dark hour, and saying so is the whole reason this returns an option
    rather than a value: the caller has to decide what the night borrows, and a
    function that quietly answered 0.05 is what made every night here lose a
    fourteenth of the heat the paper says it loses.
    """
    if rso_hr <= 0:
        return None
    ratio = min(1.0, max(0.0, solar_rad_hr / rso_hr))
    return min(_CLOUDINESS_MAX, max(_CLOUDINESS_MIN, 1.35 * ratio - 0.35))


def net_radiation_hourly(
    solar_rad_hr: float,
    ra_hr: float,
    t_c: float,
    ea_kpa: float,
    elevation_m: float = 0.0,
    cloudiness=None,
) -> float:
    """Net radiation of the hour, MJ m-2 h-1 (FAO-56 Eq. 40, hourly).

    Rn = Rns - Rnl, with the net short wave of Eq. 38, Rns = (1 - alpha) Rs,
    and the net long wave of Eq. 39 evaluated hourly:

        Rnl = sigma_hr T_K^4 (0.34 - 0.14 sqrt(ea)) fcd

    Three things make this the hourly form rather than the daily one: the
    hourly Stefan-Boltzmann constant, the hour's own mean temperature in place
    of the average of Tmax^4 and Tmin^4, and a cloudiness that an hour of
    darkness cannot measure for itself.

    That last one is what ``cloudiness`` is for. When the hour has sun, fcd
    comes from its own Rs/Rso and the argument is ignored. When it has none,
    the argument is used -- the row builder hands over the ratio the window's
    daylight measured, which is what FAO-56 instructs -- and
    ``NIGHT_CLOUDINESS_FALLBACK`` stands in when even that is unavailable.
    """
    rns = (1.0 - ALBEDO) * max(0.0, solar_rad_hr)
    rso = clear_sky_radiation_hourly(max(0.0, ra_hr), elevation_m)
    fcd = cloudiness_factor(max(0.0, solar_rad_hr), rso)
    if fcd is None:
        fcd = cloudiness if cloudiness is not None else NIGHT_CLOUDINESS_FALLBACK
    fcd = min(_CLOUDINESS_MAX, max(_CLOUDINESS_MIN, fcd))
    temperature_k = t_c + 273.16
    emissivity = 0.34 - 0.14 * math.sqrt(max(0.0, ea_kpa))
    rnl = STEFAN_BOLTZMANN_HOURLY * math.pow(temperature_k, 4) * emissivity * fcd
    return rns - rnl


def penman_monteith_hourly(
    net_rad: float,
    soil_heat_flux: float,
    t_c: float,
    wind_2m: float,
    svp: float,
    avp: float,
    slope_svp: float,
    psy: float,
) -> float:
    """Reference evapotranspiration of one hour, mm (FAO-56 Eq. 53).

                0.408 delta (Rn - G) + gamma (37 / (T + 273)) u2 (es - ea)
        ETo = -----------------------------------------------------------
                            delta + gamma (1 + 0.34 u2)

    The short (grass) reference, standing for a surface resistance of 70 s/m
    held constant through the day. The paper is explicit that this constant
    slightly under-predicts by day and over-predicts in the evening, and that
    the two compensate when the hours are summed over a day, which is exactly
    how this is used.

    Note the 273 here against the 273.16 in the long-wave term: both are the
    paper's, in the equations they belong to, and unifying them would be a
    tidier module that no longer reproduces Example 19.
    """
    numerator = 0.408 * slope_svp * (net_rad - soil_heat_flux) + psy * (
        CN_HOURLY / (t_c + 273.0)
    ) * wind_2m * (svp - avp)
    denominator = slope_svp + psy * (1.0 + 0.34 * wind_2m)
    if denominator == 0:
        return 0.0
    return numerator / denominator


def soil_heat_flux_hourly(net_rad: float) -> float:
    """Soil heat flux of the hour, MJ m-2 h-1 (FAO-56 Eq. 45 and 46).

    A tenth of the net radiation while the sun is up, half of it after dark.
    It is not negligible at an hourly step the way it is at a daily one: over a
    day the ground gives back at night what it took in by day, which is why the
    daily equation drops the term altogether (Eq. 42) and the hourly one
    cannot.
    """
    return 0.1 * net_rad if net_rad > 0 else 0.5 * net_rad


def eto_hourly(
    *,
    t_c: float,
    rh_pct: float,
    wind_2m: float,
    solar_rad_hr: float,
    latitude_deg: float,
    longitude_deg: float,
    doy: int,
    hour_mid: float,
    tz_offset_h: float,
    elevation_m: float = 0.0,
    pressure_kpa=None,
    cloudiness=None,
) -> float:
    """Reference evapotranspiration of one hour, mm, from what a sensor reads.

    Keyword-only on purpose: there are eleven arguments, several of them bare
    floats in the same range, and a caller that swapped latitude and longitude
    positionally would get a number rather than an error.

    Assembles the module: the vapour pressures from the temperature and the
    humidity (Eq. 11 and 54), the pressure from the elevation when no barometer
    reports one (Eq. 7), the radiation balance (Eq. 28, 37, 38, 39), the soil
    heat flux (Eq. 45 and 46) and the equation itself (Eq. 53).
    """
    svp = svp_from_t(t_c)
    humidity = min(100.0, max(0.0, rh_pct))
    # Eq. 54: ea = e0(Thr) RHhr / 100.
    avp = svp * humidity / 100.0
    pressure = pressure_kpa if pressure_kpa else atm_pressure(elevation_m)
    slope = delta_svp(t_c)
    psy = psy_const(pressure)
    ra_hr = max(
        0.0,
        extraterrestrial_radiation_hourly(
            latitude_deg, longitude_deg, doy, hour_mid, tz_offset_h
        ),
    )
    net_rad = net_radiation_hourly(
        max(0.0, solar_rad_hr), ra_hr, t_c, avp, elevation_m, cloudiness
    )
    eto = penman_monteith_hourly(
        net_rad,
        soil_heat_flux_hourly(net_rad),
        t_c,
        max(0.0, wind_2m),
        svp,
        avp,
        slope,
        psy,
    )
    # Never below zero. On a calm humid night the equation returns a small
    # negative: the radiation term is negative because the surface loses more
    # heat than it receives, and there is not enough wind and dryness to offset
    # it. That is condensation, and it is real -- but it is dew on the leaves,
    # not water in the root zone, and it evaporates in the morning. Summed over
    # a night it credited the water balance with rain that never fell: a zone
    # at -1.57 mm read -1.53 mm by dawn, which is a bucket gaining water on a
    # dry night (#866). FAO-56's own worked example prints 0.00 mm for exactly
    # such an hour.
    return max(0.0, eto)
