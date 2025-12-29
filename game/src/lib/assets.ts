// ============================================
// ROME EMPIRE BUILDER - Asset Registry
// Centralized asset path management with type safety
// ============================================

import type { LucideIcon } from 'lucide-react';
import {
    Wine, Coins, Users,
    Castle, Building2, Shield, Flag, ScrollText,
    Church, Hammer, Star, Heart, Package,
    Landmark, Crown, Swords
} from 'lucide-react';

// === ASSET CATEGORIES ===
export type AssetCategory = 'architecture' | 'flags' | 'military' | 'misc' | 'people';

// === ASSET KEYS ===
// Type-safe asset key for all available assets
export type AssetKey =
    // Architecture
    | 'colosseum' | 'colosseum-new' | 'column' | 'column2' | 'insula'
    | 'obelisk' | 'obelisk2' | 'temple' | 'villa'
    // Flags
    | 'banner' | 'banner-chiro' | 'flag' | 'flag-chiro' | 'flag-spqr'
    // Military
    | 'armor' | 'centurion-helmet' | 'centurion-helmet2'
    | 'centurion-helmet-bronze' | 'centurion-helmet-bronze2' | 'shield'
    // Misc
    | 'amphora' | 'amphora2' | 'amphora-broken' | 'amphora-broken2'
    | 'bust' | 'bust2' | 'bust-old' | 'bust2-old'
    | 'coin-bronze' | 'coin-gold' | 'coin-silver'
    | 'gear' | 'grapes' | 'laurels' | 'laurels-bronze' | 'laurels-gold' | 'laurels-silver'
    | 'scroll' | 'scroll2' | 'thumbs-down' | 'thumbs-up' | 'column-misc' | 'roman-misc'
    // People
    | 'emperor' | 'legionnaire' | 'roman' | 'roman-old' | 'roman-woman'
    | 'senate' | 'slave';

// === ASSET REGISTRY ===
// Maps asset keys to their paths and metadata
export interface AssetInfo {
    path: string;
    category: AssetCategory;
    fallbackIcon: LucideIcon;
    fallbackEmoji: string;
}

export const ASSET_REGISTRY: Record<AssetKey, AssetInfo> = {
    // Architecture
    'colosseum': { path: '/assets/architecture/colosseum.png', category: 'architecture', fallbackIcon: Castle, fallbackEmoji: '🏟️' },
    'colosseum-new': { path: '/assets/architecture/colosseum-new.png', category: 'architecture', fallbackIcon: Castle, fallbackEmoji: '🏟️' },
    'column': { path: '/assets/architecture/column.png', category: 'architecture', fallbackIcon: Building2, fallbackEmoji: '🏛️' },
    'column2': { path: '/assets/architecture/column2.png', category: 'architecture', fallbackIcon: Building2, fallbackEmoji: '🏛️' },
    'insula': { path: '/assets/architecture/insula.png', category: 'architecture', fallbackIcon: Building2, fallbackEmoji: '🏠' },
    'obelisk': { path: '/assets/architecture/obelisk.png', category: 'architecture', fallbackIcon: Building2, fallbackEmoji: '🗼' },
    'obelisk2': { path: '/assets/architecture/obelisk2.png', category: 'architecture', fallbackIcon: Building2, fallbackEmoji: '🗼' },
    'temple': { path: '/assets/architecture/temple.png', category: 'architecture', fallbackIcon: Church, fallbackEmoji: '🏛️' },
    'villa': { path: '/assets/architecture/villa.png', category: 'architecture', fallbackIcon: Building2, fallbackEmoji: '🏠' },

    // Flags
    'banner': { path: '/assets/flags/banner.png', category: 'flags', fallbackIcon: Flag, fallbackEmoji: '🏳️' },
    'banner-chiro': { path: '/assets/flags/banner-chiro.png', category: 'flags', fallbackIcon: Flag, fallbackEmoji: '🏳️' },
    'flag': { path: '/assets/flags/flag.png', category: 'flags', fallbackIcon: Flag, fallbackEmoji: '🚩' },
    'flag-chiro': { path: '/assets/flags/flag-chiro.png', category: 'flags', fallbackIcon: Flag, fallbackEmoji: '🚩' },
    'flag-spqr': { path: '/assets/flags/flag-spqr.png', category: 'flags', fallbackIcon: Flag, fallbackEmoji: '🏴' },

    // Military
    'armor': { path: '/assets/military/armor.png', category: 'military', fallbackIcon: Shield, fallbackEmoji: '🛡️' },
    'centurion-helmet': { path: '/assets/military/centurion-helmet.png', category: 'military', fallbackIcon: Swords, fallbackEmoji: '⚔️' },
    'centurion-helmet2': { path: '/assets/military/centurion-helmet2.png', category: 'military', fallbackIcon: Swords, fallbackEmoji: '⚔️' },
    'centurion-helmet-bronze': { path: '/assets/military/centurion-helmet-bronze.png', category: 'military', fallbackIcon: Swords, fallbackEmoji: '⚔️' },
    'centurion-helmet-bronze2': { path: '/assets/military/centurion-helmet-bronze2.png', category: 'military', fallbackIcon: Swords, fallbackEmoji: '⚔️' },
    'shield': { path: '/assets/military/shield.png', category: 'military', fallbackIcon: Shield, fallbackEmoji: '🛡️' },

    // Misc
    'amphora': { path: '/assets/misc/amphora.png', category: 'misc', fallbackIcon: Package, fallbackEmoji: '🏺' },
    'amphora2': { path: '/assets/misc/amphora2.png', category: 'misc', fallbackIcon: Package, fallbackEmoji: '🏺' },
    'amphora-broken': { path: '/assets/misc/amphora-broken.png', category: 'misc', fallbackIcon: Package, fallbackEmoji: '🏺' },
    'amphora-broken2': { path: '/assets/misc/amphora-broken2.png', category: 'misc', fallbackIcon: Package, fallbackEmoji: '🏺' },
    'bust': { path: '/assets/misc/bust.png', category: 'misc', fallbackIcon: Users, fallbackEmoji: '🗿' },
    'bust2': { path: '/assets/misc/bust2.png', category: 'misc', fallbackIcon: Users, fallbackEmoji: '🗿' },
    'bust-old': { path: '/assets/misc/bust-old.png', category: 'misc', fallbackIcon: Users, fallbackEmoji: '🗿' },
    'bust2-old': { path: '/assets/misc/bust2-old.png', category: 'misc', fallbackIcon: Users, fallbackEmoji: '🗿' },
    'coin-bronze': { path: '/assets/misc/coin-bronze.png', category: 'misc', fallbackIcon: Coins, fallbackEmoji: '🪙' },
    'coin-gold': { path: '/assets/misc/coin-gold.png', category: 'misc', fallbackIcon: Coins, fallbackEmoji: '🪙' },
    'coin-silver': { path: '/assets/misc/coin-silver.png', category: 'misc', fallbackIcon: Coins, fallbackEmoji: '🪙' },
    'column-misc': { path: '/assets/misc/column.png', category: 'misc', fallbackIcon: Building2, fallbackEmoji: '🏛️' },
    'gear': { path: '/assets/misc/gear.png', category: 'misc', fallbackIcon: Hammer, fallbackEmoji: '⚙️' },
    'grapes': { path: '/assets/misc/grapes.png', category: 'misc', fallbackIcon: Wine, fallbackEmoji: '🍇' },
    'laurels': { path: '/assets/misc/laurels.png', category: 'misc', fallbackIcon: Star, fallbackEmoji: '🏆' },
    'laurels-bronze': { path: '/assets/misc/laurels-bronze.png', category: 'misc', fallbackIcon: Star, fallbackEmoji: '🏆' },
    'laurels-gold': { path: '/assets/misc/laurels-gold.png', category: 'misc', fallbackIcon: Star, fallbackEmoji: '🏆' },
    'laurels-silver': { path: '/assets/misc/laurels-silver.png', category: 'misc', fallbackIcon: Star, fallbackEmoji: '🏆' },
    'roman-misc': { path: '/assets/misc/roman.png', category: 'misc', fallbackIcon: Users, fallbackEmoji: '👤' },
    'scroll': { path: '/assets/misc/scroll.png', category: 'misc', fallbackIcon: ScrollText, fallbackEmoji: '📜' },
    'scroll2': { path: '/assets/misc/scroll2.png', category: 'misc', fallbackIcon: ScrollText, fallbackEmoji: '📜' },
    'thumbs-down': { path: '/assets/misc/thumbs-down.png', category: 'misc', fallbackIcon: Heart, fallbackEmoji: '👎' },
    'thumbs-up': { path: '/assets/misc/thumbs-up.png', category: 'misc', fallbackIcon: Heart, fallbackEmoji: '👍' },

    // People
    'emperor': { path: '/assets/people/emperor.png', category: 'people', fallbackIcon: Crown, fallbackEmoji: '👑' },
    'legionnaire': { path: '/assets/people/legionnaire.png', category: 'people', fallbackIcon: Swords, fallbackEmoji: '⚔️' },
    'roman': { path: '/assets/people/roman.png', category: 'people', fallbackIcon: Users, fallbackEmoji: '👤' },
    'roman-old': { path: '/assets/people/roman-old.png', category: 'people', fallbackIcon: Users, fallbackEmoji: '👴' },
    'roman-woman': { path: '/assets/people/roman-woman.png', category: 'people', fallbackIcon: Users, fallbackEmoji: '👩' },
    'senate': { path: '/assets/people/senate.png', category: 'people', fallbackIcon: Landmark, fallbackEmoji: '🏛️' },
    'slave': { path: '/assets/people/slave.png', category: 'people', fallbackIcon: Users, fallbackEmoji: '⛓️' },
};

// === HELPER FUNCTIONS ===

/**
 * Get asset path by key
 */
export function getAssetPath(key: AssetKey): string {
    return ASSET_REGISTRY[key].path;
}

/**
 * Get asset info by key
 */
export function getAssetInfo(key: AssetKey): AssetInfo {
    return ASSET_REGISTRY[key];
}

/**
 * Check if a string is a valid asset key
 */
export function isAssetKey(key: string): key is AssetKey {
    return key in ASSET_REGISTRY;
}

/**
 * Get all assets in a category
 */
export function getAssetsByCategory(category: AssetCategory): AssetKey[] {
    return (Object.keys(ASSET_REGISTRY) as AssetKey[])
        .filter(key => ASSET_REGISTRY[key].category === category);
}

// === GAME-SPECIFIC ASSET MAPPINGS ===
// Maps game concepts to specific asset keys

export const TERRITORY_BUILDING_ASSETS: Record<string, AssetKey> = {
    garrison: 'centurion-helmet',
    walls: 'shield',
    arena: 'colosseum',
    roads: 'column',
    local_temple: 'temple',
    forum: 'column2',
    watchtower: 'obelisk',
    granary: 'amphora',
    census_office: 'scroll',
};

export const RELIGIOUS_BUILDING_ASSETS: Record<string, AssetKey> = {
    shrine: 'temple',
    temple: 'temple',
    oracle: 'bust',
    altar: 'column',
    augury_house: 'flag-spqr',
};

export const WORSHIP_ACTION_ASSETS: Record<string, AssetKey> = {
    prayer: 'bust',
    sacrifice: 'amphora',
    festival: 'laurels-gold',
    divination: 'bust-old',
    pilgrimage: 'roman',
    consecration: 'temple',
    invoke: 'laurels',
};

export const RANDOM_EVENT_ASSETS: Record<string, AssetKey> = {
    // Positive events
    bountiful_harvest: 'grapes',
    trade_windfall: 'coin-gold',
    divine_blessing: 'laurels-gold',
    population_boom: 'roman',
    good_omens: 'flag-spqr',
    merchant_caravan: 'amphora2',
    // Negative events
    plague_outbreak: 'amphora-broken',
    bandit_raid: 'centurion-helmet-bronze',
    crop_failure: 'amphora-broken2',
    fire_outbreak: 'amphora-broken',
    tax_revolt: 'roman-old',
    desertion: 'legionnaire',
    // Neutral events
    senate_debate: 'senate',
    foreign_emissary: 'scroll2',
    religious_schism: 'temple',
    market_fluctuation: 'coin-silver',
};

export const TERRITORY_EVENT_ASSETS: Record<string, AssetKey> = {
    uprising: 'centurion-helmet',
    prosperity: 'coin-gold',
    slave_revolt: 'slave',
    bandit_attack: 'centurion-helmet-bronze',
    cultural_flourishing: 'laurels',
    plague: 'amphora-broken',
    bountiful_harvest: 'grapes',
};

export const RELIGIOUS_EVENT_ASSETS: Record<string, AssetKey> = {
    divine_omen: 'flag-spqr',
    solar_eclipse: 'bust-old',
    comet_sighting: 'laurels-gold',
    miracle: 'laurels-gold',
    divine_wrath: 'centurion-helmet',
    prophetic_dream: 'bust',
};

export const RESOURCE_ASSETS: Record<string, AssetKey> = {
    denarii: 'coin-gold',
    grain: 'amphora',
    wine: 'grapes',
    clay: 'amphora2',
    livestock: 'amphora',
};

export const EMERGENCY_ACTION_ASSETS: Record<string, AssetKey> = {
    emergency_tax: 'coin-gold',
    conscription: 'centurion-helmet',
    divine_intervention: 'laurels-gold',
    grain_requisition: 'amphora',
    mercenary_hire: 'centurion-helmet-bronze',
};

export const CRAFTING_RECIPE_ASSETS: Record<string, AssetKey> = {
    forge_weapons: 'centurion-helmet',
    host_feast: 'grapes',
    build_monument: 'bust',
    supply_cache: 'amphora2',
};

export const TERRITORY_FOCUS_ASSETS: Record<string, AssetKey> = {
    military_outpost: 'centurion-helmet',
    trade_hub: 'coin-gold',
    breadbasket: 'amphora',
    mining_district: 'gear',
};

export const GOVERNOR_ASSETS: Record<string, AssetKey> = {
    merchant: 'roman',
    general: 'legionnaire',
    scholar: 'scroll',
    administrator: 'roman-old',
    priest: 'bust',
};

export const FOUNDER_ASSETS: Record<string, AssetKey> = {
    romulus: 'centurion-helmet',
    remus: 'roman',
};

export const GOD_ASSETS: Record<string, AssetKey> = {
    jupiter: 'laurels-gold',
    mars: 'centurion-helmet',
    venus: 'roman-woman',
    ceres: 'grapes',
    mercury: 'coin-gold',
    minerva: 'scroll',
};

// === TAB ASSETS ===
export const TAB_ASSETS: Record<string, AssetKey> = {
    gods: 'laurels-gold',
    buildings: 'temple',
    worship: 'bust',
};
