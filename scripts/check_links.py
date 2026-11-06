"""Check the links between the pages of the docs and their anchors (#979).

Every relative link in ``docs/`` and the README must reach a file that exists,
and a link to ``page.md#section`` must name a heading of that page, as GitHub
and Jekyll turn it into an anchor. Links to other sites are checked weekly by
the link-check workflow instead, since a site that is down for an hour should
not fail a change.
"""

import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LINK = re.compile(r"(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
HEADING = re.compile(r"^(#{1,6})\s+(.*?)\s*#*\s*$")
FENCE = re.compile(r"^\s*(```|~~~)")
EXPLICIT_ID = re.compile(r"""(?:id|name)=["']([^"']+)["']|\{:?\s*#([\w-]+)\s*\}""")


def slug(heading: str) -> str:
    """The anchor GitHub gives a heading."""
    text = re.sub(r"\{:?\s*#[\w-]+\s*\}", "", heading)
    text = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("`", "").strip().lower()
    text = "".join(c for c in text if c in " -_" or unicodedata.category(c)[0] in "LN")
    return text.replace(" ", "-")


def strip_code(lines):
    """The lines outside fenced code blocks, with inline code removed."""
    fenced = False
    for line in lines:
        if FENCE.match(line):
            fenced = not fenced
            continue
        if not fenced:
            yield re.sub(r"`[^`]*`", "", line)


def anchors(page: Path) -> set[str]:
    found: set[str] = set()
    seen: dict[str, int] = {}
    for line in strip_code(page.read_text(encoding="utf-8").splitlines()):
        for match in EXPLICIT_ID.finditer(line):
            found.add(match.group(1) or match.group(2))
        heading = HEADING.match(line)
        if heading:
            base = slug(heading.group(2))
            count = seen.get(base, 0)
            seen[base] = count + 1
            found.add(base if count == 0 else f"{base}-{count}")
    return found


def broken_links(page: Path, cache: dict[Path, set[str]]) -> list[str]:
    problems = []
    lines = page.read_text(encoding="utf-8").splitlines()
    for line in strip_code(lines):
        for match in LINK.finditer(line):
            target = match.group(1)
            if re.match(r"^[a-z][a-z0-9+.-]*:", target, re.I) or target.startswith(
                ("{{", "/")
            ):
                continue
            path, _, anchor = target.partition("#")
            dest = (page.parent / path).resolve() if path else page
            if path and not dest.exists():
                problems.append(f"{page.relative_to(ROOT)}: {target} (no such file)")
                continue
            if anchor and dest.suffix == ".md":
                if dest not in cache:
                    cache[dest] = anchors(dest)
                if anchor not in cache[dest]:
                    problems.append(
                        f"{page.relative_to(ROOT)}: {target} (no such section)"
                    )
    return problems


def main() -> int:
    pages = sorted((ROOT / "docs").glob("*.md")) + [ROOT / "README.md"]
    cache: dict[Path, set[str]] = {}
    problems = [p for page in pages for p in broken_links(page, cache)]
    for problem in problems:
        print(problem)
    print(f"{len(pages)} pages, {len(problems)} broken links")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
