---
layout: default
title: "Installation: Download"
---
# Installation: Download

> Main page: [Installation](installation.md)<br/>
> Next: [Set up weatherservice](installation-weatherservice.md)

1. Install the custom integration using HACS or manually:
    * **Using HACS (recommended)**: Smart Irrigation is in the HACS default store, and HACS handles updates. In the [HACS](https://hacs.xyz) panel, search for **Smart Irrigation** and click **Download**. If you added this repository as a custom repository in the past, that entry is no longer needed.
    * **Manually**: Download the [latest release](https://github.com/altmenorg/HAsmartirrigation/releases) as a zip file and extract it into the `custom_components` folder of your Home Assistant configuration (you should end up with `custom_components/smart_irrigation/`).

2. Restart Home Assistant to load the integration.
3. Go to **Settings → Devices & Services → Add Integration**, search for **Smart Irrigation** and click to add it.
4. Confirm with **OK**: setup asks nothing. Then open the Smart Irrigation panel, where the setup assistant creates a first zone with you and the [weather service](installation-weatherservice.md) is chosen.

>Main page: [Installation](installation.md)<br/>
>Next: [Set up weatherservice](installation-weatherservice.md)