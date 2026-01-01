// ============================================
// ROME EMPIRE BUILDER - Senate Usecases
// Season processing for the senate system
// ============================================

import type { GameState } from '@/core/types';
import type {
    SenatorId,
    SenateState,
    SenatorEvent,
    AttentionAllocation,
    QueuedSenatorAction,
} from '@/core/types/senate';
import {
    SENATE_GRACE_PERIOD_ROUNDS,
    clampRelation,
} from '@/core/constants/senate';
import {
    evaluateSenatorSeason,
    calculateAttentionEffects,
    checkAssassinationWindow,
} from '@/senate/engine/evaluator';
import {
    evaluateStateTransition,
    applyStateTransition,
    handleSeratoriusSave,
} from '@/senate/engine/stateTransitions';
import {
    applyRelationChangesToSenators,
    applyFlagChangesToSenators,
    processActionQueue,
    decayCooldowns,
    updateAttentionTracking,
} from '@/senate/engine/effectProcessor';
import {
    selectSeasonEvents,
    getIntroductionEvents,
} from '@/senate/events';

// === SENATE SEASON PROCESSING ===

export interface SenateSeasonResult {
    // Updated senate state
    newSenateState: SenateState;

    // Resource changes from senate
    denariiChange: number;
    happinessChange: number;
    moraleChange: number;
    reputationChange: number;
    pietyChange: number;

    // Events to show
    events: SenatorEvent[];

    // Assassination info
    assassination: {
        triggered: boolean;
        senatorId: SenatorId | null;
        savedBySertorius: boolean;
        method: string | null;
    } | null;

    // Messages for log
    messages: string[];
}

/**
 * Process senate at end of season
 */
export function processSenateSeasonEnd(
    gameState: GameState,
    round: number
): SenateSeasonResult {
    const result: SenateSeasonResult = {
        newSenateState: { ...gameState.senate },
        denariiChange: 0,
        happinessChange: 0,
        moraleChange: 0,
        reputationChange: 0,
        pietyChange: 0,
        events: [],
        assassination: null,
        messages: [],
    };

    // Don't process if senate not initialized
    if (!gameState.senate.initialized) {
        return result;
    }

    // Debug logging for Season 21 investigation
    if (typeof window !== 'undefined') {
        console.log(`[Senate] Round ${round} START - Relations:`,
            Object.entries(gameState.senate.senators)
                .map(([id, s]) => `${id.slice(0, 3)}:${(s as { relation: number }).relation}`)
                .join(', ')
        );
    }

    let senators = { ...gameState.senate.senators };
    const attention = gameState.senate.attentionThisSeason || getDefaultAttention();

    // === 1. PROCESS ACTION QUEUE (delayed effects from previous events) ===
    const queueResult = processActionQueue(
        gameState.senate.actionQueue,
        round
    );

    // Apply effects from processed actions
    if (queueResult.effects.relationChanges) {
        senators = applyRelationChangesToSenators(senators, queueResult.effects.relationChanges);
    }
    if (queueResult.effects.flagChanges) {
        senators = applyFlagChangesToSenators(senators, queueResult.effects.flagChanges);
    }

    result.denariiChange += queueResult.effects.denariiChange;
    result.happinessChange += queueResult.effects.happinessChange;
    result.moraleChange += queueResult.effects.moraleChange;
    result.reputationChange += queueResult.effects.reputationChange;
    result.pietyChange += queueResult.effects.pietyChange;
    result.messages.push(...queueResult.effects.messages);

    // === 2. CALCULATE ATTENTION EFFECTS ===
    const attentionEffects = calculateAttentionEffects(senators, attention, round);

    for (const [id, effects] of Object.entries(attentionEffects) as [SenatorId, { relationChange: number }][]) {
        senators[id] = {
            ...senators[id],
            relation: clampRelation(senators[id].relation + effects.relationChange),
        };
        senators[id] = updateAttentionTracking(senators[id], attention[id] || 20);
    }

    // === 3. EVALUATE EACH SENATOR ===
    for (const id of Object.keys(senators) as SenatorId[]) {
        const senator = senators[id];
        const senatorAttention = attention[id] || 20;

        // Evaluate season changes
        const seasonResult = evaluateSenatorSeason(
            senator,
            senatorAttention,
            gameState,
            round
        );

        // Apply relation changes
        if (seasonResult.relationChange !== 0) {
            senators[id] = {
                ...senators[id],
                relation: clampRelation(senators[id].relation + seasonResult.relationChange),
            };
        }

        // Apply flag changes
        if (Object.keys(seasonResult.flagChanges).length > 0) {
            senators = applyFlagChangesToSenators(senators, { [id]: seasonResult.flagChanges });
        }

        // Check for state transitions
        const transitionResult = evaluateStateTransition(
            senators[id],
            gameState,
            round
        );

        if (transitionResult.transitioned && transitionResult.newState) {
            senators[id] = applyStateTransition(senators[id], transitionResult.newState, round);
            result.messages.push(`${senators[id].name}: ${transitionResult.reason || 'State changed'}`);

            // Check if new state is lethal
            if (transitionResult.isLethal) {
                // Check if Sertorius can save
                const saveResult = handleSeratoriusSave(senators, id);

                if (saveResult.saved && saveResult.newSertoriusState) {
                    senators.sertorius = saveResult.newSertoriusState;
                    result.assassination = {
                        triggered: true,
                        senatorId: id,
                        savedBySertorius: true,
                        method: getAssassinationMethod(id),
                    };
                    result.messages.push('Sertorius sacrificed himself to save you!');
                    result.moraleChange += 10; // Martyred friend bonus
                } else {
                    // Player dies
                    result.assassination = {
                        triggered: true,
                        senatorId: id,
                        savedBySertorius: false,
                        method: getAssassinationMethod(id),
                    };
                }
            }
        }
    }

    // === 3.5 APPLY RELATION CONSEQUENCES ===
    // When senator relations drop below -30, they take hostile actions
    const CONSEQUENCE_THRESHOLD = -30;
    for (const id of Object.keys(senators) as SenatorId[]) {
        const senator = senators[id];

        // Skip if relation is above consequence threshold
        if (senator.relation >= CONSEQUENCE_THRESHOLD) continue;

        // Calculate penalty severity: how far below -30 they are
        const penaltyTier = Math.floor((Math.abs(senator.relation) - 30) / 10);

        switch (id) {
            case 'sulla':
                // Sulla weakens military: -morale per tier
                const sullaMoralePenalty = Math.min(penaltyTier * 3, 12);
                result.moraleChange -= sullaMoralePenalty;
                if (sullaMoralePenalty > 0) {
                    result.messages.push(`Sulla undermines your officers (-${sullaMoralePenalty} morale)`);
                }
                break;

            case 'clodius':
                // Clodius stirs street unrest: -happiness per tier
                const clodiusHappinessPenalty = Math.min(penaltyTier * 2, 8);
                result.happinessChange -= clodiusHappinessPenalty;
                if (clodiusHappinessPenalty > 0) {
                    result.messages.push(`Clodius's mobs cause unrest (-${clodiusHappinessPenalty} happiness)`);
                }
                break;

            case 'pulcher':
                // Pulcher spreads religious doubt: -piety per tier
                const pulcherPietyPenalty = Math.min(penaltyTier * 3, 12);
                result.pietyChange -= pulcherPietyPenalty;
                if (pulcherPietyPenalty > 0) {
                    result.messages.push(`Pulcher spreads divine disfavor (-${pulcherPietyPenalty} piety)`);
                }
                break;

            case 'oppius':
                // Oppius disrupts commerce: -denarii per tier
                const oppiusDenariiPenalty = Math.min(penaltyTier * 40, 160);
                result.denariiChange -= oppiusDenariiPenalty;
                if (oppiusDenariiPenalty > 0) {
                    result.messages.push(`Oppius's network disrupts trade (-${oppiusDenariiPenalty} denarii)`);
                }
                break;

            case 'sertorius':
                // Sertorius damages your reputation (even if he's your friend)
                const sertoriusRepPenalty = Math.min(penaltyTier * 2, 6);
                result.reputationChange -= sertoriusRepPenalty;
                if (sertoriusRepPenalty > 0) {
                    result.messages.push(`Sertorius speaks of your dishonor (-${sertoriusRepPenalty} reputation)`);
                }
                break;
        }
    }

    // === 4. CHECK ASSASSINATION WINDOWS ===
    for (const id of Object.keys(senators) as SenatorId[]) {
        const senator = senators[id];
        const windowCheck = checkAssassinationWindow(senator, gameState, round);

        if (windowCheck.windowOpen) {
            senators[id] = {
                ...senators[id],
                assassination: {
                    windowOpen: true,
                    warningGiven: senator.assassination.warningGiven,
                    turnsUntilAttempt: windowCheck.turnsRemaining,
                },
            };

            // Countdown assassination
            if (senators[id].assassination.turnsUntilAttempt !== null) {
                const turnsLeft = senators[id].assassination.turnsUntilAttempt! - 1;

                if (turnsLeft <= 0 && !result.assassination) {
                    // Assassination triggers!
                    const saveResult = handleSeratoriusSave(senators, id);

                    if (saveResult.saved && saveResult.newSertoriusState) {
                        senators.sertorius = saveResult.newSertoriusState;
                        result.assassination = {
                            triggered: true,
                            senatorId: id,
                            savedBySertorius: true,
                            method: windowCheck.method,
                        };
                        result.messages.push('Sertorius sacrificed himself to save you!');
                        result.moraleChange += 10;

                        // Close the window since we were saved
                        senators[id] = {
                            ...senators[id],
                            assassination: {
                                windowOpen: false,
                                warningGiven: false,
                                turnsUntilAttempt: null,
                            },
                        };
                    } else {
                        result.assassination = {
                            triggered: true,
                            senatorId: id,
                            savedBySertorius: false,
                            method: windowCheck.method,
                        };
                    }
                } else if (turnsLeft === 1 && !senator.assassination.warningGiven) {
                    // Give warning
                    senators[id] = {
                        ...senators[id],
                        assassination: {
                            ...senators[id].assassination,
                            warningGiven: true,
                            turnsUntilAttempt: turnsLeft,
                        },
                    };
                    result.messages.push(`WARNING: ${senators[id].name} is planning something dangerous!`);
                } else {
                    senators[id] = {
                        ...senators[id],
                        assassination: {
                            ...senators[id].assassination,
                            turnsUntilAttempt: turnsLeft,
                        },
                    };
                }
            }
        }
    }

    // === 5. SELECT EVENTS ===
    // Introduction events during early game
    if (round >= 2 && round <= 5) {
        const introEvents = getIntroductionEvents(senators, gameState, round);
        result.events.push(...introEvents);
    }

    // Regular events after grace period
    if (round > SENATE_GRACE_PERIOD_ROUNDS) {
        const seasonEvents = selectSeasonEvents(
            senators,
            attention,
            gameState,
            round,
            2 // Max 2 events per season
        );
        result.events.push(...seasonEvents);
    }

    // === 6. DECAY COOLDOWNS ===
    senators = decayCooldowns(senators);

    // === 7. VALIDATE SENATOR PRESERVATION (BUG-001 FIX) ===
    // Ensure senator relations are not accidentally reset to initial values
    // This guards against any corruption that might occur during processing
    for (const id of Object.keys(senators) as SenatorId[]) {
        const original = gameState.senate.senators[id];
        const processed = senators[id];

        // If senator somehow lost their relation history, restore from original
        if (original && processed &&
            original.relation !== processed.relation &&
            Math.abs(processed.relation - 0) < 0.001 && // Suspiciously reset to 0
            Math.abs(original.relation) > 5) { // Original had meaningful relation

            // Log warning and preserve original relation
            if (typeof window !== 'undefined') {
                console.warn(`[Senate] BUG-001 GUARD: Prevented ${id} relation reset from ${original.relation} to ${processed.relation}`);
            }
            senators[id] = {
                ...processed,
                relation: original.relation,
            };
        }
    }

    // === 8. BUILD FINAL STATE ===
    result.newSenateState = {
        ...gameState.senate,
        senators,
        attentionThisSeason: null, // Reset for next season
        attentionLocked: false,
        // Set first event as currentEvent to display modal, rest go to pendingEvents
        currentEvent: result.events[0] || null,
        pendingEvents: result.events.slice(1),
        actionQueue: [
            ...queueResult.remainingActions,
            ...queueResult.processedActions.filter(a => !a.resolved),
        ],
        gracePhaseComplete: round >= SENATE_GRACE_PERIOD_ROUNDS,
    };

    return result;
}

/**
 * Get default balanced attention allocation
 */
function getDefaultAttention(): AttentionAllocation {
    return {
        sertorius: 20,
        sulla: 20,
        clodius: 20,
        pulcher: 20,
        oppius: 20,
    };
}

/**
 * Get assassination method for a senator
 */
function getAssassinationMethod(senatorId: SenatorId): string {
    switch (senatorId) {
        case 'sulla': return 'Military Coup';
        case 'clodius': return 'Mob Violence';
        case 'pulcher': return 'Sacred Poisoning';
        case 'oppius': return 'Professional Assassination';
        default: return 'Assassination';
    }
}

// === SENATE INITIALIZATION ===

/**
 * Check if senate should be initialized
 */
export function shouldInitializeSenate(gameState: GameState): boolean {
    return !gameState.senate.initialized;
}

// === APPLY PLAYER ACTION TO SENATE ===

export interface SenateActionResult {
    relationChanges: Partial<Record<SenatorId, number>>;
    flagChanges: Partial<Record<SenatorId, Partial<Record<string, number>>>>;
    messages: string[];
}

/**
 * Process a player action through the senate system
 * Called when player takes significant actions (worship, battle, trade, etc.)
 */
export function evaluateSenateAction(
    gameState: GameState,
    action: { type: string; details: Record<string, unknown> }
): SenateActionResult {
    const result: SenateActionResult = {
        relationChanges: {},
        flagChanges: {},
        messages: [],
    };

    // During grace period, just observe
    if (gameState.round <= SENATE_GRACE_PERIOD_ROUNDS) {
        return result;
    }

    // Different actions affect different senators
    switch (action.type) {
        case 'worship':
            // Pulcher notices piety
            result.flagChanges.pulcher = { pious: 1 };
            break;

        case 'battle':
            // Sertorius and Sulla react to battle outcomes
            if (action.details.victory) {
                result.relationChanges.sulla = 3;
                result.flagChanges.sulla = { interesting: 1 };
                if ((action.details.casualties as number) < 10) {
                    result.flagChanges.sertorius = { honorable: 1 };
                }
            } else {
                result.relationChanges.sertorius = -2;
            }
            break;

        case 'trade':
            // Oppius notes trade patterns
            result.flagChanges.oppius = { interesting: 1 };
            break;

        case 'emergency':
            // Emergency actions might be dishonorable
            if (action.details.actionId === 'martial_law' ||
                action.details.actionId === 'forced_levy') {
                result.flagChanges.sertorius = { disappointment: 1 };
            }
            break;

        case 'tax_change':
            // High taxes upset the mob
            if ((action.details.newRate as number) > 20) {
                result.relationChanges.clodius = -2;
            }
            break;
    }

    return result;
}

// === HELPER: Apply queued action trigger round ===

/**
 * Convert delaySeasons to triggerRound for new queued actions
 */
export function finalizeQueuedActions(
    actions: QueuedSenatorAction[],
    currentRound: number
): QueuedSenatorAction[] {
    return actions.map(action => ({
        ...action,
        triggerRound: action.delaySeasons
            ? currentRound + action.delaySeasons
            : action.triggerRound,
        id: action.id || `action_${currentRound}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        resolved: false,
    }));
}
