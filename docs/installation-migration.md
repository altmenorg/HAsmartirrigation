---
layout: default
title: Installation: Migration
---
# Installation: Migration from V1 (0.0.X) to V2 (202X.X.X)

> Main page: [Installation](installation.md)<br/>
> Previous: [Updating the integration](installation-updating.md)<br/>
> Next: [Uninstalling the integration](installation-uninstalling.md)

Version 2 (202X.X.X) presents a complete rewrite of the integration compared to V1 (0.0.X). Everything was done from scratch. Many bugs present in V1 are fixed in V2. On top of that V2 provides multi zone support and overall better performance, more accurate results and more flexibility to configure the system to your needs.
Also, in version 2 only one instance of Smart Irrigation is allowed. In V1, if you wanted multiple zones you needed to install multiple instances of Smart Irrigation.

With the big jump from V1 to V2, however, there is no upgrade path. However, we want to make it as easy as possible for you to move to V2 from V1.
Please follow the procedure below for each installed instance of V1, before upgrading to V2:

1. Make sure you are at least on V0.0.82.
2. In Home Assistant, go to Settings>Devices&Services>Integrations>Smart Irrigation, or use [this link](https://my.home-assistant.io/redirect/integration/?domain=smart_irrigation).
3. For each instance of Smart Irrigation that you have configured, click the 'three vertical dots' menu and select 'download diagnostics':
![image](https://github.com/jeroenterheerdt/HAsmartirrigation/assets/8188990/d9715201-d4ee-4b58-a158-c0504e82eca4)
4. Your browser should download a diagnostics file. Store this file in a safe place and don't share it with anyone as it includes your Open Weather Map API key (if you have that configured). Consider giving it an easy to remember name, like 'Zone 1', etc.
5. Confirm your diagnostics file opens and looks similar to this:
```
{
  "home_assistant": {
    "installation_type": "...",
    ...
  },
  "custom_components": {
    ...
    "smart_irrigation": {
      "version": "0.0.8X",
      "requirements": []
    },
    ...
  },
  "integration_manifest": {
    "domain": "smart_irrigation",
    "name": "Smart Irrigation",
    "codeowners": [
      "@jeroenterheerdt"
    ],
    "config_flow": true,
    "dependencies": [],
    "documentation": "https://github.com/jeroenterheerdt/HASmartIrrigation",
    "homekit": {},
    "integration_type": "service",
    "iot_class": "cloud_polling",
    "issue_tracker": "https://github.com/jeroenterheerdt/HASmartIrrigation/issues",
    "requirements": [],
    "ssdp": [],
    "version": "0.0.8X",
    "zeroconf": [],
    "is_built_in": false
  },
  "data": {
    "config": {
      "entry_id": "0f60ec5036558de65a1659a17522ac36",
      "version": 1,
      "domain": "smart_irrigation",
      "title": "Smart Irrigation",
      "data": {
        "number_of_sprinklers": 4.0,
        "flow": 5.0,
        "area": 100.0,
        "api_key": "[Your API key]",
        "api_version": "[You API version: 2.5 or 3.0]",
        "reference_evapotranspiration": [
         ...
        ],
        "name": "Smart Irrigation",
        "sources": {
          ...
        },
        "sensors": {
         ...
        }
      },
      "options": {},
      "pref_disable_new_entities": false,
      "pref_disable_polling": false,
      "source": "user",
      "unique_id": "Smart Irrigation",
      "disabled_by": null
    }
  }
}
```
6. After you have downloaded and confirmed all diagnostics files (one for each instance of Smart Irrigation), remove all instances of Smart Irrigation.
7. Restart Home Assistant
8. Use HACS to install Smart Irrigation V202X.X. Make sure you use the correct API key and API version if you want to continue using Open Weather Map (recommended). Also, refer to your diagnostics file to remind yourself if and which sensors you used to supply part of the required weather data.
9. Use the panel in the left sidebar to set up your zones, leveraging your diagnostics file to make the correct settings. A couple of things have changed:
- you can disregard reference ET values, they are not required.
- each zone has a property called 'throughput'. To calculate throughput do `number of sprinklers x flow` from your diagnostics file for that zone.
- each zone has a property called 'size'. This is the same as the `area` from your diagnostics file for that zone.
- sensor groups are where you decide what sources to use (Open Weather Map, Sensors, Static values (new in V2) or a mix). Use the true/false values and sensors from your diagnostics file to figure out what set up you had.

If you need help, please reach out by [opening an issue](https://github.com/jeroenterheerdt/HAsmartirrigation/issues).


> Main page: [Installation](installation.md)<br/>
> Previous: [Updating the integration](installation-updating.md)<br/>
> Next: [Uninstalling the integration](installation-uninstalling.md)
