# Public API contracts

The canonical source is [openapi/v1.json](openapi/v1.json), OpenAPI 3.1.0, contract version 1.0.0. It describes only the executable foundation: `GET /v1/health` and the explicit compatibility liveness alias `GET /health`. Neither reports database, queue, provider or business readiness.

## Generate and verify

From the root, using Node 24.22.1/npm 12.2.1:

```sh
npm ci
npm run contracts:generate
npm run contracts:check
npm run build
npm run test:contracts
```

`contracts:generate` validates structure, unique operation IDs and local references, then generates public TypeScript operation/schema types and an exact runtime OpenAPI snapshot. `contracts:check` reproduces into a temporary directory and fails on any missing, changed or extra generated file, without rewriting the checkout. Generated sources are committed; edit the canonical OpenAPI source and regenerate. External schema references are rejected; generation does not fetch remote specifications.

Exact tool pins: openapi-typescript 6.7.6, openapi-fetch 0.17.0, Redocly openapi-core 1.34.6; API schema validation uses Ajv 8.20.0 and ajv-formats 3.0.1. The generator is deliberately pinned to the compatible 6.x line: 7.13.0's TypeScript ^5 peer excludes the workspace's TypeScript 6.0.3. The evaluated Hey API generator emitted runtime code incompatible with exactOptionalPropertyTypes. Neither engines nor strict checks were bypassed. The selected generated output is compiled and exercised with TypeScript 6 and Node 24; future upgrades need the same proof.

## Consume

```ts
import { createApiClient } from '@agenda/contracts/client';

const api = createApiClient({ baseUrl: 'https://your-api-origin.example' });
const { data, error, response } = await api.GET('/v1/health');
```

The operation paths include `/v1`; do not add it again to baseUrl. A browser may use `baseUrl: '/'` behind a same-origin deployment proxy. No proxy or authenticated cookie flow is activated by BK-005. The web's `createWebApiClient` establishes this browser-only composition without reading server configuration. Create a separate client for each server request/session; do not share mutable auth headers across users. No automatic retries or tenant/role selection are supplied.

`@agenda/contracts` exports public DTO aliases and the generic `CursorPage<T>`; `@agenda/contracts/client` binds openapi-fetch to the generated paths. `@agenda/contracts/openapi` is the generated runtime specification for server validation. No ORM/database, backend, Nest or secret package is imported into the browser client. Generated types are compile-time guidance; they do not replace server validation or validate arbitrary response payloads at runtime.

## Transport conventions

- API routes use URI versioning, default version 1. `/health` is the only explicit version-neutral compatibility route.
- JSON names use snake_case; timestamps use UTC ISO 8601, IDs are opaque, money uses integer cents and currency. Public DTOs are selected fields rather than raw persistence records.
- Inputs use schema validation with no coercion, field removal or truthiness conversion. Sensitive objects reject unknown properties at every level. Field errors expose only `body` or `query` and a safe code; submitted names, values, JSON parser text and schema internals are not echoed.
- Errors have `error.code`, safe `message`, UUID `correlation_id`, `field_errors` and `retryable`. Unexpected exceptions become INTERNAL_ERROR/500. Framework, parser and typed safe failures use a closed server-owned catalog, never their raw messages, SQL, stack or provider payloads.
- `X-Correlation-ID` is returned on success and failure. A single UUID request header is accepted in canonical lowercase; invalid/combined values are replaced. Correlation is diagnostic, never identity, tenancy, idempotency or authorization.
- 201 means a local resource was created; 202 means an in-progress operation with an authorized lookup reference; 200 may recover an existing idempotent intent. Never turn a post-commit or external uncertain outcome into a generic retryable 503. Current error envelopes set retryable=false to avoid unsafe automatic mutations. Future slices must define recovery explicitly.

## Pagination and future slices

`PaginationQuery` accepts one opaque URL-safe cursor (maximum 512 characters) and an integer limit, default 25, maximum 100. `PaginationPipe` handles only canonical decimal query strings; duplicate, nested, fractional, negative, zero, oversized or unknown inputs fail. The response envelope is `data` plus `page_info: {next_cursor, limit}`; null next_cursor terminates iteration. Each real list must specialize its public item schema, use stable cursor ordering and verify the cursor against authorized scope and filters. These primitives do not implement a database list or confer authorization.

`BookingAcceptance` and `CreateBookingInput` reserve ET section 13.2's minimal accepted-summary shape; they are not live endpoints or domain authorization. No tenant, role, price or customer authority is accepted through that input. Later slices must validate the actual quote, identity, version, policy and idempotency at execution. SLOT_UNAVAILABLE and other planned codes are vocabulary only until corresponding domain operations exist. PAYMENT_PENDING/PAYMENT_UNCERTAIN remain operational states rather than generic HTTP failures.

Tests register temporary probe controllers only in their own process to demonstrate strict command validation and pagination over real HTTP. They are not present in production AppModule or the published OpenAPI paths. Add each planned business route to OpenAPI with its permission, inputs, outputs, errors and consumers before implementing its backlog slice; ET section 13.3 is a proposed catalog, not a claim of delivery.

References: [openapi-typescript 6.x](https://openapi-ts.dev/6.x/introduction), [openapi-fetch](https://openapi-ts.dev/openapi-fetch/), [Ajv JSON Schema](https://ajv.js.org/json-schema.html), [Nest exception filters](https://docs.nestjs.com/exception-filters).
