---
layout: default
title: Usage: Troubleshooting
---
# Troubleshooting

> Main page: [Usage](usage.md)<br/>
> Previous: [Automations](usage-automations.md)<br/>

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
For those interested, [here's the function that does this most of the conversion in code (with the exception of the absolute to relative conversion for pressure)](https://github.com/jeroenterheerdt/HAsmartirrigation/blob/7c206809ac35a686a16eb8b3b209d030a28463f7/custom_components/smart_irrigation/helpers.py#L115): 

> Main page: [Usage](usage.md)<br/>
> Previous: [Automations](usage-automations.md)<br/>