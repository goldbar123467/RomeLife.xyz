# QA.md — Rome Empire Builder QA Playbook

Primary QA driver: Playwright (`@playwright/test`) against the Next dev server at `http://localhost:3000`.

## Running tests
```bash
cd game
bun dev                                  # start server on :3000 (or handled by webServer)
npx playwright test --project=chromium   # run every spec
npx playwright test tests/game-qa.spec.ts
npx playwright test --headed             # visible browser
```

## Helpers used by specs (`tests/game-qa.spec.ts`)
- `startGame(page, founder)` — clears storage, clicks through intro + founder select.
- `clickSidebarTab(page, label)` — navigates to Overview, Economy, Military, Religion, Senate, Map, etc.
- `dismissAllModals(page)` — closes senator/battle/popups.
- `page.keyboard.press('Space')` — advance season (bound to `endSeason()`).

## Three Role Playthroughs (this cycle)
1. **Noob Gamer** — Romulus, default patron, press Space ~15 seasons, random worship, no Senate interaction. Goal: catch stagnation, starvation UX.
2. **Avg Gamer** — Romulus, Jupiter, worship every season, conquer 2 territories, build 1 wonder, play 25 seasons. Goal: catch mid-game balance and modal blocking.
3. **Goat Gamer** — Remus, Minerva, max-optimize tax + tech + trade, push to Commerce/Glory victory, 35 seasons. Goal: catch exploits and late-game scaling.

## Reporting format (use `backlog.md`)
Each issue:
```
### BL-## — Short title
Severity: CRITICAL | HIGH | MEDIUM | LOW
Location: file:line
Steps: …
Expected: …
Actual: …
Fix: …
```

Backlog is **capped at 25 open items**. If full, pause QA and clear fixes first.
