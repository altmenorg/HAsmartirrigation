"""Whether a start trigger is actually armed, and saying so (#841).

Two reports of the same shape: the countdown on the Info page reaches zero, no
event fires, and it rolls over to tomorrow; on one of them it "starts working
again after restarting Home Assistant".

The time on that page is arithmetic -- a sunrise, an offset, a duration -- and
it was printed whether or not anything was scheduled to act on it. Registration
happens after a calculation and after a zone is edited, and it deliberately arms
nothing when no zone needs water, so an installation could sit unarmed until one
of those happened again. Hence two things here:

- registration records whether it armed anything, and the panel says when a run
  is owed and nothing is scheduled;
- midnight re-arms it, so nothing can stay unarmed until a restart.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.triggers import TriggersMixin


class _Coordinator(TriggersMixin):
    def __init__(self, config, total_duration):
        self.hass = MagicMock()
        self.store = MagicMock()
        self.store.async_get_config = AsyncMock(return_value=config)
        self.store.async_update_config = AsyncMock()
        self.store.config = MagicMock()
        self._track_sunrise_event_unsub = None
        self._track_irrigation_triggers_unsub = []
        self._fired_triggers_today = set()
        self._watering_decision_today = None
        self._start_event_fired_today = False
        self.start_trigger_armed = False
        self.get_total_duration_all_enabled_zones = AsyncMock(
            return_value=total_duration
        )
        self._increment_days_since_irrigation = AsyncMock()
        self.tasks = []
        self.hass.async_create_task = lambda coro: self.tasks.append(coro)


def _trigger(**overrides):
    trigger = {
        const.TRIGGER_CONF_NAME: "Morning",
        const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_SUNRISE,
        const.TRIGGER_CONF_OFFSET_MINUTES: 0,
        const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: True,
        const.TRIGGER_CONF_ENABLED: True,
    }
    trigger.update(overrides)
    return trigger


def _close(tasks):
    for coro in tasks:
        coro.close()
    tasks.clear()


@pytest.mark.asyncio
async def test_the_default_trigger_arms_when_a_run_is_owed():
    coordinator = _Coordinator({}, 1800)

    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        track.return_value = lambda: None
        await coordinator.register_start_event()

    assert coordinator.start_trigger_armed is True
    track.assert_called_once()


@pytest.mark.asyncio
async def test_the_default_trigger_arms_nothing_when_no_zone_needs_water():
    """Which is correct, and is exactly what the panel has to know about."""
    coordinator = _Coordinator({}, 0)

    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        await coordinator.register_start_event()

    assert coordinator.start_trigger_armed is False
    track.assert_not_called()


@pytest.mark.asyncio
async def test_a_named_trigger_arms():
    coordinator = _Coordinator(
        {
            const.CONF_IRRIGATION_START_TRIGGERS: [_trigger()],
            const.CONF_ACTIVE_START_TRIGGER: "Morning",
        },
        1800,
    )

    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        track.return_value = lambda: None
        await coordinator.register_start_event()

    assert coordinator.start_trigger_armed is True


@pytest.mark.asyncio
async def test_a_disabled_trigger_arms_nothing():
    coordinator = _Coordinator(
        {
            const.CONF_IRRIGATION_START_TRIGGERS: [
                _trigger(**{const.TRIGGER_CONF_ENABLED: False})
            ],
            const.CONF_ACTIVE_START_TRIGGER: "Morning",
        },
        1800,
    )

    await coordinator.register_start_event()

    assert coordinator.start_trigger_armed is False


@pytest.mark.asyncio
async def test_a_trigger_that_does_not_account_for_the_duration_still_arms():
    """It fires at a fixed offset, so it does not need a duration to be placed."""
    coordinator = _Coordinator(
        {
            const.CONF_IRRIGATION_START_TRIGGERS: [
                _trigger(**{const.TRIGGER_CONF_ACCOUNT_FOR_DURATION: False})
            ],
            const.CONF_ACTIVE_START_TRIGGER: "Morning",
        },
        0,
    )

    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        track.return_value = lambda: None
        await coordinator.register_start_event()

    assert coordinator.start_trigger_armed is True


@pytest.mark.asyncio
async def test_registering_again_starts_from_unarmed():
    """The first thing registration does is drop what was armed, so the flag
    cannot survive from a previous call and describe a tracker that is gone."""
    coordinator = _Coordinator({}, 1800)
    with patch(
        "custom_components.smart_irrigation.triggers.async_track_sunrise"
    ) as track:
        track.return_value = lambda: None
        await coordinator.register_start_event()
    assert coordinator.start_trigger_armed is True

    coordinator.get_total_duration_all_enabled_zones = AsyncMock(return_value=0)
    await coordinator.register_start_event()

    assert coordinator.start_trigger_armed is False


def test_midnight_arms_the_trigger_again():
    """The fix for "it works again after a restart": nothing can stay unarmed
    for longer than a day."""
    coordinator = _Coordinator({}, 1800)

    coordinator._reset_event_fired_today()

    assert len(coordinator.tasks) == 2, "the day counter, and the registration"
    names = [getattr(coro, "__qualname__", str(coro)) for coro in coordinator.tasks]
    assert any("register_start_event" in name for name in names)
    _close(coordinator.tasks)


def test_midnight_still_resets_the_day():
    coordinator = _Coordinator({}, 1800)
    coordinator._fired_triggers_today.add("Morning")
    coordinator._watering_decision_today = False

    coordinator._reset_event_fired_today()

    assert coordinator._fired_triggers_today == set()
    assert coordinator._watering_decision_today is None
    _close(coordinator.tasks)
