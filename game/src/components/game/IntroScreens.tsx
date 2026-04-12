'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { FOUNDERS } from '@/core/constants';
import { Button, GlassCard, Badge, GameImage } from '@/components/ui';
import { Egg, Check } from 'lucide-react';
import { gameToast } from '@/lib/toast';
import type { FounderName } from '@/core/types';
import Lightning from '@/components/effects/Lightning';
import ShinyText from '@/components/effects/ShinyText';

// === FEATURE PILLS ===
const FEATURES = [
    { label: 'Conquer', asset: 'centurion-helmet' as const, color: 'from-red-900/40 to-red-950/30' },
    { label: 'Trade', asset: 'coin-gold' as const, color: 'from-amber-900/40 to-amber-950/30' },
    { label: 'Build', asset: 'colosseum-new' as const, color: 'from-stone-800/40 to-stone-900/30' },
    { label: 'Worship', asset: 'temple' as const, color: 'from-orange-900/40 to-orange-950/30' },
];

export function IntroScreen() {
    const [easterEggClicks, setEasterEggClicks] = useState(0);
    const { setStage } = useGameStore();

    const handleEasterEgg = () => {
        const n = easterEggClicks + 1;
        setEasterEggClicks(n);
        if (n === 5) {
            gameToast.religion('The Wolf Blesses Your Journey!', 'Romulus and Remus smile upon you from the heavens.');
        }
    };

    return (
        <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* === LAYER 0: Colosseum night background (Pexels, free license) === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
                    style={{ backgroundImage: "url('/colosseum-night.jpg')" }}
                />
                {/* Dark shader overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90" />
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_60%,rgba(0,0,0,0.95)_100%)]" />
            </div>

            {/* === LAYER 1: Jupiter's Lightning (ReactBits WebGL) === */}
            <motion.div
                className="absolute inset-0 z-[1] mix-blend-screen opacity-50 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ delay: 0.4, duration: 2 }}
            >
                <Lightning
                    hue={42}
                    speed={0.6}
                    intensity={0.8}
                    size={1}
                    xOffset={0}
                />
            </motion.div>

            {/* === LAYER 2: Red/warm ambient glow === */}
            <div className="absolute inset-0 z-[2] pointer-events-none flex items-center justify-center">
                <div className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-roman-red/[0.06] blur-[100px]" />
            </div>

            {/* === LAYER 3: Main content with imperial frame === */}
            <div className="relative z-10 flex flex-col items-center justify-center px-4">

                {/* Imperial bordered frame */}
                <motion.div
                    className="relative p-8 md:p-12 lg:p-16 imperial-frame"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {/* Outer red border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-roman-red/50 imperial-border-glow" />
                    {/* Inner gold border */}
                    <div className="absolute inset-[6px] rounded-xl border border-roman-gold/30" />
                    {/* Glass background */}
                    <div className="absolute inset-0 rounded-2xl bg-black/60 backdrop-blur-md" />

                    {/* Corner ornaments */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-roman-gold/50 rounded-tl-lg" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-roman-gold/50 rounded-tr-lg" />
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-roman-gold/50 rounded-bl-lg" />
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-roman-gold/50 rounded-br-lg" />

                    {/* Content inside frame */}
                    <div className="relative z-10 text-center flex flex-col items-center">

                        {/* Helmet emblem (easter egg target) */}
                        <motion.div
                            className="mb-4 cursor-pointer"
                            onClick={handleEasterEgg}
                            whileHover={{ scale: 1.1, rotate: 3 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                filter: easterEggClicks >= 5 ? 'hue-rotate(180deg) brightness(1.5)' : 'none',
                            }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                        >
                            <GameImage src="centurion-helmet" size="xl" alt="Rome" />
                        </motion.div>

                        {/* Main title: ROME LIFE with ShinyText */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0, duration: 0.7 }}
                        >
                            <h1 className="font-cinzel-decorative font-bold text-5xl xs:text-6xl md:text-7xl lg:text-8xl tracking-wider leading-none intro-title-glow">
                                <ShinyText
                                    text="ROME"
                                    color="#8B6914"
                                    shineColor="#FFD700"
                                    speed={3}
                                    spread={110}
                                    className="font-cinzel-decorative"
                                />
                                <br />
                                <ShinyText
                                    text="LIFE"
                                    color="#8B6914"
                                    shineColor="#FFD700"
                                    speed={3}
                                    spread={110}
                                    delay={0.5}
                                    className="font-cinzel-decorative"
                                />
                            </h1>
                        </motion.div>

                        {/* Gold/Red decorative divider */}
                        <motion.div
                            className="flex items-center justify-center gap-3 my-4 md:my-5"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            transition={{ delay: 1.4, duration: 0.5 }}
                        >
                            <div className="h-[2px] w-10 md:w-16 bg-gradient-to-r from-transparent via-roman-red/60 to-roman-gold/60" />
                            <div className="w-2 h-2 rotate-45 bg-roman-gold/70" />
                            <div className="h-[2px] w-6 md:w-10 bg-roman-gold/50" />
                            <div className="w-1.5 h-1.5 rounded-full bg-roman-red/70" />
                            <div className="h-[2px] w-6 md:w-10 bg-roman-gold/50" />
                            <div className="w-2 h-2 rotate-45 bg-roman-gold/70" />
                            <div className="h-[2px] w-10 md:w-16 bg-gradient-to-l from-transparent via-roman-red/60 to-roman-gold/60" />
                        </motion.div>

                        {/* Subtitle */}
                        <motion.p
                            className="font-cinzel text-xs md:text-sm tracking-[0.3em] uppercase text-roman-gold/50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.6, duration: 0.4 }}
                        >
                            Imperial Edition
                        </motion.p>

                        {/* Tagline */}
                        <motion.p
                            className="text-sm md:text-base text-white/35 mt-3 max-w-sm mx-auto leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.8, duration: 0.4 }}
                        >
                            Build an empire from the seven hills.
                            <br className="hidden md:block" />
                            {' '}Conquer, trade, and lead Rome to eternal glory.
                        </motion.p>

                        {/* Feature showcase */}
                        <motion.div
                            className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-5 md:mt-6"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.08, delayChildren: 2.0 } },
                            }}
                        >
                            {FEATURES.map((f) => (
                                <motion.div
                                    key={f.label}
                                    className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gradient-to-r ${f.color} border border-white/[0.08]`}
                                    variants={{
                                        hidden: { opacity: 0, y: 12, scale: 0.9 },
                                        visible: { opacity: 1, y: 0, scale: 1 },
                                    }}
                                    transition={{ duration: 0.35 }}
                                >
                                    <GameImage src={f.asset} size="xs" alt={f.label} />
                                    <span className="text-xs md:text-sm font-medium text-white/50">{f.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA Button */}
                        <motion.div
                            className="mt-7 md:mt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 2.4, duration: 0.5 }}
                        >
                            <motion.button
                                onClick={() => setStage('founder_select')}
                                className="group relative px-8 md:px-12 py-3.5 md:py-4 rounded-xl font-cinzel font-bold text-sm md:text-base tracking-wider uppercase cursor-pointer transition-all duration-300 active:scale-[0.97]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(196,30,58,0.8) 0%, rgba(139,0,0,0.9) 100%)',
                                    border: '2px solid rgba(240,193,75,0.4)',
                                    color: '#F0C14B',
                                }}
                                whileHover={{
                                    borderColor: 'rgba(240,193,75,0.7)',
                                    boxShadow: '0 0 30px rgba(196,30,58,0.5), 0 0 60px rgba(240,193,75,0.2)',
                                }}
                                animate={{
                                    boxShadow: [
                                        '0 0 15px rgba(196,30,58,0.3), 0 0 30px rgba(240,193,75,0.1)',
                                        '0 0 25px rgba(196,30,58,0.5), 0 0 50px rgba(240,193,75,0.2)',
                                        '0 0 15px rgba(196,30,58,0.3), 0 0 30px rgba(240,193,75,0.1)',
                                    ],
                                }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <span className="flex items-center gap-2 md:gap-3">
                                    <GameImage src="laurels-gold" size="sm" alt="Laurels" />
                                    Begin Your Legacy
                                </span>
                            </motion.button>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Version + easter egg */}
                <motion.p
                    className="text-[10px] md:text-xs text-white/15 mt-6 font-cinzel tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.8, duration: 0.4 }}
                >
                    v2.0 &middot; Next.js Edition
                    {easterEggClicks >= 5 && (
                        <span className="inline-flex items-center gap-1 ml-2 text-yellow-400/60">
                            <Egg size={10} /> Secret Mode
                        </span>
                    )}
                </motion.p>
            </div>

            {/* === LAYER 4: Corner decorations === */}
            <motion.div
                className="absolute bottom-3 md:bottom-6 left-4 md:left-8 text-white/10 text-[10px] md:text-xs font-cinzel tracking-[0.2em] z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.0, duration: 0.4 }}
            >
                SPQR
            </motion.div>

            <motion.div
                className="absolute bottom-3 md:bottom-6 right-4 md:right-8 text-white/10 text-[10px] md:text-xs font-cinzel tracking-[0.2em] z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.0, duration: 0.4 }}
            >
                MMXXVI
            </motion.div>

            {/* Pexels attribution */}
            <motion.a
                href="https://www.pexels.com/photo/the-colosseum-at-night-11898746/"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-white/10 hover:text-white/25 transition-colors z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.0 }}
            >
                Photo by Pits Riccardo on Pexels
            </motion.a>
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

    const getFounderIcon = (id: FounderName): React.ReactNode => {
        switch (id) {
            case 'romulus': return <GameImage src="centurion-helmet" size="2xl" alt="Romulus" />;
            case 'remus': return <GameImage src="laurels" size="2xl" alt="Remus" />;
            default: return <GameImage src="roman" size="2xl" alt="Founder" />;
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
                                        <Check size={14} className="text-bg" />
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
                                icon={<GameImage src="temple" size="xs" alt="Temple" />}
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
