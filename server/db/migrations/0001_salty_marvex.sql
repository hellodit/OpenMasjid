CREATE TYPE "public"."cash_account_type" AS ENUM('cash', 'bank', 'ewallet');--> statement-breakpoint
CREATE TYPE "public"."transaction_category_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'transfer');--> statement-breakpoint
CREATE TABLE "cash_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "cash_account_type" NOT NULL,
	"account_number" text,
	"holder_name" text,
	"opening_balance" numeric(14, 2) DEFAULT '0' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "cash_accounts_opening_balance_non_negative" CHECK ("cash_accounts"."opening_balance" >= 0)
);
--> statement-breakpoint
CREATE TABLE "transaction_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"type" "transaction_category_type" NOT NULL,
	"icon" text,
	"color_token" text,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
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
ALTER TABLE "transaction_categories" ADD CONSTRAINT "transaction_categories_parent_id_transaction_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."transaction_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_cash_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destination_account_id_cash_accounts_id_fk" FOREIGN KEY ("destination_account_id") REFERENCES "public"."cash_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_transaction_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."transaction_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cash_accounts_active_sort_idx" ON "cash_accounts" USING btree ("is_active","sort_order") WHERE "cash_accounts"."deleted_at" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "transaction_categories_slug_unique" ON "transaction_categories" USING btree ("slug") WHERE "transaction_categories"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "transaction_categories_parent_idx" ON "transaction_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "transaction_categories_type_active_idx" ON "transaction_categories" USING btree ("type","is_active");--> statement-breakpoint
CREATE INDEX "transactions_date_idx" ON "transactions" USING btree ("transaction_date" DESC NULLS LAST) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "transactions_account_date_idx" ON "transactions" USING btree ("account_id","transaction_date" DESC NULLS LAST) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "transactions_category_date_idx" ON "transactions" USING btree ("category_id","transaction_date" DESC NULLS LAST) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "transactions_destination_idx" ON "transactions" USING btree ("destination_account_id") WHERE "transactions"."destination_account_id" IS NOT NULL;