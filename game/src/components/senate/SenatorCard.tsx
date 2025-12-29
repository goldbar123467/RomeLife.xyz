'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, Skull, Heart, Swords, Eye, Flame, Crown } from 'lucide-react';
import type { SenatorState } from '@/core/types/senate';
import { SENATORS, getSenatorStateDescription, getSenatorDangerLevel } from '@/core/constants/senate';
import { cardHover } from '@/lib/animations';
import { GlassCard } from '@/components/ui';

interface SenatorCardProps {
    senator: SenatorState;
    attention: number;
    onClick?: () => void;
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

export function SenatorCard({ senator, attention, onClick }: SenatorCardProps) {
    const def = SENATORS[senator.id];
    const dangerLevel = getSenatorDangerLevel(senator);
    const stateDescription = getSenatorStateDescription(senator.id, senator.currentState);
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

    // Calculate relation bar width and color
    const relationNormalized = (senator.relation + 100) / 200; // 0 to 1
    const relationBarColor = senator.relation >= 0
        ? 'bg-gradient-to-r from-green-600 to-green-400'
        : 'bg-gradient-to-r from-red-600 to-red-400';

    return (
        <motion.div
            variants={cardHover}
            initial="initial"
            whileHover="hover"
            onClick={onClick}
            className="cursor-pointer"
        >
            <GlassCard className={`relative p-4 border ${
                dangerLevel === 'critical' ? 'border-red-500/50 animate-pulse' :
                dangerLevel === 'warning' ? 'border-orange-500/50' :
                'border-roman-gold/20'
            }`}>
                {/* Danger Indicator */}
                {dangerLevel !== 'safe' && (
                    <div className={`absolute -top-2 -right-2 p-1.5 rounded-full ${
                        dangerLevel === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                    }`}>
                        {dangerLevel === 'critical' ? (
                            <Skull className="w-4 h-4 text-white" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-white" />
                        )}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                    {/* Senator Avatar Placeholder */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${FACTION_COLORS[def.faction]}`}>
                        <FactionIcon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-roman-gold truncate">{def.name}</h3>
                        <p className="text-xs text-muted truncate">{def.cognomen}</p>
                    </div>
                </div>

                {/* State Badge */}
                <div className="mb-3">
                    <div className="text-xs text-muted mb-1">Status</div>
                    <div className="text-sm font-medium text-foreground line-clamp-2">
                        {stateDescription}
                    </div>
                </div>

                {/* Relation Bar */}
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted">Relation</span>
                        <span className={`font-bold ${getRelationColor(senator.relation)}`}>
                            {senator.relation > 0 ? '+' : ''}{senator.relation}
                        </span>
                    </div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${relationBarColor}`}
                            style={{ width: `${relationNormalized * 100}%` }}
                        />
                    </div>
                </div>

                {/* Attention */}
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        Attention
                    </span>
                    <span className={`font-bold ${
                        attention >= 30 ? 'text-green-400' :
                        attention >= 15 ? 'text-yellow-400' :
                        'text-red-400'
                    }`}>
                        {attention}%
                    </span>
                </div>

                {/* Assassination Warning */}
                {senator.assassination.windowOpen && (
                    <div className="mt-3 p-2 rounded-lg bg-red-500/20 border border-red-500/30">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                            <Skull className="w-4 h-4" />
                            {senator.assassination.turnsUntilAttempt === 1
                                ? 'IMMINENT THREAT!'
                                : `Threat in ${senator.assassination.turnsUntilAttempt} seasons`}
                        </div>
                    </div>
                )}
            </GlassCard>
        </motion.div>
    );
}
