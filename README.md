[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://github.com/hacs/integration)
[![release][release-badge]][release-url]

[release-url]: https://github.com/altmenorg/HAppyIrrigation/releases
[release-badge]: https://img.shields.io/github/v/release/altmenorg/HAppyIrrigation?style=flat-square

# Smart Irrigation

<p align="center">
  <img src="images/happyirrigation.jpg?raw=true" alt="Smart Irrigation" width="720">
</p>

> **Smart Irrigation** is a community-maintained fork of
> [Smart Irrigation](https://github.com/jeroenterheerdt/HAsmartirrigation) by
> [Jeroen ter Heerdt](https://github.com/jeroenterheerdt). All credit for the
> original integration and its evapotranspiration model goes to him. This fork
> keeps it actively maintained and fixes the rough edges of the configuration
> UI and plumbing. It is its own integration (domain `smart_irrigation`); on
> first run a wizard offers to import your existing Smart Irrigation
> configuration.

This integration calculates the time to run your irrigation system to compensate for moisture loss by [evapotranspiration](https://en.wikipedia.org/wiki/Evapotranspiration). Using this integration you water your garden, lawn or crops precisely enough to compensate what has evaporated. It takes into account precipitation (rain, snow) and moisture loss caused by evapotranspiration and adjusts accordingly.
If it rains or snows less than the amount of moisture lost, then irrigation is required. Otherwise, no irrigation is required.
The integration can take into account weather forecasts for the coming days and also keeps track of the total moisture lost or added ('bucket').
Multiple zones are supported, each zone having its own configuration and set up.

## ✨ Highlights

- 🎛️ **A modern, Home-Assistant-native configuration UI.** The whole config experience was rebuilt with native HA components: instant-save on edit (no more lost focus or jump-to-the-top), native inputs, steppers and pickers, and a clean, responsive layout. Zones, sensor groups, modules, weather service and backup/restore — all from one panel.
- 🌍 **19 languages, out of the box.** The panel *and* the config flow are fully translated: English, French, German, Spanish, Italian, Dutch, Norwegian, Slovak, Polish, Portuguese, Brazilian Portuguese, Czech, Russian, Ukrainian, Simplified Chinese, Swedish, Danish, Finnish and Hungarian.
- 🌦️ **Switch weather service on the fly** — move between OpenWeatherMap and Pirate Weather, and update the API key, without removing and re-adding the integration.
- 💾 **One-click Backup / Restore** of your entire configuration as a JSON file.
- ⏰ **Flexible start triggers** around sunrise, sunset or solar azimuth — each firing its own identifiable event for your automations.
- 🛠️ **Actively maintained** — steady fixes, refinements and new features, with a first-run wizard that imports your existing Smart Irrigation setup.

<p align="center">
  <img src="images/panel-zones.png?raw=true" alt="Smart Irrigation — Zones panel (Home Assistant-native UI)" width="860">
  <br><em>The HA-native configuration panel — instant-save editing, native controls, everything in one place.</em>
</p>

<p align="center">
  <img src="images/panel-sensor-groups.png?raw=true" alt="Sensor groups configuration" width="420">
  <img src="images/panel-backup-restore.png?raw=true" alt="Backup / restore" width="420">
</p>

## Installation

**Via HACS (recommended).** Smart Irrigation is distributed as a HACS **custom repository**:

1. In [HACS](https://hacs.xyz), open the **⋮ menu → Custom repositories**.
2. Add `https://github.com/altmenorg/HAppyIrrigation` with category **Integration**, and confirm.
3. Search for **Smart Irrigation** in HACS and click **Download**.
4. **Restart Home Assistant**, then add it from *Settings → Devices & Services → Add Integration → Smart Irrigation*.

**Manually.** Download the [latest release](https://github.com/altmenorg/HAppyIrrigation/releases) and extract it into `custom_components/smart_irrigation/`, then restart Home Assistant.

On first run, if an existing Smart Irrigation configuration is detected, a wizard offers to import it (see below). Full documentation: **[altmenorg.github.io/HAppyIrrigation](https://altmenorg.github.io/HAppyIrrigation/)**.

## Migrating from Smart Irrigation

Smart Irrigation is a **separate** integration (domain `smart_irrigation`), so it installs and runs **alongside** your existing Smart Irrigation — nothing is overwritten.

**1. Automatic import.** Install Smart Irrigation, then add it from *Settings → Devices & Services → Add Integration*. On first run, if a Smart Irrigation configuration is detected, a wizard offers to import it. Accepting copies over your zones, sensor groups, modules/mappings and the weather service settings (including the API key), and the new `sensor.smart_irrigation_*` entities are created immediately.

**2. Update your automations (manual).** Because the domain changed, anything that referenced the old integration by name must be updated by hand:

| Old (`smart_irrigation`) | New (`smart_irrigation`) |
|--------------------------|--------------------------|
| `sensor.smart_irrigation_<zone>` | `sensor.smart_irrigation_<zone>` |
| event `smart_irrigation_start_irrigation_all_zones` | event `smart_irrigation_start_irrigation_all_zones` |
| services `smart_irrigation.*` | services `smart_irrigation.*` |

Go through your automations, scripts and dashboard cards and update these references.

**3. Remove Smart Irrigation.** Once you've verified Smart Irrigation works and your automations point at the new entities, events and services, delete the old Smart Irrigation integration.

## What this fork fixes and adds

- A modernized, **HA-native configuration UI** throughout — instant-save editing (no lost focus, no jump-to-the-top), native inputs and controls, and a consolidated panel for every setting.
- A **fully translated UI in 19 languages** (panel *and* config flow).
- **Switch weather service on the fly** — change between OpenWeatherMap and Pirate Weather (and update the API key) from the integration's *Configure* dialog, without removing and re-adding everything.
- New **Backup / Restore** tab: export the whole configuration to a JSON file and restore it.
- Irrigation start triggers now fire independently and carry their identity in the event data (see below); the trigger form and live add/delete were repaired.
- Dialogs repaired for Home Assistant 2026.3+ — the Web Awesome `ha-dialog` migration had hidden every dialog's action buttons.
- Manual coordinates now save and are actually used for weather data (the config API used to reject them).
- The **weather-service API key is preserved across restarts** — imported setups used to lose it.
- A sensor-sourced field no longer silently falls back to weather-service data when its sensor is unavailable.

## Irrigation start triggers

Smart Irrigation computes irrigation **durations** — your own automation does the actual watering. A **start trigger** schedules a start relative to a solar event (sunrise, sunset, or solar azimuth, ± an offset) and fires the Home Assistant event `smart_irrigation_start_irrigation_all_zones` so an automation can react.

Each trigger fires independently, and the event data identifies which one fired:

| field | meaning |
|-------|---------|
| `trigger_name` | the name you gave the trigger |
| `trigger_type` | `sunrise`, `sunset` or `solar_azimuth` |
| `offset_minutes` | the configured offset |
| `account_for_duration` | whether timing is shifted so watering finishes at the target moment |

Example automation:

```yaml
trigger:
  - platform: event
    event_type: smart_irrigation_start_irrigation_all_zones
    event_data:
      trigger_name: "Morning"
action:
  - # open your valves for the durations Smart Irrigation calculated
```

The precipitation-skip and "days between irrigation" settings still apply: on a skip day no event is fired.

## Enhanced features

These advanced features are driven by **services and blueprints** — there is no dedicated panel UI for them yet:

- **Recurring schedules** — daily / weekly / monthly / interval-based schedules via the `smart_irrigation.create_recurring_schedule` service.
- **Seasonal adjustments** — automatically adjust irrigation parameters based on the season.
- **Irrigation Unlimited integration** — bidirectional integration with the [Irrigation Unlimited](https://github.com/rgc99/irrigation_unlimited) component.
- **Automation blueprints** — ready-to-use blueprints in [`blueprints/`](blueprints/).

See the [enhanced scheduling documentation](docs/usage-enhanced-scheduling-integration.md) for details and examples.

## Documentation

The full documentation is published at **[altmenorg.github.io/HAppyIrrigation](https://altmenorg.github.io/HAppyIrrigation/)** (source in [`docs/`](docs/)) — installation, configuration (zones, sensor groups, modules), usage, events, services and troubleshooting.

## Development

```bash
git clone https://github.com/altmenorg/HAppyIrrigation.git
cd HAppyIrrigation
make setup          # create the venv and install dev dependencies
make help           # list all commands (test / lint / format / check)
```

The frontend panel is a separate TypeScript/Lit project under
[`custom_components/smart_irrigation/frontend/`](custom_components/smart_irrigation/frontend/)
(`npm install` then `npm run build`).

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development and testing instructions.

## License

[MIT](LICENSE) — © 2020 Jeroen ter Heerdt (original Smart Irrigation), © 2026 Anthony Mercatante (Smart Irrigation fork).
