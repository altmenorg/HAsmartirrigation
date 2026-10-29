# Irrigation Unlimited test configurations

These files are the test configurations of
[Irrigation Unlimited](https://github.com/rgc99/irrigation_unlimited) by Robert
Cook (@rgc99), copied unchanged from `tests/configs` at commit
`05a5eaa7a7d8ad43bf3f903ce19490ac7f34ce8e` (2026-06-22). Irrigation Unlimited is
MIT licensed; its licence is in `LICENSE` next to this file.

They are used by `tests/test_iu_import_corpus.py` to check the import of an
Irrigation Unlimited configuration (`custom_components/smart_irrigation/iu_import.py`):
every configuration is imported, every option it uses has a rule, and where a
configuration carries IU's expected on/off times (`testing.times[].results`),
the full controller's plan for the imported configuration is compared with
them.

The configurations whose names start with `service_` were left out: their
expected times depend on the services IU's own tests call during the run.
