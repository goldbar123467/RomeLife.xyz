// ============================================
// ROME EMPIRE BUILDER - Economic Events System
// ============================================
// Random economic events that affect market prices and trade conditions.

import type { ResourceType, Season, GameState } from '@/core/types';
import { ECONOMIC_EVENTS, type EconomicEvent } from './constants';

// === TYPES ===

export interface ActiveEconomicEvent {
    event: EconomicEvent;
    remainingDuration: number;      // Seasons left
    startRound: number;
    isActive: boolean;
}

export interface EconomicEventState {
    activeEvents: ActiveEconomicEvent[];
    eventHistory: {
        eventId: string;
        startRound: number;
        endRound: number;
    }[];
    cooldowns: Record<string, number>;  // Event ID -> rounds until available
}

export interface AggregatedEventEffects {
    priceModifiers: Record<ResourceType, number>;
    tradeTariffMod: number;
    tradeRiskMod: number;
    treasuryBonus: number;
    inflationChange: number;
}

// === EVENT COOLDOWN ===

const EVENT_COOLDOWN_ROUNDS = 4; // Prevent same event from repeating too soon

// === CORE FUNCTIONS ===

/**
 * Roll for a new economic event.
 * Checks conditions and probabilities.
 */
export function rollEconomicEvent(
    state: GameState,
    currentEventState: EconomicEventState,
    currentSeason: Season
): EconomicEvent | null {
    // Shuffle events for randomness
    const shuffledEvents = [...ECONOMIC_EVENTS].sort(() => Math.random() - 0.5);

    for (const event of shuffledEvents) {
        // Check cooldown
        if (currentEventState.cooldowns[event.id] > 0) {
            continue;
        }

        // Check if already active
        if (currentEventState.activeEvents.some(e => e.event.id === event.id && e.isActive)) {
            continue;
        }

        // Check conditions
        if (!checkEventConditions(event, state, currentSeason)) {
            continue;
        }

        // Roll for probability
        if (Math.random() <= event.probability) {
            return event;
        }
    }

    return null;
}

/**
 * Check if event conditions are met.
 */
function checkEventConditions(
    event: EconomicEvent,
    state: GameState,
    currentSeason: Season
): boolean {
    const conditions = event.conditions;

    if (!conditions) return true;

    if (conditions.minRound && state.round < conditions.minRound) {
        return false;
    }

    if (conditions.season && conditions.season !== currentSeason) {
        return false;
    }

    if (conditions.requiresCoastal) {
        // Check if player owns a coastal territory
        const hasCoastal = state.territories.some(
            t => t.owned && (t.id === 'ostia' || t.id === 'antium')
        );
        if (!hasCoastal) return false;
    }

    if (conditions.requiresMilitaryVictory) {
        if (state.totalConquests < 1) return false;
    }

    return true;
}

/**
 * Activate a new economic event.
 */
export function activateEconomicEvent(
    event: EconomicEvent,
    currentRound: number,
    currentState: EconomicEventState
): EconomicEventState {
    const activeEvent: ActiveEconomicEvent = {
        event,
        remainingDuration: event.duration,
        startRound: currentRound,
        isActive: true,
    };

    return {
        ...currentState,
        activeEvents: [...currentState.activeEvents, activeEvent],
    };
}

/**
 * Process economic events at end of season.
 * Decrements durations, deactivates expired events, updates cooldowns.
 */
export function processEconomicEvents(
    currentState: EconomicEventState,
    currentRound: number
): {
    newState: EconomicEventState;
    expiredEvents: EconomicEvent[];
    messages: string[];
} {
    const messages: string[] = [];
    const expiredEvents: EconomicEvent[] = [];

    // Process active events
    const updatedActiveEvents = currentState.activeEvents.map(active => {
        if (!active.isActive) return active;

        const newDuration = active.remainingDuration - 1;

        if (newDuration <= 0) {
            expiredEvents.push(active.event);
            messages.push(`${active.event.name} has ended.`);

            return {
                ...active,
                remainingDuration: 0,
                isActive: false,
            };
        }

        return {
            ...active,
            remainingDuration: newDuration,
        };
    });

    // Update cooldowns
    const updatedCooldowns: Record<string, number> = {};
    for (const [eventId, cooldown] of Object.entries(currentState.cooldowns)) {
        if (cooldown > 1) {
            updatedCooldowns[eventId] = cooldown - 1;
        }
    }

    // Add cooldowns for expired events
    for (const event of expiredEvents) {
        updatedCooldowns[event.id] = EVENT_COOLDOWN_ROUNDS;
    }

    // Update history
    const updatedHistory = [
        ...currentState.eventHistory,
        ...expiredEvents.map(event => ({
            eventId: event.id,
            startRound: currentState.activeEvents.find(
                a => a.event.id === event.id
            )?.startRound ?? currentRound,
            endRound: currentRound,
        })),
    ];

    return {
        newState: {
            activeEvents: updatedActiveEvents.filter(e => e.isActive),
            eventHistory: updatedHistory,
            cooldowns: updatedCooldowns,
        },
        expiredEvents,
        messages,
    };
}

/**
 * Calculate aggregated effects from all active economic events.
 */
export function getAggregatedEventEffects(
    eventState: EconomicEventState
): AggregatedEventEffects {
    const aggregated: AggregatedEventEffects = {
        priceModifiers: {} as Record<ResourceType, number>,
        tradeTariffMod: 0,
        tradeRiskMod: 0,
        treasuryBonus: 0,
        inflationChange: 0,
    };

    // Initialize all resources to 1.0 (no modification)
    const resourceTypes: ResourceType[] = [
        'grain', 'iron', 'timber', 'stone', 'clay',
        'wool', 'salt', 'livestock', 'wine', 'olive_oil', 'spices'
    ];
    for (const resource of resourceTypes) {
        aggregated.priceModifiers[resource] = 1.0;
    }

    // Aggregate effects from all active events
    for (const active of eventState.activeEvents) {
        if (!active.isActive) continue;

        const effects = active.event.effects;

        // Price modifiers are multiplicative
        if (effects.priceModifiers) {
            for (const [resource, modifier] of Object.entries(effects.priceModifiers)) {
                const res = resource as ResourceType;
                aggregated.priceModifiers[res] *= modifier;
            }
        }

        // Other modifiers are additive
        if (effects.tradeTariffMod) {
            aggregated.tradeTariffMod += effects.tradeTariffMod;
        }
        if (effects.tradeRiskMod) {
            aggregated.tradeRiskMod += effects.tradeRiskMod;
        }
        if (effects.treasuryBonus) {
            aggregated.treasuryBonus += effects.treasuryBonus;
        }
        if (effects.inflationChange) {
            aggregated.inflationChange += effects.inflationChange;
        }
    }

    return aggregated;
}

/**
 * Apply event effects to a base price.
 */
export function applyEventEffectsToPrice(
    basePrice: number,
    resource: ResourceType,
    eventState: EconomicEventState
): number {
    const effects = getAggregatedEventEffects(eventState);
    const modifier = effects.priceModifiers[resource] || 1.0;

    return Math.round(basePrice * modifier);
}

/**
 * Get list of currently active events for UI display.
 */
export function getActiveEventsSummary(
    eventState: EconomicEventState
): {
    id: string;
    name: string;
    description: string;
    icon: string;
    remainingSeasons: number;
    category: string;
    effects: string[];
}[] {
    return eventState.activeEvents
        .filter(e => e.isActive)
        .map(active => {
            const effects: string[] = [];
            const eventEffects = active.event.effects;

            if (eventEffects.priceModifiers) {
                for (const [resource, modifier] of Object.entries(eventEffects.priceModifiers)) {
                    const change = Math.round((modifier - 1) * 100);
                    const sign = change >= 0 ? '+' : '';
                    effects.push(`${resource}: ${sign}${change}%`);
                }
            }
            if (eventEffects.tradeTariffMod) {
                const change = Math.round(eventEffects.tradeTariffMod * 100);
                effects.push(`Tariffs: +${change}%`);
            }
            if (eventEffects.tradeRiskMod) {
                const change = Math.round(eventEffects.tradeRiskMod * 100);
                effects.push(`Trade Risk: +${change}%`);
            }
            if (eventEffects.treasuryBonus) {
                effects.push(`Treasury: +${eventEffects.treasuryBonus} denarii`);
            }
            if (eventEffects.inflationChange) {
                const change = Math.round(eventEffects.inflationChange * 100);
                effects.push(`Inflation: +${change}%`);
            }

            return {
                id: active.event.id,
                name: active.event.name,
                description: active.event.description,
                icon: active.event.icon,
                remainingSeasons: active.remainingDuration,
                category: active.event.category,
                effects,
            };
        });
}

/**
 * Create initial economic event state.
 */
export function createInitialEconomicEventState(): EconomicEventState {
    return {
        activeEvents: [],
        eventHistory: [],
        cooldowns: {},
    };
}

/**
 * Get event by ID.
 */
export function getEconomicEventById(eventId: string): EconomicEvent | undefined {
    return ECONOMIC_EVENTS.find(e => e.id === eventId);
}

/**
 * Get all events in a category.
 */
export function getEventsByCategory(
    category: 'supply_shock' | 'demand_shock' | 'trade_disruption' | 'windfall'
): EconomicEvent[] {
    return ECONOMIC_EVENTS.filter(e => e.category === category);
}

/**
 * Force trigger an event (for testing/debug).
 */
export function forceActivateEvent(
    eventId: string,
    currentRound: number,
    currentState: EconomicEventState
): EconomicEventState | null {
    const event = getEconomicEventById(eventId);
    if (!event) return null;

    return activateEconomicEvent(event, currentRound, currentState);
}
