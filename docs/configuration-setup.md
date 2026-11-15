---
layout: default
title: "Configuration: Guided setup"
---
# Guided setup

> Main page: [Configuration](configuration.md)<br/>
> Next: [General configuration](configuration-general.md)

The setup assistant exists because the other pages assume you already know what
a sensor group is. It asks one question at a time, and only the questions your
previous answers leave open, then creates the things a working zone needs.

It is **not a tab**: it is a card of **Settings > General**, under System, because it is for an
installation that has nothing yet, and a tab inviting one with three zones to
set itself up was in the way. Use it for a first zone, another one, or a fresh
start.

You do not have to use it. Everything it does can be done by hand in the panel
(zones under Zones, sensor groups under Weather), and nothing it creates is locked afterwards.

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
this step, except when the service is [a weather entity of Home
Assistant](weather-services.md#a-weather-entity-in-home-assistant): it reports
no rain that fell, so outdoors the wizard asks for a sensor that measures rain
(the rate, or a gauge's total).

## What it creates

A calculation module, a sensor group and a zone, exactly as you would have
created them by hand: [modules](configuration-modules.md),
[sensor groups](configuration-sensor-groups.md) and [zones](configuration-zones.md). The recap on
the last step lists what is about to be created before anything is written.

Afterwards, the zone is an ordinary zone: change the mode, repoint the sensors,
add more zones to the same sensor group, or delete it.

<a id="with-calculate-and-water"></a>**With Calculate and water**, a zone is
only watered once a [program](usage-full-controller.md#programs) has it in a
step, so the assistant puts a new zone with a valve in one. With one program,
the zone becomes its last step; with none, it creates a program (named
"Watering" in your language) with that step and a schedule done by sunrise
every day; with several, the last step asks which one, or a new program. The
step takes the calculated duration. Change it, or move the zone to another
program, under Watering > Programs.
