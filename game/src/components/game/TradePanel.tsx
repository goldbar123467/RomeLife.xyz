'use client';

/**
 * TradePanel - Main orchestrator component for trade functionality
 * Refactored from 1,433 lines to ~250 lines. Sub-components in /components/trade/
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Badge, SectionHeader } from '@/components/ui';
import type { ResourceType, TradeCity } from '@/core/types';
import { Briefcase, ArrowRightLeft, Truck, BarChart3, Package, Ship } from 'lucide-react';
import { gameToast } from '@/lib/toast';

import {
    TradeCitySelector, TradeResourceList, TradeForm,
    TradePriceChart, MarketDealsGrid, MerchantRelations, PriceComparisonTable, InventoryOverview,
    TradeUpgrades, ActiveCaravanDisplay, CaravanSendForm,
    ActiveTradeRoutes, NewRouteForm, TradeRoutesHeader,
    type QuickTradeTabProps, type TradeRoutesTabProps, type MarketIntelTabProps, type CaravansTabProps
} from '@/components/trade';

const TAB_CONFIG = {
    quick: { label: 'Quick Trade', icon: ArrowRightLeft },
    routes: { label: 'Trade Routes', icon: Truck },
    market: { label: 'Market Intel', icon: BarChart3 },
    caravans: { label: 'Caravans', icon: Package },
};

export function TradePanel() {
    const { tradeCities, inventory, market, forts, reputation, technologies, tradeState, denarii,
        executeTrade, setTradeTab, sendCaravan, establishTradeRoute, cancelTradeRoute, upgradeTradeSkill, lastEvents } = useGameStore();

    const [selectedCity, setSelectedCity] = useState<TradeCity | null>(null);
    const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
    const [tradeAmount, setTradeAmount] = useState(10);
    const [caravanCity, setCaravanCity] = useState('');
    const [routeCity, setRouteCity] = useState('');
    const [routeResource, setRouteResource] = useState<ResourceType | null>(null);

    const hasRoads = technologies.some(t => t.id === 'roads' && t.researched);
    const activeTab = tradeState.activeTab;

    const handleTrade = () => {
        if (!selectedCity || !selectedResource) return;
        const totalPrice = getTradePrice(selectedResource, selectedCity);
        executeTrade(selectedCity.id, selectedResource, tradeAmount);
        gameToast.trade('Trade Complete', `Sold ${tradeAmount} ${selectedResource} for ${totalPrice} denarii`);
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
        <div className="p-3 md:p-6 space-y-4 md:space-y-6 fade-in">
            <SectionHeader title="Trade Hub" subtitle="Buy, sell, and establish trade routes across the Mediterranean" icon={<Briefcase className="w-6 h-6 text-roman-gold" />} />

            {/* Sub-tabs */}
            <div className="grid grid-cols-4 gap-1 md:gap-2">
                {(Object.entries(TAB_CONFIG) as [typeof activeTab, typeof TAB_CONFIG[typeof activeTab]][]).map(([id, config]) => {
                    const Icon = config.icon;
                    return (
                        <motion.button key={id} onClick={() => setTradeTab(id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className={`flex items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-2 md:px-4 rounded-xl font-semibold transition-all min-h-[44px] ${activeTab === id ? 'bg-roman-gold/20 text-roman-gold border-2 border-roman-gold/60' : 'bg-white/5 text-gray-300 hover:bg-white/10 border-2 border-transparent'}`}>
                            <Icon className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="hidden md:inline text-sm md:text-base">{config.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Active Caravan Banner */}
            {tradeState.activeCaravan && (
                <motion.div className="relative overflow-hidden glass-gold rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                    <motion.div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10" animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} style={{ backgroundSize: '200% 100%' }} />
                    <div className="relative flex items-center gap-2">
                        <Ship size={24} className="text-roman-gold" />
                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}><Truck size={28} className="text-roman-gold" /></motion.div>
                    </div>
                    <div className="relative flex-1">
                        <div className="font-bold text-roman-gold text-sm md:text-base">Caravan in Transit</div>
                        <div className="text-xs md:text-sm text-muted">En route to {tradeState.activeCaravan.cityName}... Returns in {tradeState.activeCaravan.duration} season{tradeState.activeCaravan.duration > 1 ? 's' : ''}</div>
                    </div>
                    <Badge variant="warning" className="relative">{Math.round(tradeState.activeCaravan.risk * 100)}% risk</Badge>
                </motion.div>
            )}

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'quick' && <QuickTradeTab key="quick" {...{ tradeCities, inventory, market, forts, reputation, hasRoads, selectedCity, setSelectedCity, selectedResource, setSelectedResource, tradeAmount, setTradeAmount, getTradePrice, handleTrade, tradeState }} />}
                {activeTab === 'routes' && <TradeRoutesTab key="routes" {...{ tradeCities, tradeState, inventory, denarii, market, routeCity, setRouteCity, routeResource, setRouteResource, establishTradeRoute, cancelTradeRoute }} />}
                {activeTab === 'market' && <MarketIntelTab key="market" {...{ tradeCities, inventory, market, tradeState }} />}
                {activeTab === 'caravans' && <CaravansTab key="caravans" {...{ tradeCities, tradeState, denarii, inventory, caravanCity, setCaravanCity, sendCaravan, upgradeTradeSkill, forts, reputation, hasRoads }} />}
            </AnimatePresence>

            {/* Last Trade Event */}
            {lastEvents.length > 0 && (lastEvents[0].includes('Sold') || lastEvents[0].includes('Caravan') || lastEvents[0].includes('route')) && (
                <motion.div className="glass-gold rounded-xl p-4 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <span className="text-roman-gold">{lastEvents[0]}</span>
                </motion.div>
            )}
        </div>
    );
}

// === TAB COMPONENTS ===

function QuickTradeTab(props: QuickTradeTabProps) {
    const { tradeCities, inventory, market, forts, reputation, hasRoads, selectedCity, setSelectedCity, selectedResource, setSelectedResource, tradeAmount, setTradeAmount, getTradePrice, handleTrade, tradeState } = props;
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 md:space-y-6">
            <GlassCard className="p-3 md:p-4 border-l-4 border-amber-500">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg shrink-0"><ArrowRightLeft className="w-5 h-5 text-roman-gold" /></div>
                    <div><h3 className="text-base md:text-lg font-bold text-roman-gold">Quick Trade</h3><p className="text-xs md:text-sm text-muted">Sell goods to cities for immediate profit. Prices vary by city specialty and your reputation.</p></div>
                </div>
            </GlassCard>
            <TradeResourceList market={market} selectedResource={selectedResource} setSelectedResource={setSelectedResource} showPricesOnly />
            <TradeCitySelector tradeCities={tradeCities} selectedCity={selectedCity} setSelectedCity={setSelectedCity} tradeState={tradeState} forts={forts} reputation={reputation} hasRoads={hasRoads} />
            <div className="border-t border-white/10 my-2 md:my-4" />
            <AnimatePresence>{selectedCity && <TradeForm selectedCity={selectedCity} selectedResource={selectedResource} setSelectedResource={setSelectedResource} inventory={inventory} tradeAmount={tradeAmount} setTradeAmount={setTradeAmount} getTradePrice={getTradePrice} handleTrade={handleTrade} />}</AnimatePresence>
        </motion.div>
    );
}

function TradeRoutesTab(props: TradeRoutesTabProps) {
    const { tradeCities, tradeState, inventory, denarii, market, routeCity, setRouteCity, routeResource, setRouteResource, establishTradeRoute, cancelTradeRoute } = props;
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 md:space-y-6">
            <TradeRoutesHeader hasRoutes={tradeState.routes.length > 0} />
            <ActiveTradeRoutes routes={tradeState.routes} tradeCities={tradeCities} onCancelRoute={cancelTradeRoute} />
            {tradeState.routes.length > 0 && <div className="border-t border-white/10 my-2 md:my-4" />}
            <div>
                <h3 className="text-base md:text-lg font-bold text-roman-gold mb-3 flex items-center gap-2"><Package size={20} /> Establish New Route</h3>
                <NewRouteForm tradeCities={tradeCities} inventory={inventory} denarii={denarii} market={market} tradeState={tradeState} routeCity={routeCity} setRouteCity={setRouteCity} routeResource={routeResource} setRouteResource={setRouteResource} onEstablishRoute={() => { establishTradeRoute(routeCity, routeResource!); setRouteCity(''); setRouteResource(null); }} />
            </div>
        </motion.div>
    );
}

function MarketIntelTab(props: MarketIntelTabProps) {
    const { tradeCities, inventory, market, tradeState } = props;
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 md:space-y-6">
            <GlassCard className="p-3 md:p-4 border-l-4 border-amber-500">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg shrink-0"><BarChart3 className="w-5 h-5 text-roman-gold" /></div>
                    <div><h3 className="text-base md:text-lg font-bold text-roman-gold">Market Intelligence</h3><p className="text-xs md:text-sm text-muted">Track market prices, demand trends, and commodity information across all cities.</p></div>
                </div>
            </GlassCard>
            <TradePriceChart market={market} />
            <MarketDealsGrid market={market} inventory={inventory} />
            <MerchantRelations tradeCities={tradeCities} tradeState={tradeState} />
            <div className="border-t border-white/10 my-2 md:my-4" />
            <PriceComparisonTable tradeCities={tradeCities} market={market} tradeState={tradeState} />
            <div className="border-t border-white/10 my-2 md:my-4" />
            <InventoryOverview tradeCities={tradeCities} inventory={inventory} market={market} />
        </motion.div>
    );
}

function CaravansTab(props: CaravansTabProps) {
    const { tradeCities, tradeState, denarii, inventory, caravanCity, setCaravanCity, sendCaravan, upgradeTradeSkill, forts, reputation, hasRoads } = props;
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 md:space-y-6">
            <GlassCard className="p-3 md:p-4 border-l-4 border-amber-500">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg shrink-0"><Package className="w-5 h-5 text-roman-gold" /></div>
                    <div><h3 className="text-base md:text-lg font-bold text-roman-gold">Caravans</h3><p className="text-xs md:text-sm text-muted">Send specialized caravans on trading expeditions. Higher risks mean higher rewards!</p></div>
                </div>
            </GlassCard>
            <TradeUpgrades tradeState={tradeState} denarii={denarii} upgradeTradeSkill={upgradeTradeSkill} />
            <div className="border-t border-white/10 my-2 md:my-4" />
            {tradeState.activeCaravan ? <ActiveCaravanDisplay activeCaravan={tradeState.activeCaravan} /> : <CaravanSendForm tradeCities={tradeCities} tradeState={tradeState} denarii={denarii} inventory={inventory} caravanCity={caravanCity} setCaravanCity={setCaravanCity} sendCaravan={sendCaravan} forts={forts} reputation={reputation} hasRoads={hasRoads} />}
        </motion.div>
    );
}
