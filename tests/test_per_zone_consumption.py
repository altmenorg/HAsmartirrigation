"""A sensor group's buffer belongs to every zone reading it.

Calculating one zone used to empty that buffer. Two zones on the same group
therefore raced: whichever calculated first consumed the readings, and the
other computed its water balance from whatever had arrived since, which is
less than it was owed. It under-watered, silently, with nothing in the log.

Each zone now reads only what arrived after its own watermark, and the buffer
loses only what every zone has passed.
"""

from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin

# Relative to the real clock, not a fixed date: pruning caps readings at a week
# against ``datetime.now()``, so a hardcoded NOW quietly turns every reading here
# into one older than the cap, and these tests start passing or failing by the
# calendar rather than by the code.
NOW = datetime.now()


def _reading(minutes_ago, value=1.0):
    return {
        const.MAPPING_TEMPERATURE: value,
        const.RETRIEVED_AT: (NOW - timedelta(minutes=minutes_ago)).isoformat(),
    }


def _rain_reading(minutes_ago, total):
    """A cumulative rain gauge: its reading is a running total, not a rainfall."""
    return {
        const.MAPPING_PRECIPITATION: total,
        const.RETRIEVED_AT: (NOW - timedelta(minutes=minutes_ago)).isoformat(),
    }


def _zone(zone_id, consumed_minutes_ago=None, state=const.ZONE_STATE_AUTOMATIC):
    return {
        const.ZONE_ID: zone_id,
        const.ZONE_NAME: f"Zone {zone_id}",
        const.ZONE_STATE: state,
        const.ZONE_MAPPING: 1,
        const.ZONE_LAST_CONSUMED_AT: (
            None
            if consumed_minutes_ago is None
            else (NOW - timedelta(minutes=consumed_minutes_ago)).isoformat()
        ),
    }


class _Coordinator(CalculationMixin):
    def __init__(self, readings, zones):
        self.hass = MagicMock()
        self.store = MagicMock()
        self.store.get_mapping = MagicMock(
            return_value={const.MAPPING_ID: 1, const.MAPPING_DATA: list(readings)}
        )
        self.store.async_get_zones = AsyncMock(return_value=zones)
        self.store.async_update_mapping = AsyncMock()


class TestTheWindow:
    def test_a_zone_that_has_never_read_takes_everything(self):
        readings = [_reading(120), _reading(10)]

        assert CalculationMixin._readings_after(readings, None) == readings

    def test_only_what_arrived_after_the_watermark_is_read(self):
        """Reading a sample twice would count the same evaporation twice."""
        readings = [_reading(120), _reading(90), _reading(10)]

        window = CalculationMixin._readings_after(readings, NOW - timedelta(minutes=60))

        assert len(window) == 1
        assert window[0] == readings[-1]

    def test_a_reading_with_no_usable_timestamp_is_kept(self):
        """Counting it twice waters slightly too much; dropping it silently
        waters too little and leaves nothing to notice."""
        readings = [{const.MAPPING_TEMPERATURE: 12.0}, _reading(10)]

        window = CalculationMixin._readings_after(readings, NOW - timedelta(minutes=60))

        assert len(window) == 2

    def test_a_zone_with_no_watermark_starts_from_nothing(self):
        assert CalculationMixin.zone_window_start(_zone(1)) is None

    def test_a_zone_with_a_watermark_starts_from_it(self):
        start = CalculationMixin.zone_window_start(_zone(1, consumed_minutes_ago=30))

        assert start == NOW - timedelta(minutes=30)

    def test_an_unreadable_watermark_falls_back_to_taking_everything(self):
        zone = {const.ZONE_LAST_CONSUMED_AT: "not a timestamp"}

        assert CalculationMixin.zone_window_start(zone) is None


class TestPruning:
    @pytest.mark.asyncio
    async def test_a_sibling_that_has_not_read_keeps_the_readings(self):
        """The bug, stated as a test: zone 2 must still have its history."""
        readings = [_reading(120), _reading(10)]
        zones = [_zone(1, consumed_minutes_ago=0), _zone(2, consumed_minutes_ago=180)]
        coord = _Coordinator(readings, zones)

        await coord.prune_consumed_readings(1)

        # Zone 2 last read three hours ago, so both readings are still owed to
        # it and nothing may be dropped.
        coord.store.async_update_mapping.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_a_zone_that_has_never_read_holds_everything(self):
        coord = _Coordinator([_reading(120)], [_zone(1), _zone(2, 0)])

        await coord.prune_consumed_readings(1)

        coord.store.async_update_mapping.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_what_every_zone_has_passed_is_dropped(self):
        readings = [_reading(120), _reading(90), _reading(10)]
        zones = [_zone(1, consumed_minutes_ago=60), _zone(2, consumed_minutes_ago=30)]
        coord = _Coordinator(readings, zones)

        await coord.prune_consumed_readings(1)

        kept = coord.store.async_update_mapping.await_args.kwargs["changes"]
        # The unread one, plus the reading before the cutoff kept as the
        # baseline the next delta is measured from. The one before that is
        # consumed and no longer a baseline, so it goes.
        assert kept[const.MAPPING_DATA] == [readings[1], readings[2]]

    @pytest.mark.asyncio
    async def test_a_disabled_zone_does_not_pin_the_buffer(self):
        """It is not calculating, so letting it hold the buffer would grow the
        store without end."""
        readings = [_reading(120), _reading(90), _reading(10)]
        zones = [
            _zone(1, consumed_minutes_ago=30),
            _zone(2, consumed_minutes_ago=600, state=const.ZONE_STATE_DISABLED),
        ]
        coord = _Coordinator(readings, zones)

        await coord.prune_consumed_readings(1)

        kept = coord.store.async_update_mapping.await_args.kwargs["changes"]
        assert kept[const.MAPPING_DATA] == [readings[1], readings[2]]

    @pytest.mark.asyncio
    async def test_every_field_keeps_its_own_baseline(self):
        """Rows are sparse: a sensor writes the one field that changed.

        Keeping only the newest consumed row would leave every other field
        measuring its next delta from nothing.
        """
        readings = [
            _reading(300),
            _rain_reading(200, 4.0),
            _reading(90),
            _reading(10),
        ]
        zones = [_zone(1, consumed_minutes_ago=60)]
        coord = _Coordinator(readings, zones)

        await coord.prune_consumed_readings(1)

        kept = coord.store.async_update_mapping.await_args.kwargs["changes"][
            const.MAPPING_DATA
        ]
        # The rain gauge's last total survives even though two temperature
        # readings are newer than it.
        assert kept == [readings[1], readings[2], readings[3]]

    @pytest.mark.asyncio
    async def test_an_empty_group_is_left_alone(self):
        coord = _Coordinator([], [_zone(1, 0)])
        coord.store.get_mapping = MagicMock(
            return_value={const.MAPPING_ID: 1, const.MAPPING_DATA: []}
        )

        await coord.prune_consumed_readings(1)

        coord.store.async_update_mapping.assert_not_awaited()

    @pytest.mark.asyncio
    async def test_nothing_is_written_when_nothing_would_be_dropped(self):
        readings = [_reading(10)]
        coord = _Coordinator(readings, [_zone(1, consumed_minutes_ago=60)])

        await coord.prune_consumed_readings(1)

        coord.store.async_update_mapping.assert_not_awaited()


class TestCalculatingOneZone:
    """The original defect: calculating zone 1 emptied the whole group."""

    @pytest.mark.asyncio
    async def test_it_records_a_watermark_instead_of_clearing_the_group(
        self, monkeypatch
    ):
        monkeypatch.setattr(
            "custom_components.smart_irrigation.calculation.async_dispatcher_send",
            lambda *a, **k: None,
        )
        zone = _zone(1)
        coord = _Coordinator([_reading(10)], [zone, _zone(2)])
        coord.store.get_zone = MagicMock(return_value=zone)
        coord.store.async_update_zone = AsyncMock()
        coord.calculate_module = AsyncMock(return_value={const.ZONE_BUCKET: -3.0})
        coord.seasonal_adjustment_manager = MagicMock()
        coord.seasonal_adjustment_manager.apply_seasonal_adjustments = AsyncMock(
            side_effect=lambda data, zone_id: data
        )

        await coord.async_calculate_zone(1, {"x": 1}, delete_weather_data=True)

        written = coord.store.async_update_zone.await_args.args[1]
        assert written[const.ZONE_LAST_CONSUMED_AT] is not None
        # The group keeps its readings: zone 2 has not read them.
        for call in coord.store.async_update_mapping.await_args_list:
            assert call.kwargs.get("changes", {}).get(const.MAPPING_DATA) != []
