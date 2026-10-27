# Agenda / BR

Initial workspace for the Brazilian scheduling MVP. Temporary brand. BK-002 delivers the executable structure and BK-003 adds validated server configuration; BK-004 adds a real database test foundation and BK-005 adds versioned OpenAPI contracts. Booking, authentication, queues, Pix and WhatsApp will be implemented in their respective backlog tasks.

## Requirements

- Node **24.22.1** and npm **12.2.1**, as specified in ADR00, `.nvmrc`, `.node-version` and `packageManager`.
- Prepare these versions with your runtime manager or an isolated installation. This bootstrap used `/tmp` without changing global Node/npm; paths and checksums are recorded in the [evidence](docs/evidence/bk-002/README.md).
- Docker is required for the separate BK-004 PostgreSQL integration checks; it is optional for the other foundation checks. No database or provider credentials are needed to build and verify the foundation.

Installation rejects incompatible engines. Do not use `--force`, `--legacy-peer-deps` or manual lockfile edits to bypass incompatibility.

## Installation and verification

At the repository root, with the correct runtime:

```sh
node --version
npm --version
npm ci
npm run check
npm run typecheck
```

`check` runs positive/negative boundary tests, builds all eight workspaces, validates OpenAPI/generated drift, runs HTTP contract, configuration and controllable-clock tests, checks client artifacts for secret canaries, and runs real smoke checks: HTTP API, Nest injection/ESM metadata, worker and compiled web application. The `/v1/health` endpoint (and compatibility `/health` alias) only proves the foundation process is running; it does not indicate database, queue or business readiness.

```sh
npm run check:boundaries
npm run test:boundaries
npm run build
npm run smoke
npm run verify:clean
```

`smoke` requires a prior build and available loopback ports. `verify:clean` copies the required sources/configuration into a temporary directory, excludes `node_modules`, `dist`, `.next` and local `.env`/`.env.*` files at every depth (regular `.env.example` templates are retained), runs offline `npm ci`, lint, CI regression tests, `check` and `typecheck`, and checks that the lockfile is unchanged. Included source symlinks are rejected so the temporary copy cannot retain access to excluded or external files. It requires a populated npm cache. By default it writes a uniquely named report to ignored `.artifacts/verification/`, which CI artifact cleanup preserves even when checkout validation fails. An explicit task such as `npm run verify:clean -- bk-006 --database` appends a uniquely named report under `docs/evidence/bk-006/` and includes PostgreSQL. Existing reports are never overwritten, including the historical `clean-verification.json` files. The report path is printed, and the temporary copy is retained for inspection.

## Database integration checks

BK-004 provides versioned Prisma migrations, separate migration/application roles, two synthetic tenants and a controllable test clock. With Docker running, execute `npm run test:database`. For artifact-free reproduction including PostgreSQL, execute `npm run verify:clean -- bk-004 --database`. See [database instructions](database/README.md) for lifecycle, role limits and the local-only migration command. API and worker are not yet connected to persistence.

## API contracts

The canonical OpenAPI 3.1 document and generated client are in [packages/contracts](packages/contracts/README.md). Run `npm run contracts:generate` after a source change and `npm run contracts:check` to verify generation without modifying files. After build, `npm run test:contracts` checks real HTTP validation/errors, bounded cursor primitives and browser typing. `npm run check` includes both contract checks. The only live API operation is the versioned diagnostic; business routes remain assigned to later slices.

## Local execution

Create the safe development configuration if absent (preserve an existing `.env`), then build and run in separate terminals:

```sh
cp -n .env.example .env
npm run build
npm run dev:web
npm run start:api
npm run start:worker
```

- Web: `http://127.0.0.1:3000`.
- Diagnostic API: `http://127.0.0.1:3001/v1/health`.
- Worker: initializes the Nest context, runs the same diagnostic use case as the API and exits. There is no queue consumer yet; that belongs to BK-031.

The web page is only the minimal scaffold entry point, without simulated bookings or fictional integrations. BK-008 provides basic DS 2.0 tokens/components and a development-only internal demonstration at `/internal/design-system`; see [the UI library](packages/ui/README.md). BK-006 provides lint and the GitHub Actions quality workflow; see [CI commands](scripts/ci/README.md).

## Server configuration

API and worker validate configuration and resolve required secrets before creating Nest contexts. `APP_ENV` is mandatory; `NODE_ENV` never selects the business environment. All provider selections are explicit (`disabled` or development/test-only `mock`). No live provider is implemented or activated.

`DATABASE_URL` and `REDIS_URL` contain protected references such as `secret://development/platform/database` and `secret://development/platform/redis`, never connection credentials. The mock store returns synthetic values without connecting. Staging/production require an injected server-side external `SecretResolver`; no vault adapter is included, so the CLI rejects external mode until one is wired. Keep `.env` outside Git.

`PUBLIC_APP_URL` and comma-separated `TRUSTED_ORIGINS` must be canonical origins; staging/production require HTTPS. These values configure trusted origins but do not implement authentication or CSRF protection. API bind defaults to `127.0.0.1:3001`.

Tenant flags come from trusted server-owned snapshots, scoped by tenant and environment. New bot/Pix operations require enabled flags, active integrations and selected adapters. Creation switches preserve reconciliation and refund eligibility. This gate does not replace authorization or implement persistence, auditing, providers or financial operations. Global `BOT_ENABLED`, `PIX_ENABLED` and `TENANT_FLAGS` environment variables are rejected.

```sh
npm run test:config
npm run check:web-secrets
```

The artifact check requires a preceding `npm run build`, which injects synthetic secret canaries. See the [configuration contract](docs/planning/bk-003-configuration.md) and [verification evidence](docs/evidence/bk-003/README.md).

## Organization and boundaries

| Path | Responsibility |
| --- | --- |
| apps/web | Next App Router, React and web composition |
| apps/api | Nest HTTP and use case composition |
| apps/worker | Independent Nest process using the same backend application |
| packages/backend | Domain, application, ports and infrastructure per module; exports only `@agenda/backend/application` |
| packages/contracts | Versioned OpenAPI, public DTOs and generated browser-safe client |
| packages/ui | DS 2.0 tokens/styles, local Inter and basic React components; no domain authority |
| packages/config | Validated server configuration, protected references and tenant flag gates |
| packages/testkit | Synthetic fixtures used exclusively for verification |
| database / infra | Versioned SQL migrations and disposable PostgreSQL test infrastructure; no deployment |

The backend uses ESM/NodeNext; the web uses Bundler resolution. Builds compile shared packages before consumers. Root build orchestration clears each selected workspace’s compiled output and incremental state before building, preventing deleted sources from surviving in delivered binaries. The API and worker import the same `GetWorkspaceInfo` class; there is no second scheduling engine or fictional engine in the bootstrap.

The architecture guard analyzes TS/TSX imports, public exports, resolved aliases, literal `import`/`require` calls, relative paths and transitive dependencies between workspaces. It rejects nonliteral dynamic imports. Domain code does not import external dependencies; application code does not import infrastructure; web/UI do not import backend/config/testkit or known server drivers. This is an architecture guard, not a sandbox or a replacement for security review.

## Documentation and Git

For a first checkout and a small task, follow [the local workflow](docs/engineering/local-workflow.md) and fill [the task package](docs/engineering/task-template.md). Start with [AGENTS.md](AGENTS.md), [decisions](docs/decisions/README.md), the [baseline](docs/planning/bk-001-baseline.md) and [coordination](docs/planning/coordination.md).

Read the English `plans/*.en.md` sources for implementation. All new or updated repository content must be written in English, following the user's instruction. README files have a single English version.

**By explicit user decision, `plans/` remains outside Git.** Functional, technical, DS and backlog sources remain available locally in that folder, but a future clone will not retrieve them automatically. To work on another machine, provide these sources through an authorized channel and preserve their versions; do not recreate rules from missing documents. Local links to `plans/` work in the current workspace.

Git was initialized on branch `feat/bk-002-workspace`. The subsequent authorized BK-001/BK-002 delivery was committed and pushed as `b9c888f`. BK-003 was committed as `b99cb68`. BK-004 was committed and pushed as `c8f2004`. The independently reviewed BK-005 delivery is tracked on `feat/bk-005-api-contracts`; Git history records its commit and publication. Evidence reports describe the exact checks executed and their limitations.

## Quality CI

BK-006 adds lint, a fail-closed GitHub Actions quality workflow, and checksummed build bundles tied to the commit and lockfile. See [CI commands and limits](scripts/ci/README.md). The workflow does not deploy; remote execution evidence is tracked in [BK-006](docs/evidence/bk-006/README.md).
