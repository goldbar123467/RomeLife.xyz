'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Check, Coins } from 'lucide-react';
import type { SenatorEvent, SenatorEventChoice, SenatorId } from '@/core/types/senate';
import { SENATORS } from '@/core/constants/senate';
import { GlassCard } from '@/components/ui';
import { useGameStore } from '@/store/gameStore';

interface SenatorEventModalProps {
    event: SenatorEvent | null;
    onChoice: (choiceId: string) => void;
    onDismiss: () => void;
}

export function SenatorEventModal({ event, onChoice, onDismiss }: SenatorEventModalProps) {
    const { denarii, troops, inventory } = useGameStore();

    if (!event) return null;

    const senator = SENATORS[event.senatorId];

    const canAffordChoice = (choice: SenatorEventChoice): boolean => {
        if (!choice.requirements) return true;
        if (choice.requirements.denarii && denarii < choice.requirements.denarii) return false;
        if (choice.requirements.troops && troops < choice.requirements.troops) return false;
        if (choice.requirements.grain && inventory.grain < choice.requirements.grain) return false;
        return true;
    };

    const getRequirementText = (choice: SenatorEventChoice): string[] => {
        if (!choice.requirements) return [];
        const reqs: string[] = [];
        if (choice.requirements.denarii) reqs.push(`${choice.requirements.denarii} denarii`);
        if (choice.requirements.troops) reqs.push(`${choice.requirements.troops} troops`);
        if (choice.requirements.grain) reqs.push(`${choice.requirements.grain} grain`);
        return reqs;
    };

    const getEffectPreview = (choice: SenatorEventChoice): string[] => {
        const effects: string[] = [];
        if (choice.effects.relationChanges) {
            for (const [id, change] of Object.entries(choice.effects.relationChanges)) {
                const name = SENATORS[id as SenatorId]?.name || id;
                effects.push(`${name}: ${change > 0 ? '+' : ''}${change} relation`);
            }
        }
        if (choice.effects.resourceChanges) {
            const rc = choice.effects.resourceChanges;
            if (rc.denarii) effects.push(`${rc.denarii > 0 ? '+' : ''}${rc.denarii} denarii`);
            if (rc.happiness) effects.push(`${rc.happiness > 0 ? '+' : ''}${rc.happiness} happiness`);
            if (rc.morale) effects.push(`${rc.morale > 0 ? '+' : ''}${rc.morale} morale`);
            if (rc.piety) effects.push(`${rc.piety > 0 ? '+' : ''}${rc.piety} piety`);
            if (rc.grain) effects.push(`${rc.grain > 0 ? '+' : ''}${rc.grain} grain`);
        }
        return effects;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onDismiss}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl"
                >
                    <GlassCard className="border-2 border-roman-gold/40 overflow-hidden">
                        {/* Header */}
                        <div className="relative bg-gradient-to-r from-roman-gold/20 to-transparent p-6 border-b border-roman-gold/20">
                            <button
                                onClick={onDismiss}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-muted" />
                            </button>

                            <div className="flex items-center gap-4">
                                {/* Senator Avatar */}
                                <div className="w-16 h-16 rounded-xl bg-roman-gold/20 border-2 border-roman-gold/40 flex items-center justify-center">
                                    <span className="text-2xl">🏛️</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-roman-gold">{event.title}</h2>
                                    <p className="text-sm text-muted">
                                        {senator.name} &ldquo;{senator.cognomen}&rdquo;
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-6 border-b border-roman-gold/10">
                            <div className="prose prose-invert prose-sm max-w-none">
                                {event.description.split('\n\n').map((paragraph, i) => (
                                    <p key={i} className="text-foreground/90 mb-3 last:mb-0 leading-relaxed">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>

                        {/* Choices */}
                        <div className="p-6 space-y-3">
                            <h3 className="text-sm font-bold text-roman-gold mb-4">Your Response:</h3>

                            {event.choices.map((choice) => {
                                const canAfford = canAffordChoice(choice);
                                const requirements = getRequirementText(choice);
                                const effects = getEffectPreview(choice);

                                return (
                                    <motion.button
                                        key={choice.id}
                                        onClick={() => canAfford && onChoice(choice.id)}
                                        disabled={!canAfford}
                                        whileHover={canAfford ? { scale: 1.01 } : {}}
                                        whileTap={canAfford ? { scale: 0.99 } : {}}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                                            canAfford
                                                ? 'border-roman-gold/30 hover:border-roman-gold/60 hover:bg-roman-gold/5 cursor-pointer'
                                                : 'border-muted/20 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 p-1 rounded-full ${
                                                canAfford ? 'bg-roman-gold/20' : 'bg-muted/20'
                                            }`}>
                                                {canAfford ? (
                                                    <Check className="w-4 h-4 text-roman-gold" />
                                                ) : (
                                                    <AlertTriangle className="w-4 h-4 text-muted" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={`text-sm ${canAfford ? 'text-foreground' : 'text-muted'}`}>
                                                    {choice.text}
                                                </p>

                                                {/* Requirements */}
                                                {requirements.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {requirements.map((req, i) => (
                                                            <span key={i} className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                                                                canAfford ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                                <Coins className="w-3 h-3" />
                                                                {req}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Effect Preview */}
                                                {effects.length > 0 && canAfford && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {effects.map((effect, i) => (
                                                            <span key={i} className={`text-xs px-2 py-0.5 rounded ${
                                                                effect.includes('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                                {effect}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </GlassCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
