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
export type AssetCategory = 'architecture' | 'flags' | 'military' | 'misc' | 'people' | 'kenney';

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
    | 'senate' | 'slave'
    // Kenney Board Game Icons
    | 'k-wheat' | 'k-iron' | 'k-wood' | 'k-lumber' | 'k-planks' | 'k-apple'
    | 'k-sword' | 'k-shield' | 'k-bow' | 'k-skull'
    | 'k-crown-a' | 'k-crown-b'
    | 'k-fire' | 'k-campfire' | 'k-hourglass'
    | 'k-book-closed' | 'k-book-open'
    | 'k-flag-square' | 'k-flag-triangle'
    | 'k-award' | 'k-flask-full' | 'k-flask-half' | 'k-flask-empty'
    | 'k-pouch' | 'k-pouch-add'
    | 'k-church' | 'k-farm' | 'k-gate' | 'k-house' | 'k-tower' | 'k-wall' | 'k-watchtower'
    | 'k-character' | 'k-notepad' | 'k-notepad-write'
    | 'k-heart' | 'k-heart-broken' | 'k-spades'
    | 'k-pawn' | 'k-pawns' | 'k-dollar'
    | 'k-lock' | 'k-unlock'
    | 'k-dice-sword' | 'k-dice-shield' | 'k-dice-skull'
    | 'k-hand' | 'k-tokens' | 'k-exploding';

// === ASSET REGISTRY ===
// Maps asset keys to their paths and metadata
export interface AssetInfo {
    path: string;
    category: AssetCategory;
    fallbackIcon: LucideIcon;
}

export const ASSET_REGISTRY: Record<AssetKey, AssetInfo> = {
    // Architecture
    'colosseum': { path: '/assets/architecture/colosseum.png', category: 'architecture', fallbackIcon: Castle },
    'colosseum-new': { path: '/assets/architecture/colosseum-new.png', category: 'architecture', fallbackIcon: Castle },
    'column': { path: '/assets/architecture/column.png', category: 'architecture', fallbackIcon: Building2 },
    'column2': { path: '/assets/architecture/column2.png', category: 'architecture', fallbackIcon: Building2 },
    'insula': { path: '/assets/architecture/insula.png', category: 'architecture', fallbackIcon: Building2 },
    'obelisk': { path: '/assets/architecture/obelisk.png', category: 'architecture', fallbackIcon: Building2 },
    'obelisk2': { path: '/assets/architecture/obelisk2.png', category: 'architecture', fallbackIcon: Building2 },
    'temple': { path: '/assets/architecture/temple.png', category: 'architecture', fallbackIcon: Church },
    'villa': { path: '/assets/architecture/villa.png', category: 'architecture', fallbackIcon: Building2 },

    // Flags
    'banner': { path: '/assets/flags/banner.png', category: 'flags', fallbackIcon: Flag },
    'banner-chiro': { path: '/assets/flags/banner-chiro.png', category: 'flags', fallbackIcon: Flag },
    'flag': { path: '/assets/flags/flag.png', category: 'flags', fallbackIcon: Flag },
    'flag-chiro': { path: '/assets/flags/flag-chiro.png', category: 'flags', fallbackIcon: Flag },
    'flag-spqr': { path: '/assets/flags/flag-spqr.png', category: 'flags', fallbackIcon: Flag },

    // Military
    'armor': { path: '/assets/military/armor.png', category: 'military', fallbackIcon: Shield },
    'centurion-helmet': { path: '/assets/military/centurion-helmet.png', category: 'military', fallbackIcon: Swords },
    'centurion-helmet2': { path: '/assets/military/centurion-helmet2.png', category: 'military', fallbackIcon: Swords },
    'centurion-helmet-bronze': { path: '/assets/military/centurion-helmet-bronze.png', category: 'military', fallbackIcon: Swords },
    'centurion-helmet-bronze2': { path: '/assets/military/centurion-helmet-bronze2.png', category: 'military', fallbackIcon: Swords },
    'shield': { path: '/assets/military/shield.png', category: 'military', fallbackIcon: Shield },

    // Misc
    'amphora': { path: '/assets/misc/amphora.png', category: 'misc', fallbackIcon: Package },
    'amphora2': { path: '/assets/misc/amphora2.png', category: 'misc', fallbackIcon: Package },
    'amphora-broken': { path: '/assets/misc/amphora-broken.png', category: 'misc', fallbackIcon: Package },
    'amphora-broken2': { path: '/assets/misc/amphora-broken2.png', category: 'misc', fallbackIcon: Package },
    'bust': { path: '/assets/misc/bust.png', category: 'misc', fallbackIcon: Users },
    'bust2': { path: '/assets/misc/bust2.png', category: 'misc', fallbackIcon: Users },
    'bust-old': { path: '/assets/misc/bust-old.png', category: 'misc', fallbackIcon: Users },
    'bust2-old': { path: '/assets/misc/bust2-old.png', category: 'misc', fallbackIcon: Users },
    'coin-bronze': { path: '/assets/misc/coin-bronze.png', category: 'misc', fallbackIcon: Coins },
    'coin-gold': { path: '/assets/misc/coin-gold.png', category: 'misc', fallbackIcon: Coins },
    'coin-silver': { path: '/assets/misc/coin-silver.png', category: 'misc', fallbackIcon: Coins },
    'column-misc': { path: '/assets/misc/column.png', category: 'misc', fallbackIcon: Building2 },
    'gear': { path: '/assets/misc/gear.png', category: 'misc', fallbackIcon: Hammer },
    'grapes': { path: '/assets/misc/grapes.png', category: 'misc', fallbackIcon: Wine },
    'laurels': { path: '/assets/misc/laurels.png', category: 'misc', fallbackIcon: Star },
    'laurels-bronze': { path: '/assets/misc/laurels-bronze.png', category: 'misc', fallbackIcon: Star },
    'laurels-gold': { path: '/assets/misc/laurels-gold.png', category: 'misc', fallbackIcon: Star },
    'laurels-silver': { path: '/assets/misc/laurels-silver.png', category: 'misc', fallbackIcon: Star },
    'roman-misc': { path: '/assets/misc/roman.png', category: 'misc', fallbackIcon: Users },
    'scroll': { path: '/assets/misc/scroll.png', category: 'misc', fallbackIcon: ScrollText },
    'scroll2': { path: '/assets/misc/scroll2.png', category: 'misc', fallbackIcon: ScrollText },
    'thumbs-down': { path: '/assets/misc/thumbs-down.png', category: 'misc', fallbackIcon: Heart },
    'thumbs-up': { path: '/assets/misc/thumbs-up.png', category: 'misc', fallbackIcon: Heart },

    // People
    'emperor': { path: '/assets/people/emperor.png', category: 'people', fallbackIcon: Crown },
    'legionnaire': { path: '/assets/people/legionnaire.png', category: 'people', fallbackIcon: Swords },
    'roman': { path: '/assets/people/roman.png', category: 'people', fallbackIcon: Users },
    'roman-old': { path: '/assets/people/roman-old.png', category: 'people', fallbackIcon: Users },
    'roman-woman': { path: '/assets/people/roman-woman.png', category: 'people', fallbackIcon: Users },
    'senate': { path: '/assets/people/senate.png', category: 'people', fallbackIcon: Landmark },
    'slave': { path: '/assets/people/slave.png', category: 'people', fallbackIcon: Users },

    // Kenney Board Game Icons (CC0 - kenney.nl)
    'k-wheat': { path: '/assets/kenney/resource_wheat.png', category: 'kenney', fallbackIcon: Package },
    'k-iron': { path: '/assets/kenney/resource_iron.png', category: 'kenney', fallbackIcon: Package },
    'k-wood': { path: '/assets/kenney/resource_wood.png', category: 'kenney', fallbackIcon: Package },
    'k-lumber': { path: '/assets/kenney/resource_lumber.png', category: 'kenney', fallbackIcon: Package },
    'k-planks': { path: '/assets/kenney/resource_planks.png', category: 'kenney', fallbackIcon: Package },
    'k-apple': { path: '/assets/kenney/resource_apple.png', category: 'kenney', fallbackIcon: Package },
    'k-sword': { path: '/assets/kenney/sword.png', category: 'kenney', fallbackIcon: Swords },
    'k-shield': { path: '/assets/kenney/shield.png', category: 'kenney', fallbackIcon: Shield },
    'k-bow': { path: '/assets/kenney/bow.png', category: 'kenney', fallbackIcon: Swords },
    'k-skull': { path: '/assets/kenney/skull.png', category: 'kenney', fallbackIcon: Package },
    'k-crown-a': { path: '/assets/kenney/crown_a.png', category: 'kenney', fallbackIcon: Crown },
    'k-crown-b': { path: '/assets/kenney/crown_b.png', category: 'kenney', fallbackIcon: Crown },
    'k-fire': { path: '/assets/kenney/fire.png', category: 'kenney', fallbackIcon: Package },
    'k-campfire': { path: '/assets/kenney/campfire.png', category: 'kenney', fallbackIcon: Package },
    'k-hourglass': { path: '/assets/kenney/hourglass.png', category: 'kenney', fallbackIcon: Package },
    'k-book-closed': { path: '/assets/kenney/book_closed.png', category: 'kenney', fallbackIcon: ScrollText },
    'k-book-open': { path: '/assets/kenney/book_open.png', category: 'kenney', fallbackIcon: ScrollText },
    'k-flag-square': { path: '/assets/kenney/flag_square.png', category: 'kenney', fallbackIcon: Flag },
    'k-flag-triangle': { path: '/assets/kenney/flag_triangle.png', category: 'kenney', fallbackIcon: Flag },
    'k-award': { path: '/assets/kenney/award.png', category: 'kenney', fallbackIcon: Star },
    'k-flask-full': { path: '/assets/kenney/flask_full.png', category: 'kenney', fallbackIcon: Wine },
    'k-flask-half': { path: '/assets/kenney/flask_half.png', category: 'kenney', fallbackIcon: Wine },
    'k-flask-empty': { path: '/assets/kenney/flask_empty.png', category: 'kenney', fallbackIcon: Package },
    'k-pouch': { path: '/assets/kenney/pouch.png', category: 'kenney', fallbackIcon: Coins },
    'k-pouch-add': { path: '/assets/kenney/pouch_add.png', category: 'kenney', fallbackIcon: Coins },
    'k-church': { path: '/assets/kenney/structure_church.png', category: 'kenney', fallbackIcon: Church },
    'k-farm': { path: '/assets/kenney/structure_farm.png', category: 'kenney', fallbackIcon: Building2 },
    'k-gate': { path: '/assets/kenney/structure_gate.png', category: 'kenney', fallbackIcon: Castle },
    'k-house': { path: '/assets/kenney/structure_house.png', category: 'kenney', fallbackIcon: Building2 },
    'k-tower': { path: '/assets/kenney/structure_tower.png', category: 'kenney', fallbackIcon: Building2 },
    'k-wall': { path: '/assets/kenney/structure_wall.png', category: 'kenney', fallbackIcon: Shield },
    'k-watchtower': { path: '/assets/kenney/structure_watchtower.png', category: 'kenney', fallbackIcon: Building2 },
    'k-character': { path: '/assets/kenney/character.png', category: 'kenney', fallbackIcon: Users },
    'k-notepad': { path: '/assets/kenney/notepad.png', category: 'kenney', fallbackIcon: ScrollText },
    'k-notepad-write': { path: '/assets/kenney/notepad_write.png', category: 'kenney', fallbackIcon: ScrollText },
    'k-heart': { path: '/assets/kenney/suit_hearts.png', category: 'kenney', fallbackIcon: Heart },
    'k-heart-broken': { path: '/assets/kenney/suit_hearts_broken.png', category: 'kenney', fallbackIcon: Heart },
    'k-spades': { path: '/assets/kenney/suit_spades.png', category: 'kenney', fallbackIcon: Package },
    'k-pawn': { path: '/assets/kenney/pawn.png', category: 'kenney', fallbackIcon: Users },
    'k-pawns': { path: '/assets/kenney/pawns.png', category: 'kenney', fallbackIcon: Users },
    'k-dollar': { path: '/assets/kenney/dollar.png', category: 'kenney', fallbackIcon: Coins },
    'k-lock': { path: '/assets/kenney/lock_closed.png', category: 'kenney', fallbackIcon: Package },
    'k-unlock': { path: '/assets/kenney/lock_open.png', category: 'kenney', fallbackIcon: Package },
    'k-dice-sword': { path: '/assets/kenney/dice_sword.png', category: 'kenney', fallbackIcon: Swords },
    'k-dice-shield': { path: '/assets/kenney/dice_shield.png', category: 'kenney', fallbackIcon: Shield },
    'k-dice-skull': { path: '/assets/kenney/dice_skull.png', category: 'kenney', fallbackIcon: Package },
    'k-hand': { path: '/assets/kenney/hand.png', category: 'kenney', fallbackIcon: Users },
    'k-tokens': { path: '/assets/kenney/tokens.png', category: 'kenney', fallbackIcon: Coins },
    'k-exploding': { path: '/assets/kenney/exploding.png', category: 'kenney', fallbackIcon: Package },
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
    walls: 'k-wall',
    arena: 'colosseum',
    roads: 'column',
    local_temple: 'k-church',
    forum: 'column2',
    watchtower: 'k-watchtower',
    granary: 'amphora',
    census_office: 'k-notepad',
};

export const RELIGIOUS_BUILDING_ASSETS: Record<string, AssetKey> = {
    shrine: 'temple',
    temple: 'k-church',
    oracle: 'bust',
    altar: 'k-campfire',
    augury_house: 'k-book-open',
};

export const WORSHIP_ACTION_ASSETS: Record<string, AssetKey> = {
    prayer: 'bust',
    sacrifice: 'k-campfire',
    festival: 'laurels-gold',
    divination: 'k-book-open',
    pilgrimage: 'roman',
    consecration: 'k-church',
    invoke: 'laurels',
};

export const RANDOM_EVENT_ASSETS: Record<string, AssetKey> = {
    // Positive events
    bountiful_harvest: 'k-wheat',
    trade_windfall: 'k-pouch',
    divine_blessing: 'laurels-gold',
    population_boom: 'k-pawns',
    good_omens: 'k-flag-triangle',
    merchant_caravan: 'amphora2',
    // Negative events
    plague_outbreak: 'k-skull',
    bandit_raid: 'k-sword',
    crop_failure: 'amphora-broken2',
    fire_outbreak: 'k-fire',
    tax_revolt: 'roman-old',
    desertion: 'legionnaire',
    // Neutral events
    senate_debate: 'senate',
    foreign_emissary: 'k-notepad',
    religious_schism: 'k-church',
    market_fluctuation: 'coin-silver',
};

export const TERRITORY_EVENT_ASSETS: Record<string, AssetKey> = {
    uprising: 'k-sword',
    prosperity: 'k-pouch',
    slave_revolt: 'slave',
    bandit_attack: 'k-dice-sword',
    cultural_flourishing: 'k-award',
    plague: 'k-skull',
    bountiful_harvest: 'k-wheat',
};

export const RELIGIOUS_EVENT_ASSETS: Record<string, AssetKey> = {
    divine_omen: 'k-book-open',
    solar_eclipse: 'k-hourglass',
    comet_sighting: 'k-exploding',
    miracle: 'laurels-gold',
    divine_wrath: 'k-fire',
    prophetic_dream: 'k-book-closed',
};

export const RESOURCE_ASSETS: Partial<Record<string, AssetKey>> = {
    denarii: 'coin-gold',
    grain: 'k-wheat',
    wine: 'k-flask-full',
    clay: 'amphora2',
    livestock: 'k-apple',
    troops: 'centurion-helmet',
    population: 'k-pawns',
    piety: 'bust',
    iron: 'k-iron',
    timber: 'k-wood',
    stone: 'k-planks',
    wool: 'k-pouch',
    happiness: 'k-heart',
    morale: 'k-flag-triangle',
};

export const EMERGENCY_ACTION_ASSETS: Record<string, AssetKey> = {
    emergency_tax: 'k-dollar',
    conscription: 'k-pawn',
    divine_intervention: 'laurels-gold',
    grain_requisition: 'k-wheat',
    mercenary_hire: 'k-sword',
};

export const CRAFTING_RECIPE_ASSETS: Record<string, AssetKey> = {
    forge_weapons: 'k-sword',
    host_feast: 'k-flask-full',
    build_monument: 'k-tower',
    supply_cache: 'k-pouch-add',
};

export const TERRITORY_FOCUS_ASSETS: Record<string, AssetKey> = {
    military_outpost: 'k-shield',
    trade_hub: 'k-pouch',
    breadbasket: 'k-farm',
    mining_district: 'k-iron',
};

export const GOVERNOR_ASSETS: Record<string, AssetKey> = {
    merchant: 'k-dollar',
    general: 'k-sword',
    scholar: 'k-book-closed',
    administrator: 'k-notepad-write',
    priest: 'k-church',
};

export const FOUNDER_ASSETS: Record<string, AssetKey> = {
    romulus: 'k-crown-a',
    remus: 'k-crown-b',
};

export const GOD_ASSETS: Record<string, AssetKey> = {
    jupiter: 'laurels-gold',
    mars: 'k-sword',
    venus: 'k-heart',
    ceres: 'k-wheat',
    mercury: 'k-pouch',
    minerva: 'k-book-open',
};

// === TAB ASSETS ===
export const TAB_ASSETS: Record<string, AssetKey> = {
    gods: 'laurels-gold',
    buildings: 'k-tower',
    worship: 'k-campfire',
};
