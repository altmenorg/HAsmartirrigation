"""Import an Irrigation Unlimited configuration: the Home Assistant side.

``iu_import.py`` turns an IU configuration into supplies, zones and programs,
as plain data. This module finds that configuration in Home Assistant, finds the
adjust-time blueprint automations that already feed IU from Smart Irrigation,
says what an import would do (the preview) and does it (apply).

* **Where the configuration comes from.** The YAML Home Assistant loads, with
  packages, ``!include`` and ``!secret`` resolved; or IU's own dialogs (a config
  entry, whose options take precedence over its data, as IU reads them); or YAML
  pasted by the user. The YAML is read as written, not through IU's schema: the
  importer applies IU's defaults itself, and IU need not be installed any more.
* **Nothing is lost on a second import.** What an import created is recorded
  (``CONF_IU_IMPORT``). The next import updates those zones, supplies and
  programs in place, removes the programs and supplies IU no longer has, and
  leaves the zones alone: a zone may be watered by other programs too.
* **Nothing starts watering.** A program imported for the first time has its
  schedules switched off; switching IU off and these on is the cut-over, a step
  of its own. A program imported again keeps them on if it had any on.
* **An existing zone is used as it is.** Only what it lacks is filled in: its
  valve, supply, extra valves, confirmation and flow sensor. Its state and its
  calculation are not touched.
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
from datetime import UTC, datetime

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er

from . import const
from .iu_import import APPROXIMATED, DOMAIN_IU, NOT_CARRIED, Link, plan_import
from .programs import DURATION_CALCULATED, MAIN_PROGRAM_ID, _unique_id

_LOGGER = logging.getLogger(__name__)

SOURCE_YAML = "yaml"
SOURCE_PASTED = "pasted"
SOURCE_ENTRY = "entry:"

BLUEPRINT_SEQUENCE = "irrigation-unlimited-adjust-time-sequence.yaml"
BLUEPRINT_ZONE = "irrigation-unlimited-adjust-time-single-zone.yaml"

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


def parse_pasted(text: str) -> dict:
    """IU's configuration from pasted YAML, with or without its top-level key."""
    from homeassistant.util.yaml import parse_yaml

    try:
        parsed = parse_yaml(text)
    except HomeAssistantError as err:
        raise IUImportError(
            "yaml_invalid",
            f"The pasted YAML could not be read: {err}. "
            "!include and !secret cannot be used in pasted YAML.",
        ) from err
    if isinstance(parsed, dict) and isinstance(parsed.get(DOMAIN_IU), dict):
        return parsed[DOMAIN_IU]
    if isinstance(parsed, dict) and "controllers" in parsed:
        return parsed
    raise IUImportError(
        "yaml_not_iu",
        "The pasted YAML is not an Irrigation Unlimited configuration: it has "
        "neither irrigation_unlimited nor controllers.",
    )


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
) -> tuple[str, dict]:
    """The source chosen (the first there is when none is) and its configuration."""
    if source == SOURCE_PASTED or (source is None and text):
        if not text or not text.strip():
            raise IUImportError("yaml_missing", "Paste the YAML to import.")
        return SOURCE_PASTED, parse_pasted(text)
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
    if source == SOURCE_YAML:
        config = await _yaml_config(hass)
        if config is None:
            raise IUImportError(
                "no_source", "configuration.yaml has no irrigation_unlimited section."
            )
        return source, config
    if source.startswith(SOURCE_ENTRY):
        entry_id = source[len(SOURCE_ENTRY) :]
        for entry in _entries(hass):
            if entry.entry_id == entry_id:
                return source, _entry_config(entry)
    raise IUImportError("no_source", f"There is no configuration {source!r}.")


# --- the blueprints that already feed IU -------------------------------------


def _number(value) -> int | None:
    try:
        number = int(float(value))
    except (TypeError, ValueError):
        return None
    return number if number > 0 else None


def _zone_number(value) -> int | None:
    """A zone id: zones are numbered from 0."""
    try:
        number = int(value)
    except (TypeError, ValueError):
        return None
    return number if number >= 0 and str(number) == str(value).strip() else None


def _registry_unique_id(registry, entity_id, platform: str) -> str | None:
    if not isinstance(entity_id, str):
        return None
    entry = registry.async_get(entity_id)
    if entry is None or entry.platform != platform:
        return None
    return entry.unique_id


def _si_zone_id(registry, entity_id) -> int | None:
    """The zone of a Smart Irrigation duration sensor."""
    unique_id = _registry_unique_id(registry, entity_id, const.DOMAIN)
    prefix, suffix = const.DOMAIN + "_", "_duration"
    if not unique_id or not unique_id.startswith(prefix):
        return None
    if not unique_id.endswith(suffix):
        return None
    return _zone_number(unique_id[len(prefix) : -len(suffix)])


def _iu_key(registry, entity_id, kind: str) -> str | None:
    """IU's ``c1_z2`` (``kind`` "z") or ``c1`` (``kind`` "m") of one of its entities."""
    unique_id = _registry_unique_id(registry, entity_id, DOMAIN_IU)
    if unique_id is None and isinstance(entity_id, str):
        # IU names its entities after their unique ids; a registry without the
        # entity (IU removed) still leaves the name.
        prefix = "binary_sensor." + DOMAIN_IU + "_"
        if entity_id.startswith(prefix):
            unique_id = entity_id[len(prefix) :]
    if not unique_id:
        return None
    controller, _, rest = unique_id.partition("_")
    if not controller.startswith("c") or _number(controller[1:]) is None:
        return None
    if kind == "m":
        return controller if rest == "m" else None
    if rest.startswith("z") and _number(rest[1:]) is not None:
        return unique_id
    return None


def _blueprint_inputs(entity) -> tuple[str | None, dict]:
    """The blueprint an automation uses, by file name, and its inputs."""
    used = getattr(entity, "_blueprint_inputs", None)
    if not isinstance(used, dict):
        return None, {}
    use = used.get("use_blueprint")
    if not isinstance(use, dict):
        return None, {}
    path = str(use.get("path") or "")
    inputs = use.get("input")
    return path.rsplit("/", 1)[-1], inputs if isinstance(inputs, dict) else {}


def links_from_automations(hass: HomeAssistant) -> list:
    """The adjust-time automations made from Smart Irrigation's blueprints."""
    from homeassistant.components.automation import DATA_COMPONENT

    component = hass.data.get(DATA_COMPONENT)
    if component is None:
        return []
    registry = er.async_get(hass)
    links = []
    for entity in component.entities:
        name, inputs = _blueprint_inputs(entity)
        if name not in (BLUEPRINT_SEQUENCE, BLUEPRINT_ZONE):
            continue
        zone_id = _si_zone_id(registry, inputs.get("irrigation_zone"))
        if zone_id is None:
            continue
        if name == BLUEPRINT_ZONE:
            key = _iu_key(registry, inputs.get("unlimited_zone"), "z")
            if key:
                links.append(Link(si_zone_id=zone_id, iu_zone=key))
            continue
        controller = _iu_key(registry, inputs.get("unlimited_sequence"), "m")
        sequence = _number(inputs.get("unlimited_sequence_id"))
        position = _number(inputs.get("unlimited_zone_ref"))
        if controller and sequence and position:
            links.append(
                Link(
                    si_zone_id=zone_id,
                    iu_sequence=f"{controller}_s{sequence}",
                    position=position,
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
    zone_id = _zone_number(recorded.get("zone"))
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
    items = list(report["items"]) + extra
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
            elif _zone_number(chosen) in existing:
                zone_id, reason = _zone_number(chosen), "chosen"
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
    for link in links:
        zone = next((z for z in zones if z["key"] == link.iu_zone), None)
        if zone and zone["zone_id"] not in (None, link.si_zone_id):
            items.append(
                _item(
                    link.iu_zone,
                    APPROXIMATED,
                    f"a blueprint feeds it from zone {link.si_zone_id}, "
                    f"but it is matched to zone {zone['zone_id']}",
                    zone["name"],
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
    for program in raw["programs"]:
        program = {
            **program,
            const.PROGRAM_ID: _unique_id(
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
        on = before is not None and any(
            s.get(const.SCHEDULE_ENABLED) is not False
            for s in before.get(const.PROGRAM_SCHEDULES) or []
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
            for zone_id in [_zone_number(recorded.get("zone"))]
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

    The zones come first, one by one. The supplies, the programs and the record
    are then stored together, in one change: an import that stops part way has
    created zones, which the next one finds by their valves, and nothing else.
    """
    if preview.get("conflicts"):
        raise IUImportError(
            "conflicts",
            "Resolve what the preview marks first: "
            + ", ".join(c["code"] for c in preview["conflicts"]),
        )
    store = coordinator.store

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

    stored = [
        p
        for p in getattr(config, const.CONF_PROGRAMS, None) or []
        if isinstance(p, dict)
    ]
    stored_by_id = {p.get(const.PROGRAM_ID): p for p in stored}
    programs = []
    for entry in preview["programs"]:
        program = copy.deepcopy(entry["program"])
        program.pop("source", None)
        for step in program.get(const.PROGRAM_STEPS) or []:
            step[const.STEP_ZONES] = [
                zone_ids[key] for key in step.get(const.STEP_ZONES) or []
            ]
        schedules = program.get(const.PROGRAM_SCHEDULES) or []
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
    await coordinator.async_update_config(
        {
            const.CONF_SUPPLIES: supplies,
            const.CONF_PROGRAMS: merged,
            const.CONF_IU_IMPORT: new_record,
        }
    )
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
