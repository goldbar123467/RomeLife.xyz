'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, Badge, SectionHeader, ProgressBar, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { Castle, Clock, Check, Lock, Hammer, Info, ScrollText, Calendar, Sparkles, Coins } from 'lucide-react';
import type { Wonder, ResourceType } from '@/core/types';

// Wonder icons mapping
const WONDER_ICONS: Record<string, string> = {
    colosseum: '🏛️',
    pantheon: '⛪',
    circus_maximus: '🏟️',
    aqua_claudia: '🚰',
    forum_romanum: '🏛️',
    palatine_palace: '👑',
};

// Status colors for visual distinction
const STATUS_COLORS = {
    completed: { border: 'border-roman-gold/50', bg: 'bg-roman-gold/10', glow: 'shadow-[0_0_20px_rgba(240,193,75,0.3)]' },
    building: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
    available: { border: 'border-green-500/30', bg: 'bg-green-500/5', glow: '' },
    locked: { border: 'border-white/10', bg: 'bg-white/5', glow: '' },
};

export function WondersPanel() {
    const state = useGameStore();
    const { wonders, denarii, inventory, startWonder } = state;
    const [selectedWonder, setSelectedWonder] = useState<Wonder | null>(null);

    const completedCount = wonders.filter(w => w.built).length;
    const buildingCount = wonders.filter(w => w.turnsRemaining && w.turnsRemaining > 0).length;

    // Get wonder status
    const getWonderStatus = (wonder: Wonder) => {
        if (wonder.built) return 'completed';
        if (wonder.turnsRemaining && wonder.turnsRemaining > 0) return 'building';

        const canAffordDenarii = denarii >= wonder.cost.denarii;
        const canAffordResources = Object.entries(wonder.cost.resources).every(
            ([res, amount]) => (inventory[res as ResourceType] || 0) >= (amount || 0)
        );

        return canAffordDenarii && canAffordResources ? 'available' : 'locked';
    };

    // Wonder Card Component
    const WonderCard = ({ wonder }: { wonder: Wonder }) => {
        const status = getWonderStatus(wonder);
        const statusStyle = STATUS_COLORS[status];
        const turnsRemaining = wonder.turnsRemaining || 0;

        return (
            <motion.div
                variants={fadeInUp}
                className={`rounded-xl border-2 ${statusStyle.border} ${statusStyle.bg} ${statusStyle.glow} p-4 cursor-pointer transition-all hover:scale-[1.02] relative`}
                onClick={() => setSelectedWonder(wonder)}
            >
                {/* Info button */}
                <button
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWonder(wonder);
                    }}
                >
                    <Info className="w-4 h-4 text-muted hover:text-roman-gold" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{WONDER_ICONS[wonder.id] || '🏛️'}</div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-roman-gold truncate">{wonder.name}</h3>
                        <p className="text-xs text-muted italic">{wonder.latinName}</p>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                    {status === 'completed' && (
                        <Badge variant="gold" size="sm"><Check className="w-3 h-3 mr-1" /> Completed</Badge>
                    )}
                    {status === 'building' && (
                        <Badge variant="default" size="sm" className="bg-blue-500/20 text-blue-400">
                            <Clock className="w-3 h-3 mr-1" /> {turnsRemaining} turns left
                        </Badge>
                    )}
                    {status === 'available' && (
                        <Badge variant="default" size="sm" className="bg-green-500/20 text-green-400">
                            <Sparkles className="w-3 h-3 mr-1" /> Available
                        </Badge>
                    )}
                    {status === 'locked' && (
                        <Badge variant="danger" size="sm"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>
                    )}
                </div>

                {/* Construction Progress */}
                {status === 'building' && (
                    <div className="mb-3">
                        <ProgressBar
                            value={wonder.cost.turns - turnsRemaining}
                            max={wonder.cost.turns}
                            variant="gold"
                            height="sm"
                        />
                        <div className="text-xs text-muted mt-1 text-center">
                            {wonder.cost.turns - turnsRemaining}/{wonder.cost.turns} seasons
                        </div>
                    </div>
                )}

                {/* Year Built */}
                <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>Built: {wonder.yearBuilt}</span>
                </div>

                {/* Quick Effects */}
                <div className="space-y-1">
                    {wonder.effects.slice(0, 2).map((effect, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                            <span className="text-green-400">+</span>
                            <span className="text-muted truncate">{effect.description}</span>
                        </div>
                    ))}
                </div>

                {/* Cost Preview (if not built) */}
                {status !== 'completed' && status !== 'building' && (
                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                        <span className="text-muted">Cost:</span>
                        <span className={denarii >= wonder.cost.denarii ? 'text-green-400' : 'text-red-400'}>
                            {wonder.cost.denarii.toLocaleString()} gold
                        </span>
                    </div>
                )}
            </motion.div>
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-6 fade-in">
            <SectionHeader
                title="Wonders of Rome"
                subtitle="Build magnificent structures to glorify the Empire"
                icon={<Castle className="w-6 h-6 text-roman-gold" />}
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <GlassCard variant="gold" className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-roman-gold/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-roman-gold" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-roman-gold">{completedCount}</div>
                            <div className="text-xs text-muted">Completed</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Hammer className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-400">{buildingCount}</div>
                            <div className="text-xs text-muted">Building</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                            <Castle className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-400">{wonders.length - completedCount - buildingCount}</div>
                            <div className="text-xs text-muted">Remaining</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                            <Coins className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yellow-400">{denarii.toLocaleString()}</div>
                            <div className="text-xs text-muted">Treasury</div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Wonders Grid */}
            <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {wonders.map((wonder) => (
                    <WonderCard key={wonder.id} wonder={wonder} />
                ))}
            </motion.div>

            {/* Wonder Detail Sheet */}
            <Sheet open={!!selectedWonder} onOpenChange={(open) => !open && setSelectedWonder(null)}>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                    {selectedWonder && (() => {
                        const status = getWonderStatus(selectedWonder);
                        const turnsRemaining = selectedWonder.turnsRemaining || 0;
                        const canAffordDenarii = denarii >= selectedWonder.cost.denarii;
                        const canBuild = status === 'available';

                        return (
                            <>
                                <SheetHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="text-4xl">{WONDER_ICONS[selectedWonder.id] || '🏛️'}</div>
                                        <div>
                                            <SheetTitle className="flex items-center gap-2">
                                                {selectedWonder.name}
                                                {status === 'completed' && <Badge variant="gold" size="sm">Complete</Badge>}
                                            </SheetTitle>
                                            <SheetDescription>
                                                {selectedWonder.latinName} • Built {selectedWonder.yearBuilt}
                                            </SheetDescription>
                                        </div>
                                    </div>
                                </SheetHeader>

                                <div className="py-4 space-y-4">
                                    {/* Description */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <p className="text-sm text-foreground leading-relaxed">
                                            {selectedWonder.description}
                                        </p>
                                    </div>

                                    {/* Construction Progress */}
                                    {status === 'building' && (
                                        <div className="glass-dark rounded-xl p-4">
                                            <div className="text-xs text-blue-400 font-bold mb-2 flex items-center gap-1">
                                                <Hammer className="w-3 h-3" /> Under Construction
                                            </div>
                                            <ProgressBar
                                                value={selectedWonder.cost.turns - turnsRemaining}
                                                max={selectedWonder.cost.turns}
                                                variant="gold"
                                                height="md"
                                            />
                                            <div className="text-sm text-muted mt-2 text-center">
                                                {turnsRemaining} seasons remaining
                                            </div>
                                        </div>
                                    )}

                                    {/* Facts */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <div className="text-xs text-roman-gold font-bold mb-3 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Quick Facts
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {selectedWonder.facts.map((fact, i) => (
                                                <span key={i} className="text-sm bg-roman-gold/10 text-roman-gold px-3 py-2 rounded-lg">
                                                    {fact}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Historical Background */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <div className="text-xs text-roman-gold font-bold mb-2 flex items-center gap-1">
                                            <ScrollText className="w-3 h-3" /> Historical Background
                                        </div>
                                        <p className="text-xs text-muted leading-relaxed">
                                            {selectedWonder.history}
                                        </p>
                                    </div>

                                    {/* Effects */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <div className="text-xs text-green-400 font-bold mb-2 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Bonuses When Complete
                                        </div>
                                        <div className="space-y-2">
                                            {selectedWonder.effects.map((effect, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm">
                                                    <span className="text-green-400">+</span>
                                                    <span className="text-foreground">{effect.description}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Costs (if not built) */}
                                    {status !== 'completed' && status !== 'building' && (
                                        <div className="glass-dark rounded-xl p-4">
                                            <div className="text-xs text-muted font-bold mb-3">Construction Costs</div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted">Denarii</span>
                                                    <div>
                                                        <span className={canAffordDenarii ? 'text-green-400' : 'text-red-400'}>
                                                            {selectedWonder.cost.denarii.toLocaleString()}
                                                        </span>
                                                        <span className="text-muted text-xs ml-1">/ {denarii.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                {Object.entries(selectedWonder.cost.resources).map(([res, amount]) => {
                                                    const have = inventory[res as ResourceType] || 0;
                                                    const canAfford = have >= (amount || 0);
                                                    return (
                                                        <div key={res} className="flex justify-between">
                                                            <span className="text-muted capitalize">{res}</span>
                                                            <div>
                                                                <span className={canAfford ? 'text-green-400' : 'text-red-400'}>
                                                                    {amount}
                                                                </span>
                                                                <span className="text-muted text-xs ml-1">/ {have}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                <div className="flex justify-between col-span-2 border-t border-white/10 pt-2 mt-1">
                                                    <span className="text-muted">Build Time</span>
                                                    <span className="text-blue-400">{selectedWonder.cost.turns} seasons</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <SheetFooter>
                                    {status === 'completed' ? (
                                        <div className="w-full text-center py-3 bg-roman-gold/20 rounded-lg">
                                            <span className="text-roman-gold font-bold">Wonder Complete!</span>
                                        </div>
                                    ) : status === 'building' ? (
                                        <div className="w-full text-center py-3 bg-blue-500/20 rounded-lg">
                                            <span className="text-blue-400 font-bold">Under Construction...</span>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="gold"
                                            size="lg"
                                            className="w-full"
                                            onClick={() => {
                                                if (startWonder) {
                                                    startWonder(selectedWonder.id);
                                                    setSelectedWonder(null);
                                                }
                                            }}
                                            disabled={!canBuild}
                                        >
                                            <Hammer className="w-4 h-4 mr-2" />
                                            {canBuild ? 'Begin Construction' : 'Insufficient Resources'}
                                        </Button>
                                    )}
                                </SheetFooter>
                            </>
                        );
                    })()}
                </SheetContent>
            </Sheet>
        </div>
    );
}
