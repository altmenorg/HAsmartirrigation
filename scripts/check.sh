#!/usr/bin/env bash
# Run every check the CI runs, before pushing (#979).
#
#   scripts/check.sh           everything
#   scripts/check.sh python    only the Python checks
#   scripts/check.sh panel     only the panel checks
#
# It expects the test requirements installed (pip install -r
# requirements.test.txt, plus mypy) and the panel's (npm ci in the frontend
# folder). Set PYTHON to pick the interpreter, for example PYTHON=.venv/bin/python.
set -euo pipefail

cd "$(dirname "$0")/.."
PYTHON="${PYTHON:-python3}"
# The tests read texts with typographic quotes: UTF-8 on Windows too.
export PYTHONUTF8=1
WHAT="${1:-all}"
FRONTEND=custom_components/smart_irrigation/frontend
failed=()

step() {
  local name="$1"
  shift
  echo
  echo "=== $name"
  if "$@"; then
    echo "--- $name: ok"
  else
    echo "--- $name: FAILED"
    failed+=("$name")
  fi
}

if [[ "$WHAT" == all || "$WHAT" == python ]]; then
  step "pytest" "$PYTHON" -m pytest tests/ -n auto -q
  step "ruff" "$PYTHON" -m ruff check custom_components/smart_irrigation/ tests/ scripts/
  step "black" "$PYTHON" -m black --check -q custom_components/smart_irrigation/ tests/ scripts/
  step "version" "$PYTHON" scripts/check_version.py
  step "docs links" "$PYTHON" scripts/check_links.py
  step "mypy" "$PYTHON" scripts/mypy_baseline.py
fi

if [[ "$WHAT" == all || "$WHAT" == panel ]]; then
  step "eslint" npm --prefix "$FRONTEND" run lint --silent
  step "vitest" npm --prefix "$FRONTEND" run test --silent
  step "bundle" bash -c "cd '$FRONTEND' && npx rollup -c --bundleConfigAsCjs >/dev/null && cd - >/dev/null && git diff --exit-code --stat -- '$FRONTEND/dist'"
fi

echo
if ((${#failed[@]})); then
  echo "Failed: ${failed[*]}"
  exit 1
fi
echo "All checks passed."
