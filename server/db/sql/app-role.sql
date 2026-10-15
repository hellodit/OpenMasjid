-- Runtime database role for the app (DATABASE_URL). Run ONCE as the database
-- owner (Supabase: SQL editor as `postgres`), then point DATABASE_URL at it.
--
-- Why: Row Level Security does not apply to superusers or roles with
-- BYPASSRLS (Supabase's `postgres` role has BYPASSRLS). Tenant isolation in
-- the database only works when the app connects with this restricted role.
-- Migrations (DATABASE_DIRECT_URL) keep using the owner role.
--
-- Supabase pooler: connect as  openmasjid_app.<project-ref>  on port 6543.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'openmasjid_app') THEN
    CREATE ROLE openmasjid_app LOGIN NOBYPASSRLS PASSWORD 'change-me';
  END IF;
END $$;

ALTER ROLE openmasjid_app NOBYPASSRLS NOSUPERUSER;
-- Guard against runaway queries from a single tenant.
ALTER ROLE openmasjid_app SET statement_timeout = '15s';

GRANT USAGE ON SCHEMA public TO openmasjid_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO openmasjid_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO openmasjid_app;

-- Tables created by future migrations (run by the owner role) get the same grants.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO openmasjid_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO openmasjid_app;

-- The migration journal is owner-only.
REVOKE ALL ON SCHEMA drizzle FROM openmasjid_app;
