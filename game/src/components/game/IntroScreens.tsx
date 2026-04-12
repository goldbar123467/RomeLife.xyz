'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { FOUNDERS } from '@/core/constants';
import { Button, GlassCard, Badge, GameImage } from '@/components/ui';
import { Egg, Check } from 'lucide-react';
import { gameToast } from '@/lib/toast';
import type { FounderName } from '@/core/types';

// === FLOATING EMBER PARTICLES ===
function FloatingParticles() {
    const particles = useMemo(() =>
        Array.from({ length: 22 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: 2 + Math.random() * 4,
            duration: 6 + Math.random() * 8,
            delay: Math.random() * 4,
            drift: -20 + Math.random() * 40,
            opacity: 0.15 + Math.random() * 0.35,
        })),
    []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        background: `radial-gradient(circle, rgba(240, 193, 75, ${p.opacity}) 0%, rgba(196, 120, 30, ${p.opacity * 0.5}) 100%)`,
                    }}
                    animate={{
                        y: [0, -(200 + Math.random() * 300)],
                        x: [0, p.drift],
                        opacity: [0, p.opacity, p.opacity, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
}

// === SVG LAUREL WREATH EMBLEM ===
function LaurelWreath({ className = '', onClick }: { className?: string; onClick?: () => void }) {
    return (
        <motion.svg
            viewBox="0 0 200 200"
            className={className}
            onClick={onClick}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
        >
            {/* Left branch */}
            <motion.g
                initial={{ opacity: 0, x: -10, rotate: -5 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ delay: 0.6, duration: 0.8, ease: 'easeOut' }}
            >
                <path d="M80 170 C75 150, 55 140, 50 120" stroke="#C4972B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M50 120 C45 105, 40 95, 42 78" stroke="#C4972B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M42 78 C40 65, 45 50, 55 38" stroke="#C4972B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M55 38 C62 28, 75 22, 88 20" stroke="#C4972B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                {/* Left leaves */}
                <ellipse cx="52" cy="155" rx="10" ry="18" transform="rotate(-25 52 155)" fill="#B8860B" opacity="0.7"/>
                <ellipse cx="42" cy="135" rx="9" ry="16" transform="rotate(-15 42 135)" fill="#C4972B" opacity="0.75"/>
                <ellipse cx="36" cy="112" rx="9" ry="16" transform="rotate(-5 36 112)" fill="#D4A84B" opacity="0.8"/>
                <ellipse cx="34" cy="90" rx="8" ry="15" transform="rotate(5 34 90)" fill="#C4972B" opacity="0.75"/>
                <ellipse cx="38" cy="68" rx="8" ry="14" transform="rotate(15 38 68)" fill="#B8860B" opacity="0.7"/>
                <ellipse cx="48" cy="50" rx="8" ry="13" transform="rotate(25 48 50)" fill="#D4A84B" opacity="0.8"/>
                <ellipse cx="62" cy="34" rx="7" ry="12" transform="rotate(40 62 34)" fill="#C4972B" opacity="0.75"/>
                <ellipse cx="78" cy="24" rx="7" ry="11" transform="rotate(55 78 24)" fill="#B8860B" opacity="0.7"/>
                {/* Inner leaves (lighter) */}
                <ellipse cx="62" cy="148" rx="8" ry="14" transform="rotate(-35 62 148)" fill="#E8C84B" opacity="0.5"/>
                <ellipse cx="52" cy="128" rx="7" ry="13" transform="rotate(-25 52 128)" fill="#E8C84B" opacity="0.5"/>
                <ellipse cx="46" cy="105" rx="7" ry="13" transform="rotate(-10 46 105)" fill="#E8C84B" opacity="0.5"/>
                <ellipse cx="44" cy="82" rx="7" ry="12" transform="rotate(10 44 82)" fill="#E8C84B" opacity="0.5"/>
                <ellipse cx="50" cy="60" rx="6" ry="11" transform="rotate(25 50 60)" fill="#E8C84B" opacity="0.5"/>
                <ellipse cx="60" cy="44" rx="6" ry="10" transform="rotate(35 60 44)" fill="#E8C84B" opacity="0.5"/>
            </motion.g>

            {/* Right branch (mirrored) */}
            <motion.g
                initial={{ opacity: 0, x: 10, rotate: 5 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }}
            >
                <path d="M120 170 C125 150, 145 140, 150 120" stroke="#C4972B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M150 120 C155 105, 160 95, 158 78" stroke="#C4972B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M158 78 C160 65, 155 50, 145 38" stroke="#C4972B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <path d="M145 38 C138 28, 125 22, 112 20" stroke="#C4972B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                {/* Right leaves */}
                <ellipse cx="148" cy="155" rx="10" ry="18" transform="rotate(25 148 155)" fill="#B8860B" opacity="0.7"/>
                <ellipse cx="158" cy="135" rx="9" ry="16" transform="rotate(15 158 135)" fill="#C4972B" opacity="0.75"/>
                <ellipse cx="164" cy="112" rx="9" ry="16" transform="rotate(5 164 112)" fill="#D4A84B" opacity="0.8"/>
                <ellipse cx="166" cy="90" rx="8" ry="15" transform="rotate(-5 166 90)" fill="#C4972B" opacity="0.75"/>
                <ellipse cx="162" cy="68" rx="8" ry="14" transform="rotate(-15 162 68)" fill="#B8860B" opacity="0.7"/>
                <ellipse cx="152" cy="50" rx="8" ry="13" transform="rotate(-25 152 50)" fill="#D4A84B" opacity="0.8"/>
                <ellipse cx="138" cy="34" rx="7" ry="12" transform="rotate(-40 138 34)" fill="#C4972B" opacity="0.75"/>
                <ellipse cx="122" cy="24" rx="7" ry="11" transform="rotate(-55 122 24)" fill="#B8860B" opacity="0.7"/>
                {/* Inner leaves (lighter) */}
                <ellipse cx="138" cy="148" rx="8" ry="14" transform="rotate(35 138 148)" fill="#E8C84B" opacity="0.5"/>
                <ellipse cx="148" cy="128" rx="7" ry="13" transform="rotate(25 148 128)" fill="#E8C84B" opacity="0.5"/>
                <ellipse cx="154" cy="105" rx="7" ry="13" transform="rotate(10 154 105)" fill="#E8C84B" opacity="0.5"/>
                <ellipse cx="156" cy="82" rx="7" ry="12" transform="rotate(-10 156 82)" fill="#E8C84B" opacity="0.5"/>
                <ellipse cx="150" cy="60" rx="6" ry="11" transform="rotate(-25 150 60)" fill="#E8C84B" opacity="0.5"/>
                <ellipse cx="140" cy="44" rx="6" ry="10" transform="rotate(-35 140 44)" fill="#E8C84B" opacity="0.5"/>
            </motion.g>

            {/* Center SPQR text */}
            <motion.text
                x="100" y="105"
                textAnchor="middle"
                fill="#F0C14B"
                fontSize="22"
                fontFamily="Cinzel, Georgia, serif"
                fontWeight="700"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0, duration: 0.6 }}
            >
                SPQR
            </motion.text>
        </motion.svg>
    );
}

// === ROMAN ORNAMENTAL DIVIDER ===
function RomanDivider() {
    return (
        <motion.div
            className="flex items-center justify-center gap-3 my-4 md:my-5"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 1.1, duration: 0.6, ease: 'easeOut' }}
        >
            <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent to-roman-gold/60" />
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-roman-gold/70">
                <path d="M8 0L10 6H16L11 10L13 16L8 12L3 16L5 10L0 6H6Z" fill="currentColor" />
            </svg>
            <div className="h-px w-8 md:w-14 bg-roman-gold/60" />
            <svg width="10" height="10" viewBox="0 0 10 10" className="text-roman-gold/50">
                <circle cx="5" cy="5" r="3" fill="currentColor" />
            </svg>
            <div className="h-px w-8 md:w-14 bg-roman-gold/60" />
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-roman-gold/70">
                <path d="M8 0L10 6H16L11 10L13 16L8 12L3 16L5 10L0 6H6Z" fill="currentColor" />
            </svg>
            <div className="h-px w-12 md:w-20 bg-gradient-to-l from-transparent to-roman-gold/60" />
        </motion.div>
    );
}

// === FEATURE PILL ===
const FEATURES = [
    { label: 'Conquer', asset: 'centurion-helmet' as const, color: 'from-red-900/40 to-red-950/30' },
    { label: 'Trade', asset: 'coin-gold' as const, color: 'from-amber-900/40 to-amber-950/30' },
    { label: 'Build', asset: 'colosseum-new' as const, color: 'from-stone-800/40 to-stone-900/30' },
    { label: 'Worship', asset: 'temple' as const, color: 'from-orange-900/40 to-orange-950/30' },
];

export function IntroScreen() {
    const [wolfClicks, setWolfClicks] = useState(0);
    const { setStage } = useGameStore();

    const handleEasterEgg = () => {
        const newClicks = wolfClicks + 1;
        setWolfClicks(newClicks);
        if (newClicks === 5) {
            gameToast.religion('The Wolf Blesses Your Journey!', 'Romulus and Remus smile upon you from the heavens.');
        }
    };

    return (
        <motion.div
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* === LAYER 1: Background image === */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: "url('/rome-cityscape.jpg')" }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                {/* Warm vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_70%,rgba(0,0,0,0.9)_100%)]" />
            </div>

            {/* === LAYER 2: Ambient gold glow === */}
            <motion.div
                className="absolute inset-0 z-[1] pointer-events-none flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 1.5 }}
            >
                <div className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full bg-roman-gold/[0.04] blur-[120px]" />
            </motion.div>

            {/* === LAYER 3: Floating particles === */}
            <FloatingParticles />

            {/* === LAYER 4: Main content === */}
            <div className="relative z-10 text-center px-6 max-w-2xl mx-auto flex flex-col items-center">

                {/* Laurel Wreath Emblem */}
                <motion.div
                    className="cursor-pointer"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                        filter: wolfClicks >= 5 ? 'hue-rotate(180deg) brightness(1.3)' : 'none',
                    }}
                    transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
                >
                    <LaurelWreath
                        className="w-28 h-28 md:w-36 md:h-36"
                        onClick={handleEasterEgg}
                    />
                </motion.div>

                {/* Title */}
                <motion.h1
                    className="font-cinzel-decorative font-bold text-4xl xs:text-5xl md:text-7xl lg:text-8xl text-roman-gold tracking-wide intro-title-glow leading-tight"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    FOUNDING
                    <br />
                    <span className="text-[0.85em]">OF ROME</span>
                </motion.h1>

                {/* Decorative divider */}
                <RomanDivider />

                {/* Subtitle */}
                <motion.p
                    className="font-cinzel text-sm md:text-base tracking-[0.25em] uppercase text-roman-gold/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                >
                    Complete Edition
                </motion.p>

                {/* Tagline */}
                <motion.p
                    className="text-sm md:text-base text-white/40 mt-3 md:mt-4 max-w-sm mx-auto leading-relaxed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 0.5 }}
                >
                    Build an empire from the seven hills.
                    <br className="hidden md:block" />
                    {' '}Conquer, trade, and lead Rome to eternal glory.
                </motion.p>

                {/* Feature showcase */}
                <motion.div
                    className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-6 md:mt-8"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.1, delayChildren: 1.8 } },
                    }}
                >
                    {FEATURES.map((f) => (
                        <motion.div
                            key={f.label}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-gradient-to-r ${f.color} border border-white/[0.06] backdrop-blur-sm`}
                            variants={{
                                hidden: { opacity: 0, y: 15, scale: 0.9 },
                                visible: { opacity: 1, y: 0, scale: 1 },
                            }}
                            transition={{ duration: 0.4 }}
                        >
                            <GameImage src={f.asset} size="xs" alt={f.label} />
                            <span className="text-xs md:text-sm font-medium text-white/60">{f.label}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    className="mt-8 md:mt-10"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2, duration: 0.6, ease: 'easeOut' }}
                >
                    <motion.button
                        onClick={() => setStage('founder_select')}
                        className="group relative px-8 md:px-12 py-3.5 md:py-4 rounded-xl font-cinzel font-bold text-sm md:text-base tracking-wider uppercase text-roman-gold border-2 border-roman-gold/40 bg-roman-gold/[0.07] backdrop-blur-sm cursor-pointer transition-colors duration-300 hover:bg-roman-gold/[0.15] hover:border-roman-gold/60 active:scale-[0.98]"
                        animate={{
                            boxShadow: [
                                '0 0 20px rgba(240, 193, 75, 0.1), inset 0 1px 0 rgba(240, 193, 75, 0.1)',
                                '0 0 40px rgba(240, 193, 75, 0.25), inset 0 1px 0 rgba(240, 193, 75, 0.15)',
                                '0 0 20px rgba(240, 193, 75, 0.1), inset 0 1px 0 rgba(240, 193, 75, 0.1)',
                            ],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <span className="flex items-center gap-2 md:gap-3">
                            <GameImage src="centurion-helmet" size="sm" alt="Helmet" />
                            Begin Your Legacy
                        </span>
                    </motion.button>
                </motion.div>

                {/* Version & easter egg */}
                <motion.p
                    className="text-[10px] md:text-xs text-white/20 mt-10 md:mt-14 font-cinzel tracking-widest"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.6, duration: 0.5 }}
                >
                    v2.0 &middot; Next.js Edition
                    {wolfClicks >= 5 && (
                        <span className="inline-flex items-center gap-1 ml-2 text-yellow-400/70">
                            <Egg size={10} /> Secret Mode
                        </span>
                    )}
                </motion.p>
            </div>

            {/* === LAYER 5: Corner decorations === */}
            <motion.div
                className="absolute bottom-4 md:bottom-8 left-4 md:left-8 text-white/15 text-[10px] md:text-xs font-cinzel tracking-widest z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8, duration: 0.5 }}
            >
                SPQR &middot; ANNO URBIS CONDITAE
            </motion.div>

            <motion.div
                className="absolute bottom-4 md:bottom-8 right-4 md:right-8 text-white/15 text-[10px] md:text-xs font-cinzel tracking-widest z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8, duration: 0.5 }}
            >
                MMXXVI
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
