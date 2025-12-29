// ============================================
// ROME EMPIRE BUILDER - Causal Graph System
// Economic Forecasting via Directed Acyclic Graph
// ============================================

import type {
  CausalNode,
  CausalEdge,
  CausalState,
  NodeForecast,
  SeasonForecast,
  ForecastWarning,
  ForecastOpportunity,
  ProbabilityDistribution,
} from '../types/probability';
import type { GameState, Season } from '../types';
import { gaussianRandom, calculateDistribution } from './monteCarlo';

// === CAUSAL GRAPH DEFINITION ===

/**
 * The causal edges defining relationships between game variables
 * Positive coefficient = positive correlation
 * Negative coefficient = inverse correlation
 */
export const CAUSAL_EDGES: CausalEdge[] = [
  // Weather -> Crops
  {
    source: 'weather',
    target: 'rainfall',
    coefficient: 0.8,
    description: 'Good weather increases rainfall predictability',
  },
  {
    source: 'rainfall',
    target: 'cropYield',
    coefficient: 0.9,
    description: 'Adequate rainfall boosts crop yields',
  },

  // Crops -> Food
  {
    source: 'cropYield',
    target: 'foodStock',
    coefficient: 0.85,
    description: 'Higher crop yields increase food stocks',
  },
  {
    source: 'foodStock',
    target: 'foodPrice',
    coefficient: -0.7,
    description: 'Abundant food lowers prices (supply/demand)',
  },

  // Food -> Population Effects
  {
    source: 'foodStock',
    target: 'happiness',
    coefficient: 0.5,
    description: 'Food security increases happiness',
  },
  {
    source: 'foodStock',
    target: 'population',
    coefficient: 0.3,
    delay: 1,
    description: 'Food abundance enables population growth',
  },

  // Economic Chain
  {
    source: 'foodPrice',
    target: 'inflation',
    coefficient: 0.6,
    description: 'Food prices drive overall inflation',
  },
  {
    source: 'inflation',
    target: 'happiness',
    coefficient: -0.4,
    description: 'High inflation reduces happiness',
  },
  {
    source: 'inflation',
    target: 'unrest',
    coefficient: 0.5,
    description: 'Inflation fuels civil unrest',
  },

  // Happiness Chain
  {
    source: 'happiness',
    target: 'unrest',
    coefficient: -0.7,
    description: 'Happy citizens are less likely to revolt',
  },
  {
    source: 'happiness',
    target: 'taxRevenue',
    coefficient: 0.3,
    description: 'Happy citizens pay taxes more willingly',
  },
  {
    source: 'happiness',
    target: 'population',
    coefficient: 0.2,
    delay: 1,
    description: 'Happiness encourages population growth',
  },

  // Stability Effects
  {
    source: 'unrest',
    target: 'stability',
    coefficient: -0.8,
    description: 'Civil unrest destabilizes the empire',
  },
  {
    source: 'stability',
    target: 'tradeVolume',
    coefficient: 0.6,
    description: 'Stable regions attract more trade',
  },
  {
    source: 'stability',
    target: 'taxRevenue',
    coefficient: 0.4,
    description: 'Stability enables efficient tax collection',
  },

  // Military Effects
  {
    source: 'militaryPower',
    target: 'stability',
    coefficient: 0.4,
    description: 'Military presence maintains order',
  },
  {
    source: 'militaryPower',
    target: 'unrest',
    coefficient: -0.3,
    description: 'Military deters civil unrest',
  },

  // Trade Effects
  {
    source: 'tradeVolume',
    target: 'taxRevenue',
    coefficient: 0.5,
    description: 'Trade generates tax revenue',
  },
  {
    source: 'tradeVolume',
    target: 'happiness',
    coefficient: 0.2,
    description: 'Trade brings goods that improve happiness',
  },

  // Population Effects
  {
    source: 'population',
    target: 'taxRevenue',
    coefficient: 0.7,
    description: 'Larger population means more taxpayers',
  },
  {
    source: 'population',
    target: 'foodStock',
    coefficient: -0.4,
    description: 'More people consume more food',
  },
];

// === GRAPH OPERATIONS ===

/**
 * Build adjacency list from edges for efficient traversal
 */
export function buildAdjacencyList(): Map<CausalNode, CausalEdge[]> {
  const adjacency = new Map<CausalNode, CausalEdge[]>();

  for (const edge of CAUSAL_EDGES) {
    const existing = adjacency.get(edge.source) || [];
    existing.push(edge);
    adjacency.set(edge.source, existing);
  }

  return adjacency;
}

/**
 * Get all nodes that are affected by changes to a source node
 */
export function getDownstreamNodes(source: CausalNode): Set<CausalNode> {
  const adjacency = buildAdjacencyList();
  const visited = new Set<CausalNode>();
  const queue: CausalNode[] = [source];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const edges = adjacency.get(current) || [];
    for (const edge of edges) {
      if (!visited.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  visited.delete(source); // Don't include the source itself
  return visited;
}

/**
 * Propagate an effect through the causal graph
 * Returns the impact on all downstream nodes
 */
export function propagateEffect(
  source: CausalNode,
  delta: number,
  currentState: CausalState
): Map<CausalNode, number> {
  const impacts = new Map<CausalNode, number>();
  const adjacency = buildAdjacencyList();

  // BFS through the graph, accumulating effects
  const queue: { node: CausalNode; effect: number; depth: number }[] = [
    { node: source, effect: delta, depth: 0 }
  ];
  const visited = new Set<CausalNode>();

  while (queue.length > 0) {
    const { node, effect, depth } = queue.shift()!;

    if (visited.has(node) || depth > 5) continue; // Limit propagation depth
    visited.add(node);

    const edges = adjacency.get(node) || [];
    for (const edge of edges) {
      // Calculate propagated effect
      const propagatedEffect = effect * edge.coefficient;

      // Dampen effect based on current state (diminishing returns)
      const currentValue = currentState[edge.target] || 50;
      const dampening = 1 - Math.abs(currentValue - 50) / 200; // Less effect at extremes
      const finalEffect = propagatedEffect * dampening;

      // Accumulate impacts
      const existing = impacts.get(edge.target) || 0;
      impacts.set(edge.target, existing + finalEffect);

      // Continue propagation
      queue.push({
        node: edge.target,
        effect: finalEffect,
        depth: depth + 1,
      });
    }
  }

  return impacts;
}

// === STATE EXTRACTION ===

/**
 * Extract causal state from game state
 */
export function extractCausalState(gameState: GameState): CausalState {
  const { inventory, capacity, happiness, population, troops, taxRate, inflation, reputation } = gameState;

  // Calculate food stock as percentage of capacity
  const grainStock = inventory.grain || 0;
  const grainCapacity = capacity.grain || 100;
  const foodStockPct = (grainStock / grainCapacity) * 100;

  // Calculate military power based on troops and morale
  const militaryPower = (troops * (gameState.morale / 100)) / 5;

  // Calculate average territory stability
  const ownedTerritories = gameState.territories.filter(t => t.owned);
  const avgStability = ownedTerritories.length > 0
    ? ownedTerritories.reduce((sum, t) => sum + t.stability, 0) / ownedTerritories.length
    : 50;

  // Estimate trade volume from reputation and active routes
  const tradeVolume = reputation + (gameState.tradeState.routes.length * 10);

  // Estimate tax revenue (simplified)
  const taxRevenue = population * taxRate * 10;

  // Estimate unrest from happiness inverse
  const unrest = Math.max(0, 100 - happiness);

  return {
    weather: 50 + gaussianRandom(0, 15), // Random weather baseline
    rainfall: 50 + gaussianRandom(0, 10),
    cropYield: Math.min(100, foodStockPct * 1.2),
    foodStock: foodStockPct,
    foodPrice: Math.max(20, 150 - foodStockPct),
    happiness,
    unrest,
    inflation,
    tradeVolume: Math.min(100, tradeVolume),
    militaryPower: Math.min(100, militaryPower),
    population: Math.min(100, population / 10),
    taxRevenue: Math.min(100, taxRevenue / 50),
    stability: avgStability,
  };
}

// === FORECASTING ===

/**
 * Forecast a single node's future value using Monte Carlo
 */
export function forecastNode(
  node: CausalNode,
  currentState: CausalState,
  iterations: number = 500
): NodeForecast {
  const currentValue = currentState[node];
  const samples: number[] = [];

  // Get incoming edges to this node
  const incomingEdges = CAUSAL_EDGES.filter(e => e.target === node);

  for (let i = 0; i < iterations; i++) {
    let predictedValue = currentValue;

    // Apply effects from all incoming nodes
    for (const edge of incomingEdges) {
      const sourceValue = currentState[edge.source];
      const sourceDeviation = sourceValue - 50; // Deviation from neutral

      // Add noise to the coefficient
      const noisyCoeff = gaussianRandom(edge.coefficient, Math.abs(edge.coefficient) * 0.2);

      // Calculate effect
      const effect = sourceDeviation * noisyCoeff * 0.1; // Scale down the effect
      predictedValue += effect;
    }

    // Add random noise for unpredictability
    predictedValue += gaussianRandom(0, 5);

    // Clamp to valid range
    predictedValue = Math.max(0, Math.min(100, predictedValue));

    samples.push(predictedValue);
  }

  const predicted = calculateDistribution(samples);

  // Determine trend
  const change = predicted.p50 - currentValue;
  let trend: NodeForecast['trend'];
  if (change > 3) {
    trend = 'rising';
  } else if (change < -3) {
    trend = 'falling';
  } else {
    trend = 'stable';
  }

  // Calculate confidence based on variance
  const confidence = Math.max(0.3, 1 - (predicted.stdDev / 30));

  // Find main drivers
  const drivers = incomingEdges
    .map(edge => ({
      node: edge.source,
      impact: (currentState[edge.source] - 50) * edge.coefficient,
    }))
    .filter(d => Math.abs(d.impact) > 2)
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 3);

  return {
    node,
    current: Math.round(currentValue * 10) / 10,
    predicted,
    trend,
    confidence: Math.round(confidence * 100) / 100,
    drivers,
  };
}

/**
 * Generate a complete season forecast
 */
export function forecastSeason(gameState: GameState): SeasonForecast {
  const currentState = extractCausalState(gameState);
  const forecasts: NodeForecast[] = [];
  const warnings: ForecastWarning[] = [];
  const opportunities: ForecastOpportunity[] = [];

  // Forecast key nodes
  const keyNodes: CausalNode[] = [
    'foodStock', 'happiness', 'unrest', 'inflation',
    'stability', 'tradeVolume', 'taxRevenue',
  ];

  for (const node of keyNodes) {
    const forecast = forecastNode(node, currentState);
    forecasts.push(forecast);

    // Generate warnings
    if (node === 'foodStock' && forecast.predicted.p10 < 20) {
      warnings.push({
        severity: forecast.predicted.p10 < 10 ? 'critical' : 'high',
        message: 'Food shortage imminent',
        node,
        probability: 1 - (forecast.predicted.p10 / 100),
        recommendation: 'Increase food production or reduce consumption',
      });
    }

    if (node === 'unrest' && forecast.predicted.p90 > 70) {
      warnings.push({
        severity: forecast.predicted.p90 > 85 ? 'critical' : 'high',
        message: 'Civil unrest rising',
        node,
        probability: forecast.predicted.p90 / 100,
        recommendation: 'Improve happiness or increase military presence',
      });
    }

    if (node === 'happiness' && forecast.predicted.p10 < 30) {
      warnings.push({
        severity: forecast.predicted.p10 < 20 ? 'critical' : 'medium',
        message: 'Happiness declining',
        node,
        probability: 1 - (forecast.predicted.p10 / 100),
        recommendation: 'Lower taxes, build entertainment, or host a feast',
      });
    }

    if (node === 'inflation' && forecast.predicted.p90 > 15) {
      warnings.push({
        severity: 'medium',
        message: 'Inflation rising',
        node,
        probability: forecast.predicted.p90 / 100,
        recommendation: 'Reduce spending or implement price controls',
      });
    }

    // Generate opportunities
    if (node === 'tradeVolume' && forecast.predicted.p90 > 70 && forecast.trend === 'rising') {
      opportunities.push({
        type: 'trade',
        message: 'Trade conditions favorable',
        probability: forecast.predicted.p90 / 100,
        potentialGain: Math.round((forecast.predicted.p90 - forecast.current) * 10),
        recommendation: 'Send caravans and establish trade routes',
      });
    }

    if (node === 'stability' && forecast.predicted.p50 > 70) {
      opportunities.push({
        type: 'expansion',
        message: 'Empire stable - good time to expand',
        probability: forecast.confidence,
        potentialGain: Math.round(forecast.predicted.p50),
        recommendation: 'Consider conquering new territories',
      });
    }

    if (node === 'happiness' && forecast.predicted.p50 > 75 && forecast.trend === 'rising') {
      opportunities.push({
        type: 'growth',
        message: 'Population growth opportunity',
        probability: forecast.confidence,
        potentialGain: Math.round((forecast.predicted.p50 - 50) / 5),
        recommendation: 'Build more housing to capitalize on growth',
      });
    }
  }

  // Sort warnings by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  warnings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    season: gameState.round,
    forecasts,
    warnings,
    opportunities,
  };
}

// === SCENARIO ANALYSIS ===

/**
 * Analyze the impact of a hypothetical action
 */
export function analyzeScenario(
  gameState: GameState,
  changes: Partial<CausalState>
): {
  impacts: Map<CausalNode, number>;
  riskAssessment: 'low' | 'medium' | 'high';
  summary: string;
} {
  const currentState = extractCausalState(gameState);
  const impacts = new Map<CausalNode, number>();

  // Propagate each change
  for (const [node, newValue] of Object.entries(changes)) {
    const delta = newValue - (currentState[node as CausalNode] || 50);
    const nodeImpacts = propagateEffect(node as CausalNode, delta, currentState);

    // Merge impacts
    Array.from(nodeImpacts.entries()).forEach(([targetNode, impact]) => {
      const existing = impacts.get(targetNode) || 0;
      impacts.set(targetNode, existing + impact);
    });
  }

  // Assess risk based on impacts
  let negativeImpacts = 0;
  let positiveImpacts = 0;

  Array.from(impacts.entries()).forEach(([node, impact]) => {
    // Negative nodes where increase is bad
    if ((node === 'unrest' || node === 'inflation' || node === 'foodPrice') && impact > 0) {
      negativeImpacts += Math.abs(impact);
    } else if ((node === 'happiness' || node === 'stability' || node === 'foodStock') && impact < 0) {
      negativeImpacts += Math.abs(impact);
    } else if (impact > 0) {
      positiveImpacts += impact;
    }
  });

  let riskAssessment: 'low' | 'medium' | 'high';
  if (negativeImpacts > 20) {
    riskAssessment = 'high';
  } else if (negativeImpacts > 10) {
    riskAssessment = 'medium';
  } else {
    riskAssessment = 'low';
  }

  // Generate summary
  const netImpact = positiveImpacts - negativeImpacts;
  let summary: string;
  if (netImpact > 10) {
    summary = 'This action is expected to have strongly positive effects on the empire.';
  } else if (netImpact > 0) {
    summary = 'This action should have a modest positive impact.';
  } else if (netImpact > -10) {
    summary = 'This action may have some negative consequences.';
  } else {
    summary = 'Warning: This action could significantly destabilize the empire.';
  }

  return { impacts, riskAssessment, summary };
}

// === SEASONAL WEATHER EFFECTS ===

/**
 * Get weather modifier based on season
 */
export function getSeasonalWeatherEffect(season: Season): number {
  const effects: Record<Season, number> = {
    spring: 10,   // Good growing weather
    summer: 5,    // Hot but manageable
    autumn: 0,    // Neutral
    winter: -15,  // Harsh conditions
  };
  return effects[season];
}

/**
 * Simulate weather for the next season
 */
export function simulateWeather(
  currentSeason: Season,
  iterations: number = 100
): ProbabilityDistribution {
  const seasonalBase = 50 + getSeasonalWeatherEffect(currentSeason);
  const samples: number[] = [];

  for (let i = 0; i < iterations; i++) {
    // Weather has high variance
    const weather = gaussianRandom(seasonalBase, 15);
    samples.push(Math.max(0, Math.min(100, weather)));
  }

  return calculateDistribution(samples);
}
