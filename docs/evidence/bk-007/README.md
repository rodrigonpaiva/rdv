# BK-007 — Executable agent guide and task template

Date: October 25, 2026. Status: implemented and author-verified through a clean-clone walkthrough; independent review pending. Branch/base: `docs/bk-007-agent-guide` / `e0aef5c`. The walkthrough performed no task-checkout commit, push, merge or deployment; the user subsequently authorized reviewed commit/push. Git history records publication. The guide-snapshot commit below exists only inside the disposable local clone.

## Delivered criteria

| BK-007 criterion | Delivery | Executed evidence |
| --- | --- | --- |
| Documented commands exist and work | AGENTS 1.1, first-checkout workflow, command prerequisites and existing specialized guides | Every referenced npm script exists in the root manifest; clean offline installation, complete quality/artifact commands, contract regeneration, local process scripts and focused rehearsal checks passed |
| Rules prohibit invented policy/providers, removed constraints and unexecuted-test claims | Existing domain/security protections preserved in AGENTS; task template explicitly forbids bypassing engines/constraints/tests/authorization, inventing policy/provider approval or claiming unexecuted checks | Source/diff review; checklist and rehearsal handoff explicitly distinguish actual runs, omissions, author review and production limits |
| Task package requires objective, references, limits, tests and evidence | Reusable package/handoff with ownership, dependency evidence, RF/CA/invariants, authority, scenarios and stop conditions | [Filled package and handoff](task-package.md), followed before the clone-only comment edit; [losslessly JSON-encoded one-file diff](rehearsal-diff.json) and focused results |

Deliverables: [AGENTS](../../../AGENTS.md), [first-checkout workflow](../../engineering/local-workflow.md), [task template](../../engineering/task-template.md), root README onboarding/safe dotenv guidance and the stale database-CI note corrected. There is no new script, dependency, schema, contract, application or product UI change in the main checkout.

## Completed first-checkout checklist

- [x] Confirmed clean initial Git clone from local source commit `e0aef5c0ebd4e14013822917cba5ad2cbccd1248`.
- [x] Read the task/dependencies and current instructions. Copied only the draft guide/documentation into the clone and made local-only snapshot `e4853ab79bd06ad6fc72bd2c02e2fdb6cd7bf8f3` so clean-commit artifact commands could run. No project history was rewritten.
- [x] Supplied all four English planning sources through the authorized local source copy; verified their hashes and that `plans/` remained ignored and untracked. Sources were not added to Git or duplicated as repository specifications.
- [x] Selected Node 24.22.1/npm 12.2.1 from the isolated runtime, confirmed TypeScript 6.0.3 and installed the root lock offline. No engine/peer bypass or global runtime replacement.
- [x] Followed `npm run ci:quality` and `npm run ci:artifact` on the clean guide snapshot: 48 tests (9 CI, 10 boundaries, 7 contracts, 18 config, 3 clock/CLI/target, 1 disposable PostgreSQL), builds, all-workspace types, real API/worker/web smoke and secret canaries passed. No provider credentials or live external effects.
- [x] Ran contract generation and confirmed zero tracked source drift.
- [x] Created ignored `.env` from the safe template in the clone only. Started the one-shot worker successfully, the API on a chosen loopback port (`/v1/health` returned the diagnostic DTO), and web dev using a separate `PORT` value (page returned 200). Stopped only task-owned process groups.
- [x] Stopped dev and ran the documented production build to regenerate production type references. Confirmed a clean tracked source diff before the rehearsal task.
- [x] Filled the task package before a comment-only change documenting ManualClock.now()'s existing defensive Date copy. Ran lint, all-workspace typecheck and 3 clock/CLI tests; inspected the exact one-file comment diff and completed the handoff.
- [x] Verified that root application source and the lockfile were unchanged. No rehearsal comment was copied into the project checkout.
- [x] Recorded actual command output, limitations and next owner. Author verification is not independent approval.

[Machine-readable walkthrough](summary.json), [full quality output](clean-quality.txt), [artifact output](clean-artifact.txt), [focused rehearsal checks](rehearsal-clock.txt). Other command outputs are stored alongside this file. The temporary clone/proof paths and source hashes are recorded in the summary.

## Findings resolved while following the guide

The initial draft's `npm run dev:web -- --port ...` did not forward flags through the nested npm command and exited with EUNKNOWNCONFIG. The final guide instead uses the tested `PORT` environment override; the successful run uses an isolated random port.

The development server legitimately refreshes tracked `apps/web/next-env.d.ts` to development type paths. The guide now explains inspecting that generated diff and running a production build after stopping dev to restore production references. The final walkthrough includes this command and verifies the source tree is clean before the task edit. Generated framework files were not manually patched or reset.

## Evidence boundaries

The main change is documentation. Existing safety/permission rules remain in force. The clean clone contains a draft evidence placeholder at its guide-snapshot commit; this completed report is the subsequent result, not a claim that it already existed at that snapshot.

Not executed anew: `verify:clean` (unchanged source-copy command already demonstrated in BK-006 correction evidence), standalone manual `db:migrate` against a persistent database (unneeded; disposable migrations and CLI rejection tests ran), live vault/providers, business authorization/scheduling/financial tests, remote CI, commit/push or deployment. Included subcommands and focused checks are recorded as such rather than presented as separate reruns. The final snapshot's complete foundation gate and process scripts were actually executed.

No automated tests that merely mirror documentation were introduced. Manifest consistency, local links and the diff were checked directly. Pre-publication author review found no blocking issue; see [review](review.md). No independent approval is claimed. Next owner: coordinator/reviewer for any remaining independent acceptance; BK-008 or other dependency-ready work remains separate.
