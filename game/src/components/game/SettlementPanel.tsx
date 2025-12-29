'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, SectionHeader, ProgressBar } from '@/components/ui';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { Home, Droplets, Shield, Building2 } from 'lucide-react';

export function SettlementPanel() {
    const state = useGameStore();
    const { population, housing, sanitation, forts, denarii, buildings, buildStructure } = state;

    // Find buildable structures related to settlement
    const settlementBuildings = buildings.filter(b =>
        !b.built && (b.category === 'civic' || b.name.includes('Wall') || b.name.includes('Temple'))
    );

    const housingCapacity = housing;
    const housingUsed = population;
    const housingPercent = (housingUsed / housingCapacity) * 100;

    const sanitationEfficiency = sanitation > 50 ? 'Good' : sanitation > 25 ? 'Adequate' : 'Poor';
    const diseaseRisk = sanitation < 30 ? 'High' : sanitation < 50 ? 'Medium' : 'Low';

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Settlement"
                subtitle="Manage housing, sanitation, and city defenses"
                icon={<Building2 className="w-6 h-6 text-roman-gold" />}
            />

            {/* Key Stats */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
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
                            {housingPercent >= 100 ? '🚨 Overcrowded!' :
                                housingPercent >= 80 ? '⚠️ Nearly Full' : '✅ Adequate'}
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
                            <span className="text-4xl">🏰</span>
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

            {/* Buildings Available */}
            {settlementBuildings.length > 0 && (
                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-roman-gold mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5" /> Available Structures
                    </h3>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {settlementBuildings.slice(0, 6).map(building => {
                            const canAfford = denarii >= building.cost.denarii;

                            return (
                                <motion.div
                                    key={building.id}
                                    variants={fadeInUp}
                                    className={`glass-dark rounded-xl p-4 ${!canAfford ? 'opacity-60' : ''}`}
                                    whileHover={canAfford ? { scale: 1.02 } : {}}
                                >
                                    <h4 className="font-bold text-roman-gold mb-2">{building.name}</h4>
                                    <div className="text-sm text-muted mb-3">
                                        Cost: {building.cost.denarii} 🪙
                                    </div>
                                    <Button
                                        variant="gold"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => buildStructure(building.id)}
                                        disabled={!canAfford}
                                    >
                                        Build
                                    </Button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </GlassCard>
            )}
        </div>
    );
}
