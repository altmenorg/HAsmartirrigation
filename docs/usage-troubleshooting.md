---
layout: default
title: Usage: Troubleshooting
---
# Troubleshooting

> Main page: [Usage](usage.md)<br/>
> Previous: [Off-the-shelf controllers](usage-controllers.md)<br/>

In order to troubleshoot this integration or get help, it's important to check two sources:
- the diagnostic file / storage file. You can either generate a diagnostic file or get the `smart_irrigation.storage` file from the `configuration/.storage` folder. To download a diagnostics file, in Home Assistant, go to Settings >Devices&Services > Integrations >Smart Irrigation, or use this [link](https://my.home-assistant.io/redirect/integration/?domain=smart_irrigation). Click the 'three vertical dots' menu and select 'download diagnostics'.

## Reading the diagnostic / storage file
The diagnostic / storage file is in a JSON format and lists your configuration settings, your zones, sensor groups and modules.
It also lists the weather data collected. The weather data is stored in the metric system, so might not match up with what you see in the UI.
Here's a list of units:

- Dewpoint, Temperature: degrees Celsius (C)
- Evapotranspiration, Total Precipitation: millimeters (mm)
- Humidity: Percentage (%)
- Pressure: converted to absolute if provided as relative pressure and stored in hPa
- Solar radiation: megajoule per day per square meter (MJ/day/m2)
- Windspeed: meter per second (m/s)

The reason we're using these units is consistency but also because the most-used module (PyETO) requires the data to be provided in these units (at least, that's what the limited documentation and code seem to imply).
For those interested, [here's the function that does this most of the conversion in code (with the exception of the absolute to relative conversion for pressure)](https://github.com/altmenorg/HAsmartirrigation/blob/7c206809ac35a686a16eb8b3b209d030a28463f7/custom_components/smart_irrigation/helpers.py#L115): 

## "The calculated duration looks wrong"
The diagnostic file shows the current state, not how it was reached. To find out why a
particular day watered the way it did, switch on the
[calculation log](configuration-general.md) in the general settings. From then on every
calculation appends one line to `config/smart_irrigation/calc_log.jsonl` with the sensor
records and their aggregation, the module intermediates (solar radiation and whether it was
measured or estimated, net radiation, ET0) and the resulting bucket, duration and volume - so
two days can simply be diffed against each other. The most recent records are also included in
the diagnostics download (coordinates rounded, entity ids removed), which makes them easy to
attach to an issue.

> Main page: [Usage](usage.md)<br/>
> Previous: [Off-the-shelf controllers](usage-controllers.md)<br/>