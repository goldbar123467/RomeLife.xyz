# CLAUDE.md - Rome Empire Builder

This file provides guidance to Claude Code when working with this repository.

---

## Current Status: ✅ V1.0 COMPLETE + Mobile Optimized

The game is a turn-based Roman empire simulation. **All core systems are now fully integrated and working. Mobile view fully optimized.**

### Run the Game
```bash
cd game && bun dev
# Open http://localhost:3000
```

---

## ✅ ALL SYSTEMS COMPLETE (Dec 2024)

All game systems are now fully integrated and working:

| System | Status | Notes |
|--------|--------|-------|
| Results Screen | ✅ COMPLETE | `ResultsScreen.tsx` with `resetGame()` |
| God Blessings (24 effects) | ✅ COMPLETE | All tier 25/50/75/100 effects working |
| Territory Buildings (9 types) | ✅ COMPLETE | Stability, happiness, piety, income, defense |
| Governor Bonuses (5 governors) | ✅ COMPLETE | All bonuses and maluses applied |
| Territory Focus (4 types) | ✅ COMPLETE | Production, defense, trade bonuses |
| Wonder Recurring Income | ✅ COMPLETE | Applies every season |
| Battle System | ✅ COMPLETE | Blessings affect strength, casualties, rewards |
| Random Events | ✅ COMPLETE | Empire + religious + territory events |
| Event Balance | ✅ COMPLETE | Grace period, conditions, cooldowns, scaling |

---

## God Blessing Effects - All Integrated

| God | Tier | Effect | Location |
|-----|------|--------|----------|
| Jupiter | 25 | +10% battle strength | `gameStore.ts` |
| Jupiter | 50 | +100 denarii on victory | `gameStore.ts` |
| Jupiter | 75 | +15% morale | `usecases/index.ts` |
| Jupiter | 100 | All god blessings active | `religion.ts` |
| Mars | 25 | -15% recruit costs | `usecases/index.ts` |
| Mars | 50 | +10% attack | `gameStore.ts` |
| Mars | 75 | +50 supplies/season | `usecases/index.ts` |
| Mars | 100 | -30% casualties | `gameStore.ts` |
| Venus | 25 | +10% happiness | `usecases/index.ts` |
| Venus | 50 | +15% pop growth | `math/index.ts` |
| Venus | 75 | +10% trade prices | `usecases/index.ts` |
| Venus | 100 | +50 favor all gods/season | `usecases/index.ts` |
| Ceres | 25 | +20% grain production | `math/index.ts` |
| Ceres | 50 | +30% all food | `math/index.ts` |
| Ceres | 75 | -25% food consumption | `math/index.ts` |
| Ceres | 100 | Famine immunity | `usecases/index.ts` |
| Mercury | 25 | +10% trade prices | `usecases/index.ts` |
| Mercury | 50 | -20% tariffs | `usecases/index.ts` |
| Mercury | 75 | +25% caravan profit | `usecases/index.ts` |
| Mercury | 100 | -50% trade risk | `usecases/index.ts` |
| Minerva | 25 | -15% tech costs | `usecases/index.ts` |
| Minerva | 50 | +1 free tech/5 rounds | `usecases/index.ts` |
| Minerva | 75 | +25% building efficiency | `usecases/index.ts` |
| Minerva | 100 | +20 favor/season | `usecases/index.ts` |

---

## Project Structure

```
game/src/
├── app/
│   ├── page.tsx                 # Entry point
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles + mobile utilities
│   └── usecases/index.ts        # Season simulation, battles, trade
├── components/
│   ├── game/                    # 14 panel components
│   │   ├── GameLayout.tsx       # Main layout, stage routing
│   │   ├── MobileNav.tsx        # Mobile bottom nav + drawer
│   │   ├── OverviewPanel.tsx    # Dashboard
│   │   ├── MapPanel.tsx         # Territory management (6 tabs)
│   │   ├── ReligionPanel.tsx    # Gods, blessings, worship (3 tabs)
│   │   ├── SenatePanel.tsx      # Political system
│   │   ├── BattleScreen.tsx     # Battle overlay
│   │   └── ...                  # Other panels
│   ├── battle/                  # Battle animations
│   └── ui/                      # GlassCard, Button, Badge, BellCurve, etc.
├── core/
│   ├── constants/
│   │   ├── index.ts             # GOVERNORS, TERRITORY_FOCUS, resources
│   │   ├── religion.ts          # ROMAN_GODS, BLESSING_EFFECTS, worship
│   │   ├── territory.ts         # TERRITORY_LEVELS, TERRITORY_BUILDINGS
│   │   └── events.ts            # Random events
│   ├── types/index.ts           # All TypeScript interfaces
│   ├── rules/index.ts           # Victory/failure, achievements, techs
│   └── math/index.ts            # Production, battle, consumption calcs
├── hooks/
│   ├── index.ts                 # Barrel exports
│   └── useMobile.ts             # Mobile viewport detection hook
├── store/
│   └── gameStore.ts             # Zustand store (~900 lines)
└── lib/
    ├── animations.ts            # Framer Motion variants
    └── battleAnimations.ts      # Battle animation system
```

---

## Mobile View (Dec 2024)

The game is fully optimized for mobile devices (390-430px target width).

### Mobile Navigation

**Bottom Nav Bar** (always visible, like Safari):
```
[ Overview | Senate | Economy | Military | More ]
```

**"More" Drawer** (slides up from bottom):
- 4-column grid of all 14 tabs
- Rounded top corners with drag handle
- 70vh max height, scrollable

### Mobile Architecture

| Component | File | Purpose |
|-----------|------|---------|
| `useMobile` hook | `hooks/useMobile.ts` | Detect mobile viewport |
| `MobileNav` | `components/game/MobileNav.tsx` | Bottom nav bar + bottom sheet drawer |
| Safe area utilities | `globals.css` | iOS notch/home bar support |

### Key Mobile Patterns

**Responsive Padding**:
```tsx
className="p-3 md:p-5"
```

**Touch Targets (44px minimum)**:
```tsx
className="min-h-[44px]"
```

**Responsive Grids**:
```tsx
<div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
```

**BellCurve Charts**:
```tsx
<BellCurve compact={true} height={70} showPercentiles={false} />
```

### Mobile-Specific Components

| Component | Mobile Behavior |
|-----------|-----------------|
| `TerminalHeader` | Compact single row with key stats |
| `MobileNav` | Fixed bottom bar (56px, z-100) + bottom sheet drawer |
| `GlassCard` | `p-3` padding instead of `p-5` |
| `Button` | `min-h-[44px]` touch targets |
| `BellCurve` | `compact` prop hides percentile labels, smaller fonts |
| `OverviewPanel` | 3-column stat grid on mobile |
| `BattleScreen` | Stacked charts with compact mode |

### Breakpoints (Tailwind)

```
xs: 375px  (small phones)
sm: 640px  (larger phones)
md: 768px  (tablets - sidebar appears, mobile nav hides)
lg: 1024px (desktops)
```

### Testing Mobile

1. Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
2. Select iPhone 14 (390px) or similar
3. Test "More" drawer slides up from bottom
4. Verify Senate tab is in bottom nav
5. Check touch targets are easy to tap (44px+)
6. Verify bottom nav stays fixed while scrolling

---

## Key Functions to Modify

### Season Processing (`usecases/index.ts`)
```typescript
executeEndSeason(state: GameState): EndSeasonResult
// Line ~39-482
// Add blessing/building/governor effects here
```

### Production Calculations (`math/index.ts`)
```typescript
calculateTerritoryProduction(territory, buildings, season, state)
// Line ~130-200
// Add focus bonuses here

calculateFoodConsumption(population, troops, season, round)
// Line ~320-350
// Add Ceres blessing here
```

### Battle Calculations (`math/index.ts`)
```typescript
calculateBattleOdds(playerStrength, enemyStrength, modifiers)
// Line ~480-520
// Add Jupiter/Mars blessings here
```

### Trade (`usecases/index.ts`)
```typescript
executeTrade(state, cityId, resource, amount)
// Line ~587-650
// Add Mercury blessings here
```

### Recruitment (`usecases/index.ts`)
```typescript
executeRecruitTroops(state, unitId)
// Line ~494-531
// Add Mars blessing here (partially done for Minerva)
```

---

## Store Actions Reference

| Action | Description |
|--------|-------------|
| `endSeason()` | Advance season, process all systems |
| `startBattle(id)` | Begin conquest |
| `resolveBattle(retreat?)` | End battle |
| `worship(actionId)` | Worship action |
| `upgradeTerritoryLevel(id)` | Upgrade territory |
| `buildTerritoryBuilding(id, buildingId)` | Build in territory |
| `assignGarrison(id, troops)` | Assign troops |
| `assignGovernor(id, govId)` | Assign governor |
| `setTerritoryFocus(id, focus)` | Set focus |

---

## Testing After Changes

```bash
cd game
bun run build   # Must pass with zero errors
bun dev         # Test in browser
```

**Quick test flow**:
1. Start game → Select Romulus
2. End 2-3 seasons (Space key)
3. Select patron god → Worship → Check favor increases
4. Conquer territory → Check battle uses blessings
5. Build territory building → Check effects apply
6. Play until victory/failure → Verify Results screen shows

---

## Game Constants Quick Reference

### Victory Conditions
- Eternal City: 10 territories, 500 pop, 75% happiness
- Commerce: 15,000 denarii, 35 reputation
- Conqueror: 8 territories, 180 troops
- Glory: 350 pop, 90% happiness (lowered from 600)
- Industrial: 15 buildings, 10,000 denarii

### Failure Conditions
- Famine: 2+ consecutive starvation (FAILURE_STARVATION_LIMIT = 2)
- Collapse: Population < 40 (FAILURE_MIN_POPULATION = 40)
- Unrest: Happiness <= 25% (FAILURE_MIN_HAPPINESS = 25)

### Starting State
- 500 denarii, 100 population, 70% happiness
- 120 grain, 150 grain capacity (survives first winter with Farm Complex)
- 25 troops, 80% morale
- 150 housing, 50 sanitation, 1 fort, 50 supplies
- 10% tax rate

---

## Files Reference

- `PLAYER_GUIDE.md` - Complete game guide for players (~1200 lines)
- `import.md` - Feature tracking with checkboxes
- `Rome.life_Draft.html` - Original game (reference for logic)

---

## ✅ Quick Wins - All Complete

1. ~~**Results Screen**~~ - ✅ Already implemented
2. ~~**Mars -15% recruit**~~ - ✅ Implemented in `executeRecruitTroops()`
3. ~~**Arena +15 happiness**~~ - ✅ Applied via `calculateBuildingEffects()`
4. ~~**Breadbasket +50% grain**~~ - ✅ Applied via territory focus in production calc

---

## Future Enhancements (Post-V1)

Nice-to-have features for future versions:

1. ~~**Religious Events**~~ - ✅ COMPLETE (Dec 2024) - Triggers in season, requires piety > 20
2. ~~**Territory Events**~~ - ✅ COMPLETE - Already triggering with conditions
3. ~~**Event Balance**~~ - ✅ COMPLETE (Dec 2024) - Grace period, scaling, cooldowns, conditions
4. ~~**Political/Senate System**~~ - ✅ COMPLETE (Dec 2024) - Factions, influence, laws, elections
5. ~~**Mobile View**~~ - ✅ COMPLETE (Dec 2024) - Bottom nav, touch targets, responsive grids
6. **Infinite Mode Polish** - `enterInfiniteMode()` exists, needs polish
7. **Save/Load UI** - Persistence works, needs buttons
8. **Unit Tests** - None exist currently

---

## Event System (Dec 2024)

### Empire Events (`events.ts`)
16 random events (6 positive, 6 negative, 4 neutral) triggered each season:
- **Grace Period**: Rounds 1-4 protected from negative events (15% chance, positive/neutral only)
- **Conditional Triggers**: plague +50% if sanitation < 30, desertion blocked if morale > 70, etc.
- **Cooldowns**: Same event can't repeat for 4 rounds
- **Effect Scaling**: 60% early (rounds 1-8), 80% mid (9-20), 100-130% late (21+)

### Religious Events (`religion.ts`)
6 religious events (divine_omen, solar_eclipse, comet_sighting, miracle, divine_wrath, prophetic_dream):
- Only trigger if player has engaged with religion (piety > 20)
- Affect piety, happiness, morale, godFavor, reputation, grain

### Territory Events (`math/index.ts`)
3 territory events triggered per owned territory:
- **Rebellion**: 5% if stability < 30 (-10 stability, -30% garrison)
- **Prosperity**: 8% if stability > 70 (+100 income, +10 happiness)
- **Bandit Raid**: 7% if garrison < 20 (-50 gold, -8 stability)

---

## Balance Issues (Fixed in Dec 2024)

These gameplay balance issues were identified and fixed:

### Fixed Issues

| Issue | Severity | Problem | Solution |
|-------|----------|---------|----------|
| Starting Grain | CRITICAL | 50 grain vs ~56/season consumption = Turn 1 starvation | Increased to 75 grain |
| Starvation Pop Loss | HIGH | Code used 5% but constant said 15% | Fixed to use STARVATION_POP_LOSS constant (15%) |
| Winter Death Spiral | HIGH | First winter could cascade into failure | Extended grace period protection through round 8 |
| Host Feast OP | MEDIUM | +20 happiness infinitely stackable | Added diminishing returns (halved after each use per game) |
| Pop < 60 Redundant | MEDIUM | Can't reach 60 via starvation alone | Lowered threshold to 40 |
| Troop Variance | MEDIUM | 50% variance (12-18) unpredictable | Tightened to ~25% variance |
| Stability Undefined | LOW | No documentation for stability formula | Added STABILITY_FORMULA constant |
| Caravan Winter Gaming | LOW | Send in Autumn, return in Spring, skip winter | Added winter risk multiplier to caravans |
| Pop Growth Undocumented | MINOR | No visible formula | Documented in constants |

### Key Balance Formulas

**Food Consumption** (per season):
```
base = (population × 0.42) + (troops × 0.55)
final = base × seasonMod × gracePeriod × ceresBlessing
```

**Grace Period Multipliers**:
- Rounds 1-8: 60% consumption (extended from 6)
- Rounds 9-14: 80% consumption (extended from 12)
- Round 15+: 100% consumption

**Population Growth** (per season):
```
base = population × 0.02 (2%)
modifiers:
  × (1 + venusBlessing)     // +25% at tier 50
  × (0.5 + happiness/100)   // 50-150% based on happiness
  × sanitationMod           // <30 = 50%, <15 = -1% decline
cap = min(growth, housing - population)
```

**Stability Change** (per season):
```
base = garrison > 20 ? +1 : -2
modifiers:
  + buildingEffects.stability / 4
  + governorStabilityBonus / 4
  + godStabilityBonus
```

**Starvation Consequences**:
- 1st starvation: -15% population, -10 happiness, -15 morale
- 2nd consecutive: Game Over (Famine)

**Troop Recruitment Ranges** (tightened):
| Unit | Old Range | New Range | Variance |
|------|-----------|-----------|----------|
| Militia | 8-12 | 9-11 | ~20% |
| Auxiliaries | 10-16 | 12-14 | ~15% |
| Archers | 10-15 | 11-14 | ~25% |
| Legionaries | 12-18 | 14-16 | ~13% |
| Cavalry | 20-30 | 23-27 | ~16% |
| Praetorians | 35-50 | 40-45 | ~12% |

**Host Feast Diminishing Returns**:
```
effectiveBonus = 20 × (0.5 ^ feastsThisGame)
// 1st: +20, 2nd: +10, 3rd: +5, etc.
```

**Caravan Winter Risk**:
```
if (season === 'winter') risk *= 1.5  // +50% risk in winter
```

---

## Bug Fixes (Dec 2024 - QA Test #1)

### Fixed Issues

| Bug ID | Severity | Issue | Fix |
|--------|----------|-------|-----|
| BUG-002 | CRITICAL | Senate events not displaying - `pendingEvents` populated but `currentEvent` never set | Set `currentEvent` from first event in `senate.ts` |
| BUG-001 | CRITICAL | Game stagnates around round 19-20, failure conditions never trigger | Related to BUG-002 - events blocking game loop |

### Root Cause Analysis

The game would enter a stagnation state around round 19-20 because:
1. Senate events were generated and added to `pendingEvents` array
2. `currentEvent` was never set, so the SenatorEventModal never displayed
3. Events piled up silently without player resolution
4. When events WERE resolved/dismissed, the next event was not popped from the queue

### Files Changed

| File | Change |
|------|--------|
| `game/src/app/usecases/senate.ts` | Line 305-306: Set `currentEvent` from first event, rest go to `pendingEvents` |
| `game/src/store/gameStore.ts` | Lines 1463-1465: Pop next event after resolution |
| `game/src/store/gameStore.ts` | Lines 1477-1479: Pop next event after dismissal |

### Verification

Run the victory playthrough test to verify the game no longer stagnates:
```bash
cd game && npx playwright test victory-playthrough --project=chromium
```

---

## Bug Fixes (Dec 31, 2024 - QA Test #2)

### Issues Identified

| Bug ID | Severity | Issue |
|--------|----------|-------|
| BUG-001 | CRITICAL | Failure condition not triggering at 12% happiness (should fail at ≤25%) |
| BUG-002 | HIGH | Game stagnates after round 19 - all values freeze |
| BUG-003 | HIGH | Senator relations reset to 0 at round 19 |

### Root Cause Analysis

**Root Cause**: SenatorEventModal was ONLY rendered inside `SenatePanel.tsx`. If player was NOT on Senate tab when `currentEvent` was set, the modal never appeared and couldn't be dismissed.

**Chain of Events**:
1. Round 19: `processSenateSeasonEnd()` generates senator events
2. First event set to `currentEvent` in senate state
3. Player on non-Senate tab can't see/dismiss the modal
4. Player calls `endSeason()` again (Space key)
5. `endSeason()` had NO guard - it ran anyway
6. `processSenateSeasonEnd()` ran again with stale state
7. State became corrupted:
   - Senator relations miscalculated (reset to 0)
   - Multiple events piled up
   - Game values froze because state updates were inconsistent

### Fixes Applied

| File | Change |
|------|--------|
| `game/src/components/game/GameLayout.tsx` | Added global `SenatorEventModal` at root level - appears on ANY tab |
| `game/src/store/gameStore.ts` | Added guard in `endSeason()` - blocks season if events pending |
| `game/src/components/senate/SenatePanel.tsx` | Added round check - only auto-initialize senate at round 1 |
| `game/src/components/senate/SenatePanel.tsx` | Removed duplicate modal (now in GameLayout) |

### Key Code Changes

**GameLayout.tsx** (lines 112-117):
```tsx
{/* Senate Event Modal - Global so it appears on any tab */}
<SenatorEventModal
    event={senate?.currentEvent ?? null}
    onChoice={resolveSenatorEvent}
    onDismiss={dismissSenatorEvent}
/>
```

**gameStore.ts** `endSeason()` (lines 489-493):
```typescript
// Guard: Don't end season while senate events need resolution
if (state.senate?.currentEvent) {
    set({ lastEvents: ['Resolve the senator event before ending the season!'] });
    return;
}
```

**SenatePanel.tsx** (lines 30-42):
```tsx
if (!senate.initialized) {
    // Only auto-initialize during game start (round 1), not during active play
    if (round <= 1) {
        initializeSenate();
    }
    // ...
}
```

---

## Bug Fixes (Dec 31, 2024 - Gameplay Balance Overhaul)

### Critical Bugs Fixed

| Bug ID | Issue | Fix |
|--------|-------|-----|
| C01 | Worship actions (Consecration, Divine Augury, Invoke Blessing) had no effect | Implemented all three effects in `gameStore.ts:worship()` |
| C03 | Mars recruitment discount (-15%) not shown in Military UI | Added discount calculation and display in `MilitaryPanel.tsx` |

### High Severity Fixes

| Bug ID | Issue | Fix |
|--------|-------|-----|
| H01 | Senate had no consequences for negative relations | Added penalty system when relation < -30 in `senate.ts` |
| H02 | Round 21 consumption cliff (80% to 100% instant) | Smoothed grace period: 75% -> 85% -> 92% -> 100% |
| H05 | Minerva free tech too weak (1 per 5 rounds) | Buffed to 1 per 3 rounds, 2 at tier 75 |

### Medium Severity Fixes

| Bug ID | Issue | Fix |
|--------|-------|-----|
| M01 | Census Office was a trap building (+10% tax, -5 stability) | Rebalanced to +20% tax, -2 stability |
| M02 | Territory events mutually exclusive (single roll) | Now uses independent rolls per event type |
| M04 | Only 1 wonder at a time regardless of empire size | Now allows 1 + floor(territories/3) concurrent wonders |
| M05 | Population growth too slow (2% base) | Increased to 3.5% base + 15% bonus when happiness > 80 |
| M06 | Deficit protection ended at round 16 | Extended: 3% cap rounds 1-16, 5% cap rounds 17-24 |

### New Features

**Consecration Effect** (`gameStore.ts`)
- Marks territory for +25% production bonus
- Applied in `calculateTerritoryProduction()` in `math/index.ts`

**Divine Augury Effect**
- Reveals seasonal foresight (winter warnings)
- +5 morale bonus

**Invoke Divine Blessing Effect** (patron-god specific)
- Jupiter: +15 reputation, +20 morale
- Mars: +15 troops, +100 supplies
- Venus: +20 happiness, +25 population
- Ceres: +150 grain
- Mercury: +400 denarii
- Minerva: +25 piety, +10 reputation

**Senate Consequences** (when relation < -30)
- Sulla: -morale per tier below -30
- Clodius: -happiness per tier
- Pulcher: -piety per tier
- Oppius: -denarii per tier
- Sertorius: -reputation per tier

### Files Changed

| File | Changes |
|------|---------|
| `src/store/gameStore.ts` | Worship effects, wonder slots, consecratedTerritories state |
| `src/components/game/MilitaryPanel.tsx` | Mars discount display |
| `src/app/usecases/senate.ts` | Consequence system at section 3.5 |
| `src/app/usecases/index.ts` | Minerva buff, deficit protection extension |
| `src/core/constants/index.ts` | Smoothed GRACE_MULTIPLIERS |
| `src/core/constants/territory.ts` | Census Office rebalance |
| `src/core/math/index.ts` | Territory events, population growth, consecration bonus |
| `src/core/types/index.ts` | Added consecratedTerritories, worshipCooldowns |

---

*Last Updated: December 31, 2024*
*Status: V1.1 - Gameplay balance overhaul complete, 10 bugs fixed*
