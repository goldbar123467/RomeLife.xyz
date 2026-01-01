'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, Badge, SectionHeader, ProgressBar, GameImage } from '@/components/ui';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EnvoyDialog } from '@/components/diplomacy/EnvoyDialog';
import {
    FACTIONS,
    type Faction,
    getRelationStatus,
    ENVOY_COST,
    CRISIS_THRESHOLD,
    OPPORTUNITY_THRESHOLD,
    DIPLOMATIC_EFFECTS,
} from '@/core/constants/diplomacy';
import { getGodBlessingBonus } from '@/core/math';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    AlertTriangle,
    CheckCircle,
    Handshake,
    ThumbsUp,
    ThumbsDown,
    Skull,
    type LucideIcon,
} from 'lucide-react';

// Status icon mapping
const STATUS_ICONS: Record<string, LucideIcon> = {
    Allied: Handshake,
    Friendly: ThumbsUp,
    Neutral: Minus,
    Unfriendly: ThumbsDown,
    Hostile: Skull,
};

export function DiplomacyPanel() {
    const state = useGameStore();
    const { diplomacy, reputation, denarii, sendEnvoy, lastEvents, patronGod, godFavor, round } = state;
    const factionRefs = useRef<(HTMLDivElement | null)[]>([]);

    // State for envoy confirmation dialog
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Track relation trends (stored per round to detect changes)
    const [previousRelations, setPreviousRelations] = useState<Record<string, number>>({});
    const [lastTrackedRound, setLastTrackedRound] = useState(0);

    // Update trend tracking when round changes
    useMemo(() => {
        if (round !== lastTrackedRound) {
            setPreviousRelations({ ...diplomacy.relations });
            setLastTrackedRound(round);
        }
    }, [round, lastTrackedRound, diplomacy.relations]);

    // Calculate trends for each faction
    const getTrend = (factionId: string): 'up' | 'down' | 'stable' => {
        const current = diplomacy.relations[factionId] || 50;
        const previous = previousRelations[factionId] ?? current;
        if (current > previous) return 'up';
        if (current < previous) return 'down';
        return 'stable';
    };

    // Get factions as array
    const factions = Object.values(FACTIONS);

    // Calculate god diplomacy bonus
    const godDiplomacyBonus = getGodBlessingBonus(patronGod, godFavor, 'diplomacy');

    // Identify crises and opportunities
    const crisisFactions = factions.filter(
        f => (diplomacy.relations[f.id] || 50) < CRISIS_THRESHOLD
    );
    const opportunityFactions = factions.filter(
        f => (diplomacy.relations[f.id] || 50) > OPPORTUNITY_THRESHOLD
    );

    const canSendEnvoy = denarii >= ENVOY_COST;

    const handleOpenEnvoyDialog = (faction: Faction) => {
        setSelectedFaction(faction);
        setDialogOpen(true);
    };

    const handleConfirmEnvoy = () => {
        if (selectedFaction) {
            sendEnvoy(selectedFaction.id);
        }
    };

    const handleKeyDown = useCallback((e: React.KeyboardEvent, faction: Faction, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (canSendEnvoy) {
                handleOpenEnvoyDialog(faction);
            }
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (index + 1) % factions.length;
            factionRefs.current[nextIndex]?.focus();
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (index - 1 + factions.length) % factions.length;
            factionRefs.current[prevIndex]?.focus();
        }
    }, [canSendEnvoy, factions.length]);

    // Render threshold markers for progress bar
    const ThresholdMarkers = () => (
        <div className="relative w-full h-1 mt-1">
            {[20, 40, 60, 80].map(threshold => (
                <div
                    key={threshold}
                    className="absolute w-0.5 h-2 bg-white/30 -top-0.5"
                    style={{ left: `${threshold}%`, transform: 'translateX(-50%)' }}
                    title={`${threshold}`}
                />
            ))}
        </div>
    );

    return (
        <div className="p-6 space-y-6 fade-in" role="region" aria-label="Diplomacy and Foreign Relations">
            <SectionHeader
                title="Diplomacy"
                subtitle="Manage relations with neighboring powers"
                icon={<GameImage src="laurels" size="sm" alt="Diplomacy" />}
            />

            {/* Crisis Alerts */}
            {crisisFactions.length > 0 && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-red-400">Diplomatic Crisis</AlertTitle>
                    <AlertDescription className="text-red-300/80">
                        Relations with {crisisFactions.map(f => f.name).join(', ')} are critical!
                        Send envoys immediately to prevent hostilities.
                    </AlertDescription>
                </Alert>
            )}

            {/* Opportunity Alerts */}
            {opportunityFactions.length > 0 && (
                <Alert className="bg-green-500/10 border-green-500/30">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertTitle className="text-green-400">Alliance Opportunity</AlertTitle>
                    <AlertDescription className="text-green-300/80">
                        {opportunityFactions.map(f => f.name).join(', ')} relations are strong enough for alliance.
                        Consider formalizing trade agreements.
                    </AlertDescription>
                </Alert>
            )}

            {/* Reputation */}
            <GlassCard variant="gold" className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-roman-gold">Rome&apos;s Reputation</h3>
                        <p className="text-sm text-muted">Your standing in the known world</p>
                    </div>
                    <div className="text-4xl font-black text-roman-gold">{reputation}</div>
                </div>
                <ProgressBar value={reputation} max={100} variant="gold" className="mt-3" />
            </GlassCard>

            {/* Envoy Info */}
            <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-roman-gold">Send Envoy</h3>
                        <p className="text-sm text-muted">Cost: {ENVOY_COST} denarii per envoy</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted">Active Envoys</div>
                        <div className="text-2xl font-bold text-roman-gold">{diplomacy.activeEnvoys}</div>
                    </div>
                </div>
            </GlassCard>

            {/* Faction Relations */}
            <div className="space-y-4" role="list" aria-label="Foreign factions">
                {factions.map((faction, idx) => {
                    const relation = diplomacy.relations[faction.id] || 50;
                    const status = getRelationStatus(relation);
                    const trend = getTrend(faction.id);
                    const FactionIcon = faction.icon;
                    const StatusIcon = STATUS_ICONS[status.text] || Minus;
                    const disabledReasonId = `envoy-disabled-${faction.id}`;

                    return (
                        <motion.div
                            key={faction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            role="listitem"
                        >
                            <GlassCard className="p-4">
                                <div
                                    ref={(el) => { factionRefs.current[idx] = el; }}
                                    role="article"
                                    aria-label={`${faction.name}: ${status.text} relations at ${relation}%`}
                                    tabIndex={0}
                                    onKeyDown={(e) => handleKeyDown(e, faction, idx)}
                                    className="flex items-start gap-4 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-lg"
                                >
                                    <div className="flex-shrink-0 p-3 rounded-xl bg-roman-gold/10 border border-roman-gold/20">
                                        <FactionIcon className="w-8 h-8 text-roman-gold" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                                            <h4 className="font-bold text-roman-gold">{faction.name}</h4>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Trend Badge */}
                                                {trend === 'up' && (
                                                    <Badge variant="success" size="sm" className="gap-1">
                                                        <TrendingUp className="w-3 h-3" aria-hidden="true" />
                                                        Rising
                                                    </Badge>
                                                )}
                                                {trend === 'down' && (
                                                    <Badge variant="danger" size="sm" className="gap-1">
                                                        <TrendingDown className="w-3 h-3" aria-hidden="true" />
                                                        Falling
                                                    </Badge>
                                                )}
                                                {trend === 'stable' && (
                                                    <Badge variant="warning" size="sm" className="gap-1">
                                                        <Minus className="w-3 h-3" aria-hidden="true" />
                                                        Stable
                                                    </Badge>
                                                )}
                                                {/* Status Badge */}
                                                <Badge variant={status.variant}>
                                                    <StatusIcon className="w-3 h-3 mr-1" aria-hidden="true" />
                                                    {status.text}
                                                </Badge>
                                            </div>
                                        </div>

                                        <p className="text-sm text-muted mb-3">{faction.description}</p>

                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-muted">Relations</span>
                                                <span className={status.color}>{relation}/100</span>
                                            </div>
                                            <div
                                                role="progressbar"
                                                aria-valuenow={relation}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-label={`Relation with ${faction.name}`}
                                            >
                                                <ProgressBar
                                                    value={relation}
                                                    max={100}
                                                    variant={relation >= 60 ? 'green' : relation >= 40 ? 'gold' : 'red'}
                                                    size="sm"
                                                />
                                                <ThresholdMarkers />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                variant="gold"
                                                size="sm"
                                                onClick={() => handleOpenEnvoyDialog(faction)}
                                                disabled={!canSendEnvoy}
                                                aria-label={`Send envoy to ${faction.name} for ${ENVOY_COST} denarii`}
                                                aria-describedby={!canSendEnvoy ? disabledReasonId : undefined}
                                            >
                                                Send Envoy
                                            </Button>
                                            {!canSendEnvoy && (
                                                <span id={disabledReasonId} className="sr-only">
                                                    Requires {ENVOY_COST} denarii. Current treasury: {denarii}
                                                </span>
                                            )}

                                            {relation >= 80 && (
                                                <Badge variant="success" size="sm">Trade Bonus Active</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>

            {/* Diplomacy Tips */}
            <div role="complementary" aria-label="Diplomatic effects guide">
                <GlassCard className="p-4">
                    <h3 className="font-bold text-roman-gold mb-3">Diplomatic Effects</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        {DIPLOMATIC_EFFECTS.map((effect, idx) => {
                            const EffectIcon = STATUS_ICONS[effect.name] || Minus;
                            return (
                                <div key={idx} className="glass-dark rounded-lg p-3">
                                    <span className={`${effect.color} font-bold flex items-center gap-1`}>
                                        <EffectIcon className="w-4 h-4" aria-hidden="true" />
                                        {effect.name} ({effect.threshold}+)
                                    </span>
                                    <p className="text-muted mt-1">{effect.effects}</p>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            </div>

            {/* Last Envoy Event */}
            {lastEvents.length > 0 && lastEvents[0].includes('Envoy') && (
                <motion.div
                    className={`rounded-xl p-4 text-center ${lastEvents[0].includes('successful') ? 'glass-gold' : 'glass-dark border-red-400/50'
                        }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    role="status"
                    aria-live="polite"
                >
                    <span className={lastEvents[0].includes('successful') ? 'text-roman-gold' : 'text-red-400'}>
                        {lastEvents[0]}
                    </span>
                </motion.div>
            )}

            {/* Envoy Confirmation Dialog */}
            <EnvoyDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                faction={selectedFaction}
                currentRelation={selectedFaction ? (diplomacy.relations[selectedFaction.id] || 50) : 50}
                reputation={reputation}
                godDiplomacyBonus={godDiplomacyBonus}
                denarii={denarii}
                onConfirm={handleConfirmEnvoy}
            />
        </div>
    );
}
