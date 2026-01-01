'use client';

import { useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button, Badge, ProgressBar, GlassCard } from '@/components/ui';
import { Coins, Send, X, TrendingUp, Shield, Sparkles } from 'lucide-react';
import {
    type Faction,
    ENVOY_COST,
    getRelationStatus,
    calculateEnvoySuccessFactors,
    getRiskAssessment,
    type SuccessTier,
} from '@/core/constants/diplomacy';

interface EnvoyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    faction: Faction | null;
    currentRelation: number;
    reputation: number;
    godDiplomacyBonus: number;
    denarii: number;
    onConfirm: () => void;
}

export function EnvoyDialog({
    open,
    onOpenChange,
    faction,
    currentRelation,
    reputation,
    godDiplomacyBonus,
    denarii,
    onConfirm,
}: EnvoyDialogProps) {
    const successFactors = useMemo(() => {
        if (!faction) return null;
        return calculateEnvoySuccessFactors(reputation, currentRelation, godDiplomacyBonus);
    }, [faction, reputation, currentRelation, godDiplomacyBonus]);

    const relationStatus = useMemo(() => {
        return getRelationStatus(currentRelation);
    }, [currentRelation]);

    const canAfford = denarii >= ENVOY_COST;

    if (!faction || !successFactors) return null;

    const FactionIcon = faction.icon;

    const getTierBadgeVariant = (tier: SuccessTier): 'success' | 'warning' | 'danger' => {
        switch (tier) {
            case 'Likely':
                return 'success';
            case 'Uncertain':
                return 'warning';
            case 'Unlikely':
                return 'danger';
        }
    };

    const handleConfirm = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="glass-dark border-roman-gold/30 max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-roman-gold">
                        <div className="p-2 rounded-lg bg-roman-gold/10 border border-roman-gold/20">
                            <FactionIcon className="w-6 h-6 text-roman-gold" />
                        </div>
                        Send Envoy to {faction.name}
                    </DialogTitle>
                    <DialogDescription className="text-muted">
                        {faction.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Current Relation */}
                    <GlassCard className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted">Current Relations</span>
                            <Badge variant={relationStatus.variant}>{relationStatus.text}</Badge>
                        </div>
                        <ProgressBar
                            value={currentRelation}
                            max={100}
                            variant={currentRelation >= 60 ? 'green' : currentRelation >= 40 ? 'gold' : 'red'}
                        />
                        <div className="text-right text-sm mt-1">
                            <span className={relationStatus.color}>{currentRelation}/100</span>
                        </div>
                    </GlassCard>

                    {/* Cost */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2">
                            <Coins className="w-5 h-5 text-roman-gold" />
                            <span className="text-muted">Cost</span>
                        </div>
                        <span className={`font-bold ${canAfford ? 'text-roman-gold' : 'text-red-400'}`}>
                            {ENVOY_COST} denarii
                        </span>
                    </div>

                    {/* Success Factors */}
                    <GlassCard className="p-4">
                        <h4 className="text-sm font-semibold text-roman-gold mb-3">Success Factors</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted">
                                    <TrendingUp className="w-4 h-4" />
                                    Reputation ({reputation})
                                </span>
                                <span className="text-green-400">
                                    +{Math.round(successFactors.reputationBonus * 100)}%
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-muted">
                                    <Shield className="w-4 h-4" />
                                    Current Relation
                                </span>
                                <span className="text-green-400">
                                    +{Math.round(successFactors.relationBonus * 100)}%
                                </span>
                            </div>
                            {successFactors.godBonus > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-muted">
                                        <Sparkles className="w-4 h-4" />
                                        Divine Blessing
                                    </span>
                                    <span className="text-amber-400">
                                        +{Math.round(successFactors.godBonus * 100)}%
                                    </span>
                                </div>
                            )}
                            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                                <span className="font-medium text-ink">Total Chance</span>
                                <span className="font-bold text-roman-gold">
                                    {Math.round(successFactors.totalChance * 100)}%
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Success Tier */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-muted">Outcome Assessment</span>
                        <Badge variant={getTierBadgeVariant(successFactors.tier)} size="md">
                            {successFactors.tier}
                        </Badge>
                    </div>

                    {/* Risk Assessment */}
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-muted italic">
                        {getRiskAssessment(successFactors.tier)}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        icon={<X className="w-4 h-4" />}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="gold"
                        onClick={handleConfirm}
                        disabled={!canAfford}
                        icon={<Send className="w-4 h-4" />}
                    >
                        Send Envoy
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
