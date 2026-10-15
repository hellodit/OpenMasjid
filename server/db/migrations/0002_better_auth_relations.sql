CREATE TYPE "public"."asr_madhab" AS ENUM('shafi', 'hanafi');--> statement-breakpoint
CREATE TYPE "public"."prayer_calc_method" AS ENUM('kemenag', 'mwl', 'isna', 'egypt', 'makkah', 'karachi', 'singapore');--> statement-breakpoint
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
CREATE TABLE "event_agenda_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"start_time" time,
	"end_time" time,
	"title" text NOT NULL,
	"person" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_speakers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
DROP INDEX "categories_slug_unique";--> statement-breakpoint
DROP INDEX "events_slug_unique";--> statement-breakpoint
DROP INDEX "users_email_unique";--> statement-breakpoint
ALTER TABLE "mosque_profile" ALTER COLUMN "id" SET DEFAULT '00000000-0000-0000-0000-000000000001'::uuid;--> statement-breakpoint
ALTER TABLE "mosque_profile" ALTER COLUMN "timezone" SET DEFAULT 'Asia/Jakarta';--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "arabic_title" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "requires_registration" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "mosque_profile" ADD COLUMN "prayer_method" "prayer_calc_method" DEFAULT 'kemenag' NOT NULL;--> statement-breakpoint
ALTER TABLE "mosque_profile" ADD COLUMN "asr_madhab" "asr_madhab" DEFAULT 'shafi' NOT NULL;--> statement-breakpoint
ALTER TABLE "mosque_profile" ADD COLUMN "prayer_adjustments" jsonb DEFAULT '{"subuh":0,"terbit":0,"dzuhur":0,"ashar":0,"maghrib":0,"isya":0}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "mosque_profile" ADD COLUMN "iqamah_offsets" jsonb DEFAULT '{"subuh":10,"terbit":0,"dzuhur":10,"ashar":10,"maghrib":5,"isya":10}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "mosque_profile" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "registrants" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD COLUMN "created_by" uuid;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD COLUMN "updated_by" uuid;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_agenda_items" ADD CONSTRAINT "event_agenda_items_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_speakers" ADD CONSTRAINT "event_speakers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "event_agenda_items_event_idx" ON "event_agenda_items" USING btree ("event_id","sort_order");--> statement-breakpoint
CREATE INDEX "event_speakers_event_idx" ON "event_speakers" USING btree ("event_id","sort_order");--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_accounts" ADD CONSTRAINT "cash_accounts_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mosque_profile" ADD CONSTRAINT "mosque_profile_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" USING btree ("slug") WHERE "categories"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_unique" ON "events" USING btree ("slug") WHERE "events"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree (lower("email"));