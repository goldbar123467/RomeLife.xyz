// ============================================
// ROME EMPIRE BUILDER - Sulla Events
// Events for Lucius Cornelius Sulla (The Ambitious General)
// ============================================

import type { SenatorEventDefinition } from '@/core/types/senate';

/**
 * SULLA EVENT DEFINITIONS
 *
 * Sulla is the ruthless military genius who respects only strength.
 * His events focus on:
 * - Power demonstrations and ruthless choices
 * - Military alliance and domination
 * - Terminal paths: ENFORCER (tool) or COUP (death)
 */

export const SULLA_EVENTS: SenatorEventDefinition[] = [
    // === INTRODUCTION EVENT (Round 2-4) ===
    {
        id: 'sulla_measure',
        senatorId: 'sulla',
        title: 'The Measure',
        description: `Sulla doesn't approach — he positions. You find him standing in your path after the Senate session, arms crossed, eyes calculating.

"I've been watching you. Trying to determine what you are. Idealist? Opportunist? Fool?"

His smile doesn't reach his eyes.

"Time will tell. But I wanted you to know — I'm watching."`,
        priority: 100,
        validStates: ['evaluating'],
        minRound: 2,
        maxRound: 5,
        cooldown: 0,
        conditions: {},
        choices: [
            {
                id: 'meet_gaze',
                text: 'Meet his gaze steadily. "Watch carefully, then."',
                effects: {
                    relationChanges: { sulla: 10 },
                    flagChanges: { interesting: 1 },
                },
            },
            {
                id: 'diplomatic',
                text: 'Respond diplomatically. "I hope to prove worthy of Rome."',
                effects: {
                    relationChanges: { sulla: 0 },
                },
            },
            {
                id: 'dismissive',
                text: 'Brush past him. "I have better things to do than perform for you."',
                effects: {
                    relationChanges: { sulla: -5 },
                },
            },
        ],
    },

    // === RECURRING EVENT: THE TEST ===
    {
        id: 'sulla_test',
        senatorId: 'sulla',
        title: 'The Test',
        description: `Sulla corners you with news of a situation. A military officer has been embezzling supplies meant for the legions. Sulla has the evidence.

"Curious how you'll handle it. Some men make examples. Some make deals. Some make nothing at all."

His tone is light, but his eyes miss nothing.`,
        priority: 80,
        validStates: ['evaluating', 'impressed'],
        minRound: 5,
        cooldown: 6,
        conditions: {},
        choices: [
            {
                id: 'execute',
                text: 'Execute the officer publicly. "Examples must be made."',
                effects: {
                    relationChanges: { sulla: 10 },
                    flagChanges: { ruthless: 1 },
                    queuedActions: [
                        {
                            senatorId: 'sertorius',
                            actionType: 'delayed_reaction',
                            delaySeasons: 1,
                            effects: { relationChanges: { sertorius: -5 } },
                            sourceEvent: 'sulla_test',
                            triggerRound: 0,  // Will be set by processor
                        },
                    ],
                },
            },
            {
                id: 'demand_repayment',
                text: 'Demand full repayment, spare his life.',
                effects: {
                    relationChanges: { sulla: 0, sertorius: 5 },
                    resourceChanges: { denarii: 100 },
                },
            },
            {
                id: 'ignore',
                text: 'Ignore the situation. "Not worth my time."',
                effects: {
                    relationChanges: { sulla: -10 },
                },
            },
            {
                id: 'promote',
                text: 'Promote the officer with a warning. "Clever men are useful."',
                effects: {
                    relationChanges: { sulla: -15 },
                    flagChanges: { interesting: 1 },  // Oppius notes corruption tolerance
                },
            },
        ],
    },

    // === RECURRING EVENT: THE OFFER ===
    {
        id: 'sulla_offer',
        senatorId: 'sulla',
        title: 'The Offer',
        description: `A private dinner invitation. Sulla's villa is decorated with the spoils of conquered nations.

"Senator Gnaeus has been blocking your legislation. Tedious man. I could ensure he stops. Permanently, or temporarily — your preference."

He refills your wine.

"Consider it a demonstration of partnership."`,
        priority: 75,
        validStates: ['impressed', 'circling'],
        minRound: 10,
        cooldown: 8,
        conditions: {
            minRelation: 15,
        },
        choices: [
            {
                id: 'permanently',
                text: '"Permanently."',
                effects: {
                    relationChanges: { sulla: 25 },
                    flagChanges: { ruthless: 1 },
                    queuedActions: [
                        {
                            senatorId: 'oppius',
                            actionType: 'gains_secret',
                            delaySeasons: 0,
                            effects: { flagChanges: { interesting: 1 } },
                            sourceEvent: 'sulla_offer',
                            triggerRound: 0,
                        },
                        {
                            senatorId: 'sertorius',
                            actionType: 'learns_truth',
                            delaySeasons: 2,
                            effects: { relationChanges: { sertorius: -10 } },
                            sourceEvent: 'sulla_offer',
                            triggerRound: 0,
                        },
                    ],
                },
            },
            {
                id: 'temporarily',
                text: '"Temporarily. Beaten, not buried."',
                effects: {
                    relationChanges: { sulla: 15 },
                    flagChanges: { ruthless: 1 },
                },
            },
            {
                id: 'decline_honorably',
                text: '"No. I handle my problems legitimately."',
                effects: {
                    relationChanges: { sulla: 0 },
                    flagChanges: { honorable: 1 },
                },
            },
            {
                id: 'decline_firmly',
                text: '"Never suggest this again."',
                effects: {
                    relationChanges: { sulla: -10 },
                },
            },
        ],
    },

    // === IMPRESSED STATE EVENT: THE ALLIANCE ===
    {
        id: 'sulla_alliance',
        senatorId: 'sulla',
        title: 'The Alliance',
        description: `Sulla meets you in the shadow of Jupiter's temple — neutral ground, but clearly his choice.

"You've proven yourself. I think it's time we formalized our understanding. My legions, your political position. Together, we could reshape Rome."

His hand extends — not in friendship, but in contract.`,
        priority: 85,
        validStates: ['impressed'],
        minRound: 16,
        cooldown: 0,  // Major decision
        conditions: {
            minRelation: 40,
        },
        choices: [
            {
                id: 'accept_full',
                text: 'Accept the alliance fully. "Together, then."',
                effects: {
                    relationChanges: { sulla: 20, sertorius: -5, pulcher: -5 },
                    flagChanges: { ruthless: 1 },
                    resourceChanges: { troops: 20, morale: 10 },
                },
            },
            {
                id: 'accept_conditional',
                text: 'Accept conditionally. "Partners, not subordinates."',
                effects: {
                    relationChanges: { sulla: 10 },
                    resourceChanges: { troops: 10 },
                },
            },
            {
                id: 'decline',
                text: 'Decline. "I prefer to stand alone."',
                effects: {
                    relationChanges: { sulla: -5 },
                },
            },
        ],
    },

    // === CIRCLING STATE EVENT: THE WARNING ===
    {
        id: 'sulla_warning',
        senatorId: 'sulla',
        title: 'The Warning',
        description: `Sulla's legions have been conducting exercises near Rome. The Senate is nervous. You find him in the Forum, perfectly at ease.

"The men need practice. Nothing more."

His smile suggests otherwise.

"But I wondered if you might join us for the maneuvers. See what real power looks like."`,
        priority: 80,
        validStates: ['circling'],
        minRound: 14,
        cooldown: 6,
        conditions: {},
        choices: [
            {
                id: 'join',
                text: 'Join the exercises. Show you\'re not intimidated.',
                effects: {
                    relationChanges: { sulla: 10 },
                    flagChanges: { interesting: 1 },
                },
            },
            {
                id: 'send_representative',
                text: 'Send a representative. "I have Senate duties."',
                effects: {
                    relationChanges: { sulla: -5 },
                },
            },
            {
                id: 'public_objection',
                text: 'Raise public objections to the exercises.',
                effects: {
                    relationChanges: { sulla: -15 },
                    resourceChanges: { reputation: 5 },
                },
            },
        ],
    },

    // === RIVAL STATE EVENT: THE CONFRONTATION ===
    {
        id: 'sulla_confrontation',
        senatorId: 'sulla',
        title: 'The Confrontation',
        description: `The Senate is in uproar. Sulla's supporters are blocking legislation, his legions are a shadow over every debate.

He finds you in the curia's shadow.

"I gave you chances. You refused them all. Now I wonder — do you have the strength to stop me? Or will you break like all the others?"`,
        priority: 85,
        validStates: ['rival'],
        minRound: 20,
        cooldown: 4,
        conditions: {
            maxRelation: -30,
        },
        choices: [
            {
                id: 'stand_firm',
                text: 'Stand firm. "Rome has survived worse than you."',
                effects: {
                    relationChanges: { sulla: -10 },
                    resourceChanges: { reputation: 10 },
                },
            },
            {
                id: 'negotiate',
                text: 'Seek negotiation. "Perhaps we can still find common ground."',
                effects: {
                    relationChanges: { sulla: 10 },
                },
            },
            {
                id: 'yield',
                text: 'Yield to his pressure. Show weakness.',
                effects: {
                    relationChanges: { sulla: 15 },
                    resourceChanges: { reputation: -15, morale: -10 },
                },
            },
        ],
    },

    // === ENFORCER PATH ===
    {
        id: 'sulla_enforcer',
        senatorId: 'sulla',
        title: 'The Tool',
        description: `Sulla kneels — an ironic gesture from a man who kneels to no one.

"You've proven worthy of my service. The legions are yours to command. My network, your instrument. Point, and I shall strike."

He rises with a predator's grace.

"But remember — tools can cut both ways."`,
        priority: 95,
        validStates: ['impressed'],
        minRound: 24,
        cooldown: 0,  // Terminal
        conditions: {
            minRelation: 60,
            requiredFlags: { ruthless: 3 },
        },
        choices: [
            {
                id: 'accept_enforcer',
                text: 'Accept his service. "Rise. We have work to do."',
                effects: {
                    relationChanges: { sulla: 20 },
                    resourceChanges: { troops: 30, morale: 10 },
                    specialEffects: ['state_to_enforcer'],
                },
            },
        ],
    },

    // === COUP PATH: THE MARCH ===
    {
        id: 'sulla_coup',
        senatorId: 'sulla',
        title: 'The March',
        description: `The messenger arrives pale and shaking.

"His legions are marching on Rome."

No further explanation needed. Sulla is done waiting. The Republic's defender has become its destroyer.

The streets empty as the sound of boots grows louder.`,
        priority: 100,
        validStates: ['rival'],
        minRound: 28,
        cooldown: 0,  // Terminal
        conditions: {
            maxRelation: -60,
            playerStats: {
                troops: { op: 'lt', value: 100 },
            },
        },
        choices: [
            {
                id: 'face_coup',
                text: 'Face the inevitable.',
                effects: {
                    specialEffects: ['state_to_coup', 'assassination_window_opens'],
                },
            },
        ],
    },

    // === ASSASSINATION: THE END ===
    {
        id: 'sulla_assassination',
        senatorId: 'sulla',
        title: 'The End of the Republic',
        description: `Sulla's proscription lists have been posted throughout Rome. Your name is at the top.

His soldiers find you at dawn.

"The Republic thanks you for your service."

The last thing you see is the glint of drawn swords.`,
        priority: 100,
        validStates: ['coup'],
        minRound: 30,
        cooldown: 0,
        conditions: {},
        choices: [
            {
                id: 'death',
                text: 'There is no escape.',
                effects: {
                    specialEffects: ['player_dies'],
                },
            },
        ],
    },
];

export default SULLA_EVENTS;
