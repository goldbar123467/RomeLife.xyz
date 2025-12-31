# Bugs & Gameplay Flaws - Rome Empire Builder

Last Updated: December 31, 2024

---

## CRITICAL BUGS (Features Broken/Unimplemented)

### BUG-C01: Worship Actions Have No Effect
**Severity**: CRITICAL
**Location**: `src/store/gameStore.ts:981-1029`

Three worship actions take player resources but produce zero effect:

| Action | Cost | Promised Effect | Actual Effect |
|--------|------|-----------------|---------------|
| Consecration | 400 denarii + 30 piety | +25% territory production | **NOTHING** |
| Divine Augury | 200 denarii + 20 piety | Reveal upcoming events | **NOTHING** |
| Invoke Divine Blessing | 150 denarii + 15 piety | Activate blessing | **NOTHING** |

**Root Cause**: Effect flags (`consecrate`, `revealEvents`, `invokeBlessing`) are set but no code reads them.

**Fix Required**: Implement effect handlers in `executeEndSeason()` or worship action processor.

---

### BUG-C02: Jupiter Victory Bonus Returns 0 Denarii
**Severity**: CRITICAL
**Location**: `src/store/gameStore.ts:628`

```javascript
const jupiterVictoryBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'victoryDenarii');
const victoryDenarii = jupiterVictoryBonus > 0 ? Math.floor(jupiterVictoryBonus) : 0;
```

**Problem**: `calculateBlessingBonus()` returns a multiplier (0.15), not 100 denarii. `Math.floor(0.15)` = 0.

**Expected**: Jupiter tier 50 should give +100 denarii on battle victory.

**Fix Required**: Return 100 from blessing effect, not a multiplier, OR change calculation to: `baseReward + 100`.

---

### BUG-C03: Mars Recruitment Discount Not Implemented
**Severity**: CRITICAL
**Location**: `src/app/usecases/index.ts:736-737`

```javascript
const marsRecruitBonus = calculateBlessingBonus(state.patronGod, state.godFavor, 'recruitCost');
const denCost = Math.floor(unit.cost.denarii * (1 + recruitCostMod + marsRecruitBonus));
```

**Problem**: `calculateBlessingBonus()` has no case for `'recruitCost'` - returns 0.

**Expected**: Mars tier 25 should give -15% recruitment cost.

**Fix Required**: Add `'recruitCost': -0.15` case to `calculateBlessingBonus()` in `src/core/constants/religion.ts`.

---

### BUG-C04: Failure Conditions Not Triggering
**Severity**: CRITICAL
**Location**: `src/core/rules/index.ts:119`, `src/app/usecases/index.ts`

**Observed**: Game ran 30 rounds at 12% happiness without triggering failure (threshold is 25%).

**Root Cause**: Multiple issues:
1. Failure check may not run when senate events block season processing
2. Happiness threshold mismatch (code uses 25, docs say 20)
3. Stagnation bug prevents state updates

**Fix Required**:
- Ensure failure checks run AFTER senate event resolution
- Clarify threshold in constants and docs

---

### BUG-C05: Game Stagnates After Round 19
**Severity**: CRITICAL
**Location**: `src/store/gameStore.ts`, `src/app/usecases/senate.ts`

**Observed**: All metrics freeze after round 19 - population, denarii, happiness, troops all stuck.

**Root Cause**: Senate events blocked season progression:
1. `currentEvent` set but modal only rendered on Senate tab
2. `endSeason()` guard blocks progression but player can't see why
3. State becomes corrupted from repeated partial processing

**Fix Applied**: (QA Test #2)
- Global `SenatorEventModal` in GameLayout.tsx
- Guard in `endSeason()` with user feedback
- Round check to prevent auto-initialization mid-game

**Status**: PARTIALLY FIXED - may still have edge cases

---

## HIGH SEVERITY BUGS

### BUG-H01: Senate System Has No Consequences
**Severity**: HIGH
**Location**: `src/app/usecases/senate.ts:101-150`

**Problem**: Senator relations decay each season but have ZERO gameplay impact:
- No blocked legislation
- No assassination attempts
- No trade embargoes
- No military desertion

**Impact**: Players can ignore Senate entirely with no penalty.

**Fix Required**: Implement consequence system - at relation < -30, senators should take hostile actions.

---

### BUG-H02: Round 21 Consumption Cliff
**Severity**: HIGH
**Location**: `src/core/constants/index.ts:247-252`

```javascript
GRACE_MULTIPLIERS: [
    { maxRound: 8, multiplier: 0.5 },   // 50% consumption
    { maxRound: 14, multiplier: 0.65 }, // 65% consumption
    { maxRound: 20, multiplier: 0.8 },  // 80% consumption
    // Round 21+: 100% consumption (no multiplier)
```

**Problem**: At round 21, consumption jumps from 80% → 100% (25% increase). Combined with winter modifier (1.15x), this can trigger instant famine.

**Fix Required**: Extend grace period or add transitional multipliers (85%, 90%, 95%).

---

### BUG-H03: Trade Risk Too Low
**Severity**: HIGH
**Location**: `src/core/constants/index.ts:233-234`

```javascript
TRADE_RISK_MIN: 0.01, // 1% min risk
TRADE_RISK_MAX: 0.25, // 25% max risk
```

**Problem**: 75% base success rate makes trade trivially safe. Players can spam caravans for guaranteed wealth.

**Fix Required**: Increase `TRADE_RISK_MAX` to 0.40 (40%) or add risk scaling by cargo value.

---

### BUG-H04: Stability System Is Binary
**Severity**: HIGH
**Location**: `src/core/math/index.ts:568-599`

```javascript
if (territory.garrison > 20) {
    change += 1;  // Always gain stability
} else {
    change -= 2;  // Always lose stability
}
```

**Problem**: Garrison threshold of 20 is trivially easy to maintain. No dynamic tension.

**Fix Required**:
- Scale stability change by garrison quality (loyalty, equipment)
- Add random rebellion events regardless of garrison
- Cap stability bonus at +2/season

---

### BUG-H05: Minerva Free Tech Is Weak
**Severity**: HIGH
**Location**: `src/app/usecases/index.ts:530-542`

**Problem**: 1 free tech per 5 rounds ≈ 60-100 denarii value. Compare to basic tax income of 700+/round.

**Fix Required**: Either:
- Free tech every 3 rounds, OR
- -25% research cost permanently, OR
- +1 free tech per 3 rounds (stacking)

---

### BUG-H06: Senator Relations Reset to Zero
**Severity**: HIGH
**Location**: `src/app/usecases/senate.ts`

**Observed**: All 5 senators reset to 0 relation at round 19.

**Root Cause**: Likely related to stagnation bug - repeated partial season processing corrupts state.

**Status**: Needs investigation after C05 is fully resolved.

---

## MEDIUM SEVERITY BUGS

### BUG-M01: Census Office Is a Trap Building
**Severity**: MEDIUM
**Location**: `src/core/constants/territory.ts:161-169`

```javascript
effects: { taxBonus: 0.10, stability: -5 }
```

**Problem**: +10% tax on ~50 denarii/season = +5 denarii. But -5 stability FOREVER = net negative.

**Fix Required**: Either:
- Remove stability penalty, OR
- Increase tax bonus to +25%, OR
- Make stability penalty temporary (-5 for 4 seasons)

---

### BUG-M02: Territory Events Are Mutually Exclusive
**Severity**: MEDIUM
**Location**: `src/core/math/index.ts:604-632`

```javascript
if (territory.stability < 30 && roll < 0.05) { /* rebellion */ }
if (territory.stability > 70 && roll >= 0.05 && roll < 0.13) { /* prosperity */ }
if (territory.garrison < 20 && roll >= 0.13 && roll < 0.20) { /* raid */ }
```

**Problem**: Single roll means only ONE event type can trigger per territory per season. Events undersell their frequency.

**Fix Required**: Use separate rolls for each event type OR remove exclusive ranges.

---

### BUG-M03: Happiness Threshold Mismatch
**Severity**: MEDIUM
**Location**: `src/core/rules/index.ts:119` vs `CLAUDE.md`

**Problem**: Code uses `FAILURE_MIN_HAPPINESS = 25`, but CLAUDE.md says "20%". Players confused about actual threshold.

**Fix Required**: Update CLAUDE.md to reflect actual code value (25%).

---

### BUG-M04: Wonder Queue Limit Is Artificial
**Severity**: MEDIUM
**Location**: `src/store/gameStore.ts:1068-1073`

```javascript
const alreadyBuilding = state.wonders.some(w => w.turnsRemaining && w.turnsRemaining > 0);
if (alreadyBuilding) {
    set({ lastEvents: ['Already constructing a wonder! Complete it first.'] });
    return;
}
```

**Problem**: Only 1 wonder at a time even with 10+ territories. Artificial bottleneck.

**Fix Required**: Allow 1 wonder per N territories (e.g., 1 per 3 territories).

---

### BUG-M05: Population Growth Too Slow
**Severity**: MEDIUM
**Location**: `src/core/math/index.ts:693-727`

**Problem**: Max growth rate with all bonuses = 3.75% per season. Starting 100 pop → 140 pop at round 10. Too slow for strategic use.

**Fix Required**:
- Increase base growth to 3-4%, OR
- Add housing bonus to growth rate, OR
- Add "baby boom" event for sudden pop spikes

---

### BUG-M06: Deficit Protection Ends Too Early
**Severity**: MEDIUM
**Location**: `src/app/usecases/index.ts:92-98`

```javascript
if (state.round <= 16 && summary.netIncome < 0) {
    effectiveNetIncome = Math.max(summary.netIncome, -Math.floor(state.denarii * 0.05));
}
```

**Problem**: After round 16, no deficit protection. Late-game upkeep spikes can bankrupt instantly.

**Fix Required**: Extend to round 24 or add scaling protection (cap losses at 10% treasury).

---

### BUG-M07: Massive Resource Swing in Single Round
**Severity**: MEDIUM
**Location**: `src/senate/engine/effectProcessor.ts`

**Observed**:
- Denarii: 0 → 22,055 → 4,482 (2 rounds)
- Happiness: 100% → 90% → 12% (2 rounds)

**Possible Cause**: Senator events with extreme effects stacking.

**Fix Required**: Cap single-event effects (max -20 happiness, max -30% denarii).

---

## LOW SEVERITY ISSUES

### BUG-L01: Morale Has No Recovery Actions
**Severity**: LOW
**Location**: Multiple files

**Problem**: Morale only affects battle odds but has no active recovery mechanism. Just a passive stat tax.

**Fix**: Add "Rally Troops" action or morale boost from victories.

---

### BUG-L02: Reputation Gains Too Slow
**Severity**: LOW
**Location**: `src/core/math/index.ts:735-770`

**Problem**: +20 reputation per 10 seasons but benefits are minimal (just trade risk reduction).

**Fix**: Add reputation thresholds that unlock diplomacy options or troop recruitment bonuses.

---

### BUG-L03: Market Volatility Is Random Noise
**Severity**: LOW
**Location**: `src/core/math/index.ts:395-450`

**Problem**: ±4 random swing per season makes prices unpredictable. No strategic market manipulation.

**Fix**: Add seasonal trends (grain high in winter) or player-influenced demand.

---

### BUG-L04: Infinite Mode Scales Exponentially
**Severity**: LOW
**Location**: `src/core/constants/index.ts:254-263`

**Problem**: Enemy strength × 1.03^rounds but resources scale linearly. Unplayable past round 50.

**Fix**: Cap enemy scaling at 2x or add matching resource bonuses.

---

### BUG-L05: Territory Count Fluctuates
**Severity**: LOW
**Location**: Unknown - state management

**Observed**: Territory count: 0 → 1 → 0 → 1 between rounds.

**Root Cause**: Possibly related to stagnation bug or UI display issue.

---

## PREVIOUSLY FIXED BUGS

### FIXED-001: Senate Events Block Modal (QA Test #2)
**Fixed**: Dec 31, 2024
**Solution**: Global SenatorEventModal in GameLayout.tsx

### FIXED-002: endSeason() Runs Despite Pending Events (QA Test #2)
**Fixed**: Dec 31, 2024
**Solution**: Guard added to check `state.senate?.currentEvent`

### FIXED-003: Senate Auto-Initializes Mid-Game (QA Test #2)
**Fixed**: Dec 31, 2024
**Solution**: Round check `if (round <= 1)` before auto-init

---

## FIX PRIORITY ORDER

### Phase 1: Critical (Game-Breaking)
1. BUG-C01: Implement worship action effects
2. BUG-C02: Fix Jupiter victory bonus
3. BUG-C03: Add Mars recruitment discount
4. BUG-C04: Ensure failure checks run properly
5. BUG-C05: Complete stagnation fix

### Phase 2: High (Major Balance)
6. BUG-H01: Add senate consequences
7. BUG-H02: Smooth grace period transition
8. BUG-H03: Increase trade risk
9. BUG-H04: Dynamic stability system
10. BUG-H05: Buff Minerva blessing

### Phase 3: Medium (Quality of Life)
11. BUG-M01: Rebalance Census Office
12. BUG-M02: Fix territory event logic
13. BUG-M03: Update docs for happiness threshold
14. BUG-M04: Allow parallel wonder construction
15. BUG-M05: Increase population growth
16. BUG-M06: Extend deficit protection
17. BUG-M07: Cap senator event effects

---

## Files to Modify

| Bug | Primary File | Secondary Files |
|-----|--------------|-----------------|
| C01 | `store/gameStore.ts` | `usecases/index.ts` |
| C02 | `store/gameStore.ts` | `core/constants/religion.ts` |
| C03 | `core/constants/religion.ts` | `usecases/index.ts` |
| C04 | `core/rules/index.ts` | `usecases/index.ts` |
| C05 | `store/gameStore.ts` | `usecases/senate.ts` |
| H01 | `usecases/senate.ts` | `senate/engine/effectProcessor.ts` |
| H02 | `core/constants/index.ts` | - |
| H03 | `core/constants/index.ts` | - |
| H04 | `core/math/index.ts` | - |
| H05 | `usecases/index.ts` | `core/constants/religion.ts` |
| M01 | `core/constants/territory.ts` | - |
| M02 | `core/math/index.ts` | - |
| M03 | `CLAUDE.md` | - |
| M04 | `store/gameStore.ts` | - |
| M05 | `core/math/index.ts` | `core/constants/index.ts` |
| M06 | `usecases/index.ts` | - |
| M07 | `senate/engine/effectProcessor.ts` | - |
