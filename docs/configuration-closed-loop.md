---
title: "Closed-loop watering"
---
# Closed-loop watering

With **Calculate only** and nothing else, Smart Irrigation runs **open loop**: it calculates a duration and fires an event, but it does not know whether (or how much) watering actually happened, so your automation credits the water balance. The closed-loop features remove that guesswork: Smart Irrigation credits the water balance itself, from the runs it sees or the runs it makes. **Calculate and water** turns them on; with Calculate only, observed watering is a switch of **Settings › General** on the advanced panel.

<a id="observed-watering-credit-the-bucket-automatically"></a>
## Observed watering (credit the water balance automatically)

When enabled, Smart Irrigation watches each zone's linked valve/switch. Whenever it runs (a manual tap, an automation, or Smart Irrigation itself), the zone's water balance is credited from the run time and the zone's throughput (`depth_mm = throughput_L_per_min x minutes / size_m2`). No more manual reset.

To set it up:

1. Choosing **Calculate and water** turns it on. Otherwise, on the advanced panel, switch on the **Observed watering (closed loop)** card of **Settings › General**.
2. In **Zones**, set each zone's **Linked valve/switch** to the entity that waters that zone (a `switch`, `valve` or `input_boolean`).

The Smart Irrigation device has an **Observed watering** binary sensor (`binary_sensor.smart_irrigation_observed_watering`), on while the option is: one automation shared between several installs can read it to know whether it must reset the water balance itself.

!!! warning "Credit once"

    When observed watering is on, it becomes the only thing crediting the water balance. Remove any `credit_watering`, `set_bucket` or `reset_bucket` call from your irrigation automation, or the water is counted twice.

### Optional: leave short runs out

A short run that only cools the plants on a hot afternoon (a few minutes to keep the leaves from wilting) mostly stays on the leaves and evaporates. Set the zone's **Ignore runs up to** (seconds, advanced mode) and a run of the valve that lasts that long or less is not credited, nor counted as the zone's watering of the cycle. A longer run counts in full, its first seconds included. Empty credits every run. It applies to runs Smart Irrigation observes; the runs it drives itself are credited as they always were.

### Optional: a cumulative volume meter (more precise)

For exact accounting you can also set a zone's **Cumulative volume meter**. The applied depth is then taken from the measured volume delivered during the run (`meter_at_close - meter_at_open`) instead of throughput x time.

It must be a **cumulative** water-meter total (state class `total_increasing`), not an instant flow rate. The unit is read automatically from the sensor (L, mL, m³, gal, ft³). An instant flow-rate sensor (for example L/min) will not work; if your hardware only exposes a rate, feed it through a Riemann-sum **Integration** helper first to get a cumulative total.

### Water flowing with every valve closed (advanced mode)

With **Leak alert after** set (in litres, 0 by default: not watched), a zone's meter is watched between the runs too. When it counts that much while none of the zones it measures has a valve open, nor had one open in the last three minutes (the pipe drains, a meter reports late), Smart Irrigation tells you: the hub's **Leak** binary sensor goes on, the event `smart_irrigation_leak` is fired (`flow_sensor`, `litres`, `zone_ids`, `zones`), a repair is raised and the programs' [notifications](usage-full-controller.md#being-told-when-a-program-has-watered) are sent at once. It clears by itself once the meter has stood still for half an hour. An automation on the event or the sensor can close a main valve.

Only for a meter that measures the garden alone: a meter on the house counts the taps and the washing machine too.

### What the meter tells us about your throughput

Every irrigation duration is derived from the zone's configured throughput: the water balance says how many mm are missing, the size turns that into litres, and the throughput turns litres into minutes. A throughput copied off a datasheet rather than measured at the tap is one of the quietest ways to water twice as long as intended, or half as long, for a whole season.

A zone with a volume meter gives the answer for free, since a run knows both how many litres came out and how long the valve was open. Smart Irrigation divides one by the other, smooths the result over several runs, and raises a repair notice in **Settings › Repairs** when it drifts more than 25% from what you configured. Runs shorter than two minutes are ignored: filling the pipe dominates them.

It only ever tells you. The zone's throughput is never rewritten, because pressure varies, a meter can sit upstream of more than one zone, and silently changing how long valves stay open is not something to do behind your back. If the measurement looks right, copy it into the zone yourself.

## When Smart Irrigation runs the valves

With **Calculate and water** (see [Watering with programs](usage-full-controller.md)), Smart Irrigation opens each zone's linked valve, waits the calculated duration, then closes it. No automation of your own is needed. The water balance is credited for the runs *it* performs, since it knows exactly what it delivered. Observed watering, on with it, also credits *any* other run of that valve, which is what you want for a tap somebody opens by hand to water the same lawn. If that valve also does something else (filling a paddling pool, hosing the terrace), turn observed watering off in advanced mode.

- **The order of the zones**: each program's steps decide it, a step with several zones watering them together. The **Irrigate all zones** button has its own order, one after the other or all at once (see [Irrigate all zones now](usage-full-controller.md#irrigate-all-zones-now)).
- **Open confirmation**: before crediting, Smart Irrigation waits for the valve to report an on-state. If it never opens, the run is not credited (so the deficit stays and rolls over to the next day) and a `smart_irrigation_zone_problem` event is fired. A write-only valve with no readable state is given the benefit of the doubt.
- **Confirmation per zone** (advanced mode): **Wait for the valve to confirm** (seconds), and how many times to send the open again (**Send the open again**, `open_resends`, also advanced mode, or for instance `open_resends: 0` in the zone's [Edit in YAML](configuration-zones.md#a-zone-in-yaml)). Empty keeps the defaults: 30 seconds and two resends (at 10 and 20 seconds), and 5 seconds for the valve to report a close. Set, the wait applies to the open and to the close, and the resends are spread evenly over it, so 60 seconds and 2 resends sends the open again at 20 and 40 seconds. `0` never sends it again. A cloud valve, Gardena's for instance, confirms through the vendor's servers and counts every command against a quota: give it a longer wait and `0`. A close that is not confirmed is always tried a second time, whatever the resends, because a valve left open costs more than one command. This is Irrigation Unlimited's `check_back` (`delay`, `retries`), per zone.
- **Setting a failing zone aside** (advanced mode, off by default, on the **Observed watering** card): with **Set a zone aside after this many failed runs** at 3, say, a zone whose valve did not open, gave no water or could not have its own timer set three runs in a row is no longer watered by any program or cycle, rather than failing every morning with the pump starting for nothing. You are told at once: the programs' [notifications](usage-full-controller.md#being-told-when-a-program-has-watered), a repair in **Settings › Repairs** with a button to put the zone back, the zone's problem sensor (reason `zone_set_aside`) and a line on the zone in the panel, with **Put back**. It comes back by itself when its valve is seen opening, for instance tried by hand once repaired, and a successful run counts its failures from zero again.
- **Reboot resilience**: a run that is in progress when Home Assistant restarts is resumed (or closed if it already exceeded its duration) and then credited.
- **One run per zone per cycle**: a zone whose valve is already open is left out, and a zone watered while it waited its turn in a sequential run is not watered again when the queue reaches it. With observed watering on, that includes a valve opened outside Smart Irrigation, by hand or by another automation: running it too would close the valve under that run and count the overlap twice.
- **One cycle at a time, in sequential mode**: a run asked for while one is already going joins the queue instead of starting beside it, so two valves are never open at once. A zone already waiting is not queued twice, the zone being watered right now is not queued behind itself, and the zones that joined are in the same end-of-run summary. In parallel mode there is nothing to join: every zone at once is what that setting asks for.

!!! warning "Give your valve a hardware failsafe"

    If Home Assistant goes down for a long time during a run, the physical valve stays open and keeps watering, because Home Assistant is no longer there to close it. Give your valve a maximum run time on the device itself. Smart Irrigation also caps the credited time at the zone's maximum duration. For an MQTT or ZHA valve, Smart Irrigation can arm that failsafe for you on every run: see [hardware auto-off](#hardware-auto-off-mqtt-on_time-dead-man).

### Watering one zone by hand

**Calculate and water** also adds the **Irrigate now** button entity of each zone and **Irrigate all zones** on the hub, without a reload or a restart. Leaving it makes those buttons unavailable; choosing it again restores them with the same entity ids.

With **Calculate and water**, each zone with a linked valve has a **Water** button on its card in the Zones page. It asks for minutes, and left empty it waters the run the planning shows. The valve opens straight away, or takes its turn behind what is watering, and the water is credited to the zone's balance like any run of ours. It is the `smart_irrigation.water_zone` action, which an automation can call with the zone's entity or its `zone_id`.

### Hardware auto-off (MQTT on_time dead-man)

The closing of the valve normally happens in Home Assistant: the run opens the valve, waits, and closes it. If Home Assistant stops in that window and never comes back, nothing sends the close and the valve keeps watering. (A restart *does* recover: an in-flight run is resumed and closed when Home Assistant comes back. The gap is Home Assistant staying down.)

For a valve controlled over **MQTT** (a [zigbee2mqtt](https://www.zigbee2mqtt.io/) device, for instance), Smart Irrigation can close that gap with a hardware dead-man. On each pass it publishes an *on with timed off* command to the device, so the device's own firmware shuts the valve off after the run even if Home Assistant is no longer there. It is armed only after the valve is confirmed open, and it is additive: the normal close still runs, the `on_time` is set a little longer than the pass so it lands just after, as a failsafe rather than the primary off.

Three optional per-zone fields configure it (the topic and the mode on the advanced panel, shown only with Calculate and water and a linked valve set; the state key in YAML). The first two are empty by default, so nothing changes until you fill them in:

- **Safety off MQTT topic**: the device's `set` topic, e.g. `zigbee2mqtt/front_lawn_valve/set`.
- **Safety off state key** (`safety_off_state_key`, **YAML only**, for instance `safety_off_state_key: state_l1` in the zone's [Edit in YAML](configuration-zones.md#a-zone-in-yaml); empty is `state`): the on/off property in the payload: `state` for a single-channel device, or `state_l1`...`state_l4` for one channel of a multi-channel device.
- **Safety off mode**: `auto` (the default), `zha` or `off`, described below.

With those set, a pass that holds the valve for 300 seconds publishes `{"state_l1": "ON", "on_time": 330}` to the topic (the run time plus a 30-second margin). The device closes its own valve after `on_time` seconds whatever happens to Home Assistant.

!!! warning "Device support varies"

    `on_time` ("on with timed off") is honoured by the device firmware, not by Smart Irrigation, and [not every device implements it](https://www.zigbee2mqtt.io/devices/TYWB_4ch-RF.html). Test it before you rely on it: start a run, stop Home Assistant while the valve is open, and confirm the valve closes itself after `on_time`. Some devices need an `off_wait_time` alongside `on_time` to behave.

!!! note "Verified"

    A Sonoff SWV (firmware 1.0.4) on zigbee2mqtt, topic `zigbee2mqtt/<friendly name>/set`, state key `state`: with the Zigbee coordinator unplugged in the middle of a run, the valve closed by itself at the end of it (reported in [#893](https://github.com/altmenorg/HAsmartirrigation/issues/893)).

**Valves on ZHA** can be armed too. The linked valve must be a ZHA entity (found through the entity registry): each pass then sends the device an *on with timed off* command (On/Off cluster, command `0x42`) through `zha.issue_zigbee_cluster_command`, right after the normal open (a Sonoff SWV is the exception, see below). The unit of the time differs between devices, so the safety off mode matters:

- `auto` (default): armed automatically only for a model known to be verified. That is the **Sonoff SWV** (manufacturer SONOFF, model SWV), tested on a real valve (firmware 1.0.04, ZHA): it honours the command, but counts the time in **seconds**, not in tenths of a second as the ZCL spec says. Smart Irrigation sends it the pass length plus the margin, in seconds (at most 65535 s, about 18 hours). If Home Assistant dies mid-run, the valve closes itself about 30 seconds after the time Home Assistant would have closed it. If a topic is set, the topic wins and ZHA is not used.
- `zha`: explicit opt-in, arms any ZHA valve. A model that is not known is sent the time in the ZCL unit (tenths of a second); a pass longer than 6553 s is then not armed (a warning is logged once), as the device would close the valve too early. Other models are unverified: test them before you rely on them.
- `off`: never armed.

**A Sonoff SWV is opened by that same command.** On a real valve, *on with timed off* sent to a closed SWV both opens it and starts its own timer, so there is no moment when it is open without a timer. For a SWV in `auto` mode (no MQTT topic, mode `auto`; in `zha` or `off` mode the normal open is used), Smart Irrigation therefore opens the linked valve with that single command instead of the normal open: the time is the pass length rounded up plus the 30-second margin, in seconds (at most 65535). The rest is unchanged: the open is confirmed the same way (an open that has to be repeated sends the same command), the close at the normal time also clears the device's timer, a cycle-and-soak pass opens again and so restarts the timer, and a run resumed after a restart opens the same way with the time that remains. The extra valves keep the normal open. Each attempt is short (6 seconds, because a battery valve is asleep most of the time and would otherwise hold the start for about 16 seconds), and the command is tried once. If it fails (ZHA not set up, an error, a valve that does not answer), a warning is logged once for the zone and the valve is opened the normal way, followed by the separate arm described above: the watering is never prevented. Any other valve (another ZHA model, the explicit `zha` mode on an unknown model, MQTT, other platforms) is opened and armed exactly as before.

This timed off is separate from, and different from, the valve's own *water shortage auto close*, which does not cover Home Assistant stopping in the middle of a run. A failure to send the command never breaks the run: it is logged as a warning the first time for a zone, then at debug level.

The per-zone **safety off mode** picks the behaviour: `auto` (the default) uses the MQTT topic if there is one, else arms a Sonoff SWV on ZHA, and otherwise nothing; `zha` also arms a ZHA valve when there is no topic; `off` never arms a dead-man for that zone, topic included. Only the zone's linked valve is armed, not its extra valves.

**A valve that closes after a duration of its own** is opened for that duration, not until it is told to close. A Gardena smart valve is one: the Gardena integration opens it for its **watering duration** number, one minute unless changed, so a 40-minute pass would water for one minute while Smart Irrigation counts it as open. For such a valve, set the zone's **Valve's own duration** (advanced panel, with Calculate and water and a linked valve set) to that number entity, or to an `input_number` your valve reads. Before each open Smart Irrigation writes the pass length plus the 30-second margin to it, in the entity's unit (`s`, `min` or `h`), rounded up to its step: a 40-minute pass sets a minutes number to 41. The valve then stays open for the whole pass, Smart Irrigation closes it at the normal time, and the valve's own timer is the dead-man. A pass longer than the entity's maximum gets the maximum, and a warning is logged once: the valve will then close before the pass ends. A missing entity, one whose unit is not a duration, or a failed write is logged and the valve opens with whatever duration it already has. The **safety off mode** `off` turns it off as well.

**Only water with the valve's own timer.** Setting the valve's own timer is best-effort: when it fails (a battery valve asleep, MQTT down, a duration that could not be written), the valve opens all the same, without that safety net for the run. A zone that would rather skip the watering can say so: **If the valve's own timer can't be set** (advanced panel, shown only for a zone whose valve has a timer Smart Irrigation can set: a ZHA valve, an MQTT topic or a valve's own duration) set to **Leave the valve shut**. The valve then stays shut, or is shut at once when the timer is armed right after the open (MQTT, or a ZHA valve other than a Sonoff SWV), nothing is credited, so the water is carried over to the next watering, and the zone reports `valve_timer_not_set`. A zone with that setting and no way of setting a timer at all is never opened. Home Assistant still closes the valve at the normal time either way: the valve's own timer is the second net, not a replacement.

**Other valves** (Wi-Fi switches, ESPHome, Tuya, or anything that is neither MQTT with a topic nor ZHA) get no automatic dead-man: leave the fields empty and the run behaves exactly as before. For those, set the failsafe on the device itself, which is more reliable than Home Assistant sending it every run: a Shelly has an *Auto-off timer*, Tasmota has `PulseTime`, ESPHome can turn a switch off after a delay, and many Tuya Wi-Fi switches have a *countdown* function.

### Cycle and soak, and the pause between zones

Both are for an installation that is already tuned, and only apply when Smart Irrigation opens the valves itself (Calculate and water). Each step of a [program](usage-full-controller.md#programs) has its own number of passes, and the soak time between them is one setting for every program, shown next to a step's passes. The order, passes and pause of the [Irrigate all zones](usage-full-controller.md#irrigate-all-zones-now) button are folded at the bottom of **Watering › Programs**.

**Water in several passes** splits a run into shorter passes with a pause between them. Clay and compacted soil have an infiltration rate: past it the water runs off or puddles, and the zone is billed for water the roots never see. Three passes of five minutes with fifteen minutes of soaking deliver the same water as one run of fifteen minutes, and the soil keeps more of it. Guidance: sand takes water as fast as you can give it, so leave this at one pass; loam rarely needs more than two; clay and slopes are what it is for.

The plan is fixed when the run starts, and a run too short to split is left alone (no pass shorter than a minute). Each pass is credited as it closes, so a restart in the middle of a run never credits water twice and never leaves a valve open.

**Pause between zones** waits between two zones of a sequential run, for the line pressure to recover or for a slow valve to finish closing before the next one opens.

Both lengthen the run without adding water to it, and a schedule that must be done by sunrise works back from the whole thing, soaking and pauses included: three zones of half an hour in three passes with fifteen minutes of soaking occupy two and a half hours, not an hour and a half. Watch that against the hour you want to be finished by. With Calculate only, your own executor opens the valves, neither setting applies, and the start trigger works back from the watering alone.

### Events for your own automations

When Smart Irrigation waters, it fires events you can use to notify or react, so you do not need one automation per zone. With **Calculate and water**, the first two come from the run of the [Irrigate all zones](usage-full-controller.md#irrigate-all-zones-now) button, and from the program with the id `main` (on an installation that had a main program, the ordinary program it was turned into, **Watering**; there is [no main program any more](usage-full-controller.md#no-main-program)), so an automation written for them keeps working; every program also fires `smart_irrigation_program_started` and `smart_irrigation_program_finished`.

- `smart_irrigation_irrigation_started` when a run begins. Data: `sequencing` (`sequential`/`parallel`) and `zones`, a list of `{zone_id, zone, seconds}` about to be watered.
- `smart_irrigation_irrigation_finished` when the whole run is done. Data: `zones`, a list of `{zone_id, zone, seconds, volume_l, bucket}` that ran (volume delivered and the new water balance), and `problems`, a list of `{zone_id, zone, reason}` for zones that delivered no water: the valve did not open (`valve_did_not_open`), or it opened and the zone's flow meter did not move (`no_flow`). A valve that watered but would not close is still in `zones`, since the water it delivered is credited, and is reported by its own `smart_irrigation_zone_problem` event.
- `smart_irrigation_zone_problem` the moment something goes wrong with a valve. Data: `zone_id`, `zone`, `entity_id`, `reason`: `valve_did_not_open`, `valve_did_not_close` (the close failed or the valve still reads open, retried once), or `no_flow` (the valve opened but the zone's flow meter did not move, so the run is not credited), `valve_closed_early` (the valve read `off` or `closed` while it should have been open, so the zone's run ends and is credited for the time it was open), `supply_did_not_turn_on` (the pump or main valve the zone depends on never came on, so the zone's valve stays shut), or `valve_timer_not_set` (the zone asks for the valve's own timer and it could not be set, so the valve stays shut or is shut at once).

Example: a single end-of-watering report for all zones.

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
      title: "Watering finished{{ ' with problems' if problems | count > 0 else '' }}"
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

!!! warning "Remove your old watering automations"

    If you had one automation per zone that opened the valve and called `set_bucket` or `reset_bucket`, remove them once you choose **Calculate and water**: Smart Irrigation opens the valves and credits the water balance itself, so the old automations would double up. Keep only report or notification automations like the one above.

With **Calculate only**, Smart Irrigation opens no valve: it fires `smart_irrigation_start_irrigation_all_zones` at the [start trigger](configuration-general.md#start-triggers) for your own automation or executor, with the trigger's identity. See [events](usage-events.md).
