import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { localize } from "../../../localize/localize";
import { friendlyDuration } from "../../card/format";
import {
  Timeline,
  TimelineSegment,
  offsetLabel,
  timelinePercent,
  timelineRows,
  timelineTicks,
  wateredSeconds,
} from "../../data/timeline";

/**
 * A program's run drawn on a time axis: a row per zone, its passes as bars,
 * the pipe filling in a lighter shade and the soaks hatched between them.
 *
 * The editor reads as a list of settings, and what a run would do (two zones
 * together, a step started before the last one ends, passes with a soak) had
 * to be pictured by hand. Given ``start``, the axis reads clock times.
 */
@customElement("si-program-timeline")
export class SmartIrrigationProgramTimeline extends LitElement {
  @property({ attribute: false }) timeline?: Timeline | null;
  @property() lang = "en";
  // When the run starts (ISO), for clock times on the axis; offsets otherwise.
  @property() start?: string;

  private _t(key: string) {
    return localize(`timeline.${key}`, this.lang);
  }

  private _clock(offset: number): string {
    if (!this.start) return offsetLabel(offset);
    const at = new Date(new Date(this.start).getTime() + offset * 1000);
    if (isNaN(at.getTime())) return offsetLabel(offset);
    return new Intl.DateTimeFormat(this.lang, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(at);
  }

  private _title(name: string, segment: TimelineSegment): string {
    const what =
      segment.kind === "water"
        ? this._t("water")
        : segment.kind === "fill"
          ? this._t("fill")
          : this._t("soak");
    const pass = this._t("pass").replace("{n}", String(segment.pass + 1));
    return `${name} · ${pass} · ${what} · ${friendlyDuration(
      segment.end - segment.start,
    )} (${this._clock(segment.start)} - ${this._clock(segment.end)})`;
  }

  render() {
    const rows = timelineRows(this.timeline, (id) => `#${id}`);
    if (!rows.length) {
      return html`<div class="empty">${this._t("nothing")}</div>`;
    }
    const total = Math.max(
      this.timeline?.total ?? 0,
      ...rows.flatMap((r) => r.segments.map((s) => s.end)),
    );
    const ticks = timelineTicks(total);
    const kinds = new Set(rows.flatMap((r) => r.segments.map((s) => s.kind)));
    return html`
      <div class="timeline" role="img" aria-label=${this._t("title")}>
        ${rows.map(
          (row) => html`
            <div class="row">
              <div class="name" title=${row.name}>
                <span>${row.name}</span>
                <span class="sub"
                  >${friendlyDuration(wateredSeconds(row))}</span
                >
              </div>
              <div class="track">
                ${ticks.map(
                  (tick) =>
                    html`<span
                      class="grid"
                      style="left: ${timelinePercent(tick, total)}%"
                    ></span>`,
                )}
                ${row.segments.map(
                  (segment) => html`
                    <span
                      class="seg ${segment.kind}"
                      style="left: ${timelinePercent(
                        segment.start,
                        total,
                      )}%; width: ${timelinePercent(
                        segment.end - segment.start,
                        total,
                      )}%"
                      title=${this._title(row.name, segment)}
                    ></span>
                  `,
                )}
              </div>
            </div>
          `,
        )}
        <div class="row axis">
          <div class="name"></div>
          <div class="track">
            ${ticks.map(
              (tick, n) => html`
                <span
                  class="tick ${n === 0 ? "first" : ""} ${n ===
                    ticks.length - 1 && n > 0
                    ? "last"
                    : ""}"
                  style="left: ${timelinePercent(tick, total)}%"
                  >${this._clock(tick)}</span
                >
              `,
            )}
          </div>
        </div>
        <div class="legend">
          <span><i class="seg water"></i>${this._t("water")}</span>
          ${kinds.has("fill")
            ? html`<span><i class="seg fill"></i>${this._t("fill")}</span>`
            : ""}
          ${kinds.has("soak")
            ? html`<span><i class="seg soak"></i>${this._t("soak")}</span>`
            : ""}
          <span class="total"
            >${this._t("total").replace(
              "{time}",
              friendlyDuration(total),
            )}</span
          >
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      margin: 8px 0;
    }
    .empty {
      opacity: 0.6;
      font-style: italic;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 26px;
    }
    .name {
      flex: 0 0 30%;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.9em;
      display: flex;
      flex-direction: column;
      line-height: 1.15;
    }
    .name .sub {
      font-size: 0.8em;
      opacity: 0.65;
    }
    .track {
      position: relative;
      flex: 1;
      height: 18px;
      border-radius: 4px;
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
    }
    .grid {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--divider-color, rgba(127, 127, 127, 0.25));
    }
    .seg {
      position: absolute;
      top: 2px;
      bottom: 2px;
      min-width: 2px;
      border-radius: 3px;
      box-sizing: border-box;
    }
    .seg.water {
      background: var(--primary-color, #03a9f4);
    }
    .seg.fill {
      background: var(--primary-color, #03a9f4);
      opacity: 0.4;
    }
    .seg.soak {
      background: repeating-linear-gradient(
        135deg,
        transparent 0 3px,
        var(--secondary-text-color, #888) 3px 4px
      );
      opacity: 0.5;
    }
    .axis .track {
      background: none;
      height: 16px;
    }
    .tick {
      position: absolute;
      transform: translateX(-50%);
      font-size: 0.75em;
      opacity: 0.7;
      white-space: nowrap;
    }
    .tick.first {
      transform: none;
    }
    .tick.last {
      transform: translateX(-100%);
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 6px;
      font-size: 0.8em;
      opacity: 0.85;
      align-items: center;
    }
    .legend i {
      position: relative;
      display: inline-block;
      width: 14px;
      height: 10px;
      margin-right: 4px;
      vertical-align: middle;
      top: auto;
      bottom: auto;
    }
    .legend .total {
      margin-left: auto;
    }
  `;
}
