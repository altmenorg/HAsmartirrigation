"""Whose turn it is at the valves: one queue per supply.

A run takes its turn before it opens anything: a program, the main program's
cycle, a zone watered by hand. Until 2026.11 there was one turn for everything,
so a program on the well pump waited for one on the mains to finish, though
the two share no water at all.

The turn is now taken per supply. A run names the supplies its zones are fed
by (``keys``); zones without a supply share one, the mains, which is what every
installation without supplies has, so nothing changes for it. A run goes when
no run that is watering uses any of its supplies, and no run that asked before
it and still waits does either: first come, first served on every supply, and a
run that needs two supplies is not overtaken forever by runs that need one.

``keys`` is None for a run that clashes with every other (the main program,
which waters all the automatic zones). The keys of a waiting run are asked again
each time a turn is given out, so a program changed while it waits is judged as
it is; a run that has its turn keeps the ones it was given.
"""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager

# The supply of the zones that have none: the mains.
NO_SUPPLY = ""

Keys = frozenset | None


def clash(a: Keys, b: Keys) -> bool:
    """Whether two runs would share a supply."""
    if a is None or b is None:
        return True
    return bool(a & b)


class _Ticket:
    """One run asking for its turn, or having it."""

    def __init__(self, keys: Callable[[], Keys]) -> None:
        self.keys = keys
        self.held: Keys = frozenset()
        self.given = asyncio.Event()


class Turns:
    """The runs watering, and those waiting their turn, by supply."""

    def __init__(self) -> None:
        self._holding: list[_Ticket] = []
        self._waiting: list[_Ticket] = []

    def busy(self) -> bool:
        """Whether any run has its turn."""
        return bool(self._holding)

    def would_wait(self, keys: Keys) -> bool:
        """Whether a run with these supplies, asked for now, would have to wait."""
        return any(clash(keys, t.held) for t in self._holding) or any(
            clash(keys, t.keys()) for t in self._waiting
        )

    def _give(self) -> None:
        """Give the turn to every waiting run that may go, in their order."""
        ahead: list[Keys] = []
        for ticket in list(self._waiting):
            keys = ticket.keys()
            if not any(clash(keys, t.held) for t in self._holding) and not any(
                clash(keys, other) for other in ahead
            ):
                self._waiting.remove(ticket)
                ticket.held = keys
                self._holding.append(ticket)
                ticket.given.set()
            else:
                ahead.append(keys)

    @asynccontextmanager
    async def turn(self, keys: Callable[[], Keys]) -> AsyncIterator[None]:
        """Wait for the turn on these supplies, and hold it inside the block."""
        ticket = _Ticket(keys)
        self._waiting.append(ticket)
        self._give()
        try:
            await ticket.given.wait()
            yield
        finally:
            if ticket in self._waiting:
                self._waiting.remove(ticket)
            if ticket in self._holding:
                self._holding.remove(ticket)
            self._give()
