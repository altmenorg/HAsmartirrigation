"""Test to verify the storage migration fix for issue with TypeError during upgrades."""

import attr
import pytest

from custom_components.smart_irrigation.const import (
    CONF_DEFAULT_IRRIGATION_START_TRIGGERS,
    CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM,
    CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION,
    CONF_IRRIGATION_START_TRIGGERS,
    CONF_PRECIPITATION_THRESHOLD_MM,
    CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
)
from custom_components.smart_irrigation.store import Config, MigratableStore


class TestMigratableStore(MigratableStore):
    """Test version that doesn't require full Home Assistant setup."""

    def __init__(self):
        # Skip the parent constructor to avoid HA dependencies
        pass


class TestStorageMigrationFix:
    """Test the storage migration fix to prevent TypeErrors during upgrades."""

    def test_config_has_required_fields(self):
        """Test that Config class includes all required fields."""
        valid_fields = set(attr.fields_dict(Config).keys())
        required_fields = {
            "irrigation_start_triggers",
            "skip_irrigation_on_precipitation",
            "precipitation_threshold_mm",
        }

        missing_fields = required_fields - valid_fields
        assert (
            not missing_fields
        ), f"Config class missing required fields: {missing_fields}"

    def test_config_creation_with_unrecognized_keys_fails(self):
        """Test that Config creation fails with unrecognized keys (original problem)."""
        config_data = {
            "calctime": "00:00:00",
            "units": "metric",
            "use_weather_service": True,
            # This unrecognized key should cause TypeError
            "old_deprecated_key": "some_value",
        }

        with pytest.raises(TypeError, match="unexpected keyword argument"):
            Config(**config_data)

    def test_config_field_filtering_prevents_error(self):
        """Test that filtering config fields prevents TypeError (the fix)."""
        config_data = {
            "calctime": "00:00:00",
            "units": "metric",
            "use_weather_service": True,
            # These should be filtered out
            "old_deprecated_key": "some_value",
            "another_old_key": 123,
        }

        # Apply the fix: filter to only valid fields
        valid_fields = set(attr.fields_dict(Config).keys())
        filtered_config = {k: v for k, v in config_data.items() if k in valid_fields}

        # Add required fields if missing
        if "irrigation_start_triggers" not in filtered_config:
            filtered_config["irrigation_start_triggers"] = (
                CONF_DEFAULT_IRRIGATION_START_TRIGGERS
            )
        if "skip_irrigation_on_precipitation" not in filtered_config:
            filtered_config["skip_irrigation_on_precipitation"] = (
                CONF_DEFAULT_SKIP_IRRIGATION_ON_PRECIPITATION
            )
        if "precipitation_threshold_mm" not in filtered_config:
            filtered_config["precipitation_threshold_mm"] = (
                CONF_DEFAULT_PRECIPITATION_THRESHOLD_MM
            )

        # This should work without TypeError
        config = Config(**filtered_config)
        assert config.calctime == "00:00:00"
        assert config.use_weather_service is True

    @pytest.mark.asyncio
    async def test_migration_strips_unrecognized_keys(self):
        """Test that migration function strips unrecognized keys."""
        store = TestMigratableStore()

        old_data = {
            "config": {
                "calctime": "00:00:00",
                "units": "metric",
                "use_weather_service": True,
                # Valid field
                "autocalcenabled": True,
                # Invalid fields that should be stripped
                "old_deprecated_key": "some_value",
                "another_old_key": 123,
            },
            "zones": [],
            "modules": [],
            "mappings": [],
        }

        result = await store._async_migrate_func(4, old_data.copy())

        # Check that invalid keys were removed
        valid_fields = set(attr.fields_dict(Config).keys())
        config_keys = set(result["config"].keys())
        invalid_keys = config_keys - valid_fields

        assert not invalid_keys, f"Invalid keys not filtered: {invalid_keys}"

        # Check that required fields were added
        assert CONF_IRRIGATION_START_TRIGGERS in result["config"]
        assert CONF_SKIP_IRRIGATION_ON_PRECIPITATION in result["config"]
        assert CONF_PRECIPITATION_THRESHOLD_MM in result["config"]

        # Should be able to create Config without TypeError
        config = Config(**result["config"])
        assert config.calctime == "00:00:00"

    @pytest.mark.asyncio
    async def test_migration_with_empty_config(self):
        """Test migration with completely empty config."""
        store = TestMigratableStore()

        empty_data = {"config": {}, "zones": [], "modules": [], "mappings": []}

        result = await store._async_migrate_func(1, empty_data.copy())

        # Should have all required fields
        assert CONF_IRRIGATION_START_TRIGGERS in result["config"]
        assert CONF_SKIP_IRRIGATION_ON_PRECIPITATION in result["config"]
        assert CONF_PRECIPITATION_THRESHOLD_MM in result["config"]

        # Should be able to create Config
        config = Config(**result["config"])
        assert hasattr(config, "irrigation_start_triggers")
        assert hasattr(config, "skip_irrigation_on_precipitation")
        assert hasattr(config, "precipitation_threshold_mm")


if __name__ == "__main__":
    pytest.main([__file__])
