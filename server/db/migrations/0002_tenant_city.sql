ALTER TABLE "tenants" ADD COLUMN "city" text;--> statement-breakpoint
CREATE INDEX "tenants_name_lower_idx" ON "tenants" USING btree (lower("name"));