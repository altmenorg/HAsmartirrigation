import { TemplateResult, LitElement, html, CSSResultGroup, css } from "lit";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { loadHaForm } from "../../load-ha-elements";
import { UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  fetchConfig,
  fetchIrrigationInfo,
  fetchZones,
} from "../../data/websockets";
import { SubscribeMixin } from "../../subscribe-mixin";

import {
  SkipCheck,
  SkipEvaluation,
  SmartIrrigationConfig,
  SmartIrrigationInfo,
  SmartIrrigationZone,
} from "../../types";
import { localizedDateTime, output_unit } from "../../helpers";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { localize } from "../../../localize/localize";
import { DOMAIN, ZONE_BUCKET } from "../../const";

/**
 * The Info view answers the one question the Zones view cannot: what will
 * happen at the next start, and why.
 *
 * It deliberately does not repeat the per-zone configuration, and it does not
 * manufacture prose. Where there is nothing to report it says so, rather than
 * filling the space with a sentence that reads like information.
 */
@customElement("smart-irrigation-view-info")
class SmartIrrigationViewInfo extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() config?: SmartIrrigationConfig;

  @property({ type: Object })
  private info?: SmartIrrigationInfo;

  @property({ type: Array })
  private zones: SmartIrrigationZone[] = [];

  @property({ type: Boolean })
  private isLoading = true;

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

  firstUpdated() {
    loadHaForm().catch((error) => {
      console.error("Failed to load HA form:", error);
    });
  }

  public hassSubscribe(): Promise<UnsubscribeFunc>[] {
    this._fetchData().catch((error) => {
      console.error("Failed to fetch initial data:", error);
    });

    return [
      this.hass!.connection.subscribeMessage(
        () => {
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
      this.isLoading = true;
      const [config, info, zones] = await Promise.all([
        fetchConfig(this.hass),
        fetchIrrigationInfo(this.hass),
        fetchZones(this.hass),
      ]);
      this.config = config;
      this.info = info;
      this.zones = zones;
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      this.isLoading = false;
      this._scheduleUpdate();
    }
  }

  private get _lang(): string {
    return this.hass?.language ?? "en";
  }

  private t(key: string, ...args: any[]): string {
    return localize(`panels.info.${key}`, this._lang, ...args);
  }

  /** Seconds as something a person reads, not a raw count. */
  private formatDuration(seconds?: number | null): string {
    const total = Math.max(0, Math.round(seconds ?? 0));
    const h = localize("common.units.hours", this._lang);
    const m = localize("common.units.minutes", this._lang);
    const s = localize("common.units.seconds", this._lang);
    if (total < 60) {
      return `${total} ${s}`;
    }
    if (total < 3600) {
      return `${Math.round(total / 60)} ${m}`;
    }
    const hours = Math.floor(total / 3600);
    const minutes = Math.round((total % 3600) / 60);
    return minutes ? `${hours} ${h} ${minutes} ${m}` : `${hours} ${h}`;
  }

  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    if (this.isLoading) {
      return html`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            ${localize("common.loading", this._lang)}...
          </div>
        </ha-card>
      `;
    }

    if (!this.config) {
      return html`
        <ha-card header="${this.t("title")}">
          <div class="card-content">
            ${this.t("configuration-not-available")}
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${this.t("title")}">
        <div class="card-content">${this.t("description")}</div>
      </ha-card>

      ${this.renderPostpone()} ${this.renderDeliveryGap()}
      ${this.renderNextRun()} ${this.renderDecision()} ${this.renderEstimates()}
    `;
  }

  /**
   * Hold watering back for a day or two, and lift it.
   *
   * Rain the forecast missed, a party on the lawn, a repair: the reasons are
   * the user's, and the answer used to be turning every zone off, which is
   * easy to do and easy to forget. A postponement ends by itself.
   */
  private renderPostpone(): TemplateResult {
    const postponed = (this.info as any)?.skip_preview?.checks?.find(
      (check: any) => check.id === "postponed" && check.skip,
    );
    return html`
      <ha-card>
        <div class="card-content postpone">
          ${postponed
            ? html`
                <ha-icon icon="mdi:pause-circle-outline"></ha-icon>
                <span class="postpone-state">
                  ${this.t("cards.postpone.until")}
                  ${localizedDateTime(postponed.until, this.hass, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <ha-button @click=${() => this.resumeIrrigation()}>
                  ${this.t("cards.postpone.resume")}
                </ha-button>
              `
            : html`
                <ha-icon icon="mdi:weather-pouring"></ha-icon>
                <span class="postpone-state">
                  ${this.t("cards.postpone.prompt")}
                </span>
                <ha-button @click=${() => this.postponeIrrigation(24)}>
                  ${this.t("cards.postpone.for-24")}
                </ha-button>
                <ha-button @click=${() => this.postponeIrrigation(48)}>
                  ${this.t("cards.postpone.for-48")}
                </ha-button>
              `}
        </div>
      </ha-card>
    `;
  }

  private async postponeIrrigation(hours: number): Promise<void> {
    await this.hass!.callService("smart_irrigation", "postpone_irrigation", {
      hours,
    });
    await this._fetchData();
  }

  private async resumeIrrigation(): Promise<void> {
    await this.hass!.callService("smart_irrigation", "resume_irrigation", {});
    await this._fetchData();
  }

  /**
   * Why nothing would water, when that is the case.
   *
   * An installation can be set up correctly, update its durations every night
   * and never open a valve, without a single error anywhere: this integration
   * calculates, and something else acts on the result. That is the most
   * expensive thing to get wrong here, because everything looks right, so it
   * is said at the top of the page that answers "what is about to happen".
   */
  private renderDeliveryGap(): TemplateResult | string {
    const gap = (this.info as any)?.delivery_gap;
    if (!gap) return "";
    return html`
      <ha-card>
        <div class="card-content gap-banner">
          <ha-icon icon="mdi:water-alert-outline"></ha-icon>
          <div>
            <div class="gap-title">${this.t(`gaps.${gap}.title`)}</div>
            <div class="info-note">${this.t(`gaps.${gap}.body`)}</div>
          </div>
        </div>
      </ha-card>
    `;
  }

  /**
   * One sentence for what is about to happen, then the detail.
   *
   * This used to be four rows of label and value, which managed to say "next
   * run tomorrow at 07:58" and "nothing to water" at the same time: both were
   * true (the trigger fires daily, no zone is short of water) and together
   * they were nonsense. So the page answers with one line, chosen in the order
   * that matters: held back by you, held back by the weather, watering, or
   * nothing to water, and the trigger is the detail underneath.
   */
  private renderNextRun(): TemplateResult {
    const info = this.info;
    const zones = info?.next_irrigation_zones ?? [];
    const seconds = info?.next_irrigation_duration ?? 0;
    const postponed = (info as any)?.skip_preview?.checks?.find(
      (check: any) => check.id === "postponed" && check.skip,
    );
    const skipped = info?.skip_preview?.should_skip
      ? info?.skip_preview?.reason
      : null;
    const start = info?.next_irrigation_start
      ? localizedDateTime(info.next_irrigation_start, this.hass, {
          weekday: "long",
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

    let icon = "mdi:water-off-outline";
    let headline = this.t("cards.next-run.headline-nothing");
    let sub = start
      ? this.t("cards.next-run.sub-nothing", "{start}", start)
      : this.t("cards.next-run.no-start");

    if (postponed) {
      icon = "mdi:pause-circle-outline";
      headline = this.t("cards.next-run.headline-postponed");
      sub = this.t("cards.next-run.sub-postponed");
    } else if (skipped && skipped !== "postponed") {
      icon = "mdi:calendar-remove-outline";
      headline = this.t("cards.next-run.headline-skipped");
      sub = this.t(`cards.decision.check-${skipped}`);
    } else if (zones.length && seconds > 0) {
      icon = "mdi:water-outline";
      headline = start
        ? this.t("cards.next-run.headline-watering", "{start}", start)
        : this.t("cards.next-run.headline-watering-soon");
      sub = this.t(
        "cards.next-run.sub-watering",
        "{count}",
        String(zones.length),
        "{duration}",
        this.formatDuration(seconds),
      );
    }

    return html`
      <ha-card>
        <div class="card-content hero">
          <ha-icon icon=${icon}></ha-icon>
          <div class="hero-text">
            <div class="hero-headline">${headline}</div>
            <div class="hero-sub">${sub}</div>
          </div>
        </div>
        <div class="card-content hero-detail">
          <span>
            ${this.t("cards.next-run.labels.trigger")}:
            ${info?.trigger_name ?? this.t("cards.next-run.trigger-default")}
            ${info?.trigger_accounts_for_duration
              ? `(${this.t("cards.next-run.accounts-for-duration")})`
              : ""}
          </span>
          ${zones.length
            ? html`<span
                >${this.t("cards.next-run.labels.zones")}:
                ${zones.join(", ")}</span
              >`
            : ""}
          ${info?.zone_sequencing
            ? html`<span
                >${this.t(
                  `cards.next-run.sequencing-${info.zone_sequencing}`,
                )}</span
              >`
            : ""}
        </div>
      </ha-card>
    `;
  }

  /** The skip conditions, each with the numbers behind it. */
  private renderDecision(): TemplateResult {
    const preview = this.info?.skip_preview;

    return html`
      <ha-card header="${this.t("cards.decision.title")}">
        <div class="card-content">
          ${!preview
            ? html`<div class="info-note">
                ${this.t("cards.decision.unavailable")}
              </div>`
            : html`
                <div class="verdict ${preview.should_skip ? "skip" : "run"}">
                  ${preview.should_skip
                    ? this.t("cards.decision.will-skip")
                    : this.t("cards.decision.will-run")}
                </div>
                ${preview.checks.map((check) => this.renderCheck(check))}
                <div class="info-note">
                  ${this.t("cards.decision.preview-note")}
                </div>
              `}
          ${this.renderLastDecision()}
        </div>
      </ha-card>
    `;
  }

  private renderCheck(check: SkipCheck): TemplateResult {
    let state = "passing";
    if (!check.enabled) {
      state = "off";
    } else if (!check.available) {
      state = "unavailable";
    } else if (check.skip) {
      state = "blocking";
    }

    return html`
      <div class="check">
        <div class="check-head">
          <span class="check-name"
            >${this.t(`cards.decision.check-${check.id}`)}</span
          >
          <span class="chip ${state}"
            >${this.t(`cards.decision.state-${state}`)}</span
          >
        </div>
        ${check.enabled && check.available
          ? html`<div class="check-detail">
              ${this.renderCheckNumbers(check)}
            </div>`
          : ""}
      </div>
    `;
  }

  private renderCheckNumbers(check: SkipCheck): TemplateResult {
    if (check.id === "precipitation") {
      return html`
        <span
          >${this.t("cards.decision.detail-forecast")}:
          ${check.forecast_mm?.toFixed(1) ?? "-"} mm</span
        >
        <span
          >${this.t("cards.decision.detail-threshold")}:
          ${check.threshold_mm?.toFixed(1) ?? "-"} mm</span
        >
      `;
    }
    if (check.id === "freeze" || check.id === "wind") {
      const source =
        check.source === "weather_service"
          ? this.t("cards.decision.detail-weather-service")
          : check.source;
      return html`
        <span
          >${this.t("cards.decision.detail-now")}: ${check.value ?? "-"}
          ${check.unit ?? ""}</span
        >
        <span
          >${this.t("cards.decision.detail-threshold")}:
          ${check.threshold ?? "-"} ${check.unit ?? ""}</span
        >
        <span>${source ?? ""}</span>
      `;
    }
    if (check.id === "rain_sensor") {
      return html`<span
        >${check.raining
          ? this.t("cards.decision.detail-raining")
          : this.t("cards.decision.detail-dry")}</span
      >`;
    }
    if (check.id === "soil_moisture") {
      return html`${(check.zones || []).map(
        (zone) =>
          html`<span
            >${zone.name}: ${zone.moisture ?? "-"} % / ${zone.threshold} %
            ${zone.held
              ? `(${this.t("cards.decision.detail-held")})`
              : ""}</span
          >`,
      )}`;
    }
    if (check.id === "days_between") {
      return html`
        <span
          >${this.t("cards.decision.detail-days-since")}:
          ${check.days_since ?? "-"}</span
        >
        <span
          >${this.t("cards.decision.detail-days-required")}:
          ${check.days_required ?? "-"}</span
        >
      `;
    }
    return html``;
  }

  /** What the checks said when a run was last actually decided. */
  private renderLastDecision(): TemplateResult {
    const last: SkipEvaluation | null | undefined =
      this.info?.last_skip_evaluation;

    return html`
      <div class="last-decision">
        <span class="check-name">${this.t("cards.decision.last-title")}</span>
        ${last
          ? html`<span class="value"
              >${last.should_skip
                ? this.t("cards.decision.last-skipped")
                : this.t("cards.decision.last-ran")}${last.evaluated_at
                ? ` (${localizedDateTime(last.evaluated_at, this.hass, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })})`
                : ""}</span
            >`
          : html`<span class="value"
              >${this.t("cards.decision.last-none")}</span
            >`}
      </div>
    `;
  }

  /**
   * The live estimate. The stored bucket is the one the last calculation
   * committed, so on its own it describes last night rather than now.
   */
  private renderEstimates(): TemplateResult {
    const estimates = this.info?.zone_estimates ?? {};
    const unit = this.config ? output_unit(this.config, ZONE_BUCKET) : "mm";
    const rows = this.zones.filter((zone) => estimates[String(zone.id)]);

    return html`
      <ha-card header="${this.t("cards.estimate.title")}">
        <div class="card-content">
          ${rows.length === 0
            ? html`<div class="info-note">
                ${this.t("cards.estimate.none")}
              </div>`
            : html`
                ${rows.map((zone) => {
                  const estimate = estimates[String(zone.id)];
                  return html`
                    <div class="zone-info">
                      <div class="zone-header">
                        <label class="zone-name">${zone.name}</label>
                      </div>
                      <div class="zone-details">
                        <div class="pair">
                          <span class="label"
                            >${this.t("cards.estimate.labels.now")}:</span
                          >
                          <span class="value"
                            >${Number(estimate.bucket).toFixed(1)} ${unit}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t(
                              "cards.estimate.labels.at-last-calculation",
                            )}:</span
                          >
                          <span class="value"
                            >${Number(zone.bucket).toFixed(1)} ${unit}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t(
                              "cards.estimate.labels.would-water",
                            )}:</span
                          >
                          <span class="value"
                            >${estimate.duration
                              ? this.formatDuration(estimate.duration)
                              : this.t("cards.estimate.nothing")}</span
                          >
                        </div>
                        <div class="pair">
                          <span class="label"
                            >${this.t(
                              "cards.estimate.labels.last-irrigation",
                            )}:</span
                          >
                          <span class="value"
                            >${zone.last_irrigation
                              ? localizedDateTime(
                                  zone.last_irrigation,
                                  this.hass,
                                  {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : this.t("cards.estimate.never-watered")}</span
                          >
                        </div>
                      </div>
                    </div>
                  `;
                })}
                <div class="info-note">${this.t("cards.estimate.note")}</div>
              `}
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle} ${modernStyle}

      .card-content {
        display: flex;
        flex-direction: column;
      }

      /* label left, value right, matching .setting-row elsewhere */
      /* One sentence, said the way a person would say it. */
      .hero {
        /* The shared .card-content stacks its children, which put the icon on
           a line of its own. */
        flex-direction: row;
        gap: 16px;
        align-items: flex-start;
      }

      .hero ha-icon {
        --mdc-icon-size: 32px;
        color: var(--primary-color);
        flex: none;
        margin-top: 2px;
      }

      .hero-headline {
        font-size: 1.35em;
        font-weight: 400;
        line-height: 1.3;
      }

      .hero-sub {
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      /* The trigger and the zones: true, and nobody's first question. */
      .hero-detail {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 4px 20px;
        padding-top: 0;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }

      .info-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        min-height: 44px;
        padding: 2px 0;
      }
      .info-item label {
        color: var(--secondary-text-color);
      }
      .info-item .value {
        color: var(--primary-text-color);
        font-weight: 500;
        text-align: right;
      }

      /* A remark under a value, not an alert: the shared style paints
         .info-note as a warning banner, which read as something wrong. */
      .postpone {
        flex-direction: row;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }

      .postpone ha-icon {
        color: var(--secondary-text-color);
        flex: none;
      }

      .postpone-state {
        flex: 1;
        min-width: 180px;
      }

      .gap-banner {
        flex-direction: row;
        gap: 12px;
        align-items: flex-start;
      }

      .gap-banner ha-icon {
        color: var(--warning-color, #ffa600);
        flex: none;
      }

      .gap-title {
        font-weight: 500;
      }

      .info-note {
        background: none;
        padding: 0;
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 4px;
      }

      /* the headline answer of the decision card */
      .verdict {
        font-size: 1.05em;
        font-weight: 600;
        padding: 4px 0 12px;
      }
      .verdict.run {
        color: var(--success-color, var(--primary-text-color));
      }
      .verdict.skip {
        color: var(--warning-color, var(--primary-text-color));
      }

      .check {
        padding: 10px 0;
        border-top: 1px solid var(--divider-color);
      }
      .check-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .check-name {
        color: var(--primary-text-color);
        font-weight: 500;
      }
      .check-detail {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 24px;
        margin-top: 4px;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }

      /* state of one check, readable without relying on colour alone */
      .chip {
        border-radius: 12px;
        padding: 2px 10px;
        font-size: 0.85em;
        white-space: nowrap;
        border: 1px solid var(--divider-color);
        color: var(--secondary-text-color);
      }
      .chip.blocking {
        border-color: var(--warning-color, var(--divider-color));
        color: var(--warning-color, var(--primary-text-color));
      }
      .chip.passing {
        border-color: var(--success-color, var(--divider-color));
        color: var(--success-color, var(--primary-text-color));
      }

      .last-decision {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color);
      }
      .last-decision .value {
        color: var(--primary-text-color);
        font-weight: 500;
        text-align: right;
      }

      /* one zone reads as a section, as on the other pages */
      .zone-info {
        padding: 12px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .zone-info:last-of-type {
        border-bottom: 0;
      }
      .zone-header {
        margin-bottom: 4px;
      }
      .zone-name {
        font-size: 1.05em;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .zone-details {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 28px;
        margin-top: 2px;
      }
      .pair {
        display: flex;
        align-items: baseline;
        gap: 6px;
        white-space: nowrap;
      }
      .pair .label {
        color: var(--secondary-text-color);
      }
      .pair .value {
        color: var(--primary-text-color);
        font-weight: 500;
      }
    `;
  }
}
