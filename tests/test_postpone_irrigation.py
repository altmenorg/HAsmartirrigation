"""Holding watering back for a day or two, in one gesture.

Rain the forecast missed, a party on the lawn, a repair: the reasons are the
user's. Before this the only way was to turn every zone off, which is easy to
do and easy to forget, and the installation then stayed off until somebody
noticed a dead lawn.

A postponement is a moment, not a countdown: it survives a restart and ends by
itself. It resets nothing, so a zone that is short of water still is when it
ends, and the next run makes it up.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.service_handlers import ServiceHandlersMixin
from custom_components.smart_irrigation.skip_conditions import SkipConditionsMixin

NOW = datetime.datetime(2026, 9, 25, 12, 0, tzinfo=datetime.UTC)


def _coordinator(config=None):
    class _Coordinator(ServiceHandlersMixin, SkipConditionsMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.async_update_config = AsyncMock()
    coordinator.store.async_get_config = AsyncMock(return_value=dict(config or {}))
    return coordinator


def _call(**data):
    call = MagicMock()
    call.data = data
    return call


@pytest.mark.asyncio
async def test_postponing_writes_the_moment_it_ends():
    coordinator = _coordinator()

    with patch(
        "custom_components.smart_irrigation.service_handlers.dt_util.utcnow",
        return_value=NOW,
    ):
        await coordinator.handle_postpone_irrigation(_call(hours=24))

    written = coordinator.store.async_update_config.call_args[0][0]
    assert written[const.CONF_POSTPONE_UNTIL] == "2026-09-26T12:00:00+00:00"


@pytest.mark.asyncio
async def test_a_day_is_the_default():
    coordinator = _coordinator()

    with patch(
        "custom_components.smart_irrigation.service_handlers.dt_util.utcnow",
        return_value=NOW,
    ):
        await coordinator.handle_postpone_irrigation(_call())

    written = coordinator.store.async_update_config.call_args[0][0]
    assert written[const.CONF_POSTPONE_UNTIL].startswith("2026-09-26")


@pytest.mark.asyncio
async def test_resuming_clears_it():
    coordinator = _coordinator()

    await coordinator.handle_resume_irrigation(_call())

    assert coordinator.store.async_update_config.call_args[0][0] == {
        const.CONF_POSTPONE_UNTIL: None
    }


@pytest.mark.asyncio
async def test_postponing_by_nothing_lifts_it():
    """Zero hours reads as "never mind", not as a postponement to now."""
    coordinator = _coordinator()

    await coordinator.handle_postpone_irrigation(_call(hours=0))

    assert coordinator.store.async_update_config.call_args[0][0] == {
        const.CONF_POSTPONE_UNTIL: None
    }


@pytest.mark.asyncio
async def test_a_nonsense_duration_changes_nothing():
    coordinator = _coordinator()

    await coordinator.handle_postpone_irrigation(_call(hours="tomorrow"))

    coordinator.store.async_update_config.assert_not_awaited()


@pytest.mark.asyncio
async def test_the_check_vetoes_while_the_moment_is_ahead():
    later = (NOW + datetime.timedelta(hours=5)).isoformat()
    coordinator = _coordinator({const.CONF_POSTPONE_UNTIL: later})

    with patch(
        "custom_components.smart_irrigation.skip_conditions.dt_util.utcnow",
        return_value=NOW,
    ):
        check = await coordinator._evaluate_postponed()

    assert check == {
        "id": "postponed",
        "enabled": True,
        "available": True,
        "skip": True,
        "until": later,
    }


@pytest.mark.asyncio
async def test_it_ends_by_itself():
    past = (NOW - datetime.timedelta(minutes=1)).isoformat()
    coordinator = _coordinator({const.CONF_POSTPONE_UNTIL: past})

    with patch(
        "custom_components.smart_irrigation.skip_conditions.dt_util.utcnow",
        return_value=NOW,
    ):
        check = await coordinator._evaluate_postponed()

    assert check["skip"] is False
    # Still reported, so the panel can say a postponement was in force.
    assert check["enabled"] is True


@pytest.mark.asyncio
async def test_nothing_postponed_is_a_check_that_is_simply_off():
    check = await _coordinator()._evaluate_postponed()

    assert check["enabled"] is False
    assert check["skip"] is False


@pytest.mark.asyncio
async def test_an_unreadable_moment_does_not_stop_watering():
    """A stored value nobody can parse must not hold the garden hostage."""
    coordinator = _coordinator({const.CONF_POSTPONE_UNTIL: "soon"})

    check = await coordinator._evaluate_postponed()

    assert check["skip"] is False


@pytest.mark.asyncio
async def test_the_postponement_is_the_first_reason_given():
    """It is the user saying "not now" in as many words, so it comes first."""
    later = (NOW + datetime.timedelta(hours=5)).isoformat()
    coordinator = _coordinator({const.CONF_POSTPONE_UNTIL: later})
    coordinator.hass.states.get = MagicMock(return_value=None)

    with patch(
        "custom_components.smart_irrigation.skip_conditions.dt_util.utcnow",
        return_value=NOW,
    ):
        evaluation = await coordinator.async_evaluate_skip_conditions()

    assert evaluation["should_skip"] is True
    assert evaluation["reason"] == "postponed"
