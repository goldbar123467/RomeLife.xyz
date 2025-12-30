import { toast } from 'sonner';

// Roman-themed toast notifications
export const gameToast = {
    victory: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: '⚔️',
            duration: 4000,
        });
    },

    defeat: (title: string, description?: string) => {
        toast.error(title, {
            description,
            icon: '💀',
            duration: 4000,
        });
    },

    gold: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: '🪙',
            duration: 3000,
        });
    },

    building: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: '🏛️',
            duration: 3000,
        });
    },

    territory: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: '🗺️',
            duration: 4000,
        });
    },

    warning: (title: string, description?: string) => {
        toast.warning(title, {
            description,
            icon: '⚠️',
            duration: 4000,
        });
    },

    danger: (title: string, description?: string) => {
        toast.error(title, {
            description,
            icon: '🚨',
            duration: 5000,
        });
    },

    religion: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: '🙏',
            duration: 3000,
        });
    },

    event: (title: string, description?: string, isPositive = true) => {
        if (isPositive) {
            toast.success(title, {
                description,
                icon: '📜',
                duration: 4000,
            });
        } else {
            toast.error(title, {
                description,
                icon: '📜',
                duration: 4000,
            });
        }
    },

    season: (season: string, round: number) => {
        const seasonIcons: Record<string, string> = {
            spring: '🌸',
            summer: '☀️',
            autumn: '🍂',
            winter: '❄️',
        };
        toast(season.charAt(0).toUpperCase() + season.slice(1), {
            description: `Year ${Math.floor(round / 4) + 1}, Round ${round}`,
            icon: seasonIcons[season] || '📅',
            duration: 2500,
        });
    },

    trade: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: '⚖️',
            duration: 3000,
        });
    },

    recruit: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: '🗡️',
            duration: 3000,
        });
    },
};
