/**
 * What the card has to work out before it can say anything, kept out of the
 * element so it can be tested without a browser.
 */

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
export const depthLabel = (value: number, imperial: boolean): string =>
  imperial ? `${value.toFixed(2)} in` : `${value.toFixed(1)} mm`;

/** A run length as hh:mm:ss, dropping the hours when there are none. */
export const durationLabel = (seconds: number): string => {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const parts = h ? [h, m, s] : [m, s];
  return parts
    .map((part, index) =>
      index ? String(part).padStart(2, "0") : String(part),
    )
    .join(":");
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
