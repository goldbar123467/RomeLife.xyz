'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui';
import { RESOURCE_INFO } from '@/core/constants';
import type { ResourceType, MarketState, TradeCity, TradeState } from '@/core/types';
import { Package, TrendingUp, TrendingDown, Gem, Star, Users, AlertTriangle, X, BarChart3, type LucideIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RESOURCE_ICONS } from '@/components/ui/icons';
import { tradableResources } from './types';

interface TradePriceChartProps {
    market: MarketState;
}

export function TradePriceChart({ market }: TradePriceChartProps) {
    const [selectedChartResource, setSelectedChartResource] = useState<ResourceType>('grain');

    // Prepare chart data for the selected resource
    const chartData = useMemo(() => {
        if (!market.priceHistory || market.priceHistory.length === 0) {
            return [{ season: 'Now', price: market.prices[selectedChartResource] }];
        }
        return market.priceHistory.map((entry) => ({
            season: `R${entry.round}${entry.season.charAt(0).toUpperCase()}`,
            price: entry.prices[selectedChartResource] || 0,
        }));
    }, [market.priceHistory, market.prices, selectedChartResource]);

    if (!market.priceHistory || market.priceHistory.length <= 1) {
        return null;
    }

    return (
        <GlassCard className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                <h3 className="text-lg font-bold text-roman-gold flex items-center gap-2">
                    <TrendingUp size={20} /> Price History
                </h3>
                <div className="flex flex-wrap gap-1">
                    {tradableResources.slice(0, 6).map(resource => {
                        const ResIcon = RESOURCE_ICONS[resource] || Package;
                        const isSelected = selectedChartResource === resource;
                        return (
                            <motion.button
                                key={resource}
                                onClick={() => setSelectedChartResource(resource)}
                                className={`p-1.5 md:p-2 rounded-lg transition-all ${
                                    isSelected
                                        ? 'glass-gold border border-roman-gold'
                                        : 'glass-dark hover:border-white/30'
                                }`}
                                whileTap={{ scale: 0.95 }}
                                title={RESOURCE_INFO[resource].name}
                            >
                                <ResIcon size={16} className={isSelected ? 'text-roman-gold' : 'text-gray-400'} />
                            </motion.button>
                        );
                    })}
                </div>
            </div>
            <div className="h-48 md:h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <defs>
                            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#F0C14B" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#F0C14B" stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" strokeOpacity={0.5} />
                        <XAxis
                            dataKey="season"
                            tick={{ fill: '#6B7280', fontSize: 11 }}
                            axisLine={{ stroke: '#1A1A1A' }}
                        />
                        <YAxis
                            tick={{ fill: '#6B7280', fontSize: 11 }}
                            axisLine={{ stroke: '#1A1A1A' }}
                            tickFormatter={(value) => `${value}d`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(8, 8, 8, 0.95)',
                                border: '1px solid rgba(240, 193, 75, 0.3)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                            }}
                            labelStyle={{ color: '#F0C14B', fontWeight: 600 }}
                            formatter={(value) => [`${value} denarii`, RESOURCE_INFO[selectedChartResource].name]}
                        />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#F0C14B"
                            strokeWidth={2}
                            dot={{ fill: '#F0C14B', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, fill: '#FFD700' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-muted text-center">
                Showing price history for {RESOURCE_INFO[selectedChartResource].name} (last {chartData.length} seasons)
            </div>
        </GlassCard>
    );
}

interface MarketDealsGridProps {
    market: MarketState;
    inventory: Record<ResourceType, number>;
}

export function MarketDealsGrid({ market, inventory }: MarketDealsGridProps) {
    // Calculate historical average for deal quality indicator
    const getHistoricalAverage = (resource: ResourceType): number => {
        if (!market.priceHistory || market.priceHistory.length < 2) {
            return market.prices[resource];
        }
        const sum = market.priceHistory.reduce((acc, entry) => acc + (entry.prices[resource] || 0), 0);
        return Math.floor(sum / market.priceHistory.length);
    };

    // Determine price trend (rising, falling, stable)
    const getPriceTrend = (resource: ResourceType): 'rising' | 'falling' | 'stable' => {
        if (!market.priceHistory || market.priceHistory.length < 2) return 'stable';
        const recent = market.priceHistory.slice(-3);
        if (recent.length < 2) return 'stable';
        const lastPrice = recent[recent.length - 1].prices[resource];
        const prevPrice = recent[0].prices[resource];
        const change = ((lastPrice - prevPrice) / prevPrice) * 100;
        if (change > 5) return 'rising';
        if (change < -5) return 'falling';
        return 'stable';
    };

    // Determine deal quality based on comparison to historical average
    const getDealQuality = (resource: ResourceType): 'excellent' | 'good' | 'normal' | 'poor' | 'terrible' => {
        const currentPrice = market.prices[resource];
        const avgPrice = getHistoricalAverage(resource);
        const deviation = ((currentPrice - avgPrice) / avgPrice) * 100;
        // For selling: higher prices are better (positive deviation = good deal)
        if (deviation >= 20) return 'excellent';
        if (deviation >= 10) return 'good';
        if (deviation <= -20) return 'terrible';
        if (deviation <= -10) return 'poor';
        return 'normal';
    };

    // Deal quality styles
    const dealStyles: Record<string, { bg: string; border: string; badge: string; label: string }> = {
        excellent: { bg: 'bg-green-500/20', border: 'border-green-500/50', badge: 'bg-green-500', label: 'BONUM!' },
        good: { bg: 'bg-green-500/10', border: 'border-green-500/30', badge: 'bg-green-500/70', label: 'Good' },
        normal: { bg: '', border: 'border-white/10', badge: '', label: '' },
        poor: { bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500/70', label: 'Low' },
        terrible: { bg: 'bg-red-500/20', border: 'border-red-500/50', badge: 'bg-red-500', label: 'CAVEAT!' },
    };

    return (
        <GlassCard className="p-4">
            <h3 className="text-lg font-bold text-roman-gold mb-3 flex items-center gap-2">
                <Gem size={20} /> Current Market Deals
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
                {tradableResources.map(resource => {
                    const ResIcon = RESOURCE_ICONS[resource] || Package;
                    const trend = getPriceTrend(resource);
                    const dealQuality = getDealQuality(resource);
                    const currentPrice = market.prices[resource];
                    const avgPrice = getHistoricalAverage(resource);
                    const deviation = Math.round(((currentPrice - avgPrice) / avgPrice) * 100);

                    const style = dealStyles[dealQuality];
                    const hasOwnedStock = inventory[resource] > 0;

                    return (
                        <motion.div
                            key={resource}
                            className={`relative glass-dark rounded-xl p-3 border ${style.border} ${style.bg} ${
                                dealQuality === 'excellent' ? 'animate-pulse' : ''
                            }`}
                            whileHover={{ scale: 1.02 }}
                        >
                            {/* Deal Quality Badge */}
                            {style.label && (
                                <div className={`absolute -top-2 -right-2 ${style.badge} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full`}>
                                    {style.label}
                                </div>
                            )}

                            <div className="flex items-center gap-2 mb-2">
                                <ResIcon size={18} className="text-roman-gold" />
                                <span className="text-xs font-medium truncate">{RESOURCE_INFO[resource].name}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="font-mono text-lg font-bold text-roman-gold">
                                    {currentPrice}d
                                </div>
                                <div className="flex items-center gap-1">
                                    {trend === 'rising' && <TrendingUp size={14} className="text-green-400" />}
                                    {trend === 'falling' && <TrendingDown size={14} className="text-red-400" />}
                                    {trend === 'stable' && <span className="text-gray-500 text-xs">--</span>}
                                    {deviation !== 0 && (
                                        <span className={`text-xs ${deviation > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {deviation > 0 ? '+' : ''}{deviation}%
                                        </span>
                                    )}
                                </div>
                            </div>

                            {hasOwnedStock && (
                                <div className="mt-1 text-[10px] text-muted">
                                    You have: {inventory[resource]}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-3 text-xs text-muted">
                <span className="flex items-center gap-1">
                    <TrendingUp size={12} className="text-green-400" /> Rising
                </span>
                <span className="flex items-center gap-1">
                    <TrendingDown size={12} className="text-red-400" /> Falling
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500" /> BONUM! = Sell now (15%+ above avg)
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500" /> CAVEAT! = Wait (15%+ below avg)
                </span>
            </div>
        </GlassCard>
    );
}

interface MerchantRelationsProps {
    tradeCities: TradeCity[];
    tradeState: TradeState;
}

export function MerchantRelations({ tradeCities, tradeState }: MerchantRelationsProps) {
    // Get merchant mood based on city reputation
    const getMerchantMood = (cityId: string): { mood: 'hostile' | 'wary' | 'neutral' | 'friendly' | 'trusted'; icon: LucideIcon; color: string } => {
        const rep = tradeState.cityReputation[cityId] || 0;
        if (rep >= 20) return { mood: 'trusted', icon: Star, color: 'text-amber-400' };
        if (rep >= 10) return { mood: 'friendly', icon: TrendingUp, color: 'text-green-400' };
        if (rep >= -10) return { mood: 'neutral', icon: Package, color: 'text-gray-400' };
        if (rep >= -20) return { mood: 'wary', icon: AlertTriangle, color: 'text-orange-400' };
        return { mood: 'hostile', icon: X, color: 'text-red-400' };
    };

    // Merchant dialogue based on mood
    const dialogues: Record<string, string> = {
        trusted: "Ave, friend! For you, the best prices!",
        friendly: "Welcome, Roman! Good dealings today.",
        neutral: "Salve. What do you seek?",
        wary: "Hmph. Your coin is... acceptable.",
        hostile: "Romans. Make it quick.",
    };

    return (
        <GlassCard className="p-4">
            <h3 className="text-lg font-bold text-roman-gold mb-3 flex items-center gap-2">
                <Users size={20} /> Merchant Relations
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tradeCities.map((city: TradeCity) => {
                    const merchantMood = getMerchantMood(city.id);
                    const MoodIcon = merchantMood.icon;
                    const rep = tradeState.cityReputation[city.id] || 0;

                    return (
                        <motion.div
                            key={city.id}
                            className="glass-dark rounded-xl p-3"
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-sm">{city.name}</span>
                                <div className={`flex items-center gap-1 ${merchantMood.color}`}>
                                    <MoodIcon size={14} />
                                    <span className="text-xs capitalize">{merchantMood.mood}</span>
                                </div>
                            </div>

                            <div className="text-xs text-muted italic mb-2">
                                &ldquo;{dialogues[merchantMood.mood]}&rdquo;
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted">Reputation:</span>
                                <span className={`font-mono ${rep >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {rep >= 0 ? '+' : ''}{rep}
                                </span>
                            </div>

                            {/* Reputation bar */}
                            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${
                                        rep >= 10 ? 'bg-green-500' :
                                        rep >= 0 ? 'bg-amber-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, (rep + 50) / 100 * 100))}%` }}
                                />
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </GlassCard>
    );
}

interface PriceComparisonTableProps {
    tradeCities: TradeCity[];
    market: MarketState;
    tradeState: TradeState;
}

export function PriceComparisonTable({ tradeCities, market, tradeState }: PriceComparisonTableProps) {
    return (
        <GlassCard className="p-4 overflow-x-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
                <h3 className="text-lg font-bold text-roman-gold flex items-center gap-2"><BarChart3 size={20} /> Price Comparison by City</h3>
                <span className="text-xs text-amber-400/60 italic">Final sell prices (includes city bonus, tariff & negotiation)</span>
            </div>
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr className="border-b border-white/20">
                        <th className="text-left p-2">Good</th>
                        {tradeCities.map((city) => (<th key={city.id} className="text-center p-2">{city.name}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {tradableResources.map((resource) => (
                        <tr key={resource} className="border-b border-white/10">
                            <td className="p-2">{(() => { const ResIcon = RESOURCE_ICONS[resource] || Package; return <span className="flex items-center gap-1"><ResIcon size={16} className="text-roman-gold" /> {RESOURCE_INFO[resource].name}</span>; })()}</td>
                            {tradeCities.map((city) => {
                                const basePrice = market.prices[resource];
                                const cityBonus = city.biases.includes(resource) ? 1.2 : 1.0;
                                const tariffMod = 1 - city.tariff;
                                const negotiationBonus = 1 + (tradeState.upgrades.negotiation * 0.05);
                                const price = Math.floor(basePrice * cityBonus * tariffMod * negotiationBonus);
                                const isSpecialty = city.biases.includes(resource);
                                return (<td key={city.id} className={`text-center p-2 ${isSpecialty ? 'bg-roman-gold/20 font-bold text-roman-gold' : ''}`}>{price}d{isSpecialty && <Star size={12} className="inline ml-1 text-yellow-400" />}</td>);
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-3 pt-3 border-t border-white/10 text-xs text-muted"><Star size={12} className="inline text-yellow-400 mr-1" /> = City specialty (+20% bonus) | <span className="ml-2">Note: God blessings, tech bonuses & founder effects may increase actual prices</span></div>
        </GlassCard>
    );
}

interface InventoryOverviewProps {
    tradeCities: TradeCity[];
    inventory: Record<ResourceType, number>;
    market: MarketState;
}

export function InventoryOverview({ tradeCities, inventory, market }: InventoryOverviewProps) {
    const resourcesWithStock = tradableResources.filter(r => inventory[r] > 0);
    if (resourcesWithStock.length === 0) return null;

    return (
        <div>
            <h3 className="text-base md:text-lg font-bold text-roman-gold mb-3 flex items-center gap-2"><Package size={20} /> Your Inventory</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {resourcesWithStock.map((resource) => {
                    const avgPrice = Math.floor(tradeCities.reduce((sum, c) => { const bp = market.prices[resource]; const cb = c.biases.includes(resource) ? 1.2 : 1.0; return sum + (bp * cb); }, 0) / tradeCities.length);
                    const totalValue = avgPrice * inventory[resource];
                    return (
                        <GlassCard key={resource} className="p-4 text-center">
                            <div className="text-3xl mb-2 flex justify-center">{(() => { const IC = RESOURCE_ICONS[resource]; return IC ? <IC className="w-8 h-8 text-roman-gold" /> : RESOURCE_INFO[resource].name?.charAt(0); })()}</div>
                            <div className="font-bold">{RESOURCE_INFO[resource].name}</div>
                            <div className="text-sm text-muted">Qty: {inventory[resource]}</div>
                            <div className="text-xs text-muted">Avg: {avgPrice}d</div>
                            <div className="text-sm font-bold text-roman-gold">Total: {totalValue}d</div>
                        </GlassCard>
                    );
                })}
            </div>
        </div>
    );
}
