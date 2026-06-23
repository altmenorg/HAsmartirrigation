"""Common test utilities for Smart Irrigation tests."""

from unittest.mock import Mock

from homeassistant.config_entries import ConfigEntry
from homeassistant.data_entry_flow import FlowResultType


class MockConfigEntry(ConfigEntry):
    """Mock ConfigEntry for testing."""

    def __init__(self, **kwargs):
        """Initialize mock config entry."""
        # Set default values
        default_data = {
            "domain": "smart_irrigation",
            "title": "Smart Irrigation Test",
            "data": {},
            "options": {},
            "source": "user",
            "unique_id": "test_unique_id",
            "discovery_keys": set(),
        }
        default_data.update(kwargs)

        # Initialize with all required attributes
        super().__init__(
            version=default_data.get("version", 1),
            minor_version=default_data.get("minor_version", 1),
            domain=default_data["domain"],
            title=default_data["title"],
            data=default_data["data"],
            options=default_data["options"],
            source=default_data["source"],
            unique_id=default_data["unique_id"],
            discovery_keys=default_data["discovery_keys"],
        )

        # Note: Don't try to set state as it's read-only in newer HA versions


def mock_flow_result(
    result_type: FlowResultType = FlowResultType.CREATE_ENTRY, **kwargs
):
    """Create a mock flow result."""
    return {
        "type": result_type,
        "title": kwargs.get("title", "Test"),
        "data": kwargs.get("data", {}),
        "errors": kwargs.get("errors", {}),
        "description_placeholders": kwargs.get("description_placeholders", {}),
    }
