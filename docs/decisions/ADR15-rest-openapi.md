# ADR15 — Versioned REST contracts and browser-safe client

- Date: October 24, 2026.
- Status: adopted for BK-005 implementation; executed evidence is linked below. Independently accepted for BK-005 after the transport correction; see the task review record.
- Owner: technical coordinator.
- Sources: functional specification section 15; technical specification sections 3–4, 12–13, 18–23; backlog BK-005. No business-rule supersession.

## Context and alternatives

The workspace has a public diagnostic DTO and unversioned liveness route, but no OpenAPI source, reusable validation/error contract or generated browser client. The planned business endpoints are not implemented and must not be presented as live contracts.

Code-first decorators with a second validation schema would require controlling drift across multiple sources. A canonical OpenAPI document can generate public types and supply runtime validation schemas together. Handwritten domain DTOs or raw ORM types in the browser do not meet the contract requirement.

## Decision

Use OpenAPI 3.1.0 JSON as the canonical public contract, openapi-typescript **6.7.6** for generated operation/schema types, openapi-fetch **0.17.0** for the client, and Redocly openapi-core **1.34.6** for structural/reference/operation validation. Use Ajv **8.20.0** and ajv-formats **3.0.1** in the API for strict runtime validation against those same schema components.

Version API routes with Nest URI versioning defaulting to `/v1`; explicitly retain `/health` only as a compatibility liveness alias. Keep public fields snake_case, bounded cursor pagination, closed errors and a safe UUID correlation header/body. Accept only a valid single incoming correlation UUID, otherwise generate one; it never authorizes access.

Types and an exact runtime OpenAPI snapshot are generated into an owned directory. Check mode regenerates in a temporary directory and compares without mutation. Only local component references are permitted. Add actual business operations to OpenAPI before their respective slices, with authorization and state/recovery semantics; do not document unimplemented business paths as active.

## Compatibility and evidence

Registry metadata was consulted before pins. openapi-typescript 7.13.0 requires TypeScript ^5 and npm rejected it against the baseline 6.0.3; no force/legacy-peer-deps was used. Hey API 0.99.0 accepts TypeScript 6 but its generated runtime failed exactOptionalPropertyTypes and DOM availability checks in the server-oriented contract build. That output/tool was replaced; no generated output was patched and no strict compiler check was disabled.

The selected 6.x generator has no incompatible TypeScript peer. Its output and openapi-fetch are compiled under the exact baseline, including a separate DOM-only consumer with strict checks and no Node ambient types. Successful HTTP, generation/drift and clean-reproduction results are recorded in [BK-005 evidence](../evidence/bk-005/README.md).

## Consequences and limits

Generation uses an intentionally older compatible major and needs reevaluation before upgrades; tool versions are locked, not floated. Generated types are not runtime response validation. Domain acceptance, identity, tenancy, idempotency, real list ordering and post-commit recovery remain server responsibilities. Current diagnostics imply process liveness only. A same-origin browser client assumes deployment routing that BK-005 does not activate.

References: [openapi-typescript 6.x](https://openapi-ts.dev/6.x/introduction), [openapi-fetch](https://openapi-ts.dev/openapi-fetch/), [Ajv](https://ajv.js.org/json-schema.html), [Nest URI versioning](https://docs.nestjs.com/techniques/versioning), [Nest exception filters](https://docs.nestjs.com/exception-filters). Installed package metadata and executed checks govern compatibility claims.
