# BK-004 — Database foundation evidence

Date: October 24, 2026. Status: complete for the foundation scope; independently accepted. See [review](review.md). Branch: `feat/bk-004-database`. Base: `b99cb68`. No commit, push, merge or deployment was performed.

## Acceptance evidence

| BK-004 criterion | Implementation | Executed evidence |
| --- | --- | --- |
| Empty database receives versioned migrations without manual intervention | Prisma config/schema, committed SQL migration, automated disposable provisioning | Two fresh database cycles; each applies the initial migration and verifies migration history and `btree_gist` |
| Synthetic fixtures for two tenants and controllable test clock | Transactional idempotent fixture helper, stable UUIDs/names, injected ManualClock | Two rows per cycle with exact fixed UTC timestamps, repeated seeding preserves rows; clock boundary/invalid-advance/defensive-copy tests pass |
| Migration/application roles are distinct | Separate non-superuser login roles; migration owns tables, application receives explicit DML and fail-closed anchor RLS | Real application connection cannot create/alter/drop/truncate, create schemas/extensions, read migration history or assume migration role; both roles have no superuser/CREATEDB/CREATEROLE/replication/BYPASSRLS |

The database test redeploys on populated data and compares every tenant field before/after. It then closes database connections, drops only its own disposable `rdv_test`, recreates it and repeats. The RLS anchor checks no-context denial, each tenant's visibility, permitted own-row update, denied cross-tenant update and transaction-local context clearing on a reused connection. This is not evidence for future membership/capability enforcement, full connection pooling, business FKs, scheduling or monetary invariants.

## Executed commands and results

The isolated BK-002 Node 24.22.1/npm 12.2.1 runtime was reused with `/tmp/rdv-bk002-npm-cache`; global runtime installations were not changed.

- `docker buildx imagetools inspect postgres:18.6-bookworm`: confirmed official multi-platform digest `sha256:bbf83594798e144bff365a9c191c5d779f181fb3135902064ab8ff11918020fc`.
- `docker pull` with that digest: passed. Real server test confirms version 18.6.
- `npm install`: pinned Prisma 7.10.1 and pg 8.23.1, generated root lockfile. No existing package version changed; no force/engine bypass used. npm 12 blocked dependency install scripts; Prisma fetched/used its native engine at CLI execution.
- `npm run test:database`: passed against real disposable PostgreSQL, four deploy calls across two database cycles.
- `npm run verify:clean -- bk-004 --database`: passed in an artifact-free temporary source copy, with unchanged lock SHA256. See [machine-readable sanitized output](clean-verification.json).
- Clean-copy `npm ci --offline --no-audit --no-fund`: passed.
- Clean-copy `npm run check`: passed; 9 architecture tests, complete build, 18 configuration tests, 2 clock/target-guard tests, real API/worker/web smoke, client secret-canary check (9 artifacts).
- Clean-copy `npm run typecheck`: passed for all workspaces.
- Clean-copy `npm run test:database`: passed, including the final extension denial and tenant update checks.
- `git diff --check`: passed.
- `docker ps -a --filter label=rdv.task=BK-004`: no remaining test containers after cleanup.

Initial sandbox-only attempts could not start Docker, write Git refs or access Docker/Prisma cache. Approved local execution started the installed Docker Desktop, created the task branch and completed checks. No validation was weakened. Docker Desktop remains running; tests removed their own containers. Nonblocking npm warnings about the inherited `global-ignore-file` setting did not affect results.

## Scope, recovery and next owner

Sources: English backlog BK-004 (dependency BK-003); ET sections 6–8, 20–21 and 23; ADR00/02. Cross-cutting RF/CA enabler, no dedicated wireframe or product UI change.

Delivered files: `database/` schema/bootstrap/migration/instructions, `scripts/database/` harness/fixtures/target guard/tests/image pin, testkit clock, manifest/lockfile, integrated/clean verification scripts, root README, AGENTS command inventory and coordination record. No business API/event contract changed.

The initial migration is additive. Keep it when rolling application code back; do not edit an applied migration. The reset procedure applies only to the test-owned disposable database. Production recovery/backup is not implemented by this task.

Not executed: staging/production migrations, production vault/role provisioning, real provider activation, business authorization/RLS matrix, scheduling concurrency or financial tests. These depend on their own backlog tasks and were not part of this foundation. Prisma client/adapter repositories are not yet needed or introduced; application processes retain BK-003 secret-reference behavior.

Independent review: accepted by `/root/bk004_review` with no blocking findings; focused checks independently reproduced in an artifact-free copy. Broader check/typecheck evidence was inspected rather than rerun. Populated redeployment is not evidence of a future schema-version upgrade. See [full review](review.md).

Next owner: coordinator for dependent task selection; BK-009 can build authenticated tenant context and composite business FKs on this tested foundation. BK-006 can make `test:database` a CI gate. Reproduction and operational details are in [database instructions](../../../database/README.md).
