---
title: "Installation"
---
# Installation

!!! tip "Starting with nothing at all?"

    Not even Home Assistant? [From nothing to a watered garden](getting-started-from-scratch.md) walks the whole path in half an hour, hardware included, and comes back here for this part.

Smart Irrigation needs Home Assistant 2026.3 or later.

Four steps:

1. **[Download the integration](installation-download.md)** from HACS (one click) or by hand, and restart Home Assistant.
2. **Add it** in Settings › Devices & services › Add integration › Smart Irrigation. Setup asks nothing: a new **Smart Irrigation** panel appears in the sidebar.

    ![Adding Smart Irrigation in Home Assistant](assets/images/installation-1.png)

3. **Turn on a [weather service](installation-weatherservice.md)** if you want one, under **Weather › Weather service** in the panel: Open-Meteo is the default and needs no key. Skip this if all your weather comes from your own sensors.
4. **Run the setup assistant** (**Settings › General**, **Open the assistant**): it asks what Smart Irrigation should do and creates your first zone with its sensor group. From there, [configure the rest](configuration.md).

Also in this section:

- [Which weather service](weather-services.md) to pick, and [manual coordinates](MANUAL_COORDINATES.md) when the weather should be read somewhere else than your Home Assistant location.
- [Updating](installation-updating.md) to the latest or a specific version.
- [The Configure button](installation-options.md) on the integration's page, which only points to the panel.
- [Migrating from V1](installation-migration.md) (v0.0.X), for very old installations.
- [Uninstalling](installation-uninstalling.md) the integration.
