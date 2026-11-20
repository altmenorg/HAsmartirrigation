import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
  css,
  html,
} from "lit";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant, fireEvent } from "custom-card-helpers";
import { UnsubscribeFunc } from "home-assistant-js-websocket";

import {
  fetchConfig,
  fetchIrrigationHistory,
  fetchIrrigationInfo,
  fetchMappings,
  fetchZones,
  IrrigationHistoryRecord,
  saveConfig,
  saveZone,
} from "../../data/websockets";
import { todayRuns } from "../../data/week";
import { SubscribeMixin } from "../../subscribe-mixin";
import { localize } from "../../../localize/localize";
import {
  friendlyDuration,
  liveValves,
  momentLabel,
  remainingDuration,
} from "../../card/format";
import {
  output_unit,
  unit_text,
  pick,
  handleError,
  displayVolume,
  storedVolume,
  navigate,
  readingUses,
  countLabel,
  programCanRun,
} from "../../helpers";
import { loadHaForm, loadHaYamlEditor } from "../../load-ha-elements";
import "./program-timeline";
import "./week-view";
import "./program-flow";
import { programFlow, weatherVerdict } from "../../data/program-flow";
import { Timeline } from "../../data/timeline";
import { programFromYaml, programToYaml } from "../../data/program-yaml";
import {
  afterIsMissing,
  dependentsOf,
  wouldLoop,
} from "../../data/program-chain";
import { notifyTargets } from "../../data/notify-targets";
import {
  hiddenInAdvanced,
  hiddenLine,
  hiddenOptions,
  SKIP_CONDITION_IDS,
  withProgram,
  withSchedule,
  withStep,
} from "../../data/yaml-only";
import { formatNumber } from "../../number-format";
import "../../dialogs/trigger-dialog";
import { askConfirmation } from "../../dialogs/confirmation-dialog";
import {
  SmartIrrigationConfig,
  SmartIrrigationMapping,
  SmartIrrigationProgram,
  SmartIrrigationSchedule,
  SmartIrrigationStep,
  SmartIrrigationSupply,
  SmartIrrigationZone,
  IrrigationStartTrigger,
  SkipEvaluation,
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
  TRIGGER_TYPE_TIME,
  TRIGGER_DEFAULT_AT,
  DOMAIN,
  MAPPING_TEMPERATURE,
  MAPPING_WINDSPEED,
  ZONE_WATER_VOLUME,
} from "../../const";
import {
  mdiPlus,
  mdiPencil,
  mdiFormSelect,
  mdiDelete,
  mdiMenuDown,
  mdiMinus,
  mdiPlay,
  mdiStop,
  mdiCheck,
  mdiCodeBraces,
  mdiClose,
  mdiTune,
} from "@mdi/js";

/**
 * What is unfolded in the Programs page: programs, steps and schedules, by id.
 *
 * Kept outside the element: each tab renders its own template, so switching
 * tabs creates a new element and an instance field would fold everything back.
 */

// The days the week view shows, kept by this browser across tabs and reloads
// (#1051). Storage can be missing or refused (private window): then 7.
const WEEK_DAYS_KEY = "smart_irrigation.week_days";
function readWeekDays(): number {
  try {
    const days = Number(window.localStorage.getItem(WEEK_DAYS_KEY));
    return [3, 7, 14].includes(days) ? days : 7;
  } catch {
    return 7;
  }
}
function saveWeekDays(days: number): void {
  try {
    window.localStorage.setItem(WEEK_DAYS_KEY, String(days));
  } catch {
    // Not kept: the next visit shows 7 days.
  }
}

const UNFOLDED = new Set<string>();
// "More options" that hold a setting open by themselves; one closed by
// hand stays closed.
const FOLDED_BY_HAND = new Set<string>();

/** What is typed next to "Run now" and in the adjust block, by program id. */
const RUN_OPTIONS: Record<string, { seconds?: string; replace?: boolean }> = {};
const ADJUST_OPTIONS: Record<
  string,
  { percent?: string; seconds?: string; hours?: string }
> = {};

/** What the backend makes of a program as written (program_preview). */
interface ProgramPreview {
  program: SmartIrrigationProgram;
  timeline: Timeline;
  unknown_zones: number[];
  unknown_zone_names: string[];
  zones_not_watered: { zone_id: number; zone: string | null }[];
  /** Names of the programs that would start each other in a loop, or null. */
  chain_loop?: string[] | null;
  /** What an "after" schedule names that is no program. */
  unknown_after_programs?: string[];
}

/**
 * The timeline of each program as last asked, by program id, with what it was
 * asked for: asked again when the program changes or it is a minute old.
 */
// How each program's run is drawn: the flow (default) or the timeline.
const RUN_VIEW: Record<string, "flow" | "timeline"> = {};

const PREVIEWS: Record<
  string,
  { key: string; at: number; data?: ProgramPreview; pending?: boolean }
> = {};

/**
 * A program edited as YAML, by program id ("" for a new one): what the editor
 * opened on (kept, so a render does not put it back over what is typed), what
 * is typed, whether it reads as YAML, and what the backend makes of it.
 */
const YAML_EDITS: Record<
  string,
  {
    initial: unknown;
    value?: unknown;
    valid: boolean;
    preview?: ProgramPreview;
    key?: string;
    error?: string;
  }
> = {};

@customElement("smart-irrigation-view-general")
export class SmartIrrigationViewGeneral extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() narrow!: boolean;
  @property() path!: Path;

  @property() data?: Partial<SmartIrrigationConfig>;
  @property() config?: SmartIrrigationConfig;
  // Which page of the Watering tab this is (planning, programs, supplies);
  // unset, it is the General page of the settings.
  @property() section?: string;
  // The sensor groups, for the skip page to say where a reading it shares
  // with them comes from (#972).
  @property({ attribute: false }) mappings: SmartIrrigationMapping[] = [];
  // The zones a step can water (full controller programs).
  @property({ attribute: false }) zones: SmartIrrigationZone[] = [];
  // What the programs are doing, and what they will do (full controller).
  @property({ attribute: false }) planning: any[] = [];
  @property({ attribute: false }) programsState?: any;
  // What the skip checks say for the next start, for the flow's weather node
  // (Programs page only, read with the planning).
  private _skipPreview?: SkipEvaluation | null;
  private _liveTimer?: number;
  private _unfolded = UNFOLDED;

  // How many days the week view shows (3, 7 or 14).
  private _weekDays = readWeekDays();
  // The last zone runs watered, for today's row of the week view.
  private _history: IrrigationHistoryRecord[] = [];
  private _wasWatering = false;

  private _isOpen(key: string): boolean {
    return this._unfolded.has(key);
  }

  /** An id for something just added, unfolded so it can be filled in. */
  private _openNew(kind: string, id: string): string {
    this._unfolded.add(`${kind}:${id}`);
    return id;
  }

  private _setOpen(key: string, open: boolean) {
    if (open) this._unfolded.add(key);
    else this._unfolded.delete(key);
  }

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
  // Returns a promise settled once the batch the change went into is saved.
  private debouncedSave = (() => {
    let timeoutId: number | null = null;
    let pending: Partial<SmartIrrigationConfig> = {};
    let waiting: Array<() => void> = [];
    return (changes: Partial<SmartIrrigationConfig>): Promise<void> => {
      pending = { ...pending, ...changes };
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const done = new Promise<void>((resolve) => waiting.push(resolve));
      timeoutId = window.setTimeout(() => {
        const batch = pending;
        const resolvers = waiting;
        pending = {};
        waiting = [];
        timeoutId = null;
        this.saveData(batch)
          .catch(() => undefined)
          .then(() => resolvers.forEach((resolve) => resolve()));
      }, 500); // 500ms debounce
      return done;
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
      if (this.section === "skip") {
        try {
          this.mappings = await fetchMappings(this.hass);
        } catch (error) {
          console.error("Error fetching sensor groups:", error);
        }
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

  /** The section a link asked for ("…/general/at/control"), once shown. */
  private _scrolledTo?: string;

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    const wanted = this.path?.params?.at;
    if (!wanted || wanted === this._scrolledTo) return;
    if (!this.shadowRoot?.querySelector(`#section-${wanted}`)) return;
    this._scrolledTo = wanted;
    // The cards above it are still filling in, and move it down as they do:
    // scroll once they have.
    window.setTimeout(() => {
      this.shadowRoot
        ?.querySelector(`#section-${wanted}`)
        ?.scrollIntoView({ block: "start" });
    }, 400);
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
      // When the watering duration is calculated is one question; what starts
      // the watering (a schedule, or the start event) is another.
      const base = "panels.general.cards.automatic-duration-calculation.labels";
      const calcWhen = this.config.recalculate_before_start
        ? "start"
        : this.config.autocalcenabled
          ? "time"
          : "manual";
      // When Smart Irrigation waters, the duration is best worked out just
      // before each start, with the freshest weather: there is nothing to
      // choose, in any mode. The choice matters when something else starts
      // the watering ("Calculate only"), and stays in sight when another
      // moment was stored, so that it can be put back.
      const advancedMode = this.config.ui_mode === "advanced";
      // "Calculate only" has no program: its start is the start event.
      const calcOnly = this.config.full_controller !== true;
      const showCalcWhen = calcOnly || calcWhen !== "start";
      // The hourly equation is on for a new installation; the daily one is
      // there for the older ones. The advanced mode only, unless it is off.
      const showHourly = advancedMode || !this.config.hourly_calculation;
      const showEffectiveRain = advancedMode || !this.config.effective_rain;
      const showCalcLog = advancedMode || !!this.config.calc_log_enabled;
      let r1 = html`${showCalcWhen
        ? html`<div class="card-content">
            ${this._selectRow(
              html`${localize(`${base}.calc-when`, this.hass.language)}
                <si-info>
                  ${localize(
                    calcOnly
                      ? `${base}.calc-when-hint-calc-only`
                      : `${base}.calc-when-hint`,
                    this.hass.language,
                  )}
                </si-info>`,
              html`
                <option value="time" ?selected=${calcWhen === "time"}>
                  ${localize(`${base}.calc-when-time`, this.hass.language)}
                </option>
                <option value="start" ?selected=${calcWhen === "start"}>
                  ${localize(
                    calcOnly
                      ? `${base}.calc-when-start-event`
                      : `${base}.calc-when-start`,
                    this.hass.language,
                  )}
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
          </div>`
        : ""}`;
      // "Just before each start" keeps the daily calculation too, at this
      // time, so the water balance moves between two starts.
      if (calcWhen === "time" || (calcWhen === "start" && showCalcWhen)) {
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
      const showRows = showHourly || showEffectiveRain || showCalcLog;
      r1 = html`${r1}
      ${showRows
        ? html`<div class="card-content">
            ${showHourly
              ? html`<div class="setting-row">
                  <div class="setting-label">
                    ${localize(
                      `${base}.hourly-calculation`,
                      this.hass.language,
                    )}<si-info
                      >${localize(
                        `${base}.hourly-calculation-hint`,
                        this.hass.language,
                      )}</si-info
                    >
                  </div>
                  <ha-switch
                    .checked=${this.config.hourly_calculation}
                    @change=${(e: Event) =>
                      this.handleConfigChange({
                        hourly_calculation: (e.target as any).checked,
                      })}
                  ></ha-switch>
                </div>`
              : ""}
            ${
              // On for a new installation, and not a decision anybody has to take:
              // a light shower does not reach the roots. It acts on the rain that
              // fell, in every calculation, which is why it lives here and not
              // with the forecast. The advanced mode only, unless it was turned
              // off, so that is not hidden.
              showEffectiveRain
                ? html`<div class="setting-row">
                    <div class="setting-label">
                      ${localize(
                        "weather_skip.effective_rain_label",
                        this.hass.language,
                      )}<si-info
                        >${localize(
                          "weather_skip.effective_rain_description",
                          this.hass.language,
                        )}</si-info
                      >
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
            ${
              // The calculation audit log, for chasing a calculation down: a
              // row of this card rather than a card of its own (#1056). The
              // advanced mode only, unless it is on (it writes a file).
              showCalcLog
                ? html`<div class="setting-row">
                    <div class="setting-label">
                      ${localize(
                        "calculation_log.title",
                        this.hass.language,
                      )}<si-info
                        >${localize(
                          "calculation_log.description",
                          this.hass.language,
                        )}
                        ${localize(
                          "calculation_log.file_hint",
                          this.hass.language,
                        )}</si-info
                      >
                    </div>
                    <ha-switch
                      .checked=${!!this.config.calc_log_enabled}
                      @change=${(e: Event) =>
                        this.handleConfigChange({
                          calc_log_enabled: (e.target as any).checked,
                        })}
                    ></ha-switch>
                  </div>`
                : ""
            }
          </div>`
        : ""}`;
      // Nothing left to choose (Calculate and water, every value at its
      // default): no card with a title and nothing under it.
      const showCalcCard = showCalcWhen || showRows;
      r1 = !showCalcCard
        ? html``
        : html`<ha-card
            ><h1 class="card-header">
              <span
                >${localize(
                  "panels.general.cards.automatic-duration-calculation.header",
                  this.hass.language,
                )}<si-info
                  >${localize(
                    "panels.general.cards.automatic-duration-calculation.description",
                    this.hass.language,
                  )}</si-info
                ></span
              >
            </h1>
            ${r1}</ha-card
          >`;
      // How often the weather is read: every hour, as it is out of the box,
      // suits everybody. The advanced mode only, unless it was changed (off,
      // another interval, a delay), so that a setting in use is never hidden.
      const advanced = this.config.ui_mode === "advanced";
      const showAutoUpdate =
        advanced ||
        this.config.autoupdateenabled === false ||
        Number(this.config.autoupdateinterval ?? 1) !== 1 ||
        (this.config.autoupdateschedule ?? AUTO_UPDATE_SCHEDULE_HOURLY) !==
          AUTO_UPDATE_SCHEDULE_HOURLY ||
        Number(this.config.autoupdatedelay ?? 0) !== 0;
      let r2 = html`<div class="card-content">
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
      // The delay before the first update is a developer's setting: the
      // advanced mode only, unless it is set.
      if (
        this.data.autoupdateenabled &&
        (advanced || Number(this.config.autoupdatedelay ?? 0) !== 0)
      ) {
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

      r2 = html`<ha-card
        ><h1 class="card-header">
          <span
            >${localize(
              "panels.general.cards.automatic-update.header",
              this.hass.language,
            )}<si-info
              >${localize(
                "panels.general.cards.automatic-update.description",
                this.hass.language,
              )}</si-info
            ></span
          >
        </h1>
        ${r2}</ha-card
      >`;

      // Recording every change of a sensor is for those who have a rain gauge
      // or a sensor that moves all day: the advanced mode, unless it is already
      // on, so that nothing in use is hidden.
      const showContinuous =
        this.config.ui_mode === "advanced" || !!this.config.continuousupdates;
      let r4 = html`<div class="card-content">
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
      // The debounce is a developer's setting: the advanced mode only, unless
      // it was changed from its 100 ms.
      if (
        this.data.continuousupdates &&
        (advanced || Number(this.config.sensor_debounce ?? 100) !== 100)
      ) {
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
        ><h1 class="card-header">
          <span
            >${localize(
              "panels.general.cards.continuousupdates.header",
              this.hass.language,
            )}<si-info
              >${localize(
                "panels.general.cards.continuousupdates.description",
                this.hass.language,
              )}</si-info
            ></span
          >
        </h1>
        ${r4}</ha-card
      > `;

      // Irrigation Start Triggers Card
      const r5 = this.renderTriggersCard();

      // Weather-based Skip Card
      const r6 = this.renderWeatherSkipCard();

      // Coordinate Configuration Card: Home Assistant's location is right for
      // nearly everybody. The advanced mode only, and always once manual
      // coordinates are on, so the weather is never read out of sight for
      // somewhere else.
      const r7 =
        advanced || this.data.manual_coordinates_enabled
          ? this.renderCoordinateCard()
          : html``;

      // Days Between Irrigation Card
      const r8 = this.renderDaysBetweenIrrigationCard();

      // Observed Watering (closed-loop bucket) Card
      const r9 = this.renderObservedWateringCard();

      // How much of the panel to show, and whether the bundled blueprints
      // are copied (#930): one card of two rows (#1056).
      const r11 = this.renderPanelModeCard();

      // Seasonal adjustments (advanced).
      const r13 = this.renderSeasonalAdjustmentsCard();

      // Pumps and main valves (full controller).
      const r14 = this.renderSuppliesCard();

      // The full controller, right after how much of the panel to show.

      // The way to the setup assistant, which is no longer a tab. It comes first:
      // it is where somebody who has nothing set up wants to start.
      const r12 = this.renderSetupAssistantCard();

      // Moving over from Irrigation Unlimited, right after it.
      const r17 = this.renderIuImportCard();

      // The master switch, above everything it switches.
      const r18 = this.renderMasterSwitchCard();

      // Below the weather service: where it is read for, and how often.
      if (this.section === "weather") {
        return html`${r7}${showAutoUpdate ? r2 : ""}`;
      }
      // Above the sensor groups: recording their sensors at every change
      // decides how each group's readings are combined, so it sits with them.
      if (this.section === "sensors") {
        return showContinuous ? r4 : html``;
      }
      // The checks that hold a run back on the weather, beside the sensors
      // they read.
      if (this.section === "skip") {
        return this.renderSkipPage(html`${r6}${r8}`);
      }
      if (this.section) {
        return this.renderWateringSection(r5);
      }
      // In full controller mode the programs' schedules start the watering:
      // the start trigger is for "Calculate only".
      const full = this.config.full_controller === true;
      const lang = this.hass.language;
      const icons: Record<string, string> = {
        calculation: "mdi:calculator-variant-outline",
        control: "mdi:valve",
        system: "mdi:cog-outline",
      };
      const heading = (key: string) =>
        html`<div class="settings-section" id="section-${key}">
          <ha-icon icon=${icons[key]}></ha-icon>
          <div>
            <h2>
              ${localize(`panels.general.sections.${key}`, lang)}<si-info
                >${localize(
                  `panels.general.sections.${key}-sub`,
                  lang,
                )}</si-info
              >
            </h2>
          </div>
        </div>`;

      // Three sections, each card in one (#972): what is worked out, what
      // opens the valves, and the panel itself. The weather, its location and
      // how often it is read are on the Weather tab, with the skip checks: a
      // card here said only that, and is gone (the tab is in plain sight).
      // The master switch stays above everything it switches.
      // The days between irrigation are on the Weather tab's skip page, with
      // every other check that holds a run back.
      const r = html`${r18} ${heading("calculation")}${r1}${r13}
      ${
        // Observed watering is on the advanced panel, the start triggers are
        // for "Calculate only": with neither, the heading stood alone.
        !full || this.config.ui_mode === "advanced"
          ? html`${heading("control")}${r9}${full ? "" : r5}`
          : ""
      }
      ${heading("system")}${r11}${r12}${r17}`;

      return r;
    }
  }

  /** One page of the Watering tab. ``triggers`` is the start trigger card. */
  renderWateringSection(triggers: TemplateResult) {
    if (!this.config || !this.hass) return html``;
    if (this.config.full_controller !== true) {
      return html`<ha-card>
        <div class="card-content">
          ${localize("programs.mode_off", this.hass.language)}
        </div>
      </ha-card>`;
    }
    if (this.section === "planning") {
      return html`${this.renderWeekCard()} ${this.renderPlanningCard()}`;
    }
    if (this.section === "supplies") {
      return html`${this.renderSuppliesCard()}`;
    }
    // Every program in one list, each the same way: there is no main program
    // any more. The start trigger card is for calculating only (one_choice.py).
    void triggers;
    return html`${this.renderProgramsCard()}`;
  }

  /** Links to zones of the Zones page, each opening its zone (#969); the
   * text may carry the zone's value ("Lawn 3"). */
  private _zoneLinks(zones: { zone_id: number; zone: string }[]) {
    return zones.map(
      (z, index) =>
        html`${index ? ", " : ""}<a
            href="/${DOMAIN}/zones/zone/${z.zone_id}"
            @click=${(e: Event) => {
              e.preventDefault();
              navigate(this, `/${DOMAIN}/zones/zone/${z.zone_id}`);
            }}
            >${z.zone}</a
          >`,
    );
  }

  /** What the programs are doing now, one line each, and the valves that are open. */
  /** What is watering now, or nothing (the card is only shown then). */
  renderLiveState(): TemplateResult | undefined {
    const state = this.programsState;
    if (!this.hass || !state) return undefined;
    const lang = this.hass.language;
    const t = (key: string) => localize(`planning.${key}`, lang);
    const live = state.live;
    if (!live) return html``;
    const left = (seconds: number) =>
      t("left").replace("{time}", remainingDuration(seconds));
    // A pause says when it lifts itself: nothing said it would (UX walk of
    // 9 Nov., evening).
    const pausedText = live.paused_until
      ? t("paused_until").replace(
          "{when}",
          momentLabel(live.paused_until, lang, {
            tomorrow: localize("card.tomorrow", lang),
            yesterday: localize("card.yesterday", lang),
          }),
        )
      : t("paused");
    const rows = [
      ...(live.paused
        ? [
            html`<div class="setting-note">
              <strong>${pausedText}</strong>
            </div>`,
          ]
        : []),
      ...(live.programs || []).map(
        (p: any) => html`
          <div class="setting-note">
            <strong>${this._programLabel(p.program_id, p.name)}</strong>
            ${p.state === "waiting"
              ? html` - ${t("waiting")}`
              : html` - ${t("step")}
                ${p.step}/${p.steps}${p.tours > 1
                  ? html`, ${t("tour")} ${p.tour}/${p.tours}`
                  : ""},
                ${p.percent} %, ${left(p.remaining_seconds || 0)}`}
          </div>
        `,
      ),
      ...liveValves(live).map(
        (v: any) => html`
          <div class="setting-note">
            ${v.zone}: ${left(v.remaining_seconds)} (${v.percent}
            %)${v.passes
              ? `, ${t("pass_of")
                  .replace("{pass}", String(v.pass))
                  .replace("{passes}", String(v.passes))}`
              : ""}
          </div>
        `,
      ),
      // Between two passes, and while a pump comes up: nothing is open, and
      // the run goes on (UX walk of 13 Nov., Q6, Q18).
      ...(live.soaking || []).map(
        (v: any) => html`
          <div class="setting-note">
            ${v.zone}:
            ${t("soaking")
              .replace(
                "{when}",
                momentLabel(v.until, lang, {
                  tomorrow: localize("card.tomorrow", lang),
                  yesterday: localize("card.yesterday", lang),
                }),
              )
              .replace("{pass}", String(v.next_pass))
              .replace("{passes}", String(v.passes))}
          </div>
        `,
      ),
      ...(live.starting || []).map(
        (v: any) => html`
          <div class="setting-note">
            ${v.zone}: ${t("starting").replace("{supply}", v.supply || "")}
          </div>
        `,
      ),
    ];
    if (!rows.length) return undefined;
    return html`${rows}`;
  }

  /** The next days at a glance: a row per day, each run a block (week-view.ts). */
  renderWeekCard() {
    if (!this.config || !this.hass || this.config.full_controller !== true) {
      return html``;
    }
    const lang = this.hass.language;
    return html`<ha-card>
      <h1 class="card-header">
        <span
          >${localize("week.title", lang)}<si-info
            >${localize("week.help", lang)}</si-info
          ></span
        >
      </h1>
      <div class="card-content">
        <si-week-view
          .planning=${this.planning || []}
          .today=${todayRuns(
            this._history,
            this.programsState?.programs || [],
            new Date(),
          )}
          .lang=${lang}
          .days=${this._weekDays}
          .programLabel=${(id: string, name: string) =>
            this._programLabel(id, name)}
          @days-changed=${(e: CustomEvent) => {
            this._weekDays = e.detail.days;
            saveWeekDays(this._weekDays);
            this._fetchLive(true);
          }}
          @open-program=${(e: CustomEvent) => {
            const id = e.detail.program_id;
            if (id) this._setOpen(`program:${id}`, true);
            navigate(this, `/${DOMAIN}/programs`);
          }}
        ></si-week-view>
      </div>
    </ha-card>`;
  }

  /** What is watering now; the runs to come are in the week chart above. */
  renderPlanningCard() {
    if (!this.config || !this.hass || this.config.full_controller !== true) {
      return html``;
    }
    const live = this.renderLiveState();
    if (!live) return html``;
    const lang = this.hass.language;
    return html`
      <ha-card header="${localize("planning.now", lang)}">
        <div class="card-content">${live}</div>
      </ha-card>
    `;
  }

  private async _fetchLive(withPlanning: boolean): Promise<void> {
    if (!this.hass || this.config?.full_controller !== true) return;
    // The weather pages show no program.
    if (
      this.section === "weather" ||
      this.section === "sensors" ||
      this.section === "skip"
    )
      return;
    try {
      this.programsState = await this.hass.callWS({
        type: DOMAIN + "/programs_state",
      });
      if (withPlanning) {
        this.planning = await this.hass.callWS({
          type: DOMAIN + "/planning",
          days: Math.max(3, this._weekDays),
        });
        // The flow's "Weather allows it?" answers with what the checks say.
        if (this.section === "programs") {
          try {
            this._skipPreview =
              (await fetchIrrigationInfo(this.hass))?.skip_preview ?? null;
          } catch {
            // The node stays neutral.
            this._skipPreview = undefined;
          }
        }
      }
      // What watered today, for the week view's first row: read with the
      // live state while something waters (a zone just done shows at once),
      // with the planning otherwise.
      const watering = (this.programsState?.programs || []).some(
        (p: any) => p.state === "running" || p.state === "paused",
      );
      if (
        this.section === "planning" &&
        (withPlanning || watering || this._wasWatering)
      ) {
        try {
          this._history =
            (await fetchIrrigationHistory(this.hass, 100)).records || [];
        } catch {
          // Today's row shows only what is planned.
        }
      }
      this._wasWatering = watering;
      this._scheduleUpdate();
    } catch (error) {
      console.error("Error fetching the programs' state:", error);
    }
  }

  /**
   * What a run of ``program`` would do, from the cache; asked of the backend
   * when the program changed or the answer is a minute old (the zones'
   * durations move with the weather).
   */
  private _preview(
    id: string,
    program: SmartIrrigationProgram,
  ): ProgramPreview | undefined {
    const key = JSON.stringify(program);
    const cached = PREVIEWS[id];
    const fresh =
      cached && cached.key === key && Date.now() - cached.at < 60000;
    if (!fresh && !cached?.pending && this.hass) {
      PREVIEWS[id] = { ...(cached || {}), key, at: Date.now(), pending: true };
      // Typing in a field changes the program at each key: a moment's wait.
      window.setTimeout(async () => {
        try {
          const data = await this.hass!.callWS<ProgramPreview>({
            type: DOMAIN + "/program_preview",
            program,
          });
          PREVIEWS[id] = { key, at: Date.now(), data };
        } catch (error) {
          console.error("Error drawing the program:", error);
          PREVIEWS[id] = { key, at: Date.now(), data: cached?.data };
        }
        this._scheduleUpdate();
      }, 400);
    }
    return PREVIEWS[id]?.data;
  }

  /** What the backend makes of the YAML typed for a program. */
  private _yamlPreview(
    id: string,
    value: unknown,
    replacing?: SmartIrrigationProgram,
  ): void {
    const edit = YAML_EDITS[id];
    if (!edit || !this.hass) return;
    const program = programFromYaml(value, replacing);
    if (!program) {
      edit.preview = undefined;
      edit.error = localize("programs.yaml_not_a_program", this.hass.language);
      this._scheduleUpdate();
      return;
    }
    const key = JSON.stringify(program);
    edit.key = key;
    window.setTimeout(async () => {
      if (YAML_EDITS[id] !== edit || edit.key !== key) return;
      try {
        const data = await this.hass!.callWS<ProgramPreview>({
          type: DOMAIN + "/program_preview",
          program,
        });
        if (edit.key !== key) return;
        edit.preview = data;
        edit.error = undefined;
      } catch (error: any) {
        edit.preview = undefined;
        edit.error = error?.message ?? String(error);
      }
      this._scheduleUpdate();
    }, 400);
  }

  /**
   * Programs: what is watered, in what order, for how long.
   *
   * Only in full controller mode. Every program is the same kind: its steps,
   * started on its own by its schedules that are on, or by hand. A step is one
   * or several zones watered together; by default it takes the duration Smart
   * Irrigation calculated.
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
      // Every key the form does not show (in this mode) is kept.
      save(programs.map((p, n) => (n === index ? withProgram(p, changes) : p)));
    const num = (v: string, fallback = 0) => {
      const n = parseFloat(v);
      return isNaN(n) ? fallback : n;
    };
    const programName = (program: SmartIrrigationProgram) =>
      this._programLabel(program.id ?? "", program.name);
    const toast = (message: string) =>
      fireEvent(this, "hass-notification" as any, { message } as any);
    const run = async (program: SmartIrrigationProgram) => {
      const id = program.id;
      const name = programName(program);
      // It opens real valves, and nothing on the page used to say it had:
      // asked first, then told what came of it (#893).
      // Optional total duration and the replace mode, typed next to the button.
      const opts = RUN_OPTIONS[id ?? ""] || {};
      // With "Replace what is running" the question says what it stops: it
      // only said the valves would open (UX walk of 13 Nov., Q21).
      const busy = (this.programsState?.programs || []).some((p: any) =>
        ["running", "paused", "waiting"].includes(p.state),
      );
      const question = (
        opts.replace && busy ? t("confirm_run_replace") : t("confirm_run")
      ).replace("{name}", name);
      if (!(await this._ask(question))) return;
      const seconds = Math.round(parseFloat(opts.seconds ?? ""));
      const data: Record<string, unknown> = { program_id: id };
      if (seconds > 0) data.seconds = Math.min(seconds, 86400);
      if (opts.replace) data.mode = "replace";
      try {
        await this.hass!.callService(DOMAIN, "run_program", data);
      } catch (err: any) {
        toast(
          t("run_failed")
            .replace("{name}", name)
            .replace("{error}", err?.message ?? String(err)),
        );
        return;
      }
      await this._fetchLive(false);
      const state = stateOf(id)?.state;
      // A replacing run waits the moment the run before it takes to stop:
      // "queued until it has finished" said the opposite of what happens.
      toast(
        (state === "running"
          ? t("run_started")
          : state === "waiting"
            ? opts.replace
              ? t("run_replacing")
              : t("run_queued")
            : t("run_nothing")
        ).replace("{name}", name),
      );
    };
    // What a manual run can be asked for: kept for the next press only, not
    // saved, so shown only once asked for from the header's button (#893).
    // Folding it hides it again.
    const runOptions = (id: string | undefined) => html`
      <details
        class="more"
        open
        @toggle=${(e: Event) => {
          if ((e.target as HTMLDetailsElement).open) return;
          this._setOpen(`run_options:${id}`, false);
          this._scheduleUpdate();
        }}
      >
        <summary>${t("run_options")}</summary>
        <div class="more-body">
          <div class="setting-row">
            <div class="setting-label">
              ${t("run_seconds")}
              <span class="unit"
                >(${localize("common.units.seconds", lang)})</span
              ><si-info>${t("run_seconds_help")}</si-info>
            </div>
            <input
              class="field"
              type="number"
              min="1"
              max="86400"
              .value=${RUN_OPTIONS[id ?? ""]?.seconds ?? ""}
              @input=${(e: Event) => {
                const o = (RUN_OPTIONS[id ?? ""] ||= {});
                o.seconds = (e.target as HTMLInputElement).value;
              }}
            />
          </div>
          <div class="setting-row">
            <div class="setting-label">
              ${t("run_replace")}<si-info>${t("run_replace_help")}</si-info>
            </div>
            <ha-switch
              .checked=${RUN_OPTIONS[id ?? ""]?.replace === true}
              @change=${(e: Event) => {
                const o = (RUN_OPTIONS[id ?? ""] ||= {});
                o.replace = (e.target as any).checked;
              }}
            ></ha-switch>
          </div>
        </div>
      </details>
    `;
    const stateOf = (id: string | undefined) =>
      (this.programsState?.programs || []).find(
        (p: any) => p.program_id === id,
      );
    const stopProgram = async (program: SmartIrrigationProgram) => {
      if (
        !(await this._ask(
          t("confirm_stop_program").replace("{name}", program.name),
          true,
        ))
      )
        return;
      this.hass!.callService(DOMAIN, "stop_program", {
        program_id: program.id,
      }).then(() => this._fetchLive(false));
    };
    // Starting a program is what the page is opened for most: its button is in
    // the program's header row, with Stop beside it while it runs, Edit in YAML
    // and the options for this one start; the name and the flow come first in
    // the body. A program with no zone in its steps has nothing to start yet.
    const suspendedLine = (program: SmartIrrigationProgram) => {
      // Suspended by the suspend action: the card said so, this page did not,
      // and nothing here could lift it (UX walk of 13 Nov., Q3).
      const until = stateOf(program.id)?.suspended_until;
      if (!until) return html``;
      return html`
        <div class="setting-row">
          <div class="setting-label">
            ${t("suspended_until").replace(
              "{when}",
              momentLabel(until, lang, {
                tomorrow: localize("card.tomorrow", lang),
                yesterday: localize("card.yesterday", lang),
              }),
            )}
          </div>
          ${this._actionBtn(mdiPlay, t("lift_suspension"), async () => {
            await this.hass!.callService(DOMAIN, "suspend", {
              program_id: program.id,
              hours: 0,
            });
            await this._fetchLive(false);
          })}
        </div>
      `;
    };
    // Whether the program is under way: running, paused, or queued for its
    // turn. Stop is offered then only.
    const isUnderWay = (program: SmartIrrigationProgram) =>
      ["running", "paused", "waiting"].includes(stateOf(program.id)?.state);
    // What heads the program's body: its suspension, and the options for the
    // next run once asked for from the header's button.
    const runHead = (program: SmartIrrigationProgram) => html`
      ${suspendedLine(program)}
      ${programCanRun(program) && this._isOpen(`run_options:${program.id}`)
        ? runOptions(program.id)
        : ""}
    `;
    // "Running, step 2/3, 12 min left" beside the name: the card said nothing
    // while its program ran.
    const stateChip = (program: SmartIrrigationProgram) => {
      const state = stateOf(program.id);
      if (!state || !["running", "paused", "waiting"].includes(state.state))
        return "";
      const label =
        state.state === "running"
          ? t("state_running")
          : state.state === "paused"
            ? localize("planning.paused", lang)
            : t("state_waiting");
      const bits: string[] = [];
      const live = state.live || {};
      if (state.state !== "waiting" && live.steps > 1 && live.step) {
        bits.push(
          localize("cards.running.step", lang)
            .replace("{step}", String(live.step))
            .replace("{steps}", String(live.steps)),
        );
      }
      if (state.state === "running" && live.remaining_seconds != null) {
        bits.push(
          localize("cards.running.program-left", lang).replace(
            "{time}",
            friendlyDuration(live.remaining_seconds),
          ),
        );
      }
      return html`<span class="state-chip ${state.state}">${label}</span
        >${bits.length
          ? html` <span class="state-detail">${bits.join(", ")}</span>`
          : ""}`;
    };
    // "50 %, until 21:05": what is in force, said as short as the card says it.
    // It read "In force: 50 % and 0 s per step, until 13/11/2026, 21:05:14",
    // and only inside the program (UX walk of 13 Nov., Q14).
    const adjustmentOf = (program: SmartIrrigationProgram) =>
      stateOf(program.id)?.adjustment as
        | { percent?: number; seconds?: number; until?: string | null }
        | null
        | undefined;
    const adjustText = (program: SmartIrrigationProgram) => {
      const active = adjustmentOf(program);
      if (!active) return "";
      const percent = Number(active.percent ?? 100);
      const seconds = Math.round(Number(active.seconds ?? 0));
      const what = [
        percent !== 100 ? `${percent} %` : "",
        seconds !== 0
          ? t("adjust_per_step").replace(
              "{time}",
              `${seconds > 0 ? "+" : "−"}${friendlyDuration(Math.abs(seconds))}`,
            )
          : "",
      ]
        .filter(Boolean)
        .join(", ");
      return active.until
        ? t("adjust_short")
            .replace("{what}", what)
            .replace(
              "{when}",
              momentLabel(active.until, lang, {
                tomorrow: localize("card.tomorrow", lang),
                yesterday: localize("card.yesterday", lang),
              }),
            )
        : t("adjust_short_open").replace("{what}", what);
    };
    const adjustBlock = (program: SmartIrrigationProgram) => {
      const id = program.id ?? "";
      const o = (ADJUST_OPTIONS[id] ||= {});
      const active = adjustmentOf(program);
      // A program with no step has nothing to adjust: the fields stood in a
      // new, empty one too.
      if (!active && !(program.steps || []).length) return html``;
      const summary = active
        ? t("adjust_in_force").replace("{what}", adjustText(program))
        : t("adjust_none");
      const field = (
        label: string,
        unit: string,
        key: "percent" | "seconds" | "hours",
        placeholder: string,
      ) => html`
        <div class="setting-row">
          <div class="setting-label">
            ${label}${unit ? html` <span class="unit">(${unit})</span>` : ""}
          </div>
          <input
            class="field"
            type="number"
            placeholder=${placeholder}
            .value=${o[key] ?? ""}
            @input=${(e: Event) => {
              o[key] = (e.target as HTMLInputElement).value;
            }}
          />
        </div>
      `;
      const call = (data: Record<string, unknown>) =>
        this.hass!.callService(DOMAIN, "adjust_program", {
          program_id: program.id,
          ...data,
        }).then(() => this._fetchLive(false));
      return html`
        <div class="fold-section">${t("adjust_title")}</div>
        <div class="setting-note">${summary}</div>
        ${active
          ? html`<div class="si-actions">
              ${this._actionBtn(
                mdiDelete,
                t("adjust_reset"),
                async () => {
                  if (!(await this._ask(t("confirm_reset_adjustment"), true)))
                    return;
                  call({ reset: true });
                },
                true,
              )}
            </div>`
          : ""}
        <details class="more">
          <summary>${t(active ? "adjust_change" : "adjust_set")}</summary>
          <div class="more-body">
            ${field(t("adjust_percent"), "%", "percent", "100")}
            ${field(
              t("adjust_seconds"),
              localize("common.units.seconds", lang),
              "seconds",
              "0",
            )}
            ${field(t("adjust_hours"), "h", "hours", "")}
            <div class="setting-hint row-hint">${t("adjust_help")}</div>
            <div class="si-actions">
              ${this._actionBtn(mdiCheck, t("adjust_apply"), () => {
                const data: Record<string, unknown> = {};
                const percent = parseFloat(o.percent ?? "");
                const seconds = parseFloat(o.seconds ?? "");
                const hours = parseFloat(o.hours ?? "");
                if (!isNaN(percent)) data.percent = percent;
                if (!isNaN(seconds)) data.seconds = Math.round(seconds);
                if (!isNaN(hours) && hours >= 1) data.hours = Math.round(hours);
                if (data.percent === undefined && data.seconds === undefined) {
                  // It did nothing, and said nothing (#893).
                  toast(t("adjust_empty"));
                  return;
                }
                call(data);
              })}
            </div>
          </div>
        </details>
      `;
    };
    const control = (service: string) =>
      this.hass!.callService(DOMAIN, service, {});
    const random = () => Math.random().toString(36).slice(2, 8);

    const weekdayName = (i: number) =>
      new Intl.DateTimeFormat(lang, { weekday: "short" }).format(
        new Date(2024, 0, 1 + i),
      );
    const monthName = (i: number) =>
      new Intl.DateTimeFormat(lang, { month: "short" }).format(
        new Date(2024, i, 1),
      );

    const zoneNames = (ids: number[] | undefined) =>
      (ids || [])
        .map(
          (id) =>
            this.zones.find((z) => z.id === id)?.name ?? t("deleted_zone"),
        )
        .join(" + ") || t("no_zone");
    const durationText = (step: SmartIrrigationStep) =>
      step.mode === "fixed"
        ? `${step.seconds} s`
        : step.mode === "percent"
          ? `${t("mode_calculated_short")} × ${step.percent} %`
          : t("mode_calculated_short");
    // The program an "after" schedule follows, by its name.
    const afterName = (schedule: SmartIrrigationSchedule) => {
      const found = programs.find(
        (p) => p.id !== undefined && p.id === schedule.after_program,
      );
      return found ? programName(found) : t("after_missing_short");
    };
    const scheduleText = (schedule: SmartIrrigationSchedule) => {
      if (schedule.type === "after") {
        const after = t("summary_after").replace(
          "{program}",
          afterName(schedule),
        );
        const late = schedule.offset_minutes
          ? ` +${schedule.offset_minutes} min`
          : "";
        // Every day is when the other program runs: only narrowed days say so.
        const limited =
          ((schedule.weekdays || []).length > 0 &&
            (schedule.weekdays || []).length < 7) ||
          (schedule.every_n_days ?? 1) > 1 ||
          schedule.parity === "even" ||
          schedule.parity === "odd" ||
          (schedule.days_of_month || []).length > 0 ||
          (schedule.months || []).length > 0 ||
          !!schedule.from_date ||
          !!schedule.until_date;
        return `${after}${late}${limited ? ` · ${t("more_options_set")}` : ""}`;
      }
      const anchor = schedule.anchor === "end" ? "end" : "start";
      const offset = schedule.offset_minutes
        ? ` ${schedule.offset_minutes > 0 ? "+" : ""}${schedule.offset_minutes} min`
        : "";
      // "starts at sunrise", not "starts at Sunrise": the sun takes its own
      // phrase in each language.
      const moment =
        schedule.type === "sun" && schedule.event === "azimuth"
          ? `${t(`summary_${anchor}_azimuth`).replace("{deg}", String(schedule.azimuth ?? 180))}${offset}`
          : schedule.type === "sun"
            ? `${t(`summary_${anchor}_${schedule.event === "sunset" ? "sunset" : "sunrise"}`)}${offset}`
            : `${t(anchor === "end" ? "anchor_end_short" : "anchor_start_short")} ${schedule.time}`;
      // All seven days are every day.
      const days =
        (schedule.weekdays || []).length > 0 &&
        (schedule.weekdays || []).length < 7
          ? schedule.weekdays.map((d) => weekdayName(d)).join(", ")
          : (schedule.every_n_days ?? 1) > 1
            ? `${t("schedule_every")} ${schedule.every_n_days} ${t("schedule_days")}`
            : t("every_day");
      // Days of the month, months or a period narrow it down: said, rather
      // than reading as every day.
      const narrowed =
        ((schedule.every_n_days ?? 1) > 1 &&
          (schedule.weekdays || []).length > 0) ||
        schedule.parity === "even" ||
        schedule.parity === "odd" ||
        (schedule.days_of_month || []).length > 0 ||
        (schedule.months || []).length > 0 ||
        !!schedule.from_date ||
        !!schedule.until_date;
      return `${days} · ${moment}${
        narrowed ? ` · ${t("more_options_set")}` : ""
      }`;
    };
    // A switch on the right of a fold's summary line (a step's or a
    // schedule's "on"): clicking it switches, and never opens or closes the
    // fold. The new value comes from the data, not from the switch, so the
    // click's default being cancelled cannot leave the two apart.
    const headSwitch = (on: boolean, set: (on: boolean) => void) => html`
      <ha-switch
        .checked=${on}
        @click=${(e: Event) => {
          e.stopPropagation();
          e.preventDefault();
          set(!on);
        }}
      ></ha-switch>
    `;
    const headLine = (text: unknown, on: boolean, set: (on: boolean) => void) =>
      html`<span class="fold-head"
        ><span class="fold-head-text">${text}</span>${headSwitch(on, set)}</span
      >`;
    const fold = (key: string, summary: unknown, body: unknown) => html`
      <details
        class="fold"
        ?open=${this._isOpen(key)}
        @toggle=${(e: Event) =>
          this._setOpen(key, (e.target as HTMLDetailsElement).open)}
      >
        <summary>${summary}</summary>
        <div class="fold-body">${body}</div>
      </details>
    `;

    // The settings most steps and schedules never need, folded under "More
    // options". It opens by itself when one of them is set, so nothing that
    // acts on the watering is out of sight (#893).
    const more = (key: string, set: boolean, body: unknown) => html`
      <details
        class="more"
        ?open=${this._isOpen(key) || (set && !FOLDED_BY_HAND.has(key))}
        @toggle=${(e: Event) => {
          const open = (e.target as HTMLDetailsElement).open;
          this._setOpen(key, open);
          if (open) FOLDED_BY_HAND.delete(key);
          else FOLDED_BY_HAND.add(key);
        }}
      >
        <summary>
          ${t("more_options")}${set
            ? html` · <em>${t("more_options_set")}</em>`
            : ""}
        </summary>
        <div class="more-body">${body}</div>
      </details>
    `;

    // Every zone a program can water: the zones of its steps that are on.
    const programZones = (program: SmartIrrigationProgram) => {
      const ids = [
        ...new Set(
          (program.steps || [])
            .filter((s) => s.enabled !== false)
            .flatMap((s) => s.zones || []),
        ),
      ];
      return ids
        .map((id) => ({
          id: Number(id),
          name: this.zones.find((z) => z.id === id)?.name ?? `#${id}`,
        }))
        .filter((z) => !isNaN(z.id));
    };
    // A run drawn as a flow (objects and arrows, in order) or on a time axis.
    const drawRun = (program: SmartIrrigationProgram, timeline: any) => {
      const key = program.id ?? "";
      const view = RUN_VIEW[key] ?? "flow";
      const schedules = (program.schedules || []).filter(
        (s) => s.enabled !== false,
      );
      return html`
        <div class="run-views" role="group">
          ${(["flow", "timeline"] as const).map(
            (v) =>
              html`<button
                class=${v === view ? "on" : ""}
                @click=${() => {
                  RUN_VIEW[key] = v;
                  this._scheduleUpdate();
                }}
              >
                ${t(`view_${v}`)}
              </button>`,
          )}
        </div>
        ${view === "flow"
          ? html`<si-program-flow
              .flow=${programFlow(
                timeline,
                this.zones as any,
                (this.config?.supplies || []) as any,
                programZones(program),
              )}
              .schedules=${schedules.map((s) => scheduleText(s))}
              .weather=${weatherVerdict(
                schedules,
                this._skipPreview,
                (this.planning || []).find(
                  (item: any) => item.program_id === program.id,
                ),
              )}
              .notify=${!!program.notify?.targets?.length}
              .lang=${lang}
              @open-zone=${(e: CustomEvent) =>
                navigate(this, `/${DOMAIN}/zones/zone/${e.detail.zone_id}`)}
            ></si-program-flow>`
          : html`<si-program-timeline
              .timeline=${timeline}
              .lang=${lang}
            ></si-program-timeline>`}
      `;
    };
    // What a run of the program would do, drawn: asked of the backend for
    // the program as it is now, saved or not, and only for one unfolded.
    const preview = (program: SmartIrrigationProgram, foldKey: string) => {
      const id = program.id ?? "";
      if (!this._isOpen(foldKey)) return html``;
      const data = this._preview(id, program);
      return html`
        <div class="fold-section">
          ${t("preview_title")}<si-info>${t("preview_help")}</si-info>
        </div>
        ${data
          ? drawRun(program, data.timeline)
          : html`<div class="setting-note">…</div>`}
      `;
    };
    // The program as YAML, in place of the form: what the backend makes of
    // it is shown before anything is saved (the same cleaning as a save).
    const yamlOpen = (id: string) => YAML_EDITS[id] !== undefined;
    const openYaml = async (id: string, initial: unknown) => {
      await loadHaYamlEditor().catch(() => undefined);
      YAML_EDITS[id] = { initial, value: initial, valid: true };
      this._yamlPreview(
        id,
        initial,
        id ? programs.find((p) => p.id === id) : undefined,
      );
      this._scheduleUpdate();
    };
    const closeYaml = (id: string) => {
      delete YAML_EDITS[id];
      this._scheduleUpdate();
    };
    const yamlBlock = (id: string, index: number | null) => {
      const edit = YAML_EDITS[id];
      const replacing = index === null ? undefined : programs[index];
      const found = edit.preview;
      const problems = found
        ? [
            ...found.unknown_zone_names.map((name) => `"${name}"`),
            ...found.unknown_zones.map((zone) => `#${zone}`),
          ]
        : [];
      const notWatered = found?.zones_not_watered || [];
      // What a save would refuse: programs starting each other in a loop,
      // or one that waits for a program that is not there.
      const loop = found?.chain_loop || null;
      const unknownAfter = found?.unknown_after_programs || [];
      const apply = () => {
        if (!found || loop || unknownAfter.length) return;
        const cleaned = { ...found.program };
        if (index === null) {
          // A new program is unfolded on its form, its timeline at the top.
          this._setOpen(`program:${cleaned.id}`, true);
          save([...programs, cleaned]);
        } else {
          save(programs.map((p, n) => (n === index ? cleaned : p)));
        }
        closeYaml(id);
        toast(t("yaml_applied"));
      };
      return html`
        <div class="fold-section">YAML<si-info>${t("yaml_help")}</si-info></div>
        <ha-yaml-editor
          .hass=${this.hass}
          .defaultValue=${edit.initial}
          @value-changed=${(e: CustomEvent) => {
            e.stopPropagation();
            const { value, isValid } = e.detail || {};
            edit.value = value;
            edit.valid = isValid !== false;
            if (edit.valid) this._yamlPreview(id, value, replacing);
            this._scheduleUpdate();
          }}
        ></ha-yaml-editor>
        ${!edit.valid
          ? html`<div class="setting-hint row-hint warning-hint">
              ${t("yaml_invalid")}
            </div>`
          : edit.error
            ? html`<div class="setting-hint row-hint warning-hint">
                ${edit.error}
              </div>`
            : ""}
        ${problems.length
          ? html`<div class="setting-hint row-hint warning-hint">
              ${t("yaml_unknown_zones").replace("{zones}", problems.join(", "))}
            </div>`
          : ""}
        ${loop
          ? html`<div class="setting-hint row-hint warning-hint">
              ${t("yaml_chain_loop").replace("{programs}", loop.join(" → "))}
            </div>`
          : ""}
        ${unknownAfter.length
          ? html`<div class="setting-hint row-hint warning-hint">
              ${t("yaml_unknown_after").replace(
                "{programs}",
                unknownAfter.map((p) => `"${p}"`).join(", "),
              )}
            </div>`
          : ""}
        ${notWatered.length
          ? html`<div class="setting-hint row-hint warning-hint">
              ${t("yaml_not_watered").replace(
                "{zones}",
                notWatered.map((z) => z.zone ?? `#${z.zone_id}`).join(", "),
              )}
            </div>`
          : ""}
        ${found && edit.valid && !edit.error
          ? drawRun(found.program as SmartIrrigationProgram, found.timeline)
          : ""}
        <div class="si-actions">
          ${this._actionBtn(
            mdiCheck,
            t("yaml_apply"),
            apply,
            false,
            !edit.valid ||
              !found ||
              !!edit.error ||
              !!loop ||
              unknownAfter.length > 0,
          )}
        </div>
      `;
    };
    // The program's actions, as icons in its header row: Run now, Stop while
    // it is under way, Edit in YAML (Back to the editor in YAML) and the
    // options for this run. A click on one acts, and neither folds nor
    // unfolds the program, except to show what it opened.
    const headActions = (program: SmartIrrigationProgram) => {
      const id = program.id ?? "";
      const icon = (path: string, label: string, act: () => void, cls = "") =>
        html`<ha-icon-button
          class=${cls}
          .path=${path}
          .label=${label}
          title=${label}
          @click=${(e: Event) => {
            e.stopPropagation();
            e.preventDefault();
            act();
          }}
        ></ha-icon-button>`;
      const unfold = () => this._setOpen(`program:${id}`, true);
      const optionsKey = `run_options:${id}`;
      return html`<span class="head-actions">
        ${programCanRun(program)
          ? icon(mdiPlay, t("run_now"), () => run(program))
          : ""}
        ${isUnderWay(program)
          ? icon(
              mdiStop,
              t("stop_program"),
              () => stopProgram(program),
              "danger",
            )
          : ""}
        ${yamlOpen(id)
          ? icon(mdiFormSelect, t("yaml_back"), () => closeYaml(id))
          : icon(mdiCodeBraces, t("yaml_edit"), () => {
              unfold();
              openYaml(id, programToYaml(program, this.zones, programs));
            })}
        ${programCanRun(program)
          ? icon(
              mdiTune,
              t("run_options"),
              () => {
                const open = !this._isOpen(optionsKey);
                this._setOpen(optionsKey, open);
                if (open) unfold();
                this._scheduleUpdate();
              },
              this._isOpen(optionsKey) ? "on" : "",
            )
          : ""}
      </span>`;
    };

    // As Home Assistant's own visual editors do: what the form does not show
    // is kept as it is, and the program says, once and read-only, which of
    // those options it uses, with Edit in YAML at hand to change them. The
    // standard form leaves out the options few need (fields of the advanced
    // mode); no form has a field for the two YAML-only ones.
    const hiddenNotice = (program: SmartIrrigationProgram) => {
      const groups = hiddenOptions(program, this.config?.ui_mode, {
        t,
        monthName,
        days: (count) =>
          localize("programs.days_count", lang, "{count}", count),
        num: (value) =>
          formatNumber(
            value,
            Number.isInteger(value) ? 0 : 1,
            this.hass?.locale,
            lang,
          ),
      });
      if (!groups.length) return "";
      const id = program.id ?? "";
      const advanced = hiddenInAdvanced(groups);
      return html`<ha-alert
        alert-type="info"
        .title=${t(advanced ? "hidden_title" : "yaml_only_title")}
      >
        ${advanced
          ? t("hidden_help").replace("{where}", this._advancedPath(lang))
          : t("yaml_only_help")}
        ${groups.map((group) => html`<div>${hiddenLine(group)}</div>`)}
        <ha-button
          slot="action"
          appearance="plain"
          @click=${() =>
            openYaml(id, programToYaml(program, this.zones, programs))}
          >${t("yaml_edit")}</ha-button
        >
      </ha-alert>`;
    };

    // The options few need are fields of the advanced mode only.
    const advanced = this.config?.ui_mode === "advanced";

    // A schedule's day options of the advanced mode, under its More options:
    // the shift of "every N days" (programs taking turns), even or odd days,
    // days of the month and months.
    const advancedDays = (
      schedule: SmartIrrigationSchedule,
      patchSchedule: (changes: Partial<SmartIrrigationSchedule>) => void,
      toggle: (
        list: number[] | undefined,
        value: number,
        on: boolean,
      ) => number[],
    ) => html`
      ${(schedule.every_n_days ?? 1) > 1 || (schedule.every_offset ?? 0) > 0
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
      ${this._selectRow(
        t("schedule_parity"),
        html`
          <option
            value="any"
            ?selected=${schedule.parity !== "even" && schedule.parity !== "odd"}
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
      ${this._textRow(
        html`${t("schedule_days_of_month")}<si-info
            >${t("schedule_days_of_month_help")}</si-info
          >`,
        `1, 15, ${t("last_word")}`,
        (schedule.days_of_month || [])
          .map((day) => (day === "last" ? t("last_word") : day))
          .join(", "),
        (v) =>
          patchSchedule({
            days_of_month: v
              .split(/[,;\s]+/)
              .map((part) => part.trim().toLowerCase())
              // The word of the panel's language, or "last" as stored.
              .map((part) =>
                part === t("last_word").toLowerCase() ? "last" : part,
              )
              .filter(
                (part) =>
                  part === "last" ||
                  (/^\d+$/.test(part) &&
                    Number(part) >= 1 &&
                    Number(part) <= 31),
              )
              .map((part) => (part === "last" ? part : Number(part))),
          }),
      )}
      <div class="setting-row">
        <div class="setting-label">
          ${t("schedule_months")}<si-info>${t("schedule_months_help")}</si-info>
        </div>
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
    `;

    const renderStep = (
      program: SmartIrrigationProgram,
      index: number,
      step: SmartIrrigationStep,
      stepIndex: number,
    ) => {
      const patchStep = (changes: Partial<SmartIrrigationStep>) =>
        patch(index, withStep(program, stepIndex, changes));
      const toggleZone = (zoneId: number, on: boolean) => {
        const zones = (step.zones || []).filter((z) => z !== zoneId);
        patchStep({ zones: on ? [...zones, zoneId] : zones });
      };
      // What changes how the step runs is in its head: the passes and its own
      // wait or overlap. "Step 2 · Hedges · calculated" stood over two passes,
      // and over a step that starts the next 30 s early (UX walk, Q15).
      const passes = Math.max(1, Number(step.passes) || 1);
      const ownDelay =
        step.delay === null || step.delay === undefined
          ? null
          : Number(step.delay);
      const extras = [
        passes > 1 ? t("passes_short").replace("{n}", String(passes)) : "",
        ownDelay !== null && ownDelay < 0
          ? t("overlap_short").replace(
              "{time}",
              friendlyDuration(Math.abs(ownDelay)),
            )
          : "",
        ownDelay !== null && ownDelay > 0
          ? t("wait_short").replace("{time}", friendlyDuration(ownDelay))
          : "",
      ].filter(Boolean);
      const minOverMax =
        (step.min_seconds ?? 0) > 0 &&
        (step.max_seconds ?? 0) > 0 &&
        (step.min_seconds ?? 0) > (step.max_seconds ?? 0);
      return fold(
        `step:${step.id}`,
        headLine(
          html`<strong>${t("step")} ${stepIndex + 1}</strong> ·
            ${zoneNames(step.zones)} ·
            ${durationText(step)}${extras.map((extra) => html` · ${extra}`)}`,
          step.enabled !== false,
          (on) => patchStep({ enabled: on }),
        ),
        html`
          <div class="setting-row">
            <div class="setting-label">
              ${t("step_zones")}<si-info>${t("step_zones_help")}</si-info>
            </div>
            <div>
              ${(step.zones || [])
                .filter((id) => !this.zones.some((z) => z.id === id))
                .map(
                  (id) => html`
                    <label
                      style="margin-right: 12px; white-space: nowrap; color: var(--warning-color, #ff9800);"
                    >
                      <input
                        type="checkbox"
                        checked
                        @change=${(e: Event) =>
                          toggleZone(
                            id,
                            (e.target as HTMLInputElement).checked,
                          )}
                      />
                      &#9888; ${t("deleted_zone")}
                    </label>
                  `,
                )}
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
          ${this._selectRow(
            t("step_duration"),
            html`
              <option
                value="calculated"
                ?selected=${step.mode === "calculated"}
              >
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
            ? this._numRow(
                t("percent"),
                "%",
                step.percent,
                (v) => patchStep({ percent: Math.max(0, num(v, 100)) }),
                1,
                false,
                0,
              )
            : ""}
          ${step.mode === "fixed"
            ? this._numRow(
                t("seconds"),
                "",
                step.seconds,
                (v) => patchStep({ seconds: Math.max(0, num(v)) }),
                1,
                false,
                0,
              )
            : ""}
          ${this._numRow(
            html`${t("passes")}<si-info>${t("passes_help")}</si-info>`,
            "",
            step.passes,
            (v) => patchStep({ passes: Math.max(1, Math.round(num(v, 1))) }),
            1,
            false,
            1,
          )}
          ${passes > 1
            ? html`${this._numRow(
                html`${localize("observed_watering.soak_label", lang)}<si-info
                    >${t("soak_shared_help")}</si-info
                  >`,
                localize("observed_watering.minutes", lang),
                this.config?.soak_minutes ?? 15,
                (v) =>
                  this.handleConfigChange({
                    soak_minutes: Math.max(0, parseFloat(v) || 0),
                  }),
              )}`
            : ""}
          ${more(
            `more:step:${step.id}`,
            (step.max_litres ?? 0) > 0 ||
              (step.min_seconds ?? 0) > 0 ||
              (step.max_seconds ?? 0) > 0 ||
              (advanced &&
                ((step.adjust_seconds ?? 0) !== 0 ||
                  (step.min_deficit_mm ?? 0) > 0)) ||
              (step.delay !== null && step.delay !== undefined),
            html`
              ${this._numRow(
                html`${t("max_litres")}<si-info
                    >${t("max_litres_help")}</si-info
                  >`,
                unit_text(this.config, ZONE_WATER_VOLUME),
                // Stored in litres, shown and typed in the unit of the panel.
                +displayVolume(step.max_litres ?? 0, this.config).toFixed(2),
                (v) =>
                  patchStep({
                    max_litres: Math.max(0, storedVolume(num(v), this.config)),
                  }),
                1,
                false,
                0,
              )}
              ${this._numRow(
                html`${t("min_seconds")}<si-info
                    >${t("step_bounds_help")}</si-info
                  >`,
                localize("common.units.seconds", lang),
                step.min_seconds ?? 0,
                (v) =>
                  patchStep({ min_seconds: Math.max(0, Math.round(num(v))) }),
                1,
                false,
                0,
              )}
              ${this._numRow(
                t("max_seconds"),
                localize("common.units.seconds", lang),
                step.max_seconds ?? 0,
                (v) =>
                  patchStep({ max_seconds: Math.max(0, Math.round(num(v))) }),
                1,
                false,
                0,
              )}
              ${minOverMax
                ? html`<div class="setting-hint row-hint warning-hint">
                    ${t("min_over_max").replace(
                      "{max}",
                      friendlyDuration(step.max_seconds ?? 0),
                    )}
                  </div>`
                : ""}
              ${
                // The time added or removed and the deficit a step waits for:
                // the advanced mode (the standard one lists them, once set,
                // in the program's notice).
                advanced
                  ? html`${this._numRow(
                      html`${t("adjust_seconds")}<si-info
                          >${t("step_bounds_help")}</si-info
                        >`,
                      localize("common.units.seconds", lang),
                      step.adjust_seconds ?? 0,
                      (v) =>
                        patchStep({
                          adjust_seconds: Math.max(
                            -21600,
                            Math.min(21600, Math.round(num(v))),
                          ),
                        }),
                    )}
                    ${this._numRow(
                      html`${t("min_deficit_mm")}<si-info
                          >${t("min_deficit_mm_help")}</si-info
                        >`,
                      "mm",
                      step.min_deficit_mm ?? 0,
                      (v) => patchStep({ min_deficit_mm: Math.max(0, num(v)) }),
                      1,
                      false,
                      0,
                    )}`
                  : ""
              }
              ${this._textRow(
                html`${t("step_delay")}<si-info
                    >${t("step_delay_help")}</si-info
                  >`,
                localize("common.units.seconds", lang),
                step.delay === null || step.delay === undefined
                  ? ""
                  : step.delay,
                (v) => patchStep({ delay: v.trim() === "" ? null : num(v) }),
              )}
            `,
          )}
          <div class="si-actions">
            ${this._actionBtn(
              mdiDelete,
              t("delete_step"),
              async () => {
                if (!(await this._ask(t("confirm_delete_step"), true))) return;
                patch(index, {
                  steps: (program.steps || []).filter(
                    (_, n) => n !== stepIndex,
                  ),
                });
              },
              true,
            )}
          </div>
        `,
      );
    };

    const renderSchedule = (
      program: SmartIrrigationProgram,
      index: number,
      schedule: SmartIrrigationSchedule,
      scheduleIndex: number,
    ) => {
      const patchSchedule = (changes: Partial<SmartIrrigationSchedule>) =>
        patch(index, withSchedule(program, scheduleIndex, changes));
      // The programs this one may start after: not itself, and none that
      // already waits for it (they would start each other in a loop).
      const followable = programs.filter(
        (p) =>
          p.id !== undefined &&
          p.id !== program.id &&
          !wouldLoop(programs, program.id ?? "", p.id),
      );
      const toggle = (
        list: number[] | undefined,
        value: number,
        on: boolean,
      ) => {
        const rest = (list || []).filter((v) => v !== value);
        return on ? [...rest, value].sort((a, b) => a - b) : rest;
      };
      return fold(
        `schedule:${schedule.id}`,
        headLine(
          html`<strong>${t("schedule")} ${scheduleIndex + 1}</strong> ·
            ${scheduleText(schedule)}`,
          schedule.enabled !== false,
          (on) => patchSchedule({ enabled: on }),
        ),
        html`
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
              <option
                value="azimuth"
                ?selected=${schedule.type === "sun" &&
                schedule.event === "azimuth"}
              >
                ${t("moment_azimuth")}
              </option>
              <option
                value="after"
                ?selected=${schedule.type === "after"}
                ?disabled=${!followable.length && schedule.type !== "after"}
              >
                ${t("moment_after")}
              </option>
            `,
            (e: Event) => {
              const value = (e.target as HTMLSelectElement).value;
              if (value === "after") {
                // It starts after the other program: never before its end,
                // and the moment is its start.
                patchSchedule({
                  type: "after",
                  after_program:
                    schedule.after_program ?? followable[0]?.id ?? null,
                  anchor: "start",
                  hard_deadline: false,
                  offset_minutes: Math.max(0, schedule.offset_minutes || 0),
                });
                return;
              }
              patchSchedule(
                value === "time"
                  ? { type: "time" }
                  : {
                      type: "sun",
                      event: value as "sunrise" | "sunset" | "azimuth",
                      ...(value === "azimuth"
                        ? { azimuth: schedule.azimuth ?? 180 }
                        : {}),
                    },
              );
            },
          )}
          ${schedule.type === "after"
            ? html`${this._selectRow(
                html`${t("schedule_after_program")}<si-info
                    >${t("schedule_after_program_help")}</si-info
                  >`,
                html`${afterIsMissing(programs, schedule)
                  ? html`<option value="" selected disabled>
                      ${t("after_missing_short")}
                    </option>`
                  : ""}
                ${programs
                  .filter((p) => p.id !== undefined && p.id !== program.id)
                  .map(
                    (p) =>
                      html`<option
                        value=${p.id!}
                        ?selected=${p.id === schedule.after_program}
                        ?disabled=${wouldLoop(
                          programs,
                          program.id ?? "",
                          p.id!,
                        )}
                      >
                        ${programName(p)}${wouldLoop(
                          programs,
                          program.id ?? "",
                          p.id!,
                        )
                          ? ` (${t("after_would_loop")})`
                          : ""}
                      </option>`,
                  )}`,
                (e: Event) =>
                  patchSchedule({
                    after_program:
                      (e.target as HTMLSelectElement).value || null,
                  }),
              )}
              ${afterIsMissing(programs, schedule)
                ? html`<div class="setting-hint row-hint warning-hint">
                    ${t("after_missing")}
                  </div>`
                : ""}
              ${this._numRow(
                html`${t("schedule_after_offset")}<si-info
                    >${t("schedule_after_offset_help")}</si-info
                  >`,
                localize("common.units.minutes", lang),
                schedule.offset_minutes,
                (v) =>
                  patchSchedule({
                    offset_minutes: Math.max(0, Math.round(num(v))),
                  }),
                1,
                false,
                0,
              )}`
            : ""}
          ${schedule.type === "sun" && schedule.event === "azimuth"
            ? html`${this._numRow(
                html`${t("schedule_azimuth")}<si-info
                    >${t("schedule_azimuth_help")}</si-info
                  >`,
                "°",
                schedule.azimuth ?? 180,
                (v) =>
                  patchSchedule({
                    azimuth: ((num(v, 180) % 360) + 360) % 360,
                  }),
              )}`
            : ""}
          ${schedule.type === "time"
            ? this._timeRow(t("schedule_time"), schedule.time, (v) =>
                patchSchedule({ time: v }),
              )
            : schedule.type === "sun"
              ? this._numRow(
                  t("schedule_offset"),
                  localize("common.units.minutes", lang),
                  schedule.offset_minutes,
                  (v) => patchSchedule({ offset_minutes: Math.round(num(v)) }),
                )
              : ""}
          ${schedule.type === "after"
            ? // Locked: the program starts after the other one, the end of a
              // run that has not happened yet cannot be aimed at.
              html`<div class="setting-row">
                <div class="setting-label">
                  ${t("schedule_anchor")}<si-info
                    >${t("schedule_anchor_after_help")}</si-info
                  >
                </div>
                <div class="select-wrap">
                  <select class="field" disabled>
                    <option selected>${t("anchor_start")}</option>
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${mdiMenuDown}></path>
                  </svg>
                </div>
              </div>`
            : this._selectRow(
                html`${t("schedule_anchor")}<si-info
                    >${t("schedule_anchor_help")}</si-info
                  >`,
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
                    anchor: (e.target as HTMLSelectElement).value as
                      | "start"
                      | "end",
                  }),
              )}
          <div class="setting-row">
            <div class="setting-label">
              ${t("schedule_weekdays")}<si-info
                >${t("schedule_weekdays_help")}</si-info
              >
            </div>
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
          <div class="setting-row">
            <div class="setting-label">
              ${t("schedule_weather")}<si-info
                >${t("schedule_weather_help")}
                ${advanced ? t("conditions_pick") : ""}</si-info
              >
            </div>
            <ha-switch
              .checked=${schedule.weather !== false}
              @change=${(e: Event) =>
                // A list of conditions is kept: on again, it applies again.
                patchSchedule({ weather: (e.target as any).checked })}
            ></ha-switch>
          </div>
          ${
            // Some of the conditions only (a greenhouse ignores the rain): the
            // advanced mode, under the switch; the standard one lists such a
            // list, once set, in the program's notice. All of them ticked is
            // the default, stored as no list.
            advanced && schedule.weather !== false
              ? html`<div class="conditions">
                  ${SKIP_CONDITION_IDS.map((id) => {
                    const always = id === "postponed";
                    const active =
                      schedule.skip_conditions ?? SKIP_CONDITION_IDS;
                    // Off under Skip watering: nothing to obey or ignore
                    // here. The schedule's choice is kept for when it is on.
                    const setting = always
                      ? t("cond_postponed")
                      : this._conditionSetting(id);
                    return html`
                      <div class=${setting ? "" : "cond-off"}>
                        <label style="white-space: nowrap;">
                          <input
                            type="checkbox"
                            .checked=${always || active.includes(id)}
                            ?disabled=${always || !setting}
                            @change=${(e: Event) => {
                              const on = (e.target as HTMLInputElement).checked;
                              const next = SKIP_CONDITION_IDS.filter((c) =>
                                c === id ? on : active.includes(c),
                              );
                              patchSchedule({
                                skip_conditions:
                                  next.length === SKIP_CONDITION_IDS.length
                                    ? undefined
                                    : next,
                              });
                            }}
                          />
                          ${t(`condition_${id}`)}
                        </label>
                        <span class="cond-setting">
                          · ${setting || t("cond_off")}
                        </span>
                      </div>
                    `;
                  })}
                </div>`
              : ""
          }
          ${more(
            `more:schedule:${schedule.id}`,
            schedule.hard_deadline === true ||
              (schedule.every_n_days ?? 1) > 1 ||
              (advanced &&
                ((schedule.every_offset ?? 0) > 0 ||
                  schedule.parity === "even" ||
                  schedule.parity === "odd" ||
                  (schedule.days_of_month || []).length > 0 ||
                  (schedule.months || []).length > 0)) ||
              !!schedule.from_date ||
              !!schedule.until_date,
            html`
              ${this._numRow(
                html`${t("schedule_every")}<si-info
                    >${t("schedule_every_help")}</si-info
                  >`,
                t("schedule_days"),
                schedule.every_n_days ?? 1,
                (v) =>
                  patchSchedule({
                    every_n_days: Math.max(1, Math.round(num(v, 1))),
                  }),
              )}
              ${advanced ? advancedDays(schedule, patchSchedule, toggle) : ""}
              ${this._monthDayRow(
                t("schedule_from"),
                schedule.from_date,
                monthName,
                (v) => patchSchedule({ from_date: v }),
              )}
              ${this._monthDayRow(
                html`${t("schedule_until")}<si-info
                    >${t("schedule_period_help")}</si-info
                  >`,
                schedule.until_date,
                monthName,
                (v) => patchSchedule({ until_date: v }),
              )}
              ${schedule.anchor === "end"
                ? html`
                    <div class="setting-row">
                      <div class="setting-label">
                        ${t("schedule_hard_deadline")}<si-info
                          >${t("schedule_hard_deadline_help")}</si-info
                        >
                      </div>
                      <ha-switch
                        .checked=${schedule.hard_deadline === true}
                        @change=${(e: Event) =>
                          patchSchedule({
                            hard_deadline: (e.target as any).checked,
                          })}
                      ></ha-switch>
                    </div>
                  `
                : ""}
            `,
          )}
          <div class="si-actions">
            ${this._actionBtn(
              mdiDelete,
              t("delete_schedule"),
              async () => {
                if (!(await this._ask(t("confirm_delete_schedule"), true)))
                  return;
                patch(index, {
                  schedules: (program.schedules || []).filter(
                    (_, n) => n !== scheduleIndex,
                  ),
                });
              },
              true,
            )}
          </div>
        `,
      );
    };

    // A program's schedules and the button that adds one.
    const renderSchedules = (
      program: SmartIrrigationProgram,
      index: number,
    ) => html`
      ${(program.schedules || []).map((schedule, scheduleIndex) =>
        renderSchedule(program, index, schedule, scheduleIndex),
      )}
      <div class="si-actions">
        ${this._actionBtn(mdiPlus, t("add_schedule"), () =>
          patch(index, {
            schedules: [
              ...(program.schedules || []),
              {
                id: this._openNew("schedule", "schedule_" + random()),
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
      </div>
    `;

    // Whom the program tells when it has watered (program_notify.py).
    const renderNotify = (program: SmartIrrigationProgram, index: number) => {
      const notify = program.notify ?? {
        targets: [],
        when: "finish" as const,
        start: false,
      };
      const choices = notifyTargets(this.hass!);
      const known = new Set(choices.map((c) => c.id));
      // A target that has gone stays listed, so it can be unticked.
      for (const id of notify.targets)
        if (!known.has(id)) choices.push({ id, name: id });
      const set = (changes: Partial<typeof notify>) => {
        const next = { ...notify, ...changes };
        patch(index, {
          notify: next.targets.length ? next : undefined,
        });
      };
      return html`
        <div class="fold-section">
          ${t("notify_title")}<si-info>${t("notify_help")}</si-info>
        </div>
        ${choices.map(
          (choice) => html`
            <div>
              <label>
                <input
                  type="checkbox"
                  .checked=${notify.targets.includes(choice.id)}
                  @change=${(e: Event) => {
                    const on = (e.target as HTMLInputElement).checked;
                    set({
                      targets: on
                        ? [...notify.targets, choice.id]
                        : notify.targets.filter((x) => x !== choice.id),
                    });
                  }}
                />
                ${choice.id === "persistent_notification"
                  ? t("notify_persistent")
                  : choice.name}
              </label>
            </div>
          `,
        )}
        ${choices.length <= 1
          ? html`<div class="setting-note">${t("notify_none")}</div>`
          : ""}
        ${notify.targets.length
          ? html`
              <div class="setting-row">
                <div class="setting-label">${t("notify_when")}</div>
                <div class="select-wrap">
                  <select
                    class="field"
                    @change=${(e: Event) => {
                      // Three choices for two fields: the start is told only
                      // along with the end.
                      const value = (e.target as HTMLSelectElement).value;
                      set(
                        value === "start_and_finish"
                          ? { when: "finish", start: true }
                          : {
                              when: value as "finish" | "problems",
                              start: false,
                            },
                      );
                    }}
                  >
                    ${(
                      [
                        ["start_and_finish", "notify_when_start_and_finish"],
                        ["finish", "notify_when_finish"],
                        ["problems", "notify_when_problems"],
                      ] as const
                    ).map(
                      ([value, label]) => html`
                        <option
                          value=${value}
                          ?selected=${value ===
                          (notify.when === "problems"
                            ? "problems"
                            : notify.start
                              ? "start_and_finish"
                              : "finish")}
                        >
                          ${t(label)}
                        </option>
                      `,
                    )}
                  </select>
                  <svg class="chev" viewBox="0 0 24 24">
                    <path d=${mdiMenuDown}></path>
                  </svg>
                </div>
              </div>
            `
          : ""}
      `;
    };

    return html`
      <ha-card>
        <h1 class="card-header">
          <span>${t("title")}<si-info>${t("description")}</si-info></span>
        </h1>
        ${programs.length
          ? ""
          : html`<div class="card-content">
              <div class="setting-note">${t("none_yet")}</div>
            </div>`}
        ${programs.map(
          (program, index) => html`
            <div class="card-content">
              ${fold(
                `program:${program.id}`,
                html`<span class="fold-head"
                  ><span class="fold-head-text"
                    ><span class="fold-title">${programName(program)}</span>
                    ${stateChip(program)} ·
                    ${countLabel((program.steps || []).length, {
                      none: t("steps_none"),
                      one: t("steps_one"),
                      many: t("steps_many"),
                    })}
                    ·
                    ${countLabel((program.schedules || []).length, {
                      none: t("schedules_none"),
                      one: t("schedules_one"),
                      many: t("schedules_many"),
                    })}${(program.schedules || []).length &&
                    !(program.schedules || []).some((s) => s.enabled !== false)
                      ? html` · <em>${t("no_schedule_on")}</em>`
                      : ""}${stateOf(program.id)?.suspended_until
                      ? html` · <em>${t("suspended")}</em>`
                      : ""}${adjustmentOf(program)
                      ? html` · <em>${adjustText(program)}</em>`
                      : ""}</span
                  >${headActions(program)}</span
                >`,
                yamlOpen(program.id ?? "")
                  ? html`${runHead(program)}
                    ${yamlBlock(program.id ?? "", index)}`
                  : html`
                      ${hiddenNotice(program)} ${runHead(program)}
                      ${this._textRow(t("name"), "", program.name, (v) =>
                        patch(index, { name: v }),
                      )}
                      ${preview(program, `program:${program.id}`)}
                      <div class="fold-section">${t("steps_title")}</div>
                      ${(program.steps || []).map((step, stepIndex) =>
                        renderStep(program, index, step, stepIndex),
                      )}
                      <div class="si-actions">
                        ${this._actionBtn(mdiPlus, t("add_step"), () =>
                          patch(index, {
                            steps: [
                              ...(program.steps || []),
                              {
                                id: this._openNew("step", "step_" + random()),
                                zones: [],
                                mode: "calculated",
                                percent: 100,
                                seconds: 0,
                                passes: 1,
                                max_litres: 0,
                                min_seconds: 0,
                                max_seconds: 0,
                                adjust_seconds: 0,
                                delay: null,
                                enabled: true,
                              },
                            ],
                          }),
                        )}
                      </div>
                      <div class="fold-section">${t("schedules_title")}</div>
                      ${renderSchedules(program, index)}
                      ${
                        // Rounds: the advanced mode (the standard one lists
                        // them, once set, in the program's notice).
                        advanced
                          ? this._numRow(
                              html`${t("tours")}<si-info
                                  >${t("tours_help")}</si-info
                                >`,
                              "",
                              program.tours ?? 1,
                              (v) =>
                                patch(index, {
                                  tours: Math.max(1, Math.round(num(v, 1))),
                                }),
                              1,
                              false,
                              1,
                            )
                          : ""
                      }
                      ${renderNotify(program, index)} ${adjustBlock(program)}
                      ${
                        // The last program cannot be deleted (the backend
                        // refuses it too): switch its schedules off instead.
                        // Nor one another program starts after: that
                        // schedule would wait for nothing.
                        programs.length > 1 &&
                        dependentsOf(programs, program.id).length
                          ? html`<div class="si-actions">
                              ${this._actionBtn(
                                mdiDelete,
                                t("delete"),
                                () => undefined,
                                true,
                                true,
                              )}<si-info
                                >${t("delete_blocked_after").replace(
                                  "{programs}",
                                  dependentsOf(programs, program.id)
                                    .map((p) => programName(p))
                                    .join(", "),
                                )}</si-info
                              >
                            </div>`
                          : programs.length > 1
                            ? html`<div class="si-actions">
                                ${this._actionBtn(
                                  mdiDelete,
                                  t("delete"),
                                  async () => {
                                    if (
                                      !(await this._ask(
                                        t("confirm_delete_program").replace(
                                          "{name}",
                                          program.name,
                                        ),
                                        true,
                                      ))
                                    )
                                      return;
                                    save(
                                      programs.filter((_, n) => n !== index),
                                    );
                                  },
                                  true,
                                )}
                              </div>`
                            : ""
                      }
                    `,
              )}
            </div>
          `,
        )}
        <div class="card-content">
          <div class="si-actions">
            ${this._actionBtn(mdiPlus, t("add"), () =>
              save([
                ...programs,
                {
                  id: this._openNew("program", "program_" + random()),
                  name: `${t("new_program")} ${programs.length + 1}`,
                  steps: [],
                  delay: 0,
                  tours: 1,
                  schedules: [],
                },
              ]),
            )}
          </div>
        </div>
        ${
          // The order, passes and pause of a one-off run of every zone (the
          // "Irrigate all zones" button of the hub device, for automations):
          // no program has them, so they are kept here, folded, for that run
          // alone. Titled as the settings they are: it read as a button. The
          // advanced mode only, unless one of them was changed, so that the
          // way that run waters is never hidden.
          this.config.ui_mode === "advanced" ||
          this.config.zone_sequencing === "parallel" ||
          Number(this.config.watering_passes ?? 1) > 1 ||
          Number(this.config.pause_between_zones ?? 0) > 0
            ? html`<div class="card-content">
                <details
                  class="more"
                  ?open=${this._isOpen("all_zones_now")}
                  @toggle=${(e: Event) =>
                    this._setOpen(
                      "all_zones_now",
                      (e.target as HTMLDetailsElement).open,
                    )}
                >
                  <summary>
                    ${t("all_zones_button_title")}<si-info
                      >${t("all_zones_now_help")}</si-info
                    >
                  </summary>
                  <div class="more-body">
                    ${this.renderExecutionSettings(lang, true)}
                  </div>
                </details>
              </div>`
            : ""
        }
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
      <ha-card>
        <h1 class="card-header">
          <span>${t("title")}<si-info>${t("description")}</si-info></span>
        </h1>
        ${supplies.map(
          (supply, index) => html`
            <div class="card-content">
              ${this._switchTitle(
                supply.name || t("title"),
                supply.enabled !== false,
                (on) => patch(index, { enabled: on }),
              )}
              ${this._textRow(t("name"), "", supply.name, (v) =>
                patch(index, { name: v }),
              )}
              ${
                // One picker per entity, and an empty one to add another:
                // entity ids typed by hand and separated by commas were
                // checked by nothing until a run tried to switch them (#893).
                [...(supply.entities || []), ""].map(
                  (entityId, n, all) => html`
                    <div class="setting-row">
                      <div class="setting-label">
                        ${n === 0 ? t("entities") : ""}
                      </div>
                      <ha-entity-picker
                        class="entity-field"
                        .hass=${this.hass}
                        .value=${entityId}
                        .includeDomains=${[
                          "switch",
                          "valve",
                          "input_boolean",
                          "light",
                        ]}
                        allow-custom-entity
                        @value-changed=${(e: CustomEvent) => {
                          const value = (e.detail?.value || "").trim();
                          const next = all.slice(0, -1);
                          if (n < next.length) {
                            if (value) next[n] = value;
                            else next.splice(n, 1);
                          } else if (value) {
                            next.push(value);
                          }
                          patch(index, {
                            entities: next.filter(
                              (id, i) => id && next.indexOf(id) === i,
                            ),
                          });
                        }}
                      ></ha-entity-picker>
                    </div>
                  `,
                )
              }
              ${this._numRow(
                html`${t("delay_before")}<si-info
                    >${t("delay_before_help")}</si-info
                  >`,
                localize("common.units.seconds", lang),
                supply.delay_before,
                (v) => patch(index, { delay_before: seconds(v) }),
              )}
              ${this._numRow(
                html`${t("delay_after")}<si-info
                    >${t("delay_after_help")}</si-info
                  >`,
                localize("common.units.seconds", lang),
                supply.delay_after,
                (v) => patch(index, { delay_after: seconds(v) }),
              )}
              ${
                // The power cut is for one kind of pump: the advanced panel
                // only (a supply has no YAML), unless it is set, so that it
                // never acts out of sight.
                this.config?.ui_mode === "advanced" ||
                (supply.kick_seconds ?? 0) > 0
                  ? this._numRow(
                      html`${t("kick_seconds")}<si-info
                          >${t("kick_seconds_help")}</si-info
                        >`,
                      localize("common.units.seconds", lang),
                      supply.kick_seconds ?? 0,
                      (v) =>
                        patch(index, {
                          kick_seconds: Math.max(
                            0,
                            Math.min(60, Number(v) || 0),
                          ),
                        }),
                      1,
                      false,
                      0,
                    )
                  : ""
              }
              <div class="si-actions">
                ${this._actionBtn(
                  mdiDelete,
                  t("delete"),
                  async () => {
                    if (
                      !(await this._ask(
                        t("confirm_delete").replace(
                          "{name}",
                          supply.name || supply.id || "",
                        ),
                        true,
                      ))
                    )
                      return;
                    save(supplies.filter((_, n) => n !== index));
                    this._clearSupplyFromZones(supply.id);
                  },
                  true,
                )}
              </div>
            </div>
          `,
        )}
        <div class="card-content">
          <div class="si-actions">
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
                  kick_seconds: 0,
                  enabled: true,
                },
              ]),
            )}
          </div>
        </div>
      </ha-card>
    `;
  }

  /** Zones keep the id of the supply they use: forget it once the supply is gone. */
  private async _clearSupplyFromZones(supplyId?: string): Promise<void> {
    if (!supplyId || !this.hass) return;
    for (const zone of this.zones.filter((z) => z.supply_id === supplyId)) {
      try {
        await saveZone(this.hass, { ...zone, supply_id: null });
      } catch (error) {
        console.error("Error clearing the supply of a zone:", error);
      }
    }
    this.zones = this.zones.map((z) =>
      z.supply_id === supplyId ? { ...z, supply_id: null } : z,
    );
  }

  /**
   * Create, change or remove a seasonal adjustment through the action, which
   * also updates the one in use: no id creates, an id changes, and an id with
   * `remove` removes (#1004).
   */
  private async _seasonalCall(data: Record<string, unknown>): Promise<void> {
    if (!this.hass) return;
    try {
      await this.hass.callService(DOMAIN, "set_seasonal_adjustment", data);
    } catch (error) {
      console.error("Seasonal adjustment failed:", error);
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
      this._seasonalCall({
        adjustment_id: id,
        ...data,
      });
    return html`
      <ha-card>
        <h1 class="card-header">
          <span>${t("title")}<si-info>${t("description")}</si-info></span>
        </h1>
        ${adjustments.map(
          (a) => html`
            <div class="card-content si-subgroup">
              ${this._switchTitle(a.name, a.enabled !== false, (on) =>
                update(a.id, { enabled: on }),
              )}
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
                html`${t("zones")}<si-info>${t("zones_hint")}</si-info>`,
                "",
                Array.isArray(a.zones)
                  ? a.zones.join(", ")
                  : (a.zones ?? "all"),
                (v) => update(a.id, { zones: v.trim() || "all" }),
              )}
              <ha-button
                @click=${() =>
                  this._seasonalCall({
                    adjustment_id: a.id,
                    remove: true,
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
              this._seasonalCall({
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
      <ha-card>
        <h1 class="card-header header-action">
          <span
            >${localize("panels.setup.title", lang)}<si-info
              >${localize(
                "panels.general.cards.setup-assistant.description",
                lang,
              )}</si-info
            ></span
          >
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
        </h1>
      </ha-card>
    `;
  }

  /**
   * The way to the Irrigation Unlimited import (#946): for somebody moving
   * over, once, so it sits beside the setup assistant rather than in a tab.
   */
  renderIuImportCard() {
    if (!this.hass) return html``;
    const lang = this.hass.language;
    return html`
      <ha-card>
        <h1 class="card-header header-action">
          <span
            >${localize("panels.iu_import.title", lang)}<si-info
              >${localize(
                "panels.general.cards.iu-import.description",
                lang,
              )}</si-info
            ></span
          >
          <ha-button
            @click=${() => {
              window.history.pushState(
                null,
                "",
                `${window.location.pathname.split("/").slice(0, -1).join("/")}/iu_import`,
              );
              window.dispatchEvent(new Event("location-changed"));
            }}
          >
            ${localize("panels.general.cards.iu-import.open", lang)}
          </ha-button>
        </h1>
      </ha-card>
    `;
  }

  renderTriggersCard() {
    if (!this.config || !this.data || !this.hass) return html``;

    const triggers = this.config.irrigation_start_triggers || [];

    return html`
      <ha-card>
        <h1 class="card-header">
          <span
            >${localize(
              "irrigation_start_triggers.title",
              this.hass.language,
            )}<si-info
              >${localize(
                "irrigation_start_triggers.description",
                this.hass.language,
              )}</si-info
            ></span
          >
        </h1>

        ${this.config?.full_controller === true
          ? // The full controller starts the watering itself: an automation
            // started on this event as well would water a second time.
            ""
          : html`<div class="card-content trigger-usage">
              ${localize(
                "irrigation_start_triggers.usage_before",
                this.hass.language,
              )}
              <code>smart_irrigation_start_irrigation_all_zones</code
              >${localize(
                "irrigation_start_triggers.usage_after",
                this.hass.language,
              )}
            </div>`}

        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize(
                "irrigation_start_triggers.active_label",
                this.hass.language,
              )}
            </div>
            <div class="select-wrap">
              <select
                class="field"
                @change=${(e: Event) =>
                  this.handleConfigChange({
                    active_start_trigger: (e.target as HTMLSelectElement).value,
                  })}
              >
                <option
                  value="default"
                  ?selected=${(this.config.active_start_trigger ||
                    "default") === "default"}
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
              <svg class="chev" viewBox="0 0 24 24">
                <path d=${mdiMenuDown}></path>
              </svg>
            </div>
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
    if (trigger.type === TRIGGER_TYPE_TIME && !trigger.offset_minutes) {
      // A clock time is its time: it read "Fixed time - 0m after", without
      // the 20:30 it starts at.
      offsetText = trigger.at || TRIGGER_DEFAULT_AT;
    } else if (
      trigger.type === TRIGGER_TYPE_SUNRISE &&
      trigger.offset_minutes === 0
    ) {
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

  private async _deleteTrigger(index: number) {
    if (!this.config?.irrigation_start_triggers || !this.hass) return;

    const triggerName =
      this.config.irrigation_start_triggers[index]?.name || "Unknown";
    if (
      await this._ask(
        localize(
          "irrigation_start_triggers.confirm_delete",
          this.hass.language,
        ).replace("{name}", triggerName),
        true,
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
      <ha-card>
        <h1 class="card-header">
          <span
            >${localize("weather_skip.title", this.hass.language)}<si-info
              >${localize(
                "weather_skip.description",
                this.hass.language,
              )}</si-info
            ></span
          >
        </h1>
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize("weather_skip.forecast_label", this.hass.language)}
              <si-info>
                ${localize(
                  "weather_skip.forecast_description",
                  this.hass.language,
                )}
              </si-info>
            </div>
            <ha-switch
              .checked=${!!(
                this.config.skip_irrigation_on_precipitation ||
                this.config.forecast_rain_credit
              )}
              .disabled=${!this.config.use_weather_service &&
              !(
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
          ${this._forecastWithoutService()}
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
        <div class="setting-label">${label}<si-info>${hint}</si-info></div>
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
    const section = (
      title: string,
      description: string,
      body: unknown,
      key?: string,
    ) => html`
      <div class="si-subgroup">
        ${key
          ? this._switchTitle(
              html`${title}<si-info>${description}</si-info>`,
              !!(this.config as any)[key],
              (on) => this.handleConfigChange({ [key]: on }),
            )
          : html`<div class="si-subgroup-title">
              ${title}<si-info>${description}</si-info>
            </div>`}
        ${body}
      </div>
    `;
    const sectionOn = (
      key: string,
      title: string,
      description: string,
      body: unknown,
    ) => section(title, description, body, key);
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
      <ha-card>
        <h1 class="card-header">
          <span>${t("title")}<si-info>${t("description")}</si-info></span>
        </h1>
        <div class="card-content">
          ${sectionOn(
            "skip_on_rain_sensor",
            t("rain.title"),
            t("rain.description"),
            html`
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
          ${sectionOn(
            "skip_on_freeze",
            t("freeze.title"),
            t("freeze.description"),
            html`
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
                  )}
                  ${this._readingSource(
                    MAPPING_TEMPERATURE,
                    this.config.freeze_sensor,
                    "freeze_sensor",
                  )}`
                : ""}
            `,
          )}
          ${sectionOn(
            "skip_on_wind",
            t("wind.title"),
            t("wind.description"),
            html`
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
                  )}
                  ${this._readingSource(
                    MAPPING_WINDSPEED,
                    this.config.wind_sensor,
                    "wind_sensor",
                  )}`
                : ""}
            `,
          )}
        </div>
      </ha-card>
    `;
  }

  /**
   * The Weather tab's skip page, every check that holds a run back in one
   * place: the forecast, what is measured, the days between irrigation, and
   * what the zones set for themselves (edited on the zone, summed up here).
   */
  renderSkipPage(cards: TemplateResult) {
    if (!this.hass) return html``;
    const lang = this.hass.language;
    const soil = (this.zones || [])
      .filter((zone) => !!zone.soil_moisture_sensor)
      .map((zone) => ({
        zone_id: zone.id ?? 0,
        zone: `${zone.name} ${zone.soil_moisture_threshold ?? 50} %`,
      }));
    return html`
      ${cards}
      <ha-card>
        <div class="card-content skip-soil">
          ${soil.length
            ? html`${localize("panels.skip.soil-zones", lang)}
              ${this._zoneLinks(soil)}`
            : html`${localize("panels.skip.soil-moisture", lang)}
                <a
                  href="/${DOMAIN}/zones"
                  @click=${(e: Event) => {
                    e.preventDefault();
                    navigate(this, `/${DOMAIN}/zones`);
                  }}
                  >${localize("panels.skip.open-zones", lang)}</a
                >`}
        </div>
      </ha-card>
    `;
  }

  /**
   * Where a skip check reads its value, and whether a sensor group reads the
   * same one (#972).
   *
   * The wind is read for the evaporation in a sensor group and again by the
   * wind check, and the temperature by the freeze check: set up on two pages,
   * with nothing to show they are the same sensor, or that they are not.
   */
  private _readingSource(
    measurement: string,
    sensor: string | null | undefined,
    key: string,
  ): TemplateResult {
    const lang = this.hass!.language;
    const t = (key: string, ...args: any[]) =>
      localize(`measured_skip.source.${key}`, lang, ...args);
    const name = (entity?: string) =>
      (entity && this.hass?.states?.[entity]?.attributes?.friendly_name) ||
      entity ||
      "";
    const quoted = (group: string) => t("group", "{group}", group);
    const uses = readingUses(this.mappings, measurement, sensor);
    const same = uses.filter((use) => use.same).map((use) => quoted(use.group));
    const other = uses.filter((use) => !use.same);
    // A group that reads this value from a sensor of its own: one tap makes
    // the check read that sensor too.
    const adoptable = other.find(
      (use) => use.source === "sensor" && use.entity && use.entity !== sensor,
    );
    const from = sensor
      ? t("sensor", "{sensor}", name(sensor))
      : this.config?.use_weather_service
        ? t("service")
        : t("nothing");
    const elsewhere = other
      .map(
        (use) =>
          `${quoted(use.group)}: ${
            use.source === "sensor"
              ? name(use.entity)
              : use.source === "weather_service"
                ? t("service-short")
                : t("static-short")
          }`,
      )
      .join("; ");
    return html`<div class="setting-hint reading-source">
      ${from} ${same.length ? t("same", "{groups}", same.join(", ")) : ""}
      ${!same.length && other.length ? t("other", "{groups}", elsewhere) : ""}
      ${!same.length && adoptable
        ? html`<div>
            <ha-button
              appearance="plain"
              size="small"
              @click=${() =>
                this.handleConfigChange({ [key]: adoptable.entity } as any)}
            >
              ${t("adopt", "{sensor}", name(adoptable.entity))}
            </ha-button>
          </div>`
        : ""}
    </div>`;
  }

  renderObservedWateringCard() {
    if (!this.config || !this.data || !this.hass) return html``;
    const lang = this.hass.language;
    // Observed watering is turned on with "Calculate and water" and left as it
    // was otherwise: switching it by hand is for the advanced panel.
    if (this.config.ui_mode !== "advanced") return html``;

    return html`
      <ha-card>
        ${this._switchHeader(
          html`${localize("observed_watering.title", lang)}<si-info
              >${localize("observed_watering.description", lang)}</si-info
            >`,
          !!this.config.observed_watering_enabled,
          (on) => this.handleConfigChange({ observed_watering_enabled: on }),
        )}
        <div class="card-content">
          ${this.config.observed_watering_enabled &&
          this.config.ui_mode === "advanced"
            ? html`${this._numRow(
                html`${localize("observed_watering.leak_label", lang)}<si-info
                    >${localize(
                      "observed_watering.leak_description",
                      lang,
                    )}</si-info
                  >`,
                "L",
                this.config.leak_alert_litres ?? 0,
                (v) =>
                  this.handleConfigChange({
                    leak_alert_litres: Math.min(
                      1000,
                      Math.max(0, parseFloat(v) || 0),
                    ),
                  }),
              )}`
            : ""}
          ${this.config.full_controller === true
            ? html`${this._numRow(
                html`${localize(
                    "observed_watering.set_aside_label",
                    lang,
                  )}<si-info
                    >${localize(
                      "observed_watering.set_aside_description",
                      lang,
                    )}</si-info
                  >`,
                "",
                this.config.set_aside_after ?? 0,
                (v) =>
                  this.handleConfigChange({
                    set_aside_after: Math.min(
                      10,
                      Math.max(0, parseInt(v) || 0),
                    ),
                  }),
              )}`
            : ""}
          ${this.config.full_controller === true
            ? ""
            : this.renderExecutionSettings(lang, false)}
        </div>
      </ha-card>
    `;
  }

  /**
   * The full controller, on a card of its own near the top of the page.
   *
   * It was the last switch of the card about observed watering, whose text is
   * about crediting the bucket: the main feature of the release was hard to
   * find, and switched on without a word although it closes valves (#893).
   */
  renderMasterSwitchCard(): TemplateResult {
    if (!this.config || !this.hass) return html``;
    const lang = this.hass.language;
    const t = (key: string) =>
      localize(`panels.general.cards.master-switch.${key}`, lang);
    // One list for two settings: off stops everything, calculating only
    // holds the watering and keeps the balances current.
    // Calculate and water is the full controller; calculate only leaves the
    // watering to an automation of one's own (one_choice.py).
    const mode =
      this.config.irrigation_enabled === false
        ? "off"
        : this.config.full_controller === true
          ? "water"
          : "calculate";
    const modes = ["water", "calculate", "off"] as const;
    return html`
      <ha-card class="master-switch" header="${t("title")}">
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${t("mode")}<si-info
                >${mode === "off"
                  ? t("off-note")
                  : mode === "calculate"
                    ? t("calculate-note")
                    : t("water-note")}</si-info
              >
            </div>
            <div class="select-wrap">
              <select
                class="field"
                @change=${async (e: Event) => {
                  const target = e.target as HTMLSelectElement;
                  const next = target.value as (typeof modes)[number];
                  const ask =
                    next === "off"
                      ? t("confirm-off")
                      : next === "calculate" && mode === "water"
                        ? t("confirm-calculate")
                        : next === "water" && mode !== "water"
                          ? localize(
                              "observed_watering.confirm_full_controller",
                              lang,
                            )
                          : null;
                  if (ask && !(await this._ask(ask))) {
                    target.value = mode;
                    return;
                  }
                  this.handleConfigChange(
                    next === "off"
                      ? { irrigation_enabled: false }
                      : next === "water"
                        ? {
                            irrigation_enabled: true,
                            watering_enabled: true,
                            full_controller: true,
                            // What is watered outside the programs counts too.
                            ...(mode === "water"
                              ? {}
                              : { observed_watering_enabled: true }),
                          }
                        : {
                            irrigation_enabled: true,
                            watering_enabled: true,
                            full_controller: false,
                            direct_valve_control_enabled: false,
                          },
                  )
                    .then(() => this._fetchData())
                    .catch(() => undefined);
                }}
              >
                ${modes.map(
                  (value) =>
                    html`<option value=${value} ?selected=${value === mode}>
                      ${t(`mode-${value}`)}
                    </option>`,
                )}
              </select>
              <svg class="chev" viewBox="0 0 24 24">
                <path d=${mdiMenuDown}></path>
              </svg>
            </div>
          </div>
        </div>
      </ha-card>
    `;
  }

  renderExecutionSettings(lang: string, full: boolean): TemplateResult {
    if (!this.config) return html``;
    return html`
      <!-- Sequencing also decides what a start trigger works back from to
               finish at sunrise, so it applies whether Smart Irrigation drives
               the valves or an automation of your own does. -->
      <div class="setting-row">
        <div class="setting-label">
          ${localize("observed_watering.sequencing_label", lang)}${full
            ? ""
            : html`<si-info
                >${localize(
                  "observed_watering.sequencing_description",
                  lang,
                )}</si-info
              >`}
        </div>
        <div class="select-wrap">
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
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${mdiMenuDown}></path>
          </svg>
        </div>
      </div>
      ${this.config.direct_valve_control_enabled &&
      (full || this.config.ui_mode === "advanced")
        ? this.renderCycleAndSoak(lang)
        : ""}
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
    // The soak is one setting for every program: shown here too when a step of
    // a program waters in passes, not only for this run in passes (Q5).
    const stepsInPasses = (config.programs || []).some((program: any) =>
      (program.steps || []).some((step: any) => Number(step.passes) > 1),
    );
    const sequential = config.zone_sequencing !== "parallel";
    return html`
      ${this._numRow(
        html`${localize("observed_watering.passes_label", lang)}<si-info
            >${localize("observed_watering.passes_description", lang)}</si-info
          >`,
        "",
        passes,
        (v) =>
          this.handleConfigChange({
            watering_passes: Math.min(6, Math.max(1, parseInt(v) || 1)),
          }),
      )}
      ${passes > 1 || stepsInPasses
        ? html`${this._numRow(
            localize("observed_watering.soak_label", lang),
            localize("observed_watering.minutes", lang),
            config.soak_minutes ?? 15,
            (v) =>
              this.handleConfigChange({
                soak_minutes: Math.max(0, parseFloat(v) || 0),
              }),
          )}`
        : ""}
      ${sequential
        ? html`${this._numRow(
            html`${localize(
                "observed_watering.pause_between_zones_label",
                lang,
              )}<si-info
                >${localize(
                  "observed_watering.pause_between_zones_description",
                  lang,
                )}</si-info
              >`,
            localize("observed_watering.seconds", lang),
            config.pause_between_zones ?? 0,
            (v) =>
              this.handleConfigChange({
                pause_between_zones: Math.max(0, parseFloat(v) || 0),
              }),
          )}`
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
   *
   * One card of two rows with whether Smart Irrigation lays its example
   * blueprints down (#930, #1056). The System heading above names it, so it
   * has no title of its own.
   */
  renderPanelModeCard() {
    if (!this.hass || !this.config) return html``;
    const lang = this.hass.language;
    const advanced = this.config.ui_mode === "advanced";
    // On out of the box: the advanced mode only, unless it was turned off.
    const blueprints = advanced || this.config.install_blueprints === false;
    return html`<ha-card>
      <div class="card-content">
        <div class="setting-row">
          <div class="setting-label">
            ${localize(
              "panels.general.cards.panel-mode.labels.advanced",
              lang,
            )}<si-info
              >${localize(
                "panels.general.cards.panel-mode.labels.advanced-hint",
                lang,
              )}</si-info
            >
          </div>
          <ha-switch
            .checked=${advanced}
            @change=${(e: Event) =>
              this.handleConfigChange({
                ui_mode: (e.target as any).checked ? "advanced" : "standard",
              })}
          ></ha-switch>
        </div>
        ${blueprints
          ? html`<div class="setting-row">
              <div class="setting-label">
                ${localize("blueprints.title", lang)}<si-info
                  >${localize("blueprints.install_label", lang)}.
                  ${localize("blueprints.install_help", lang)}</si-info
                >
              </div>
              <ha-switch
                .checked=${this.config.install_blueprints !== false}
                @change=${(e: Event) =>
                  this.handleConfigChange({
                    install_blueprints: (e.target as any).checked,
                  })}
              ></ha-switch>
            </div>`
          : ""}
      </div>
    </ha-card>`;
  }

  /** A card's title with the switch that turns it on: no "Enabled" row. */
  private _switchHeader(
    title: unknown,
    checked: boolean,
    onChange: (checked: boolean) => void,
  ): TemplateResult {
    return html`<h1 class="card-header si-head">
      <span>${title}</span>
      <ha-switch
        .checked=${checked}
        @change=${(e: Event) => onChange((e.target as any).checked)}
      ></ha-switch>
    </h1>`;
  }

  /** The same, for a part of a card. */
  private _switchTitle(
    title: unknown,
    checked: boolean,
    onChange: (checked: boolean) => void,
  ): TemplateResult {
    return html`<div class="si-subgroup-title si-head">
      <span>${title}</span>
      <ha-switch
        .checked=${checked}
        @change=${(e: Event) => onChange((e.target as any).checked)}
      ></ha-switch>
    </div>`;
  }

  renderCoordinateCard() {
    if (!this.config || !this.data || !this.hass) return html``;

    // Get current Home Assistant coordinates for display
    const haCoords = this.hass.config as any;
    const haLatitude = haCoords?.latitude || 0;
    const haLongitude = haCoords?.longitude || 0;
    const haElevation = haCoords?.elevation || 0;

    return html`
      <ha-card>
        <h1 class="card-header"><span>${localize("coordinate_config.title", this.hass.language)}<si-info>${localize("coordinate_config.description", this.hass.language)}</si-info></span></h1>
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
    // The zones that count days of their own (0 included: no limit for them).
    const own = (this.zones || [])
      .filter((zone) => typeof zone.days_between_irrigation === "number")
      .map((zone) => ({
        zone_id: zone.id ?? 0,
        zone: `${zone.name} ${zone.days_between_irrigation}`,
      }));

    return html`
      <ha-card>
        <h1 class="card-header">
          <span
            >${localize(
              "days_between_irrigation.title",
              this.hass.language,
            )}<si-info
              >${localize(
                "days_between_irrigation.description",
                this.hass.language,
              )}</si-info
            ></span
          >
        </h1>

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
          ${own.length
            ? // Set on the zone, shown here so that none acts out of sight.
              html`<div class="setting-hint row-hint skip-soil">
                ${localize("days_between_irrigation.own", this.hass.language)}
                ${this._zoneLinks(own)}
              </div>`
            : ""}
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

  private handleConfigChange(
    changes: Partial<SmartIrrigationConfig>,
  ): Promise<void> {
    // Use debounced save for better performance
    return this.debouncedSave(changes);
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
    label: string | TemplateResult,
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
    label: string | TemplateResult,
    value: any,
    onCommit: (v: string) => void,
    hint = "",
  ): TemplateResult {
    return html`
      <div class="setting-row">
        <div class="setting-label">
          ${label}${hint ? html`<si-info>${hint}</si-info>` : ""}
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

  /**
   * What a skip condition is set to under Skip watering, in words, or ""
   * when it is off there. Thresholds are stored metric and shown in the units of
   * Home Assistant, as the Info page shows them.
   */
  private _conditionSetting(id: string): string {
    const config = this.config;
    if (!config || !this.hass) return "";
    const lang = this.hass.language;
    const t = (key: string, ...args: any[]) =>
      localize(`programs.${key}`, lang, ...args);
    const metric = (this.hass.config as any)?.unit_system?.temperature !== "°F";
    const round = (value: number) => Math.round(value * 10) / 10;
    switch (id) {
      case "rain_sensor": {
        if (!config.skip_on_rain_sensor || !config.rain_sensor) return "";
        const state = (this.hass.states as any)?.[config.rain_sensor];
        return state?.attributes?.friendly_name ?? config.rain_sensor;
      }
      case "freeze": {
        if (!config.skip_on_freeze) return "";
        const c = config.freeze_threshold ?? 2;
        return t(
          "cond_freeze",
          "{value}",
          metric ? `${round(c)} °C` : `${round((c * 9) / 5 + 32)} °F`,
        );
      }
      case "wind": {
        if (!config.skip_on_wind) return "";
        const kmh = config.wind_threshold ?? 20;
        return t(
          "cond_wind",
          "{value}",
          metric ? `${round(kmh)} km/h` : `${round(kmh / 1.609344)} mph`,
        );
      }
      case "precipitation": {
        if (!config.skip_irrigation_on_precipitation) return "";
        const mm = config.precipitation_threshold_mm ?? 2;
        return t(
          "cond_precipitation",
          "{value}",
          metric ? `${round(mm)} mm` : `${round(mm / 25.4)} in`,
        );
      }
      case "days_between": {
        // A zone's own days count as much as the general ones: the condition
        // holds those zones back even when the general setting is 0.
        const general = config.days_between_irrigation ?? 0;
        const own = (this.zones || [])
          .map((zone: any) => zone.days_between_irrigation)
          .filter((d: any) => typeof d === "number" && d > 0);
        const all = general > 0 ? [general, ...own] : own;
        if (!all.length) return "";
        const low = Math.min(...all);
        const high = Math.max(...all);
        return t(
          "cond_days_between",
          "{n}",
          low === high ? String(low) : `${low}-${high}`,
        );
      }
      case "soil_moisture": {
        const count = (this.zones || []).filter(
          (zone) => !!zone.soil_moisture_sensor,
        ).length;
        if (count <= 0) return "";
        return count === 1
          ? t("cond_soil_one", "{n}", String(count))
          : t("cond_soil", "{n}", String(count));
      }
      default:
        return "";
    }
  }

  /** Where the advanced mode is turned on: "Settings › General › Advanced settings". */
  private _advancedPath(lang: string): string {
    return [
      localize("panels.groups.settings", lang),
      localize("panels.general.title", lang),
      localize("panels.general.cards.panel-mode.labels.advanced", lang),
    ].join(" › ");
  }

  // A day of the year, stored "MM-DD", picked as a month and a day instead of
  // typed. No month: none (the whole year). A day past the end of the month
  // picked is brought back to its last day; 29 February is a real day.
  private _monthDayRow(
    label: string | TemplateResult,
    value: string | null | undefined,
    monthName: (i: number) => string,
    onCommit: (v: string | null) => void,
  ): TemplateResult {
    const match = /^(\d{2})-(\d{2})$/.exec(value ?? "");
    const month = match ? Number(match[1]) : 0;
    const day = match ? Number(match[2]) : 1;
    const daysIn = (m: number) => new Date(2024, m, 0).getDate();
    const pad = (n: number) => String(n).padStart(2, "0");
    const commit = (m: number, d: number) =>
      onCommit(
        m ? `${pad(m)}-${pad(Math.min(Math.max(d, 1), daysIn(m)))}` : null,
      );
    return html`
      <div class="setting-row">
        <div class="setting-label">${label}</div>
        <div class="combo-field">
          <div class="select-wrap">
            <select
              class="field"
              @change=${(e: Event) =>
                commit(Number((e.target as HTMLSelectElement).value), day)}
            >
              <option value="0" ?selected=${!month}></option>
              ${Array.from(
                { length: 12 },
                (_, i) => html`
                  <option value=${i + 1} ?selected=${month === i + 1}>
                    ${monthName(i)}
                  </option>
                `,
              )}
            </select>
            <svg class="chev" viewBox="0 0 24 24">
              <path d=${mdiMenuDown}></path>
            </svg>
          </div>
          <div class="select-wrap day-select">
            <select
              class="field"
              ?disabled=${!month}
              @change=${(e: Event) =>
                commit(month, Number((e.target as HTMLSelectElement).value))}
            >
              ${Array.from(
                { length: month ? daysIn(month) : 31 },
                (_, i) => html`
                  <option value=${i + 1} ?selected=${day === i + 1}>
                    ${i + 1}
                  </option>
                `,
              )}
            </select>
            <svg class="chev" viewBox="0 0 24 24">
              <path d=${mdiMenuDown}></path>
            </svg>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Without a weather service there is no forecast. In sight, not behind a
   * second "i": switched on (kept from before), it holds nothing back.
   */
  private _forecastWithoutService() {
    if (!this.hass || !this.config || this.config.use_weather_service)
      return "";
    const on = !!(
      this.config.skip_irrigation_on_precipitation ||
      this.config.forecast_rain_credit
    );
    return html`<div class="setting-hint row-hint ${on ? "warning-hint" : ""}">
      ${localize(
        on
          ? "weather_skip.forecast_no_service_on"
          : "weather_skip.forecast_no_service",
        this.hass.language,
      )}
      <a
        href="/${DOMAIN}/weatherservice"
        @click=${(e: Event) => {
          e.preventDefault();
          navigate(this, `/${DOMAIN}/weatherservice`);
        }}
        >${localize(
          "weather_skip.forecast_set_up_service",
          this.hass.language,
        )}</a
      >
    </div>`;
  }

  private _numRow(
    label: string | TemplateResult,
    unit: string | TemplateResult,
    value: any,
    onCommit: (v: string) => void,
    step = 1,
    readonly = false,
    min: number | null = null,
  ): TemplateResult {
    const decimals = (String(step).split(".")[1] || "").length;
    // The value the field shows is the one kept: a figure below the minimum
    // used to be stored clamped while the field still showed it, and the
    // minus button went on below it.
    const floor = (value: number) =>
      min !== null && value < min ? min : value;
    const bump = (input: HTMLInputElement, dir: number) => {
      const cur = parseFloat(input.value);
      const next = floor(
        +((isNaN(cur) ? 0 : cur) + dir * step).toFixed(decimals),
      );
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
            min=${min ?? ""}
            @change=${(e: Event) => {
              const input = e.target as HTMLInputElement;
              const value = parseFloat(input.value);
              if (!isNaN(value) && floor(value) !== value) {
                input.value = String(floor(value));
              }
              onCommit(input.value);
            }}
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
  private _programLabel(id: string | undefined, name: string | undefined) {
    return name || id || "";
  }

  /** Asks in a Home Assistant dialog; true to go ahead. */
  private _ask(text: string, destructive = false): Promise<boolean> {
    return askConfirmation(this.hass, { text, destructive });
  }

  private _actionBtn(
    icon: string,
    label: string,
    onClick: (e: Event) => void,
    danger = false,
    disabled = false,
  ): TemplateResult {
    // A destructive action is outlined in red, not filled: it weighed as much
    // as the action next to it, "Delete" beside "Run now" (#893).
    return html`
      <ha-button
        appearance=${danger ? "outlined" : "filled"}
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

      /* The three sections of the settings page (#972). */
      /* The master switch stands apart from the page's description. */
      ha-card.master-switch {
        margin-top: 16px;
      }

      .run-views {
        display: inline-flex;
        border: 1px solid var(--divider-color);
        border-radius: 16px;
        overflow: hidden;
        margin: 4px 0 8px;
      }
      .run-views button {
        border: 0;
        background: none;
        color: var(--primary-text-color);
        font: inherit;
        font-size: 0.85em;
        padding: 4px 12px;
        cursor: pointer;
      }
      .run-views button.on {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .settings-section {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        /* The cards' 5 px margin and 16 px padding: the icon starts where
           their content does (#1050), the line spans the cards' width. */
        margin: 32px 5px 8px;
        padding: 16px 16px 0;
        border-top: 1px solid var(--divider-color);
      }
      /* The icon on the title's middle (#1056): both on one 28 px line,
         the icon centred in it. It hung 2 px under the line's top, and the
         heading's line was taller than the icon, so it sat low. */
      .settings-section ha-icon {
        color: var(--primary-color);
        display: flex;
        align-items: center;
        height: 28px;
      }
      .settings-section h2 {
        margin: 0;
        font-size: 1.3em;
        line-height: 28px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      /* A card that is only a way somewhere (the setup assistant, the
         Irrigation Unlimited import): the button on the title's line, not on
         a row of its own under a divider (#1056). */
      .card-header.header-action {
        align-items: center;
        gap: 12px;
        padding-bottom: 12px;
      }
      .card-header.header-action > span {
        flex: 1 1 auto;
        min-width: 0;
        overflow-wrap: anywhere;
        line-height: 1.3;
      }
      /* A button's own size, not the title's 24 px. */
      .card-header.header-action > ha-button {
        flex: 0 0 auto;
        font-size: var(--ha-font-size-m, 14px);
        letter-spacing: normal;
        line-height: normal;
      }
      /* A seasonal adjustment: its own padding, since .si-subgroup sets the
         card content's to 0 on the sides. */
      .card-content.si-subgroup {
        padding: 12px 16px;
      }
      .settings-section-sub {
        margin-top: 2px;
        color: var(--secondary-text-color);
      }
      .reading-source ha-button {
        margin-top: 4px;
      }

      /* Where a skip check reads its value, under its sensor field. */
      .reading-source {
        margin: -4px 0 8px;
      }

      /* A program's header row: its name and state, then its actions as
         icons. On a phone the text wraps and the icons keep their room. */
      .head-actions {
        display: inline-flex;
        flex: 0 0 auto;
        align-items: center;
        --mdc-icon-button-size: 36px;
        --mdc-icon-size: 20px;
        --ha-icon-button-size: 36px;
      }
      .head-actions ha-icon-button {
        color: var(--primary-color);
      }
      .head-actions ha-icon-button.danger {
        color: var(--error-color, #db4437);
      }
      .head-actions ha-icon-button.on {
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.12);
        border-radius: 50%;
      }
      .state-chip {
        display: inline-block;
        margin-left: 6px;
        padding: 0 8px;
        border-radius: 10px;
        font-size: 0.8em;
        font-weight: 500;
        line-height: 1.6;
        color: var(--text-primary-color, #fff);
        background: var(--primary-color);
      }
      .state-chip.waiting,
      .state-chip.paused {
        color: var(--primary-text-color);
        background: var(--secondary-background-color, #e5e5e5);
      }
      .state-detail {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }

      .skip-soil a {
        color: var(--primary-color);
      }

      /* The explanation under a setting: a nested .card-content has no
         padding of its own, so the text sat on the divider above it. */
      .setting-note {
        padding: 10px 0 12px;
        line-height: 1.4;
      }

      /* What the switch just above means: set as the hint under a label is
         (the Panel card), not as a paragraph of its own under a divider. */
      .setting-row:has(+ .setting-note),
      .setting-row:has(+ .setting-help) {
        border-bottom: 0;
      }
      .setting-row + .setting-note,
      .setting-help {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        line-height: 1.4;
        padding: 0 0 12px;
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
      .combo-field .select-wrap.day-select {
        width: 90px;
      }
      .cond-off {
        opacity: 0.55;
      }
      .cond-setting {
        color: var(--secondary-text-color);
        font-size: 0.9em;
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
