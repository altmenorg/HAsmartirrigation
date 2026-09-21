"""One reading of a sensor group's sources, whether one zone or all were asked.

Updating one zone and updating all zones were two copies of the same code that
had drifted apart. The one-zone copy refreshed that zone alone although the
buffer is shared by every zone of the group, and notified the entities with the
whole zone where they compare its id; the all-zones copy never stamped the
group's last update. A pressure marked relative used Home Assistant's height
rather than the site's, and a reading with nothing in it raised on it.
"""

from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import SmartIrrigationCoordinator, const

GROUP = 7


def _coordinator(mapping, zones, sources=(False, True, False), reading=None):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator.hass.config.as_dict.return_value = {"elevation": 0}
    coordinator.use_weather_service = False
    coordinator._elevation = 1000.0
    coordinator.store = MagicMock()
    coordinator.store.get_mapping = MagicMock(return_value=mapping)
    coordinator.store.get_zone = MagicMock(
        side_effect=lambda zid: next(
            (z for z in zones if z[const.ZONE_ID] == zid), None
        )
    )
    coordinator.store.async_get_zones = AsyncMock(return_value=zones)
    coordinator.store.async_get_config = AsyncMock(return_value={})
    coordinator.store.async_update_mapping = AsyncMock()
    coordinator.store.async_update_zone = AsyncMock()
    coordinator.check_mapping_sources = MagicMock(return_value=sources)
    coordinator.build_sensor_values_for_mapping = MagicMock(
        return_value=dict(reading or {const.MAPPING_TEMPERATURE: 18.0})
    )
    coordinator._get_sensor_sourced_keys = MagicMock(return_value=[])
    return coordinator


def _mapping(pressure_type=None):
    conf = {}
    if pressure_type:
        conf[const.MAPPING_PRESSURE] = {const.MAPPING_CONF_PRESSURE_TYPE: pressure_type}
    return {
        const.MAPPING_ID: GROUP,
        const.MAPPING_MAPPINGS: conf,
        const.MAPPING_DATA: [],
    }


ZONES = [
    {const.ZONE_ID: 1, const.ZONE_MAPPING: GROUP, const.ZONE_STATE: "automatic"},
    {const.ZONE_ID: 2, const.ZONE_MAPPING: GROUP, const.ZONE_STATE: "automatic"},
    {const.ZONE_ID: 3, const.ZONE_MAPPING: 99, const.ZONE_STATE: "automatic"},
]


@pytest.fixture
def sent(monkeypatch):
    calls = []
    monkeypatch.setattr(
        "custom_components.smart_irrigation.async_dispatcher_send",
        lambda hass, signal, *args: calls.append((signal, args)),
    )
    return calls


@pytest.mark.asyncio
async def test_updating_one_zone_refreshes_every_zone_of_its_group(sent):
    coordinator = _coordinator(_mapping(), ZONES)

    await coordinator._async_update_zone(1)

    refreshed = [
        call.args[0] for call in coordinator.store.async_update_zone.await_args_list
    ]
    assert refreshed == [1, 2]
    # Entities compare the zone id, not the zone.
    assert [args for signal, args in sent] == [(1,), (2,)]


@pytest.mark.asyncio
async def test_the_group_is_stamped_whichever_update_ran(sent):
    for run in ("one", "all"):
        coordinator = _coordinator(_mapping(), ZONES)
        coordinator._get_unique_mappings_for_automatic_zones = AsyncMock(
            return_value=[GROUP]
        )

        if run == "one":
            await coordinator._async_update_zone(1)
        else:
            await coordinator._async_update_all()

        changes = coordinator.store.async_update_mapping.await_args.args[1]
        assert isinstance(changes[const.MAPPING_DATA_LAST_UPDATED], datetime), run
        assert len(changes[const.MAPPING_DATA]) == 1, run


@pytest.mark.asyncio
async def test_a_relative_pressure_uses_the_sites_height(sent):
    coordinator = _coordinator(
        _mapping(const.MAPPING_CONF_PRESSURE_RELATIVE),
        ZONES,
        reading={const.MAPPING_PRESSURE: 1013.25},
    )

    await coordinator._async_update_zone(1)

    record = coordinator.store.async_update_mapping.await_args.args[1][
        const.MAPPING_DATA
    ][-1]
    # 1000 m (the coordinator's site), not Home Assistant's 0 m.
    assert record[const.MAPPING_PRESSURE] == pytest.approx(900.5, abs=1.0)


@pytest.mark.asyncio
async def test_a_reading_with_nothing_in_it_does_not_raise(sent):
    coordinator = _coordinator(
        _mapping(const.MAPPING_CONF_PRESSURE_RELATIVE),
        ZONES,
        sources=(True, False, False),
    )
    coordinator.use_weather_service = False

    await coordinator._async_update_zone(1)

    coordinator.store.async_update_mapping.assert_not_awaited()


@pytest.mark.asyncio
async def test_continuous_updates_still_skip_sensor_only_groups(sent):
    coordinator = _coordinator(_mapping(), ZONES)
    coordinator.store.async_get_config = AsyncMock(
        return_value={const.CONF_CONTINUOUS_UPDATES: True}
    )
    coordinator._get_unique_mappings_for_automatic_zones = AsyncMock(
        return_value=[GROUP]
    )

    await coordinator._async_update_all()

    coordinator.store.async_update_mapping.assert_not_awaited()


@pytest.mark.asyncio
async def test_an_unknown_zone_is_an_error():
    from custom_components.smart_irrigation.exceptions import SmartIrrigationError

    coordinator = _coordinator(_mapping(), ZONES)

    with pytest.raises(SmartIrrigationError):
        await coordinator._async_update_zone(42)
