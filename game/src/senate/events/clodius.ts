// ============================================
// ROME EMPIRE BUILDER - Clodius Events
// Events for Publius Clodius Pulcher (The Mob Boss)
// ============================================

import type { SenatorEventDefinition } from '@/core/types/senate';

/**
 * CLODIUS EVENT DEFINITIONS
 *
 * Clodius controls the Roman mob. He demands tribute and respect.
 * His events focus on:
 * - Mob violence and grain distribution
 * - Protection rackets and street politics
 * - Terminal paths: MOB_PATRON (ally), BROKEN (cowed), or ASSASSINATION (death)
 */

export const CLODIUS_EVENTS: SenatorEventDefinition[] = [
    // === INTRODUCTION EVENT (Round 3-5) ===
    {
        id: 'clodius_streets',
        senatorId: 'clodius',
        title: 'The Streets',
        description: `You're walking through the Subura when a crowd parts before you — not from respect, but from fear. Clodius emerges from a wine shop, flanked by hard-eyed men.

"So you're the new power in the Senate. Funny — the streets haven't heard of you yet."

He spits olive pits at your feet.

"Maybe we should fix that. Or maybe you should remember who really runs this city."`,
        priority: 100,
        validStates: ['wary'],
        minRound: 3,
        maxRound: 6,
        cooldown: 0,
        conditions: {},
        choices: [
            {
                id: 'respectful',
                text: 'Show respect. "The streets are yours. I only ask we not be enemies."',
                effects: {
                    relationChanges: { clodius: 10 },
                },
            },
            {
                id: 'offering',
                text: 'Make an offering. "Perhaps I can help feed your people." (-100 grain)',
                requirements: { grain: 100 },
                effects: {
                    relationChanges: { clodius: 15 },
                    resourceChanges: { grain: -100 },
                },
            },
            {
                id: 'defiant',
                text: 'Stand your ground. "I don\'t bow to thugs."',
                effects: {
                    relationChanges: { clodius: -15 },
                    resourceChanges: { reputation: 5 },
                },
            },
        ],
    },

    // === RECURRING EVENT: THE TRIBUTE ===
    {
        id: 'clodius_tribute',
        senatorId: 'clodius',
        title: 'The Tribute',
        description: `Clodius's men arrive at your door — not threatening, but not friendly either.

"The boss says it's time for your contribution. The grain warehouses are low, and the people are hungry. You understand how it works."

They hand you a list of "suggested" amounts. The numbers are steep.`,
        priority: 70,
        validStates: ['wary', 'partnership', 'agitated'],
        minRound: 6,
        cooldown: 5,
        conditions: {},
        choices: [
            {
                id: 'full_tribute',
                text: 'Pay the full tribute. (-150 grain)',
                requirements: { grain: 150 },
                effects: {
                    relationChanges: { clodius: 10 },
                    resourceChanges: { grain: -150 },
                },
            },
            {
                id: 'partial_tribute',
                text: 'Pay half and promise more later. (-75 grain)',
                requirements: { grain: 75 },
                effects: {
                    relationChanges: { clodius: 0 },
                    resourceChanges: { grain: -75 },
                },
            },
            {
                id: 'refuse_tribute',
                text: 'Refuse entirely. "Find another mark."',
                effects: {
                    relationChanges: { clodius: -15 },
                    resourceChanges: { happiness: -5 },  // Mob causes problems
                },
            },
        ],
    },

    // === PARTNERSHIP EVENT: THE DEAL ===
    {
        id: 'clodius_deal',
        senatorId: 'clodius',
        title: 'The Deal',
        description: `A private meeting in a Subura tavern. Clodius dismisses his guards — a rare sign of trust.

"You've been reliable. I think we can do business together. Real business."

He outlines a scheme: you provide grain and political cover, he provides muscle and street intelligence.

"Partners. Equal shares. What do you say?"`,
        priority: 80,
        validStates: ['partnership'],
        minRound: 12,
        cooldown: 0,  // Major decision
        conditions: {
            minRelation: 30,
        },
        choices: [
            {
                id: 'accept_partnership',
                text: 'Accept the partnership fully.',
                effects: {
                    relationChanges: { clodius: 20, pulcher: -5 },  // Pulcher disapproves
                    flagChanges: { interesting: 1 },
                },
            },
            {
                id: 'limited_partnership',
                text: 'Agree to limited cooperation. "Let\'s start small."',
                effects: {
                    relationChanges: { clodius: 10 },
                },
            },
            {
                id: 'decline_partnership',
                text: 'Decline. "I can\'t be seen working with you openly."',
                effects: {
                    relationChanges: { clodius: -10 },
                },
            },
        ],
    },

    // === AGITATED EVENT: THE DEMAND ===
    {
        id: 'clodius_demand',
        senatorId: 'clodius',
        title: 'The Demand',
        description: `Your house is surrounded by a restless crowd. Clodius stands at their head.

"The people are hungry, Senator. They want to know why there's no grain. They want to know who to blame."

His smile is sharp.

"I could tell them it's the Egyptians. Or I could tell them it's you. Your choice."`,
        priority: 85,
        validStates: ['agitated'],
        minRound: 14,
        cooldown: 4,
        conditions: {
            maxRelation: -10,
        },
        choices: [
            {
                id: 'pay_ransom',
                text: 'Pay to quiet the mob. (-200 denarii, -100 grain)',
                requirements: { denarii: 200, grain: 100 },
                effects: {
                    relationChanges: { clodius: 10 },
                    resourceChanges: { denarii: -200, grain: -100 },
                },
            },
            {
                id: 'stand_firm',
                text: 'Stand firm and face the mob.',
                effects: {
                    relationChanges: { clodius: -10 },
                    resourceChanges: { happiness: -10, reputation: 5 },
                },
            },
            {
                id: 'call_troops',
                text: 'Call in troops to disperse them.',
                requirements: { troops: 20 },
                effects: {
                    relationChanges: { clodius: -20 },
                    resourceChanges: { happiness: -15 },
                    flagChanges: { ruthless: 1 },
                },
            },
        ],
    },

    // === HOSTILE EVENT: THE ULTIMATUM ===
    {
        id: 'clodius_ultimatum',
        senatorId: 'clodius',
        title: 'The Ultimatum',
        description: `The message arrives written in blood — theatrical, but effective.

"You have until the Ides. Pay what's owed, or Rome burns."

Clodius has stopped pretending. He wants you gone, or he wants you paying. There's no middle ground anymore.`,
        priority: 90,
        validStates: ['hostile'],
        minRound: 18,
        cooldown: 0,  // Critical decision
        conditions: {
            maxRelation: -40,
        },
        choices: [
            {
                id: 'major_concession',
                text: 'Make a major concession. (-500 denarii or -200 grain)',
                requirements: { denarii: 500 },
                effects: {
                    relationChanges: { clodius: 25 },
                    resourceChanges: { denarii: -500 },
                    specialEffects: ['state_to_agitated'],
                },
            },
            {
                id: 'appeal_senators',
                text: 'Appeal to other senators for protection.',
                conditions: {
                    otherSenatorConditions: [
                        { senatorId: 'sulla', states: ['impressed', 'enforcer'] },
                    ],
                },
                effects: {
                    relationChanges: { clodius: -10, sulla: 5 },
                    specialEffects: ['assassination_window_closes'],
                    queuedActions: [
                        {
                            senatorId: 'clodius',
                            actionType: 'blocked_assassination',
                            delaySeasons: 4,
                            effects: {},
                            sourceEvent: 'clodius_ultimatum',
                            triggerRound: 0,
                        },
                    ],
                },
            },
            {
                id: 'refuse_ultimatum',
                text: 'Refuse. "Do your worst."',
                effects: {
                    relationChanges: { clodius: -10 },
                    specialEffects: ['assassination_window_opens'],
                },
            },
        ],
    },

    // === MOB PATRON PATH ===
    {
        id: 'clodius_patron',
        senatorId: 'clodius',
        title: 'The Crown of the Streets',
        description: `The Subura throws you a triumph — not with laurel and gold, but with bread and wine and the cheers of ten thousand voices.

Clodius raises your hand before the crowd.

"This is your friend! This is your patron! When you're hungry, he feeds you. When you're threatened, he protects you. The streets belong to Rome — and Rome belongs to him!"

The roar is deafening.`,
        priority: 95,
        validStates: ['partnership'],
        minRound: 24,
        cooldown: 0,  // Terminal
        conditions: {
            minRelation: 50,
        },
        choices: [
            {
                id: 'accept_patron',
                text: 'Accept the title and the responsibility.',
                effects: {
                    relationChanges: { clodius: 20 },
                    resourceChanges: { happiness: 15, reputation: 10 },
                    specialEffects: ['state_to_mob_patron'],
                },
            },
        ],
    },

    // === BROKEN PATH ===
    {
        id: 'clodius_broken',
        senatorId: 'clodius',
        title: 'The Broken Man',
        description: `Your forces finally catch Clodius's men in the act. The evidence is overwhelming. The Senate acts, for once.

Clodius is dragged before you, stripped of his gangs, his warehouses seized. He's still defiant, but everyone knows he's finished.

"This isn't over. You can break me, but you can't break the streets."

But you can. And you did.`,
        priority: 90,
        validStates: ['agitated', 'hostile'],
        minRound: 20,
        cooldown: 0,  // Terminal
        conditions: {
            maxRelation: -50,
            playerStats: {
                troops: { op: 'gte', value: 80 },
            },
        },
        choices: [
            {
                id: 'break_him',
                text: 'Break him completely. Exile and disgrace.',
                effects: {
                    relationChanges: { clodius: -20 },
                    resourceChanges: { happiness: 10 },  // Streets are quiet
                    specialEffects: ['state_to_broken'],
                },
            },
        ],
    },

    // === ASSASSINATION PATH: THE RIOT ===
    {
        id: 'clodius_riot',
        senatorId: 'clodius',
        title: 'The Riot',
        description: `The mob finds you in the Forum.

It's not random. It was never random.

Clodius watches from a rooftop as his people tear at you like wolves. The last thing you see is the sky above Rome, darkening with smoke.`,
        priority: 100,
        validStates: ['assassination'],
        minRound: 22,
        cooldown: 0,
        conditions: {},
        choices: [
            {
                id: 'death',
                text: 'The mob shows no mercy.',
                effects: {
                    specialEffects: ['player_dies'],
                },
            },
        ],
    },
];

export default CLODIUS_EVENTS;
