import { CSSResultGroup, LitElement, TemplateResult, css, html } from "lit";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant, fireEvent } from "custom-card-helpers";
import { UnsubscribeFunc } from "home-assistant-js-websocket";

import { fetchConfig, fetchZones, saveConfig } from "../../data/websockets";
import { SubscribeMixin } from "../../subscribe-mixin";
import { localize } from "../../../localize/localize";
import { output_unit, pick, handleError } from "../../helpers";
import { loadHaForm } from "../../load-ha-elements";
import "../../dialogs/trigger-dialog";
import {
  SmartIrrigationConfig,
  SmartIrrigationProgram,
  SmartIrrigationSchedule,
  SmartIrrigationStep,
  SmartIrrigationSupply,
  SmartIrrigationZone,
  IrrigationStartTrigger,
} from "../../types";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { Path } from "../../common/navigation";
import {
  AUTO_UPDATE_SCHEDULE_DAILY,
  AUTO_UPDATE_SCHEDULE_HOURLY,
  AUTO_UPDATE_SCHEDULE_MINUTELY,
  CONF_AUTO_CALC_ENABLED,
  CONF_AUTO_UPDATE_ENABLED,
  CONF_AUTO_UPDATE_INTERVAL,
  CONF_AUTO_UPDATE_SCHEDULE,
  CONF_AUTO_UPDATE_TIME,
  CONF_CALC_TIME,
  CONF_CONTINUOUS_UPDATES,
  CONF_SENSOR_DEBOUNCE,
  CONF_CALC_LOG_ENABLED,
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
import {
  mdiPlus,
  mdiPencil,
  mdiDelete,
  mdiMenuDown,
  mdiMinus,
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiSkipNext,
} from "@mdi/js";

@customElement("smart-irrigation-view-general")
export class SmartIrrigationViewGeneral extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() narrow!: boolean;
  @property() path!: Path;

  @property() data?: Partial<SmartIrrigationConfig>;
  @property() config?: SmartIrrigationConfig;
  // The zones a step can water (full controller programs).
  @property({ attribute: false }) zones: SmartIrrigationZone[] = [];
  // What the programs are doing, and what they will do (full controller).
  @property({ attribute: false }) planning: any[] = [];
  @property({ attribute: false }) programsState?: any;
  private _liveTimer?: number;

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
  // The changes waiting are merged, not replaced: keeping only the last one
  // lost any other setting changed within the half second, such as a switch
  // turned on just before its threshold was typed in.
  private debouncedSave = (() => {
    let timeoutId: number | null = null;
    let pending: Partial<SmartIrrigationConfig> = {};
    return (changes: Partial<SmartIrrigationConfig>) => {
      pending = { ...pending, ...changes };
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        const batch = pending;
        pending = {};
        timeoutId = null;
        this.saveData(batch);
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
        CONF_CONTINUOUS_UPDATES,
        CONF_SENSOR_DEBOUNCE,
        CONF_CALC_LOG_ENABLED,
        CONF_MANUAL_COORDINATES_ENABLED,
        CONF_MANUAL_LATITUDE,
        CONF_MANUAL_LONGITUDE,
        CONF_MANUAL_ELEVATION,
        CONF_DAYS_BETWEEN_IRRIGATION,
      ]);
      try {
        this.zones = await fetchZones(this.hass);
      } catch (error) {
        console.error("Error fetching zones:", error);
      }
      // The planning and the live state need the configuration first.
      this._fetchLive(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error gracefully - keep existing data if fetch fails
    } finally {
      this.isLoading = false;
      this._hasLoadedOnce = true;
      this._scheduleUpdate();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    // The live state moves while a watering runs, so it is read now and then;
    // the planning, which changes slowly, less often.
    let ticks = 0;
    this._liveTimer = window.setInterval(() => {
      ticks += 1;
      this._fetchLive(ticks % 6 === 0);
    }, 5000);
  }

  firstUpdated() {
    this._fetchLive(true);
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
      // When the watering duration is calculated is one question. What starts
      // the watering is decided elsewhere, by the start trigger: neither answer
      // is a switch for "we will water".
      const base = "panels.general.cards.automatic-duration-calculation.labels";
      const calcWhen = this.config.recalculate_before_start
        ? "start"
        : this.config.autocalcenabled
          ? "time"
          : "manual";
      let r1 = html` <div class="card-content">
          ${localize(
            "panels.general.cards.automatic-duration-calculation.description",
            this.hass.language,
          )}
        </div>
        <div class="card-content">
          ${this._selectRow(
            html`${localize(`${base}.calc-when`, this.hass.language)}
              <div class="setting-hint">
                ${localize(`${base}.calc-when-hint`, this.hass.language)}
              </div>`,
            html`
              <option value="time" ?selected=${calcWhen === "time"}>
                ${localize(`${base}.calc-when-time`, this.hass.language)}
              </option>
              <option value="start" ?selected=${calcWhen === "start"}>
                ${localize(`${base}.calc-when-start`, this.hass.language)}
              </option>
              <option value="manual" ?selected=${calcWhen === "manual"}>
                ${localize(`${base}.calc-when-manual`, this.hass.language)}
              </option>
            `,
            (e: Event) => {
              const value = (e.target as HTMLSelectElement).value;
              this.handleConfigChange({
                autocalcenabled: value === "time",
                recalculate_before_start: value === "start",
              });
            },
          )}
        </div>`;
      if (calcWhen === "time") {
        r1 = html`${r1}
          <div class="card-content">
            ${this._timeRow(
              localize(`${base}.calc-time`, this.hass.language),
              this.config.calctime,
              (v) => this.handleConfigChange({ calctime: v }),
              localize(`${base}.calc-time-hint`, this.hass.language),
            )}
          </div>`;
      }
      // The form of the equation, which has nothing to do with the moment.
      r1 = html`${r1}
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize(`${base}.hourly-calculation`, this.hass.language)}
              <div class="setting-hint">
                ${localize(
                  `${base}.hourly-calculation-hint`,
                  this.hass.language,
                )}
              </div>
            </div>
            <ha-switch
              .checked=${this.config.hourly_calculation}
              @change=${(e: Event) =>
                this.handleConfigChange({
                  hourly_calculation: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>
          ${
            // On for a new installation, and not a decision anybody has to take:
            // a light shower does not reach the roots. It acts on the rain that
            // fell, in every calculation, which is why it lives here and not
            // with the forecast. The advanced mode only, unless it was turned
            // off, so that is not hidden.
            this.config.ui_mode === "advanced" || !this.config.effective_rain
              ? html`<div class="setting-row">
                  <div class="setting-label">
                    ${localize(
                      "weather_skip.effective_rain_label",
                      this.hass.language,
                    )}
                    <div class="setting-hint">
                      ${localize(
                        "weather_skip.effective_rain_description",
                        this.hass.language,
                      )}
                    </div>
                  </div>
                  <ha-switch
                    .checked=${!!this.config.effective_rain}
                    @change=${(e: Event) =>
                      this.handleConfigChange({
                        effective_rain: (e.target as any).checked,
                      })}
                  ></ha-switch>
                </div>`
              : ""
          }
        </div>`;
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

      // Recording every change of a sensor is for those who have a rain gauge
      // or a sensor that moves all day: the advanced mode, unless it is already
      // on, so that nothing in use is hidden.
      const showContinuous =
        this.config.ui_mode === "advanced" || !!this.config.continuousupdates;
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

      // Calculation audit log Card
      const r10 = this.renderCalculationLogCard();

      // How much of the panel to show.
      const r11 = this.renderPanelModeCard();

      // Seasonal adjustments (advanced).
      const r13 = this.renderSeasonalAdjustmentsCard();

      // Pumps and main valves (full controller).
      const r14 = this.renderSuppliesCard();
      const r15 = this.renderProgramsCard();
      const r16 = this.renderPlanningCard();

      // The way to the setup assistant, which is no longer a tab. It comes first:
      // it is where somebody who has nothing set up wants to start.
      const r12 = this.renderSetupAssistantCard();

      const r = html`<ha-card
          header="${localize("panels.general.title", this.hass.language)}"
        >
          <div class="card-content">
            ${localize("panels.general.description", this.hass.language)}
          </div> </ha-card
        >${r12}${r11}${r2}${r1}${showContinuous
          ? r4
          : ""}${r5}${r6}${r7}${r8}${r9}${r16}${r15}${r14}${r10}${r13}`;

      return r;
    }
  }

  /** What the programs are doing now, one line each, and the valves that are open. */
  renderLiveState() {
    const state = this.programsState;
    if (!this.hass || !state) return html``;
    const lang = this.hass.language;
    const t = (key: string) => localize(`planning.${key}`, lang);
    const live = state.live;
    if (!live) return html``;
    const minutes = (seconds: number) => {
      const m = Math.floor(seconds / 60);
      const s = Math.round(seconds % 60);
      return `${m}:${String(s).padStart(2, "0")}`;
    };
    const rows = [
      ...(live.paused
        ? [
            html`<div class="setting-note">
              <strong>${t("paused")}</strong>
            </div>`,
          ]
        : []),
      ...(live.programs || []).map(
        (p: any) => html`
          <div class="setting-note">
            <strong>${p.name}</strong>
            ${p.state === "waiting"
              ? html` - ${t("waiting")}`
              : html` - ${t("step")}
                ${p.step}/${p.steps}${p.tours > 1
                  ? html`, ${t("tour")} ${p.tour}/${p.tours}`
                  : ""},
                ${p.percent} %, ${t("remaining")}
                ${minutes(p.remaining_seconds || 0)}`}
          </div>
        `,
      ),
      ...(live.valves || []).map(
        (v: any) => html`
          <div class="setting-note">
            ${v.zone}: ${t("remaining")} ${minutes(v.remaining_seconds)}
            (${v.percent} %)
          </div>
        `,
      ),
    ];
    if (!rows.length) {
      return html`<div class="setting-note">${t("nothing_now")}</div>`;
    }
    return html`${rows}`;
  }

  /**
   * What the programs will water over the next days.
   *
   * Only in full controller mode. The weather is not known days ahead: a planned
   * run is one that goes ahead if nothing holds it back.
   */
  renderPlanningCard() {
    if (!this.config || !this.hass || this.config.full_controller !== true) {
      return html``;
    }
    const lang = this.hass.language;
    const t = (key: string) => localize(`planning.${key}`, lang);
    const dayTime = (iso: string) =>
      new Intl.DateTimeFormat(lang, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    const clock = (iso: string) =>
      new Intl.DateTimeFormat(lang, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    const minutes = (seconds: number) => `${Math.round(seconds / 60)} min`;
    const planning = this.planning || [];
    return html`
      <ha-card header="${t("title")}">
        <div class="card-content">
          ${t("description")} ${this.renderLiveState()}
        </div>
        ${planning.length
          ? planning.map(
              (item: any) => html`
                <div class="card-content">
                  <div class="setting-note">
                    <strong>${dayTime(item.start)}</strong> ${item.program}
                    (${clock(item.start)} - ${clock(item.end)})
                  </div>
                  ${item.steps.map(
                    (step: any, n: number) => html`
                      <div class="setting-note">
                        ${n + 1}.
                        ${step.zones
                          .map((z: any) => `${z.zone} ${minutes(z.seconds)}`)
                          .join(" + ")}
                      </div>
                    `,
                  )}
                  ${item.tours > 1
                    ? html`<div class="setting-note">
                        ${item.tours} ${t("tours")}
                      </div>`
                    : ""}
                </div>
              `,
            )
          : html`<div class="card-content">${t("nothing_planned")}</div>`}
      </ha-card>
    `;
  }

  private async _fetchLive(withPlanning: boolean): Promise<void> {
    if (!this.hass || this.config?.full_controller !== true) return;
    try {
      this.programsState = await this.hass.callWS({
        type: DOMAIN + "/programs_state",
      });
      if (withPlanning) {
        this.planning = await this.hass.callWS({
          type: DOMAIN + "/planning",
          days: 3,
        });
      }
      this._scheduleUpdate();
    } catch (error) {
      console.error("Error fetching the programs' state:", error);
    }
  }

  /**
   * Programs: what is watered, in what order, for how long.
   *
   * Only in full controller mode. The main program is made from the settings
   * above and has nothing to edit here. A step is one or several zones watered
   * together; by default it takes the duration Smart Irrigation calculated.
   */
  renderProgramsCard() {
    if (!this.config || !this.hass || this.config.full_controller !== true) {
      return html``;
    }
    const lang = this.hass.language;
    const t = (key: string) => localize(`programs.${key}`, lang);
    const programs: SmartIrrigationProgram[] = this.config.programs || [];
    // The list is mirrored at once: the save is debounced, and a second edit
    // made before it goes out must build on the first, not on the old list.
    const save = (next: SmartIrrigationProgram[]) => {
      this.config = { ...this.config!, programs: next };
      this.handleConfigChange({ programs: next });
      this._scheduleUpdate();
    };
    const patch = (index: number, changes: Partial<SmartIrrigationProgram>) =>
      save(programs.map((p, n) => (n === index ? { ...p, ...changes } : p)));
    const num = (v: string, fallback = 0) => {
      const n = parseFloat(v);
      return isNaN(n) ? fallback : n;
    };
    const run = (id?: string) =>
      this.hass!.callService(DOMAIN, "run_program", { program_id: id });
    const control = (service: string) =>
      this.hass!.callService(DOMAIN, service, {});
    const random = () => Math.random().toString(36).slice(2, 8);

    const renderStep = (
      program: SmartIrrigationProgram,
      index: number,
      step: SmartIrrigationStep,
      stepIndex: number,
    ) => {
      const patchStep = (changes: Partial<SmartIrrigationStep>) =>
        patch(index, {
          steps: (program.steps || []).map((s, n) =>
            n === stepIndex ? { ...s, ...changes } : s,
          ),
        });
      const toggleZone = (zoneId: number, on: boolean) => {
        const zones = (step.zones || []).filter((z) => z !== zoneId);
        patchStep({ zones: on ? [...zones, zoneId] : zones });
      };
      return html`
        <div class="setting-note">
          <strong>${t("step")} ${stepIndex + 1}</strong>
        </div>
        <div class="setting-row">
          <div class="setting-label">${t("step_zones")}</div>
          <div>
            ${this.zones.map(
              (zone) => html`
                <label style="margin-right: 12px; white-space: nowrap;">
                  <input
                    type="checkbox"
                    .checked=${(step.zones || []).includes(zone.id as number)}
                    @change=${(e: Event) =>
                      toggleZone(
                        zone.id as number,
                        (e.target as HTMLInputElement).checked,
                      )}
                  />
                  ${zone.name}
                </label>
              `,
            )}
          </div>
        </div>
        <div class="setting-note">${t("step_zones_help")}</div>
        ${this._selectRow(
          t("step_duration"),
          html`
            <option value="calculated" ?selected=${step.mode === "calculated"}>
              ${t("mode_calculated")}
            </option>
            <option value="percent" ?selected=${step.mode === "percent"}>
              ${t("mode_percent")}
            </option>
            <option value="fixed" ?selected=${step.mode === "fixed"}>
              ${t("mode_fixed")}
            </option>
          `,
          (e: Event) =>
            patchStep({
              mode: (e.target as HTMLSelectElement)
                .value as SmartIrrigationStep["mode"],
            }),
        )}
        ${step.mode === "percent"
          ? this._numRow(t("percent"), "%", step.percent, (v) =>
              patchStep({ percent: num(v, 100) }),
            )
          : ""}
        ${step.mode === "fixed"
          ? this._numRow(
              t("seconds"),
              localize("units.seconds", lang),
              step.seconds,
              (v) => patchStep({ seconds: num(v) }),
            )
          : ""}
        ${this._numRow(t("passes"), "", step.passes, (v) =>
          patchStep({ passes: Math.max(1, Math.round(num(v, 1))) }),
        )}
        ${this._numRow(t("max_litres"), "L", step.max_litres ?? 0, (v) =>
          patchStep({ max_litres: Math.max(0, num(v)) }),
        )}
        <div class="setting-note">${t("max_litres_help")}</div>
        ${this._textRow(
          t("step_delay"),
          localize("units.seconds", lang),
          step.delay === null || step.delay === undefined ? "" : step.delay,
          (v) => patchStep({ delay: v.trim() === "" ? null : num(v) }),
        )}
        <div class="setting-note">${t("step_delay_help")}</div>
        <div class="setting-row">
          <div class="setting-label">${t("enabled")}</div>
          <ha-switch
            .checked=${step.enabled !== false}
            @change=${(e: Event) =>
              patchStep({ enabled: (e.target as any).checked })}
          ></ha-switch>
        </div>
        ${this._actionBtn(
          mdiDelete,
          t("delete_step"),
          () =>
            patch(index, {
              steps: (program.steps || []).filter((_, n) => n !== stepIndex),
            }),
          true,
        )}
      `;
    };

    const weekdayName = (i: number) =>
      new Intl.DateTimeFormat(lang, { weekday: "short" }).format(
        new Date(2024, 0, 1 + i),
      );
    const monthName = (i: number) =>
      new Intl.DateTimeFormat(lang, { month: "short" }).format(
        new Date(2024, i, 1),
      );

    const renderSchedule = (
      program: SmartIrrigationProgram,
      index: number,
      schedule: SmartIrrigationSchedule,
      scheduleIndex: number,
    ) => {
      const patchSchedule = (changes: Partial<SmartIrrigationSchedule>) =>
        patch(index, {
          schedules: (program.schedules || []).map((s, n) =>
            n === scheduleIndex ? { ...s, ...changes } : s,
          ),
        });
      const toggle = (
        list: number[] | undefined,
        value: number,
        on: boolean,
      ) => {
        const rest = (list || []).filter((v) => v !== value);
        return on ? [...rest, value].sort((a, b) => a - b) : rest;
      };
      return html`
        <div class="setting-note">
          <strong>${t("schedule")} ${scheduleIndex + 1}</strong>
        </div>
        ${this._selectRow(
          t("schedule_moment"),
          html`
            <option value="time" ?selected=${schedule.type === "time"}>
              ${t("moment_time")}
            </option>
            <option
              value="sunrise"
              ?selected=${schedule.type === "sun" &&
              schedule.event === "sunrise"}
            >
              ${t("moment_sunrise")}
            </option>
            <option
              value="sunset"
              ?selected=${schedule.type === "sun" &&
              schedule.event === "sunset"}
            >
              ${t("moment_sunset")}
            </option>
          `,
          (e: Event) => {
            const value = (e.target as HTMLSelectElement).value;
            patchSchedule(
              value === "time"
                ? { type: "time" }
                : { type: "sun", event: value as "sunrise" | "sunset" },
            );
          },
        )}
        ${schedule.type === "time"
          ? this._timeRow(t("schedule_time"), schedule.time, (v) =>
              patchSchedule({ time: v }),
            )
          : this._numRow(
              t("schedule_offset"),
              localize("units.minutes", lang),
              schedule.offset_minutes,
              (v) => patchSchedule({ offset_minutes: Math.round(num(v)) }),
            )}
        ${this._selectRow(
          t("schedule_anchor"),
          html`
            <option value="start" ?selected=${schedule.anchor !== "end"}>
              ${t("anchor_start")}
            </option>
            <option value="end" ?selected=${schedule.anchor === "end"}>
              ${t("anchor_end")}
            </option>
          `,
          (e: Event) =>
            patchSchedule({
              anchor: (e.target as HTMLSelectElement).value as "start" | "end",
            }),
        )}
        <div class="setting-note">${t("schedule_anchor_help")}</div>
        <div class="setting-row">
          <div class="setting-label">${t("schedule_weekdays")}</div>
          <div>
            ${[0, 1, 2, 3, 4, 5, 6].map(
              (day) => html`
                <label style="margin-right: 10px; white-space: nowrap;">
                  <input
                    type="checkbox"
                    .checked=${(schedule.weekdays || []).includes(day)}
                    @change=${(e: Event) =>
                      patchSchedule({
                        weekdays: toggle(
                          schedule.weekdays,
                          day,
                          (e.target as HTMLInputElement).checked,
                        ),
                      })}
                  />
                  ${weekdayName(day)}
                </label>
              `,
            )}
          </div>
        </div>
        <div class="setting-note">${t("schedule_weekdays_help")}</div>
        ${this._numRow(
          t("schedule_every"),
          t("schedule_days"),
          schedule.every_n_days ?? 1,
          (v) =>
            patchSchedule({ every_n_days: Math.max(1, Math.round(num(v, 1))) }),
        )}
        ${(schedule.every_n_days ?? 1) > 1
          ? this._numRow(
              t("schedule_every_offset"),
              t("schedule_days"),
              schedule.every_offset ?? 0,
              (v) =>
                patchSchedule({
                  every_offset: Math.max(0, Math.round(num(v))),
                }),
            )
          : ""}
        <div class="setting-note">${t("schedule_every_help")}</div>
        ${this._selectRow(
          t("schedule_parity"),
          html`
            <option
              value="any"
              ?selected=${schedule.parity !== "even" &&
              schedule.parity !== "odd"}
            >
              ${t("parity_any")}
            </option>
            <option value="even" ?selected=${schedule.parity === "even"}>
              ${t("parity_even")}
            </option>
            <option value="odd" ?selected=${schedule.parity === "odd"}>
              ${t("parity_odd")}
            </option>
          `,
          (e: Event) =>
            patchSchedule({
              parity: (e.target as HTMLSelectElement)
                .value as SmartIrrigationSchedule["parity"],
            }),
        )}
        <div class="setting-row">
          <div class="setting-label">${t("schedule_months")}</div>
          <div>
            ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
              (month) => html`
                <label style="margin-right: 10px; white-space: nowrap;">
                  <input
                    type="checkbox"
                    .checked=${(schedule.months || []).includes(month + 1)}
                    @change=${(e: Event) =>
                      patchSchedule({
                        months: toggle(
                          schedule.months,
                          month + 1,
                          (e.target as HTMLInputElement).checked,
                        ),
                      })}
                  />
                  ${monthName(month)}
                </label>
              `,
            )}
          </div>
        </div>
        <div class="setting-note">${t("schedule_months_help")}</div>
        ${this._textRow(
          t("schedule_from"),
          "MM-DD",
          schedule.from_date ?? "",
          (v) => patchSchedule({ from_date: v.trim() || null }),
        )}
        ${this._textRow(
          t("schedule_until"),
          "MM-DD",
          schedule.until_date ?? "",
          (v) => patchSchedule({ until_date: v.trim() || null }),
        )}
        <div class="setting-note">${t("schedule_period_help")}</div>
        <div class="setting-row">
          <div class="setting-label">${t("schedule_weather")}</div>
          <ha-switch
            .checked=${schedule.weather !== false}
            @change=${(e: Event) =>
              patchSchedule({ weather: (e.target as any).checked })}
          ></ha-switch>
        </div>
        <div class="setting-note">${t("schedule_weather_help")}</div>
        <div class="setting-row">
          <div class="setting-label">${t("enabled")}</div>
          <ha-switch
            .checked=${schedule.enabled !== false}
            @change=${(e: Event) =>
              patchSchedule({ enabled: (e.target as any).checked })}
          ></ha-switch>
        </div>
        ${this._actionBtn(
          mdiDelete,
          t("delete_schedule"),
          () =>
            patch(index, {
              schedules: (program.schedules || []).filter(
                (_, n) => n !== scheduleIndex,
              ),
            }),
          true,
        )}
      `;
    };

    return html`
      <ha-card header="${t("title")}">
        <div class="card-content">${t("description")}</div>
        <div class="card-content">
          ${this._actionBtn(mdiPause, t("pause"), () =>
            control("pause_watering"),
          )}
          ${this._actionBtn(mdiPlay, t("resume"), () =>
            control("resume_watering"),
          )}
          ${this._actionBtn(mdiSkipNext, t("next_step"), () =>
            control("next_step"),
          )}
          ${this._actionBtn(
            mdiStop,
            t("stop"),
            () => control("stop_watering"),
            true,
          )}
          <div class="setting-note">${t("controls_help")}</div>
        </div>
        ${programs.map((program, index) =>
          program.main
            ? html`
                <div class="card-content">
                  <div class="setting-note">
                    <strong>${program.name}</strong>
                  </div>
                  <div class="setting-note">${t("main_description")}</div>
                  <div class="setting-row">
                    <div class="setting-label">${t("enabled")}</div>
                    <ha-switch
                      .checked=${program.enabled !== false}
                      @change=${(e: Event) =>
                        patch(index, { enabled: (e.target as any).checked })}
                    ></ha-switch>
                  </div>
                  ${this._actionBtn(mdiPlay, t("run_now"), () =>
                    run(program.id),
                  )}
                </div>
              `
            : html`
                <div class="card-content">
                  ${this._textRow(t("name"), "", program.name, (v) =>
                    patch(index, { name: v }),
                  )}
                  ${(program.steps || []).map((step, stepIndex) =>
                    renderStep(program, index, step, stepIndex),
                  )}
                  ${this._actionBtn(mdiPlus, t("add_step"), () =>
                    patch(index, {
                      steps: [
                        ...(program.steps || []),
                        {
                          id: "step_" + random(),
                          zones: [],
                          mode: "calculated",
                          percent: 100,
                          seconds: 0,
                          passes: 1,
                          max_litres: 0,
                          delay: null,
                          enabled: true,
                        },
                      ],
                    }),
                  )}
                  ${(program.schedules || []).map((schedule, scheduleIndex) =>
                    renderSchedule(program, index, schedule, scheduleIndex),
                  )}
                  ${this._actionBtn(mdiPlus, t("add_schedule"), () =>
                    patch(index, {
                      schedules: [
                        ...(program.schedules || []),
                        {
                          id: "schedule_" + random(),
                          enabled: true,
                          type: "time",
                          time: "06:00",
                          event: "sunrise",
                          offset_minutes: 0,
                          anchor: "start",
                          weekdays: [],
                          every_n_days: 1,
                          every_offset: 0,
                          parity: "any",
                          months: [],
                          from_date: null,
                          until_date: null,
                          weather: true,
                        },
                      ],
                    }),
                  )}
                  ${this._numRow(
                    t("delay"),
                    localize("units.seconds", lang),
                    program.delay ?? 0,
                    (v) => patch(index, { delay: num(v) }),
                  )}
                  <div class="setting-note">${t("delay_help")}</div>
                  ${this._numRow(t("tours"), "", program.tours ?? 1, (v) =>
                    patch(index, { tours: Math.max(1, Math.round(num(v, 1))) }),
                  )}
                  <div class="setting-note">${t("tours_help")}</div>
                  <div class="setting-row">
                    <div class="setting-label">${t("enabled")}</div>
                    <ha-switch
                      .checked=${program.enabled !== false}
                      @change=${(e: Event) =>
                        patch(index, { enabled: (e.target as any).checked })}
                    ></ha-switch>
                  </div>
                  ${this._actionBtn(mdiPlay, t("run_now"), () =>
                    run(program.id),
                  )}
                  ${this._actionBtn(
                    mdiDelete,
                    t("delete"),
                    () => save(programs.filter((_, n) => n !== index)),
                    true,
                  )}
                </div>
              `,
        )}
        <div class="card-content">
          ${this._actionBtn(mdiPlus, t("add"), () =>
            save([
              ...programs,
              {
                id: "program_" + random(),
                name: `${t("new_program")} ${programs.length}`,
                enabled: true,
                steps: [],
                delay: 0,
                tours: 1,
                schedules: [],
              },
            ]),
          )}
        </div>
      </ha-card>
    `;
  }

  /**
   * Supplies: a pump or a main valve that runs while a zone it feeds is watered.
   *
   * Only in full controller mode. A zone picks its supply in its own settings.
   * The delays are signed: positive, the supply leads (on before the valve opens,
   * off after it closes); negative, the valve leads.
   */
  renderSuppliesCard() {
    if (!this.config || !this.hass || this.config.full_controller !== true) {
      return html``;
    }
    const lang = this.hass.language;
    const t = (key: string) => localize(`supplies.${key}`, lang);
    const supplies: SmartIrrigationSupply[] = this.config.supplies || [];
    const save = (next: SmartIrrigationSupply[]) => {
      this.config = { ...this.config!, supplies: next };
      this.handleConfigChange({ supplies: next });
      this._scheduleUpdate();
    };
    const patch = (index: number, changes: Partial<SmartIrrigationSupply>) =>
      save(supplies.map((s, n) => (n === index ? { ...s, ...changes } : s)));
    const seconds = (v: string) => {
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    };
    return html`
      <ha-card header="${t("title")}">
        <div class="card-content">${t("description")}</div>
        ${supplies.map(
          (supply, index) => html`
            <div class="card-content">
              ${this._textRow(t("name"), "", supply.name, (v) =>
                patch(index, { name: v }),
              )}
              ${this._textRow(
                t("entities"),
                t("entities_hint"),
                (supply.entities || []).join(", "),
                (v) =>
                  patch(index, {
                    entities: v
                      .split(",")
                      .map((e) => e.trim())
                      .filter((e) => e),
                  }),
              )}
              ${this._numRow(
                t("delay_before"),
                localize("units.seconds", lang),
                supply.delay_before,
                (v) => patch(index, { delay_before: seconds(v) }),
              )}
              <div class="setting-note">${t("delay_before_help")}</div>
              ${this._numRow(
                t("delay_after"),
                localize("units.seconds", lang),
                supply.delay_after,
                (v) => patch(index, { delay_after: seconds(v) }),
              )}
              <div class="setting-note">${t("delay_after_help")}</div>
              <div class="setting-row">
                <div class="setting-label">${t("enabled")}</div>
                <ha-switch
                  .checked=${supply.enabled !== false}
                  @change=${(e: Event) =>
                    patch(index, { enabled: (e.target as any).checked })}
                ></ha-switch>
              </div>
              ${this._actionBtn(
                mdiDelete,
                t("delete"),
                () => save(supplies.filter((_, n) => n !== index)),
                true,
              )}
            </div>
          `,
        )}
        <div class="card-content">
          ${this._actionBtn(mdiPlus, t("add"), () =>
            save([
              ...supplies,
              {
                // Chosen here and kept, so a zone's link survives a rename.
                id: "supply_" + Math.random().toString(36).slice(2, 8),
                name: "",
                entities: [],
                delay_before: 0,
                delay_after: 0,
                enabled: true,
              },
            ]),
          )}
        </div>
      </ha-card>
    `;
  }

  /** Change a seasonal adjustment through the service, which also updates the one in use. */
  private async _seasonalCall(
    service: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    if (!this.hass) return;
    try {
      await this.hass.callService(DOMAIN, service, data);
    } catch (error) {
      console.error("Seasonal adjustment " + service + " failed:", error);
    }
    await this._fetchData();
  }

  /**
   * Seasonal adjustments: a crop factor and a threshold that follow the season.
   *
   * They used to be reachable only through actions. Each row is one adjustment,
   * for a range of months and some zones; several that cover the same month
   * multiply.
   */
  renderSeasonalAdjustmentsCard() {
    if (!this.config || !this.hass || this.config.ui_mode !== "advanced") {
      return html``;
    }
    const lang = this.hass.language;
    const t = (key: string) => localize(`seasonal_adjustments.${key}`, lang);
    const adjustments = this.config.seasonal_adjustments || [];
    const update = (id: string, data: Record<string, unknown>) =>
      this._seasonalCall("update_seasonal_adjustment", {
        adjustment_id: id,
        ...data,
      });
    return html`
      <ha-card header="${t("title")}">
        <div class="card-content">${t("description")}</div>
        ${adjustments.map(
          (a) => html`
            <div class="card-content si-subgroup">
              ${this._textRow(t("name"), "", a.name, (v) =>
                update(a.id, { name: v || a.name }),
              )}
              ${this._numRow(
                t("month_start"),
                "1-12",
                a.month_start,
                (v) =>
                  update(a.id, {
                    month_start: Math.min(
                      12,
                      Math.max(1, parseInt(v, 10) || 1),
                    ),
                  }),
                1,
              )}
              ${this._numRow(
                t("month_end"),
                "1-12",
                a.month_end,
                (v) =>
                  update(a.id, {
                    month_end: Math.min(12, Math.max(1, parseInt(v, 10) || 12)),
                  }),
                1,
              )}
              ${this._numRow(
                t("multiplier"),
                "x",
                a.multiplier_adjustment ?? 1,
                (v) =>
                  update(a.id, {
                    multiplier_adjustment: Math.max(0, parseFloat(v) || 0),
                  }),
                0.05,
              )}
              ${this._numRow(
                t("threshold"),
                output_unit(this.config!, CONF_PRECIPITATION_THRESHOLD_MM),
                a.threshold_adjustment ?? 0,
                (v) =>
                  update(a.id, { threshold_adjustment: parseFloat(v) || 0 }),
                0.5,
              )}
              ${this._textRow(
                t("zones"),
                "",
                Array.isArray(a.zones)
                  ? a.zones.join(", ")
                  : (a.zones ?? "all"),
                (v) => update(a.id, { zones: v.trim() || "all" }),
              )}
              <div class="setting-hint">${t("zones_hint")}</div>
              <div class="setting-row">
                <div class="setting-label">${t("enabled")}</div>
                <ha-switch
                  .checked=${a.enabled !== false}
                  @change=${(e: Event) =>
                    update(a.id, { enabled: (e.target as any).checked })}
                ></ha-switch>
              </div>
              <ha-button
                @click=${() =>
                  this._seasonalCall("delete_seasonal_adjustment", {
                    adjustment_id: a.id,
                  })}
              >
                ${t("delete")}
              </ha-button>
            </div>
          `,
        )}
        <div class="card-actions">
          <ha-button
            @click=${() =>
              this._seasonalCall("create_seasonal_adjustment", {
                name: t("new_name"),
                month_start: 6,
                month_end: 8,
                multiplier_adjustment: 1,
                threshold_adjustment: 0,
                zones: "all",
                enabled: true,
              })}
          >
            ${t("add")}
          </ha-button>
        </div>
      </ha-card>
    `;
  }

  /**
   * The way to the setup assistant.
   *
   * It used to be a tab, which invited an installation that was already set up
   * to set itself up: somebody with two zones asked why it was there, fairly.
   * It belongs here, one click away, for a fresh start or a first zone.
   */
  renderSetupAssistantCard() {
    if (!this.hass) return html``;
    const lang = this.hass.language;
    return html`
      <ha-card header="${localize("panels.setup.title", lang)}">
        <div class="card-content">
          ${localize("panels.general.cards.setup-assistant.description", lang)}
        </div>
        <div class="card-actions">
          <ha-button
            @click=${() => {
              window.history.pushState(
                null,
                "",
                `${window.location.pathname.split("/").slice(0, -1).join("/")}/setup`,
              );
              window.dispatchEvent(new Event("location-changed"));
            }}
          >
            ${localize("panels.general.cards.setup-assistant.open", lang)}
          </ha-button>
        </div>
      </ha-card>
    `;
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
          <div class="setting-row">
            <div class="setting-label">
              ${localize(
                "irrigation_start_triggers.active_label",
                this.hass.language,
              )}
            </div>
            <select
              class="field"
              @change=${(e: Event) =>
                this.handleConfigChange({
                  active_start_trigger: (e.target as HTMLSelectElement).value,
                })}
            >
              <option
                value="default"
                ?selected=${(this.config.active_start_trigger || "default") ===
                "default"}
              >
                ${localize(
                  "irrigation_start_triggers.active_default",
                  this.hass.language,
                )}
              </option>
              ${triggers.map(
                (t) => html`
                  <option
                    value="${t.name}"
                    ?selected=${this.config!.active_start_trigger === t.name}
                  >
                    ${t.name}
                  </option>
                `,
              )}
              <option
                value="none"
                ?selected=${this.config.active_start_trigger === "none"}
              >
                ${localize(
                  "irrigation_start_triggers.active_none",
                  this.hass.language,
                )}
              </option>
            </select>
          </div>
          <div class="trigger-active-hint">
            ${localize(
              "irrigation_start_triggers.active_hint",
              this.hass.language,
            )}
          </div>
        </div>

        <div class="card-content">
          <div class="triggers-list">
            ${this.config.active_start_trigger === "none"
              ? html`
                  <div class="no-triggers">
                    ${localize(
                      "irrigation_start_triggers.none_selected",
                      this.hass.language,
                    )}
                  </div>
                `
              : ""}
            ${triggers.map((trigger, index) =>
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
              ${localize("weather_skip.forecast_label", this.hass.language)}
              <div class="setting-hint">
                ${localize(
                  "weather_skip.forecast_description",
                  this.hass.language,
                )}
              </div>
            </div>
            <ha-switch
              .checked=${!!(
                this.config.skip_irrigation_on_precipitation ||
                this.config.forecast_rain_credit
              )}
              @change=${(e: Event) =>
                // One question: below the threshold the durations are reduced,
                // at or above it the run is skipped. Both settings follow it.
                this.handleConfigChange({
                  skip_irrigation_on_precipitation: (e.target as any).checked,
                  forecast_rain_credit: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>

          ${this.config.skip_irrigation_on_precipitation ||
          this.config.forecast_rain_credit
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
      ${this.renderMeasuredSkipCard()}
    `;
  }

  /** Rain sensor, freeze and wind: read at the start of each run. */
  renderMeasuredSkipCard() {
    if (!this.config || !this.hass) return html``;
    const lang = this.hass.language;
    const metric = this.config.units !== "imperial";
    const t = (key: string) => localize(`measured_skip.${key}`, lang);
    const toggle = (key: string, checked: boolean | undefined) => html`
      <ha-switch
        .checked=${!!checked}
        @change=${(e: Event) =>
          this.handleConfigChange({ [key]: (e.target as any).checked })}
      ></ha-switch>
    `;
    const entity = (
      key: string,
      value: string | null | undefined,
      domains: string[],
      label: string,
      hint: string,
    ) => html`
      <div class="setting-row">
        <div class="setting-label">
          ${label}
          <div class="setting-hint">${hint}</div>
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${value || ""}
          .includeDomains=${domains}
          allow-custom-entity
          @value-changed=${(e: CustomEvent) =>
            this.handleConfigChange({ [key]: e.detail?.value || null })}
        ></ha-entity-picker>
      </div>
    `;
    const section = (title: string, description: string, body: unknown) => html`
      <div class="si-subgroup">
        <div class="si-subgroup-title">${title}</div>
        <div class="setting-hint">${description}</div>
        ${body}
      </div>
    `;
    const threshold = (
      key: string,
      value: number | null | undefined,
      fallback: number,
      unit: string,
      step: number,
    ) =>
      this._numRow(
        t("threshold"),
        unit,
        value ?? fallback,
        (v) =>
          this.handleConfigChange({
            [key]: v === "" ? null : parseFloat(v),
          }),
        step,
      );

    return html`
      <ha-card header="${t("title")}">
        <div class="card-content">${t("description")}</div>
        <div class="card-content">
          ${section(
            t("rain.title"),
            t("rain.description"),
            html`
              <div class="setting-row">
                <div class="setting-label">${t("enabled")}</div>
                ${toggle(
                  "skip_on_rain_sensor",
                  this.config.skip_on_rain_sensor,
                )}
              </div>
              ${this.config.skip_on_rain_sensor
                ? html`${entity(
                    "rain_sensor",
                    this.config.rain_sensor,
                    ["binary_sensor"],
                    t("sensor"),
                    t("rain.sensor-hint"),
                  )}
                  ${this.config.ui_mode === "advanced"
                    ? html`<div class="setting-row">
                          <div class="setting-label">
                            ${t("rain.history-label")}
                          </div>
                          ${toggle(
                            "rain_history_enabled",
                            this.config.rain_history_enabled,
                          )}
                        </div>
                        <div class="card-content">
                          ${t("rain.history-description")}
                        </div>`
                    : ""}`
                : ""}
            `,
          )}
          ${section(
            t("freeze.title"),
            t("freeze.description"),
            html`
              <div class="setting-row">
                <div class="setting-label">${t("enabled")}</div>
                ${toggle("skip_on_freeze", this.config.skip_on_freeze)}
              </div>
              ${this.config.skip_on_freeze
                ? html`${threshold(
                    "freeze_threshold",
                    this.config.freeze_threshold,
                    metric ? 2 : 36,
                    metric ? "°C" : "°F",
                    0.5,
                  )}
                  ${entity(
                    "freeze_sensor",
                    this.config.freeze_sensor,
                    ["sensor"],
                    t("sensor-optional"),
                    t("freeze.sensor-hint"),
                  )}`
                : ""}
            `,
          )}
          ${section(
            t("wind.title"),
            t("wind.description"),
            html`
              <div class="setting-row">
                <div class="setting-label">${t("enabled")}</div>
                ${toggle("skip_on_wind", this.config.skip_on_wind)}
              </div>
              ${this.config.skip_on_wind
                ? html`${threshold(
                    "wind_threshold",
                    this.config.wind_threshold,
                    metric ? 20 : 12,
                    metric ? "km/h" : "mph",
                    1,
                  )}
                  ${entity(
                    "wind_sensor",
                    this.config.wind_sensor,
                    ["sensor"],
                    t("sensor-optional"),
                    t("wind.sensor-hint"),
                  )}`
                : ""}
            `,
          )}
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
                <div class="setting-note">
                  ${localize(
                    "observed_watering.direct_control_description",
                    lang,
                  )}
                </div>
              `
            : ""}

          <div class="setting-row">
            <div class="setting-label">
              ${localize("observed_watering.full_controller_label", lang)}
            </div>
            <ha-switch
              .checked=${this.config.full_controller === true}
              @change=${(e: Event) => {
                this.handleConfigChange({
                  full_controller: (e.target as any).checked,
                  // Switching it on drives the valves, which the backend turns
                  // on too; mirrored here since our own save is not echoed back.
                  ...((e.target as any).checked
                    ? { direct_valve_control_enabled: true }
                    : {}),
                });
                // The main program the backend creates comes back with a reload.
                window.setTimeout(() => this._fetchData(), 1500);
              }}
            ></ha-switch>
          </div>
          <div class="setting-note">
            ${localize("observed_watering.full_controller_description", lang)}
          </div>

          <!-- Sequencing also decides what a start trigger works back from to
               finish at sunrise, so it applies whether Smart Irrigation drives
               the valves or an automation of your own does. -->
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
                ${localize("observed_watering.sequencing.sequential", lang)}
              </option>
              <option
                value="parallel"
                ?selected=${this.config.zone_sequencing === "parallel"}
              >
                ${localize("observed_watering.sequencing.parallel", lang)}
              </option>
            </select>
          </div>
          <div class="setting-note">
            ${localize("observed_watering.sequencing_description", lang)}
          </div>

          ${this.config.direct_valve_control_enabled &&
          this.config.ui_mode === "advanced"
            ? this.renderCycleAndSoak(lang)
            : ""}
        </div>
      </ha-card>
    `;
  }

  /**
   * Cycle and soak, and the pause between two zones.
   *
   * Both only mean anything when Smart Irrigation opens the valves itself, and
   * both are for an installation somebody has already tuned: they are shown on
   * the advanced panel only. Left alone, a zone waters in one go, which is what
   * it has always done.
   */
  renderCycleAndSoak(lang: string) {
    if (!this.config) return html``;
    const config = this.config;
    const passes = Number(config.watering_passes ?? 1) || 1;
    const sequential = config.zone_sequencing !== "parallel";
    return html`
      ${this._numRow(
        localize("observed_watering.passes_label", lang),
        "",
        passes,
        (v) =>
          this.handleConfigChange({
            watering_passes: Math.min(6, Math.max(1, parseInt(v) || 1)),
          }),
      )}
      ${passes > 1
        ? html`${this._numRow(
              localize("observed_watering.soak_label", lang),
              localize("observed_watering.minutes", lang),
              config.soak_minutes ?? 15,
              (v) =>
                this.handleConfigChange({
                  soak_minutes: Math.max(0, parseFloat(v) || 0),
                }),
            )}
            <div class="card-content">
              ${localize("observed_watering.passes_description", lang)}
            </div>`
        : html`<div class="card-content">
            ${localize("observed_watering.passes_description", lang)}
          </div>`}
      ${sequential
        ? html`${this._numRow(
              localize("observed_watering.pause_between_zones_label", lang),
              localize("observed_watering.seconds", lang),
              config.pause_between_zones ?? 0,
              (v) =>
                this.handleConfigChange({
                  pause_between_zones: Math.max(0, parseFloat(v) || 0),
                }),
            )}
            <div class="card-content">
              ${localize(
                "observed_watering.pause_between_zones_description",
                lang,
              )}
            </div>`
        : ""}
    `;
  }

  /**
   * Standard or advanced.
   *
   * The advanced panel shows the settings that tune the model: the drainage
   * law, the thresholds, the multiplier, how far ahead a zone looks. They have
   * sound defaults, and meeting them by accident is how a working
   * installation gets broken, so the standard panel leaves them out. Nothing
   * is lost by switching: the values are kept either way.
   */
  renderPanelModeCard() {
    if (!this.hass || !this.config) return html``;
    const advanced = this.config.ui_mode === "advanced";
    return html`<ha-card
      header="${localize(
        "panels.general.cards.panel-mode.header",
        this.hass.language,
      )}"
    >
      <div class="card-content">
        <div class="setting-row">
          <div class="setting-label">
            ${localize(
              "panels.general.cards.panel-mode.labels.advanced",
              this.hass.language,
            )}
            <div class="setting-hint">
              ${localize(
                "panels.general.cards.panel-mode.labels.advanced-hint",
                this.hass.language,
              )}
            </div>
          </div>
          <ha-switch
            .checked=${advanced}
            @change=${(e: Event) =>
              this.handleConfigChange({
                ui_mode: (e.target as any).checked ? "advanced" : "standard",
              })}
          ></ha-switch>
        </div>
      </div>
    </ha-card>`;
  }

  renderCalculationLogCard() {
    if (!this.config || !this.data || !this.hass) return html``;
    const lang = this.hass.language;

    return html`
      <ha-card header="${localize("calculation_log.title", lang)}">
        <div class="card-content">
          ${localize("calculation_log.description", lang)}
        </div>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize("calculation_log.enabled_label", lang)}
            </div>
            <ha-switch
              .checked=${this.config.calc_log_enabled}
              @change=${(e: Event) =>
                this.handleConfigChange({
                  calc_log_enabled: (e.target as any).checked,
                })}
            ></ha-switch>
          </div>
          ${this.config.calc_log_enabled
            ? html`<div
                class="zoneline"
                style="color: var(--secondary-text-color); font-style: italic;"
              >
                ${localize("calculation_log.file_hint", lang)}
              </div>`
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
    if (this._liveTimer !== undefined) {
      window.clearInterval(this._liveTimer);
      this._liveTimer = undefined;
    }

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
    hint = "",
  ): TemplateResult {
    return html`
      <div class="setting-row">
        <div class="setting-label">
          ${label}${hint ? html`<div class="setting-hint">${hint}</div>` : ""}
        </div>
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
    label: string | TemplateResult,
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

      /* The explanation under a setting: a nested .card-content has no
         padding of its own, so the text sat on the divider above it. */
      .setting-note {
        padding: 10px 0 12px;
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
      .trigger-active-hint {
        color: var(--secondary-text-color);
        font-size: 0.85em;
        line-height: 1.4;
        margin-top: 6px;
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
