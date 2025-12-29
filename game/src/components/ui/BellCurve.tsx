'use client';

// ============================================
// ROME EMPIRE BUILDER - Bell Curve Visualization
// Displays probability distributions from Monte Carlo
// ============================================

import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';
import type { ProbabilityDistribution, BellCurveProps } from '@/core/types/probability';
import { generateBellCurveData, generateHistogramData } from '@/core/math/monteCarlo';
import { CHART_COLORS, tooltipStyle, animationConfig } from './charts/theme';

// === COLOR SCHEMES ===

type ColorScheme = {
  primary: string;
  primaryDim: string;
  gradient: [string, string];
  percentile: string;
  mean: string;
};

export type ColorSchemeName = 'gold' | 'crimson' | 'neutral' | 'green';

const colorSchemes: Record<ColorSchemeName, ColorScheme> = {
  gold: {
    primary: CHART_COLORS.gold,
    primaryDim: CHART_COLORS.goldDim,
    gradient: ['rgba(240, 193, 75, 0.5)', 'rgba(240, 193, 75, 0.05)'],
    percentile: 'rgba(240, 193, 75, 0.3)',
    mean: CHART_COLORS.goldBright,
  },
  crimson: {
    primary: CHART_COLORS.red,
    primaryDim: CHART_COLORS.redDim,
    gradient: ['rgba(196, 30, 58, 0.5)', 'rgba(196, 30, 58, 0.05)'],
    percentile: 'rgba(196, 30, 58, 0.3)',
    mean: '#FF4444',
  },
  neutral: {
    primary: CHART_COLORS.text,
    primaryDim: CHART_COLORS.muted,
    gradient: ['rgba(229, 229, 229, 0.4)', 'rgba(229, 229, 229, 0.05)'],
    percentile: 'rgba(229, 229, 229, 0.2)',
    mean: '#FFFFFF',
  },
  green: {
    primary: CHART_COLORS.green,
    primaryDim: CHART_COLORS.greenDim,
    gradient: ['rgba(34, 197, 94, 0.5)', 'rgba(34, 197, 94, 0.05)'],
    percentile: 'rgba(34, 197, 94, 0.3)',
    mean: '#4ADE80',
  },
};

// === BELL CURVE COMPONENT ===

export function BellCurve({
  distribution,
  width = 300,
  height = 120,
  showPercentiles = true,
  showMean = true,
  colorScheme = 'gold',
  label,
  unit = '',
}: BellCurveProps & { colorScheme?: ColorSchemeName }) {
  const colors = colorSchemes[colorScheme];

  // Generate bell curve data points
  const data = useMemo(() => {
    return generateBellCurveData(distribution, 40);
  }, [distribution]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { x: number; y: number; cumulative: number } }> }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div style={tooltipStyle.contentStyle}>
          <p style={{ color: colors.primary, fontWeight: 600, marginBottom: 4 }}>
            Value: {point.x.toFixed(1)}{unit}
          </p>
          <p style={{ color: CHART_COLORS.text, fontSize: 12 }}>
            Probability: {(point.y * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      {label && (
        <div className="text-xs text-amber-400/70 mb-1 font-medium">{label}</div>
      )}

      <ResponsiveContainer width={width} height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id={`bellGradient-${colorScheme}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.gradient[0]} />
              <stop offset="100%" stopColor={colors.gradient[1]} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="x"
            tick={{ fill: CHART_COLORS.muted, fontSize: 10 }}
            axisLine={{ stroke: CHART_COLORS.line }}
            tickLine={false}
            tickFormatter={(v) => `${v}${unit}`}
          />

          <YAxis hide />

          <Tooltip content={<CustomTooltip />} />

          {/* Main bell curve area */}
          <Area
            type="monotone"
            dataKey="y"
            stroke={colors.primary}
            strokeWidth={2}
            fill={`url(#bellGradient-${colorScheme})`}
            animationDuration={animationConfig.animationDuration}
          />

          {/* Percentile markers */}
          {showPercentiles && (
            <>
              <ReferenceLine
                x={distribution.p10}
                stroke={colors.percentile}
                strokeDasharray="3 3"
                label={{ value: 'P10', fill: CHART_COLORS.muted, fontSize: 9, position: 'top' }}
              />
              <ReferenceLine
                x={distribution.p90}
                stroke={colors.percentile}
                strokeDasharray="3 3"
                label={{ value: 'P90', fill: CHART_COLORS.muted, fontSize: 9, position: 'top' }}
              />
            </>
          )}

          {/* Mean marker */}
          {showMean && (
            <ReferenceLine
              x={distribution.mean}
              stroke={colors.mean}
              strokeWidth={2}
              label={{ value: 'Expected', fill: colors.primary, fontSize: 10, position: 'top' }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>

      {/* Stats summary below chart */}
      <div className="flex justify-between text-xs mt-1 px-1">
        <span className="text-red-400/70">
          Worst: {distribution.p10.toFixed(0)}{unit}
        </span>
        <span className="text-amber-400 font-medium">
          Expected: {distribution.p50.toFixed(0)}{unit}
        </span>
        <span className="text-green-400/70">
          Best: {distribution.p90.toFixed(0)}{unit}
        </span>
      </div>
    </motion.div>
  );
}

// === MINI DISTRIBUTION BAR ===

interface DistributionBarProps {
  distribution: ProbabilityDistribution;
  colorScheme?: ColorSchemeName;
  showLabels?: boolean;
  height?: number;
}

export function DistributionBar({
  distribution,
  colorScheme = 'gold',
  showLabels = true,
  height = 24,
}: DistributionBarProps) {
  const colors = colorSchemes[colorScheme];
  const { p10, p50, p90, min, max } = distribution;

  // Calculate positions as percentages
  const range = max - min || 1;
  const p10Pos = ((p10 - min) / range) * 100;
  const p50Pos = ((p50 - min) / range) * 100;
  const p90Pos = ((p90 - min) / range) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ duration: 0.4 }}
      className="relative"
      style={{ height }}
    >
      {/* Background track */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      />

      {/* P10-P90 range bar */}
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: `${p10Pos}%`,
          width: `${p90Pos - p10Pos}%`,
          height: '60%',
          backgroundColor: colors.primaryDim,
        }}
      />

      {/* P50 marker (expected) */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-1 rounded-full"
        style={{
          left: `${p50Pos}%`,
          height: '100%',
          backgroundColor: colors.primary,
          boxShadow: `0 0 8px ${colors.primary}`,
        }}
      />

      {/* Labels */}
      {showLabels && (
        <>
          <span
            className="absolute -bottom-4 text-[10px]"
            style={{ left: `${p10Pos}%`, transform: 'translateX(-50%)', color: CHART_COLORS.muted }}
          >
            {p10.toFixed(0)}
          </span>
          <span
            className="absolute -bottom-4 text-[10px] font-medium"
            style={{ left: `${p50Pos}%`, transform: 'translateX(-50%)', color: colors.primary }}
          >
            {p50.toFixed(0)}
          </span>
          <span
            className="absolute -bottom-4 text-[10px]"
            style={{ left: `${p90Pos}%`, transform: 'translateX(-50%)', color: CHART_COLORS.muted }}
          >
            {p90.toFixed(0)}
          </span>
        </>
      )}
    </motion.div>
  );
}

// === HISTOGRAM COMPONENT ===

interface HistogramProps {
  distribution: ProbabilityDistribution;
  width?: number;
  height?: number;
  colorScheme?: ColorSchemeName;
  bins?: number;
}

export function Histogram({
  distribution,
  width = 200,
  height = 80,
  colorScheme = 'gold',
  bins = 15,
}: HistogramProps) {
  const colors = colorSchemes[colorScheme];

  const data = useMemo(() => {
    if (!distribution.samples || distribution.samples.length === 0) {
      return [];
    }
    return generateHistogramData(distribution.samples, bins);
  }, [distribution, bins]);

  if (data.length === 0) {
    return <div className="text-xs text-gray-500">No sample data available</div>;
  }

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-end gap-px"
      style={{ width, height }}
    >
      {data.map((bin, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(bin.count / maxCount) * 100}%` }}
          transition={{ delay: i * 0.02, duration: 0.3 }}
          className="flex-1 rounded-t-sm"
          style={{
            backgroundColor: colors.primary,
            opacity: 0.3 + (bin.count / maxCount) * 0.7,
          }}
          title={`${bin.bin}: ${bin.percentage}%`}
        />
      ))}
    </motion.div>
  );
}

// === OUTCOME PREDICTOR CARD ===

interface OutcomePredictorProps {
  title: string;
  distribution: ProbabilityDistribution;
  unit?: string;
  colorScheme?: ColorSchemeName;
  riskLevel?: 'safe' | 'favorable' | 'risky' | 'dangerous' | 'suicidal' | 'moderate';
}

export function OutcomePredictor({
  title,
  distribution,
  unit = '',
  colorScheme = 'gold',
  riskLevel,
}: OutcomePredictorProps) {
  const riskColors: Record<string, string> = {
    safe: 'text-green-400 border-green-400/30',
    favorable: 'text-emerald-400 border-emerald-400/30',
    moderate: 'text-amber-400 border-amber-400/30',
    risky: 'text-orange-400 border-orange-400/30',
    dangerous: 'text-red-400 border-red-400/30',
    suicidal: 'text-red-600 border-red-600/30',
  };

  const riskLabels: Record<string, string> = {
    safe: 'Safe',
    favorable: 'Favorable',
    moderate: 'Moderate',
    risky: 'Risky',
    dangerous: 'Dangerous',
    suicidal: 'Suicidal',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/30 border border-amber-400/20 rounded-lg p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-amber-400/80 font-medium">{title}</span>
        {riskLevel && (
          <span className={`text-xs px-2 py-0.5 border rounded ${riskColors[riskLevel]}`}>
            {riskLabels[riskLevel]}
          </span>
        )}
      </div>

      <BellCurve
        distribution={distribution}
        colorScheme={colorScheme}
        unit={unit}
        height={100}
        showPercentiles={true}
        showMean={true}
      />
    </motion.div>
  );
}

// === COMPARISON VIEW ===

interface ComparisonProps {
  distributions: {
    label: string;
    distribution: ProbabilityDistribution;
    colorScheme?: ColorSchemeName;
  }[];
}

export function DistributionComparison({ distributions }: ComparisonProps) {
  return (
    <div className="space-y-4">
      {distributions.map(({ label, distribution, colorScheme = 'gold' }, i) => (
        <div key={i}>
          <div className="text-xs text-gray-400 mb-1">{label}</div>
          <DistributionBar distribution={distribution} colorScheme={colorScheme} />
          <div className="h-6" /> {/* Space for labels */}
        </div>
      ))}
    </div>
  );
}

export default BellCurve;
