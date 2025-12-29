'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { GlassCard, SectionHeader, StatDisplay, GameImage } from '@/components/ui';
import { calculateIncome, calculateUpkeep, calculateFoodConsumption } from '@/core/math';
import { SEASON_MODIFIERS, GAME_CONSTANTS } from '@/core/constants';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, CartesianGrid, Legend
} from 'recharts';
import { CHART_COLORS, tooltipStyle, gridStyle, axisStyle } from '@/components/ui/charts/theme';
import { Coins, TrendingUp, TrendingDown } from 'lucide-react';

export function EconomyPanel() {
    const state = useGameStore();
    const { denarii, taxRate, inflation, setTaxRate } = state;

    const seasonMod = SEASON_MODIFIERS[state.season];
    const income = calculateIncome(state);
    const upkeep = calculateUpkeep(state, seasonMod);
    const foodCost = calculateFoodConsumption(state, seasonMod);
    const netIncome = income - upkeep;

    // Tax rate slider
    const handleTaxChange = (newRate: number) => {
        setTaxRate(newRate);
    };

    // Calculate happiness penalty from high taxes
    const taxPenalty = taxRate > 0.20 ? Math.floor((taxRate - 0.20) * 50) : 0;

    // Tax efficiency (diminishing returns above 20%)
    const taxEfficiency = taxRate > 0.20
        ? (1 / (1 + (taxRate - 0.20) * 5)) * 100
        : 100;

    const taxPresets = [
        { rate: 0.05, name: 'Minimal', desc: 'Happy citizens, low revenue' },
        { rate: 0.10, name: 'Low', desc: 'Balanced approach' },
        { rate: 0.15, name: 'Standard', desc: 'Normal taxation' },
        { rate: 0.20, name: 'High', desc: 'Maximum efficient rate' },
        { rate: 0.30, name: 'Oppressive', desc: 'Unhappy citizens!' },
    ];

    return (
        <div className="p-6 space-y-6 fade-in">
            <SectionHeader
                title="Economy"
                subtitle="Manage taxation, income, and expenditures"
                icon={<Coins className="w-6 h-6 text-roman-gold" />}
            />

            {/* Treasury Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassCard variant="gold" className="p-4 text-center">
                    <div className="text-3xl font-black text-roman-gold">{denarii.toLocaleString()}</div>
                    <div className="text-sm text-muted">Treasury</div>
                </GlassCard>

                <GlassCard className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">+{income}</div>
                    <div className="text-sm text-muted">Income/Season</div>
                </GlassCard>

                <GlassCard className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">-{upkeep}</div>
                    <div className="text-sm text-muted">Upkeep/Season</div>
                </GlassCard>

                <GlassCard className="p-4 text-center">
                    <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {netIncome >= 0 ? '+' : ''}{netIncome}
                    </div>
                    <div className="text-sm text-muted">Net/Season</div>
                </GlassCard>
            </div>

            {/* Treasury History Chart */}
            {state.treasuryHistory && state.treasuryHistory.length > 1 && (
                <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-roman-gold" />
                        <h3 className="text-lg font-bold text-roman-gold">Treasury History</h3>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={state.treasuryHistory}>
                                <defs>
                                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={CHART_COLORS.gold} stopOpacity={0.4} />
                                        <stop offset="100%" stopColor={CHART_COLORS.gold} stopOpacity={0.05} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid {...gridStyle} />
                                <XAxis
                                    dataKey="round"
                                    tick={{ fill: axisStyle.tick.fill, fontSize: axisStyle.tick.fontSize }}
                                    axisLine={{ stroke: axisStyle.axisLine.stroke }}
                                    tickFormatter={(value) => `R${value}`}
                                />
                                <YAxis
                                    tick={{ fill: axisStyle.tick.fill, fontSize: axisStyle.tick.fontSize }}
                                    axisLine={{ stroke: axisStyle.axisLine.stroke }}
                                    tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                                />
                                <Tooltip
                                    {...tooltipStyle}
                                    formatter={(value) => [`${Number(value).toLocaleString()} denarii`, 'Treasury']}
                                    labelFormatter={(label) => `Round ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="denarii"
                                    stroke={CHART_COLORS.gold}
                                    fill="url(#goldGradient)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            )}

            {/* Income vs Upkeep Chart */}
            {state.treasuryHistory && state.treasuryHistory.length > 1 && (
                <GlassCard className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="w-5 h-5 text-roman-gold" />
                        <h3 className="text-lg font-bold text-roman-gold">Income vs Upkeep</h3>
                    </div>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={state.treasuryHistory.slice(-8)}>
                                <CartesianGrid {...gridStyle} />
                                <XAxis
                                    dataKey="round"
                                    tick={{ fill: axisStyle.tick.fill, fontSize: axisStyle.tick.fontSize }}
                                    axisLine={{ stroke: axisStyle.axisLine.stroke }}
                                    tickFormatter={(value) => `R${value}`}
                                />
                                <YAxis
                                    tick={{ fill: axisStyle.tick.fill, fontSize: axisStyle.tick.fontSize }}
                                    axisLine={{ stroke: axisStyle.axisLine.stroke }}
                                />
                                <Tooltip
                                    {...tooltipStyle}
                                    formatter={(value, name) => [
                                        `${Number(value).toLocaleString()}`,
                                        name === 'income' ? 'Income' : 'Upkeep'
                                    ]}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: '8px' }}
                                    formatter={(value) => <span style={{ color: CHART_COLORS.text }}>{value === 'income' ? 'Income' : 'Upkeep'}</span>}
                                />
                                <Bar dataKey="income" fill={CHART_COLORS.green} radius={[4, 4, 0, 0]} />
                                <Bar dataKey="upkeep" fill={CHART_COLORS.red} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>
            )}

            {/* Tax Rate Control */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-roman-gold mb-4">Taxation Policy</h3>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1">
                        <div className="flex justify-between mb-2">
                            <span className="text-muted">Tax Rate</span>
                            <span className="font-bold text-roman-gold">{Math.round(taxRate * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            value={taxRate * 100}
                            onChange={(e) => handleTaxChange(parseInt(e.target.value) / 100)}
                            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 
                         [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-roman-gold [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                        />
                        <div className="flex justify-between text-xs text-muted mt-1">
                            <span>0%</span>
                            <span className="text-yellow-400">20% (Optimal)</span>
                            <span>50%</span>
                        </div>
                    </div>
                </div>

                {/* Tax Presets */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {taxPresets.map(preset => (
                        <motion.button
                            key={preset.rate}
                            className={`px-3 py-2 rounded-xl text-sm transition-all ${Math.abs(taxRate - preset.rate) < 0.01
                                ? 'glass-gold border-roman-gold text-roman-gold'
                                : 'glass-dark hover:border-white/30'
                                }`}
                            onClick={() => handleTaxChange(preset.rate)}
                            whileTap={{ scale: 0.95 }}
                        >
                            {preset.name}
                        </motion.button>
                    ))}
                </div>

                {/* Tax Effects */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-dark rounded-xl p-3">
                        <div className="text-sm text-muted mb-1">Tax Efficiency</div>
                        <div className={`text-lg font-bold ${taxEfficiency === 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {taxEfficiency.toFixed(0)}%
                        </div>
                        {taxRate > 0.20 && (
                            <div className="text-xs text-red-400 mt-1">⚠️ Diminishing returns!</div>
                        )}
                    </div>

                    <div className="glass-dark rounded-xl p-3">
                        <div className="text-sm text-muted mb-1">Happiness Penalty</div>
                        <div className={`text-lg font-bold ${taxPenalty === 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {taxPenalty === 0 ? 'None' : `-${taxPenalty}`}
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Expenditure Breakdown */}
            <GlassCard className="p-6">
                <h3 className="text-xl font-bold text-roman-gold mb-4 flex items-center gap-2"><GameImage src="scroll" size="sm" alt="Breakdown" /> Expenditure Breakdown</h3>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Military Upkeep</span>
                        <span className="text-red-400">-{(state.troops * GAME_CONSTANTS.TROOP_UPKEEP).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Housing Maintenance</span>
                        <span className="text-red-400">-{(state.housing / GAME_CONSTANTS.HOUSING_UPKEEP_DIVISOR).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Fort Upkeep</span>
                        <span className="text-red-400">-{(state.forts * GAME_CONSTANTS.FORT_UPKEEP).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted flex items-center gap-1"><GameImage src="amphora" size="xs" alt="Sanitation" /> Sanitation</span>
                        <span className="text-red-400">-{(state.sanitation / GAME_CONSTANTS.SANITATION_UPKEEP_DIVISOR).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted">Buildings</span>
                        <span className="text-red-400">-{state.buildings.filter(b => b.built).reduce((sum, b) => sum + b.upkeep, 0)}</span>
                    </div>

                    <div className="border-t border-white/10 pt-3 mt-3">
                        <div className="flex justify-between items-center font-bold">
                            <span>Total Upkeep</span>
                            <span className="text-red-400">-{upkeep}</span>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* Economic Stats */}
            <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4">
                    <StatDisplay
                        label="Inflation"
                        value={`${inflation.toFixed(1)}%`}
                        icon={<GameImage src="coin-gold" size="xs" alt="Inflation" />}
                        trend={inflation > 5 ? 'down' : 'neutral'}
                    />
                </GlassCard>

                <GlassCard className="p-4">
                    <StatDisplay
                        label="Food Consumption"
                        value={`${foodCost}/season`}
                        icon={<GameImage src="grapes" size="xs" alt="Food" />}
                        trend={state.inventory.grain < foodCost ? 'down' : 'up'}
                    />
                </GlassCard>
            </div>
        </div>
    );
}
