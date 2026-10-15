ALTER TABLE "cash_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event_agenda_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "event_speakers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tenant_invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mosque_profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "registrants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transaction_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "cash_accounts_tenant_isolation" ON "cash_accounts" AS PERMISSIVE FOR ALL TO public USING ("cash_accounts"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("cash_accounts"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "categories_tenant_isolation" ON "categories" AS PERMISSIVE FOR ALL TO public USING ("categories"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("categories"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "event_agenda_items_tenant_isolation" ON "event_agenda_items" AS PERMISSIVE FOR ALL TO public USING ("event_agenda_items"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("event_agenda_items"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "event_speakers_tenant_isolation" ON "event_speakers" AS PERMISSIVE FOR ALL TO public USING ("event_speakers"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("event_speakers"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "events_tenant_isolation" ON "events" AS PERMISSIVE FOR ALL TO public USING ("events"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("events"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "tenant_invitations_tenant_isolation" ON "tenant_invitations" AS PERMISSIVE FOR ALL TO public USING ("tenant_invitations"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("tenant_invitations"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "mosque_profile_tenant_isolation" ON "mosque_profile" AS PERMISSIVE FOR ALL TO public USING ("mosque_profile"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("mosque_profile"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "registrants_tenant_isolation" ON "registrants" AS PERMISSIVE FOR ALL TO public USING ("registrants"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("registrants"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "transaction_categories_tenant_isolation" ON "transaction_categories" AS PERMISSIVE FOR ALL TO public USING ("transaction_categories"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("transaction_categories"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "transactions_tenant_isolation" ON "transactions" AS PERMISSIVE FOR ALL TO public USING ("transactions"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("transactions"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);