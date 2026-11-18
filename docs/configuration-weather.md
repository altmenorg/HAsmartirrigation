---
title: "Configuration: Weather"
---
# Weather configuration

The **Weather** tab gathers what Smart Irrigation reads the weather from, and everything that holds a run back. It has three pages:

* **Weather service**: the [weather service](installation-weatherservice.md), then the location it is read for and how often it is read.
* **Sensor groups**: which sensor or service provides each value the calculation reads, and above them, whether their sensors are recorded at every change (see [sensor groups](configuration-sensor-groups.md#continuous-updates)).
* **Skip watering**: every check that can hold a run back, in one place: the rain forecast, the rain, frost and wind measured when a run starts, the days between irrigation, and a summary of what the zones set for themselves (soil moisture, days of their own). Before 2026.11.1 the page was called **Skip on weather**, and the days between irrigation were under Settings.

The tab was called **Data** before; its pages keep their addresses.

## Weather service

### Location
The weather is read for Home Assistant's location unless you give other coordinates on the **Location coordinates** card (advanced mode; once manual coordinates are on, the card shows in every mode): see [manual coordinates](MANUAL_COORDINATES.md).

### Automatic weather data update
The weather is read every hour out of the box, which suits nearly every installation, so this card is in the advanced mode (Settings > General, how much of the panel to show). Once changed (switched off, another interval or a delay), it shows in every mode, so a setting in use is never hidden.

If enabled, specify how often sensor update should happen (minutes, hours, days). You can also set up an update delay to be used to delay the first update (advanced mode, or shown once it is not 0). This is useful in case your sensors do not provide a value immediately after Home Assistant starts.

As calculation needs weatherdata make sure to update your weather data at least once before calculating.

## Skip watering

### Skipping a run
A start trigger can be held back by the conditions below, all off by default. Under the sensor of the freeze and wind checks, a line says what the check reads and whether a sensor group reads the same value for the evaporation; when a group reads it from another sensor, one tap makes the check read that sensor too. They are checked once a day, when the first start trigger is reached, and the Info page shows each of them with its numbers: whether it is off, could not be checked, is not blocking or is blocking. When a run is skipped, the `smart_irrigation_irrigation_skipped` event fires with the reason.

A condition that cannot be checked, because its sensor is unavailable or the weather service cannot be read, never stops a run: watering goes ahead as it would without it.

* **Rain forecast.** One switch, **Take the forecast rain into account**, and one threshold, **Skip the run from**. The threshold is 2 mm (about 0.08 inch) unless you set one. The rain counted is the rain you can expect, with each forecast weighted by its probability. Where the weather service has an hourly forecast, it is the rain of the 48 hours from the start of the run; otherwise it is the forecast for the day of the run and the next. At or above the threshold the run is skipped, with two overrides so that a forecast that keeps missing does not dry a zone out: after 2 days in a row held back by the forecast, the run goes ahead; and when the rain expected is less than half (0.5) of the largest deficit among the zones that would water, it goes ahead too, because 3 mm of rain is no reason to hold back a zone 25 mm short. Below the threshold, the run goes ahead and each zone is watered for less, as described next. Zones in a greenhouse sensor group still water. The panel keeps two settings behind the one switch (`skip_irrigation_on_precipitation` and `forecast_rain_credit`): the switch shows on when either is on, and turning it on or off sets both.

  **Below the threshold** the duration is reduced in proportion. When a run starts, each zone is watered for the rain forecast to fall in the 24 hours after the start, less: the forecast hours are weighted by the probability the weather service gives, so 10 mm at 30% counts for 3 mm, and a forecast of 4 mm against a 10 mm deficit waters 6 mm. It works alongside the skip above, which stays all or nothing. A greenhouse zone is not reduced, and a forecast that cannot be read leaves the run as calculated.

  Like the rain history below, it shortens the run and leaves the deficit in the water balance. The rain that really falls is measured and credited at the next calculation, so nothing is counted twice, and a forecast that does not come true is made up at the next run. The hours are counted from the moment the run starts, not from the calculation, which on a morning run is hours earlier. The forecast hours come from Open-Meteo, including for installations using another weather service.
* **Rain sensor.** Skip while a binary sensor that is on in the rain says it is raining.

  On the advanced panel, that same sensor can do more than veto today: **shorten runs after recent rain** reads its history over the last five days, weighted so that yesterday counts for more than four days ago, and shortens the run by the result. A day of reported rain today takes the whole run, four days ago takes a tenth of it, and a wet week takes everything.

  It is for one case and it applies to one case: a zone whose sensor group reports **no rain in millimetres at all**, neither a gauge's depth nor a service's rate. Where millimetres exist, the water balance already carries them, decides for itself how long rain keeps counting, and this stays out of the way.

  It never touches the balance, because it does not know how much fell. The deficit stays where it was and is watered off once the weather turns, which is the safe direction: a run that was shortened too much is made up tomorrow, while water that was never owed cannot be taken back out of the ground. It needs a sensor that stays on while it rains; one that pulses briefly per bucket tip spends almost no time on and will barely register.

  The idea of weighting rain over a few rolling days comes from [kloggy's HA-Irrigation-Version2](https://github.com/kloggy/HA-Irrigation-Version2) package, which does it with `history_stats` over five 24-hour windows.
* **Freeze.** Skip when the temperature is at or below the threshold, 2 °C (36 °F) unless you set one. It reads the sensor you choose, or the weather service's current temperature when none is set.
* **Wind.** Skip when the wind is at or above the threshold, 20 km/h (12 mph) unless you set one: in strong wind a sprinkler waters the path rather than the bed. It reads the sensor you choose, or the weather service's current wind. The weather service's wind is stored at 2 m for the evaporation, and is taken back up to the 10 m that forecasts and wind limits are quoted at.
* **Days between irrigation**, on the same page (see [Days between irrigation events](#days-between-irrigation-events)).

Thresholds are entered in your unit system and a sensor is read in its own unit, so a sensor in °F works on a metric installation.

**Soil moisture** is set on each zone rather than here; the page lists the zones that have a sensor, with their threshold, each a link to its zone. Give a zone a soil moisture sensor and a threshold in %, 50 unless you set one, and while the reading is at or above it that zone sits the run out and the others water. Its duration for that run goes to 0 and its water balance is kept, so the deficit rolls over to the next run. Every calculation applies the same rule: a zone whose soil reads at or above its threshold has its water balance set to field capacity, so the deficit shown never contradicts the sensor between two starts. It works in that direction only. A dry reading says nothing about how many millimetres are missing without a calibration of the sensor to the soil, and a deficit invented from one would water a zone for good on the strength of a badly placed probe.

### Days between irrigation events
On the **Skip watering** page, the **Days between irrigation** card (under **Settings > General** before 2026.11.1; the setting is the same). Configure the minimum number of days that must pass between irrigation events. This setting allows you to control how frequently irrigation can occur, which is useful for:
* **Water conservation**: Ensure adequate time between watering sessions
* **Plant health**: Allow soil to partially dry between irrigations
* **Local restrictions**: Comply with watering schedules or restrictions

**How it works:**
* **Default value**: 0 (no restriction - maintains current behavior)
* **Range**: 0-365 days
* When set to 0: Irrigation events can fire daily if conditions are met (default behavior)
* When set to a value > 0: Irrigation events will only fire if the specified number of days have passed since the last irrigation event

The value is the length of the watering cycle in calendar days: set to *N*, irrigation happens every *N* days.

**Different days for one zone:** a zone can have its own number of days, in the **Days between irrigation** field of the [zone settings](configuration-zones.md) (advanced mode; once set, the field shows in every mode). The card lists the zones that have days of their own, each a link to its zone. That number *replaces* this general setting for that zone alone, so a lawn can wait three days while the flower beds are watered every day. Leave the zone's field empty to follow this setting. The general counter only restarts when a zone that follows it is watered, so a zone with days of its own, watered every day, does not keep the others from ever being due. The day is only skipped as a whole when every zone is still within its days; otherwise the run goes ahead for the zones that are due and the others sit it out.

**Example scenarios:**
* Set to 1: Allow irrigation every day (one calendar day between events)
* Set to 3: Allow irrigation every 3 days
* Set to 7: Weekly irrigation

The system automatically tracks the number of days since the last irrigation event. The counter is incremented once per calendar day, at midnight, whether or not irrigation happened that day. If an irrigation trigger occurs but insufficient days have passed, the event is skipped and the counter simply keeps running. When enough days have passed, the next trigger will fire the irrigation event and reset the counter to 0.

This feature works alongside existing precipitation forecasting - if both restrictions apply, both must be satisfied for irrigation to occur.
