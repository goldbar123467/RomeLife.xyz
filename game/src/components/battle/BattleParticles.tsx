'use client';

// ============================================
// ROME EMPIRE BUILDER - Battle Particle Effects
// Animated particles for battle visualization
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Sword,
  Shield,
  Zap,
  Sparkles,
  Star,
  Trophy,
  Crown,
  Award,
  Skull,
  Droplet,
  Flame,
  type LucideIcon,
} from 'lucide-react';

// Particle types with Lucide icons and colors
const PARTICLE_ICONS: Record<string, { icon: LucideIcon; color: string }[]> = {
  sword: [
    { icon: Swords, color: '#C0C0C0' },
    { icon: Sword, color: '#A0A0A0' },
  ],
  shield: [
    { icon: Shield, color: '#CD7F32' },
  ],
  impact: [
    { icon: Zap, color: '#FFD700' },
    { icon: Sparkles, color: '#FFFFFF' },
    { icon: Star, color: '#FFD700' },
  ],
  victory: [
    { icon: Trophy, color: '#FFD700' },
    { icon: Crown, color: '#FFD700' },
    { icon: Award, color: '#C0C0C0' },
    { icon: Sparkles, color: '#FFFFFF' },
  ],
  defeat: [
    { icon: Skull, color: '#808080' },
    { icon: Skull, color: '#606060' },
    { icon: Droplet, color: '#DC143C' },
  ],
  fire: [
    { icon: Flame, color: '#FF4500' },
  ],
};

type ParticleType = keyof typeof PARTICLE_ICONS;

interface ParticleIconData {
  icon: LucideIcon;
  color: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  iconData: ParticleIconData;
  type: ParticleType;
  scale: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
}

interface BattleParticlesProps {
  isActive: boolean;
  type: 'clash' | 'victory' | 'defeat' | 'idle';
  intensity?: 'low' | 'medium' | 'high';
}

export function BattleParticles({
  isActive,
  type,
  intensity = 'medium',
}: BattleParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [nextId, setNextId] = useState(0);

  // Get particle count based on intensity
  const getParticleCount = useCallback(() => {
    switch (intensity) {
      case 'low': return 5;
      case 'medium': return 10;
      case 'high': return 20;
      default: return 10;
    }
  }, [intensity]);

  // Get particle icon data based on animation type
  const getParticleIconData = useCallback((): ParticleIconData[] => {
    switch (type) {
      case 'clash':
        return [...PARTICLE_ICONS.sword, ...PARTICLE_ICONS.shield, ...PARTICLE_ICONS.impact];
      case 'victory':
        return [...PARTICLE_ICONS.victory];
      case 'defeat':
        return [...PARTICLE_ICONS.defeat, ...PARTICLE_ICONS.fire];
      default:
        return [...PARTICLE_ICONS.impact];
    }
  }, [type]);

  // Spawn particles
  const spawnParticles = useCallback(() => {
    if (!isActive) return;

    const count = getParticleCount();
    const iconDataList = getParticleIconData();
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const iconData = iconDataList[Math.floor(Math.random() * iconDataList.length)];

      // Spawn position - center with some random offset
      const centerX = 50;
      const centerY = 50;

      newParticles.push({
        id: nextId + i,
        x: centerX + (Math.random() - 0.5) * 30,
        y: centerY + (Math.random() - 0.5) * 20,
        iconData,
        type: type === 'clash' ? 'impact' : type === 'victory' ? 'victory' : 'defeat',
        scale: 0.5 + Math.random() * 1,
        rotation: Math.random() * 360,
        velocityX: (Math.random() - 0.5) * 200,
        velocityY: -50 - Math.random() * 150, // Upward bias
      });
    }

    setNextId((prev) => prev + count);
    setParticles((prev) => [...prev, ...newParticles].slice(-30)); // Limit to 30 particles

    // Clean up after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1500);
  }, [isActive, type, nextId, getParticleCount, getParticleIconData]);

  // Spawn particles when active
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Initial burst
    spawnParticles();

    // Continuous spawning for clash
    if (type === 'clash') {
      const interval = setInterval(spawnParticles, 300);
      return () => clearInterval(interval);
    }
  }, [isActive, type, spawnParticles]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 50 }}
    >
      <AnimatePresence>
        {particles.map((particle) => {
          const IconComponent = particle.iconData.icon;
          return (
            <motion.div
              key={particle.id}
              className="absolute"
              initial={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                scale: 0,
                rotate: particle.rotation,
                opacity: 1,
              }}
              animate={{
                left: `${particle.x + particle.velocityX / 10}%`,
                top: `${particle.y + particle.velocityY / 10}%`,
                scale: particle.scale,
                rotate: particle.rotation + 180,
                opacity: [1, 1, 0],
              }}
              exit={{
                opacity: 0,
                scale: 0,
              }}
              transition={{
                duration: 1.2,
                ease: 'easeOut',
              }}
            >
              <IconComponent
                size={24}
                color={particle.iconData.color}
                style={{
                  filter: `drop-shadow(0 0 4px ${particle.iconData.color})`,
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// === SPARK EFFECT ===

interface SparkProps {
  x: number;
  y: number;
  color?: string;
}

export function Spark({ x, y, color = '#FFD700' }: SparkProps) {
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{
        left: x,
        top: y,
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{
        scale: [0, 1.5, 0],
        opacity: [1, 0.8, 0],
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    />
  );
}

// === EXPLOSION EFFECT ===

interface ExplosionProps {
  isActive: boolean;
  x?: number;
  y?: number;
}

export function Explosion({ isActive, x = 50, y = 50 }: ExplosionProps) {
  if (!isActive) return null;

  const sparks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const distance = 30 + Math.random() * 20;
    return {
      id: i,
      endX: x + Math.cos(angle) * distance,
      endY: y + Math.sin(angle) * distance,
    };
  });

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 60 }}>
      {/* Central flash */}
      <motion.div
        className="absolute"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{
          scale: [0, 3, 0],
          opacity: [1, 0.5, 0],
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div
          className="w-20 h-20 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(220,20,60,0.4) 50%, transparent 70%)',
          }}
        />
      </motion.div>

      {/* Radiating sparks */}
      {sparks.map((spark) => (
        <motion.div
          key={spark.id}
          className="absolute w-3 h-3 rounded-full bg-amber-400"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            boxShadow: '0 0 8px #FFD700',
          }}
          initial={{ scale: 1, opacity: 1 }}
          animate={{
            left: `${spark.endX}%`,
            top: `${spark.endY}%`,
            scale: [1, 0.5, 0],
            opacity: [1, 0.6, 0],
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// === CLASH WAVE ===

interface ClashWaveProps {
  isActive: boolean;
}

export function ClashWave({ isActive }: ClashWaveProps) {
  if (!isActive) return null;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 55 }}
    >
      {/* Expanding ring */}
      <motion.div
        className="absolute rounded-full border-4 border-amber-400/50"
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{
          width: 300,
          height: 300,
          opacity: 0,
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Inner ring */}
      <motion.div
        className="absolute rounded-full border-2 border-red-500/50"
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{
          width: 200,
          height: 200,
          opacity: 0,
        }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
      />
    </motion.div>
  );
}

export default BattleParticles;
