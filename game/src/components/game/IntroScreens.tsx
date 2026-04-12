'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { FOUNDERS } from '@/core/constants';
import { GameImage } from '@/components/ui';
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

    const founderMeta: Record<string, { icon: React.ReactNode; accent: string; borderColor: string; glowColor: string }> = {
        romulus: {
            icon: <GameImage src="centurion-helmet" width={80} height={80} alt="Romulus" />,
            accent: 'from-roman-red/20 to-red-950/10',
            borderColor: 'border-roman-red/40',
            glowColor: 'rgba(196, 30, 58, 0.4)',
        },
        remus: {
            icon: <GameImage src="laurels" width={80} height={80} alt="Remus" />,
            accent: 'from-emerald-900/20 to-green-950/10',
            borderColor: 'border-emerald-700/40',
            glowColor: 'rgba(16, 185, 129, 0.4)',
        },
    };

    const renderModifier = (label: string, value: number) => {
        const isPositive = value > 0;
        const isNegative = value < 0;
        return (
            <div className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                <span className="text-white/40 font-medium">{label}</span>
                <span className={`font-bold ${isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-white/15'}`}>
                    {value === 0 ? '—' : `${isPositive ? '+' : ''}${Math.round(value * 100)}%`}
                </span>
            </div>
        );
    };

    return (
        <motion.div
            className="fixed inset-0 flex flex-col overflow-hidden bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* === Background layers (same as intro for visual continuity) === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
                    style={{ backgroundImage: "url('/colosseum-night.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/90" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_60%,rgba(0,0,0,0.95)_100%)]" />
            </div>

            {/* === Lightning (lower intensity for readability) === */}
            <motion.div
                className="absolute inset-0 z-[1] mix-blend-screen opacity-0 pointer-events-none"
                animate={{ opacity: 0.25 }}
                transition={{ delay: 0.3, duration: 1.5 }}
            >
                <Lightning hue={42} speed={0.4} intensity={0.5} size={1} xOffset={0} />
            </motion.div>

            {/* === Content === */}
            <div className="relative z-10 flex flex-col min-h-screen p-4 md:p-8">

                {/* Header */}
                <motion.div
                    className="text-center pt-6 md:pt-10 mb-6 md:mb-10"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <h1 className="font-cinzel-decorative font-bold text-3xl md:text-5xl tracking-wide mb-3 intro-title-glow">
                        <ShinyText
                            text="Choose Your Founder"
                            color="#8B6914"
                            shineColor="#FFD700"
                            speed={4}
                            spread={110}
                            className="font-cinzel-decorative"
                        />
                    </h1>
                    <motion.p
                        className="font-cinzel text-xs md:text-sm tracking-[0.2em] uppercase text-white/30"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        Your choice will shape the destiny of Rome
                    </motion.p>
                </motion.div>

                {/* Founder Cards */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-3xl w-full">
                        {founders.map((founder, index) => {
                            const meta = founderMeta[founder.id] ?? founderMeta.romulus;
                            const isSelected = selectedFounder === founder.id;

                            return (
                                <motion.div
                                    key={founder.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.15, duration: 0.5 }}
                                    onClick={() => setSelectedFounder(founder.id)}
                                    className="cursor-pointer"
                                >
                                    <motion.div
                                        className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${isSelected ? 'imperial-border-glow' : ''}`}
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        animate={isSelected ? {
                                            boxShadow: `0 0 30px ${meta.glowColor}, 0 0 60px ${meta.glowColor.replace('0.4', '0.15')}`,
                                        } : {
                                            boxShadow: '0 0 0px transparent',
                                        }}
                                    >
                                        {/* Card border */}
                                        <div className={`absolute inset-0 rounded-2xl border-2 ${isSelected ? 'border-roman-gold/60' : meta.borderColor} transition-colors duration-300`} />
                                        {/* Inner gold border on select */}
                                        {isSelected && <div className="absolute inset-[5px] rounded-xl border border-roman-gold/20" />}
                                        {/* Background */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${meta.accent} backdrop-blur-md`} />
                                        <div className="absolute inset-0 bg-black/60" />

                                        {/* Content */}
                                        <div className="relative z-10 p-5 md:p-7">
                                            {/* Top row: Icon + Name */}
                                            <div className="flex items-center gap-4 mb-4">
                                                <motion.div
                                                    className="flex-shrink-0"
                                                    animate={isSelected ? { scale: [1, 1.08, 1] } : {}}
                                                    transition={{ duration: 0.6 }}
                                                >
                                                    {meta.icon}
                                                </motion.div>
                                                <div>
                                                    <h3 className="font-cinzel font-bold text-xl md:text-2xl text-roman-gold tracking-wide">
                                                        {founder.name}
                                                    </h3>
                                                    <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                                                        founder.archetype === 'Warrior'
                                                            ? 'bg-roman-red/20 text-red-400 border border-roman-red/30'
                                                            : 'bg-emerald-900/20 text-emerald-400 border border-emerald-700/30'
                                                    }`}>
                                                        {founder.archetype}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-white/35 leading-relaxed mb-4">
                                                {founder.description}
                                            </p>

                                            {/* Divider */}
                                            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-3" />

                                            {/* Modifiers */}
                                            <div className="space-y-0">
                                                {renderModifier('Attack', founder.modifiers.attackBonus)}
                                                {renderModifier('Troop Bonus', founder.modifiers.troopBonus)}
                                                {renderModifier('Recruit Cost', founder.modifiers.recruitCostMod)}
                                                {renderModifier('Risk', founder.modifiers.riskMod)}
                                                {renderModifier('Trade Prices', founder.modifiers.tradePriceMod)}
                                                {renderModifier('Relationships', founder.modifiers.relationshipBonus)}
                                                {renderModifier('Favor Gain', founder.modifiers.favorGainMod)}
                                            </div>

                                            {/* Selected indicator */}
                                            {isSelected && (
                                                <motion.div
                                                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-roman-gold flex items-center justify-center"
                                                    initial={{ scale: 0, rotate: -90 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                                >
                                                    <Check size={16} className="text-black" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom CTA */}
                <motion.div
                    className="text-center py-6 md:py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <AnimatePresence mode="wait">
                        {selectedFounder ? (
                            <motion.div
                                key="button"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <motion.button
                                    onClick={handleStart}
                                    className="px-8 md:px-12 py-3.5 md:py-4 rounded-xl font-cinzel font-bold text-sm md:text-base tracking-wider uppercase cursor-pointer transition-all duration-300 active:scale-[0.97]"
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
                                        Found Rome as {FOUNDERS[selectedFounder].name}
                                    </span>
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.p
                                key="hint"
                                className="font-cinzel text-xs md:text-sm text-white/20 tracking-wider"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Select a founder to begin
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    );
}
