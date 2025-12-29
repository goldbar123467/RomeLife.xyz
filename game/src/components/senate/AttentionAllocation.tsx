'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, RotateCcw } from 'lucide-react';
import type { SenatorId, AttentionAllocation as AttentionAllocationType } from '@/core/types/senate';
import { SENATORS } from '@/core/constants/senate';
import { Button } from '@/components/ui';

interface AttentionAllocationProps {
    currentAllocation: AttentionAllocationType | null;
    locked: boolean;
    onAllocate: (allocation: AttentionAllocationType) => void;
    round: number;
}

const SENATOR_ORDER: SenatorId[] = ['sertorius', 'sulla', 'clodius', 'pulcher', 'oppius'];

const PRESETS = [
    { name: 'Balanced', values: { sertorius: 20, sulla: 20, clodius: 20, pulcher: 20, oppius: 20 } },
    { name: 'Military', values: { sertorius: 35, sulla: 35, clodius: 10, pulcher: 10, oppius: 10 } },
    { name: 'Political', values: { sertorius: 15, sulla: 15, clodius: 30, pulcher: 25, oppius: 15 } },
    { name: 'Religious', values: { sertorius: 15, sulla: 10, clodius: 15, pulcher: 45, oppius: 15 } },
];

export function AttentionAllocation({ currentAllocation, locked, onAllocate, round }: AttentionAllocationProps) {
    const [allocation, setAllocation] = useState<AttentionAllocationType>(
        currentAllocation || { sertorius: 20, sulla: 20, clodius: 20, pulcher: 20, oppius: 20 }
    );

    // Sync with prop changes
    useEffect(() => {
        if (currentAllocation) {
            setAllocation(currentAllocation);
        }
    }, [currentAllocation]);

    const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
    const isValid = total === 100;

    const handleSliderChange = (senatorId: SenatorId, newValue: number) => {
        if (locked) return;

        const oldValue = allocation[senatorId];
        const diff = newValue - oldValue;

        // Find senators that can absorb the change
        const others = SENATOR_ORDER.filter(id => id !== senatorId);
        const otherTotal = others.reduce((sum, id) => sum + allocation[id], 0);

        if (otherTotal === 0 && diff > 0) return; // Can't increase if others are at 0

        // Distribute the difference proportionally among others
        const newAllocation = { ...allocation, [senatorId]: newValue };
        let remaining = -diff;

        for (const id of others) {
            const proportion = allocation[id] / otherTotal;
            let change = Math.round(remaining * proportion);

            // Clamp to valid range
            const newVal = Math.max(0, Math.min(100, allocation[id] + change));
            change = newVal - allocation[id];

            newAllocation[id] = newVal;
            remaining -= change;
        }

        // Handle any rounding errors
        if (remaining !== 0) {
            for (const id of others) {
                const newVal = newAllocation[id] + remaining;
                if (newVal >= 0 && newVal <= 100) {
                    newAllocation[id] = newVal;
                    break;
                }
            }
        }

        setAllocation(newAllocation);
    };

    const applyPreset = (preset: typeof PRESETS[0]) => {
        if (locked) return;
        setAllocation(preset.values as AttentionAllocationType);
    };

    const handleConfirm = () => {
        if (isValid && !locked) {
            onAllocate(allocation);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-roman-gold">Attention Allocation</h3>
                    <p className="text-xs text-muted">
                        Distribute 100 points among senators
                    </p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    locked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                }`}>
                    {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                        {locked ? 'Locked' : 'Unlocked'}
                    </span>
                </div>
            </div>

            {/* Presets */}
            <div className="flex gap-2 flex-wrap">
                {PRESETS.map(preset => (
                    <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        disabled={locked}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                            locked
                                ? 'border-muted/20 text-muted cursor-not-allowed'
                                : 'border-roman-gold/30 text-roman-gold hover:bg-roman-gold/10'
                        }`}
                    >
                        {preset.name}
                    </button>
                ))}
                <button
                    onClick={() => setAllocation({ sertorius: 20, sulla: 20, clodius: 20, pulcher: 20, oppius: 20 })}
                    disabled={locked}
                    className={`p-1.5 rounded-lg border transition-colors ${
                        locked
                            ? 'border-muted/20 text-muted cursor-not-allowed'
                            : 'border-roman-gold/30 text-roman-gold hover:bg-roman-gold/10'
                    }`}
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Sliders */}
            <div className="space-y-3">
                {SENATOR_ORDER.map(id => {
                    const senator = SENATORS[id];
                    const value = allocation[id];

                    return (
                        <div key={id} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-foreground font-medium">{senator.name}</span>
                                <span className={`font-bold ${
                                    value >= 30 ? 'text-green-400' :
                                    value >= 15 ? 'text-yellow-400' :
                                    'text-red-400'
                                }`}>
                                    {value}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                value={value}
                                onChange={(e) => handleSliderChange(id, parseInt(e.target.value))}
                                disabled={locked}
                                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                                    locked ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                style={{
                                    background: `linear-gradient(to right,
                                        ${value >= 30 ? '#4ade80' : value >= 15 ? '#facc15' : '#f87171'} 0%,
                                        ${value >= 30 ? '#4ade80' : value >= 15 ? '#facc15' : '#f87171'} ${value}%,
                                        rgba(255,255,255,0.1) ${value}%,
                                        rgba(255,255,255,0.1) 100%)`
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Total & Confirm */}
            <div className="flex items-center justify-between pt-2 border-t border-roman-gold/20">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted">Total:</span>
                    <span className={`font-bold ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                        {total}/100
                    </span>
                </div>
                <Button
                    onClick={handleConfirm}
                    disabled={!isValid || locked}
                    variant={isValid && !locked ? 'gold' : 'ghost'}
                    size="sm"
                >
                    Confirm Allocation
                </Button>
            </div>

            {/* Grace Period Notice */}
            {round <= 4 && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                    <strong>Grace Period:</strong> Senators are observing your first moves.
                    Attention effects are reduced during rounds 1-4.
                </div>
            )}
        </div>
    );
}
