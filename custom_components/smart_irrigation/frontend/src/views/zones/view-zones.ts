import { TemplateResult, LitElement, html, CSSResultGroup, css } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { repeat } from "lit/directives/repeat.js";
import { query } from "lit/decorators.js";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { loadHaForm } from "../../load-ha-elements";
import { UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  mdiInformationOutline,
  mdiDelete,
  mdiCalculator,
  mdiUpdate,
  mdiPailRemove,
  mdiCloudOutline,
  mdiCalendar,
  mdiChevronDown,
  mdiMenuDown,
  mdiPlus,
  mdiMinus,
} from "@mdi/js";
import {
  deleteZone,
  fetchConfig,
  fetchZones,
  saveZone,
  calculateZone,
  updateZone,
  fetchModules,
  fetchMappings,
  calculateAllZones,
  updateAllZones,
  resetAllBuckets,
  clearAllWeatherdata,
  fetchWateringCalendar,
  fetchMappingWeatherRecords,
} from "../../data/websockets";
import { SubscribeMixin } from "../../subscribe-mixin";

import {
  SmartIrrigationConfig,
  SmartIrrigationZone,
  SmartIrrigationZoneState,
  SmartIrrigationModule,
  SmartIrrigationMapping,
  WeatherRecord,
} from "../../types";
import { output_unit } from "../../helpers";
import { globalStyle } from "../../styles/global-style";
import { localize } from "../../../localize/localize";
import {
  DOMAIN,
  UNIT_SECONDS,
  ZONE_BUCKET,
  ZONE_DRAINAGE_RATE,
  ZONE_DURATION,
  ZONE_FLOW_SENSOR,
  ZONE_LEAD_TIME,
  ZONE_LINKED_ENTITY,
  ZONE_MAPPING,
  ZONE_MAXIMUM_BUCKET,
  ZONE_MAXIMUM_DURATION,
  ZONE_MODULE,
  ZONE_MULTIPLIER,
  ZONE_NAME,
  ZONE_SIZE,
  ZONE_STATE,
  ZONE_THROUGHPUT,
} from "../../const";
import moment, { Moment } from "moment";

@customElement("smart-irrigation-view-zones")
class SmartIrrigationViewZones extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() config?: SmartIrrigationConfig;

  @property({ type: Array })
  private zones: SmartIrrigationZone[] = [];
  @property({ type: Array })
  private modules: SmartIrrigationModule[] = [];
  @property({ type: Array })
  private mappings: SmartIrrigationMapping[] = [];

  @property({ type: Map })
  private wateringCalendars = new Map<number, any>();

  @property({ type: Map })
  private weatherRecords = new Map<number, WeatherRecord[]>();

  @property({ type: Boolean })
  private isLoading = true;

  @property({ type: Boolean })
  private isSaving = false;

  @property({ type: Boolean })
  private isCreatingZone = false;

  // True once the first data load has completed. Used to avoid tearing the
  // whole view down to a "loading" card on every background refresh — that
  // teardown is what dropped focus and reset scroll to the top while editing.
  private _hasLoadedOnce = false;

  // Set just before an inline-edit save so we can ignore the _config_updated
  // event our own write echoes back (the local state is already up to date,
  // a refetch would only cause a flicker). External changes still refresh.
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

  // Global debounce timer for better performance
  private globalDebounceTimer: number | null = null;

  // Cache for rendered zone cards
  private zoneCache = new Map<string, TemplateResult>();

  // Which zone cards are expanded (own collapsible — full control over styling)
  private _expanded: Set<number> = new Set();
  private _toggleZone(id?: number): void {
    if (id == undefined) {
      return;
    }
    if (this._expanded.has(id)) {
      this._expanded.delete(id);
    } else {
      this._expanded.add(id);
    }
    this._scheduleUpdate();
  }

  @query("#nameInput")
  private nameInput!: HTMLInputElement;

  @query("#sizeInput")
  private sizeInput!: HTMLInputElement;

  @query("#throughputInput")
  private throughputInput!: HTMLInputElement;

  /*constructor() {
    super();
    this._fetchData();
  }*/
  firstUpdated() {
    loadHaForm().catch((error) => {
      console.error("Failed to load HA form:", error);
    });
    //this._fetchData();
  }

  public hassSubscribe(): Promise<UnsubscribeFunc>[] {
    // Initial data fetch for UI setup with proper error handling
    this._fetchData().catch((error) => {
      console.error("Failed to fetch initial data:", error);
    });

    return [
      this.hass!.connection.subscribeMessage(
        () => {
          // Skip automatic data updates when user is actively creating a zone
          if (this.isCreatingZone) {
            console.debug("Skipping data refresh during zone creation");
            return;
          }
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

    try {
      // Only show the full-screen loading card on the very first load.
      // Background refreshes must not unmount the view (focus/scroll loss).
      if (!this._hasLoadedOnce) {
        this.isLoading = true;
      }

      // Fetch all data concurrently to reduce total wait time
      const [config, zones, modules, mappings] = await Promise.all([
        fetchConfig(this.hass),
        fetchZones(this.hass),
        fetchModules(this.hass),
        fetchMappings(this.hass),
      ]);

      this.config = config;
      this.zones = zones;
      this.modules = modules;
      this.mappings = mappings;

      // Fetch watering calendars for each zone
      this._fetchWateringCalendars();

      // Fetch weather records for each zone that has a mapping
      this._fetchWeatherRecords();

      // Clear the cache when new data is loaded
      this.zoneCache.clear();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.isLoading = false;
      this._hasLoadedOnce = true;
      // Trigger a re-render to ensure UI updates
      this._scheduleUpdate();
    }
  }

  private handleCalculateAllZones(): void {
    if (!this.hass) {
      return;
    }
    this.isSaving = true;
    calculateAllZones(this.hass)
      .catch((error) => {
        console.error("Failed to calculate all zones:", error);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleUpdateAllZones(): void {
    if (!this.hass) {
      return;
    }
    this.isSaving = true;
    updateAllZones(this.hass)
      .catch((error) => {
        console.error("Failed to update all zones:", error);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleResetAllBuckets(): void {
    if (!this.hass) {
      return;
    }
    this.isSaving = true;
    resetAllBuckets(this.hass)
      .catch((error) => {
        console.error("Failed to reset all buckets:", error);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleClearAllWeatherdata(): void {
    if (!this.hass) {
      return;
    }
    this.isSaving = true;
    clearAllWeatherdata(this.hass)
      .catch((error) => {
        console.error("Failed to clear all weather data:", error);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleAddZone(): void {
    if (!this.nameInput.value.trim()) {
      return; // Don't add empty zones
    }

    // Clear the zone creation flag since we're submitting
    this.isCreatingZone = false;

    const newZone: SmartIrrigationZone = {
      //id: this.zones.length + 1, //new zone will have ID that is equal to current zone length + 1
      name: this.nameInput.value.trim(),
      size: parseFloat(this.sizeInput.value) || 0,
      throughput: parseFloat(this.throughputInput.value) || 0,
      state: SmartIrrigationZoneState.Automatic,
      duration: 0,
      bucket: 0,
      module: undefined,
      delta: 0,
      explanation: "",
      multiplier: 1,
      mapping: undefined,
      lead_time: 0,
      maximum_duration: undefined,
      maximum_bucket: undefined,
      drainage_rate: undefined,
      current_drainage: 0,
    };

    // Optimistically update the UI
    this.zones = [...this.zones, newZone];
    this.isSaving = true;

    // Save zone with proper error handling
    this.saveToHA(newZone)
      .then(() => {
        // Clear the input fields on successful save
        this.nameInput.value = "";
        this.sizeInput.value = "";
        this.throughputInput.value = "";
        // Refresh data to get the server-assigned ID
        return this._fetchData();
      })
      .catch((error) => {
        console.error("Failed to add zone:", error);
        // Revert optimistic update on error
        this.zones = this.zones.slice(0, -1);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleEditZone(
    index: number,
    updatedZone: SmartIrrigationZone,
  ): void {
    if (!this.hass) {
      return;
    }

    // Use direct array assignment for better performance
    this.zones[index] = updatedZone;

    // Invalidate cache for this zone
    if (updatedZone.id) {
      this.zoneCache.delete(updatedZone.id.toString());
    }

    // Use global debounce to reduce timer overhead
    if (this.globalDebounceTimer) {
      clearTimeout(this.globalDebounceTimer);
    }

    // Debounce saving to avoid excessive API calls during rapid editing
    this.globalDebounceTimer = window.setTimeout(() => {
      this.isSaving = true;
      // Ignore the _config_updated echo this save triggers (see flag declaration).
      this._suppressNextConfigUpdate = true;
      this.saveToHA(updatedZone)
        .catch((error) => {
          // Save failed: clear the guard so it doesn't swallow a later refresh.
          this._suppressNextConfigUpdate = false;
          console.error("Failed to save zone:", error);
        })
        .finally(() => {
          this.isSaving = false;
          this._scheduleUpdate();
        });
      this.globalDebounceTimer = null;
    }, 500);

    // Trigger minimal re-render
    this._scheduleUpdate();
  }

  private handleRemoveZone(ev: Event, index: number): void {
    if (!this.hass) {
      return;
    }
    /*showConfirmationDialog(
      ev,
      "Are you sure you want to delete this zone?",
      index
    );*/
    //const dialog = new ConfirmationDialog();
    //dialog.showDialog("{'message':'Test!'}");
    const zoneid = this.zones[index].id;
    const zone = this.zones[index];
    if (!zone || zoneid == undefined) {
      return;
    }

    // Store original for potential rollback
    const originalZones = [...this.zones];

    // Optimistically update UI
    this.zones = this.zones.filter((_, i) => i !== index);

    // Clear cache for this zone
    this.zoneCache.delete(zoneid.toString());

    this.isSaving = true;

    // Delete zone from HA with proper error handling
    deleteZone(this.hass, zoneid.toString())
      .catch((error) => {
        console.error("Failed to delete zone:", error);
        // Revert the local change if deletion failed
        this.zones = originalZones;
        this._fetchData().catch((fetchError) => {
          console.error(
            "Failed to refresh data after delete error:",
            fetchError,
          );
        });
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleCalculateZone(index: number): void {
    const zone = this.zones[index];
    if (!zone || zone.id == undefined) {
      return;
    }
    if (!this.hass) {
      return;
    }
    //call the calculate method of the module for the zone
    // Fire-and-forget: trigger zone calculation in background
    void calculateZone(this.hass, zone.id.toString());
  }

  private handleUpdateZone(index: number): void {
    const zone = this.zones[index];
    if (!zone || zone.id == undefined) {
      return;
    }
    if (!this.hass) {
      return;
    }
    // Fire-and-forget: trigger zone update in background
    void updateZone(this.hass, zone.id.toString());
  }

  private handleViewWeatherInfo(index: number): void {
    // Use direct array access instead of Object.values() to ensure correct zone mapping
    const zone = this.zones[index];
    if (!zone || zone.mapping == undefined) {
      return;
    }

    // Toggle weather data display by updating the zone's weather visibility state
    const selector = `#weather-section-${zone.id}`;
    const weatherSection = this.shadowRoot?.querySelector(selector);

    if (weatherSection) {
      if (weatherSection.hasAttribute("hidden")) {
        weatherSection.removeAttribute("hidden");
      } else {
        weatherSection.setAttribute("hidden", "");
      }
    }
  }

  private handleViewWateringCalendar(index: number): void {
    // Use direct array access instead of Object.values() to ensure correct zone mapping
    const zone = this.zones[index];
    if (!zone || zone.id == undefined) {
      return;
    }

    // Toggle watering calendar display
    const selector = `#calendar-section-${zone.id}`;
    const calendarSection = this.shadowRoot?.querySelector(selector);

    if (calendarSection) {
      if (calendarSection.hasAttribute("hidden")) {
        calendarSection.removeAttribute("hidden");
      } else {
        calendarSection.setAttribute("hidden", "");
      }
    }
  }

  private async _fetchWeatherRecords(): Promise<void> {
    if (!this.hass) {
      return;
    }

    // Fetch weather records for each zone that has a mapping
    for (const zone of this.zones) {
      if (zone.id !== undefined && zone.mapping !== undefined) {
        try {
          const records = await fetchMappingWeatherRecords(
            this.hass,
            zone.mapping.toString(),
            10,
          );
          this.weatherRecords.set(zone.id, records);
        } catch (error) {
          console.error(
            `Failed to fetch weather records for zone ${zone.id} (mapping ${zone.mapping}):`,
            error,
          );
        }
      }
    }
    this._scheduleUpdate();
  }

  private async _fetchWateringCalendars(): Promise<void> {
    if (!this.hass) {
      return;
    }

    // Fetch watering calendar for each zone
    for (const zone of this.zones) {
      if (zone.id !== undefined) {
        try {
          const calendar = await fetchWateringCalendar(
            this.hass,
            zone.id.toString(),
          );
          this.wateringCalendars.set(zone.id, calendar);
        } catch (error) {
          console.error(
            `Failed to fetch watering calendar for zone ${zone.id}:`,
            error,
          );
        }
      }
    }
    this._scheduleUpdate();
  }

  private renderWeatherRecords(zone: SmartIrrigationZone): TemplateResult {
    if (!this.hass || typeof zone.id !== "number") {
      return html``;
    }

    const records = this.weatherRecords.get(zone.id) || [];

    return html`
      <div class="weather-records">
        <h4>
          ${localize(
            "panels.mappings.weather-records.title",
            this.hass.language,
          )}
        </h4>
        ${records.length === 0
          ? html`
              <div class="weather-note">
                ${localize(
                  "panels.mappings.weather-records.no-data",
                  this.hass.language,
                )}
              </div>
            `
          : html`
              <div class="weather-table">
                <div class="weather-header">
                  <span
                    >${localize(
                      "panels.mappings.weather-records.timestamp",
                      this.hass.language,
                    )}</span
                  >
                  <span
                    >${localize(
                      "panels.mappings.weather-records.temperature",
                      this.hass.language,
                    )}</span
                  >
                  <span
                    >${localize(
                      "panels.mappings.weather-records.humidity",
                      this.hass.language,
                    )}</span
                  >
                  <span
                    >${localize(
                      "panels.mappings.weather-records.precipitation",
                      this.hass.language,
                    )}</span
                  >
                  <span
                    >${localize(
                      "panels.mappings.weather-records.retrieval-time",
                      this.hass.language,
                    )}</span
                  >
                </div>
                ${records.slice(0, 10).map(
                  (record) => html`
                    <div class="weather-row">
                      <span
                        >${moment(record.timestamp).format("MM-DD HH:mm")}</span
                      >
                      <span
                        >${record.temperature
                          ? record.temperature.toFixed(1) + "°C"
                          : "-"}</span
                      >
                      <span
                        >${record.humidity
                          ? record.humidity.toFixed(1) + "%"
                          : "-"}</span
                      >
                      <span
                        >${record.precipitation
                          ? record.precipitation.toFixed(1) + "mm"
                          : "-"}</span
                      >
                      <span
                        >${record.retrieval_time
                          ? moment(record.retrieval_time).format("MM-DD HH:mm")
                          : "-"}</span
                      >
                    </div>
                  `,
                )}
              </div>
            `}
      </div>
    `;
  }

  private renderWateringCalendar(zone: SmartIrrigationZone): TemplateResult {
    if (!this.hass || typeof zone.id !== "number") {
      return html``;
    }
    const calendarData = this.wateringCalendars.get(zone.id);
    const zoneCalendar =
      calendarData && zone.id in calendarData ? calendarData[zone.id] : null;
    const monthlyEstimates = zoneCalendar?.monthly_estimates || [];

    return html` <div class="watering-calendar">
      <h4>Watering Calendar (12-Month Estimates)</h4>
      ${monthlyEstimates.length === 0
        ? html`
            <div class="calendar-note">
              ${zoneCalendar?.error
                ? `Error generating calendar: ${zoneCalendar.error}`
                : "No watering calendar data available for this zone"}
            </div>
          `
        : html` <div class="calendar-table">
              <div class="calendar-header">
                <span>Month</span>
                <span>ET (mm)</span>
                <span>Precipitation (mm)</span>
                <span>Watering (L)</span>
                <span>Avg Temp (°C)</span>
              </div>
              ${monthlyEstimates.map(
                (estimate) => html`
                  <div class="calendar-row">
                    <span
                      >${estimate.month_name ||
                      `Month ${estimate.month}` ||
                      "-"}</span
                    >
                    <span
                      >${estimate.estimated_et_mm
                        ? estimate.estimated_et_mm.toFixed(1)
                        : "-"}</span
                    >
                    <span
                      >${estimate.average_precipitation_mm
                        ? estimate.average_precipitation_mm.toFixed(1)
                        : "-"}</span
                    >
                    <span
                      >${estimate.estimated_watering_volume_liters
                        ? estimate.estimated_watering_volume_liters.toFixed(0)
                        : "-"}</span
                    >
                    <span
                      >${estimate.average_temperature_c
                        ? estimate.average_temperature_c.toFixed(1)
                        : "-"}</span
                    >
                  </div>
                `,
              )}
            </div>
            ${zoneCalendar?.calculation_method
              ? html`
                  <div class="calendar-info">
                    Method: ${zoneCalendar.calculation_method}
                  </div>
                `
              : ""}`}
    </div>`;
  }

  private async saveToHA(zone: SmartIrrigationZone): Promise<void> {
    if (!this.hass) {
      throw new Error("Home Assistant connection not available");
    }
    // Save zone to HA backend with proper error handling
    await saveZone(this.hass, zone);
  }

  private handleZoneFormFocus(): void {
    // User started interacting with zone creation form
    this.isCreatingZone = true;
  }

  private handleZoneFormBlur(): void {
    // Check if any form field has content
    const hasContent =
      this.nameInput?.value?.trim() ||
      this.sizeInput?.value ||
      this.throughputInput?.value;

    // Only clear the flag if all fields are empty
    if (!hasContent) {
      this.isCreatingZone = false;
    }
  }

  private renderTheOptions(thelist: object, selected?: number): TemplateResult {
    if (!this.hass) {
      return html``;
    } else {
      let r = html`<option value="" ?selected=${
        selected === undefined
      }">---${localize(
        "common.labels.select",
        this.hass.language,
      )}---</option>`;
      Object.entries(thelist).map(
        ([key, value]) =>
          /*html`<option value="${value["id"]}" ?selected="${
          zone.module === value["id"]
        }>
          ${value["id"]}: ${value["name"]}
        </option>`*/
          (r = html`${r}
            <option
              value="${value["id"]}"
              ?selected="${selected === value["id"]}"
            >
              ${value["id"]}: ${value["name"]}
            </option>`),
      );
      return r;
    }
  }

  private renderZone(zone: SmartIrrigationZone, index: number): TemplateResult {
    if (!this.hass) {
      return html``;
    }
    const lang = this.hass.language;
    const isAutomatic = zone.state === SmartIrrigationZoneState.Automatic;
    const durationReadonly =
      zone.state === SmartIrrigationZoneState.Disabled ||
      zone.state === SmartIrrigationZoneState.Automatic;
    const hasExplanation =
      zone.explanation != null && zone.explanation.length > 0;

    // keep data-point count in sync from the linked mapping
    if (zone.mapping != undefined) {
      const the_mapping = this.mappings.filter((o) => o.id === zone.mapping)[0];
      if (the_mapping != undefined && the_mapping.data != undefined) {
        zone.number_of_data_points = the_mapping.data.length;
      }
    }

    const stateLabel = localize(
      "panels.zones.labels.states." + zone.state,
      lang,
    );
    const durationText = `${Math.round(
      Number(zone.duration) || 0,
    )} ${UNIT_SECONDS}`;

    const expanded = zone.id != undefined && this._expanded.has(zone.id);

    return html`
      <ha-card class="zone-card">
        <div
          class="zone-head"
          role="button"
          tabindex="0"
          aria-expanded=${expanded ? "true" : "false"}
          @click=${() => this._toggleZone(zone.id)}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              this._toggleZone(zone.id);
            }
          }}
        >
          <div class="zone-head-text">
            <div class="zone-title-row">
              <span class="zone-title">${zone.name || "—"}</span>
              <ha-label class="state-label state-label--${zone.state}" dense
                >${stateLabel}</ha-label
              >
            </div>
            <div class="zone-sub">${durationText}</div>
          </div>
          <ha-svg-icon
            class="zone-chevron ${expanded ? "open" : ""}"
            .path=${mdiChevronDown}
          ></ha-svg-icon>
        </div>
        ${expanded
          ? html` <div class="zone-body">
              <div class="zone-meta">
                <div class="meta-item">
                  <span class="meta-label"
                    >${localize(
                      "panels.zones.labels.last_calculated",
                      lang,
                    )}</span
                  >
                  <span class="meta-value"
                    >${zone.last_calculated
                      ? moment(zone.last_calculated).format("YYYY-MM-DD HH:mm")
                      : "—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${localize(
                      "panels.zones.labels.data-last-updated",
                      lang,
                    )}</span
                  >
                  <span class="meta-value"
                    >${zone.last_updated
                      ? moment(zone.last_updated).format("YYYY-MM-DD HH:mm")
                      : "—"}</span
                  >
                </div>
                <div class="meta-item">
                  <span class="meta-label"
                    >${localize(
                      "panels.zones.labels.data-number-of-data-points",
                      lang,
                    )}</span
                  >
                  <span class="meta-value"
                    >${zone.number_of_data_points ?? "—"}</span
                  >
                </div>
              </div>

              <div class="settings">
                ${this._textRow(
                  localize("panels.zones.labels.name", lang),
                  "",
                  zone.name,
                  (v) =>
                    this.handleEditZone(index, { ...zone, [ZONE_NAME]: v }),
                )}
                ${this._numRow(
                  localize("panels.zones.labels.size", lang),
                  output_unit(this.config, ZONE_SIZE),
                  zone.size,
                  (v) =>
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_SIZE]: parseFloat(v),
                    }),
                  0.1,
                )}
                ${this._numRow(
                  localize("panels.zones.labels.throughput", lang),
                  output_unit(this.config, ZONE_THROUGHPUT),
                  zone.throughput,
                  (v) =>
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_THROUGHPUT]: parseFloat(v),
                    }),
                  0.1,
                )}
                ${this._numRow(
                  localize("panels.zones.labels.drainage_rate", lang),
                  output_unit(this.config, ZONE_DRAINAGE_RATE),
                  zone.drainage_rate,
                  (v) =>
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_DRAINAGE_RATE]: parseFloat(v),
                    }),
                  0.1,
                )}
                ${this._selectRow(
                  localize("panels.zones.labels.state", lang),
                  html`
                    <option
                      value="${SmartIrrigationZoneState.Automatic}"
                      ?selected=${zone.state ===
                      SmartIrrigationZoneState.Automatic}
                    >
                      ${localize("panels.zones.labels.states.automatic", lang)}
                    </option>
                    <option
                      value="${SmartIrrigationZoneState.Disabled}"
                      ?selected=${zone.state ===
                      SmartIrrigationZoneState.Disabled}
                    >
                      ${localize("panels.zones.labels.states.disabled", lang)}
                    </option>
                    <option
                      value="${SmartIrrigationZoneState.Manual}"
                      ?selected=${zone.state ===
                      SmartIrrigationZoneState.Manual}
                    >
                      ${localize("panels.zones.labels.states.manual", lang)}
                    </option>
                  `,
                  (e: Event) =>
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_STATE]: (e.target as HTMLSelectElement)
                        .value as SmartIrrigationZoneState,
                      [ZONE_DURATION]: 0,
                    }),
                )}
                ${this._selectRow(
                  localize("common.labels.module", lang),
                  this.renderTheOptions(this.modules, zone.module),
                  (e: Event) => {
                    const v = (e.target as HTMLSelectElement).value;
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_MODULE]: v === "" ? undefined : parseInt(v),
                    });
                  },
                )}
                ${this._selectRow(
                  localize("panels.zones.labels.mapping", lang),
                  this.renderTheOptions(this.mappings, zone.mapping),
                  (e: Event) => {
                    const v = (e.target as HTMLSelectElement).value;
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_MAPPING]: v === "" ? undefined : parseInt(v),
                    });
                  },
                )}
                ${this._numRow(
                  localize("panels.zones.labels.bucket", lang),
                  output_unit(this.config, ZONE_BUCKET),
                  Number(zone.bucket).toFixed(1),
                  (v) =>
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_BUCKET]: parseFloat(v),
                    }),
                  0.1,
                )}
                ${this._numRow(
                  localize("panels.zones.labels.maximum-bucket", lang),
                  output_unit(this.config, ZONE_BUCKET),
                  Number(zone.maximum_bucket).toFixed(1),
                  (v) =>
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_MAXIMUM_BUCKET]: parseFloat(v),
                    }),
                  0.1,
                )}
                ${this.config?.observed_watering_enabled
                  ? this._entityRow(
                      localize("panels.zones.labels.linked-entity", lang),
                      localize("panels.zones.labels.optional", lang),
                      zone.linked_entity,
                      ["switch", "valve", "input_boolean", "binary_sensor"],
                      (v) =>
                        this.handleEditZone(index, {
                          ...zone,
                          [ZONE_LINKED_ENTITY]: v || undefined,
                        }),
                      localize("panels.zones.labels.linked-entity-hint", lang),
                    )
                  : ""}
                ${this.config?.observed_watering_enabled && zone.linked_entity
                  ? this._entityRow(
                      localize("panels.zones.labels.flow-sensor", lang),
                      localize("panels.zones.labels.optional", lang),
                      zone.flow_sensor,
                      ["sensor"],
                      (v) =>
                        this.handleEditZone(index, {
                          ...zone,
                          [ZONE_FLOW_SENSOR]: v || undefined,
                        }),
                      localize("panels.zones.labels.flow-sensor-hint", lang),
                    )
                  : ""}
                ${this._numRow(
                  localize("panels.zones.labels.lead-time", lang),
                  "s",
                  zone.lead_time,
                  (v) =>
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_LEAD_TIME]: parseInt(v, 10),
                    }),
                  1,
                )}
                ${this._numRow(
                  localize("panels.zones.labels.maximum-duration", lang),
                  "s",
                  zone.maximum_duration,
                  (v) =>
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_MAXIMUM_DURATION]: parseInt(v, 10),
                    }),
                  1,
                )}
                ${this._numRow(
                  localize("panels.zones.labels.multiplier", lang),
                  "",
                  zone.multiplier,
                  (v) =>
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_MULTIPLIER]: parseFloat(v),
                    }),
                  0.1,
                )}
                ${this._numRow(
                  localize("panels.zones.labels.duration", lang),
                  UNIT_SECONDS,
                  zone.duration,
                  (v) =>
                    this.handleEditZone(index, {
                      ...zone,
                      [ZONE_DURATION]: parseInt(v, 10),
                    }),
                  1,
                  durationReadonly,
                )}
              </div>

              <div class="zone-actions">
                ${isAutomatic
                  ? html`
                      ${this._actionBtn(
                        mdiCalculator,
                        localize("panels.zones.actions.calculate", lang),
                        () => this.handleCalculateZone(index),
                      )}
                      ${this._actionBtn(
                        mdiUpdate,
                        localize("panels.zones.actions.update", lang),
                        () => this.handleUpdateZone(index),
                      )}
                    `
                  : ""}
                ${this._actionBtn(
                  mdiPailRemove,
                  localize("panels.zones.actions.reset-bucket", lang),
                  () =>
                    this.handleEditZone(index, { ...zone, [ZONE_BUCKET]: 0.0 }),
                )}
                ${zone.mapping != undefined
                  ? this._actionBtn(
                      mdiCloudOutline,
                      localize("panels.zones.actions.view-weather-info", lang),
                      () => this.handleViewWeatherInfo(index),
                    )
                  : ""}
                ${this._actionBtn(
                  mdiCalendar,
                  localize("panels.zones.actions.view-watering-calendar", lang),
                  () => this.handleViewWateringCalendar(index),
                )}
                ${hasExplanation
                  ? this._actionBtn(
                      mdiInformationOutline,
                      localize("panels.zones.actions.information", lang),
                      () => this.toggleExplanation(index),
                    )
                  : ""}
                ${this._actionBtn(
                  mdiDelete,
                  localize("common.actions.delete", lang),
                  (e: Event) => this.handleRemoveZone(e, index),
                  true,
                )}
              </div>

              ${hasExplanation
                ? html`<label class="hidden" id="calcresults${index}"
                    >${unsafeHTML("<br/>" + zone.explanation)}</label
                  >`
                : ""}
              <div id="calendar-section-${zone.id}" hidden>
                ${this.renderWateringCalendar(zone)}
              </div>
              <div id="weather-section-${zone.id}" hidden>
                ${this.renderWeatherRecords(zone)}
              </div>
            </div>`
          : ""}
      </ha-card>
    `;
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

  private _entityRow(
    label: string,
    unit: string,
    value: string | undefined,
    includeDomains: string[],
    onCommit: (v: string) => void,
    hint?: string,
  ): TemplateResult {
    return html`
      <div class="setting-row">
        <div class="setting-label">
          ${label}${unit ? html` <span class="unit">(${unit})</span>` : ""}
          ${hint ? html`<div class="setting-hint">${hint}</div>` : ""}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${value || ""}
          .includeDomains=${includeDomains}
          allow-custom-entity
          @value-changed=${(e: CustomEvent) => onCommit(e.detail?.value || "")}
        ></ha-entity-picker>
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

  toggleExplanation(index: number) {
    const el = this.shadowRoot?.querySelector("#calcresults" + index);
    //const bt = this.shadowRoot?.querySelector("#showcalcresults" + index);
    //if (!el || !bt) {
    if (!el) {
      return;
    } else {
      if (el.className != "hidden") {
        el.className = "hidden";
        //bt.textContent = "Show calculation explanation";
      } else {
        el.className = "explanation";
        //bt.textContent = "Hide explanation";
      }
    }
  }

  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    if (this.isLoading) {
      return html`
        <ha-card header="${localize("panels.zones.title", this.hass.language)}">
          <div class="card-content">
            ${localize(
              "common.loading-messages.general",
              this.hass.language,
            )}...
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${localize("panels.zones.title", this.hass.language)}">
        <div class="card-content">
          ${localize("panels.zones.description", this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${localize(
          "panels.zones.cards.add-zone.header",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize("panels.zones.labels.name", this.hass.language)}
            </div>
            <input
              id="nameInput"
              class="field"
              type="text"
              @focus="${this.handleZoneFormFocus}"
              @blur="${this.handleZoneFormBlur}"
            />
          </div>
          <div class="setting-row">
            <div class="setting-label">
              ${localize("panels.zones.labels.size", this.hass.language)}
              <span class="unit">(${output_unit(this.config, ZONE_SIZE)})</span>
            </div>
            <input
              id="sizeInput"
              class="field"
              type="number"
              @focus="${this.handleZoneFormFocus}"
              @blur="${this.handleZoneFormBlur}"
            />
          </div>
          <div class="setting-row">
            <div class="setting-label">
              ${localize("panels.zones.labels.throughput", this.hass.language)}
              <span class="unit"
                >(${output_unit(this.config, ZONE_THROUGHPUT)})</span
              >
            </div>
            <input
              id="throughputInput"
              class="field"
              type="number"
              @focus="${this.handleZoneFormFocus}"
              @blur="${this.handleZoneFormBlur}"
            />
          </div>
          <div class="add-zone-actions">
            <ha-button
              appearance="filled"
              @click="${this.handleAddZone}"
              ?disabled="${this.isSaving}"
            >
              <ha-svg-icon slot="start" .path=${mdiPlus}></ha-svg-icon>
              ${this.isSaving
                ? localize("common.saving-messages.adding", this.hass.language)
                : localize(
                    "panels.zones.cards.add-zone.actions.add",
                    this.hass.language,
                  )}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${repeat(
        this.zones,
        (zone) => zone.id ?? zone.name,
        (zone, index) => this.renderZone(zone, index),
      )}

      <ha-card
        header="${localize(
          "panels.zones.cards.zone-actions.header",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          <div class="zone-actions-grid">
            ${this._actionBtn(
              mdiCalculator,
              localize(
                "panels.zones.cards.zone-actions.actions.calculate-all",
                this.hass.language,
              ),
              () => this.handleCalculateAllZones(),
              false,
              this.isSaving,
            )}
            ${this._actionBtn(
              mdiUpdate,
              localize(
                "panels.zones.cards.zone-actions.actions.update-all",
                this.hass.language,
              ),
              () => this.handleUpdateAllZones(),
              false,
              this.isSaving,
            )}
            ${this._actionBtn(
              mdiPailRemove,
              localize(
                "panels.zones.cards.zone-actions.actions.reset-all-buckets",
                this.hass.language,
              ),
              () => this.handleResetAllBuckets(),
              false,
              this.isSaving,
            )}
            ${this._actionBtn(
              mdiCloudOutline,
              localize(
                "panels.zones.cards.zone-actions.actions.clear-all-weatherdata",
                this.hass.language,
              ),
              () => this.handleClearAllWeatherdata(),
              false,
              this.isSaving,
            )}
          </div>
        </div>
      </ha-card>
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up global debounce timer
    if (this.globalDebounceTimer) {
      clearTimeout(this.globalDebounceTimer);
      this.globalDebounceTimer = null;
    }

    // Clear the zone cache
    this.zoneCache.clear();
    // Clear zone creation state when component is disconnected
    this.isCreatingZone = false;
  }

  /*
  ${Object.entries(this.zones).map(([key, value]) =>
            this.renderZone(value, value["id"])
          )}
          */

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle}

      /* --- Modern zone cards (HA-native look) --- */
      /* own collapsible: a plain ha-card (white surface like every HA card)
         with a clickable header — no mystery hover/focus tints */
      .zone-card {
        overflow: hidden;
      }
      .zone-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        cursor: pointer;
        user-select: none;
      }
      .zone-head:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }
      .zone-head-text {
        flex: 1 1 auto;
        min-width: 0;
      }
      .zone-title-row {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .zone-title {
        font-size: 1.15rem;
        font-weight: 500;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 0 1 auto;
        min-width: 0;
      }
      /* native HA state pill (ha-label), tinted by zone state */
      ha-label.state-label {
        flex: 0 0 auto;
        --ha-label-background-color: rgba(
          var(--rgb-disabled-text-color, 120, 120, 120),
          0.15
        );
      }
      ha-label.state-label--automatic {
        --ha-label-background-color: rgba(
          var(--rgb-success-color, 67, 160, 71),
          0.18
        );
      }
      ha-label.state-label--manual {
        --ha-label-background-color: rgba(
          var(--rgb-warning-color, 255, 166, 0),
          0.22
        );
      }
      .zone-sub {
        font-size: 0.85em;
        color: var(--secondary-text-color);
      }
      .zone-chevron {
        flex: 0 0 auto;
        color: var(--secondary-text-color);
        transition: transform 0.2s ease;
      }
      .zone-chevron.open {
        transform: rotate(180deg);
      }

      .zone-body {
        padding: 12px 16px 16px;
        border-top: 1px solid var(--divider-color);
      }

      .zone-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 28px;
        padding: 4px 0 12px;
      }
      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .meta-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--secondary-text-color);
      }
      .meta-value {
        color: var(--primary-text-color);
        font-weight: 500;
      }

      .settings {
        display: flex;
        flex-direction: column;
      }
      .setting-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 52px;
        padding: 4px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .setting-row:last-child {
        border-bottom: 0;
      }
      .setting-label {
        color: var(--primary-text-color);
        font-weight: 500;
      }
      .setting-label .unit {
        color: var(--secondary-text-color);
        font-weight: 400;
        font-size: 0.85em;
      }
      /* one unified field style for BOTH inputs and selects, themed with the
         same MDC variables HA's own ha-textfield/ha-select use (native feel) */
      .setting-hint {
        font-size: 0.8rem;
        font-weight: normal;
        color: var(--secondary-text-color);
        margin-top: 2px;
        max-width: 460px;
      }
      /* HA entity picker: sized like the other controls, but it brings its own
         input chrome, so it must NOT get the .field text-input background. */
      .entity-field {
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
      }
      .field {
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
        height: 44px;
        box-sizing: border-box;
        padding: 0 12px;
        border: none;
        border-bottom: 1px solid
          var(--mdc-text-field-idle-line-color, rgba(0, 0, 0, 0.42));
        border-radius: 4px 4px 0 0;
        background: var(
          --mdc-text-field-fill-color,
          var(--input-fill-color, rgba(0, 0, 0, 0.04))
        );
        color: var(--primary-text-color);
        font-size: 1rem;
        font-family: var(--paper-font-body1_-_font-family, inherit);
        line-height: normal;
        transition:
          border-color 0.15s,
          background 0.15s;
      }
      .field:hover {
        border-bottom-color: var(
          --mdc-text-field-hover-line-color,
          var(--primary-text-color)
        );
      }
      .field:focus {
        outline: none;
        border-bottom: 2px solid var(--mdc-theme-primary, var(--primary-color));
      }
      input.field[readonly] {
        opacity: 0.55;
        cursor: not-allowed;
      }
      /* keep native up/down spinners (they respect the per-field step) */
      /* number field with clean HA +/- steppers */
      .num-field {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
      }
      .num-field .num-input {
        flex: 1 1 auto;
        width: auto;
        min-width: 0;
        max-width: none;
        /* text on the left, like the fields without steppers */
        text-align: left;
      }
      .num-field .step-btn {
        display: none;
      }
      /* native select wrapped so we can draw a themed chevron */
      .select-wrap {
        position: relative;
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
        display: inline-flex;
      }
      .select-wrap .field {
        width: 100%;
        max-width: 100%;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        padding-right: 36px;
        cursor: pointer;
      }
      .select-wrap .chev {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        pointer-events: none;
        fill: var(--secondary-text-color);
      }

      .zone-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      .zone-actions-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .add-zone-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
      }
      /* native ha-button: appearance/variant handle the colors. 2-col grid,
         full-width cells, content left-aligned so the icon stays fixed left. */
      .zone-actions ha-button,
      .zone-actions-grid ha-button {
        width: 100%;
      }
      .zone-actions ha-button::part(base),
      .zone-actions-grid ha-button::part(base) {
        justify-content: flex-start;
      }
      .zone-actions ha-button::part(label),
      .zone-actions-grid ha-button::part(label) {
        text-align: left;
      }
      .zone-actions ha-button ha-svg-icon,
      .zone-actions-grid ha-button ha-svg-icon,
      .add-zone-actions ha-button ha-svg-icon {
        --mdc-icon-size: 18px;
      }
      @media (max-width: 600px) {
        .zone-actions,
        .zone-actions-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 600px) {
        .setting-row {
          flex-direction: column;
          align-items: stretch;
          gap: 6px;
        }
        .field,
        .select-wrap,
        .num-field {
          width: 100%;
          max-width: 100%;
        }
      }
    `;
  }
}
