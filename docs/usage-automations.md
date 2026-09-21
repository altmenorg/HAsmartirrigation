---
layout: default
title: Usage: Entities
---
# Automations

> Main page: [Usage](usage.md)<br/>
> Previous: [Events](usage-events.md)<br/>
> Next: [Troubleshooting](usage-troubleshooting.md)

Since this integration does not interface with your irrigation system directly, you will need to use the data it outputs to create an automation that will start and stop your irrigation system for you. This way you can use this custom integration with any irrigation system you might have, regardless of how that interfaces with Home Assistant. In order for this to work correctly, you should base your automation on the value of `sensor.smart_irrigation_[zone_name]` as long as you run your automation after it was updated (e.g. 11:00 PM/23:00 hours local time). If that value is above `0` it is time to irrigate. Note that the value is the run time in seconds. Also, after irrigation, you need to call the `smart_irrigation.reset_bucket` service to reset the net irrigation tracking (`bucket`) to 0.

> **The last step in any automation is very important, since you will need to let the integration know you have finished irrigating and the evaporation counter can be reset by calling the `smart_irrigation.reset_bucket` service**

> Resetting the bucket says the soil is at field capacity at that moment, so any rain collected since the last calculation is part of what that statement covers and is not counted again at the next one. Rain falling after the reset still counts as usual. This matters when it rains between the calculation and irrigation: without it the same rain would both shorten the run and fill the next bucket.

Experts say you should water deeply but infrequently to avoid overwatering and encourage deep rooting. It might be a good idea to create an automation that starts early enough to finish before sunrise (using the [`smart_irrigation_start_irrigation_all_zones` event](usage-events.md)) and only once per week if duration is above `0` or whenever the `bucket < -25 mm`. Adjust to your specific needs.

The examples on this page don't use a timer - see [this discussion](https://github.com/altmenorg/HAsmartirrigation/discussions/361) for an example of using a timer for extra safety.

## Blueprints we provide

A blueprint is a parameterised mould for an automation: you import it once, pick your entities from filtered dropdowns, and Home Assistant writes the automation for you.

**You already have them.** Smart Irrigation copies the blueprints below into your own `blueprints/` folder when it starts, so they are waiting for you under *Settings > Automations & scenes > Blueprints*, grouped as Smart Irrigation. Nothing to download.

Existing files are never overwritten, so anything you have edited stays yours. That also means an improved blueprint does not reach you on its own: use the **Import** link in the table below to pull the current version, or delete your copy and restart. You can also browse [the whole folder](https://github.com/altmenorg/HAsmartirrigation/tree/master/custom_components/smart_irrigation/blueprints).

Pick the one that matches how your valves are actually driven:

| Blueprint | Use it when | |
| --- | --- | --- |
| [`standard-irrigation.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/standard-irrigation.yaml) | A plain switch, valve or input_boolean per zone. Turns it on for the calculated duration, then resets the bucket. Has an optional pause switch. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Fstandard-irrigation.yaml) |
| [`esphome.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/esphome.yaml) | An ESPHome device that takes the duration itself. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Fesphome.yaml) |
| [`simple-scheduler.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/script/simple-scheduler.yaml) | A script rather than an automation, if you prefer to call irrigation from elsewhere. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fscript%2Fsimple-scheduler.yaml) |
| [`irrigation-unlimited-adjust-time-single-zone.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/irrigation-unlimited-adjust-time-single-zone.yaml) | Irrigation Unlimited runs your schedule and you want Smart Irrigation to set the run time of one zone through `adjust_time`. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Firrigation-unlimited-adjust-time-single-zone.yaml) |
| [`irrigation-unlimited-adjust-time-sequence.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/irrigation-unlimited-adjust-time-sequence.yaml) | The same for a whole IU sequence, scaling every zone in it. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Firrigation-unlimited-adjust-time-sequence.yaml) |
| [`irrigation-unlimited-reset-bucket.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/irrigation-unlimited-reset-bucket.yaml) | Pair with either of the two above: resets the bucket when IU reports the run finished. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Firrigation-unlimited-reset-bucket.yaml) |
| [`weather-responsive-scheduling.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/weather-responsive-scheduling.yaml) | You want a seasonal multiplier applied automatically and runs skipped on cold or windy days. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Fweather-responsive-scheduling.yaml) |
| [`valve-watchdog.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/valve-watchdog.yaml) | A backstop: closes a valve left open longer than a limit you set, and tells you. Worth adding whatever else you use. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Fvalve-watchdog.yaml) |
| [`rainbird.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/rainbird.yaml) | A Rain Bird controller: starts the Rain Bird zone for the calculated run, in whole minutes. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Frainbird.yaml) |
| [`hydrawise.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/hydrawise.yaml) | A Hunter Hydrawise controller: the same, through `hydrawise.start_watering`. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Fhydrawise.yaml) |
| [`rachio.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/rachio.yaml) | A Rachio controller: the same, through `rachio.start_watering` (at most 3 hours a run). | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Frachio.yaml) |
| [`opensprinkler.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/opensprinkler.yaml) | An OpenSprinkler controller (the OpenSprinkler integration from HACS): the run in seconds, through `opensprinkler.run`. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Fopensprinkler.yaml) |
| [`bhyve.yaml`](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/blueprints/automation/bhyve.yaml) | An Orbit B-hyve controller (the B-hyve integration from HACS), through `bhyve.start_watering`. | [Import](https://my.home-assistant.io/redirect/blueprint_import/?blueprint_url=https%3A%2F%2Fgithub.com%2Faltmenorg%2FHAsmartirrigation%2Fblob%2Fmaster%2Fcustom_components%2Fsmart_irrigation%2Fblueprints%2Fautomation%2Fbhyve.yaml) |

**With an off-the-shelf controller** (Rain Bird, Hydrawise, Rachio, OpenSprinkler, B-hyve), Smart Irrigation decides how long each zone waters and the controller runs the valves. Turn off the controller's own schedule for those zones, or it waters on top. Create one automation per zone. These five have been written against each integration's documented actions but not yet confirmed on real hardware: if you have one, a word on the discussions saying it works, or what it needed, is the most useful contribution there is.

**Irrigation-V5 needs no blueprint at all**: it reads a numeric entity as a multiplier, so pointing its Adjustment Sensor at our zone sensor with a base watering time of 1 second gives it the calculated duration directly. See [executor integration](usage-enhanced-scheduling-integration.md).

With Irrigation Unlimited, note that it exposes **binary sensors**, not switches: Smart Irrigation tells it how long to run through `adjust_time` and IU does the running. Do not drive the valve yourself in parallel, or the two will fight.

If you use **observed watering** or **direct valve control** (see [closed loop](configuration-closed-loop.md)), do not use a blueprint that calls `reset_bucket`: the integration credits the bucket itself and the two would count twice.

### Example 1: one valve, once per week irrigation if duration > 0 or if the bucket < - 25 mm:

This example automation runs daily and checks `sensor.smart_irrigation_[zone_name]`. It checks if the `buckets` is `< -25mm (~1")` or if's a monday and duration is above `0`. This follows the expert recommendation mentioned above.

[yaml](https://github.com/altmenorg/HAsmartirrigation/blob/master/automations/1_one_valve_once_per_week.yaml)

### Example 2: one valve, potentially daily irrigation

Here is an example automation that runs when the `smart_irrigation_start_irrigation_all_zones` event is fired. It checks if `sensor.smart_irrigation_[zone_name]` is above 0 and if it is it turns on `switch.irrigation_tap1`, waits the number of seconds as indicated by `sensor.smart_irrigation_[zone_name]` and then turns off `switch.irrigation_tap1`. Finally, it resets the bucket by calling the `smart_irrigation.reset_bucket` service. If you have multiple instances you will need to adjust the event, entities and service names accordingly.

[yaml](https://github.com/altmenorg/HAsmartirrigation/blob/master/automations/2_one_valve_potential_daily.yaml)
## Example 3: one valve, irrigation depending on work day sensor
Here is an example automation that runs at 5 AM local time, but only on set days of the week indicated by `binary_sensor.workday_sensor`). As above, it checks if `sensor.smart_irrigation_[zone_name]` is above 0 and if it is it turns on `switch.irrigation_tap1`, waits the number of seconds as indicated by `sensor.smart_irrigation_[zone_name]` and then turns off `switch.irrigation_tap1`. Finally, it resets the bucket by calling the `smart_irrigation.reset_bucket` service.
This automation depends on the [workday binary sensor](https://www.home-assistant.io/integrations/workday/) which you will have to set up separately. Alternatively you could use a condition such as:
```
condition:
  condition: time
  weekday:
  - mon
  - thu
```

[yaml](https://github.com/altmenorg/HAsmartirrigation/blob/master/automations/3_one_valve_workday.yaml)
### Example 4: two valves, irrigation depending on work day sensor
Here is an example automation that runs at 4 AM local time, but only on set days of the week indicated by `binary_sensor.workday_sensor`). As above, it checks if `sensor.smart_irrigation_[zone_name]` is above 0 and if it is it turns on `switch.irrigation_tap1`, waits the number of seconds as indicated by `sensor.smart_irrigation_[zone_name]` and then turns off `switch.irrigation_tap1`. Then it turns on `switch.irrigation_tap2`, waits the number of seconds as indicated by `sensor.smart_irrigation_[zone_name]` and then turns off `switch.irrigation_tap2`. Finally, it resets the bucket by calling the `smart_irrigation.reset_bucket` service.
This automation depends on the [workday binary sensor](https://www.home-assistant.io/integrations/workday/) which you will have to set up separately. Alternatively you could use a condition such as:
```
condition:
  condition: time
  weekday:
  - mon
  - thu
```

[yaml](https://github.com/altmenorg/HAsmartirrigation/blob/master/automations/4_two_valves_workday.yaml)


## Example 5: Advanced multi-tap example
This example handles multiple taps for a six-zone system controlled by [ESPHome](https://esphome.io/components/sprinkler.html). This is the automation the creator of this integration uses themselves (ignoring the expert advice above...).

[yaml](https://github.com/altmenorg/HAsmartirrigation/blob/master/automations/5_multi_tap.yaml)


> Main page: [Usage](usage.md)<br/>
> Previous: [Events](usage-events.md)<br/>
> Next: [Troubleshooting](usage-troubleshooting.md)
