// ============================================
// ROME EMPIRE BUILDER - Economy Constants
// ============================================
// Core constants for market economy mechanics.

import type { ResourceType, Season } from '@/core/types';

// === SUPPLY/DEMAND PRICING CONSTANTS ===

export const PRICING_CONSTANTS = {
    // Supply/Demand Factor Bounds
    MIN_SCARCITY_MULTIPLIER: 0.5,   // Floor: price cannot drop below 50% of base
    MAX_SCARCITY_MULTIPLIER: 3.0,   // Ceiling: price cannot exceed 300% of base

    // Supply/Demand Sensitivity
    DEMAND_SENSITIVITY: 1.0,        // How strongly demand affects price
    SUPPLY_SENSITIVITY: 1.2,        // How strongly supply affects price (slightly higher)

    // Market Inertia (price changes are gradual)
    PRICE_CHANGE_SPEED: 0.15,       // 15% change per season toward target price
    VOLATILITY_BASE: 0.05,          // 5% random fluctuation

    // Stockpile Effects
    OVERSUPPLY_THRESHOLD: 0.8,      // Above 80% capacity = oversupply
    SHORTAGE_THRESHOLD: 0.2,        // Below 20% capacity = shortage
    CRITICAL_SHORTAGE_THRESHOLD: 0.05, // Below 5% = critical shortage

    // Price Stabilization
    PRICE_FLOOR_MULTIPLIER: 0.3,    // Prices never drop below 30% of base
    PRICE_CEILING_MULTIPLIER: 4.0,  // Prices never exceed 400% of base
} as const;

// === REGIONAL MODIFIERS ===
// Different city types affect resource prices

export type RegionType = 'coastal' | 'inland' | 'mountain' | 'river' | 'capital';

export const REGIONAL_PRICE_MODIFIERS: Record<RegionType, Partial<Record<ResourceType, number>>> = {
    coastal: {
        salt: 0.7,          // -30% salt (abundant from sea)
        olive_oil: 0.85,    // -15% olive oil (Mediterranean trade)
        spices: 0.8,        // -20% spices (imported by sea)
        iron: 1.15,         // +15% iron (must be transported)
        timber: 1.1,        // +10% timber (coastal areas often deforested)
    },
    inland: {
        grain: 0.8,         // -20% grain (fertile farmland)
        livestock: 0.85,    // -15% livestock (grazing land)
        wool: 0.9,          // -10% wool
        salt: 1.3,          // +30% salt (no sea access)
        spices: 1.4,        // +40% spices (long trade routes)
    },
    mountain: {
        iron: 0.7,          // -30% iron (mining regions)
        stone: 0.6,         // -40% stone (quarries)
        timber: 0.85,       // -15% timber (forest coverage)
        grain: 1.25,        // +25% grain (poor farmland)
        olive_oil: 1.3,     // +30% olive oil (wrong climate)
    },
    river: {
        timber: 0.75,       // -25% timber (floated downstream)
        clay: 0.8,          // -20% clay (riverbed deposits)
        grain: 0.9,         // -10% grain (irrigated fields)
        stone: 1.1,         // +10% stone (soft riverbed)
    },
    capital: {
        // Rome itself - high demand, high prices for luxuries
        wine: 1.2,          // +20% wine (elite consumption)
        spices: 1.15,       // +15% spices (luxury demand)
        olive_oil: 1.1,     // +10% olive oil (urban consumption)
        grain: 0.95,        // -5% grain (state subsidies/annona)
    },
};

// === SEASONAL PRICE MODIFIERS ===

export const SEASONAL_PRICE_MODIFIERS: Record<Season, Partial<Record<ResourceType, number>>> = {
    spring: {
        grain: 1.1,         // +10% (planting season, reserves low)
        livestock: 1.05,    // +5% (breeding season)
        wine: 0.95,         // -5% (stored wines selling)
    },
    summer: {
        grain: 0.85,        // -15% (early harvest)
        olive_oil: 0.9,     // -10% (production starting)
        wool: 1.1,          // +10% (shearing done, demand rises)
        salt: 1.15,         // +15% (preservation needs)
    },
    autumn: {
        grain: 0.75,        // -25% (harvest abundance)
        wine: 0.8,          // -20% (new vintage)
        olive_oil: 0.85,    // -15% (olive harvest)
        livestock: 0.9,     // -10% (culling before winter)
        wool: 0.95,         // -5%
    },
    winter: {
        grain: 1.2,         // +20% (consumption high, no production)
        livestock: 1.15,    // +15% (feeding costs)
        salt: 1.25,         // +25% (preservation critical)
        timber: 1.1,        // +10% (heating fuel)
        iron: 0.95,         // -5% (forge work slower)
        spices: 1.2,        // +20% (preserved food needs flavor)
    },
};

// === MERCHANT REPUTATION SYSTEM ===

export type ReputationLevel = 'hostile' | 'wary' | 'neutral' | 'friendly' | 'trusted' | 'honored';

export interface ReputationTier {
    level: ReputationLevel;
    minReputation: number;
    maxReputation: number;
    priceModifier: number;      // Applied to sell prices
    buyDiscount: number;        // Discount when buying
    specialOffersChance: number; // Chance for special deals
    creditLimit: number;        // Max denarii credit allowed
}

export const REPUTATION_TIERS: ReputationTier[] = [
    {
        level: 'hostile',
        minReputation: -100,
        maxReputation: -21,
        priceModifier: -0.30,       // -30% sell prices
        buyDiscount: -0.20,         // +20% buy costs (penalty)
        specialOffersChance: 0,
        creditLimit: 0,
    },
    {
        level: 'wary',
        minReputation: -20,
        maxReputation: -1,
        priceModifier: -0.15,       // -15% sell prices
        buyDiscount: -0.10,         // +10% buy costs
        specialOffersChance: 0,
        creditLimit: 0,
    },
    {
        level: 'neutral',
        minReputation: 0,
        maxReputation: 24,
        priceModifier: 0,           // Base prices
        buyDiscount: 0,
        specialOffersChance: 0.05,  // 5% chance
        creditLimit: 100,
    },
    {
        level: 'friendly',
        minReputation: 25,
        maxReputation: 49,
        priceModifier: 0.10,        // +10% sell prices
        buyDiscount: 0.05,          // -5% buy costs
        specialOffersChance: 0.15,  // 15% chance
        creditLimit: 300,
    },
    {
        level: 'trusted',
        minReputation: 50,
        maxReputation: 74,
        priceModifier: 0.20,        // +20% sell prices
        buyDiscount: 0.10,          // -10% buy costs
        specialOffersChance: 0.25,  // 25% chance
        creditLimit: 500,
    },
    {
        level: 'honored',
        minReputation: 75,
        maxReputation: 100,
        priceModifier: 0.30,        // +30% sell prices
        buyDiscount: 0.15,          // -15% buy costs
        specialOffersChance: 0.40,  // 40% chance
        creditLimit: 1000,
    },
];

// Actions that affect reputation
export const REPUTATION_CHANGES = {
    SUCCESSFUL_TRADE: 2,            // +2 per successful trade
    LARGE_TRADE: 5,                 // +5 for trades > 20 units
    CARAVAN_SUCCESS: 3,             // +3 for successful caravan
    TRADE_ROUTE_MAINTAINED: 1,      // +1 per season active route
    CARAVAN_FAILURE: -2,            // -2 if caravan fails
    DEAL_BROKEN: -10,               // -10 for breaking trade route early
    PRICE_GOUGING: -5,              // -5 for selling during crisis at high prices
    FAIR_CRISIS_TRADE: 8,           // +8 for selling at fair prices during shortage
    EXCLUSIVE_CONTRACT: 10,         // +10 for signing exclusive deal
    TRIBUTE_PAID: 3,                // +3 for paying optional tribute
    REPUTATION_DECAY_PER_SEASON: -1, // -1 natural decay per season without trade
};

// === ECONOMIC EVENTS ===

export interface EconomicEvent {
    id: string;
    name: string;
    description: string;
    icon: string;
    duration: number;               // Seasons
    probability: number;            // Base chance per season
    category: 'supply_shock' | 'demand_shock' | 'trade_disruption' | 'windfall';
    conditions?: {
        minRound?: number;
        requiresCoastal?: boolean;
        requiresMilitaryVictory?: boolean;
        season?: Season;
    };
    effects: {
        priceModifiers?: Partial<Record<ResourceType, number>>;
        tradeTariffMod?: number;
        tradeRiskMod?: number;
        treasuryBonus?: number;
        inflationChange?: number;
    };
}

export const ECONOMIC_EVENTS: EconomicEvent[] = [
    // Supply Shocks
    {
        id: 'egyptian_grain_fleet_delayed',
        name: 'Egyptian Grain Fleet Delayed',
        description: 'Storms in the Mare Nostrum have delayed the vital Egyptian grain shipments. Prices soar as granaries empty.',
        icon: 'ship',
        duration: 2,
        probability: 0.06,
        category: 'supply_shock',
        conditions: { minRound: 4, season: 'autumn' },
        effects: {
            priceModifiers: { grain: 1.5, livestock: 1.2 }, // +50% grain, +20% livestock
            tradeRiskMod: 0.15,
        },
    },
    {
        id: 'bumper_harvest_campania',
        name: 'Bumper Harvest in Campania',
        description: 'The fertile fields of Campania have produced an exceptional harvest this year. Food prices plummet.',
        icon: 'wheat',
        duration: 2,
        probability: 0.08,
        category: 'windfall',
        conditions: { season: 'autumn' },
        effects: {
            priceModifiers: { grain: 0.7, olive_oil: 0.85 }, // -30% grain, -15% olive oil
        },
    },
    {
        id: 'pirate_activity',
        name: 'Pirate Activity in Mare Nostrum',
        description: 'Cilician pirates raid merchant vessels, disrupting sea trade throughout the Mediterranean.',
        icon: 'skull',
        duration: 3,
        probability: 0.05,
        category: 'trade_disruption',
        conditions: { minRound: 6 },
        effects: {
            priceModifiers: { spices: 1.4, wine: 1.25, olive_oil: 1.2 },
            tradeRiskMod: 0.25,
            tradeTariffMod: 0.1,
        },
    },
    {
        id: 'silver_mine_discovered',
        name: 'New Silver Mine Discovered',
        description: 'Rich silver deposits have been found in Hispania! The treasury swells, but merchants worry about coin debasement.',
        icon: 'gem',
        duration: 4,
        probability: 0.03,
        category: 'windfall',
        conditions: { minRound: 8 },
        effects: {
            treasuryBonus: 500,
            inflationChange: 0.02, // +2% inflation
        },
    },
    {
        id: 'plague_in_alexandria',
        name: 'Plague in Alexandria',
        description: 'A terrible sickness sweeps through the great port of Alexandria, halting trade with Egypt.',
        icon: 'skull-2',
        duration: 3,
        probability: 0.04,
        category: 'supply_shock',
        conditions: { minRound: 10 },
        effects: {
            priceModifiers: { grain: 1.4, spices: 1.6 },
            tradeRiskMod: 0.20,
        },
    },
    {
        id: 'gallic_iron_surplus',
        name: 'Gallic Iron Surplus',
        description: 'Gallic smiths have produced more iron than their tribes can use. Cheap metal floods the market.',
        icon: 'swords',
        duration: 2,
        probability: 0.06,
        category: 'windfall',
        effects: {
            priceModifiers: { iron: 0.65 }, // -35% iron
        },
    },
    {
        id: 'drought_in_sicily',
        name: 'Drought in Sicily',
        description: 'The breadbasket of Rome suffers a severe drought. Wheat prices spike dangerously.',
        icon: 'cloud-sun',
        duration: 2,
        probability: 0.05,
        category: 'supply_shock',
        conditions: { season: 'summer' },
        effects: {
            priceModifiers: { grain: 1.6, livestock: 1.3 },
        },
    },
    {
        id: 'phoenician_merchants',
        name: 'Phoenician Merchant Fleet Arrives',
        description: 'A large Phoenician trading fleet docks at Ostia, bringing exotic goods from distant lands.',
        icon: 'ship',
        duration: 1,
        probability: 0.07,
        category: 'windfall',
        effects: {
            priceModifiers: { spices: 0.6, olive_oil: 0.75, wine: 0.8 },
            tradeTariffMod: -0.05,
        },
    },
    {
        id: 'sabine_wool_festival',
        name: 'Sabine Wool Festival',
        description: 'The Sabine tribes hold their annual wool market, offering exceptional fleeces at fair prices.',
        icon: 'shirt',
        duration: 1,
        probability: 0.08,
        category: 'windfall',
        conditions: { season: 'spring' },
        effects: {
            priceModifiers: { wool: 0.6 },
        },
    },
    {
        id: 'etruscan_blockade',
        name: 'Etruscan Trade Blockade',
        description: 'Etruscan cities have closed their ports to Roman merchants in retaliation for territorial disputes.',
        icon: 'ban',
        duration: 2,
        probability: 0.04,
        category: 'trade_disruption',
        conditions: { minRound: 5 },
        effects: {
            priceModifiers: { iron: 1.35, clay: 1.25, wine: 1.3 },
            tradeTariffMod: 0.20,
        },
    },
    {
        id: 'salt_road_bandits',
        name: 'Bandits on the Via Salaria',
        description: 'Organized bandits have made the salt road dangerous. Salt caravans demand armed escorts.',
        icon: 'alert-triangle',
        duration: 2,
        probability: 0.06,
        category: 'trade_disruption',
        effects: {
            priceModifiers: { salt: 1.45 },
            tradeRiskMod: 0.15,
        },
    },
    {
        id: 'spanish_olive_glut',
        name: 'Spanish Olive Glut',
        description: 'Hispania produces an enormous olive harvest, flooding markets with cheap oil.',
        icon: 'droplet',
        duration: 2,
        probability: 0.06,
        category: 'windfall',
        conditions: { season: 'autumn' },
        effects: {
            priceModifiers: { olive_oil: 0.55 }, // -45% olive oil!
        },
    },
];

// === CITY TYPE DEFINITIONS ===

export type CityType = 'coastal' | 'inland' | 'mountain' | 'river' | 'capital';

export interface CityTradeProfile {
    id: string;
    type: CityType;
    distanceFromRome: number;       // Miles
    hasPort: boolean;
    hasMines: boolean;
    hasFarms: boolean;
    specialties: ResourceType[];    // Resources they produce
    demands: ResourceType[];        // Resources they need
}

// === DISTANCE PRICING ===

export const DISTANCE_PRICING = {
    BASE_DISTANCE_COST: 0.005,      // +0.5% per mile from Rome
    MAX_DISTANCE_PENALTY: 0.40,     // Max +40% for very distant cities
    PORT_DISCOUNT: 0.15,            // -15% for coastal trade
    ROAD_DISCOUNT: 0.10,            // -10% if Via roads exist
    RIVER_DISCOUNT: 0.08,           // -8% for river transport
} as const;
