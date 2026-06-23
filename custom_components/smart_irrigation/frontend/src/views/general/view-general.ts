import { CSSResultGroup, LitElement, TemplateResult, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant, fireEvent } from "custom-card-helpers";
import { UnsubscribeFunc } from "home-assistant-js-websocket";

import { fetchConfig, saveConfig } from "../../data/websockets";
import { SubscribeMixin } from "../../subscribe-mixin";
import { localize } from "../../../localize/localize";
import { output_unit, pick, handleError } from "../../helpers";
import { loadHaForm } from "../../load-ha-elements";
import "../../dialogs/trigger-dialog";
import { SmartIrrigationConfig, IrrigationStartTrigger } from "../../types";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { Path } from "../../common/navigation";
import {
  AUTO_UPDATE_SCHEDULE_DAILY,
  AUTO_UPDATE_SCHEDULE_HOURLY,
  AUTO_UPDATE_SCHEDULE_MINUTELY,
  CONF_AUTO_CALC_ENABLED,
  CONF_AUTO_CLEAR_ENABLED,
  CONF_AUTO_UPDATE_ENABLED,
  CONF_AUTO_UPDATE_INTERVAL,
  CONF_AUTO_UPDATE_SCHEDULE,
  CONF_AUTO_UPDATE_TIME,
  CONF_CALC_TIME,
  CONF_CLEAR_TIME,
  CONF_CONTINUOUS_UPDATES,
  CONF_SENSOR_DEBOUNCE,
  CONF_IRRIGATION_START_TRIGGERS,
  CONF_SKIP_IRRIGATION_ON_PRECIPITATION,
  CONF_PRECIPITATION_THRESHOLD_MM,
  CONF_MANUAL_COORDINATES_ENABLED,
  CONF_MANUAL_LATITUDE,
  CONF_MANUAL_LONGITUDE,
  CONF_MANUAL_ELEVATION,
  CONF_DAYS_BETWEEN_IRRIGATION,
  TRIGGER_TYPE_SUNRISE,
  TRIGGER_TYPE_SUNSET,
  TRIGGER_TYPE_SOLAR_AZIMUTH,
  DOMAIN,
} from "../../const";
import { mdiPlus, mdiPencil, mdiDelete, mdiMenuDown, mdiMinus } from "@mdi/js";

@customElement("smart-irrigation-view-general")
export class SmartIrrigationViewGeneral extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() narrow!: boolean;
  @property() path!: Path;

  @property() data?: Partial<SmartIrrigationConfig>;
  @property() config?: SmartIrrigationConfig;

  @property({ type: Boolean })
  private isLoading = true;

  @property({ type: Boolean })
  private isSaving = false;

  // True once the first data load has completed. Avoids replacing the whole
  // form with a "loading" indicator on every background refresh, which dropped
  // focus and reset scroll while editing.
  private _hasLoadedOnce = false;

  // Set just before an inline-edit save to ignore the _config_updated echo our
  // own write triggers. External changes still refresh normally.
  private _suppressNextConfigUpdate = false;

  // Prevent excessive re-renders
  private _updateScheduled = false;
  private _scheduleUpdate() {
    if (this._updateScheduled) return;
    this._updateScheduled = true;
    requestAnimationFrame(() => {
      this._updateScheduled = false;
      this.requestUpdate();
    });
  }

  // Debounced save operation for better performance
  private debouncedSave = (() => {
    let timeoutId: number | null = null;
    return (changes: Partial<SmartIrrigationConfig>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        this.saveData(changes);
        timeoutId = null;
      }, 500); // 500ms debounce
    };
  })();

  public hassSubscribe(): Promise<UnsubscribeFunc>[] {
    // Initial data fetch for UI setup with proper error handling
    this._fetchData().catch((error) => {
      console.error("Failed to fetch initial data:", error);
    });

    return [
      this.hass!.connection.subscribeMessage(
        () => {
          // Ignore the echo of our own inline-edit save (see _suppressNextConfigUpdate).
          if (this._suppressNextConfigUpdate) {
            this._suppressNextConfigUpdate = false;
            return;
          }
          // Update data when notified of changes with proper error handling
          this._fetchData().catch((error) => {
            console.error("Failed to fetch data on config update:", error);
          });
        },
        {
          type: DOMAIN + "_config_updated",
        },
      ),
    ];
  }

  private async _fetchData(): Promise<void> {
    if (!this.hass) {
      return;
    }

    // Only show the loading indicator on the very first load; background
    // refreshes must not replace the form (focus/scroll loss).
    if (!this._hasLoadedOnce) {
      this.isLoading = true;
      this._scheduleUpdate();
    }

    try {
      this.config = await fetchConfig(this.hass);
      this.data = pick(this.config, [
        CONF_CALC_TIME,
        CONF_AUTO_CALC_ENABLED,
        CONF_AUTO_UPDATE_ENABLED,
        CONF_AUTO_UPDATE_SCHEDULE,
        CONF_AUTO_UPDATE_TIME,
        CONF_AUTO_UPDATE_INTERVAL,
        CONF_AUTO_CLEAR_ENABLED,
        CONF_CLEAR_TIME,
        CONF_CONTINUOUS_UPDATES,
        CONF_SENSOR_DEBOUNCE,
        CONF_MANUAL_COORDINATES_ENABLED,
        CONF_MANUAL_LATITUDE,
        CONF_MANUAL_LONGITUDE,
        CONF_MANUAL_ELEVATION,
        CONF_DAYS_BETWEEN_IRRIGATION,
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error gracefully - keep existing data if fetch fails
    } finally {
      this.isLoading = false;
      this._hasLoadedOnce = true;
      this._scheduleUpdate();
    }
  }

  firstUpdated() {
    // Load HA form elements in background without blocking UI
    loadHaForm().catch((error) => {
      console.error("Failed to load HA form:", error);
    });
  }

  render() {
    if (!this.hass || !this.config || !this.data) {
      return html`<div class="loading-indicator">
        ${localize(
          "common.loading-messages.configuration",
          this.hass?.language ?? "en",
        )}
      </div>`;
    }

    if (this.isLoading) {
      return html`<div class="loading-indicator">
        ${localize("common.loading-messages.general", this.hass.language)}
      </div>`;
    } else {
      let r1 = html` <div class="card-content">
          ${localize(
            "panels.general.cards.automatic-duration-calculation.description",
            this.hass.language,
          )}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize(
                "panels.general.cards.automatic-duration-calculation.labels.auto-calc-enabled",
                this.hass.language,
              )}
            </div>
            <ha-switch
              .checked=${this.config.autocalcenabled}
              @change=${(e: Event) =>
                this.handleConfigChange({
                  autocalcenabled: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>
        </div>`;
      if (this.data.autocalcenabled) {
        r1 = html`${r1}
          <div class="card-content">
            ${this._timeRow(
              localize(
                "panels.general.cards.automatic-duration-calculation.labels.calc-time",
                this.hass.language,
              ),
              this.config.calctime,
              (v) => this.handleConfigChange({ calctime: v }),
            )}
          </div>`;
      }
      r1 = html`<ha-card
        header="${localize(
          "panels.general.cards.automatic-duration-calculation.header",
          this.hass.language,
        )}"
      >
        ${r1}</ha-card
      >`;
      let r2 = html` <div class="card-content">
          ${localize(
            "panels.general.cards.automatic-update.description",
            this.hass.language,
          )}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize(
                "panels.general.cards.automatic-update.labels.auto-update-enabled",
                this.hass.language,
              )}
            </div>
            <ha-switch
              .checked=${this.config.autoupdateenabled}
              @change=${(e: Event) =>
                this.saveData({
                  autoupdateenabled: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>
        </div>`;
      if (this.data.autoupdateenabled) {
        r2 = html`${r2}
          <div class="card-content">
            <div class="setting-row">
              <div class="setting-label">
                ${localize(
                  "panels.general.cards.automatic-update.labels.auto-update-interval",
                  this.hass.language,
                )}
              </div>
              <div class="combo-field">
                <input
                  class="field combo-num"
                  type="number"
                  min="1"
                  step="1"
                  .value=${this.data.autoupdateinterval ?? ""}
                  @change=${(e: Event) =>
                    this.saveData({
                      autoupdateinterval: parseInt(
                        (e.target as HTMLInputElement).value,
                      ),
                    })}
                />
                <div class="select-wrap">
                  <select
                    class="field"
                    @change=${(e: Event) =>
                      this.saveData({
                        autoupdateschedule: (e.target as HTMLSelectElement)
                          .value,
                      })}
                  >
                    <option
                      value="${AUTO_UPDATE_SCHEDULE_MINUTELY}"
                      ?selected=${this.data.autoupdateschedule ===
                      AUTO_UPDATE_SCHEDULE_MINUTELY}
                    >
                      ${localize(
                        "panels.general.cards.automatic-update.options.minutes",
                        this.hass.language,
                      )}
                    </option>
                    <option
                      value="${AUTO_UPDATE_SCHEDULE_HOURLY}"
                      ?selected=${this.data.autoupdateschedule ===
                      AUTO_UPDATE_SCHEDULE_HOURLY}
                    >
                      ${localize(
                        "panels.general.cards.automatic-update.options.hours",
                        this.hass.language,
                      )}
                    </option>
                    <option
                      value="${AUTO_UPDATE_SCHEDULE_DAILY}"
                      ?selected=${this.data.autoupdateschedule ===
                      AUTO_UPDATE_SCHEDULE_DAILY}
                    >
                      ${localize(
                        "panels.general.cards.automatic-update.options.days",
                        this.hass.language,
                      )}
                    </option>
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${mdiMenuDown}></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>`;
      }
      if (this.data.autoupdateenabled) {
        r2 = html`${r2}
          <div class="card-content">
            ${this._numRow(
              localize(
                "panels.general.cards.automatic-update.labels.auto-update-delay",
                this.hass.language,
              ),
              "s",
              this.config.autoupdatedelay,
              (v) => this.saveData({ autoupdatedelay: parseInt(v) }),
              1,
            )}
          </div>`;
      }

      r2 = html`<ha-card header="${localize(
        "panels.general.cards.automatic-update.header",
        this.hass.language,
      )}",
      this.hass.language)}">${r2}</ha-card>`;

      let r3 = html` <div class="card-content">
          ${localize(
            "panels.general.cards.automatic-clear.description",
            this.hass.language,
          )}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize(
                "panels.general.cards.automatic-clear.labels.automatic-clear-enabled",
                this.hass.language,
              )}
            </div>
            <ha-switch
              .checked=${this.config.autoclearenabled}
              @change=${(e: Event) =>
                this.handleConfigChange({
                  autoclearenabled: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>
        </div>`;
      if (this.data.autoclearenabled) {
        r3 = html`${r3}
          <div class="card-content">
            ${this._timeRow(
              localize(
                "panels.general.cards.automatic-clear.labels.automatic-clear-time",
                this.hass.language,
              ),
              this.config.cleardatatime,
              (v) => this.handleConfigChange({ cleardatatime: v }),
            )}
          </div>`;
      }
      r3 = html`<ha-card
        header="${localize(
          "panels.general.cards.automatic-clear.header",
          this.hass.language,
        )}"
        >${r3}</ha-card
      >`;

      let r4 = html`<div class="card-content">
          ${localize(
            "panels.general.cards.continuousupdates.description",
            this.hass.language,
          )}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize(
                "panels.general.cards.continuousupdates.labels.continuousupdates",
                this.hass.language,
              )}
            </div>
            <ha-switch
              .checked=${this.config.continuousupdates}
              @change=${(e: Event) =>
                this.handleConfigChange({
                  continuousupdates: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>
        </div>`;
      if (this.data.continuousupdates) {
        r4 = html`${r4}
          <div class="card-content">
            ${this._numRow(
              localize(
                "panels.general.cards.continuousupdates.labels.sensor_debounce",
                this.hass.language,
              ),
              "ms",
              this.config.sensor_debounce,
              (v) => this.handleConfigChange({ sensor_debounce: parseInt(v) }),
              1,
            )}
          </div>`;
      }
      r4 = html`<ha-card
        header="${localize(
          "panels.general.cards.continuousupdates.header",
          this.hass.language,
        )}"
        >${r4}</ha-card
      > `;

      // Irrigation Start Triggers Card
      const r5 = this.renderTriggersCard();

      // Weather-based Skip Card
      const r6 = this.renderWeatherSkipCard();

      // Coordinate Configuration Card
      const r7 = this.renderCoordinateCard();

      // Days Between Irrigation Card
      const r8 = this.renderDaysBetweenIrrigationCard();

      // Observed Watering (closed-loop bucket) Card
      const r9 = this.renderObservedWateringCard();

      const r = html`<ha-card
          header="${localize("panels.general.title", this.hass.language)}"
        >
          <div class="card-content">
            ${localize("panels.general.description", this.hass.language)}
          </div> </ha-card
        >${r2}${r1}${r3}${r4}${r5}${r6}${r7}${r8}${r9}`;

      return r;
    }
  }

  renderTriggersCard() {
    if (!this.config || !this.data || !this.hass) return html``;

    const triggers = this.config.irrigation_start_triggers || [];

    return html`
      <ha-card
        header="${localize(
          "irrigation_start_triggers.title",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          ${localize(
            "irrigation_start_triggers.description",
            this.hass.language,
          )}
        </div>

        <div class="card-content trigger-usage">
          ${localize(
            "irrigation_start_triggers.usage_before",
            this.hass.language,
          )}
          <code>smart_irrigation_start_irrigation_all_zones</code>${localize(
            "irrigation_start_triggers.usage_after",
            this.hass.language,
          )}
        </div>

        <div class="card-content">
          <div class="triggers-list">
            ${triggers.length === 0
              ? html`
                  <div class="no-triggers">
                    ${localize(
                      "irrigation_start_triggers.no_triggers",
                      this.hass.language,
                    )}
                  </div>
                `
              : triggers.map((trigger, index) =>
                  this.renderTriggerItem(trigger, index),
                )}
          </div>

          <div class="add-trigger-section">
            ${this._actionBtn(
              mdiPlus,
              localize(
                "irrigation_start_triggers.add_trigger",
                this.hass.language,
              ),
              () => this._addTrigger(),
            )}
          </div>
        </div>
      </ha-card>
    `;
  }

  renderTriggerItem(trigger: IrrigationStartTrigger, index: number) {
    if (!this.hass) return html``;

    const triggerTypeLabel = localize(
      `irrigation_start_triggers.trigger_types.${trigger.type}`,
      this.hass.language,
    );

    let offsetText = "";
    if (trigger.type === TRIGGER_TYPE_SUNRISE && trigger.offset_minutes === 0) {
      offsetText = localize(
        "irrigation_start_triggers.offset_auto",
        this.hass.language,
      );
    } else {
      const minutes = Math.abs(trigger.offset_minutes);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const direction =
        trigger.offset_minutes < 0
          ? localize("common.labels.before", this.hass.language)
          : localize("common.labels.after", this.hass.language);

      if (hours > 0) {
        offsetText = `${hours}h ${mins}m ${direction}`;
      } else {
        offsetText = `${mins}m ${direction}`;
      }
    }

    let additionalInfo = "";
    if (
      trigger.type === TRIGGER_TYPE_SOLAR_AZIMUTH &&
      trigger.azimuth_angle !== undefined
    ) {
      additionalInfo = ` (${trigger.azimuth_angle}°)`;
    }

    return html`
      <div class="trigger-item ${trigger.enabled ? "enabled" : "disabled"}">
        <div class="trigger-main">
          <div class="trigger-info">
            <div class="trigger-name">${trigger.name}</div>
            <div class="trigger-details">
              ${triggerTypeLabel}${additionalInfo} - ${offsetText}
            </div>
          </div>
          <div class="trigger-status">
            ${trigger.enabled
              ? localize("common.labels.enabled", this.hass.language)
              : localize("common.labels.disabled", this.hass.language)}
          </div>
        </div>
        <div class="trigger-actions">
          <ha-icon-button
            .path="${mdiPencil}"
            @click="${() => this._editTrigger(index)}"
            title="${localize(
              "irrigation_start_triggers.edit_trigger",
              this.hass.language,
            )}"
          ></ha-icon-button>
          <ha-icon-button
            .path="${mdiDelete}"
            @click="${() => this._deleteTrigger(index)}"
            title="${localize(
              "irrigation_start_triggers.delete_trigger",
              this.hass.language,
            )}"
          ></ha-icon-button>
        </div>
      </div>
    `;
  }

  private _addTrigger() {
    this._showTriggerDialog({ createTrigger: true });
  }

  private _editTrigger(index: number) {
    const trigger = this.config?.irrigation_start_triggers?.[index];
    if (trigger) {
      this._showTriggerDialog({
        trigger: trigger,
        triggerIndex: index,
      });
    }
  }

  private _deleteTrigger(index: number) {
    if (!this.config?.irrigation_start_triggers || !this.hass) return;

    const triggerName =
      this.config.irrigation_start_triggers[index]?.name || "Unknown";
    if (
      confirm(
        localize(
          "irrigation_start_triggers.confirm_delete",
          this.hass.language,
        ).replace("{name}", triggerName),
      )
    ) {
      const triggers = [...this.config.irrigation_start_triggers];
      triggers.splice(index, 1);
      // Optimistic update + immediate save so the list refreshes without a
      // reload (it renders from this.config; handleConfigChange only touched
      // this.data, debounced).
      this.config = { ...this.config, irrigation_start_triggers: triggers };
      this.saveData({ [CONF_IRRIGATION_START_TRIGGERS]: triggers }).catch(
        (err) => {
          console.error("Error saving triggers:", err);
          this._fetchData().catch(() => {});
        },
      );
    }
  }

  private async _showTriggerDialog(params: any) {
    if (!this.hass) return;

    const dialog = document.createElement(
      "smart-irrigation-trigger-dialog",
    ) as any;
    dialog.hass = this.hass;

    dialog.addEventListener("trigger-save", (event: any) => {
      this._handleTriggerSave(event.detail);
    });

    dialog.addEventListener("trigger-delete", (event: any) => {
      this._handleTriggerDelete(event.detail);
    });

    // Add to DOM and show dialog
    document.body.appendChild(dialog);
    await dialog.showDialog(params);

    // Clean up when dialog closes
    dialog.addEventListener("closed", (ev: Event) => {
      // Only react when the closed event originates from the dialog itself.
      // Ignore "closed" emitted by nested overlays (ha-select).
      const origin = ev.target as Element | null;
      if (!origin) return;
      if (origin.tagName.toLowerCase() !== "ha-dialog") {
        return;
      }

      document.body.removeChild(dialog);
    });

    /*fireEvent(this, "show-dialog", {
      dialogTag: "smart-irrigation-trigger-dialog",
      dialogImport: () => import("../../dialogs/trigger-dialog"),
      dialogParams: params,
    });*/
  }

  private _handleTriggerSave(detail: any) {
    if (!this.config) return;

    const triggers = this.config.irrigation_start_triggers
      ? [...this.config.irrigation_start_triggers]
      : [];

    if (detail.isNew) {
      triggers.push(detail.trigger);
    } else if (detail.index !== undefined) {
      triggers[detail.index] = detail.trigger;
    }

    // Optimistic update so UI immediately reflects change
    this.config = { ...this.config, irrigation_start_triggers: triggers };

    // Save immediately (no debounce) to avoid stale data if dialog is reopened quickly
    this.saveData({ [CONF_IRRIGATION_START_TRIGGERS]: triggers }).catch(
      (err) => {
        console.error("Error saving triggers:", err);
        // Optionally re-fetch data on error to restore authoritative state
        this._fetchData().catch(() => {});
      },
    );
  }

  private _handleTriggerDelete(detail: any) {
    if (!this.config?.irrigation_start_triggers || detail.index === undefined)
      return;

    const triggers = [...this.config.irrigation_start_triggers];
    triggers.splice(detail.index, 1);
    // Optimistic update + immediate save (same path as _handleTriggerSave) so
    // the list refreshes without a page reload. handleConfigChange only updated
    // this.data (debounced), but the trigger list renders from this.config.
    this.config = { ...this.config, irrigation_start_triggers: triggers };
    this.saveData({ [CONF_IRRIGATION_START_TRIGGERS]: triggers }).catch(
      (err) => {
        console.error("Error saving triggers:", err);
        this._fetchData().catch(() => {});
      },
    );
  }

  renderWeatherSkipCard() {
    if (!this.config || !this.data || !this.hass) return html``;

    return html`
      <ha-card header="${localize("weather_skip.title", this.hass.language)}">
        <div class="card-content">
          ${localize("weather_skip.description", this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize("weather_skip.title", this.hass.language)}
            </div>
            <ha-switch
              .checked=${this.config.skip_irrigation_on_precipitation}
              @change=${(e: Event) =>
                this.handleConfigChange({
                  skip_irrigation_on_precipitation: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>

          ${this.config.skip_irrigation_on_precipitation
            ? this._numRow(
                localize("weather_skip.threshold_label", this.hass.language),
                output_unit(this.config, CONF_PRECIPITATION_THRESHOLD_MM),
                this.config.precipitation_threshold_mm,
                (v) =>
                  this.handleConfigChange({
                    precipitation_threshold_mm: parseFloat(v),
                  }),
                0.1,
              )
            : ""}
        </div>
      </ha-card>
    `;
  }

  renderObservedWateringCard() {
    if (!this.config || !this.data || !this.hass) return html``;
    const lang = this.hass.language;

    return html`
      <ha-card header="${localize("observed_watering.title", lang)}">
        <div class="card-content">
          ${localize("observed_watering.description", lang)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize("observed_watering.enabled_label", lang)}
            </div>
            <ha-switch
              .checked=${this.config.observed_watering_enabled}
              @change=${(e: Event) =>
                this.handleConfigChange({
                  observed_watering_enabled: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>

          <div class="setting-row">
            <div class="setting-label">
              ${localize("observed_watering.direct_control_label", lang)}
            </div>
            <ha-switch
              .checked=${this.config.direct_valve_control_enabled}
              @change=${(e: Event) =>
                this.handleConfigChange({
                  direct_valve_control_enabled: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>

          ${this.config.direct_valve_control_enabled
            ? html`
                <div class="card-content">
                  ${localize(
                    "observed_watering.direct_control_description",
                    lang,
                  )}
                </div>
                <div class="setting-row">
                  <div class="setting-label">
                    ${localize("observed_watering.sequencing_label", lang)}
                  </div>
                  <select
                    class="field"
                    @change=${(e: Event) =>
                      this.handleConfigChange({
                        zone_sequencing: (e.target as HTMLSelectElement).value,
                      })}
                  >
                    <option
                      value="sequential"
                      ?selected=${this.config.zone_sequencing === "sequential"}
                    >
                      ${localize(
                        "observed_watering.sequencing.sequential",
                        lang,
                      )}
                    </option>
                    <option
                      value="parallel"
                      ?selected=${this.config.zone_sequencing === "parallel"}
                    >
                      ${localize("observed_watering.sequencing.parallel", lang)}
                    </option>
                  </select>
                </div>
              `
            : ""}
        </div>
      </ha-card>
    `;
  }

  renderCoordinateCard() {
    if (!this.config || !this.data || !this.hass) return html``;

    // Get current Home Assistant coordinates for display
    const haCoords = this.hass.config as any;
    const haLatitude = haCoords?.latitude || 0;
    const haLongitude = haCoords?.longitude || 0;
    const haElevation = haCoords?.elevation || 0;

    return html`
      <ha-card
        header="${localize("coordinate_config.title", this.hass.language)}"
      >
        <div class="card-content">
          ${localize("coordinate_config.description", this.hass.language)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize(
                "coordinate_config.manual_enabled",
                this.hass.language,
              )}
            </div>
            <ha-switch
              .checked=${this.data.manual_coordinates_enabled}
              @change=${(e: Event) =>
                this.saveData({
                  manual_coordinates_enabled: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>
            <div class="card-content">
            ${
              this.data.manual_coordinates_enabled
                ? html`
                    ${this._numRow(
                      localize(
                        "coordinate_config.latitude",
                        this.hass.language,
                      ),
                      "",
                      this.data.manual_latitude || haLatitude,
                      (v) =>
                        this.handleConfigChange({
                          manual_latitude: parseFloat(v),
                        }),
                      0.1,
                    )}
                    ${this._numRow(
                      localize(
                        "coordinate_config.longitude",
                        this.hass.language,
                      ),
                      "",
                      this.data.manual_longitude || haLongitude,
                      (v) =>
                        this.handleConfigChange({
                          manual_longitude: parseFloat(v),
                        }),
                      0.1,
                    )}
                    ${this._numRow(
                      localize(
                        "coordinate_config.elevation",
                        this.hass.language,
                      ),
                      "",
                      this.data.manual_elevation || haElevation,
                      (v) =>
                        this.handleConfigChange({
                          manual_elevation: parseFloat(v),
                        }),
                      1,
                    )}
                  `
                : html`
                    <div
                      class="zoneline"
                      style="color: var(--secondary-text-color); font-style: italic;"
                    >
                      ${localize(
                        "coordinate_config.current_ha_coords",
                        this.hass.language,
                      )}:<br />
                      ${localize(
                        "coordinate_config.latitude",
                        this.hass.language,
                      )}:
                      ${haLatitude}<br />
                      ${localize(
                        "coordinate_config.longitude",
                        this.hass.language,
                      )}:
                      ${haLongitude}<br />
                      ${localize(
                        "coordinate_config.elevation",
                        this.hass.language,
                      )}:
                      ${haElevation}m
                    </div>
                  `
            }
                </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  renderDaysBetweenIrrigationCard() {
    if (!this.config || !this.data || !this.hass) return html``;

    return html`
      <ha-card
        header="${localize(
          "days_between_irrigation.title",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          ${localize("days_between_irrigation.description", this.hass.language)}
        </div>

        <div class="card-content">
          ${this._numRow(
            localize("days_between_irrigation.label", this.hass.language),
            "",
            this.config.days_between_irrigation || 0,
            (v) =>
              this.handleConfigChange({
                days_between_irrigation: parseInt(v),
              }),
            1,
          )}
          <div class="card-content">
            <div
              style="color: var(--secondary-text-color); font-size: 0.875rem; margin-top: 8px;"
            >
              ${localize(
                "days_between_irrigation.help_text",
                this.hass.language,
              )}
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  private async saveData(
    changes: Partial<SmartIrrigationConfig>,
  ): Promise<void> {
    if (!this.hass || !this.data) return;

    this.isSaving = true;
    this._scheduleUpdate();

    // Our own save echoes back a _config_updated event; ignore it (the
    // optimistic update below already reflects the change) so the form isn't
    // refetched/re-rendered out from under the user.
    this._suppressNextConfigUpdate = true;

    try {
      // Optimistic update for responsive UI. Mirror the change into `config`
      // as well: several controls (the toggles) bind their state to
      // `this.config`, and because we suppress our own save echo there is no
      // refetch to reconcile them. Without this they visually revert to the
      // pre-save value (even though the save itself succeeded).
      this.data = {
        ...this.data,
        ...changes,
      };
      this.config = {
        ...this.config,
        ...changes,
      } as SmartIrrigationConfig;
      this._scheduleUpdate();

      await saveConfig(this.hass, this.data);
    } catch (error) {
      // Save failed: no _config_updated echo will arrive, so clear the guard
      // (otherwise it would swallow the next genuine external refresh).
      this._suppressNextConfigUpdate = false;
      console.error("Error saving config:", error);
      handleError(
        error,
        this.shadowRoot!.querySelector("ha-card") as HTMLElement,
      );
      // Rollback optimistic update on error
      await this._fetchData();
    } finally {
      this.isSaving = false;
      this._scheduleUpdate();
    }
  }

  private handleConfigChange(changes: Partial<SmartIrrigationConfig>): void {
    // Use debounced save for better performance
    this.debouncedSave(changes);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up debounce timer
    // The debounced function may have pending timeouts, but we can't directly access them
    // Let them complete naturally or be garbage collected
  }

  // --- modern row helpers (HA-native controls) ---
  private _textRow(
    label: string,
    unit: string | TemplateResult,
    value: any,
    onCommit: (v: string) => void,
  ): TemplateResult {
    return html`
      <div class="setting-row">
        <div class="setting-label">
          ${label}${unit ? html` <span class="unit">(${unit})</span>` : ""}
        </div>
        <input
          class="field"
          type="text"
          .value=${value === undefined || value === null ? "" : String(value)}
          @change=${(e: Event) =>
            onCommit((e.target as HTMLInputElement).value)}
        />
      </div>
    `;
  }

  // Time picker. ha-time-input isn't reliably registered on this panel, so we
  // use the native <input type="time"> (real HH:MM picker, same stored format).
  private _timeRow(
    label: string,
    value: any,
    onCommit: (v: string) => void,
  ): TemplateResult {
    return html`
      <div class="setting-row">
        <div class="setting-label">${label}</div>
        <input
          class="field"
          type="time"
          .value=${value ? String(value) : ""}
          @change=${(e: Event) =>
            onCommit((e.target as HTMLInputElement).value)}
        />
      </div>
    `;
  }

  private _numRow(
    label: string,
    unit: string | TemplateResult,
    value: any,
    onCommit: (v: string) => void,
    step = 1,
    readonly = false,
  ): TemplateResult {
    const decimals = (String(step).split(".")[1] || "").length;
    const bump = (input: HTMLInputElement, dir: number) => {
      const cur = parseFloat(input.value);
      const next = +((isNaN(cur) ? 0 : cur) + dir * step).toFixed(decimals);
      input.value = String(next);
      onCommit(String(next));
    };
    return html`
      <div class="setting-row">
        <div class="setting-label">
          ${label}${unit ? html` <span class="unit">(${unit})</span>` : ""}
        </div>
        <div class="num-field">
          <input
            class="field num-input"
            type="number"
            step=${step}
            ?readonly=${readonly}
            .value=${value === undefined || value === null ? "" : String(value)}
            @wheel=${(e: WheelEvent) => {
              // never let scrolling change a focused number field (auto-save!)
              if ((e.target as HTMLElement).matches(":focus"))
                e.preventDefault();
            }}
            @change=${(e: Event) =>
              onCommit((e.target as HTMLInputElement).value)}
          />
          <ha-icon-button
            class="step-btn"
            .path=${mdiMinus}
            ?disabled=${readonly}
            @click=${(e: Event) =>
              bump(
                (e.currentTarget as HTMLElement).parentElement!.querySelector(
                  "input",
                ) as HTMLInputElement,
                -1,
              )}
          ></ha-icon-button>
          <ha-icon-button
            class="step-btn"
            .path=${mdiPlus}
            ?disabled=${readonly}
            @click=${(e: Event) =>
              bump(
                (e.currentTarget as HTMLElement).parentElement!.querySelector(
                  "input",
                ) as HTMLInputElement,
                1,
              )}
          ></ha-icon-button>
        </div>
      </div>
    `;
  }

  private _selectRow(
    label: string,
    options: TemplateResult,
    onChange: (e: Event) => void,
  ): TemplateResult {
    return html`
      <div class="setting-row">
        <div class="setting-label">${label}</div>
        <div class="select-wrap">
          <select class="field" @change=${onChange}>
            ${options}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${mdiMenuDown}></path>
          </svg>
        </div>
      </div>
    `;
  }

  // Action button: native ha-button, light "filled" appearance,
  // "danger" variant turns it red.
  private _actionBtn(
    icon: string,
    label: string,
    onClick: (e: Event) => void,
    danger = false,
    disabled = false,
  ): TemplateResult {
    return html`
      <ha-button
        appearance=${danger ? "accent" : "filled"}
        variant=${danger ? "danger" : "brand"}
        ?disabled=${disabled}
        @click=${onClick}
      >
        <ha-svg-icon slot="start" .path=${icon}></ha-svg-icon>
        ${label}
      </ha-button>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle} ${modernStyle} /* View-specific styles only - most common styles are now in globalStyle */

      /* Drop the clickable (i) toggles and just always show the section
         descriptions (they're short and not in the way). */
      .card-content:has(> svg[id$="description"]) {
        display: none;
      }
      label[id$="description"] {
        display: block;
        margin: 0 0 8px;
        color: var(--secondary-text-color);
        line-height: 1.4;
      }

      /* number + unit-select on a single line (e.g. update interval) */
      .combo-field {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
      }
      .combo-field .combo-num {
        width: 90px;
        max-width: none;
      }
      .combo-field .select-wrap {
        width: 150px;
        max-width: none;
      }
      @media (max-width: 600px) {
        .combo-field {
          width: 100%;
        }
        .combo-field .combo-num {
          flex: 1 1 auto;
        }
      }

      /* Irrigation triggers styles */
      .trigger-usage {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.5;
      }
      .trigger-usage code {
        font-family: var(--ha-font-family-code, monospace);
        background: var(--secondary-background-color);
        padding: 1px 6px;
        border-radius: 4px;
        color: var(--primary-text-color);
        white-space: nowrap;
      }

      .triggers-list {
        margin: 16px 0;
      }

      .no-triggers {
        text-align: left;
        padding: 16px 0;
        color: var(--secondary-text-color);
        font-style: italic;
      }

      .trigger-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        margin: 8px 0;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
      }

      .trigger-item.disabled {
        opacity: 0.6;
      }

      .trigger-main {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 16px;
      }

      .trigger-info {
        flex: 1;
      }

      .trigger-name {
        font-weight: 500;
        color: var(--primary-text-color);
        margin-bottom: 4px;
      }

      .trigger-details {
        font-size: 0.875rem;
        color: var(--secondary-text-color);
      }

      .trigger-status {
        font-size: 0.875rem;
        padding: 4px 8px;
        border-radius: 4px;
        background: var(--primary-color);
        color: var(--text-primary-color);
        min-width: 60px;
        text-align: center;
      }

      .trigger-item.disabled .trigger-status {
        background: var(--disabled-text-color);
      }

      .trigger-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .add-trigger-section {
        margin-top: 16px;
        text-align: right;
      }

      .add-trigger-section ha-button {
        --mdc-theme-primary: var(--primary-color);
      }

      .add-trigger-section ha-icon {
        margin-right: 8px;
      }
    `;
  }
}
