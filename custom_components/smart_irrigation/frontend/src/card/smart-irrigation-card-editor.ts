/**
 * The card's visual editor.
 *
 * Without one, configuring the card means knowing its YAML keys, which is
 * exactly the kind of thing this card exists to avoid. It is built on Home
 * Assistant's own form element, so it looks like every other card's editor and
 * follows the theme.
 */
import { LitElement, html, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

const DOMAIN = "smart_irrigation";

interface EditorConfig {
  type: string;
  title?: string;
  zones?: number[];
  show_next_start?: boolean;
  compact?: boolean;
}

const LABELS: Record<string, Record<string, string>> = {
  en: {
    title: "Title",
    zones: "Zones (all of them when empty)",
    show_next_start: "Show the next start",
    compact: "Only the zones that would water",
  },
  fr: {
    title: "Titre",
    zones: "Zones (toutes si vide)",
    show_next_start: "Afficher le prochain départ",
    compact: "Seulement les zones qui arroseraient",
  },
};

@customElement("smart-irrigation-card-editor")
export class SmartIrrigationCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: any;
  @state() private _config: EditorConfig = {
    type: "custom:smart-irrigation-card",
  };
  @state() private _zones: { id: number; name: string }[] = [];

  public setConfig(config: EditorConfig): void {
    // The card's own defaults, so a switch does not read as off for something
    // the card is in fact doing.
    this._config = { show_next_start: true, compact: false, ...config };
  }

  protected updated(changed: Map<string, unknown>): void {
    if (changed.has("hass") && this.hass && !this._zones.length) {
      this._loadZones();
    }
  }

  private async _loadZones(): Promise<void> {
    try {
      const zones = await this.hass.callWS({ type: `${DOMAIN}/zones` });
      this._zones = (zones ?? []).map((zone: any) => ({
        id: zone.id,
        name: zone.name,
      }));
    } catch (_e) {
      // The zone picker then offers nothing, and the card shows every zone.
    }
  }

  private _label(key: string): string {
    const language = (this.hass?.language || "en").split("-")[0];
    return (LABELS[language] ?? LABELS.en)[key] ?? LABELS.en[key];
  }

  private get _schema() {
    return [
      { name: "title", selector: { text: {} } },
      {
        name: "zones",
        selector: {
          select: {
            multiple: true,
            mode: "list",
            options: this._zones.map((zone) => ({
              value: zone.id,
              label: zone.name,
            })),
          },
        },
      },
      { name: "show_next_start", selector: { boolean: {} } },
      { name: "compact", selector: { boolean: {} } },
    ];
  }

  private _valueChanged(event: CustomEvent): void {
    event.stopPropagation();
    const config = { ...this._config, ...event.detail.value };
    // An empty list means "every zone", and storing [] would say that less
    // clearly to anyone reading the YAML later.
    if (!config.zones?.length) delete config.zones;
    if (!config.title) delete config.title;
    this.dispatchEvent(
      new CustomEvent("config-changed", { detail: { config } }),
    );
  }

  protected render(): TemplateResult {
    if (!this.hass) return html``;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${this._schema}
        .computeLabel=${(field: { name: string }) => this._label(field.name)}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}
