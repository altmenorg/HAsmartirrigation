"""A Sonoff SWV on ZHA is opened by "on with timed off": one command, open and bounded."""

from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
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

IEEE = "00:12:4b:00:2a:3c:4d:5e"
ENTITY = "switch.zone_0"
EXTRA = "switch.zone_0_extra"
SWV = SimpleNamespace(manufacturer="SONOFF", model="SWV")
OTHER = SimpleNamespace(manufacturer="Acme", model="Valve-9")
ZHA_ENTRY = SimpleNamespace(platform="zha", unique_id=f"{IEEE}-1", device_id="dev1")


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep",
        lambda *a, **k: REAL_SLEEP(0),
    )


def _setup(monkeypatch, *, device=SWV, entry=ZHA_ENTRY, zha_raises=False, **zone_kw):
    """A coordinator whose ZHA command is recorded (and opens the valve)."""
    hass = make_hass()
    plain_call = hass.services.async_call.side_effect
    hass.zha_calls = []
    hass.zha_raises = zha_raises
    hass.zha_opens = True

    async def _call(domain, service, data, **kwargs):
        if domain == "zha":
            hass.zha_calls.append(data)
            if hass.zha_raises:
                raise RuntimeError("zha is not set up")
            if hass.zha_opens:
                set_state(hass, ENTITY, "on")
            return
        await plain_call(domain, service, data, **kwargs)

    hass.services.async_call = AsyncMock(side_effect=_call)
    zone_kw.setdefault(const.ZONE_SAFETY_OFF_MODE, const.SAFETY_OFF_MODE_AUTO)
    store = make_store([zone(0, **zone_kw)])
    store.config.full_controller = False
    store.config.supplies = []
    coord = Coordinator(hass, store)
    registry = MagicMock()
    registry.async_get.return_value = entry
    devices = MagicMock()
    devices.async_get.return_value = device
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.er.async_get",
        lambda _hass: registry,
    )
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.dr.async_get",
        lambda _hass: devices,
    )
    return hass, coord, store


def _order(hass):
    return [(c.args[0], c.args[1]) for c in hass.services.async_call.call_args_list]


async def test_a_swv_opens_with_one_timed_command_in_seconds(monkeypatch):
    hass, coord, store = _setup(monkeypatch)

    await coord._run_one_pass(store.get_zone(0), ENTITY, 100.2)

    # Opened by the ZHA command alone: no turn_on, no second arm.
    assert opens(hass) == []
    assert len(hass.zha_calls) == 1
    data = hass.zha_calls[0]
    assert data["ieee"] == IEEE
    assert data["command"] == const.ZHA_ON_WITH_TIMED_OFF
    assert data["params"] == {
        "on_off_control": 0,
        "on_time": 101 + const.SAFETY_OFF_TIME_MARGIN,
        "off_wait_time": 0,
    }
    # The close is the normal one.
    assert closes(hass) == [ENTITY]
    assert _order(hass)[-1] == ("switch", "turn_off")


async def test_the_timed_time_is_clamped(monkeypatch):
    hass, coord, store = _setup(monkeypatch)

    await coord._run_one_pass(store.get_zone(0), ENTITY, 90000)

    assert hass.zha_calls[0]["params"]["on_time"] == const.ZHA_MAX_ON_TIME


async def test_a_failing_command_falls_back_to_turn_on_then_arm_and_warns_once(
    monkeypatch, caplog
):
    hass, coord, store = _setup(monkeypatch, zha_raises=True)

    with caplog.at_level("DEBUG"):
        await coord._run_one_pass(store.get_zone(0), ENTITY, 60)
        await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    assert opens(hass) == [ENTITY, ENTITY]
    # Per pass: the failed timed open (2 attempts), then the old arm attempt
    # (also failing).
    assert len(hass.zha_calls) == 6
    order = _order(hass)
    assert order[0] == ("zha", "issue_zigbee_cluster_command")
    assert order[2] == ("switch", "turn_on")
    levels = [r.levelname for r in caplog.records if "its own timer" in r.getMessage()]
    assert levels == ["WARNING", "DEBUG"]


def _hang_first(hass, hanging):
    """Make the first ``hanging`` ZHA calls never answer (a sleeping valve)."""
    inner = hass.services.async_call.side_effect

    async def _call(domain, service, data, **kwargs):
        if domain == "zha" and len(hass.zha_calls) < hanging:
            hass.zha_calls.append(data)
            await REAL_SLEEP(30)
        await inner(domain, service, data, **kwargs)

    hass.services.async_call = AsyncMock(side_effect=_call)


async def test_a_timed_attempt_that_times_out_is_retried_once(monkeypatch):
    hass, coord, store = _setup(monkeypatch)
    monkeypatch.setattr(const, "TIMED_OPEN_ATTEMPT_SECONDS", 0.01)
    _hang_first(hass, 1)

    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    # The second attempt carried the same payload and opened the valve.
    assert len(hass.zha_calls) == 2
    assert hass.zha_calls[0] == hass.zha_calls[1]
    assert opens(hass) == []
    assert closes(hass) == [ENTITY]


async def test_two_timeouts_fall_back_to_turn_on_and_arm_with_one_warning(
    monkeypatch, caplog
):
    hass, coord, store = _setup(monkeypatch)
    monkeypatch.setattr(const, "TIMED_OPEN_ATTEMPT_SECONDS", 0.01)
    monkeypatch.setattr(const, "ARM_ATTEMPT_SECONDS", 0.01)
    _hang_first(hass, 100)

    with caplog.at_level("DEBUG"):
        await coord._run_one_pass(store.get_zone(0), ENTITY, 60)
        await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    assert opens(hass) == [ENTITY, ENTITY]
    order = _order(hass)
    assert order[:3] == [
        ("zha", "issue_zigbee_cluster_command"),
        ("zha", "issue_zigbee_cluster_command"),
        ("switch", "turn_on"),
    ]
    # Then the old arm, bounded too.
    assert order[3] == ("zha", "issue_zigbee_cluster_command")
    records = [r for r in caplog.records if "its own timer" in r.getMessage()]
    assert [r.levelname for r in records] == ["WARNING", "DEBUG"]
    assert "after 2 attempts" in records[0].getMessage()


async def test_params_refused_falls_back_to_args_and_remembers(monkeypatch):
    import voluptuous as vol

    hass, coord, store = _setup(monkeypatch)
    inner = hass.services.async_call.side_effect

    async def _call(domain, service, data, **kwargs):
        if domain == "zha" and "params" in data:
            hass.zha_calls.append(data)
            raise vol.Invalid("extra keys not allowed @ data['params']")
        await inner(domain, service, data, **kwargs)

    hass.services.async_call = AsyncMock(side_effect=_call)

    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)
    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    sent = [c for c in hass.zha_calls if "args" in c]
    assert [c["args"] for c in sent] == [[0, 60 + const.SAFETY_OFF_TIME_MARGIN, 0]] * 2
    # Only the very first command tried params.
    assert len([c for c in hass.zha_calls if "params" in c]) == 1
    assert opens(hass) == []


async def test_another_error_is_not_taken_for_a_refused_params(monkeypatch):
    hass, coord, store = _setup(monkeypatch, zha_raises=True)

    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    assert all("args" not in c for c in hass.zha_calls)
    assert not getattr(coord, "_zha_args_only", False)


@pytest.mark.parametrize(
    "kwargs",
    [
        {"device": OTHER},
        {"entry": SimpleNamespace(platform="mqtt", unique_id="x", device_id="d")},
        {const.ZONE_SAFETY_OFF_TOPIC: "z2m/valve/set"},
        {const.ZONE_SAFETY_OFF_MODE: const.SAFETY_OFF_MODE_OFF},
    ],
)
async def test_other_valves_keep_turn_on_and_no_timed_open(monkeypatch, kwargs):
    hass, coord, store = _setup(monkeypatch, **kwargs)

    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    assert opens(hass) == [ENTITY]
    assert _order(hass)[0] == ("switch", "turn_on")
    # No timed open: a command with a 0x42 and a SWV-style time never first.
    assert all(
        not (c["params"]["on_time"] == 60 + const.SAFETY_OFF_TIME_MARGIN and i == 0)
        for i, c in enumerate(hass.zha_calls)
    )


async def test_explicit_zha_mode_on_an_unknown_model_is_unchanged(monkeypatch):
    hass, coord, store = _setup(
        monkeypatch,
        device=OTHER,
        **{const.ZONE_SAFETY_OFF_MODE: const.SAFETY_OFF_MODE_ZHA},
    )

    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    order = _order(hass)
    assert order[0] == ("switch", "turn_on")
    assert order[1] == ("zha", "issue_zigbee_cluster_command")
    # Tenths of a second, after the open.
    assert (
        hass.zha_calls[0]["params"]["on_time"]
        == (60 + const.SAFETY_OFF_TIME_MARGIN) * 10
    )


async def test_a_swv_in_explicit_zha_mode_keeps_the_old_path(monkeypatch):
    hass, coord, store = _setup(
        monkeypatch, **{const.ZONE_SAFETY_OFF_MODE: const.SAFETY_OFF_MODE_ZHA}
    )

    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    assert _order(hass)[0] == ("switch", "turn_on")
    assert _order(hass)[1] == ("zha", "issue_zigbee_cluster_command")


async def test_no_separate_arm_after_a_timed_open(monkeypatch):
    hass, coord, store = _setup(monkeypatch)

    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    zha = [c for c in _order(hass) if c[0] == "zha"]
    assert len(zha) == 1


async def test_extra_valves_keep_the_normal_open(monkeypatch):
    hass, coord, store = _setup(monkeypatch, **{const.ZONE_EXTRA_ENTITIES: [EXTRA]})
    store.config.full_controller = True

    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    assert opens(hass) == [EXTRA]
    assert len(hass.zha_calls) == 1
    assert closes(hass) == [ENTITY, EXTRA]


async def test_cycle_and_soak_restarts_the_timer_every_pass(monkeypatch):
    hass, coord, store = _setup(monkeypatch)

    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)
    await coord._run_one_pass(store.get_zone(0), ENTITY, 40)

    assert [c["params"]["on_time"] for c in hass.zha_calls] == [
        60 + const.SAFETY_OFF_TIME_MARGIN,
        40 + const.SAFETY_OFF_TIME_MARGIN,
    ]
    assert opens(hass) == []


async def test_a_resend_of_the_open_sends_the_same_command(monkeypatch):
    hass, coord, store = _setup(monkeypatch)
    hass.zha_opens = False
    store.config.full_controller = True
    # Only the second command opens the valve.

    async def _late(domain, service, data, **kwargs):
        hass.zha_calls.append(data)
        if len(hass.zha_calls) >= 2:
            set_state(hass, ENTITY, "on")

    hass.services.async_call = AsyncMock(side_effect=_late)
    set_state(hass, ENTITY, "off")

    ticks = iter(range(0, 10000, 5))
    hass.loop.time = lambda: float(next(ticks))

    await coord._run_one_pass(store.get_zone(0), ENTITY, 60)

    assert len(hass.zha_calls) >= 2
    assert hass.zha_calls[0] == hass.zha_calls[1]


async def test_resume_opens_with_the_remaining_seconds(monkeypatch):
    hass, coord, store = _setup(monkeypatch)
    coord._credit_direct_run = AsyncMock()
    coord._wait_or_stop = AsyncMock(return_value=False)
    run = {
        const.RUN_ENTITY_ID: ENTITY,
        const.RUN_DURATION: 100,
        const.RUN_STARTED: (dt_util.utcnow() - timedelta(seconds=40)).isoformat(),
    }

    await coord._resume_claimed(run, 0)

    assert opens(hass) == []
    assert len(hass.zha_calls) == 1
    on_time = hass.zha_calls[0]["params"]["on_time"]
    # About 60 s remained, plus the margin; and no second arm.
    assert (
        55 + const.SAFETY_OFF_TIME_MARGIN
        <= on_time
        <= 61 + const.SAFETY_OFF_TIME_MARGIN
    )
    assert closes(hass) == [ENTITY]
