'use client';

import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GoldModal } from '@/components/ui/Modal';
import { buttonHover, glowPulse, glowPulseRed } from '@/lib/animations';
import { Swords, Shield, Landmark, Trophy, Skull, ArrowLeft, BarChart3, ChevronDown, ChevronUp, Zap, Settings } from 'lucide-react';
import { Button as ShadcnButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BellCurve } from '@/components/ui/BellCurve';
import { BattleParticles, ClashWave, Explosion } from '@/components/battle';
import { StaggeredDamage } from '@/components/battle';
import { simulateBattle } from '@/core/math/monteCarlo';
import { createBattleAnimator, getAdjustedDuration, type BattlePhase } from '@/lib/battleAnimations';
import type { BattleSimulationResult } from '@/core/types/probability';
import { gameToast } from '@/lib/toast';

export function BattleScreen() {
    const {
        battle, resolveBattleAction, setStage, territories,
        troops, morale, supplies, founder, technologies,
        battleSpeed, setBattleSpeed
    } = useGameStore();

    const [showForecast, setShowForecast] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    // Animation state
    const [animationPhase, setAnimationPhase] = useState<BattlePhase>('idle');
    const [isAnimating, setIsAnimating] = useState(false);
    const [showExplosion, setShowExplosion] = useState(false);
    const [showClashWave, setShowClashWave] = useState(false);

    // Create animator based on speed
    const animator = useMemo(() => createBattleAnimator(battleSpeed), [battleSpeed]);

    // Run Monte Carlo simulation for battle forecast
    const forecast = useMemo<BattleSimulationResult | null>(() => {
        if (!battle || !battle.active) return null;

        const attackBonus = founder?.modifiers.attackBonus || 0;

        const techMultipliers: number[] = [];
        const legionTech = technologies.find(t => t.id === 'legion_discipline' && t.researched);
        const forgeTech = technologies.find(t => t.id === 'military_forge' && t.researched);
        if (legionTech) techMultipliers.push(1.2);
        if (forgeTech) techMultipliers.push(1.1);

        return simulateBattle({
            playerTroops: troops,
            playerMorale: morale,
            playerSupplies: supplies,
            attackBonus,
            techMultipliers,
            enemyStrength: battle.enemyStrength,
            weatherVariance: 0.1,
        });
    }, [battle, troops, morale, supplies, founder, technologies]);

    // Handle battle attack with animations
    const handleAttack = useCallback(() => {
        if (animator.skipAnimations) {
            // Instant mode - just resolve
            resolveBattleAction();
            return;
        }

        setIsAnimating(true);
        setAnimationPhase('approach');

        // Phase 1: Approach
        setTimeout(() => {
            setAnimationPhase('clash');
            setShowClashWave(true);
            setTimeout(() => setShowClashWave(false), 300);
        }, getAdjustedDuration(500, battleSpeed));

        // Phase 2: Clash
        setTimeout(() => {
            setAnimationPhase('exchange');
            setShowExplosion(true);
            setTimeout(() => setShowExplosion(false), 500);
        }, getAdjustedDuration(800, battleSpeed));

        // Phase 3: Exchange (damage numbers)
        setTimeout(() => {
            setAnimationPhase('resolve');
        }, getAdjustedDuration(1800, battleSpeed));

        // Phase 4: Resolve battle
        setTimeout(() => {
            resolveBattleAction();
            setAnimationPhase('celebration');
        }, getAdjustedDuration(2300, battleSpeed));

        // Complete
        setTimeout(() => {
            setIsAnimating(false);
            setAnimationPhase('complete');
        }, getAdjustedDuration(3800, battleSpeed));

    }, [animator.skipAnimations, battleSpeed, resolveBattleAction]);

    // Reset animation state when battle changes
    useEffect(() => {
        if (!battle?.active) {
            setAnimationPhase(battle?.result ? 'celebration' : 'idle');
            setIsAnimating(false);
        }
    }, [battle?.active, battle?.result]);

    // Track if we've shown toast for this battle result
    const toastShownRef = useRef<string | null>(null);

    // Show toast on battle result
    useEffect(() => {
        if (battle?.result && battle.targetTerritory && toastShownRef.current !== battle.targetTerritory) {
            const territory = territories.find(t => t.id === battle.targetTerritory);
            const territoryName = territory?.name || 'territory';

            if (battle.result === 'victory') {
                gameToast.victory('Victory!', `${territoryName} has been conquered!`);
            } else {
                gameToast.defeat('Defeat', `The assault on ${territoryName} has failed`);
            }
            toastShownRef.current = battle.targetTerritory;
        }
    }, [battle?.result, battle?.targetTerritory, territories]);

    if (!battle) return null;

    const targetTerritory = battle.targetTerritory
        ? territories.find(t => t.id === battle.targetTerritory)
        : null;

    const oddsPercent = Math.round(battle.odds * 100);
    const isHighOdds = oddsPercent >= 60;
    const isLowOdds = oddsPercent <= 40;

    const riskColors: Record<string, string> = {
        safe: 'bg-green-500/20 text-green-400 border-green-500/30',
        favorable: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        risky: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        dangerous: 'bg-red-500/20 text-red-400 border-red-500/30',
        suicidal: 'bg-red-700/30 text-red-500 border-red-700/50',
    };

    const speedLabels = {
        normal: 'Normal',
        fast: 'Fast',
        instant: 'Instant',
    };

    return (
        <GoldModal
            isOpen={!!battle}
            onClose={() => !isAnimating && setStage('game')}
            size="lg"
            closeOnBackdrop={!battle.active && !isAnimating}
            closeOnEscape={!battle.active && !isAnimating}
        >
            {/* Battle Particles */}
            <BattleParticles
                isActive={['clash', 'exchange'].includes(animationPhase)}
                type={animationPhase === 'celebration'
                    ? (battle.result === 'victory' ? 'victory' : 'defeat')
                    : 'clash'
                }
                intensity={animationPhase === 'exchange' ? 'high' : 'medium'}
            />

            {/* Clash Wave Effect */}
            <ClashWave isActive={showClashWave} />

            {/* Explosion Effect */}
            <Explosion isActive={showExplosion} />

            {/* Title with Settings */}
            <div className="flex items-center justify-between mb-6">
                <div className="w-8" /> {/* Spacer */}
                <div className="flex items-center gap-3">
                    <Swords className="w-8 h-8 text-roman-red" />
                    <h2 className="text-3xl font-bold text-roman-gold">BATTLE</h2>
                    <Swords className="w-8 h-8 text-roman-red transform scale-x-[-1]" />
                </div>
                <ShadcnButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn("rounded-lg hover:bg-white/5", showSettings && "bg-white/10")}
                    title="Battle Settings"
                >
                    <Settings className="w-5 h-5 text-amber-400/60" />
                </ShadcnButton>
            </div>

            {/* Speed Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-4"
                    >
                        <div className="bg-black/30 rounded-lg p-3 border border-amber-400/20">
                            <div className="text-xs text-amber-400/70 mb-2">Battle Speed</div>
                            <div className="flex gap-2">
                                {(['normal', 'fast', 'instant'] as const).map((speed) => (
                                    <button
                                        key={speed}
                                        onClick={() => setBattleSpeed(speed)}
                                        className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                                            battleSpeed === speed
                                                ? 'bg-amber-400/20 text-amber-400 border border-amber-400/50'
                                                : 'bg-black/20 text-gray-400 border border-transparent hover:bg-black/30'
                                        }`}
                                    >
                                        {speedLabels[speed]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Target Territory */}
            {targetTerritory && (
                <div className="text-center mb-6 text-muted">
                    Attacking <span className="text-roman-gold font-bold">{targetTerritory.name}</span>
                </div>
            )}

            {/* Forces Comparison with Animation */}
            <div className="grid grid-cols-2 gap-6 mb-6 relative">
                {/* Damage Numbers during exchange */}
                {animationPhase === 'exchange' && battle.active && (
                    <>
                        <StaggeredDamage
                            totalDamage={forecast?.casualties.p50 || 10}
                            type="damage"
                            side="left"
                            isActive={true}
                        />
                        <StaggeredDamage
                            totalDamage={forecast?.enemyCasualties.p50 || 15}
                            type="damage"
                            side="right"
                            isActive={true}
                        />
                    </>
                )}

                {/* Rome */}
                <motion.div
                    className="text-center p-4 rounded-2xl bg-green-500/10 border border-green-500/30"
                    variants={glowPulse}
                    animate={animationPhase === 'clash' ? 'animate' : undefined}
                    style={animationPhase === 'clash' ? {
                        animation: 'shake 0.3s ease-in-out',
                    } : undefined}
                >
                    <motion.div
                        className="inline-flex p-3 rounded-xl bg-green-500/20 mb-3"
                        animate={animationPhase === 'approach' ? {
                            x: [0, 20, 0],
                            transition: { duration: 0.5 }
                        } : undefined}
                    >
                        <Landmark className="w-8 h-8 text-green-400" />
                    </motion.div>
                    <div className="text-lg font-bold text-green-400">Rome</div>
                    <div className="text-4xl font-black text-green-400 mt-2">
                        {battle.playerStrength}
                    </div>
                    <div className="text-xs text-muted mt-1">Strength</div>
                </motion.div>

                {/* Enemy */}
                <motion.div
                    className="text-center p-4 rounded-2xl bg-roman-red/10 border border-roman-red/30"
                    variants={glowPulseRed}
                    animate={animationPhase === 'clash' ? 'animate' : undefined}
                >
                    <motion.div
                        className="inline-flex p-3 rounded-xl bg-roman-red/20 mb-3"
                        animate={animationPhase === 'approach' ? {
                            x: [0, -20, 0],
                            transition: { duration: 0.5 }
                        } : undefined}
                    >
                        <Shield className="w-8 h-8 text-roman-red" />
                    </motion.div>
                    <div className="text-lg font-bold text-roman-red">Enemy</div>
                    <div className="text-4xl font-black text-roman-red mt-2">
                        {battle.enemyStrength}
                    </div>
                    <div className="text-xs text-muted mt-1">Strength</div>
                </motion.div>
            </div>

            {/* Victory Odds */}
            <div className="text-center mb-4">
                <div className="text-muted mb-2">Victory Chance</div>
                <div className={`text-5xl font-black ${
                    isHighOdds ? 'text-green-400' : isLowOdds ? 'text-roman-red' : 'text-roman-gold'
                }`}>
                    {forecast ? Math.round(forecast.winProbability * 100) : oddsPercent}%
                </div>

                <div className="mt-4 h-3 bg-bg rounded-full overflow-hidden max-w-xs mx-auto">
                    <motion.div
                        className={`h-full ${
                            isHighOdds
                                ? 'bg-gradient-to-r from-green-500 to-green-400'
                                : isLowOdds
                                ? 'bg-gradient-to-r from-roman-red-dark to-roman-red'
                                : 'bg-gradient-to-r from-roman-gold to-roman-gold-bright'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${forecast ? forecast.winProbability * 100 : oddsPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>

                {forecast && battle.active && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`inline-flex items-center gap-2 px-3 py-1 mt-3 rounded-full border text-sm font-medium ${riskColors[forecast.riskLevel]}`}
                    >
                        <Zap className="w-4 h-4" />
                        {forecast.riskLevel.charAt(0).toUpperCase() + forecast.riskLevel.slice(1)}
                    </motion.div>
                )}
            </div>

            {/* Monte Carlo Forecast Panel */}
            {forecast && battle.active && !isAnimating && (
                <div className="mb-6">
                    <button
                        onClick={() => setShowForecast(!showForecast)}
                        className="w-full flex items-center justify-between px-4 py-2 bg-black/30 rounded-lg border border-amber-400/20 hover:border-amber-400/40 transition-colors"
                    >
                        <span className="flex items-center gap-2 text-sm text-amber-400/80">
                            <BarChart3 className="w-4 h-4" />
                            Battle Forecast (Monte Carlo)
                        </span>
                        {showForecast ? (
                            <ChevronUp className="w-4 h-4 text-amber-400/60" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-amber-400/60" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showForecast && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                        <div className="bg-black/20 rounded-lg p-2 md:p-3 border border-red-500/20">
                                            <div className="text-xs text-red-400/70 mb-2 flex items-center gap-1">
                                                <Skull className="w-3 h-3" />
                                                Your Casualties
                                            </div>
                                            <BellCurve
                                                distribution={forecast.casualties}
                                                colorScheme="crimson"
                                                height={70}
                                                showPercentiles={false}
                                                showMean={true}
                                                compact={true}
                                            />
                                        </div>

                                        <div className="bg-black/20 rounded-lg p-2 md:p-3 border border-green-500/20">
                                            <div className="text-xs text-green-400/70 mb-2 flex items-center gap-1">
                                                <Shield className="w-3 h-3" />
                                                Enemy Casualties
                                            </div>
                                            <BellCurve
                                                distribution={forecast.enemyCasualties}
                                                colorScheme="green"
                                                height={70}
                                                showPercentiles={false}
                                                showMean={true}
                                                compact={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-black/20 rounded-lg p-3 border border-amber-400/20">
                                        <div className="text-xs text-amber-400/70 mb-1">Tactical Assessment</div>
                                        <p className="text-sm text-gray-300">{forecast.recommendation}</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-black/20 rounded p-2">
                                            <div className="text-xs text-gray-500">Best Case</div>
                                            <div className="text-sm text-green-400 font-bold">
                                                -{forecast.casualties.p10} troops
                                            </div>
                                        </div>
                                        <div className="bg-black/20 rounded p-2">
                                            <div className="text-xs text-gray-500">Expected</div>
                                            <div className="text-sm text-amber-400 font-bold">
                                                -{forecast.casualties.p50} troops
                                            </div>
                                        </div>
                                        <div className="bg-black/20 rounded p-2">
                                            <div className="text-xs text-gray-500">Worst Case</div>
                                            <div className="text-sm text-red-400 font-bold">
                                                -{forecast.casualties.p90} troops
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* Actions or Result */}
            {battle.active ? (
                <div className="flex gap-4">
                    <motion.button
                        className="flex-1 py-4 px-6 rounded-xl font-bold text-lg bg-gradient-to-r from-roman-red-dark to-roman-red text-white border-2 border-roman-red shadow-btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                        onClick={handleAttack}
                        disabled={isAnimating}
                        {...buttonHover}
                    >
                        <Swords className="w-5 h-5" />
                        {isAnimating ? 'Fighting...' : 'Attack!'}
                    </motion.button>

                    <motion.button
                        className="flex-1 py-4 px-6 rounded-xl font-bold text-lg bg-roman-gold/10 text-roman-gold border-2 border-roman-gold/50 hover:bg-roman-gold/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        onClick={() => setStage('game')}
                        disabled={isAnimating}
                        {...buttonHover}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Retreat
                    </motion.button>
                </div>
            ) : (
                <div className="text-center relative">
                    {/* Victory/Defeat Particles */}
                    <BattleParticles
                        isActive={animationPhase === 'celebration'}
                        type={battle.result === 'victory' ? 'victory' : 'defeat'}
                        intensity="high"
                    />

                    {/* Result */}
                    <motion.div
                        className={`text-4xl font-black mb-4 flex items-center justify-center gap-3 ${
                            battle.result === 'victory' ? 'text-green-400' : 'text-roman-red'
                        }`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                        {battle.result === 'victory' ? (
                            <>
                                <Trophy className="w-10 h-10" />
                                VICTORY!
                                <Trophy className="w-10 h-10" />
                            </>
                        ) : (
                            <>
                                <Skull className="w-10 h-10" />
                                DEFEAT
                                <Skull className="w-10 h-10" />
                            </>
                        )}
                    </motion.div>

                    {/* Casualties */}
                    <div className="text-muted mb-6 space-y-1">
                        <div>
                            Your casualties: <span className="text-roman-red font-bold">{battle.casualties.player}</span> troops
                        </div>
                        <div>
                            Enemy casualties: <span className="text-green-400 font-bold">{battle.casualties.enemy}</span> troops
                        </div>
                    </div>

                    {/* Continue Button */}
                    <motion.button
                        className="py-4 px-8 rounded-xl font-bold text-lg bg-roman-gold/20 text-roman-gold border-2 border-roman-gold/50 hover:bg-roman-gold/30"
                        onClick={() => setStage('game')}
                        {...buttonHover}
                    >
                        Continue
                    </motion.button>
                </div>
            )}
        </GoldModal>
    );
}
