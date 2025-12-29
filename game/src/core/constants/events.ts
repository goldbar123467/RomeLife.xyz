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
        icon: '🌾',
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
        icon: '💰',
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
        icon: '✨',
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
        icon: '👥',
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
        icon: '🦅',
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
        icon: '🐫',
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
        icon: '🏴',
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
        icon: '🗡️',
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
        icon: '🥀',
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
        icon: '🔥',
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
        icon: '😠',
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
        icon: '🏃',
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
        icon: '🏛️',
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
        icon: '📜',
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
        icon: '⚔️',
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
        icon: '📊',
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

// Event roll function
export function rollRandomEvent(round: number, happiness: number, morale: number): GameEvent | null {
    // Base chance: 25% per season
    const baseChance = 0.25;

    // Roll for event occurrence
    if (Math.random() > baseChance) {
        return null; // No event this season
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

    // Select event pool
    let eventPool: GameEvent[];
    if (categoryRoll > 0.6) {
        eventPool = POSITIVE_EVENTS;
    } else if (categoryRoll < 0.35) {
        eventPool = NEGATIVE_EVENTS;
    } else {
        eventPool = NEUTRAL_EVENTS;
    }

    // Select random event from pool based on individual probabilities
    const totalProbability = eventPool.reduce((sum, e) => sum + e.probability, 0);
    let roll = Math.random() * totalProbability;

    for (const event of eventPool) {
        roll -= event.probability;
        if (roll <= 0) {
            return event;
        }
    }

    // Fallback to first event in pool
    return eventPool[0];
}
