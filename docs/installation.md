---
title: "Installation"
---
# Installation

> Starting with nothing at all, not even Home Assistant? [From nothing to a watered garden](getting-started-from-scratch.md) walks the whole path in half an hour, hardware included, and comes back here for this part.

Smart Irrigation needs Home Assistant 2026.3 or later.

Three steps:

1. **[Download the integration](installation-download.md)** from HACS (one click) or by hand, and restart Home Assistant.
2. **Add it** in Settings › Devices & services › Add integration › Smart Irrigation. Setup asks nothing: a new **Smart Irrigation** panel appears in the sidebar.

    ![](assets/images/installation-1.png)

3. **Open the panel** and follow its setup assistant: it creates your first zone and picks the [weather service](installation-weatherservice.md) (Open-Meteo by default, no key needed). From there, [configure the rest](configuration.md).

Also in this section:

- [Which weather service](weather-services.md) to pick, and [manual coordinates](MANUAL_COORDINATES.md) when the weather should be read somewhere else than your Home Assistant location.
- [Updating](installation-updating.md) to the latest or a specific version.
- [The Configure button](installation-options.md) on the integration's page, which only points to the panel.
- [Migrating from V1](installation-migration.md) (v0.0.X), for very old installations.
- [Uninstalling](installation-uninstalling.md) the integration.
