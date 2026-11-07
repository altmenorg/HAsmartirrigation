# Glossary

One word for each thing in the panel; these pages follow as they are revised. The code, the services, the entity ids and the attributes keep their names, so automations that use them don't change. The column "In code" gives that name.

When you translate the panel, use the word in the second or third column for the thing in the first; a language without a column yet is free to pick its word, as long as it keeps to one.

| What it is | Panel (English) | Panel (German) | In code |
|---|---|---|---|
| The water a zone's root zone has, counted from field capacity, in mm (or inches). Zero means it holds what it can; below zero it is short, above zero there is a surplus that drains away. | Water balance | Wasserbilanz | `bucket` |
| What a zone is short of, the water balance below zero, as a positive amount. | Deficit | Defizit | (negative `bucket`) |
| The largest surplus a zone keeps above field capacity. | Maximum water balance | Maximale Wasserbilanz | `maximum_bucket` |
| How fast a saturated root zone drains, in mm/h. | Drainage rate | Entwässerungsrate | `drainage_rate` |
| The water lost to evaporation and plants. ET0 is the reference value from the weather, ETc that value times the crop factor. | Evapotranspiration (ET0, ETc) | Evapotranspiration (ET0, ETc) | — |
| The factor between ET0 and what the planting uses. | Crop factor (Kc) | Pflanzenfaktor (Kc) | `multiplier` |
| The way a zone's water loss is calculated: from the weather (PyETO), a fixed amount (Static), or a value another sensor provides (Passthrough). | Module | Modul | `module` |
| The sources a zone reads its weather from: a weather service, your own sensors, or both. | Sensor group | Sensorgruppe | `mapping` |
| An online service that provides weather data and forecasts. | Weather service | Wetterdienst | `weather_service` |
| How long a zone is watered at the next start, worked out from its water balance and its flow. | Duration | Dauer | `duration` |
| What starts the watering: a time, sunrise or sunset, or the sun's position. | Start trigger | Startauslöser | `irrigation_start_triggers` |
| A set of zones watered together on a schedule (full controller only). | Program | Programm | `programs` |
| Smart Irrigation opens and closes the valves itself. | Full controller | Volle Steuerung | `full_controller` |
| A soil or planting nobody picked: the zone is calculated with the value it started with. | Not chosen yet | Noch nicht gewählt | `soil_type` / `plant_type` empty |

## Words that are not used

| Instead of | Say |
|---|---|
| bucket (in a text), Vorrat, Eimer | water balance, Wasserbilanz |
| engine, calculation engine, Berechnungs-Engine | module, Modul |
| mapping (in a text) | sensor group, Sensorgruppe |
| crop coefficient, multiplier, Pflanzenkoeffizient, Multiplikator | crop factor, Pflanzenfaktor |

"bucket" stays where it is code: the attribute `bucket`, the services `set_bucket`, `set_all_buckets`, `reset_bucket` and `reset_all_buckets`, and the entity ids ending in `_bucket`.
