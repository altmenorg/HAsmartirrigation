"""Calculating a zone that has read every reading does nothing, and does not
raise.

The aggregate of an empty window is None, and it was handed to the
calculation, which read values from it and raised. The all-zones path already
skipped such a zone. The same fault was found and fixed in frankyhun's fork.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


@pytest.mark.asyncio
async def test_a_zone_with_nothing_new_is_not_calculated():
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(
        return_value={const.ZONE_ID: 1, const.ZONE_NAME: "Lawn", const.ZONE_MAPPING: 0}
    )
    coordinator.store.get_mapping = MagicMock(
        return_value={const.MAPPING_DATA: [{const.MAPPING_TEMPERATURE: 20.0}]}
    )
    coordinator.apply_aggregates_to_mapping_data = AsyncMock(return_value=None)
    coordinator.async_calculate_zone = AsyncMock()

    result = await coordinator.async_update_zone_config(
        zone_id=1, data={const.ATTR_CALCULATE: const.ATTR_CALCULATE}
    )

    assert result is None
    coordinator.async_calculate_zone.assert_not_awaited()
