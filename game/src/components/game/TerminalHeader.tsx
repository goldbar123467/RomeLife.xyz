'use client';

import { useEffect, useState, useRef, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { RESOURCE_INFO } from '@/core/constants';
import type { ResourceType } from '@/core/types';

interface StatValue {
    current: number;
    previous: number;
    flash: 'up' | 'down' | null;
}

// Moved outside component to prevent recreation
const SEASON_CONFIG = {
    spring: { emoji: '🌸', color: 'text-pink-400' },
    summer: { emoji: '☀️', color: 'text-yellow-400' },
    autumn: { emoji: '🍂', color: 'text-orange-400' },
    winter: { emoji: '❄️', color: 'text-blue-400' },
} as const;

const CORE_RESOURCES: ResourceType[] = ['grain', 'iron', 'timber', 'stone', 'wool', 'salt'];

// Stable animation objects
const flashScaleAnimation = { scale: [1, 1.05, 1] };
const noAnimation = {};
const resourceFlashAnimation = { scale: [1, 1.08, 1] };
const scanlineAnimation = { top: ['-2px', '100%'] };
const scanlineTransition = { duration: 4, repeat: Infinity, ease: 'linear' as const };
const logoAnimation = { scale: [1, 1.02, 1] };
const logoTransition = { duration: 3, repeat: Infinity };

// Memoized StatCell component
const StatCell = memo(function StatCell({
    label,
    stat,
    icon,
    showPercent = false
}: {
    label: string;
    stat: StatValue | undefined;
    icon: string;
    showPercent?: boolean;
}) {
    const value = stat?.current ?? 0;
    const flash = stat?.flash ?? null;
    const displayValue = showPercent ? `${Math.floor(value)}%` : Math.floor(value).toLocaleString();

    const bgClass = flash === 'up'
        ? 'bg-green-500/30 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
        : flash === 'down'
            ? 'bg-red-500/30 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
            : 'bg-[rgba(5,5,10,0.92)] border-white/15';

    const textClass = flash === 'up'
        ? 'text-green-400'
        : flash === 'down'
            ? 'text-red-400'
            : 'text-ink';

    return (
        <motion.div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 border ${bgClass}`}
            animate={flash ? flashScaleAnimation : noAnimation}
            transition={{ duration: 0.3 }}
        >
            <span className="text-sm">{icon}</span>
            <span className="text-xs text-muted font-medium uppercase">{label}</span>
            <span className={`text-sm font-bold ${textClass}`}>
                {displayValue}
            </span>
            <AnimatePresence>
                {flash && (
                    <motion.span
                        initial={{ opacity: 0, y: flash === 'up' ? 5 : -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`text-xs ${flash === 'up' ? 'text-green-400' : 'text-red-400'}`}
                    >
                        {flash === 'up' ? '▲' : '▼'}
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

// Memoized ResourceCell component
const ResourceCell = memo(function ResourceCell({
    type,
    stat
}: {
    type: ResourceType;
    stat: StatValue | undefined;
}) {
    const info = RESOURCE_INFO[type];
    const value = stat?.current ?? 0;
    const flash = stat?.flash ?? null;

    const bgClass = flash === 'up'
        ? 'bg-green-500/20 border-green-500/40'
        : flash === 'down'
            ? 'bg-red-500/20 border-red-500/40'
            : 'bg-[rgba(5,5,10,0.92)] border-white/15';

    const textClass = flash === 'up'
        ? 'text-green-400'
        : flash === 'down'
            ? 'text-red-400'
            : 'text-muted';

    return (
        <motion.div
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all duration-200 ${bgClass}`}
            animate={flash ? resourceFlashAnimation : noAnimation}
            transition={{ duration: 0.2 }}
        >
            <span className="text-sm">{info?.emoji || '📦'}</span>
            <span className={`text-xs font-mono ${textClass}`}>
                {Math.floor(value)}
            </span>
        </motion.div>
    );
});

export function TerminalHeader() {
    const { round, season, denarii, inventory, population, troops, happiness, morale, reputation } = useGameStore();

    // Track previous values for flash effects
    const [stats, setStats] = useState<Record<string, StatValue>>({});
    const prevValuesRef = useRef<Record<string, number>>({});
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoize the current values computation
    const currentValues = useMemo(() => ({
        denarii,
        population,
        troops,
        happiness,
        morale,
        reputation,
        ...inventory,
    }), [denarii, population, troops, happiness, morale, reputation, inventory]);

    // Update stats with flash detection
    useEffect(() => {
        const newStats: Record<string, StatValue> = {};

        for (const [key, value] of Object.entries(currentValues)) {
            const prev = prevValuesRef.current[key] ?? value;
            let flash: 'up' | 'down' | null = null;

            if (prev !== undefined && value !== prev) {
                flash = value > prev ? 'up' : 'down';
            }

            newStats[key] = { current: value, previous: prev, flash };
        }

        setStats(newStats);
        prevValuesRef.current = currentValues;

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Clear flash after animation
        timeoutRef.current = setTimeout(() => {
            setStats(prev => {
                const cleared: Record<string, StatValue> = {};
                for (const [key, val] of Object.entries(prev)) {
                    cleared[key] = { ...val, flash: null };
                }
                return cleared;
            });
        }, 600);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentValues]);

    const seasonInfo = SEASON_CONFIG[season];

    return (
        <header className="relative border-b border-line bg-paper">
            {/* Scanline effect - hidden on mobile */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
                <motion.div
                    className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-roman-gold/30 to-transparent"
                    animate={scanlineAnimation}
                    transition={scanlineTransition}
                />
            </div>

            {/* Mobile Header - Compact single row */}
            <div className="flex md:hidden items-center justify-between px-3 py-2">
                {/* Logo & Round */}
                <div className="flex items-center gap-2">
                    <span className="text-lg">🐺</span>
                    <span className="text-sm font-bold text-roman-gold">R{round}</span>
                </div>

                {/* Key Stats */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                        <span>👥</span>
                        <span className="text-muted">{population}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                        <span>⚔️</span>
                        <span className="text-muted">{troops}</span>
                    </div>
                </div>

                {/* Season & Treasury */}
                <div className="flex items-center gap-2">
                    <span className={seasonInfo.color}>{seasonInfo.emoji}</span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-roman-gold/10 border border-roman-gold/30">
                        <span className="text-xs">🪙</span>
                        <span className="text-xs font-bold text-roman-gold">{Math.floor(denarii).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Desktop Header - Full layout */}
            <div className="hidden md:block">
                {/* Main header row */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-line/30">
                    {/* Logo & Round */}
                    <div className="flex items-center gap-4">
                        <motion.div
                            className="flex items-center gap-2"
                            animate={logoAnimation}
                            transition={logoTransition}
                        >
                            <span className="text-xl">🐺</span>
                            <h1 className="text-lg font-black text-roman-gold text-glow-gold">ROME</h1>
                        </motion.div>

                        <div className="h-5 w-px bg-line/50" />

                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted">Year</span>
                            <span className="font-bold text-ink">{Math.ceil(round / 4)} AUC</span>
                            <span className="text-muted">•</span>
                            <span className="text-muted">Round</span>
                            <span className="font-bold text-roman-gold">{round}</span>
                        </div>
                    </div>

                    {/* Season & Treasury */}
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 ${seasonInfo.color}`}>
                            <span>{seasonInfo.emoji}</span>
                            <span className="text-sm font-semibold capitalize">{season}</span>
                        </div>

                        <motion.div
                            className="flex items-center gap-2 px-3 py-1 rounded-full bg-roman-gold/10 border border-roman-gold/30"
                            whileHover={{ scale: 1.02 }}
                        >
                            <span>🪙</span>
                            <span className="font-bold text-roman-gold">{Math.floor(denarii).toLocaleString()}</span>
                        </motion.div>
                    </div>
                </div>

                {/* Stats Table Row - Desktop only */}
                <div className="flex items-center justify-between px-4 py-2 bg-bg/50">
                    {/* Core Stats */}
                    <div className="flex items-center gap-2">
                        <StatCell label="Pop" stat={stats.population} icon="👥" />
                        <StatCell label="Troops" stat={stats.troops} icon="⚔️" />
                        <StatCell label="Happy" stat={stats.happiness} icon="😊" showPercent />
                        <StatCell label="Morale" stat={stats.morale} icon="💪" showPercent />
                        <StatCell label="Rep" stat={stats.reputation} icon="⭐" />
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-px bg-line/30 mx-2" />

                    {/* Resources */}
                    <div className="flex items-center gap-1">
                        {CORE_RESOURCES.map(type => (
                            <ResourceCell key={type} type={type} stat={stats[type]} />
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
