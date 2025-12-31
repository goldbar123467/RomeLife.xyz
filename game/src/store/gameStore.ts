// ============================================
// ROME EMPIRE BUILDER - Zustand Game Store
// ============================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    GameState, GameStage, Tab, Founder, GodName,
    Territory, Building, TradeCity,
    ResourceType, CaravanConfig, CaravanType, TradeState,
    AttentionAllocation, SenatorId
} from '@/core/types';
import {
    STARTING_STATE, BASE_PRICES,
    EMERGENCY_ACTIONS, CRAFTING_RECIPES, GOVERNORS, TERRITORY_FOCUS,
    WORSHIP_ACTIONS, RELIGIOUS_BUILDINGS,
    TERRITORY_LEVELS, TERRITORY_BUILDINGS, calculateMaxGarrison
} from '@/core/constants';
import {
    calculateBattleOdds, calculateEnemyStrength, resolveBattle
} from '@/core/math';
import { calculateBlessingBonus } from '@/core/constants/religion';
import { createInitialSenators, DEFAULT_ATTENTION, clampRelation } from '@/core/constants/senate';
import { TECHNOLOGIES, ACHIEVEMENTS, WONDERS, generateQuest } from '@/core/rules';
import {
    executeEndSeason, executeRecruitTroops, executeResearchTech,
    executeTrade, executeUpgradeTerritory, executeSendEnvoy, executeEnterInfiniteMode
} from '@/app/usecases';

// === INITIAL TERRITORIES ===
const INITIAL_TERRITORIES: Territory[] = [
    {
        id: 'palatine',
        name: 'Palatine Hill',
        latinName: 'Mons Palatinus',
        owned: true,
        rarity: 'uncommon',
        level: 1,
        stability: 75,
        focus: 'none',
        governor: null,
        resources: [
            { type: 'grain', baseAmount: 3 },
            { type: 'stone', baseAmount: 2 },
        ],
        buildings: [],
        population: 50,
        garrison: 15,
        requirements: [],
        difficulty: 0,
    },
    {
        id: 'tiber_ford',
        name: 'Tiber Ford',
        latinName: 'Vadum Tiberis',
        owned: false,
        rarity: 'common',
        level: 1,
        stability: 50,
        focus: 'none',
        governor: null,
        resources: [
            { type: 'salt', baseAmount: 2 },
            { type: 'timber', baseAmount: 2 },
        ],
        buildings: [],
        population: 30,
        garrison: 0,
        requirements: [{ type: 'troops', value: 40 }],
        difficulty: 35,
    },
    {
        id: 'sabine_hills',
        name: 'Sabine Hills',
        latinName: 'Montes Sabini',
        owned: false,
        rarity: 'common',
        level: 1,
        stability: 50,
        focus: 'none',
        governor: null,
        resources: [
            { type: 'wool', baseAmount: 3 },
            { type: 'livestock', baseAmount: 2 },
        ],
        buildings: [],
        population: 40,
        garrison: 0,
        requirements: [{ type: 'troops', value: 55 }, { type: 'territory', value: 'tiber_ford' }],
        difficulty: 45,
    },
    {
        id: 'veii',
        name: 'Veii',
        latinName: 'Veii Etruscorum',
        owned: false,
        rarity: 'rare',
        level: 1,
        stability: 50,
        focus: 'none',
        governor: null,
        resources: [
            { type: 'iron', baseAmount: 3 },
            { type: 'timber', baseAmount: 2 },
            { type: 'clay', baseAmount: 2 },
        ],
        buildings: [],
        population: 60,
        garrison: 0,
        requirements: [{ type: 'troops', value: 80 }, { type: 'territory', value: 'sabine_hills' }],
        difficulty: 65,
    },
    {
        id: 'ostia',
        name: 'Ostia',
        latinName: 'Ostia Tiberina',
        owned: false,
        rarity: 'rare',
        level: 1,
        stability: 50,
        focus: 'none',
        governor: null,
        resources: [
            { type: 'salt', baseAmount: 4 },
            { type: 'olive_oil', baseAmount: 2 },
        ],
        buildings: [],
        population: 45,
        garrison: 0,
        requirements: [{ type: 'troops', value: 70 }, { type: 'territory', value: 'tiber_ford' }],
        difficulty: 55,
    },
    {
        id: 'antium',
        name: 'Antium',
        latinName: 'Antium Maritima',
        owned: false,
        rarity: 'epic',
        level: 1,
        stability: 50,
        focus: 'none',
        governor: null,
        resources: [
            { type: 'wine', baseAmount: 3 },
            { type: 'olive_oil', baseAmount: 2 },
            { type: 'salt', baseAmount: 2 },
        ],
        buildings: [],
        population: 70,
        garrison: 0,
        requirements: [{ type: 'troops', value: 100 }, { type: 'territory', value: 'ostia' }],
        difficulty: 80,
    },
    {
        id: 'fidenae',
        name: 'Fidenae',
        latinName: 'Fidenae Vetus',
        owned: false,
        rarity: 'common',
        level: 1,
        stability: 50,
        focus: 'none',
        governor: null,
        resources: [
            { type: 'grain', baseAmount: 4 },
            { type: 'livestock', baseAmount: 2 },
        ],
        buildings: [],
        population: 35,
        garrison: 0,
        requirements: [{ type: 'troops', value: 50 }],
        difficulty: 40,
    },
];

// === INITIAL TRADE CITIES ===
const INITIAL_TRADE_CITIES: TradeCity[] = [
    { id: 'alba_longa', name: 'Alba Longa', distance: 20, tariff: 0.05, risk: 0.08, biases: ['clay', 'wine'], specialties: ['wine'], reputation: 50 },
    { id: 'latin_village', name: 'Latin Village', distance: 15, tariff: 0.03, risk: 0.05, biases: ['grain', 'wool'], specialties: ['grain'], reputation: 60 },
    { id: 'etruscan_port', name: 'Etruscan Port', distance: 35, tariff: 0.10, risk: 0.15, biases: ['iron', 'olive_oil'], specialties: ['iron'], reputation: 30 },
    { id: 'sabine_market', name: 'Sabine Market', distance: 25, tariff: 0.06, risk: 0.10, biases: ['wool', 'livestock'], specialties: ['wool'], reputation: 40 },
    { id: 'ostia_docks', name: 'Ostia Docks', distance: 18, tariff: 0.04, risk: 0.06, biases: ['salt', 'timber'], specialties: ['salt'], reputation: 55 },
    { id: 'greek_colony', name: 'Greek Colony', distance: 50, tariff: 0.12, risk: 0.20, biases: ['wine', 'spices'], specialties: ['olive_oil'], reputation: 25 },
];

// === CARAVAN CONFIGURATIONS ===
export const CARAVAN_CONFIGS: CaravanConfig[] = [
    {
        id: 'safe',
        name: 'Safe Caravan',
        icon: '🛡️',
        risk: 0.03,
        reward: 1.1,
        duration: 2,
        cost: 100,
        description: 'Low risk, low reward. Guards protect cargo.'
    },
    {
        id: 'standard',
        name: 'Standard Caravan',
        icon: '🐫',
        risk: 0.15,
        reward: 1.4,
        duration: 1,
        cost: 50,
        description: 'Balanced risk and reward.'
    },
    {
        id: 'risky',
        name: 'Fast Caravan',
        icon: '⚡',
        risk: 0.30,
        reward: 2.0,
        duration: 1,
        cost: 75,
        description: 'High risk through dangerous routes, massive profits!'
    },
    {
        id: 'luxury',
        name: 'Luxury Caravan',
        icon: '💎',
        risk: 0.10,
        reward: 2.5,
        duration: 3,
        cost: 300,
        description: 'Premium goods fetch premium prices. Takes time.'
    }
];

// === INITIAL TRADE STATE ===
const createInitialTradeState = (): TradeState => ({
    activeTab: 'quick',
    upgrades: { guards: 0, wagons: 0, negotiation: 0 },
    routes: [],
    activeCaravan: null,
    cityReputation: Object.fromEntries(INITIAL_TRADE_CITIES.map(c => [c.id, 0])),
});

// === INITIAL BUILDINGS ===
const INITIAL_BUILDINGS: Building[] = [
    { id: 'granary_1', name: 'Granary', category: 'production', rarity: 'common', cost: { denarii: 200, resources: { timber: 10, stone: 5 } }, upkeep: 5, effects: [{ type: 'production', resource: 'grain', value: 1.3, multiplier: true }, { type: 'capacity', resource: 'grain', value: 50 }], built: false, territoryId: 'palatine' },
    { id: 'marketplace_1', name: 'Marketplace', category: 'economic', rarity: 'common', cost: { denarii: 300, resources: { timber: 15, stone: 10 } }, upkeep: 8, effects: [{ type: 'income', value: 50 }], built: false, territoryId: 'palatine' },
    { id: 'barracks_1', name: 'Barracks', category: 'military', rarity: 'common', cost: { denarii: 250, resources: { timber: 20, iron: 5 } }, upkeep: 10, effects: [{ type: 'defense', value: 15 }], built: false, territoryId: 'palatine' },
    { id: 'shrine_1', name: 'Shrine', category: 'religious', rarity: 'common', cost: { denarii: 150, resources: { stone: 10, clay: 5 } }, upkeep: 3, effects: [{ type: 'piety', value: 2 }, { type: 'happiness', value: 5 }], built: false, territoryId: 'palatine' },
    { id: 'workshop_1', name: 'Workshop', category: 'production', rarity: 'common', cost: { denarii: 350, resources: { timber: 20, iron: 10 } }, upkeep: 8, effects: [{ type: 'production', value: 1.2, multiplier: true }], built: false, territoryId: 'palatine' },
    { id: 'walls_1', name: 'City Walls', category: 'military', rarity: 'uncommon', cost: { denarii: 500, resources: { stone: 50, timber: 20 } }, upkeep: 15, effects: [{ type: 'defense', value: 30 }, { type: 'happiness', value: 5 }], built: false, territoryId: 'palatine' },
    { id: 'temple_1', name: 'Temple', category: 'religious', rarity: 'uncommon', cost: { denarii: 400, resources: { stone: 30, clay: 15 } }, upkeep: 10, effects: [{ type: 'piety', value: 5 }, { type: 'happiness', value: 10 }], built: false, territoryId: 'palatine' },
    { id: 'farm_1', name: 'Farm Complex', category: 'production', rarity: 'common', cost: { denarii: 180, resources: { timber: 15 } }, upkeep: 4, effects: [{ type: 'production', resource: 'grain', value: 2.0, multiplier: true }], built: false, territoryId: 'palatine' },
    { id: 'mine_1', name: 'Iron Mine', category: 'production', rarity: 'uncommon', cost: { denarii: 400, resources: { timber: 25, stone: 15 } }, upkeep: 12, effects: [{ type: 'production', resource: 'iron', value: 3 }], built: false, territoryId: 'veii' },
    { id: 'banking_house', name: 'Banking House', category: 'economic', rarity: 'rare', cost: { denarii: 600, resources: { stone: 40, timber: 20 } }, upkeep: 15, effects: [{ type: 'income', value: 200 }], built: false, territoryId: 'palatine' },
];

// === STORE INTERFACE ===
interface GameStore extends GameState {
    // Actions - Game Flow
    startGame: (founder: Founder) => void;
    endSeason: () => void;
    setStage: (stage: GameStage) => void;
    setTab: (tab: Tab) => void;

    // Actions - Resources
    addDenarii: (amount: number) => void;
    addResource: (type: ResourceType, amount: number) => void;

    // Actions - Military
    recruitTroops: (unitId: string) => void;
    startBattle: (territoryId: string) => void;
    resolveBattleAction: () => void;

    // Actions - Economy
    setTaxRate: (rate: number) => void;
    executeTrade: (cityId: string, resource: ResourceType, amount: number) => void;

    // Actions - Caravans & Trade Routes
    setTradeTab: (tab: 'quick' | 'routes' | 'market' | 'caravans') => void;
    sendCaravan: (caravanType: CaravanType, cityId: string) => void;
    establishTradeRoute: (cityId: string, resourceId: ResourceType) => void;
    cancelTradeRoute: (routeId: string) => void;
    upgradeTradeSkill: (skill: 'guards' | 'wagons' | 'negotiation') => void;

    // Actions - Buildings
    buildStructure: (buildingId: string) => void;

    // Actions - Technology
    researchTechnology: (techId: string) => void;

    // Actions - Territory
    upgradeTerritory: (territoryId: string) => void;
    upgradeTerritoryLevel: (territoryId: string) => void;
    buildTerritoryBuilding: (territoryId: string, buildingId: string) => void;
    assignGarrison: (territoryId: string, troops: number) => void;
    recallGarrison: (territoryId: string, troops: number) => void;

    // Actions - Religion
    setPatronGod: (god: GodName) => void;
    worship: (action: string) => void;
    religiousBuildings: string[];
    buildReligiousBuilding: (buildingId: string) => void;

    // Actions - Diplomacy
    sendEnvoy: (factionId: string) => void;

    // Actions - Wonders
    startWonder: (wonderId: string) => void;

    // Actions - Emergency
    executeEmergency: (actionId: string) => void;

    // Actions - Crafting
    executeCraft: (recipeId: string) => void;

    // Actions - Governor & Territory Focus
    assignGovernor: (territoryId: string, governorId: string) => void;
    setTerritoryFocus: (territoryId: string, focus: string) => void;

    // Emergency Cooldowns
    emergencyCooldowns: Record<string, number>;

    // Actions - Infinite Mode
    enterInfiniteMode: () => void;

    // Actions - Debug
    debugAddResources: (type: ResourceType, amount: number) => void;
    debugSetGold: (amount: number) => void;
    debugFastForward: (rounds: number) => void;

    // Last events for UI display
    lastEvents: string[];

    // Senate event guard - tracks consecutive blocked attempts
    _endSeasonBlockedAttempts: number;

    // Battle Animation Settings
    battleSpeed: 'normal' | 'fast' | 'instant';
    setBattleSpeed: (speed: 'normal' | 'fast' | 'instant') => void;

    // Reset
    resetGame: () => void;

    // Actions - Senate
    initializeSenate: () => void;
    allocateAttention: (allocation: AttentionAllocation) => void;
    resolveSenatorEvent: (choiceId: string) => void;
    dismissSenatorEvent: () => void;
    setSenatorRelation: (senatorId: SenatorId, change: number) => void;
}

// === INITIAL STATE ===
const createInitialState = (): Omit<GameStore,
    'startGame' | 'endSeason' | 'setStage' | 'setTab' | 'addDenarii' | 'addResource' |
    'recruitTroops' | 'startBattle' | 'resolveBattleAction' | 'setTaxRate' | 'executeTrade' |
    'buildStructure' | 'researchTechnology' | 'upgradeTerritory' | 'upgradeTerritoryLevel' | 'buildTerritoryBuilding' |
    'assignGarrison' | 'recallGarrison' | 'setPatronGod' | 'worship' | 'buildReligiousBuilding' |
    'sendEnvoy' | 'startWonder' | 'executeEmergency' | 'executeCraft' | 'assignGovernor' | 'setTerritoryFocus' |
    'enterInfiniteMode' | 'debugAddResources' | 'debugSetGold' | 'debugFastForward' | 'resetGame' | 'setBattleSpeed' |
    'setTradeTab' | 'sendCaravan' | 'establishTradeRoute' | 'cancelTradeRoute' | 'upgradeTradeSkill' |
    'initializeSenate' | 'allocateAttention' | 'resolveSenatorEvent' | 'dismissSenatorEvent' | 'setSenatorRelation'
> => ({
    // Meta
    stage: 'intro',
    activeTab: 'overview',
    round: 1,
    season: 'spring',
    maxRounds: 25,
    infiniteMode: false,

    // Founder
    founder: null,

    // Resources
    denarii: STARTING_STATE.denarii,
    inventory: {
        grain: 500, iron: 10, timber: 20, stone: 15, clay: 10,  // grain: 500 for easy early game
        wool: 5, salt: 5, livestock: 10, wine: 0, olive_oil: 0, spices: 0,
    },
    capacity: {
        grain: 600, iron: 50, timber: 80, stone: 60, clay: 50,  // grain capacity 600 for easy early game
        wool: 40, salt: 40, livestock: 50, wine: 30, olive_oil: 30, spices: 20,
    },

    // Population & Happiness
    population: STARTING_STATE.population,
    happiness: STARTING_STATE.happiness,
    housing: STARTING_STATE.housing,
    sanitation: STARTING_STATE.sanitation,

    // Military
    troops: STARTING_STATE.troops,
    morale: STARTING_STATE.morale,
    supplies: STARTING_STATE.supplies,
    forts: STARTING_STATE.forts,

    // Religion
    piety: STARTING_STATE.piety,
    patronGod: null,
    godFavor: { jupiter: 0, mars: 0, venus: 0, ceres: 0, mercury: 0, minerva: 0 },
    religiousBuildings: [],

    // Economy
    taxRate: STARTING_STATE.taxRate,
    inflation: STARTING_STATE.inflation,
    reputation: STARTING_STATE.reputation,

    // Game Objects - initialized with full data from rules
    territories: INITIAL_TERRITORIES,
    buildings: INITIAL_BUILDINGS,
    technologies: [...TECHNOLOGIES], // Copy from rules
    tradeCities: INITIAL_TRADE_CITIES,
    quests: [],
    achievements: [...ACHIEVEMENTS], // Copy from rules
    wonders: [...WONDERS], // Copy from rules

    // Battle
    battle: null,

    // Market
    market: {
        prices: { ...BASE_PRICES },
        demandIndices: Object.fromEntries(Object.keys(BASE_PRICES).map(k => [k, 100])) as Record<ResourceType, number>,
        volatility: 1.0,
    },

    // Trade State
    tradeState: createInitialTradeState(),

    // Diplomacy
    diplomacy: {
        relations: { alba_longa: 50, sabines: 30, etruscans: 20, latins: 60, greeks: 15 },
        activeEnvoys: 0,
    },

    // Senate (V2 Political System)
    senate: {
        initialized: true,
        senators: createInitialSenators(),
        attentionThisSeason: { ...DEFAULT_ATTENTION },
        attentionLocked: false,
        pendingEvents: [],
        currentEvent: null,
        eventHistory: [],
        actionQueue: [],
        gracePhaseComplete: false,
        playerActionLog: [],
        anyAssassinationAttempted: false,
        senatoriusSavedPlayer: false,
    },

    // Stats
    totalConquests: 0,
    totalTrades: 0,
    winStreak: 0,
    consecutiveStarvation: 0,
    feastsUsed: 0,  // Tracks feast uses for diminishing returns
    history: [],
    treasuryHistory: [],

    // UI State
    lastEvents: [],
    _endSeasonBlockedAttempts: 0,

    // Emergency Cooldowns
    emergencyCooldowns: {},

    // Religion - Consecrated territories
    consecratedTerritories: [],
    worshipCooldowns: {},

    // Battle Animation Settings
    battleSpeed: 'normal' as const,
});

// === STORE CREATION ===
export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            ...createInitialState(),

            // === GAME FLOW ===
            startGame: (founder) => {
                // Generate initial quests
                const state = get();
                const quest1 = generateQuest(state);
                const quest2 = generateQuest(state);

                set({
                    stage: 'game',
                    founder,
                    round: 1,
                    season: 'spring',
                    quests: [quest1, quest2],
                });
            },

            endSeason: () => {
                let state = get();

                // Clear any pending senate events before season processing
                // This prevents permanent game lockout if events can't be resolved
                if (state.senate?.currentEvent || (state.senate?.pendingEvents?.length ?? 0) > 0) {
                    set({
                        senate: {
                            ...state.senate,
                            currentEvent: null,
                            pendingEvents: [],
                        },
                    });
                    state = get();
                }

                const result = executeEndSeason(state);

                // Apply state changes and reset the blocked attempts counter
                set({
                    ...result.newState,
                    _endSeasonBlockedAttempts: 0,
                    lastEvents: result.events,
                } as Partial<GameStore>);
            },

            setStage: (stage) => set({ stage }),
            setTab: (tab) => set({ activeTab: tab }),
            setBattleSpeed: (speed) => set({ battleSpeed: speed }),

            // === RESOURCES ===
            addDenarii: (amount) => set((state) => ({ denarii: Math.max(0, state.denarii + amount) })),
            addResource: (type, amount) => set((state) => ({
                inventory: {
                    ...state.inventory,
                    [type]: Math.min(state.inventory[type] + amount, state.capacity[type]),
                },
            })),

            // === MILITARY ===
            recruitTroops: (unitId) => {
                const state = get();
                const result = executeRecruitTroops(state, unitId);

                if (result.success) {
                    set({
                        ...result.newState,
                        lastEvents: [result.message],
                    } as Partial<GameStore>);
                } else {
                    set({ lastEvents: [result.message] });
                }
            },

            startBattle: (territoryId) => {
                const state = get();
                const territory = state.territories.find(t => t.id === territoryId);
                if (!territory || territory.owned) return;

                const attackBonus = state.founder?.modifiers.attackBonus || 0;
                const enemyStr = calculateEnemyStrength(
                    state.round,
                    state.territories.filter(t => t.owned).length,
                    state.troops,
                    state.infiniteMode,
                    territory.difficulty
                );

                // Collect attack multipliers from researched technologies
                const techMultipliers = state.technologies
                    .filter(t => t.researched)
                    .flatMap(t => t.effects.filter(e => e.type === 'attack').map(e => 1 + e.value));

                // Add god blessing bonuses: Jupiter 25 (+10% battle strength), Mars 50 (+10% attack)
                const jupiterBattleBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'battleStrength');
                const marsAttackBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'attack');
                const totalAttackBonus = attackBonus + jupiterBattleBonus + marsAttackBonus;

                // Collect building defense (reduces enemy effective strength)
                const buildingDefense = state.buildings
                    .filter(b => b.built)
                    .reduce((sum, b) => {
                        const defEffect = b.effects.find(e => e.type === 'defense');
                        return sum + (defEffect?.value || 0);
                    }, 0);

                // Tech defense bonus
                const techDefense = state.technologies
                    .filter(t => t.researched)
                    .reduce((sum, t) => {
                        const defEffect = t.effects.find(e => e.type === 'defense');
                        return sum + (defEffect?.value || 0);
                    }, 0);

                // Governor defense bonus/malus (Titus +25%, Marcus -10%, Lucius -15%)
                let governorDefenseMultiplier = 1.0;
                for (const t of state.territories.filter(t => t.owned && t.governor)) {
                    if (t.governor!.bonus.defense) governorDefenseMultiplier += t.governor!.bonus.defense;
                    if (t.governor!.malus.defense) governorDefenseMultiplier += t.governor!.malus.defense; // negative
                }

                // Territory focus defense bonus (military_outpost +30%)
                let focusDefenseMultiplier = 1.0;
                for (const t of state.territories.filter(t => t.owned && t.focus && t.focus !== 'none')) {
                    const focusData = TERRITORY_FOCUS[t.focus];
                    if (focusData?.bonus.defense) {
                        focusDefenseMultiplier += focusData.bonus.defense;
                    }
                }

                // Apply defense as reduction to enemy strength
                const totalDefenseBonus = buildingDefense * governorDefenseMultiplier * focusDefenseMultiplier;
                const adjustedEnemyStr = Math.max(10, enemyStr - totalDefenseBonus - (enemyStr * techDefense));

                const odds = calculateBattleOdds(
                    state.troops, state.morale, state.supplies, totalAttackBonus, techMultipliers, adjustedEnemyStr
                );

                set({
                    stage: 'battle',
                    battle: {
                        active: true,
                        type: 'conquest',
                        targetTerritory: territoryId,
                        playerStrength: odds.playerStrength,
                        enemyStrength: odds.enemyStrength,
                        odds: odds.odds,
                        casualties: { player: 0, enemy: 0 },
                    },
                });
            },

            resolveBattleAction: () => {
                const state = get();
                if (!state.battle) return;

                const result = resolveBattle(state.battle.playerStrength, state.battle.enemyStrength, state.battle.odds);

                // Apply Mars blessing: -30% casualties at tier 100
                const marsCasualtyBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'casualties');
                const adjustedCasualties = Math.floor(result.playerCasualties * (1 + marsCasualtyBonus)); // marsCasualtyBonus is negative
                const newTroops = Math.max(0, state.troops - adjustedCasualties);

                if (result.victory && state.battle.targetTerritory) {
                    const newTerritories = state.territories.map(t =>
                        t.id === state.battle!.targetTerritory ? { ...t, owned: true, garrison: 10 } : t
                    );

                    // Apply Jupiter blessing: +100 denarii on victory at tier 50
                    const jupiterVictoryBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'victoryDenarii');
                    const victoryDenarii = jupiterVictoryBonus > 0 ? Math.floor(jupiterVictoryBonus) : 0;

                    set({
                        stage: 'game',
                        troops: newTroops,
                        denarii: state.denarii + victoryDenarii,
                        territories: newTerritories,
                        totalConquests: state.totalConquests + 1,
                        winStreak: state.winStreak + 1,
                        battle: { ...state.battle, active: false, result: 'victory', casualties: { player: adjustedCasualties, enemy: result.enemyCasualties } },
                        lastEvents: [
                            `⚔️ Victory! Lost ${adjustedCasualties} troops.${victoryDenarii > 0 ? ` Jupiter grants +${victoryDenarii} denarii!` : ''}`
                        ],
                    });
                } else {
                    set({
                        stage: 'game',
                        troops: newTroops,
                        morale: Math.max(0, state.morale - 10),
                        winStreak: 0,
                        battle: { ...state.battle, active: false, result: 'defeat', casualties: { player: adjustedCasualties, enemy: result.enemyCasualties } },
                        lastEvents: [`💀 Defeat! Lost ${adjustedCasualties} troops.`],
                    });
                }
            },

            // === ECONOMY ===
            setTaxRate: (rate) => set({ taxRate: Math.max(0, Math.min(0.5, rate)) }),

            executeTrade: (cityId, resource, amount) => {
                const state = get();
                const result = executeTrade(state, cityId, resource, amount);

                set({
                    ...result.newState,
                    lastEvents: [result.message],
                } as Partial<GameStore>);
            },

            // === CARAVANS & TRADE ROUTES ===
            setTradeTab: (tab) => set((state) => ({
                tradeState: { ...state.tradeState, activeTab: tab }
            })),

            sendCaravan: (caravanType, cityId) => {
                const state = get();
                const config = CARAVAN_CONFIGS.find(c => c.id === caravanType);
                const city = state.tradeCities.find(c => c.id === cityId);

                if (!config || !city) return;
                if (state.denarii < config.cost) {
                    set({ lastEvents: ['❌ Not enough denarii for this caravan!'] });
                    return;
                }
                if (state.tradeState.activeCaravan) {
                    set({ lastEvents: ['❌ A caravan is already in transit!'] });
                    return;
                }

                // Collect goods to send (max 5 of each, up to 5 different goods)
                const goods: { resourceId: ResourceType; qty: number }[] = [];
                const tradable: ResourceType[] = ['grain', 'iron', 'timber', 'stone', 'clay', 'wool', 'salt', 'livestock', 'wine', 'olive_oil'];
                for (const res of tradable) {
                    if (state.inventory[res] > 0) {
                        const qty = Math.min(state.inventory[res], 5);
                        goods.push({ resourceId: res, qty });
                        if (goods.length >= 5) break;
                    }
                }

                if (goods.length === 0) {
                    set({ lastEvents: ['❌ No goods to send with caravan!'] });
                    return;
                }

                // Deduct goods from inventory
                const newInventory = { ...state.inventory };
                for (const g of goods) {
                    newInventory[g.resourceId] -= g.qty;
                }

                // Apply guard upgrade to risk
                const guardLevel = state.tradeState.upgrades.guards;
                const adjustedRisk = config.risk * (1 - guardLevel * 0.10);

                set({
                    denarii: state.denarii - config.cost,
                    inventory: newInventory,
                    tradeState: {
                        ...state.tradeState,
                        activeCaravan: {
                            type: caravanType,
                            cityId: cityId,
                            cityName: city.name,
                            risk: Math.max(0.01, adjustedRisk),
                            reward: config.reward,
                            duration: config.duration,
                            goods: goods,
                        }
                    },
                    lastEvents: [`🐫 Caravan sent to ${city.name}! Returns in ${config.duration} seasons.`],
                });
            },

            establishTradeRoute: (cityId, resourceId) => {
                const state = get();
                const city = state.tradeCities.find(c => c.id === cityId);

                if (!city) return;
                if (state.inventory[resourceId] < 5) {
                    set({ lastEvents: ['❌ Need at least 5 units to establish a route!'] });
                    return;
                }

                const routeCost = 500;
                if (state.denarii < routeCost) {
                    set({ lastEvents: ['❌ Not enough denarii (500d required)!'] });
                    return;
                }

                // Calculate route income
                const basePrice = state.market.prices[resourceId];
                const cityBonus = city.biases.includes(resourceId) ? 1.2 : 1.0;
                const negotiationBonus = 1 + (state.tradeState.upgrades.negotiation * 0.05);
                const routeQty = 3;
                const income = Math.floor(basePrice * routeQty * cityBonus * negotiationBonus * 0.8); // 80% efficiency

                const newRoute = {
                    id: `route_${Date.now()}`,
                    cityId: cityId,
                    resourceId: resourceId,
                    qty: routeQty,
                    income: income,
                    duration: 10,
                };

                set({
                    denarii: state.denarii - routeCost,
                    tradeState: {
                        ...state.tradeState,
                        routes: [...state.tradeState.routes, newRoute],
                    },
                    lastEvents: [`✓ Trade route established with ${city.name}! +${income}d/season for 10 seasons.`],
                });
            },

            cancelTradeRoute: (routeId) => {
                const state = get();
                const route = state.tradeState.routes.find(r => r.id === routeId);
                const city = route ? state.tradeCities.find(c => c.id === route.cityId) : null;

                set({
                    tradeState: {
                        ...state.tradeState,
                        routes: state.tradeState.routes.filter(r => r.id !== routeId),
                    },
                    lastEvents: city ? [`❌ Trade route with ${city.name} cancelled.`] : ['❌ Route cancelled.'],
                });
            },

            upgradeTradeSkill: (skill) => {
                const state = get();
                const currentLevel = state.tradeState.upgrades[skill];
                if (currentLevel >= 3) {
                    set({ lastEvents: [`❌ ${skill} is already at max level!`] });
                    return;
                }

                const cost = (currentLevel + 1) * 200; // 200, 400, 600
                if (state.denarii < cost) {
                    set({ lastEvents: [`❌ Not enough denarii (${cost}d required)!`] });
                    return;
                }

                const skillNames = { guards: 'Caravan Guards', wagons: 'Trade Wagons', negotiation: 'Negotiation' };

                set({
                    denarii: state.denarii - cost,
                    tradeState: {
                        ...state.tradeState,
                        upgrades: {
                            ...state.tradeState.upgrades,
                            [skill]: currentLevel + 1,
                        }
                    },
                    lastEvents: [`⬆️ ${skillNames[skill]} upgraded to level ${currentLevel + 1}!`],
                });
            },

            // === BUILDINGS ===
            buildStructure: (buildingId) => {
                const state = get();
                const building = state.buildings.find(b => b.id === buildingId);
                if (!building || building.built || state.denarii < building.cost.denarii) return;

                // Check resource costs
                if (building.cost.resources) {
                    for (const [res, amount] of Object.entries(building.cost.resources)) {
                        if ((state.inventory[res as ResourceType] || 0) < amount) return;
                    }
                }

                const newInventory = { ...state.inventory };
                if (building.cost.resources) {
                    for (const [res, amount] of Object.entries(building.cost.resources)) {
                        newInventory[res as ResourceType] -= amount;
                    }
                }

                // Apply building effects (capacity, happiness, piety, etc.)
                const newCapacity = { ...state.capacity };
                let newHappiness = state.happiness;
                let newPiety = state.piety;
                for (const effect of building.effects) {
                    if (effect.type === 'capacity' && effect.resource) {
                        newCapacity[effect.resource] = (newCapacity[effect.resource] || 0) + effect.value;
                    }
                    if (effect.type === 'happiness') {
                        newHappiness = Math.min(100, newHappiness + effect.value);
                    }
                    if (effect.type === 'piety') {
                        newPiety += effect.value;
                    }
                }

                set({
                    denarii: state.denarii - building.cost.denarii,
                    inventory: newInventory,
                    capacity: newCapacity,
                    happiness: newHappiness,
                    piety: newPiety,
                    buildings: state.buildings.map(b => b.id === buildingId ? { ...b, built: true } : b),
                    lastEvents: [`🏗️ Built ${building.name}!`],
                });
            },

            // === TECHNOLOGY ===
            researchTechnology: (techId) => {
                const state = get();
                const result = executeResearchTech(state, techId);

                if (result.success) {
                    set({
                        ...result.newState,
                        lastEvents: [result.message],
                    } as Partial<GameStore>);
                } else {
                    set({ lastEvents: [result.message] });
                }
            },

            // === TERRITORY ===
            upgradeTerritory: (territoryId) => {
                const state = get();
                const result = executeUpgradeTerritory(state, territoryId);

                if (result.success) {
                    set({
                        ...result.newState,
                        lastEvents: [result.message],
                    } as Partial<GameStore>);
                } else {
                    set({ lastEvents: [result.message] });
                }
            },

            upgradeTerritoryLevel: (territoryId) => {
                const state = get();
                const territory = state.territories.find(t => t.id === territoryId);
                if (!territory || !territory.owned) return;
                if (territory.level >= 5) return;

                const nextLevelNum = (territory.level + 1) as 1 | 2 | 3 | 4 | 5;
                const nextLevel = TERRITORY_LEVELS[nextLevelNum];
                if (!nextLevel || state.denarii < (nextLevel.upgradeCost || 0)) return;

                set({
                    denarii: state.denarii - (nextLevel.upgradeCost || 0),
                    territories: state.territories.map(t =>
                        t.id === territoryId
                            ? { ...t, level: nextLevel.level as 1 | 2 | 3 | 4 | 5, stability: Math.min(100, t.stability + nextLevel.stabilityBonus) }
                            : t
                    ),
                    lastEvents: [`📈 ${territory.name} upgraded to ${nextLevel.name}!`],
                });
            },

            buildTerritoryBuilding: (territoryId, buildingId) => {
                const state = get();
                const territory = state.territories.find(t => t.id === territoryId);
                const building = TERRITORY_BUILDINGS[buildingId];

                if (!territory || !building) return;
                if (territory.buildings.includes(buildingId)) return;
                if (state.denarii < building.cost) return;

                let newStability = territory.stability;
                if (building.effects.stability) {
                    newStability = Math.max(0, Math.min(100, newStability + building.effects.stability));
                }

                set({
                    denarii: state.denarii - building.cost,
                    territories: state.territories.map(t =>
                        t.id === territoryId
                            ? { ...t, buildings: [...t.buildings, buildingId], stability: newStability }
                            : t
                    ),
                    lastEvents: [`🏗️ Built ${building.name} in ${territory.name}!`],
                });
            },

            assignGarrison: (territoryId, troops) => {
                const state = get();
                const territory = state.territories.find(t => t.id === territoryId);
                if (!territory || troops <= 0 || troops > state.troops) return;

                const maxGarrison = calculateMaxGarrison(territory.buildings);
                const newGarrison = Math.min(maxGarrison, territory.garrison + troops);
                const actualAssigned = newGarrison - territory.garrison;

                if (actualAssigned <= 0) return;

                set({
                    troops: state.troops - actualAssigned,
                    territories: state.territories.map(t =>
                        t.id === territoryId
                            ? { ...t, garrison: newGarrison }
                            : t
                    ),
                    lastEvents: [`🛡️ Assigned ${actualAssigned} troops to ${territory.name}`],
                });
            },

            recallGarrison: (territoryId, troops) => {
                const state = get();
                const territory = state.territories.find(t => t.id === territoryId);
                if (!territory || troops <= 0 || troops > territory.garrison) return;

                set({
                    troops: state.troops + troops,
                    territories: state.territories.map(t =>
                        t.id === territoryId
                            ? { ...t, garrison: t.garrison - troops }
                            : t
                    ),
                    lastEvents: [`📤 Recalled ${troops} troops from ${territory.name}`],
                });
            },

            // === RELIGION ===
            setPatronGod: (god) => set({ patronGod: god }),

            worship: (actionId) => {
                const state = get();
                const worshipAction = WORSHIP_ACTIONS[actionId];
                if (!worshipAction) return;
                if (worshipAction.requiresPatron && !state.patronGod) return;

                // Check costs
                const cost = worshipAction.cost;
                if (cost.denarii && state.denarii < cost.denarii) return;
                if (cost.piety && state.piety < cost.piety) return;
                if (cost.livestock && (state.inventory.livestock || 0) < cost.livestock) return;
                if (cost.grain && (state.inventory.grain || 0) < cost.grain) return;

                // Deduct costs
                const newInventory = { ...state.inventory };
                let newDenarii = state.denarii;
                let newPiety = state.piety;

                if (cost.denarii) newDenarii -= cost.denarii;
                if (cost.piety) newPiety -= cost.piety;
                if (cost.livestock) newInventory.livestock -= cost.livestock;
                if (cost.grain) newInventory.grain -= cost.grain;

                // Apply effects
                const effect = worshipAction.effect;
                if (effect.piety) newPiety += effect.piety;

                const newGodFavor = { ...state.godFavor };
                if (effect.godFavor && state.patronGod) {
                    newGodFavor[state.patronGod] = Math.min(100, newGodFavor[state.patronGod] + effect.godFavor);
                }

                let newHappiness = state.happiness;
                let newReputation = state.reputation;
                let newPopulation = state.population;

                if (effect.happiness) newHappiness = Math.min(100, newHappiness + effect.happiness);
                if (effect.reputation) newReputation += effect.reputation;
                if (effect.population) newPopulation += effect.population;

                // Track additional state changes
                let newMorale = state.morale;
                let newTroops = state.troops;
                let newSupplies = state.supplies;
                const newConsecratedTerritories = [...(state.consecratedTerritories || [])];
                const eventMessages: string[] = [];

                // Handle CONSECRATION - Mark territory for +25% production
                if (effect.consecrate) {
                    const ownedTerritories = state.territories.filter(t => t.owned);
                    const unconsecrated = ownedTerritories.filter(t => !newConsecratedTerritories.includes(t.id));
                    if (unconsecrated.length > 0) {
                        const targetTerritory = unconsecrated[0]; // Consecrate first unconsecrated territory
                        newConsecratedTerritories.push(targetTerritory.id);
                        eventMessages.push(`✨ ${targetTerritory.name} has been consecrated! +25% production bonus`);
                    } else if (ownedTerritories.length === 0) {
                        eventMessages.push(`✨ No territories to consecrate. Conquer land first!`);
                    } else {
                        eventMessages.push(`✨ All territories already consecrated!`);
                    }
                }

                // Handle DIVINE AUGURY - Preview upcoming events
                if (effect.revealEvents) {
                    // Provide useful foresight to the player
                    const nextSeason = state.season === 'spring' ? 'summer' :
                                       state.season === 'summer' ? 'autumn' :
                                       state.season === 'autumn' ? 'winter' : 'spring';
                    const isWinterComing = nextSeason === 'winter' || state.season === 'autumn';

                    if (isWinterComing) {
                        eventMessages.push(`🔮 The augurs warn: Winter approaches! Prepare grain stores.`);
                    } else {
                        eventMessages.push(`🔮 The omens are favorable. Prosperity lies ahead.`);
                    }
                    // Bonus: +5 morale from the reassurance
                    newMorale = Math.min(100, newMorale + 5);
                }

                // Handle INVOKE BLESSING - Immediate powerful effect based on patron god
                if (effect.invokeBlessing && state.patronGod) {
                    switch (state.patronGod) {
                        case 'jupiter':
                            newReputation += 15;
                            newMorale = Math.min(100, newMorale + 20);
                            eventMessages.push(`⚡ Jupiter's thunder empowers your armies! +15 reputation, +20 morale`);
                            break;
                        case 'mars':
                            newTroops += 15;
                            newSupplies += 100;
                            eventMessages.push(`⚔️ Mars grants warriors! +15 troops, +100 supplies`);
                            break;
                        case 'venus':
                            newHappiness = Math.min(100, newHappiness + 20);
                            newPopulation += 25;
                            eventMessages.push(`💕 Venus blesses your people! +20 happiness, +25 population`);
                            break;
                        case 'ceres':
                            newInventory.grain = Math.min(state.capacity.grain, newInventory.grain + 150);
                            eventMessages.push(`🌾 Ceres fills your granaries! +150 grain`);
                            break;
                        case 'mercury':
                            newDenarii += 400;
                            eventMessages.push(`💰 Mercury brings fortune! +400 denarii`);
                            break;
                        case 'minerva':
                            newPiety += 25;
                            newReputation += 10;
                            eventMessages.push(`🦉 Minerva grants wisdom! +25 piety, +10 reputation`);
                            break;
                    }
                }

                // Build the event message
                const baseMessage = `🙏 ${worshipAction.name}!`;
                const bonusText = [
                    effect.godFavor ? `+${effect.godFavor} favor` : '',
                    effect.piety ? `+${effect.piety} piety` : ''
                ].filter(Boolean).join(', ');

                const allMessages = [
                    bonusText ? `${baseMessage} ${bonusText}` : baseMessage,
                    ...eventMessages
                ];

                set({
                    inventory: newInventory,
                    denarii: newDenarii,
                    piety: newPiety,
                    godFavor: newGodFavor,
                    happiness: newHappiness,
                    reputation: newReputation,
                    population: newPopulation,
                    morale: newMorale,
                    troops: newTroops,
                    supplies: newSupplies,
                    consecratedTerritories: newConsecratedTerritories,
                    lastEvents: allMessages,
                });
            },

            buildReligiousBuilding: (buildingId) => {
                const state = get();
                const building = RELIGIOUS_BUILDINGS[buildingId];
                if (!building) return;
                if (state.religiousBuildings.includes(buildingId)) return;
                if (state.denarii < building.cost) return;

                set({
                    denarii: state.denarii - building.cost,
                    religiousBuildings: [...state.religiousBuildings, buildingId],
                    lastEvents: [`🏛️ Built ${building.name}! +${building.pietyPerSeason} piety/season`],
                });
            },

            // === DIPLOMACY ===
            sendEnvoy: (factionId) => {
                const state = get();
                const result = executeSendEnvoy(state, factionId);

                set({
                    ...result.newState,
                    lastEvents: [result.message],
                } as Partial<GameStore>);
            },

            // === WONDERS ===
            startWonder: (wonderId) => {
                const state = get();
                const wonder = state.wonders.find(w => w.id === wonderId);

                if (!wonder || wonder.built) {
                    set({ lastEvents: ['Cannot build this wonder.'] });
                    return;
                }

                // Check wonder construction slots: 1 base + 1 per 3 owned territories
                const ownedTerritories = state.territories.filter(t => t.owned).length;
                const maxWonderSlots = 1 + Math.floor(ownedTerritories / 3);
                const currentlyBuilding = state.wonders.filter(w => w.turnsRemaining && w.turnsRemaining > 0).length;

                if (currentlyBuilding >= maxWonderSlots) {
                    set({ lastEvents: [`Already constructing ${currentlyBuilding} wonder${currentlyBuilding > 1 ? 's' : ''}! (Max: ${maxWonderSlots})`] });
                    return;
                }

                // Check denarii
                if (state.denarii < wonder.cost.denarii) {
                    set({ lastEvents: ['Not enough denarii!'] });
                    return;
                }

                // Check resources
                const newInventory = { ...state.inventory };
                for (const [res, amount] of Object.entries(wonder.cost.resources)) {
                    if ((newInventory[res as ResourceType] || 0) < (amount || 0)) {
                        set({ lastEvents: [`Not enough ${res}!`] });
                        return;
                    }
                }

                // Deduct costs
                for (const [res, amount] of Object.entries(wonder.cost.resources)) {
                    newInventory[res as ResourceType] -= (amount || 0);
                }

                // Start construction
                const newWonders = state.wonders.map(w =>
                    w.id === wonderId
                        ? { ...w, turnsRemaining: w.cost.turns }
                        : w
                );

                set({
                    denarii: state.denarii - wonder.cost.denarii,
                    inventory: newInventory,
                    wonders: newWonders,
                    lastEvents: [`Started construction of ${wonder.name}! ${wonder.cost.turns} seasons to complete.`],
                });
            },

            // === EMERGENCY ACTIONS ===
            executeEmergency: (actionId) => {
                const state = get();
                const action = EMERGENCY_ACTIONS.find(a => a.id === actionId);

                if (!action) {
                    set({ lastEvents: ['Unknown emergency action.'] });
                    return;
                }

                // Check cooldown
                if (state.emergencyCooldowns[actionId] && state.emergencyCooldowns[actionId] > 0) {
                    set({ lastEvents: [`${action.name} is on cooldown for ${state.emergencyCooldowns[actionId]} more seasons.`] });
                    return;
                }

                // Check costs
                for (const [costType, amount] of Object.entries(action.cost)) {
                    switch (costType) {
                        case 'happiness':
                            if (state.happiness < amount) {
                                set({ lastEvents: ['Not enough happiness!'] });
                                return;
                            }
                            break;
                        case 'denarii':
                            if (state.denarii < amount) {
                                set({ lastEvents: ['Not enough denarii!'] });
                                return;
                            }
                            break;
                        case 'piety':
                            if (state.piety < amount) {
                                set({ lastEvents: ['Not enough piety!'] });
                                return;
                            }
                            break;
                        case 'reputation':
                            if (state.reputation < amount) {
                                set({ lastEvents: ['Not enough reputation!'] });
                                return;
                            }
                            break;
                        case 'population':
                            if (state.population < amount) {
                                set({ lastEvents: ['Not enough population!'] });
                                return;
                            }
                            break;
                    }
                }

                // Apply costs
                let newHappiness = state.happiness;
                let newDenarii = state.denarii;
                let newPiety = state.piety;
                let newReputation = state.reputation;
                let newPopulation = state.population;

                for (const [costType, amount] of Object.entries(action.cost)) {
                    switch (costType) {
                        case 'happiness': newHappiness -= amount; break;
                        case 'denarii': newDenarii -= amount; break;
                        case 'piety': newPiety -= amount; break;
                        case 'reputation': newReputation -= amount; break;
                        case 'population': newPopulation -= amount; break;
                    }
                }

                // Apply effects
                let newTroops = state.troops;
                let newMorale = state.morale;
                const newInventory = { ...state.inventory };

                for (const [effectType, amount] of Object.entries(action.effect)) {
                    switch (effectType) {
                        case 'denarii': newDenarii += amount; break;
                        case 'troops': newTroops += amount; break;
                        case 'happiness': newHappiness += amount; break;
                        case 'morale': newMorale += amount; break;
                        case 'grain':
                            newInventory.grain = Math.min(
                                (newInventory.grain || 0) + amount,
                                state.capacity.grain || 100
                            );
                            break;
                    }
                }

                set({
                    happiness: Math.max(0, Math.min(100, newHappiness)),
                    denarii: Math.max(0, newDenarii),
                    piety: Math.max(0, newPiety),
                    reputation: Math.max(0, newReputation),
                    population: Math.max(0, newPopulation),
                    troops: Math.max(0, newTroops),
                    morale: Math.max(0, Math.min(100, newMorale)),
                    inventory: newInventory,
                    emergencyCooldowns: {
                        ...state.emergencyCooldowns,
                        [actionId]: action.cooldown,
                    },
                    lastEvents: [`${action.icon} ${action.name} executed!`],
                });
            },

            // === CRAFTING ===
            executeCraft: (recipeId) => {
                const state = get();
                const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);

                if (!recipe) {
                    set({ lastEvents: ['Unknown recipe.'] });
                    return;
                }

                // Check resources
                const newInventory = { ...state.inventory };
                for (const input of recipe.inputs) {
                    if ((newInventory[input.resource] || 0) < input.amount) {
                        set({ lastEvents: [`Not enough ${input.resource}!`] });
                        return;
                    }
                }

                // Deduct resources
                for (const input of recipe.inputs) {
                    newInventory[input.resource] -= input.amount;
                }

                // Apply effect
                let newHappiness = state.happiness;
                let newReputation = state.reputation;
                let newSupplies = state.supplies;
                let newFeastsUsed = state.feastsUsed;

                switch (recipe.effect.type) {
                    case 'happiness':
                        // Host Feast has diminishing returns: 20 × (0.5 ^ feastsUsed)
                        if (recipeId === 'host_feast') {
                            const diminishedValue = Math.floor(recipe.effect.value * Math.pow(0.5, state.feastsUsed));
                            newHappiness = Math.min(100, newHappiness + diminishedValue);
                            newFeastsUsed += 1;
                        } else {
                            newHappiness = Math.min(100, newHappiness + recipe.effect.value);
                        }
                        break;
                    case 'reputation':
                        newReputation += recipe.effect.value;
                        break;
                    case 'supplies':
                        newSupplies += recipe.effect.value;
                        break;
                    case 'attackBonus':
                        // For duration-based effects, we'd need to track active buffs
                        // For now, just show the message
                        break;
                }

                // Build message with diminished value for feast
                let message = `${recipe.icon} ${recipe.name} completed!`;
                if (recipeId === 'host_feast') {
                    const actualGain = Math.floor(recipe.effect.value * Math.pow(0.5, state.feastsUsed));
                    message = `${recipe.icon} ${recipe.name} completed! (+${actualGain} happiness)`;
                }

                set({
                    inventory: newInventory,
                    happiness: newHappiness,
                    reputation: newReputation,
                    supplies: newSupplies,
                    feastsUsed: newFeastsUsed,
                    lastEvents: [message],
                });
            },

            // === GOVERNOR ASSIGNMENT ===
            assignGovernor: (territoryId, governorId) => {
                const state = get();
                const governor = GOVERNORS.find(g => g.id === governorId);
                const territoryIdx = state.territories.findIndex(t => t.id === territoryId);

                if (!governor || territoryIdx === -1) {
                    set({ lastEvents: ['Invalid governor or territory.'] });
                    return;
                }

                if (state.denarii < governor.cost) {
                    set({ lastEvents: ['Not enough denarii to hire governor!'] });
                    return;
                }

                const newTerritories = [...state.territories];
                newTerritories[territoryIdx] = {
                    ...newTerritories[territoryIdx],
                    governor: {
                        id: governor.id,
                        name: governor.name,
                        trait: governor.trait as 'merchant' | 'general' | 'administrator' | 'priest' | 'scholar',
                        bonus: { ...governor.bonus },
                        malus: { ...governor.malus },
                    },
                };

                set({
                    denarii: state.denarii - governor.cost,
                    territories: newTerritories,
                    lastEvents: [`${governor.name} assigned to ${state.territories[territoryIdx].name}!`],
                });
            },

            // === TERRITORY FOCUS ===
            setTerritoryFocus: (territoryId, focus) => {
                const state = get();
                const focusData = TERRITORY_FOCUS[focus];
                const territoryIdx = state.territories.findIndex(t => t.id === territoryId);

                if (!focusData || territoryIdx === -1) {
                    set({ lastEvents: ['Invalid focus or territory.'] });
                    return;
                }

                if (state.denarii < focusData.cost) {
                    set({ lastEvents: ['Not enough denarii to set focus!'] });
                    return;
                }

                const newTerritories = [...state.territories];
                newTerritories[territoryIdx] = {
                    ...newTerritories[territoryIdx],
                    focus: focus as 'military_outpost' | 'trade_hub' | 'breadbasket' | 'mining_district' | 'none',
                };

                set({
                    denarii: state.denarii - focusData.cost,
                    territories: newTerritories,
                    lastEvents: [`${state.territories[territoryIdx].name} focus set to ${focusData.name}!`],
                });
            },

            // === INFINITE MODE ===
            enterInfiniteMode: () => {
                set(executeEnterInfiniteMode(get()));
            },

            // === DEBUG ===
            debugAddResources: (type, amount) => {
                const state = get();
                set({
                    inventory: { ...state.inventory, [type]: Math.min(state.inventory[type] + amount, state.capacity[type]) },
                });
                // Debug: added resources
            },

            debugSetGold: (amount) => {
                set({ denarii: amount });
                // Debug: gold set
            },

            debugFastForward: (rounds) => {
                // Debug: fast forwarding
                for (let i = 0; i < rounds * 4; i++) {
                    get().endSeason();
                }
            },

            // UI state
            lastEvents: [],

            // === SENATE ===
            initializeSenate: () => {
                set({
                    senate: {
                        initialized: true,
                        senators: createInitialSenators(),
                        attentionThisSeason: { ...DEFAULT_ATTENTION },
                        attentionLocked: false,
                        pendingEvents: [],
                        currentEvent: null,
                        eventHistory: [],
                        actionQueue: [],
                        gracePhaseComplete: false,
                        playerActionLog: [],
                        anyAssassinationAttempted: false,
                        senatoriusSavedPlayer: false,
                    },
                });
            },

            allocateAttention: (allocation) => {
                const state = get();
                // Validate sum equals 100
                const total = Object.values(allocation).reduce((a, b) => a + b, 0);
                if (total !== 100) {
                    set({ lastEvents: ['Attention must total 100 points!'] });
                    return;
                }

                set({
                    senate: {
                        ...state.senate,
                        attentionThisSeason: allocation,
                    },
                });
            },

            resolveSenatorEvent: (choiceId) => {
                const state = get();
                if (!state.senate.currentEvent) return;

                const event = state.senate.currentEvent;
                const choice = event.choices.find(c => c.id === choiceId);
                if (!choice) return;

                // Apply relation changes
                const newSenators = { ...state.senate.senators };
                if (choice.effects.relationChanges) {
                    for (const [senatorId, change] of Object.entries(choice.effects.relationChanges)) {
                        const sid = senatorId as SenatorId;
                        if (newSenators[sid]) {
                            newSenators[sid] = {
                                ...newSenators[sid],
                                relation: clampRelation(newSenators[sid].relation + change),
                            };
                        }
                    }
                }

                // Mark introduction as shown if this is an intro event (rounds 2-5)
                const isIntroEvent = state.round >= 2 && state.round <= 5 &&
                    !newSenators[event.senatorId]?.introductionShown;
                if (isIntroEvent && newSenators[event.senatorId]) {
                    newSenators[event.senatorId] = {
                        ...newSenators[event.senatorId],
                        introductionShown: true,
                    };
                }

                // Apply resource changes
                const newState: Partial<GameStore> = {};
                if (choice.effects.resourceChanges) {
                    const rc = choice.effects.resourceChanges;
                    if (rc.denarii) newState.denarii = state.denarii + rc.denarii;
                    if (rc.happiness) newState.happiness = Math.max(0, Math.min(100, state.happiness + rc.happiness));
                    if (rc.morale) newState.morale = Math.max(0, Math.min(100, state.morale + rc.morale));
                    if (rc.reputation) newState.reputation = state.reputation + rc.reputation;
                    if (rc.piety) newState.piety = Math.max(0, state.piety + rc.piety);
                }

                // Record event in history
                const newHistory = [
                    ...state.senate.eventHistory,
                    { eventId: event.id, choiceId, round: state.round }
                ];

                set({
                    ...newState,
                    senate: {
                        ...state.senate,
                        senators: newSenators,
                        // Pop next event from pendingEvents queue
                        currentEvent: state.senate.pendingEvents[0] || null,
                        pendingEvents: state.senate.pendingEvents.slice(1),
                        eventHistory: newHistory,
                    },
                    lastEvents: [`Senate: Resolved "${event.title}"`],
                });
            },

            dismissSenatorEvent: () => {
                const state = get();
                set({
                    senate: {
                        ...state.senate,
                        // Pop next event from pendingEvents queue
                        currentEvent: state.senate.pendingEvents[0] || null,
                        pendingEvents: state.senate.pendingEvents.slice(1),
                    },
                });
            },

            setSenatorRelation: (senatorId, change) => {
                const state = get();
                const senator = state.senate.senators[senatorId];
                if (!senator) return;

                set({
                    senate: {
                        ...state.senate,
                        senators: {
                            ...state.senate.senators,
                            [senatorId]: {
                                ...senator,
                                relation: clampRelation(senator.relation + change),
                            },
                        },
                    },
                });
            },

            // === RESET ===
            resetGame: () => set(createInitialState() as Partial<GameStore>),
        }),
        {
            name: 'rome-empire-save',
            partialize: (state) => ({
                round: state.round,
                season: state.season,
                stage: state.stage,
                founder: state.founder,
                denarii: state.denarii,
                inventory: state.inventory,
                capacity: state.capacity,
                population: state.population,
                happiness: state.happiness,
                housing: state.housing,
                sanitation: state.sanitation,
                troops: state.troops,
                morale: state.morale,
                supplies: state.supplies,
                forts: state.forts,
                piety: state.piety,
                patronGod: state.patronGod,
                godFavor: state.godFavor,
                taxRate: state.taxRate,
                inflation: state.inflation,
                reputation: state.reputation,
                territories: state.territories,
                buildings: state.buildings,
                technologies: state.technologies,
                tradeCities: state.tradeCities,
                quests: state.quests,
                achievements: state.achievements,
                wonders: state.wonders,
                market: state.market,
                tradeState: state.tradeState,
                diplomacy: state.diplomacy,
                senate: state.senate,
                totalConquests: state.totalConquests,
                totalTrades: state.totalTrades,
                winStreak: state.winStreak,
                consecutiveStarvation: state.consecutiveStarvation,
                feastsUsed: state.feastsUsed,
                infiniteMode: state.infiniteMode,
                history: state.history,
                treasuryHistory: state.treasuryHistory,
                emergencyCooldowns: state.emergencyCooldowns,
            }),
        }
    )
);

export type { GameStore };
