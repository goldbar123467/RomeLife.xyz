# Rome Empire Builder - Sprint 2026-01-01

## Sprint Goal
Improve player experience through save/load visibility, code maintainability, and balance tweaks.

---

## Codebase Health Check

| Metric | Status | Notes |
|--------|--------|-------|
| Build | PASS | Compiles successfully |
| Lint | PASS | No ESLint errors |
| TypeScript | PASS | No type errors in build |

### Large Files Needing Refactor
| File | Lines | Priority |
|------|-------|----------|
| `store/gameStore.ts` | 1,755 | Future Sprint |
| `components/game/TradePanel.tsx` | 1,433 | THIS SPRINT |
| `core/math/index.ts` | 990 | Future Sprint |
| `components/game/MapPanel.tsx` | 813 | Future Sprint |

### Accessibility Status
- Only 3 ARIA attributes in entire codebase
- All in `components/ui/index.tsx`

---

## PRIORITY 1: Critical Player Experience (30 min)

### TASK-001: Add Save/Load UI Buttons
**Agent**: rome-dev
**Time**: 15 min
**Impact**: HIGH - Players have no visibility into save state

**Context**:
- Zustand `persist` middleware auto-saves to localStorage (key: `rome-empire-save`)
- Players cannot see when game is saved or manually trigger save/load
- Need visible controls for save confirmation, load, and new game

**Files**:
- `/home/clark/romelife/game/src/components/game/TerminalHeader.tsx`

**Implementation**:
```tsx
// Add to header actions area:
import { Save, Download, RefreshCw } from 'lucide-react';
import { gameToast } from '@/lib/toast';

// Save button
<Button variant="ghost" size="sm" onClick={() => {
  useGameStore.persist.rehydrate();
  gameToast.success('Game saved to browser storage');
}}>
  <Save size={16} className="mr-1" /> Save
</Button>

// Load button (rehydrate from storage)
<Button variant="ghost" size="sm" onClick={() => {
  useGameStore.persist.rehydrate();
  gameToast.success('Game loaded from storage');
}}>
  <Download size={16} className="mr-1" /> Load
</Button>

// New Game button
<Button variant="ghost" size="sm" onClick={() => {
  if (confirm('Start a new game? Current progress will be lost.')) {
    localStorage.removeItem('rome-empire-save');
    window.location.reload();
  }
}}>
  <RefreshCw size={16} className="mr-1" /> New Game
</Button>
```

**Acceptance Criteria**:
- [ ] Save button shows confirmation toast
- [ ] Load button restores from localStorage
- [ ] New Game button prompts confirmation, clears save, reloads

---

### TASK-002: Split TradePanel.tsx Into Sub-Components
**Agent**: rome-architect
**Time**: 15 min
**Impact**: HIGH - 1,433 lines is unmaintainable, largest component by 620 lines

**Context**:
- TradePanel has 4 internal tab components with typed props already defined
- Components: QuickTradeTab, TradeRoutesTab, CaravanTab, MarketIntelTab
- Extract each to its own file in `/components/trade/`

**Files**:
- `/home/clark/romelife/game/src/components/game/TradePanel.tsx` (source, 1,433 lines)
- Create: `/home/clark/romelife/game/src/components/trade/QuickTradeTab.tsx`
- Create: `/home/clark/romelife/game/src/components/trade/TradeRoutesTab.tsx`
- Create: `/home/clark/romelife/game/src/components/trade/CaravanTab.tsx`
- Create: `/home/clark/romelife/game/src/components/trade/MarketIntelTab.tsx`
- Create: `/home/clark/romelife/game/src/components/trade/types.ts`
- Create: `/home/clark/romelife/game/src/components/trade/index.ts`

**Target Structure**:
```
components/
  trade/
    index.ts              # Barrel exports
    types.ts              # Shared prop types (QuickTradeTabProps, etc.)
    QuickTradeTab.tsx     # ~200 lines
    TradeRoutesTab.tsx    # ~250 lines
    CaravanTab.tsx        # ~300 lines
    MarketIntelTab.tsx    # ~200 lines
    constants.ts          # CITY_LORE, CARAVAN_ICON_MAP
  game/
    TradePanel.tsx        # ~400 lines (coordinator/container only)
```

**Acceptance Criteria**:
- [ ] TradePanel.tsx reduced to <500 lines
- [ ] Each tab component is self-contained with typed props
- [ ] All functionality preserved (no regression)
- [ ] Build passes

---

## PRIORITY 2: Quick Wins (20 min)

### TASK-003: Lower Happiness Failure Threshold
**Agent**: rome-gameplay
**Time**: 5 min
**Impact**: MEDIUM - 25% threshold may be too harsh for new players

**Context**:
- `FAILURE_MIN_HAPPINESS = 25` at `/home/clark/romelife/game/src/core/constants/index.ts` line 367
- Failure check at `/home/clark/romelife/game/src/core/rules/index.ts` lines 118-119
- New players may fail before understanding happiness mechanics

**Files**:
- `/home/clark/romelife/game/src/core/constants/index.ts`

**Change**:
```typescript
// Line 367: Change from 25 to 20
FAILURE_MIN_HAPPINESS: 20,  // Was 25, lowered for new player friendliness
```

**Acceptance Criteria**:
- [ ] Threshold changed to 20%
- [ ] Playtest confirms improved new player survival

---

### TASK-004: Add ARIA Labels to Core Navigation
**Agent**: rome-design
**Time**: 10 min
**Impact**: MEDIUM - Accessibility compliance, only 3 ARIA attributes exist

**Context**:
- Screen readers cannot navigate game effectively
- Focus on interactive elements: tabs, buttons, header

**Files**:
- `/home/clark/romelife/game/src/components/game/TabNavigation.tsx`
- `/home/clark/romelife/game/src/components/game/TerminalHeader.tsx`

**Implementation**:
```tsx
// TabNavigation.tsx - Each tab button:
<button
  aria-label={`Navigate to ${tab.label} panel`}
  aria-current={activeTab === tab.id ? 'page' : undefined}
  role="tab"
>

// TerminalHeader.tsx - Header wrapper:
<header role="banner" aria-label="Game status and controls">
<nav role="navigation" aria-label="Main game navigation">
```

**Acceptance Criteria**:
- [ ] All tab buttons have aria-label
- [ ] Header has role="banner"
- [ ] Navigation has role="navigation"

---

### TASK-005: Add typecheck Script to package.json
**Agent**: rome-dev
**Time**: 5 min
**Impact**: LOW - `npm run typecheck` currently fails

**Context**:
- TypeScript checking only happens during build
- Should have standalone script for CI/pre-commit hooks

**Files**:
- `/home/clark/romelife/game/package.json`

**Implementation**:
```json
{
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

**Acceptance Criteria**:
- [ ] `npm run typecheck` works
- [ ] Returns exit code 0 on clean codebase

---

## PRIORITY 3: Polish (10 min)

### TASK-006: Document Balance Constants
**Agent**: rome-gameplay
**Time**: 5 min
**Impact**: LOW - Improves future balance work

**Context**:
- `GAME_CONSTANTS` in constants/index.ts lacks documentation
- Developers must reverse-engineer meaning

**Files**:
- `/home/clark/romelife/game/src/core/constants/index.ts` (lines 360-380)

**Implementation**:
```typescript
/**
 * FAILURE CONDITIONS
 * These thresholds trigger game-over states
 */

/** Consecutive seasons of starvation before game over */
FAILURE_STARVATION_LIMIT: 3,

/** Population below this triggers collapse */
FAILURE_MIN_POPULATION: 30,

/**
 * Happiness below this triggers civil unrest game over.
 * @balance Lowered from 25 to 20 in Sprint 2026-01-01
 */
FAILURE_MIN_HAPPINESS: 20,
```

**Acceptance Criteria**:
- [ ] All failure constants have JSDoc comments
- [ ] Comments explain gameplay impact

---

### TASK-007: Add Save Status Indicator
**Agent**: rome-design
**Time**: 5 min
**Impact**: LOW - Visual polish for TASK-001

**Context**:
- Show last save timestamp in header
- Indicate if game has unsaved changes

**Files**:
- `/home/clark/romelife/game/src/components/game/TerminalHeader.tsx`

**Implementation**:
```tsx
// Show last save time
const lastSave = localStorage.getItem('rome-empire-save');
const lastSaveTime = lastSave ? JSON.parse(lastSave)?.state?.timestamp : null;

// In header:
{lastSaveTime && (
  <span className="text-xs text-amber-600/60">
    Saved: {new Date(lastSaveTime).toLocaleTimeString()}
  </span>
)}
```

**Acceptance Criteria**:
- [ ] Last save time displays in header
- [ ] Updates after manual save

---

## Backlog (Not in This Sprint)

### Technical Debt
- [ ] Split `gameStore.ts` (1,755 lines) into domain slices
- [ ] Split `math/index.ts` (990 lines) by domain
- [ ] Add unit tests for core math/rules

### Features
- [ ] FEAT-002: Infinite Mode UI trigger
- [ ] FEAT-003: Unit test setup (Jest/Vitest)

### Balance
- [ ] Add cavalry charge bonus to justify cost
- [ ] Soft cap infinite mode scaling past round 50
- [ ] Make "City of Glory" 90% happiness more achievable

### Accessibility
- [ ] Ensure 44px minimum touch targets
- [ ] Add loading states/skeletons
- [ ] Add error boundaries

---

## Agent Assignments Summary

| Task | Agent | Time | Priority | Status |
|------|-------|------|----------|--------|
| TASK-001: Save/Load UI | rome-dev | 15 min | P1 | Pending |
| TASK-002: Split TradePanel | rome-architect | 15 min | P1 | Pending |
| TASK-003: Happiness Threshold | rome-gameplay | 5 min | P2 | Pending |
| TASK-004: ARIA Labels | rome-design | 10 min | P2 | Pending |
| TASK-005: Typecheck Script | rome-dev | 5 min | P2 | Pending |
| TASK-006: Document Constants | rome-gameplay | 5 min | P3 | Pending |
| TASK-007: Save Indicator | rome-design | 5 min | P3 | Pending |

**Total Estimated Time**: 60 minutes

---

## Execution Plan

### Parallel Execution Groups

**Group 1 (Parallel, 15 min)**:
- rome-dev: TASK-001 (Save/Load UI)
- rome-architect: TASK-002 (Split TradePanel)

**Group 2 (Parallel, 10 min)**:
- rome-gameplay: TASK-003 (Happiness) + TASK-006 (Docs)
- rome-design: TASK-004 (ARIA)
- rome-dev: TASK-005 (Typecheck)

**Group 3 (Sequential, 5 min)**:
- rome-design: TASK-007 (Save Indicator) - depends on TASK-001

---

## Definition of Done

- [ ] All Priority 1 tasks completed
- [ ] Build passes (`npm run build`)
- [ ] No new lint errors (`npm run lint`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Save/Load buttons visible and functional
- [ ] TradePanel.tsx < 500 lines
- [ ] SPRINT.md updated with completion status

---

## Sprint Notes

### Key Discoveries
1. **Save/Load Works Automatically**: Zustand persist saves to localStorage. Just need UI visibility.
2. **TradePanel is 2x Larger Than Next Component**: At 1,433 lines, it's 620 lines larger than MapPanel.
3. **Almost No Accessibility**: Only 3 ARIA attributes in entire codebase.
4. **Missing typecheck Script**: Easy fix for better DX.

### Files Modified This Sprint
```
Modified:
  /home/clark/romelife/game/src/components/game/TerminalHeader.tsx
  /home/clark/romelife/game/src/components/game/TabNavigation.tsx
  /home/clark/romelife/game/src/components/game/TradePanel.tsx
  /home/clark/romelife/game/src/core/constants/index.ts
  /home/clark/romelife/game/package.json

Created:
  /home/clark/romelife/game/src/components/trade/index.ts
  /home/clark/romelife/game/src/components/trade/types.ts
  /home/clark/romelife/game/src/components/trade/QuickTradeTab.tsx
  /home/clark/romelife/game/src/components/trade/TradeRoutesTab.tsx
  /home/clark/romelife/game/src/components/trade/CaravanTab.tsx
  /home/clark/romelife/game/src/components/trade/MarketIntelTab.tsx
  /home/clark/romelife/game/src/components/trade/constants.ts
```

---

## Execution Command

```bash
# Launch sprint swarm - 5 agents in parallel
claude "Execute /home/clark/romelife/game/SPRINT.md - spawn agents for all Priority 1 and 2 tasks in parallel. Complete within 1 hour. Commit working increments. Gloria Romae!"
```

---

*Ave Caesar! Sprint begins now.*
