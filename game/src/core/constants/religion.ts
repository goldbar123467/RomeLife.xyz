// ============================================
// RELIGION SYSTEM CONSTANTS
// ============================================

import type { GodName } from '../types';

// === RELIGIOUS BUILDINGS ===

export interface ReligiousBuilding {
  id: string;
  name: string;
  latinName: string;
  icon: string;
  cost: number;
  pietyPerSeason: number;
  favorPerSeason: number;
  description: string;
  built: boolean;
}

export const RELIGIOUS_BUILDINGS: Record<string, Omit<ReligiousBuilding, 'built'>> = {
  shrine: {
    id: 'shrine',
    name: 'Shrine',
    latinName: 'Sacellum',
    icon: 'flame',
    cost: 200,
    pietyPerSeason: 3,
    favorPerSeason: 2,
    description: 'A modest shrine for daily worship. Generates piety and god favor each season.',
  },
  temple: {
    id: 'temple',
    name: 'Temple',
    latinName: 'Templum',
    icon: 'landmark',
    cost: 600,
    pietyPerSeason: 8,
    favorPerSeason: 5,
    description: 'A magnificent temple that attracts pilgrims. Significant piety and favor.',
  },
  oracle: {
    id: 'oracle',
    name: 'Oracle',
    latinName: 'Oraculum',
    icon: 'sparkles',
    cost: 450,
    pietyPerSeason: 5,
    favorPerSeason: 8,
    description: 'Divine prophecy center. Exceptional favor gain from gods.',
  },
  altar: {
    id: 'altar',
    name: 'Altar',
    latinName: 'Ara',
    icon: 'church',
    cost: 350,
    pietyPerSeason: 6,
    favorPerSeason: 4,
    description: 'A blessed altar for offerings. Good balance of piety and favor.',
  },
  augury_house: {
    id: 'augury_house',
    name: 'Augury House',
    latinName: 'Auguraculum',
    icon: 'bird',
    cost: 500,
    pietyPerSeason: 7,
    favorPerSeason: 6,
    description: 'Where augurs read divine signs. Strong piety and favor generation.',
  },
};

// === WORSHIP ACTIONS ===

export interface WorshipActionCost {
  denarii?: number;
  piety?: number;
  livestock?: number;
  grain?: number;
}

export interface WorshipActionEffect {
  godFavor?: number;
  piety?: number;
  happiness?: number;
  reputation?: number;
  morale?: number;
  population?: number;
  revealEvents?: boolean;
  consecrate?: boolean;
  invokeBlessing?: boolean;
}

export interface WorshipAction {
  id: string;
  name: string;
  icon: string;
  cost: WorshipActionCost;
  cooldown: number; // rounds
  effect: WorshipActionEffect;
  description: string;
  requiresPatron: boolean;
}

export const WORSHIP_ACTIONS: Record<string, WorshipAction> = {
  prayer: {
    id: 'prayer',
    name: 'Offer Prayers',
    icon: 'hand-heart',
    cost: {},
    cooldown: 0,
    effect: { godFavor: 5, happiness: 3 },
    description: 'Pray to gain +5 favor with chosen god, +3% happiness',
    requiresPatron: true,
  },
  sacrifice: {
    id: 'sacrifice',
    name: 'Animal Sacrifice',
    icon: 'heart',
    cost: { livestock: 5 },
    cooldown: 0,
    effect: { godFavor: 15, piety: 5 },
    description: 'Offer livestock to gain +15 god favor, +5 piety',
    requiresPatron: true,
  },
  festival: {
    id: 'festival',
    name: 'Grand Festival',
    icon: 'party-popper',
    cost: { denarii: 500, grain: 20 },
    cooldown: 3,
    effect: { godFavor: 25, happiness: 15, piety: 10, population: 10 },
    description: 'Host a grand festival: +25 god favor, +15% happiness, +10 piety, +10 population',
    requiresPatron: true,
  },
  divination: {
    id: 'divination',
    name: 'Divine Augury',
    icon: 'sparkles',
    cost: { denarii: 150, piety: 20 },
    cooldown: 2,
    effect: { revealEvents: true, godFavor: 5 },
    description: 'Read omens to reveal future events. +5 favor',
    requiresPatron: false,
  },
  pilgrimage: {
    id: 'pilgrimage',
    name: 'Sacred Pilgrimage',
    icon: 'footprints',
    cost: { denarii: 300 },
    cooldown: 4,
    effect: { godFavor: 30, piety: 15, reputation: 8 },
    description: 'Send pilgrims to sacred sites: +30 god favor, +15 piety, +8 reputation',
    requiresPatron: true,
  },
  consecration: {
    id: 'consecration',
    name: 'Consecrate Territory',
    icon: 'star',
    cost: { denarii: 400, piety: 30 },
    cooldown: 5,
    effect: { consecrate: true, godFavor: 20 },
    description: 'Bless a territory for permanent +25% production bonus. +20 god favor',
    requiresPatron: true,
  },
  invoke: {
    id: 'invoke',
    name: 'Invoke Divine Blessing',
    icon: 'sun',
    cost: { piety: 50 },
    cooldown: 8,
    effect: { invokeBlessing: true },
    description: 'Call upon a god for immediate powerful effect (varies by god)',
    requiresPatron: true,
  },
};

// === RELIGIOUS EVENTS ===

export interface ReligiousEvent {
  id: string;
  name: string;
  icon: string;
  description: string;
  probability: number; // 0-1, checked each season
  effects: {
    piety?: number;
    happiness?: number;
    morale?: number;
    godFavor?: number;
    reputation?: number;
    grain?: number;
    techCostReduction?: number;
    revealEvents?: boolean;
  };
}

export const RELIGIOUS_EVENTS: ReligiousEvent[] = [
  {
    id: 'divine_omen',
    name: 'Divine Omen',
    icon: 'bird',
    description: 'Eagles circle the temple! The gods smile upon Rome.',
    probability: 0.08,
    effects: { piety: 10, happiness: 5, godFavor: 5 },
  },
  {
    id: 'solar_eclipse',
    name: 'Solar Eclipse',
    icon: 'moon',
    description: 'Darkness covers the sun! A sign of great change.',
    probability: 0.03,
    effects: { piety: 15, morale: -10, revealEvents: true },
  },
  {
    id: 'comet_sighting',
    name: 'Comet Sighting',
    icon: 'rocket',
    description: 'A brilliant comet crosses the sky! The gods send a message.',
    probability: 0.05,
    effects: { godFavor: 20, reputation: 10 },
  },
  {
    id: 'miracle',
    name: 'Miracle',
    icon: 'star',
    description: 'A MIRACLE! Food multiplies, wounds heal!',
    probability: 0.02,
    effects: { piety: 25, grain: 200, happiness: 20 },
  },
  {
    id: 'divine_wrath',
    name: 'Divine Wrath',
    icon: 'zap',
    description: 'The gods are displeased! Crops wither.',
    probability: 0.04,
    effects: { piety: -20, grain: -50, morale: -15 },
  },
  {
    id: 'prophetic_dream',
    name: 'Prophetic Dream',
    icon: 'message-circle',
    description: 'A priest receives divine wisdom!',
    probability: 0.06,
    effects: { piety: 12, godFavor: 8, techCostReduction: 0.2 },
  },
];

// === BLESSING EFFECTS ===
// Maps god + tier to actual game effect

export interface BlessingEffect {
  god: GodName;
  tier: 25 | 50 | 75 | 100;
  effectType: string;
  value: number;
  description: string;
}

export const BLESSING_EFFECTS: BlessingEffect[] = [
  // Jupiter - War & Victory
  { god: 'jupiter', tier: 25, effectType: 'battleStrength', value: 0.10, description: '+10% battle strength' },
  { god: 'jupiter', tier: 50, effectType: 'victoryDenarii', value: 100, description: '+100 denarii on victories' },
  { god: 'jupiter', tier: 75, effectType: 'morale', value: 15, description: '+15% morale' },
  { god: 'jupiter', tier: 100, effectType: 'allBlessings', value: 1, description: 'All god blessings active' },

  // Mars - Military
  { god: 'mars', tier: 25, effectType: 'recruitCost', value: -0.15, description: '-15% recruit costs' },
  { god: 'mars', tier: 50, effectType: 'attack', value: 0.10, description: '+10% attack' },
  { god: 'mars', tier: 75, effectType: 'supplies', value: 50, description: '+50 supplies' },
  { god: 'mars', tier: 100, effectType: 'casualties', value: -0.30, description: '-30% casualties' },

  // Venus - Happiness & Growth
  { god: 'venus', tier: 25, effectType: 'happiness', value: 10, description: '+10% happiness' },
  { god: 'venus', tier: 50, effectType: 'popGrowth', value: 0.15, description: '+15% population growth' },
  { god: 'venus', tier: 75, effectType: 'tradePrices', value: 0.10, description: '+10% trade prices' },
  { god: 'venus', tier: 100, effectType: 'allFavor', value: 50, description: '+50 favor with all gods' },

  // Ceres - Agriculture
  { god: 'ceres', tier: 25, effectType: 'grainProduction', value: 0.20, description: '+20% grain production' },
  { god: 'ceres', tier: 50, effectType: 'foodProduction', value: 0.30, description: '+30% all food production' },
  { god: 'ceres', tier: 75, effectType: 'foodConsumption', value: -0.25, description: '-25% food consumption' },
  { god: 'ceres', tier: 100, effectType: 'famineImmune', value: 1, description: 'Immune to famine events' },

  // Mercury - Commerce
  { god: 'mercury', tier: 25, effectType: 'tradePrices', value: 0.10, description: '+10% trade prices' },
  { god: 'mercury', tier: 50, effectType: 'tariffs', value: -0.20, description: '-20% tariffs' },
  { god: 'mercury', tier: 75, effectType: 'caravanProfit', value: 0.25, description: '+25% caravan profits' },
  { god: 'mercury', tier: 100, effectType: 'tradeRisk', value: -0.50, description: '-50% trade risk' },

  // Minerva - Wisdom
  { god: 'minerva', tier: 25, effectType: 'techCost', value: -0.15, description: '-15% tech costs' },
  { god: 'minerva', tier: 50, effectType: 'freeTech', value: 5, description: '+1 free tech every 5 rounds' },
  { god: 'minerva', tier: 75, effectType: 'buildingEfficiency', value: 0.25, description: '+25% building efficiency' },
  { god: 'minerva', tier: 100, effectType: 'favor', value: 20, description: '+20 favor' },
];

// === HELPER FUNCTIONS ===

/**
 * Get all active blessing effects for a god based on current favor
 */
export function getActiveBlessings(god: GodName, favor: number): BlessingEffect[] {
  return BLESSING_EFFECTS.filter(
    b => b.god === god && favor >= b.tier
  );
}

/**
 * Get the next blessing tier for a god
 */
export function getNextBlessingTier(god: GodName, favor: number): BlessingEffect | null {
  const tiers: (25 | 50 | 75 | 100)[] = [25, 50, 75, 100];
  for (const tier of tiers) {
    if (favor < tier) {
      return BLESSING_EFFECTS.find(b => b.god === god && b.tier === tier) || null;
    }
  }
  return null;
}

/**
 * Calculate total bonus for an effect type from all active blessings
 */
export function calculateBlessingBonus(
  patronGod: GodName | null,
  godFavor: Record<GodName, number>,
  effectType: string
): number {
  if (!patronGod) return 0;

  const favor = godFavor[patronGod] || 0;
  const activeBlessings = getActiveBlessings(patronGod, favor);

  // Check for Jupiter's 100% bonus (all blessings)
  const hasAllBlessings = activeBlessings.some(b => b.effectType === 'allBlessings');

  if (hasAllBlessings) {
    // Get all blessings from all gods for this effect type
    return BLESSING_EFFECTS
      .filter(b => b.effectType === effectType)
      .reduce((sum, b) => sum + b.value, 0);
  }

  // Normal case: just sum from patron god's active blessings
  return activeBlessings
    .filter(b => b.effectType === effectType)
    .reduce((sum, b) => sum + b.value, 0);
}

/**
 * Roll for a religious event
 */
export function rollReligiousEvent(): ReligiousEvent | null {
  for (const event of RELIGIOUS_EVENTS) {
    if (Math.random() < event.probability) {
      return event;
    }
  }
  return null;
}
