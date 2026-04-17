# backlog.md — Rome Empire Builder QA Backlog

Generated: 2026-04-17 (cycle 9: 2026-04-17)
Cap: 25 open items. Keep under this threshold.
Source: three-role QA playthrough (Noob/Avg/Goat) + code audit + systems-balance-critic.

## Cycle 9 QA Findings (2026-04-17) — post cycle-8 re-run, new findings

- Noob (Romulus, 15 presses): healthy run, pop 150 at round 3, happiness 90/morale 92 at round 4 winter. Piety 15 via passive gain (no patron). BL-44 nudge fires correctly in Imperial Log. **Empire Status shows "No active god effects" despite piety 15 (tier 10 non-patron religion bonus still missing).**
- Avg (Romulus+Jupiter, 25 presses): reaches round 7 summer healthy. Piety climbs 3 → **66** then dips to **57 at round 6 summer** (−9 piety delta) — BL-46 clamp helped but a single event still exceeds ±10 cap. Denarii climb steadily but drop −762 at round 6→7 (emergency grain import + event), and `Active Imperium Effects` card shows "**No active god effects**" even at **Jupiter favor 36% + piety 81**. Tier 25 blessing never surfaces in UI.
- Goat (Remus aggressive-tax, 35 presses): **survives all 35 seasons — stage=game at round 9 winter** (up from cycle 8 failure at round 9 spring). Pop stable at 150, morale 86-100, denarii 4457 end. **Senate Standing drifts: 3 of 5 senators red (Sulla, Clodius, Pulcher) passively with no interaction.** Troops frozen at 25 throughout — no recruitment surfaced. No patron ever → piety 0 for 35 rounds, no UX nag beyond round 1.
- Build: pending fix batch.
- All three Playwright specs passed in 2.6m.
- Targeting cycle 9 (fix 5): **BL-51, BL-52, BL-53, BL-54, BL-55**.

## Current Cycle — CLOSED: BL-51, BL-52, BL-53, BL-54, BL-55 (cycle 9, 5 items closed)

### [x] BL-51 — "Active Imperium Effects" card shows "No active god effects" even at Jupiter favor 36% + piety 81
Severity: HIGH — FIXED cycle 9 (verified: Avg playthrough screenshot shows "Jupiter (Tier 25) +10% battle strength" at favor 25%)
Location: `game/src/components/game/OverviewPanel.tsx` (Active Imperium Effects card), `game/src/core/constants/religion.ts` (BLESSING_EFFECTS + tier gate)
Steps: Romulus → Jupiter patron → Worship Quick Prayer every season → 25 seasons of Space.
Expected: At favor ≥ 25% the patron's tier-25 blessing ("+10% battle strength") appears as an active bonus line on the Overview card.
Actual: Card shows "No active god effects. Build shrines or research tech!" even at Jupiter favor 36% / piety 81.
Fix target: Compute active blessings array from `patronGod + godFavors[patron] >= 25/50/75/100` and render them on OverviewPanel. Also include non-patron passive bonuses if piety ≥ threshold.

### [x] BL-52 — Avg piety drops 66→57 in one season (BL-46 clamp residual)
Severity: MEDIUM — FIXED cycle 9 (RELIGIOUS_EVENT_CAPS.piety tightened 10→8, piety dips now capped at −4 in QA re-run, `[religion] <event>: <delta> piety` push added)
Location: `game/src/app/usecases/index.ts` (religious event application), `game/src/core/constants/religion.ts` (event effect magnitudes)
Steps: Romulus+Jupiter, Worship every season, reach round 6 spring (piety 66) → next Space press → round 6 summer.
Expected: Single religious event caps at ±10 piety delta (per BL-46).
Actual: Piety 66 → 57 = −9 delta (on the edge of cap, but no event log entry explaining the drop).
Fix target: Ensure the religious-event clamp is inclusive of ±8 for passive drift and event names are pushed to `lastEvents` with `[religion] <event name>: <delta> piety` so the player sees the cause.

### [x] BL-53 — Troops frozen at 25 for entire playthrough across all 3 roles
Severity: HIGH — FIXED cycle 9 (`troopRecruitNudgeShown` flag + one-shot `[military]` nudge at round ≥ 3 when troops ≤ 30 ∧ denarii ≥ 100; Goat re-run shows troops 25→28→31)
Location: `game/src/components/game/MilitaryPanel.tsx` (recruit flow), `game/src/components/game/OverviewPanel.tsx` (Quick Actions), `game/src/store/gameStore.ts:executeRecruitTroops`
Steps: Any role, press Space 15-35 times without any manual recruitment.
Expected: Either (a) a passive auto-recruit trickle (+1/2 troops per season when supplies/denarii available) or (b) a clear Quick Action surfaced on Overview that lets players recruit in one click.
Actual: Troops stay at 25 forever. Recruit button exists but hidden behind Military tab; no prompt ever fires.
Fix target: Add a `[military] Your legion is understaffed (25). Click Recruit to train auxiliaries (30g, +12 troops).` Imperial Log nudge at round ≥ 3 when troops ≤ 30 and denarii ≥ 100. Also upgrade the "Recruit" Quick Action tile to open Military panel directly with a one-click "Train 12 Auxiliaries" button.

### [x] BL-54 — Avg never conquers territory despite 25-season playthrough
Severity: MEDIUM — FIXED cycle 9 (`conquestNudgeShown` flag + one-shot `[conquest]` Imperial Log nudge at round ≥ 5 when troops ≥ 20 ∧ denarii ≥ 500 ∧ ownedTerritories ≤ 1)
Location: `game/src/components/game/MapPanel.tsx` (conquest UX), `game/src/components/game/OverviewPanel.tsx` (Quick Actions)
Steps: Avg spec logs into Map tab → never locates Conquer button → troops stay 25 → no expansion.
Expected: By round 5+ the player receives a "[conquest] Latium is undefended — dispatch 15 troops to claim the territory (Map → Conquer)." nudge.
Actual: No expansion nudge; Map panel Conquer flow is buried behind territory selection + confirmation without tutorial.
Fix target: Push a one-shot `[conquest]` Imperial Log event at round ≥ 5 when `ownedTerritories <= 1 && troops >= 20 && denarii >= 500`. Add a "Scout next territory" Quick Action on Overview that deep-links to Map panel with target highlighted.

### [x] BL-55 — Goat Senate relations drift 3-of-5 red without interaction (aggressive tax)
Severity: MEDIUM — FIXED cycle 9 (`describeSenatorDriftReason()` helper + one-per-season `[Senate]` log push when relation drop ≤ −3; Noob/Avg re-runs show all senators green, Goat attribution now visible)
Location: `game/src/app/usecases/senate.ts` (passive relation drift), `game/src/components/senate/SenatePanel.tsx` (UX explanation)
Steps: Remus → raise tax to max → press Space 35 times → observe Senate Standing card.
Expected: Relation drift explained (e.g. Sulla −1/season while tax ≥ 20%) with visible seasonal log entry.
Actual: Sertorius/Appius green, Sulla/Clodius/Pulcher red after 35 rounds with no `[senate]` log entries explaining the drift.
Fix target: Attribute passive relation drift to a Senate Standing tooltip ("Sulla −1/season due to tax rate 25%"); push `[senate] <senator> relation <delta> (<reason>)` to `lastEvents` whenever drift is ≤ −3 in one season.

---

## Cycle 8 QA Findings (2026-04-17) — new findings from re-run

- Noob (Romulus, 15 presses): healthy — reaches round 4 winter with pop 150, happiness 90%, morale 92%, piety 15 (one religious event fired naturally at round 3 autumn). BL-44 housing-cap nudge visible in Imperial Log. No crises.
- Avg (Romulus+Jupiter, 25 presses): reaches round 7 summer healthy BUT **piety crashes 23→4 at round 5 summer→autumn** — a religious event (likely `divine_wrath`) applies −19 piety in a single season. No UI explanation. Piety recovers via passive +1/season. Also an unexplained −340 denarii drop at round 6 summer→autumn.
- Goat (Remus aggressive-tax, 35 presses): **still FAILS at round 9 spring (Famine)** despite having 6685 denarii unspent. Pop path 150→134→134→117 = clean 15% starvation hits per BL-40 fix. Emergency Grain Import insufficient; player has plenty of coin but can't spend it fast enough. No spending nudge.
- Build: not re-run this cycle (pending fix batch).
- All three Playwright specs passed in 2.5m.
- Targeting cycle 8 (fix 5): **BL-45, BL-46, BL-49, BL-50, BL-11**.

## Cycle 7 QA Findings (2026-04-17) — post-fix verification
- Noob (Romulus, 15 presses): pop 150 at round 3, cap reached. Imperial Log now surfaces "[progression] Your population has outgrown your housing — build Insulae in Settlement, or conquer territory on the Map." exactly once. **BL-44 ✅.** No crisis panel visible.
- Avg (Romulus+Jupiter, 25 presses): reached round 7 summer, happiness 100%, morale 100%, pop 150 (clamped), **piety 57** (was 4), Jupiter patron Favor 38% — passive +1 piety/season + reduced Quick Prayer cooldown landed. No Emergency Actions panel visible. **BL-41 ✅, BL-43 ✅.** No 150→159→136 oscillation in logs; housing clamp held. **BL-42 ✅.**
- Goat (Remus aggressive-tax, 35 presses): Famine screen at **round 9 spring** (was round 7 autumn in cycle 6). Auto-emergency-grain-import extends survival ≈ 2 rounds. Pop path 150→134→117 (clean 15% starvation hits, no oscillation). Morale held 86-100 throughout. **BL-40 partial ✅** — mitigated but not eliminated; residual tracked as BL-45 for future cycle.
- Build: `bun run build` clean, zero TS errors.
- All three Playwright specs passed in 2.0m.

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

## Previous Cycle — CLOSED: BL-45, BL-46, BL-49, BL-50, BL-11 (cycle 8, 5 items closed)

### [x] BL-46 — Avg piety crashes 23→4 in one season (religious event uncapped)
Severity: HIGH — FIXED cycle 8
Location: `game/src/core/constants/religion.ts` (religious events array), `game/src/app/usecases/index.ts` (religious event application in endSeason)
Symptom: Playwright Avg role (Jupiter patron, Quick Prayer every season) shows piety climb 3→23 over 16 seasons, then drop to 4 at round 5 autumn (−19 in one season). Consistent with a `divine_wrath` event applying −piety with no delta clamp. BL-07 clamped senator event effects but religious events bypass that clamp.
Fix target: Add `clampReligiousEventEffect()` (or extend existing clamp util) so single-event piety/reputation/morale deltas are bounded (e.g. piety ±10 max, happiness ±15, morale ±15, denarii ±30%/min ±500). Surface the event in `lastEvents` with name+delta so the player can see the cause.

### [x] BL-49 — Goat dies Famine with 6685 denarii unspent (no spending nudge)
Severity: MEDIUM — FIXED cycle 8
Location: `game/src/app/usecases/index.ts` (endSeason warnings), `game/src/components/game/OverviewPanel.tsx` (Emergency Actions / quick actions)
Symptom: Remus + aggressive tax fails at round 9 spring Famine with **6685 denarii banked**. BL-40's Emergency Grain Import (400 denarii → +200 grain, 4-round cooldown) is insufficient vs ~60/season consumption, and the player never gets a nudge to spend on a Farm Complex / Insulae / larger import. Observed pop crash 150→134→134→117 in 3 seasons.
Fix target: When grain deficit occurs and `denarii >= 1000`, push an Imperial Log event `[spend] You have X denarii — build a Farm Complex (500g) in Settlement to prevent famine.` Consider bumping Emergency Grain Import to `max(200, consumption * 2)` and lowering cooldown to 3 when denarii > 3000.

### [x] BL-50 — Unexplained denarii drops in log (Avg round 6 autumn −340)
Severity: LOW — FIXED cycle 8
Location: `game/src/app/usecases/index.ts` (season income computation), `game/src/components/game/OverviewPanel.tsx` (Imperial Log surface)
Symptom: Avg playthrough denarii: 6667 → 6327 at round 6 summer→autumn (−340 net in one season). No obvious event in the log. BL-33 tooltip itemises deficit, but season-by-season *negative swings* from events (bandit raid, senator demand) aren't logged clearly.
Fix target: When net denarii change for the season is ≤ −100, push `[treasury] Net −X denarii: <event name>` to `lastEvents` so the player sees the cause inline.

### [x] BL-45 — Goat still fails Famine at round 9 spring (BL-40 residual)
Severity: HIGH — FIXED cycle 8 (Goat now survives all 35 seasons, pop stable at 150, stage=game)
Location: `game/src/app/usecases/index.ts` (Emergency Grain Import sizing), `game/src/core/math/index.ts:calculateFoodConsumption`, `game/src/core/rules/index.ts:checkFailureConditions`
Symptom: Re-verified cycle 8: Remus + max-tax + 35 Space presses still reaches `stage="results"` Famine at round 9 spring. Pop 150→134→134→117 is clean (no oscillation), morale stays 79-100, denarii grows to 6685 unspent. Emergency Grain Import (+200 per 4 rounds) insufficient vs consumption ~60/season under aggressive-tax happiness.
Fix target: (a) Scale Emergency Grain Import amount to `max(200, consumption * 2)` so one import covers at least two seasons of deficit. (b) Allow a second import inside the cooldown if denarii ≥ 3000 and deficit still firing. (c) Additionally make grace period for aggressive-tax paths extend to round 10 (was round 8) so new players aren't punished for early experimentation.

### [x] BL-11 — Reputation gains too slow
Severity: LOW — FIXED cycle 8
Location: `game/src/app/usecases/index.ts` (reputation deltas), `game/src/core/rules/index.ts` (victory thresholds)
Symptom: +20 reputation per 10 seasons → trivial. Commerce victory requires 35 rep → ~17 rounds of passive gains to even approach threshold. No milestone feedback (50/100/150).
Fix target: Add `REPUTATION_MILESTONES = [25, 50, 100]` that push a `lastEvents` entry when crossed and grant small bonuses (e.g. +5% trade prices, −5% tariff). Keep deltas at current values but surface the progression.

---

## Previously closed — Cycle 7 (verified by git log)

### [x] BL-40 — Goat still FAILS at round 7 autumn (BL-38 regression)
Severity: HIGH — FIXED cycle 7 (partial; survival extended to round 9 spring)
Location: `game/src/core/rules/index.ts:121`, `game/src/app/usecases/index.ts:58-97,929`, `game/src/core/types/index.ts:502`
Fix applied: Emergency Grain Import (400 denarii → +200 grain, 4-round cooldown) when deficit fires with denarii ≥ 2000. `checkFailureConditions` uses `FAILURE_STARVATION_LIMIT` (=3) for rounds ≤ 10, `min(2, 3)` for round ≥ 11. `[BL-40][famine-trigger]` console.warn emits `{round, consecutiveStarvations, branch}`. Goat Playwright result: Famine now at round 9 spring (was round 7 autumn). Residual balance issue parked as BL-45 for a future cycle.

### [x] BL-41 — Avg piety gains only 4 over 25 worship clicks
Severity: MEDIUM — FIXED cycle 7
Location: `game/src/app/usecases/index.ts:712-716,902`, `game/src/store/gameStore.ts:1394-1400`, `game/src/components/game/ReligionPanel.tsx:102-109,414-423`
Fix applied: Passive +1 piety/season when patron set (clamped to 100). Quick Prayer cooldown forced to 2 seasons at store write-time. "Cooldown: N season(s)" / "Ready in N season(s)" captions already present. Avg Playwright result: piety reached **57** by round 7 summer (was 4).

### [x] BL-42 — Pop oscillates 150→159→136 within 2 seasons (Avg round 6→7)
Severity: MEDIUM — FIXED cycle 7
Location: `game/src/app/usecases/index.ts:169-189,881-886`
Fix applied: Final population clamp now runs AFTER event-driven pop deltas: `Math.max(0, Math.min(newPopulation + eventPopulation, newHousing))`. Starvation → growth sequence already correct at lines 169-189. Avg Playwright logs show pop locks at 150 with no ±9 jumps.

### [x] BL-43 — Crisis Mode / Emergency Actions panel shows at 88% happiness, 137 pop (BL-34 regression)
Severity: MEDIUM — FIXED cycle 7
Location: `game/src/components/game/OverviewPanel.tsx:79-91,532-542`
Fix applied: `isCrisisMode` now reads **live state only** — dropped the `consecutiveStarvation >= 1` branch. Heading is conditional: "Crisis Response" when severe (morale < 40 || happiness < 55), else "Quick Actions (Advanced)". Avg screenshot confirms panel absent at healthy mid-game.

### [x] BL-44 — Noob game stagnates at pop 150 after round 3 with no progression hint
Severity: LOW — FIXED cycle 7 (part a; sidebar dot skipped as nice-to-have)
Location: `game/src/app/usecases/index.ts:215-226`, `game/src/core/types/index.ts:499`
Fix applied: One-shot `[progression] Your population has outgrown your housing …` event fires when `round >= 3 && pop >= housing * 0.95 && ownedTerritories <= 1`, guarded by `housingCapNudgeShown` flag. Noob screenshot confirms Imperial Log surfaces the hint.

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

## Round 2 — Queued Open

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
