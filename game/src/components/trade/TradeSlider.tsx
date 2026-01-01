'use client';

import { motion } from 'framer-motion';
import { GlassCard, Button } from '@/components/ui';
import { RESOURCE_INFO } from '@/core/constants';
import type { ResourceType, TradeCity } from '@/core/types';
import { RESOURCE_ICONS } from '@/components/ui/icons';
import { tradableResources } from './types';

interface TradeSliderProps {
    tradeAmount: number;
    setTradeAmount: (amount: number) => void;
    maxAmount: number;
    minAmount?: number;
}

export function TradeSlider({
    tradeAmount,
    setTradeAmount,
    maxAmount,
    minAmount = 1
}: TradeSliderProps) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <input
                type="range"
                min={minAmount}
                max={maxAmount}
                value={tradeAmount}
                onChange={(e) => setTradeAmount(parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-roman-gold"
            />
            <span className="font-mono text-lg w-12 text-right">{tradeAmount}</span>
        </div>
    );
}

interface TradeFormProps {
    selectedCity: TradeCity;
    selectedResource: ResourceType | null;
    setSelectedResource: (resource: ResourceType | null) => void;
    inventory: Record<ResourceType, number>;
    tradeAmount: number;
    setTradeAmount: (amount: number) => void;
    getTradePrice: (resource: ResourceType, city: TradeCity) => number;
    handleTrade: () => void;
}

export function TradeForm({
    selectedCity,
    selectedResource,
    setSelectedResource,
    inventory,
    tradeAmount,
    setTradeAmount,
    getTradePrice,
    handleTrade
}: TradeFormProps) {
    return (
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
                                        <div className="text-lg flex justify-center">
                                            {(() => {
                                                const IconComp = RESOURCE_ICONS[resource];
                                                return IconComp ? <IconComp className="w-5 h-5" /> : RESOURCE_INFO[resource].name?.charAt(0);
                                            })()}
                                        </div>
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
                                <TradeSlider
                                    tradeAmount={tradeAmount}
                                    setTradeAmount={setTradeAmount}
                                    maxAmount={Math.min(inventory[selectedResource] || 0, 100)}
                                />

                                <div className="glass-dark rounded-xl p-4 mb-4">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-muted">You sell</span>
                                        <span className="flex items-center gap-1">
                                            {tradeAmount}x
                                            {(() => {
                                                const IconComp = RESOURCE_ICONS[selectedResource as ResourceType];
                                                return IconComp ? <IconComp className="w-4 h-4" /> : RESOURCE_INFO[selectedResource as ResourceType].name;
                                            })()}
                                        </span>
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
                                    className="w-full min-h-[44px]"
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
    );
}
