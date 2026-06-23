"""Test Smart Irrigation integration initialization."""

from unittest.mock import AsyncMock, patch

import pytest
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from custom_components.smart_irrigation import (
    SmartIrrigationCoordinator,
    SmartIrrigationError,
    async_remove_entry,
    async_setup,
    async_setup_entry,
    async_unload_entry,
    const,
)


class TestSmartIrrigationIntegration:
    """Test Smart Irrigation integration setup and teardown."""

    async def test_async_setup(self, hass: HomeAssistant) -> None:
        """Test basic integration setup."""
        result = await async_setup(hass, {})
        assert result is True

    async def test_async_setup_entry_success(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_hass_config: None,
    ) -> None:
        """Test successful config entry setup."""
        with (
            patch(
                "custom_components.smart_irrigation.async_get_registry"
            ) as mock_registry,
            patch(
                "custom_components.smart_irrigation.async_register_panel"
            ) as mock_panel,
            patch(
                "custom_components.smart_irrigation.async_register_websockets"
            ) as mock_ws,
            patch(
                "custom_components.smart_irrigation.register_services"
            ) as mock_services,
        ):
            mock_store = AsyncMock()
            mock_store.async_get_config.return_value = {
                const.CONF_USE_WEATHER_SERVICE: False,
                const.CONF_WEATHER_SERVICE: None,
            }
            mock_store.set_up_factory_defaults = AsyncMock()
            mock_registry.return_value = mock_store

            result = await async_setup_entry(hass, mock_config_entry)

            assert result is True
            assert const.DOMAIN in hass.data
            assert "coordinator" in hass.data[const.DOMAIN]
            assert "zones" in hass.data[const.DOMAIN]

            mock_panel.assert_called_once_with(hass)
            mock_ws.assert_called_once_with(hass)
            mock_services.assert_called_once_with(hass)

    async def test_async_setup_entry_with_weather_service(
        self,
        hass: HomeAssistant,
        mock_weather_config_entry: ConfigEntry,
        mock_hass_config: None,
    ) -> None:
        """Test config entry setup with weather service enabled."""
        with (
            patch(
                "custom_components.smart_irrigation.async_get_registry"
            ) as mock_registry,
            patch("custom_components.smart_irrigation.async_register_panel"),
            patch("custom_components.smart_irrigation.async_register_websockets"),
            patch("custom_components.smart_irrigation.register_services"),
        ):
            mock_store = AsyncMock()
            mock_store.async_get_config.return_value = {
                const.CONF_USE_WEATHER_SERVICE: True,
                const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OWM,
            }
            mock_store.set_up_factory_defaults = AsyncMock()
            mock_registry.return_value = mock_store

            result = await async_setup_entry(hass, mock_weather_config_entry)

            assert result is True
            assert hass.data[const.DOMAIN][const.CONF_USE_WEATHER_SERVICE] is True
            assert (
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE]
                == const.CONF_WEATHER_SERVICE_OWM
            )
            assert (
                hass.data[const.DOMAIN][const.CONF_WEATHER_SERVICE_API_KEY]
                == "validate_api_key"
            )

    async def test_async_unload_entry(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
    ) -> None:
        """Test unloading config entry."""
        # Set up the integration first
        hass.data[const.DOMAIN] = {
            "coordinator": AsyncMock(),
            "zones": {},
        }

        with patch(
            "custom_components.smart_irrigation.remove_panel"
        ) as mock_remove_panel:
            result = await async_unload_entry(hass, mock_config_entry)

            assert result is True
            mock_remove_panel.assert_called_once_with(hass)

    async def test_async_remove_entry(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
    ) -> None:
        """Test removing config entry."""
        mock_coordinator = AsyncMock()
        hass.data[const.DOMAIN] = {
            "coordinator": mock_coordinator,
            "zones": {},
        }

        with patch(
            "custom_components.smart_irrigation.remove_panel"
        ) as mock_remove_panel:
            await async_remove_entry(hass, mock_config_entry)

            mock_remove_panel.assert_called_once_with(hass)
            mock_coordinator.async_delete_config.assert_called_once()
            assert const.DOMAIN not in hass.data


class TestSmartIrrigationCoordinator:
    """Test SmartIrrigationCoordinator class."""

    def test_coordinator_init(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_store: AsyncMock,
        mock_session: AsyncMock,
    ) -> None:
        """Test coordinator initialization."""
        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
        }

        coordinator = SmartIrrigationCoordinator(
            hass, mock_session, mock_config_entry, mock_store
        )

        assert coordinator.id == mock_config_entry.unique_id
        assert coordinator.hass == hass
        assert coordinator.entry == mock_config_entry
        assert coordinator.store == mock_store

    async def test_coordinator_update_subscriptions(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_store: AsyncMock,
        mock_session: AsyncMock,
    ) -> None:
        """Test coordinator update subscriptions."""
        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
        }

        coordinator = SmartIrrigationCoordinator(
            hass, mock_session, mock_config_entry, mock_store
        )

        # Mock the update_subscriptions method
        with patch.object(
            coordinator, "update_subscriptions", new_callable=AsyncMock
        ) as mock_update:
            await coordinator.update_subscriptions()
            mock_update.assert_called_once()

    async def test_unit_system_change_handler(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_store: AsyncMock,
        mock_session: AsyncMock,
    ) -> None:
        """Test unit system change handling."""
        from homeassistant.util.unit_system import METRIC_SYSTEM, US_CUSTOMARY_SYSTEM

        from custom_components.smart_irrigation import handle_core_config_change

        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
        }

        coordinator = SmartIrrigationCoordinator(
            hass, mock_session, mock_config_entry, mock_store
        )

        hass.data[const.DOMAIN]["coordinator"] = coordinator

        # Mock the async_handle_unit_system_change method
        coordinator.async_handle_unit_system_change = AsyncMock()

        # Test initial setup - no previous unit system
        hass.config.units = METRIC_SYSTEM
        coordinator._previous_unit_system = METRIC_SYSTEM

        event = {}
        await handle_core_config_change(hass, event)

        # Should not call handler for same unit system
        coordinator.async_handle_unit_system_change.assert_not_called()

        # Test unit system change
        hass.config.units = US_CUSTOMARY_SYSTEM
        await handle_core_config_change(hass, event)

        # Should call handler for unit system change
        coordinator.async_handle_unit_system_change.assert_called_once()
        assert coordinator._previous_unit_system == US_CUSTOMARY_SYSTEM

    async def test_async_handle_unit_system_change(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_store: AsyncMock,
        mock_session: AsyncMock,
    ) -> None:
        """Test the unit system change handler method."""
        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
        }

        coordinator = SmartIrrigationCoordinator(
            hass, mock_session, mock_config_entry, mock_store
        )

        # Mock dispatchers and methods
        with (
            patch(
                "custom_components.smart_irrigation.async_dispatcher_send"
            ) as mock_dispatch,
            patch.object(
                coordinator, "_convert_precipitation_threshold", new_callable=AsyncMock
            ) as mock_convert,
            patch.object(
                coordinator, "_refresh_unit_dependent_data", new_callable=AsyncMock
            ) as mock_refresh,
        ):
            await coordinator.async_handle_unit_system_change()

            # Verify correct dispatchers were called
            assert mock_dispatch.call_count == 2
            mock_dispatch.assert_any_call(hass, const.DOMAIN + "_unit_system_changed")
            mock_dispatch.assert_any_call(hass, const.DOMAIN + "_update_frontend")

            # Verify helper methods were called
            mock_convert.assert_called_once()
            mock_refresh.assert_called_once()


class TestSmartIrrigationError:
    """Test SmartIrrigationError exception."""

    def test_exception_creation(self) -> None:
        """Test exception can be created and raised."""
        error_message = "Test error message"
        error = SmartIrrigationError(error_message)
        assert str(error) == error_message

        with pytest.raises(SmartIrrigationError) as exc_info:
            raise SmartIrrigationError(error_message)
        assert str(exc_info.value) == error_message


class TestDaysBetweenIrrigation:
    """Test days between irrigation functionality."""

    @pytest.fixture
    def mock_store_with_days_config(self):
        """Mock store with days between irrigation configuration."""
        store = AsyncMock()
        store.async_get_config.return_value = {
            const.CONF_DAYS_BETWEEN_IRRIGATION: 3,
            const.CONF_DAYS_SINCE_LAST_IRRIGATION: 1,
            const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: False,
            const.CONF_USE_WEATHER_SERVICE: False,
        }
        return store

    async def test_check_days_between_irrigation_default(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_session: AsyncMock,
    ) -> None:
        """Test days between irrigation check with default settings (no restriction)."""
        # Mock store with default settings
        mock_store = AsyncMock()
        mock_store.async_get_config.return_value = {
            const.CONF_DAYS_BETWEEN_IRRIGATION: 0,
            const.CONF_DAYS_SINCE_LAST_IRRIGATION: 5,
        }

        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
        }

        coordinator = SmartIrrigationCoordinator(
            hass, mock_session, mock_config_entry, mock_store
        )

        # With default settings (0 days between), should not skip
        should_skip = await coordinator._check_days_between_irrigation()
        assert should_skip is False

    async def test_check_days_between_irrigation_restriction(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_session: AsyncMock,
        mock_store_with_days_config: AsyncMock,
    ) -> None:
        """Test days between irrigation check with restriction."""
        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
        }

        coordinator = SmartIrrigationCoordinator(
            hass, mock_session, mock_config_entry, mock_store_with_days_config
        )

        # With 3 days required and only 1 day passed, should skip
        should_skip = await coordinator._check_days_between_irrigation()
        assert should_skip is True

        # Test when enough days have passed
        mock_store_with_days_config.async_get_config.return_value[
            const.CONF_DAYS_SINCE_LAST_IRRIGATION
        ] = 3
        should_skip = await coordinator._check_days_between_irrigation()
        assert should_skip is False

    async def test_increment_days_since_irrigation(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_session: AsyncMock,
        mock_store_with_days_config: AsyncMock,
    ) -> None:
        """Test incrementing days since last irrigation."""
        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
        }

        coordinator = SmartIrrigationCoordinator(
            hass, mock_session, mock_config_entry, mock_store_with_days_config
        )

        await coordinator._increment_days_since_irrigation()

        # Should have called update with incremented value
        mock_store_with_days_config.async_update_config.assert_called_with(
            {const.CONF_DAYS_SINCE_LAST_IRRIGATION: 2}
        )

    async def test_reset_days_since_irrigation(
        self,
        hass: HomeAssistant,
        mock_config_entry: ConfigEntry,
        mock_session: AsyncMock,
        mock_store_with_days_config: AsyncMock,
    ) -> None:
        """Test resetting days since last irrigation."""
        hass.data[const.DOMAIN] = {
            const.CONF_USE_WEATHER_SERVICE: False,
            const.CONF_WEATHER_SERVICE: None,
        }

        coordinator = SmartIrrigationCoordinator(
            hass, mock_session, mock_config_entry, mock_store_with_days_config
        )

        await coordinator._reset_days_since_irrigation()

        # Should have called update with 0
        mock_store_with_days_config.async_update_config.assert_called_with(
            {const.CONF_DAYS_SINCE_LAST_IRRIGATION: 0}
        )

        error_message = "Test irrigation error"
        with pytest.raises(SmartIrrigationError) as exc_info:
            raise SmartIrrigationError(error_message)

        assert str(exc_info.value) == error_message
