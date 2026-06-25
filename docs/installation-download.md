---
layout: default
title: Installation: Download
---
# Installation: Download

> Main page: [Installation](installation.md)<br/>
> Next: [Set up weatherservice](installation-weatherservice.md)

1. Install the custom integration using HACS or manually:
    * **Using HACS (recommended)**: Smart Irrigation is distributed as a HACS **custom repository**, so you add it once and HACS then handles updates:
        1. In the [HACS](https://hacs.xyz) panel, open the **⋮ menu → Custom repositories**.
        2. Add `https://github.com/altmenorg/HAsmartirrigation` with category **Integration**, and confirm.
        3. Search for **Smart Irrigation** in HACS and click **Download**.
    * **Manually**: Download the [latest release](../releases) as a zip file and extract it into the `custom_components` folder of your Home Assistant configuration (you should end up with `custom_components/smart_irrigation/`).

2. Restart Home Assistant to load the integration.
3. Go to **Settings → Devices & Services → Add Integration**, search for **Smart Irrigation** and click to add it.
4. Give the integration a name to complete the setup. Then open the Smart Irrigation panel and [configure the weather service](installation-weatherservice.md).

>Main page: [Installation](installation.md)<br/>
>Next: [Set up weatherservice](installation-weatherservice.md)