---
title: "Weather configuration"
---
# Weather configuration

The **Weather** tab gathers what Smart Irrigation reads the weather from, and everything that holds a run back. It has three pages:

- **Weather service**: the [weather service](installation-weatherservice.md), then the location it is read for and how often it is read.
- **Sensor groups**: which sensor or service provides each value the calculation reads, and above them, whether their sensors are recorded at every change (see [sensor groups](configuration-sensor-groups.md#continuous-updates)).
- **Skip watering**: every check that can hold a run back, in one place: the rain forecast, the rain, frost and wind measured when a run starts, the days between irrigation, and a summary of what the zones set for themselves (soil moisture, days of their own).

??? note "Coming from an older version"

    The tab was called **Data**, and its pages keep their addresses. Before 2026.11.1 the **Skip watering** page was called **Skip on weather**, and the days between irrigation were under **Settings › General**.

## Weather service

### Location

The weather is read for Home Assistant's location, unless you give other coordinates on the **Location coordinates** card: see [manual coordinates](MANUAL_COORDINATES.md).

!!! advanced

    The card is on the advanced panel, and shows in every mode once manual coordinates are on.

### Automatic weather data update

The weather is read every hour out of the box, which suits nearly every installation. The card has:

- **Automatically update weather data**, on by default;
- **Read the weather every**, in minutes, hours or days;
- **Delay before the first update**, for sensors that do not have a value right after Home Assistant starts.

!!! advanced

    The card is on the advanced panel. Once it is changed (switched off, another interval, or a delay), it shows in every mode, so a setting in use is never hidden.

A calculation works from the readings collected by these updates, so the weather must have been read at least once before the first calculation. With OpenWeatherMap or Pirate Weather, keep the interval at one hour or shorter: see [sensor groups](configuration-sensor-groups.md#configuring-a-sensor-group).

## Skip watering

### Skipping a run

The checks below can hold a run back. They are all off by default.

**When each check is judged.**

- What is measured is checked **at each start**, against what it reads then: the rain sensor, the frost, the wind, and your own postponement. A frost at 06:00 holds back the 06:00 run, not a program that starts at 18:00 on a mild evening.
- What concerns the whole day is decided **once**, at the first start of the day, and kept for every later start that day: the rain forecast and the days between irrigation. A morning run resets the days since the last irrigation, and must not hold back the evening run for it.

A check that cannot be read, because its sensor is unavailable or the weather service does not answer, never stops a run: watering goes ahead as it would without it.

The [Info page](usage-info.md) shows each check with its numbers: off, could not be checked, not blocking, or blocking. When a run is skipped, the `smart_irrigation_irrigation_skipped` event fires with the reason. With Calculate and water, each schedule of a program can [ignore the weather or apply only some of the checks](usage-full-controller.md#schedules).

Thresholds are entered in your unit system and a sensor is read in its own unit, so a sensor in °F works on a metric installation.

#### Rain forecast

One switch, **Take the forecast rain into account**, and one threshold, **Skip the run from**. The threshold is 2 mm (about 0.08 inch) unless you set one. The rain counted is the rain you can expect, with each forecast weighted by its probability. Where the weather service has an hourly forecast, it is the rain of the 48 hours from the start of the run; otherwise it is the forecast for the day of the run and the next.

At or above the threshold the run is skipped, with two overrides so that a forecast that keeps missing does not dry a zone out: after 2 days in a row held back by the forecast, the run goes ahead; and when the rain expected is less than half (0.5) of the largest deficit among the zones that would water, it goes ahead too, because 3 mm of rain is no reason to hold back a zone 25 mm short. Zones in a greenhouse sensor group still water. Below the threshold, the run goes ahead and each zone is watered for less, as described next.

The panel keeps two settings behind the one switch (`skip_irrigation_on_precipitation` and `forecast_rain_credit`): the switch shows on when either is on, and turning it on or off sets both.

**Below the threshold** the duration is reduced in proportion. When a run starts, each zone is watered for the rain forecast to fall in the 24 hours after the start, less: the forecast hours are weighted by the probability the weather service gives, so 10 mm at 30% counts for 3 mm, and a forecast of 4 mm against a 10 mm deficit waters 6 mm. It works alongside the skip above, which stays all or nothing. A greenhouse zone is not reduced, and a forecast that cannot be read leaves the run as calculated.

Like the rain history below, it shortens the run and leaves the deficit in the water balance. The rain that really falls is measured and credited at the next calculation, so nothing is counted twice, and a forecast that does not come true is made up at the next run. The hours are counted from the moment the run starts, not from the calculation, which on a morning run is hours earlier. The forecast hours come from Open-Meteo, including for installations using another weather service.

#### Rain sensor, freeze and wind

The **Skip on measured conditions** card. Each check reads its sensor, or the weather service when you leave the sensor empty. Under the sensor of the freeze and wind checks, a line says what the check reads and whether a sensor group reads the same value for the evaporation; when a group reads it from another sensor, one tap makes the check read that sensor too.

- **Rain sensor.** Skip while a binary sensor that is on in the rain says it is raining.
- **Freeze.** Skip when the temperature is at or below the threshold, 2 °C (36 °F) unless you set one. It reads the sensor you choose, or the weather service's current temperature.
- **Wind.** Skip when the wind is at or above the threshold, 20 km/h (12 mph) unless you set one: in strong wind a sprinkler waters the path, not the bed. It reads the sensor you choose, or the weather service's current wind. The weather service's wind is stored at 2 m for the evaporation, and taken back up to the 10 m that forecasts and wind limits are quoted at.

**Shorten runs after recent rain.** The rain sensor can do more than veto today: this reads its history over the last five days, weighted so that yesterday counts for more than four days ago, and shortens the run by the result. A day of reported rain today takes the whole run, four days ago takes a tenth of it, and a wet week takes everything.

!!! advanced

    **Shorten runs after recent rain** is on the advanced panel, under the rain sensor.

It is for one case: a zone whose sensor group reports **no rain in millimetres at all**, neither a gauge's depth nor a service's rate. Where millimetres exist, the water balance already carries them and decides for itself how long rain keeps counting, and this stays out of the way.

It never touches the water balance, because it does not know how much fell. The deficit stays where it was and is watered once the weather turns, which is the safe direction: a run shortened too much is made up tomorrow, while water that was never owed cannot be taken back out of the ground. It needs a sensor that stays on while it rains; one that pulses briefly per bucket tip spends almost no time on and will barely register.

The idea of weighting rain over a few rolling days comes from [kloggy's HA-Irrigation-Version2](https://github.com/kloggy/HA-Irrigation-Version2) package, which does it with `history_stats` over five 24-hour windows.

#### Soil moisture

Soil moisture is set on each zone rather than here, since each zone has its own sensor. The page lists the zones that have one, with their threshold, each a link to its zone.

Give a zone a soil moisture sensor and a threshold in %, 50 unless you set one, and while the reading is at or above it that zone sits the run out and the others water. Its duration for that run goes to 0 and its water balance is kept, so the deficit rolls over to the next run.

Every calculation applies the same rule: a zone whose soil reads at or above its threshold has its water balance set to field capacity, so the deficit shown never contradicts the sensor between two starts.

It works in that direction only. A dry reading says nothing about how many millimetres are missing without a calibration of the sensor to the soil, and a deficit invented from one would water a zone for good on the strength of a badly placed probe.

<a id="days-between-irrigation-events"></a>
### Days between irrigation

The **Days between irrigation** card, with **Minimum days between irrigation**: the fewest calendar days between two waterings. 0, the default, is no limit: watering can happen every day it is needed. Set to *N*, watering happens at most every *N* days (up to 365). It is useful for:

- **water conservation**: time enough between waterings;
- **plant health**: the soil dries a little between waterings;
- **local restrictions**: a watering schedule you have to keep.

For example, 1 allows watering every day, 3 every third day, and 7 once a week.

The days since the last watering are counted once per calendar day, at midnight, whether or not watering happened that day. A start that comes too early is skipped and the count goes on; the first start once enough days have passed waters, and the count starts again from 0. The rain forecast and this check both have to allow a run for it to happen.

**Different days for one zone.** A zone can have its own number, in the **Days between irrigation** field of its [settings](configuration-zones.md). The card lists the zones that have days of their own, each a link to its zone.

- That number *replaces* this setting for that zone alone, so a lawn can wait three days while the flower beds are watered every day. Leave the zone's field empty to follow this setting.
- The general count only restarts when a zone that follows it is watered, so a zone with days of its own, watered every day, does not keep the others from ever being due.
- The day is only skipped as a whole when every zone is still within its days. Otherwise the run goes ahead for the zones that are due, and the others sit it out.

!!! advanced

    The zone's field is on the advanced panel, and shows in every mode once it is set.
