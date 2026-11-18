---
layout: default
title: "Usage: Events"
---

# Events

> Main page: [Usage](usage.md)<br/>
> Previous: [Services](usage-services.md)<br/>
> Next: [Automations](usage-automations.md)

After installation, the following events are available:

| Event | Description|
| --- | --- |
|`smart_irrigation_start_irrigation_all_zones`|Fired when an [irrigation start trigger](configuration-general.md) is reached, or, with the [full controller](usage-full-controller.md#no-main-program), when a schedule of the program that was the main one (id `main`) is due (`trigger_type` is then `program`). Listen to it to start your irrigation. See [automations](usage-automations.md) for examples.|
|`smart_irrigation_leak`|Fired when a zone's meter counts water with every valve closed, with [Leak alert after](configuration-closed-loop.md#water-flowing-with-every-valve-closed-advanced-mode) set. Data: `flow_sensor`, `litres`, `zone_ids`, `zones`.|
|`smart_irrigation_irrigation_skipped`|Fired when a start (a program's schedule, or a start trigger) is held back by the skip conditions, so nothing is watered at that start. Data: the identity of what started (for a program, `program_id` and `schedule_id`), plus `reason` and `checks`, the same detail the Home page shows. The reason is the skip condition that held that start back: `postponed`, `rain_sensor`, `freeze`, `wind`, `precipitation`, `days_between` or `soil_moisture`. A trigger reached while Smart Irrigation is [stopped](configuration-general.md#stop-everything) fires it with the reason `irrigation_off`, and while it [calculates only](configuration-general.md#calculate-and-water-calculate-only-or-stop-everything) with the reason `calculate_only` (and no `checks`).|

When Smart Irrigation waters, it fires three more, described in [closed-loop irrigation](configuration-closed-loop.md). The [full controller](usage-full-controller.md#seeing-what-is-going-on) adds its own, with the data of each described there: `program_started`, `program_finished`, `valve_on`, `valve_off`, `valve_out_of_sync` and `supply_problem`. These three are also fired:

| Event | Description|
| --- | --- |
|`smart_irrigation_zone_unwatered`|A zone has been dry for more than 3 days and no program will water it; fired once per zone, together with a repair notice. Data: `zone_id`, `zone`, `days`, `deficit_mm`. See [the dry zone notice](usage-full-controller.md#dry-zone-notice).|
|`smart_irrigation_weather_stale`|A temperature, humidity, dew point, wind speed or pressure source of a sensor group has not reported for 6 hours; fired once per silence. Data: `mapping_id`, `mapping`, `fields` (the fields that just went silent) and `since` (the time of the last report).|
|`smart_irrigation_weather_recovered`|Fields that were silent report again, or the outage stops being watched. Data: `mapping_id`, `mapping`, `fields`, and `reason` when it is not a recovery: `unloaded` (the integration was reloaded, disabled or removed) or `unwatched` (no automatic zone uses the group any more).|

Only `zone_unwatered` needs the full controller; `weather_stale` and `weather_recovered` do not.

### Knowing a run was skipped

A skipped day used to be the absence of an event, and nothing can listen for
something that does not happen. That is why the skip now fires its own event:

```yaml
automation:
  - alias: "Tell me when irrigation was skipped"
    trigger:
      - platform: event
        event_type: smart_irrigation_irrigation_skipped
    action:
      - service: notify.persistent_notification
        data:
          message: "No irrigation today: {{ trigger.event.data.reason }}"
```

The Home page answers the same question without an automation: it shows whether
the next start would be skipped and why, and what the last real decision was.

## When does it fire?

The event fires when the **active start trigger** is reached. You can define several triggers, but only the one selected as active starts the watering, so the run happens once per day. The **Start triggers** card on the [General page](configuration-general.md) has the choice:

* **A trigger you defined.** A solar event (sunrise, sunset or solar azimuth), optionally shifted by an offset, or a fixed clock time. A fixed time suits irrigation that has to be done by a certain hour whatever the season, rather than following the sun.
* **Default.** Used whenever Default is selected, even if you have defined triggers. It starts early enough before sunrise that watering finishes at sunrise: sunrise minus the planned length of the run. That length is how long the run really takes, so with zones in parallel it is the longest zone rather than the sum, and the soak and pauses between zones are counted when Smart Irrigation opens the valves itself.
* **None.** Nothing starts the watering, whatever the weather. The durations are still calculated. It is the way to keep Smart Irrigation from starting a run.

With **account for duration** on, a trigger works back from its moment so watering *finishes* then; with it off, watering *starts* then. That applies to a fixed time as well: set 06:30 with it on and an hour-long run starts at 05:30.

The skip conditions still apply: when they hold a start back no start event is fired, and the skipped event above is fired instead.

## Event data

The event carries the identity of the trigger that fired, so a single automation can react differently per trigger:

| field | meaning |
| --- | --- |
| `trigger_name` | the name you gave the trigger |
| `trigger_type` | `sunrise`, `sunset`, `solar_azimuth` or `time`. With the full controller, a start or a skip decided for a program's schedule has `program`, and carries `program_id` and `schedule_id` too |
| `at` | for a `time` trigger, the clock time it is set to |
| `offset_minutes` | the configured offset, in minutes |
| `account_for_duration` | whether timing is shifted so watering finishes at the target moment |

Example: filter on `trigger_name` to react to a specific trigger.

```yaml
trigger:
  - platform: event
    event_type: smart_irrigation_start_irrigation_all_zones
    event_data:
      trigger_name: "Morning"
```

> Main page: [Usage](usage.md)<br/>
> Previous: [Services](usage-services.md)<br/>
> Next: [Automations](usage-automations.md)