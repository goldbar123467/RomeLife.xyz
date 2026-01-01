// ============================================
// ROME EMPIRE BUILDER - Economic Data Exports
// Historically authentic content for the market economy system
// ============================================

// Economic event flavor text with strategic hints
export {
  ECONOMIC_EVENTS,
  SEASONAL_MARKET_TEXT,
  PRICE_MOVEMENT_TEXT,
  getPriceMovementText,
  type EconomicEvent,
} from './economicEventText';

// Merchant personalities with unique dialogue
export {
  MERCHANTS,
  getRandomMerchantForResource,
  getMerchantDialogue,
  calculateMerchantPrice,
  type MerchantPersonality,
  type MerchantDialogue,
} from './merchantPersonalities';

// Enhanced resource descriptions with lore and strategy
export {
  ENHANCED_RESOURCES,
  REGIONAL_LORE,
  TRADE_ROUTES,
  getResourceStrategicHint,
  getSeasonalPriceModifier,
  getResourceCategory,
  type EnhancedResourceInfo,
  type RegionalEconomicLore,
  type TradeRouteDescription,
} from './resourceDescriptions';
