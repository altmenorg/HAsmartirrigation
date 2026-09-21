"""The pressure at the site, from the sea-level pressure the services report.

OpenWeatherMap and Pirate Weather report pressure reduced to sea level. The
conversion to the site's pressure returned it all but unchanged at any height,
113 hPa too high at 1000 m. FAO-56 Eq. 7 is the reference here.
"""

import pytest

from custom_components.smart_irrigation.weathermodules.atmosphere import (
    sea_level_to_station_pressure,
)
from custom_components.smart_irrigation.weathermodules.OWMClient import OWMClient
from custom_components.smart_irrigation.weathermodules.PirateWeatherClient import (
    PirateWeatherClient,
)


@pytest.mark.parametrize(
    ("elevation", "expected"),
    # FAO-56 Annex 2 table 2.1 lists 101.3, 95.5, 90.0 and 84.6 kPa.
    [(0, 1013.25), (500, 955.5), (1000, 900.5), (1500, 848.0)],
)
def test_the_standard_atmosphere_is_reproduced(elevation, expected):
    assert sea_level_to_station_pressure(1013.25, elevation) == pytest.approx(
        expected, abs=1.0
    )


def test_the_weather_of_the_day_is_kept():
    """A low at sea level is a low at the site, in the same proportion."""
    assert sea_level_to_station_pressure(990.0, 1000) == pytest.approx(
        990.0 / 1013.25 * 900.5, abs=1.0
    )


def test_no_elevation_is_sea_level():
    assert sea_level_to_station_pressure(1013.25, None) == pytest.approx(1013.25)


@pytest.mark.parametrize("client", [OWMClient, PirateWeatherClient])
def test_both_clients_use_it(client):
    assert client.relative_to_absolute_pressure(None, 1013.25, 1000) == pytest.approx(
        900.5, abs=1.0
    )
