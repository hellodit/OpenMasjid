-- FORCE row level security on the new tenant tables (see 0001_force_rls.sql).
ALTER TABLE "announcements" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "duty_assignments" FORCE ROW LEVEL SECURITY;
