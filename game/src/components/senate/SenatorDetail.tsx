'use client';

import { motion } from 'framer-motion';
import { X, Shield, Swords, Eye, Flame, Crown, AlertTriangle, Skull, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SenatorState } from '@/core/types/senate';
import { SENATORS, getSenatorStateDescription, getSenatorDangerLevel } from '@/core/constants/senate';
import { getStateSentiment } from '@/senate/engine/stateTransitions';
import { GlassCard, Button } from '@/components/ui';

interface SenatorDetailProps {
    senator: SenatorState;
    attention: number;
    onClose: () => void;
}

const FACTION_COLORS: Record<string, string> = {
    militares: 'text-red-400 border-red-400/30 bg-red-500/10',
    populares: 'text-orange-400 border-orange-400/30 bg-orange-500/10',
    religious: 'text-purple-400 border-purple-400/30 bg-purple-500/10',
    none: 'text-blue-400 border-blue-400/30 bg-blue-500/10',
};

const FACTION_ICONS: Record<string, typeof Swords> = {
    militares: Swords,
    populares: Flame,
    religious: Crown,
    none: Eye,
};

export function SenatorDetail({ senator, attention, onClose }: SenatorDetailProps) {
    const def = SENATORS[senator.id];
    const dangerLevel = getSenatorDangerLevel(senator);
    const stateDescription = getSenatorStateDescription(senator.id, senator.currentState);
    const sentiment = getStateSentiment(senator.id, senator.currentState);
    const FactionIcon = FACTION_ICONS[def.faction];

    // Calculate relation color
    const getRelationColor = (relation: number) => {
        if (relation >= 60) return 'text-green-400';
        if (relation >= 30) return 'text-green-300';
        if (relation >= 0) return 'text-yellow-400';
        if (relation >= -30) return 'text-orange-400';
        if (relation >= -60) return 'text-red-400';
        return 'text-red-500';
    };

    const getSentimentIcon = () => {
        switch (sentiment) {
            case 'positive': return <TrendingUp className="w-4 h-4 text-green-400" />;
            case 'negative': return <TrendingDown className="w-4 h-4 text-red-400" />;
            case 'terminal_good': return <Shield className="w-4 h-4 text-green-500" />;
            case 'terminal_bad': return <Skull className="w-4 h-4 text-red-500" />;
            default: return <Minus className="w-4 h-4 text-yellow-400" />;
        }
    };

    const getSentimentLabel = () => {
        switch (sentiment) {
            case 'positive': return 'Favorable';
            case 'negative': return 'Unfavorable';
            case 'terminal_good': return 'Allied (Final)';
            case 'terminal_bad': return 'Hostile (Final)';
            default: return 'Neutral';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <GlassCard className="border-2 border-roman-gold/40">
                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-roman-gold/20 to-transparent p-6 border-b border-roman-gold/20">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-muted" />
                        </button>

                        <div className="flex items-start gap-4">
                            {/* Senator Avatar */}
                            <div className={`w-20 h-20 rounded-xl flex items-center justify-center ${FACTION_COLORS[def.faction]}`}>
                                <FactionIcon className="w-10 h-10" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-roman-gold">{def.name}</h2>
                                <p className="text-muted">&ldquo;{def.cognomen}&rdquo;</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${FACTION_COLORS[def.faction]}`}>
                                        {def.faction}
                                    </span>
                                    {dangerLevel !== 'safe' && (
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${
                                            dangerLevel === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                                        }`}>
                                            <AlertTriangle className="w-3 h-3" />
                                            {dangerLevel === 'critical' ? 'Danger!' : 'Warning'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Backstory */}
                        <div>
                            <h3 className="text-sm font-bold text-roman-gold mb-2">Background</h3>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                {def.backstory}
                            </p>
                        </div>

                        {/* Current Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background/50 rounded-lg p-4 border border-roman-gold/20">
                                <div className="flex items-center gap-2 mb-2">
                                    {getSentimentIcon()}
                                    <span className="text-xs text-muted">Current Status</span>
                                </div>
                                <p className="font-medium text-foreground">{stateDescription}</p>
                                <p className="text-xs text-muted mt-1">{getSentimentLabel()}</p>
                            </div>

                            <div className="bg-background/50 rounded-lg p-4 border border-roman-gold/20">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-muted">Relation</span>
                                    <span className={`font-bold ${getRelationColor(senator.relation)}`}>
                                        {senator.relation > 0 ? '+' : ''}{senator.relation}
                                    </span>
                                </div>
                                <div className="h-3 bg-background rounded-full overflow-hidden">
                                    <div className="h-full relative">
                                        {/* Center line */}
                                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />
                                        {/* Relation bar */}
                                        <div
                                            className={`absolute top-0 bottom-0 ${
                                                senator.relation >= 0
                                                    ? 'left-1/2 bg-gradient-to-r from-green-600 to-green-400'
                                                    : 'right-1/2 bg-gradient-to-l from-red-600 to-red-400'
                                            }`}
                                            style={{
                                                width: `${Math.abs(senator.relation) / 2}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attention & Tracking */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-background/50 rounded-lg p-3 border border-roman-gold/20 text-center">
                                <div className="text-xs text-muted mb-1">Attention</div>
                                <div className={`text-xl font-bold ${
                                    attention >= 30 ? 'text-green-400' :
                                    attention >= 15 ? 'text-yellow-400' :
                                    'text-red-400'
                                }`}>
                                    {attention}%
                                </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3 border border-roman-gold/20 text-center">
                                <div className="text-xs text-muted mb-1">Deals Made</div>
                                <div className="text-xl font-bold text-foreground">
                                    {senator.tracking.dealsMade}
                                </div>
                            </div>
                            <div className="bg-background/50 rounded-lg p-3 border border-roman-gold/20 text-center">
                                <div className="text-xs text-muted mb-1">Secrets</div>
                                <div className="text-xl font-bold text-foreground">
                                    {senator.tracking.secretsShared}
                                </div>
                            </div>
                        </div>

                        {/* Flags */}
                        <div>
                            <h3 className="text-sm font-bold text-roman-gold mb-2">Observations</h3>
                            <div className="flex flex-wrap gap-2">
                                {senator.flags.honorable > 0 && (
                                    <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs">
                                        Honorable ×{senator.flags.honorable}
                                    </span>
                                )}
                                {senator.flags.dishonorable > 0 && (
                                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs">
                                        Dishonorable ×{senator.flags.dishonorable}
                                    </span>
                                )}
                                {senator.flags.ruthless > 0 && (
                                    <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">
                                        Ruthless ×{senator.flags.ruthless}
                                    </span>
                                )}
                                {senator.flags.pious > 0 && (
                                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">
                                        Pious ×{senator.flags.pious}
                                    </span>
                                )}
                                {senator.flags.impious > 0 && (
                                    <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-xs">
                                        Impious ×{senator.flags.impious}
                                    </span>
                                )}
                                {senator.flags.interesting > 0 && (
                                    <span className="px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 text-xs">
                                        Interesting ×{senator.flags.interesting}
                                    </span>
                                )}
                                {senator.flags.disappointment > 0 && (
                                    <span className="px-2 py-1 rounded bg-gray-500/20 text-gray-400 text-xs">
                                        Disappointment ×{senator.flags.disappointment}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Assassination Warning */}
                        {senator.assassination.windowOpen && (
                            <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30">
                                <div className="flex items-center gap-3 text-red-400">
                                    <Skull className="w-6 h-6" />
                                    <div>
                                        <div className="font-bold">
                                            {senator.assassination.turnsUntilAttempt === 1
                                                ? 'ASSASSINATION IMMINENT!'
                                                : `Assassination in ${senator.assassination.turnsUntilAttempt} seasons`}
                                        </div>
                                        <div className="text-sm opacity-80">
                                            {def.assassinationMethod || 'This senator is planning to eliminate you.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Can Assassinate Info */}
                        {def.canAssassinate && !senator.assassination.windowOpen && (
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
                                <strong>Warning:</strong> This senator is capable of assassination if pushed too far.
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-roman-gold/20 flex justify-end">
                        <Button onClick={onClose} variant="ghost">
                            Close
                        </Button>
                    </div>
                </GlassCard>
            </motion.div>
        </motion.div>
    );
}
