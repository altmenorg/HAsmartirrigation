[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg?style=flat-square)](https://github.com/hacs/integration)
[![release][release-badge]][release-url]

[release-url]: https://github.com/altmenorg/HappyIrrigation/releases
[release-badge]: https://img.shields.io/github/v/release/altmenorg/HappyIrrigation?style=flat-square

# Happy Irrigation

![](logo.png?raw=true)

> **Happy Irrigation** is a community-maintained fork of
> [Smart Irrigation](https://github.com/jeroenterheerdt/HAsmartirrigation) by
> [Jeroen ter Heerdt](https://github.com/jeroenterheerdt). All credit for the
> original integration and its evapotranspiration model goes to him. This fork
> keeps it actively maintained and fixes the rough edges of the configuration
> UI and plumbing. It uses the same `smart_irrigation` domain, so it is a
> drop-in replacement and your existing configuration is kept.

This integration calculates the time to run your irrigation system to compensate for moisture loss by [evapotranspiration](https://en.wikipedia.org/wiki/Evapotranspiration). Using this integration you water your garden, lawn or crops precisely enough to compensate what has evaporated. It takes into account precipitation (rain, snow) and moisture loss caused by evapotranspiration and adjusts accordingly.
If it rains or snows less than the amount of moisture lost, then irrigation is required. Otherwise, no irrigation is required.
The integration can take into account weather forecasts for the coming days and also keeps track of the total moisture lost or added ('bucket').
Multiple zones are supported, each zone having its own configuration and set up.

## What this fork fixes

- Dialogs repaired for Home Assistant 2026.3+ — the Web Awesome `ha-dialog` migration had hidden every dialog's action buttons.
- Manual coordinates now save and are actually used for weather data (the config API used to reject them).
- A sensor-sourced field no longer silently falls back to weather-service data when its sensor is unavailable.
- Irrigation start triggers now fire independently and carry their identity in the event data (see below); the trigger form and live add/delete were repaired.
- New **Backup / Restore** tab: export the whole configuration to a JSON file and restore it.
- A modernized, HA-native configuration UI throughout.

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

The full documentation lives in [`docs/`](docs/) — installation, configuration (zones, sensor groups, modules), usage, events, services and troubleshooting. It is the same content as the original project's docs site.

## Development

```bash
git clone https://github.com/altmenorg/HappyIrrigation.git
cd HappyIrrigation
make setup          # create the venv and install dev dependencies
make help           # list all commands (test / lint / format / check)
```

The frontend panel is a separate TypeScript/Lit project under
[`custom_components/smart_irrigation/frontend/`](custom_components/smart_irrigation/frontend/)
(`npm install` then `npm run build`).

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development and testing instructions.

## License

[MIT](LICENSE) — © 2020 Jeroen ter Heerdt (original Smart Irrigation), maintained as Happy Irrigation by the community.
