'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, Badge, SectionHeader, ProgressBar } from '@/components/ui';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { Castle, Clock, Check, Lock, Hammer } from 'lucide-react';
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

function WonderCard({ wonder }: { wonder: Wonder }) {
    const state = useGameStore();
    const { denarii, inventory, startWonder } = state;

    // Check if wonder is currently being built (has turnsRemaining)
    const isBuilding = 'turnsRemaining' in wonder && (wonder as Wonder & { turnsRemaining?: number }).turnsRemaining !== undefined && (wonder as Wonder & { turnsRemaining?: number }).turnsRemaining! > 0;
    const turnsRemaining = (wonder as Wonder & { turnsRemaining?: number }).turnsRemaining || 0;

    // Check if player can afford the wonder
    const canAffordDenarii = denarii >= wonder.cost.denarii;
    const canAffordResources = Object.entries(wonder.cost.resources).every(
        ([res, amount]) => (inventory[res as ResourceType] || 0) >= (amount || 0)
    );
    const canAfford = canAffordDenarii && canAffordResources && !wonder.built && !isBuilding;

    const handleStartWonder = () => {
        if (canAfford && startWonder) {
            startWonder(wonder.id);
        }
    };

    // Get status badge
    const getStatusBadge = () => {
        if (wonder.built) {
            return <Badge variant="gold" size="sm"><Check className="w-3 h-3 mr-1" /> Completed</Badge>;
        }
        if (isBuilding) {
            return <Badge variant="default" size="sm"><Clock className="w-3 h-3 mr-1" /> {turnsRemaining} turns</Badge>;
        }
        if (!canAfford) {
            return <Badge variant="danger" size="sm"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>;
        }
        return <Badge variant="success" size="sm">Available</Badge>;
    };

    return (
        <motion.div variants={fadeInUp}>
            <GlassCard
                className={`p-5 h-full ${wonder.built ? 'border-2 border-roman-gold/60 bg-roman-gold/10' : ''} ${isBuilding ? 'border-2 border-blue-500/40' : ''}`}
                hover={canAfford}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{WONDER_ICONS[wonder.id] || '🏛️'}</span>
                        <div>
                            <h3 className="font-bold text-roman-gold text-lg">{wonder.name}</h3>
                            <p className="text-xs text-muted">{wonder.description}</p>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>

                {/* Construction Progress */}
                {isBuilding && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted mb-1">
                            <span>Construction Progress</span>
                            <span>{wonder.cost.turns - turnsRemaining}/{wonder.cost.turns} turns</span>
                        </div>
                        <ProgressBar
                            value={wonder.cost.turns - turnsRemaining}
                            max={wonder.cost.turns}
                            variant="gold"
                            height="md"
                        />
                    </div>
                )}

                {/* Effects */}
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-muted uppercase mb-2">Effects</h4>
                    <div className="space-y-1">
                        {wonder.effects.map((effect, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                                <span className="text-green-400">+</span>
                                <span className="text-gray-300">{effect.description}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Costs - Only show if not built and not building */}
                {!wonder.built && !isBuilding && (
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold text-muted uppercase mb-2">Cost</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted">Denarii</span>
                                <span className={canAffordDenarii ? 'text-green-400' : 'text-red-400'}>
                                    {wonder.cost.denarii.toLocaleString()}
                                </span>
                            </div>
                            {Object.entries(wonder.cost.resources).map(([res, amount]) => (
                                <div key={res} className="flex justify-between">
                                    <span className="text-muted capitalize">{res}</span>
                                    <span className={(inventory[res as ResourceType] || 0) >= (amount || 0) ? 'text-green-400' : 'text-red-400'}>
                                        {amount}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-between col-span-2 border-t border-white/10 pt-2 mt-1">
                                <span className="text-muted">Build Time</span>
                                <span className="text-blue-400">{wonder.cost.turns} seasons</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Build Button */}
                {!wonder.built && !isBuilding && (
                    <Button
                        variant="roman"
                        size="sm"
                        className="w-full"
                        onClick={handleStartWonder}
                        disabled={!canAfford}
                    >
                        <Hammer className="w-4 h-4 mr-2" />
                        Begin Construction
                    </Button>
                )}

                {/* Completed Status */}
                {wonder.built && (
                    <div className="text-center py-2 bg-roman-gold/20 rounded-lg">
                        <span className="text-roman-gold font-bold">Wonder Complete!</span>
                    </div>
                )}

                {/* Building Status */}
                {isBuilding && (
                    <div className="text-center py-2 bg-blue-500/20 rounded-lg">
                        <span className="text-blue-400 font-bold">Under Construction...</span>
                    </div>
                )}
            </GlassCard>
        </motion.div>
    );
}

export function WondersPanel() {
    const { wonders, denarii } = useGameStore();

    const completedCount = wonders.filter(w => w.built).length;
    const buildingCount = wonders.filter(w => 'turnsRemaining' in w && (w as Wonder & { turnsRemaining?: number }).turnsRemaining !== undefined && (w as Wonder & { turnsRemaining?: number }).turnsRemaining! > 0).length;

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Wonders of Rome"
                subtitle="Build magnificent structures to glorify the Empire"
                icon={<Castle className="w-6 h-6 text-roman-gold" />}
            />

            {/* Stats Overview */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <motion.div variants={fadeInUp}>
                    <GlassCard variant="gold" className="p-4 text-center">
                        <div className="text-3xl font-black text-roman-gold">{completedCount}</div>
                        <div className="text-sm text-muted">Completed</div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{buildingCount}</div>
                        <div className="text-sm text-muted">Building</div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-gray-400">{wonders.length - completedCount - buildingCount}</div>
                        <div className="text-sm text-muted">Available</div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-400">{denarii.toLocaleString()}</div>
                        <div className="text-sm text-muted">Treasury</div>
                    </GlassCard>
                </motion.div>
            </motion.div>

            {/* Wonders Grid */}
            <motion.div
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {wonders.map((wonder) => (
                    <WonderCard key={wonder.id} wonder={wonder} />
                ))}
            </motion.div>

            {/* Info Box */}
            <GlassCard className="p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <h4 className="font-bold text-roman-gold mb-1">Building Wonders</h4>
                        <p className="text-sm text-muted">
                            Wonders are monumental constructions that provide powerful permanent bonuses to your empire.
                            Once started, construction progresses automatically each season. Only one wonder can be built at a time.
                            Gather the required resources and denarii before starting construction.
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
