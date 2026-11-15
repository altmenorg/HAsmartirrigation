---
layout: default
title: "Usage: Assistants (AI)"
---

# Assistants (AI)

> Main page: [Usage](usage.md)<br/>

Smart Irrigation can be offered to an assistant: Claude, ChatGPT or any other client of the Model Context Protocol (MCP), or a conversation agent of Home Assistant (Assist). The assistant can then answer questions such as "why was the lawn not watered this morning?", "what will run tomorrow?" or "which zone is the driest?", and, if you let it, set Smart Irrigation up with you: "add a zone for the vegetable garden on the second valve", "water the hedges every other evening".

It is **off by default**, and **reads only** until you turn on the second switch. Whatever you allow, the assistant never runs a watering, never opens a valve, and cannot change its own access.

## Turning it on

1. In Smart Irrigation, **Settings**, **AI access**, turn on **Offer Smart Irrigation to assistants**. Smart Irrigation then registers an API with Home Assistant; it runs no server of its own.
2. To let the assistant change the configuration as well, turn on **Let assistants change the configuration** under it.
3. For an MCP client: add Home Assistant's own **Model Context Protocol Server** integration (Settings, Devices & services, Add integration) and tick **Smart Irrigation** in its options. Connect the client to Home Assistant as that integration's page explains; Home Assistant does the authentication.
4. For Assist: in the options of your conversation agent, tick **Smart Irrigation** among the APIs it may use.

Turn the first switch off and the API is taken away at once. Turn the second one off and the next conversation can only read again.

## What the assistant can read

| Tool | What it gives |
| --- | --- |
| `GetZones` | Each zone: state, water balance (mm, a deficit when negative), next duration, valve, size, throughput, lead time, sensor group. |
| `GetZoneSettings` | Every stored setting of one zone (metric). |
| `GetIrrigationInfo` | The next watering and why a zone is held back or skipped, as on the Home tab. |
| `GetPrograms` | The programs of the [full controller](usage-full-controller.md), their steps (zones by id and by name) and schedules. |
| `GetPlanning` | What the programs will water over the next days (1 to 14), each run's zones in order and whether the weather is expected to hold it back. |
| `GetSensorGroups` | The sensor groups (where each weather input comes from) and the calculation modules. |
| `GetSettings` | The general settings, in the unit system of Home Assistant. |
| `FindEntities` | The valves, switches, sensors and weather entities of Home Assistant, with their unit, device class and the make and model of their device: what the assistant needs to ask you the right questions. |
| `PreviewProgram` | A program as the assistant wrote it, cleaned the way a save cleans it and dry-run on the zones as they are now: each zone's start, end and water, the total, and the zones it could not find. Nothing is saved. |

## What it can change, when you let it

| Tool | What it does |
| --- | --- |
| `SaveZone`, `DeleteZone` | Create a zone, change its settings, or delete it. |
| `SaveSensorGroup`, `DeleteSensorGroup` | Create a sensor group, change where its inputs come from, or delete it. |
| `SaveSettings` | Change general settings (calculation, skip conditions, start triggers, the full controller, sequencing, passes and soak, pumps...). |
| `SaveProgram`, `DeleteProgram` | Add or replace a program, or delete one (never the main program). A program that names a zone that does not exist is refused. |

Every change goes through the path the panel saves with, so the same checks apply: a zone cannot be linked to one of Smart Irrigation's own valves, an unknown setting is refused, a program is cleaned the same way. The assistant is told to say what it is about to change, and most clients ask you before a tool that writes; deleting is marked as such. Each change is written in Home Assistant's log (`An assistant saved zone 3`, at the info level).

## Without the second switch: writing a program together

Ask for the program you want ("water the vegetable garden and the greenhouse together every other evening, then the hedges"). The assistant writes it in the [YAML shape of the program editor](usage-full-controller.md#a-program-in-yaml), checks it with `PreviewProgram` and gives it to you. Paste it in **Watering**, **Programs**, **New program in YAML** (or **Edit in YAML** on an existing program): the timeline shows what it would do before you apply it.

## Privacy

The assistant receives what these tools return: zone names, entity ids and the names and models of your devices, the weather-based figures and the schedules. With a cloud assistant, that leaves your home. Leave the option off if you do not want that.
