---
layout: default
title: Installation: Updating
---
# Updating

> Main page: [Installation](installation.md)<br/>
> Next: [Migrating from V1 to V2](installation-migration.md)

1. To install the latest version, follow these instructions:
    * **If installed using HACS**: In the HACS panel or in the Home Assistant updates there should be a notification when a new version is available. Follow the instructions within HACS to update the installation files. You can also force checking for an update by updating information for the repository in the HACS.
    * **If installed manually**: Download the [latest release](/HAsmartIrrigation/releases) as a zip file and extract it into the `custom_components` folder in your Home Assistant installation, overwriting the previous installation.
2. To install a specific version, follow these instructions:
    * **If installed using HACS**: depending on the HACS version you are using you can either use find a version dropdown in the Redownload option or you have to use the `update.install` service as follows:
        ```yaml
        service: update.install
        target:
        entity_id: update.smart_irrigation_update
        data:
        version: 2024.7.0
        ```
    * **If installed manually**: Download the zip file for the [specific release](/HAsmartIrrigation/releases) you want and extract it into the `custom_components` folder in your Home Assistant installation, overwriting the previous installation.
3. Restart HA to load the changes.
4. (Optional) Verify the version number:
    * **Verify version of the backend**: In HA, go to Configuration -> Integrations. In the Smart Irrigation card, click the device to see the Device info. The 'firmware version' represents the installed version number.
    * **Verify version of the frontend**:
In the Smart Irrigation configuration panel, the version number is displayed in the top right. If the version does not match with the backend version, your browser has an outdated version stored in the cache.
To clear the cache, you should do a [force refresh of your browser](https://refreshyourcache.com/en/cache/).

> Main page: [Installation](installation.md)<br/>
> Next: [Migrating from V1 to V2](installation-migration.md)