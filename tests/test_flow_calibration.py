"""The measured flow has to be advisory: reported, never applied."""

from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.flow_calibration import (
    MIN_RUN_SECONDS,
    FlowCalibrationMixin,
)


class _Coordinator(FlowCalibrationMixin):
    def __init__(self, hass, store):
        self.hass = hass
        self.store = store


@pytest.fixture
def issues(monkeypatch):
    """Capture the repair issues instead of touching a real registry."""
    recorded = SimpleNamespace(created=[], deleted=[])
    monkeypatch.setattr(
        "custom_components.smart_irrigation.flow_calibration.ir.async_create_issue",
        lambda hass, domain, issue_id, **kwargs: recorded.created.append(
            (issue_id, kwargs)
        ),
    )
    monkeypatch.setattr(
        "custom_components.smart_irrigation.flow_calibration.ir.async_delete_issue",
        lambda hass, domain, issue_id: recorded.deleted.append(issue_id),
    )
    return recorded


def _make_hass(metric=True):
    hass = Mock()
    hass.config = Mock()
    hass.config.units = METRIC_SYSTEM if metric else Mock()
    return hass


def _zone(**overrides):
    zone = {
        const.ZONE_ID: 0,
        const.ZONE_NAME: "Lawn",
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MEASURED_THROUGHPUT: None,
        const.ZONE_MEASURED_THROUGHPUT_SAMPLES: 0,
    }
    zone.update(overrides)
    return zone


def _coord(zone, metric=True):
    store = Mock()
    store.get_zone = Mock(return_value=zone)
    store.async_update_zone = AsyncMock()
    return _Coordinator(_make_hass(metric), store), store


async def test_a_short_run_teaches_us_nothing(issues):
    """Pipe fill and valve lag dominate, so the apparent flow would be low."""
    coord, store = _coord(_zone())

    await coord.async_record_measured_flow(0, volume_l=5.0, seconds=MIN_RUN_SECONDS - 1)

    store.async_update_zone.assert_not_awaited()
    assert not issues.created


async def test_an_empty_run_teaches_us_nothing(issues):
    coord, store = _coord(_zone())

    await coord.async_record_measured_flow(0, volume_l=0.0, seconds=600)

    store.async_update_zone.assert_not_awaited()


async def test_the_first_run_sets_the_measurement(issues):
    """50 L in 10 minutes is 5 L/min, whatever the zone claims."""
    coord, store = _coord(_zone())

    await coord.async_record_measured_flow(0, volume_l=50.0, seconds=600)

    written = store.async_update_zone.await_args.args[1]
    assert written[const.ZONE_MEASURED_THROUGHPUT] == 5.0
    assert written[const.ZONE_MEASURED_THROUGHPUT_SAMPLES] == 1


async def test_a_later_run_is_smoothed_against_the_running_value(issues):
    """One odd run moves the estimate, it does not replace it."""
    coord, store = _coord(
        _zone(
            **{
                const.ZONE_MEASURED_THROUGHPUT: 10.0,
                const.ZONE_MEASURED_THROUGHPUT_SAMPLES: 4,
            }
        )
    )

    # A run that looks like 5 L/min against a running value of 10.
    await coord.async_record_measured_flow(0, volume_l=50.0, seconds=600)

    written = store.async_update_zone.await_args.args[1]
    assert written[const.ZONE_MEASURED_THROUGHPUT] == pytest.approx(8.5)
    assert written[const.ZONE_MEASURED_THROUGHPUT_SAMPLES] == 5


async def test_we_stay_quiet_until_we_have_seen_enough_runs(issues):
    coord, _ = _coord(_zone())

    # Way off, but a single run is not evidence.
    await coord.async_record_measured_flow(0, volume_l=50.0, seconds=600)

    assert not issues.created


async def test_a_persistent_mismatch_is_reported(issues):
    coord, _ = _coord(
        _zone(
            **{
                const.ZONE_MEASURED_THROUGHPUT: 5.0,
                const.ZONE_MEASURED_THROUGHPUT_SAMPLES: 3,
            }
        )
    )

    await coord.async_record_measured_flow(0, volume_l=50.0, seconds=600)

    assert len(issues.created) == 1
    issue_id, kwargs = issues.created[0]
    assert issue_id == "throughput_mismatch_0"
    assert kwargs["is_fixable"] is False
    placeholders = kwargs["translation_placeholders"]
    assert placeholders["zone"] == "Lawn"
    assert placeholders["configured"] == "10.00"
    assert placeholders["measured"] == "5.00"


async def test_a_measurement_that_agrees_clears_the_advisory(issues):
    coord, _ = _coord(
        _zone(
            **{
                const.ZONE_MEASURED_THROUGHPUT: 10.0,
                const.ZONE_MEASURED_THROUGHPUT_SAMPLES: 3,
            }
        )
    )

    await coord.async_record_measured_flow(0, volume_l=100.0, seconds=600)

    assert not issues.created
    assert issues.deleted == ["throughput_mismatch_0"]


async def test_an_unconfigured_throughput_is_someone_else_s_problem(issues):
    """A zone with no throughput cannot produce a duration at all."""
    coord, _ = _coord(
        _zone(
            **{
                const.ZONE_THROUGHPUT: 0.0,
                const.ZONE_MEASURED_THROUGHPUT: 5.0,
                const.ZONE_MEASURED_THROUGHPUT_SAMPLES: 3,
            }
        )
    )

    await coord.async_record_measured_flow(0, volume_l=50.0, seconds=600)

    assert not issues.created
    assert not issues.deleted


async def test_the_measurement_lands_in_the_user_s_own_unit(issues):
    """An imperial zone stores gal/min, so the measurement must too."""
    coord, store = _coord(_zone(), metric=False)

    # 50 L over 10 minutes == 5 L/min == ~1.32 gal/min.
    await coord.async_record_measured_flow(0, volume_l=50.0, seconds=600)

    written = store.async_update_zone.await_args.args[1]
    assert written[const.ZONE_MEASURED_THROUGHPUT] == pytest.approx(1.321, abs=0.002)


async def test_the_zone_s_throughput_is_never_touched(issues):
    """The whole point: we report, the user decides."""
    coord, store = _coord(
        _zone(
            **{
                const.ZONE_MEASURED_THROUGHPUT: 5.0,
                const.ZONE_MEASURED_THROUGHPUT_SAMPLES: 3,
            }
        )
    )

    await coord.async_record_measured_flow(0, volume_l=50.0, seconds=600)

    for call in store.async_update_zone.await_args_list:
        assert const.ZONE_THROUGHPUT not in call.args[1]


def test_removing_a_zone_drops_its_advisory(issues):
    coord, _ = _coord(_zone())

    coord.async_clear_throughput_issue(3)

    assert issues.deleted == ["throughput_mismatch_3"]


async def test_a_zone_entered_as_a_rate_is_not_told_its_throughput_is_wrong(issues):
    """It waters by its rate; the throughput it stores from its creation is
    hidden and unused, and flagging it pointed at a value nobody can see."""
    coord, store = _coord(
        _zone(
            **{
                const.ZONE_INPUT_METHOD: const.ZONE_INPUT_METHOD_PRECIPITATION_RATE,
                const.ZONE_MEASURED_THROUGHPUT: 5.0,
                const.ZONE_MEASURED_THROUGHPUT_SAMPLES: 10,
            }
        )
    )

    # 5 L/min measured against 10 configured: half, far past the tolerance.
    await coord.async_record_measured_flow(0, volume_l=50.0, seconds=600)

    assert not issues.created
    assert "throughput_mismatch_0" in issues.deleted
