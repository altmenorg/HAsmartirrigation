"""A run that begins while Home Assistant starts must not hold the start up.

Found updating a 10.10 install to 2026.11.1-alpha1 inside its watering window:

* a schedule catching up (or a run resumed after a restart) was a plain task,
  and Home Assistant's start waits for those: it stayed "not running" for the
  whole run. No automation ran meanwhile, and a template switch, whose state
  only follows once Home Assistant has started, never reported its valve open,
  so every zone of the run ended as a valve problem;
* the one-time moves of 2026.11 (one choice, the main program converted) ran
  after the platforms were set up, which arms the start: the first start after
  the update armed the 10.10 start trigger, which could start its run, and the
  programs' schedules were only armed at the next calculation.
"""

import asyncio
from unittest.mock import AsyncMock, Mock, patch

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, HomeAssistant

from custom_components.smart_irrigation import async_setup_entry, const
from custom_components.smart_irrigation.valve_runner import ValveRunnerMixin


class _Runner(ValveRunnerMixin):
    def __init__(self, hass):
        self.hass = hass
        self._valve_run_tasks = set()


async def test_a_run_begun_during_the_start_does_not_hold_it_up(hass: HomeAssistant):
    hass.set_state(CoreState.not_running)
    runner = _Runner(hass)
    opened = asyncio.Event()
    release = asyncio.Event()

    async def _run():
        opened.set()
        await release.wait()

    task = runner._spawn_valve_run(_run())
    # What the start waits for (bootstrap): it no longer waits for the run.
    await asyncio.wait_for(hass.async_block_till_done(), 5)

    assert not opened.is_set()  # nothing is opened before the start is over
    hass.set_state(CoreState.running)
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
    await asyncio.wait_for(opened.wait(), 5)
    assert task in runner._valve_run_tasks

    release.set()
    await task
    assert task not in runner._valve_run_tasks


async def test_a_run_once_home_assistant_runs_starts_at_once(hass: HomeAssistant):
    runner = _Runner(hass)
    opened = asyncio.Event()

    async def _run():
        opened.set()

    await runner._spawn_valve_run(_run())

    assert opened.is_set()


async def test_a_run_cancelled_before_the_start_is_over_never_opens(
    hass: HomeAssistant,
):
    hass.set_state(CoreState.not_running)
    runner = _Runner(hass)
    opened = asyncio.Event()

    async def _run():
        opened.set()

    task = runner._spawn_valve_run(_run())
    await asyncio.sleep(0)
    # An unload while Home Assistant starts (valve_runner.async_teardown_valve_runs).
    task.cancel()
    await asyncio.gather(task, return_exceptions=True)
    hass.set_state(CoreState.running)
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
    await hass.async_block_till_done()

    assert not opened.is_set()


async def test_the_one_time_moves_come_before_anything_is_armed(hass: HomeAssistant):
    order = []
    entry = Mock()
    entry.entry_id = "order"
    entry.unique_id = "order"
    entry.data = {const.CONF_INSTANCE_NAME: "Smart Irrigation"}
    entry.options = {}
    entry.add_update_listener.return_value = Mock()

    coordinator = Mock()
    coordinator.id = "order"
    coordinator.use_weather_service = False
    for name in (
        "async_bind_engineless_zones",
        "async_setup_observed_watering",
        "async_resume_valve_runs",
        "async_restore_pause_and_queue",
        "async_setup_weather_liveness",
        "async_setup_zone_unwatered_watch",
        "async_restore_calculation_issues",
    ):
        setattr(coordinator, name, AsyncMock())
    coordinator.recurring_schedule_manager.async_load_schedules = AsyncMock()
    coordinator.seasonal_adjustment_manager.async_load_adjustments = AsyncMock()
    coordinator.update_subscriptions = AsyncMock(
        side_effect=lambda *a: order.append("subscriptions")
    )

    store = AsyncMock()
    store.async_get_config.return_value = {}
    store.async_get_zones.return_value = []
    store.config = Mock(
        manual_coordinates_enabled=False,
        manual_latitude=None,
        manual_longitude=None,
        manual_elevation=0,
    )
    store.get_config = Mock(
        return_value={
            const.CONF_AUTO_UPDATE_ENABLED: False,
            const.CONF_AUTO_CALC_ENABLED: False,
            const.CONF_AUTO_CLEAR_ENABLED: False,
            const.START_EVENT_FIRED_TODAY: False,
        }
    )
    coordinator.store = store

    def _moved(config):
        order.append("one choice")
        return {}

    def _converted(config, zones, language):
        order.append("programs converted")
        return {}

    with (
        patch(
            "custom_components.smart_irrigation.async_get_registry",
            return_value=store,
        ),
        patch(
            "custom_components.smart_irrigation.SmartIrrigationCoordinator",
            return_value=coordinator,
        ),
        patch("custom_components.smart_irrigation.dr.async_get"),
        patch(
            "custom_components.smart_irrigation._migrate_duration_unique_ids",
            new_callable=AsyncMock,
        ),
        patch("custom_components.smart_irrigation.async_register_panel"),
        patch("custom_components.smart_irrigation.async_register_websockets"),
        patch("custom_components.smart_irrigation.register_services"),
        patch(
            "custom_components.smart_irrigation.migration_changes", side_effect=_moved
        ),
        patch(
            "custom_components.smart_irrigation.conversion_changes",
            side_effect=_converted,
        ),
        patch.object(
            hass.config_entries,
            "async_forward_entry_setups",
            new_callable=AsyncMock,
            side_effect=lambda *a: order.append("platforms"),
        ),
    ):
        assert await async_setup_entry(hass, entry) is True

    assert order == ["one choice", "programs converted", "platforms", "subscriptions"]


async def test_setting_the_timers_up_does_not_undo_what_the_setup_stored(
    hass: HomeAssistant,
):
    """The coordinator's timers were set up from a copy of the whole
    configuration, and one of them (clear weather data, on in 10.10 by default)
    stored that copy back: the move to the one choice, made meanwhile, was undone.
    """
    from custom_components.smart_irrigation import SmartIrrigationCoordinator

    stored = {}
    config = {
        const.CONF_USE_WEATHER_SERVICE: False,
        const.CONF_WEATHER_SERVICE: None,
        const.CONF_AUTO_UPDATE_ENABLED: False,
        const.CONF_AUTO_CALC_ENABLED: False,
        const.CONF_AUTO_CLEAR_ENABLED: True,
        const.CONF_FULL_CONTROLLER: False,
        const.START_EVENT_FIRED_TODAY: False,
    }
    store = Mock()
    store.config.manual_coordinates_enabled = False
    store.get_config.return_value = dict(config)
    store.async_get_config = AsyncMock(return_value=dict(config))
    store.async_get_zones = AsyncMock(return_value=[])

    async def _update(changes):
        stored.update(changes)

    store.async_update_config = AsyncMock(side_effect=_update)
    hass.data[const.DOMAIN] = {
        const.CONF_USE_WEATHER_SERVICE: False,
        const.CONF_WEATHER_SERVICE: None,
    }
    entry = Mock()
    entry.unique_id = "timers"
    entry.data = {}
    entry.options = {}

    coordinator = SmartIrrigationCoordinator(hass, None, entry, store)
    # Not what this is about, and the test plugin fails on a lingering timer.
    if coordinator._track_midnight_time_unsub:
        coordinator._track_midnight_time_unsub()
    # What the setup stores before the timers' tasks have run (one_choice.py).
    await store.async_update_config({const.CONF_FULL_CONTROLLER: True})
    await hass.async_block_till_done()

    assert stored == {const.CONF_FULL_CONTROLLER: True}
