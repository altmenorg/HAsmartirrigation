"""Days-between-irrigation counting and the trigger fail-safe (#802, #804).

``days_since_last_irrigation`` used to be advanced twice on a skipped day: once
by the midnight reset and once again by the skip branch of the start trigger.
The counter then reached the threshold in about half the configured time, so a
"days between irrigation" of 5 watered every 3 days.

The same trigger path also fired the start event from its exception handler, so
an error while evaluating the skip conditions was treated as permission to
irrigate.
"""

from unittest.mock import MagicMock

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.skip_conditions import SkipConditionsMixin
from custom_components.smart_irrigation.triggers import TriggersMixin


class _Store:
    def __init__(self, config):
        self._config = config
        # getattr(store.config, CONF_DIRECT_VALVE_CONTROL_ENABLED, False) must
        # come out False: no direct valve control in these tests.
        self.config = object()

    async def async_get_config(self):
        return dict(self._config)

    async def async_update_config(self, data):
        self._config.update(data)


class _Coordinator(TriggersMixin, SkipConditionsMixin):
    """Just enough coordinator to drive the once-per-day watering decision."""

    def __init__(self, days_between, days_since=None):
        self.store = _Store(
            {
                const.CONF_DAYS_BETWEEN_IRRIGATION: days_between,
                # Start as if the threshold had just been reached, so day 0 of
                # a run is a watering day.
                const.CONF_DAYS_SINCE_LAST_IRRIGATION: (
                    days_between if days_since is None else days_since
                ),
                const.CONF_SKIP_IRRIGATION_ON_PRECIPITATION: False,
            }
        )
        self.hass = MagicMock()
        self.hass.bus.fire = MagicMock()
        # Collect the fire-and-forget tasks so the test can await them.
        self._pending = []
        self.hass.async_create_task = self._pending.append
        self._fired_triggers_today = set()
        self._watering_decision_today = None
        self._start_event_fired_today = False

    @property
    def days_since(self):
        return self.store._config[const.CONF_DAYS_SINCE_LAST_IRRIGATION]

    @property
    def fire_count(self):
        """How many times the run actually started.

        Counting every event would count a skip too, now that a skipped day
        says so rather than staying silent (#841).
        """
        return len(
            [
                call
                for call in self.hass.bus.fire.call_args_list
                if call.args
                and call.args[0] == f"{const.DOMAIN}_{const.EVENT_IRRIGATE_START}"
            ]
        )

    @property
    def skip_count(self):
        return len(
            [
                call
                for call in self.hass.bus.fire.call_args_list
                if call.args
                and call.args[0] == f"{const.DOMAIN}_{const.EVENT_IRRIGATE_SKIPPED}"
            ]
        )

    async def _drain(self):
        while self._pending:
            await self._pending.pop(0)

    async def reach_trigger(self):
        """The configured start trigger is reached (e.g. sunrise)."""
        self._fire_start_event({const.TRIGGER_CONF_NAME: "sunrise"})
        await self._drain()

    async def midnight(self):
        """A new calendar day begins."""
        self._reset_event_fired_today()
        await self._drain()


async def _watering_days(days_between, days):
    """Return the days (0-based) on which the start event actually fired."""
    coordinator = _Coordinator(days_between)
    fired = []
    for day in range(days):
        if day:
            await coordinator.midnight()
        before = coordinator.fire_count
        await coordinator.reach_trigger()
        if coordinator.fire_count > before:
            fired.append(day)
    return fired


async def test_skipped_day_leaves_the_counter_to_the_midnight_reset():
    coordinator = _Coordinator(5, days_since=2)

    await coordinator.reach_trigger()

    assert coordinator.fire_count == 0
    # Silent before: the skip is now something an automation can hear.
    assert coordinator.skip_count == 1
    assert coordinator.days_since == 2


async def test_a_calendar_day_advances_the_counter_exactly_once():
    coordinator = _Coordinator(5, days_since=2)

    await coordinator.midnight()
    await coordinator.reach_trigger()

    assert coordinator.days_since == 3


async def test_days_between_five_waters_every_five_days():
    # The reported symptom: this used to be [0, 3, 6, 9].
    assert await _watering_days(5, 11) == [0, 5, 10]


async def test_days_between_seven_waters_every_seven_days():
    assert await _watering_days(7, 15) == [0, 7, 14]


async def test_days_between_one_waters_every_day():
    assert await _watering_days(1, 4) == [0, 1, 2, 3]


async def test_days_between_zero_is_no_restriction():
    assert await _watering_days(0, 4) == [0, 1, 2, 3]


async def test_watering_resets_the_counter():
    coordinator = _Coordinator(3, days_since=3)

    await coordinator.reach_trigger()

    assert coordinator.fire_count == 1
    assert coordinator.days_since == 0


async def test_precipitation_skip_does_not_advance_the_counter():
    coordinator = _Coordinator(3, days_since=3)

    async def _rain():
        return {
            "id": "precipitation",
            "enabled": True,
            "available": True,
            "skip": True,
            "forecast_mm": 9.0,
            "threshold_mm": 2.0,
        }

    coordinator._evaluate_precipitation_forecast = _rain

    await coordinator.reach_trigger()

    assert coordinator.fire_count == 0
    assert coordinator.days_since == 3


async def test_start_event_is_not_fired_when_the_decision_cannot_be_evaluated():
    """#804: an unevaluated decision must not be read as "go ahead and water"."""
    coordinator = _Coordinator(0)

    async def _boom():
        raise RuntimeError("weather service unreachable")

    # The evaluation is the seam the runner calls; an error there must still
    # reach the fail-safe rather than being read as "nothing vetoes, water".
    coordinator._evaluate_precipitation_forecast = _boom

    await coordinator.reach_trigger()

    assert coordinator.fire_count == 0


async def test_failure_after_firing_does_not_fire_a_second_time():
    """The old handler re-fired on any exception, including post-fire ones."""
    coordinator = _Coordinator(0)

    async def _boom():
        raise RuntimeError("store is gone")

    coordinator._reset_days_since_irrigation = _boom

    await coordinator.reach_trigger()

    assert coordinator.fire_count == 1
