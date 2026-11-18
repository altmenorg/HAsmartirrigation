---
title: "Options: the Configure button"
---
# Options: the Configure button

Everything is set in the Smart Irrigation panel, in the sidebar. The integration's **Configure** button (**Settings › Devices & services › Smart Irrigation**) only says so.

- **The location the weather is read for** is Home Assistant's, unless you give other coordinates on the **Location coordinates** card, under **Weather › Weather service**. The card shows in [advanced mode](configuration.md#standard-and-advanced), or whenever manual coordinates are on. See [manual coordinates](MANUAL_COORDINATES.md).
- **The weather service and its API key**: see [Configuring the weather service](installation-weatherservice.md).

??? note "Coming from 2026.11.0 or earlier"

    Up to 2026.11.0, **Configure** asked for manual coordinates, but what it saved was never used: the weather was always read for the coordinates of the panel's card. If you set coordinates there, set them again on the card.
