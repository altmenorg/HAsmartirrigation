---
layout: default
title: Usage: Entities
---
# Entities

> Main page: [Usage](usage.md)<br/>
> Next: [Services](usage-services.md)

Each [zone](configuration-zones.md) you configure will be added as a sensor entity to Home Assistant. The sensor will be named as follows: `sensor.smart_irrigation_[zone_name]`. So if you have a zone called 'lawn' then the sensor would be named `sensor.smart_irrigation_lawn`.

Each entity will have the following attributes:

| Attribute | Description |
| --- | --- |
|`id`|internal identification|
|`size`|the total area the irrigation system reaches in m<sup>2</sup> or sq ft.|
|`throughput`|total amount of water that flows through the irrigation system in liters or gallon per minute.|
|`state`|disabled, manual, automatic |
|`bucket`|the bucket size in mm or inch|
|`unit_of_measurement`|seconds|
|`device_class`|duration|
|`icon`|default: mdi:sprinkler|
|`friendly_name`|Name of your zone.|

Sample screenshot:

![](assets/images/sensor.[zone_name].png)

If you want to expose these attributes as separate sensors, you can add [template sensors](https://www.home-assistant.io/integrations/template/#state-based-template-binary-sensors-buttons-images-numbers-selects-and-sensors) using a template like the following example for `bucket`:

`{{state_attr('sensor.smart_irrigation_your_zone_sensor_name', 'bucket')}}`

> Main page: [Usage](usage.md)<br/>
> Next: [Services](usage-services.md)
