"""A start trigger that starts nothing is not a next start (#969).

The time of the next start is worked out arithmetically, whatever the trigger.
Under the "none" trigger, and while no trigger is armed, nothing starts at it,
and the Info page has said so since #841. The card, the programs, the planning
and the per-zone "next irrigation" sensor listed it all the same.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import const, websockets
from tests.test_zone_outlook_and_any_zone import START, _coordinator, _runs, _zone

ARMED = {
    "next_irrigation_start": START.isoformat(),
    "active_start_trigger": "default",
    "start_trigger_armed": True,
}


def test_an_armed_trigger_gives_its_start():
    assert websockets._armed_trigger_start(ARMED) == START.isoformat()


@pytest.mark.parametrize(
    "change",
    [
        {"active_start_trigger": const.START_TRIGGER_NONE},
        {"start_trigger_armed": False},
        {"error": "boom"},
    ],
)
def test_a_trigger_that_starts_nothing_gives_none(change):
    assert websockets._armed_trigger_start({**ARMED, **change}) is None


def test_an_older_payload_without_the_armed_flag_still_gives_its_start():
    info = {"next_irrigation_start": START.isoformat()}

    assert websockets._armed_trigger_start(info) == START.isoformat()


async def test_the_zone_sensor_has_no_next_run_under_the_none_trigger():
    runs = await _runs(
        _coordinator([_zone(0, 600)]),
        {
            **ARMED,
            "active_start_trigger": const.START_TRIGGER_NONE,
            "zone_estimates": {},
            "skip_preview": {"should_skip": False},
        },
    )

    assert runs[0] is None


async def test_the_programs_give_the_main_program_no_start_nothing_will_act_on():
    from tests.test_controller_gaps import _call
    from tests.test_main_program_schedules import _main, _status_with

    hass, coord = _status_with([_main()])
    hass.data = {const.DOMAIN: {"coordinator": coord}}
    for armed, expected in ((True, START.isoformat()), (False, None)):
        with patch.object(
            websockets,
            "build_irrigation_info",
            AsyncMock(return_value={**ARMED, "start_trigger_armed": armed}),
        ):
            connection = await _call(hass, websockets.websocket_get_programs_state)
        [main] = connection.send_result.call_args.args[1]["programs"]
        assert main["next_start"] == expected


async def test_the_planning_leaves_out_a_main_run_nothing_will_start():
    coordinator = MagicMock()
    coordinator.main_program_uses_schedules = lambda: False
    with patch.object(
        websockets,
        "build_irrigation_info",
        AsyncMock(
            return_value={**ARMED, "active_start_trigger": const.START_TRIGGER_NONE}
        ),
    ):
        assert await websockets._trigger_start(MagicMock(), coordinator) is None
