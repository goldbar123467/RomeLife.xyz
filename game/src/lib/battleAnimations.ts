// ============================================
// ROME EMPIRE BUILDER - Battle Animation System
// Timing, phases, and animation orchestration
// ============================================

// === SPEED PRESETS ===

export type BattleSpeed = 'normal' | 'fast' | 'instant';

export interface SpeedConfig {
  multiplier: number;
  skipAnimations: boolean;
}

export const SPEED_CONFIGS: Record<BattleSpeed, SpeedConfig> = {
  normal: { multiplier: 1, skipAnimations: false },
  fast: { multiplier: 0.35, skipAnimations: false },
  instant: { multiplier: 0, skipAnimations: true },
};

// === BATTLE PHASES ===

export type BattlePhase =
  | 'idle'
  | 'approach'
  | 'clash'
  | 'exchange'
  | 'resolve'
  | 'celebration'
  | 'complete';

export interface PhaseConfig {
  name: BattlePhase;
  duration: number; // Base duration in ms
  particleType?: 'clash' | 'victory' | 'defeat' | 'idle';
  sound?: string; // For future audio support
}

export const BATTLE_PHASES: PhaseConfig[] = [
  { name: 'idle', duration: 0, particleType: 'idle' },
  { name: 'approach', duration: 500 },
  { name: 'clash', duration: 300, particleType: 'clash' },
  { name: 'exchange', duration: 1000, particleType: 'clash' },
  { name: 'resolve', duration: 500 },
  { name: 'celebration', duration: 1500 }, // Victory/defeat particles added dynamically
  { name: 'complete', duration: 0 },
];

// === ANIMATION VARIANTS ===

// Unit approach animation
export const approachVariants = {
  left: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
  right: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  },
};

// Clash shake effect
export const clashShake = {
  animate: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.3, ease: 'easeInOut' },
  },
};

// Victory celebration
export const victoryVariants = {
  initial: { scale: 0.8, opacity: 0, y: 20 },
  animate: {
    scale: [0.8, 1.2, 1],
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      scale: { times: [0, 0.5, 1] },
    },
  },
};

// Defeat fade
export const defeatVariants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: 0.9,
    opacity: 0.7,
    transition: { duration: 0.5 },
  },
};

// Pulse effect for active forces
export const pulseVariant = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// === ANIMATION TIMING UTILITIES ===

/**
 * Get adjusted duration based on battle speed
 */
export function getAdjustedDuration(baseDuration: number, speed: BattleSpeed): number {
  const config = SPEED_CONFIGS[speed];
  if (config.skipAnimations) return 0;
  return Math.max(50, baseDuration * config.multiplier);
}

/**
 * Get phase duration with speed adjustment
 */
export function getPhaseDuration(phase: BattlePhase, speed: BattleSpeed): number {
  const phaseConfig = BATTLE_PHASES.find(p => p.name === phase);
  if (!phaseConfig) return 0;
  return getAdjustedDuration(phaseConfig.duration, speed);
}

/**
 * Get total battle animation duration
 */
export function getTotalBattleDuration(speed: BattleSpeed): number {
  if (SPEED_CONFIGS[speed].skipAnimations) return 100; // Minimal delay for instant

  return BATTLE_PHASES.reduce((total, phase) => {
    return total + getAdjustedDuration(phase.duration, speed);
  }, 0);
}

/**
 * Calculate phase start times for orchestration
 */
export function getPhaseTimeline(speed: BattleSpeed): Record<BattlePhase, number> {
  const timeline: Partial<Record<BattlePhase, number>> = {};
  let currentTime = 0;

  for (const phase of BATTLE_PHASES) {
    timeline[phase.name] = currentTime;
    currentTime += getAdjustedDuration(phase.duration, speed);
  }

  return timeline as Record<BattlePhase, number>;
}

// === DAMAGE NUMBER GENERATION ===

export interface DamageNumberConfig {
  count: number;
  interval: number;
  variance: number;
}

/**
 * Get config for damage number spawning
 */
export function getDamageNumberConfig(
  totalDamage: number,
  speed: BattleSpeed
): DamageNumberConfig {
  if (SPEED_CONFIGS[speed].skipAnimations) {
    return { count: 1, interval: 0, variance: 0 };
  }

  // More hits for more damage
  const count = Math.min(8, Math.max(3, Math.ceil(totalDamage / 10)));
  const baseInterval = 150;
  const interval = getAdjustedDuration(baseInterval, speed);
  const variance = 0.2; // 20% variance in damage per number

  return { count, interval, variance };
}

/**
 * Generate damage number sequence
 */
export function generateDamageSequence(
  totalDamage: number,
  config: DamageNumberConfig
): { value: number; delay: number }[] {
  const { count, interval, variance } = config;
  const sequence: { value: number; delay: number }[] = [];

  let remaining = totalDamage;
  const basePerHit = totalDamage / count;

  for (let i = 0; i < count && remaining > 0; i++) {
    // Add variance
    const variedAmount = basePerHit * (1 + (Math.random() - 0.5) * 2 * variance);
    const damage = Math.min(Math.round(variedAmount), remaining);
    remaining -= damage;

    sequence.push({
      value: damage,
      delay: i * interval,
    });
  }

  // Add any remaining damage to last hit
  if (remaining > 0 && sequence.length > 0) {
    sequence[sequence.length - 1].value += remaining;
  }

  return sequence;
}

// === PARTICLE BURST CONFIG ===

export interface ParticleBurstConfig {
  count: number;
  spread: number;
  duration: number;
}

/**
 * Get particle burst configuration
 */
export function getParticleBurstConfig(
  type: 'clash' | 'victory' | 'defeat',
  speed: BattleSpeed
): ParticleBurstConfig {
  if (SPEED_CONFIGS[speed].skipAnimations) {
    return { count: 0, spread: 0, duration: 0 };
  }

  const configs: Record<string, ParticleBurstConfig> = {
    clash: { count: 15, spread: 40, duration: 800 },
    victory: { count: 25, spread: 60, duration: 1200 },
    defeat: { count: 10, spread: 30, duration: 800 },
  };

  const config = configs[type] || configs.clash;

  return {
    ...config,
    duration: getAdjustedDuration(config.duration, speed),
  };
}

// === ORCHESTRATION HELPER ===

export interface BattleAnimationState {
  phase: BattlePhase;
  phaseStartTime: number;
  showParticles: boolean;
  showDamageNumbers: boolean;
  particleType: 'clash' | 'victory' | 'defeat' | 'idle';
}

/**
 * Create animation state machine
 */
export function createBattleAnimator(speed: BattleSpeed) {
  const timeline = getPhaseTimeline(speed);
  const skipAnimations = SPEED_CONFIGS[speed].skipAnimations;

  return {
    timeline,
    skipAnimations,

    getPhaseAtTime(elapsedTime: number): BattlePhase {
      if (skipAnimations) return 'complete';

      let currentPhase: BattlePhase = 'idle';
      for (const phase of BATTLE_PHASES) {
        if (elapsedTime >= timeline[phase.name]) {
          currentPhase = phase.name;
        }
      }
      return currentPhase;
    },

    shouldShowParticles(phase: BattlePhase): boolean {
      const phaseConfig = BATTLE_PHASES.find(p => p.name === phase);
      return !!phaseConfig?.particleType && !skipAnimations;
    },

    getParticleType(phase: BattlePhase, isVictory: boolean): 'clash' | 'victory' | 'defeat' | 'idle' {
      if (phase === 'celebration') {
        return isVictory ? 'victory' : 'defeat';
      }
      const phaseConfig = BATTLE_PHASES.find(p => p.name === phase);
      return phaseConfig?.particleType || 'idle';
    },
  };
}
