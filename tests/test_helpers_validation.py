"""Test Smart Irrigation helper functions."""

import contextlib

import pytest

from custom_components.smart_irrigation.const import (
    CONF_WEATHER_SERVICE_OM,
)
from custom_components.smart_irrigation.helpers import (
    CannotConnect,
    InvalidAuth,
    altitudeToPressure,
    convert_pressure,
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
        # FAO-56 Eq. 7: 1001.5 hPa at 100 m. Only checking the result was
        # positive let a formula through that returned 1013.3 at any height.
        assert absolute_pressure == pytest.approx(1001.5, abs=0.5)
        assert relative_to_absolute_pressure(1013.25, 1000) == pytest.approx(
            900.5, abs=1.0
        )

    async def test_validate_api_key_open_meteo_no_key(self, hass) -> None:
        """Open-Meteo is keyless: validating with no API key must not raise
        a missing-key/None error (a connection error is acceptable)."""
        with contextlib.suppress(CannotConnect, InvalidAuth, OSError):
            await validate_api_key(hass, CONF_WEATHER_SERVICE_OM, None)

    def test_convert_between_pressure_units(self) -> None:
        """Test pressure unit conversions."""
        from custom_components.smart_irrigation.const import (
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
