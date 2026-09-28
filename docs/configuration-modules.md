---
layout: default
title: Configuration: Modules
---
# Module configuration

> Main page: [Configuration](configuration.md)<br/>
> Previous: [Zone configuration](configuration-zones.md)<br/>
> Next: [Sensor group configuration](configuration-sensor-groups.md)

A module is the method used to work out how much water evaporated.

**You no longer create or pick one.** A zone says how it is calculated, in plain words, on its own card: *calculated from the weather data*, *provided by a sensor or a service*, or *a fixed amount*. The module behind that answer is created and reused for you, one per zone, and its own settings (how many days to look ahead, the fixed amount) are on the zone card too. The engines page has left the panel's navigation, and the three modes below are what those three answers mean.

The sensor group still records which kind of engine it feeds, because what sources a group has to provide depends on it. When one group feeds zones that are calculated differently, it records none and each zone answers for itself.

## The three modes

They differ in one thing: where the evapotranspiration figure comes from. Everything after that, the water balance, the rain, the duration, is the same whichever you choose.

| Mode | Where the figure comes from | What you need |
| --- | --- | --- |
| **Manual** (a fixed amount) | You give one number, used every day | Nothing |
| **Standard** (provided) | An evapotranspiration figure that already exists | A weather service that publishes one, or your own sensor |
| **Advanced** (from the weather data) | Computed from the weather, by FAO-56 Penman-Monteith | Temperature, humidity, pressure and wind, ideally solar radiation |

If you are unsure, **Standard** with Open-Meteo is the shortest path to something correct: it is free, needs no API key, and publishes a reference evapotranspiration computed the same way Advanced would.

> In the logs, the services and the stored configuration these are still called `Static`, `Passthrough` and `PyETO`. The names above are what the panel shows.

### Manual

A fixed amount of evaporation per day, which you set yourself in the **Delta** box. No sensors and no weather service.

It is coarser than the other two, but it is not the same as no integration at all: rain still counts against it, the water balance still tracks what you have already applied, and the duration still follows from your zone's size and throughput. Somewhere around 4 to 5 mm a day is a common starting point for a temperate summer, and worth adjusting by season.

### Standard

Takes an evapotranspiration figure that already exists and uses it as it stands.

Two ways to feed it. Either a weather service that publishes one, which today means **Open-Meteo** among the three supported, or a sensor of your own that reports evapotranspiration. Set the **Evapotranspiration** source in the sensor group accordingly.

Rain still counts: the water balance is the evapotranspiration from this figure minus the precipitation your sensor group reports. Nothing else is required, and the group will not ask you for temperature or wind, because this mode never reads them.

### Advanced

The full FAO-56 Penman-Monteith calculation, from the individual weather quantities. The most accurate option when your sensors sit where the plants are, and the one that asks for the most.

It reads temperature, dewpoint, humidity, pressure, wind speed and solar radiation from the sensor group. Solar radiation is the term that drives the result: when a source provides it, it is used; when none does, it is estimated from the daily temperature range, which is coarser but still workable. Under glass, a light sensor can stand in for a radiation sensor, described under [sensor groups](configuration-sensor-groups.md).

Two settings of its own:

- _Coastal_: enable it if your location is on or near the coast of a large land mass, or anywhere air masses are influenced by a nearby body of water. It adjusts the radiation estimate.
- _Forecast days_: how many forecast days to fold into the calculation. `0` uses today's weather only; a higher value averages today's evapotranspiration with the forecast evapotranspiration of that many upcoming days, so a hot tomorrow raises today's run. It never reads forecast rain: a cloudy, humid day ahead only lowers the average a little, whatever it is forecast to rain. To hold a run back ahead of rain, use the rain forecast condition under [Skipping a run](configuration-general.md#skipping-a-run). Requires a weather service.

## Adding a module

Select a mode and choose `Add module`. It can then be configured, and picked from any sensor group.

Most people never need to come here: the **Setup** tab creates the module, the sensor group and the zone together, from what you answer.

## Deleting a module

![](assets/images/configuration-modules-1.png)

Use the button at the bottom. A module can only be deleted once nothing uses it.

> Main page: [Configuration](configuration.md)<br/>
> Previous: [Zone configuration](configuration-zones.md)<br/>
> Next: [Sensor group configuration](configuration-sensor-groups.md)
