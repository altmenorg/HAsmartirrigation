import {
  TemplateResult,
  LitElement,
  PropertyValues,
  html,
  css,
  CSSResultGroup,
} from "lit";
import { property, state, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import {
  IuImportStatus,
  iuImportCutover,
  iuImportStatus,
} from "../../data/websockets";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { localize } from "../../../localize/localize";
import { askConfirmation } from "../../dialogs/confirmation-dialog";
import { navigate } from "../../helpers";
import { exportPath } from "../../common/navigation";

/**
 * Who waters, Irrigation Unlimited or the imported programs, and the switch
 * between them (#946).
 *
 * After an import IU goes on watering and the imported schedules are off. The
 * cut-over switches IU's controllers that are on, off, and the schedules IU had
 * on, on; it can be undone. Who waters is what the backend reads from what is
 * on, so a controller IU switches on again shows here as soon as its state
 * changes. Below it, what still uses IU: automations and scripts to change or
 * remove, with a link to each.
 */
@customElement("smart-irrigation-iu-cutover")
export class SmartIrrigationIuCutover extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;

  @state() private status?: IuImportStatus;
  @state() private busy = false;
  @state() private error?: string;
  /** Programs the last switch left off, as IU had them off. */
  @state() private leftOff: string[] = [];

  firstUpdated(): void {
    this.reload().catch((e) => console.error("IU cut-over: load failed", e));
  }

  updated(changed: PropertyValues): void {
    // IU switched a controller on or off (by hand, or after a restart): read
    // who waters again.
    if (!changed.has("hass") || !this.status || this.busy) return;
    const moved = this.status.controllers.some((c) => {
      const enabled = this.hass?.states[c.entity_id]?.attributes?.enabled;
      return typeof enabled === "boolean" && enabled !== c.enabled;
    });
    if (moved) this.reload();
  }

  /** Read the state again: after an import, or a switch. */
  public async reload(): Promise<void> {
    if (!this.hass) return;
    try {
      this.status = await iuImportStatus(this.hass);
    } catch (e) {
      this.error = this.errorText(e);
    }
  }

  private get lng(): string {
    return this.hass?.language ?? "en";
  }

  private t = (key: string, ...args: any[]): string =>
    localize(`panels.iu_import.cutover.${key}`, this.lng, ...args);

  private errorText(e: unknown): string {
    const code = (e as any)?.code;
    const known = code ? this.t(`errors.${code}`) : undefined;
    if (known && !known.startsWith("Translation")) return known;
    return (e as any)?.message ?? this.t("errors.generic");
  }

  private when(iso: string | null): string {
    return iso ? new Date(iso).toLocaleString(this.lng) : "";
  }

  private async switchTo(
    to: "smart_irrigation" | "irrigation_unlimited",
  ): Promise<void> {
    if (!this.hass || this.busy) return;
    const ok = await askConfirmation(this.hass, {
      text: this.t(to === "smart_irrigation" ? "confirm-over" : "confirm-back"),
      confirmText: this.t(to === "smart_irrigation" ? "over" : "back"),
    });
    if (!ok) return;
    this.busy = true;
    this.error = undefined;
    this.leftOff = [];
    try {
      const result = await iuImportCutover(this.hass, to);
      const names = new Map(
        (this.status?.programs ?? []).map((p) => [p.id, p.name]),
      );
      this.leftOff = (result.left_off ?? []).map((id) => names.get(id) ?? id);
    } catch (e) {
      this.error = this.errorText(e);
    } finally {
      this.busy = false;
      await this.reload();
    }
  }

  private who(status: IuImportStatus): string {
    switch (status.waters) {
      case "smart_irrigation":
        return status.switched_at
          ? this.t("si-waters", "at", this.when(status.switched_at))
          : this.t("si-waters-now");
      case "both":
        return this.t("both-on");
      case "none":
        return this.t("nobody-waters");
      default:
        return this.t("iu-waters");
    }
  }

  render(): TemplateResult {
    const status = this.status;
    if (!this.hass) return html``;
    if (!status) {
      // The status could not be read: say so rather than show nothing.
      return this.error
        ? html`<ha-card header="${this.t("title")}"
            ><div class="card-content">
              <div class="error" role="alert">${this.error}</div>
            </div></ha-card
          >`
        : html``;
    }
    if (!status.imported) return html``;
    return html`
      <ha-card header="${this.t("title")}">
        <div class="card-content">
          <div
            class="who ${status.waters}"
            role=${status.both_on ? "alert" : "status"}
          >
            ${this.who(status)}
          </div>
          ${this.leftOff.length
            ? html`<div class="notice">
                ${this.t("left-off", "names", this.leftOff.join(", "))}
              </div>`
            : ""}
          ${!status.full_controller
            ? html`<div class="notice">${this.t("full-controller-off")}</div>`
            : ""}
          ${this.renderPrograms(status)}
          ${status.zones_off_in_iu?.length
            ? html`<div class="notice">
                ${this.t(
                  "zones-off",
                  "list",
                  status.zones_off_in_iu
                    .map((z) => `${z.zone} (${z.program})`)
                    .join(", "),
                )}
              </div>`
            : ""}
          ${this.renderControllers(status)}
          <div role="alert">
            ${this.error ? html`<div class="error">${this.error}</div>` : ""}
          </div>
          <div class="si-form-actions">
            ${status.switched_over
              ? html`<ha-button
                    appearance="plain"
                    ?disabled=${this.busy || !status.iu_running}
                    @click=${() => this.switchTo("irrigation_unlimited")}
                    >${this.t("back")}</ha-button
                  >
                  ${status.both_on
                    ? html`<ha-button
                        appearance="filled"
                        ?disabled=${this.busy}
                        @click=${() => this.switchTo("smart_irrigation")}
                        >${this.t("iu-off-again")}</ha-button
                      >`
                    : ""}`
              : html`<ha-button
                  appearance="filled"
                  ?disabled=${this.busy || !status.full_controller}
                  @click=${() => this.switchTo("smart_irrigation")}
                  >${this.t("over")}</ha-button
                >`}
          </div>
        </div>
      </ha-card>
      ${this.renderFollowUps(status)}
    `;
  }

  private renderPrograms(status: IuImportStatus): TemplateResult {
    if (!status.programs.length) return html``;
    return html`
      <h3>${this.t("programs")}</h3>
      <ul class="lines">
        ${status.programs.map(
          (p) =>
            html`<li>
              ${p.name}:
              ${this.t("schedules-on", "on", p.on, "count", p.schedules)}
            </li>`,
        )}
      </ul>
      <div class="note">
        <a
          href="#"
          @click=${(e: Event) => {
            e.preventDefault();
            navigate(this, exportPath("programs"));
          }}
          >${this.t(
            status.switched_over ? "open-programs-after" : "open-programs",
          )}</a
        >
      </div>
    `;
  }

  private renderControllers(status: IuImportStatus): TemplateResult {
    return html`
      <h3>${this.t("controllers")}</h3>
      ${!status.iu_running
        ? html`<div class="note">${this.t("iu-not-running")}</div>`
        : ""}
      ${status.controllers.length
        ? html`<ul class="lines">
            ${status.controllers.map(
              (c) =>
                html`<li>
                  ${c.name}:
                  ${c.enabled === null
                    ? this.t("unknown")
                    : c.enabled
                      ? this.t("on")
                      : this.t("off")}
                </li>`,
            )}
          </ul>`
        : html`<div class="note">${this.t("no-controllers")}</div>`}
    `;
  }

  private renderFollowUps(status: IuImportStatus): TemplateResult {
    const list = status.follow_ups;
    return html`
      <ha-card header="${this.t("follow-ups.title")}">
        <div class="card-content">
          <div class="note">
            ${list.length
              ? this.t("follow-ups.help")
              : this.t("follow-ups.none")}
          </div>
          <div class="rows">
            ${list.map(
              (f) => html`
                <div class="row">
                  <div class="row-head">
                    <div class="row-title">
                      ${f.name ?? f.entity_id}
                      <span class="badge"
                        >${this.t(`follow-ups.${f.kind}`)}</span
                      >
                    </div>
                    ${f.edit
                      ? html`<a
                          href=${f.edit}
                          @click=${(e: Event) => {
                            e.preventDefault();
                            navigate(this, f.edit as string);
                          }}
                          >${this.t("follow-ups.edit")}</a
                        >`
                      : ""}
                  </div>
                  <div class="row-help">
                    ${f.adjust_time
                      ? this.t("follow-ups.adjust-time")
                      : this.t("follow-ups.uses", "uses", f.uses.join(", "))}
                  </div>
                </div>
              `,
            )}
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle} ${modernStyle}

      h3 {
        margin: 16px 0 4px;
        color: var(--primary-text-color);
      }
      .who {
        font-size: 1.05em;
        font-weight: 600;
        padding: 8px 12px;
        border-radius: 8px;
        border-left: 4px solid var(--primary-color);
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
      }
      .who.both,
      .who.none {
        border-left-color: var(--error-color, #b71c1c);
      }
      .note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin: 4px 0 8px;
      }
      .notice {
        border-left: 3px solid var(--warning-color, #ffa600);
        padding: 4px 8px;
        margin: 8px 0;
        color: var(--primary-text-color);
      }
      .error {
        color: var(--error-color, #b71c1c);
        margin-top: 8px;
      }
      ul.lines {
        margin: 4px 0;
        padding-left: 20px;
        color: var(--primary-text-color);
        line-height: 1.5;
        overflow-wrap: anywhere;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .row {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 10px 12px;
      }
      .row-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .row-title {
        font-weight: 600;
        color: var(--primary-text-color);
        overflow-wrap: anywhere;
      }
      .row-help {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 4px;
        overflow-wrap: anywhere;
      }
      .badge {
        font-size: 0.75em;
        font-weight: normal;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        padding: 1px 8px;
        margin-left: 6px;
        color: var(--secondary-text-color);
      }
      a {
        color: var(--primary-color);
      }
      .si-form-actions {
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }
      ha-card + ha-card {
        margin-top: 16px;
      }
    `;
  }
}
