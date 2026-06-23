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

Experts say you should water deeply but infrequently to avoid overwatering and encourage deep rooting. It might be a good idea to create an automation that starts early enough to finish before sunrise (using the [`smart_irrigation_start_irrigation_all_zones` event](usage-events.md)) and only once per week if duration is above `0` or whenever the `bucket < -25 mm`. Adjust to your specific needs.

The examples on this page don't use a timer - see [this discussion](https://github.com/jeroenterheerdt/HAsmartirrigation/discussions/361) for an example of using a timer for extra safety.

Also, check out the [blueprints we provide](https://github.com/jeroenterheerdt/HAsmartirrigation/tree/master/blueprints).

### Example 1: one valve, once per week irrigation if duration > 0 or if the bucket < - 25 mm:

This example automation runs daily and checks `sensor.smart_irrigation_[zone_name]`. It checks if the `buckets` is `< -25mm (~1")` or if's a monday and duration is above `0`. This follows the expert recommendation mentioned above.

[yaml](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/automations/1_one_valve_once_per_week.yaml)

### Example 2: one valve, potentially daily irrigation

Here is an example automation that runs when the `smart_irrigation_start_irrigation_all_zones` event is fired. It checks if `sensor.smart_irrigation_[zone_name]` is above 0 and if it is it turns on `switch.irrigation_tap1`, waits the number of seconds as indicated by `sensor.smart_irrigation_[zone_name]` and then turns off `switch.irrigation_tap1`. Finally, it resets the bucket by calling the `smart_irrigation.reset_bucket` service. If you have multiple instances you will need to adjust the event, entities and service names accordingly.

[yaml](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/automations/2_one_valve_potential_daily.yaml)
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

[yaml](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/automations/3_one_valve_workday.yaml)
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

[yaml](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/automations/4_two_valves_workday.yaml)


## Example 5: Advanced multi-tap example
This example handles multiple taps for a six-zone system controlled by [ESPHome](https://esphome.io/components/sprinkler.html). This is the automation the creator of this integration uses themselves (ignoring the expert advice above...).

[yaml](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/master/automations/5_multi_tap.yaml)


> Main page: [Usage](usage.md)<br/>
> Previous: [Events](usage-events.md)<br/>
> Next: [Troubleshooting](usage-troubleshooting.md)
