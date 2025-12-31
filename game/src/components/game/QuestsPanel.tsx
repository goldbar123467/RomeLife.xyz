'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Badge, SectionHeader, ProgressBar, GameImage } from '@/components/ui';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { ScrollText, Target, Coins, Trophy, Star, Check } from 'lucide-react';
import type { Quest } from '@/core/types';

// Quest type icons
const QUEST_ICONS: Record<string, React.ReactNode> = {
    build: <GameImage src="column" size="sm" alt="Build" />,
    conquer: <GameImage src="centurion-helmet" size="sm" alt="Conquer" />,
    trade: <GameImage src="coin-gold" size="sm" alt="Trade" />,
    research: <GameImage src="scroll" size="sm" alt="Research" />,
    threshold: <GameImage src="laurels" size="sm" alt="Threshold" />,
};

function QuestCard({ quest }: { quest: Quest }) {
    return (
        <motion.div variants={fadeInUp}>
            <GlassCard
                className={`p-5 h-full ${quest.completed ? 'border-2 border-green-500/60 bg-green-500/10' : ''} ${!quest.active ? 'opacity-50' : ''}`}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {QUEST_ICONS[quest.type] || <Target className="w-6 h-6" />}
                        <div>
                            <h3 className="font-bold text-roman-gold text-lg">{quest.title}</h3>
                            <p className="text-sm text-muted capitalize">{quest.type} Quest</p>
                        </div>
                    </div>
                    {quest.completed ? (
                        <Badge variant="success" size="sm">
                            <Check className="w-3 h-3 mr-1" /> Complete
                        </Badge>
                    ) : quest.active ? (
                        <Badge variant="gold" size="sm">Active</Badge>
                    ) : (
                        <Badge variant="default" size="sm">Inactive</Badge>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 mb-4">{quest.description}</p>

                {/* Progress */}
                <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted">Progress</span>
                        <span className={quest.completed ? 'text-green-400' : 'text-roman-gold'}>
                            {quest.progress} / {quest.target}
                        </span>
                    </div>
                    <ProgressBar
                        value={quest.progress}
                        max={quest.target}
                        variant={quest.completed ? 'green' : 'gold'}
                        height="md"
                    />
                </div>

                {/* Rewards */}
                <div>
                    <h4 className="text-xs font-semibold text-muted uppercase mb-2">Rewards</h4>
                    <div className="flex flex-wrap gap-2">
                        {quest.reward.denarii && (
                            <div className="flex items-center gap-1 text-sm bg-white/5 px-2 py-1 rounded">
                                <Coins className="w-4 h-4 text-yellow-400" />
                                <span>{quest.reward.denarii}</span>
                            </div>
                        )}
                        {quest.reward.reputation && (
                            <div className="flex items-center gap-1 text-sm bg-white/5 px-2 py-1 rounded">
                                <Star className="w-4 h-4 text-blue-400" />
                                <span>+{quest.reward.reputation} rep</span>
                            </div>
                        )}
                        {quest.reward.favor && (
                            <div className="flex items-center gap-1 text-sm bg-white/5 px-2 py-1 rounded">
                                <span>✨</span>
                                <span>+{quest.reward.favor} favor</span>
                            </div>
                        )}
                        {quest.reward.tradeBuff && (
                            <div className="flex items-center gap-1 text-sm bg-white/5 px-2 py-1 rounded">
                                <span>📈</span>
                                <span>{Math.floor((quest.reward.tradeBuff.multiplier - 1) * 100)}% trade ({quest.reward.tradeBuff.duration}s)</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Completed overlay */}
                {quest.completed && (
                    <div className="mt-4 text-center py-2 bg-green-500/20 rounded-lg">
                        <span className="text-green-400 font-bold flex items-center justify-center gap-2">
                            <Trophy className="w-4 h-4" /> Quest Complete!
                        </span>
                    </div>
                )}
            </GlassCard>
        </motion.div>
    );
}

export function QuestsPanel() {
    const { quests } = useGameStore();

    const activeQuests = quests.filter(q => q.active && !q.completed);
    const completedQuests = quests.filter(q => q.completed);

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Quests"
                subtitle="Complete objectives to earn rewards for your empire"
                icon={<ScrollText className="w-6 h-6 text-roman-gold" />}
            />

            {/* Stats Overview */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-3 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
            >
                <motion.div variants={fadeInUp}>
                    <GlassCard variant="gold" className="p-4 text-center">
                        <div className="text-3xl font-black text-roman-gold">{activeQuests.length}</div>
                        <div className="text-sm text-muted">Active Quests</div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-400">{completedQuests.length}</div>
                        <div className="text-sm text-muted">Completed</div>
                    </GlassCard>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <GlassCard className="p-4 text-center">
                        <div className="text-3xl font-bold text-gray-400">{quests.length}</div>
                        <div className="text-sm text-muted">Total Quests</div>
                    </GlassCard>
                </motion.div>
            </motion.div>

            {/* Active Quests */}
            {activeQuests.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-roman-gold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5" /> Active Quests
                    </h3>
                    <motion.div
                        className="grid md:grid-cols-2 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {activeQuests.map((quest) => (
                            <QuestCard key={quest.id} quest={quest} />
                        ))}
                    </motion.div>
                </div>
            )}

            {/* Completed Quests */}
            {completedQuests.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-roman-gold mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5" /> Completed Quests
                    </h3>
                    <motion.div
                        className="grid md:grid-cols-2 gap-6"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {completedQuests.map((quest) => (
                            <QuestCard key={quest.id} quest={quest} />
                        ))}
                    </motion.div>
                </div>
            )}

            {/* No Quests State */}
            {quests.length === 0 && (
                <GlassCard className="p-8 text-center">
                    <ScrollText className="w-12 h-12 text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-roman-gold mb-2">No Quests Available</h3>
                    <p className="text-muted">Quests will be assigned as you progress through the game.</p>
                </GlassCard>
            )}

            {/* Info Box */}
            <GlassCard className="p-4">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <h4 className="font-bold text-roman-gold mb-1">Quest System</h4>
                        <p className="text-sm text-muted">
                            Quests provide objectives and rewards for your empire. Progress is tracked automatically
                            as you play. Complete quests to earn denarii, reputation, divine favor, and special trade bonuses.
                            New quests are generated periodically as you advance.
                        </p>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
