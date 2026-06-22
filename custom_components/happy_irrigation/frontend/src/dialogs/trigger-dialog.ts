import { LitElement, html, css, CSSResultGroup } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { mdiClose } from "@mdi/js";
import { localize } from "../../localize/localize";
import { IrrigationStartTrigger, TriggerType } from "../types";
import { dialogStyle } from "../styles/global-style";
import {
  TRIGGER_TYPE_SUNRISE,
  TRIGGER_TYPE_SUNSET,
  TRIGGER_TYPE_SOLAR_AZIMUTH,
  TRIGGER_CONF_TYPE,
  TRIGGER_CONF_NAME,
  TRIGGER_CONF_ENABLED,
  TRIGGER_CONF_OFFSET_MINUTES,
  TRIGGER_CONF_AZIMUTH_ANGLE,
  TRIGGER_CONF_ACCOUNT_FOR_DURATION,
} from "../const";

export interface TriggerDialogParams {
  trigger?: IrrigationStartTrigger;
  createTrigger?: boolean;
  triggerIndex?: number;
}

@customElement("happy-irrigation-trigger-dialog")
export class TriggerDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  //@state() private _params?: TriggerDialogParams;
  @property({ attribute: false }) public params?: TriggerDialogParams;
  @state() private _trigger?: IrrigationStartTrigger;

  /*public async showDialog(params: TriggerDialogParams): Promise<void> {
    this._params = params;

    // Initialize trigger data
    if (params.createTrigger) {
      this._trigger = {
        type: TRIGGER_TYPE_SUNRISE,
        name: "",
        enabled: true,
        offset_minutes: 0,
        azimuth_angle: 90,
        account_for_duration: true,
      };
    } else if (params.trigger) {
      this._trigger = { ...params.trigger };
    }

    await this.updateComplete;
  }
  */

  public async showDialog(params: TriggerDialogParams): Promise<void> {
    this.params = params;

    if (params.createTrigger) {
      this._trigger = {
        type: TRIGGER_TYPE_SUNRISE,
        name: "",
        enabled: true,
        offset_minutes: 0,
        azimuth_angle: 90,
        account_for_duration: true,
      };
    } else if (params.trigger) {
      // Defensive: fill in missing fields for editing
      const t = params.trigger;
      this._trigger =
        t.type === TRIGGER_TYPE_SOLAR_AZIMUTH
          ? {
              type: t.type,
              name: t.name ?? "",
              enabled: t.enabled ?? true,
              offset_minutes: t.offset_minutes ?? 0,
              azimuth_angle: t.azimuth_angle ?? 90,
              account_for_duration: t.account_for_duration ?? true,
            }
          : {
              type: t.type,
              name: t.name ?? "",
              enabled: t.enabled ?? true,
              offset_minutes: t.offset_minutes ?? 0,
              account_for_duration: t.account_for_duration ?? true,
            };
    } else {
      this._trigger = undefined;
    }

    await this.updateComplete;
  }

  private _closeDialog() {
    this.params = undefined;
    this._trigger = undefined;
  }

  private _saveTrigger() {
    if (!this._trigger || !this.params) return;

    // Ensure select value is captured (guards against event-order/race conditions)
    const sel = this.shadowRoot?.querySelector("ha-select") as any | null;
    if (sel) {
      const selValue = sel.value ?? (sel as any).selected ?? undefined;
      if (selValue && selValue !== this._trigger.type) {
        // preserve fields sensibly when switching types
        if (selValue === TRIGGER_TYPE_SOLAR_AZIMUTH) {
          this._trigger = {
            ...this._trigger,
            type: selValue,
            azimuth_angle: this._trigger.azimuth_angle ?? 90,
          };
        } else {
          // remove azimuth when switching away from azimuth type
          const { azimuth_angle, ...rest } = this._trigger as any;
          this._trigger = {
            ...rest,
            type: selValue,
          } as IrrigationStartTrigger;
        }
        this.requestUpdate();
      }
    }

    // Validate trigger data
    if (!this._trigger.name?.trim()) {
      alert(
        localize(
          "irrigation_start_triggers.validation.name_required",
          this.hass.language,
        ),
      );
      return;
    }

    if (this._trigger.type === TRIGGER_TYPE_SOLAR_AZIMUTH) {
      if (
        this._trigger.azimuth_angle === undefined ||
        isNaN(this._trigger.azimuth_angle)
      ) {
        alert(
          localize(
            "irrigation_start_triggers.validation.azimuth_invalid",
            this.hass.language,
          ),
        );
        return;
      }
      // Normalize azimuth angle to 0-360 range for display purposes
      this._trigger.azimuth_angle = this._trigger.azimuth_angle % 360;
      if (this._trigger.azimuth_angle < 0) {
        this._trigger.azimuth_angle += 360;
      }
    }
    this.dispatchEvent(
      new CustomEvent("trigger-save", {
        detail: {
          trigger: this._trigger,
          isNew: this.params!.createTrigger,
          index: this.params!.triggerIndex,
        },
        bubbles: true,
        composed: true,
      }),
    );

    this._closeDialog();
  }

  private _deleteTrigger() {
    if (!this.params || this.params.createTrigger) return;

    // Dispatch delete event
    this.dispatchEvent(
      new CustomEvent("trigger-delete", {
        detail: {
          index: this.params.triggerIndex,
        },
        bubbles: true,
        composed: true,
      }),
    );

    this._closeDialog();
  }

  private _updateTrigger(changes: Partial<IrrigationStartTrigger>) {
    if (!this._trigger) {
      // Defensive: if _trigger is missing, do nothing
      console.warn("_updateTrigger called with undefined _trigger", changes);
      return;
    }
    this._trigger = { ...this._trigger, ...changes };
    this.requestUpdate();
  }

  render() {
    if (!this.params || !this._trigger) return html``;

    const isCreate = this.params.createTrigger;
    const title = isCreate
      ? localize(
          "irrigation_start_triggers.dialog.add_title",
          this.hass.language,
        )
      : localize(
          "irrigation_start_triggers.dialog.edit_title",
          this.hass.language,
        );

    return html`
      <ha-dialog open .heading=${true}>
        <div slot="heading" class="dialog-header-bar">
          <ha-icon-button
            dialogAction="cancel"
            .path=${mdiClose}
            class="dialog-close"
          ></ha-icon-button>
          <span class="dialog-header">${title}</span>
        </div>

        <div class="wrapper">
          <div class="dialog-help">
            ${localize(
              "irrigation_start_triggers.dialog.help",
              this.hass.language,
            )}
            <code>happy_irrigation_start_irrigation_all_zones</code>
          </div>
          <div class="form-group">
            <label class="form-label"
              >${localize(
                "irrigation_start_triggers.fields.name.name",
                this.hass.language,
              )}</label
            >
            <input
              class="form-input"
              type="text"
              .value=${this._trigger.name || ""}
              @input=${this._nameChanged}
              required
            />
          </div>

          <div class="form-group">
            <ha-select
              .label=${localize(
                "irrigation_start_triggers.fields.type.name",
                this.hass.language,
              )}
              .value=${this._trigger.type}
              @selected=${this._typeChanged}
            >
              <ha-dropdown-item value=${TRIGGER_TYPE_SUNRISE}>
                ${localize(
                  "irrigation_start_triggers.trigger_types.sunrise",
                  this.hass.language,
                )}
              </ha-dropdown-item>
              <ha-dropdown-item value=${TRIGGER_TYPE_SUNSET}>
                ${localize(
                  "irrigation_start_triggers.trigger_types.sunset",
                  this.hass.language,
                )}
              </ha-dropdown-item>
              <ha-dropdown-item value=${TRIGGER_TYPE_SOLAR_AZIMUTH}>
                ${localize(
                  "irrigation_start_triggers.trigger_types.solar_azimuth",
                  this.hass.language,
                )}
              </ha-dropdown-item>
            </ha-select>
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${localize(
                "irrigation_start_triggers.fields.enabled.name",
                this.hass.language,
              )}
            >
              <ha-switch
                .checked=${this._trigger.enabled}
                @change=${this._enabledChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          <div class="form-group">
            <label class="form-label"
              >${localize(
                "irrigation_start_triggers.fields.offset_minutes.name",
                this.hass.language,
              )}</label
            >
            <input
              class="form-input"
              type="number"
              .value=${this._trigger.offset_minutes?.toString() || "0"}
              min="-1440"
              max="1440"
              step="1"
              @input=${this._offsetChanged}
            />
          </div>

          <div class="form-group">
            <ha-formfield
              .label=${localize(
                "irrigation_start_triggers.fields.account_for_duration.name",
                this.hass.language,
              )}
            >
              <ha-switch
                .checked=${this._trigger.account_for_duration}
                @change=${this._accountForDurationChanged}
              ></ha-switch>
            </ha-formfield>
          </div>

          ${this._trigger.type === TRIGGER_TYPE_SOLAR_AZIMUTH
            ? html`
                <div class="form-group">
                  <label class="form-label"
                    >${localize(
                      "irrigation_start_triggers.fields.azimuth_angle.name",
                      this.hass.language,
                    )}</label
                  >
                  <input
                    class="form-input"
                    type="number"
                    .value=${this._trigger.azimuth_angle?.toString() || "90"}
                    min="0"
                    max="359"
                    step="1"
                    @input=${this._azimuthChanged}
                  />
                </div>
              `
            : ""}
        </div>

        <ha-dialog-footer slot="footer">
          <ha-button
            slot="secondaryAction"
            appearance="plain"
            @click=${this._closeDialog}
          >
            ${localize(
              "irrigation_start_triggers.dialog.cancel",
              this.hass.language,
            )}
          </ha-button>
          ${!isCreate
            ? html`
                <ha-button
                  slot="secondaryAction"
                  appearance="plain"
                  variant="danger"
                  @click=${this._deleteTrigger}
                >
                  ${localize(
                    "irrigation_start_triggers.dialog.delete",
                    this.hass.language,
                  )}
                </ha-button>
              `
            : ""}
          <ha-button
            slot="primaryAction"
            appearance="accent"
            @click=${this._saveTrigger}
          >
            ${localize(
              "irrigation_start_triggers.dialog.save",
              this.hass.language,
            )}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `;
  }

  private _nameChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this._updateTrigger({ name: target.value });
  }

  private _typeChanged(event: CustomEvent) {
    // Accept value from event detail, event target, or the rendered ha-select as fallback
    const maybeValue =
      event?.detail?.value ??
      (event.target as any)?.value ??
      (this.shadowRoot?.querySelector("ha-select") as any)?.value;
    const newType = String(maybeValue) as TriggerType;

    let newTrigger: IrrigationStartTrigger;

    if (newType === TRIGGER_TYPE_SOLAR_AZIMUTH) {
      newTrigger = {
        type: TRIGGER_TYPE_SOLAR_AZIMUTH,
        name: this._trigger?.name ?? "",
        enabled: this._trigger?.enabled ?? true,
        offset_minutes: this._trigger?.offset_minutes ?? 0,
        azimuth_angle: this._trigger?.azimuth_angle ?? 90,
        account_for_duration: this._trigger?.account_for_duration ?? true,
      };
    } else {
      newTrigger = {
        type: newType,
        name: this._trigger?.name ?? "",
        enabled: this._trigger?.enabled ?? true,
        offset_minutes: this._trigger?.offset_minutes ?? 0,
        account_for_duration: this._trigger?.account_for_duration ?? true,
      };
    }

    this._trigger = newTrigger;
    this.requestUpdate();
  }

  private _enabledChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this._updateTrigger({ enabled: target.checked });
  }

  private _offsetChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this._updateTrigger({ offset_minutes: parseInt(target.value) || 0 });
  }

  private _accountForDurationChanged(event: Event) {
    const target = event.target as HTMLInputElement;
    this._updateTrigger({ account_for_duration: target.checked });
  }

  private _azimuthChanged(event: Event) {
    if (this._trigger?.type !== TRIGGER_TYPE_SOLAR_AZIMUTH) return;
    const target = event.target as HTMLInputElement;
    let value = parseInt(target.value, 10);
    if (isNaN(value)) value = 90;
    this._updateTrigger({ azimuth_angle: value });
  }

  static get styles(): CSSResultGroup {
    return [
      dialogStyle,
      css`
        .wrapper {
          color: var(--primary-text-color);
        }

        .warning {
          --mdc-theme-primary: var(--error-color);
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        ha-select {
          width: 100%;
        }

        /* native text inputs (ha-textfield isn't reliably registered in this
           dialog on HA 2026.3+, so we use the same .field look as the views) */
        .form-label {
          display: block;
          color: var(--primary-text-color);
          font-weight: 500;
          margin-bottom: 4px;
        }
        .form-input {
          width: 100%;
          height: 44px;
          box-sizing: border-box;
          padding: 0 12px;
          border: none;
          border-bottom: 1px solid
            var(--mdc-text-field-idle-line-color, rgba(0, 0, 0, 0.42));
          border-radius: 4px 4px 0 0;
          background: var(
            --mdc-text-field-fill-color,
            var(--input-fill-color, rgba(0, 0, 0, 0.04))
          );
          color: var(--primary-text-color);
          font-size: 1rem;
        }
        .form-input:focus {
          outline: none;
          border-bottom: 2px solid var(--primary-color);
        }
        .dialog-help {
          margin-bottom: 16px;
          color: var(--secondary-text-color);
          font-size: 0.9em;
          line-height: 1.5;
        }
        .dialog-help code {
          font-family: var(--ha-font-family-code, monospace);
          background: var(--secondary-background-color);
          padding: 1px 6px;
          border-radius: 4px;
          color: var(--primary-text-color);
          white-space: nowrap;
        }

        ha-formfield {
          width: 100%;
        }
        .dialog-header-bar {
          display: flex;
          align-items: center;
          padding: 0 24px 0 8px;
          min-height: 56px;
          border-bottom: 1px solid var(--divider-color, #e0e0e0);
          background: var(
            --dialog-header-background,
            var(--card-background-color)
          );
        }
        .dialog-header {
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--primary-text-color);
          flex: 1;
          text-align: left;
          margin-left: 8px;
        }
        .dialog-close {
          margin-right: 8px;
        }
      `,
    ];
  }
}
