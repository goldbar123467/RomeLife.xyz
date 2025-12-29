# Rome.Life - Empire Builder

<div align="center">

![Rome.Life Banner](https://img.shields.io/badge/Rome.Life-Empire%20Builder-gold?style=for-the-badge&labelColor=8B0000)

**A turn-based Roman empire simulation game built with Next.js 14**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-Animations-FF0055?style=flat-square&logo=framer)](https://www.framer.com/motion/)

[Play Now](#getting-started) | [Features](#features) | [Game Guide](#game-systems)

</div>

---

## Overview

Rome.Life is a strategic empire-building game where you guide Rome from a small settlement to a mighty empire. Manage resources, command legions, appease the gods, navigate Senate politics, and conquer the known world.

Built with modern web technologies featuring a sleek dark UI with Roman gold accents, smooth animations, and deep strategic gameplay.

---

## Features

### Core Systems

- **Seasonal Gameplay** - Spring, Summer, Autumn, Winter cycles affect production and strategy
- **Resource Management** - Balance denarii, grain, population, troops, and happiness
- **Territory Conquest** - Expand your empire through military campaigns
- **Technology Tree** - Research 20+ technologies across military, economic, and cultural paths
- **Religion System** - Worship 6 Roman gods (Jupiter, Mars, Venus, Ceres, Mercury, Minerva) and unlock powerful blessings
- **Wonder Construction** - Build 8 magnificent wonders for unique bonuses
- **Random Events** - 20+ dynamic events that respond to your empire's state
- **Victory Conditions** - 5 unique paths to victory

### Senate System (V2)

The political layer adds depth with 5 unique senators:

| Senator | Role | Personality |
|---------|------|-------------|
| **Sertorius** | Military Loyalist | Honorable veteran who values loyalty |
| **Sulla** | Ambitious General | Calculating commander seeking power |
| **Clodius** | Mob Boss | Street politician with populist support |
| **Pulcher** | Religious Authority | Temple keeper interpreting divine will |
| **Oppius** | Spymaster | Information broker who knows all secrets |

- **Attention Allocation** - Distribute 100 points per season among senators
- **State Machine AI** - Each senator has unique behavior patterns and reactions
- **Delayed Consequences** - Actions ripple across relationships over time
- **Assassination Risk** - Neglect the wrong senator at your peril

### Visual Design

- Dark glassmorphism UI with Roman gold (#F0C14B) and crimson (#8B0000) accents
- Smooth Framer Motion animations
- Responsive design for desktop and tablet
- Terminal-inspired aesthetic with modern polish

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/goldbar123467/RomeLife.xyz.git
cd RomeLife.xyz

# Install dependencies
cd game
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## Game Systems

### Resources

| Resource | Description |
|----------|-------------|
| **Denarii** | Currency for buildings, troops, and upgrades |
| **Grain** | Food supply - starvation leads to collapse |
| **Population** | Workers and tax base |
| **Troops** | Military strength for conquest |
| **Happiness** | Public satisfaction - low happiness causes unrest |
| **Morale** | Army effectiveness in battle |
| **Piety** | Religious standing with the gods |

### Victory Conditions

1. **Eternal City** - 10 territories, 500 population, 75% happiness
2. **Commerce Empire** - 15,000 denarii, 35 reputation
3. **Military Conqueror** - 8 territories, 180 troops
4. **Glory of Rome** - 350 population, 90% happiness
5. **Industrial Power** - 15 buildings, 10,000 denarii

### Failure Conditions

- **Famine** - 2 consecutive seasons of starvation
- **Collapse** - Population falls below 40
- **Unrest** - Happiness drops to 25% or below
- **Assassination** - A senator eliminates you (V2)

---

## Project Structure

```
game/
├── src/
│   ├── app/              # Next.js app router
│   │   └── usecases/     # Game logic functions
│   ├── components/
│   │   ├── game/         # Main game panels
│   │   ├── senate/       # Senate UI components
│   │   ├── battle/       # Battle animations
│   │   └── ui/           # Reusable components
│   ├── core/
│   │   ├── constants/    # Game constants & events
│   │   ├── types/        # TypeScript interfaces
│   │   ├── rules/        # Victory/failure conditions
│   │   └── math/         # Production calculations
│   ├── senate/
│   │   ├── engine/       # State machine logic
│   │   └── events/       # Senator events
│   ├── store/            # Zustand state management
│   └── lib/              # Utilities & animations
└── public/               # Static assets
```

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **State**: Zustand with persist middleware
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts

---

## Development

### Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

### Architecture Notes

- State management uses Zustand with localStorage persistence
- Game logic is separated into `usecases/` for testability
- Senate system uses state machine pattern for senator AI
- All calculations are in `core/math/` for easy balancing

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Inspired by classic city-builder and empire games
- Roman historical references for authenticity
- Built with modern web technologies for performance

---

<div align="center">

**Ave Caesar! Build your eternal empire.**

Made with dedication to the glory of Rome

</div>
