import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { localize } from "../../../localize/localize";
import { friendlyDuration, momentLabel } from "../../card/format";
import {
  weekLayout,
  weekPercent,
  weekTicks,
  WeekBlock,
  WeekRun,
} from "../../data/week";

// One colour per program, readable on a light and a dark theme.
const COLOURS = [
  "var(--blue-color, #2196f3)",
  "var(--orange-color, #ff9800)",
  "var(--green-color, #4caf50)",
  "var(--purple-color, #9c27b0)",
  "var(--teal-color, #009688)",
  "var(--pink-color, #e91e63)",
  "var(--amber-color, #ffc107)",
  "var(--indigo-color, #3f51b5)",
];

/**
 * What the programs will water over the next days, a row per day: each run a
 * block on an hour axis, its colour its program's, the soaks hatched, a run
 * the weather may hold back greyed. A block's tooltip says the rest: its
 * zones, why it may be held back, what it waits for or starts after.
 */
@customElement("si-week-view")
export class SmartIrrigationWeekView extends LitElement {
  @property({ attribute: false }) planning: WeekRun[] = [];
  // Today's runs under way and over (todayRuns): the planning lists only the
  // starts to come.
  @property({ attribute: false }) today: WeekRun[] = [];
  @property() lang = "en";
  @property({ type: Number }) days = 7;
  // Names as the panel shows them.
  @property({ attribute: false }) programLabel: (
    id: string,
    name: string,
  ) => string = (_id, name) => name;

  private _t(key: string) {
    return localize(`week.${key}`, this.lang);
  }

  private _clock(seconds: number): string {
    const h = Math.floor(seconds / 3600) % 24;
    const m = Math.floor((seconds % 3600) / 60);
    const at = new Date(2000, 0, 1, h, m);
    return new Intl.DateTimeFormat(this.lang, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(at);
  }

  private _dayLabel(date: Date, n: number): string {
    if (n === 0) return this._t("today");
    if (n === 1) return this._t("tomorrow");
    return new Intl.DateTimeFormat(this.lang, {
      weekday: "short",
      day: "numeric",
    }).format(date);
  }

  private _title(block: WeekBlock): string {
    const run = block.run as any;
    const start = new Date(run.expected_start || run.start);
    const end = new Date(run.expected_end || run.end);
    const time = new Intl.DateTimeFormat(this.lang, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const lines = [
      `${this.programLabel(run.program_id, run.program)} · ${time.format(
        start,
      )} - ${time.format(end)}`,
    ];
    for (const step of run.steps || []) {
      lines.push(
        (step.zones || [])
          .map(
            (z: any) =>
              `${z.zone} ${friendlyDuration(z.expected_seconds ?? z.seconds ?? 0)}`,
          )
          .join(" + "),
      );
    }
    // What the list under the chart said, and nothing else says.
    const p = (key: string) => localize(`planning.${key}`, this.lang);
    const label = (ref: any) =>
      this.programLabel(ref?.program_id, ref?.program) || "";
    const names = (zones: any[] | undefined) =>
      (zones || []).map((z: any) => z.zone).join(", ");
    if (run.after) {
      lines.push(
        (run.after.offset_minutes
          ? p("after_program_offset").replace(
              "{minutes}",
              String(run.after.offset_minutes),
            )
          : p("after_program")
        ).replace("{program}", label(run.after)),
      );
    }
    if (run.waits_for) {
      lines.push(
        p("waits_for")
          .replace("{program}", label(run.waits_for))
          .replace("{start}", time.format(start))
          .replace("{end}", time.format(end)),
      );
    }
    for (const entry of run.watered_twice || []) {
      lines.push(
        p("watered_twice")
          .replace("{zones}", entry.zone)
          .replace("{program}", label(entry.by)),
      );
    }
    if (run.zones_without_valve?.length && !run.nothing_to_water) {
      lines.push(`${p("no_valve")} ${names(run.zones_without_valve)}`);
    }
    if (run.running) lines.push(this._t("running"));
    else if (run.done) lines.push(this._t("done"));
    else if (run.nothing_to_water)
      lines.push(
        run.zones_without_valve?.length
          ? `${p("nothing_no_valve")} ${names(run.zones_without_valve)}`
          : this._t("nothing"),
      );
    else if (run.skipped_reason === "suspended")
      lines.push(
        p("expected_skipped_suspended").replace(
          "{when}",
          momentLabel(run.suspended_until, this.lang, {
            tomorrow: localize("card.tomorrow", this.lang),
            yesterday: localize("card.yesterday", this.lang),
          }),
        ),
      );
    else if (run.skipped_reason === "precipitation")
      lines.push(
        p("expected_skipped_precipitation").replace(
          "{mm}",
          String(Math.round((run.forecast?.forecast_mm ?? 0) * 10) / 10),
        ),
      );
    else if (run.skipped_reason) lines.push(this._t("held"));
    return lines.filter(Boolean).join("\n");
  }

  private _open(run: WeekRun) {
    this.dispatchEvent(
      new CustomEvent("open-program", {
        detail: { program_id: run.program_id },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _setDays(days: number) {
    this.dispatchEvent(
      new CustomEvent("days-changed", {
        detail: { days },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    const now = new Date();
    const runs = [...(this.today || []), ...(this.planning || [])];
    const layout = weekLayout(runs, this.days, now);
    const ticks = weekTicks(layout);
    const colour = (id: string) =>
      COLOURS[Math.max(0, layout.programs.indexOf(id)) % COLOURS.length];
    const nowSeconds =
      (now.getTime() - new Date(now.toDateString()).getTime()) / 1000;
    const names = new Map(
      runs.map((r) => [
        r.program_id,
        this.programLabel(r.program_id, r.program),
      ]),
    );
    return html`
      <div class="head">
        <div class="choices" role="group">
          ${[3, 7, 14].map(
            (n) =>
              html`<button
                class=${n === this.days ? "on" : ""}
                @click=${() => this._setDays(n)}
              >
                ${this._t("days").replace("{n}", String(n))}
              </button>`,
          )}
        </div>
        <div class="legend">
          ${layout.programs.map(
            (id) =>
              html`<span
                ><i style="background: ${colour(id)}"></i>${names.get(id)}</span
              >`,
          )}
        </div>
      </div>
      <div class="week">
        ${layout.days.map(
          (day, n) => html`
            <div class="row">
              <div class="day ${n === 0 ? "today" : ""}">
                ${this._dayLabel(day.date, n)}
              </div>
              <div class="track">
                ${ticks.map(
                  (tick) =>
                    html`<span
                      class="grid"
                      style="left: ${weekPercent(tick, layout)}%"
                    ></span>`,
                )}
                ${n === 0 &&
                nowSeconds >= layout.from &&
                nowSeconds <= layout.to
                  ? html`<span
                      class="now"
                      style="left: ${weekPercent(nowSeconds, layout)}%"
                    ></span>`
                  : nothing}
                ${day.blocks.map(
                  (block) => html`
                    <button
                      class="run ${block.held ? "held" : ""} ${block.run.done
                        ? "done"
                        : ""} ${block.run.running
                        ? "running"
                        : ""} ${block.cutBefore
                        ? "cut-before"
                        : ""} ${block.cutAfter ? "cut-after" : ""}"
                      style="left: ${weekPercent(
                        block.from,
                        layout,
                      )}%; width: ${Math.max(
                        0.6,
                        weekPercent(block.to, layout) -
                          weekPercent(block.from, layout),
                      )}%; --run: ${colour(block.run.program_id)}"
                      title=${this._title(block)}
                      @click=${() => this._open(block.run)}
                    >
                      ${block.soaks.map(
                        (soak) =>
                          html`<span
                            class="soak"
                            style="left: ${((soak.from - block.from) /
                              Math.max(1, block.to - block.from)) *
                            100}%; width: ${((soak.to - soak.from) /
                              Math.max(1, block.to - block.from)) *
                            100}%"
                          ></span>`,
                      )}
                    </button>
                  `,
                )}
              </div>
            </div>
          `,
        )}
        <div class="row axis">
          <div class="day"></div>
          <div class="track">
            ${ticks.map(
              (tick, n) =>
                html`<span
                  class="tick ${n === 0 && tick === layout.from
                    ? "first"
                    : ""} ${n === ticks.length - 1 && tick === layout.to
                    ? "last"
                    : ""}"
                  style="left: ${weekPercent(tick, layout)}%"
                  >${this._clock(tick)}</span
                >`,
            )}
          </div>
        </div>
      </div>
      ${(this.planning || []).length
        ? nothing
        : html`<div class="empty">${this._t("empty")}</div>`}
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
    }
    .choices {
      display: inline-flex;
      border: 1px solid var(--divider-color);
      border-radius: 16px;
      overflow: hidden;
    }
    .choices button {
      border: 0;
      background: none;
      color: var(--primary-text-color);
      font: inherit;
      font-size: 0.85em;
      padding: 4px 12px;
      cursor: pointer;
    }
    .choices button.on {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.85em;
    }
    .legend i {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 3px;
      margin-right: 4px;
      vertical-align: -1px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 28px;
    }
    .day {
      flex: 0 0 84px;
      font-size: 0.85em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .day.today {
      font-weight: 600;
    }
    .track {
      position: relative;
      flex: 1;
      height: 22px;
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
    .now {
      position: absolute;
      top: -2px;
      bottom: -2px;
      width: 2px;
      background: var(--error-color, #db4437);
      z-index: 2;
    }
    .run {
      position: absolute;
      top: 3px;
      bottom: 3px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: var(--run);
      cursor: pointer;
      overflow: hidden;
      min-width: 4px;
    }
    .run:hover {
      filter: brightness(1.1);
      box-shadow: 0 0 0 2px var(--primary-text-color);
    }
    .run.held {
      opacity: 0.35;
      background: repeating-linear-gradient(
        45deg,
        var(--run) 0 4px,
        transparent 4px 7px
      );
    }
    /* Over today: plain, fainter; going on: outlined. */
    .run.done {
      opacity: 0.55;
    }
    .run.running {
      box-shadow: 0 0 0 2px var(--primary-text-color);
    }
    .run.cut-before {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
    .run.cut-after {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .soak {
      position: absolute;
      top: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.75) 0 2px,
        transparent 2px 5px
      );
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
    .empty {
      margin-top: 8px;
      opacity: 0.6;
      font-style: italic;
    }
    @media (max-width: 500px) {
      .day {
        flex-basis: 56px;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "si-week-view": SmartIrrigationWeekView;
  }
}
