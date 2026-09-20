"""What a zone knows has to survive a restart.

Zones are rebuilt from the stored file at startup, field by field, and two were
missing from that list: the calculation explanation and the moment of the last
calculation. So every restart rebuilt the zones without them and the next save
wrote the emptied values back over the file.

The explanation is the only place the water balance shows its work. It
disappeared on every restart and did not come back until the next nightly
calculation. last_calculated was never set on any install at all, which is why
the zone sensor's attribute was always empty.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import SmartIrrigationStorage

STORED = {
    const.ZONE_ID: 1,
    const.ZONE_NAME: "Lawn",
    const.ZONE_SIZE: 50.0,
    const.ZONE_THROUGHPUT: 10.0,
    const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
    const.ZONE_DELTA: -2.0,
    const.ZONE_BUCKET: -2.0,
    const.ZONE_DURATION: 600,
    const.ZONE_MODULE: 1,
    const.ZONE_MULTIPLIER: 1.0,
    const.ZONE_MAPPING: 1,
    const.ZONE_LEAD_TIME: 0.0,
    const.ZONE_EXPLANATION: "Module returned Crop evapotranspiration...",
    const.ZONE_LAST_CALCULATED: "2026-09-20T23:00:00",
    const.ZONE_LAST_UPDATED: "2026-09-20T23:23:45",
}


async def _reload(stored_zone):
    """Rebuild the zones the way a restart does, from the stored file."""
    storage = SmartIrrigationStorage.__new__(SmartIrrigationStorage)
    storage.hass = MagicMock()
    storage.hass.config.units = METRIC_SYSTEM
    await storage._populate_from_data(
        {"config": {}, "zones": [stored_zone], "modules": [], "mappings": []}
    )
    return storage.zones[1]


@pytest.mark.asyncio
async def test_the_explanation_survives():
    """The bug, stated as a test."""
    zone = await _reload(STORED)

    assert zone.explanation == STORED[const.ZONE_EXPLANATION]


@pytest.mark.asyncio
async def test_the_last_calculation_survives():
    zone = await _reload(STORED)

    assert zone.last_calculated == STORED[const.ZONE_LAST_CALCULATED]


@pytest.mark.asyncio
async def test_a_zone_that_has_neither_still_loads():
    """An install upgrading has no stored value for either."""
    bare = {
        k: v
        for k, v in STORED.items()
        if k
        not in (
            const.ZONE_EXPLANATION,
            const.ZONE_LAST_CALCULATED,
        )
    }

    zone = await _reload(bare)

    assert zone.explanation is None
    assert zone.last_calculated is None
    assert zone.name == "Lawn"
