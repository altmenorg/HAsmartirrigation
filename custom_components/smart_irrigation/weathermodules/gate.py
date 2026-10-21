"""One gate in front of a weather service's API, for every caller of a client.

The client of a weather service is shared: the poll, the forecast for the
skip conditions, the panel's planning and forecast all go through it, often
from several threads at once. Each checked its cache, found it stale and asked
the API for itself, so one update could cost a dozen identical requests, and a
refusal (an expired key, a rate limit) was asked again at once by the next
caller, which only keeps a rate limit going.

The gate asks one request at a time, hands the same answer to whoever asks
the same thing within ``RECENT_SECONDS``, and after a failure asks nothing
until a pause is over (what ``Retry-After`` says, else a quarter of an hour
after a rate limit and five minutes after anything else). A run of failures
is logged once, and its end once. Open-Meteo has had these rules since #911;
this is the same thing for the services that take a key.
"""

import logging
import threading
import time
from collections.abc import Callable
from typing import Any, NamedTuple

_LOGGER = logging.getLogger(__name__)

RECENT_SECONDS = 60
PAUSE_AFTER_RATE_LIMIT = 900
PAUSE_AFTER_FAILURE = 300
MAX_PAUSE = 3600


class GateAnswer(NamedTuple):
    """What a request through the gate came back with.

    ``response`` is the HTTP response when it was a 200, else None; ``status``
    is the HTTP status of a refusal, None when nothing answered; ``paused`` is
    True when nothing was asked because the gate is in its pause.
    """

    response: Any
    status: int | None
    paused: bool


class RequestGate:
    """The rules above, for one client of one service."""

    def __init__(self, service: str) -> None:
        """A gate for ``service``, the name the log uses."""
        self.service = service
        self._lock = threading.Lock()
        self._recent: dict[str, tuple[float, Any]] = {}
        self._paused_until = 0.0
        self._failing = False

    def get(
        self, key: str, fetch: Callable[[], Any], *, fresh: bool = False
    ) -> GateAnswer:
        """Ask ``fetch()`` (one HTTP GET) for ``key``, under the gate's rules.

        ``fresh`` skips the recent answers, for a caller that asked for no
        cache; it does not skip a pause.
        """
        with self._lock:
            now = time.monotonic()
            hit = self._recent.get(key)
            if hit is not None and not fresh and now - hit[0] < RECENT_SECONDS:
                return GateAnswer(hit[1], 200, False)
            if now < self._paused_until:
                _LOGGER.debug(
                    "%s is paused for %.0f s more, not asked",
                    self.service,
                    self._paused_until - now,
                )
                return GateAnswer(None, None, True)
            try:
                response = fetch()
            except Exception as ex:  # noqa: BLE001 - any failure is a failure
                _LOGGER.debug("%s request failed: %s", self.service, ex)
                response = None
            status = getattr(response, "status_code", None)
            now = time.monotonic()
            if status != 200:
                self._pause(now, status, _retry_after(response))
                return GateAnswer(None, status, False)
            if self._failing:
                _LOGGER.info("%s answers again", self.service)
            self._failing = False
            for stale in [
                k for k, v in self._recent.items() if now - v[0] >= RECENT_SECONDS
            ]:
                del self._recent[stale]
            self._recent[key] = (now, response)
            return GateAnswer(response, 200, False)

    def _pause(self, now: float, status: int | None, retry_after: int | None) -> None:
        pause = retry_after or (
            PAUSE_AFTER_RATE_LIMIT if status == 429 else PAUSE_AFTER_FAILURE
        )
        pause = min(float(pause), MAX_PAUSE)
        self._paused_until = now + pause
        if not self._failing:
            _LOGGER.warning(
                "%s did not answer (%s). It is not asked again for %d minutes; "
                "what it supplies waits until then",
                self.service,
                (
                    "too many requests, HTTP 429"
                    if status == 429
                    else (f"HTTP {status}" if status else "no response")
                ),
                round(pause / 60),
            )
        else:
            _LOGGER.debug("%s still not answering (%s)", self.service, status)
        self._failing = True


def _retry_after(response) -> int | None:
    try:
        raw = (getattr(response, "headers", None) or {}).get("Retry-After")
        return int(raw) if raw is not None else None
    except (TypeError, ValueError, AttributeError):
        return None
