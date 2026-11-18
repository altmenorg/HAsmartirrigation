"""Comprehensive tests for Smart Irrigation helper functions."""

import pytest

from custom_components.smart_irrigation.const import (
    UNIT_INCH,
    UNIT_KMH,
    UNIT_MH,
    UNIT_MM,
    UNIT_MS,
)
from custom_components.smart_irrigation.helpers import (
    altitudeToPressure,
    convert_length,
    convert_speed,
    convert_temperatures,
)


class TestPressureFunctions:
    """Test pressure-related helper functions."""

    def test_altitude_to_pressure_sea_level(self):
        """Test pressure calculation at sea level."""
        pressure = altitudeToPressure(0)
        assert abs(pressure - 1013.25) < 0.01

    def test_altitude_to_pressure_elevated(self):
        """Test pressure calculation at elevation."""
        pressure = altitudeToPressure(1000)
        assert pressure < 1013.25
        assert pressure > 890  # Reasonable range (actual ~898 at 1000m)

    def test_altitude_to_pressure_negative_elevation(self):
        """Test pressure calculation below sea level."""
        pressure = altitudeToPressure(-100)
        assert pressure > 1020


class TestTemperatureFunctions:
    """Test temperature-related helper functions."""

    def test_convert_celsius_to_fahrenheit(self):
        """Test Celsius to Fahrenheit conversion."""
        result = convert_temperatures(
            "°C", "°F", 0
        )  # Updated to convert_temperatures API
        assert abs(result - 32.0) < 0.01

        result = convert_temperatures("°C", "°F", 100)
        assert abs(result - 212.0) < 0.01

    def test_convert_fahrenheit_to_celsius(self):
        """Test Fahrenheit to Celsius conversion."""
        result = convert_temperatures("°F", "°C", 32)
        assert abs(result - 0.0) < 0.01

        result = convert_temperatures("°F", "°C", 212)
        assert abs(result - 100.0) < 0.01

    def test_convert_celsius_to_kelvin(self):
        """Test Celsius to Kelvin conversion."""
        result = convert_temperatures("°C", "K", 0)
        assert abs(result - 273.15) < 0.01

    def test_convert_kelvin_to_celsius(self):
        """Test Kelvin to Celsius conversion."""
        result = convert_temperatures("K", "°C", 273.15)
        assert abs(result - 0.0) < 0.01

    def test_convert_same_temperature_unit(self):
        """Test conversion within same unit."""
        result = convert_temperatures("°C", "°C", 25)
        assert result == 25


class TestLengthFunctions:
    """Test length-related helper functions."""

    def test_convert_length(self):
        """Test length unit conversions."""
        # mm to inches - using UNIT_* constants instead of strings
        result = convert_length(UNIT_MM, UNIT_INCH, 25.4)
        assert abs(result - 1.0) < 0.01

        # inches to mm
        result = convert_length(UNIT_INCH, UNIT_MM, 1.0)
        assert abs(result - 25.4) < 0.01

        # Same unit
        result = convert_length(UNIT_MM, UNIT_MM, 100)
        assert result == 100


class TestSpeedFunctions:
    """Test speed-related helper functions."""

    def test_convert_speed(self):
        """Test speed unit conversions."""
        # m/s to km/h - using UNIT_* constants for proper API
        result = convert_speed(UNIT_MS, UNIT_KMH, 1)
        assert abs(result - 3.6) < 0.01

        # km/h to m/s
        result = convert_speed(UNIT_KMH, UNIT_MS, 3.6)
        assert abs(result - 1.0) < 0.01

        # km/h to mph
        result = convert_speed(UNIT_KMH, UNIT_MH, 100)
        assert abs(result - 62.14) < 0.1

        # Same unit
        result = convert_speed(UNIT_KMH, UNIT_KMH, 50)
        assert result == 50


class TestEdgeCases:
    """Test edge cases and error conditions."""

    def test_pressure_conversion_zero_values(self):
        """Test pressure calculations at sea level."""
        result = altitudeToPressure(0)
        assert abs(result - 1013.25) < 50

    def test_temperature_conversion_extreme_values(self):
        """Test temperature conversion with extreme values."""
        # Very cold temperature (absolute zero)
        result = convert_temperatures("°C", "K", -273.15)
        if result is not None:
            assert abs(result - 0.0) < 0.01

        # Very hot temperature
        result = convert_temperatures("°C", "°F", 1000)
        if result is not None:
            assert result > 1000

    def test_unit_conversion_invalid_units(self):
        """Test unit conversions with invalid units."""
        result = convert_temperatures("invalid", "°C", 25)
        assert result is None

        result = convert_length("invalid", "mm", 100)
        assert result is None

    def test_none_values(self):
        """Test functions with None values."""
        with pytest.raises(TypeError):
            altitudeToPressure(None)

        result = convert_temperatures("°C", "°F", None)
        assert result is None

        result = convert_length("mm", "in", None)
        assert result is None


class TestPerformanceOptimizations:
    """Test performance-related aspects of helper functions."""

    def test_temperature_conversion_performance(self):
        """Test temperature conversion performance with many calls."""
        import time

        start_time = time.time()
        for _ in range(1000):
            convert_temperatures("°C", "°F", 25)
        end_time = time.time()

        # Should complete 1000 conversions in well under a second
        assert (end_time - start_time) < 1.0

    def test_pressure_calculation_performance(self):
        """Test pressure calculation performance."""
        import time

        start_time = time.time()
        for _ in range(1000):
            altitudeToPressure(100)
        end_time = time.time()

        # Should complete 1000 calculations in well under a second
        assert (end_time - start_time) < 1.0
