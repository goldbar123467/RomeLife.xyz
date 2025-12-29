// ============================================
// ROME EMPIRE BUILDER - Recharts Theme
// Consistent styling for all charts
// ============================================

export const CHART_COLORS = {
    // Primary
    gold: '#F0C14B',
    goldDim: 'rgba(240, 193, 75, 0.3)',
    goldBright: '#FFD700',

    // Accent
    red: '#C41E3A',
    redDim: 'rgba(196, 30, 58, 0.3)',

    // Status
    green: '#22C55E',
    greenDim: 'rgba(34, 197, 94, 0.3)',
    blue: '#3B82F6',
    blueDim: 'rgba(59, 130, 246, 0.3)',
    purple: '#8B5CF6',
    purpleDim: 'rgba(139, 92, 246, 0.3)',
    orange: '#F97316',
    orangeDim: 'rgba(249, 115, 22, 0.3)',

    // Neutral
    text: '#E5E5E5',
    muted: '#6B7280',
    line: '#1A1A1A',
    bg: '#030303',
    paper: '#080808',
};

// Chart color palette for multi-series
export const CHART_PALETTE = [
    CHART_COLORS.gold,
    CHART_COLORS.green,
    CHART_COLORS.blue,
    CHART_COLORS.purple,
    CHART_COLORS.orange,
    CHART_COLORS.red,
];

// Tooltip styling
export const tooltipStyle = {
    contentStyle: {
        backgroundColor: 'rgba(8, 8, 8, 0.95)',
        border: `1px solid ${CHART_COLORS.goldDim}`,
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    },
    labelStyle: {
        color: CHART_COLORS.gold,
        fontWeight: 600,
        marginBottom: '4px',
    },
    itemStyle: {
        color: CHART_COLORS.text,
        fontSize: '14px',
    },
};

// Grid styling
export const gridStyle = {
    strokeDasharray: '3 3',
    stroke: CHART_COLORS.line,
    strokeOpacity: 0.5,
};

// Axis styling
export const axisStyle = {
    stroke: CHART_COLORS.line,
    tick: {
        fill: CHART_COLORS.muted,
        fontSize: 12,
    },
    axisLine: {
        stroke: CHART_COLORS.line,
    },
};

// Area chart gradient definitions
export const areaGradients = {
    gold: {
        id: 'goldGradient',
        stops: [
            { offset: '0%', color: CHART_COLORS.gold, opacity: 0.4 },
            { offset: '100%', color: CHART_COLORS.gold, opacity: 0.05 },
        ],
    },
    green: {
        id: 'greenGradient',
        stops: [
            { offset: '0%', color: CHART_COLORS.green, opacity: 0.4 },
            { offset: '100%', color: CHART_COLORS.green, opacity: 0.05 },
        ],
    },
    red: {
        id: 'redGradient',
        stops: [
            { offset: '0%', color: CHART_COLORS.red, opacity: 0.4 },
            { offset: '100%', color: CHART_COLORS.red, opacity: 0.05 },
        ],
    },
};

// Common chart container props
export const chartContainerStyle = {
    className: 'w-full',
    style: {
        fontSize: '12px',
    },
};

// Legend styling
export const legendStyle = {
    wrapperStyle: {
        paddingTop: '16px',
    },
    iconType: 'circle' as const,
    iconSize: 8,
};

// Animation config
export const animationConfig = {
    animationDuration: 800,
    animationEasing: 'ease-out' as const,
};
