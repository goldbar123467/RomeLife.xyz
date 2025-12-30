import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	screens: {
  		xs: '375px',
  		sm: '640px',
  		md: '768px',
  		lg: '1024px',
  		xl: '1280px',
  		'2xl': '1536px'
  	},
  	extend: {
  		colors: {
  			bg: '#030303',
  			paper: '#080808',
  			'paper-light': '#0f0f0f',
  			ink: '#e5e5e5',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			line: '#1a1a1a',
  			'roman-red': '#C41E3A',
  			'roman-red-dark': '#8B0000',
  			'roman-red-hover': '#D42E4A',
  			'roman-gold': '#F0C14B',
  			'roman-gold-bright': '#FFD700',
  			'roman-gold-dim': 'rgba(240, 193, 75, 0.1)',
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			trade: '#2563eb',
  			military: '#dc2626',
  			settlement: '#16a34a',
  			economy: '#eab308',
  			diplomacy: '#8b5cf6',
  			religion: '#f97316',
  			'rarity-common': '#6b7280',
  			'rarity-uncommon': '#16a34a',
  			'rarity-rare': '#2563eb',
  			'rarity-epic': '#9333ea',
  			'rarity-legendary': '#ea580c',
  			'rarity-imperial': '#dc2626',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Outfit',
  				'system-ui',
  				'-apple-system',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			],
  			display: [
  				'Outfit',
  				'system-ui',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			xl: '12px',
  			'2xl': '16px',
  			'3xl': '22px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			card: '0 0 20px rgba(240, 193, 75, 0.05)',
  			'card-hover': '0 0 30px rgba(240, 193, 75, 0.15)',
  			'glow-gold': '0 0 20px rgba(240, 193, 75, 0.3)',
  			'glow-red': '0 0 20px rgba(196, 30, 58, 0.3)',
  			'imperial-glow': '0 0 12px rgba(234, 88, 12, 0.5)',
  			'btn-primary': '0 4px 14px rgba(196, 30, 58, 0.4)',
  			'btn-gold': '0 4px 14px rgba(240, 193, 75, 0.3)'
  		},
  		backgroundImage: {
  			'roman-pattern': '`\n          radial-gradient(rgba(240, 193, 75, 0.03) 1px, transparent 1px),\n          radial-gradient(rgba(196, 30, 58, 0.02) 1px, transparent 1px)\n        `',
  			'glass-gold': 'linear-gradient(135deg, rgba(240, 193, 75, 0.1) 0%, rgba(240, 193, 75, 0.02) 100%)',
  			'glass-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
  			'header-gradient': 'linear-gradient(180deg, rgba(240, 193, 75, 0.1) 0%, transparent 100%)'
  		},
  		animation: {
  			shimmer: 'shimmer 2s infinite',
  			'pulse-gold': 'pulseGold 2s ease-in-out infinite',
  			glow: 'glow 2s ease-in-out infinite alternate',
  			float: 'float 3s ease-in-out infinite',
  			scanline: 'scanline 8s linear infinite',
  			ticker: 'ticker 30s linear infinite'
  		},
  		keyframes: {
  			shimmer: {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			pulseGold: {
  				'0%, 100%': {
  					boxShadow: '0 0 10px rgba(240, 193, 75, 0.3)'
  				},
  				'50%': {
  					boxShadow: '0 0 25px rgba(240, 193, 75, 0.6)'
  				}
  			},
  			glow: {
  				'0%': {
  					opacity: '0.5'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			scanline: {
  				'0%': {
  					transform: 'translateY(-100%)'
  				},
  				'100%': {
  					transform: 'translateY(100%)'
  				}
  			},
  			ticker: {
  				'0%': {
  					transform: 'translateX(0)'
  				},
  				'100%': {
  					transform: 'translateX(-50%)'
  				}
  			}
  		},
  		backdropBlur: {
  			xs: '2px'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
