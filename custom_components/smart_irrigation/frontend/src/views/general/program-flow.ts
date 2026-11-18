import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { localize } from "../../../localize/localize";
import { friendlyDuration } from "../../card/format";
import { ProgramFlow, WeatherVerdict } from "../../data/program-flow";

/**
 * A program drawn as a flow, top to bottom: what starts it, the weather it
 * asks (and its answer for the next run), the pumps it switches on, each step with its valves side by side, the
 * waits between steps, the pumps switched off and who is told. Read only: it
 * follows the form or the YAML as they are edited (data/program-flow.ts).
 */
@customElement("si-program-flow")
export class SmartIrrigationProgramFlow extends LitElement {
  @property({ attribute: false }) flow?: ProgramFlow;
  /** The schedules in words, one per line; none: started by hand. */
  @property({ attribute: false }) schedules: string[] = [];
  /** The weather's answer for the next run (weatherVerdict); off: no node. */
  @property({ attribute: false }) weather: WeatherVerdict = { state: "off" };
  @property({ type: Boolean }) notify = false;
  @property() lang = "en";

  private _t(key: string, values: Record<string, string> = {}) {
    let text = localize(`flow.${key}`, this.lang);
    for (const [k, v] of Object.entries(values))
      text = text.replace(`{${k}}`, v);
    return text;
  }

  /** "Yes", "No: Wind", "No: Rain forecast 6 mm", or what is asked. */
  private _verdict(verdict: WeatherVerdict): string {
    if (verdict.state === "yes") {
      if (!verdict.unread) return this._t("weather_yes");
      return this._t("weather_yes_unread", {
        reason: localize(
          `panels.info.cards.decision.check-${verdict.unread}`,
          this.lang,
        ),
      });
    }
    if (verdict.state !== "no") return this._t("weather_sub");
    let reason = localize(
      `panels.info.cards.decision.check-${verdict.reason}`,
      this.lang,
    );
    if (verdict.reason === "precipitation" && verdict.mm != null) {
      reason += ` ${Math.round(verdict.mm * 10) / 10} mm`;
    }
    return this._t("weather_no", { reason });
  }

  private _openZone(zoneId: number) {
    this.dispatchEvent(
      new CustomEvent("open-zone", {
        detail: { zone_id: zoneId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _arrow(label?: string) {
    return html`<div class="arrow">
      ${label ? html`<span class="arrow-label">${label}</span>` : nothing}
    </div>`;
  }

  render() {
    const flow = this.flow;
    if (!flow || (!flow.steps.length && !flow.idle.length)) {
      return html`<div class="empty">${this._t("empty")}</div>`;
    }
    const seconds = (s: number) => friendlyDuration(Math.abs(s));
    return html`
      <div class="flow">
        <div class="node start">
          <div class="title">${this._t("start")}</div>
          ${this.schedules.length
            ? this.schedules.map((s) => html`<div class="sub">${s}</div>`)
            : html`<div class="sub">${this._t("by_hand")}</div>`}
        </div>
        ${this.weather.state !== "off"
          ? html`${this._arrow()}
              <div class="branch">
                <div
                  class="node weather ${this.weather.state} ${this.weather
                    .state === "yes" && this.weather.unread
                    ? "unread"
                    : ""}"
                >
                  <div class="title">${this._t("weather")}</div>
                  <div class="sub">${this._verdict(this.weather)}</div>
                </div>
                <div class="side">${this._t("otherwise")}</div>
              </div>`
          : nothing}
        ${flow.supplies.map(
          (supply) =>
            html`${this._arrow()}
              <div class="node supply">
                <div class="title">
                  ${this._t("supply_on", { name: supply.name })}
                </div>
                ${supply.before
                  ? html`<div class="sub">
                      ${this._t(
                        supply.before > 0
                          ? "supply_before"
                          : "supply_after_valves",
                        { time: seconds(supply.before) },
                      )}
                    </div>`
                  : nothing}
              </div>`,
        )}
        ${flow.steps.map(
          (step, n) => html`
            ${this._arrow(
              n === 0
                ? undefined
                : (flow.steps[n - 1].waitAfter ?? 0) > 0
                  ? this._t("wait", {
                      time: seconds(flow.steps[n - 1].waitAfter ?? 0),
                    })
                  : (flow.steps[n - 1].waitAfter ?? 0) < 0
                    ? this._t("overlap", {
                        time: seconds(flow.steps[n - 1].waitAfter ?? 0),
                      })
                    : undefined,
            )}
            <div class="step">
              <div class="step-head">
                <span
                  >${this._t("step", { n: String(n + 1) })}${step.zones.length >
                  1
                    ? ` · ${this._t("together")}`
                    : ""}</span
                >
                ${Math.max(...step.zones.map((z) => z.passes)) > 1
                  ? html`<span
                      >${this._t("passes", {
                        n: String(Math.max(...step.zones.map((z) => z.passes))),
                      })}</span
                    >`
                  : nothing}
              </div>
              <div class="valves">
                ${step.zones.map(
                  (zone) => html`
                    <button
                      class="node valve"
                      @click=${() => this._openZone(zone.zoneId)}
                    >
                      <div class="title">${zone.name}</div>
                      <div class="sub">${friendlyDuration(zone.seconds)}</div>
                    </button>
                  `,
                )}
              </div>
              ${step.soakSeconds
                ? html`<div class="note">
                    ↻ ${this._t("soak", { time: seconds(step.soakSeconds) })}
                  </div>`
                : nothing}
            </div>
          `,
        )}
        ${flow.idle.length
          ? html`${flow.steps.length ? nothing : this._arrow()}
              <div class="step idle">
                <div class="step-head">
                  <span>${this._t("idle")}</span>
                </div>
                <div class="valves">
                  ${flow.idle.map(
                    (zone) => html`
                      <button
                        class="node valve"
                        @click=${() => this._openZone(zone.zoneId)}
                      >
                        <div class="title">${zone.name}</div>
                        <div class="sub">${this._t("no_water")}</div>
                      </button>
                    `,
                  )}
                </div>
              </div>`
          : nothing}
        ${flow.tours > 1
          ? html`<div class="note loop">
              ↻ ${this._t("tours", { n: String(flow.tours) })}
            </div>`
          : nothing}
        ${flow.supplies.map(
          (supply) =>
            html`${this._arrow()}
              <div class="node supply">
                <div class="title">
                  ${this._t("supply_off", { name: supply.name })}
                </div>
                ${supply.after
                  ? html`<div class="sub">
                      ${this._t("supply_after", {
                        time: seconds(supply.after),
                      })}
                    </div>`
                  : nothing}
              </div>`,
        )}
        ${this.notify
          ? html`${this._arrow()}
              <div class="node end">
                <div class="title">${this._t("notify")}</div>
              </div>`
          : nothing}
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
    .flow {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .node {
      box-sizing: border-box;
      min-width: 180px;
      max-width: 100%;
      padding: 8px 14px;
      border-radius: 8px;
      border: 1px solid var(--divider-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
      text-align: center;
      font: inherit;
      color: var(--primary-text-color);
    }
    .title {
      font-weight: 500;
    }
    .sub {
      font-size: 0.85em;
      color: var(--secondary-text-color);
    }
    .weather.yes {
      border-color: var(--success-color, #43a047);
    }
    .weather.yes .sub {
      color: var(--success-color, #43a047);
    }
    .weather.yes.unread {
      border-color: var(--warning-color, #ffa600);
    }
    .weather.yes.unread .sub {
      color: var(--warning-color, #ffa600);
    }
    .weather.no {
      border-color: var(--error-color, #db4437);
    }
    .weather.no .sub {
      color: var(--error-color, #db4437);
      font-weight: 500;
    }
    .supply {
      border-color: var(--success-color, #43a047);
    }
    .valve {
      border-color: var(--primary-color);
      cursor: pointer;
      min-width: 130px;
    }
    .valve:hover {
      box-shadow: 0 0 0 1px var(--primary-color);
    }
    .arrow {
      position: relative;
      width: 2px;
      height: 26px;
      background: var(--secondary-text-color);
      opacity: 0.6;
      margin-bottom: 6px;
    }
    .arrow::after {
      content: "";
      position: absolute;
      bottom: -6px;
      left: -4px;
      border: 5px solid transparent;
      border-top: 6px solid var(--secondary-text-color);
      border-bottom: 0;
    }
    .arrow-label {
      position: absolute;
      left: 10px;
      top: 4px;
      white-space: nowrap;
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
    .branch {
      position: relative;
      display: flex;
      justify-content: center;
    }
    .side {
      position: absolute;
      left: calc(100% + 12px);
      top: 50%;
      transform: translateY(-50%);
      white-space: nowrap;
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
    .side::before {
      content: "⇢ ";
    }
    .step {
      box-sizing: border-box;
      width: min(100%, 520px);
      padding: 8px 12px 10px;
      border: 1px dashed var(--divider-color);
      border-radius: 12px;
    }
    .step-head {
      display: flex;
      justify-content: space-between;
      font-size: 0.85em;
      color: var(--secondary-text-color);
      margin-bottom: 6px;
    }
    .valves {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }
    .note {
      margin-top: 6px;
      text-align: center;
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
    .loop {
      margin-top: 8px;
    }
    .idle {
      margin-top: 10px;
      opacity: 0.55;
    }
    @media (max-width: 500px) {
      .side {
        position: static;
        transform: none;
        margin-left: 8px;
        align-self: center;
      }
      .branch {
        flex-wrap: wrap;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "si-program-flow": SmartIrrigationProgramFlow;
  }
}
