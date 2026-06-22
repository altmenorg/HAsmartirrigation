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
  SmartIrrigationConfig,
  SmartIrrigationInfo,
  SmartIrrigationZone,
} from "../../types";
import { output_unit } from "../../helpers";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { localize } from "../../../localize/localize";
import { DOMAIN, ZONE_BUCKET } from "../../const";
import moment from "moment";

@customElement("happy-irrigation-view-info")
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
    // Initial data fetch for UI setup with proper error handling
    this._fetchData().catch((error) => {
      console.error("Failed to fetch initial data:", error);
    });

    return [
      this.hass!.connection.subscribeMessage(
        () => {
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
      this.isLoading = true;

      // Fetch config, irrigation info, and zones concurrently
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
      // Trigger a re-render to ensure UI updates
      this._scheduleUpdate();
    }
  }

  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    if (this.isLoading) {
      return html`
        <ha-card header="${localize("panels.info.title", this.hass.language)}">
          <div class="card-content">
            ${localize("common.loading", this.hass.language)}...
          </div>
        </ha-card>
      `;
    }

    if (!this.config) {
      return html`
        <ha-card header="${localize("panels.info.title", this.hass.language)}">
          <div class="card-content">
            ${localize(
              "panels.info.configuration-not-available",
              this.hass.language,
            )}
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card header="${localize("panels.info.title", this.hass.language)}">
        <div class="card-content">
          ${localize("panels.info.description", this.hass.language)}
        </div>
      </ha-card>

      ${this.renderZoneBucketsCard()} ${this.renderNextIrrigationCard()}
      ${this.renderIrrigationReasonCard()}
    `;
  }

  private renderZoneBucketsCard(): TemplateResult {
    if (!this.hass) {
      return html``;
    }

    if (!this.zones || this.zones.length === 0) {
      return html`
        <ha-card
          header="${localize(
            "panels.info.cards.zone-bucket-values.title",
            this.hass.language,
          )}"
        >
          <div class="card-content">
            <div class="info-item">
              <span class="value"
                >${localize(
                  "panels.info.cards.zone-bucket-values.no-zones",
                  this.hass.language,
                )}</span
              >
            </div>
          </div>
        </ha-card>
      `;
    }

    const bucketUnit = this.config
      ? output_unit(this.config, ZONE_BUCKET)
      : "mm";

    return html`
      <ha-card
        header="${localize(
          "panels.info.cards.zone-bucket-values.title",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          ${this.zones.map(
            (zone) => html`
              <div class="zone-info">
                <div class="zone-header">
                  <label class="zone-name">${zone.name}</label>
                </div>
                <div class="zone-details">
                  <div class="zone-bucket">
                    <span class="label"
                      >${localize(
                        "panels.info.cards.zone-bucket-values.labels.bucket",
                        this.hass?.language ?? "en",
                      )}:</span
                    >
                    <span class="value">
                      ${Number(zone.bucket).toFixed(1)} ${bucketUnit}
                    </span>
                  </div>
                  <div class="zone-duration">
                    <span class="label"
                      >${localize(
                        "panels.info.cards.zone-bucket-values.labels.duration",
                        this.hass?.language ?? "en",
                      )}:</span
                    >
                    <span class="value">
                      ${zone.duration
                        ? `${Math.round(zone.duration)} ${localize("common.units.seconds", this.hass?.language ?? "en")}`
                        : `0 ${localize("common.units.seconds", this.hass?.language ?? "en")}`}
                    </span>
                  </div>
                </div>
              </div>
            `,
          )}
        </div>
      </ha-card>
    `;
  }

  private renderNextIrrigationCard(): TemplateResult {
    if (!this.hass || !this.info) {
      return html`
        <ha-card
          header="${localize(
            "panels.info.cards.next-irrigation.title",
            this.hass?.language ?? "en",
          )}"
        >
          <div class="card-content">
            <div class="info-item">
              <label
                >${localize(
                  "panels.info.cards.next-irrigation.labels.next-start",
                  this.hass?.language ?? "en",
                )}:</label
              >
              <span class="value">
                ${localize(
                  "panels.info.cards.next-irrigation.no-data",
                  this.hass?.language ?? "en",
                )}
              </span>
            </div>
            <div class="info-note">
              ${localize(
                "panels.info.cards.next-irrigation.backend-todo",
                this.hass?.language ?? "en",
              )}
            </div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card
        header="${localize(
          "panels.info.cards.next-irrigation.title",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          <div class="info-item">
            <label
              >${localize(
                "panels.info.cards.next-irrigation.labels.next-start",
                this.hass.language,
              )}:</label
            >
            <span class="value">
              ${this.info.next_irrigation_start
                ? moment(this.info.next_irrigation_start).format(
                    "YYYY-MM-DD HH:mm:ss",
                  )
                : localize(
                    "panels.info.cards.next-irrigation.no-data",
                    this.hass.language,
                  )}
            </span>
          </div>

          ${this.info.next_irrigation_duration
            ? html`
                <div class="info-item">
                  <label
                    >${localize(
                      "panels.info.cards.next-irrigation.labels.duration",
                      this.hass.language,
                    )}:</label
                  >
                  <span class="value"
                    >${this.info.next_irrigation_duration}
                    ${localize(
                      "common.units.seconds",
                      this.hass.language,
                    )}</span
                  >
                </div>
              `
            : ""}
          ${this.info.next_irrigation_zones &&
          this.info.next_irrigation_zones.length > 0
            ? html`
                <div class="info-item">
                  <label
                    >${localize(
                      "panels.info.cards.next-irrigation.labels.zones",
                      this.hass.language,
                    )}:</label
                  >
                  <span class="value"
                    >${this.info.next_irrigation_zones.join(", ")}</span
                  >
                </div>
              `
            : ""}
        </div>
      </ha-card>
    `;
  }

  private renderIrrigationReasonCard(): TemplateResult {
    if (!this.hass || !this.info) {
      return html`
        <ha-card
          header="${localize(
            "panels.info.cards.irrigation-reason.title",
            this.hass?.language ?? "en",
          )}"
        >
          <div class="card-content">
            <div class="info-item">
              <label
                >${localize(
                  "panels.info.cards.irrigation-reason.labels.reason",
                  this.hass?.language ?? "en",
                )}:</label
              >
              <span class="value">
                ${localize(
                  "panels.info.cards.irrigation-reason.no-data",
                  this.hass?.language ?? "en",
                )}
              </span>
            </div>
            <div class="info-note">
              ${localize(
                "panels.info.cards.irrigation-reason.backend-todo",
                this.hass?.language ?? "en",
              )}
            </div>
          </div>
        </ha-card>
      `;
    }

    return html`
      <ha-card
        header="${localize(
          "panels.info.cards.irrigation-reason.title",
          this.hass.language,
        )}"
      >
        <div class="card-content">
          <div class="info-item">
            <label
              >${localize(
                "panels.info.cards.irrigation-reason.labels.reason",
                this.hass.language,
              )}:</label
            >
            <span class="value">
              ${this.info.irrigation_reason ||
              localize(
                "panels.info.cards.irrigation-reason.no-data",
                this.hass.language,
              )}
            </span>
          </div>

          ${this.info.sunrise_time
            ? html`
                <div class="info-item">
                  <label
                    >${localize(
                      "panels.info.cards.irrigation-reason.labels.sunrise",
                      this.hass.language,
                    )}:</label
                  >
                  <span class="value"
                    >${moment(this.info.sunrise_time).format("HH:mm:ss")}</span
                  >
                </div>
              `
            : ""}
          ${this.info.total_irrigation_duration !== undefined
            ? html`
                <div class="info-item">
                  <label
                    >${localize(
                      "panels.info.cards.irrigation-reason.labels.total-duration",
                      this.hass.language,
                    )}:</label
                  >
                  <span class="value"
                    >${this.info.total_irrigation_duration}
                    ${localize(
                      "common.units.seconds",
                      this.hass.language,
                    )}</span
                  >
                </div>
              `
            : ""}
          ${this.info.irrigation_explanation
            ? html`
                <div class="info-item explanation">
                  <label
                    >${localize(
                      "panels.info.cards.irrigation-reason.labels.explanation",
                      this.hass.language,
                    )}:</label
                  >
                  <div class="explanation-text">
                    ${this.info.irrigation_explanation}
                  </div>
                </div>
              `
            : ""}
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle} ${modernStyle}

      /* Align the Info view with the shared modern look used on the other
         pages: each zone is a sub-group (heading + rows), and every label/value
         line matches .setting-row / .setting-label typography and spacing. */
      .card-content {
        display: flex;
        flex-direction: column;
      }

      /* each zone reads as a section, like .si-subgroup elsewhere */
      .zone-info {
        padding: 12px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .zone-info:last-child {
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

      /* a zone's bucket + duration: compact, left-aligned label:value pairs
         that sit next to each other and wrap as a whole (never mid-value),
         using the free space instead of cramming to the right. */
      .zone-details {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 28px;
        margin-top: 2px;
      }
      .zone-bucket,
      .zone-duration {
        display: flex;
        align-items: baseline;
        gap: 6px;
        white-space: nowrap;
      }
      .zone-bucket .label,
      .zone-duration .label {
        color: var(--secondary-text-color);
      }
      .zone-bucket .value,
      .zone-duration .value {
        color: var(--primary-text-color);
        font-weight: 500;
        white-space: nowrap;
      }

      /* single label/value rows in the other cards (next irrigation, reason):
         label left, value right, like a .setting-row */
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
      }

      .info-note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 8px;
      }
    `;
  }
}
