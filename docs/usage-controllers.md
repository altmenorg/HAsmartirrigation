---
layout: default
title: Usage: Off-the-shelf controllers
---
# Off-the-shelf controllers

> Main page: [Usage](usage.md)<br/>
> Previous: [Automations](usage-automations.md)<br/>
> Next: [Troubleshooting](usage-troubleshooting.md)

If your valves are wired to a commercial controller, you do not have to replace it. Smart Irrigation decides **how long** each zone waters, and the controller **runs** the valves, through the action its Home Assistant integration provides. One blueprint per controller does the plumbing:

| Controller | Integration | Action the blueprint calls | Unit | Longest run |
| --- | --- | --- | --- | --- |
| Rain Bird | [Rain Bird](https://www.home-assistant.io/integrations/rainbird/) (built in) | `rainbird.start_irrigation` | minutes | 1440 min |
| Hunter Hydrawise | [Hydrawise](https://www.home-assistant.io/integrations/hydrawise/) (built in) | `hydrawise.start_watering` | minutes | 1440 min |
| Rachio | [Rachio](https://www.home-assistant.io/integrations/rachio/) (built in) | `rachio.start_watering` | minutes | 180 min |
| OpenSprinkler | [hass-opensprinkler](https://github.com/vinteo/hass-opensprinkler) (HACS) | `opensprinkler.run_station` | seconds | 64800 s |
| Orbit B-hyve | [bhyve-home-assistant](https://github.com/sebr/bhyve-home-assistant) (HACS) | `bhyve.start_watering` | minutes | 1440 min |

This is different from [direct valve control](configuration-closed-loop.md), which opens and closes a `switch` or `valve` entity itself. A controller does not expose its zones that way: you hand it a duration, it starts its own timer and stops on its own. That is what the blueprints do.

**These blueprints have not yet been confirmed on real hardware.** They were written against each integration's documented actions and their templates are rendered by Home Assistant's own engine in our tests, but we do not own the controllers. If you do, a word in the [discussions](https://github.com/altmenorg/HAsmartirrigation/discussions) saying it works, or what it needed, is the most useful contribution there is.

## Before you start

1. **Smart Irrigation calculates.** At least one zone is in automatic mode and the [Info tab](usage-info.md) shows a duration for it after the daily calculation.
2. **A start trigger is set** on the [General page](configuration-general.md). The blueprints listen to the `smart_irrigation_start_irrigation_all_zones` [event](usage-events.md); without a trigger, that event never fires and nothing waters.
3. **The controller's integration is set up** in Home Assistant and its zones show up as entities.
4. **The controller's own schedule is off** for the zones Smart Irrigation will drive. Otherwise it waters twice: once on its own program, once on ours. How to do that for each brand is [below](#per-controller-notes).

## Set up one zone

The blueprints are copied into your own `blueprints/` folder when the integration starts, so they are already in Home Assistant. If you do not see them, or want the latest version, use the import links on the [automations page](usage-automations.md#blueprints-we-provide).

1. Go to *Settings > Automations & scenes > Blueprints* and pick **Smart Irrigation with Rain Bird** (or Hydrawise, Rachio, OpenSprinkler, B-hyve).
2. Click *Create automation* and fill in the three fields:
   - **Smart Irrigation zone**: the zone's duration sensor, `sensor.smart_irrigation_<zone name>`. The list only offers Smart Irrigation duration sensors.
   - **Controller zone**: the entity of the controller zone that waters it. Which entity that is depends on the brand, see the [notes below](#per-controller-notes). The list is filtered to that integration.
   - **Reset the bucket after the run**: leave it on, unless [observed watering](configuration-closed-loop.md) already watches this controller zone. In that case turn it off, or the run is credited twice.
3. Save, give the automation the zone's name, and repeat for every zone.

One automation per zone is deliberate: each zone has its own duration and its own bucket.

## What happens at run time

When the start trigger is reached, every automation created from these blueprints wakes up at the same moment and does the same thing:

1. **Checks the duration.** If the zone's duration is 0, nothing happens. On a [skip day](configuration-general.md) the start event is not fired at all, so nothing happens either.
2. **Converts the duration** to what the controller takes. Smart Irrigation counts in seconds. Rain Bird, Hydrawise, Rachio and B-hyve take whole minutes, so the run is **rounded up** (a calculated 3 min 10 s becomes 4 min: a little too much water is better than a deficit left behind) and is **at least 1 minute**. OpenSprinkler takes seconds and gets them as they are. Every run is capped at the longest run the controller accepts, see the table above. Rachio's cap of 3 hours is the one you may actually hit: if a zone regularly needs more, check its throughput and precipitation rate on the [zones page](configuration-zones.md).
3. **Starts the controller zone** for that time. The controller runs its own timer and stops the valve itself.
4. **Waits the same time**, then **resets the bucket** of the zone, so the next calculation starts from a full soil. If you turned the reset off, the automation just ends.

The automation runs in `single` mode: a second start event while a run is in progress is ignored.

**The controller's own rain sensor or rain delay.** If your controller cancels or shortens a run on its own (a wired rain sensor, a rain delay set in the app), the blueprint does not know: it waits the full time and resets the bucket as if the water had gone in. Two ways to keep the books right. Either turn that feature off on the controller and let Smart Irrigation decide, since it already accounts for rain, or use [observed watering](configuration-closed-loop.md) on the controller zone and turn the blueprint's reset off, so the bucket is credited with what actually ran.

## Several zones

All the automations start at the same event, so the controller is asked to start every zone at once. What happens next is the controller's business:

- **OpenSprinkler** queues the runs and waters the zones one after the other.
- **Rachio** and **Hydrawise** normally run one zone at a time; check in the app what your controller does when a second zone is asked to start while one is running.
- **Rain Bird** and **B-hyve**: same advice, check the app.

If your controller refuses or drops a start while a zone is running, chain the zones yourself. Open the second zone's automation, choose *Take control* from its menu (the automation stops following the blueprint and becomes editable), and replace its trigger: instead of the start event, trigger on the **first controller zone turning off** (a state trigger on that entity, from `on` to `off`). Keep the actions as they are. Do the same for the third zone on the second, and so on: the zones water in the order you chose, each for its own duration. The automations that keep the blueprint still update when the blueprint does; the ones you took control of do not, which is fine, they are two lines long.

## Per controller notes

### Rain Bird

- **Controller zone entity**: the zone's `switch` (one is created for every zone on the controller).
- **Turn off its schedule**: in the Rain Bird app, disable each program, or remove every watering day from it. Do not put the controller's dial on OFF: on most models that blocks every run, including the ones started from the app or from Home Assistant.
- The integration polls the controller once a minute, so the zone's state in Home Assistant can lag the valve by up to a minute. That matters only for observed watering, not for the blueprint.

### Hunter Hydrawise

- **Controller zone entity**: the zone's **binary sensor** that shows whether it is watering (device class `running`), not a switch. That is the entity the `hydrawise.start_watering` action targets, and the blueprint's list is filtered to it.
- **Turn off its schedule**: every zone has an `auto_watering` switch in Home Assistant. Turning it off suspends the zone's Smart Watering schedule for a year (that is how the integration implements it), while runs started from Home Assistant still work. You can also suspend the zone in the Hydrawise app.

### Rachio

- **Controller zone entity**: the zone's `switch`.
- **Turn off its schedule**: each Rachio schedule is a `switch` in Home Assistant, turn the ones that cover the zone off, or disable them in the Rachio app.
- **The 3 hour cap** is Rachio's, see above.
- Rachio updates Home Assistant through the cloud: the [integration's page](https://www.home-assistant.io/integrations/rachio/) explains that your Home Assistant must be reachable from the internet for zone states to update. The blueprint does not depend on that (it waits the duration it asked for), observed watering does.
- The integration's option "duration in minutes when activating a zone switch" is a failsafe for the switch. The blueprint passes its own duration to the action and does not use it.

### OpenSprinkler

- **Controller zone entity**: the station's **enabled `switch`** (the integration marks it with device class `station`; the blueprint's list is filtered to those). It is the entity the `opensprinkler.run_station` action takes, and the station must be enabled or the run is refused.
- **Turn off its schedule**: each OpenSprinkler program has an enabled `switch` in Home Assistant, turn them off, or disable the programs in the OpenSprinkler interface. Keep the controller's own enabled switch on.
- Runs are queued, so several zones asked at once water one after the other.
- Up to beta 5 the blueprint called `opensprinkler.run`, which the integration has deprecated. It now calls `opensprinkler.run_station`. If you imported the blueprint before that, import it again.

### Orbit B-hyve

- **Controller zone entity**: the zone's `valve` entity (a `switch` on older versions of the integration).
- **Turn off its schedule**: in Home Assistant, turn off the zone's *smart watering* switch and each program switch that includes the zone, or do the same in the B-hyve app.
- The integration recommends `bhyve.start_watering` with a number of minutes over opening the valve, because some devices cannot set a default watering time. That is what the blueprint uses.

## Telling us how it went

Each blueprint says in its description that it is not yet confirmed on real hardware. When you have run one, please post in the [discussions](https://github.com/altmenorg/HAsmartirrigation/discussions): the controller model, whether the zone started and stopped at the right time, and anything you had to change. Once a controller is confirmed we remove the warning from its blueprint.

> Main page: [Usage](usage.md)<br/>
> Previous: [Automations](usage-automations.md)<br/>
> Next: [Troubleshooting](usage-troubleshooting.md)
