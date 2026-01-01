'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { ROMAN_GODS, RELIGIOUS_BUILDINGS, WORSHIP_ACTIONS, getActiveBlessings } from '@/core/constants';
import { GOD_ICONS } from '@/components/ui/icons';
import { staggerContainer, fadeInUp, cardHover } from '@/lib/animations';
import { Zap, Heart, Check, Building2, Sparkles, ScrollText, Info, Landmark, Beef, Wheat, type LucideIcon } from 'lucide-react';
import { GlassCard, Button, Badge, GameImage, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui';
import { RELIGIOUS_BUILDING_ASSETS, WORSHIP_ACTION_ASSETS } from '@/lib/assets';
import type { GodName, God } from '@/core/types';

type ReligionTab = 'gods' | 'buildings' | 'worship';

export function ReligionPanel() {
    const [activeTab, setActiveTab] = useState<ReligionTab>('gods');
    const [selectedGod, setSelectedGod] = useState<God | null>(null);
    const {
        patronGod, godFavor, piety, setPatronGod, worship, denarii, inventory,
        religiousBuildings, buildReligiousBuilding
    } = useGameStore();

    const tabs: { id: ReligionTab; label: string; icon: LucideIcon | string }[] = [
        { id: 'gods', label: 'Gods', icon: Zap },
        { id: 'buildings', label: 'Buildings', icon: 'temple' },
        { id: 'worship', label: 'Worship', icon: 'bust' },
    ];

    // Get active blessings for display
    const activeBlessingCount = patronGod
        ? getActiveBlessings(patronGod, godFavor[patronGod] || 0).length
        : 0;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-religion/10 border border-religion/20">
                        <Zap className="w-6 h-6 text-religion" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-roman-gold">Religion & Gods</h2>
                        <p className="text-sm text-muted">Earn divine favor through worship</p>
                    </div>
                </div>
                {activeBlessingCount > 0 && (
                    <Badge variant="gold">
                        {activeBlessingCount} Active Blessing{activeBlessingCount !== 1 ? 's' : ''}
                    </Badge>
                )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-roman-gold/10 to-transparent rounded-xl p-4 border border-roman-gold/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Heart className="w-4 h-4 text-roman-gold" />
                        <span className="text-sm text-muted">Piety</span>
                    </div>
                    <span className="text-2xl font-black text-roman-gold">{piety}</span>
                </div>
                <div className="bg-gradient-to-r from-religion/10 to-transparent rounded-xl p-4 border border-religion/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-4 h-4 text-religion" />
                        <span className="text-sm text-muted">Buildings</span>
                    </div>
                    <span className="text-2xl font-black text-religion">{religiousBuildings?.length || 0}</span>
                </div>
                <div className="bg-gradient-to-r from-green-500/10 to-transparent rounded-xl p-4 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-muted">Patron Favor</span>
                    </div>
                    <span className="text-2xl font-black text-green-400">
                        {patronGod ? `${godFavor[patronGod]}%` : '-'}
                    </span>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-line pb-2">
                {tabs.map(tab => {
                    const isLucideIcon = typeof tab.icon !== 'string';
                    const TabIcon = isLucideIcon ? tab.icon : null;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'bg-roman-gold/20 text-roman-gold'
                                    : 'text-muted hover:text-foreground hover:bg-white/5'
                            }`}
                        >
                            {isLucideIcon && TabIcon ? (
                                <TabIcon size={16} className={activeTab === tab.id ? 'text-roman-gold' : 'text-muted'} />
                            ) : (
                                <GameImage src={tab.icon as string} size="sm" alt={tab.label} />
                            )}
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {/* Gods Tab */}
                {activeTab === 'gods' && (
                    <motion.div
                        key="gods"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Gods Grid */}
                        <motion.div
                            className="grid grid-cols-2 md:grid-cols-3 gap-4"
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                        >
                            {Object.entries(ROMAN_GODS).map(([id, god]) => {
                                const GodIcon = GOD_ICONS[id as keyof typeof GOD_ICONS];
                                const isPatron = patronGod === id;
                                const favor = godFavor[id as GodName];

                                return (
                                    <motion.div
                                        key={id}
                                        variants={fadeInUp}
                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                                            isPatron
                                                ? 'bg-gradient-to-br from-roman-gold/15 to-transparent border-roman-gold/50 shadow-glow-gold'
                                                : 'bg-paper-light border-line hover:border-roman-gold/30'
                                        }`}
                                        whileHover={cardHover.whileHover}
                                        whileTap={cardHover.whileTap}
                                        onClick={() => setPatronGod(id as GodName)}
                                    >
                                        {/* Info button */}
                                        <button
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedGod(god);
                                            }}
                                        >
                                            <Info className="w-4 h-4 text-muted hover:text-roman-gold" />
                                        </button>

                                        <div className="text-center">
                                            <div className={`inline-flex p-3 rounded-xl mb-3 ${
                                                isPatron ? 'bg-roman-gold/20' : 'bg-religion/20'
                                            }`}>
                                                <GodIcon className={`w-8 h-8 ${isPatron ? 'text-roman-gold' : 'text-religion'}`} />
                                            </div>

                                            <h3 className="font-bold text-roman-gold">{god.name}</h3>
                                            <p className="text-xs text-muted mt-1">{god.domain}</p>

                                            <div className="mt-3">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-muted">Favor</span>
                                                    <span className="text-roman-gold">{favor}%</span>
                                                </div>
                                                <div className="h-2 bg-bg rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-roman-gold to-roman-gold-bright transition-all duration-500"
                                                        style={{ width: `${favor}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {isPatron && (
                                                <div className="mt-3 text-xs bg-roman-gold/20 text-roman-gold px-3 py-1 rounded-full inline-flex items-center gap-1">
                                                    <Check className="w-3 h-3" />
                                                    Patron God
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        {/* Blessings Info */}
                        {patronGod && (
                            <GlassCard className="p-4">
                                <h3 className="font-bold text-roman-gold mb-2">
                                    {ROMAN_GODS[patronGod].name}&apos;s Blessings
                                </h3>
                                <p className="text-sm text-green-400 mb-4">{ROMAN_GODS[patronGod].patronBonus}</p>

                                <div className="space-y-2">
                                    {ROMAN_GODS[patronGod].blessings.map((blessing, idx) => {
                                        const isUnlocked = godFavor[patronGod] >= blessing.tier;
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                                                    isUnlocked ? 'bg-green-500/10' : 'bg-bg'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                    isUnlocked
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-muted/20 text-muted'
                                                }`}>
                                                    {blessing.tier}%
                                                </div>
                                                <div className="flex-1">
                                                    <div className={`font-medium ${isUnlocked ? 'text-green-400' : 'text-muted'}`}>
                                                        {blessing.name}
                                                    </div>
                                                    <div className="text-xs text-muted">{blessing.effect}</div>
                                                </div>
                                                {isUnlocked && (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </GlassCard>
                        )}
                    </motion.div>
                )}

                {/* Buildings Tab */}
                {activeTab === 'buildings' && (
                    <motion.div
                        key="buildings"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <p className="text-sm text-muted">
                            Build sacred structures to generate piety and favor each season.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.values(RELIGIOUS_BUILDINGS).map(building => {
                                const isBuilt = religiousBuildings?.includes(building.id);
                                const canAfford = denarii >= building.cost;

                                return (
                                    <GlassCard
                                        key={building.id}
                                        variant={isBuilt ? 'gold' : 'default'}
                                        className={`p-4 ${isBuilt ? 'opacity-75' : ''}`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`text-4xl p-2 rounded-xl ${isBuilt ? 'bg-green-500/20' : 'bg-religion/20'}`}>
                                                <GameImage src={RELIGIOUS_BUILDING_ASSETS[building.id] || building.icon} size="xl" alt={building.name} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="font-bold text-roman-gold">{building.name}</h4>
                                                    {isBuilt && (
                                                        <Badge variant="default" className="bg-green-500/20 text-green-400">Built</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted italic mb-2">{building.latinName}</p>
                                                <p className="text-sm text-muted mb-3">{building.description}</p>

                                                <div className="flex items-center gap-4 text-xs mb-3">
                                                    <span className="text-religion flex items-center gap-1">
                                                        +{building.pietyPerSeason} <Sparkles size={12} />/season
                                                    </span>
                                                    <span className="text-roman-gold flex items-center gap-1">
                                                        +{building.favorPerSeason} <Landmark size={12} />/season
                                                    </span>
                                                </div>

                                                {!isBuilt && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-roman-gold">{building.cost} denarii</span>
                                                        <Button
                                                            variant="roman"
                                                            size="sm"
                                                            disabled={!canAfford}
                                                            onClick={() => buildReligiousBuilding(building.id)}
                                                        >
                                                            Build
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </GlassCard>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Worship Tab */}
                {activeTab === 'worship' && (
                    <motion.div
                        key="worship"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {!patronGod ? (
                            <GlassCard className="p-6 text-center">
                                <p className="text-muted">Select a patron god from the Gods tab to unlock worship actions.</p>
                            </GlassCard>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {Object.values(WORSHIP_ACTIONS).map(action => {
                                    // Check if player can afford the action
                                    let canAfford = true;
                                    const costItems: { amount: number; icon: LucideIcon; color: string }[] = [];

                                    if (action.cost.denarii) {
                                        if (denarii < action.cost.denarii) canAfford = false;
                                        costItems.push({ amount: action.cost.denarii, icon: Landmark, color: 'text-roman-gold' });
                                    }
                                    if (action.cost.piety) {
                                        if (piety < action.cost.piety) canAfford = false;
                                        costItems.push({ amount: action.cost.piety, icon: Sparkles, color: 'text-purple-400' });
                                    }
                                    if (action.cost.livestock) {
                                        if ((inventory.livestock || 0) < action.cost.livestock) canAfford = false;
                                        costItems.push({ amount: action.cost.livestock, icon: Beef, color: 'text-amber-400' });
                                    }
                                    if (action.cost.grain) {
                                        if ((inventory.grain || 0) < action.cost.grain) canAfford = false;
                                        costItems.push({ amount: action.cost.grain, icon: Wheat, color: 'text-amber-400' });
                                    }

                                    // Effect text
                                    const effectParts: string[] = [];
                                    if (action.effect.godFavor) effectParts.push(`+${action.effect.godFavor} Favor`);
                                    if (action.effect.piety) effectParts.push(`+${action.effect.piety} Piety`);
                                    if (action.effect.happiness) effectParts.push(`+${action.effect.happiness}% Happy`);
                                    if (action.effect.reputation) effectParts.push(`+${action.effect.reputation} Rep`);
                                    const effectText = effectParts.join(', ');

                                    return (
                                        <motion.div
                                            key={action.id}
                                            className={`bg-paper-light rounded-xl p-4 border transition-all ${
                                                canAfford
                                                    ? 'border-roman-gold/30 hover:border-roman-gold/50 cursor-pointer'
                                                    : 'border-line opacity-50 cursor-not-allowed'
                                            }`}
                                            whileHover={canAfford ? { scale: 1.02 } : {}}
                                            whileTap={canAfford ? { scale: 0.98 } : {}}
                                            onClick={() => canAfford && worship(action.id)}
                                        >
                                            <div className="text-center">
                                                <GameImage src={WORSHIP_ACTION_ASSETS[action.id] || action.icon} size="lg" alt={action.name} className="mb-2" />
                                                <h4 className="font-bold text-roman-gold text-sm mb-1">{action.name}</h4>
                                                <div className="text-xs text-muted mb-2 flex items-center justify-center gap-2">
                                                    {costItems.length > 0 ? (
                                                        costItems.map((item, idx) => {
                                                            const CostIcon = item.icon;
                                                            return (
                                                                <span key={idx} className={`flex items-center gap-0.5 ${item.color}`}>
                                                                    {item.amount}<CostIcon size={12} />
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span>Free</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-green-400">{effectText}</div>
                                                {action.cooldown > 0 && (
                                                    <div className="text-xs text-muted mt-2">
                                                        {action.cooldown} round cooldown
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Worship explanation */}
                        <GlassCard className="p-4 mt-4">
                            <h4 className="font-bold text-roman-gold mb-2">About Worship</h4>
                            <p className="text-sm text-muted">
                                Worship actions increase your favor with your patron god. As favor grows,
                                you unlock powerful blessings that provide permanent bonuses. Build religious
                                buildings for passive piety and favor generation each season.
                            </p>
                        </GlassCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* God Detail Sheet */}
            <Sheet open={!!selectedGod} onOpenChange={(open) => !open && setSelectedGod(null)}>
                <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
                    {selectedGod && (() => {
                        const GodIcon = GOD_ICONS[selectedGod.id as keyof typeof GOD_ICONS];
                        const favor = godFavor[selectedGod.id];
                        const isPatron = patronGod === selectedGod.id;

                        return (
                            <>
                                <SheetHeader>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${isPatron ? 'bg-roman-gold/20' : 'bg-religion/20'}`}>
                                            <GodIcon className={`w-8 h-8 ${isPatron ? 'text-roman-gold' : 'text-religion'}`} />
                                        </div>
                                        <div>
                                            <SheetTitle className="flex items-center gap-2">
                                                {selectedGod.name}
                                                {isPatron && <Badge variant="gold" size="sm">Patron</Badge>}
                                            </SheetTitle>
                                            <SheetDescription className="flex items-center gap-2">
                                                {selectedGod.domain} • Greek: {selectedGod.greekEquivalent}
                                            </SheetDescription>
                                        </div>
                                    </div>
                                </SheetHeader>

                                <div className="py-4 space-y-4">
                                    {/* Description */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <p className="text-sm text-foreground leading-relaxed">
                                            {selectedGod.description}
                                        </p>
                                    </div>

                                    {/* Symbols */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <div className="text-xs text-roman-gold font-bold mb-3 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" /> Sacred Symbols
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedGod.symbols.map((symbol, i) => (
                                                <span key={i} className="text-sm bg-roman-gold/10 text-roman-gold px-3 py-1.5 rounded-lg">
                                                    {symbol}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Historical Background */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <div className="text-xs text-roman-gold font-bold mb-2 flex items-center gap-1">
                                            <ScrollText className="w-3 h-3" /> Historical Background
                                        </div>
                                        <p className="text-xs text-muted leading-relaxed">
                                            {selectedGod.history}
                                        </p>
                                    </div>

                                    {/* Patron Bonus */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <div className="text-xs text-green-400 font-bold mb-2 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Patron Bonus
                                        </div>
                                        <p className="text-sm text-green-400">
                                            {selectedGod.patronBonus}
                                        </p>
                                    </div>

                                    {/* Blessings Preview */}
                                    <div className="glass-dark rounded-xl p-4">
                                        <div className="text-xs text-roman-gold font-bold mb-3">Blessings</div>
                                        <div className="space-y-2">
                                            {selectedGod.blessings.map((blessing, idx) => {
                                                const isUnlocked = favor >= blessing.tier;
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`flex items-center gap-3 p-2 rounded-lg ${
                                                            isUnlocked ? 'bg-green-500/10' : 'bg-bg'
                                                        }`}
                                                    >
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                                            isUnlocked
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : 'bg-muted/20 text-muted'
                                                        }`}>
                                                            {blessing.tier}%
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className={`font-medium text-sm ${isUnlocked ? 'text-green-400' : 'text-muted'}`}>
                                                                {blessing.name}
                                                            </div>
                                                            <div className="text-xs text-muted">{blessing.effect}</div>
                                                        </div>
                                                        {isUnlocked && <Check className="w-4 h-4 text-green-400" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <SheetFooter>
                                    <Button
                                        variant="gold"
                                        size="lg"
                                        className="w-full"
                                        onClick={() => {
                                            setPatronGod(selectedGod.id);
                                            setSelectedGod(null);
                                        }}
                                        disabled={isPatron}
                                    >
                                        {isPatron ? `${selectedGod.name} is Your Patron` : `Choose ${selectedGod.name} as Patron`}
                                    </Button>
                                </SheetFooter>
                            </>
                        );
                    })()}
                </SheetContent>
            </Sheet>
        </div>
    );
}
