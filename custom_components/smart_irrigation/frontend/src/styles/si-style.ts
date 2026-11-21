import { css } from "lit";

/**
 * The panel's one shared sheet (#1059): every page loads it, and styles here
 * what more than one page uses. A page keeps in its own styles only what is
 * its own (a chart, a timeline). The building blocks:
 *  - spacing on a 4 px scale (--si-space-1 to --si-space-5);
 *  - cards: HA's ha-card, and the collapsible .si-card / .si-head / .si-body;
 *  - a part of a card: .si-section (its title), .si-subgroup;
 *  - settings: .setting-row, .setting-label, the fields (.field, .select-wrap,
 *    .num-field, .entity-field);
 *  - text: .si-hint (under a label), .si-note (a sentence that explains),
 *    .si-box (a note set apart);
 *  - folds: details.fold (a program, a step, a schedule), details.more;
 *  - buttons: .si-actions, .si-form-actions.
 */
export const siStyle = css`
  :host {
    --si-space-1: 4px;
    --si-space-2: 8px;
    --si-space-3: 12px;
    --si-space-4: 16px;
    --si-space-5: 24px;
  }

  /* Existing common styles */
  ha-card {
    display: flex;
    flex-direction: column;
    margin: 5px;
    max-width: calc(100vw - 10px);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
  }
  .card-header .name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span.dialog-header {
    font-size: 24px;
    letter-spacing: -0.012em;
    line-height: 48px;
    padding: var(--si-space-3) var(--si-space-4) var(--si-space-4);
    display: block;
    margin-block: 0px;
    font-weight: 400;
  }

  div.warning {
    color: var(--error-color);
    margin-top: 20px;
  }

  ha-dialog div.wrapper {
    margin-bottom: -20px;
  }

  ha-textfield {
    min-width: 220px;
  }

  a,
  a:visited {
    color: var(--primary-color);
  }
  ha-card settings-row:first-child,
  ha-card settings-row:first-of-type {
    border-top: 0px;
  }

  ha-card > ha-card {
    margin: 10px;
  }

  /* Common utility classes shared across views */
  .hidden {
    display: none;
  }

  .loading-indicator {
    text-align: center;
    padding: 20px;
    color: var(--primary-text-color);
    font-style: italic;
  }

  .saving {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Disabled input styling */
  button:disabled,
  select:disabled,
  input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Common line/row layouts */
  .zoneline,
  .mappingsettingline,
  .schemaline {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--si-space-3);
    align-items: center;
    margin-left: 0;
    margin-top: var(--si-space-2);
    padding: 6px var(--si-space-2);
    border-bottom: 1px solid var(--divider-color);
    font-size: 0.9em;
  }

  .zoneline label,
  .mappingsettingline label,
  .schemaline label {
    color: var(--primary-text-color);
    font-weight: 500;
  }

  .zoneline input,
  .zoneline select,
  .mappingsettingline input,
  .mappingsettingline select,
  .schemaline input,
  .schemaline select {
    justify-self: end;
  }

  /* Common container styles */
  .zone,
  .mapping {
    margin-top: 25px;
    margin-bottom: 25px;
  }

  /* Mapping-specific container */
  .mappingline {
    margin-top: var(--si-space-4);
    padding: var(--si-space-2);
    border: 1px solid var(--divider-color);
    border-radius: 4px;
  }

  /* Radio button group styling */
  .radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--si-space-3);
    margin: var(--si-space-2) 0;
  }

  .radio-group label {
    display: flex;
    align-items: center;
    gap: var(--si-space-1);
    cursor: pointer;
  }

  .radio-group input[type="radio"] {
    margin: 0;
  }

  input[type="radio"] {
    margin-right: 5px;
    margin-left: 10px;
  }

  input[type="radio"] + label {
    margin-right: 15px;
  }

  /* Strikethrough utility */
  .strikethrough {
    text-decoration: line-through;
  }

  /* Information text styling */
  .information {
    margin-left: 20px;
    margin-top: 5px;
  }

  /* Calendar and weather table styles */
  .watering-calendar,
  .weather-records {
    margin-top: var(--si-space-4);
    padding-top: var(--si-space-4);
    border-top: 1px solid var(--divider-color);
  }

  .watering-calendar h4,
  .weather-records h4 {
    margin: 0 0 var(--si-space-3) 0;
    font-size: 1em;
    font-weight: 500;
    color: var(--primary-text-color);
  }

  .calendar-table {
    grid-template-columns: 1fr 0.8fr 1fr 0.8fr 0.8fr;
  }

  .calendar-info {
    margin-top: var(--si-space-2);
    padding: var(--si-space-1) var(--si-space-2);
    background: var(--info-color, var(--primary-color));
    color: white;
    border-radius: 4px;
    font-size: 0.8em;
  }

  /* --- collapsible card: a plain ha-card with a clickable header --- */
  .si-card {
    overflow: hidden;
  }
  .si-head {
    display: flex;
    align-items: center;
    gap: var(--si-space-3);
    padding: var(--si-space-3) var(--si-space-4);
    cursor: pointer;
    user-select: none;
  }
  .si-head:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }
  .si-head-text {
    flex: 1 1 auto;
    min-width: 0;
  }
  .si-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .si-title {
    font-size: 1.15rem;
    font-weight: 500;
    color: var(--primary-text-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 0 1 auto;
    min-width: 0;
  }
  .si-sub {
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }
  .si-chevron {
    flex: 0 0 auto;
    color: var(--secondary-text-color);
    transition: transform 0.2s ease;
  }
  .si-chevron.open {
    transform: rotate(180deg);
  }
  .si-body {
    padding: var(--si-space-3) var(--si-space-4) var(--si-space-4);
    border-top: 1px solid var(--divider-color);
  }

  /* The figures under a card's title (a zone's last calculation...). */
  .si-meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--si-space-2) 28px;
    padding: var(--si-space-1) 0 var(--si-space-3);
  }

  /* A small pill that states something (what a zone would water): tinted
     when it calls for attention, grey when it does not. */
  .si-chip {
    display: inline-flex;
    align-items: center;
    gap: var(--si-space-1);
    padding: 2px 10px;
    border-radius: 12px;
    font-size: 0.85em;
    font-weight: 500;
    white-space: nowrap;
    background: var(--secondary-background-color, #f0f0f0);
    color: var(--secondary-text-color);
  }
  .si-chip.on {
    background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
    color: var(--primary-color);
  }

  /* --- native HA state pill (ha-label), tinted by state --- */
  ha-label.state-label {
    flex: 0 0 auto;
    --ha-label-background-color: rgba(
      var(--rgb-disabled-text-color, 120, 120, 120),
      0.15
    );
  }
  ha-label.state-label--automatic {
    --ha-label-background-color: rgba(
      var(--rgb-success-color, 67, 160, 71),
      0.18
    );
  }
  ha-label.state-label--manual {
    --ha-label-background-color: rgba(
      var(--rgb-warning-color, 255, 166, 0),
      0.22
    );
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .meta-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--secondary-text-color);
  }
  .meta-value {
    color: var(--primary-text-color);
    font-weight: 500;
  }

  /* --- settings rows --- */
  .settings {
    display: flex;
    flex-direction: column;
  }
  .setting-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--si-space-4);
    min-height: 52px;
    padding: var(--si-space-1) 0;
    border-bottom: 1px solid var(--divider-color);
  }
  .setting-row:last-child {
    border-bottom: 0;
  }
  .setting-label {
    color: var(--primary-text-color);
    font-weight: 500;
  }
  .setting-label .unit {
    color: var(--secondary-text-color);
    font-weight: 400;
    font-size: 0.85em;
  }

  /* --- Section title: a part of a card (a zone's "What it needs", a
     program's "Schedules", the rain forecast of Skip watering). One look on
     every page (#1059). --- */
  .si-section {
    font-size: 1.15rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--primary-text-color);
    margin: var(--si-space-5) 0 var(--si-space-2);
  }
  .si-section:first-child {
    margin-top: 0;
  }
  .si-section:last-child {
    margin-bottom: 0;
  }

  /* --- A choice of a few views or ranges, side by side (the planning's
     3, 7 or 14 days, a group's 24 h, 3 or 7 days of readings). --- */
  .si-segmented {
    display: inline-flex;
    border: 1px solid var(--divider-color);
    border-radius: 16px;
    overflow: hidden;
    margin: var(--si-space-1) 0 var(--si-space-2);
  }
  .si-segmented button {
    border: 0;
    background: none;
    color: var(--primary-text-color);
    font: inherit;
    font-size: 0.85em;
    padding: var(--si-space-1) var(--si-space-3);
    cursor: pointer;
  }
  .si-segmented button.on {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  /* --- A data table, as Home Assistant draws one: a quiet header kept in
     sight, rows on a hairline, every other one lightly banded, numbers
     aligned on the right. A grid whose header and rows are
     display: contents; the columns are set by the table's own class. --- */
  .si-table-scroll {
    overflow: auto;
  }
  .si-table-scroll.tall {
    max-height: 420px;
  }
  .si-table {
    display: grid;
    width: max-content;
    min-width: 100%;
    font-size: 0.9em;
    font-variant-numeric: tabular-nums;
  }
  .si-table .si-thead,
  .si-table .si-tr {
    display: contents;
  }
  .si-table .si-thead > span {
    position: sticky;
    top: 0;
    z-index: 1;
    padding: var(--si-space-2) var(--si-space-3);
    background: var(--card-background-color, #fff);
    border-bottom: 1px solid var(--divider-color);
    color: var(--secondary-text-color);
    font-weight: 500;
    white-space: nowrap;
  }
  .si-table .si-tr > span {
    padding: var(--si-space-2) var(--si-space-3);
    border-bottom: 1px solid var(--divider-color);
    color: var(--primary-text-color);
  }
  .si-table .si-tr:nth-child(odd) > span {
    background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.03);
  }
  .si-table .num {
    text-align: end;
    white-space: nowrap;
  }
  .si-table .muted {
    color: var(--secondary-text-color);
  }
  .si-table .si-thead .unit {
    display: block;
    font-weight: 400;
    font-size: 0.85em;
  }

  /* --- Text building blocks: one look each, on every page (#1059) ---
     A hint is a line of small grey text under a label or a field. A note is
     a sentence or two that explains, in the flow of a card. A box is a note
     that must be seen (a caveat, a warning), set apart by its background. */
  .si-hint {
    font-size: 0.8rem;
    font-weight: normal;
    line-height: 1.4;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }
  .si-hint.warn {
    color: var(--warning-color, #ff9800);
  }
  .si-note {
    font-size: 0.9rem;
    font-weight: normal;
    line-height: 1.4;
    color: var(--secondary-text-color);
    margin: var(--si-space-2) 0;
  }
  .si-note:first-child {
    margin-top: 0;
  }
  .si-note:last-child {
    margin-bottom: 0;
  }
  /* A hint or a note about the row above it: under it, as close as a hint
     under a label, and the row gives up its line. */
  .setting-row:has(+ .si-hint),
  .setting-row:has(+ .si-note),
  .setting-row:has(+ .si-box) {
    border-bottom: 0;
  }
  .setting-row + .si-hint,
  .setting-row + .si-note {
    margin: -4px 0 var(--si-space-3);
  }
  .si-box {
    display: flex;
    gap: var(--si-space-3);
    align-items: flex-start;
    padding: var(--si-space-3);
    margin: var(--si-space-2) 0;
    border-radius: 8px;
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    font-size: 0.9rem;
    line-height: 1.4;
  }
  .si-box.warn {
    background: rgba(var(--rgb-warning-color, 255, 166, 0), 0.12);
    color: var(--primary-text-color);
  }
  .si-box > ha-icon,
  .si-box > ha-svg-icon {
    flex: none;
  }
  .si-box.warn > ha-icon,
  .si-box.warn > ha-svg-icon {
    color: var(--warning-color, #ffa600);
  }
  .si-note code,
  .si-hint code {
    font-family: var(--ha-font-family-code, monospace);
    background: var(--secondary-background-color);
    padding: 1px 6px;
    border-radius: 4px;
    color: var(--primary-text-color);
  }

  /* Folded blocks of the Programs page: a program, a step, a schedule. */
  details.fold {
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    margin: var(--si-space-2) 0;
    padding: 0 var(--si-space-3);
  }
  details.fold > summary {
    cursor: pointer;
    padding: 10px 0;
    list-style: none;
    display: flex;
    align-items: center;
    gap: var(--si-space-2);
  }
  details.fold > summary::-webkit-details-marker {
    display: none;
  }
  /* The chevron of a collapsible card (.si-chevron): grey, on the right,
     pointing down while closed and up once open (#1059). */
  details.fold > summary::after {
    content: "";
    flex: 0 0 auto;
    order: 99;
    width: 7px;
    height: 7px;
    margin: 0 8px 4px 4px;
    border-right: 2px solid var(--secondary-text-color);
    border-bottom: 2px solid var(--secondary-text-color);
    transform: rotate(45deg);
    transition: transform 0.2s ease;
  }
  details.fold[open] > summary::after {
    margin-bottom: -4px;
    transform: rotate(-135deg);
  }
  /* A summary line with a switch on its right (a step's or a schedule's
     "on"): the text takes the room, the switch keeps its own. */
  details.fold > summary .fold-head {
    display: flex;
    flex: 1;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: var(--si-space-3);
  }
  details.fold > summary .fold-head-text {
    flex: 1;
    min-width: 0;
  }
  details.fold[open] > summary {
    border-bottom: 1px solid var(--divider-color);
    margin-bottom: var(--si-space-2);
  }
  /* "More options" inside a step or a schedule: lighter than a fold, a line
     to open and the rarely used settings under it. */
  details.more {
    margin: var(--si-space-2) 0;
  }
  /* A chevron, as Home Assistant's own expandable rows have, rather than the
     browser's triangle: that one reads as a play icon, and sat right above the
     Run now button, which has one. */
  details.more > summary {
    cursor: pointer;
    padding: 6px 0;
    color: var(--primary-color);
    list-style: none;
    display: flex;
    align-items: center;
    gap: var(--si-space-2);
  }
  details.more > summary::-webkit-details-marker {
    display: none;
  }
  details.more > summary::before {
    content: "";
    width: 6px;
    height: 6px;
    margin-left: 2px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(-45deg);
    transition: transform 0.15s;
  }
  details.more[open] > summary::before {
    transform: rotate(45deg);
  }
  details.more > .more-body {
    border-left: 2px solid var(--divider-color);
    padding-left: var(--si-space-3);
  }
  /* Inside a folded block: room under its last buttons, and titled sections. */
  .fold-body {
    padding-bottom: var(--si-space-3);
  }
  .si-actions:not(:last-child) {
    margin-bottom: var(--si-space-3);
  }
  .fold-title {
    font-weight: 500;
  }
  /* A title with the switch that turns it on, on its right: no "Enabled". */
  .si-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--si-space-3);
  }
  /* The title wraps, the switch keeps its size and its line. */
  .si-head > span:first-child,
  .setting-row:has(> ha-switch) > .setting-label {
    flex: 1 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .si-head > ha-switch,
  .setting-row > ha-switch,
  .fold-head > ha-switch {
    flex: 0 0 auto;
  }

  /* HA entity picker: sized like the other controls, but it brings its own
     input chrome, so it must not get the .field text-input background. */
  .entity-field {
    flex: 0 0 auto;
    width: 360px;
    max-width: 100%;
  }

  /* --- per-field sub-group: section heading + its controls (shared by views) --- */
  .si-subgroup {
    padding: var(--si-space-3) 0;
    border-bottom: 1px solid var(--divider-color);
  }
  .si-subgroup:last-child {
    border-bottom: 0;
  }
  /* A sub-group's title with its switch (the rain sensor, freeze and wind
     checks): it borrowed the collapsible card's head, padding included, so
     each one sat indented inside 24 px of empty space more than its rows
     (#1048). It is a line of the card, not a card's head. */
  .si-section.si-head {
    padding: 0;
    cursor: auto;
    user-select: auto;
  }
  /* Inside a card's content, whose own padding is room enough. */
  .card-content > .si-subgroup:first-child {
    padding-top: 0;
  }
  .card-content > .si-subgroup:last-child {
    padding-bottom: 0;
  }
  /* a sub-group's own setting-rows shouldn't draw their own divider line
     (the sub-group already has one), keeps the nested look clean */
  .si-subgroup .setting-row {
    border-bottom: 0;
    min-height: 44px;
  }

  /* --- unified field style for inputs AND selects (HA filled look) --- */
  .field {
    flex: 0 0 auto;
    width: 360px;
    max-width: 100%;
    height: 44px;
    box-sizing: border-box;
    padding: 0 var(--si-space-3);
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
    font-family: var(--paper-font-body1_-_font-family, inherit);
    line-height: normal;
    transition:
      border-color 0.15s,
      background 0.15s;
  }
  .field:hover {
    border-bottom-color: var(
      --mdc-text-field-hover-line-color,
      var(--primary-text-color)
    );
  }
  .field:focus {
    outline: none;
    border-bottom: 2px solid var(--mdc-theme-primary, var(--primary-color));
  }
  input.field[readonly] {
    opacity: 0.55;
    cursor: not-allowed;
  }
  /* keep the native up/down spinner arrows (they respect the per-field step);
     the spinner is the integrated, compact replacement for external +/- */

  /* number field: native up/down spinner (external +/- buttons removed) */
  .num-field {
    display: inline-flex;
    align-items: center;
    flex: 0 0 auto;
    width: 360px;
    max-width: 100%;
  }
  .num-field .num-input {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
    max-width: none;
    text-align: left;
  }
  .num-field .step-btn {
    display: none;
  }

  /* --- native select with themed chevron --- */
  .select-wrap {
    position: relative;
    flex: 0 0 auto;
    width: 360px;
    max-width: 100%;
    display: inline-flex;
  }
  .select-wrap .field {
    width: 100%;
    max-width: 100%;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    padding-right: 36px;
    cursor: pointer;
  }
  .select-wrap .chev {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    pointer-events: none;
    fill: var(--secondary-text-color);
  }

  /* --- action buttons (native ha-button, tonal) in a 2-col grid --- */
  .si-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--si-space-2);
    margin-top: var(--si-space-4);
    padding-top: var(--si-space-4);
    border-top: 1px solid var(--divider-color);
  }
  /* a variant without the top border/margin (e.g. standalone action cards) */
  .si-actions.plain {
    margin-top: 0;
    padding-top: 0;
    border-top: 0;
  }
  /* The row just above a group of buttons gives up its line to theirs. */
  .setting-row:has(+ .si-actions) {
    border-bottom: 0;
  }
  .si-actions ha-button {
    width: 100%;
  }
  .si-actions ha-button::part(base) {
    justify-content: flex-start;
  }
  .si-actions ha-button::part(label) {
    text-align: left;
  }
  .si-actions ha-button ha-svg-icon,
  .si-form-actions ha-button ha-svg-icon {
    --mdc-icon-size: 18px;
  }
  .si-form-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: center;
    gap: var(--si-space-3);
    padding-top: var(--si-space-2);
  }

  @media (max-width: 600px) {
    .si-actions {
      grid-template-columns: 1fr;
    }
    .setting-row {
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }
    /* A switch stays on the right of its title, never under it (#1049),
       and its row is no taller than the switch needs (#1048). */
    .setting-row:has(> ha-switch) {
      flex-direction: row;
      align-items: center;
      gap: var(--si-space-3);
      min-height: 44px;
    }
    .card-content > .si-subgroup {
      padding: var(--si-space-2) 0;
    }
    .card-content > .si-subgroup:first-child {
      padding-top: 0;
    }
    .card-content > .si-subgroup:last-child {
      padding-bottom: 0;
    }
    .field,
    .select-wrap,
    .num-field {
      width: 100%;
      max-width: 100%;
    }
  }
`;

export const dialogStyle = css`
  /* ha-dialog styles */
  ha-dialog {
    --mdc-dialog-min-width: 400px;
    --mdc-dialog-max-width: 600px;
    --mdc-dialog-heading-ink-color: var(--primary-text-color);
    --mdc-dialog-content-ink-color: var(--primary-text-color);
    --justify-action-buttons: space-between;
  }
  /* make dialog fullscreen on small screens */
  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog {
      --mdc-dialog-min-width: calc(
        100vw - env(safe-area-inset-right) - env(safe-area-inset-left)
      );
      --mdc-dialog-max-width: calc(
        100vw - env(safe-area-inset-right) - env(safe-area-inset-left)
      );
      --mdc-dialog-min-height: 100%;
      --mdc-dialog-max-height: 100%;
      --vertial-align-dialog: flex-end;
      --ha-dialog-border-radius: 0px;
    }
  }
  ha-dialog div.description {
    margin-bottom: 10px;
  }
`;
