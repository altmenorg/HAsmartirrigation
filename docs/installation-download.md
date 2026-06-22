---
layout: default
title: Installation: Download
---
# Installation: Download

> Main page: [Installation](installation.md)<br/>
> Next: [Set up weatherservice](installation-weatherservice.md)

1. Install the custom integration using HACS or manually:
    * **Using HACS (recommended)**: HAppy Irrigation is distributed as a HACS **custom repository**, so you add it once and HACS then handles updates:
        1. In the [HACS](https://hacs.xyz) panel, open the **⋮ menu → Custom repositories**.
        2. Add `https://github.com/altmenorg/HAppyIrrigation` with category **Integration**, and confirm.
        3. Search for **HAppy Irrigation** in HACS and click **Download**.
    * **Manually**: Download the [latest release](../releases) as a zip file and extract it into the `custom_components` folder of your Home Assistant configuration (you should end up with `custom_components/happy_irrigation/`).

2. Restart Home Assistant to load the integration.
3. Go to **Settings → Devices & Services → Add Integration**, search for **HAppy Irrigation** and click to add it.
4. Follow the wizard to complete the installation. If an existing Smart Irrigation configuration is detected, the wizard offers to [import it](installation-migration.md); otherwise the first step is [setting up a weather service](installation-weatherservice.md).

>Main page: [Installation](installation.md)<br/>
>Next: [Set up weatherservice](installation-weatherservice.md)