import { TemplateResult, LitElement, html, css, CSSResultGroup } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { HomeAssistant } from "custom-card-helpers";
import { mdiDownload, mdiUpload, mdiAlertOutline } from "@mdi/js";
import { localize } from "../../../localize/localize";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { loadHaForm } from "../../load-ha-elements";
import { Path } from "../../common/navigation";
import { exportConfig, restoreConfig } from "../../data/websockets";

@customElement("smart-irrigation-view-backuprestore")
export class SmartIrrigationViewBackupRestore extends LitElement {
  hass?: HomeAssistant;
  @property() narrow!: boolean;
  @property() path!: Path;

  @state() private _busy = false;
  @state() private _error = "";
  @state() private _message = "";
  // Parsed + validated backup awaiting an explicit restore confirmation.
  @state() private _pending?: any;
  @state() private _pendingName = "";

  firstUpdated() {
    loadHaForm().catch((error) => {
      console.error("Failed to load HA form:", error);
    });
  }

  private _errText(e: any): string {
    if (e && (e.message || e.code)) {
      return e.message || e.code;
    }
    return String(e);
  }

  private _reset(): void {
    this._error = "";
    this._message = "";
    this._pending = undefined;
    this._pendingName = "";
  }

  private async _export(): Promise<void> {
    if (!this.hass) {
      return;
    }
    this._reset();
    this._busy = true;
    try {
      const data = await exportConfig(this.hass);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // e.g. happy_irrigation_backup_2026-06-22_14-05-31.json
      const stamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", "_")
        .replace(/:/g, "-");
      a.download = `happy_irrigation_backup_${stamp}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this._message = localize(
        "panels.backuprestore.messages.exported",
        this.hass.language,
      );
    } catch (e) {
      this._error = this._errText(e);
    } finally {
      this._busy = false;
    }
  }

  private async _onFile(e: Event): Promise<void> {
    this._reset();
    const input = e.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || !parsed.config) {
        throw new Error(
          localize(
            "panels.backuprestore.messages.invalid-file",
            this.hass!.language,
          ),
        );
      }
      this._pending = parsed;
      this._pendingName = file.name;
    } catch (err) {
      this._error = this._errText(err);
    } finally {
      // Allow re-selecting the same file after an error/cancel.
      input.value = "";
    }
  }

  private async _restore(): Promise<void> {
    if (!this.hass || !this._pending) {
      return;
    }
    this._busy = true;
    this._error = "";
    this._message = "";
    try {
      const res = await restoreConfig(this.hass, this._pending);
      if (res && res.success === false) {
        throw new Error(res.error || "restore failed");
      }
      this._pending = undefined;
      this._pendingName = "";
      this._message = localize(
        "panels.backuprestore.messages.restored",
        this.hass.language,
      );
    } catch (e) {
      this._error = this._errText(e);
    } finally {
      this._busy = false;
    }
  }

  private _count(key: string): number {
    const v = this._pending && this._pending[key];
    return Array.isArray(v) ? v.length : 0;
  }

  render(): TemplateResult {
    if (!this.hass) {
      return html``;
    }
    const lang = this.hass.language;

    return html`
      <ha-card header="${localize("panels.backuprestore.title", lang)}">
        <div class="card-content br-description">
          ${localize("panels.backuprestore.description", lang)}
        </div>
      </ha-card>

      <ha-card
        header="${localize("panels.backuprestore.cards.backup.title", lang)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${localize("panels.backuprestore.cards.backup.description", lang)}
          </div>
          ${this._message
            ? html`<div class="br-msg br-msg--success">${this._message}</div>`
            : ""}
          <div class="br-actions">
            <ha-button
              appearance="filled"
              ?disabled=${this._busy}
              @click=${this._export}
            >
              <ha-svg-icon slot="start" .path=${mdiDownload}></ha-svg-icon>
              ${localize("panels.backuprestore.actions.export", lang)}
            </ha-button>
          </div>
        </div>
      </ha-card>

      <ha-card
        header="${localize("panels.backuprestore.cards.restore.title", lang)}"
      >
        <div class="card-content">
          <div class="br-description">
            ${localize("panels.backuprestore.cards.restore.description", lang)}
          </div>

          <label class="br-file">
            <input
              type="file"
              accept="application/json,.json"
              @change=${this._onFile}
            />
            <ha-svg-icon .path=${mdiUpload}></ha-svg-icon>
            ${localize("panels.backuprestore.actions.choose-file", lang)}
          </label>

          ${this._pending
            ? html`
                <div class="br-warning">
                  <ha-svg-icon .path=${mdiAlertOutline}></ha-svg-icon>
                  <div>
                    <div class="br-warning-title">
                      ${localize(
                        "panels.backuprestore.messages.confirm-title",
                        lang,
                      )}
                    </div>
                    <div class="br-file-name">${this._pendingName}</div>
                    <div class="br-summary">
                      ${localize(
                        "panels.backuprestore.messages.summary",
                        lang,
                      )}:
                      ${this._count("zones")}
                      ${localize("panels.zones.title", lang)} ·
                      ${this._count("modules")}
                      ${localize("panels.modules.title", lang)} ·
                      ${this._count("mappings")}
                      ${localize("panels.mappings.title", lang)}
                    </div>
                    <div class="br-warning-text">
                      ${localize(
                        "panels.backuprestore.messages.confirm-warning",
                        lang,
                      )}
                    </div>
                  </div>
                </div>
              `
            : ""}
          ${this._error
            ? html`<div class="br-msg br-msg--error">${this._error}</div>`
            : ""}
          ${this._pending
            ? html`<div class="br-actions">
                <ha-button
                  appearance="filled"
                  variant="danger"
                  ?disabled=${this._busy}
                  @click=${this._restore}
                >
                  <ha-svg-icon slot="start" .path=${mdiUpload}></ha-svg-icon>
                  ${this._busy
                    ? localize("panels.backuprestore.actions.restoring", lang)
                    : localize("panels.backuprestore.actions.restore", lang)}
                </ha-button>
              </div>`
            : ""}
          <div class="br-note">
            ${localize("panels.backuprestore.messages.reload-note", lang)}
          </div>
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      ${globalStyle} ${modernStyle}

      .br-description {
        color: var(--primary-text-color);
        line-height: 1.4;
        margin-bottom: 8px;
      }
      .br-actions {
        display: flex;
        justify-content: flex-end;
        padding-top: 12px;
      }
      /* File picker styled as a native-looking button (hides the raw input). */
      .br-file {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px 14px;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        color: var(--primary-text-color);
      }
      .br-file:hover {
        background: var(--secondary-background-color);
      }
      .br-file input {
        display: none;
      }
      .br-note {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin-top: 12px;
        text-align: right;
      }
      .br-msg {
        margin-top: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 0.95em;
      }
      .br-msg--error {
        background: rgba(var(--rgb-error-color, 244, 67, 54), 0.12);
        color: var(--error-color);
      }
      .br-msg--success {
        background: rgba(var(--rgb-success-color, 67, 160, 71), 0.16);
        color: var(--success-color, #2e7d32);
      }
      .br-warning {
        display: flex;
        gap: 12px;
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: 10px;
        background: rgba(var(--rgb-warning-color, 255, 166, 0), 0.12);
      }
      .br-warning ha-svg-icon {
        color: var(--warning-color, #ffa600);
        flex: 0 0 auto;
      }
      .br-warning-title {
        font-weight: 500;
      }
      .br-file-name {
        font-family: monospace;
        font-size: 0.9em;
        margin: 2px 0;
      }
      .br-summary {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        margin: 4px 0;
      }
      .br-warning-text {
        margin-top: 4px;
      }
    `;
  }
}
