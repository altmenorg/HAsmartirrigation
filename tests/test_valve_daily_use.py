"""Two faults found watering with direct valve control (UX walk of 9 Nov.).

- A zone could be linked to its own valve entity. The panel's valve field
  offered Smart Irrigation's own entities, and a search for "Ventil Rasen"
  picked the zone's own valve. Opening it opened the zone again, and each open
  queued another run: a run every 30 seconds, each ending "did not open",
  without end. Saving such a link is refused now, and a run never opens one.
- A manual zone lost its duration after every run. The credit derived the
  duration from the bucket for every zone, so the duration its owner entered
  became 0 and the zone was never watered again.
"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
from homeassistant.helpers import entity_registry as er
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.delivery import own_entities
from custom_components.smart_irrigation.observed_watering import ObservedWateringMixin
from custom_components.smart_irrigation.valve_runner import (
    PROBLEM_DID_NOT_OPEN,
    ValveRunnerMixin,
)
from custom_components.smart_irrigation.websockets import SmartIrrigationZoneView


class _Coordinator(ObservedWateringMixin, ValveRunnerMixin, CalculationMixin):
    def __init__(self, hass, store):
        self.hass = hass
        self.store = store
        self._si_driven_until = {}
        self._active_valve_runs = {}
        self._direct_run_finished = {}
        self._sequential_cycle = None
        self._valve_run_tasks = set()


@pytest.fixture(autouse=True)
def _quiet(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.async_dispatcher_send",
        lambda *args, **kwargs: None,
        raising=False,
    )


def _zone(**overrides):
    zone = {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Hecken",
        const.ZONE_SIZE: 20.0,
        const.ZONE_THROUGHPUT: 6.0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_BUCKET: 0.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_DURATION: 120,
        const.ZONE_STATE: const.ZONE_STATE_MANUAL,
        const.ZONE_LINKED_ENTITY: "switch.ventil_hecken",
    }
    zone.update(overrides)
    return zone


def _coordinator(zone):
    hass = Mock()
    hass.config.units = METRIC_SYSTEM
    hass.services.async_call = AsyncMock()
    hass.bus.async_fire = Mock()
    store = Mock()
    store.config = SimpleNamespace(
        direct_valve_control_enabled=True,
        zone_sequencing="sequential",
        active_valve_runs=[],
    )
    store.get_zone = Mock(return_value=zone)
    store.async_update_zone = AsyncMock()
    store.async_update_config = AsyncMock()
    return _Coordinator(hass, store)


def _changes(coordinator):
    return coordinator.store.async_update_zone.await_args.args[1]


# --- the manual duration ------------------------------------------------------


@pytest.mark.asyncio
async def test_a_manual_zone_keeps_its_duration_after_a_run():
    """Hecken, 120 s entered, watered: still 120 s, and credited."""
    coordinator = _coordinator(_zone())

    await coordinator._credit_direct_run(1, 120)

    changes = _changes(coordinator)
    assert const.ZONE_DURATION not in changes
    # 120 s at 6 L/min over 20 m2 is 0.6 mm.
    assert changes[const.ZONE_BUCKET] == pytest.approx(0.6)


@pytest.mark.asyncio
async def test_a_manual_zone_keeps_its_duration_after_watering_by_hand():
    """The same credit counts a valve opened by hand (observed watering)."""
    zone = _zone()
    coordinator = _coordinator(zone)

    await coordinator._apply_volume_credit(zone, 6.0, source="63s timed", seconds=63)

    assert const.ZONE_DURATION not in _changes(coordinator)


@pytest.mark.asyncio
async def test_an_automatic_zone_still_takes_its_duration_from_the_bucket():
    """Back at zero after the run: nothing left to water (#772)."""
    coordinator = _coordinator(
        _zone(state=const.ZONE_STATE_AUTOMATIC, bucket=-0.6, duration=120)
    )

    await coordinator._credit_direct_run(1, 120)

    assert _changes(coordinator)[const.ZONE_DURATION] == 0


# --- a zone's own valve -------------------------------------------------------


async def test_own_entities_are_the_ones_smart_irrigation_provides(hass):
    registry = er.async_get(hass)
    own = registry.async_get_or_create(
        "valve",
        const.DOMAIN,
        "smart_irrigation_1_valve",
        suggested_object_id="smart_irrigation_hecken",
    )
    switch = registry.async_get_or_create(
        "switch", "template", "ventil_hecken", suggested_object_id="ventil_hecken"
    )

    assert own_entities(
        hass, [own.entity_id, switch.entity_id, None, "switch.yaml"]
    ) == [own.entity_id]


@pytest.mark.asyncio
async def test_a_run_never_opens_a_valve_of_smart_irrigation():
    """A zone saved with its own valve before this fix waters nothing, once."""
    zone = _zone(linked_entity="valve.smart_irrigation_hecken")
    coordinator = _coordinator(zone)

    with patch(
        "custom_components.smart_irrigation.valve_runner.own_entities",
        return_value=["valve.smart_irrigation_hecken"],
    ):
        reason = await coordinator._run_one_pass(
            zone, "valve.smart_irrigation_hecken", 120
        )

    assert reason == PROBLEM_DID_NOT_OPEN
    # Not opened, so no further run of the same zone is queued.
    coordinator.hass.services.async_call.assert_not_awaited()


@pytest.mark.parametrize(
    "data",
    [
        {const.ZONE_ID: 1, const.ZONE_LINKED_ENTITY: "valve.smart_irrigation_hecken"},
        {
            const.ZONE_ID: 1,
            const.ZONE_EXTRA_ENTITIES: ["valve.smart_irrigation_hecken"],
        },
    ],
    ids=["linked", "extra"],
)
@pytest.mark.asyncio
async def test_saving_a_link_to_an_own_valve_is_refused(data):
    coordinator = MagicMock()
    coordinator.async_update_zone_config = AsyncMock()
    hass = MagicMock()
    hass.config.units = METRIC_SYSTEM
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    request = MagicMock()
    request.app = {"hass": hass}
    request.json = AsyncMock(return_value=dict(data))
    view = SmartIrrigationZoneView()
    view.json_message = MagicMock(return_value="refused")

    with patch(
        "custom_components.smart_irrigation.websockets.own_entities",
        return_value=["valve.smart_irrigation_hecken"],
    ):
        result = await view.post(request)

    assert result == "refused"
    message, status = view.json_message.call_args.args
    assert "valve.smart_irrigation_hecken" in message
    assert status == 400
    coordinator.async_update_zone_config.assert_not_awaited()
