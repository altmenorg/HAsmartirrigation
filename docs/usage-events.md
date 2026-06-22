---
layout: default
title: Usage: Events
---

# Events

> Main page: [Usage](usage.md)<br/>
> Previous: [Services](usage-services.md)<br/>
> Next: [Automations](usage-automations.md)

After installation, the following event is available:

| Event | Description|
| --- | --- |
|`happy_irrigation_start_irrigation_all_zones`|Fired when an [irrigation start trigger](configuration-general.md) is reached. Listen to it to start your irrigation. See [automations](usage-automations.md) for examples.|

## When does it fire?

The event fires when a configured **start trigger** is reached (a solar event — sunrise, sunset or solar azimuth — optionally shifted by an offset). If you configure no triggers, the legacy default applies: it fires early enough before sunrise that watering finishes at sunrise (`sunrise - sum(duration of all enabled zones)`).

Each enabled trigger fires **independently**. The precipitation-skip and "days between irrigation" settings still apply: on a skip day no event is fired.

## Event data

The event carries the identity of the trigger that fired, so a single automation can react differently per trigger:

| field | meaning |
| --- | --- |
| `trigger_name` | the name you gave the trigger |
| `trigger_type` | `sunrise`, `sunset` or `solar_azimuth` |
| `offset_minutes` | the configured offset, in minutes |
| `account_for_duration` | whether timing is shifted so watering finishes at the target moment |

Example: filter on `trigger_name` to react to a specific trigger.

```yaml
trigger:
  - platform: event
    event_type: happy_irrigation_start_irrigation_all_zones
    event_data:
      trigger_name: "Morning"
```

> Main page: [Usage](usage.md)<br/>
> Previous: [Services](usage-services.md)<br/>
> Next: [Automations](usage-automations.md)