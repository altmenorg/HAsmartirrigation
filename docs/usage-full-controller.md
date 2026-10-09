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
- **Minimum deficit** (`min_deficit_mm`, 0 to 100, 0 means none): a zone is only watered by the step when its water deficit (how far its bucket is below zero, in mm) is at least this. A zone under it sits the step out, with the reason `below_deficit` in the log. It applies to calculated and percent steps; a fixed step is always watered.
- **Minimum, maximum and offset** (`min_seconds`, `max_seconds`, `adjust_seconds`): the water of a step is raised to the minimum or capped at the maximum (0 means none), after the percentage and after the offset, a signed number of seconds (-6 h to +6 h) added to it. A minimum never turns a zone that needs no water into watering: a calculated duration of zero stays zero. The lead time is added on top of these bounds.
- **Passes**: the zone waters in this many passes with a soak between them (cycle and soak).
- **Wait after this step**: seconds before the next step. Empty follows the program. A **negative** wait overlaps the steps: the next one starts that many seconds before this one ends, so the valves and the pump of both are open together for that time (up to an hour, and never longer than this step runs).
- **Volume limit**: a zone stops once its water meter has counted this many litres. The meter reports every so often, so it is not exact. A zone without a meter ignores it.

For the program:

- **Wait between steps**, for line pressure or a slow valve. A negative value overlaps each step with the one before, as above.
- **Rounds**: the whole list is watered this many times, each round with its share of the water, so the soil can take it in between zones instead of in one go.

**One program, or one cycle of the main program, runs at a time.** A second one waits its turn; it is never run on top, whatever started it, and a manual run asked for during a program is added behind it. The plan is worked out when the turn comes, from the zones as they are then: a zone watered meanwhile is not watered again.

## Schedules

A program has any number of schedules, each a **moment** and the **days** it applies to.

- **The moment** is a time of day, or sunrise or sunset with an offset in minutes. It is either when the program **starts** or when it **must be done**. With the second, the start is worked back from the length of what the program has to water (its steps, waits, passes and soaks). A start that has gone by while its moment is still ahead begins at once rather than losing the day, but only after a restart or a reload of Home Assistant, or when its timer was missed. Editing a program, or a calculation that makes the run longer, never starts a run on the spot: an edit at 05:50 of a "done by 06:00" schedule that now needs 20 minutes waits for tomorrow. The same goes for a schedule that **starts** at its moment: if Home Assistant was down then, the run is caught up after the restart when it is at most **2 hours** late and has not run for that occurrence; later than that, it is passed over to the next occurrence.
- **Hard deadline** (only for a schedule that must be done by its moment): by default that moment is a target, and a run that starts late, or has a longer plan than expected, or is paused, simply ends later. Turn on `hard_deadline` and the moment is a limit: at that time the zones still open are closed the normal way (each is credited for the water it delivered), the steps not started are dropped, and the `program_finished` event carries `cut: true` and `reason: "deadline"` (the log says so too). A run that gets its turn after the deadline has passed opens nothing. With a deadline, the zones of each step are also ordered driest first (lowest bucket, the largest water deficit); steps keep their order and the zones of a step still open together, so the ordering only decides which zone opens first. If the controller restarts mid-run, the deadline is kept with the run.
- **Polar day and night**: a sunrise or sunset schedule has no moment on a day when the sun does not rise or set, and that day is skipped. Give the schedule a *fallback time* (`HH:MM`, or `previous` to reuse the time of the last sunrise or sunset seen, offset included) to water at that time instead. Without one, nothing changes.
- **The days** are filters, and all of them have to hold: they apply to the day of the **moment**. A run that must be done by Monday 01:00 and takes two hours starts on Sunday at 23:00, and "Monday" is the day that counts. The weather, on the other hand, is judged when the run starts, so that run asks Sunday's conditions. The filters are: days of the week; *every N days* with a shift (three programs with N = 3 and shifts 0, 1 and 2 take turns and never share a day); even or odd days of the month; named days of the month (`1, 15, last`, where a month too short for a day skips it, `31` in April, and `last` is every month's own last day); months; and a period of the year, which may run over New Year (`11-01` to `03-01`).
- **Take the weather into account**, on by default: the same skip conditions as the start trigger apply (rain, frost, wind, a wet soil, postponed days), with the same decision made once a day. On a day when rain is forecast, only the zones the rain cannot reach run. Turn it off for a greenhouse drip line that does not care.
- **Which conditions** (`skip_conditions`, optional): a list choosing which of the skip conditions this schedule applies, among `postponed`, `rain_sensor`, `freeze`, `wind`, `precipitation`, `days_between` and `soil_moisture`. Left out, all of them apply, as before. Your own postponement always applies when the weather is taken into account. The schedule judges its chosen conditions at the moment it starts, rather than using the day's shared decision; the holds that follow (days between per zone, a moist soil, rain since the calculation) are the same ones, except that a zone is only held by its days between when that condition is chosen.

Good to know: the weather holds work on the zones' calculated durations, which all programs share. On a day a weather-aware start has held a zone back, a program that ignores the weather but waters that zone for its *calculated* duration finds nothing to water. For a zone that must be watered whatever the weather says, give its step a *fixed* duration.

A schedule that comes due while its program is already running or waiting starts nothing and counts no watering day; the days between irrigations are only reset for the zones that really start. A program deleted, disabled or suspended while it runs stops before its next step. Deleting a program or a schedule also clears what was remembered of its last run, so a new schedule never inherits it.

The Smart Irrigation schedules are armed when a setting changes, after a calculation and at a new day, like the start trigger.

## Driving the watering

The buttons of the Programs card, and these [services](usage-services.md):

| Service | What it does |
| --- | --- |
| `smart_irrigation.run_program` | Runs a program now, or when it is its turn. Optional `seconds` (1 to 86400) is a total for the whole program, shared between its steps in proportion to their planned durations (the main program ignores it); left out, the planned durations. Optional `mode`: `queue` (default) takes the turn behind what is running, `replace` first stops what runs and waits, cleanly (valves closed, delivered water credited), then runs the program. |
| `smart_irrigation.water_zone` | Waters a zone for a number of seconds of water, or for its calculated duration. With `mode: queue` (default) it takes its turn like everything else; with `mode: replace` it first stops what is running and waiting. With several zones, only the first replaces, the others follow it. |
| `smart_irrigation.stop_program` | Stops one program: if it runs, its open zones close the normal way and are credited for what they delivered, and no further step starts; if it waits for its turn, it is taken out of the queue. An unknown id does nothing. The main program is stopped with `stop_watering`. |
| `smart_irrigation.set_program_enabled`, `set_step_enabled`, `set_schedule_enabled` | Switch a program, one of its steps (`step_id`) or one of its schedules (`schedule_id`) on or off (`enabled`), as the panel does: the schedules are armed again and the panel refreshes. With the full controller off nothing changes; an unknown program, step or schedule id is refused with an error. |
| `smart_irrigation.pause_watering` | Closes the open valves and holds everything, the zones waiting included. The clock stops: what was delivered is credited and, after the resume, the part of the pass still owed is watered. A pause that is not lifted ends by itself after an hour (or the `minutes` given). |
| `smart_irrigation.resume_watering` | Goes on from where the pause stopped. |
| `smart_irrigation.next_step` | Ends the zones of the step a program is on, and lets it go on. With overlapping steps, it ends every step that is open. |
| `smart_irrigation.stop_watering` | Stops now: every valve is closed, each zone is credited for the water it delivered, programs and waiting zones end. With zones chosen, only those. It also ends a pause. |
| `smart_irrigation.suspend` | Keeps a zone or a program from watering for some hours or until a date. Zero hours lifts it. Hours are limited to 8760, a date that cannot be read is refused (it never lifts a suspension), and an unknown program id is ignored. |
| `smart_irrigation.adjust_program` | Makes a program water longer or shorter for a while (Irrigation Unlimited's `adjust_time`): a `percent` (0 to 1000) of every step's water, and/or `seconds` added to it, for `hours` (1 to 8760) or until reset. It replaces the previous adjustment instead of adding to it, applies to the runs that start after it is set (not to the one under way), survives a restart, and `reset: true` clears it. Refused when the full controller is off. The program's sensor shows it in the `adjustment` attribute. |
| `smart_irrigation.use_measured_throughput` | Takes the flow a zone's meter measured as its throughput. The measurement is advice and is never applied on its own. |

## Seeing what is going on

- The **Planning** card lists what the programs will water over the next three days, with the zones and minutes, and shows what is watering now: the step, the round, how far along, the valves that are open and for how much longer. Each planned run carries its expected seconds. For a run in the next 48 hours (as far as the rain forecast reaches) it also says when the forecast would hold it back: `skipped_reason` is `precipitation`, with the forecast and threshold behind it. A run that ignores the weather, or one further away, gets no reason: the weather is not known days ahead, and a planned run goes ahead if nothing holds it back. Only forecast conditions are predicted, not what the sensors read now.
- <a id="dry-zone-notice"></a>**A dry zone nothing will water.** Once a day, an automatic zone whose bucket has been dry for more than 3 days while no program covers it raises a repair notice (one per zone) and fires `smart_irrigation_zone_unwatered`. Dry means a deficit of at least half the zone's maximum bucket, or its irrigation threshold when that is larger (never under 1 mm). Covered means the main program is on, or another program is enabled, not suspended, has an enabled schedule and an enabled step with the zone. A zone you suspended yourself is left alone. The notice clears when the zone is watered or a program covers it again. The count starts again after a restart.
- One **sensor per program** (`sensor.smart_irrigation_program_<id>`): `idle`, `waiting`, `running`, `paused`, `suspended` or `disabled`, with the next start, the last run, the suspension and, while it runs, the step and how far along.
- **A check while a valve is open.** Every 60 seconds, the zone's linked valve is read. If it reads `off` or `closed`, it shut by itself (a water-shortage auto-close, a timed-off that ran out, somebody closing it at the device): `smart_irrigation_valve_out_of_sync` is fired, with a `smart_irrigation_zone_problem` of reason `valve_closed_early`, and the zone's run ends. The valve is **not** opened again, so a device that closed for lack of water stays shut. The zone is credited for the time the valve was open, taken from the moment its state changed (or, failing that, the moment the check noticed it, so the credit is then exact to about a minute). A valve that reads `unknown` or `unavailable` is never taken for a closed one. Only the linked valve is checked, not the extra ones.
- Events: `smart_irrigation_program_started` and `smart_irrigation_program_finished` (with the zones watered, the problems and whether it was stopped), `smart_irrigation_valve_on` and `smart_irrigation_valve_off` at every switch of a valve or a supply, `smart_irrigation_valve_out_of_sync` and `smart_irrigation_supply_problem`. The [other events](usage-events.md) keep firing.

## When Home Assistant restarts

A program run and a cycle that is under way are recorded as they go. After a restart the run that was open is finished from its own record first, then the steps still to do follow, one at a time. A run more than six hours old is not resumed: it belongs to another day. With overlapping steps, the record is that of the later step: the earlier one that was still open is finished from its own record, and the later one restarts with the zones it had not started. What is **not** resumed: the remaining passes of the zone that was open (only the pass in progress is).

A **pause** survives a restart while its end is still ahead: the watering is held again until then (or until you resume), and the valves that were open are not reopened by the pause itself; the program goes on from the resume as it does after any pause. A valve run interrupted by the restart is held the same way: nothing is opened (the pump included) while the pause lasts, and the rest of its pass is watered after the resume, with the water delivered before the restart credited once. A manual run you stopped while it waited is also removed from the stored queue at once, and queued runs wait for every run resumed after the restart (a valve run or a cycle, not only a program) before they start. **The water a pause owes is kept too:** when a pause closes the valves of a step, what each zone still owes (and the passes after it) is recorded, so a reload (an options save) or a restart during the pause does not lose it. After it, and once the pause is over, those zones water what they owed first (credited once, the part delivered before the pause having been credited already), then the program goes on with the next steps. A pause that ended while Home Assistant was down is not held again, and the owed water is watered at once; owed water more than 30 hours old is dropped. **Manual runs waiting for their turn** (a `run_program` asked for during another program) are kept too: after a restart they are put back in line, behind a program that is being resumed, unless they are more than six hours old or their program is gone, disabled or suspended.

A valve that is slow to say it is open, a battery valve on Zigbee for instance, is given 30 seconds instead of 8 and is asked to open again at 10 and 20 seconds. Only one that stays closed after that is a failure, reported as `valve_did_not_open`.

A **Sonoff SWV on ZHA** is opened with one command, ZHA's *on with timed off*, which opens the valve and bounds it at the same time: the time is the pass length plus a 30-second margin, so the valve closes itself even if Home Assistant dies right after opening. Smart Irrigation still closes it at the normal time, and a repeated open (above) sends the same command. If that command fails, a warning is logged once for the zone and the valve is opened the normal way. See [closed-loop control](configuration-closed-loop.md) for the details and the other valves.

## Limitations

- A flow meter shared by zones that water at the same time cannot tell their water apart. While they overlap, their **volume limit** counts the meter's litres divided equally by the number of zones on it (an approximation), and their litres are **not** credited from the meter nor used to calibrate the measured flow: they are credited by time, and a line in the log says so once. Give each zone its own meter for exact limits and calibration.

## What it is not

It is not a pressure controller, a master-valve scheduler for a whole farm, or a replacement for a controller that already does its job. If a Rain Bird, Hydrawise, Rachio, OpenSprinkler or B-hyve runs your valves, [its blueprint](usage-controllers.md) is the right way and the full controller has nothing to add to it.

> Next: [Coming from Irrigation Unlimited](usage-from-irrigation-unlimited.md)
