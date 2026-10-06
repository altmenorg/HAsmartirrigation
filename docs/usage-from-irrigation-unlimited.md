---
layout: default
title: Usage: Coming from Irrigation Unlimited
---
# Coming from Irrigation Unlimited

> Main page: [Usage](usage.md)<br/>
> Previous: [Full controller](usage-full-controller.md)<br/>
> Next: [Troubleshooting](usage-troubleshooting.md)

[Irrigation Unlimited](https://github.com/rgc99/irrigation_unlimited) (IU) is a scheduler and a sequencer of valves with no water model: it does not know the weather, the evapotranspiration or how much water a zone has lost. Smart Irrigation does, and until now the two were joined by two automations written by hand (`adjust_time` into IU, `reset_bucket` at the end).

The [full controller](usage-full-controller.md) does the scheduling and the running itself. This page says where each thing you used in IU went. It does not import a YAML configuration (that may come, if people ask for it): you rebuild it in the panel, which is usually quicker than it sounds.

## The words

| In Irrigation Unlimited | In Smart Irrigation |
| --- | --- |
| Controller (and its master entity) | **Supply**: a pump or a main valve, with a delay before and after that can be negative |
| Zone | Zone, with its linked valve (and, if it needs several, other valves) |
| Sequence | **Program** |
| Sequence zone (a step) | **Step**: one zone, or several watered together |
| Step with zones in parallel | A **step** with several zones, watered at the same time |
| Delay between steps, including a negative one | **Wait after this step** or the program's **wait between steps**; a negative value overlaps the steps (up to an hour) |
| `adjust_time` (`actual`, `percentage`, `increase`, `decrease`) | The step's duration: *calculated* (the default), *calculated times a percentage*, or *fixed*, with a minimum, a maximum and an offset in seconds (`min_seconds`, `max_seconds`, `adjust_seconds`). For a temporary change of a whole program, `smart_irrigation.adjust_program` (a `percent` and/or `seconds`, for some `hours` or until reset). You no longer need an automation to hand it the duration, because the calculated one is the default. |
| `reset_bucket` after the run | Nothing to do: a run of ours credits the bucket itself, for the water that went through |
| `suspend` | `smart_irrigation.suspend`, for a zone or a program, for some hours or until a date |
| `manual_run` | `smart_irrigation.water_zone` or `smart_irrigation.run_program`. A manual run joins the queue and takes its turn by default (`mode: queue`); `mode: replace` stops what is running first. `run_program` also takes `seconds`, a total shared between the steps, and `stop_program` ends one program. |
| `cancel` | `smart_irrigation.stop_watering` |
| Pause and resume | `smart_irrigation.pause_watering` and `resume_watering` |
| Skip to the next step | `smart_irrigation.next_step` |
| Schedule (time, sun, cron) | A program's **schedules**: time of day or sun (with an offset and a fallback time for polar days), with the days as filters. Cron is not supported. |
| `anchor: start` and `anchor: finish` | The schedule's moment is when the program **starts**, or when it **must be done** (the start is worked back from the length of the run) |
| Weekdays, day of the month, even/odd, `every_n_days`, months, `from`/`to` | The same filters, on each schedule: days of the week, every N days with a shift, even or odd days, named days of the month (`1, 15, last`), months, and a period of the year that may span New Year |
| `entity_states` | Not the same feature. In IU it lets a timed valve receive only the on command, only the off, or neither. We have no such switch. The nearest things are the per-zone **safety off mode** (`auto`, `zha`, `off`), which can arm a hardware timed off (MQTT topic, or a ZHA command) as a dead-man behind the normal close, and [the check while a valve is open](usage-full-controller.md). The ZHA timed off is opt-in because a Sonoff SWV on ZHA does not honour it. See [closed loop](configuration-closed-loop.md). |
| `irrigation_unlimited_start` and `finish` events | `smart_irrigation_program_started` and `program_finished` |
| `valve_on` and `valve_off` events | `smart_irrigation_valve_on` and `valve_off`, for zones and supplies |
| `sync_error` and `switch_error` | `smart_irrigation_zone_problem` and `supply_problem` |

## What is different

- **Programs never overlap.** IU lets overlapping runs go on together; here a second program waits for the first, and a step with several zones (or a negative wait between steps) is how you ask for zones at the same time. A pump on a home network seldom has the pressure for more.
- **The weather is part of the schedule.** A schedule skips, shortens or holds back what the skip conditions say. Turn it off per schedule if you want a plain timer.
- **The default duration is the one Smart Irrigation calculated**, not a number you type.
- **Nothing is configured in YAML.** It is all in the panel, and a restart goes on with the steps still to do instead of dropping a run that was under way.

## Not in Smart Irrigation

- Cron schedules.
- Several independent controllers, each with its own sequences. Several supplies are possible, and each zone picks its own, but there is one program queue.
- Overlap of whole programs: only the steps of one program can overlap (negative wait), never two programs.
- Import of an IU YAML configuration.
- An adjustable granularity, renaming the entities IU creates, a built-in simulator.
- IU's `entity_states` choice of which commands a timed valve receives.

## Not in Irrigation Unlimited

- A water model: evapotranspiration, a bucket per zone, and a bucket credit for the water that really went through.
- Durations calculated from the weather, instead of typed.
- Weather skip conditions (rain, frost, wind, wet soil) that can be set per schedule.
- Hardware dead-man arming (MQTT or ZHA) and a check that a valve did not close by itself while it should be open.

## Moving over

1. Switch on the [full controller](usage-full-controller.md).
2. Add your pump or main valve as a supply, and pick it in each zone.
3. Make a program per IU sequence: its steps are the sequence's zones, in order. Leave the duration on *calculated*.
4. Add a schedule to each. If IU ran it to finish at sunrise, take *Sunrise*, *must be done*.
5. Switch IU's own schedules off, and remove the two automations that handed it durations and reset the bucket.
6. Look at the **Planning** card: it shows the next three days. Compare it with what IU would have done before you remove IU.

> Previous: [Full controller](usage-full-controller.md)
