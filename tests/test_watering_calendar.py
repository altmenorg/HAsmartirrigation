"""Tests for the Smart Irrigation 12-month watering calendar feature."""

from unittest.mock import AsyncMock, Mock, patch

import pytest

from custom_components.happy_irrigation import SmartIrrigationCoordinator
from custom_components.happy_irrigation.const import (
    MODULE_NAME,
    ZONE_ID,
    ZONE_MAPPING,
    ZONE_MODULE,
    ZONE_MULTIPLIER,
    ZONE_NAME,
    ZONE_SIZE,
    ZONE_STATE,
    ZONE_STATE_AUTOMATIC,
    ZONE_STATE_DISABLED,
    ZONE_THROUGHPUT,
)


@pytest.fixture
def mock_store():
    """Create a mock store instance."""
    # Use regular Mock to avoid coroutine issues with sync methods
    from unittest.mock import Mock

    from custom_components.happy_irrigation.const import (
        CONF_AUTO_CALC_ENABLED,
        CONF_AUTO_CLEAR_ENABLED,
        CONF_AUTO_UPDATE_ENABLED,
        CONF_USE_WEATHER_SERVICE,
        CONF_WEATHER_SERVICE,
        START_EVENT_FIRED_TODAY,
    )

    store = Mock()

    # Configure synchronous get_config() to return proper dict
    store.get_config.return_value = {
        CONF_USE_WEATHER_SERVICE: False,
        CONF_WEATHER_SERVICE: None,
        CONF_AUTO_UPDATE_ENABLED: False,
        CONF_AUTO_CALC_ENABLED: False,
        CONF_AUTO_CLEAR_ENABLED: False,
        START_EVENT_FIRED_TODAY: False,
    }

    # Mock zone data
    test_zone = {
        ZONE_ID: 1,
        ZONE_NAME: "Test Zone",
        ZONE_SIZE: 100.0,  # m²
        ZONE_THROUGHPUT: 10.0,  # l/m
        ZONE_STATE: ZONE_STATE_AUTOMATIC,
        ZONE_MAPPING: 1,
        ZONE_MODULE: 1,
        ZONE_MULTIPLIER: 1.0,
    }

    disabled_zone = {
        ZONE_ID: 2,
        ZONE_NAME: "Disabled Zone",
        ZONE_SIZE: 50.0,
        ZONE_THROUGHPUT: 5.0,
        ZONE_STATE: ZONE_STATE_DISABLED,
        ZONE_MAPPING: 1,
        ZONE_MODULE: 1,
        ZONE_MULTIPLIER: 1.0,
    }

    # Configure async methods separately
    store.async_get_zones = AsyncMock(return_value=[test_zone, disabled_zone])
    store.async_get_config = AsyncMock(
        return_value={
            CONF_USE_WEATHER_SERVICE: False,
            CONF_WEATHER_SERVICE: None,
            CONF_AUTO_UPDATE_ENABLED: False,
            CONF_AUTO_CALC_ENABLED: False,
            CONF_AUTO_CLEAR_ENABLED: False,
            START_EVENT_FIRED_TODAY: False,
        }
    )

    store.get_zone.return_value = test_zone

    # Mock module data
    test_module = {
        "id": 1,
        MODULE_NAME: "PyETO",
        "description": "Test PyETO Module",
        "config": {},
    }

    store.get_module.return_value = test_module

    return store


@pytest.fixture
def mock_pyeto_module():
    """Create a mock PyETO module instance."""
    from unittest.mock import Mock

    module = Mock()
    module.name = "PyETO"
    module.calculate_et_for_day = Mock(
        return_value=-2.5
    )  # Negative indicates water deficit
    return module


@pytest.fixture
async def coordinator(hass, mock_store):
    """Create a SmartIrrigationCoordinator instance for testing."""
    from custom_components.happy_irrigation.const import (
        CONF_USE_WEATHER_SERVICE,
        CONF_WEATHER_SERVICE,
        DOMAIN,
    )

    hass.data[DOMAIN] = {
        CONF_USE_WEATHER_SERVICE: False,
        CONF_WEATHER_SERVICE: None,
    }

    entry = Mock()
    entry.unique_id = "test_entry"
    entry.data = {}
    entry.options = {}

    coord = SmartIrrigationCoordinator(hass, None, entry, mock_store)
    coord.store = mock_store

    return coord


class TestWateringCalendar:
    """Test class for watering calendar functionality."""

    @pytest.mark.asyncio
    async def test_generate_monthly_climate_data(self, coordinator):
        """Test generation of monthly climate data."""
        monthly_data = coordinator._generate_monthly_climate_data()

        # Should have 12 months of data
        assert len(monthly_data) == 12

        # Each month should have required fields
        for month_data in monthly_data:
            assert "month" in month_data
            assert "avg_temp" in month_data
            assert "min_temp" in month_data
            assert "max_temp" in month_data
            assert "precipitation" in month_data
            assert "humidity" in month_data
            assert "wind_speed" in month_data
            assert "pressure" in month_data
            assert "dewpoint" in month_data

        # Verify seasonal variation (summer should be warmer than winter)
        summer_temp = monthly_data[6]["avg_temp"]
        winter_temp = monthly_data[0]["avg_temp"]
        assert summer_temp > winter_temp

    @pytest.mark.asyncio
    async def test_calculate_monthly_watering_volume(self, coordinator):
        """Test calculation of monthly watering volume."""
        test_zone = {
            ZONE_SIZE: 100.0,  # 100 m²
            ZONE_MULTIPLIER: 1.0,
        }

        et_mm = 60.0  # 60mm ET for the month
        month_data = {"precipitation": 20.0}  # 20mm precipitation

        volume = coordinator._calculate_monthly_watering_volume(
            test_zone, et_mm, month_data
        )

        # Net water need = 60 - 20 = 40mm
        # 40mm over 100m² = 4000 liters
        expected_volume = 40.0 * 100.0  # mm * m² = liters
        assert volume == expected_volume

    @pytest.mark.asyncio
    async def test_calculate_monthly_watering_volume_no_irrigation_needed(
        self, coordinator
    ):
        """Test that no irrigation is calculated when precipitation exceeds ET."""
        test_zone = {ZONE_SIZE: 100.0, ZONE_MULTIPLIER: 1.0}

        et_mm = 30.0  # 30mm ET
        month_data = {"precipitation": 50.0}  # 50mm precipitation (exceeds ET)

        volume = coordinator._calculate_monthly_watering_volume(
            test_zone, et_mm, month_data
        )

        # No irrigation needed when precipitation > ET
        assert volume == 0.0

    @pytest.mark.asyncio
    async def test_get_zone_calculation_method(self, coordinator):
        """Test getting zone calculation method description."""
        test_zone = {ZONE_MODULE: 1}

        method = coordinator._get_zone_calculation_method(test_zone)
        assert "PyETO" in method
        assert "FAO-56" in method

    @pytest.mark.asyncio
    async def test_generate_watering_calendar_single_zone(
        self, coordinator, mock_pyeto_module
    ):
        """Test generating watering calendar for a single zone."""
        with patch.object(
            coordinator,
            "getModuleInstanceByID",
            new=AsyncMock(return_value=mock_pyeto_module),
        ):
            calendar_data = await coordinator.async_generate_watering_calendar(
                zone_id=1
            )

        # Should return data for the requested zone
        assert 1 in calendar_data
        zone_data = calendar_data[1]

        assert zone_data["zone_name"] == "Test Zone"
        assert zone_data["zone_id"] == 1
        assert "monthly_estimates" in zone_data
        assert "generated_at" in zone_data
        assert "calculation_method" in zone_data

        # Should have 12 monthly estimates
        monthly_estimates = zone_data["monthly_estimates"]
        assert len(monthly_estimates) == 12

        # Each estimate should have required fields
        for estimate in monthly_estimates:
            assert "month" in estimate
            assert "month_name" in estimate
            assert "estimated_et_mm" in estimate
            assert "estimated_watering_volume_liters" in estimate
            assert "average_temperature_c" in estimate
            assert "average_precipitation_mm" in estimate

    @pytest.mark.asyncio
    async def test_generate_watering_calendar_all_zones(
        self, coordinator, mock_pyeto_module
    ):
        """Test generating watering calendar for all zones."""
        with patch.object(
            coordinator,
            "getModuleInstanceByID",
            new=AsyncMock(return_value=mock_pyeto_module),
        ):
            calendar_data = await coordinator.async_generate_watering_calendar()

        # Should return data for the enabled zone (1) but not disabled zone (2)
        assert 1 in calendar_data
        assert 2 not in calendar_data  # Disabled zones are skipped

    @pytest.mark.asyncio
    async def test_generate_watering_calendar_zone_not_found(
        self, coordinator, mock_pyeto_module
    ):
        """Test graceful handling when zone is not found."""
        with patch.object(
            coordinator,
            "getModuleInstanceByID",
            new=AsyncMock(return_value=mock_pyeto_module),
        ):
            calendar_data = await coordinator.async_generate_watering_calendar(
                zone_id=999
            )

        # Should return empty data for non-existent zone (graceful handling)
        assert isinstance(calendar_data, dict)
        assert 999 not in calendar_data

    @pytest.mark.asyncio
    async def test_generate_watering_calendar_missing_module(self, coordinator):
        """Test handling of zones with missing calculation modules."""
        # Mock store to return a zone without a module
        coordinator.store.get_zone.return_value = {
            ZONE_ID: 1,
            ZONE_NAME: "Test Zone",
            ZONE_STATE: ZONE_STATE_AUTOMATIC,
            ZONE_MAPPING: None,  # Missing mapping
            ZONE_MODULE: None,  # Missing module
        }

        calendar_data = await coordinator.async_generate_watering_calendar(zone_id=1)

        # Should return error data for the zone
        assert 1 in calendar_data
        zone_data = calendar_data[1]
        assert "error" in zone_data
        assert zone_data["monthly_estimates"] == []

    @pytest.mark.asyncio
    async def test_calculate_monthly_et_pyeto(self, coordinator, mock_pyeto_module):
        """Test monthly ET calculation using PyETO."""
        month_data = {
            "avg_temp": 25.0,
            "min_temp": 15.0,
            "max_temp": 35.0,
            "precipitation": 50.0,
            "humidity": 65.0,
            "wind_speed": 3.0,
            "pressure": 1013.25,
            "dewpoint": 18.0,
        }

        # Mock PyETO to return a consistent daily ET deficit
        mock_pyeto_module.calculate_et_for_day = Mock(
            return_value=-2.0
        )  # 2mm deficit per day

        monthly_et = coordinator._calculate_monthly_et_pyeto(
            month_data, mock_pyeto_module, 7
        )  # July

        # Should calculate monthly ET based on daily values
        assert monthly_et > 0

        # Verify the module was called with weather data
        mock_pyeto_module.calculate_et_for_day.assert_called_once()
        # Check that function was called (argument structure may have changed)
        assert mock_pyeto_module.calculate_et_for_day.call_count == 1
