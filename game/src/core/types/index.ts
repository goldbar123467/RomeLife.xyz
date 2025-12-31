// ============================================
// ROME EMPIRE BUILDER - Core Type Definitions
// ============================================

// Re-export senate types
import type { SenateState } from './senate';
export * from './senate';

// === ENUMS ===

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'imperial';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type ResourceType =
    | 'grain' | 'iron' | 'timber' | 'stone' | 'clay'
    | 'wool' | 'salt' | 'livestock' | 'wine' | 'olive_oil' | 'spices';

export type BuildingCategory = 'production' | 'military' | 'economic' | 'religious' | 'civic';

export type TerritoryFocus = 'military_outpost' | 'trade_hub' | 'breadbasket' | 'mining_district' | 'none';

export type GovernorTrait = 'merchant' | 'general' | 'administrator' | 'priest' | 'scholar';

export type GodName = 'jupiter' | 'mars' | 'venus' | 'ceres' | 'mercury' | 'minerva';

export type FounderName = 'romulus' | 'remus';

export type GameStage = 'intro' | 'founder_select' | 'game' | 'battle' | 'results';

export type Tab =
    | 'overview' | 'resources' | 'economy' | 'trade'
    | 'military' | 'map' | 'settlement' | 'diplomacy'
    | 'technology' | 'religion' | 'achievements' | 'wonders' | 'quests'
    | 'senate';

// === INTERFACES ===

export interface RarityData {
    name: Rarity;
    probability: number;
    bonus: number;
    cssClass: string;
}

export interface Founder {
    id: FounderName;
    name: string;
    archetype: string;
    description: string;
    modifiers: FounderModifiers;
}

export interface FounderModifiers {
    attackBonus: number;
    troopBonus: number;
    recruitCostMod: number;
    riskMod: number;
    relationshipBonus: number;
    tradePriceMod: number;
    favorGainMod: number;
}

export interface Territory {
    id: string;
    name: string;
    latinName: string;
    owned: boolean;
    rarity: Rarity;
    level: 1 | 2 | 3 | 4 | 5;
    stability: number;
    focus: TerritoryFocus;
    governor: Governor | null;
    resources: ResourceProduction[];
    buildings: string[];
    population: number;
    garrison: number;
    requirements: TerritoryRequirement[];
    difficulty: number;
    description: string;
    pros: string[];
    cons: string[];
    history: string;
}

export interface TerritoryRequirement {
    type: 'territory' | 'troops' | 'denarii' | 'tech';
    value: string | number;
}

export interface ResourceProduction {
    type: ResourceType;
    baseAmount: number;
}

export interface Governor {
    id: string;
    name: string;
    trait: GovernorTrait;
    bonus: { [key: string]: number };
    malus: { [key: string]: number };
}

export interface Building {
    id: string;
    name: string;
    category: BuildingCategory;
    rarity: Rarity;
    cost: BuildingCost;
    upkeep: number;
    effects: BuildingEffect[];
    count: number;  // How many of this building have been built (allows multiples)
    territoryId?: string;
}

export interface BuildingCost {
    denarii: number;
    resources?: Partial<Record<ResourceType, number>>;
}

export interface BuildingEffect {
    type: 'production' | 'capacity' | 'happiness' | 'defense' | 'income' | 'piety';
    resource?: ResourceType;
    value: number;
    multiplier?: boolean;
}

export interface Technology {
    id: string;
    name: string;
    description: string;
    cost: number;
    researched: boolean;
    effects: TechEffect[];
    category: 'economy' | 'military' | 'farming' | 'mining' | 'population' | 'trade';
}

export interface TechEffect {
    type: string;
    value: number;
    description: string;
    multiplier?: boolean;
}

export interface MilitaryUnit {
    id: string;
    name: string;
    cost: { denarii: number; food: number };
    troopsMin: number;
    troopsMax: number;
    role: string;
    description: string;
    pros: string[];
    cons: string[];
    history: string;
}

export interface TradeCity {
    id: string;
    name: string;
    distance: number;
    tariff: number;
    risk: number;
    biases: ResourceType[];
    specialties: ResourceType[];
    reputation: number;
}

export interface God {
    id: GodName;
    name: string;
    domain: string;
    patronBonus: string;
    blessings: Blessing[];
    description: string;
    symbols: string[];
    greekEquivalent: string;
    history: string;
}

export interface Blessing {
    tier: 25 | 50 | 75 | 100;
    name: string;
    effect: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    type: 'build' | 'conquer' | 'trade' | 'research' | 'threshold';
    target: number;
    progress: number;
    reward: QuestReward;
    active: boolean;
    completed: boolean;
}

export interface QuestReward {
    denarii?: number;
    reputation?: number;
    favor?: number;
    tradeBuff?: { duration: number; multiplier: number };
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    condition: string;
    unlocked: boolean;
    reward: AchievementReward;
}

export interface AchievementReward {
    denarii?: number;
    favor?: number;
    reputation?: number;
    happiness?: number;
    morale?: number;
    housing?: number;
    capacity?: number;
    supplies?: number;
    piety?: number;
}

export interface Wonder {
    id: string;
    name: string;
    description: string;
    cost: WonderCost;
    built: boolean;
    turnsRemaining?: number; // Turns left to complete construction
    effects: WonderEffect[];
    history: string;
    facts: string[];
    yearBuilt: string;
    latinName: string;
}

export interface WonderCost {
    denarii: number;
    resources: Partial<Record<ResourceType, number>>;
    turns: number;
}

export interface WonderEffect {
    type: string;
    value: number;
    description: string;
}

// === RANDOM EVENTS ===

export interface GameEvent {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'positive' | 'negative' | 'neutral';
    probability: number;
    effects: GameEventEffect[];
}

export interface GameEventEffect {
    type: 'denarii' | 'population' | 'happiness' | 'morale' | 'troops' | 'piety' | 'reputation' | 'resource';
    value: number;
    resource?: ResourceType;
}

export interface BattleState {
    active: boolean;
    type: 'conquest' | 'raid' | 'defense';
    targetTerritory?: string;
    playerStrength: number;
    enemyStrength: number;
    odds: number;
    result?: 'victory' | 'defeat' | 'retreat';
    casualties: { player: number; enemy: number };
}

export interface MarketState {
    prices: Record<ResourceType, number>;
    demandIndices: Record<ResourceType, number>;
    volatility: number;
}

// === CARAVAN & TRADE ROUTE TYPES ===

export type CaravanType = 'safe' | 'standard' | 'risky' | 'luxury';

export interface CaravanConfig {
    id: CaravanType;
    name: string;
    icon: string;
    risk: number;      // 0-1 failure chance
    reward: number;    // multiplier (1.1 = 10% bonus)
    duration: number;  // seasons until return
    cost: number;      // denarii cost to send
    description: string;
}

export interface ActiveCaravan {
    type: CaravanType;
    cityId: string;
    cityName: string;
    risk: number;
    reward: number;
    duration: number;  // seasons remaining
    goods: { resourceId: ResourceType; qty: number }[];
}

export interface TradeRoute {
    id: string;
    cityId: string;
    resourceId: ResourceType;
    qty: number;       // goods sent per season
    income: number;    // denarii returned per season
    duration: number;  // seasons remaining
}

export interface TradeUpgrades {
    guards: number;      // -10% risk per level
    wagons: number;      // +2 goods capacity per level
    negotiation: number; // +5% prices per level
}

export interface TradeState {
    activeTab: 'quick' | 'routes' | 'market' | 'caravans';
    upgrades: TradeUpgrades;
    routes: TradeRoute[];
    activeCaravan: ActiveCaravan | null;
    cityReputation: Record<string, number>;
}

export interface DiplomacyState {
    relations: Record<string, number>;
    activeEnvoys: number;
}

// === GAME STATE ===

export interface GameState {
    // Meta
    stage: GameStage;
    activeTab: Tab;
    round: number;
    season: Season;
    maxRounds: number;
    infiniteMode: boolean;

    // Founder
    founder: Founder | null;

    // Resources
    denarii: number;
    inventory: Record<ResourceType, number>;
    capacity: Record<ResourceType, number>;

    // Population & Happiness
    population: number;
    happiness: number;
    housing: number;
    sanitation: number;

    // Military
    troops: number;
    morale: number;
    supplies: number;
    forts: number;

    // Religion
    piety: number;
    patronGod: GodName | null;
    godFavor: Record<GodName, number>;

    // Economy
    taxRate: number;
    inflation: number;
    reputation: number;

    // Game Objects
    territories: Territory[];
    buildings: Building[];
    technologies: Technology[];
    tradeCities: TradeCity[];
    quests: Quest[];
    achievements: Achievement[];
    wonders: Wonder[];

    // Battle
    battle: BattleState | null;

    // Market
    market: MarketState;

    // Trade State (caravans, routes, upgrades)
    tradeState: TradeState;

    // Diplomacy
    diplomacy: DiplomacyState;

    // Senate (V2 Political System)
    senate: SenateState;

    // Stats & History
    totalConquests: number;
    totalTrades: number;
    winStreak: number;
    consecutiveStarvation: number;
    feastsUsed: number;  // Tracks feast uses for diminishing returns
    history: GameHistoryEntry[];
    treasuryHistory: TreasuryHistoryEntry[];

    // Emergency Actions
    emergencyCooldowns?: Record<string, number>;

    // Event Cooldowns (prevent same event from repeating)
    eventCooldowns?: Record<string, number>;

    // Religion - Consecrated territories get +25% production
    consecratedTerritories: string[];

    // Worship action cooldowns
    worshipCooldowns?: Record<string, number>;
}

export interface GameHistoryEntry {
    round: number;
    season: Season;
    denarii: number;
    population: number;
    troops: number;
    morale: number;
    supplies: number;
    territories: number;
    events: string[];
}

export interface TreasuryHistoryEntry {
    round: number;
    season: Season;
    denarii: number;
    income: number;
    upkeep: number;
    netIncome: number;
}

// === COMPUTED VALUES ===

export interface SeasonModifiers {
    farmProduction: number;
    fisheryProduction: number;
    foodConsumption: number;
    happiness: number;
    morale: number;
    upkeep: number;
    tradePrices: number;
}

export interface ProductionSummary {
    resources: Record<ResourceType, number>;
    income: number;
    upkeep: number;
    foodConsumption: number;
    netIncome: number;
}
