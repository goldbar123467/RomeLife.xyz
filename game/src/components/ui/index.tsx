'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { RESOURCE_ICONS } from './icons';
import type { ResourceType } from '@/core/types';

// === GLASS CARD ===
interface GlassCardProps {
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'gold' | 'crimson';
    hover?: boolean;
    onClick?: () => void;
}

export function GlassCard({
    children,
    className = '',
    variant = 'default',
    hover = true,
    onClick
}: GlassCardProps) {
    const variants = {
        default: 'glass-dark',
        gold: 'glass-gold border-roman-gold/30',
        crimson: 'glass-dark border-roman-red/30',
    };

    return (
        <motion.div
            className={`rounded-2xl p-5 ${variants[variant]} ${hover ? 'glow-gold-hover' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
            whileHover={hover ? { scale: 1.01 } : undefined}
            whileTap={onClick ? { scale: 0.99 } : undefined}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
}

// === BUTTON ===
interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    variant?: 'roman' | 'gold' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    fullWidth?: boolean;
    icon?: ReactNode;
    className?: string;
}

export function Button({
    children,
    onClick,
    variant = 'roman',
    size = 'md',
    disabled = false,
    fullWidth = false,
    icon,
    className = '',
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-200';

    const variants = {
        roman: 'btn-roman',
        gold: 'btn-gold',
        ghost: 'bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-white/30',
        danger: 'bg-red-600/80 border border-red-500/50 text-white hover:bg-red-500 hover:border-red-400/70',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <motion.button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02, y: -2 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
        >
            {icon && <span className="text-lg">{icon}</span>}
            {children}
        </motion.button>
    );
}

// === STAT DISPLAY ===
interface StatDisplayProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function StatDisplay({
    label,
    value,
    icon,
    trend,
    size = 'md',
    className = '',
}: StatDisplayProps) {
    const trendColors = {
        up: 'text-green-400',
        down: 'text-red-400',
        neutral: 'text-muted',
    };

    const sizes = {
        sm: { label: 'text-xs', value: 'text-lg' },
        md: { label: 'text-sm', value: 'text-2xl' },
        lg: { label: 'text-base', value: 'text-4xl' },
    };

    return (
        <div className={`${className}`}>
            <div className={`${sizes[size].label} text-muted mb-1`}>{label}</div>
            <div className={`${sizes[size].value} font-bold flex items-center gap-2`}>
                {icon && <span>{icon}</span>}
                <span className={trend ? trendColors[trend] : 'text-ink'}>{value}</span>
                {trend === 'up' && <span className="text-green-400 text-sm">▲</span>}
                {trend === 'down' && <span className="text-red-400 text-sm">▼</span>}
            </div>
        </div>
    );
}

// === PROGRESS BAR ===
interface ProgressBarProps {
    value: number;
    max: number;
    variant?: 'gold' | 'green' | 'red' | 'blue' | 'default' | 'danger';
    label?: string;
    showLabel?: boolean;
    showValue?: boolean;
    size?: 'sm' | 'md' | 'lg';
    height?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ProgressBar({
    value,
    max,
    variant = 'gold',
    label,
    showValue = false,
    size = 'md',
    className = '',
}: ProgressBarProps) {
    const percentage = Math.min((value / max) * 100, 100);

    const variants = {
        gold: 'bg-gradient-to-r from-roman-gold to-amber-500',
        green: 'bg-gradient-to-r from-green-500 to-emerald-400',
        red: 'bg-gradient-to-r from-red-500 to-red-400',
        blue: 'bg-gradient-to-r from-blue-500 to-blue-400',
        default: 'bg-gradient-to-r from-cyan-500 to-blue-400',
        danger: 'bg-gradient-to-r from-red-500 to-orange-400',
    };

    const sizes = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    return (
        <div className={className}>
            {(label || showValue) && (
                <div className="flex justify-between mb-1.5 text-sm">
                    {label && <span className="text-muted">{label}</span>}
                    {showValue && <span className="text-ink font-medium">{value} / {max}</span>}
                </div>
            )}
            <div className={`w-full bg-white/10 rounded-full overflow-hidden ${sizes[size]}`}>
                <motion.div
                    className={`h-full rounded-full ${variants[variant]}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />
            </div>
        </div>
    );
}

// === BADGE ===
interface BadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'gold';
    size?: 'sm' | 'md';
    className?: string;
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    className = '',
}: BadgeProps) {
    const variants = {
        default: 'bg-white/10 text-ink border-white/20',
        success: 'bg-green-500/20 text-green-400 border-green-500/30',
        warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        danger: 'bg-red-500/20 text-red-400 border-red-500/30',
        gold: 'bg-roman-gold/20 text-roman-gold border-roman-gold/30',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
            {children}
        </span>
    );
}

// === RARITY BADGE ===
interface RarityBadgeProps {
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'imperial';
    size?: 'sm' | 'md';
    className?: string;
}

export function RarityBadge({ rarity, size = 'md', className = '' }: RarityBadgeProps) {
    const config = {
        common: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Common' },
        uncommon: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Uncommon' },
        rare: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', label: 'Rare' },
        epic: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Epic' },
        legendary: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Legendary' },
        imperial: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Imperial' },
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
    };

    const c = config[rarity];

    return (
        <motion.span
            className={`inline-flex items-center font-bold rounded-full border ${c.bg} ${c.text} ${c.border} ${sizes[size]} ${rarity === 'legendary' || rarity === 'imperial' ? 'animate-pulse' : ''} ${className}`}
            animate={rarity === 'imperial' ? { boxShadow: ['0 0 10px rgba(220,38,38,0.3)', '0 0 20px rgba(255,215,0,0.5)', '0 0 10px rgba(220,38,38,0.3)'] } : undefined}
            transition={{ duration: 2, repeat: Infinity }}
        >
            {c.label}
        </motion.span>
    );
}

// === RESOURCE ICON ===
interface ResourceIconProps {
    type: ResourceType | string;
    amount?: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    useLucide?: boolean;
}

const iconSizes = {
    sm: 14,
    md: 18,
    lg: 24,
};

const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
};

export function ResourceIcon({
    type,
    amount,
    showLabel = false,
    size = 'md',
    className = '',
    useLucide = true,
}: ResourceIconProps) {
    const label = type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    const IconComponent = RESOURCE_ICONS[type as ResourceType];

    if (useLucide && IconComponent) {
        return (
            <span className={`inline-flex items-center gap-1.5 ${textSizes[size]} ${className}`}>
                <IconComponent size={iconSizes[size]} className="text-roman-gold" />
                {amount !== undefined && <span className="font-semibold">{amount}</span>}
                {showLabel && <span className="text-muted">{label}</span>}
            </span>
        );
    }

    // Fallback to emoji for non-resource types or when useLucide is false
    const RESOURCE_EMOJIS: Record<string, string> = {
        grain: '🌾', iron: '⚔️', timber: '🪵', stone: '🪨', clay: '🏺',
        wool: '🐑', salt: '🧂', livestock: '🐄', wine: '🍷', olive_oil: '🫒',
        spices: '🌶️', denarii: '🪙', troops: '⚔️', population: '👥',
        happiness: '😊', piety: '🙏',
    };
    const emoji = RESOURCE_EMOJIS[type] || '📦';

    return (
        <span className={`inline-flex items-center gap-1.5 ${textSizes[size]} ${className}`}>
            <span>{emoji}</span>
            {amount !== undefined && <span className="font-semibold">{amount}</span>}
            {showLabel && <span className="text-muted">{label}</span>}
        </span>
    );
}

// === DIVIDER ===
interface DividerProps {
    className?: string;
    variant?: 'default' | 'gold';
}

export function Divider({ className = '', variant = 'default' }: DividerProps) {
    return (
        <div
            className={`h-px w-full ${variant === 'gold' ? 'bg-gradient-to-r from-transparent via-roman-gold/30 to-transparent' : 'bg-white/10'} ${className}`}
        />
    );
}

// === SECTION HEADER ===
interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}

export function SectionHeader({ title, subtitle, icon, action, className = '' }: SectionHeaderProps) {
    return (
        <div className={`flex items-center justify-between mb-4 ${className}`}>
            <div className="flex items-center gap-3">
                {icon && (
                    <div className="p-3 rounded-xl bg-roman-gold/10 border border-roman-gold/20">
                        {typeof icon === 'string' ? (
                            <span className="text-2xl">{icon}</span>
                        ) : (
                            icon
                        )}
                    </div>
                )}
                <div>
                    <h2 className="text-xl font-bold text-roman-gold">{title}</h2>
                    {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
                </div>
            </div>
            {action}
        </div>
    );
}

// === ICON BUTTON ===
interface IconButtonProps {
    icon: ReactNode;
    onClick?: () => void;
    variant?: 'default' | 'gold' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    className?: string;
    'aria-label': string;
}

export function IconButton({
    icon,
    onClick,
    variant = 'default',
    size = 'md',
    disabled = false,
    className = '',
    'aria-label': ariaLabel,
}: IconButtonProps) {
    const variants = {
        default: 'bg-white/5 hover:bg-white/10 text-ink border-white/10 hover:border-white/20',
        gold: 'bg-roman-gold/10 hover:bg-roman-gold/20 text-roman-gold border-roman-gold/20 hover:border-roman-gold/40',
        danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 hover:border-red-500/40',
    };

    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
    };

    return (
        <motion.button
            className={`inline-flex items-center justify-center rounded-xl border transition-all ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.05 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
            aria-label={ariaLabel}
        >
            {icon}
        </motion.button>
    );
}

// === GAME IMAGE ===
export { GameImage, GameIcon, type GameImageProps, type GameIconProps, type ImageSize } from './GameImage';
