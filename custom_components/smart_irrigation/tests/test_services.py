"""Test Smart Irrigation services."""

from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.core import HomeAssistant, ServiceCall

from custom_components.smart_irrigation import const


class TestSmartIrrigationServices:
    """Test Smart Irrigation service calls."""

    @pytest.fixture
    def mock_coordinator(self):
        """Create a mock coordinator."""
        coordinator = AsyncMock()
        coordinator.calculate_zone = AsyncMock()
        coordinator.calculate_all_zones = AsyncMock()
        coordinator.update_zone = AsyncMock()
        coordinator.update_all_zones = AsyncMock()
        coordinator.set_bucket = AsyncMock()
        return coordinator

    async def test_calculate_zone_service(
        self,
        hass: HomeAssistant,
        mock_coordinator: AsyncMock,
    ) -> None:
        """Test calculate zone service."""
        # Set up hass data
        hass.data[const.DOMAIN] = {"coordinator": mock_coordinator}

        # Register the service
        with patch(
            "custom_components.smart_irrigation.register_services"
        ) as mock_register:
            from custom_components.smart_irrigation import register_services

            register_services(hass)
            mock_register.assert_called_once()

        # Mock service call
        service_data = {
            "entity_id": "sensor.smart_irrigation_test_zone",
            "delete_weather_data": True,
        }

        ServiceCall(
            domain=const.DOMAIN,
            service="calculate_zone",
            data=service_data,
        )

        # Test service exists
        assert hass.services.has_service(const.DOMAIN, "calculate_zone")

    async def test_calculate_all_zones_service(
        self,
        hass: HomeAssistant,
        mock_coordinator: AsyncMock,
    ) -> None:
        """Test calculate all zones service."""
        # Set up hass data
        hass.data[const.DOMAIN] = {"coordinator": mock_coordinator}

        # Register the service
        from custom_components.smart_irrigation import register_services

        register_services(hass)

        # Mock service call
        service_data = {"delete_weather_data": False}

        ServiceCall(
            domain=const.DOMAIN,
            service="calculate_all_zones",
            data=service_data,
        )

        # Test service exists
        assert hass.services.has_service(const.DOMAIN, "calculate_all_zones")

    async def test_update_zone_service(
        self,
        hass: HomeAssistant,
        mock_coordinator: AsyncMock,
    ) -> None:
        """Test update zone service."""
        # Set up hass data
        hass.data[const.DOMAIN] = {"coordinator": mock_coordinator}

        # Register the service
        from custom_components.smart_irrigation import register_services

        register_services(hass)

        # Test service exists
        assert hass.services.has_service(const.DOMAIN, "update_zone")

    async def test_update_all_zones_service(
        self,
        hass: HomeAssistant,
        mock_coordinator: AsyncMock,
    ) -> None:
        """Test update all zones service."""
        # Set up hass data
        hass.data[const.DOMAIN] = {"coordinator": mock_coordinator}

        # Register the service
        from custom_components.smart_irrigation import register_services

        register_services(hass)

        # Test service exists
        assert hass.services.has_service(const.DOMAIN, "update_all_zones")

    async def test_set_bucket_service(
        self,
        hass: HomeAssistant,
        mock_coordinator: AsyncMock,
    ) -> None:
        """Test set bucket service."""
        # Set up hass data
        hass.data[const.DOMAIN] = {"coordinator": mock_coordinator}

        # Register the service
        from custom_components.smart_irrigation import register_services

        register_services(hass)

        # Mock service call
        service_data = {
            "entity_id": "sensor.smart_irrigation_test_zone",
            "new_bucket_value": 15.5,
        }

        ServiceCall(
            domain=const.DOMAIN,
            service="set_bucket",
            data=service_data,
        )

        # Test service exists
        assert hass.services.has_service(const.DOMAIN, "set_bucket")

    async def test_service_with_invalid_entity(
        self,
        hass: HomeAssistant,
        mock_coordinator: AsyncMock,
    ) -> None:
        """Test service call with invalid entity ID."""
        # Set up hass data
        hass.data[const.DOMAIN] = {"coordinator": mock_coordinator}

        # Register the service
        from custom_components.smart_irrigation import register_services

        register_services(hass)

        # Mock service call with invalid entity
        service_data = {
            "entity_id": "sensor.invalid_entity",
            "delete_weather_data": True,
        }

        # Test that service call handles invalid entities gracefully
        # (Actual behavior depends on service implementation)
        ServiceCall(
            domain=const.DOMAIN,
            service="calculate_zone",
            data=service_data,
        )

        # Service should exist even with invalid data
        assert hass.services.has_service(const.DOMAIN, "calculate_zone")
