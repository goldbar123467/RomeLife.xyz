'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import {
    Map, Landmark, Swords, X, User, Target, Shield, Building2, TrendingUp,
    Eye, ChevronUp, ChevronDown, Check, ScrollText, Crown, Wheat,
    Sparkles, ChevronRight, Coins
} from 'lucide-react';
import {
    GOVERNORS, TERRITORY_FOCUS,
    TERRITORY_LEVELS, TERRITORY_BUILDINGS,
    calculateMaxGarrison, calculateTerritoryDefense
} from '@/core/constants';
import { GlassCard, Button, Badge, ProgressBar, SectionHeader } from '@/components/ui';
import type { Territory, TerritoryFocus, GovernorTrait } from '@/core/types';

type TerritoryTab = 'overview' | 'upgrade' | 'buildings' | 'garrison' | 'governor' | 'focus';

// Rarity colors for visual distinction
const RARITY_COLORS = {
    common: { border: 'border-slate-500/50', bg: 'bg-slate-500/10', text: 'text-slate-400', glow: '' },
    uncommon: { border: 'border-green-500/50', bg: 'bg-green-500/10', text: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.2)]' },
    rare: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
    epic: { border: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' },
    legendary: { border: 'border-roman-gold/50', bg: 'bg-roman-gold/10', text: 'text-roman-gold', glow: 'shadow-[0_0_25px_rgba(240,193,75,0.4)]' },
    imperial: { border: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-400', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.5)]' },
};

export function MapPanel() {
    const {
        territories, startBattle, denarii, troops,
        assignGovernor, setTerritoryFocus,
        upgradeTerritoryLevel, buildTerritoryBuilding, assignGarrison, recallGarrison
    } = useGameStore();
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
    const [activeTab, setActiveTab] = useState<TerritoryTab>('overview');
    const [garrisonAmount, setGarrisonAmount] = useState(10);

    // Separate owned vs conquerable
    const ownedTerritories = useMemo(() => territories.filter(t => t.owned), [territories]);
    const conquerableTerritories = useMemo(() => territories.filter(t => !t.owned), [territories]);

    // Empire stats
    const empireStats = useMemo(() => {
        const totalResources = ownedTerritories.reduce((acc, t) => {
            t.resources.forEach(r => { acc += r.baseAmount; });
            return acc;
        }, 0);
        const totalGarrison = ownedTerritories.reduce((acc, t) => acc + t.garrison, 0);
        const avgStability = ownedTerritories.length > 0
            ? Math.round(ownedTerritories.reduce((acc, t) => acc + t.stability, 0) / ownedTerritories.length)
            : 0;
        return { totalResources, totalGarrison, avgStability };
    }, [ownedTerritories]);

    const refreshSelectedTerritory = () => {
        if (selectedTerritory) {
            const updated = territories.find(t => t.id === selectedTerritory.id);
            if (updated) setSelectedTerritory(updated);
        }
    };

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: <Eye className="w-4 h-4" /> },
        { id: 'upgrade' as const, label: 'Upgrade', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'buildings' as const, label: 'Build', icon: <Building2 className="w-4 h-4" /> },
        { id: 'garrison' as const, label: 'Garrison', icon: <Shield className="w-4 h-4" /> },
        { id: 'governor' as const, label: 'Governor', icon: <User className="w-4 h-4" /> },
        { id: 'focus' as const, label: 'Focus', icon: <Target className="w-4 h-4" /> },
    ];

    // Territory Card Component
    const TerritoryCard = ({ territory, onClick }: { territory: Territory; onClick: () => void }) => {
        const rarity = RARITY_COLORS[territory.rarity] || RARITY_COLORS.common;
        const maxGarrison = calculateMaxGarrison(territory.buildings || []);

        return (
            <motion.div
                variants={fadeInUp}
                className={`relative rounded-xl border-2 ${rarity.border} ${rarity.bg} ${rarity.glow} p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]`}
                onClick={onClick}
            >
                {/* Rarity indicator */}
                <div className="absolute top-2 right-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${rarity.bg} ${rarity.text} border ${rarity.border}`}>
                        {territory.rarity}
                    </span>
                </div>

                {/* Territory info */}
                <div className="mb-3">
                    <h3 className="font-bold text-roman-gold pr-16">{territory.name}</h3>
                    <p className="text-xs text-muted italic">{territory.latinName}</p>
                </div>

                {/* Resources row */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {territory.resources.slice(0, 3).map((res, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-white/10 text-muted capitalize">
                            {res.type} +{res.baseAmount}
                        </span>
                    ))}
                </div>

                {territory.owned ? (
                    <>
                        {/* Stats bars */}
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-muted">Stability</span>
                                    <span className={territory.stability >= 70 ? 'text-green-400' : territory.stability >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                                        {territory.stability}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${territory.stability >= 70 ? 'bg-green-500' : territory.stability >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${territory.stability}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1">
                                    <Shield className="w-3 h-3 text-blue-400" />
                                    <span className="text-muted">{territory.garrison}/{maxGarrison}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Crown className="w-3 h-3 text-roman-gold" />
                                    <span className="text-muted">Lv.{territory.level}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick action */}
                        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                            <span className="text-xs text-roman-gold">Manage Territory</span>
                            <ChevronRight className="w-4 h-4 text-roman-gold" />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Conquest info */}
                        <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-muted">Required Troops</span>
                                <span className={`text-sm font-bold ${troops >= territory.difficulty * 1.5 ? 'text-green-400' : 'text-red-400'}`}>
                                    {Math.ceil(territory.difficulty * 1.5)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Swords className="w-4 h-4 text-roman-red" />
                                    <span className="text-xs text-roman-red font-medium">Difficulty {territory.difficulty}</span>
                                </div>
                                <Button variant="roman" size="sm" className="text-xs px-3">
                                    Conquer
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-6 fade-in">
            <SectionHeader
                title="Territory Map"
                subtitle="Expand and manage your Roman domains"
                icon={<Map className="w-6 h-6 text-roman-gold" />}
            />

            {/* Empire Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <GlassCard variant="gold" className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-roman-gold/20 flex items-center justify-center">
                            <Landmark className="w-5 h-5 text-roman-gold" />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-roman-gold">{ownedTerritories.length}</div>
                            <div className="text-xs text-muted">Territories</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Wheat className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-400">+{empireStats.totalResources}</div>
                            <div className="text-xs text-muted">Resources/Season</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-400">{empireStats.totalGarrison}</div>
                            <div className="text-xs text-muted">Total Garrison</div>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-400">{empireStats.avgStability}%</div>
                            <div className="text-xs text-muted">Avg Stability</div>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Your Empire Section */}
            {ownedTerritories.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-roman-gold mb-4 flex items-center gap-2">
                        <Crown className="w-5 h-5" /> Your Empire
                    </h3>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {ownedTerritories.map((territory) => (
                            <TerritoryCard
                                key={territory.id}
                                territory={territory}
                                onClick={() => {
                                    setSelectedTerritory(territory);
                                    setActiveTab('overview');
                                }}
                            />
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Conquests Available Section */}
            {conquerableTerritories.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-roman-red mb-4 flex items-center gap-2">
                        <Swords className="w-5 h-5" /> Conquests Available
                        <Badge variant="danger" size="sm">{conquerableTerritories.length}</Badge>
                    </h3>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {conquerableTerritories.map((territory) => (
                            <TerritoryCard
                                key={territory.id}
                                territory={territory}
                                onClick={() => startBattle(territory.id)}
                            />
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Territory Detail Slide-over */}
            <AnimatePresence>
                {selectedTerritory && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedTerritory(null)}
                        />

                        {/* Slide-over panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-gradient-to-b from-[#1a1814] to-[#0f0d0a] border-l border-roman-gold/20 overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-10 bg-gradient-to-b from-[#1a1814] to-transparent p-4 pb-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="gold" size="sm">{selectedTerritory.rarity}</Badge>
                                            <Badge variant="default" size="sm">Level {selectedTerritory.level}</Badge>
                                        </div>
                                        <h2 className="text-2xl font-black text-roman-gold">{selectedTerritory.name}</h2>
                                        <p className="text-sm text-muted italic">{selectedTerritory.latinName}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTerritory(null)}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Level', value: selectedTerritory.level, color: 'text-roman-gold' },
                                        { label: 'Stability', value: `${selectedTerritory.stability}%`, color: selectedTerritory.stability >= 70 ? 'text-green-400' : selectedTerritory.stability >= 40 ? 'text-yellow-400' : 'text-red-400' },
                                        { label: 'Garrison', value: `${selectedTerritory.garrison}`, color: 'text-blue-400' },
                                        { label: 'Defense', value: calculateTerritoryDefense(selectedTerritory.garrison, selectedTerritory.buildings || [], selectedTerritory.stability), color: 'text-purple-400' },
                                    ].map((stat, i) => (
                                        <div key={i} className="text-center p-2 rounded-lg bg-white/5">
                                            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                                            <div className="text-[10px] text-muted">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="px-4 mb-4">
                                <div className="flex gap-1 p-1 bg-white/5 rounded-xl overflow-x-auto">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                                                activeTab === tab.id
                                                    ? 'bg-roman-gold text-black'
                                                    : 'text-muted hover:text-foreground hover:bg-white/5'
                                            }`}
                                        >
                                            {tab.icon}
                                            <span className="hidden sm:inline">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="px-4 pb-8">
                                <AnimatePresence mode="wait">
                                    {/* Overview Tab */}
                                    {activeTab === 'overview' && (
                                        <motion.div
                                            key="overview"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            {/* Description */}
                                            <p className="text-sm text-muted leading-relaxed">{selectedTerritory.description}</p>

                                            {/* Resources */}
                                            <div className="p-4 rounded-xl bg-white/5">
                                                <h4 className="text-sm font-bold text-roman-gold mb-3 flex items-center gap-2">
                                                    <Wheat className="w-4 h-4" /> Resources Produced
                                                </h4>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {selectedTerritory.resources.map((res, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                                                            <span className="text-sm capitalize">{res.type}</span>
                                                            <span className="text-sm font-bold text-green-400">+{res.baseAmount}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Pros & Cons */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                                    <div className="text-xs text-green-400 font-bold mb-2 flex items-center gap-1">
                                                        <Check className="w-3 h-3" /> Advantages
                                                    </div>
                                                    <div className="space-y-1">
                                                        {selectedTerritory.pros.map((pro, i) => (
                                                            <div key={i} className="text-xs text-muted flex items-start gap-1.5">
                                                                <span className="text-green-400 mt-0.5">+</span>
                                                                <span>{pro}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                                    <div className="text-xs text-red-400 font-bold mb-2 flex items-center gap-1">
                                                        <X className="w-3 h-3" /> Challenges
                                                    </div>
                                                    <div className="space-y-1">
                                                        {selectedTerritory.cons.map((con, i) => (
                                                            <div key={i} className="text-xs text-muted flex items-start gap-1.5">
                                                                <span className="text-red-400 mt-0.5">-</span>
                                                                <span>{con}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Historical Background */}
                                            <div className="p-4 rounded-xl bg-roman-gold/5 border border-roman-gold/20">
                                                <div className="text-xs text-roman-gold font-bold mb-2 flex items-center gap-1">
                                                    <ScrollText className="w-3 h-3" /> Historical Background
                                                </div>
                                                <p className="text-xs text-muted leading-relaxed">
                                                    {selectedTerritory.history}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Upgrade Tab */}
                                    {activeTab === 'upgrade' && (
                                        <motion.div
                                            key="upgrade"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            {/* Current Level */}
                                            <div className="p-4 rounded-xl bg-roman-gold/10 border border-roman-gold/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-roman-gold">Current Level</h4>
                                                    <Badge variant="gold">Level {selectedTerritory.level}</Badge>
                                                </div>
                                                <div className="text-lg font-bold">{TERRITORY_LEVELS[selectedTerritory.level].name}</div>
                                                <div className="text-sm text-muted italic mb-2">{TERRITORY_LEVELS[selectedTerritory.level].latinName}</div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted">Production:</span>
                                                        <span className="text-green-400">x{TERRITORY_LEVELS[selectedTerritory.level].productionMultiplier}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted">Stability:</span>
                                                        <span className="text-green-400">+{TERRITORY_LEVELS[selectedTerritory.level].stabilityBonus}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Next Level */}
                                            {selectedTerritory.level < 5 ? (() => {
                                                const nextLevelNum = (selectedTerritory.level + 1) as 1 | 2 | 3 | 4 | 5;
                                                const nextLevel = TERRITORY_LEVELS[nextLevelNum];
                                                const canAfford = denarii >= (nextLevel.upgradeCost || 0);

                                                return (
                                                    <div className={`p-4 rounded-xl border ${canAfford ? 'bg-white/5 border-white/20' : 'bg-white/5 border-white/10 opacity-60'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-bold text-muted">Upgrade to</h4>
                                                            <Badge variant="default">Level {nextLevelNum}</Badge>
                                                        </div>
                                                        <div className="text-lg font-bold">{nextLevel.name}</div>
                                                        <div className="text-sm text-muted italic mb-3">{nextLevel.latinName}</div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted">Production:</span>
                                                                <span className="text-green-400">x{nextLevel.productionMultiplier}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted">Stability:</span>
                                                                <span className="text-green-400">+{nextLevel.stabilityBonus}</span>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="gold"
                                                            className="w-full"
                                                            disabled={!canAfford}
                                                            onClick={() => {
                                                                upgradeTerritoryLevel(selectedTerritory.id);
                                                                refreshSelectedTerritory();
                                                            }}
                                                        >
                                                            <Coins className="w-4 h-4 mr-2" />
                                                            Upgrade for {nextLevel.upgradeCost} denarii
                                                        </Button>
                                                    </div>
                                                );
                                            })() : (
                                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                                                    <Sparkles className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                                    <div className="text-lg font-bold text-green-400">Maximum Level!</div>
                                                    <p className="text-sm text-muted">This territory has reached its full potential.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Buildings Tab */}
                                    {activeTab === 'buildings' && (
                                        <motion.div
                                            key="buildings"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            {/* Built Buildings */}
                                            {(selectedTerritory.buildings || []).length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-bold text-green-400 mb-2">Built ({(selectedTerritory.buildings || []).length})</h4>
                                                    <div className="space-y-2">
                                                        {(selectedTerritory.buildings || []).map(buildingId => {
                                                            const building = TERRITORY_BUILDINGS[buildingId];
                                                            if (!building) return null;
                                                            return (
                                                                <div key={buildingId} className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                                                        <Building2 className="w-5 h-5 text-green-400" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-sm">{building.name}</div>
                                                                        <div className="text-xs text-muted">{building.description}</div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Available Buildings */}
                                            <div>
                                                <h4 className="text-sm font-bold text-roman-gold mb-2">Available</h4>
                                                <div className="space-y-2">
                                                    {Object.values(TERRITORY_BUILDINGS).map(building => {
                                                        const isBuilt = (selectedTerritory.buildings || []).includes(building.id);
                                                        const canAfford = denarii >= building.cost;

                                                        if (isBuilt) return null;

                                                        return (
                                                            <div
                                                                key={building.id}
                                                                className={`p-3 rounded-xl border ${canAfford ? 'bg-white/5 border-white/20' : 'bg-white/5 border-white/10 opacity-50'}`}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                                                            <Building2 className="w-5 h-5 text-muted" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="font-bold text-sm">{building.name}</div>
                                                                            <div className="text-xs text-muted">{building.description}</div>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="roman"
                                                                        size="sm"
                                                                        disabled={!canAfford}
                                                                        onClick={() => {
                                                                            buildTerritoryBuilding(selectedTerritory.id, building.id);
                                                                            refreshSelectedTerritory();
                                                                        }}
                                                                    >
                                                                        {building.cost}d
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Garrison Tab */}
                                    {activeTab === 'garrison' && (
                                        <motion.div
                                            key="garrison"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            {/* Current Garrison */}
                                            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-blue-400">Garrison Status</h4>
                                                    <span className="text-lg font-bold text-blue-400">
                                                        {selectedTerritory.garrison} / {calculateMaxGarrison(selectedTerritory.buildings || [])}
                                                    </span>
                                                </div>
                                                <ProgressBar
                                                    value={selectedTerritory.garrison}
                                                    max={calculateMaxGarrison(selectedTerritory.buildings || [])}
                                                    variant="blue"
                                                />
                                            </div>

                                            {/* Available Troops */}
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                                <span className="text-sm text-muted">Available Troops</span>
                                                <span className="text-lg font-bold text-roman-gold">{troops}</span>
                                            </div>

                                            {/* Transfer Controls */}
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <h4 className="font-bold mb-3">Transfer Troops</h4>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <button
                                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                                                        onClick={() => setGarrisonAmount(Math.max(1, garrisonAmount - 10))}
                                                    >
                                                        <ChevronDown className="w-5 h-5" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={garrisonAmount}
                                                        onChange={e => setGarrisonAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                                        className="flex-1 px-4 py-2 rounded-lg bg-black/30 border border-white/10 text-center text-lg font-bold"
                                                    />
                                                    <button
                                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                                                        onClick={() => setGarrisonAmount(garrisonAmount + 10)}
                                                    >
                                                        <ChevronUp className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button
                                                        variant="roman"
                                                        disabled={troops < garrisonAmount}
                                                        onClick={() => {
                                                            assignGarrison(selectedTerritory.id, garrisonAmount);
                                                            refreshSelectedTerritory();
                                                        }}
                                                    >
                                                        Assign
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        disabled={selectedTerritory.garrison < garrisonAmount}
                                                        onClick={() => {
                                                            recallGarrison(selectedTerritory.id, garrisonAmount);
                                                            refreshSelectedTerritory();
                                                        }}
                                                    >
                                                        Recall
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Governor Tab */}
                                    {activeTab === 'governor' && (
                                        <motion.div
                                            key="governor"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            {/* Current Governor */}
                                            {selectedTerritory.governor ? (
                                                <div className="p-4 rounded-xl bg-roman-gold/10 border border-roman-gold/30">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-roman-gold/20 flex items-center justify-center">
                                                            <User className="w-6 h-6 text-roman-gold" />
                                                        </div>
                                                        <div>
                                                            <div className="text-lg font-bold">{selectedTerritory.governor.name}</div>
                                                            <div className="text-sm text-muted capitalize">{selectedTerritory.governor.trait}</div>
                                                            <div className="text-xs mt-1">
                                                                <span className="text-green-400">{Object.entries(selectedTerritory.governor.bonus).map(([k, v]) => `+${Math.floor(v * 100)}% ${k}`).join(', ')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                                    <User className="w-8 h-8 text-muted mx-auto mb-2" />
                                                    <p className="text-muted">No governor assigned</p>
                                                </div>
                                            )}

                                            {/* Available Governors */}
                                            <div className="space-y-2">
                                                {GOVERNORS.map(gov => {
                                                    const canAfford = denarii >= gov.cost;
                                                    const isAssigned = selectedTerritory.governor?.id === gov.id;

                                                    return (
                                                        <div
                                                            key={gov.id}
                                                            className={`p-3 rounded-xl border ${isAssigned ? 'bg-roman-gold/20 border-roman-gold/50' : canAfford ? 'bg-white/5 border-white/20' : 'bg-white/5 border-white/10 opacity-50'}`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-bold text-sm">{gov.name}</div>
                                                                    <div className="text-xs text-green-400">
                                                                        {Object.entries(gov.bonus).map(([k, v]) => `+${Math.floor(v * 100)}% ${k}`).join(', ')}
                                                                    </div>
                                                                    {Object.keys(gov.malus).length > 0 && (
                                                                        <div className="text-xs text-red-400">
                                                                            {Object.entries(gov.malus).map(([k, v]) => `${Math.floor(v * 100)}% ${k}`).join(', ')}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    variant={isAssigned ? 'ghost' : 'roman'}
                                                                    size="sm"
                                                                    disabled={!canAfford || isAssigned}
                                                                    onClick={() => {
                                                                        assignGovernor(selectedTerritory.id, gov.id);
                                                                        setSelectedTerritory({
                                                                            ...selectedTerritory,
                                                                            governor: {
                                                                                id: gov.id,
                                                                                name: gov.name,
                                                                                trait: gov.trait as GovernorTrait,
                                                                                bonus: { ...gov.bonus },
                                                                                malus: { ...gov.malus }
                                                                            }
                                                                        });
                                                                    }}
                                                                >
                                                                    {isAssigned ? 'Active' : `${gov.cost}d`}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Focus Tab */}
                                    {activeTab === 'focus' && (
                                        <motion.div
                                            key="focus"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="space-y-4"
                                        >
                                            {/* Current Focus */}
                                            {selectedTerritory.focus !== 'none' && TERRITORY_FOCUS[selectedTerritory.focus] && (
                                                <div className="p-4 rounded-xl bg-roman-gold/10 border border-roman-gold/30">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-3xl">{TERRITORY_FOCUS[selectedTerritory.focus].icon}</span>
                                                        <div>
                                                            <div className="text-lg font-bold">{TERRITORY_FOCUS[selectedTerritory.focus].name}</div>
                                                            <div className="text-sm text-green-400">
                                                                {Object.entries(TERRITORY_FOCUS[selectedTerritory.focus].bonus).map(([k, v]) => `+${Math.floor(v * 100)}% ${k}`).join(', ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Available Focus Options */}
                                            <div className="grid grid-cols-2 gap-2">
                                                {Object.entries(TERRITORY_FOCUS).map(([key, focus]) => {
                                                    const canAfford = denarii >= focus.cost;
                                                    const isActive = selectedTerritory.focus === key;

                                                    return (
                                                        <div
                                                            key={key}
                                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-roman-gold/20 border-roman-gold/50' : canAfford ? 'bg-white/5 border-white/20 hover:border-roman-gold/30' : 'bg-white/5 border-white/10 opacity-50'}`}
                                                            onClick={() => {
                                                                if (canAfford && !isActive) {
                                                                    setTerritoryFocus(selectedTerritory.id, key as TerritoryFocus);
                                                                    setSelectedTerritory({ ...selectedTerritory, focus: key as TerritoryFocus });
                                                                }
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xl">{focus.icon}</span>
                                                                <span className="font-bold text-sm">{focus.name}</span>
                                                            </div>
                                                            <div className="text-xs text-green-400 mb-2">
                                                                {Object.entries(focus.bonus).map(([k, v]) => `+${Math.floor(v * 100)}% ${k}`).join(', ')}
                                                            </div>
                                                            <div className="text-xs text-roman-gold">
                                                                {isActive ? 'Active' : `${focus.cost}d`}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
