'use client';

import { motion } from 'framer-motion';
import { GlassCard, Badge, Button } from '@/components/ui';
import { RESOURCE_INFO } from '@/core/constants';
import type { ResourceType, TradeCity, TradeRoute, MarketState, TradeState } from '@/core/types';
import { Package, Truck, AlertTriangle, X } from 'lucide-react';
import { RESOURCE_ICONS } from '@/components/ui/icons';
import { tradableResources } from './types';

interface ActiveTradeRoutesProps {
    routes: TradeRoute[];
    tradeCities: TradeCity[];
    onCancelRoute: (routeId: string) => void;
}

export function ActiveTradeRoutes({ routes, tradeCities, onCancelRoute }: ActiveTradeRoutesProps) {
    if (routes.length === 0) return null;

    return (
        <div>
            <h3 className="text-lg font-bold text-roman-gold mb-3 flex items-center gap-2">
                <Package size={20} /> Active Trade Routes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map((route: TradeRoute) => {
                    const city = tradeCities.find((c: TradeCity) => c.id === route.cityId);
                    return (
                        <GlassCard key={route.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="font-bold text-roman-gold">{city?.name} - Rome</div>
                                <Badge variant="success">{route.duration} seasons left</Badge>
                            </div>
                            <div className="space-y-1 text-sm mb-3">
                                <div className="flex justify-between">
                                    <span className="text-muted">Goods:</span>
                                    <span className="flex items-center gap-1">
                                        {(() => {
                                            const ResIcon = RESOURCE_ICONS[route.resourceId as ResourceType] || Package;
                                            return <ResIcon size={14} className="text-roman-gold" />;
                                        })()}
                                        {route.qty}/season
                                    </span>
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
                                onClick={() => onCancelRoute(route.id)}
                            >
                                <span className="flex items-center gap-1"><X size={14} /> Cancel Route</span>
                            </Button>
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
}

interface NewRouteFormProps {
    tradeCities: TradeCity[];
    inventory: Record<ResourceType, number>;
    denarii: number;
    market: MarketState;
    tradeState: TradeState;
    routeCity: string;
    setRouteCity: (city: string) => void;
    routeResource: ResourceType | null;
    setRouteResource: (resource: ResourceType | null) => void;
    onEstablishRoute: () => void;
}

export function NewRouteForm({
    tradeCities,
    inventory,
    denarii,
    market,
    tradeState,
    routeCity,
    setRouteCity,
    routeResource,
    setRouteResource,
    onEstablishRoute
}: NewRouteFormProps) {
    const resourcesWithStock = tradableResources.filter(r => inventory[r] >= 5);

    if (resourcesWithStock.length === 0) {
        return (
            <GlassCard className="p-4 text-center text-yellow-400 flex items-center justify-center gap-2">
                <AlertTriangle size={18} /> Need at least 5 units of a good to establish a route.
            </GlassCard>
        );
    }

    return (
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
                                <div className="text-lg flex justify-center">
                                    {(() => {
                                        const IconComp = RESOURCE_ICONS[resource];
                                        return IconComp ? <IconComp className="w-5 h-5" /> : RESOURCE_INFO[resource].name?.charAt(0);
                                    })()}
                                </div>
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
                                ~{(() => {
                                    const selectedCity = tradeCities.find((c: TradeCity) => c.id === routeCity);
                                    const basePrice = market.prices[routeResource];
                                    const cityBonus = selectedCity?.biases.includes(routeResource) ? 1.2 : 1.0;
                                    const negotiationBonus = 1 + (tradeState.upgrades.negotiation * 0.05);
                                    const routeQty = 3;
                                    return Math.floor(basePrice * routeQty * cityBonus * negotiationBonus * 0.8);
                                })()}d/season
                            </span>
                        </div>
                        <div>
                            <span className="text-muted">Duration:</span>
                            <span className="block font-bold">10 seasons</span>
                        </div>
                    </div>

                    <Button
                        variant="roman"
                        className="w-full min-h-[44px]"
                        onClick={onEstablishRoute}
                        disabled={denarii < 500}
                    >
                        Establish Route (500d)
                    </Button>
                </motion.div>
            )}
        </GlassCard>
    );
}

interface TradeRoutesHeaderProps {
    hasRoutes: boolean;
}

export function TradeRoutesHeader({ hasRoutes }: TradeRoutesHeaderProps) {
    return (
        <>
            <GlassCard className="p-3 md:p-4 border-l-4 border-amber-500">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg shrink-0">
                        <Truck className="w-5 h-5 text-roman-gold" />
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-bold text-roman-gold">Trade Routes</h3>
                        <p className="text-xs md:text-sm text-muted">
                            Establish permanent trade routes for passive income. Routes require goods each season but generate steady profits.
                        </p>
                    </div>
                </div>
            </GlassCard>
            {hasRoutes && <div className="border-t border-white/10 my-2 md:my-4" />}
        </>
    );
}
