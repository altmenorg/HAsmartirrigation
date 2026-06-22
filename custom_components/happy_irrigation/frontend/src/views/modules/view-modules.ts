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
import { modernStyle } from "../../styles/modern-style";
import { localize } from "../../../localize/localize";
import { DOMAIN } from "../../const";
import { prettyPrint, getPart } from "../../helpers";
import {
  mdiDelete,
  mdiChevronDown,
  mdiMenuDown,
  mdiPlus,
  mdiMinus,
} from "@mdi/js";

@customElement("happy-irrigation-view-modules")
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

  // Which module cards are expanded (own collapsible — full control over styling)
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

    const numberofzonesusingthismodule = this.zones.filter(
      (o) => o.module === module.id,
    ).length;

    // expand key: module id when saved, else fall back to the list index so
    // not-yet-saved modules are still toggleable
    const expandKey = module.id ?? index;
    const expanded = this._expanded.has(expandKey);

    // Some saved instances have no stored description; fall back to the module
    // type's description (matched by name) so every card shows it.
    const description =
      module.description ||
      this.allmodules.find((m) => m.name === module.name)?.description ||
      "";

    // Use cache for better performance. Include the expanded flag in the key so
    // toggling a card open/closed produces a distinct (re-rendered) result.
    const cacheKey = `module-${module.id || index}-${
      expanded ? "open" : "closed"
    }-${JSON.stringify(module)}`;
    if (this.moduleCache.has(cacheKey)) {
      return this.moduleCache.get(cacheKey)!;
    }

    const result = html`
      <ha-card class="si-card">
        <div
          class="si-head"
          role="button"
          tabindex="0"
          aria-expanded=${expanded ? "true" : "false"}
          @click=${() => this._toggleItem(expandKey)}
          @keydown=${(e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              this._toggleItem(expandKey);
            }
          }}
        >
          <div class="si-head-text">
            <div class="si-title-row">
              <span class="si-title"
                >${module.id != undefined
                  ? `${module.id}: ${module.name}`
                  : module.name}</span
              >
            </div>
            <div class="si-sub">${description}</div>
          </div>
          <ha-svg-icon
            class="si-chevron ${expanded ? "open" : ""}"
            .path=${mdiChevronDown}
          ></ha-svg-icon>
        </div>
        ${expanded
          ? html` <div class="si-body">
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
                <div class="settings">
                  ${module.schema
                    ? Object.entries(module.schema).map(([value]) =>
                        this.renderConfig(index, value),
                      )
                    : null}
                </div>
              </div>
              ${numberofzonesusingthismodule
                ? html`<div class="weather-note">
                    ${localize(
                      "panels.modules.cards.module.errors.cannot-delete-module-because-zones-use-it",
                      this.hass.language,
                    )}
                  </div>`
                : html`<div class="si-actions">
                    ${this._actionBtn(
                      mdiDelete,
                      localize("common.actions.delete", this.hass.language),
                      (e: Event) => this.handleRemoveModule(e, index),
                      true,
                    )}
                  </div>`}
            </div>`
          : ""}
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
    // required fields are flagged with a trailing "*" in the label
    const label = schemaline["required"]
      ? `${prettyName} *`
      : (prettyName ?? "");

    if (schemaline["type"] == "boolean") {
      // no dedicated row helper for booleans — keep a native checkbox inside a
      // .setting-row, same @change handler shape as before
      return html`
        <div class="setting-row">
          <div class="setting-label">${label}</div>
          <input
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
          />
        </div>
      `;
    } else if (
      schemaline["type"] == "float" ||
      schemaline["type"] == "integer"
    ) {
      // integers step by 1, floats by 1 as well (no decimal hint in schema)
      return this._numRow(
        label,
        "",
        mod.config[name],
        (v) =>
          this.handleEditConfig(index, {
            ...mod,
            config: {
              ...mod.config,
              [name]: v,
            },
          }),
        1,
      );
    } else if (schemaline["type"] == "string") {
      return this._textRow(label, "", val, (v) =>
        this.handleEditConfig(index, {
          ...mod,
          config: {
            ...mod.config,
            [name]: v,
          },
        }),
      );
    } else if (schemaline["type"] == "select") {
      const hasslanguage = this.hass.language;
      const options = html`
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
      `;
      return this._selectRow(label, options, (e: Event) =>
        this.handleEditConfig(index, {
          ...mod,
          config: {
            ...mod.config,
            [name]: (e.target as HTMLSelectElement).value,
          },
        }),
      );
    }
    return html``;
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
                <div class="setting-row">
                  <div class="setting-label">
                    ${localize("common.labels.module", this.hass.language)}
                  </div>
                  <div class="select-wrap">
                    <select
                      id="moduleInput"
                      class="field"
                      ?disabled="${this.isSaving}"
                    >
                      ${Object.entries(this.allmodules).map(
                        ([key, value]) =>
                          html`<option value="${value.id}">
                            ${value.name}
                          </option>`,
                      )}
                    </select>
                    <svg class="chev" viewBox="0 0 24 24">
                      <path d=${mdiMenuDown}></path>
                    </svg>
                  </div>
                </div>
                <div class="si-form-actions">
                  <ha-button
                    appearance="filled"
                    @click="${this.handleAddModule}"
                    ?disabled="${this.isSaving}"
                  >
                    <ha-svg-icon slot="start" .path=${mdiPlus}></ha-svg-icon>
                    ${this.isSaving
                      ? localize(
                          "common.saving-messages.adding",
                          this.hass.language,
                        )
                      : localize(
                          "panels.modules.cards.add-module.actions.add",
                          this.hass.language,
                        )}
                  </ha-button>
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
      ${globalStyle} ${modernStyle} /* View-specific styles only - most common styles are now in globalStyle */
    `;
  }
}
