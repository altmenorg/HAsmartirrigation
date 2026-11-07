"""Check that every place that carries the version says the same one (#979).

The version lives in manifest.json, const.py and the panel's const.ts. Given a
tag (``python scripts/check_version.py v2026.11.0``), the three must also match
it, which the release workflow checks before it attaches the zip.
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INTEGRATION = ROOT / "custom_components" / "smart_irrigation"


def versions() -> dict[str, str]:
    manifest = json.loads((INTEGRATION / "manifest.json").read_text(encoding="utf-8"))
    const_py = re.search(
        r'^VERSION = "([^"]+)"',
        (INTEGRATION / "const.py").read_text(encoding="utf-8"),
        re.M,
    )
    const_ts = re.search(
        r'^export const VERSION = "([^"]+)"',
        (INTEGRATION / "frontend" / "src" / "const.ts").read_text(encoding="utf-8"),
        re.M,
    )
    return {
        "manifest.json": manifest.get("version", ""),
        "const.py": const_py.group(1) if const_py else "",
        "frontend/src/const.ts": const_ts.group(1) if const_ts else "",
    }


def main(argv: list[str]) -> int:
    found = versions()
    expected = argv[1] if len(argv) > 1 else found["manifest.json"]
    wrong = {where: v for where, v in found.items() if v != expected}
    if wrong:
        for where, version in wrong.items():
            print(f"{where} says {version or 'nothing'}, expected {expected}")
        return 1
    print(f"All say {expected}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
