'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { TAB_ICONS } from '@/components/ui/icons';
import type { Tab } from '@/core/types';
import {
    LayoutDashboard, Package, Coins, ArrowRightLeft,
    Swords, Map, Building2, Users, Lightbulb,
    Church, Trophy, Landmark, ScrollText, Menu, X, Dog
} from 'lucide-react';

// Quick access tabs for bottom bar
const QUICK_TABS: Tab[] = ['overview', 'senate', 'economy', 'military'];

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
    { id: 'senate', label: 'Senate', icon: Landmark },
    { id: 'technology', label: 'Technology', icon: Lightbulb },
    { id: 'religion', label: 'Religion', icon: Church },
    { id: 'wonders', label: 'Wonders', icon: Landmark },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'quests', label: 'Quests', icon: ScrollText },
];

// Drawer animation variants - slides up from bottom
const drawerVariants = {
    closed: { y: '100%', opacity: 0 },
    open: { y: 0, opacity: 1 },
};

const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
};

// Tab descriptions for accessibility
const TAB_DESCRIPTIONS: Record<Tab, string> = {
    overview: 'Empire overview and key statistics',
    resources: 'Manage grain, iron, timber, and other resources',
    economy: 'View economic charts and treasury',
    trade: 'Trade goods with other regions',
    military: 'Recruit troops and manage armies',
    map: 'View the Roman Empire map',
    settlement: 'Build and upgrade city structures',
    diplomacy: 'Manage relations with other nations',
    senate: 'Engage with senators and politics',
    technology: 'Research new technologies',
    religion: 'Temples, priests, and divine favor',
    wonders: 'Construct monumental wonders',
    quests: 'Active missions and objectives',
    achievements: 'View earned achievements',
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
            role="tab"
            aria-selected={isActive}
            aria-label={TAB_DESCRIPTIONS[tab]}
            aria-current={isActive ? 'page' : undefined}
            tabIndex={isActive ? 0 : -1}
            className={`flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] transition-colors ${
                isActive
                    ? 'text-roman-gold'
                    : 'text-muted hover:text-ink'
            }`}
        >
            <Icon className="w-6 h-6" aria-hidden="true" />
            <span className="text-[11px] mt-1 capitalize">{tab}</span>
            {isActive && (
                <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-roman-gold rounded-full"
                    aria-hidden="true"
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
            {/* Bottom Navigation Bar - Mobile Only - Always visible like Safari */}
            <nav
                className="fixed bottom-0 left-0 right-0 z-[100] md:hidden"
                role="navigation"
                aria-label="Main navigation"
            >
                <div className="bg-paper border-t border-line safe-area-bottom">
                    <div className="flex items-center" role="tablist" aria-label="Quick navigation tabs">
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
                            aria-label="Open navigation menu"
                            aria-expanded={isDrawerOpen}
                            aria-haspopup="dialog"
                            className="flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] text-muted hover:text-ink transition-colors"
                        >
                            <Menu className="w-6 h-6" aria-hidden="true" />
                            <span className="text-[11px] mt-1">More</span>
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

                        {/* Drawer Panel - Bottom Sheet */}
                        <motion.div
                            className="fixed bottom-0 left-0 right-0 z-50 bg-paper border-t border-line rounded-t-2xl md:hidden max-h-[70vh]"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="drawer-title"
                            variants={drawerVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            {/* Drawer Handle */}
                            <div className="flex justify-center py-2">
                                <div className="w-12 h-1 bg-muted/50 rounded-full" />
                            </div>

                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-4 pb-3 border-b border-line">
                                <div className="flex items-center gap-2">
                                    <Dog size={24} className="text-roman-gold" aria-hidden="true" />
                                    <h2 id="drawer-title" className="text-lg font-bold text-roman-gold">Navigation</h2>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    aria-label="Close navigation menu"
                                    className="p-3 rounded-lg hover:bg-white/5 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                                >
                                    <X className="w-6 h-6 text-muted" aria-hidden="true" />
                                </button>
                            </div>

                            {/* Tab List - Grid layout for bottom sheet */}
                            <div className="p-4 overflow-y-auto max-h-[calc(70vh-80px)] safe-area-bottom">
                                <div className="grid grid-cols-4 gap-3" role="tablist" aria-label="All navigation tabs">
                                    {ALL_TABS.map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => handleTabClick(id)}
                                            role="tab"
                                            aria-selected={activeTab === id}
                                            aria-label={TAB_DESCRIPTIONS[id]}
                                            aria-current={activeTab === id ? 'page' : undefined}
                                            className={`flex flex-col items-center justify-center p-3 min-h-[72px] rounded-xl transition-all ${
                                                activeTab === id
                                                    ? 'bg-roman-gold/20 text-roman-gold'
                                                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            <Icon className={`w-6 h-6 mb-1 ${activeTab === id ? 'drop-shadow-[0_0_6px_rgba(240,193,75,0.8)]' : ''}`} aria-hidden="true" />
                                            <span className="text-[11px] text-center leading-tight">{label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
