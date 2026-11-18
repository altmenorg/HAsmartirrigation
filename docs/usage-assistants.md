---
title: "Assistants (AI)"
---
# Assistants (AI)

Smart Irrigation can be offered to an assistant: Claude, ChatGPT or any other client of the Model Context Protocol (MCP), or a conversation agent of Home Assistant (Assist). The assistant can then answer questions such as "why was the lawn not watered this morning?", "what will run tomorrow?" or "which zone is the driest?", and set Smart Irrigation up with you: "add a zone for the vegetable garden on the second valve", "water the hedges every other evening".

There is nothing to turn on in Smart Irrigation: it offers itself to Home Assistant (an API of Home Assistant's LLM helper, no server of its own), and no assistant sees it until you pick it there. Whatever it is asked, the assistant never runs a watering and never opens a valve.

## Using it

- **With an MCP client**: add Home Assistant's own **Model Context Protocol Server** integration (**Settings › Devices & services › Add integration**) and tick **Smart Irrigation** in its options. Connect the client to Home Assistant as that integration's page explains; Home Assistant does the authentication.
- **With Assist**: in the options of your conversation agent, tick **Smart Irrigation** among the APIs it may use.

Untick it there and the assistant no longer reaches Smart Irrigation.

## What the assistant can read

| Tool | What it gives |
| --- | --- |
| `GetZones` | Each zone: state, water balance (mm, a deficit when negative), next duration, valve, size, throughput, lead time, sensor group. |
| `GetZoneSettings` | Every stored setting of one zone (metric). |
| `GetIrrigationInfo` | The next watering and why a zone is held back or skipped, as on the Home tab. |
| `GetPrograms` | The [programs](usage-full-controller.md), their steps (zones by id and by name) and schedules. |
| `GetPlanning` | What the programs will water over the next days (1 to 14), each run's zones in order and whether the weather is expected to hold it back. |
| `GetSensorGroups` | The sensor groups (where each weather input comes from) and the calculation modules. |
| `GetSettings` | The general settings, in the unit system of Home Assistant, with `mode` first. |
| `FindEntities` | The valves, switches, sensors and weather entities of Home Assistant, with their unit, device class and the make and model of their device: what the assistant needs to ask you the right questions. |
| `PreviewProgram` | A program as the assistant wrote it, cleaned the way a save cleans it and dry-run on the zones as they are now: each zone's start, end and water, the total, and the zones it could not find. Nothing is saved. |
| `GetConfigReference` | Every field the assistant can write, for a program, its steps, schedules and notifications, and for a zone: type, allowed values or range, unit, default and meaning. The options the panel shows in its [advanced mode](usage-full-controller.md#yaml-only-options) only are flagged `advanced`, the two set only in YAML `yaml_only`. |

## What it can change

| Tool | What it does |
| --- | --- |
| `SaveZone`, `DeleteZone` | Create a zone, change its settings, or delete it. |
| `SaveSensorGroup`, `DeleteSensorGroup` | Create a sensor group, change where its inputs come from, or delete it. |
| `SaveSettings` | Change general settings: `mode`, what Smart Irrigation does (`water`, `calculate` or `off`: Calculate and water, Calculate only, Stop everything), then calculation, skip conditions, start triggers, sequencing, passes and soak, pumps... The switches `mode` replaced are refused one by one. |
| `SaveProgram`, `DeleteProgram` | Add or replace a program, or delete one. A program that names a zone that does not exist is refused. |

Every change goes through the path the panel saves with, so the same checks apply: a zone cannot be linked to one of Smart Irrigation's own valves, an unknown setting is refused, a program is cleaned the same way. The assistant is told to say what it is about to change, and most clients ask you before a tool that writes; deleting is marked as such. Each change is written in Home Assistant's log (`An assistant saved zone 3`, at the info level).

## Writing a program together

Ask for the program you want ("water the vegetable garden and the greenhouse together every other evening, then the hedges"). The assistant writes it in the [YAML shape of the program editor](usage-full-controller.md#a-program-in-yaml), checks it with `PreviewProgram` and gives it to you. Paste it under **Watering › Programs**, with **Edit in YAML** on a **New program** or on an existing one: the timeline shows what it would do before you apply it.

The assistant does not have to guess the fields: `GetConfigReference` lists every one a program, a step, a schedule and a zone can be written with, the [advanced and YAML-only options](usage-full-controller.md#yaml-only-options) included (a step's `adjust_seconds`, a schedule's `months` or `fallback_time`...), with their range and default. So it can set an option the standard form does not show, or has no field for, and that no program of yours uses yet.

## Privacy

The assistant receives what these tools return: zone names, entity ids and the names and models of your devices, the weather-based figures and the schedules. With a cloud assistant, that leaves your home. Do not tick Smart Irrigation in the MCP server or the conversation agent if you do not want that.
