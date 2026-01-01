// ============================================
// ROME EMPIRE BUILDER - Inter-City Pricing System
// ============================================
// Handles price differences between cities based on geography,
// transport routes, and local production/consumption patterns.

import type { ResourceType, Season, TradeCity, GameState } from '@/core/types';
import { BASE_PRICES } from '@/core/constants';
import {
    DISTANCE_PRICING,
    REGIONAL_PRICE_MODIFIERS,
    SEASONAL_PRICE_MODIFIERS,
    type RegionType,
    type CityType,
} from './constants';
import { getReputationEffects, type MerchantReputation } from './merchantReputation';
import { getAggregatedEventEffects, type EconomicEventState } from './economicEvents';
import { calculateScarcityMultiplier } from './pricing';

// === TYPES ===

export interface CityPriceInfo {
    cityId: string;
    cityName: string;
    cityType: CityType;
    distance: number;
    resource: ResourceType;
    basePrice: number;
    buyPrice: number;               // Price to buy from city
    sellPrice: number;              // Price to sell to city
    priceFactors: {
        regional: number;
        seasonal: number;
        distance: number;
        reputation: number;
        event: number;
        scarcity: number;
    };
    profitMargin: number;           // Sell - Buy (can be negative)
    trend: 'rising' | 'falling' | 'stable';
    advice: string;
}

export interface TradeRouteAnalysis {
    fromCity: string;
    toCity: string;
    resource: ResourceType;
    buyPrice: number;
    sellPrice: number;
    grossProfit: number;
    transportCost: number;
    netProfit: number;
    riskAdjustedProfit: number;
    isProfitable: boolean;
    recommendation: 'highly_recommended' | 'recommended' | 'marginal' | 'not_recommended';
}

export interface CityMarketConditions {
    cityId: string;
    cityType: CityType;
    hasPort: boolean;
    distanceFromRome: number;
    localProduction: ResourceType[];
    localDemand: ResourceType[];
    currentPrices: Record<ResourceType, number>;
    priceHistory: {
        resource: ResourceType;
        prices: number[];           // Last 4 seasons
    }[];
}

// === CITY TYPE DETECTION ===

/**
 * Determine city type from trade city properties.
 */
export function determineCityType(city: TradeCity): CityType {
    // Known city mappings
    const cityTypes: Record<string, CityType> = {
        'ostia_docks': 'coastal',
        'greek_colony': 'coastal',
        'etruscan_port': 'river',
        'sabine_market': 'inland',
        'latin_village': 'inland',
        'rome': 'capital',
    };

    if (cityTypes[city.id]) {
        return cityTypes[city.id];
    }

    // Infer from specialties
    if (city.specialties?.includes('salt') ||
        city.specialties?.includes('olive_oil') ||
        city.biases?.includes('salt')) {
        return 'coastal';
    }

    if (city.specialties?.includes('iron') ||
        city.specialties?.includes('stone') ||
        city.biases?.includes('iron')) {
        return 'mountain';
    }

    // Default based on distance
    if (city.distance < 20) return 'capital';
    if (city.distance < 50) return 'inland';
    return 'coastal'; // Distant cities likely reached by sea
}

/**
 * Get region type from city type.
 */
export function cityTypeToRegionType(cityType: CityType): RegionType {
    const mapping: Record<CityType, RegionType> = {
        coastal: 'coastal',
        inland: 'inland',
        mountain: 'mountain',
        river: 'river',
        capital: 'capital',
    };
    return mapping[cityType] || 'inland';
}

// === PRICE CALCULATION ===

/**
 * Calculate base regional modifier for a resource at a city.
 */
export function getRegionalPriceModifier(
    resource: ResourceType,
    cityType: CityType
): number {
    const regionType = cityTypeToRegionType(cityType);
    const regionMods = REGIONAL_PRICE_MODIFIERS[regionType];

    if (!regionMods) return 1.0;
    return regionMods[resource] ?? 1.0;
}

/**
 * Calculate seasonal price modifier.
 */
export function getSeasonalPriceModifier(
    resource: ResourceType,
    season: Season
): number {
    const seasonMods = SEASONAL_PRICE_MODIFIERS[season];
    if (!seasonMods) return 1.0;
    return seasonMods[resource] ?? 1.0;
}

/**
 * Calculate distance-based price modifier.
 * Distant cities have higher prices due to transport costs.
 */
export function getDistancePriceModifier(
    distance: number,
    cityType: CityType,
    hasRoads: boolean = false
): number {
    // Base distance cost
    let modifier = 1 + (distance * DISTANCE_PRICING.BASE_DISTANCE_COST);

    // Cap at maximum
    const maxMod = 1 + DISTANCE_PRICING.MAX_DISTANCE_PENALTY;
    modifier = Math.min(modifier, maxMod);

    // Apply transport bonuses
    if (cityType === 'coastal') {
        modifier *= (1 - DISTANCE_PRICING.PORT_DISCOUNT);
    }
    if (cityType === 'river') {
        modifier *= (1 - DISTANCE_PRICING.RIVER_DISCOUNT);
    }
    if (hasRoads) {
        modifier *= (1 - DISTANCE_PRICING.ROAD_DISCOUNT);
    }

    return Math.max(1.0, modifier);
}

/**
 * Calculate the full price for a resource at a specific city.
 * Includes all modifiers: regional, seasonal, distance, reputation, events.
 */
export function calculateCityPrice(
    resource: ResourceType,
    city: TradeCity,
    season: Season,
    isBuying: boolean,
    options: {
        reputation?: MerchantReputation;
        eventState?: EconomicEventState;
        hasRoads?: boolean;
        supply?: number;
        demand?: number;
        capacity?: number;
    } = {}
): CityPriceInfo {
    const basePrice = BASE_PRICES[resource] || 10;
    const cityType = determineCityType(city);

    // Calculate individual modifiers
    const regionalMod = getRegionalPriceModifier(resource, cityType);
    const seasonalMod = getSeasonalPriceModifier(resource, season);
    const distanceMod = getDistancePriceModifier(
        city.distance,
        cityType,
        options.hasRoads ?? false
    );

    // Reputation modifier
    let reputationMod = 1.0;
    if (options.reputation) {
        const effects = getReputationEffects(options.reputation.reputation);
        reputationMod = isBuying
            ? (1 + effects.buyPriceModifier)
            : (1 + effects.sellPriceModifier);
    }

    // Event modifier
    let eventMod = 1.0;
    if (options.eventState) {
        const effects = getAggregatedEventEffects(options.eventState);
        eventMod = effects.priceModifiers[resource] || 1.0;
    }

    // Scarcity modifier (supply/demand)
    let scarcityMod = 1.0;
    if (options.supply !== undefined && options.demand !== undefined) {
        scarcityMod = calculateScarcityMultiplier(
            options.supply,
            options.demand,
            options.capacity ?? 100
        );
    }

    // Calculate final prices
    const rawPrice = basePrice * regionalMod * seasonalMod * distanceMod * eventMod * scarcityMod;
    const adjustedPrice = rawPrice * reputationMod;

    // Buy price is higher (city markup), sell price is lower (city cut)
    const cityMarkup = 1.15;        // Cities add 15% markup when selling to player
    const cityCut = 0.85;           // Cities take 15% cut when buying from player

    const buyPrice = Math.round(adjustedPrice * cityMarkup);
    const sellPrice = Math.round(adjustedPrice * cityCut);

    // Determine price trend
    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    const totalMod = regionalMod * seasonalMod * eventMod * scarcityMod;
    if (totalMod > 1.1) trend = 'rising';
    else if (totalMod < 0.9) trend = 'falling';

    // Generate advice
    const advice = generateTradeAdvice(resource, cityType, trend, isBuying, reputationMod);

    return {
        cityId: city.id,
        cityName: city.name,
        cityType,
        distance: city.distance,
        resource,
        basePrice,
        buyPrice,
        sellPrice,
        priceFactors: {
            regional: Math.round(regionalMod * 100) / 100,
            seasonal: Math.round(seasonalMod * 100) / 100,
            distance: Math.round(distanceMod * 100) / 100,
            reputation: Math.round(reputationMod * 100) / 100,
            event: Math.round(eventMod * 100) / 100,
            scarcity: Math.round(scarcityMod * 100) / 100,
        },
        profitMargin: sellPrice - buyPrice,
        trend,
        advice,
    };
}

/**
 * Generate trade advice based on market conditions.
 */
function generateTradeAdvice(
    resource: ResourceType,
    cityType: CityType,
    trend: 'rising' | 'falling' | 'stable',
    isBuying: boolean,
    reputationMod: number
): string {
    const advices: string[] = [];

    // City type advice
    if (cityType === 'coastal' && ['salt', 'olive_oil', 'spices'].includes(resource)) {
        advices.push('Coastal cities offer good prices for sea goods.');
    }
    if (cityType === 'inland' && ['grain', 'livestock', 'wool'].includes(resource)) {
        advices.push('Inland cities produce agricultural goods cheaply.');
    }
    if (cityType === 'mountain' && ['iron', 'stone'].includes(resource)) {
        advices.push('Mountain regions have abundant mining resources.');
    }

    // Trend advice
    if (trend === 'rising' && !isBuying) {
        advices.push('Prices rising - good time to sell!');
    } else if (trend === 'falling' && isBuying) {
        advices.push('Prices falling - good time to buy!');
    }

    // Reputation advice
    if (reputationMod > 1.1) {
        advices.push('Your reputation provides favorable terms.');
    } else if (reputationMod < 0.95) {
        advices.push('Improve reputation for better prices.');
    }

    return advices.length > 0 ? advices[0] : 'Standard market conditions.';
}

// === TRADE ROUTE ANALYSIS ===

/**
 * Analyze profitability of a trade route between two cities.
 */
export function analyzeTradeRoute(
    resource: ResourceType,
    fromCity: TradeCity,
    toCity: TradeCity,
    quantity: number,
    state: GameState,
    options: {
        fromReputation?: MerchantReputation;
        toReputation?: MerchantReputation;
        eventState?: EconomicEventState;
    } = {}
): TradeRouteAnalysis {
    const hasRoads = state.technologies?.some(t => t.id === 'roads' && t.researched) ?? false;

    // Get buy price at source city
    const buyInfo = calculateCityPrice(resource, fromCity, state.season, true, {
        reputation: options.fromReputation,
        eventState: options.eventState,
        hasRoads,
        supply: state.inventory[resource],
        demand: state.market.demandIndices[resource],
        capacity: state.capacity[resource],
    });

    // Get sell price at destination city
    const sellInfo = calculateCityPrice(resource, toCity, state.season, false, {
        reputation: options.toReputation,
        eventState: options.eventState,
        hasRoads,
        supply: state.inventory[resource],
        demand: state.market.demandIndices[resource],
        capacity: state.capacity[resource],
    });

    const totalBuyCost = buyInfo.buyPrice * quantity;
    const totalSellRevenue = sellInfo.sellPrice * quantity;
    const grossProfit = totalSellRevenue - totalBuyCost;

    // Calculate transport cost
    const totalDistance = fromCity.distance + toCity.distance;
    const transportCostPerUnit = Math.ceil(totalDistance * 0.1); // 0.1 denarii per mile per unit
    const transportCost = transportCostPerUnit * quantity;

    const netProfit = grossProfit - transportCost;

    // Adjust for risk
    const baseRisk = (fromCity.risk + toCity.risk) / 2;
    const eventRisk = options.eventState
        ? getAggregatedEventEffects(options.eventState).tradeRiskMod
        : 0;
    const totalRisk = Math.min(0.5, baseRisk + eventRisk);
    const riskAdjustedProfit = netProfit * (1 - totalRisk);

    // Determine recommendation
    let recommendation: TradeRouteAnalysis['recommendation'];
    if (riskAdjustedProfit > quantity * 5) {
        recommendation = 'highly_recommended';
    } else if (riskAdjustedProfit > quantity * 2) {
        recommendation = 'recommended';
    } else if (riskAdjustedProfit > 0) {
        recommendation = 'marginal';
    } else {
        recommendation = 'not_recommended';
    }

    return {
        fromCity: fromCity.name,
        toCity: toCity.name,
        resource,
        buyPrice: buyInfo.buyPrice,
        sellPrice: sellInfo.sellPrice,
        grossProfit,
        transportCost,
        netProfit,
        riskAdjustedProfit: Math.round(riskAdjustedProfit),
        isProfitable: netProfit > 0,
        recommendation,
    };
}

/**
 * Find the most profitable trade route for a resource.
 */
export function findBestTradeRoute(
    resource: ResourceType,
    cities: TradeCity[],
    state: GameState,
    quantity: number = 10
): TradeRouteAnalysis | null {
    let bestRoute: TradeRouteAnalysis | null = null;
    let bestProfit = -Infinity;

    for (const fromCity of cities) {
        for (const toCity of cities) {
            if (fromCity.id === toCity.id) continue;

            const analysis = analyzeTradeRoute(resource, fromCity, toCity, quantity, state);

            if (analysis.riskAdjustedProfit > bestProfit) {
                bestProfit = analysis.riskAdjustedProfit;
                bestRoute = analysis;
            }
        }
    }

    return bestRoute;
}

/**
 * Get all prices for a resource across all cities.
 * Useful for displaying market overview.
 */
export function getResourcePricesAcrossCities(
    resource: ResourceType,
    cities: TradeCity[],
    state: GameState,
    options: {
        reputations?: Record<string, MerchantReputation>;
        eventState?: EconomicEventState;
    } = {}
): CityPriceInfo[] {
    const hasRoads = state.technologies?.some(t => t.id === 'roads' && t.researched) ?? false;

    return cities.map(city => {
        const reputation = options.reputations?.[city.id];
        return calculateCityPrice(resource, city, state.season, false, {
            reputation,
            eventState: options.eventState,
            hasRoads,
            supply: state.inventory[resource],
            demand: state.market.demandIndices[resource],
            capacity: state.capacity[resource],
        });
    }).sort((a, b) => b.sellPrice - a.sellPrice); // Sort by best sell price
}

/**
 * Find cities where a resource can be bought cheaply.
 */
export function findCheapestBuyingCities(
    resource: ResourceType,
    cities: TradeCity[],
    state: GameState,
    limit: number = 3
): CityPriceInfo[] {
    const prices = cities.map(city =>
        calculateCityPrice(resource, city, state.season, true, {
            hasRoads: state.technologies?.some(t => t.id === 'roads' && t.researched),
            supply: state.inventory[resource],
            demand: state.market.demandIndices[resource],
            capacity: state.capacity[resource],
        })
    );

    return prices
        .sort((a, b) => a.buyPrice - b.buyPrice)
        .slice(0, limit);
}

/**
 * Find cities where a resource can be sold for the most.
 */
export function findBestSellingCities(
    resource: ResourceType,
    cities: TradeCity[],
    state: GameState,
    limit: number = 3
): CityPriceInfo[] {
    const prices = cities.map(city =>
        calculateCityPrice(resource, city, state.season, false, {
            hasRoads: state.technologies?.some(t => t.id === 'roads' && t.researched),
            supply: state.inventory[resource],
            demand: state.market.demandIndices[resource],
            capacity: state.capacity[resource],
        })
    );

    return prices
        .sort((a, b) => b.sellPrice - a.sellPrice)
        .slice(0, limit);
}
