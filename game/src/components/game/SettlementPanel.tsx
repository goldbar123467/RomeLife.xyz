'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, SectionHeader, ProgressBar, GameImage, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, Badge } from '@/components/ui';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { gameToast } from '@/lib/toast';
import { Home, Droplets, Shield, Building2, Info, Wheat, Coins, Heart, Sparkles, Package } from 'lucide-react';
import type { Building, ResourceType } from '@/core/types';

// Calculate total building buffs from all buildings
const calculateBuildingBuffs = (buildings: Building[]) => {
    const buffs = {
        grainProduction: 0,
        income: 0,
        defense: 0,
        happiness: 0,
        piety: 0,
        capacity: 0,
    };

    for (const building of buildings) {
        if (building.count === 0) continue;
        for (const effect of building.effects) {
            const total = effect.value * building.count;
            if (effect.multiplier && effect.resource === 'grain') {
                buffs.grainProduction += Math.round((total - building.count) * 100); // Convert 1.3x to +30% per building
            } else if (effect.type === 'income') {
                buffs.income += total;
            } else if (effect.type === 'defense') {
                buffs.defense += total;
            } else if (effect.type === 'happiness') {
                buffs.happiness += total;
            } else if (effect.type === 'piety') {
                buffs.piety += total;
            } else if (effect.type === 'capacity') {
                buffs.capacity += total;
            }
        }
    }
    return buffs;
};

export function SettlementPanel() {
    const state = useGameStore();
    const { population, housing, sanitation, forts, denarii, buildings, buildStructure, inventory } = state;
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

    // Calculate building stats
    const totalBuildingCount = buildings.reduce((sum, b) => sum + b.count, 0);
    const builtBuildings = buildings.filter(b => b.count > 0);
    const buildingBuffs = calculateBuildingBuffs(buildings);

    const housingCapacity = housing;
    const housingUsed = population;
    const housingPercent = (housingUsed / housingCapacity) * 100;

    const sanitationEfficiency = sanitation > 50 ? 'Good' : sanitation > 25 ? 'Adequate' : 'Poor';
    const diseaseRisk = sanitation < 30 ? 'High' : sanitation < 50 ? 'Medium' : 'Low';

    const handleBuild = (building: Building) => {
        // Check denarii
        if (denarii < building.cost.denarii) {
            gameToast.danger('Not Enough Denarii', `You need ${building.cost.denarii - denarii} more denarii to build ${building.name}`);
            return;
        }

        // Check resource costs
        if (building.cost.resources) {
            for (const [resource, amount] of Object.entries(building.cost.resources)) {
                const have = inventory[resource as ResourceType] || 0;
                if (have < amount) {
                    gameToast.danger('Not Enough Resources', `You need ${amount - have} more ${resource} to build ${building.name}`);
                    return;
                }
            }
        }

        buildStructure(building.id);
        gameToast.building(`${building.name} Built!`, `Your empire grows stronger`);
        setSelectedBuilding(null);
    };

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Settlement"
                subtitle="Manage housing, sanitation, and city defenses"
                icon={<Building2 className="w-6 h-6 text-roman-gold" />}
            />

            {/* Key Stats */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{population}</div>
                        <div className="text-sm text-muted">Population</div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">{housing}</div>
                        <div className="text-sm text-muted">Housing Capacity</div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-cyan-400">{sanitation}</div>
                        <div className="text-sm text-muted">Sanitation</div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400">{forts}</div>
                        <div className="text-sm text-muted">Forts</div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Building2 className="w-4 h-4 text-roman-gold" />
                        </div>
                        <div className="text-3xl font-bold text-roman-gold">{totalBuildingCount}</div>
                        <div className="text-sm text-muted">Buildings</div>
                    </GlassCard>
                </motion.div>
            </motion.div>

            {/* Housing Details */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-roman-gold mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5" /> Housing
                </h3>

                <div className="mb-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-muted">Population / Capacity</span>
                        <span className="font-mono">{population} / {housing}</span>
                    </div>
                    <ProgressBar
                        value={population}
                        max={housing}
                        variant={housingPercent > 90 ? 'danger' : housingPercent > 70 ? 'gold' : 'default'}
                        showLabel={true}
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="glass-dark rounded-xl p-4">
                        <div className="text-sm text-muted mb-1">Housing Status</div>
                        <div className={`text-lg font-bold ${housingPercent >= 100 ? 'text-red-400' :
                            housingPercent >= 80 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                            {housingPercent >= 100 ? 'Overcrowded!' :
                                housingPercent >= 80 ? 'Nearly Full' : 'Adequate'}
                        </div>
                    </div>

                    <div className="glass-dark rounded-xl p-4">
                        <div className="text-sm text-muted mb-1">Growth Capacity</div>
                        <div className={`text-lg font-bold ${housing - population > 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {Math.max(0, housing - population)} spaces available
                        </div>
                    </div>
                </div>

                <p className="text-sm text-muted mt-4">
                    Build more housing to allow population growth. Without housing, your population cannot expand.
                </p>
            </GlassCard>

            {/* Sanitation */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-roman-gold mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5" /> Sanitation & Health
                </h3>

                <div className="mb-4">
                    <div className="flex justify-between mb-2">
                        <span className="text-muted">Sanitation Level</span>
                        <span className="font-mono">{sanitation}</span>
                    </div>
                    <ProgressBar
                        value={sanitation}
                        max={100}
                        variant={sanitation < 30 ? 'danger' : sanitation < 60 ? 'gold' : 'default'}
                    />
                </div>

                <motion.div
                    className="grid md:grid-cols-3 gap-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div variants={fadeInUp} className="glass-dark rounded-xl p-4">
                        <div className="text-sm text-muted mb-1">Efficiency</div>
                        <div className={`text-lg font-bold ${sanitationEfficiency === 'Good' ? 'text-green-400' :
                            sanitationEfficiency === 'Adequate' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            {sanitationEfficiency}
                        </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="glass-dark rounded-xl p-4">
                        <div className="text-sm text-muted mb-1">Disease Risk</div>
                        <div className={`text-lg font-bold ${diseaseRisk === 'Low' ? 'text-green-400' :
                            diseaseRisk === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                            {diseaseRisk}
                        </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="glass-dark rounded-xl p-4">
                        <div className="text-sm text-muted mb-1">Pop. Growth Effect</div>
                        <div className={`text-lg font-bold ${sanitation >= 30 ? 'text-green-400' : 'text-red-400'}`}>
                            {sanitation >= 30 ? '+Normal' : '-50% Penalty'}
                        </div>
                    </motion.div>
                </motion.div>
            </GlassCard>

            {/* Defenses */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-roman-gold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" /> City Defenses
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="glass-dark rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <GameImage src="shield" size="xl" alt="Fort" />
                            <div>
                                <div className="text-2xl font-bold text-roman-gold">{forts}</div>
                                <div className="text-sm text-muted">Forts Built</div>
                            </div>
                        </div>
                        <div className="text-sm text-muted">
                            Each fort provides +5 defense and reduces trade risk by 2%
                        </div>
                    </div>

                    <div className="glass-dark rounded-xl p-4">
                        <div className="text-sm text-muted mb-2">Defense Bonuses</div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Fort Defense</span>
                                <span className="text-green-400">+{forts * 5}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Trade Risk Reduction</span>
                                <span className="text-green-400">-{forts * 2}%</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Territory Stability</span>
                                <span className="text-green-400">+{forts * 3}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* City Buildings Dashboard */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-roman-gold mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> City Buildings
                </h3>

                {/* Constructed Buildings */}
                <h4 className="text-sm font-semibold text-muted mb-3">Constructed Buildings</h4>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
                    {builtBuildings.length > 0 ? (
                        builtBuildings.map(building => (
                            <div
                                key={building.id}
                                className="flex flex-col items-center p-3 rounded-lg bg-surface/30 border border-roman-gold/20"
                            >
                                <Badge className="text-lg font-bold bg-roman-gold/20 text-roman-gold border-none">
                                    {building.count}
                                </Badge>
                                <span className="text-xs text-muted mt-1 text-center truncate w-full">
                                    {building.name}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-full text-muted text-sm italic">
                            No buildings constructed yet
                        </p>
                    )}
                </div>

                {/* Building Buffs Summary */}
                <div className="border-t border-white/10 my-4" />
                <h4 className="text-sm font-semibold text-muted mb-3">Active Building Buffs</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {buildingBuffs.grainProduction > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                            <Wheat className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">+{buildingBuffs.grainProduction}% Grain</span>
                        </div>
                    )}
                    {buildingBuffs.income > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                            <Coins className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-400">+{buildingBuffs.income} Income</span>
                        </div>
                    )}
                    {buildingBuffs.defense > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-400">+{buildingBuffs.defense} Defense</span>
                        </div>
                    )}
                    {buildingBuffs.happiness > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-pink-500/10 rounded border border-pink-500/20">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="text-pink-400">+{buildingBuffs.happiness} Happiness</span>
                        </div>
                    )}
                    {buildingBuffs.piety > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded border border-purple-500/20">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400">+{buildingBuffs.piety} Piety</span>
                        </div>
                    )}
                    {buildingBuffs.capacity > 0 && (
                        <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded border border-orange-500/20">
                            <Package className="w-4 h-4 text-orange-400" />
                            <span className="text-orange-400">+{buildingBuffs.capacity} Storage</span>
                        </div>
                    )}
                    {totalBuildingCount === 0 && (
                        <p className="col-span-full text-muted text-sm italic">
                            Build structures to gain bonuses
                        </p>
                    )}
                </div>
            </GlassCard>

            {/* Build Structures - Show ALL buildings */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-roman-gold mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" /> Build Structures
                </h3>

                <motion.div
                    className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {buildings.map(building => {
                        const hasEnoughDenarii = denarii >= building.cost.denarii;
                        const hasEnoughResources = !building.cost.resources || Object.entries(building.cost.resources).every(
                            ([res, amount]) => (inventory[res as ResourceType] || 0) >= amount
                        );
                        const canAfford = hasEnoughDenarii && hasEnoughResources;

                        return (
                            <motion.div
                                key={building.id}
                                variants={fadeInUp}
                                className={`glass-dark rounded-xl p-3 md:p-4 relative cursor-pointer ${!canAfford ? 'opacity-60' : ''}`}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedBuilding(building)}
                            >
                                {/* Count badge */}
                                {building.count > 0 && (
                                    <Badge className="absolute -top-2 -right-2 bg-roman-gold text-black font-bold">
                                        x{building.count}
                                    </Badge>
                                )}
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-bold text-roman-gold text-sm md:text-base">{building.name}</h4>
                                    <Info className="w-4 h-4 text-muted" />
                                </div>
                                <div className={`text-xs md:text-sm mb-2 md:mb-3 ${canAfford ? 'text-muted' : 'text-red-400'}`}>
                                    {building.cost.denarii} denarii
                                </div>
                                {/* Show effects preview */}
                                <div className="text-xs text-muted">
                                    {building.effects.slice(0, 2).map((e, i) => (
                                        <div key={i}>+{e.value} {e.type}</div>
                                    ))}
                                </div>
                                {/* Status indicator */}
                                <div className={`mt-2 text-xs font-medium text-center py-1 rounded ${
                                    canAfford
                                        ? 'text-green-400 bg-green-500/10'
                                        : 'text-red-400 bg-red-500/10'
                                }`}>
                                    {canAfford ? (building.count > 0 ? 'Tap to build more' : 'Available') : 'Cannot afford'}
                                </div>
                            </motion.div>
                        );
                    })}
                    </motion.div>
                </GlassCard>

            {/* Building Detail Sheet */}
            <Sheet open={!!selectedBuilding} onOpenChange={(open) => !open && setSelectedBuilding(null)}>
                <SheetContent side="bottom">
                    {selectedBuilding && (
                        <>
                            <SheetHeader>
                                <SheetTitle>
                                    {selectedBuilding.name}
                                    {selectedBuilding.count > 0 && (
                                        <Badge className="ml-2 bg-roman-gold text-black">x{selectedBuilding.count}</Badge>
                                    )}
                                </SheetTitle>
                                <SheetDescription>
                                    Category: {selectedBuilding.category}
                                </SheetDescription>
                            </SheetHeader>

                            <div className="py-6 space-y-4">
                                {/* Cost */}
                                <div className="glass-dark rounded-xl p-4">
                                    <div className="text-sm text-muted mb-2">Construction Cost</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">🪙</span>
                                        <span className="text-xl font-bold text-[#f0c14b]">
                                            {selectedBuilding.cost.denarii} denarii
                                        </span>
                                    </div>
                                    {denarii < selectedBuilding.cost.denarii && (
                                        <div className="text-sm text-red-400 mt-2">
                                            You need {selectedBuilding.cost.denarii - denarii} more denarii
                                        </div>
                                    )}
                                </div>

                                {/* Effects */}
                                <div className="glass-dark rounded-xl p-4">
                                    <div className="text-sm text-muted mb-3">Building Effects</div>
                                    <div className="space-y-2">
                                        {selectedBuilding.effects.map((effect, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <span className="text-[#e8e4dc] capitalize">{effect.type}</span>
                                                <span className="text-green-400 font-bold">
                                                    {effect.multiplier ? `x${effect.value}` : `+${effect.value}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Resource costs if any */}
                                {selectedBuilding.cost.resources && Object.keys(selectedBuilding.cost.resources).length > 0 && (
                                    <div className="glass-dark rounded-xl p-4">
                                        <div className="text-sm text-muted mb-3">Resource Requirements</div>
                                        <div className="space-y-2">
                                            {Object.entries(selectedBuilding.cost.resources).map(([resource, amount]) => {
                                                const have = inventory[resource as ResourceType] || 0;
                                                const hasEnough = have >= amount;
                                                return (
                                                    <div key={resource} className="flex justify-between items-center">
                                                        <span className="text-[#e8e4dc] capitalize">{resource}</span>
                                                        <span className={`font-bold ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                                                            {have}/{amount}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <SheetFooter>
                                {(() => {
                                    const hasEnoughDenarii = denarii >= selectedBuilding.cost.denarii;
                                    const hasEnoughResources = !selectedBuilding.cost.resources || Object.entries(selectedBuilding.cost.resources).every(
                                        ([res, amt]) => (inventory[res as ResourceType] || 0) >= amt
                                    );
                                    const canBuild = hasEnoughDenarii && hasEnoughResources;
                                    return (
                                        <Button
                                            variant="gold"
                                            size="lg"
                                            className="w-full"
                                            onClick={() => handleBuild(selectedBuilding)}
                                            disabled={!canBuild}
                                        >
                                            {canBuild
                                                ? (selectedBuilding.count > 0 ? 'Build Another' : 'Construct Building')
                                                : (!hasEnoughDenarii ? 'Insufficient Denarii' : 'Insufficient Resources')}
                                        </Button>
                                    );
                                })()}
                            </SheetFooter>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
