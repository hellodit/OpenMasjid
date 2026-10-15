CREATE TYPE "public"."announcement_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."duty_role" AS ENUM('imam', 'khatib', 'muadzin', 'bilal', 'preacher', 'other');--> statement-breakpoint
CREATE TYPE "public"."duty_service" AS ENUM('jumuah', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'tarawih', 'eid', 'other');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"status" "announcement_status" DEFAULT 'draft' NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"show_on_display" boolean DEFAULT true NOT NULL,
	"starts_on" date,
	"ends_on" date,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "announcements_ends_after_starts" CHECK ("announcements"."ends_on" IS NULL OR "announcements"."starts_on" IS NULL OR "announcements"."ends_on" >= "announcements"."starts_on")
);
--> statement-breakpoint
ALTER TABLE "announcements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "duty_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid DEFAULT (current_setting('app.tenant_id', true))::uuid NOT NULL,
	"date" date NOT NULL,
	"service" "duty_service" NOT NULL,
	"role" "duty_role" NOT NULL,
	"person_name" text NOT NULL,
	"phone" text,
	"topic" text,
	"notes" text,
	"created_by" uuid,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "duty_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mosque_profile" ADD COLUMN "setup_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duty_assignments" ADD CONSTRAINT "duty_assignments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duty_assignments" ADD CONSTRAINT "duty_assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "duty_assignments" ADD CONSTRAINT "duty_assignments_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_tenant_status_idx" ON "announcements" USING btree ("tenant_id","status","starts_on");--> statement-breakpoint
CREATE UNIQUE INDEX "duty_assignments_slot_unique" ON "duty_assignments" USING btree ("tenant_id","date","service","role") WHERE "duty_assignments"."deleted_at" IS NULL AND "duty_assignments"."role" <> 'other';--> statement-breakpoint
CREATE INDEX "duty_assignments_tenant_date_idx" ON "duty_assignments" USING btree ("tenant_id","date");--> statement-breakpoint
CREATE POLICY "announcements_tenant_isolation" ON "announcements" AS PERMISSIVE FOR ALL TO public USING ("announcements"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("announcements"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "duty_assignments_tenant_isolation" ON "duty_assignments" AS PERMISSIVE FOR ALL TO public USING ("duty_assignments"."tenant_id" = (current_setting('app.tenant_id', true))::uuid) WITH CHECK ("duty_assignments"."tenant_id" = (current_setting('app.tenant_id', true))::uuid);