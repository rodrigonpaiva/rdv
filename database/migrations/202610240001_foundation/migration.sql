BEGIN;

-- btree_gist is trusted: the migration database owner can install it.
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE public.tenants (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  operational_status text NOT NULL DEFAULT 'INACTIVE',
  entitlement_version integer NOT NULL DEFAULT 1 CHECK (entitlement_version > 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Only the tenant anchor is introduced here; no business endpoint consumes it.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_context ON public.tenants TO rdv_app
  USING (id = NULLIF(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (id = NULLIF(current_setting('app.tenant_id', true), '')::uuid);
GRANT USAGE ON SCHEMA public TO rdv_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenants TO rdv_app;
-- No blanket default grants: future migrations must grant reviewed privileges.

COMMIT;
