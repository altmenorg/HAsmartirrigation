"""Each zone can say how long its valves have to confirm, and how often to ask again.

The wait for a valve to say it opened (8 s, or 30 s with two resends at 10 and
20 s with the full controller) and to say it closed (5 s) were the same for every
valve. A cloud valve such as Gardena's confirms through its vendor's servers:
it can need longer than that, and every resend is one call out of a weekly
quota, while a valve that confirms in time never needs one. Irrigation Unlimited
has this per controller as ``check_back`` (delay and retries).

A zone left empty keeps the timings it always had.
"""

import datetime

import homeassistant.util.dt as dt_util
import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.valve_runner import (
    PROBLEM_DID_NOT_CLOSE,
    PROBLEM_DID_NOT_OPEN,
    VALVE_CLOSE_TIMEOUT,
    VALVE_CONFIRM_TIMEOUT,
    close_timeout,
    confirm_plan,
    confirm_window,
)
from tests.runner_doubles import (
    Coordinator,
    closes,
    make_hass,
    make_store,
    opens,
    problems,
    set_state,
    zone,
)

ENTITY = "switch.zone_0"


@pytest.fixture(autouse=True)
def _silence_dispatcher(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args, **kwargs: None,
    )


class _Clock:
    """A loop clock that only moves when the runner sleeps."""

    def __init__(self):
        self.t = 1000.0
        self.hooks = []

    def time(self):
        return self.t

    async def sleep(self, seconds, *args, **kwargs):
        self.t += float(seconds)
        for at, hook in list(self.hooks):
            if self.t >= at:
                self.hooks.remove((at, hook))
                hook()


def _runner(monkeypatch, *, full=False, **zone_kw):
    """A runner whose valve stays as it is told, on a clock moved by its sleeps."""
    hass = make_hass()
    clock = _Clock()
    hass.loop.time = clock.time
    monkeypatch.setattr(
        "custom_components.smart_irrigation.valve_runner.asyncio.sleep", clock.sleep
    )
    store = make_store([zone(0, **zone_kw)])
    store.config.full_controller = full
    coord = Coordinator(hass, store)
    sent = []

    async def _call(domain, service, data, **kwargs):
        # Recorded, and nothing else: the valve does what the test says.
        hass.calls.append((service, data["entity_id"]))
        sent.append(clock.t)

    hass.services.async_call.side_effect = _call
    return hass, coord, clock, sent


# The plan, from the zone's settings


def test_a_zone_without_settings_keeps_the_timings_it_always_had():
    assert confirm_plan(None, False) == (VALVE_CONFIRM_TIMEOUT, [])
    assert confirm_plan({}, True) == (30.0, [10.0, 20.0])
    assert close_timeout({}) == VALVE_CLOSE_TIMEOUT
    assert confirm_window(None) == VALVE_CONFIRM_TIMEOUT


@pytest.mark.parametrize(
    ("settings", "full", "expected"),
    [
        # A longer wait keeps the default number of resends, spread over it.
        ({const.ZONE_CONFIRM_TIMEOUT: 60}, True, (60.0, [20.0, 40.0])),
        ({const.ZONE_CONFIRM_TIMEOUT: 60}, False, (60.0, [])),
        # 0 never sends the open again.
        ({const.ZONE_OPEN_RESENDS: 0}, True, (30.0, [])),
        # Resends can be asked for without the full controller too.
        ({const.ZONE_OPEN_RESENDS: 1}, False, (VALVE_CONFIRM_TIMEOUT, [4.0])),
        (
            {const.ZONE_CONFIRM_TIMEOUT: 40, const.ZONE_OPEN_RESENDS: 3},
            True,
            (40.0, [10.0, 20.0, 30.0]),
        ),
    ],
)
def test_the_zones_own_wait_and_resends(settings, full, expected):
    assert confirm_plan(settings, full) == expected


@pytest.mark.parametrize(
    ("settings", "expected"),
    [
        (
            {const.ZONE_CONFIRM_TIMEOUT: "", const.ZONE_OPEN_RESENDS: ""},
            (30.0, [10.0, 20.0]),
        ),
        ({const.ZONE_CONFIRM_TIMEOUT: "soon"}, (30.0, [10.0, 20.0])),
        ({const.ZONE_CONFIRM_TIMEOUT: 0, const.ZONE_OPEN_RESENDS: 0}, (1.0, [])),
        ({const.ZONE_OPEN_RESENDS: -2}, (30.0, [])),
        (
            {const.ZONE_CONFIRM_TIMEOUT: 110, const.ZONE_OPEN_RESENDS: 99},
            (110.0, [10.0 * i for i in range(1, 11)]),
        ),
    ],
)
def test_an_empty_or_unusable_setting_is_never_worse_than_the_default(
    settings, expected
):
    timeout, resends = confirm_plan(settings, True)
    assert timeout == pytest.approx(expected[0])
    assert resends == pytest.approx(expected[1])


def test_the_close_and_the_observer_window_follow_the_zones_wait():
    assert close_timeout({const.ZONE_CONFIRM_TIMEOUT: 45}) == 45.0
    assert confirm_window({const.ZONE_CONFIRM_TIMEOUT: 45}) == 45.0
    # Never shorter than the observer window was.
    assert confirm_window({const.ZONE_CONFIRM_TIMEOUT: 3}) == VALVE_CONFIRM_TIMEOUT


# The runner


async def test_by_default_a_slow_valve_is_asked_again_at_10_and_20_seconds(
    monkeypatch,
):
    hass, coord, clock, sent = _runner(monkeypatch, full=True)
    set_state(hass, ENTITY, "off")
    started = clock.t

    result = await coord._confirm_valve_running(ENTITY, zone=coord.store.get_zone(0))

    assert result is False
    assert [t - started for t in sent] == [10.0, 20.0]
    assert clock.t - started == pytest.approx(30.0)


async def test_zero_resends_never_sends_the_open_again(monkeypatch):
    hass, coord, clock, sent = _runner(
        monkeypatch,
        full=True,
        **{const.ZONE_CONFIRM_TIMEOUT: 45, const.ZONE_OPEN_RESENDS: 0},
    )
    set_state(hass, ENTITY, "off")
    started = clock.t

    result = await coord._confirm_valve_running(ENTITY, zone=coord.store.get_zone(0))

    assert result is False
    assert opens(hass) == []
    assert clock.t - started == pytest.approx(45.0)


async def test_a_valve_that_confirms_within_the_zones_wait_is_open(monkeypatch):
    """A cloud valve open after 40 s was a failure at 30 s; with 60 s it is not."""
    hass, coord, clock, sent = _runner(
        monkeypatch,
        full=True,
        **{const.ZONE_CONFIRM_TIMEOUT: 60, const.ZONE_OPEN_RESENDS: 0},
    )
    set_state(hass, ENTITY, "off")
    clock.hooks.append((clock.t + 40, lambda: set_state(hass, ENTITY, "on")))

    result = await coord._confirm_valve_running(ENTITY, zone=coord.store.get_zone(0))

    assert result is True
    assert opens(hass) == []


async def test_a_whole_pass_uses_the_zones_settings(monkeypatch):
    """Through the pass, not only the helper: the zone reaches the confirmation."""
    hass, coord, clock, sent = _runner(
        monkeypatch,
        full=True,
        **{const.ZONE_CONFIRM_TIMEOUT: 20, const.ZONE_OPEN_RESENDS: 0},
    )
    set_state(hass, ENTITY, "off")

    await coord._run_one_pass(coord.store.get_zone(0), ENTITY, 60)

    # The one open of the pass, never a second one, and the run fails.
    assert opens(hass) == [ENTITY]
    assert PROBLEM_DID_NOT_OPEN in problems(hass)


async def test_the_close_waits_the_zones_time_and_still_tries_twice(monkeypatch):
    """The second close is kept whatever the resends: a valve left open is worse."""
    hass, coord, clock, sent = _runner(
        monkeypatch,
        full=True,
        **{const.ZONE_CONFIRM_TIMEOUT: 20, const.ZONE_OPEN_RESENDS: 0},
    )
    set_state(
        hass,
        ENTITY,
        "on",
        changed=dt_util.utcnow() - datetime.timedelta(minutes=5),
    )
    started = clock.t

    closed = await coord._close_valve(coord.store.get_zone(0), ENTITY)

    assert closed is False
    assert closes(hass) == [ENTITY, ENTITY]
    assert PROBLEM_DID_NOT_CLOSE in problems(hass)
    # Two waits of 20 s, where the default gave each one 5 s.
    assert clock.t - started == pytest.approx(40.0)


async def test_a_close_confirmed_late_is_not_a_problem_with_the_zones_wait(
    monkeypatch,
):
    hass, coord, clock, sent = _runner(monkeypatch, **{const.ZONE_CONFIRM_TIMEOUT: 20})
    set_state(
        hass,
        ENTITY,
        "on",
        changed=dt_util.utcnow() - datetime.timedelta(minutes=5),
    )
    clock.hooks.append((clock.t + 12, lambda: set_state(hass, ENTITY, "off")))

    closed = await coord._close_valve(coord.store.get_zone(0), ENTITY)

    assert closed is True
    assert closes(hass) == [ENTITY]
    assert problems(hass) == []
