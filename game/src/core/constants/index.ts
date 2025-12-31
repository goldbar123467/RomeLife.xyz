// ============================================
// ROME EMPIRE BUILDER - Game Constants
// ============================================

import type {
    RarityData, Founder, MilitaryUnit, God, SeasonModifiers,
    ResourceType, Season, GodName, FounderName
} from '../types';

// === RARITY SYSTEM ===
export const RARITY_TABLE: RarityData[] = [
    { name: 'common', probability: 0.80, bonus: 1.0, cssClass: 'rarity-common' },
    { name: 'uncommon', probability: 0.12, bonus: 1.1, cssClass: 'rarity-uncommon' },
    { name: 'rare', probability: 0.05, bonus: 1.25, cssClass: 'rarity-rare' },
    { name: 'epic', probability: 0.025, bonus: 1.5, cssClass: 'rarity-epic' },
    { name: 'legendary', probability: 0.005, bonus: 2.0, cssClass: 'rarity-legendary' },
    { name: 'imperial', probability: 0.0005, bonus: 3.0, cssClass: 'rarity-imperial' },
];

// === FOUNDERS ===
export const FOUNDERS: Record<FounderName, Founder> = {
    romulus: {
        id: 'romulus',
        name: 'Romulus',
        archetype: 'Warrior',
        description: 'The legendary founder and first king. Military prowess and aggressive expansion.',
        modifiers: {
            attackBonus: 0.25,
            troopBonus: 0.20,
            recruitCostMod: -0.15,
            riskMod: -0.10,
            relationshipBonus: 0,
            tradePriceMod: 0,
            favorGainMod: 0,
        },
    },
    remus: {
        id: 'remus',
        name: 'Remus',
        archetype: 'Diplomat',
        description: 'The peaceful twin. Diplomacy and trade bring prosperity without bloodshed.',
        modifiers: {
            attackBonus: 0,
            troopBonus: 0,
            recruitCostMod: 0,
            riskMod: 0,
            relationshipBonus: 0.30,
            tradePriceMod: 0.15,
            favorGainMod: 0.20,
        },
    },
};

// === MILITARY UNITS (tightened variance for predictability) ===
export const MILITARY_UNITS: MilitaryUnit[] = [
    {
        id: 'militia',
        name: 'Militia',
        cost: { denarii: 80, food: 5 },
        troopsMin: 9,
        troopsMax: 11,
        role: 'Cheap fodder',
        description: 'Hastily armed citizens called to defend Rome in times of need. Equipped with basic weapons and minimal training.',
        pros: ['Very cheap to recruit', 'Low food requirements', 'Quick to mobilize'],
        cons: ['Low combat effectiveness', 'Poor morale under pressure', 'High casualty rates'],
        history: 'In early Rome, all male citizens were expected to serve in the militia when called. These citizen-soldiers provided their own equipment based on wealth class. While crucial for Rome\'s early survival, they were gradually replaced by professional soldiers as the empire expanded.'
    },
    {
        id: 'auxiliaries',
        name: 'Auxiliaries',
        cost: { denarii: 100, food: 7 },
        troopsMin: 12,
        troopsMax: 14,
        role: 'Mercenaries',
        description: 'Non-citizen soldiers recruited from allied or conquered territories. They bring diverse fighting styles and specialized skills.',
        pros: ['Diverse combat skills', 'Good value for cost', 'Specialty units available'],
        cons: ['Loyalty can waver', 'Less disciplined than legions', 'Variable equipment quality'],
        history: 'Auxiliaries (auxilia) were non-Roman soldiers who served alongside the legions. They included Gallic cavalry, Syrian archers, and Germanic infantry. After 25 years of service, auxiliaries earned Roman citizenship—a powerful incentive for loyalty.'
    },
    {
        id: 'archers',
        name: 'Archers',
        cost: { denarii: 120, food: 6 },
        troopsMin: 11,
        troopsMax: 14,
        role: 'Ranged support',
        description: 'Skilled bowmen who rain death upon enemies from a distance. Essential for softening enemy formations before infantry engagement.',
        pros: ['Attack from safety', 'Weaken enemies before melee', 'Effective against light troops'],
        cons: ['Vulnerable in close combat', 'Affected by weather', 'Limited ammunition'],
        history: 'Rome initially lacked strong archery traditions, relying on auxiliary units from Crete, Syria, and Numidia. The sagittarii became essential for eastern campaigns against Parthian horse archers. Their composite bows could pierce armor at 150 meters.'
    },
    {
        id: 'legionaries',
        name: 'Legionaries',
        cost: { denarii: 140, food: 8 },
        troopsMin: 14,
        troopsMax: 16,
        role: 'Heavy infantry',
        description: 'The backbone of Roman military might. Professional soldiers equipped with pilum, gladius, and the iconic rectangular scutum shield.',
        pros: ['Excellent discipline', 'Superior equipment', 'Versatile tactics'],
        cons: ['Expensive to maintain', 'Slow on the march', 'Requires extensive training'],
        history: 'The Roman legionary was the most effective soldier of the ancient world. After the Marian reforms (107 BC), legions became professional standing armies. Each legionary carried 30kg of equipment and could march 30km daily. Their discipline and engineering skills built an empire.'
    },
    {
        id: 'cavalry',
        name: 'Cavalry',
        cost: { denarii: 250, food: 12 },
        troopsMin: 23,
        troopsMax: 27,
        role: 'Elite shock troops',
        description: 'Mounted warriors capable of devastating charges and rapid flanking maneuvers. The hammer to the infantry\'s anvil.',
        pros: ['High mobility', 'Devastating charges', 'Excellent for pursuit'],
        cons: ['Very expensive', 'Horses need care', 'Vulnerable to pikes'],
        history: 'Roman cavalry (equites) originally came from the wealthy patrician class who could afford horses. Later, Rome relied heavily on allied Gallic, Numidian, and Germanic cavalry. The cataphractii—heavily armored cavalry—became essential against eastern empires.'
    },
    {
        id: 'praetorians',
        name: 'Praetorian Guard',
        cost: { denarii: 400, food: 15 },
        troopsMin: 40,
        troopsMax: 45,
        role: 'The finest',
        description: 'Elite imperial bodyguards, the finest soldiers in the empire. Handpicked veterans with the best equipment and triple pay.',
        pros: ['Supreme combat ability', 'Unshakeable morale', 'Inspires nearby troops'],
        cons: ['Extremely expensive', 'Politically dangerous', 'Limited numbers'],
        history: 'Created by Augustus in 27 BC, the Praetorian Guard served as the emperor\'s personal bodyguard. Stationed in Rome, they received triple legionary pay and served only 16 years. Their political power grew dangerous—they assassinated several emperors and once auctioned off the throne.'
    },
];

// === ROMAN GODS ===
export const ROMAN_GODS: Record<GodName, God> = {
    jupiter: {
        id: 'jupiter',
        name: 'Jupiter',
        domain: 'King of Gods',
        patronBonus: 'Military victories grant Favor and Piety',
        blessings: [
            { tier: 25, name: 'Lightning Bolt', effect: '+10% Battle Strength' },
            { tier: 50, name: 'Eagle Standard', effect: '+15% Morale' },
            { tier: 75, name: 'Divine Authority', effect: '+20% Territory Stability' },
            { tier: 100, name: 'Apotheosis', effect: 'Double all God bonuses' },
        ],
    },
    mars: {
        id: 'mars',
        name: 'Mars',
        domain: 'War',
        patronBonus: 'Troop recruitment costs reduced by 20%',
        blessings: [
            { tier: 25, name: 'Battle Fury', effect: '+15% Attack Power' },
            { tier: 50, name: 'Iron Will', effect: 'Troops never flee' },
            { tier: 75, name: 'War Machine', effect: '+25% Troop Production' },
            { tier: 100, name: 'God of War', effect: 'Guaranteed critical hits in battle' },
        ],
    },
    venus: {
        id: 'venus',
        name: 'Venus',
        domain: 'Love & Beauty',
        patronBonus: 'Happiness +15%, Population growth +20%',
        blessings: [
            { tier: 25, name: 'Charm', effect: '+10% Diplomacy Success' },
            { tier: 50, name: 'Fertility', effect: '+25% Population Growth' },
            { tier: 75, name: 'Adoration', effect: '+20% Happiness Cap' },
            { tier: 100, name: 'Divine Beauty', effect: 'All relations start at Friendly' },
        ],
    },
    ceres: {
        id: 'ceres',
        name: 'Ceres',
        domain: 'Agriculture',
        patronBonus: 'Food production +30%, No winter penalties',
        blessings: [
            { tier: 25, name: 'Bountiful Harvest', effect: '+15% Grain Production' },
            { tier: 50, name: 'Fertile Lands', effect: '+20% All Farm Output' },
            { tier: 75, name: 'Cornucopia', effect: 'Food never spoils' },
            { tier: 100, name: 'Eternal Harvest', effect: 'Double food production' },
        ],
    },
    mercury: {
        id: 'mercury',
        name: 'Mercury',
        domain: 'Commerce',
        patronBonus: 'Trade prices +15%, Tariffs -25%',
        blessings: [
            { tier: 25, name: 'Silver Tongue', effect: '+10% Trade Prices' },
            { tier: 50, name: 'Swift Routes', effect: '-30% Trade Risk' },
            { tier: 75, name: 'Golden Touch', effect: '+25% All Income' },
            { tier: 100, name: 'Merchant King', effect: 'No tariffs anywhere' },
        ],
    },
    minerva: {
        id: 'minerva',
        name: 'Minerva',
        domain: 'Wisdom',
        patronBonus: 'Technology costs -25%, Research speed +20%',
        blessings: [
            { tier: 25, name: 'Insight', effect: '+15% Tech Effectiveness' },
            { tier: 50, name: 'Innovation', effect: 'Unlock bonus technologies' },
            { tier: 75, name: 'Strategic Mind', effect: '+30% Battle Planning' },
            { tier: 100, name: 'Omniscience', effect: 'See all outcomes before decisions' },
        ],
    },
};

// === SEASON MODIFIERS (Strengthened for balance) ===
export const SEASON_MODIFIERS: Record<Season, SeasonModifiers> = {
    spring: {
        farmProduction: 1.10,
        fisheryProduction: 1.0,
        foodConsumption: 1.0,
        happiness: 1.05,
        morale: 1.0,
        upkeep: 1.0,
        tradePrices: 1.0,
    },
    summer: {
        farmProduction: 1.15,      // Buffed from 1.0 → +15%
        fisheryProduction: 1.20,   // Buffed from 1.10 → +20%
        foodConsumption: 0.90,     // Buffed from 0.95 → -10%
        happiness: 1.15,           // Buffed from 1.10 → +15%
        morale: 1.10,              // Buffed from 1.05 → +10%
        upkeep: 0.95,              // New: -5% upkeep
        tradePrices: 1.05,         // New: +5% prices
    },
    autumn: {
        farmProduction: 1.0,
        fisheryProduction: 1.0,
        foodConsumption: 1.0,
        happiness: 1.0,
        morale: 1.0,
        upkeep: 1.0,
        tradePrices: 1.10,         // Buffed from 1.05 → +10%
    },
    winter: {
        farmProduction: 0.75,      // Nerfed from 0.90 → -25%
        fisheryProduction: 0.80,   // Nerfed from 0.90 → -20%
        foodConsumption: 1.15,     // New: +15% consumption
        happiness: 0.90,           // Nerfed from 0.95 → -10%
        morale: 0.85,              // Nerfed from 0.90 → -15%
        upkeep: 1.25,              // Nerfed from 1.15 → +25%
        tradePrices: 0.95,         // New: -5% prices
    },
};

// === TERRITORY LEVELS ===
// Re-exported from territory.ts with comprehensive structure

// === RESOURCE BASE PRICES ===
export const BASE_PRICES: Record<ResourceType, number> = {
    grain: 8,
    iron: 25,
    timber: 12,
    stone: 15,
    clay: 10,
    wool: 18,
    salt: 20,
    livestock: 30,
    wine: 35,
    olive_oil: 40,
    spices: 60,
};

// === RESOURCE DISPLAY INFO ===
export const RESOURCE_INFO: Record<ResourceType, { name: string; emoji: string; category: 'basic' | 'luxury' | 'strategic' }> = {
    grain: { name: 'Grain', emoji: '🌾', category: 'basic' },
    iron: { name: 'Iron', emoji: '⚔️', category: 'strategic' },
    timber: { name: 'Timber', emoji: '🪵', category: 'basic' },
    stone: { name: 'Stone', emoji: '🪨', category: 'basic' },
    clay: { name: 'Clay', emoji: '🏺', category: 'basic' },
    wool: { name: 'Wool', emoji: '🐑', category: 'basic' },
    salt: { name: 'Salt', emoji: '🧂', category: 'strategic' },
    livestock: { name: 'Livestock', emoji: '🐄', category: 'basic' },
    wine: { name: 'Wine', emoji: '🍷', category: 'luxury' },
    olive_oil: { name: 'Olive Oil', emoji: '🫒', category: 'luxury' },
    spices: { name: 'Spices', emoji: '🌶️', category: 'luxury' },
};

// === GAME BALANCE CONSTANTS ===
export const GAME_CONSTANTS = {
    // Population
    FOOD_PER_POP: 0.42,
    FOOD_PER_TROOP: 0.55,
    TAX_PER_POP: 7,                           // Reduced from 10 → 7

    // Tax Efficiency (diminishing returns at high population)
    TAX_EFFICIENCY_THRESHOLD: 150,            // Pop above which efficiency drops
    TAX_EFFICIENCY_DECAY: 0.002,              // 0.2% efficiency loss per pop above threshold

    // Upkeep
    TROOP_UPKEEP: 2,
    HOUSING_UPKEEP_DIVISOR: 15,
    FORT_UPKEEP: 4,
    SANITATION_UPKEEP_DIVISOR: 8,
    UPKEEP_SCALING_THRESHOLD: 5000,           // Denarii threshold for upkeep scaling
    UPKEEP_SCALING_RATE: 0.0001,              // 0.01% per denarii above threshold

    // Trade Balance
    TRADE_RISK_MIN: 0.01,                     // 1% min risk (was 5%)
    TRADE_RISK_MAX: 0.25,                     // 25% max risk (was 50%)
    TRADE_PRICE_BONUS: 1.25,                  // +25% to make trade competitive

    // Happiness Impact
    HAPPINESS_PENALTY_THRESHOLD: 50,          // Below this, production suffers
    HAPPINESS_PRODUCTION_PENALTY: 0.01,       // 1% per point below 50
    HAPPINESS_STABILITY_PENALTY: 0.5,         // 0.5 stability loss per point below 50

    // Starvation Consequences
    STARVATION_POP_LOSS: 0.15,                // 15% pop loss on starvation
    STARVATION_MORALE_LOSS: 15,               // -15 morale on starvation

    // Grace Period (early game) - extended and smoothed to prevent consumption cliff
    GRACE_MULTIPLIERS: [
        { maxRound: 8, multiplier: 0.5 },   // Rounds 1-8: 50% consumption
        { maxRound: 14, multiplier: 0.65 }, // Rounds 9-14: 65% consumption
        { maxRound: 18, multiplier: 0.75 }, // Rounds 15-18: 75% consumption
        { maxRound: 22, multiplier: 0.85 }, // Rounds 19-22: 85% consumption
        { maxRound: 26, multiplier: 0.92 }, // Rounds 23-26: 92% consumption
        { maxRound: Infinity, multiplier: 1.0 }, // Round 27+: Full consumption
    ],

    // Infinite Mode (Progressive scaling)
    INFINITE_UPKEEP_MULTIPLIER: 1.4,
    INFINITE_VOLATILITY_MULTIPLIER: 2.5,
    INFINITE_TERRITORY_INTERVAL: 7,
    INFINITE_BUILDING_INTERVAL: 10,
    INFINITE_TECH_INTERVAL: 15,
    INFINITE_CITY_INTERVAL: 20,
    INFINITE_ENEMY_SCALE_BASE: 1.03,          // 3% exponential scaling per round past 25
    INFINITE_UPKEEP_SCALE: 0.01,              // +1% upkeep per round past 25
    INFINITE_FOOD_CONSUMPTION_SCALE: 0.005,   // +0.5% food consumption per round past 25

    // Victory Conditions
    VICTORY_ETERNAL_CITY: { territories: 10, population: 500, happiness: 75 },
    VICTORY_COMMERCE: { denarii: 15000, reputation: 35 },
    VICTORY_CONQUEROR: { territories: 8, troops: 180 },
    VICTORY_GLORY: { population: 350, happiness: 90 },  // Lowered from 600 for achievability
    VICTORY_INDUSTRIAL: { buildings: 15, denarii: 10000 },

    // Failure Conditions
    FAILURE_STARVATION_LIMIT: 3,              // 3 consecutive starvations = game over
    FAILURE_MIN_POPULATION: 30,               // Lowered to 30 for easier early game
    FAILURE_MIN_HAPPINESS: 25,                // Below 25% = unrest failure

    // Market
    DEMAND_MIN: 50,
    DEMAND_MAX: 200,
    DEMAND_BASE: 100,

    // Combat
    BASE_ENEMY_STRENGTH: 30,
    ENEMY_ROUND_SCALING: 2,
    ENEMY_TERRITORY_SCALING: 3,
    LARGE_ARMY_THRESHOLD: 500,
    MAX_TECH_MULTIPLIER: 1.5,                 // Cap tech combat multipliers at 50%
};

// === STARTING VALUES ===
export const STARTING_STATE = {
    denarii: 5000,
    population: 100,
    happiness: 70,
    troops: 25,
    morale: 80,
    housing: 150,
    sanitation: 50,
    forts: 1,
    supplies: 150,
    piety: 0,
    taxRate: 0.10,
    inflation: 0,
    reputation: 10,
};

// === EMERGENCY ACTIONS ===
export interface EmergencyAction {
    id: string;
    name: string;
    icon: string;
    description: string;
    cost: { [key: string]: number };
    effect: { [key: string]: number };
    cooldown: number;
}

export const EMERGENCY_ACTIONS: EmergencyAction[] = [
    {
        id: 'emergency_tax',
        name: 'Emergency Taxation',
        icon: '💰',
        description: 'Levy emergency taxes on all citizens',
        cost: { happiness: 15 },
        effect: { denarii: 500 },
        cooldown: 8,
    },
    {
        id: 'conscription',
        name: 'Conscription',
        icon: '⚔️',
        description: 'Force citizens into military service',
        cost: { happiness: 20, population: 10 },
        effect: { troops: 30 },
        cooldown: 10,
    },
    {
        id: 'divine_intervention',
        name: 'Divine Intervention',
        icon: '✨',
        description: 'Call upon the gods for aid',
        cost: { piety: 50 },
        effect: { happiness: 25, morale: 20 },
        cooldown: 12,
    },
    {
        id: 'grain_requisition',
        name: 'Grain Requisition',
        icon: '🌾',
        description: 'Requisition grain from wealthy estates',
        cost: { reputation: 10 },
        effect: { grain: 50 },
        cooldown: 6,
    },
    {
        id: 'mercenary_hire',
        name: 'Hire Mercenaries',
        icon: '🗡️',
        description: 'Hire foreign mercenaries for quick reinforcement',
        cost: { denarii: 300 },
        effect: { troops: 20 },
        cooldown: 4,
    },
];

// === CRAFTING RECIPES ===
export interface CraftingRecipe {
    id: string;
    name: string;
    icon: string;
    description: string;
    inputs: { resource: ResourceType; amount: number }[];
    effect: { type: string; value: number; duration?: number };
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
    {
        id: 'forge_weapons',
        name: 'Forge Weapons',
        icon: '⚔️',
        description: 'Forge superior weapons for your troops',
        inputs: [
            { resource: 'iron', amount: 10 },
            { resource: 'timber', amount: 5 },
        ],
        effect: { type: 'attackBonus', value: 0.1, duration: 5 },
    },
    {
        id: 'host_feast',
        name: 'Host Feast',
        icon: '🍖',
        description: 'Host a grand feast for the citizens',
        inputs: [
            { resource: 'grain', amount: 20 },
            { resource: 'livestock', amount: 5 },
        ],
        effect: { type: 'happiness', value: 20 },
    },
    {
        id: 'build_monument',
        name: 'Build Monument',
        icon: '🗿',
        description: 'Erect a monument to Roman glory',
        inputs: [
            { resource: 'stone', amount: 30 },
            { resource: 'clay', amount: 15 },
        ],
        effect: { type: 'reputation', value: 15 },
    },
    {
        id: 'supply_cache',
        name: 'Supply Cache',
        icon: '📦',
        description: 'Stockpile military supplies',
        inputs: [
            { resource: 'grain', amount: 15 },
            { resource: 'salt', amount: 10 },
        ],
        effect: { type: 'supplies', value: 30 },
    },
];

// === GOVERNORS ===
export interface GovernorData {
    id: string;
    name: string;
    trait: string;
    bonus: { [key: string]: number };
    malus: { [key: string]: number };
    cost: number;
}

export const GOVERNORS: GovernorData[] = [
    {
        id: 'merchant',
        name: 'Marcus the Merchant',
        trait: 'merchant',
        bonus: { income: 0.2 },
        malus: { defense: -0.1 },
        cost: 200,
    },
    {
        id: 'general',
        name: 'Titus the General',
        trait: 'general',
        bonus: { defense: 0.25, morale: 0.15 },
        malus: { income: -0.1 },
        cost: 250,
    },
    {
        id: 'scholar',
        name: 'Lucius the Scholar',
        trait: 'scholar',
        bonus: { techDiscount: 0.2 },
        malus: { defense: -0.15 },
        cost: 200,
    },
    {
        id: 'administrator',
        name: 'Gaius the Administrator',
        trait: 'administrator',
        bonus: { stability: 0.2, income: 0.1 },
        malus: { happiness: -0.05 },
        cost: 200,
    },
    {
        id: 'priest',
        name: 'Servius the Priest',
        trait: 'priest',
        bonus: { piety: 0.3, happiness: 0.1 },
        malus: { income: -0.15 },
        cost: 200,
    },
];

// === TERRITORY FOCUS ===
export interface TerritoryFocusData {
    id: string;
    name: string;
    icon: string;
    bonus: { [key: string]: number };
    cost: number;
}

export const TERRITORY_FOCUS: Record<string, TerritoryFocusData> = {
    military_outpost: {
        id: 'military_outpost',
        name: 'Military Outpost',
        icon: '⚔️',
        bonus: { defense: 0.3, troopRecruit: 0.2 },
        cost: 300,
    },
    trade_hub: {
        id: 'trade_hub',
        name: 'Trade Hub',
        icon: '💰',
        bonus: { tradePrices: 0.15, tariffReduction: 0.2 },
        cost: 300,
    },
    breadbasket: {
        id: 'breadbasket',
        name: 'Breadbasket',
        icon: '🌾',
        bonus: { grainProduction: 0.5 },
        cost: 300,
    },
    mining_district: {
        id: 'mining_district',
        name: 'Mining District',
        icon: '⛏️',
        bonus: { ironProduction: 0.5, stoneProduction: 0.3 },
        cost: 300,
    },
};

// === RE-EXPORTS ===
export * from './religion';
export * from './territory';
