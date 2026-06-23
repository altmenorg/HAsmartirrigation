"""Test Smart Irrigation store functionality."""

from unittest.mock import AsyncMock, patch

from homeassistant.core import HomeAssistant

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import async_get_registry


class TestSmartIrrigationStore:
    """Test Smart Irrigation store functionality."""

    async def test_async_get_registry(self, hass: HomeAssistant) -> None:
        """Test getting the registry."""
        with patch(
            "custom_components.smart_irrigation.store.Store"
        ) as mock_store_class:
            mock_store = AsyncMock()
            mock_store_class.return_value = mock_store

            registry = await async_get_registry(hass)

            assert registry == mock_store
            mock_store_class.assert_called_once_with(hass, 1, const.DOMAIN)

    async def test_store_get_config(self, hass: HomeAssistant) -> None:
        """Test store get config functionality."""
        with patch(
            "custom_components.smart_irrigation.store.Store"
        ) as mock_store_class:
            mock_store = AsyncMock()
            mock_store.async_load.return_value = {
                const.CONF_USE_WEATHER_SERVICE: True,
                const.CONF_WEATHER_SERVICE: const.CONF_WEATHER_SERVICE_OWM,
                "zones": {},
                "mappings": {},
                "modules": {},
            }
            mock_store_class.return_value = mock_store

            registry = await async_get_registry(hass)
            config = await registry.async_get_config()

            assert config[const.CONF_USE_WEATHER_SERVICE] is True
            assert config[const.CONF_WEATHER_SERVICE] == const.CONF_WEATHER_SERVICE_OWM

    async def test_store_update_config(self, hass: HomeAssistant) -> None:
        """Test store update config functionality."""
        with patch(
            "custom_components.smart_irrigation.store.Store"
        ) as mock_store_class:
            mock_store = AsyncMock()
            mock_store.async_load.return_value = {}
            mock_store_class.return_value = mock_store

            registry = await async_get_registry(hass)

            new_config = {
                const.CONF_USE_WEATHER_SERVICE: False,
                const.CONF_WEATHER_SERVICE: None,
            }

            await registry.async_update_config(new_config)

            mock_store.async_save.assert_called_once()

    async def test_store_factory_defaults(self, hass: HomeAssistant) -> None:
        """Test store factory defaults setup."""
        with patch(
            "custom_components.smart_irrigation.store.Store"
        ) as mock_store_class:
            mock_store = AsyncMock()
            mock_store.async_load.return_value = {}
            mock_store_class.return_value = mock_store

            registry = await async_get_registry(hass)

            await registry.set_up_factory_defaults()

            # Verify that factory defaults were set up
            mock_store.async_save.assert_called()

    async def test_store_zone_operations(self, hass: HomeAssistant) -> None:
        """Test store zone CRUD operations."""
        with patch(
            "custom_components.smart_irrigation.store.Store"
        ) as mock_store_class:
            mock_store = AsyncMock()
            mock_store.async_load.return_value = {"zones": {}}
            mock_store_class.return_value = mock_store

            registry = await async_get_registry(hass)

            # Test adding a zone
            zone_config = {
                "id": "test_zone",
                "name": "Test Zone",
                "size": 100,
                "throughput": 10,
                "bucket": 5.0,
            }

            await registry.async_add_zone(zone_config)
            mock_store.async_save.assert_called()

            # Test updating a zone
            updated_config = {**zone_config, "name": "Updated Test Zone"}
            await registry.async_update_zone("test_zone", updated_config)
            mock_store.async_save.assert_called()

            # Test removing a zone
            await registry.async_remove_zone("test_zone")
            mock_store.async_save.assert_called()

    async def test_store_mapping_operations(self, hass: HomeAssistant) -> None:
        """Test store mapping CRUD operations."""
        with patch(
            "custom_components.smart_irrigation.store.Store"
        ) as mock_store_class:
            mock_store = AsyncMock()
            mock_store.async_load.return_value = {"mappings": {}}
            mock_store_class.return_value = mock_store

            registry = await async_get_registry(hass)

            # Test adding a mapping
            mapping_config = {
                "id": "test_mapping",
                "name": "Test Mapping",
                "temperature": "sensor.temperature",
                "humidity": "sensor.humidity",
            }

            await registry.async_add_mapping(mapping_config)
            mock_store.async_save.assert_called()

    async def test_store_module_operations(self, hass: HomeAssistant) -> None:
        """Test store module CRUD operations."""
        with patch(
            "custom_components.smart_irrigation.store.Store"
        ) as mock_store_class:
            mock_store = AsyncMock()
            mock_store.async_load.return_value = {"modules": {}}
            mock_store_class.return_value = mock_store

            registry = await async_get_registry(hass)

            # Test adding a module
            module_config = {
                "id": "test_module",
                "name": "Test Module",
                "module_type": "pyeto",
                "settings": {},
            }

            await registry.async_add_module(module_config)
            mock_store.async_save.assert_called()
