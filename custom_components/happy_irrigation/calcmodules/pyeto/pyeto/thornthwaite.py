"""Calculate potential evapotranspiration using the Thornthwaite (1948 method)

:copyright: (c) 2015 by Mark Richards.
:license: BSD 3-Clause, see LICENSE.txt for more details.

References:
----------
Thornthwaite CW (1948) An approach toward a rational classification of
    climate. Geographical Review, 38, 55-94.

"""

import calendar

from . import fao
from ._check import check_latitude_rad as _check_latitude_rad

_MONTHDAYS = (31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)
_LEAP_MONTHDAYS = (31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31)


def thornthwaite(monthly_t, monthly_mean_dlh, year=None):
    """Estimate monthly potential evapotranspiration (PET) using the
    Thornthwaite (1948) method.

    Thornthwaite equation:

        *PET* = 1.6 (*L*/12) (*N*/30) (10*Ta* / *I*)***a*

    where:

    * *Ta* is the mean daily air temperature [deg C, if negative use 0] of the
      month being calculated
    * *N* is the number of days in the month being calculated
    * *L* is the mean day length [hours] of the month being calculated
    * *a* = (6.75 x 10-7)*I***3 - (7.71 x 10-5)*I***2 + (1.792 x 10-2)*I* + 0.49239
    * *I* is a heat index which depends on the 12 monthly mean temperatures and
      is calculated as the sum of (*Tai* / 5)**1.514 for each month, where
      Tai is the air temperature for each month in the year

    :param monthly_t: Iterable containing mean daily air temperature for each
        month of the year [deg C].
    :param monthly_mean_dlh: Iterable containing mean daily daylight
        hours for each month of the year (hours]. These can be calculated
        using ``monthly_mean_daylight_hours()``.
    :param year: Year for which PET is required. The only effect of year is
        to change the number of days in February to 29 if it is a leap year.
        If it is left as the default (None), then the year is assumed not to
        be a leap year.
    :return: Estimated monthly potential evaporation of each month of the year
        [mm/month]
    :rtype: List of floats
    """
    if len(monthly_t) != 12:
        raise ValueError(
            f"monthly_t should be length 12 but is length {len(monthly_t)}."
        )
    if len(monthly_mean_dlh) != 12:
        raise ValueError(
            f"monthly_mean_dlh should be length 12 but is length {len(monthly_mean_dlh)}."
        )

    if year is None or not calendar.isleap(year):
        month_days = _MONTHDAYS
    else:
        month_days = _LEAP_MONTHDAYS

    # Negative temperatures should be set to zero
    adj_monthly_t = [t * (t >= 0) for t in monthly_t]

    # Calculate the heat index (I)
    I = 0.0  # noqa: E741
    for Tai in adj_monthly_t:
        if Tai / 5.0 > 0.0:
            I += (Tai / 5.0) ** 1.514  # noqa: E741

    a = (6.75e-07 * I**3) - (7.71e-05 * I**2) + (1.792e-02 * I) + 0.49239

    pet = []
    for Ta, L, N in zip(adj_monthly_t, monthly_mean_dlh, month_days, strict=False):
        # Multiply by 10 to convert cm/month --> mm/month
        pet.append(1.6 * (L / 12.0) * (N / 30.0) * ((10.0 * Ta / I) ** a) * 10.0)

    return pet


def monthly_mean_daylight_hours(latitude, year=None):
    """Calculate mean daylight hours for each month of the year for a given
    latitude.

    :param latitude: Latitude [radians]
    :param year: Year for the daylight hours are required. The only effect of
        *year* is to change the number of days in Feb to 29 if it is a leap
        year. If left as the default, None, then a normal (non-leap) year is
        assumed.
    :return: Mean daily daylight hours of each month of a year [hours]
    :rtype: List of floats.
    """
    _check_latitude_rad(latitude)

    if year is None or not calendar.isleap(year):
        month_days = _MONTHDAYS
    else:
        month_days = _LEAP_MONTHDAYS
    monthly_mean_dlh = []
    doy = 1  # Day of the year
    for mdays in month_days:
        dlh = 0.0  # Cumulative daylight hours for the month
        for _ in range(1, mdays + 1):
            sd = fao.sol_dec(doy)
            sha = fao.sunset_hour_angle(latitude, sd)
            dlh += fao.daylight_hours(sha)
            doy += 1
        # Calc mean daylight hours of the month
        monthly_mean_dlh.append(dlh / mdays)
    return monthly_mean_dlh
