-- Apply RLS to the table owner too. Superusers and roles with BYPASSRLS still
-- bypass it, so the app MUST connect with a dedicated role
-- (see server/db/sql/0001_app_role.sql).
ALTER TABLE "mosque_profile" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "events" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event_speakers" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event_agenda_items" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "registrants" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cash_accounts" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transaction_categories" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transactions" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tenant_invitations" FORCE ROW LEVEL SECURITY;
