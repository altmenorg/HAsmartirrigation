---
layout: default
title: Usage: Events
---

# Events

> Main page: [Usage](usage.md)<br/>
> Previous: [Services](usage-services.md)<br/>
> Next: [Automations](usage-automations.md)

After installation, the following events are available:

| Event | Description|
| --- | --- |
|`smart_irrigation_start_irrigation_all_zones`|Fired when an [irrigation start trigger](configuration-general.md) is reached. Listen to it to start your irrigation. See [automations](usage-automations.md) for examples.|
|`smart_irrigation_irrigation_skipped`|Fired when a start trigger is reached and the day is a skip day, so nothing is watered. Data: the trigger's identity, plus `reason` and `checks`, the same detail the Home page shows. The reason is the skip condition that held the day back: `postponed`, `rain_sensor`, `freeze`, `wind`, `precipitation`, `days_between` or `soil_moisture`. With the [full controller](usage-full-controller.md), a trigger reached while the main program is off or suspended fires it with the reason `main_program_disabled` or `main_program_suspended` (and no `checks`).|

Direct valve control fires three more, described in [closed-loop irrigation](configuration-closed-loop.md). The [full controller](usage-full-controller.md#seeing-what-is-going-on) adds its own, with the data of each described there: `program_started`, `program_finished`, `valve_on`, `valve_off`, `valve_out_of_sync` and `supply_problem`. These three are also fired:

| Event | Description|
| --- | --- |
|`smart_irrigation_zone_unwatered`|A zone has been dry for more than 3 days and no program will water it; fired once per zone, together with a repair notice. Data: `zone_id`, `zone`, `days`, `deficit_mm`. See [the dry zone notice](usage-full-controller.md#dry-zone-notice).|
|`smart_irrigation_weather_stale`|A temperature, humidity or dew point source of a sensor group has not reported for 6 hours; fired once per silence. Data: `mapping_id`, `mapping`, `fields` (the fields that just went silent) and `since` (the time of the last report).|
|`smart_irrigation_weather_recovered`|Fields that were silent report again. Data: `mapping_id`, `mapping`, `fields`.|

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

The event fires when a configured **start trigger** is reached: a solar event (sunrise, sunset or solar azimuth), optionally shifted by an offset, or a fixed clock time. A fixed time suits irrigation that has to be done by a certain hour whatever the season, rather than following the sun. If you configure no triggers, the legacy default applies: it fires early enough before sunrise that watering finishes at sunrise (`sunrise - sum(duration of all enabled zones)`).

With **account for duration** on, a trigger works back from its moment so watering *finishes* then; with it off, watering *starts* then. That applies to a fixed time as well: set 06:30 with it on and an hour-long run starts at 05:30.

Each enabled trigger fires **independently**. The precipitation-skip and "days between irrigation" settings still apply: on a skip day no event is fired.

## Event data

The event carries the identity of the trigger that fired, so a single automation can react differently per trigger:

| field | meaning |
| --- | --- |
| `trigger_name` | the name you gave the trigger |
| `trigger_type` | `sunrise`, `sunset`, `solar_azimuth` or `time`. With the full controller, a skip decided for a program's schedule has `program`, and carries `program_id` and `schedule_id` too |
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