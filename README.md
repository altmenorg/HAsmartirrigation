[![hacs_badge](https://img.shields.io/badge/HACS-Default-blue.svg?style=flat-square)](https://github.com/hacs/integration)
[![release][release-badge]][release-url]
[![translation status](https://hosted.weblate.org/widget/smart-irrigation/svg-badge.svg)](https://hosted.weblate.org/engage/smart-irrigation/)

[release-url]: https://github.com/altmenorg/HAsmartirrigation/releases
[release-badge]: https://img.shields.io/github/v/release/altmenorg/HAsmartirrigation?style=flat-square

# Smart Irrigation

<p align="center">
  <img src="https://raw.githubusercontent.com/altmenorg/HAsmartirrigation/master/images/smart_irrigation_horizontal.svg?sanitize=true" alt="Smart Irrigation" width="720">
</p>

**Smart Irrigation waters your garden from Home Assistant, putting back the water that sun, heat and wind took from the soil.**

It works out, zone by zone, how much water the plants lost to [evapotranspiration](https://en.wikipedia.org/wiki/Evapotranspiration) and got back from the rain, and it waters the difference: not a fixed fifteen minutes, not the day after a storm, and more in a heatwave. Then it runs the watering itself, as much of it as you want it to.

## Three ways to use it

1. **It calculates, you water.** Each zone gets a duration, a water balance and the reasons behind them, as entities and events. Your own automation, a blueprint for your controller (Rain Bird, Hydrawise, Rachio, OpenSprinkler, B-hyve, ESPHome), or [Irrigation Unlimited](https://github.com/rgc99/irrigation_unlimited) does the watering.
2. **It opens the valves.** With **Calculate and water**, Smart Irrigation waters each zone for its duration: zones in turn or together, cycle and soak so clay takes the water in, a pause between zones, a watchdog for a valve left open, and the water actually delivered credited to the zone.
3. **It runs your whole irrigation.** The **full controller** (optional, off by default) adds programs, schedules, pumps and a planning: everything a dedicated irrigation controller does, fed by the calculated durations.

## ✨ Highlights

**The controller**

- 🗓️ **Programs** of ordered steps, one zone or several at once, watered for the calculated duration or a share of it, with passes, waits, limits and a minimum deficit per step.
- ⏰ **Schedules** anchored to a start or to an end ("done by sunrise"): days of the week, every N days, odd or even days, months, a period of the year. Each one shows what can hold it back.
- 🔗 **Chained programs**: a program can start after another one ("the beds 30 minutes after the lawn"), whatever its length that day, only when the first one really watered.
- 🚿 **Pumps and main valves** with their delays, the other valves of a zone, and a confirmation that a valve really opened.
- 📅 **A planning** of what will run, when and why, and the running watering shown on the Home page, the zones and the card. Pause, resume, queue, suspend, run now.
- 🔁 **Imports an Irrigation Unlimited configuration** in a few clicks.

**The calculation**

- ☀️ **FAO-56, hour by hour.** Evapotranspiration from the Penman-Monteith equation, with or without a radiation sensor, checked against the paper's own worked example, and a water balance replayed in five-minute steps.
- 🌦️ **Your sensors, a weather service, or both**: Open-Meteo, OpenWeatherMap, Pirate Weather, or any weather integration of Home Assistant, switched on the fly.
- 🛑 **Skip conditions**: a rain sensor, frost, wind, soil moisture and the rain forecast can each hold a run back, and the Home page says which one and on what numbers.
- 🌱 **Greenhouse mode**: under glass, a lux sensor inside tells the sun that reaches the plants.

**Everyday use**

- 🎛️ **A panel built with Home Assistant's own components**, in a standard and an advanced mode, with a setup assistant that creates your first zone. The soil and the crop are chosen by name.
- 🃏 **A dashboard card**, served by the integration: where each zone stands, how long it would run, when, and a button to water on the spot.
- 🔌 **Entities for everything**: a `valve` per zone for dashboards and voice assistants, a master switch, **Calculate and water**, to stop it all for the winter, sensors, buttons and events for your automations.
- 🌍 **20 languages** for the panel and everything Home Assistant shows: corrections are welcome on [Weblate](https://hosted.weblate.org/engage/smart-irrigation/), in the browser.
- 💾 **Backup and restore** of the whole configuration in one file.

<p align="center">
  <img src="https://raw.githubusercontent.com/altmenorg/HAsmartirrigation/master/images/panel-home.png" alt="The Home page: the next watering, why, and what could hold it back" width="860">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/altmenorg/HAsmartirrigation/master/images/panel-zones.png" alt="The Zones page: each zone, where it stands and how long it would water" width="420">
  <img src="https://raw.githubusercontent.com/altmenorg/HAsmartirrigation/master/images/panel-programs.png" alt="A program of the full controller: its steps and its schedules" width="420">
</p>

## Installation

**Via HACS (recommended).** Smart Irrigation is in the HACS default store, so there is no repository to add:

[![Open Smart Irrigation in HACS on your Home Assistant](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/_change/?redirect=marketplace_repository%2F%3Fowner%3Daltmenorg%26repository%3DHAsmartirrigation%26category%3Dintegration)

1. Open it in HACS with the button above (it asks for your Home Assistant address), or search for **Smart Irrigation** in [HACS](https://hacs.xyz), and click **Download**.
2. **Restart Home Assistant**, then add it from *Settings → Devices & Services → Add Integration → Smart Irrigation*.

**Manually.** Download the [latest release](https://github.com/altmenorg/HAsmartirrigation/releases) and extract it into `custom_components/smart_irrigation/`, then restart Home Assistant.

Full documentation: **[altmenorg.github.io/HAsmartirrigation](https://altmenorg.github.io/HAsmartirrigation/)**.

## Recent improvements

**v2026.11.0** (November 2026) brings the **full controller**, a panel reworked from end to end, the water balance replayed in five-minute steps, a Home Assistant weather entity as a weather service, one switch to stop everything, and one name for each thing in all 20 languages (a [glossary](docs/glossary.md) lists them). Some actions were merged into one, and the old names keep working until v2027.11. The [release notes](https://github.com/altmenorg/HAsmartirrigation/releases/tag/v2026.11.0) say what changes for everyone and what to check before updating; Smart Irrigation now needs **Home Assistant 2026.3** or later.

## Irrigation start triggers

Smart Irrigation computes irrigation **durations**, and either opens the valves itself (**Calculate and water**) or leaves the watering to your own automation (**Calculate only**). A **start trigger** schedules a start relative to a solar event (sunrise, sunset or solar azimuth, ± an offset) or at a fixed clock time, and fires the Home Assistant event `smart_irrigation_start_irrigation_all_zones` so an automation can react.

You can define several triggers, but only the one selected as active starts the watering, once per day. Besides your own triggers, the choice offers **Default** (finish at sunrise: sunrise minus the planned length of the run) and **None** (Smart Irrigation starts no watering). The event data identifies which trigger fired:

| field | meaning |
|-------|---------|
| `trigger_name` | the name you gave the trigger |
| `trigger_type` | `sunrise`, `sunset`, `solar_azimuth` or `time` |
| `at` | for a `time` trigger, the clock time it is set to |
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

## 🧩 Enhanced features

These features are driven by **services and blueprints**:

- 🔁 **Recurring schedules** (on their way out: they keep working until 2027.11; the programs' schedules under **Watering** replace them) — daily / weekly / monthly / interval-based schedules via the `smart_irrigation.create_recurring_schedule` service.
- 🍂 **Seasonal adjustments** — adjust the crop factor and the threshold by month, in the panel (advanced mode) or with services.
- 🔗 **Irrigation Unlimited**: Smart Irrigation hands its calculated durations to the [Irrigation Unlimited](https://github.com/rgc99/irrigation_unlimited) component through blueprints and automations (`adjust_time`), or [imports its configuration](docs/usage-from-irrigation-unlimited.md) into the full controller.
- 📐 **Automation blueprints** — ready-to-use blueprints, installed with the integration, for plain valves, ESPHome, Irrigation Unlimited and off-the-shelf controllers (Rain Bird, Hydrawise, Rachio, OpenSprinkler, B-hyve): see the [automations](docs/usage-automations.md) and [controllers](docs/usage-controllers.md) pages.

See the [enhanced scheduling documentation](docs/usage-enhanced-scheduling-integration.md) for details and examples.

## Documentation

The full documentation is published at **[altmenorg.github.io/HAsmartirrigation](https://altmenorg.github.io/HAsmartirrigation/)** (source in [`docs/`](docs/)) — installation, configuration (zones, sensor groups, modules), usage, events, services and troubleshooting.

## Contributing

You do not need to write code to help, and the most useful contributions right now are not code.

- **Translate.** The interface comes in 20 languages, and apart from English and French they were machine-translated: nobody who speaks them has read them yet. If yours reads oddly, correct it on **[Hosted Weblate](https://hosted.weblate.org/engage/smart-irrigation/)**, in the browser, with no Git and no build tools. One word in one string is welcome. A language that is missing can be requested there too.

  [![Translation status](https://hosted.weblate.org/widget/smart-irrigation/multi-auto.svg)](https://hosted.weblate.org/engage/smart-irrigation/)

- **Report what looks wrong.** A zone that waters too much, too little or not at all: [open an issue](https://github.com/altmenorg/HAsmartirrigation/issues) and attach the **diagnostics file** (Settings, Devices & services, Smart Irrigation, Download diagnostics). Most of the fixes in the last releases were found from one.
- **Ask and share.** Questions, setups and ideas go to the [Discussions](https://github.com/altmenorg/HAsmartirrigation/discussions).
- **Change the code.** Pull requests go against the `dev` branch. [CONTRIBUTING.md](CONTRIBUTING.md) explains the setup, the tests and what makes a change easy to merge.

## Development

```bash
git clone https://github.com/altmenorg/HAsmartirrigation.git
cd HAsmartirrigation
make setup          # create the venv and install dev dependencies
```

### Available commands

```bash
make help           # list all commands
make test           # run all tests
make format         # format code (black)
make lint           # run linting (ruff)
make check          # run all CI quality checks
```

The frontend panel is a separate TypeScript/Lit project under
[`custom_components/smart_irrigation/frontend/`](custom_components/smart_irrigation/frontend/)
(`npm install` then `npm run build`).

### Testing

Install the test requirements, then run the suite:

```bash
pip install -r requirements.test.txt

pytest                          # everything
pytest tests/test_services.py   # a single file
pytest -n auto                  # on every core
```

All the tests live in `tests/`. `scripts/check.sh` runs every check the CI runs (the Python tests, ruff, black, the panel's lint and tests, and the bundle), so you can run them all before pushing.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full development and testing guide.

## Acknowledgements

Smart Irrigation exists thanks to [Jeroen ter Heerdt](https://github.com/jeroenterheerdt), who created it, designed its evapotranspiration model and maintained it for years. He passed the torch in June 2026, and the project carries on in the same spirit. Thank you, Jeroen, for building something so many gardens rely on, and for entrusting it to good hands. 🌱

Thanks also to [JustChr](https://github.com/JustChr), whose [Smart Irrigation fork](https://github.com/JustChr/HAsmartirrigation) explored the closed-loop direction. The crediting of the water balance from observed watering, and parts of the direct valve control, are adapted from that work (MIT), and calculating the evapotranspiration hour by hour is an idea that fork tried first, though the equations here are written from FAO-56 and checked against the paper's own worked example.

## License

[MIT](LICENSE) — © 2020 Jeroen ter Heerdt (original Smart Irrigation), © 2026 Anthony Mercatante.
