"""The overview says whether a program has anything to start.

The card offered "start" for a new program with no zone in its steps, and the
panel headed it with "Run now" (UX walk of 9 Nov., evening). The panel checks
the steps itself; the card has only the overview, so it says so.
"""

import pytest

from tests.test_program_status import _status


def _can_run(overview, program_id):
    return next(p["can_run"] for p in overview if p["program_id"] == program_id)


@pytest.mark.parametrize(
    ("steps", "expected"),
    [
        ([], False),
        ([{"zones": []}], False),
        ([{"zones": [0], "enabled": False}], False),
        ([{"zones": []}, {"zones": [1]}], True),
    ],
)
async def test_a_program_can_run_once_a_step_it_runs_has_a_zone(steps, expected):
    hass, coord = _status(
        [
            {"id": "main", "name": "Main program", "main": True},
            {"id": "evening", "name": "Evening", "steps": steps, "schedules": []},
        ]
    )

    overview = await coord.async_program_overview()

    assert _can_run(overview, "evening") is expected
    assert _can_run(overview, "main") is True
