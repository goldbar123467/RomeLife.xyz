// ============================================
// ROME EMPIRE BUILDER - Random Events
// ============================================

import type { ResourceType } from '../types';

export interface GameEvent {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'positive' | 'negative' | 'neutral';
    probability: number; // Base probability (0-1)
    effects: GameEventEffect[];
}

export interface GameEventEffect {
    type: 'denarii' | 'population' | 'happiness' | 'morale' | 'troops' | 'piety' | 'reputation' | 'resource';
    value: number;
    resource?: ResourceType; // Only for resource type effects
}

// === POSITIVE EVENTS (6) ===
export const POSITIVE_EVENTS: GameEvent[] = [
    {
        id: 'bountiful_harvest',
        name: 'Bountiful Harvest',
        description: 'The gods have blessed our fields! Granaries overflow with wheat.',
        icon: 'wheat',
        category: 'positive',
        probability: 0.15,
        effects: [
            { type: 'resource', value: 25, resource: 'grain' },
            { type: 'happiness', value: 5 },
        ],
    },
    {
        id: 'trade_windfall',
        name: 'Trade Windfall',
        description: 'A wealthy merchant caravan passes through, eager to trade at premium prices.',
        icon: 'coins',
        category: 'positive',
        probability: 0.12,
        effects: [
            { type: 'denarii', value: 300 },
            { type: 'reputation', value: 3 },
        ],
    },
    {
        id: 'divine_blessing',
        name: 'Divine Blessing',
        description: 'The priests report favorable omens! The gods smile upon Rome.',
        icon: 'sparkles',
        category: 'positive',
        probability: 0.10,
        effects: [
            { type: 'piety', value: 15 },
            { type: 'happiness', value: 8 },
            { type: 'morale', value: 5 },
        ],
    },
    {
        id: 'population_boom',
        name: 'Population Boom',
        description: 'Refugees from distant lands seek the safety of Rome\'s walls.',
        icon: 'users',
        category: 'positive',
        probability: 0.10,
        effects: [
            { type: 'population', value: 15 },
            { type: 'happiness', value: -2 }, // Slight strain on resources
        ],
    },
    {
        id: 'good_omens',
        name: 'Good Omens',
        description: 'The augurs report excellent omens for military ventures.',
        icon: 'bird',
        category: 'positive',
        probability: 0.12,
        effects: [
            { type: 'morale', value: 12 },
            { type: 'troops', value: 5 },
        ],
    },
    {
        id: 'merchant_caravan',
        name: 'Merchant Caravan',
        description: 'A foreign caravan arrives bearing exotic goods and news from distant lands.',
        icon: 'truck',
        category: 'positive',
        probability: 0.12,
        effects: [
            { type: 'resource', value: 5, resource: 'spices' },
            { type: 'resource', value: 3, resource: 'wine' },
            { type: 'denarii', value: 100 },
        ],
    },
];

// === NEGATIVE EVENTS (6) ===
export const NEGATIVE_EVENTS: GameEvent[] = [
    {
        id: 'plague_outbreak',
        name: 'Plague Outbreak',
        description: 'Disease spreads through the city! Healers work tirelessly to contain it.',
        icon: 'skull',
        category: 'negative',
        probability: 0.08,
        effects: [
            { type: 'population', value: -12 },
            { type: 'happiness', value: -15 },
            { type: 'morale', value: -10 },
        ],
    },
    {
        id: 'bandit_raid',
        name: 'Bandit Raid',
        description: 'Bandits attack our supply caravans on the roads!',
        icon: 'sword',
        category: 'negative',
        probability: 0.12,
        effects: [
            { type: 'denarii', value: -150 },
            { type: 'resource', value: -10, resource: 'grain' },
        ],
    },
    {
        id: 'crop_failure',
        name: 'Crop Failure',
        description: 'Drought withers the fields. The harvest is meager this season.',
        icon: 'flower',
        category: 'negative',
        probability: 0.10,
        effects: [
            { type: 'resource', value: -15, resource: 'grain' },
            { type: 'happiness', value: -8 },
        ],
    },
    {
        id: 'fire_outbreak',
        name: 'Fire Outbreak',
        description: 'A terrible fire breaks out in the city! Buildings burn.',
        icon: 'flame',
        category: 'negative',
        probability: 0.08,
        effects: [
            { type: 'denarii', value: -200 },
            { type: 'population', value: -5 },
            { type: 'happiness', value: -10 },
        ],
    },
    {
        id: 'tax_revolt',
        name: 'Tax Revolt',
        description: 'Citizens protest heavy taxation! Unrest spreads through the districts.',
        icon: 'frown',
        category: 'negative',
        probability: 0.10,
        effects: [
            { type: 'happiness', value: -12 },
            { type: 'denarii', value: -100 },
            { type: 'reputation', value: -5 },
        ],
    },
    {
        id: 'desertion',
        name: 'Military Desertion',
        description: 'Soldiers desert their posts, seeking fortune elsewhere.',
        icon: 'footprints',
        category: 'negative',
        probability: 0.10,
        effects: [
            { type: 'troops', value: -8 },
            { type: 'morale', value: -10 },
        ],
    },
];

// === NEUTRAL EVENTS (4) ===
export const NEUTRAL_EVENTS: GameEvent[] = [
    {
        id: 'senate_debate',
        name: 'Senate Debate',
        description: 'The Senate debates policy changes. Factions vie for influence.',
        icon: 'landmark',
        category: 'neutral',
        probability: 0.15,
        effects: [
            { type: 'reputation', value: 2 },
            { type: 'denarii', value: -50 }, // Political expenses
        ],
    },
    {
        id: 'foreign_emissary',
        name: 'Foreign Emissary',
        description: 'Diplomats from distant lands seek audience with Rome.',
        icon: 'scroll-text',
        category: 'neutral',
        probability: 0.12,
        effects: [
            { type: 'reputation', value: 5 },
            { type: 'denarii', value: -75 }, // Diplomatic gifts
        ],
    },
    {
        id: 'religious_schism',
        name: 'Religious Schism',
        description: 'Priests argue over proper rituals. The temples are in disarray.',
        icon: 'swords',
        category: 'neutral',
        probability: 0.10,
        effects: [
            { type: 'piety', value: -5 },
            { type: 'happiness', value: -3 },
            { type: 'reputation', value: 2 },
        ],
    },
    {
        id: 'market_fluctuation',
        name: 'Market Fluctuation',
        description: 'Trade prices shift dramatically as merchants adjust to new conditions.',
        icon: 'bar-chart',
        category: 'neutral',
        probability: 0.15,
        effects: [
            { type: 'denarii', value: 50 }, // Slight gain from volatility
        ],
    },
];

// Combined events array
export const ALL_EVENTS: GameEvent[] = [
    ...POSITIVE_EVENTS,
    ...NEGATIVE_EVENTS,
    ...NEUTRAL_EVENTS,
];

// === EVENT CONDITIONS INTERFACE ===
export interface EventConditions {
    sanitation: number;
    morale: number;
    taxRate: number;
    happiness: number;
    troops: number;
    population: number;
}

// === EVENT SCALING ===
// Returns a multiplier for event effects based on game stage
export function getEventScaling(round: number): number {
    // Early game (1-8): 60% effects - less punishing while learning
    if (round <= 8) return 0.6;
    // Mid game (9-20): 80% effects - ramping up
    if (round <= 20) return 0.8;
    // Late game (21+): 100-130% effects - keeps events impactful
    return 1.0 + Math.min(0.3, (round - 20) * 0.02);
}

// === CONDITIONAL PROBABILITY MODIFIERS ===
// Adjusts individual event probability based on game state
function getConditionalModifier(eventId: string, conditions?: EventConditions): number {
    if (!conditions) return 1.0;

    switch (eventId) {
        // Negative events with conditional triggers
        case 'plague_outbreak':
            // +50% chance if sanitation < 30, -30% if sanitation > 60
            if (conditions.sanitation < 30) return 1.5;
            if (conditions.sanitation > 60) return 0.7;
            return 1.0;

        case 'fire_outbreak':
            // +30% chance if population > 200 (crowding)
            if (conditions.population > 200) return 1.3;
            return 1.0;

        case 'desertion':
            // +100% chance if morale < 30, blocked if morale > 70
            if (conditions.morale < 30) return 2.0;
            if (conditions.morale > 70) return 0;
            return 1.0;

        case 'tax_revolt':
            // +50% chance if taxRate > 25%, blocked if taxRate < 10%
            if (conditions.taxRate > 0.25) return 1.5;
            if (conditions.taxRate < 0.10) return 0;
            return 1.0;

        case 'crop_failure':
            // More likely in bad times (low happiness = stressed farmers)
            if (conditions.happiness < 40) return 1.3;
            return 1.0;

        // Positive events with conditional triggers
        case 'population_boom':
            // +50% chance if happiness > 80
            if (conditions.happiness > 80) return 1.5;
            if (conditions.happiness < 50) return 0.5;
            return 1.0;

        case 'good_omens':
            // More likely when morale is already decent
            if (conditions.morale > 60) return 1.3;
            return 1.0;

        case 'bountiful_harvest':
            // Less likely if population is struggling
            if (conditions.happiness < 40) return 0.7;
            return 1.0;

        default:
            return 1.0;
    }
}

// === GRACE PERIOD CONSTANT ===
export const EVENT_GRACE_PERIOD_ROUNDS = 4; // First year (4 rounds) protected from negative events
export const EVENT_COOLDOWN_ROUNDS = 4; // Same event can't repeat for 4 rounds

// === MAIN EVENT ROLL FUNCTION ===
export interface RollEventResult {
    event: GameEvent | null;
    scaledEffects: GameEventEffect[] | null;
}

export function rollRandomEvent(
    round: number,
    happiness: number,
    morale: number,
    conditions?: EventConditions,
    cooldowns?: Record<string, number>
): RollEventResult {
    // === GRACE PERIOD ===
    const inGracePeriod = round <= EVENT_GRACE_PERIOD_ROUNDS;

    // Base chance: 25% per season, reduced to 15% during grace period
    const baseChance = inGracePeriod ? 0.15 : 0.25;

    // Roll for event occurrence
    if (Math.random() > baseChance) {
        return { event: null, scaledEffects: null };
    }

    // Determine event category based on game state
    let categoryRoll = Math.random();

    // Bad conditions increase negative event chance
    if (happiness < 40 || morale < 40) {
        categoryRoll -= 0.15; // Shift toward negative
    }

    // Good conditions increase positive event chance
    if (happiness > 70 && morale > 70) {
        categoryRoll += 0.10; // Shift toward positive
    }

    // === SELECT EVENT POOL ===
    let eventPool: GameEvent[];

    if (inGracePeriod) {
        // During grace period, only positive and neutral events
        if (categoryRoll > 0.5) {
            eventPool = POSITIVE_EVENTS;
        } else {
            eventPool = NEUTRAL_EVENTS;
        }
    } else {
        // Normal event selection
        if (categoryRoll > 0.6) {
            eventPool = POSITIVE_EVENTS;
        } else if (categoryRoll < 0.35) {
            eventPool = NEGATIVE_EVENTS;
        } else {
            eventPool = NEUTRAL_EVENTS;
        }
    }

    // === FILTER BY COOLDOWNS ===
    let availableEvents = eventPool;
    if (cooldowns) {
        availableEvents = eventPool.filter(e => !cooldowns[e.id] || cooldowns[e.id] <= 0);
    }

    // If all events on cooldown, return null
    if (availableEvents.length === 0) {
        return { event: null, scaledEffects: null };
    }

    // === APPLY CONDITIONAL MODIFIERS TO PROBABILITIES ===
    const modifiedEvents = availableEvents.map(e => ({
        ...e,
        adjustedProbability: e.probability * getConditionalModifier(e.id, conditions)
    }));

    // Filter out events with 0 probability (blocked by conditions)
    const finalEvents = modifiedEvents.filter(e => e.adjustedProbability > 0);

    if (finalEvents.length === 0) {
        return { event: null, scaledEffects: null };
    }

    // === SELECT EVENT BASED ON ADJUSTED PROBABILITIES ===
    const totalProbability = finalEvents.reduce((sum, e) => sum + e.adjustedProbability, 0);
    let roll = Math.random() * totalProbability;

    let selectedEvent: GameEvent | null = null;
    for (const event of finalEvents) {
        roll -= event.adjustedProbability;
        if (roll <= 0) {
            selectedEvent = event;
            break;
        }
    }

    // Fallback to first event in pool
    if (!selectedEvent) {
        selectedEvent = finalEvents[0];
    }

    // === SCALE EFFECTS ===
    const scaling = getEventScaling(round);
    const scaledEffects: GameEventEffect[] = selectedEvent.effects.map(effect => {
        // Scale numeric effects (denarii, population, troops)
        // Don't scale percentage-based effects (happiness, morale) as heavily
        const scaleThis = ['denarii', 'population', 'troops', 'resource'].includes(effect.type);
        return {
            ...effect,
            value: scaleThis ? Math.floor(effect.value * scaling) : effect.value
        };
    });

    return {
        event: selectedEvent,
        scaledEffects
    };
}
