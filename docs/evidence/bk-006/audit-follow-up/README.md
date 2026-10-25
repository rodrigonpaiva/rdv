# BK-006 audit follow-up — P2/P3 corrections

Date: October 25, 2026. Branch: `fix/bk-006-foundation-audit`. Base: `6c85c454822d3695b42cebf3c0cb20a01bae61df`. Status: all five requested corrections implemented and author-verified; no independent review of this follow-up claimed. No task-checkout commit/push, merge or deployment performed. The isolated verification snapshot has its own temporary local commit.

## Scope and corrections

Sources: English backlog BK-002, BK-004 and BK-006; technical specification sections 3–4, 20–21 and 23; root AGENTS. Existing domain/application, public API, OpenAPI, migration SQL, dependencies and lockfile are unchanged.

| Finding | Correction | Evidence |
| --- | --- | --- |
| P2: obsolete compiled files could enter an artifact | Root build orchestration clears each selected workspace's output (`dist`, or web `.next`) and incremental state before rebuilding, preserving source files | Regression executes the real orchestration across eight fixture workspaces; exact quality/artifact pipeline in an isolated source snapshot removes eight seeded obsolete files, produces 230 payload files, and passes all archive hashes |
| P2: migration CLI silently skipped a symlink entry | CLI detection resolves the entry path before comparing it with the module path, and safely handles import-only invocation from stdin | Canonical and symlink CLI invocations both reject missing configuration with exit 1; importing from stdin has no CLI effect; real PostgreSQL migration tests pass |
| P2: bare Node builtin imports escaped architecture checks | Web/UI imports and dependency closure recognize Node builtins directly; application checks normalize aliases of the existing restricted builtins | Bare/prefixed filesystem imports, builtin subpaths, process/network modules and transitive manifest dependency probes are rejected; permitted shared imports remain covered |
| P3: default clean verification overwrote BK-003 evidence | Default reports go to ignored `.artifacts/verification/`; explicit task reports append unique names with exclusive creation | Actual `npm run verify:clean -- --database` completes without a task; regression preserves a historical sentinel across default and repeated task-scoped writes; historical report hashes unchanged |
| P3: README said lint/CI were unimplemented | Root README, AGENTS and CI instructions describe actual capabilities, build cleanup and report destinations | Diff review; documented commands executed below |

## Executed verification

Runtime: Node 24.22.1, npm 12.2.1. Commands:

- `npm run lint`, `npm run test:ci`, `npm run test:boundaries`, `npm run test:clock`: focused regressions passed.
- `npm run verify:clean -- --database`: offline locked install, lint, CI tests, contracts/drift, boundaries, full build, HTTP/configuration/clock/CLI tests, smoke/canaries, all workspace types and disposable PostgreSQL passed. [Clean report](clean-verification.json). This is a new follow-up report, not a replacement for historical BK evidence.
- `npm run ci:quality` and `npm run ci:artifact` in a committed isolated snapshot seeded with obsolete outputs in all eight workspaces: passed. All eight obsolete files were removed and excluded from the archive. All 230 payload hashes matched. [Pipeline and archive proof](pipeline-verification.json).
- `npm run build` in the working checkout: passed; the previously observed obsolete `packages/contracts/dist/generated/sdk.gen.js` is absent afterward.
- Historical `docs/evidence/bk-*/clean-verification.json` files and `package-lock.json`: SHA256 identical before/after verification.
- `git diff --check`: passed.

Full pipeline total: 44 tests (5 CI, 10 boundaries, 7 contracts, 18 configuration, 3 clock/CLI/target, 1 real PostgreSQL integration), plus non-test gates. Sandbox restrictions required approved execution with loopback and Docker access. Only synthetic/disposable database targets were used.

Not executed: remote GitHub workflow or independent review for this follow-up, deployment, provider activation or business functionality outside the foundation. Earlier BK-006 remote acceptance remains historical evidence for its original commit. Next owner: reviewer/coordinator for this correction slice; BK-007 and subsequent domain tasks remain separate work.

## Final consolidation of all local corrections

The final combined correction slice, including source-copy symlink rejection and report retention, was tested through the exact quality/artifact commands in a fresh committed local snapshot. All 48 tests and other gates passed; every one of 230 payload files and 155 source hashes matched. A macOS tar metadata-sidecar discrepancy discovered by exact archive comparison was corrected and covered by a real archive regression. Committed controlled lint failure and changed-output packaging rejection passed. See [final consolidation evidence](final-consolidation/README.md). Earlier 44-test evidence above remains historical rather than being overwritten. No new remote execution or independent acceptance is claimed.
