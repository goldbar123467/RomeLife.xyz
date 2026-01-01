'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, Badge, SectionHeader, ProgressBar, GameImage } from '@/components/ui';
import { isAssetKey } from '@/lib/assets';

export function DiplomacyPanel() {
    const state = useGameStore();
    const { diplomacy, reputation, denarii, sendEnvoy, lastEvents } = state;

    const factions = [
        { id: 'alba_longa', name: 'Alba Longa', description: 'Our mother city, Latin allies', icon: 'temple' },
        { id: 'sabines', name: 'Sabine Tribes', description: 'Hill people to the northeast', icon: 'mountain' },
        { id: 'etruscans', name: 'Etruscans', description: 'Powerful northern civilization', icon: 'emperor' },
        { id: 'latins', name: 'Latin League', description: 'Confederation of Latin cities', icon: 'handshake' },
        { id: 'greeks', name: 'Greek Colonies', description: 'Southern coastal settlements', icon: 'amphora' },
    ];

    const getRelationStatus = (relation: number): { text: string; color: string } => {
        if (relation >= 80) return { text: 'Allied', color: 'text-green-400' };
        if (relation >= 60) return { text: 'Friendly', color: 'text-cyan-400' };
        if (relation >= 40) return { text: 'Neutral', color: 'text-yellow-400' };
        if (relation >= 20) return { text: 'Unfriendly', color: 'text-orange-400' };
        return { text: 'Hostile', color: 'text-red-400' };
    };

    const envoyCost = 100;
    const canSendEnvoy = denarii >= envoyCost;

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Diplomacy"
                subtitle="Manage relations with neighboring powers"
                icon={<GameImage src="laurels" size="sm" alt="Diplomacy" />}
            />

            {/* Reputation */}
            <GlassCard variant="gold" className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-roman-gold">Rome&apos;s Reputation</h3>
                        <p className="text-sm text-muted">Your standing in the known world</p>
                    </div>
                    <div className="text-4xl font-black text-roman-gold">{reputation}</div>
                </div>
                <ProgressBar value={reputation} max={100} variant="gold" className="mt-3" />
            </GlassCard>

            {/* Envoy Info */}
            <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-roman-gold">Send Envoy</h3>
                        <p className="text-sm text-muted">Cost: {envoyCost} denarii per envoy</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-muted">Active Envoys</div>
                        <div className="text-2xl font-bold text-roman-gold">{diplomacy.activeEnvoys}</div>
                    </div>
                </div>
            </GlassCard>

            {/* Faction Relations */}
            <div className="space-y-4">
                {factions.map((faction, idx) => {
                    const relation = diplomacy.relations[faction.id] || 50;
                    const status = getRelationStatus(relation);

                    return (
                        <motion.div
                            key={faction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <GlassCard className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">{isAssetKey(faction.icon) ? <GameImage src={faction.icon} size="xl" alt={faction.name} /> : <span className="text-4xl">{faction.icon}</span>}</div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-bold text-roman-gold">{faction.name}</h4>
                                            <Badge
                                                variant={relation >= 60 ? 'success' : relation >= 40 ? 'warning' : 'danger'}
                                            >
                                                {status.text}
                                            </Badge>
                                        </div>

                                        <p className="text-sm text-muted mb-3">{faction.description}</p>

                                        <div className="mb-3">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-muted">Relations</span>
                                                <span className={status.color}>{relation}/100</span>
                                            </div>
                                            <ProgressBar
                                                value={relation}
                                                max={100}
                                                variant={relation >= 60 ? 'default' : relation >= 40 ? 'gold' : 'danger'}
                                                height="sm"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="gold"
                                                size="sm"
                                                onClick={() => sendEnvoy(faction.id)}
                                                disabled={!canSendEnvoy}
                                            >
                                                Send Envoy
                                            </Button>

                                            {relation >= 80 && (
                                                <Badge variant="success" size="sm">Trade Bonus Active</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    );
                })}
            </div>

            {/* Diplomacy Tips */}
            <GlassCard className="p-4">
                <h3 className="font-bold text-roman-gold mb-3">Diplomatic Effects</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="glass-dark rounded-lg p-3">
                        <span className="text-green-400 font-bold">Allied (80+)</span>
                        <p className="text-muted mt-1">+20% trade prices, military support</p>
                    </div>
                    <div className="glass-dark rounded-lg p-3">
                        <span className="text-cyan-400 font-bold">Friendly (60+)</span>
                        <p className="text-muted mt-1">+10% trade prices, reduced tariffs</p>
                    </div>
                    <div className="glass-dark rounded-lg p-3">
                        <span className="text-yellow-400 font-bold">Neutral (40+)</span>
                        <p className="text-muted mt-1">Normal trade relations</p>
                    </div>
                    <div className="glass-dark rounded-lg p-3">
                        <span className="text-red-400 font-bold">Hostile (&lt;20)</span>
                        <p className="text-muted mt-1">Trade embargoes, raid risk</p>
                    </div>
                </div>
            </GlassCard>

            {/* Last Envoy Event */}
            {lastEvents.length > 0 && lastEvents[0].includes('Envoy') && (
                <motion.div
                    className={`rounded-xl p-4 text-center ${lastEvents[0].includes('successful') ? 'glass-gold' : 'glass-dark border-red-400/50'
                        }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <span className={lastEvents[0].includes('successful') ? 'text-roman-gold' : 'text-red-400'}>
                        {lastEvents[0]}
                    </span>
                </motion.div>
            )}
        </div>
    );
}
