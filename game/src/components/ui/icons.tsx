// ============================================
// ROME EMPIRE BUILDER - Icon System
// Lucide React icons + mappings
// ============================================

import {
    // Resources
    Wheat,
    Sword,
    TreePine,
    Mountain,
    Circle,
    Sparkles,
    Wine,
    Droplet,
    Flame,
    Coins,
    Users,
    Church,
    Beef,

    // Tabs / Navigation
    LayoutDashboard,
    Package,
    Landmark,
    Scale,
    Swords,
    Map,
    Home,
    Handshake,
    ScrollText,
    Zap,
    Trophy,
    Castle,

    // Actions
    Plus,
    Minus,
    X,
    Check,
    ChevronRight,
    ChevronLeft,
    ChevronUp,
    ChevronDown,
    ArrowRight,
    ArrowLeft,

    // Status
    AlertTriangle,
    Info,
    CheckCircle,
    XCircle,
    Clock,

    // Military
    Shield,
    Target,
    Flag,
    Crown,

    // Economy
    TrendingUp,
    TrendingDown,
    Wallet,
    Receipt,
    PiggyBank,

    // Building
    Hammer,
    Wrench,
    Factory,
    Store,

    // Nature / Seasons
    Sun,
    Snowflake,
    Leaf,
    Flower2,

    // Misc
    Settings,
    Menu,
    MoreHorizontal,
    Search,
    Filter,
    Eye,
    EyeOff,
    Heart,
    Star,
    ExternalLink,
    RefreshCw,
    RotateCcw,
    Lock,
    Unlock,

    // Types
    type LucideIcon,
} from 'lucide-react';

import type { ResourceType, Tab, Season } from '@/core/types';

// === RESOURCE ICONS ===

export const RESOURCE_ICONS: Record<ResourceType, LucideIcon> = {
    grain: Wheat,
    iron: Sword,
    timber: TreePine,
    stone: Mountain,
    clay: Circle,
    wool: Circle, // TODO: Custom sheep/wool icon
    salt: Sparkles,
    livestock: Beef,
    wine: Wine,
    olive_oil: Droplet,
    spices: Flame,
};

// === TAB ICONS ===

export const TAB_ICONS: Record<Tab, LucideIcon> = {
    overview: LayoutDashboard,
    resources: Package,
    economy: Coins,
    trade: Scale,
    military: Swords,
    map: Map,
    settlement: Home,
    diplomacy: Handshake,
    technology: ScrollText,
    religion: Zap,
    achievements: Trophy,
    wonders: Castle,
    quests: Flag,
    senate: Landmark,
};

// === SEASON ICONS ===

export const SEASON_ICONS: Record<Season, LucideIcon> = {
    spring: Flower2,
    summer: Sun,
    autumn: Leaf,
    winter: Snowflake,
};

// === STATUS ICONS ===

export const STATUS_ICONS = {
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    info: Info,
    loading: RefreshCw,
} as const;

// === TREND ICONS ===

export const TREND_ICONS = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
} as const;

// === ACTION ICONS ===

export const ACTION_ICONS = {
    add: Plus,
    remove: Minus,
    close: X,
    confirm: Check,
    menu: Menu,
    more: MoreHorizontal,
    settings: Settings,
    search: Search,
    filter: Filter,
    refresh: RefreshCw,
    undo: RotateCcw,
} as const;

// === NAVIGATION ICONS ===

export const NAV_ICONS = {
    left: ChevronLeft,
    right: ChevronRight,
    up: ChevronUp,
    down: ChevronDown,
    back: ArrowLeft,
    forward: ArrowRight,
    external: ExternalLink,
} as const;

// === MILITARY ICONS ===

export const MILITARY_ICONS = {
    attack: Swords,
    defense: Shield,
    troops: Users,
    morale: Heart,
    supplies: Package,
    victory: Trophy,
    defeat: XCircle,
    fort: Castle,
    target: Target,
    flag: Flag,
} as const;

// === ECONOMY ICONS ===

export const ECONOMY_ICONS = {
    coins: Coins,
    income: TrendingUp,
    expense: TrendingDown,
    wallet: Wallet,
    tax: Receipt,
    savings: PiggyBank,
    trade: Scale,
} as const;

// === BUILDING ICONS ===

export const BUILDING_ICONS = {
    build: Hammer,
    upgrade: Wrench,
    production: Factory,
    market: Store,
    housing: Home,
    temple: Church,
    barracks: Shield,
    landmark: Landmark,
} as const;

// === RELIGION ICONS ===

export const GOD_ICONS = {
    jupiter: Zap,
    mars: Swords,
    venus: Heart,
    ceres: Wheat,
    mercury: Coins,
    minerva: ScrollText,
} as const;

// === HELPER COMPONENTS ===

export {
    // Re-export commonly used icons for direct import
    Coins,
    Users,
    Swords,
    Heart,
    Shield,
    Trophy,
    Star,
    Crown,
    Map,
    Home,
    Package,
    Wheat,
    TrendingUp,
    TrendingDown,
    Plus,
    Minus,
    X,
    Check,
    ChevronRight,
    ChevronLeft,
    AlertTriangle,
    Info,
    CheckCircle,
    Settings,
    Menu,
    Search,
    RefreshCw,
    Clock,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    ExternalLink,
};

// Type export
export type { LucideIcon };
