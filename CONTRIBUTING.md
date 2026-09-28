# Contributing to Smart Irrigation

Smart Irrigation is the official integration, listed by default in HACS and used on a lot of real gardens. Contributions are welcome, and they are reviewed: a pull request gets an answer within a few days, and what is merged is credited by name in the release notes.

## Before you start

- **Bugs**: open an issue with what you expected, what you got, and if you can, the diagnostics file (Settings > Devices & Services > Smart Irrigation > Download diagnostics). It redacts your coordinates and API key.
- **Ideas**: open a discussion first for anything larger than a fix, so we can agree on the design before you spend time on code.
- **Scope**: Smart Irrigation decides *whether and how long* to water, and can drive one valve per zone. Controlling hardware beyond that (master valves, pumps, pressure, third-party controllers) belongs to other integrations; bridges to them, such as blueprints, are welcome.

## Setting up

```bash
git clone https://github.com/altmenorg/HAsmartirrigation
cd HAsmartirrigation
make setup            # a virtual environment with the test requirements
source .venv/bin/activate
```

On Windows without `make`: `python -m venv .venv`, then `.venv\Scripts\activate` and `pip install -r requirements.test.txt`.

Work on the `dev` branch; `master` only receives releases.

## Checks

Every pull request runs these, and they must pass:

```bash
pytest tests/                                       # the test suite
black --check custom_components/smart_irrigation/   # formatting
ruff check custom_components/smart_irrigation/      # lint
```

The panel lives in `custom_components/smart_irrigation/frontend/` (TypeScript and Lit, Node 20):

```bash
cd custom_components/smart_irrigation/frontend
npm ci
npm run build   # the bundle in dist/ is committed with the change
npx vitest run  # the panel's tests
```

Only English is compiled into the bundle, so **a translation does not need a rebuild** (see below). Any other change to `frontend/src/` does.

## Translations

Two sets, both plain JSON, both fine to edit by hand:

| Where | What it holds |
| --- | --- |
| `custom_components/smart_irrigation/frontend/localize/languages/` | the panel's own words |
| `custom_components/smart_irrigation/translations/` | what Home Assistant renders itself: entity names, service fields, the config flow, the repair issues |

`en.json` is the source in both. Copy the key you want to translate from it, keep
the structure, and translate the value. Rules, all checked by the test suite:

- **Keep every placeholder exactly as it is**: `{count}`, `{duration}`, `{zone}`.
  A renamed or dropped one puts a hole in the sentence, or makes the formatter
  throw and the user read `Translation Error`.
- **Leave out what you have not translated.** A missing key falls back to English
  string by string, which is a working panel. An empty string is not a fallback:
  it shows as nothing at all.
- **Do not add keys English does not have.** Nobody will ever see them.
- Two-space indent, real accented characters rather than `é` escapes.

Run `pytest tests/test_translations_match_english.py` to check a file before
opening the pull request. And do not rebuild the bundle for a translation: the
panel fetches the language file at runtime, so the JSON change is the whole
change.

**The translations shipped today were machine-translated**, with the exception of
English and French, and they say so in their commit. They are grammatical and
nobody who speaks the language has read them. Corrections are the most useful
pull request there is right now, however small: one word in one file is welcome.

## What makes a change easy to merge

- **A test that fails without it.** For a bug, the test reproduces it; for a calculation, it checks a known reference (FAO-56 examples, a hand-computed value) rather than whatever the code currently returns.
- **Stored values are metric.** Depths in mm, rates in mm/h, area in m², flow in L/min. They are converted only where they are shown or entered, for installs in imperial (see `units.py`).
- **One change per pull request**, with a commit message that says what was wrong and why the fix is right.
- **Compatibility**: existing installs must keep working after an update. A change to what is stored needs a migration, and a change to what users see or to the numbers it produces is announced in the release notes.
- English for code, comments, commits and pull requests.

## Credits

Code or ideas taken from elsewhere are credited: in the code, in the commit, and in the release notes. Please do the same when you bring something in.
