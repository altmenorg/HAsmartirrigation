"""The hourly calculation, wired into a zone's calculation.

The equation and the row builder are covered on their own (test_hourly_et.py,
test_hourly_rows*.py). What is covered here is the switch between the two
forms, which is where a regression would reach every user:

- with the setting off, which is the default, nothing changes: the daily
  equation runs and is scaled by the interval exactly as before;
- with it on, the summed hourly ET replaces the daily figure and is NOT scaled
  by the interval again, since it already covers the whole window;
- the interval still sets how long the surplus drains;
- the crop factor still scales the ET, and the rain is still added unscaled;
- every case the hourly form cannot support falls back to the daily one.

The contract follows JustChr's tests for the same feature in Irrigation Plus.
"""

import math
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.smart_irrigation import const
from custom_components.smart_irrigation.calculation import CalculationMixin
from custom_components.smart_irrigation.calcmodules.pyeto import PyETO
from custom_components.smart_irrigation.hourly_et import (
    clear_sky_radiation_hourly_eq36,
    extraterrestrial_radiation_hourly,
    solar_elevation_sin,
)
from custom_components.smart_irrigation.hourly_rows import (
    SystemLocalTime,
    summed_hourly_eto,
)

LAT, LON, ELEV = 43.6, 1.44, 150.0
DAILY_DELTA = -4.0  # what the stand-in daily module returns, mm/day
SOURCED = (
    const.MAPPING_TEMPERATURE,
    const.MAPPING_HUMIDITY,
    const.MAPPING_WINDSPEED,
    const.MAPPING_SOLRAD,
    const.MAPPING_PRESSURE,
)


def _clear_sky_mj_day(stamp):
    """Three quarters of the clear-sky radiation at ``stamp``, in MJ/m2/day.

    Taken from the real sun at the real date, since the window ends now: the
    builder rejects radiation the sky could not have delivered.
    """
    offset = SystemLocalTime().utcoffset(stamp).total_seconds() / 3600.0
    hour = stamp.hour + stamp.minute / 60.0
    doy = stamp.timetuple().tm_yday
    ra = extraterrestrial_radiation_hourly(LAT, LON, doy, hour, offset)
    sin_beta = solar_elevation_sin(LAT, LON, doy, hour, offset)
    rso = clear_sky_radiation_hourly_eq36(ra, sin_beta, 101.3, 1.2)
    return 0.75 * max(0.0, rso) * 24.0


def _day_of_readings(hours=24, step_min=30, solar=True):
    """A plausible dry day ending now: warm afternoons, humid nights."""
    now = datetime.now()
    readings = []
    steps = int(hours * 60 / step_min)
    for i in range(steps + 1):
        stamp = now - timedelta(minutes=step_min * (steps - i))
        phase = math.cos(2 * math.pi * (stamp.hour + stamp.minute / 60 - 15) / 24)
        row = {
            const.RETRIEVED_AT: stamp.isoformat(),
            const.MAPPING_TEMPERATURE: 19.0 + 7.0 * phase,
            const.MAPPING_HUMIDITY: 62.0 - 18.0 * phase,
            const.MAPPING_WINDSPEED: 2.0,
            const.MAPPING_PRESSURE: 1000.0,
        }
        if solar:
            row[const.MAPPING_SOLRAD] = _clear_sky_mj_day(stamp)
        readings.append(row)
    return readings


def _mapping(readings, sourced=SOURCED):
    return {
        const.MAPPING_ID: 1,
        const.MAPPING_MAPPINGS: {
            key: {const.MAPPING_CONF_SOURCE: const.MAPPING_CONF_SOURCE_SENSOR}
            for key in sourced
        },
        const.MAPPING_DATA: readings,
        const.MAPPING_DATA_LAST_ENTRY: {},
    }


class _Module:
    def __init__(self, forecast_days=0):
        self.forecast_days = forecast_days
        self.calls = 0
        self.last_trace = {"module": "PyETO", "mean_delta": DAILY_DELTA}

    def calculate(self, weather_data, forecast_data):
        self.calls += 1
        return DAILY_DELTA


class _Coordinator(CalculationMixin):
    def __init__(
        self,
        *,
        hourly,
        mapping,
        module=None,
        module_name="PyETO",
        precip=0.0,
        coordinates=(LAT, LON, ELEV),
    ):
        self.hass = MagicMock()
        self.hass.config.units = METRIC_SYSTEM
        self.hass.config.language = "en"
        self.store = MagicMock()
        self.store.get_config = MagicMock(
            return_value=(
                {} if hourly is None else {const.CONF_HOURLY_CALCULATION: hourly}
            )
        )
        self.store.get_mapping = MagicMock(return_value=mapping)
        self.store.get_module = MagicMock(
            return_value={const.MODULE_ID: 1, const.MODULE_NAME: module_name}
        )
        self.module = module or _Module()
        self.getModuleInstanceByID = AsyncMock(return_value=self.module)
        self._build_calc_record = MagicMock(return_value=None)
        self._precipitation_net_of_superseded = MagicMock(return_value=precip)
        (
            self._effective_latitude,
            self._effective_longitude,
            self._effective_elevation,
        ) = coordinates


def _zone(**extra):
    zone = {
        const.ZONE_ID: 1,
        const.ZONE_NAME: "Lawn",
        const.ZONE_STATE: const.ZONE_STATE_AUTOMATIC,
        const.ZONE_MODULE: 1,
        const.ZONE_MAPPING: 1,
        const.ZONE_BUCKET: 0.0,
        const.ZONE_MAXIMUM_BUCKET: 24.0,
        const.ZONE_DRAINAGE_RATE: 50.8,
        const.ZONE_MULTIPLIER: 1.0,
        const.ZONE_SIZE: 50.0,
        const.ZONE_THROUGHPUT: 10.0,
        const.ZONE_MAXIMUM_DURATION: 3600,
        const.ZONE_LEAD_TIME: 0,
        const.ZONE_IRRIGATION_THRESHOLD: 0,
    }
    zone.update(extra)
    return zone


def _expected_hourly(readings):
    # The window ends at "now", so it has moved a few milliseconds since the
    # calculation; the comparisons allow for that and nothing more.
    total, hours = summed_hourly_eto(
        readings,
        None,
        now=datetime.now(),
        last_entry={},
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=SystemLocalTime(),
    )
    return total, hours


async def _run(coordinator, zone=None, multiplier=1.0):
    return await coordinator.calculate_module(
        zone or _zone(), {const.MAPPING_DATA_MULTIPLIER: multiplier}, []
    )


# --- off: nothing changes --------------------------------------------------


@pytest.mark.asyncio
@pytest.mark.parametrize("setting", [None, False])
@pytest.mark.parametrize("multiplier", [0.5, 1.0, 2.0])
async def test_off_the_daily_equation_runs_as_before(setting, multiplier):
    """Never set (an existing install) and switched off behave the same."""
    coordinator = _Coordinator(hourly=setting, mapping=_mapping(_day_of_readings()))

    data = await _run(coordinator, multiplier=multiplier)

    assert coordinator.module.calls == 1
    assert data[const.ZONE_DELTA] == pytest.approx(DAILY_DELTA * multiplier)


@pytest.mark.asyncio
async def test_off_the_explanation_is_the_daily_one():
    coordinator = _Coordinator(hourly=False, mapping=_mapping(_day_of_readings()))

    data = await _run(coordinator)

    assert "hour_multiplier" in data[const.ZONE_EXPLANATION]
    assert "hour by hour" not in data[const.ZONE_EXPLANATION]


def test_the_default_is_off():
    assert const.CONF_DEFAULT_HOURLY_CALCULATION is False


# --- on: the hourly sum replaces the daily figure ---------------------------


@pytest.mark.asyncio
async def test_on_the_hourly_sum_replaces_the_daily_figure():
    readings = _day_of_readings()
    coordinator = _Coordinator(hourly=True, mapping=_mapping(readings))

    data = await _run(coordinator)
    total, hours = _expected_hourly(readings)

    assert coordinator.module.calls == 0
    assert hours == pytest.approx(24.0, abs=0.05)
    assert data[const.ZONE_DELTA] == pytest.approx(-total, rel=1e-4)


@pytest.mark.asyncio
@pytest.mark.parametrize("multiplier", [0.5, 2.0, 3.0])
async def test_on_the_interval_does_not_scale_the_sum_again(multiplier):
    """The sum already covers the window, so scaling it would count it twice."""
    readings = _day_of_readings()
    coordinator = _Coordinator(hourly=True, mapping=_mapping(readings))

    data = await _run(coordinator, multiplier=multiplier)
    total, _ = _expected_hourly(readings)

    assert data[const.ZONE_DELTA] == pytest.approx(-total, rel=1e-4)


@pytest.mark.asyncio
@pytest.mark.parametrize("kc", [0.5, 0.8, 1.2])
async def test_on_the_crop_factor_scales_the_et_and_not_the_rain(kc):
    readings = _day_of_readings()
    coordinator = _Coordinator(hourly=True, mapping=_mapping(readings), precip=3.0)

    data = await _run(coordinator, zone=_zone(**{const.ZONE_MULTIPLIER: kc}))
    total, _ = _expected_hourly(readings)

    assert data[const.ZONE_DELTA] == pytest.approx(-total * kc + 3.0, rel=1e-4)


@pytest.mark.asyncio
async def test_on_the_interval_still_sets_how_long_the_surplus_drains():
    """The interval is dropped from the ET term only. Setting it to 1 in hourly
    mode would have drained a two-day surplus for one day."""
    readings = _day_of_readings()
    zone = _zone(**{const.ZONE_BUCKET: 0.0})

    drained = {}
    for multiplier in (1.0, 2.0):
        coordinator = _Coordinator(hourly=True, mapping=_mapping(readings), precip=30.0)
        data = await _run(coordinator, zone=zone, multiplier=multiplier)
        drained[multiplier] = data[const.ZONE_CURRENT_DRAINAGE]

    assert drained[1.0] > 0
    assert drained[2.0] > drained[1.0]


@pytest.mark.asyncio
async def test_on_the_explanation_says_it_was_summed_hour_by_hour():
    coordinator = _Coordinator(hourly=True, mapping=_mapping(_day_of_readings()))

    data = await _run(coordinator)

    assert "hour by hour" in data[const.ZONE_EXPLANATION]
    assert "hour_multiplier" not in data[const.ZONE_EXPLANATION]


@pytest.mark.asyncio
async def test_on_it_starts_at_the_zones_own_mark():
    """Readings the zone already consumed are not summed again."""
    readings = _day_of_readings(hours=48)
    mark = datetime.now() - timedelta(hours=12)
    coordinator = _Coordinator(hourly=True, mapping=_mapping(readings))

    data = await _run(
        coordinator, zone=_zone(**{const.ZONE_LAST_CONSUMED_AT: mark.isoformat()})
    )
    total, hours = summed_hourly_eto(
        readings,
        mark,
        now=datetime.now(),
        last_entry={},
        latitude=LAT,
        longitude=LON,
        elevation=ELEV,
        tz=SystemLocalTime(),
    )

    assert hours == pytest.approx(12.0, abs=0.05)
    assert data[const.ZONE_DELTA] == pytest.approx(-total, rel=1e-3)


# --- on, but the window cannot support it: the daily form -------------------


@pytest.mark.asyncio
async def test_forecast_days_keep_the_daily_equation():
    """Only the daily form can average forecast days in."""
    coordinator = _Coordinator(
        hourly=True,
        mapping=_mapping(_day_of_readings()),
        module=_Module(forecast_days=2),
    )

    data = await _run(coordinator, multiplier=2.0)

    assert coordinator.module.calls == 1
    assert data[const.ZONE_DELTA] == pytest.approx(DAILY_DELTA * 2.0)


@pytest.mark.asyncio
async def test_without_solar_radiation_it_keeps_the_daily_equation():
    """An estimated sun summed hour by hour would only be a guess."""
    sourced = tuple(k for k in SOURCED if k != const.MAPPING_SOLRAD)
    coordinator = _Coordinator(
        hourly=True, mapping=_mapping(_day_of_readings(solar=False), sourced)
    )

    data = await _run(coordinator)

    assert coordinator.module.calls == 1
    assert data[const.ZONE_DELTA] == pytest.approx(DAILY_DELTA)


@pytest.mark.asyncio
async def test_without_coordinates_it_keeps_the_daily_equation():
    coordinator = _Coordinator(
        hourly=True,
        mapping=_mapping(_day_of_readings()),
        coordinates=(None, None, None),
    )

    data = await _run(coordinator)

    assert coordinator.module.calls == 1
    assert data[const.ZONE_DELTA] == pytest.approx(DAILY_DELTA)


@pytest.mark.asyncio
async def test_without_readings_it_keeps_the_daily_equation():
    coordinator = _Coordinator(hourly=True, mapping=_mapping([]))

    data = await _run(coordinator)

    assert coordinator.module.calls == 1
    assert data[const.ZONE_DELTA] == pytest.approx(DAILY_DELTA)


@pytest.mark.asyncio
async def test_a_removed_source_does_not_feed_the_sum_from_its_last_value():
    """A field nothing reports any more must not be carried forward."""
    readings = [
        {k: v for k, v in r.items() if k != const.MAPPING_WINDSPEED}
        for r in _day_of_readings()
    ]
    mapping = _mapping(
        readings, tuple(k for k in SOURCED if k != const.MAPPING_WINDSPEED)
    )
    mapping[const.MAPPING_DATA_LAST_ENTRY] = {const.MAPPING_WINDSPEED: 9.0}
    coordinator = _Coordinator(hourly=True, mapping=mapping)

    data = await _run(coordinator)

    assert coordinator.module.calls == 1
    assert data[const.ZONE_DELTA] == pytest.approx(DAILY_DELTA)


@pytest.mark.asyncio
async def test_other_engines_are_untouched():
    """Only PyETO has an hourly form. Passthrough and the rest keep theirs."""

    class _Static:
        name = "Static"

        def calculate(self):
            return -2.5

    coordinator = _Coordinator(
        hourly=True,
        mapping=_mapping(_day_of_readings()),
        module=_Static(),
        module_name="Static",
    )

    data = await _run(coordinator, multiplier=2.0)

    assert data[const.ZONE_DELTA] == pytest.approx(-5.0)


# --- the two forms agree where they should ----------------------------------


def test_over_one_clear_day_the_two_forms_are_close():
    """Not equal, which is the point of the change, but the same order.

    The daily PyETO module on the day's means (min, max, mean dew point) against
    the same day summed hour by hour. JustChr measured the daily form at 0.925x
    on clear days, so a wide band is right; a factor-of-24 slip in the solar
    conversion or a doubled interval would land far outside it.
    """
    readings = _day_of_readings()
    total, _ = _expected_hourly(readings)

    temps = [r[const.MAPPING_TEMPERATURE] for r in readings]
    rh = sum(r[const.MAPPING_HUMIDITY] for r in readings) / len(readings)
    t_mean = sum(temps) / len(temps)
    # Magnus dew point from the mean temperature and humidity.
    gamma = math.log(rh / 100.0) + 17.62 * t_mean / (243.12 + t_mean)
    dewpoint = 243.12 * gamma / (17.62 - gamma)
    daily = {
        const.MAPPING_MIN_TEMP: min(temps),
        const.MAPPING_MAX_TEMP: max(temps),
        const.MAPPING_DEWPOINT: dewpoint,
        const.MAPPING_WINDSPEED: 2.0,
        const.MAPPING_PRESSURE: 1000.0,
        const.MAPPING_SOLRAD: sum(r[const.MAPPING_SOLRAD] for r in readings)
        / len(readings),
    }
    hass = MagicMock()
    hass.config.as_dict.return_value = {"latitude": LAT, "elevation": ELEV}
    eto_daily = -PyETO(hass, "", {}).calculate(daily, [])

    assert eto_daily > 0
    assert 0.7 < total / eto_daily < 1.4
