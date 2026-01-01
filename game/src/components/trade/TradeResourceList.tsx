'use client';

import { GlassCard } from '@/components/ui';
import { RESOURCE_INFO } from '@/core/constants';
import type { ResourceType, MarketState } from '@/core/types';
import { Package, BarChart3 } from 'lucide-react';
import { RESOURCE_ICONS } from '@/components/ui/icons';
import { tradableResources } from './types';

interface TradeResourceListProps {
    market: MarketState;
    selectedResource: ResourceType | null;
    setSelectedResource: (resource: ResourceType | null) => void;
    showPricesOnly?: boolean;
}

export function TradeResourceList({
    market,
    selectedResource,
    setSelectedResource,
    showPricesOnly = false
}: TradeResourceListProps) {
    if (showPricesOnly) {
        return (
            <GlassCard className="p-3 md:p-4">
                <h3 className="text-base md:text-lg font-bold text-roman-gold mb-3 flex items-center gap-2">
                    <BarChart3 size={20} /> Market Prices
                </h3>
                <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {tradableResources.map(resource => (
                        <div
                            key={resource}
                            className="glass-dark rounded-lg p-2 md:p-3 text-center cursor-pointer hover:border-roman-gold/50 transition-all min-h-[52px] flex flex-col items-center justify-center"
                            onClick={() => setSelectedResource(resource)}
                        >
                            {(() => {
                                const ResIcon = RESOURCE_ICONS[resource] || Package;
                                return <ResIcon size={24} className="text-roman-gold" />;
                            })()}
                            <div className="text-[10px] md:text-xs font-mono text-roman-gold">{market.prices[resource]}g</div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        );
    }

    return (
        <div className="grid grid-cols-5 md:grid-cols-5 gap-2">
            {tradableResources.map(resource => {
                const isResourceSelected = selectedResource === resource;

                return (
                    <div
                        key={resource}
                        className={`p-2 md:p-3 rounded-xl text-center transition-all min-h-[48px] cursor-pointer ${
                            isResourceSelected
                                ? 'glass-gold border-roman-gold'
                                : 'glass-dark hover:border-white/30'
                        }`}
                        onClick={() => setSelectedResource(resource)}
                    >
                        <div className="text-lg">
                            {(() => {
                                const IconComp = RESOURCE_ICONS[resource];
                                return IconComp ? <IconComp className="w-5 h-5" /> : RESOURCE_INFO[resource].name?.charAt(0);
                            })()}
                        </div>
                        <div className="text-[10px] md:text-xs font-mono text-roman-gold">{market.prices[resource]}g</div>
                    </div>
                );
            })}
        </div>
    );
}

interface TradeResourceSelectorProps {
    inventory: Record<ResourceType, number>;
    selectedResource: ResourceType | null;
    setSelectedResource: (resource: ResourceType | null) => void;
    minStock?: number;
}

export function TradeResourceSelector({
    inventory,
    selectedResource,
    setSelectedResource,
    minStock = 0
}: TradeResourceSelectorProps) {
    const availableResources = minStock > 0
        ? tradableResources.filter(r => inventory[r] >= minStock)
        : tradableResources;

    return (
        <div className="grid grid-cols-5 md:grid-cols-5 gap-2">
            {availableResources.map(resource => {
                const owned = inventory[resource] || 0;
                const isResourceSelected = selectedResource === resource;
                const isDisabled = minStock > 0 ? false : owned === 0;

                return (
                    <button
                        key={resource}
                        className={`p-2 md:p-3 rounded-xl text-center transition-all min-h-[48px] ${
                            isResourceSelected
                                ? 'glass-gold border-roman-gold'
                                : 'glass-dark hover:border-white/30'
                        } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => !isDisabled && setSelectedResource(resource)}
                        disabled={isDisabled}
                    >
                        <div className="text-lg flex justify-center">
                            {(() => {
                                const IconComp = RESOURCE_ICONS[resource];
                                return IconComp ? <IconComp className="w-5 h-5" /> : RESOURCE_INFO[resource].name?.charAt(0);
                            })()}
                        </div>
                        <div className="text-[10px] md:text-xs text-muted">{owned}</div>
                    </button>
                );
            })}
        </div>
    );
}
