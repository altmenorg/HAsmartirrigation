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
  const names = new Map(entities.map((e) => [e.id, e.name]));
  const actionIds = Object.keys(hass.services?.notify || {})
    .filter((action) => !NOT_TARGETS.has(action))
    .map((action) => `notify.${action}`);
  const actionSet = new Set(actionIds);
  // A phone of the companion app is both notify.<phone> and the action
  // notify.mobile_app_<phone>: listed once, as the action, which alone can
  // send a problem with a high priority, under the entity's name.
  const phone = (entityId: string) =>
    `notify.mobile_app_${entityId.slice("notify.".length)}`;
  const actions: NotifyTarget[] = actionIds
    .filter((id) => !names.has(id))
    .map((id) => {
      const entity = entities.find((e) => phone(e.id) === id);
      return { id, name: entity ? entity.name : id };
    });
  const byName = (a: NotifyTarget, b: NotifyTarget) =>
    a.name.localeCompare(b.name);
  return [
    { id: "persistent_notification", name: "persistent_notification" },
    ...[
      ...entities.filter((e) => !actionSet.has(phone(e.id))),
      ...actions,
    ].sort(byName),
  ];
};
