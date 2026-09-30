"""Recurring schedules can be created, changed and deleted, and are saved.

create, update and delete all called a _save_schedules that was never
written, so each raised an AttributeError: no recurring schedule could ever be
created. Found by creating one on a real install.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.scheduler import RecurringScheduleManager


def _manager():
    coordinator = MagicMock()
    coordinator.store.async_update_config = AsyncMock()
    coordinator.store.async_get_config = AsyncMock(return_value={})
    return RecurringScheduleManager(MagicMock(), coordinator), coordinator


def _saved(coordinator):
    return coordinator.store.async_update_config.await_args.args[0][
        const.CONF_RECURRING_SCHEDULES
    ]


@pytest.mark.asyncio
async def test_a_schedule_is_created_saved_changed_and_deleted():
    manager, coordinator = _manager()
    with patch(
        "custom_components.smart_irrigation.scheduler.async_track_time_change",
        return_value=MagicMock(),
    ):
        await manager.async_create_schedule(
            {
                const.SCHEDULE_CONF_NAME: "Morning",
                const.SCHEDULE_CONF_TYPE: const.SCHEDULE_TYPE_DAILY,
                const.SCHEDULE_CONF_TIME: "06:30",
                const.SCHEDULE_CONF_ACTION: "update",
            }
        )
        saved = _saved(coordinator)
        assert [s[const.SCHEDULE_CONF_NAME] for s in saved] == ["Morning"]
        schedule_id = saved[0][const.SCHEDULE_CONF_ID]

        await manager.async_update_schedule(
            schedule_id,
            {
                const.SCHEDULE_CONF_NAME: "Early",
                const.SCHEDULE_CONF_TYPE: const.SCHEDULE_TYPE_DAILY,
                const.SCHEDULE_CONF_TIME: "05:30",
            },
        )
        assert _saved(coordinator)[0][const.SCHEDULE_CONF_TIME] == "05:30"

    await manager.async_delete_schedule(schedule_id)
    assert _saved(coordinator) == []
