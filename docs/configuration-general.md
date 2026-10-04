---
layout: default
title: Configuration: General
---
# General configuration

> Main page: [Configuration](configuration.md)<br/>
> Previous: [Guided setup](configuration-setup.md)<br/>
> Next: [Zone configuration](configuration-zones.md)

This page provides the following global settings:

### Automatic weather data update
If enabled, specify how often sensor update should happen (minutes, hours, days). You can also set up an update delay to be used to delay the first update. THis is useful in case your sensors do not provide a value immediately after Home Assistant starts.

As calculation needs weatherdata make sure to update your weather data at least once before calculating.

The first card of this page is the [setup assistant](configuration-setup.md). The **Panel** card has the **Advanced settings** switch, which shows the extra settings mentioned on these pages as "advanced mode".

### Calculating the watering duration
One choice, **Watering duration calculated**, says when the durations are worked out:

* **At a fixed time.** Every day at the time chosen below (**Calculate at**, 23:00 unless you change it), the water lost is added to each zone's bucket and the durations are set. Use it when something other than Smart Irrigation starts the watering and reads the durations whenever it likes (Irrigation Unlimited, or a schedule of your own).
* **Just before each start.** The zones are calculated again at the time of the start trigger, with the freshest weather. There is no time to choose. Use it when Smart Irrigation itself starts the watering (direct valve control, or the start event). Because no evening calculation sets the durations with this choice, the start is placed using the live estimate of the run's length, and placed again at every weather reading.
* **Only when I ask.** Nothing is calculated by itself. Use the calculate buttons or the [services](usage-services.md).

What starts the watering is decided elsewhere, by the start trigger (see below). Under the choice, **Calculate evapotranspiration hour by hour** stays: it changes the form of the equation, not the moment of the calculation.

Stored settings are unchanged by this: *At a fixed time* is the old "automatically calculate" setting being on, *Just before each start* is the old "calculate again before the first start" setting being on, and *Only when I ask* is both being off.

Calculation uses weatherdata that is collected in updates to determine irrigation duration.

Each zone reads only the readings that arrived since its own last calculation, and remembers how far it has read. Readings are dropped once every zone using that sensor group has consumed them, so two zones sharing a group can calculate at different times without either of them losing data.

Irrigation usually starts hours after the calculation, and it can rain in between. When the start trigger is reached, each automatic zone's duration is reworked against the rain collected since its calculation, so a night of rain shortens the run or cancels it instead of watering the full calculated amount on wet ground.

The bucket itself is left alone by that. It is a running balance: irrigation credits it by the water actually applied and the next calculation adds the whole interval's rain, so crediting the rain at the start as well would count it twice. A run is only ever shortened this way, never lengthened, and a dry night leaves the calculated duration exactly as it is.

Note that the run still starts at the time it was scheduled for. A trigger set to finish at sunrise works back from the duration known at calculation time, so a run shortened by rain finishes early rather than starting late.

#### Calculate evapotranspiration hour by hour (beta)
**On for a new installation, off for one that already existed.** A fresh installation starts on it, because it is the better arithmetic; an installation set up before it arrived keeps the daily equation until its owner switches, because the two give different numbers and nobody's watering should change on an update without being asked. When on, PyETO sums the FAO-56 hourly equation (Eq. 53) over each hour of the zone's window instead of running the daily equation on the window's averages. The daily form is biased by cloudiness, because an average day hides whether the sun and the heat came together; summing the hours removes most of that bias. Calculating hour by hour at all is an idea taken from [JustChr's Irrigation Plus fork](https://github.com/JustChr/HAsmartirrigation), which is where it was first tried on this integration; the equations here are written from FAO-56 itself and checked against the paper's own worked example.

It needs temperature, humidity and wind speed in the sensor group (a sensor or a weather service), and the site's coordinates.

**It is worth having when readings arrive through the day.** Each hour is priced from the readings of that hour, so an update interval of minutes or an hour is what the form is for. One update a day leaves a single reading held across twenty-four hours: it still runs, and it does not produce nonsense, but the hours then differ only by the sun and the result is no more trustworthy than the daily equation's on the same data. Measured on a synthetic clear day, which of the two lands closer to the truth in that case depends on the hour the samples fell in. If your sensor group updates once or twice a day, raise the update frequency before reading anything into either form.

**Solar radiation without a sensor.** The hourly equation needs the sun of each hour, and there are three ways it can have it. A group with a radiation or illuminance sensor reads its own, as before. A group without one whose weather service can be asked reads the service's own hourly history, which measures and models it: Open-Meteo publishes it, and OpenWeatherMap or Pirate Weather answer through the Open-Meteo fallback they already use for radiation.

An installation with neither, a set of plain sensors and no weather service, estimates it: the day's temperature range gives the day's radiation (FAO-56 Eq. 50, the same equation the daily form falls back on), and the sun's own path over that day says which hours received it. Summed over a day the estimate is exactly what the daily equation would have used, so the amount of sun credited does not change; what changes is that it is placed on the hours it belongs to, which is the bias the hourly form exists to remove. The calculation log records whether the sun of a run was measured or estimated.

A greenhouse is the exception and keeps the daily equation when it has no sensor of its own: no reading of the sky describes what reaches a plant under glass, so there is nothing to estimate from. A lux sensor on the inside answers that properly, and the sensor group takes one.

**A group fed by Open-Meteo alone is priced on Open-Meteo's own hours.** Smart Irrigation reads the weather service about once an hour, and each reading stands in for the hour around it; Open-Meteo's own hourly figures are means over the hour, and they differ when the sun moves fast, in the morning and in the evening. For a sensor group whose every source is the weather service, and a weather service that is Open-Meteo, the hourly equation is therefore fed the hours Open-Meteo publishes for the window (temperature, humidity, wind and pressure at the ends of each hour, and the radiation of the hour itself) instead of the readings Smart Irrigation took. On a real autumn day this brought the result from 8% below Open-Meteo's own evapotranspiration to about 3% below it. A group with a sensor of its own, a static value, another weather service or a greenhouse keeps summing its own readings, and so does any group when the history cannot be read.

**Nights, and why the result can read a few percent under Open-Meteo.** The hourly equation (FAO-56, Eq. 53) is built for the hours with sun, and the night is where it is least certain. A night hour has no radiation to measure, so the sky has to be assumed to know how much heat the ground loses, and a night's wind and dry air can add as much as they like. Two things are worth knowing:

- **Which sky.** FAO-56 gives two ways. The preferred one carries the ratio of measured to clear-sky radiation from the daylight into the night, and that is what a calculation does whenever its window contains daylight. The other, which the paper calls "more approximate", assumes a ratio of 0.4 to 0.6 at night in humid climates and 0.7 to 0.8 in arid ones; Smart Irrigation reads it off the humidity of the hour, and uses it only when the window has no daylight to measure from (the live estimate in the small hours, a calculation over a few hours of night). Open-Meteo uses that second way for every night. On clear windy autumn days the first way loses more heat at night, so Smart Irrigation reads 5 to 10% under Open-Meteo's own evapotranspiration, almost all of it from the night hours, while the daylight hours agree to within a few percent. Both are FAO-56; neither is measured against the ground here.
- **Nothing is negative.** A calm humid night prices a hair below zero, which is dew forming on the leaves and not water in the soil. Every hour is worth zero at the least, and a window's total never falls as the window grows, so a bucket never rises without rain. Open-Meteo reports 0.00 for those hours too.

The American standard of the same equation (ASCE-EWRI 2005) goes further than FAO-56 at night, with a larger surface-resistance term (Cd of 0.96 against 0.24 by day, for the short reference). That would lower the night hours, not raise them. Smart Irrigation keeps FAO-56's single form, whose worked example is its test, and reports the difference rather than tune the model to another implementation.

**Forecast days.** A zone whose engine looks ahead waters on the mean of today and the days to come, so a hot tomorrow raises today's run. Those days are now read hour by hour as well: each one is priced as its own 24 hours, and the measured window joins the average as the rate per day it implies. Every term of that mean is then hourly, which is the point, since averaging an hourly sum with a day computed from its own averages would put the bias straight back in.

With any other module, or when the hours cannot be reconstructed (no readings, a field missing everywhere, a greenhouse with no radiation or illuminance sensor, or fewer forecast days available than the engine asks for), the daily equation keeps being used, so switching it on never leaves a zone without a calculation. The calculation explanation says which form was used.

#### Just before each start
The calculation at a fixed time prices the evapotranspiration, the temperature and the wind of the hours before it. A start trigger at sunset then waters on data some twenty hours old; only the rain was brought up to date at the start (rain since the calculation, the forecast, the rain history). With **Just before each start** the zones are calculated again, with fresh weather, at the time of the start trigger. Nothing is done when a zone was calculated within the hour, and a calculation that fails leaves the run to go ahead on the earlier numbers.
### Start triggers
The **Start triggers** card holds the active trigger select. Its last choice is **None (Smart Irrigation starts no watering)**: nothing starts the watering, whatever the weather, while the durations are still calculated. It is the way to block Smart Irrigation from watering. The [Info page](usage-info.md) then says "No trigger is active". No message is shown for the default trigger.

### Automatic weather data pruning (removed)
Weather data used to be cleared on a timer, and that setting no longer does anything.

It existed to stop the collected data growing without end, which pruning after each
calculation now handles by itself. What it also did was throw away readings nobody had
consumed: the clear ran at a fixed time while the calculation time is yours to choose, so
moving the calculation earlier silently lost everything collected between the two, every
night. A calculation at 18:55 against the default clear at 23:59 discarded five hours of
evaporation a day, and the next calculation was short by that much.

Readings are also capped at a week, so nothing accumulates even if a zone stops calculating.
The **Clear all weather data** action is still there for a deliberate reset.

### Days between irrigation events
Configure the minimum number of days that must pass between irrigation events. This setting allows you to control how frequently irrigation can occur, which is useful for:
* **Water conservation**: Ensure adequate time between watering sessions
* **Plant health**: Allow soil to partially dry between irrigations
* **Local restrictions**: Comply with watering schedules or restrictions

**How it works:**
* **Default value**: 0 (no restriction - maintains current behavior)
* **Range**: 0-365 days
* When set to 0: Irrigation events can fire daily if conditions are met (default behavior)
* When set to a value > 0: Irrigation events will only fire if the specified number of days have passed since the last irrigation event

The value is the length of the watering cycle in calendar days: set to *N*, irrigation happens every *N* days.

**Different days for one zone:** a zone can have its own number of days, in the **Days between irrigation** field of the [zone settings](configuration-zones.md) (advanced mode). That number *replaces* this general setting for that zone alone, so a lawn can wait three days while the flower beds are watered every day. Leave the zone's field empty to follow this setting. The general counter only restarts when a zone that follows it is watered, so a zone with days of its own, watered every day, does not keep the others from ever being due. The day is only skipped as a whole when every zone is still within its days; otherwise the run goes ahead for the zones that are due and the others sit it out.

**Example scenarios:**
* Set to 1: Allow irrigation every day (one calendar day between events)
* Set to 3: Allow irrigation every 3 days
* Set to 7: Weekly irrigation

The system automatically tracks the number of days since the last irrigation event. The counter is incremented once per calendar day, at midnight, whether or not irrigation happened that day. If an irrigation trigger occurs but insufficient days have passed, the event is skipped and the counter simply keeps running. When enough days have passed, the next trigger will fire the irrigation event and reset the counter to 0.

This feature works alongside existing precipitation forecasting - if both restrictions apply, both must be satisfied for irrigation to occur.

### Seasonal adjustments
In advanced mode, the general settings have a **Seasonal adjustments** card. An adjustment covers a range of months (November to February is a range, and so is March to September) and some zones (`all`, or their numbers separated by commas), and does two things: its **multiplier** scales the crop factor of those zones for those months (1 changes nothing, 0.5 halves the water use), and its **threshold offset** is added to their irrigation threshold. Several adjustments that cover the same month multiply. They apply to the evapotranspiration, not to the duration, so the bucket follows the season.

The same adjustments can be created from automations with the `create_seasonal_adjustment`, `update_seasonal_adjustment` and `delete_seasonal_adjustment` [actions](usage-services.md). For a crop with a crop factor for every month, the zone has a **Crop factor by month** table instead, which is easier than twelve adjustments.

### Skipping a run
A start trigger can be held back by the conditions below, all off by default. They are checked once a day, when the first start trigger is reached, and the Info page shows each of them with its numbers: whether it is off, could not be checked, is not blocking or is blocking. When a run is skipped, the `smart_irrigation_irrigation_skipped` event fires with the reason.

A condition that cannot be checked, because its sensor is unavailable or the weather service cannot be read, never stops a run: watering goes ahead as it would without it.

* **Rain forecast.** One switch, **Take the forecast rain into account**, and one threshold, **Skip the run from**. At or above the threshold of rain forecast for today and tomorrow, the run is skipped. Below it, the run goes ahead and each zone is watered for less, as described next. Zones in a greenhouse sensor group still water. The panel keeps two settings behind the one switch (`skip_irrigation_on_precipitation` and `forecast_rain_credit`): the switch shows on when either is on, and turning it on or off sets both.

  **Below the threshold** the duration is reduced in proportion. When a run starts, each zone is watered for the rain forecast to fall in the 24 hours after the start, less: the forecast hours are weighted by the probability the weather service gives, so 10 mm at 30% counts for 3 mm, and a forecast of 4 mm against a 10 mm deficit waters 6 mm. It works alongside the skip above, which stays all or nothing. A greenhouse zone is not reduced, and a forecast that cannot be read leaves the run as calculated.

  Like the rain history below, it shortens the run and leaves the deficit in the bucket. The rain that really falls is measured and credited at the next calculation, so nothing is counted twice, and a forecast that does not come true is made up at the next run. The hours are counted from the moment the run starts, not from the calculation, which on a morning run is hours earlier. The forecast hours come from Open-Meteo, including for installations using another weather service.
* **Rain sensor.** Skip while a binary sensor that is on in the rain says it is raining.

  On the advanced panel, that same sensor can do more than veto today: **shorten runs after recent rain** reads its history over the last five days, weighted so that yesterday counts for more than four days ago, and shortens the run by the result. A day of reported rain today takes the whole run, four days ago takes a tenth of it, and a wet week takes everything.

  It is for one case and it applies to one case: a zone whose sensor group reports **no rain in millimetres at all**, neither a gauge's depth nor a service's rate. Where millimetres exist, the water balance already carries them, decides for itself how long rain keeps counting, and this stays out of the way.

  It never touches the balance, because it does not know how much fell. The deficit stays where it was and is watered off once the weather turns, which is the safe direction: a run that was shortened too much is made up tomorrow, while water that was never owed cannot be taken back out of the ground. It needs a sensor that stays on while it rains; one that pulses briefly per bucket tip spends almost no time on and will barely register.

  The idea of weighting rain over a few rolling days comes from [kloggy's HA-Irrigation-Version2](https://github.com/kloggy/HA-Irrigation-Version2) package, which does it with `history_stats` over five 24-hour windows.
* **Freeze.** Skip when the temperature is at or below the threshold, 2 °C (36 °F) unless you set one. It reads the sensor you choose, or the weather service's current temperature when none is set.
* **Wind.** Skip when the wind is at or above the threshold, 20 km/h (12 mph) unless you set one: in strong wind a sprinkler waters the path rather than the bed. It reads the sensor you choose, or the weather service's current wind. The weather service's wind is stored at 2 m for the evaporation, and is taken back up to the 10 m that forecasts and wind limits are quoted at.
* **Days between irrigation**, above.

Thresholds are entered in your unit system and a sensor is read in its own unit, so a sensor in °F works on a metric installation.

**Soil moisture** is set on each zone rather than here. Give a zone a soil moisture sensor and a threshold in %, 50 unless you set one, and while the reading is at or above it that zone sits the run out and the others water. Its duration for that run goes to 0 and its bucket is kept, so the deficit rolls over to the next run. Every calculation applies the same rule: a zone whose soil reads at or above its threshold has its bucket set to field capacity, so the deficit shown never contradicts the sensor between two starts. It works in that direction only. A dry reading says nothing about how many millimetres are missing without a calibration of the sensor to the soil, and a deficit invented from one would water a zone for good on the strength of a badly placed probe.

### Count only rain that reaches the roots

On a new installation, and in the advanced mode of the **Calculating the watering duration** card. A shower smaller than a fifth of the evapotranspiration of the period wets the leaves and evaporates before the soil sees it, so it is not counted as water for the roots. It acts on the rain that fell, in every calculation, and has nothing to do with the rain forecast options of the weather skip card. It is judged on the whole period between two calculations, not day by day, so a period of several days ignores less than a day-by-day reading would. It does not model runoff on heavy rain; the maximum bucket still caps what the soil keeps. An installation that already existed keeps its setting as it was, and the switch is shown when it is off.

### Continuous updates
The **Continuous updates for sensors** card is only shown in advanced mode, or when the setting is already on. Continuous updates records every change of a sensor of the group, instead of one reading per update, so the averages the calculation works from, hour by hour and for the rain, follow the day more finely. For a group to be recorded this way, it needs a [sensor group](configuration-sensor-groups.md) that does not rely on a weather service (none of the data has its source set to `weather service`).

It records and nothing more. It used to calculate the zones again at every change, which moved the bucket, and the trigger that accounts for the duration of the run, all day. The scheduled calculation now does that once, from the readings recorded, and the live estimate on the Info page and in the zone's live bucket entity shows where a zone stands in between without writing anything. Zones on a pure-sensor group are calculated at the scheduled time like any other. A sensor debounce setting controls how fast changes are recorded.

For continous updates, in the future, it will likely use specific set of aggregates (last for all data points except for solar radiation which will use average of riemann integral) and also requires current precipitation to be mapped in the sensor group.

### Calculation log
Two days with what looks like nearly identical weather can produce very different watering
volumes, and once a calculation has run there is normally no way to see why. Enable
**Calculation log** to append one record per zone calculation to
`config/smart_irrigation/calc_log.jsonl` (one JSON object per line, in metric units), so days
can be compared afterwards instead of reconstructed by hand.

Each record holds the complete chain:
* **Identification**: local and UTC timestamp, zone, sensor group, calculation module, integration version.
* **Inputs**: the interval used (start, end, hours) and, per field, the aggregated value, the aggregation method applied (average / sum / minimum / maximum / riemann sum / delta / ...), how many records went into it, their minimum and maximum, the source (sensor, weather service, static) and whether the value was carried over from the last entry.
* **Module intermediates**: for PyETO the latitude, elevation, coastal flag, day of year, `et_rad`, `cs_rad`, `sol_rad` (and whether it was provided or estimated from temperature), `net_in_sol_rad`, `avp`, `net_out_lw_rad`, `net_rad` and `eto`, per day, plus the deltas list and its mean. The Passthrough and Static modules record their (fewer) inputs the same way.
* **Outputs**: ET deficiency, interval multiplier, precipitation, delta, bucket before and after, maximum bucket, drainage rate and drainage, precipitation rate, resulting duration and the volume in m³.

Dry runs (the `dry_run` option of the [calculate services](usage-services.md)) are logged too -
they are exactly when you ask "why this number?" - but every record carries a `dry_run` flag,
so a dry run is never mistaken for a real calculation.

The setting is off by default. The file is capped at 2 MB and rotated (one backup kept), so it
can be left on for a whole season. The most recent records are also included in the
[diagnostics download](usage-troubleshooting.md) with coordinates rounded and entity ids
removed, so they can be attached to an issue in one step.

To compare two days, for example with [`jq`](https://jqlang.github.io/jq/):

```
jq -c 'select(.zone.name == "Lawn") | {t: .timestamp, eto: .module.days[0].eto, sol_rad: .module.days[0].sol_rad, estimated: .module.days[0].sol_rad_estimated, bucket: .outputs.bucket_after, duration: .outputs.duration}' calc_log.jsonl
```

### Language
The panel and the configuration flow are available in 19 languages, all complete. The French is written with "tu".

### Unit System Responsiveness
Smart Irrigation automatically detects and responds to changes in your Home Assistant unit system setting (metric/imperial). When you change the unit system in Home Assistant:
* All sensor entities immediately update to display values in the new units
* The web interface refreshes to show measurements in the correct units  
* Stored configurations like precipitation thresholds maintain their values but display in appropriate units
* No restart or integration reload is required

This ensures seamless transitions between unit systems without losing your configuration data.


> Main page: [Configuration](configuration.md)<br/>
> Previous: [Guided setup](configuration-setup.md)<br/>
> Next: [Zone configuration](configuration-zones.md)
