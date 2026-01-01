// ============================================
// ROME EMPIRE BUILDER - Diplomacy Constants
// ============================================

import { Landmark, Mountain, Crown, Handshake, Amphora, type LucideIcon } from 'lucide-react';

// === FACTION DEFINITION ===
export interface Faction {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
}

// === FACTIONS ===
export const FACTIONS: Record<string, Faction> = {
    alba_longa: {
        id: 'alba_longa',
        name: 'Alba Longa',
        description: 'Our mother city, Latin allies',
        icon: Landmark,
    },
    sabines: {
        id: 'sabines',
        name: 'Sabine Tribes',
        description: 'Hill people to the northeast',
        icon: Mountain,
    },
    etruscans: {
        id: 'etruscans',
        name: 'Etruscans',
        description: 'Powerful northern civilization',
        icon: Crown,
    },
    latins: {
        id: 'latins',
        name: 'Latin League',
        description: 'Confederation of Latin cities',
        icon: Handshake,
    },
    greeks: {
        id: 'greeks',
        name: 'Greek Colonies',
        description: 'Southern coastal settlements',
        icon: Amphora,
    },
};

// === DIPLOMACY THRESHOLDS ===
export const DIPLOMACY_THRESHOLDS = {
    HOSTILE: 20,
    UNFRIENDLY: 40,
    NEUTRAL: 60,
    FRIENDLY: 80,
    ALLIED: 100,
} as const;

// === RELATION STATUS ===
export interface RelationStatus {
    text: string;
    color: string;
    variant: 'success' | 'warning' | 'danger';
}

export function getRelationStatus(relation: number): RelationStatus {
    if (relation >= 80) return { text: 'Allied', color: 'text-green-400', variant: 'success' };
    if (relation >= 60) return { text: 'Friendly', color: 'text-cyan-400', variant: 'success' };
    if (relation >= 40) return { text: 'Neutral', color: 'text-yellow-400', variant: 'warning' };
    if (relation >= 20) return { text: 'Unfriendly', color: 'text-orange-400', variant: 'warning' };
    return { text: 'Hostile', color: 'text-red-400', variant: 'danger' };
}

// === ENVOY COST ===
export const ENVOY_COST = 100;

// === SUCCESS TIER CALCULATION ===
export type SuccessTier = 'Likely' | 'Uncertain' | 'Unlikely';

export interface EnvoySuccessFactors {
    baseChance: number;
    reputationBonus: number;
    relationBonus: number;
    godBonus: number;
    totalChance: number;
    tier: SuccessTier;
}

export function calculateEnvoySuccessFactors(
    reputation: number,
    currentRelation: number,
    godDiplomacyBonus: number = 0
): EnvoySuccessFactors {
    const baseChance = 0.5;
    const reputationBonus = reputation / 200; // Max +50% at 100 rep
    const relationBonus = currentRelation / 400; // Max +25% at 100 relation
    const totalChance = Math.min(0.95, baseChance + reputationBonus + relationBonus + godDiplomacyBonus);

    let tier: SuccessTier;
    if (totalChance >= 0.7) {
        tier = 'Likely';
    } else if (totalChance >= 0.45) {
        tier = 'Uncertain';
    } else {
        tier = 'Unlikely';
    }

    return {
        baseChance,
        reputationBonus,
        relationBonus,
        godBonus: godDiplomacyBonus,
        totalChance,
        tier,
    };
}

// === RISK ASSESSMENT TEXT ===
export function getRiskAssessment(tier: SuccessTier): string {
    switch (tier) {
        case 'Likely':
            return 'Our diplomats are confident this mission will succeed. The faction views Rome favorably.';
        case 'Uncertain':
            return 'The outcome is uncertain. Our envoys will do their best, but success is not guaranteed.';
        case 'Unlikely':
            return 'This is a risky endeavor. The faction is wary of Rome and our envoys may face hostility.';
    }
}

// === DIPLOMATIC EFFECTS INFO ===
export const DIPLOMATIC_EFFECTS = [
    {
        threshold: 80,
        name: 'Allied',
        color: 'text-green-400',
        effects: '+20% trade prices, military support',
    },
    {
        threshold: 60,
        name: 'Friendly',
        color: 'text-cyan-400',
        effects: '+10% trade prices, reduced tariffs',
    },
    {
        threshold: 40,
        name: 'Neutral',
        color: 'text-yellow-400',
        effects: 'Normal trade relations',
    },
    {
        threshold: 20,
        name: 'Unfriendly',
        color: 'text-orange-400',
        effects: 'Trade penalties, increased tariffs',
    },
    {
        threshold: 0,
        name: 'Hostile',
        color: 'text-red-400',
        effects: 'Trade embargoes, raid risk',
    },
];

// === CRISIS/OPPORTUNITY THRESHOLDS ===
export const CRISIS_THRESHOLD = 25;
export const OPPORTUNITY_THRESHOLD = 75;
