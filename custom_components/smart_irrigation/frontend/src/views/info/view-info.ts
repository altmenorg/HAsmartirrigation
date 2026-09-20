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

  private t(key: string): string {
    return localize(`panels.info.${key}`, this._lang);
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

      ${this.renderNextRun()} ${this.renderDecision()} ${this.renderEstimates()}
    `;
  }

  /** When the next run starts, why then, how long, and which zones. */
  private renderNextRun(): TemplateResult {
    const info = this.info;
    const zones = info?.next_irrigation_zones ?? [];

    return html`
      <ha-card header="${this.t("cards.next-run.title")}">
        <div class="card-content">
          ${info?.next_irrigation_start
            ? html`
                <div class="info-item">
                  <label>${this.t("cards.next-run.labels.start")}</label>
                  <span class="value"
                    >${localizedDateTime(
                      info.next_irrigation_start,
                      this.hass,
                      {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}</span
                  >
                </div>
                <div class="info-item">
                  <label>${this.t("cards.next-run.labels.trigger")}</label>
                  <span class="value"
                    >${info.trigger_name ??
                    this.t("cards.next-run.trigger-default")}</span
                  >
                </div>
                <div class="info-note">
                  ${info.trigger_accounts_for_duration
                    ? this.t("cards.next-run.accounts-for-duration")
                    : this.t("cards.next-run.starts-at-trigger")}
                </div>
              `
            : html`<div class="info-note">
                ${this.t("cards.next-run.no-start")}
              </div>`}

          <div class="info-item">
            <label>${this.t("cards.next-run.labels.duration")}</label>
            <span class="value"
              >${this.formatDuration(info?.next_irrigation_duration)}</span
            >
          </div>
          ${info?.zone_sequencing
            ? html`<div class="info-note">
                ${this.t(`cards.next-run.sequencing-${info.zone_sequencing}`)}
              </div>`
            : ""}

          <div class="info-item">
            <label>${this.t("cards.next-run.labels.zones")}</label>
            <span class="value"
              >${zones.length
                ? zones.join(", ")
                : this.t("cards.next-run.nothing-to-water")}</span
            >
          </div>
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

      .info-note {
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
