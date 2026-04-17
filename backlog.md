# backlog.md — Rome Empire Builder QA Backlog

Generated: 2026-04-17 (cycle 2: 2026-04-17)
Cap: 25 open items. Keep under this threshold.
Source: three-role QA playthrough (Noob/Avg/Goat) + code audit + systems-balance-critic.

## Current Cycle (Round 1 — FIXED this pass: BL-06, BL-07, BL-15, BL-21, BL-23)

### [x] BL-06 — Wonder queue limit artificial
Severity: MEDIUM — `game/src/store/gameStore.ts:1350-1358`
Fix applied: `maxWonderSlots = 1 + Math.floor(ownedTerritories/3)`, counted vs wonders-in-progress before startWonder gate.

### [x] BL-07 — Senator event effects uncapped
Severity: MEDIUM — `game/src/app/usecases/senate.ts:582-628`, `game/src/store/gameStore.ts:1872-1882`
Fix applied: `clampSenateEventEffect()` caps per-event delta to ±15-20 for happiness/pop/morale/piety and ±30% (min ±500) for denarii. Clamp notices append to lastEvents.

### [x] BL-15 — Jupiter tier 100 dominance
Severity: MEDIUM — `game/src/core/constants/religion.ts:336-348`
Fix applied: In `hasAllBlessings` branch, patron god blessings at 1.0× and non-patron at 0.5× potency.

### [x] BL-21 — Noob: no early-game feedback on tax/deficit
Severity: MEDIUM — `game/src/app/usecases/index.ts:116-142`, `game/src/components/game/OverviewPanel.tsx:146-161`
Fix applied: Deficit + low-grain warnings pushed to season events with 2-round cooldown; red DEFICIT badge on Treasury stat.

### [x] BL-23 — Goat: tax slider has no per-tick preview
Severity: MEDIUM — `game/src/components/game/EconomyPanel.tsx:200-204`, `game/src/core/math/index.ts:317-339`
Fix applied: `calculateTaxHappinessDelta()` helper shared with usecases; slider caption shows Δhappiness/season vs 10% baseline (red/green/muted).

---

## Round 2 — Queued Open (10 items)

### BL-10 — Morale has no recovery action
Severity: LOW — Passive stat tax. Fix: add "Rally Troops" worship/senate action; bump +10 morale after decisive victory.

### BL-11 — Reputation gains too slow
Severity: LOW — +20/10 seasons → trivial. Fix: add reputation thresholds (50/100/150) unlocking diplomacy/troop bonuses.

### BL-12 — Market volatility is pure noise
Severity: LOW — ±4 random/season. Fix: seasonal trend (grain up in winter), demand shock on caravan arrival.

### BL-13 — Infinite mode enemy scaling exponential
Severity: LOW — `1.03^round` past round 50 outpaces linear resource growth. Fix: cap at 2× or match with scaling bonuses.

### BL-14 — Territory count fluctuates between rounds
Severity: LOW — UI/state desync; investigate `territories` derivation and round-start snapshot.

### BL-18 — Population growth floor silent death spiral
Severity: LOW — `calculatePopulationGrowth` returns −1 when sanitation < 15 with excess housing; no UI warning. Fix: sanitation-critical warning + recovery surface.

### BL-19 — xorshift32 PRNG dead code; non-deterministic games
Severity: LOW — PRNG defined but `random()` uses `Math.random()`. Fix: remove dead code or wire `random()` to seed.

### BL-22 — Avg: worship cooldown UI unclear
Severity: LOW — After worship, button greys out with no cooldown timer visible. Fix: show "Cooldown: 2 seasons" on disabled buttons.

### BL-24 — Population happiness floor too brittle for Noob
Severity: MEDIUM — Happiness tanks to 12% by round 12; doc threshold (25%) triggers failure. Fix: linear-ramp failure threshold (25% → 20% rounds 12-20).

### BL-25 — 3-role spec round counter reads −1 (store not on window)
Severity: LOW (tooling) — `tests/three-roles-qa.spec.ts` can't read round; `window.__gameStore` not exposed. Fix: expose zustand store on window in dev OR scrape DOM TerminalHeader.

---

## Round 2 — New Items from QA (3 items)

### BL-26 — DB save API spams errors when Postgres unavailable
Severity: MEDIUM — `game/src/app/api/game/save/route.ts`
Symptom: 50+ `DrizzleQueryError: connect ECONNREFUSED 127.0.0.1:5432` stack traces per test run.
Repro: run any Playwright test without `pg` running; every `endSeason()` triggers a failed save.
Fix: try/catch around db call; log as warning once per session, swallow otherwise. Game must still work.

### BL-27 — `game-qa.spec.ts` intro text outdated
Severity: LOW (tooling) — `game/tests/game-qa.spec.ts:16`
Symptom: 12/13 tests fail at startup on `getByText('FOUNDING OF ROME')`; intro renamed to "ROME LIFE".
Repro: `cd game && npx playwright test tests/game-qa.spec.ts`
Fix: update locator to `/ROME LIFE/i` or `/Begin Your Legacy/i`.

### BL-28 — Early famine at round 5-6 for Avg/Goat despite grace period
Severity: MEDIUM — `game/src/app/usecases/index.ts` consumption path
Symptom: Avg (Romulus+Jupiter worship) and Goat (Remus+tax push) both hit Famine failure by round 5-6 with starting grain 120 and grace-period 75% consumption claimed for rounds 1-8.
Repro: start game, pick any patron, press Space 5-6×, observe Famine failure with no negative plays.
Fix: verify GRACE_MULTIPLIERS round-boundary indexing, confirm starting grain matches consumption curve, or raise starting grain to 150. Related to BL-24 but distinct (pacing, not threshold).

---

## Previously Fixed (prior cycle)

### [x] BL-08 — Stability system binary
Severity: HIGH — `game/src/core/math/index.ts:571-620`
Fix: Piecewise linear garrison scaling (0→−2, 25→+1, 50+→+2) clamped [−2,+2]; fort/defensive building +0.5; governor multiplies `(1 + bonus)`; final clamp [−5,+5].

### [x] BL-09 — Stagnation edge cases
Severity: HIGH — `game/src/store/gameStore.ts:596-627`, `game/src/app/usecases/senate.ts:393-425`
Fix: Promote next `pendingEvents` to `currentEvent` at start of endSeason. Battle-active guard. Senate processor preserves existing currentEvent.

### [x] BL-16 — Starting denarii docs mismatch
Severity: MEDIUM — `CLAUDE.md:280`
Fix: Docs updated 500 → 5000.

### [x] BL-17 — Battle victory has no base denarii reward
Severity: MEDIUM — `game/src/store/gameStore.ts:781-806`
Fix: `basePlunder = 100 + difficulty*20` using territory.difficulty with Math.max(1, level) fallback. Jupiter tier 50 stacks on top.

### [x] BL-20 — Senator relation reset edge case at round 19
Severity: HIGH — `game/src/app/usecases/senate.ts:92-103`
Fix: `lastProcessedRound` field; idempotency guard short-circuits duplicate same-round calls.

### [x] BL-01 — Trade hub focus stacking can invert tariff
Fix: Clamp `focusTariffReduction` ≤ 0.80, clamp final `tariffMod` to [0.0, 1.0].

### [x] BL-02 — Trade risk ceiling too low
Fix: Raised `TRADE_RISK_MAX` to 0.40.

### [x] BL-03 — Battle odds randomized before display
Fix: Removed variance from `calculateBattleOdds`; weather variance only in `resolveBattle`.

### [x] BL-04 — Minerva tier 50 free tech too weak
Fix: 1 free tech per 3 rounds; +2 at tier 75.

### [x] BL-05 — Religious events no cooldown
Fix: Religious events use shared `eventCooldowns`; 4-round cooldown.

---

## Status Legend
- [ ] open
- [~] in progress
- [x] fixed
