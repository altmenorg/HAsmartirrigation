"""The reset button asserts the bucket as the reset_bucket service does.

It wrote 0 straight to the store, so the rain and the evaporation collected
before the reset were counted again on top of the value it asserts (#811).
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.button import (
    SmartIrrigationZoneResetBucketButton,
)


@pytest.mark.asyncio
async def test_the_reset_button_goes_through_the_bucket_assertion():
    coordinator = MagicMock()
    coordinator.async_update_zone_config = AsyncMock()
    coordinator.store.async_update_zone = AsyncMock()
    hass = MagicMock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    button = SmartIrrigationZoneResetBucketButton(
        hass, "button.lawn_reset_bucket", 4, "Lawn"
    )

    await button.async_press()

    coordinator.async_update_zone_config.assert_awaited_once_with(
        zone_id=4,
        data={const.ATTR_SET_BUCKET: {}, const.ATTR_NEW_BUCKET_VALUE: 0},
    )
    coordinator.store.async_update_zone.assert_not_awaited()
