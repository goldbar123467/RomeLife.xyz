// ============================================
// ROME EMPIRE BUILDER - Probability Types
// Monte Carlo Simulation & Forecasting System
// ============================================

import type { ResourceType } from './index';

// === PROBABILITY DISTRIBUTION ===

/**
 * Represents a probability distribution from Monte Carlo simulation
 * p10/p50/p90 are the 10th, 50th (median), and 90th percentiles
 */
export interface ProbabilityDistribution {
  p10: number;   // 10th percentile (pessimistic outcome)
  p25: number;   // 25th percentile
  p50: number;   // 50th percentile (median/expected)
  p75: number;   // 75th percentile
  p90: number;   // 90th percentile (optimistic outcome)
  mean: number;  // Average of all samples
  stdDev: number; // Standard deviation
  min: number;   // Minimum observed value
  max: number;   // Maximum observed value
  samples?: number[]; // Raw samples (optional, for visualization)
}

/**
 * Input parameters for a Monte Carlo simulation
 */
export interface SimulationInput {
  baseValue: number;      // Expected/base value
  variance: number;       // How much the result can vary (0-1 scale)
  modifiers?: Modifier[]; // Additional modifiers to apply
  iterations?: number;    // Number of simulation runs (default 1000)
}

/**
 * A modifier that affects simulation outcomes
 */
export interface Modifier {
  name: string;
  type: 'additive' | 'multiplicative';
  value: number;
  variance?: number;  // Variance in this modifier's effect
}

// === BATTLE SIMULATION ===

/**
 * Input for battle simulation
 */
export interface BattleSimulationInput {
  playerTroops: number;
  playerMorale: number;
  playerSupplies: number;
  attackBonus: number;
  techMultipliers: number[];
  enemyStrength: number;
  terrainModifier?: number;
  weatherVariance?: number;
  godFavorBonus?: number;
}

/**
 * Result of battle Monte Carlo simulation
 */
export interface BattleSimulationResult {
  winProbability: number;           // 0-1 chance of victory
  casualties: ProbabilityDistribution;  // Expected player casualties
  enemyCasualties: ProbabilityDistribution; // Expected enemy casualties
  riskLevel: 'safe' | 'favorable' | 'risky' | 'dangerous' | 'suicidal';
  recommendation: string;
}

// === CARAVAN/TRADE SIMULATION ===

/**
 * Input for caravan simulation
 */
export interface CaravanSimulationInput {
  distance: number;
  baseRisk: number;
  guardLevel: number;
  wagonLevel: number;
  reputation: number;
  forts: number;
  hasRoadsTech: boolean;
  goodsValue: number;
  cityBias?: number;  // Price bonus from city preference
}

/**
 * Result of caravan Monte Carlo simulation
 */
export interface CaravanSimulationResult {
  successRate: ProbabilityDistribution;   // Probability of safe arrival
  profit: ProbabilityDistribution;         // Expected profit in denarii
  lossOnFailure: ProbabilityDistribution;  // Amount lost if caravan fails
  expectedValue: number;                   // Risk-adjusted expected return
  riskLevel: 'safe' | 'moderate' | 'risky' | 'dangerous';
}

// === CAUSAL GRAPH TYPES ===

/**
 * Nodes in the causal economic graph
 */
export type CausalNode =
  | 'weather'        // Environmental conditions
  | 'rainfall'       // Precipitation affecting crops
  | 'cropYield'      // Agricultural output
  | 'foodStock'      // Available food supply
  | 'foodPrice'      // Market price of food
  | 'happiness'      // Population happiness
  | 'unrest'         // Civil unrest level
  | 'inflation'      // Economic inflation
  | 'tradeVolume'    // Amount of trade activity
  | 'militaryPower'  // Combined military strength
  | 'population'     // Population count
  | 'taxRevenue'     // Income from taxation
  | 'stability';     // Overall stability

/**
 * An edge in the causal graph representing cause-effect relationship
 */
export interface CausalEdge {
  source: CausalNode;
  target: CausalNode;
  coefficient: number;  // Strength of relationship (-1 to 1)
  delay?: number;       // Seasons before effect manifests
  description: string;  // Human-readable explanation
}

/**
 * Current values for all causal nodes
 */
export type CausalState = Record<CausalNode, number>;

/**
 * Forecast for a causal node
 */
export interface NodeForecast {
  node: CausalNode;
  current: number;
  predicted: ProbabilityDistribution;
  trend: 'rising' | 'stable' | 'falling';
  confidence: number;  // 0-1 confidence in prediction
  drivers: { node: CausalNode; impact: number }[];  // What's causing the change
}

/**
 * Complete season forecast
 */
export interface SeasonForecast {
  season: number;
  forecasts: NodeForecast[];
  warnings: ForecastWarning[];
  opportunities: ForecastOpportunity[];
}

/**
 * Warning about potential negative outcomes
 */
export interface ForecastWarning {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  node: CausalNode;
  probability: number;
  recommendation: string;
}

/**
 * Opportunity for positive outcomes
 */
export interface ForecastOpportunity {
  type: 'trade' | 'expansion' | 'growth' | 'military';
  message: string;
  probability: number;
  potentialGain: number;
  recommendation: string;
}

// === VISUALIZATION TYPES ===

/**
 * Data point for bell curve visualization
 */
export interface BellCurveDataPoint {
  x: number;      // Value on x-axis
  y: number;      // Probability density
  cumulative: number; // Cumulative probability up to this point
}

/**
 * Props for bell curve component
 */
export interface BellCurveProps {
  distribution: ProbabilityDistribution;
  width?: number;
  height?: number;
  showPercentiles?: boolean;
  showMean?: boolean;
  colorScheme?: 'gold' | 'crimson' | 'neutral' | 'green';
  label?: string;
  unit?: string;
}

// === RESOURCE FORECASTS ===

/**
 * Forecast for resource production
 */
export interface ResourceForecast {
  resource: ResourceType;
  currentProduction: number;
  predicted: ProbabilityDistribution;
  trend: 'increasing' | 'stable' | 'decreasing';
  factors: { name: string; impact: number }[];
}

/**
 * Complete economic forecast
 */
export interface EconomicForecast {
  nextSeasonIncome: ProbabilityDistribution;
  nextSeasonUpkeep: ProbabilityDistribution;
  netIncome: ProbabilityDistribution;
  resourceForecasts: ResourceForecast[];
  foodSecurity: {
    turnsUntilShortage: ProbabilityDistribution;
    surplusLevel: 'critical' | 'low' | 'adequate' | 'abundant';
  };
  treasurySustainability: {
    turnsUntilBankrupt: ProbabilityDistribution;
    healthLevel: 'critical' | 'poor' | 'stable' | 'healthy' | 'thriving';
  };
}
