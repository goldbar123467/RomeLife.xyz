'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, Badge, SectionHeader, ProgressBar, GameImage } from '@/components/ui';
import { MILITARY_UNITS } from '@/core/constants';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { Swords, Shield, Users, Trophy } from 'lucide-react';
import { gameToast } from '@/lib/toast';

export function MilitaryPanel() {
    const state = useGameStore();
    const { troops, morale, supplies, forts, denarii, inventory, recruitTroops, lastEvents } = state;

    const handleRecruit = (unitId: string) => {
        const unit = MILITARY_UNITS.find(u => u.id === unitId);
        recruitTroops(unitId);
        if (unit) {
            gameToast.recruit('Troops Recruited', `${unit.name} join your legions`);
        }
    };

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Military"
                subtitle="Command your legions and defend Rome"
                icon={<Swords className="w-6 h-6 text-roman-gold" />}
            />

            {/* Military Stats */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <motion.div variants={fadeInUp}>
                    <GlassCard variant="gold" className="p-4 text-center">
                        <div className="text-4xl font-black text-roman-gold">{troops}</div>
                        <div className="text-sm text-muted">Total Troops</div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">{morale}%</div>
                        <div className="text-sm text-muted">Morale</div>
                        <ProgressBar value={morale} max={100} variant="default" height="sm" className="mt-2" />
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{supplies}</div>
                        <div className="text-sm text-muted">Supplies</div>
                        <ProgressBar value={supplies} max={200} variant="default" height="sm" className="mt-2" />
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-purple-400">{forts}</div>
                        <div className="text-sm text-muted">Forts</div>
                    </GlassCard>
                </motion.div>
            </motion.div>

            {/* Recruitment */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-roman-gold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" /> Recruitment
                </h3>

                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    {MILITARY_UNITS.map((unit) => {
                        const canAfford = denarii >= unit.cost.denarii && inventory.grain >= unit.cost.food;

                        return (
                            <motion.div
                                key={unit.id}
                                variants={fadeInUp}
                            >
                                <GlassCard
                                    className={`p-4 h-full ${!canAfford ? 'opacity-60' : ''}`}
                                    hover={canAfford}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-roman-gold">{unit.name}</h4>
                                        <Badge variant="gold" size="sm">{unit.role}</Badge>
                                    </div>

                                    <p className="text-sm text-muted mb-3">
                                        Recruits {unit.troopsMin}-{unit.troopsMax} troops
                                    </p>

                                    <div className="space-y-1 text-sm mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-muted">Cost</span>
                                            <span className={denarii >= unit.cost.denarii ? 'text-green-400' : 'text-red-400'}>
                                                <><GameImage src="coin-gold" size="sm" /> {unit.cost.denarii}</>
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted">Food</span>
                                            <span className={inventory.grain >= unit.cost.food ? 'text-green-400' : 'text-red-400'}>
                                                <><GameImage src="amphora" size="sm" /> {unit.cost.food}</>
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        variant="roman"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleRecruit(unit.id)}
                                        disabled={!canAfford}
                                    >
                                        Recruit
                                    </Button>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </GlassCard>

            {/* Army Composition */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-roman-gold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" /> Legion Status
                </h3>

                <motion.div
                    className="grid md:grid-cols-3 gap-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.div variants={fadeInUp} className="glass-dark rounded-xl p-4">
                        <div className="text-lg font-bold text-roman-gold mb-2">Combat Strength</div>
                        <div className="text-3xl font-black text-green-400">
                            {Math.floor(troops * (morale / 100) * (1 + supplies / 500))}
                        </div>
                        <div className="text-xs text-muted mt-1">
                            Troops × Morale × Supply Bonus
                        </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="glass-dark rounded-xl p-4">
                        <div className="text-lg font-bold text-roman-gold mb-2">Upkeep Cost</div>
                        <div className="text-3xl font-black text-red-400">
                            {troops * 2}/season
                        </div>
                        <div className="text-xs text-muted mt-1">
                            2 denarii per soldier
                        </div>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="glass-dark rounded-xl p-4">
                        <div className="text-lg font-bold text-roman-gold mb-2">Food Required</div>
                        <div className="text-3xl font-black text-orange-400">
                            {Math.floor(troops * 0.55)}
                        </div>
                        <div className="text-xs text-muted mt-1">
                            0.55 grain per soldier
                        </div>
                    </motion.div>
                </motion.div>
            </GlassCard>

            {/* Morale Factors */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-roman-gold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5" /> Morale Factors
                </h3>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Base Morale</span>
                        <span className="text-green-400">+50</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Victory Streak ({state.winStreak} wins)</span>
                        <span className="text-green-400">+{state.winStreak * 5}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Supplies ({supplies > 100 ? 'Well supplied' : 'Low'})</span>
                        <span className={supplies > 100 ? 'text-green-400' : 'text-red-400'}>
                            {supplies > 100 ? '+10' : '-10'}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Fort Presence</span>
                        <span className="text-green-400">+{forts * 5}</span>
                    </div>

                    <div className="border-t border-white/10 pt-3 mt-3">
                        <div className="flex justify-between items-center font-bold">
                            <span>Current Morale</span>
                            <span className={morale >= 70 ? 'text-green-400' : morale >= 40 ? 'text-yellow-400' : 'text-red-400'}>
                                {morale}%
                            </span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Last Recruitment Event */}
            {lastEvents.length > 0 && lastEvents[0].includes('Recruited') && (
                <motion.div
                    className="glass-gold rounded-xl p-4 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <span className="text-roman-gold">{lastEvents[0]}</span>
                </motion.div>
            )}
        </div>
    );
}
