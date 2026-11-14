"""A zone that would rather skip a watering than open its valve without the
valve's own timer (#893).

The valve's own timer is the safety net for Home Assistant going away mid-run:
the valve then still closes by itself. Setting it is best-effort, so a valve
asleep or an MQTT broker down used to mean a run with no net at all. A zone can
now ask for the timer: when it could not be set, the valve stays shut (or is
shut at once when the timer is armed after the open), nothing is credited,
and the zone reports ``valve_timer_not_set``. Off by default.
"""

import asyncio
import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import homeassistant.util.dt as dt_util
import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.observed_watering import ObservedWateringMixin
from custom_components.smart_irrigation.valve_runner import (
    PROBLEM_TIMER_NOT_SET,
    ValveRunnerMixin,
    timer_required,
)

GARDENA = "number.hedges_watering_duration"
TOPIC = "zigbee2mqtt/valve/set"


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
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", AsyncMock()
    )


def _hass(duration_entity=True, set_value_fails=False):
    hass = Mock()
    hass.config = Mock()
    hass.config.units = METRIC_SYSTEM
    clock = {"t": 1000.0}

    def _now():
        clock["t"] += 1.0
        return clock["t"]

    hass.loop = Mock()
    hass.loop.time = _now

    async def _call(domain, service, data, **kwargs):
        if service == "set_value" and set_value_fails:
            raise RuntimeError("asleep")

    hass.services = Mock()
    hass.services.async_call = AsyncMock(side_effect=_call)
    hass.async_create_task = lambda coro, *args, **kwargs: asyncio.ensure_future(coro)
    hass.bus = Mock()
    hass.bus.async_fire = Mock()

    def _get(entity_id):
        if entity_id == GARDENA:
            if not duration_entity:
                return None
            return SimpleNamespace(
                state="1",
                attributes={"unit_of_measurement": "min", "min": 1, "max": 1440},
            )
        return SimpleNamespace(state="on")

    hass.states = Mock()
    hass.states.get = _get
    return hass


def _zone(**overrides):
    zone = {
        const.ZONE_ID: 0,
        const.ZONE_NAME: "Zone",
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_BUCKET: -3.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_DURATION: 300,
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_LINKED_ENTITY: "switch.valve",
        const.ZONE_SAFETY_OFF_REQUIRED: True,
    }
    zone.update(overrides)
    return zone


def _store(zone):
    store = Mock()
    store.config = SimpleNamespace(
        direct_valve_control_enabled=True,
        zone_sequencing="sequential",
        active_valve_runs=[],
    )
    store.get_zone = Mock(return_value=zone)
    store.async_update_zone = AsyncMock()
    store.async_update_config = AsyncMock()
    store.async_get_zones = AsyncMock(return_value=[zone])
    return store


def _services(hass):
    return [c.args[1] for c in hass.services.async_call.await_args_list]


def _problems(hass):
    return [
        c.args[1]["reason"]
        for c in hass.bus.async_fire.call_args_list
        if c.args[0].endswith(const.EVENT_ZONE_PROBLEM)
    ]


def _mqtt(monkeypatch, fails=False):
    publish = AsyncMock(side_effect=RuntimeError("no broker") if fails else None)
    monkeypatch.setattr("homeassistant.components.mqtt.async_publish", publish)
    return publish


# --- when it applies


def test_off_by_default_and_never_with_the_dead_man_switched_off():
    assert not timer_required({})
    assert not timer_required({const.ZONE_SAFETY_OFF_REQUIRED: False})
    assert timer_required({const.ZONE_SAFETY_OFF_REQUIRED: True})
    assert not timer_required(
        {
            const.ZONE_SAFETY_OFF_REQUIRED: True,
            const.ZONE_SAFETY_OFF_MODE: const.SAFETY_OFF_MODE_OFF,
        }
    )
    assert not timer_required(None)


# --- a pass


async def test_a_valve_whose_duration_is_written_waters():
    zone = _zone(**{const.ZONE_SAFETY_OFF_ENTITY: GARDENA})
    hass = _hass()
    coord = _Coordinator(hass, _store(zone))

    assert await coord._run_one_pass(zone, "switch.valve", 300) is None

    assert _services(hass) == ["set_value", "turn_on", "turn_off"]
    coord.store.async_update_zone.assert_awaited()


async def test_a_duration_that_cannot_be_written_leaves_the_valve_shut():
    zone = _zone(**{const.ZONE_SAFETY_OFF_ENTITY: GARDENA})
    hass = _hass(set_value_fails=True)
    coord = _Coordinator(hass, _store(zone))

    assert await coord._run_one_pass(zone, "switch.valve", 300) == (
        PROBLEM_TIMER_NOT_SET
    )

    assert "turn_on" not in _services(hass)
    assert _problems(hass) == [PROBLEM_TIMER_NOT_SET]
    coord.store.async_update_zone.assert_not_awaited()


async def test_a_duration_entity_gone_leaves_the_valve_shut():
    zone = _zone(**{const.ZONE_SAFETY_OFF_ENTITY: GARDENA})
    hass = _hass(duration_entity=False)
    coord = _Coordinator(hass, _store(zone))

    assert await coord._run_one_pass(zone, "switch.valve", 300) == (
        PROBLEM_TIMER_NOT_SET
    )
    assert "turn_on" not in _services(hass)


async def test_a_zone_with_no_way_of_setting_a_timer_is_not_opened():
    """No duration entity, no topic, not a ZHA valve: nothing can be armed."""
    zone = _zone()
    hass = _hass()
    coord = _Coordinator(hass, _store(zone))

    assert await coord._run_one_pass(zone, "switch.valve", 300) == (
        PROBLEM_TIMER_NOT_SET
    )
    assert _services(hass) == []


async def test_an_mqtt_timer_armed_after_the_open_lets_it_water(monkeypatch):
    publish = _mqtt(monkeypatch)
    zone = _zone(**{const.ZONE_SAFETY_OFF_TOPIC: TOPIC})
    hass = _hass()
    coord = _Coordinator(hass, _store(zone))

    assert await coord._run_one_pass(zone, "switch.valve", 300) is None

    publish.assert_awaited_once()
    assert _services(hass) == ["turn_on", "turn_off"]
    coord.store.async_update_zone.assert_awaited()


async def test_an_mqtt_timer_that_fails_shuts_the_valve_at_once(monkeypatch):
    _mqtt(monkeypatch, fails=True)
    zone = _zone(**{const.ZONE_SAFETY_OFF_TOPIC: TOPIC})
    hass = _hass()
    coord = _Coordinator(hass, _store(zone))

    assert await coord._run_one_pass(zone, "switch.valve", 300) == (
        PROBLEM_TIMER_NOT_SET
    )

    assert _services(hass) == ["turn_on", "turn_off"]
    assert _problems(hass) == [PROBLEM_TIMER_NOT_SET]
    coord.store.async_update_zone.assert_not_awaited()
    assert coord._active_valve_runs == {}


async def test_without_the_option_a_failed_timer_still_waters(monkeypatch):
    _mqtt(monkeypatch, fails=True)
    zone = _zone(
        **{const.ZONE_SAFETY_OFF_TOPIC: TOPIC, const.ZONE_SAFETY_OFF_REQUIRED: False}
    )
    hass = _hass()
    coord = _Coordinator(hass, _store(zone))

    assert await coord._run_one_pass(zone, "switch.valve", 300) is None
    coord.store.async_update_zone.assert_awaited()


async def test_a_seconds_counting_zha_valve_that_cannot_take_its_timer_stays_shut(
    monkeypatch,
):
    """The open with its timer failed: the normal open would carry none."""
    zone = _zone()
    hass = _hass()
    coord = _Coordinator(hass, _store(zone))
    monkeypatch.setattr(coord, "_zha_target", lambda entity_id: ("00:11", 1))
    monkeypatch.setattr(coord, "_zha_counts_seconds", lambda entity_id: True)
    coord._send_zha_command = AsyncMock(side_effect=RuntimeError("asleep"))

    assert await coord._run_one_pass(zone, "switch.valve", 300) == (
        PROBLEM_TIMER_NOT_SET
    )
    assert "turn_on" not in _services(hass)


async def test_a_seconds_counting_zha_valve_opened_with_its_timer_waters(
    monkeypatch,
):
    zone = _zone()
    hass = _hass()
    coord = _Coordinator(hass, _store(zone))
    monkeypatch.setattr(coord, "_zha_target", lambda entity_id: ("00:11", 1))
    monkeypatch.setattr(coord, "_zha_counts_seconds", lambda entity_id: True)
    coord._send_zha_command = AsyncMock(side_effect=lambda data, timeout: data)

    assert await coord._run_one_pass(zone, "switch.valve", 300) is None
    assert "turn_on" not in _services(hass)  # opened by the timed command
    coord.store.async_update_zone.assert_awaited()


# --- a pass resumed after a restart


async def test_a_resume_that_cannot_set_the_timer_shuts_and_credits_what_flowed():
    zone = _zone(**{const.ZONE_SAFETY_OFF_ENTITY: GARDENA})
    hass = _hass(set_value_fails=True)
    coord = _Coordinator(hass, _store(zone))
    started = (dt_util.utcnow() - datetime.timedelta(seconds=100)).isoformat()
    run = {
        const.RUN_ZONE_ID: 0,
        const.RUN_ENTITY_ID: "switch.valve",
        const.RUN_STARTED: started,
        const.RUN_DURATION: 300.0,
    }

    await coord._resume_one(run)

    names = _services(hass)
    assert "turn_on" not in names and "turn_off" in names
    assert PROBLEM_TIMER_NOT_SET in _problems(hass)
    coord.store.async_update_zone.assert_awaited()  # the 100 s it ran
