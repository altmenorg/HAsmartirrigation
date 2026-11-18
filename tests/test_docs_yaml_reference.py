"""The YAML reference tables of the docs match what assistants are told.

docs/usage-full-controller.md carries tables generated from config_reference
(scripts/gen_yaml_reference.py). A key added, a range or a default changed in
config_reference without regenerating them would leave the docs saying one
thing and assistants another.
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def test_the_docs_yaml_reference_is_up_to_date():
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "gen_yaml_reference.py"), "--check"],
        capture_output=True,
        text=True,
        cwd=ROOT,
    )
    assert result.returncode == 0, result.stdout + result.stderr
