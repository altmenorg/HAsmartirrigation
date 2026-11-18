---
title: "Modules"
---
# Modules

A module is the method used to work out how much water evaporated.

**You no longer create or pick one.** A zone says how it is calculated, in plain words, in its **Evapotranspiration** field: *Calculated by Smart Irrigation*, *Provided by a sensor or a service*, or *A fixed amount*. The module behind that answer is created and reused for you, one per zone, and its own settings (how many days to look ahead, coastal, the fixed amount) are on the zone card too. There is no modules page any more: the three modes below are what those three answers mean.

The sensor group still records which kind of module it feeds, because what sources a group has to provide depends on it. When one group feeds zones that are calculated differently, it records none and each zone answers for itself.

## The three modes

They differ in one thing: where the evapotranspiration figure comes from. Everything after that (the water balance, the rain, the duration) is the same whichever you choose.

| The zone's answer | Mode | Where the figure comes from | What you need |
| --- | --- | --- | --- |
| *A fixed amount* | **Manual** | You give one number, used every day | Nothing |
| *Provided by a sensor or a service* | **Standard** | An evapotranspiration figure that already exists | A weather service that publishes one, or your own sensor |
| *Calculated by Smart Irrigation* | **Advanced** | Computed from the weather, with FAO-56 Penman-Monteith | Temperature, humidity, pressure and wind, ideally solar radiation |

If you are unsure, *Provided by a sensor or a service* with Open-Meteo is the shortest path to something correct: it is free, needs no API key, and publishes a reference evapotranspiration computed the same way Smart Irrigation would.

!!! note "Names in the code"

    The setup assistant's summary uses the mode names (Manual, Standard, Advanced). In the logs, the services and the stored configuration, the modules are still called `Static`, `Passthrough` and `PyETO`.

### A fixed amount (Manual)

A fixed amount of evaporation per day, which you set on the zone card (**Evaporation per day**), as a positive number: 4 means the zone loses 4 mm a day. No sensors and no weather service.

It is coarser than the other two, but it is not the same as no integration at all: rain still counts against it, the water balance still tracks what you have already applied, and the duration still follows from your zone's size and throughput. Somewhere around 4 to 5 mm a day is a common starting point for a temperate summer, and worth adjusting by season.

??? note "Coming from v2026.10.6 or earlier"

    Underneath, the module stores the amount as the change to the water balance, -4. A positive value stored before v2026.10.7 added water every day instead, and is turned around when Smart Irrigation starts.

### Provided by a sensor or a service (Standard)

Takes an evapotranspiration figure that already exists and uses it as it stands.

Two ways to feed it: a weather service that publishes one, which among the online services means **Open-Meteo**, or a sensor of your own that reports evapotranspiration. Set the **Evapotranspiration** source of the sensor group accordingly (**Ready-made ET₀ from the weather service**, or the sensor).

Rain still counts: the water balance is the evapotranspiration from this figure minus the precipitation your sensor group reports. Nothing else is required, and the group does not ask for temperature or wind, because this mode never reads them.

### Calculated by Smart Irrigation (Advanced)

The full FAO-56 Penman-Monteith calculation, from the individual weather quantities. The most accurate option when your sensors sit where the plants are, and the one that asks for the most.

It reads temperature, dew point, humidity, pressure, wind speed and solar radiation from the sensor group. Solar radiation is the term that drives the result: when a source provides it, it is used; when none does, it is estimated from the daily temperature range, which is coarser but still workable. Under glass, a light sensor can stand in for a radiation sensor, described under [sensor groups](configuration-sensor-groups.md).

Two settings of its own, on the zone:

- **Coastal site** (advanced mode): for a location on or near the coast of a large land mass, or anywhere air masses are influenced by a nearby body of water. It adjusts the radiation estimate.
- **Look ahead** (advanced mode): how many forecast days to fold into the calculation. `0` uses today's weather only; a higher value averages today's evapotranspiration with the forecast evapotranspiration of that many days to come, so a hot tomorrow raises today's run. It never reads forecast rain: a cloudy, humid day ahead only lowers the average a little, whatever rain is forecast. To hold a run back ahead of rain, use the rain forecast check under [Skipping a run](configuration-weather.md#skipping-a-run). It needs a weather service.

## Adding and deleting a module

A zone creates the module behind it when you choose how it is calculated, and a module nothing uses any more is removed. The [setup assistant](configuration-setup.md) creates the module, the sensor group and the zone together, from your answers.
