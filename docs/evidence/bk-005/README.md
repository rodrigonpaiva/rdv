# BK-005 — REST/OpenAPI/client evidence

Date: October 24, 2026. Status: complete for the BK-005 foundation scope; independently accepted after one P2 correction. See [review](review.md). Branch: `feat/bk-005-api-contracts`. Base: `c8f2004`. Verification performed no commit, push, merge or deployment. The user subsequently authorized commit/push after independent acceptance; Git history records publication.

## Planning and acceptance

The English editions of all four planning sources were inventoried, including declared versions, section structure, the 99 task cards/dependencies and DS/RF/CA scope. See [source metadata](source-inventory.json) and [planning analysis](../../planning/bk-005-contracts.md). BK-002 is the accepted prerequisite; BK-003 configuration and BK-004 persistence contracts are preserved. No dedicated wireframe applies.

| Acceptance criterion | Delivered behavior | Actual evidence |
| --- | --- | --- |
| Consistent /v1, public DTOs and input validation | Nest URI versioning defaults to v1, strict schemas derive from canonical OpenAPI, DTOs are generated public fields | Real `/v1/health` and explicit `/health` alias; unknown query fields, wrong types, unknown sensitive/nested fields, missing acceptance, invalid UUID and truthiness inputs rejected |
| Safe code/correlation_id errors without SQL/stack traces | Closed error catalog/filter; safe field root codes; correlation installed before body parsing | Unexpected, framework, typed domain-vocabulary, missing-route, malformed JSON and oversized JSON failures return schema-valid envelopes; synthetic private marker never appears; header/body UUIDs agree |
| Pagination/schemas generate a browser client without ORM | OpenAPI cursor primitives, strict pagination pipe, generated operation/schema types bound to openapi-fetch | Bounds/default/duplicates/nesting/encoding checks over HTTP; generated-client success and failure; strict DOM-only consumer proof without Node types or ORM; deterministic regeneration and real negative drift detection |

The only live diagnostic is process liveness. Proposed business endpoints are not activated. Booking acceptance schemas and stable business error codes are reserved vocabulary; they do not prove quote consumption, authorization, idempotency, scheduling or financial behavior. Test probe controllers never appear in production AppModule or OpenAPI paths.

## Executed checks

Runtime: isolated Node **24.22.1**, npm **12.2.1**, TypeScript **6.0.3**. New pins: openapi-typescript **6.7.6**, openapi-fetch **0.17.0**, Redocly openapi-core **1.34.6**, Ajv **8.20.0**, ajv-formats **3.0.1**. Existing package versions were compared against HEAD's lockfile and did not change.

| Command/check | Result |
| --- | --- |
| Registry metadata / exact-pin install | Completed without force, legacy-peer-deps or engine bypass |
| `npm run contracts:generate` | Canonical OpenAPI validated, public types/runtime snapshot generated |
| `npm run test:contracts` | Final focused run passed 7/7 |
| `npm run verify:clean -- bk-005` | Passed in artifact-free source copy; [sanitized report](clean-verification.json) |
| Clean-copy `npm ci --offline --no-audit --no-fund` | Passed |
| Clean-copy `npm run check` | OpenAPI/drift, 9 boundary tests, full build, 7 contract tests, 18 configuration tests, 2 clock/target tests, real API/worker/web smoke, 9 client secret-canary artifacts passed |
| Clean-copy `npm run typecheck` | All workspaces passed |
| Lockfile verification | Unchanged during clean reproduction; SHA256 recorded in report |
| `git diff --check` | Passed |

The browser compilation proof uses DOM libraries, `types: []`, strict, exactOptionalPropertyTypes, noUncheckedIndexedAccess and skipLibCheck=false. Expected compiler errors demonstrate that nonexistent operations, wrong methods, undeclared query input, private response fields and false acceptance do not compile. Runtime input validation remains mandatory despite those types. OpenAPI structural/reference/operation validation rejects deliberately invalid documents and remote refs before generation.

## Failures corrected during construction

- openapi-typescript 7.13.0 was rejected by npm because its TypeScript ^5 peer excludes baseline 6.0.3. Hey API 0.99.0 accepted that baseline but emitted runtime code incompatible with exactOptionalPropertyTypes. Both candidates were replaced; the final lock contains neither Hey API nor an incompatible generator. No strict check was disabled and generated code was not manually patched. ADR15 records the final decision.
- The browser negative query proof initially exposed an underspecified generated operation. The correlation request header was formalized in OpenAPI; declared operation parameters and strict unknown-query typing now match the HTTP convention.
- The first clean run's negative drift test exposed CLI entry detection skipping execution through macOS `/tmp` aliases. Realpath-based detection corrected it; the isolated drift command now fails as expected without changing generated files. Focused checks and the full clean reproduction then passed. The final successful clean report contains the final implementation.

## Delivery and limits

Changed surfaces: API bootstrap/health/HTTP validation and errors; canonical OpenAPI/generated sources/public client; web client factory; generator/tests/check/smoke; manifest/lockfile; ADR15, guide, planning and evidence. No migration, database role, domain engine, secret-resolver contract or product UI/copy changed.

Operational instructions and recovery conventions: [contracts README](../../../packages/contracts/README.md). Regenerate after source edits; never edit generated files. Schema changes need affected consumer checks. Diagnostics retain a compatibility liveness alias; future business routes remain versioned by default.

Not executed: database suite (no persistence changes; BK-004's evidence remains scoped to that task), browser visual/accessibility tests (no UI changes), staging/production proxy or deployment, business authorization matrix, provider sandbox/live operations, monetary or scheduling concurrency tests. No new provider capability or end-to-end CA01–CA30 acceptance is claimed.

Independent review: `/root/bk005_review` reproduced offline installation, contract/typing checks and extra production HTTP probes. Unsupported charset/encoding initially returned 500; the corrected closed mapping returns safe 415, with regressions independently passing. The final complete clean verification was repeated after this correction and passed. See [review](review.md).

Next owner: coordinator for subsequent ready tasks; then BK-006 may make contract validation/tests an artifact gate, and subsequent domain slices may extend the public contracts. Independent approval is recorded separately from author checks.
