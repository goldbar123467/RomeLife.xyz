import {
  pgTable, uuid, text, integer, real, boolean, timestamp, jsonb, serial, index,
} from 'drizzle-orm/pg-core';

// ── Games table: one row per playthrough ──
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  founder: text('founder'),                       // 'romulus' | 'remus'
  patronGod: text('patron_god'),                  // 'jupiter' | 'mars' | etc
  status: text('status').notNull().default('active'), // 'active' | 'victory' | 'defeat'
  victoryType: text('victory_type'),              // 'eternal_city' | 'commerce' | etc
  defeatReason: text('defeat_reason'),            // 'famine' | 'collapse' | 'unrest'
  currentRound: integer('current_round').notNull().default(1),
  currentSeason: text('current_season').notNull().default('spring'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  finishedAt: timestamp('finished_at'),
}, (table) => [
  index('games_status_idx').on(table.status),
  index('games_created_idx').on(table.createdAt),
]);

// ── Season snapshots: full state JSON + extracted metrics per round ──
export const seasonSnapshots = pgTable('season_snapshots', {
  id: serial('id').primaryKey(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  round: integer('round').notNull(),
  season: text('season').notNull(),

  // Extracted key metrics (queryable for analytics)
  denarii: integer('denarii').notNull(),
  population: integer('population').notNull(),
  happiness: real('happiness').notNull(),
  morale: real('morale').notNull(),
  troops: integer('troops').notNull(),
  reputation: real('reputation').notNull(),
  piety: real('piety').notNull(),
  territoriesOwned: integer('territories_owned').notNull(),
  buildingCount: integer('building_count').notNull(),

  // Full game state blob (for restore / replay)
  fullState: jsonb('full_state').notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('snapshots_game_round_idx').on(table.gameId, table.round),
  index('snapshots_game_idx').on(table.gameId),
]);

// ── Events log: every notable thing that happens ──
export const eventsLog = pgTable('events_log', {
  id: serial('id').primaryKey(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  round: integer('round').notNull(),
  season: text('season').notNull(),

  // Event classification
  category: text('category').notNull(),  // 'treasury' | 'battle' | 'senate' | 'religion' | 'trade' | 'territory' | 'achievement' | 'wonder' | 'crisis' | 'system'
  eventType: text('event_type').notNull(), // specific event ID or type
  message: text('message').notNull(),     // human-readable description

  // Structured effect data (what changed)
  effects: jsonb('effects'),  // { denarii: -50, happiness: +10, ... }

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('events_game_round_idx').on(table.gameId, table.round),
  index('events_game_category_idx').on(table.gameId, table.category),
]);

// ── System stats: per-system health tracking each round ──
export const systemStats = pgTable('system_stats', {
  id: serial('id').primaryKey(),
  gameId: uuid('game_id').notNull().references(() => games.id, { onDelete: 'cascade' }),
  round: integer('round').notNull(),

  // Economy
  netIncome: integer('net_income'),
  taxRevenue: integer('tax_revenue'),
  upkeep: integer('upkeep'),
  tradeIncome: integer('trade_income'),

  // Military
  battlesWon: integer('battles_won').notNull().default(0),
  battlesLost: integer('battles_lost').notNull().default(0),
  casualtiesTaken: integer('casualties_taken').notNull().default(0),

  // Religion
  totalFavor: real('total_favor'),  // sum across all gods
  activeBlessing: text('active_blessing'), // highest tier active

  // Senate
  avgSenatorRelation: real('avg_senator_relation'),
  senatorCrises: integer('senator_crises').notNull().default(0),

  // Diplomacy
  activeEnvoys: integer('active_envoys').notNull().default(0),

  // Territory
  avgStability: real('avg_stability'),
  totalGarrison: integer('total_garrison'),

  // Food
  grainStock: integer('grain_stock'),
  foodConsumption: real('food_consumption'),
  isStarving: boolean('is_starving').notNull().default(false),

  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('stats_game_round_idx').on(table.gameId, table.round),
]);
