'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, StatDisplay, Divider } from '@/components/ui';
import { checkVictoryConditions, checkFailureConditions } from '@/core/rules';
import { Trophy, Skull, Crown, Coins, Users, Swords, MapPin, RotateCcw, Infinity } from 'lucide-react';

export function ResultsScreen() {
    const state = useGameStore();
    const {
        denarii, population, happiness, troops, morale,
        territories, buildings, round, season, founder,
        totalConquests, totalTrades, patronGod, godFavor,
        resetGame, enterInfiniteMode, lastEvents
    } = state;

    const ownedTerritories = territories.filter(t => t.owned);
    const builtBuildings = buildings.filter(b => b.built);

    // Check for victory or failure
    const victory = checkVictoryConditions(state);
    const failure = checkFailureConditions(state);

    const isVictory = victory !== null;
    const resultTitle = victory?.title || failure?.title || 'Game Over';
    const resultDescription = victory?.description || failure?.description || 'Your reign has ended.';

    // Get the result message from lastEvents if available
    const resultEvent = lastEvents.find(e =>
        e.includes('Victory') || e.includes('achieved') ||
        e.includes('Famine') || e.includes('Collapse') || e.includes('Revolt')
    );

    const handlePlayAgain = () => {
        resetGame();
    };

    const handleContinue = () => {
        enterInfiniteMode();
    };

    return (
        <div className="min-h-screen bg-bg roman-pattern flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-4xl"
            >
                {/* Main Result Card */}
                <GlassCard variant={isVictory ? 'gold' : 'crimson'} className="text-center mb-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="mb-6"
                    >
                        {isVictory ? (
                            <div className="w-24 h-24 mx-auto rounded-full bg-roman-gold/20 flex items-center justify-center">
                                <Trophy className="w-12 h-12 text-roman-gold" />
                            </div>
                        ) : (
                            <div className="w-24 h-24 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                                <Skull className="w-12 h-12 text-red-400" />
                            </div>
                        )}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`text-4xl md:text-5xl font-bold mb-4 ${isVictory ? 'text-roman-gold' : 'text-red-400'}`}
                    >
                        {resultTitle}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-muted mb-6 max-w-2xl mx-auto"
                    >
                        {resultDescription}
                    </motion.p>

                    {resultEvent && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-sm text-muted italic mb-6"
                        >
                            {resultEvent}
                        </motion.div>
                    )}

                    {/* Founder info */}
                    {founder && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center justify-center gap-3 mb-6"
                        >
                            <Crown className="w-5 h-5 text-roman-gold" />
                            <span className="text-lg">
                                <span className="text-muted">Founder:</span>{' '}
                                <span className="font-bold text-roman-gold">{founder.name}</span>
                            </span>
                        </motion.div>
                    )}
                </GlassCard>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <GlassCard className="text-center p-4">
                            <Coins className="w-8 h-8 mx-auto mb-2 text-roman-gold" />
                            <StatDisplay label="Final Treasury" value={denarii.toLocaleString()} size="sm" />
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65 }}
                    >
                        <GlassCard className="text-center p-4">
                            <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                            <StatDisplay label="Population" value={population} size="sm" />
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <GlassCard className="text-center p-4">
                            <MapPin className="w-8 h-8 mx-auto mb-2 text-green-400" />
                            <StatDisplay label="Territories" value={ownedTerritories.length} size="sm" />
                        </GlassCard>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.75 }}
                    >
                        <GlassCard className="text-center p-4">
                            <Swords className="w-8 h-8 mx-auto mb-2 text-red-400" />
                            <StatDisplay label="Troops" value={troops} size="sm" />
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Detailed Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <GlassCard>
                        <h3 className="text-lg font-bold text-roman-gold mb-4 text-center">Empire Statistics</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white">{round}</div>
                                <div className="text-xs text-muted uppercase">Seasons Survived</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white capitalize">{season}</div>
                                <div className="text-xs text-muted uppercase">Final Season</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white">{happiness}%</div>
                                <div className="text-xs text-muted uppercase">Happiness</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white">{morale}%</div>
                                <div className="text-xs text-muted uppercase">Morale</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white">{builtBuildings.length}</div>
                                <div className="text-xs text-muted uppercase">Buildings</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white">{totalConquests}</div>
                                <div className="text-xs text-muted uppercase">Conquests</div>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-xl">
                                <div className="text-2xl font-bold text-white">{totalTrades}</div>
                                <div className="text-xs text-muted uppercase">Trades</div>
                            </div>
                            {patronGod && (
                                <div className="text-center p-3 bg-white/5 rounded-xl">
                                    <div className="text-2xl font-bold text-white capitalize">{patronGod}</div>
                                    <div className="text-xs text-muted uppercase">Patron God ({godFavor[patronGod]}%)</div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </motion.div>

                <Divider className="my-6" />

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <Button
                        variant="roman"
                        size="lg"
                        onClick={handlePlayAgain}
                        className="min-w-[200px]"
                    >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Play Again
                    </Button>

                    {isVictory && (
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={handleContinue}
                            className="min-w-[200px] border border-roman-gold/30 hover:border-roman-gold/50"
                        >
                            <Infinity className="w-5 h-5 mr-2" />
                            Continue (Infinite Mode)
                        </Button>
                    )}
                </motion.div>

                {/* Footer text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    className="text-center text-sm text-muted mt-6"
                >
                    {isVictory
                        ? 'Your name shall echo through the ages. Ave, Imperator!'
                        : 'Rome was not built in a day. Try again, and glory shall be yours.'
                    }
                </motion.p>
            </motion.div>
        </div>
    );
}
