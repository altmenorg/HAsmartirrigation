# How it works

The below image shows a graphical representation of what this integration does.

![](assets/images/smart_irrigation_diagram.png)

1. Snow and rain fall on the ground add moisture. Together, this makes up the `precipitation`.
2. Sunshine, temperature, wind speed, place on earth and other factors influence the amount of moisture lost from the ground(`evapotranspiration`).
3. The difference between `precipitation` and `evapotranspiration` is the `delta` or `nett precipitation`: negative values mean more moisture is lost than gets added by rain/snow, while positive values mean more moisture is added by rain/snow than what evaporates.
4. At some point in the day (configurable) the `nett precipitation` is added/substracted from the `bucket,` which starts as empty. The bucket is calculated using this formula: `old_bucket + nett precipitation.
5. If the bucket > 0, the `drainage rate` is taken into the account (if set) and subtracted from the bucket value. The actual drainage rate is determined dynamically by the fraction the bucket is of the maximum bucket value, following hydraulic conductivity method of [Brooks and Corey, Eq. 4-6](https://open.library.okstate.edu/rainorshine/chapter/1-8-models-for-soil-hydraulic-conductivity/)
6. If the `bucket` is below zero, irrigation is required.
7. Irrigation should be run for `sensor.smart_irrigation_[zone_name]`, which is 0 if `bucket >=0`. Afterwards, the `bucket` needs to be reset (using [`reset_bucket` service](services)). It's up to the user of the integration to build the automation for this final step. See [Example automation](example-automations) for automations that people have built.

## Weekly behavior example
To understand how `precipitation`, `nett precipitation`, the `bucket` and irrigation interact, see let's look at an example behavior in a week.
With this you should be able to do a sanity check against your confiruation and make sure everything is working together.
The scenario is as follows: we will look at several days, including the precipitation and evapotranspiration for those days and the effects on the bucket and whether ot not irrigation should be triggered. Note that the values here are not representative of any real-life situation and the example below only uses one zone to keep things simple.

### Initialization
Initially, the bucket is `0`, so the duration for irrigation is set to `0s`. 

### Variables used
* `P`: Precipitation
* `Et`: Evapotranspiation
* `D`: nett Precipitation or Delta (`=P-Et`)
* `B`: Bucket
* `Bu`: Bucket after calculation has happened (=`B+D`)
* `Du`: Duration for irrigation in seconds

### Scenario
| Day | `P` | `Et` | `D` | `B` | `Bu` | `Du` | Notes |
|---|---|---|---|---|---|---|---|
|1|`0.5`|`0.1`|`0.4`|`0`|`0.4`|`0`|`P > Et` so bucket increased from `0` to `0.4`. Since `Bu > 0` no irrigation is required|
|2|`0`|`0.6`|`-0.6`|`0.40`|`-0.2`|`180`|`P < Et`, so bucket decreased from `0.4` to `-0.2`. Since Bu < 0` irrigation is required and bucket is reset afterwards|
|3|`1`|`0.2`|`0.8`|`0` (reset)|`0.8`|`0`|No irrigation required|
|4|`0.2`|`0.4`|`-0.2`|`0.8`|`0.6`|`0`|No irrigation required even though `P < Et` and bucket was decreased from `0.8` to `0.6`|
|5|`0`|`1.5`|`-1.5`|`0.6`|`-0.9`|`600`| Since `Bu < 0` irrigation is required and bucket is reset afterwards|
|6|`0`|`0.4`|`-0.4`|`0` (reset)|`-0.4`|`300`|Since `Bu < 0` irrigation is required and bucket is reset afterwards|
|7|`0.5`|`0.2`|`0.3`|`0` (reset)|`0.3`|`0`|No irrigation required|

## When to irrigate
You should irrigate when the irrigation tells you to, but keep in mind that for grass, experts say you should water deeply but infrequently to avoid overwatering and encourage deep rooting. It might be a good idea to create an automation that starts early enough to finish before sunrise and run that only once per week if `duration is 0` or if the `bucket < -25 mm (~1")`. Adjust to your specific needs. See [Example automation](example-automations) for examples.
