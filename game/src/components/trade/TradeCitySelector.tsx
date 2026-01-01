'use client';

import { motion } from 'framer-motion';
import { GlassCard, Badge } from '@/components/ui';
import { RESOURCE_INFO } from '@/core/constants';
import { calculateTradeRisk } from '@/core/math';
import type { ResourceType, TradeCity, TradeState } from '@/core/types';
import { Ship } from 'lucide-react';
import { RESOURCE_ICONS } from '@/components/ui/icons';
import { CITY_LORE } from './types';

interface TradeCitySelectorProps {
    tradeCities: TradeCity[];
    selectedCity: TradeCity | null;
    setSelectedCity: (city: TradeCity | null) => void;
    tradeState: TradeState;
    forts: number;
    reputation: number;
    hasRoads: boolean;
}

export function TradeCitySelector({
    tradeCities,
    selectedCity,
    setSelectedCity,
    tradeState,
    forts,
    reputation,
    hasRoads
}: TradeCitySelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tradeCities.map((city: TradeCity, idx: number) => {
                const risk = calculateTradeRisk(city.distance, city.risk, forts, hasRoads, reputation);
                const isSelected = selectedCity?.id === city.id;
                const cityRep = tradeState.cityReputation[city.id] || 0;
                const lore = CITY_LORE[city.id] || { description: 'A trading settlement.', specialty: 'Various goods' };

                return (
                    <motion.div
                        key={city.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <GlassCard
                            variant={isSelected ? 'gold' : 'default'}
                            className={`p-4 cursor-pointer transition-all min-h-[44px] ${isSelected ? 'ring-2 ring-roman-gold' : ''}`}
                            onClick={() => setSelectedCity(city)}
                            hover={true}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-roman-gold flex items-center gap-2">
                                    <Ship className="w-4 h-4" />
                                    {city.name}
                                </h4>
                                <Badge variant={risk.risk < 0.1 ? 'success' : risk.risk < 0.2 ? 'warning' : 'danger'} size="sm">
                                    {Math.round(risk.risk * 100)}% risk
                                </Badge>
                            </div>

                            {/* Historical description */}
                            <div className="text-xs text-amber-200/60 italic mb-3 leading-relaxed">
                                {lore.description}
                            </div>

                            <div className="text-[10px] text-amber-400/50 mb-3 border-l-2 border-amber-400/30 pl-2">
                                {lore.specialty}
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
                                    {city.biases.map((res: ResourceType) => {
                                        const IconComponent = RESOURCE_ICONS[res];
                                        return IconComponent ? (
                                            <span key={res} title={RESOURCE_INFO[res]?.name}>
                                                <IconComponent className="w-5 h-5 text-roman-gold" />
                                            </span>
                                        ) : (
                                            <span key={res} className="text-sm" title={RESOURCE_INFO[res]?.name}>
                                                {RESOURCE_INFO[res]?.name?.charAt(0)}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                );
            })}
        </div>
    );
}
