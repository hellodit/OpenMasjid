-- Manual migration: enable pgcrypto for gen_random_uuid().
-- PostgreSQL 13+ ships gen_random_uuid() in core, so this is usually a no-op
-- on Supabase (PG 15+). Apply once via Supabase SQL editor if you ever see
-- "function gen_random_uuid() does not exist" during drizzle-kit migrate.
--
-- Apply: Supabase Dashboard → SQL Editor → paste & run.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
