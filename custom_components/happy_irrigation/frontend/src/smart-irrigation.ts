import { LitElement, html, CSSResultGroup, css } from "lit";
import { property, customElement } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { loadHaForm } from "./load-ha-elements";
import { navigate } from "./helpers";

import "./views/general/view-general.ts";
import "./views/zones/view-zones.ts";
import "./views/modules/view-modules.ts";
import "./views/mappings/view-mappings.ts";
import "./views/weatherservice/view-weatherservice.ts";
import "./views/backuprestore/view-backuprestore.ts";
import "./views/info/view-info.ts";

import { commonStyle } from "./styles";
import { VERSION, PLATFORM } from "./const";
import { localize } from "../localize/localize";
import { exportPath, getPath, Path } from "./common/navigation";

enum EMenuItems {
  Info = "info",
  General = "general",
  Zones = "zones",
  Modules = "modules",
  Mappings = "mappings",
  WeatherService = "weatherservice",
  BackupRestore = "backuprestore",
  Help = "help",
}

@customElement("happy-irrigation")
export class SmartIrrigationPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean, reflect: true }) public narrow!: boolean;

  private _updateScheduled = false;
  private _lastNavigationTime = 0;
  private _navigationThrottleDelay = 100; // Prevent too rapid navigation updates

  private _scheduleUpdate() {
    if (this._updateScheduled) return;
    this._updateScheduled = true;
    requestAnimationFrame(() => {
      this._updateScheduled = false;
      this.requestUpdate();
    });
  }

  async firstUpdated() {
    // Ensure we have a default route
    const path = getPath();
    if (
      !path.page ||
      !Object.values(EMenuItems).includes(path.page as EMenuItems)
    ) {
      navigate(this, exportPath(EMenuItems.General));
      return;
    }

    window.addEventListener("location-changed", () => {
      if (!window.location.pathname.includes(PLATFORM)) return;

      // Throttle navigation updates to prevent browser throttling
      const now = performance.now();
      if (now - this._lastNavigationTime < this._navigationThrottleDelay) {
        return; // Skip this update if too soon
      }
      this._lastNavigationTime = now;

      this._scheduleUpdate();
    });

    // Load HA form elements in background without blocking initial render
    loadHaForm()
      .then(() => {
        // Trigger re-render once HA elements are loaded for better UX
        this._scheduleUpdate();
      })
      .catch((error) => {
        console.error("Failed to load HA form elements:", error);
        // Still trigger update to show whatever we can
        this._scheduleUpdate();
      });
  }

  render() {
    const path = getPath();

    // Check what tab components are available
    const hasTabGroup = !!customElements.get("ha-tab-group");
    const hasTabGroupTab = !!customElements.get("ha-tab-group-tab");

    return html`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></ha-menu-button>
          <div class="main-title">${localize("title", this.hass.language)}</div>
          <div class="version">${VERSION}</div>
        </div>

        ${hasTabGroup && hasTabGroupTab
          ? html`
              <ha-tab-group @wa-tab-show=${this.handlePageSelected}>
                ${Object.values(EMenuItems).map(
                  (e) => html`
                    <ha-tab-group-tab
                      slot="nav"
                      panel="${e}"
                      .active=${path.page === e}
                    >
                      ${localize(`panels.${e}.title`, this.hass.language)}
                    </ha-tab-group-tab>
                  `,
                )}
              </ha-tab-group>
            `
          : html`
              <div class="custom-tabs">
                ${Object.values(EMenuItems).map(
                  (e) => html`
                    <button
                      class="custom-tab ${path.page === e ? "active" : ""}"
                      @click=${() => this.navigateToPage(e)}
                    >
                      ${localize(`panels.${e}.title`, this.hass.language)}
                    </button>
                  `,
                )}
              </div>
            `}
      </div>
      <div class="view">${this.getView(path)}</div>
    `;
  }

  getView(path: Path) {
    const page = path.page;
    switch (page) {
      case "info":
        return html`
          <happy-irrigation-view-info
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></happy-irrigation-view-info>
        `;
      case "general":
        return html`
          <happy-irrigation-view-general
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></happy-irrigation-view-general>
        `;
      case "zones":
        return html`
          <happy-irrigation-view-zones
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></happy-irrigation-view-zones>
        `;
      case "modules":
        return html`
          <happy-irrigation-view-modules
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></happy-irrigation-view-modules>
        `;
      case "mappings":
        return html`
          <happy-irrigation-view-mappings
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></happy-irrigation-view-mappings>
        `;
      case "weatherservice":
        return html`
          <happy-irrigation-view-weatherservice
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></happy-irrigation-view-weatherservice>
        `;
      case "backuprestore":
        return html`
          <happy-irrigation-view-backuprestore
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></happy-irrigation-view-backuprestore>
        `;
      case "help":
        return html`<ha-card
          header="${localize(
            "panels.help.cards.how-to-get-help.title",
            this.hass.language,
          )}"
        >
          <div class="card-content">
            ${localize(
              "panels.help.cards.how-to-get-help.first-read-the",
              this.hass.language,
            )}
            <a href="https://github.com/altmenorg/HappyIrrigation#readme"
              >${localize(
                "panels.help.cards.how-to-get-help.wiki",
                this.hass.language,
              )}</a
            >.
            ${localize(
              "panels.help.cards.how-to-get-help.if-you-still-need-help",
              this.hass.language,
            )}
            <a
              href="https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden"
              >${localize(
                "panels.help.cards.how-to-get-help.community-forum",
                this.hass.language,
              )}</a
            >
            ${localize(
              "panels.help.cards.how-to-get-help.or-open-a",
              this.hass.language,
            )}
            <a href="https://github.com/altmenorg/HappyIrrigation/issues"
              >${localize(
                "panels.help.cards.how-to-get-help.github-issue",
                this.hass.language,
              )}</a
            >
            (${localize(
              "panels.help.cards.how-to-get-help.english-only",
              this.hass.language,
            )}).
          </div></ha-card
        >`;
      default:
        return html`
          <ha-card header="Page not found">
            <div class="card-content">
              The page you are trying to reach cannot be found. Please select a
              page from the menu above to continue.
            </div>
          </ha-card>
        `;
    }
  }

  navigateToPage(page: string) {
    if (page !== getPath().page) {
      const newPath = exportPath(page);
      navigate(this, newPath);
      this.requestUpdate();
    } else {
      scrollTo(0, 0);
    }
  }

  handlePageSelected(ev: CustomEvent) {
    const newPage = ev.detail.name;
    if (newPage !== getPath().page) {
      const newPath = exportPath(newPage);
      navigate(this, newPath);
      this.requestUpdate();
    } else {
      scrollTo(0, 0);
    }
  }

  static get styles(): CSSResultGroup {
    return [
      commonStyle,
      css`
        :host {
          color: var(--primary-text-color);
          --paper-card-header-color: var(--primary-text-color);
        }
        .header {
          background-color: var(--app-header-background-color);
          color: var(--app-header-text-color, white);
          border-bottom: var(--app-header-border-bottom, none);
        }
        .toolbar {
          height: var(--header-height);
          display: flex;
          align-items: center;
          font-size: 20px;
          padding: 0 16px;
          font-weight: 400;
          box-sizing: border-box;
        }
        .main-title {
          margin: 0 0 0 24px;
          line-height: 20px;
          flex-grow: 1;
        }
        ha-tab-group {
          margin-left: max(env(safe-area-inset-left), 24px);
          margin-right: max(env(safe-area-inset-right), 24px);
          --ha-tab-active-text-color: var(--app-header-text-color, white);
          --ha-tab-indicator-color: var(--app-header-text-color, white);
          --ha-tab-track-color: transparent;
        }

        .custom-tabs {
          display: flex;
          margin-left: max(env(safe-area-inset-left), 24px);
          margin-right: max(env(safe-area-inset-right), 24px);
          border-bottom: 1px solid
            rgba(
              var(--rgb-app-header-text-color, var(--rgb-text-primary-color)),
              0.12
            );
          overflow-x: auto;
        }

        .custom-tab {
          background: transparent;
          border: none;
          color: rgba(
            var(--rgb-app-header-text-color, var(--rgb-text-primary-color)),
            0.7
          );
          cursor: pointer;
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          line-height: 48px;
          margin: 0;
          min-width: 72px;
          outline: none;
          padding: 0 12px;
          position: relative;
          text-transform: uppercase;
          transition: color 0.15s ease-in-out;
          white-space: nowrap;
          letter-spacing: 0.1em;
        }

        .custom-tab:hover {
          color: var(--app-header-text-color, white);
          background-color: rgba(
            var(--rgb-app-header-text-color, var(--rgb-text-primary-color)),
            0.04
          );
        }

        .custom-tab.active {
          color: var(--app-header-text-color, white);
        }

        .custom-tab.active::after {
          background-color: var(--app-header-text-color, white);
          bottom: 0;
          content: "";
          height: 2px;
          left: 0;
          position: absolute;
          right: 0;
        }

        .view {
          height: calc(100vh - 112px);
          display: flex;
          justify-content: center;
          overflow-y: auto;
        }

        .view > * {
          width: 100%;
          max-width: 1100px;
        }

        .view > *:last-child {
          margin-bottom: 20px;
        }

        .version {
          font-size: 14px;
          font-weight: 500;
          color: rgba(var(--rgb-text-primary-color), 0.9);
        }
      `,
    ];
  }
}
