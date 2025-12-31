'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { staggerContainer, fadeInUp, cardHover } from '@/lib/animations';
import { Map, Landmark, Swords, X, User, Target, Shield, Building2, TrendingUp, Eye, ChevronUp, ChevronDown, Check, ScrollText } from 'lucide-react';
import {
    GOVERNORS, TERRITORY_FOCUS,
    TERRITORY_LEVELS, TERRITORY_BUILDINGS, GARRISON_CONFIG,
    calculateMaxGarrison, calculateTerritoryDefense, calculateBuildingEffects
} from '@/core/constants';
import { GlassCard, Button, Badge, ProgressBar, GameImage } from '@/components/ui';
import { TERRITORY_BUILDING_ASSETS, TERRITORY_FOCUS_ASSETS } from '@/lib/assets';
import type { Territory, TerritoryFocus, GovernorTrait } from '@/core/types';

type TerritoryTab = 'overview' | 'upgrade' | 'buildings' | 'garrison' | 'governor' | 'focus';

export function MapPanel() {
    const {
        territories, startBattle, denarii, troops,
        assignGovernor, setTerritoryFocus,
        upgradeTerritoryLevel, buildTerritoryBuilding, assignGarrison, recallGarrison
    } = useGameStore();
    const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
    const [activeTab, setActiveTab] = useState<TerritoryTab>('overview');
    const [garrisonAmount, setGarrisonAmount] = useState(10);

    const ownedCount = territories.filter(t => t.owned).length;
    const totalCount = territories.length;

    // Refresh selected territory when state changes
    const refreshSelectedTerritory = () => {
        if (selectedTerritory) {
            const updated = territories.find(t => t.id === selectedTerritory.id);
            if (updated) setSelectedTerritory(updated);
        }
    };

    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: <Eye className="w-4 h-4" /> },
        { id: 'upgrade' as const, label: 'Upgrade', icon: <TrendingUp className="w-4 h-4" /> },
        { id: 'buildings' as const, label: 'Buildings', icon: <Building2 className="w-4 h-4" /> },
        { id: 'garrison' as const, label: 'Garrison', icon: <Shield className="w-4 h-4" /> },
        { id: 'governor' as const, label: 'Governor', icon: <User className="w-4 h-4" /> },
        { id: 'focus' as const, label: 'Focus', icon: <Target className="w-4 h-4" /> },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-roman-gold/10 border border-roman-gold/20">
                    <Map className="w-6 h-6 text-roman-gold" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-roman-gold">Territory Map</h2>
                    <p className="text-sm text-muted">
                        Controlling {ownedCount} of {totalCount} territories
                    </p>
                </div>
            </div>

            {/* Territory Grid */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                {territories.map((territory) => (
                    <motion.div
                        key={territory.id}
                        variants={fadeInUp}
                        className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            territory.owned
                                ? 'bg-gradient-to-br from-roman-gold/10 to-transparent border-roman-gold/50 shadow-glow-gold'
                                : 'bg-paper-light border-line hover:border-roman-gold/30'
                        }`}
                        whileHover={cardHover.whileHover}
                        whileTap={cardHover.whileTap}
                        onClick={() => {
                            if (territory.owned) {
                                setSelectedTerritory(territory);
                                setActiveTab('overview');
                            } else {
                                startBattle(territory.id);
                            }
                        }}
                    >
                        <div className="text-center">
                            {/* Icon */}
                            <div className={`inline-flex p-3 rounded-xl mb-3 ${
                                territory.owned
                                    ? 'bg-roman-gold/20'
                                    : 'bg-roman-red/20'
                            }`}>
                                {territory.owned ? (
                                    <Landmark className="w-6 h-6 text-roman-gold" />
                                ) : (
                                    <Swords className="w-6 h-6 text-roman-red" />
                                )}
                            </div>

                            {/* Name */}
                            <h3 className="font-bold text-roman-gold">{territory.name}</h3>
                            <p className="text-xs text-muted italic mb-2">{territory.latinName}</p>

                            {/* Status Badge */}
                            <div className={`text-xs px-3 py-1 rounded-full inline-block ${
                                territory.owned
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-roman-red/20 text-roman-red border border-roman-red/30'
                            }`}>
                                {territory.owned ? 'Controlled' : `Difficulty: ${territory.difficulty}`}
                            </div>

                            {/* Owned Details */}
                            {territory.owned && (
                                <div className="mt-3 pt-3 border-t border-line text-xs text-muted space-y-1">
                                    <div className="flex justify-between">
                                        <span>Level</span>
                                        <span className="text-roman-gold">{territory.level} - {TERRITORY_LEVELS[territory.level].name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Stability</span>
                                        <span className={territory.stability >= 70 ? 'text-green-400' : territory.stability >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                                            {territory.stability}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Garrison</span>
                                        <span className="text-settlement">{territory.garrison}/{calculateMaxGarrison(territory.buildings || [])}</span>
                                    </div>
                                </div>
                            )}

                            {/* Action hints */}
                            {territory.owned ? (
                                <div className="mt-3 text-xs text-roman-gold">
                                    Click to manage
                                </div>
                            ) : (
                                <div className="mt-3 text-xs text-muted">
                                    Click to conquer
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Territory Detail Panel */}
            <AnimatePresence>
                {selectedTerritory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={() => setSelectedTerritory(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <GlassCard variant="gold" className="p-6">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-roman-gold">{selectedTerritory.name}</h2>
                                        <p className="text-sm text-muted italic">{selectedTerritory.latinName}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTerritory(null)}
                                        className="p-2 rounded-lg hover:bg-white/10"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-4 gap-3 mb-4">
                                    <div className="text-center p-3 rounded-xl bg-white/5">
                                        <div className="text-xl font-bold text-roman-gold">{selectedTerritory.level}</div>
                                        <div className="text-xs text-muted">{TERRITORY_LEVELS[selectedTerritory.level].name}</div>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-white/5">
                                        <div className={`text-xl font-bold ${selectedTerritory.stability >= 70 ? 'text-green-400' : selectedTerritory.stability >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {selectedTerritory.stability}%
                                        </div>
                                        <div className="text-xs text-muted">Stability</div>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-white/5">
                                        <div className="text-xl font-bold text-settlement">
                                            {selectedTerritory.garrison}/{calculateMaxGarrison(selectedTerritory.buildings || [])}
                                        </div>
                                        <div className="text-xs text-muted">Garrison</div>
                                    </div>
                                    <div className="text-center p-3 rounded-xl bg-white/5">
                                        <div className="text-xl font-bold text-military">
                                            {calculateTerritoryDefense(selectedTerritory.garrison, selectedTerritory.buildings || [], selectedTerritory.stability)}
                                        </div>
                                        <div className="text-xs text-muted">Defense</div>
                                    </div>
                                </div>

                                {/* Tab Navigation */}
                                <div className="flex gap-1 border-b border-line pb-2 mb-4 overflow-x-auto">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                                                activeTab === tab.id
                                                    ? 'bg-roman-gold/20 text-roman-gold'
                                                    : 'text-muted hover:text-foreground hover:bg-white/5'
                                            }`}
                                        >
                                            {tab.icon}
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

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
                                            {/* Resources */}
                                            <div>
                                                <h4 className="text-sm font-bold text-roman-gold mb-2">Resources Produced</h4>
                                                {selectedTerritory.resources.length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {selectedTerritory.resources.map((res, idx) => (
                                                            <div key={idx} className="p-2 rounded-lg bg-white/5 flex items-center justify-between">
                                                                <span className="text-sm capitalize">{res.type}</span>
                                                                <span className="text-sm text-roman-gold">+{res.baseAmount}/season</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted">No natural resources</p>
                                                )}
                                            </div>

                                            {/* Active Bonuses */}
                                            <div>
                                                <h4 className="text-sm font-bold text-roman-gold mb-2">Active Bonuses</h4>
                                                <div className="space-y-2">
                                                    {/* Level bonus */}
                                                    <div className="p-2 rounded-lg bg-white/5 flex items-center justify-between">
                                                        <span className="text-sm">Level {selectedTerritory.level} ({TERRITORY_LEVELS[selectedTerritory.level].name})</span>
                                                        <span className="text-sm text-green-400">x{TERRITORY_LEVELS[selectedTerritory.level].productionMultiplier} production</span>
                                                    </div>
                                                    {/* Building bonuses */}
                                                    {(selectedTerritory.buildings || []).length > 0 && (() => {
                                                        const effects = calculateBuildingEffects(selectedTerritory.buildings || []);
                                                        return (
                                                            <div className="p-2 rounded-lg bg-white/5">
                                                                <span className="text-sm">Building Effects:</span>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {effects.defense && <Badge variant="default">+{effects.defense} Defense</Badge>}
                                                                    {effects.stability && <Badge variant="default">+{effects.stability} Stability</Badge>}
                                                                    {effects.happiness && <Badge variant="default">+{effects.happiness}% Happy</Badge>}
                                                                    {effects.income && <Badge variant="default">+{Math.floor(effects.income * 100)}% Income</Badge>}
                                                                    {effects.tradeRisk && <Badge variant="default">{Math.floor(effects.tradeRisk * 100)}% Risk</Badge>}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                    {/* Governor bonus */}
                                                    {selectedTerritory.governor && (
                                                        <div className="p-2 rounded-lg bg-white/5">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm">Governor: {selectedTerritory.governor.name}</span>
                                                            </div>
                                                            <div className="text-xs mt-1">
                                                                <span className="text-green-400">
                                                                    {Object.entries(selectedTerritory.governor.bonus).map(([k, v]) => `+${Math.floor(v * 100)}% ${k}`).join(', ')}
                                                                </span>
                                                                {Object.keys(selectedTerritory.governor.malus).length > 0 && (
                                                                    <span className="text-red-400 ml-2">
                                                                        {Object.entries(selectedTerritory.governor.malus).map(([k, v]) => `${Math.floor(v * 100)}% ${k}`).join(', ')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Focus bonus */}
                                                    {selectedTerritory.focus !== 'none' && TERRITORY_FOCUS[selectedTerritory.focus] && (
                                                        <div className="p-2 rounded-lg bg-white/5 flex items-center justify-between">
                                                            <span className="text-sm">{TERRITORY_FOCUS[selectedTerritory.focus].name}</span>
                                                            <span className="text-sm text-green-400">
                                                                {Object.entries(TERRITORY_FOCUS[selectedTerritory.focus].bonus).map(([k, v]) => `+${Math.floor(v * 100)}% ${k}`).join(', ')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <p className="text-sm text-muted leading-relaxed">{selectedTerritory.description}</p>
                                            </div>

                                            {/* Pros & Cons */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-xl bg-white/5">
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
                                                <div className="p-3 rounded-xl bg-white/5">
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
                                            <div className="p-4 rounded-xl bg-white/5">
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
                                                        <span className="text-muted">Stability Bonus:</span>
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
                                                            <h4 className="font-bold text-muted">Next Level</h4>
                                                            <Badge variant="default">Level {nextLevelNum}</Badge>
                                                        </div>
                                                        <div className="text-lg font-bold">{nextLevel.name}</div>
                                                        <div className="text-sm text-muted italic mb-2">{nextLevel.latinName}</div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted">Production:</span>
                                                                <span className="text-green-400">x{nextLevel.productionMultiplier}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted">Stability Bonus:</span>
                                                                <span className="text-green-400">+{nextLevel.stabilityBonus}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-roman-gold font-bold">{nextLevel.upgradeCost} denarii</span>
                                                            <Button
                                                                variant="roman"
                                                                disabled={!canAfford}
                                                                onClick={() => {
                                                                    upgradeTerritoryLevel(selectedTerritory.id);
                                                                    refreshSelectedTerritory();
                                                                }}
                                                            >
                                                                Upgrade to {nextLevel.name}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })() : (
                                                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                                                    <div className="text-lg font-bold text-green-400">Maximum Level Reached!</div>
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
                                            <div>
                                                <h4 className="text-sm font-bold text-roman-gold mb-2">Built ({(selectedTerritory.buildings || []).length})</h4>
                                                {(selectedTerritory.buildings || []).length > 0 ? (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {(selectedTerritory.buildings || []).map(buildingId => {
                                                            const building = TERRITORY_BUILDINGS[buildingId];
                                                            if (!building) return null;
                                                            return (
                                                                <div key={buildingId} className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                                                                    <div className="flex items-center gap-2">
                                                                        <GameImage src={TERRITORY_BUILDING_ASSETS[building.id] || building.icon} size="lg" alt={building.name} />
                                                                        <div>
                                                                            <div className="font-bold text-sm">{building.name}</div>
                                                                            <div className="text-xs text-muted italic">{building.latinName}</div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-muted">No buildings constructed</p>
                                                )}
                                            </div>

                                            {/* Available Buildings */}
                                            <div>
                                                <h4 className="text-sm font-bold text-roman-gold mb-2">Available Buildings</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {Object.values(TERRITORY_BUILDINGS).map(building => {
                                                        const isBuilt = (selectedTerritory.buildings || []).includes(building.id);
                                                        const canAfford = denarii >= building.cost;

                                                        if (isBuilt) return null;

                                                        return (
                                                            <motion.div
                                                                key={building.id}
                                                                className={`p-3 rounded-xl border ${canAfford ? 'bg-white/5 border-white/20 hover:border-roman-gold/30' : 'bg-white/5 border-white/10 opacity-50'}`}
                                                                whileHover={canAfford ? { scale: 1.02 } : {}}
                                                            >
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <GameImage src={TERRITORY_BUILDING_ASSETS[building.id] || building.icon} size="lg" alt={building.name} />
                                                                    <div>
                                                                        <div className="font-bold text-sm">{building.name}</div>
                                                                        <div className="text-xs text-muted italic">{building.latinName}</div>
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-muted mb-2">{building.description}</p>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-roman-gold">{building.cost}d</span>
                                                                    <Button
                                                                        variant="roman"
                                                                        size="sm"
                                                                        disabled={!canAfford}
                                                                        onClick={() => {
                                                                            buildTerritoryBuilding(selectedTerritory.id, building.id);
                                                                            refreshSelectedTerritory();
                                                                        }}
                                                                    >
                                                                        Build
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
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
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-bold text-settlement">Garrison Status</h4>
                                                    <span className="text-lg font-bold">
                                                        {selectedTerritory.garrison} / {calculateMaxGarrison(selectedTerritory.buildings || [])}
                                                    </span>
                                                </div>
                                                <ProgressBar
                                                    value={selectedTerritory.garrison}
                                                    max={calculateMaxGarrison(selectedTerritory.buildings || [])}
                                                    variant="blue"
                                                />
                                                <div className="mt-2 text-xs text-muted">
                                                    Defense Value: {calculateTerritoryDefense(selectedTerritory.garrison, selectedTerritory.buildings || [], selectedTerritory.stability)}
                                                </div>
                                            </div>

                                            {/* Available Troops */}
                                            <div className="p-3 rounded-xl bg-military/10 border border-military/30">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Available Troops</span>
                                                    <span className="text-lg font-bold text-military">{troops}</span>
                                                </div>
                                            </div>

                                            {/* Garrison Amount Controls */}
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                                <h4 className="font-bold mb-3">Troops to Transfer</h4>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <button
                                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                                        onClick={() => setGarrisonAmount(Math.max(1, garrisonAmount - 10))}
                                                    >
                                                        <ChevronDown className="w-5 h-5" />
                                                    </button>
                                                    <input
                                                        type="number"
                                                        value={garrisonAmount}
                                                        onChange={e => setGarrisonAmount(Math.max(1, parseInt(e.target.value) || 1))}
                                                        className="flex-1 px-4 py-2 rounded-lg bg-bg border border-line text-center text-lg font-bold"
                                                    />
                                                    <button
                                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                                        onClick={() => setGarrisonAmount(garrisonAmount + 10)}
                                                    >
                                                        <ChevronUp className="w-5 h-5" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button
                                                        variant="roman"
                                                        disabled={troops < garrisonAmount || selectedTerritory.garrison >= calculateMaxGarrison(selectedTerritory.buildings || [])}
                                                        onClick={() => {
                                                            assignGarrison(selectedTerritory.id, garrisonAmount);
                                                            refreshSelectedTerritory();
                                                        }}
                                                    >
                                                        Assign {garrisonAmount}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        disabled={selectedTerritory.garrison < garrisonAmount}
                                                        onClick={() => {
                                                            recallGarrison(selectedTerritory.id, garrisonAmount);
                                                            refreshSelectedTerritory();
                                                        }}
                                                    >
                                                        Recall {garrisonAmount}
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Stability Impact */}
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                                <h4 className="text-sm font-bold mb-2">Garrison Info</h4>
                                                <div className="space-y-1 text-xs text-muted">
                                                    <p>• Build a Garrison building to increase max capacity by {GARRISON_CONFIG.garrisonBuildingBonus}</p>
                                                    <p>• Troops provide +1 stability per {GARRISON_CONFIG.stabilityPerTroops} garrison</p>
                                                    <p>• Under-garrisoned territories lose stability each season</p>
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
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-bold text-roman-gold">Current Governor</h4>
                                                        <Badge variant="gold">Active</Badge>
                                                    </div>
                                                    <div className="text-lg font-bold">{selectedTerritory.governor.name}</div>
                                                    <div className="text-sm text-muted capitalize mb-2">{selectedTerritory.governor.trait}</div>
                                                    <div className="text-xs">
                                                        <span className="text-green-400">{Object.entries(selectedTerritory.governor.bonus).map(([k, v]) => `+${Math.floor(v * 100)}% ${k}`).join(', ')}</span>
                                                        {Object.keys(selectedTerritory.governor.malus).length > 0 && (
                                                            <span className="text-red-400 ml-2">{Object.entries(selectedTerritory.governor.malus).map(([k, v]) => `${Math.floor(v * 100)}% ${k}`).join(', ')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                                    <p className="text-muted">No governor assigned</p>
                                                </div>
                                            )}

                                            {/* Available Governors */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {GOVERNORS.map(gov => {
                                                    const canAfford = denarii >= gov.cost;
                                                    const isAssigned = selectedTerritory.governor?.id === gov.id;
                                                    const bonusText = Object.entries(gov.bonus).map(([k, v]) => `+${Math.floor(v * 100)}% ${k}`).join(', ');
                                                    const malusText = Object.entries(gov.malus).map(([k, v]) => `${Math.floor(v * 100)}% ${k}`).join(', ');

                                                    return (
                                                        <motion.div
                                                            key={gov.id}
                                                            className={`p-4 rounded-xl border ${isAssigned ? 'bg-roman-gold/20 border-roman-gold/50' : canAfford ? 'bg-white/5 border-white/20 hover:border-roman-gold/30' : 'bg-white/5 border-white/10 opacity-50'}`}
                                                            whileHover={canAfford && !isAssigned ? { scale: 1.02 } : {}}
                                                        >
                                                            <div className="text-sm font-bold">{gov.name}</div>
                                                            <div className="text-xs text-muted capitalize mb-2">{gov.trait}</div>
                                                            <div className="text-xs text-green-400 mb-1">{bonusText}</div>
                                                            <div className="text-xs text-red-400 mb-3">{malusText}</div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-roman-gold">{gov.cost}d</span>
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
                                                                    {isAssigned ? 'Assigned' : 'Assign'}
                                                                </Button>
                                                            </div>
                                                        </motion.div>
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
                                            {selectedTerritory.focus !== 'none' && TERRITORY_FOCUS[selectedTerritory.focus] ? (
                                                <div className="p-4 rounded-xl bg-roman-gold/10 border border-roman-gold/30">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-bold text-roman-gold">Current Focus</h4>
                                                        <Badge variant="gold">Active</Badge>
                                                    </div>
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
                                            ) : (
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
                                                    <p className="text-muted">No focus selected</p>
                                                </div>
                                            )}

                                            {/* Available Focus Options */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(TERRITORY_FOCUS).map(([key, focus]) => {
                                                    const canAfford = denarii >= focus.cost;
                                                    const isActive = selectedTerritory.focus === key;
                                                    const bonusText = Object.entries(focus.bonus).map(([k, v]) => `+${Math.floor(v * 100)}% ${k}`).join(', ');

                                                    return (
                                                        <motion.div
                                                            key={key}
                                                            className={`p-4 rounded-xl border ${isActive ? 'bg-roman-gold/20 border-roman-gold/50' : canAfford ? 'bg-white/5 border-white/20 hover:border-roman-gold/30' : 'bg-white/5 border-white/10 opacity-50'}`}
                                                            whileHover={canAfford && !isActive ? { scale: 1.02 } : {}}
                                                        >
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <GameImage src={TERRITORY_FOCUS_ASSETS[key] || focus.icon} size="lg" alt={focus.name} />
                                                                <span className="font-bold">{focus.name}</span>
                                                            </div>
                                                            <div className="text-xs text-green-400 mb-3">{bonusText}</div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-roman-gold">{focus.cost}d</span>
                                                                <Button
                                                                    variant={isActive ? 'ghost' : 'roman'}
                                                                    size="sm"
                                                                    disabled={!canAfford || isActive}
                                                                    onClick={() => {
                                                                        setTerritoryFocus(selectedTerritory.id, key as TerritoryFocus);
                                                                        setSelectedTerritory({ ...selectedTerritory, focus: key as TerritoryFocus });
                                                                    }}
                                                                >
                                                                    {isActive ? 'Active' : 'Set'}
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
