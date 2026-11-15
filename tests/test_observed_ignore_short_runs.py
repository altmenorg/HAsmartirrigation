"""Observed watering leaves out a zone's short runs ("Ignore runs up to").

A few minutes of mist to cool the leaves on a hot afternoon mostly stays on them
and evaporates. A run at or under the zone's limit is neither credited nor taken
as the zone's watering of the cycle; a longer one counts in full.
"""

import datetime

import homeassistant.util.dt as dt_util
import pytest
import voluptuous as vol

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.websockets import ZONE_SAVE_SCHEMA

from .test_observed_watering import (
    _close_event,
    _Coordinator,
    _make_hass,
    _make_store,
    _open_event,
    _silence_dispatcher,  # noqa: F401 (autouse fixture)
    _zone,
)


def _run(zone, seconds):
    hass = _make_hass()
    coord = _Coordinator(hass, _make_store(zone))
    coord._observed_zone_by_entity = {"switch.valve": 0}
    coord._direct_run_finished = {}
    coord._observed_state_changed(_open_event())
    coord._observed_on_since[0] = dt_util.utcnow() - datetime.timedelta(seconds=seconds)
    coord._observed_state_changed(_close_event())
    return coord, hass


@pytest.mark.parametrize("seconds", [60, 299])
def test_a_run_under_the_limit_is_not_credited(seconds):
    coord, hass = _run(_zone(**{const.ZONE_OBSERVED_IGNORE_SECONDS: 300}), seconds)

    assert hass.created_tasks == []
    # Not the zone's watering either: a queued cycle still waters it.
    assert coord._direct_run_finished == {}


async def test_a_longer_run_counts_in_full():
    zone = _zone(**{const.ZONE_OBSERVED_IGNORE_SECONDS: 300})
    coord, hass = _run(zone, 600)

    assert len(hass.created_tasks) == 1
    await hass.created_tasks[0]
    # 600 s at 10 L/min over 50 m2 = 2.0 mm, the first 300 s included.
    bucket = coord.store.async_update_zone.await_args.args[1][const.ZONE_BUCKET]
    assert bucket == pytest.approx(-1.0)


@pytest.mark.parametrize("limit", [None, 0])
def test_without_a_limit_every_run_counts(limit):
    _, hass = _run(_zone(**{const.ZONE_OBSERVED_IGNORE_SECONDS: limit}), 30)

    assert len(hass.created_tasks) == 1
    hass.created_tasks[0].close()


def test_the_limit_is_saved_through_the_zone_schema():
    saved = ZONE_SAVE_SCHEMA({"id": 0, const.ZONE_OBSERVED_IGNORE_SECONDS: "300"})
    assert saved[const.ZONE_OBSERVED_IGNORE_SECONDS] == 300.0
    assert ZONE_SAVE_SCHEMA({"id": 0, const.ZONE_OBSERVED_IGNORE_SECONDS: None})
    with pytest.raises(vol.Invalid):
        ZONE_SAVE_SCHEMA({"id": 0, const.ZONE_OBSERVED_IGNORE_SECONDS: -5})
