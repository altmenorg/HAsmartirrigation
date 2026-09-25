# Enhanced Scheduling and Executor Integration

This document describes the enhanced scheduling capabilities and how Smart Irrigation hands its calculated run times to the schedulers and controllers that drive the valves: Irrigation Unlimited and Irrigation-V5.

## Overview

Smart Irrigation now includes advanced scheduling capabilities and seamless integration with the Irrigation Unlimited integration, providing users with more flexible and powerful irrigation management options.

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

1. **Multiplier Adjustments**: Modify the irrigation multiplier for zones
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

The integration provides bidirectional communication between Smart Irrigation and Irrigation Unlimited, allowing:

- Automatic zone synchronization
- Schedule sharing and conversion
- Real-time data exchange
- Unified irrigation control

### Configuration

Smart Irrigation v2 is a UI-only integration — there is no `configuration.yaml` block to add. Adding one will cause a setup error on restart.

Enable the Irrigation Unlimited integration from the Smart Irrigation panel in the Home Assistant UI (Settings → Integrations → Smart Irrigation → Configure). The relevant options are stored internally by the integration.

### Zone Synchronization

Automatically sync Smart Irrigation zones with corresponding Irrigation Unlimited entities:

```yaml
service: smart_irrigation.sync_with_irrigation_unlimited
data:
  zone_ids: [1, 2, 3]  # Optional: specific zones, or omit for all
```

The integration attempts to match zones using:
1. Zone name similarity
2. Zone ID matching in entity names
3. Entity ID patterns (e.g., `c1_z2` for zone 2)

### Real-time Data Sharing

Send zone data directly to Irrigation Unlimited:

```yaml
service: smart_irrigation.send_zone_data_to_irrigation_unlimited
data:
  zone_id: 1
  data:
    duration: 300
    state: "on"
```

### Schedule Conversion

Convert Smart Irrigation triggers and schedules to Irrigation Unlimited format:

```yaml
service: smart_irrigation.get_irrigation_unlimited_status
```

## Best Practices

### Using Both Integrations Together

1. **Primary Controller**: Choose either Smart Irrigation or Irrigation Unlimited as your primary controller
2. **Data Flow**: Use Smart Irrigation for calculations and Irrigation Unlimited for execution
3. **Scheduling**: Use Smart Irrigation's enhanced scheduling with Irrigation Unlimited's execution
4. **Monitoring**: Monitor both systems for comprehensive irrigation oversight

### Recommended Workflow

1. **Smart Irrigation**: Calculate irrigation needs based on weather and ET
2. **Integration**: Automatically sync calculated durations to Irrigation Unlimited
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

#### Irrigation Unlimited Integration Services

- `smart_irrigation.sync_with_irrigation_unlimited`
- `smart_irrigation.send_zone_data_to_irrigation_unlimited`
- `smart_irrigation.get_irrigation_unlimited_status`

### Events

#### Enhanced Scheduling Events

- `smart_irrigation_recurring_schedule_triggered`
- `smart_irrigation_seasonal_adjustment_applied`

#### Integration Events

- `smart_irrigation_irrigation_unlimited_sync_completed`
- `smart_irrigation_iu_sync_result`
- `smart_irrigation_iu_status`

## Troubleshooting

### Common Issues

1. **Zones Not Syncing**: Check entity name patterns and zone ID matching
2. **Schedules Not Running**: Verify schedule configuration and enabled status
3. **Seasonal Adjustments Not Applied**: Check month ranges and zone specifications
4. **IU Integration Not Working**: Verify Irrigation Unlimited is installed and entities exist

### Debug Logging

Enable debug logging for detailed information:

```yaml
logger:
  logs:
    custom_components.smart_irrigation.scheduler: debug
    custom_components.smart_irrigation.irrigation_unlimited: debug
```

### Entity Matching

If automatic zone matching fails, you can implement custom matching logic in your automations or use manual zone mapping.

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

### IU Synchronization

```yaml
# Sync all zones with IU
service: smart_irrigation.sync_with_irrigation_unlimited
```

This enhanced functionality provides Smart Irrigation users with professional-grade scheduling capabilities while maintaining the simplicity and reliability they expect.
