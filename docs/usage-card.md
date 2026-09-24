---
layout: default
title: Usage: Dashboard card
---
# The dashboard card

> Main page: [Usage](usage.md)<br/>
> Previous: [Info and History](usage-info.md)<br/>
> Next: [Entities](usage-entities.md)

The panel in the sidebar is where an installation is set up, which is occasional work. The card is for the rest of the time: it sits on your dashboard, next to the lights, and says what each zone is short of, how long it would run, and when the water goes on.

## Adding it

Nothing to install. The integration serves the card and registers it with Lovelace itself, so it is already in the card picker:

1. Open the dashboard you want it on and press the pencil to edit it.
2. **Add card**, then look for **Smart Irrigation** in the list (searching for "irrigation" finds it).
3. Set it up in the editor that opens, and save.

If your dashboards are written in YAML, resources are yours to manage and the integration does not touch them. Add this once, under `lovelace:` `resources:`, and the log line at startup gives you the exact URL:

```yaml
resources:
  - url: /api/smart_irrigation/card.js
    type: module
```

Then put `type: custom:smart-irrigation-card` in a view.

## What it shows

- **The next start**, and when a run would be held back, the reason it would be: rain in the forecast, freezing, wind, or a rain sensor that says it is raining.
- **Per zone**: the water it is short of, the run that would deliver it, and when it last watered. A zone in manual or disabled state says so next to its name.
- **A zone that would water now** is in the accent colour, so a glance is enough.

The deficit is the **live estimate**, not last night's result. The integration re-runs the same calculation over the readings collected since the zone's last one, without committing anything, and the card shows that with a small icon at the end of the line; hovering it says what the estimate is measured from. A zone calculated minutes ago has nothing new to add, and then the card shows its committed value.

The estimate is computed on the server for every zone, so the card asks for it every two minutes, and not at all while you are looking at another tab or another window. Coming back to it refreshes it at once.

## The buttons

| Button | What it does |
| --- | --- |
| Water now (drop) | Runs that zone's valve for the calculated duration, and credits the bucket when it finishes. It takes **two taps**: the first arms it, the second runs it, and it disarms itself after five seconds. It only appears for a zone that has a [linked valve](configuration-zones.md). |
| Calculate (calculator) | Runs the calculation for that zone now and commits it, as the panel's own button does. |

## Options

All of them are in the visual editor, and this is what they are called in YAML:

| Option | Default | What it does |
| --- | --- | --- |
| `title` | Smart Irrigation | The card's header. |
| `zones` | every zone | The zone ids to show. Use it for a card per area, or to keep the greenhouse on its own dashboard. |
| `show_next_start` | `true` | The next start line above the zones. |
| `compact` | `false` | Only the zones that would water now. The card then says "Nothing to water right now" when none would. |

```yaml
type: custom:smart-irrigation-card
title: Garden
zones: [0, 2]
compact: true
```

> The card speaks English and French. It is built as its own file, separate from the panel, so a dashboard does not load the panel's nineteen language files to show a few lines: that is why its own words are not translated with the rest yet.

> Main page: [Usage](usage.md)<br/>
> Previous: [Info and History](usage-info.md)<br/>
> Next: [Entities](usage-entities.md)
