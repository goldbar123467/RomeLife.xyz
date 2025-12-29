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
    SEASON_MODIFIERS, MILITARY_UNITS, TERRITORY_LEVELS, TERRITORY_FOCUS, GAME_CONSTANTS
} from '@/core/constants';
import { calculateBuildingEffects } from '@/core/constants/territory';
import { rollRandomEvent as rollEmpireEvent, EVENT_COOLDOWN_ROUNDS } from '@/core/constants/events';
import type { EventConditions } from '@/core/constants/events';
import { rollReligiousEvent } from '@/core/constants/religion';
import type { ReligiousEvent } from '@/core/constants/religion';
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
import { processSenateSeasonEnd } from '@/app/usecases/senate';

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

    // Check starvation (Ceres tier 100: famine immunity)
    const ceresFamineImmune = calculateBlessingBonus(state.patronGod, state.godFavor, 'famineImmune') > 0;
    const isStarving = grainAvailable < foodConsumed && foodConsumed > 0 && !ceresFamineImmune;
    if (grainAvailable < foodConsumed && foodConsumed > 0) {
        if (ceresFamineImmune) {
            events.push('🌾 Ceres protects your people from famine!');
        } else {
            events.push('🍞 Starvation! Your people are hungry.');
        }
    }

    const newConsecutiveStarvation = isStarving ? state.consecutiveStarvation + 1 : 0;

    // Calculate population growth (starvation uses STARVATION_POP_LOSS constant)
    const popGrowth = calculatePopulationGrowth(state);
    const starvationLoss = isStarving ? Math.floor(state.population * GAME_CONSTANTS.STARVATION_POP_LOSS) : 0;
    const newPopulation = Math.max(0, state.population + popGrowth - starvationLoss);
    if (popGrowth > 0) events.push(`👥 Population grew by ${popGrowth}`);
    if (starvationLoss > 0) events.push(`💀 Lost ${starvationLoss} to starvation`);

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
            // Winter risk multiplier: +50% risk in winter
            const winterRiskMultiplier = nextSeason === 'winter' ? 1.5 : 1.0;
            // Mercury tier 100: -50% trade risk
            const mercuryCaravanRiskBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'tradeRisk');
            const effectiveRisk = Math.min(0.8, caravan.risk * winterRiskMultiplier * (1 + mercuryCaravanRiskBonus)); // Cap at 80%
            const success = random() > effectiveRisk;

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

        // Minerva tier 75: +25% building efficiency
        const minervaBuildingEfficiency = 1 + calculateBlessingBonus(state.patronGod, state.godFavor, 'buildingEfficiency');

        let buildingStabilityBonus = 0;

        // Apply building stability bonuses/maluses (Garrison +10, Walls +15, Census Office -5, etc.)
        if (buildingEffects.stability) {
            buildingStabilityBonus = (buildingEffects.stability * minervaBuildingEfficiency) / 4; // Per season (effects are annual)
        }
        // Note: Census Office has negative stability (-5), which is included in buildingEffects.stability

        // Collect happiness and piety bonuses (applied once globally)
        if (buildingEffects.happiness) {
            totalBuildingHappiness += (buildingEffects.happiness * minervaBuildingEfficiency) / 4; // Per season
        }
        if (buildingEffects.piety) {
            totalBuildingPiety += (buildingEffects.piety * minervaBuildingEfficiency) / 4; // Per season
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

    // === WONDER RECURRING INCOME ===
    // Collect income from BUILT wonders (applies every season, not just on completion)
    let wonderRecurringIncome = 0;
    for (const wonder of state.wonders.filter(w => w.built)) {
        for (const effect of wonder.effects) {
            if (effect.type === 'income') {
                wonderRecurringIncome += effect.value;
            }
        }
    }
    if (wonderRecurringIncome > 0) {
        events.push(`🏛️ Wonder income: +${wonderRecurringIncome} denarii`);
    }

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
    // Build conditions for conditional event triggers
    const eventConditions: EventConditions = {
        sanitation: state.sanitation,
        morale: state.morale,
        taxRate: state.taxRate,
        happiness: state.happiness,
        troops: state.troops,
        population: state.population
    };

    // Roll for random event with conditions, cooldowns, and scaling
    const eventResult = rollEmpireEvent(
        newRound,
        state.happiness,
        state.morale,
        eventConditions,
        state.eventCooldowns
    );

    const randomEvent = eventResult.event;
    let eventDenarii = 0;
    let eventPopulation = 0;
    let eventHappiness = 0;
    let eventMorale = 0;
    let eventTroops = 0;
    let eventPiety = 0;
    let eventReputation = 0;
    const eventInventoryChanges: Partial<Record<ResourceType, number>> = {};

    // Track new cooldowns
    const newEventCooldowns: Record<string, number> = {};
    if (state.eventCooldowns) {
        // Decay existing cooldowns by 1
        for (const [eventId, cooldown] of Object.entries(state.eventCooldowns)) {
            if (cooldown > 1) {
                newEventCooldowns[eventId] = cooldown - 1;
            }
        }
    }

    if (randomEvent && eventResult.scaledEffects) {
        events.push(`${randomEvent.icon} ${randomEvent.name}: ${randomEvent.description}`);

        // Set cooldown for this event
        newEventCooldowns[randomEvent.id] = EVENT_COOLDOWN_ROUNDS;

        // Apply SCALED event effects
        for (const effect of eventResult.scaledEffects) {
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

    // === RANDOM RELIGIOUS EVENT ===
    // Only trigger if player has engaged with religion (piety > 20)
    let religiousEvent: ReligiousEvent | null = null;
    if (state.piety > 20) {
        religiousEvent = rollReligiousEvent();
        if (religiousEvent) {
            events.push(`${religiousEvent.icon} ${religiousEvent.name}: ${religiousEvent.description}`);

            // Apply religious event effects
            if (religiousEvent.effects.piety) eventPiety += religiousEvent.effects.piety;
            if (religiousEvent.effects.happiness) eventHappiness += religiousEvent.effects.happiness;
            if (religiousEvent.effects.morale) eventMorale += religiousEvent.effects.morale;
            if (religiousEvent.effects.reputation) eventReputation += religiousEvent.effects.reputation;
            if (religiousEvent.effects.grain) {
                newInventory.grain = Math.max(0, Math.min(
                    newInventory.grain + religiousEvent.effects.grain,
                    state.capacity.grain || 100
                ));
            }
            // godFavor bonus applied later with patron god
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
    const starvationMoraleLoss = isStarving ? GAME_CONSTANTS.STARVATION_MORALE_LOSS : 0;
    let newMorale = Math.floor(state.morale + moraleAdjust + godMoraleBonus + totalGovernorMorale + eventMorale - starvationMoraleLoss);
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

    // Mars tier 75: +50 supplies per season
    const marsSuppliesBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'supplies');
    if (marsSuppliesBonus > 0) {
        newSupplies += marsSuppliesBonus;
    }

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

    // Minerva tier 50: +1 free tech every 5 rounds
    let newTechnologies = state.technologies;
    const minervaFreeTech = calculateBlessingBonus(state.patronGod, state.godFavor, 'freeTech');
    if (minervaFreeTech > 0 && newRound % 5 === 0 && newRound > 0) {
        const unresearchedTechs = state.technologies.filter(t => !t.researched);
        if (unresearchedTechs.length > 0) {
            const randomTech = unresearchedTechs[Math.floor(random() * unresearchedTechs.length)];
            newTechnologies = state.technologies.map(t =>
                t.id === randomTech.id ? { ...t, researched: true } : t
            );
            events.push(`🦉 Minerva grants wisdom! Free technology: ${randomTech.name}`);
        }
    }

    // Venus tier 100: +50 favor with all gods per season
    // Minerva tier 100: +20 favor with patron god per season
    const newGodFavor = { ...state.godFavor };
    const venusAllFavorBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'allFavor');
    if (venusAllFavorBonus > 0) {
        const godNames: Array<'jupiter' | 'mars' | 'venus' | 'ceres' | 'mercury' | 'minerva'> =
            ['jupiter', 'mars', 'venus', 'ceres', 'mercury', 'minerva'];
        for (const god of godNames) {
            newGodFavor[god] = Math.min(100, (newGodFavor[god] || 0) + venusAllFavorBonus);
        }
        events.push(`💕 Venus blesses all gods! +${venusAllFavorBonus} favor with each god`);
    }

    const minervaFavorBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'favor');
    if (minervaFavorBonus > 0 && state.patronGod) {
        newGodFavor[state.patronGod] = Math.min(100, (newGodFavor[state.patronGod] || 0) + minervaFavorBonus);
        events.push(`🦉 Minerva's wisdom strengthens your devotion! +${minervaFavorBonus} favor`);
    }

    // Apply religious event godFavor bonus to patron god
    if (religiousEvent?.effects.godFavor && state.patronGod) {
        newGodFavor[state.patronGod] = Math.min(100, (newGodFavor[state.patronGod] || 0) + religiousEvent.effects.godFavor);
    }

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

    // === SENATE SYSTEM PROCESSING ===
    let senateResult = null;
    let isAssassinated = false;
    if (state.senate?.initialized) {
        senateResult = processSenateSeasonEnd(state, newRound);

        // Apply senate resource changes
        newDenarii += senateResult.denariiChange;
        newHappiness = Math.max(0, Math.min(100, newHappiness + senateResult.happinessChange));
        newMorale = Math.max(0, Math.min(100, newMorale + senateResult.moraleChange));
        newReputation += senateResult.reputationChange;
        newPiety += senateResult.pietyChange;

        // Add senate messages to events
        for (const msg of senateResult.messages) {
            events.push(`🏛️ ${msg}`);
        }

        // Check for assassination
        if (senateResult.assassination?.triggered && !senateResult.assassination.savedBySertorius) {
            isAssassinated = true;
            events.push(`⚔️ ASSASSINATION: ${senateResult.assassination.method}`);
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
    const totalAdditionalIncome = prosperityIncome + caravanIncome + tradeRouteIncome + wonderEffects.income + wonderRecurringIncome + eventDenarii;
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
        technologies: newTechnologies,
        godFavor: newGodFavor,
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
        eventCooldowns: newEventCooldowns,
        history: [...state.history, historyEntry],
        treasuryHistory: [...(state.treasuryHistory || []), treasuryEntry].slice(-50), // Keep last 50 entries
        // Add senate state if processing occurred
        ...(senateResult ? { senate: senateResult.newSenateState } : {}),
    };

    // Check end conditions
    const victoryResult = checkVictoryConditions({ ...state, ...newState } as GameState);
    let failureResult = checkFailureConditions({ ...state, ...newState } as GameState);

    // Assassination is a special failure condition
    if (isAssassinated && !failureResult) {
        failureResult = {
            type: 'assassination',
            title: 'Assassination',
            description: senateResult?.assassination?.method
                ? `You were killed by ${senateResult.assassination.method.toLowerCase()}.`
                : 'You were assassinated by political rivals.',
        };
    }

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

    // Calculate trade risk with Mercury tier 100 bonus (-50% risk)
    const hasRoads = state.technologies.some(t => t.id === 'roads' && t.researched);
    const riskCalc = calculateTradeRisk(city.distance, city.risk, state.forts, hasRoads, state.reputation);
    const mercuryRiskBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'tradeRisk');
    const adjustedRisk = riskCalc.risk * (1 + mercuryRiskBonus); // mercuryRiskBonus is negative (-0.50)
    const riskResult = resolveTradeRisk(adjustedRisk);

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
