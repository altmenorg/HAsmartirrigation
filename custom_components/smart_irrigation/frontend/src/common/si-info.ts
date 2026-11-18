import { mdiInformationOutline } from "@mdi/js";
import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";

import { MARGIN, placeTip } from "./tip-place";

/**
 * A round "i" beside a title or a label: what it means, read on hover, on
 * focus, or with a tap on a phone. The panel used to print every explanation
 * under its setting, and read like a manual.
 *
 * The bubble is placed on the screen (position: fixed), from the icon: inside
 * a card that clips its content, or near the edge of a phone, it was cut off
 * or pushed the page sideways (#1047).
 */
@customElement("si-info")
export class SiInfo extends LitElement {
  // Opened by a tap, a click or the keyboard: stays until closed.
  @state() private _open = false;
  // Under a mouse, or focused from the keyboard.
  @state() private _hover = false;
  @state() private _focus = false;

  @query(".i") private _icon?: HTMLElement;
  @query(".tip") private _tip?: HTMLElement;

  private get _shown(): boolean {
    return this._open || this._hover || this._focus;
  }

  private _close = (e: Event) => {
    if (!e.composedPath().includes(this)) this._open = false;
  };

  // A page that scrolls or turns moves the icon: the bubble follows it.
  private _follow = () => {
    if (this._shown) this._place();
  };

  // A mouse over the icon or the bubble (a link in it can be reached). A
  // finger taps instead: its "hover" would stay after the bubble is closed.
  private _enter = (e: PointerEvent) => {
    if (e.pointerType === "mouse") this._hover = true;
  };

  private _leave = (e: PointerEvent) => {
    if (e.pointerType === "mouse") this._hover = false;
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener("pointerenter", this._enter);
    this.addEventListener("pointerleave", this._leave);
    document.addEventListener("click", this._close, true);
    window.addEventListener("scroll", this._follow, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", this._follow, { passive: true });
  }

  disconnectedCallback(): void {
    this.removeEventListener("pointerenter", this._enter);
    this.removeEventListener("pointerleave", this._leave);
    document.removeEventListener("click", this._close, true);
    window.removeEventListener("scroll", this._follow, { capture: true });
    window.removeEventListener("resize", this._follow);
    super.disconnectedCallback();
  }

  protected updated(): void {
    if (this._shown) this._place();
  }

  private _place(): void {
    const tip = this._tip;
    const icon = this._icon;
    if (!tip || !icon) return;
    const width = document.documentElement.clientWidth || window.innerWidth;
    const height = window.innerHeight;
    tip.style.maxWidth = `${Math.max(0, Math.min(340, width - 2 * MARGIN))}px`;
    // Where a fixed box at 0, 0 really lands: not the screen's corner when a
    // parent has a transform (a dialog), so the offset is measured.
    tip.style.left = "0px";
    tip.style.top = "0px";
    const origin = tip.getBoundingClientRect();
    const { x, y } = placeTip(
      icon.getBoundingClientRect(),
      { width: origin.width, height: origin.height },
      { width, height },
      getComputedStyle(this).direction === "rtl",
    );
    tip.style.left = `${x - origin.left}px`;
    tip.style.top = `${y - origin.top}px`;
  }

  render() {
    return html`<span
        class="i"
        tabindex="0"
        role="button"
        aria-label="?"
        @focus=${() => {
          // From the keyboard only: a tap focuses too, and toggles below.
          this._focus = !!this._icon?.matches(":focus-visible");
        }}
        @blur=${() => {
          this._focus = false;
        }}
        @click=${(e: Event) => {
          // Inside a fold's summary or a label: the tap is for the bubble.
          e.preventDefault();
          e.stopPropagation();
          this._open = !this._open;
          if (!this._open) this._focus = false;
        }}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this._open = !this._open;
            if (!this._open) this._focus = false;
          } else if (e.key === "Escape") {
            this._open = false;
            this._focus = false;
          }
        }}
        ><ha-svg-icon .path=${mdiInformationOutline}></ha-svg-icon></span
      ><span class="tip ${this._shown ? "open" : ""}" role="tooltip"
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
      position: fixed;
      z-index: 20;
      left: 0;
      top: 0;
      box-sizing: border-box;
      width: max-content;
      max-width: min(340px, calc(100vw - 16px));
      padding: 8px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      background: var(--card-background-color, var(--primary-background-color));
      color: var(--primary-text-color);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      line-height: 1.4;
      white-space: normal;
      overflow-wrap: anywhere;
      text-align: start;
    }
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
