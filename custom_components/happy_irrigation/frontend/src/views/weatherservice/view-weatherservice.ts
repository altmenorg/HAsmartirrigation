import { TemplateResult, LitElement, html, css, CSSResultGroup } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { mdiMenuDown } from "@mdi/js";
import { localize } from "../../../localize/localize";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { loadHaForm } from "../../load-ha-elements";
import { Path } from "../../common/navigation";
import {
  fetchWeatherService,
  setWeatherService,
  WeatherServiceInfo,
} from "../../data/websockets";

@customElement("happy-irrigation-view-weatherservice")
export class SmartIrrigationViewWeatherService extends LitElement {
  hass?: HomeAssistant;
  @property() narrow!: boolean;
  @property() path!: Path;

  @state() private _info?: WeatherServiceInfo;
  @state() private _use = false;
  @state() private _service: string | null = null;
  @state() private _apiKey = "";
  @state() private _loading = true;
  @state() private _saving = false;
  @state() private _error = "";
  @state() private _saved = false;

  firstUpdated() {
    loadHaForm().catch((error) => {
      console.error("Failed to load HA form:", error);
    });
    this._load();
  }

  private async _load(): Promise<void> {
    if (!this.hass) {
      return;
    }
    try {
      const info = await fetchWeatherService(this.hass);
      this._info = info;
      this._use = !!info.use_weather_service;
      this._service =
        info.weather_service ||
        (info.services && info.services.length ? info.services[0] : null);
      this._apiKey = info.weather_service_api_key || "";
      this._error = "";
    } catch (e) {
      this._error = this._errText(e);
    } finally {
      this._loading = false;
    }
  }

  private _errText(e: any): string {
    if (e && (e.message || e.code)) {
      return e.message || e.code;
    }
    return String(e);
  }

  private async _save(): Promise<void> {
    if (!this.hass) {
      return;
    }
    this._saving = true;
    this._error = "";
    this._saved = false;
    try {
      await setWeatherService(this.hass, {
        use_weather_service: this._use,
        weather_service: this._use ? this._service : null,
        weather_service_api_key: this._use ? this._apiKey : null,
      });
      this._saved = true;
      // Applied in-place on the backend; refresh the displayed state to confirm.
      window.setTimeout(() => this._load(), 800);
    } catch (e) {
      this._error = this._errText(e);
    } finally {
      this._saving = false;
    }
  }

  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }
    const lang = this.hass.language;

    if (this._loading && !this._info) {
      return html`
        <ha-card header="${localize("panels.weatherservice.title", lang)}">
          <div class="card-content">
            ${localize("common.loading-messages.general", lang)}...
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${localize("panels.weatherservice.title", lang)}">
        <div class="card-content ws-description">
          ${localize("panels.weatherservice.description", lang)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize(
                "panels.weatherservice.labels.use-weather-service",
                lang,
              )}
            </div>
            <ha-switch
              .checked=${this._use}
              @change=${(e: Event) => {
                this._use = (e.target as any).checked;
                this._saved = false;
              }}
            ></ha-switch>
          </div>

          ${this._use
            ? html`
                <div class="setting-row">
                  <div class="setting-label">
                    ${localize("panels.weatherservice.labels.service", lang)}
                  </div>
                  <div class="select-wrap">
                    <select
                      class="field"
                      @change=${(e: Event) => {
                        this._service = (e.target as HTMLSelectElement).value;
                        this._saved = false;
                      }}
                    >
                      ${(this._info?.services || []).map(
                        (s) =>
                          html`<option
                            value="${s}"
                            ?selected=${this._service === s}
                          >
                            ${s}
                          </option>`,
                      )}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${mdiMenuDown}></path>
                    </svg>
                  </div>
                </div>
                <div class="setting-row">
                  <div class="setting-label">
                    ${localize("panels.weatherservice.labels.api-key", lang)}
                  </div>
                  <input
                    class="field"
                    type="text"
                    autocomplete="off"
                    .value=${this._apiKey}
                    @change=${(e: Event) => {
                      this._apiKey = (e.target as HTMLInputElement).value;
                      this._saved = false;
                    }}
                  />
                </div>
              `
            : html`<div class="ws-note">
                ${localize("panels.weatherservice.messages.no-service", lang)}
              </div>`}
          ${this._error
            ? html`<div class="ws-msg ws-msg--error">${this._error}</div>`
            : ""}
          ${this._saved
            ? html`<div class="ws-msg ws-msg--success">
                ${localize("panels.weatherservice.messages.saved", lang)}
              </div>`
            : ""}

          <div class="ws-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._saving}
              @click=${this._save}
            >
              ${this._saving
                ? localize("panels.weatherservice.actions.saving", lang)
                : localize("panels.weatherservice.actions.save", lang)}
            </ha-button>
          </div>
          <div class="ws-note ws-reload-note">
            ${localize("panels.weatherservice.messages.reload-note", lang)}
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle} ${modernStyle}

      .ws-description {
        /* description toujours en couleur de texte primaire, comme l'intro des
           autres modules (pas de gris secondaire) */
        color: var(--primary-text-color);
        line-height: 1.4;
      }
      .ws-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 12px;
      }
      .ws-note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin-top: 8px;
      }
      .ws-reload-note {
        text-align: right;
      }
      .ws-msg {
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 0.95em;
      }
      .ws-msg--error {
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.12);
        color: var(--error-color);
      }
      .ws-msg--success {
        background: rgba(var(--rgb-success-color, 67, 160, 71), 0.16);
        color: var(--success-color, #2e7d32);
      }
    `;
  }
}
