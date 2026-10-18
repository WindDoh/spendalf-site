# Personal PC runner setup

Prepared 2026-10-18. This branch routes Linux jobs to
`[self-hosted, linux, x64, pc-ci]` and Windows jobs to
`[self-hosted, windows, x64, pc-ci]`. No hosted fallback is configured.
Fork pull requests skip at the job condition before runner assignment; reviewed
contributions need an owned branch. Production stays isolated on iron-oak-prod.

The PC scheduler admits one job across all repositories and operating systems.
Use its below-normal priority and six-logical-CPU budget. Linux jobs run in a
disposable Ubuntu 24.04 guest with its own Docker daemon. Keep native Windows
tools and Unity licensing ready, and do not launch extra listeners manually.

Existing main, manual, monitoring, and production cancellation policies remain.
Where PR cancellation was missing, workflow/PR groups replace superseded work.
Existing locked
installs, security/coverage gates, and dependency caches remain; this historical
branch migration adds no new cache. No credentials or database state are cached.
Source is active only after this commit is pushed; runner runtime verification
and application/release approval remain separate evidence.
