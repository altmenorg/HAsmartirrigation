---
title: "Downloading the integration"
---
# Downloading the integration

## With HACS (recommended)

Smart Irrigation is in the HACS default store, and HACS handles the updates. Open it in HACS in one click:

[![Open Smart Irrigation in HACS on your Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/_change/?redirect=marketplace_repository%2F%3Fowner%3Daltmenorg%26repository%3DHAsmartirrigation%26category%3Dintegration)

or search for **Smart Irrigation** in the [HACS](https://hacs.xyz) panel. Then click **Download**.

If you added this repository as a custom repository in the past, that entry is no longer needed.

## By hand

Download the [latest release](https://github.com/altmenorg/HAsmartirrigation/releases) as a zip file and extract it into the `custom_components` folder of your Home Assistant configuration. You should end up with `custom_components/smart_irrigation/`.

## Then

1. Restart Home Assistant to load the integration.
2. Go to **Settings › Devices & services › Add integration**, search for **Smart Irrigation** and add it.
3. Confirm with **OK**: setup asks nothing. Open the **Smart Irrigation** panel in the sidebar, turn on the [weather service](installation-weatherservice.md) if you want one, and let the setup assistant create your first zone (see [Installation](installation.md)).
