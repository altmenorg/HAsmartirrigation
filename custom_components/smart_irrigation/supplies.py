"""Supplies of the full controller: a pump or a main valve.

A supply runs while a zone it feeds is being watered. It is what Irrigation
Unlimited calls a controller: one or several entities switched on before the
first valve opens and off after the last one closes, with a delay each side.

Both delays are signed. Positive, the supply leads: it comes on that long before
the valve opens, and goes off that long after the valve closes, which is what a
pump wants. Negative, the valve leads: the supply comes on that long after the
valve opens, and goes off that long before it closes, so a pump never pushes
against a closed valve and a valve never closes on a running pump (water hammer).

Plain data and pure functions, testable without Home Assistant. The runner
(supply_runner.py) does the switching; this module only says what a supply is,
and keeps count of who is using it.
"""

from __future__ import annotations

import re

from . import const

_ID_UNSAFE = re.compile(r"[^a-z0-9_]+")


def _delay(value) -> float:
    """A delay in seconds, signed, held to the allowed range; 0 if it is no number."""
    try:
        seconds = float(value)
    except (TypeError, ValueError):
        return 0.0
    if seconds != seconds:  # NaN
        return 0.0
    limit = float(const.SUPPLY_MAX_DELAY_SECONDS)
    return max(-limit, min(limit, seconds))


def _entities(value) -> list:
    """The entity ids of a supply, from a list or a comma-separated string."""
    if isinstance(value, str):
        value = value.split(",")
    if not isinstance(value, (list, tuple)):
        return []
    seen = []
    for item in value:
        entity_id = str(item).strip()
        if "." in entity_id and entity_id not in seen:
            seen.append(entity_id)
    return seen


def _slug(name: str) -> str:
    slug = _ID_UNSAFE.sub("_", name.strip().lower()).strip("_")
    return slug or "supply"


def normalize_supplies(supplies) -> list:
    """The supplies as they are stored: well formed, with unique ids.

    Whatever the panel sends is cleaned rather than refused, since a half-typed
    entity or a stray delay is not worth a failed save: an entry that is not a
    dict is dropped, a missing or repeated id is made up from the name, the
    delays are numbers within range, and the entities are a list of entity ids.
    """
    cleaned = []
    used = set()
    for position, supply in enumerate(supplies or []):
        if not isinstance(supply, dict):
            continue
        name = str(supply.get(const.SUPPLY_NAME) or "").strip()
        if not name:
            name = f"Supply {position + 1}"
        supply_id = str(supply.get(const.SUPPLY_ID) or "").strip()
        if not supply_id or supply_id in used:
            base = _slug(name)
            supply_id, n = base, 2
            while supply_id in used:
                supply_id, n = f"{base}_{n}", n + 1
        used.add(supply_id)
        cleaned.append(
            {
                const.SUPPLY_ID: supply_id,
                const.SUPPLY_NAME: name,
                const.SUPPLY_ENTITIES: _entities(supply.get(const.SUPPLY_ENTITIES)),
                const.SUPPLY_DELAY_BEFORE: _delay(
                    supply.get(const.SUPPLY_DELAY_BEFORE)
                ),
                const.SUPPLY_DELAY_AFTER: _delay(supply.get(const.SUPPLY_DELAY_AFTER)),
                const.SUPPLY_ENABLED: supply.get(const.SUPPLY_ENABLED) is not False,
            }
        )
    return cleaned


def find_supply(supplies, supply_id) -> dict | None:
    """One supply by id, or None."""
    if not supply_id:
        return None
    for supply in supplies or []:
        if isinstance(supply, dict) and supply.get(const.SUPPLY_ID) == supply_id:
            return supply
    return None


def usable(supply) -> bool:
    """Whether a supply can be switched: enabled, with an entity to switch."""
    return bool(
        supply
        and supply.get(const.SUPPLY_ENABLED, True) is not False
        and supply.get(const.SUPPLY_ENTITIES)
    )


class SupplyHolds:
    """Who is using each supply, counted by name rather than by a number.

    A supply stays on while anything holds it, and the count is of holds, not of
    a predicted end time: a cycle's length cannot be known ahead (confirmation
    polls, soaks, a meter that takes its time), and a supply switched off on a
    guess runs dry or is cut under a valve still open. Taking and giving back a
    hold are separate and safe to repeat: giving back one never taken does
    nothing, which is what lets the same ``finally`` run whatever happened.
    """

    def __init__(self) -> None:
        self._holds: dict[str, set] = {}

    def acquire(self, supply_id: str, token) -> int:
        """Take a hold. Returns how many holds the supply has now."""
        holds = self._holds.setdefault(supply_id, set())
        holds.add(token)
        return len(holds)

    def release(self, supply_id: str, token) -> int | None:
        """Give a hold back. Returns how many remain, or None if it was not held."""
        holds = self._holds.get(supply_id)
        if not holds or token not in holds:
            return None
        holds.discard(token)
        return len(holds)

    def count(self, supply_id: str) -> int:
        return len(self._holds.get(supply_id, ()))

    def only_holder(self, supply_id: str, token) -> bool:
        """Whether ``token`` is the one hold the supply has."""
        holds = self._holds.get(supply_id, ())
        return len(holds) == 1 and token in holds

    def in_use(self) -> set:
        """The ids of the supplies something holds."""
        return {supply_id for supply_id, holds in self._holds.items() if holds}
