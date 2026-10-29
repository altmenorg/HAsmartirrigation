import { TemplateResult, LitElement, html, css, CSSResultGroup } from "lit";
import { property, state, customElement } from "lit/decorators.js";
import { mdiArrowLeft, mdiArrowRight, mdiCheck } from "@mdi/js";
import { HomeAssistant } from "custom-card-helpers";
import {
  fetchConfig,
  fetchZones,
  IuImportConflict,
  IuImportPreview,
  IuImportResult,
  IuImportSource,
  iuImportApply,
  iuImportPreview,
  iuImportSources,
} from "../../data/websockets";
import { SmartIrrigationZone } from "../../types";
import { globalStyle } from "../../styles/global-style";
import { modernStyle } from "../../styles/modern-style";
import { localize } from "../../../localize/localize";
import { exportPath } from "../../common/navigation";
import { navigate } from "../../helpers";
import {
  automaticMatch,
  baselineOf,
  describeSchedule,
  describeStep,
  nameConflicts,
  reportGroups,
  summary,
  withMatch,
  zoneConflicts,
} from "./iu-import";

const PASTED = "pasted";
/** Errors whose backend message says where: the line of a YAML error. */
const DETAIL_CODES = ["yaml_invalid", "yaml_unreadable"];
const isEmpty = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const STEPS = ["source", "zones", "programs", "report"] as const;
type Step = (typeof STEPS)[number];

/** The zone fields an import fills in, in the order they are listed. */
const FILLED = [
  "linked_entity",
  "supply_id",
  "extra_entities",
  "confirm_timeout",
  "open_resends",
  "flow_sensor",
];

/**
 * Bring an Irrigation Unlimited configuration over, one look at a time.
 *
 * Where it comes from, what each IU zone becomes, the programs it makes, and
 * what does not come over, before anything is changed. The backend works the
 * import out (iu_import_ha.py) and does it; this only shows it and passes on
 * the choices. Nothing waters afterwards until the programs' schedules are
 * switched on: IU keeps watering until then.
 */
@customElement("smart-irrigation-view-iuimport")
export class SmartIrrigationViewIuImport extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ type: Boolean }) narrow = false;

  @state() private step = 0;
  @state() private sources: IuImportSource[] = [];
  @state() private source = "";
  @state() private yaml = "";
  @state() private preview?: IuImportPreview;
  @state() private choices: Record<string, number | "new"> = {};
  @state() private zones: SmartIrrigationZone[] = [];
  @state() private busy = false;
  @state() private loaded = false;
  @state() private error?: string;
  @state() private notice?: string;
  @state() private result?: IuImportResult;
  @state() private fullController = true;
  @state() private importedAt?: string;
  // What the import picks by itself, from the preview made without choices.
  private baseline: Record<string, number | "new"> = {};
  // The source and YAML the preview shown was made for.
  private previewedFor?: string;
  // Only the answer to the latest preview asked for is shown.
  private asked = 0;
  // The choices as the user has made them, ahead of the preview that shows
  // them: two quick changes both count.
  private desired: Record<string, number | "new"> = {};

  firstUpdated(): void {
    this._load().catch((e) => console.error("IU import: load failed", e));
  }

  private get lng(): string {
    return this.hass?.language ?? "en";
  }

  private t = (key: string, ...args: any[]): string =>
    localize(`panels.iu_import.${key}`, this.lng, ...args);

  private get currentStep(): Step {
    return STEPS[Math.min(this.step, STEPS.length - 1)];
  }

  private get sourceKey(): string {
    return this.source === PASTED ? `${PASTED}\n${this.yaml}` : this.source;
  }

  /** The request for the source and choices made so far. */
  private requestFor(choices: Record<string, number | "new">) {
    return {
      source: this.source === PASTED ? PASTED : this.source || undefined,
      yaml: this.source === PASTED ? this.yaml : undefined,
      matches: Object.keys(choices).length ? choices : undefined,
    };
  }

  /** The configurations there are, the zones, and whether anything waters. */
  private async _load(): Promise<void> {
    if (!this.hass) return;
    try {
      const [sources, zones, config] = await Promise.all([
        iuImportSources(this.hass),
        fetchZones(this.hass),
        fetchConfig(this.hass),
      ]);
      this.sources = sources.sources;
      this.zones = zones;
      this.fullController = (config as any)?.full_controller === true;
      this.importedAt = (config as any)?.iu_import?.at;
      const usable = this.sources.find((s) => !s.error);
      this.source = usable ? usable.id : PASTED;
    } catch (e) {
      this.error = this.errorText(e);
      this.source = PASTED;
    } finally {
      this.loaded = true;
    }
  }

  private errorText(e: unknown): string {
    const code = (e as any)?.code;
    const known = code ? this.t(`errors.${code}`) : undefined;
    if (known && !known.startsWith("Translation")) {
      // Where the YAML went wrong is only in the backend's message.
      return DETAIL_CODES.includes(code) && (e as any)?.message
        ? `${known} (${(e as any).message})`
        : known;
    }
    return (e as any)?.message ?? this.t("errors.generic");
  }

  /**
   * Work the import out again for the current source and these choices.
   *
   * The zones are read again with it: one may have been added or deleted
   * since. An answer that a later request has overtaken is dropped.
   */
  private async refresh(
    choices: Record<string, number | "new"> = this.choices,
  ): Promise<boolean> {
    if (!this.hass) return false;
    const asked = ++this.asked;
    this.busy = true;
    this.error = undefined;
    try {
      const [preview, zones] = await Promise.all([
        iuImportPreview(this.hass, this.requestFor(choices)),
        fetchZones(this.hass).catch(() => this.zones),
      ]);
      if (asked !== this.asked) return false;
      this.preview = preview;
      this.choices = choices;
      this.desired = choices;
      this.zones = zones;
      this.previewedFor = this.sourceKey;
      if (!Object.keys(choices).length) this.baseline = baselineOf(preview);
      return true;
    } catch (e) {
      if (asked === this.asked) {
        this.error = this.errorText(e);
        this.desired = this.choices;
      }
      return false;
    } finally {
      if (asked === this.asked) this.busy = false;
    }
  }

  private async next(): Promise<void> {
    this.notice = undefined;
    if (this.currentStep === "source") {
      // The same source again keeps the choices; another starts afresh.
      const same = this.preview && this.previewedFor === this.sourceKey;
      if (same || (await this.refresh({}))) {
        this.step += 1;
        this.error = undefined;
      }
      return;
    }
    this.step += 1;
    this.error = undefined;
  }

  private async apply(): Promise<void> {
    if (!this.hass || !this.preview || this.busy) return;
    this.busy = true;
    this.error = undefined;
    this.notice = undefined;
    try {
      this.result = await iuImportApply(this.hass, {
        ...this.requestFor(this.choices),
        fingerprint: this.preview.fingerprint,
      });
    } catch (e) {
      if ((e as any)?.code === "changed") {
        // Show what it would do now, and let them look again.
        this.busy = false;
        if (await this.refresh()) this.notice = this.t("errors.changed");
        return;
      }
      this.error = this.errorText(e);
    } finally {
      this.busy = false;
    }
  }

  render(): TemplateResult {
    if (!this.hass) return html``;
    if (this.result) return this.renderDone(this.result);
    return html`
      <ha-card header="${this.t("title")}">
        <div class="card-content">
          <div class="note">${this.t("description")}</div>
          ${!this.loaded
            ? html`<div class="note">${this.t("loading")}</div>`
            : this.renderStep()}
          <div aria-live="polite">
            ${this.notice ? html`<div class="notice">${this.notice}</div>` : ""}
          </div>
          <div role="alert">
            ${this.error ? html`<div class="error">${this.error}</div>` : ""}
          </div>
          ${this.renderActions()}
        </div>
      </ha-card>
    `;
  }

  private get blocked(): boolean {
    return !!this.preview?.conflicts?.length;
  }

  private renderActions(): TemplateResult {
    const last = this.currentStep === "report";
    const canGoOn =
      this.loaded &&
      !this.busy &&
      (this.currentStep !== "source" ||
        (this.source === PASTED ? this.yaml.trim() !== "" : !!this.source));
    return html`
      <div class="si-form-actions">
        <span class="step-count"
          >(${this.t("step")} ${this.step + 1} / ${STEPS.length})</span
        >
        ${this.step > 0
          ? html`<ha-button
              appearance="plain"
              ?disabled=${this.busy}
              @click=${() => {
                this.step -= 1;
                this.error = undefined;
                this.notice = undefined;
              }}
            >
              <ha-svg-icon slot="start" .path=${mdiArrowLeft}></ha-svg-icon>
              ${this.t("back")}
            </ha-button>`
          : ""}
        ${last
          ? html`<ha-button
              appearance="filled"
              ?disabled=${this.busy || !this.preview || this.blocked}
              @click=${() => this.apply()}
            >
              <ha-svg-icon slot="start" .path=${mdiCheck}></ha-svg-icon>
              ${this.busy ? this.t("importing") : this.t("import")}
            </ha-button>`
          : html`<ha-button
              appearance="filled"
              ?disabled=${!canGoOn}
              @click=${() => this.next()}
            >
              ${this.t("next")}
              <ha-svg-icon slot="end" .path=${mdiArrowRight}></ha-svg-icon>
            </ha-button>`}
      </div>
    `;
  }

  private renderStep(): TemplateResult {
    switch (this.currentStep) {
      case "source":
        return this.renderSource();
      case "zones":
        return this.renderZones();
      case "programs":
        return this.renderPrograms();
      default:
        return this.renderReport();
    }
  }

  private choice(
    selected: boolean,
    title: string,
    help: string | TemplateResult,
    pick: () => void,
    disabled = false,
  ): TemplateResult {
    const off = disabled || this.busy;
    return html`
      <div
        class="choice ${selected ? "selected" : ""} ${disabled
          ? "disabled"
          : ""}"
        role="radio"
        aria-checked=${selected ? "true" : "false"}
        aria-disabled=${off ? "true" : "false"}
        tabindex=${disabled ? "-1" : "0"}
        @click=${off ? undefined : pick}
        @keydown=${(e: KeyboardEvent) => {
          if (!off && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            pick();
          }
        }}
      >
        <div class="choice-title">${title}</div>
        <div class="choice-help">${help}</div>
      </div>
    `;
  }

  private renderSource(): TemplateResult {
    return html`
      <h3 id="source-question">${this.t("source.question")}</h3>
      <div class="note">${this.t("source.help")}</div>
      ${this.importedAt
        ? html`<div class="note">
            ${this.t(
              "source.previous",
              "at",
              new Date(this.importedAt).toLocaleString(this.lng),
            )}
          </div>`
        : ""}
      <div role="radiogroup" aria-labelledby="source-question">
        ${this.sources.map((source) =>
          this.choice(
            this.source === source.id,
            source.title,
            source.error
              ? html`<span class="error"
                  >${this.t("source.unreadable")} ${source.error}</span
                >`
              : this.t(
                  source.id === "yaml"
                    ? "source.yaml-help"
                    : "source.entry-help",
                ),
            () => (this.source = source.id),
            !!source.error,
          ),
        )}
        ${this.loaded && !this.sources.some((s) => !s.error)
          ? html`<div class="note">${this.t("source.none-found")}</div>`
          : ""}
        ${this.choice(
          this.source === PASTED,
          this.t("source.paste"),
          this.t("source.paste-help"),
          () => (this.source = PASTED),
        )}
      </div>
      ${this.source === PASTED
        ? html`<textarea
            class="yaml"
            rows="12"
            spellcheck="false"
            aria-label=${this.t("source.paste")}
            placeholder="irrigation_unlimited:&#10;  controllers:&#10;    - name: …"
            ?disabled=${this.busy}
            .value=${this.yaml}
            @input=${(e: Event) =>
              (this.yaml = (e.target as HTMLTextAreaElement).value)}
          ></textarea>`
        : ""}
    `;
  }

  private reasonText(reason: string | null): string {
    return reason ? this.t(`zones.reason.${reason}`) : "";
  }

  private iuZoneName(key: string): string {
    return this.preview?.zones.find((z) => z.key === key)?.name ?? key;
  }

  private zoneName(id: number | null | undefined): string {
    return this.zones.find((z) => z.id === id)?.name ?? String(id);
  }

  private conflictText(conflict: IuImportConflict): string {
    switch (conflict.code) {
      case "zone_twice":
        return this.t(
          "conflicts.zone_twice",
          "zone",
          this.iuZoneName(conflict.key),
          "other",
          this.iuZoneName(conflict.other),
          "target",
          this.zoneName(conflict.zone_id),
        );
      case "calculated_needs_zone":
        return this.t(
          "conflicts.calculated_needs_zone",
          "zone",
          this.iuZoneName(conflict.key),
        );
      default:
        return this.t(
          `conflicts.${conflict.code}`,
          "name",
          conflict.name || conflict.id,
          "id",
          conflict.id,
        );
    }
  }

  private async choose(key: string, select: HTMLSelectElement): Promise<void> {
    const raw = select.value;
    const value: number | "new" = raw === "new" ? "new" : Number(raw);
    const next = withMatch(this.desired, key, value, this.baseline[key]);
    this.desired = next;
    const zone = this.preview?.zones.find((z) => z.key === key);
    const shown = zone ? String(automaticMatch(zone)) : raw;
    if (!(await this.refresh(next))) {
      // Not taken (the zone is gone, or a later choice overtook it): the
      // select shows what the preview still says.
      const now = this.preview?.zones.find((z) => z.key === key);
      select.value = now ? String(automaticMatch(now)) : shown;
    }
  }

  private renderZones(): TemplateResult {
    const preview = this.preview;
    if (!preview) return html``;
    if (!preview.zones.length) {
      return html`<h3>${this.t("zones.question")}</h3>
        <div class="note">${this.t("zones.none")}</div>`;
    }
    const conflicts = zoneConflicts(preview);
    return html`
      <h3>${this.t("zones.question")}</h3>
      <div class="note">${this.t("zones.help")}</div>
      ${preview.links
        ? html`<div class="note">
            ${this.t("zones.links", "count", preview.links)}
          </div>`
        : ""}
      <div class="rows">
        ${preview.zones.map((zone) => {
          const chosen = zone.zone_id === null ? "new" : String(zone.zone_id);
          const fills = FILLED.filter((f) => !isEmpty(zone.fields[f]));
          const conflict = conflicts[zone.key];
          // A zone the preview names that the list does not have yet.
          const missing =
            zone.zone_id !== null &&
            !this.zones.some((z) => z.id === zone.zone_id);
          return html`
            <div class="row ${conflict ? "conflict" : ""}">
              <div class="row-head">
                <div class="row-title">${zone.name}</div>
                <select
                  class="field"
                  aria-label=${this.t("zones.becomes", "zone", zone.name)}
                  aria-invalid=${conflict ? "true" : "false"}
                  .value=${chosen}
                  @change=${(e: Event) =>
                    this.choose(zone.key, e.target as HTMLSelectElement)}
                >
                  <option value="new" ?selected=${chosen === "new"}>
                    ${this.t("zones.new")}
                  </option>
                  ${this.zones.map(
                    (z) =>
                      html`<option
                        value=${String(z.id)}
                        ?selected=${chosen === String(z.id)}
                      >
                        ${z.name}
                      </option>`,
                  )}
                  ${missing
                    ? html`<option value=${chosen} selected>
                        ${zone.zone_name ?? chosen}
                      </option>`
                    : ""}
                </select>
              </div>
              <div class="row-help">
                ${zone.action === "create"
                  ? this.t("zones.creates")
                  : this.t(
                      "zones.uses",
                      "zone",
                      zone.zone_name ?? String(zone.zone_id),
                      "reason",
                      this.reasonText(zone.reason),
                    )}
                ${fills.length
                  ? html`<br />${this.t("zones.fills")}
                      ${fills
                        .map(
                          (f) =>
                            `${this.t(`zones.fields.${f}`)}: ${this.fieldValue(
                              f,
                              zone.fields[f],
                            )}`,
                        )
                        .join(" · ")}`
                  : ""}
              </div>
              ${conflict
                ? html`<div class="error row-error">
                    ${this.conflictText(conflict)}
                  </div>`
                : ""}
            </div>
          `;
        })}
      </div>
      ${preview.zones_left.length
        ? html`<div class="note">
            ${this.t(
              "zones.left",
              "zones",
              preview.zones_left.map((id) => this.zoneName(id)).join(", "),
            )}
          </div>`
        : ""}
    `;
  }

  private fieldValue(field: string, value: unknown): string {
    if (field === "supply_id") {
      // The pump by its name: the id is ours, not the user's.
      const supply = this.preview?.supplies.find((s) => s.supply.id === value);
      if (supply) return supply.supply.name;
    }
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  }

  private renderNameConflicts(): TemplateResult {
    const conflicts = nameConflicts(this.preview);
    if (!conflicts.length) return html``;
    return html`<div class="error" role="alert">
      ${conflicts.map((c) => html`<div>${this.conflictText(c)}</div>`)}
    </div>`;
  }

  private renderPrograms(): TemplateResult {
    const preview = this.preview;
    if (!preview) return html``;
    return html`
      <h3>${this.t("programs.question")}</h3>
      <div class="note">${this.t("programs.help")}</div>
      ${this.renderNameConflicts()}
      ${!preview.programs.length
        ? html`<div class="note">${this.t("programs.none")}</div>`
        : ""}
      <div class="rows">
        ${preview.programs.map(
          (entry) => html`
            <div class="row">
              <div class="row-head">
                <div class="row-title">${entry.program.name}</div>
                <span class="badge"
                  >${this.t(`programs.action.${entry.action}`)}</span
                >
              </div>
              <ul class="lines">
                ${entry.program.steps.map(
                  (step, i) =>
                    html`<li>
                      ${describeStep(entry.zone_names[i] ?? [], step, this.t)}
                    </li>`,
                )}
              </ul>
              <div class="row-help">
                ${entry.program.schedules.length
                  ? entry.program.schedules
                      .map((s) => describeSchedule(s, this.lng, this.t))
                      .join("; ")
                  : this.t("programs.no-schedules")}
                <br />
                ${entry.schedules_on
                  ? this.t("programs.schedules-stay-on")
                  : this.t("programs.schedules-off")}
                ${entry.program.enabled === false
                  ? html`<br />${this.t("programs.disabled")}`
                  : ""}
              </div>
            </div>
          `,
        )}
      </div>
      ${preview.removed.programs.length
        ? html`<div class="note">
            ${this.t(
              "programs.removed",
              "programs",
              (
                preview.removed_names?.programs ?? preview.removed.programs
              ).join(", "),
            )}
          </div>`
        : ""}
      ${preview.supplies.length || preview.removed.supplies.length
        ? html`<h3>${this.t("supplies.title")}</h3>
            ${preview.supplies.map(
              (s) =>
                html`<div class="note">
                  ${this.t(
                    `supplies.${s.action}`,
                    "name",
                    s.supply.name,
                    "entities",
                    s.supply.entities.join(", "),
                  )}
                </div>`,
            )}
            ${preview.removed.supplies.length
              ? html`<div class="note">
                  ${this.t(
                    "supplies.removed",
                    "supplies",
                    (
                      preview.removed_names?.supplies ??
                      preview.removed.supplies
                    ).join(", "),
                  )}
                </div>`
              : ""}`
        : ""}
    `;
  }

  private renderReport(): TemplateResult {
    const preview = this.preview;
    if (!preview) return html``;
    const groups = reportGroups(preview.report.items);
    const counts = summary(preview);
    return html`
      <h3>${this.t("report.question")}</h3>
      <div class="note">${this.t("report.help")}</div>
      ${!groups.length
        ? html`<div class="note">${this.t("report.all-carried")}</div>`
        : groups.map(
            (group) => html`
              <h4>${this.t(`report.outcome.${group.outcome}`)}</h4>
              <ul class="lines">
                ${group.items.map(
                  (item) =>
                    html`<li>
                      ${item.subject
                        ? html`<b>${item.subject}</b>: `
                        : ""}${item.note}
                      ${item.path
                        ? html`<span class="path">(${item.path})</span>`
                        : ""}
                    </li>`,
                )}
              </ul>
            `,
          )}
      <h3>${this.t("report.summary-title")}</h3>
      <ul class="lines">
        <li>
          ${this.t(
            "report.summary.zones",
            "created",
            counts.zonesCreated,
            "filled",
            counts.zonesFilled,
            "used",
            counts.zonesUsed,
          )}
        </li>
        <li>
          ${this.t(
            "report.summary.programs",
            "created",
            counts.programsCreated,
            "updated",
            counts.programsUpdated,
            "removed",
            counts.programsRemoved,
          )}
        </li>
        <li>
          ${this.t(
            "report.summary.supplies",
            "created",
            counts.suppliesCreated,
            "updated",
            counts.suppliesUpdated,
            "removed",
            counts.suppliesRemoved,
          )}
        </li>
      </ul>
      ${!this.fullController
        ? html`<div class="notice">
            ${this.t("report.full-controller-off")}
          </div>`
        : ""}
      ${this.blocked
        ? html`<div class="error" role="alert">
            ${this.t("report.blocked")}
          </div>`
        : html`<div class="note">${this.t("report.nothing-waters")}</div>`}
    `;
  }

  private renderDone(result: IuImportResult): TemplateResult {
    return html`
      <ha-card header="${this.t("title")}">
        <div class="card-content">
          <div class="done" role="status">${this.t("done.title")}</div>
          <ul class="lines">
            <li>
              ${this.t(
                "done.zones",
                "created",
                result.zones_created.length,
                "updated",
                result.zones_updated.length,
              )}
            </li>
            <li>${this.t("done.programs", "count", result.programs.length)}</li>
          </ul>
          <div class="note">
            ${this.fullController
              ? this.t("done.next")
              : this.t("done.next-off")}
          </div>
          <div class="si-form-actions">
            <ha-button
              appearance="filled"
              @click=${() =>
                navigate(
                  this,
                  exportPath(this.fullController ? "programs" : "general"),
                )}
            >
              ${this.fullController
                ? this.t("done.open-programs")
                : this.t("done.open-settings")}
            </ha-button>
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
      h4 {
        margin: 12px 0 2px;
        color: var(--primary-text-color);
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
      .choice {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 12px;
        margin: 8px 0;
        cursor: pointer;
      }
      .choice.selected {
        border-color: var(--primary-color);
      }
      .choice.disabled {
        cursor: default;
        opacity: 0.7;
      }
      .choice-title {
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .choice-help {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 2px;
      }
      textarea.yaml {
        width: 100%;
        box-sizing: border-box;
        font-family: var(--code-font-family, monospace);
        font-size: 0.85em;
        padding: 8px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        resize: vertical;
      }
      .rows {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin: 8px 0;
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
      }
      .row-head select.field {
        flex: 0 1 260px;
        min-width: 0;
        max-width: 100%;
      }
      /* On a phone the choice takes its own line, whatever the name's length. */
      @media (max-width: 600px) {
        .row-head select.field {
          flex: 1 1 100%;
        }
      }
      .row.conflict {
        border-color: var(--error-color, #b71c1c);
      }
      .row-error {
        font-size: 0.9em;
        margin-top: 6px;
      }
      .row-help {
        color: var(--secondary-text-color);
        font-size: 0.9em;
        line-height: 1.4;
        margin-top: 4px;
        overflow-wrap: anywhere;
      }
      .badge {
        font-size: 0.8em;
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        padding: 1px 8px;
        color: var(--secondary-text-color);
      }
      ul.lines {
        margin: 4px 0;
        padding-left: 20px;
        color: var(--primary-text-color);
        line-height: 1.5;
        overflow-wrap: anywhere;
      }
      .path {
        color: var(--secondary-text-color);
        font-size: 0.85em;
      }
      .step-count {
        color: var(--secondary-text-color);
        font-size: 0.9em;
      }
      .si-form-actions {
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }
      .error {
        color: var(--error-color, #b71c1c);
        margin-top: 8px;
      }
      .done {
        font-size: 1.1em;
        font-weight: 600;
        color: var(--success-color, var(--primary-text-color));
      }
    `;
  }
}
