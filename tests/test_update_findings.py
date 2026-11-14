"""What an update from v2026.10.10 to v2026.11 showed (14 Nov. 2026).

A v2026.10.10 install (four zones, a sensor group, two start triggers, cycle
and soak, recurring schedules, a seasonal adjustment, a postponement, a run in
the history) was updated in place. Nothing was lost; these were wrong:

- A manual zone with an engine of its own, as v2026.10.10 gave every zone, read
  "would water 4 s" on the Start page beside its fixed 10 min, and the zone's
  "next irrigation" sensor took those seconds once durations were estimated.
- (test_postpone_irrigation) Postponed until 10:44, tomorrow's 06:12 run was
  said to be skipped.
"""

from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from custom_components.smart_irrigation import const, websockets

SUNRISE = datetime(2026, 11, 15, 6, 30, tzinfo=UTC)


def _zone(zone_id, name, state, duration):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: name,
        const.ZONE_STATE: state,
        const.ZONE_DURATION: duration,
        const.ZONE_LINKED_ENTITY: f"switch.{name.lower()}",
    }


async def test_a_manual_zone_would_water_the_duration_it_was_given(freezer):
    freezer.move_to("2026-11-14 08:00:00+00:00")
    coordinator = MagicMock()
    coordinator.main_program_uses_schedules = lambda: False
    coordinator.store.async_get_zones = AsyncMock(
        return_value=[
            _zone(0, "Lawn", const.ZONE_STATE_AUTOMATIC, 2410),
            _zone(1, "Hedges", const.ZONE_STATE_MANUAL, 600),
        ]
    )
    coordinator.store.async_get_config = AsyncMock(return_value={})
    coordinator.store.config = SimpleNamespace(full_controller=False, programs=[])
    coordinator.get_total_duration_all_enabled_zones = AsyncMock(return_value=3010)
    coordinator.async_estimate_all_zones_now = AsyncMock(
        return_value={
            "0": {"bucket": -8.0, "duration": 2400},
            "1": {"bucket": -0.01, "duration": 4},
        }
    )
    coordinator._planned_durations = AsyncMock(return_value={0: 2410})
    coordinator.async_evaluate_skip_conditions = AsyncMock(
        return_value={"should_skip": False, "reason": None, "checks": []}
    )
    hass = MagicMock()
    hass.states.get.return_value = SimpleNamespace(
        attributes={
            "next_rising": SUNRISE.isoformat(),
            "next_setting": "2026-11-14T15:51:00+00:00",
        }
    )

    with (
        patch.object(websockets, "get_astral_event_next", return_value=SUNRISE),
        patch.object(websockets, "_forecast_days", AsyncMock(return_value=[])),
    ):
        info = await websockets.build_irrigation_info(hass, coordinator)

    estimates = info["zone_estimates"]
    assert estimates["1"]["duration"] == 600
    # Its bucket is still shown as it stands.
    assert estimates["1"]["bucket"] == -0.01
    assert estimates["0"]["duration"] == 2410
