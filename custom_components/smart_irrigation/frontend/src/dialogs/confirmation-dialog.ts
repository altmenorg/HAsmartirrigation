import { LitElement, html, css, CSSResultGroup } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { mdiClose } from "@mdi/js";

@customElement("confirmation-dialog")
export class ConfirmationDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _params?: any;
  private _target?: any;

  public async showDialog(params: any): Promise<void> {
    console.log("showdialog params: " + params);

    this._target = params["target"];
    this._params = params;
    await this.updateComplete;
  }

  public async confirmAction() {
    this.dispatchEvent(new CustomEvent("confirmAction", this._params));
    this._params = undefined;
  }
  public async cancelAction() {
    this._params = undefined;
  }

  render() {
    if (!this._params) return html``;
    return html`
      <ha-dialog
        open
        .heading=${true}
        @closed=${this.cancelAction}
        @close-dialog=${this.cancelAction}
      >
        <div slot="heading">
          <ha-header-bar>
            <ha-icon-button
              slot="navigationIcon"
              dialogAction="cancel"
              .path=${mdiClose}
            ></ha-icon-button>
            <span class="dialog-header" slot="title">
              ${this.hass.localize("dialogs.confirmation.title")}
            </span>
          </ha-header-bar>
        </div>
        <div class="wrapper">${this._params.message || ""}</div>

        <ha-dialog-footer slot="footer">
          <ha-button
            slot="secondaryAction"
            appearance="plain"
            @click=${this.cancelAction}
            dialogAction="cancel"
          >
            ${this.hass.localize("dialogs.generic.cancel")}
          </ha-button>
          <ha-button
            slot="primaryAction"
            appearance="accent"
            @click=${this.confirmAction}
            dialogAction="close"
          >
            ${this.hass.localize("dialogs.generic.ok")}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      div.wrapper {
        color: var(--primary-text-color);
      }
    `;
  }
}
