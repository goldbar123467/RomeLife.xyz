// ============================================
// ROME EMPIRE BUILDER - Economy Domain Module
// ============================================
// Export all economy-related types and functions.

// Constants
export {
    PRICING_CONSTANTS,
    REGIONAL_PRICE_MODIFIERS,
    SEASONAL_PRICE_MODIFIERS,
    REPUTATION_TIERS,
    REPUTATION_CHANGES,
    ECONOMIC_EVENTS,
    DISTANCE_PRICING,
    type RegionType,
    type CityType,
    type ReputationLevel,
    type ReputationTier,
    type EconomicEvent,
    type CityTradeProfile,
} from './constants';

// Pricing System
export {
    calculateScarcityMultiplier,
    getRegionalModifier,
    getSeasonalModifier,
    getDistanceModifier,
    calculateMarketPrice,
    calculateAllCityPrices,
    getPriceTrend,
    getPriceTrendColor,
    getPriceChangePercent,
    type MarketConditions,
    type PriceCalculationResult,
} from './pricing';

// Merchant Reputation
export {
    getReputationTier,
    getReputationLevel,
    calculateReputationChange,
    updateReputation,
    getReputationEffects,
    applyReputationToPrice,
    rollForSpecialOffer,
    applyReputationDecay,
    createInitialReputation,
    getReputationProgress,
    getReputationBenefits,
    type MerchantReputation,
    type ReputationAction,
    type ReputationEffect,
    type SpecialOffer,
} from './merchantReputation';

// Economic Events
export {
    rollEconomicEvent,
    activateEconomicEvent,
    processEconomicEvents,
    getAggregatedEventEffects,
    applyEventEffectsToPrice,
    getActiveEventsSummary,
    createInitialEconomicEventState,
    getEconomicEventById,
    getEventsByCategory,
    forceActivateEvent,
    type ActiveEconomicEvent,
    type EconomicEventState,
    type AggregatedEventEffects,
} from './economicEvents';

// Inter-City Pricing
export {
    determineCityType,
    cityTypeToRegionType,
    getRegionalPriceModifier,
    getSeasonalPriceModifier,
    getDistancePriceModifier,
    calculateCityPrice,
    analyzeTradeRoute,
    findBestTradeRoute,
    getResourcePricesAcrossCities,
    findCheapestBuyingCities,
    findBestSellingCities,
    type CityPriceInfo,
    type TradeRouteAnalysis,
    type CityMarketConditions,
} from './interCityPricing';
