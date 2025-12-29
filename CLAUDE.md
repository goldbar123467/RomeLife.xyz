# CLAUDE.md - Rome Empire Builder

This file provides guidance to Claude Code when working with this repository.

---

## Current Status: 75% Complete → V1.0

The game is a turn-based Roman empire simulation. **UI and state management are complete. The critical gap is that many bonuses are displayed but not applied to calculations.**

### Run the Game
```bash
cd game && bun dev
# Open http://localhost:3000
```

---

## Critical Path to V1.0 (5 Issues)

### Issue 1: Results Screen Missing
**Severity**: BLOCKER - Game ends but shows nothing

**Problem**: Victory/failure sets `stage: 'results'` but `GameLayout.tsx` doesn't handle it.

**Fix Location**: `src/components/game/GameLayout.tsx`

**Solution**:
1. Create `src/components/game/ResultsScreen.tsx`
2. Add to GameLayout before main game view:
```typescript
if (stage === 'results') {
    return <ResultsScreen />;
}
```

**ResultsScreen needs**:
- Check `lastEvents` for victory/failure message
- Display final stats (denarii, population, territories, round)
- "Play Again" button → call `resetGame()` (need to add action)
- "Continue (Infinite Mode)" button → call `enterInfiniteMode()`

**Effort**: 2-3 hours

---

### Issue 2: God Blessing Effects Not Applied
**Severity**: HIGH - Religion system is decorative

**Problem**: Blessings show at 25/50/75/100 favor but don't affect gameplay.

**Fix Locations**:
- `src/core/math/index.ts` - Battle and production calculations
- `src/app/usecases/index.ts` - Season processing, recruitment

**Blessing Effects Table** (from `src/core/constants/religion.ts`):

| God | Tier | Effect | Apply In |
|-----|------|--------|----------|
| Jupiter | 25 | +10% battle strength | `calculateBattleOdds()` |
| Jupiter | 50 | +100 denarii on victory | `resolveBattle()` in store |
| Jupiter | 75 | +15% morale | Season processing |
| Mars | 25 | -15% recruit costs | `executeRecruitTroops()` |
| Mars | 50 | +10% attack | `calculateBattleOdds()` |
| Mars | 100 | -30% casualties | `resolveBattle()` |
| Venus | 25 | +10% happiness | Season processing |
| Venus | 50 | +15% pop growth | Population calculation |
| Ceres | 25 | +20% grain production | `calculateTerritoryProduction()` |
| Ceres | 50 | +30% all food | `calculateTerritoryProduction()` |
| Ceres | 75 | -25% food consumption | `calculateFoodConsumption()` |
| Mercury | 25 | +10% trade prices | `executeTrade()` |
| Mercury | 50 | -20% tariffs | `executeTrade()` |
| Mercury | 75 | +25% caravan profit | Caravan processing |
| Minerva | 25 | -15% tech costs | `executeResearchTech()` (partial) |

**Helper exists**: `calculateBlessingBonus(patronGod, godFavor, effectType)` in `religion.ts`

**Pattern**:
```typescript
import { calculateBlessingBonus } from '@/core/constants/religion';

// In calculation:
const blessingBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'battleStrength');
finalValue *= (1 + blessingBonus);
```

**Effort**: 4-5 hours

---

### Issue 3: Territory Building Effects Not Applied
**Severity**: HIGH - Territory buildings are decorative

**Problem**: 9 buildings can be built but their effects don't do anything.

**Fix Locations**:
- `src/core/math/index.ts` - Defense, production calculations
- `src/app/usecases/index.ts` - Season stability/happiness/income

**Building Effects Table** (from `src/core/constants/territory.ts`):

| Building | Effects | Apply In |
|----------|---------|----------|
| Garrison | +15 defense, +10 stability, +50 troop cap | Defense calc, season |
| Walls | +30 defense, +15 stability | Defense calc, season |
| Arena | +15 happiness, +8 stability | Season processing |
| Roads | -15% trade risk, +10% income | Trade, income calcs |
| Local Temple | +10 piety, +15 happiness, +10 stability | Season processing |
| Forum | +15% income, +10 stability | Income calc, season |
| Watchtower | +20 defense, +5 stability | Defense calc, season |
| Granary | +100 food storage | Capacity check |
| Census Office | +10% tax, -5 stability | Tax calc, season |

**Helper exists**: `calculateBuildingEffects(buildings: string[])` in `territory.ts`

**Pattern**:
```typescript
import { calculateBuildingEffects } from '@/core/constants/territory';

// In season processing per territory:
const effects = calculateBuildingEffects(territory.buildings);
if (effects.happiness) newHappiness += effects.happiness;
if (effects.stability) territory.stability += effects.stability / 4; // per season
if (effects.income) territoryIncome *= (1 + effects.income);
```

**Effort**: 3-4 hours

---

### Issue 4: Governor Bonuses Not Applied
**Severity**: MEDIUM - Governors are decorative

**Problem**: Governors can be assigned but bonuses don't affect calculations.

**Fix Locations**:
- `src/core/math/index.ts` - Territory production
- `src/app/usecases/index.ts` - Income, defense calculations

**Governor Effects** (from `src/core/constants/index.ts`):

| Governor | Bonus | Malus |
|----------|-------|-------|
| Marcus (Merchant) | +20% income | -10% defense |
| Titus (General) | +25% defense, +15% morale | -10% income |
| Lucius (Scholar) | +20% tech discount | -15% defense |
| Gaius (Admin) | +20% stability, +10% income | -5% happiness |
| Servius (Priest) | +30% piety, +10% happiness | -15% income |

**Pattern**:
```typescript
if (territory.governor) {
    const gov = GOVERNORS.find(g => g.id === territory.governor.id);
    if (gov?.bonus.income) income *= (1 + gov.bonus.income);
    if (gov?.malus.income) income *= (1 + gov.malus.income); // negative value
}
```

**Effort**: 2-3 hours

---

### Issue 5: Territory Focus Bonuses Not Applied
**Severity**: MEDIUM - Focus is decorative

**Problem**: Territory focus can be set but bonuses don't affect production.

**Focus Effects** (from `src/core/constants/index.ts`):

| Focus | Bonuses |
|-------|---------|
| military | +30% defense, +20% troop recruit |
| trade | +15% trade prices, +20% tariff reduction |
| breadbasket | +50% grain production |
| mining | +50% iron, +30% stone production |

**Pattern**:
```typescript
// In calculateTerritoryProduction():
if (territory.focus === 'breadbasket' && resource.type === 'grain') {
    amount *= 1.5;
}
if (territory.focus === 'mining') {
    if (resource.type === 'iron') amount *= 1.5;
    if (resource.type === 'stone') amount *= 1.3;
}
```

**Effort**: 2-3 hours

---

## Implementation Priority

```
1. Results Screen .............. 2-3 hours  [BLOCKER]
2. Blessing Effects ............ 4-5 hours  [HIGH]
3. Territory Building Effects .. 3-4 hours  [HIGH]
4. Governor Bonuses ............ 2-3 hours  [MEDIUM]
5. Territory Focus Bonuses ..... 2-3 hours  [MEDIUM]
                                ──────────
                         Total: ~15 hours to V1.0
```

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
- Glory: 600 pop, 90% happiness
- Industrial: 15 buildings, 10,000 denarii

### Failure Conditions
- Famine: 2+ consecutive starvation (FAILURE_STARVATION_LIMIT = 2)
- Collapse: Population < 60 (FAILURE_MIN_POPULATION = 60)
- Unrest: Happiness <= 25% (FAILURE_MIN_HAPPINESS = 25)

### Starting State
- 500 denarii, 100 population, 70% happiness
- 25 troops, 80% morale
- 150 housing, 50 sanitation, 1 fort, 50 supplies
- 10% tax rate

---

## Files Reference

- `PLAYER_GUIDE.md` - Complete game guide for players (~1200 lines)
- `import.md` - Feature tracking with checkboxes
- `Rome.life_Draft.html` - Original game (reference for logic)

---

## Quick Wins (Isolated Fixes)

1. **Results Screen** - New component, no calculation changes
2. **Mars -15% recruit** - Single line in `executeRecruitTroops()`
3. **Arena +15 happiness** - Add in season processing loop
4. **Breadbasket +50% grain** - Add in production calculation

---

## Secondary Issues (Post-V1)

After critical path is complete:

1. **Religious Events** - Constants exist, need to trigger in season
2. **Territory Events** - Constants exist, need to check conditions
3. **Infinite Mode** - `enterInfiniteMode()` exists, needs polish
4. **Save/Load UI** - Persistence works, needs buttons
5. **Unit Tests** - None exist currently

---

*Last Updated: December 2024*
*Status: Critical Path Phase*
