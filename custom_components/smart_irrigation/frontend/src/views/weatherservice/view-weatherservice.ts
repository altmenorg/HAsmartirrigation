import { TemplateResult, LitElement, html, css, CSSResultGroup } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { mdiMenuDown, mdiRefresh } from "@mdi/js";
import { localize } from "../../../localize/localize";
import { siStyle } from "../../styles/si-style";
import { loadHaForm } from "../../load-ha-elements";
import { exportPath, Path } from "../../common/navigation";
import {
  formatNumber,
  groupsWithRainFromService,
  localizedDateTime,
  navigate,
  runStartOptions,
} from "../../helpers";
import {
  MAPPING_CURRENT_PRECIPITATION,
  MAPPING_DEWPOINT,
  MAPPING_EVAPOTRANSPIRATION,
  MAPPING_HUMIDITY,
  MAPPING_MAX_TEMP,
  MAPPING_MIN_TEMP,
  MAPPING_PRECIPITATION,
  MAPPING_PRESSURE,
  MAPPING_SOLRAD,
  MAPPING_TEMPERATURE,
  MAPPING_WINDSPEED,
  UNIT_DEGREES_C,
  UNIT_HPA,
  UNIT_MJ_DAY_M2,
  UNIT_MM,
  UNIT_MMH,
  UNIT_MS,
  UNIT_PERCENT,
  WEATHER_SERVICE_HA,
  WEATHER_SERVICE_OPEN_METEO,
  WEATHER_SERVICE_OWM,
  WEATHER_SERVICES_NO_API_KEY,
  WEATHER_SERVICES_WITHOUT_RAIN,
} from "../../const";
import {
  fetchMappings,
  fetchWeatherService,
  fetchWeatherServiceHistory,
  setWeatherService,
  WeatherServiceHistory,
  WeatherServiceInfo,
} from "../../data/websockets";

@customElement("smart-irrigation-view-weatherservice")
export class SmartIrrigationViewWeatherService extends LitElement {
  hass?: HomeAssistant;
  @property() narrow!: boolean;
  @property() path!: Path;

  @state() private _info?: WeatherServiceInfo;
  @state() private _use = false;
  @state() private _service: string | null = null;
  @state() private _apiKey = "";
  @state() private _entity = "";
  @state() private _loading = true;
  @state() private _saving = false;
  @state() private _error = "";
  @state() private _saved = false;
  // The sensor groups still taking their rain from a service that has none,
  // found after saving such a service.
  @state() private _rainGroups: string[] = [];
  @state() private _history?: WeatherServiceHistory;
  @state() private _historyLoading = false;
  @state() private _historyError = "";

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
      // Default to Open-Meteo (keyless, worldwide) when nothing is configured
      // yet, rather than whatever happens to be first in the list.
      this._service =
        info.weather_service ||
        (info.services && info.services.includes(WEATHER_SERVICE_OPEN_METEO)
          ? WEATHER_SERVICE_OPEN_METEO
          : info.services && info.services.length
            ? info.services[0]
            : null);
      this._apiKey = info.weather_service_api_key || "";
      this._entity = info.weather_service_entity || "";
      this._error = "";
    } catch (e) {
      this._error = this._errText(e);
    } finally {
      this._loading = false;
    }
    this._loadHistory();
  }

  private async _loadHistory(): Promise<void> {
    if (!this.hass) {
      return;
    }
    this._historyLoading = true;
    try {
      this._history = await fetchWeatherServiceHistory(this.hass, 1);
      this._historyError = "";
    } catch (e) {
      this._historyError = this._errText(e);
    } finally {
      this._historyLoading = false;
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
    this._rainGroups = [];
    try {
      await setWeatherService(this.hass, {
        use_weather_service: this._use,
        weather_service: this._use ? this._service : null,
        weather_service_api_key: this._use ? this._apiKey : null,
        weather_service_entity:
          this._use && this._service === WEATHER_SERVICE_HA
            ? this._entity
            : null,
      });
      this._saved = true;
      this._rainGroups = await this._groupsLeftWithoutRain();
      // Applied in-place on the backend; refresh the displayed state to confirm.
      window.setTimeout(() => this._load(), 800);
    } catch (e: any) {
      // The one refusal the panel can explain in the user's language: an
      // entity that is gone or is not a weather entity.
      this._error =
        e?.code === "invalid_entity"
          ? localize(
              "panels.weatherservice.messages.invalid-entity",
              this.hass.language,
            )
          : this._errText(e);
    } finally {
      this._saving = false;
    }
  }

  /** A weather entity is the service but none is chosen yet: nothing to save. */
  private get _entityMissing(): boolean {
    return this._use && this._service === WEATHER_SERVICE_HA && !this._entity;
  }

  /**
   * With a service that reports no rain that fell, the groups whose rain was
   * left on it: nothing arrives there any more, and nothing else on screen
   * says so.
   */
  private async _groupsLeftWithoutRain(): Promise<string[]> {
    if (
      !this.hass ||
      !this._use ||
      !WEATHER_SERVICES_WITHOUT_RAIN.includes(this._service ?? "")
    ) {
      return [];
    }
    try {
      return groupsWithRainFromService(await fetchMappings(this.hass));
    } catch (e) {
      console.error("Weather service: could not read the sensor groups", e);
      return [];
    }
  }

  /** A number for reading, as the user's number setting writes it. */
  private _n(value: number, decimals: number): string {
    return formatNumber(
      value,
      decimals,
      (this.hass as any)?.locale,
      this.hass?.language,
    );
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
      <ha-card>
        <h1 class="card-header">
          <span
            >${localize("panels.weatherservice.title", lang)}<si-info
              >${localize("panels.weatherservice.description", lang)}</si-info
            ></span
          >
        </h1>
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
                            ${s === WEATHER_SERVICE_HA
                              ? localize(
                                  "panels.weatherservice.labels.ha-weather-entity",
                                  lang,
                                )
                              : s}
                          </option>`,
                      )}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${mdiMenuDown}></path>
                    </svg>
                  </div>
                </div>
                ${this._service &&
                WEATHER_SERVICES_NO_API_KEY.includes(this._service)
                  ? ""
                  : html`<div class="setting-row">
                      <div class="setting-label">
                        ${localize(
                          "panels.weatherservice.labels.api-key",
                          lang,
                        )}
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
                    </div>`}
                ${this._service === WEATHER_SERVICE_HA
                  ? html`<div class="setting-row">
                        <div class="setting-label">
                          ${localize(
                            "panels.weatherservice.labels.weather-entity",
                            lang,
                          )}
                        </div>
                        <ha-entity-picker
                          class="entity-field"
                          .hass=${this.hass}
                          .value=${this._entity}
                          .includeDomains=${["weather"]}
                          @value-changed=${(e: CustomEvent) => {
                            this._entity = e.detail?.value || "";
                            this._saved = false;
                          }}
                        ></ha-entity-picker>
                      </div>
                      <div class="si-note">
                        ${localize(
                          "panels.weatherservice.messages.ha-entity-hint",
                          lang,
                        )}
                      </div>`
                  : ""}
                ${this._service === WEATHER_SERVICE_OWM
                  ? html`<div class="si-note">
                      ${localize(
                        "panels.weatherservice.messages.owm-onecall-hint",
                        lang,
                      )}
                    </div>`
                  : ""}
              `
            : html`<div class="si-note">
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
          ${this._saved && this._rainGroups.length
            ? html`<div class="ws-msg ws-msg--warning">
                ${localize(
                  "panels.weatherservice.messages.rain-groups-on-service",
                  lang,
                  "{count}",
                  this._rainGroups.length,
                  "{groups}",
                  this._rainGroups.join(", "),
                )}
                <div class="ws-msg-actions">
                  <ha-button
                    appearance="plain"
                    @click=${() => navigate(this, exportPath("mappings"))}
                  >
                    ${localize(
                      "panels.weatherservice.actions.open-sensor-groups",
                      lang,
                    )}
                  </ha-button>
                </div>
              </div>`
            : ""}
          ${this._use || this._info?.use_weather_service
            ? this._renderSave(lang)
            : ""}
        </div>
        ${this._info?.use_weather_service ? this._renderHistory(lang) : ""}
      </ha-card>
    `;
  }

  /**
   * Save, and what saving does. Without a service there is nothing to save,
   * unless one was in use and is being turned off.
   */
  private _renderSave(lang: string): TemplateResult {
    return html`
      <div class="ws-actions">
        <ha-button
          appearance="filled"
          ?disabled=${this._saving || this._entityMissing}
          @click=${this._save}
        >
          ${this._saving
            ? localize("panels.weatherservice.actions.saving", lang)
            : localize("panels.weatherservice.actions.save", lang)}
        </ha-button>
      </div>
      ${this._use
        ? html`<div class="si-note ws-reload-note">
            ${localize(
              this._service === WEATHER_SERVICE_HA
                ? "panels.weatherservice.messages.reload-note-entity"
                : "panels.weatherservice.messages.reload-note",
              lang,
            )}
          </div>`
        : ""}
    `;
  }

  /** When the service was last read, and a way to read it again: the
   *  readings themselves are in each sensor group's table. */
  private _renderHistory(lang: string): TemplateResult {
    const last = this._history?.records?.[0];
    return html`
      <div class="card-content ws-history">
        <div class="ws-history-head">
          <span>
            ${this._historyError
              ? this._historyError
              : last
                ? html`${localize(
                    "panels.weatherservice.history.last-update",
                    lang,
                  )}:
                  ${this._formatTime(last)}`
                : localize("panels.weatherservice.history.no-data", lang)}
          </span>
          <ha-button
            appearance="plain"
            ?disabled=${this._historyLoading}
            @click=${this._loadHistory}
          >
            <ha-svg-icon slot="start" .path=${mdiRefresh}></ha-svg-icon>
            ${localize("panels.weatherservice.history.refresh", lang)}
          </ha-button>
        </div>
        <div class="si-hint">
          ${localize("panels.weatherservice.history.see-groups", lang)}
          <a
            href=${exportPath("mappings")}
            @click=${(e: Event) => {
              e.preventDefault();
              navigate(this, exportPath("mappings"));
            }}
            >${localize(
              "panels.weatherservice.actions.open-sensor-groups",
              lang,
            )}</a
          >
        </div>
      </div>
    `;
  }

  private _formatTime(record: { retrieved: string | null }): string {
    if (!record.retrieved) {
      return "-";
    }
    return localizedDateTime(
      record.retrieved,
      this.hass,
      runStartOptions(record.retrieved),
    );
  }

  static get styles(): CSSResultGroup {
    return css`
      ${siStyle}

      .ws-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 12px;
      }

      .ws-reload-note {
        /* Read as text, from the left like every note (#1059). */
        text-align: start;
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
      .ws-msg--warning {
        background: rgba(var(--rgb-warning-color, 255, 166, 0), 0.16);
        color: var(--primary-text-color);
      }
      .ws-msg-actions {
        margin-top: 6px;
      }
      .ws-msg--success {
        background: rgba(var(--rgb-success-color, 67, 160, 71), 0.16);
        color: var(--success-color, #2e7d32);
      }
      .ws-history {
        border-top: 1px solid var(--divider-color);
      }
      .ws-history-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .ws-history-head h4 {
        margin: 0;
        font-size: 1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .ws-history-last {
        margin-top: 0;
        margin-bottom: 8px;
      }
    `;
  }
}
