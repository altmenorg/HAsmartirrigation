---
title: "Migrating from V1 to V2"
---
# Migrating from V1 (0.0.X) to V2

!!! note "Only for very old installations"

    This page is for an installation still on version 0.0.X. Any later version updates normally: see [Updating](installation-updating.md).

Version 2 is a complete rewrite of the integration. It fixes many bugs of V1, supports several zones in one installation, and is more accurate and more flexible. In V1, each zone needed its own instance of Smart Irrigation; V2 allows only one instance, with as many zones as you need.

There is no automatic upgrade path from V1 to V2. Follow these steps for each V1 instance before you upgrade:

1. Make sure you are on V0.0.82 or later.
2. In Home Assistant, go to **Settings › Devices & services › Smart Irrigation**, or use [this link](https://my.home-assistant.io/redirect/integration/?domain=smart_irrigation).
3. For each instance of Smart Irrigation, choose **Download diagnostics** in the three-dot menu.

    ![The Download diagnostics entry of the three-dot menu](https://github.com/jeroenterheerdt/HAsmartirrigation/assets/8188990/d9715201-d4ee-4b58-a158-c0504e82eca4)

4. Your browser downloads a diagnostics file. Keep it somewhere safe and do not share it: it contains your OpenWeatherMap API key, if you set one. Give it a name you will recognise, such as "Zone 1".
5. Check that the diagnostics file opens and looks similar to this:

    ```text
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

6. Once you have downloaded and checked a diagnostics file for each instance, remove all instances of Smart Irrigation.
7. Restart Home Assistant.
8. Install the current Smart Irrigation with HACS (see [Installation](installation.md)). To keep using OpenWeatherMap, use your API key; your diagnostics file also reminds you which sensors supplied part of the weather data.
9. Set up your zones in the Smart Irrigation panel, using the diagnostics file. A few things have changed:
   - Reference ET values are no longer needed.
   - Each zone has a **Throughput**: `number_of_sprinklers x flow` from the diagnostics file for that zone.
   - Each zone has a **Size**: the `area` from the diagnostics file.
   - [Sensor groups](configuration-sensor-groups.md) say where each value comes from: a weather service, a sensor, a static value, or a mix. The true/false values and the sensors of your diagnostics file tell you what you had.

If you need help, [open an issue](https://github.com/altmenorg/HAsmartirrigation/issues).
