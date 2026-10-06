"""Two zones of one parallel step on the same flow meter.

The meter counts both zones' water. Each zone must not take the whole delta: the
volume limit splits it, and the metered credit and the calibration are skipped
(the pass keeps its time-based credit).
"""

from unittest.mock import AsyncMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.programs import normalize_programs
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
    """Each five-second wait of a watcher moves the meter one step further."""

    def __init__(self, hass, steps):
        self.hass = hass
        self.steps = list(steps)

    async def __call__(self, seconds, *args, **kwargs):
        await REAL_SLEEP(0)
        if seconds == 5.0 and self.steps:
            set_state(self.hass, METER, str(self.steps.pop(0)))


def _setup(monkeypatch, steps=(), *, step=None, meters=(METER, METER), duration=600):
    hass = make_hass()
    zones = [
        zone(
            i,
            **{
                const.ZONE_DURATION: duration,
                const.ZONE_FLOW_SENSOR: meter,
            },
        )
        for i, meter in enumerate(meters)
    ]
    store = make_store(zones)
    store.config.full_controller = True
    store.config.supplies = []
    store.config.programs = normalize_programs(
        [
            {
                "id": "p",
                "name": "P",
                "steps": [step or {"zones": [0, 1], "max_litres": 20}],
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


def _count_on_close(hass, final):
    real = hass.services.async_call.side_effect

    async def _call(domain, service, data, **kwargs):
        result = await real(domain, service, data, **kwargs)
        if service in ("turn_off", "close_valve"):
            set_state(hass, METER, str(final))
        return result

    hass.services.async_call.side_effect = _call


async def test_zones_sharing_a_meter_neither_calibrate_nor_take_its_litres(
    monkeypatch,
):
    hass, coord, _ = _setup(monkeypatch, step={"zones": [0, 1]})
    _count_on_close(hass, 160)

    await coord.async_run_program("p")

    assert sorted(opens(hass)) == ["switch.zone_0", "switch.zone_1"]
    coord.async_record_measured_flow.assert_not_awaited()


async def test_a_volume_limit_is_split_between_the_zones_on_the_meter(monkeypatch):
    # 20 L each, two zones: the meter has to count 40 L, not 20, to stop them.
    hass, coord, clock = _setup(monkeypatch, steps=[110, 115, 119, 125, 150, 160])

    await coord.async_run_program("p")

    assert sorted(closes(hass)) == ["switch.zone_0", "switch.zone_1"]
    # Not stopped by 125 (25 L, past a lone zone's limit): the reads went on to
    # 150 (50 L), where the shared meter passed the 40 L of the two zones.
    assert len(clock.steps) <= 1


async def test_a_lone_zone_still_stops_at_its_own_litres(monkeypatch):
    hass, coord, clock = _setup(
        monkeypatch,
        steps=[110, 121, 140],
        step={"zones": [0], "max_litres": 20},
        meters=(METER,),
    )

    await coord.async_run_program("p")

    assert closes(hass) == ["switch.zone_0"]
    assert clock.steps == [140]


async def test_zones_on_their_own_meters_are_not_shared(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, step={"zones": [0, 1]})
    # Zone 1 has a meter of its own: both are metered and calibrated.
    coord.store.by_id[1][const.ZONE_FLOW_SENSOR] = "sensor.other"
    set_state(hass, "sensor.other", "0", attributes={"unit_of_measurement": "L"})
    real = hass.services.async_call.side_effect

    async def _call(domain, service, data, **kwargs):
        result = await real(domain, service, data, **kwargs)
        if service in ("turn_off", "close_valve"):
            set_state(hass, METER, "130")
            set_state(hass, "sensor.other", "20")
        return result

    hass.services.async_call.side_effect = _call

    await coord.async_run_program("p")

    assert coord.async_record_measured_flow.await_count == 2


async def test_the_meter_is_free_again_after_the_zones_close(monkeypatch):
    hass, coord, _ = _setup(monkeypatch, step={"zones": [0, 1]})

    await coord.async_run_program("p")

    assert coord._meter_users() == {}
