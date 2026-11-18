---
title: "Setup assistant"
---
# Setup assistant

The setup assistant exists because the other pages assume you already know what a sensor group is. It asks one question at a time, and only the questions your previous answers leave open, then creates the things a working zone needs.

It is **not a tab**: open it with **Open the assistant**, on its card under **Settings › General**, in the System section. Use it for a first zone, another one, or a fresh start.

You do not have to use it. Everything it does can be done by hand in the panel (zones under **Zones**, sensor groups under **Weather › Sensor groups**), and nothing it creates is locked afterwards.

## What it asks

**What should Smart Irrigation do?** Only for the first zone: **Calculate and water** (Smart Irrigation opens the valves itself, with a program) or **Calculate only** (your automation, Irrigation Unlimited or your controller opens them). See [What Smart Irrigation does](configuration-general.md#calculate-and-water-calculate-only-or-stop-everything).

**What are you watering?** A name, the area, the flow, and the valve. The flow is the quantity of water this zone delivers per minute, and it is worth measuring rather than reading off a datasheet: every duration is computed from it, so an optimistic figure is the quietest way to water for twice as long as you think.

**Where does it grow?** Outdoors, or under glass or plastic. A greenhouse never receives rain, so saying so stops a rain forecast from holding back a watering the rain cannot reach, and hides the sources that would measure weather the plants never see.

**Where should the evaporation figure come from?** Four answers, in plain terms rather than by the name of the method behind them:

- the weather service you configured, which needs nothing installed (offered once a [weather service](installation-weatherservice.md) is on, and not under glass);
- your own weather sensors;
- a sensor that already reports evapotranspiration;
- a fixed amount per day.

They map onto the three [calculation modes](configuration-modules.md), and the assistant picks the mode for you.

**Which entities should it read?** Only when your previous answer needs them, and only the sources the chosen mode actually reads. Choosing the weather service skips this step, except when the service is [a weather entity of Home Assistant](weather-services.md#a-weather-entity-in-home-assistant): it reports no rain that fell, so outdoors the assistant asks for a sensor that measures rain (the rate, or a gauge's total).

## What it creates

A calculation module, a sensor group and a zone, exactly as you would have created them by hand: [modules](configuration-modules.md), [sensor groups](configuration-sensor-groups.md) and [zones](configuration-zones.md). The last step lists what is about to be created before anything is written.

Afterwards, the zone is an ordinary zone: change how it is calculated, point it at other sensors, add more zones to the same sensor group, or delete it.

## With Calculate and water

A zone is only watered once a [program](usage-full-controller.md#programs) has it in a step, so the assistant puts a new zone with a valve in one:

- with no program, it creates one, named **Watering** in your language, with that step and a schedule done by sunrise every day;
- with one program, the zone becomes its last step;
- with several, the last step of the assistant asks which one, or a new program.

The step takes the calculated duration. Change it, or move the zone to another program, under **Watering › Programs**.
