"""A zone that cannot be calculated says so, where the user looks.

A failed calculation used to reach the log and nothing else, while the panel
said "nothing to water: this zone has what it needs" with a green tick. It is
now kept with the zone until a calculation succeeds, and shown on the zone's
status line, on its problem sensor and as a repair notice.
"""

import json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import calc_problem, const
from custom_components.smart_irrigation.binary_sensor import (
    SmartIrrigationZoneProblemBinarySensor,
)
from custom_components.smart_irrigation.calc_problem import (
    CODES,
    ERROR,
    NO_ENGINE,
    NO_READINGS,
    CalculationProblemMixin,
)
from custom_components.smart_irrigation.calculation import CalculationMixin

ROOT = Path(__file__).parent.parent / "custom_components" / "smart_irrigation"


@pytest.fixture
def issues(monkeypatch):
    """Capture the repair notices instead of touching a real registry."""
    recorded = SimpleNamespace(created=[], deleted=[])
    monkeypatch.setattr(
        calc_problem.ir,
        "async_create_issue",
        lambda hass, domain, issue_id, **kwargs: recorded.created.append(
            (issue_id, kwargs)
        ),
    )
    monkeypatch.setattr(
        calc_problem.ir,
        "async_delete_issue",
        lambda hass, domain, issue_id: recorded.deleted.append(issue_id),
    )
    monkeypatch.setattr(calc_problem, "async_dispatcher_send", MagicMock())
    return recorded


def _zone(state=const.ZONE_STATE_AUTOMATIC, **extra):
    zone = {
        const.ZONE_ID: 0,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: state,
        const.ZONE_MODULE: 1,
        const.ZONE_MAPPING: 1,
        const.ZONE_BUCKET: 0.0,
    }
    zone.update(extra)
    return zone


class _Store:
    """Zones by id, updated as the real store updates them."""

    def __init__(self, *zones):
        self.zones = {z[const.ZONE_ID]: dict(z) for z in zones}

    def get_zone(self, zone_id):
        return self.zones.get(int(zone_id))

    async def async_update_zone(self, zone_id, changes):
        self.zones[int(zone_id)].update(changes)

    async def async_get_zones(self):
        return [dict(z) for z in self.zones.values()]


class _Coordinator(CalculationProblemMixin, CalculationMixin):
    def __init__(self, *zones):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.use_weather_service = False
        self.store = _Store(*zones)


# --- keeping and clearing it ---------------------------------------------------


async def test_a_failure_is_kept_with_the_zone_and_raised_once(issues):
    coordinator = _Coordinator(_zone())
    await coordinator.async_calculation_failed(
        coordinator.store.get_zone(0), NO_READINGS
    )
    problem = coordinator.store.get_zone(0)[const.ZONE_CALCULATION_PROBLEM]
    assert problem["code"] == NO_READINGS and problem["since"]
    [(issue_id, kwargs)] = issues.created
    assert issue_id == "zone_not_calculated_0"
    assert kwargs["translation_key"] == "zone_not_calculated_no_readings"
    assert kwargs["translation_placeholders"]["zone"] == "Lawn"

    # The same reason every night is one notice, not one a night.
    await coordinator.async_calculation_failed(
        coordinator.store.get_zone(0), NO_READINGS
    )
    assert len(issues.created) == 1

    # Another reason replaces it, and keeps when it started.
    await coordinator.async_calculation_failed(
        coordinator.store.get_zone(0), ERROR, "division by zero"
    )
    again = coordinator.store.get_zone(0)[const.ZONE_CALCULATION_PROBLEM]
    assert again["code"] == ERROR and again["detail"] == "division by zero"
    assert again["since"] == problem["since"]
    assert issues.created[-1][1]["translation_placeholders"]["detail"] == (
        "division by zero"
    )


async def test_a_zone_that_is_not_automatic_cannot_fail(issues):
    for state in (const.ZONE_STATE_MANUAL, const.ZONE_STATE_DISABLED):
        coordinator = _Coordinator(_zone(state=state))
        await coordinator.async_calculation_failed(
            coordinator.store.get_zone(0), NO_READINGS
        )
        assert not coordinator.store.get_zone(0).get(const.ZONE_CALCULATION_PROBLEM)
    assert issues.created == []


async def test_clearing_forgets_it_and_its_notice(issues):
    coordinator = _Coordinator(
        _zone(**{const.ZONE_CALCULATION_PROBLEM: {"code": NO_READINGS}})
    )
    await coordinator.async_calculation_problem_cleared(0)
    assert coordinator.store.get_zone(0)[const.ZONE_CALCULATION_PROBLEM] is None
    assert issues.deleted == ["zone_not_calculated_0"]


# --- where the calculation says it --------------------------------------------


def _nightly(coordinator, readings=None, calculate=None):
    coordinator.store.async_get_config = AsyncMock(return_value={})
    coordinator.store.get_mapping = MagicMock(
        return_value={const.MAPPING_ID: 1, const.MAPPING_DATA: readings or []}
    )
    coordinator.store.get_module = MagicMock(
        return_value={const.MODULE_ID: 1, const.MODULE_NAME: "PyETO"}
    )
    coordinator.getModuleInstanceByID = AsyncMock(return_value=None)
    coordinator._get_unique_mappings_for_automatic_zones = AsyncMock(return_value=[1])
    coordinator.apply_aggregates_to_mapping_data = AsyncMock(return_value={"x": 1})
    coordinator.prune_consumed_readings = AsyncMock()
    coordinator.register_start_event = AsyncMock()
    coordinator.zone_window_start = MagicMock(return_value=None)
    coordinator.async_calculate_zone = AsyncMock(side_effect=calculate)
    return coordinator


async def test_the_nightly_run_says_a_zone_had_no_readings(issues):
    coordinator = _nightly(_Coordinator(_zone()))
    await coordinator._async_calculate_all(delete_weather_data=True)
    assert coordinator.store.get_zone(0)[const.ZONE_CALCULATION_PROBLEM]["code"] == (
        NO_READINGS
    )


async def test_the_nightly_run_says_an_error_with_its_message(issues):
    async def broken(*args, **kwargs):
        raise ZeroDivisionError("division by zero")

    coordinator = _nightly(
        _Coordinator(_zone()), readings=[{"Temperature": 20.0}], calculate=broken
    )
    await coordinator._async_calculate_all(delete_weather_data=True)
    problem = coordinator.store.get_zone(0)[const.ZONE_CALCULATION_PROBLEM]
    assert problem == {**problem, "code": ERROR, "detail": "division by zero"}


async def test_a_dry_run_says_nothing(issues):
    coordinator = _nightly(_Coordinator(_zone()))
    await coordinator._async_calculate_all(delete_weather_data=True, dry_run=True)
    assert not coordinator.store.get_zone(0).get(const.ZONE_CALCULATION_PROBLEM)
    assert issues.created == []


async def test_a_zone_made_manual_since_is_cleared_at_night(issues):
    coordinator = _nightly(
        _Coordinator(
            _zone(
                state=const.ZONE_STATE_MANUAL,
                **{const.ZONE_CALCULATION_PROBLEM: {"code": NO_READINGS}},
            )
        )
    )
    await coordinator._async_calculate_all(delete_weather_data=True)
    assert coordinator.store.get_zone(0)[const.ZONE_CALCULATION_PROBLEM] is None
    assert issues.deleted == ["zone_not_calculated_0"]


async def test_a_zone_without_an_engine_says_so(issues, monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.calculation.zone_has_engine",
        lambda store, zone: False,
    )
    coordinator = _Coordinator(_zone())
    assert await coordinator.async_calculate_zone(0, {"x": 1}) is None
    assert coordinator.store.get_zone(0)[const.ZONE_CALCULATION_PROBLEM]["code"] == (
        NO_ENGINE
    )


async def test_a_calculation_that_succeeds_clears_it(issues, monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.calculation.zone_has_engine",
        lambda store, zone: True,
    )
    monkeypatch.setattr(
        "custom_components.smart_irrigation.calculation.async_dispatcher_send",
        MagicMock(),
    )
    coordinator = _Coordinator(
        _zone(**{const.ZONE_CALCULATION_PROBLEM: {"code": NO_READINGS}})
    )
    coordinator.calculate_module = AsyncMock(
        return_value={const.ZONE_BUCKET: -4.5, const.ZONE_DURATION: 600}
    )
    coordinator.seasonal_adjustment_manager = MagicMock()
    coordinator.seasonal_adjustment_manager.apply_seasonal_adjustments = AsyncMock(
        side_effect=lambda data, zone_id: data
    )
    coordinator._async_write_calc_record = AsyncMock()
    await coordinator.async_calculate_zone(0, {"x": 1})
    zone = coordinator.store.get_zone(0)
    assert zone[const.ZONE_CALCULATION_PROBLEM] is None
    assert zone[const.ZONE_BUCKET] == -4.5
    assert issues.deleted == ["zone_not_calculated_0"]


# --- the problem sensor ---------------------------------------------------------


def _sensor(zone):
    hass = MagicMock()
    hass.data = {const.DOMAIN: {"coordinator": SimpleNamespace(store=_Store(zone))}}
    sensor = SmartIrrigationZoneProblemBinarySensor(
        hass, "binary_sensor.smart_irrigation_lawn_problem", 0, "Lawn"
    )
    sensor.async_write_ha_state = MagicMock()
    return sensor


def test_the_problem_sensor_is_on_while_the_zone_cannot_be_calculated():
    sensor = _sensor(
        _zone(**{const.ZONE_CALCULATION_PROBLEM: {"code": NO_READINGS, "since": "x"}})
    )
    sensor._async_zone_changed(0)
    assert sensor.is_on
    assert sensor.extra_state_attributes["reason"] == NO_READINGS
    assert sensor.extra_state_attributes["calculation"]["code"] == NO_READINGS


def test_a_valve_problem_comes_first_and_outlasts_the_calculation():
    sensor = _sensor(_zone(**{const.ZONE_CALCULATION_PROBLEM: {"code": NO_READINGS}}))
    sensor._async_problem(SimpleNamespace(data={"zone_id": 0, "reason": "not_open"}))
    assert sensor.extra_state_attributes["reason"] == "not_open"
    store = sensor._hass.data[const.DOMAIN]["coordinator"].store
    store.zones[0][const.ZONE_CALCULATION_PROBLEM] = None
    sensor._async_zone_changed(0)
    assert sensor.is_on and sensor.extra_state_attributes["reason"] == "not_open"
    sensor._async_run_ok(0)
    assert not sensor.is_on


def test_a_manual_zone_shows_no_calculation_problem():
    sensor = _sensor(
        _zone(
            state=const.ZONE_STATE_MANUAL,
            **{const.ZONE_CALCULATION_PROBLEM: {"code": NO_READINGS}},
        )
    )
    sensor._async_zone_changed(0)
    assert not sensor.is_on


# --- every reason has its words ----------------------------------------------------


@pytest.mark.parametrize("language", ["en", "de"])
def test_every_reason_has_a_notice_and_a_status_line(language):
    issues_text = json.loads(
        (ROOT / "translations" / f"{language}.json").read_text(encoding="utf-8")
    )["issues"]
    panel = json.loads(
        (ROOT / "frontend/localize/languages" / f"{language}.json").read_text(
            encoding="utf-8"
        )
    )["panels"]["zones"]["status"]["problem"]
    for code in CODES:
        assert {"title", "description"} <= set(
            issues_text[f"zone_not_calculated_{code}"]
        )
        assert panel[code]


async def test_a_zone_without_a_sensor_group_says_so(issues):
    """A zone added on the Zones tab has none until one is chosen."""
    coordinator = _nightly(_Coordinator(_zone(**{const.ZONE_MAPPING: None})))
    await coordinator._async_calculate_all(delete_weather_data=True)
    assert coordinator.store.get_zone(0)[const.ZONE_CALCULATION_PROBLEM]["code"] == (
        "no_sensor_group"
    )


# --- a restart --------------------------------------------------------------------


@pytest.fixture
def registry(monkeypatch):
    """The notices left in the registry from before the restart."""
    left = {}
    monkeypatch.setattr(
        calc_problem.ir, "async_get", lambda hass: SimpleNamespace(issues=left)
    )
    return left


async def test_a_restart_raises_the_notice_again(issues, registry):
    """A notice does not outlive a restart, the zone's problem does: without
    raising it again, Repairs stayed empty while the panel said it."""
    lawn = _zone(**{const.ZONE_CALCULATION_PROBLEM: {"code": NO_READINGS}})
    coordinator = _Coordinator(lawn)
    await coordinator.async_restore_calculation_issues()
    [(issue_id, kwargs)] = issues.created
    assert issue_id == "zone_not_calculated_0"
    assert kwargs["translation_key"] == "zone_not_calculated_no_readings"


async def test_a_restart_forgets_what_no_longer_applies(issues, registry):
    hedge = _zone(
        state=const.ZONE_STATE_MANUAL,
        **{
            const.ZONE_ID: 1,
            const.ZONE_CALCULATION_PROBLEM: {"code": NO_READINGS},
        },
    )
    # A zone that is gone (a backup restored), and a notice that is not ours.
    registry[(const.DOMAIN, "zone_not_calculated_7")] = object()
    registry[(const.DOMAIN, "zone_not_calculated_1")] = object()
    registry[(const.DOMAIN, "zone_unwatered_7")] = object()
    registry[("other", "zone_not_calculated_7")] = object()
    coordinator = _Coordinator(_zone(), hedge)

    await coordinator.async_restore_calculation_issues()

    assert issues.created == []
    assert coordinator.store.get_zone(1)[const.ZONE_CALCULATION_PROBLEM] is None
    assert "zone_not_calculated_7" in issues.deleted
    assert "zone_unwatered_7" not in issues.deleted
    assert issues.deleted.count("zone_not_calculated_7") == 1


async def test_an_unknown_reason_is_raised_as_an_error(issues, registry):
    coordinator = _Coordinator(
        _zone(**{const.ZONE_CALCULATION_PROBLEM: {"code": "from_a_newer_version"}})
    )
    await coordinator.async_restore_calculation_issues()
    assert issues.created[0][1]["translation_key"] == "zone_not_calculated_error"


async def test_nothing_new_to_read_at_night_is_not_a_failure(issues):
    """The group has readings, and this zone has read them all already (it was
    calculated by hand shortly before): nothing to calculate, as by hand."""
    coordinator = _nightly(_Coordinator(_zone()), readings=[{"Temperature": 20.0}])
    coordinator.apply_aggregates_to_mapping_data = AsyncMock(return_value=None)
    await coordinator._async_calculate_all(delete_weather_data=True)
    assert not coordinator.store.get_zone(0).get(const.ZONE_CALCULATION_PROBLEM)
    assert issues.created == []
    coordinator.async_calculate_zone.assert_not_awaited()


async def test_a_restart_keeps_a_valve_problem_latched_with_a_calculation_one(
    monkeypatch,
):
    """Both on before the restart: the valve problem is still latched after,
    and outlasts the calculation problem clearing."""
    from custom_components.smart_irrigation import binary_sensor

    monkeypatch.setattr(
        binary_sensor.SmartIrrigationZoneBinarySensor,
        "async_added_to_hass",
        AsyncMock(),
        raising=False,
    )
    monkeypatch.setattr(binary_sensor, "async_dispatcher_connect", MagicMock())
    sensor = _sensor(_zone(**{const.ZONE_CALCULATION_PROBLEM: {"code": NO_READINGS}}))
    sensor.async_on_remove = MagicMock()
    sensor.async_get_last_state = AsyncMock(
        return_value=SimpleNamespace(
            state="on",
            attributes={
                "reason": "not_open",
                "valve_reason": "not_open",
                "calculation": {"code": NO_READINGS},
            },
        )
    )
    await sensor.async_added_to_hass()
    assert sensor.is_on and sensor.extra_state_attributes["valve_reason"] == "not_open"

    store = sensor._hass.data[const.DOMAIN]["coordinator"].store
    store.zones[0][const.ZONE_CALCULATION_PROBLEM] = None
    sensor._async_zone_changed(0)
    assert sensor.is_on


async def test_a_restart_with_only_a_calculation_problem_latches_no_valve(
    monkeypatch,
):
    from custom_components.smart_irrigation import binary_sensor

    monkeypatch.setattr(
        binary_sensor.SmartIrrigationZoneBinarySensor,
        "async_added_to_hass",
        AsyncMock(),
        raising=False,
    )
    monkeypatch.setattr(binary_sensor, "async_dispatcher_connect", MagicMock())
    sensor = _sensor(_zone())
    sensor.async_on_remove = MagicMock()
    sensor.async_get_last_state = AsyncMock(
        return_value=SimpleNamespace(
            state="on",
            attributes={
                "reason": NO_READINGS,
                "valve_reason": None,
                "calculation": {"code": NO_READINGS},
            },
        )
    )
    await sensor.async_added_to_hass()
    assert not sensor.is_on
