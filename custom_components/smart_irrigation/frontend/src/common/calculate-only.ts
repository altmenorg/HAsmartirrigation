import { html } from "lit";

import { localize } from "../../localize/localize";

/** The note above the Watering tab and the zones while calculating only. */
export const calculateOnlyNote = (lang: string) => html`
  <ha-card>
    <div class="card-content">
      <strong
        >${localize(
          "panels.general.cards.master-switch.calculate-banner",
          lang,
        )}</strong
      >
    </div>
  </ha-card>
`;
