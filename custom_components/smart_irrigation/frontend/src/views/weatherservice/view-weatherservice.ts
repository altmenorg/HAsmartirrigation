import { TemplateResult, LitElement, html, css, CSSResultGroup } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { mdiMenuDown, mdiRefresh } from "@mdi/js";
import moment from "moment";
import { localize } from "../../../localize/localize";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { loadHaForm } from "../../load-ha-elements";
import { Path } from "../../common/navigation";
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
  WEATHER_SERVICE_OPEN_METEO,
  WEATHER_SERVICE_OWM,
  WEATHER_SERVICES_NO_API_KEY,
} from "../../const";
import {
  fetchWeatherService,
  fetchWeatherServiceHistory,
  setWeatherService,
  WeatherServiceHistory,
  WeatherServiceInfo,
} from "../../data/websockets";

// How the weather values are shown in the history table. The values are stored
// in metric internally (see helpers.convert_mapping_to_metric), whatever the
// unit system of the panel is.
const HISTORY_FIELD_DISPLAY: Record<
  string,
  { unit: string; decimals: number }
> = {
  [MAPPING_TEMPERATURE]: { unit: UNIT_DEGREES_C, decimals: 1 },
  [MAPPING_MIN_TEMP]: { unit: UNIT_DEGREES_C, decimals: 1 },
  [MAPPING_MAX_TEMP]: { unit: UNIT_DEGREES_C, decimals: 1 },
  [MAPPING_DEWPOINT]: { unit: UNIT_DEGREES_C, decimals: 1 },
  [MAPPING_HUMIDITY]: { unit: UNIT_PERCENT, decimals: 0 },
  [MAPPING_PRESSURE]: { unit: UNIT_HPA, decimals: 0 },
  [MAPPING_WINDSPEED]: { unit: UNIT_MS, decimals: 1 },
  [MAPPING_SOLRAD]: { unit: UNIT_MJ_DAY_M2, decimals: 2 },
  [MAPPING_PRECIPITATION]: { unit: UNIT_MM, decimals: 2 },
  [MAPPING_CURRENT_PRECIPITATION]: { unit: UNIT_MMH, decimals: 2 },
  [MAPPING_EVAPOTRANSPIRATION]: { unit: UNIT_MM, decimals: 2 },
};

const HISTORY_LIMIT = 20;

@customElement("smart-irrigation-view-weatherservice")
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
      this._history = await fetchWeatherServiceHistory(
        this.hass,
        HISTORY_LIMIT,
      );
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
                ${this._service === WEATHER_SERVICE_OWM
                  ? html`<div class="ws-note ws-note--hint">
                      ${localize(
                        "panels.weatherservice.messages.owm-onecall-hint",
                        lang,
                      )}
                    </div>`
                  : ""}
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
        ${this._renderHistory(lang)}
      </ha-card>
    `;
  }

  /** Past retrievals of the weather service: when, and what came back. */
  private _renderHistory(lang: string): TemplateResult {
    const records = this._history?.records || [];
    // Only keep the columns that actually carry a value, so a setup that takes
    // just temperature from the service does not get nine empty columns.
    const fields = (this._history?.fields || []).filter((field) =>
      records.some(
        (record) =>
          record.values &&
          record.values[field] !== undefined &&
          record.values[field] !== null,
      ),
    );
    // The sensor group only matters when more than one takes weather data.
    const showGroup =
      new Set(records.map((record) => record.mapping_name)).size > 1;
    const columns = [
      "minmax(120px, auto)",
      ...(showGroup ? ["minmax(100px, auto)"] : []),
      ...fields.map(() => "minmax(76px, 1fr)"),
    ].join(" ");
    const lastRetrieved = records.length ? this._formatTime(records[0]) : "";

    return html`
      <div class="card-content ws-history">
        <div class="ws-history-head">
          <h4>${localize("panels.weatherservice.history.title", lang)}</h4>
          <ha-button
            appearance="plain"
            ?disabled=${this._historyLoading}
            @click=${this._loadHistory}
          >
            <ha-svg-icon slot="start" .path=${mdiRefresh}></ha-svg-icon>
            ${localize("panels.weatherservice.history.refresh", lang)}
          </ha-button>
        </div>
        ${lastRetrieved
          ? html`<div class="ws-note ws-history-last">
              ${localize("panels.weatherservice.history.last-update", lang)}:
              ${lastRetrieved}
            </div>`
          : ""}
        ${this._historyError
          ? html`<div class="ws-msg ws-msg--error">${this._historyError}</div>`
          : records.length === 0
            ? html`<div class="ws-note">
                ${this._historyLoading
                  ? localize("common.loading-messages.general", lang) + "..."
                  : localize("panels.weatherservice.history.no-data", lang)}
              </div>`
            : html`
                <div class="ws-history-scroll">
                  <div
                    class="weather-table"
                    style="grid-template-columns: ${columns};"
                  >
                    <div class="weather-header">
                      <span
                        >${localize(
                          "panels.weatherservice.history.time",
                          lang,
                        )}</span
                      >
                      ${showGroup
                        ? html`<span
                            >${localize(
                              "panels.weatherservice.history.sensor-group",
                              lang,
                            )}</span
                          >`
                        : ""}
                      ${fields.map(
                        (field) =>
                          html`<span
                            >${localize(
                              "panels.mappings.cards.mapping.items." +
                                field.toLowerCase(),
                              lang,
                            )}
                            <span class="ws-history-unit"
                              >${HISTORY_FIELD_DISPLAY[field]?.unit || ""}</span
                            ></span
                          >`,
                      )}
                    </div>
                    ${records.map(
                      (record) => html`
                        <div class="weather-row">
                          <span>${this._formatTime(record)}</span>
                          ${showGroup
                            ? html`<span>${record.mapping_name || "-"}</span>`
                            : ""}
                          ${fields.map(
                            (field) =>
                              html`<span
                                >${this._formatValue(
                                  field,
                                  record.values?.[field],
                                )}</span
                              >`,
                          )}
                        </div>
                      `,
                    )}
                  </div>
                </div>
              `}
      </div>
    `;
  }

  private _formatTime(record: { retrieved: string | null }): string {
    if (!record.retrieved) {
      return "-";
    }
    const stamp = moment(record.retrieved);
    return stamp.isValid() ? stamp.format("YYYY-MM-DD HH:mm") : "-";
  }

  private _formatValue(field: string, value?: number): string {
    if (value === undefined || value === null || isNaN(value)) {
      return "-";
    }
    return value.toFixed(HISTORY_FIELD_DISPLAY[field]?.decimals ?? 1);
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
      /* The table grows a column per weather value, so let it scroll sideways
         instead of squeezing the panel on a phone. */
      .ws-history-scroll {
        overflow-x: auto;
      }
      .ws-history-scroll .weather-table {
        min-width: 100%;
        width: max-content;
      }
      /* The unit is a span inside the header cell, so the global
         ".weather-header span" rule drew a second, narrower underline under it
         (#870). Only the cell itself is underlined. */
      .weather-header .ws-history-unit {
        display: block;
        padding: 0;
        background: none;
        border-bottom: none;
        font-weight: 400;
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
    `;
  }
}
