"""The daily and hourly calculations price the same site.

Open-Meteo got the configured elevation on its daily request only, so its
hourly series were downscaled for its own terrain model (#1073). PyETO's daily
equation read Home Assistant's latitude and elevation even with manual
coordinates, which the hourly equation honoured (#1076).
"""

from types import SimpleNamespace
from unittest.mock import patch

from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.weathermodules import OpenMeteoClient as om
from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    OpenMeteoClient,
)


def _sent(client, params):
    """The parameters the client actually sends for ``params``."""
    seen = []

    def fetch(sent):
        seen.append(sent)
        return {"hourly": {}}, 200, None

    om._recent.clear()
    with patch.object(OpenMeteoClient, "_fetch", side_effect=fetch):
        client._request(params)
    return seen[0]


def test_an_hourly_request_carries_the_configured_elevation():
    client = OpenMeteoClient(latitude=46.5, longitude=7.9, elevation=1650)
    sent = _sent(client, {"latitude": 46.5, "longitude": 7.9, "hourly": "et0"})
    assert sent["elevation"] == 1650


def test_the_daily_request_keeps_its_own_elevation():
    client = OpenMeteoClient(latitude=46.5, longitude=7.9, elevation=1650)
    assert _sent(client, client._params())["elevation"] == 1650


def test_no_elevation_is_invented_when_none_is_configured():
    client = OpenMeteoClient(latitude=46.5, longitude=7.9, elevation=None)
    sent = _sent(client, {"latitude": 46.5, "longitude": 7.9, "hourly": "et0"})
    assert "elevation" not in sent


def test_the_daily_module_uses_the_effective_site():
    coordinator = SimpleNamespace(_effective_latitude=-41.3, _effective_elevation=420)
    module = SimpleNamespace(_latitude=52.0, _elevation=10)
    CalculationMixin._place_module(coordinator, module)
    assert module._latitude == -41.3
    assert module._elevation == 420


def test_a_module_without_a_site_is_left_alone():
    coordinator = SimpleNamespace(_effective_latitude=-41.3, _effective_elevation=420)
    module = SimpleNamespace()
    CalculationMixin._place_module(coordinator, module)
    assert not hasattr(module, "_latitude")
    CalculationMixin._place_module(coordinator, None)
