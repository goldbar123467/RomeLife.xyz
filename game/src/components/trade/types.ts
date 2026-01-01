/**
 * Trade Component Types
 * Shared type definitions for trade sub-components
 */

import type { ResourceType, TradeCity, CaravanType, TradeState, MarketState, TradeRoute } from '@/core/types';

// Tradable resources list
export const tradableResources: ResourceType[] = [
    'grain', 'iron', 'timber', 'stone', 'clay', 'wool', 'salt', 'livestock', 'wine', 'olive_oil'
];

// Tab configuration
export const TAB_CONFIG = {
    quick: { label: 'Quick Trade', icon: 'ArrowRightLeft' },
    routes: { label: 'Trade Routes', icon: 'Truck' },
    market: { label: 'Market Intel', icon: 'BarChart3' },
    caravans: { label: 'Caravans', icon: 'Package' },
} as const;

// Historical city lore for immersive trading experience
export const CITY_LORE: Record<string, { description: string; specialty: string }> = {
    alba_longa: {
        description: "The legendary birthplace of Romulus and Remus. Alba Longa's volcanic soil yields wines that grace patrician tables.",
        specialty: "Fine wines and pottery from ancient Latium"
    },
    latin_village: {
        description: "A humble settlement of our Latin brethren. Simple folk, honest trade, the backbone of Rome's hinterland.",
        specialty: "Grain and livestock from fertile plains"
    },
    etruscan_port: {
        description: "Gateway to mysterious Etruria. Their bronze work is unmatched, their merchants shrewd as serpents.",
        specialty: "Bronze goods and eastern imports"
    },
    sabine_market: {
        description: "Where Rome once raided for brides, now we trade for wool. The Sabines never forget - nor do they forgive a bad deal.",
        specialty: "Mountain wool and hardy livestock"
    },
    ostia_docks: {
        description: "Rome's window to the sea. Every grain of Egyptian wheat, every amphora of Greek wine passes through Ostia's busy quays.",
        specialty: "Mediterranean imports and naval supplies"
    },
    greek_colony: {
        description: "A corner of Magna Graecia on Italian soil. Philosophy debates mix with merchant haggling in melodious Greek.",
        specialty: "Olive oil, wine, and educated slaves"
    }
};

// === PROP TYPES FOR TAB COMPONENTS ===

export interface QuickTradeTabProps {
    tradeCities: TradeCity[];
    inventory: Record<ResourceType, number>;
    market: MarketState;
    forts: number;
    reputation: number;
    hasRoads: boolean;
    selectedCity: TradeCity | null;
    setSelectedCity: (city: TradeCity | null) => void;
    selectedResource: ResourceType | null;
    setSelectedResource: (resource: ResourceType | null) => void;
    tradeAmount: number;
    setTradeAmount: (amount: number) => void;
    getTradePrice: (resource: ResourceType, city: TradeCity) => number;
    handleTrade: () => void;
    tradeState: TradeState;
}

export interface TradeRoutesTabProps {
    tradeCities: TradeCity[];
    tradeState: TradeState;
    inventory: Record<ResourceType, number>;
    denarii: number;
    market: MarketState;
    routeCity: string;
    setRouteCity: (city: string) => void;
    routeResource: ResourceType | null;
    setRouteResource: (resource: ResourceType | null) => void;
    establishTradeRoute: (cityId: string, resourceId: ResourceType) => void;
    cancelTradeRoute: (routeId: string) => void;
}

export interface MarketIntelTabProps {
    tradeCities: TradeCity[];
    inventory: Record<ResourceType, number>;
    market: MarketState;
    tradeState: TradeState;
}

export interface CaravansTabProps {
    tradeCities: TradeCity[];
    tradeState: TradeState;
    denarii: number;
    inventory: Record<ResourceType, number>;
    caravanCity: string;
    setCaravanCity: (city: string) => void;
    sendCaravan: (type: CaravanType, cityId: string) => void;
    upgradeTradeSkill: (skill: 'guards' | 'wagons' | 'negotiation') => void;
    forts: number;
    reputation: number;
    hasRoads: boolean;
}

// Trade city card props
export interface TradeCityCardProps {
    city: TradeCity;
    isSelected: boolean;
    onClick: () => void;
    risk: { risk: number };
    cityRep: number;
    lore: { description: string; specialty: string };
    index: number;
}

// Trade form props
export interface TradeFormProps {
    selectedCity: TradeCity;
    selectedResource: ResourceType | null;
    setSelectedResource: (resource: ResourceType | null) => void;
    inventory: Record<ResourceType, number>;
    tradeAmount: number;
    setTradeAmount: (amount: number) => void;
    getTradePrice: (resource: ResourceType, city: TradeCity) => number;
    handleTrade: () => void;
}

// Trade route card props
export interface TradeRouteCardProps {
    route: TradeRoute;
    cityName: string;
    onCancel: () => void;
}

// Price chart props
export interface TradePriceChartProps {
    market: MarketState;
    selectedResource: ResourceType;
    onResourceChange: (resource: ResourceType) => void;
}

// Caravan card props
export interface CaravanCardProps {
    config: {
        id: CaravanType;
        name: string;
        description: string;
        icon: string;
        risk: number;
        reward: number;
        duration: number;
        cost: number;
    };
    forecast: import('@/core/types/probability').CaravanSimulationResult | null;
    selectedCity: TradeCity | null;
    canAfford: boolean;
    caravanCity: string;
    onSend: () => void;
}
