---
layout: default
title: "Configuration: Weather"
---
# Weather configuration

> Main page: [Configuration](configuration.md)<br/>
> Previous: [General configuration](configuration-general.md)<br/>
> Next: [Zone configuration](configuration-zones.md)

The **Weather** tab gathers what Smart Irrigation reads the weather from, and the checks that hold a run back on it. It has three pages:

* **Weather service**: the [weather service](installation-weatherservice.md), then the location it is read for and how often it is read.
* **Sensor groups**: which sensor or service provides each value the calculation reads (see [sensor groups](configuration-sensor-groups.md)).
* **Skip on weather**: the rain forecast, and the rain, frost and wind measured when a run starts.

The tab was called **Data** before; its pages keep their addresses.

## Weather service

### Location
The weather is read for Home Assistant's location unless you give other coordinates on the **Location coordinates** card: see [manual coordinates](MANUAL_COORDINATES.md).

### Automatic weather data update
If enabled, specify how often sensor update should happen (minutes, hours, days). You can also set up an update delay to be used to delay the first update. This is useful in case your sensors do not provide a value immediately after Home Assistant starts.

As calculation needs weatherdata make sure to update your weather data at least once before calculating.

### Continuous updates
The **Continuous updates for sensors** card is only shown in advanced mode, or when the setting is already on. Continuous updates records every change of a sensor of the group, instead of one reading per update, so the averages the calculation works from, hour by hour and for the rain, follow the day more finely. Every [sensor group](configuration-sensor-groups.md) with sensors of its own is recorded this way, also one that takes the rest of its data from a weather service: its sensors are recorded as they change, and the service is still read once per update, so it costs no extra requests. A rain gauge gains the most from it: the replay of the rain places what falls between two of its reports, so a gauge that reports every ten minutes places its rain within ten minutes rather than within the hour of the update. The zones are not calculated again at each change; the scheduled calculation does that, once, from the readings recorded.

It records and nothing more. It used to calculate the zones again at every change, which moved the bucket, and the trigger that accounts for the duration of the run, all day. The scheduled calculation now does that once, from the readings recorded, and the live estimate on the Info page and in the zone's live bucket entity shows where a zone stands in between without writing anything. Zones on a pure-sensor group are calculated at the scheduled time like any other. A sensor debounce setting controls how fast changes are recorded.

## Skip on weather

### Skipping a run
A start trigger can be held back by the conditions below, all off by default. Under the sensor of the freeze and wind checks, a line says what the check reads and whether a sensor group reads the same value for the evaporation; when a group reads it from another sensor, one tap makes the check read that sensor too. They are checked once a day, when the first start trigger is reached, and the Info page shows each of them with its numbers: whether it is off, could not be checked, is not blocking or is blocking. When a run is skipped, the `smart_irrigation_irrigation_skipped` event fires with the reason.

A condition that cannot be checked, because its sensor is unavailable or the weather service cannot be read, never stops a run: watering goes ahead as it would without it.

* **Rain forecast.** One switch, **Take the forecast rain into account**, and one threshold, **Skip the run from**. The threshold is 2 mm (about 0.08 inch) unless you set one. The rain counted is the rain you can expect, with each forecast weighted by its probability. Where the weather service has an hourly forecast, it is the rain of the 48 hours from the start of the run; otherwise it is the forecast for the day of the run and the next. At or above the threshold the run is skipped, with two overrides so that a forecast that keeps missing does not dry a zone out: after 2 days in a row held back by the forecast, the run goes ahead; and when the rain expected is less than half (0.5) of the largest deficit among the zones that would water, it goes ahead too, because 3 mm of rain is no reason to hold back a zone 25 mm short. Below the threshold, the run goes ahead and each zone is watered for less, as described next. Zones in a greenhouse sensor group still water. The panel keeps two settings behind the one switch (`skip_irrigation_on_precipitation` and `forecast_rain_credit`): the switch shows on when either is on, and turning it on or off sets both.

  **Below the threshold** the duration is reduced in proportion. When a run starts, each zone is watered for the rain forecast to fall in the 24 hours after the start, less: the forecast hours are weighted by the probability the weather service gives, so 10 mm at 30% counts for 3 mm, and a forecast of 4 mm against a 10 mm deficit waters 6 mm. It works alongside the skip above, which stays all or nothing. A greenhouse zone is not reduced, and a forecast that cannot be read leaves the run as calculated.

  Like the rain history below, it shortens the run and leaves the deficit in the bucket. The rain that really falls is measured and credited at the next calculation, so nothing is counted twice, and a forecast that does not come true is made up at the next run. The hours are counted from the moment the run starts, not from the calculation, which on a morning run is hours earlier. The forecast hours come from Open-Meteo, including for installations using another weather service.
* **Rain sensor.** Skip while a binary sensor that is on in the rain says it is raining.

  On the advanced panel, that same sensor can do more than veto today: **shorten runs after recent rain** reads its history over the last five days, weighted so that yesterday counts for more than four days ago, and shortens the run by the result. A day of reported rain today takes the whole run, four days ago takes a tenth of it, and a wet week takes everything.

  It is for one case and it applies to one case: a zone whose sensor group reports **no rain in millimetres at all**, neither a gauge's depth nor a service's rate. Where millimetres exist, the water balance already carries them, decides for itself how long rain keeps counting, and this stays out of the way.

  It never touches the balance, because it does not know how much fell. The deficit stays where it was and is watered off once the weather turns, which is the safe direction: a run that was shortened too much is made up tomorrow, while water that was never owed cannot be taken back out of the ground. It needs a sensor that stays on while it rains; one that pulses briefly per bucket tip spends almost no time on and will barely register.

  The idea of weighting rain over a few rolling days comes from [kloggy's HA-Irrigation-Version2](https://github.com/kloggy/HA-Irrigation-Version2) package, which does it with `history_stats` over five 24-hour windows.
* **Freeze.** Skip when the temperature is at or below the threshold, 2 °C (36 °F) unless you set one. It reads the sensor you choose, or the weather service's current temperature when none is set.
* **Wind.** Skip when the wind is at or above the threshold, 20 km/h (12 mph) unless you set one: in strong wind a sprinkler waters the path rather than the bed. It reads the sensor you choose, or the weather service's current wind. The weather service's wind is stored at 2 m for the evaporation, and is taken back up to the 10 m that forecasts and wind limits are quoted at.
* **Days between irrigation**, set under **Settings > General** (see [Days between irrigation events](configuration-general.md#days-between-irrigation-events)).

Thresholds are entered in your unit system and a sensor is read in its own unit, so a sensor in °F works on a metric installation.

**Soil moisture** is set on each zone rather than here. Give a zone a soil moisture sensor and a threshold in %, 50 unless you set one, and while the reading is at or above it that zone sits the run out and the others water. Its duration for that run goes to 0 and its bucket is kept, so the deficit rolls over to the next run. Every calculation applies the same rule: a zone whose soil reads at or above its threshold has its bucket set to field capacity, so the deficit shown never contradicts the sensor between two starts. It works in that direction only. A dry reading says nothing about how many millimetres are missing without a calibration of the sensor to the soil, and a deficit invented from one would water a zone for good on the strength of a badly placed probe.


> Main page: [Configuration](configuration.md)<br/>
> Previous: [General configuration](configuration-general.md)<br/>
> Next: [Zone configuration](configuration-zones.md)
