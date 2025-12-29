// ============================================
// ROME EMPIRE BUILDER - Senate Events Registry
// Event selection and management
// ============================================

import type { GameState } from '@/core/types';
import type {
    SenatorId,
    SenatorState,
    SenatorEvent,
    SenatorEventDefinition,
    SenatorEventChoice,
} from '@/core/types/senate';
import { SENATE_GRACE_PERIOD_ROUNDS } from '@/core/constants/senate';

import SERTORIUS_EVENTS from './sertorius';
import SULLA_EVENTS from './sulla';
import CLODIUS_EVENTS from './clodius';
import PULCHER_EVENTS from './pulcher';
import OPPIUS_EVENTS from './oppius';

// === EVENT REGISTRY ===

const ALL_EVENTS: Record<SenatorId, SenatorEventDefinition[]> = {
    sertorius: SERTORIUS_EVENTS,
    sulla: SULLA_EVENTS,
    clodius: CLODIUS_EVENTS,
    pulcher: PULCHER_EVENTS,
    oppius: OPPIUS_EVENTS,
};

/**
 * Get all events for a specific senator
 */
export function getSenatorEvents(senatorId: SenatorId): SenatorEventDefinition[] {
    return ALL_EVENTS[senatorId] || [];
}

/**
 * Get a specific event by ID
 */
export function getEventById(eventId: string): SenatorEventDefinition | null {
    for (const events of Object.values(ALL_EVENTS)) {
        const found = events.find(e => e.id === eventId);
        if (found) return found;
    }
    return null;
}

// === EVENT SELECTION ===

export interface EventEligibility {
    event: SenatorEventDefinition;
    eligible: boolean;
    reasons: string[];
}

/**
 * Check if an event is eligible to trigger
 */
export function checkEventEligibility(
    event: SenatorEventDefinition,
    senator: SenatorState,
    gameState: GameState,
    round: number
): EventEligibility {
    const reasons: string[] = [];

    // Check grace period - no events during rounds 1-4
    if (round <= SENATE_GRACE_PERIOD_ROUNDS) {
        reasons.push('Grace period active');
        return { event, eligible: false, reasons };
    }

    // Check round requirements
    if (event.minRound !== undefined && round < event.minRound) {
        reasons.push(`Requires round ${event.minRound}+`);
    }
    if (event.maxRound !== undefined && round > event.maxRound) {
        reasons.push(`Only available until round ${event.maxRound}`);
    }

    // Check valid states
    if (!event.validStates.includes(senator.currentState)) {
        reasons.push(`Requires state: ${event.validStates.join(' or ')}`);
    }

    // Check cooldown
    if (event.cooldown > 0 && senator.cooldowns[event.id]) {
        reasons.push(`On cooldown for ${senator.cooldowns[event.id]} more rounds`);
    }

    // Check if already shown (for one-time events)
    if (event.cooldown === 0 && gameState.senate.eventHistory.some(h => h.eventId === event.id)) {
        reasons.push('Already triggered (one-time event)');
    }

    // Check conditions
    if (event.conditions) {
        if (event.conditions.minRelation !== undefined && senator.relation < event.conditions.minRelation) {
            reasons.push(`Requires relation >= ${event.conditions.minRelation}`);
        }
        if (event.conditions.maxRelation !== undefined && senator.relation > event.conditions.maxRelation) {
            reasons.push(`Requires relation <= ${event.conditions.maxRelation}`);
        }

        // Check required flags
        if (event.conditions.requiredFlags) {
            for (const [flag, required] of Object.entries(event.conditions.requiredFlags)) {
                const current = senator.flags[flag as keyof typeof senator.flags] || 0;
                if (current < required) {
                    reasons.push(`Requires ${flag} >= ${required} (current: ${current})`);
                }
            }
        }

        // Check player stats
        if (event.conditions.playerStats) {
            const stats = event.conditions.playerStats;
            if (stats.troops) {
                if (!checkStatCondition(gameState.troops, stats.troops.op, stats.troops.value)) {
                    reasons.push(`Troops condition not met`);
                }
            }
            if (stats.happiness) {
                if (!checkStatCondition(gameState.happiness, stats.happiness.op, stats.happiness.value)) {
                    reasons.push(`Happiness condition not met`);
                }
            }
            if (stats.piety) {
                if (!checkStatCondition(gameState.piety, stats.piety.op, stats.piety.value)) {
                    reasons.push(`Piety condition not met`);
                }
            }
            if (stats.denarii) {
                if (!checkStatCondition(gameState.denarii, stats.denarii.op, stats.denarii.value)) {
                    reasons.push(`Denarii condition not met`);
                }
            }
        }

        // Check other senator conditions
        if (event.conditions.otherSenatorConditions) {
            for (const cond of event.conditions.otherSenatorConditions) {
                const otherSenator = gameState.senate.senators[cond.senatorId];
                if (otherSenator) {
                    if (cond.states && !cond.states.includes(otherSenator.currentState)) {
                        reasons.push(`${cond.senatorId} must be in state: ${cond.states.join(' or ')}`);
                    }
                    if (cond.minRelation !== undefined && otherSenator.relation < cond.minRelation) {
                        reasons.push(`${cond.senatorId} relation too low`);
                    }
                }
            }
        }
    }

    return {
        event,
        eligible: reasons.length === 0,
        reasons,
    };
}

/**
 * Helper for stat condition checking
 */
function checkStatCondition(actual: number, op: string, target: number): boolean {
    switch (op) {
        case 'lt': return actual < target;
        case 'gt': return actual > target;
        case 'lte': return actual <= target;
        case 'gte': return actual >= target;
        case 'eq': return actual === target;
        default: return true;
    }
}

/**
 * Select events for the current season
 */
export function selectSeasonEvents(
    senators: Record<SenatorId, SenatorState>,
    attentionAllocation: Record<SenatorId, number>,
    gameState: GameState,
    round: number,
    maxEvents: number = 2
): SenatorEvent[] {
    const selectedEvents: SenatorEvent[] = [];
    const eligibleEvents: { event: SenatorEventDefinition; senator: SenatorState; priority: number }[] = [];

    // Gather all eligible events
    for (const [id, senator] of Object.entries(senators) as [SenatorId, SenatorState][]) {
        const events = getSenatorEvents(id);
        const attention = attentionAllocation[id] || 20;

        for (const event of events) {
            const eligibility = checkEventEligibility(event, senator, gameState, round);

            if (eligibility.eligible) {
                // Calculate priority based on base priority + attention modifier
                const attentionBonus = Math.floor((attention - 20) / 10) * 5;
                const effectivePriority = event.priority + attentionBonus;

                eligibleEvents.push({
                    event,
                    senator,
                    priority: effectivePriority,
                });
            }
        }
    }

    // Sort by priority (highest first)
    eligibleEvents.sort((a, b) => b.priority - a.priority);

    // Select top events (up to maxEvents)
    const seenSenators = new Set<SenatorId>();
    for (const { event, senator } of eligibleEvents) {
        if (selectedEvents.length >= maxEvents) break;

        // Limit to 1 event per senator per season
        if (seenSenators.has(senator.id)) continue;
        seenSenators.add(senator.id);

        // Convert to SenatorEvent format
        selectedEvents.push(createSenatorEvent(event, senator));
    }

    return selectedEvents;
}

/**
 * Convert an event definition to a runtime event
 */
function createSenatorEvent(
    definition: SenatorEventDefinition,
    senator: SenatorState
): SenatorEvent {
    // Convert choices, filtering by requirements
    const choices: SenatorEventChoice[] = definition.choices.map(choice => ({
        id: choice.id,
        text: choice.text,
        requirements: choice.requirements,
        effects: choice.effects,
    }));

    return {
        id: definition.id,
        senatorId: senator.id,
        title: definition.title,
        description: definition.description,
        choices,
        priority: definition.priority,
        roundTriggered: 0,  // Will be set when triggered
    };
}

// === INTRODUCTION EVENTS ===

/**
 * Get introduction events that should trigger
 * These are special events that introduce each senator
 */
export function getIntroductionEvents(
    senators: Record<SenatorId, SenatorState>,
    gameState: GameState,
    round: number
): SenatorEvent[] {
    const introEvents: SenatorEvent[] = [];

    // Introduction events trigger during rounds 2-5
    if (round < 2 || round > 5) return introEvents;

    for (const [id, senator] of Object.entries(senators) as [SenatorId, SenatorState][]) {
        // Skip if already introduced
        if (senator.introductionShown) continue;

        // Find the introduction event for this senator
        const events = getSenatorEvents(id);
        const introEvent = events.find(e =>
            e.id.includes('_old_oath') ||
            e.id.includes('_measure') ||
            e.id.includes('_streets') ||
            e.id.includes('_omens') ||
            e.id.includes('_web')
        );

        if (introEvent) {
            // For introductions, we're more lenient - only check round
            if (introEvent.minRound && round >= introEvent.minRound) {
                introEvents.push(createSenatorEvent(introEvent, senator));
            }
        }
    }

    // Only trigger one introduction per round to not overwhelm player
    return introEvents.slice(0, 1);
}

// === EVENT RESULT PROCESSING ===

export interface EventResolutionResult {
    chosenChoice: SenatorEventChoice;
    senatorId: SenatorId;
    eventId: string;
}

/**
 * Validate that a choice can be selected
 */
export function canSelectChoice(
    choice: SenatorEventChoice,
    gameState: GameState
): { valid: boolean; reason?: string } {
    if (!choice.requirements) {
        return { valid: true };
    }

    if (choice.requirements.denarii && gameState.denarii < choice.requirements.denarii) {
        return { valid: false, reason: `Requires ${choice.requirements.denarii} denarii` };
    }
    if (choice.requirements.troops && gameState.troops < choice.requirements.troops) {
        return { valid: false, reason: `Requires ${choice.requirements.troops} troops` };
    }
    if (choice.requirements.grain && gameState.inventory.grain < choice.requirements.grain) {
        return { valid: false, reason: `Requires ${choice.requirements.grain} grain` };
    }

    return { valid: true };
}

// Export all event sets for reference
export {
    SERTORIUS_EVENTS,
    SULLA_EVENTS,
    CLODIUS_EVENTS,
    PULCHER_EVENTS,
    OPPIUS_EVENTS,
};
