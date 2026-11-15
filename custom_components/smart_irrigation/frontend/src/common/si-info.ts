import { mdiInformationOutline } from "@mdi/js";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

/**
 * A round "i" beside a title or a label: what it means, read on hover, on
 * focus, or with a tap on a phone. The panel used to print every explanation
 * under its setting, and read like a manual.
 */
@customElement("si-info")
export class SiInfo extends LitElement {
  @state() private _open = false;

  private _close = (e: Event) => {
    if (!e.composedPath().includes(this)) this._open = false;
  };

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("click", this._close, true);
  }

  disconnectedCallback(): void {
    document.removeEventListener("click", this._close, true);
    super.disconnectedCallback();
  }

  render() {
    return html`<span
        class="i"
        tabindex="0"
        role="button"
        aria-label="?"
        @click=${(e: Event) => {
          // Inside a fold's summary or a label: the tap is for the bubble.
          e.preventDefault();
          e.stopPropagation();
          this._open = !this._open;
        }}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this._open = !this._open;
          } else if (e.key === "Escape") this._open = false;
        }}
        ><ha-svg-icon .path=${mdiInformationOutline}></ha-svg-icon></span
      ><span class="tip ${this._open ? "open" : ""}" role="tooltip"
        ><slot></slot
      ></span>`;
  }

  static styles = css`
    :host {
      position: relative;
      display: inline-flex;
      vertical-align: middle;
      margin-inline-start: 4px;
      font-size: 0.875rem;
      font-weight: normal;
    }
    .i {
      display: inline-flex;
      color: var(--secondary-text-color);
      cursor: help;
      outline: none;
      border-radius: 50%;
    }
    .i:focus-visible {
      box-shadow: 0 0 0 2px var(--primary-color);
    }
    ha-svg-icon {
      --mdc-icon-size: 18px;
    }
    .tip {
      display: none;
      position: absolute;
      z-index: 20;
      top: calc(100% + 6px);
      inset-inline-start: -8px;
      width: max-content;
      max-width: min(340px, 75vw);
      padding: 8px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color, var(--primary-background-color));
      color: var(--primary-text-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      line-height: 1.4;
      white-space: normal;
      text-align: start;
    }
    :host(:hover) .tip,
    .tip.open {
      display: block;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "si-info": SiInfo;
  }
}
