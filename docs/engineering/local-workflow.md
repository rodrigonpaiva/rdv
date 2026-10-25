# First-checkout and task workflow

This guide operationalizes [AGENTS](../../AGENTS.md). The command source is the root `package.json`; source-specific details remain in [database instructions](../../database/README.md), [API contracts](../../packages/contracts/README.md) and [CI instructions](../../scripts/ci/README.md). The executable product is currently a foundation, not a booking service.

## 1. Check the checkout and sources

From the repository root:

```sh
pwd
rg --files -g AGENTS.md -g package.json -g '*lock*' -g '*config*'
git status --short
git branch --show-current
git log -1 --oneline
```

Read root/directory instructions, the selected task and dependency evidence in `docs/planning/coordination.md`, and applicable ADRs. Preserve preexisting changes; do not switch/stash/reset a dirty shared checkout to make room for a task. Use a task branch or isolated checkout according to the actual ownership arrangement. Branch names grant no push/merge/deploy permission.

`plans/` is intentionally ignored. A clone does not contain the product sources. Obtain the four English planning documents through the user's authorized source channel before implementing rules; do not force-add them, create versioned duplicates or reconstruct missing rules. Verify declared versions: functional/technical/backlog 1.0 and DS **2.0 content**. Historical Portuguese-authority headers are superseded for repository execution by AGENTS' English-source instruction, without changing approved Brazilian Portuguese product copy.

## 2. Prepare the exact runtime and installation

Select the versions using your runtime manager or an isolated installation, then check the executables actually used by this shell:

```sh
command -v node
command -v npm
node --version
npm --version
npm ci
```

Required output versions: Node **v24.22.1**, npm **12.2.1**. TypeScript is a local pinned dependency, **6.0.3**; inspect with `node node_modules/typescript/bin/tsc --version` after installation. A host Node 22/npm 10 is not this project's toolchain. Do not install globally merely to hide a mismatch and do not use force/legacy-peer-deps or bypass engines. A `/tmp` installation is acceptable but must be restored after a restart; its path is machine-specific, not a repository requirement.

`npm ci` installs from the root lockfile. `npm ci --offline` is a valid alternate only after populating the cache; a missing cache is an environment failure, not permission to change the lock. Docker must be running for PostgreSQL and the full CI-quality command. The pinned image and Prisma native engine may require an initial download. npm 12 can report blocked Prisma install scripts; do not globally enable arbitrary lifecycle scripts. Existing migration execution downloads/uses the engine on demand, with its own cache/network needs.

## 3. Verify the foundation

For a clean committed checkout, run:

```sh
npm run ci:quality
npm run ci:artifact
```

This is the complete foundation gate: lint, types, CI regressions, contracts/boundaries, builds, HTTP/config/clock tests, real process smoke, client secret canaries and real disposable PostgreSQL. The artifact command checks commit, lock, source and output hashes before producing a local archive; it does not publish or deploy. Failed gates invalidate old receipts/bundles while retaining default verification reports. Ignored local runtime files are not a substitute for a clean tracked/untracked source tree.

For an uncommitted task, use the source-copy verifier instead:

```sh
npm run verify:clean
```

Add `-- --database` when persistence or the complete database gate is relevant. It requires a populated offline cache and loopback; the optional database check also needs Docker. Reports append unique names under ignored `.artifacts/verification/`. An explicit task, for example `npm run verify:clean -- bk-007 --database`, instead appends under `docs/evidence/bk-007/`; this intentionally becomes a versionable task change. Historical reports are never overwritten. Included source symlinks are rejected; regular `.env.example` templates are supported and local dotenv/output entries are excluded without following links.

The lightweight `npm run check` includes build/contract/config/clock/smoke/canary checks, but **does not include lint, CI regression tests, all-consumer typecheck or real PostgreSQL**. Use the complete quality command or the required focused checks, not a weaker substitute. Do not repeatedly rerun broad suites after a pass unless a change, failure or concrete uncertainty justifies it.

## 4. Fill the task package and make one cohesive change

Use [the task template](task-template.md). Record objective, criteria, references, ownership, permissions, limits, positive/negative cases, commands and evidence before editing. If there is no dedicated RF/CA or view, say cross-cutting enabler; do not invent identifiers. A missing external approval is not fixed by a permissive production stub.

Select checks by impact and command prerequisites:

| Change | Commands / prerequisites |
| --- | --- |
| Comment/type-only foundation change | `npm run lint`; `npm run typecheck`; affected focused test after shared package build |
| Architecture/imports | `npm run check:boundaries`; `npm run test:boundaries` |
| Runtime configuration/flags | Build first, then `npm run test:config`; full web build before `npm run check:web-secrets` |
| OpenAPI/client | `npm run contracts:generate` (rewrites owned generated sources), `npm run contracts:check`; build before `npm run test:contracts` |
| Test clock/local migration CLI guard | Build packages first, then `npm run test:clock` |
| Migrations/database roles | `npm run test:database` (builds shared packages and provisions only its own disposable PostgreSQL); apply future upgrade/concurrency cases required by the change |
| CI/archive/build orchestration | `npm run lint`, `npm run test:ci`, complete quality/artifact commands on an isolated committed snapshot if the task checkout is dirty |
| Process smoke | `npm run smoke` only after full build; available loopback ports |

Shared packages build before their consumers. Root build commands clear selected compiled outputs and incremental state; avoid concurrent builds in a shared checkout. Generated contracts must come from their source command. `db:migrate` is a separate local-only operation needing explicitly provisioned roles/database, `APP_ENV=test` or `development` and protected `MIGRATION_DATABASE_URL`; ordinary verification should use the disposable test harness. Never run it against an unconfirmed target or treat it as a production migration procedure.

## 5. Run local processes when the task needs them

Create `.env` from the safe template only if it does not already exist; do not overwrite local settings:

```sh
cp -n .env.example .env
npm run build
```

Run in separate terminals:

```sh
npm run dev:web
npm run start:api
npm run start:worker
```

Defaults are loopback web port 3000 and API port 3001. `/v1/health` and compatibility `/health` report process liveness only. The worker runs the shared diagnostic once and exits; it is not a queue consumer. Template providers are mock/disabled and perform no real outgoing activity. API/worker validate protected references before boot; there is no live database/provider readiness or vault adapter to infer from a started process.

If ports are occupied, select isolated ports: web accepts `PORT=<available-port> npm run dev:web`; API accepts `API_PORT`/`API_HOST` in its validated environment (existing process environment overrides the dotenv file). Use loopback for tests. Stop only processes started for your task, with their normal termination signal; do not kill another task's service to free a port. `next dev` may refresh tracked `apps/web/next-env.d.ts` to development-generated type paths. Inspect that generated diff; when returning to production/type verification, run `npm run build` after stopping dev so Next restores its production references. Do not manually patch the generated file or discard unrelated user changes. Workers/test containers own their cleanup; inspect labels/exact names if a killed test leaves a container, never prune unrelated resources.

## 6. Review and hand off

```sh
git status --short
git diff --stat
git diff --check
```

Inspect new files too: ordinary `git diff` does not show untracked contents. Record real results and limitations using the handoff template. Author verification is not independent review. Keep sensitive output out of evidence. Commit, push, merge and deployment each require current authorization; a task branch or successful archive does not provide it.

## BK-007 rehearsal

The low-risk walkthrough uses a clean local clone, the same guide and authorized ignored English planning sources. After validating the clean foundation, fill a task package to clarify `ManualClock.now()`'s existing defensive-copy behavior using only a comment in that disposable clone. Run lint, types and the clock tests, inspect a one-file comment-only diff, and hand off with a completed checklist. Do not promote that rehearsal comment into the product checkout or claim it changes clock behavior. [Actual executed checklist/results](../evidence/bk-007/README.md) distinguish the local rehearsal commit from any task publication.
