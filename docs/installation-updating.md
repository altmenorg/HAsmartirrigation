---
title: "Updating"
---
# Updating

## To the latest version

- **Installed from the Marketplace** (or HACS before Home Assistant 2026.11): the update shows under **Settings › Updates** when a new version is out. Install it from there.
- **Installed by hand**: download the [latest release](https://github.com/altmenorg/HAsmartirrigation/releases) as a zip file and extract it into the `custom_components` folder of your Home Assistant configuration, over the previous installation.

Then restart Home Assistant.

## To a specific version

- **Installed from the Marketplace**: on Smart Irrigation's page in **Settings › Marketplace**, choose **Install another version** in the three-dot menu (in HACS, before Home Assistant 2026.11: **Redownload**), or call the `update.install` action:

    ```yaml
    action: update.install
    target:
      entity_id: update.smart_irrigation_update
    data:
      version: v2026.10.2
    ```

- **Installed by hand**: download the zip file of the [release](https://github.com/altmenorg/HAsmartirrigation/releases) you want and extract it into the `custom_components` folder, over the previous installation.

Then restart Home Assistant.

## Checking the version

- **The integration**: in **Settings › Devices & services › Smart Irrigation**, open the hub device. Its firmware version is the installed version.
- **The panel**: the version is shown at the top right of the Smart Irrigation panel. If it differs from the integration's, your browser is showing an old copy from its cache: [force a refresh](https://refreshyourcache.com/en/cache/).
