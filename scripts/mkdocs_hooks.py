"""MkDocs hooks for the documentation site.

The two custom admonitions of the site (styled in docs/assets/stylesheets/extra.css)
get their own default title, as Python-Markdown would otherwise title them
"Yaml-only" and "Advanced":

    !!! yaml-only          -> "YAML only"
    !!! advanced           -> "Advanced mode"

A title given in the page wins: ``!!! yaml-only "Rounds"``.
"""

import re

TITLES = {"yaml-only": "YAML only", "advanced": "Advanced mode"}
UNTITLED = re.compile(
    r"^(?P<lead>[ \t]*(?:!!!|\?\?\?\+?)[ \t]+(?P<kind>yaml-only|advanced)"
    r"(?:[ \t]+[\w-]+)*)[ \t]*$",
    re.M,
)


def on_page_markdown(markdown, **kwargs):
    return UNTITLED.sub(
        lambda m: f'{m.group("lead")} "{TITLES[m.group("kind")]}"', markdown
    )
