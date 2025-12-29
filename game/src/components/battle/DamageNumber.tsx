'use client';

// ============================================
// ROME EMPIRE BUILDER - Damage Number Display
// Floating numbers showing battle damage/healing
// ============================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DamageNumberProps {
  value: number;
  type: 'damage' | 'healing' | 'critical' | 'blocked';
  x?: number;
  y?: number;
  delay?: number;
  onComplete?: () => void;
}

export function DamageNumber({
  value,
  type,
  x = 50,
  y = 50,
  delay = 0,
  onComplete,
}: DamageNumberProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1500 + delay);

    return () => clearTimeout(timer);
  }, [delay, onComplete]);

  // Style based on type
  const styles: Record<string, { color: string; prefix: string; scale: number }> = {
    damage: { color: '#EF4444', prefix: '-', scale: 1 },
    healing: { color: '#22C55E', prefix: '+', scale: 1 },
    critical: { color: '#F59E0B', prefix: '-', scale: 1.3 },
    blocked: { color: '#6B7280', prefix: '', scale: 0.8 },
  };

  const style = styles[type] || styles.damage;

  if (!visible) return null;

  return (
    <motion.div
      className="absolute font-black pointer-events-none select-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        color: style.color,
        textShadow: `0 0 10px ${style.color}, 0 2px 4px rgba(0,0,0,0.5)`,
        fontSize: `${1.5 * style.scale}rem`,
        zIndex: 100,
      }}
      initial={{
        opacity: 0,
        scale: 0.5,
        y: 0,
        x: '-50%',
      }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8],
        y: [-20, -40, -60, -80],
        x: '-50%',
      }}
      transition={{
        duration: 1.2,
        delay,
        ease: 'easeOut',
        times: [0, 0.2, 0.7, 1],
      }}
    >
      {type === 'blocked' ? (
        <span className="text-sm">BLOCKED</span>
      ) : (
        <>
          {style.prefix}
          {Math.abs(value)}
          {type === 'critical' && <span className="text-xs ml-1">CRIT!</span>}
        </>
      )}
    </motion.div>
  );
}

// === DAMAGE NUMBER STACK ===

interface DamageEntry {
  id: number;
  value: number;
  type: 'damage' | 'healing' | 'critical' | 'blocked';
  x: number;
  y: number;
}

interface DamageStackProps {
  entries: DamageEntry[];
  onEntryComplete?: (id: number) => void;
}

export function DamageStack({ entries, onEntryComplete }: DamageStackProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {entries.map((entry, index) => (
          <DamageNumber
            key={entry.id}
            value={entry.value}
            type={entry.type}
            x={entry.x}
            y={entry.y}
            delay={index * 0.1}
            onComplete={() => onEntryComplete?.(entry.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// === BATTLE RESULT DISPLAY ===

interface BattleResultProps {
  result: 'victory' | 'defeat';
  playerCasualties: number;
  enemyCasualties: number;
  isVisible: boolean;
}

export function BattleResultDisplay({
  result,
  playerCasualties,
  enemyCasualties,
  isVisible,
}: BattleResultProps) {
  if (!isVisible) return null;

  const isVictory = result === 'victory';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-4">
      {/* Main result */}
      <motion.div
        className={`text-4xl font-black ${isVictory ? 'text-green-400' : 'text-red-500'}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        style={{
          textShadow: isVictory
            ? '0 0 20px rgba(34, 197, 94, 0.5)'
            : '0 0 20px rgba(239, 68, 68, 0.5)',
        }}
      >
        {isVictory ? 'VICTORY!' : 'DEFEAT'}
      </motion.div>

      {/* Casualties summary */}
      <motion.div
        className="flex gap-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div>
          <div className="text-red-400 text-2xl font-bold">-{playerCasualties}</div>
          <div className="text-xs text-gray-400">Your Losses</div>
        </div>
        <div>
          <div className="text-green-400 text-2xl font-bold">-{enemyCasualties}</div>
          <div className="text-xs text-gray-400">Enemy Losses</div>
        </div>
      </motion.div>
    </div>
  );
}

// === STAGGERED DAMAGE NUMBERS ===

interface StaggeredDamageProps {
  totalDamage: number;
  count?: number;
  type: 'damage' | 'healing';
  side: 'left' | 'right' | 'center';
  isActive: boolean;
}

export function StaggeredDamage({
  totalDamage,
  count = 5,
  type,
  side,
  isActive,
}: StaggeredDamageProps) {
  const [numbers, setNumbers] = useState<DamageEntry[]>([]);

  useEffect(() => {
    if (!isActive || totalDamage === 0) {
      setNumbers([]);
      return;
    }

    // Distribute damage across multiple numbers
    const damagePerNumber = Math.ceil(totalDamage / count);
    let remaining = totalDamage;

    const newNumbers: DamageEntry[] = [];
    for (let i = 0; i < count && remaining > 0; i++) {
      const dmg = Math.min(damagePerNumber + Math.floor(Math.random() * 5 - 2), remaining);
      remaining -= dmg;

      // Position based on side
      let x: number;
      if (side === 'left') {
        x = 20 + Math.random() * 20;
      } else if (side === 'right') {
        x = 60 + Math.random() * 20;
      } else {
        x = 40 + Math.random() * 20;
      }

      newNumbers.push({
        id: Date.now() + i,
        value: dmg,
        type,
        x,
        y: 40 + Math.random() * 20,
      });
    }

    setNumbers(newNumbers);

    // Clean up after animation
    const cleanup = setTimeout(() => {
      setNumbers([]);
    }, 2000);

    return () => clearTimeout(cleanup);
  }, [isActive, totalDamage, count, type, side]);

  return <DamageStack entries={numbers} />;
}

export default DamageNumber;
