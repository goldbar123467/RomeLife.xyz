// ============================================
// ROME EMPIRE BUILDER - Pulcher Events
// Events for Appius Claudius Pulcher (The Religious Authority)
// ============================================

import type { SenatorEventDefinition } from '@/core/types/senate';

/**
 * PULCHER EVENT DEFINITIONS
 *
 * Pulcher controls religious rites and divine interpretation.
 * His events focus on:
 * - Omens, sacrifices, and temple politics
 * - Piety and religious observance
 * - Terminal paths: DIVINE_MANDATE (blessed) or SACRED_MURDER (death)
 */

export const PULCHER_EVENTS: SenatorEventDefinition[] = [
    // === INTRODUCTION EVENT (Round 2-4) ===
    {
        id: 'pulcher_omens',
        senatorId: 'pulcher',
        title: 'The Omens',
        description: `The sacred chickens refused to eat this morning. The augurs are in conference.

You find Pulcher in the Temple of Jupiter, his robes still spattered with sacrificial blood. He studies you like a text.

"A new player in Rome's game. The gods are watching you, young Senator. I've seen the signs. Whether they are favorable... depends on what you do next."

His smile holds mysteries.`,
        priority: 100,
        validStates: ['observing'],
        minRound: 2,
        maxRound: 5,
        cooldown: 0,
        conditions: {},
        choices: [
            {
                id: 'show_piety',
                text: 'Show piety. "I live to serve the gods and Rome."',
                effects: {
                    relationChanges: { pulcher: 10 },
                    flagChanges: { pious: 1 },
                },
            },
            {
                id: 'ask_interpretation',
                text: 'Ask for interpretation. "What do the signs say?"',
                effects: {
                    relationChanges: { pulcher: 5 },
                },
            },
            {
                id: 'dismissive',
                text: 'Be dismissive. "I make my own fate."',
                effects: {
                    relationChanges: { pulcher: -10 },
                    flagChanges: { impious: 1 },
                },
            },
        ],
    },

    // === RECURRING EVENT: THE OFFERING ===
    {
        id: 'pulcher_offering',
        senatorId: 'pulcher',
        title: 'The Offering',
        description: `A message from the Temple: the gods require a special sacrifice. The sacred flames are burning low, and Pulcher requests your contribution.

"The Republic thrives when the gods are pleased. Your generosity would be... noticed."

The suggested amount is substantial.`,
        priority: 70,
        validStates: ['observing', 'favored', 'concerned'],
        minRound: 5,
        cooldown: 6,
        conditions: {},
        choices: [
            {
                id: 'generous_offering',
                text: 'Make a generous offering. (-200 denarii)',
                requirements: { denarii: 200 },
                effects: {
                    relationChanges: { pulcher: 15 },
                    flagChanges: { pious: 1 },
                    resourceChanges: { denarii: -200, piety: 10 },
                },
            },
            {
                id: 'standard_offering',
                text: 'Make a standard offering. (-50 denarii)',
                requirements: { denarii: 50 },
                effects: {
                    relationChanges: { pulcher: 5 },
                    resourceChanges: { denarii: -50, piety: 3 },
                },
            },
            {
                id: 'decline_offering',
                text: 'Decline. "The treasury has other priorities."',
                effects: {
                    relationChanges: { pulcher: -10 },
                    flagChanges: { impious: 1 },
                },
            },
        ],
    },

    // === RECURRING EVENT: THE INTERPRETATION ===
    {
        id: 'pulcher_interpretation',
        senatorId: 'pulcher',
        title: 'The Interpretation',
        description: `An omen has appeared — a thunderbolt struck a tree near the Senate, or a two-headed calf was born in the Forum, or birds flew in an unusual pattern. The city buzzes with speculation.

Pulcher offers to interpret the signs for you privately.

"The gods speak. I translate. For my friends, the translation is... favorable. For my enemies..."

He shrugs eloquently.`,
        priority: 65,
        validStates: ['observing', 'favored'],
        minRound: 8,
        cooldown: 8,
        conditions: {},
        choices: [
            {
                id: 'buy_interpretation',
                text: 'Pay for a favorable interpretation. (-100 denarii)',
                requirements: { denarii: 100 },
                effects: {
                    relationChanges: { pulcher: 10 },
                    resourceChanges: { denarii: -100, reputation: 5, morale: 5 },
                },
            },
            {
                id: 'honest_interpretation',
                text: 'Ask for an honest reading, whatever it shows.',
                effects: {
                    relationChanges: { pulcher: 5 },
                    flagChanges: { pious: 1 },
                },
            },
            {
                id: 'dismiss_omens',
                text: 'Dismiss the need. "I trust in Roman steel, not augury."',
                effects: {
                    relationChanges: { pulcher: -10 },
                    flagChanges: { impious: 1 },
                },
            },
        ],
    },

    // === FAVORED EVENT: THE BLESSING ===
    {
        id: 'pulcher_blessing',
        senatorId: 'pulcher',
        title: 'The Blessing',
        description: `Pulcher invites you to a private ceremony. In the innermost sanctuary, away from prying eyes, he performs ancient rites.

"The gods see your devotion. They wish to show their favor openly. With your permission, I will declare you blessed before the Senate."

His eyes gleam with more than religious fervor.

"Imagine what that would mean for your position."`,
        priority: 80,
        validStates: ['favored'],
        minRound: 16,
        cooldown: 0,  // Major decision
        conditions: {
            minRelation: 40,
        },
        choices: [
            {
                id: 'accept_blessing',
                text: 'Accept the blessing and the political advantage.',
                effects: {
                    relationChanges: { pulcher: 15, clodius: -5 },  // Clodius dislikes "wasting" on religion
                    flagChanges: { pious: 1 },
                    resourceChanges: { piety: 15, reputation: 10 },
                },
            },
            {
                id: 'humble_blessing',
                text: 'Accept humbly. "I am not worthy, but I accept the gods\' will."',
                effects: {
                    relationChanges: { pulcher: 20 },
                    flagChanges: { pious: 2 },
                    resourceChanges: { piety: 10 },
                },
            },
            {
                id: 'decline_blessing',
                text: 'Decline. "The gods\' favor should be earned, not declared."',
                effects: {
                    relationChanges: { pulcher: -5 },
                },
            },
        ],
    },

    // === CONCERNED EVENT: THE WARNING ===
    {
        id: 'pulcher_warning',
        senatorId: 'pulcher',
        title: 'The Sacred Warning',
        description: `The haruspices have examined the entrails. The results are troubling.

Pulcher finds you after the Senate session, his face grave.

"The gods are displeased. I've seen it in the sacrifices. Unless something changes — unless you change — the divine wrath will fall upon Rome."

His pause is meaningful.

"It doesn't have to be this way."`,
        priority: 75,
        validStates: ['concerned'],
        minRound: 12,
        cooldown: 6,
        conditions: {},
        choices: [
            {
                id: 'repent',
                text: 'Make amends. "Tell me what the gods require."',
                effects: {
                    relationChanges: { pulcher: 10 },
                    flagChanges: { pious: 1 },
                },
            },
            {
                id: 'question',
                text: 'Question the interpretation. "Are you certain of this reading?"',
                effects: {
                    relationChanges: { pulcher: -5 },
                },
            },
            {
                id: 'defy',
                text: 'Defy the warning. "I am no puppet of priests."',
                effects: {
                    relationChanges: { pulcher: -15 },
                    flagChanges: { impious: 1 },
                },
            },
        ],
    },

    // === DISFAVORED EVENT: THE CURSE ===
    {
        id: 'pulcher_curse',
        senatorId: 'pulcher',
        title: 'The Curse',
        description: `Strange things are happening. Statues crack. Milk curdles. People whisper that you're cursed.

Pulcher makes the pronouncement public: the gods have turned their faces from you.

"Rome cannot prosper under a leader the heavens reject. This is not politics — this is divine truth."

The Senate watches. The mob listens.`,
        priority: 85,
        validStates: ['disfavored'],
        minRound: 18,
        cooldown: 4,
        conditions: {
            maxRelation: -30,
        },
        choices: [
            {
                id: 'major_sacrifice',
                text: 'Perform a major public sacrifice. (-300 denarii)',
                requirements: { denarii: 300 },
                effects: {
                    relationChanges: { pulcher: 15 },
                    resourceChanges: { denarii: -300, piety: 20, happiness: 5 },
                },
            },
            {
                id: 'build_temple',
                text: 'Promise to build a new temple. (-500 denarii)',
                requirements: { denarii: 500 },
                effects: {
                    relationChanges: { pulcher: 25, sertorius: 3 },  // Sertorius respects piety
                    resourceChanges: { denarii: -500, piety: 30 },
                },
            },
            {
                id: 'defiant_curse',
                text: 'Remain defiant. "I fear no curse."',
                effects: {
                    relationChanges: { pulcher: -15 },
                    resourceChanges: { happiness: -10, morale: -5 },
                },
            },
        ],
    },

    // === CONDEMNED EVENT: THE DOOM ===
    {
        id: 'pulcher_doom',
        senatorId: 'pulcher',
        title: 'The Sacred Doom',
        description: `The Festival of the Dead approaches. Pulcher's pronouncement echoes through Rome:

"This man has been judged by the gods and found wanting. His soul is forfeit. His life is borrowed time."

People make signs against evil when you pass. Servants flee your household. Even senators avoid your shadow.`,
        priority: 90,
        validStates: ['condemned'],
        minRound: 22,
        cooldown: 0,  // Critical
        conditions: {
            maxRelation: -50,
        },
        choices: [
            {
                id: 'beg_mercy',
                text: 'Beg for divine mercy. "I was wrong. Show me the path back."',
                effects: {
                    relationChanges: { pulcher: 20 },
                    flagChanges: { pious: 2 },
                    resourceChanges: { reputation: -10 },
                },
            },
            {
                id: 'bribe_priests',
                text: 'Attempt to bribe the lesser priests. (-400 denarii)',
                requirements: { denarii: 400 },
                effects: {
                    relationChanges: { pulcher: 5 },
                    resourceChanges: { denarii: -400 },
                    flagChanges: { impious: 1 },  // Oppius notes
                },
            },
            {
                id: 'accept_doom',
                text: 'Accept the doom. "So be it. I\'ll take Rome with me."',
                effects: {
                    relationChanges: { pulcher: -10 },
                    specialEffects: ['assassination_window_opens'],
                },
            },
        ],
    },

    // === DIVINE MANDATE PATH ===
    {
        id: 'pulcher_mandate',
        senatorId: 'pulcher',
        title: 'The Divine Mandate',
        description: `The Festival of Jupiter. Before all Rome, Pulcher raises his arms and speaks.

"The gods have chosen! This man — our leader — bears the divine mandate! What he wills, the heavens will! What he builds, the gods protect! Rome's destiny is in sacred hands!"

The crowd roars. Lightning flickers on a clear day.

Even skeptics fall silent.`,
        priority: 95,
        validStates: ['favored'],
        minRound: 28,
        cooldown: 0,  // Terminal
        conditions: {
            minRelation: 70,
            requiredFlags: { pious: 4 },
        },
        choices: [
            {
                id: 'accept_mandate',
                text: 'Accept the divine mandate with humility.',
                effects: {
                    relationChanges: { pulcher: 20 },
                    resourceChanges: { piety: 30, happiness: 15, morale: 15, reputation: 20 },
                    specialEffects: ['state_to_divine_mandate'],
                },
            },
        ],
    },

    // === SACRED MURDER PATH ===
    {
        id: 'pulcher_murder',
        senatorId: 'pulcher',
        title: 'The Sacred Poison',
        description: `The wine tastes strange at the temple feast.

By the time you realize, it's too late. Pulcher watches with priestly serenity as the poison works.

"The gods receive what is owed them."

Your last sight is the sacred flames, and Pulcher's eyes reflecting them.`,
        priority: 100,
        validStates: ['sacred_murder'],
        minRound: 26,
        cooldown: 0,
        conditions: {},
        choices: [
            {
                id: 'death',
                text: 'The gods claim their due.',
                effects: {
                    specialEffects: ['player_dies'],
                },
            },
        ],
    },
];

export default PULCHER_EVENTS;
