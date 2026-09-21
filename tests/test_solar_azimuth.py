"""The sun's azimuth, and the trigger that waits for it.

The hand-written azimuth applied the longitude with the wrong sign and left out
the equation of time: the sun came out 9 degrees off in western France, 48 in
Berlin and over 100 in California or Australia. The trigger also handed it the
local time where it expected UTC, which moved it again by the time zone's
offset. A solar azimuth trigger fired hours from the moment it was set for,
everywhere but near Greenwich in winter.

The reference here is solar noon, worked out by hand: the sun is due south of a
northern site and due north of a southern one when the local solar time is
12:00, that is at 12:00 UTC minus 4 minutes per degree of east longitude, minus
the equation of time. Around 21 June the equation of time is about -1.7 minutes
(the sun runs slow), so noon comes 1.7 minutes later.
"""

from datetime import datetime, timedelta, timezone

import pytest

from custom_components.smart_irrigation.helpers import (
    calculate_solar_azimuth,
    find_next_solar_azimuth_time,
)

EQUATION_OF_TIME_21_JUNE_MIN = -1.7


def _solar_noon_utc(longitude, day=datetime(2026, 6, 21, tzinfo=timezone.utc)):
    minutes = 12 * 60 - 4 * longitude - EQUATION_OF_TIME_21_JUNE_MIN
    return day + timedelta(minutes=minutes)


SITES = [
    # name, latitude, longitude, azimuth at solar noon
    ("Nantes", 47.05, -1.73, 180.0),
    ("Berlin", 52.52, 13.40, 180.0),
    ("Los Angeles", 34.05, -118.24, 180.0),
    ("Sydney", -33.87, 151.21, 0.0),
]


def _gap(a, b):
    """Signed difference of two bearings, in (-180, 180]."""
    return (a - b + 180) % 360 - 180


@pytest.mark.parametrize(("name", "lat", "lon", "noon_azimuth"), SITES)
def test_the_sun_is_due_south_or_north_at_solar_noon(name, lat, lon, noon_azimuth):
    azimuth = calculate_solar_azimuth(lat, lon, _solar_noon_utc(lon))

    assert abs(_gap(azimuth, noon_azimuth)) < 2.0, name


@pytest.mark.parametrize(("name", "lat", "lon", "noon_azimuth"), SITES)
def test_the_sun_is_east_in_the_morning_and_west_in_the_afternoon(
    name, lat, lon, noon_azimuth
):
    noon = _solar_noon_utc(lon)
    morning = calculate_solar_azimuth(lat, lon, noon - timedelta(hours=3))
    afternoon = calculate_solar_azimuth(lat, lon, noon + timedelta(hours=3))

    assert 0 < morning < 180, name
    assert 180 < afternoon < 360, name


def test_a_naive_time_is_read_as_utc():
    noon = _solar_noon_utc(13.40)

    assert calculate_solar_azimuth(52.52, 13.40, noon.replace(tzinfo=None)) == (
        pytest.approx(calculate_solar_azimuth(52.52, 13.40, noon))
    )


def test_a_local_time_gives_the_same_sun_as_the_same_instant_in_utc():
    noon = _solar_noon_utc(13.40)
    berlin_summer = timezone(timedelta(hours=2))

    assert calculate_solar_azimuth(
        52.52, 13.40, noon.astimezone(berlin_summer)
    ) == pytest.approx(calculate_solar_azimuth(52.52, 13.40, noon))


@pytest.mark.parametrize(("name", "lat", "lon", "noon_azimuth"), SITES)
def test_the_next_time_the_sun_reaches_an_azimuth_is_found(
    name, lat, lon, noon_azimuth
):
    noon = _solar_noon_utc(lon)

    found = find_next_solar_azimuth_time(
        lat, lon, noon_azimuth, noon - timedelta(hours=6)
    )

    assert found is not None, name
    assert abs((found - noon).total_seconds()) < 3 * 60, name
