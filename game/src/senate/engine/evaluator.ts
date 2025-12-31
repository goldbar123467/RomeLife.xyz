// ============================================
// ROME EMPIRE BUILDER - Senate Evaluator
// Evaluates conditions and determines senator responses
// ============================================

import type { GameState } from '@/core/types';
import type {
    SenatorId,
    SenatorState,
    SenatorFlags,
    AttentionAllocation,
    StateTransitionConditions,
} from '@/core/types/senate';
import {
    SENATORS,
    STATE_TRANSITIONS,
    SENATE_GRACE_PERIOD_ROUNDS,
    getAttentionTier,
    clampRelation,
} from '@/core/constants/senate';

// === CONDITION EVALUATION ===

/**
 * Evaluates if state transition conditions are met
 */
export function evaluateTransitionConditions(
    conditions: StateTransitionConditions,
    senator: SenatorState,
    gameState: GameState,
    round: number
): boolean {
    // Check round requirements
    if (conditions.minRound !== undefined && round < conditions.minRound) {
        return false;
    }
    if (conditions.maxRound !== undefined && round > conditions.maxRound) {
        return false;
    }

    // Check relation requirements
    if (conditions.minRelation !== undefined && senator.relation < conditions.minRelation) {
        return false;
    }
    if (conditions.maxRelation !== undefined && senator.relation > conditions.maxRelation) {
        return false;
    }

    // Check flag requirements
    if (conditions.requiredFlags) {
        for (const [flag, required] of Object.entries(conditions.requiredFlags)) {
            const current = senator.flags[flag as keyof SenatorFlags] || 0;
            if (current < required) {
                return false;
            }
        }
    }

    // Check player stats requirements
    if (conditions.playerStats) {
        const stats = conditions.playerStats;

        if (stats.troops) {
            if (!compareValue(gameState.troops, stats.troops.op, stats.troops.value)) {
                return false;
            }
        }
        if (stats.happiness) {
            if (!compareValue(gameState.happiness, stats.happiness.op, stats.happiness.value)) {
                return false;
            }
        }
        if (stats.piety) {
            if (!compareValue(gameState.piety, stats.piety.op, stats.piety.value)) {
                return false;
            }
        }
        if (stats.denarii) {
            if (!compareValue(gameState.denarii, stats.denarii.op, stats.denarii.value)) {
                return false;
            }
        }
    }

    // Check other senator conditions
    if (conditions.otherSenatorConditions) {
        for (const cond of conditions.otherSenatorConditions) {
            const otherSenator = gameState.senate.senators[cond.senatorId];
            if (!otherSenator) continue;

            if (cond.states && !cond.states.includes(otherSenator.currentState)) {
                return false;
            }
            if (cond.minRelation !== undefined && otherSenator.relation < cond.minRelation) {
                return false;
            }
            if (cond.maxRelation !== undefined && otherSenator.relation > cond.maxRelation) {
                return false;
            }
        }
    }

    return true;
}

/**
 * Helper to compare values with operators
 */
function compareValue(actual: number, op: string, target: number): boolean {
    switch (op) {
        case 'lt': return actual < target;
        case 'gt': return actual > target;
        case 'lte': return actual <= target;
        case 'gte': return actual >= target;
        case 'eq': return actual === target;
        default: return true;
    }
}

// === SENATOR SEASON EVALUATION ===

export interface SeasonEvaluationResult {
    relationChange: number;
    flagChanges: Partial<SenatorFlags>;
    stateTransition: string | null;
    transitionReason: string | null;
}

/**
 * Evaluates a senator at the end of a season
 */
export function evaluateSenatorSeason(
    senator: SenatorState,
    attention: number,
    gameState: GameState,
    round: number
): SeasonEvaluationResult {
    const result: SeasonEvaluationResult = {
        relationChange: 0,
        flagChanges: {},
        stateTransition: null,
        transitionReason: null,
    };

    // During grace period, senators only observe
    if (round <= SENATE_GRACE_PERIOD_ROUNDS) {
        // Minimal drift during grace period
        const tier = getAttentionTier(attention);
        result.relationChange = Math.floor(tier.relationDrift / 2);
        return result;
    }

    // Get attention tier effects
    const tier = getAttentionTier(attention);
    result.relationChange = tier.relationDrift;

    // Check for state transitions
    const transitions = STATE_TRANSITIONS[senator.id] || [];
    for (const rule of transitions) {
        if (rule.from !== senator.currentState) continue;

        if (evaluateTransitionConditions(rule.conditions, senator, gameState, round)) {
            result.stateTransition = rule.to;
            result.transitionReason = rule.description;
            break; // First matching transition wins
        }
    }

    return result;
}

// === ATTENTION EFFECTS ===

/**
 * Calculate attention drift for all senators
 */
export function calculateAttentionEffects(
    senators: Record<SenatorId, SenatorState>,
    attention: AttentionAllocation,
    round: number
): Record<SenatorId, { relationChange: number; eventChance: number }> {
    const effects: Record<SenatorId, { relationChange: number; eventChance: number }> = {} as Record<SenatorId, { relationChange: number; eventChance: number }>;

    for (const id of Object.keys(senators) as SenatorId[]) {
        const attentionValue = attention[id] || 0;
        const tier = getAttentionTier(attentionValue);

        // During grace period, reduce drift
        const driftModifier = round <= SENATE_GRACE_PERIOD_ROUNDS ? 0.5 : 1.0;

        effects[id] = {
            relationChange: Math.floor(tier.relationDrift * driftModifier),
            eventChance: tier.eventChance,
        };
    }

    return effects;
}

// === ASSASSINATION WINDOW CHECK ===

export interface AssassinationCheck {
    windowOpen: boolean;
    turnsRemaining: number | null;
    method: string | null;
}

/**
 * Check if a senator's assassination window should open
 */
export function checkAssassinationWindow(
    senator: SenatorState,
    gameState: GameState,
    round: number
): AssassinationCheck {
    // Round parameter reserved for time-based assassination conditions
    void round;
    const def = SENATORS[senator.id];

    // Can't assassinate if senator doesn't have that capability
    if (!def.canAssassinate) {
        return { windowOpen: false, turnsRemaining: null, method: null };
    }

    // Check state-specific assassination conditions
    switch (senator.id) {
        case 'sulla':
            // Sulla: COUP state + relation <= -60 + player troops < 100
            if (senator.currentState === 'coup' ||
                (senator.currentState === 'rival' && senator.relation <= -60 && gameState.troops < 100)) {
                return {
                    windowOpen: true,
                    turnsRemaining: senator.assassination.turnsUntilAttempt || 4,
                    method: def.assassinationMethod || 'Military Coup',
                };
            }
            break;

        case 'clodius':
            // Clodius: ASSASSINATION state or (HOSTILE + relation <= -70 + happiness < 40)
            if (senator.currentState === 'assassination' ||
                (senator.currentState === 'hostile' && senator.relation <= -70 && gameState.happiness < 40)) {
                return {
                    windowOpen: true,
                    turnsRemaining: senator.assassination.turnsUntilAttempt || 2,
                    method: def.assassinationMethod || 'Mob Violence',
                };
            }
            break;

        case 'pulcher':
            // Pulcher: SACRED_MURDER state or (CONDEMNED + relation <= -60 + piety < 20)
            if (senator.currentState === 'sacred_murder' ||
                (senator.currentState === 'condemned' && senator.relation <= -60 && gameState.piety < 20)) {
                return {
                    windowOpen: true,
                    turnsRemaining: senator.assassination.turnsUntilAttempt || 3,
                    method: def.assassinationMethod || 'Sacred Poisoning',
                };
            }
            break;

        case 'oppius':
            // Oppius: Only if player tried to assassinate him first (EXPOSED or SPIDER_REVENGE state)
            if (senator.currentState === 'exposed' || senator.currentState === 'spider_revenge') {
                return {
                    windowOpen: true,
                    turnsRemaining: senator.assassination.turnsUntilAttempt || 1,
                    method: def.assassinationMethod || 'Professional Assassination',
                };
            }
            break;
    }

    return { windowOpen: false, turnsRemaining: null, method: null };
}

// === FLAG ACCUMULATION ===

/**
 * Determine which flags should be modified based on player action
 */
export function determineFlagChanges(
    actionType: string,
    actionDetails: Record<string, unknown>
): Partial<Record<SenatorId, Partial<SenatorFlags>>> {
    const changes: Partial<Record<SenatorId, Partial<SenatorFlags>>> = {};

    switch (actionType) {
        case 'worship':
            // Pious action - Pulcher notices
            changes.pulcher = { pious: 1 };
            break;

        case 'battle':
            // Battle outcome affects Sertorius and Sulla
            const victory = actionDetails.victory as boolean;
            const casualties = (actionDetails.casualties as number) || 0;

            if (victory) {
                changes.sulla = { interesting: 1 };
                if (casualties < 10) {
                    changes.sertorius = { honorable: 1 };
                }
            } else {
                changes.sulla = { interesting: -1 }; // Note: flags can't go negative, just for logic
            }
            break;

        case 'trade':
            // Trade patterns - Oppius notices
            changes.oppius = { interesting: 1 };
            break;

        case 'emergency':
            // Emergency actions might be dishonorable
            const actionId = actionDetails.actionId as string;
            if (actionId === 'martial_law' || actionId === 'forced_levy') {
                changes.sertorius = { disappointment: 1 };
            }
            break;
    }

    return changes;
}

// === RELATION CLAMPING HELPER ===

export function applyRelationChange(senator: SenatorState, change: number): number {
    return clampRelation(senator.relation + change);
}
