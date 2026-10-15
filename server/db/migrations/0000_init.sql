CREATE TYPE "public"."asr_madhab" AS ENUM('shafi', 'hanafi');--> statement-breakpoint
CREATE TYPE "public"."cash_account_type" AS ENUM('cash', 'bank', 'ewallet');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."prayer_calc_method" AS ENUM('kemenag', 'mwl', 'isna', 'egypt', 'makkah', 'karachi', 'singapore');--> statement-breakpoint
CREATE TYPE "public"."registrant_source" AS ENUM('web', 'qr', 'admin');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('active', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."transaction_category_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'viewer', 'member');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"name" text NOT NULL,
	"type" "cash_account_type" NOT NULL,
	"account_number" text,
	"holder_name" text,
	"opening_balance" numeric(14, 2) DEFAULT '0' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "cash_accounts_tenant_id_id_unique" UNIQUE("tenant_id","id"),
	CONSTRAINT "cash_accounts_opening_balance_non_negative" CHECK ("cash_accounts"."opening_balance" >= 0)
);
--> statement-breakpoint
ALTER TABLE "cash_accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"color_token" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "categories_tenant_id_id_unique" UNIQUE("tenant_id","id")
);
--> statement-breakpoint
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "event_agenda_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"start_time" time,
	"end_time" time,
	"title" text NOT NULL,
	"person" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_agenda_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "event_speakers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_speakers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"arabic_title" text,
	"slug" text NOT NULL,
	"description" text,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"start_time" time,
	"end_time" time,
	"location_name" text,
	"location_detail" text,
	"address_full" text,
	"capacity" integer,
	"banner_url" text,
	"livestream_url" text,
	"is_livestream" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"requires_registration" boolean DEFAULT true NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "events_tenant_id_id_unique" UNIQUE("tenant_id","id"),
	CONSTRAINT "events_end_after_start" CHECK ("events"."end_date" IS NULL OR "events"."end_date" >= "events"."start_date"),
	CONSTRAINT "events_capacity_positive" CHECK ("events"."capacity" IS NULL OR "events"."capacity" > 0)
);
--> statement-breakpoint
ALTER TABLE "events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenant_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"invited_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_invitations_role_staff" CHECK ("tenant_invitations"."role" IN ('admin', 'viewer'))
);
--> statement-breakpoint
ALTER TABLE "tenant_invitations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"status" "tenant_status" DEFAULT 'active' NOT NULL,
	"owner_user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "tenants_slug_format" CHECK ("tenants"."slug" ~ '^[a-z0-9](?:[a-z0-9-]{1,46}[a-z0-9])$')
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"full_name" text NOT NULL,
	"image" text,
	"phone" text,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"last_login_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_tenant_id_id_unique" UNIQUE("tenant_id","id")
);
--> statement-breakpoint
CREATE TABLE "mosque_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"name" text NOT NULL,
	"arabic_name" text,
	"tagline" text,
	"year_founded" smallint,
	"capacity" integer,
	"address_line" text,
	"city" text,
	"province" text,
	"postal_code" text,
	"country_code" char(2) DEFAULT 'ID',
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"timezone" text DEFAULT 'Asia/Jakarta' NOT NULL,
	"phone" text,
	"email" text,
	"whatsapp" text,
	"website_url" text,
	"instagram_url" text,
	"youtube_url" text,
	"facebook_url" text,
	"tiktok_url" text,
	"is_public_profile" boolean DEFAULT true NOT NULL,
	"is_visible_on_tv" boolean DEFAULT true NOT NULL,
	"is_registration_open" boolean DEFAULT true NOT NULL,
	"is_maintenance" boolean DEFAULT false NOT NULL,
	"prayer_method" "prayer_calc_method" DEFAULT 'kemenag' NOT NULL,
	"asr_madhab" "asr_madhab" DEFAULT 'shafi' NOT NULL,
	"prayer_adjustments" jsonb DEFAULT '{"fajr":0,"sunrise":0,"dhuhr":0,"asr":0,"maghrib":0,"isha":0}'::jsonb NOT NULL,
	"iqamah_offsets" jsonb DEFAULT '{"fajr":10,"sunrise":0,"dhuhr":10,"asr":10,"maghrib":5,"isha":10}'::jsonb NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "mosque_profile" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "registrants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attended_at" timestamp with time zone,
	"checked_in_by" uuid,
	"cancelled_at" timestamp with time zone,
	"source" "registrant_source" DEFAULT 'web' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "registrants_attended_after_registered" CHECK ("registrants"."attended_at" IS NULL OR "registrants"."attended_at" >= "registrants"."registered_at")
);
--> statement-breakpoint
ALTER TABLE "registrants" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "transaction_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"parent_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" "transaction_category_type" NOT NULL,
	"icon" text,
	"color_token" text,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "transaction_categories_tenant_id_id_unique" UNIQUE("tenant_id","id")
);
--> statement-breakpoint
ALTER TABLE "transaction_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"type" "transaction_type" NOT NULL,
	"transaction_date" date NOT NULL,
	"account_id" uuid NOT NULL,
	"destination_account_id" uuid,
	"category_id" uuid,
	"amount" numeric(14, 2) NOT NULL,
	"description" text NOT NULL,
	"reference_number" text,
	"attachment_url" text,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "transactions_amount_positive" CHECK ("transactions"."amount" > 0),
	CONSTRAINT "transactions_transfer_shape" CHECK (("transactions"."type" = 'transfer' AND "transactions"."destination_account_id" IS NOT NULL AND "transactions"."destination_account_id" <> "transactions"."account_id" AND "transactions"."category_id" IS NULL) OR ("transactions"."type" IN ('income','expense') AND "transactions"."destination_account_id" IS NULL AND "transactions"."category_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_agenda_items" ADD CONSTRAINT "event_agenda_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_agenda_items" ADD CONSTRAINT "event_agenda_items_event_fk" FOREIGN KEY ("tenant_id","event_id") REFERENCES "public"."events"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_fk" FOREIGN KEY ("tenant_id","event_id") REFERENCES "public"."events"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_category_fk" FOREIGN KEY ("tenant_id","category_id") REFERENCES "public"."categories"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_invitations" ADD CONSTRAINT "tenant_invitations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_invitations" ADD CONSTRAINT "tenant_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mosque_profile" ADD CONSTRAINT "mosque_profile_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mosque_profile" ADD CONSTRAINT "mosque_profile_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_event_fk" FOREIGN KEY ("tenant_id","event_id") REFERENCES "public"."events"("tenant_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_user_fk" FOREIGN KEY ("tenant_id","user_id") REFERENCES "public"."users"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_parent_fk" FOREIGN KEY ("tenant_id","parent_id") REFERENCES "public"."transaction_categories"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_fk" FOREIGN KEY ("tenant_id","account_id") REFERENCES "public"."cash_accounts"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destination_account_fk" FOREIGN KEY ("tenant_id","destination_account_id") REFERENCES "public"."cash_accounts"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_fk" FOREIGN KEY ("tenant_id","category_id") REFERENCES "public"."transaction_categories"("tenant_id","id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "cash_accounts_active_sort_idx" ON "cash_accounts" USING btree ("is_active","sort_order") WHERE "cash_accounts"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_tenant_slug_unique" ON "categories" USING btree ("tenant_id","slug") WHERE "categories"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "event_agenda_items_event_idx" ON "event_agenda_items" USING btree ("event_id","sort_order");--> statement-breakpoint
CREATE INDEX "event_speakers_event_idx" ON "event_speakers" USING btree ("event_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "events_tenant_slug_unique" ON "events" USING btree ("tenant_id","slug") WHERE "events"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "events_tenant_status_start_idx" ON "events" USING btree ("tenant_id","status","start_date");--> statement-breakpoint
CREATE INDEX "events_category_idx" ON "events" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_invitations_token_unique" ON "tenant_invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "tenant_invitations_tenant_idx" ON "tenant_invitations" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_unique" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_tenant_email_unique" ON "users" USING btree ("tenant_id",lower("email"));--> statement-breakpoint
CREATE INDEX "users_tenant_role_idx" ON "users" USING btree ("tenant_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "mosque_profile_tenant_unique" ON "mosque_profile" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "registrants_event_user_active_unique" ON "registrants" USING btree ("event_id","user_id") WHERE "registrants"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "registrants_event_attended_idx" ON "registrants" USING btree ("event_id") WHERE "registrants"."attended_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "registrants_user_history_idx" ON "registrants" USING btree ("user_id","registered_at");--> statement-breakpoint
CREATE UNIQUE INDEX "transaction_categories_tenant_slug_unique" ON "transaction_categories" USING btree ("tenant_id","slug") WHERE "transaction_categories"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "transaction_categories_parent_idx" ON "transaction_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "transaction_categories_type_active_idx" ON "transaction_categories" USING btree ("type","is_active");--> statement-breakpoint
CREATE INDEX "transactions_tenant_date_idx" ON "transactions" USING btree ("tenant_id","transaction_date" DESC NULLS LAST) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "transactions_account_date_idx" ON "transactions" USING btree ("account_id","transaction_date" DESC NULLS LAST) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "transactions_category_date_idx" ON "transactions" USING btree ("category_id","transaction_date" DESC NULLS LAST) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "transactions_destination_idx" ON "transactions" USING btree ("destination_account_id") WHERE "transactions"."destination_account_id" IS NOT NULL;--> statement-breakpoint
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