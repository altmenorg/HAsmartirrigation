import { TemplateResult, LitElement, html, css, CSSResultGroup } from "lit";
import { property, state, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { loadHaForm } from "../../load-ha-elements";
import {
  fetchAllModules,
  fetchConfig,
  fetchMappings,
  fetchModules,
  fetchWeatherService,
  fetchZones,
  saveMapping,
  saveModule,
  saveZone,
} from "../../data/websockets";

import {
  SmartIrrigationConfig,
  SmartIrrigationMapping,
  SmartIrrigationModule,
} from "../../types";
import { engineModeLabel, output_unit } from "../../helpers";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { localize } from "../../../localize/localize";
import {
  MAPPING_CONF_SENSOR,
  MAPPING_CONF_SOURCE,
  MAPPING_CONF_SOURCE_NONE,
  MAPPING_CONF_SOURCE_SENSOR,
  MAPPING_CONF_SOURCE_STATIC_VALUE,
  MAPPING_CONF_SOURCE_WEATHER_SERVICE,
  MAPPING_CONF_STATIC_VALUE,
  MAPPING_CONF_UNIT,
  MAPPING_CURRENT_PRECIPITATION,
  ZONE_SIZE,
  ZONE_THROUGHPUT,
  MAPPING_DEWPOINT,
  MAPPING_EVAPOTRANSPIRATION,
  MAPPING_HUMIDITY,
  MAPPING_MODULE,
  MAPPING_PRECIPITATION,
  MAPPING_PRESSURE,
  MAPPING_SOLRAD,
  MAPPING_TEMPERATURE,
  MAPPING_WINDSPEED,
  ZONE_MAPPING,
} from "../../const";

/** Every source a sensor group can hold, in the order the editor shows them. */
const ALL_SOURCES = [
  MAPPING_TEMPERATURE,
  MAPPING_DEWPOINT,
  MAPPING_HUMIDITY,
  MAPPING_PRESSURE,
  MAPPING_WINDSPEED,
  MAPPING_SOLRAD,
  MAPPING_EVAPOTRANSPIRATION,
  MAPPING_PRECIPITATION,
  MAPPING_CURRENT_PRECIPITATION,
];

/** How the user says their evapotranspiration is going to be produced. */
type WeatherAnswer = "service" | "sensors" | "et" | "static";

/**
 * The engine each answer implies. The wizard never asks for an engine by name.
 *
 * "service" is decided at runtime rather than here: a service that hands us a
 * reference ET0 should have that figure taken as it stands, and only a service
 * that does not forces us to recompute Penman-Monteith from its raw fields.
 */
const ENGINE_FOR: Record<Exclude<WeatherAnswer, "service">, string> = {
  sensors: "PyETO",
  et: "Passthrough",
  static: "Static",
};

/**
 * A guided first setup.
 *
 * Smart Irrigation asks for a lot before it does anything: a calculation
 * module, a sensor group with nine sources, and a zone that ties them
 * together. Each of those is a dense form, and none of them says which answers
 * belong together, so a first-time user can fill in all three and still have a
 * combination that computes nothing.
 *
 * This asks instead, one question at a time, and only the questions the
 * previous answers left open. A greenhouse is never asked about rain. A zone
 * whose evapotranspiration comes from the weather service is never asked for
 * sensors. What it produces at the end is the same module, sensor group and
 * zone the other tabs edit: this is a way in, not a separate mode.
 */
@customElement("smart-irrigation-view-setup")
class SmartIrrigationViewSetup extends LitElement {
  @property() hass?: HomeAssistant;
  @property() config?: SmartIrrigationConfig;

  @state() private step = 0;
  @state() private allModules: SmartIrrigationModule[] = [];
  @state() private modules: SmartIrrigationModule[] = [];
  @state() private isSaving = false;
  @state() private error?: string;
  @state() private done = false;

  // The answers.
  @state() private zoneName = "";
  @state() private zoneSize = "";
  @state() private zoneThroughput = "";
  @state() private underGlass = false;
  @state() private weather: WeatherAnswer = "service";
  @state() private sensors: Record<string, string> = {};
  @state() private staticDelta = "";
  @state() private serviceSuppliesEt = false;

  firstUpdated() {
    loadHaForm().catch(() => undefined);
    this._load().catch((e) => console.error("Setup wizard: load failed", e));
  }

  private async _load(): Promise<void> {
    if (!this.hass) return;
    const [config, allModules, modules, service] = await Promise.all([
      fetchConfig(this.hass),
      fetchAllModules(this.hass),
      fetchModules(this.hass),
      fetchWeatherService(this.hass).catch(() => undefined),
    ]);
    this.config = config;
    this.allModules = allModules;
    this.modules = modules;
    this.serviceSuppliesEt = !!(service as any)?.supplies_evapotranspiration;
    // Without a weather service there is nothing for that answer to mean.
    if (!this.usesWeatherService) {
      this.weather = "sensors";
    }
  }

  private get lng(): string {
    return this.hass?.language ?? "en";
  }

  private t(key: string): string {
    return localize(`panels.setup.${key}`, this.lng);
  }

  private get usesWeatherService(): boolean {
    return !!(this.config as any)?.use_weather_service;
  }

  /** The engine the current answers imply, as the backend named it. */
  private get engineName(): string {
    if (this.weather === "service") {
      // Open-Meteo publishes FAO-56 ET0 directly, so taking it is both simpler
      // and closer to the source than recomputing it from the same service's
      // temperature and wind. A service that does not publish one leaves us
      // the full calculation.
      return this.serviceSuppliesEt ? "Passthrough" : "PyETO";
    }
    return ENGINE_FOR[this.weather];
  }

  /**
   * The sources to ask about: what the engine reads, minus what this
   * environment makes meaningless. Under glass no rain arrives, so asking for a
   * rain gauge would collect a number that describes somewhere else.
   */
  private get sourcesToAsk(): string[] {
    const engine = this.allModules.find((m) => m.name === this.engineName);
    const consumes = engine?.consumes ?? ALL_SOURCES;
    return ALL_SOURCES.filter(
      (source) =>
        consumes.includes(source) &&
        !(
          this.underGlass &&
          (source === MAPPING_PRECIPITATION ||
            source === MAPPING_CURRENT_PRECIPITATION)
        ),
    );
  }

  /** Sources the user has to point at an entity, given how they answered. */
  private get sensorsToAsk(): string[] {
    if (this.weather === "static") return [];
    if (this.weather === "et") return [MAPPING_EVAPOTRANSPIRATION];
    if (this.weather === "sensors") return this.sourcesToAsk;
    // The weather service supplies everything it can; rain indoors is not a
    // thing, and nothing else needs asking.
    return [];
  }

  private get steps(): string[] {
    const steps = ["zone", "environment", "weather"];
    if (this.sensorsToAsk.length || this.weather === "static") {
      steps.push("sensors");
    }
    steps.push("review");
    return steps;
  }

  private get currentStep(): string {
    return this.steps[Math.min(this.step, this.steps.length - 1)];
  }

  private get canGoOn(): boolean {
    switch (this.currentStep) {
      case "zone":
        return (
          this.zoneName.trim() !== "" &&
          Number(this.zoneSize) > 0 &&
          Number(this.zoneThroughput) > 0
        );
      case "sensors":
        if (this.weather === "static") return Number(this.staticDelta) > 0;
        return this.sensorsToAsk.every((s) => (this.sensors[s] ?? "") !== "");
      default:
        return true;
    }
  }

  render(): TemplateResult {
    if (!this.hass) return html``;

    if (this.done) {
      return html`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            <div class="done">${this.t("done")}</div>
            <div class="note">${this.t("done-note")}</div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${this.t("title")}">
        <div class="card-content">
          <div class="note">${this.t("description")}</div>
          <div class="progress">
            ${this.steps.map(
              (s, i) =>
                html`<span class="dot ${i === this.step ? "on" : ""}"></span>`,
            )}
          </div>
          ${this.renderStep()}
          ${this.error ? html`<div class="error">${this.error}</div>` : ""}
          <div class="actions">
            ${this.step > 0
              ? html`<button
                  class="secondary"
                  @click=${() => {
                    this.step -= 1;
                    this.error = undefined;
                  }}
                >
                  ${this.t("back")}
                </button>`
              : ""}
            ${this.currentStep === "review"
              ? html`<button
                  ?disabled=${this.isSaving}
                  @click=${() => this.create()}
                >
                  ${this.isSaving ? this.t("creating") : this.t("create")}
                </button>`
              : html`<button
                  ?disabled=${!this.canGoOn}
                  @click=${() => {
                    this.step += 1;
                    this.error = undefined;
                  }}
                >
                  ${this.t("next")}
                </button>`}
          </div>
        </div>
      </ha-card>
    `;
  }

  private renderStep(): TemplateResult {
    switch (this.currentStep) {
      case "zone":
        return this.renderZoneStep();
      case "environment":
        return this.renderEnvironmentStep();
      case "weather":
        return this.renderWeatherStep();
      case "sensors":
        return this.renderSensorsStep();
      default:
        return this.renderReviewStep();
    }
  }

  private renderZoneStep(): TemplateResult {
    return html`
      <h3>${this.t("steps.zone.question")}</h3>
      <div class="note">${this.t("steps.zone.help")}</div>
      <div class="setting-row">
        <div class="setting-label">${this.t("steps.zone.name")}</div>
        <input
          class="field"
          type="text"
          .value=${this.zoneName}
          @input=${(e: Event) =>
            (this.zoneName = (e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="setting-row">
        <div class="setting-label">
          ${this.t("steps.zone.size")}
          ${this.config
            ? html`<span class="unit"
                >(${output_unit(this.config, ZONE_SIZE)})</span
              >`
            : ""}
        </div>
        <input
          class="field"
          type="number"
          min="0"
          .value=${this.zoneSize}
          @input=${(e: Event) =>
            (this.zoneSize = (e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="setting-row">
        <div class="setting-label">
          ${this.t("steps.zone.throughput")}
          ${this.config
            ? html`<span class="unit"
                >(${output_unit(this.config, ZONE_THROUGHPUT)})</span
              >`
            : ""}
        </div>
        <input
          class="field"
          type="number"
          min="0"
          .value=${this.zoneThroughput}
          @input=${(e: Event) =>
            (this.zoneThroughput = (e.target as HTMLInputElement).value)}
        />
      </div>
      <div class="note">${this.t("steps.zone.throughput-help")}</div>
    `;
  }

  private renderEnvironmentStep(): TemplateResult {
    return html`
      <h3>${this.t("steps.environment.question")}</h3>
      ${this.choice(
        !this.underGlass,
        this.t("steps.environment.outdoors"),
        this.t("steps.environment.outdoors-help"),
        () => {
          this.underGlass = false;
        },
      )}
      ${this.choice(
        this.underGlass,
        this.t("steps.environment.under-glass"),
        this.t("steps.environment.under-glass-help"),
        () => {
          this.underGlass = true;
          // A weather service describes the sky, which this zone does not see.
          if (this.weather === "service") this.weather = "sensors";
        },
      )}
    `;
  }

  private renderWeatherStep(): TemplateResult {
    return html`
      <h3>${this.t("steps.weather.question")}</h3>
      ${this.usesWeatherService && !this.underGlass
        ? this.choice(
            this.weather === "service",
            this.t("steps.weather.service"),
            this.t("steps.weather.service-help"),
            () => (this.weather = "service"),
          )
        : ""}
      ${this.underGlass
        ? html`<div class="note">
            ${this.t("steps.weather.no-service-indoors")}
          </div>`
        : ""}
      ${this.choice(
        this.weather === "sensors",
        this.t("steps.weather.sensors"),
        this.t("steps.weather.sensors-help"),
        () => (this.weather = "sensors"),
      )}
      ${this.choice(
        this.weather === "et",
        this.t("steps.weather.et"),
        this.t("steps.weather.et-help"),
        () => (this.weather = "et"),
      )}
      ${this.choice(
        this.weather === "static",
        this.t("steps.weather.static"),
        this.t("steps.weather.static-help"),
        () => (this.weather = "static"),
      )}
    `;
  }

  private renderSensorsStep(): TemplateResult {
    if (this.weather === "static") {
      return html`
        <h3>${this.t("steps.sensors.static-question")}</h3>
        <div class="note">${this.t("steps.sensors.static-help")}</div>
        <div class="setting-row">
          <div class="setting-label">
            ${this.t("steps.sensors.static-label")}
          </div>
          <input
            class="field"
            type="number"
            min="0"
            step="0.1"
            .value=${this.staticDelta}
            @input=${(e: Event) =>
              (this.staticDelta = (e.target as HTMLInputElement).value)}
          />
        </div>
      `;
    }

    return html`
      <h3>${this.t("steps.sensors.question")}</h3>
      <div class="note">${this.t("steps.sensors.help")}</div>
      ${this.underGlass && this.sensorsToAsk.includes(MAPPING_SOLRAD)
        ? html`<div class="note">${this.t("steps.sensors.lux-hint")}</div>`
        : ""}
      ${this.sensorsToAsk.map(
        (source) => html`
          <div class="setting-row">
            <div class="setting-label">${source}</div>
            <ha-entity-picker
              class="entity-field"
              .hass=${this.hass}
              .value=${this.sensors[source] ?? ""}
              allow-custom-entity
              @value-changed=${(e: CustomEvent) => {
                this.sensors = {
                  ...this.sensors,
                  [source]: e.detail?.value ?? "",
                };
              }}
            ></ha-entity-picker>
          </div>
        `,
      )}
    `;
  }

  private renderReviewStep(): TemplateResult {
    return html`
      <h3>${this.t("steps.review.question")}</h3>
      <div class="review">
        <div><span>${this.t("steps.review.zone")}</span> ${this.zoneName}</div>
        <div>
          <span>${this.t("steps.review.environment")}</span>
          ${this.underGlass
            ? this.t("steps.environment.under-glass")
            : this.t("steps.environment.outdoors")}
        </div>
        <div>
          <span>${this.t("steps.review.engine")}</span>
          ${engineModeLabel(this.engineName, this.lng)}
        </div>
        <div>
          <span>${this.t("steps.review.sources")}</span>
          ${this.sensorsToAsk.length
            ? this.sensorsToAsk.join(", ")
            : this.t("steps.review.from-the-service")}
        </div>
      </div>
      <div class="note">${this.t("steps.review.help")}</div>
    `;
  }

  private choice(
    selected: boolean,
    title: string,
    help: string,
    pick: () => void,
  ): TemplateResult {
    return html`
      <div class="choice ${selected ? "selected" : ""}" @click=${pick}>
        <div class="choice-title">${title}</div>
        <div class="choice-help">${help}</div>
      </div>
    `;
  }

  /** The source each quantity gets, given how the user answered. */
  private sourceFor(quantity: string): Record<string, unknown> {
    if (this.sensors[quantity]) {
      return {
        [MAPPING_CONF_SOURCE]: MAPPING_CONF_SOURCE_SENSOR,
        [MAPPING_CONF_SENSOR]: this.sensors[quantity],
        [MAPPING_CONF_UNIT]: "",
      };
    }
    if (this.weather === "service" && this.sourcesToAsk.includes(quantity)) {
      return {
        [MAPPING_CONF_SOURCE]: MAPPING_CONF_SOURCE_WEATHER_SERVICE,
        [MAPPING_CONF_SENSOR]: "",
        [MAPPING_CONF_UNIT]: "",
      };
    }
    // Rain in a greenhouse is a real, known quantity: none of it.
    if (
      this.underGlass &&
      (quantity === MAPPING_PRECIPITATION ||
        quantity === MAPPING_CURRENT_PRECIPITATION)
    ) {
      return {
        [MAPPING_CONF_SOURCE]: MAPPING_CONF_SOURCE_STATIC_VALUE,
        [MAPPING_CONF_SENSOR]: "",
        [MAPPING_CONF_UNIT]: "",
        [MAPPING_CONF_STATIC_VALUE]: 0,
      };
    }
    return {
      [MAPPING_CONF_SOURCE]: MAPPING_CONF_SOURCE_NONE,
      [MAPPING_CONF_SENSOR]: "",
      [MAPPING_CONF_UNIT]: "",
    };
  }

  /**
   * Create the module, the sensor group and the zone, in that order.
   *
   * Each one is what the corresponding tab would have produced, so nothing here
   * is a special wizard-only object: the result can be edited afterwards like
   * anything else.
   */
  private async create(): Promise<void> {
    if (!this.hass || this.isSaving) return;
    this.isSaving = true;
    this.error = undefined;

    try {
      // Reuse an engine of the right kind rather than adding a second one.
      let engine = this.modules.find((m) => m.name === this.engineName);
      if (!engine) {
        const template = this.allModules.find(
          (m) => m.name === this.engineName,
        );
        if (!template) {
          throw new Error(`Unknown calculation engine ${this.engineName}`);
        }
        const config =
          this.weather === "static"
            ? {
                ...(template.config as object),
                delta: Number(this.staticDelta),
              }
            : template.config;
        await saveModule(this.hass, {
          name: template.name,
          description: template.description,
          config,
          schema: template.schema,
        } as SmartIrrigationModule);
        const modules = await fetchModules(this.hass);
        this.modules = modules;
        engine = modules.find((m) => m.name === this.engineName);
      }

      const mapping: SmartIrrigationMapping = {
        name: this.zoneName.trim(),
        mappings: Object.fromEntries(
          ALL_SOURCES.map((source) => [source, this.sourceFor(source)]),
        ),
        greenhouse: this.underGlass,
        [MAPPING_MODULE]: engine?.id,
      } as SmartIrrigationMapping;
      await saveMapping(this.hass, mapping);

      const groups = await fetchMappings(this.hass);
      const created = groups.find((m) => m.name === mapping.name);

      await saveZone(this.hass, {
        name: this.zoneName.trim(),
        size: Number(this.zoneSize),
        throughput: Number(this.zoneThroughput),
        state: "automatic",
        [ZONE_MAPPING]: created?.id,
      } as any);

      await fetchZones(this.hass);
      this.done = true;
    } catch (e) {
      console.error("Setup wizard: could not create the zone", e);
      this.error = this.t("failed");
    } finally {
      this.isSaving = false;
    }
  }

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle} ${modernStyle}

      h3 {
        margin: 12px 0 4px;
        color: var(--primary-text-color);
      }
      .note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin: 4px 0 8px;
      }
      /* The entity picker brings its own chrome, so it is sized like the
         other controls without taking the filled-field background. */
      .entity-field {
        flex: 0 0 auto;
        width: 360px;
        max-width: 100%;
      }
      /* one answer, big enough to tap, readable before it is chosen */
      .choice {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        margin: 8px 0;
        cursor: pointer;
      }
      .choice.selected {
        border-color: var(--primary-color);
      }
      .choice-title {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .choice-help {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 2px;
      }

      .progress {
        display: flex;
        gap: 6px;
        margin: 8px 0 4px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--divider-color);
      }
      .dot.on {
        background: var(--primary-color);
      }

      .review div {
        padding: 4px 0;
        color: var(--primary-text-color);
      }
      .review span {
        color: var(--secondary-text-color);
        margin-right: 8px;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 16px;
      }
      .actions button.secondary {
        background: transparent;
        color: var(--primary-color);
      }

      .error {
        color: var(--error-color, #b71c1c);
        margin-top: 8px;
      }
      .done {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--success-color, var(--primary-text-color));
      }
    `;
  }
}
