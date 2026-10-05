---
layout: default
title: Usage: Full controller
---
# Full controller

> Main page: [Usage](usage.md)<br/>
> Previous: [Off-the-shelf controllers](usage-controllers.md)<br/>
> Next: [Coming from Irrigation Unlimited](usage-from-irrigation-unlimited.md)

By default Smart Irrigation decides **how long** each zone waters and leaves the running of the valves to you: an automation, a controller, [Irrigation Unlimited](usage-enhanced-scheduling-integration.md). The **full controller** is an option for those who would rather have it do both. It runs the whole watering itself: when, in what order, with which pump, for how long, and what to do when you want it to stop.

It is **off by default**, and turning it on changes nothing until you add to it. Nothing on this page appears in the panel until it is on.

## Turning it on

On the [General page](configuration-general.md), in the card with direct valve control: **Full controller: Smart Irrigation runs all my watering**.

Switching it on:

- turns on [direct valve control](configuration-closed-loop.md), since it opens and closes the valves itself;
- creates a **main program**, which is what runs today: your start trigger, the sequencing, the pause between zones and cycle and soak, all as you set them. Nothing is copied: change those settings and the main program follows;
- shows the cards below.

Switching it off brings back the previous behaviour: direct valve control returns to what it was before you switched the full controller on (off if it was off), unless you set it yourself in the same change. Your programs and supplies stay stored for the day you switch it on again. If you switched the full controller on with an older version, nothing was remembered, and direct valve control stays on.

One thing is different from the moment it is on: **a valve found open at startup that no run of ours owns is closed.** After a crash or a restart, a valve left open by a run nobody resumes would water until someone noticed. A reading that says nothing (`unavailable`, `unknown`) is never taken for an open valve.

## Pumps and main valves (supplies)

A **supply** is one or several entities, a pump or a main valve in front of the zone valves, that run while a zone they feed is being watered. Add them in the card **Pumps and main valves**, then pick one in each zone's settings.

Each supply has two delays, in seconds, and both are **signed**:

| | Positive | Negative |
| --- | --- | --- |
| **Delay before** | The supply comes on that long *before* the zone valve opens. | The valve opens first, and the supply comes on that long *after*. |
| **Delay after** | The supply stays on that long *after* the zone valve closes. | The supply goes off that long *before* the valve closes, so a pump never pushes against a closed valve. |

A supply is on while **anything holds it**, and goes off when the last hold is given back, after its delay. It is never switched off on a guess of when the cycle will end. Two zones in a row share one run of the pump, and with a delay after the pump stays on between them. A supply that cannot be switched does not stop the watering: it fires `smart_irrigation_supply_problem` and the off is tried twice.

A zone can also have **other valves** that open and close with its own (a zone whose water comes through two valves), and `light` and `cover` entities are accepted as valves.

## Programs

A **program** is an ordered list of **steps**. A step is one zone, or several zones watered at the same time. By default a step takes **the duration Smart Irrigation calculated** for each zone, which is what sets this apart from a timer.

For each step:

- **Duration**: *calculated by Smart Irrigation* (the default), *calculated times a percentage* (110 % in a heat wave, 50 % for a plant that needs less), or *fixed* (seconds of water). The lead time that fills the pipe is kept in every mode. A zone that needs no water gets none, unless the step is fixed.
- **Passes**: the zone waters in this many passes with a soak between them (cycle and soak).
- **Wait after this step**: seconds before the next step. Empty follows the program.
- **Volume limit**: a zone stops once its water meter has counted this many litres. The meter reports every so often, so it is not exact. A zone without a meter ignores it.

For the program:

- **Wait between steps**, for line pressure or a slow valve.
- **Rounds**: the whole list is watered this many times, each round with its share of the water, so the soil can take it in between zones instead of in one go.

**One program, or one cycle of the main program, runs at a time.** A second one waits its turn; it is never run on top, whatever started it, and a manual run asked for during a program is added behind it. The plan is worked out when the turn comes, from the zones as they are then: a zone watered meanwhile is not watered again.

## Schedules

A program has any number of schedules, each a **moment** and the **days** it applies to.

- **The moment** is a time of day, or sunrise or sunset with an offset in minutes. It is either when the program **starts** or when it **must be done**. With the second, the start is worked back from the length of what the program has to water (its steps, waits, passes and soaks). A start that has gone by while its moment is still ahead begins at once rather than losing the day, but only after a restart or a reload of Home Assistant, or when its timer was missed. Editing a program, or a calculation that makes the run longer, never starts a run on the spot: an edit at 05:50 of a "done by 06:00" schedule that now needs 20 minutes waits for tomorrow.
- **The days** are filters, and all of them have to hold: they apply to the day of the **moment**. A run that must be done by Monday 01:00 and takes two hours starts on Sunday at 23:00, and "Monday" is the day that counts. The weather, on the other hand, is judged when the run starts, so that run asks Sunday's conditions. The filters are: days of the week; *every N days* with a shift (three programs with N = 3 and shifts 0, 1 and 2 take turns and never share a day); even or odd days of the month; months; and a period of the year, which may run over New Year (`11-01` to `03-01`).
- **Take the weather into account**, on by default: the same skip conditions as the start trigger apply (rain, frost, wind, a wet soil, postponed days), with the same decision made once a day. On a day when rain is forecast, only the zones the rain cannot reach run. Turn it off for a greenhouse drip line that does not care.

Good to know: the weather holds work on the zones' calculated durations, which all programs share. On a day a weather-aware start has held a zone back, a program that ignores the weather but waters that zone for its *calculated* duration finds nothing to water. For a zone that must be watered whatever the weather says, give its step a *fixed* duration.

A schedule that comes due while its program is already running or waiting starts nothing and counts no watering day; the days between irrigations are only reset for the zones that really start. A program deleted, disabled or suspended while it runs stops before its next step. Deleting a program or a schedule also clears what was remembered of its last run, so a new schedule never inherits it.

The Smart Irrigation schedules are armed when a setting changes, after a calculation and at a new day, like the start trigger.

## Driving the watering

The buttons of the Programs card, and these [services](usage-services.md):

| Service | What it does |
| --- | --- |
| `smart_irrigation.run_program` | Runs a program now, or when it is its turn. |
| `smart_irrigation.water_zone` | Waters a zone for a number of seconds of water, or for its calculated duration. Takes its turn like everything else. |
| `smart_irrigation.pause_watering` | Closes the open valves and holds everything, the zones waiting included. The clock stops: what was delivered is credited and, after the resume, the part of the pass still owed is watered. A pause that is not lifted ends by itself after an hour (or the `minutes` given). |
| `smart_irrigation.resume_watering` | Goes on from where the pause stopped. |
| `smart_irrigation.next_step` | Ends the zones of the step a program is on, and lets it go on. |
| `smart_irrigation.stop_watering` | Stops now: every valve is closed, each zone is credited for the water it delivered, programs and waiting zones end. With zones chosen, only those. It also ends a pause. |
| `smart_irrigation.suspend` | Keeps a zone or a program from watering for some hours or until a date. Zero hours lifts it. Hours are limited to 8760, a date that cannot be read is refused (it never lifts a suspension), and an unknown program id is ignored. |
| `smart_irrigation.use_measured_throughput` | Takes the flow a zone's meter measured as its throughput. The measurement is advice and is never applied on its own. |

## Seeing what is going on

- The **Planning** card lists what the programs will water over the next three days, with the zones and minutes, and shows what is watering now: the step, the round, how far along, the valves that are open and for how much longer. The weather is not known days ahead: a planned run goes ahead if nothing holds it back.
- One **sensor per program** (`sensor.smart_irrigation_program_<id>`): `idle`, `waiting`, `running`, `paused`, `suspended` or `disabled`, with the next start, the last run, the suspension and, while it runs, the step and how far along.
- Events: `smart_irrigation_program_started` and `smart_irrigation_program_finished` (with the zones watered, the problems and whether it was stopped), `smart_irrigation_valve_on` and `smart_irrigation_valve_off` at every switch of a valve or a supply, and `smart_irrigation_supply_problem`. The [other events](usage-events.md) keep firing.

## When Home Assistant restarts

A program run and a cycle that is under way are recorded as they go. After a restart the run that was open is finished from its own record first, then the steps still to do follow, one at a time. A run more than six hours old is not resumed: it belongs to another day. What is **not** resumed: the remaining passes of the zone that was open (only the pass in progress is), and a pause (valves stay closed, and the pause is gone).

A valve that is slow to say it is open, a battery valve on Zigbee for instance, is given 30 seconds instead of 8 and is asked to open again at 10 and 20 seconds. Only one that stays closed after that is a failure, reported as `valve_did_not_open`.

## Limitations

- A flow meter shared by the zones of a parallel step cannot tell their water apart, and splits it wrongly between them. Give each zone its own meter.

## What it is not

It is not a pressure controller, a master-valve scheduler for a whole farm, or a replacement for a controller that already does its job. If a Rain Bird, Hydrawise, Rachio, OpenSprinkler or B-hyve runs your valves, [its blueprint](usage-controllers.md) is the right way and the full controller has nothing to add to it.

> Next: [Coming from Irrigation Unlimited](usage-from-irrigation-unlimited.md)
