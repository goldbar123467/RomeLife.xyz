// ============================================
// ROME EMPIRE BUILDER - Core Math Functions
// ============================================

import type {
    Rarity, RarityData, Season, ResourceType, Territory, Building,
    SeasonModifiers, GameState, ProductionSummary
} from '../types';
import {
    RARITY_TABLE, SEASON_MODIFIERS, TERRITORY_LEVELS,
    BASE_PRICES, GAME_CONSTANTS, TERRITORY_FOCUS
} from '../constants';
import { calculateBlessingBonus } from '../constants/religion';
import { calculateBuildingEffects } from '../constants/territory';

// === RNG ===

let rngSeed = 1337;

/**
 * XorShift32 PRNG for deterministic random numbers
 */
export function xorshift32(): number {
    rngSeed ^= rngSeed << 13;
    rngSeed ^= rngSeed >>> 17;
    rngSeed ^= rngSeed << 5;
    return (rngSeed >>> 0) / 0xFFFFFFFF;
}

export function setSeed(seed: number): void {
    rngSeed = seed;
}

export function random(): number {
    return Math.random(); // Use native for non-seeded
}

export function randomInt(min: number, max: number): number {
    return Math.floor(random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
    return random() * (max - min) + min;
}

/**
 * Round a number to avoid floating point precision errors
 * Used for resource/inventory calculations
 */
export function roundResource(value: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

// === RARITY SYSTEM ===

/**
 * Roll for a rarity tier using weighted probability
 */
export function rollRarity(): RarityData {
    const roll = random();
    let cumulative = 0;

    for (const rarity of RARITY_TABLE) {
        cumulative += rarity.probability;
        if (roll <= cumulative) {
            return rarity;
        }
    }

    return RARITY_TABLE[0]; // Default to common
}

export function getRarityBonus(rarity: Rarity): number {
    const data = RARITY_TABLE.find(r => r.name === rarity);
    return data?.bonus ?? 1.0;
}

export function getRarityColor(rarity: Rarity): string {
    const colors: Record<Rarity, string> = {
        common: '#6b7280',
        uncommon: '#16a34a',
        rare: '#2563eb',
        epic: '#9333ea',
        legendary: '#ea580c',
        imperial: '#dc2626',
    };
    return colors[rarity];
}

// === GOD BLESSING SYSTEM ===

import type { GodName } from '../types';

/**
 * Get cumulative bonus from god blessings based on favor level
 * Each god grants different bonuses at tier 25/50/75
 * Returns multiplier (e.g., 0.15 for +15%)
 */
export function getGodBlessingBonus(
    patronGod: GodName | null,
    godFavor: Record<GodName, number>,
    bonusType: 'attack' | 'morale' | 'stability' | 'fertility' | 'diplomacy' | 'grain' | 'trade' | 'income'
): number {
    if (!patronGod) return 0;
    const favor = godFavor[patronGod];

    // Each god grants different bonuses at different tiers
    const blessingBonuses: Record<GodName, Record<string, number[]>> = {
        jupiter: { attack: [0.10, 0, 0], morale: [0, 0.15, 0], stability: [0, 0, 0.20] },
        mars: { attack: [0.15, 0, 0.25], morale: [0, 0, 0] },
        venus: { diplomacy: [0.10, 0, 0], fertility: [0, 0.25, 0] },
        ceres: { grain: [0.15, 0.20, 0] },
        mercury: { trade: [0.10, 0, 0], income: [0, 0, 0.25] },
        minerva: { attack: [0, 0, 0.30] }, // Strategic Mind bonus
    };

    const godBonuses = blessingBonuses[patronGod];
    if (!godBonuses || !godBonuses[bonusType]) return 0;

    const tiers = godBonuses[bonusType];
    let bonus = 0;
    if (favor >= 25) bonus += tiers[0] || 0;
    if (favor >= 50) bonus += tiers[1] || 0;
    if (favor >= 75) bonus += tiers[2] || 0;

    return bonus;
}

// === PRODUCTION MATH ===

/**
 * Calculate total production for a territory
 */
export function calculateTerritoryProduction(
    territory: Territory,
    buildings: Building[],
    season: Season,
    state: GameState
): Record<ResourceType, number> {
    const production: Partial<Record<ResourceType, number>> = {};
    const seasonMod = SEASON_MODIFIERS[season];
    const levelMod = TERRITORY_LEVELS[territory.level].productionMultiplier;
    const rarityMod = getRarityBonus(territory.rarity);

    // Base territory production
    for (const res of territory.resources) {
        let amount = res.baseAmount * levelMod * rarityMod;

        // Apply seasonal modifiers for farms
        if (res.type === 'grain' || res.type === 'livestock') {
            amount *= seasonMod.farmProduction;
        }

        // Ceres blessings: +20% grain at tier 25, +30% all food at tier 50
        if (res.type === 'grain') {
            const grainBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'grainProduction');
            const foodBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'foodProduction');
            amount *= (1 + grainBonus + foodBonus);
        } else if (res.type === 'livestock') {
            // Livestock also benefits from food production bonus
            const foodBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'foodProduction');
            amount *= (1 + foodBonus);
        }

        // Apply territory focus bonuses (breadbasket +50% grain, mining +50% iron +30% stone)
        if (territory.focus && territory.focus !== 'none') {
            const focusData = TERRITORY_FOCUS[territory.focus];
            if (focusData) {
                if (res.type === 'grain' && focusData.bonus.grainProduction) {
                    amount *= (1 + focusData.bonus.grainProduction);
                }
                if (res.type === 'iron' && focusData.bonus.ironProduction) {
                    amount *= (1 + focusData.bonus.ironProduction);
                }
                if (res.type === 'stone' && focusData.bonus.stoneProduction) {
                    amount *= (1 + focusData.bonus.stoneProduction);
                }
            }
        }

        // Note: Governor bonuses (income, defense, etc.) are applied in their specific calculations
        // (calculateIncome, battle defense, season processing) not in raw production

        production[res.type] = (production[res.type] || 0) + amount;
    }

    // Apply building multipliers
    const territoryBuildings = buildings.filter(b => b.territoryId === territory.id && b.built);
    for (const building of territoryBuildings) {
        for (const effect of building.effects) {
            if (effect.type === 'production' && effect.resource && effect.multiplier) {
                const current = production[effect.resource] || 0;
                production[effect.resource] = current * effect.value;
            } else if (effect.type === 'production' && effect.resource) {
                production[effect.resource] = (production[effect.resource] || 0) + effect.value;
            }
        }
    }

    return production as Record<ResourceType, number>;
}

/**
 * Calculate total production summary for the entire empire
 */
export function calculateProductionSummary(state: GameState): ProductionSummary {
    const resources: Partial<Record<ResourceType, number>> = {};
    const season = state.season;
    const seasonMod = SEASON_MODIFIERS[season];

    // Sum production from all owned territories
    for (const territory of state.territories.filter(t => t.owned)) {
        const territoryProd = calculateTerritoryProduction(territory, state.buildings, season, state);
        for (const [type, amount] of Object.entries(territoryProd)) {
            resources[type as ResourceType] = (resources[type as ResourceType] || 0) + amount;
        }
    }

    // Calculate income
    const income = calculateIncome(state);

    // Calculate upkeep
    const upkeep = calculateUpkeep(state, seasonMod);

    // Calculate food consumption
    const foodConsumption = calculateFoodConsumption(state, seasonMod);

    return {
        resources: resources as Record<ResourceType, number>,
        income,
        upkeep,
        foodConsumption,
        netIncome: income - upkeep,
    };
}

// === ECONOMY MATH ===

/**
 * Calculate taxation income
 * Formula: (population × taxRate × 10) + territoryPopulations
 * With logistic efficiency curve for high tax rates
 */
export function calculateIncome(state: GameState): number {
    const { population, taxRate, territories, inflation } = state;

    // Base population tax
    let baseTax = population * taxRate * GAME_CONSTANTS.TAX_PER_POP;

    // Diminishing returns above 20% tax rate (logistic curve)
    if (taxRate > 0.20) {
        const excess = taxRate - 0.20;
        const efficiency = 1 / (1 + excess * 5); // Steep dropoff
        baseTax *= efficiency;
    }

    // Tax efficiency decay at high population (administrative overhead)
    if (population > GAME_CONSTANTS.TAX_EFFICIENCY_THRESHOLD) {
        const excess = population - GAME_CONSTANTS.TAX_EFFICIENCY_THRESHOLD;
        const efficiency = Math.max(0.5, 1 - (excess * GAME_CONSTANTS.TAX_EFFICIENCY_DECAY));
        baseTax *= efficiency;
    }

    // Territory income with building bonuses (Roads +10%, Forum +15%) and governor bonuses
    let territoryIncome = 0;
    let territoryBuildingIncomeMultiplier = 1.0;
    let territoryBuildingTaxBonus = 0;
    let governorIncomeMultiplier = 1.0;

    for (const territory of territories.filter(t => t.owned)) {
        // Base territory income from population
        territoryIncome += territory.population * 0.5;

        // Apply territory building income bonuses
        const buildingEffects = calculateBuildingEffects(territory.buildings);
        if (buildingEffects.income) {
            territoryBuildingIncomeMultiplier += buildingEffects.income;
        }
        if (buildingEffects.taxBonus) {
            territoryBuildingTaxBonus += buildingEffects.taxBonus;
        }

        // Apply governor income bonuses/maluses (Marcus +20%, Gaius +10%, Servius -15%)
        if (territory.governor) {
            if (territory.governor.bonus.income) governorIncomeMultiplier += territory.governor.bonus.income;
            if (territory.governor.malus.income) governorIncomeMultiplier += territory.governor.malus.income; // negative value
        }
    }

    // Apply Census Office tax bonus to base tax
    baseTax *= (1 + territoryBuildingTaxBonus);

    // Building income effects (Marketplace +50, Banking House +200, etc.)
    const buildingIncome = state.buildings
        .filter(b => b.built)
        .reduce((sum, b) => {
            const incomeEffect = b.effects.find(e => e.type === 'income');
            return sum + (incomeEffect?.value || 0);
        }, 0);

    // Territory stability modifier
    const avgStability = territories.filter(t => t.owned).length > 0
        ? territories.filter(t => t.owned).reduce((sum, t) => sum + t.stability, 0) / territories.filter(t => t.owned).length
        : 100;
    const stabilityMod = avgStability / 100;

    // Inflation penalty
    const inflationMod = 1 - (inflation * 0.01);

    // God blessing income bonus (Mercury Tier 75: +25% income)
    const godIncomeBonus = getGodBlessingBonus(state.patronGod, state.godFavor, 'income');
    const totalIncomeMod = (1 + godIncomeBonus) * territoryBuildingIncomeMultiplier * governorIncomeMultiplier;

    return Math.floor((baseTax + territoryIncome + buildingIncome) * stabilityMod * inflationMod * totalIncomeMod);
}

/**
 * Calculate total upkeep costs
 * Formula: Σ(building upkeep) + (troops × 2) + (housing ÷ 15) + (forts × 4) + (sanitation ÷ 8)
 */
export function calculateUpkeep(state: GameState, seasonMod?: SeasonModifiers): number {
    const { troops, housing, forts, sanitation, buildings, infiniteMode } = state;
    seasonMod = seasonMod || SEASON_MODIFIERS[state.season];

    // Building upkeep
    const buildingUpkeep = buildings
        .filter(b => b.built)
        .reduce((sum, b) => sum + b.upkeep, 0);

    // Military upkeep
    const troopUpkeep = troops * GAME_CONSTANTS.TROOP_UPKEEP;

    // Infrastructure upkeep
    const housingUpkeep = housing / GAME_CONSTANTS.HOUSING_UPKEEP_DIVISOR;
    const fortUpkeep = forts * GAME_CONSTANTS.FORT_UPKEEP;
    const sanitationUpkeep = sanitation / GAME_CONSTANTS.SANITATION_UPKEEP_DIVISOR;

    let total = buildingUpkeep + troopUpkeep + housingUpkeep + fortUpkeep + sanitationUpkeep;

    // Seasonal modifier
    total *= seasonMod.upkeep;

    // Technology upkeep reduction (e.g., Accounting -10%)
    const upkeepTechMod = state.technologies
        .filter(t => t.researched)
        .reduce((sum, t) => {
            const upkeepEffect = t.effects.find(e => e.type === 'upkeep');
            return sum + (upkeepEffect?.value || 0);
        }, 0);
    total *= (1 + upkeepTechMod); // upkeepTechMod is negative like -0.1

    // Infinite mode penalty
    if (infiniteMode) {
        total *= GAME_CONSTANTS.INFINITE_UPKEEP_MULTIPLIER;
    }

    return Math.floor(total);
}

/**
 * Calculate food consumption per season
 * Formula: (Population × 0.42 + Troops × 0.55) × Seasonal × Grace × CeresBlessing
 */
export function calculateFoodConsumption(state: GameState, seasonMod?: SeasonModifiers): number {
    const { population, troops, round } = state;
    seasonMod = seasonMod || SEASON_MODIFIERS[state.season];

    // Base consumption
    let consumption = (population * GAME_CONSTANTS.FOOD_PER_POP) + (troops * GAME_CONSTANTS.FOOD_PER_TROOP);

    // Seasonal modifier
    consumption *= seasonMod.foodConsumption;

    // Grace period (early game)
    const graceConfig = GAME_CONSTANTS.GRACE_MULTIPLIERS.find(g => round <= g.maxRound);
    if (graceConfig) {
        consumption *= graceConfig.multiplier;
    }

    // Ceres blessing: -25% food consumption at tier 75
    const ceresFoodBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'foodConsumption');
    if (ceresFoodBonus !== 0) {
        consumption *= (1 + ceresFoodBonus); // ceresFoodBonus is negative (-0.25)
    }

    return Math.floor(consumption);
}

// === MARKET MATH ===

/**
 * Update market prices based on supply and demand
 */
export function calculateMarketPrices(
    inventory: Record<ResourceType, number>,
    capacity: Record<ResourceType, number>,
    currentDemand: Record<ResourceType, number>,
    season: Season,
    infiniteMode: boolean
): { prices: Record<ResourceType, number>; demand: Record<ResourceType, number> } {
    const prices: Partial<Record<ResourceType, number>> = {};
    const demand: Partial<Record<ResourceType, number>> = {};

    for (const [resource, basePrice] of Object.entries(BASE_PRICES) as [ResourceType, number][]) {
        const inv = inventory[resource] || 0;
        const cap = capacity[resource] || 100;
        const ratio = inv / cap;

        // Get current demand or default
        let demandIndex = currentDemand[resource] || GAME_CONSTANTS.DEMAND_BASE;

        // Supply impact on demand
        if (ratio > 0.7) {
            // Oversupply: demand drops
            demandIndex -= randomInt(5, 15);
        } else if (ratio < 0.3) {
            // Scarcity: demand rises
            demandIndex += randomInt(5, 15);
        }

        // Random fluctuation
        demandIndex += randomInt(-4, 4);

        // Seasonal effects
        if (season === 'winter' && (resource === 'grain' || resource === 'livestock')) {
            demandIndex += 15;
        }
        if (season === 'summer' && resource === 'wine') {
            demandIndex += 10;
        }

        // Infinite mode volatility
        if (infiniteMode) {
            demandIndex += randomInt(-10, 10) * GAME_CONSTANTS.INFINITE_VOLATILITY_MULTIPLIER;
        }

        // Clamp demand
        demandIndex = Math.max(GAME_CONSTANTS.DEMAND_MIN, Math.min(GAME_CONSTANTS.DEMAND_MAX, demandIndex));

        // Calculate final price
        prices[resource] = Math.floor(basePrice * (demandIndex / 100));
        demand[resource] = demandIndex;
    }

    return {
        prices: prices as Record<ResourceType, number>,
        demand: demand as Record<ResourceType, number>,
    };
}

// === MILITARY MATH ===

/**
 * Calculate battle odds
 * Odds = OurStrength / (OurStrength + EnemyStrength)
 */
export function calculateBattleOdds(
    troops: number,
    morale: number,
    supplies: number,
    attackBonus: number,
    techMultipliers: number[],
    enemyStrength: number
): { playerStrength: number; enemyStrength: number; odds: number } {
    // Base player strength
    let playerStrength = troops * (morale / 100);

    // Supply bonus (>100 supplies gives +% strength)
    if (supplies > 100) {
        playerStrength *= 1 + ((supplies - 100) / 500);
    }

    // Attack bonus from founder/tech
    playerStrength *= 1 + attackBonus;

    // Tech multipliers (Legion x1.2, Forge x1.1, etc.)
    // Cap total tech multiplier to prevent snowballing
    const totalTechMult = techMultipliers.reduce((a, b) => a * b, 1);
    const cappedTechMult = Math.min(GAME_CONSTANTS.MAX_TECH_MULTIPLIER, totalTechMult);
    playerStrength *= cappedTechMult;

    // Weather variance
    playerStrength *= randomFloat(0.9, 1.1);

    const odds = playerStrength / (playerStrength + enemyStrength);

    return {
        playerStrength: Math.floor(playerStrength),
        enemyStrength: Math.floor(enemyStrength),
        odds: Math.round(odds * 100) / 100,
    };
}

/**
 * Calculate enemy strength for a territory
 * Base: 30 + (Round × 2) + (Territories × 3)
 */
export function calculateEnemyStrength(
    round: number,
    ownedTerritories: number,
    playerTroops: number,
    infiniteMode: boolean,
    territoryDifficulty: number = 0
): number {
    let strength = GAME_CONSTANTS.BASE_ENEMY_STRENGTH;

    // Round scaling
    strength += round * GAME_CONSTANTS.ENEMY_ROUND_SCALING;

    // Territory scaling
    strength += ownedTerritories * GAME_CONSTANTS.ENEMY_TERRITORY_SCALING;

    // Adaptive scaling for large armies
    if (playerTroops > GAME_CONSTANTS.LARGE_ARMY_THRESHOLD) {
        strength *= 1 + ((playerTroops - GAME_CONSTANTS.LARGE_ARMY_THRESHOLD) / 1000);
    }

    // Territory-specific difficulty
    strength += territoryDifficulty;

    // Infinite mode: exponential scaling past round 25
    if (infiniteMode) {
        strength *= 1.3; // Base infinite mode multiplier
        // Exponential scaling: 3% per round past 25
        const roundsPastBase = Math.max(0, round - 25);
        if (roundsPastBase > 0) {
            const exponentialScale = Math.pow(GAME_CONSTANTS.INFINITE_ENEMY_SCALE_BASE, roundsPastBase);
            strength *= exponentialScale;
        }
    }

    return Math.floor(strength);
}

/**
 * Resolve a battle and return casualties
 */
export function resolveBattle(
    playerStrength: number,
    enemyStrength: number,
    odds: number
): { victory: boolean; playerCasualties: number; enemyCasualties: number } {
    const roll = random();
    const victory = roll < odds;

    // Casualty calculation
    const battleIntensity = randomFloat(0.1, 0.3);

    if (victory) {
        // Victory: lower casualties, enemy routed
        const playerCasualties = Math.floor(playerStrength * battleIntensity * (1 - odds));
        const enemyCasualties = Math.floor(enemyStrength * (0.6 + battleIntensity));
        return { victory: true, playerCasualties, enemyCasualties };
    } else {
        // Defeat: higher casualties
        const playerCasualties = Math.floor(playerStrength * (0.3 + battleIntensity * 2));
        const enemyCasualties = Math.floor(enemyStrength * battleIntensity);
        return { victory: false, playerCasualties, enemyCasualties };
    }
}

// === STABILITY & EVENTS ===

/**
 * Calculate territory stability change per turn
 */
export function calculateStabilityChange(
    territory: Territory,
    buildings: Building[],
    state: GameState
): number {
    const godStabilityBonus = getGodBlessingBonus(state.patronGod, state.godFavor, 'stability');
    let change = 0;

    // Stability bonus from god blessing (+20%)
    if (godStabilityBonus > 0) {
        change += Math.floor(territory.stability * godStabilityBonus);
    }

    // Garrison effect
    if (territory.garrison > 20) {
        change += 1;
    } else {
        change -= 2;
    }

    // Building bonuses
    const territoryBuildings = buildings.filter(b => b.territoryId === territory.id && b.built);
    for (const building of territoryBuildings) {
        for (const effect of building.effects) {
            if (effect.type === 'happiness') {
                change += effect.value * 0.1; // Stability from happiness buildings
            }
        }
    }

    return change;
}

/**
 * Check for random territory events
 */
export function rollTerritoryEvent(territory: Territory): { type: string; effect: Record<string, number> } | null {
    const roll = random();

    // Rebellion: 5% if stability < 30 (range: 0 to 0.05)
    if (territory.stability < 30 && roll < 0.05) {
        return {
            type: 'rebellion',
            effect: { stability: -10, garrison: -Math.floor(territory.garrison * 0.3) },
        };
    }

    // Prosperity: 8% if stability > 70 (exclusive range: 0.05 to 0.13)
    if (territory.stability > 70 && roll >= 0.05 && roll < 0.13) {
        return {
            type: 'prosperity',
            effect: { income: 100, happiness: 10 },
        };
    }

    // Bandit Raid: 7% if garrison < 20 (exclusive range: 0.13 to 0.20)
    if (territory.garrison < 20 && roll >= 0.13 && roll < 0.20) {
        return {
            type: 'bandit_raid',
            effect: { gold: -50, stability: -8 },
        };
    }

    return null;
}

// === PROCEDURAL GENERATION (Infinite Mode) ===

const LATIN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'];

const LATIN_PREFIXES = ['Nova', 'Magna', 'Alta', 'Vetus', 'Parva', 'Sancta', 'Regia', 'Prima'];
const LATIN_SUFFIXES = ['Urbis', 'Terra', 'Mons', 'Silva', 'Vallis', 'Flumen', 'Campus', 'Collis'];

export function generateLatinName(index: number): string {
    const prefix = LATIN_PREFIXES[index % LATIN_PREFIXES.length];
    const suffix = LATIN_SUFFIXES[Math.floor(index / LATIN_PREFIXES.length) % LATIN_SUFFIXES.length];
    const numeral = LATIN_NUMERALS[Math.min(index, LATIN_NUMERALS.length - 1)];
    return `${prefix} ${suffix} ${numeral}`;
}

export function generateProceduralTerritory(
    index: number,
    ownedTerritories: number,
    round: number
): Omit<Territory, 'id'> {
    const rarity = rollRarity();
    const difficulty = 40 + (8 * ownedTerritories) + Math.floor(round * 0.5);

    const resourceTypes: ResourceType[] = ['grain', 'iron', 'timber', 'stone', 'clay', 'wool', 'salt', 'livestock'];
    const numResources = randomInt(2, 5);
    const resources: Territory['resources'] = [];

    const shuffled = [...resourceTypes].sort(() => random() - 0.5);
    for (let i = 0; i < numResources; i++) {
        resources.push({
            type: shuffled[i],
            baseAmount: randomInt(1, 4),
        });
    }

    return {
        name: generateLatinName(index),
        latinName: generateLatinName(index),
        owned: false,
        rarity: rarity.name,
        level: 1,
        stability: 50,
        focus: 'none',
        governor: null,
        resources,
        buildings: [],
        population: randomInt(20, 80),
        garrison: 0,
        requirements: [{ type: 'troops', value: Math.floor(difficulty * 1.5) }],
        difficulty,
    };
}

// === POPULATION GROWTH ===

/**
 * Calculate population growth per season
 * Growth is limited by housing and affected by happiness
 */
export function calculatePopulationGrowth(state: GameState): number {
    const { population, housing, happiness, sanitation } = state;

    // Base growth rate: 2% per season
    let growthRate = 0.02;

    // Venus blessing (Fertility Tier 50: +25% growth)
    const fertilityBonus = getGodBlessingBonus(state.patronGod, state.godFavor, 'fertility');
    growthRate *= (1 + fertilityBonus);

    // Happiness modifier: 50% = 1x, 100% = 1.5x, 0% = 0.5x
    growthRate *= 0.5 + (happiness / 100);

    // Sanitation modifier: poor sanitation = disease/death
    if (sanitation < 30) {
        growthRate *= 0.5; // Halved growth
        if (sanitation < 15) {
            growthRate = -0.01; // Population decline
        }
    }

    // Housing cap: can't grow beyond housing capacity
    const housingRemaining = housing - population;
    if (housingRemaining <= 0) {
        return 0; // No room to grow
    }

    // Calculate raw growth
    let growth = Math.floor(population * growthRate);

    // Cap growth to available housing
    growth = Math.min(growth, housingRemaining);

    return growth;
}

// === DIPLOMACY MATH ===

/**
 * Calculate chance of successful envoy mission
 * Base: 50% + (reputation / 2) + (currentRelation / 4)
 */
export function calculateEnvoySuccess(reputation: number, currentRelation: number): number {
    const baseChance = 0.5;
    const reputationBonus = reputation / 200; // Max +50% at 100 rep
    const relationBonus = currentRelation / 400; // Max +25% at 100 relation

    return Math.min(0.95, baseChance + reputationBonus + relationBonus);
}

/**
 * Calculate diplomatic relation decay per round
 * Relations drift toward neutral (50) over time
 */
export function calculateRelationDecay(currentRelation: number): number {
    const neutral = 50;
    const decayRate = 0.05; // 5% drift toward neutral

    if (currentRelation > neutral) {
        return -Math.ceil((currentRelation - neutral) * decayRate);
    } else if (currentRelation < neutral) {
        return Math.ceil((neutral - currentRelation) * decayRate);
    }

    return 0;
}

/**
 * Calculate relation change from envoy
 */
export function calculateEnvoyEffect(success: boolean, reputation: number): number {
    if (success) {
        return 8 + Math.floor(reputation / 20); // 8-13 based on reputation
    } else {
        return -5; // Failed envoy slightly damages relations
    }
}

// === TRADE RISK CALCULATION ===

/**
 * Calculate trade risk for a caravan to a city
 * Risk = base distance risk - fort bonus - roads tech bonus - guard upgrades
 */
export function calculateTradeRisk(
    cityDistance: number,
    cityBaseRisk: number,
    forts: number,
    hasRoadsTech: boolean,
    reputation: number
): { risk: number; successChance: number; potentialLoss: number } {
    // Base risk from distance
    let risk = cityBaseRisk + (cityDistance / 100);

    // Fort bonus: each fort reduces risk by 2%
    risk -= forts * 0.02;

    // Roads technology: -15% risk
    if (hasRoadsTech) {
        risk -= 0.15;
    }

    // Reputation bonus: high rep = safer trade
    risk -= reputation / 500; // Max -20% at 100 rep

    // Clamp risk using configured bounds (now 1%-25% for better trade viability)
    risk = Math.max(GAME_CONSTANTS.TRADE_RISK_MIN, Math.min(GAME_CONSTANTS.TRADE_RISK_MAX, risk));

    const successChance = 1 - risk;
    const potentialLoss = 0.3 + (risk * 0.5); // 30-80% loss on failure

    return { risk, successChance, potentialLoss };
}

/**
 * Resolve trade caravan outcome
 */
export function resolveTradeRisk(risk: number): { success: boolean; lossMultiplier: number } {
    const roll = random();

    if (roll > risk) {
        return { success: true, lossMultiplier: 0 };
    } else {
        // Partial or total loss
        const severity = random();
        const lossMultiplier = 0.3 + (severity * 0.7); // 30-100% loss
        return { success: false, lossMultiplier };
    }
}

// === INFINITE MODE GENERATION ===

/**
 * Check if procedural content should be generated this round
 */
export function shouldGenerateContent(round: number, ownedTerritories: number, totalBuildings: number, totalTechs: number, totalCities: number): {
    territory: boolean;
    building: boolean;
    tech: boolean;
    city: boolean;
} {
    return {
        territory: round % GAME_CONSTANTS.INFINITE_TERRITORY_INTERVAL === 0,
        building: round % GAME_CONSTANTS.INFINITE_BUILDING_INTERVAL === 0 && totalBuildings < 50,
        tech: round % GAME_CONSTANTS.INFINITE_TECH_INTERVAL === 0 && totalTechs < 40,
        city: round % GAME_CONSTANTS.INFINITE_CITY_INTERVAL === 0 && totalCities < 20,
    };
}

/**
 * Generate a procedural building for infinite mode
 */
export function generateProceduralBuilding(index: number, round: number): {
    name: string;
    category: 'production' | 'military' | 'economic' | 'religious' | 'civic';
    rarity: Rarity;
    cost: { denarii: number };
    upkeep: number;
    productionType: ResourceType;
    productionRate: number;
} {
    const categories: ('production' | 'military' | 'economic' | 'religious' | 'civic')[] =
        ['production', 'production', 'economic', 'military', 'religious'];
    const category = categories[index % categories.length];

    const resourceTypes: ResourceType[] = ['grain', 'iron', 'timber', 'stone', 'wool', 'salt'];
    const productionType = resourceTypes[randomInt(0, resourceTypes.length - 1)];

    const rarity = rollRarity();
    const baseCost = 200 + (index * 50) + (round * 10);
    const productionRate = Math.floor((2 + randomInt(1, 3)) * rarity.bonus);

    return {
        name: `${rarity.name.charAt(0).toUpperCase() + rarity.name.slice(1)} ${productionType.charAt(0).toUpperCase() + productionType.slice(1)} Works`,
        category,
        rarity: rarity.name,
        cost: { denarii: baseCost },
        upkeep: Math.floor(baseCost / 50),
        productionType,
        productionRate,
    };
}

/**
 * Generate a procedural tech for infinite mode
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateProceduralTech(index: number, _round: number): {
    name: string;
    description: string;
    cost: number;
    effectType: string;
    effectValue: number;
} {
    const effectTypes = ['production', 'income', 'happiness', 'attack', 'defense', 'tradePrice'];
    const effectType = effectTypes[randomInt(0, effectTypes.length - 1)];

    const cost = 200 + randomInt(0, 900);
    const effectValue = (randomInt(10, 25)) / 100; // 10-25%

    const prefixes = ['Advanced', 'Improved', 'Superior', 'Enhanced', 'Refined'];
    const suffixes = ['Techniques', 'Methods', 'Systems', 'Practices', 'Knowledge'];

    return {
        name: `${prefixes[index % prefixes.length]} ${effectType.charAt(0).toUpperCase() + effectType.slice(1)} ${suffixes[randomInt(0, suffixes.length - 1)]}`,
        description: `Improves ${effectType} efficiency`,
        cost,
        effectType,
        effectValue,
    };
}

/**
 * Generate a procedural trade city for infinite mode
 */
export function generateProceduralCity(index: number, ownedTerritories: number): {
    name: string;
    distance: number;
    tariff: number;
    risk: number;
    biases: ResourceType[];
    specialties: ResourceType[];
} {
    const namesPrefixes = ['New', 'Old', 'Great', 'Little', 'East', 'West', 'North', 'South'];
    const namesSuffixes = ['Port', 'Market', 'Town', 'Village', 'City', 'Harbor', 'Ford', 'Hills'];

    const resourceTypes: ResourceType[] = ['grain', 'iron', 'timber', 'stone', 'wool', 'salt', 'wine', 'olive_oil'];

    const biasIdx1 = randomInt(0, resourceTypes.length - 1);
    let biasIdx2 = randomInt(0, resourceTypes.length - 1);
    while (biasIdx2 === biasIdx1) biasIdx2 = randomInt(0, resourceTypes.length - 1);

    return {
        name: `${namesPrefixes[randomInt(0, namesPrefixes.length - 1)]} ${namesSuffixes[randomInt(0, namesSuffixes.length - 1)]} ${index + 1}`,
        distance: 20 + randomInt(0, 40) + (ownedTerritories * 5),
        tariff: 0.03 + (random() * 0.12), // 3-15%
        risk: 0.05 + (random() * 0.15), // 5-20%
        biases: [resourceTypes[biasIdx1], resourceTypes[biasIdx2]],
        specialties: [resourceTypes[randomInt(0, resourceTypes.length - 1)]],
    };
}
