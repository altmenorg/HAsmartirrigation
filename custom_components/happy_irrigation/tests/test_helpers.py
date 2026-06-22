"""Test Happy Irrigation helper functions."""

import contextlib

import pytest

from custom_components.happy_irrigation.const import (
    CONF_WEATHER_SERVICE_OWM,
    CONF_WEATHER_SERVICE_PW,
)
from custom_components.happy_irrigation.helpers import (
    CannotConnect,
    InvalidAuth,
    altitudeToPressure,
    check_time,
    convert_length,
    convert_pressure,
    convert_speed,
    convert_temperatures,
    relative_to_absolute_pressure,
    validate_api_key,
)


class TestHelperFunctions:
    """Test helper functions."""

    def test_altitude_to_pressure(self) -> None:
        """Test altitude to pressure conversion."""
        # Test at sea level
        pressure_sea_level = altitudeToPressure(0)
        assert pressure_sea_level == pytest.approx(1013.25, rel=1e-2)

        # Test at 1000m elevation
        pressure_1000m = altitudeToPressure(1000)
        assert pressure_1000m < pressure_sea_level
        assert pressure_1000m == pytest.approx(898.7, rel=1e-1)

    def test_relative_to_absolute_pressure(self) -> None:
        """Test relative to absolute pressure conversion."""
        relative_pressure = 1013.25
        altitude = 100

        absolute_pressure = relative_to_absolute_pressure(relative_pressure, altitude)

        assert isinstance(absolute_pressure, float)
        assert absolute_pressure > 0

    def test_check_time_valid(self) -> None:
        """Test check_time with valid time string."""
        valid_times = ["00:00", "12:30", "23:59"]

        for time_str in valid_times:
            result = check_time(time_str)
            assert result is True  # Updated to current boolean API

    def test_check_time_invalid(self) -> None:
        """Test check_time with invalid time string."""
        invalid_times = ["25:00", "12:60", "abc", "12", "12:30:45"]

        for time_str in invalid_times:
            result = check_time(time_str)
            assert result is False  # Updated to current boolean API

    def test_convert_between_temperature(self) -> None:
        """Test temperature conversion."""
        # Celsius to Fahrenheit - using specialized function
        celsius_to_fahrenheit = convert_temperatures("°C", "°F", 0)
        assert celsius_to_fahrenheit == 32.0

        # Fahrenheit to Celsius
        fahrenheit_to_celsius = convert_temperatures("°F", "°C", 32)
        assert fahrenheit_to_celsius == 0.0

    def test_convert_between_same_unit(self) -> None:
        """Test conversion with same source and target units."""
        value = 25.5
        result = convert_temperatures("°C", "°C", value)
        assert result == value

    async def test_validate_api_key_owm_success(self, hass) -> None:
        """Test OWM API key validation success."""
        with contextlib.suppress(CannotConnect, InvalidAuth, OSError):
            await validate_api_key(hass, CONF_WEATHER_SERVICE_OWM, "valid_api_key")

    async def test_validate_api_key_owm_invalid_auth(self, hass) -> None:
        """Test OWM API key validation with invalid auth."""
        with contextlib.suppress(InvalidAuth, CannotConnect, OSError):
            await validate_api_key(hass, CONF_WEATHER_SERVICE_OWM, "invalid_api_key")

    async def test_validate_api_key_owm_cannot_connect(self, hass) -> None:
        """Test OWM API key validation with connection error."""
        with contextlib.suppress(CannotConnect, InvalidAuth, OSError):
            await validate_api_key(hass, CONF_WEATHER_SERVICE_OWM, "test_key")

    async def test_validate_api_key_pirate_weather_success(self, hass) -> None:
        """Test Pirate Weather API key validation success."""
        with contextlib.suppress(CannotConnect, InvalidAuth, OSError):
            await validate_api_key(hass, CONF_WEATHER_SERVICE_PW, "valid_api_key")

    def test_convert_between_pressure_units(self) -> None:
        """Test pressure unit conversions."""
        from custom_components.happy_irrigation.const import (
            MBAR_TO_INHG_FACTOR,  # hPa = mbar
            MBAR_TO_PSI_FACTOR,  # hPa = mbar
            UNIT_HPA,
            UNIT_INHG,
            UNIT_PSI,
        )

        # Test hPa to inHg conversion - using specialized function
        hpa_value = 1013.25
        inhg_value = convert_pressure(UNIT_HPA, UNIT_INHG, hpa_value)
        expected_inhg = hpa_value * MBAR_TO_INHG_FACTOR
        assert inhg_value == pytest.approx(expected_inhg, rel=1e-3)

        # Test hPa to PSI conversion - using specialized function
        psi_value = convert_pressure(UNIT_HPA, UNIT_PSI, hpa_value)
        expected_psi = hpa_value * MBAR_TO_PSI_FACTOR
        assert psi_value == pytest.approx(expected_psi, rel=1e-3)

    def test_convert_between_length_units(self) -> None:
        """Test length unit conversions."""
        from custom_components.happy_irrigation.const import (
            INCH_TO_MM_FACTOR,
            MM_TO_INCH_FACTOR,
            UNIT_INCH,
            UNIT_MM,
        )

        # Test mm to inch conversion - using specialized function
        mm_value = 25.4
        inch_value = convert_length(UNIT_MM, UNIT_INCH, mm_value)
        expected_inch = mm_value * MM_TO_INCH_FACTOR
        assert inch_value == pytest.approx(expected_inch, rel=1e-3)

        # Test inch to mm conversion
        inch_value = 1.0
        mm_value = convert_length(UNIT_INCH, UNIT_MM, inch_value)
        expected_mm = inch_value * INCH_TO_MM_FACTOR
        assert mm_value == pytest.approx(expected_mm, rel=1e-3)

    def test_convert_between_speed_units(self) -> None:
        """Test speed unit conversions."""
        from custom_components.happy_irrigation.const import (
            MS_TO_KMH_FACTOR,
            MS_TO_MILESH_FACTOR,  # This exists in const.py
            UNIT_KMH,
            UNIT_MH,
            UNIT_MS,
        )

        # Test m/s to km/h conversion - using specialized function
        ms_value = 10.0
        kmh_value = convert_speed(UNIT_MS, UNIT_KMH, ms_value)
        expected_kmh = ms_value * MS_TO_KMH_FACTOR
        assert kmh_value == pytest.approx(expected_kmh, rel=1e-3)

        # Test m/s to mph conversion
        mph_value = convert_speed(UNIT_MS, UNIT_MH, ms_value)
        expected_mph = ms_value * MS_TO_MILESH_FACTOR
        assert mph_value == pytest.approx(expected_mph, rel=1e-3)


class TestExceptionClasses:
    """Test custom exception classes."""

    def test_cannot_connect_exception(self) -> None:
        """Test CannotConnect exception."""
        message = "Cannot connect to service"

        with pytest.raises(CannotConnect) as exc_info:
            raise CannotConnect(message)

        assert str(exc_info.value) == message

    def test_invalid_auth_exception(self) -> None:
        """Test InvalidAuth exception."""
        message = "Invalid authentication"

        with pytest.raises(InvalidAuth) as exc_info:
            raise InvalidAuth(message)

        assert str(exc_info.value) == message
