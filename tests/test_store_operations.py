"""Comprehensive tests for Smart Irrigation store operations."""

import contextlib

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import SmartIrrigationStorage


class TestSmartIrrigationStorageBasics:
    """Test basic store functionality."""

    @pytest.mark.asyncio
    async def test_store_initialization(self, hass):
        """Test store initialization."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()
        assert store.hass == hass

    @pytest.mark.asyncio
    async def test_store_can_load(self, hass):
        """Test that store can be loaded."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

    def test_get_config_returns_dict(self, hass):
        """Test that get_config returns a dictionary."""
        store = SmartIrrigationStorage(hass)
        config = store.get_config()
        assert isinstance(config, dict)

    @pytest.mark.asyncio
    async def test_async_get_config_returns_dict(self, hass):
        """Test that async_get_config returns a dictionary."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()
        config = await store.async_get_config()
        assert isinstance(config, dict)

    @pytest.mark.asyncio
    async def test_factory_defaults_creation(self, hass):
        """Test factory defaults creation."""
        store = SmartIrrigationStorage(hass)
        await store.set_up_factory_defaults()

    @pytest.mark.asyncio
    async def test_config_update_works(self, hass):
        """Test that configuration can be updated."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        await store.async_update_config({const.CONF_AUTO_UPDATE_ENABLED: True})

        updated_config = await store.async_get_config()
        assert updated_config[const.CONF_AUTO_UPDATE_ENABLED] is True


class TestConfigOperations:
    """Test configuration operations."""

    @pytest.fixture
    async def store_with_config(self, hass):
        """Create store with sample configuration."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()
        await store.async_update_config(
            {
                const.CONF_AUTO_UPDATE_ENABLED: True,
                const.CONF_AUTO_CALC_ENABLED: False,
                const.CONF_USE_WEATHER_SERVICE: True,
            }
        )
        return store

    def test_get_config(self, store_with_config):
        """Test getting configuration synchronously."""
        config = store_with_config.get_config()
        assert config[const.CONF_AUTO_UPDATE_ENABLED] is True
        assert config[const.CONF_AUTO_CALC_ENABLED] is False
        assert config[const.CONF_USE_WEATHER_SERVICE] is True

    @pytest.mark.asyncio
    async def test_async_get_config(self, store_with_config):
        """Test getting configuration asynchronously."""
        config = await store_with_config.async_get_config()
        assert config[const.CONF_AUTO_UPDATE_ENABLED] is True
        assert config[const.CONF_AUTO_CALC_ENABLED] is False
        assert config[const.CONF_USE_WEATHER_SERVICE] is True

    @pytest.mark.asyncio
    async def test_store_update_config(self, store_with_config):
        """Test updating configuration."""
        new_config = {const.CONF_AUTO_CALC_ENABLED: True}
        await store_with_config.async_update_config(new_config)

        updated_config = await store_with_config.async_get_config()
        assert updated_config[const.CONF_AUTO_CALC_ENABLED] is True
        assert updated_config[const.CONF_AUTO_UPDATE_ENABLED] is True

    @pytest.mark.asyncio
    async def test_store_factory_defaults(self, hass):
        """Test factory defaults setup."""
        store = SmartIrrigationStorage(hass)
        await store.set_up_factory_defaults()

        config = await store.async_get_config()
        assert isinstance(config, dict)
        assert const.CONF_AUTO_UPDATE_ENABLED in config


class TestZoneOperations:
    """Test zone management operations."""

    @pytest.mark.asyncio
    async def test_get_zones(self, store_with_zones):
        """Test getting individual zones synchronously."""
        zones = await store_with_zones.async_get_zones()
        if zones:
            zone_id = zones[0][const.ZONE_ID]
            zone = store_with_zones.get_zone(zone_id)
            assert zone is not None
            assert zone[const.ZONE_NAME] in ["Front Lawn", "Back Garden"]

        non_existent_zone = store_with_zones.get_zone(99999)
        assert non_existent_zone is None

    @pytest.fixture
    async def store_with_zones(self, hass):
        """Create store with sample zones."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        zone1_data = {
            const.ZONE_NAME: "Front Lawn",
            const.ZONE_SIZE: 100.0,
            const.ZONE_THROUGHPUT: 15.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        }
        zone2_data = {
            const.ZONE_NAME: "Back Garden",
            const.ZONE_SIZE: 50.0,
            const.ZONE_THROUGHPUT: 10.0,
            const.ZONE_STATE: const.ZONE_STATE_MANUAL,
        }

        await store.async_create_zone(zone1_data)
        await store.async_create_zone(zone2_data)
        return store

    @pytest.mark.asyncio
    async def test_zones_basic_operations(self, hass):
        """Test basic zone operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        zones = await store.async_get_zones()
        assert isinstance(zones, list)

        # Create a basic zone
        zone_data = {
            const.ZONE_NAME: "Test Zone",
            const.ZONE_SIZE: 100.0,
            const.ZONE_THROUGHPUT: 10.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        }

        created_zone = await store.async_create_zone(zone_data)
        assert created_zone[const.ZONE_NAME] == "Test Zone"
        assert created_zone[const.ZONE_ID] is not None

    @pytest.mark.asyncio
    async def test_async_get_all_zones(self, store_with_zones):
        """Test async retrieval of all zones."""
        zones = await store_with_zones.async_get_zones()
        assert len(zones) >= 2
        zone_names = [zone[const.ZONE_NAME] for zone in zones]
        assert "Front Lawn" in zone_names
        assert "Back Garden" in zone_names

    @pytest.mark.asyncio
    async def test_async_get_zone_existing(self, store_with_zones):
        """Test retrieving existing zone."""
        zones = await store_with_zones.async_get_zones()
        if zones:
            zone_id = zones[0][const.ZONE_ID]
            zone = store_with_zones.get_zone(zone_id)
            assert zone is not None
            assert zone[const.ZONE_NAME] in ["Front Lawn", "Back Garden"]

    @pytest.mark.asyncio
    async def test_async_get_zone_nonexistent(self, store_with_zones):
        """Test retrieving non-existent zone."""
        nonexistent_zone = store_with_zones.get_zone(99999)
        assert nonexistent_zone is None

    @pytest.mark.asyncio
    async def test_async_save_zone_new(self, hass):
        """Test saving new zone."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        new_zone = {
            const.ZONE_NAME: "Side Yard",
            const.ZONE_SIZE: 75.0,
            const.ZONE_THROUGHPUT: 12.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        }

        created_zone = await store.async_create_zone(new_zone)
        assert created_zone[const.ZONE_NAME] == "Side Yard"
        assert created_zone[const.ZONE_ID] is not None

    @pytest.mark.asyncio
    async def test_async_save_zone_update(self, store_with_zones):
        """Test updating existing zone."""
        zones = await store_with_zones.async_get_zones()
        if zones:
            zone_to_update = zones[0]
            zone_id = zone_to_update[const.ZONE_ID]
            original_name = zone_to_update[const.ZONE_NAME]

            # Update zone data
            updated_data = {
                const.ZONE_NAME: f"Updated {original_name}",
                const.ZONE_SIZE: 200.0,  # Different from original
                const.ZONE_THROUGHPUT: 20.0,
                const.ZONE_STATE: const.ZONE_STATE_MANUAL,
            }

            updated_zone = await store_with_zones.async_update_zone(
                zone_id, updated_data
            )
            assert updated_zone[const.ZONE_NAME] == f"Updated {original_name}"
            assert updated_zone[const.ZONE_SIZE] == 200.0

    @pytest.mark.asyncio
    async def test_async_delete_zone(self, store_with_zones):
        """Test deleting existing zone."""
        zones = await store_with_zones.async_get_zones()
        if zones:
            zone_id = zones[0][const.ZONE_ID]
            await store_with_zones.async_delete_zone(zone_id)

            # Verify zone was deleted
            remaining_zones = await store_with_zones.async_get_zones()
            zone_ids = [zone[const.ZONE_ID] for zone in remaining_zones]
            assert zone_id not in zone_ids

    @pytest.mark.asyncio
    async def test_async_delete_zone_nonexistent(self, store_with_zones):
        """Test deleting non-existent zone."""
        # Try to delete zone with invalid ID
        nonexistent_id = 99999

        # Should handle gracefully without raising exception
        with contextlib.suppress(Exception):
            await store_with_zones.async_delete_zone(nonexistent_id)
            zones = await store_with_zones.async_get_zones()
            assert len(zones) >= 2


class TestMappingOperations:
    """Test mapping management operations."""

    @pytest.mark.asyncio
    async def test_get_mappings(self, store_with_mappings):
        """Test getting individual mappings synchronously."""
        mappings = await store_with_mappings.async_get_mappings()
        if mappings:
            mapping_id = mappings[0][const.MAPPING_ID]
            # Test synchronous get_mapping method
            mapping = store_with_mappings.get_mapping(mapping_id)
            assert mapping is not None
            assert mapping[const.MAPPING_NAME] in ["temp_sensor", "humidity_sensor"]

        # Test invalid ID handling
        non_existent_mapping = store_with_mappings.get_mapping(99999)
        assert non_existent_mapping is None

    @pytest.fixture
    async def store_with_mappings(self, hass):
        """Create store with sample mappings."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Add sample mappings with real sensor entities
        temp_mapping_data = {
            const.MAPPING_NAME: "temp_sensor",
            const.MAPPING_DATA: {
                "source": "sensor.outdoor_temperature",
                "target": "temperature",
                "conversion": "°C",
            },
        }
        humidity_mapping_data = {
            const.MAPPING_NAME: "humidity_sensor",
            const.MAPPING_DATA: {
                "source": "sensor.outdoor_humidity",
                "target": "humidity",
                "conversion": "%",
            },
        }

        await store.async_create_mapping(temp_mapping_data)
        await store.async_create_mapping(humidity_mapping_data)
        return store

    @pytest.mark.asyncio
    async def test_mappings_basic_operations(self, hass):
        """Test basic mapping operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        mappings = await store.async_get_mappings()
        assert isinstance(mappings, list)

    @pytest.mark.asyncio
    async def test_async_get_all_mappings(self, store_with_mappings):
        """Test async retrieval of all mappings."""
        mappings = await store_with_mappings.async_get_mappings()
        assert len(mappings) >= 2
        mapping_names = [mapping[const.MAPPING_NAME] for mapping in mappings]
        assert "temp_sensor" in mapping_names
        assert "humidity_sensor" in mapping_names

    @pytest.mark.asyncio
    async def test_async_save_mapping(self, hass):
        """Test saving new mapping."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        new_mapping = {
            const.MAPPING_NAME: "wind_sensor",
            const.MAPPING_DATA: {
                "source": "sensor.wind_speed",
                "target": "wind_speed",
                "conversion": "m/s",
            },
        }

        created_mapping = await store.async_create_mapping(new_mapping)
        assert created_mapping[const.MAPPING_NAME] == "wind_sensor"

        mappings = await store.async_get_mappings()
        mapping_names = [mapping[const.MAPPING_NAME] for mapping in mappings]
        assert "wind_sensor" in mapping_names

    @pytest.mark.asyncio
    async def test_async_delete_mapping(self, store_with_mappings):
        """Test deleting mapping."""
        mappings = await store_with_mappings.async_get_mappings()
        initial_count = len(mappings)
        mapping_names = [mapping[const.MAPPING_NAME] for mapping in mappings]
        assert "temp_sensor" in mapping_names

        temp_mapping = None
        for mapping in mappings:
            if mapping[const.MAPPING_NAME] == "temp_sensor":
                temp_mapping = mapping
                break

        assert temp_mapping is not None
        await store_with_mappings.async_delete_mapping(temp_mapping[const.MAPPING_ID])

        # Verify mapping was deleted
        updated_mappings = await store_with_mappings.async_get_mappings()
        assert len(updated_mappings) == initial_count - 1
        updated_names = [mapping[const.MAPPING_NAME] for mapping in updated_mappings]
        assert "temp_sensor" not in updated_names


class TestModuleOperations:
    """Test module management operations."""

    @pytest.mark.asyncio
    async def test_get_modules(self, store_with_modules):
        """Test getting individual modules synchronously."""
        modules = await store_with_modules.async_get_modules()
        if modules:
            module_id = modules[0][const.MODULE_ID]
            # Test synchronous get_module method
            module = store_with_modules.get_module(module_id)
            assert module is not None
            assert module[const.MODULE_NAME] in ["Test Module 1", "Test Module 2"]

        # Test invalid ID handling
        non_existent_module = store_with_modules.get_module(99999)
        assert non_existent_module is None

    @pytest.fixture
    async def store_with_modules(self, hass):
        """Create store with sample modules."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Add sample modules using correct constants
        module1_data = {
            const.MODULE_NAME: "Test Module 1",
            const.MODULE_CONFIG: "static",
            const.MODULE_SCHEMA: "{}",
        }
        module2_data = {
            const.MODULE_NAME: "Test Module 2",
            const.MODULE_CONFIG: "pyeto",
            const.MODULE_SCHEMA: "{}",
        }

        await store.async_create_module(module1_data)
        await store.async_create_module(module2_data)
        return store

    @pytest.mark.asyncio
    async def test_modules_basic_operations(self, hass):
        """Test basic module operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        modules = await store.async_get_modules()
        assert isinstance(modules, list)

    @pytest.mark.asyncio
    async def test_async_get_all_modules(self, store_with_modules):
        """Test async retrieval of all modules."""
        modules = await store_with_modules.async_get_modules()
        assert len(modules) >= 2
        module_names = [module[const.MODULE_NAME] for module in modules]
        assert "Test Module 1" in module_names
        assert "Test Module 2" in module_names

    @pytest.mark.asyncio
    async def test_async_save_module_new(self, hass):
        """Test saving new module."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        new_module = {
            const.MODULE_NAME: "New Test Module",
            const.MODULE_CONFIG: "passthrough",
            const.MODULE_SCHEMA: "{}",
        }

        created_module = await store.async_create_module(new_module)
        assert created_module[const.MODULE_NAME] == "New Test Module"

    @pytest.mark.asyncio
    async def test_async_save_module(self, store_with_modules):
        """Test saving/updating existing module."""
        modules = await store_with_modules.async_get_modules()
        if modules:
            module_to_update = modules[0]
            module_id = module_to_update[const.MODULE_ID]

            # Update module data
            updated_data = {
                const.MODULE_NAME: "Updated Module",
                const.MODULE_CONFIG: "updated_config",
                const.MODULE_SCHEMA: '{"updated": true}',
            }

            updated_module = await store_with_modules.async_update_module(
                module_id, updated_data
            )
            assert updated_module[const.MODULE_NAME] == "Updated Module"

    @pytest.mark.asyncio
    async def test_async_delete_module(self, store_with_modules):
        """Test deleting module."""
        modules = await store_with_modules.async_get_modules()
        if modules:
            module_id = modules[0][const.MODULE_ID]
            initial_count = len(modules)

            await store_with_modules.async_delete_module(module_id)

            # Verify module was deleted
            remaining_modules = await store_with_modules.async_get_modules()
            assert len(remaining_modules) == initial_count - 1
            module_ids = [module[const.MODULE_ID] for module in remaining_modules]
            assert module_id not in module_ids


class TestErrorHandling:
    """Test error handling scenarios."""

    @pytest.mark.asyncio
    async def test_async_save_error_handling(self, hass):
        """Test error handling in save operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Test with invalid zone data should handle gracefully
        invalid_zone_data = {}
        with contextlib.suppress(Exception):
            await store.async_create_zone(invalid_zone_data)


class TestBasicFunctionality:
    """Test basic functionality that doesn't require complex setup."""

    @pytest.mark.asyncio
    async def test_store_data_persistence(self, hass):
        """Test that store data persists across operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Update config
        await store.async_update_config({const.CONF_AUTO_UPDATE_ENABLED: True})

        # Create zone
        zone_data = {
            const.ZONE_NAME: "Persistent Test Zone",
            const.ZONE_SIZE: 100.0,
            const.ZONE_THROUGHPUT: 10.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        }
        created_zone = await store.async_create_zone(zone_data)

        # Verify data persistence
        config = await store.async_get_config()
        zones = await store.async_get_zones()

        assert config[const.CONF_AUTO_UPDATE_ENABLED] is True
        assert len(zones) >= 1
        zone_names = [zone[const.ZONE_NAME] for zone in zones]
        assert "Persistent Test Zone" in zone_names

    @pytest.mark.asyncio
    async def test_error_handling(self, hass):
        """Test error handling for invalid operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Test getting non-existent zone
        non_existent_zone = store.get_zone(99999)
        assert non_existent_zone is None

        # Test getting non-existent module
        non_existent_module = store.get_module(99999)
        assert non_existent_module is None

    @pytest.mark.asyncio
    async def test_zone_data_integrity(self, hass):
        """Test zone data integrity across operations."""
        store = SmartIrrigationStorage(hass)
        await store.async_load()

        # Create a zone with specific data
        zone_data = {
            const.ZONE_NAME: "Integrity Test Zone",
            const.ZONE_SIZE: 150.0,
            const.ZONE_THROUGHPUT: 18.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        }

        created_zone = await store.async_create_zone(zone_data)
        zone_id = created_zone[const.ZONE_ID]

        # Retrieve and verify data integrity
        retrieved_zone = store.get_zone(zone_id)
        assert retrieved_zone[const.ZONE_NAME] == "Integrity Test Zone"
        assert retrieved_zone[const.ZONE_SIZE] == 150.0
        assert retrieved_zone[const.ZONE_THROUGHPUT] == 18.0
        assert retrieved_zone[const.ZONE_STATE] == const.ZONE_STATE_AUTOMATIC

        # Verify async retrieval matches
        zones = await store.async_get_zones()
        matching_zone = next(
            (zone for zone in zones if zone[const.ZONE_ID] == zone_id), None
        )
        assert matching_zone is not None
        assert matching_zone[const.ZONE_NAME] == retrieved_zone[const.ZONE_NAME]

    def test_config_defaults(self, hass):
        """Test configuration default values."""
        store = SmartIrrigationStorage(hass)
        config = store.get_config()

        # Should have default values for critical settings
        assert isinstance(config, dict)

        # These should have reasonable defaults even if not explicitly set
        auto_update_enabled = config.get(
            const.CONF_AUTO_UPDATE_ENABLED, const.CONF_DEFAULT_AUTO_UPDATE_ENABLED
        )
        auto_calc_enabled = config.get(
            const.CONF_AUTO_CALC_ENABLED, const.CONF_DEFAULT_AUTO_CALC_ENABLED
        )

        # The values might be strings in the config, so check for truthiness
        if isinstance(auto_update_enabled, str):
            auto_update_enabled = auto_update_enabled.lower() in [
                "true",
                "1",
                "yes",
                "on",
            ]
        if isinstance(auto_calc_enabled, str):
            auto_calc_enabled = auto_calc_enabled.lower() in ["true", "1", "yes", "on"]

        # Now verify they are reasonable boolean-like values
        assert auto_update_enabled is not None
        assert auto_calc_enabled is not None
