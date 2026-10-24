# Decision register

The business source is `plans/spec-general.en.md`. ADRs refine engineering without changing product rules. The “adopted as baseline” status authorizes implementation guidance; it does not prove execution, integration or provider validation.

| ADR | Decision | Status |
| --- | --- | --- |
| [ADR00](ADR00-toolchain-e-workspace.md) | Toolchain, versions and workspace | Baseline adopted |
| [ADR01](ADR01-monolito-modular.md) | Modular monolith with separate API and worker | Baseline adopted |
| [ADR02](ADR02-postgres-e-alocacoes.md) | PostgreSQL as the authority for occupancy and financial records | Baseline adopted |
| [ADR03](ADR03-motor-comum-e-locks.md) | Shared engine and lock order | Baseline adopted |
| [ADR04](ADR04-ia-com-ferramentas.md) | AI limited to interpretation and authorized tools | Baseline adopted |
| [ADR05](ADR05-outbox-inbox-e-idempotencia.md) | Outbox/inbox and idempotent effects | Baseline adopted |
| [ADR06](ADR06-pix-separado-de-saas.md) | Pix separate from SaaS subscriptions, without direct custody | Baseline adopted |
| [ADR07](ADR07-web-e-design-system.md) | Responsive web and design system 2.0 | Baseline adopted |
| [ADR08](ADR08-snapshot-e-aceite.md) | Versioned snapshots, policies and acceptance | Baseline adopted |
| [ADR15](ADR15-rest-openapi.md) | Versioned REST, schema-first validation and generated browser client | Adopted and independently verified for BK-005 |

Technical specification ADRs 09–14 remain to be detailed in identity, RLS, provider and infrastructure tasks. Creating this index does not implicitly approve them. ADR00 adds only the toolchain decision, preserving existing IDs 01–14.
