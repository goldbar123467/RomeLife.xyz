'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, StatDisplay, ProgressBar, Badge, ResourceIcon, Divider, SectionHeader } from '@/components/ui';
import { RESOURCE_INFO, GAME_CONSTANTS, EMERGENCY_ACTIONS } from '@/core/constants';
import { calculateProductionSummary } from '@/core/math';
import type { ResourceType } from '@/core/types';
import { AlertTriangle } from 'lucide-react';

export function OverviewPanel() {
    const state = useGameStore();
    const {
        founder, round, season, denarii, population, happiness,
        troops, morale, territories, buildings, piety, patronGod,
        inventory, endSeason, technologies, lastEvents,
        emergencyCooldowns, executeEmergency
    } = state;

    const ownedTerritories = territories.filter(t => t.owned);
    const builtBuildings = buildings.filter(b => b.built);
    const production = calculateProductionSummary(state);
    const imperialEvents = lastEvents || [];

    // Calculate Legion Stats
    const totalGarrison = ownedTerritories.reduce((acc, t) => acc + (t.garrison || 0), 0);
    const totalPower = troops + totalGarrison;

    // Calculate Active Effects
    const activeEffects = [
        ...builtBuildings.flatMap(b => b.effects.map(e => ({
            name: b.name,
            type: e.type,
            value: e.multiplier ? `x${e.value}` : `+${e.value}`,
            icon: '🏛️'
        }))),
        ...(technologies?.filter(t => t.researched) || []).flatMap(t => t.effects.map(e => ({
            name: t.name,
            type: e.type,
            value: e.multiplier ? `x${e.value}` : `+${e.value}`,
            icon: '📜'
        })))
    ].slice(0, 6);

    // Crisis Detection
    const grainAmount = inventory.grain || 0;
    const isInCrisis = happiness < 30 || denarii < 100 || grainAmount < 20;

    // Check if emergency action can be executed
    const canExecuteEmergency = (action: typeof EMERGENCY_ACTIONS[0]) => {
        const cooldown = emergencyCooldowns?.[action.id] || 0;
        if (cooldown > 0) return false;

        // Check costs
        if (action.cost.happiness && happiness < action.cost.happiness) return false;
        if (action.cost.population && population < action.cost.population) return false;
        if (action.cost.piety && piety < action.cost.piety) return false;
        if (action.cost.reputation && state.reputation < action.cost.reputation) return false;
        if (action.cost.denarii && denarii < action.cost.denarii) return false;

        return true;
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <motion.div className="glass-gold rounded-2xl p-4" whileHover={{ scale: 1.02 }}>
                    <StatDisplay label="Denarii" value={denarii.toLocaleString()} icon="🪙" size="md" />
                </motion.div>
                <motion.div className="glass-dark rounded-2xl p-4" whileHover={{ scale: 1.02 }}>
                    <StatDisplay label="Population" value={population} icon="👥" size="md" />
                </motion.div>
                <motion.div className="glass-dark rounded-2xl p-4" whileHover={{ scale: 1.02 }}>
                    <StatDisplay label="Happiness" value={`${happiness}%`} icon="😊" trend={happiness > 70 ? 'up' : happiness < 40 ? 'down' : 'neutral'} size="md" />
                </motion.div>
                <motion.div className="glass-dark rounded-2xl p-4 border-military/30" whileHover={{ scale: 1.02 }}>
                    <StatDisplay label="Troops" value={troops} icon="⚔️" size="md" />
                </motion.div>
                <motion.div className="glass-dark rounded-2xl p-4" whileHover={{ scale: 1.02 }}>
                    <StatDisplay label="Morale" value={`${morale}%`} icon="🛡️" size="md" />
                </motion.div>
                <motion.div className="glass-dark rounded-2xl p-4 border-religion/30" whileHover={{ scale: 1.02 }}>
                    <StatDisplay label="Piety" value={piety} icon="🙏" size="md" />
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* === LEFT COLUMN === */}
                <div className="space-y-6">
                    {/* Founder Card */}
                    {founder && (
                        <GlassCard variant="gold">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-roman-gold/20 flex items-center justify-center text-3xl">
                                    {founder.id === 'romulus' ? '⚔️' : founder.id === 'remus' ? '🕊️' : '🍳'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-roman-gold">{founder.name}</h3>
                                    <Badge variant="gold">{founder.archetype}</Badge>
                                </div>
                            </div>
                            <p className="text-sm text-muted">{founder.description}</p>
                        </GlassCard>
                    )}

                    {/* Empire Status */}
                    <GlassCard>
                        <SectionHeader title="Empire Status" subtitle={`${ownedTerritories.length} Territories Controlled`} />
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted">Territories</span>
                                <span className="font-bold text-settlement">{ownedTerritories.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted">Buildings</span>
                                <span className="font-bold text-trade">{builtBuildings.length}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted">Victory Progress</span>
                                <span className="font-bold text-roman-gold">
                                    {Math.floor((ownedTerritories.length / GAME_CONSTANTS.VICTORY_ETERNAL_CITY.territories) * 100)}%
                                </span>
                            </div>
                            <Divider className="my-4" />
                            <ProgressBar label="Path to Eternal City" value={ownedTerritories.length} max={GAME_CONSTANTS.VICTORY_ETERNAL_CITY.territories} variant="gold" showValue />
                        </div>
                    </GlassCard>

                    {/* Active Effects Dashboard */}
                    <GlassCard>
                        <SectionHeader title="Active Imperium Effects" subtitle="Current Global Bonuses" />
                        <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                            {activeEffects.length > 0 ? (
                                activeEffects.map((effect, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
                                        whileHover={{ borderColor: 'rgba(255, 215, 0, 0.3)' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>{effect.icon}</span>
                                            <div>
                                                <div className="text-sm font-bold">{effect.name}</div>
                                                <div className="text-xs text-muted capitalize">{effect.type}</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-bold text-roman-gold">{effect.value}</div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-sm text-muted italic">
                                    No active effects. Build structures or research tech!
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* === CENTER COLUMN === */}
                <div className="space-y-6">
                    {/* Production Summary */}
                    <GlassCard>
                        <SectionHeader title="Season Production" subtitle={`${season.charAt(0).toUpperCase() + season.slice(1)} harvest`} />
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(production.resources).filter(([, val]) => val > 0).slice(0, 6).map(([type, amount]) => (
                                <motion.div key={type} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10" whileHover={{ scale: 1.02, borderColor: 'rgba(255, 215, 0, 0.3)' }}>
                                    <ResourceIcon type={type} showLabel size="sm" />
                                    <span className="font-bold text-green-400">+{Math.floor(amount)}</span>
                                </motion.div>
                            ))}
                        </div>
                        <Divider className="my-4" />
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-muted">Net Income</div>
                                <div className={`text-xl font-bold ${production.netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {production.netIncome >= 0 ? '+' : ''}{production.netIncome} 🪙/season
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-muted">Food Consumption</div>
                                <div className="text-xl font-bold text-red-400">-{production.foodConsumption} 🌾/season</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Legion Status Dashboard */}
                    <GlassCard>
                        <SectionHeader title="Legion Status" subtitle="Military Force Breakdown" />
                        <div className="grid grid-cols-2 gap-4 text-center mb-4">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-2xl mb-1">⚔️</div>
                                <div className="text-xl font-bold text-white">{troops}</div>
                                <div className="text-xs text-muted uppercase tracking-wider">Field Army</div>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                                <div className="text-2xl mb-1">🏰</div>
                                <div className="text-xl font-bold text-white">{totalGarrison}</div>
                                <div className="text-xs text-muted uppercase tracking-wider">Garrisons</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-sm text-muted font-bold uppercase">Total Imperium Power</span>
                            <span className="text-2xl font-black text-roman-gold">{totalPower}</span>
                        </div>
                    </GlassCard>

                    {/* Resource Inventory */}
                    <GlassCard>
                        <SectionHeader title="Inventory" />
                        <div className="grid grid-cols-3 gap-2">
                            {Object.entries(inventory).map(([type, amount]) => (
                                <motion.div key={type} className="p-2 rounded-lg bg-white/5 text-center" whileHover={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}>
                                    <div className="text-lg">{RESOURCE_INFO[type as ResourceType]?.emoji || '📦'}</div>
                                    <div className="text-sm font-bold">{amount}</div>
                                    <div className="text-xs text-muted truncate">{RESOURCE_INFO[type as ResourceType]?.name || type}</div>
                                </motion.div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* === RIGHT COLUMN === */}
                <div className="space-y-6">
                    {/* Season Action */}
                    <GlassCard variant="gold">
                        <div className="text-center">
                            <div className="text-4xl mb-3">
                                {season === 'spring' ? '🌸' : season === 'summer' ? '☀️' : season === 'autumn' ? '🍂' : '❄️'}
                            </div>
                            <h3 className="text-xl font-bold text-roman-gold capitalize mb-2">{season}</h3>
                            <p className="text-sm text-muted mb-4">Round {round} of 25</p>
                            <Button variant="roman" fullWidth onClick={endSeason} icon="⏭️">End Season</Button>
                            <div className="mt-3 text-xs text-muted">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono">Space</kbd> to advance</div>
                        </div>
                    </GlassCard>

                    {/* Recent Events Log Dashboard */}
                    <GlassCard>
                        <SectionHeader title="Imperial Log" subtitle="Recent Activity" />
                        <div className="space-y-3 min-h-[100px]">
                            {imperialEvents.length > 0 ? (
                                imperialEvents.map((event, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="flex gap-3 text-sm border-b border-white/5 pb-2 last:border-0"
                                    >
                                        <span className="text-muted font-mono shrink-0">I</span>
                                        <span className={event.includes('Victory') || event.includes('+') ? 'text-green-400' : event.includes('Defeat') || event.includes('-') ? 'text-red-400' : 'text-ink'}>
                                            {event}
                                        </span>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-4 text-sm text-muted italic">
                                    Awaiting reports from the frontier...
                                </div>
                            )}
                        </div>
                    </GlassCard>

                    {/* Patron God */}
                    <GlassCard>
                        <SectionHeader title="Patron God" />
                        {patronGod ? (
                            <div className="text-center">
                                <div className="text-4xl mb-2">⚡</div>
                                <h4 className="text-lg font-bold text-roman-gold capitalize">{patronGod}</h4>
                                <p className="text-sm text-muted mt-1">Favor: {state.godFavor[patronGod]}%</p>
                                <ProgressBar value={state.godFavor[patronGod]} max={100} variant="gold" className="mt-3" />
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="text-4xl mb-2 opacity-50">🏛️</div>
                                <p className="text-sm text-muted">No patron god selected</p>
                                <Button variant="ghost" size="sm" className="mt-3">Choose Patron</Button>
                            </div>
                        )}
                    </GlassCard>

                    {/* Quick Actions */}
                    <GlassCard>
                        <SectionHeader title="Quick Actions" />
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="ghost" size="sm" icon="🏗️">Build</Button>
                            <Button variant="ghost" size="sm" icon="⚔️">Recruit</Button>
                            <Button variant="ghost" size="sm" icon="⚖️">Trade</Button>
                            <Button variant="ghost" size="sm" icon="📜">Research</Button>
                        </div>
                    </GlassCard>

                    {/* Emergency Actions - Show when in crisis */}
                    {isInCrisis && (
                        <GlassCard variant="crimson">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <SectionHeader title="Emergency Actions" subtitle="Crisis Mode Active" />
                            </div>
                            <div className="space-y-2">
                                {EMERGENCY_ACTIONS.map((action) => {
                                    const cooldown = emergencyCooldowns?.[action.id] || 0;
                                    const canExecute = canExecuteEmergency(action);
                                    const costText = Object.entries(action.cost)
                                        .filter(([, v]) => v > 0)
                                        .map(([k, v]) => `-${v} ${k}`)
                                        .join(', ');
                                    const effectText = Object.entries(action.effect)
                                        .filter(([, v]) => v > 0)
                                        .map(([k, v]) => `+${v} ${k}`)
                                        .join(', ');

                                    return (
                                        <motion.div
                                            key={action.id}
                                            className={`p-3 rounded-xl border ${cooldown > 0 ? 'bg-white/5 border-white/10 opacity-50' : canExecute ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50' : 'bg-white/5 border-white/10 opacity-60'}`}
                                            whileHover={canExecute ? { scale: 1.01 } : {}}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{action.icon}</span>
                                                    <span className="font-bold text-sm">{action.name}</span>
                                                </div>
                                                {cooldown > 0 ? (
                                                    <Badge variant="default">{cooldown} rounds</Badge>
                                                ) : (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        disabled={!canExecute}
                                                        onClick={() => executeEmergency(action.id)}
                                                    >
                                                        Execute
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-red-400">{costText}</span>
                                                <span className="text-green-400">{effectText}</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
}
