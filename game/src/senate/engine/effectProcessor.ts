// ============================================
// ROME EMPIRE BUILDER - Effect Processor
// Applies senate effects to game state
// ============================================

import type { GameState } from '@/core/types';
import type {
    SenatorId,
    SenatorState,
    SenatorChoiceEffects,
    QueuedSenatorAction,
    SenatorFlags,
    } from '@/core/types/senate';
import { clampRelation } from '@/core/constants/senate';

// === EFFECT APPLICATION ===

export interface AppliedEffects {
    denariiChange: number;
    happinessChange: number;
    moraleChange: number;
    reputationChange: number;
    pietyChange: number;
    troopsChange: number;
    grainChange: number;
    relationChanges: Partial<Record<SenatorId, number>>;
    flagChanges: Partial<Record<SenatorId, Partial<SenatorFlags>>>;
    newQueuedActions: QueuedSenatorAction[];
    messages: string[];
}

/**
 * Create empty applied effects
 */
export function createEmptyEffects(): AppliedEffects {
    return {
        denariiChange: 0,
        happinessChange: 0,
        moraleChange: 0,
        reputationChange: 0,
        pietyChange: 0,
        troopsChange: 0,
        grainChange: 0,
        relationChanges: {},
        flagChanges: {},
        newQueuedActions: [],
        messages: [],
    };
}

/**
 * Apply choice effects to accumulated effects
 */
export function applyChoiceEffects(
    effects: SenatorChoiceEffects,
    accumulated: AppliedEffects,
    senatorId: SenatorId,
    round: number
): AppliedEffects {
    const result = { ...accumulated };

    // Apply resource changes
    if (effects.resourceChanges) {
        const rc = effects.resourceChanges;
        result.denariiChange += rc.denarii || 0;
        result.happinessChange += rc.happiness || 0;
        result.moraleChange += rc.morale || 0;
        result.reputationChange += rc.reputation || 0;
        result.pietyChange += rc.piety || 0;
        result.troopsChange += rc.troops || 0;
        result.grainChange += rc.grain || 0;
    }

    // Apply relation changes
    if (effects.relationChanges) {
        for (const [sid, change] of Object.entries(effects.relationChanges)) {
            const id = sid as SenatorId;
            result.relationChanges[id] = (result.relationChanges[id] || 0) + change;
        }
    }

    // Apply flag changes
    if (effects.flagChanges) {
        if (!result.flagChanges[senatorId]) {
            result.flagChanges[senatorId] = {};
        }
        for (const [flag, change] of Object.entries(effects.flagChanges)) {
            const f = flag as keyof SenatorFlags;
            result.flagChanges[senatorId]![f] = (result.flagChanges[senatorId]![f] || 0) + change;
        }
    }

    // Queue delayed actions
    if (effects.queuedActions) {
        for (const action of effects.queuedActions) {
            result.newQueuedActions.push({
                ...action,
                id: `${senatorId}_${round}_${Date.now()}`,
                resolved: false,
            });
        }
    }

    return result;
}

/**
 * Apply accumulated effects to game state
 */
export function applyEffectsToGameState(
    gameState: GameState,
    effects: AppliedEffects
): Partial<GameState> {
    const updates: Partial<GameState> = {};

    // Apply resource changes with clamping
    if (effects.denariiChange !== 0) {
        updates.denarii = Math.max(0, gameState.denarii + effects.denariiChange);
    }
    if (effects.happinessChange !== 0) {
        updates.happiness = Math.max(0, Math.min(100, gameState.happiness + effects.happinessChange));
    }
    if (effects.moraleChange !== 0) {
        updates.morale = Math.max(0, Math.min(100, gameState.morale + effects.moraleChange));
    }
    if (effects.reputationChange !== 0) {
        updates.reputation = gameState.reputation + effects.reputationChange;
    }
    if (effects.pietyChange !== 0) {
        updates.piety = Math.max(0, gameState.piety + effects.pietyChange);
    }
    if (effects.troopsChange !== 0) {
        updates.troops = Math.max(0, gameState.troops + effects.troopsChange);
    }
    if (effects.grainChange !== 0) {
        const newGrain = Math.max(0, Math.min(
            gameState.inventory.grain + effects.grainChange,
            gameState.capacity.grain
        ));
        updates.inventory = {
            ...gameState.inventory,
            grain: newGrain,
        };
    }

    return updates;
}

/**
 * Apply relation changes to senators
 */
export function applyRelationChangesToSenators(
    senators: Record<SenatorId, SenatorState>,
    changes: Partial<Record<SenatorId, number>>
): Record<SenatorId, SenatorState> {
    const updated = { ...senators };

    for (const [id, change] of Object.entries(changes)) {
        const senatorId = id as SenatorId;
        if (updated[senatorId] && change) {
            updated[senatorId] = {
                ...updated[senatorId],
                relation: clampRelation(updated[senatorId].relation + change),
            };
        }
    }

    return updated;
}

/**
 * Apply flag changes to senators
 */
export function applyFlagChangesToSenators(
    senators: Record<SenatorId, SenatorState>,
    changes: Partial<Record<SenatorId, Partial<SenatorFlags>>>
): Record<SenatorId, SenatorState> {
    const updated = { ...senators };

    for (const [id, flagChanges] of Object.entries(changes)) {
        const senatorId = id as SenatorId;
        if (updated[senatorId] && flagChanges) {
            const newFlags = { ...updated[senatorId].flags };
            for (const [flag, change] of Object.entries(flagChanges)) {
                const f = flag as keyof SenatorFlags;
                newFlags[f] = Math.max(0, newFlags[f] + change); // Flags can't go negative
            }
            updated[senatorId] = {
                ...updated[senatorId],
                flags: newFlags,
            };
        }
    }

    return updated;
}

// === ACTION QUEUE PROCESSING ===

export interface QueueProcessResult {
    processedActions: QueuedSenatorAction[];
    remainingActions: QueuedSenatorAction[];
    effects: AppliedEffects;
}

/**
 * Process queued actions that should trigger this round
 */
export function processActionQueue(
    queue: QueuedSenatorAction[],
    currentRound: number
): QueueProcessResult {
    const effects = createEmptyEffects();
    const processed: QueuedSenatorAction[] = [];
    const remaining: QueuedSenatorAction[] = [];

    for (const action of queue) {
        if (action.resolved) {
            // Already processed, skip
            continue;
        }

        if (action.triggerRound <= currentRound) {
            // Time to process this action
            if (action.effects) {
                // Apply the effects
                const appliedEffects = applyChoiceEffects(
                    action.effects as SenatorChoiceEffects,
                    effects,
                    action.senatorId,
                    currentRound
                );
                Object.assign(effects, appliedEffects);
            }
            processed.push({ ...action, resolved: true });
            effects.messages.push(`Delayed effect from ${action.sourceEvent} triggered`);
        } else {
            // Not yet time
            remaining.push(action);
        }
    }

    return { processedActions: processed, remainingActions: remaining, effects };
}

// === COOLDOWN MANAGEMENT ===

/**
 * Decay all cooldowns by 1
 */
export function decayCooldowns(
    senators: Record<SenatorId, SenatorState>
): Record<SenatorId, SenatorState> {
    const updated = { ...senators };

    for (const id of Object.keys(updated) as SenatorId[]) {
        const senator = updated[id];
        const newCooldowns: Record<string, number> = {};

        for (const [eventType, remaining] of Object.entries(senator.cooldowns)) {
            if (remaining > 1) {
                newCooldowns[eventType] = remaining - 1;
            }
            // If remaining <= 1, don't include (cooldown expired)
        }

        updated[id] = {
            ...senator,
            cooldowns: newCooldowns,
        };
    }

    return updated;
}

/**
 * Add a cooldown to a senator
 */
export function addCooldown(
    senator: SenatorState,
    eventType: string,
    duration: number
): SenatorState {
    return {
        ...senator,
        cooldowns: {
            ...senator.cooldowns,
            [eventType]: duration,
        },
    };
}

/**
 * Check if an event type is on cooldown
 */
export function isOnCooldown(senator: SenatorState, eventType: string): boolean {
    return (senator.cooldowns[eventType] || 0) > 0;
}

// === ATTENTION TRACKING ===

/**
 * Update attention tracking for a senator
 */
export function updateAttentionTracking(
    senator: SenatorState,
    attention: number
): SenatorState {
    // Keep last 4 seasons
    const recentAttention = [...senator.tracking.attentionRecent, attention].slice(-4);

    return {
        ...senator,
        tracking: {
            ...senator.tracking,
            attentionTotal: senator.tracking.attentionTotal + attention,
            attentionRecent: recentAttention,
        },
    };
}

/**
 * Get average recent attention for a senator
 */
export function getAverageRecentAttention(senator: SenatorState): number {
    const recent = senator.tracking.attentionRecent;
    if (recent.length === 0) return 20; // Default to balanced

    return recent.reduce((a, b) => a + b, 0) / recent.length;
}

// === SPECIAL EFFECTS ===

/**
 * Process special effects from choices
 */
export function processSpecialEffects(
    effects: string[],
    senatorId: SenatorId,
    senators: Record<SenatorId, SenatorState>,
    gameState: GameState
): {
    updatedSenators: Record<SenatorId, SenatorState>;
    playerDead: boolean;
    playerSaved: boolean;
    messages: string[];
} {
    // gameState reserved for condition-based special effects
    void gameState;

    const result = {
        updatedSenators: { ...senators },
        playerDead: false,
        playerSaved: false,
        messages: [] as string[],
    };

    for (const effect of effects) {
        switch (effect) {
            case 'assassination_window_opens':
                result.updatedSenators[senatorId] = {
                    ...result.updatedSenators[senatorId],
                    assassination: {
                        ...result.updatedSenators[senatorId].assassination,
                        windowOpen: true,
                        warningGiven: false,
                        turnsUntilAttempt: 4,
                    },
                };
                result.messages.push(`${senators[senatorId].name}'s patience runs thin...`);
                break;

            case 'assassination_window_closes':
                result.updatedSenators[senatorId] = {
                    ...result.updatedSenators[senatorId],
                    assassination: {
                        windowOpen: false,
                        warningGiven: false,
                        turnsUntilAttempt: null,
                    },
                };
                result.messages.push(`${senators[senatorId].name} is appeased... for now.`);
                break;

            case 'senator_leaves':
                // Senator leaves the game (e.g., Sertorius disillusioned)
                result.messages.push(`${senators[senatorId].name} has left Rome.`);
                break;

            case 'senator_dies':
                // Senator dies (e.g., Sertorius sacrifice)
                result.messages.push(`${senators[senatorId].name} has fallen.`);
                break;

            case 'player_saved':
                result.playerSaved = true;
                result.messages.push('You have been saved from assassination!');
                break;

            case 'player_dies':
                result.playerDead = true;
                result.messages.push('Your enemies have caught up with you...');
                break;
        }
    }

    return result;
}
