// ============================================
// ROME EMPIRE BUILDER - Senate System Constants
// ============================================

import type {
    SenatorId,
    SenatorDefinition,
    StateTransitionRule,
    AttentionEffectTier,
    SenatorState,
    SenatorFlags,
    SenatorTracking,
    AssassinationState,
    AttentionAllocation,
} from '@/core/types/senate';

// === SENATOR DEFINITIONS ===

export const SENATORS: Record<SenatorId, SenatorDefinition> = {
    sertorius: {
        id: 'sertorius',
        name: 'Gaius Sertorius',
        cognomen: 'The Scarred Hand',
        role: 'Military Loyalist',
        faction: 'militares',
        canAssassinate: false,

        personality: {
            greed: 5,
            ambition: 25,
            honor: 95,
            ideology: 70,
            cunning: 20,
        },

        startingRelation: 45,
        startingState: 'steady_ally',
        reactionSpeed: 'very_slow',
        memoryLength: 'permanent',

        backstory: `Gaius lost three fingers at Vercellae holding a breach that should have killed him. Your father pulled him out. That debt transferred to you the day the old man died.

He's not sophisticated. Doesn't care about money, hates politics, prays to Mars like the legions did a century ago. He believes Rome's virtue lives in its soldiers — the farmers who pick up swords, fight, and go home to their fields. Everything else is corruption.

You trained together as boys. He's seen you vomit from exhaustion, weep over your first kill, laugh at stupid jokes. He knows who you are beneath the title. That's why his disappointment cuts deeper than any enemy's blade.

He doesn't want power. He wants to believe the Republic still means something. He's chosen you as proof.`,

        wants: [
            'Military victories won with honor',
            'Fair treatment of soldiers and veterans',
            'No assassinations, no poison, no backstabbing',
            'Your success through legitimate means',
        ],
        hates: [
            'Political scheming and manipulation',
            'Betrayal of oaths and promises',
            'Cruelty to the defenseless',
            'You becoming what he fights against',
        ],
    },

    sulla: {
        id: 'sulla',
        name: 'Lucius Sulla',
        cognomen: 'The Butcher of Capua',
        role: 'Military Ambitious',
        faction: 'militares',
        canAssassinate: true,
        assassinationMethod: 'Military Coup',

        personality: {
            greed: 50,
            ambition: 95,
            honor: 25,
            ideology: 30,
            cunning: 85,
        },

        startingRelation: 0,
        startingState: 'evaluating',
        reactionSpeed: 'immediate',
        memoryLength: 'permanent',

        backstory: `The slave revolt at Capua lasted six days. Lucius ended it in one afternoon. The roads were lined with crosses for twelve miles. He didn't flinch. He didn't enjoy it either — that's what unnerves people. He simply did what he calculated was necessary, then washed his hands and ate dinner.

Lucius sees Rome clearly: a wolf among sheep, growing fat and slow. The Republic is a pleasant fiction senators tell themselves while the empire rots. Someone will seize power eventually. He's deciding if it should be him.

He's watching you with professional interest. Conquer territory, and he notes your tactics. Crush a rebellion, and he measures your ruthlessness. Show mercy, and he marks it as weakness — unless the mercy was strategic, in which case he's impressed.

He doesn't hate you. He doesn't like you. He's evaluating whether you're the horse to back or the obstacle to remove.`,

        wants: [
            'Military expansion and conquest',
            'Decisive action over deliberation',
            'Strength rewarded, weakness punished',
            'A patron worth following — or a vacancy to fill',
        ],
        hates: [
            'Hesitation and indecisiveness',
            'Moralizing about necessary actions',
            'Anyone who confuses kindness for strategy',
            'Weakness in any form',
        ],
    },

    clodius: {
        id: 'clodius',
        name: 'Publius Clodius',
        cognomen: "The Plebeian's Fist",
        role: 'Populist Demagogue',
        faction: 'populares',
        canAssassinate: true,
        assassinationMethod: 'Mob Violence',

        personality: {
            greed: 60,
            ambition: 70,
            honor: 10,
            ideology: 75,
            cunning: 90,
        },

        startingRelation: -10,
        startingState: 'wary',
        reactionSpeed: 'immediate',
        memoryLength: 'short',

        backstory: `Born patrician. Then born again.

Caught defiling the Bona Dea rites — dressed as a woman to reach a senator's wife — he should have been executed. Instead the optimates made him watch them laugh. Exile from polite society. Every door closed. Every former friend suddenly busy.

So he went to the only people who'd have him: the mob. He gave up his patrician status legally, became a plebeian, and ran for Tribune. Now he controls the collegia — the "unions" of bakers, dockworkers, builders. They're part guild, part gang. When Publius speaks, ten thousand men listen.

He tells the plebs he's their champion. He even believes it, sometimes. But mostly he believes in revenge. The aristocrats who mocked him? He's burned two of their houses. Legally, through "unfortunate riots."

He looks at you and sees... potential. Are you one of them? Or could you be useful?`,

        wants: [
            'Grain for the people (and credit for providing it)',
            'Aristocrats humiliated and weakened',
            'His monopoly on popular support unchallenged',
            'Tribute and respect from those in power',
        ],
        hates: [
            'Optimates (all of them, on principle)',
            'Anyone more popular with the mob than him',
            'Order imposed from above without his blessing',
            'Being ignored or dismissed',
        ],
    },

    pulcher: {
        id: 'pulcher',
        name: 'Appius Pulcher',
        cognomen: 'The Voice of Jupiter',
        role: 'Religious Authority',
        faction: 'religious',
        canAssassinate: true,
        assassinationMethod: 'Sacred Poisoning',

        personality: {
            greed: 10,
            ambition: 40,
            honor: 70,
            ideology: 95,
            cunning: 45,
        },

        startingRelation: 5,
        startingState: 'observing',
        reactionSpeed: 'slow',
        memoryLength: 'permanent',

        backstory: `Appius was a mediocre priest until the fever.

Three days of delirium. He says Jupiter spoke to him — showed him Rome burning, showed him the gods departing, showed him what happens when mortals forget their place. He woke certain of one thing: Rome's survival depends on piety, and piety has been neglected.

Now he's Pontifex — not Maximus, not yet, but close. He controls the religious calendar, interprets omens, advises on which days are auspicious for battle or legislation. Half the Senate thinks he's a harmless eccentric. The other half saw what happened to Gaius Flavius, who publicly mocked the gods. Fell from his horse a week later. Broke his neck.

Appius didn't do anything. Jupiter did. He's certain of that.

He looks at you and sees... potential. Your piety will determine Rome's fate. He's watching which gods you honor, how often you sacrifice, whether your words match your offerings.`,

        wants: [
            'Temples built and properly maintained',
            'Festivals observed with genuine devotion',
            'The gods respected above political convenience',
            'Signs that you take the divine seriously',
        ],
        hates: [
            'Impiety (neglecting sacrifices, ignoring omens)',
            'Foreign cults diluting Roman religion',
            'Anyone who treats religion as mere political tool',
            'Mockery of the sacred',
        ],
    },

    oppius: {
        id: 'oppius',
        name: 'Lucius Oppius',
        cognomen: 'The Whisper',
        role: 'Spymaster',
        faction: 'none',
        canAssassinate: true,
        assassinationMethod: 'Professional Assassination',

        personality: {
            greed: 30,
            ambition: 50,
            honor: 20,
            ideology: 15,
            cunning: 99,
        },

        startingRelation: 0,
        startingState: 'watching',
        reactionSpeed: 'none',
        memoryLength: 'perfect',

        backstory: `No one remembers when Lucius Oppius arrived in Rome. He has no family anyone can trace. No military service. No great speeches. He holds no office, sponsors no games, owns no visible property.

And yet.

When Consul Metellus died of "bad fish," Oppius was seen leaving his house that morning. When Senator Drusus changed his vote on the grain bill, Oppius had dined with him the night before. When the Hispanian revolt failed because someone betrayed the rebels' plans... well.

He trades in secrets. Not for money — he seems to have enough. Not for power — he refuses every office. For the game itself. He likes knowing things. He likes being the one others come to when they need to know things.

He looks at you and sees... a new piece on the board. Interesting. Let's see how you play.`,

        wants: [
            'Access to power without holding it',
            'Interesting pieces on the board',
            'The game to continue (chaos and order both bore him)',
            'Secrets to trade',
        ],
        hates: [
            'Predictability',
            'Being ignored or undervalued',
            'Anyone who thinks they understand him',
            'Boring players who make obvious moves',
        ],
    },
};

// === STATE TRANSITION RULES ===

export const STATE_TRANSITIONS: Record<SenatorId, StateTransitionRule[]> = {
    sertorius: [
        {
            from: 'steady_ally',
            to: 'cooling',
            conditions: { minRound: 9, maxRelation: 35 },
            description: 'Neglect or minor disappointment',
        },
        {
            from: 'steady_ally',
            to: 'blood_brother',
            conditions: { minRound: 32, minRelation: 80, requiredFlags: { honorable: 4 } },
            description: 'Consistent honor and loyalty over time',
        },
        {
            from: 'cooling',
            to: 'steady_ally',
            conditions: { minRelation: 40, requiredFlags: { honorable: 2 } },
            description: 'Reconciliation through honorable action',
        },
        {
            from: 'cooling',
            to: 'distant',
            conditions: { minRound: 16, maxRelation: 20 },
            description: 'Continued neglect or second disappointment',
        },
        {
            from: 'distant',
            to: 'cooling',
            conditions: { minRelation: 30 },
            description: 'Difficult reconciliation attempt',
        },
        {
            from: 'distant',
            to: 'disillusioned',
            conditions: { minRound: 16, requiredFlags: { disappointment: 3 } },
            description: 'Betrayal witnessed or repeated dishonor',
        },
    ],

    sulla: [
        {
            from: 'evaluating',
            to: 'impressed',
            conditions: { minRound: 12, minRelation: 30 },
            description: 'Demonstrated strength earns respect',
        },
        {
            from: 'evaluating',
            to: 'circling',
            conditions: { minRound: 9, maxRelation: -20 },
            description: 'Shown weakness or hesitation',
        },
        {
            from: 'impressed',
            to: 'enforcer',
            conditions: { minRound: 28, minRelation: 60, requiredFlags: { ruthless: 2 } },
            description: 'Proven ruthlessness and power',
        },
        {
            from: 'impressed',
            to: 'evaluating',
            conditions: { maxRelation: 15 },
            description: 'Fallen from grace',
        },
        {
            from: 'circling',
            to: 'evaluating',
            conditions: { minRelation: 0 },
            description: 'Recovered from weakness',
        },
        {
            from: 'circling',
            to: 'rival',
            conditions: { minRound: 20, maxRelation: -40 },
            description: 'Continued weakness confirms threat assessment',
        },
        {
            from: 'rival',
            to: 'coup',
            conditions: { minRound: 24, maxRelation: -60, playerStats: { troops: { op: 'lt', value: 100 } } },
            description: 'Weak enough to remove',
        },
    ],

    clodius: [
        {
            from: 'wary',
            to: 'partnership',
            conditions: { minRound: 12, minRelation: 25 },
            description: 'Deal made and honored',
        },
        {
            from: 'wary',
            to: 'agitated',
            conditions: { minRound: 6, maxRelation: -25 },
            description: 'Snubbed or refused tribute',
        },
        {
            from: 'partnership',
            to: 'mob_patron',
            conditions: { minRound: 24, minRelation: 50, requiredFlags: { interesting: 2 } },
            description: 'Consistent tribute and respect',
        },
        {
            from: 'partnership',
            to: 'wary',
            conditions: { maxRelation: 15 },
            description: 'Relationship cooling',
        },
        {
            from: 'agitated',
            to: 'wary',
            conditions: { minRelation: -10 },
            description: 'Concession made',
        },
        {
            from: 'agitated',
            to: 'hostile',
            conditions: { minRound: 14, maxRelation: -45 },
            description: 'No concession given',
        },
        {
            from: 'hostile',
            to: 'agitated',
            conditions: { minRelation: -35 },
            description: 'Major tribute paid',
        },
        {
            from: 'hostile',
            to: 'broken',
            conditions: { minRound: 20, playerStats: { troops: { op: 'gt', value: 150 } } },
            description: 'Military suppression',
        },
        {
            from: 'hostile',
            to: 'assassination',
            conditions: { minRound: 24, maxRelation: -70, playerStats: { happiness: { op: 'lt', value: 40 } } },
            description: 'Mob turned fully against player',
        },
    ],

    pulcher: [
        {
            from: 'observing',
            to: 'favored',
            conditions: { minRound: 16, minRelation: 35, requiredFlags: { pious: 2 } },
            description: 'Consistent piety noted',
        },
        {
            from: 'observing',
            to: 'concerned',
            conditions: { minRound: 8, maxRelation: -15 },
            description: 'Impious acts observed',
        },
        {
            from: 'favored',
            to: 'divine_mandate',
            conditions: { minRound: 28, minRelation: 70, requiredFlags: { pious: 4 } },
            description: 'Declared chosen by the gods',
        },
        {
            from: 'favored',
            to: 'observing',
            conditions: { maxRelation: 25 },
            description: 'Piety lapsed',
        },
        {
            from: 'concerned',
            to: 'observing',
            conditions: { minRelation: 0 },
            description: 'Returned to proper observance',
        },
        {
            from: 'concerned',
            to: 'disfavored',
            conditions: { minRound: 16, maxRelation: -30, requiredFlags: { impious: 2 } },
            description: 'Continued impiety',
        },
        {
            from: 'disfavored',
            to: 'condemned',
            conditions: { minRound: 24, maxRelation: -50, requiredFlags: { impious: 3 } },
            description: 'Public denunciation',
        },
        {
            from: 'condemned',
            to: 'sacred_murder',
            conditions: { minRound: 28, maxRelation: -60, playerStats: { piety: { op: 'lt', value: 20 } } },
            description: 'The gods demand sacrifice',
        },
    ],

    oppius: [
        {
            from: 'watching',
            to: 'valued_client',
            conditions: { minRound: 12, minRelation: 20 },
            description: 'Engaged in intelligence trade',
        },
        {
            from: 'watching',
            to: 'distant',
            conditions: { minRound: 8 },
            description: 'No transactions, predictable behavior',
        },
        {
            from: 'valued_client',
            to: 'inner_circle',
            conditions: { minRound: 24, minRelation: 50, requiredFlags: { interesting: 5 } },
            description: 'Made the game interesting',
        },
        {
            from: 'valued_client',
            to: 'watching',
            conditions: { maxRelation: 10 },
            description: 'Reduced engagement',
        },
        {
            from: 'distant',
            to: 'boring',
            conditions: { minRound: 16 },
            description: 'Remained predictable too long',
        },
        {
            from: 'distant',
            to: 'watching',
            conditions: { minRelation: 15 },
            description: 'Became interesting again',
        },
        // Special: Any state -> exposed -> spider_revenge happens via event, not auto-transition
    ],
};

// === ATTENTION EFFECT TIERS ===

export const ATTENTION_TIERS: AttentionEffectTier[] = [
    {
        minAttention: 0,
        maxAttention: 10,
        description: 'Neglect',
        relationDrift: -3,
        eventChance: 0.2,
        warningChance: 0.1,
    },
    {
        minAttention: 11,
        maxAttention: 20,
        description: 'Maintenance',
        relationDrift: -1,
        eventChance: 0.5,
        warningChance: 0.4,
    },
    {
        minAttention: 21,
        maxAttention: 30,
        description: 'Engaged',
        relationDrift: 1,
        eventChance: 0.8,
        warningChance: 0.7,
    },
    {
        minAttention: 31,
        maxAttention: 100,
        description: 'Focused',
        relationDrift: 3,
        eventChance: 1.0,
        warningChance: 0.95,
    },
];

// === DEFAULT ATTENTION ALLOCATION ===

export const DEFAULT_ATTENTION: AttentionAllocation = {
    sertorius: 20,
    sulla: 20,
    clodius: 20,
    pulcher: 20,
    oppius: 20,
};

// === PRESET ATTENTION STRATEGIES ===

export const ATTENTION_PRESETS: Record<string, { name: string; allocation: AttentionAllocation }> = {
    balanced: {
        name: 'Balanced',
        allocation: { sertorius: 20, sulla: 20, clodius: 20, pulcher: 20, oppius: 20 },
    },
    military: {
        name: 'Military Focus',
        allocation: { sertorius: 35, sulla: 35, clodius: 10, pulcher: 10, oppius: 10 },
    },
    popular: {
        name: 'Popular Support',
        allocation: { sertorius: 15, sulla: 10, clodius: 40, pulcher: 25, oppius: 10 },
    },
    divine: {
        name: 'Divine Favor',
        allocation: { sertorius: 20, sulla: 10, clodius: 10, pulcher: 40, oppius: 20 },
    },
    intelligence: {
        name: 'Spymaster',
        allocation: { sertorius: 15, sulla: 15, clodius: 15, pulcher: 15, oppius: 40 },
    },
    threat: {
        name: 'Threat Mitigation',
        allocation: { sertorius: 10, sulla: 30, clodius: 30, pulcher: 10, oppius: 20 },
    },
};

// === GRACE PERIOD SETTINGS ===

export const SENATE_GRACE_PERIOD_ROUNDS = 4;

// === EVENT COOLDOWNS ===

export const SENATOR_EVENT_COOLDOWNS = {
    same_senator_popup: 3,
    state_transition: 2,
    assassination_warning: 4,
    dark_offer: 5,          // Sulla
    demand: 4,              // Clodius
    omen_reading: 4,        // Pulcher
    intelligence_offer: 3,  // Oppius
};

// === HELPER FUNCTIONS ===

export function createInitialSenatorFlags(): SenatorFlags {
    return {
        honorable: 0,
        dishonorable: 0,
        ruthless: 0,
        pious: 0,
        impious: 0,
        interesting: 0,
        disappointment: 0,
    };
}

export function createInitialSenatorTracking(): SenatorTracking {
    return {
        attentionTotal: 0,
        attentionRecent: [],
        dealsMade: 0,
        dealsBroken: 0,
        secretsShared: 0,
        templesBuilt: 0,
    };
}

export function createInitialAssassinationState(): AssassinationState {
    return {
        windowOpen: false,
        warningGiven: false,
        turnsUntilAttempt: null,
    };
}

export function createInitialSenatorState(id: SenatorId): SenatorState {
    const def = SENATORS[id];
    return {
        id,
        name: def.name,
        cognomen: def.cognomen,
        faction: def.faction,
        currentState: def.startingState,
        relation: def.startingRelation,
        stateEnteredRound: 1,
        flags: createInitialSenatorFlags(),
        tracking: createInitialSenatorTracking(),
        assassination: createInitialAssassinationState(),
        cooldowns: {},
        lastEventRound: 0,
        introductionShown: false,
    };
}

export function createInitialSenators(): Record<SenatorId, SenatorState> {
    return {
        sertorius: createInitialSenatorState('sertorius'),
        sulla: createInitialSenatorState('sulla'),
        clodius: createInitialSenatorState('clodius'),
        pulcher: createInitialSenatorState('pulcher'),
        oppius: createInitialSenatorState('oppius'),
    };
}

// === RELATION BOUNDS ===

export const RELATION_MIN = -100;
export const RELATION_MAX = 100;

export function clampRelation(relation: number): number {
    return Math.max(RELATION_MIN, Math.min(RELATION_MAX, relation));
}

// === GET ATTENTION TIER ===

export function getAttentionTier(attention: number): AttentionEffectTier {
    for (const tier of ATTENTION_TIERS) {
        if (attention >= tier.minAttention && attention <= tier.maxAttention) {
            return tier;
        }
    }
    return ATTENTION_TIERS[0]; // Default to neglect
}

// === SENATOR DISPLAY HELPERS ===

export function getSenatorStateDescription(id: SenatorId, state: string): string {
    // Use composite key (senator_state) for states that exist in multiple senators
    const descriptions: Record<string, string> = {
        // Sertorius
        steady_ally: 'Your loyal friend and supporter.',
        cooling: 'Growing distant. Something troubles him.',
        sertorius_distant: 'Formal only. The friendship has faded.',
        blood_brother: 'Unshakeable loyalty. He would die for you.',
        disillusioned: 'Gone. He could not watch what you became.',

        // Sulla
        evaluating: 'Watching. Measuring your worth.',
        impressed: 'Respects your strength. Dark offers may follow.',
        circling: 'Smells weakness. Patience wearing thin.',
        rival: 'Open opposition. Building his coalition.',
        enforcer: 'Your attack dog. Point him at your enemies.',
        coup: 'His legions march on Rome.',

        // Clodius
        wary: 'Testing you. Demands may come.',
        partnership: 'Business arrangement. Tribute expected.',
        agitated: 'Threats escalating. Concessions needed.',
        hostile: 'The streets are his. Your city burns slowly.',
        mob_patron: 'The mob is yours. Point them at anyone.',
        broken: 'Exiled. The streets are quiet.',
        assassination: 'The riot that ends you.',

        // Pulcher
        observing: 'Reading the signs. Watching your piety.',
        favored: 'The gods smile upon you.',
        concerned: 'Warnings given. Omens uncertain.',
        disfavored: 'Bad omens shadow your endeavors.',
        condemned: 'Publicly denounced. Heaven turns away.',
        divine_mandate: 'Chosen by the gods themselves.',
        sacred_murder: 'The gods demand their due.',

        // Oppius
        watching: 'Observing. Measuring your interest.',
        valued_client: 'Regular intelligence exchange.',
        oppius_distant: 'Minimal contact. You bore him.',
        boring: 'Disengaged. Not worth watching.',
        inner_circle: 'First pick of secrets. Professional courtesy.',
        exposed: 'You tried to kill him. He knows.',
        spider_revenge: 'His insurance triggers.',
    };

    // Handle states that exist in multiple senators
    if (state === 'distant') {
        const key = `${id}_distant`;
        return descriptions[key] || 'Status unknown.';
    }

    return descriptions[state] || 'Status unknown.';
}

export function getSenatorDangerLevel(senator: SenatorState): 'safe' | 'warning' | 'danger' | 'critical' {
    const id = senator.id;
    const state = senator.currentState;
    const relation = senator.relation;

    // Sertorius can't kill you
    if (id === 'sertorius') return 'safe';

    // Check assassination window
    if (senator.assassination.windowOpen) return 'critical';

    // Check dangerous states
    const dangerStates = ['rival', 'hostile', 'condemned', 'exposed'];
    if (dangerStates.includes(state)) return 'danger';

    // Check warning states
    const warningStates = ['circling', 'agitated', 'disfavored', 'concerned'];
    if (warningStates.includes(state)) return 'warning';

    // Check relation thresholds
    if (relation <= -50) return 'danger';
    if (relation <= -25) return 'warning';

    return 'safe';
}
