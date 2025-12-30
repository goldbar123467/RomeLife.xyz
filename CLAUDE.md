# CLAUDE.md - Rome Empire Builder

This file provides guidance to Claude Code when working with this repository.

---

## Current Status: ✅ V1.0 COMPLETE

The game is a turn-based Roman empire simulation. **All core systems are now fully integrated and working.**

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
│   └── usecases/index.ts        # Season simulation, battles, trade
├── components/
│   ├── game/                    # 13 panel components
│   │   ├── GameLayout.tsx       # Main layout, stage routing
│   │   ├── OverviewPanel.tsx    # Dashboard
│   │   ├── MapPanel.tsx         # Territory management (6 tabs)
│   │   ├── ReligionPanel.tsx    # Gods, blessings, worship (3 tabs)
│   │   ├── BattleScreen.tsx     # Battle overlay
│   │   └── ...                  # Other panels
│   ├── battle/                  # Battle animations
│   └── ui/                      # GlassCard, Button, Badge, etc.
├── core/
│   ├── constants/
│   │   ├── index.ts             # GOVERNORS, TERRITORY_FOCUS, resources
│   │   ├── religion.ts          # ROMAN_GODS, BLESSING_EFFECTS, worship
│   │   ├── territory.ts         # TERRITORY_LEVELS, TERRITORY_BUILDINGS
│   │   └── events.ts            # Random events
│   ├── types/index.ts           # All TypeScript interfaces
│   ├── rules/index.ts           # Victory/failure, achievements, techs
│   └── math/index.ts            # Production, battle, consumption calcs
├── store/
│   └── gameStore.ts             # Zustand store (~900 lines)
└── lib/
    ├── animations.ts            # Framer Motion variants
    └── battleAnimations.ts      # Battle animation system
```

---

## Mobile View (Dec 2024)

The game is optimized for mobile devices (390-430px target width).

### Mobile Architecture

| Component | File | Purpose |
|-----------|------|---------|
| `useMobile` hook | `hooks/useMobile.ts` | Detect mobile viewport |
| `MobileNav` | `components/game/MobileNav.tsx` | Bottom nav bar + drawer |
| Safe area utilities | `globals.css` | iOS notch/home bar support |

### Key Mobile Patterns

**Responsive Padding**:
```tsx
// GlassCard uses responsive padding
className="p-3 md:p-5"
```

**Touch Targets (44px minimum)**:
```tsx
// Buttons have minimum height
className="min-h-[44px]"
```

**Responsive Grids**:
```tsx
// Overview stats: 3 cols mobile, 6 cols desktop
<div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
```

**BellCurve Charts**:
```tsx
// Use compact mode on mobile for smaller charts
<BellCurve compact={true} height={70} showPercentiles={false} />
```

### Mobile-Specific Components

| Component | Mobile Behavior |
|-----------|-----------------|
| `TerminalHeader` | Compact single row with key stats |
| `MobileNav` | Fixed bottom bar (56px) + slide-out drawer (w-64) |
| `GlassCard` | `p-3` padding instead of `p-5` |
| `Button` | `min-h-[44px]` touch targets |
| `BellCurve` | `compact` prop hides percentile labels, smaller fonts |

### Breakpoints (Tailwind)

```
xs: 375px  (small phones)
sm: 640px  (larger phones)
md: 768px  (tablets - sidebar appears)
lg: 1024px (desktops)
```

### Testing Mobile

1. Chrome DevTools → Toggle Device Toolbar (Ctrl+Shift+M)
2. Select iPhone 14 (390px) or similar
3. Test navigation drawer opens/closes
4. Verify touch targets are easy to tap
5. Check BellCurve charts are readable

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
4. **Political/Senate System** - Factions, influence, political intrigue (V2 feature)
5. **Infinite Mode Polish** - `enterInfiniteMode()` exists, needs polish
6. **Save/Load UI** - Persistence works, needs buttons
7. **Unit Tests** - None exist currently

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

*Last Updated: December 2024*
*Status: V1.0 COMPLETE - All systems integrated, mobile view optimized*
