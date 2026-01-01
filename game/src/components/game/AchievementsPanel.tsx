'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Badge, SectionHeader, ProgressBar } from '@/components/ui';
import { Trophy, Lock, Star } from 'lucide-react';

export function AchievementsPanel() {
    const state = useGameStore();
    const { achievements } = state;

    const unlockedCount = achievements.filter(a => a.unlocked).length;
    const totalAchievements = achievements.length;

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Achievements"
                subtitle="Track your accomplishments and earn rewards"
                icon={<Trophy className="w-6 h-6 text-roman-gold" />}
            />

            {/* Progress */}
            <GlassCard variant="gold" className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-roman-gold">Achievement Progress</h3>
                        <p className="text-sm text-muted">{unlockedCount} of {totalAchievements} unlocked</p>
                    </div>
                    <div className="text-3xl font-black text-roman-gold">{Math.round((unlockedCount / totalAchievements) * 100)}%</div>
                </div>
                <ProgressBar value={unlockedCount} max={totalAchievements} variant="gold" />
            </GlassCard>

            {/* Achievement Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, idx) => (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <GlassCard
                            className={`p-4 h-full transition-all ${achievement.unlocked
                                    ? 'border-green-500/50 bg-green-500/5'
                                    : 'opacity-70'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {achievement.unlocked ? (
                                        <Trophy size={24} className="text-roman-gold" />
                                    ) : (
                                        <Lock size={24} className="text-muted" />
                                    )}
                                    <h4 className={`font-bold ${achievement.unlocked ? 'text-green-400' : 'text-roman-gold'}`}>
                                        {achievement.name}
                                    </h4>
                                </div>
                                {achievement.unlocked && (
                                    <Badge variant="success" size="sm">Unlocked</Badge>
                                )}
                            </div>

                            <p className="text-sm text-muted mb-3">{achievement.description}</p>

                            {/* Reward Display */}
                            <div className="flex flex-wrap gap-2">
                                {achievement.reward.denarii && (
                                    <span className="text-xs glass-dark px-2 py-1 rounded-full">
                                        +{achievement.reward.denarii} denarii
                                    </span>
                                )}
                                {achievement.reward.happiness && (
                                    <span className="text-xs glass-dark px-2 py-1 rounded-full">
                                        +{achievement.reward.happiness} happiness
                                    </span>
                                )}
                                {achievement.reward.reputation && (
                                    <span className="text-xs glass-dark px-2 py-1 rounded-full inline-flex items-center gap-1">
                                        +{achievement.reward.reputation} <Star size={12} className="text-yellow-400" />
                                    </span>
                                )}
                                {achievement.reward.favor && (
                                    <span className="text-xs glass-dark px-2 py-1 rounded-full">
                                        +{achievement.reward.favor} favor
                                    </span>
                                )}
                                {achievement.reward.morale && (
                                    <span className="text-xs glass-dark px-2 py-1 rounded-full">
                                        +{achievement.reward.morale} morale
                                    </span>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
