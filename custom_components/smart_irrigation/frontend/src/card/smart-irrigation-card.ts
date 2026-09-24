/**
 * The Smart Irrigation dashboard card.
 *
 * The panel is for configuring an installation, which is occasional. This card
 * is for living with it: what each zone is short of, how long it would run,
 * when the water goes on, and why it would not. It is served and registered by
 * the integration, so there is nothing to install.
 *
 * It reads the same websocket API the panel does, rather than the entities, so
 * a zone's numbers come from one place and agree with the panel's.
 */
import { LitElement, html, css, TemplateResult, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import {
  deficitOf,
  depthLabel,
  durationLabel,
  momentLabel,
  zoneNow,
} from "./format";

const DOMAIN = "smart_irrigation";

/**
 * The custom element's name, and so the card type a dashboard stores. It is
 * spelled with hyphens, where the integration's domain has an underscore:
 * building it out of the domain gave "custom:smart_irrigation-card", which
 * matches no element, and the card picker handed that to the dashboard.
 */
const CARD_TYPE = "custom:smart-irrigation-card";

/** How often the card asks the server where the zones stand. */
const REFRESH_MS = 120000;

/**
 * The card's own strings. The panel's translations live in a module that
 * carries all nineteen languages, and the card loads on every dashboard, so it
 * keeps its handful of words to itself. Anything not translated falls back to
 * English.
 */
const STRINGS: Record<string, Record<string, string>> = {
  en: {
    title: "Smart Irrigation",
    next_start: "Next start",
    no_start: "No start scheduled",
    skipped: "Held back",
    short_by: "short {value}",
    no_need: "no watering needed",
    // A projection, not a report: the run has not happened yet.
    runs_for: "would run {duration}",
    never_watered: "never watered",
    last_watered: "last watered {when}",
    calculate: "Calculate now",
    manual: "manual",
    disabled: "disabled",
    no_zones: "No zones yet. Open the Smart Irrigation panel to add one.",
    tomorrow: "tomorrow",
    yesterday: "yesterday",
    live_since: "Estimated now, from the readings since {when}",
  },
  fr: {
    title: "Smart Irrigation",
    next_start: "Prochain départ",
    no_start: "Aucun départ prévu",
    skipped: "Reporté",
    short_by: "déficit {value}",
    no_need: "pas d'arrosage nécessaire",
    runs_for: "arroserait {duration}",
    never_watered: "jamais arrosé",
    last_watered: "dernier arrosage {when}",
    calculate: "Calculer maintenant",
    manual: "manuel",
    disabled: "désactivé",
    no_zones:
      "Aucune zone. Ouvrez le panneau Smart Irrigation pour en créer une.",
    tomorrow: "demain",
    yesterday: "hier",
    live_since: "Estimé maintenant, sur les relevés depuis {when}",
  },
};

interface CardConfig {
  type: string;
  title?: string;
  /** Zone ids to show. Every zone when left out. */
  zones?: number[];
  /** The next start line above the zones. */
  show_next_start?: boolean;
}

interface Zone {
  id: number;
  name: string;
  state: string;
  bucket: number;
  duration: number;
  irrigation_threshold?: number;
  last_irrigation?: string | null;
}

@customElement("smart-irrigation-card")
export class SmartIrrigationCard extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @state() private _config?: CardConfig;
  @state() private _zones: Zone[] = [];
  @state() private _info: any = null;
  @state() private _busy: number | null = null;

  private _unsubscribe?: () => void;
  private _timer?: number;

  public static getStubConfig(): CardConfig {
    return { type: CARD_TYPE, show_next_start: true };
  }

  public setConfig(config: CardConfig): void {
    this._config = { show_next_start: true, ...config };
  }

  public getCardSize(): number {
    return 1 + Math.max(this._zones.length, 1);
  }

  public connectedCallback(): void {
    super.connectedCallback();
    // The live estimate re-runs the calculation on the server for every zone,
    // so it is asked for on a slow beat, and not at all for a dashboard
    // nobody is looking at. Coming back to the tab refreshes it at once.
    this._timer = window.setInterval(() => {
      if (document.visibilityState === "visible") this._load();
    }, REFRESH_MS);
    document.addEventListener("visibilitychange", this._onVisible);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timer) window.clearInterval(this._timer);
    document.removeEventListener("visibilitychange", this._onVisible);
    this._unsubscribe?.();
    this._unsubscribe = undefined;
  }

  private _onVisible = (): void => {
    if (document.visibilityState === "visible") this._load();
  };

  protected updated(changed: PropertyValues): void {
    if (changed.has("hass") && this.hass && !this._unsubscribe) {
      this._subscribe();
      this._load();
    }
  }

  private async _subscribe(): Promise<void> {
    try {
      this._unsubscribe = await this.hass.connection.subscribeMessage(
        () => this._load(),
        { type: `${DOMAIN}_config_updated` },
      );
    } catch (_e) {
      // Without the subscription the card still refreshes on its timer.
    }
  }

  private async _load(): Promise<void> {
    if (!this.hass) return;
    try {
      // The info payload carries the live estimates as well as the next
      // start, so it is fetched even when the start line is turned off.
      const [zones, info] = await Promise.all([
        this.hass.callWS({ type: `${DOMAIN}/zones` }),
        this.hass.callWS({ type: `${DOMAIN}/info` }),
      ]);
      this._zones = zones ?? [];
      this._info = info;
    } catch (_e) {
      // A failed refresh keeps what is on screen: a card that empties itself
      // on a hiccup is worse than one showing numbers a minute old.
    }
  }

  private _t(key: string, values: Record<string, string> = {}): string {
    const language = (this.hass?.language || "en").split("-")[0];
    const table = STRINGS[language] ?? STRINGS.en;
    const template = table[key] ?? STRINGS.en[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_m, name) => values[name] ?? "");
  }

  private _depth(value: number): string {
    return depthLabel(value, this.hass?.config?.unit_system?.length === "mi");
  }

  /** Where the zone stands now: the live estimate when there is one. */
  private _now(zone: Zone) {
    return zoneNow(zone, this._info?.zone_estimates?.[String(zone.id)]);
  }

  private _duration(seconds: number): string {
    return durationLabel(seconds);
  }

  private _moment(when: string): string {
    return momentLabel(
      when,
      this.hass?.locale?.language || this.hass?.language || "en",
      { tomorrow: this._t("tomorrow"), yesterday: this._t("yesterday") },
    );
  }

  private _momentOrEmpty(when?: string | null): string {
    return when ? this._moment(when) : "";
  }

  private _zonesToShow(): Zone[] {
    const wanted = this._config?.zones;
    if (!wanted || !wanted.length) return this._zones;
    return this._zones.filter((zone) => wanted.includes(zone.id));
  }

  private async _calculate(zone: Zone): Promise<void> {
    this._busy = zone.id;
    try {
      await this.hass.callApi("POST", `${DOMAIN}/zones`, {
        id: String(zone.id),
        calculate: true,
        override_cache: true,
      });
      await this._load();
    } finally {
      this._busy = null;
    }
  }

  private _nextStart(): TemplateResult | typeof nothingLine {
    if (!this._config?.show_next_start || !this._info) return nothingLine;
    const skipped = this._info.skip_preview?.should_skip;
    const start = this._info.next_irrigation_start;
    const label = skipped
      ? this._t("skipped")
      : start
        ? this._moment(start)
        : this._t("no_start");
    const reason = skipped ? this._info.skip_preview?.reason : null;
    return html`
      <div class="next ${skipped ? "held" : ""}">
        <ha-icon
          icon=${skipped ? "mdi:calendar-remove" : "mdi:calendar-clock"}
        ></ha-icon>
        <span class="next-label">${this._t("next_start")}</span>
        <span class="next-value">${label}${reason ? ` (${reason})` : ""}</span>
      </div>
    `;
  }

  private _zoneRow(zone: Zone): TemplateResult {
    const threshold = zone.irrigation_threshold ?? 0;
    const now = this._now(zone);
    const deficit = deficitOf(now.bucket);
    const needed = deficit > threshold && now.duration > 0;
    return html`
      <div class="zone">
        <div class="zone-name">
          ${zone.name}
          ${zone.state !== "automatic"
            ? html`<span class="chip">${this._t(zone.state)}</span>`
            : ""}
        </div>
        <div class="zone-state ${needed ? "needed" : ""}">
          ${deficit > 0
            ? this._t("short_by", { value: this._depth(deficit) })
            : this._t("no_need")}
          ${needed
            ? html`&middot;
              ${this._t("runs_for", {
                duration: this._duration(now.duration),
              })}`
            : ""}
          ${now.live
            ? html`<ha-icon
                class="live"
                icon="mdi:access-point"
                title=${this._t("live_since", {
                  when: this._momentOrEmpty(
                    this._info?.zone_estimates?.[String(zone.id)]?.since,
                  ),
                })}
              ></ha-icon>`
            : ""}
        </div>
        <div class="zone-last">
          ${zone.last_irrigation
            ? this._t("last_watered", {
                when: this._moment(zone.last_irrigation),
              })
            : this._t("never_watered")}
        </div>
        <ha-icon-button
          .disabled=${this._busy === zone.id}
          .label=${this._t("calculate")}
          @click=${() => this._calculate(zone)}
        >
          <ha-icon icon="mdi:calculator"></ha-icon>
        </ha-icon-button>
      </div>
    `;
  }

  protected render(): TemplateResult {
    if (!this._config || !this.hass) return html``;
    const zones = this._zonesToShow();
    return html`
      <ha-card .header=${this._config.title ?? this._t("title")}>
        <div class="content">
          ${this._nextStart()}
          ${zones.length
            ? zones.map((zone) => this._zoneRow(zone))
            : html`<div class="empty">${this._t("no_zones")}</div>`}
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    .content {
      padding: 0 16px 16px 16px;
    }
    .next {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 0 12px 0;
      border-bottom: 1px solid var(--divider-color);
      color: var(--secondary-text-color);
    }
    .next.held {
      color: var(--warning-color, var(--secondary-text-color));
    }
    .next-value {
      margin-left: auto;
      color: var(--primary-text-color);
    }
    .zone {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-areas: "name button" "state button" "last button";
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--divider-color);
    }
    .zone:last-child {
      border-bottom: none;
    }
    .zone-name {
      grid-area: name;
      font-weight: 500;
    }
    .zone-state {
      grid-area: state;
      color: var(--secondary-text-color);
    }
    .zone-state.needed {
      color: var(--primary-color);
    }
    .live {
      --mdc-icon-size: 14px;
      vertical-align: text-top;
      opacity: 0.55;
    }
    .zone-last {
      grid-area: last;
      color: var(--secondary-text-color);
      font-size: 0.85em;
    }
    ha-icon-button {
      grid-area: button;
      color: var(--secondary-text-color);
    }
    .chip {
      margin-left: 6px;
      padding: 1px 6px;
      border-radius: 10px;
      background: var(--divider-color);
      color: var(--secondary-text-color);
      font-size: 0.75em;
      font-weight: 400;
    }
    .empty {
      padding: 12px 0;
      color: var(--secondary-text-color);
    }
  `;
}

/** Lit renders nothing for an empty template, and this reads better inline. */
const nothingLine = html``;

// The visual card picker reads this list.
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "smart-irrigation-card",
  name: "Smart Irrigation",
  description:
    "What each zone is short of, how long it would run, and when the water goes on.",
  preview: true,
  documentationURL: "https://altmenorg.github.io/HAsmartirrigation/",
});
