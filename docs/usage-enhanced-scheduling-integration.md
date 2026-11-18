---
title: "Other irrigation integrations"
---
# Other irrigation integrations

With **Calculate only**, Smart Irrigation can hand its calculated run times to another integration that drives the valves: Irrigation Unlimited or Irrigation-V5. This page says how. For the controllers of Rain Bird, Hydrawise, Rachio, OpenSprinkler and B-hyve, see [off-the-shelf controllers](usage-controllers.md).

To let Smart Irrigation run the valves itself instead, with programs and schedules, see [Watering with programs](usage-full-controller.md), and [Coming from Irrigation Unlimited](usage-from-irrigation-unlimited.md) to import an Irrigation Unlimited configuration.

<a id="overview-1"></a>
## Irrigation Unlimited

Smart Irrigation calculates how long each zone should water, and Irrigation Unlimited (IU) runs the valves. The two do not talk to each other directly: the duration is handed over by a [blueprint](usage-automations.md#blueprints-we-provide) or an automation that calls IU's own `adjust_time` action. There is nothing to enable in either integration, and no `configuration.yaml` block to add for Smart Irrigation, which is set up in the interface only (adding one causes a setup error on restart).

Use the `adjust time` blueprint that matches your setup (a zone of its own, or a zone inside a sequence), together with the `reset bucket` one. Either way it is one automation per zone: a sequence adjusted as a whole spreads the time you give it across its zones in proportion to their original durations, so a calculated duration handed to the sequence would water every zone by the wrong amount.

IU exposes `binary_sensor` entities, not switches. Do not drive the valve yourself in parallel, or the two will fight. An automation of your own looks like this:

```yaml
alias: "Smart Irrigation to IU: duration of zone 1"
triggers:
  - trigger: time
    at: "23:00:00"
conditions:
  - condition: template
    value_template: "{{ states('sensor.smart_irrigation_zone_1') | int(0) > 0 }}"
actions:
  - action: irrigation_unlimited.adjust_time
    data:
      entity_id: binary_sensor.irrigation_unlimited_c1_z1
      actual: "{{ timedelta(seconds=states('sensor.smart_irrigation_zone_1') | int(0)) }}"
```

The water balance can be credited by a separate automation that triggers when the IU zone turns off: see the Irrigation Unlimited reset blueprint in the [blueprints table](usage-automations.md#blueprints-we-provide), or [observed watering](configuration-closed-loop.md) on the valve IU drives.

**If IU does not get the duration**, check that the blueprint or automation runs, and that its IU entity exists (a `binary_sensor`).

??? note "The sync services are gone"

    `sync_with_irrigation_unlimited`, `send_zone_data_to_irrigation_unlimited` and `get_irrigation_unlimited_status` have been removed. They belonged to a sync subsystem that was switched off and had no setting to switch it on: the flag it read was never a setting of this integration, so it could not work for anyone, and calling one returned quietly with a warning in the log (discussion #696). It also guessed which IU entity belonged to which zone from their names. The blueprint replaces them.

## Irrigation-V5

[Irrigation-V5](https://github.com/petergridge/Irrigation-V5) is another scheduler and controller. Like Irrigation Unlimited it does not calculate anything, so Smart Irrigation supplies the run time and V5 runs the valves.

**No automation is needed for this one.** V5 reads a numeric entity as a multiplier on a zone's watering time, and its author documents the way to turn that into "run for exactly this many seconds":

1. In the zone's advanced options, set the **watering unit to seconds**.
2. Set the zone's **watering time to 1**.
3. Set the zone's **Adjustment Sensor** to the Smart Irrigation sensor of that zone, `sensor.smart_irrigation_[zone_name]`.

V5 then runs for `1 x the value of our sensor` seconds, which is the calculated duration. When Smart Irrigation says no watering is needed, the sensor reads 0, the multiplier is 0, and V5 skips the zone: whether to water and for how long both come from the calculation.

!!! warning "Keep the duration sensor in seconds"

    It has a `duration` device class, so Home Assistant lets you change the unit it shows per entity. Switching it to minutes would make V5 read minutes as if they were seconds, and water for a sixtieth of the time.

### Crediting the water balance with Irrigation-V5

V5 drives your own valve or solenoid entity, so Smart Irrigation can watch that same entity: turn on **observed watering** and set the zone's **Linked valve/switch** to the valve V5 operates (see [closed loop](configuration-closed-loop.md)). The water balance is then credited from the run that actually happened, with no automation.

To stay open loop, call `smart_irrigation.credit_watering` from your own automation when the valve turns off, and do **not** turn on observed watering as well, or the water is credited twice.

## Seasonal adjustments and recurring schedules

**Seasonal adjustments** scale the crop factor and shift the irrigation threshold over a range of months. They are set on the advanced panel or with `smart_irrigation.set_seasonal_adjustment`: see [seasonal adjustments](configuration-general.md#seasonal-adjustments).

```yaml
action: smart_irrigation.set_seasonal_adjustment
data:
  name: "Summer boost"
  month_start: 6  # June
  month_end: 8    # August
  multiplier_adjustment: 1.3
  threshold_adjustment: -5.0
  zones: "all"
  enabled: true
```

Without `adjustment_id` it creates an adjustment; with it, it changes that one, and with `remove: true` as well it removes it. A calculation of a zone that an adjustment covers fires `smart_irrigation_seasonal_adjustment_applied` (`zone_id`, `adjustments`).

!!! warning "Recurring schedules are on their way out"

    `create_recurring_schedule`, `update_recurring_schedule` and `delete_recurring_schedule` keep working until version 2027.11 at the earliest, and each call raises a repair issue. The programs' schedules do the same, in the panel, under **Watering › Programs** (Calculate and water). See [actions on their way out](usage-services.md#actions-on-their-way-out).

    A recurring schedule runs daily, weekly, monthly or every few hours, and either calculates (`calculate`), reads the weather (`update`) or fires the start event (`irrigate`) for the zones it names. It fires `smart_irrigation_recurring_schedule_triggered`. For their debug log:

    ```yaml
    logger:
      logs:
        custom_components.smart_irrigation.scheduler: debug
    ```
