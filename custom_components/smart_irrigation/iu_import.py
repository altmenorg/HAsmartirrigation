"""Import an Irrigation Unlimited configuration into the full controller.

Irrigation Unlimited (IU) is configured in YAML, or through its own dialogs in
versions after 2025.12, which store the same structure. This module turns that
structure into what the full controller stores: supplies, zones, and programs
with their steps and schedules. It also writes a report, which says for each
IU option what became of it.

Everything here is plain data and pure functions, testable without Home
Assistant. Reading the configuration, finding the zones that already exist and
storing the result are left to the caller.

The rules:

* IU's own meaning is kept. ``all_zones_config`` is applied before a zone's own
  options. A zone is referred to by its number or its ``zone_id``. A sequence
  schedule with a ``duration`` scales the zones as IU does: the time left after
  the delays, shared in proportion to the zones' durations.
* Every option in IU's schema has a rule (``RULES``). An option is carried over,
  approximated (the report says how), not carried over, or has no effect on
  watering (display, logging, IU's own runtime). An option no rule knows is
  reported as unknown and never passed over in silence.
* A step takes IU's fixed duration, unless one of Smart Irrigation's
  adjust-time blueprints already fed that zone of that sequence from the
  calculation. That step is then calculated, as it effectively was.
* Sequences of different controllers run one after the other, because the full
  controller has one queue. The report says so for every configuration this
  affects.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass, field
from datetime import date, datetime, time, timedelta

from . import const
from .programs import (
    DURATION_CALCULATED,
    DURATION_FIXED,
    MAX_DELAY_SECONDS,
    MAX_OVERLAP_SECONDS,
    MAX_PASSES,
    MAX_STEP_SECONDS,
    MAX_TOURS,
)
from .schedules import (
    ANCHOR_END,
    ANCHOR_START,
    MAX_EVERY_N_DAYS,
    MAX_OFFSET_MINUTES,
    PARITY_EVEN,
    PARITY_ODD,
    SCHEDULE_TYPE_SUN,
    SCHEDULE_TYPE_TIME,
)

DOMAIN_IU = "irrigation_unlimited"

# What became of an option.
CARRIED = "carried"
APPROXIMATED = "approximated"
NOT_CARRIED = "not_carried"
NO_EFFECT = "no_effect"
TESTING = "testing"
UNKNOWN = "unknown"

# IU's default time step; durations it computes are rounded to it.
DEFAULT_GRANULARITY_SECONDS = 60

# IU's check_back when its delay or retries are not given.
IU_CHECK_BACK_DELAY = 30.0
IU_CHECK_BACK_RETRIES = 3

# A cron schedule is expanded into time schedules up to this many.
MAX_CRON_TIMES = 24

WEEKDAYS = {
    "mon": 0,
    "tue": 1,
    "wed": 2,
    "thu": 3,
    "fri": 4,
    "sat": 5,
    "sun": 6,
}
MONTHS = {
    name: number
    for number, name in enumerate(
        (
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec",
        ),
        start=1,
    )
}

# --- the rules -----------------------------------------------------------------

_C = "controllers."
_Z = _C + "zones."
_AZ = _C + "all_zones_config."
_S = _C + "sequences."
_SZ = _S + "zones."
_SCHEDULE_RULES = (
    ("time", CARRIED, "time of day, in minutes"),
    ("time.sun", CARRIED, "sun schedule"),
    ("time.before", CARRIED, "offset before the sun, in minutes"),
    ("time.after", CARRIED, "offset after the sun, in minutes"),
    ("time.cron", APPROXIMATED, "expanded into time schedules when it can be"),
    ("anchor", CARRIED, "starts at, or must be done by"),
    ("duration", CARRIED, "fixed durations of the steps"),
    ("name", NOT_CARRIED, "schedules have no name in Smart Irrigation"),
    ("schedule_id", CARRIED, "schedule id"),
    ("weekday", CARRIED, "days of the week"),
    ("month", CARRIED, "months"),
    ("day", CARRIED, "odd or even days, or days of the month"),
    ("day.every_n_days", CARRIED, "every N days"),
    ("day.start_n_days", CARRIED, "the day every N days counts from"),
    ("enabled", CARRIED, "schedule switched on or off"),
    ("from", CARRIED, "start of the period of the year"),
    ("until", CARRIED, "end of the period of the year"),
)
_ZONE_LIKE_RULES = (
    ("minimum", CARRIED, "the step's minimum, for every step with the zone"),
    ("maximum", CARRIED, "the step's maximum, for every step with the zone"),
    (
        "threshold",
        NOT_CARRIED,
        "no 'skip a run shorter than this'; the nearest is a step's minimum "
        "deficit, in mm",
    ),
    (
        "check_back",
        APPROXIMATED,
        "the zone's wait for the valve to confirm, and how often the open is "
        "sent again",
    ),
    (
        "volume",
        APPROXIMATED,
        "the zone's flow sensor; Smart Irrigation reads its unit, IU's scale "
        "factors are not used",
    ),
    (
        "duration",
        NOT_CARRIED,
        "IU's default for manual runs; water_zone takes a duration of its own",
    ),
    ("entity_states", NOT_CARRIED, "Smart Irrigation always sends on and off"),
    (
        "allow_manual",
        NO_EFFECT,
        "a disabled zone can always be watered by hand with water_zone",
    ),
    ("future_span", NO_EFFECT, ""),
    ("show", NO_EFFECT, ""),
    ("user", NO_EFFECT, "free attributes"),
)

RULES: tuple = (
    ("controllers", CARRIED, "supplies, zones and programs"),
    ("granularity", NO_EFFECT, "Smart Irrigation works in seconds"),
    ("refresh_interval", NO_EFFECT, ""),
    ("history_span", NO_EFFECT, ""),
    ("history_refresh", NO_EFFECT, ""),
    ("history", NO_EFFECT, ""),
    ("clock", NO_EFFECT, ""),
    ("sync_switches", NO_EFFECT, "a valve is checked while it is open"),
    ("rename_entities", NO_EFFECT, ""),
    ("restore_from_entity", NO_EFFECT, ""),
    ("extended_config", NO_EFFECT, ""),
    ("show_config", NO_EFFECT, ""),
    ("global_zone_ids", NO_EFFECT, "IU only checks that the ids are unique"),
    ("global_sequence_ids", NO_EFFECT, "IU only checks that the ids are unique"),
    ("testing", TESTING, "IU's test harness"),
    (_C + "name", CARRIED, "supply name"),
    (_C + "controller_id", CARRIED, "supply id"),
    (_C + "entity_id", CARRIED, "the supply's entities (pump or main valve)"),
    (_C + "preamble", CARRIED, "the supply's delay before (up to 1 h)"),
    (_C + "postamble", CARRIED, "the supply's delay after (up to 1 h)"),
    (_C + "enabled", CARRIED, "a disabled controller's programs are disabled"),
    (_C + "entity_states", NOT_CARRIED, "Smart Irrigation always sends on and off"),
    (
        _C + "check_back",
        NOT_CARRIED,
        "the confirmation of the master; a supply is not confirmed",
    ),
    (
        _C + "volume",
        NOT_CARRIED,
        "a meter on the master; Smart Irrigation reads a meter per zone",
    ),
    (_C + "queue_manual", NO_EFFECT, "manual runs queue by default"),
    (_C + "pause_next", NO_EFFECT, ""),
    (_C + "show_sequence_status", NO_EFFECT, ""),
    (_C + "user", NO_EFFECT, "free attributes"),
    (_C + "zones", CARRIED, "zones"),
    (_C + "sequences", CARRIED, "programs"),
    (_C + "all_zones_config", CARRIED, "applied to every zone before its own"),
    (_Z + "name", CARRIED, "zone name"),
    (_Z + "zone_id", CARRIED, "how a sequence refers to the zone"),
    (_Z + "entity_id", CARRIED, "the zone's valve, and further valves"),
    (_Z + "enabled", CARRIED, "zone disabled"),
    (_Z + "schedules", CARRIED, "a program with this zone as its one step"),
    *((_Z + key, rule, note) for key, rule, note in _ZONE_LIKE_RULES),
    *((_AZ + key, rule, note) for key, rule, note in _ZONE_LIKE_RULES),
    *((_Z + "schedules." + key, r, n) for key, r, n in _SCHEDULE_RULES),
    *((_S + "schedules." + key, r, n) for key, r, n in _SCHEDULE_RULES),
    (_S + "name", CARRIED, "program name"),
    (_S + "sequence_id", CARRIED, "program id"),
    (_S + "delay", CARRIED, "the program's wait between steps"),
    (_S + "duration", CARRIED, "the default duration of its steps"),
    (_S + "repeat", CARRIED, "how many times the program runs through"),
    (_S + "enabled", CARRIED, "program switched on or off"),
    (_S + "zones", CARRIED, "steps"),
    (_S + "schedules", CARRIED, "the program's schedules"),
    (_SZ + "zone_id", CARRIED, "the zones of the step, watered together"),
    (_SZ + "delay", CARRIED, "the wait after the step"),
    (_SZ + "duration", CARRIED, "the step's fixed duration"),
    (
        _SZ + "repeat",
        APPROXIMATED,
        "passes: each a full IU run, but the wait between them is the soak "
        "setting, not the step's delay",
    ),
    (_SZ + "enabled", CARRIED, "step switched on or off"),
    (
        _SZ + "volume",
        APPROXIMATED,
        "the step's maximum litres: a limit on a timed run, not 'until this " "volume'",
    ),
)

_RULE_BY_PATH = {path: (rule, note) for path, rule, note in RULES}


def classify(path: str) -> tuple[str | None, str, str]:
    """The rule for an option path such as ``controllers.zones.minimum``.

    List positions are left out of the path. The longest rule that is the path
    or a parent of it decides, so ``controllers.zones.user.area`` falls under
    the rule for ``user``. Returns ``(rule path, what became of it, note)``, or
    ``(None, UNKNOWN, "")`` for an option no rule knows.
    """
    if path in _RULE_BY_PATH:
        rule, note = _RULE_BY_PATH[path]
        return path, rule, note
    parts = path.split(".")
    for end in range(len(parts) - 1, 0, -1):
        candidate = ".".join(parts[:end])
        if candidate in _RULE_BY_PATH and parts[end - 1] in _VALUE_OPTIONS:
            rule, note = _RULE_BY_PATH[candidate]
            return candidate, rule, note
    return None, UNKNOWN, ""


# Options whose value may be a mapping of its own (a duration as
# ``{minutes: 10}``, free attributes, IU's test harness): what is under them
# is their value, not further options.
_VALUE_OPTIONS = {
    "duration",
    "delay",
    "preamble",
    "postamble",
    "minimum",
    "maximum",
    "threshold",
    "check_back",
    "volume",
    "user",
    "show",
    "testing",
    "clock",
    "history",
}


# --- reading IU's values ---------------------------------------------------------


def as_list(value) -> list:
    """IU's ``ensure_list``: nothing is no item, a single item is a list of one."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, tuple):
        return list(value)
    return [value]


_HMS = re.compile(r"^\s*(-)?(\d+):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?\s*$")


def seconds_of(value) -> float | None:
    """A duration in seconds, from any way IU accepts one; None if it is none.

    ``timedelta``, a number of seconds, ``"HH:MM"``, ``"HH:MM:SS"``, either with
    a leading minus, or ``{"hours": .., "minutes": .., "seconds": ..}``.
    """
    if value is None or isinstance(value, bool):
        return None
    if isinstance(value, timedelta):
        return value.total_seconds()
    if isinstance(value, (int, float)):
        return None if math.isnan(value) else float(value)
    if isinstance(value, dict):
        if not any(
            key in value
            for key in ("days", "hours", "minutes", "seconds", "milliseconds")
        ):
            return None
        try:
            return timedelta(
                **{
                    key: float(value[key])
                    for key in (
                        "days",
                        "hours",
                        "minutes",
                        "seconds",
                        "milliseconds",
                    )
                    if key in value
                }
            ).total_seconds()
        except (TypeError, ValueError):
            return None
    if isinstance(value, str):
        text = value.strip()
        match = _HMS.match(text)
        if match:
            sign = -1.0 if match.group(1) else 1.0
            total = (
                int(match.group(2)) * 3600
                + int(match.group(3)) * 60
                + float(match.group(4) or 0)
            )
            return sign * total
        try:
            return float(text)
        except ValueError:
            return None
    return None


def time_of_day(value) -> time | None:
    """A time of day from ``"06:05"``, ``"06:05:30"`` or a ``time``; else None."""
    if isinstance(value, time):
        return value
    if isinstance(value, datetime):
        return value.time()
    if not isinstance(value, str):
        return None
    match = re.match(r"^\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*$", value)
    if not match:
        return None
    hour, minute, second = (int(match.group(i) or 0) for i in (1, 2, 3))
    if hour > 23 or minute > 59 or second > 59:
        return None
    return time(hour, minute, second)


def month_day(value) -> str | None:
    """``"MM-DD"`` from IU's ``"16 Sep"`` or a date; None if it is neither."""
    if isinstance(value, datetime):
        value = value.date()
    if isinstance(value, date):
        return f"{value.month:02d}-{value.day:02d}"
    if not isinstance(value, str):
        return None
    match = re.match(r"^\s*(\d{1,2})\s+([A-Za-z]{3})", value)
    if not match:
        return None
    month = MONTHS.get(match.group(2).lower())
    day = int(match.group(1))
    if month is None:
        return None
    try:
        date(2024, month, day)
    except ValueError:
        return None
    return f"{month:02d}-{day:02d}"


def a_date(value) -> date | None:
    """A date from a ``date``, ``datetime`` or ``"YYYY-MM-DD"``; else None."""
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    if isinstance(value, str):
        try:
            return date.fromisoformat(value.strip()[:10])
        except ValueError:
            return None
    return None


def entities_of(value) -> list[str]:
    """Entity ids from a list or a comma-separated string, in order, once each."""
    found: list[str] = []
    for item in as_list(value):
        for part in str(item).split(","):
            entity_id = part.strip()
            if "." in entity_id and entity_id not in found:
                found.append(entity_id)
    return found


# --- the report -------------------------------------------------------------------


@dataclass
class Report:
    """What became of each option, and anything the mapping had to decide.

    Options carried over (or without effect on watering) are counted; what the
    user has to know about (approximated, not carried, unknown) is listed.
    """

    items: list = field(default_factory=list)
    counted: dict = field(default_factory=dict)

    def add(self, path: str, outcome: str, note: str, subject: str = "") -> None:
        """One option or decision, counted, and listed when it matters."""
        self.counted[outcome] = self.counted.get(outcome, 0) + 1
        if outcome in (APPROXIMATED, NOT_CARRIED, UNKNOWN):
            self.items.append(
                {"path": path, "outcome": outcome, "note": note, "subject": subject}
            )

    def counts(self) -> dict:
        """How many options or decisions ended up in each outcome."""
        return dict(self.counted)


def _walk(node, path: str, location: str):
    """Every option of a configuration: its rule path and where it stands."""
    if isinstance(node, dict):
        for key, value in node.items():
            key = str(key)
            rule_path = f"{path}.{key}" if path else key
            where = f"{location}.{key}" if location else key
            yield rule_path, where
            yield from _walk(value, rule_path, where)
    elif isinstance(node, list):
        for index, item in enumerate(node):
            yield from _walk(item, path, f"{location}[{index}]")


# Options whose children are the user's own (free attributes) or a value of
# their own shape: their keys are not options and are not walked into.
# Options the mapping reports itself, with what it decided.
_REPORTED_BY_THE_MAPPING = {
    _Z + "schedules.name",
    _S + "schedules.name",
    _Z + "schedules.time.cron",
    _S + "schedules.time.cron",
    _Z + "check_back",
    _AZ + "check_back",
}

_LEAVES = {
    "controllers.volume",
    "controllers.zones.volume",
    "controllers.all_zones_config.volume",
    "controllers.check_back",
    "controllers.zones.check_back",
    "controllers.all_zones_config.check_back",
    "controllers.user",
    "controllers.zones.user",
    "controllers.all_zones_config.user",
    "testing",
    "clock",
    "history",
    "controllers.zones.show",
    "controllers.all_zones_config.show",
}


def classify_options(config: dict, report: Report) -> None:
    """Put every option of the configuration in the report, by its rule.

    Options that are carried over are counted, not listed one by one: the
    report lists what the user has to know about.
    """
    for rule_path, where in _walk(config, "", ""):
        if any(rule_path.startswith(leaf + ".") for leaf in _LEAVES):
            continue
        rule, outcome, note = classify(rule_path)
        if outcome == UNKNOWN:
            report.add(where, UNKNOWN, "not an option Irrigation Unlimited knows")
        elif rule in _REPORTED_BY_THE_MAPPING:
            # The mapping says what it did with these, with the numbers.
            report.counted[outcome] = report.counted.get(outcome, 0) + 1
        elif outcome in (APPROXIMATED, NOT_CARRIED):
            report.add(where, outcome, note)
        else:
            report.add(where, outcome, "")


# --- the configuration, as IU reads it ------------------------------------------


@dataclass
class Schedule:
    """One IU schedule, of a zone or of a sequence."""

    where: str
    raw: dict
    duration: float | None


@dataclass
class Zone:
    """One IU zone with ``all_zones_config`` applied."""

    controller: int  # 1-based, as IU numbers them
    index: int  # 1-based
    zone_id: str
    name: str
    entities: list
    enabled: bool
    minimum: float | None
    maximum: float | None
    check_back: dict | None
    volume_entity: str | None
    schedules: list
    where: str

    @property
    def key(self) -> str:
        """IU's unique id of the zone, ``c1_z2``."""
        return f"c{self.controller}_z{self.index}"


@dataclass
class SequenceZone:
    """One step of an IU sequence."""

    zones: list  # Zone objects
    delay: float | None
    duration: float | None
    repeat: int
    enabled: bool
    volume: float | None
    position: int  # 1-based
    where: str


@dataclass
class Sequence:
    """One IU sequence."""

    controller: int
    index: int
    sequence_id: str
    name: str
    delay: float | None
    duration: float | None
    repeat: int
    enabled: bool
    steps: list
    schedules: list
    where: str

    @property
    def key(self) -> str:
        """IU's unique id of the sequence, ``c1_s2``."""
        return f"c{self.controller}_s{self.index}"


@dataclass
class Controller:
    """One IU controller."""

    index: int
    controller_id: str
    name: str
    entities: list
    preamble: float
    postamble: float
    enabled: bool
    zones: list
    sequences: list
    where: str


def _schedules(raw, where: str, granularity: float = 60) -> list:
    found = []
    for n, schedule in enumerate(as_list(raw)):
        if isinstance(schedule, dict):
            found.append(
                Schedule(
                    where=f"{where}.schedules[{n}]",
                    raw=schedule,
                    duration=washed(schedule.get("duration"), granularity),
                )
            )
    return found


def _zone_value(zone: dict, all_zones: dict, key: str):
    return zone[key] if key in zone else all_zones.get(key)


def _count(value, default: int = 1) -> int:
    """A whole number IU accepts (``2``, ``"2"``, ``2.0``), else the default."""
    try:
        return max(0, int(float(value)))
    except (TypeError, ValueError):
        return default


def washed(value, granularity: float) -> float | None:
    """A duration as IU keeps it: truncated to its time step (``wash_td``)."""
    seconds = seconds_of(value)
    if seconds is None:
        return None
    if granularity <= 0:
        return seconds
    return int(int(seconds) / granularity) * granularity


def read_config(config: dict, report: Report, granularity: float = 60) -> list:
    """The controllers of an IU configuration, as IU itself reads them.

    Durations, delays and bounds are truncated to IU's time step as IU does
    when it loads them. A sequence refers to a zone by its ``zone_id``, which
    is the zone's number when it has none, and only within its own controller
    (``global_zone_ids`` only makes IU check that the ids are unique).
    """
    controllers = []
    for c_index, raw in enumerate(as_list(config.get("controllers")), start=1):
        if not isinstance(raw, dict):
            continue
        where = f"controllers[{c_index - 1}]"
        all_zones = raw.get("all_zones_config") or {}
        zones = []
        for z_index, zone_raw in enumerate(as_list(raw.get("zones")), start=1):
            if not isinstance(zone_raw, dict):
                continue
            volume = _zone_value(zone_raw, all_zones, "volume") or {}
            zone_where = f"{where}.zones[{z_index - 1}]"
            zones.append(
                Zone(
                    controller=c_index,
                    index=z_index,
                    zone_id=str(zone_raw.get("zone_id") or z_index),
                    name=str(zone_raw.get("name") or f"Zone {z_index}"),
                    entities=entities_of(zone_raw.get("entity_id")),
                    enabled=zone_raw.get("enabled") is not False,
                    minimum=washed(
                        _zone_value(zone_raw, all_zones, "minimum"), granularity
                    ),
                    maximum=washed(
                        _zone_value(zone_raw, all_zones, "maximum"), granularity
                    ),
                    check_back={
                        **(all_zones.get("check_back") or {}),
                        **(zone_raw.get("check_back") or {}),
                    }
                    or None,
                    volume_entity=(
                        volume.get("entity_id") if isinstance(volume, dict) else None
                    ),
                    schedules=_schedules(
                        zone_raw.get("schedules"), zone_where, granularity
                    ),
                    where=zone_where,
                )
            )
        controller = Controller(
            index=c_index,
            controller_id=str(raw.get("controller_id") or c_index),
            name=str(raw.get("name") or f"Controller {c_index}"),
            entities=entities_of(raw.get("entity_id")),
            preamble=washed(raw.get("preamble"), granularity) or 0.0,
            postamble=washed(raw.get("postamble"), granularity) or 0.0,
            enabled=raw.get("enabled") is not False,
            zones=zones,
            sequences=[],
            where=where,
        )
        by_ref = {zone.zone_id: zone for zone in zones}
        for s_index, seq_raw in enumerate(as_list(raw.get("sequences")), start=1):
            if not isinstance(seq_raw, dict):
                continue
            seq_where = f"{where}.sequences[{s_index - 1}]"
            steps = []
            for position, step_raw in enumerate(as_list(seq_raw.get("zones")), 1):
                if not isinstance(step_raw, dict):
                    continue
                step_where = f"{seq_where}.zones[{position - 1}]"
                members = []
                for ref in as_list(step_raw.get("zone_id")):
                    zone = by_ref.get(str(ref).strip())
                    if zone is None:
                        report.add(
                            f"{step_where}.zone_id",
                            NOT_CARRIED,
                            f"no zone with zone_id {ref!r} in this controller",
                        )
                        continue
                    if zone not in members:
                        members.append(zone)
                repeat = _count(step_raw.get("repeat"), 1)
                if repeat == 0:
                    report.add(
                        f"{step_where}.repeat",
                        CARRIED,
                        "repeat 0 waters nothing: the step is disabled",
                    )
                steps.append(
                    SequenceZone(
                        zones=members,
                        delay=washed(step_raw.get("delay"), granularity),
                        duration=washed(step_raw.get("duration"), granularity),
                        repeat=max(1, repeat),
                        enabled=step_raw.get("enabled") is not False and repeat > 0,
                        volume=seconds_of(step_raw.get("volume")),
                        position=position,
                        where=step_where,
                    )
                )
            repeat = _count(seq_raw.get("repeat"), 1)
            if repeat == 0:
                report.add(
                    f"{seq_where}.repeat",
                    CARRIED,
                    "repeat 0 waters nothing: the program is disabled",
                )
            controller.sequences.append(
                Sequence(
                    controller=controller.index,
                    index=s_index,
                    sequence_id=str(seq_raw.get("sequence_id") or s_index),
                    name=str(seq_raw.get("name") or f"Sequence {s_index}"),
                    delay=washed(seq_raw.get("delay"), granularity),
                    duration=washed(seq_raw.get("duration"), granularity),
                    repeat=max(1, repeat),
                    enabled=seq_raw.get("enabled") is not False and repeat > 0,
                    steps=steps,
                    schedules=_schedules(
                        seq_raw.get("schedules"), seq_where, granularity
                    ),
                    where=seq_where,
                )
            )
        controllers.append(controller)
    return controllers


# --- schedules ---------------------------------------------------------------------


def _cron_values(field_text: str, low: int, high: int) -> list | None:
    """The values a cron field allows, or None if it cannot be read."""
    values: set = set()
    for part in field_text.split(","):
        step = 1
        if "/" in part:
            part, step_text = part.split("/", 1)
            if not step_text.isdigit() or int(step_text) < 1:
                return None
            step = int(step_text)
        if part in ("*", ""):
            start, end = low, high
        elif "-" in part:
            a, b = part.split("-", 1)
            if not (a.isdigit() and b.isdigit()):
                return None
            start, end = int(a), int(b)
        elif part.isdigit():
            start = end = int(part)
            if step != 1:
                end = high
        else:
            return None
        if start < low or end > high or start > end:
            return None
        values.update(range(start, end + 1, step))
    return sorted(values)


def cron_schedules(text: str) -> tuple[list, str]:
    """Time schedules for a cron expression, or ``([], why not)``.

    Only what Smart Irrigation can say: minutes and hours as a finite list of
    times (at most ``MAX_CRON_TIMES``), and either days of the month or days of
    the week, not both (cron then means either one).
    """
    fields = str(text or "").split()
    if len(fields) != 5:
        return [], "a cron expression has five fields"
    minutes = _cron_values(fields[0], 0, 59)
    hours = _cron_values(fields[1], 0, 23)
    days = _cron_values(fields[2], 1, 31)
    months = _cron_values(fields[3], 1, 12)
    weekdays = _cron_values(fields[4], 0, 7)
    if None in (minutes, hours, days, months, weekdays):
        return [], "this cron expression cannot be read"
    if fields[2] != "*" and fields[4] != "*":
        return [], "days of the month and of the week together"
    if len(minutes) * len(hours) > MAX_CRON_TIMES:
        return [], f"more than {MAX_CRON_TIMES} times a day"
    base: dict = {}
    if fields[2] != "*":
        base[const.SCHEDULE_DAYS_OF_MONTH] = days
    if fields[3] != "*":
        base[const.SCHEDULE_MONTHS] = months
    if fields[4] != "*":
        # cron counts from Sunday (0 or 7), Smart Irrigation from Monday.
        base[const.SCHEDULE_WEEKDAYS] = sorted({(d - 1) % 7 for d in weekdays})
    return [
        {
            **base,
            const.SCHEDULE_TYPE: SCHEDULE_TYPE_TIME,
            const.SCHEDULE_TIME: f"{h:02d}:{m:02d}",
        }
        for h in hours
        for m in minutes
    ], ""


def _minutes(seconds: float, where: str, what: str, report: Report) -> int:
    whole = round(seconds / 60)
    if abs(seconds - whole * 60) >= 1:
        report.add(
            where,
            APPROXIMATED,
            f"{what} of {seconds:g} s is rounded to {whole} min: Smart "
            "Irrigation works in minutes there",
        )
    return whole


def convert_schedule(schedule: Schedule, report: Report, lead: float = 0.0) -> list:
    """The full controller's schedules for one IU schedule (none, one or more).

    ``lead`` is the supply's delay before, when it leads the valve. IU opens
    the zone at the schedule's moment and the master that long before it; the
    full controller switches the supply on at the moment and opens the valve
    that long after. The moment is moved earlier by the lead, so the water
    runs when it ran under IU.
    """
    raw, where = schedule.raw, schedule.where
    common: dict = {
        const.SCHEDULE_ENABLED: raw.get("enabled") is not False,
        const.SCHEDULE_ANCHOR: (
            ANCHOR_END if raw.get("anchor") == "finish" else ANCHOR_START
        ),
    }
    if raw.get("schedule_id"):
        common[const.SCHEDULE_ID] = str(raw["schedule_id"])
    weekdays = sorted(
        {
            WEEKDAYS[str(day).lower()[:3]]
            for day in as_list(raw.get("weekday"))
            if str(day).lower()[:3] in WEEKDAYS
        }
    )
    if weekdays:
        common[const.SCHEDULE_WEEKDAYS] = weekdays
    months = sorted(
        {
            MONTHS[str(m).lower()[:3]]
            for m in as_list(raw.get("month"))
            if str(m).lower()[:3] in MONTHS
        }
    )
    if months:
        common[const.SCHEDULE_MONTHS] = months
    day = raw.get("day")
    if day in ("odd", "even"):
        common[const.SCHEDULE_PARITY] = PARITY_ODD if day == "odd" else PARITY_EVEN
    elif isinstance(day, dict):
        every = int(day.get("every_n_days") or 1)
        start = a_date(day.get("start_n_days"))
        if every > MAX_EVERY_N_DAYS:
            report.add(
                f"{where}.day.every_n_days",
                NOT_CARRIED,
                f"every {every} days: Smart Irrigation goes up to "
                f"{MAX_EVERY_N_DAYS}",
            )
            return []
        common[const.SCHEDULE_EVERY_N_DAYS] = every
        if start is not None and every > 1:
            common[const.SCHEDULE_EVERY_OFFSET] = start.toordinal() % every
    elif day is not None:
        listed = [int(d) for d in as_list(day) if str(d).strip().isdigit()]
        days = sorted({d for d in listed if d > 0})
        if days:
            common[const.SCHEDULE_DAYS_OF_MONTH] = days
        elif listed:
            # Day 0 never comes: IU never runs such a schedule.
            report.add(f"{where}.day", CARRIED, "day 0 never comes: disabled")
            common[const.SCHEDULE_ENABLED] = False
    if raw.get("from") is not None:
        common[const.SCHEDULE_FROM] = month_day(raw.get("from"))
        common[const.SCHEDULE_UNTIL] = month_day(raw.get("until"))
    if raw.get("name"):
        report.add(
            f"{where}.name",
            NOT_CARRIED,
            f"the schedule {raw['name']!r} keeps no name",
        )

    moment = raw.get("time")
    if isinstance(moment, dict) and "sun" in moment:
        before = seconds_of(moment.get("before")) or 0.0
        after = seconds_of(moment.get("after")) or 0.0
        offset = _minutes(after - before - lead, f"{where}.time", "the offset", report)
        if abs(offset) > MAX_OFFSET_MINUTES:
            report.add(
                f"{where}.time",
                NOT_CARRIED,
                f"an offset of {offset} min: Smart Irrigation allows "
                f"{MAX_OFFSET_MINUTES}",
            )
            return []
        return [
            {
                **common,
                const.SCHEDULE_TYPE: SCHEDULE_TYPE_SUN,
                const.SCHEDULE_EVENT: str(moment["sun"]),
                const.SCHEDULE_OFFSET_MINUTES: offset,
            }
        ]
    if isinstance(moment, dict) and "cron" in moment:
        expanded, why = cron_schedules(moment["cron"])
        if not expanded:
            report.add(
                f"{where}.time.cron",
                NOT_CARRIED,
                f"cron {moment['cron']!r}: {why}",
            )
            return []
        report.add(
            f"{where}.time.cron",
            APPROXIMATED,
            f"cron {moment['cron']!r} became {len(expanded)} time schedule(s)",
        )
        made = []
        for n, entry in enumerate(expanded):
            item = {**common, **entry}
            if const.SCHEDULE_ID in common and n:
                item[const.SCHEDULE_ID] = f"{common[const.SCHEDULE_ID]}_{n + 1}"
            made.append(item)
        return made
    at = time_of_day(moment)
    if at is None:
        report.add(f"{where}.time", NOT_CARRIED, f"no time of day in {moment!r}")
        return []
    if lead > 0:
        seconds = at.hour * 3600 + at.minute * 60 + at.second - lead
        if seconds < 0:
            report.add(
                f"{where}.time",
                APPROXIMATED,
                f"{at.isoformat()} is kept: moving it earlier by the supply's "
                f"lead of {lead:g} s would change the day",
            )
        else:
            at = time(
                int(seconds // 3600), int(seconds % 3600 // 60), int(seconds % 60)
            )
    if at.second:
        report.add(
            f"{where}.time",
            APPROXIMATED,
            f"{at.isoformat()} is taken as {at.hour:02d}:{at.minute:02d}: "
            "Smart Irrigation starts on the minute",
        )
    return [
        {
            **common,
            const.SCHEDULE_TYPE: SCHEDULE_TYPE_TIME,
            const.SCHEDULE_TIME: f"{at.hour:02d}:{at.minute:02d}",
        }
    ]


# --- durations ---------------------------------------------------------------------


def _constrain(seconds: float, zones) -> float:
    """Within the bounds of each zone, in turn, as IU constrains a step."""
    for zone in zones if isinstance(zones, list) else [zones]:
        if zone.minimum is not None:
            seconds = max(seconds, zone.minimum)
        if zone.maximum is not None:
            seconds = min(seconds, zone.maximum)
    return seconds


def _round_to(seconds: float, granularity: float) -> float:
    """IU's ``round_td``: to the nearest time step, halves up."""
    if granularity <= 0:
        return seconds
    return math.floor(seconds / granularity + 0.5) * granularity


def step_base_seconds(sequence: Sequence, step: SequenceZone, granularity) -> float:
    """IU's ``zone_duration_config``: the step's, else the sequence's, else one
    time step."""
    if step.duration is not None:
        return step.duration
    if sequence.duration is not None:
        return sequence.duration
    return float(granularity)


def _counts(step: SequenceZone) -> bool:
    """IU's ``zone_enabled``: a step counts when one of its zones is enabled."""
    return step.enabled and any(zone.enabled for zone in step.zones)


def step_seconds_for(
    sequence: Sequence, step: SequenceZone, total: float | None, granularity
) -> dict:
    """How long IU waters each zone of a step, for one repeat, by zone key.

    The step's base duration within the bounds of all its zones, scaled when a
    schedule gives a duration (``total``: IU first takes the delays off, and
    shares what is left in proportion to the steps' durations), bounded again
    and rounded to IU's time step (``zone_duration_final``). Then each zone's
    own bounds once more, as IU applies them when it builds the run.
    """
    factor = 1.0
    if total is not None:
        durations = 0.0
        delays = 0.0
        last = None
        for other in sequence.steps:
            if not _counts(other):
                continue
            other_base = step_base_seconds(sequence, other, granularity)
            durations += _constrain(other_base, other.zones) * other.repeat
            delay = other.delay if other.delay is not None else (sequence.delay or 0.0)
            delays += delay * other.repeat
            last = delay
        durations *= sequence.repeat
        delays *= sequence.repeat
        if last is not None:
            delays -= last
        if durations > 0:
            factor = (total - delays) / durations if total > delays else 0.0
    seconds = _constrain(step_base_seconds(sequence, step, granularity), step.zones)
    seconds = _round_to(_constrain(seconds * factor, step.zones), granularity)
    return {zone.key: _constrain(seconds, [zone]) for zone in step.zones}


def gap_with_a_leading_supply(
    delay: float, lead: float, after: float
) -> tuple[float, bool]:
    """The wait to store after a step so the next opens when IU opens it.

    A supply that leads goes off during a wait longer than its delay after,
    and the full controller then waits its lead again before the next valve
    opens; IU does not. Returns ``(wait, exact)``: the wait as it is when the
    supply stays on, shortened by the lead when it goes off; when it would go
    off only because of the lead, no wait is exact.
    """
    if lead <= 0 or delay <= after:
        return delay, True
    if delay - lead > after:
        return delay - lead, True
    return delay, False


# --- the mapping -------------------------------------------------------------------


@dataclass
class Link:
    """An adjust-time blueprint automation: a Smart Irrigation zone fed an IU
    zone, or a zone of an IU sequence, with its calculated duration."""

    si_zone_id: int
    iu_zone: str | None = None  # "c1_z2"
    iu_sequence: str | None = None  # "c1_s1"
    position: int | None = None  # 1-based, in the sequence


def _program_id(*parts) -> str:
    return "iu_" + "_".join(str(p) for p in parts if p not in (None, ""))


def _supply_id(controller: Controller) -> str:
    return _program_id("c" + str(controller.index), "supply")


def plan_import(
    config: dict,
    existing_zones: list | None = None,
    links: list | None = None,
) -> dict:
    """What importing an IU configuration would create, and the report.

    ``existing_zones`` are the Smart Irrigation zones there already are
    (``id``, ``name``, ``linked_entity``); ``links`` are the adjust-time
    blueprint automations, as ``Link``. Returns::

        {
          "supplies": [...],   # as the store keeps them
          "zones": [...],      # one per IU zone: "key", "name", "match" (an
                               # existing zone id or None), "match_reason",
                               # and "zone" (the fields of a zone to create)
          "programs": [...],   # as the store keeps them; a step's zones are
                               # IU zone keys ("c1_z2") until they are created
          "report": {"items": [...], "counts": {...}},
        }
    """
    report = Report()
    if not isinstance(config, dict):
        report.add("", NOT_CARRIED, "no Irrigation Unlimited configuration")
        return {"supplies": [], "zones": [], "programs": [], "report": _out(report)}
    classify_options(config, report)
    granularity = seconds_of(config.get("granularity")) or DEFAULT_GRANULARITY_SECONDS
    controllers = read_config(config, report, granularity)
    existing_zones = existing_zones or []
    links = links or []

    supplies = []
    for controller in controllers:
        if not controller.entities:
            continue
        supplies.append(
            {
                const.SUPPLY_ID: _supply_id(controller),
                const.SUPPLY_NAME: controller.name,
                const.SUPPLY_ENTITIES: controller.entities,
                const.SUPPLY_DELAY_BEFORE: _bounded(
                    controller.preamble,
                    const.SUPPLY_MAX_DELAY_SECONDS,
                    f"{controller.where}.preamble",
                    report,
                ),
                const.SUPPLY_DELAY_AFTER: _bounded(
                    controller.postamble,
                    const.SUPPLY_MAX_DELAY_SECONDS,
                    f"{controller.where}.postamble",
                    report,
                ),
                # IU has no power cut before starting.
                const.SUPPLY_KICK_SECONDS: 0.0,
                const.SUPPLY_ENABLED: controller.enabled,
            }
        )
    if len(controllers) > 1 and any(
        c.sequences or any(z.schedules for z in c.zones) for c in controllers
    ):
        report.add(
            "controllers",
            APPROXIMATED,
            f"{len(controllers)} controllers: their programs run one after the "
            "other, as the full controller has one queue",
        )

    for controller in controllers:
        scheduled = len([z for z in controller.zones if z.schedules]) + len(
            [s for s in controller.sequences if s.schedules]
        )
        if scheduled > 1:
            report.add(
                controller.where,
                APPROXIMATED,
                f"{scheduled} zones and sequences have schedules: where their "
                "runs overlap, IU waters them at the same time, the full "
                "controller one after the other",
                controller.name,
            )
    zones = [
        _plan_zone(zone, controller, existing_zones, links, report)
        for controller in controllers
        for zone in controller.zones
    ]

    fed_zone = {link.iu_zone: link for link in links if link.iu_zone}
    fed_step = {
        (link.iu_sequence, link.position): link
        for link in links
        if link.iu_sequence and link.position
    }

    programs = []
    for controller in controllers:
        for sequence in controller.sequences:
            programs.extend(
                _plan_sequence(controller, sequence, fed_step, granularity, report)
            )
        for zone in controller.zones:
            programs.extend(_plan_zone_schedules(controller, zone, fed_zone, report))
    return {
        "supplies": supplies,
        "zones": zones,
        "programs": programs,
        "report": _out(report),
    }


def _out(report: Report) -> dict:
    return {"items": report.items, "counts": report.counts()}


def _bounded(seconds: float, limit: float, where: str, report: Report) -> float:
    if abs(seconds) <= limit:
        return seconds
    report.add(
        where,
        APPROXIMATED,
        f"{seconds:g} s is held to {limit:g} s, the most Smart Irrigation allows",
    )
    return math.copysign(limit, seconds)


def _plan_zone(
    zone: Zone, controller: Controller, existing: list, links: list, report: Report
) -> dict:
    match, reason = None, None
    valve = zone.entities[0] if zone.entities else None
    if valve:
        for candidate in existing:
            if candidate.get(const.ZONE_LINKED_ENTITY) == valve:
                match, reason = candidate.get(const.ZONE_ID), "valve"
                break
    if match is None:
        for link in links:
            if link.iu_zone == zone.key:
                match, reason = link.si_zone_id, "blueprint"
                break
    if match is None:
        for candidate in existing:
            if str(candidate.get(const.ZONE_NAME) or "").strip().lower() == (
                zone.name.strip().lower()
            ):
                match, reason = candidate.get(const.ZONE_ID), "name"
                break
    if not zone.entities:
        report.add(
            f"{zone.where}.entity_id",
            APPROXIMATED,
            f"zone {zone.name!r} has no valve: it is created, but not watered "
            "until one is linked",
            zone.name,
        )
    fields: dict = {
        const.ZONE_NAME: zone.name,
        const.ZONE_LINKED_ENTITY: valve,
        const.ZONE_EXTRA_ENTITIES: zone.entities[1:],
        # A zone that comes without a water model waters what its steps say.
        const.ZONE_STATE: (
            const.ZONE_STATE_MANUAL if zone.enabled else const.ZONE_STATE_DISABLED
        ),
    }
    if controller.entities:
        fields[const.ZONE_SUPPLY_ID] = _supply_id(controller)
    check_back = zone.check_back or {}
    if check_back.get("delay") is not None or check_back.get("retries") is not None:
        # IU checks after ``delay`` and sends the command again up to
        # ``retries`` times, checking after each: the same wait, with the
        # resends spread over it as the full controller spreads them.
        delay = seconds_of(check_back.get("delay"))
        delay = IU_CHECK_BACK_DELAY if delay is None else delay
        retries = check_back.get("retries")
        retries = IU_CHECK_BACK_RETRIES if retries is None else _count(retries, 0)
        wait = delay * (retries + 1)
        fields[const.ZONE_CONFIRM_TIMEOUT] = max(
            const.CONFIRM_TIMEOUT_MIN, min(const.CONFIRM_TIMEOUT_MAX, round(wait))
        )
        # Without resync IU only checks, it never sends the command again.
        resends = retries if check_back.get("resync", True) is not False else 0
        fields[const.ZONE_OPEN_RESENDS] = min(resends, const.OPEN_RESENDS_MAX)
        lost = [k for k in ("states", "toggle", "entity_id") if k in check_back]
        if lost:
            report.add(
                f"{zone.where}.check_back",
                APPROXIMATED,
                f"wait {wait:g} s with {resends} resend(s); "
                f"{', '.join(lost)} not carried",
                zone.name,
            )
    if check_back.get("states") == "none":
        report.add(
            f"{zone.where}.check_back.states",
            NOT_CARRIED,
            "IU does not check this valve; Smart Irrigation always confirms it",
            zone.name,
        )
    if zone.volume_entity:
        fields[const.ZONE_FLOW_SENSOR] = zone.volume_entity
    return {
        "key": zone.key,
        "name": zone.name,
        "match": match,
        "match_reason": reason,
        "zone": fields,
    }


def _lead(controller: Controller) -> float:
    """How long the supply comes on before the valve opens; 0 without one."""
    if not controller.entities:
        return 0.0
    return max(0.0, min(controller.preamble, float(const.SUPPLY_MAX_DELAY_SECONDS)))


def _schedules_of(schedules: list, report: Report, lead: float = 0.0) -> list:
    made = []
    for schedule in schedules:
        made.extend(convert_schedule(schedule, report, lead))
    return made


def _plan_sequence(controller, sequence, fed_step, granularity, report) -> list:
    """One program per sequence, and one more per distinct schedule duration."""
    groups: dict = {}
    for schedule in sequence.schedules:
        groups.setdefault(schedule.duration, []).append(schedule)
    if not groups:
        groups[None] = []
    groups = dict(
        sorted(groups.items(), key=lambda kv: (kv[0] is not None, kv[0] or 0))
    )
    any_fed = any((sequence.key, s.position) in fed_step for s in sequence.steps)
    if any_fed and len(groups) > 1:
        report.add(
            f"{sequence.where}.schedules",
            APPROXIMATED,
            "calculated durations: the durations of the schedules are not used",
            sequence.name,
        )
        groups = {None: [s for group in groups.values() for s in group]}
    tours = sequence.repeat
    if tours > MAX_TOURS:
        report.add(
            f"{sequence.where}.repeat",
            APPROXIMATED,
            f"{tours} repeats are held to {MAX_TOURS}",
            sequence.name,
        )
        tours = MAX_TOURS
    programs = []
    for number, (total, schedules) in enumerate(groups.items()):
        steps = []
        for step in sequence.steps:
            if not step.zones:
                continue
            fed = (sequence.key, step.position) in fed_step
            passes = step.repeat
            if passes > MAX_PASSES:
                report.add(
                    f"{step.where}.repeat",
                    APPROXIMATED,
                    f"{passes} repeats are held to {MAX_PASSES} passes",
                    sequence.name,
                )
                passes = MAX_PASSES
            entry: dict = {
                const.STEP_ID: f"step_{step.position}",
                const.STEP_ZONES: [zone.key for zone in step.zones],
                const.STEP_ENABLED: step.enabled,
                const.STEP_PASSES: passes,
            }
            if fed:
                entry[const.STEP_MODE] = DURATION_CALCULATED
            else:
                by_zone = step_seconds_for(sequence, step, total, granularity)
                # The full controller shares a fixed step's water between its
                # tours and passes; IU waters the whole duration each time.
                runs = step.repeat * sequence.repeat
                entry[const.STEP_MODE] = DURATION_FIXED
                entry[const.STEP_SECONDS] = min(
                    MAX_STEP_SECONDS, max(by_zone.values()) * runs
                )
                if len(set(by_zone.values())) > 1:
                    split = _split_by_duration(entry, by_zone, step, runs, report)
                    if split:
                        if step.delay is not None:
                            split[-1][const.STEP_DELAY] = _clamp_delay(
                                step.delay, step.where, report
                            )
                        steps.extend(split)
                        continue
            if fed:
                # A calculated step keeps the zones' bounds, on the whole water
                # of the step: every repeat and every run through.
                runs = step.repeat * sequence.repeat
                lowest = max((z.minimum or 0.0) for z in step.zones)
                highest = min((z.maximum or math.inf) for z in step.zones)
                if lowest:
                    entry[const.STEP_MIN_SECONDS] = min(MAX_STEP_SECONDS, lowest * runs)
                if highest != math.inf:
                    entry[const.STEP_MAX_SECONDS] = min(
                        MAX_STEP_SECONDS, highest * runs
                    )
            if step.delay is not None:
                entry[const.STEP_DELAY] = _clamp_delay(step.delay, step.where, report)
            if step.volume:
                entry[const.STEP_MAX_LITRES] = step.volume
            steps.append(entry)
        steps = _merge_runs_of_one_zone(steps, sequence.delay or 0.0)
        program_delay = _clamp_delay(
            sequence.delay or 0.0, f"{sequence.where}.delay", report
        )
        lead, after = _lead(controller), max(0.0, controller.postamble)
        if lead > 0:
            for entry in steps:
                wait = entry.get(const.STEP_DELAY)
                if wait is not None and wait > 0:
                    entry[const.STEP_DELAY], exact = gap_with_a_leading_supply(
                        wait, lead, after
                    )
                    if not exact:
                        _report_lead(report, sequence, wait, lead)
            if program_delay > 0:
                stored, exact = gap_with_a_leading_supply(program_delay, lead, after)
                if not exact:
                    _report_lead(report, sequence, program_delay, lead)
                program_delay = stored
        if not steps:
            report.add(
                f"{sequence.where}.zones",
                NOT_CARRIED,
                "no step has a zone",
                sequence.name,
            )
            continue
        program_schedules = _schedules_of(schedules, report, _lead(controller))
        for schedule in program_schedules:
            schedule[const.SCHEDULE_WEATHER] = any_fed
        suffix = None if total is None or number == 0 else _duration_label(total)
        programs.append(
            {
                const.PROGRAM_ID: _program_id(
                    "c" + str(controller.index),
                    sequence.sequence_id,
                    None if suffix is None else f"{round(total)}s",
                ),
                const.PROGRAM_NAME: (
                    sequence.name if suffix is None else f"{sequence.name} ({suffix})"
                ),
                const.PROGRAM_ENABLED: sequence.enabled and controller.enabled,
                const.PROGRAM_MAIN: False,
                const.PROGRAM_STEPS: steps,
                const.PROGRAM_DELAY: program_delay,
                const.PROGRAM_TOURS: tours,
                const.PROGRAM_SCHEDULES: program_schedules,
                "source": sequence.key,
            }
        )
    if len(programs) > 1:
        report.add(
            f"{sequence.where}.schedules",
            APPROXIMATED,
            f"{len(programs)} programs, one per schedule duration",
            sequence.name,
        )
    return programs


def _plan_zone_schedules(controller, zone, fed_zone, report) -> list:
    """A one-step program per distinct duration of a zone's own schedules."""
    groups: dict = {}
    for schedule in zone.schedules:
        groups.setdefault(schedule.duration, []).append(schedule)
    fed = zone.key in fed_zone
    if fed and len(groups) > 1:
        groups = {None: [s for group in groups.values() for s in group]}
    programs = []
    for number, (seconds, schedules) in enumerate(groups.items()):
        step: dict = {
            const.STEP_ID: "step_1",
            const.STEP_ZONES: [zone.key],
            const.STEP_ENABLED: True,
        }
        if fed:
            step[const.STEP_MODE] = DURATION_CALCULATED
        else:
            step[const.STEP_MODE] = DURATION_FIXED
            step[const.STEP_SECONDS] = min(
                MAX_STEP_SECONDS, _constrain(seconds or 0.0, zone)
            )
        if fed and zone.minimum:
            step[const.STEP_MIN_SECONDS] = zone.minimum
        if fed and zone.maximum:
            step[const.STEP_MAX_SECONDS] = min(MAX_STEP_SECONDS, zone.maximum)
        program_schedules = _schedules_of(schedules, report, _lead(controller))
        for schedule in program_schedules:
            schedule[const.SCHEDULE_WEATHER] = fed
        suffix = None if seconds is None or number == 0 else _duration_label(seconds)
        programs.append(
            {
                const.PROGRAM_ID: _program_id(
                    "c" + str(controller.index),
                    "zone",
                    zone.zone_id,
                    None if suffix is None else f"{round(seconds)}s",
                ),
                const.PROGRAM_NAME: (
                    zone.name if suffix is None else f"{zone.name} ({suffix})"
                ),
                const.PROGRAM_ENABLED: controller.enabled,
                const.PROGRAM_MAIN: False,
                const.PROGRAM_STEPS: [step],
                const.PROGRAM_DELAY: 0.0,
                const.PROGRAM_TOURS: 1,
                const.PROGRAM_SCHEDULES: program_schedules,
                "source": zone.key,
            }
        )
    return programs


def _report_lead(report: Report, sequence: Sequence, wait: float, lead: float) -> None:
    report.add(
        f"{sequence.where}.delay",
        APPROXIMATED,
        f"after a wait of {wait:g} s the supply goes off and leads again: the "
        f"next zone opens up to {lead:g} s later than under IU",
        sequence.name,
    )


def _split_by_duration(
    entry: dict, by_zone: dict, step: SequenceZone, runs: int, report: Report
) -> list | None:
    """A step whose zones run for different times, as steps that start together.

    IU holds each zone of a step to its own bounds. The full controller gives a
    step one duration, so each duration becomes a step of its own, the shorter
    ones overlapping the next completely (a negative wait), the longest last:
    the step after them starts when the longest is done. None when that cannot
    be said (repeats, or an overlap longer than the full controller allows).
    """
    groups: dict = {}
    for key, seconds in by_zone.items():
        groups.setdefault(seconds, []).append(key)
    ordered = sorted(groups.items())
    if step.repeat > 1 or any(sec > MAX_OVERLAP_SECONDS for sec, _ in ordered[:-1]):
        report.add(
            step.where,
            APPROXIMATED,
            "its zones have different bounds; all of them water the longest time",
        )
        return None
    split = []
    for n, (seconds, keys) in enumerate(ordered):
        part = {
            **entry,
            const.STEP_ID: f"{entry[const.STEP_ID]}_{n + 1}",
            const.STEP_ZONES: keys,
            const.STEP_SECONDS: min(MAX_STEP_SECONDS, seconds * runs),
        }
        part.pop(const.STEP_DELAY, None)
        if n < len(ordered) - 1:
            part[const.STEP_DELAY] = -float(seconds)
        split.append(part)
    return split


def _merge_runs_of_one_zone(steps: list, program_delay: float) -> list:
    """Consecutive fixed steps of the same zones, with no wait between, as one.

    IU keeps the valve open from one to the next; two steps would close it and
    open it again at the same moment.
    """
    merged: list = []
    for step in steps:
        before = merged[-1] if merged else None
        if (
            before is not None
            and before[const.STEP_MODE] == DURATION_FIXED
            and step[const.STEP_MODE] == DURATION_FIXED
            and before[const.STEP_ENABLED]
            and step[const.STEP_ENABLED]
            and before[const.STEP_ZONES] == step[const.STEP_ZONES]
            and before.get(const.STEP_PASSES, 1) == 1
            and step.get(const.STEP_PASSES, 1) == 1
            and not before.get(const.STEP_MAX_LITRES)
            and not step.get(const.STEP_MAX_LITRES)
            and before.get(const.STEP_DELAY, program_delay) == 0
        ):
            before[const.STEP_SECONDS] = min(
                MAX_STEP_SECONDS, before[const.STEP_SECONDS] + step[const.STEP_SECONDS]
            )
            if const.STEP_DELAY in step:
                before[const.STEP_DELAY] = step[const.STEP_DELAY]
            else:
                before.pop(const.STEP_DELAY, None)
            continue
        merged.append(step)
    return merged


def _clamp_delay(seconds: float, where: str, report: Report) -> float:
    if -MAX_OVERLAP_SECONDS <= seconds <= MAX_DELAY_SECONDS:
        return seconds
    held = max(-MAX_OVERLAP_SECONDS, min(MAX_DELAY_SECONDS, seconds))
    report.add(
        where,
        APPROXIMATED,
        f"a wait of {seconds:g} s is held to {held:g} s",
    )
    return float(held)


def _duration_label(seconds: float | None) -> str:
    if seconds is None:
        return ""
    minutes = seconds / 60
    return f"{minutes:g} min"
