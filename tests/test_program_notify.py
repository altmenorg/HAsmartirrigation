"""Programs that tell someone when they have watered (program_notify.py)."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const, program_notify
from custom_components.smart_irrigation.programs import (
    normalize_notify,
    normalize_programs,
)

# --- what is stored


def test_nothing_is_stored_without_a_target():
    assert normalize_notify(None) is None
    assert normalize_notify({"targets": [], "when": "problems"}) is None
    assert normalize_notify({"targets": ["light.kitchen", 3, "notify."]}) is None


def test_targets_are_kept_once_and_the_rest_defaults():
    assert normalize_notify(
        {
            "targets": [
                " notify.mobile_app_pixel ",
                "notify.mobile_app_pixel",
                "persistent_notification",
                "script.evil",
            ],
            "when": "sometimes",
            "start": "yes",
        }
    ) == {
        "targets": ["notify.mobile_app_pixel", "persistent_notification"],
        "when": "finish",
        "start": False,
    }


def test_programs_keep_their_notifications_main_included():
    notify = {"targets": ["persistent_notification"], "when": "problems"}
    main, other = normalize_programs(
        [
            {"id": "main", "main": True, "notify": notify},
            {"id": "evening", "name": "Evening", "notify": notify},
        ]
    )
    expected = {**notify, "start": False}
    assert main["notify"] == expected
    assert other["notify"] == expected
    bare, *_ = normalize_programs([{"id": "main", "main": True}])
    assert "notify" not in bare


# --- what is said

_EN = program_notify._Text(program_notify._load_table("en"), {})


def test_the_summary_lists_each_zone_and_each_problem():
    title, text = program_notify.finished_message(
        _EN,
        "Evening",
        {
            "zones": [
                {"zone": "Lawn", "seconds": 630, "volume_l": 84.25},
                {"zone": "Pots", "seconds": 120, "volume_l": 0},
            ],
            "problems": [{"zone": "Roses", "reason": "valve_did_not_open"}],
        },
    )
    assert title == "Evening: a problem"
    assert text.splitlines() == [
        "Lawn: 10.5 min, 84.2 L",
        "Pots: 2 min",
        "⚠️ Roses: the valve did not open",
    ]


def test_a_run_with_nothing_to_water_says_so():
    title, text = program_notify.finished_message(_EN, "Main", {"zones": []})
    assert title == "Main: watering done"
    assert text == "No zone needed water."


def test_an_unknown_reason_is_given_as_it_came():
    _, text = program_notify.finished_message(
        _EN, "P", {"problems": [{"zone": "A", "reason": "odd_reason"}]}
    )
    assert text == "⚠️ A: odd_reason"


def test_every_language_has_the_strings():
    english = program_notify._load_table("en")
    for path in program_notify._LANGUAGES.glob("*.json"):
        table = program_notify._load_table(path.stem)
        assert set(table) == set(english), path.stem
        assert set(table["reasons"]) == set(english["reasons"]), path.stem


def test_a_regional_language_finds_its_file():
    assert program_notify._file_for("zh-Hant") == "zh-Hant"
    assert program_notify._file_for("fr-CA") == "fr"
    assert program_notify._file_for("nb") == "no"
    assert program_notify._file_for("xx") == "en"


# --- who is told, and how


def _hass(entities=(), actions=()):
    hass = MagicMock()
    hass.config.language = "en"
    hass.states.get = lambda entity_id: object() if entity_id in entities else None
    hass.services.has_service = lambda domain, action: action in actions
    hass.services.async_call = AsyncMock()
    hass.created = []
    hass.async_create_task = lambda coro: hass.created.append(coro)

    async def executor(fn, *args):
        return fn(*args)

    hass.async_add_executor_job = executor
    return hass


def _notifier(hass, programs, full=True, running=None):
    coordinator = SimpleNamespace(
        store=SimpleNamespace(
            config=SimpleNamespace(full_controller=full, programs=programs)
        ),
        _program_runs_by_id=running or {},
    )
    return program_notify.ProgramNotifier(hass, coordinator)


def _event(**data):
    return SimpleNamespace(data=data)


_PROGRAMS = [
    {
        "id": "main",
        "name": "Watering",
        "notify": {"targets": ["notify.mobile_app_pixel"], "when": "finish"},
    },
    {
        "id": "evening",
        "name": "Evening",
        "notify": {
            "targets": ["persistent_notification", "notify.kitchen"],
            "when": "problems",
            "start": True,
        },
    },
    {"id": "quiet", "name": "Quiet"},
]


async def _run_all(hass):
    for coro in hass.created:
        await coro
    hass.created.clear()


async def test_the_old_main_program_tells_the_phone_at_the_end_once():
    hass = _hass(actions={"mobile_app_pixel"})
    notifier = _notifier(hass, _PROGRAMS)

    # Its run fires program_finished (heard) and, for old automations, the
    # cycle's irrigation_finished, which nothing here listens to any more:
    # told once, not twice.
    notifier._program_finished(
        _event(program_id="main", zones=[{"zone": "Lawn", "seconds": 600}])
    )
    await _run_all(hass)

    hass.services.async_call.assert_awaited_once()
    domain, action, data = hass.services.async_call.await_args.args
    assert (domain, action) == ("notify", "mobile_app_pixel")
    assert data["title"] == "Watering: watering done"
    assert data["message"] == "Lawn: 10 min"
    assert data["data"] == {"tag": "smart_irrigation_main"}


async def test_only_problems_stays_quiet_when_all_went_well():
    hass = _hass(entities={"notify.kitchen"})
    notifier = _notifier(hass, _PROGRAMS)

    notifier._program_finished(_event(program_id="evening", zones=[], problems=[]))
    assert hass.created == []

    notifier._program_finished(
        _event(
            program_id="evening",
            zones=[],
            problems=[{"zone": "Roses", "reason": "no_flow"}],
        )
    )
    await _run_all(hass)
    calls = [c.args[:2] for c in hass.services.async_call.await_args_list]
    assert calls == [
        ("persistent_notification", "create"),
        ("notify", "send_message"),
    ]
    entity_call = hass.services.async_call.await_args_list[1].args[2]
    assert entity_call["entity_id"] == "notify.kitchen"


async def test_the_start_is_told_only_when_asked():
    hass = _hass(entities={"notify.kitchen"})
    notifier = _notifier(hass, _PROGRAMS)

    notifier._program_started(
        _event(program_id="main", zones=[{"zone": "Lawn", "seconds": 60}])
    )
    assert hass.created == []
    notifier._program_started(
        _event(program_id="evening", zones=[{"zone": "Lawn", "seconds": 60}])
    )
    await _run_all(hass)
    assert hass.services.async_call.await_count == 2


def test_nothing_without_the_full_controller_or_a_target():
    hass = _hass(actions={"mobile_app_pixel"})
    _notifier(hass, _PROGRAMS, full=False)._program_finished(
        _event(program_id="main", zones=[])
    )
    _notifier(hass, _PROGRAMS)._program_finished(_event(program_id="quiet"))
    _notifier(hass, _PROGRAMS)._program_finished(_event(program_id="gone"))
    assert hass.created == []


async def test_a_valve_that_will_not_close_is_told_at_once_and_urgently():
    hass = _hass(actions={"mobile_app_pixel"})
    running = {"main": SimpleNamespace(running_since=12.0)}
    notifier = _notifier(hass, _PROGRAMS, running=running)

    notifier._zone_problem(_event(zone="Lawn", reason="valve_did_not_open"))
    assert hass.created == []  # in the summary at the end
    notifier._zone_problem(_event(zone="Lawn", reason="valve_did_not_close"))
    await _run_all(hass)

    data = hass.services.async_call.await_args.args[2]
    assert data["message"] == "⚠️ Lawn: the valve did not close"
    assert data["data"]["priority"] == "high"
    assert data["data"]["push"] == {"interruption-level": "time-sensitive"}


async def test_a_problem_goes_to_the_program_that_is_watering():
    hass = _hass(entities={"notify.kitchen"})
    running = {"evening": SimpleNamespace(running_since=12.0)}
    notifier = _notifier(hass, _PROGRAMS, running=running)

    notifier._supply_problem(_event(supply="Pump", reason="supply_did_not_turn_off"))
    await _run_all(hass)

    titles = {c.args[2]["title"] for c in hass.services.async_call.await_args_list}
    assert titles == {"Evening: a problem"}


async def test_outside_a_program_every_program_that_notifies_is_told(caplog):
    hass = _hass(entities={"notify.kitchen"}, actions={"mobile_app_pixel"})
    notifier = _notifier(hass, _PROGRAMS)

    # A zone watered by hand, nothing running: no program is under way.
    notifier._zone_problem(_event(zone="Lawn", reason="valve_did_not_close"))
    await _run_all(hass)

    calls = sorted(c.args[:2] for c in hass.services.async_call.await_args_list)
    assert calls == [
        ("notify", "mobile_app_pixel"),
        ("notify", "send_message"),
        ("persistent_notification", "create"),
    ]


async def test_a_target_that_fails_does_not_stop_the_others(caplog):
    hass = _hass(entities={"notify.kitchen"})
    hass.services.async_call = AsyncMock(side_effect=[RuntimeError("down"), None])
    notifier = _notifier(hass, _PROGRAMS)

    notifier._program_finished(
        _event(program_id="evening", problems=[{"zone": "A", "reason": "no_flow"}])
    )
    await _run_all(hass)

    assert hass.services.async_call.await_count == 2
    assert "could not notify persistent_notification" in caplog.text


async def test_a_target_that_is_gone_is_skipped(caplog):
    hass = _hass()
    notifier = _notifier(hass, _PROGRAMS)

    notifier._program_finished(_event(program_id="main", zones=[]))
    await _run_all(hass)

    hass.services.async_call.assert_not_awaited()
    assert "does not exist" in caplog.text


def test_the_listeners_come_and_go():
    hass = _hass()
    unsubs = [MagicMock() for _ in range(5)]
    hass.bus.async_listen = MagicMock(side_effect=unsubs)

    notifier = program_notify.async_setup_program_notify(hass, MagicMock())
    events = [c.args[0] for c in hass.bus.async_listen.call_args_list]
    assert f"{const.DOMAIN}_{const.EVENT_PROGRAM_FINISHED}" in events
    notifier.stop()
    for unsub in unsubs:
        unsub.assert_called_once()


@pytest.mark.parametrize("value, shown", [(0.0, "0"), (2.0, "2"), (10.25, "10.2")])
def test_numbers_are_short(value, shown):
    assert program_notify._number(value) == shown
