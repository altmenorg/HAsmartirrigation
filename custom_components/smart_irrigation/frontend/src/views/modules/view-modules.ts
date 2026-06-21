import { TemplateResult, LitElement, html, css, CSSResultGroup } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { query } from "lit/decorators.js";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { loadHaForm } from "../../load-ha-elements";
import { UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  deleteModule,
  fetchConfig,
  fetchAllModules,
  fetchModules,
  saveModule,
  fetchZones,
} from "../../data/websockets";
import { SubscribeMixin } from "../../subscribe-mixin";

import {
  SmartIrrigationConfig,
  SmartIrrigationZone,
  SmartIrrigationModule,
} from "../../types";
import { globalStyle } from "../../styles/global-style";
import { localize } from "../../../localize/localize";
import { DOMAIN } from "../../const";
import { prettyPrint, getPart } from "../../helpers";
import { mdiDelete } from "@mdi/js";

@customElement("smart-irrigation-view-modules")
class SmartIrrigationViewModules extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() config?: SmartIrrigationConfig;

  @property({ type: Array })
  private zones: SmartIrrigationZone[] = [];
  @property({ type: Array })
  private modules: SmartIrrigationModule[] = [];
  @property({ type: Array })
  private allmodules: SmartIrrigationModule[] = [];

  @property({ type: Boolean })
  private isLoading = true;

  @property({ type: Boolean })
  private isSaving = false;

  // True once the first data load has completed. Avoids tearing the module
  // list down to a "loading" indicator on every background refresh, which
  // dropped focus and reset scroll while editing.
  private _hasLoadedOnce = false;

  // Set just before an inline-edit save to ignore the _config_updated echo our
  // own write triggers. External changes (add/remove) still refresh normally.
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

  // Cache for rendered module cards
  private moduleCache = new Map<string, TemplateResult>();

  @query("#moduleInput")
  private moduleInput!: HTMLSelectElement;

  firstUpdated() {
    // Load HA form elements in background without blocking UI
    loadHaForm().catch((error) => {
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

    // Only show the loading indicator on the very first load; background
    // refreshes must not unmount the list (focus/scroll loss).
    if (!this._hasLoadedOnce) {
      this.isLoading = true;
      this._scheduleUpdate();
    }

    try {
      // Fetch all data concurrently for better performance
      const [config, zones, modules, allmodules] = await Promise.all([
        fetchConfig(this.hass),
        fetchZones(this.hass),
        fetchModules(this.hass),
        fetchAllModules(this.hass),
      ]);

      this.config = config;
      this.zones = zones;
      this.modules = modules;
      this.allmodules = allmodules;

      // Clear module cache when data changes
      this.moduleCache.clear();
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle error gracefully - keep existing data if fetch fails
    } finally {
      this.isLoading = false;
      this._hasLoadedOnce = true;
      this._scheduleUpdate();
    }
  }

  // Debounced save operation for better performance
  private debouncedSave = (() => {
    let timeoutId: number | null = null;
    return (module: SmartIrrigationModule) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        // Ignore the _config_updated echo this save triggers (see flag declaration).
        this._suppressNextConfigUpdate = true;
        this.saveToHA(module).catch(() => {
          // Save failed (already logged): clear the guard so it doesn't
          // swallow a later genuine refresh.
          this._suppressNextConfigUpdate = false;
        });
        timeoutId = null;
      }, 500); // 500ms debounce
    };
  })();

  private async handleAddModule(): Promise<void> {
    if (!this.moduleInput?.selectedOptions?.[0] || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this._scheduleUpdate();

    try {
      const selectedText = this.moduleInput.selectedOptions[0].text;
      const m = this.allmodules.find((o) => o.name === selectedText);

      if (!m) {
        return;
      }

      const newModule: SmartIrrigationModule = {
        name: selectedText,
        description: m.description,
        config: m.config,
        schema: m.schema,
      };

      // Optimistic update
      this.modules = [...this.modules, newModule];
      this.moduleCache.clear(); // Clear cache when modules change
      this._scheduleUpdate();

      // Save to backend
      await this.saveToHA(newModule);

      // Refresh data to get the new module with ID
      await this._fetchData();
    } catch (error) {
      console.error("Error adding module:", error);
      // Rollback optimistic update on error
      await this._fetchData();
    } finally {
      this.isSaving = false;
      this._scheduleUpdate();
    }
  }

  private async handleRemoveModule(ev: Event, index: number): Promise<void> {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this._scheduleUpdate();

    try {
      const moduleToRemove = this.modules[index];
      const moduleid = moduleToRemove?.id;

      // Optimistic update
      const originalModules = this.modules;
      this.modules = this.modules.filter((_, i) => i !== index);
      this.moduleCache.clear(); // Clear cache when modules change
      this._scheduleUpdate();

      if (this.hass && moduleid !== undefined) {
        await deleteModule(this.hass, moduleid.toString());
      } else {
        // If no ID, just remove from local state (not saved yet)
      }
    } catch (error) {
      console.error("Error removing module:", error);
      // Rollback optimistic update on error
      await this._fetchData();
    } finally {
      this.isSaving = false;
      this._scheduleUpdate();
    }
  }

  private async saveToHA(module: SmartIrrigationModule): Promise<void> {
    if (!this.hass) {
      return;
    }

    try {
      await saveModule(this.hass, module);
      // Data will be updated via WebSocket subscription
    } catch (error) {
      console.error("Error saving module:", error);
      throw error; // Re-throw to handle in calling function
    }
  }
  private renderModule(
    module: SmartIrrigationModule,
    index: number,
  ): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    // Use cache for better performance
    const cacheKey = `module-${module.id || index}-${JSON.stringify(module)}`;
    if (this.moduleCache.has(cacheKey)) {
      return this.moduleCache.get(cacheKey)!;
    }

    const numberofzonesusingthismodule = this.zones.filter(
      (o) => o.module === module.id,
    ).length;

    const result = html`
      <ha-card header="${module.id}: ${module.name}">
        <div class="card-content">
          <div class="moduledescription${index}">${module.description}</div>
          <div class="moduleconfig">
            <label class="subheader"
              >${localize(
                "panels.modules.cards.module.labels.configuration",
                this.hass.language,
              )}
              (*
              ${localize(
                "panels.modules.cards.module.labels.required",
                this.hass.language,
              )})</label
            >
            ${module.schema
              ? Object.entries(module.schema).map(([value]) =>
                  this.renderConfig(index, value),
                )
              : null}
          </div>
          ${numberofzonesusingthismodule
            ? html`<div class="weather-note">
                ${localize(
                  "panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it",
                  this.hass.language,
                )}
              </div>`
            : html` <div
                class="action-button"
                @click="${(e: Event) => this.handleRemoveModule(e, index)}"
              >
                <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                  <path fill="#404040" d="${mdiDelete}" />
                </svg>
                <span class="action-button-label">
                  ${localize("common.actions.delete", this.hass.language)}
                </span>
              </div>`}
        </div>
      </ha-card>
    `;

    this.moduleCache.set(cacheKey, result);
    return result;
  }

  /*
  : html`<div class="schemaline">
                    <input
                      id="moduleconfigInput${index}"
                      type="text"
                      .value=${JSON.stringify(module.config)}
                    />
                  </div>`
                  */
  renderConfig(index: number, value: string): any {
    const mod = Object.values(this.modules).at(index);
    if (!mod || !this.hass) {
      return;
    }
    //loop over items in schema and output the right UI
    const schemaline = mod.schema[value];
    const name = schemaline["name"];
    const prettyName = prettyPrint(name);
    let val = "";
    if (mod.config == null) {
      mod.config = [];
    }
    if (name in mod.config) {
      val = mod.config[name];
    }
    let r = html`<label for="${name + index}"
      >${prettyName} </label
    `;
    if (schemaline["type"] == "boolean") {
      r = html`${r}<input
          type="checkbox"
          id="${name + index}"
          .checked=${val}
          @change="${(e: Event) =>
            this.handleEditConfig(index, {
              ...mod,
              config: {
                ...mod.config,
                [name]: (e.target as HTMLInputElement).checked,
              },
            })}"
        />`;
    } else if (
      schemaline["type"] == "float" ||
      schemaline["type"] == "integer"
    ) {
      r = html`${r}<input
          type="number"
          class="shortinput"
          id="${schemaline["name"] + index}"
          .value="${mod.config[schemaline["name"]]}"
          @change="${(e: Event) =>
            this.handleEditConfig(index, {
              ...mod,
              config: {
                ...mod.config,
                [name]: (e.target as HTMLInputElement).value,
              },
            })}"
        />`;
    } else if (schemaline["type"] == "string") {
      r = html`${r}<input
          type="text"
          id="${name + index}"
          .value="${val}"
          @change="${(e: Event) =>
            this.handleEditConfig(index, {
              ...mod,
              config: {
                ...mod.config,
                [name]: (e.target as HTMLInputElement).value,
              },
            })}"
        />`;
    } else if (schemaline["type"] == "select") {
      const hasslanguage = this.hass.language;
      //@change
      r = html`${r}<select
          id="${name + index}"
          @change="${(e: Event) =>
            this.handleEditConfig(index, {
              ...mod,
              config: {
                ...mod.config,
                [name]: (e.target as HTMLSelectElement).value,
              },
            })}"
        >
          ${Object.entries(schemaline["options"]).map(
            ([key, value]) =>
              html`<option
                value="${getPart(value, 0)}"
                ?selected="${val === getPart(value, 0)}"
              >
                ${localize(
                  "panels.modules.cards.module.translated-options." +
                    getPart(value, 1),
                  hasslanguage,
                )}
              </option>`,
          )}
        </select>`;
    }

    if (schemaline["required"]) {
      r = html`${r}`;
    }
    r = html`<div class="schemaline">${r}</div>`;
    return r;
  }

  handleEditConfig(index: number, updatedModule: SmartIrrigationModule) {
    // Optimistic update for responsive UI
    this.modules = Object.values(this.modules).map((module, i) =>
      i === index ? updatedModule : module,
    );

    // Clear cache for this module
    this.moduleCache.clear();
    this._scheduleUpdate();

    // Debounced save to reduce backend calls
    this.debouncedSave(updatedModule);
  }

  private renderOption(value: any, description: any): TemplateResult {
    if (!this.hass) {
      return html``;
    } else {
      return html`<option value="${value}>${description}</option>`;
    }
  }
  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    return html`
      <ha-card header="${localize("panels.modules.title", this.hass.language)}">
        <div class="card-content">
          ${localize("panels.modules.description", this.hass.language)}
        </div>
      </ha-card>

      <ha-card
        header="${localize(
          "panels.modules.cards.add-module.header",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          ${this.isLoading
            ? html`<div class="loading-indicator">
                ${localize(
                  "common.loading-messages.general",
                  this.hass.language,
                )}
              </div>`
            : html`
                <div class="zoneline">
                  <label for="moduleInput"
                    >${localize(
                      "common.labels.module",
                      this.hass.language,
                    )}:</label
                  >
                  <select id="moduleInput" ?disabled="${this.isSaving}">
                    ${Object.entries(this.allmodules).map(
                      ([key, value]) =>
                        html`<option value="${value.id}">
                          ${value.name}
                        </option>`,
                    )}
                  </select>
                </div>
                <div class="zoneline">
                  <span></span>
                  <button
                    @click="${this.handleAddModule}"
                    ?disabled="${this.isSaving}"
                    class="${this.isSaving ? "saving" : ""}"
                  >
                    ${this.isSaving
                      ? localize(
                          "common.saving-messages.adding",
                          this.hass.language,
                        )
                      : localize(
                          "panels.modules.cards.add-module.actions.add",
                          this.hass.language,
                        )}
                  </button>
                </div>
              `}
        </div>
      </ha-card>

      ${this.isLoading
        ? html`<div class="loading-indicator">
            ${localize("common.loading-messages.modules", this.hass.language)}
          </div>`
        : repeat(
            this.modules,
            (module) => module.id ?? module.name,
            (module, index) => this.renderModule(module, index),
          )}
    `;
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Clean up timers and caches
    if (this.globalDebounceTimer) {
      clearTimeout(this.globalDebounceTimer);
      this.globalDebounceTimer = null;
    }

    this.moduleCache.clear();
  }

  /*
   ${Object.entries(this.modules).map(([key, value]) =>
          this.renderModule(value, value["id"])
        )}
        */

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle}/* View-specific styles only - most common styles are now in globalStyle */
    `;
  }
}
