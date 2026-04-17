# backlog.md — Rome Empire Builder QA Backlog

Generated: 2026-04-17 (cycle 4: 2026-04-17)
Cap: 25 open items. Keep under this threshold.
Source: three-role QA playthrough (Noob/Avg/Goat) + code audit + systems-balance-critic.

## Cycle 4 QA Findings (2026-04-17)
- Noob (Romulus default, 15 Space presses): reaches round 4 winter. Pop grows 104→150 (hits housing cap). Morale decays 90→60 naturally. Piety stays 0 throughout. No deficit warnings. Stable but stagnant — no progression beyond the cap.
- Avg (Romulus+Jupiter patron, 25 presses): round 7 summer final. Pop 115, happiness 90%, morale 30, **piety 0 (patron set but worship never registered)**. Starvation warning + DEFICIT -10% both triggered at round 7. Emergency Actions panel surfaced correctly.
- Goat (Remus + aggressive tax, 35 presses): **FAMINE failure at round 7 autumn**. Pop 150→128→115→104 over 3 seasons. Morale collapse 90→15. Happiness 78%. Confirms that BL-28 grain buff insufficient for aggressive/tax-heavy play.
- Targeting this cycle (fix 5): **BL-10, BL-22, BL-29, BL-30, BL-32**.

## Current Cycle (Round 1 — FIXED this pass: BL-10, BL-22, BL-29, BL-30, BL-32)

### [~] BL-10 — Morale has no recovery action
Severity: MEDIUM (upgraded from LOW — confirmed by 3-role QA: morale falls 90→15 unstoppably for Goat, 90→30 for Avg)
Location: `game/src/components/game/MilitaryPanel.tsx`, `game/src/store/gameStore.ts`
Symptom: Morale decays every winter (-15) and after every battle, with no player-controlled recovery action. Passive stat tax; no Rally/Triumph/Parade button.
Fix target: Add "Rally Troops" action in Military panel (or Senate Quick Action) that trades denarii/grain for +15 morale with 3-round cooldown.

### [~] BL-22 — Avg: worship cooldown UI unclear
Severity: LOW → MEDIUM (3-role QA showed greyed-out worship buttons across all patrons)
Location: `game/src/components/game/ReligionPanel.tsx:301-380`
Symptom: After worship, button greys out with no cooldown timer visible. Player cannot tell when worship is available again.
Fix target: Show "Cooldown: N seasons" badge on disabled worship buttons; read from `worshipCooldowns` state.

### [~] BL-29 — Piety locked at 0 for Avg despite patron god + worship clicks
Severity: MEDIUM — NEW (2026-04-17)
Location: `game/src/components/game/ReligionPanel.tsx`, `game/src/store/gameStore.ts:worship()`
Symptom: Playwright Avg role sets Jupiter patron, reaches Worship tab, clicks action, but piety stays 0 for 25 seasons. Either (a) worship call fails silently when on wrong sub-tab, (b) the general `getByRole('button', {name: /worship|pray/i})` selector matches the Worship tab button instead of an action, or (c) piety gain is gated on a resource the test-start never has.
Fix target: Ensure the three worship actions expose `data-testid="worship-action-<id>"` attributes and the worship store action returns a truthy boolean result the UI can log. Also guarantee each worship has a minimum +2 piety so zero-resource players still progress.

### [~] BL-30 — Goat/Remus aggressive-tax path still hits FAMINE at round 7
Severity: MEDIUM — NEW (2026-04-17)
Location: `game/src/store/gameStore.ts` (initial state), `game/src/app/usecases/index.ts` (consumption), `game/src/core/math/index.ts:calculateFoodConsumption`
Symptom: Start game, choose Remus, click Economy tab, raise tax 5 times, press Space 35×. At round 7 autumn the game transitions to `stage: "results"` with Famine. Pop falls 150→128→115→104 across three consecutive seasons. BL-28 raised starting grain to 750 but (a) Remus gets no grain production bonus and (b) max-tax lowers happiness which throttles pop-growth-sanitation, not consumption, so it still runs out.
Fix target: Either make the first `Farm Complex` building auto-buildable on round 3 tutorial nudge, OR soften the second-starvation → Famine trigger when grain deficit is ≤20% in rounds 5-10.

### [~] BL-32 — 3-role spec STAGNATION false positive on Noob
Severity: LOW (tooling) — NEW (2026-04-17)
Location: `game/tests/three-roles-qa.spec.ts:144-149`
Symptom: Noob presses Space 15 times and reaches round 4 (4 rounds × 4 seasons = 16 seasons expected). The stagnation heuristic compares unique rounds to `rounds.length/2` which always fails when the game runs correctly (15 presses = ~4 unique rounds). Test always flags "STAGNATION" even on healthy runs.
Fix target: Change heuristic to detect only actual hangs — e.g., `unique < 2 when rounds.length > 8`, or compare `max(round) - min(round)` across the window.

---

## Round 2 — Queued Open (10 items remaining after this cycle's 5 fixes)

### BL-11 — Reputation gains too slow
Severity: LOW — +20/10 seasons → trivial. Fix: add reputation thresholds (50/100/150) unlocking diplomacy/troop bonuses.

### BL-12 — Market volatility is pure noise
Severity: LOW — ±4 random/season. Fix: seasonal trend (grain up in winter), demand shock on caravan arrival.

### BL-13 — Infinite mode enemy scaling exponential
Severity: LOW — `1.03^round` past round 50 outpaces linear resource growth. Fix: cap at 2× or match with scaling bonuses.

### BL-14 — Territory count fluctuates between rounds
Severity: LOW — UI/state desync; investigate `territories` derivation and round-start snapshot.

### BL-19 — xorshift32 PRNG dead code; non-deterministic games
Severity: LOW — PRNG defined but `random()` uses `Math.random()`. Fix: remove dead code or wire `random()` to seed.

### BL-25 — 3-role spec round counter reads −1 (store not on window)
Severity: LOW (tooling) — `tests/three-roles-qa.spec.ts` can't read round; `window.__gameStore` not exposed. Fix: expose zustand store on window in dev OR scrape DOM TerminalHeader.

### BL-33 — Deficit hits Avg at round 7 despite no active overspend
Severity: MEDIUM — NEW (2026-04-17) — Avg screenshot shows `DEFICIT -10%` with no visible drain cause. Net Income tile reports `-1% (season)` and `Food Consumption -42`. Likely small garrison upkeep + no trade income gradually compounds.
Fix target: Audit default-path income/expense at round 6-8 for a single Palatine Hill empire; add a UI tooltip that itemizes the deficit line ("Garrison: -15, Trade: 0, Tax: +28...").

### BL-34 — Emergency Actions panel appears even when happiness ≥ 80% (Avg)
Severity: LOW — NEW (2026-04-17) — Avg screenshot shows "Crisis Mode Active" panel opened at round 7 summer when happiness = 90%, pop = 115. Emergency actions (Grain Requisition, Conscription) surface despite non-crisis state.
Fix target: Tighten `isCrisisMode` gate — require `happiness < 60 OR grainDeficit > 20 OR morale < 30` (not just "has starvation warning in last 3 seasons").

### BL-35 — Population oscillates 150 → 142 → 150 in one round (Avg round 5)
Severity: LOW — NEW (2026-04-17) — Avg log shows pop 150 (spring) → 142 (summer) → 150 (autumn) within a single round. Suggests housing-cap check runs before migration/growth, or growth+cap clamp ping-pongs.
Fix target: Order of ops in `endSeason` — apply growth, then migration, then housing-cap clamp exactly once per season.

### BL-36 — Patron god piety gain not tutorialized
Severity: LOW — NEW (2026-04-17) — With patron set, piety remains 0 unless the player actively visits Worship sub-tab and clicks an action. No hint in Overview/Imperial Log that worship is available.
Fix target: Add "Your patron god awaits offerings — visit the Worship tab" event in `lastEvents` the first round after patron selection.

---

## Round 2 — Previously Fixed (prior cycles)

### [x] BL-06 — Wonder queue limit artificial
Fix applied: `maxWonderSlots = 1 + Math.floor(ownedTerritories/3)`, counted vs wonders-in-progress before startWonder gate.

### [x] BL-07 — Senator event effects uncapped
Fix applied: `clampSenateEventEffect()` caps per-event delta to ±15-20 for happiness/pop/morale/piety and ±30% (min ±500) for denarii.

### [x] BL-15 — Jupiter tier 100 dominance
Fix applied: In `hasAllBlessings` branch, patron god blessings at 1.0× and non-patron at 0.5× potency.

### [x] BL-18 — Population growth floor silent death spiral
Fix applied: endSeason pushes sanitation-critical warning to `lastEvents` when popGrowth < 0.

### [x] BL-21 — Noob: no early-game feedback on tax/deficit
Fix applied: Deficit + low-grain warnings pushed to season events with 2-round cooldown; red DEFICIT badge on Treasury stat.

### [x] BL-23 — Goat: tax slider has no per-tick preview
Fix applied: `calculateTaxHappinessDelta()` helper shared with usecases; slider caption shows Δhappiness/season.

### [x] BL-24 — Population happiness floor too brittle for Noob
Fix applied: `getHappinessFailureThreshold(round)` ramps 15% → 25% with linear interpolation.

### [x] BL-26 — DB save API spams errors when Postgres unavailable
Fix applied: try/catch wraps all db operations with module-level `dbUnavailable` flag.

### [x] BL-27 — `game-qa.spec.ts` intro text outdated
Fix applied: Replaced `getByText('FOUNDING OF ROME')` with `getByRole('button', { name: /Begin Your Legacy/i })`.

### [x] BL-28 — Early famine at round 5-6 for Avg/Goat despite grace period
Fix applied: Starting grain raised to 750 (capacity 900); defensive `[BL-28][pacing]` console.warn.

### [x] BL-08 — Stability system binary
Fix: Piecewise linear garrison scaling clamped [−5,+5].

### [x] BL-09 — Stagnation edge cases
Fix: Promote next `pendingEvents` to `currentEvent` at start of endSeason.

### [x] BL-16 — Starting denarii docs mismatch
Fix: Docs updated 500 → 5000.

### [x] BL-17 — Battle victory has no base denarii reward
Fix: `basePlunder = 100 + difficulty*20`.

### [x] BL-20 — Senator relation reset edge case at round 19
Fix: `lastProcessedRound` field; idempotency guard.

### [x] BL-01 — Trade hub focus stacking can invert tariff
Fix: Clamp `focusTariffReduction` ≤ 0.80.

### [x] BL-02 — Trade risk ceiling too low
Fix: Raised `TRADE_RISK_MAX` to 0.40.

### [x] BL-03 — Battle odds randomized before display
Fix: Removed variance from `calculateBattleOdds`.

### [x] BL-04 — Minerva tier 50 free tech too weak
Fix: 1 free tech per 3 rounds; +2 at tier 75.

### [x] BL-05 — Religious events no cooldown
Fix: 4-round cooldown.

---

## Status Legend
- [ ] open
- [~] in progress (being fixed this cycle)
- [x] fixed
