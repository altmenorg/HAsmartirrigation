import {
  TemplateResult,
  LitElement,
  html,
  css,
  CSSResultGroup,
  svg,
} from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { UnsubscribeFunc } from "home-assistant-js-websocket";
import { mdiRefresh } from "@mdi/js";
import moment from "moment";
import { localize } from "../../../localize/localize";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { loadHaForm } from "../../load-ha-elements";
import { SubscribeMixin } from "../../subscribe-mixin";
import { Path } from "../../common/navigation";
import {
  displayVolume,
  formatDuration,
  localizedDateTime,
  output_unit,
} from "../../helpers";
import { DOMAIN, ZONE_WATER_VOLUME } from "../../const";
import { SmartIrrigationConfig } from "../../types";
import {
  fetchConfig,
  fetchIrrigationHistory,
  IrrigationHistoryRecord,
} from "../../data/websockets";

/** How many days back the charts cover ("the last month"). */
const CHART_DAYS = 30;

/** How many runs to fetch, and how many of them the table lists. */
const HISTORY_LIMIT = 500;
const TABLE_LIMIT = 100;

/** Chart geometry, in viewBox units (the SVG scales to the card width). */
const CHART_WIDTH = 720;
const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 10, right: 8, bottom: 26, left: 46 };

/** One day's bucket of a chart series. */
interface DayBucket {
  /** Local calendar day, YYYY-MM-DD — the key runs are grouped by. */
  key: string;
  value: number;
}

@customElement("smart-irrigation-view-history")
export class SmartIrrigationViewHistory extends SubscribeMixin(LitElement) {
  hass?: HomeAssistant;
  @property() narrow!: boolean;
  @property() path!: Path;

  @state() private _config?: SmartIrrigationConfig;
  @state() private _records: IrrigationHistoryRecord[] = [];
  @state() private _loading = true;
  @state() private _error = "";

  firstUpdated() {
    loadHaForm().catch((error) => {
      console.error("Failed to load HA form:", error);
    });
  }

  public hassSubscribe(): Promise<UnsubscribeFunc>[] {
    this._fetchData().catch((error) => {
      console.error("Failed to fetch initial history:", error);
    });

    return [
      this.hass!.connection.subscribeMessage(
        () => {
          // A finished run updates the frontend, so the table and charts pick
          // it up without the user reloading the panel.
          this._fetchData().catch((error) => {
            console.error("Failed to refresh history:", error);
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
      const [config, history] = await Promise.all([
        fetchConfig(this.hass),
        fetchIrrigationHistory(this.hass, HISTORY_LIMIT),
      ]);
      this._config = config;
      this._records = history?.records || [];
      this._error = "";
    } catch (e: any) {
      this._error = e?.message || e?.code || String(e);
    } finally {
      this._loading = false;
    }
  }

  /**
   * The last CHART_DAYS local calendar days, oldest first. Runs are bucketed by
   * the day they started in the browser's timezone, which is the day the user
   * thinks of them as happening on.
   */
  private _chartDays(): string[] {
    const start = moment()
      .startOf("day")
      .subtract(CHART_DAYS - 1, "days");
    const days: string[] = [];
    for (let i = 0; i < CHART_DAYS; i++) {
      days.push(start.clone().add(i, "days").format("YYYY-MM-DD"));
    }
    return days;
  }

  /** Sum the water used per day, over the runs matching ``filter``. */
  private _daily(
    days: string[],
    filter?: (record: IrrigationHistoryRecord) => boolean,
  ): DayBucket[] {
    const totals = new Map<string, number>(days.map((day) => [day, 0]));
    for (const record of this._records) {
      if (!record.start || (filter && !filter(record))) {
        continue;
      }
      const stamp = moment(record.start);
      if (!stamp.isValid()) {
        continue;
      }
      const day = stamp.format("YYYY-MM-DD");
      // Runs older than the window are kept for the table but not charted.
      if (!totals.has(day)) {
        continue;
      }
      totals.set(
        day,
        totals.get(day)! + displayVolume(record.water_used, this._config),
      );
    }
    return days.map((day) => ({ key: day, value: totals.get(day)! }));
  }

  /**
   * Zones that watered inside the chart window, newest run first, so the panel
   * shows a chart per zone that actually has something to show.
   */
  private _chartedZones(days: string[]): { id: number | null; name: string }[] {
    const earliest = days[0];
    const seen = new Map<string, { id: number | null; name: string }>();
    for (const record of this._records) {
      if (!record.start) {
        continue;
      }
      const stamp = moment(record.start);
      if (!stamp.isValid() || stamp.format("YYYY-MM-DD") < earliest) {
        continue;
      }
      // Key on the id when there is one so a renamed zone stays a single
      // series; fall back to the name for runs recorded without an id.
      const key =
        record.zone_id !== null
          ? `#${record.zone_id}`
          : record.zone_name || "?";
      if (!seen.has(key)) {
        seen.set(key, {
          id: record.zone_id,
          name: record.zone_name || key,
        });
      }
    }
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }

  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }
    const lang = this.hass.language;

    if (this._loading) {
      return html`
        <ha-card header="${localize("panels.history.title", lang)}">
          <div class="card-content">
            ${localize("common.loading-messages.general", lang)}...
          </div>
        </ha-card>
      `;
    }

    const days = this._chartDays();
    const zones = this._chartedZones(days);

    return html`
      <ha-card header="${localize("panels.history.title", lang)}">
        <div class="card-content">
          <div class="history-intro">
            ${localize("panels.history.description", lang)}
          </div>
          ${this._error
            ? html`<div class="history-msg history-msg--error">
                ${this._error}
              </div>`
            : ""}
          <div class="history-actions">
            <ha-button appearance="plain" @click=${() => this._fetchData()}>
              <ha-svg-icon slot="start" .path=${mdiRefresh}></ha-svg-icon>
              ${localize("panels.history.refresh", lang)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <!-- The config carries the unit system, so without it the volumes would
           be unlabelled: show the error above on its own instead. -->
      ${this._config
        ? html`${this._renderTable(lang)} ${this._renderTotalChart(lang, days)}
          ${this._renderZoneCharts(lang, days, zones)}`
        : ""}
    `;
  }

  /** Every recorded run, newest first. */
  private _renderTable(lang: string): TemplateResult {
    const rows = this._records.slice(0, TABLE_LIMIT);
    const unit = output_unit(this._config, ZONE_WATER_VOLUME);

    return html`
      <ha-card header="${localize("panels.history.table.title", lang)}">
        <div class="card-content">
          ${rows.length === 0
            ? html`<div class="history-note">
                ${localize("panels.history.no-data", lang)}
              </div>`
            : html`
                <div class="history-scroll">
                  <div class="history-table">
                    <div class="history-header">
                      <span
                        >${localize("panels.history.table.start", lang)}</span
                      >
                      <span
                        >${localize("panels.history.table.zone", lang)}</span
                      >
                      <span
                        >${localize(
                          "panels.history.table.duration",
                          lang,
                        )}</span
                      >
                      <span
                        >${localize("panels.history.table.water", lang)}
                        <span class="history-unit">(${unit})</span></span
                      >
                    </div>
                    ${rows.map(
                      (record) => html`
                        <div class="history-row">
                          <span>${this._formatStart(record.start)}</span>
                          <span>${record.zone_name || "-"}</span>
                          <span>${formatDuration(record.duration)}</span>
                          <span
                            >${displayVolume(
                              record.water_used,
                              this._config,
                            ).toFixed(1)}</span
                          >
                        </div>
                      `,
                    )}
                  </div>
                </div>
                ${this._records.length > TABLE_LIMIT
                  ? html`<div class="history-note">
                      ${localize(
                        "panels.history.table.truncated",
                        lang,
                        "{count}",
                        TABLE_LIMIT,
                        "{total}",
                        this._records.length,
                      )}
                    </div>`
                  : ""}
              `}
        </div>
      </ha-card>
    `;
  }

  /** Total water used per day across every zone. */
  private _renderTotalChart(lang: string, days: string[]): TemplateResult {
    const buckets = this._daily(days);
    return html`
      <ha-card header="${localize("panels.history.charts.total-title", lang)}">
        <div class="card-content">${this._renderChart(buckets, lang)}</div>
      </ha-card>
    `;
  }

  /** One chart per zone that watered inside the window. */
  private _renderZoneCharts(
    lang: string,
    days: string[],
    zones: { id: number | null; name: string }[],
  ): TemplateResult {
    if (zones.length === 0) {
      return html``;
    }
    return html`
      <ha-card
        header="${localize("panels.history.charts.per-zone-title", lang)}"
      >
        <div class="card-content">
          ${zones.map((zone) => {
            const buckets = this._daily(days, (record) =>
              zone.id !== null
                ? record.zone_id === zone.id
                : record.zone_name === zone.name,
            );
            return html`
              <div class="zone-chart">
                <h4>${zone.name}</h4>
                ${this._renderChart(buckets, lang)}
              </div>
            `;
          })}
        </div>
      </ha-card>
    `;
  }

  /**
   * A bar per day, drawn as inline SVG — the panel ships no charting library,
   * and a bar chart of a fixed 30 buckets does not need one. The viewBox scales
   * to the card width so it stays readable on a phone.
   */
  private _renderChart(buckets: DayBucket[], lang: string): TemplateResult {
    const unit = output_unit(this._config, ZONE_WATER_VOLUME);
    const peak = Math.max(...buckets.map((bucket) => bucket.value), 0);
    if (peak <= 0) {
      return html`<div class="history-note">
        ${localize("panels.history.charts.no-data", lang)}
      </div>`;
    }
    const max = this._niceMax(peak);
    const plotWidth = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
    const plotHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
    const baseline = CHART_PADDING.top + plotHeight;
    const slot = plotWidth / buckets.length;
    const barWidth = Math.max(slot - 3, 1);

    // Three gridlines (0, half, full) keep the chart readable without turning
    // it into a table of numbers.
    const gridlines = [0, 0.5, 1].map((fraction) => {
      const y = baseline - fraction * plotHeight;
      return svg`
        <line
          class="grid"
          x1=${CHART_PADDING.left}
          y1=${y}
          x2=${CHART_WIDTH - CHART_PADDING.right}
          y2=${y}
        ></line>
        <text class="axis" x=${CHART_PADDING.left - 6} y=${y + 3.5} text-anchor="end">
          ${this._formatAxis(max * fraction)}
        </text>
      `;
    });

    const bars = buckets.map((bucket, index) => {
      const height = (bucket.value / max) * plotHeight;
      const x = CHART_PADDING.left + index * slot + (slot - barWidth) / 2;
      return svg`
        <rect
          class="bar"
          x=${x}
          y=${baseline - height}
          width=${barWidth}
          height=${height}
          rx="1"
        >
          <title>
            ${localizedDateTime(bucket.key, this.hass, {
              dateStyle: "long",
            })}: ${bucket.value.toFixed(1)}
          </title>
        </rect>
      `;
    });

    // Label roughly every fifth day, plus the last one, so the axis stays
    // legible at 30 buckets.
    const labelEvery = 5;
    const labels = buckets.map((bucket, index) => {
      if (index % labelEvery !== 0 && index !== buckets.length - 1) {
        return svg``;
      }
      return svg`
        <text
          class="axis"
          x=${CHART_PADDING.left + index * slot + slot / 2}
          y=${CHART_HEIGHT - 8}
          text-anchor="middle"
        >
          ${localizedDateTime(bucket.key, this.hass, {
            day: "numeric",
            month: "short",
          })}
        </text>
      `;
    });

    return html`
      <div class="chart-unit">${unit}</div>
      <svg
        class="chart"
        viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}"
        role="img"
        preserveAspectRatio="xMidYMid meet"
      >
        ${gridlines} ${bars} ${labels}
      </svg>
    `;
  }

  /** Round an axis maximum up to a 1/2/5 x 10^n step, so labels read cleanly. */
  private _niceMax(peak: number): number {
    const magnitude = Math.pow(10, Math.floor(Math.log10(peak)));
    const normalised = peak / magnitude;
    const step =
      normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;
    return step * magnitude;
  }

  private _formatAxis(value: number): string {
    return value >= 100 ? value.toFixed(0) : value.toFixed(1);
  }

  private _formatStart(start: string | null): string {
    if (!start) {
      return "-";
    }
    const stamp = moment(start);
    return stamp.isValid() ? stamp.format("YYYY-MM-DD HH:mm") : "-";
  }

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle} ${modernStyle}

      .history-intro {
        color: var(--primary-text-color);
        line-height: 1.4;
      }
      .history-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
      }
      .history-note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin-top: 8px;
      }
      .history-msg {
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 0.95em;
      }
      .history-msg--error {
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.12);
        color: var(--error-color);
      }

      /* The table keeps four columns on any width by scrolling sideways. */
      .history-scroll {
        overflow-x: auto;
      }
      .history-table {
        display: grid;
        grid-template-columns:
          minmax(130px, auto) minmax(110px, 1fr)
          minmax(90px, auto) minmax(80px, auto);
        gap: 8px;
        font-size: 0.85em;
        min-width: 100%;
        width: max-content;
      }
      .history-header {
        display: contents;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .history-header span {
        padding: 4px;
        background: var(--card-background-color);
        border-bottom: 2px solid var(--primary-color);
      }
      .history-row {
        display: contents;
        color: var(--secondary-text-color);
      }
      .history-row span {
        padding: 4px;
        border-bottom: 1px solid var(--divider-color);
      }
      .history-unit {
        font-weight: 400;
        color: var(--secondary-text-color);
      }

      .zone-chart + .zone-chart {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
      }
      .zone-chart h4 {
        margin: 0 0 4px 0;
        font-size: 1em;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .chart-unit {
        font-size: 0.8em;
        color: var(--secondary-text-color);
      }
      .chart {
        width: 100%;
        height: auto;
        overflow: visible;
      }
      .chart .bar {
        fill: var(--primary-color);
      }
      .chart .grid {
        stroke: var(--divider-color);
        stroke-width: 1;
      }
      .chart .axis {
        fill: var(--secondary-text-color);
        font-size: 10px;
      }
    `;
  }
}
