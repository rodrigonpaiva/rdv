# Database foundation (BK-004)

This foundation uses PostgreSQL **18.6**, Prisma Migrate **7.10.1**, and pg **8.23.1**, with Node **24.22.1** / npm **12.2.1**. The official Debian Bookworm image is pinned to its multi-platform digest in [image.mjs](../scripts/database/image.mjs). Docker Desktop/Engine must be running and permit local containers and loopback ports.

## Reproduce from an empty database

At the repository root, after `npm ci`:

```sh
npm run test:database
```

The command builds shared packages, creates a uniquely named disposable container with generated synthetic passwords, publishes PostgreSQL only on a random `127.0.0.1` port, provisions two separate login roles, and applies the committed migrations using `prisma migrate deploy`. No existing database URL is accepted by this harness. On first use Docker downloads the pinned image, and Prisma may download its native schema engine; subsequent offline runs require both caches. npm 12 may report blocked Prisma install scripts; the tested CLI fetches its engine on first invocation without enabling unrelated install scripts.

The test seeds two deterministic tenants, repeats seeding without duplication, deploys again over populated data, checks preservation, recreates the disposable database, and repeats the checks. The finalizer disconnects clients and removes only that test's container and anonymous volumes. Data resides in a container tmpfs; there is no shared development volume. Interrupted/killed processes may leave a container: inspect the `rdv.task=BK-004` label and exact name before removing that specific container. Never prune unrelated containers or volumes.

```sh
npm run verify:clean -- bk-004 --database
```

This additionally proves offline npm installation, integrated foundation checks, typecheck and the real database test in an artifact-free source copy. Docker image and Prisma engine caches must already be available; the database test remains separate from `npm run check`, while BK-006's `npm run ci:quality` includes it as a required gate.

## Schema and roles

[bootstrap.sql](bootstrap.sql) runs once as the disposable cluster administrator, outside a transaction. It creates `rdv_migration` and `rdv_app` with no superuser, role creation, database creation, replication or RLS bypass privileges; neither inherits the other. It creates `rdv_test` owned by the migration role and revokes public database access. The harness assigns fresh passwords without logging them. Bootstrap is local provisioning, not an application migration or a production role-management mechanism.

The initial [migration](migrations/202610240001_foundation/migration.sql) installs trusted `btree_gist` as the migration owner and creates only the root `tenants` anchor. It uses UUIDs and `timestamptz`, defaults tenants to inactive, and explicitly grants application DML on that table. The application owns no schema/table, cannot run DDL, truncate, install extensions, read migration history or assume the migration role. Future tables require explicit reviewed grants; there are no blanket default privileges.

The anchor has fail-closed RLS using transaction-local `app.tenant_id`. The test switches tenants on one connection and checks context clearing after rollback. This is database defense only: setting context is not authentication. No API/worker repository is connected yet. Membership resolution, capabilities, composite business foreign keys and full pooled authorization remain BK-009/BK-010; scheduling constraints remain BK-021. These tests do not prove those future invariants.

`schema.prisma` describes the anchor. SQL migrations are authoritative for extension, policy and grants that Prisma cannot represent. Never use `db push` or modify an applied migration. Add a new migration, prove empty deployment and populated upgrade, then update consumers. The current initial migration is additive; application rollback leaves it in place. Destructive rollback is not provided. Disposable reset is not a production recovery procedure.

## Fixtures and clock

[fixtures.mjs](../scripts/database/fixtures.mjs) contains two clearly synthetic tenant names and stable UUIDs, without contacts or financial records. It receives an explicit migration connection and an injectable `ManualClock`, defaulting to `2026-01-15T12:00:00.000Z`. Seeding is transactional and idempotent; existing rows are not overwritten. `ManualClock` returns defensive dates and advances by explicit integer milliseconds. It does not override the OS, PostgreSQL `CURRENT_TIMESTAMP`, or production time. Future use cases must receive a clock through their own application port.

After building testkit, run focused clock/target-guard checks with `npm run test:clock`; `npm run check` includes them after build.

## Apply migrations to an explicitly provisioned local database

The standalone `npm run db:migrate` requires `APP_ENV=test` or `development` and a separately supplied `MIGRATION_DATABASE_URL`. It accepts only a password-bearing `rdv_migration` connection on loopback to `rdv_test` or `rdv_dev`, with no URL query options. Provision roles/database first as in bootstrap; grant only reviewed privileges. Supply credentials through an ignored local environment or a protected shell environment; never paste them into committed files or command arguments.

This CLI variable is separate from BK-003's runtime `DATABASE_URL` secret reference. API/worker retain their validated resolver contract and do not receive migration credentials. Production migrations, a vault adapter and deployment authorization are outside this local command. Failures suppress raw Prisma connection output to avoid exposing credentials; inspect the sanitized error and provisioning/SQL rather than logging connection URLs.

Technical references: [PostgreSQL role privileges](https://www.postgresql.org/docs/18/sql-createrole.html), [trusted extensions](https://www.postgresql.org/docs/18/sql-createextension.html), [official image](https://hub.docker.com/_/postgres), [Prisma custom migrations](https://www.prisma.io/docs/orm/v7/prisma-migrate/workflows/unsupported-database-features).
