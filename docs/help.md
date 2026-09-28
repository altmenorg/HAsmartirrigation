---
layout: default
title: Configuration: Help
---
# Help

Start with the [documentation](index.md): installation, configuration (zones, sensor groups, modules), usage, events, services and troubleshooting.

Prefer video? Watch the [tutorial playlist on YouTube (English)](https://youtube.com/playlist?list=PLUHIAUPJHMiakbda92--fgb6A0hFReAo7) or this [community tutorial in German](https://youtu.be/1AYLuIs7_Pw).

Still stuck? Browse the [Discussions](https://github.com/altmenorg/HAsmartirrigation/discussions) and the [Home Assistant community thread](https://community.home-assistant.io/t/smart-irrigation-save-water-by-precisely-watering-your-lawn-garden/).

If that does not help, open an [issue](https://github.com/altmenorg/HAsmartirrigation/issues).

## Help translate {#help-translate}

The panel and the names Home Assistant shows for the integration (entities, buttons, services, the setup dialog) come in 19 languages. Apart from English and French, those translations were machine-made and nobody who speaks the language has read them yet, so some will read oddly.

If yours does, you can fix it on **[Hosted Weblate](https://hosted.weblate.org/engage/smart-irrigation/)**, in the browser: pick the language, correct the string, save. No Git, no build tools. The corrections reach the repository as a pull request and ship with the next release. One word in one string is a welcome contribution.

[![Translation status](https://hosted.weblate.org/widget/smart-irrigation/multi-auto.svg)](https://hosted.weblate.org/engage/smart-irrigation/)

A few rules keep a translation working, and Weblate checks most of them for you:

- **Keep every placeholder as it is**, such as `{count}` or `{duration}`: the integration fills them in.
- **Reuse the words the panel already uses** for the same idea, so a user reads one word on every screen.
- **Leave a string untranslated rather than guess.** An untranslated string shows in English, an empty one shows nothing.

Your language is not in the list? Ask on Weblate or [open an issue](https://github.com/altmenorg/HAsmartirrigation/issues): a new language needs a small change in the panel as well as its translation. Prefer editing the files directly? The [contribution guide](https://github.com/altmenorg/HAsmartirrigation/blob/master/CONTRIBUTING.md#translations) explains how.
