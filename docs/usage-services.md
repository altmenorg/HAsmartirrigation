---
layout: default
title: Usage: Services
---
# Services

> Main page: [Usage](usage.md)<br/>
> Previous: [Entities](usage-entities.md)<br/>
> Next: [Events](usage-events.md)

After installation, the following services are available:
| Service | Description|
| --- | --- |
|`Smart Irrigation: calculate_zone`|Triggers the calculation of one specific zone. Note that used weather data is deleted afterwards by default unless you specify `delete_weather_data: false`. Specify `dry_run: true` to see what the calculation would do without changing anything -- see [Dry run](#dry-run) below.|
|`Smart Irrigation: calculate_all_zones`|Triggers the calculation of all automatic zones. Use only if you disabled automatic refresh in the options. Note that after calculation weather data is deleted by default unless you specify `delete_weather_data: false`. Specify `dry_run: true` to see what the calculation would do without changing anything -- see [Dry run](#dry-run) below.|
|`Smart Irrigation: clear_all_weather_data`|Deletes all weather data. Pick zones and only the weather data of their sensor groups is deleted (the other zones of those groups lose it too, since a group's data is shared).|
|`Smart Irrigation: generate_watering_calendar`|Generate a 12-month watering calendar for a zone based on representative climate data.|
|`Smart Irrigation: reset_all_buckets`|Resets all buckets to 0.|
|`Smart Irrigation: credit_watering`|Credits a zone with the water a run of your own delivered: its precipitation rate times `seconds` (the zone's duration when left out), less its lead time. Use it at the end of an irrigation automation rather than `reset_bucket`: a run cut short by the zone's maximum duration keeps the deficit it did not water.|
|`Smart Irrigation: reset_bucket`|Resets one specific bucket to 0. It says the soil is back at field capacity, whatever the run delivered: `credit_watering` is the better end to an irrigation automation.|
|`Smart Irrigation: set_all_buckets`|Sets all buckets to a specific `new_bucket_value` (default is 0).|
|`Smart Irrigation: set_all_multipliers`|Sets all multipliers to a specific `new_multiplier_value` (default is 1.0).|
|`Smart Irrigation: set_bucket`|Sets a specific bucket to to a specific `new_bucket_value` (default is 0).|
|`Smart Irrigation: set_multiplier`|Sets a specific multiplier to a specific `new_multiplier_value` (default is 1.0).|
|`Smart Irrigation: set_zone`| Allows configuration for bucket (with `new_bucket_value` (default 0)), multiplier (with `new_multiplier_value` (default 1.0)), duration (with `new_duration_value` (default 0)), state (with `new_state_value` (default 'automatic')) and throughput (with `new_throughput_value` (default 50)) settings for a zone.|
|`Smart Irrigation: update_all_zones`|Updates all automatic zones with weather data|
|`Smart Irrigation: update_zone`|Updates one specific zone with weather data|
|`Smart Irrigation: postpone_irrigation`|Holds watering back for `hours` (default 24), for rain the forecast missed or an afternoon on the lawn. It is a moment, not a countdown: it survives a restart and ends by itself. It resets nothing, so a zone that is short of water still is when it ends. `hours: 0` lifts it.|
|`Smart Irrigation: resume_irrigation`|Lifts a postponement now.|
|`Smart Irrigation: create_recurring_schedule` / `update_recurring_schedule` / `delete_recurring_schedule`|Schedules of your own that calculate, update or start irrigation. See [enhanced scheduling](usage-enhanced-scheduling-integration.md).|
|`Smart Irrigation: create_seasonal_adjustment` / `update_seasonal_adjustment` / `delete_seasonal_adjustment`|Scale the crop factor, and shift the irrigation threshold, over a range of months.|
|`Smart Irrigation: use_measured_throughput`|Sets a zone's throughput to the flow its water meter measured over its runs. The measurement is advice, never applied on its own: this is how to accept it.|
|`Smart Irrigation: run_program` / `water_zone` / `pause_watering` / `resume_watering` / `next_step` / `stop_watering` / `stop_program` / `suspend` / `adjust_program` / `set_program_enabled` / `set_step_enabled` / `set_schedule_enabled`|Drive the watering of the [full controller](usage-full-controller.md#driving-the-watering): run a program or a zone now, pause, skip a step, stop, make a program water longer or shorter for a while, or set a zone or a program aside. `suspend` refuses an `until` more than 8760 hours (a year) ahead. `water_zone` and `stop_watering` also work with direct valve control alone.|

## Dry run

`calculate_zone` and `calculate_all_zones` accept `dry_run: true`. A dry run computes
the result and returns it without touching any of your irrigation data: the bucket, the
zone, the collected weather data and the internal "last calculated" marker are all left
exactly as they were.

Use it when you want to inspect a zone during the day without disturbing the scheduled
calculation. A normal manual calculation consumes the weather data collected so far and
moves the internal "last calculated" marker, which means the scheduled run later that
day only sees a partial window. Evapotranspiration is computed as a full-day rate from
that window and then scaled by its length, and because the minimum and maximum
temperature are taken from the samples inside the window, a partial window never
contains the full daily temperature swing. The result is a lower daily total than if the
scheduled run had seen the whole day. A dry run avoids this entirely.

One thing a dry run does still do: if your zone uses the PyETO module with
`forecast_days` greater than 0, it fetches forecast data from your weather service just
like a real calculation, because the preview has to be computed from the same inputs to
be meaningful. Subject to the usual cache, that can count against your weather service's
API quota, so avoid polling a dry run in a tight loop.

Because a dry run stores nothing, the outcome is only available as the service response:

```yaml
action: smart_irrigation.calculate_zone
target:
  entity_id: sensor.smart_irrigation_my_zone
data:
  dry_run: true
response_variable: result
```

`result.zones` then holds the `delta`, `bucket`, `duration`, `current_drainage` and
`et_deficiency` the calculation would have produced for each zone. All five keys are
always present, and are null when the zone's module does not produce that value. Zones
that produced no result at all are left out of the list entirely.

> Main page: [Usage](usage.md)<br/>
> Previous: [Entities](usage-entities.md)<br/>
> Next: [Events](usage-events.md)
