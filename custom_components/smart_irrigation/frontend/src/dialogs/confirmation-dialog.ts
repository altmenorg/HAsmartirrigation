import { LitElement, html, css, CSSResultGroup } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";

export interface ConfirmationOptions {
  /** The question, in the user's language. */
  text: string;
  /** The label of the button that goes ahead; Home Assistant's OK by default. */
  confirmText?: string;
  /** A red confirm button, for what cannot be undone. */
  destructive?: boolean;
  /** A number to ask with the question; empty is allowed. */
  number?: {
    label: string;
    unit?: string;
    placeholder?: string;
    min?: number;
    max?: number;
  };
}

/**
 * Asks before something that opens valves or deletes, in a Home Assistant
 * dialog rather than the browser's own box, which looked foreign in the panel
 * and froze the page while it waited.
 */
@customElement("smart-irrigation-confirmation-dialog")
export class ConfirmationDialog extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private _options?: ConfirmationOptions;
  private _resolve?: (answer: boolean) => void;
  /** What was typed in the number field, "" when nothing. */
  public value = "";

  public showDialog(options: ConfirmationOptions): Promise<boolean> {
    this._options = options;
    this.value = "";
    return new Promise((resolve) => (this._resolve = resolve));
  }

  private _answer(answer: boolean) {
    // Closing the dialog also fires "closed": only the first answer counts.
    const resolve = this._resolve;
    this._resolve = undefined;
    this._options = undefined;
    resolve?.(answer);
  }

  render() {
    if (!this._options) return html``;
    const t = (key: string, fallback: string) =>
      this.hass?.localize?.(key) || fallback;
    return html`
      <ha-dialog
        open
        .heading=${t(
          "ui.dialogs.generic.default_confirmation_title",
          "Are you sure?",
        )}
        @closed=${(ev: Event) => {
          // Nested overlays fire "closed" too; only the dialog's own counts.
          if ((ev.target as Element)?.tagName?.toLowerCase() === "ha-dialog")
            this._answer(false);
        }}
      >
        <div class="text">${this._options.text}</div>
        ${this._options.number
          ? html`
              <label class="number">
                <span>${this._options.number.label}</span>
                <span class="field">
                  <input
                    type="number"
                    inputmode="decimal"
                    .placeholder=${this._options.number.placeholder ?? ""}
                    min=${this._options.number.min ?? ""}
                    max=${this._options.number.max ?? ""}
                    @input=${(ev: Event) =>
                      (this.value = (ev.target as HTMLInputElement).value)}
                  />
                  ${this._options.number.unit
                    ? html`<span class="unit"
                        >${this._options.number.unit}</span
                      >`
                    : ""}
                </span>
              </label>
            `
          : ""}
        <ha-dialog-footer slot="footer">
          <ha-button
            slot="secondaryAction"
            appearance="plain"
            @click=${() => this._answer(false)}
          >
            ${t("ui.common.cancel", "Cancel")}
          </ha-button>
          <ha-button
            slot="primaryAction"
            appearance="accent"
            variant=${this._options.destructive ? "danger" : "brand"}
            @click=${() => this._answer(true)}
          >
            ${this._options.confirmText || t("ui.dialogs.generic.ok", "OK")}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      .text {
        color: var(--primary-text-color);
        white-space: pre-line;
      }
      .number {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-top: 16px;
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      .number .field {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .number input {
        flex: 1;
        min-width: 0;
        padding: 10px 12px;
        font: inherit;
        font-size: 1rem;
        color: var(--primary-text-color);
        background: var(--secondary-background-color, transparent);
        border: none;
        border-bottom: 1px solid var(--secondary-text-color);
        border-radius: 4px 4px 0 0;
      }
      .number input:focus {
        outline: none;
        border-bottom: 2px solid var(--primary-color);
      }
      .number .unit {
        color: var(--secondary-text-color);
      }
    `;
  }
}

/**
 * Asks the user and resolves to their answer: true to go ahead.
 *
 * The dialog lives on the document body, as the trigger dialog does, so it is
 * the same wherever in the panel it is asked from.
 */
export async function askConfirmation(
  hass: HomeAssistant | undefined,
  options: ConfirmationOptions,
): Promise<boolean> {
  const dialog = document.createElement(
    "smart-irrigation-confirmation-dialog",
  ) as ConfirmationDialog;
  dialog.hass = hass as HomeAssistant;
  document.body.appendChild(dialog);
  try {
    return await dialog.showDialog(options);
  } finally {
    dialog.remove();
  }
}

/**
 * Asks a question with a number field: the number typed (NaN when left
 * empty) to go ahead, null to cancel.
 */
export async function askNumber(
  hass: HomeAssistant | undefined,
  options: ConfirmationOptions & {
    number: NonNullable<ConfirmationOptions["number"]>;
  },
): Promise<number | null> {
  const dialog = document.createElement(
    "smart-irrigation-confirmation-dialog",
  ) as ConfirmationDialog;
  dialog.hass = hass as HomeAssistant;
  document.body.appendChild(dialog);
  try {
    const go = await dialog.showDialog(options);
    if (!go) return null;
    return dialog.value.trim() === "" ? NaN : Number(dialog.value);
  } finally {
    dialog.remove();
  }
}
