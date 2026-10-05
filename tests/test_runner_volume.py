"""A volume limit on a step, the litres of a metered run, and the measured flow."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.programs import normalize_programs, plan_program
from tests.runner_doubles import (
    REAL_SLEEP,
    Coordinator,
    closes,
    make_hass,
    make_store,
    opens,
    set_state,
    zone,
)

METER = "sensor.meter"


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


class Clock:
    """asyncio.sleep in the runner: yields, and lets a test move the meter.

    Each wait of the watcher (five seconds) reads one more step of the meter;
    every other wait returns at once.
    """

    def __init__(self, hass, steps):
        self.hass = hass
        self.steps = list(steps)
        self.waits = []

    async def __call__(self, seconds, *args, **kwargs):
        self.waits.append(seconds)
        await REAL_SLEEP(0)
        if seconds == 5.0 and self.steps:
            set_state(self.hass, METER, str(self.steps.pop(0)))


def _setup(monkeypatch, steps=(), *, duration=600, meter=True):
    hass = make_hass()
    extra = {const.ZONE_FLOW_SENSOR: METER} if meter else {}
    store = make_store([zone(0, **{const.ZONE_DURATION: duration, **extra})])
    store.config.full_controller = True
    store.config.supplies = []
    store.config.programs = normalize_programs(
        [
            {
                "id": "p",
                "name": "P",
                "steps": [{"zones": [0], "max_litres": 20}],
            }
        ]
    )
    store.config.active_cycle = None
    store.config.active_program_run = None
    store.config.suspensions = None
    store.async_update_config = AsyncMock()
    coord = Coordinator(hass, store)
    set_state(hass, METER, "100", attributes={"unit_of_measurement": "L"})
    clock = Clock(hass, steps)
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", clock
    )
    return hass, coord, clock


def test_a_step_stores_and_plans_its_limit():
    [program] = normalize_programs(
        [{"steps": [{"zones": [0], "max_litres": "12.5"}, {"zones": [0]}]}]
    )

    assert program["steps"][0]["max_litres"] == 12.5
    assert program["steps"][1]["max_litres"] == 0.0
    plan = plan_program(
        program,
        [
            {
                const.ZONE_ID: 0,
                const.ZONE_DURATION: 600,
                const.ZONE_LEAD_TIME: 0,
                const.ZONE_LINKED_ENTITY: "switch.z",
                const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            }
        ],
    )
    assert plan[0][0]["zones"][0]["max_litres"] == 12.5


async def test_a_zone_stops_once_the_meter_has_counted_its_litres(monkeypatch):
    # 100 L at the start, then 105, 112, 121: the limit of 20 L is met at 121.
    hass, coord, clock = _setup(monkeypatch, steps=[105, 112, 121, 140])

    await coord.async_run_program("p")

    assert closes(hass) == ["switch.zone_0"]
    # The meter was read three times, not four: it stopped at the third.
    assert clock.steps == [140]
    finished = [
        call.args[1]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0].endswith(const.EVENT_PROGRAM_FINISHED)
    ][0]
    assert finished["problems"] == []


async def test_a_zone_that_stays_under_its_limit_runs_its_time(monkeypatch):
    hass, coord, clock = _setup(monkeypatch, steps=[101, 102, 103])

    # The run is short enough to end before the meter reaches 20 L.
    coord.store.by_id[0][const.ZONE_DURATION] = 5
    await coord.async_run_program("p")

    assert opens(hass) == ["switch.zone_0"]
    assert 300 not in clock.waits  # no soak, no second pass


async def test_a_meter_that_goes_silent_ends_the_watching_not_the_run(monkeypatch):
    hass, coord, clock = _setup(monkeypatch)
    set_state(hass, METER, "unavailable")

    await coord.async_run_program("p")

    # The run was held for its time and ended normally.
    assert opens(hass) == ["switch.zone_0"]
    assert closes(hass) == ["switch.zone_0"]


async def test_the_limit_is_for_the_whole_run_not_for_each_pass(monkeypatch):
    hass, coord, clock = _setup(monkeypatch, steps=[104, 108, 112, 116, 121, 125])
    coord.store.config.programs = normalize_programs(
        [
            {
                "id": "p",
                "name": "P",
                "steps": [{"zones": [0], "max_litres": 20, "passes": 3}],
            }
        ]
    )
    coord.store.config.soak_minutes = 0

    await coord.async_run_program("p")

    # The litres of the first pass count toward the limit of the whole run, so
    # the three passes are not all opened: the budget runs out before the third.
    assert len(opens(hass)) < 3


async def test_a_metered_pass_feeds_the_measured_throughput(monkeypatch):
    hass, coord, clock = _setup(monkeypatch)
    coord.store.config.programs = normalize_programs(
        [{"id": "p", "name": "P", "steps": [{"zones": [0]}]}]
    )
    # The meter counts 30 L over the pass.
    real = hass.services.async_call.side_effect

    async def _call(domain, service, data, **kwargs):
        result = await real(domain, service, data, **kwargs)
        if service in ("turn_off", "close_valve"):
            set_state(hass, METER, "130")
        return result

    hass.services.async_call.side_effect = _call

    await coord.async_run_program("p")

    coord.async_record_measured_flow.assert_awaited_once()
    zone_id, litres, seconds = coord.async_record_measured_flow.await_args.args
    assert zone_id == 0
    assert litres == 30
    assert seconds == 600


async def test_a_zone_without_a_meter_feeds_nothing(monkeypatch):
    hass, coord, clock = _setup(monkeypatch, meter=False)
    coord.store.config.programs = normalize_programs(
        [{"id": "p", "name": "P", "steps": [{"zones": [0]}]}]
    )

    await coord.async_run_program("p")

    coord.async_record_measured_flow.assert_not_awaited()


async def test_the_measured_throughput_is_taken_when_asked():
    from custom_components.smart_irrigation.service_handlers import (
        ServiceHandlersMixin,
    )

    class Handlers(ServiceHandlersMixin):
        pass

    handlers = Handlers.__new__(Handlers)
    handlers.hass = MagicMock()
    handlers.store = MagicMock()
    handlers.store.get_zone = MagicMock(
        side_effect=lambda zid: (
            {const.ZONE_MEASURED_THROUGHPUT: 7.5} if zid == 0 else {}
        )
    )
    handlers.async_update_zone_config = AsyncMock()
    handlers.async_clear_throughput_issue = MagicMock()

    await handlers.handle_use_measured_throughput(SimpleNamespace(data={"zone_id": 0}))
    await handlers.handle_use_measured_throughput(SimpleNamespace(data={"zone_id": 1}))

    handlers.async_update_zone_config.assert_awaited_once_with(
        zone_id=0, data={const.ZONE_THROUGHPUT: 7.5}
    )
    handlers.async_clear_throughput_issue.assert_called_once_with(0)
