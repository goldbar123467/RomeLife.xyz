// ============================================
// ROME EMPIRE BUILDER - Sertorius Events
// Events for Gaius Sertorius (The Soldier's Friend)
// ============================================

import type { SenatorEventDefinition } from '@/core/types/senate';

/**
 * SERTORIUS EVENT DEFINITIONS
 *
 * Sertorius is the military loyalist who values honor above all.
 * His events focus on:
 * - Military campaigns and soldier welfare
 * - Honorable vs dishonorable choices
 * - Building trust through consistency
 * - Terminal paths: BLOOD_BROTHER (saves you) or DISILLUSIONED (leaves)
 */

export const SERTORIUS_EVENTS: SenatorEventDefinition[] = [
    // === INTRODUCTION EVENT (Round 2-3) ===
    {
        id: 'sertorius_old_oath',
        senatorId: 'sertorius',
        title: 'The Old Oath',
        description: `Gaius Sertorius approaches you after the Senate session. His weathered face carries the scars of a dozen campaigns, but his eyes hold something rare in Rome — sincerity.

"I served with your father once. He was a man of his word. I'm hoping the blood runs true."

He extends his hand in the old military fashion — wrist to wrist.

"Rome needs leaders who remember what honor means. Are you one of them?"`,
        priority: 100,
        validStates: ['steady_ally'],
        minRound: 2,
        maxRound: 4,
        cooldown: 0,  // Introduction, once only
        conditions: {},
        choices: [
            {
                id: 'accept_oath',
                text: 'Clasp his wrist firmly. "On my family\'s honor, I remember."',
                effects: {
                    relationChanges: { sertorius: 10 },
                    flagChanges: { honorable: 1 },
                },
            },
            {
                id: 'hesitate',
                text: 'Hesitate, then accept. "I\'ll try to live up to that."',
                effects: {
                    relationChanges: { sertorius: 5 },
                },
            },
            {
                id: 'dismiss',
                text: 'Pull away. "I make my own path, old soldier."',
                effects: {
                    relationChanges: { sertorius: -10 },
                    flagChanges: { disappointment: 1 },
                },
            },
        ],
    },

    // === RECURRING EVENT: THE COUNSEL ===
    {
        id: 'sertorius_counsel',
        senatorId: 'sertorius',
        title: 'The Counsel',
        description: `Sertorius finds you reviewing military dispatches and settles into a chair without invitation — the privilege of an old soldier who's earned it.

"The men are talking. They always do. What they say depends on what they see from above."

He taps a dispatch. "There's a campaign coming. I could lead the men myself — but I want you to know I trust you with them. Say the word, and they're yours to command."`,
        priority: 70,
        validStates: ['steady_ally', 'cooling'],
        minRound: 6,
        cooldown: 6,
        conditions: {
            minRelation: 20,
        },
        choices: [
            {
                id: 'accept_command',
                text: 'Accept. "I\'ll command them myself. The men need to see their leader."',
                effects: {
                    relationChanges: { sertorius: 15 },
                    flagChanges: { honorable: 1 },
                    resourceChanges: { morale: 5 },
                },
            },
            {
                id: 'decline_honor',
                text: 'Decline with honor. "You trust me with the harder duty — politics."',
                effects: {
                    relationChanges: { sertorius: 10 },
                },
            },
            {
                id: 'decline_dismissive',
                text: 'Wave him off. "I have more important matters."',
                effects: {
                    relationChanges: { sertorius: -10 },
                    flagChanges: { disappointment: 1 },
                },
            },
        ],
    },

    // === RECURRING EVENT: THE SOLDIERS ===
    {
        id: 'sertorius_soldiers',
        senatorId: 'sertorius',
        title: 'The Soldiers',
        description: `A group of veterans from the Seventh Legion has come to Rome seeking their promised land grants. The Senate has been stalling for months, and the men are growing restless.

Sertorius brings them to your attention personally. "These men bled for Rome. Now Rome bleeds them of patience. Something has to give."

The cost would be significant, but the veterans' eyes carry the weight of battles won.`,
        priority: 60,
        validStates: ['steady_ally', 'cooling'],
        minRound: 8,
        cooldown: 8,
        conditions: {},
        choices: [
            {
                id: 'full_grants',
                text: 'Honor the grants in full. (-300 denarii)',
                requirements: { denarii: 300 },
                effects: {
                    relationChanges: { sertorius: 15 },
                    flagChanges: { honorable: 1 },
                    resourceChanges: { denarii: -300, morale: 10 },
                },
            },
            {
                id: 'partial_grants',
                text: 'Offer partial grants and promises. (-100 denarii)',
                requirements: { denarii: 100 },
                effects: {
                    relationChanges: { sertorius: 5 },
                    resourceChanges: { denarii: -100, morale: 3 },
                },
            },
            {
                id: 'delay',
                text: 'Promise to look into it — eventually.',
                effects: {
                    relationChanges: { sertorius: -5 },
                },
            },
            {
                id: 'refuse',
                text: 'Refuse. "The treasury can\'t afford sentiment."',
                effects: {
                    relationChanges: { sertorius: -15 },
                    flagChanges: { disappointment: 1 },
                    resourceChanges: { morale: -5 },
                },
            },
        ],
    },

    // === COOLING STATE EVENT: THE CONCERN ===
    {
        id: 'sertorius_concern',
        senatorId: 'sertorius',
        title: 'The Concern',
        description: `Sertorius's visits have grown less frequent, his manner more formal. Today, he stops you in the Forum with a troubled look.

"I've been hearing things. Whispers about the company you keep. The decisions you're making. I'm starting to wonder if I misjudged you."

His hand rests on his sword hilt — not a threat, just an old habit.

"Tell me I'm wrong."`,
        priority: 75,
        validStates: ['cooling'],
        minRound: 10,
        cooldown: 6,
        conditions: {
            maxRelation: 25,
        },
        choices: [
            {
                id: 'reassure',
                text: 'Speak honestly about your struggles and intentions.',
                effects: {
                    relationChanges: { sertorius: 10 },
                    flagChanges: { honorable: 1 },
                },
            },
            {
                id: 'deflect',
                text: 'Deflect. "Rome requires difficult choices."',
                effects: {
                    relationChanges: { sertorius: -5 },
                },
            },
            {
                id: 'angry',
                text: 'Grow defensive. "I don\'t answer to you, soldier."',
                effects: {
                    relationChanges: { sertorius: -15 },
                    flagChanges: { disappointment: 1 },
                },
            },
        ],
    },

    // === DISTANT STATE EVENT: THE SILENCE ===
    {
        id: 'sertorius_silence',
        senatorId: 'sertorius',
        title: 'The Silence',
        description: `Months have passed since Sertorius spoke more than necessary. At Senate meetings, his seat is always full, his vote always counted — but his counsel no longer flows your way.

Today, you catch him leaving early. For a moment, your eyes meet across the chamber.

There's no anger there. Just disappointment.`,
        priority: 65,
        validStates: ['distant'],
        minRound: 16,
        cooldown: 8,
        conditions: {},
        choices: [
            {
                id: 'approach',
                text: 'Go after him. "Gaius, wait. Let\'s talk."',
                effects: {
                    relationChanges: { sertorius: 5 },
                },
            },
            {
                id: 'send_letter',
                text: 'Send a written appeal later — more dignified.',
                effects: {
                    relationChanges: { sertorius: 2 },
                },
            },
            {
                id: 'accept_distance',
                text: 'Accept the distance. He\'s made his choice.',
                effects: {
                    relationChanges: { sertorius: -5 },
                    flagChanges: { disappointment: 1 },
                },
            },
        ],
    },

    // === BLOOD BROTHER PATH: THE BOND ===
    {
        id: 'sertorius_bond',
        senatorId: 'sertorius',
        title: 'The Bond',
        description: `After years of watching, Sertorius finally speaks the words you've earned.

"I've seen empires rise and fall. I've watched good men become monsters and monsters pretend to be good. But you... you're the real thing."

He draws his gladius — not in threat, but in ceremony — and cuts his palm.

"Brothers in blood. If it comes to it, I'll stand with you against anything. Even Rome itself."`,
        priority: 95,
        validStates: ['steady_ally'],
        minRound: 32,
        cooldown: 0,  // Terminal event
        conditions: {
            minRelation: 80,
            requiredFlags: { honorable: 4 },
        },
        choices: [
            {
                id: 'accept_bond',
                text: 'Cut your palm and clasp his hand. "Brothers."',
                effects: {
                    relationChanges: { sertorius: 20 },
                    resourceChanges: { morale: 15 },
                    specialEffects: ['state_to_blood_brother'],
                },
            },
            {
                id: 'hesitate',
                text: 'Hesitate at the intensity. "Gaius, this is... a lot."',
                effects: {
                    relationChanges: { sertorius: 5 },
                },
            },
        ],
    },

    // === DISILLUSIONED PATH: THE LETTER ===
    {
        id: 'sertorius_letter',
        senatorId: 'sertorius',
        title: 'The Letter',
        description: `A messenger brings a sealed letter. The handwriting is Sertorius's — careful, deliberate, like everything he does.

"I cannot watch what you've become. The boy I knew died somewhere. I hope Rome survives you."

By the time you finish reading, he's already gone. Packed his things. Left the city. No one knows where.`,
        priority: 90,
        validStates: ['distant'],
        minRound: 24,
        cooldown: 0,  // Terminal event
        conditions: {
            maxRelation: -20,
            requiredFlags: { disappointment: 3 },
        },
        choices: [
            {
                id: 'regret',
                text: 'Feel the weight of his departure.',
                effects: {
                    relationChanges: { sulla: 5 },  // Sulla notes obstacle removed
                    resourceChanges: { morale: -10 },
                    specialEffects: ['state_to_disillusioned', 'senator_leaves'],
                },
            },
        ],
    },
];

export default SERTORIUS_EVENTS;
