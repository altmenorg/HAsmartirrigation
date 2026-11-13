/**
 * What the card has to work out before it can say anything, kept out of the
 * element so it can be tested without a browser.
 */
import { formatNumber } from "../number-format";

export interface ZoneNow {
  bucket: number;
  duration: number;
  /** Whether this is the live estimate or the last committed calculation. */
  live: boolean;
}

/** An estimate as the integration publishes it alongside the zones. */
export interface ZoneEstimate {
  bucket?: number;
  duration?: number;
  since?: string;
  as_of?: string;
}

/**
 * Where a zone stands now rather than at its last calculation.
 *
 * The bucket a zone reports was committed by the nightly calculation, so by
 * the afternoon it describes last night. The integration re-runs the same
 * calculation over the readings collected since, without committing it, and
 * publishes that alongside the zones. A zone calculated minutes ago has no
 * estimate, because there is nothing new to add, and then the committed value
 * is the current one.
 */
export const zoneNow = (
  zone: { bucket: number; duration: number },
  estimate?: ZoneEstimate | null,
): ZoneNow => {
  if (!estimate || typeof estimate.bucket !== "number") {
    return { bucket: zone.bucket, duration: zone.duration, live: false };
  }
  return {
    bucket: estimate.bucket,
    duration: estimate.duration ?? zone.duration,
    live: true,
  };
};

/**
 * A deficit worth naming. A zone that has just watered sits a hair below zero,
 * and "short 0.0 mm" is both wrong and worse than saying there is nothing to
 * do.
 */
export const deficitOf = (bucket: number): number => {
  const deficit = bucket < 0 ? -bucket : 0;
  return deficit >= 0.05 ? deficit : 0;
};

/**
 * A depth, labelled. The API answers in the unit system the viewer is shown,
 * so converting here would convert it twice.
 */
export const depthLabel = (
  value: number,
  imperial: boolean,
  locale?: { language?: string; number_format?: string } | null,
  language?: string,
): string =>
  imperial
    ? `${formatNumber(value, 2, locale, language)} in`
    : `${formatNumber(value, 1, locale, language)} mm`;

/**
 * A run length said the way one says it: 1 h 05 min, 14 min 33 s, 2 min, 45 s.
 *
 * The panel and the card wrote the same duration five ways: "00:02:00",
 * "1:00:00", "1 h 00 min", "60 min", "1 h 3 min". This is the one way, for a
 * duration that is read; the time left is remainingDuration.
 */
export const friendlyDuration = (seconds?: number | null): string => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h} h ${String(m).padStart(2, "0")} min`;
  if (m > 0) return s ? `${m} min ${s} s` : `${m} min`;
  return `${s} s`;
};

/**
 * Time left, said like any other duration: in whole minutes from 10 minutes
 * on ("59 min", "1 h 02 min"), to the second below ("1 min 54 s"). The same
 * run read "59 min 53 s" on Start, "59:53" in Planning and "59:33" or
 * "1:01:49" on the card (UX walk of 9 Nov., evening).
 */
export const remainingDuration = (seconds?: number | null): string => {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  return friendlyDuration(total >= 600 ? Math.ceil(total / 60) * 60 : total);
};

/**
 * A moment as a dashboard writes one: the time alone today, named for
 * yesterday and tomorrow, the day and month beyond that. Seconds are noise.
 */
export const momentLabel = (
  when: string,
  language: string,
  words: { tomorrow: string; yesterday: string },
  today: Date = new Date(),
): string => {
  const date = new Date(when);
  if (isNaN(date.getTime())) return when;
  const time = date.toLocaleTimeString(language, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const midnight = new Date(today);
  midnight.setHours(0, 0, 0, 0);
  const days = Math.floor(
    (date.getTime() - midnight.getTime()) / (24 * 3600 * 1000),
  );
  if (days === 0) return time;
  if (days === 1) return `${words.tomorrow} ${time}`;
  if (days === -1) return `${words.yesterday} ${time}`;
  return `${date.toLocaleDateString(language, {
    day: "numeric",
    month: "short",
  })} ${time}`;
};

/** The bits of the frontend's entity registry the card reads. */
export interface RegistryEntity {
  entity_id: string;
  device_id?: string;
  platform?: string;
  translation_key?: string;
}

/** The bits of the frontend's device registry the card reads. */
export interface RegistryDevice {
  identifiers?: [string, string][];
}

/**
 * The entity of one of a zone's own buttons, or undefined when it is not
 * there.
 *
 * A zone's entities are named after the zone, which people rename, so the card
 * matches on what does not move: the integration's own translation key, and
 * the zone device's identifier, which carries the zone's id.
 */
export const zoneActionEntity = (
  entities: Record<string, RegistryEntity> | undefined,
  devices: Record<string, RegistryDevice> | undefined,
  zoneId: number,
  translationKey: string,
  domain = "smart_irrigation",
): string | undefined => {
  if (!entities || !devices) return undefined;
  const suffix = `_zone_${zoneId}`;
  for (const entity of Object.values(entities)) {
    if (
      entity.platform !== domain ||
      entity.translation_key !== translationKey
    ) {
      continue;
    }
    const device = entity.device_id ? devices[entity.device_id] : undefined;
    const identifiers = device?.identifiers ?? [];
    for (const [entityDomain, identifier] of identifiers) {
      if (entityDomain === domain && String(identifier).endsWith(suffix)) {
        return entity.entity_id;
      }
    }
  }
  return undefined;
};

/**
 * How long to wait before asking again after a failed load, in ms.
 *
 * The integration is not up the moment a dashboard is, so the first ask after
 * a restart can fail. Waiting the normal beat would leave the card blank for
 * minutes, and hammering would be rude to a server that is busy starting, so
 * the first retries are quick and they back off to the normal beat.
 */
export const retryDelay = (failures: number, beat: number): number => {
  const steps = [3000, 10000, 30000];
  return failures <= steps.length ? steps[failures - 1] : beat;
};

/** The states of a program that is on the move: it is being watched closely. */
const ACTIVE_PROGRAM_STATES = ["running", "waiting", "paused"];

/** Whether any program is watering, waiting its turn or paused. */
export const anyProgramActive = (
  programs: { state?: string }[] | undefined,
): boolean =>
  !!programs?.some((p) => ACTIVE_PROGRAM_STATES.includes(p.state ?? ""));

/** How often the programs are asked for: fast while one runs, slow otherwise. */
export const programsPollDelay = (active: boolean): number =>
  active ? 5000 : 60000;

/** What the card's "next start" line says. */
export type NextStartState =
  | "off"
  | "no_trigger"
  | "skipped"
  | "not_scheduled"
  | "nothing"
  | "start"
  | "no_start";

/**
 * The next start line, read as the Info page reads it (#841, #969).
 *
 * The time in the info payload is worked out arithmetically: it is there
 * whether or not anything will act on it. The card printed it under the
 * "none" trigger, which starts nothing, and while no trigger was armed. Only
 * the start trigger is armed or not: the main program's own schedules are
 * not that trigger, and their start is shown as it is.
 */
export const nextStartState = (info: any): NextStartState => {
  if (info?.irrigation_enabled === false) return "off";
  const bySchedules = info?.start_source === "main_schedules";
  if (!bySchedules && info?.active_start_trigger === "none") {
    return "no_trigger";
  }
  if (info?.skip_preview?.should_skip) return "skipped";
  if (!bySchedules && info?.start_trigger_armed === false) {
    return (info?.next_irrigation_zones ?? []).length
      ? "not_scheduled"
      : "nothing";
  }
  return info?.next_irrigation_start ? "start" : "no_start";
};

/** Whether full control leaves this zone out of the run for want of a valve. */
export const zoneWithoutValve = (info: any, zoneId: number): boolean =>
  ((info?.zones_without_valve ?? []) as { id: number }[]).some(
    (zone) => Number(zone.id) === Number(zoneId),
  );

/** The name the main program is stored under until somebody renames it. */
export const MAIN_PROGRAM_STORED_NAME = "Main program";

/**
 * A program's name as the card shows it.
 *
 * The main program is stored as "Main program", in English, whatever the
 * language: the panel shows it in the user's language and the card showed
 * the stored name. A name of the user's own is kept as it is.
 */
export const programLabel = (
  program: { program_id: string; name?: string },
  mainName: string,
): string =>
  program.program_id === "main" &&
  (!program.name || program.name === MAIN_PROGRAM_STORED_NAME)
    ? mainName
    : (program.name ?? program.program_id);

/**
 * A zone Smart Irrigation calculates that has not been calculated yet: right
 * after the setup assistant, before the first calculation. Its water balance
 * and duration are the zeros it was created with, not a result, so "has what
 * it needs" would be a green tick on a guess.
 */
export function awaitsFirstCalculation(zone: {
  state?: string;
  last_calculated?: unknown;
  calculation_problem?: { code?: string } | null;
}): boolean {
  return (
    zone.state === "automatic" &&
    !zone.last_calculated &&
    !zone.calculation_problem?.code
  );
}

/** What programs_state says is being watered now (``live``). */
export interface LiveState {
  paused?: boolean;
  /** When the pause lifts itself (ISO), while one lasts. */
  paused_until?: string | null;
  /** The zones a pause interrupted: closed, and owed the rest of their run. */
  held?: {
    zone_id: number;
    zone?: string | null;
    remaining_seconds: number;
    percent: number;
  }[];
  cycle?: boolean;
  programs?: {
    program_id?: string;
    name?: string | null;
    state?: string;
    step?: number;
    steps?: number;
    percent?: number;
    remaining_seconds?: number | null;
  }[];
  valves?: {
    zone_id: number;
    zone?: string | null;
    /** What the zone has left: soaks and later passes included. */
    remaining_seconds: number;
    /** The share of the zone's water delivered. */
    percent: number;
    /** The pass under way and how many, for a zone watered in passes. */
    pass?: number;
    passes?: number;
    /** The volume the zone stops at, in litres, when its step sets one. */
    max_litres?: number;
  }[];
  /** Zones soaking between two passes: closed, and not done yet. */
  soaking?: {
    zone_id: number;
    zone?: string | null;
    /** When the next pass opens (ISO). */
    until: string;
    next_pass: number;
    passes: number;
    remaining_seconds: number;
    percent: number;
  }[];
  /** Zones waiting for their pump or main valve to come up. */
  starting?: {
    zone_id: number;
    zone?: string | null;
    supply?: string | null;
    remaining_seconds: number;
  }[];
}

/**
 * The zone soaking between two passes, or undefined. While it soaked nothing
 * said it was still in its run: Start read "watering" with no zone, the card
 * showed it at rest (UX walk of 13 Nov., Q6).
 */
export const soakingZone = (
  live: LiveState | null | undefined,
  zoneId: number | string | undefined,
) =>
  zoneId === undefined || zoneId === null
    ? undefined
    : (live?.soaking || []).find((v) => Number(v.zone_id) === Number(zoneId));

/**
 * The run of ours a zone is in right now, or undefined.
 *
 * Only Bewässerung › Planung said a zone was being watered: Start, the zone
 * and the card went on showing its plan, "nothing to water" or "would run
 * 1 h", while its valve was open (UX walk of 9 Nov.).
 */
export const runningValve = (
  live: LiveState | null | undefined,
  zoneId: number | string | undefined,
) =>
  zoneId === undefined || zoneId === null
    ? undefined
    : liveValves(live).find((v) => Number(v.zone_id) === Number(zoneId));

/**
 * The valves of the run: the open ones, and while paused the ones the pause
 * closed, which go on with the rest of their run after it. A pause showed none
 * of them, so nothing said what it held (UX walk of 9 Nov., evening).
 */
export const liveValves = (live: LiveState | null | undefined) => [
  ...(live?.valves || []),
  ...(live?.paused ? live?.held || [] : []),
];

/** Whether anything of ours is watering, waiting its turn or paused. */
export const wateringNow = (live: LiveState | null | undefined): boolean =>
  !!live &&
  (live.paused === true ||
    !!live.cycle ||
    (live.valves || []).length > 0 ||
    (live.soaking || []).length > 0 ||
    (live.starting || []).length > 0 ||
    (live.programs || []).some((p) => p.state === "running"));

/**
 * A manual zone's run, in seconds, or null for a zone that is not manual. It
 * waters its own duration at every start, whatever its water balance, so the
 * card says that rather than "no watering needed" (UX walk of 9 Nov., evening).
 */
export const manualRun = (zone: {
  state?: string;
  duration?: number | null;
}): number | null =>
  zone.state === "manual" ? Math.max(0, Number(zone.duration) || 0) : null;
