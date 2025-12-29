'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { FOUNDERS } from '@/core/constants';
import { Button, GlassCard, Badge } from '@/components/ui';
import type { FounderName } from '@/core/types';

export function IntroScreen() {
    const [wolfClicks, setWolfClicks] = useState(0);
    const { setStage } = useGameStore();

    const handleWolfClick = () => {
        const newClicks = wolfClicks + 1;
        setWolfClicks(newClicks);

        if (newClicks >= 5) {
            // Easter egg: clicking wolf 5 times (placeholder for future unlock)
        }
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a12] via-[#050508] to-[#0a0a0a] p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] rounded-full bg-roman-gold/5 blur-[100px]" />
            </div>

            <motion.div
                className="relative z-10 text-center"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                {/* Wolf Logo */}
                <motion.div
                    className="text-8xl mb-6 cursor-pointer"
                    onClick={handleWolfClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                        filter: wolfClicks >= 5 ? 'hue-rotate(180deg)' : 'none',
                    }}
                >
                    🐺
                </motion.div>

                {/* Title */}
                <motion.h1
                    className="text-6xl md:text-7xl font-black text-roman-gold mb-4 text-glow-gold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    FOUNDING OF ROME
                </motion.h1>

                <motion.p
                    className="text-xl text-muted mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Complete Edition
                </motion.p>

                <motion.p
                    className="text-sm text-muted/70 mb-8 max-w-md mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    Build an empire from the seven hills. Conquer, trade, and lead Rome to eternal glory.
                </motion.p>

                {/* Start Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Button
                        variant="roman"
                        size="lg"
                        onClick={() => setStage('founder_select')}
                        icon="⚔️"
                    >
                        Begin Your Legacy
                    </Button>
                </motion.div>

                {/* Version */}
                <motion.p
                    className="text-xs text-muted/50 mt-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    v2.0 • Next.js Edition • {wolfClicks >= 5 && '🍳 Secret Mode Unlocked!'}
                </motion.p>
            </motion.div>

            {/* Decorative elements */}
            <motion.div
                className="absolute bottom-8 left-8 text-muted/30 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                SPQR • ANNO URBIS CONDITAE
            </motion.div>

            <motion.div
                className="absolute bottom-8 right-8 text-muted/30 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
            >
                MMXXV
            </motion.div>
        </motion.div>
    );
}

export function FounderSelectScreen() {
    const [selectedFounder, setSelectedFounder] = useState<FounderName | null>(null);
    const { startGame } = useGameStore();

    const founders = Object.values(FOUNDERS);

    const handleStart = () => {
        if (selectedFounder) {
            startGame(FOUNDERS[selectedFounder]);
        }
    };

    const getFounderIcon = (id: FounderName) => {
        switch (id) {
            case 'romulus': return '⚔️';
            case 'remus': return '🕊️';
            default: return '👤';
        }
    };

    return (
        <motion.div
            className="min-h-screen flex flex-col bg-gradient-to-br from-[#0a0a12] via-[#050508] to-[#0a0a0a] p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Header */}
            <motion.div
                className="text-center mb-12"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                <h1 className="text-4xl font-black text-roman-gold mb-2">Choose Your Founder</h1>
                <p className="text-muted">Your choice will shape the destiny of Rome</p>
            </motion.div>

            {/* Founder Cards */}
            <div className="flex-1 flex items-center justify-center">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
                    {founders.map((founder, index) => (
                        <motion.div
                            key={founder.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15 }}
                        >
                            <GlassCard
                                variant={selectedFounder === founder.id ? 'gold' : 'default'}
                                className={`relative cursor-pointer transition-all duration-300 ${selectedFounder === founder.id
                                    ? 'ring-2 ring-roman-gold glow-gold'
                                    : 'hover:border-white/30'
                                    }`}
                                onClick={() => setSelectedFounder(founder.id)}
                                hover={true}
                            >
                                {/* Icon */}
                                <motion.div
                                    className="text-6xl text-center mb-4"
                                    animate={selectedFounder === founder.id ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.5 }}
                                >
                                    {getFounderIcon(founder.id)}
                                </motion.div>

                                {/* Name & Archetype */}
                                <h3 className="text-2xl font-bold text-center text-roman-gold mb-1">
                                    {founder.name}
                                </h3>
                                <div className="text-center mb-4">
                                    <Badge variant="gold">
                                        {founder.archetype}
                                    </Badge>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-muted text-center mb-4">
                                    {founder.description}
                                </p>

                                {/* Modifiers Preview */}
                                <div className="space-y-1.5">
                                    {founder.modifiers.attackBonus !== 0 && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted">Attack</span>
                                            <span className={founder.modifiers.attackBonus > 0 ? 'text-green-400' : 'text-red-400'}>
                                                {founder.modifiers.attackBonus > 0 ? '+' : ''}{Math.round(founder.modifiers.attackBonus * 100)}%
                                            </span>
                                        </div>
                                    )}
                                    {founder.modifiers.tradePriceMod !== 0 && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted">Trade Prices</span>
                                            <span className={founder.modifiers.tradePriceMod > 0 ? 'text-green-400' : 'text-red-400'}>
                                                {founder.modifiers.tradePriceMod > 0 ? '+' : ''}{Math.round(founder.modifiers.tradePriceMod * 100)}%
                                            </span>
                                        </div>
                                    )}
                                    {founder.modifiers.relationshipBonus !== 0 && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted">Relationships</span>
                                            <span className="text-green-400">
                                                +{Math.round(founder.modifiers.relationshipBonus * 100)}%
                                            </span>
                                        </div>
                                    )}
                                    {founder.modifiers.recruitCostMod !== 0 && (
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted">Recruit Cost</span>
                                            <span className="text-green-400">
                                                {Math.round(founder.modifiers.recruitCostMod * 100)}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Selected indicator */}
                                {selectedFounder === founder.id && (
                                    <motion.div
                                        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-roman-gold flex items-center justify-center"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                    >
                                        <span className="text-bg text-sm">✓</span>
                                    </motion.div>
                                )}
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Start Button */}
            <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <AnimatePresence>
                    {selectedFounder && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <Button
                                variant="roman"
                                size="lg"
                                onClick={handleStart}
                                icon="🏛️"
                            >
                                Found Rome as {FOUNDERS[selectedFounder].name}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!selectedFounder && (
                    <p className="text-muted text-sm">Select a founder to begin</p>
                )}
            </motion.div>
        </motion.div>
    );
}
