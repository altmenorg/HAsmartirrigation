"""A sensor change updates only the groups that read that sensor (audit 0.7).

The update was scheduled once per sensor group, whether or not the group used
the entity that changed: a group with static values got a new record, and its
zones were recalculated, on every change of any sensor of any group.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _mapping(mapping_id, entity):
    return {
        const.MAPPING_ID: mapping_id,
        const.MAPPING_DATA: [],
        const.MAPPING_MAPPINGS: {
            const.MAPPING_TEMPERATURE: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
                const.MAPPING_CONF_SENSOR: entity,
            },
            const.MAPPING_HUMIDITY: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_STATIC_VALUE,
                const.MAPPING_CONF_STATIC_VALUE: 60,
            },
        },
    }


@pytest.mark.asyncio
async def test_only_the_group_that_reads_the_sensor_is_updated():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator._debounced_update_cancel = {}
    coordinator.store = MagicMock()
    coordinator.store.async_get_config = AsyncMock(
        return_value={const.CONF_SENSOR_DEBOUNCE: 0}
    )
    coordinator.store.async_get_mappings = AsyncMock(
        return_value=[_mapping(0, "sensor.garden"), _mapping(1, "sensor.greenhouse")]
    )
    coordinator.store.async_update_mapping = AsyncMock()
    coordinator._sensor_reading_to_metric = lambda key, val, state, obj: float(state)
    coordinator.async_continuous_update_for_mapping = AsyncMock()
    new_state = MagicMock()
    new_state.state = "21.5"
    event = MagicMock()
    event.data = {"entity_id": "sensor.garden", "new_state": new_state}

    await coordinator.async_sensor_state_changed(event)

    coordinator.async_continuous_update_for_mapping.assert_awaited_once_with(0)
