'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Button } from '@/components/ui';
import { CARAVAN_CONFIGS } from '@/store/gameStore';
import { simulateCaravan } from '@/core/math/monteCarlo';
import { DistributionBar } from '@/components/ui/BellCurve';
import type { ResourceType, TradeCity, CaravanType, TradeState } from '@/core/types';
import type { CaravanSimulationResult } from '@/core/types/probability';
import { Package, Shield, Truck, ArrowRightLeft, TrendingUp, Zap, Gem, AlertTriangle, type LucideIcon } from 'lucide-react';
import { tradableResources } from './types';

// Mapping caravan icon identifiers to Lucide components
const CARAVAN_ICON_MAP: Record<string, LucideIcon> = {
    shield: Shield,
    package: Package,
    zap: Zap,
    gem: Gem,
};

interface TradeUpgradesProps {
    tradeState: TradeState;
    denarii: number;
    upgradeTradeSkill: (skill: 'guards' | 'wagons' | 'negotiation') => void;
}

export function TradeUpgrades({ tradeState, denarii, upgradeTradeSkill }: TradeUpgradesProps) {
    const upgrades = [
        { id: 'guards' as const, name: 'Caravan Guards', icon: Shield, desc: '-10% risk per level' },
        { id: 'wagons' as const, name: 'Trade Wagons', icon: Truck, desc: '+2 goods capacity per level' },
        { id: 'negotiation' as const, name: 'Negotiation', icon: ArrowRightLeft, desc: '+5% prices per level' },
    ];

    return (
        <div>
            <h3 className="text-lg font-bold text-roman-gold mb-3 flex items-center gap-2">
                <TrendingUp size={20} /> Trade Upgrades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upgrades.map((upgrade) => {
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
    );
}

interface ActiveCaravanDisplayProps {
    activeCaravan: TradeState['activeCaravan'];
}

export function ActiveCaravanDisplay({ activeCaravan }: ActiveCaravanDisplayProps) {
    if (!activeCaravan) return null;

    return (
        <GlassCard className="p-6 text-center">
            <Truck size={48} className="text-roman-gold mx-auto mb-3" />
            <div className="text-xl font-bold text-roman-gold mb-2">Caravan in Transit</div>
            <div className="text-muted mb-4">
                Your caravan is en route to {activeCaravan.cityName}.
                <br />Returns in {activeCaravan.duration} season{activeCaravan.duration > 1 ? 's' : ''}.
            </div>
            <div className="flex justify-center gap-4 text-sm">
                <div className="glass-dark px-4 py-2 rounded-lg">
                    <span className="text-muted">Risk:</span> {Math.round(activeCaravan.risk * 100)}%
                </div>
                <div className="glass-dark px-4 py-2 rounded-lg">
                    <span className="text-muted">Reward:</span> +{Math.round((activeCaravan.reward - 1) * 100)}%
                </div>
                <div className="glass-dark px-4 py-2 rounded-lg">
                    <span className="text-muted">Goods:</span> {activeCaravan.goods.length} types
                </div>
            </div>
        </GlassCard>
    );
}

interface CaravanSendFormProps {
    tradeCities: TradeCity[];
    tradeState: TradeState;
    denarii: number;
    inventory: Record<ResourceType, number>;
    caravanCity: string;
    setCaravanCity: (city: string) => void;
    sendCaravan: (type: CaravanType, cityId: string) => void;
    forts: number;
    reputation: number;
    hasRoads: boolean;
}

export function CaravanSendForm({
    tradeCities,
    tradeState,
    denarii,
    inventory,
    caravanCity,
    setCaravanCity,
    sendCaravan,
    forts,
    reputation,
    hasRoads
}: CaravanSendFormProps) {
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

    if (!hasGoods) {
        return (
            <GlassCard className="p-4 text-center text-yellow-400">
                <AlertTriangle size={18} className="inline mr-1" /> No goods to send with caravans. Produce or acquire resources first.
            </GlassCard>
        );
    }

    // Risk level colors
    const riskColors: Record<string, string> = {
        safe: 'text-green-400 border-green-500/30',
        moderate: 'text-amber-400 border-amber-500/30',
        risky: 'text-orange-400 border-orange-500/30',
        dangerous: 'text-red-400 border-red-500/30',
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-roman-gold mb-3 flex items-center gap-2">
                <Truck size={20} /> Send a Caravan
            </h3>

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

                    return (
                        <GlassCard key={config.id} className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                                {(() => {
                                    const CaravanIcon = CARAVAN_ICON_MAP[config.icon] || Package;
                                    return <CaravanIcon size={32} className="text-roman-gold" />;
                                })()}
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
                                className="w-full min-h-[44px]"
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
    );
}
