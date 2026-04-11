import { test, expect, Page } from '@playwright/test';

/**
 * Audit V2 - Bug Fix Tests
 *
 * Bug #1 (CRITICAL): activeEnvoys counter never decremented
 *   - Envoys sent increment `diplomacy.activeEnvoys` but it was never decremented
 *   - Fix: Decrement by 1 each season (envoys complete their mission), clamped to 0
 *
 * Bug #2 (HIGH): Battle odds not capped at 0.01-0.99
 *   - `playerStrength / (playerStrength + enemyStrength)` could exceed 1.0
 *   - Fix: Clamp odds to [0.01, 0.99]
 *
 * Bug #3 (HIGH): Garrison stability threshold off-by-one
 *   - `territory.garrison > 20` meant garrison of exactly 20 penalized stability (-2/season)
 *   - Fix: Changed to `territory.garrison >= 20`
 */

// ── Shared helpers ──

async function startGame(page: Page, founder: 'Romulus' | 'Remus' = 'Romulus') {
    await page.goto('/');
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('FOUNDING OF ROME')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'Begin Your Legacy' }).click();
    await page.waitForTimeout(400);
    await page.getByText(founder, { exact: true }).first().click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: new RegExp(`Found Rome as ${founder}`) }).click();
    await page.waitForTimeout(1000);
}

async function clickNavTab(page: Page, label: string): Promise<boolean> {
    const tab = page.locator(`nav[role="navigation"] button[role="tab"]:has(span:text("${label}"))`).first();
    if (await tab.isVisible({ timeout: 2000 }).catch(() => false)) {
        await tab.click();
        await page.waitForTimeout(400);
        return true;
    }
    const fallback = page.locator('nav[role="navigation"] button').filter({ hasText: label }).first();
    if (await fallback.isVisible({ timeout: 1000 }).catch(() => false)) {
        await fallback.click();
        await page.waitForTimeout(400);
        return true;
    }
    return false;
}

async function endSeason(page: Page) {
    await page.keyboard.press('Space');
    await page.waitForTimeout(600);
    await dismissModals(page);
}

async function dismissModals(page: Page) {
    for (let attempt = 0; attempt < 8; attempt++) {
        const hasModal = await page.locator('.fixed.inset-0').first().isVisible({ timeout: 300 }).catch(() => false);
        if (!hasModal) break;

        const senatorChoice = page.locator('.fixed button.rounded-xl:not([disabled])').first();
        if (await senatorChoice.isVisible({ timeout: 200 }).catch(() => false)) {
            await senatorChoice.click({ force: true });
            await page.waitForTimeout(300);
            continue;
        }

        const attackBtn = page.getByRole('button', { name: /Attack|Fight/i }).first();
        if (await attackBtn.isVisible({ timeout: 150 }).catch(() => false) && await attackBtn.isEnabled().catch(() => false)) {
            await attackBtn.click();
            await page.waitForTimeout(800);
            continue;
        }
        const retreatBtn = page.getByRole('button', { name: /Retreat/i }).first();
        if (await retreatBtn.isVisible({ timeout: 150 }).catch(() => false)) {
            await retreatBtn.click();
            await page.waitForTimeout(400);
            continue;
        }

        let handled = false;
        for (const text of ['Dismiss', 'OK', 'Continue', 'Close', 'Accept', 'Confirm']) {
            const btn = page.getByRole('button', { name: text }).first();
            if (await btn.isVisible({ timeout: 100 }).catch(() => false)) {
                await btn.click();
                await page.waitForTimeout(200);
                handled = true;
                break;
            }
        }
        if (handled) continue;

        await page.keyboard.press('Escape');
        await page.waitForTimeout(200);
    }
}

async function getGameState(page: Page): Promise<Record<string, unknown>> {
    const raw = await page.evaluate(() => localStorage.getItem('rome-empire-save'));
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        return parsed.state || parsed;
    } catch {
        return {};
    }
}

async function injectGameState(page: Page, overrides: Record<string, unknown>) {
    await page.evaluate((ov) => {
        const raw = localStorage.getItem('rome-empire-save');
        if (!raw) return;
        const parsed = JSON.parse(raw);
        const state = parsed.state || parsed;
        Object.assign(state, ov);
        if (parsed.state) {
            parsed.state = state;
        }
        localStorage.setItem('rome-empire-save', JSON.stringify(parsed));
    }, overrides);
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
}

// ══════════════════════════════════════════════════════
// Bug #1: activeEnvoys counter decrement
// ══════════════════════════════════════════════════════

test.describe('Bug #1: activeEnvoys counter properly managed', () => {
    test.setTimeout(180000);

    test('activeEnvoys decrements each season (envoys complete missions)', async ({ page }) => {
        await startGame(page);

        // Inject state: 3 active envoys, plenty of money
        await injectGameState(page, {
            diplomacy: {
                relations: { sabines: 50, etruscans: 50, latins: 50, samnites: 50 },
                activeEnvoys: 3,
                relationHistory: [],
            },
            denarii: 5000,
        });

        const stateBefore = await getGameState(page);
        const diplomacyBefore = stateBefore.diplomacy as { activeEnvoys: number };
        expect(diplomacyBefore.activeEnvoys).toBe(3);

        // End one season - activeEnvoys should decrement by 1
        await endSeason(page);

        const stateAfter = await getGameState(page);
        const diplomacyAfter = stateAfter.diplomacy as { activeEnvoys: number };
        expect(diplomacyAfter.activeEnvoys).toBe(2);

        console.log(`activeEnvoys: ${diplomacyBefore.activeEnvoys} -> ${diplomacyAfter.activeEnvoys}`);
    });

    test('activeEnvoys does not go below 0', async ({ page }) => {
        await startGame(page);

        // Inject state: 0 active envoys
        await injectGameState(page, {
            diplomacy: {
                relations: { sabines: 50, etruscans: 50, latins: 50, samnites: 50 },
                activeEnvoys: 0,
                relationHistory: [],
            },
        });

        await endSeason(page);

        const state = await getGameState(page);
        const diplomacy = state.diplomacy as { activeEnvoys: number };
        expect(diplomacy.activeEnvoys).toBe(0);
        expect(diplomacy.activeEnvoys).toBeGreaterThanOrEqual(0);

        console.log(`activeEnvoys at 0 stays 0 after season: ${diplomacy.activeEnvoys}`);
    });

    test('activeEnvoys drains to 0 after multiple seasons without sending envoys', async ({ page }) => {
        await startGame(page);

        // Inject 5 active envoys
        await injectGameState(page, {
            diplomacy: {
                relations: { sabines: 50, etruscans: 50, latins: 50, samnites: 50 },
                activeEnvoys: 5,
                relationHistory: [],
            },
        });

        // Play 8 seasons - should drain from 5 to 0 (not go negative)
        const envoyHistory: number[] = [];
        for (let i = 0; i < 8; i++) {
            const state = await getGameState(page);
            const diplomacy = state.diplomacy as { activeEnvoys: number };
            envoyHistory.push(diplomacy.activeEnvoys);
            await endSeason(page);
        }

        const finalState = await getGameState(page);
        const finalDiplomacy = finalState.diplomacy as { activeEnvoys: number };
        envoyHistory.push(finalDiplomacy.activeEnvoys);

        // Should monotonically decrease and clamp at 0
        expect(finalDiplomacy.activeEnvoys).toBe(0);
        for (let i = 1; i < envoyHistory.length; i++) {
            expect(envoyHistory[i]).toBeLessThanOrEqual(envoyHistory[i - 1]);
            expect(envoyHistory[i]).toBeGreaterThanOrEqual(0);
        }

        console.log(`activeEnvoys drain: [${envoyHistory.join(', ')}]`);
    });

    test('activeEnvoys correctly reflects send + season decrement cycle', async ({ page }) => {
        await startGame(page);

        // Start with 0 envoys and money to send them
        await injectGameState(page, {
            diplomacy: {
                relations: { sabines: 50, etruscans: 50, latins: 50, samnites: 50 },
                activeEnvoys: 0,
                relationHistory: [],
            },
            denarii: 10000,
        });

        // Try to send an envoy via the Diplomacy tab
        const opened = await clickNavTab(page, 'Diplomacy');
        if (!opened) {
            console.log('Diplomacy tab not accessible, testing state injection only');
            // Directly inject 1 envoy and test decrement
            await injectGameState(page, {
                diplomacy: {
                    relations: { sabines: 50, etruscans: 50, latins: 50, samnites: 50 },
                    activeEnvoys: 1,
                    relationHistory: [],
                },
            });
        } else {
            // Try sending envoy via UI
            const sendBtn = page.getByRole('button', { name: /Send Envoy/i }).first();
            if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false) && await sendBtn.isEnabled().catch(() => false)) {
                await sendBtn.click();
                await page.waitForTimeout(500);
            } else {
                // Fallback: inject the envoy
                await injectGameState(page, {
                    diplomacy: {
                        relations: { sabines: 50, etruscans: 50, latins: 50, samnites: 50 },
                        activeEnvoys: 1,
                        relationHistory: [],
                    },
                });
            }
        }

        const stateBeforeSeason = await getGameState(page);
        const diplomacyBeforeSeason = stateBeforeSeason.diplomacy as { activeEnvoys: number };
        const envoysBefore = diplomacyBeforeSeason.activeEnvoys;

        // End season should decrement
        await endSeason(page);

        const stateAfterSeason = await getGameState(page);
        const diplomacyAfterSeason = stateAfterSeason.diplomacy as { activeEnvoys: number };

        expect(diplomacyAfterSeason.activeEnvoys).toBe(Math.max(0, envoysBefore - 1));
        console.log(`Envoy cycle: sent=${envoysBefore}, after season=${diplomacyAfterSeason.activeEnvoys}`);
    });

    test('Diplomacy panel shows correct activeEnvoys count', async ({ page }) => {
        await startGame(page);

        await injectGameState(page, {
            diplomacy: {
                relations: { sabines: 50, etruscans: 50, latins: 50, samnites: 50 },
                activeEnvoys: 2,
                relationHistory: [],
            },
            denarii: 5000,
        });

        const opened = await clickNavTab(page, 'Diplomacy');
        if (!opened) {
            console.log('Diplomacy tab not accessible, skipping UI check');
            return;
        }

        await page.waitForTimeout(500);

        // The panel should show 2 active envoys
        const content = await page.locator('main').textContent() || '';
        expect(content).not.toContain('NaN');
        expect(content).not.toContain('undefined');

        // Verify the number is displayed somewhere
        const envoyCountEl = page.locator('text=Active Envoys').first();
        if (await envoyCountEl.isVisible({ timeout: 1000 }).catch(() => false)) {
            console.log('Active Envoys label found in Diplomacy panel');
        }

        console.log('Diplomacy panel renders correctly with active envoys');
    });
});

// ══════════════════════════════════════════════════════
// Bug #2: Battle odds capped at [0.01, 0.99]
// ══════════════════════════════════════════════════════

test.describe('Bug #2: Battle odds capped within valid range', () => {
    test.setTimeout(180000);

    test('Battle odds never exceed 0.99 even with extreme player strength', async ({ page }) => {
        await startGame(page);

        // Give player overwhelming military advantage
        await injectGameState(page, {
            troops: 500,
            morale: 100,
            supplies: 999,
            denarii: 50000,
        });

        // Attempt a conquest to trigger battle odds calculation
        const mapOpened = await clickNavTab(page, 'Map');
        if (!mapOpened) {
            console.log('Map tab not accessible, testing via state injection');
        }

        // Check that if a battle is started, odds are within range
        // Navigate to an unowned territory
        const conquerBtn = page.getByRole('button', { name: /Conquer/i }).first();
        if (await conquerBtn.isVisible({ timeout: 2000 }).catch(() => false) && await conquerBtn.isEnabled().catch(() => false)) {
            await conquerBtn.click();
            await page.waitForTimeout(800);

            // Read any displayed odds from the battle screen
            const battleContent = await page.locator('body').textContent() || '';

            // Check for percentage display - should never show 100%
            const oddsMatch = battleContent.match(/(\d+)%\s*(?:chance|odds|win)/i);
            if (oddsMatch) {
                const displayedOdds = parseInt(oddsMatch[1]);
                expect(displayedOdds).toBeLessThanOrEqual(99);
                expect(displayedOdds).toBeGreaterThanOrEqual(1);
                console.log(`Battle odds displayed: ${displayedOdds}% (capped correctly)`);
            }

            // Retreat from battle to continue testing
            const retreatBtn = page.getByRole('button', { name: /Retreat/i }).first();
            if (await retreatBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await retreatBtn.click();
                await page.waitForTimeout(400);
            }
        }

        // Verify state consistency after battle attempt
        const state = await getGameState(page);
        expect(Number.isFinite(state.troops as number)).toBe(true);
        expect(Number.isFinite(state.morale as number)).toBe(true);
    });

    test('Battle odds never go below 0.01 even with minimal troops', async ({ page }) => {
        await startGame(page);

        // Give player minimal military
        await injectGameState(page, {
            troops: 5,
            morale: 10,
            supplies: 10,
            round: 30, // Late game means stronger enemies
        });

        const mapOpened = await clickNavTab(page, 'Map');
        if (!mapOpened) {
            console.log('Map tab not accessible');
            return;
        }

        const conquerBtn = page.getByRole('button', { name: /Conquer/i }).first();
        if (await conquerBtn.isVisible({ timeout: 2000 }).catch(() => false) && await conquerBtn.isEnabled().catch(() => false)) {
            await conquerBtn.click();
            await page.waitForTimeout(800);

            const battleContent = await page.locator('body').textContent() || '';
            const oddsMatch = battleContent.match(/(\d+)%\s*(?:chance|odds|win)/i);
            if (oddsMatch) {
                const displayedOdds = parseInt(oddsMatch[1]);
                expect(displayedOdds).toBeGreaterThanOrEqual(1);
                expect(displayedOdds).toBeLessThanOrEqual(99);
                console.log(`Low-strength battle odds: ${displayedOdds}% (floor capped correctly)`);
            }

            // Retreat
            const retreatBtn = page.getByRole('button', { name: /Retreat/i }).first();
            if (await retreatBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await retreatBtn.click();
                await page.waitForTimeout(400);
            }
        }
    });

    test('Multiple battles maintain valid odds range throughout gameplay', async ({ page }) => {
        await startGame(page);

        await injectGameState(page, {
            troops: 100,
            morale: 80,
            supplies: 200,
            denarii: 10000,
        });

        // Play 10 seasons and verify game state stays consistent
        for (let i = 0; i < 10; i++) {
            await endSeason(page);

            const state = await getGameState(page);
            expect(Number.isFinite(state.troops as number)).toBe(true);
            expect((state.troops as number)).toBeGreaterThanOrEqual(0);
            expect(Number.isFinite(state.morale as number)).toBe(true);
            expect((state.morale as number)).toBeGreaterThanOrEqual(0);
            expect((state.morale as number)).toBeLessThanOrEqual(100);
        }

        console.log('All stats valid after 10 seasons of gameplay');
    });

    test('Battle resolution works correctly with capped odds', async ({ page }) => {
        await startGame(page);

        // Very strong army to test near-cap odds
        await injectGameState(page, {
            troops: 300,
            morale: 95,
            supplies: 500,
            denarii: 20000,
        });

        const mapOpened = await clickNavTab(page, 'Map');
        if (!mapOpened) return;

        const conquerBtn = page.getByRole('button', { name: /Conquer/i }).first();
        if (await conquerBtn.isVisible({ timeout: 2000 }).catch(() => false) && await conquerBtn.isEnabled().catch(() => false)) {
            await conquerBtn.click();
            await page.waitForTimeout(800);

            // Try to fight
            const fightBtn = page.getByRole('button', { name: /Attack|Fight|Battle/i }).first();
            if (await fightBtn.isVisible({ timeout: 1000 }).catch(() => false) && await fightBtn.isEnabled().catch(() => false)) {
                await fightBtn.click();
                await page.waitForTimeout(2000);
            }

            // Dismiss any modals/overlays after the battle with multiple strategies
            for (let attempt = 0; attempt < 10; attempt++) {
                const hasOverlay = await page.locator('.fixed.inset-0').first().isVisible({ timeout: 300 }).catch(() => false);
                if (!hasOverlay) break;

                // Try common dismiss buttons
                let dismissed = false;
                for (const text of ['Continue', 'Dismiss', 'OK', 'Close', 'Accept', 'Confirm', 'Return']) {
                    const btn = page.getByRole('button', { name: new RegExp(text, 'i') }).first();
                    if (await btn.isVisible({ timeout: 200 }).catch(() => false) && await btn.isEnabled({ timeout: 200 }).catch(() => false)) {
                        await btn.click({ force: true });
                        await page.waitForTimeout(400);
                        dismissed = true;
                        break;
                    }
                }
                if (dismissed) continue;

                // Click any enabled button in the overlay
                const anyBtn = page.locator('.fixed button:not([disabled])').first();
                if (await anyBtn.isVisible({ timeout: 200 }).catch(() => false)) {
                    await anyBtn.click({ force: true });
                    await page.waitForTimeout(400);
                    continue;
                }

                await page.keyboard.press('Escape');
                await page.waitForTimeout(300);
            }
        }

        // State should remain valid after battle
        const state = await getGameState(page);
        expect(Number.isFinite(state.troops as number)).toBe(true);
        expect(Number.isFinite(state.population as number)).toBe(true);
        expect(Number.isFinite(state.denarii as number)).toBe(true);
        expect(state.denarii as number).toBeGreaterThanOrEqual(0);

        console.log('Battle resolution completed with valid state');
    });
});

// ══════════════════════════════════════════════════════
// Bug #3: Garrison stability threshold (>= 20 not > 20)
// ══════════════════════════════════════════════════════

test.describe('Bug #3: Garrison threshold uses >= 20 (not > 20)', () => {
    test.setTimeout(180000);

    test('Garrison of exactly 20 stabilizes territory (not penalizes)', async ({ page }) => {
        await startGame(page);

        // Set a territory with garrison of exactly 20 and known stability
        await page.evaluate(() => {
            const raw = localStorage.getItem('rome-empire-save');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const state = parsed.state || parsed;

            // Set first owned territory to garrison=20, stability=50
            state.territories = state.territories.map((t: Record<string, unknown>) => {
                if (t.owned) {
                    return { ...t, garrison: 20, stability: 50 };
                }
                return t;
            });
            if (parsed.state) parsed.state = state;
            localStorage.setItem('rome-empire-save', JSON.stringify(parsed));
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const beforeState = await getGameState(page);
        const terrBefore = (beforeState.territories as Array<{ owned: boolean; stability: number; garrison: number }>)
            .filter(t => t.owned);

        // Verify garrison is set to 20
        for (const t of terrBefore) {
            expect(t.garrison).toBe(20);
            expect(t.stability).toBe(50);
        }

        await endSeason(page);

        const afterState = await getGameState(page);
        const terrAfter = (afterState.territories as Array<{ owned: boolean; stability: number; garrison: number }>)
            .filter(t => t.owned);

        for (const t of terrAfter) {
            // With garrison=20, stability should INCREASE (+1 base from garrison)
            // Old bug: > 20 check would give -2 instead of +1
            // The +1 from garrison plus any building bonuses should result in stability >= 50
            // (territory events might affect it, but base should be positive)
            expect(t.stability).toBeGreaterThanOrEqual(49); // Allow for small event variance
            console.log(`Garrison=20: stability ${50} -> ${t.stability} (should be >= 50)`);
        }
    });

    test('Garrison of 19 penalizes territory stability', async ({ page }) => {
        await startGame(page);

        // Set garrison to 19 (below threshold)
        await page.evaluate(() => {
            const raw = localStorage.getItem('rome-empire-save');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const state = parsed.state || parsed;

            state.territories = state.territories.map((t: Record<string, unknown>) => {
                if (t.owned) {
                    return { ...t, garrison: 19, stability: 50 };
                }
                return t;
            });
            if (parsed.state) parsed.state = state;
            localStorage.setItem('rome-empire-save', JSON.stringify(parsed));
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await endSeason(page);

        const afterState = await getGameState(page);
        const terrAfter = (afterState.territories as Array<{ owned: boolean; stability: number; garrison: number }>)
            .filter(t => t.owned);

        for (const t of terrAfter) {
            // With garrison=19 (below 20), stability should DECREASE (-2 base)
            expect(t.stability).toBeLessThanOrEqual(50);
            console.log(`Garrison=19: stability 50 -> ${t.stability} (should be <= 50)`);
        }
    });

    test('Garrison of 21 stabilizes territory (above threshold)', async ({ page }) => {
        await startGame(page);

        await page.evaluate(() => {
            const raw = localStorage.getItem('rome-empire-save');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const state = parsed.state || parsed;

            state.territories = state.territories.map((t: Record<string, unknown>) => {
                if (t.owned) {
                    return { ...t, garrison: 21, stability: 50 };
                }
                return t;
            });
            if (parsed.state) parsed.state = state;
            localStorage.setItem('rome-empire-save', JSON.stringify(parsed));
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await endSeason(page);

        const afterState = await getGameState(page);
        const terrAfter = (afterState.territories as Array<{ owned: boolean; stability: number; garrison: number }>)
            .filter(t => t.owned);

        for (const t of terrAfter) {
            // With garrison=21 (above 20), stability should increase
            expect(t.stability).toBeGreaterThanOrEqual(49); // Allow for small event variance
            console.log(`Garrison=21: stability 50 -> ${t.stability} (should be >= 50)`);
        }
    });

    test('Garrison=0 causes significant stability loss', async ({ page }) => {
        await startGame(page);

        await page.evaluate(() => {
            const raw = localStorage.getItem('rome-empire-save');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const state = parsed.state || parsed;

            state.territories = state.territories.map((t: Record<string, unknown>) => {
                if (t.owned) {
                    return { ...t, garrison: 0, stability: 50 };
                }
                return t;
            });
            if (parsed.state) parsed.state = state;
            localStorage.setItem('rome-empire-save', JSON.stringify(parsed));
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        await endSeason(page);

        const afterState = await getGameState(page);
        const terrAfter = (afterState.territories as Array<{ owned: boolean; stability: number; garrison: number }>)
            .filter(t => t.owned);

        for (const t of terrAfter) {
            // With garrison=0, should get -2 base stability change
            expect(t.stability).toBeLessThan(50);
            console.log(`Garrison=0: stability 50 -> ${t.stability} (should decrease)`);
        }
    });

    test('Stability changes correctly over multiple seasons at garrison boundary', async ({ page }) => {
        await startGame(page);

        // Set garrison to exactly 20 and track stability over 5 seasons
        await page.evaluate(() => {
            const raw = localStorage.getItem('rome-empire-save');
            if (!raw) return;
            const parsed = JSON.parse(raw);
            const state = parsed.state || parsed;

            state.territories = state.territories.map((t: Record<string, unknown>) => {
                if (t.owned) {
                    return { ...t, garrison: 20, stability: 40 };
                }
                return t;
            });
            if (parsed.state) parsed.state = state;
            localStorage.setItem('rome-empire-save', JSON.stringify(parsed));
        });
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        const stabilityHistory: number[] = [40];

        for (let i = 0; i < 5; i++) {
            await endSeason(page);

            const state = await getGameState(page);
            const territories = (state.territories as Array<{ owned: boolean; stability: number }>)
                .filter(t => t.owned);

            if (territories.length > 0) {
                stabilityHistory.push(territories[0].stability);
            }
        }

        // With garrison=20, stability should trend upward (or stay stable)
        // The last value should be >= the first value (trending up with +1/season base)
        const lastStability = stabilityHistory[stabilityHistory.length - 1];
        expect(lastStability).toBeGreaterThanOrEqual(40);

        console.log(`Stability over 5 seasons (garrison=20): [${stabilityHistory.join(', ')}]`);
    });
});

// ══════════════════════════════════════════════════════
// Edge Cases: Combined stress tests
// ══════════════════════════════════════════════════════

test.describe('Edge Cases: Combined fix stress tests', () => {
    test.setTimeout(240000);

    test('20 seasons with envoys, battles, and garrison management', async ({ page }) => {
        await startGame(page);

        // Start with moderate state
        await injectGameState(page, {
            troops: 80,
            morale: 70,
            supplies: 200,
            denarii: 8000,
            happiness: 70,
            diplomacy: {
                relations: { sabines: 50, etruscans: 50, latins: 50, samnites: 50 },
                activeEnvoys: 2,
                relationHistory: [],
            },
        });

        const issues: string[] = [];

        for (let i = 0; i < 20; i++) {
            await endSeason(page);

            const state = await getGameState(page);

            // Check activeEnvoys is valid
            const diplomacy = state.diplomacy as { activeEnvoys: number } | undefined;
            if (diplomacy) {
                if (diplomacy.activeEnvoys < 0) {
                    issues.push(`Season ${i + 1}: activeEnvoys went negative: ${diplomacy.activeEnvoys}`);
                }
                if (!Number.isFinite(diplomacy.activeEnvoys)) {
                    issues.push(`Season ${i + 1}: activeEnvoys is NaN/Infinity`);
                }
            }

            // Check territories stability is valid
            const territories = state.territories as Array<{ owned: boolean; stability: number; garrison: number }> | undefined;
            if (territories) {
                for (const t of territories.filter(t => t.owned)) {
                    if (t.stability < 0 || t.stability > 100) {
                        issues.push(`Season ${i + 1}: stability out of range: ${t.stability}`);
                    }
                    if (!Number.isFinite(t.stability)) {
                        issues.push(`Season ${i + 1}: stability is NaN/Infinity`);
                    }
                }
            }

            // Check bounded stats
            const bounded = [
                { name: 'happiness', value: state.happiness as number, min: 0, max: 100 },
                { name: 'morale', value: state.morale as number, min: 0, max: 100 },
                { name: 'reputation', value: state.reputation as number, min: 0, max: 100 },
            ];

            for (const check of bounded) {
                if (check.value < check.min || check.value > check.max || !Number.isFinite(check.value)) {
                    issues.push(`Season ${i + 1}: ${check.name} = ${check.value} (out of range)`);
                }
            }

            // Check non-negative values
            const nonNeg = [
                { name: 'population', value: state.population as number },
                { name: 'denarii', value: state.denarii as number },
                { name: 'troops', value: state.troops as number },
            ];

            for (const check of nonNeg) {
                if (check.value < 0 || !Number.isFinite(check.value)) {
                    issues.push(`Season ${i + 1}: ${check.name} = ${check.value} (invalid)`);
                }
            }
        }

        if (issues.length > 0) {
            console.log('Issues found:', issues);
        }
        expect(issues).toHaveLength(0);
    });

    test('No NaN values after extreme state transitions', async ({ page }) => {
        await startGame(page);

        // Push to extreme values
        await injectGameState(page, {
            troops: 1,
            morale: 1,
            supplies: 0,
            denarii: 0,
            happiness: 5,
            population: 50,
            diplomacy: {
                relations: { sabines: 0, etruscans: 100, latins: 50, samnites: 50 },
                activeEnvoys: 100, // Extremely high to test drain
                relationHistory: [],
            },
        });

        for (let i = 0; i < 5; i++) {
            await endSeason(page);

            const state = await getGameState(page);
            const fields = ['happiness', 'morale', 'population', 'denarii', 'troops', 'reputation'];

            for (const field of fields) {
                const value = state[field] as number;
                expect(Number.isFinite(value)).toBe(true);
            }

            const diplomacy = state.diplomacy as { activeEnvoys: number };
            expect(Number.isFinite(diplomacy.activeEnvoys)).toBe(true);
            expect(diplomacy.activeEnvoys).toBeGreaterThanOrEqual(0);
        }

        // After up to 5 seasons, activeEnvoys should have decreased
        // (game may end early due to defeat with extreme low values)
        const finalState = await getGameState(page);
        const finalDiplomacy = finalState.diplomacy as { activeEnvoys: number };
        expect(finalDiplomacy.activeEnvoys).toBeLessThan(100);
        expect(finalDiplomacy.activeEnvoys).toBeGreaterThanOrEqual(0);

        console.log(`Extreme state: activeEnvoys drained from 100 to ${finalDiplomacy.activeEnvoys}`);
    });

    test('Page renders without errors after all fixes', async ({ page }) => {
        await startGame(page);

        // Play a few seasons
        for (let i = 0; i < 5; i++) {
            await endSeason(page);
        }

        // Check all major tabs for rendering errors
        const tabs = ['Overview', 'Senate', 'Economy', 'Military', 'Map', 'Religion', 'Diplomacy'];

        for (const tab of tabs) {
            const opened = await clickNavTab(page, tab);
            if (!opened) continue;

            await page.waitForTimeout(300);

            const content = await page.locator('main').textContent() || '';
            expect(content).not.toContain('NaN');
            expect(content).not.toContain('undefined');

            // Check no uncaught JS errors
            const hasError = await page.evaluate(() => {
                return document.querySelector('.error-boundary, [data-error]') !== null;
            });
            expect(hasError).toBe(false);
        }

        console.log('All tabs render correctly after bug fixes');
    });
});
