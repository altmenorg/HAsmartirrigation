"""Internal validation functions.

:copyright: (c) 2015 by Mark Richards.
:license: BSD 3-Clause, see LICENSE.txt for more details.
"""

from .convert import deg2rad

# Internal constants
# Latitude
_MINLAT_RADIANS = deg2rad(-90.0)
_MAXLAT_RADIANS = deg2rad(90.0)

# Solar declination
_MINSOLDEC_RADIANS = deg2rad(-23.5)
_MAXSOLDEC_RADIANS = deg2rad(23.5)

# Sunset hour angle
_MINSHA_RADIANS = 0.0
_MAXSHA_RADIANS = deg2rad(180)


def check_day_hours(hours, arg_name):
    """Check that *hours* is in the range 1 to 24."""
    if not 0 <= hours <= 24:
        raise ValueError(f"{arg_name} should be in range 0-24: {hours!r}")


def check_doy(doy):
    """Check day of the year is valid."""
    if not 1 <= doy <= 366:
        raise ValueError(f"Day of the year (doy) must be in range 1-366: {doy!r}")


def check_latitude_rad(latitude):
    if not _MINLAT_RADIANS <= latitude <= _MAXLAT_RADIANS:
        raise ValueError(
            f"latitude outside valid range {_MINLAT_RADIANS!r} to {_MAXLAT_RADIANS!r} rad: {latitude!r}"
        )


def check_sol_dec_rad(sd):
    """Solar declination can vary between -23.5 and +23.5 degrees.

    See http://mypages.iit.edu/~maslanka/SolarGeo.pdf
    """
    if not _MINSOLDEC_RADIANS <= sd <= _MAXSOLDEC_RADIANS:
        raise ValueError(
            f"solar declination outside valid range {_MINSOLDEC_RADIANS!r} to {_MAXSOLDEC_RADIANS!r} rad: {sd!r}"
        )


def check_sunset_hour_angle_rad(sha):
    """Sunset hour angle has the range 0 to 180 degrees.

    See http://mypages.iit.edu/~maslanka/SolarGeo.pdf
    """
    if not _MINSHA_RADIANS <= sha <= _MAXSHA_RADIANS:
        raise ValueError(
            f"sunset hour angle outside valid range {_MINSHA_RADIANS!r} to {_MAXSHA_RADIANS!r} rad: {sha!r}"
        )
