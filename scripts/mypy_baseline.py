"""Type check the integration with a ceiling that may only go down (#979).

The code predates type checking, so mypy reports errors on it. Rather than fix
them all at once, the count is recorded in ``scripts/mypy_baseline.txt``: a
change that adds errors fails, a change that removes some is asked to lower the
number, so the count can only go one way.
"""

import re
import subprocess
import sys
from pathlib import Path

BASELINE = Path(__file__).with_name("mypy_baseline.txt")


def main() -> int:
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "mypy",
            "-p",
            "custom_components.smart_irrigation",
            "--ignore-missing-imports",
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    errors = [line for line in result.stdout.splitlines() if ": error:" in line]
    summary = re.search(r"Found (\d+) error", result.stdout)
    if summary is None and errors:
        print(result.stdout)
        return 1
    count = len(errors)
    ceiling = int(BASELINE.read_text(encoding="utf-8").strip())
    print(f"mypy: {count} errors, ceiling {ceiling}")
    if count > ceiling:
        print(result.stdout)
        print(f"{count - ceiling} new type errors. Fix them before merging.")
        return 1
    if count < ceiling:
        print(f"Fewer errors than the ceiling: lower {BASELINE.name} to {count}.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
