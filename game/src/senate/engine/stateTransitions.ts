// ============================================
// ROME EMPIRE BUILDER - State Transitions
// Manages senator state machine transitions
// ============================================

import type { GameState } from '@/core/types';
import type {
    SenatorId,
    SenatorState,
    SenatorStateName,
} from '@/core/types/senate';
import { STATE_TRANSITIONS } from '@/core/constants/senate';
import { evaluateTransitionConditions } from './evaluator';

// === STATE TRANSITION RESULT ===

export interface StateTransitionResult {
    transitioned: boolean;
    newState: SenatorStateName | null;
    reason: string | null;
    isTerminal: boolean;
    isLethal: boolean;
}

// === TERMINAL STATES ===

const TERMINAL_STATES: SenatorStateName[] = [
    // Sertorius
    'blood_brother',
    'disillusioned',
    // Sulla
    'enforcer',
    'coup',
    // Clodius
    'mob_patron',
    'broken',
    'assassination',
    // Pulcher
    'divine_mandate',
    'sacred_murder',
    // Oppius
    'inner_circle',
    'boring',
    'spider_revenge',
];

const LETHAL_STATES: SenatorStateName[] = [
    'coup',
    'assassination',
    'sacred_murder',
    'spider_revenge',
];

// === STATE VALIDATION ===

/**
 * Get valid states for a senator
 */
export function getValidStates(senatorId: SenatorId): SenatorStateName[] {
    switch (senatorId) {
        case 'sertorius':
            return ['steady_ally', 'cooling', 'distant', 'blood_brother', 'disillusioned'];
        case 'sulla':
            return ['evaluating', 'impressed', 'circling', 'rival', 'enforcer', 'coup'];
        case 'clodius':
            return ['wary', 'partnership', 'agitated', 'hostile', 'mob_patron', 'broken', 'assassination'];
        case 'pulcher':
            return ['observing', 'favored', 'concerned', 'disfavored', 'condemned', 'divine_mandate', 'sacred_murder'];
        case 'oppius':
            return ['watching', 'valued_client', 'distant', 'boring', 'inner_circle', 'exposed', 'spider_revenge'];
        default:
            return [];
    }
}

/**
 * Check if a state is valid for a senator
 */
export function isValidState(senatorId: SenatorId, state: string): boolean {
    return getValidStates(senatorId).includes(state as SenatorStateName);
}

/**
 * Check if a state is terminal (no further transitions)
 */
export function isTerminalState(state: SenatorStateName): boolean {
    return TERMINAL_STATES.includes(state);
}

/**
 * Check if a state is lethal (player death)
 */
export function isLethalState(state: SenatorStateName): boolean {
    return LETHAL_STATES.includes(state);
}

// === STATE TRANSITION LOGIC ===

/**
 * Evaluate and return the best valid state transition for a senator
 */
export function evaluateStateTransition(
    senator: SenatorState,
    gameState: GameState,
    round: number
): StateTransitionResult {
    const transitions = STATE_TRANSITIONS[senator.id] || [];

    // Check each transition rule in order
    for (const rule of transitions) {
        // Only consider transitions from current state
        if (rule.from !== senator.currentState) continue;

        // Evaluate conditions
        if (evaluateTransitionConditions(rule.conditions, senator, gameState, round)) {
            const newState = rule.to as SenatorStateName;
            return {
                transitioned: true,
                newState,
                reason: rule.description,
                isTerminal: isTerminalState(newState),
                isLethal: isLethalState(newState),
            };
        }
    }

    return {
        transitioned: false,
        newState: null,
        reason: null,
        isTerminal: false,
        isLethal: false,
    };
}

/**
 * Apply a state transition to a senator
 */
export function applyStateTransition(
    senator: SenatorState,
    newState: SenatorStateName,
    round: number
): SenatorState {
    return {
        ...senator,
        currentState: newState,
        stateEnteredRound: round,
    };
}

/**
 * Check if a specific transition is possible
 */
export function canTransitionTo(
    senator: SenatorState,
    targetState: SenatorStateName,
    gameState: GameState,
    round: number
): boolean {
    const transitions = STATE_TRANSITIONS[senator.id] || [];

    for (const rule of transitions) {
        if (rule.from !== senator.currentState) continue;
        if (rule.to !== targetState) continue;

        if (evaluateTransitionConditions(rule.conditions, senator, gameState, round)) {
            return true;
        }
    }

    return false;
}

/**
 * Get possible transitions from current state
 */
export function getPossibleTransitions(
    senator: SenatorState,
    gameState: GameState,
    round: number
): { state: SenatorStateName; description: string; meetsConditions: boolean }[] {
    const transitions = STATE_TRANSITIONS[senator.id] || [];
    const possible: { state: SenatorStateName; description: string; meetsConditions: boolean }[] = [];

    for (const rule of transitions) {
        if (rule.from !== senator.currentState) continue;

        possible.push({
            state: rule.to as SenatorStateName,
            description: rule.description,
            meetsConditions: evaluateTransitionConditions(rule.conditions, senator, gameState, round),
        });
    }

    return possible;
}

// === SPECIAL STATE HANDLERS ===

/**
 * Handle Sertorius BLOOD_BROTHER save mechanic
 * Returns true if Sertorius saved the player
 */
export function handleSeratoriusSave(
    senators: Record<SenatorId, SenatorState>,
    assassinatingSeantorId: SenatorId
): { saved: boolean; newSertoriusState: SenatorState | null } {
    // Parameter reserved for future logic based on who is assassinating
    void assassinatingSeantorId;
    const sertorius = senators.sertorius;

    // Sertorius can only save if he's BLOOD_BROTHER
    if (sertorius.currentState !== 'blood_brother') {
        return { saved: false, newSertoriusState: null };
    }

    // Sertorius sacrifices himself
    // He dies but the player lives
    const newSertorius: SenatorState = {
        ...sertorius,
        currentState: 'disillusioned', // Actually dead, but using this state
        relation: 100, // He loved you to the end
    };

    return { saved: true, newSertoriusState: newSertorius };
}

/**
 * Get the visual representation of state progression for UI
 */
export function getStateProgression(senatorId: SenatorId): {
    positive: SenatorStateName[];
    negative: SenatorStateName[];
    terminal: { good: SenatorStateName[]; bad: SenatorStateName[] };
} {
    switch (senatorId) {
        case 'sertorius':
            return {
                positive: ['steady_ally'],
                negative: ['cooling', 'distant'],
                terminal: { good: ['blood_brother'], bad: ['disillusioned'] },
            };
        case 'sulla':
            return {
                positive: ['impressed'],
                negative: ['evaluating', 'circling', 'rival'],
                terminal: { good: ['enforcer'], bad: ['coup'] },
            };
        case 'clodius':
            return {
                positive: ['partnership'],
                negative: ['wary', 'agitated', 'hostile'],
                terminal: { good: ['mob_patron'], bad: ['broken', 'assassination'] },
            };
        case 'pulcher':
            return {
                positive: ['favored'],
                negative: ['observing', 'concerned', 'disfavored', 'condemned'],
                terminal: { good: ['divine_mandate'], bad: ['sacred_murder'] },
            };
        case 'oppius':
            return {
                positive: ['valued_client'],
                negative: ['watching', 'distant'],
                terminal: { good: ['inner_circle'], bad: ['boring', 'exposed', 'spider_revenge'] },
            };
        default:
            return { positive: [], negative: [], terminal: { good: [], bad: [] } };
    }
}

/**
 * Get state sentiment (positive/negative/neutral)
 */
export function getStateSentiment(senatorId: SenatorId, state: SenatorStateName): 'positive' | 'negative' | 'neutral' | 'terminal_good' | 'terminal_bad' {
    const progression = getStateProgression(senatorId);

    if (progression.terminal.good.includes(state)) return 'terminal_good';
    if (progression.terminal.bad.includes(state)) return 'terminal_bad';
    if (progression.positive.includes(state)) return 'positive';
    if (progression.negative.includes(state)) return 'negative';

    return 'neutral';
}
