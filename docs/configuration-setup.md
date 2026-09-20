---
layout: default
title: Configuration: Guided setup
---
# Guided setup

> Main page: [Configuration](configuration.md)<br/>
> Next: [General configuration](configuration-general.md)

The **Setup** tab is the first one in the panel, and it exists because the
others assume you already know what a sensor group is. It asks one question at
a time and only the questions your previous answers leave open, then creates
the three things a working zone needs.

You do not have to use it. Everything it does can be done by hand on the other
tabs, and nothing it creates is locked afterwards.

## What it asks

**What are you watering.** A name, the area, and the flow. The flow is the
quantity of water this zone delivers per minute, and it is worth measuring
rather than reading off a datasheet: every duration is computed from it, so an
optimistic figure is the quietest way to water for twice as long as you think.

**Where it grows.** Outdoors, or under glass or plastic. A greenhouse never
receives rain, so saying so stops a rain forecast pausing irrigation that the
rain cannot reach, and hides the sources that would measure weather happening
somewhere the plants are not.

**Where the evaporation should come from.** Four answers, in plain terms
rather than by the name of the algorithm behind them:

- the weather service you have configured, which needs nothing installed;
- your own weather sensors;
- a sensor that already reports evapotranspiration;
- a fixed quantity per day.

They map onto the three [calculation modes](configuration-modules.md). The
wizard picks the mode for you.

**Which sensors.** Only when your previous answer needs them, and only the
sources the mode you chose actually reads. Choosing the weather service skips
this step entirely.

## What it creates

A calculation module, a sensor group and a zone, exactly as the
[Modules](configuration-modules.md), [Sensor groups](configuration-sensor-groups.md)
and [Zones](configuration-zones.md) tabs would have created them. The recap on
the last step lists what is about to be created before anything is written.

Afterwards, the zone is an ordinary zone: change the mode, repoint the sensors,
add more zones to the same sensor group, or delete it.
