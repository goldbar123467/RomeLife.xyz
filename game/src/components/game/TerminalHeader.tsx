'use client';

import { useEffect, useState, useRef, useMemo, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GameImage } from '@/components/ui';
import { RESOURCE_ICONS } from '@/components/ui/icons';
import { isAssetKey } from '@/lib/assets';
import { Flower2, Sun, Leaf, Snowflake, Dog, Package, Download, Upload, Check, AlertCircle, type LucideIcon } from 'lucide-react';
import { gameToast } from '@/lib/toast';
import type { ResourceType } from '@/core/types';

interface StatValue {
    current: number;
    previous: number;
    flash: 'up' | 'down' | null;
}

// Moved outside component to prevent recreation
const SEASON_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
    spring: { icon: Flower2, color: 'text-pink-400' },
    summer: { icon: Sun, color: 'text-yellow-400' },
    autumn: { icon: Leaf, color: 'text-orange-400' },
    winter: { icon: Snowflake, color: 'text-blue-400' },
};

const CORE_RESOURCES: ResourceType[] = ['grain', 'iron', 'timber', 'stone', 'wool', 'salt'];

// Stable animation objects
const flashScaleAnimation = { scale: [1, 1.05, 1] };
const noAnimation = {};
const resourceFlashAnimation = { scale: [1, 1.08, 1] };
const logoAnimation = { scale: [1, 1.02, 1] };
const logoTransition = { duration: 3, repeat: Infinity };

// Save status indicator component
const SaveStatusIndicator = memo(function SaveStatusIndicator({
    lastSaveTime,
    hasUnsavedChanges
}: {
    lastSaveTime: number | null;
    hasUnsavedChanges: boolean;
}) {
    const [timeSinceSave, setTimeSinceSave] = useState<number>(0);

    useEffect(() => {
        if (!lastSaveTime) return;

        const updateTime = () => {
            setTimeSinceSave(Date.now() - lastSaveTime);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [lastSaveTime]);

    // Within 30 seconds = recently saved
    const isRecentlySaved = lastSaveTime && timeSinceSave < 30000;

    if (isRecentlySaved && !hasUnsavedChanges) {
        return (
            <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/30"
                role="status"
                aria-live="polite"
                aria-label="Game saved successfully"
            >
                <Check size={12} className="text-green-400" aria-hidden="true" />
                <span className="text-xs text-green-400 font-medium">Saved</span>
            </div>
        );
    }

    if (hasUnsavedChanges) {
        return (
            <div
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30"
                role="status"
                aria-live="polite"
                aria-label="You have unsaved changes"
            >
                <AlertCircle size={12} className="text-amber-400" aria-hidden="true" />
                <span className="text-xs text-amber-400 font-medium">Unsaved</span>
            </div>
        );
    }

    // Default: no indicator when auto-save is working normally
    return null;
});

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
            {isAssetKey(icon) ? <GameImage src={icon} size="xs" alt={label} /> : <span className="text-sm">{icon}</span>}
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
    const value = stat?.current ?? 0;
    const flash = stat?.flash ?? null;
    const ResourceIcon = RESOURCE_ICONS[type] || Package;

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
            <ResourceIcon size={14} className="text-roman-gold" />
            <span className={`text-xs font-mono ${textClass}`}>
                {Math.floor(value)}
            </span>
        </motion.div>
    );
});

// Save/Load handlers using Zustand persist
const SAVE_KEY = 'rome-empire-save';

const handleSave = () => {
    // Zustand persist auto-saves on every state change, but we can force a confirmation
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
        gameToast.save('Empire Saved', 'Your progress has been preserved for posterity.');
    } else {
        gameToast.warning('Save Failed', 'Unable to save game state.');
    }
};

const handleLoad = () => {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (savedData) {
        // Force page reload to trigger Zustand rehydration from localStorage
        window.location.reload();
    } else {
        gameToast.warning('No Save Found', 'Start a new game to create a save.');
    }
};

export function TerminalHeader() {
    const { round, season, denarii, inventory, population, troops, happiness, morale, reputation, stage } = useGameStore();

    // Track previous values for flash effects
    const [stats, setStats] = useState<Record<string, StatValue>>({});
    const prevValuesRef = useRef<Record<string, number>>({});
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Save status tracking
    const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const previousValuesForSaveRef = useRef<string>('');

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

    // Track changes for save indicator
    useEffect(() => {
        const currentState = JSON.stringify({ denarii, inventory, population, troops, round });
        if (previousValuesForSaveRef.current && previousValuesForSaveRef.current !== currentState) {
            setHasUnsavedChanges(true);
        }
        previousValuesForSaveRef.current = currentState;
    }, [denarii, inventory, population, troops, round]);

    // Update save time when manual save happens
    const handleManualSave = useCallback(() => {
        handleSave();
        setLastSaveTime(Date.now());
        setHasUnsavedChanges(false);
    }, []);

    const seasonInfo = SEASON_CONFIG[season];
    const SeasonIcon = seasonInfo.icon;

    return (
        <header className="relative border-b border-line bg-paper" role="banner" aria-label="Rome Empire game header">
            {/* Subtle bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-roman-gold/20 to-transparent hidden md:block" aria-hidden="true" />

            {/* Mobile Header - Compact single row */}
            <div className="flex md:hidden items-center justify-between px-3 py-2">
                {/* Logo & Round */}
                <div className="flex items-center gap-2">
                    <Dog size={20} className="text-roman-gold" aria-hidden="true" />
                    <span className="text-sm font-bold text-roman-gold" aria-label={`Round ${round}`}>R{round}</span>
                </div>

                {/* Key Stats */}
                <div className="flex items-center gap-2" aria-live="polite" aria-atomic="true">
                    <div className="flex items-center gap-1 text-xs" aria-label={`Population: ${population}`}>
                        <GameImage src="roman" size="xs" alt="" aria-hidden="true" />
                        <span className="text-muted">{population}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs" aria-label={`Troops: ${troops}`}>
                        <GameImage src="centurion-helmet" size="xs" alt="" aria-hidden="true" />
                        <span className="text-muted">{troops}</span>
                    </div>
                </div>

                {/* Season & Treasury */}
                <div className="flex items-center gap-2">
                    <SeasonIcon size={16} className={seasonInfo.color} aria-hidden="true" />
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-roman-gold/10 border border-roman-gold/30" aria-label={`Treasury: ${Math.floor(denarii).toLocaleString()} denarii`}>
                        <GameImage src="coin-gold" size="xs" alt="" aria-hidden="true" />
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
                            <Dog size={24} className="text-roman-gold" />
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

                    {/* Season, Treasury & Save Status */}
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 ${seasonInfo.color}`}
                            aria-live="polite"
                            aria-label={`Current season: ${season}`}
                        >
                            <SeasonIcon size={16} aria-hidden="true" />
                            <span className="text-sm font-semibold capitalize">{season}</span>
                        </div>

                        <motion.div
                            className="flex items-center gap-2 px-3 py-1 rounded-full bg-roman-gold/10 border border-roman-gold/30"
                            whileHover={{ scale: 1.02 }}
                            aria-live="polite"
                            aria-label={`Treasury: ${Math.floor(denarii).toLocaleString()} denarii`}
                        >
                            <GameImage src="coin-gold" size="xs" alt="" aria-hidden="true" />
                            <span className="font-bold text-roman-gold">{Math.floor(denarii).toLocaleString()}</span>
                        </motion.div>

                        {/* Save/Load Buttons & Status - only show during active game */}
                        {stage === 'game' && (
                            <div className="flex items-center gap-2">
                                {/* Save Status Indicator */}
                                <SaveStatusIndicator lastSaveTime={lastSaveTime} hasUnsavedChanges={hasUnsavedChanges} />

                                <div className="flex items-center gap-1">
                                    <motion.button
                                        onClick={handleManualSave}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-roman-gold/10 hover:border-roman-gold/30 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        aria-label="Save game progress"
                                    >
                                        <Download size={14} className="text-roman-gold" aria-hidden="true" />
                                        <span className="text-xs text-muted">Save</span>
                                    </motion.button>
                                    <motion.button
                                        onClick={handleLoad}
                                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-roman-gold/10 hover:border-roman-gold/30 transition-colors"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        aria-label="Load saved game"
                                    >
                                        <Upload size={14} className="text-roman-gold" aria-hidden="true" />
                                        <span className="text-xs text-muted">Load</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Table Row - Desktop only */}
                <div className="flex items-center justify-between px-4 py-2 bg-bg/50" role="region" aria-label="Empire statistics">
                    {/* Core Stats */}
                    <div className="flex items-center gap-2" aria-live="polite" aria-atomic="false">
                        <StatCell label="Pop" stat={stats.population} icon="roman" />
                        <StatCell label="Troops" stat={stats.troops} icon="centurion-helmet" />
                        <StatCell label="Happy" stat={stats.happiness} icon="laurels" showPercent />
                        <StatCell label="Morale" stat={stats.morale} icon="shield" showPercent />
                        <StatCell label="Rep" stat={stats.reputation} icon="laurels-gold" />
                    </div>

                    {/* Divider */}
                    <div className="h-6 w-px bg-line/30 mx-2" aria-hidden="true" />

                    {/* Resources */}
                    <div className="flex items-center gap-1" role="region" aria-label="Resource stockpiles" aria-live="polite">
                        {CORE_RESOURCES.map(type => (
                            <ResourceCell key={type} type={type} stat={stats[type]} />
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}
