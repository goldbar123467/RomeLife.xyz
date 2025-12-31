'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, Button, Badge, SectionHeader, ProgressBar, GameImage } from '@/components/ui';

export function TechnologyPanel() {
    const state = useGameStore();
    const { technologies, denarii, patronGod, researchTechnology, lastEvents } = state;

    const categories = ['economy', 'military', 'farming', 'mining', 'population', 'trade'] as const;

    const getCategoryAsset = (cat: string): string => {
        switch (cat) {
            case 'economy': return 'coin-gold';
            case 'military': return 'centurion-helmet';
            case 'farming': return 'grapes';
            case 'mining': return 'gear';
            case 'population': return 'roman';
            case 'trade': return 'amphora';
            default: return 'scroll';
        }
    };

    const researchedCount = technologies.filter(t => t.researched).length;
    const totalTechs = technologies.length;

    // Minerva discount
    const hasMinervaDiscount = patronGod === 'minerva';

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Technology"
                subtitle="Research new technologies to advance your civilization"
                icon="📜"
            />

            {/* Research Progress */}
            <GlassCard variant="gold" className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-roman-gold">Research Progress</h3>
                        <p className="text-sm text-muted">{researchedCount} of {totalTechs} technologies discovered</p>
                    </div>
                    <div className="text-3xl font-black text-roman-gold">{Math.round((researchedCount / totalTechs) * 100)}%</div>
                </div>
                <ProgressBar value={researchedCount} max={totalTechs} variant="gold" />

                {hasMinervaDiscount && (
                    <div className="mt-3 text-sm text-green-400 flex items-center gap-2">
                        <span>🦉</span>
                        <span>Minerva&apos;s Blessing: 25% research cost reduction</span>
                    </div>
                )}
            </GlassCard>

            {/* Technologies by Category */}
            {categories.map(category => {
                const categoryTechs = technologies.filter(t => t.category === category);
                const categoryResearched = categoryTechs.filter(t => t.researched).length;

                return (
                    <GlassCard key={category} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-roman-gold flex items-center gap-2">
                                <GameImage src={getCategoryAsset(category)} size="sm" alt={category} />
                                <span className="capitalize">{category}</span>
                            </h3>
                            <Badge variant={categoryResearched === categoryTechs.length ? 'success' : 'gold'}>
                                {categoryResearched}/{categoryTechs.length}
                            </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categoryTechs.map((tech, idx) => {
                                const cost = hasMinervaDiscount ? Math.floor(tech.cost * 0.75) : tech.cost;
                                const canAfford = denarii >= cost && !tech.researched;

                                return (
                                    <motion.div
                                        key={tech.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`rounded-xl p-3 transition-all ${tech.researched
                                            ? 'glass-gold border-green-500/30'
                                            : canAfford
                                                ? 'glass-dark hover:border-roman-gold/50 cursor-pointer'
                                                : 'glass-dark opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className={`font-bold ${tech.researched ? 'text-green-400' : 'text-roman-gold'}`}>
                                                {tech.name}
                                            </h4>
                                            {tech.researched && <span className="text-green-400">✓</span>}
                                        </div>

                                        <p className="text-xs text-muted mb-2">{tech.description}</p>

                                        <div className="text-xs text-muted mb-2">
                                            {tech.effects.map((effect, i) => (
                                                <div key={i} className="text-green-400">{effect.description}</div>
                                            ))}
                                        </div>

                                        {!tech.researched && (
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                                                <span className={`text-sm ${canAfford ? 'text-roman-gold' : 'text-red-400'}`}>
                                                    <><GameImage src="coin-gold" size="xs" /> {cost}</>
                                                    {hasMinervaDiscount && (
                                                        <span className="text-xs text-muted ml-1 line-through">{tech.cost}</span>
                                                    )}
                                                </span>
                                                <Button
                                                    variant="gold"
                                                    size="sm"
                                                    onClick={() => researchTechnology(tech.id)}
                                                    disabled={!canAfford}
                                                >
                                                    Research
                                                </Button>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </GlassCard>
                );
            })}

            {/* Last Research Event */}
            {lastEvents.length > 0 && lastEvents[0].includes('Researched') && (
                <motion.div
                    className="glass-gold rounded-xl p-4 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <span className="text-roman-gold">{lastEvents[0]}</span>
                </motion.div>
            )}
        </div>
    );
}
