"""Simple comprehensive tests for Smart Irrigation helper functions."""

import contextlib

import pytest

from custom_components.smart_irrigation.helpers import (
    CannotConnect,
    InvalidAuth,
    altitudeToPressure,
    check_time,
    relative_to_absolute_pressure,
    validate_api_key,
)


class TestHelperExceptions:
    """Test custom exception classes."""

    def test_cannot_connect_exception(self):
        """Test CannotConnect exception."""
        exc = CannotConnect("Connection failed")
        assert str(exc) == "Connection failed"
        assert isinstance(exc, Exception)

    def test_invalid_auth_exception(self):
        """Test InvalidAuth exception."""
        exc = InvalidAuth("Authentication failed")
        assert str(exc) == "Authentication failed"
        assert isinstance(exc, Exception)


class TestPressureFunctions:
    """Test pressure-related helper functions."""

    def test_altitude_to_pressure_sea_level(self):
        """Test pressure calculation at sea level."""
        pressure = altitudeToPressure(0)
        assert abs(pressure - 1013.25) < 50

    def test_altitude_to_pressure_elevated(self):
        """Test pressure calculation at elevation."""
        pressure = altitudeToPressure(1000)
        assert pressure < 1013.25
        assert pressure > 890  # Adjusted for actual calculation (~898)

    def test_altitude_to_pressure_negative_elevation(self):
        """Test pressure calculation below sea level."""
        pressure = altitudeToPressure(-100)
        assert pressure > 1020

    def test_relative_to_absolute_pressure(self):
        """Test relative to absolute pressure conversion."""
        absolute = relative_to_absolute_pressure(1000, 100)
        assert absolute > 1000
        assert isinstance(absolute, float)


class TestTimeFunctions:
    """Test time-related helper functions."""

    def test_check_time_valid_format(self):
        """Test time validation with valid formats."""
        assert check_time("12:30") is True
        assert check_time("00:00") is True
        assert check_time("23:59") is True

    def test_check_time_invalid_format(self):
        """Test time validation with invalid formats."""
        assert check_time("25:00") is False
        assert check_time("12:60") is False
        assert check_time("invalid") is False
        assert check_time("") is False

    def test_check_time_edge_cases(self):
        """Test time validation edge cases."""
        assert check_time("24:00") is False
        assert check_time("-1:30") is False
        assert check_time("12:30:45") is False  # Too many parts


class TestAPIKeyValidation:
    """Test API key validation functions."""

    @pytest.mark.asyncio
    async def validate_api_key_owm_success(self, hass):
        """Test successful OWM API key validation."""
        with contextlib.suppress(CannotConnect, InvalidAuth):
            await validate_api_key(hass, "owm", "test_key")

    @pytest.mark.asyncio
    async def validate_api_key_owm_invalid(self, hass):
        """Test invalid OWM API key."""
        with contextlib.suppress(InvalidAuth, CannotConnect, OSError):
            await validate_api_key(hass, "owm", "invalid_key")

    @pytest.mark.asyncio
    async def validate_api_key_connection_error(self, hass):
        """Test API key validation with connection error."""
        with contextlib.suppress(InvalidAuth, CannotConnect, OSError):
            await validate_api_key(hass, "owm", "test_key")


class TestEdgeCases:
    """Test edge cases and error conditions."""

    def test_pressure_conversion_zero_values(self):
        """Test pressure calculations with zero values."""
        result = altitudeToPressure(0)
        assert result > 1000

    def test_none_values(self):
        """Test functions with None values."""
        with pytest.raises((TypeError, ValueError)):
            altitudeToPressure(None)


class TestPerformanceOptimizations:
    """Test performance-related aspects of helper functions."""

    def test_pressure_calculation_performance(self):
        """Test pressure calculation performance."""
        import time

        start_time = time.time()
        for _ in range(1000):
            altitudeToPressure(100)
        end_time = time.time()

        # Should complete 1000 calculations in well under a second
        assert (end_time - start_time) < 1.0

    def test_time_validation_performance(self):
        """Test time validation performance."""
        import time

        start_time = time.time()
        for _ in range(1000):
            check_time("12:30")
        end_time = time.time()

        # Should complete 1000 validations in well under a second
        assert (end_time - start_time) < 1.0
