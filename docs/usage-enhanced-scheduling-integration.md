# Enhanced Scheduling and Irrigation Unlimited Integration

This document describes the enhanced scheduling capabilities and Irrigation Unlimited integration features added to Smart Irrigation.

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

Enable the integration in your Smart Irrigation configuration:

```yaml
# In configuration.yaml or through the UI
smart_irrigation:
  irrigation_unlimited_integration: true
  iu_entity_prefix: "switch.irrigation_unlimited"
  iu_sync_schedules: true
  iu_share_zone_data: true
```

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

```yaml
automation:
  - alias: "Smart Irrigation to IU Sync"
    trigger:
      - platform: state
        entity_id: sensor.smart_irrigation_zone_1
        attribute: duration
    condition:
      - condition: template
        value_template: "{{ states('sensor.smart_irrigation_zone_1') | int > 0 }}"
    action:
      - service: smart_irrigation.sync_with_irrigation_unlimited
        data:
          zone_ids: [1]
      - service: switch.turn_on
        entity_id: switch.irrigation_unlimited_c1_z1
      - delay:
          seconds: "{{ states('sensor.smart_irrigation_zone_1') | int }}"
      - service: switch.turn_off
        entity_id: switch.irrigation_unlimited_c1_z1
      - service: smart_irrigation.reset_bucket
        target:
          entity_id: sensor.smart_irrigation_zone_1
```

## Automation Blueprints

### Smart Irrigation with Irrigation Unlimited Integration

A comprehensive blueprint that automatically syncs Smart Irrigation zones with Irrigation Unlimited entities, handling:
- Duration-based irrigation control
- Automatic bucket reset after irrigation
- Minimum/maximum duration limits
- Event-driven triggers

### Weather-Responsive Scheduling  

An advanced blueprint that implements weather-responsive irrigation with:
- Seasonal multiplier adjustments
- Temperature and wind speed thresholds
- Rain sensor integration
- Automatic seasonal adjustment creation

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
