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

### What the meter tells us about your throughput

Every irrigation duration is derived from the zone's configured throughput: the bucket says how many mm are missing, the size turns that into litres, and the throughput turns litres into minutes. A throughput copied off a datasheet rather than measured at the tap is one of the quietest ways to water twice as long as intended, or half as long, for a whole season.

A zone with a volume meter gives the answer for free, since a run knows both how many litres came out and how long the valve was open. Smart Irrigation divides one by the other, smooths the result over several runs, and raises a repair notice in **Settings > Repairs** when it drifts more than 25% from what you configured. Runs shorter than two minutes are ignored: filling the pipe dominates them.

It only ever tells you. The zone's throughput is never rewritten, because pressure varies, a meter can sit upstream of more than one zone, and silently changing how long valves stay open is not something to do behind your back. If the measurement looks right, copy it into the zone yourself.

## Direct valve control (let Smart Irrigation run the valves)

With **Let Smart Irrigation control the valve** on, Smart Irrigation opens each zone's linked valve, waits the calculated duration, then closes it. No execution automation needed. The start event still fires, so external executors keep working too.

It stands on its own: the zone's **Linked valve/switch** can be set with direct valve control alone, without observed watering. The two answer different questions, and the difference matters when the same valve is used for other things -- filling a paddling pool, hosing the terrace. Direct valve control credits the bucket for the runs *it* performs, since it knows exactly what it delivered. Observed watering credits *any* run of that valve, which is what you want for a tap somebody opens by hand to water the same lawn, and not what you want if that valve also does something else. Leave observed watering off in that case.

- **Zone sequencing**: **Sequential** runs one zone at a time (safe for water pressure); **Parallel** opens all eligible zones at once. This setting also decides how long the whole run is taken to be, which is what a start trigger works back from when it has to finish at sunrise: sequential is the sum of every zone's run time, parallel is the longest of them. It therefore applies whether Smart Irrigation opens the valves itself or an automation of your own does, and it is available in the general settings either way.
- **Open confirmation**: before crediting, Smart Irrigation waits for the valve to report an on-state. If it never opens, the run is not credited (so the deficit stays and rolls over to the next day) and a `smart_irrigation_zone_problem` event is fired. A write-only valve with no readable state is given the benefit of the doubt.
- **Reboot resilience**: a run that is in progress when Home Assistant restarts is resumed (or closed if it already exceeded its duration) and then credited.
- **One run per zone per cycle**: a zone whose valve is already open is left out, and a zone watered while it waited its turn in a sequential run is not watered again when the queue reaches it. With observed watering on, that includes a valve opened outside Smart Irrigation, by hand or by another automation: running it too would close the valve under that run and count the overlap twice.
- **One cycle at a time, in sequential mode**: a run asked for while one is already going joins the queue instead of starting beside it, so two valves are never open at once. A zone already waiting is not queued twice, the zone being watered right now is not queued behind itself, and the zones that joined are in the same end-of-run summary. In parallel mode there is nothing to join: every zone at once is what that setting asks for.

> **Safety:** if Home Assistant goes down for a long time during a run, the physical valve stays open and keeps watering, because Home Assistant is no longer there to close it. Give your valve a hardware failsafe (a maximum runtime on the device itself). Smart Irrigation also caps the credited time at the zone's maximum duration. For an MQTT valve, the integration can arm that failsafe for you on every run -- see below.

### Hardware auto-off (MQTT on_time dead-man)

The closing of the valve normally happens in Home Assistant: the run opens the valve, waits, and closes it. If Home Assistant stops in that window and never comes back, nothing sends the close and the valve keeps watering. (A restart *does* recover: an in-flight run is resumed and closed when Home Assistant comes back. The gap is Home Assistant staying down.)

For a valve controlled over **MQTT** -- a [zigbee2mqtt](https://www.zigbee2mqtt.io/) device, for instance -- Smart Irrigation can close that gap with a hardware dead-man. On each pass it publishes an *on with timed off* command to the device, so the device's own firmware shuts the valve off after the run even if Home Assistant is no longer there. It is armed only after the valve is confirmed open, and it is additive: the normal close still runs, the `on_time` is set a little longer than the pass so it lands just after, as a failsafe rather than the primary off.

Two optional per-zone fields configure it (advanced panel, shown only with direct valve control on and a linked valve set). Both empty by default, so nothing changes until you fill them in:

- **Safety off MQTT topic** -- the device's `set` topic, e.g. `zigbee2mqtt/front_lawn_valve/set`.
- **Safety off state key** -- the on/off property in the payload: `state` for a single-channel device, or `state_l1`...`state_l4` for one channel of a multi-channel device.

With those set, a pass that holds the valve for 300 seconds publishes `{"state_l1": "ON", "on_time": 330}` to the topic (the run time plus a 30-second margin). The device closes its own valve after `on_time` seconds whatever happens to Home Assistant.

> **Device support varies.** `on_time` ("on with timed off") is honoured by the device firmware, not by Smart Irrigation, and [not every device implements it](https://www.zigbee2mqtt.io/devices/TYWB_4ch-RF.html). Test it before you rely on it: start a run, stop Home Assistant while the valve is open, and confirm the valve closes itself after `on_time`. Some devices need an `off_wait_time` alongside `on_time` to behave.

**Valves on ZHA** can be armed too. The linked valve must be a ZHA entity (found through the entity registry): each pass then sends the device an *on with timed off* command (On/Off cluster, command `0x42`) through `zha.issue_zigbee_cluster_command`, right after the normal open (a Sonoff SWV is the exception, see below). The unit of the time differs between devices, so the safety off mode matters:

- `auto` (default): armed automatically only for a model known to be verified. That is the **Sonoff SWV** (manufacturer SONOFF, model SWV), tested on a real valve (firmware 1.0.04, ZHA): it honours the command, but counts the time in **seconds**, not in tenths of a second as the ZCL spec says. Smart Irrigation sends it the pass length plus the margin, in seconds (at most 65535 s, about 18 hours). If Home Assistant dies mid-run, the valve closes itself about 30 seconds after the time Home Assistant would have closed it. If a topic is set, the topic wins and ZHA is not used.
- `zha`: explicit opt-in, arms any ZHA valve. A model that is not known is sent the time in the ZCL unit (tenths of a second); a pass longer than 6553 s is then not armed (a warning is logged once), as the device would close the valve too early. Other models are unverified: test them before you rely on them.
- `off`: never armed.

**A Sonoff SWV is opened by that same command.** On a real valve, *on with timed off* sent to a closed SWV both opens it and starts its own timer, so there is no moment when it is open without a timer. For a SWV in `auto` mode (no MQTT topic, mode not `off`), Smart Irrigation therefore opens the linked valve with that single command instead of the normal open: the time is the pass length rounded up plus the 30-second margin, in seconds (at most 65535). The rest is unchanged: the open is confirmed the same way (an open that has to be repeated sends the same command), the close at the normal time also clears the device's timer, a cycle-and-soak pass opens again and so restarts the timer, and a run resumed after a restart opens the same way with the time that remains. The extra valves keep the normal open. Each attempt is short (6 seconds, because a battery valve is asleep most of the time and would otherwise hold the start for about 16 seconds), and the command is tried once. If it fails (ZHA not set up, an error, a valve that does not answer), a warning is logged once for the zone and the valve is opened the normal way, followed by the separate arm described above: the watering is never prevented. Any other valve (another ZHA model, the explicit `zha` mode on an unknown model, MQTT, other platforms) is opened and armed exactly as before.

This timed off is separate from, and different from, the valve's own *water shortage auto close*, which does not cover Home Assistant stopping in the middle of a run. A failure to send the command never breaks the run: it is logged as a warning the first time for a zone, then at debug level.

The per-zone **safety off mode** picks the behaviour: `auto` (the default) uses the MQTT topic if there is one, else nothing; `zha` also arms a ZHA valve when there is no topic; `off` never arms a dead-man for that zone, topic included. Only the zone's linked valve is armed, not its extra valves.

**Other valves** (Wi-Fi switches, ESPHome, Tuya, or anything that is neither MQTT with a topic nor ZHA) get no automatic dead-man: leave the fields empty and the run behaves exactly as before. For those, set the failsafe on the device itself, which is more reliable than Home Assistant sending it every run: a Shelly has an *Auto-off timer*, Tasmota has `PulseTime`, ESPHome can turn a switch off after a delay, and many Tuya Wi-Fi switches have a *countdown* function.

### Cycle and soak, and the pause between zones

Two settings on the advanced panel, both off by default, for an installation that is already tuned.

**Water in several passes** splits a run into shorter passes with a pause between them. Clay and compacted soil have an infiltration rate: past it the water runs off or puddles, and the zone is billed for water the roots never see. Three passes of five minutes with fifteen minutes of soaking deliver the same water as one run of fifteen minutes, and the soil keeps more of it. Guidance: sand takes water as fast as you can give it, so leave this at one pass; loam rarely needs more than two; clay and slopes are what it is for.

The plan is fixed when the run starts, and a run too short to split is left alone (no pass shorter than a minute). Each pass is credited as it closes, so a restart in the middle of a run never credits water twice and never leaves a valve open.

**Pause between zones** waits between two zones of a sequential run, for the line pressure to recover or for a slow valve to finish closing before the next one opens.

Both lengthen the run without adding water to it, and a start trigger that has to finish at sunrise works back from the whole thing, soaking and pauses included: three zones of half an hour in three passes with fifteen minutes of soaking occupy two and a half hours, not an hour and a half. Watch that against the hour you want to be finished by. When an executor of your own opens the valves instead, neither setting applies and the run length is the watering alone.

### Events for your own automations

Direct valve control fires events you can use to notify or react, so you do not need one automation per zone:

- `smart_irrigation_irrigation_started` when a run begins. Data: `sequencing` (`sequential`/`parallel`) and `zones`, a list of `{zone_id, zone, seconds}` about to be watered.
- `smart_irrigation_irrigation_finished` when the whole run is done. Data: `zones`, a list of `{zone_id, zone, seconds, volume_l, bucket}` that ran (volume delivered and the new bucket level), and `problems`, a list of `{zone_id, zone, reason}` for zones whose valve did not open.
- `smart_irrigation_zone_problem` the moment something goes wrong with a valve. Data: `zone_id`, `zone`, `entity_id`, `reason`: `valve_did_not_open`, `valve_did_not_close` (the close failed or the valve still reads open, retried once), or `no_flow` (the valve opened but the zone's flow meter did not move, so the run is not credited), `valve_closed_early` (full controller: the valve read `off` or `closed` while it should have been open, so the zone's run ends and is credited for the time it was open), or `supply_did_not_turn_on` (full controller: the pump or main valve the zone depends on never came on, so the zone's valve stays shut).

Example: a single end-of-watering report for all zones.

{% raw %}
```yaml
alias: Watering report
triggers:
  - trigger: event
    event_type: smart_irrigation_irrigation_finished
actions:
  - variables:
      zones: "{{ trigger.event.data.zones }}"
      problems: "{{ trigger.event.data.problems }}"
  - action: notify.mobile_app_your_phone
    data:
      title: "{{ '🚨' if problems | count > 0 else '🌱' }} Watering finished"
      message: >-
        {% set l = namespace(t=[]) %}
        {% for z in zones %}
          {% set l.t = l.t + [z.zone ~ ": " ~ (z.seconds / 60) | round(1) ~ " min, " ~ z.volume_l ~ " L"] %}
        {% endfor %}
        {% for p in problems %}
          {% set l.t = l.t + ["WARNING " ~ p.zone ~ ": " ~ p.reason] %}
        {% endfor %}
        {{ l.t | join("\n") }}
mode: single
```
{% endraw %}

> If you previously had one automation per zone that opened the valve and called `reset_bucket`, remove them once direct valve control is on: Smart Irrigation now opens the valves and credits the bucket itself, so the old automations would double up. Keep only report/notification automations like the one above.

The legacy `smart_irrigation_start_irrigation_all_zones` event still fires too (it carries the trigger identity), for setups that drive watering from their own automation or an external executor instead of direct valve control.

## When does it run? The active start trigger

Irrigation starts on a single **active trigger**, chosen in **General** under the start triggers. The triggers you define are the pool of options; only the selected one starts watering, so a run happens once per day.

The default, **Default (sunrise minus total watering duration)**, times the run so it finishes right at sunrise. Add custom triggers (sunset, solar azimuth, offsets) below and pick one as the active trigger if you prefer.

> Main page: [Configuration](configuration.md)
