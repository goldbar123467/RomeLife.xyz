// ============================================
// ROME EMPIRE BUILDER - Senate System Types
// ============================================

// === SENATOR IDENTIFIERS ===

export type SenatorId = 'sertorius' | 'sulla' | 'clodius' | 'pulcher' | 'oppius';

// === STATE TYPES PER SENATOR ===

export type SertoriusState =
    | 'steady_ally'      // Starting state, +45 relation
    | 'cooling'          // Growing distant
    | 'distant'          // Formal only
    | 'blood_brother'    // Unshakeable loyalty (round 32+)
    | 'disillusioned';   // Leaves Rome forever

export type SullaState =
    | 'evaluating'       // Starting state, watching
    | 'impressed'        // Respect, dark offers begin
    | 'circling'         // Smells weakness
    | 'rival'            // Active opposition
    | 'enforcer'         // Your attack dog (round 28+)
    | 'coup';            // Civil war (game ending)

export type ClodiusState =
    | 'wary'             // Starting state, testing
    | 'partnership'      // Business relationship
    | 'agitated'         // Escalating threats
    | 'hostile'          // Active mob actions
    | 'mob_patron'       // Streets are yours (round 24+)
    | 'broken'           // Exiled
    | 'assassination';   // Player death

export type PulcherState =
    | 'observing'        // Starting state, watching piety
    | 'favored'          // Good omens, support
    | 'concerned'        // Warnings, uncertain omens
    | 'disfavored'       // Bad omens, penalties
    | 'condemned'        // Public denunciation
    | 'divine_mandate'   // Chosen by gods (round 28+)
    | 'sacred_murder';   // Player death

export type OppiusState =
    | 'watching'         // Starting state, observing
    | 'valued_client'    // Regular intelligence
    | 'distant'          // Minimal contact
    | 'boring'           // Disengaged entirely
    | 'inner_circle'     // First pick of secrets (round 24+)
    | 'exposed'          // Failed assassination attempt
    | 'spider_revenge';  // Player death

// Union of all possible states
export type SenatorStateName =
    | SertoriusState
    | SullaState
    | ClodiusState
    | PulcherState
    | OppiusState;

// === SENATOR FACTION ===

export type SenatorFaction = 'militares' | 'populares' | 'religious' | 'none';

// === BEHAVIORAL FLAGS ===

export interface SenatorFlags {
    honorable: number;      // Accumulated from honorable actions
    dishonorable: number;   // Accumulated from dishonorable actions
    ruthless: number;       // Accumulated from ruthless actions
    pious: number;          // Accumulated from pious actions
    impious: number;        // Accumulated from impious actions
    interesting: number;    // Accumulated from unpredictable/clever actions
    disappointment: number; // Sertorius-specific: tracks letdowns
}

// === SENATOR TRACKING ===

export interface SenatorTracking {
    attentionTotal: number;         // Lifetime attention received
    attentionRecent: number[];      // Last 4 seasons of attention
    dealsMade: number;              // Successful deals/agreements
    dealsBroken: number;            // Broken promises
    secretsShared: number;          // Secrets traded (mainly Oppius)
    templesBuilt: number;           // Temples built (mainly Pulcher)
}

// === ASSASSINATION TRACKING ===

export interface AssassinationState {
    windowOpen: boolean;            // Can currently attempt assassination
    warningGiven: boolean;          // Has warning been shown
    turnsUntilAttempt: number | null; // Countdown to attempt (null = not active)
}

// === INDIVIDUAL SENATOR STATE ===

export interface SenatorState {
    id: SenatorId;
    name: string;
    cognomen: string;               // Nickname/title
    faction: SenatorFaction;

    // State machine
    currentState: SenatorStateName;
    relation: number;               // -100 to +100
    stateEnteredRound: number;      // When current state began

    // Behavioral tracking
    flags: SenatorFlags;
    tracking: SenatorTracking;

    // Danger tracking
    assassination: AssassinationState;

    // Event management
    cooldowns: Record<string, number>;  // Event type -> rounds remaining
    lastEventRound: number;
    introductionShown: boolean;         // Has intro event been shown
}

// === ATTENTION ALLOCATION ===

export interface AttentionAllocation {
    sertorius: number;
    sulla: number;
    clodius: number;
    pulcher: number;
    oppius: number;
}

// === SENATOR EVENTS ===

export interface SenatorEventChoice {
    id: string;
    text: string;
    requirements?: {
        denarii?: number;
        troops?: number;
        grain?: number;
        relation?: number;
        state?: SenatorStateName;
    };
    effects: SenatorChoiceEffects;
}

export interface SenatorChoiceEffects {
    relationChanges?: Partial<Record<SenatorId, number>>;
    flagChanges?: Partial<SenatorFlags>;
    resourceChanges?: {
        denarii?: number;
        grain?: number;
        happiness?: number;
        morale?: number;
        reputation?: number;
        piety?: number;
        troops?: number;
    };
    stateChange?: SenatorStateName;
    queuedActions?: QueuedSenatorActionDefinition[];
    specialEffects?: SenatorSpecialEffect[];
}

export type SenatorSpecialEffect =
    // Assassination effects
    | 'assassination_window_opens'
    | 'assassination_window_closes'
    // Secret/information effects
    | 'secret_created'
    | 'secret_revealed'
    // Senator fate effects
    | 'senator_leaves'
    | 'senator_dies'
    // Player fate effects
    | 'player_saved'
    | 'player_dies'
    // State transition effects (trigger immediate state change)
    | 'state_to_blood_brother'
    | 'state_to_disillusioned'
    | 'state_to_enforcer'
    | 'state_to_coup'
    | 'state_to_mob_patron'
    | 'state_to_broken'
    | 'state_to_agitated'
    | 'state_to_divine_mandate'
    | 'state_to_sacred_murder'
    | 'state_to_inner_circle'
    | 'state_to_boring'
    | 'state_to_spider_revenge';

/**
 * Runtime senator event (displayed to player)
 * Created from SenatorEventDefinition when triggered
 */
export interface SenatorEvent {
    id: string;
    senatorId: SenatorId;
    title: string;
    description: string;            // Narrative text with flavor
    flavorText?: string;            // Italic quote from senator
    choices: SenatorEventChoice[];
    priority: number;               // For display ordering
    roundTriggered: number;         // Round when this event was triggered
}

// === EVENT DEFINITION (Static definition for event files) ===

export interface SenatorEventDefinitionChoice {
    id: string;
    text: string;
    requirements?: {
        denarii?: number;
        troops?: number;
        grain?: number;
        relation?: number;
    };
    conditions?: StateTransitionConditions;  // Additional conditions for this choice
    effects: SenatorChoiceEffects;
}

export interface SenatorEventDefinition {
    id: string;
    senatorId: SenatorId;
    title: string;
    description: string;
    priority: number;
    validStates: SenatorStateName[];
    minRound?: number;
    maxRound?: number;
    cooldown: number;                // 0 = one-time event
    conditions?: StateTransitionConditions;
    choices: SenatorEventDefinitionChoice[];
}

// === DELAYED ACTIONS ===

/**
 * Queued action definition in event files (id and resolved added at runtime)
 */
export interface QueuedSenatorActionDefinition {
    senatorId: SenatorId;
    actionType: string;
    triggerRound: number;           // Can be 0 if using delaySeasons
    delaySeasons?: number;          // Delay from current round (converted to triggerRound)
    sourceEvent: string;            // Event that created this action
    effects: Partial<SenatorChoiceEffects>;
}

/**
 * Full queued action with runtime-generated fields
 */
export interface QueuedSenatorAction extends QueuedSenatorActionDefinition {
    id: string;
    resolved: boolean;
}

// === PLAYER ACTION FOR SENATE TRACKING ===

export interface PlayerActionForSenate {
    type: 'worship' | 'battle' | 'trade' | 'build' | 'recruit' | 'diplomacy' | 'tax_change' | 'territory' | 'emergency';
    round: number;
    details: Record<string, unknown>;
}

// === COMPLETE SENATE STATE ===

export interface SenateState {
    initialized: boolean;
    senators: Record<SenatorId, SenatorState>;

    // Attention
    attentionThisSeason: AttentionAllocation | null;
    attentionLocked: boolean;       // Can't change after season starts

    // Events
    pendingEvents: SenatorEvent[];
    currentEvent: SenatorEvent | null;
    eventHistory: { eventId: string; choiceId: string; round: number }[];

    // Delayed effects
    actionQueue: QueuedSenatorAction[];

    // Learning period (rounds 1-4)
    gracePhaseComplete: boolean;
    playerActionLog: PlayerActionForSenate[];

    // Global flags
    anyAssassinationAttempted: boolean;
    senatoriusSavedPlayer: boolean;
}

// === SENATOR DEFINITION (STATIC DATA) ===

export interface SenatorDefinition {
    id: SenatorId;
    name: string;
    cognomen: string;
    role: string;                   // "Military Loyalist", "Mob Boss", etc.
    faction: SenatorFaction;
    canAssassinate: boolean;
    assassinationMethod?: string;   // "Military Coup", "Mob Violence", etc.

    // Personality matrix (0-100)
    personality: {
        greed: number;
        ambition: number;
        honor: number;
        ideology: number;
        cunning: number;
    };

    // Starting values
    startingRelation: number;
    startingState: SenatorStateName;

    // Reaction characteristics
    reactionSpeed: 'immediate' | 'slow' | 'very_slow' | 'none';
    memoryLength: 'short' | 'permanent' | 'perfect';

    // Full backstory
    backstory: string;
    wants: string[];
    hates: string[];
}

// === STATE TRANSITION RULES ===

export interface StateTransitionRule {
    from: SenatorStateName;
    to: SenatorStateName;
    conditions: StateTransitionConditions;
    description: string;            // What triggers this transition
}

export interface StateTransitionConditions {
    minRound?: number;
    maxRound?: number;
    minRelation?: number;
    maxRelation?: number;
    requiredFlags?: Partial<SenatorFlags>;
    playerStats?: {
        troops?: { op: 'lt' | 'gt' | 'lte' | 'gte' | 'eq'; value: number };
        happiness?: { op: 'lt' | 'gt' | 'lte' | 'gte' | 'eq'; value: number };
        piety?: { op: 'lt' | 'gt' | 'lte' | 'gte' | 'eq'; value: number };
        denarii?: { op: 'lt' | 'gt' | 'lte' | 'gte' | 'eq'; value: number };
    };
    otherSenatorConditions?: {
        senatorId: SenatorId;
        states?: SenatorStateName[];
        minRelation?: number;
        maxRelation?: number;
    }[];
}

// === ATTENTION EFFECT TIERS ===

export interface AttentionEffectTier {
    minAttention: number;
    maxAttention: number;
    description: string;
    relationDrift: number;          // Per-season relation change
    eventChance: number;            // Multiplier for event triggers
    warningChance: number;          // Chance to hear about plots
}

// === SEASON RESULT FROM SENATE PROCESSING ===

export interface SenateSeasonResult {
    // State updates
    newSenateState: SenateState;

    // Effects on main game state
    happinessChange: number;
    moraleChange: number;
    denariiChange: number;
    reputationChange: number;
    pietyChange: number;

    // Events to display
    triggeredEvents: SenatorEvent[];

    // Danger
    assassination?: {
        senatorId: SenatorId;
        method: string;
        savedBySertorius: boolean;
    };

    // Messages for event log
    messages: string[];
}
