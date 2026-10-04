"""What an installation is started on, decided once, on its first load.

Two decisions are taken together, because they are the same question: is this
a fresh installation, or one that somebody has already set up?

- **The panel.** An installation that already has zones was configured on a
  panel that showed every setting, and some of those settings were chosen on
  purpose; folding them away would hide decisions its owner made. It stays on
  the advanced panel. A fresh one starts on the standard panel.
- **The form of the equation.** A fresh installation starts on the hourly
  calculation, which is the better arithmetic and now runs everywhere: the sun
  of each hour comes from a sensor, from the weather service's history, or from
  the day's temperature range. An installation that already exists is left
  alone, because switching it would change how long its zones water without
  anybody asking for that.

Either way the answer is written down and belongs to the user from then on.
"""

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.store import (
    STORAGE_KEY,
    STORAGE_VERSION,
    SmartIrrigationStorage,
)

ZONE = {
    const.ZONE_ID: 0,
    const.ZONE_NAME: "Lawn",
    const.ZONE_STATE: "automatic",
    const.ZONE_SIZE: 50.0,
    const.ZONE_THROUGHPUT: 10.0,
    const.ZONE_BUCKET: 0.0,
    const.ZONE_DELTA: 0.0,
    const.ZONE_DURATION: 0,
    const.ZONE_LEAD_TIME: 0,
    const.ZONE_MULTIPLIER: 1.0,
    const.ZONE_MODULE: 0,
    const.ZONE_MAPPING: 0,
}


async def _load(hass, hass_storage, *, zones=None, config=None, stored=True):
    """Load a store over a storage document, as a restart does."""
    if stored:
        hass_storage[STORAGE_KEY] = {
            "version": STORAGE_VERSION,
            "minor_version": 1,
            "key": STORAGE_KEY,
            "data": {
                "config": dict(config or {}),
                "zones": [dict(zone) for zone in (zones or [])],
                "modules": [],
                "mappings": [],
            },
        }
    store = SmartIrrigationStorage(hass)
    await store.async_load()
    return store


@pytest.mark.asyncio
async def test_a_fresh_installation_starts_on_the_standard_panel(hass, hass_storage):
    store = await _load(hass, hass_storage, stored=False)

    assert store.config.ui_mode == const.CONF_UI_MODE_STANDARD


@pytest.mark.asyncio
async def test_a_fresh_installation_starts_on_the_hourly_calculation(
    hass, hass_storage
):
    store = await _load(hass, hass_storage, stored=False)

    assert getattr(store.config, const.CONF_HOURLY_CALCULATION) is True


@pytest.mark.asyncio
async def test_a_fresh_installation_counts_only_the_rain_that_reaches_the_roots(
    hass, hass_storage
):
    store = await _load(hass, hass_storage, stored=False)

    assert getattr(store.config, const.CONF_EFFECTIVE_RAIN) is True


@pytest.mark.asyncio
async def test_an_installation_with_zones_keeps_counting_every_shower(
    hass, hass_storage
):
    """Same rule as the hourly form: nobody's amounts change behind their back."""
    store = await _load(hass, hass_storage, zones=[ZONE])

    assert getattr(store.config, const.CONF_EFFECTIVE_RAIN) is False


@pytest.mark.asyncio
async def test_an_installation_with_zones_keeps_the_advanced_panel(hass, hass_storage):
    store = await _load(hass, hass_storage, zones=[ZONE])

    assert store.config.ui_mode == const.CONF_UI_MODE_ADVANCED


@pytest.mark.asyncio
async def test_an_installation_with_zones_is_not_switched_to_hourly(hass, hass_storage):
    """The point of the whole decision: nobody's watering changes behind their
    back. The hourly form gives different numbers from the daily one."""
    store = await _load(hass, hass_storage, zones=[ZONE])

    assert getattr(store.config, const.CONF_HOURLY_CALCULATION) is False


@pytest.mark.asyncio
async def test_an_existing_installation_that_chose_hourly_keeps_it(hass, hass_storage):
    store = await _load(
        hass,
        hass_storage,
        zones=[ZONE],
        config={const.CONF_HOURLY_CALCULATION: True},
    )

    assert getattr(store.config, const.CONF_HOURLY_CALCULATION) is True


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "mode", [const.CONF_UI_MODE_STANDARD, const.CONF_UI_MODE_ADVANCED]
)
async def test_a_choice_already_made_is_never_revisited(hass, hass_storage, mode):
    """Somebody who switched panels keeps that, zones or no zones, and the
    hourly setting is not touched either: the decision has been taken."""
    store = await _load(
        hass,
        hass_storage,
        config={const.CONF_UI_MODE: mode, const.CONF_HOURLY_CALCULATION: False},
    )

    assert store.config.ui_mode == mode
    assert getattr(store.config, const.CONF_HOURLY_CALCULATION) is False


@pytest.mark.asyncio
async def test_the_decision_survives_the_next_restart(hass, hass_storage):
    """It is written down, so a fresh install does not get re-decided when it
    has zones a day later."""
    first = await _load(hass, hass_storage, stored=False)
    assert first.config.ui_mode == const.CONF_UI_MODE_STANDARD

    await first.async_create_zone(
        {
            const.ZONE_NAME: "Lawn",
            const.ZONE_SIZE: 50.0,
            const.ZONE_THROUGHPUT: 10.0,
            const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        }
    )
    second = await _load(
        hass,
        hass_storage,
        zones=[ZONE],
        config={
            const.CONF_UI_MODE: first.config.ui_mode,
            const.CONF_HOURLY_CALCULATION: True,
        },
    )

    assert second.config.ui_mode == const.CONF_UI_MODE_STANDARD
    assert getattr(second.config, const.CONF_HOURLY_CALCULATION) is True
