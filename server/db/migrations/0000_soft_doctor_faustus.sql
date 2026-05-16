CREATE TYPE "public"."event_language" AS ENUM('id', 'ar', 'en', 'mix');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'ongoing', 'full', 'archived');--> statement-breakpoint
CREATE TYPE "public"."event_time_anchor" AS ENUM('fix', 'subuh', 'dhuhur', 'ashar', 'maghrib', 'isya');--> statement-breakpoint
CREATE TYPE "public"."registrant_source" AS ENUM('web', 'qr', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'editor', 'viewer', 'jamaah');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"color_token" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" text NOT NULL,
	"arabic_title" text,
	"slug" text NOT NULL,
	"description_md" text,
	"language" "event_language" DEFAULT 'id' NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"start_time" time,
	"end_time" time,
	"time_anchor" "event_time_anchor" DEFAULT 'fix' NOT NULL,
	"time_anchor_offset_min" smallint DEFAULT 0 NOT NULL,
	"location_name" text,
	"location_detail" text,
	"address_full" text,
	"capacity" integer,
	"recurrence_rule" text,
	"requires_registration" boolean DEFAULT true NOT NULL,
	"livestream_url" text,
	"is_livestream" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "events_end_after_start" CHECK ("events"."end_date" IS NULL OR "events"."end_date" >= "events"."start_date"),
	CONSTRAINT "events_capacity_positive" CHECK ("events"."capacity" IS NULL OR "events"."capacity" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"role" "user_role" DEFAULT 'jamaah' NOT NULL,
	"avatar_asset_id" uuid,
	"invited_by" uuid,
	"last_login_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mosque_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" text,
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
	"timezone" text NOT NULL,
	"is_public_profile" boolean DEFAULT true NOT NULL,
	"is_visible_on_tv" boolean DEFAULT true NOT NULL,
	"is_registration_open" boolean DEFAULT true NOT NULL,
	"is_maintenance" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "mosque_profile_slug_unique" UNIQUE("slug"),
	CONSTRAINT "mosque_profile_singleton" CHECK ("mosque_profile"."id" = '00000000-0000-0000-0000-000000000001'::uuid)
);
--> statement-breakpoint
CREATE TABLE "registrants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"attended_at" timestamp with time zone,
	"checked_in_by" uuid,
	"source" "registrant_source" DEFAULT 'web' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "registrants_attended_after_registered" CHECK ("registrants"."attended_at" IS NULL OR "registrants"."attended_at" >= "registrants"."registered_at")
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registrants" ADD CONSTRAINT "registrants_checked_in_by_users_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_unique" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_unique" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_status_start_date_idx" ON "events" USING btree ("status","start_date");--> statement-breakpoint
CREATE INDEX "events_category_idx" ON "events" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "events_start_date_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "registrants_event_user_active_unique" ON "registrants" USING btree ("event_id","user_id") WHERE "registrants"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "registrants_event_attended_idx" ON "registrants" USING btree ("event_id") WHERE "registrants"."attended_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "registrants_user_history_idx" ON "registrants" USING btree ("user_id","registered_at");