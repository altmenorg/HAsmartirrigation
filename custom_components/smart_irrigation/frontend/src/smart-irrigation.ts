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
import "./views/history/view-history.ts";
import "./views/backuprestore/view-backuprestore.ts";
import "./views/info/view-info.ts";
import "./views/setup/view-setup.ts";

import { commonStyle } from "./styles";
import { VERSION, PLATFORM } from "./const";
import { localize } from "../localize/localize";
import { exportPath, getPath, Path } from "./common/navigation";

enum EMenuItems {
  Setup = "setup",
  Info = "info",
  General = "general",
  Zones = "zones",
  Modules = "modules",
  Mappings = "mappings",
  WeatherService = "weatherservice",
  History = "history",
  BackupRestore = "backuprestore",
  Help = "help",
}

/**
 * The ten pages, in four groups.
 *
 * Ten tabs is a wall: it asks a newcomer to know what a "module" is before
 * they can decide which tab to open, and it hides the two pages people look at
 * daily among eight they visit twice a year. The pages themselves do not
 * change, nor do their addresses: a group opens its first page, and a group
 * with several shows them on a second row.
 */
const TAB_GROUPS: { id: string; pages: EMenuItems[] }[] = [
  // What is happening: the next run, and what already ran.
  { id: "home", pages: [EMenuItems.Info, EMenuItems.History] },
  // What is watered.
  { id: "zones", pages: [EMenuItems.Zones] },
  // Where the numbers come from: the service they are read from, and the
  // sensors that report them.
  { id: "data", pages: [EMenuItems.WeatherService, EMenuItems.Mappings] },
  // Everything you set once.
  {
    id: "settings",
    pages: [
      EMenuItems.General,
      EMenuItems.Setup,
      EMenuItems.BackupRestore,
      EMenuItems.Help,
    ],
  },
];

/**
 * The engines page is not in any group: a zone says how it is calculated and
 * the engine behind it is created and configured from there, so "modules" is
 * not a thing anyone should have to open. Its address still works, and it
 * shows under Settings when it is open, for an installation that was built on
 * it and for a bookmark.
 */
const UNLISTED_PAGE_GROUP: Record<string, string> = {
  [EMenuItems.Modules]: "settings",
};

/** The group a page belongs to, falling back to the first one. */
const groupOf = (page: string): { id: string; pages: EMenuItems[] } => {
  const listed = TAB_GROUPS.find((group) =>
    (group.pages as string[]).includes(page),
  );
  if (listed) return listed;
  const unlisted = UNLISTED_PAGE_GROUP[page];
  if (unlisted) {
    const group = TAB_GROUPS.find((g) => g.id === unlisted);
    // The page joins that group's second row while it is open, so there is a
    // way back and the tab above it is not left looking unselected.
    if (group) return { ...group, pages: [...group.pages, page as EMenuItems] };
  }
  return TAB_GROUPS[0];
};

@customElement("smart-irrigation")
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
                ${TAB_GROUPS.map(
                  (group) => html`
                    <ha-tab-group-tab
                      slot="nav"
                      panel="${group.pages[0]}"
                      .active=${groupOf(path.page).id === group.id}
                    >
                      ${localize(
                        `panels.groups.${group.id}`,
                        this.hass.language,
                      )}
                    </ha-tab-group-tab>
                  `,
                )}
              </ha-tab-group>
            `
          : html`
              <div class="custom-tabs">
                ${TAB_GROUPS.map(
                  (group) => html`
                    <button
                      class="custom-tab ${groupOf(path.page).id === group.id
                        ? "active"
                        : ""}"
                      @click=${() => this.navigateToPage(group.pages[0])}
                    >
                      ${localize(
                        `panels.groups.${group.id}`,
                        this.hass.language,
                      )}
                    </button>
                  `,
                )}
              </div>
            `}
        ${this.renderSubTabs(path.page)}
      </div>
      <div class="view">${this.getView(path)}</div>
    `;
  }

  /** The pages of the current group, when it holds more than one. */
  renderSubTabs(page: string) {
    const group = groupOf(page);
    if (group.pages.length < 2) {
      return "";
    }
    return html`
      <div class="sub-tabs">
        ${group.pages.map(
          (sub) => html`
            <button
              class="sub-tab ${page === sub ? "active" : ""}"
              @click=${() => this.navigateToPage(sub)}
            >
              ${localize(`panels.${sub}.title`, this.hass.language)}
            </button>
          `,
        )}
      </div>
    `;
  }

  getView(path: Path) {
    const page = path.page;
    switch (page) {
      case "setup":
        return html`
          <smart-irrigation-view-setup
            .hass=${this.hass}
            .narrow=${this.narrow}
          ></smart-irrigation-view-setup>
        `;
      case "info":
        return html`
          <smart-irrigation-view-info
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></smart-irrigation-view-info>
        `;
      case "general":
        return html`
          <smart-irrigation-view-general
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></smart-irrigation-view-general>
        `;
      case "zones":
        return html`
          <smart-irrigation-view-zones
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></smart-irrigation-view-zones>
        `;
      case "modules":
        return html`
          <smart-irrigation-view-modules
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></smart-irrigation-view-modules>
        `;
      case "mappings":
        return html`
          <smart-irrigation-view-mappings
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></smart-irrigation-view-mappings>
        `;
      case "weatherservice":
        return html`
          <smart-irrigation-view-weatherservice
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></smart-irrigation-view-weatherservice>
        `;
      case "history":
        return html`
          <smart-irrigation-view-history
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></smart-irrigation-view-history>
        `;
      case "backuprestore":
        return html`
          <smart-irrigation-view-backuprestore
            .hass=${this.hass}
            .narrow=${this.narrow}
            .path=${path}
          ></smart-irrigation-view-backuprestore>
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
            <a href="https://altmenorg.github.io/HAsmartirrigation/"
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
            <a href="https://github.com/altmenorg/HAsmartirrigation/issues"
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
          border-bottom: var(--app-header-border-bottom, none);
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

        /* The pages of the group that is open. It sits below the header, on
           the page's own background, so it takes the page's colours: the
           header's are white on white here. A quieter row than the tabs above
           it, because this says where you are inside a section rather than
           offering a choice between sections. */
        .sub-tabs {
          display: flex;
          gap: 8px;
          padding: 8px max(env(safe-area-inset-left), 24px);
          background: var(
            --card-background-color,
            var(--primary-background-color)
          );
          border-bottom: 1px solid var(--divider-color);
          overflow-x: auto;
        }

        .sub-tab {
          background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
          border: none;
          border-radius: 16px;
          color: var(--secondary-text-color);
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          line-height: 30px;
          padding: 0 16px;
          white-space: nowrap;
        }

        .sub-tab:hover {
          color: var(--primary-text-color);
        }

        .sub-tab.active {
          background: var(--primary-color);
          color: var(--text-primary-color, white);
          font-weight: 500;
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
