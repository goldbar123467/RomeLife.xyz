'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Users, AlertTriangle, Eye, MessageSquare } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import type { SenatorId, AttentionAllocation as AttentionAllocationType } from '@/core/types/senate';
import { SENATE_GRACE_PERIOD_ROUNDS } from '@/core/constants/senate';
import { staggerContainer, fadeInUp } from '@/lib/animations';
import { GlassCard, Badge } from '@/components/ui';
import { SenatorCard } from './SenatorCard';
import { SenatorDetail } from './SenatorDetail';
import { AttentionAllocation } from './AttentionAllocation';
import { SenatorEventModal } from './SenatorEventModal';

const SENATOR_ORDER: SenatorId[] = ['sertorius', 'sulla', 'clodius', 'pulcher', 'oppius'];

export function SenatePanel() {
    const {
        senate,
        round,
        initializeSenate,
        allocateAttention,
        resolveSenatorEvent,
        dismissSenatorEvent,
    } = useGameStore();

    const [selectedSenator, setSelectedSenator] = useState<SenatorId | null>(null);

    // Initialize senate if needed
    if (!senate.initialized) {
        initializeSenate();
        return (
            <div className="p-6 flex items-center justify-center">
                <div className="text-muted">Initializing Senate...</div>
            </div>
        );
    }

    const attention = senate.attentionThisSeason || {
        sertorius: 20, sulla: 20, clodius: 20, pulcher: 20, oppius: 20
    };

    // Count danger levels
    const dangerCount = SENATOR_ORDER.filter(id => {
        const senator = senate.senators[id];
        return senator.assassination.windowOpen ||
            senator.relation <= -50 ||
            senator.currentState.includes('hostile') ||
            senator.currentState.includes('rival') ||
            senator.currentState.includes('condemned');
    }).length;

    const isGracePeriod = round <= SENATE_GRACE_PERIOD_ROUNDS;

    const handleAllocate = (allocation: AttentionAllocationType) => {
        allocateAttention(allocation);
    };

    const handleEventChoice = (choiceId: string) => {
        resolveSenatorEvent(choiceId);
    };

    const selectedSenatorData = selectedSenator ? senate.senators[selectedSenator] : null;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-roman-gold/10 border border-roman-gold/20">
                        <Landmark className="w-6 h-6 text-roman-gold" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-roman-gold">The Senate</h2>
                        <p className="text-sm text-muted">
                            {isGracePeriod
                                ? 'Senators are observing your early decisions...'
                                : 'Navigate political alliances and rivalries'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {dangerCount > 0 && (
                        <Badge variant="danger" className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {dangerCount} {dangerCount === 1 ? 'Threat' : 'Threats'}
                        </Badge>
                    )}
                    {isGracePeriod && (
                        <Badge variant="warning" className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Grace Period (Round {round}/4)
                        </Badge>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-roman-gold" />
                        <span className="text-sm text-muted">Senators</span>
                    </div>
                    <span className="text-2xl font-black text-roman-gold">5</span>
                </GlassCard>
                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-muted">Events</span>
                    </div>
                    <span className="text-2xl font-black text-blue-400">
                        {senate.pendingEvents?.length || 0}
                    </span>
                </GlassCard>
                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-muted">Friendly</span>
                    </div>
                    <span className="text-2xl font-black text-green-400">
                        {SENATOR_ORDER.filter(id => senate.senators[id].relation >= 30).length}
                    </span>
                </GlassCard>
                <GlassCard className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-muted">Hostile</span>
                    </div>
                    <span className="text-2xl font-black text-red-400">
                        {SENATOR_ORDER.filter(id => senate.senators[id].relation <= -30).length}
                    </span>
                </GlassCard>
            </div>

            {/* Attention Allocation */}
            <GlassCard className="p-6">
                <AttentionAllocation
                    currentAllocation={senate.attentionThisSeason}
                    locked={senate.attentionLocked}
                    onAllocate={handleAllocate}
                    round={round}
                />
            </GlassCard>

            {/* Senator Grid */}
            <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
            >
                {SENATOR_ORDER.map(id => (
                    <motion.div key={id} variants={fadeInUp}>
                        <SenatorCard
                            senator={senate.senators[id]}
                            attention={attention[id]}
                            onClick={() => setSelectedSenator(id)}
                        />
                    </motion.div>
                ))}
            </motion.div>

            {/* Event Log */}
            {senate.eventHistory.length > 0 && (
                <GlassCard className="p-4">
                    <h3 className="text-sm font-bold text-roman-gold mb-3">Recent Events</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {senate.eventHistory.slice(-5).reverse().map((entry, i) => (
                            <div key={i} className="text-sm text-muted flex items-center gap-2">
                                <span className="text-xs bg-roman-gold/20 text-roman-gold px-2 py-0.5 rounded">
                                    R{entry.round}
                                </span>
                                <span>{entry.eventId}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}

            {/* Senator Detail Modal */}
            <AnimatePresence>
                {selectedSenatorData && (
                    <SenatorDetail
                        senator={selectedSenatorData}
                        attention={attention[selectedSenator!]}
                        onClose={() => setSelectedSenator(null)}
                    />
                )}
            </AnimatePresence>

            {/* Event Modal */}
            <SenatorEventModal
                event={senate.currentEvent}
                onChoice={handleEventChoice}
                onDismiss={dismissSenatorEvent}
            />
        </div>
    );
}
