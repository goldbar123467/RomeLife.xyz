'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, Badge, SectionHeader, ProgressBar, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui';
import { MILITARY_UNITS } from '@/core/constants';
import { calculateBlessingBonus } from '@/core/constants/religion';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { Swords, Shield, Users, Zap, Package, Heart, Check, X, ScrollText, TrendingUp } from 'lucide-react';
import { gameToast } from '@/lib/toast';
import type { MilitaryUnit } from '@/core/types';

// Simple line chart component for military stats
function MilitaryChart({ history }: { history: { round: number; troops: number; morale: number; supplies: number }[] }) {
    const data = useMemo(() => {
        // Take last 12 entries for display
        const recentHistory = history.slice(-12);
        if (recentHistory.length === 0) return null;

        // Calculate max values for scaling
        const maxTroops = Math.max(...recentHistory.map(h => h.troops), 1);
        const maxSupplies = Math.max(...recentHistory.map(h => h.supplies), 1);
        const maxMorale = 100; // Morale is always 0-100

        return {
            entries: recentHistory,
            maxTroops,
            maxSupplies,
            maxMorale,
        };
    }, [history]);

    if (!data || data.entries.length < 2) {
        return (
            <div className="h-32 flex items-center justify-center text-muted text-sm">
                Play more seasons to see military trends...
            </div>
        );
    }

    const width = 100;
    const height = 100;
    const padding = 5;

    // Generate SVG path for a data series
    const generatePath = (values: number[], maxValue: number) => {
        const points = values.map((val, i) => {
            const x = padding + (i / (values.length - 1)) * (width - padding * 2);
            const y = height - padding - (val / maxValue) * (height - padding * 2);
            return `${x},${y}`;
        });
        return `M ${points.join(' L ')}`;
    };

    const troopsPath = generatePath(data.entries.map(h => h.troops), data.maxTroops);
    const moralePath = generatePath(data.entries.map(h => h.morale), data.maxMorale);
    const suppliesPath = generatePath(data.entries.map(h => h.supplies), data.maxSupplies);

    return (
        <div className="space-y-3">
            {/* Chart */}
            <div className="relative h-32 bg-bg/50 rounded-lg overflow-hidden">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    <line x1={padding} y1={height/4} x2={width-padding} y2={height/4} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    <line x1={padding} y1={height*3/4} x2={width-padding} y2={height*3/4} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                    {/* Troops line (gold) */}
                    <path d={troopsPath} fill="none" stroke="#f0c14b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Morale line (green) */}
                    <path d={moralePath} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Supplies line (blue) */}
                    <path d={suppliesPath} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {/* Current values overlay */}
                <div className="absolute top-2 right-2 text-xs space-y-1">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-roman-gold"></div>
                        <span className="text-roman-gold font-medium">{data.entries[data.entries.length - 1].troops}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span className="text-green-400 font-medium">{data.entries[data.entries.length - 1].morale}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                        <span className="text-blue-400 font-medium">{data.entries[data.entries.length - 1].supplies}</span>
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-roman-gold rounded"></div>
                    <span className="text-muted">Troops</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-green-400 rounded"></div>
                    <span className="text-muted">Morale</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-blue-400 rounded"></div>
                    <span className="text-muted">Supplies</span>
                </div>
            </div>
        </div>
    );
}

export function MilitaryPanel() {
    const state = useGameStore();
    const { troops, morale, supplies, forts, denarii, inventory, recruitTroops, patronGod, godFavor, founder, winStreak, history } = state;
    const [selectedUnit, setSelectedUnit] = useState<MilitaryUnit | null>(null);

    // Calculate Mars recruitment discount (-15% at tier 25)
    const marsRecruitDiscount = calculateBlessingBonus(patronGod, godFavor, 'recruitCost');
    const founderRecruitMod = founder?.modifiers?.recruitCostMod || 0;
    const totalDiscount = marsRecruitDiscount + founderRecruitMod;

    // Combat calculations
    const combatStrength = Math.floor(troops * (morale / 100) * (1 + supplies / 500));
    const upkeepCost = troops * 2;
    const foodRequired = Math.floor(troops * 0.55);

    const handleRecruit = (unit: MilitaryUnit) => {
        recruitTroops(unit.id);
        gameToast.recruit('Troops Recruited', `${unit.name} join your legions`);
        setSelectedUnit(null);
    };

    // Calculate cost for a unit
    const getUnitCost = (unit: MilitaryUnit) => {
        const discountMod = 1 + totalDiscount;
        return Math.floor(unit.cost.denarii * Math.max(0.5, discountMod));
    };

    const canAffordUnit = (unit: MilitaryUnit) => {
        const cost = getUnitCost(unit);
        return denarii >= cost && inventory.grain >= unit.cost.food;
    };

    return (
        <div className="p-4 md:p-6 space-y-6 fade-in">
            <SectionHeader
                title="Military"
                subtitle="Command your legions and defend Rome"
                icon={<Swords className="w-6 h-6 text-roman-gold" />}
            />

            {/* Key Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <GlassCard variant="gold" className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-roman-gold/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-roman-gold" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-black text-roman-gold">{troops}</div>
                            <div className="text-xs text-muted">Troops</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-green-400">{morale}%</div>
                            <div className="text-xs text-muted">Morale</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Package className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-blue-400">{supplies}</div>
                            <div className="text-xs text-muted">Supplies</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-2xl md:text-3xl font-bold text-purple-400">{forts}</div>
                            <div className="text-xs text-muted">Forts</div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Military History Chart */}
            <GlassCard className="p-4 md:p-6">
                <h3 className="text-lg font-bold text-roman-gold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Military Trends
                </h3>
                <MilitaryChart history={history || []} />
            </GlassCard>

            {/* Combat Power Summary */}
            <GlassCard className="p-4 md:p-6">
                <h3 className="text-lg font-bold text-roman-gold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" /> Combat Power
                </h3>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-black text-green-400">{combatStrength}</div>
                        <div className="text-xs text-muted">Strength</div>
                    </div>
                    <div className="text-center border-x border-white/10">
                        <div className="text-2xl md:text-3xl font-black text-red-400">-{upkeepCost}</div>
                        <div className="text-xs text-muted">Upkeep/Season</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl md:text-3xl font-black text-orange-400">{foodRequired}</div>
                        <div className="text-xs text-muted">Food/Season</div>
                    </div>
                </div>

                {/* Morale Bar */}
                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted">Legion Morale</span>
                        <span className={morale >= 70 ? 'text-green-400' : morale >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                            {morale >= 70 ? 'High' : morale >= 40 ? 'Steady' : 'Low'}
                        </span>
                    </div>
                    <ProgressBar
                        value={morale}
                        max={100}
                        variant={morale >= 70 ? 'default' : morale >= 40 ? 'gold' : 'danger'}
                        height="sm"
                    />
                    {winStreak > 0 && (
                        <div className="text-xs text-green-400 mt-2">
                            Victory streak: {winStreak} wins (+{winStreak * 5} morale bonus)
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Recruitment Section */}
            <GlassCard className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-roman-gold flex items-center gap-2">
                        <Users className="w-5 h-5" /> Recruit Units
                    </h3>
                    {totalDiscount < 0 && (
                        <Badge variant="gold" size="sm">
                            {Math.round(Math.abs(totalDiscount) * 100)}% discount
                        </Badge>
                    )}
                </div>

                <motion.div
                    className="grid grid-cols-2 lg:grid-cols-3 gap-3"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {MILITARY_UNITS.map((unit) => {
                        const cost = getUnitCost(unit);
                        const canAfford = canAffordUnit(unit);
                        const hasDiscount = cost < unit.cost.denarii;

                        return (
                            <motion.div
                                key={unit.id}
                                variants={fadeInUp}
                                className={`glass-dark rounded-xl p-3 md:p-4 cursor-pointer transition-all ${
                                    !canAfford ? 'opacity-50' : 'hover:bg-white/5'
                                }`}
                                onClick={() => setSelectedUnit(unit)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-bold text-roman-gold text-sm md:text-base">{unit.name}</h4>
                                    <Badge variant="default" size="sm" className="text-[10px]">{unit.role}</Badge>
                                </div>

                                <div className="text-xs text-muted mb-3">
                                    +{unit.troopsMin}-{unit.troopsMax} troops
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <span className={denarii >= cost ? 'text-green-400' : 'text-red-400'}>
                                        {cost} gold
                                        {hasDiscount && <span className="text-muted line-through ml-1">{unit.cost.denarii}</span>}
                                    </span>
                                    <span className={inventory.grain >= unit.cost.food ? 'text-green-400' : 'text-red-400'}>
                                        {unit.cost.food} food
                                    </span>
                                </div>

                                <div className={`mt-3 text-xs font-medium text-center py-1.5 rounded ${
                                    canAfford ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
                                }`}>
                                    {canAfford ? 'Tap to recruit' : 'Cannot afford'}
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </GlassCard>

            {/* Unit Detail Sheet */}
            <Sheet open={!!selectedUnit} onOpenChange={(open) => !open && setSelectedUnit(null)}>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                    {selectedUnit && (() => {
                        const cost = getUnitCost(selectedUnit);
                        const canAfford = canAffordUnit(selectedUnit);
                        const hasDiscount = cost < selectedUnit.cost.denarii;

                        return (
                            <>
                                <SheetHeader>
                                    <SheetTitle className="flex items-center gap-2">
                                        {selectedUnit.name}
                                        <Badge variant="gold">{selectedUnit.role}</Badge>
                                    </SheetTitle>
                                    <SheetDescription>
                                        {selectedUnit.description}
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="py-4 space-y-4">
                                    {/* Pros & Cons */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="glass-dark rounded-xl p-3">
                                            <div className="text-xs text-green-400 font-bold mb-2 flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Strengths
                                            </div>
                                            <div className="space-y-1">
                                                {selectedUnit.pros.map((pro, i) => (
                                                    <div key={i} className="text-xs text-muted flex items-start gap-1.5">
                                                        <span className="text-green-400 mt-0.5">+</span>
                                                        <span>{pro}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="glass-dark rounded-xl p-3">
                                            <div className="text-xs text-red-400 font-bold mb-2 flex items-center gap-1">
                                                <X className="w-3 h-3" /> Weaknesses
                                            </div>
                                            <div className="space-y-1">
                                                {selectedUnit.cons.map((con, i) => (
                                                    <div key={i} className="text-xs text-muted flex items-start gap-1.5">
                                                        <span className="text-red-400 mt-0.5">-</span>
                                                        <span>{con}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Historical Info */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <div className="text-xs text-roman-gold font-bold mb-2 flex items-center gap-1">
                                            <ScrollText className="w-3 h-3" /> Historical Background
                                        </div>
                                        <p className="text-xs text-muted leading-relaxed">
                                            {selectedUnit.history}
                                        </p>
                                    </div>

                                    {/* Cost & Resources */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <div className="text-sm text-muted mb-3">Recruitment</div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="text-xs text-muted mb-1">Cost</div>
                                                <div className="flex items-center gap-3">
                                                    <span className={denarii >= cost ? 'text-green-400' : 'text-red-400'}>
                                                        {cost} gold
                                                        {hasDiscount && <span className="text-muted line-through ml-1 text-xs">{selectedUnit.cost.denarii}</span>}
                                                    </span>
                                                    <span className={inventory.grain >= selectedUnit.cost.food ? 'text-green-400' : 'text-red-400'}>
                                                        {selectedUnit.cost.food} food
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-muted mb-1">You Have</div>
                                                <div className="flex items-center gap-3">
                                                    <span className={denarii >= cost ? 'text-green-400' : 'text-red-400'}>{denarii} gold</span>
                                                    <span className={inventory.grain >= selectedUnit.cost.food ? 'text-green-400' : 'text-red-400'}>{inventory.grain} food</span>
                                                </div>
                                            </div>
                                        </div>
                                        {hasDiscount && (
                                            <div className="text-xs text-green-400 mt-3 pt-3 border-t border-white/10">
                                                Mars blessing: {Math.round(Math.abs(totalDiscount) * 100)}% cost reduction
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <SheetFooter>
                                    <Button
                                        variant="gold"
                                        size="lg"
                                        className="w-full"
                                        onClick={() => handleRecruit(selectedUnit)}
                                        disabled={!canAfford}
                                    >
                                        {canAfford ? `Recruit ${selectedUnit.troopsMin}-${selectedUnit.troopsMax} ${selectedUnit.name}` : 'Insufficient Resources'}
                                    </Button>
                                </SheetFooter>
                            </>
                        );
                    })()}
                </SheetContent>
            </Sheet>
        </div>
    );
}
