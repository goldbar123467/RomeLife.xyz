// ============================================
// ROME EMPIRE BUILDER - Monte Carlo Simulation Engine
// ============================================

import type {
  ProbabilityDistribution,
  SimulationInput,
  BattleSimulationInput,
  BattleSimulationResult,
  CaravanSimulationInput,
  CaravanSimulationResult,
  BellCurveDataPoint,
} from '../types/probability';

// === GAUSSIAN RANDOM NUMBER GENERATION ===

/**
 * Generate a random number from a Gaussian (normal) distribution
 * using the Box-Muller transform
 */
export function gaussianRandom(mean: number = 0, stdDev: number = 1): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Generate a bounded Gaussian random number
 * Clamps the result between min and max
 */
export function boundedGaussian(
  mean: number,
  stdDev: number,
  min: number,
  max: number
): number {
  const value = gaussianRandom(mean, stdDev);
  return Math.max(min, Math.min(max, value));
}

// === CORE SIMULATION ===

/**
 * Run a Monte Carlo simulation and return probability distribution
 */
export function runSimulation(input: SimulationInput): ProbabilityDistribution {
  const { baseValue, variance, modifiers = [], iterations = 1000 } = input;
  const samples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    // Start with base value and apply Gaussian noise
    let value = gaussianRandom(baseValue, baseValue * variance);

    // Apply modifiers
    for (const mod of modifiers) {
      const modValue = mod.variance
        ? gaussianRandom(mod.value, mod.value * mod.variance)
        : mod.value;

      if (mod.type === 'additive') {
        value += modValue;
      } else {
        value *= modValue;
      }
    }

    samples.push(value);
  }

  return calculateDistribution(samples);
}

/**
 * Calculate distribution statistics from samples
 */
export function calculateDistribution(samples: number[]): ProbabilityDistribution {
  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;

  // Percentiles
  const p10 = sorted[Math.floor(n * 0.10)];
  const p25 = sorted[Math.floor(n * 0.25)];
  const p50 = sorted[Math.floor(n * 0.50)];
  const p75 = sorted[Math.floor(n * 0.75)];
  const p90 = sorted[Math.floor(n * 0.90)];

  // Mean
  const mean = sorted.reduce((a, b) => a + b, 0) / n;

  // Standard deviation
  const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  return {
    p10: Math.round(p10 * 100) / 100,
    p25: Math.round(p25 * 100) / 100,
    p50: Math.round(p50 * 100) / 100,
    p75: Math.round(p75 * 100) / 100,
    p90: Math.round(p90 * 100) / 100,
    mean: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    min: Math.round(sorted[0] * 100) / 100,
    max: Math.round(sorted[n - 1] * 100) / 100,
    samples: sorted, // Keep samples for bell curve visualization
  };
}

// === BATTLE SIMULATION ===

/**
 * Simulate a battle using Monte Carlo methods
 * Returns probability distribution of outcomes
 */
export function simulateBattle(input: BattleSimulationInput): BattleSimulationResult {
  const {
    playerTroops,
    playerMorale,
    playerSupplies,
    attackBonus,
    techMultipliers,
    enemyStrength,
    terrainModifier = 1,
    weatherVariance = 0.1,
    godFavorBonus = 0,
  } = input;

  const iterations = 1000;
  const winSamples: number[] = [];
  const casualtySamples: number[] = [];
  const enemyCasualtySamples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    // Calculate player strength with variance
    let playerStrength = playerTroops * (playerMorale / 100);

    // Supply bonus with variance
    if (playerSupplies > 100) {
      const supplyBonus = gaussianRandom(
        1 + ((playerSupplies - 100) / 500),
        0.05
      );
      playerStrength *= Math.max(1, supplyBonus);
    }

    // Attack bonus with variance
    playerStrength *= gaussianRandom(1 + attackBonus, 0.05);

    // Tech multipliers
    const techMult = techMultipliers.reduce((a, b) => a * b, 1);
    playerStrength *= Math.min(2.0, techMult); // Cap at 2x

    // God favor bonus
    playerStrength *= 1 + godFavorBonus;

    // Weather variance (0.9-1.1 with Gaussian distribution)
    playerStrength *= boundedGaussian(1, weatherVariance, 0.85, 1.15);

    // Terrain modifier with variance
    playerStrength *= boundedGaussian(terrainModifier, 0.05, 0.8, 1.2);

    // Enemy strength with variance (enemies have 10% variance)
    const variedEnemyStrength = gaussianRandom(enemyStrength, enemyStrength * 0.1);

    // Calculate odds
    const odds = playerStrength / (playerStrength + variedEnemyStrength);

    // Simulate battle outcome
    const roll = Math.random();
    const victory = roll < odds ? 1 : 0;
    winSamples.push(victory);

    // Calculate casualties
    const battleIntensity = boundedGaussian(0.2, 0.05, 0.1, 0.35);

    if (victory) {
      // Victory: lower casualties
      const playerCasualties = Math.floor(
        playerTroops * battleIntensity * (1 - odds) * boundedGaussian(1, 0.2, 0.7, 1.3)
      );
      const enemyCasualties = Math.floor(
        (variedEnemyStrength / 10) * (0.6 + battleIntensity) * boundedGaussian(1, 0.15, 0.8, 1.2)
      );
      casualtySamples.push(Math.max(0, playerCasualties));
      enemyCasualtySamples.push(Math.max(0, enemyCasualties));
    } else {
      // Defeat: higher casualties
      const playerCasualties = Math.floor(
        playerTroops * (0.3 + battleIntensity * 2) * boundedGaussian(1, 0.2, 0.8, 1.4)
      );
      const enemyCasualties = Math.floor(
        (variedEnemyStrength / 10) * battleIntensity * boundedGaussian(1, 0.2, 0.6, 1.2)
      );
      casualtySamples.push(Math.max(0, playerCasualties));
      enemyCasualtySamples.push(Math.max(0, enemyCasualties));
    }
  }

  // Calculate win probability
  const winProbability = winSamples.reduce((a, b) => a + b, 0) / iterations;

  // Calculate casualty distributions
  const casualties = calculateDistribution(casualtySamples);
  const enemyCasualties = calculateDistribution(enemyCasualtySamples);

  // Determine risk level
  let riskLevel: BattleSimulationResult['riskLevel'];
  if (winProbability >= 0.8) {
    riskLevel = 'safe';
  } else if (winProbability >= 0.6) {
    riskLevel = 'favorable';
  } else if (winProbability >= 0.4) {
    riskLevel = 'risky';
  } else if (winProbability >= 0.2) {
    riskLevel = 'dangerous';
  } else {
    riskLevel = 'suicidal';
  }

  // Generate recommendation
  let recommendation: string;
  if (riskLevel === 'safe') {
    recommendation = 'Victory is highly likely. Proceed with confidence.';
  } else if (riskLevel === 'favorable') {
    recommendation = 'Good odds of success. Consider your casualties tolerance.';
  } else if (riskLevel === 'risky') {
    recommendation = 'Uncertain outcome. Reinforce or consider retreat.';
  } else if (riskLevel === 'dangerous') {
    recommendation = 'High risk of defeat. Strongly consider alternatives.';
  } else {
    recommendation = 'Near-certain defeat. Retreat is advised.';
  }

  return {
    winProbability: Math.round(winProbability * 1000) / 1000,
    casualties,
    enemyCasualties,
    riskLevel,
    recommendation,
  };
}

// === CARAVAN SIMULATION ===

/**
 * Simulate a caravan journey using Monte Carlo methods
 */
export function simulateCaravan(input: CaravanSimulationInput): CaravanSimulationResult {
  const {
    distance,
    baseRisk,
    guardLevel,
    wagonLevel,
    reputation,
    forts,
    hasRoadsTech,
    goodsValue,
    cityBias = 1,
  } = input;

  const iterations = 1000;
  const successSamples: number[] = [];
  const profitSamples: number[] = [];
  const lossSamples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    // Calculate risk with variance
    let risk = baseRisk + (distance / 100);

    // Guard reduction (-10% per level, with variance)
    risk -= guardLevel * boundedGaussian(0.10, 0.02, 0.08, 0.12);

    // Fort bonus (-2% per fort)
    risk -= forts * 0.02;

    // Roads tech bonus
    if (hasRoadsTech) {
      risk -= boundedGaussian(0.15, 0.02, 0.12, 0.18);
    }

    // Reputation bonus (max -20%)
    risk -= (reputation / 500) * boundedGaussian(1, 0.1, 0.8, 1.2);

    // Random events (bandits, weather, etc.)
    risk += boundedGaussian(0, 0.05, -0.1, 0.15);

    // Clamp risk
    risk = Math.max(0.01, Math.min(0.5, risk));

    // Simulate journey outcome
    const roll = Math.random();
    const success = roll > risk ? 1 : 0;
    successSamples.push(success);

    if (success) {
      // Calculate profit with variance
      const baseProfit = goodsValue * cityBias;
      const wagonBonus = 1 + (wagonLevel * 0.15); // +15% per wagon level
      const profit = baseProfit * wagonBonus * boundedGaussian(1, 0.1, 0.85, 1.2);
      profitSamples.push(Math.round(profit));
      lossSamples.push(0);
    } else {
      // Calculate loss with variance
      const severity = boundedGaussian(0.5, 0.15, 0.3, 1);
      const loss = goodsValue * severity;
      profitSamples.push(0);
      lossSamples.push(Math.round(loss));
    }
  }

  // Calculate distributions
  const successRate = calculateDistribution(successSamples);
  const profit = calculateDistribution(profitSamples);
  const lossOnFailure = calculateDistribution(lossSamples.filter(l => l > 0));

  // Calculate expected value (risk-adjusted return)
  const avgSuccessRate = successSamples.reduce((a, b) => a + b, 0) / iterations;
  const avgProfit = profitSamples.reduce((a, b) => a + b, 0) / iterations;
  const avgLoss = lossSamples.reduce((a, b) => a + b, 0) / iterations;
  const expectedValue = avgProfit - avgLoss;

  // Determine risk level
  let riskLevel: CaravanSimulationResult['riskLevel'];
  if (avgSuccessRate >= 0.9) {
    riskLevel = 'safe';
  } else if (avgSuccessRate >= 0.75) {
    riskLevel = 'moderate';
  } else if (avgSuccessRate >= 0.5) {
    riskLevel = 'risky';
  } else {
    riskLevel = 'dangerous';
  }

  return {
    successRate,
    profit,
    lossOnFailure,
    expectedValue: Math.round(expectedValue),
    riskLevel,
  };
}

// === BELL CURVE GENERATION ===

/**
 * Generate bell curve data points for visualization
 */
export function generateBellCurveData(
  distribution: ProbabilityDistribution,
  numPoints: number = 50
): BellCurveDataPoint[] {
  const { mean, stdDev, min, max } = distribution;
  const points: BellCurveDataPoint[] = [];

  // Extend range slightly beyond observed min/max for smoother curve
  const range = max - min;
  const start = min - range * 0.1;
  const end = max + range * 0.1;
  const step = (end - start) / numPoints;

  let cumulative = 0;

  for (let i = 0; i <= numPoints; i++) {
    const x = start + i * step;

    // Gaussian probability density function
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);

    // Approximate cumulative (simplified)
    cumulative += y * step;

    points.push({
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 10000) / 10000,
      cumulative: Math.min(1, Math.round(cumulative * 1000) / 1000),
    });
  }

  return points;
}

/**
 * Generate histogram data from samples
 */
export function generateHistogramData(
  samples: number[],
  numBins: number = 20
): { bin: number; count: number; percentage: number }[] {
  if (samples.length === 0) return [];

  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const range = max - min || 1;
  const binWidth = range / numBins;

  const bins: number[] = new Array(numBins).fill(0);

  for (const sample of samples) {
    const binIndex = Math.min(numBins - 1, Math.floor((sample - min) / binWidth));
    bins[binIndex]++;
  }

  return bins.map((count, i) => ({
    bin: Math.round((min + (i + 0.5) * binWidth) * 100) / 100,
    count,
    percentage: Math.round((count / samples.length) * 1000) / 10,
  }));
}

// === UTILITY FUNCTIONS ===

/**
 * Format a probability distribution for display
 */
export function formatDistribution(dist: ProbabilityDistribution, unit: string = ''): string {
  return `${dist.p10}${unit} - ${dist.p90}${unit} (expected: ${dist.p50}${unit})`;
}

/**
 * Get a human-readable summary of a distribution
 */
export function getDistributionSummary(dist: ProbabilityDistribution): {
  best: number;
  worst: number;
  expected: number;
  volatility: 'low' | 'medium' | 'high';
} {
  const range = dist.p90 - dist.p10;
  const relativeRange = dist.mean !== 0 ? range / Math.abs(dist.mean) : 0;

  let volatility: 'low' | 'medium' | 'high';
  if (relativeRange < 0.3) {
    volatility = 'low';
  } else if (relativeRange < 0.6) {
    volatility = 'medium';
  } else {
    volatility = 'high';
  }

  return {
    best: dist.p90,
    worst: dist.p10,
    expected: dist.p50,
    volatility,
  };
}

/**
 * Combine multiple independent distributions
 */
export function combineDistributions(
  distributions: ProbabilityDistribution[]
): ProbabilityDistribution {
  if (distributions.length === 0) {
    return {
      p10: 0, p25: 0, p50: 0, p75: 0, p90: 0,
      mean: 0, stdDev: 0, min: 0, max: 0,
    };
  }

  // For independent variables, variances add
  const combinedMean = distributions.reduce((sum, d) => sum + d.mean, 0);
  const combinedVariance = distributions.reduce((sum, d) => sum + d.stdDev * d.stdDev, 0);
  const combinedStdDev = Math.sqrt(combinedVariance);

  // Approximate percentiles using normal distribution properties
  return {
    p10: Math.round((combinedMean - 1.28 * combinedStdDev) * 100) / 100,
    p25: Math.round((combinedMean - 0.67 * combinedStdDev) * 100) / 100,
    p50: Math.round(combinedMean * 100) / 100,
    p75: Math.round((combinedMean + 0.67 * combinedStdDev) * 100) / 100,
    p90: Math.round((combinedMean + 1.28 * combinedStdDev) * 100) / 100,
    mean: Math.round(combinedMean * 100) / 100,
    stdDev: Math.round(combinedStdDev * 100) / 100,
    min: distributions.reduce((sum, d) => sum + d.min, 0),
    max: distributions.reduce((sum, d) => sum + d.max, 0),
  };
}
