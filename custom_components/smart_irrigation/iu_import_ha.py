"""Import an Irrigation Unlimited configuration: the Home Assistant side.

``iu_import.py`` turns an IU configuration into supplies, zones and programs,
as plain data. This module finds that configuration in Home Assistant, finds the
automations that already feed IU durations from Smart Irrigation, says what an
import would do (the preview) and does it (apply).

* **Where the configuration comes from.** The YAML Home Assistant loads, with
  packages, ``!include`` and ``!secret`` resolved; or IU's own dialogs (a config
  entry, whose options take precedence over its data, as IU reads them); or YAML
  pasted by the user. The YAML is read as written, not through IU's schema: the
  importer applies IU's defaults itself, and IU need not be installed any more.
* **Pasted YAML is the user's text.** It is read with a plain safe loader that
  follows no tag (``!include``, ``!secret``, ``!env_var`` stay the text written,
  and the report says so), it has a size limit, every configuration has a limit
  on its values with aliases expanded, and the planning runs in an executor.
* **Nothing is lost on a second import.** What an import created is recorded
  (``CONF_IU_IMPORT``). The next import updates those zones, supplies and
  programs in place, removes the programs and supplies IU no longer has, and
  leaves the zones alone: a zone may be watered by other programs too.
* **Nothing starts watering.** A program imported for the first time has its
  schedules switched off; switching IU off and these on is the cut-over, a step
  of its own. A program imported again keeps them on if it had any on.
* **An existing zone is used as it is.** Only what it lacks is filled in: its
  valve, supply, extra valves, confirmation and flow sensor. Its state and its
  calculation are not touched. An IU zone switched off is left out of the
  programs instead, and a lead time it has is reported for fixed steps.
* **What is applied is what was shown.** The preview carries a fingerprint of
  what it would do; apply works it out again and refuses when it differs, which
  happens when the configuration or the zones changed in between.
"""

from __future__ import annotations

import asyncio
import copy
import hashlib
import json
import logging
import math
import re
from datetime import UTC, datetime
from types import SimpleNamespace

import yaml
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er

from . import const
from .iu_import import (
    APPROXIMATED,
    DOMAIN_IU,
    NOT_CARRIED,
    Link,
    as_list,
    plan_import,
    whole_number,
)
from .programs import DURATION_CALCULATED, MAIN_PROGRAM_ID, unique_id

_LOGGER = logging.getLogger(__name__)

SOURCE_YAML = "yaml"
SOURCE_PASTED = "pasted"
SOURCE_ENTRY = "entry:"


# What an import fills in on an existing zone that lacks it.
FILLED_FIELDS = (
    const.ZONE_LINKED_ENTITY,
    const.ZONE_SUPPLY_ID,
    const.ZONE_EXTRA_ENTITIES,
    const.ZONE_CONFIRM_TIMEOUT,
    const.ZONE_OPEN_RESENDS,
    const.ZONE_FLOW_SENSOR,
)

NEW_ZONE = "new"

# In the record: IU's own schedules that were on, by program, and the cut-over.
IU_ON = "iu_on"
IU_SOURCE = "iu_source"
SI_ON = "si_on"
CUTOVER = "cutover"


class IUImportError(HomeAssistantError):
    """An import that cannot go ahead, with a code the panel can translate."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


# --- where the configuration comes from --------------------------------------


async def _yaml_config(hass: HomeAssistant) -> dict | None:
    """IU's section of the YAML Home Assistant loads, as written; None if none."""
    # imported here: config is heavy and only needed when importing
    from homeassistant import config as conf_util

    try:
        config = await conf_util.async_hass_config_yaml(hass)
    except HomeAssistantError as err:
        raise IUImportError(
            "yaml_unreadable", f"The configuration could not be read: {err}"
        ) from err
    section = config.get(DOMAIN_IU) if isinstance(config, dict) else None
    return section if isinstance(section, dict) else None


def _entries(hass: HomeAssistant) -> list:
    return list(hass.config_entries.async_entries(DOMAIN_IU))


def _entry_config(entry) -> dict:
    """What IU reads from its config entry: the options, else the data."""
    return dict(entry.options) if entry.options else dict(entry.data)


# Pasted YAML comes from the user: it is read with a plain safe loader, and a
# configuration far larger than any IU configuration is refused before the
# importer walks it on the event loop.
MAX_PASTED_BYTES = 256 * 1024
# Options, lists and values counted with aliases expanded: IU's largest test
# configuration has under 2,000. An alias bomb parses in no time but expands
# into millions.
MAX_NODES = 20_000


class _PastedLoader(yaml.SafeLoader):
    """A safe loader that reads ``!include``, ``!secret`` and any other tag as
    the plain text it is, so nothing outside the pasted text is ever read."""

    def __init__(self, stream) -> None:
        super().__init__(stream)
        self.tags_seen: list[str] = []


def _tag_as_text(loader: _PastedLoader, suffix: str, node) -> str:
    tag = f"!{suffix}"
    if tag not in loader.tags_seen:
        loader.tags_seen.append(tag)
    if isinstance(node, yaml.ScalarNode):
        return f"{tag} {loader.construct_scalar(node)}".strip()
    return tag


_PastedLoader.add_multi_constructor("!", _tag_as_text)


def check_size(config, limit: int = MAX_NODES) -> None:
    """Refuse a configuration of more than ``limit`` nodes, aliases expanded.

    Counting stops at the limit, so an alias bomb costs ``limit`` steps. A
    number that is infinite or not a number (``.inf``, ``.nan`` in YAML) is
    refused too: no duration, count or delay of IU can be one, and the
    conversions would fail on it further in.
    """
    left = limit
    stack = [config]
    while stack:
        node = stack.pop()
        left -= 1
        if left < 0:
            raise IUImportError(
                "too_big",
                f"The configuration has more than {limit} values: that is not an "
                "Irrigation Unlimited configuration.",
            )
        if isinstance(node, dict):
            stack.extend(node.values())
            left -= len(node)
        elif isinstance(node, list):
            stack.extend(node)
        elif isinstance(node, float) and not math.isfinite(node):
            raise IUImportError(
                "not_finite",
                "The configuration holds an infinite value or one that is not a "
                "number (.inf or .nan): Irrigation Unlimited has none.",
            )


def parse_pasted(text: str) -> tuple[dict, list]:
    """IU's configuration from pasted YAML, and the report items it brings.

    With or without its top-level key. Tags (``!include``, ``!secret``,
    ``!env_var``) are not followed: their values stay text, and the report says
    which were seen. Runs in an executor: it is the user's text.
    """
    if len(text.encode()) > MAX_PASTED_BYTES:
        raise IUImportError(
            "too_big",
            f"The pasted YAML is larger than {MAX_PASTED_BYTES // 1024} kB.",
        )
    loader = _PastedLoader(text)
    try:
        parsed = loader.get_single_data()
    except yaml.YAMLError as err:
        raise IUImportError(
            "yaml_invalid", f"The pasted YAML could not be read: {err}"
        ) from err
    finally:
        loader.dispose()
    if isinstance(parsed, dict) and isinstance(parsed.get(DOMAIN_IU), dict):
        parsed = parsed[DOMAIN_IU]
    elif not (isinstance(parsed, dict) and "controllers" in parsed):
        raise IUImportError(
            "yaml_not_iu",
            "The pasted YAML is not an Irrigation Unlimited configuration: it has "
            "neither irrigation_unlimited nor controllers.",
        )
    check_size(parsed)
    notes = []
    if loader.tags_seen:
        notes.append(
            _item(
                "",
                NOT_CARRIED,
                f"{', '.join(loader.tags_seen)} is not followed in pasted YAML: "
                "those values were read as the text written. Import from "
                "configuration.yaml to have them resolved",
            )
        )
    return parsed, notes


async def async_sources(hass: HomeAssistant) -> list:
    """The IU configurations there are to import, in the order they are offered."""
    sources = []
    try:
        if await _yaml_config(hass) is not None:
            sources.append({"id": SOURCE_YAML, "title": "configuration.yaml"})
    except IUImportError as err:
        sources.append(
            {"id": SOURCE_YAML, "title": "configuration.yaml", "error": str(err)}
        )
    for entry in _entries(hass):
        if _entry_config(entry).get("controllers"):
            sources.append(
                {"id": SOURCE_ENTRY + entry.entry_id, "title": entry.title or DOMAIN_IU}
            )
    return sources


async def async_read_source(
    hass: HomeAssistant, source: str | None, text: str | None = None
) -> tuple[str, dict, list]:
    """The source chosen (the first there is when none is), its configuration,
    and report items reading it brought."""
    if source == SOURCE_PASTED or (source is None and text):
        if not text or not text.strip():
            raise IUImportError("yaml_missing", "Paste the YAML to import.")
        config, notes = await hass.async_add_executor_job(parse_pasted, text)
        return SOURCE_PASTED, config, notes
    if source is None:
        usable = [s for s in await async_sources(hass) if "error" not in s]
        if not usable:
            raise IUImportError(
                "no_source",
                "No Irrigation Unlimited configuration was found. Paste its "
                "YAML. (Home Assistant leaves out a package for an integration "
                "that is not installed.)",
            )
        source = usable[0]["id"]
    config = None
    if source == SOURCE_YAML:
        config = await _yaml_config(hass)
        if config is None:
            raise IUImportError(
                "no_source", "configuration.yaml has no irrigation_unlimited section."
            )
    elif source.startswith(SOURCE_ENTRY):
        entry_id = source[len(SOURCE_ENTRY) :]
        for entry in _entries(hass):
            if entry.entry_id == entry_id:
                config = _entry_config(entry)
    if config is None:
        raise IUImportError("no_source", f"There is no configuration {source!r}.")
    check_size(config)
    return source, config, []


def _snapshot(store) -> SimpleNamespace:
    """The zones and the configuration as they are now, for a plan made off the
    event loop: the store itself goes on changing there."""
    return SimpleNamespace(
        zones={zone_id: dict(zone) for zone_id, zone in _zones_of(store).items()},
        config=copy.deepcopy(store.config),
    )


async def async_preview(
    hass: HomeAssistant,
    coordinator,
    source: str | None,
    text: str | None,
    matches: dict | None,
) -> dict:
    """Read the source and plan the import, the planning in an executor."""
    source, config, notes = await async_read_source(hass, source, text)
    links = links_from_automations(hass)
    snapshot = _snapshot(coordinator.store)
    return await hass.async_add_executor_job(
        plan, config, snapshot, links, matches, source, notes
    )


# --- the blueprints that already feed IU -------------------------------------


def _registry_unique_id(registry, entity_id, platform: str) -> str | None:
    if not isinstance(entity_id, str):
        return None
    entry = registry.async_get(entity_id)
    if entry is None or entry.platform != platform:
        return None
    return entry.unique_id


def _si_zone_id(registry, entity_id) -> int | None:
    """The zone of a Smart Irrigation duration sensor."""
    uid = _registry_unique_id(registry, entity_id, const.DOMAIN)
    prefix, suffix = const.DOMAIN + "_", "_duration"
    if not uid or not uid.startswith(prefix):
        return None
    if not uid.endswith(suffix):
        return None
    return whole_number(uid[len(prefix) : -len(suffix)])


def _iu_key(registry, entity_id, kind: str) -> str | None:
    """IU's ``c1_z2`` (``kind`` "z"), ``c1_s2`` ("s") or ``c1`` ("m") of one of
    its entities."""
    uid = _registry_unique_id(registry, entity_id, DOMAIN_IU)
    if uid is None and isinstance(entity_id, str):
        # IU names its entities after their unique ids; a registry without the
        # entity (IU removed) still leaves the name.
        prefix = "binary_sensor." + DOMAIN_IU + "_"
        if entity_id.startswith(prefix):
            uid = entity_id[len(prefix) :]
    if not uid:
        return None
    controller, _, rest = uid.partition("_")
    if not controller.startswith("c") or not whole_number(controller[1:]):
        return None
    if kind == "m":
        return controller if rest == "m" else None
    if rest.startswith(kind) and whole_number(rest[1:]):
        return uid
    return None


ADJUST_TIME = DOMAIN_IU + ".adjust_time"
_SENSOR_ID = re.compile(r"\bsensor\.[a-z0-9_]+")


def _strings(node):
    """Every text in an automation's configuration: templates, variables, data."""
    if isinstance(node, str):
        yield node
    elif isinstance(node, dict):
        for value in node.values():
            yield from _strings(value)
    elif isinstance(node, list):
        for value in node:
            yield from _strings(value)


def _adjust_time_calls(node):
    """The ``irrigation_unlimited.adjust_time`` actions anywhere in a config."""
    if isinstance(node, dict):
        if ADJUST_TIME in (node.get("action"), node.get("service")):
            yield node
        for value in node.values():
            yield from _adjust_time_calls(value)
    elif isinstance(node, list):
        for value in node:
            yield from _adjust_time_calls(value)


def _entity_ids(value) -> list:
    if isinstance(value, str):
        return [v.strip() for v in value.split(",") if v.strip()]
    if isinstance(value, list):
        return [v for v in value if isinstance(v, str)]
    return []


def links_from_automations(hass: HomeAssistant) -> list:
    """The automations that hand IU a duration Smart Irrigation calculated.

    Read from each automation's configuration as Home Assistant holds it (a
    blueprint's inputs substituted): an ``irrigation_unlimited.adjust_time``
    action, and exactly one Smart Irrigation duration sensor anywhere in the
    automation. That covers the adjust-time blueprints and automations
    written by hand alike. A whole sequence adjusted at once is no link: IU
    shares that time over its zones.
    """
    from homeassistant.components.automation import DATA_COMPONENT

    component = hass.data.get(DATA_COMPONENT)
    if component is None:
        return []
    registry = er.async_get(hass)
    links = []
    for entity in component.entities:
        config = getattr(entity, "raw_config", None)
        if not isinstance(config, dict):
            continue
        calls = list(_adjust_time_calls(config))
        if not calls:
            continue
        zones = {
            zone_id
            for text in _strings(config)
            for found in _SENSOR_ID.findall(text)
            for zone_id in [_si_zone_id(registry, found)]
            if zone_id is not None
        }
        if len(zones) != 1:
            continue
        zone_id = zones.pop()
        for call in calls:
            data = call.get("data") if isinstance(call.get("data"), dict) else {}
            target = call.get("target") if isinstance(call.get("target"), dict) else {}
            targets = _entity_ids(data.get("entity_id")) + _entity_ids(
                target.get("entity_id")
            )
            positions = [
                n
                for n in (
                    whole_number(p) for p in as_list(data.get("zones")) if p is not None
                )
                if n
            ]
            for entity_id in targets:
                if key := _iu_key(registry, entity_id, "z"):
                    links.append(Link(si_zone_id=zone_id, iu_zone=key))
                    continue
                sequence = _iu_key(registry, entity_id, "s")
                if sequence is None:
                    controller = _iu_key(registry, entity_id, "m")
                    number = whole_number(data.get("sequence_id"))
                    if controller and number:
                        sequence = f"{controller}_s{number}"
                for position in positions if sequence else []:
                    links.append(
                        Link(
                            si_zone_id=zone_id, iu_sequence=sequence, position=position
                        )
                    )
    return links


# --- what an import would do -------------------------------------------------


def _record(config) -> dict:
    record = getattr(config, const.CONF_IU_IMPORT, None)
    return record if isinstance(record, dict) else {}


def _zones_of(store) -> dict:
    """The zones there are, by id, as dicts."""
    zones = {}
    for zone in (store.zones or {}).values():
        data = zone if isinstance(zone, dict) else _as_dict(zone)
        if data.get(const.ZONE_ID) is not None:
            zones[int(data[const.ZONE_ID])] = data
    return zones


def _as_dict(zone) -> dict:
    import attr

    return attr.asdict(zone)


def _identity(planned: dict) -> dict:
    """What says that an IU zone is the one an earlier import saw."""
    return {
        "valve": planned["zone"].get(const.ZONE_LINKED_ENTITY),
        "name": planned["name"],
    }


def _recorded_zone(recorded, planned: dict, existing: dict) -> int | None:
    """The zone an earlier import made of this IU zone, if both are still those.

    IU numbers its zones by position, so ``c1_z2`` of another configuration, or
    of one whose zones were reordered, is another zone: it is the same one when
    its valve is, or, without a valve, its name. A zone id is given again after
    a zone is deleted, so the zone too has to be the one the import left: the
    same valve, or without one the same name.
    """
    if not isinstance(recorded, dict):
        return None
    now = _identity(planned)
    if now["valve"]:
        same = recorded.get("valve") == now["valve"]
    else:
        same = not recorded.get("valve") and recorded.get("name") == now["name"]
    zone_id = whole_number(recorded.get("zone"))
    zone = existing.get(zone_id)
    if not same or zone is None or "si_name" not in recorded:
        return None
    if recorded.get("si_valve"):
        same = zone.get(const.ZONE_LINKED_ENTITY) == recorded["si_valve"]
    else:
        same = not zone.get(const.ZONE_LINKED_ENTITY) and (
            zone.get(const.ZONE_NAME) == recorded["si_name"]
        )
    return zone_id if same else None


def _empty(value) -> bool:
    return value is None or value == "" or value == []


def _item(path: str, outcome: str, note: str, subject: str = "") -> dict:
    return {"path": path, "outcome": outcome, "note": note, "subject": subject}


def plan(
    iu_config: dict,
    store,
    links: list,
    matches: dict | None = None,
    source: str | None = None,
    notes: list | None = None,
) -> dict:
    """What importing ``iu_config`` into ``store`` would do, without doing it.

    ``matches`` overrides which zone an IU zone becomes: an existing zone id, or
    ``"new"`` for a zone of its own. What has to be resolved before the import
    can go ahead (two IU zones on one zone, a calculated zone made new, a
    program or pump of the same id that no import made) is listed in
    ``conflicts``; apply refuses while there are any.
    """
    config = store.config
    record = _record(config)
    existing = _zones_of(store)
    extra: list = []
    for link in links:
        if link.si_zone_id not in existing:
            extra.append(
                _item(
                    link.iu_zone or f"{link.iu_sequence}.{link.position}",
                    APPROXIMATED,
                    f"a blueprint automation feeds it from zone {link.si_zone_id}, "
                    "which does not exist any more: it is not taken as calculated",
                )
            )
    links = [link for link in links if link.si_zone_id in existing]
    raw = plan_import(
        iu_config,
        [
            {
                const.ZONE_ID: zone_id,
                const.ZONE_NAME: zone.get(const.ZONE_NAME),
                const.ZONE_LINKED_ENTITY: zone.get(const.ZONE_LINKED_ENTITY),
            }
            for zone_id, zone in existing.items()
        ],
        links,
    )
    report = raw["report"]
    items = list(notes or []) + list(report["items"]) + extra
    previous_zones = (
        record.get("zones") if isinstance(record.get("zones"), dict) else {}
    )
    matches = matches or {}
    calculated = _calculated_keys(raw["programs"])

    # Which zone each IU zone becomes. Chosen zones are taken first; a zone two
    # IU zones would share goes to the first, the other gets a zone of its own.
    wanted = {}
    for planned in raw["zones"]:
        key = planned["key"]
        zone_id, reason = planned["match"], planned["match_reason"]
        before = _recorded_zone(previous_zones.get(key), planned, existing)
        if before is not None:
            zone_id, reason = before, "imported"
        if key in matches:
            chosen = matches[key]
            if chosen == NEW_ZONE:
                zone_id, reason = None, "chosen"
            elif whole_number(chosen) in existing:
                zone_id, reason = whole_number(chosen), "chosen"
            else:
                raise IUImportError("unknown_zone", f"There is no zone {chosen!r}.")
        wanted[key] = (zone_id, reason)
    # What stops the import until a choice resolves it. It is shown with the
    # rest of the preview rather than refused, so that the zones can be chosen.
    conflicts: list = []
    taken: dict = {}
    for planned in sorted(raw["zones"], key=lambda z: wanted[z["key"]][1] != "chosen"):
        key = planned["key"]
        zone_id, reason = wanted[key]
        if zone_id is not None and zone_id in taken:
            first = taken[zone_id]
            if reason == "chosen" or key in calculated:
                conflicts.append(
                    {
                        "code": "zone_twice",
                        "key": key,
                        "other": first["key"],
                        "zone_id": zone_id,
                    }
                )
                wanted[key] = (zone_id, reason)
                continue
            items.append(
                _item(
                    key,
                    APPROXIMATED,
                    f"zone {zone_id} is already {first['name']!r}'s: "
                    "it gets a zone of its own",
                    planned["name"],
                )
            )
            zone_id, reason = None, None
        if zone_id is None and key in calculated:
            conflicts.append({"code": "calculated_needs_zone", "key": key})
        if zone_id is not None:
            taken[zone_id] = planned
        wanted[key] = (zone_id, reason)

    zones = []
    for planned in raw["zones"]:
        key = planned["key"]
        zone_id, reason = wanted[key]
        fields = planned["zone"]
        if zone_id is None:
            zones.append(
                {
                    "key": key,
                    "name": planned["name"],
                    "action": "create",
                    "zone_id": None,
                    "reason": reason,
                    "fields": fields,
                    "identity": _identity(planned),
                }
            )
            continue
        current = existing[zone_id]
        fills = {
            field: fields[field]
            for field in FILLED_FIELDS
            if not _empty(fields.get(field)) and _empty(current.get(field))
        }
        kept = [
            field
            for field in FILLED_FIELDS
            if not _empty(fields.get(field))
            and not _empty(current.get(field))
            and current.get(field) != fields.get(field)
        ]
        if kept:
            items.append(
                _item(
                    key,
                    APPROXIMATED,
                    f"zone {current.get(const.ZONE_NAME)!r} keeps its own "
                    + ", ".join(kept),
                    planned["name"],
                )
            )
        zones.append(
            {
                "key": key,
                "name": planned["name"],
                "action": "update" if fills else "use",
                "zone_id": zone_id,
                "zone_name": current.get(const.ZONE_NAME),
                "reason": reason,
                "fields": fills,
                "identity": _identity(planned),
            }
        )
    # A calculated step takes the duration of the zone it waters. When an
    # automation fed IU from another zone (the valve matched first), the step
    # is calculated from a zone the automation did not feed: say so.
    by_key = {z["key"]: z for z in zones}
    for link in links:
        keys = [link.iu_zone] if link.iu_zone else _keys_at(raw["programs"], link)
        for key in keys:
            zone = by_key.get(key)
            if zone and zone["zone_id"] not in (None, link.si_zone_id):
                items.append(
                    _item(
                        key,
                        APPROXIMATED,
                        f"an automation feeds it from zone {link.si_zone_id}, "
                        f"but it is matched to zone {zone['zone_id']}: its "
                        "calculated duration is that zone's",
                        zone["name"],
                    )
                )

    # An IU zone switched off waters in none of IU's sequences. A new zone is
    # created switched off and the runner passes it by; one of the user's own
    # zones stays as it is, so the programs leave it out instead.
    planned_by_key = {p["key"]: p for p in raw["zones"]}
    off_in_iu = {
        z["key"]
        for z in zones
        if z["zone_id"] is not None
        and planned_by_key[z["key"]]["zone"].get(const.ZONE_STATE)
        == const.ZONE_STATE_DISABLED
    }
    for key in sorted(off_in_iu):
        zone = next(z for z in zones if z["key"] == key)
        items.append(
            _item(
                key,
                APPROXIMATED,
                f"switched off in IU and matched to {zone['zone_name']!r}, which "
                "stays as it is: the programs leave it out",
                zone["name"],
            )
        )
    raw_programs = [_without_zones(p, off_in_iu) for p in raw["programs"]]

    # A zone of the user's with a lead time has it added to every fixed run;
    # IU's durations are what the valve is open.
    for z in zones:
        lead = existing.get(z["zone_id"], {}).get(const.ZONE_LEAD_TIME)
        try:
            lead = float(lead or 0)
        except (TypeError, ValueError):
            lead = 0.0
        fixed = any(
            z["key"] in (step.get(const.STEP_ZONES) or [])
            and step.get(const.STEP_MODE) != DURATION_CALCULATED
            for program in raw_programs
            for step in program.get(const.PROGRAM_STEPS) or []
        )
        if lead > 0 and fixed:
            items.append(
                _item(
                    z["key"],
                    APPROXIMATED,
                    f"zone {z['zone_name']!r} has a lead time of {lead:g} s, which "
                    "Smart Irrigation adds to every fixed run: it waters that much "
                    "longer than in IU, unless the lead time is set to 0 or the "
                    "step shortened",
                    z["name"],
                )
            )

    names = {z["key"]: z.get("zone_name") or z["name"] for z in zones}
    previous_programs = set(record.get("programs") or [])
    stored_programs = {
        p.get(const.PROGRAM_ID): p
        for p in getattr(config, const.CONF_PROGRAMS, None) or []
        if isinstance(p, dict)
    }
    programs = []
    # The ids as the store keeps them: IU's own ids can carry capitals, spaces.
    used_ids = {MAIN_PROGRAM_ID}
    for program in raw_programs:
        program = {
            **program,
            const.PROGRAM_ID: unique_id(
                program[const.PROGRAM_ID], "iu_program", used_ids
            ),
        }
        before = stored_programs.get(program[const.PROGRAM_ID])
        if before is not None and program[const.PROGRAM_ID] not in previous_programs:
            conflicts.append(
                {
                    "code": "program_exists",
                    "id": program[const.PROGRAM_ID],
                    "name": before.get(const.PROGRAM_NAME) or "",
                }
            )
        # After the switch to Smart Irrigation IU no longer waters: a program
        # new to the import comes with IU's own on and off too.
        on = bool(record.get(CUTOVER)) or (
            before is not None
            and any(
                s.get(const.SCHEDULE_ENABLED) is not False
                for s in before.get(const.PROGRAM_SCHEDULES) or []
            )
        )
        programs.append(
            {
                "action": "update" if before is not None else "create",
                "schedules_on": on,
                "program": program,
                "zone_names": [
                    [names.get(key, key) for key in step.get(const.STEP_ZONES) or []]
                    for step in program.get(const.PROGRAM_STEPS) or []
                ],
            }
        )
    planned_ids = {p["program"][const.PROGRAM_ID] for p in programs}
    removed_programs = sorted(
        pid
        for pid in previous_programs
        if pid in stored_programs and pid not in planned_ids
    )

    previous_supplies = set(record.get("supplies") or [])
    stored_supplies = {
        s.get(const.SUPPLY_ID): s
        for s in getattr(config, const.CONF_SUPPLIES, None) or []
        if isinstance(s, dict)
    }
    supplies = []
    for supply in raw["supplies"]:
        sid = supply[const.SUPPLY_ID]
        if sid in stored_supplies and sid not in previous_supplies:
            conflicts.append(
                {
                    "code": "supply_exists",
                    "id": sid,
                    "name": stored_supplies[sid].get(const.SUPPLY_NAME) or "",
                }
            )
        supplies.append(
            {
                "action": "update" if sid in stored_supplies else "create",
                "supply": supply,
            }
        )
    planned_supplies = {s["supply"][const.SUPPLY_ID] for s in supplies}
    removed_supplies = sorted(
        sid
        for sid in previous_supplies
        if sid in stored_supplies and sid not in planned_supplies
    )
    used = {z["zone_id"] for z in zones}
    left = sorted(
        {
            zone_id
            for recorded in previous_zones.values()
            if isinstance(recorded, dict)
            for zone_id in [whole_number(recorded.get("zone"))]
            if zone_id in existing and zone_id not in used
        }
    )
    if not getattr(config, const.CONF_FULL_CONTROLLER, False):
        items.append(
            _item(
                "",
                NOT_CARRIED,
                "the full controller is off: the programs are imported, but they "
                "water only once it is on",
            )
        )

    result = {
        "source": source,
        "supplies": supplies,
        "zones": zones,
        "programs": programs,
        "removed": {"programs": removed_programs, "supplies": removed_supplies},
        "removed_names": {
            "programs": [
                stored_programs[pid].get(const.PROGRAM_NAME) or pid
                for pid in removed_programs
            ],
            "supplies": [
                stored_supplies[sid].get(const.SUPPLY_NAME) or sid
                for sid in removed_supplies
            ],
        },
        "conflicts": conflicts,
        "zones_left": left,
        "links": len(links),
        "previous": {k: record[k] for k in ("source", "at") if k in record},
        "report": {"items": items, "counts": report["counts"]},
    }
    result["fingerprint"] = fingerprint(result)
    return result


def _keys_at(programs: list, link: Link) -> list:
    """The IU zones of a sequence's step, by the step's position."""
    step_id = f"step_{link.position}"
    return sorted(
        {
            key
            for program in programs
            if program.get("source") == link.iu_sequence
            for step in program.get(const.PROGRAM_STEPS) or []
            if step.get(const.STEP_ID) == step_id
            or str(step.get(const.STEP_ID, "")).startswith(step_id + "_")
            for key in step.get(const.STEP_ZONES) or []
        }
    )


def _without_zones(program: dict, keys: set) -> dict:
    """The program without these IU zones; a step left with none is off."""
    if not keys:
        return program
    program = copy.deepcopy(program)
    steps = program.get(const.PROGRAM_STEPS) or []
    for step in steps:
        zones = step.get(const.STEP_ZONES) or []
        kept = [k for k in zones if k not in keys]
        if len(kept) != len(zones):
            if kept:
                step[const.STEP_ZONES] = kept
            else:
                step[const.STEP_ENABLED] = False
    if steps and all(step.get(const.STEP_ENABLED) is False for step in steps):
        program[const.PROGRAM_ENABLED] = False
    return program


def _calculated_keys(programs: list) -> set:
    return {
        key
        for program in programs
        for step in program.get(const.PROGRAM_STEPS) or []
        if step.get(const.STEP_MODE) == DURATION_CALCULATED
        for key in step.get(const.STEP_ZONES) or []
    }


def fingerprint(preview: dict) -> str:
    """What a preview would do, as a hash: the same plan, the same hash."""
    doing = {k: v for k, v in preview.items() if k not in ("fingerprint", "report")}
    text = json.dumps(doing, sort_keys=True, default=str)
    return hashlib.sha256(text.encode()).hexdigest()[:16]


# --- doing it -----------------------------------------------------------------


def import_lock(hass: HomeAssistant) -> asyncio.Lock:
    """One import at a time: a second click waits, then finds nothing to do."""
    data = hass.data.setdefault(const.DOMAIN, {})
    lock = data.get("iu_import_lock")
    if lock is None:
        lock = data["iu_import_lock"] = asyncio.Lock()
    return lock


async def async_apply(coordinator, preview: dict) -> dict:
    """Create and update what ``preview`` says, and record it.

    The supplies come first, recorded as the import's, so that the zones never
    name a supply that is not there. The zones follow, one by one; then the
    programs and the rest of the record, in one change. An import that stops
    part way has made supplies the next one updates and zones it finds by their
    valves, and no program.
    """
    if preview.get("conflicts"):
        raise IUImportError(
            "conflicts",
            "Resolve what the preview marks first: "
            + ", ".join(c["code"] for c in preview["conflicts"]),
        )
    store = coordinator.store
    config = store.config
    record = _record(config)

    gone_supplies = set(preview["removed"]["supplies"])
    planned_supplies = [s["supply"] for s in preview["supplies"]]
    supply_ids = {s[const.SUPPLY_ID] for s in planned_supplies}
    supplies = [
        s
        for s in getattr(config, const.CONF_SUPPLIES, None) or []
        if isinstance(s, dict)
        and s.get(const.SUPPLY_ID) not in gone_supplies
        and s.get(const.SUPPLY_ID) not in supply_ids
    ] + copy.deepcopy(planned_supplies)
    await coordinator.async_update_config(
        {
            const.CONF_SUPPLIES: supplies,
            const.CONF_IU_IMPORT: {**record, "supplies": sorted(supply_ids)},
        }
    )

    zone_ids: dict = {}
    created, updated = [], []
    for zone in preview["zones"]:
        if zone["action"] == "create":
            before = set(store.zones or {})
            await coordinator.async_update_zone_config(None, dict(zone["fields"]))
            new = sorted(set(store.zones or {}) - before)
            if not new:
                raise IUImportError(
                    "zone_not_created", f"Zone {zone['name']!r} was not created."
                )
            zone_ids[zone["key"]] = int(new[-1])
            created.append(int(new[-1]))
            continue
        zone_ids[zone["key"]] = int(zone["zone_id"])
        if zone["fields"]:
            await coordinator.async_update_zone_config(
                int(zone["zone_id"]), dict(zone["fields"])
            )
            updated.append(int(zone["zone_id"]))

    # Read again: the zones were saved in between.
    config = store.config
    record = _record(config)

    stored = [
        p
        for p in getattr(config, const.CONF_PROGRAMS, None) or []
        if isinstance(p, dict)
    ]
    stored_by_id = {p.get(const.PROGRAM_ID): p for p in stored}
    programs = []
    iu_on: dict = {}
    sources: dict = {}
    for entry in preview["programs"]:
        program = copy.deepcopy(entry["program"])
        source = program.pop("source", None)
        if isinstance(source, str):
            sources[program[const.PROGRAM_ID]] = source
        for step in program.get(const.PROGRAM_STEPS) or []:
            step[const.STEP_ZONES] = [
                zone_ids[key] for key in step.get(const.STEP_ZONES) or []
            ]
        schedules = program.get(const.PROGRAM_SCHEDULES) or []
        # Which schedules IU itself has on: those, and no others, are switched
        # on at the cut-over.
        iu_on[program[const.PROGRAM_ID]] = [
            n
            for n, schedule in enumerate(schedules)
            if schedule.get(const.SCHEDULE_ENABLED) is not False
        ]
        if not entry["schedules_on"]:
            for schedule in schedules:
                schedule[const.SCHEDULE_ENABLED] = False
        # A schedule imported again keeps its id, and with it when it ran last.
        before = stored_by_id.get(program[const.PROGRAM_ID]) or {}
        old_ids = [
            s.get(const.SCHEDULE_ID)
            for s in before.get(const.PROGRAM_SCHEDULES) or []
            if isinstance(s, dict) and s.get(const.SCHEDULE_ID)
        ]
        given = {
            s.get(const.SCHEDULE_ID) for s in schedules if s.get(const.SCHEDULE_ID)
        }
        free = [i for i in old_ids if i not in given]
        for schedule in schedules:
            if not schedule.get(const.SCHEDULE_ID) and free:
                schedule[const.SCHEDULE_ID] = free.pop(0)
        if record.get(CUTOVER):
            # Smart Irrigation waters: a schedule it had keeps the user's on
            # or off; a new one comes with IU's.
            was_on = {
                s.get(const.SCHEDULE_ID): s.get(const.SCHEDULE_ENABLED) is not False
                for s in before.get(const.PROGRAM_SCHEDULES) or []
                if isinstance(s, dict) and s.get(const.SCHEDULE_ID)
            }
            for schedule in schedules:
                if schedule.get(const.SCHEDULE_ID) in was_on:
                    schedule[const.SCHEDULE_ENABLED] = was_on[
                        schedule[const.SCHEDULE_ID]
                    ]
        programs.append(program)
    gone_programs = set(preview["removed"]["programs"])
    program_ids = {p[const.PROGRAM_ID] for p in programs}
    kept = [
        p
        for p in stored
        if p.get(const.PROGRAM_ID) not in gone_programs
        and p.get(const.PROGRAM_ID) not in program_ids
    ]
    # An imported program takes the place of the one it updates.
    position = {p.get(const.PROGRAM_ID): n for n, p in enumerate(stored)}
    merged = kept + programs
    merged.sort(
        key=lambda p: (
            p.get(const.PROGRAM_ID) != MAIN_PROGRAM_ID,
            position.get(p.get(const.PROGRAM_ID), len(stored)),
        )
    )

    previous_zones = (
        record.get("zones") if isinstance(record.get("zones"), dict) else {}
    )
    recorded_zones = {k: v for k, v in previous_zones.items() if isinstance(v, dict)}
    for zone in preview["zones"]:
        now = _zones_of(store).get(zone_ids[zone["key"]], {})
        recorded_zones[zone["key"]] = {
            "zone": zone_ids[zone["key"]],
            **zone["identity"],
            "si_valve": now.get(const.ZONE_LINKED_ENTITY),
            "si_name": now.get(const.ZONE_NAME),
        }
    new_record = {
        "zones": recorded_zones,
        "programs": sorted(program_ids),
        "supplies": sorted(supply_ids),
        "source": preview.get("source"),
        "at": datetime.now(UTC).isoformat(timespec="seconds"),
    }
    if record.get(CUTOVER):
        new_record[CUTOVER] = record[CUTOVER]
    new_record[IU_SOURCE] = sources
    await coordinator.async_update_config(
        {const.CONF_PROGRAMS: merged, const.CONF_IU_IMPORT: new_record}
    )
    # The schedules have their ids now: IU's own on and off, by id.
    saved = {
        p.get(const.PROGRAM_ID): p
        for p in getattr(store.config, const.CONF_PROGRAMS, None) or []
        if isinstance(p, dict)
    }
    new_record[IU_ON] = {
        program_id: [
            schedules[n].get(const.SCHEDULE_ID) for n in positions if n < len(schedules)
        ]
        for program_id, positions in iu_on.items()
        for schedules in [saved.get(program_id, {}).get(const.PROGRAM_SCHEDULES) or []]
    }
    await coordinator.async_update_config({const.CONF_IU_IMPORT: new_record})
    _LOGGER.info(
        "Irrigation Unlimited imported: %d zone(s) created, %d updated, "
        "%d program(s), %d supply(ies)",
        len(created),
        len(updated),
        len(programs),
        len(planned_supplies),
    )
    return {
        "zones_created": created,
        "zones_updated": updated,
        "programs": sorted(program_ids),
        "programs_removed": sorted(gone_programs),
        "supplies": sorted(supply_ids),
    }


# --- the cut-over -------------------------------------------------------------
#
# The import leaves IU watering and the imported schedules off. The switch to
# Smart Irrigation turns IU's controllers that are on, off
# (``irrigation_unlimited.disable``, which IU keeps across a restart), then the
# imported schedules on; switching back turns ours off, then on again the
# controllers the switch turned off, and no others. Either way, for a moment
# nothing waters rather than both, and a step that fails undoes the one before.

TO_SMART_IRRIGATION = "smart_irrigation"
TO_IRRIGATION_UNLIMITED = "irrigation_unlimited"

# Who waters, as the status says it.
WATERS_IU = "irrigation_unlimited"
WATERS_SI = "smart_irrigation"
WATERS_BOTH = "both"
WATERS_NONE = "none"

# The events IU fires (``irrigation_unlimited_<type>``): an automation that
# listens for them goes quiet once IU no longer waters.
_IU_EVENTS = re.compile(
    r"\birrigation_unlimited_(?:start|finish|incomplete|switch_error|sync_error"
    r"|valve_on|valve_off)\b"
)


def iu_controllers(hass: HomeAssistant) -> list:
    """IU's controllers: their entity, name, and whether IU has them on."""
    registry = er.async_get(hass)
    found = []
    for entry in registry.entities.values():
        if entry.platform != DOMAIN_IU:
            continue
        if not re.fullmatch(r"c\d+_m", str(entry.unique_id)):
            continue
        state = hass.states.get(entry.entity_id)
        enabled = state.attributes.get("enabled") if state is not None else None
        found.append(
            {
                "entity_id": entry.entity_id,
                "name": (state and state.name) or entry.name or entry.entity_id,
                "enabled": enabled if isinstance(enabled, bool) else None,
            }
        )
    return sorted(found, key=lambda c: c["entity_id"])


def _iu_switched_off(hass: HomeAssistant) -> set:
    """The unique ids of IU's controllers, sequences and zones it has off now.

    Its configuration may have them on while IU runs with them off (its
    ``disable`` service, which it keeps across a restart): IU does not water
    those, so neither should their programs after the switch.
    """
    registry = er.async_get(hass)
    off = set()
    for entry in registry.entities.values():
        if entry.platform != DOMAIN_IU:
            continue
        state = hass.states.get(entry.entity_id)
        if state is not None and state.attributes.get("enabled") is False:
            off.add(str(entry.unique_id))
    return off


def _off_in_iu(source, off: set) -> bool:
    """Whether IU has the sequence or zone a program came from off now, or
    its controller."""
    if not isinstance(source, str) or "_" not in source:
        return False
    return source in off or f"{source.split('_', 1)[0]}_m" in off


def _uses_iu(config, iu_entities: set) -> list:
    """The IU services, events and entities an automation or script names."""
    used = set()
    for text in _strings(config):
        used.update(re.findall(r"\birrigation_unlimited\.[a-z_]+", text))
        used.update(_IU_EVENTS.findall(text))
        for entity_id in iu_entities:
            # ``…_c1_z1`` is not named by ``…_c1_z10``.
            if re.search(re.escape(entity_id) + r"(?![\w])", text):
                used.add(entity_id)
    for call in _calls(config):
        service = call.get("action") or call.get("service")
        if isinstance(service, str) and service.startswith(DOMAIN_IU + "."):
            used.add(service)
    return sorted(used)


def _calls(node):
    if isinstance(node, dict):
        if "action" in node or "service" in node:
            yield node
        for value in node.values():
            yield from _calls(value)
    elif isinstance(node, list):
        for value in node:
            yield from _calls(value)


def follow_ups(hass: HomeAssistant) -> list:
    """The automations and scripts that still use IU, to change or remove.

    An adjust-time automation (it hands IU a duration Smart Irrigation
    calculated) has nothing left to do after the import: the steps are
    calculated here. Anything else that uses IU may need doing over.
    """
    from homeassistant.components.automation import DATA_COMPONENT

    registry = er.async_get(hass)
    iu_entities = {
        entry.entity_id
        for entry in registry.entities.values()
        if entry.platform == DOMAIN_IU
    }
    found = []
    for kind, component in (
        ("automation", hass.data.get(DATA_COMPONENT)),
        ("script", hass.data.get("script")),
    ):
        for entity in getattr(component, "entities", None) or []:
            config = getattr(entity, "raw_config", None)
            if not isinstance(config, dict):
                continue
            uses = _uses_iu(config, iu_entities)
            if not uses:
                continue
            key = getattr(entity, "unique_id", None)
            found.append(
                {
                    "kind": kind,
                    "entity_id": getattr(entity, "entity_id", None),
                    "name": getattr(entity, "name", None)
                    or config.get("alias")
                    or getattr(entity, "entity_id", None),
                    "edit": f"/config/{kind}/edit/{key}" if key else None,
                    "uses": uses,
                    "adjust_time": any(True for _ in _adjust_time_calls(config)),
                }
            )
    return found


def _imported_programs(config) -> dict:
    record = _record(config)
    ids = set(record.get("programs") or [])
    return {
        p.get(const.PROGRAM_ID): p
        for p in getattr(config, const.CONF_PROGRAMS, None) or []
        if isinstance(p, dict) and p.get(const.PROGRAM_ID) in ids
    }


def _zones_off_in_iu(hass: HomeAssistant, coordinator, record: dict, programs: dict):
    """The zones IU runs switched off that water in an imported sequence here.

    IU leaves a zone it has off out of its sequences; a step of the program
    imported from that sequence waters it. That is said, not changed: whether
    the zone should stay dry is the user's to decide (switch the step off).
    A zone program and a whole sequence IU has off are left off at the switch
    by themselves.
    """
    off = _iu_switched_off(hass)
    if not off:
        return []
    sources = record.get(IU_SOURCE) if isinstance(record.get(IU_SOURCE), dict) else {}
    recorded = record.get("zones") if isinstance(record.get("zones"), dict) else {}
    keys_of: dict = {}
    for key, entry in recorded.items():
        if isinstance(entry, dict) and entry.get("zone") is not None:
            keys_of.setdefault(entry["zone"], []).append(key)
    names = {
        zone_id: zone.get(const.ZONE_NAME)
        for zone_id, zone in _zones_of(coordinator.store).items()
    }
    found = []
    for program_id, program in programs.items():
        source = sources.get(program_id)
        if not isinstance(source, str) or "_s" not in source:
            continue
        if source in off:
            # The whole sequence is off: its program stays off at the switch.
            # (Its controller is not looked at: after the switch it is off by
            # the switch's own doing.)
            continue
        for step in program.get(const.PROGRAM_STEPS) or []:
            if not isinstance(step, dict) or step.get(const.STEP_ENABLED) is False:
                continue
            for zone_id in step.get(const.STEP_ZONES) or []:
                if any(key in off for key in keys_of.get(zone_id, [])):
                    entry = {
                        "zone": names.get(zone_id) or str(zone_id),
                        "program": program.get(const.PROGRAM_NAME) or program_id,
                    }
                    if entry not in found:
                        found.append(entry)
    return found


def _on(program: dict) -> list:
    """The ids of a program's schedules that are on."""
    return [
        s.get(const.SCHEDULE_ID)
        for s in program.get(const.PROGRAM_SCHEDULES) or []
        if isinstance(s, dict) and s.get(const.SCHEDULE_ENABLED) is not False
    ]


async def async_status(hass: HomeAssistant, coordinator) -> dict:
    """Where the move from IU stands: what was imported, who waters now.

    Who waters is read from what is on, not from the record of a switch: a
    schedule switched on by hand, or a controller IU switched on again, counts.
    """
    config = coordinator.store.config
    record = _record(config)
    programs = _imported_programs(config)
    controllers = iu_controllers(hass)
    full_controller = getattr(config, const.CONF_FULL_CONTROLLER, False) is True
    on = sum(len(_on(p)) for p in programs.values())
    si_waters = full_controller and any(
        _on(p) for p in programs.values() if p.get(const.PROGRAM_ENABLED, True)
    )
    iu_waters = any(c["enabled"] is True for c in controllers)
    if si_waters and iu_waters:
        waters = WATERS_BOTH
    elif si_waters:
        waters = WATERS_SI
    elif iu_waters:
        waters = WATERS_IU
    else:
        waters = WATERS_NONE
    return {
        "imported": bool(record.get("at")),
        "at": record.get("at"),
        "full_controller": full_controller,
        "programs": [
            {
                "id": pid,
                "name": p.get(const.PROGRAM_NAME) or pid,
                "schedules": len(p.get(const.PROGRAM_SCHEDULES) or []),
                "on": len(_on(p)),
            }
            for pid, p in programs.items()
        ],
        "schedules_on": on,
        "switched_over": bool(record.get(CUTOVER)),
        "switched_at": (record.get(CUTOVER) or {}).get("at"),
        "iu_running": hass.services.has_service(DOMAIN_IU, "disable"),
        "controllers": controllers,
        "waters": waters,
        "both_on": waters == WATERS_BOTH,
        "zones_off_in_iu": _zones_off_in_iu(hass, coordinator, record, programs),
        "follow_ups": follow_ups(hass),
    }


async def _switch_iu(hass: HomeAssistant, service: str, entity_ids: list) -> list:
    """Switch IU's controllers on or off; the ones switched."""
    if not entity_ids or not hass.services.has_service(DOMAIN_IU, service):
        return []
    await hass.services.async_call(
        DOMAIN_IU, service, {"entity_id": list(entity_ids)}, blocking=True
    )
    return list(entity_ids)


def _with_on(programs: list, wanted: dict) -> list:
    """The programs with, for each program in ``wanted``, the schedules listed
    there switched on (``None``: all of them); the others are left as they are,
    so one the user switched on stays on."""
    changed = copy.deepcopy(programs)
    for program in changed:
        program_id = program.get(const.PROGRAM_ID)
        if program_id not in wanted:
            continue
        ids = wanted[program_id]
        for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
            if ids is None or schedule.get(const.SCHEDULE_ID) in ids:
                schedule[const.SCHEDULE_ENABLED] = True
    return changed


def _all_off(programs: list, ids: set) -> list:
    """The programs with every schedule of those in ``ids`` off."""
    changed = copy.deepcopy(programs)
    for program in changed:
        if program.get(const.PROGRAM_ID) in ids:
            for schedule in program.get(const.PROGRAM_SCHEDULES) or []:
                schedule[const.SCHEDULE_ENABLED] = False
    return changed


async def _undo(what: str, step) -> None:
    """Undo a step after the next one failed; a failure here is logged."""
    try:
        await step
    except Exception:  # noqa: BLE001 - the first error is the one to report
        _LOGGER.exception("Could not undo %s after a failed switch", what)


async def async_cutover(hass: HomeAssistant, coordinator, to: str) -> dict:
    """Hand the watering to Smart Irrigation, or back to IU."""
    if to == TO_SMART_IRRIGATION:
        return await _to_smart_irrigation(hass, coordinator)
    if to == TO_IRRIGATION_UNLIMITED:
        return await _to_irrigation_unlimited(hass, coordinator)
    raise IUImportError("unknown_direction", f"Cannot switch to {to!r}.")


async def _to_smart_irrigation(hass: HomeAssistant, coordinator) -> dict:
    """IU's controllers that are on, off; then the schedules IU had on, on.

    Switched over already (IU switched a controller on again), only IU is
    switched off: the schedules are as the user has them.
    """
    store = coordinator.store
    record = _record(store.config)
    if not record.get("at"):
        raise IUImportError("not_imported", "Nothing has been imported yet.")
    if getattr(store.config, const.CONF_FULL_CONTROLLER, False) is not True:
        raise IUImportError(
            "full_controller_off",
            "Switch the full controller on first: without it, nothing waters.",
        )
    off_in_iu = _iu_switched_off(hass)
    on_now = [c["entity_id"] for c in iu_controllers(hass) if c["enabled"] is True]
    disabled = await _switch_iu(hass, "disable", on_now)

    # Read again: the programs may have changed while IU was being switched.
    config = store.config
    record = _record(config)
    programs = getattr(config, const.CONF_PROGRAMS, None) or []
    before = record.get(CUTOVER) if isinstance(record.get(CUTOVER), dict) else None
    left_off = []
    if before is None:
        iu_on = record.get(IU_ON) if isinstance(record.get(IU_ON), dict) else {}
        si_on = record.get(SI_ON) if isinstance(record.get(SI_ON), dict) else {}
        sources = (
            record.get(IU_SOURCE) if isinstance(record.get(IU_SOURCE), dict) else {}
        )
        wanted = {}
        for program_id in record.get("programs") or []:
            if program_id in si_on:
                # On as they were when the watering went back to IU.
                wanted[program_id] = si_on[program_id]
            elif _off_in_iu(sources.get(program_id), off_in_iu):
                left_off.append(program_id)
            else:
                # A program imported before IU's flags were kept: all on.
                wanted[program_id] = iu_on.get(program_id)
        programs = _with_on(programs, wanted)
    controllers = sorted(set((before or {}).get("controllers") or []) | set(disabled))
    cutover = {
        "at": (before or {}).get("at")
        or datetime.now(UTC).isoformat(timespec="seconds"),
        "controllers": controllers,
    }
    new_record = {k: v for k, v in record.items() if k != SI_ON}
    new_record[CUTOVER] = cutover
    try:
        await coordinator.async_update_config(
            {const.CONF_PROGRAMS: programs, const.CONF_IU_IMPORT: new_record}
        )
    except Exception:
        await _undo("IU's controllers", _switch_iu(hass, "enable", disabled))
        raise
    _LOGGER.info(
        "Watering handed over from Irrigation Unlimited: %d controller(s) "
        "switched off, the imported schedules on",
        len(disabled),
    )
    return {"controllers": disabled, "left_off": left_off}


async def _to_irrigation_unlimited(hass: HomeAssistant, coordinator) -> dict:
    """The imported schedules off; then on again the controllers the switch
    turned off. Which schedules were on is kept for the next switch."""
    store = coordinator.store
    config = store.config
    record = _record(config)
    cutover = record.get(CUTOVER) if isinstance(record.get(CUTOVER), dict) else None
    if cutover is None:
        raise IUImportError(
            "not_switched", "The watering has not been handed to Smart Irrigation."
        )
    back = [c for c in cutover.get("controllers") or [] if isinstance(c, str)]
    if back and not hass.services.has_service(DOMAIN_IU, "enable"):
        raise IUImportError(
            "iu_not_running",
            "Irrigation Unlimited is not running: it could not water again.",
        )
    programs = getattr(config, const.CONF_PROGRAMS, None) or []
    imported = _imported_programs(config)
    new_record = {k: v for k, v in record.items() if k != CUTOVER}
    new_record[SI_ON] = {pid: _on(p) for pid, p in imported.items()}
    await coordinator.async_update_config(
        {
            const.CONF_PROGRAMS: _all_off(programs, set(imported)),
            const.CONF_IU_IMPORT: new_record,
        }
    )
    try:
        enabled = await _switch_iu(hass, "enable", back)
    except Exception:
        await _undo(
            "the imported schedules",
            coordinator.async_update_config(
                {const.CONF_PROGRAMS: programs, const.CONF_IU_IMPORT: record}
            ),
        )
        raise
    _LOGGER.info(
        "Watering handed back to Irrigation Unlimited: the imported "
        "schedules off, %d controller(s) switched on",
        len(enabled),
    )
    return {"controllers": enabled}
