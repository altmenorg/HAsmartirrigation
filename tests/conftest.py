"""Fixtures for testing."""

import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest

# Add the repository root to Python path so custom component imports work
repo_root = Path(__file__).parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))


# Patch problematic Home Assistant modules before any imports
def patch_homeassistant_modules():
    """Patch Home Assistant modules that cause import issues."""
    # Create mock modules for problematic HA components
    mock_modules = [
        "homeassistant.helpers",
        "homeassistant.helpers.device_registry",
        "homeassistant.helpers.entity_registry",
        "homeassistant.components.frontend",
        "homeassistant.components.websocket_api",
        "homeassistant.components.http",
        "homeassistant.components.logger",
        "homeassistant.components.system_log",
    ]

    for module_name in mock_modules:
        if module_name not in sys.modules:
            sys.modules[module_name] = MagicMock()


# Apply patches early
patch_homeassistant_modules()


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Enable custom integrations for all tests."""
    yield


@pytest.fixture
def mock_hass():
    """Return a mock Home Assistant instance."""
    hass = Mock()
    hass.config = Mock()
    hass.config.config_dir = "/tmp/test_config"
    hass.config.latitude = 52.379189
    hass.config.longitude = 4.899431
    hass.config.elevation = 0
    hass.config.units = Mock()
    hass.config.time_zone = "UTC"

    hass.data = {}
    hass.states = Mock()
    hass.states.async_set = AsyncMock()
    hass.states.get = Mock(return_value=None)

    hass.services = Mock()
    hass.services.async_call = AsyncMock()

    hass.bus = Mock()
    hass.bus.async_listen = Mock()
    hass.bus.async_fire = AsyncMock()

    hass.async_add_executor_job = AsyncMock()
    hass.async_create_task = AsyncMock()

    return hass


@pytest.fixture
def mock_entry():
    """Return a mock config entry."""
    from homeassistant.const import CONF_ELEVATION, CONF_LATITUDE, CONF_LONGITUDE

    from custom_components.smart_irrigation import const
    from tests.common import MockConfigEntry

    return MockConfigEntry(
        domain=const.DOMAIN,
        title=const.NAME,
        data={
            const.CONF_INSTANCE_NAME: "Test Smart Irrigation",
            const.CONF_USE_WEATHER_SERVICE: False,
            CONF_LATITUDE: 52.379189,
            CONF_LONGITUDE: 4.899431,
            CONF_ELEVATION: 0,
        },
        entry_id="test_entry_id",
        unique_id="test_unique_id",
    )


@pytest.fixture
def mock_store():
    """Return a mock store."""
    from custom_components.smart_irrigation import const

    store = Mock()
    store.async_get_config = AsyncMock(return_value={})
    store.async_get_all_zones = AsyncMock(return_value=[])
    store.async_get_zone = AsyncMock(return_value=None)
    store.async_save_zone = AsyncMock()
    store.async_delete_zone = AsyncMock()
    store.set_up_factory_defaults = AsyncMock()
    store.get_mappings = Mock(return_value={})
    store.get_modules = Mock(return_value={})
    store.get_zones = Mock(return_value={})
    # Add get_config method that returns a sync dict - not a coroutine
    default_config = {
        const.CONF_AUTO_UPDATE_ENABLED: False,
        const.CONF_AUTO_CALC_ENABLED: False,
        const.CONF_USE_WEATHER_SERVICE: False,
    }
    store.get_config = Mock(return_value=default_config)
    return store


@pytest.fixture
def mock_coordinator(mock_store):
    """Return a mock coordinator."""
    coordinator = Mock()
    coordinator.id = "test_coordinator_id"
    coordinator.store = mock_store
    coordinator.use_weather_service = False
    coordinator.update_subscriptions = AsyncMock()
    coordinator.async_unload = AsyncMock()
    coordinator.async_delete_config = AsyncMock()
    coordinator.setup_SmartIrrigation_entities = AsyncMock()

    # Mock service handlers
    coordinator.handle_reset_bucket = AsyncMock()
    coordinator.handle_reset_all_buckets = AsyncMock()

    # Mock unsubscribe methods
    coordinator.unsubscribe_calc_updates = Mock()
    coordinator.unsubscribe_hourly_updates = Mock()
    coordinator.unsubscribe_minutely_updates = Mock()
    coordinator.unsubscribe_daily_updates = Mock()
    coordinator.unsubscribe_sun_updates = Mock()

    return coordinator
