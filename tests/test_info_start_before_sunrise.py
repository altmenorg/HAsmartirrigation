"""The next start of a sun trigger, from its start until the sun event.

The Info page works the start out from the next sunrise: sunrise minus the run.
From that start until sunrise, the next sunrise is still today while its start
has gone by, and the page showed a start in the past (06:13 at 06:30). The
planning, which only lists starts ahead, left the run out. The tracker fires
next at tomorrow's sunrise minus the run, and that is the start shown now.
"""

from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.smart_irrigation import const, websockets

SUNRISE_TODAY = datetime(2026, 11, 3, 6, 4, tzinfo=UTC)
SUNRISE_TOMORROW = datetime(2026, 11, 4, 6, 6, tzinfo=UTC)
RUN = 3081


def _astral(hass, event, after):
    """Sunrise today, or tomorrow once today's is behind ``after``."""
    assert event == "sunrise"
    return SUNRISE_TODAY if after < SUNRISE_TODAY else SUNRISE_TOMORROW


def test_a_start_ahead_is_left_as_it_is(freezer):
    freezer.move_to("2026-11-03 04:00:00+00:00")
    start = SUNRISE_TODAY - timedelta(seconds=RUN)

    with patch.object(websockets, "get_astral_event_next") as astral:
        assert websockets._next_sun_trigger_start(None, "sunrise", -RUN, start) == start
    astral.assert_not_called()


def test_a_start_gone_by_before_sunrise_is_tomorrows(freezer):
    freezer.move_to("2026-11-03 05:30:00+00:00")  # 06:30 in Nuremberg
    start = SUNRISE_TODAY - timedelta(seconds=RUN)  # 05:12:39, gone by

    with patch.object(websockets, "get_astral_event_next", side_effect=_astral):
        moved = websockets._next_sun_trigger_start(None, "sunrise", -RUN, start)

    assert moved == SUNRISE_TOMORROW - timedelta(seconds=RUN)
    assert moved > datetime(2026, 11, 3, 5, 30, tzinfo=UTC)


def test_a_start_that_cannot_be_placed_again_is_kept(freezer):
    freezer.move_to("2026-11-03 05:30:00+00:00")
    start = SUNRISE_TODAY - timedelta(seconds=RUN)

    with patch.object(
        websockets, "get_astral_event_next", side_effect=ValueError("no sun")
    ):
        assert websockets._next_sun_trigger_start(None, "sunrise", -RUN, start) == start


def test_a_naive_fallback_start_is_left_alone():
    """A start without a time zone cannot be compared: it is left as it is."""
    start = datetime(2026, 11, 4, 6, 0)

    assert websockets._next_sun_trigger_start(None, "sunrise", -RUN, start) == start


async def test_the_info_page_gives_tomorrows_start_inside_the_window(freezer):
    freezer.move_to("2026-11-03 05:30:00+00:00")
    coordinator = MagicMock()
    coordinator.main_program_uses_schedules = lambda: False
    coordinator.store.async_get_zones = AsyncMock(
        return_value=[
            {
                const.ZONE_ID: 0,
                const.ZONE_NAME: "Lawn",
                const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
                const.ZONE_DURATION: RUN,
                const.ZONE_LINKED_ENTITY: "switch.lawn",
            }
        ]
    )
    coordinator.store.async_get_config = AsyncMock(return_value={})
    coordinator.store.config = SimpleNamespace(full_controller=False, programs=[])
    coordinator.get_total_duration_all_enabled_zones = AsyncMock(return_value=RUN)
    coordinator.async_estimate_all_zones_now = AsyncMock(return_value={})
    coordinator._planned_durations = AsyncMock(return_value={})
    coordinator.async_evaluate_skip_conditions = AsyncMock(
        return_value={"should_skip": False, "reason": None, "checks": []}
    )
    hass = MagicMock()
    hass.states.get.return_value = SimpleNamespace(
        attributes={
            "next_rising": SUNRISE_TODAY.isoformat(),
            "next_setting": "2026-11-03T15:51:00+00:00",
        }
    )

    with (
        patch.object(websockets, "get_astral_event_next", side_effect=_astral),
        patch.object(websockets, "_forecast_days", AsyncMock(return_value=[])),
    ):
        info = await websockets.build_irrigation_info(hass, coordinator)

    assert info.get("error") is None
    assert (
        info["next_irrigation_start"]
        == (SUNRISE_TOMORROW - timedelta(seconds=RUN)).isoformat()
    )


async def test_without_sun_data_the_start_has_a_time_zone(freezer):
    """No sun integration: the 6 AM assumed was naive, and the planning failed.

    The planning compares the start with aware times; "can't compare
    offset-naive and offset-aware datetimes" left it saying no program was
    planned, under two programs with schedules.
    """
    freezer.move_to("2026-11-13 20:00:00+00:00")
    coordinator = MagicMock()
    coordinator.main_program_uses_schedules = lambda: False
    coordinator.store.async_get_zones = AsyncMock(return_value=[])
    coordinator.store.async_get_config = AsyncMock(return_value={})
    coordinator.store.config = SimpleNamespace(full_controller=False, programs=[])
    coordinator.get_total_duration_all_enabled_zones = AsyncMock(return_value=330)
    coordinator.async_estimate_all_zones_now = AsyncMock(return_value={})
    coordinator._planned_durations = AsyncMock(return_value={})
    coordinator.async_evaluate_skip_conditions = AsyncMock(
        return_value={"should_skip": False, "reason": None, "checks": []}
    )
    coordinator.start_trigger_armed = True
    hass = MagicMock()
    hass.states.get.return_value = None

    with patch.object(websockets, "_forecast_days", AsyncMock(return_value=[])):
        info = await websockets.build_irrigation_info(hass, coordinator)
        start = await websockets._trigger_start(hass, coordinator)

    assert datetime.fromisoformat(info["next_irrigation_start"]).tzinfo is not None
    assert start is not None and start.tzinfo is not None
    assert start > datetime(2026, 11, 13, 20, 0, tzinfo=UTC)


async def test_a_naive_start_is_read_in_the_local_time_zone():
    coordinator = MagicMock()
    coordinator.main_program_uses_schedules = lambda: False
    info = {"next_irrigation_start": "2026-11-14T05:54:30"}

    with patch.object(
        websockets, "build_irrigation_info", AsyncMock(return_value=info)
    ):
        start = await websockets._trigger_start(None, coordinator)

    assert start is not None and start.tzinfo is not None
    assert (start.hour, start.minute) == (5, 54)
