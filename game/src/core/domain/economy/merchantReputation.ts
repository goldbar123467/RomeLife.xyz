// ============================================
// ROME EMPIRE BUILDER - Merchant Reputation System
// ============================================
// Tracks player reputation with each trade city.
// Higher reputation unlocks better prices and special offers.

import type { ResourceType } from '@/core/types';
import {
    REPUTATION_TIERS,
    REPUTATION_CHANGES,
    type ReputationLevel,
    type ReputationTier,
} from './constants';

// === TYPES ===

export interface MerchantReputation {
    cityId: string;
    reputation: number;             // -100 to 100
    level: ReputationLevel;
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
    lastTradeRound: number;
    specialOffersReceived: number;
    dealsHonored: number;
    dealsBroken: number;
}

export interface ReputationAction {
    type: 'trade' | 'caravan' | 'route' | 'deal' | 'tribute' | 'crisis' | 'decay';
    success: boolean;
    quantity?: number;              // For large trade bonus
    isCrisis?: boolean;             // For fair crisis trade bonus
    isFairPriced?: boolean;         // For crisis trade at fair prices
}

export interface ReputationEffect {
    sellPriceModifier: number;      // Applied to sell prices
    buyPriceModifier: number;       // Applied to buy prices
    specialOfferChance: number;     // Chance for special deals
    creditLimit: number;            // Max credit allowed
    availableGoods: ResourceType[]; // Some goods locked by reputation
}

export interface SpecialOffer {
    id: string;
    cityId: string;
    resource: ResourceType;
    quantity: number;
    discount: number;               // 0.1 = 10% discount
    expiresInRounds: number;
    reason: string;
}

// === CORE FUNCTIONS ===

/**
 * Get reputation tier data for a given reputation value.
 */
export function getReputationTier(reputation: number): ReputationTier {
    // Clamp reputation to valid range
    const clampedRep = Math.max(-100, Math.min(100, reputation));

    for (const tier of REPUTATION_TIERS) {
        if (clampedRep >= tier.minReputation && clampedRep <= tier.maxReputation) {
            return tier;
        }
    }

    // Default to neutral
    return REPUTATION_TIERS.find(t => t.level === 'neutral') || REPUTATION_TIERS[2];
}

/**
 * Get the reputation level name for a value.
 */
export function getReputationLevel(reputation: number): ReputationLevel {
    return getReputationTier(reputation).level;
}

/**
 * Calculate reputation change from an action.
 */
export function calculateReputationChange(action: ReputationAction): number {
    let change = 0;

    switch (action.type) {
        case 'trade':
            if (action.success) {
                change = REPUTATION_CHANGES.SUCCESSFUL_TRADE;
                // Bonus for large trades
                if (action.quantity && action.quantity >= 20) {
                    change += REPUTATION_CHANGES.LARGE_TRADE;
                }
            }
            break;

        case 'caravan':
            change = action.success
                ? REPUTATION_CHANGES.CARAVAN_SUCCESS
                : REPUTATION_CHANGES.CARAVAN_FAILURE;
            break;

        case 'route':
            if (action.success) {
                change = REPUTATION_CHANGES.TRADE_ROUTE_MAINTAINED;
            }
            break;

        case 'deal':
            change = action.success
                ? REPUTATION_CHANGES.EXCLUSIVE_CONTRACT
                : REPUTATION_CHANGES.DEAL_BROKEN;
            break;

        case 'tribute':
            change = REPUTATION_CHANGES.TRIBUTE_PAID;
            break;

        case 'crisis':
            if (action.isCrisis) {
                change = action.isFairPriced
                    ? REPUTATION_CHANGES.FAIR_CRISIS_TRADE
                    : REPUTATION_CHANGES.PRICE_GOUGING;
            }
            break;

        case 'decay':
            change = REPUTATION_CHANGES.REPUTATION_DECAY_PER_SEASON;
            break;
    }

    return change;
}

/**
 * Apply reputation change and return new reputation state.
 */
export function updateReputation(
    current: MerchantReputation,
    action: ReputationAction,
    currentRound: number
): MerchantReputation {
    const change = calculateReputationChange(action);
    const newReputation = Math.max(-100, Math.min(100, current.reputation + change));
    const newLevel = getReputationLevel(newReputation);

    // Update tracking stats
    let totalTrades = current.totalTrades;
    let successfulTrades = current.successfulTrades;
    let failedTrades = current.failedTrades;
    let dealsHonored = current.dealsHonored;
    let dealsBroken = current.dealsBroken;

    if (action.type === 'trade' || action.type === 'caravan') {
        totalTrades++;
        if (action.success) {
            successfulTrades++;
        } else {
            failedTrades++;
        }
    }

    if (action.type === 'deal') {
        if (action.success) {
            dealsHonored++;
        } else {
            dealsBroken++;
        }
    }

    return {
        ...current,
        reputation: newReputation,
        level: newLevel,
        totalTrades,
        successfulTrades,
        failedTrades,
        lastTradeRound: currentRound,
        dealsHonored,
        dealsBroken,
    };
}

/**
 * Get trade price effects based on reputation.
 */
export function getReputationEffects(reputation: number): ReputationEffect {
    const tier = getReputationTier(reputation);

    // Base goods available to all
    const baseGoods: ResourceType[] = [
        'grain', 'timber', 'stone', 'clay', 'wool', 'livestock'
    ];

    // Premium goods unlocked at friendly+
    const premiumGoods: ResourceType[] = ['iron', 'salt', 'wine'];

    // Luxury goods unlocked at trusted+
    const luxuryGoods: ResourceType[] = ['olive_oil', 'spices'];

    let availableGoods: ResourceType[] = [...baseGoods];

    if (tier.level === 'friendly' || tier.level === 'trusted' || tier.level === 'honored') {
        availableGoods = [...availableGoods, ...premiumGoods];
    }

    if (tier.level === 'trusted' || tier.level === 'honored') {
        availableGoods = [...availableGoods, ...luxuryGoods];
    }

    return {
        sellPriceModifier: tier.priceModifier,
        buyPriceModifier: -tier.buyDiscount, // Convert discount to price modifier
        specialOfferChance: tier.specialOffersChance,
        creditLimit: tier.creditLimit,
        availableGoods,
    };
}

/**
 * Calculate final price with reputation modifiers.
 */
export function applyReputationToPrice(
    basePrice: number,
    reputation: number,
    isSelling: boolean
): number {
    const effects = getReputationEffects(reputation);
    const modifier = isSelling ? effects.sellPriceModifier : effects.buyPriceModifier;

    const adjustedPrice = basePrice * (1 + modifier);
    return Math.max(1, Math.round(adjustedPrice));
}

/**
 * Check if player should receive a special offer.
 */
export function rollForSpecialOffer(
    reputation: number,
    cityId: string,
    currentRound: number
): SpecialOffer | null {
    const effects = getReputationEffects(reputation);

    if (Math.random() >= effects.specialOfferChance) {
        return null;
    }

    // Generate a random special offer
    const resources: ResourceType[] = [
        'grain', 'iron', 'timber', 'stone', 'wool', 'salt', 'wine', 'olive_oil'
    ];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const quantity = 10 + Math.floor(Math.random() * 20); // 10-30 units
    const discount = 0.15 + (Math.random() * 0.25); // 15-40% discount

    const tier = getReputationTier(reputation);
    const reasons: Record<ReputationLevel, string[]> = {
        hostile: [],
        wary: [],
        neutral: ['Surplus stock clearance'],
        friendly: ['Friend of the guild discount', 'Loyalty appreciation'],
        trusted: ['Exclusive partner offer', 'Trusted buyer privilege'],
        honored: ['Honored guest tribute', 'Patrician discount', 'Guild master favor'],
    };

    const reasonPool = reasons[tier.level];
    if (!reasonPool || reasonPool.length === 0) return null;

    const reason = reasonPool[Math.floor(Math.random() * reasonPool.length)];

    return {
        id: `offer_${cityId}_${currentRound}`,
        cityId,
        resource,
        quantity,
        discount: Math.round(discount * 100) / 100,
        expiresInRounds: 2,
        reason,
    };
}

/**
 * Apply seasonal reputation decay for cities not traded with.
 */
export function applyReputationDecay(
    reputations: Record<string, MerchantReputation>,
    currentRound: number
): Record<string, MerchantReputation> {
    const decayed: Record<string, MerchantReputation> = {};

    for (const [cityId, rep] of Object.entries(reputations)) {
        // Check if traded this season
        const tradedRecently = rep.lastTradeRound >= currentRound - 1;

        if (!tradedRecently && rep.reputation > 0) {
            // Apply decay for positive reputations only
            decayed[cityId] = updateReputation(rep, { type: 'decay', success: false }, currentRound);
        } else {
            decayed[cityId] = rep;
        }
    }

    return decayed;
}

/**
 * Create initial reputation state for a city.
 */
export function createInitialReputation(cityId: string): MerchantReputation {
    return {
        cityId,
        reputation: 0,
        level: 'neutral',
        totalTrades: 0,
        successfulTrades: 0,
        failedTrades: 0,
        lastTradeRound: 0,
        specialOffersReceived: 0,
        dealsHonored: 0,
        dealsBroken: 0,
    };
}

/**
 * Get reputation progress to next tier.
 */
export function getReputationProgress(reputation: number): {
    currentTier: ReputationTier;
    nextTier: ReputationTier | null;
    progress: number;           // 0-100 percentage
    pointsToNext: number;
} {
    const currentTier = getReputationTier(reputation);
    const tierIndex = REPUTATION_TIERS.findIndex(t => t.level === currentTier.level);
    const nextTier = tierIndex < REPUTATION_TIERS.length - 1 ? REPUTATION_TIERS[tierIndex + 1] : null;

    if (!nextTier) {
        return {
            currentTier,
            nextTier: null,
            progress: 100,
            pointsToNext: 0,
        };
    }

    const rangeInCurrentTier = currentTier.maxReputation - currentTier.minReputation + 1;
    const progressInTier = reputation - currentTier.minReputation;
    const progress = Math.round((progressInTier / rangeInCurrentTier) * 100);
    const pointsToNext = nextTier.minReputation - reputation;

    return {
        currentTier,
        nextTier,
        progress: Math.max(0, Math.min(100, progress)),
        pointsToNext,
    };
}

/**
 * Get description of reputation benefits at each tier.
 */
export function getReputationBenefits(level: ReputationLevel): string[] {
    const benefits: Record<ReputationLevel, string[]> = {
        hostile: [
            'Merchants refuse to trade with you',
            'All goods marked up 20%',
            'No credit available',
        ],
        wary: [
            'Limited goods selection',
            'Prices marked up 10%',
            'No special offers',
        ],
        neutral: [
            'Standard market prices',
            'Basic goods available',
            '5% chance of special offers',
        ],
        friendly: [
            '+10% on sales, -5% on purchases',
            'Premium goods unlocked',
            '15% chance of special offers',
            '300 denarii credit limit',
        ],
        trusted: [
            '+20% on sales, -10% on purchases',
            'Luxury goods unlocked',
            '25% chance of special offers',
            '500 denarii credit limit',
        ],
        honored: [
            '+30% on sales, -15% on purchases',
            'All goods available',
            '40% chance of special offers',
            '1000 denarii credit limit',
            'Exclusive contracts available',
        ],
    };

    return benefits[level];
}
