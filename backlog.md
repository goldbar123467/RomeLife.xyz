# backlog.md — Rome Empire Builder QA Backlog

Generated: 2026-04-17 (last cycle: 2026-04-17)
Cap: 25 open items. Keep under this threshold.
Source: three-role QA playthrough (Noob/Avg/Goat) + code audit of `game/bugs.md` + systems-balance-critic.

## Current Cycle (5 items — FIXED this pass: BL-08, BL-09, BL-16, BL-17, BL-20)

### [x] BL-08 — Stability system binary
Severity: HIGH — `game/src/core/math/index.ts:571-620`
Fix applied: Piecewise linear garrison scaling (0→−2, 25→+1, 50+→+2) clamped [−2,+2]; fort/defensive building adds +0.5; governor.bonus.stability multiplies `(1 + bonus)`; final clamp [−5,+5].

### [x] BL-09 — Stagnation edge cases
Severity: HIGH — `game/src/store/gameStore.ts:596-627`, `game/src/app/usecases/senate.ts:393-425`
Fix applied: At start of `endSeason()`, promote next `pendingEvents` to `currentEvent` before guards. Added battle-active guard (`state.battle?.active || state.stage === 'battle'`). Senate processor preserves existing `currentEvent` so new events queue instead of clobbering displayed one.

### [x] BL-16 — Starting denarii docs mismatch
Severity: MEDIUM — `CLAUDE.md:280`
Fix applied: Updated docs from "500 denarii" to "5000 denarii" to match code `STARTING_STATE.denarii = 5000`.

### [x] BL-17 — Battle victory has no base denarii reward
Severity: MEDIUM — `game/src/store/gameStore.ts:781-806`
Fix applied: `basePlunder = 100 + difficulty * 20` using `territory.difficulty` (with `Math.max(1, level)` fallback). Jupiter tier 50 bonus now stacks on top of base. Event log shows plunder amount explicitly.

### [x] BL-20 — Senator relation reset edge case at round 19
Severity: HIGH — `game/src/app/usecases/senate.ts:92-103`, `game/src/core/types/senate.ts:287-293`
Fix applied: Added `lastProcessedRound: number` to SenateState. Idempotency guard in `processSenateSeasonEnd` short-circuits duplicate same-round calls. Initial/reset senate states seed `lastProcessedRound: 0`.

---

## Previously Fixed (prior cycle)

### [x] BL-01 — Trade hub focus stacking can invert tariff
Severity: HIGH
Location: `game/src/app/usecases/index.ts:923-932`
Problem: `focusTariffReduction` accumulates `+0.20` per trade_hub territory with no cap. With 6+ trade hubs + Mercury tier 50, the inner term goes negative, causing tariffs to *add* revenue instead of subtract. Late-game exploit.
Fix: Clamp `focusTariffReduction` to ≤ 0.80 and clamp final `tariffMod` to `[0.0, 1.0]`.

### [x] BL-02 — Trade risk ceiling too low (BUG-H03)
Severity: HIGH
Location: `game/src/core/constants/index.ts` (`TRADE_RISK_MAX: 0.25`)
Problem: Max trade risk of 25% makes caravans trivially safe; players spam-trade for guaranteed denarii.
Fix: Raise `TRADE_RISK_MAX` to 0.40 and optionally scale risk by cargo value.

### [x] BL-03 — Battle odds randomized before display (misleads player)
Severity: HIGH
Location: `game/src/core/math/index.ts:~483` (`calculateBattleOdds` applies `randomFloat(0.9, 1.1)`)
Problem: Odds shown to player already baked in one RNG roll; `resolveBattle` rolls again against those odds. Displayed % does not match true win probability.
Fix: Remove variance from `calculateBattleOdds`; apply weather variance only in `resolveBattle` outcome calc.

### [x] BL-04 — Minerva tier 50 free tech too weak (BUG-H05)
Severity: HIGH
Location: `game/src/app/usecases/index.ts` Minerva free-tech branch
Problem: "1 free tech per 5 rounds" gives ≈60-100 denarii value, trivial vs tax income. Minerva feels useless compared to Mars/Jupiter.
Fix: Buff to 1 free tech per 3 rounds; add +2 at Minerva tier 75.

### [x] BL-05 — Religious events have no cooldown (can fire repeatedly)
Severity: MEDIUM
Location: `game/src/core/constants/religion.ts:355-362`, `game/src/app/usecases/index.ts:437-455`
Problem: `rollReligiousEvent()` ignores `state.eventCooldowns`. "Divine Wrath" (−20 piety, −50 grain, −15 morale) can fire consecutive seasons for unrecoverable damage.
Fix: Track religious events in the same `eventCooldowns` map used for empire events; apply 4-round cooldown.

---

## Backlog (queued for future cycles)

### BL-06 — Wonder queue limit artificial (BUG-M04)
Severity: MEDIUM — `src/store/gameStore.ts:1068-1073` — Only 1 wonder at a time regardless of empire size. Fix: allow `1 + floor(territories/3)`.

### BL-07 — Senator event effects uncapped (BUG-M07)
Severity: MEDIUM — Single senator events swing denarii/happiness by 20k+ in one round. Fix: clamp per-event delta (≤ 20 happiness, ≤ 30% denarii).

### BL-08 — Stability system still binary (BUG-H04)
Severity: HIGH — `src/core/math/index.ts:577-579` — `garrison > 20 ⇒ +1`, else `−2`. No garrison-quality scaling. Fix: scale by garrison/fort/governor.

### BL-09 — Stagnation edge cases remain (BUG-C05)
Severity: HIGH — Partial fix in place; still possible when multiple queued senate events + battle collide. Fix: verify `pendingEvents` fully drains and resolve order is deterministic.

### BL-10 — Morale has no recovery action (BUG-L01)
Severity: LOW — Passive stat tax. Fix: add "Rally Troops" worship/senate action; bump +10 morale after decisive victory.

### BL-11 — Reputation gains too slow (BUG-L02)
Severity: LOW — +20/10 seasons → trivial. Fix: add reputation thresholds (50/100/150) that unlock diplomacy/troop bonuses.

### BL-12 — Market volatility is pure noise (BUG-L03)
Severity: LOW — ±4 random/season. Fix: seasonal trend (grain up in winter), demand shock on caravan arrival.

### BL-13 — Infinite mode enemy scaling exponential (BUG-L04)
Severity: LOW — `1.03^round` past round 50 outpaces linear resource growth. Fix: cap at 2× or match with scaling bonuses.

### BL-14 — Territory count fluctuates between rounds (BUG-L05)
Severity: LOW — UI/state desync; investigate `territories` derivation and round-start snapshot.

### BL-15 — Jupiter tier 100 dominance over all gods
Severity: MEDIUM — `src/core/constants/religion.ts:337-349` — "All blessings active" grants Mars/Ceres/Venus/Mercury/Minerva bonuses to Jupiter patrons with no tradeoff. Fix: require min favor with each god, or apply at 50% potency for non-patrons.

### BL-16 — Starting denarii mismatch (docs vs code)
Severity: MEDIUM — CLAUDE.md says 500, `STARTING_STATE.denarii = 5000`. Either compresses early-game tension or docs are wrong. Fix: pick one and align.

### BL-17 — Battle victory has no base denarii reward
Severity: MEDIUM — Non-Jupiter patrons get 0 gold for conquest; recruitment + food = pure cost sink. Fix: add `100 + difficulty*2` base reward, Jupiter adds on top.

### BL-18 — Population growth floor silent death spiral
Severity: LOW — `calculatePopulationGrowth` returns −1 when sanitation < 15 with excess housing; no UI warning. Fix: add sanitation-critical warning + surface recovery action.

### BL-19 — xorshift32 PRNG dead code; non-deterministic games
Severity: LOW — PRNG defined but `random()` uses `Math.random()`. Save/load replay-safety impossible. Fix: either remove dead code or wire `random()` to seed.

### BL-20 — Senator relation reset edge case at round 19 (BUG-H06)
Severity: HIGH — Stagnation-related state corruption. Needs verification post-BL-09 fix.

### BL-21 — Noob role: no early-game feedback on tax/deficit
Severity: MEDIUM — Noob plays 15 seasons pressing Space; negative net income never surfaced until famine. Fix: toast on first negative-income season + tutorial tooltip.

### BL-22 — Avg role: worship cooldown UI unclear
Severity: LOW — After worship, button greys out with no cooldown timer visible. Fix: show "Cooldown: 2 seasons" on disabled worship buttons.

### BL-23 — Goat role: tax slider has no per-tick preview
Severity: MEDIUM — Goat maxes tax blind, then discovers happiness crash after endSeason. Fix: show projected Δhappiness next to tax slider.

### BL-24 — Population happiness floor too brittle for Noob
Severity: MEDIUM — Happiness tanks to 12% by round 12 for uninformed Noob player; doc threshold (25%) kicks failure. Fix: pacing review — late grace for happiness too (linear ramp 25% → 20% rounds 12-20).

### BL-25 — 3-role spec round counter reads −1 (store not on window)
Severity: LOW (tooling) — `tests/three-roles-qa.spec.ts` cannot read round via `window.__gameStore`. Fix: expose zustand store on `window` in dev mode, or scrape DOM `TerminalHeader` stats.

---

## Status Legend
- [ ] open
- [~] in progress
- [x] fixed
