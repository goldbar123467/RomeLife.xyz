// ============================================
// ROME EMPIRE BUILDER - Game Rules & Conditions
// ============================================

import type {
    GameState, Achievement, Quest, Technology, Wonder,
    Territory, ResourceType
} from '../types';
import { GAME_CONSTANTS } from '../constants';
import { randomInt } from '../math';

// === VICTORY CONDITIONS ===

export interface VictoryResult {
    type: 'eternal_city' | 'commerce' | 'conqueror' | 'glory' | 'industrial';
    title: string;
    description: string;
}

export function checkVictoryConditions(state: GameState): VictoryResult | null {
    const { denarii, population, happiness, troops, reputation, territories, buildings } = state;
    const ownedTerritories = territories.filter(t => t.owned).length;
    const builtBuildings = buildings.reduce((sum, b) => sum + b.count, 0);

    // The Eternal City: 10 territories, 500 pop, 75% happiness
    if (
        ownedTerritories >= GAME_CONSTANTS.VICTORY_ETERNAL_CITY.territories &&
        population >= GAME_CONSTANTS.VICTORY_ETERNAL_CITY.population &&
        happiness >= GAME_CONSTANTS.VICTORY_ETERNAL_CITY.happiness
    ) {
        return {
            type: 'eternal_city',
            title: 'The Eternal City',
            description: 'You have built a prosperous empire that will stand for millennia.',
        };
    }

    // Master of Commerce: 15,000 denarii, 35 reputation
    if (
        denarii >= GAME_CONSTANTS.VICTORY_COMMERCE.denarii &&
        reputation >= GAME_CONSTANTS.VICTORY_COMMERCE.reputation
    ) {
        return {
            type: 'commerce',
            title: 'Master of Commerce',
            description: 'Your trade networks span the known world.',
        };
    }

    // Conqueror King: 8 territories, 180 troops
    if (
        ownedTerritories >= GAME_CONSTANTS.VICTORY_CONQUEROR.territories &&
        troops >= GAME_CONSTANTS.VICTORY_CONQUEROR.troops
    ) {
        return {
            type: 'conqueror',
            title: 'Conqueror King',
            description: 'Your legions are unmatched. All bow before Rome.',
        };
    }

    // City of Glory: 600 pop, 90% happiness
    if (
        population >= GAME_CONSTANTS.VICTORY_GLORY.population &&
        happiness >= GAME_CONSTANTS.VICTORY_GLORY.happiness
    ) {
        return {
            type: 'glory',
            title: 'City of Glory',
            description: 'Your citizens live in unparalleled prosperity and joy.',
        };
    }

    // Industrial Pioneer: 15 buildings, 10,000 denarii
    if (
        builtBuildings >= GAME_CONSTANTS.VICTORY_INDUSTRIAL.buildings &&
        denarii >= GAME_CONSTANTS.VICTORY_INDUSTRIAL.denarii
    ) {
        return {
            type: 'industrial',
            title: 'Industrial Pioneer',
            description: 'Your infrastructure is the envy of all nations.',
        };
    }

    return null;
}

// === FAILURE CONDITIONS ===

export interface FailureResult {
    type: 'famine' | 'collapse' | 'unrest' | 'assassination';
    title: string;
    description: string;
}

export function checkFailureConditions(state: GameState): FailureResult | null {
    const { consecutiveStarvation, population, happiness } = state;

    // Famine: 3+ consecutive starvation rounds
    if (consecutiveStarvation >= GAME_CONSTANTS.FAILURE_STARVATION_LIMIT) {
        return {
            type: 'famine',
            title: 'Famine',
            description: 'Your people have starved. The dream of Rome dies with them.',
        };
    }

    // Collapse: Population < 40
    if (population < GAME_CONSTANTS.FAILURE_MIN_POPULATION) {
        return {
            type: 'collapse',
            title: 'Collapse',
            description: 'Your population has dwindled to nothing. Rome is abandoned.',
        };
    }

    // Unrest: Happiness ≤ 25% (FAILURE_MIN_HAPPINESS = 25)
    if (happiness <= GAME_CONSTANTS.FAILURE_MIN_HAPPINESS) {
        return {
            type: 'unrest',
            title: 'Revolt',
            description: 'Civil unrest has torn Rome apart. The people have risen against you.',
        };
    }

    return null;
}

// === ACHIEVEMENTS ===

export const ACHIEVEMENTS: Achievement[] = [
    // Early game
    { id: 'first_blood', name: 'First Blood', description: 'Win your first conquest', condition: 'totalConquests >= 1', unlocked: false, reward: { denarii: 100 } },
    { id: 'settler', name: 'Settler', description: 'Own 3 territories', condition: 'territories >= 3', unlocked: false, reward: { happiness: 5 } },
    { id: 'builder', name: 'Builder', description: 'Construct 5 buildings', condition: 'buildings >= 5', unlocked: false, reward: { denarii: 200 } },

    // Economy
    { id: 'economic_titan', name: 'Economic Titan', description: 'Accumulate 20,000 denarii', condition: 'denarii >= 20000', unlocked: false, reward: { reputation: 10 } },
    { id: 'trader', name: 'Merchant Prince', description: 'Complete 20 trades', condition: 'trades >= 20', unlocked: false, reward: { denarii: 500 } },

    // Population
    { id: 'population_boom', name: 'Population Boom', description: 'Reach 500 population', condition: 'population >= 500', unlocked: false, reward: { housing: 50 } },
    { id: 'city_state', name: 'City State', description: 'Reach 300 population', condition: 'population >= 300', unlocked: false, reward: { happiness: 10 } },

    // Military
    { id: 'military_might', name: 'Military Might', description: 'Command 200 troops', condition: 'troops >= 200', unlocked: false, reward: { morale: 15 } },
    { id: 'undefeated', name: 'Undefeated', description: 'Win 5 battles in a row', condition: 'winStreak >= 5', unlocked: false, reward: { favor: 25 } },
    { id: 'centurion', name: 'Centurion', description: 'Command 100 troops', condition: 'troops >= 100', unlocked: false, reward: { supplies: 30 } },

    // Buildings
    { id: 'master_builder', name: 'Master Builder', description: 'Construct 15 buildings', condition: 'buildings >= 15', unlocked: false, reward: { capacity: 100 } },

    // Territory
    { id: 'territorial', name: 'Territorial', description: 'Control 10 territories', condition: 'territories >= 10', unlocked: false, reward: { denarii: 1000 } },

    // Tech
    { id: 'renaissance', name: 'Renaissance', description: 'Research 8 technologies', condition: 'technologies >= 8', unlocked: false, reward: { happiness: 15 } },

    // Survival
    { id: 'survivor', name: 'Survivor', description: 'Reach season 30', condition: 'round >= 30', unlocked: false, reward: { denarii: 500, supplies: 50 } },
    { id: 'decade', name: 'A Decade of Rome', description: 'Reach season 40', condition: 'round >= 40', unlocked: false, reward: { reputation: 15 } },

    // Special
    { id: 'infinite_founder', name: 'Infinite Founder', description: 'Enter infinite mode', condition: 'infiniteMode', unlocked: false, reward: { denarii: 2000, favor: 50 } },
    { id: 'legendary_find', name: 'Fortune Favors the Bold', description: 'Discover a Legendary or Imperial rarity item', condition: 'special:legendary', unlocked: false, reward: { reputation: 20 } },
    { id: 'divine_favor', name: 'Divine Favor', description: 'Reach 100 favor with any god', condition: 'godFavor >= 100', unlocked: false, reward: { piety: 50 } },
    { id: 'peaceful', name: 'Pax Romana', description: 'Reach 90% happiness', condition: 'happiness >= 90', unlocked: false, reward: { denarii: 300 } },
    { id: 'wealthy', name: 'Croesus of Rome', description: 'Have 10,000 denarii at once', condition: 'denarii >= 10000', unlocked: false, reward: { reputation: 5 } },
];

export function checkAchievements(state: GameState, previousState: GameState): Achievement[] {
    const newlyUnlocked: Achievement[] = [];
    const { totalConquests, totalTrades, winStreak, infiniteMode } = state;
    const ownedTerritories = state.territories.filter(t => t.owned).length;
    const builtBuildings = state.buildings.reduce((sum, b) => sum + b.count, 0);
    const researchedTechs = state.technologies.filter(t => t.researched).length;
    const maxGodFavor = Math.max(...Object.values(state.godFavor));

    for (const achievement of state.achievements) {
        if (achievement.unlocked) continue;

        let unlocked = false;

        switch (achievement.id) {
            case 'first_blood': unlocked = totalConquests >= 1; break;
            case 'settler': unlocked = ownedTerritories >= 3; break;
            case 'builder': unlocked = builtBuildings >= 5; break;
            case 'economic_titan': unlocked = state.denarii >= 20000; break;
            case 'trader': unlocked = totalTrades >= 20; break;
            case 'population_boom': unlocked = state.population >= 500; break;
            case 'city_state': unlocked = state.population >= 300; break;
            case 'military_might': unlocked = state.troops >= 200; break;
            case 'undefeated': unlocked = winStreak >= 5; break;
            case 'centurion': unlocked = state.troops >= 100; break;
            case 'master_builder': unlocked = builtBuildings >= 15; break;
            case 'territorial': unlocked = ownedTerritories >= 10; break;
            case 'renaissance': unlocked = researchedTechs >= 8; break;
            case 'survivor': unlocked = state.round >= 30; break;
            case 'decade': unlocked = state.round >= 40; break;
            case 'infinite_founder': unlocked = infiniteMode && !previousState.infiniteMode; break;
            case 'divine_favor': unlocked = maxGodFavor >= 100; break;
            case 'peaceful': unlocked = state.happiness >= 90; break;
            case 'wealthy': unlocked = state.denarii >= 10000; break;
            case 'legendary_find':
                // Check if player owns any legendary/imperial rarity territory or has built such building
                unlocked = state.territories.some(t => t.owned && (t.rarity === 'legendary' || t.rarity === 'imperial')) ||
                    state.buildings.some(b => b.count > 0 && (b.rarity === 'legendary' || b.rarity === 'imperial'));
                break;
        }

        if (unlocked) {
            newlyUnlocked.push({ ...achievement, unlocked: true });
        }
    }

    return newlyUnlocked;
}

// === QUESTS ===

const QUEST_TEMPLATES = [
    { type: 'build' as const, targets: ['granary', 'marketplace', 'barracks', 'temple'], amounts: [2, 3, 4], rewards: { denarii: [200, 350, 500] } },
    { type: 'conquer' as const, targets: ['any'], amounts: [1, 2, 3], rewards: { reputation: [5, 10, 15] } },
    { type: 'trade' as const, targets: ['any'], amounts: [3, 5, 8], rewards: { denarii: [150, 300, 500] } },
    { type: 'research' as const, targets: ['any'], amounts: [1, 2, 3], rewards: { denarii: [250, 400, 600] } },
    { type: 'threshold' as const, targets: ['population', 'troops', 'happiness'], amounts: [200, 100, 80], rewards: { denarii: [300, 300, 200] } },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateQuest(_state: GameState): Quest {
    const template = QUEST_TEMPLATES[randomInt(0, QUEST_TEMPLATES.length - 1)];
    const difficultyIdx = randomInt(0, 2);
    const targetIdx = randomInt(0, template.targets.length - 1);

    const questId = `quest_${Date.now()}_${randomInt(1000, 9999)}`;

    let title = '';
    let description = '';
    const target = template.amounts[difficultyIdx];
    const rewardKey = Object.keys(template.rewards)[0] as keyof typeof template.rewards;
    const rewardValue = template.rewards[rewardKey]![difficultyIdx];

    switch (template.type) {
        case 'build':
            title = 'Construction Contract';
            description = `Build ${target} structures`;
            break;
        case 'conquer':
            title = 'Expand the Empire';
            description = `Conquer ${target} new territories`;
            break;
        case 'trade':
            title = 'Trade Agreement';
            description = `Complete ${target} trades`;
            break;
        case 'research':
            title = 'Pursuit of Knowledge';
            description = `Research ${target} technologies`;
            break;
        case 'threshold':
            const thresholdType = template.targets[targetIdx];
            title = `Reach ${target} ${thresholdType}`;
            description = `Achieve ${target} ${thresholdType}`;
            break;
    }

    return {
        id: questId,
        title,
        description,
        type: template.type,
        target,
        progress: 0,
        reward: { [rewardKey]: rewardValue },
        active: true,
        completed: false,
    };
}

export function checkQuestProgress(state: GameState, quest: Quest): number {
    switch (quest.type) {
        case 'build':
            return state.buildings.reduce((sum, b) => sum + b.count, 0);
        case 'conquer':
            return state.totalConquests;
        case 'trade':
            return state.totalTrades;
        case 'research':
            return state.technologies.filter(t => t.researched).length;
        case 'threshold':
            if (quest.description.includes('population')) return state.population;
            if (quest.description.includes('troops')) return state.troops;
            if (quest.description.includes('happiness')) return state.happiness;
            return 0;
        default:
            return 0;
    }
}

// === TECHNOLOGIES ===

export const TECHNOLOGIES: Technology[] = [
    // Economy (8)
    { id: 'currency', name: 'Currency', description: 'Establish a standardized coinage system', cost: 300, researched: false, effects: [{ type: 'income', value: 0.1, description: '+10% tax income' }], category: 'economy' },
    { id: 'banking', name: 'Banking', description: 'Create lending institutions', cost: 600, researched: false, effects: [{ type: 'income', value: 0.15, description: '+15% tax income' }], category: 'economy' },
    { id: 'taxation', name: 'Advanced Taxation', description: 'Efficient tax collection', cost: 450, researched: false, effects: [{ type: 'taxEfficiency', value: 0.1, description: '+10% tax efficiency' }], category: 'economy' },
    { id: 'accounting', name: 'Accounting', description: 'Track expenses accurately', cost: 350, researched: false, effects: [{ type: 'upkeep', value: -0.1, description: '-10% upkeep costs' }], category: 'economy' },

    // Military (8)
    { id: 'legion', name: 'Legion Formation', description: 'Organize troops into legions', cost: 500, researched: false, effects: [{ type: 'attack', value: 0.2, description: '+20% attack power' }], category: 'military' },
    { id: 'forge', name: 'Iron Forge', description: 'Superior weapons', cost: 400, researched: false, effects: [{ type: 'attack', value: 0.1, description: '+10% attack power' }], category: 'military' },
    { id: 'tactics', name: 'Military Tactics', description: 'Advanced battle strategies', cost: 550, researched: false, effects: [{ type: 'defense', value: 0.15, description: '+15% defense' }], category: 'military' },
    { id: 'fortification', name: 'Fortification', description: 'Stronger walls and forts', cost: 450, researched: false, effects: [{ type: 'fortDefense', value: 0.25, description: '+25% fort effectiveness' }], category: 'military' },

    // Farming (6)
    { id: 'irrigation', name: 'Irrigation', description: 'Water management for crops', cost: 350, researched: false, effects: [{ type: 'production', value: 0.2, description: '+20% grain production' }], category: 'farming' },
    { id: 'crop_rotation', name: 'Crop Rotation', description: 'Sustainable farming', cost: 400, researched: false, effects: [{ type: 'production', value: 0.15, description: '+15% all farm output' }], category: 'farming' },
    { id: 'animal_husbandry', name: 'Animal Husbandry', description: 'Better livestock breeding', cost: 350, researched: false, effects: [{ type: 'production', value: 0.2, description: '+20% livestock production' }], category: 'farming' },

    // Mining (4)
    { id: 'mining_tools', name: 'Mining Tools', description: 'Iron picks and carts', cost: 400, researched: false, effects: [{ type: 'production', value: 0.2, description: '+20% ore production' }], category: 'mining' },
    { id: 'deep_mining', name: 'Deep Mining', description: 'Access deeper veins', cost: 550, researched: false, effects: [{ type: 'production', value: 0.3, description: '+30% iron/stone production' }], category: 'mining' },

    // Population (6)
    { id: 'medicine', name: 'Medicine', description: 'Basic healthcare', cost: 400, researched: false, effects: [{ type: 'popGrowth', value: 0.15, description: '+15% population growth' }], category: 'population' },
    { id: 'aqueduct', name: 'Aqueducts', description: 'Clean water supply', cost: 600, researched: false, effects: [{ type: 'sanitation', value: 30, description: '+30 sanitation' }, { type: 'happiness', value: 10, description: '+10 happiness' }], category: 'population' },
    { id: 'public_baths', name: 'Public Baths', description: 'Hygiene and leisure', cost: 500, researched: false, effects: [{ type: 'happiness', value: 15, description: '+15 happiness' }], category: 'population' },

    // Trade (6)
    { id: 'roads', name: 'Roman Roads', description: 'Paved trade routes', cost: 500, researched: false, effects: [{ type: 'tradeRisk', value: -0.15, description: '-15% trade risk' }], category: 'trade' },
    { id: 'harbors', name: 'Harbors', description: 'Sea trade facilities', cost: 600, researched: false, effects: [{ type: 'tradePrice', value: 0.1, description: '+10% trade prices' }], category: 'trade' },
    { id: 'caravans', name: 'Caravans', description: 'Organized trade expeditions', cost: 450, researched: false, effects: [{ type: 'tradeCapacity', value: 50, description: '+50 trade capacity' }], category: 'trade' },
];

export function getTechMultiplier(technologies: Technology[], effectType: string): number {
    let multiplier = 1.0;

    for (const tech of technologies.filter(t => t.researched)) {
        for (const effect of tech.effects) {
            if (effect.type === effectType) {
                multiplier += effect.value;
            }
        }
    }

    return multiplier;
}

export function getTechBonus(technologies: Technology[], effectType: string): number {
    let bonus = 0;

    for (const tech of technologies.filter(t => t.researched)) {
        for (const effect of tech.effects) {
            if (effect.type === effectType) {
                bonus += effect.value;
            }
        }
    }

    return bonus;
}

// === WONDERS ===

export const WONDERS: Wonder[] = [
    {
        id: 'colosseum',
        name: 'Colosseum',
        description: 'The greatest arena in the world',
        cost: { denarii: 5000, resources: { stone: 200, iron: 50 }, turns: 8 },
        built: false,
        effects: [
            { type: 'happiness', value: 25, description: '+25 permanent happiness' },
            { type: 'reputation', value: 20, description: '+20 reputation' },
        ],
    },
    {
        id: 'pantheon',
        name: 'Pantheon',
        description: 'Temple to all the gods',
        cost: { denarii: 4000, resources: { stone: 150, clay: 100 }, turns: 6 },
        built: false,
        effects: [
            { type: 'piety', value: 50, description: '+50 piety capacity' },
            { type: 'godFavor', value: 0.25, description: '+25% favor gain' },
        ],
    },
    {
        id: 'circus_maximus',
        name: 'Circus Maximus',
        description: 'Chariot racing stadium',
        cost: { denarii: 3500, resources: { stone: 100, timber: 80 }, turns: 5 },
        built: false,
        effects: [
            { type: 'happiness', value: 20, description: '+20 happiness' },
            { type: 'income', value: 200, description: '+200 income per season' },
        ],
    },
    {
        id: 'aqua_claudia',
        name: 'Aqua Claudia',
        description: 'Massive aqueduct system',
        cost: { denarii: 4500, resources: { stone: 180, clay: 60 }, turns: 7 },
        built: false,
        effects: [
            { type: 'sanitation', value: 100, description: '+100 sanitation' },
            { type: 'popGrowth', value: 0.2, description: '+20% population growth' },
        ],
    },
    {
        id: 'forum_romanum',
        name: 'Forum Romanum',
        description: 'The heart of Roman commerce and politics',
        cost: { denarii: 6000, resources: { stone: 200, timber: 100, iron: 30 }, turns: 10 },
        built: false,
        effects: [
            { type: 'income', value: 500, description: '+500 income per season' },
            { type: 'reputation', value: 30, description: '+30 reputation' },
        ],
    },
    {
        id: 'palatine_palace',
        name: 'Palatine Palace',
        description: 'Imperial residence',
        cost: { denarii: 8000, resources: { stone: 250, timber: 150, iron: 50 }, turns: 12 },
        built: false,
        effects: [
            { type: 'allStats', value: 0.1, description: '+10% to all production' },
            { type: 'happiness', value: 15, description: '+15 happiness' },
            { type: 'stability', value: 20, description: '+20 territory stability' },
        ],
    },
];

// === UNLOCK CHECKS ===

export function canUnlockTerritory(state: GameState, territory: Territory): boolean {
    if (territory.owned) return false;

    for (const req of territory.requirements) {
        switch (req.type) {
            case 'troops':
                if (state.troops < (req.value as number)) return false;
                break;
            case 'territory':
                const reqTerritory = state.territories.find(t => t.id === req.value);
                if (!reqTerritory || !reqTerritory.owned) return false;
                break;
            case 'denarii':
                if (state.denarii < (req.value as number)) return false;
                break;
            case 'tech':
                const reqTech = state.technologies.find(t => t.id === req.value);
                if (!reqTech || !reqTech.researched) return false;
                break;
        }
    }

    return true;
}

export function canAffordBuilding(state: GameState, building: { cost: { denarii: number; resources?: Partial<Record<ResourceType, number>> } }): boolean {
    if (state.denarii < building.cost.denarii) return false;

    if (building.cost.resources) {
        for (const [resource, amount] of Object.entries(building.cost.resources)) {
            if ((state.inventory[resource as ResourceType] || 0) < amount) return false;
        }
    }

    return true;
}

export function canAffordTech(state: GameState, tech: Technology): boolean {
    return state.denarii >= tech.cost && !tech.researched;
}
