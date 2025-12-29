'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ASSET_REGISTRY, isAssetKey, type AssetKey } from '@/lib/assets';
import type { LucideIcon } from 'lucide-react';
import { Package } from 'lucide-react';

// === SIZE VARIANTS ===
const SIZE_VARIANTS = {
    xs: { width: 16, height: 16, iconSize: 12 },
    sm: { width: 24, height: 24, iconSize: 16 },
    md: { width: 32, height: 32, iconSize: 20 },
    lg: { width: 48, height: 48, iconSize: 28 },
    xl: { width: 64, height: 64, iconSize: 36 },
    '2xl': { width: 96, height: 96, iconSize: 48 },
} as const;

export type ImageSize = keyof typeof SIZE_VARIANTS;

// === COMPONENT PROPS ===
export interface GameImageProps {
    /** Asset key from registry OR direct path (starting with /) */
    src: AssetKey | string;
    /** Size variant */
    size?: ImageSize;
    /** Custom width override */
    width?: number;
    /** Custom height override */
    height?: number;
    /** Alt text for accessibility */
    alt?: string;
    /** Additional CSS classes */
    className?: string;
    /** Custom fallback Lucide icon */
    fallbackIcon?: LucideIcon;
    /** Whether to animate on hover */
    animated?: boolean;
    /** Click handler */
    onClick?: () => void;
}

export function GameImage({
    src,
    size = 'md',
    width,
    height,
    alt = 'Game image',
    className = '',
    fallbackIcon,
    animated = false,
    onClick,
}: GameImageProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Determine dimensions
    const sizeConfig = SIZE_VARIANTS[size];
    const finalWidth = width ?? sizeConfig.width;
    const finalHeight = height ?? sizeConfig.height;
    const iconSize = sizeConfig.iconSize;

    // Resolve asset path and fallbacks
    let imagePath: string;
    let FallbackIcon: LucideIcon = fallbackIcon ?? Package;

    if (isAssetKey(src)) {
        const assetInfo = ASSET_REGISTRY[src];
        imagePath = assetInfo.path;
        FallbackIcon = fallbackIcon ?? assetInfo.fallbackIcon;
    } else if (src.startsWith('/')) {
        // Direct path
        imagePath = src;
    } else {
        // Treat as emoji - show fallback immediately
        return (
            <motion.span
                className={`inline-flex items-center justify-center ${className}`}
                style={{ width: finalWidth, height: finalHeight, fontSize: iconSize }}
                whileHover={animated ? { scale: 1.1 } : undefined}
                onClick={onClick}
            >
                {src}
            </motion.span>
        );
    }

    // Handle error - show Lucide icon fallback
    if (hasError) {
        return (
            <motion.span
                className={`inline-flex items-center justify-center ${className}`}
                style={{ width: finalWidth, height: finalHeight }}
                whileHover={animated ? { scale: 1.1 } : undefined}
                onClick={onClick}
            >
                <FallbackIcon
                    size={iconSize}
                    className="text-roman-gold"
                />
            </motion.span>
        );
    }

    const imageElement = (
        <Image
            src={imagePath}
            alt={alt}
            width={finalWidth}
            height={finalHeight}
            className={`object-contain ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
            onLoad={() => setIsLoading(false)}
            onError={() => setHasError(true)}
            priority={size === 'xl' || size === '2xl'}
            unoptimized
        />
    );

    if (animated || onClick) {
        return (
            <motion.span
                className={`inline-flex items-center justify-center ${className}`}
                style={{ width: finalWidth, height: finalHeight }}
                whileHover={animated ? { scale: 1.1, rotate: 3 } : undefined}
                whileTap={onClick ? { scale: 0.95 } : undefined}
                onClick={onClick}
            >
                {imageElement}
            </motion.span>
        );
    }

    return (
        <span
            className={`inline-flex items-center justify-center ${className}`}
            style={{ width: finalWidth, height: finalHeight }}
        >
            {imageElement}
        </span>
    );
}

// === ICON WRAPPER ===
// For cases where you just need the asset displayed inline like an emoji

export interface GameIconProps {
    src: AssetKey | string;
    size?: ImageSize;
    className?: string;
}

export function GameIcon({ src, size = 'sm', className = '' }: GameIconProps) {
    return <GameImage src={src} size={size} className={className} />;
}
