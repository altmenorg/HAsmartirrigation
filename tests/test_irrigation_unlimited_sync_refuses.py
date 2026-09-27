"""The Irrigation Unlimited sync services say they cannot work (#696).

The sync subsystem reads a flag, ``irrigation_unlimited_integration``, that is
not a setting of this integration: it is in no schema, no panel and no store, so
it is always false and every entry point is unreachable. The services were
published anyway, and they answered a call by returning False and writing
"Failed to send zone data to Irrigation Unlimited" at warning level. Somebody
spent an evening on that, reasonably assuming their configuration was wrong.

A service that cannot work has to say so. The supported path is the blueprint,
which calls IU's own ``adjust_time`` with the calculated duration, and the
refusal points at it.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation.exceptions import SmartIrrigationError
from custom_components.smart_irrigation.irrigation_unlimited import (
    NO_IU_SYNC,
    IrrigationUnlimitedIntegration,
)


def _integration():
    coordinator = MagicMock()
    coordinator.store.async_get_config = AsyncMock(return_value={})
    coordinator.store.get_zone = MagicMock(return_value={"id": 1, "name": "Lawn"})
    coordinator.store.async_get_zones = AsyncMock(return_value=[])
    return IrrigationUnlimitedIntegration(MagicMock(), coordinator)


@pytest.mark.asyncio
async def test_initialising_leaves_it_off():
    """There is no configuration that turns it on."""
    integration = _integration()

    await integration.async_initialize()

    assert integration.is_enabled() is False


@pytest.mark.asyncio
async def test_sending_zone_data_refuses_and_says_why():
    integration = _integration()

    with pytest.raises(SmartIrrigationError) as raised:
        await integration.async_send_zone_data_to_iu(1, {"duration": 600})

    assert str(raised.value) == NO_IU_SYNC


@pytest.mark.asyncio
async def test_syncing_zones_refuses():
    integration = _integration()

    with pytest.raises(SmartIrrigationError):
        await integration.async_sync_zones_to_iu()


@pytest.mark.asyncio
async def test_creating_schedules_refuses():
    integration = _integration()

    with pytest.raises(SmartIrrigationError):
        await integration.async_create_iu_schedule_from_smart_irrigation()


@pytest.mark.asyncio
async def test_asking_for_the_status_is_answered_rather_than_refused():
    """"Is it on" is a fair question and the answer is no."""
    integration = _integration()

    status = await integration.async_get_iu_status()

    assert status["enabled"] is False
    assert status["entities"] == []
    assert status["reason"] == NO_IU_SYNC


def test_the_refusal_points_at_the_supported_path():
    """A refusal that does not say what to do instead is half a refusal."""
    assert "blueprint" in NO_IU_SYNC
    assert "adjust_time" in NO_IU_SYNC
    assert "usage-automations" in NO_IU_SYNC
