"""The live estimate of a zone that looks ahead uses the forecast in hand
(phase 1.16).

It was always estimated without the forecast, so for such a zone it
disagreed with the calculation it previews: "would water 4 min" on one page,
"nothing to water" on the other. It now uses the forecast the service sent
with its last reading, and never asks for a new one.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation.live_estimate import LiveEstimateMixin
from custom_components.smart_irrigation.weathermodules.OpenMeteoClient import (
    OpenMeteoClient,
)


class _Coordinator(LiveEstimateMixin):
    def __init__(self, forecast_days, cached):
        self.use_weather_service = True
        self._WeatherServiceClient = MagicMock()
        self._WeatherServiceClient.get_cached_forecast_data = MagicMock(
            return_value=cached
        )
        module = MagicMock()
        module.forecast_days = forecast_days
        self.getModuleInstanceByID = AsyncMock(return_value=module)
        self.module_id_for_zone = MagicMock(return_value=0)


@pytest.mark.asyncio
async def test_a_zone_looking_ahead_gets_the_forecast_in_hand():
    coordinator = _Coordinator(forecast_days=2, cached=[{"day": 1}])
    assert await coordinator._cached_forecast_for({}) == [{"day": 1}]


@pytest.mark.asyncio
async def test_a_zone_that_does_not_look_ahead_gets_none():
    coordinator = _Coordinator(forecast_days=0, cached=[{"day": 1}])
    assert await coordinator._cached_forecast_for({}) is None
    coordinator._WeatherServiceClient.get_cached_forecast_data.assert_not_called()


def test_the_cached_forecast_never_fetches():
    client = OpenMeteoClient.__new__(OpenMeteoClient)
    client._cached_doc = None
    with patch.object(OpenMeteoClient, "_request") as request:
        assert client.get_cached_forecast_data() is None
    request.assert_not_called()
