// ============================================
// ROME EMPIRE BUILDER - Oppius Events
// Events for Gaius Oppius (The Spymaster)
// ============================================

import type { SenatorEventDefinition } from '@/core/types/senate';

/**
 * OPPIUS EVENT DEFINITIONS
 *
 * Oppius is the intelligence broker who knows everyone's secrets.
 * His events focus on:
 * - Information trading and blackmail
 * - Being interesting enough to hold his attention
 * - Terminal paths: INNER_CIRCLE (ally), BORING (leaves), or SPIDER_REVENGE (death)
 */

export const OPPIUS_EVENTS: SenatorEventDefinition[] = [
    // === INTRODUCTION EVENT (Round 3-5) ===
    {
        id: 'oppius_web',
        senatorId: 'oppius',
        title: 'The Web',
        description: `You receive an anonymous note: "I know what you did last summer."

There is no signature. But when you look up, you see a nondescript man watching from across the Forum. He raises a wine cup in silent toast, then melts into the crowd.

Later, another note arrives. "Gaius Oppius. We should talk."`,
        priority: 100,
        validStates: ['watching'],
        minRound: 3,
        maxRound: 6,
        cooldown: 0,
        conditions: {},
        choices: [
            {
                id: 'accept_meeting',
                text: 'Arrange the meeting. Knowledge is power.',
                effects: {
                    relationChanges: { oppius: 10 },
                    flagChanges: { interesting: 1 },
                },
            },
            {
                id: 'cautious',
                text: 'Proceed cautiously. Send a trusted intermediary first.',
                effects: {
                    relationChanges: { oppius: 5 },
                },
            },
            {
                id: 'ignore',
                text: 'Ignore it. Spymasters are dangerous.',
                effects: {
                    relationChanges: { oppius: -5 },
                },
            },
        ],
    },

    // === RECURRING EVENT: THE INTELLIGENCE ===
    {
        id: 'oppius_intelligence',
        senatorId: 'oppius',
        title: 'The Intelligence',
        description: `Oppius finds you in the baths — no weapons allowed, very civilized.

"I have information you might find useful. Trade routes. Political movements. Perhaps a few personal indiscretions of your enemies."

He names a price. It's fair — perhaps too fair.

"Consider it a demonstration of value."`,
        priority: 70,
        validStates: ['watching', 'valued_client'],
        minRound: 6,
        cooldown: 6,
        conditions: {},
        choices: [
            {
                id: 'buy_full',
                text: 'Buy the full package. (-150 denarii)',
                requirements: { denarii: 150 },
                effects: {
                    relationChanges: { oppius: 10 },
                    flagChanges: { interesting: 1 },
                    resourceChanges: { denarii: -150 },
                },
            },
            {
                id: 'buy_partial',
                text: 'Buy selected intelligence only. (-75 denarii)',
                requirements: { denarii: 75 },
                effects: {
                    relationChanges: { oppius: 5 },
                    resourceChanges: { denarii: -75 },
                },
            },
            {
                id: 'decline',
                text: 'Decline politely. "I prefer to work blind."',
                effects: {
                    relationChanges: { oppius: -5 },
                },
            },
        ],
    },

    // === RECURRING EVENT: THE FAVOR ===
    {
        id: 'oppius_favor',
        senatorId: 'oppius',
        title: 'The Favor',
        description: `A messenger brings a sealed document. Inside: evidence of a rival senator's corruption, enough to destroy his career.

A note is attached: "A gift. From a friend."

No signature needed.`,
        priority: 65,
        validStates: ['watching', 'valued_client'],
        minRound: 10,
        cooldown: 8,
        conditions: {
            minRelation: 10,
        },
        choices: [
            {
                id: 'use_evidence',
                text: 'Use the evidence publicly. Destroy your rival.',
                effects: {
                    relationChanges: { oppius: 10 },
                    flagChanges: { ruthless: 1, interesting: 1 },
                    resourceChanges: { reputation: 10 },
                },
            },
            {
                id: 'hold_evidence',
                text: 'Keep the evidence for leverage. More valuable that way.',
                effects: {
                    relationChanges: { oppius: 15 },
                    flagChanges: { interesting: 2 },
                },
            },
            {
                id: 'destroy_evidence',
                text: 'Destroy it. "I won\'t play that game."',
                effects: {
                    relationChanges: { oppius: -10 },
                    flagChanges: { honorable: 1 },
                },
            },
        ],
    },

    // === VALUED CLIENT EVENT: THE PARTNERSHIP ===
    {
        id: 'oppius_partnership',
        senatorId: 'oppius',
        title: 'The Partnership',
        description: `A private meeting in an unmarked house. Oppius arrives first — of course.

"You've proven... interesting. Most clients bore me within a season. You make moves I can't predict."

He slides a document across the table.

"A partnership. My network, your ambition. You share what you know. I help you get what you want."`,
        priority: 80,
        validStates: ['valued_client'],
        minRound: 14,
        cooldown: 0,  // Major decision
        conditions: {
            minRelation: 30,
        },
        choices: [
            {
                id: 'full_partnership',
                text: 'Accept full partnership. Share everything.',
                effects: {
                    relationChanges: { oppius: 20 },
                    flagChanges: { interesting: 2 },
                },
            },
            {
                id: 'limited_partnership',
                text: 'Accept limited terms. "Some secrets stay mine."',
                effects: {
                    relationChanges: { oppius: 10 },
                    flagChanges: { interesting: 1 },
                },
            },
            {
                id: 'decline_partnership',
                text: 'Decline. "I don\'t like others knowing my business."',
                effects: {
                    relationChanges: { oppius: -10 },
                },
            },
        ],
    },

    // === DISTANT EVENT: THE SILENCE ===
    {
        id: 'oppius_silence',
        senatorId: 'oppius',
        title: 'The Silence',
        description: `The intelligence stops flowing. No more tips. No more warnings. No more anonymous gifts.

Oppius's network hasn't turned against you — it's simply stopped watching.

You've become invisible to him. Irrelevant. Safe, perhaps. But alone.`,
        priority: 60,
        validStates: ['distant'],
        minRound: 16,
        cooldown: 8,
        conditions: {},
        choices: [
            {
                id: 'make_interesting',
                text: 'Do something to catch his attention. Make a bold move.',
                effects: {
                    relationChanges: { oppius: 10 },
                    flagChanges: { interesting: 2 },
                    resourceChanges: { reputation: -5 },  // Risky
                },
            },
            {
                id: 'accept_silence',
                text: 'Accept the silence. Being ignored is safe.',
                effects: {
                    relationChanges: { oppius: -5 },
                    flagChanges: { interesting: -1 },
                },
            },
        ],
    },

    // === INNER CIRCLE PATH ===
    {
        id: 'oppius_inner_circle',
        senatorId: 'oppius',
        title: 'The Inner Circle',
        description: `Oppius invites you to a gathering unlike any other.

The room contains Rome's real rulers — not the public faces, but the ones who pull strings. Merchants who control trade. Veterans who remember old oaths. Scribes who know where bodies are buried.

Oppius raises his cup. "Welcome to the web's center. You've earned it."`,
        priority: 95,
        validStates: ['valued_client'],
        minRound: 24,
        cooldown: 0,  // Terminal
        conditions: {
            minRelation: 60,
            requiredFlags: { interesting: 5 },
        },
        choices: [
            {
                id: 'join_circle',
                text: 'Take your place. "I\'m honored to join."',
                effects: {
                    relationChanges: { oppius: 20 },
                    resourceChanges: { reputation: 15 },
                    specialEffects: ['state_to_inner_circle'],
                },
            },
        ],
    },

    // === BORING PATH ===
    {
        id: 'oppius_boring',
        senatorId: 'oppius',
        title: 'The Dismissal',
        description: `A final note arrives, unsigned as always.

"I had such hopes for you. In the end, you're just another politician making predictable moves. I've wasted enough time."

Oppius's network erases you from its memory. No more protection. No more information. You're on your own now.

The spider has lost interest in this fly.`,
        priority: 85,
        validStates: ['distant'],
        minRound: 20,
        cooldown: 0,  // Terminal
        conditions: {
            maxRelation: 0,
            requiredFlags: { interesting: -3 },  // Negative means boring
        },
        choices: [
            {
                id: 'accept_dismissal',
                text: 'Accept the dismissal. You never needed him anyway.',
                effects: {
                    specialEffects: ['state_to_boring', 'senator_leaves'],
                },
            },
        ],
    },

    // === EXPOSED PATH (if you tried to assassinate him) ===
    {
        id: 'oppius_exposed',
        senatorId: 'oppius',
        title: 'The Exposure',
        description: `You tried to strike at the spider. A fatal mistake.

Within hours, every secret he has on you — every deal, every crime, every whisper — reaches every senator, every foreign power, every enemy you've ever made.

Oppius's final message arrives: "Did you think I wouldn't have insurance?"`,
        priority: 95,
        validStates: ['exposed'],
        minRound: 15,
        cooldown: 0,  // Terminal reaction
        conditions: {},
        choices: [
            {
                id: 'face_exposure',
                text: 'Face the consequences.',
                effects: {
                    relationChanges: { sertorius: -20, sulla: -10, pulcher: -15, clodius: -10 },
                    resourceChanges: { reputation: -50 },
                    specialEffects: ['state_to_spider_revenge'],
                },
            },
        ],
    },

    // === SPIDER REVENGE: DEATH ===
    {
        id: 'oppius_revenge',
        senatorId: 'oppius',
        title: 'The Professional',
        description: `You never see him coming.

A professional handles you. No drama. No evidence. Just silence.

Oppius doesn't even watch. He doesn't need to.`,
        priority: 100,
        validStates: ['spider_revenge'],
        minRound: 16,
        cooldown: 0,
        conditions: {},
        choices: [
            {
                id: 'death',
                text: 'There is no escape from the spider.',
                effects: {
                    specialEffects: ['player_dies'],
                },
            },
        ],
    },
];

export default OPPIUS_EVENTS;
