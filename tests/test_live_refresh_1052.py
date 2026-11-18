"""The live bucket entity shows what Home > Now shows, as soon as it is known.

#1052: Home > Now said 5.9 mm while ``sensor.<zone>_live_bucket`` still said
5.1 mm. The page computes its estimates whenever it refreshes, over every
reading collected so far. The entity recomputed only when its zone changed, and
a reading of a local rain gauge is only appended to the group's buffer: the
zone changes at the next group update, often the hourly weather fetch. A
second change within thirty seconds of the last was dropped, not deferred.

Now a collected reading asks the coordinator for a refresh, at most one per
thirty seconds for the whole integration with the requests in between folded
into one at its end, and every fresh set of estimates, whoever asked for it,
is published to the entities. The page and the entity read the same set.
"""

from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import (
    SmartIrrigationCoordinator,
    const,
    live_estimate,
)
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.live_estimate import (
    LIVE_REFRESH_MIN_INTERVAL,
    LiveEstimateMixin,
)
from custom_components.smart_irrigation.sensor import (
    SmartIrrigationZoneLiveBucketSensor,
)

ZONE = {
    const.ZONE_ID: 1,
    const.ZONE_NAME: "Lawn",
    const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
    const.ZONE_MAPPING: 7,
    const.ZONE_BUCKET: 5.1,
    const.ZONE_LAST_CALCULATED: None,
}


class _Coordinator(LiveEstimateMixin, CalculationMixin):
    """The estimate side of the coordinator, over a buffer that can grow.

    The bucket it estimates is the committed one plus the rain in the buffer,
    which is all a rain gauge does to it.
    """

    def __init__(self):
        self.clock = {"t": 1000.0}
        self.tasks = []
        self.timers = []
        self.hass = Mock()
        self.hass.config.units = METRIC_SYSTEM
        self.hass.loop.time = lambda: self.clock["t"]
        self.hass.async_create_task = self.tasks.append
        self.readings = []
        self.mapping = {const.MAPPING_ID: 7, const.MAPPING_DATA: self.readings}
        self.zone = dict(ZONE)
        self.store = Mock()
        self.store.get_mapping = Mock(return_value=self.mapping)
        self.store.get_zone = Mock(side_effect=lambda _id: self.zone)
        self.store.async_get_zones = AsyncMock(side_effect=lambda: [self.zone])
        self.store.async_get_modules = AsyncMock(return_value=[])
        self.store.async_get_config = AsyncMock(return_value={})

        async def aggregate(mapping, persist=True, since=None):
            rain = sum(r.get(const.MAPPING_PRECIPITATION, 0.0) for r in self.readings)
            return {const.MAPPING_PRECIPITATION: rain} if self.readings else None

        async def calculate(zone, weatherdata, forecastdata):
            self.calculations += 1
            bucket = zone[const.ZONE_BUCKET] + weatherdata[const.MAPPING_PRECIPITATION]
            return {
                const.ZONE_BUCKET: bucket,
                const.ZONE_DELTA: 0.0,
                const.ZONE_DURATION: 0,
            }

        self.calculations = 0
        self.apply_aggregates_to_mapping_data = aggregate
        self.calculate_module = calculate
        self._cached_forecast_for = AsyncMock(return_value=None)

    def rain(self, mm):
        self.readings.append({const.MAPPING_PRECIPITATION: mm})

    async def run_tasks(self):
        while self.tasks:
            await self.tasks.pop(0)

    def fire_timer(self):
        _hass, delay, action = self.timers.pop(0)
        self.clock["t"] += delay
        action(None)


@pytest.fixture
def wired():
    """A coordinator, its zone's entity, and the dispatcher between them."""
    coord = _Coordinator()
    entity_hass = MagicMock()
    entity_hass.config.units = METRIC_SYSTEM
    entity_hass.data = {const.DOMAIN: {"coordinator": coord}}
    with patch("custom_components.smart_irrigation.sensor.async_dispatcher_connect"):
        entity = SmartIrrigationZoneLiveBucketSensor(
            entity_hass,
            "sensor.smart_irrigation_lawn_live_bucket",
            1,
            "Lawn",
            "live_bucket",
            const.ZONE_BUCKET,
        )
    entity.hass = entity_hass
    entity.async_schedule_update_ha_state = MagicMock()
    published = []

    def send(_hass, signal, estimates):
        assert signal == live_estimate.SIGNAL_LIVE_ESTIMATES
        published.append(estimates)
        entity._async_estimates_published(estimates)

    def call_later(hass, delay, action):
        coord.timers.append((hass, delay, action))
        return MagicMock()

    with (
        patch.object(live_estimate, "async_dispatcher_send", send),
        patch.object(live_estimate, "async_call_later", call_later),
    ):
        yield coord, entity, published


async def _home_now(coord):
    """What Home > Now shows: the bucket of the shared set (websockets.py)."""
    return (await coord.async_estimate_all_zones_now())["1"]["bucket"]


@pytest.mark.asyncio
async def test_a_rain_reading_reaches_the_entity_without_a_zone_change(wired):
    """The reported case: only the gauge moved, the zone did not."""
    coord, entity, _published = wired
    coord.rain(0.0)
    coord.async_request_live_refresh()
    await coord.run_tasks()
    assert entity.native_value == pytest.approx(5.1)

    coord.clock["t"] += LIVE_REFRESH_MIN_INTERVAL + 1
    coord.rain(0.8)
    coord.async_request_live_refresh()
    await coord.run_tasks()

    assert entity.native_value == pytest.approx(5.9)
    assert entity.extra_state_attributes["live"] is True
    assert entity.native_value == pytest.approx(await _home_now(coord))


@pytest.mark.asyncio
async def test_a_refresh_by_the_info_page_updates_the_entity_too(wired):
    """Whoever asks, the entity gets the set: no second computation needed."""
    coord, entity, _published = wired
    coord.rain(0.8)

    home = await _home_now(coord)

    assert entity.native_value == pytest.approx(home) == pytest.approx(5.9)
    assert coord.calculations == 1


@pytest.mark.asyncio
async def test_readings_within_thirty_seconds_are_folded_not_dropped(wired):
    """They used to be dropped, which left the entity on the reading before."""
    coord, entity, _published = wired
    coord.rain(0.2)
    coord.async_request_live_refresh()
    await coord.run_tasks()
    assert coord.calculations == 1

    for _ in range(10):  # a fast gauge, every three seconds
        coord.clock["t"] += 3
        coord.rain(0.1)
        coord.async_request_live_refresh()
    await coord.run_tasks()

    assert coord.calculations == 1, "nothing within the thirty seconds"
    assert len(coord.timers) == 1, "one refresh planned for all of them"
    assert coord.timers[0][1] == pytest.approx(LIVE_REFRESH_MIN_INTERVAL - 3)

    coord.fire_timer()
    await coord.run_tasks()

    assert coord.calculations == 2
    assert entity.native_value == pytest.approx(5.1 + 0.2 + 1.0)
    assert entity.native_value == pytest.approx(await _home_now(coord))


@pytest.mark.asyncio
async def test_a_request_during_a_refresh_runs_once_more_after_it(wired):
    coord, _entity, _published = wired
    coord.rain(0.2)
    coord.async_request_live_refresh()
    coord.async_request_live_refresh()  # still running: the task is not awaited
    assert len(coord.tasks) == 1

    await coord.run_tasks()

    assert len(coord.timers) == 1, "the second one, thirty seconds later"
    assert coord.timers[0][1] == pytest.approx(LIVE_REFRESH_MIN_INTERVAL)


@pytest.mark.asyncio
async def test_a_reused_set_is_still_published_to_whoever_asked(wired):
    """Nothing changed since the page computed it: reused, and still sent."""
    coord, _entity, published = wired
    coord.rain(0.2)
    await coord.async_estimate_all_zones_now()
    assert len(published) == 1

    coord.clock["t"] += LIVE_REFRESH_MIN_INTERVAL + 1
    coord.async_request_live_refresh()
    await coord.run_tasks()

    assert coord.calculations == 1
    assert len(published) == 2


@pytest.mark.asyncio
async def test_no_weather_service_is_asked(wired):
    """A refresh only reads the buffer and the forecast already in hand."""
    coord, _entity, _published = wired
    coord.rain(0.2)
    coord.async_update_all = AsyncMock()
    coord._WeatherServiceClient = MagicMock()

    coord.async_request_live_refresh()
    await coord.run_tasks()

    coord.async_update_all.assert_not_awaited()
    assert coord._WeatherServiceClient.method_calls == []


@pytest.mark.asyncio
async def test_unload_drops_a_planned_refresh(wired):
    coord, _entity, _published = wired
    coord.rain(0.2)
    coord.async_request_live_refresh()
    await coord.run_tasks()
    coord.async_request_live_refresh()
    cancel = coord._live_refresh_cancel

    coord.async_cancel_live_refresh()

    cancel.assert_called_once_with()
    assert coord._live_refresh_cancel is None


def _mapping(mapping_id, entity):
    return {
        const.MAPPING_ID: mapping_id,
        const.MAPPING_DATA: [],
        const.MAPPING_MAPPINGS: {
            const.MAPPING_PRECIPITATION: {
                const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR,
                const.MAPPING_CONF_SENSOR: entity,
            },
        },
    }


def _sensor_coordinator(mappings):
    coordinator = SmartIrrigationCoordinator.__new__(SmartIrrigationCoordinator)
    coordinator.hass = MagicMock()
    coordinator._debounced_update_cancel = {}
    coordinator.async_request_live_refresh = MagicMock()
    coordinator.store = MagicMock()
    coordinator.store.async_get_config = AsyncMock(
        return_value={const.CONF_SENSOR_DEBOUNCE: 0}
    )
    coordinator.store.async_get_mappings = AsyncMock(return_value=mappings)
    coordinator.store.async_update_mapping = AsyncMock()
    coordinator._sensor_reading_to_metric = lambda key, val, state, obj: float(state)
    coordinator.async_continuous_update_for_mapping = AsyncMock()
    return coordinator


def _event(entity, state):
    new_state = MagicMock()
    new_state.state = state
    event = MagicMock()
    event.data = {"entity_id": entity, "new_state": new_state}
    return event


@pytest.mark.asyncio
async def test_a_collected_reading_asks_for_a_refresh():
    coordinator = _sensor_coordinator(
        [_mapping(0, "sensor.gauge"), _mapping(1, "sensor.gauge")]
    )

    await coordinator.async_sensor_state_changed(_event("sensor.gauge", "0.4"))

    assert coordinator.store.async_update_mapping.await_count == 2
    coordinator.async_request_live_refresh.assert_called_once_with()


@pytest.mark.asyncio
async def test_a_reading_left_out_or_of_no_group_asks_nothing():
    coordinator = _sensor_coordinator([_mapping(0, "sensor.gauge")])

    await coordinator.async_sensor_state_changed(_event("sensor.other", "0.4"))
    await coordinator.async_sensor_state_changed(_event("sensor.gauge", "garbage"))

    coordinator.async_request_live_refresh.assert_not_called()
