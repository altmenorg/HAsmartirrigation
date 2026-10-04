"""Doubles shared by the test_runner_* files.

A hass whose valves and meters keep the state they are given (a valve opens on
its open service and closes on its close service, unless told otherwise), and a
store whose zone updates land and which hands out copies, as the real one does.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import homeassistant.util.dt as dt_util
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.observed_watering import ObservedWateringMixin
from custom_components.smart_irrigation.valve_runner import ValveRunnerMixin

# Captured at import, before any test replaces asyncio.sleep.
REAL_SLEEP = asyncio.sleep

_ON_SERVICES = ("turn_on", "open_valve")
_OFF_SERVICES = ("turn_off", "close_valve")


class Coordinator(ObservedWateringMixin, ValveRunnerMixin, CalculationMixin):
    """The coordinator's runner, observer and credit path, and nothing else."""

    def __init__(self, hass, store):
        self.hass = hass
        self.store = store
        self._si_driven_until = {}
        self._active_valve_runs = {}
        self._direct_run_finished = {}
        self._sequential_cycle = None
        self._valve_run_tasks = set()
        self._observed_unsub = None
        self._observed_entities = frozenset()
        self._observed_on_since = {}
        self._observed_flow_start = {}
        self._observed_zone_by_entity = {}
        self.async_record_measured_flow = AsyncMock()


def make_hass():
    """A hass double with real valve states and a recorded task list.

    ``hass.stuck`` names valves that ignore their close; ``hass.close_fails``
    is how many close calls raise before one goes through.
    """
    hass = Mock()
    hass.config = Mock()
    hass.config.units = METRIC_SYSTEM
    clock = {"t": 1000.0}

    def _now():
        clock["t"] += 1.0
        return clock["t"]

    hass.loop = Mock()
    hass.loop.time = _now
    hass.states_by_id = {}
    hass.states = Mock()
    hass.states.get = lambda entity_id: hass.states_by_id.get(entity_id)
    hass.stuck = set()
    hass.close_fails = 0
    hass.calls = []

    async def _call(domain, service, data, **kwargs):
        entity_id = data["entity_id"]
        hass.calls.append((service, entity_id))
        if service in _OFF_SERVICES:
            if hass.close_fails > 0:
                hass.close_fails -= 1
                raise RuntimeError("Service not found")
            if entity_id in hass.stuck:
                return
            set_state(hass, entity_id, "off")
        elif service in _ON_SERVICES:
            set_state(hass, entity_id, "on")

    hass.services = Mock()
    hass.services.async_call = AsyncMock(side_effect=_call)
    hass.created = []

    def _create_task(coro, *args, **kwargs):
        task = asyncio.ensure_future(coro)
        hass.created.append(task)
        return task

    hass.async_create_task = _create_task
    hass.bus = Mock()
    hass.bus.async_fire = Mock()
    return hass


def set_state(hass, entity_id, state, *, attributes=None, changed=None, reported=None):
    """Set an entity's state, dated now unless told otherwise."""
    now = dt_util.utcnow()
    hass.states_by_id[entity_id] = SimpleNamespace(
        state=state,
        attributes=attributes or {},
        last_changed=changed or now,
        last_updated=changed or now,
        last_reported=reported or changed or now,
    )


def opens(hass):
    return [entity for service, entity in hass.calls if service in _ON_SERVICES]


def closes(hass):
    return [entity for service, entity in hass.calls if service in _OFF_SERVICES]


def problems(hass):
    """The reasons of every zone_problem event fired."""
    return [
        call.args[1]["reason"]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_ZONE_PROBLEM)
    ]


def zone(zone_id=0, **overrides):
    """10 L/min over 50 m2 is 12 mm/h: 300 s of water is 1.0 mm."""
    data = {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_BUCKET: -3.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_DURATION: 300,
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_LINKED_ENTITY: f"switch.zone_{zone_id}",
    }
    data.update(overrides)
    return data


def make_store(zones, *, sequencing="sequential", passes=1, soak=0, pause=0):
    """A store whose zone updates land and whose reads are copies."""
    store = Mock()
    store.by_id = {int(z[const.ZONE_ID]): dict(z) for z in zones}
    store.config = SimpleNamespace(
        direct_valve_control_enabled=True,
        zone_sequencing=sequencing,
        active_valve_runs=[],
        watering_passes=passes,
        soak_minutes=soak,
        pause_between_zones=pause,
    )

    def _get(zone_id):
        found = store.by_id.get(int(zone_id))
        return dict(found) if found is not None else None

    async def _update(zone_id, changes):
        store.by_id[int(zone_id)].update(changes)

    async def _all():
        return [dict(z) for z in store.by_id.values()]

    store.get_zone = Mock(side_effect=_get)
    store.async_update_zone = AsyncMock(side_effect=_update)
    store.async_update_config = AsyncMock()
    store.async_add_irrigation_history = AsyncMock()
    store.async_get_zones = AsyncMock(side_effect=_all)
    return store


class Sleeps:
    """Stands in for asyncio.sleep in the runner: records, and runs hooks.

    ``on(seconds, hook)`` runs the coroutine function ``hook`` the first time
    the runner waits exactly ``seconds``, which is how a test acts "during the
    soak" or "while zone 1 is open".
    """

    def __init__(self):
        self.waited = []
        self._hooks = {}

    def on(self, seconds, hook):
        self._hooks[float(seconds)] = hook

    async def __call__(self, seconds, *args, **kwargs):
        self.waited.append(seconds)
        hook = self._hooks.pop(float(seconds), None)
        if hook is not None:
            await hook()
