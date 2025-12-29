// ============================================
// TERRITORY SYSTEM CONSTANTS
// ============================================

// === TERRITORY LEVELS ===

export interface TerritoryLevel {
  level: 1 | 2 | 3 | 4 | 5;
  name: string;
  latinName: string;
  productionMultiplier: number;
  stabilityBonus: number;
  upgradeCost: number | null; // null for level 1 (no upgrade needed)
}

export const TERRITORY_LEVELS: Record<number, TerritoryLevel> = {
  1: {
    level: 1,
    name: 'Settlement',
    latinName: 'Vicus',
    productionMultiplier: 1.0,
    stabilityBonus: 0,
    upgradeCost: null,
  },
  2: {
    level: 2,
    name: 'Town',
    latinName: 'Oppidum',
    productionMultiplier: 1.2,
    stabilityBonus: 5,
    upgradeCost: 400,
  },
  3: {
    level: 3,
    name: 'City',
    latinName: 'Urbs',
    productionMultiplier: 1.5,
    stabilityBonus: 10,
    upgradeCost: 800,
  },
  4: {
    level: 4,
    name: 'Metropolis',
    latinName: 'Metropolis',
    productionMultiplier: 2.0,
    stabilityBonus: 15,
    upgradeCost: 1500,
  },
  5: {
    level: 5,
    name: 'Capital Province',
    latinName: 'Provincia Capitalis',
    productionMultiplier: 3.0,
    stabilityBonus: 25,
    upgradeCost: 3000,
  },
};

// === TERRITORY BUILDINGS ===

export interface TerritoryBuildingEffect {
  defense?: number;
  stability?: number;
  troopCapacity?: number;
  happiness?: number;
  piety?: number;
  income?: number;
  tradeRisk?: number;
  foodStorage?: number;
  taxBonus?: number;
  marketBonus?: boolean;
}

export interface TerritoryBuilding {
  id: string;
  name: string;
  latinName: string;
  icon: string;
  cost: number;
  effects: TerritoryBuildingEffect;
  description: string;
}

export const TERRITORY_BUILDINGS: Record<string, TerritoryBuilding> = {
  garrison: {
    id: 'garrison',
    name: 'Garrison',
    latinName: 'Praesidium',
    icon: '🏰',
    cost: 300,
    effects: { defense: 15, stability: 10, troopCapacity: 50 },
    description: 'Military garrison for defense. +15 defense, +10 stability, +50 troop capacity.',
  },
  walls: {
    id: 'walls',
    name: 'Walls',
    latinName: 'Moenia',
    icon: '🧱',
    cost: 500,
    effects: { defense: 30, stability: 15 },
    description: 'Strong defensive fortifications. +30 defense, +15 stability.',
  },
  arena: {
    id: 'arena',
    name: 'Arena',
    latinName: 'Arena',
    icon: '🏟️',
    cost: 350,
    effects: { happiness: 15, stability: 8 },
    description: 'Entertainment for the masses. +15% happiness, +8 stability.',
  },
  roads: {
    id: 'roads',
    name: 'Roads',
    latinName: 'Viae',
    icon: '🛤️',
    cost: 400,
    effects: { tradeRisk: -0.15, income: 0.10 },
    description: 'Paved Roman roads. -15% trade risk, +10% income.',
  },
  local_temple: {
    id: 'local_temple',
    name: 'Local Temple',
    latinName: 'Templum Locale',
    icon: '⛪',
    cost: 200,
    effects: { piety: 10, happiness: 15, stability: 10 },
    description: 'A sacred place of worship. +10 piety, +15% happiness, +10 stability.',
  },
  forum: {
    id: 'forum',
    name: 'Forum',
    latinName: 'Forum',
    icon: '🏛️',
    cost: 450,
    effects: { income: 0.15, stability: 10, marketBonus: true },
    description: 'Center of commerce and politics. +15% income, +10 stability, market bonus.',
  },
  watchtower: {
    id: 'watchtower',
    name: 'Watchtower',
    latinName: 'Specula',
    icon: '🗼',
    cost: 250,
    effects: { defense: 20, stability: 5 },
    description: 'Scouts and early warning. +20 defense, +5 stability.',
  },
  granary: {
    id: 'granary',
    name: 'Granary',
    latinName: 'Horreum',
    icon: '🌾',
    cost: 350,
    effects: { foodStorage: 100 },
    description: 'Food storage facility. +100 food storage capacity.',
  },
  census_office: {
    id: 'census_office',
    name: 'Census Office',
    latinName: 'Tabularium',
    icon: '📜',
    cost: 180,
    effects: { taxBonus: 0.10, stability: -5 },
    description: 'Tax collection improvement. +10% tax efficiency, -5 stability.',
  },
};

// === TERRITORY EVENTS ===

export interface TerritoryEvent {
  id: string;
  name: string;
  icon: string;
  description: string;
  condition: 'stability_low' | 'stability_high' | 'garrison_low' | 'random';
  conditionValue?: number; // For stability/garrison thresholds
  probability: number; // 0-1, base chance when condition is met
  effects: {
    garrison?: number; // Can be multiplier (0.7 = -30%) or absolute
    stability?: number;
    happiness?: number;
    population?: number;
    denarii?: number;
    piety?: number;
    income?: number; // Multiplier for one season
  };
  isMultiplier?: {
    garrison?: boolean;
    population?: boolean;
    income?: boolean;
  };
}

export const TERRITORY_EVENTS: TerritoryEvent[] = [
  {
    id: 'uprising',
    name: 'Uprising',
    icon: '⚔️',
    description: 'Unrest erupts! Garrison reduced, stability drops.',
    condition: 'stability_low',
    conditionValue: 30,
    probability: 0.25,
    effects: { garrison: 0.7, stability: -10 },
    isMultiplier: { garrison: true },
  },
  {
    id: 'prosperity',
    name: 'Prosperity',
    icon: '💰',
    description: 'Trade flourishes! Income increases.',
    condition: 'stability_high',
    conditionValue: 70,
    probability: 0.20,
    effects: { income: 1.15 },
    isMultiplier: { income: true },
  },
  {
    id: 'slave_revolt',
    name: 'Slave Revolt',
    icon: '⛓️',
    description: 'Enslaved workers rise up! Population falls, happiness plummets.',
    condition: 'random',
    probability: 0.05,
    effects: { population: 0.9, happiness: -12, stability: -15 },
    isMultiplier: { population: true },
  },
  {
    id: 'bandit_attack',
    name: 'Bandit Attack',
    icon: '🗡️',
    description: 'Bandits attack! Gold stolen, stability drops.',
    condition: 'garrison_low',
    conditionValue: 20,
    probability: 0.20,
    effects: { denarii: -150, stability: -8 },
  },
  {
    id: 'cultural_flourishing',
    name: 'Cultural Flourishing',
    icon: '🎭',
    description: 'Arts flourish! Reputation and piety grow.',
    condition: 'random',
    probability: 0.08,
    effects: { piety: 10, happiness: 8 },
  },
  {
    id: 'plague',
    name: 'Local Plague',
    icon: '☠️',
    description: 'Disease spreads through the territory.',
    condition: 'random',
    probability: 0.04,
    effects: { population: 0.85, happiness: -15, stability: -10 },
    isMultiplier: { population: true },
  },
  {
    id: 'bountiful_harvest',
    name: 'Bountiful Harvest',
    icon: '🌾',
    description: 'The gods bless this land with abundance!',
    condition: 'stability_high',
    conditionValue: 60,
    probability: 0.15,
    effects: { happiness: 10, stability: 5 },
  },
];

// === GARRISON SYSTEM ===

export const GARRISON_CONFIG = {
  baseMaxGarrison: 50, // Base max troops per territory
  garrisonBuildingBonus: 50, // Extra capacity per garrison building
  stabilityPerTroops: 10, // +1 stability per this many troops
  undergarrisonedPenalty: 2, // Stability loss per season if under expected garrison
  expectedGarrisonRatio: 0.5, // Expected garrison = max * this ratio
};

// === HELPER FUNCTIONS ===

/**
 * Get the next territory level info
 */
export function getNextLevel(currentLevel: 1 | 2 | 3 | 4 | 5): TerritoryLevel | null {
  if (currentLevel >= 5) return null;
  return TERRITORY_LEVELS[currentLevel + 1];
}

/**
 * Calculate max garrison for a territory based on buildings
 */
export function calculateMaxGarrison(buildings: string[]): number {
  let max = GARRISON_CONFIG.baseMaxGarrison;
  const garrisonCount = buildings.filter(b => b === 'garrison').length;
  max += garrisonCount * GARRISON_CONFIG.garrisonBuildingBonus;
  return max;
}

/**
 * Calculate territory defense based on garrison and buildings
 */
export function calculateTerritoryDefense(
  garrison: number,
  buildings: string[],
  stability: number
): number {
  let defense = garrison;

  // Add building defense bonuses
  for (const buildingId of buildings) {
    const building = TERRITORY_BUILDINGS[buildingId];
    if (building?.effects.defense) {
      defense += building.effects.defense;
    }
  }

  // Stability modifier
  const stabilityMod = stability / 100;
  defense = Math.floor(defense * (0.5 + stabilityMod * 0.5));

  return defense;
}

/**
 * Check if a territory event should trigger
 */
export function checkTerritoryEvent(
  stability: number,
  garrison: number
): TerritoryEvent | null {
  for (const event of TERRITORY_EVENTS) {
    let conditionMet = false;

    switch (event.condition) {
      case 'stability_low':
        conditionMet = stability < (event.conditionValue || 30);
        break;
      case 'stability_high':
        conditionMet = stability > (event.conditionValue || 70);
        break;
      case 'garrison_low':
        conditionMet = garrison < (event.conditionValue || 20);
        break;
      case 'random':
        conditionMet = true;
        break;
    }

    if (conditionMet && Math.random() < event.probability) {
      return event;
    }
  }
  return null;
}

/**
 * Calculate total building effects for a territory
 */
export function calculateBuildingEffects(buildings: string[]): TerritoryBuildingEffect {
  const totals: TerritoryBuildingEffect = {};

  for (const buildingId of buildings) {
    const building = TERRITORY_BUILDINGS[buildingId];
    if (!building) continue;

    for (const [key, value] of Object.entries(building.effects)) {
      if (typeof value === 'number') {
        (totals as Record<string, number>)[key] = ((totals as Record<string, number>)[key] || 0) + value;
      } else if (typeof value === 'boolean' && value) {
        (totals as Record<string, boolean>)[key] = true;
      }
    }
  }

  return totals;
}
