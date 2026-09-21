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

### Automatic duration calculation
If enabled, set the time of calculation (HH:MM). Calculation uses weatherdata that is collected in updates to determine irrigation duration.

Each zone reads only the readings that arrived since its own last calculation, and remembers how far it has read. Readings are dropped once every zone using that sensor group has consumed them, so two zones sharing a group can calculate at different times without either of them losing data.

Irrigation usually starts hours after the calculation, and it can rain in between. When the start trigger is reached, each automatic zone's duration is reworked against the rain collected since its calculation, so a night of rain shortens the run or cancels it instead of watering the full calculated amount on wet ground.

The bucket itself is left alone by that. It is a running balance: irrigation credits it by the water actually applied and the next calculation adds the whole interval's rain, so crediting the rain at the start as well would count it twice. A run is only ever shortened this way, never lengthened, and a dry night leaves the calculated duration exactly as it is.

Note that the run still starts at the time it was scheduled for. A trigger set to finish at sunrise works back from the duration known at calculation time, so a run shortened by rain finishes early rather than starting late.

#### Calculate evapotranspiration hour by hour (beta)
Off by default. When on, PyETO sums the FAO-56 hourly equation (Eq. 53) over each hour of the zone's window instead of running the daily equation on the window's averages. The daily form is biased by cloudiness, because an average day hides whether the sun and the heat came together; summing the hours removes most of that bias. The hourly equation and its row builder come from [JustChr's Irrigation Plus fork](https://github.com/JustChr/HAsmartirrigation).

It needs temperature, humidity, wind speed and solar radiation in the sensor group (a sensor or a weather service), and the site's coordinates. With forecast days set on PyETO, with no solar radiation source, or with any other module, the daily equation keeps being used, so switching it on never leaves a zone without a calculation. The calculation explanation says which form was used.

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

**Example scenarios:**
* Set to 1: Allow irrigation every day (one calendar day between events)
* Set to 3: Allow irrigation every 3 days
* Set to 7: Weekly irrigation

The system automatically tracks the number of days since the last irrigation event. The counter is incremented once per calendar day, at midnight, whether or not irrigation happened that day. If an irrigation trigger occurs but insufficient days have passed, the event is skipped and the counter simply keeps running. When enough days have passed, the next trigger will fire the irrigation event and reset the counter to 0.

This feature works alongside existing precipitation forecasting - if both restrictions apply, both must be satisfied for irrigation to occur.

### Continuous updates (experimental)
Continuous updates is an experimental feature that tries to capture more granular weather data to avoid missing chunks of weather patterns. For a zone to be continuous updated, it needs to:
* be set to `automatic`
* use a [sensor group](configuration-sensor-groups.md) that does not rely on a weather service (none of the data has its source set to `weather service`). 
* not use forecasting, as it relies on weather services. Set `forecast days` for PyETO to `0`.

Any zone that does not meet the above requirements is not included in the continuous updates and instead will be included in the automatic update and calculation at the time configured. 
Any zone that does meet this requirement will not be included in the automatic update and calculation.

A sensor debounce setting is also provided to provide control over the speed of continuous updates.

Please note that this is experimental right now and will have bugs.

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
