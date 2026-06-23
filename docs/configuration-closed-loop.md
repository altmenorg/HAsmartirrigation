---
layout: default
title: Closed-loop watering
---
# Closed-loop watering

> Main page: [Configuration](configuration.md)

By default Smart Irrigation runs **open loop**: it calculates a duration and fires an event, but it does not know whether (or how much) watering actually happened, so you reset the bucket from an automation. The closed-loop features remove that guesswork. They are all opt-in and configured in the panel under **General**.

## Observed watering (credit the bucket automatically)

When enabled, Smart Irrigation watches each zone's linked valve/switch. Whenever it runs (a manual tap, an automation, or Smart Irrigation itself), the zone's bucket is credited from the run time and the zone's throughput (`depth_mm = throughput_L_per_min x minutes / size_m2`). No more manual reset.

To set it up:

1. In **General**, turn on **Enable observed watering**.
2. In **Zones**, set each zone's **Linked valve/switch** to the entity that waters that zone (a `switch`, `valve` or `input_boolean`).

> Important: when observed watering is on it becomes the only thing crediting the bucket. Remove any `reset_bucket` service call from your irrigation automation, otherwise the bucket is accounted twice.

### Optional: a cumulative volume meter (more precise)

For exact accounting you can also set a zone's **Cumulative volume meter**. The applied depth is then taken from the measured volume delivered during the run (`meter_at_close - meter_at_open`) instead of throughput x time.

It must be a **cumulative** water-meter total (state class `total_increasing`), not an instant flow rate. The unit is read automatically from the sensor (L, mL, m³, gal, ft³). An instant flow-rate sensor (for example L/min) will not work; if your hardware only exposes a rate, feed it through a Riemann-sum **Integration** helper first to get a cumulative total.

## Direct valve control (let Smart Irrigation run the valves)

With **Let Smart Irrigation control the valve** on, Smart Irrigation opens each zone's linked valve, waits the calculated duration, then closes it. No execution automation needed. The start event still fires, so external executors keep working too.

- **Zone sequencing**: **Sequential** runs one zone at a time (safe for water pressure); **Parallel** opens all eligible zones at once.
- **Open confirmation**: before crediting, Smart Irrigation waits for the valve to report an on-state. If it never opens, the run is not credited (so the deficit stays and rolls over to the next day) and a `smart_irrigation_zone_problem` event is fired. A write-only valve with no readable state is given the benefit of the doubt.
- **Reboot resilience**: a run that is in progress when Home Assistant restarts is resumed (or closed if it already exceeded its duration) and then credited.

> **Safety:** if Home Assistant goes down for a long time during a run, the physical valve stays open and keeps watering, because Home Assistant is no longer there to close it. Give your valve a hardware failsafe (a maximum runtime on the device itself). Smart Irrigation also caps the credited time at the zone's maximum duration.

### Getting notified of a valve problem

Listen to the `smart_irrigation_zone_problem` event in an automation to be alerted when a valve fails to open. The event data includes `zone_id`, `zone`, `entity_id` and `reason`.

## When does it run? The active start trigger

Irrigation starts on a single **active trigger**, chosen in **General** under the start triggers. The triggers you define are the pool of options; only the selected one starts watering, so a run happens once per day.

The default, **Default (sunrise minus total watering duration)**, times the run so it finishes right at sunrise. Add custom triggers (sunset, solar azimuth, offsets) below and pick one as the active trigger if you prefer.

> Main page: [Configuration](configuration.md)
