import { toast } from 'sonner';
import {
    Swords,
    Skull,
    Coins,
    Landmark,
    Map,
    AlertTriangle,
    Church,
    ScrollText,
    Scale,
    Sword,
    Flower2,
    Sun,
    Leaf,
    Snowflake,
    Calendar,
    Download,
    Upload,
} from 'lucide-react';

// Icon wrapper for consistent sizing and styling
const ToastIcon = ({ icon: Icon, className = '' }: { icon: React.ElementType; className?: string }) => (
    <Icon size={18} className={className} />
);

// Roman-themed toast notifications with Lucide icons
export const gameToast = {
    victory: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: <ToastIcon icon={Swords} className="text-roman-gold" />,
            duration: 4000,
        });
    },

    defeat: (title: string, description?: string) => {
        toast.error(title, {
            description,
            icon: <ToastIcon icon={Skull} className="text-red-400" />,
            duration: 4000,
        });
    },

    gold: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: <ToastIcon icon={Coins} className="text-roman-gold" />,
            duration: 3000,
        });
    },

    building: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: <ToastIcon icon={Landmark} className="text-roman-gold" />,
            duration: 3000,
        });
    },

    territory: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: <ToastIcon icon={Map} className="text-roman-gold" />,
            duration: 4000,
        });
    },

    warning: (title: string, description?: string) => {
        toast.warning(title, {
            description,
            icon: <ToastIcon icon={AlertTriangle} className="text-amber-400" />,
            duration: 4000,
        });
    },

    danger: (title: string, description?: string) => {
        toast.error(title, {
            description,
            icon: <ToastIcon icon={AlertTriangle} className="text-red-500" />,
            duration: 5000,
        });
    },

    religion: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: <ToastIcon icon={Church} className="text-purple-400" />,
            duration: 3000,
        });
    },

    event: (title: string, description?: string, isPositive = true) => {
        if (isPositive) {
            toast.success(title, {
                description,
                icon: <ToastIcon icon={ScrollText} className="text-roman-gold" />,
                duration: 4000,
            });
        } else {
            toast.error(title, {
                description,
                icon: <ToastIcon icon={ScrollText} className="text-red-400" />,
                duration: 4000,
            });
        }
    },

    season: (season: string, round: number) => {
        const seasonIcons: Record<string, React.ElementType> = {
            spring: Flower2,
            summer: Sun,
            autumn: Leaf,
            winter: Snowflake,
        };
        const seasonColors: Record<string, string> = {
            spring: 'text-pink-400',
            summer: 'text-amber-400',
            autumn: 'text-orange-400',
            winter: 'text-cyan-400',
        };
        const SeasonIcon = seasonIcons[season] || Calendar;
        const colorClass = seasonColors[season] || 'text-gray-400';

        toast(season.charAt(0).toUpperCase() + season.slice(1), {
            description: `Year ${Math.floor(round / 4) + 1}, Round ${round}`,
            icon: <ToastIcon icon={SeasonIcon} className={colorClass} />,
            duration: 2500,
        });
    },

    trade: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: <ToastIcon icon={Scale} className="text-roman-gold" />,
            duration: 3000,
        });
    },

    recruit: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: <ToastIcon icon={Sword} className="text-roman-gold" />,
            duration: 3000,
        });
    },

    save: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: <ToastIcon icon={Download} className="text-roman-gold" />,
            duration: 2500,
        });
    },

    load: (title: string, description?: string) => {
        toast.success(title, {
            description,
            icon: <ToastIcon icon={Upload} className="text-roman-gold" />,
            duration: 2500,
        });
    },
};
