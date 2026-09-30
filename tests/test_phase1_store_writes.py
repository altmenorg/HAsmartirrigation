"""What a power cut must not lose is written at once, the rest is batched
(phase 1.15).

Every reading used to write the whole store, every buffer included: a burst of
continuous updates was one full write per reading. Changes now wait ten
seconds and go out together, except an open valve (lost, it stays open after
a restart) and a zone's bucket (lost, the zone is watered twice).
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import (
    SAVE_DELAY,
    Config,
    SmartIrrigationStorage,
    ZoneEntry,
)


def _storage():
    storage = SmartIrrigationStorage.__new__(SmartIrrigationStorage)
    storage._store = MagicMock()
    storage._store.async_save = AsyncMock()
    storage._data_to_save = MagicMock(return_value={})
    storage.config = Config()
    storage.zones = {0: ZoneEntry(id=0, name="Lawn")}
    return storage


def test_the_store_waits_to_batch_changes():
    assert SAVE_DELAY >= 5


@pytest.mark.asyncio
async def test_a_bucket_is_written_at_once():
    storage = _storage()
    await storage.async_update_zone(0, {const.ZONE_BUCKET: -3.0})
    storage._store.async_save.assert_awaited_once()


@pytest.mark.asyncio
async def test_other_zone_changes_are_batched():
    storage = _storage()
    await storage.async_update_zone(0, {const.ZONE_NAME: "Front lawn"})
    storage._store.async_save.assert_not_awaited()
    storage._store.async_delay_save.assert_called_once()


@pytest.mark.asyncio
async def test_an_open_valve_is_written_at_once():
    storage = _storage()
    await storage.async_update_config({const.CONF_ACTIVE_VALVE_RUNS: [{"zone": 0}]})
    storage._store.async_save.assert_awaited_once()
