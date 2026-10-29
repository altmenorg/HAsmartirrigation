"""The import of an IU configuration, checked against IU's own test configurations.

The configurations are IU's (tests/fixtures/irrigation_unlimited, with their
licence). Each one is imported; every option it uses must have a rule. Where a
configuration carries IU's expected on/off times, the full controller's plan for
the imported configuration must switch the same, to within IU's time step, or
the configuration is listed in ``DEVIATIONS`` with the reason.

The switching is the controller's own: the programs run through
``async_run_program`` and the valve and supply runners on a virtual clock
(``iu_runner``), not through a model of them.
"""

from pathlib import Path

import pytest

from custom_components.smart_irrigation.iu_import import UNKNOWN, plan_import

from .iu_corpus import expected, load, location, moment_of, same
from .iu_runner import simulate

FIXTURES = Path(__file__).parent / "fixtures" / "irrigation_unlimited"
CONFIGS = sorted(FIXTURES.glob("*.yaml"))

SERVICES = "IU's test calls its services during the run (runs, adjustments, pauses)"
OVERLAP = (
    "runs overlap: IU waters them at the same time, the full controller one "
    "after the other"
)
REPEAT = "a step's repeat becomes passes: the water in parts, not full runs"
TESTER = "IU's test of its own tester expects wrong results on purpose"

DEVIATIONS = {
    "test_allow_manual.yaml": SERVICES,
    "test_autoplay.yaml": OVERLAP,
    "test_check_back.yaml": SERVICES,
    "test_constraints.yaml": "IU's threshold is not carried over",
    "test_edge_case_2.yaml": SERVICES,
    "test_entity.yaml": OVERLAP,
    "test_event.yaml": SERVICES,
    "test_event_valve_basic.yaml": OVERLAP,
    "test_event_valve_extended.yaml": OVERLAP,
    "test_every_n_days.yaml": OVERLAP,
    "test_finalise.yaml": OVERLAP,
    "test_history.yaml": SERVICES,
    "test_history_disabled.yaml": SERVICES,
    "test_history_live.yaml": SERVICES,
    "test_multi_entity_ids.yaml": OVERLAP,
    "test_no_schedule.yaml": SERVICES,
    "test_sequence_chain.yaml": "chains, which is not an option of IU's schema",
    "test_sequence_entity.yaml": SERVICES,
    "test_sequence_queue.yaml": OVERLAP,
    "test_sequence_repeat.yaml": SERVICES,
    "test_sequence_run.yaml": SERVICES,
    "test_template.yaml": SERVICES,
    "test_test_1.yaml": TESTER,
    "test_test_2.yaml": TESTER,
    "test_tester.yaml": TESTER,
    "test_volume_extensive.yaml": SERVICES,
    "test_volume_fault.yaml": SERVICES,
    "test_volume_limit.yaml": SERVICES,
    "timing_finish.yaml": OVERLAP,
    "timing_mega_fixed.yaml": OVERLAP,
    "timing_mega_variable.yaml": OVERLAP,
    "timing_sequence.yaml": REPEAT,
}

# Options no rule knows, because they are not IU's.
UNKNOWN_ON_PURPOSE = {"test_sequence_chain.yaml": "chains"}


def _windows(iu):
    return [w for w in (iu.get("testing") or {}).get("times") or [] if "results" in w]


def test_the_corpus_is_there():
    assert len(CONFIGS) > 60
    assert (FIXTURES / "LICENSE").is_file()


@pytest.mark.parametrize("path", CONFIGS, ids=lambda p: p.name)
def test_every_configuration_imports_and_every_option_has_a_rule(path):
    iu = load(path).get("irrigation_unlimited")
    if iu is None:
        pytest.skip("no irrigation_unlimited section")
    plan = plan_import(iu)
    unknown = [i["path"] for i in plan["report"]["items"] if i["outcome"] == UNKNOWN]
    allowed = UNKNOWN_ON_PURPOSE.get(path.name)
    assert all(allowed and allowed in p for p in unknown), unknown
    # Every step names a zone the plan creates or matches.
    keys = {zone["key"] for zone in plan["zones"]}
    for program in plan["programs"]:
        for step in program["steps"]:
            assert set(step["zones"]) <= keys


@pytest.mark.parametrize(
    "path",
    [p for p in CONFIGS if _windows(load(p).get("irrigation_unlimited") or {})],
    ids=lambda p: p.name,
)
def test_the_imported_plan_switches_as_iu_expected(path):
    data = load(path)
    iu = data["irrigation_unlimited"]
    homeassistant = data.get("homeassistant") or {}
    tz, _sun = location(homeassistant)
    tolerance = max(float(iu.get("granularity") or 60), 60.0)
    differing = []
    for window in _windows(iu):
        events = simulate(
            iu,
            homeassistant,
            moment_of(window["start"], tz),
            moment_of(window["end"], tz),
        )
        if not same(events, expected(iu, window, tz), tolerance):
            differing.append(window.get("name"))
    if path.name in DEVIATIONS:
        # Kept honest: a configuration that starts to match comes off the list.
        assert differing, f"{path.name} now matches; take it off DEVIATIONS"
    else:
        assert not differing, f"{path.name}: {differing}"


def test_most_configurations_with_expected_times_match():
    """The summary the PR states: how many of IU's cases switch identically."""
    with_times = [
        p for p in CONFIGS if _windows(load(p).get("irrigation_unlimited") or {})
    ]
    exact = [p for p in with_times if p.name not in DEVIATIONS]
    assert len(with_times) == 61
    assert len(exact) == 29


def test_the_timing_check_is_the_runners_own():
    """A runner that waits longer than it should is caught: the times above
    come from the runners, not from a model of them."""
    from unittest.mock import patch

    from custom_components.smart_irrigation import valve_runner

    path = FIXTURES / "timing_schedule_fixed.yaml"
    data = load(path)
    iu = data["irrigation_unlimited"]
    homeassistant = data.get("homeassistant") or {}
    tz, _sun = location(homeassistant)
    window = _windows(iu)[0]

    def matches():
        events = simulate(
            iu,
            homeassistant,
            moment_of(window["start"], tz),
            moment_of(window["end"], tz),
        )
        return same(events, expected(iu, window, tz), 60.0)

    assert matches()
    wait = valve_runner.ValveRunnerMixin.__dict__["_sleep_or_stop"].__func__

    async def two_minutes_longer(stop, seconds, pause=None):
        return await wait(stop, seconds + 120, pause)

    with patch.object(
        valve_runner.ValveRunnerMixin,
        "_sleep_or_stop",
        staticmethod(two_minutes_longer),
    ):
        assert not matches()
