"""Hardware safety of the valves: the ZHA dead-man and the check while one is open."""

from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.programs import normalize_programs
from custom_components.smart_irrigation.valve_runner import (
    VALVE_VERIFY_INTERVAL,
    ValveRunnerMixin,
)
from tests.runner_doubles import (
    REAL_SLEEP,
    Coordinator,
    closes,
    make_hass,
    make_store,
    opens,
    problems,
    set_state,
    zone,
)

IEEE = "00:12:4b:00:2a:3c:4d:5e"
ENTITY = "switch.ev_01_on_off"


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


def _runner(entry=None, *, raises=False):
    class _Runner(ValveRunnerMixin):
        pass

    runner = _Runner()
    runner.hass = MagicMock()
    runner.hass.services.async_call = AsyncMock()
    registry = MagicMock()
    registry.async_get.return_value = entry
    if raises:
        registry.async_get.side_effect = RuntimeError("no registry")
    runner._registry = registry
    return runner


async def _arm(runner, zone_data, held=600.2, entity_id=None, device="unset"):
    """Arm; the device registry returns ``device`` (default: an unknown model)."""
    if device == "unset":
        device = _device("Acme", "Valve-9")
    devices = MagicMock()
    devices.async_get.return_value = device
    if device == "raises":
        devices.async_get.side_effect = RuntimeError("no device registry")
    with (
        patch(
            "custom_components.smart_irrigation.valve_runner.er.async_get",
            return_value=runner._registry,
        ),
        patch(
            "custom_components.smart_irrigation.valve_runner.dr.async_get",
            return_value=devices,
        ),
    ):
        await runner._arm_safety_off(zone_data, held, entity_id)


def _entry(platform="zha", unique_id=f"{IEEE}-1", device_id="dev1"):
    return SimpleNamespace(platform=platform, unique_id=unique_id, device_id=device_id)


def _device(manufacturer, model):
    return SimpleNamespace(manufacturer=manufacturer, model=model)


SWV = _device("SONOFF", "SWV")
AUTO_ZONE = {
    const.ZONE_ID: 1,
    const.ZONE_LINKED_ENTITY: ENTITY,
    const.ZONE_SAFETY_OFF_MODE: const.SAFETY_OFF_MODE_AUTO,
}

# "zha" arms any ZHA valve (tenths for an unknown model); "auto" only a known
# seconds-counting model such as the Sonoff SWV.
ZONE = {
    const.ZONE_ID: 1,
    const.ZONE_LINKED_ENTITY: ENTITY,
    const.ZONE_SAFETY_OFF_MODE: const.SAFETY_OFF_MODE_ZHA,
}


# --- B1: the ZHA dead-man ---------------------------------------------------


async def test_a_zha_valve_is_told_to_switch_itself_off():
    runner = _runner(_entry())

    await _arm(runner, ZONE, 600.2)

    runner.hass.services.async_call.assert_awaited_once_with(
        "zha",
        "issue_zigbee_cluster_command",
        {
            "ieee": IEEE,
            "endpoint_id": 1,
            "cluster_id": 6,
            "cluster_type": "in",
            "command": 0x42,
            "command_type": "server",
            # (601 s + the margin) in tenths of a second.
            "args": [0, (601 + const.SAFETY_OFF_TIME_MARGIN) * 10, 0],
        },
        blocking=True,
    )


@pytest.mark.parametrize(
    "unique_id, endpoint",
    [
        (f"{IEEE}-1", 1),
        (f"{IEEE}-2-6", 2),
        (f"{IEEE}-1-6-extra", 1),
    ],
)
async def test_the_unique_id_variants_of_zha_are_read(unique_id, endpoint):
    runner = _runner(_entry(unique_id=unique_id))

    await _arm(runner, ZONE, 60)

    data = runner.hass.services.async_call.call_args[0][2]
    assert (data["ieee"], data["endpoint_id"]) == (IEEE, endpoint)


@pytest.mark.parametrize(
    "unique_id", ["", "nonsense", f"{IEEE}", "aa:bb-1", f"{IEEE}-x", "abc-def-ghi"]
)
async def test_an_unreadable_unique_id_arms_nothing(unique_id):
    runner = _runner(_entry(unique_id=unique_id))

    await _arm(runner, ZONE, 60)

    runner.hass.services.async_call.assert_not_called()


@pytest.mark.parametrize("platform", ["mqtt", "esphome", "tuya", "shelly"])
async def test_a_valve_of_another_platform_gets_no_dead_man(platform):
    runner = _runner(_entry(platform=platform))

    await _arm(runner, ZONE, 60)

    runner.hass.services.async_call.assert_not_called()


async def test_an_entity_missing_from_the_registry_arms_nothing():
    runner = _runner(None)

    await _arm(runner, ZONE, 60)

    runner.hass.services.async_call.assert_not_called()


async def test_a_registry_that_raises_arms_nothing():
    runner = _runner(raises=True)

    await _arm(runner, ZONE, 60)

    runner.hass.services.async_call.assert_not_called()


async def test_the_mode_off_never_arms_anything():
    runner = _runner(_entry())

    with patch("homeassistant.components.mqtt.async_publish", AsyncMock()) as publish:
        await _arm(runner, {**ZONE, const.ZONE_SAFETY_OFF_MODE: "off"}, 60)
        await _arm(
            runner,
            {
                **ZONE,
                const.ZONE_SAFETY_OFF_MODE: "off",
                const.ZONE_SAFETY_OFF_TOPIC: "z2m/valve/set",
            },
            60,
        )

    runner.hass.services.async_call.assert_not_called()
    publish.assert_not_called()


@pytest.mark.parametrize("mode", [None, "auto"])
async def test_auto_does_not_arm_an_unknown_zha_model(mode):
    runner = _runner(_entry())

    await _arm(runner, {**ZONE, const.ZONE_SAFETY_OFF_MODE: mode}, 60)

    runner.hass.services.async_call.assert_not_called()


@pytest.mark.parametrize("mode", [None, "auto"])
async def test_auto_arms_a_sonoff_swv_in_seconds(mode):
    runner = _runner(_entry())

    await _arm(runner, {**ZONE, const.ZONE_SAFETY_OFF_MODE: mode}, 600.2, device=SWV)

    data = runner.hass.services.async_call.call_args[0][2]
    assert data["args"] == [0, 601 + const.SAFETY_OFF_TIME_MARGIN, 0]


@pytest.mark.parametrize(
    "manufacturer, model", [("sonoff", "swv"), (" Sonoff ", "SWV")]
)
async def test_the_model_match_ignores_case(manufacturer, model):
    runner = _runner(_entry())

    await _arm(runner, AUTO_ZONE, 60, device=_device(manufacturer, model))

    runner.hass.services.async_call.assert_awaited_once()


@pytest.mark.parametrize(
    "device",
    [
        _device("SONOFF", "ZBMINI"),
        _device("Other", "SWV"),
        _device(None, None),
        None,
        "raises",
    ],
)
async def test_auto_arms_nothing_for_another_model_or_a_failed_lookup(device):
    runner = _runner(_entry())

    await _arm(runner, AUTO_ZONE, 60, device=device)

    runner.hass.services.async_call.assert_not_called()


async def test_auto_arms_nothing_when_the_entity_has_no_device():
    runner = _runner(_entry(device_id=None))

    await _arm(runner, AUTO_ZONE, 60, device=SWV)

    runner.hass.services.async_call.assert_not_called()


async def test_zha_mode_arms_a_swv_in_seconds_too():
    runner = _runner(_entry())

    await _arm(runner, ZONE, 60, device=SWV)

    args = runner.hass.services.async_call.call_args[0][2]["args"]
    assert args == [0, 60 + const.SAFETY_OFF_TIME_MARGIN, 0]


async def test_zha_mode_arms_an_unknown_model_in_tenths():
    runner = _runner(_entry())

    await _arm(runner, ZONE, 60)

    args = runner.hass.services.async_call.call_args[0][2]["args"]
    assert args == [0, (60 + const.SAFETY_OFF_TIME_MARGIN) * 10, 0]


async def test_a_swv_time_is_clamped_to_16_bits():
    runner = _runner(_entry())

    await _arm(runner, AUTO_ZONE, 100000, device=SWV)

    args = runner.hass.services.async_call.call_args[0][2]["args"]
    assert args == [0, 0xFFFF, 0]


async def test_a_swv_long_pass_still_gets_seconds_beyond_6553():
    runner = _runner(_entry())

    await _arm(runner, AUTO_ZONE, 7000, device=SWV)

    args = runner.hass.services.async_call.call_args[0][2]["args"]
    assert args == [0, 7000 + const.SAFETY_OFF_TIME_MARGIN, 0]


async def test_a_topic_wins_over_a_swv_in_auto():
    runner = _runner(_entry())

    with patch("homeassistant.components.mqtt.async_publish", AsyncMock()) as publish:
        await _arm(
            runner,
            {**AUTO_ZONE, const.ZONE_SAFETY_OFF_TOPIC: "z2m/valve/set"},
            60,
            device=SWV,
        )

    publish.assert_awaited_once()
    runner.hass.services.async_call.assert_not_called()


async def test_the_mode_off_does_not_arm_a_swv():
    runner = _runner(_entry())

    await _arm(runner, {**AUTO_ZONE, const.ZONE_SAFETY_OFF_MODE: "off"}, 60, device=SWV)

    runner.hass.services.async_call.assert_not_called()


async def test_a_configured_topic_still_goes_to_mqtt_only():
    runner = _runner(_entry())

    with patch("homeassistant.components.mqtt.async_publish", AsyncMock()) as publish:
        await _arm(
            runner, {**ZONE, const.ZONE_SAFETY_OFF_TOPIC: "z2m/valve/set"}, 600.2
        )

    _hass, topic, payload = publish.call_args[0][:3]
    assert topic == "z2m/valve/set"
    assert payload == '{"state": "ON", "on_time": 631}'
    runner.hass.services.async_call.assert_not_called()


async def test_a_failing_zha_call_never_breaks_the_run_and_warns_once(caplog):
    runner = _runner(_entry())
    runner.hass.services.async_call.side_effect = RuntimeError("zha is not set up")

    with caplog.at_level("DEBUG"):
        await _arm(runner, ZONE, 60)
        await _arm(runner, ZONE, 60)

    levels = [r.levelname for r in caplog.records if "safety off_time" in r.message]
    assert levels == ["WARNING", "DEBUG"]


async def test_a_zha_time_that_fits_the_16_bits_is_armed():
    runner = _runner(_entry())

    await _arm(runner, ZONE, 6000)

    args = runner.hass.services.async_call.call_args[0][2]["args"]
    assert args[1] <= 0xFFFF and args[1] > 6000 * 10


async def test_a_pass_too_long_for_the_zha_timer_arms_no_dead_man_and_warns_once(
    caplog,
):
    runner = _runner(_entry())

    with caplog.at_level("DEBUG"):
        await _arm(runner, ZONE, 7000)
        await _arm(runner, ZONE, 7000)

    # A timer clamped at 0xFFFF tenths would shut the valve at 109 minutes.
    runner.hass.services.async_call.assert_not_called()
    levels = [r.levelname for r in caplog.records if "safety off_time" in r.message]
    assert levels == ["WARNING", "DEBUG"]


async def test_a_pass_arms_the_zha_dead_man_after_the_normal_open(monkeypatch):
    hass = make_hass()
    store = make_store(
        [
            zone(
                0,
                **{
                    const.ZONE_LINKED_ENTITY: ENTITY,
                    const.ZONE_SAFETY_OFF_MODE: const.SAFETY_OFF_MODE_ZHA,
                },
            )
        ]
    )
    coord = Coordinator(hass, store)
    registry = MagicMock()
    registry.async_get.return_value = _entry()
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.er.async_get",
        lambda _hass: registry,
    )
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep",
        lambda *a, **k: REAL_SLEEP(0),
    )

    await coord._run_one_pass(store.get_zone(0), ENTITY, 5)

    order = [
        (call.args[0], call.args[1]) for call in hass.services.async_call.call_args_list
    ]
    assert order[0] == ("switch", "turn_on")
    assert order[1] == ("zha", "issue_zigbee_cluster_command")
    assert order[-1] == ("switch", "turn_off")


# --- B3: the check while a valve is open -----------------------------------


class Clock:
    """asyncio.sleep of the runner: the hold of the pass waits, long.

    ``hook`` runs once, as the hold starts (the moment to make the valve do
    something while it is supposed to be open). The hold lasts ``hold`` real
    seconds, or until the run is stopped.
    """

    def __init__(self, hook=None, hold=30):
        self.hook = hook
        self.hold = hold

    async def __call__(self, seconds, *args, **kwargs):
        if seconds >= 100:
            if self.hook is not None:
                hook, self.hook = self.hook, None
                hook()
            await REAL_SLEEP(self.hold)
            return
        await REAL_SLEEP(0)


def _setup(monkeypatch, hook=None, *, full=True, hold=30):
    hass = make_hass()
    store = make_store([zone(0, **{const.ZONE_DURATION: 600})])
    store.config.full_controller = full
    store.config.supplies = []
    store.config.programs = normalize_programs(
        [{"id": "p", "name": "P", "steps": [{"zones": [0]}]}]
    )
    store.config.active_cycle = None
    store.config.active_program_run = None
    store.config.suspensions = None
    coord = Coordinator(hass, store)
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep",
        Clock(lambda: hook(hass) if hook else None, hold),
    )
    # The check runs on a real timer: make it quick.
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.VALVE_VERIFY_INTERVAL", 0.01
    )
    return hass, coord, store


def _fired(hass, event):
    return [
        call.args[1]
        for call in hass.bus.async_fire.call_args_list
        if call.args[0] == f"{const.DOMAIN}_{event}"
    ]


def test_the_check_runs_every_minute():
    assert VALVE_VERIFY_INTERVAL == 60.0


async def test_a_valve_that_closed_by_itself_is_reported(monkeypatch):
    hass, coord, store = _setup(
        monkeypatch, lambda hass: set_state(hass, "switch.zone_0", "off")
    )

    await coord.async_run_program("p")

    [event] = _fired(hass, const.EVENT_VALVE_OUT_OF_SYNC)
    assert event == {
        "zone_id": 0,
        "zone": "Zone 0",
        "entity_id": "switch.zone_0",
        "expected": "open",
        "actual": "off",
        "reason": "closed_early",
    }
    assert "valve_closed_early" in problems(hass)


async def test_a_valve_that_closed_by_itself_is_not_opened_again(monkeypatch):
    hass, coord, store = _setup(
        monkeypatch, lambda hass: set_state(hass, "switch.zone_0", "closed")
    )

    await coord.async_run_program("p")

    assert opens(hass) == ["switch.zone_0"]
    # The check is not the only close: the pass still shuts the valve its usual way.
    assert closes(hass) == ["switch.zone_0"]


async def test_the_zone_is_credited_for_the_time_it_was_open(monkeypatch):
    now = {"t": dt_util.utcnow()}
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.dt_util.utcnow",
        lambda: now["t"],
    )

    def hook(hass):
        # Closed 45 seconds in, and noticed a minute in.
        set_state(
            hass, "switch.zone_0", "off", changed=now["t"] + timedelta(seconds=45)
        )
        now["t"] += timedelta(seconds=60)

    hass, coord, store = _setup(monkeypatch, hook)

    await coord.async_run_program("p")

    # 10 L/min over 50 m2 is 12 mm/h: 45 s of water is 0.15 mm, not 2 mm.
    assert store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-3.0 + 0.15, abs=0.01)


async def test_a_valve_closed_without_a_change_time_is_credited_up_to_the_check(
    monkeypatch,
):
    now = {"t": dt_util.utcnow()}
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.dt_util.utcnow",
        lambda: now["t"],
    )

    def hook(hass):
        set_state(hass, "switch.zone_0", "off", changed=now["t"] - timedelta(days=1))
        now["t"] += timedelta(seconds=60)

    hass, coord, store = _setup(monkeypatch, hook)

    await coord.async_run_program("p")

    # A change time outside the pass is not believed: 60 s, 0.2 mm.
    assert store.by_id[0][const.ZONE_BUCKET] == pytest.approx(-3.0 + 0.2, abs=0.01)


@pytest.mark.parametrize("reading", ["unavailable", "unknown"])
async def test_an_unreadable_valve_is_not_a_closed_one(monkeypatch, reading):
    hass, coord, store = _setup(
        monkeypatch,
        lambda hass: set_state(hass, "switch.zone_0", reading),
        hold=0.2,
    )
    reads = []
    get = hass.states.get
    hass.states.get = lambda entity_id: reads.append(entity_id) or get(entity_id)

    await coord.async_run_program("p")

    # The check kept reading, and said nothing.
    assert len(reads) > 3
    assert _fired(hass, const.EVENT_VALVE_OUT_OF_SYNC) == []
    assert "valve_closed_early" not in problems(hass)


async def test_a_valve_that_stays_open_says_nothing(monkeypatch):
    hass, coord, store = _setup(monkeypatch, hold=0.1)

    await coord.async_run_program("p")

    assert _fired(hass, const.EVENT_VALVE_OUT_OF_SYNC) == []
    assert problems(hass) == []


async def test_without_the_full_controller_the_valve_is_not_checked(monkeypatch):
    hass, coord, store = _setup(
        monkeypatch,
        lambda hass: set_state(hass, "switch.zone_0", "off"),
        full=False,
        hold=0.1,
    )

    await coord._run_one_pass(store.get_zone(0), "switch.zone_0", 600)

    assert _fired(hass, const.EVENT_VALVE_OUT_OF_SYNC) == []
    assert problems(hass) == []
