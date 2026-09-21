"""Tests for the hourly FAO-56 Penman-Monteith ETo engine (hourly_et).

Taken with the engine from JustChr's fork, Irrigation Plus (MIT).


Validated against FAO-56 Example 19 (Allen et al. 1998), which computes hourly
ETo for N'Diaye (16°13'N, 16°15'W, GMT) on 1 October:
  * 14:00-15:00: T=38°C, RH=52%, u2=3.3 m/s, Rs=2.450 MJ m-2 h-1 -> ETo ~ 0.63 mm/h
  * 02:00-03:00: T=28°C, RH=90%, u2=1.9 m/s, Rs=0               -> ETo ~ 0.0  mm/h
"""

import math

from custom_components.smart_irrigation.hourly_et import (
    eto_hourly,
    extraterrestrial_radiation_hourly,
    net_radiation_hourly,
    penman_monteith_hourly,
)

# N'Diaye location / date from FAO-56 Example 19.
LAT = 16.217
LON = -16.25  # 16°15' West, east-positive convention
DOY = 274  # 1 October
TZ = 0.0  # GMT


def test_pm_core_eq53_matches_example19_intermediates():
    """The Eq. 53 core, fed Example 19's intermediate values, gives ~0.63 mm/h."""
    eto = penman_monteith_hourly(
        net_rad=1.778,
        soil_heat_flux=0.178,
        t_c=38.0,
        wind_2m=3.3,
        svp=6.625,
        avp=3.445,
        slope_svp=0.358,
        psy=0.0673,
    )
    assert abs(eto - 0.634) < 0.01


def test_full_pipeline_example19_daytime():
    """Full hourly pipeline reproduces FAO-56 Example 19 daytime ETo (~0.63)."""
    eto = eto_hourly(
        t_c=38.0,
        rh_pct=52.0,
        wind_2m=3.3,
        solar_rad_hr=2.450,
        latitude_deg=LAT,
        longitude_deg=LON,
        doy=DOY,
        hour_mid=14.5,
        tz_offset_h=TZ,
        elevation_m=0.0,
    )
    assert abs(eto - 0.63) < 0.05


def test_full_pipeline_example19_nighttime_is_near_zero():
    """Night-time hour (no solar radiation) yields ~0 ETo."""
    eto = eto_hourly(
        t_c=28.0,
        rh_pct=90.0,
        wind_2m=1.9,
        solar_rad_hr=0.0,
        latitude_deg=LAT,
        longitude_deg=LON,
        doy=DOY,
        hour_mid=2.5,
        tz_offset_h=TZ,
        elevation_m=0.0,
    )
    assert 0.0 <= eto < 0.05


def test_eto_increases_with_solar_radiation():
    """More incoming solar radiation -> more evapotranspiration (daytime)."""
    kwargs = dict(
        t_c=30.0,
        rh_pct=50.0,
        wind_2m=2.0,
        latitude_deg=LAT,
        longitude_deg=LON,
        doy=DOY,
        hour_mid=12.5,
        tz_offset_h=TZ,
        elevation_m=0.0,
    )
    low = eto_hourly(solar_rad_hr=1.0, **kwargs)
    high = eto_hourly(solar_rad_hr=2.8, **kwargs)
    assert high > low > 0.0


def test_penman_monteith_clamps_negative_to_zero():
    """Strongly negative net radiation must not produce a negative ETo."""
    eto = penman_monteith_hourly(
        net_rad=-0.5,
        soil_heat_flux=-0.25,
        t_c=10.0,
        wind_2m=0.5,
        svp=1.23,
        avp=1.2,
        slope_svp=0.082,
        psy=0.0673,
    )
    assert eto == 0.0


def test_extraterrestrial_radiation_day_vs_night():
    """Ra is positive around solar noon and ~0 in the middle of the night."""
    ra_noon = extraterrestrial_radiation_hourly(LAT, LON, DOY, 12.5, TZ)
    ra_night = extraterrestrial_radiation_hourly(LAT, LON, DOY, 2.5, TZ)
    assert ra_noon > 3.0
    assert ra_night == 0.0


def test_net_radiation_positive_in_daytime():
    """With real solar input and a plausible Ra, daytime Rn is positive."""
    ra = extraterrestrial_radiation_hourly(LAT, LON, DOY, 14.5, TZ)
    rn = net_radiation_hourly(
        solar_rad_hr=2.45, ra_hr=ra, t_c=38.0, ea_kpa=3.445, elevation_m=0.0
    )
    assert rn > 0.0
    assert not math.isnan(rn)
