// ============================================
// ROME EMPIRE BUILDER - Animation System
// Consistent Framer Motion variants
// ============================================

import type { Variants, Transition } from 'framer-motion';

// === PAGE TRANSITIONS ===

export const pageTransition: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

export const pageTransitionConfig: Transition = {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
};

// === STAGGER CONTAINERS ===

export const staggerContainer: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
        },
    },
};

export const staggerContainerFast: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.05,
        },
    },
};

// === FADE ANIMATIONS ===

export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
};

export const fadeInDown: Variants = {
    initial: { opacity: 0, y: -16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
};

export const fadeInLeft: Variants = {
    initial: { opacity: 0, x: -16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 16 },
};

export const fadeInRight: Variants = {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
};

// === SCALE ANIMATIONS ===

export const scaleIn: Variants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
};

export const scaleInCenter: Variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
};

export const popIn: Variants = {
    initial: { scale: 0, opacity: 0 },
    animate: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 25,
        },
    },
    exit: { scale: 0, opacity: 0 },
};

// === HOVER EFFECTS ===

export const cardHover = {
    whileHover: {
        scale: 1.02,
        borderColor: 'rgba(240, 193, 75, 0.3)',
        boxShadow: '0 0 30px rgba(240, 193, 75, 0.15)',
        transition: { duration: 0.2 },
    },
    whileTap: {
        scale: 0.98,
    },
};

export const buttonHover = {
    whileHover: {
        scale: 1.02,
        y: -2,
        transition: {
            type: 'spring' as const,
            stiffness: 400,
            damping: 25
        },
    },
    whileTap: {
        scale: 0.98,
        y: 0,
    },
};

export const subtleHover = {
    whileHover: {
        scale: 1.01,
        transition: { duration: 0.15 },
    },
    whileTap: {
        scale: 0.99,
    },
};

export const iconHover = {
    whileHover: {
        scale: 1.1,
        rotate: 5,
        transition: { type: 'spring' as const, stiffness: 400, damping: 17 },
    },
    whileTap: {
        scale: 0.9,
    },
};

// === GLOW EFFECTS ===

export const glowPulse: Variants = {
    animate: {
        boxShadow: [
            '0 0 20px rgba(240, 193, 75, 0.2)',
            '0 0 40px rgba(240, 193, 75, 0.4)',
            '0 0 20px rgba(240, 193, 75, 0.2)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

export const glowPulseRed: Variants = {
    animate: {
        boxShadow: [
            '0 0 20px rgba(196, 30, 58, 0.2)',
            '0 0 40px rgba(196, 30, 58, 0.4)',
            '0 0 20px rgba(196, 30, 58, 0.2)',
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// === NUMBER CHANGE ANIMATION ===

export const numberIncrease = {
    initial: { scale: 1, color: 'inherit' },
    animate: {
        scale: [1, 1.15, 1],
        color: ['inherit', '#22C55E', 'inherit'],
        transition: { duration: 0.4 },
    },
};

export const numberDecrease = {
    initial: { scale: 1, color: 'inherit' },
    animate: {
        scale: [1, 1.15, 1],
        color: ['inherit', '#EF4444', 'inherit'],
        transition: { duration: 0.4 },
    },
};

// === MODAL ANIMATIONS ===

export const modalBackdrop: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

export const modalContent: Variants = {
    initial: { scale: 0.95, opacity: 0, y: 20 },
    animate: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        scale: 0.95,
        opacity: 0,
        y: 20,
        transition: { duration: 0.2 },
    },
};

export const modalSlideUp: Variants = {
    initial: { y: '100%', opacity: 0 },
    animate: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
        },
    },
    exit: {
        y: '100%',
        opacity: 0,
        transition: { duration: 0.2 },
    },
};

// === LIST ITEM ANIMATIONS ===

export const listItem: Variants = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
};

export const gridItem: Variants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
};

// === SHIMMER / LOADING ===

export const shimmer: Variants = {
    animate: {
        backgroundPosition: ['200% 0', '-200% 0'],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
        },
    },
};

// === SPRING CONFIGS ===

export const springBouncy: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 17,
};

export const springSmooth: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
};

export const springStiff: Transition = {
    type: 'spring',
    stiffness: 500,
    damping: 35,
};

// === UTILITY FUNCTIONS ===

export function createStaggerDelay(index: number, baseDelay = 0.05): number {
    return index * baseDelay;
}

export function createFadeInUpWithDelay(delay: number): Variants {
    return {
        initial: { opacity: 0, y: 16 },
        animate: {
            opacity: 1,
            y: 0,
            transition: { delay },
        },
        exit: { opacity: 0, y: -8 },
    };
}
