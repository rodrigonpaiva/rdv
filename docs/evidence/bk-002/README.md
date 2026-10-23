# BK-002 evidence — Executable workspace

Date: October 23, 2026. Dependency: BK-001 accepted through documentation review. Status: completed, with [independent review accepted](review.md). Register: [coordination](../../planning/coordination.md).

## Delivery

- Eight npm workspaces: web, API, worker, backend, contracts, UI, config and testkit.
- Node 24.22.1, npm 12.2.1 and TypeScript 6.0.3, with exact pins, a single v3 lockfile and explicit exports.
- Next 16.4.3/React 19.3.1 web; Nest 12.2.0 ESM API and worker.
- Diagnostic use case shared between API/worker; pure domain and unexported infrastructure. No scheduling behavior implemented ahead of its task.
- Static architecture guard and negative tests, including real TS aliases, relative imports, re-exports, computed imports and transitive web package closure.

## Acceptance criteria

| BK-002 criterion | Evidence |
| --- | --- |
| API/worker share use cases | Both import `@agenda/backend/application`; smoke checks class identity, Nest DI and the same DTO in the HTTP API and worker |
| Domain does not import ORM/framework/SDK | AST guard executed during build and negative external/type-only import tests; domain sources have no external dependencies |
| Web does not import persistence/secrets | Web/UI dependencies and imports checked; private backend exports; no secret environment in the scaffold |
| Clean installation/build/imports | [clean-verification.json](clean-verification.json): artifact-free copy, offline npm ci, build, smoke and typecheck, unchanged lock hash |

The architecture guard is not a sandbox or universal proof against exfiltration. New import/configuration patterns require proportional review and coverage. Tenant isolation, concurrency, money and providers do not exist yet and are not approved by this smoke check.

## Runtime and dependencies

The official runtime was downloaded into a temporary prefix using system `curl` over TLS and compared against the distributor's SHA256: [runtime-download.json](runtime-download.json). The first Python attempt failed because a local root certificate was missing; TLS verification was not disabled. npm 12.2.1 was installed only in `/tmp/rdv-bk002-npm`, without a global change.

Prefixes used in that session:

```sh
export PATH="/tmp/rdv-bk002-npm/node_modules/.bin:/tmp/rdv-bk002-toolchain/node-v24.22.1-darwin-arm64/bin:$PATH"
export npm_config_cache=/tmp/rdv-bk002-npm-cache
export NEXT_TELEMETRY_DISABLED=1
```

These paths are local/temporary, not portable prerequisites. On another machine, prepare the same versions and use the README commands. Node/React types were queried before installation, with exact versions preserved in [type-versions.json](type-versions.json). Nest CLI/schematics were not installed because the minimal structure was written directly; Prisma, database and queues remain assigned to their respective tasks.

## Commands and results

- `git init -b feat/bk-002-workspace`: succeeded with local write permission granted; the initial sandbox denied creating `.git`. No previous commit, base branch or remote.
- `npm install --cache /tmp/rdv-bk002-npm-cache --no-audit --no-fund`: succeeded, 130 packages; generated package-lock.json with preinstall/engines checks passing. Vulnerability audit was not executed or declared passed.
- `npm run check`: all package/app builds passed; the first sandbox smoke failed with `listen EPERM` on loopback. No logic was changed to hide the restriction; rerunning smoke with local network permission passed.
- `npm run test:boundaries`: nine scenarios passed after strengthening alias and cross-package escape checks.
- `npm run verify:clean`: succeeded in a temporary copy without node_modules/dist/.next; ran `npm ci --offline`, `npm run check` and `npm run typecheck` with the target versions. Complete actual output, lock hash and results are in clean-verification.json. No messages, charges, database, Docker or provider.
- `git diff --check`: passed for tracked files; because there was no commit yet, new sources were additionally checked before delivery, without claiming a review of differences between commits.

## Git status and local sources

During execution, the user confirmed that `plans/` must remain in `.gitignore`. That change was preserved. The folder remains accessible in the workspace but will not exist in a future clone; no `git add -f` was executed. Coordination documentation/ADRs in docs/ and AGENTS remain outside that exclusion.

BK-001 evidence is historical: its script asserted that BK-002 did not yet exist. Do not execute or rewrite that evidence to pretend the condition remains true. Use this task's checks for the current delivery.

## Not executed

Booking, scheduling rules, authentication, migrations/RLS, database, Redis/BullMQ, Pix/WhatsApp/SaaS integrations, AI tools/model, CI and deployment. This task provides no security/financial or commercial approval. The unavailable Docker daemon did not block bootstrap without services, but remains pending for database tasks.
