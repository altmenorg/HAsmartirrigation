"""Unit tests for the OpenSprinkler bridge."""

import asyncio
import importlib.util
import sys
import types
from pathlib import Path
from unittest.mock import AsyncMock, Mock

import pytest

COMPONENT_DIR = Path(__file__).parents[1] / "custom_components" / "smart_irrigation"
PACKAGE_NAME = "_smart_irrigation_opensprinkler_unit"

package = types.ModuleType(PACKAGE_NAME)
package.__path__ = [str(COMPONENT_DIR)]
sys.modules[PACKAGE_NAME] = package

homeassistant_core = types.ModuleType("homeassistant.core")
homeassistant_core.HomeAssistant = object
sys.modules["homeassistant.core"] = homeassistant_core

const_spec = importlib.util.spec_from_file_location(
    f"{PACKAGE_NAME}.const", COMPONENT_DIR / "const.py"
)
const = importlib.util.module_from_spec(const_spec)
sys.modules[f"{PACKAGE_NAME}.const"] = const
const_spec.loader.exec_module(const)

opensprinkler_spec = importlib.util.spec_from_file_location(
    f"{PACKAGE_NAME}.opensprinkler", COMPONENT_DIR / "opensprinkler.py"
)
opensprinkler = importlib.util.module_from_spec(opensprinkler_spec)
sys.modules[f"{PACKAGE_NAME}.opensprinkler"] = opensprinkler
opensprinkler_spec.loader.exec_module(opensprinkler)
OpenSprinklerBridge = opensprinkler.OpenSprinklerBridge


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations():
    """Keep these unit tests out of the Home Assistant integration fixture stack."""
    yield


@pytest.fixture
def hass():
    """Return a minimal Home Assistant mock."""
    hass = Mock()
    hass.services = Mock()
    hass.services.has_service = Mock(return_value=True)
    hass.services.async_call = AsyncMock()
    hass.bus = Mock()
    hass.bus.fire = Mock()
    return hass


@pytest.fixture
def store():
    """Return a minimal Smart Irrigation store mock."""
    store = Mock()
    store.async_get_config = AsyncMock(
        return_value={
            const.CONF_OPENSPRINKLER_INTEGRATION: True,
            const.CONF_OPENSPRINKLER_STATION_MAP: {
                "1": "switch.opensprinkler_station_1"
            },
            const.CONF_OPENSPRINKLER_QUEUE_OPTION: "append",
        }
    )
    store.get_zone = Mock(
        return_value={
            const.ZONE_ID: 1,
            const.ZONE_NAME: "Front Lawn",
            const.ZONE_DURATION: 600,
        }
    )
    store.async_get_zones = AsyncMock(
        return_value=[
            {
                const.ZONE_ID: 1,
                const.ZONE_NAME: "Front Lawn",
                const.ZONE_DURATION: 600,
            },
            {
                const.ZONE_ID: 2,
                const.ZONE_NAME: "Beds",
                const.ZONE_DURATION: 0,
            },
        ]
    )
    return store


@pytest.fixture
def bridge(hass, store):
    """Return an initialized bridge subject."""
    coordinator = Mock()
    coordinator.store = store
    return OpenSprinklerBridge(hass, coordinator)


def test_initialize_loads_enabled_configuration(bridge):
    """Test bridge configuration is loaded from Smart Irrigation config."""
    asyncio.run(bridge.async_initialize())

    status = asyncio.run(bridge.async_get_status())

    assert status["enabled"] is True
    assert status["run_station_service_available"] is True
    assert status["queue_option"] == "append"
    assert status["mapped_zones"] == {"1": "switch.opensprinkler_station_1"}


def test_run_zone_calls_opensprinkler_run_station(hass, bridge):
    """Test a mapped Smart Irrigation zone runs the OpenSprinkler station."""
    asyncio.run(bridge.async_initialize())

    result = asyncio.run(bridge.async_run_zone(1))

    hass.services.async_call.assert_awaited_once_with(
        "opensprinkler",
        "run_station",
        {
            "entity_id": "switch.opensprinkler_station_1",
            "run_seconds": 600,
            "queue_option": "append",
        },
        blocking=True,
    )
    assert result["station_entity_id"] == "switch.opensprinkler_station_1"
    assert result["run_seconds"] == 600
    assert result["skipped"] is False


def test_run_zone_allows_entity_and_duration_override(hass, bridge):
    """Test manual service calls can override mapping and duration."""
    asyncio.run(bridge.async_initialize())

    asyncio.run(
        bridge.async_run_zone(
            1,
            station_entity_id="switch.opensprinkler_station_override",
            run_seconds=90,
            queue_option="replace",
        )
    )

    hass.services.async_call.assert_awaited_once_with(
        "opensprinkler",
        "run_station",
        {
            "entity_id": "switch.opensprinkler_station_override",
            "run_seconds": 90,
            "queue_option": "replace",
        },
        blocking=True,
    )


def test_run_zone_skips_zero_duration(hass, bridge, store):
    """Test zero-duration zones do not call the controller."""
    store.get_zone.return_value[const.ZONE_DURATION] = 0
    asyncio.run(bridge.async_initialize())

    result = asyncio.run(bridge.async_run_zone(1))

    hass.services.async_call.assert_not_awaited()
    assert result["skipped"] is True
    assert result["reason"] == "Zone duration is 0"


def test_run_zone_requires_bridge_enabled(bridge, store):
    """Test disabled bridge refuses controller runs."""
    store.async_get_config.return_value[const.CONF_OPENSPRINKLER_INTEGRATION] = False
    asyncio.run(bridge.async_initialize())

    with pytest.raises(ValueError, match="OpenSprinkler bridge is not enabled"):
        asyncio.run(bridge.async_run_zone(1))


def test_run_zone_requires_opensprinkler_service(hass, bridge):
    """Test missing hass-opensprinkler service is reported clearly."""
    hass.services.has_service.return_value = False
    asyncio.run(bridge.async_initialize())

    with pytest.raises(ValueError, match="run_station service is not available"):
        asyncio.run(bridge.async_run_zone(1))


def test_run_zones_collects_started_skipped_and_errors(hass, bridge, store):
    """Test multi-zone runs continue when one zone is not mapped."""
    asyncio.run(bridge.async_initialize())
    store.get_zone.side_effect = [
        {
            const.ZONE_ID: 1,
            const.ZONE_NAME: "Front Lawn",
            const.ZONE_DURATION: 600,
        },
        {
            const.ZONE_ID: 2,
            const.ZONE_NAME: "Beds",
            const.ZONE_DURATION: 120,
        },
    ]

    result = asyncio.run(bridge.async_run_zones())

    assert len(result["started"]) == 1
    assert len(result["skipped"]) == 0
    assert len(result["errors"]) == 1
    assert result["errors"][0]["zone_id"] == 2
    hass.bus.fire.assert_called_once()
