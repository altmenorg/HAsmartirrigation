"""Importing an Irrigation Unlimited configuration from Home Assistant.

Where the configuration is found, which blueprints already feed IU, what the
preview says, and what apply does, the first time and again.
"""

import copy
import inspect
import time
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import attr
import pytest
from homeassistant.exceptions import HomeAssistantError, Unauthorized
from homeassistant.helpers import entity_registry as er

from custom_components.smart_irrigation import (
    SmartIrrigationCoordinator,
    const,
    iu_import_ha,
    websockets,
)
from custom_components.smart_irrigation.programs import (
    ensure_main_program,
)
from custom_components.smart_irrigation.store import Config, ZoneEntry
from custom_components.smart_irrigation.supplies import normalize_supplies

CONFIG = {
    "controllers": [
        {
            "name": "Garden",
            "entity_id": "switch.pump",
            "zones": [
                {"name": "Lawn", "entity_id": "valve.lawn", "zone_id": "lawn"},
                {"name": "Beds", "entity_id": "valve.beds"},
            ],
            "sequences": [
                {
                    "name": "Morning",
                    "schedules": [{"time": "06:05"}],
                    "zones": [
                        {"zone_id": "lawn", "duration": "00:10"},
                        {"zone_id": 2, "duration": "00:05"},
                    ],
                },
                {
                    "name": "Evening",
                    "schedules": [{"time": "19:00"}],
                    "zones": [{"zone_id": 2, "duration": "00:03"}],
                },
            ],
        }
    ]
}


class FakeCoordinator:
    """The coordinator's two entry points an import uses, over a plain store."""

    def __init__(self, zones=(), full_controller=True):
        self.store = SimpleNamespace(
            zones={zone[const.ZONE_ID]: ZoneEntry(**zone) for zone in zones},
            # Switched on, the full controller has its main program.
            config=Config(
                full_controller=full_controller,
                programs=ensure_main_program([]) if full_controller else [],
            ),
        )

    async def async_update_config(self, data):
        data = dict(data)
        if const.CONF_PROGRAMS in data:
            # As the coordinator stores them: ids kept, marks of the gone dropped.
            data = SmartIrrigationCoordinator._programs_changes(self, data)
        if const.CONF_SUPPLIES in data:
            data[const.CONF_SUPPLIES] = normalize_supplies(data[const.CONF_SUPPLIES])
        self.store.config = attr.evolve(self.store.config, **data)

    async def async_update_zone_config(self, zone_id, data):
        if zone_id is None:
            new_id = max(self.store.zones, default=-1) + 1
            self.store.zones[new_id] = ZoneEntry(**data, id=new_id)
        else:
            self.store.zones[zone_id] = attr.evolve(self.store.zones[zone_id], **data)

    def programs(self):
        return {
            p[const.PROGRAM_ID]: p
            for p in self.store.config.programs
            if p[const.PROGRAM_ID] != "main"
        }


def _zone(zone_id, name, **fields):
    return {const.ZONE_ID: zone_id, const.ZONE_NAME: name, **fields}


async def _import(coordinator, config=CONFIG, links=(), matches=None):
    preview = iu_import_ha.plan(config, coordinator.store, list(links), matches, "yaml")
    result = await iu_import_ha.async_apply(coordinator, preview)
    return preview, result


# --- where the configuration comes from --------------------------------------


def test_pasted_yaml_is_read_with_or_without_its_key():
    text = "controllers:\n  - name: G\n    zones:\n      - entity_id: valve.a\n"
    config, notes = iu_import_ha.parse_pasted(text)
    assert config["controllers"][0]["name"] == "G"
    assert notes == []
    wrapped = "irrigation_unlimited:\n" + "".join(
        "  " + line + "\n" for line in text.splitlines()
    )
    assert iu_import_ha.parse_pasted(wrapped) == iu_import_ha.parse_pasted(text)


def test_pasted_yaml_never_reads_files_or_the_environment(tmp_path, monkeypatch):
    """!include, !env_var and !secret stay the text written, and are reported."""
    secret = tmp_path / "secrets.yaml"
    secret.write_text("token: hunter2\n")
    monkeypatch.setenv("SUPERVISOR_TOKEN", "do-not-show")
    text = (
        "controllers:\n"
        f"  - name: !include {secret}\n"
        "    entity_id: !env_var SUPERVISOR_TOKEN\n"
        "    zones:\n"
        "      - name: !secret token\n"
    )
    config, notes = iu_import_ha.parse_pasted(text)
    controller = config["controllers"][0]
    assert controller["name"] == f"!include {secret}"
    assert controller["entity_id"] == "!env_var SUPERVISOR_TOKEN"
    assert controller["zones"][0]["name"] == "!secret token"
    assert "hunter2" not in repr(config) and "do-not-show" not in repr(config)
    assert "!include, !env_var, !secret" in notes[0]["note"]
    # The report carries the note, and no supply is made of the tag.
    preview = iu_import_ha.plan(
        config, FakeCoordinator().store, [], None, "pasted", notes
    )
    assert preview["supplies"] == []
    assert any("not followed" in i["note"] for i in preview["report"]["items"])


@pytest.mark.parametrize(
    "field", ["every_n_days", "repeat", "duration", "before", "delay"]
)
@pytest.mark.parametrize("value", [".inf", "-.inf", ".nan"])
def test_an_infinite_value_is_refused_with_a_reason(field, value):
    """Not a traceback and an unknown error: IU has no infinite value."""
    text = (
        "controllers:\n"
        "  - name: Garden\n"
        "    zones:\n"
        f"      - name: Lawn\n        {field}: {value}\n"
    )
    with pytest.raises(iu_import_ha.IUImportError) as err:
        iu_import_ha.parse_pasted(text)
    assert err.value.code == "not_finite"


def test_pasted_yaml_too_large_is_refused_before_it_is_walked():
    with pytest.raises(iu_import_ha.IUImportError) as err:
        iu_import_ha.parse_pasted("controllers: []\n" + "#" * 300_000)
    assert err.value.code == "too_big"
    # An alias bomb: a few hundred bytes, millions of values once expanded.
    bomb = 'a: &a ["x","x","x","x","x","x","x","x","x","x"]\n'
    for n in "bcdefgh":
        prev = chr(ord(n) - 1)
        bomb += f"{n}: &{n} [*{prev},*{prev},*{prev},*{prev},*{prev},*{prev},"
        bomb += f"*{prev},*{prev},*{prev},*{prev}]\n"
    bomb += "controllers: [*h]\n"
    started = time.monotonic()
    with pytest.raises(iu_import_ha.IUImportError) as err:
        iu_import_ha.parse_pasted(bomb)
    assert err.value.code == "too_big"
    assert time.monotonic() - started < 1


@pytest.mark.parametrize(
    ("text", "code"),
    [
        ("controllers: [", "yaml_invalid"),
        ("zones: !secret valves\n", "yaml_not_iu"),
        ("switch:\n  - platform: template\n", "yaml_not_iu"),
    ],
)
def test_pasted_yaml_that_is_no_iu_configuration_is_refused(text, code):
    with pytest.raises(iu_import_ha.IUImportError) as err:
        iu_import_ha.parse_pasted(text)
    assert err.value.code == code


async def _in_executor(func, *args):
    return func(*args)


def _hass_with(yaml=None, entries=()):
    hass = MagicMock()
    hass.async_add_executor_job = _in_executor
    hass.config_entries.async_entries.return_value = list(entries)
    loaded = {} if yaml is None else {"irrigation_unlimited": yaml}
    return hass, patch(
        "homeassistant.config.async_hass_config_yaml",
        AsyncMock(return_value=loaded),
    )


def _entry(entry_id, data, options=None, title="Irrigation Unlimited"):
    return SimpleNamespace(
        entry_id=entry_id, data=data, options=options or {}, title=title
    )


async def test_the_yaml_comes_first_then_iu_s_own_dialogs():
    entry = _entry("abc", {"controllers": [{"name": "old"}]}, CONFIG)
    hass, loader = _hass_with(CONFIG, [entry])
    with loader:
        sources = await iu_import_ha.async_sources(hass)
        assert [s["id"] for s in sources] == ["yaml", "entry:abc"]
        assert await iu_import_ha.async_read_source(hass, None) == (
            "yaml",
            CONFIG,
            [],
        )
        # IU reads its options, which its dialogs write, over the first data.
        assert await iu_import_ha.async_read_source(hass, "entry:abc") == (
            "entry:abc",
            CONFIG,
            [],
        )


async def test_without_any_configuration_it_asks_for_yaml():
    hass, loader = _hass_with(None, [_entry("abc", {})])
    with loader:
        assert await iu_import_ha.async_sources(hass) == []
        with pytest.raises(iu_import_ha.IUImportError) as err:
            await iu_import_ha.async_read_source(hass, None)
        assert err.value.code == "no_source"
        source, config, notes = await iu_import_ha.async_read_source(
            hass, None, "controllers: []\n"
        )
        assert (source, config, notes) == ("pasted", {"controllers": []}, [])


async def test_a_configuration_home_assistant_cannot_read_is_said_so():
    from homeassistant.exceptions import HomeAssistantError

    hass = MagicMock()
    hass.config_entries.async_entries.return_value = []
    with patch(
        "homeassistant.config.async_hass_config_yaml",
        AsyncMock(side_effect=HomeAssistantError("bad indent")),
    ):
        sources = await iu_import_ha.async_sources(hass)
        assert sources[0]["id"] == "yaml" and "bad indent" in sources[0]["error"]
        with pytest.raises(iu_import_ha.IUImportError) as err:
            await iu_import_ha.async_read_source(hass, None)
        assert err.value.code == "no_source"


# --- the automations that already feed IU ------------------------------------


def _automation(config):
    """An automation entity as Home Assistant holds it: its public raw_config,
    a blueprint's inputs already substituted."""
    return SimpleNamespace(raw_config=config)


def _zone_blueprint(sensor, iu_zone):
    """What the single-zone adjust-time blueprint becomes."""
    return {
        "variables": {"duration": sensor},
        "condition": [
            {
                "condition": "template",
                "value_template": "{{ (states(duration) | float(-1)) >= 0 }}",
            }
        ],
        "action": [
            {
                "service": "irrigation_unlimited.adjust_time",
                "data": {
                    "actual": "{{ timedelta(seconds=states(duration) | int(0)) }}",
                    "entity_id": iu_zone,
                },
            }
        ],
    }


async def test_the_adjust_time_automations_become_links(hass):
    from homeassistant.components.automation import DATA_COMPONENT

    registry = er.async_get(hass)
    lawn = registry.async_get_or_create(
        "sensor", const.DOMAIN, "smart_irrigation_4_duration"
    ).entity_id
    beds = registry.async_get_or_create(
        "sensor", const.DOMAIN, "smart_irrigation_7_duration"
    ).entity_id
    bucket = registry.async_get_or_create(
        "sensor", const.DOMAIN, "smart_irrigation_7_bucket"
    ).entity_id
    iu_zone = registry.async_get_or_create(
        "binary_sensor", "irrigation_unlimited", "c1_z1"
    ).entity_id
    iu_controller = registry.async_get_or_create(
        "binary_sensor", "irrigation_unlimited", "c1_m"
    ).entity_id
    iu_sequence = registry.async_get_or_create(
        "binary_sensor", "irrigation_unlimited", "c2_s1"
    ).entity_id
    hass.data[DATA_COMPONENT] = SimpleNamespace(
        entities=[
            _automation(_zone_blueprint(lawn, iu_zone)),
            # The sequence blueprint: the controller, the sequence's number and
            # the zone's position in it.
            _automation(
                {
                    "variables": {"duration": beds},
                    "actions": [
                        {
                            "action": "irrigation_unlimited.adjust_time",
                            "data": {
                                "entity_id": iu_controller,
                                "sequence_id": 2,
                                "zones": 1,
                            },
                        }
                    ],
                }
            ),
            # Written by hand: the sensor in a template, the sequence entity as
            # the target, two positions, and a bucket sensor beside it.
            _automation(
                {
                    "actions": [
                        {
                            "action": "irrigation_unlimited.adjust_time",
                            "target": {"entity_id": iu_sequence},
                            "data": {
                                "actual": "{{ states('" + beds + "') | int }}",
                                "zones": [2, "3"],
                                "note": "{{ states('" + bucket + "') }}",
                            },
                        }
                    ]
                }
            ),
            # IU is gone, its entity with it: its name still says which zone.
            _automation(
                _zone_blueprint(beds, "binary_sensor.irrigation_unlimited_c2_z3")
            ),
            # The whole sequence at once: IU shares the time, no link.
            _automation(
                {
                    "action": {
                        "service": "irrigation_unlimited.adjust_time",
                        "data": {"entity_id": iu_controller, "sequence_id": 1},
                    },
                    "variables": {"duration": lawn},
                }
            ),
            # Two zones' sensors: which one feeds IU cannot be said.
            _automation({**_zone_blueprint(lawn, iu_zone), "description": beds}),
            # A sensor of another integration, and an automation without IU.
            _automation(_zone_blueprint("sensor.elsewhere", iu_zone)),
            _automation({"variables": {"duration": lawn}, "action": []}),
            SimpleNamespace(raw_config=None),
        ]
    )
    links = iu_import_ha.links_from_automations(hass)
    assert [
        (lk.si_zone_id, lk.iu_zone, lk.iu_sequence, lk.position) for lk in links
    ] == [
        (4, "c1_z1", None, None),
        (7, None, "c1_s2", 1),
        (7, None, "c2_s1", 2),
        (7, None, "c2_s1", 3),
        (7, "c2_z3", None, None),
    ]


def test_without_automations_there_are_no_links():
    hass = MagicMock()
    hass.data = {}
    assert iu_import_ha.links_from_automations(hass) == []


# --- the preview ---------------------------------------------------------------


def test_the_preview_creates_what_is_missing_and_switches_nothing_on():
    coordinator = FakeCoordinator()
    preview = iu_import_ha.plan(CONFIG, coordinator.store, [], None, "yaml")
    assert [(z["name"], z["action"]) for z in preview["zones"]] == [
        ("Lawn", "create"),
        ("Beds", "create"),
    ]
    assert [p["action"] for p in preview["programs"]] == ["create", "create"]
    assert not any(p["schedules_on"] for p in preview["programs"])
    assert preview["programs"][0]["zone_names"] == [["Lawn"], ["Beds"]]
    assert [s["action"] for s in preview["supplies"]] == ["create"]
    assert (
        preview["fingerprint"]
        == iu_import_ha.plan(CONFIG, coordinator.store, [], None, "yaml")["fingerprint"]
    )


def test_an_existing_zone_is_used_and_only_what_it_lacks_is_filled_in():
    coordinator = FakeCoordinator(
        [
            _zone(3, "Rasen", linked_entity="valve.lawn", supply_id="my_pump"),
            _zone(5, "beds"),
        ]
    )
    zones = {
        z["key"]: z
        for z in iu_import_ha.plan(CONFIG, coordinator.store, [], None)["zones"]
    }
    lawn, beds = zones["c1_z1"], zones["c1_z2"]
    assert (lawn["zone_id"], lawn["reason"], lawn["action"]) == (3, "valve", "use")
    assert (beds["zone_id"], beds["reason"], beds["action"]) == (5, "name", "update")
    assert beds["fields"] == {
        const.ZONE_LINKED_ENTITY: "valve.beds",
        const.ZONE_SUPPLY_ID: "iu_c1_supply",
    }
    report = iu_import_ha.plan(CONFIG, coordinator.store, [], None)["report"]
    assert any("keeps its own supply_id" in i["note"] for i in report["items"])


def test_a_zone_can_be_chosen_or_made_new():
    coordinator = FakeCoordinator([_zone(3, "Lawn"), _zone(5, "Other")])
    zones = iu_import_ha.plan(
        CONFIG, coordinator.store, [], {"c1_z1": "new", "c1_z2": 5}
    )["zones"]
    assert [(z["action"], z["zone_id"], z["reason"]) for z in zones] == [
        ("create", None, "chosen"),
        ("update", 5, "chosen"),
    ]
    with pytest.raises(iu_import_ha.IUImportError) as err:
        iu_import_ha.plan(CONFIG, coordinator.store, [], {"c1_z1": 9})
    assert err.value.code == "unknown_zone"


async def test_a_zone_smart_irrigation_calculates_cannot_be_made_new():
    coordinator = FakeCoordinator([_zone(3, "Lawn")])
    link = iu_import_ha.Link(si_zone_id=3, iu_sequence="c1_s1", position=1)
    preview = iu_import_ha.plan(CONFIG, coordinator.store, [link], {"c1_z1": "new"})
    assert preview["conflicts"] == [{"code": "calculated_needs_zone", "key": "c1_z1"}]
    # Shown, so that it can be chosen again; but not imported.
    with pytest.raises(iu_import_ha.IUImportError) as err:
        await iu_import_ha.async_apply(coordinator, preview)
    assert err.value.code == "conflicts"
    assert coordinator.programs() == {}


def test_a_blueprint_feeding_another_zone_than_the_match_is_reported():
    coordinator = FakeCoordinator(
        [_zone(3, "Lawn", linked_entity="valve.lawn"), _zone(4, "Spare")]
    )
    link = iu_import_ha.Link(si_zone_id=4, iu_zone="c1_z1")
    report = iu_import_ha.plan(CONFIG, coordinator.store, [link], None)["report"]
    assert any("feeds it from zone 4" in i["note"] for i in report["items"])
    # The same through a sequence's step (#950): the valve won, so the step is
    # calculated from zone 3, which the automation does not feed.
    link = iu_import_ha.Link(si_zone_id=4, iu_sequence="c1_s1", position=1)
    report = iu_import_ha.plan(CONFIG, coordinator.store, [link], None)["report"]
    [item] = [i for i in report["items"] if "feeds it from zone 4" in i["note"]]
    assert item["path"] == "c1_z1"


def test_a_program_or_supply_no_import_made_is_not_overwritten():
    coordinator = FakeCoordinator()
    coordinator.store.config = attr.evolve(
        coordinator.store.config,
        programs=[{"id": "main", "main": True}, {"id": "iu_c1_1", "name": "Mine"}],
        supplies=[{"id": "iu_c1_supply", "name": "My pump"}],
    )
    preview = iu_import_ha.plan(CONFIG, coordinator.store, [], None)
    assert preview["conflicts"] == [
        {"code": "program_exists", "id": "iu_c1_1", "name": "Mine"},
        {"code": "supply_exists", "id": "iu_c1_supply", "name": "My pump"},
    ]


def test_a_zone_off_in_iu_matched_to_an_own_zone_is_left_out_of_the_programs():
    config = copy.deepcopy(CONFIG)
    config["controllers"][0]["zones"][1]["enabled"] = False
    coordinator = FakeCoordinator(
        [
            _zone(0, "Lawn", linked_entity="valve.lawn"),
            _zone(1, "Beds", linked_entity="valve.beds"),
        ]
    )
    preview = iu_import_ha.plan(config, coordinator.store, [], None)
    programs = {p["program"]["id"]: p["program"] for p in preview["programs"]}
    morning = programs["iu_c1_1"]["steps"]
    assert [s["zones"] for s in morning] == [["c1_z1"], ["c1_z2"]]
    assert [s["enabled"] for s in morning] == [True, False]
    # A program that waters only that zone is off as a whole.
    assert programs["iu_c1_2"]["enabled"] is False
    # Our zone keeps its state.
    beds = next(z for z in preview["zones"] if z["key"] == "c1_z2")
    assert "state" not in beds["fields"]
    assert any("switched off in IU" in i["note"] for i in preview["report"]["items"])


def test_a_zone_off_in_iu_and_created_is_created_off():
    config = copy.deepcopy(CONFIG)
    config["controllers"][0]["zones"][1]["enabled"] = False
    preview = iu_import_ha.plan(config, FakeCoordinator().store, [], None)
    beds = next(z for z in preview["zones"] if z["key"] == "c1_z2")
    assert beds["fields"][const.ZONE_STATE] == const.ZONE_STATE_DISABLED


def test_the_lead_time_of_an_own_zone_is_reported_for_fixed_steps():
    coordinator = FakeCoordinator(
        [_zone(0, "Lawn", linked_entity="valve.lawn", lead_time=20.0)]
    )
    preview = iu_import_ha.plan(CONFIG, coordinator.store, [], None)
    notes = [i["note"] for i in preview["report"]["items"]]
    assert any("lead time of 20 s" in n for n in notes)
    # Calculated, the lead time is part of the zone's duration: nothing to say.
    link = iu_import_ha.Link(si_zone_id=0, iu_sequence="c1_s1", position=1)
    preview = iu_import_ha.plan(CONFIG, coordinator.store, [link], None)
    assert not any("lead time" in i["note"] for i in preview["report"]["items"])


def test_with_the_full_controller_off_the_preview_says_so():
    coordinator = FakeCoordinator(full_controller=False)
    report = iu_import_ha.plan(CONFIG, coordinator.store, [], None)["report"]
    assert any("full controller is off" in i["note"] for i in report["items"])


# --- doing it ------------------------------------------------------------------


async def test_the_first_import_creates_everything_switched_off():
    coordinator = FakeCoordinator([_zone(0, "Front")])
    _, result = await _import(coordinator)
    assert result["zones_created"] == [1, 2]
    zones = coordinator.store.zones
    assert zones[1].name == "Lawn" and zones[1].linked_entity == "valve.lawn"
    assert zones[2].supply_id == "iu_c1_supply"
    assert zones[2].state == const.ZONE_STATE_MANUAL
    programs = coordinator.programs()
    assert set(programs) == {"iu_c1_1", "iu_c1_2"}
    assert [s["zones"] for s in programs["iu_c1_1"]["steps"]] == [[1], [2]]
    assert [s["seconds"] for s in programs["iu_c1_1"]["steps"]] == [600, 300]
    assert all(s["enabled"] is False for p in programs.values() for s in p["schedules"])
    assert "source" not in programs["iu_c1_1"]
    # The main program stays first.
    assert coordinator.store.config.programs[0]["id"] == "main"
    assert [s["id"] for s in coordinator.store.config.supplies] == ["iu_c1_supply"]
    record = coordinator.store.config.iu_import
    assert record["zones"] == {
        "c1_z1": {
            "zone": 1,
            "valve": "valve.lawn",
            "name": "Lawn",
            "si_valve": "valve.lawn",
            "si_name": "Lawn",
        },
        "c1_z2": {
            "zone": 2,
            "valve": "valve.beds",
            "name": "Beds",
            "si_valve": "valve.beds",
            "si_name": "Beds",
        },
    }
    assert record["programs"] == ["iu_c1_1", "iu_c1_2"]
    assert record["supplies"] == ["iu_c1_supply"]
    assert record["source"] == "yaml" and record["at"]


async def test_a_second_import_updates_what_the_first_made():
    coordinator = FakeCoordinator()
    await _import(coordinator)
    # The user switched the morning on, and renamed a zone.
    config = coordinator.store.config
    programs = copy.deepcopy(config.programs)
    for program in programs:
        if program["id"] == "iu_c1_1":
            for schedule in program["schedules"]:
                schedule["enabled"] = True
    await coordinator.async_update_config({const.CONF_PROGRAMS: programs})
    coordinator.store.zones[0] = attr.evolve(coordinator.store.zones[0], name="Rasen")

    changed = copy.deepcopy(CONFIG)
    sequences = changed["controllers"][0]["sequences"]
    sequences[0]["zones"][0]["duration"] = "00:12"
    del sequences[1]
    preview, result = await _import(coordinator, changed)

    assert [(z["action"], z["reason"]) for z in preview["zones"]] == [
        ("use", "imported"),
        ("use", "imported"),
    ]
    assert result["zones_created"] == []
    assert len(coordinator.store.zones) == 2
    programs = coordinator.programs()
    assert set(programs) == {"iu_c1_1"}
    assert result["programs_removed"] == ["iu_c1_2"]
    assert preview["removed_names"]["programs"] == ["Evening"]
    assert programs["iu_c1_1"]["steps"][0]["seconds"] == 720
    # Switched on, it stays on.
    assert all(s["enabled"] for s in programs["iu_c1_1"]["schedules"])
    assert coordinator.store.config.iu_import["programs"] == ["iu_c1_1"]


async def test_a_zone_iu_no_longer_has_is_left_and_listed():
    coordinator = FakeCoordinator()
    await _import(coordinator)
    smaller = copy.deepcopy(CONFIG)
    controller = smaller["controllers"][0]
    controller["zones"] = controller["zones"][:1]
    controller["sequences"] = [
        {
            "name": "Morning",
            "schedules": [{"time": "06:05"}],
            "zones": [{"zone_id": "lawn", "duration": "00:10"}],
        }
    ]
    preview, _ = await _import(coordinator, smaller)
    assert preview["zones_left"] == [1]
    assert 1 in coordinator.store.zones
    # Its key stays recorded: imported again, it is the same zone.
    assert coordinator.store.config.iu_import["zones"]["c1_z2"]["zone"] == 1


async def test_a_recorded_zone_is_reused_only_while_both_are_the_same():
    coordinator = FakeCoordinator()
    await _import(coordinator)
    # Renamed in Smart Irrigation: still the zone the import made.
    coordinator.store.zones[0] = attr.evolve(coordinator.store.zones[0], name="Rasen")
    zones = iu_import_ha.plan(CONFIG, coordinator.store, [], None)["zones"]
    assert (zones[0]["zone_id"], zones[0]["reason"]) == (0, "imported")
    # Another configuration: its first zone is another zone, whatever its number.
    other = {
        "controllers": [
            {"zones": [{"name": "Pot", "entity_id": "switch.pot"}], "sequences": []}
        ]
    }
    zones = iu_import_ha.plan(other, coordinator.store, [], None)["zones"]
    assert (zones[0]["action"], zones[0]["zone_id"]) == ("create", None)
    # A zone without a valve is recognised by its name.
    valveless = {"controllers": [{"zones": [{"name": "Pot"}], "sequences": []}]}
    await _import(coordinator, valveless)
    zones = iu_import_ha.plan(valveless, coordinator.store, [], None)["zones"]
    assert zones[0]["reason"] == "imported"
    renamed = {"controllers": [{"zones": [{"name": "Tub"}], "sequences": []}]}
    zones = iu_import_ha.plan(renamed, coordinator.store, [], None)["zones"]
    assert zones[0]["action"] == "create"


async def test_a_zone_id_given_again_is_not_the_zone_the_import_made():
    coordinator = FakeCoordinator()
    await _import(coordinator)
    # Beds (zone 1) deleted, and a greenhouse added, which gets its number.
    del coordinator.store.zones[1]
    await coordinator.async_update_zone_config(None, {"name": "Greenhouse"})
    assert coordinator.store.zones[1].name == "Greenhouse"
    zones = {
        z["key"]: z for z in iu_import_ha.plan(CONFIG, coordinator.store, [])["zones"]
    }
    assert zones["c1_z2"]["action"] == "create"
    assert zones["c1_z1"]["reason"] == "imported"


async def test_mixed_case_iu_ids_are_updated_not_doubled():
    config = copy.deepcopy(CONFIG)
    config["controllers"][0]["sequences"][0]["sequence_id"] = "Morning Run"
    config["controllers"][0]["zones"][1]["zone_id"] = "Beds"
    config["controllers"][0]["zones"][1]["schedules"] = [
        {"time": "12:00", "duration": "00:02"}
    ]
    config["controllers"][0]["sequences"][0]["zones"][1]["zone_id"] = "Beds"
    config["controllers"][0]["sequences"][1]["zones"][0]["zone_id"] = "Beds"
    coordinator = FakeCoordinator()
    await _import(coordinator, config)
    ids = sorted(coordinator.programs())
    assert "iu_c1_morning_run" in ids and "iu_c1_zone_beds" in ids
    again, result = await _import(coordinator, config)
    assert sorted(coordinator.programs()) == ids
    assert {p["action"] for p in again["programs"]} == {"update"}
    assert result["programs_removed"] == []


async def test_a_schedule_imported_again_keeps_its_id_and_last_run():
    coordinator = FakeCoordinator()
    await _import(coordinator)
    schedule_id = coordinator.programs()["iu_c1_1"]["schedules"][0]["id"]
    key = f"iu_c1_1:{schedule_id}"
    coordinator.store.config = attr.evolve(
        coordinator.store.config, program_last_runs={key: "2026-10-26T05:30:00"}
    )
    await _import(coordinator)
    assert coordinator.programs()["iu_c1_1"]["schedules"][0]["id"] == schedule_id
    assert coordinator.store.config.program_last_runs == {key: "2026-10-26T05:30:00"}


def test_a_blueprint_for_a_zone_that_is_gone_is_left_out():
    coordinator = FakeCoordinator([_zone(0, "Lawn", linked_entity="valve.lawn")])
    link = iu_import_ha.Link(si_zone_id=7, iu_sequence="c1_s1", position=1)
    preview = iu_import_ha.plan(CONFIG, coordinator.store, [link], None)
    assert preview["links"] == 0
    assert any(
        "does not exist any more" in i["note"] for i in preview["report"]["items"]
    )
    first = preview["programs"][0]["program"]["steps"][0]
    assert first["mode"] == "fixed"


def test_two_iu_zones_never_share_one_zone():
    two = {
        "controllers": [
            {"zones": [{"name": "Zone 1", "entity_id": "valve.front1"}]},
            {"zones": [{"name": "Zone 1", "entity_id": "valve.back1"}]},
        ]
    }
    coordinator = FakeCoordinator([_zone(0, "Zone 1")])
    preview = iu_import_ha.plan(two, coordinator.store, [], None)
    assert [(z["action"], z["zone_id"]) for z in preview["zones"]] == [
        ("update", 0),
        ("create", None),
    ]
    assert preview["conflicts"] == []
    # Chosen for the second, the zone is the second's; the first gets its own.
    zones = iu_import_ha.plan(two, coordinator.store, [], {"c2_z1": 0})["zones"]
    assert [(z["action"], z["zone_id"]) for z in zones] == [
        ("create", None),
        ("update", 0),
    ]
    preview = iu_import_ha.plan(two, coordinator.store, [], {"c1_z1": 0, "c2_z1": 0})
    assert preview["conflicts"] == [
        {"code": "zone_twice", "key": "c2_z1", "other": "c1_z1", "zone_id": 0}
    ]


def test_one_zone_feeding_two_iu_zones_is_a_conflict_to_resolve():
    """Two blueprints feed two IU zones from one zone: the preview still opens."""
    config = {
        "controllers": [
            {
                "zones": [
                    {"name": "Front", "entity_id": "valve.front"},
                    {"name": "Back", "entity_id": "valve.back"},
                ],
                "sequences": [
                    {
                        "name": "S",
                        "schedules": [{"time": "06:00"}],
                        "zones": [{"zone_id": 1}, {"zone_id": 2}],
                    }
                ],
            }
        ]
    }
    coordinator = FakeCoordinator(
        [_zone(0, "Lawn", linked_entity="valve.front"), _zone(1, "Spare")]
    )
    links = [
        iu_import_ha.Link(si_zone_id=0, iu_sequence="c1_s1", position=1),
        iu_import_ha.Link(si_zone_id=0, iu_sequence="c1_s1", position=2),
        iu_import_ha.Link(si_zone_id=0, iu_zone="c1_z2"),
    ]
    preview = iu_import_ha.plan(config, coordinator.store, links, None)
    assert preview["conflicts"] == [
        {"code": "zone_twice", "key": "c1_z2", "other": "c1_z1", "zone_id": 0}
    ]
    resolved = iu_import_ha.plan(config, coordinator.store, links, {"c1_z2": 1})
    assert resolved["conflicts"] == []


async def test_an_import_that_stops_part_way_leaves_no_zone_without_its_pump():
    coordinator = FakeCoordinator()
    real = coordinator.async_update_zone_config
    calls = []

    async def failing(zone_id, data):
        calls.append(zone_id)
        if len(calls) == 2:
            raise RuntimeError("disk full")
        await real(zone_id, data)

    coordinator.async_update_zone_config = failing
    with pytest.raises(RuntimeError):
        await _import(coordinator)
    # The pump is there, recorded as the import's; the zone made names it.
    assert [s["id"] for s in coordinator.store.config.supplies] == ["iu_c1_supply"]
    assert coordinator.store.config.iu_import == {"supplies": ["iu_c1_supply"]}
    assert coordinator.store.zones[0].supply_id == "iu_c1_supply"
    assert coordinator.programs() == {}
    # The next import updates the pump, finds the zone by its valve, goes through.
    coordinator.async_update_zone_config = real
    preview, result = await _import(coordinator)
    assert preview["conflicts"] == []
    assert [s["action"] for s in preview["supplies"]] == ["update"]
    assert preview["zones"][0]["reason"] == "valve"
    assert result["zones_created"] == [1]


async def test_a_supply_iu_no_longer_has_goes():
    coordinator = FakeCoordinator()
    await _import(coordinator)
    without = copy.deepcopy(CONFIG)
    del without["controllers"][0]["entity_id"]
    preview, result = await _import(coordinator, without)
    assert preview["removed"]["supplies"] == ["iu_c1_supply"]
    assert preview["removed_names"]["supplies"] == ["Garden"]
    assert coordinator.store.config.supplies == []
    assert result["supplies"] == []


async def test_programs_of_the_user_are_kept_in_their_place():
    coordinator = FakeCoordinator()
    await coordinator.async_update_config(
        {
            const.CONF_PROGRAMS: [
                {"id": "main", "main": True},
                {"id": "mine", "name": "Mine", "steps": [{"zones": []}]},
            ]
        }
    )
    await _import(coordinator)
    assert [p["id"] for p in coordinator.store.config.programs] == [
        "main",
        "mine",
        "iu_c1_1",
        "iu_c1_2",
    ]


# --- the websocket commands --------------------------------------------------------


def _ws(coordinator):
    hass = MagicMock()
    hass.async_add_executor_job = _in_executor
    hass.data = {const.DOMAIN: {"coordinator": coordinator}}
    connection = MagicMock()
    return hass, connection


async def _call(handler, hass, connection, **msg):
    await inspect.unwrap(handler)(hass, connection, {"id": 1, **msg})


async def test_preview_then_apply_through_the_websocket():
    coordinator = FakeCoordinator()
    hass, connection = _ws(coordinator)
    sources = [{"id": "yaml", "title": "configuration.yaml"}]
    with (
        patch.object(
            iu_import_ha,
            "async_read_source",
            AsyncMock(return_value=("yaml", CONFIG, [])),
        ),
        patch.object(iu_import_ha, "async_sources", AsyncMock(return_value=sources)),
        patch.object(iu_import_ha, "links_from_automations", return_value=[]),
    ):
        await _call(websockets.websocket_iu_import_preview, hass, connection)
        preview = connection.send_result.call_args.args[1]
        # The sources come from their own command: the YAML is read once.
        assert "sources" not in preview
        assert coordinator.programs() == {}

        await _call(
            websockets.websocket_iu_import_apply,
            hass,
            connection,
            fingerprint="not it",
        )
        assert connection.send_error.call_args.args[1] == "changed"
        assert coordinator.programs() == {}

        await _call(
            websockets.websocket_iu_import_apply,
            hass,
            connection,
            fingerprint=preview["fingerprint"],
        )
        assert set(connection.send_result.call_args.args[1]["programs"]) == {
            "iu_c1_1",
            "iu_c1_2",
        }
        assert set(coordinator.programs()) == {"iu_c1_1", "iu_c1_2"}


async def test_the_sources_are_listed_on_their_own():
    hass, connection = _ws(FakeCoordinator())
    sources = [{"id": "yaml", "title": "configuration.yaml"}]
    with patch.object(iu_import_ha, "async_sources", AsyncMock(return_value=sources)):
        await _call(websockets.websocket_iu_import_sources, hass, connection)
    assert connection.send_result.call_args.args[1] == {"sources": sources}


async def test_an_import_error_reaches_the_panel_with_its_code():
    hass, connection = _ws(FakeCoordinator())
    with patch.object(
        iu_import_ha,
        "async_read_source",
        AsyncMock(side_effect=iu_import_ha.IUImportError("no_source", "none")),
    ):
        await _call(websockets.websocket_iu_import_preview, hass, connection)
    assert connection.send_error.call_args.args[1:] == ("no_source", "none")


@pytest.mark.parametrize(
    ("matches", "ok"),
    [
        ({"c1_z1": "new", "c1_z2": 3, "c1_z3": "0"}, True),
        ({"c1_z1": 2.9}, False),
        ({"c1_z1": -1}, False),
        ({"c1_z1": "x"}, False),
    ],
)
def test_the_matches_take_zone_ids_or_new(matches, ok):
    import voluptuous as vol

    if ok:
        assert websockets.IU_IMPORT_MATCHES(matches)["c1_z3"] == 0
    else:
        with pytest.raises(vol.Invalid):
            websockets.IU_IMPORT_MATCHES(matches)


@pytest.mark.filterwarnings("ignore:coroutine .* was never awaited:RuntimeWarning")
@pytest.mark.parametrize(
    "name",
    [
        "websocket_iu_import_sources",
        "websocket_iu_import_preview",
        "websocket_iu_import_apply",
        "websocket_iu_import_status",
        "websocket_iu_import_cutover",
    ],
)
def test_only_an_administrator_imports(name):
    connection = Mock()
    connection.user = Mock(is_admin=False)
    hass = Mock()
    hass.data = {const.DOMAIN: {}}
    with pytest.raises(Unauthorized):
        getattr(websockets, name)(hass, connection, {"id": 1})


# --- the cut-over -----------------------------------------------------------------


async def _iu_in(hass, enabled=(True,)):
    """IU's controllers in the registry and their states, and IU's services."""
    registry = er.async_get(hass)
    calls = []
    for n, on in enumerate(enabled, start=1):
        entity_id = registry.async_get_or_create(
            "binary_sensor", "irrigation_unlimited", f"c{n}_m"
        ).entity_id
        hass.states.async_set(entity_id, "off", {"enabled": on})

    async def record(call):
        calls.append((call.service, sorted(call.data["entity_id"])))
        for entity_id in call.data["entity_id"]:
            state = hass.states.get(entity_id)
            hass.states.async_set(
                entity_id, state.state, {"enabled": call.service == "enable"}
            )

    for service in ("enable", "disable"):
        hass.services.async_register("irrigation_unlimited", service, record)
    return calls


async def _imported(config=CONFIG):
    coordinator = FakeCoordinator()
    config = copy.deepcopy(config)
    # One schedule IU has off: it stays off at the cut-over.
    config["controllers"][0]["sequences"][0]["schedules"].append(
        {"time": "22:00", "enabled": False}
    )
    await _import(coordinator, config)
    return coordinator


def _schedules_on(coordinator):
    return {
        pid: [s["enabled"] for s in p["schedules"]]
        for pid, p in coordinator.programs().items()
    }


async def test_the_import_remembers_which_schedules_iu_had_on():
    coordinator = await _imported()
    record = coordinator.store.config.iu_import
    morning = coordinator.programs()["iu_c1_1"]["schedules"]
    assert record["iu_on"]["iu_c1_1"] == [morning[0]["id"]]
    assert _schedules_on(coordinator) == {
        "iu_c1_1": [False, False],
        "iu_c1_2": [False],
    }


async def test_switching_over_turns_iu_off_and_its_schedules_on_here(hass):
    calls = await _iu_in(hass, (True, True))
    coordinator = await _imported()
    status = await iu_import_ha.async_status(hass, coordinator)
    assert status["imported"] and not status["switched_over"]
    assert status["schedules_on"] == 0
    assert [c["enabled"] for c in status["controllers"]] == [True, True]

    result = await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    controllers = [
        "binary_sensor.irrigation_unlimited_c1_m",
        "binary_sensor.irrigation_unlimited_c2_m",
    ]
    assert calls == [("disable", controllers)]
    assert result["controllers"] == controllers
    # IU's own off schedule stays off.
    assert _schedules_on(coordinator) == {
        "iu_c1_1": [True, False],
        "iu_c1_2": [True],
    }
    status = await iu_import_ha.async_status(hass, coordinator)
    assert status["switched_over"] and not status["both_on"]
    assert [c["enabled"] for c in status["controllers"]] == [False, False]

    # IU switched on again behind our back: both would water, and it is said.
    hass.states.async_set(controllers[0], "off", {"enabled": True})
    assert (await iu_import_ha.async_status(hass, coordinator))["both_on"]

    await iu_import_ha.async_cutover(hass, coordinator, "irrigation_unlimited")
    assert calls[-1] == ("enable", controllers)
    assert _schedules_on(coordinator) == {
        "iu_c1_1": [False, False],
        "iu_c1_2": [False],
    }
    assert "cutover" not in coordinator.store.config.iu_import


async def test_a_re_import_after_the_cut_over_keeps_it(hass):
    await _iu_in(hass)
    coordinator = await _imported()
    await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    config = copy.deepcopy(CONFIG)
    config["controllers"][0]["sequences"][0]["schedules"].append(
        {"time": "22:00", "enabled": False}
    )
    await _import(coordinator, config)
    assert coordinator.store.config.iu_import["cutover"]["controllers"]
    assert _schedules_on(coordinator)["iu_c1_1"] == [True, False]
    # A schedule switched off here stays off when imported again.
    programs = coordinator.programs()
    programs["iu_c1_2"]["schedules"][0]["enabled"] = False
    await coordinator.async_update_config({"programs": list(programs.values())})
    await _import(coordinator, config)
    assert _schedules_on(coordinator)["iu_c1_2"] == [False]


async def test_without_the_full_controller_nothing_is_switched(hass):
    calls = await _iu_in(hass)
    coordinator = await _imported()
    coordinator.store.config = attr.evolve(
        coordinator.store.config, full_controller=False
    )
    with pytest.raises(iu_import_ha.IUImportError) as err:
        await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    assert err.value.code == "full_controller_off"
    assert calls == []


async def test_without_an_import_there_is_nothing_to_switch(hass):
    with pytest.raises(iu_import_ha.IUImportError) as err:
        await iu_import_ha.async_cutover(hass, FakeCoordinator(), "smart_irrigation")
    assert err.value.code == "not_imported"


async def test_with_iu_gone_the_schedules_still_come_on(hass):
    """IU uninstalled: there is nothing to switch off, the rest goes ahead."""
    coordinator = await _imported()
    result = await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    assert result["controllers"] == []
    assert _schedules_on(coordinator)["iu_c1_2"] == [True]
    assert not (await iu_import_ha.async_status(hass, coordinator))["iu_running"]


async def test_automations_and_scripts_that_still_use_iu_are_listed(hass):
    from homeassistant.components.automation import DATA_COMPONENT

    registry = er.async_get(hass)
    lawn = registry.async_get_or_create(
        "sensor", const.DOMAIN, "smart_irrigation_4_duration"
    ).entity_id
    iu_zone = registry.async_get_or_create(
        "binary_sensor", "irrigation_unlimited", "c1_z1"
    ).entity_id

    def entity(entity_id, key, config, name=None):
        return SimpleNamespace(
            entity_id=entity_id, unique_id=key, raw_config=config, name=name
        )

    hass.data[DATA_COMPONENT] = SimpleNamespace(
        entities=[
            entity("automation.feed", "1001", _zone_blueprint(lawn, iu_zone)),
            entity(
                "automation.notify",
                "1002",
                {
                    "trigger": [{"platform": "state", "entity_id": iu_zone}],
                    "action": [{"action": "notify.phone"}],
                },
                "Tell me when the lawn waters",
            ),
            entity("automation.lights", "1003", {"action": [{"action": "light.on"}]}),
        ]
    )
    hass.data["script"] = SimpleNamespace(
        entities=[
            entity(
                "script.water_now",
                "water_now",
                {"sequence": [{"service": "irrigation_unlimited.manual_run"}]},
            )
        ]
    )
    found = {f["entity_id"]: f for f in iu_import_ha.follow_ups(hass)}
    assert set(found) == {"automation.feed", "automation.notify", "script.water_now"}
    assert found["automation.feed"]["adjust_time"] is True
    assert found["automation.feed"]["edit"] == "/config/automation/edit/1001"
    assert found["automation.notify"]["uses"] == [iu_zone]
    assert found["automation.notify"]["name"] == "Tell me when the lawn waters"
    assert found["script.water_now"]["uses"] == ["irrigation_unlimited.manual_run"]
    assert found["script.water_now"]["edit"] == "/config/script/edit/water_now"


async def test_status_and_cut_over_through_the_websocket():
    coordinator = await _imported()
    hass, connection = _ws(coordinator)
    with (
        patch.object(
            iu_import_ha, "async_status", AsyncMock(return_value={"imported": True})
        ),
        patch.object(
            iu_import_ha,
            "async_cutover",
            AsyncMock(
                side_effect=iu_import_ha.IUImportError("full_controller_off", "x")
            ),
        ),
    ):
        await _call(websockets.websocket_iu_import_status, hass, connection)
        assert connection.send_result.call_args.args[1] == {"imported": True}
        await _call(
            websockets.websocket_iu_import_cutover,
            hass,
            connection,
            to="smart_irrigation",
        )
        assert connection.send_error.call_args.args[1] == "full_controller_off"


# --- the cut-over: what the review of the first draft found -------------------


async def test_only_the_controllers_iu_had_on_are_switched_and_back(hass):
    """A controller the user had off stays off, at the switch and on the way
    back."""
    calls = await _iu_in(hass, (True, False))
    coordinator = await _imported()
    await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    await iu_import_ha.async_cutover(hass, coordinator, "irrigation_unlimited")
    c1 = ["binary_sensor.irrigation_unlimited_c1_m"]
    assert calls == [("disable", c1), ("enable", c1)]
    enabled = {c["entity_id"]: c["enabled"] for c in iu_import_ha.iu_controllers(hass)}
    assert enabled["binary_sensor.irrigation_unlimited_c2_m"] is False


async def test_going_back_without_a_switch_is_refused(hass):
    calls = await _iu_in(hass, (False,))
    coordinator = await _imported()
    with pytest.raises(iu_import_ha.IUImportError) as err:
        await iu_import_ha.async_cutover(hass, coordinator, "irrigation_unlimited")
    assert err.value.code == "not_switched"
    assert calls == []
    # A second "go back" is refused the same way.
    await _iu_in(hass, (True,))
    await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    await iu_import_ha.async_cutover(hass, coordinator, "irrigation_unlimited")
    with pytest.raises(iu_import_ha.IUImportError):
        await iu_import_ha.async_cutover(hass, coordinator, "irrigation_unlimited")


async def test_iu_failing_on_the_way_back_leaves_ours_on(hass):
    """The schedules come on again and the switch stays recorded: someone
    waters, and the status says who."""
    await _iu_in(hass, (True,))
    coordinator = await _imported()
    await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    on = _schedules_on(coordinator)

    async def broken(call):
        raise HomeAssistantError("IU says no")

    hass.services.async_register("irrigation_unlimited", "enable", broken)
    with pytest.raises(HomeAssistantError):
        await iu_import_ha.async_cutover(hass, coordinator, "irrigation_unlimited")
    assert _schedules_on(coordinator) == on
    status = await iu_import_ha.async_status(hass, coordinator)
    assert status["switched_over"] and status["waters"] == "smart_irrigation"


async def test_a_failed_save_switches_iu_on_again(hass):
    calls = await _iu_in(hass, (True,))
    coordinator = await _imported()
    save = coordinator.async_update_config

    async def failing(data):
        raise HomeAssistantError("disk full")

    coordinator.async_update_config = failing
    with pytest.raises(HomeAssistantError):
        await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    coordinator.async_update_config = save
    c1 = ["binary_sensor.irrigation_unlimited_c1_m"]
    assert calls == [("disable", c1), ("enable", c1)]
    status = await iu_import_ha.async_status(hass, coordinator)
    assert not status["switched_over"] and status["waters"] == "irrigation_unlimited"


async def test_who_waters_is_read_from_what_is_on(hass):
    """A schedule switched on by hand while IU waters: both, switch or not;
    everything off: nobody."""
    await _iu_in(hass, (True,))
    coordinator = await _imported()
    assert (await iu_import_ha.async_status(hass, coordinator))["waters"] == (
        "irrigation_unlimited"
    )
    programs = coordinator.programs()
    programs["iu_c1_2"]["schedules"][0]["enabled"] = True
    await coordinator.async_update_config({"programs": list(programs.values())})
    status = await iu_import_ha.async_status(hass, coordinator)
    assert status["waters"] == "both" and status["both_on"]
    assert not status["switched_over"]

    hass.states.async_set(
        "binary_sensor.irrigation_unlimited_c1_m", "off", {"enabled": False}
    )
    programs["iu_c1_2"]["schedules"][0]["enabled"] = False
    await coordinator.async_update_config({"programs": list(programs.values())})
    assert (await iu_import_ha.async_status(hass, coordinator))["waters"] == "none"


async def test_a_program_new_to_a_re_import_after_the_switch_waters(hass):
    await _iu_in(hass, (True,))
    coordinator = await _imported()
    await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    config = copy.deepcopy(CONFIG)
    config["controllers"][0]["sequences"].append(
        {
            "name": "Noon",
            "schedules": [{"time": "12:00"}],
            "zones": [{"zone_id": "lawn", "duration": "00:02"}],
        }
    )
    preview, _ = await _import(coordinator, config)
    assert all(p["schedules_on"] for p in preview["programs"])
    noon = next(
        p["program"]["id"]
        for p in preview["programs"]
        if p["program"]["name"] == "Noon"
    )
    assert _schedules_on(coordinator)[noon] == [True]


async def test_the_users_own_schedules_are_kept_across_switches(hass):
    """Switching IU off again leaves the schedules alone; going back and over
    again brings back the ones that were on, not IU's."""
    await _iu_in(hass, (True,))
    coordinator = await _imported()
    await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    programs = coordinator.programs()
    programs["iu_c1_1"]["schedules"][0]["enabled"] = False
    programs["iu_c1_1"]["schedules"][1]["enabled"] = True
    await coordinator.async_update_config({"programs": list(programs.values())})
    mine = _schedules_on(coordinator)

    hass.states.async_set(
        "binary_sensor.irrigation_unlimited_c1_m", "off", {"enabled": True}
    )
    await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    assert _schedules_on(coordinator) == mine

    await iu_import_ha.async_cutover(hass, coordinator, "irrigation_unlimited")
    assert not any(any(on) for on in _schedules_on(coordinator).values())
    await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    assert _schedules_on(coordinator) == mine


async def test_what_iu_has_off_while_running_stays_off(hass):
    """A sequence IU runs switched off (its disable service) is not watered by
    its program after the switch either."""
    await _iu_in(hass, (True,))
    evening = (
        er.async_get(hass)
        .async_get_or_create("binary_sensor", "irrigation_unlimited", "c1_s2")
        .entity_id
    )
    hass.states.async_set(evening, "off", {"enabled": False})
    coordinator = await _imported()
    result = await iu_import_ha.async_cutover(hass, coordinator, "smart_irrigation")
    assert result["left_off"] == ["iu_c1_2"]
    assert _schedules_on(coordinator) == {
        "iu_c1_1": [True, False],
        "iu_c1_2": [False],
    }


async def test_iu_events_and_whole_entity_ids_count_as_uses(hass):
    from homeassistant.components.automation import DATA_COMPONENT

    registry = er.async_get(hass)
    z1 = registry.async_get_or_create(
        "binary_sensor", "irrigation_unlimited", "c1_z1"
    ).entity_id
    registry.async_get_or_create("binary_sensor", "irrigation_unlimited", "c1_z10")
    hass.data[DATA_COMPONENT] = SimpleNamespace(
        entities=[
            SimpleNamespace(
                entity_id="automation.tell_me",
                unique_id="2001",
                name="Tell me",
                raw_config={
                    "trigger": [
                        {
                            "trigger": "event",
                            "event_type": "irrigation_unlimited_finish",
                        }
                    ],
                    "action": [{"action": "notify.phone"}],
                },
            ),
            SimpleNamespace(
                entity_id="automation.ten",
                unique_id="2002",
                name="Ten",
                raw_config={
                    "trigger": [{"trigger": "state", "entity_id": z1 + "0"}],
                },
            ),
        ]
    )
    found = {f["entity_id"]: f["uses"] for f in iu_import_ha.follow_ups(hass)}
    assert found["automation.tell_me"] == ["irrigation_unlimited_finish"]
    assert found["automation.ten"] == [z1 + "0"]
