---
title: "Installation: Download"
---
# Installation: Download

1. Install the custom integration using HACS or manually:
    * **Using HACS (recommended)**: Smart Irrigation is in the HACS default store, and HACS handles updates. Open it in HACS in one click:

      [![Open Smart Irrigation in HACS on your Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/_change/?redirect=marketplace_repository%2F%3Fowner%3Daltmenorg%26repository%3DHAsmartirrigation%26category%3Dintegration)

      or search for **Smart Irrigation** in the [HACS](https://hacs.xyz) panel. Then click **Download**. If you added this repository as a custom repository in the past, that entry is no longer needed.
    * **Manually**: Download the [latest release](https://github.com/altmenorg/HAsmartirrigation/releases) as a zip file and extract it into the `custom_components` folder of your Home Assistant configuration (you should end up with `custom_components/smart_irrigation/`).

2. Restart Home Assistant to load the integration.
3. Go to **Settings → Devices & Services → Add Integration**, search for **Smart Irrigation** and click to add it.
4. Confirm with **OK**: setup asks nothing. Then open the Smart Irrigation panel, where the setup assistant creates a first zone with you and the [weather service](installation-weatherservice.md) is chosen.
