ALTER TABLE "mosque_profile" DROP CONSTRAINT "mosque_profile_slug_unique";--> statement-breakpoint
ALTER TABLE "mosque_profile" DROP CONSTRAINT "mosque_profile_singleton";--> statement-breakpoint
ALTER TABLE "event_agenda_items" DROP CONSTRAINT "event_agenda_items_event_id_events_id_fk";--> statement-breakpoint
ALTER TABLE "event_speakers" DROP CONSTRAINT "event_speakers_event_id_events_id_fk";--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_category_id_categories_id_fk";--> statement-breakpoint
ALTER TABLE "registrants" DROP CONSTRAINT "registrants_event_id_events_id_fk";--> statement-breakpoint
ALTER TABLE "registrants" DROP CONSTRAINT "registrants_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "transaction_categories" DROP CONSTRAINT "transaction_categories_parent_id_transaction_categories_id_fk";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_account_id_cash_accounts_id_fk";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_destination_account_id_cash_accounts_id_fk";--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_id_transaction_categories_id_fk";--> statement-breakpoint
DROP INDEX "categories_slug_unique";--> statement-breakpoint
DROP INDEX "events_slug_unique";--> statement-breakpoint
DROP INDEX "events_status_start_date_idx";--> statement-breakpoint
DROP INDEX "events_start_date_idx";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
DROP INDEX "users_role_idx";--> statement-breakpoint
DROP INDEX "transaction_categories_slug_unique";--> statement-breakpoint
DROP INDEX "transactions_date_idx";--> statement-breakpoint
ALTER TABLE "cash_accounts" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event_agenda_items" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "event_speakers" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "tenant_invitations" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mosque_profile" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "mosque_profile" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "registrants" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_categories" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "tenant_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_tenant_id_id_unique" UNIQUE("tenant_id","id");--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_id_unique" UNIQUE("tenant_id","id");--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_tenant_id_id_unique" UNIQUE("tenant_id","id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_id_unique" UNIQUE("tenant_id","id");--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_tenant_id_id_unique" UNIQUE("tenant_id","id");--> statement-breakpoint
ALTER TABLE "event_agenda_items" ADD CONSTRAINT "event_agenda_items_event_fk" FOREIGN KEY ("tenant_id","event_id") REFERENCES "public"."events"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_fk" FOREIGN KEY ("tenant_id","event_id") REFERENCES "public"."events"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_category_fk" FOREIGN KEY ("tenant_id","category_id") REFERENCES "public"."categories"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_event_fk" FOREIGN KEY ("tenant_id","event_id") REFERENCES "public"."events"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_user_fk" FOREIGN KEY ("tenant_id","user_id") REFERENCES "public"."users"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_parent_fk" FOREIGN KEY ("tenant_id","parent_id") REFERENCES "public"."transaction_categories"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_fk" FOREIGN KEY ("tenant_id","account_id") REFERENCES "public"."cash_accounts"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destination_account_fk" FOREIGN KEY ("tenant_id","destination_account_id") REFERENCES "public"."cash_accounts"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_fk" FOREIGN KEY ("tenant_id","category_id") REFERENCES "public"."transaction_categories"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_tenant_slug_unique" ON "categories" USING btree ("tenant_id","slug") WHERE "categories"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "events_tenant_slug_unique" ON "events" USING btree ("tenant_id","slug") WHERE "events"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "events_tenant_status_start_idx" ON "events" USING btree ("tenant_id","status","start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_tenant_email_unique" ON "users" USING btree ("tenant_id",lower("email"));--> statement-breakpoint
CREATE INDEX "users_tenant_role_idx" ON "users" USING btree ("tenant_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "mosque_profile_tenant_unique" ON "mosque_profile" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "transaction_categories_tenant_slug_unique" ON "transaction_categories" USING btree ("tenant_id","slug") WHERE "transaction_categories"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "transactions_tenant_date_idx" ON "transactions" USING btree ("tenant_id","transaction_date" DESC NULLS LAST) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
ALTER TABLE "mosque_profile" DROP COLUMN "slug";
