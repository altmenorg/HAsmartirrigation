"""Test Smart Irrigation weather modules."""

from unittest.mock import AsyncMock

import pytest
from aiohttp import ClientError

from custom_components.smart_irrigation.helpers import CannotConnect, InvalidAuth
from custom_components.smart_irrigation.weathermodules.OWMClient import OWMClient
from custom_components.smart_irrigation.weathermodules.PirateWeatherClient import (
    PirateWeatherClient,
)


class TestOWMClient:
    """Test OpenWeatherMap client."""

    def test_owm_client_init(self) -> None:
        """Test OWM client initialization."""
        session = AsyncMock()
        api_key = "validate_api_key"
        api_version = "3.0"

        client = OWMClient(session, api_key, api_version)

        assert client.session == session
        assert client.api_key == api_key
        assert client.api_version == api_version

    async def test_owm_client_get_current_weather_success(self) -> None:
        """Test OWM client get current weather success."""
        session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "main": {
                "temp": 25.0,
                "humidity": 60,
                "pressure": 1013.25,
            },
            "wind": {"speed": 5.0},
            "weather": [{"main": "Clear"}],
        }
        session.get.return_value.__aenter__.return_value = mock_response

        client = OWMClient(session, "validate_api_key", "3.0")

        weather_data = await client.get_current_weather(52.0, 5.0)

        assert weather_data["temperature"] == 25.0
        assert weather_data["humidity"] == 60
        assert weather_data["pressure"] == 1013.25
        assert weather_data["wind_speed"] == 5.0

    async def test_owm_client_get_current_weather_error(self) -> None:
        """Test OWM client get current weather with error."""
        session = AsyncMock()
        session.get.side_effect = ClientError("Connection error")

        client = OWMClient(session, "validate_api_key", "3.0")

        with pytest.raises(ClientError):
            await client.get_current_weather(52.0, 5.0)

    async def test_owm_client_get_forecast_success(self) -> None:
        """Test OWM client get forecast success."""
        session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "list": [
                {
                    "main": {
                        "temp": 25.0,
                        "humidity": 60,
                        "pressure": 1013.25,
                    },
                    "wind": {"speed": 5.0},
                    "weather": [{"main": "Clear"}],
                    "dt": 1234567890,
                }
            ]
        }
        session.get.return_value.__aenter__.return_value = mock_response

        client = OWMClient(session, "validate_api_key", "3.0")

        forecast_data = await client.get_forecast(52.0, 5.0)

        assert len(forecast_data) > 0
        assert forecast_data[0]["temperature"] == 25.0


class TestPirateWeatherClient:
    """Test Pirate Weather client."""

    def test_pirate_weather_client_init(self) -> None:
        """Test Pirate Weather client initialization."""
        session = AsyncMock()
        api_key = "validate_api_key"

        client = PirateWeatherClient(session, api_key)

        assert client.session == session
        assert client.api_key == api_key

    async def test_pirate_weather_client_get_current_weather_success(self) -> None:
        """Test Pirate Weather client get current weather success."""
        session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "currently": {
                "temperature": 25.0,
                "humidity": 0.6,
                "pressure": 1013.25,
                "windSpeed": 5.0,
                "visibility": 10.0,
            }
        }
        session.get.return_value.__aenter__.return_value = mock_response

        client = PirateWeatherClient(session, "validate_api_key")

        weather_data = await client.get_current_weather(52.0, 5.0)

        assert weather_data["temperature"] == 25.0
        assert weather_data["humidity"] == 60  # Converted from 0.6 to percentage
        assert weather_data["pressure"] == 1013.25
        assert weather_data["wind_speed"] == 5.0

    async def test_pirate_weather_client_get_forecast_success(self) -> None:
        """Test Pirate Weather client get forecast success."""
        session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = {
            "daily": {
                "data": [
                    {
                        "temperatureHigh": 30.0,
                        "temperatureLow": 20.0,
                        "humidity": 0.6,
                        "pressure": 1013.25,
                        "windSpeed": 5.0,
                        "precipIntensity": 0.0,
                        "time": 1234567890,
                    }
                ]
            }
        }
        session.get.return_value.__aenter__.return_value = mock_response

        client = PirateWeatherClient(session, "validate_api_key")

        forecast_data = await client.get_forecast(52.0, 5.0, days=5)

        assert len(forecast_data) > 0
        assert forecast_data[0]["max_temp"] == 30.0
        assert forecast_data[0]["min_temp"] == 20.0


class TestWeatherModuleErrorHandling:
    """Test weather module error handling."""

    async def test_owm_client_invalid_api_key(self) -> None:
        """Test OWM client with invalid API key."""
        session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 401
        mock_response.json.return_value = {"cod": 401, "message": "Invalid API key"}
        session.get.return_value.__aenter__.return_value = mock_response

        client = OWMClient(session, "invalid_api_key", "3.0")

        with pytest.raises((InvalidAuth, CannotConnect, OSError)):
            await client.get_current_weather(52.0, 5.0)

    async def test_pirate_weather_client_rate_limit(self) -> None:
        """Test Pirate Weather client with rate limit."""
        session = AsyncMock()
        mock_response = AsyncMock()
        mock_response.status = 429
        session.get.return_value.__aenter__.return_value = mock_response

        client = PirateWeatherClient(session, "validate_api_key")

        with pytest.raises((InvalidAuth, CannotConnect, OSError)):
            await client.get_current_weather(52.0, 5.0)
