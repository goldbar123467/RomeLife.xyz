'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { TAB_ICONS } from '@/components/ui/icons';
import type { Tab } from '@/core/types';
import {
    LayoutDashboard, Package, Coins, ArrowRightLeft,
    Swords, Map, Building2, Users, Lightbulb,
    Church, Trophy, Landmark, ScrollText, Menu, X
} from 'lucide-react';

// Quick access tabs for bottom bar
const QUICK_TABS: Tab[] = ['overview', 'resources', 'economy', 'military'];

// All tabs for the drawer
const ALL_TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'resources', label: 'Resources', icon: Package },
    { id: 'economy', label: 'Economy', icon: Coins },
    { id: 'trade', label: 'Trade', icon: ArrowRightLeft },
    { id: 'military', label: 'Military', icon: Swords },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'settlement', label: 'Settlement', icon: Building2 },
    { id: 'diplomacy', label: 'Diplomacy', icon: Users },
    { id: 'technology', label: 'Technology', icon: Lightbulb },
    { id: 'religion', label: 'Religion', icon: Church },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'wonders', label: 'Wonders', icon: Landmark },
    { id: 'quests', label: 'Quests', icon: ScrollText },
];

// Drawer animation variants
const drawerVariants = {
    closed: { x: '100%', opacity: 0 },
    open: { x: 0, opacity: 1 },
};

const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
};

const MobileNavButton = memo(function MobileNavButton({
    tab,
    isActive,
    onClick,
}: {
    tab: Tab;
    isActive: boolean;
    onClick: () => void;
}) {
    const Icon = TAB_ICONS[tab];

    return (
        <button
            onClick={onClick}
            className={`flex-1 flex flex-col items-center justify-center py-2 transition-colors ${
                isActive
                    ? 'text-roman-gold'
                    : 'text-muted hover:text-ink'
            }`}
        >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-1 capitalize">{tab}</span>
            {isActive && (
                <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-roman-gold rounded-full"
                />
            )}
        </button>
    );
});

export function MobileNav() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const { activeTab, setTab } = useGameStore();

    const handleTabClick = (tab: Tab) => {
        setTab(tab);
        setIsDrawerOpen(false);
    };

    return (
        <>
            {/* Bottom Navigation Bar - Mobile Only */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                <div className="bg-paper/95 backdrop-blur-lg border-t border-line safe-area-bottom">
                    <div className="flex items-center">
                        {/* Quick Tabs */}
                        {QUICK_TABS.map(tab => (
                            <div key={tab} className="relative flex-1">
                                <MobileNavButton
                                    tab={tab}
                                    isActive={activeTab === tab}
                                    onClick={() => setTab(tab)}
                                />
                            </div>
                        ))}

                        {/* Menu Button */}
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className="flex-1 flex flex-col items-center justify-center py-2 text-muted hover:text-ink transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                            <span className="text-[10px] mt-1">More</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Full Drawer */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
                            variants={backdropVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            onClick={() => setIsDrawerOpen(false)}
                        />

                        {/* Drawer Panel */}
                        <motion.div
                            className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-paper border-l border-line md:hidden"
                            variants={drawerVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-4 py-4 border-b border-line">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">🐺</span>
                                    <h2 className="text-lg font-bold text-roman-gold">Navigation</h2>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted" />
                                </button>
                            </div>

                            {/* Tab List */}
                            <div className="py-2 overflow-y-auto max-h-[calc(100vh-80px)]">
                                {ALL_TABS.map(({ id, label, icon: Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => handleTabClick(id)}
                                        className={`w-full flex items-center gap-3 px-4 py-4 transition-all ${
                                            activeTab === id
                                                ? 'bg-roman-gold/20 text-roman-gold border-l-4 border-roman-gold font-bold'
                                                : 'text-gray-300 hover:bg-white/10 hover:text-white border-l-4 border-transparent font-medium'
                                        }`}
                                    >
                                        <Icon className={`w-6 h-6 ${activeTab === id ? 'drop-shadow-[0_0_6px_rgba(240,193,75,0.8)]' : ''}`} />
                                        <span className="text-base">{label}</span>
                                        {activeTab === id && <span className="ml-auto">→</span>}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
