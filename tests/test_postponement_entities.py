"""The postponement from a dashboard: two buttons, a resume, and a date.

The service was the only way in, so holding the watering back from a wall
tablet or a "holidays" automation meant a script. The hub device now has
"postpone 24 h", "postpone 48 h" and "resume" buttons, and a datetime entity
that shows until when the watering is held back and can be set. All of them go
through the same function as the service, so they cannot disagree on what a
postponement is.
"""

import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.button import (
    SmartIrrigationPostponeButton,
    SmartIrrigationResumeButton,
)
from custom_components.smart_irrigation.datetime import SmartIrrigationPostponedUntil
from custom_components.smart_irrigation.service_handlers import ServiceHandlersMixin

NOW = datetime.datetime(2026, 10, 29, 20, 0, tzinfo=datetime.UTC)
UTCNOW = "custom_components.smart_irrigation.{}.dt_util.utcnow"


def _coordinator(config=None):
    class _Coordinator(ServiceHandlersMixin):
        pass

    coordinator = _Coordinator()
    coordinator.hass = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.async_update_config = AsyncMock()
    coordinator.store.get_config = MagicMock(return_value=dict(config or {}))
    return coordinator


def _hass(coordinator):
    hass = MagicMock()
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    return hass


@pytest.mark.asyncio
@pytest.mark.parametrize("hours", [24, 48])
async def test_a_postpone_button_holds_the_watering_from_now(hours):
    coordinator = _coordinator()
    button = SmartIrrigationPostponeButton(_hass(coordinator), hours)

    with (
        patch(UTCNOW.format("button"), return_value=NOW),
        patch(UTCNOW.format("service_handlers"), return_value=NOW),
    ):
        await button.async_press()

    written = coordinator.store.async_update_config.call_args[0][0]
    assert (
        written[const.CONF_POSTPONE_UNTIL]
        == (NOW + datetime.timedelta(hours=hours)).isoformat()
    )
    assert button.unique_id == f"{const.DOMAIN}_postpone_{hours}h"


@pytest.mark.asyncio
async def test_the_resume_button_lifts_it():
    coordinator = _coordinator()

    await SmartIrrigationResumeButton(_hass(coordinator)).async_press()

    assert coordinator.store.async_update_config.call_args[0][0] == {
        const.CONF_POSTPONE_UNTIL: None
    }


@pytest.mark.asyncio
async def test_setting_the_date_postpones_until_it():
    coordinator = _coordinator()
    entity = SmartIrrigationPostponedUntil(_hass(coordinator))
    until = NOW + datetime.timedelta(days=10)

    with patch(UTCNOW.format("service_handlers"), return_value=NOW):
        await entity.async_set_value(until)

    written = coordinator.store.async_update_config.call_args[0][0]
    assert written[const.CONF_POSTPONE_UNTIL] == until.isoformat()


@pytest.mark.asyncio
async def test_a_date_already_past_lifts_it():
    coordinator = _coordinator()
    entity = SmartIrrigationPostponedUntil(_hass(coordinator))

    with patch(UTCNOW.format("service_handlers"), return_value=NOW):
        await entity.async_set_value(NOW - datetime.timedelta(hours=1))

    assert coordinator.store.async_update_config.call_args[0][0] == {
        const.CONF_POSTPONE_UNTIL: None
    }


@pytest.mark.parametrize(
    ("stored", "shown"),
    [
        (None, None),
        ("2026-10-30T20:00:00+00:00", NOW + datetime.timedelta(days=1)),
        # Ended by itself: nothing is postponed any more.
        ("2026-10-29T19:00:00+00:00", None),
        ("not a date", None),
    ],
)
def test_the_date_shows_the_postponement_while_it_is_ahead(stored, shown):
    coordinator = _coordinator({const.CONF_POSTPONE_UNTIL: stored})
    entity = SmartIrrigationPostponedUntil(_hass(coordinator))

    with patch(UTCNOW.format("datetime"), return_value=NOW):
        assert entity.native_value == shown
