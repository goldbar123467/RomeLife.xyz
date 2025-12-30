'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, CARAVAN_CONFIGS } from '@/store/gameStore';
import { GlassCard, Button, Badge, SectionHeader } from '@/components/ui';
import { RESOURCE_INFO } from '@/core/constants';
import { calculateTradeRisk } from '@/core/math';
import { simulateCaravan } from '@/core/math/monteCarlo';
import { DistributionBar } from '@/components/ui/BellCurve';
import type { ResourceType, TradeCity, CaravanType, TradeState, MarketState, TradeRoute } from '@/core/types';
import type { CaravanSimulationResult } from '@/core/types/probability';
import { Package, ArrowRightLeft, BarChart3, Truck, Shield, TrendingUp } from 'lucide-react';

// === PROP TYPES FOR TAB COMPONENTS ===

interface QuickTradeTabProps {
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

interface TradeRoutesTabProps {
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

interface MarketIntelTabProps {
    tradeCities: TradeCity[];
    inventory: Record<ResourceType, number>;
    market: MarketState;
    tradeState: TradeState;
}

interface CaravansTabProps {
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

// Sub-tab icons
const TAB_CONFIG = {
    quick: { label: 'Quick Trade', icon: ArrowRightLeft },
    routes: { label: 'Trade Routes', icon: Truck },
    market: { label: 'Market Intel', icon: BarChart3 },
    caravans: { label: 'Caravans', icon: Package },
};

const tradableResources: ResourceType[] = [
    'grain', 'iron', 'timber', 'stone', 'clay', 'wool', 'salt', 'livestock', 'wine', 'olive_oil'
];

export function TradePanel() {
    const state = useGameStore();
    const {
        tradeCities, inventory, market, forts, reputation, technologies,
        tradeState, denarii,
        executeTrade, setTradeTab, sendCaravan, establishTradeRoute, cancelTradeRoute, upgradeTradeSkill,
        lastEvents
    } = state;

    const [selectedCity, setSelectedCity] = useState<TradeCity | null>(null);
    const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
    const [tradeAmount, setTradeAmount] = useState(10);
    const [caravanCity, setCaravanCity] = useState<string>('');
    const [routeCity, setRouteCity] = useState<string>('');
    const [routeResource, setRouteResource] = useState<ResourceType | null>(null);

    const hasRoads = technologies.some(t => t.id === 'roads' && t.researched);
    const activeTab = tradeState.activeTab;

    const handleTrade = () => {
        if (!selectedCity || !selectedResource) return;
        executeTrade(selectedCity.id, selectedResource, tradeAmount);
        setTradeAmount(10);
    };

    const getTradePrice = (resource: ResourceType, city: TradeCity): number => {
        const basePrice = market.prices[resource];
        const cityBonus = city.biases.includes(resource) ? 1.2 : 1.0;
        const tariffMod = 1 - city.tariff;
        const negotiationBonus = 1 + (tradeState.upgrades.negotiation * 0.05);
        return Math.floor(basePrice * tradeAmount * cityBonus * tariffMod * negotiationBonus);
    };

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Trade Hub"
                subtitle="Buy, sell, and establish trade routes across the Mediterranean"
                icon="💼"
            />

            {/* Sub-tabs */}
            <div className="grid grid-cols-4 gap-2">
                {(Object.entries(TAB_CONFIG) as [typeof activeTab, typeof TAB_CONFIG[typeof activeTab]][]).map(([id, config]) => {
                    const Icon = config.icon;
                    const isActive = activeTab === id;
                    return (
                        <motion.button
                            key={id}
                            onClick={() => setTradeTab(id)}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all ${isActive
                                ? 'bg-roman-gold/20 text-roman-gold border-2 border-roman-gold/60'
                                : 'bg-white/5 text-gray-300 hover:bg-white/10 border-2 border-transparent'
                                }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="hidden md:inline">{config.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Active Caravan Status Banner */}
            {tradeState.activeCaravan && (
                <motion.div
                    className="glass-gold rounded-xl p-4 flex items-center gap-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span className="text-3xl">🐫</span>
                    <div className="flex-1">
                        <div className="font-bold text-roman-gold">Caravan in Transit</div>
                        <div className="text-sm text-muted">
                            En route to {tradeState.activeCaravan.cityName}... Returns in {tradeState.activeCaravan.duration} season{tradeState.activeCaravan.duration > 1 ? 's' : ''}
                        </div>
                    </div>
                    <Badge variant="warning">
                        {Math.round(tradeState.activeCaravan.risk * 100)}% risk
                    </Badge>
                </motion.div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'quick' && (
                    <QuickTradeTab
                        key="quick"
                        tradeCities={tradeCities}
                        inventory={inventory}
                        market={market}
                        forts={forts}
                        reputation={reputation}
                        hasRoads={hasRoads}
                        selectedCity={selectedCity}
                        setSelectedCity={setSelectedCity}
                        selectedResource={selectedResource}
                        setSelectedResource={setSelectedResource}
                        tradeAmount={tradeAmount}
                        setTradeAmount={setTradeAmount}
                        getTradePrice={getTradePrice}
                        handleTrade={handleTrade}
                        tradeState={tradeState}
                    />
                )}
                {activeTab === 'routes' && (
                    <TradeRoutesTab
                        key="routes"
                        tradeCities={tradeCities}
                        tradeState={tradeState}
                        inventory={inventory}
                        denarii={denarii}
                        market={market}
                        routeCity={routeCity}
                        setRouteCity={setRouteCity}
                        routeResource={routeResource}
                        setRouteResource={setRouteResource}
                        establishTradeRoute={establishTradeRoute}
                        cancelTradeRoute={cancelTradeRoute}
                    />
                )}
                {activeTab === 'market' && (
                    <MarketIntelTab
                        key="market"
                        tradeCities={tradeCities}
                        inventory={inventory}
                        market={market}
                        tradeState={tradeState}
                    />
                )}
                {activeTab === 'caravans' && (
                    <CaravansTab
                        key="caravans"
                        tradeCities={tradeCities}
                        tradeState={tradeState}
                        denarii={denarii}
                        inventory={inventory}
                        caravanCity={caravanCity}
                        setCaravanCity={setCaravanCity}
                        sendCaravan={sendCaravan}
                        upgradeTradeSkill={upgradeTradeSkill}
                        forts={forts}
                        reputation={reputation}
                        hasRoads={hasRoads}
                    />
                )}
            </AnimatePresence>

            {/* Last Trade Event */}
            {lastEvents.length > 0 && (lastEvents[0].includes('Sold') || lastEvents[0].includes('Caravan') || lastEvents[0].includes('route')) && (
                <motion.div
                    className="glass-gold rounded-xl p-4 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <span className="text-roman-gold">{lastEvents[0]}</span>
                </motion.div>
            )}
        </div>
    );
}

// === QUICK TRADE TAB ===
function QuickTradeTab({
    tradeCities, inventory, market, forts, reputation, hasRoads,
    selectedCity, setSelectedCity, selectedResource, setSelectedResource,
    tradeAmount, setTradeAmount, getTradePrice, handleTrade, tradeState
}: QuickTradeTabProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <GlassCard className="p-4">
                <h3 className="text-lg font-bold text-roman-gold mb-2">
                    Sell goods to cities for immediate profit. Prices vary by city specialty and your reputation.
                </h3>
            </GlassCard>

            {/* Market Prices */}
            <GlassCard className="p-3 md:p-4">
                <h3 className="text-base md:text-lg font-bold text-roman-gold mb-3">📊 Market Prices</h3>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {tradableResources.map(resource => (
                        <div
                            key={resource}
                            className="glass-dark rounded-lg p-2 md:p-3 text-center cursor-pointer hover:border-roman-gold/50 transition-all min-h-[52px] flex flex-col items-center justify-center"
                            onClick={() => setSelectedResource(resource)}
                        >
                            <div className="text-lg md:text-xl">{RESOURCE_INFO[resource].emoji}</div>
                            <div className="text-[10px] md:text-xs font-mono text-roman-gold">{market.prices[resource]}g</div>
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Trade Cities */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tradeCities.map((city: TradeCity, idx: number) => {
                    const risk = calculateTradeRisk(city.distance, city.risk, forts, hasRoads, reputation);
                    const isSelected = selectedCity?.id === city.id;
                    const cityRep = tradeState.cityReputation[city.id] || 0;

                    return (
                        <motion.div
                            key={city.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <GlassCard
                                variant={isSelected ? 'gold' : 'default'}
                                className={`p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-roman-gold' : ''}`}
                                onClick={() => setSelectedCity(city)}
                                hover={true}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-roman-gold">{city.name}</h4>
                                    <Badge variant={risk.risk < 0.1 ? 'success' : risk.risk < 0.2 ? 'warning' : 'danger'} size="sm">
                                        {Math.round(risk.risk * 100)}% risk
                                    </Badge>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted">Distance</span>
                                        <span>{city.distance} miles</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Tariff</span>
                                        <span className="text-red-400">{Math.round(city.tariff * 100)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted">Reputation</span>
                                        <span className="text-roman-gold">{cityRep >= 0 ? '+' : ''}{cityRep}</span>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <div className="text-xs text-muted mb-1">Preferred Goods:</div>
                                    <div className="flex gap-1">
                                        {city.biases.map((res: ResourceType) => (
                                            <span key={res} className="text-lg" title={RESOURCE_INFO[res]?.name}>
                                                {RESOURCE_INFO[res]?.emoji}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>

            {/* Trade Form */}
            <AnimatePresence>
                {selectedCity && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <GlassCard variant="gold" className="p-6">
                            <h3 className="text-xl font-bold text-roman-gold mb-4">
                                Trade with {selectedCity.name}
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Resource Selection */}
                                <div>
                                    <label className="block text-sm text-muted mb-2">Select Resource to Sell</label>
                                    <div className="grid grid-cols-5 md:grid-cols-5 gap-2">
                                        {tradableResources.map(resource => {
                                            const owned = inventory[resource] || 0;
                                            const isResourceSelected = selectedResource === resource;

                                            return (
                                                <motion.button
                                                    key={resource}
                                                    className={`p-2 md:p-3 rounded-xl text-center transition-all min-h-[48px] ${isResourceSelected
                                                        ? 'glass-gold border-roman-gold'
                                                        : 'glass-dark hover:border-white/30'
                                                        } ${owned === 0 ? 'opacity-50' : ''}`}
                                                    onClick={() => owned > 0 && setSelectedResource(resource)}
                                                    disabled={owned === 0}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <div className="text-lg">{RESOURCE_INFO[resource].emoji}</div>
                                                    <div className="text-[10px] md:text-xs text-muted">{owned}</div>
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Amount & Execute */}
                                <div>
                                    {selectedResource && (
                                        <>
                                            <label className="block text-sm text-muted mb-2">Amount</label>
                                            <div className="flex items-center gap-3 mb-4">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max={Math.min(inventory[selectedResource] || 0, 100)}
                                                    value={tradeAmount}
                                                    onChange={(e) => setTradeAmount(parseInt(e.target.value))}
                                                    className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                                     [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                                     [&::-webkit-slider-thumb]:bg-roman-gold"
                                                />
                                                <span className="font-mono text-lg w-12 text-right">{tradeAmount}</span>
                                            </div>

                                            <div className="glass-dark rounded-xl p-4 mb-4">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-muted">You sell</span>
                                                    <span>{tradeAmount}x {RESOURCE_INFO[selectedResource as ResourceType].emoji}</span>
                                                </div>
                                                <div className="flex justify-between text-lg font-bold">
                                                    <span className="text-muted">You receive</span>
                                                    <span className="text-roman-gold">
                                                        {getTradePrice(selectedResource, selectedCity)} denarii
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                variant="roman"
                                                className="w-full"
                                                onClick={handleTrade}
                                                disabled={tradeAmount > (inventory[selectedResource as ResourceType] || 0)}
                                            >
                                                Execute Trade
                                            </Button>
                                        </>
                                    )}

                                    {!selectedResource && (
                                        <div className="text-center text-muted py-8">
                                            Select a resource to trade
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// === TRADE ROUTES TAB ===
function TradeRoutesTab({
    tradeCities, tradeState, inventory, denarii, market,
    routeCity, setRouteCity, routeResource, setRouteResource,
    establishTradeRoute, cancelTradeRoute
}: TradeRoutesTabProps) {
    const resourcesWithStock = tradableResources.filter(r => inventory[r] >= 5);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <GlassCard className="p-4">
                <h3 className="text-lg font-bold text-roman-gold mb-2">
                    Establish permanent trade routes for passive income. Routes require goods each season but generate steady profits.
                </h3>
            </GlassCard>

            {/* Active Routes */}
            {tradeState.routes.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-roman-gold mb-3">📦 Active Trade Routes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tradeState.routes.map((route: TradeRoute) => {
                            const city = tradeCities.find((c: TradeCity) => c.id === route.cityId);
                            return (
                                <GlassCard key={route.id} className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-bold text-roman-gold">{city?.name} ↔ Rome</div>
                                        <Badge variant="success">{route.duration} seasons left</Badge>
                                    </div>
                                    <div className="space-y-1 text-sm mb-3">
                                        <div className="flex justify-between">
                                            <span className="text-muted">Goods:</span>
                                            <span>{RESOURCE_INFO[route.resourceId as ResourceType].emoji} {route.qty}/season</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted">Income:</span>
                                            <span className="text-green-400">+{route.income}d/season</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => cancelTradeRoute(route.id)}
                                    >
                                        ❌ Cancel Route
                                    </Button>
                                </GlassCard>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Establish New Route */}
            <div>
                <h3 className="text-lg font-bold text-roman-gold mb-3">➕ Establish New Route</h3>

                {resourcesWithStock.length === 0 ? (
                    <GlassCard className="p-4 text-center text-yellow-400">
                        ⚠️ Need at least 5 units of a good to establish a route.
                    </GlassCard>
                ) : (
                    <GlassCard className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm text-muted mb-2">Select City</label>
                                <select
                                    className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white"
                                    value={routeCity}
                                    onChange={(e) => setRouteCity(e.target.value)}
                                >
                                    <option value="">Choose a city...</option>
                                    {tradeCities.map((city: TradeCity) => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-muted mb-2">Select Resource (min 5 units)</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {resourcesWithStock.map((resource: ResourceType) => (
                                        <motion.button
                                            key={resource}
                                            className={`p-2 md:p-3 rounded-xl text-center transition-all min-h-[48px] ${routeResource === resource
                                                ? 'glass-gold border-roman-gold'
                                                : 'glass-dark hover:border-white/30'
                                                }`}
                                            onClick={() => setRouteResource(resource)}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <div className="text-lg">{RESOURCE_INFO[resource].emoji}</div>
                                            <div className="text-[10px] md:text-xs text-muted">{inventory[resource]}</div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {routeCity && routeResource && (
                            <motion.div
                                className="mt-6 glass-dark rounded-xl p-4"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                    <div>
                                        <span className="text-muted">Cost:</span>
                                        <span className="block font-bold">500d</span>
                                    </div>
                                    <div>
                                        <span className="text-muted">Sends:</span>
                                        <span className="block font-bold">3 {RESOURCE_INFO[routeResource].name}/season</span>
                                    </div>
                                    <div>
                                        <span className="text-muted">Returns:</span>
                                        <span className="block font-bold text-green-400">
                                            ~{Math.floor(market.prices[routeResource] * 3 * 0.8)}d/season
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted">Duration:</span>
                                        <span className="block font-bold">10 seasons</span>
                                    </div>
                                </div>

                                <Button
                                    variant="roman"
                                    className="w-full"
                                    onClick={() => {
                                        establishTradeRoute(routeCity, routeResource);
                                        setRouteCity('');
                                        setRouteResource(null);
                                    }}
                                    disabled={denarii < 500}
                                >
                                    Establish Route (500d)
                                </Button>
                            </motion.div>
                        )}
                    </GlassCard>
                )}
            </div>
        </motion.div>
    );
}

// === MARKET INTEL TAB ===
function MarketIntelTab({ tradeCities, inventory, market, tradeState }: MarketIntelTabProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <GlassCard className="p-4">
                <h3 className="text-lg font-bold text-roman-gold mb-2">
                    Track market prices, demand trends, and commodity information across all cities.
                </h3>
            </GlassCard>

            {/* Price Comparison Table */}
            <GlassCard className="p-4 overflow-x-auto">
                <h3 className="text-lg font-bold text-roman-gold mb-3">📊 Price Comparison</h3>
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-white/20">
                            <th className="text-left p-2">Good</th>
                            {tradeCities.map((city: TradeCity) => (
                                <th key={city.id} className="text-center p-2">{city.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tradableResources.map((resource: ResourceType) => (
                            <tr key={resource} className="border-b border-white/10">
                                <td className="p-2">
                                    {RESOURCE_INFO[resource].emoji} {RESOURCE_INFO[resource].name}
                                </td>
                                {tradeCities.map((city: TradeCity) => {
                                    const basePrice = market.prices[resource];
                                    const cityBonus = city.biases.includes(resource) ? 1.2 : 1.0;
                                    const tariffMod = 1 - city.tariff;
                                    const negotiationBonus = 1 + (tradeState.upgrades.negotiation * 0.05);
                                    const price = Math.floor(basePrice * cityBonus * tariffMod * negotiationBonus);
                                    const isSpecialty = city.biases.includes(resource);

                                    return (
                                        <td
                                            key={city.id}
                                            className={`text-center p-2 ${isSpecialty ? 'bg-roman-gold/20 font-bold text-roman-gold' : ''}`}
                                        >
                                            {price}d{isSpecialty ? ' ⭐' : ''}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </GlassCard>

            {/* Inventory Overview */}
            <div>
                <h3 className="text-lg font-bold text-roman-gold mb-3">📦 Your Inventory</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {tradableResources.filter(r => inventory[r] > 0).map((resource: ResourceType) => {
                        const avgPrice = Math.floor(
                            tradeCities.reduce((sum: number, c: TradeCity) => {
                                const basePrice = market.prices[resource];
                                const cityBonus = c.biases.includes(resource) ? 1.2 : 1.0;
                                return sum + (basePrice * cityBonus);
                            }, 0) / tradeCities.length
                        );
                        const totalValue = avgPrice * inventory[resource];

                        return (
                            <GlassCard key={resource} className="p-4 text-center">
                                <div className="text-3xl mb-2">{RESOURCE_INFO[resource].emoji}</div>
                                <div className="font-bold">{RESOURCE_INFO[resource].name}</div>
                                <div className="text-sm text-muted">Qty: {inventory[resource]}</div>
                                <div className="text-xs text-muted">Avg: {avgPrice}d</div>
                                <div className="text-sm font-bold text-roman-gold">Total: {totalValue}d</div>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}

// === CARAVANS TAB ===
function CaravansTab({
    tradeCities, tradeState, denarii, inventory, caravanCity, setCaravanCity, sendCaravan, upgradeTradeSkill,
    forts, reputation, hasRoads
}: CaravansTabProps) {
    const hasGoods = tradableResources.some(r => inventory[r] > 0);

    // Calculate goods value for forecast
    const goodsValue = useMemo(() => {
        return tradableResources.reduce((total, r) => {
            return total + (inventory[r] || 0) * 10; // Approximate value
        }, 0);
    }, [inventory]);

    // Get selected city for forecast
    const selectedCity = tradeCities.find((c: TradeCity) => c.id === caravanCity);

    // Run caravan simulations for each type when city is selected
    const forecasts = useMemo<Record<CaravanType, CaravanSimulationResult | null>>(() => {
        if (!selectedCity || goodsValue === 0) {
            return { safe: null, standard: null, risky: null, luxury: null };
        }

        const results: Record<CaravanType, CaravanSimulationResult | null> = {
            safe: null, standard: null, risky: null, luxury: null
        };

        for (const config of CARAVAN_CONFIGS) {
            results[config.id] = simulateCaravan({
                distance: selectedCity.distance,
                baseRisk: config.risk,
                guardLevel: tradeState.upgrades.guards,
                wagonLevel: tradeState.upgrades.wagons,
                reputation: reputation || 0,
                forts: forts || 0,
                hasRoadsTech: hasRoads || false,
                goodsValue: goodsValue * config.reward,
                cityBias: selectedCity.biases.length > 0 ? 1.15 : 1.0,
            });
        }

        return results;
    }, [selectedCity, goodsValue, tradeState.upgrades, reputation, forts, hasRoads]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <GlassCard className="p-4">
                <h3 className="text-lg font-bold text-roman-gold mb-2">
                    Send specialized caravans on trading expeditions. Higher risks mean higher rewards!
                </h3>
                {selectedCity && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-amber-400/80">
                        <TrendingUp className="w-4 h-4" />
                        <span>Monte Carlo forecasts show expected outcomes for {selectedCity.name}</span>
                    </div>
                )}
            </GlassCard>

            {/* Trade Upgrades */}
            <div>
                <h3 className="text-lg font-bold text-roman-gold mb-3">⬆️ Trade Upgrades</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'guards' as const, name: 'Caravan Guards', icon: Shield, desc: '-10% risk per level' },
                        { id: 'wagons' as const, name: 'Trade Wagons', icon: Truck, desc: '+2 goods capacity per level' },
                        { id: 'negotiation' as const, name: 'Negotiation', icon: ArrowRightLeft, desc: '+5% prices per level' },
                    ].map((upgrade) => {
                        const level = tradeState.upgrades[upgrade.id];
                        const cost = (level + 1) * 200;
                        const maxed = level >= 3;
                        const Icon = upgrade.icon;

                        return (
                            <GlassCard key={upgrade.id} className="p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon className="w-6 h-6 text-roman-gold" />
                                    <div>
                                        <div className="font-bold">{upgrade.name}</div>
                                        <div className="text-xs text-muted">{upgrade.desc}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    {[0, 1, 2].map(i => (
                                        <div
                                            key={i}
                                            className={`h-2 flex-1 rounded-full ${i < level ? 'bg-roman-gold' : 'bg-white/20'}`}
                                        />
                                    ))}
                                </div>
                                <Button
                                    variant={maxed ? 'ghost' : 'roman'}
                                    size="sm"
                                    className="w-full"
                                    onClick={() => upgradeTradeSkill(upgrade.id)}
                                    disabled={maxed || denarii < cost}
                                >
                                    {maxed ? 'Maxed' : `Upgrade (${cost}d)`}
                                </Button>
                            </GlassCard>
                        );
                    })}
                </div>
            </div>

            {/* Caravan Status or Options */}
            {tradeState.activeCaravan ? (
                <GlassCard className="p-6 text-center">
                    <div className="text-4xl mb-3">🐫</div>
                    <div className="text-xl font-bold text-roman-gold mb-2">Caravan in Transit</div>
                    <div className="text-muted mb-4">
                        Your caravan is en route to {tradeState.activeCaravan.cityName}.
                        <br />Returns in {tradeState.activeCaravan.duration} season{tradeState.activeCaravan.duration > 1 ? 's' : ''}.
                    </div>
                    <div className="flex justify-center gap-4 text-sm">
                        <div className="glass-dark px-4 py-2 rounded-lg">
                            <span className="text-muted">Risk:</span> {Math.round(tradeState.activeCaravan.risk * 100)}%
                        </div>
                        <div className="glass-dark px-4 py-2 rounded-lg">
                            <span className="text-muted">Reward:</span> +{Math.round((tradeState.activeCaravan.reward - 1) * 100)}%
                        </div>
                        <div className="glass-dark px-4 py-2 rounded-lg">
                            <span className="text-muted">Goods:</span> {tradeState.activeCaravan.goods.length} types
                        </div>
                    </div>
                </GlassCard>
            ) : !hasGoods ? (
                <GlassCard className="p-4 text-center text-yellow-400">
                    ⚠️ No goods to send with caravans. Produce or acquire resources first.
                </GlassCard>
            ) : (
                <div>
                    <h3 className="text-lg font-bold text-roman-gold mb-3">🐫 Send a Caravan</h3>

                    {/* City Selection (shared across all caravan types) */}
                    <div className="mb-4">
                        <label className="text-sm text-muted block mb-2">Select Destination City</label>
                        <select
                            className="w-full bg-white/5 border border-white/20 rounded-lg p-3 text-white"
                            value={caravanCity}
                            onChange={(e) => setCaravanCity(e.target.value)}
                        >
                            <option value="">Select City...</option>
                            {tradeCities.map((city: TradeCity) => (
                                <option key={city.id} value={city.id}>
                                    {city.name} (Distance: {city.distance}, Tariff: {Math.round(city.tariff * 100)}%)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CARAVAN_CONFIGS.map((config) => {
                            const canAfford = denarii >= config.cost;
                            const forecast = forecasts[config.id];

                            // Risk level colors
                            const riskColors: Record<string, string> = {
                                safe: 'text-green-400 border-green-500/30',
                                moderate: 'text-amber-400 border-amber-500/30',
                                risky: 'text-orange-400 border-orange-500/30',
                                dangerous: 'text-red-400 border-red-500/30',
                            };

                            return (
                                <GlassCard key={config.id} className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="text-3xl">{config.icon}</div>
                                        <div className="flex-1">
                                            <div className="font-bold text-lg">{config.name}</div>
                                            <div className="text-sm text-muted">{config.description}</div>
                                        </div>
                                        {forecast && (
                                            <div className={`text-xs px-2 py-1 rounded border ${riskColors[forecast.riskLevel]}`}>
                                                {forecast.riskLevel.charAt(0).toUpperCase() + forecast.riskLevel.slice(1)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                        <div className="glass-dark p-2 rounded-lg">
                                            <span className="text-muted">Base Risk:</span> {Math.round(config.risk * 100)}%
                                        </div>
                                        <div className="glass-dark p-2 rounded-lg">
                                            <span className="text-muted">Reward:</span> +{Math.round((config.reward - 1) * 100)}%
                                        </div>
                                        <div className="glass-dark p-2 rounded-lg">
                                            <span className="text-muted">Duration:</span> {config.duration} seasons
                                        </div>
                                        <div className="glass-dark p-2 rounded-lg">
                                            <span className="text-muted">Cost:</span> {config.cost}d
                                        </div>
                                    </div>

                                    {/* Monte Carlo Forecast */}
                                    {forecast && selectedCity && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mb-3 space-y-2"
                                        >
                                            <div className="text-xs text-amber-400/70 flex items-center gap-1">
                                                <TrendingUp className="w-3 h-3" />
                                                Forecast to {selectedCity.name}
                                            </div>

                                            {/* Success Rate */}
                                            <div className="bg-black/20 rounded p-2">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-400">Success Rate</span>
                                                    <span className="text-green-400 font-medium">
                                                        {Math.round(forecast.successRate.p50 * 100)}%
                                                    </span>
                                                </div>
                                                <DistributionBar
                                                    distribution={forecast.successRate}
                                                    colorScheme="green"
                                                    showLabels={false}
                                                    height={16}
                                                />
                                            </div>

                                            {/* Expected Profit */}
                                            <div className="bg-black/20 rounded p-2">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-400">Expected Profit</span>
                                                    <span className="text-amber-400 font-medium">
                                                        {forecast.profit.p10}d - {forecast.profit.p90}d
                                                    </span>
                                                </div>
                                                <DistributionBar
                                                    distribution={forecast.profit}
                                                    colorScheme="gold"
                                                    showLabels={false}
                                                    height={16}
                                                />
                                            </div>

                                            {/* Expected Value */}
                                            <div className="flex justify-between text-xs">
                                                <span className="text-gray-400">Risk-Adjusted Return:</span>
                                                <span className={forecast.expectedValue > 0 ? 'text-green-400' : 'text-red-400'}>
                                                    {forecast.expectedValue > 0 ? '+' : ''}{forecast.expectedValue}d
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}

                                    <Button
                                        variant="roman"
                                        className="w-full"
                                        onClick={() => {
                                            if (caravanCity) {
                                                sendCaravan(config.id, caravanCity);
                                                setCaravanCity('');
                                            }
                                        }}
                                        disabled={!canAfford || !caravanCity}
                                    >
                                        Send Caravan ({config.cost}d)
                                    </Button>
                                </GlassCard>
                            );
                        })}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
