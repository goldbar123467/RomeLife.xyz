// ============================================
// ROME EMPIRE BUILDER - Dynamic Pricing System
// ============================================
// Supply/demand pricing algorithm with regional and seasonal modifiers.

import type { ResourceType, Season, TradeCity, GameState } from '@/core/types';
import { BASE_PRICES } from '@/core/constants';
import {
    PRICING_CONSTANTS,
    REGIONAL_PRICE_MODIFIERS,
    SEASONAL_PRICE_MODIFIERS,
    DISTANCE_PRICING,
    type RegionType,
    type CityType,
} from './constants';

// === CORE PRICING INTERFACES ===

export interface MarketConditions {
    supply: number;             // Current inventory
    demand: number;             // Current demand index (100 = baseline)
    capacity: number;           // Storage capacity
    volatility: number;         // Market volatility modifier
}

export interface PriceCalculationResult {
    basePrice: number;
    scarcityMultiplier: number;
    regionalModifier: number;
    seasonalModifier: number;
    distanceModifier: number;
    volatilityAdjustment: number;
    finalPrice: number;
    priceBreakdown: {
        supply: number;
        demand: number;
        regional: number;
        seasonal: number;
        distance: number;
        volatility: number;
    };
}

// === SUPPLY/DEMAND SCARCITY CALCULATION ===

/**
 * Calculate the scarcity multiplier based on supply vs demand ratio.
 * Uses a logistic curve for smooth price transitions.
 *
 * Formula: scarcityMultiplier = 1 / (supply / demand)
 * Clamped between MIN_SCARCITY_MULTIPLIER and MAX_SCARCITY_MULTIPLIER
 */
export function calculateScarcityMultiplier(
    supply: number,
    demand: number,
    capacity: number
): number {
    // Avoid division by zero
    if (demand <= 0) demand = 1;
    if (supply <= 0) supply = 0.1;

    // Calculate supply ratio (how full are stores relative to demand)
    const supplyRatio = supply / demand;

    // Calculate fill ratio (how full are stores relative to capacity)
    const fillRatio = supply / Math.max(capacity, 1);

    // Base scarcity from supply/demand ratio
    let scarcityMultiplier = 1 / supplyRatio;

    // Apply additional modifiers based on fill ratio
    if (fillRatio < PRICING_CONSTANTS.CRITICAL_SHORTAGE_THRESHOLD) {
        // Critical shortage: prices spike
        scarcityMultiplier *= 1.5;
    } else if (fillRatio < PRICING_CONSTANTS.SHORTAGE_THRESHOLD) {
        // Shortage: moderate price increase
        scarcityMultiplier *= 1.2;
    } else if (fillRatio > PRICING_CONSTANTS.OVERSUPPLY_THRESHOLD) {
        // Oversupply: prices drop
        scarcityMultiplier *= 0.8;
    }

    // Clamp to configured bounds
    return Math.max(
        PRICING_CONSTANTS.MIN_SCARCITY_MULTIPLIER,
        Math.min(PRICING_CONSTANTS.MAX_SCARCITY_MULTIPLIER, scarcityMultiplier)
    );
}

// === REGIONAL MODIFIER ===

/**
 * Get regional price modifier for a resource based on city type.
 * Coastal cities have cheap fish/salt, inland has cheap grain, etc.
 */
export function getRegionalModifier(
    resource: ResourceType,
    regionType: RegionType
): number {
    const regionMods = REGIONAL_PRICE_MODIFIERS[regionType];
    if (!regionMods) return 1.0;

    return regionMods[resource] ?? 1.0;
}

/**
 * Determine region type from city properties.
 */
export function getCityRegionType(city: TradeCity): RegionType {
    // Infer region type from city characteristics
    // This could be expanded with explicit city.regionType field

    if (city.id === 'ostia_docks' || city.id === 'greek_colony') {
        return 'coastal';
    }
    if (city.id === 'sabine_market' || city.id === 'latin_village') {
        return 'inland';
    }
    if (city.id === 'etruscan_port') {
        return 'river'; // Etruscan cities often on Tiber
    }

    // Default based on distance and specialties
    if (city.specialties?.includes('salt') || city.specialties?.includes('olive_oil')) {
        return 'coastal';
    }
    if (city.specialties?.includes('iron') || city.specialties?.includes('stone')) {
        return 'mountain';
    }

    return 'inland';
}

// === SEASONAL MODIFIER ===

/**
 * Get seasonal price modifier for a resource.
 * Grain is expensive in winter, cheap after harvest, etc.
 */
export function getSeasonalModifier(
    resource: ResourceType,
    season: Season
): number {
    const seasonMods = SEASONAL_PRICE_MODIFIERS[season];
    if (!seasonMods) return 1.0;

    return seasonMods[resource] ?? 1.0;
}

// === DISTANCE MODIFIER ===

/**
 * Calculate price modifier based on distance from Rome.
 * Distant cities have higher prices due to transport costs.
 */
export function getDistanceModifier(
    distance: number,
    cityType: CityType,
    hasRoads: boolean = false
): number {
    // Base distance cost
    let modifier = 1 + (distance * DISTANCE_PRICING.BASE_DISTANCE_COST);

    // Cap at maximum penalty
    const maxModifier = 1 + DISTANCE_PRICING.MAX_DISTANCE_PENALTY;
    modifier = Math.min(modifier, maxModifier);

    // Apply transport discounts
    if (cityType === 'coastal' || cityType === 'river') {
        modifier -= DISTANCE_PRICING.PORT_DISCOUNT;
    }
    if (cityType === 'river') {
        modifier -= DISTANCE_PRICING.RIVER_DISCOUNT;
    }
    if (hasRoads) {
        modifier -= DISTANCE_PRICING.ROAD_DISCOUNT;
    }

    // Ensure modifier doesn't go below base
    return Math.max(1.0, modifier);
}

// === MAIN PRICING FUNCTION ===

/**
 * Calculate the dynamic market price for a resource at a specific city.
 *
 * This is the core pricing algorithm that considers:
 * 1. Base price of the resource
 * 2. Supply/demand scarcity multiplier
 * 3. Regional modifiers (coastal, inland, etc.)
 * 4. Seasonal modifiers (harvest, winter, etc.)
 * 5. Distance from Rome
 * 6. Random volatility
 *
 * @param resource - The resource type to price
 * @param city - The trade city
 * @param conditions - Current market conditions
 * @param season - Current season
 * @param hasRoads - Whether road technology is researched
 * @returns Detailed price calculation result
 */
export function calculateMarketPrice(
    resource: ResourceType,
    city: TradeCity,
    conditions: MarketConditions,
    season: Season,
    hasRoads: boolean = false
): PriceCalculationResult {
    const basePrice = BASE_PRICES[resource] || 10;

    // Calculate individual modifiers
    const scarcityMultiplier = calculateScarcityMultiplier(
        conditions.supply,
        conditions.demand,
        conditions.capacity
    );

    const regionType = getCityRegionType(city);
    const regionalModifier = getRegionalModifier(resource, regionType);

    const seasonalModifier = getSeasonalModifier(resource, season);

    const cityType = determineCityType(city);
    const distanceModifier = getDistanceModifier(city.distance, cityType, hasRoads);

    // Calculate volatility adjustment (-5% to +5% random)
    const volatilityAdjustment = 1 + (
        (Math.random() - 0.5) * 2 *
        PRICING_CONSTANTS.VOLATILITY_BASE *
        conditions.volatility
    );

    // Combine all modifiers
    const rawPrice = basePrice *
        scarcityMultiplier *
        regionalModifier *
        seasonalModifier *
        distanceModifier *
        volatilityAdjustment;

    // Apply price floor and ceiling
    const minPrice = Math.floor(basePrice * PRICING_CONSTANTS.PRICE_FLOOR_MULTIPLIER);
    const maxPrice = Math.floor(basePrice * PRICING_CONSTANTS.PRICE_CEILING_MULTIPLIER);
    const finalPrice = Math.max(minPrice, Math.min(maxPrice, Math.round(rawPrice)));

    return {
        basePrice,
        scarcityMultiplier,
        regionalModifier,
        seasonalModifier,
        distanceModifier,
        volatilityAdjustment,
        finalPrice,
        priceBreakdown: {
            supply: Math.round(scarcityMultiplier * 100) / 100,
            demand: Math.round((conditions.demand / 100) * 100) / 100,
            regional: Math.round(regionalModifier * 100) / 100,
            seasonal: Math.round(seasonalModifier * 100) / 100,
            distance: Math.round(distanceModifier * 100) / 100,
            volatility: Math.round(volatilityAdjustment * 100) / 100,
        },
    };
}

/**
 * Calculate all market prices for a city.
 * Convenience function that returns prices for all resource types.
 */
export function calculateAllCityPrices(
    city: TradeCity,
    state: GameState,
    season: Season
): Record<ResourceType, PriceCalculationResult> {
    const resourceTypes: ResourceType[] = [
        'grain', 'iron', 'timber', 'stone', 'clay',
        'wool', 'salt', 'livestock', 'wine', 'olive_oil', 'spices'
    ];

    const hasRoads = state.technologies?.some(t => t.id === 'roads' && t.researched) ?? false;

    const prices: Partial<Record<ResourceType, PriceCalculationResult>> = {};

    for (const resource of resourceTypes) {
        const conditions: MarketConditions = {
            supply: state.inventory[resource] || 0,
            demand: state.market.demandIndices[resource] || 100,
            capacity: state.capacity[resource] || 100,
            volatility: state.market.volatility || 1.0,
        };

        prices[resource] = calculateMarketPrice(
            resource,
            city,
            conditions,
            season,
            hasRoads
        );
    }

    return prices as Record<ResourceType, PriceCalculationResult>;
}

// === HELPER FUNCTIONS ===

/**
 * Determine city type from properties.
 */
function determineCityType(city: TradeCity): CityType {
    // Use specialties and biases to infer city type
    if (city.specialties?.includes('salt') ||
        city.id === 'ostia_docks' ||
        city.id === 'greek_colony') {
        return 'coastal';
    }

    if (city.specialties?.includes('iron') ||
        city.specialties?.includes('stone')) {
        return 'mountain';
    }

    if (city.id === 'etruscan_port') {
        return 'river';
    }

    return 'inland';
}

/**
 * Get human-readable price trend description.
 */
export function getPriceTrend(
    currentPrice: number,
    basePrice: number
): 'crashing' | 'falling' | 'stable' | 'rising' | 'soaring' {
    const ratio = currentPrice / basePrice;

    if (ratio < 0.6) return 'crashing';
    if (ratio < 0.85) return 'falling';
    if (ratio <= 1.15) return 'stable';
    if (ratio <= 1.5) return 'rising';
    return 'soaring';
}

/**
 * Get price trend color for UI display.
 */
export function getPriceTrendColor(trend: ReturnType<typeof getPriceTrend>): string {
    const colors: Record<ReturnType<typeof getPriceTrend>, string> = {
        crashing: '#dc2626', // red-600
        falling: '#f97316',  // orange-500
        stable: '#6b7280',   // gray-500
        rising: '#16a34a',   // green-600
        soaring: '#7c3aed',  // violet-600
    };
    return colors[trend];
}

/**
 * Calculate price change percentage from base.
 */
export function getPriceChangePercent(finalPrice: number, basePrice: number): number {
    return Math.round(((finalPrice - basePrice) / basePrice) * 100);
}
