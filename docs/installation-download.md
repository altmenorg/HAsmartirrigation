---
title: "Downloading the integration"
---
# Downloading the integration

## From the Marketplace (recommended)

Smart Irrigation is in the catalog of the Home Assistant [Marketplace](https://www.home-assistant.io/integrations/marketplace/), which handles the updates. Open it in one click:

[![Open Smart Irrigation in the Marketplace on your Home Assistant](https://my.home-assistant.io/badges/marketplace_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=altmenorg&repository=HAsmartirrigation&category=integration)

or go to **Settings › Marketplace** and search for **Smart Irrigation**. Then select **Install**, and **Install** again in the dialog. The first time, the Marketplace asks you to accept a warning before it installs anything.

If you added this repository as a custom repository in the past, that entry is no longer needed.

!!! note "Home Assistant 2026.10 or older"

    The Marketplace is built into Home Assistant from 2026.11. Before, it was [HACS](https://hacs.xyz), a community integration that the Marketplace replaces: the same button opens Smart Irrigation there, or search for it in HACS, then click **Download**. When you update Home Assistant, the Marketplace takes over Smart Irrigation by itself, updates included: there is nothing to do.

## By hand

Download the [latest release](https://github.com/altmenorg/HAsmartirrigation/releases) as a zip file and extract it into the `custom_components` folder of your Home Assistant configuration. You should end up with `custom_components/smart_irrigation/`.

## Then

1. Restart Home Assistant to load the integration.
2. Go to **Settings › Devices & services › Add integration**, search for **Smart Irrigation** and add it.
3. Confirm with **OK**: setup asks nothing. Open the **Smart Irrigation** panel in the sidebar, turn on the [weather service](installation-weatherservice.md) if you want one, and let the setup assistant create your first zone (see [Installation](installation.md)).
