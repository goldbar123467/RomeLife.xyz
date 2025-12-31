'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { pageTransition, pageTransitionConfig } from '@/lib/animations';
import { TerminalHeader } from './TerminalHeader';
import { TabNavigation } from './TabNavigation';
import { OverviewPanel } from './OverviewPanel';
import { IntroScreen, FounderSelectScreen } from './IntroScreens';
import { ResourcesPanel } from './ResourcesPanel';
import { EconomyPanel } from './EconomyPanel';
import { TradePanel } from './TradePanel';
import { MilitaryPanel } from './MilitaryPanel';
import { SettlementPanel } from './SettlementPanel';
import { DiplomacyPanel } from './DiplomacyPanel';
import { TechnologyPanel } from './TechnologyPanel';
import { AchievementsPanel } from './AchievementsPanel';
import { MapPanel } from './MapPanel';
import { ReligionPanel } from './ReligionPanel';
import { WondersPanel } from './WondersPanel';
import { QuestsPanel } from './QuestsPanel';
import { SenatePanel, SenatorEventModal } from '@/components/senate';
import { BattleScreen } from './BattleScreen';
import { ResultsScreen } from './ResultsScreen';
import { MobileNav } from './MobileNav';

// Main Game Layout
export function GameLayout() {
    const { stage, activeTab, battle, senate, resolveSenatorEvent, dismissSenatorEvent } = useGameStore();

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && stage === 'game') {
                e.preventDefault();
                useGameStore.getState().endSeason();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [stage]);

    // Render based on game stage
    if (stage === 'intro') {
        return <IntroScreen />;
    }

    if (stage === 'founder_select') {
        return <FounderSelectScreen />;
    }

    if (stage === 'results') {
        return <ResultsScreen />;
    }

    // Main game view
    const renderPanel = () => {
        switch (activeTab) {
            case 'overview': return <OverviewPanel />;
            case 'resources': return <ResourcesPanel />;
            case 'economy': return <EconomyPanel />;
            case 'trade': return <TradePanel />;
            case 'military': return <MilitaryPanel />;
            case 'map': return <MapPanel />;
            case 'settlement': return <SettlementPanel />;
            case 'diplomacy': return <DiplomacyPanel />;
            case 'technology': return <TechnologyPanel />;
            case 'religion': return <ReligionPanel />;
            case 'wonders': return <WondersPanel />;
            case 'quests': return <QuestsPanel />;
            case 'achievements': return <AchievementsPanel />;
            case 'senate': return <SenatePanel />;
            default: return <OverviewPanel />;
        }
    };

    return (
        <div className="min-h-screen bg-bg roman-pattern flex flex-col">
            <TerminalHeader />

            <div className="flex flex-1 relative items-start">
                {/* Vertical Sidebar - Now scrolls with page */}
                <aside className="w-64 flex-shrink-0 relative z-40 hidden md:block pt-4">
                    <TabNavigation />
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-4 md:p-8 min-w-0 pb-20 md:pb-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            variants={pageTransition}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={pageTransitionConfig}
                            className="max-w-7xl mx-auto"
                        >
                            {renderPanel()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Battle overlay */}
            <AnimatePresence>
                {battle && <BattleScreen />}
            </AnimatePresence>

            {/* Senate Event Modal - Global so it appears on any tab */}
            <SenatorEventModal
                event={senate?.currentEvent ?? null}
                onChoice={resolveSenatorEvent}
                onDismiss={dismissSenatorEvent}
            />

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}
