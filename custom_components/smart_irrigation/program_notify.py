"""Notifications sent by the programs themselves (full controller, opt-in).

A program can say who to tell when it has watered: a notify entity, a phone's
``notify.mobile_app_*`` action, or a persistent notification in Home Assistant.
It listens to the events the runners already fire, so an automation of one's
own keeps working beside it, and it never changes how a run goes.

- A program: ``program_started`` and ``program_finished`` (the old main
  program too, which became an ordinary program and kept its id).
- A valve that will not close, or a pump that does not do what it is told, is
  told at once, to the program under way: the end-of-run summary does not list
  them, and they are the ones not to learn about the next morning.
"""

from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

from homeassistant.core import Event, HomeAssistant, callback

from . import const
from .programs import find_program, normalize_notify

_LOGGER = logging.getLogger(__name__)

_LANGUAGES = Path(__file__).parent / const.LANGUAGE_FILES_DIR
# Home Assistant language codes served by a file of another name.
_ALIASES = {"nb": "no", "nn": "no"}
# Told at once rather than in the summary.
_URGENT_ZONE_PROBLEMS = ("valve_did_not_close", "zone_set_aside")

_tables: dict[str, dict] = {}


def _load_table(name: str) -> dict:
    """The ``notify`` strings of one language file (blocking, cached)."""
    if name not in _tables:
        try:
            data = json.loads((_LANGUAGES / f"{name}.json").read_text("utf-8"))
            _tables[name] = data.get("notify") or {}
        except (OSError, ValueError):
            _tables[name] = {}
    return _tables[name]


def _file_for(language: str | None) -> str:
    language = language or "en"
    for name in (
        language,
        _ALIASES.get(language.split("-")[0], language.split("-")[0]),
    ):
        if (_LANGUAGES / f"{name}.json").is_file():
            return name
    return "en"


class _Text:
    """The notification strings in Home Assistant's language, English behind."""

    def __init__(self, own: dict, english: dict) -> None:
        self._own = own
        self._english = english

    def __call__(self, key: str, **values: Any) -> str:
        text = _lookup(self._own, key)
        if text is None:
            text = _lookup(self._english, key)
        if text is None:
            return key
        try:
            return text.format(**values)
        except (KeyError, IndexError, ValueError):
            return text


def _lookup(table: dict, key: str) -> str | None:
    node: Any = table
    for part in key.split("."):
        if not isinstance(node, dict) or part not in node:
            return None
        node = node[part]
    return node if isinstance(node, str) else None


async def _text(hass: HomeAssistant) -> _Text:
    name = await hass.async_add_executor_job(_file_for, hass.config.language)
    own = await hass.async_add_executor_job(_load_table, name)
    english = await hass.async_add_executor_job(_load_table, "en")
    return _Text(own, english)


def _number(value: float) -> str:
    return f"{round(float(value or 0), 1):g}"


def _zone_line(t: _Text, zone: dict) -> str:
    line = t(
        "zone_line",
        zone=zone.get("zone") or f"#{zone.get('zone_id')}",
        minutes=_number((zone.get("seconds") or 0) / 60),
    )
    if (zone.get("volume_l") or 0) > 0:
        line += t("zone_volume", litres=_number(zone["volume_l"]))
    return line


def _reason(t: _Text, reason: str | None) -> str:
    text = t(f"reasons.{reason}")
    return reason or "" if text == f"reasons.{reason}" else text


def finished_message(t: _Text, name: str, data: dict) -> tuple[str, str]:
    """The title and text of the end-of-run notification."""
    problems = data.get("problems") or []
    lines = [_zone_line(t, zone) for zone in data.get("zones") or []]
    lines += [
        "⚠️ "
        + t(
            "problem_line",
            zone=p.get("zone") or f"#{p.get('zone_id')}",
            reason=_reason(t, p.get("reason")),
        )
        for p in problems
    ]
    if data.get("cut"):
        lines.append(t("cut"))
    elif data.get("stopped"):
        lines.append(t("stopped"))
    if not lines:
        lines.append(t("nothing"))
    title = t("title_problem" if problems else "title_done", program=name)
    return title, "\n".join(lines)


def started_message(t: _Text, name: str, data: dict) -> tuple[str, str] | None:
    zones = data.get("zones") or []
    if not zones:
        return None
    return (
        t("title_started", program=name),
        "\n".join(_zone_line(t, zone) for zone in zones),
    )


class ProgramNotifier:
    """Listens to the runners' events and tells whom each program names."""

    def __init__(self, hass: HomeAssistant, coordinator) -> None:
        self.hass = hass
        self.coordinator = coordinator
        self._unsubs: list = []

    def start(self) -> None:
        listen = self.hass.bus.async_listen
        for event, handler in (
            (const.EVENT_PROGRAM_STARTED, self._program_started),
            (const.EVENT_PROGRAM_FINISHED, self._program_finished),
            (const.EVENT_ZONE_PROBLEM, self._zone_problem),
            (const.EVENT_SUPPLY_PROBLEM, self._supply_problem),
            (const.EVENT_LEAK, self._leak),
        ):
            self._unsubs.append(listen(f"{const.DOMAIN}_{event}", handler))

    def stop(self) -> None:
        while self._unsubs:
            self._unsubs.pop()()

    # --- which program, and does it want to know -------------------------

    def _program(self, program_id) -> tuple[dict, dict] | None:
        config = self.coordinator.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return None
        program = find_program(getattr(config, const.CONF_PROGRAMS, None), program_id)
        if program is None:
            return None
        notify = normalize_notify(program.get(const.PROGRAM_NOTIFY))
        if notify is None:
            return None
        return program, notify

    def _running_program_id(self) -> str | None:
        """The program under way, or None (a zone watered by hand)."""
        registry = getattr(self.coordinator, "_program_runs_by_id", None) or {}
        for program_id, run in registry.items():
            if getattr(run, "running_since", None) is not None:
                return program_id
        return None

    def _name(self, program: dict) -> str:
        return str(program.get(const.PROGRAM_NAME) or program.get(const.PROGRAM_ID))

    # --- the events -------------------------------------------------------

    @callback
    def _program_started(self, event: Event) -> None:
        self._started(event.data.get("program_id"), dict(event.data))

    @callback
    def _program_finished(self, event: Event) -> None:
        self._finished(event.data.get("program_id"), dict(event.data))

    @callback
    def _zone_problem(self, event: Event) -> None:
        if event.data.get("reason") not in _URGENT_ZONE_PROBLEMS:
            return
        self._problem_now(event.data.get("zone"), event.data.get("reason"))

    @callback
    def _supply_problem(self, event: Event) -> None:
        self._problem_now(event.data.get("supply"), event.data.get("reason"))

    @callback
    def _leak(self, event: Event) -> None:
        """Water with every valve closed: every program that notifies is told."""
        config = self.coordinator.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return
        targets: list[str] = []
        for program in getattr(config, const.CONF_PROGRAMS, None) or []:
            notify = normalize_notify(program.get(const.PROGRAM_NOTIFY))
            for target in (notify or {}).get(const.NOTIFY_TARGETS, []):
                if target not in targets:
                    targets.append(target)
        if not targets:
            return
        self.hass.async_create_task(self._send_leak(targets, dict(event.data)))

    async def _send_leak(self, targets: list[str], data: dict) -> None:
        t = await _text(self.hass)
        program = {const.PROGRAM_ID: "leak"}
        await self._send(
            program,
            {const.NOTIFY_TARGETS: targets},
            t("title_leak"),
            t(
                "leak_line",
                litres=_number(data.get("litres") or 0),
                zones=", ".join(data.get("zones") or []),
            ),
            urgent=True,
        )

    def _started(self, program_id, data: dict) -> None:
        found = self._program(program_id)
        if found is None or not found[1][const.NOTIFY_START]:
            return
        program, notify = found
        self.hass.async_create_task(self._send_started(program, notify, data))

    def _finished(self, program_id, data: dict) -> None:
        found = self._program(program_id)
        if found is None:
            return
        program, notify = found
        if notify[const.NOTIFY_WHEN] == const.NOTIFY_WHEN_PROBLEMS and not data.get(
            "problems"
        ):
            return
        self.hass.async_create_task(self._send_finished(program, notify, data))

    def _problem_now(self, what, reason) -> None:
        """Tell the program under way; with none (a zone watered by hand, or
        every zone at once), every program that notifies, each target once:
        a valve that will not close is no less urgent outside a program."""
        program_id = self._running_program_id()
        if program_id is not None:
            found = self._program(program_id)
            if found is not None:
                program, notify = found
                self.hass.async_create_task(
                    self._send_problem(program, notify, str(what or ""), reason)
                )
            return
        config = self.coordinator.store.config
        if getattr(config, const.CONF_FULL_CONTROLLER, False) is not True:
            return
        told: set = set()
        for program in getattr(config, const.CONF_PROGRAMS, None) or []:
            notify = normalize_notify(program.get(const.PROGRAM_NOTIFY))
            if notify is None:
                continue
            targets = [t for t in notify[const.NOTIFY_TARGETS] if t not in told]
            if not targets:
                continue
            told.update(targets)
            self.hass.async_create_task(
                self._send_problem(
                    program,
                    {**notify, const.NOTIFY_TARGETS: targets},
                    str(what or ""),
                    reason,
                )
            )

    async def _send_started(self, program, notify, data) -> None:
        t = await _text(self.hass)
        message = started_message(t, self._name(program), data)
        if message is not None:
            await self._send(program, notify, *message, urgent=False)

    async def _send_finished(self, program, notify, data) -> None:
        t = await _text(self.hass)
        title, message = finished_message(t, self._name(program), data)
        await self._send(
            program, notify, title, message, urgent=bool(data.get("problems"))
        )

    async def _send_problem(self, program, notify, what, reason) -> None:
        t = await _text(self.hass)
        await self._send(
            program,
            notify,
            t("title_problem", program=self._name(program)),
            "⚠️ " + t("problem_line", zone=what, reason=_reason(t, reason)),
            urgent=True,
        )

    # --- sending ----------------------------------------------------------

    async def _send(self, program, notify, title, message, urgent: bool) -> None:
        tag = f"{const.DOMAIN}_{program.get(const.PROGRAM_ID)}"
        for target in notify[const.NOTIFY_TARGETS]:
            try:
                await self._send_one(target, title, message, tag, urgent)
            except (
                Exception
            ) as err:  # noqa: BLE001 - one target must not stop the others
                _LOGGER.warning(
                    "Program %s could not notify %s: %s",
                    program.get(const.PROGRAM_ID),
                    target,
                    err,
                )

    async def _send_one(self, target, title, message, tag, urgent) -> None:
        services = self.hass.services
        if target == const.NOTIFY_PERSISTENT:
            await services.async_call(
                "persistent_notification",
                "create",
                {"title": title, "message": message, "notification_id": tag},
                blocking=True,
            )
            return
        if self.hass.states.get(target) is not None:
            # A notify entity (Home Assistant 2024.5 and later).
            await services.async_call(
                "notify",
                "send_message",
                {"entity_id": target, "title": title, "message": message},
                blocking=True,
            )
            return
        action = target.split(".", 1)[1]
        if not services.has_service("notify", action):
            _LOGGER.warning("Notification target %s does not exist", target)
            return
        data: dict[str, Any] = {"title": title, "message": message}
        if action.startswith("mobile_app_"):
            extra: dict[str, Any] = {"tag": tag}
            if urgent:
                # Android shows it at once, iOS through Focus.
                extra.update(
                    priority="high",
                    ttl=0,
                    push={"interruption-level": "time-sensitive"},
                )
            data["data"] = extra
        await services.async_call("notify", action, data, blocking=True)


def async_setup_program_notify(hass: HomeAssistant, coordinator) -> ProgramNotifier:
    notifier = ProgramNotifier(hass, coordinator)
    notifier.start()
    return notifier
