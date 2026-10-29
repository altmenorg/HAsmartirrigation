# Configurations written for the import test

Irrigation Unlimited's own test configurations (in `../irrigation_unlimited`)
leave a case out: none of them has a master (a pump or main valve) with a lead
and a delay after (`preamble`, `postamble`) and expected on/off times. The
configurations here fill such gaps.

They are written for Smart Irrigation, but their expected times are not: each
was run in Irrigation Unlimited's own test harness (`tests/iu_test_support.py`,
`IUExam.run_test`) with `testing.output_events: true`, and the events it printed
are its `results`. In the file `output_events` is back to `false`, so that
IU's harness checks those results, as in its own configurations. The file says
which version of Irrigation Unlimited.

`tests/test_iu_import_corpus.py` imports them and compares the full
controller's switching with those times, as it does for IU's own.
