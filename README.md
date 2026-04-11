# Rome.Life - Empire Builder

<div align="center">

![Rome.Life Banner](https://img.shields.io/badge/Rome.Life-Empire%20Builder-gold?style=for-the-badge&labelColor=8B0000)

**A turn-based Roman empire simulation game built with Next.js 14 and PostgreSQL**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Tests-2EAD33?style=flat-square&logo=playwright)](https://playwright.dev/)

[Play Now](#getting-started) | [Features](#features) | [Game Guide](#game-systems) | [Database](#database--analytics) | [API](#api-endpoints)

</div>

---

## Overview

Rome.Life is a strategic empire-building game where you guide Rome from a small settlement to a mighty empire. Manage resources, command legions, appease the gods, navigate Senate politics, and conquer the known world.

Built with modern web technologies featuring a sleek dark UI with Roman gold accents, smooth animations, deep strategic gameplay, and a PostgreSQL backend that tracks every season of every playthrough for analytics and replay.

---

## Features

### Core Systems

- **Seasonal Gameplay** - Spring, Summer, Autumn, Winter cycles affect production and strategy
- **Resource Management** - Balance denarii, grain, population, troops, and happiness
- **Territory Conquest** - Expand your empire through military campaigns with capped battle odds
- **Technology Tree** - Research 20+ technologies across military, economic, and cultural paths
- **Religion System** - Worship 6 Roman gods (Jupiter, Mars, Venus, Ceres, Mercury, Minerva) with unified blessing effects across 4 tiers (25/50/75/100 favor)
- **Wonder Construction** - Build 8 magnificent wonders for unique bonuses (scaled by empire size)
- **Diplomacy** - Send envoys to foreign factions, track relations, manage active missions
- **Random Events** - 20+ dynamic events with grace periods, cooldowns, conditional triggers, and effect scaling
- **Victory Conditions** - 5 unique paths to victory

### Senate System

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
- **Consequences** - Negative relations below -30 trigger penalties (morale, happiness, piety, income, reputation)
- **Assassination Risk** - Neglect the wrong senator at your peril
- **Global Event Modal** - Senate events appear regardless of which tab you're on

### Territory & Governors

- **9 Building Types** - Garrison, Walls, Arena, Temple, Census Office, Market, Farm Complex, Aqueduct, Library
- **5 Governors** - Each with unique bonuses and maluses for stability, happiness, morale, piety
- **4 Territory Focus Types** - Production, Defense, Trade, Breadbasket
- **Stability System** - Garrison of 20+ troops stabilizes territories; events trigger based on stability thresholds

### Database & Analytics

Every season is persisted to PostgreSQL for replay, debugging, and cross-game analytics:

- **Season Snapshots** - Full JSON game state + extracted key metrics per round
- **Event Logging** - Categorized events (treasury, battle, senate, religion, trade, territory, crisis)
- **System Health Stats** - Economy, military, religion, stability, food tracked per round
- **Cross-game Analytics** - Win rates, average defeat round, common failure patterns, risk assessment

### Visual Design

- Dark glassmorphism UI with Roman gold (#F0C14B) and crimson (#8B0000) accents
- Smooth Framer Motion animations
- Fully responsive mobile design (390px+ with bottom nav, touch targets, compact charts)
- Terminal-inspired aesthetic with modern polish

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL 14+

### Installation

```bash
# Clone the repository
git clone https://github.com/goldbar123467/RomeLife.xyz.git
cd RomeLife.xyz/game

# Install dependencies
bun install

# Set up PostgreSQL
createdb romelife
createuser romeuser -P  # password: romepass

# Create .env.local
cat > .env.local << 'EOF'
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=romelife
PGUSER=romeuser
PGPASSWORD=romepass
EOF

# Run database migration
psql -U romeuser -h 127.0.0.1 -d romelife -f drizzle/0000_peaceful_madame_masque.sql

# Start development server
bun dev

# Open http://localhost:3000
```

### Build for Production

```bash
bun run build
bun start
```

---

## Game Systems

### Resources

| Resource | Description |
|----------|-------------|
| **Denarii** | Currency for buildings, troops, and upgrades |
| **Grain** | Food supply - starvation leads to collapse |
| **Population** | Workers and tax base (3.5% base growth rate) |
| **Troops** | Military strength for conquest |
| **Happiness** | Public satisfaction (0-100, capped) |
| **Morale** | Army effectiveness in battle (0-100, capped) |
| **Reputation** | Standing with the world (0-100, capped) |
| **Piety** | Religious standing with the gods |
| **Supplies** | Military upkeep resource |

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
- **Assassination** - A senator eliminates you

### God Blessings (24 effects)

Each of the 6 gods has 4 tiers of blessings unlocked at 25, 50, 75, and 100 favor:

| God | Focus | Tier 100 Ultimate |
|-----|-------|-------------------|
| **Jupiter** | Battle strength, morale | All god blessings active simultaneously |
| **Mars** | Recruitment, attack, supplies | -30% battle casualties |
| **Venus** | Happiness, population, trade | +50 favor with all gods per season |
| **Ceres** | Grain, food production | Complete famine immunity |
| **Mercury** | Trade prices, tariffs, caravans | -50% trade risk |
| **Minerva** | Tech costs, building efficiency | +20 patron favor per season |

---

## API Endpoints

The game exposes REST endpoints for state persistence and analytics:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/game/save` | POST | Save season snapshot + events + stats |
| `/api/game/load?gameId=xxx` | GET | Load latest state for a game |
| `/api/game/load` | POST | Load a specific round (replay/rollback) |
| `/api/game/list` | GET | List all saved games with latest stats |
| `/api/game/history?gameId=xxx` | GET | Full timeline with peak stats and event breakdown |
| `/api/game/analytics` | GET | Cross-game analytics (win rate, defeat patterns) |
| `/api/game/analytics?gameId=xxx` | GET | Per-game risk assessment |

### Example: Game Analytics Response

```json
{
  "overview": {
    "totalGames": 12,
    "victories": 3,
    "defeats": 8,
    "winRate": "27.3%"
  },
  "timing": {
    "avgDefeatRound": 19,
    "avgVictoryRound": 34
  },
  "defeatReasons": [
    { "reason": "famine", "count": 4 },
    { "reason": "unrest", "count": 3 }
  ]
}
```

---

## Database Schema

4 PostgreSQL tables managed via Drizzle ORM:

```
games                    season_snapshots           events_log              system_stats
|- id (uuid PK)          |- id (serial PK)          |- id (serial PK)       |- id (serial PK)
|- founder               |- game_id (FK)            |- game_id (FK)         |- game_id (FK)
|- patron_god            |- round + season           |- round + season        |- round
|- status                |- denarii, population     |- category             |- net_income
|- victory_type          |- happiness, morale       |- event_type           |- total_favor
|- defeat_reason         |- troops, reputation      |- message              |- avg_senator_relation
|- current_round         |- territories_owned       |- effects (jsonb)      |- avg_stability
|- created_at            |- full_state (jsonb)      '- created_at           |- grain_stock
'- updated_at            '- created_at                                      '- is_starving
```

---

## Project Structure

```
game/
├── src/
│   ├── app/
│   │   ├── api/game/         # REST API routes (save/load/history/analytics)
│   │   ├── usecases/         # Season processing, trade, recruitment, diplomacy
│   │   ├── page.tsx          # Entry point
│   │   └── globals.css       # Global styles + mobile utilities
│   ├── components/
│   │   ├── game/             # 14 panel components (GameLayout, MapPanel, etc.)
│   │   ├── senate/           # Senate UI components
│   │   ├── battle/           # Battle animations
│   │   └── ui/               # GlassCard, Button, Badge, BellCurve, etc.
│   ├── core/
│   │   ├── constants/        # Game constants, religion, territory, events, senate
│   │   ├── types/            # TypeScript interfaces (GameState ~49 fields)
│   │   ├── rules/            # Victory/failure, achievements, techs, wonders
│   │   └── math/             # Production, battle, consumption, stability calcs
│   ├── db/
│   │   ├── schema.ts         # Drizzle ORM table definitions
│   │   └── index.ts          # PostgreSQL connection pool
│   ├── store/
│   │   └── gameStore.ts      # Zustand store (~1900 lines) with DB sync
│   ├── hooks/                # useMobile viewport detection
│   └── lib/
│       ├── dbSync.ts         # Client-side DB sync (non-blocking)
│       ├── animations.ts     # Framer Motion variants
│       └── battleAnimations.ts
├── drizzle/                  # SQL migrations
├── tests/                    # Playwright E2E tests (60+ tests)
└── playwright.config.ts
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | PostgreSQL 16 + Drizzle ORM |
| **State** | Zustand with localStorage + PostgreSQL persistence |
| **Styling** | Tailwind CSS 3.4 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Testing** | Playwright (60+ E2E tests) |

---

## Development

### Commands

```bash
bun dev          # Start development server
bun run build    # Production build (must pass with zero errors)
bun run lint     # Run ESLint
bun run start    # Start production server
```

### Running Tests

```bash
# Install Playwright browsers (first time)
npx playwright install chromium

# Run all tests
npx playwright test --project=chromium

# Run specific test suites
npx playwright test audit-fixes          # Bug fix verification (17 tests)
npx playwright test bug-fixes-audit-v2   # Latest audit fixes (17 tests)
npx playwright test db-sync              # Database sync pipeline (3 tests)
npx playwright test game-systems         # Core game systems (26 tests)
npx playwright test victory-playthrough  # Full 50-round playthrough (1 test)
```

### Architecture Notes

- State management uses Zustand with dual persistence: localStorage (instant) + PostgreSQL (durable)
- Game logic is separated into `usecases/` for testability
- Senate system uses state machine pattern for senator AI
- All calculations are in `core/math/` for easy balancing
- DB sync is non-blocking - the game never waits for a database write
- Blessing system uses a single canonical source of truth (`BLESSING_EFFECTS` in `religion.ts`)
- All bounded stats (happiness, morale, reputation) are clamped to 0-100

### Bug Fix History

28 bugs fixed across 5 QA rounds:

| Severity | Count | Key Issues Fixed |
|----------|-------|-----------------|
| Critical | 8 | Senate event blocking, dual blessing system, worship having no effect |
| High | 10 | Reputation uncapped, battle odds overflow, envoy counter leak |
| Medium | 7 | Census Office trap, territory events, population growth |
| Low | 3 | Stability docs, caravan winter exploit, growth formula |

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Before Submitting

```bash
bun run build                                    # Must pass
npx playwright test --project=chromium           # Tests must pass
```

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
