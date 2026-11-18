---
title: "Events"
---
# Events

Smart Irrigation fires these events on the Home Assistant event bus:

| Event | Description |
| --- | --- |
| `smart_irrigation_start_irrigation_all_zones` | With **Calculate only**, fired when the active [start trigger](configuration-general.md#start-triggers) is reached and the run is not held back. Listen to it to start your watering: see [automations](usage-automations.md). With **Calculate and water**, it also fires when a schedule starts the program with the id `main` (the former main program, now **Watering**; `trigger_type` is then `program`), so automations written for it keep working. That last use goes in 2027.11 (see [no main program](usage-full-controller.md#no-main-program)). |
| `smart_irrigation_irrigation_skipped` | Fired when a start (a program's schedule, or a start trigger) is held back by the skip conditions, so nothing is watered at that start. Data: the identity of what started (for a program, `program_id` and `schedule_id`), plus `reason` and `checks`, the same detail the Home page shows. The reason is the check that held the start back: `postponed`, `rain_sensor`, `freeze`, `wind`, `precipitation`, `days_between` or `soil_moisture`. A trigger reached while Smart Irrigation is [stopped](configuration-general.md#stop-everything) fires it with the reason `irrigation_off` (and no `checks`). |
| `smart_irrigation_leak` | Fired when a zone's meter counts water with every valve closed, with [Leak alert after](configuration-closed-loop.md#water-flowing-with-every-valve-closed-advanced-mode) set. Data: `flow_sensor`, `litres`, `zone_ids`, `zones`. |
| `smart_irrigation_weather_stale` | A temperature, humidity, dew point, wind speed or pressure source of a sensor group has not reported for 6 hours; fired once per silence. Data: `mapping_id`, `mapping`, `fields` (the fields that just went silent) and `since` (the time of the last report). See [silent sensors](configuration-sensor-groups.md#silent-sensors). |
| `smart_irrigation_weather_recovered` | Fields that were silent report again, or the outage stops being watched. Data: `mapping_id`, `mapping`, `fields`, and `reason` when it is not a recovery: `unloaded` (the integration was reloaded, disabled or removed) or `unwatched` (no automatic zone uses the group any more). |

When Smart Irrigation waters (**Calculate and water**), it fires more:

- `smart_irrigation_irrigation_started`, `smart_irrigation_irrigation_finished` and `smart_irrigation_zone_problem`, described in [closed-loop watering](configuration-closed-loop.md#events-for-your-own-automations);
- `smart_irrigation_program_started`, `program_finished`, `valve_on`, `valve_off`, `valve_out_of_sync` and `supply_problem`, described in [seeing what is going on](usage-full-controller.md#seeing-what-is-going-on);
- `smart_irrigation_zone_unwatered`: a zone has been dry for more than 3 days and no program will water it; fired once per zone, together with a repair notice. Data: `zone_id`, `zone`, `days`, `deficit_mm`. See [the dry zone notice](usage-full-controller.md#dry-zone-notice).

Every event, with its data, is also listed on one page: [the output contract](usage-output-contract.md#the-events).

## Knowing a run was skipped

A skipped day used to be the absence of an event, and nothing can listen for something that does not happen. That is why a skip fires its own event:

```yaml
alias: Tell me when watering was skipped
triggers:
  - trigger: event
    event_type: smart_irrigation_irrigation_skipped
actions:
  - action: notify.persistent_notification
    data:
      message: "No watering today: {{ trigger.event.data.reason }}"
```

The Home page answers the same question without an automation: it shows whether the next start would be skipped and why, and what the last real decision was.

## The start event

With Calculate only, `smart_irrigation_start_irrigation_all_zones` fires when the **active start trigger** is reached: the default (done by sunrise), a trigger you added, or none at all. How to choose it, and what **Account for duration** does, is under [start triggers](configuration-general.md#start-triggers). The skip conditions still apply: when they hold a start back, the start event is not fired, and the skipped event above is fired instead.

### Event data

The event carries the identity of the trigger that fired, so one automation can react differently per trigger:

| Field | Meaning |
| --- | --- |
| `trigger_name` | the name you gave the trigger |
| `trigger_type` | `sunrise`, `sunset`, `solar_azimuth` or `time`. For a start of the program `main` (Calculate and water), `program`, with `program_id` and `schedule_id` too |
| `at` | for a `time` trigger, the clock time it is set to |
| `offset_minutes` | the configured offset, in minutes |
| `account_for_duration` | whether timing is shifted so watering finishes at the target moment |

Example: filter on `trigger_name` to react to one trigger.

```yaml
triggers:
  - trigger: event
    event_type: smart_irrigation_start_irrigation_all_zones
    event_data:
      trigger_name: "Morning"
```
