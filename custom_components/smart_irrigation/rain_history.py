"""What a rain sensor that cannot say how much rain fell says instead.

The water balance wants millimetres. A rain gauge gives them, a weather service
gives them, and then the bucket does the rest: rain in, evaporation out, and how
long rain keeps counting falls out of the arithmetic rather than being decided
by anybody.

An installation whose only rain information is a **binary** sensor -- a leaf
sensor, an optical one, a weather platform's "is it raining" -- has none of
that. Today all we could do with it was veto the day it is on, which is
all-or-nothing and forgets the day after: a garden that took two days of rain
waters at full duration on the first dry evening.

So, for that case only, this reads the sensor's own history: how much of each of
the last few days it spent reporting rain, weighted so that yesterday counts for
more than four days ago, and turns it into one number between 0 and 1. The run
is shortened by it. Nothing here touches the bucket, because a bucket is in
millimetres and this is not: we know it rained, we do not know how much, and
pretending otherwise would corrupt the one part of the model that is exact.

It is a degraded mode, in the precise sense that it only applies to a zone whose
sensor group provides no precipitation at all. A group with real rain data never
reaches it.

The idea of weighting rain over a few rolling days is taken from kloggy's
HA-Irrigation-Version2 package, which does it with `history_stats` over five
24-hour windows. None of its code is used (it carries no licence): what is
borrowed is the observation that a binary rain sensor is worth more than a veto.
"""

import datetime
import logging

from homeassistant.components.recorder import get_instance, history

_LOGGER = logging.getLogger(__name__)

# How far back the sensor's history is read, and what a day of rain that long
# ago still counts for. Today is worth a whole run: a sensor that reported rain
# all day suppresses the run on its own. The rest halve, roughly, per day, which
# is a shape rather than a measurement -- with no millimetres there is nothing to
# calibrate against, and pretending to three decimal places would be a lie about
# what this knows.
DAY_WEIGHTS = (1.0, 0.6, 0.35, 0.2, 0.1)

# Below this the reduction is not worth applying: a run 2% shorter is noise.
MIN_FACTOR = 0.05
# Above it, what is left of the run would be a trickle, so the zone waits.
MAX_FACTOR = 0.95

_RAINING = ("on", "true", "wet", "raining", "rain")


def _is_raining(state: str) -> bool:
    return str(state).strip().lower() in _RAINING


def _fraction_raining(states, start, end) -> float:
    """The share of ``start``..``end`` the sensor spent reporting rain.

    ``states`` is the recorder's list for that entity over the period, in order,
    with the state at ``start`` first. Each state is held until the next one
    replaces it, which is what a recorded state means.
    """
    span = (end - start).total_seconds()
    if span <= 0:
        return 0.0
    wet = 0.0
    current = None
    since = start
    for state in states:
        stamp = max(start, min(state.last_changed, end))
        if current is not None and _is_raining(current):
            wet += (stamp - since).total_seconds()
        current = state.state
        since = stamp
    if current is not None and _is_raining(current):
        wet += (end - since).total_seconds()
    return max(0.0, min(1.0, wet / span))


async def rain_suppression(
    hass, entity_id, now=None, weights=DAY_WEIGHTS
) -> dict | None:
    """How much of a run the last few days of rain should take away, or None.

    Returns ``{"factor", "days", "source"}``: the factor is between 0 and 1, the
    days carry each window's own fraction so the panel can say why, newest
    first. None when there is nothing to read -- no entity, no recorder, or a
    sensor with no usable history -- and the caller then changes nothing.
    """
    if not entity_id:
        return None
    now = now or datetime.datetime.now(datetime.UTC)
    start = now - datetime.timedelta(days=len(weights))

    try:
        recorded = await get_instance(hass).async_add_executor_job(
            history.state_changes_during_period,
            hass,
            start,
            now,
            entity_id,
            True,  # no_attributes: the state is all this needs
        )
    except Exception as e:  # noqa: BLE001 - a missing recorder is not a failure
        _LOGGER.debug("No rain history for %s: %s", entity_id, e)
        return None

    states = recorded.get(entity_id) or []
    if not states:
        _LOGGER.debug("The recorder has no history for %s", entity_id)
        return None

    days = []
    total = 0.0
    for index, weight in enumerate(weights):
        window_end = now - datetime.timedelta(days=index)
        window_start = window_end - datetime.timedelta(days=1)
        fraction = _fraction_raining(
            [state for state in states if state.last_changed <= window_end],
            window_start,
            window_end,
        )
        total += weight * fraction
        days.append(
            {
                "ending": window_end.isoformat(),
                "fraction": round(fraction, 4),
                "weight": weight,
            }
        )

    return {
        "factor": round(max(0.0, min(1.0, total)), 4),
        "days": days,
        "source": entity_id,
    }
