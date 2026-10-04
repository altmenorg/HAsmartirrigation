"""The luminous efficacy follows the sky (Muneer and Kinghorn, 1997)."""

import datetime as dt
import math
from unittest.mock import MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, illuminance
from custom_components.smart_irrigation.hourly_et import solar_elevation_sin


def test_the_efficacy_is_the_published_polynomial():
    """Kg = 136.6 - 74.541 Kt + 57.3421 Kt^2, evaluated by hand."""
    assert illuminance.global_luminous_efficacy(0.0) == pytest.approx(136.6)
    assert illuminance.global_luminous_efficacy(0.5) == pytest.approx(
        113.6650, abs=1e-3
    )
    assert illuminance.global_luminous_efficacy(1.0) == pytest.approx(
        119.4011, abs=1e-3
    )


def test_the_efficacy_stays_within_what_daylight_does():
    """Between a clear and an overcast sky: roughly 110 to 137 lm/W."""
    values = [illuminance.global_luminous_efficacy(k / 20) for k in range(21)]
    assert min(values) > 110 and max(values) < 137


def test_the_result_is_the_radiation_that_gives_the_lux_back():
    """Whatever the sky, radiation x efficacy(Kt) must be the lux that went in."""
    sin_elev = math.sin(math.radians(50))
    ra = illuminance.extraterrestrial_horizontal(sin_elev, 172)
    for lux in (5_000, 20_000, 60_000, 90_000):
        watts = illuminance.radiation_from_illuminance(lux, sin_elev, 172)
        kt = watts / ra
        assert watts * illuminance.global_luminous_efficacy(kt) == pytest.approx(
            lux, rel=1e-6
        )


def test_a_brighter_reading_never_gives_less_radiation():
    sin_elev = math.sin(math.radians(35))
    previous = 0.0
    for lux in range(0, 100_001, 2_500):
        watts = illuminance.radiation_from_illuminance(lux, sin_elev, 100)
        assert watts >= previous
        previous = watts


def test_a_clear_summer_noon_gives_a_plausible_radiation():
    """About 100 000 lux at a high sun is some 850 W/m2, not 600 and not 1100."""
    sin_elev = math.sin(math.radians(65))
    watts = illuminance.radiation_from_illuminance(100_000, sin_elev, 172)
    assert 800 < watts < 900


def test_the_same_light_means_more_radiation_when_the_sun_is_low():
    """Lux are mostly the visible part; the model reads a bright sky at a low sun
    as a clearer one, so the answer stays below the ceiling above the horizon."""
    sin_elev = math.sin(math.radians(15))
    ra = illuminance.extraterrestrial_horizontal(sin_elev, 355)
    watts = illuminance.radiation_from_illuminance(20_000, sin_elev, 355)
    assert 0 < watts <= ra


def test_a_reading_beyond_the_clearest_sky_is_capped_not_invented():
    sin_elev = math.sin(math.radians(20))
    watts = illuminance.radiation_from_illuminance(500_000, sin_elev, 172)
    assert watts == pytest.approx(500_000 / illuminance.global_luminous_efficacy(1.0))


def test_a_sun_too_low_to_judge_the_sky_uses_the_middle_of_the_range():
    sin_elev = math.sin(math.radians(2))
    assert illuminance.radiation_from_illuminance(
        1_000, sin_elev, 100
    ) == pytest.approx(1_000 / illuminance.default_luminous_efficacy())


def test_night_is_no_radiation():
    assert illuminance.radiation_from_illuminance(0, -0.5, 100) == 0.0
    assert illuminance.radiation_from_illuminance(3, -0.5, 100) == pytest.approx(
        3 / illuminance.default_luminous_efficacy()
    )


def test_the_season_enters_through_the_sun():
    """The same lux at noon in June and in December are not the same radiation:
    the winter sun is low and its light is read against a smaller ceiling."""
    summer = illuminance.radiation_from_illuminance(
        30_000, math.sin(math.radians(65)), 172
    )
    winter = illuminance.radiation_from_illuminance(
        30_000, math.sin(math.radians(19)), 355
    )
    assert winter != pytest.approx(summer, rel=0.01)


def _coordinator(latitude, longitude):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    coordinator._effective_latitude = latitude
    coordinator._effective_longitude = longitude
    return coordinator


def test_the_coordinator_reads_the_sun_where_the_garden_is():
    """Saint-Lumine-de-Coutais, noon UTC on 4 October: the sun stands some 38
    degrees up, and 40 000 lux is read against that, not against a constant."""
    coordinator = _coordinator(47.05, -1.73)
    moment = dt.datetime(2026, 10, 4, 12, 0, tzinfo=dt.timezone.utc)

    doy = moment.timetuple().tm_yday
    sin_elev = solar_elevation_sin(47.05, -1.73, doy, 12.0, 0.0)
    assert 35 < math.degrees(math.asin(sin_elev)) < 42

    watts = coordinator.radiation_from_illuminance(40_000, {}, when=moment)
    assert watts == pytest.approx(
        illuminance.radiation_from_illuminance(40_000, sin_elev, doy)
    )
    assert watts != pytest.approx(40_000 / illuminance.default_luminous_efficacy())


def test_the_same_light_at_night_on_the_other_side_of_the_world_is_dark_there():
    """Longitude counts: at the same UTC instant the sun is up in one place and
    down in the other."""
    moment = dt.datetime(2026, 6, 21, 12, 0, tzinfo=dt.timezone.utc)
    here = _coordinator(47.0, 0.0).radiation_from_illuminance(30_000, {}, when=moment)
    there = _coordinator(47.0, 180.0).radiation_from_illuminance(
        30_000, {}, when=moment
    )
    assert here != pytest.approx(there, rel=0.01)
