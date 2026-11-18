---
title: "Troubleshooting"
---
# Troubleshooting

## Nothing ever waters

The **Home** page answers first: it says whether the installation would ever water, and names the reason when it would not (see [Info](usage-info.md#one-answer-first)). Then check what **Settings › General** says Smart Irrigation does:

- **Calculate and water**: a zone is only watered once a [program](usage-full-controller.md#programs) has it in a step, and only when it has a **Linked valve/switch**. **Watering › Planning** shows what will run.
- **Calculate only**: Smart Irrigation opens no valve. Your automation, blueprint or controller does, on the start event of the active [start trigger](configuration-general.md#start-triggers). With the trigger on **None**, nothing starts.
- **Stop everything**: nothing is calculated or watered.

## The diagnostics file

To get help, a diagnostics file is the most useful thing to attach to an [issue](https://github.com/altmenorg/HAsmartirrigation/issues). In **Settings › Devices & services › Smart Irrigation** (or [this link](https://my.home-assistant.io/redirect/integration/?domain=smart_irrigation)), choose **Download diagnostics** in the three-dot menu. The storage file, `smart_irrigation.storage` in the `.storage` folder of your configuration, holds the same configuration.

### Reading it

The file is JSON. It lists your settings, zones, sensor groups and modules, and the weather data collected. The weather data is stored in metric, so it may not match what the panel shows:

- dew point, temperature: degrees Celsius (°C);
- evapotranspiration, total precipitation: millimetres (mm);
- humidity: percent (%);
- pressure: hectopascals (hPa), converted to absolute pressure when provided as relative;
- solar radiation: megajoules per square metre per day (MJ/day/m²);
- wind speed: metres per second (m/s).

These are the units the FAO-56 calculation works in. Most of the conversions are in [helpers.py](https://github.com/altmenorg/HAsmartirrigation/blob/master/custom_components/smart_irrigation/helpers.py).

## "A zone is never watered and its deficit does not move"
When every day of the window lacks something the equation needs (a temperature, the wind),
the evapotranspiration comes out as nothing: the deficit stays where it was and the zone is
never watered, which looks exactly like a zone with no need. Smart Irrigation now raises a
repair issue naming the zone and the inputs that were missing, and clears it at the next
calculation that can be done. Check that the sensors mapped to those fields are available,
or that the weather service still sends them.

A repair issue also appears when one run of a zone cannot water what the zone loses between
two waterings (see *Maximum duration* in the [zone settings](configuration-zones.md)).

## A zone says it cannot be calculated
When the calculation of an automatic zone fails, the zone keeps its last water balance and is not
watered. Smart Irrigation says so in three places until a calculation succeeds: the zone's
line in the Zones tab (red, with the reason, instead of "nothing to water"), the zone's
problem sensor (`binary_sensor.smart_irrigation_<zone>_problem`, on, with the reason in its
`reason` and `calculation` attributes), and a repair notice. The reasons and what to do:

- **No sensor group**: a zone added on the Zones tab has none until one is chosen. Choose
  it on the zone's card.
- **No weather readings**: the zone's sensor group has no readings. Check that it has
  sources and that they report, update the weather data, then calculate the zone.
- **No module**: choose how the zone is calculated on its card.
- **No evapotranspiration**: the zone takes its evapotranspiration from a sensor or a
  weather service, and the sensor group had none. Check that sensor or the service.
- **A forecast without a weather service**: the zone looks days ahead, which needs a
  weather service. Set one up, or set the zone's **Look ahead** to 0.
- **An error**: the message is shown. If it keeps happening, please open an issue with it
  and the diagnostics file.

A dry run changes nothing and says nothing. A calculation with nothing new to read (every
reading was already used) is not a failure. A zone switched to manual or disabled is not
calculated, so it shows no such problem.

## "The calculated duration looks wrong"
The diagnostic file shows the current state, not how it was reached. To find out why a
particular day watered the way it did, switch on the
[calculation log](configuration-general.md#calculation-log) in the general settings (turn on
the advanced mode first: the switch is there). From then on every
calculation appends one line to `config/smart_irrigation/calc_log.jsonl` with the sensor
records and their aggregation, the module intermediates (solar radiation and whether it was
measured or estimated, net radiation, ET0) and the resulting water balance, duration and volume, so
two days can simply be compared. The most recent records are also included in
the diagnostics download (coordinates rounded, entity ids removed), which makes them easy to
attach to an issue.
