// ============================================
// ROME EMPIRE BUILDER - Application Use Cases
// ============================================
// Pure functions that orchestrate game actions using core modules.
// These return state deltas, not mutating directly.

import type {
    GameState, Season, ResourceType, Territory,
    Quest, Achievement, TreasuryHistoryEntry, TradeState, GameEvent
} from '@/core/types';
import {
    SEASON_MODIFIERS, MILITARY_UNITS, TERRITORY_LEVELS, TERRITORY_FOCUS
} from '@/core/constants';
import { calculateBuildingEffects } from '@/core/constants/territory';
import { rollRandomEvent as rollEmpireEvent } from '@/core/constants/events';
import {
    calculateProductionSummary, calculateMarketPrices, calculatePopulationGrowth,
    calculateEnvoySuccess, calculateEnvoyEffect, calculateRelationDecay,
    calculateTradeRisk, resolveTradeRisk, calculateStabilityChange, rollTerritoryEvent,
    shouldGenerateContent, generateProceduralTerritory, randomInt, random, roundResource,
    getGodBlessingBonus
} from '@/core/math';
import { calculateBlessingBonus } from '@/core/constants/religion';
import {
    checkVictoryConditions, checkFailureConditions, checkAchievements,
    checkQuestProgress, getTechBonus
} from '@/core/rules';

// === END SEASON USE CASE ===

export interface EndSeasonResult {
    newState: Partial<GameState>;
    events: string[];
    achievementsUnlocked: Achievement[];
    questsCompleted: Quest[];
    randomEvent: GameEvent | null;
    victoryResult: ReturnType<typeof checkVictoryConditions>;
    failureResult: ReturnType<typeof checkFailureConditions>;
}

export function executeEndSeason(state: GameState): EndSeasonResult {
    const events: string[] = [];

    // Advance season
    const seasonOrder: Season[] = ['spring', 'summer', 'autumn', 'winter'];
    const currentIdx = seasonOrder.indexOf(state.season);
    const nextSeason = seasonOrder[(currentIdx + 1) % 4];
    const newRound = nextSeason === 'spring' ? state.round + 1 : state.round;

    // Calculate production
    const summary = calculateProductionSummary(state);

    // Update inventory with production (round to avoid floating point errors)
    const newInventory = { ...state.inventory };
    for (const [resource, amount] of Object.entries(summary.resources)) {
        const res = resource as ResourceType;
        newInventory[res] = roundResource(Math.min(
            roundResource((newInventory[res] || 0) + amount),
            state.capacity[res] || 100
        ));
    }

    // Consume food
    const foodConsumed = summary.foodConsumption;
    const grainAvailable = newInventory.grain;
    newInventory.grain = Math.max(0, grainAvailable - foodConsumed);

    // Check starvation
    const isStarving = grainAvailable < foodConsumed && foodConsumed > 0;
    if (isStarving) events.push('🍞 Starvation! Your people are hungry.');

    const newConsecutiveStarvation = isStarving ? state.consecutiveStarvation + 1 : 0;

    // Calculate population growth
    const popGrowth = calculatePopulationGrowth(state);
    const newPopulation = Math.max(0, state.population + popGrowth - (isStarving ? Math.floor(state.population * 0.05) : 0));
    if (popGrowth > 0) events.push(`👥 Population grew by ${popGrowth}`);

    // Update denarii with early-game protection
    let effectiveNetIncome = summary.netIncome;
    if (state.round <= 12 && summary.netIncome < 0) {
        // Limit losses to 10% of current denarii during grace period
        effectiveNetIncome = Math.max(summary.netIncome, -Math.floor(state.denarii * 0.1));
    }
    let newDenarii = Math.max(0, state.denarii + effectiveNetIncome);
    if (effectiveNetIncome > 0) {
        events.push(`🪙 Income: +${effectiveNetIncome} denarii`);
    } else if (effectiveNetIncome < 0) {
        events.push(`🪙 Deficit: ${effectiveNetIncome} denarii`);
    }

    // Update market prices
    const { prices, demand } = calculateMarketPrices(
        newInventory,
        state.capacity,
        state.market.demandIndices,
        nextSeason,
        state.infiniteMode
    );

    // === PROCESS CARAVANS & TRADE ROUTES ===
    let newTradeState: TradeState = { ...state.tradeState };
    let caravanIncome = 0;
    let tradeRouteIncome = 0;
    let caravanHappinessPenalty = 0;

    // Process active caravan
    if (newTradeState.activeCaravan) {
        newTradeState.activeCaravan = {
            ...newTradeState.activeCaravan,
            duration: newTradeState.activeCaravan.duration - 1
        };

        // Caravan returns this season
        if (newTradeState.activeCaravan.duration <= 0) {
            const caravan = newTradeState.activeCaravan;
            const success = random() > caravan.risk;

            if (success) {
                // Calculate revenue from goods with Mercury blessing (+25% caravan profit at tier 75)
                let totalRevenue = 0;
                const mercuryCaravanBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'caravanProfit');
                for (const good of caravan.goods) {
                    const basePrice = prices[good.resourceId] || 10;
                    const city = state.tradeCities.find(c => c.id === caravan.cityId);
                    const cityBonus = city?.biases.includes(good.resourceId) ? 1.2 : 1.0;
                    const negotiationBonus = 1 + (newTradeState.upgrades.negotiation * 0.05);
                    totalRevenue += Math.floor(basePrice * good.qty * cityBonus * negotiationBonus);
                }
                totalRevenue = Math.floor(totalRevenue * caravan.reward * (1 + mercuryCaravanBonus));
                caravanIncome = totalRevenue;

                // Improve reputation with city
                newTradeState = {
                    ...newTradeState,
                    cityReputation: {
                        ...newTradeState.cityReputation,
                        [caravan.cityId]: (newTradeState.cityReputation[caravan.cityId] || 0) + 3
                    }
                };

                events.push(`🐫 Caravan returns from ${caravan.cityName}! Earned ${totalRevenue} denarii (+3 reputation)`);
            } else {
                // Caravan failed - goods lost
                newTradeState = {
                    ...newTradeState,
                    cityReputation: {
                        ...newTradeState.cityReputation,
                        [caravan.cityId]: Math.max(-50, (newTradeState.cityReputation[caravan.cityId] || 0) - 2)
                    }
                };
                caravanHappinessPenalty = 8; // Applied later when happiness is calculated
                events.push(`💀 Caravan to ${caravan.cityName} was lost to bandits! Goods lost, reputation -2`);
            }

            // Clear active caravan
            newTradeState.activeCaravan = null;
        }
    }

    // Process trade routes
    const processedRoutes = [];
    for (const route of newTradeState.routes) {
        // Decrement duration
        const newDuration = route.duration - 1;

        if (newDuration > 0) {
            // Check if we have enough goods to fulfill the route
            if (newInventory[route.resourceId] >= route.qty) {
                // Consume goods
                newInventory[route.resourceId] -= route.qty;
                // Add income
                tradeRouteIncome += route.income;
                // Keep the route
                processedRoutes.push({ ...route, duration: newDuration });
            } else {
                // Route cancelled due to lack of goods
                events.push(`📦 Trade route cancelled: Not enough ${route.resourceId} to fulfill shipment`);
            }
        } else {
            // Route expired
            const city = state.tradeCities.find(c => c.id === route.cityId);
            events.push(`📦 Trade route with ${city?.name || 'unknown'} has expired`);
        }
    }
    newTradeState = { ...newTradeState, routes: processedRoutes };

    // Add caravan and route income
    if (caravanIncome > 0 || tradeRouteIncome > 0) {
        if (tradeRouteIncome > 0) {
            events.push(`📦 Trade route income: +${tradeRouteIncome} denarii`);
        }
    }

    // Territory events and stability with building and governor effects
    let prosperityIncome = 0;
    let totalBuildingHappiness = 0;
    let totalBuildingPiety = 0;
    let totalGovernorHappiness = 0;
    let totalGovernorPiety = 0;
    let totalGovernorMorale = 0;

    const newTerritories = state.territories.map(t => {
        if (!t.owned) return t;

        const stabilityChange = calculateStabilityChange(t, state.buildings, state);
        const event = rollTerritoryEvent(t);

        // Calculate territory building effects (Arena +15% happiness, Temple +10 piety, etc.)
        const buildingEffects = calculateBuildingEffects(t.buildings);
        let buildingStabilityBonus = 0;

        // Apply building stability bonuses/maluses (Garrison +10, Walls +15, Census Office -5, etc.)
        if (buildingEffects.stability) {
            buildingStabilityBonus = buildingEffects.stability / 4; // Per season (effects are annual)
        }
        // Note: Census Office has negative stability (-5), which is included in buildingEffects.stability

        // Collect happiness and piety bonuses (applied once globally)
        if (buildingEffects.happiness) {
            totalBuildingHappiness += buildingEffects.happiness / 4; // Per season
        }
        if (buildingEffects.piety) {
            totalBuildingPiety += buildingEffects.piety / 4; // Per season
        }

        // Calculate governor effects (Gaius +20% stability, Servius +30% piety +10% happiness, Titus +15% morale)
        let governorStabilityBonus = 0;
        if (t.governor) {
            // Stability bonus (Gaius)
            if (t.governor.bonus.stability) {
                governorStabilityBonus = t.stability * t.governor.bonus.stability / 4; // Per season
            }
            // Happiness bonus/malus (Servius +10%, Gaius -5%)
            if (t.governor.bonus.happiness) {
                totalGovernorHappiness += t.governor.bonus.happiness * 100 / 4; // Convert to % per season
            }
            if (t.governor.malus.happiness) {
                totalGovernorHappiness += t.governor.malus.happiness * 100 / 4; // negative value
            }
            // Piety bonus (Servius +30%)
            if (t.governor.bonus.piety) {
                totalGovernorPiety += t.governor.bonus.piety * 10 / 4; // Per season
            }
            // Morale bonus (Titus +15%)
            if (t.governor.bonus.morale) {
                totalGovernorMorale += t.governor.bonus.morale * 100 / 4; // Per season
            }
        }

        if (event) {
            events.push(`📜 ${t.name}: ${event.type.replace('_', ' ')}`);
            // Collect prosperity income from events
            if (event.effect.income) {
                prosperityIncome += event.effect.income;
            }
        }

        return {
            ...t,
            stability: Math.max(0, Math.min(100, t.stability + stabilityChange + buildingStabilityBonus + governorStabilityBonus + (event?.effect.stability || 0))),
            garrison: Math.max(0, t.garrison + (event?.effect.garrison || 0)),
        };
    });

    // Apply prosperity income from events (add to newDenarii after processing)
    // Note: newDenarii was calculated earlier, we need to add it here
    // For now, we'll apply it via the state update

    // === WONDER PROGRESSION ===
    const wonderEffects = { happiness: 0, piety: 0, sanitation: 0, income: 0 };
    const newWonders = state.wonders.map(w => {
        // Skip if not under construction
        if (!w.turnsRemaining || w.turnsRemaining <= 0) return w;

        const newTurnsRemaining = w.turnsRemaining - 1;

        // Check if completed
        if (newTurnsRemaining <= 0) {
            events.push(`🏛️ ${w.name} completed! Glory to Rome!`);

            // Apply wonder effects
            for (const effect of w.effects) {
                if (effect.type === 'happiness') wonderEffects.happiness += effect.value;
                if (effect.type === 'piety') wonderEffects.piety += effect.value;
                if (effect.type === 'sanitation') wonderEffects.sanitation += effect.value;
                if (effect.type === 'income') wonderEffects.income += effect.value;
            }

            return { ...w, built: true, turnsRemaining: undefined };
        }

        events.push(`🔨 ${w.name} construction: ${w.cost.turns - newTurnsRemaining}/${w.cost.turns} complete`);
        return { ...w, turnsRemaining: newTurnsRemaining };
    });

    // === RANDOM EMPIRE EVENT ===
    const randomEvent = rollEmpireEvent(newRound, state.happiness, state.morale);
    let eventDenarii = 0;
    let eventPopulation = 0;
    let eventHappiness = 0;
    let eventMorale = 0;
    let eventTroops = 0;
    let eventPiety = 0;
    let eventReputation = 0;
    const eventInventoryChanges: Partial<Record<ResourceType, number>> = {};

    if (randomEvent) {
        events.push(`${randomEvent.icon} ${randomEvent.name}: ${randomEvent.description}`);

        // Apply event effects
        for (const effect of randomEvent.effects) {
            switch (effect.type) {
                case 'denarii':
                    eventDenarii += effect.value;
                    break;
                case 'population':
                    eventPopulation += effect.value;
                    break;
                case 'happiness':
                    eventHappiness += effect.value;
                    break;
                case 'morale':
                    eventMorale += effect.value;
                    break;
                case 'troops':
                    eventTroops += effect.value;
                    break;
                case 'piety':
                    eventPiety += effect.value;
                    break;
                case 'reputation':
                    eventReputation += effect.value;
                    break;
                case 'resource':
                    if (effect.resource) {
                        eventInventoryChanges[effect.resource] = (eventInventoryChanges[effect.resource] || 0) + effect.value;
                    }
                    break;
            }
        }

        // Apply inventory changes from event
        for (const [res, amount] of Object.entries(eventInventoryChanges)) {
            const resource = res as ResourceType;
            newInventory[resource] = Math.max(0, Math.min(
                (newInventory[resource] || 0) + amount,
                state.capacity[resource] || 100
            ));
        }
    }

    // Happiness adjustments with Venus blessing, building effects, and governor effects
    let newHappiness = state.happiness;
    const venusHappinessBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'happiness');
    if (venusHappinessBonus > 0) newHappiness += venusHappinessBonus; // Venus tier 25: +10 happiness
    if (totalBuildingHappiness > 0) newHappiness += totalBuildingHappiness; // Arena, Temple bonuses
    newHappiness += totalGovernorHappiness; // Servius +10%, Gaius -5%
    if (isStarving) newHappiness -= 10;
    if (state.taxRate > 0.20) newHappiness -= Math.floor((state.taxRate - 0.20) * 50);
    if (caravanHappinessPenalty > 0) newHappiness -= caravanHappinessPenalty;
    if (wonderEffects.happiness > 0) newHappiness += wonderEffects.happiness;
    newHappiness += eventHappiness; // Apply event effect

    // Apply seasonal happiness modifier as ADDITIVE (not multiplicative to prevent decay)
    const seasonMod = SEASON_MODIFIERS[nextSeason];
    // Convert multiplier to additive: 1.05 → +5, 0.95 → -5
    const happinessAdjust = Math.round((seasonMod.happiness - 1) * 100);
    newHappiness = Math.floor(newHappiness + happinessAdjust);
    newHappiness = Math.max(0, Math.min(100, newHappiness));

    // Morale adjustments - additive like happiness, including governor bonus (Titus +15%)
    const moraleAdjust = Math.round((seasonMod.morale - 1) * 100);
    const godMoraleBonus = Math.round(getGodBlessingBonus(state.patronGod, state.godFavor, 'morale') * 100);
    let newMorale = Math.floor(state.morale + moraleAdjust + godMoraleBonus + totalGovernorMorale + eventMorale);
    newMorale = Math.max(0, Math.min(100, newMorale));

    // Diplomacy decay
    const newRelations = { ...state.diplomacy.relations };
    for (const [faction, relation] of Object.entries(newRelations)) {
        newRelations[faction] = Math.max(0, Math.min(100, relation + calculateRelationDecay(relation)));
    }

    // Emergency cooldowns decay
    const newEmergencyCooldowns: Record<string, number> = {};
    if (state.emergencyCooldowns) {
        for (const [actionId, cooldown] of Object.entries(state.emergencyCooldowns)) {
            if (cooldown > 1) {
                newEmergencyCooldowns[actionId] = cooldown - 1;
            }
        }
    }

    // Check achievements
    const achievementsUnlocked = checkAchievements(
        { ...state, round: newRound, denarii: newDenarii, population: newPopulation },
        state
    );

    // Apply achievement rewards
    let newReputation = state.reputation;
    let newSupplies = state.supplies;
    let newPiety = state.piety + totalBuildingPiety + totalGovernorPiety; // Building + governor piety
    let newHousing = state.housing;
    for (const achievement of achievementsUnlocked) {
        if (achievement.reward.denarii) newDenarii += achievement.reward.denarii;
        if (achievement.reward.happiness) newHappiness = Math.min(100, newHappiness + achievement.reward.happiness);
        if (achievement.reward.morale) newMorale = Math.min(100, newMorale + achievement.reward.morale);
        if (achievement.reward.reputation) newReputation += achievement.reward.reputation;
        if (achievement.reward.supplies) newSupplies += achievement.reward.supplies;
        if (achievement.reward.piety) newPiety += achievement.reward.piety;
        if (achievement.reward.housing) newHousing += achievement.reward.housing;
        events.push(`🏆 Achievement unlocked: ${achievement.name}!`);
    }

    // Update quest progress and apply rewards
    const updatedQuests = state.quests.map(q => {
        if (!q.active || q.completed) return q;
        const progress = checkQuestProgress(state, q);
        const completed = progress >= q.target;
        if (completed) {
            events.push(`🎯 Quest completed: ${q.title}`);
            // Apply quest rewards
            if (q.reward.denarii) newDenarii += q.reward.denarii;
            if (q.reward.reputation) newReputation += q.reward.reputation;
        }
        return { ...q, progress, completed };
    });

    // Infinite mode content generation
    const proceduralAdditions: Partial<GameState> = {};
    if (state.infiniteMode) {
        const shouldGen = shouldGenerateContent(
            newRound,
            newTerritories.filter(t => t.owned).length,
            state.buildings.length,
            state.technologies.length,
            state.tradeCities.length
        );

        if (shouldGen.territory) {
            const newTerritory = generateProceduralTerritory(
                newTerritories.length,
                newTerritories.filter(t => t.owned).length,
                newRound
            );
            const fullTerritory: Territory = {
                ...newTerritory,
                id: `proc_territory_${Date.now()}`,
            };
            proceduralAdditions.territories = [...newTerritories, fullTerritory];
            events.push(`🗺️ New territory discovered: ${fullTerritory.name}`);
        }
    }

    // Record history
    const historyEntry = {
        round: newRound,
        season: nextSeason,
        denarii: newDenarii,
        population: newPopulation,
        troops: state.troops,
        territories: newTerritories.filter(t => t.owned).length,
        events,
    };

    // Record treasury history for charts
    const treasuryEntry: TreasuryHistoryEntry = {
        round: newRound,
        season: nextSeason,
        denarii: newDenarii + prosperityIncome,
        income: summary.income,
        upkeep: summary.upkeep,
        netIncome: summary.netIncome,
    };

    // Build new state
    const totalAdditionalIncome = prosperityIncome + caravanIncome + tradeRouteIncome + wonderEffects.income + eventDenarii;
    const newState: Partial<GameState> = {
        season: nextSeason,
        round: newRound,
        inventory: newInventory,
        denarii: Math.max(0, newDenarii + totalAdditionalIncome),
        population: Math.max(0, newPopulation + eventPopulation),
        troops: Math.max(0, state.troops + eventTroops),
        happiness: newHappiness,
        morale: newMorale,
        consecutiveStarvation: newConsecutiveStarvation,
        territories: proceduralAdditions.territories || newTerritories,
        quests: updatedQuests,
        achievements: state.achievements.map(a =>
            achievementsUnlocked.find(u => u.id === a.id) || a
        ),
        wonders: newWonders,
        // Apply achievement rewards + wonder effects + event effects
        reputation: Math.max(0, newReputation + eventReputation),
        supplies: newSupplies,
        piety: Math.max(0, newPiety + wonderEffects.piety + eventPiety),
        sanitation: state.sanitation + wonderEffects.sanitation,
        housing: newHousing,
        market: {
            ...state.market,
            prices,
            demandIndices: demand,
        },
        tradeState: newTradeState,
        diplomacy: {
            ...state.diplomacy,
            relations: newRelations,
        },
        emergencyCooldowns: newEmergencyCooldowns,
        history: [...state.history, historyEntry],
        treasuryHistory: [...(state.treasuryHistory || []), treasuryEntry].slice(-50), // Keep last 50 entries
    };

    // Check end conditions
    const victoryResult = checkVictoryConditions({ ...state, ...newState } as GameState);
    const failureResult = checkFailureConditions({ ...state, ...newState } as GameState);

    if (victoryResult) {
        newState.stage = 'results';
        events.push(`🏆 Victory: ${victoryResult.title}`);
    }
    if (failureResult) {
        newState.stage = 'results';
        events.push(`💀 Defeat: ${failureResult.title}`);
    }

    return {
        newState,
        events,
        achievementsUnlocked,
        questsCompleted: updatedQuests.filter(q => q.completed),
        randomEvent,
        victoryResult,
        failureResult,
    };
}

// === RECRUIT TROOPS USE CASE ===

export interface RecruitResult {
    success: boolean;
    troopsGained: number;
    newState: Partial<GameState>;
    message: string;
}

export function executeRecruitTroops(state: GameState, unitId: string): RecruitResult {
    const unit = MILITARY_UNITS.find(u => u.id === unitId);
    if (!unit) {
        return { success: false, troopsGained: 0, newState: {}, message: 'Unknown unit type' };
    }

    // Calculate cost with founder modifier and Mars blessing (-15% at tier 25)
    const recruitCostMod = state.founder?.modifiers.recruitCostMod || 0;
    const marsRecruitBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'recruitCost');
    const denCost = Math.floor(unit.cost.denarii * (1 + recruitCostMod + marsRecruitBonus));
    const foodCost = unit.cost.food;

    // Check resources
    if (state.denarii < denCost) {
        return { success: false, troopsGained: 0, newState: {}, message: 'Not enough denarii' };
    }
    if (state.inventory.grain < foodCost) {
        return { success: false, troopsGained: 0, newState: {}, message: 'Not enough food' };
    }

    // Roll for troops gained with territory focus bonus (military_outpost +20%)
    const troopBonus = state.founder?.modifiers.troopBonus || 0;

    // Territory focus: military_outpost +20% troop recruit
    let focusTroopBonus = 0;
    for (const t of state.territories.filter(t => t.owned && t.focus === 'military_outpost')) {
        const focusData = TERRITORY_FOCUS[t.focus];
        if (focusData?.bonus.troopRecruit) {
            focusTroopBonus += focusData.bonus.troopRecruit;
        }
    }

    const baseTroops = randomInt(unit.troopsMin, unit.troopsMax);
    const troopsGained = Math.floor(baseTroops * (1 + troopBonus + focusTroopBonus));

    return {
        success: true,
        troopsGained,
        newState: {
            denarii: state.denarii - denCost,
            inventory: {
                ...state.inventory,
                grain: state.inventory.grain - foodCost,
            },
            troops: state.troops + troopsGained,
        },
        message: `Recruited ${troopsGained} ${unit.name}!`,
    };
}

// === RESEARCH TECHNOLOGY USE CASE ===

export interface ResearchResult {
    success: boolean;
    newState: Partial<GameState>;
    message: string;
}

export function executeResearchTech(state: GameState, techId: string): ResearchResult {
    const techIndex = state.technologies.findIndex(t => t.id === techId);
    if (techIndex === -1) {
        return { success: false, newState: {}, message: 'Technology not found' };
    }

    const tech = state.technologies[techIndex];

    if (tech.researched) {
        return { success: false, newState: {}, message: 'Already researched' };
    }

    // Apply Minerva blessing cost reduction (-15% at tier 25)
    let cost = tech.cost;
    const minervaTechBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'techCost');
    if (minervaTechBonus !== 0) {
        cost = Math.floor(cost * (1 + minervaTechBonus)); // minervaTechBonus is negative (-0.15)
    }

    if (state.denarii < cost) {
        return { success: false, newState: {}, message: 'Not enough denarii' };
    }

    const newTechnologies = [...state.technologies];
    newTechnologies[techIndex] = { ...tech, researched: true };

    return {
        success: true,
        newState: {
            denarii: state.denarii - cost,
            technologies: newTechnologies,
        },
        message: `Researched ${tech.name}!`,
    };
}

// === TRADE USE CASE ===

export interface TradeResult {
    success: boolean;
    denariiGained: number;
    resourcesLost: number;
    riskTriggered: boolean;
    newState: Partial<GameState>;
    message: string;
}

export function executeTrade(
    state: GameState,
    cityId: string,
    resource: ResourceType,
    amount: number
): TradeResult {
    const city = state.tradeCities.find(c => c.id === cityId);
    if (!city) {
        return { success: false, denariiGained: 0, resourcesLost: 0, riskTriggered: false, newState: {}, message: 'City not found' };
    }

    if (state.inventory[resource] < amount) {
        return { success: false, denariiGained: 0, resourcesLost: 0, riskTriggered: false, newState: {}, message: 'Not enough resources' };
    }

    // Calculate trade risk
    const hasRoads = state.technologies.some(t => t.id === 'roads' && t.researched);
    const riskCalc = calculateTradeRisk(city.distance, city.risk, state.forts, hasRoads, state.reputation);
    const riskResult = resolveTradeRisk(riskCalc.risk);

    // Calculate price with Mercury blessings and territory focus
    const basePrice = state.market.prices[resource];
    const cityBonus = city.biases.includes(resource) ? 1.2 : 1.0;
    const founderBonus = 1 + (state.founder?.modifiers.tradePriceMod || 0);
    const techBonus = 1 + getTechBonus(state.technologies, 'tradePrice');

    // Mercury blessings: +10% trade prices (tier 25), -20% tariffs (tier 50)
    const mercuryPriceBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'tradePrices');
    const mercuryTariffBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'tariffs');

    // Territory focus: trade_hub +15% trade prices, +20% tariff reduction
    let focusTradePriceBonus = 0;
    let focusTariffReduction = 0;
    for (const t of state.territories.filter(t => t.owned && t.focus === 'trade_hub')) {
        const focusData = TERRITORY_FOCUS[t.focus];
        if (focusData) {
            if (focusData.bonus.tradePrices) focusTradePriceBonus += focusData.bonus.tradePrices;
            if (focusData.bonus.tariffReduction) focusTariffReduction += focusData.bonus.tariffReduction;
        }
    }

    const tariffMod = 1 - city.tariff * (1 + mercuryTariffBonus - focusTariffReduction); // mercuryTariffBonus is negative (-0.20)

    if (!riskResult.success) {
        // Trade failed - lose some resources
        const resourcesLost = Math.floor(amount * riskResult.lossMultiplier);

        return {
            success: false,
            denariiGained: 0,
            resourcesLost,
            riskTriggered: true,
            newState: {
                inventory: {
                    ...state.inventory,
                    [resource]: state.inventory[resource] - resourcesLost,
                },
            },
            message: `Caravan raided! Lost ${resourcesLost} ${resource}`,
        };
    }

    // Successful trade - apply Mercury price bonus (+10% at tier 25) and focus bonus
    const denariiGained = Math.floor(basePrice * amount * cityBonus * founderBonus * techBonus * tariffMod * (1 + mercuryPriceBonus + focusTradePriceBonus));

    return {
        success: true,
        denariiGained,
        resourcesLost: amount,
        riskTriggered: false,
        newState: {
            inventory: {
                ...state.inventory,
                [resource]: state.inventory[resource] - amount,
            },
            denarii: state.denarii + denariiGained,
            totalTrades: state.totalTrades + 1,
            reputation: Math.min(100, state.reputation + 1), // Small rep gain per trade
        },
        message: `Sold ${amount} ${resource} for ${denariiGained} denarii`,
    };
}

// === UPGRADE TERRITORY USE CASE ===

export interface UpgradeResult {
    success: boolean;
    newLevel: number;
    newState: Partial<GameState>;
    message: string;
}

export function executeUpgradeTerritory(state: GameState, territoryId: string): UpgradeResult {
    const territoryIndex = state.territories.findIndex(t => t.id === territoryId);
    if (territoryIndex === -1) {
        return { success: false, newLevel: 0, newState: {}, message: 'Territory not found' };
    }

    const territory = state.territories[territoryIndex];

    if (!territory.owned) {
        return { success: false, newLevel: 0, newState: {}, message: 'Territory not owned' };
    }

    if (territory.level >= 5) {
        return { success: false, newLevel: 5, newState: {}, message: 'Already at max level' };
    }

    const nextLevel = (territory.level + 1) as 1 | 2 | 3 | 4 | 5;
    const levelData = TERRITORY_LEVELS[nextLevel];
    const cost = levelData.upgradeCost || 0;

    if (state.denarii < cost) {
        return { success: false, newLevel: territory.level, newState: {}, message: 'Not enough denarii' };
    }

    const newTerritories = [...state.territories];
    const newStability = Math.min(100, territory.stability + levelData.stabilityBonus);
    newTerritories[territoryIndex] = { ...territory, level: nextLevel, stability: newStability };

    return {
        success: true,
        newLevel: nextLevel,
        newState: {
            denarii: state.denarii - cost,
            territories: newTerritories,
        },
        message: `Upgraded ${territory.name} to ${levelData.name}!`,
    };
}

// === SEND ENVOY USE CASE ===

export interface EnvoyResult {
    success: boolean;
    relationChange: number;
    newState: Partial<GameState>;
    message: string;
}

export function executeSendEnvoy(state: GameState, factionId: string): EnvoyResult {
    const currentRelation = state.diplomacy.relations[factionId];
    if (currentRelation === undefined) {
        return { success: false, relationChange: 0, newState: {}, message: 'Faction not found' };
    }

    // Envoy cost
    const envoyCost = 100;
    if (state.denarii < envoyCost) {
        return { success: false, relationChange: 0, newState: {}, message: 'Not enough denarii for envoy' };
    }

    // Calculate success
    const godDiplomacyBonus = getGodBlessingBonus(state.patronGod, state.godFavor, 'diplomacy');
    const successChance = calculateEnvoySuccess(state.reputation, currentRelation) + godDiplomacyBonus;
    const succeeded = random() < successChance;
    const relationChange = calculateEnvoyEffect(succeeded, state.reputation);

    const newRelations = {
        ...state.diplomacy.relations,
        [factionId]: Math.max(0, Math.min(100, currentRelation + relationChange)),
    };

    return {
        success: succeeded,
        relationChange,
        newState: {
            denarii: state.denarii - envoyCost,
            diplomacy: {
                ...state.diplomacy,
                relations: newRelations,
                activeEnvoys: state.diplomacy.activeEnvoys + 1,
            },
        },
        message: succeeded
            ? `Envoy successful! Relations improved by ${relationChange}`
            : `Envoy failed. Relations decreased by ${Math.abs(relationChange)}`,
    };
}

// === ENTER INFINITE MODE ===

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function executeEnterInfiniteMode(_state: GameState): Partial<GameState> {
    return {
        infiniteMode: true,
        maxRounds: 999999,
        stage: 'game',
    };
}
