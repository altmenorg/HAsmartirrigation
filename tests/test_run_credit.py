"""A run is credited with the water it was sized to deliver.

- A zone with no maximum duration (-1) had every direct valve run credited
  with -1 second: the maximum was read as a cap whatever its sign, so the
  bucket never refilled and the zone was watered again at every start.
- A zone entered as a precipitation rate was credited from its size and
  throughput, values the panel asks for when the zone is created and then
  hides, while its duration came from the rate: a run credited something
  other than what it had been sized to deliver.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const


def _coordinator(zone):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.units = METRIC_SYSTEM
    coordinator.store = MagicMock()
    coordinator.store.get_zone = MagicMock(return_value=zone)
    coordinator.store.async_update_zone = AsyncMock()
    coordinator._record_irrigation_run = AsyncMock()
    return coordinator


def _zone(**extra):
    zone = {
        const.ZONE_ID: 0,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        # 10 L/min over 10 m2 is 60 mm/h.
        const.ZONE_SIZE: 10.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_BUCKET: -5.0,
        const.ZONE_MAXIMUM_BUCKET: 50.0,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_LEAD_TIME: 0,
    }
    zone.update(extra)
    return zone


def _bucket_after(coordinator):
    return coordinator.store.async_update_zone.await_args.args[1][const.ZONE_BUCKET]


@pytest.fixture(autouse=True)
def _no_dispatch(monkeypatch):
    monkeypatch.setattr(
        "custom_components.smart_irrigation.observed_watering.async_dispatcher_send",
        lambda *args: None,
    )


@pytest.mark.asyncio
@pytest.mark.parametrize("maximum", [-1, None])
async def test_no_maximum_duration_credits_the_whole_run(maximum):
    """5 minutes at 60 mm/h is 5 mm."""
    coordinator = _coordinator(_zone(**{const.ZONE_MAXIMUM_DURATION: maximum}))

    await coordinator._credit_direct_run(0, 300)

    assert _bucket_after(coordinator) == pytest.approx(0.0)


@pytest.mark.asyncio
async def test_a_maximum_still_caps_the_credit():
    coordinator = _coordinator(_zone(**{const.ZONE_MAXIMUM_DURATION: 120}))

    await coordinator._credit_direct_run(0, 300)

    # 2 minutes at 60 mm/h.
    assert _bucket_after(coordinator) == pytest.approx(-5.0 + 2.0)


RATE_ZONE = {
    const.ZONE_INPUT_METHOD: const.ZONE_INPUT_METHOD_PRECIPITATION_RATE,
    # What the zone waters at, 12 mm/h; size and throughput, still stored from
    # when the zone was created, would say 60.
    const.ZONE_PRECIPITATION_RATE: 12.0,
}


@pytest.mark.asyncio
async def test_a_timed_run_on_a_rate_zone_credits_its_rate():
    coordinator = _coordinator(_zone(**RATE_ZONE))

    await coordinator._credit_observed_watering(0, 1500)

    # 25 minutes at 12 mm/h is 5 mm.
    assert _bucket_after(coordinator) == pytest.approx(0.0)


@pytest.mark.asyncio
async def test_a_direct_run_on_a_rate_zone_credits_its_rate():
    coordinator = _coordinator(_zone(**RATE_ZONE))

    await coordinator._credit_direct_run(0, 1500)

    assert _bucket_after(coordinator) == pytest.approx(0.0)


@pytest.mark.asyncio
async def test_the_credit_matches_the_duration_that_was_calculated():
    """Water the duration the bucket asked for, and the bucket is back at 0."""
    for extra in ({}, RATE_ZONE):
        zone = _zone(**extra)
        coordinator = _coordinator(zone)
        duration = coordinator.duration_from_bucket(zone, zone[const.ZONE_BUCKET])

        await coordinator._credit_observed_watering(0, duration)

        assert _bucket_after(coordinator) == pytest.approx(0.0, abs=0.01)


@pytest.mark.asyncio
async def test_a_metered_volume_is_still_spread_over_the_area():
    """The flow meter path knows the litres, not the time."""
    coordinator = _coordinator(_zone())

    await coordinator._credit_from_volume(0, 50.0)

    # 50 L over 10 m2 is 5 mm.
    assert _bucket_after(coordinator) == pytest.approx(0.0)
