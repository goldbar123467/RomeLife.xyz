// ============================================
// ROME EMPIRE BUILDER - Application Use Cases
// ============================================
// Pure functions that orchestrate game actions using core modules.
// These return state deltas, not mutating directly.

import type {
    GameState, Season, ResourceType, Territory,
    Quest, Achievement, TreasuryHistoryEntry, TradeState, GameEvent,
    DiplomacyHistoryEntry
} from '@/core/types';
import {
    SEASON_MODIFIERS, MILITARY_UNITS, TERRITORY_LEVELS, TERRITORY_FOCUS, GAME_CONSTANTS,
    REPUTATION_MILESTONES
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
    calculateIncomeBreakdown, calculateExpenseBreakdown,
    getReputationTradeBonus,
} from '@/core/math';
import { calculateBlessingBonus } from '@/core/constants/religion';
import {
    checkVictoryConditions, checkFailureConditions, checkAchievements,
    checkQuestProgress, getTechBonus
} from '@/core/rules';
import { processSenateSeasonEnd, clampReligiousEventEffect } from '@/app/usecases/senate';

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

    // BL-40: Tracks -400 denarii cost if emergency grain import triggers below
    let newDenariiAdjustment_emergency = 0;

    // Update inventory with production (round to avoid floating point errors)
    const newInventory = { ...state.inventory };
    for (const [resource, amount] of Object.entries(summary.resources)) {
        const res = resource as ResourceType;
        newInventory[res] = roundResource(Math.min(
            roundResource((newInventory[res] || 0) + amount),
            state.capacity[res] || 100
        ));
    }

    // BL-40 / BL-45: Auto Emergency Grain Import.
    // Scale grain to ~2 seasons of need (min 200), cost = 4 denarii per grain.
    // Cooldown 4 rounds; BL-45 adds a second airlift inside cooldown when the
    // deficit is still firing and the treasury is flush (>=3000d).
    const _preConsumeGrain = newInventory.grain;
    const _preConsumeFoodNeed = summary.foodConsumption;
    const _preConsumeDeficit = Math.max(0, _preConsumeFoodNeed - _preConsumeGrain);
    const _lastEmergencyImport = state.lastEmergencyImportRound ?? -99;
    let newLastEmergencyImportRound: number | undefined = state.lastEmergencyImportRound;

    const tryEmergencyImport = (tag: 'import' | 'airlift'): void => {
        const grainCap = state.capacity.grain || 100;
        const grainRoom = Math.max(0, grainCap - newInventory.grain);
        const desiredGrain = Math.max(200, Math.ceil(_preConsumeFoodNeed * 2));
        const grainAdded = Math.min(desiredGrain, grainRoom);
        if (grainAdded <= 0) return;
        const cost = 4 * grainAdded;
        // Respect the 2000d floor and don't push treasury negative mid-adjustment.
        const projectedDenarii = state.denarii + newDenariiAdjustment_emergency;
        if (projectedDenarii - cost < 0) return;
        newInventory.grain = newInventory.grain + grainAdded;
        newDenariiAdjustment_emergency -= cost;
        const label = tag === 'airlift' ? 'Emergency grain airlift' : 'Emergency grain import';
        events.push(`[trade] ${label}: -${cost}d, +${grainAdded}g`);
        newLastEmergencyImportRound = newRound;
        // eslint-disable-next-line no-console
        console.warn(`[BL-45][${tag}]`, {
            round: newRound,
            grainAdded,
            cost,
            denarii: projectedDenarii - cost,
            deficit: _preConsumeDeficit,
        });
    };

    if (
        state.denarii >= 2000 &&
        _preConsumeDeficit > 0 &&
        (newRound - _lastEmergencyImport) >= 4 &&
        state.consecutiveStarvation === 0
    ) {
        tryEmergencyImport('import');
    }

    // BL-45: second airlift inside cooldown when coffers are flush and the
    // deficit is still firing. Guarded against mid-starvation.
    if (
        state.denarii >= 3000 &&
        _preConsumeDeficit > _preConsumeFoodNeed * 0.1 &&
        state.consecutiveStarvation === 0 &&
        newLastEmergencyImportRound !== newRound // only if the first-path didn't fire this season
    ) {
        tryEmergencyImport('airlift');
    }

    // Consume food
    const foodConsumed = summary.foodConsumption;
    const grainAvailable = newInventory.grain;
    newInventory.grain = Math.max(0, grainAvailable - foodConsumed);

    // BL-28: Defensive pacing log. If post-consumption grain dips below 0.5x of
    // a single season's consumption, surface a console.warn so future QA /
    // instrumented playthroughs catch pacing regressions (e.g. grace-period or
    // Farm Complex production silently changing). Does not affect gameplay.
    if (foodConsumed > 0 && newInventory.grain < foodConsumed * 0.5) {
        // eslint-disable-next-line no-console
        console.warn(
            `[BL-28][pacing] Round ${state.round} ${state.season} -> ${nextSeason}: ` +
            `grain ${newInventory.grain} below 0.5x consumption (${foodConsumed}). ` +
            `pop=${state.population} troops=${state.troops} grace-multiplier applied.`
        );
    }

    // Check starvation (Ceres tier 100: famine immunity)
    const ceresFamineImmune = calculateBlessingBonus(state.patronGod, state.godFavor, 'famineImmune') > 0;
    const isStarving = grainAvailable < foodConsumed && foodConsumed > 0 && !ceresFamineImmune;
    if (grainAvailable < foodConsumed && foodConsumed > 0) {
        if (ceresFamineImmune) {
            events.push('[Ceres] Ceres protects your people from famine!');
        } else {
            events.push('[Food] Starvation! Your people are hungry.');
        }
    }

    // BL-30/BL-38: Soften early-game Famine trigger.
    // - Reset the consecutive-starvation counter on ANY season whose grain
    //   deficit is <10% of consumption (near-miss counts as a recovery),
    //   not only on strictly non-starving seasons.
    // - Keep the round 1-10 near-miss cap at 1 for truly marginal deficits.
    const grainShortfall = Math.max(0, foodConsumed - grainAvailable);
    const deficitRatio = foodConsumed > 0 ? grainShortfall / foodConsumed : 0;
    let newConsecutiveStarvation = isStarving ? state.consecutiveStarvation + 1 : 0;
    // BL-40: telemetry — surface every consec-starvation increment so famine cascades are visible in logs
    if (isStarving) {
        // eslint-disable-next-line no-console
        console.warn('[BL-40][famine-branch]', { branch: 'increment', round: newRound, consec: newConsecutiveStarvation, grainShortfall, foodConsumed });
    }
    if (isStarving && deficitRatio < 0.10) {
        // Near-miss: grain was short by less than 10% of need. Count as recovery.
        newConsecutiveStarvation = 0;
    }
    if (
        isStarving &&
        newRound <= 10 &&
        foodConsumed > 0 &&
        state.consecutiveStarvation >= 1 &&
        newConsecutiveStarvation >= 2
    ) {
        if (grainShortfall <= foodConsumed * 0.2) {
            newConsecutiveStarvation = 1;
            events.push('[food] Desperate foraging averts Famine — build a Farm Complex!');
        }
    }

    // BL-38: 2-round recovery grace. A first starvation applies full penalty
    // (15% pop loss, 15 morale). A 2nd consecutive starvation softens to
    // 5% pop / 5 morale so the player has a chance to course-correct. A
    // 3rd consecutive (now FAILURE_STARVATION_LIMIT) applies full penalty
    // and tips into Famine.
    const popLossPct = (() => {
        if (!isStarving) return 0;
        if (newConsecutiveStarvation === 2) return 0.05;
        return GAME_CONSTANTS.STARVATION_POP_LOSS;
    })();

    // BL-42: strict pop ordering
    // Step 1: consumption was already computed above (foodConsumed)
    // Step 2: starvation already determined (isStarving)
    // Step 3: pop after starvation (pre-growth)
    const step3_popAfterStarvation = isStarving
        ? Math.max(0, Math.floor(state.population * (1 - popLossPct)))
        : state.population;
    const starvationLoss = state.population - step3_popAfterStarvation;
    // Step 4: growth uses POST-STARVATION pop (not pre-starvation), so a season
    //         that kills 15% of pop cannot simultaneously grow from the dead.
    const popGrowth = calculatePopulationGrowth({ ...state, population: step3_popAfterStarvation });
    // Step 5: add growth to post-starvation pop
    const step5_popAfterGrowth = step3_popAfterStarvation + popGrowth;
    // Step 6: single housing-cap clamp at the end
    const newPopulation = Math.max(0, Math.min(step5_popAfterGrowth, state.housing));
    if (popGrowth > 0) events.push(`[Population] Population grew by ${popGrowth}`);
    if (starvationLoss > 0) events.push(`[Crisis] Lost ${starvationLoss} to starvation`);
    // BL-42 defensive assertion: catch large unexpected swings
    if (Math.abs(newPopulation - state.population) > state.housing * 0.2) {
        events.push(`[BL-42] Pop swing ${state.population}->${newPopulation} exceeds 20% of housing cap`);
    }

    // BL-18: Surface the silent sanitation-death-spiral.
    // `calculatePopulationGrowth` returns -1 when sanitation < 15 AND pop < housing
    // (disease/death outpaces births). Previously there was no UI surface, so the
    // player would see population slowly bleed without knowing why.
    if (popGrowth < 0 && state.sanitation < 15 && state.population < state.housing) {
        events.push(
            `[!] Sanitation critical (${state.sanitation}) — population declining from disease. Build a Bathhouse/Aqueduct.`
        );
    }

    // BL-30: One-shot Farm Complex tutorial nudge — after round 2, if the player
    // still hasn't built a Farm Complex (farm_1) in Palatine Hill, surface a hint
    // so aggressive/Goat playstyles don't starve by round 7.
    let newFarmTutorialShown = state.farmTutorialShown ?? false;
    if (!newFarmTutorialShown && newRound >= 2) {
        const hasFarmComplex = state.buildings.some(b => b.id === 'farm_1' && b.count > 0);
        if (!hasFarmComplex) {
            events.push(
                '[tutorial] Build a Farm Complex in Palatine Hill to secure your grain supply (Settlement → Build).'
            );
            newFarmTutorialShown = true;
        }
    }

    // BL-49: Recurring spending nudge — when the player is sitting on >=1000d
    // while a grain deficit is firing and no Farm Complex exists, remind them
    // to spend. 3-round cooldown to avoid spam.
    let newSpendingNudgeLastRound = state.spendingNudgeLastRound;
    {
        const hasFarmComplexNow = state.buildings.some(b => b.id === 'farm_1' && b.count > 0);
        const lastNudge = state.spendingNudgeLastRound ?? -999;
        if (
            !hasFarmComplexNow &&
            state.denarii >= 1000 &&
            _preConsumeDeficit > 0 &&
            (newRound - lastNudge) >= 3
        ) {
            events.push(
                `[spend] You have ${state.denarii}d banked — build a Farm Complex (500d) in Palatine Hill → Build to stop the famine.`
            );
            newSpendingNudgeLastRound = newRound;
        }
    }

    // BL-49 bonus: one-shot Insulae nudge when population is pinned at housing
    // and the player has coin to spare. Kicks in from round 5 onwards.
    let newInsulaeNudgeShown = state.insulaeNudgeShown ?? false;
    if (
        !newInsulaeNudgeShown &&
        state.denarii >= 2000 &&
        state.population >= state.housing * 0.95 &&
        state.round >= 5
    ) {
        events.push(
            `[spend] Denarii banked: ${state.denarii} — consider building Insulae (800d) to raise housing cap above 150.`
        );
        newInsulaeNudgeShown = true;
    }

    // BL-44: One-shot housing-cap progression nudge — when pop is pinned at housing
    // and the player hasn't expanded territorially, tell them where to go next.
    let newHousingCapNudgeShown = state.housingCapNudgeShown ?? false;
    if (!newHousingCapNudgeShown && newRound >= 3) {
        const ownedTerritories = state.territories.filter(t => t.owned).length;
        if (newPopulation >= state.housing * 0.95 && ownedTerritories <= 1) {
            events.push(
                '[progression] Your population has outgrown your housing — build Insulae in Settlement, or conquer territory on the Map.'
            );
            newHousingCapNudgeShown = true;
        }
    }

    // Update denarii with tiered deficit protection (extended to round 24)
    let effectiveNetIncome = summary.netIncome;
    if (summary.netIncome < 0) {
        // Tiered deficit protection:
        // Rounds 1-16: Max 3% treasury loss per season
        // Rounds 17-24: Max 5% treasury loss per season
        // Round 25+: Full losses apply
        let maxLossPct = 1.0; // Full loss by default
        if (state.round <= 16) {
            maxLossPct = 0.03; // 3% max loss
        } else if (state.round <= 24) {
            maxLossPct = 0.05; // 5% max loss
        }

        if (maxLossPct < 1.0) {
            effectiveNetIncome = Math.max(summary.netIncome, -Math.floor(state.denarii * maxLossPct));
        }
    }
    let newDenarii = Math.max(0, state.denarii + effectiveNetIncome + newDenariiAdjustment_emergency); // BL-40 applies emergency import cost
    if (effectiveNetIncome > 0) {
        events.push(`[Treasury] Income: +${effectiveNetIncome} denarii`);
    } else if (effectiveNetIncome < 0) {
        events.push(`[Treasury] Deficit: ${effectiveNetIncome} denarii`);
    }

    // BL-21: Surface deficit and low-grain warnings early (cooldown: 2 rounds)
    // Uses the uncapped summary.netIncome so the warning fires even while
    // tiered deficit protection is softening the real loss.
    let newLastDeficitWarnRound = state.lastDeficitWarnRound;
    let newLastLowGrainWarnRound = state.lastLowGrainWarnRound;
    if (summary.netIncome < 0) {
        const lastWarn = state.lastDeficitWarnRound ?? -999;
        if (newRound - lastWarn >= 2) {
            events.push(
                `[!] Deficit: losing ${Math.abs(summary.netIncome)} denarii/season. Raise taxes or build a marketplace.`
            );
            newLastDeficitWarnRound = newRound;
        }
    }
    // Low-grain warning: under 1.5x seasonal consumption projects famine soon
    if (foodConsumed > 0 && newInventory.grain < foodConsumed * 1.5) {
        const lastWarn = state.lastLowGrainWarnRound ?? -999;
        if (newRound - lastWarn >= 2) {
            const seasonsLeft = Math.max(0, Math.floor(newInventory.grain / foodConsumed));
            events.push(
                `[!] Low grain: famine in ~${seasonsLeft} season${seasonsLeft === 1 ? '' : 's'} unless you build a Farm/Granary.`
            );
            newLastLowGrainWarnRound = newRound;
        }
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

                events.push(`[Trade] Caravan returns from ${caravan.cityName}! Earned ${totalRevenue} denarii (+3 reputation)`);
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
                events.push(`[Trade] Caravan to ${caravan.cityName} was lost to bandits! Goods lost, reputation -2`);
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
                events.push(`[Trade] Trade route cancelled: Not enough ${route.resourceId} to fulfill shipment`);
            }
        } else {
            // Route expired
            const city = state.tradeCities.find(c => c.id === route.cityId);
            events.push(`[Trade] Trade route with ${city?.name || 'unknown'} has expired`);
        }
    }
    newTradeState = { ...newTradeState, routes: processedRoutes };

    // Add caravan and route income
    if (caravanIncome > 0 || tradeRouteIncome > 0) {
        if (tradeRouteIncome > 0) {
            events.push(`[Trade] Trade route income: +${tradeRouteIncome} denarii`);
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
                totalGovernorPiety += t.governor.bonus.piety * 100 / 4; // Convert to % per season (consistent with happiness/morale)
            }
            // Morale bonus (Titus +15%)
            if (t.governor.bonus.morale) {
                totalGovernorMorale += t.governor.bonus.morale * 100 / 4; // Per season
            }
        }

        if (event) {
            events.push(`[Territory] ${t.name}: ${event.type.replace('_', ' ')}`);
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
        events.push(`[Wonder] Wonder income: +${wonderRecurringIncome} denarii`);
    }

    // === WONDER PROGRESSION ===
    const wonderEffects = { happiness: 0, piety: 0, sanitation: 0, income: 0 };
    const newWonders = state.wonders.map(w => {
        // Skip if not under construction
        if (!w.turnsRemaining || w.turnsRemaining <= 0) return w;

        const newTurnsRemaining = w.turnsRemaining - 1;

        // Check if completed
        if (newTurnsRemaining <= 0) {
            events.push(`[Wonder] ${w.name} completed! Glory to Rome!`);

            // Apply wonder effects
            for (const effect of w.effects) {
                if (effect.type === 'happiness') wonderEffects.happiness += effect.value;
                if (effect.type === 'piety') wonderEffects.piety += effect.value;
                if (effect.type === 'sanitation') wonderEffects.sanitation += effect.value;
                if (effect.type === 'income') wonderEffects.income += effect.value;
            }

            return { ...w, built: true, turnsRemaining: undefined };
        }

        events.push(`[Build] ${w.name} construction: ${w.cost.turns - newTurnsRemaining}/${w.cost.turns} complete`);
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
        // Pass the already-decayed cooldowns map so we skip religious events still on cooldown
        religiousEvent = rollReligiousEvent(newEventCooldowns);
        if (religiousEvent) {
            // Record cooldown for this religious event (same 4-round pattern as empire events)
            newEventCooldowns[religiousEvent.id] = EVENT_COOLDOWN_ROUNDS;
            events.push(`${religiousEvent.icon} ${religiousEvent.name}: ${religiousEvent.description}`);

            // BL-46: Clamp per-field deltas so a single divine_wrath can't crater piety.
            const clampResult = clampReligiousEventEffect(religiousEvent.effects);
            const clampedFx = clampResult.effect;
            if (clampResult.clamped) {
                events.push(`[religion-clamp] ${religiousEvent.name}: ${clampResult.messages.join(', ')}`);
            }

            // Apply religious event effects (clamped)
            if (clampedFx.piety) eventPiety += clampedFx.piety;
            if (clampedFx.happiness) eventHappiness += clampedFx.happiness;
            if (clampedFx.morale) eventMorale += clampedFx.morale;
            if (clampedFx.reputation) eventReputation += clampedFx.reputation;
            if (clampedFx.grain) {
                newInventory.grain = Math.max(0, Math.min(
                    newInventory.grain + clampedFx.grain,
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
    newHappiness += totalBuildingHappiness; // Arena, Temple bonuses (apply even if net-negative)
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
    // Jupiter tier 75: +15 morale (additive value from BLESSING_EFFECTS)
    const godMoraleBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'morale');
    // BL-38: 2nd consecutive starvation softens morale loss to -5 (was -15) so
    // winter + starvation don't stack into an unrecoverable hit.
    const starvationMoraleLoss = isStarving
        ? (newConsecutiveStarvation === 2 ? 5 : GAME_CONSTANTS.STARVATION_MORALE_LOSS)
        : 0;
    const moraleDeltaRaw = moraleAdjust + godMoraleBonus + totalGovernorMorale + eventMorale - starvationMoraleLoss;
    // BL-38: Cap per-season morale decay at -8 so a single season can't slam
    // morale by -30. Positive swings remain uncapped.
    const moraleDelta = moraleDeltaRaw < -8 ? -8 : moraleDeltaRaw;
    let newMorale = Math.floor(state.morale + moraleDelta);
    newMorale = Math.max(0, Math.min(100, newMorale));

    // BL-39: passive morale recovery for stable empires
    if (
        state.population >= state.housing * 0.8 &&
        newHappiness >= 60 &&
        state.troops > 0 &&
        newMorale < 80
    ) {
        newMorale = Math.min(80, newMorale + 3);
    }

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

    // Worship cooldowns decay
    const newWorshipCooldowns: Record<string, number> = {};
    if (state.worshipCooldowns) {
        for (const [actionId, cooldown] of Object.entries(state.worshipCooldowns)) {
            if (cooldown > 1) {
                newWorshipCooldowns[actionId] = cooldown - 1;
            }
        }
    }

    // BL-10: Rally Troops cooldown decay
    const newRallyTroopsCooldown = Math.max(0, (state.rallyTroopsCooldown ?? 0) - 1);

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
    // BL-41 passive piety: +1/season when a patron god is set (capped via clamp below)
    if (state.patronGod) {
        newPiety = Math.min(100, newPiety + 1);
    }
    let newHousing = state.housing;
    const newCapacity = { ...state.capacity };
    for (const achievement of achievementsUnlocked) {
        if (achievement.reward.denarii) newDenarii += achievement.reward.denarii;
        if (achievement.reward.happiness) newHappiness = Math.min(100, newHappiness + achievement.reward.happiness);
        if (achievement.reward.morale) newMorale = Math.min(100, newMorale + achievement.reward.morale);
        if (achievement.reward.reputation) newReputation += achievement.reward.reputation;
        if (achievement.reward.supplies) newSupplies += achievement.reward.supplies;
        if (achievement.reward.piety) newPiety += achievement.reward.piety;
        if (achievement.reward.housing) newHousing += achievement.reward.housing;
        if (achievement.reward.capacity) {
            for (const res of Object.keys(newCapacity) as Array<keyof typeof newCapacity>) {
                newCapacity[res] += achievement.reward.capacity;
            }
        }
        events.push(`[Achievement] Achievement unlocked: ${achievement.name}!`);
    }

    // Update quest progress and apply rewards
    const updatedQuests = state.quests.map(q => {
        if (!q.active || q.completed) return q;
        const progress = checkQuestProgress(state, q);
        const completed = progress >= q.target;
        if (completed) {
            events.push(`[Quest] Quest completed: ${q.title}`);
            // Apply quest rewards
            if (q.reward.denarii) newDenarii += q.reward.denarii;
            if (q.reward.reputation) newReputation += q.reward.reputation;
        }
        return { ...q, progress, completed };
    });

    // Minerva tier 50: +1 free tech every 3 rounds (buffed from every 5)
    // Minerva favor >= 75: grants +2 free techs per trigger instead of +1
    let newTechnologies = state.technologies;
    const minervaFreeTech = calculateBlessingBonus(state.patronGod, state.godFavor, 'freeTech');
    if (minervaFreeTech > 0 && newRound % 3 === 0 && newRound > 0) {
        const unresearchedTechs = newTechnologies.filter(t => !t.researched);
        if (unresearchedTechs.length > 0) {
            // At Minerva favor >= 75, grant 2 techs instead of 1
            const minervaFavor = state.patronGod === 'minerva' ? (state.godFavor.minerva ?? 0) : 0;
            const techsToGrant = minervaFavor >= 75 ? 2 : 1;

            for (let i = 0; i < techsToGrant && i < unresearchedTechs.length; i++) {
                const randomTech = unresearchedTechs[i];
                newTechnologies = newTechnologies.map(t =>
                    t.id === randomTech.id ? { ...t, researched: true } : t
                );
                events.push(`[Minerva] Minerva grants wisdom! Free technology: ${randomTech.name}`);
            }
        }
    }

    // Venus tier 100: +50 favor with all gods per season
    // Minerva tier 100: +20 favor with patron god per season
    const newGodFavor = { ...state.godFavor };

    // Apply achievement favor rewards (e.g. undefeated: +25, infinite_founder: +50)
    if (state.patronGod) {
        for (const achievement of achievementsUnlocked) {
            if (achievement.reward.favor) {
                newGodFavor[state.patronGod] = Math.min(100, (newGodFavor[state.patronGod] || 0) + achievement.reward.favor);
            }
        }
    }
    const venusAllFavorBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'allFavor');
    if (venusAllFavorBonus > 0) {
        const godNames: Array<'jupiter' | 'mars' | 'venus' | 'ceres' | 'mercury' | 'minerva'> =
            ['jupiter', 'mars', 'venus', 'ceres', 'mercury', 'minerva'];
        for (const god of godNames) {
            newGodFavor[god] = Math.min(100, (newGodFavor[god] || 0) + venusAllFavorBonus);
        }
        events.push(`[Venus] Venus blesses all gods! +${venusAllFavorBonus} favor with each god`);
    }

    const minervaFavorBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'favor');
    if (minervaFavorBonus > 0 && state.patronGod) {
        newGodFavor[state.patronGod] = Math.min(100, (newGodFavor[state.patronGod] || 0) + minervaFavorBonus);
        events.push(`[Minerva] Minerva's wisdom strengthens your devotion! +${minervaFavorBonus} favor`);
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
            events.push(`[Map] New territory discovered: ${fullTerritory.name}`);
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
            events.push(`[Senate] ${msg}`);
        }

        // Check for assassination
        if (senateResult.assassination?.triggered && !senateResult.assassination.savedBySertorius) {
            isAssassinated = true;
            events.push(`[Combat] ASSASSINATION: ${senateResult.assassination.method}`);
        }
    }

    // BL-11: Reputation milestone crossings — surface to log and remember so each fires once.
    const finalReputation = Math.max(0, Math.min(100, newReputation + eventReputation));
    const alreadyReached = state.reputationMilestonesReached ?? [];
    const newMilestonesReached = [...alreadyReached];
    for (const m of REPUTATION_MILESTONES) {
        if (finalReputation >= m.threshold && !alreadyReached.includes(m.threshold)) {
            const pricePct = Math.round((m.bonus.tradePrices ?? 0) * 100);
            const tariffPct = Math.round((m.bonus.tariffReduction ?? 0) * 100);
            const parts: string[] = [];
            if (pricePct > 0) parts.push(`+${pricePct}% trade prices`);
            if (tariffPct > 0) parts.push(`−${tariffPct}% tariff`);
            events.push(
                `[milestone] Reputation ${m.threshold} reached — ${m.name} (${parts.join(' / ') || 'recognition'})`
            );
            newMilestonesReached.push(m.threshold);
        }
    }

    // Record history
    const historyEntry = {
        round: newRound,
        season: nextSeason,
        denarii: newDenarii,
        population: newPopulation,
        troops: state.troops,
        morale: newMorale,
        supplies: newSupplies,
        territories: newTerritories.filter(t => t.owned).length,
        events,
    };

    // Build total additional income BEFORE treasury history so chart data is accurate
    const totalAdditionalIncome = prosperityIncome + caravanIncome + tradeRouteIncome + wonderEffects.income + wonderRecurringIncome + eventDenarii;

    // BL-50: Surface unexplained denarii drops (net change <= -100) with the 2 largest known cost lines.
    const finalDenarii = Math.max(0, newDenarii + totalAdditionalIncome);
    const netDenariiDelta = finalDenarii - state.denarii;
    if (netDenariiDelta <= -100) {
        const causes: { label: string; cost: number }[] = [];
        if (newDenariiAdjustment_emergency < 0) {
            causes.push({ label: 'emergency grain import', cost: -newDenariiAdjustment_emergency });
        }
        if (effectiveNetIncome < 0) {
            causes.push({ label: 'upkeep deficit', cost: -effectiveNetIncome });
        }
        if (senateResult && senateResult.denariiChange < 0) {
            causes.push({ label: 'senate event', cost: -senateResult.denariiChange });
        }
        if (eventDenarii < 0) {
            causes.push({ label: 'random event', cost: -eventDenarii });
        }
        const top = causes.sort((a, b) => b.cost - a.cost).slice(0, 2);
        if (top.length > 0) {
            const detail = top.map(c => `${c.label} -${c.cost}d`).join(', ');
            events.push(`[treasury] Net -${Math.abs(netDenariiDelta)} denarii — largest costs: ${detail}`);
        } else {
            events.push(`[treasury] Net -${Math.abs(netDenariiDelta)} denarii this season — check Economy tab.`);
        }
    }

    // Record treasury history for charts (uses final denarii including all income sources)
    const treasuryEntry: TreasuryHistoryEntry = {
        round: newRound,
        season: nextSeason,
        denarii: Math.max(0, newDenarii + totalAdditionalIncome),
        income: summary.income,
        upkeep: summary.upkeep,
        netIncome: summary.netIncome,
    };
    const newState: Partial<GameState> = {
        season: nextSeason,
        round: newRound,
        inventory: newInventory,
        denarii: Math.max(0, newDenarii + totalAdditionalIncome),
        // BL-42: apply final housing-cap clamp AFTER events so event pop cannot
        // push us past housing (eliminates the 150→159 oscillation).
        population: Math.max(0, Math.min(newPopulation + eventPopulation, newHousing)),
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
        reputation: Math.max(0, Math.min(100, newReputation + eventReputation)),
        // BL-11: persist crossed milestone thresholds so each fires exactly once.
        reputationMilestonesReached: newMilestonesReached,
        supplies: newSupplies,
        piety: Math.max(0, Math.min(100, newPiety + wonderEffects.piety + eventPiety)),
        sanitation: Math.max(0, Math.min(100, state.sanitation + wonderEffects.sanitation)),
        housing: newHousing,
        capacity: newCapacity,
        market: {
            ...state.market,
            prices,
            demandIndices: demand,
            // Track price history for market charts (keep last 10 entries)
            priceHistory: [
                ...(state.market.priceHistory || []),
                { round: newRound, season: nextSeason, prices: { ...prices } }
            ].slice(-10),
        },
        tradeState: newTradeState,
        diplomacy: {
            ...state.diplomacy,
            relations: newRelations,
            activeEnvoys: Math.max(0, state.diplomacy.activeEnvoys - 1),
        },
        emergencyCooldowns: newEmergencyCooldowns,
        worshipCooldowns: newWorshipCooldowns,
        rallyTroopsCooldown: newRallyTroopsCooldown,
        eventCooldowns: newEventCooldowns,
        farmTutorialShown: newFarmTutorialShown,
        housingCapNudgeShown: newHousingCapNudgeShown,
        insulaeNudgeShown: newInsulaeNudgeShown,
        // BL-49: Preserve spending-nudge cooldown across seasons.
        ...(newSpendingNudgeLastRound !== undefined ? { spendingNudgeLastRound: newSpendingNudgeLastRound } : {}),
        // BL-40: Preserve emergency-import cooldown so it respects the 4-round cadence.
        ...(newLastEmergencyImportRound !== undefined ? { lastEmergencyImportRound: newLastEmergencyImportRound } : {}),
        // BL-33: Itemized breakdown for Treasury deficit tooltip
        lastSeasonIncome: calculateIncomeBreakdown(state),
        lastSeasonExpense: calculateExpenseBreakdown(state),
        lastDeficitWarnRound: newLastDeficitWarnRound,
        lastLowGrainWarnRound: newLastLowGrainWarnRound,
        history: [...state.history, historyEntry],
        treasuryHistory: [...(state.treasuryHistory || []), treasuryEntry].slice(-50), // Keep last 50 entries
        // BUG-001 FIX: Always preserve senate state to prevent accidental resets
        // If senate processing occurred, use the new state; otherwise preserve existing
        senate: senateResult ? senateResult.newSenateState : state.senate,
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
        events.push(`[Victory] Victory: ${victoryResult.title}`);
    }
    if (failureResult) {
        newState.stage = 'results';
        events.push(`[Defeat] Defeat: ${failureResult.title}`);
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

    // BL-11: Reputation milestone stacking (additive with Mercury).
    // tariffReduction is applied as a positive number, same shape as focus reduction.
    const repTradeBonus = getReputationTradeBonus(state.reputation);

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
    // Clamp cumulative tariff reduction from territory focuses to prevent inversion
    focusTariffReduction = Math.min(0.80, focusTariffReduction);

    let tariffMod = 1 - city.tariff * (1 + mercuryTariffBonus - focusTariffReduction - repTradeBonus.tariffReduction); // mercuryTariffBonus is negative (-0.20)
    // Clamp tariffMod: cannot invert to revenue bonus, cannot exceed 100% reduction
    tariffMod = Math.max(0, Math.min(1, tariffMod));

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
    // BL-11: stack reputation-milestone trade-price bonus additively.
    const denariiGained = Math.floor(basePrice * amount * cityBonus * founderBonus * techBonus * tariffMod * (1 + mercuryPriceBonus + focusTradePriceBonus + repTradeBonus.tradePrices));

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
    // No canonical diplomacy blessing exists in BLESSING_EFFECTS - envoy success
    // is based on reputation and current relation only
    const successChance = calculateEnvoySuccess(state.reputation, currentRelation);
    const succeeded = random() < successChance;
    const relationChange = calculateEnvoyEffect(succeeded, state.reputation);

    const newRelationValue = Math.max(0, Math.min(100, currentRelation + relationChange));

    const newRelations = {
        ...state.diplomacy.relations,
        [factionId]: newRelationValue,
    };

    // Create history entry for tracking
    const historyEntry: DiplomacyHistoryEntry = {
        season: state.round, // Using round as a proxy for time
        round: state.round,
        factionId: factionId,
        previousValue: currentRelation,
        newValue: newRelationValue,
        delta: relationChange,
        cause: succeeded ? 'envoy_success' : 'envoy_failure',
        description: succeeded
            ? `Envoy improved relations (+${relationChange})`
            : `Envoy failed to improve relations (${relationChange})`,
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
                relationHistory: [...(state.diplomacy.relationHistory || []), historyEntry],
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
