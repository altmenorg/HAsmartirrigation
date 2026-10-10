# Enhanced Scheduling and Executor Integration

This document describes the enhanced scheduling capabilities and how Smart Irrigation hands its calculated run times to the schedulers and controllers that drive the valves: Irrigation Unlimited and Irrigation-V5.

## Overview

Smart Irrigation includes recurring schedules and seasonal adjustments of its own, and hands its calculated run times to Irrigation Unlimited and Irrigation-V5 through blueprints and automations.

## Enhanced Native Scheduling

### Recurring Schedules

Create flexible recurring schedules that automatically trigger irrigation calculations, updates, or irrigation events.

#### Schedule Types

1. **Daily Schedules**: Run every day at a specified time
2. **Weekly Schedules**: Run on specific days of the week
3. **Monthly Schedules**: Run on a specific day of each month
4. **Interval Schedules**: Run every X hours

#### Configuration

Use the new services to create and manage recurring schedules:

```yaml
service: smart_irrigation.create_recurring_schedule
data:
  name: "Morning Calculation"
  type: "daily"
  time: "06:00"
  action: "calculate"
  zones: "all"
  enabled: true
```

#### Schedule Actions

- **calculate**: Trigger irrigation calculations for specified zones
- **update**: Update weather data for specified zones  
- **irrigate**: Fire irrigation start event for specified zones

### Seasonal Adjustments

Automatically adjust irrigation parameters based on the season or time of year.

#### Adjustment Types

1. **Multiplier Adjustments**: Scale the crop factor of the zones, which scales the evapotranspiration (1 changes nothing)
2. **Threshold Adjustments**: Adjust the irrigation threshold (bucket level)

#### Example Configuration

```yaml
service: smart_irrigation.create_seasonal_adjustment
data:
  name: "Summer Boost"
  month_start: 6  # June
  month_end: 8    # August
  multiplier_adjustment: 1.5
  threshold_adjustment: -5.0
  zones: "all"
  enabled: true
```

## Irrigation Unlimited Integration

### Overview

Smart Irrigation calculates how long each zone should water, and Irrigation Unlimited runs the valves. The two do not talk to each other directly: the duration is handed over by a [blueprint](usage-automations.md) or an automation that calls Irrigation Unlimited's own `adjust_time` action. There is nothing to enable in either integration, and no `configuration.yaml` block to add for Smart Irrigation, which is UI-only (adding one causes a setup error on restart).

### The sync services are gone

`sync_with_irrigation_unlimited`, `send_zone_data_to_irrigation_unlimited` and `get_irrigation_unlimited_status` have been removed. They belonged to a sync subsystem that was switched off and had no setting to switch it on: the flag it read was never a setting of this integration, so it could not work for anyone, and calling one returned quietly with a warning in the log. That cost at least one person an evening of looking for a mistake in their own configuration (discussion #696).

It also worked by guessing which Irrigation Unlimited entity belonged to which zone from their names, which is not something to build on.

**Use the blueprint instead.** It hands Irrigation Unlimited the calculated duration through IU's own `adjust_time` action and lets IU run the valves, which is the division of labour both integrations are built for.

## Best Practices

### Using Both Integrations Together

1. **Primary Controller**: Choose either Smart Irrigation or Irrigation Unlimited as your primary controller
2. **Data Flow**: Use Smart Irrigation for calculations and Irrigation Unlimited for execution
3. **Scheduling**: Use Smart Irrigation's enhanced scheduling with Irrigation Unlimited's execution
4. **Monitoring**: Monitor both systems for comprehensive irrigation oversight

### Recommended Workflow

1. **Smart Irrigation**: Calculate irrigation needs based on weather and ET
2. **Blueprint or automation**: Hand the calculated durations to Irrigation Unlimited with `adjust_time`
3. **Irrigation Unlimited**: Execute irrigation schedules with hardware control
4. **Feedback**: Monitor execution and adjust parameters as needed

### Example Integration Automation

Irrigation Unlimited exposes `binary_sensor` entities (not switches). Use the `irrigation_unlimited.adjust_time` service to pass the calculated duration to IU, then let IU handle execution:

```yaml
automation:
  - alias: "Smart Irrigation → IU: push duration for zone 1"
    trigger:
      - platform: time
        at: "23:00:00"
    condition:
      - condition: template
        value_template: "{{ states('sensor.smart_irrigation_zone_1') | int(0) > 0 }}"
    action:
      - service: irrigation_unlimited.adjust_time
        data:
          entity_id: binary_sensor.irrigation_unlimited_c1_z1
          actual: "{{ timedelta(seconds=states('sensor.smart_irrigation_zone_1') | int(0)) }}"
```

The bucket reset can be handled by a separate automation that triggers when the IU zone turns off (see the [Irrigation Unlimited reset bucket blueprint](usage-automations.md), which you can import in one click from the blueprints table).

## Irrigation-V5

[Irrigation-V5](https://github.com/petergridge/Irrigation-V5) is another scheduler and controller. Like Irrigation Unlimited it does not calculate anything, so Smart Irrigation supplies the run time and V5 runs the valves.

**No automation is needed for this one.** V5 reads a numeric entity as a multiplier on a zone's watering time, and its author documents the trick that turns that into "run for exactly this many seconds":

1. In the zone's advanced options, set the **watering unit to seconds**.
2. Set the zone's **watering time to 1**.
3. Set the zone's **Adjustment Sensor** to the Smart Irrigation sensor for that zone, `sensor.smart_irrigation_[zone_name]`.

V5 then runs for `1 x the value of our sensor` seconds, which is the calculated duration. When Smart Irrigation says no irrigation is needed the sensor reads 0, the multiplier is 0, and V5 skips the zone: the decision of whether to water and of how long both come from the calculation.

> Keep the unit of our duration sensor as seconds. It has a `duration` device class, so Home Assistant lets you change the displayed unit per entity; switching it to minutes would make V5 read minutes as if they were seconds and water for a sixtieth of the time.

### Crediting the bucket with Irrigation-V5

V5 drives your own valve or solenoid entity, which means Smart Irrigation can simply watch that same entity: enable **observed watering** and set the zone's linked entity to the valve V5 operates (see [closed loop](configuration-closed-loop.md)). The bucket is then credited from the run that actually happened, and no reset automation is needed.

If you prefer to stay open loop, call `smart_irrigation.reset_bucket` from your own automation when the valve turns off, and do **not** enable observed watering as well, or the bucket is credited twice.

## Automation Blueprints

See [the blueprints page](usage-automations.md) for the full list and which one to pick, and the [off-the-shelf controllers page](usage-controllers.md) for Rain Bird, Hydrawise, Rachio, OpenSprinkler and B-hyve. For Irrigation Unlimited, use the `adjust time` blueprint that matches your setup (a zone of its own, or a zone inside a sequence) together with the `reset bucket` one. Either way it is one automation per zone: a sequence adjusted as a whole spreads the time you give it across its zones in proportion to their original durations, so a calculated duration handed to the sequence would water every zone by the wrong amount.

## API Reference

### Services

#### Enhanced Scheduling Services

- `smart_irrigation.create_recurring_schedule`
- `smart_irrigation.update_recurring_schedule`
- `smart_irrigation.delete_recurring_schedule`
- `smart_irrigation.create_seasonal_adjustment`
- `smart_irrigation.update_seasonal_adjustment`
- `smart_irrigation.delete_seasonal_adjustment`

### Events

#### Enhanced Scheduling Events

- `smart_irrigation_recurring_schedule_triggered`
- `smart_irrigation_seasonal_adjustment_applied`

## Troubleshooting

### Common Issues

1. **Schedules Not Running**: Verify schedule configuration and enabled status
2. **Seasonal Adjustments Not Applied**: Check month ranges and zone specifications
3. **Irrigation Unlimited Not Getting the Duration**: Check that the blueprint or automation runs, and that its Irrigation Unlimited entity exists (a `binary_sensor`)

### Debug Logging

Enable debug logging for detailed information:

```yaml
logger:
  logs:
    custom_components.smart_irrigation.scheduler: debug
```

## Migration and Compatibility

### Backward Compatibility

All enhanced features are optional and maintain full backward compatibility with existing Smart Irrigation installations.

### Upgrading

1. Existing installations continue to work without changes
2. New features are opt-in through configuration or service calls
3. Legacy automations remain functional

### Integration with Existing Setups

The enhanced features complement existing Smart Irrigation functionality:
- Existing triggers continue to work
- Current automations remain functional
- New features can be gradually adopted

## Examples and Templates

### Basic Recurring Schedule

```yaml
# Daily morning calculation
service: smart_irrigation.create_recurring_schedule
data:
  name: "Daily Morning Check"
  type: "daily" 
  time: "06:00"
  action: "calculate"
  zones: "all"
```

### Seasonal Adjustment

```yaml
# Summer irrigation boost
service: smart_irrigation.create_seasonal_adjustment
data:
  name: "Summer Heat Adjustment"
  month_start: 6
  month_end: 8
  multiplier_adjustment: 1.3
  zones: "all"
```

This enhanced functionality provides Smart Irrigation users with professional-grade scheduling capabilities while maintaining the simplicity and reliability they expect.
