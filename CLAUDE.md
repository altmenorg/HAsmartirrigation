# Working on Smart Irrigation

> **👉 First, read `HANDOFF.md` at the repo root** (it's local / gitignored). It holds the
> current work state, the full session log, the TODO list (translations in progress), and the
> **build & deploy** process (Node, frontend build, deploying to the test HAOS, reload/restart).
> If `HANDOFF.md` is missing (fresh clone elsewhere), ask the user for it — it carries the
> personal infra details that are kept out of this public repo.

## What this is

The [Smart Irrigation](https://github.com/jeroenterheerdt/HAsmartirrigation) Home Assistant
integration: domain **`smart_irrigation`**, branded **Smart Irrigation**.
Backend Python in `custom_components/smart_irrigation/`, frontend panel (TS/Lit) in
`custom_components/smart_irrigation/frontend/`, Jekyll docs in `docs/`.

## Branch workflow

- **Work on `dev`.** Do NOT commit directly to `master`.
- `master` is the clean/release branch (CI must stay green). Merge `dev` → `master`
  (`git merge --ff-only dev`) only when a batch is validated, then bump the version
  (`manifest.json` + `const.py` + `frontend/src/const.ts`, format `vYYYY.M.PATCH`, non-padded
  month), rebuild the bundle, commit `release: vX`, and cut a tag + GitHub Release.
- HACS default requires a release created **after** the validation actions pass green.

## Conventions

- **Public content (commits, PRs, issues, code/comments) in English.** Conversations with the
  user are in French.
- **Python**: format with `py -m black custom_components/smart_irrigation/` and lint with
  `py -m ruff check ...` before pushing — the CI checks both.
- **Frontend**: a change in `frontend/src/` or `frontend/localize/` only takes effect after a
  rebuild (`npm run build`), because the language files are compiled into the bundle.
- Windows host: use `py` (not `python`, a Store stub); Python paths are `C:/...`.
- `gh` CLI: always pass `--repo altmenorg/HAppyIrrigation` (the `upstream` remote makes bare
  `gh run ...` hit jeroenterheerdt's repo).

See `HANDOFF.md` for everything operational (deploy, HAOS access, gotchas, translation status).
