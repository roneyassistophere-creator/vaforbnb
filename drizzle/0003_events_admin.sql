CREATE TABLE "app_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"password_hash" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "app_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_email" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"summary" text NOT NULL,
	"changes" jsonb
);
--> statement-breakpoint
CREATE TABLE "bank_holidays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"name" text NOT NULL,
	"nations" jsonb NOT NULL,
	"source" text NOT NULL,
	"year" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_categories" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"tip" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_cities" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"nation" text NOT NULL,
	"region" text,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"covered" boolean DEFAULT true NOT NULL,
	"aliases" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"intro" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_suggestions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"date" text NOT NULL,
	"town" text NOT NULL,
	"source_url" text NOT NULL,
	"email" text,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"category_slug" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"start_time" text,
	"date_status" text NOT NULL,
	"city_slug" text NOT NULL,
	"venue" text,
	"address" text,
	"latitude" double precision,
	"longitude" double precision,
	"demand" text NOT NULL,
	"demand_reason" text,
	"short_description" text,
	"source_title" text NOT NULL,
	"source_url" text NOT NULL,
	"second_source_url" text,
	"last_checked" date,
	"checked_by" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"recurrence" text DEFAULT 'none' NOT NULL,
	"usual_month" integer,
	"usual_week" integer,
	"featured" boolean DEFAULT false NOT NULL,
	"internal_notes" text,
	"is_sample" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "app_sessions" ADD CONSTRAINT "app_sessions_user_id_app_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_sessions_user_idx" ON "app_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_at_idx" ON "audit_log" USING btree ("at");--> statement-breakpoint
CREATE UNIQUE INDEX "bank_holidays_date_name_idx" ON "bank_holidays" USING btree ("date","name");--> statement-breakpoint
CREATE INDEX "events_city_idx" ON "events" USING btree ("city_slug");--> statement-breakpoint
CREATE INDEX "events_start_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("status");