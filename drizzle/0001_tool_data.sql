CREATE TABLE "compliance_rules" (
	"rule_id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"group_key" text NOT NULL,
	"conditions" jsonb NOT NULL,
	"summary" text NOT NULL,
	"summary_other" text,
	"what_to_do" jsonb NOT NULL,
	"source_title" text NOT NULL,
	"source_url" text,
	"sources_by_region" jsonb,
	"rules_hub_anchor" text NOT NULL,
	"data_keys" jsonb,
	"sort_order" integer NOT NULL,
	"last_checked" date NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"verify" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "figures" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"label" text,
	"source_title" text NOT NULL,
	"source_url" text,
	"last_checked" date NOT NULL,
	"verify" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"first_name" text,
	"tool_slug" text NOT NULL,
	"consent_text" text NOT NULL,
	"consented_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "leads_tool_idx" ON "leads" USING btree ("tool_slug");