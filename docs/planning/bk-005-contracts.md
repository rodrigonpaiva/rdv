# BK-005 planning analysis and contract scope

## Sources and precedence

The planning inventory contains four English documents and their Portuguese counterparts. Following the user's continuing language instruction and AGENTS, implementation uses the English editions: functional specification 1.0, technical specification 1.0, backlog 1.0 and design system **2.0 content**, all dated October 23, 2026. Source metadata/hashes are recorded in [the inventory](../evidence/bk-005/source-inventory.json). `plans/` remains outside Git; no source document was force-added or recreated.

The historical headers saying Portuguese remains authoritative are superseded for repository execution by the user's explicit English-source instruction recorded in AGENTS. This does not translate approved product copy or change commercial rules. No material money, authorization or policy conflict was identified for BK-005.

The analysis inventories all four documents, their section structure, the backlog's 99 task cards/dependencies, RF/CA traceability and DS journey/wireframe inventory. Contract-specific rules below determine this foundation's scope; the remaining business and UI sections constrain future slices rather than authorize their implementation here.

| Source coverage | BK-005 consequence |
| --- | --- |
| Functional specification sections 1–6 (scope, actors, journeys and RF01–RF18) | Cross-cutting enabler with no dedicated product screen. Public diagnostics expose no customer/business data. Server authorization remains mandatory for future business routes. |
| Functional specification sections 7–12 (scheduling, Pix, changes, states, AI, communications) | Do not create booking/payment effects or infer settlement from transport success. Keep money, booking and communication states separate. |
| Functional specification sections 13–20 (architecture, data, API, identity/privacy, operations and tests) | `/v1`, public DTOs, safe errors/correlation, generated client, bounded pagination, minimal sensitive output and actual HTTP/negative tests. |
| Functional specification sections 21–29 (CA01–CA30, delivery, risks, ADRs and sources) | Foundation tests are not business CA acceptance or pilot readiness. Providers/policies/launch decisions remain pending in their own tracks. |
| Technical specification sections 1–11 | Preserve modular monolith boundaries and I01–I15; no ORM types in web, no schema/domain changes, no client-selected tenant/role authority. |
| Technical specification sections 12–13 | Implement REST transport conventions and stable error vocabulary. Reserve the exact quote/acceptance input shape. Idempotency persistence/recovery remains BK-030, events/queues remain their assigned slices. |
| Technical specification sections 14–19 | Do not add model tools, channel providers, billing or privacy operations. Correlation/error output must not reveal tokens, contacts, SQL or stack details. |
| Technical specification sections 20–27 and appendices | Prove contract generation, browser typing, malformed input and failures. Do not claim unexecuted database, financial, authorization, production or external integration checks. |
| DS sections 1–16 and appendices A–D | Preserve safe recovery and state distinctions used across 26 journeys/102 wireframes. No visual task, no Figma write, no annotation/simulation UI, and no speculative UI changes. Future tables use pagination and explicit loading/error/access states. |
| Entire backlog inventory and dependency graph | BK-005 depends only on accepted BK-002. BK-006 consumes contract checks; BK-010 consumes correlation/error contracts; BK-030 consumes idempotency transport conventions; BK-048/BK-061 consume explicit provider-boundary conventions. The early-track table also references BK-005 for SaaS planning; none of these downstream tasks is executed here. |

## Implementation decisions

1. Canonical OpenAPI 3.1.0 JSON under `packages/contracts/openapi`; committed generated types/snapshot with reproducible generation and read-only drift detection. Only implemented routes appear in paths.
2. Nest URI versioning defaults every route to version 1. The existing public `/health` is explicitly retained as a compatibility liveness alias; `/v1/health` is canonical. Both return the shared diagnostic use case's selected public DTO.
3. Schema-first Ajv validation consumes the same OpenAPI schemas. No implicit body coercion, mass assignment, removal of unknown fields or input reflection in errors. Reusable pipes support future HTTP controllers; no business controller is activated.
4. Stable closed error catalog, UUID correlation header/body and generic unexpected failures. No exception message or request URL is exposed; no automatic mutation retry is introduced.
5. Cursor query/envelope schemas with default 25 and maximum 100, canonical query normalization and strict bounds. Actual item schemas, stable repository ordering and authorized cursor binding must be implemented with each real list.
6. Browser-safe openapi-fetch bound to generated operation types, exported through a public client subpath. A DOM-only strict TypeScript proof checks allowed/forbidden paths, methods, query, public result and acceptance shapes. No ORM or server secret dependency is introduced.
7. Compatible pinned tooling is recorded in ADR15. TypeScript 6, exactOptionalPropertyTypes and existing architecture/configuration protections remain enabled.

## Acceptance and excluded work

BK-005 criterion 1 is covered by real versioned/legacy diagnostic requests and strict schema/query tests; criterion 2 by framework, unexpected, typed, missing-route, malformed JSON and oversized-input failures with safe envelopes; criterion 3 by OpenAPI validation, drift tests, browser-only compilation, generated-client HTTP requests and pagination probe tests.

Test probe controllers are created only inside tests. They do not publish synthetic lists or implement booking commands. Creating business endpoints, proving tenant/capability authorization, persistence, idempotency, provider contracts, UI interactions and production routing remains the responsibility of later ready tasks. No migration, secret contract, financial policy or product copy changes are required.
