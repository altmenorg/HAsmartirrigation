"""A zone save carries only what the edit changed, and cannot revert a calculation.

The panel used to POST the whole zone it held on every edit. Its copy dated from
when the page was loaded, so a page left open across the nightly calculation
wrote the calculation's results back to what they were before it: the bucket,
the explanation, the last calculation time. The panel sends the changed fields
now, the store has to take a zone update that carries one field, and the fields
the calculation writes are ignored if a panel still cached in a browser posts
them anyway.
"""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import SmartIrrigationStorage
from custom_components.smart_irrigation.websockets import (
    SERVER_OWNED_ZONE_FIELDS,
    _without_server_owned_fields,
)


async def _store_with_a_zone(hass, **zone):
    store = SmartIrrigationStorage(hass)
    await store.async_load()
    created = await store.async_create_zone(
        {
            const.ZONE_NAME: "Lawn",
            const.ZONE_SIZE: 50.0,
            const.ZONE_THROUGHPUT: 10.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
            **zone,
        }
    )
    return store, created[const.ZONE_ID]


@pytest.mark.asyncio
async def test_a_single_field_changes_that_field_only(hass):
    store, zone_id = await _store_with_a_zone(hass, **{const.ZONE_BUCKET: -6.5})

    updated = await store.async_update_zone(zone_id, {const.ZONE_NAME: "Front lawn"})

    assert updated[const.ZONE_NAME] == "Front lawn"
    assert updated[const.ZONE_BUCKET] == -6.5
    assert updated[const.ZONE_SIZE] == 50.0


@pytest.mark.asyncio
async def test_a_maximum_bucket_can_be_sent_without_the_bucket(hass):
    """It raised a KeyError, which failed the save."""
    store, zone_id = await _store_with_a_zone(hass, **{const.ZONE_BUCKET: 3.0})

    updated = await store.async_update_zone(zone_id, {const.ZONE_MAXIMUM_BUCKET: 2.0})

    assert updated[const.ZONE_MAXIMUM_BUCKET] == 2.0
    # Still capped at the new maximum, from the bucket the zone already had.
    assert updated[const.ZONE_BUCKET] == 2.0


@pytest.mark.asyncio
async def test_a_bucket_sent_alone_is_capped_at_the_zones_maximum(hass):
    store, zone_id = await _store_with_a_zone(hass, **{const.ZONE_MAXIMUM_BUCKET: 5.0})

    updated = await store.async_update_zone(zone_id, {const.ZONE_BUCKET: 9.0})

    assert updated[const.ZONE_BUCKET] == 5.0


@pytest.mark.asyncio
async def test_a_cleared_sensor_is_cleared(hass):
    """The panel sends null for a field it cleared; it used to be dropped."""
    store, zone_id = await _store_with_a_zone(
        hass, **{const.ZONE_FLOW_SENSOR: "sensor.meter"}
    )

    updated = await store.async_update_zone(zone_id, {const.ZONE_FLOW_SENSOR: None})

    assert updated[const.ZONE_FLOW_SENSOR] is None


@pytest.mark.parametrize(
    "field",
    [
        const.ZONE_LAST_CALCULATED,
        const.ZONE_LAST_UPDATED,
        const.ZONE_EXPLANATION,
        const.ZONE_DELTA,
        const.ZONE_ET_DEFICIENCY,
        const.ZONE_CURRENT_DRAINAGE,
        const.ZONE_NUMBER_OF_DATA_POINTS,
    ],
)
def test_what_the_calculation_writes_is_not_taken_from_a_zone_save(field):
    """A stale copy posted by a cached panel must not revert the calculation."""
    assert field in SERVER_OWNED_ZONE_FIELDS
    posted = {const.ZONE_ID: 1, const.ZONE_NAME: "Lawn", field: None}

    assert _without_server_owned_fields(posted) == {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
    }


def test_the_bucket_stays_editable():
    """It has an input in the panel, so a save must still carry it."""
    assert const.ZONE_BUCKET not in SERVER_OWNED_ZONE_FIELDS
