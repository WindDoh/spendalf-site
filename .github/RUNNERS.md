# Runner setup

## Personal PC runners (2026-10-18)

CI selects `[self-hosted, linux, x64, pc-ci]` for Linux jobs and
`[self-hosted, windows, x64, pc-ci]` for Windows jobs. There is no
GitHub-hosted fallback. Fork pull requests are skipped at the job condition,
before runner assignment; validate a reviewed contribution on an owned branch.
Do not run unreviewed fork code or change production runner labels to `pc-ci`.

The PC scheduler admits one job across all repositories and operating systems.
Linux jobs use a disposable Ubuntu 24.04 WSL guest with its own Docker daemon;
the guest is destroyed after the job. Windows jobs require their native tools.
Use the managed PC scheduler instead of launching repository listeners by hand.
Keep its below-normal priority and six-logical-CPU budget while using the PC.
Workflow worker limits supplement that host budget; they do not replace it.

Existing main, manual, release, and monitoring cancellation policies are retained.
Where PR cancellation was missing, workflow/PR groups replace superseded runs.
The global host scheduler controls the PC load independently of those policies. Locked installs and security/coverage gates stay required.
Routing source is active on a branch only after its migration commit is pushed;
default-branch activation and a completed self-hosted job are separate evidence.

The static security workflow has no package installation or compiler workload, so no dependency/build cache is useful. Pages uses its own self-hosted custom workflow and retains its separate deployment queue and protected github-pages environment.

## Public fork validation boundary

Unreviewed fork pull requests cannot run code on the personal PC. Their normal
security job skips, while `Fork review required` remains pending on the deliberately
unprovisioned `[self-hosted, pc-ci-untrusted-fork]` label. This prevents an all-skipped
workflow from appearing green. Never register a runner with that label.

Review the contribution and run the complete security validation from an owned
branch before merging a fork contribution. A pending fork check is not validation
evidence. There is no hosted fallback, and the gate contains no checkout action.
