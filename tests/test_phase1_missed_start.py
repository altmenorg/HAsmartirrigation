"""A run whose start has gone by starts now, if it can still finish in time
(phase 1.10).

A trigger that finishes the run by a moment starts it that long before. When
that start was already past as the trigger was armed, the tracker waited for
the next day and nothing ran: a run longer than the night, a calculation set
inside the watering window, a restart at the start time.
"""

from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest
from homeassistant.util import dt as dt_util

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.triggers import TriggersMixin


class _Coordinator(TriggersMixin):
    def __init__(self):
        self.hass = MagicMock()
        self._fire_start_event = MagicMock()


TIME = {
    const.TRIGGER_CONF_NAME: "By seven",
    const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_TIME,
    const.TRIGGER_CONF_AT: "07:00",
}
SUNRISE = {
    const.TRIGGER_CONF_NAME: "default",
    const.TRIGGER_CONF_TYPE: const.TRIGGER_TYPE_SUNRISE,
    const.TRIGGER_CONF_OFFSET_MINUTES: 0,
}


def _at(hour, minute=0):
    local = datetime(2026, 7, 10, hour, minute, tzinfo=dt_util.DEFAULT_TIME_ZONE)
    return dt_util.as_utc(local)


@pytest.mark.parametrize(
    ("hour", "minute", "fires"),
    [
        (6, 30, True),  # start 06:00 gone by, 07:00 still ahead
        (5, 30, False),  # the tracker will start it at 06:00
        (7, 30, False),  # too late: tomorrow's run
    ],
)
def test_a_clock_time_trigger(hour, minute, fires):
    coordinator = _Coordinator()
    # Built here, not at collection: the time zone is set per test.
    with patch.object(dt_util, "utcnow", return_value=_at(hour, minute)):
        coordinator._catch_up_missed_start(TIME, 3600)
    assert coordinator._fire_start_event.called is fires


def test_a_run_longer_than_the_night_starts_after_the_calculation():
    """23:00 calculation, sunrise at 06:00, eight hours of watering: the start
    (22:00) is gone by when the trigger is armed."""
    coordinator = _Coordinator()
    sunrise = _at(6) + timedelta(days=1)
    with (
        patch.object(dt_util, "utcnow", return_value=_at(23)),
        patch(
            "custom_components.smart_irrigation.triggers.get_astral_event_next",
            return_value=sunrise,
        ),
    ):
        coordinator._catch_up_missed_start(SUNRISE, 8 * 3600)
    coordinator._fire_start_event.assert_called_once_with(SUNRISE)


def test_nothing_to_water_starts_nothing():
    coordinator = _Coordinator()
    with patch.object(dt_util, "utcnow", return_value=_at(6, 30)):
        coordinator._catch_up_missed_start(TIME, 0)
    coordinator._fire_start_event.assert_not_called()
