---
title: "Updating"
---
# Updating

## To the latest version

- **Installed with HACS**: HACS, and the Home Assistant updates, show a notification when a new version is out. Install it from there. To check for an update now, use **Update information** on the repository in HACS.
- **Installed by hand**: download the [latest release](https://github.com/altmenorg/HAsmartirrigation/releases) as a zip file and extract it into the `custom_components` folder of your Home Assistant configuration, over the previous installation.

Then restart Home Assistant.

## To a specific version

- **Installed with HACS**: pick the version under **Redownload** in HACS, or call the `update.install` action:

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
