/**
 * Whom a program can tell (program_notify.py): a persistent notification, the
 * notify entities, and the notify actions that are not one of those (the phone
 * apps, older notify integrations).
 */
export interface NotifyTarget {
  id: string;
  name: string;
}

interface HassLike {
  states: Record<string, { attributes?: { friendly_name?: string } }>;
  services: Record<string, Record<string, unknown>>;
}

/** The actions of the notify domain that are not a target of their own. */
const NOT_TARGETS = new Set([
  "send_message",
  "persistent_notification",
  "notify",
]);

export const notifyTargets = (hass: HassLike): NotifyTarget[] => {
  const entities: NotifyTarget[] = Object.keys(hass.states || {})
    .filter((id) => id.startsWith("notify."))
    .map((id) => ({
      id,
      name: hass.states[id]?.attributes?.friendly_name || id,
    }));
  const taken = new Set(entities.map((e) => e.id));
  const actions: NotifyTarget[] = Object.keys(hass.services?.notify || {})
    .filter((action) => !NOT_TARGETS.has(action))
    .map((action) => `notify.${action}`)
    .filter((id) => !taken.has(id))
    .map((id) => ({ id, name: id }));
  const byName = (a: NotifyTarget, b: NotifyTarget) =>
    a.name.localeCompare(b.name);
  return [
    { id: "persistent_notification", name: "persistent_notification" },
    ...[...entities, ...actions].sort(byName),
  ];
};
