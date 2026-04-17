# backlog.md — Rome Empire Builder QA Backlog

Generated: 2026-04-17 (cycle 6: 2026-04-17)
Cap: 25 open items. Keep under this threshold.
Source: three-role QA playthrough (Noob/Avg/Goat) + code audit + systems-balance-critic.

## Cycle 6 QA Findings (2026-04-17)
- Noob (Romulus, 15 presses): pop 150 at round 3, stays capped through round 4 winter. Morale 88, happiness 90, piety 0. Healthy but completely stagnant — passive play stalls at housing cap with no progression signal.
- Avg (Romulus+Jupiter, 25 presses): reached round 7 summer. **Piety gained only 2→4 across 25 worship clicks** (BL-29/BL-37 floor works but cooldown gates too aggressively). Pop oscillates 150→159→136→137 in 2 rounds. Starvation+Crisis Mode Active despite happiness 88% and 137 pop (BL-34 not fixed).
- Goat (Remus aggressive-tax, 35 presses): **FAILED at round 7 autumn** (stage="results", Famine). Pop cascade 168→143→129, morale 92→89→94→86 (morale stable!), happiness 100→90→85→80, 7085 denarii unspent. BL-30/BL-38 starvation recovery grace insufficient — death spiral still triggers on aggressive tax.
- Targeting this cycle (fix 5): **BL-40, BL-41, BL-42, BL-43, BL-44**.

## Cycle 5 QA Findings (2026-04-17)
- Noob (Romulus, 15 presses): healthy. Reaches round 4 winter, pop 159, morale 72, happiness 90. No crises. Piety 0 (no worship interaction).
- Avg (Romulus+Jupiter, 25 presses): reached round 7 summer. **Piety stayed at 0 through all 25 seasons** despite test clicking worship each season — BL-29 fix incomplete. Pop dropped 150→128→115 starting round 7 spring = starvation onset.
- Goat (Remus aggressive-tax, 35 presses): **FAILED at round 7 autumn** (stage="results"). Pop collapse 150→128→107→95→104, morale 62→52→47→32→15, still had 5515 denarii and 25 troops. BL-30 fix insufficient. Morale unrecoverable (BL-10 Rally Troops not surfaced to spec).
- Targeting this cycle (fix 5): **BL-37, BL-38, BL-39, BL-33, BL-36**.

## Cycle 4 QA Findings (2026-04-17)
- Noob (Romulus default, 15 Space presses): reaches round 4 winter. Pop grows 104→150 (hits housing cap). Morale decays 90→60 naturally. Piety stays 0 throughout. No deficit warnings. Stable but stagnant — no progression beyond the cap.
- Avg (Romulus+Jupiter patron, 25 presses): round 7 summer final. Pop 115, happiness 90%, morale 30, **piety 0 (patron set but worship never registered)**. Starvation warning + DEFICIT -10% both triggered at round 7. Emergency Actions panel surfaced correctly.
- Goat (Remus + aggressive tax, 35 presses): **FAMINE failure at round 7 autumn**. Pop 150→128→115→104 over 3 seasons. Morale collapse 90→15. Happiness 78%. Confirms that BL-28 grain buff insufficient for aggressive/tax-heavy play.
- Targeting this cycle (fix 5): **BL-10, BL-22, BL-29, BL-30, BL-32**.

## Current Cycle — TARGETING: BL-40, BL-41, BL-42, BL-43, BL-44

### [~] BL-40 — Goat still FAILS at round 7 autumn (BL-38 regression)
Severity: HIGH — NEW (cycle 6) — BL-38 regression
Location: `game/src/store/gameStore.ts` (endSeason, failure gate), `game/src/app/usecases/index.ts` (executeEndSeason), `game/src/core/math/index.ts:calculateFoodConsumption`
Symptom: Remus + max-tax + 35 Space presses → stage="results" at round 7 autumn (Famine screen shown). Pop cascade 168→143→129 over 2 rounds while holding 7085 denarii and 28 troops. Morale is stable (86-94), so the BL-39 rally action is not the missing piece — the core issue is the grain deficit compounds under aggressive tax because happiness stays high and pop keeps growing toward housing cap. The 2-round recovery grace added in cycle 5 either is not firing or is too thin.
Fix target: (a) When grain deficit ≤ 30% AND denarii ≥ 2000, auto-trigger an "Emergency Grain Import" for 400 denarii → 200 grain at season start (once per 4 rounds). (b) `checkFailureConditions` should only trigger Famine when consecutive starvations ≥ 3 (not 2) in rounds 1-10, upgrading to ≥ 2 from round 11+. (c) Add a console.warn telemetry `[BL-40][famine-trigger]` logging which branch fired for easier future audit.

### [~] BL-41 — Avg piety gains only 4 over 25 worship clicks
Severity: MEDIUM — NEW (cycle 6) — BL-37 partial regression
Location: `game/src/store/gameStore.ts:worship()`, `game/src/components/game/ReligionPanel.tsx` (cooldown gating)
Symptom: Avg Playwright role clicks the worship action every season for 25 seasons, but piety rises from 2 → 4 only. BL-37 set a +2 floor; that part works but worship cooldown (3 seasons?) gates most of the 25 clicks, so the +2 floor only fires ~2-3 times across the whole run. Piety-based blessings are effectively unreachable for passive/average players.
Fix target: (a) When a patron god is set, add passive +1 piety/season regardless of worship clicks. (b) Reduce default worship cooldown from 3 seasons to 2 seasons for the Quick Prayer action. (c) Ensure the Religion panel shows a clear "Next prayer available: round N" caption (BL-22 follow-up).

### [~] BL-42 — Pop oscillates 150→159→136 within 2 seasons (Avg round 6→7)
Severity: MEDIUM — NEW (cycle 6) — BL-35 regression
Location: `game/src/app/usecases/index.ts:executeEndSeason`, `game/src/core/math/index.ts` (pop growth + starvation loss)
Symptom: Avg log: round 6 summer pop=150, round 6 autumn 150, round 6 winter 159, round 7 spring 136. The +9 jump then −23 drop in 2 seasons points to growth firing on stale (pre-starvation-loss) state, or starvation loss rounding on post-growth state. Either way the order of ops ping-pongs.
Fix target: In `executeEndSeason`, explicitly sequence once per season as: (1) compute consumption, (2) apply starvation loss if deficit, (3) compute growth on post-starvation pop, (4) clamp to housing cap exactly once at the end. Add a unit-ish invariant: `pop_after - pop_before <= housing * 0.15` (no >15% swings per season).

### [~] BL-43 — Crisis Mode / Emergency Actions panel shows at 88% happiness, 137 pop (BL-34 regression)
Severity: MEDIUM — NEW (cycle 6) — BL-34 regression  
Location: `game/src/components/game/OverviewPanel.tsx` (isCrisisMode gate), `game/src/store/gameStore.ts`
Symptom: Avg final screenshot shows "Emergency Actions / Crisis Mode Active" panel with full action list (Emergency Taxation, Conscription, Divine Intervention, Grain Requisition, Hire Mercenaries) while happiness=88%, pop=137, morale=94. This is a healthy mid-game state. Panel is surfacing because `lastEvents` contains a stale starvation message, not a live crisis.
Fix target: Gate `isCrisisMode` on **live state only**: `happiness < 55 || morale < 40 || grainDeficitPct > 25 || (round >= 10 && troops < 10)`. Do not use `lastEvents` or historical starvation counters. Rename the panel heading to "Crisis Response" when active, "Quick Actions (Advanced)" when proactive (so it is less alarming).

### [~] BL-44 — Noob game stagnates at pop 150 after round 3 with no progression hint
Severity: LOW — NEW (cycle 6)
Location: `game/src/components/game/OverviewPanel.tsx`, `game/src/store/gameStore.ts` (lastEvents push)
Symptom: Noob (Romulus, 15 Space presses) reaches pop 150 (housing cap) at round 3 summer and stays there through round 4 winter with zero forward motion. Denarii grows 5k→6.4k, happiness oscillates 85→100→90, morale 82→96→88. No event pushed to `lastEvents` nudging the player toward housing expansion or territory conquest. Passive players see no "why is nothing happening" cue.
Fix target: When `round >= 3 && population >= housing * 0.95 && ownedTerritories <= 1`, push a one-time event: "Your population has outgrown your housing — build Insulae in Settlement, or conquer territory on the Map." Also show a pulsing yellow dot on the Settlement sidebar tab in this state.

---

## Previously Fixed — Cycle 5 (verified by git log bcb57f3)

### [x] BL-37 — Avg Gamer piety stays 0 for 25 seasons despite Jupiter patron + worship
Severity: HIGH — PARTIAL FIX (cycle 5) — cycle 6 shows piety now reaches 4, cooldown gating tracked in BL-41.
Location: `game/src/components/game/ReligionPanel.tsx`, `game/src/store/gameStore.ts:worship()`, `game/src/app/usecases/senate.ts`
Fix applied: `worship-action-quick-prayer` data-testid + +2 piety floor per cycle-5 commit. Follow-up BL-41 addresses remaining cooldown gating.

### [x] BL-38 — Goat Gamer still hits "results" stage at round 7 autumn
Severity: HIGH — PARTIAL FIX (cycle 5) — cycle 6 shows the Famine failure still triggers. Follow-up BL-40.
Location: `game/src/store/gameStore.ts` (endSeason, failure check), `game/src/app/usecases/index.ts`
Fix applied: 2-round recovery grace. Did not cover aggressive-tax Remus path; BL-40 extends with auto-import + consecutive-3 gate.

### [x] BL-39 — Morale decay 90→15 unrecoverable in Goat/Avg playthroughs

### [x] BL-37 — Avg Gamer piety stays 0 for 25 seasons despite Jupiter patron + worship
Severity: HIGH — NEW (cycle 5) — BL-29 regression
Location: `game/src/components/game/ReligionPanel.tsx`, `game/src/store/gameStore.ts:worship()`, `game/src/app/usecases/senate.ts`
Symptom: Playwright Avg role (Romulus → Jupiter patron → Worship tab → click action → press Space) produces `piety: 0` in every snapshot from round 1 summer through round 7 summer. BL-29 claimed data-testid and +2 piety floor were added, but Avg still shows 0. Either (a) test selector doesn't find buttons, (b) worship cooldown prevents subsequent calls, or (c) worship action requires resources (grain/denarii) that early-game state lacks.
Fix target: Ensure `worship()` ALWAYS grants at least +2 piety regardless of resources (resource check should only BLOCK optional bonus effects, never piety). Add a dev-mode fallback: if the Avg test calls worship via `page.getByRole('button', {name: /Pray/i})`, make sure a visible "Pray" / "Worship" button exists on the Religion panel main tab (not hidden behind a sub-tab that needs additional clicks).

### [x] BL-38 — Goat Gamer still hits "results" stage at round 7 autumn
Severity: HIGH — NEW (cycle 5) — BL-30 regression
Location: `game/src/store/gameStore.ts` (endSeason, failure check), `game/src/app/usecases/index.ts`
Symptom: Remus + max tax + 35 Space presses → stage="results" at round 7 autumn. Population cascade 150→128→107→95→104, morale 62→52→47→32→15, despite having 5515 denarii and stable 25-28 troops. Previous BL-30 fix targeted starvation gate and starting grain but did not address the compounding morale+pop cascade once the first starvation fires.
Fix target: After first starvation event, add a 2-round "recovery grace" where subsequent starvations apply -5% population loss instead of -15%, and morale decay caps at -5/season. This lets players course-correct instead of death-spiraling. Also ensure `checkFailureConditions()` requires *consecutive* starvations (not just "starvation count >= 2 in any 3-round window").

### [x] BL-39 — Morale decay 90→15 unrecoverable in Goat/Avg playthroughs
Severity: MEDIUM — VERIFIED FIXED (cycle 6) — Goat morale held 92-94 through failure state.
Location: `game/src/components/game/MilitaryPanel.tsx` (Rally Troops visibility), `game/src/store/gameStore.ts:rallyTroops`
Fix applied: Passive morale recovery + Overview surface on morale<50.

### [x] BL-33 — Deficit hits Avg at round 7 despite no active overspend
Severity: MEDIUM — FIXED cycle 5
Location: `game/src/store/gameStore.ts`, `game/src/app/usecases/index.ts`, `game/src/components/game/OverviewPanel.tsx`
Fix applied: Deficit tooltip itemises garrison/trade/tax/building/wonder upkeep.

### [x] BL-36 — Patron god piety gain not tutorialized
Severity: LOW — FIXED cycle 5
Location: `game/src/store/gameStore.ts` (setPatronGod), `game/src/components/game/OverviewPanel.tsx`
Fix applied: lastEvents nudge + Religion red-dot badge when patron set but piety = 0.

---

## Previously Fixed in Cycle 4 (verified by git log)

### [x] BL-10 — Morale has no recovery action
Severity: MEDIUM (upgraded from LOW — confirmed by 3-role QA: morale falls 90→15 unstoppably for Goat, 90→30 for Avg)
Location: `game/src/components/game/MilitaryPanel.tsx`, `game/src/store/gameStore.ts`
Symptom: Morale decays every winter (-15) and after every battle, with no player-controlled recovery action. Passive stat tax; no Rally/Triumph/Parade button.
Fix target: Add "Rally Troops" action in Military panel (or Senate Quick Action) that trades denarii/grain for +15 morale with 3-round cooldown.

### [x] BL-22 — Avg: worship cooldown UI unclear
Severity: LOW → MEDIUM (3-role QA showed greyed-out worship buttons across all patrons)
Location: `game/src/components/game/ReligionPanel.tsx:301-380`
Symptom: After worship, button greys out with no cooldown timer visible. Player cannot tell when worship is available again.
Fix target: Show "Cooldown: N seasons" badge on disabled worship buttons; read from `worshipCooldowns` state.

### [x] BL-29 — Piety locked at 0 for Avg despite patron god + worship clicks
Severity: MEDIUM — NEW (2026-04-17)
Location: `game/src/components/game/ReligionPanel.tsx`, `game/src/store/gameStore.ts:worship()`
Symptom: Playwright Avg role sets Jupiter patron, reaches Worship tab, clicks action, but piety stays 0 for 25 seasons. Either (a) worship call fails silently when on wrong sub-tab, (b) the general `getByRole('button', {name: /worship|pray/i})` selector matches the Worship tab button instead of an action, or (c) piety gain is gated on a resource the test-start never has.
Fix target: Ensure the three worship actions expose `data-testid="worship-action-<id>"` attributes and the worship store action returns a truthy boolean result the UI can log. Also guarantee each worship has a minimum +2 piety so zero-resource players still progress.

### [x] BL-30 — Goat/Remus aggressive-tax path still hits FAMINE at round 7
Severity: MEDIUM — NEW (2026-04-17)
Location: `game/src/store/gameStore.ts` (initial state), `game/src/app/usecases/index.ts` (consumption), `game/src/core/math/index.ts:calculateFoodConsumption`
Symptom: Start game, choose Remus, click Economy tab, raise tax 5 times, press Space 35×. At round 7 autumn the game transitions to `stage: "results"` with Famine. Pop falls 150→128→115→104 across three consecutive seasons. BL-28 raised starting grain to 750 but (a) Remus gets no grain production bonus and (b) max-tax lowers happiness which throttles pop-growth-sanitation, not consumption, so it still runs out.
Fix target: Either make the first `Farm Complex` building auto-buildable on round 3 tutorial nudge, OR soften the second-starvation → Famine trigger when grain deficit is ≤20% in rounds 5-10.

### [x] BL-32 — 3-role spec STAGNATION false positive on Noob
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

### [x] BL-25 — 3-role spec round counter reads −1 (store not on window)
Severity: LOW (tooling) — FIXED; cycle-6 run confirms `window.__gameStore` returns populated state with round/season/denarii/pop/etc. in every Playwright `readState`.

### [x] BL-34 — Emergency Actions panel appears even when happiness ≥ 80% (Avg)
Severity: LOW — SUPERSEDED by BL-43 (cycle 6); same root cause, new fix plan. Keep closed here, track under BL-43.

### [x] BL-35 — Population oscillates 150 → 142 → 150 in one round (Avg round 5)
Severity: LOW — SUPERSEDED by BL-42 (cycle 6); reappeared at round 6→7 (150→159→136). Track under BL-42.

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
