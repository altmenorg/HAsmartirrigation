"""A sensor group fed every minute must not hold up Home Assistant (#1064).

A group read every minute by a few sensors keeps tens of thousands of readings
over a week. Three things made each pass over them cost seconds of the event
loop: the day split read the whole buffer again for every day, the hourly sum
rebuilt the list of timestamps for every hour, and the store copied every
reading each time a group was handed out. The heavy passes also run in a worker
thread now.
"""

import threading
from datetime import datetime, timedelta
from unittest.mock import Mock

import attr
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import calculation, const, hourly_rows
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.helpers import parse_datetime
from custom_components.smart_irrigation.store import MappingEntry, mapping_as_dict

END = datetime(2026, 11, 22, 18, 30)


class _Coordinator(CalculationMixin):
    def __init__(self, mapping=None):
        self.store = Mock()
        self.store.get_mapping = Mock(return_value=mapping)
        self.hass = Mock()
        self.hass.config.units = METRIC_SYSTEM
        self.use_weather_service = False


def _reference_days(coord, mapping, data, window_end, window_hours):
    """The day split as it was: the buffer read again for every day."""
    mappings = mapping.get(const.MAPPING_MAPPINGS) or {}
    days = []
    remaining = window_hours
    end = window_end
    while remaining > 0:
        hours = min(24.0, remaining)
        start = end - timedelta(hours=hours)
        records = [
            record
            for record in coord._readings_after(data, start)
            if isinstance(record, dict)
            and (coord._stamp_of(record) is None or coord._stamp_of(record) <= end)
        ]
        weather = coord._weather_of_a_day(records, mappings)
        if weather is not None:
            weather[const.MAPPING_DATA_DAY] = (
                start + timedelta(hours=hours / 2.0)
            ).date()
            days.append((hours, weather))
        remaining -= hours
        end = start
    return days if len(days) > 1 else None


def _mapping():
    average = {const.MAPPING_CONF_AGGREGATE: const.MAPPING_CONF_AGGREGATE_AVERAGE}
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_MAPPINGS: {
            const.MAPPING_TEMPERATURE: dict(average),
            const.MAPPING_HUMIDITY: dict(average),
        },
    }


def _readings(hours, every_minutes=7):
    data = []
    for step in range(int(hours * 60 / every_minutes) + 1):
        moment = END - timedelta(minutes=step * every_minutes)
        data.append(
            {
                const.MAPPING_TEMPERATURE: 5 + (step % 37) / 3,
                const.RETRIEVED_AT: moment.isoformat(),
            }
        )
        data.append(
            {
                const.MAPPING_HUMIDITY: 60 + step % 30,
                const.RETRIEVED_AT: moment,
            }
        )
    data.reverse()
    return data


def test_the_day_split_is_what_it_was():
    coord = _Coordinator()
    mapping = _mapping()
    data = _readings(80)
    # On the edges of the slices, after the end, without a readable time, and
    # what is not a reading at all.
    data += [
        {
            const.MAPPING_TEMPERATURE: 30.0,
            const.RETRIEVED_AT: END - timedelta(hours=24),
        },
        {
            const.MAPPING_TEMPERATURE: -3.0,
            const.RETRIEVED_AT: END - timedelta(hours=48),
        },
        {const.MAPPING_TEMPERATURE: 2.0, const.RETRIEVED_AT: END - timedelta(hours=78)},
        {
            const.MAPPING_TEMPERATURE: 40.0,
            const.RETRIEVED_AT: END + timedelta(minutes=1),
        },
        {const.MAPPING_TEMPERATURE: 9.0, const.RETRIEVED_AT: "not a time"},
        "not a reading",
    ]

    for hours in (78.0, 72.0, 49.5, 30.25):
        assert coord._days_of_the_window(mapping, data, END, hours) == _reference_days(
            coord, mapping, data, END, hours
        )


def test_the_day_split_reads_each_time_once(monkeypatch):
    coord = _Coordinator()
    data = _readings(7 * 24)
    calls = []

    def counted(value):
        calls.append(value)
        return parse_datetime(value)

    monkeypatch.setattr(calculation, "parse_datetime", counted)

    days = coord._days_of_the_window(_mapping(), data, END, 7 * 24.0)

    assert len(days) == 7
    # Once to place each reading in its day, once more when its day reads its
    # temperature or humidity over time: not once for every day of the week.
    assert len(calls) <= 2 * len(data)


def test_an_hour_reads_the_samples_around_it():
    # A value that steps every minute: each hour's mean is its own.
    samples = [
        (END - timedelta(minutes=minutes), float(minutes // 60))
        for minutes in range(600, 0, -1)
    ]
    for hour in range(1, 9):
        start = END - timedelta(hours=hour + 1)
        end = start + timedelta(hours=1)
        mean = hourly_rows._mean_over(samples, start, end)
        assert abs(mean - hour) < 0.05
        assert hourly_rows._has_own_sample(samples, start, end)
    assert not hourly_rows._has_own_sample(
        samples, END + timedelta(hours=1), END + timedelta(hours=2)
    )
    # Before the first sample: the seed, then the first sample.
    first = samples[0][0]
    assert (
        hourly_rows._mean_over(samples, first - timedelta(hours=1), first, seed=4.0)
        == 4.0
    )


def test_a_group_is_handed_out_without_copying_every_reading():
    readings = [
        {const.MAPPING_TEMPERATURE: 12.0, const.RETRIEVED_AT: END},
        {const.MAPPING_HUMIDITY: 70.0, const.RETRIEVED_AT: END},
    ]
    entry = MappingEntry(
        id=3,
        name="Garden",
        mappings={const.MAPPING_TEMPERATURE: {const.MAPPING_CONF_SENSOR: "sensor.t"}},
        data=readings,
        data_last_entry={const.MAPPING_TEMPERATURE: 12.0},
    )

    handed = mapping_as_dict(entry)

    assert handed == attr.asdict(entry)
    # A list of its own: adding to it leaves the store as it was.
    handed[const.MAPPING_DATA].append({const.MAPPING_TEMPERATURE: 1.0})
    assert len(entry.data) == 2
    # The readings in it are the store's own, not copies of them.
    assert handed[const.MAPPING_DATA][0] is readings[0]
    # The rest is copied as before.
    handed[const.MAPPING_DATA_LAST_ENTRY][const.MAPPING_TEMPERATURE] = 0.0
    handed[const.MAPPING_MAPPINGS][const.MAPPING_TEMPERATURE]["sensor"] = "x"
    assert entry.data_last_entry == {const.MAPPING_TEMPERATURE: 12.0}
    assert entry.mappings[const.MAPPING_TEMPERATURE] == {
        const.MAPPING_CONF_SENSOR: "sensor.t"
    }


async def test_the_long_passes_run_off_the_event_loop():
    mapping = {
        **_mapping(),
        const.MAPPING_DATA: _readings(3 * 24),
        const.MAPPING_DATA_LAST_CALCULATION: None,
        const.MAPPING_DATA_LAST_ENTRY: {},
    }
    coord = _Coordinator(mapping)
    loop_thread = threading.current_thread()
    seen = {}

    def watched(name, func):
        def run(*args, **kwargs):
            seen[name] = threading.current_thread()
            return func(*args, **kwargs)

        return run

    coord._days_of_the_window = watched("days", coord._days_of_the_window)
    coord._group_data_by_sensor = watched("group", coord._group_data_by_sensor)

    result = await coord.apply_aggregates_to_mapping_data(
        mapping, persist=False, since=None
    )

    assert result is not None
    assert seen["days"] is not loop_thread
    assert seen["group"] is not loop_thread
