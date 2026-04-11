CREATE TABLE "events_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" uuid NOT NULL,
	"round" integer NOT NULL,
	"season" text NOT NULL,
	"category" text NOT NULL,
	"event_type" text NOT NULL,
	"message" text NOT NULL,
	"effects" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"founder" text,
	"patron_god" text,
	"status" text DEFAULT 'active' NOT NULL,
	"victory_type" text,
	"defeat_reason" text,
	"current_round" integer DEFAULT 1 NOT NULL,
	"current_season" text DEFAULT 'spring' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "season_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" uuid NOT NULL,
	"round" integer NOT NULL,
	"season" text NOT NULL,
	"denarii" integer NOT NULL,
	"population" integer NOT NULL,
	"happiness" real NOT NULL,
	"morale" real NOT NULL,
	"troops" integer NOT NULL,
	"reputation" real NOT NULL,
	"piety" real NOT NULL,
	"territories_owned" integer NOT NULL,
	"building_count" integer NOT NULL,
	"full_state" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_stats" (
	"id" serial PRIMARY KEY NOT NULL,
	"game_id" uuid NOT NULL,
	"round" integer NOT NULL,
	"net_income" integer,
	"tax_revenue" integer,
	"upkeep" integer,
	"trade_income" integer,
	"battles_won" integer DEFAULT 0 NOT NULL,
	"battles_lost" integer DEFAULT 0 NOT NULL,
	"casualties_taken" integer DEFAULT 0 NOT NULL,
	"total_favor" real,
	"active_blessing" text,
	"avg_senator_relation" real,
	"senator_crises" integer DEFAULT 0 NOT NULL,
	"active_envoys" integer DEFAULT 0 NOT NULL,
	"avg_stability" real,
	"total_garrison" integer,
	"grain_stock" integer,
	"food_consumption" real,
	"is_starving" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events_log" ADD CONSTRAINT "events_log_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season_snapshots" ADD CONSTRAINT "season_snapshots_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_stats" ADD CONSTRAINT "system_stats_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "events_game_round_idx" ON "events_log" USING btree ("game_id","round");--> statement-breakpoint
CREATE INDEX "events_game_category_idx" ON "events_log" USING btree ("game_id","category");--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" USING btree ("status");--> statement-breakpoint
CREATE INDEX "games_created_idx" ON "games" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "snapshots_game_round_idx" ON "season_snapshots" USING btree ("game_id","round");--> statement-breakpoint
CREATE INDEX "snapshots_game_idx" ON "season_snapshots" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "stats_game_round_idx" ON "system_stats" USING btree ("game_id","round");