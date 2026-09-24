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

const DOMAIN = "smart_irrigation";

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
    runs_for: "runs {duration}",
    never_watered: "never watered",
    last_watered: "last watered {when}",
    calculate: "Calculate now",
    manual: "manual",
    disabled: "disabled",
    no_zones: "No zones yet. Open the Smart Irrigation panel to add one.",
    tomorrow: "tomorrow",
    yesterday: "yesterday",
  },
  fr: {
    title: "Smart Irrigation",
    next_start: "Prochain départ",
    no_start: "Aucun départ prévu",
    skipped: "Reporté",
    short_by: "déficit {value}",
    no_need: "pas d'arrosage nécessaire",
    runs_for: "arrose {duration}",
    never_watered: "jamais arrosé",
    last_watered: "dernier arrosage {when}",
    calculate: "Calculer maintenant",
    manual: "manuel",
    disabled: "désactivé",
    no_zones: "Aucune zone. Ouvrez le panneau Smart Irrigation pour en créer une.",
    tomorrow: "demain",
    yesterday: "hier",
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
    return { type: `custom:${DOMAIN}-card`, show_next_start: true };
  }

  public setConfig(config: CardConfig): void {
    this._config = { show_next_start: true, ...config };
  }

  public getCardSize(): number {
    return 1 + Math.max(this._zones.length, 1);
  }

  public connectedCallback(): void {
    super.connectedCallback();
    // The panel writes through the same event, so an edit there shows here
    // without a reload. The timer is for the clock alone: "next start" moves
    // on its own.
    this._timer = window.setInterval(() => this._load(), 60000);
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._timer) window.clearInterval(this._timer);
    this._unsubscribe?.();
    this._unsubscribe = undefined;
  }

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
      const [zones, info] = await Promise.all([
        this.hass.callWS({ type: `${DOMAIN}/zones` }),
        this._config?.show_next_start
          ? this.hass.callWS({ type: `${DOMAIN}/info` })
          : Promise.resolve(null),
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

  /** A depth in the unit the viewer's Home Assistant shows lengths in. */
  private _depth(mm: number): string {
    const imperial = this.hass?.config?.unit_system?.length === "mi";
    return imperial ? `${(mm / 25.4).toFixed(2)} in` : `${mm.toFixed(1)} mm`;
  }

  /**
   * A deficit worth naming. A zone that has just watered sits a hair below
   * zero, and "short 0.0 mm" is a worse answer than "no watering needed".
   */
  private _deficit(zone: Zone): number {
    const deficit = zone.bucket < 0 ? -zone.bucket : 0;
    return deficit >= 0.05 ? deficit : 0;
  }

  private _duration(seconds: number): string {
    const total = Math.round(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const parts = h ? [h, m, s] : [m, s];
    return parts
      .map((part, index) => (index ? String(part).padStart(2, "0") : String(part)))
      .join(":");
  }

  /** A moment as a dashboard shows one: the day when it is not today, and
   * the time to the minute. Seconds are noise on a card. */
  private _moment(when: string): string {
    const date = new Date(when);
    if (isNaN(date.getTime())) return when;
    const language = this.hass?.locale?.language || this.hass?.language || "en";
    const time = date.toLocaleTimeString(language, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const days = Math.floor(
      (date.getTime() - midnight.getTime()) / (24 * 3600 * 1000),
    );
    if (days === 0) return time;
    if (days === 1) return `${this._t("tomorrow")} ${time}`;
    if (days === -1) return `${this._t("yesterday")} ${time}`;
    return `${date.toLocaleDateString(language, {
      day: "numeric",
      month: "short",
    })} ${time}`;
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
        <ha-icon icon=${skipped ? "mdi:calendar-remove" : "mdi:calendar-clock"}></ha-icon>
        <span class="next-label">${this._t("next_start")}</span>
        <span class="next-value">${label}${reason ? ` (${reason})` : ""}</span>
      </div>
    `;
  }

  private _zoneRow(zone: Zone): TemplateResult {
    const threshold = zone.irrigation_threshold ?? 0;
    const deficit = this._deficit(zone);
    const needed = deficit > threshold && zone.duration > 0;
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
            ? html`&middot; ${this._t("runs_for", {
                duration: this._duration(zone.duration),
              })}`
            : ""}
        </div>
        <div class="zone-last">
          ${zone.last_irrigation
            ? this._t("last_watered", { when: this._moment(zone.last_irrigation) })
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
