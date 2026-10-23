# BK-003 configuration contract

Sources: English technical specification sections 7–8, 17 and 21, and BK-003 in the English backlog. BK-002 is the verified dependency. This contract adds no live provider or database connection.

## Boot and isolation

Both Nest entry points call `prepareServerRuntime` before creating a context. Configuration is immutable and explicit. Required values are APP_ENV, SECRET_STORE, DATABASE_URL, REDIS_URL, PUBLIC_APP_URL, TRUSTED_ORIGINS, PAYMENT_PROVIDER, WHATSAPP_PROVIDER and MODEL_PROVIDER. API_HOST/API_PORT default to loopback/3001. NODE_ENV does not infer APP_ENV.

APP_ENV accepts development, test, staging and production. Provider selections accept disabled or mock, with mock limited to development/test. An unknown provider fails boot. Staging/production require HTTPS origins and an external secret resolver. There is no default production adapter.

DATABASE_URL and REDIS_URL hold exact protected references `secret://<environment>/platform/database` and `secret://<environment>/platform/redis`. Raw credential URLs and references to another environment/purpose fail validation. The server-only SecretResolver port resolves these references. External mode requires explicit resolver injection; deployment vault adapters remain future infrastructure work. The development/test mock uses synthetic values without network access. Resolved secrets validate protocol and host; staging/production Redis requires TLS. Database transport enforcement belongs to the future database adapter.

Secrets expose explicit adapter access through SecretValue.read(); JSON, string and inspection output are redacted. Resolver failures never include raw values or causes. Secret-like public environment variables are rejected at server boot. Existing architecture guards prevent web/UI dependencies on server configuration; builds inject synthetic canaries and client artifact checks detect leakage.

## Tenant switches

A trusted server context supplies the tenant ID. A snapshot contains tenantId, environment, positive version, botEnabled, pixEnabled, botIntegrationActive and pixIntegrationActive. Validation rejects cross-tenant/environment state and returns an immutable copy. Missing snapshots disable new operations. New bot mutations require both model and WhatsApp adapters; Pix creation requires a payment adapter. Flags and integration state must also be enabled.

payment.reconcile and refund.resolve remain eligible when creation switches are disabled or a snapshot is absent. If supplied, a snapshot must still match tenant/environment. This is eligibility under flags only: authorization, provider availability and domain revalidation remain mandatory. No public endpoint accepts these snapshots. Global tenant switches are rejected. Persisted flags, audit and entitlement administration belong to later tasks.

## Scope and next work

No outbound provider calls, database connection, Redis connection, authentication, queue or financial effect is implemented. BK-004 can now add actual database provisioning/migrations and consume the server-only resolved connection. BK-005 contracts and BK-006 CI remain separate tasks. Production activation requires real vault and provider adapters with their own validation.
