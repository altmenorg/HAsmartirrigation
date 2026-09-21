import { TemplateResult, LitElement, html, css, CSSResultGroup } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { query } from "lit/decorators.js";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { loadHaForm } from "../../load-ha-elements";
import { UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  deleteMapping,
  fetchConfig,
  fetchMappings,
  fetchModules,
  saveMapping,
  fetchZones,
  fetchMappingWeatherRecords,
} from "../../data/websockets";
import { SubscribeMixin } from "../../subscribe-mixin";

import {
  SmartIrrigationConfig,
  SmartIrrigationZone,
  SmartIrrigationMapping,
  SmartIrrigationModule,
  WeatherRecord,
} from "../../types";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { localize } from "../../../localize/localize";
import {
  DOMAIN,
  MAPPING_CONF_AGGREGATE,
  MAPPING_MODULE,
  MAPPING_CONF_AGGREGATE_OPTIONS,
  MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT,
  //removing this as part of beta12. Temperature is the only thing we want to take and we will apply min and max aggregation on our own.
  //MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_MAX_TEMP,
  //MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_MIN_TEMP,
  MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION,
  MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_CURRENT_PRECIPITATION,
  MAPPING_CONF_SENSOR,
  MAPPING_CONF_SOURCE,
  MAPPING_CONF_SOURCE_NONE,
  MAPPING_CONF_SOURCE_WEATHER_SERVICE,
  MAPPING_CONF_SOURCE_SENSOR,
  MAPPING_CONF_SOURCE_STATIC_VALUE,
  MAPPING_CONF_SOURCE_ILLUMINANCE,
  MAPPING_CONF_LUMINOUS_EFFICACY,
  MAPPING_CONF_STATIC_VALUE,
  MAPPING_CONF_UNIT,
  MAPPING_DEWPOINT,
  MAPPING_EVAPOTRANSPIRATION,
  MAPPING_HUMIDITY,
  //removing this as part of beta12. Temperature is the only thing we want to take and we will apply min and max aggregation on our own.
  //MAPPING_MAX_TEMP,
  //MAPPING_MIN_TEMP,
  MAPPING_PRECIPITATION,
  MAPPING_PRESSURE,
  MAPPING_SOLRAD,
  WEATHER_SERVICE_OPEN_METEO,
  MAPPING_TEMPERATURE,
  MAPPING_WINDSPEED,
  MAPPING_CONF_PRESSURE_TYPE,
  MAPPING_CONF_PRESSURE_ABSOLUTE,
  MAPPING_CONF_PRESSURE_RELATIVE,
  MAPPING_CURRENT_PRECIPITATION,
} from "../../const";
import {
  engineModeLabel,
  getOptionsForMappingType,
  handleError,
} from "../../helpers";
import {
  mdiConsoleNetworkOutline,
  mdiDelete,
  mdiChevronDown,
  mdiMenuDown,
  mdiPlus,
  mdiMinus,
} from "@mdi/js";
import moment from "moment";

@customElement("smart-irrigation-view-mappings")
class SmartIrrigationViewMappings extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() config?: SmartIrrigationConfig;

  @property({ type: Array })
  private zones: SmartIrrigationZone[] = [];
  @property({ type: Array })
  private mappings: SmartIrrigationMapping[] = [];

  @property({ type: Map })
  private weatherRecords = new Map<number, WeatherRecord[]>();

  @property({ type: Boolean })
  private isLoading = true;

  @property({ type: Boolean })
  private isSaving = false;

  // True once the first data load has completed. Avoids tearing the whole view
  // down to a "loading" card on every background refresh (focus/scroll loss).
  private _hasLoadedOnce = false;

  // Set just before an inline-edit save to ignore the _config_updated echo our
  // own write triggers. External changes still refresh normally.
  private _suppressNextConfigUpdate = false;

  private debounceTimers = new Map<number, number>();
  private globalDebounceTimer: number | null = null;

  // Cache for rendered mapping cards to avoid re-rendering unchanged ones
  private mappingCache = new Map<string, TemplateResult>();

  // Prevent excessive re-renders
  private _updateScheduled = false;
  private _scheduleUpdate() {
    if (this._updateScheduled) return;

    // Throttle updates to prevent browser throttling warnings
    const now = performance.now();
    const timeSinceLastUpdate = now - this._lastUpdateTime;

    if (timeSinceLastUpdate < this._updateThrottleDelay) {
      // Too soon, schedule for later
      setTimeout(() => {
        this._updateScheduled = false;
        this._lastUpdateTime = performance.now();
        this.requestUpdate();
      }, this._updateThrottleDelay - timeSinceLastUpdate);
    } else {
      // Can update immediately
      this._updateScheduled = true;
      requestAnimationFrame(() => {
        this._updateScheduled = false;
        this._lastUpdateTime = performance.now();
        this.requestUpdate();
      });
    }
  }

  // Track DOM update frequency to prevent excessive updates
  private _lastUpdateTime = 0;
  private _updateThrottleDelay = 16; // ~60fps limit

  // Which mapping cards are expanded (own collapsible — full control over styling)
  private _expanded: Set<number> = new Set();
  private _toggleItem(id?: number): void {
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

  //@property({ type: Array })
  @property({ type: Array })
  private modules: SmartIrrigationModule[] = [];

  //private allmodules: SmartIrrigationModule[] = [];

  @query("#mappingNameInput")
  private mappingNameInput!: HTMLInputElement;

  firstUpdated() {
    void loadHaForm().catch((error) => {
      console.error("Failed to load HA form:", error);
    });
  }

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

    try {
      // Only show the full-screen loading card on the very first load.
      // Background refreshes must not unmount the view (focus/scroll loss).
      if (!this._hasLoadedOnce) {
        this.isLoading = true;
      }

      // Fetch all data concurrently to reduce total wait time
      const [config, zones, mappings, modules] = await Promise.all([
        fetchConfig(this.hass),
        fetchZones(this.hass),
        fetchMappings(this.hass),
        fetchModules(this.hass),
      ]);

      this.config = config;
      this.zones = zones;
      this.mappings = mappings;
      this.modules = modules;

      // Fetch weather records for each mapping
      this._fetchWeatherRecords();

      // Clear the cache when new data is loaded
      this.mappingCache.clear();
    } catch (error) {
      console.error("Error fetching data:", error);
      // Optionally show user-friendly error message
      handleError(
        {
          body: { message: "Failed to load mapping data" },
          error: "Data fetch error",
        },
        this.shadowRoot?.querySelector("ha-card") as HTMLElement,
      );
    } finally {
      this.isLoading = false;
      this._hasLoadedOnce = true;
      // Trigger a re-render to ensure UI updates
      this._scheduleUpdate();
    }
  }

  private async _fetchWeatherRecords(): Promise<void> {
    if (!this.hass) {
      return;
    }

    // Fetch weather records for each mapping
    for (const mapping of this.mappings) {
      if (mapping.id !== undefined) {
        try {
          const records = await fetchMappingWeatherRecords(
            this.hass,
            mapping.id.toString(),
            10,
          );
          this.weatherRecords.set(mapping.id, records);
        } catch (error) {
          console.error(
            `Failed to fetch weather records for mapping ${mapping.id}:`,
            error,
          );
          // Set empty array on error to ensure the UI doesn't break
          this.weatherRecords.set(mapping.id, []);
        }
      }
    }
    this._scheduleUpdate();
  }

  private renderWeatherRecords(
    mapping: SmartIrrigationMapping,
  ): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    const records =
      mapping.id !== undefined ? this.weatherRecords.get(mapping.id) || [] : [];
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
                ${records.slice(0, 10).map((record) => {
                  // Safely format timestamps with error handling
                  let timestampFormatted = "-";
                  let retrievalTimeFormatted = "-";

                  try {
                    if (record.timestamp && record.timestamp !== null) {
                      const timestampMoment = moment(record.timestamp);
                      if (timestampMoment.isValid()) {
                        timestampFormatted =
                          timestampMoment.format("MM-DD HH:mm");
                      }
                    }
                  } catch (error) {
                    console.warn(
                      "Error formatting timestamp:",
                      record.timestamp,
                      error,
                    );
                  }

                  try {
                    if (
                      record.retrieval_time &&
                      record.retrieval_time !== null
                    ) {
                      const retrievalMoment = moment(record.retrieval_time);
                      if (retrievalMoment.isValid()) {
                        retrievalTimeFormatted =
                          retrievalMoment.format("MM-DD HH:mm");
                      }
                    }
                  } catch (error) {
                    console.warn(
                      "Error formatting retrieval_time:",
                      record.retrieval_time,
                      error,
                    );
                  }

                  return html`
                    <div class="weather-row">
                      <span>${timestampFormatted}</span>
                      <span
                        >${record.temperature !== null &&
                        record.temperature !== undefined
                          ? record.temperature.toFixed(1) + "°C"
                          : "-"}</span
                      >
                      <span
                        >${record.humidity !== null &&
                        record.humidity !== undefined
                          ? record.humidity.toFixed(1) + "%"
                          : "-"}</span
                      >
                      <span
                        >${record.precipitation !== null &&
                        record.precipitation !== undefined
                          ? record.precipitation.toFixed(1) + "mm"
                          : "-"}</span
                      >
                      <span>${retrievalTimeFormatted}</span>
                    </div>
                  `;
                })}
              </div>
            `}
      </div>
    `;
  }

  private handleAddMapping(): void {
    if (!this.mappingNameInput.value.trim()) {
      return; // Don't add empty mappings
    }

    // A new group has to carry a real source per field: the dropdown below
    // shows "weather service" as its first option, so a group stored without
    // any source looks configured while nothing is ever fetched for it.
    const useWeatherService = !!this.config?.use_weather_service;
    const defaultSource = (name: string) => {
      // Evapotranspiration and solar radiation are not delivered by the
      // configured weather service directly.
      if (
        name === MAPPING_EVAPOTRANSPIRATION ||
        name === MAPPING_SOLRAD ||
        name === MAPPING_PRECIPITATION
      ) {
        return useWeatherService
          ? MAPPING_CONF_SOURCE_NONE
          : MAPPING_CONF_SOURCE_SENSOR;
      }
      return useWeatherService
        ? MAPPING_CONF_SOURCE_WEATHER_SERVICE
        : MAPPING_CONF_SOURCE_SENSOR;
    };
    const the_mappings = Object.fromEntries(
      [
        MAPPING_DEWPOINT,
        MAPPING_EVAPOTRANSPIRATION,
        MAPPING_HUMIDITY,
        //removing this as part of beta12. Temperature is the only thing we want to take and we will apply min and max aggregation on our own.
        //MAPPING_MAX_TEMP,
        //MAPPING_MIN_TEMP,
        MAPPING_PRECIPITATION,
        MAPPING_CURRENT_PRECIPITATION,
        MAPPING_PRESSURE,
        MAPPING_SOLRAD,
        MAPPING_TEMPERATURE,
        MAPPING_WINDSPEED,
      ].map((name) => [
        name,
        {
          [MAPPING_CONF_SOURCE]: defaultSource(name),
          [MAPPING_CONF_SENSOR]: "",
          [MAPPING_CONF_UNIT]: "",
        },
      ]),
    );
    const newMapping: SmartIrrigationMapping = {
      //id: this.mappings.length + 1,
      name: this.mappingNameInput.value.trim(),
      mappings: the_mappings,
    };

    // Optimistically update the UI
    this.mappings = [...this.mappings, newMapping];
    this.isSaving = true;

    // Save mapping with proper error handling
    this.saveToHA(newMapping)
      .then(() => {
        // Clear the input field on successful save
        this.mappingNameInput.value = "";
        // Refresh data to get the server-assigned ID
        return this._fetchData();
      })
      .catch((error) => {
        console.error("Failed to add mapping:", error);
        // Revert optimistic update on error
        this.mappings = this.mappings.slice(0, -1);
      })
      .finally(() => {
        this.isSaving = false;
        this._scheduleUpdate();
      });
  }

  private handleRemoveMapping(ev: Event, index: number): void {
    //get the mapping id for the mapping at this index
    const mappingid = this.mappings[index].id;
    if (mappingid == undefined) {
      return;
    }

    // Store original for potential rollback
    const originalMappings = [...this.mappings];

    // Optimistically update UI
    this.mappings = this.mappings.filter((_, i) => i !== index);

    // Clear cache for this mapping
    this.mappingCache.delete(mappingid.toString());

    if (!this.hass) {
      return;
    }

    this.isSaving = true;

    // Delete mapping from HA with proper error handling
    deleteMapping(this.hass, mappingid.toString())
      .catch((error) => {
        console.error("Failed to delete mapping:", error);
        // Revert the local change if deletion failed
        this.mappings = originalMappings;
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

  private handleEditMapping(
    index: number,
    updatedMapping: SmartIrrigationMapping,
  ): void {
    // Use direct array assignment instead of Object.values().map()
    this.mappings[index] = updatedMapping;

    // Invalidate cache for this mapping only
    if (updatedMapping.id) {
      this.mappingCache.delete(updatedMapping.id.toString());
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
      this.saveToHA(updatedMapping)
        .catch((error) => {
          // Save failed: clear the guard so it doesn't swallow a later refresh.
          this._suppressNextConfigUpdate = false;
          console.error("Failed to save mapping:", error);
        })
        .finally(() => {
          this.isSaving = false;
          this._scheduleUpdate();
        });
      this.globalDebounceTimer = null;
    }, 500); // Increased debounce time to reduce backend load

    // Trigger minimal re-render
    this._scheduleUpdate();
  }
  private async saveToHA(mapping: SmartIrrigationMapping): Promise<void> {
    if (!this.hass) {
      throw new Error("Home Assistant connection not available");
    }

    // Batch validate all sensor entities at once to reduce DOM queries
    const invalidSensors: string[] = [];
    const hassStates = this.hass.states;

    for (const m in mapping.mappings) {
      const sensorEntity = mapping.mappings[m].sensorentity;
      if (sensorEntity && sensorEntity.trim() !== "") {
        const trimmedEntity = sensorEntity.trim();
        mapping.mappings[m].sensorentity = trimmedEntity;

        if (!(trimmedEntity in hassStates)) {
          invalidSensors.push(trimmedEntity);
        }
      }
    }

    if (invalidSensors.length > 0) {
      const errorElement = this.shadowRoot?.querySelector(
        "ha-card",
      ) as HTMLElement;
      if (errorElement) {
        handleError(
          {
            body: {
              message:
                localize(
                  "panels.mappings.cards.mapping.errors.source_does_not_exist",
                  this.hass.language,
                ) +
                ": " +
                invalidSensors.join(", "),
            },
            error: localize(
              "panels.mappings.cards.mapping.errors.invalid_source",
              this.hass.language,
            ),
          },
          errorElement,
        );
      }
      throw new Error("Invalid sensor entities found");
    }

    // Save mapping to HA backend. Only send fields that are editable from
    // the UI — ``data``, ``data_last_updated``, ``data_last_entry`` and
    // ``data_last_calculation`` are server-computed and would be rejected or
    // overwrite authoritative state on the backend (issue #680).
    const { id, name, mappings } = mapping;
    await saveMapping(this.hass, { id, name, mappings });
  }
  /**
   * The sources this group's engine reads, or null when every source applies.
   *
   * The list comes from the backend, which declares it next to the engines, so
   * a source can never be hidden here while the calculation still needs it.
   */
  private consumedSources(mapping: SmartIrrigationMapping): string[] | null {
    if (mapping.module === undefined || mapping.module === null) {
      return null;
    }
    const engine = this.modules.find((m) => m.id === mapping.module);
    return engine?.consumes ?? null;
  }

  private renderMapping(
    mapping: SmartIrrigationMapping,
    index: number,
  ): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    // Use caching to avoid re-rendering unchanged mappings
    const cacheKey = `${mapping.id}_${JSON.stringify(mapping).slice(0, 100)}`;
    if (this.mappingCache.has(cacheKey)) {
      return this.mappingCache.get(cacheKey)!;
    }

    const numberofzonesusingthismapping = this.zones.filter(
      (o) => o.mapping === mapping.id,
    ).length;

    const result = html`
      <ha-card header="${mapping.id}: ${mapping.name}">
        <div class="card-content">
          <div class="card-content">
            <label for="name${mapping.id}"
              >${localize(
                "panels.mappings.labels.mapping-name",
                this.hass.language,
              )}:</label
            >
            <input
              id="name${mapping.id}"
              type="text"
              .value="${mapping.name}"
              @change="${(e: Event) =>
                this.handleEditMapping(index, {
                  ...mapping,
                  name: (e.target as HTMLInputElement).value,
                })}"
            />
            <div class="setting-row">
              <div class="setting-label">
                ${localize(
                  "panels.mappings.cards.mapping.greenhouse",
                  this.hass.language,
                )}
              </div>
              <ha-switch
                .checked=${!!mapping.greenhouse}
                @change=${(e: Event) =>
                  this.handleEditMapping(index, {
                    ...mapping,
                    greenhouse: (e.target as any).checked,
                  })}
              ></ha-switch>
            </div>
            <div class="setting-row">
              <div class="setting-label">
                ${localize(
                  "panels.mappings.cards.mapping.module",
                  this.hass.language,
                )}
              </div>
              <select
                @change=${(e: Event) => {
                  const v = (e.target as HTMLSelectElement).value;
                  this.handleEditMapping(index, {
                    ...mapping,
                    [MAPPING_MODULE]: v === "" ? undefined : parseInt(v),
                  });
                }}
              >
                <option
                  value=""
                  ?selected=${mapping.module === undefined ||
                  mapping.module === null}
                >
                  ---${localize("common.labels.select", this.hass.language)}---
                </option>
                ${this.modules.map(
                  (m) =>
                    html`<option
                      value="${m.id}"
                      ?selected=${m.id === mapping.module}
                    >
                      ${engineModeLabel(m.name, this.hass!.language)}
                    </option>`,
                )}
              </select>
            </div>
            <div class="weather-note">
              ${localize(
                mapping.module === undefined || mapping.module === null
                  ? "panels.mappings.cards.mapping.module_undecided"
                  : "panels.mappings.cards.mapping.module_description",
                this.hass.language,
              )}
            </div>
            ${mapping.greenhouse
              ? html`<div class="weather-note">
                  ${localize(
                    "panels.mappings.cards.mapping.greenhouse_description",
                    this.hass.language,
                  )}
                </div>`
              : ""}
            ${Object.entries(mapping.mappings)
              // Nothing falls on a greenhouse, so the two rain fields are not
              // just unused here, they are misleading: a rain gauge outside
              // measures water that never reaches these zones.
              .filter(
                ([value]) =>
                  !mapping.greenhouse ||
                  (value !== MAPPING_PRECIPITATION &&
                    value !== MAPPING_CURRENT_PRECIPITATION),
              )
              // Offer only what this group's engine reads. A group with no
              // engine yet keeps every source: hiding fields before the user
              // has said how the group produces its evapotranspiration would
              // be guessing on their behalf.
              .filter(([value]) => {
                const consumes = this.consumedSources(mapping);
                return consumes === null || consumes.includes(value);
              })
              .map(([value]) => this.renderMappingSetting(index, value))}
            ${numberofzonesusingthismapping
              ? html`<div class="weather-note">
                  ${localize(
                    "panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",
                    this.hass.language,
                  )}
                </div>`
              : html` <div
                  class="action-button"
                  @click="${(e: Event) => this.handleRemoveMapping(e, index)}"
                >
                  <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path fill="#404040" d="${mdiDelete}" />
                  </svg>
                  <span class="action-button-label">
                    ${localize("common.actions.delete", this.hass.language)}
                  </span>
                </div>`}
          </div>
        </div>
      </ha-card>
    `;

    // Cache the result for next render
    this.mappingCache.set(cacheKey, result);
    return result;
  }
  renderMappingSetting(index: number, value: string): TemplateResult {
    const mapping = this.mappings[index];
    if (!mapping || !this.hass) {
      return html``;
    }

    const mappingline = mapping.mappings[value];

    return html`
      <div class="si-subgroup">
        <div class="si-subgroup-title">
          ${localize(
            `panels.mappings.cards.mapping.items.${value.toLowerCase()}`,
            this.hass.language,
          )}
        </div>
        ${this._selectRow(
          localize("panels.mappings.cards.mapping.source", this.hass.language),
          this.renderSimpleRadioOptions(index, value, mappingline),
          (e: Event) => this.handleSimpleSourceChange(index, value, e),
        )}
        ${this.renderMappingInputs(index, value, mappingline)}
      </div>
    `;
  }

  private renderSimpleRadioOptions(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass || !this.config) return html``;

    const isSpecialMapping =
      value === MAPPING_EVAPOTRANSPIRATION || value === MAPPING_SOLRAD;
    const currentSource = mappingline[MAPPING_CONF_SOURCE];
    // A weather service does not supply a precipitation depth worth using: it
    // reports the rain of the last hour, a rate, which reaches the water
    // balance through Current Precipitation. The depth is for a rain gauge of
    // your own, so it can be left unset.
    const isPrecipitationDepth = value === MAPPING_PRECIPITATION;
    // Solar Radiation and Evapotranspiration can be sourced from the weather
    // service on any provider: for services that don't supply them (OWM /
    // Pirate Weather) the integration fills them from Open-Meteo.
    const offerWeatherService =
      !!this.config.use_weather_service && !isPrecipitationDepth;
    const offerNone = isSpecialMapping || isPrecipitationDepth;
    // Show "(via Open-Meteo)" when the value will actually come from the
    // Open-Meteo fallback rather than the chosen service.
    const viaOpenMeteo =
      isSpecialMapping &&
      this.config.weather_service !== WEATHER_SERVICE_OPEN_METEO;

    return html`
      ${offerWeatherService
        ? html`<option
            value="${MAPPING_CONF_SOURCE_WEATHER_SERVICE}"
            ?selected=${currentSource === MAPPING_CONF_SOURCE_WEATHER_SERVICE}
          >
            ${localize(
              "panels.mappings.cards.mapping.sources.weather_service",
              this.hass.language,
            )}${viaOpenMeteo ? " (via Open-Meteo)" : ""}
          </option>`
        : ""}
      ${offerNone
        ? html`<option
            value="${MAPPING_CONF_SOURCE_NONE}"
            ?selected=${currentSource === MAPPING_CONF_SOURCE_NONE}
          >
            ${localize(
              "panels.mappings.cards.mapping.sources.none",
              this.hass.language,
            )}
          </option>`
        : ""}
      <option
        value="${MAPPING_CONF_SOURCE_SENSOR}"
        ?selected=${currentSource === MAPPING_CONF_SOURCE_SENSOR}
      >
        ${localize(
          "panels.mappings.cards.mapping.sources.sensor",
          this.hass.language,
        )}
      </option>
      <option
        value="${MAPPING_CONF_SOURCE_STATIC_VALUE}"
        ?selected=${currentSource === MAPPING_CONF_SOURCE_STATIC_VALUE}
      >
        ${localize(
          "panels.mappings.cards.mapping.sources.static",
          this.hass.language,
        )}
      </option>
      ${value === MAPPING_SOLRAD
        ? html`<option
            value="${MAPPING_CONF_SOURCE_ILLUMINANCE}"
            ?selected=${currentSource === MAPPING_CONF_SOURCE_ILLUMINANCE}
          >
            ${localize(
              "panels.mappings.cards.mapping.sources.illuminance",
              this.hass.language,
            )}
          </option>`
        : ""}
    `;
  }

  /*private renderMappingInputsSimple(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    const source = mappingline[MAPPING_CONF_SOURCE];

    if (source === MAPPING_CONF_SOURCE_SENSOR) {
      return html`
        <div class="mappingsettingline">
          <label
            >${localize(
              "panels.mappings.cards.mapping.sensor-entity",
              this.hass.language,
            )}:</label
          >
          <input
            type="text"
            .value="${mappingline[MAPPING_CONF_SENSOR] || ""}"
            @change="${(e: Event) =>
              this.handleSimpleInputChange(
                index,
                value,
                MAPPING_CONF_SENSOR,
                e,
              )}"
          />
        </div>
      `;
    }

    if (source === MAPPING_CONF_SOURCE_STATIC_VALUE) {
      return html`
        <div class="mappingsettingline">
          <label
            >${localize(
              "panels.mappings.cards.mapping.static_value",
              this.hass.language,
            )}:</label
          >
          <input
            type="text"
            .value="${mappingline[MAPPING_CONF_STATIC_VALUE] || ""}"
            @change="${(e: Event) =>
              this.handleSimpleInputChange(
                index,
                value,
                MAPPING_CONF_STATIC_VALUE,
                e,
              )}"
          />
        </div>
      `;
    }

    return html``;
  }*/

  private handleSimpleSourceChange(
    index: number,
    value: string,
    e: Event,
  ): void {
    const mapping = this.mappings[index];
    const newSource = (e.target as HTMLInputElement).value;

    this.handleEditMapping(index, {
      ...mapping,
      mappings: {
        ...mapping.mappings,
        [value]: {
          ...mapping.mappings[value],
          [MAPPING_CONF_SOURCE]: newSource,
          [MAPPING_CONF_SENSOR]: "",
        },
      },
    });
  }

  private handleSimpleInputChange(
    index: number,
    value: string,
    configKey: string,
    e: Event,
  ): void {
    const mapping = this.mappings[index];
    const newValue = (e.target as HTMLInputElement).value;

    this.handleEditMapping(index, {
      ...mapping,
      mappings: {
        ...mapping.mappings,
        [value]: {
          ...mapping.mappings[value],
          [configKey]: newValue,
        },
      },
    });
  }

  private renderSourceOptions(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    const baseId = `${value}_${index}`;
    const isSpecialMapping =
      value === MAPPING_EVAPOTRANSPIRATION || value === MAPPING_SOLRAD;
    // SolRad/ET are sourceable from the weather service on any provider
    // (filled from Open-Meteo when the chosen service lacks them).
    const offerWeatherService = !!this.config?.use_weather_service;

    return html`
      <div class="mappingsettingline">
        <label for="${baseId}_source">
          ${localize(
            "panels.mappings.cards.mapping.source",
            this.hass.language,
          )}:
        </label>
      </div>
      <div class="radio-group">
        ${offerWeatherService
          ? this.renderWeatherServiceOption(index, value, mappingline)
          : ""}
        ${isSpecialMapping
          ? this.renderNoneOption(index, value, mappingline)
          : ""}
        ${this.renderSensorOption(index, value, mappingline)}
        ${this.renderStaticValueOption(index, value, mappingline)}
      </div>
    `;
  }

  private renderWeatherServiceOption(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass || !this.config) return html``;

    const baseId = `${value}_${index}`;
    const isDisabled = !this.config.use_weather_service;
    const isChecked =
      this.config.use_weather_service &&
      mappingline[MAPPING_CONF_SOURCE] === MAPPING_CONF_SOURCE_WEATHER_SERVICE;
    // SolRad/ET are filled from Open-Meteo when the chosen service lacks them.
    const isSpecialMapping =
      value === MAPPING_EVAPOTRANSPIRATION || value === MAPPING_SOLRAD;
    const viaOpenMeteo =
      isSpecialMapping &&
      this.config.weather_service !== WEATHER_SERVICE_OPEN_METEO;

    return html`
      <label class="${isDisabled ? "strikethrough" : ""}">
        <input
          type="radio"
          id="${baseId}_weather"
          value="${MAPPING_CONF_SOURCE_WEATHER_SERVICE}"
          name="${baseId}_source"
          ?checked="${isChecked}"
          ?disabled="${isDisabled}"
          @change="${(e: Event) => this.handleSourceChange(index, value, e)}"
        />
        ${localize(
          "panels.mappings.cards.mapping.sources.weather_service",
          this.hass.language,
        )}${viaOpenMeteo ? " (via Open-Meteo)" : ""}
      </label>
    `;
  }

  private renderNoneOption(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    const baseId = `${value}_${index}`;
    const isChecked =
      mappingline[MAPPING_CONF_SOURCE] === MAPPING_CONF_SOURCE_NONE;

    return html`
      <label>
        <input
          type="radio"
          id="${baseId}_none"
          value="${MAPPING_CONF_SOURCE_NONE}"
          name="${baseId}_source"
          ?checked="${isChecked}"
          @change="${(e: Event) => this.handleSourceChange(index, value, e)}"
        />
        ${localize(
          "panels.mappings.cards.mapping.sources.none",
          this.hass.language,
        )}
      </label>
    `;
  }

  private renderSensorOption(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    const baseId = `${value}_${index}`;
    const isChecked =
      mappingline[MAPPING_CONF_SOURCE] === MAPPING_CONF_SOURCE_SENSOR;

    return html`
      <label>
        <input
          type="radio"
          id="${baseId}_sensor"
          value="${MAPPING_CONF_SOURCE_SENSOR}"
          name="${baseId}_source"
          ?checked="${isChecked}"
          @change="${(e: Event) => this.handleSourceChange(index, value, e)}"
        />
        ${localize(
          "panels.mappings.cards.mapping.sources.sensor",
          this.hass.language,
        )}
      </label>
    `;
  }

  private renderStaticValueOption(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    const baseId = `${value}_${index}`;
    const isChecked =
      mappingline[MAPPING_CONF_SOURCE] === MAPPING_CONF_SOURCE_STATIC_VALUE;

    return html`
      <label>
        <input
          type="radio"
          id="${baseId}_static"
          value="${MAPPING_CONF_SOURCE_STATIC_VALUE}"
          name="${baseId}_source"
          ?checked="${isChecked}"
          @change="${(e: Event) => this.handleSourceChange(index, value, e)}"
        />
        ${localize(
          "panels.mappings.cards.mapping.sources.static",
          this.hass.language,
        )}
      </label>
    `;
  }

  private handleSourceChange(index: number, value: string, e: Event): void {
    const mapping = this.mappings[index];
    const newSource = (e.target as HTMLInputElement).value;

    this.handleEditMapping(index, {
      ...mapping,
      mappings: {
        ...mapping.mappings,
        [value]: {
          ...mapping.mappings[value],
          [MAPPING_CONF_SOURCE]: newSource,
          [MAPPING_CONF_SENSOR]: "", // Clear sensor when changing source
        },
      },
    });
  }

  private renderMappingInputs(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    const baseId = `${value}_${index}`;
    const source = mappingline[MAPPING_CONF_SOURCE];

    return html`
      ${source === MAPPING_CONF_SOURCE_SENSOR ||
      source === MAPPING_CONF_SOURCE_ILLUMINANCE
        ? this.renderSensorInput(index, value, mappingline)
        : ""}
      ${source === MAPPING_CONF_SOURCE_ILLUMINANCE
        ? this.renderLuminousEfficacyInput(index, value, mappingline)
        : ""}
      ${source === MAPPING_CONF_SOURCE_STATIC_VALUE
        ? this.renderStaticValueInput(index, value, mappingline)
        : ""}
      ${source === MAPPING_CONF_SOURCE_SENSOR ||
      source === MAPPING_CONF_SOURCE_STATIC_VALUE
        ? this.renderUnitSelect(index, value, mappingline)
        : ""}
      ${value === MAPPING_PRESSURE &&
      (source === MAPPING_CONF_SOURCE_SENSOR ||
        source === MAPPING_CONF_SOURCE_STATIC_VALUE)
        ? this.renderPressureTypeSelect(index, value, mappingline)
        : ""}
      ${source === MAPPING_CONF_SOURCE_SENSOR ||
      source === MAPPING_CONF_SOURCE_ILLUMINANCE
        ? this.renderAggregateSelect(index, value, mappingline)
        : ""}
    `;
  }

  private renderSensorInput(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    return html`
      <div class="setting-row">
        <div class="setting-label">
          ${localize(
            "panels.mappings.cards.mapping.sensor-entity",
            this.hass.language,
          )}
        </div>
        <ha-entity-picker
          class="entity-field"
          .hass=${this.hass}
          .value=${mappingline[MAPPING_CONF_SENSOR] || ""}
          allow-custom-entity
          @value-changed=${(e: CustomEvent) =>
            this.handleSensorChange(index, value, {
              target: { value: e.detail?.value || "" },
            } as unknown as Event)}
        ></ha-entity-picker>
      </div>
    `;
  }

  private renderLuminousEfficacyInput(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    // Daylight is around 110 lm/W, and greenhouse glazing shifts the spectrum,
    // so this is the one number worth calibrating against a known radiation
    // figure. It is not a setting most people need to touch.
    return this._numRow(
      localize(
        "panels.mappings.cards.mapping.luminous_efficacy",
        this.hass.language,
      ),
      "lm/W",
      mappingline[MAPPING_CONF_LUMINOUS_EFFICACY] ?? 110,
      (v: string) =>
        this.handleLuminousEfficacyChange(index, value, {
          target: { value: v },
        } as unknown as Event),
      1,
    );
  }

  private handleLuminousEfficacyChange(
    index: number,
    value: string,
    e: Event,
  ): void {
    const mapping = this.mappings[index];
    this.handleEditMapping(index, {
      ...mapping,
      mappings: {
        ...mapping.mappings,
        [value]: {
          ...mapping.mappings[value],
          [MAPPING_CONF_LUMINOUS_EFFICACY]: parseFloat(
            (e.target as HTMLInputElement).value,
          ),
        },
      },
    });
  }

  private renderStaticValueInput(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    // Valeur statique = mesure météo (temp, pression, humidité…) → toujours
    // numérique. On utilise _numRow (input type=number + spinner ±) comme dans
    // zones, sinon on peut taper du texte (bug). step 0.1 = décimales autorisées.
    return this._numRow(
      localize(
        "panels.mappings.cards.mapping.static_value",
        this.hass.language,
      ),
      "",
      mappingline[MAPPING_CONF_STATIC_VALUE] || "",
      (v: string) =>
        this.handleStaticValueChange(index, value, {
          target: { value: v },
        } as unknown as Event),
      0.1,
    );
  }

  private renderUnitSelect(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass || !this.config) return html``;

    return this._selectRow(
      localize("panels.mappings.cards.mapping.input-units", this.hass.language),
      this.renderUnitOptionsForMapping(value, mappingline),
      (e: Event) => this.handleUnitChange(index, value, e),
    );
  }

  private renderPressureTypeSelect(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    return this._selectRow(
      localize(
        "panels.mappings.cards.mapping.pressure-type",
        this.hass.language,
      ),
      this.renderPressureTypes(value, mappingline),
      (e: Event) => this.handlePressureTypeChange(index, value, e),
    );
  }

  private renderAggregateSelect(
    index: number,
    value: string,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass) return html``;

    // The aggregate row has explanatory copy on both sides of the select
    // ("use the … of sensor values to calculate"). Keep both labels but place
    // them inside the modern .setting-row + .select-wrap structure.
    return html`
      <div class="setting-row">
        <div class="setting-label">
          ${localize(
            "panels.mappings.cards.mapping.sensor-aggregate-use-the",
            this.hass.language,
          )}
          <span class="unit"
            >${localize(
              "panels.mappings.cards.mapping.sensor-aggregate-of-sensor-values-to-calculate",
              this.hass.language,
            )}</span
          >
        </div>
        <div class="select-wrap">
          <select
            class="field"
            @change="${(e: Event) =>
              this.handleAggregateChange(index, value, e)}"
          >
            ${this.renderAggregateOptionsForMapping(value, mappingline)}
          </select>
          <svg class="chev" viewBox="0 0 24 24">
            <path d=${mdiMenuDown}></path>
          </svg>
        </div>
      </div>
    `;
  }

  // Event handlers for the inputs
  private handleSensorChange(index: number, value: string, e: Event): void {
    const mapping = this.mappings[index];
    this.handleEditMapping(index, {
      ...mapping,
      mappings: {
        ...mapping.mappings,
        [value]: {
          ...mapping.mappings[value],
          [MAPPING_CONF_SENSOR]: (e.target as HTMLInputElement).value,
        },
      },
    });
  }

  private handleStaticValueChange(
    index: number,
    value: string,
    e: Event,
  ): void {
    const mapping = this.mappings[index];
    this.handleEditMapping(index, {
      ...mapping,
      mappings: {
        ...mapping.mappings,
        [value]: {
          ...mapping.mappings[value],
          [MAPPING_CONF_STATIC_VALUE]: (e.target as HTMLInputElement).value,
        },
      },
    });
  }

  private handleUnitChange(index: number, value: string, e: Event): void {
    const mapping = this.mappings[index];
    this.handleEditMapping(index, {
      ...mapping,
      mappings: {
        ...mapping.mappings,
        [value]: {
          ...mapping.mappings[value],
          [MAPPING_CONF_UNIT]: (e.target as HTMLSelectElement).value,
        },
      },
    });
  }

  private handlePressureTypeChange(
    index: number,
    value: string,
    e: Event,
  ): void {
    const mapping = this.mappings[index];
    this.handleEditMapping(index, {
      ...mapping,
      mappings: {
        ...mapping.mappings,
        [value]: {
          ...mapping.mappings[value],
          [MAPPING_CONF_PRESSURE_TYPE]: (e.target as HTMLSelectElement).value,
        },
      },
    });
  }

  private handleAggregateChange(index: number, value: string, e: Event): void {
    const mapping = this.mappings[index];
    this.handleEditMapping(index, {
      ...mapping,
      mappings: {
        ...mapping.mappings,
        [value]: {
          ...mapping.mappings[value],
          [MAPPING_CONF_AGGREGATE]: (e.target as HTMLSelectElement).value,
        },
      },
    });
  }

  private renderAggregateOptionsForMapping(
    value: any,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass || !this.config) {
      return html``;
    }

    let selected = MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT;
    if (value === MAPPING_PRECIPITATION) {
      selected = MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_PRECIPITATION;
    }
    if (value === MAPPING_CURRENT_PRECIPITATION) {
      selected = MAPPING_CONF_AGGREGATE_OPTIONS_DEFAULT_CURRENT_PRECIPITATION;
    }
    if (mappingline[MAPPING_CONF_AGGREGATE]) {
      selected = mappingline[MAPPING_CONF_AGGREGATE];
    }

    // Use direct template mapping for better performance
    return html`
      ${MAPPING_CONF_AGGREGATE_OPTIONS.map((a) =>
        this.renderAggregateOption(a, selected),
      )}
    `;
  }

  private renderAggregateOption(agg: any, selected: any): TemplateResult {
    if (!this.hass || !this.config) {
      return html``;
    } else {
      const label_to_use = "panels.mappings.cards.mapping.aggregates." + agg;
      return html`<option value="${agg}" ?selected="${agg === selected}">
        ${localize(label_to_use, this.hass.language)}
      </option>`;
    }
  }

  private renderPressureTypes(value: any, mappingline: any): TemplateResult {
    if (!this.hass || !this.config) {
      return html``;
    } else {
      let r = html``;
      const selected = mappingline[MAPPING_CONF_PRESSURE_TYPE];
      r = html`${r}
        <option
          value="${MAPPING_CONF_PRESSURE_ABSOLUTE}"
          ?selected="${selected === MAPPING_CONF_PRESSURE_ABSOLUTE}"
        >
          ${localize(
            "panels.mappings.cards.mapping.pressure_types." +
              MAPPING_CONF_PRESSURE_ABSOLUTE,
            this.hass.language,
          )}
        </option>
        <option
          value="${MAPPING_CONF_PRESSURE_RELATIVE}"
          ?selected="${selected === MAPPING_CONF_PRESSURE_RELATIVE}"
        >
          ${localize(
            "panels.mappings.cards.mapping.pressure_types." +
              MAPPING_CONF_PRESSURE_RELATIVE,
            this.hass.language,
          )}
        </option>`;
      return r;
    }
  }
  private renderUnitOptionsForMapping(
    value: any,
    mappingline: any,
  ): TemplateResult {
    if (!this.hass || !this.config) {
      return html``;
    }

    const theOptions = getOptionsForMappingType(value);
    let selected = mappingline[MAPPING_CONF_UNIT];
    const units = this.config.units;

    if (!mappingline[MAPPING_CONF_UNIT]) {
      // Use for...of instead of forEach for better performance
      for (const o of theOptions) {
        if (typeof o.system === "string") {
          if (units === o.system) {
            selected = o.unit;
            break;
          }
        } else {
          for (const element of o.system) {
            if (units === (element as any).system) {
              selected = o.unit;
              break;
            }
          }
          if (selected === o.unit) break;
        }
      }
    }

    // Use direct template mapping instead of forEach accumulation
    return html`
      ${theOptions.map(
        (o) => html`
          <option value="${o.unit}" ?selected="${selected === o.unit}">
            ${o.unit}
          </option>
        `,
      )}
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

  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    if (this.isLoading) {
      return html`
        <ha-card
          header="${localize("panels.mappings.title", this.hass.language)}"
        >
          <div class="card-content">
            ${localize("common.loading-messages.general", this.hass.language)}
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card
        header="${localize("panels.mappings.title", this.hass.language)}"
      >
        <div class="card-content">
          ${localize("panels.mappings.description", this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${localize(
          "panels.mappings.cards.add-mapping.header",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          <div class="setting-row">
            <div class="setting-label">
              ${localize(
                "panels.mappings.labels.mapping-name",
                this.hass.language,
              )}
            </div>
            <input id="mappingNameInput" class="field" type="text" />
          </div>
          <div class="si-form-actions">
            <ha-button
              appearance="filled"
              @click="${this.handleAddMapping}"
              ?disabled="${this.isSaving}"
            >
              <ha-svg-icon slot="start" .path=${mdiPlus}></ha-svg-icon>
              ${this.isSaving
                ? localize("common.saving-messages.adding", this.hass.language)
                : localize(
                    "panels.mappings.cards.add-mapping.actions.add",
                    this.hass.language,
                  )}
            </ha-button>
          </div>
        </div>
      </ha-card>

      ${this.renderMappingsList()}
    `;
  }

  private renderMappingsList(): TemplateResult {
    // Batch render mappings to avoid blocking the main thread
    const mappingsToRender = this.mappings.slice(
      0,
      Math.min(this.mappings.length, 10),
    );
    const remainingMappings = this.mappings.slice(10);

    return html`
      ${repeat(
        mappingsToRender,
        (mapping) => mapping.id ?? mapping.name,
        (mapping, index) => this.renderMappingCard(mapping, index),
      )}
      ${remainingMappings.length > 0
        ? html`
            <div class="si-form-actions">
              ${this._actionBtn(
                mdiPlus,
                `Load ${remainingMappings.length} more mappings...`,
                () => this.loadMoreMappings(),
              )}
            </div>
          `
        : ""}
    `;
  }

  private renderMappingCard(
    mapping: SmartIrrigationMapping,
    index: number,
  ): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    const lang = this.hass.language;
    const numberofzonesusingthismapping = this.zones.filter(
      (o) => o.mapping === mapping.id,
    ).length;

    // Short summary line: how many fields have a source, and how many zones
    // read the group. It counted every field, "None" ones included, under the
    // page's own title, and read "9 sensor groups" for one sensor group.
    const numberofsources = Object.values(mapping.mappings || {}).filter(
      (conf: any) => {
        const source = typeof conf === "string" ? conf : conf?.source;
        return !!source && source !== MAPPING_CONF_SOURCE_NONE;
      },
    ).length;
    const count = (n: number, key: string) =>
      localize(
        `panels.mappings.summary.${key}-${n === 1 ? "one" : "other"}`,
        lang,
      ).replace("{n}", String(n));
    const subParts: string[] = [count(numberofsources, "sources")];
    if (numberofzonesusingthismapping) {
      subParts.push(count(numberofzonesusingthismapping, "zones"));
    }
    const subText = subParts.join(" · ");

    const expanded = mapping.id != undefined && this._expanded.has(mapping.id);

    return html`
      <ha-card class="si-card">
        <div
          class="si-head"
          role="button"
          tabindex="0"
          aria-expanded=${expanded ? "true" : "false"}
          @click=${() => this._toggleItem(mapping.id)}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              this._toggleItem(mapping.id);
            }
          }}
        >
          <div class="si-head-text">
            <div class="si-title-row">
              <span class="si-title"
                >${mapping.id}: ${mapping.name || "—"}</span
              >
            </div>
            <div class="si-sub">${subText}</div>
          </div>
          <ha-svg-icon
            class="si-chevron ${expanded ? "open" : ""}"
            .path=${mdiChevronDown}
          ></ha-svg-icon>
        </div>
        ${expanded
          ? html`<div class="si-body">
              <div class="settings">
                ${this._textRow(
                  localize("panels.mappings.labels.mapping-name", lang),
                  "",
                  mapping.name,
                  (v) =>
                    this.handleEditMapping(index, {
                      ...mapping,
                      name: v,
                    }),
                )}
                ${this.renderMappingSettings(mapping, index)}
              </div>
              ${this.renderWeatherRecords(mapping)}
              <div class="si-actions">
                ${numberofzonesusingthismapping
                  ? html`<div class="weather-note">
                      ${localize(
                        "panels.mappings.cards.mapping.errors.cannot-delete-mapping-because-zones-use-it",
                        lang,
                      )}
                    </div>`
                  : this._actionBtn(
                      mdiDelete,
                      localize("common.actions.delete", lang),
                      (e: Event) => this.handleRemoveMapping(e, index),
                      true,
                    )}
              </div>
            </div>`
          : ""}
      </ha-card>
    `;
  }

  private renderMappingSettings(
    mapping: SmartIrrigationMapping,
    index: number,
  ): TemplateResult {
    // Render mapping settings in smaller chunks
    const settingsEntries = Object.entries(mapping.mappings);
    return html`
      ${settingsEntries.map(([value]) =>
        this.renderMappingSetting(index, value),
      )}
    `;
  }

  private loadMoreMappings(): void {
    // This would implement pagination/virtual scrolling
    // For now, just render all mappings
    this._scheduleUpdate();
  }

  /*
  ${Object.entries(this.mappings).map(([key, value]) =>
          this.renderMapping(value, value["id"])
        )}
        */

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle} ${modernStyle}

      /* .si-subgroup / .si-subgroup-title now live in modern-style (shared) */
      /* source radios laid out inline like the other field controls */
      .radio-group {
        display: flex;
        flex-wrap: wrap;
        gap: 8px 16px;
        align-items: center;
        flex: 0 0 auto;
        width: 240px;
        max-width: 50%;
      }
      .radio-group label {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--primary-text-color);
      }
      .radio-group label.strikethrough {
        text-decoration: line-through;
        opacity: 0.55;
      }
      /* HA entity picker, sized like the other controls */
      .entity-field {
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
      }
      @media (max-width: 600px) {
        .radio-group,
        .entity-field {
          width: 100%;
          max-width: 100%;
        }
      }
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    // Clean up any pending debounce timers
    this.debounceTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.debounceTimers.clear();

    // Clean up global debounce timer
    if (this.globalDebounceTimer) {
      clearTimeout(this.globalDebounceTimer);
      this.globalDebounceTimer = null;
    }

    // Clear the mapping cache
    this.mappingCache.clear();
  }
}
