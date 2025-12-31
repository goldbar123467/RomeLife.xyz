'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { TAB_ICONS } from '@/components/ui/icons';
import type { Tab } from '@/core/types';

const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'resources', label: 'Resources' },
    { id: 'economy', label: 'Economy' },
    { id: 'trade', label: 'Trade' },
    { id: 'military', label: 'Military' },
    { id: 'map', label: 'Map' },
    { id: 'settlement', label: 'Settlement' },
    { id: 'diplomacy', label: 'Diplomacy' },
    { id: 'senate', label: 'Senate' },
    { id: 'technology', label: 'Tech' },
    { id: 'religion', label: 'Religion' },
    { id: 'wonders', label: 'Wonders' },
    { id: 'quests', label: 'Quests' },
    { id: 'achievements', label: 'Achievements' },
];

export function TabNavigation() {
    const { activeTab, setTab } = useGameStore();

    return (
        <nav className="h-full px-3 py-6">
            <motion.div
                className="flex flex-col gap-1.5"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
            >
                {/* Header */}
                <div className="text-sm font-bold text-roman-gold uppercase tracking-wider px-4 mb-3 flex items-center gap-2">
                    <span className="text-lg">Rome</span>
                    <span>Navigation</span>
                </div>

                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const TabIcon = TAB_ICONS[tab.id];
                    return (
                        <motion.button
                            key={tab.id}
                            onClick={() => setTab(tab.id)}
                            className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-semibold transition-all duration-200 w-full text-left ${isActive
                                    ? 'bg-roman-gold/20 text-roman-gold shadow-[0_0_20px_rgba(240,193,75,0.3)] border-2 border-roman-gold/60'
                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border-2 border-transparent hover:border-white/20'
                                }`}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Left accent bar for active */}
                            {isActive && (
                                <motion.div
                                    className="absolute left-0 top-2 bottom-2 w-1 bg-roman-gold rounded-r-full"
                                    layoutId="activeTabBar"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}

                            {/* Icon with glow on active */}
                            <div className={`${isActive ? 'drop-shadow-[0_0_8px_rgba(240,193,75,0.8)]' : ''}`}>
                                <TabIcon
                                    size={22}
                                    className={`transition-colors ${isActive ? 'text-roman-gold' : 'text-gray-400 group-hover:text-white'}`}
                                />
                            </div>

                            {/* Label */}
                            <span className="relative z-10">{tab.label}</span>

                            {/* Arrow indicator for active */}
                            {isActive && (
                                <motion.span
                                    className="ml-auto text-roman-gold"
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                >
                                    →
                                </motion.span>
                            )}
                        </motion.button>
                    );
                })}

                {/* Quick Actions Section */}
                <div className="mt-6 px-2">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-roman-gold/15 to-roman-gold/5 border border-roman-gold/30">
                        <div className="text-sm text-roman-gold font-bold mb-2 flex items-center gap-2">
                            <span>⚡</span> Quick Actions
                        </div>
                        <div className="text-xs text-gray-400 mb-2">
                            Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-gray-300">Space</kbd> to end season
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-roman-gold to-yellow-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: '45%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </nav>
    );
}
