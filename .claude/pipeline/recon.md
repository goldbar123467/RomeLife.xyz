# Pipeline Reconnaissance — RomeLife.xyz

**Generated**: Auto-detected by Stage 1 reconnaissance  
**Repo root**: `/home/user/RomeLife.xyz`  
**Game root**: `/home/user/RomeLife.xyz/game`

---

## Engine & Framework

| Property | Value |
|----------|-------|
| **Engine** | None (no Phaser/Pixi/Kaboom/Canvas gameplay engine) |
| **Framework** | Next.js 14.2.35 + React 18 |
| **Rendering** | React DOM components + Framer Motion animations |
| **Canvas usage** | WebGL shader for decorative lightning effect only (`components/effects/Lightning.tsx`) — not gameplay |
| **Game type** | Turn-based Roman empire builder (strategy/simulation) |
| **Game loop** | None — turn-based via `endSeason()` action in Zustand store |

## Build Tooling

| Property | Value |
|----------|-------|
| **Bundler** | Next.js (built-in Webpack) |
| **Package manager** | bun / npm |
| **Dev command** | `cd game && bun dev` or `npm run dev` → `next dev` |
| **Build command** | `bun run build` → `next build` |
| **TypeScript** | Yes, strict mode, path alias `@/*` |
| **CSS** | Tailwind CSS 3.4.1 + `tailwindcss-animate` |

## Art Style

**Classification: UI-driven / Illustrative PNG — NOT pixel-art, NOT vector**

Evidence:
- 152 PNG assets in `game/public/assets/` (architecture, flags, military, misc, people, kenney board-game icons)
- 2 JPG backdrops (colosseum-night.jpg, rome-cityscape.jpg)
- No `image-rendering: pixelated` or `crisp-edges` in any CSS file
- No spritesheet atlases, no `.aseprite`, no `.ase` files
- No palette files (`.pal`, `.gpl`)
- Primary graphics are Lucide React icons (62+ used) with PNG fallbacks via `GameImage.tsx`
- Asset sizes range from small icons to decorative illustrations — no integer-scaled pixel art detected

**Rubric gate**: All downstream agents use **illustrative/UI rubrics**, not pixel-art rubrics.

## Tilemap / Level Structure

| Property | Value |
|----------|-------|
| **Tilemap format** | None — no `.tmx`, `.tmj`, or grid-based maps |
| **Map system** | Abstract territory graph (IDs: 'palatine', 'tiber_ford', 'sabine_hills', etc.) |
| **Territory model** | `Territory` type in `core/types/index.ts:64-86` with levels 1-5 |
| **Map UI** | `MapPanel.tsx` — 6 tabs for territory management |

## Scene / Stage Enumeration

```typescript
type GameStage = 'intro' | 'founder_select' | 'game' | 'battle' | 'results';
```

14 in-game tabs: overview, resources, economy, trade, military, map, settlement, diplomacy, technology, religion, wonders, quests, achievements, senate.

Flow: Intro → Founder Select (Romulus/Remus) → Patron God → Main Game (turn-based seasons) → Battle (overlay) → Results (victory/defeat).

## Input System

| Property | Value |
|----------|-------|
| **Primary** | React `onClick` handlers across all components |
| **Keyboard** | Space bar → `endSeason()` shortcut (`GameLayout.tsx:32-43`) |
| **Touch/Mobile** | Responsive design, `useMobile` hook, `MobileNav` bottom bar |
| **Gamepad** | None |

No real-time input loop. All interactions are discrete UI clicks or keyboard shortcuts.

## Physics System

None. Turn-based simulation with mathematical formulas for production, consumption, battle odds, population growth. No spatial collision detection.

## Animation System

| Component | Technology |
|-----------|-----------|
| **UI transitions** | Framer Motion 12.23.26 — 56+ presets in `lib/animations.ts` (315 lines) |
| **Battle effects** | Framer Motion particle system in `components/battle/BattleParticles.tsx` (357 lines) |
| **CSS animations** | Tailwind keyframes: shimmer, pulse-gold, glow, float, scanline |
| **Page transitions** | Framer Motion `AnimatePresence` |

No frame-based sprite animation. No Canvas animation loop for gameplay.

## Audio

None. No audio files, no Web Audio API, no audio libraries.

## State Management

| Property | Value |
|----------|-------|
| **Library** | Zustand 5.0.9 |
| **Store** | `store/gameStore.ts` (~1,968 lines) |
| **Persistence** | `persist` middleware → localStorage |
| **Database** | PostgreSQL via Drizzle ORM (game save sync) |

## Existing Test Tooling

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.57.0 (E2E only) |
| **Config** | `game/playwright.config.ts` |
| **Projects** | Chromium only, 1920x1080 viewport |
| **Workers** | 1 (serial) |
| **Screenshots** | On always |
| **Video** | On first retry |
| **Dev server** | Auto-starts `npx next dev -p 3000` |
| **Test suites** | 7 files in `game/tests/` |
| **Unit tests** | None |

Test files:
- `victory-playthrough.spec.ts` — full game playthrough
- `game-systems.spec.ts` — system verification
- `game-qa.spec.ts` — QA helpers
- `bug-fix-edge-cases.spec.ts` — regression tests
- `bug-fixes-audit-v2.spec.ts` — audit fixes
- `audit-fixes.spec.ts` — more audit fixes
- `db-sync.spec.ts` — database sync

## Asset Directory Layout

```
game/public/assets/
├── architecture/    (9 PNGs — colosseum, temple, villa, etc.)
├── flags/           (5 PNGs — banners, SPQR)
├── military/        (5 PNGs — helmets, armor, shields)
├── misc/            (20+ PNGs — coins, busts, amphorae, scrolls)
├── people/          (7 PNGs — emperor, legionnaire, senators)
└── kenney/          (100+ PNGs — CC0 board-game style icons)
```

## Seeded / Deterministic Entry Points

- No explicit seed system found in game code
- Random events use `Math.random()` — not seeded
- Battle outcomes use probability calculations with `Math.random()`
- No deterministic replay mode
- **Gap**: Input replay and deterministic seeding not available natively. Capture Engineer must work via Playwright UI automation, not engine-level replay.

---

## Roster Tailoring Rationale

This game deviates massively from a traditional 2D game engine. It is a **turn-based strategy game rendered entirely via React DOM**. The following roster changes are mandatory:

| Default Agent | Tailored Agent | Justification |
|--------------|----------------|---------------|
| Level Cartographer | **Game Flow Cartographer** | No tile levels. Must map game stages, 14 tab panels, state transitions, turn flow. |
| Capture Engineer | **Capture Engineer** (kept, retargeted) | Uses Playwright instead of engine replay. Screenshots per game state, not per level. |
| Sprite & Animation Critic | **Asset & Animation Critic** | No spritesheets/atlases. Reviews PNG assets, Lucide icon usage, Framer Motion timing, CSS animations. |
| Tilemap & Level Critic | **Systems & Balance Critic** | No tilemaps. Reviews game mechanics: production formulas, battle math, economy balance, event probabilities. |
| Game Feel Critic | **Interaction & Responsiveness Critic** | No platformer feel (coyote time, jump buffer irrelevant). Reviews click responsiveness, turn progression, mobile touch targets, state transition smoothness. |
| Readability & Accessibility Critic | **Readability & Accessibility Critic** (kept) | Directly applicable to DOM-based UI. Contrast, colorblind safety, HUD legibility, motion sensitivity. |
| Synthesizer | **Synthesizer** (kept) | Unchanged — merges critiques across agents. |
| Patch Proposer | **Patch Proposer** (kept) | Writes React/TypeScript/Tailwind diffs instead of engine code. |
| Final Validator | **Final Validator** (kept) | Unchanged — evidence auditor with veto power. |

**Removed agents**: None — all 9 retained with role adaptation.  
**Added agents**: None — 9 is sufficient for this game's scope.

### Gaps & Degraded Capabilities

1. **No deterministic seeding**: `Math.random()` used throughout. Capture Engineer captures UI state via Playwright but cannot guarantee identical random outcomes across runs. Mitigated by capturing multiple runs and noting variance.
2. **No frame-timing analysis**: No game loop means no frame budget analysis. Interaction Critic measures Playwright action latency instead.
3. **No input replay logs**: No engine-level replay. Playwright scripts serve as the input replay mechanism.
