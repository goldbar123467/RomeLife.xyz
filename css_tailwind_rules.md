# Project CSS & Tailwind Configuration Rules

This document outlines the design tokens, colors, and component styles extracted from the project. Use this configuration to maintain visual consistency across the application.

## 1. Tailwind Configuration (`tailwind.config.js`)

Add these values to your `tailwind.config.js` `theme.extend` object.

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Core Theme Colors
        bg: '#f6f1e6',
        paper: '#fffdf7',
        ink: '#232323',
        muted: '#6b7280',
        line: '#e6dccb',
        
        // Roman Theme Colors
        'roman-red': '#7a1f1f',
        'roman-red-dark': '#5e1818', // Derived from btn-primary borders
        'roman-red-hover': '#8e2a2a',
        'roman-gold': '#b8860b',
        accent: '#7a3b00',
        
        // Game Mechanics Colors
        trade: '#2563eb',
        military: '#dc2626',
        settlement: '#16a34a',
        
        // Rarity Colors
        'rarity-common': '#6b7280',
        'rarity-uncommon': '#16a34a',
        'rarity-rare': '#2563eb',
        'rarity-epic': '#9333ea',
        'rarity-legendary': '#ea580c',
        'rarity-imperial': '#dc2626',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Ubuntu', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '22px', // Used for cards and headers
      },
      boxShadow: {
        'card': '0 6px 18px rgba(0,0,0,.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,.1)',
        'btn': '0 1px 3px rgba(0,0,0,.05)',
        'btn-hover': '0 4px 8px rgba(0,0,0,.1)',
        'btn-primary': '0 2px 0 #5e1818, 0 4px 8px rgba(122,31,31,.2)',
        'btn-primary-hover': '0 2px 0 #5e1818, 0 6px 12px rgba(122,31,31,.3)',
        'btn-success': '0 2px 0 #15803d, 0 4px 8px rgba(22,163,74,.2)',
        'imperial-glow': '0 0 12px rgba(234,88,12,0.5)',
      },
      backgroundImage: {
        'roman-pattern': `
          radial-gradient(rgba(184,134,11,.06) 1px, transparent 1px),
          radial-gradient(rgba(122,31,31,.05) 1px, transparent 1px),
          linear-gradient(180deg,#fbf8f1,#f6f1e6)
        `,
        'header-gradient': 'linear-gradient(180deg,#fff8ef,#fcf7ea)',
        'milestone-gradient': 'linear-gradient(135deg,#fef3c7,#fde68a)',
        'info-gradient': 'linear-gradient(135deg,#eff6ff,#e0f2fe)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite',
        'milestone-glow': 'milestoneGlow 2s ease-in-out infinite',
        'imperial-glow': 'imperialGlow 2s ease-in-out infinite',
        'bounce-slow': 'bounce 1s ease infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        milestoneGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(184,134,11,.3)' },
          '50%': { boxShadow: '0 0 20px rgba(184,134,11,.6)' },
        },
        imperialGlow: {
          '0%, 100%': { textShadow: '0 0 4px rgba(220,38,38,0.5)' },
          '50%': { textShadow: '0 0 8px rgba(220,38,38,0.8), 0 0 12px rgba(234,88,12,0.5)' },
        }
      }
    },
  },
}
```

## 2. Common Components

### Card
Standard content container.
```html
<div class="bg-paper border border-line rounded-3xl p-4 shadow-card mb-3 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
  <!-- Content -->
</div>
```

### Header
Top navigation/title bar.
```html
<header class="flex gap-3 items-center bg-header-gradient border border-line p-3.5 rounded-3xl outline-double outline-3 outline-roman-gold shadow-[0_4px_12px_rgba(184,134,11,.15)] mb-4">
  <h1 class="text-[26px] m-0 font-black text-roman-red drop-shadow-[1px_1px_0_rgba(255,255,255,.5)]">
    Title
  </h1>
</header>
```

### Primary Button (Roman Red)
Main action button.
```html
<button class="bg-roman-red text-white border-roman-red-dark px-3.5 py-2.5 rounded-xl font-extrabold text-sm shadow-btn-primary transition-all active:translate-y-0 hover:bg-roman-red-hover hover:-translate-y-0.5 hover:shadow-btn-primary-hover disabled:opacity-50 disabled:cursor-not-allowed">
  Action
</button>
```

### Success Button (Green)
For positive actions (e.g., buying).
```html
<button class="bg-settlement text-white border-[#15803d] shadow-btn-success ...">
  Purchase
</button>
```

### Pills & Tags
Small inline indicators.
```html
<!-- Pill -->
<div class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[13px] font-bold border border-line bg-white transition-transform hover:scale-105 hover:shadow-md">
  Content
</div>

<!-- Tag -->
<span class="inline-block text-xs px-2 py-1 rounded-full border border-line bg-white">
  Tag
</span>
```

### Territory Map Item
The hexagonal-like map shapes.
```css
/* Custom Clip Path definition recommended in global CSS or utility */
.clip-territory {
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}
```
```html
<div class="relative w-[140px] h-[160px] clip-territory border-[3px] border-gray-300 p-4 text-center cursor-pointer flex flex-col justify-center items-center transition-all duration-300 hover:scale-105 hover:rotate-2 hover:shadow-xl hover:z-10 bg-gray-100">
  <!-- Territory Content -->
</div>
```
